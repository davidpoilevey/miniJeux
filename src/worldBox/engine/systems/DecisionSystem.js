// FSM de décision pour les habitants.
//
// Priorité (ordre décroissant) :
//   1. hunger < HUNGRY  → nourriture (plante sauvage OU bâtiment nourricier du village)
//   2. energy < TIRED   → dodo dans une maison (énergie max) OU repos sur place
//   3. foi    < FOI_LOW → bâtiment culturel (statue, temple…) OU prière sur place
//   4. idle             → errance

import { BUILDINGS } from '../data/buildingData.js';

const HUNGRY          = 35;
const TIRED           = 22;
const FOI_LOW         = 35;
const REST_TICKS      = 6;   // repos sur place
const PRAYER_TICKS    = 4;   // prière sur place
const CULTIVATE_TICKS = 10;  // travail sur une ressource basse
const LOW_RESERVE     = 5;   // seuil sous lequel l'intelligence peut déclencher une culture
const EAT_DIST        = 1;   // distance de Manhattan pour déclencher une action sur place

// ── Sets de types de bâtiments utiles ───────────────────────
const FOOD_BUILDINGS = new Set(
  BUILDINGS
    .filter(b => (b.needContribution?.food_security ?? 0) > 0 || (b.needContribution?.community ?? 0) > 0)
    .map(b => b.id)
);
const SHELTER_BUILDINGS = new Set(
  BUILDINGS.filter(b => (b.needContribution?.shelter ?? 0) > 0).map(b => b.id)
);
const CULTURE_BUILDINGS = new Set(
  BUILDINGS.filter(b => (b.needContribution?.culture ?? 0) > 0).map(b => b.id)
);

const IMPASSABLE_TYPES = new Set(['eau', 'glace', 'montagne']);
const isImpassable = (cell) => !cell || IMPASSABLE_TYPES.has(cell.terrainType) || !!cell.isRiver;

function manhattan(ax, ay, bx, by) {
  return Math.abs(ax - bx) + Math.abs(ay - by);
}

// Trouve le bâtiment le plus proche dans une liste { fid, pos }[]
function nearestBuilding(list, px, py, maxRange = 0) {
  let best = null, bestD = Infinity;
  for (const b of list) {
    if (!b.pos) continue;
    const d = manhattan(px, py, b.pos.x, b.pos.y);
    if (maxRange > 0 && d > maxRange) continue;
    if (d < bestD) { bestD = d; best = { fid: b.fid, pos: b.pos, d }; }
  }
  return best;
}

// ── Harvest une ressource avec réserve ───────────────────────
// Décrémente la réserve. Détruit l'entité si épuisée.
// Retourne { depleted, newReserve } pour permettre au caller de réagir.
function harvestResource(em, rid) {
  const res = em.getComponent(rid, 'Resource');
  if (!res) return { depleted: true, newReserve: 0 };
  const newReserve = (res.reserve ?? 1) - 1;
  if (newReserve <= 0) {
    em.destroyEntity(rid);
    return { depleted: true, newReserve: 0 };
  }
  em.addComponent(rid, 'Resource', { ...res, reserve: newReserve });
  return { depleted: false, newReserve };
}

