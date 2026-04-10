/**
 * Carbonifère 14 — Serveur de simulation autonome — 3 mondes en parallèle
 *
 * Lance : node c14-server.mjs
 * Ou en daemon : pm2 start c14-server.mjs --name c14
 */

import PocketBase from 'pocketbase';

import generateWorld, { DEFAULT_SEA_LEVEL } from './sim/WorldGenerator.js';
import { GRID_COLS, GRID_ROWS } from './sim/WorldGrid.js';
import PlantGrowthEngine from './sim/PlantGrowthEngine.js';
import { createPlant, DEAD_CLEANUP_AGE, FLOWER_LIFESPAN, FRUIT_LIFESPAN } from './sim/PlantModel.js';
import { randomGenome } from './sim/ADNPlante.js';
import { applyCommand, GEO_EVENTS } from './sim/GeoEvents.js';

// ── Config ────────────────────────────────────────────────────────────────────

const PB_URL         = process.env.PB_URL ?? 'http://pocketbase:8090';
const COL            = 'carbonifere14';
const LIKES_COL      = 'carbonifere14_likes';
const CMDS_COL       = 'carbonifere14_commands';
const TICK_MS        = 10_000;
const SAVE_EVERY     = 6;
const MAX_PLANTS     = 2500;
const INITIAL_PLANTS = 80;

// ── Définition des mondes ─────────────────────────────────────────────────────
// Modifier les noms ici sans toucher PocketBase.

const WORLD_DEFS = [
  { id: 'pangee',   name: 'Dagobah'   },
  { id: 'gondwana', name: 'Endor' },
  { id: 'laurasie', name: 'Tatooine' },
];
// ── État global ───────────────────────────────────────────────────────────────

const pb     = new PocketBase(PB_URL);
const engine = new PlantGrowthEngine();

function makeWorldState(def) {
  return {
    id:              def.id,
    name:            def.name,
    grid:            null,
    plants:          [],
    tick:            0,
    worldSeed:       null,
    seaLevel:        DEFAULT_SEA_LEVEL,
    geoHistory:      [],
    recordId:        null,
    lastLikeSyncISO: null,
    lastCmdSyncISO:  null,
  };
}

const worlds = WORLD_DEFS.map(makeWorldState);

// ── Codec ADN ─────────────────────────────────────────────────────────────────

function encodeADN(adn) {
  return adn.map(c => c.join('')).join('');
}

function decodeADN(str) {
  const result = [];
  for (let i = 0; i + 4 <= str.length; i += 4) {
    result.push(str.slice(i, i + 4).split(''));
  }
  return result;
}

function encodePlant(plant) {
  return {
    ...plant,
    adn:    encodeADN(plant.adn),
    fruits: plant.fruits.map(fr => ({ ...fr, adnChild: encodeADN(fr.adnChild) })),
  };
}

function decodePlant(data) {
  const adn = typeof data.adn === 'string' ? decodeADN(data.adn) : data.adn;
  return {
    ...data,
    adn,
    fruits: (data.fruits || []).map(fr => ({
      ...fr,
      adnChild: typeof fr.adnChild === 'string' ? decodeADN(fr.adnChild) : fr.adnChild,
    })),
  };
}

// ── PocketBase helpers ────────────────────────────────────────────────────────

async function loadWorldState(w) {
  try {
    const result = await pb.collection(COL).getList(1, 1, {
      sort: '-updated', filter: `worldId = "${w.id}"`, requestKey: null,
    });
    if (!result.items.length) return null;
    const rec = result.items[0];
    w.recordId = rec.id;
    return {
      worldSeed:      rec.worldSeed,
      tick:           rec.tick,
      seaLevel:       rec.seaLevel || DEFAULT_SEA_LEVEL,
      geoHistory:     rec.geoHistory || [],
      plants:         (rec.plants || []).map(decodePlant),
      lastCmdSyncISO: rec.lastCmdSyncISO || null,
    };
  } catch (e) {
    console.error(`[C14:${w.id}] loadState error:`, e?.message);
    return null;
  }
}

async function saveWorldState(w) {
  // On ne sauvegarde que les plantes vivantes — les mortes sont cosmétiques
  const plantsToSave = w.plants.filter(p => p.alive);
  const plantsData = plantsToSave.map(p => encodePlant({
    ...p,
    // On retire les cellules bois (cosmétiques) pour réduire la taille du payload
    cells: p.cells.filter(c => c.type !== 'bois'),
  }));

  const data = {
    worldId: w.id,
    worldSeed: w.worldSeed,
    tick: w.tick,
    seaLevel: w.seaLevel,
    geoHistory: w.geoHistory,
    plants: plantsData,
    lastCmdSyncISO: w.lastCmdSyncISO ?? null,
  };

  try {
    if (w.recordId) {
      await pb.collection(COL).update(w.recordId, data, { requestKey: null });
    } else {
      const created = await pb.collection(COL).create(data, { requestKey: null });
      w.recordId = created.id;
    }
    if(plantsToSave.length==0) 
      console.log(`[C14:${w.id}] tick ${w.tick} saved — ${plantsToSave.length} vivantes, seaLevel ${w.seaLevel}`);
  } catch (e) {
    console.error(`[C14:${w.id}] saveState error:`, e?.message);
    if (e?.data)   console.error(`[C14:${w.id}] details:`, JSON.stringify(e.data));
    if (e?.status) console.error(`[C14:${w.id}] status:`, e.status);
  }
}

