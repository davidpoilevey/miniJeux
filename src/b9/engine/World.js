/**
 * World - Grille discrète toroïdale + environnement
 * Gère le potentiel écologique et les réserves consommables
 */

export class World {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    
    // Grille d'occupation (entityId ou null)
    this.grid = new Array(width * height).fill(null);
    
    // Potentiel écologique (stateless) - calculé à la demande
    // Gradient simple: plus fertile au centre
    this.potentialCache = null;
    
  this.chemicalCache = new Map();
  this.chemicalCacheValid = true;
  this.neighborsCache = new Map();
  this.cacheMaxSize = 10000; // Limite mémoire
    // Réserves consommables (sparse map)
    // Seulement les cellules modifiées sont stockées
    this.reserves = new Map(); // index -> valeur
    
    // Champs chimiques (4 molécules: A, B, C, D)
    this.chemicals = {
      A: new Float32Array(width * height),
      B: new Float32Array(width * height),
      C: new Float32Array(width * height),
      D: new Float32Array(width * height)
    };
    
    // Paramètres environnementaux
    this.regenerationRate = 0.01; // 1% du potentiel par tick
    this.maxReserve = 100;
    
    // Paramètres chimiques
    this.chemicalDiffusionRate = 0.1; // Taux de diffusion
    this.chemicalDegradationRate = 0.1; // Taux de dégradation
    
    // Cycle jour/nuit
    this.dayNightCycle = {
      duration: 3000, // 30 secondes en ms
      currentTime: 0,
      isDay: true
    };
  }

  /**
   * Convertit coordonnées x,y en index
   * @private
   */
  _toIndex(x, y) {
    return y * this.width + x;
  }

  /**
   * Normalise les coordonnées (toroïdal)
   */
  wrap(x, y) {
    const wx = ((x % this.width) + this.width) % this.width;
    const wy = ((y % this.height) + this.height) % this.height;
    return { x: wx, y: wy };
  }

  /**
   * Calcule le potentiel écologique d'une position
   * Gradient radial: fertile au centre, pauvre aux bords
   */
  getPotential(x, y) {
    const { x: wx, y: wy } = this.wrap(x, y);
    
    // Distance au centre normalisée
    const cx = this.width / 2;
    const cy = this.height / 2;
    const dx = wx - cx;
    const dy = wy - cy;
    const maxDist = Math.sqrt(cx * cx + cy * cy);
    const dist = Math.sqrt(dx * dx + dy * dy);
    const normalizedDist = dist / maxDist;
    
    // Potentiel inversement proportionnel à la distance
    // Centre = 100, bords = 20
    const potential = 100 - (80 * normalizedDist);
    
    return potential;
  }

  /**
   * Récupère la réserve disponible à une position
   */
  getReserve(x, y) {
    const { x: wx, y: wy } = this.wrap(x, y);
    const index = this._toIndex(wx, wy);
    
    // Si jamais modifié, retourner le potentiel
    if (!this.reserves.has(index)) {
      return this.getPotential(wx, wy);
    }
    
    return this.reserves.get(index);
  }

  /**
   * Consomme des ressources à une position
   * @returns {number} - Quantité réellement consommée
   */
  consumeReserve(x, y, amount) {
    const { x: wx, y: wy } = this.wrap(x, y);
    const index = this._toIndex(wx, wy);
    
    const current = this.getReserve(wx, wy);
    const consumed = Math.min(current, amount);
    const newReserve = Math.max(0, current - consumed);
    
    this.reserves.set(index, newReserve);
    
    return consumed;
  }

  /**
   * Régénère les réserves vers leur potentiel
   */
  regenerateReserves() {
    // Régénération paresseuse: uniquement les cellules modifiées
    for (const [index, currentReserve] of this.reserves.entries()) {
      const x = index % this.width;
      const y = Math.floor(index / this.width);
      const potential = this.getPotential(x, y);
      
      // Régénération exponentielle vers le potentiel
      const diff = potential - currentReserve;
      const newReserve = currentReserve + (diff * this.regenerationRate);
      
      // Si proche du potentiel, retirer de la map sparse
      if (Math.abs(newReserve - potential) < 0.1) {
        this.reserves.delete(index);
      } else {
        this.reserves.set(index, Math.min(this.maxReserve, newReserve));
      }
    }
  }

  /**
   * Place une entité sur la grille
   */
  setEntity(x, y, entityId) {
    const { x: wx, y: wy } = this.wrap(x, y);
    const index = this._toIndex(wx, wy);
    this.grid[index] = entityId;
     this._invalidateNeighborsCache(x, y);
  }

  /**
   * Retire une entité de la grille
   */
  removeEntity(x, y) {
    const { x: wx, y: wy } = this.wrap(x, y);
    const index = this._toIndex(wx, wy);
    this.grid[index] = null;
     this._invalidateNeighborsCache(x, y);
  }

