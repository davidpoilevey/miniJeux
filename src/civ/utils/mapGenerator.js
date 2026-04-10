
import { UNIT_TYPES } from '../data/unitTypes';
import { generateFullHexGrid, getHexNeighbors } from './hexUtils';
/** type Tile = {
  q: number;
  r: number;
  type: 'plaine' | 'foret' | 'montagne' | 'eau' | 'desert';
  feature?: 'mineOr' | 'puitsPetrole' | 'verger' | 'bancPoisson' | 'laine' | 'zone'...;
  unit?: Unit;
  hasCity?: boolean;
}
  type ResourceType =
  | 'food'
  | 'gold'
  | 'iron'
  | 'stone'
  | 'wood'
  | 'charbon'
  | 'petrole'
  | 'laine'
  | 'uranium'
  | 'happiness'
 */
const BASE_TILE_YIELD = {
  plain: { food: 3, laine:1, wood:1,gold:2 },
  forest: { food: 1, wood: 2,stone:1 ,gold:1},
  mountain: { stone: 2,iron:1 ,charbon:1,gold:2},
  water: { food: 2 },
  desert: {petrole:1,stone:1,gold:2},
};
export const FEATURE_YIELD = {
  mineOr: { gold: 5 },
  mineFer: { iron: 5 },
  mineCharbon: { charbon: 5 },
  gisementUranium: { uranium: 5 },
  puitsPetrole: { petrole: 5 },
  verger: { wood: 5 },
  bancPoisson: { food: 5 },
  laine: { laine: 5 },
  zone:{food: 1, laine:1, wood:1,gold:1,charbon:1,stone:1,petrole:1,uranium:1,iron:1}  
};
const mergeYield = (y1 = {}, y2 = {}) => {
  const result = { ...y1 };
  for (const key in y2) {
    result[key] = (result[key] || 0) + y2[key];
  }
  return result;
};

export const calculateTileYield = (tile) => {
  const base = BASE_TILE_YIELD[tile.type] || {};
  const feature = tile.feature ? FEATURE_YIELD[tile.feature] || {} : {};
  return mergeYield(base, feature);
};

const TERRAIN_TYPES = {
  PLAIN: 'plain',
  FOREST: 'forest',
  MOUNTAIN: 'mountain',
  WATER: 'water',
  DESERT: 'desert',
};

const FEATURES = {
  MINE_OR: 'mineOr',
  MINE_FER: 'mineFer',
  MINE_CHARBON: 'mineCharbon',
  GISEMENT_URANIUM: 'gisementUranium',
  PUITS_PETROLE: 'puitsPetrole',
  VERGER: 'verger',
  LAINE: 'laine',
  BANC_POISSON: 'bancPoisson',
  ZONE:'zone'
};

export const generateMapWithTerrain = (stageWidth, stageHeight, tileSize, owner) => {
  const tiles = generateFullHexGrid(stageWidth, stageHeight, tileSize);
  const tileMap = new Map();

  // Initialiser toutes les cases comme des plaines
  tiles.forEach(tile => {
    tile.type = TERRAIN_TYPES.PLAIN;
    tile.feature = null;

    tileMap.set(`${tile.q},${tile.r}`, tile);
  });

  // 🟢 Créer des clusters de terrains
  const clusteredTerrains = [TERRAIN_TYPES.FOREST, TERRAIN_TYPES.MOUNTAIN
    , TERRAIN_TYPES.WATER, TERRAIN_TYPES.WATER, TERRAIN_TYPES.WATER, TERRAIN_TYPES.DESERT];
  clusteredTerrains.forEach(type => {
    const clusterCount = randomInt(6, 12);
    for (let i = 0; i < clusterCount; i++) {
      const seed = randomTile(tiles);
      growBlob(seed, type, tileMap, randomInt(15, 35));
    }
  });


  // ✨ Ajouter des features spéciales
  const addFeature = (feature, conditionFn, countRange) => {
    const [min, max] = countRange;
    const count = randomInt(min, max);
    let placed = 0,tantPisCount=0;
    while (placed < count && tantPisCount<100) {
      const tile = randomTile(tiles);
      if (!tile.feature && conditionFn(tile)) {
        tile.feature = feature;
        placed++;
      }
      else tantPisCount++;
    }
  };

  addFeature(FEATURES.GISEMENT_URANIUM, tile => tile.type !== TERRAIN_TYPES.WATER, [5, 10]);
  addFeature(FEATURES.MINE_FER, tile => tile.type === TERRAIN_TYPES.MOUNTAIN
      ||tile.type === TERRAIN_TYPES.DESERT, [10, 20]);
  addFeature(FEATURES.MINE_CHARBON, tile => tile.type === TERRAIN_TYPES.MOUNTAIN,  [10, 20]);
  addFeature(FEATURES.MINE_OR, tile => tile.type === TERRAIN_TYPES.MOUNTAIN
      ||tile.type === TERRAIN_TYPES.FOREST,  [5, 10]);
  addFeature(FEATURES.PUITS_PETROLE, tile => tile.type === TERRAIN_TYPES.DESERT,  [5, 10]);
  addFeature(FEATURES.VERGER, tile => tile.type === TERRAIN_TYPES.FOREST,  [10, 20]);
  addFeature(FEATURES.BANC_POISSON, tile => tile.type === TERRAIN_TYPES.WATER,  [10, 20]);
  addFeature(FEATURES.LAINE, tile => tile.type === TERRAIN_TYPES.PLAIN,  [10, 20]);

tiles.forEach(tile=>{tile.yield = calculateTileYield(tile);});

  // ➕ Ajouter une unité pionnier pour tester
  const result = Array.from(tileMap.values());

  return result;
};


