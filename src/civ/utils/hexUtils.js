import { UNIT_TYPES } from "../data/unitTypes";
import { getTileCost } from "./utils";

export const HEX_SIZE = 40; // rayon
const SQRT_3 = Math.sqrt(3);

// Index q,r -> tile, mis en cache par référence de tableau : chaque setTiles crée
// un nouveau tableau donc le cache se renouvelle tout seul. Les mutations d'unités
// ne changent pas les coordonnées, l'index reste valide.
const tileIndexCache = new WeakMap();
export const getTileMap = (tiles) => {
  let index = tileIndexCache.get(tiles);
  if (!index) {
    index = new Map(tiles.map(t => [`${t.q},${t.r}`, t]));
    tileIndexCache.set(tiles, index);
  }
  return index;
};
export const getTileAt = (tiles, q, r) => getTileMap(tiles).get(`${q},${r}`);

export const hexToPixel = ({ q, r }) => {
  const x = HEX_SIZE * SQRT_3 * (q + r / 2);
  const y = HEX_SIZE * 1.5 * r;
  return { x, y };
};

export const pixelToHex = ({ x, y }) => {
  const q = ((x * Math.sqrt(3)/3) - (y / 3)) / HEX_SIZE;
  const r = (y * 2/3) / HEX_SIZE;
  return hexRound({ q, r });
};
export const generateFullHexGrid = (stageWidth, stageHeight, hexSize) => {
  const tiles = [];
  const hexWidth = SQRT_3 * hexSize;
  const hexHeight = 2 * hexSize;
  const vertSpacing = hexSize * 1.5;
  const horizSpacing = hexWidth;

  const cols = Math.ceil(stageWidth / horizSpacing);
  const rows = Math.ceil(stageHeight / vertSpacing);

  for (let r = -rows; r < rows; r++) {
    for (let q = -cols; q < cols; q++) {
      const { x, y } = hexToPixel({ q, r });
      if (x >= -hexWidth && x <= stageWidth + hexWidth &&
          y >= -hexHeight && y <= stageHeight + hexHeight) {
        tiles.push({ id: `${q},${r}`, q, r, type: 'plain' });
      }
    }
  }

  return tiles;
};

const hexRound = ({ q, r }) => {
  let x = q;
  let z = r;
  let y = -x - z;

  let rx = Math.round(x);
  let ry = Math.round(y);
  let rz = Math.round(z);

  const dx = Math.abs(rx - x);
  const dy = Math.abs(ry - y);
  const dz = Math.abs(rz - z);

  if (dx > dy && dx > dz) {
    rx = -ry - rz;
  } else if (dy > dz) {
    ry = -rx - rz;
  } else {
    rz = -rx - ry;
  }

  return { q: rx, r: rz };
};

export const getHexNeighbors = ({ q, r }, tiles) => {
  const directions = [
    { q: +1, r:  0 },
    { q: +1, r: -1 },
    { q:  0, r: -1 },
    { q: -1, r:  0 },
    { q: -1, r: +1 },
    { q:  0, r: +1 },
  ];

  if (!Array.isArray(tiles)) {
    // Fallback : renvoie juste des coordonnées (comme l’ancienne version)
    return directions.map(dir => ({ q: q + dir.q, r: r + dir.r }));
  }

  const tileMap = getTileMap(tiles);
  return directions
    .map(dir => tileMap.get(`${q + dir.q},${r + dir.r}`))
    .filter(Boolean);
};


export const getSurroundingTiles = (center, tiles, radius=2) => {
  const { q, r } = center;
  const tileMap = getTileMap(tiles);

  const result = [];
  for (let dq = -radius; dq <= radius; dq++) {
    for (let dr = Math.max(-radius, -dq - radius); dr <= Math.min(radius, -dq + radius); dr++) {
      const tile = tileMap.get(`${q + dq},${r + dr}`);
      if (tile) result.push(tile);
    }
  }
  return result;
};

export const getExtendedInfluence = (center) => {
  const result = [];
  const directions = [
    { q: 1, r: 0 },
    { q: 1, r: -1 },
    { q: 0, r: -1 },
    { q: -1, r: 0 },
    { q: -1, r: 1 },
    { q: 0, r: 1 },
  ];

  for (let dir of directions) {
    const q1 = center.q + dir.q;
    const r1 = center.r + dir.r;
    result.push({ q: q1, r: r1 });

    const q2 = center.q + 2 * dir.q;
    const r2 = center.r + 2 * dir.r;
    result.push({ q: q2, r: r2 });
  }

  result.push(center); // inclut la ville elle-même
  return result;
};

export  const getHexagonPoints = (cx, cy, size) => {
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = Math.PI / 180 * (60 * i - 30);
    const x = cx + size * Math.cos(angle);
    const y = cy + size * Math.sin(angle);
    points.push({ x, y });
  }
  return points;
};

const HEX_DIRECTIONS = [
  { q: 1, r: 0 },   // E
  { q: 1, r: -1 },  // NE
  { q: 0, r: -1 },  // NW
  { q: -1, r: 0 },  // W
  { q: -1, r: 1 },  // SW
  { q: 0, r: 1 },   // SE
];
const DIRECTION_MAP = {
  ArrowRight: { q: 1, r: 0 },    // E
  ArrowLeft: { q: -1, r: 0 },    // W
  ArrowUp: { q: 0, r: -1 },      // NW
  ArrowDown: { q: 0, r: 1 },     // SE
};
export const moveSelectedUnit = (key, selectedTile, tiles, moveUnit) => {
  if (!selectedTile || !selectedTile.unit) return;

  const dir = DIRECTION_MAP[key];
  if (!dir) return;

  const from = selectedTile;
  const to = tiles.find(t => t.q === from.q + dir.q && t.r === from.r + dir.r);

  if (to) {
    moveUnit(to);
    return true;
  }
  return false;
};

