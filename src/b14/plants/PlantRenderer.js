import { ADNHandler } from '../../genetic/ADNPlante';
import { readTraits, getNombrePetales } from './PlantADN';
import { CELL_TYPES } from './PlantModel';

const DEFAULT_CS = 50;

// Cache traits par plantId — l'ADN ne change jamais pendant la vie d'une plante
const _traitsCache = new Map();
function getTraits(plant) {
  if (!_traitsCache.has(plant.id)) {
    _traitsCache.set(plant.id, readTraits(new ADNHandler(plant.adn)));
  }
  return _traitsCache.get(plant.id);
}

// ── Silhouette unifiée ────────────────────────────────────────────────────────
//
// Principe : pour chaque plante, on dessine d'abord un fond semi-transparent
// sur chaque cellule, puis un contour sur les arêtes exposées (= côtés qui
// n'ont pas de cellule voisine de la même plante). Résultat : l'organisme
// apparaît comme un tout, pas comme une collection de formes détachées.

function drawPlantSilhouette(ctx, plant, traits, cs) {
  const liveCells = plant.cells.filter(c => c.type !== CELL_TYPES.BOIS);
  if (liveCells.length === 0) return;

  const cellSet    = new Set(liveCells.map(c => `${c.x},${c.y}`));
  const isPoisoner = traits?.poisonChance > 0.5;
  const isAlbinos  = traits?.rareType === 2;
  const hue = isAlbinos  ? 0
    : isPoisoner ? Math.round(270 + (traits.poisonType - 1) / 9 * 60)
    : (traits ? Math.round(traits.teinte * 360) : 120);
  const E   = 1.5; // expansion du contour vers l'extérieur (px)

  // 1. Fond translucide sur chaque cellule — crée la masse visuelle
  ctx.fillStyle = isAlbinos  ? `hsla(0, 0%, 95%, 0.16)`
    : isPoisoner ? `hsla(${hue}, 70%, 30%, 0.22)`
    : `hsla(${hue}, 55%, 32%, 0.13)`;
  for (const cell of liveCells) {
    ctx.fillRect(cell.x * cs, cell.y * cs, cs, cs);
  }

  // 2. Contour sur les arêtes exposées
  ctx.strokeStyle = isAlbinos  ? `hsla(0, 0%, 88%, 0.60)`
    : isPoisoner ? `hsla(${hue}, 75%, 52%, 0.78)`
    : `hsla(${hue}, 60%, 48%, 0.52)`;
  ctx.lineWidth = isPoisoner ? 2.8 : isAlbinos ? 2.0 : 2.2;
  ctx.lineCap     = 'round';
  ctx.lineJoin    = 'round';
  ctx.beginPath();

  for (const cell of liveCells) {
    const x = cell.x * cs;
    const y = cell.y * cs;

    // Arête haute
    if (!cellSet.has(`${cell.x},${cell.y - 1}`)) {
      ctx.moveTo(x - E,      y - E);
      ctx.lineTo(x + cs + E, y - E);
    }
    // Arête basse
    if (!cellSet.has(`${cell.x},${cell.y + 1}`)) {
      ctx.moveTo(x - E,      y + cs + E);
      ctx.lineTo(x + cs + E, y + cs + E);
    }
    // Arête gauche
    if (!cellSet.has(`${cell.x - 1},${cell.y}`)) {
      ctx.moveTo(x - E, y - E);
      ctx.lineTo(x - E, y + cs + E);
    }
    // Arête droite
    if (!cellSet.has(`${cell.x + 1},${cell.y}`)) {
      ctx.moveTo(x + cs + E, y - E);
      ctx.lineTo(x + cs + E, y + cs + E);
    }
  }

  ctx.stroke();
}

// ── Détail des cellules ───────────────────────────────────────────────────────