_invalidateNeighborsCache(x, y) {
  // Invalider centre + 8 voisins
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const pos = this.wrap(x + dx, y + dy);
      const key = `${pos.x},${pos.y}`;
      this.neighborsCache.delete(key);
    }
  }
}
  /**
   * Récupère l'entité à une position
   */
  getEntity(x, y) {
    const { x: wx, y: wy } = this.wrap(x, y);
    const index = this._toIndex(wx, wy);
    return this.grid[index];
  }

  /**
   * Vérifie si une position est libre
   */
  isFree(x, y) {
    return this.getEntity(x, y) === null;
  }

  /**
   * Récupère les voisins (8 directions)
   */
  getNeighbors(x, y) {
    const key = `${x},${y}`;
  
  // Utiliser cache si disponible
  if (this.neighborsCache.has(key)) {
    return this.neighborsCache.get(key);
  }
  
    const neighbors = [];
    
    const offsets = [
      [-1, -1], [0, -1], [1, -1],
      [-1,  0],          [1,  0],
      [-1,  1], [0,  1], [1,  1]
    ];
    
    for (const [dx, dy] of offsets) {
      const pos = this.wrap(x + dx, y + dy);
      neighbors.push({
        x: pos.x,
        y: pos.y,
        entity: this.getEntity(pos.x, pos.y)
      });
    }
    
  // Stocker dans cache (LRU simple)
  if (this.neighborsCache.size >= this.cacheMaxSize) {
    const firstKey = this.neighborsCache.keys().next().value;
    this.neighborsCache.delete(firstKey);
  }
  this.neighborsCache.set(key, neighbors);
  
    return neighbors;
  }

  /**
   * Met à jour le cycle jour/nuit
   * @param {number} deltaTime - Temps écoulé en ms
   */
  updateDayNight(deltaTime) {
    this.dayNightCycle.currentTime += deltaTime;
    
    if (this.dayNightCycle.currentTime >= this.dayNightCycle.duration) {
      this.dayNightCycle.currentTime = 0;
      this.dayNightCycle.isDay = !this.dayNightCycle.isDay;
    }
  }

  /**
   * Retourne le ratio jour/nuit (0.0 = nuit, 1.0 = jour)
   */
  getDayNightRatio() {
    const t = this.dayNightCycle.currentTime / this.dayNightCycle.duration;
    
    // Transition sinusoïdale pour un changement doux
    if (this.dayNightCycle.isDay) {
      return 0.5 + 0.5 * Math.sin(Math.PI * t);
    } else {
      return 0.5 - 0.5 * Math.sin(Math.PI * t);
    }
  }

  /**
   * Émet une molécule chimique à une position
   */
  emitChemical(x, y, molecule, amount) {
    const { x: wx, y: wy } = this.wrap(x, y);
    const index = this._toIndex(wx, wy);
    
    if (this.chemicals[molecule]) {
      this.chemicals[molecule][index] += amount;
    }
  }

  /**
   * Récupère la concentration d'une molécule à une position
   */

getChemicalConcentration(x, y, molecule) {
  const cacheKey = `${x},${y},${molecule}`;
  
  if (this.chemicalCacheValid && this.chemicalCache.has(cacheKey)) {
    return this.chemicalCache.get(cacheKey);
  }
  
  const { x: wx, y: wy } = this.wrap(x, y);
  const index = this._toIndex(wx, wy);
  const concentration = this.chemicals[molecule] ? this.chemicals[molecule][index] : 0;
  
  this.chemicalCache.set(cacheKey, concentration);
  return concentration;
}