export const focusNextUnit = (selectedTile, tiles, currentPlayer) => {
  const units = tiles.filter(
    t => t.unit && t.unit.owner.id === currentPlayer.id && t.unit.remainingMovement>0
  );

  if (units.length === 0) return;

  const index = units.findIndex(t => t === selectedTile);
  const next = units[(index + 1) % units.length];
  return next;
};


// Algorithme A* pour grille hexagonale
// Nécessite : getHexNeighbors(tile),  tile.unit, tile.hasCity

export const findPath=(start, goal, map, options = {})=> {
  const { armee, canCrossWater = false, isTarget = false} = options;
  const tileMap = getTileMap(map);

  const heuristic = (a, b) => {
    // Distance Manhattan adaptée aux hexagones // erduite pour favoriser les routes
           const distance = (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
  return distance * 0.8;
  };

  const costMap = new Map();
  const cameFrom = new Map();
  const frontier = new TinyQueue([], (a, b) => a.priority - b.priority);
  frontier.push({ tile: start, priority: 0 });
  costMap.set(`${start.q},${start.r}`, 0);

  while (frontier.length > 0) {
    const current = frontier.pop().tile;
    const currentKey = `${current.q},${current.r}`;

    if (current.q === goal.q && current.r === goal.r) {
      const path = [];
      let curr = current;
      while (curr && !(curr.q === start.q && curr.r === start.r)) {
        path.push(curr);
        const prevKey = cameFrom.get(`${curr.q},${curr.r}`);
        curr = tileMap.get(prevKey);
      }
      return path.reverse();
    }

    const neighbors = HEX_DIRECTIONS
      .map(dir => tileMap.get(`${current.q + dir.q},${current.r + dir.r}`))
      .filter(n => n); // éviter undefined

    for (const neighbor of neighbors) {
      const key = `${neighbor.q},${neighbor.r}`;
      if (!isTarget && (neighbor.unit || neighbor.hasCity)) continue; // case occupée

      const terrainCost = getTileCost(neighbor);
      const moveCost = ((neighbor.type === 'water' && !canCrossWater)
                      ||(neighbor.type !== 'water' && armee==='naval')) ? 999 : terrainCost;

      const newCost = costMap.get(currentKey) + moveCost;
      if (!costMap.has(key) || newCost < costMap.get(key)) {
        costMap.set(key, newCost);
        const priority = newCost + heuristic(neighbor, goal);
        frontier.push({ tile: neighbor, priority });
        cameFrom.set(key, currentKey);
      }
    }
  }

  return null; // pas de chemin trouvé
}

// Mini file de priorité (TinyQueue) — tu peux aussi utiliser une librairie type heap.js
class TinyQueue {
  constructor(data = [], compare = (a, b) => a - b) {
    this.data = data;
    this.length = data.length;
    this.compare = compare;
    if (this.length > 0) this._heapify();
  }

  push(item) {
    this.data.push(item);
    this.length++;
    this._up(this.length - 1);
  }

  pop() {
    if (this.length === 0) return undefined;
    const top = this.data[0];
    const bottom = this.data.pop();
    this.length--;
    if (this.length > 0) {
      this.data[0] = bottom;
      this._down(0);
    }
    return top;
  }

  _heapify() {
    for (let i = (this.length >> 1); i >= 0; i--) this._down(i);
  }

  _up(pos) {
    const { data, compare } = this;
    const item = data[pos];
    while (pos > 0) {
      const parent = (pos - 1) >> 1;
      const current = data[parent];
      if (compare(item, current) >= 0) break;
      data[pos] = current;
      pos = parent;
    }
    data[pos] = item;
  }

  _down(pos) {
    const { data, compare } = this;
    const halfLength = this.length >> 1;
    const item = data[pos];
    while (pos < halfLength) {
      let left = (pos << 1) + 1;
      let right = left + 1;
      let best = data[left];
      if (right < this.length && compare(data[right], best) < 0) {
        left = right;
        best = data[right];
      }
      if (compare(best, item) >= 0) break;
      data[pos] = best;
      pos = left;
    }
    data[pos] = item;
  }
}


export function getDistanceHex(a, b) {
  const dq = b.q - a.q;
  const dr = b.r - a.r;
  return Math.max(Math.abs(dq), Math.abs(dr), Math.abs(dq + dr));
}

export function getMovementResult(unit, start, goal, map) {
  const unitDef = UNIT_TYPES[unit.type];
  const path = findPath(start, goal, map, {
    canCrossWater: unitDef.canCrossWater,
    armee: unitDef.armee
  });

  if (!path || path.length === 0) return null;

  let movement = unit.remainingMovement ?? unitDef.movement;
  let costSoFar = path[0].hasRoad?0.5:1;
  const pathUsed = [path[0]];

  for (let i = 1; i < path.length; i++) {
    const tile = path[i];
    const terrainCost = getTileCost(tile)

    const moveCost = ((tile.type === 'water' && !unitDef.canCrossWater)
      || (tile.type !== 'water' && unitDef.armee === 'naval')) ? 999 : terrainCost;

    if (costSoFar + moveCost > movement) break;

    costSoFar += moveCost;
    pathUsed.push(tile);
  }

  const destination = pathUsed.at(-1);
  if (!destination || (destination.q === start.q && destination.r === start.r)) return null;

  return {
    path,           // chemin complet (utile pour l'affichage)
    pathUsed,       // portion vraiment parcourue
    endTile: destination,
    movementUsed: costSoFar,
  };
}
