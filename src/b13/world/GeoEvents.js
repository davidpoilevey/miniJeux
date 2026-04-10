import { getTerrainType } from './WorldGenerator';

// ─────────────────────────────────────────────────────────────
// Catalogue des événements
// ─────────────────────────────────────────────────────────────

export const GEO_EVENTS = {
  EARTHQUAKE:     'earthquake',
  VOLCANO:        'volcano',
  FLOOD:          'flood',
  DROUGHT:        'drought',
  METEOR:         'meteor',
  MOUNTAIN_RANGE: 'mountainRange',
  WARMING:         'warming',
  GLACIATION:      'glaciation',
  PREDATOR_BOOST:  'predatorBoost',
  DIVERSIFICATION: 'diversification',
  DISEASE:         'disease',
  FECOND_FLOWER:   'fecondFlower',
  GERME_FRUIT:     'germeFruit',
};

// Événements qui nécessitent un clic sur la carte pour se positionner
export const POSITIONED_EVENTS = new Set([
  GEO_EVENTS.VOLCANO,
  GEO_EVENTS.EARTHQUAKE,
  GEO_EVENTS.METEOR,
  GEO_EVENTS.MOUNTAIN_RANGE,
  GEO_EVENTS.DISEASE,
]);

// ─────────────────────────────────────────────────────────────
// VOLCAN
// Soulève un cône d'altitude, brûle fertilité et humidité.
// ─────────────────────────────────────────────────────────────

export function applyVolcano(grid, cx, cy, seaLevel) {
  const rand   = makePRNG(cx, cy);
  const radius = 12 + Math.floor(rand() * 20);
  const peak   = 38 + Math.floor(rand() * 62);

  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > radius) continue;

      const cell = grid.getCell(cx + dx, cy + dy);
      if (!cell) continue;

      const factor  = 1 - dist / radius;
      const newAlt  = Math.min(100, Math.round(cell.altitude + peak * factor - 10));
      const newHum  = Math.round(cell.humidity  * (1 - factor * 0.45));
      const newFert = Math.round(cell.fertility * (1 - factor * 0.92));
      const newTerr = getTerrainType(newAlt, newHum, cell.temperature, seaLevel);

      grid.setCell(cx + dx, cy + dy, {
        ...cell,
        altitude:    newAlt,
        humidity:    newHum,
        fertility:   newFert,
        terrainType: newTerr,
        isRiver:     false,
      });
    }
  }
}

// ─────────────────────────────────────────────────────────────
// SÉISME
// Ligne de faille aléatoire : un flanc monte, l'autre descend.
// Une rivière naît depuis le point le plus haut du flanc surélevé.
// ─────────────────────────────────────────────────────────────

export function applyEarthquake(grid, cx, cy, seaLevel) {
  const rand      = makePRNG(cx, cy);
  const radius    = 12 + Math.floor(rand() * 9);
  const angle     = rand() * Math.PI;
  const upShift   = 14 + Math.floor(rand() * 12);
  const downShift = 9  + Math.floor(rand() * 8);

  let highestCell = null;

  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > radius) continue;

      const cell = grid.getCell(cx + dx, cy + dy);
      if (!cell) continue;

      const side       = Math.cos(angle) * dx + Math.sin(angle) * dy;
      const distFactor = 1 - dist / radius;

      let altDelta;
      if (Math.abs(side) < 1.5) {
        altDelta = -3;                                            // zone de faille fracturée
      } else if (side > 0) {
        altDelta = Math.round(upShift   * distFactor);
      } else {
        altDelta = -Math.round(downShift * distFactor);
      }

      const newAlt     = Math.max(0, Math.min(100, cell.altitude + altDelta));
      const newTerr    = getTerrainType(newAlt, cell.humidity, cell.temperature, seaLevel);
      const updated    = {
        ...cell,
        altitude:    newAlt,
        terrainType: newTerr,
        isRiver:     cell.isRiver && newAlt >= seaLevel,
      };

      grid.setCell(cx + dx, cy + dy, updated);

      // Source de rivière : cellule la plus haute côté surélevé, au-dessus de la mer
      if (side > 0 && newAlt >= seaLevel && (!highestCell || newAlt > highestCell.altitude)) {
        highestCell = updated;
      }
    }
  }

  if (highestCell) {
    traceRiver(grid, highestCell.x, highestCell.y, seaLevel);
  }
}

// ─────────────────────────────────────────────────────────────
// INONDATION
// Remontée du niveau de la mer + humidification globale.
// Retourne le nouveau seaLevel.
// ─────────────────────────────────────────────────────────────