getChemicalGradient(x, y, molecule, radius) {
  const cacheKey = `grad_${x},${y},${molecule},${radius}`;
  
  if (this.chemicalCacheValid && this.chemicalCache.has(cacheKey)) {
    return this.chemicalCache.get(cacheKey);
  }
  
  let sumX = 0;
  let sumY = 0;
  let sumConcentration = 0;
  let count = 0;

  // OPTIMISATION: Sampling au lieu de tout scanner
  // Au lieu de radius×radius, on sample 8 directions + centre
  const samples = [
    [0, 0],           // Centre
    [radius, 0],      // Droite
    [-radius, 0],     // Gauche
    [0, radius],      // Bas
    [0, -radius],     // Haut
    [radius, radius], // Diag BR
    [-radius, -radius], // Diag TL
    [radius, -radius],  // Diag TR
    [-radius, radius]   // Diag BL
  ];

  for (const [dx, dy] of samples) {
    const pos = this.wrap(x + dx, y + dy);
    const concentration = this.getChemicalConcentration(pos.x, pos.y, molecule);
    
    if (concentration > 0.01) {
      sumX += dx * concentration;
      sumY += dy * concentration;
      sumConcentration += concentration;
      count++;
    }
  }

  let result;
  if (count === 0) {
    result = { dx: 0, dy: 0, strength: 0 };
  } else {
    const magnitude = Math.sqrt(sumX * sumX + sumY * sumY);
    if (magnitude > 0) {
      result = {
        dx: sumX / magnitude,
        dy: sumY / magnitude,
        strength: sumConcentration / count
      };
    } else {
      result = { dx: 0, dy: 0, strength: 0 };
    }
  }

  this.chemicalCache.set(cacheKey, result);
  return result;
}

  /**
   * Diffuse les molécules chimiques (tous les N ticks)
   */
  diffuseChemicals() {
    const molecules = ['A', 'B', 'C', 'D'];
    
  this.chemicalCacheValid = false;
  this.chemicalCache.clear();
    for (const molecule of molecules) {
      const current = this.chemicals[molecule];
      const next = new Float32Array(this.width * this.height);
      
      // Diffusion simple (moyenne des voisins)
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          const index = this._toIndex(x, y);
          let sum = current[index] * (1.0 - this.chemicalDiffusionRate);
          let neighbors = 0;
          
          // 4 voisins (von Neumann)
          const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
          for (const [dx, dy] of dirs) {
            const pos = this.wrap(x + dx, y + dy);
            const nIndex = this._toIndex(pos.x, pos.y);
            sum += current[nIndex] * (this.chemicalDiffusionRate / 4);
            neighbors++;
          }
          
          // Dégradation
          next[index] = sum * (1.0 - this.chemicalDegradationRate);
          
          // Seuil minimal pour éviter les valeurs fantômes
          if (next[index] < 0.001) {
            next[index] = 0;
          }
        }
      }
      
      this.chemicals[molecule] = next;
    }
  this.chemicalCacheValid = true;
  }

  /**
   * Récupère la molécule dominante à une position
   * Retourne { molecule: 'A'|'B'|'C'|'D', concentration: number }
   */
  getDominantChemical(x, y) {
    const { x: wx, y: wy } = this.wrap(x, y);
    const index = this._toIndex(wx, wy);
    
    let maxMolecule = null;
    let maxConcentration = 0;
    
    for (const molecule of ['A', 'B', 'C', 'D']) {
      const concentration = this.chemicals[molecule][index];
      if (concentration > maxConcentration) {
        maxConcentration = concentration;
        maxMolecule = molecule;
      }
    }
    
    return maxConcentration > 0.1 ? { molecule: maxMolecule, concentration: maxConcentration } : null;
  }

  /**
   * Réinitialise le monde
   */
  reset() {
    this.grid.fill(null);
    this.reserves.clear();
    this.dayNightCycle.currentTime = 0;
    this.dayNightCycle.isDay = true;
    
    // Reset champs chimiques
    for (const molecule of ['A', 'B', 'C', 'D']) {
      this.chemicals[molecule].fill(0);
    }
  }
}