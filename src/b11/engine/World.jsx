export class World {
  constructor(width = 150, height = 150) {
    this.width  = width;
    this.height = height;

    this.grid            = new Array(width * height).fill(null);
    this.nutrients       = new Float32Array(width * height);
    this.nutrientPotential = new Float32Array(width * height);
    this.oxygen          = new Float32Array(width * height);
    this.lightGrid       = new Float32Array(width * height);

    // SUBSTRATE — types définis en statics ci-dessous
    this.substrate = new Uint8Array(width * height);
    // Direction d'ancrage : anchorDir[i*2]=dx, anchorDir[i*2+1]=dy
    this.anchorDir = new Int8Array(width * height * 2);

    this.crowdingCache    = new Float32Array(width * height);
    this._crowdingTick    = 0;
    this._crowdingInterval = 10;

    this.thermalSurge  = null;
    this.dayNightCycle = 0;
    this.dayNightSpeed = 0.001;

    this._initBiomes();
    this._initSubstrate();   // après _initBiomes
    this._initNutrients();
    this._initOxygen();

    this.inkClouds = [];     // [{x, y, radius, ttl}]
  }

  // ══════════════════════════════════════════════════════════════
  // SUBSTRATS
  // ══════════════════════════════════════════════════════════════

  static SUBSTRATE_WATER    = 0;   // milieu aquatique libre
  static SUBSTRATE_SEAFLOOR = 1;   // fond marin (solide, ancrage)
  static SUBSTRATE_GROUND   = 2;   // sol terrestre (surface praticable)
  static SUBSTRATE_ROCK     = 3;   // rocher (solide, ancrage)
  static SUBSTRATE_AIR      = 4;   // air libre (praticable pour volants)

  _initSubstrate() {
    const { width: W, height: H } = this;

    // Tout est WATER par défaut (rempli par le constructeur via Uint8Array)

    // ── Zones aériennes : bande haute [0 → 5%)
    const airEnd = Math.floor(H * 0.05);
    for (let y = 0; y < airEnd; y++) {
      for (let x = 0; x < W; x++) {
        this.substrate[y * W + x] = World.SUBSTRATE_AIR;
      }
    }

    // ── Sol terrestre : bande [5% → 15%)
    const groundStart = airEnd;
    const groundEnd   = Math.floor(H * 0.15);
    for (let y = groundStart; y < groundEnd; y++) {
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        this.substrate[i] = World.SUBSTRATE_GROUND;
        // Ancrage vers le bas (organismes poussent vers le haut depuis le sol)
        this.anchorDir[i * 2]     = 0;
        this.anchorDir[i * 2 + 1] = -1;
      }
    }

    // ── Fond marin : bande basse [97% → 100%)
    const floorStart = Math.floor(H * 0.97);
    for (let y = floorStart; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        this.substrate[i] = World.SUBSTRATE_SEAFLOOR;
        this.anchorDir[i * 2]     = 0;
        this.anchorDir[i * 2 + 1] = -1;
      }
    }

    // ── Rochers hydrothermaux dans la zone profonde
    this._generateRocks();
  }

  _generateRocks() {
    const { width: W, height: H } = this;

    // Zone profonde (80% → 97%) — vents hydrothermaux
    const xMin = 0;
    const xMax = W;
    const yMin = Math.floor(H * 0.82);
    const yMax = Math.floor(H * 0.96);

    const clusterCount = 12;
    for (let c = 0; c < clusterCount; c++) {
      const cx = xMin + Math.floor(Math.random() * (xMax - xMin));
      const cy = yMin + Math.floor(Math.random() * (yMax - yMin));
      const radius = 2 + Math.floor(Math.random() * 5);

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const dist = Math.sqrt(dx * dx * 0.8 + dy * dy) + Math.random() * 1.2;
          if (dist > radius) continue;

          const { x: wx, y: wy } = this.wrap(cx + dx, cy + dy);
          const i = wy * W + wx;
          if (this.substrate[i] !== World.SUBSTRATE_WATER) continue;

          this.substrate[i] = World.SUBSTRATE_ROCK;
          const nx = dx === 0 ? 0 : (dx > 0 ? 1 : -1);
          const ny = dy === 0 ? 0 : (dy > 0 ? 1 : -1);
          this.anchorDir[i * 2]     = nx;
          this.anchorDir[i * 2 + 1] = ny;
        }
      }
    }
  }

  getSubstrate(x, y) {
    const { x: wx, y: wy } = this.wrap(x, y);
    return this.substrate[wy * this.width + wx];
  }

  /**
   * Solide = SEAFLOOR ou ROCK. Le sol (GROUND) est praticable.
   */
  isSolid(x, y) {
    const s = this.getSubstrate(x, y);
    return s === World.SUBSTRATE_SEAFLOOR || s === World.SUBSTRATE_ROCK;
  }

  /** Alias pour rétrocompatibilité */
  isSubstrate(x, y) { return this.isSolid(x, y); }

  getAnchorDirection(x, y) {
    const { x: wx, y: wy } = this.wrap(x, y);
    const i = (wy * this.width + wx) * 2;
    return { dx: this.anchorDir[i], dy: this.anchorDir[i + 1] };
  }

  getAnchorSpawnPoints(x, y) {
    return this.getNeighbors(x, y).filter(n => {
      const s = this.getSubstrate(n.x, n.y);
      return (
        s === World.SUBSTRATE_SEAFLOOR ||
        s === World.SUBSTRATE_ROCK     ||
        s === World.SUBSTRATE_GROUND
      ) && n.entity === null;
    });
  }

  // ══════════════════════════════════════════════════════════════
  // BIOMES — 4 zones
  // ══════════════════════════════════════════════════════════════
  //
  //  Y = 0   ┌────────────────────────────┐  aerial  (ciel)
  //  Y = 5%  ├────────────────────────────┤  ground  (sol terrestre, Lung requis)
  //  Y = 15% ├────────────────────────────┤  marine  (pélagique + côtes)
  //  Y = 80% ├────────────────────────────┤  deep    (abysse + hydrothermal)
  //  Y = 100%└────────────────────────────┘

  getBiome(_x, y) {
    const relY = y / this.height;
    if (relY < 0.05) return 'aerial';
    if (relY < 0.15) return 'ground';
    if (relY < 0.80) return 'marine';
    return 'deep';
  }

  getBiomeProperties(biome) {
    return {
      // Ciel — plein soleil, vent fort, particules organiques en suspension (pollen, spores)
      aerial: {
        lightMultiplier:  3.0,
        nutrientRegen:    0.06,
        oxygenRegen:      0.15,
        temperature:      0.8,
        currentStrength:  0.8,
        color:            '#87ceeb',
        medium:           'air',
      },
      // Sol — lumière abondante, sol fertile, peu de courant
      ground: {
        lightMultiplier:  2.5,
        nutrientRegen:    0.12,
        oxygenRegen:      0.10,
        temperature:      1.0,
        currentStrength:  0.1,
        color:            '#8b7355',
        medium:           'ground',
      },
      // Pélagique/côtier — eau oxygénée, courants, lumière variable
      marine: {
        lightMultiplier:  1.2,
        nutrientRegen:    0.06,
        oxygenRegen:      0.07,
        temperature:      0.7,
        currentStrength:  0.8,
        color:            '#1a5276',
        medium:           'water',
      },
      // Abyssal/hydrothermal — obscur, chaud, chimiosynthèse
      deep: {
        lightMultiplier:  0.0,
        nutrientRegen:    0.08,
        oxygenRegen:     -0.01,
        temperature:      1.5,
        currentStrength:  0.3,
        color:            '#1a0808',
        medium:           'water',
      },
    }[biome];
  }

  // ══════════════════════════════════════════════════════════════
  // LUMIÈRE
  // ══════════════════════════════════════════════════════════════

  getLightAt(x, y) {
    const { x: wx, y: wy } = this.wrap(x, y);
    const biome        = this.getBiome(wx, wy);
    const props        = this.getBiomeProperties(biome);
    const dayNight     = this.getDayNightRatio();
    const depthFactor  = 1.0 - (wy / this.height) * 0.9;
    const crowding     = this.crowdingCache[wy * this.width + wx];
    const biolight     = this.lightGrid[wy * this.width + wx];
    return Math.max(0,
      dayNight * props.lightMultiplier * depthFactor * (1 - crowding * 0.8) + biolight
    );
  }

  getDayNightRatio() {
    return (Math.sin(this.dayNightCycle * Math.PI * 2) + 1) / 2;
  }

  addBiolight(x, y, intensity) {
    const r = Math.ceil(intensity * 4);
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const d2 = dx * dx + dy * dy;
        if (d2 > r * r) continue;
        const w = this.wrap(x + dx, y + dy);
        const falloff = 1 - Math.sqrt(d2) / r;
        this.lightGrid[w.y * this.width + w.x] += intensity * falloff * 0.3;
      }
    }
  }

  // ── Nuages d'encre ────────────────────────────────────────────────────────
  //
  // Relâchés par InkSac lors d'une attaque. Persistent via TTL (défaut 40 ticks).
  // isInInkCloud() sert à aveugler les prédateurs dans _predation.
  // Le rendu est assuré par WorldRenderer (drawInkClouds).

  // type : 'ink' (aveuglant), 'toxin' (visuel vert), 'electric' (flash bref)
  addInkCloud(x, y, radius, ttl = 40, type = 'ink') {
    this.inkClouds.push({ x, y, radius, ttl, type });
  }

  isInInkCloud(x, y) {
    for (const cloud of this.inkClouds) {
      if (cloud.type !== 'ink') continue;   // seul le type 'ink' aveugle les prédateurs
      const dx = cloud.x - x;
      const dy = cloud.y - y;
      if (dx * dx + dy * dy <= cloud.radius * cloud.radius) return true;
    }
    return false;
  }

  // ══════════════════════════════════════════════════════════════
  // NUTRIENTS
  // ══════════════════════════════════════════════════════════════

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
    const consumed = Math.min(this.nutrients[index], amount);
    this.nutrients[index] -= consumed;
    return consumed;
  }

  // ══════════════════════════════════════════════════════════════
  // OXYGÈNE
  // ══════════════════════════════════════════════════════════════

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
    const consumed = Math.min(this.oxygen[index], amount);
    this.oxygen[index] -= consumed;
    return consumed;
  }

  getHeat(x, y) {
    const { x: wx, y: wy } = this.wrap(x, y);
    return this.getBiomeProperties(this.getBiome(wx, wy)).temperature / 3.0;
  }

  // ══════════════════════════════════════════════════════════════
  // ÉVÉNEMENTS HYDROTHERMAUX
  // ══════════════════════════════════════════════════════════════

  _triggerThermalEvent() {
    // Zone profonde uniquement
    const x = Math.floor(Math.random() * this.width);
    const y = Math.floor(this.height * 0.80 + Math.random() * this.height * 0.17);
    const ticksLeft = 100 + Math.floor(Math.random() * 200);
    this.thermalSurge = {
      x, y,
      radius:    10 + Math.floor(Math.random() * 15),
      intensity: 0.5 + Math.random() * 0.5,
      ticksLeft,
      ticksMax:  ticksLeft,
    };
  }

  getThermalDamage(x, y) {
    if (!this.thermalSurge) return 0;
    const dx = x - this.thermalSurge.x;
    const dy = y - this.thermalSurge.y;
    const d2 = dx * dx + dy * dy;
    if (d2 > this.thermalSurge.radius ** 2) return 0;
    return this.thermalSurge.intensity * (1 - Math.sqrt(d2) / this.thermalSurge.radius);
  }

  // ══════════════════════════════════════════════════════════════
  // MISE À JOUR
  // ══════════════════════════════════════════════════════════════

  update(deltaTime) {
    this.dayNightCycle += this.dayNightSpeed;
    if (this.dayNightCycle >= 1.0) this.dayNightCycle -= 1.0;

    // Crowding
    this._crowdingTick++;
    if (this._crowdingTick >= this._crowdingInterval) {
      this._crowdingTick = 0;
      this._updateCrowdingCache();
    }

    // Reset biolight chaque tick
    this.lightGrid.fill(0);

    // Réduction TTL des nuages d'encre
    for (let i = this.inkClouds.length - 1; i >= 0; i--) {
      if (--this.inkClouds[i].ttl <= 0) this.inkClouds.splice(i, 1);
    }

    // Événements thermaux
    if (this.thermalSurge) {
      this.thermalSurge.ticksLeft--;
      if (this.thermalSurge.ticksLeft <= 0) this.thermalSurge = null;
    }
    if (!this.thermalSurge && Math.random() < 0.005) {
      this._triggerThermalEvent();
    }

    // Régénération nutriments et oxygène
    // Seuls SEAFLOOR et ROCK ne régénèrent pas (cellules solides inaccessibles)
    const step = 4;
    for (let y = 0; y < this.height; y += step) {
      for (let x = 0; x < this.width; x += step) {
        if (this.isSolid(x, y)) continue;

        const index = y * this.width + x;
        const biome  = this.getBiome(x, y);
        const props  = this.getBiomeProperties(biome);

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

  // ══════════════════════════════════════════════════════════════
  // INIT
  // ══════════════════════════════════════════════════════════════

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
    const baseOxygen = { aerial: 0.98, ground: 0.90, marine: 0.70, deep: 0.20 };
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const biome = this.getBiome(x, y);
        this.oxygen[y * this.width + x] = baseOxygen[biome];
      }
    }
  }

  _diffuseNutrients() {
    const step = 8;
    const temp = new Float32Array(this.nutrients);

    for (let y = 0; y < this.height; y += step) {
      for (let x = 0; x < this.width; x += step) {
        if (this.isSolid(x, y)) continue;
        const index = y * this.width + x;

        const n = this.wrap(x, y - step);
        const s = this.wrap(x, y + step);
        const e = this.wrap(x + step, y);
        const w = this.wrap(x - step, y);

        // Diffusion asymétrique : gravité vers le bas
        const avg = (
          temp[n.y * this.width + n.x] * 0.1 +
          temp[s.y * this.width + s.x] * 0.5 +
          temp[e.y * this.width + e.x] * 0.2 +
          temp[w.y * this.width + w.x] * 0.2
        );
        this.nutrients[index] += (avg - temp[index]) * 0.15;
      }
    }
  }

  _updateCrowdingCache() {
    const step        = 2;
    const radius      = 2;
    const maxNeighbors = (radius * 2 + 1) ** 2 - 1;

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
        for (let by = 0; by < step && y + by < this.height; by++) {
          for (let bx = 0; bx < step && x + bx < this.width; bx++) {
            this.crowdingCache[(y + by) * this.width + (x + bx)] = crowding;
          }
        }
      }
    }
  }

  // ══════════════════════════════════════════════════════════════
  // UTILITAIRES
  // ══════════════════════════════════════════════════════════════

  wrap(x, y) {
    return {
      x: ((x % this.width)  + this.width)  % this.width,
      y: ((y % this.height) + this.height) % this.height,
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
   * Praticable pour organismes mobiles = pas solide ET cellule vide
   * (valable eau, sol, air — les contraintes biome/organe s'appliquent en amont)
   */
  isFree(x, y) {
    const { x: wx, y: wy } = this.wrap(x, y);
    const i = wy * this.width + wx;
    return this.grid[i] === null && !this.isSolid(wx, wy);
  }

  /**
   * Praticable pour ancrés = cellule solide libre
   */
  isFreeForAnchored(x, y) {
    const { x: wx, y: wy } = this.wrap(x, y);
    const i = wy * this.width + wx;
    const s = this.substrate[i];
    return this.grid[i] === null && (
      s === World.SUBSTRATE_SEAFLOOR ||
      s === World.SUBSTRATE_ROCK     ||
      s === World.SUBSTRATE_GROUND
    );
  }

  getNeighbors(x, y) {
    const dirs = [
      [-1,-1],[0,-1],[1,-1],
      [-1, 0],       [1, 0],
      [-1, 1],[0, 1],[1, 1],
    ];
    return dirs.map(([dx, dy]) => {
      const pos = this.wrap(x + dx, y + dy);
      return { x: pos.x, y: pos.y, entity: this.getEntity(pos.x, pos.y) };
    });
  }

  getWorldState() {
    return {
      width:         this.width,
      height:        this.height,
      dayNightRatio: this.getDayNightRatio(),
    };
  }

  reset() {
    this.grid.fill(null);
    this.substrate.fill(0);
    this.anchorDir.fill(0);
    this.thermalSurge = null;
    this.inkClouds    = [];
    this._initBiomes();
    this._initSubstrate();
    this._initNutrients();
    this._initOxygen();
  }
}
