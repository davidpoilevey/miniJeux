export class Ocean {
  constructor(width = 150, height = 150) {
    this.width = width;
    this.height = height;

    this.grid = new Array(width * height).fill(null);
    this.nutrients = new Float32Array(width * height);
    this.nutrientPotential = new Float32Array(width * height);
    this.oxygen = new Float32Array(width * height);
// Dans le constructeur Ocean :
this.lightGrid = new Float32Array(width * height);
    // SUBSTRATE — types : 0=eau 1=fond_marin 2=plage 3=rocher
    this.substrate = new Uint8Array(width * height);
    // Direction d'ancrage par cellule : {dx, dy} pointant "vers le haut" du substrat
    // Stocké à plat : anchorDir[i*2] = dx, anchorDir[i*2+1] = dy
    this.anchorDir = new Int8Array(width * height * 2);
this.crowdingCache = new Float32Array(width * height);
this._crowdingTick = 0;
this._crowdingInterval = 10;
this.thermalSurge = null
    this.dayNightCycle = 0;
    this.dayNightSpeed = 0.001;

    this._initBiomes();
    this._initSubstrate();   // après _initBiomes
    this._initNutrients();
    this._initOxygen();
  }

  // ============================================================
  // SUBSTRATE
  // ============================================================

  // Types exportés comme constantes statiques
  static SUBSTRATE_WATER  = 0;
  static SUBSTRATE_SEAFLOOR = 1;
  static SUBSTRATE_BEACH  = 2;
  static SUBSTRATE_ROCK   = 3;

  _initSubstrate() {
    const { width: W, height: H } = this;

    // --- Fond marin : bande basse (90%→100% en Y), toute la largeur
    const floorStart = Math.floor(H * 0.97);
    for (let y = floorStart; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        this.substrate[i] = Ocean.SUBSTRATE_SEAFLOOR;
        // Ancrage : vers le haut (-Y)
        this.anchorDir[i * 2]     = 0;
        this.anchorDir[i * 2 + 1] = -1;
      }
    }

    // --- Plage littoral : bande haute (0%→5% en Y), 25%→75% en X
    const beachEnd  = Math.floor(H * 0.05);
    const beachXMin = Math.floor(W * 0.25);
    const beachXMax = Math.floor(W * 0.75);
    for (let y = 0; y < beachEnd; y++) {
      for (let x = beachXMin; x < beachXMax; x++) {
        const i = y * W + x;
        this.substrate[i] = Ocean.SUBSTRATE_BEACH;
        // Ancrage : vers le bas (+Y) — dessous de la plage
        this.anchorDir[i * 2]     = 0;
        this.anchorDir[i * 2 + 1] = 1;
      }
    }

    // --- Rochers hydrothermaux : zone droite (50%→100% en X), (25%→75% en Y)
    this._generateRocks();
  }
  addInkCloud(x, y, radius, opacity) {
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      if (dx*dx + dy*dy > radius*radius) continue;
      const w = this.wrap(x+dx, y+dy);
      const falloff = 1 - Math.sqrt(dx*dx + dy*dy) / radius;
      // Réduit la lumière disponible dans la zone
      this.lightGrid[w.y * this.width + w.x] -= opacity * falloff * 0.5;
    }
  }
}
addBiolight(x, y, intensity) {
  const r = Math.ceil(intensity * 4); // Portée selon intensité
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      const d2 = dx*dx + dy*dy;
      if (d2 > r*r) continue;
      const w = this.wrap(x+dx, y+dy);
      const falloff = 1 - Math.sqrt(d2) / r; // Atténuation avec distance
      this.lightGrid[w.y * this.width + w.x] += intensity * falloff * 0.3;
    }
  }
}
  _generateRocks() {
    const { width: W, height: H } = this;

    const xMin = Math.floor(W * 0.52); // léger offset pour ne pas coller au bord du biome
    const xMax = W;
    const yMin = Math.floor(H * 0.25);
    const yMax = Math.floor(H * 0.75);

    // ~12 clusters de rochers, taille variable
    const clusterCount = 12;
    for (let c = 0; c < clusterCount; c++) {
      const cx = xMin + Math.floor(Math.random() * (xMax - xMin));
      const cy = yMin + Math.floor(Math.random() * (yMax - yMin));
      const radius = 2 + Math.floor(Math.random() * 5); // 2→6 cellules

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          // Forme organique : ellipse légèrement bruitée
          const dist = Math.sqrt(dx * dx * 0.8 + dy * dy) + Math.random() * 1.2;
          if (dist > radius) continue;

          const { x: wx, y: wy } = this.wrap(cx + dx, cy + dy);
          // Ne pas écraser fond marin ni plage
          const i = wy * W + wx;
          if (this.substrate[i] !== Ocean.SUBSTRATE_WATER) continue;

          this.substrate[i] = Ocean.SUBSTRATE_ROCK;
          // Ancrage : normal approximatif = direction depuis centre du cluster
          const nx = dx === 0 ? 0 : (dx > 0 ? 1 : -1);
          const ny = dy === 0 ? 0 : (dy > 0 ? 1 : -1);
          this.anchorDir[i * 2]     = nx;
          this.anchorDir[i * 2 + 1] = ny;
        }
      }
    }
  }

  /**
   * Retourne le type de substrat en (x, y)
   */
  getSubstrate(x, y) {
    const { x: wx, y: wy } = this.wrap(x, y);
    return this.substrate[wy * this.width + wx];
  }

  /**
   * Retourne true si la cellule est du substrat solide (non-eau)
   */
  isSubstrate(x, y) {
    return this.getSubstrate(x, y) !== Ocean.SUBSTRATE_WATER;
  }

  /**
   * Direction d'ancrage en (x, y) : {dx, dy} vers "l'extérieur" du substrat
   * Utile pour orienter un organisme ancré (il pousse dans cette direction)
   */
  getAnchorDirection(x, y) {
    const { x: wx, y: wy } = this.wrap(x, y);
    const i = (wy * this.width + wx) * 2;
    return { dx: this.anchorDir[i], dy: this.anchorDir[i + 1] };
  }

  /**
   * Retourne les cellules de substrat voisines libres d'entité
   * → spawn point pour les ancrés
   */
  getAnchorSpawnPoints(x, y) {
    return this.getNeighbors(x, y).filter(n =>
      this.isSubstrate(n.x, n.y) && n.entity === null
    );
  }

  // ============================================================
  // BIOMES
  // ============================================================

  getBiome(x, y) {
    const relX = x / this.width;
    const relY = y / this.height;
    if (relY < 0.25) return 'littoral';
    if (relY > 0.75) return 'abyssal';
    if (relX < 0.5)  return 'pelagic';
    return 'hydrothermal';
  }

  getBiomeProperties(biome) {
    return {
      littoral: {
        lightMultiplier: 2.0,
        nutrientRegen: 0.08,
        oxygenRegen: 0.1,
        temperature: 1.0,
        currentStrength: 0.5,
        color: '#3876b8'
      },
      pelagic: {
        lightMultiplier: 0.8,
        nutrientRegen: 0.04,
        oxygenRegen: 0.06,
        temperature: 0.6,
        currentStrength: 1,
        color: '#153970'
      },
      hydrothermal: {
        lightMultiplier: 0.0,
        nutrientRegen: 0.06,
        oxygenRegen: -0.02,
        temperature: 2.0,
        currentStrength: 0.2,
        color: '#5b2c0f'
      },
      abyssal: {
        lightMultiplier: 0.0,
        nutrientRegen: 0.1,
        oxygenRegen: 0.0,
        temperature: 0.1,
        currentStrength: 0.1,
        color: '#050510'
      }
    }[biome];
  }

  // ============================================================
  // LUMIÈRE
  // ============================================================