// ─────────────────────────────────────────────────────────────
export default class DecisionSystem {
  update({ em, grid }) {

    // ── Ressources sauvages comestibles (réserve > 0 implicitement) ─
    const wildFoodIds = em.query('Position', 'Resource').filter(id => {
      const res = em.getComponent(id, 'Resource');
      return ['baies','fruits','champignon','cactus','aloe','herbes','nenuphar'].includes(res?.type);
    });

    // ── Villages indexés par groupId ─────────────────────────
    const villageByGroup = {};
    for (const vid of em.query('Village')) {
      const v = em.getComponent(vid, 'Village');
      villageByGroup[v.groupId] = v;
    }

    // ── Bâtiments indexés par groupId + catégorie (un seul parcours) ──
    const buildingsByGroup = {};
    for (const bid of em.query('Position', 'Building')) {
      const bld  = em.getComponent(bid, 'Building');
      const bpos = em.getComponent(bid, 'Position');
      if (!bld || !bpos) continue;
      const entry = buildingsByGroup[bld.groupId] ??= { food: [], shelter: [], culture: [] };
      const item  = { fid: bid, pos: bpos };
      if (FOOD_BUILDINGS.has(bld.type))    entry.food.push(item);
      if (SHELTER_BUILDINGS.has(bld.type)) entry.shelter.push(item);
      if (CULTURE_BUILDINGS.has(bld.type)) entry.culture.push(item);
    }

    // ─────────────────────────────────────────────────────────
    for (const id of em.query('Position', 'Needs', 'State')) {
      const needs = em.getComponent(id, 'Needs');
      const state = em.getComponent(id, 'State');
      const pos   = em.getComponent(id, 'Position');
      const stats = em.getComponent(id, 'Stats');

      // ── En déplacement : ne pas interrompre sauf famine extrême ──
      if (state.current === 'moving' && needs.hunger > 10) continue;

      // ── Tâche communautaire (gather/return) → GatherSystem gère ──
      if (state.task?.action === 'gather' || state.task?.action === 'return') continue;

      // ── Repos sur place en cours ─────────────────────────────
      if (state.current === 'resting') {
        const timer = state.timer - 1;
        if (timer <= 0) {
          em.addComponent(id, 'Needs', { ...needs, energy: Math.min(100, needs.energy + 35) });
          em.addComponent(id, 'State', { ...state, current: 'idle', timer: 0 });
        } else {
          em.addComponent(id, 'State', { ...state, timer });
        }
        continue;
      }

      // ── Prière sur place en cours ────────────────────────────
      if (state.current === 'praying') {
        const timer = state.timer - 1;
        if (timer <= 0) {
          em.addComponent(id, 'Needs', { ...needs, foi: Math.min(100, (needs.foi ?? 50) + 12) });
          em.addComponent(id, 'State', { ...state, current: 'idle', timer: 0 });
        } else {
          em.addComponent(id, 'State', { ...state, timer });
        }
        continue;
      }

      // ── Culture d'une ressource en cours ─────────────────────
      if (state.current === 'cultivating') {
        const timer = state.timer - 1;
        if (timer <= 0) {
          // Recharge la ressource au maximum
          const rid = state.task;
          const res = rid ? em.getComponent(rid, 'Resource') : null;
          if (res) em.addComponent(rid, 'Resource', { ...res, reserve: res.maxReserve ?? 20 });
          em.addComponent(id, 'State', { ...state, current: 'idle', timer: 0, task: null });
        } else {
          em.addComponent(id, 'State', { ...state, timer });
        }
        continue;
      }

      const group      = em.getComponent(id, 'Group');
      const village    = group ? villageByGroup[group.groupId] : null;
      const bldgs      = group ? (buildingsByGroup[group.groupId] ?? { food: [], shelter: [], culture: [] }) : { food: [], shelter: [], culture: [] };
      const perception = stats?.perception ?? 50;
      const range      = 6 + Math.floor(perception / 10);

      // ── 1. FAIM ───────────────────────────────────────────────
      if (needs.hunger < HUNGRY) {
        let best = null, bestD = Infinity;

        // Plantes sauvages dans le rayon de perception
        for (const fid of wildFoodIds) {
          const fp = em.getComponent(fid, 'Position');
          if (!fp) continue;
          const d = manhattan(pos.x, pos.y, fp.x, fp.y);
          if (d <= range && d < bestD) { bestD = d; best = { fid, pos: fp, d }; }
        }

        // Bâtiments nourriciers du village
        if (village && (village.stockpile?.nourriture ?? 0) > 0) {
          const b = nearestBuilding(bldgs.food, pos.x, pos.y, range * 2);
          if (b && b.d < bestD) best = b;
        }

        if (best) {
          if (best.d <= EAT_DIST) {
            if (em.getComponent(best.fid, 'Building')) {
              // Réserves du village
              if (village && (village.stockpile?.nourriture ?? 0) > 0) {
                village.stockpile.nourriture = Math.max(0, village.stockpile.nourriture - 2);
                em.addComponent(id, 'Needs', { ...needs, hunger: Math.min(100, needs.hunger + 40) });
                em.addComponent(id, 'State', { ...state, current: 'idle', target: null, task: null });
              }
            } else {
              // Plante sauvage — harvest avec réserve
              em.addComponent(id, 'Needs', { ...needs, hunger: Math.min(100, needs.hunger + 45) });
              const { depleted, newReserve } = harvestResource(em, best.fid);

              // Test intelligence : cultiver si réserve basse et ressource encore vivante
              if (!depleted && newReserve <= LOW_RESERVE &&
                  Math.random() < (stats?.intelligence ?? 50) / 100) {
                em.addComponent(id, 'State', {
                  ...state, current: 'cultivating', timer: CULTIVATE_TICKS, task: best.fid,
                });
              } else {
                em.addComponent(id, 'State', { ...state, current: 'idle', target: null, task: null });
              }
            }
          } else {
            em.addComponent(id, 'State', { ...state, current: 'moving', target: best.pos, task: best.fid });
          }
          continue; // nourriture trouvée, géré — ne pas tomber dans énergie/foi
        }

        // Pas de nourriture dans le rayon → errance large pour chercher
        if (state.current === 'idle') {
          const searchRadius = 12 + Math.floor(perception / 8);
          const tx = Math.max(0, Math.min(grid.cols - 1,
            pos.x + Math.floor((Math.random() - 0.5) * searchRadius * 2)));
          const ty = Math.max(0, Math.min(grid.rows - 1,
            pos.y + Math.floor((Math.random() - 0.5) * searchRadius * 2)));
          const cell = grid.getCell(tx, ty);
          if (!isImpassable(cell)) {
            em.addComponent(id, 'State', { ...state, current: 'moving', target: { x: tx, y: ty } });
          }
        }
        continue; // faim prioritaire — ignorer énergie/foi tant qu'affamé
      }

      // ── 2. FATIGUE ────────────────────────────────────────────
      if (needs.energy < TIRED) {
        const shelter = nearestBuilding(bldgs.shelter, pos.x, pos.y, range * 2);
        if (shelter) {
          if (shelter.d <= EAT_DIST) {
            em.addComponent(id, 'Needs', { ...needs, energy: 100 });
            em.addComponent(id, 'State', { ...state, current: 'idle', target: null, task: null });
          } else {
            em.addComponent(id, 'State', { ...state, current: 'moving', target: shelter.pos, task: shelter.fid });
          }
        } else {
          em.addComponent(id, 'State', { ...state, current: 'resting', target: null, timer: REST_TICKS });
        }
        continue;
      }

      // ── 3. FOI basse ─────────────────────────────────────────
      if ((needs.foi ?? 50) < FOI_LOW) {
        const temple = nearestBuilding(bldgs.culture, pos.x, pos.y, range * 2);
        if (temple) {
          if (temple.d <= EAT_DIST) {
            const bldType = em.getComponent(temple.fid, 'Building')?.type;
            const bldInfo = BUILDINGS.find(b => b.id === bldType);
            const boost   = Math.min(
              100 - (needs.foi ?? 50),
              (bldInfo?.needContribution?.culture ?? 10) * 2
            );
            em.addComponent(id, 'Needs', { ...needs, foi: (needs.foi ?? 50) + boost });
            em.addComponent(id, 'State', { ...state, current: 'idle', target: null, task: null });
          } else {
            em.addComponent(id, 'State', { ...state, current: 'moving', target: temple.pos, task: temple.fid });
          }
        } else if (state.current === 'idle') {
          em.addComponent(id, 'State', { ...state, current: 'praying', timer: PRAYER_TICKS });
        }
        continue;
      }

      // ── 4. ERRANCE (idle) ─────────────────────────────────────
      if (state.current === 'idle') {
        const radius = 5 + Math.floor(perception / 12);
        const tx = Math.max(0, Math.min(grid.cols - 1,
          pos.x + Math.floor((Math.random() - 0.5) * radius * 2)));
        const ty = Math.max(0, Math.min(grid.rows - 1,
          pos.y + Math.floor((Math.random() - 0.5) * radius * 2)));
        const cell = grid.getCell(tx, ty);
        if (!isImpassable(cell)) {
          em.addComponent(id, 'State', { ...state, current: 'moving', target: { x: tx, y: ty } });
        }
      }
    }
  }
}
