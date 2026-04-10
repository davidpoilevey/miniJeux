import WorldGrid, { GRID_COLS, GRID_ROWS } from './WorldGrid.js';

// ─────────────────────────────────────────────────────────────
// NOISE — Value Noise + fBm (fractal Brownian Motion)
// Déterministe par seed, zéro dépendance externe.
// ─────────────────────────────────────────────────────────────

function hash2(x, y, seed) {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.3) * 43758.5453;
  return n - Math.floor(n);
}

function valueNoise(x, y, seed) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  return (
    hash2(ix,   iy,   seed) * (1-ux) * (1-uy) +
    hash2(ix+1, iy,   seed) * ux     * (1-uy) +
    hash2(ix,   iy+1, seed) * (1-ux) * uy     +
    hash2(ix+1, iy+1, seed) * ux     * uy
  );
}

function fbm(x, y, seed, octaves = 6) {
  let v = 0, a = 0.5, f = 1, max = 0;
  for (let i = 0; i < octaves; i++) {
    v   += valueNoise(x * f + seed * 3.1, y * f + seed * 1.7, seed) * a;
    max += a;
    a   *= 0.5;
    f   *= 2.1;
  }
  return v / max;
}

// RNG déterministe (LCG) pour la génération des rivières
function seededRng(seed) {
  let s = seed | 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) | 0;
    return (s >>> 0) / 0x100000000;
  };
}

// ─────────────────────────────────────────────────────────────
// SEA LEVEL
// ─────────────────────────────────────────────────────────────

export const DEFAULT_SEA_LEVEL = 30;

// ─────────────────────────────────────────────────────────────
// TERRAIN RULES
// ─────────────────────────────────────────────────────────────

export function getTerrainType(altitude, humidity, temperature, seaLevel = DEFAULT_SEA_LEVEL) {
  // Glace polaire : prime sur tout (terres au-dessus du niveau de la mer)
  if (temperature < -8)          return 'glace';

  if (altitude < seaLevel)       return 'eau';

  // Neige sur sommets froids
  if (altitude >= 75 && temperature < 3) return 'neige';
  if (altitude >= 80)            return 'montagne';

  // Berges humides
  if (altitude < seaLevel + 10)  return humidity > 52 ? 'marecage' : 'plaine';

  if (altitude < 65) {
    if (humidity < 28)           return 'desert';
    if (humidity > 55)           return 'foret';
    return 'plaine';
  }

  // Hautes terres (65-80)
  return humidity > 42 ? 'foret' : 'plaine';
}

const FERTILITY_BY_TERRAIN = {
  foret:    (hum) => Math.min(100, hum * 0.9 + 2),
  plaine:   (hum) => Math.min(100, hum * 0.7 + 10),
  marecage: (hum) => Math.min(100, hum * 0.4 + 5),
  riviere:  (hum) => Math.min(100, hum * 0.5 + 20),
  desert:   (hum) => Math.max(0,   hum * 0.6 - 5),
  montagne: (hum) => Math.max(0,   hum * 0.2 - 5),
  neige:    (hum) => Math.max(0,   hum * 0.1-10),
  glace:    ()    => 0,
  eau:      ()    => 0,
};

// ─────────────────────────────────────────────────────────────
// ALTITUDE MAP
// Double couche : continental (basses fréq.) + local (hautes fréq.)
// + masque île (bords = mer) + boost polaire (glace aux pôles)
// ─────────────────────────────────────────────────────────────

function buildAltitudeMap(cols, rows, seed) {
  const alt = new Float32Array(cols * rows);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const nx = x / cols;
      const ny = y / rows;

      // Masque île : ellipse douce, bords = mer
      const cx = nx - 0.5, cy = ny - 0.5;
      const dist = Math.sqrt(cx * cx + cy * cy) * 2;
      const island = Math.max(0, 1 - Math.pow(dist * 1.08, 2.0));

      // Continental (2 octaves, très basse fréq) → grandes masses cohérentes
      const continental = fbm(nx * 2.2, ny * 2.2, seed + 5, 3);

      // Local (6 octaves, hautes fréq) → collines, vallées, reliefs fins
      const local = fbm(nx * 6, ny * 6, seed, 6);

      // Mélange — continental domine pour éviter les lacs isolés d'1 px
      const raw = continental * 0.250 + local * 0.5 + island * 0.25;

      // Redistribution : creuse les mers, élève les montagnes
      const rawAlt = Math.pow(Math.max(0, raw), 1.5) * 100;

      // Boost polaire : un peu de relief aux pôles pour créer des terres glacées
      const latFromPole = 1 - Math.abs(ny - 0.5) * 2;  // 0 aux pôles, 1 à l'équateur
      const polarBoost  = Math.pow(1 - latFromPole, 2.5) * 12;

      alt[y * cols + x] = rawAlt + polarBoost;
    }
  }

  return alt;
}

// ─────────────────────────────────────────────────────────────
// TEMPERATURE
// Gradient équateur chaud / pôles froids (exponentiel), refroidissement altitudinal.
// ─────────────────────────────────────────────────────────────

