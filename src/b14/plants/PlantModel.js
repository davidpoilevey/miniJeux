// Structure d'une plante – objet sérialisable (sauvegardé sur PocketBase)

let _counter = 0;
export function makePlantId() {
  return `p_${Date.now()}_${++_counter}`;
}
export function makeFlowerId() {
  return `f_${Date.now()}_${++_counter}`;
}
export function makeFruitId() {
  return `fr_${Date.now()}_${++_counter}`;
}

export const CELL_TYPES = {
  RACINE:   'racine',
  TIGE:     'tige',
  BRANCHE:  'branche',
  FEUILLE:  'feuille',
  FLEUR:    'fleur',    // sur la grille : placeholder visuel, détail dans plant.flowers
  FRUIT:    'fruit',
  BOURGEON: 'bourgeon',
  BOIS:     'bois',     // tige morte laissée sur la grille
};

// Durée de vie d'une fleur (ticks) avant de devenir fruit
export const FLOWER_LIFESPAN = 25;
// Durée d'un fruit avant dissémination
export const FRUIT_LIFESPAN  = 15;
// Délai avant qu'une plante morte soit nettoyée
export const DEAD_CLEANUP_AGE = 50;

/**
 * Crée une nouvelle plante depuis une racine.
 * @param {number} x
 * @param {number} y
 * @param {Array}  adn  — génome brut (tableau de chromosomes)
 * @param {string|null} parentId
 * @param {number} parentLikes — likes du parent (avantage initial)
 */
export function createPlant(x, y, adn, parentId = null, parentLikes = 0) {
  return {
    id: makePlantId(),
    rootX: x,
    rootY: y,
    adn,                 // [[A,T,G,C], ...] — 400 chromosomes
    age: 0,
    energy: 2 + Math.min(4, parentLikes ), // les enfants de plantes likées démarrent avec plus d'énergie
    alive: true,
    parentId,
    likes: 0,            // likes totaux reçus par cette plante
    lastGrowthTick: 0,
    deadSinceTick: null,
    cells: [
      { x, y, type: CELL_TYPES.RACINE, age: 0 }
    ],
    flowers: [],         // [{ id, x, y, age, likes }]
    fruits:  [],         // [{ x, y, age, adnChild, parentLikes }]
  };
}
