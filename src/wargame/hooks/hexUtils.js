// src/hexUtils.js

// La taille (rayon) de nos hexagones en pixels
export const HEX_SIZE = 30;

/**
 * Convertit les coordonnées logiques "axial" (q, r) en coordonnées de pixels (x, y).
 * On utilise la disposition "pointy top" (pointe en haut).
 * @param {number} q - Coordonnée q
 * @param {number} r - Coordonnée r
 * @param {number} size - Le rayon de l'hexagone
 * @returns {{x: number, y: number}} - Coordonnées en pixels
 */
export function axialToPixel(q, r, size = HEX_SIZE) {
  const x = size * Math.sqrt(3) * (q + r / 2);
  const y = size * (3 / 2) * r;
  return { x, y };
}

/**
 * Génère une carte hexagonale simple dans un rayon donné.
 * @param {number} radius - Le rayon de la carte (ex: 5)
 * @returns {Map<string, {q: number, r: number, s: number, terrain: string}>}
 */

export function hexDistance(a, b) {
  return Math.max(
    Math.abs(a.q - b.q),
    Math.abs(a.r - b.r),
    Math.abs(a.s - b.s)
  );
}

function hexNeighbors({ q, r, s }) {
  return [
    { q: q+1, r,   s: s-1 },
    { q: q+1, r: r-1, s   },
    { q,   r: r-1, s: s+1 },
    { q: q-1, r,   s: s+1 },
    { q: q-1, r: r+1, s   },
    { q,   r: r+1, s: s-1 },
  ];
}

/**
 * Sélectionne `count` tuiles groupées à partir d'une ancre aléatoire dans validTiles.
 * Chaque tuile choisie est adjacente à au moins une tuile déjà dans le groupe.
 */
function placeGrouped(hexMap, count, validTiles) {
  if (validTiles.length === 0) return [];

  const anchor = validTiles[Math.floor(Math.random() * validTiles.length)];
  const placed = [anchor];
  const placedKeys = new Set([`${anchor.q},${anchor.r}`]);
  const validKeys  = new Set(validTiles.map(t => `${t.q},${t.r}`));

  while (placed.length < count) {
    const frontierKeys = new Set();
    const frontier = [];
    for (const p of placed) {
      for (const n of hexNeighbors(p)) {
        const key = `${n.q},${n.r}`;
        if (!placedKeys.has(key) && validKeys.has(key) && !frontierKeys.has(key)) {
          frontierKeys.add(key);
          frontier.push(hexMap.get(key));
        }
      }
    }
    if (frontier.length === 0) break; // zone trop petite, on s'arrête
    const pick = frontier[Math.floor(Math.random() * frontier.length)];
    placed.push(pick);
    placedKeys.add(`${pick.q},${pick.r}`);
  }

  return placed;
}
export const TERRAIN_TYPE=[
  {id:'plain', weight:0.4, movement:1},
  {id:'forest', weight:1.2, movement:1.5},
  {id:'mountain', weight:2, movement:3},
  {id:'water', weight:0.8, movement:10},
  {id:'desert', weight:1.6, movement:1},
  {id:'road', weight:1.5, movement:0.6},
]
export function generateHexGrid(radius) {
  const map = new Map();
  const terrainTypes = TERRAIN_TYPE.map(t=>t.id);
  //const _terrain = TERRAIN_TYPE.find(t=>t.id);

  // On crée plusieurs centres pour chaque type
  const biomeCenters = [];
  for (const type of terrainTypes) {
    const count = Math.floor(Math.random() * 5) + 5; // entre 5 et 10 centres par biome
    for (let i = 0; i < count; i++) {
      const q = Math.floor(Math.random() * (radius * 2 + 1)) - radius;
      const r = Math.floor(Math.random() * (radius * 2 + 1)) - radius;
      const s = -q - r;
      biomeCenters.push({ type, q, r, s });
    }
  }

  for (let q = -radius; q <= radius; q++) {
    const r1 = Math.max(-radius, -q - radius);
    const r2 = Math.min(radius, -q + radius);
    for (let r = r1; r <= r2; r++) {
      const s = -q - r;

      // Trouver le centre le plus proche
      let nearest = biomeCenters[0];
      let minDist = Infinity;
      for (const center of biomeCenters) {
        const dist = hexDistance({ q, r, s }, center) * TERRAIN_TYPE.find(t=>t.id==center.type).weight;
        if (dist < minDist) {
          minDist = dist;
          nearest = center;
        }
      }

      // Ajouter un peu de variation aux frontières
      const jitter = Math.random();
      let terrain = nearest.type;

      if (jitter > 0.97) terrain = 'plain'; // petites zones neutres
      if (jitter < 0.03) terrain = 'forest'; // petits bosquets aléatoires

      map.set(`${q},${r}`, { q, r, s, terrain });
    }
  }

  return map;
}


