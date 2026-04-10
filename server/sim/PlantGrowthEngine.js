import { ADNHandler, mutationADN } from './ADNPlante.js';
import {
  readTraits, getMinTemp, getMaxTemp, getMinHumidity, getMaxHumidity,
  getMaxAge, getGrainePortee, getMaxHeight, getGrowthDelay,
} from './PlantADN.js';
import { CELL_TYPES, createPlant, FLOWER_LIFESPAN, FRUIT_LIFESPAN, DEAD_CLEANUP_AGE, makeFlowerId, makeFruitId } from './PlantModel.js';

// 4 directions cardinales — N=vers le ciel (y décroît), S=vers le sol
const DIRS = [
  { dx:  0, dy: -1, name: 'N' },
  { dx:  0, dy:  1, name: 'S' },
  { dx: -1, dy:  0, name: 'O' },
  { dx:  1, dy:  0, name: 'E' },
];

/**
 * Décide quel type de cellule crée un bourgeon dans une direction donnée,
 * en fonction des traits ADN, de la hauteur relative et de l'énergie.
 *
 * @returns {string|null} type CELL_TYPES ou null (rien)
 */
function decideGrowth(traits, relHeight, dirName, energyRatio) {
  // Vers le bas : tige de soutien ou rien
  if (dirName === 'S') {
    return traits.resistanceSec < 0.3 && relHeight < 0.1 ? CELL_TYPES.TIGE : null;
  }

  if (dirName === 'N') {
    // Proche du sommet + énergie → fleur
    if (relHeight > 0.75 && energyRatio > traits.seuilFleur) return CELL_TYPES.FLEUR;

    const v = traits.choixHaut;
    if (relHeight > 0.55) {
      // Partie haute : surtout feuilles
      if (v < 0.45) return CELL_TYPES.FEUILLE;
      if (v < 0.75) return CELL_TYPES.BOURGEON;
      return CELL_TYPES.TIGE;
    }
    // Partie basse : tige dominante
    if (v < 0.20) return CELL_TYPES.FEUILLE;
    if (v < 0.88) return CELL_TYPES.TIGE;
    return CELL_TYPES.BOURGEON;
  }

  // Latéral (O/E)
  const lateralProb = traits.largeurCouronne * 0.65;
  if (Math.random() > lateralProb) return null;

  const v = traits.choixLateral;
  if (relHeight > 0.55 && energyRatio > traits.seuilFleur * 0.85) return CELL_TYPES.FLEUR;
  if (v < 0.30) return CELL_TYPES.FEUILLE;
  if (v < 0.58) return CELL_TYPES.BRANCHE;
  if (v < 0.80) return CELL_TYPES.BOURGEON;
  return null;
}

/**
 * Moteur de croissance des plantes.
 * Fonctionne sur les objets plants mutés en place (pour performance).
 *
 * Retourne { plantsToAdd: Plant[], toClean: string[] }
 */