getLightAt(x, y) {
  const { x: wx, y: wy } = this.wrap(x, y);
  const biome = this.getBiome(wx, wy);
  const props = this.getBiomeProperties(biome);
  const dayNightRatio = this.getDayNightRatio();
  const depthFactor = 1.0 - (wy / this.height) * 0.9;
  const crowding = this.crowdingCache[wy * this.width + wx];
  // Dans getLightAt, ajouter la contribution biolight :
const biolight = this.lightGrid[wy * this.width + wx];
return Math.max(0, dayNightRatio * props.lightMultiplier * depthFactor * (1 - crowding * 0.8) + biolight);
}


// ── Nouvelle méthode : ───────────────────────────────────────────────────────
_updateCrowdingCache() {
  // Step=2 : on calcule 1 case sur 4, on interpole les autres
  // Radius=2 : 24 voisins max
  const step = 2;
  const radius = 2;
  const maxNeighbors = (radius * 2 + 1) ** 2 - 1; // 24

  for (let y = 0; y < this.height; y += step) {
    for (let x = 0; x < this.width; x += step) {
      let occupied = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          if (dx === 0 && dy === 0) continue;
          const w = this.wrap(x + dx, y + dy);
          if (this.grid[w.y * this.width + w.x] !== null) occupied++;
        }
      }
      const crowding = occupied / maxNeighbors;
      // Remplir le bloc step×step avec la même valeur (interpolation nearest)
      for (let by = 0; by < step && y + by < this.height; by++) {
        for (let bx = 0; bx < step && x + bx < this.width; bx++) {
          this.crowdingCache[(y + by) * this.width + (x + bx)] = crowding;
        }
      }
    }
  }
}


  getDayNightRatio() {
    return (Math.sin(this.dayNightCycle * Math.PI * 2) + 1) / 2;
  }

  // ============================================================
  // NUTRIENTS
  // ============================================================

  getNutrients(x, y) {
    const { x: wx, y: wy } = this.wrap(x, y);
    return this.nutrients[wy * this.width + wx];
  }

  addNutrients(x, y, amount) {
    const { x: wx, y: wy } = this.wrap(x, y);
    const index = wy * this.width + wx;
    this.nutrients[index] = Math.min(
      this.nutrientPotential[index],
      this.nutrients[index] + amount
    );
  }

  consumeNutrients(x, y, amount) {
    const { x: wx, y: wy } = this.wrap(x, y);
    const index = wy * this.width + wx;
    const available = this.nutrients[index];
    const consumed = Math.min(available, amount);
    this.nutrients[index] -= consumed;
    return consumed;
  }

  // ============================================================
  // OXYGEN
  // ============================================================

  getOxygen(x, y) {
    const { x: wx, y: wy } = this.wrap(x, y);
    return this.oxygen[wy * this.width + wx];
  }

  addOxygen(x, y, amount) {
    const { x: wx, y: wy } = this.wrap(x, y);
    const index = wy * this.width + wx;
    this.oxygen[index] = Math.min(1.0, this.oxygen[index] + amount);
  }

  consumeOxygen(x, y, amount) {
    const { x: wx, y: wy } = this.wrap(x, y);
    const index = wy * this.width + wx;
    const available = this.oxygen[index];
    const consumed = Math.min(available, amount);
    this.oxygen[index] -= consumed;
    return consumed;
  }

  getHeat(x, y) {
    const { x: wx, y: wy } = this.wrap(x, y);
    const biome = this.getBiome(wx, wy);
    const props = this.getBiomeProperties(biome);
    return props.temperature / 3.0;
  }

  // ============================================================
  // UPDATE
  // ============================================================

  update(deltaTime) {
    this.dayNightCycle += this.dayNightSpeed;
    if (this.dayNightCycle >= 1.0) this.dayNightCycle -= 1.0;

// ── Dans update(), ajouter AVANT la boucle de régénération : ─────────────────
this._crowdingTick++;
if (this._crowdingTick >= this._crowdingInterval) {
  this._crowdingTick = 0;
  this._updateCrowdingCache();
}
this.lightGrid.fill(0);
// Dans update() :
if (this.thermalSurge) {
  this.thermalSurge.ticksLeft--;
  if (this.thermalSurge.ticksLeft <= 0) this.thermalSurge = null;
}
// Déclenchement aléatoire
if (!this.thermalSurge && Math.random() < 0.005) {
  this._triggerThermalEvent();
}

    const step = 4;
    for (let y = 0; y < this.height; y += step) {
      for (let x = 0; x < this.width; x += step) {
        // Pas de régénération dans le substrat solide
        if (this.isSubstrate(x, y)) continue;

        const index = y * this.width + x;
        const biome = this.getBiome(x, y);
        const props = this.getBiomeProperties(biome);

        const deficit = this.nutrientPotential[index] - this.nutrients[index];
        if (deficit > 0) this.nutrients[index] += props.nutrientRegen * step;

        const light = this.getLightAt(x, y);
        const oxygenDelta = props.oxygenRegen + light * 0.05;
        this.oxygen[index] = Math.max(0, Math.min(1.0,
          this.oxygen[index] + oxygenDelta * step
        ));
      }
    }

    if (Math.floor(this.dayNightCycle * 1000) % 10 === 0) {
      this._diffuseNutrients();
    }
  }

  // ============================================================
  // INIT
  // ============================================================

  _initBiomes() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const index = y * this.width + x;
        const biome = this.getBiome(x, y);
        const props = this.getBiomeProperties(biome);
        this.nutrientPotential[index] = props.nutrientRegen * 500;
      }
    }
  }

  _initNutrients() {
    for (let i = 0; i < this.nutrients.length; i++) {
      this.nutrients[i] = this.nutrientPotential[i] * 0.5;
    }
  }

  _initOxygen() {
    const baseOxygen = { littoral: 0.9, pelagic: 0.6, hydrothermal: 0.2, abyssal: 0.1 };
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const index = y * this.width + x;
        const biome = this.getBiome(x, y);
        this.oxygen[index] = baseOxygen[biome] || 0.5;
      }
    }
  }
