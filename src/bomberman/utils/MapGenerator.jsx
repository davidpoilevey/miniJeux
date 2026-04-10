import { GRID_SIZE, CELL_TYPES, POWER_UP_TYPES } from '../config/levels';

/**
 * Génère la carte initiale du niveau
 * Pattern classique Bomberman: murs fixes en damier + blocs destructibles aléatoires
 */
export const generateMap = (levelConfig) => {
  const grid = [];
  
  // Initialiser la grille vide
  for (let y = 0; y < GRID_SIZE; y++) {
    grid[y] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      grid[y][x] = {
        type: CELL_TYPES.EMPTY,
        powerUp: null
      };
    }
  }
  
  // Placer les murs indestructibles (bordures + damier)
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      // Bordures
      if (x === 0 || y === 0 || x === GRID_SIZE - 1 || y === GRID_SIZE - 1) {
        grid[y][x].type = CELL_TYPES.WALL;
      }
      // Damier (murs fixes au milieu)
      else if (x % 2 === 0 && y % 2 === 0) {
        grid[y][x].type = CELL_TYPES.WALL;
      }
    }
  }
  
  // Zones de spawn protégées (joueur et ennemis ne doivent pas spawner avec des blocs)
  const protectedZones = [
    { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 2 },  // Joueur
    { x: GRID_SIZE - 2, y: 1 }, { x: GRID_SIZE - 3, y: 1 }, { x: GRID_SIZE - 2, y: 2 },  // Ennemi 1
    { x: 1, y: GRID_SIZE - 2 }, { x: 2, y: GRID_SIZE - 2 }, { x: 1, y: GRID_SIZE - 3 },  // Ennemi 2
    { x: GRID_SIZE - 2, y: GRID_SIZE - 2 }, { x: GRID_SIZE - 3, y: GRID_SIZE - 2 }, { x: GRID_SIZE - 2, y: GRID_SIZE - 3 }  // Ennemi 3
  ];
  
  const isProtected = (x, y) => {
    return protectedZones.some(zone => zone.x === x && zone.y === y);
  };
  
// Placer les blocs destructibles aléatoirement
const totalCells = GRID_SIZE * GRID_SIZE;
const wallCells = (GRID_SIZE * 4 - 4) + Math.floor((GRID_SIZE - 2) / 2) * Math.floor((GRID_SIZE - 2) / 2);
const availableCells = totalCells - wallCells - protectedZones.length;
const destructibleCount = Math.floor(availableCells * levelConfig.destructibleBlocksRatio);

let placed = 0;
const destructibleBlocks = [];

while (placed < destructibleCount) {
  const x = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
  const y = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
  
  if (grid[y][x].type === CELL_TYPES.EMPTY && !isProtected(x, y)) {
    grid[y][x].type = CELL_TYPES.DESTRUCTIBLE;
    destructibleBlocks.push({ x, y });
    
    if (Math.random() < levelConfig.powerUpChance) {
      grid[y][x].powerUp = getRandomPowerUp();
    }
    
    placed++;
  }
}

// Placer la sortie dans un bloc destructible aléatoire
if (destructibleBlocks.length > 0) {
  const blocksWithoutPowerUp = destructibleBlocks.filter(block => !grid[block.y][block.x].powerUp);
  const exitBlock = blocksWithoutPowerUp.length > 0 
    ? blocksWithoutPowerUp[Math.floor(Math.random() * blocksWithoutPowerUp.length)]
    : destructibleBlocks[Math.floor(Math.random() * destructibleBlocks.length)];
  
  grid[exitBlock.y][exitBlock.x].hasExit = true;
}

return grid;
};

/**
 * Retourne un power-up aléatoire avec des probabilités différentes
 */
const getRandomPowerUp = () => {
  const rand = Math.random();
  
  // Distribution des power-ups
  if (rand < 0.25) return POWER_UP_TYPES.FIRE_PLUS;      // 25%
  if (rand < 0.45) return POWER_UP_TYPES.BOMB_PLUS;      // 20%
  if (rand < 0.60) return POWER_UP_TYPES.SPEED_PLUS;     // 15%
  if (rand < 0.70) return POWER_UP_TYPES.LIFE_PLUS;      // 10%
  if (rand < 0.80) return POWER_UP_TYPES.DYNAMITE;       // 10%
  if (rand < 0.90) return POWER_UP_TYPES.C4;             // 10%
  return POWER_UP_TYPES.GRENADE;                         // 10%
};

/**
 * Retourne les positions de spawn des ennemis
 */
export const getEnemySpawnPositions = (enemyCount) => {
  const corners = [
    { x: GRID_SIZE - 2, y: 1 },                    // Haut droite
    { x: 1, y: GRID_SIZE - 2 },                    // Bas gauche
    { x: GRID_SIZE - 2, y: GRID_SIZE - 2 },        // Bas droite
    { x: GRID_SIZE - 2, y: Math.floor(GRID_SIZE / 2) },  // Milieu droite
    { x: 1, y: Math.floor(GRID_SIZE / 2) },        // Milieu gauche
    { x: Math.floor(GRID_SIZE / 2), y: 1 }         // Milieu haut
  ];
  
  return corners.slice(0, Math.min(enemyCount, corners.length));
};