export const addFeatureInTile = (tile) => {
  // Si la tuile a déjà une feature, on ne fait rien.
  if (tile.feature) {
    return tile;
  }

  const possibleFeatures = [];

  // On construit la liste des features possibles en se basant sur la logique initiale
  if (tile.type !== TERRAIN_TYPES.WATER) {
    possibleFeatures.push(FEATURES.GISEMENT_URANIUM);
  }
  if (tile.type === TERRAIN_TYPES.MOUNTAIN || tile.type === TERRAIN_TYPES.PLAIN || tile.type === TERRAIN_TYPES.DESERT) {
    possibleFeatures.push(FEATURES.MINE_FER);
  }
  if (tile.type === TERRAIN_TYPES.MOUNTAIN || tile.type === TERRAIN_TYPES.FOREST) {
    possibleFeatures.push(FEATURES.MINE_CHARBON);
  }
  if (tile.type === TERRAIN_TYPES.MOUNTAIN || tile.type === TERRAIN_TYPES.FOREST) {
    possibleFeatures.push(FEATURES.MINE_OR);
  }
  if (tile.type === TERRAIN_TYPES.DESERT|| tile.type === TERRAIN_TYPES.PLAIN) {
    possibleFeatures.push(FEATURES.PUITS_PETROLE);
  }
  if (tile.type === TERRAIN_TYPES.FOREST|| tile.type === TERRAIN_TYPES.PLAIN) {
    possibleFeatures.push(FEATURES.VERGER);
  }
  if (tile.type === TERRAIN_TYPES.WATER) {
    possibleFeatures.push(FEATURES.BANC_POISSON);
  }
  if (tile.type === TERRAIN_TYPES.PLAIN|| tile.type === TERRAIN_TYPES.FOREST) {
    possibleFeatures.push(FEATURES.LAINE);
  }

  // S'il y a au moins une feature possible
  if (possibleFeatures.length > 0) {
    // On en choisit une au hasard dans la liste
    const randomIndex = Math.floor(Math.random() * possibleFeatures.length);
    tile.feature = possibleFeatures[randomIndex];
  }

  return tile;
};
function growBlob(startTile, terrainType, tileMap, size) {
  const visited = new Set();
  const queue = [startTile];
  let added = 0;

  while (queue.length > 0 && added < size) {
    const current = queue.shift();
    const key = `${current.q},${current.r}`;

    if (visited.has(key)) continue;

    const tile = tileMap.get(key);
    if (tile && tile.type === 'plain') {
      tile.type = terrainType;
      added++;
      visited.add(key);

      const neighbors = getHexNeighbors(tile);
      neighbors.forEach(n => {
        const nKey = `${n.q},${n.r}`;
        if (!visited.has(nKey)) queue.push(n);
      });
    }
  }
}

function randomTile(tiles) {
  return tiles[Math.floor(Math.random() * tiles.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}