_diffuseNutrients() {
  const step = 8;
  const temp = new Float32Array(this.nutrients);
  
  for (let y = 0; y < this.height; y += step) {
    for (let x = 0; x < this.width; x += step) {
      if (this.isSubstrate(x, y)) continue;
      const index = y * this.width + x;
      
      const n = this.wrap(x, y - step);
      const s = this.wrap(x, y + step);
      const e = this.wrap(x + step, y);
      const w = this.wrap(x - step, y);

      // Diffusion latérale faible, gravité vers le bas forte
      const avg = (
        temp[n.y * this.width + n.x] * 0.1 +  // Haut : peu
        temp[s.y * this.width + s.x] * 0.5 +  // Bas : gravité
        temp[e.y * this.width + e.x] * 0.2 +  // Latéral
        temp[w.y * this.width + w.x] * 0.2    // Latéral
      );  // Pas de /4 — pondération asymétrique intentionnelle

      this.nutrients[index] += (avg - temp[index]) * 0.15;
    }
  }
}
_triggerThermalEvent() {
  // Choisir un point dans la zone hydrothermale
  const x = Math.floor(this.width * 0.5 + Math.random() * this.width * 0.5);
  const y = Math.floor(this.height * 0.25 + Math.random() * this.height * 0.5);
  const ticksLeft = 100 + Math.floor(Math.random() * 200);
  this.thermalSurge = {
    x, y,
    radius: 10 + Math.floor(Math.random() * 15), // 10-25 cases
    intensity: 0.5 + Math.random() * 0.5,         // 0.5-1.0
    ticksLeft // 100-300 ticks
,  ticksMax: ticksLeft 
  };
}

