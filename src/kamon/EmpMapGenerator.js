/**
 * Générateurs de formes de plateau
 */

import { generateRandomPile } from "./EmpileHooks";

// Hexagone classique
const generateHexagonShape = (radius) => {
  const hexes = [];
  for (let q = -radius; q <= radius; q++) {
    for (let r = -radius; r <= radius; r++) {
      const s = -q - r;
      if (Math.abs(s) <= radius) {
        hexes.push({ q, r, s });
      }
    }
  }
  return hexes;
};

// Rectangle hexagonal
const generateRectangleShape = (width, height) => {
  const hexes = [];
  const offsetQ = -Math.floor(width / 2);
  const offsetR = -Math.floor(height / 2);
  
  for (let q = 0; q < width; q++) {
    for (let r = 0; r < height; r++) {
      hexes.push({ 
        q: q + offsetQ, 
        r: r + offsetR, 
        s: -(q + offsetQ) - (r + offsetR) 
      });
    }
  }
  return hexes;
};

// Losange
const generateDiamondShape = (size) => {
  const hexes = [];
  for (let q = -size; q <= size; q++) {
    for (let r = Math.max(-size, -q - size); r <= Math.min(size, -q + size); r++) {
      hexes.push({ q, r, s: -q - r });
    }
  }
  return hexes;
};

// Triangle
const generateTriangleShape = (size) => {
  const hexes = [];
  for (let q = 0; q <= size; q++) {
    for (let r = 0; r <= size - q; r++) {
      hexes.push({ q, r, s: -q - r });
    }
  }
  return hexes;
};

// Forme en croix
const generateCrossShape = (armLength) => {
  const hexes = [];
  
  // Bras horizontal
  for (let q = -armLength; q <= armLength; q++) {
    hexes.push({ q, r: 0, s: -q });
  }
  
  // Bras vertical (sans le centre déjà ajouté)
  for (let r = -armLength; r <= armLength; r++) {
    if (r !== 0) {
      hexes.push({ q: 0, r, s: -r });
    }
  }
  
  // Bras diagonal
  for (let i = -armLength; i <= armLength; i++) {
    if (i !== 0) {
      hexes.push({ q: i, r: -i, s: 0 });
    }
  }
  
  return hexes;
};

// Anneau (hexagone avec trou au centre)
const generateRingShape = (outerRadius, innerRadius) => {
  const hexes = [];
  for (let q = -outerRadius; q <= outerRadius; q++) {
    for (let r = -outerRadius; r <= outerRadius; r++) {
      const s = -q - r;
      if (Math.abs(s) <= outerRadius) {
        // Exclure le centre
        if (Math.abs(q) > innerRadius || Math.abs(r) > innerRadius || Math.abs(s) > innerRadius) {
          hexes.push({ q, r, s });
        }
      }
    }
  }
  return hexes;
};

/**
 * Configuration des niveaux (1-70)
 */
export const LEVEL_CONFIGS = [
  // Niveaux 1-10 : Hexagone classique, 4 couleurs
  ...Array.from({ length: 5 }, (_, i) => ({
    level: i + 1,
    shape: generateHexagonShape(2),
    colorCount: 4,
    frozenChance: 0.1,
    counterChance: 0.1,
    initialPileChance: 0.2,
  })),
  
  // Niveaux 11-20 : Rectangle, 5 couleurs, introduction frozen
  ...Array.from({ length: 5 }, (_, i) => ({
    level: i + 6,
    shape: generateRectangleShape(5, 4),
    colorCount: 5,
    frozenChance: 0.15,
    counterChance: 0.15,
    initialPileChance: 0.3,
  })),
  
  // Niveaux 21-30 : Losange, 6 couleurs, frozen + counter
  ...Array.from({ length: 5 }, (_, i) => ({
    level: i + 11,
    shape: generateDiamondShape(2),
    colorCount: 6,
    frozenChance: 0.5,
    counterChance: 0.1,
    initialPileChance: 0.35,
  })),
  
  // Niveaux 31-40 : Triangle, 7 couleurs
  ...Array.from({ length: 5 }, (_, i) => ({
    level: i + 16,
    shape: generateTriangleShape(5),
    colorCount: 7,
    frozenChance: 0.15,
    counterChance: 0.3,
    initialPileChance: 0.3,
  })),
  
  // Niveaux 41-50 : Croix, 8 couleurs
  ...Array.from({ length: 5 }, (_, i) => ({
    level: i + 21,
    shape: generateCrossShape(2),
    colorCount: 8,
    frozenChance: 0.2,
    counterChance: 0.2,
    initialPileChance: 0.6,
  })),
  
  // Niveaux 51-60 : Anneau, 9 couleurs
  ...Array.from({ length: 5 }, (_, i) => ({
    level: i + 26,
    shape: generateRingShape(3, 1),
    colorCount: 9,
    frozenChance: 0.6,
    counterChance: 0.2,
    initialPileChance: 0.25,
  })),
  
  // Niveaux 61-70 : Mix de formes, 10 couleurs
  ...Array.from({ length: 5 }, (_, i) => {
    const shapes = [
      generateHexagonShape(3),
      generateRectangleShape(6, 4),
      generateDiamondShape(3),
      generateCrossShape(3),
    ];
    return {
      level: i + 31,
      shape: shapes[i % shapes.length],
      colorCount: 10,
      frozenChance: 0.4,
      counterChance: 0.4,
      initialPileChance: 0.4,
    };
  }),
];

