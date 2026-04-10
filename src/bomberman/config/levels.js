export const LEVELS = [
  {
    level: 1,
    title: "Jardin Paisible",
    enemies: 2,
    destructibleBlocksRatio: 0.5,
    powerUpChance: 0.35
  },
  {
    level: 2,
    title: "Usine Abandonnée",
    enemies: 3,
    destructibleBlocksRatio: 0.6,
    powerUpChance: 0.3
  },
  {
    level: 3,
    title: "Labyrinthe Maudit",
    enemies: 4,
    destructibleBlocksRatio: 0.7,
    powerUpChance: 0.25
  },
  {
    level: 4,
    title: "Forteresse Ennemie",
    enemies: 5,
    destructibleBlocksRatio: 0.8,
    powerUpChance: 0.2
  },
  {
    level: 5,
    title: "Enfer de Bombes",
    enemies: 7,
    destructibleBlocksRatio: 0.8,
    powerUpChance: 0.18
  }
];

export const GRID_SIZE = 13;

export const CELL_TYPES = {
  EMPTY: 'empty',
  WALL: 'wall',
  DESTRUCTIBLE: 'destructible'
};

export const POWER_UP_TYPES = {
  BOMB_PLUS: 'bomb_plus',      // Plus de bombes simultanées
  FIRE_PLUS: 'fire_plus',      // Portée d'explosion +1
  SPEED_PLUS: 'speed_plus',    // Vitesse +1
  LIFE_PLUS: 'life_plus',      // Vie +1
  GRENADE: 'grenade',          // Timer 1s
  DYNAMITE: 'dynamite',        // Timer 2s
  C4: 'c4'                     // Timer 3s
};

export const BOMB_TYPES = {
  GRENADE: { type: 'grenade', timer: 800, name: 'Grenade' },
  DYNAMITE: { type: 'dynamite', timer: 1500, name: 'Dynamite' },
  C4: { type: 'c4', timer: 2500, name: 'C4' }
};

export const INITIAL_PLAYER_STATE = {
  position: { x: 1, y: 1 },
  lives: 3,
  maxBombs: 1,
  fireRange: 1,
  speed: 1,
  currentBombType: 'grenade',
  score: 0
};

export const GAME_SPEEDS = {
  1: 200,  // ms par mouvement
  2: 150,
  3: 100
};

export const DIRECTION = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 }
};