export function applyFlood(grid, seaLevel) {
  const rand        = makePRNG(seaLevel, 1);
  const rise        = 3 + Math.floor(rand() * 5);   // +3..+7
  const humBoost    = 8 + Math.floor(rand() * 8);   // +8..+15
  const newSeaLevel = Math.min(70, seaLevel + rise);

  for (let y = 0; y < grid.rows; y++) {
    for (let x = 0; x < grid.cols; x++) {
      const cell = grid.getCell(x, y);
      if (!cell) continue;
      const newHum  = Math.min(100, cell.humidity + humBoost);
      const newTerr = getTerrainType(cell.altitude, newHum, cell.temperature, newSeaLevel);
      grid.setCell(x, y, { ...cell, humidity: newHum, terrainType: newTerr });
    }
  }

  return newSeaLevel;
}

// ─────────────────────────────────────────────────────────────
// SÉCHERESSE
// Baisse du niveau de la mer + déshydratation globale.
// Retourne le nouveau seaLevel.
// ─────────────────────────────────────────────────────────────

export function applyDrought(grid, seaLevel) {
  const rand        = makePRNG(seaLevel, 2);
  const drop        = 3 + Math.floor(rand() * 5);   // -3..-7
  const humLoss     = 10 + Math.floor(rand() * 8);  // -10..-17
  const newSeaLevel = Math.max(8, seaLevel - drop);

  for (let y = 0; y < grid.rows; y++) {
    for (let x = 0; x < grid.cols; x++) {
      const cell = grid.getCell(x, y);
      if (!cell) continue;
      const newHum  = Math.max(0, cell.humidity - humLoss);
      const newTerr = getTerrainType(cell.altitude, newHum, cell.temperature, newSeaLevel);
      grid.setCell(x, y, { ...cell, humidity: newHum, terrainType: newTerr });
    }
  }

  return newSeaLevel;
}

// ─────────────────────────────────────────────────────────────
// MÉTÉORITE
// Creuse un cratère qui devient mer, avec une île émergente au centre.
// ─────────────────────────────────────────────────────────────

export function applyMeteor(grid, cx, cy, seaLevel) {
  const rand         = makePRNG(cx, cy);
  const impactRadius = 8 + Math.floor(rand() * 10);
  const islandRadius = Math.max(1, Math.floor(impactRadius * 0.22));
  const craterFloor  = seaLevel - 18;

  for (let dy = -impactRadius; dy <= impactRadius; dy++) {
    for (let dx = -impactRadius; dx <= impactRadius; dx++) {
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > impactRadius) continue;

      const cell = grid.getCell(cx + dx, cy + dy);
      if (!cell) continue;

      let newAlt, newFert;

      if (dist <= islandRadius) {
        // Île centrale : débris éjectés re-déposés
        const factor = 1 - dist / islandRadius;
        newAlt  = Math.min(100, seaLevel + 8 + Math.round(factor * 28));
        // Hash déterministe par position de cellule (pas de rand() séquentiel dans la boucle)
        newFert = 15 + ((Math.imul(cx + dx, 2654435761) ^ Math.imul(cy + dy, 1234567891)) >>> 0) % 35;
      } else {
        // Cratère : forcé sous le niveau de la mer
        const rimFactor = 1 - (dist - islandRadius) / (impactRadius - islandRadius);
        newAlt  = Math.max(0, Math.round(craterFloor + rimFactor * 8));
        newFert = 0;
      }

      const newTerr = getTerrainType(newAlt, cell.humidity, cell.temperature, seaLevel);
      grid.setCell(cx + dx, cy + dy, {
        ...cell,
        altitude:    newAlt,
        terrainType: newTerr,
        fertility:   newFert,
        isRiver:     false,
      });
    }
  }
}

// ─────────────────────────────────────────────────────────────
// CHAÎNE DE MONTAGNE
// Spine paramétrique : clic = centre, orientation + dimensions aléatoires.
// Longueur 25-50 cells (500-1000 px), demi-largeur 1-5 cells (50-200 px).
// Ondulation sinusoïdale le long du spine pour un relief naturel.
// ─────────────────────────────────────────────────────────────

export function applyMountainRange(grid, cx, cy, seaLevel) {
  const rand      = makePRNG(cx, cy);
  const halfLen   = 22 + Math.floor(rand() * 24);
  const halfWidth = 3  + Math.floor(rand() * 6);
  const peakBoost = 50 + Math.floor(rand() * 45);
  const angle     = rand() * Math.PI;
  const phase     = rand() * Math.PI * 2;

  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);

  // Bounding box conservatrice autour du spine
  const reach = halfLen + halfWidth + 2;

  for (let dy = -reach; dy <= reach; dy++) {
    for (let dx = -reach; dx <= reach; dx++) {
      const cell = grid.getCell(cx + dx, cy + dy);
      if (!cell) continue;

      // Coordonnées dans le repère (spine, perpendiculaire)
      const s =  dx * cosA + dy * sinA;   // le long du spine
      const p = -dx * sinA + dy * cosA;   // perpendiculaire au spine

      // Hors des bornes → ignore
      if (Math.abs(s) > halfLen)   continue;
      if (Math.abs(p) > halfWidth) continue;

      // Facteur le long du spine : 1 au centre, s'efface aux extrémités (cosinus)
      const lenFactor = Math.cos((s / halfLen) * (Math.PI / 2));

      // Facteur perpendiculaire : profil en arche (cosinus)
      const widFactor = Math.cos((p / halfWidth) * (Math.PI / 2));

      // Ondulation naturelle du relief le long du spine
      const sineVar = 0.78 + 0.22 * Math.sin((s / halfLen) * Math.PI * 3 + phase);

      const factor = lenFactor * widFactor * sineVar;
      const newAlt = Math.min(100, Math.round(cell.altitude + peakBoost * factor));
      const newTerr = getTerrainType(newAlt, cell.humidity, cell.temperature, seaLevel);

      grid.setCell(cx + dx, cy + dy, {
        ...cell,
        altitude:    newAlt,
        terrainType: newTerr,
        isRiver:     cell.isRiver && newAlt >= seaLevel,
      });
    }
  }
}