function drawStructCell(ctx, cell, traits, cs, windT = 0) {
  const px = cell.x * cs;
  const py = cell.y * cs;
  const r  = cs / 2;
  ctx.save();
  ctx.translate(px + r, py + r);

  switch (cell.type) {

    case CELL_TYPES.RACINE: {
      // Croix claire — forme reconnaissable, point d'ancrage visible
      const arm  = cs * 0.36;
      const thick = cs * 0.14;
      ctx.fillStyle = 'rgba(100, 62, 22, 0.92)';
      // Barre verticale
      ctx.beginPath();
      ctx.roundRect(-thick / 2, -arm, thick, arm * 2, thick / 2);
      ctx.fill();
      // Barre horizontale
      ctx.beginPath();
      ctx.roundRect(-arm, -thick / 2, arm * 2, thick, thick / 2);
      ctx.fill();
      // Petit cercle central
      ctx.fillStyle = 'rgba(140, 90, 35, 0.80)';
      ctx.beginPath();
      ctx.arc(0, 0, thick * 0.85, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case CELL_TYPES.TIGE: {
      const w = cs * 0.18;
      ctx.fillStyle = 'rgba(65, 105, 32, 0.90)';
      ctx.beginPath();
      ctx.roundRect(-w / 2, -r * 0.94, w, cs * 0.94, w / 2);
      ctx.fill();
      break;
    }

    case CELL_TYPES.BRANCHE: {
      // Fine barre horizontale
      const w = cs * 0.11;
      ctx.fillStyle = 'rgba(82, 122, 40, 0.84)';
      ctx.beginPath();
      ctx.roundRect(-r * 0.90, -w / 2, cs * 0.90, w, w / 2);
      ctx.fill();
      break;
    }

    case CELL_TYPES.FEUILLE: {
      const isAlbinos = traits?.rareType === 2;
      // Grande feuille qui déborde de la cellule, transparente
      const hue = isAlbinos ? 0 : (traits ? Math.round(82 + traits.teinte * 68) : 110);
      // Chaque feuille a sa propre phase (position), le vent est commun à toute la frame
      const phase = (cell.x * 2.7 + cell.y * 1.3) % (Math.PI * 2);
      const amp   = 0.07 + (traits?.teinte ?? 0.5) * 0.5;
      const angle = Math.sin(windT + phase) * amp;

      ctx.rotate(angle);

      // Corps de la feuille — déborde de ~30% sur les côtés
      ctx.fillStyle = isAlbinos ? `hsla(0, 0%, 94%, 0.70)` : `hsla(${hue}, 62%, 40%, 0.62)`;
      ctx.beginPath();
      ctx.ellipse(0, -r * 0.18, cs * 0.46, cs * 0.68, 0, 0, Math.PI * 2);
      ctx.fill();

      // Reflet clair au-dessus
      ctx.fillStyle = isAlbinos ? `hsla(0, 0%, 100%, 0.30)` : `hsla(${hue + 10}, 55%, 65%, 0.22)`;
      ctx.beginPath();
      ctx.ellipse(-cs * 0.08, -r * 0.35, cs * 0.20, cs * 0.28, -0.3, 0, Math.PI * 2);
      ctx.fill();

      // Nervure centrale
      ctx.strokeStyle = isAlbinos ? `rgba(190, 190, 210, 0.40)` : `hsla(${hue + 12}, 48%, 25%, 0.50)`;
      ctx.lineWidth   = 1.0;
      ctx.beginPath();
      ctx.moveTo(0, r * 0.45);
      ctx.lineTo(0, -r * 0.82);
      ctx.stroke();

      // Nervures secondaires
      if (!isAlbinos) {
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = `hsla(${hue + 8}, 42%, 28%, 0.30)`;
        for (let i = -1; i <= 1; i += 2) {
          ctx.beginPath();
          ctx.moveTo(0, -r * 0.15);
          ctx.lineTo(i * cs * 0.28, -r * 0.55);
          ctx.stroke();
        }
      }
      break;
    }

    case CELL_TYPES.BOURGEON: {
      ctx.fillStyle = 'rgba(55, 195, 55, 0.78)';
      // Petit ovale pointu vers le haut
      ctx.beginPath();
      ctx.ellipse(0, -r * 0.42, cs * 0.11, cs * 0.17, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(120, 240, 80, 0.50)';
      ctx.beginPath();
      ctx.arc(-cs * 0.04, -r * 0.50, cs * 0.05, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case CELL_TYPES.BOIS: {
      const w = cs * 0.09;
      ctx.fillStyle = 'rgba(75, 48, 20, 0.32)';
      ctx.fillRect(-w / 2, -r * 0.78, w, cs * 0.78);
      break;
    }

    default: break;
  }

  ctx.restore();
}

// ── Fruit ─────────────────────────────────────────────────────────────────────

export function drawFruit(ctx, fruit, traits, cs) {
  const cx     = fruit.x * cs + cs / 2;
  const cy     = fruit.y * cs + cs * 0.40;
  const hue    = traits ? Math.round(traits.teinte * 40) : 10;
  const radius = cs * (0.21 + (traits?.tailleFruit ?? 0.5) * 0.42); // 0.21..0.63 → x1..x3

  ctx.save();
  ctx.translate(cx, cy);

  // Corps du fruit
  ctx.fillStyle = `hsla(${hue}, 82%, 38%, 0.92)`;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  // Reflet
  ctx.fillStyle = `hsla(${hue + 20}, 70%, 72%, 0.35)`;
  ctx.beginPath();
  ctx.arc(-radius * 0.28, -radius * 0.32, radius * 0.32, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ── Fleur ADN-driven ──────────────────────────────────────────────────────────

export function drawFlower(ctx, flower, traits, cs, isSelected) {
  const cx       = flower.x * cs + cs / 2;
  const cy       = flower.y * cs + cs * 0.40;
  const rareType = traits?.rareType ?? null;

  const nPetales = getNombrePetales(traits);
  const hue      = Math.round(traits.teinte * 360);
  const sat      = Math.round(40 + traits.saturation * 60);
  const lit      = Math.round(35 + traits.luminosite * 40);
  const baseSize = cs * (0.14 + traits.tailleFleur * 0.50);
  const size     = rareType === 4 ? baseSize * 2.8 : baseSize; // géante : ×2.8

  if (isSelected) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.90)';
    ctx.lineWidth   = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 1.6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.save();
  ctx.translate(cx, cy);

  const pw   = size * (0.28 + traits.formePetale * 0.28);
  const ph   = size * (0.72 + (1 - traits.formePetale) * 0.45);
  const dist = size * 0.62;

  for (let i = 0; i < nPetales; i++) {
    const angle = (i / nPetales) * Math.PI * 2;
    ctx.save();
    // Type 3 (pétales inversés) : rotation de 180°, pétales vers l'intérieur
    ctx.rotate(rareType === 3 ? angle + Math.PI : angle);

    // Couleur selon type rare
    if (rareType === 0) {
      // Noir absolu — légère teinte de la couleur d'origine
      ctx.fillStyle = `hsla(${hue}, 14%, 6%, 0.97)`;
    } else if (rareType === 1) {
      // Bicolore — pétales alternant hue et hue+165°
      ctx.fillStyle = `hsla(${i % 2 === 0 ? hue : (hue + 165) % 360}, ${sat}%, ${lit}%, 0.92)`;
    } else if (rareType === 2) {
      // Albinos — blanc pur
      ctx.fillStyle = `hsla(0, 0%, 96%, 0.95)`;
    } else {
      ctx.fillStyle = `hsla(${hue}, ${sat}%, ${lit}%, 0.92)`;
    }

    if (rareType === 5) {
      // Pétales carrés — roundRect au lieu d'ellipse
      const sqW = size * 0.52;
      const sqH = size * 0.58;
      ctx.beginPath();
      ctx.roundRect(-sqW / 2, -dist - sqH, sqW, sqH, sqW * 0.10);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.ellipse(0, -dist, pw, ph, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Strie — uniquement pour les fleurs non-rares avec patternPetale > 0.5
    if (rareType === null && traits.patternPetale > 0.5) {
      ctx.strokeStyle = `hsla(${hue + 25}, ${sat}%, ${lit - 15}%, 0.48)`;
      ctx.lineWidth   = 0.7;
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.12);
      ctx.lineTo(0, -size * 1.08);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Centre
  let centerFill;
  if (rareType === 0) {
    centerFill = 'hsl(330, 55%, 16%)';         // rouge sombre — seule touche de couleur
  } else if (rareType === 2) {
    centerFill = 'hsl(50, 90%, 88%)';          // jaune très pâle pour albinos
  } else {
    const cHue = traits.couleurCentre < 0.33 ? 48 : 0;
    const cLit = traits.couleurCentre < 0.33 ? 87 : traits.couleurCentre < 0.66 ? 97 : 12;
    centerFill = `hsl(${cHue}, 85%, ${cLit}%)`;
  }
  ctx.fillStyle = centerFill;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.28, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  if (flower.likes > 0) {
    ctx.fillStyle    = '#FFD700';
    ctx.font         = `bold ${Math.round(cs * 0.17)}px monospace`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`♥ ${flower.likes}`, cx, cy - size - 3);
  }
}

// ── Export principal ──────────────────────────────────────────────────────────

/**
 * Dessine toutes les plantes.
 * Ordre : silhouettes toutes plantes → détails toutes plantes → fleurs.
 * (Les silhouettes d'abord évitent qu'un contour passe par-dessus les détails
 *  d'une autre plante voisine.)
 */
export function drawPlants(ctx, plants, cs = DEFAULT_CS, selectedFlowerId = null, flowerHitMap = null, fruitHitMap = null) {
  if (flowerHitMap) flowerHitMap.clear();
  if (fruitHitMap)  fruitHitMap.clear();

  // Temps de vent calculé UNE SEULE FOIS par frame — période ~4s, doux
  const windT = Date.now() / 636; // 636 ≈ 4000 / (2π)

  // Passe 1 : silhouettes (fond + contours) — toutes les plantes vivantes
  for (const plant of plants) {
    if (!plant.alive) continue;
    drawPlantSilhouette(ctx, plant, getTraits(plant), cs);
  }

  // Passe 2 : détails structurels (tiges, feuilles, etc.)
  for (const plant of plants) {
    if (!plant.alive) {
      for (const cell of plant.cells) {
        if (cell.type === CELL_TYPES.BOIS || cell.type === CELL_TYPES.RACINE) {
          drawStructCell(ctx, cell, null, cs, windT);
        }
      }
      continue;
    }
    for (const cell of plant.cells) {
      drawStructCell(ctx, cell, getTraits(plant), cs, windT);
    }
  }

  // Passe 3 : fleurs (par-dessus tout)
  for (const plant of plants) {
    if (!plant.alive) continue;
    const traits = getTraits(plant);
    for (const flower of plant.flowers) {
      drawFlower(ctx, flower, traits, cs, flower.id === selectedFlowerId);
      if (flowerHitMap) {
        flowerHitMap.set(`${flower.x},${flower.y}`, { id: flower.id, plantId: plant.id });
      }
    }
    for (const fruit of plant.fruits) {
      drawFruit(ctx, fruit, traits, cs);
      if (fruitHitMap) {
        fruitHitMap.set(`${fruit.x},${fruit.y}`, { id: fruit.id, plantId: plant.id });
      }
    }
  }

  // Les fruits ont la priorité sur les fleurs à la même position
  if (fruitHitMap && flowerHitMap) {
    for (const key of fruitHitMap.keys()) {
      flowerHitMap.delete(key);
    }
  }
}

/**
 * Hit test depuis un clic canvas (fleurs ou fruits).
 */
export function hitTestCell(clientX, clientY, canvasRect, cellSize, hitMap) {
  const cx = Math.floor((clientX - canvasRect.left) / cellSize);
  const cy = Math.floor((clientY - canvasRect.top)  / cellSize);
   const hit = hitMap.get(`${cx},${cy}`);
      if (hit) return hit;
  // for (let dy = -1; dy <= 1; dy++) {
  //   for (let dx = -1; dx <= 1; dx++) {
  //     const hit = hitMap.get(`${cx + dx},${cy + dy}`);
  //     if (hit) return hit;
  //   }
  // }
  return null;
}

/** @deprecated use hitTestCell */
export function hitTestFlower(clientX, clientY, canvasRect, cellSize, flowerHitMap) {
  return hitTestCell(clientX, clientY, canvasRect, cellSize, flowerHitMap);
}
