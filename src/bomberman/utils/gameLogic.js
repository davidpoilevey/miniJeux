import { GRID_SIZE, CELL_TYPES } from '../config/levels';

/**
 * Vérifie si une position est valide (dans les limites et pas de mur)
 */
export const isValidPosition = (x, y, grid) => {
  if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) {
    return false;
  }
  
  const cellType = grid[y][x].type;
  return cellType === CELL_TYPES.EMPTY;
};

/**
 * Vérifie si une position contient une bombe
 */
export const hasBombAt = (x, y, bombs) => {
  return bombs.some(bomb => bomb.x === x && bomb.y === y);
};

/**
 * Vérifie si une position contient un ennemi
 */
export const hasEnemyAt = (x, y, enemies) => {
  return enemies.some(enemy => enemy.x === x && enemy.y === y && enemy.alive);
};

/**
 * Vérifie si le joueur peut se déplacer vers une position
 */
export const canPlayerMove = (x, y, grid, bombs, enemies) => {
  if (!isValidPosition(x, y, grid)) return false;
  if (hasBombAt(x, y, bombs)) return false;
  return true;
};

/**
 * Vérifie si un ennemi peut se déplacer vers une position
 */
export const canEnemyMove = (x, y, grid, bombs, enemies, currentEnemyId) => {
  if (!isValidPosition(x, y, grid)) return false;
  if (hasBombAt(x, y, bombs)) return false;
  
  // Vérifie qu'il n'y a pas d'autre ennemi à cette position
  const otherEnemyHere = enemies.some(
    enemy => enemy.id !== currentEnemyId && enemy.x === x && enemy.y === y && enemy.alive
  );
  if (otherEnemyHere) return false;
  
  return true;
};

/**
 * Calcule les cellules touchées par une explosion
 */
export const calculateExplosionCells = (bombX, bombY, fireRange, grid) => {
  const explosionCells = [{ x: bombX, y: bombY }]; // Centre de l'explosion
  
  const directions = [
    { dx: 0, dy: -1 },  // Haut
    { dx: 0, dy: 1 },   // Bas
    { dx: -1, dy: 0 },  // Gauche
    { dx: 1, dy: 0 }    // Droite
  ];
  
  directions.forEach(({ dx, dy }) => {
    for (let i = 1; i <= fireRange; i++) {
      const x = bombX + (dx * i);
      const y = bombY + (dy * i);
      
      // Hors limites
      if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) break;
      
      const cellType = grid[y][x].type;
      
      // Mur indestructible : arrête l'explosion
      if (cellType === CELL_TYPES.WALL) break;
      
      explosionCells.push({ x, y });
      
      // Bloc destructible : arrête l'explosion après l'avoir touché
      if (cellType === CELL_TYPES.DESTRUCTIBLE) break;
    }
  });
  
  return explosionCells;
};

/**
 * Vérifie si une position est dans une zone d'explosion
 */
export const isInExplosion = (x, y, explosionCells) => {
  return explosionCells.some(cell => cell.x === x && cell.y === y);
};

/**
 * Détruit les blocs touchés par l'explosion et retourne les power-ups révélés
 */
export const destroyBlocksInExplosion = (explosionCells, grid) => {
  const revealedPowerUps = [];
  let exitRevealed = null;
  
  explosionCells.forEach(({ x, y }) => {
    if (grid[y][x].type === CELL_TYPES.DESTRUCTIBLE) {
      if (grid[y][x].powerUp) {
        revealedPowerUps.push({
          type: grid[y][x].powerUp,
          x,
          y
        });
      }
      
      if (grid[y][x].hasExit) {
        exitRevealed = { x, y };
      }
      
      grid[y][x] = {
        type: CELL_TYPES.EMPTY,
        powerUp: null,
        hasExit: false
      };
    }
  });
  
  return { revealedPowerUps, exitRevealed };
};

/**
 * Calcule le score basé sur ce qui a été détruit
 */
export const calculateScore = (destroyedBlocks, killedEnemies) => {
  return (destroyedBlocks * 10) + (killedEnemies * 100);
};

/**
 * Vérifie si le niveau est terminé (tous les ennemis morts)
 */
export const isLevelComplete = (enemies) => {
  return enemies.every(enemy => !enemy.alive);
};