getThermalDamage(x, y) {
  if (!this.thermalSurge) return 0;
  const dx = x - this.thermalSurge.x;
  const dy = y - this.thermalSurge.y;
  const d2 = dx*dx + dy*dy;
  if (d2 > this.thermalSurge.radius ** 2) return 0;
  const falloff = 1 - Math.sqrt(d2) / this.thermalSurge.radius;
  return this.thermalSurge.intensity * falloff;
}
  // ============================================================
  // UTILITAIRES
  // ============================================================

  wrap(x, y) {
    return {
      x: ((x % this.width)  + this.width)  % this.width,
      y: ((y % this.height) + this.height) % this.height
    };
  }

  getEntity(x, y) {
    const { x: wx, y: wy } = this.wrap(x, y);
    return this.grid[wy * this.width + wx];
  }

  setEntity(x, y, entityId) {
    const { x: wx, y: wy } = this.wrap(x, y);
    this.grid[wy * this.width + wx] = entityId;
  }

  removeEntity(x, y) {
    const { x: wx, y: wy } = this.wrap(x, y);
    this.grid[wy * this.width + wx] = null;
  }

  /**
   * Libre = pas d'entité ET pas de substrat solide
   */
  isFree(x, y) {
    const { x: wx, y: wy } = this.wrap(x, y);
    const i = wy * this.width + wx;
    return this.grid[i] === null && this.substrate[i] === Ocean.SUBSTRATE_WATER;
  }

  /**
   * Libre pour un ancré = pas d'entité, mais DOIT être substrat
   */
  isFreeForAnchored(x, y) {
    const { x: wx, y: wy } = this.wrap(x, y);
    const i = wy * this.width + wx;
    return this.grid[i] === null && this.substrate[i] !== Ocean.SUBSTRATE_WATER;
  }

  getNeighbors(x, y) {
    const dirs = [
      [-1,-1],[0,-1],[1,-1],
      [-1, 0],       [1, 0],
      [-1, 1],[0, 1],[1, 1]
    ];
    return dirs.map(([dx, dy]) => {
      const pos = this.wrap(x + dx, y + dy);
      return { x: pos.x, y: pos.y, entity: this.getEntity(pos.x, pos.y) };
    });
  }

  getWorldState() {
    return {
      width: this.width,
      height: this.height,
      dayNightRatio: this.getDayNightRatio()
    };
  }

  reset() {
    this.grid.fill(null);
    this.substrate.fill(0);
    this.anchorDir.fill(0);
    this._initBiomes();
    this._initSubstrate();
    this._initNutrients();
    this._initOxygen();
  }
}