export function placeEnemyUnitsOnMap(
  hexMap,
  unitModel,
  count = 5,
  excludedPositions = [],
  zone = { qMin: 3, qMax: 6 }
) {
  const validTiles = Array.from(hexMap.values())
    .filter(t => t.q >= zone.qMin && t.q <= zone.qMax && t.terrain !== 'water')
    .filter(t => !excludedPositions.some(p => p.q === t.q && p.r === t.r));

  const tiles = placeGrouped(hexMap, count, validTiles);

  return tiles.map(tile => ({
    ...unitModel,
    id: crypto.randomUUID(),
    position: tile,
    damagePoints: 0,
  }));
}

export function placePlayerUnitsOnMap(hexMap, unitModels) {
  const validTiles = Array.from(hexMap.values())
    .filter(t => t.q >= -6 && t.q <= -3 && t.terrain !== 'water');

  const tiles = placeGrouped(hexMap, unitModels.length, validTiles);

  return unitModels.map((model, i) => ({
    ...model,
    id: crypto.randomUUID(),
    position: tiles[i % tiles.length],
    damagePoints: 0,
    hasMoved: false,
    hasAttacked: false,
  }));
}

export function moveToward(from, target, movement, grid, occupiedPositions = []) {
  const reachable = getReachableTiles({ position: from, movement }, grid);
  const free = reachable.filter(
    t => !occupiedPositions.some(p => p.q === t.q && p.r === t.r)
  );
  if (free.length === 0) return from;

  let best = from;
  let bestDist = hexDistance(from, target);
  for (const tile of free) {
    const d = hexDistance(tile, target);
    if (d < bestDist) { bestDist = d; best = tile; }
  }
  return best;
}

export function getReachableTiles(unit, grid) {
  if (!unit) return [];

  const terrainInfo = Object.fromEntries(TERRAIN_TYPE.map(t => [t.id, t.movement]));
  const startKey = `${unit.position.q},${unit.position.r}`;

  const frontier = [{ key: startKey, cost: 0 }];
  const visited = new Map();
  visited.set(startKey, 0);

  while (frontier.length > 0) {
    const current = frontier.shift();
    const [q, r] = current.key.split(',').map(Number);
    const s = -q - r;

    const neighbors = [
      { q: q + 1, r, s: s - 1 },
      { q: q + 1, r: r - 1, s },
      { q, r: r - 1, s: s + 1 },
      { q: q - 1, r, s: s + 1 },
      { q: q - 1, r: r + 1, s },
      { q, r: r + 1, s: s - 1 },
    ];

    for (const n of neighbors) {
      const key = `${n.q},${n.r}`;
      const tile = grid.get(key);
      if (!tile) continue; // hors carte

      const terrainCost = terrainInfo[tile.terrain] ?? 1;
      const newCost = visited.get(current.key) + terrainCost;
      const withinBudget   = newCost <= unit.movement;
      // Règle : au moins 1 case de déplacement garanti (sauf eau impassable)
      const isDirectNeighbor = current.key === startKey;
      const impassable = tile.terrain === 'water';

      if (!impassable && (withinBudget || isDirectNeighbor) && (!visited.has(key) || newCost < visited.get(key))) {
        visited.set(key, newCost);
        if (withinBudget) {
          // On propage seulement si le budget le permet
          frontier.push({ key, cost: newCost });
        }
      }
    }
  }

  return Array.from(visited.keys())
    .filter((k) => k !== startKey)
    .map((k) => grid.get(k));
}