function computeTemperature(ny, altitude) {
  const latFromPole = 1 - Math.abs(ny - 0.5) * 2;  // 0 aux pôles, 1 à l'équateur

  // Froid polaire exponentiel : remonte très vite près des pôles
  const polarCold  = Math.pow(1 - latFromPole, 2.2) * 15;

  // Chaud équatorial
  const equatHeat  = latFromPole * 48;

  // Refroidissement avec l'altitude (à partir de 35)
  const altCool    = altitude > 35 ? (altitude - 35) * 0.40 : 0;

  return Math.round(equatHeat - polarCold - altCool - 5);  // ~-50..+43 °C
}

// ─────────────────────────────────────────────────────────────
// RIVERS
// Tracé depuis les sommets par descente pondérée (+ bruit).
// Stockées via isRiver:true sur chaque cellule traversée.
// ─────────────────────────────────────────────────────────────

function generateRivers(grid, cols, rows, seed, seaLevel, count = 15) {
  const rng = seededRng(seed + 9999);
  const margin = 4;

  // Sources : toute cellule à haute altitude (montagne OU neige),
  // ou à défaut forêt/plaine élevée — loin des bords
  const HIGH_TERRAIN = new Set(['montagne', 'neige']);
  const candidates = [];
  for (let y = margin; y < rows - margin; y++) {
    for (let x = margin; x < cols - margin; x++) {
      const c = grid.getCell(x, y);
      if (c && c.altitude > 62 && HIGH_TERRAIN.has(c.terrainType)) {
        candidates.push(c);
      }
    }
  }
  // Fallback : si toujours rien, on prend les cellules les plus hautes non-eau
  if (candidates.length === 0) {
    for (let y = margin; y < rows - margin; y++) {
      for (let x = margin; x < cols - margin; x++) {
        const c = grid.getCell(x, y);
        if (c && c.altitude > 50 && c.terrainType !== 'eau' && c.terrainType !== 'glace') {
          candidates.push(c);
        }
      }
    }
  }

  // Mélange déterministe
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  for (const src of candidates.slice(0, count)) {
    traceRiver(grid, src.x, src.y, rng, seaLevel);
  }
}

function traceRiver(grid, startX, startY, rng, seaLevel) {
  let x = startX, y = startY;
  const visited = new Set();

  for (let step = 0; step < 300; step++) {
    const key = `${x},${y}`;
    if (visited.has(key)) break;
    visited.add(key);

    const cell = grid.getCell(x, y);
    if (!cell) break;

    // Stop si on rejoint la mer ou une rivière existante
    if (cell.altitude < seaLevel || cell.terrainType === 'eau') break;
    if (cell.isRiver) break;

    // Marque la cellule comme rivière
    grid.setCell(x, y, { ...cell, terrainType: 'riviere', isRiver: true });

    // Voisins 4-directionnels (les rivières ne vont pas en diagonale)
    const neighbors = [];
    for (const [dx, dy] of [[-1,0],[1,0],[0,-1],[0,1]]) {
      const n = grid.getCell(x + dx, y + dy);
      if (n && !visited.has(`${n.x},${n.y}`)) neighbors.push(n);
    }

    if (neighbors.length === 0) break;

    // Préférence forte pour descendre + bruit léger (évite les lignes droites)
    const scored = neighbors
      .map(n => ({ n, score: n.altitude + (rng() - 0.5) * 12 }))
      .sort((a, b) => a.score - b.score);

    const next = scored[0].n;

    // Impossible de franchir un mur trop haut
    if (next.altitude > cell.altitude + 14) break;

    x = next.x;
    y = next.y;
  }
}

// ─────────────────────────────────────────────────────────────
// MAIN GENERATOR
// ─────────────────────────────────────────────────────────────

export default function generateWorld(cols = GRID_COLS, rows = GRID_ROWS, seed = 42) {
  const grid     = new WorldGrid(cols, rows);
  const seaLevel = DEFAULT_SEA_LEVEL+Math.round(fbm(seed, seed, seed + 123.45) * 10 - 5); // var. ±5 autour de la valeur par défaut
  const altMap   = buildAltitudeMap(cols, rows, seed);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const nx       = x / cols;
      const ny       = y / rows;
      const altitude = Math.round(altMap[y * cols + x]);
      const humidity = Math.round(fbm(nx * 4, ny * 4, seed + 17.3, 5) * 100);
      const temperature  = computeTemperature(ny, altitude);
      const terrainType  = getTerrainType(altitude, humidity, temperature, seaLevel);
      const fertility    = Math.round((FERTILITY_BY_TERRAIN[terrainType] ?? (() => 0))(humidity));

      grid.setCell(x, y, {
        x, y,
        altitude,
        terrainType,
        temperature,
        humidity,
        fertility,
        isRiver: false,
      });
    }
  }

  generateRivers(grid, cols, rows, seed, seaLevel);

  return grid;
}