/**
 * Récupère la configuration d'un niveau
 */
export const getLevelConfig = (level) => {
  const clampedLevel = Math.max(1, Math.min(35, level));
  return LEVEL_CONFIGS[clampedLevel - 1];
};

/**
 * Génère la grille pour un niveau donné
 */
export const generateGridForLevel = (level) => {
  const config = getLevelConfig(level);
  const g = new Map();
  
  config.shape.forEach(({ q, r, s }) => {
    const key = `${q},${r},${s}`;
    const hex = {
      q,
      r,
      s,
      key,
      pile: [],
      type: 'normal', // 'normal', 'frozen', 'counter'
      counter: 0,
    };
    
    // Décider si cette case a une pile initiale
    if (Math.random() < config.initialPileChance) {
      hex.pile = generateRandomPile({ 
        level
      });
      
      // Appliquer frozen sur certaines piles
      if (Math.random() < config.frozenChance) {
        hex.type = 'frozen';
      }
    } else {
      // Cases vides peuvent avoir un counter
      if (Math.random() < config.counterChance) {
        hex.type = 'counter';
        hex.counter = Math.floor(Math.random() * 3) + 2; // Counter entre 2 et 4
      }
    }
    
    g.set(key, hex);
  });
  
  return g;
};

/**
 * Gère les explosions (nb >= 10) et leurs effets
 * @returns {Map} Nouvelle grille + nombre de points gagnés
 */
export const handleExplosions = (grid) => {
  const g = new Map(grid);
  let changed = false;
  let pointsEarned = 0;
  const explodedPositions = new Set(); // Positions des explosions
  
  // 1. Détecter et nettoyer les explosions
  g.forEach((hex, hexKey) => {
    if (hex.pile.length === 0) return;
    
    const cleanedPile = hex.pile.filter(item => {
      if (item.nb >= 10) {
        pointsEarned += item.nb;
        explodedPositions.add(hexKey);
        return false;
      }
      return true;
    });
    
    if (cleanedPile.length !== hex.pile.length) {
      g.set(hexKey, { ...hex, pile: cleanedPile });
      changed = true;
    }
  });
  
  // 2. Gérer les effets des explosions sur les voisins
  explodedPositions.forEach(hexKey => {
    const hex = g.get(hexKey);
    if (!hex) return;
    
    const neighbors = [
      { q: hex.q + 1, r: hex.r, s: hex.s - 1 },
      { q: hex.q + 1, r: hex.r - 1, s: hex.s },
      { q: hex.q, r: hex.r - 1, s: hex.s + 1 },
      { q: hex.q - 1, r: hex.r, s: hex.s + 1 },
      { q: hex.q - 1, r: hex.r + 1, s: hex.s },
      { q: hex.q, r: hex.r + 1, s: hex.s - 1 },
    ];
    
    neighbors.forEach(n => {
      const nKey = `${n.q},${n.r},${n.s}`;
      const nHex = g.get(nKey);
      
      if (nHex) {
        // Dégeler les cases frozen adjacentes
        if (nHex.type === 'frozen') {
          g.set(nKey, { ...nHex, type: 'normal' });
          changed = true;
        }
        
        // Décrémenter les counters adjacents
        if (nHex.type === 'counter' && nHex.counter > 0) {
          const newCounter = nHex.counter - 1;
          if (newCounter <= 0) {
            // Counter atteint 0 : case remise a normal
            g.set(nKey, { ...nHex, pile: [], type: 'normal', counter: 0 });
            pointsEarned += 50; // Bonus pour destruction de counter
          } else {
            g.set(nKey, { ...nHex, counter: newCounter });
          }
          changed = true;
        }
      }
    });
  });
  // cleanSheet is true if there are no more piles left
  const cleanSheet = Array.from(g.values()).every(hex => hex.pile.length === 0);
  
  return { grid: g, changed, pointsEarned, cleanSheet };
};