export default class PlantGrowthEngine {
  /**
   * @param {{ plants, grid, seaLevel, tick }} ctx
   */
  update({ plants, grid, seaLevel, tick }) {
    const plantsToAdd = [];
    const toClean     = [];  // ids de plantes à retirer définitivement

    // ── Facteur jour/nuit (heure UTC réelle) ────────────────────────
    // 0.35 à minuit → 1.0 à midi — plancher relevé pour laisser les réserves absorber la nuit
    const utcHour   = new Date().getUTCHours() + new Date().getUTCMinutes() / 60;
    const dayFactor = 0.35 + 0.65 * 0.5 * (1 + Math.cos((utcHour - 12) / 12 * Math.PI));

    // ── Index global des cases occupées par une cellule vivante ──────
    const occupied = new Map(); // `${x},${y}` → plantId
    for (const plant of plants) {
      if (!plant.alive) continue;
      for (const cell of plant.cells) {
        occupied.set(`${cell.x},${cell.y}`, plant.id);
      }
    }

    for (const plant of plants) {
      // ── Nettoyage des plantes mortes trop vieilles ───────────────
      if (!plant.alive) {
        if (plant.deadSinceTick !== null && tick - plant.deadSinceTick > DEAD_CLEANUP_AGE) {
          toClean.push(plant.id);
        }
        continue;
      }

      const handler = new ADNHandler(plant.adn);
      const traits  = readTraits(handler);
      const maxAge  = getMaxAge(traits);

      // ── Vieillissement ─────────────────────────────────────────
      plant.age++;

      // Mort par âge
      if (plant.age >= maxAge) {
        killPlant(plant, tick);
        continue;
      }

      // ── Conditions environnementales (racine) ──────────────────
      const rootCell = grid.getCell(plant.rootX, plant.rootY);
      if (!rootCell || rootCell.altitude < seaLevel) {
        killPlant(plant, tick);
        continue;
      }

      const minTemp = getMinTemp(traits);
      const maxTemp = getMaxTemp(traits);
      const minHum  = getMinHumidity(traits);
      const maxHum  = getMaxHumidity(traits);
      if (
        rootCell.temperature < minTemp || rootCell.temperature > maxTemp ||
        rootCell.humidity    < minHum  || rootCell.humidity    > maxHum
      ) {
        killPlant(plant, tick);
        continue;
      }

      // ── Photosynthèse (gain d'énergie) ─────────────────────────
      const leaves = plant.cells.filter(c =>
        c.type === CELL_TYPES.FEUILLE || c.type === CELL_TYPES.BOURGEON || c.type === CELL_TYPES.BRANCHE
      );
      const tempFact = 0.8 - Math.abs(rootCell.temperature - (minTemp + maxTemp) / 2) / ((maxTemp - minTemp) / 2);
      // Lumière maximale à l'équateur (grid.rows/2), minimale aux pôles (y=0 ou y=rows)
      const equator     = grid.rows / 2;
      const lightFactor = 0.2 + (tempFact) * (1 - Math.abs(plant.rootY - equator) / equator);
      const fertilityBonus = rootCell.fertility / 100;
      const energyGain     = leaves.length * traits.photosynthese * 0.35 * lightFactor * dayFactor * fertilityBonus;
      plant.energy = Math.min(50, plant.energy + energyGain);

      // Coût d'entretien (toutes cellules)
      plant.energy -= plant.cells.length * 0.025;
      if (plant.energy < -5) {
        killPlant(plant, tick);
        continue;
      }
      if (plant.energy < 0) plant.energy = 0;

      const energyRatio = plant.energy / 25;

      // ── Croissance ─────────────────────────────────────────────
      const growthDelay = getGrowthDelay(traits);
      const canGrow     = plant.energy > 0.8 && (tick - plant.lastGrowthTick) >= growthDelay;

      if (canGrow) {
        const bourgeons = plant.cells.filter(c => c.type === CELL_TYPES.BOURGEON);

        if (bourgeons.length > 0) {
          const maxH   = getMaxHeight(traits);
          // Choisit un bourgeon aléatoire parmi les actifs
          const b = bourgeons[Math.floor(Math.random() * bourgeons.length)];
          const relH = Math.max(0, Math.min(1, (plant.rootY - b.y) / maxH));

          let grew = false;
          // Mélange les directions pour éviter les biais
          const shuffledDirs = [...DIRS].sort(() => Math.random() - 0.5);

          for (const dir of shuffledDirs) {
            const nx = b.x + dir.dx;
            const ny = b.y + dir.dy;
            const key = `${nx},${ny}`;
            if (occupied.has(key)) continue;

            const nc = grid.getCell(nx, ny);
            if (!nc || nc.altitude < seaLevel) continue;
            if (nc.terrainType === 'eau' || nc.terrainType === 'glace') continue;

            // Plafond de hauteur
            if (plant.rootY - ny > maxH) continue;

            const cellType = decideGrowth(traits, relH, dir.name, energyRatio);
            if (!cellType) continue;

            if (cellType === CELL_TYPES.FLEUR) {
              // La fleur va dans plant.flowers, pas plant.cells
              plant.flowers.push({ id: makeFlowerId(), x: nx, y: ny, age: 0, likes: 0 });
              // La case n'est pas "occupée" (les fleurs peuvent coexister visuellement)
            } else {
              plant.cells.push({ x: nx, y: ny, type: cellType, age: 0 });
              occupied.set(key, plant.id);
            }

            plant.energy -= 0.6;
            plant.lastGrowthTick = tick;
            grew = true;
            break;
          }

          // Bourgeon bloqué → devient feuille
          if (!grew) {
            b.type = CELL_TYPES.FEUILLE;
          }

        } else if (plant.cells.length === 1) {
          // Toute jeune plante (juste la racine) : lance le premier bourgeon
          const initY = plant.rootY - 1;
          const key   = `${plant.rootX},${initY}`;
          if (!occupied.has(key)) {
            const nc = grid.getCell(plant.rootX, initY);
            if (nc && nc.altitude >= seaLevel && nc.terrainType !== 'eau' && nc.terrainType !== 'glace') {
              plant.cells.push({ x: plant.rootX, y: initY, type: CELL_TYPES.BOURGEON, age: 0 });
              occupied.set(key, plant.id);
              plant.lastGrowthTick = tick;
            }
          }
        }

        // ── Floraison spontanée si énergie haute ─────────────────
        if (
          plant.energy > 14 &&
          traits.seuilFleur < 0.55 &&
          plant.flowers.length < 6 &&
          plant.cells.length >= 4
        ) {
          const candidates = plant.cells.filter(c =>
            c.type === CELL_TYPES.FEUILLE || c.type === CELL_TYPES.BRANCHE
          );
          if (candidates.length > 0) {
            const f = candidates[Math.floor(Math.random() * candidates.length)];
            plant.flowers.push({ id: makeFlowerId(), x: f.x, y: f.y - 1, age: 0, likes: 0 });
            plant.energy -= 2.5;
          }
        }
      }

      // ── Vieillissement des cellules ────────────────────────────
      for (const cell of plant.cells) cell.age++;

      // ── Cycle des fleurs → fruits ──────────────────────────────
      const newlyDead = plant.flowers.filter(fl => fl.age >= FLOWER_LIFESPAN);
      plant.flowers   = plant.flowers.filter(fl => fl.age < FLOWER_LIFESPAN);

      for (const fl of newlyDead) {
        fl.age++;
      }
      // Incrémente l'âge de toutes les fleurs vivantes
      for (const fl of plant.flowers) fl.age++;

      // Fleur morte → fruit
      for (const fl of newlyDead) {
        const likeFitness = fl.likes > 0 ? 0.97 - fl.likes * 0.1 : 1; // mutation réduite si likée
        const childAdn = mutationADN(plant.adn, likeFitness * 0.05 + 0.005);
        plant.fruits.push({
          id: makeFruitId(),
          x: fl.x, y: fl.y, age: 0,
          adnChild: childAdn,
          parentLikes: plant.likes,
        });
      }

      // ── Cycle des fruits → graines ─────────────────────────────
      for (const fr of plant.fruits) fr.age++;
      const ripeFruits = plant.fruits.filter(fr => fr.age >= FRUIT_LIFESPAN);
      plant.fruits     = plant.fruits.filter(fr => fr.age < FRUIT_LIFESPAN);

      for (const fr of ripeFruits) {
        const portee     = getGrainePortee(traits);
        const candidates = [];

        for (let dy = -portee; dy <= portee; dy++) {
          for (let dx = -portee; dx <= portee; dx++) {
            if (Math.sqrt(dx * dx + dy * dy) > portee) continue;
            const tx = fr.x + dx, ty = fr.y + dy;
            if (occupied.has(`${tx},${ty}`)) continue;
            const tc = grid.getCell(tx, ty);
            if (!tc || tc.altitude < seaLevel || tc.fertility < 8) continue;
            if (tc.terrainType === 'eau' || tc.terrainType === 'glace') continue;
            candidates.push(tc);
          }
        }

        if (candidates.length > 0) {
          const tc = candidates[Math.floor(Math.random() * candidates.length)];
          // Les plantes avec plus de likes ont plus de chances de dissémer
          const likeBonus = Math.min(3, plant.likes);
          if (Math.random() < 0.5 + likeBonus * 0.2) {
            plantsToAdd.push(createPlant(tc.x, tc.y, fr.adnChild, plant.id, fr.parentLikes));
          }
        }
      }
    }

    // ── Phase d'empoisonnement ───────────────────────────────────────────────
    // Les empoisonneurs (poisonChance > 0.5) infligent des dégâts aux plantes
    // voisines de type différent. Immunité : même poisonType OU antidote correspondant.
    const POISON_DAMAGE = 10; // énergie retirée par empoisonneur par tick

    const poisoners = [];
    for (const p of plants) {
      if (!p.alive) continue;
      const t = readTraits(new ADNHandler(p.adn));
      if (t.poisonChance <= 0.5) continue;
      poisoners.push({ rootX: p.rootX, rootY: p.rootY, type: t.poisonType, range: t.poisonRange });
    }

    if (poisoners.length > 0) {
      for (const victim of plants) {
        if (!victim.alive) continue;
        const vt = readTraits(new ADNHandler(victim.adn));
        let dmg = 0;
        for (const pois of poisoners) {
          // Immune si même type de poison (producteurs alliés) ou antidote correspondant
          if (vt.poisonType === pois.type || vt.antidote === pois.type) continue;
          const dx = victim.rootX - pois.rootX;
          const dy = victim.rootY - pois.rootY;
          if (dx * dx + dy * dy <= pois.range * pois.range) dmg += POISON_DAMAGE;
        }
        if (dmg > 0) {
          victim.energy -= dmg;
          if (victim.energy < 0) killPlant(victim, tick);
        }
      }
    }

    return { plantsToAdd, toClean };
  }
}

function killPlant(plant, tick) {
  plant.alive = false;
  plant.deadSinceTick = tick;
  plant.flowers = [];
  plant.fruits  = [];
  for (const c of plant.cells) {
    if (c.type !== CELL_TYPES.RACINE) c.type = CELL_TYPES.BOIS;
  }
}