// ─────────────────────────────────────────────────────────────
// RÉCHAUFFEMENT CLIMATIQUE
// Hausse de température globale, montée des eaux, légère déshydratation.
// Retourne le nouveau seaLevel.
// ─────────────────────────────────────────────────────────────

export function applyWarming(grid, seaLevel) {
  const rand        = makePRNG(seaLevel, 3);
  const rise        = 2 + Math.floor(rand() * 4);   // seaLevel +2..+5
  const tempBoost   = 4 + Math.floor(rand() * 5);   // +4..+8
  const newSeaLevel = Math.min(70, seaLevel + rise);

  for (let y = 0; y < grid.rows; y++) {
    for (let x = 0; x < grid.cols; x++) {
      const cell = grid.getCell(x, y);
      if (!cell) continue;
      const newTemp = Math.min(40, cell.temperature + tempBoost);
      const newHum  = cell.humidity > 30 ? Math.max(0, cell.humidity - 5) : cell.humidity;
      const newTerr = getTerrainType(cell.altitude, newHum, newTemp, newSeaLevel);
      grid.setCell(x, y, { ...cell, temperature: newTemp, humidity: newHum, terrainType: newTerr });
    }
  }

  return newSeaLevel;
}

// ─────────────────────────────────────────────────────────────
// PÉRIODE GLACIAIRE
// Chute de température globale, retrait des eaux, extension des glaces.
// Retourne le nouveau seaLevel.
// ─────────────────────────────────────────────────────────────

export function applyGlaciation(grid, seaLevel) {
  const rand        = makePRNG(seaLevel, 4);
  const drop        = 3 + Math.floor(rand() * 4);   // seaLevel -3..-6
  const tempDrop    = 5 + Math.floor(rand() * 5);   // -5..-9
  const newSeaLevel = Math.max(5, seaLevel - drop);

  for (let y = 0; y < grid.rows; y++) {
    for (let x = 0; x < grid.cols; x++) {
      const cell = grid.getCell(x, y);
      if (!cell) continue;
      const newTemp = Math.max(-30, cell.temperature - tempDrop);
      const newTerr = getTerrainType(cell.altitude, cell.humidity, newTemp, newSeaLevel);
      grid.setCell(x, y, { ...cell, temperature: newTemp, terrainType: newTerr });
    }
  }

  return newSeaLevel;
}

// ─────────────────────────────────────────────────────────────
// UTILS internes
// ─────────────────────────────────────────────────────────────

// PRNG déterministe — seed spatial basé sur (cx, cy).
// Utilisé à la place de Math.random() pour que le replay du geoHistory
// donne toujours exactement le même terrain.
function makePRNG(cx, cy) {
  let s = (Math.imul(cx, 73856093) ^ Math.imul(cy, 19349663)) >>> 0 || 1;
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return (s >>> 0) / 0x100000000; // [0, 1)
  };
}

function traceRiver(grid, startX, startY, seaLevel) {
  let x = startX, y = startY;
  const visited = new Set();

  for (let step = 0; step < 250; step++) {
    const key = `${x},${y}`;
    if (visited.has(key)) break;
    visited.add(key);

    const cell = grid.getCell(x, y);
    if (!cell || cell.altitude < seaLevel || cell.terrainType === 'eau') break;
    if (cell.isRiver) break;

    grid.setCell(x, y, { ...cell, terrainType: 'riviere', isRiver: true });

    const neighbors = [];
    for (const [dx, dy] of [[-1,0],[1,0],[0,-1],[0,1]]) {
      const n = grid.getCell(x + dx, y + dy);
      if (n && !visited.has(`${n.x},${n.y}`)) neighbors.push(n);
    }
    if (neighbors.length === 0) break;

    neighbors.sort((a, b) => a.altitude - b.altitude);
    const next = neighbors[0];
    if (next.altitude > cell.altitude + 14) break;

    x = next.x;
    y = next.y;
  }
}