async function applyPendingLikes(w) {
  try {
    const filter = [
      `worldId = "${w.id}"`,
      w.lastLikeSyncISO ? `created > "${w.lastLikeSyncISO}"` : '',
    ].filter(Boolean).join(' && ');

    const result = await pb.collection(LIKES_COL).getList(1, 500, {
      sort: 'created', filter, requestKey: null,
    });
    if (!result.items.length) return;

    w.lastLikeSyncISO = result.items.at(-1).created;
    const plantMap = new Map(w.plants.map(p => [p.id, p]));

    for (const item of result.items) {
      const plant = plantMap.get(item.plantId);
      if (!plant || !plant.alive) continue;
      const fl = plant.flowers.find(f => f.id === item.flowerId);
      if (fl) fl.likes = (fl.likes || 0) + 1;
      plant.likes = (plant.likes || 0) + 1;
    }
    console.log(`[C14:${w.id}] ${result.items.length} like(s) appliqué(s)`);
  } catch (e) {
    console.warn(`[C14:${w.id}] applyPendingLikes error:`, e?.message);
  }
}

async function applyPendingCommands(w) {
  const filter = [
    `worldId = "${w.id}"`,
    w.lastCmdSyncISO ? `created > "${w.lastCmdSyncISO}"` : '',
  ].filter(Boolean).join(' && ');

  try {
    const result = await pb.collection(CMDS_COL).getList(1, 50, {
      sort: 'created', filter, requestKey: null,
    });
    if (!result.items.length) return;

    w.lastCmdSyncISO = result.items.at(-1).created;

    for (const cmd of result.items) {
      console.log(`[C14:${w.id}] GeoEvent "${cmd.type}" cellX=${cmd.cellX} cellY=${cmd.cellY}`);
      if (cmd.type === GEO_EVENTS.DIVERSIFICATION) {
        const newPlants = spawnDiversification(w.grid, w.plants, w.seaLevel);
        w.plants.push(...newPlants);
        console.log(`[C14:${w.id}] Diversification — ${newPlants.length} nouvelles plantes`);
      } else if (cmd.type === GEO_EVENTS.DISEASE) {
        const { killed, radius } = applyDisease(w.plants, cmd.cellX, cmd.cellY, w.tick);
        console.log(`[C14:${w.id}] Maladie — rayon ${radius}, ${killed} plantes éliminées`);
      } else if (cmd.type === GEO_EVENTS.FECOND_FLOWER) {
        const plant = w.plants.find(p => p.id === cmd.plantId && p.alive);
        if (plant) {
          const fl = plant.flowers.find(f => f.id === cmd.itemId);
          if (fl) { fl.age = FLOWER_LIFESPAN; console.log(`[C14:${w.id}] Fécondation fleur ${cmd.itemId}`); }
        }
      } else if (cmd.type === GEO_EVENTS.GERME_FRUIT) {
        const plant = w.plants.find(p => p.id === cmd.plantId && p.alive);
        if (plant) {
          const fr = plant.fruits.find(f => f.id === cmd.itemId);
          if (fr) { fr.age = FRUIT_LIFESPAN; console.log(`[C14:${w.id}] Germination fruit ${cmd.itemId}`); }
        }
      } else {
        w.seaLevel = applyCommand(w.grid, w.seaLevel, cmd.type, cmd.cellX ?? null, cmd.cellY ?? null);
        w.geoHistory.push({ type: cmd.type, cellX: cmd.cellX ?? null, cellY: cmd.cellY ?? null });
      }
    }

    await saveWorldState(w);
  } catch (e) {
    console.error(`[C14:${w.id}] applyPendingCommands error:`, e?.message);
  }
}

// ── Maladie — désherbe un rayon aléatoire autour du point cliqué ─────────────

function applyDisease(plants, cx, cy, tick) {
  // PRNG déterministe identique à GeoEvents.js
  let s = (Math.imul(cx, 73856093) ^ Math.imul(cy, 19349663)) >>> 0 || 1;
  const rand = () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return (s >>> 0) / 0x100000000; };

  const radius = 5 + Math.floor(rand() * 21); // 20–100 cellules
  let killed = 0;
  for (const plant of plants) {
    if (!plant.alive) continue;
    const dx = plant.rootX - cx;
    const dy = plant.rootY - cy;
    if (dx * dx + dy * dy <= radius * radius) {
      plant.alive = false;
      plant.deadSinceTick = tick;
      killed++;
    }
  }
  return { killed, radius };
}

// ── Diversification — 20 nouvelles plantes à génome aléatoire ────────────────

function spawnDiversification(grid, plants, sl) {
  const occupied = new Set(plants.filter(p => p.alive).map(p => `${p.x},${p.y}`));
  const candidates = [];
  for (let y = 2; y < grid.rows - 2; y++) {
    for (let x = 2; x < grid.cols - 2; x++) {
      const c = grid.getCell(x, y);
      if (!c || c.altitude < sl) continue;
      if (c.terrainType === 'eau' || c.terrainType === 'glace') continue;
      if (c.fertility < 10) continue;
      if (occupied.has(`${x},${y}`)) continue;
      candidates.push(c);
    }
  }
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  return candidates.slice(0, 50).map(c => createPlant(c.x, c.y, randomGenome(100)));
}

// ── Génération initiale des plantes ──────────────────────────────────────────

function seedInitialPlants(grid, sl) {
  const candidates = [];
  for (let y = 2; y < grid.rows - 2; y++) {
    for (let x = 2; x < grid.cols - 2; x++) {
      const c = grid.getCell(x, y);
      if (!c || c.altitude < sl) continue;
      if (c.terrainType === 'eau' || c.terrainType === 'glace') continue;
      if (c.fertility < 15) continue;
      candidates.push(c);
    }
  }
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  return candidates.slice(0, INITIAL_PLANTS).map(c =>
    createPlant(c.x, c.y, randomGenome(100))
  );
}

// ── Tick par monde ────────────────────────────────────────────────────────────

async function tickWorld(w) {
  await applyPendingCommands(w);
  await applyPendingLikes(w);

  const { plantsToAdd, toClean } = engine.update({
    plants: w.plants, grid: w.grid, seaLevel: w.seaLevel, tick: w.tick,
  });

  const cleanSet = new Set(toClean);
  w.plants = w.plants.filter(p => !cleanSet.has(p.id));
  w.plants.push(...plantsToAdd);

  if (w.plants.length > MAX_PLANTS) {
    const alive = w.plants.filter(p => p.alive);
    const dead  = w.plants.filter(p => !p.alive)
      .sort((a, b) => (b.deadSinceTick ?? 0) - (a.deadSinceTick ?? 0));
    w.plants = [...alive, ...dead.slice(0, Math.max(0, MAX_PLANTS - alive.length))];
  }

  w.tick++;

  if (w.tick % SAVE_EVERY === 0) {
    await saveWorldState(w);
  }
}

async function runTick() {
  for (const w of worlds) {
    await tickWorld(w);
  }
}

// ── Initialisation d'un monde ─────────────────────────────────────────────────

async function initWorld(w) {
  const saved = await loadWorldState(w);

  if (saved && saved.plants && saved.plants.length > 0) {
    w.worldSeed       = saved.worldSeed;
    w.tick            = saved.tick;
    w.plants          = saved.plants;
    w.seaLevel        = saved.seaLevel;
    w.geoHistory      = saved.geoHistory;
    w.lastCmdSyncISO  = saved.lastCmdSyncISO;
    w.grid       = generateWorld(GRID_COLS, GRID_ROWS, w.worldSeed);

    let sl = DEFAULT_SEA_LEVEL;
    for (const cmd of w.geoHistory) {
      sl = applyCommand(w.grid, sl, cmd.type, cmd.cellX ?? null, cmd.cellY ?? null);
    }
    console.log(`[C14:${w.id}] restauré — seed ${w.worldSeed}, tick ${w.tick}, ${w.geoHistory.length} geoEvents, ${w.plants.filter(p=>p.alive).length} vivantes`);
  } else {
    w.worldSeed = Math.floor(Math.random() * 100000);
    w.grid      = generateWorld(GRID_COLS, GRID_ROWS, w.worldSeed);
    w.plants    = seedInitialPlants(w.grid, w.seaLevel);
    w.tick      = 0;
    console.log(`[C14:${w.id}] nouveau monde — seed ${w.worldSeed}, ${w.plants.length} plantes initiales`);
    await saveWorldState(w);
  }
}

// ── Démarrage ─────────────────────────────────────────────────────────────────

async function main() {
  console.log(`[C14] Démarrage — ${worlds.length} monde(s)…`);

  for (const w of worlds) {
    await initWorld(w);
  }

  setInterval(runTick, TICK_MS);
  console.log(`[C14] Simulation active — tick toutes les ${TICK_MS / 1000}s`);
}

main().catch(e => {
  console.error('[C14] Erreur fatale:', e);
  process.exit(1);
});
