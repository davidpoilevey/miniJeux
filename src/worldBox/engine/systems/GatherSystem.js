import { RESOURCE_YIELD, STOCK_FROM_RESOURCE } from '../data/buildingData';

// ─────────────────────────────────────────────────────────────
// GatherSystem
//
// États gérés :
//   task.action === 'gather'  : en route vers une ressource
//     → arrivée : pickup (décrémente réserve, détruit si épuisée)
//     → si réserve basse + test intelligence → state 'working' (WORKING_TICKS)
//     → sinon : moving vers village (task.action 'return')
//
//   current === 'working'     : recharge la réserve sur place
//     → fin : recharge resource.reserve → moving vers village
//
//   task.action === 'return'  : retour au village
//     → arrivée : dépôt dans stockpile
//
//   idle + no task + village.gatherOrder : assigne un nouveau gather
// ─────────────────────────────────────────────────────────────

const MAX_GATHER_DIST = 50;
const WORKING_TICKS   = 15;   // ticks pour recharger une ressource
const LOW_RESERVE     = 5;    // seuil de réserve qui déclenche le test d'intelligence

function manhattan(ax, ay, bx, by) {
  return Math.abs(ax - bx) + Math.abs(ay - by);
}

export default class GatherSystem {
  update({ em }) {
    // ── Index villages par groupId ───────────────────────────
    const villageByGroup = new Map();
    for (const vid of em.query('Village', 'Position')) {
      const v = em.getComponent(vid, 'Village');
      const p = em.getComponent(vid, 'Position');
      villageByGroup.set(v.groupId, { vid, village: v, pos: p });
    }

    for (const id of em.query('Position', 'State', 'Group', 'Inhabitant')) {
      const state = em.getComponent(id, 'State');
      const group = em.getComponent(id, 'Group');
      const pos   = em.getComponent(id, 'Position');

      // ── Travail sur ressource (recharge réserve) ─────────────
      if (state.current === 'working' && state.task?.action === 'gather') {
        const timer = state.timer - 1;
        if (timer <= 0) {
          // Recharge la ressource puis retour au village
          const { resourceId, yld, villagePos } = state.task;
          const res = resourceId ? em.getComponent(resourceId, 'Resource') : null;
          if (res) em.addComponent(resourceId, 'Resource', { ...res, reserve: res.maxReserve ?? 20 });
          em.addComponent(id, 'State', {
            current: 'moving',
            target:  villagePos,
            task:    { action: 'return', yield: yld },
            timer:   0,
          });
        } else {
          em.addComponent(id, 'State', { ...state, timer });
        }
        continue;
      }

      if (state.current !== 'idle') continue;

      const vData = villageByGroup.get(group.groupId);
      if (!vData) continue;

      // ── Arrivée sur la ressource → ramasse ──────────────────
      if (state.task?.action === 'gather') {
        const { resourceId, villagePos } = state.task;
        const resPos = em.getComponent(resourceId, 'Position');

        if (resPos && resPos.x === pos.x && resPos.y === pos.y) {
          const res = em.getComponent(resourceId, 'Resource');
          const yld = res ? (RESOURCE_YIELD[res.type] ?? {}) : {};

          // Décrémente la réserve, détruit si épuisée
          let newReserve = 0;
          if (res) {
            newReserve = (res.reserve ?? 1) - 1;
            if (newReserve <= 0) em.destroyEntity(resourceId);
            else em.addComponent(resourceId, 'Resource', { ...res, reserve: newReserve });
          }

          // Test intelligence : travailler sur la ressource si réserve basse
          const stats = em.getComponent(id, 'Stats');
          if (newReserve > 0 && newReserve <= LOW_RESERVE &&
              Math.random() < (stats?.intelligence ?? 50) / 100) {
            em.addComponent(id, 'State', {
              current: 'working',
              target:  null,
              task:    { action: 'gather', resourceId, yld, villagePos },
              timer:   WORKING_TICKS,
            });
          } else {
            em.addComponent(id, 'State', {
              current: 'moving',
              target:  villagePos,
              task:    { action: 'return', yield: yld },
              timer:   0,
            });
          }
        } else {
          // Ressource disparue (épuisée par un autre) → libère
          em.addComponent(id, 'State', { ...state, task: null });
        }
        continue;
      }

      // ── Arrivée au village → dépose ──────────────────────────
      if (state.task?.action === 'return') {
        const v = em.getComponent(vData.vid, 'Village');
        for (const [stock, amount] of Object.entries(state.task.yield ?? {})) {
          v.stockpile[stock] = (v.stockpile[stock] ?? 0) + amount;
        }
        em.addComponent(vData.vid, 'Village', v);
        em.addComponent(id, 'State', { current: 'idle', target: null, task: null, timer: 0 });
        continue;
      }

      // ── Pas de tâche : assigne si le village a un ordre ──────
      if (state.task || !vData.village.gatherOrder) continue;

      const stockType     = vData.village.gatherOrder;
      const resourceTypes = new Set(STOCK_FROM_RESOURCE[stockType] ?? []);
      if (resourceTypes.size === 0) continue;

      // Trouve la ressource la plus proche du bon type
      let best = null, bestDist = Infinity;
      for (const rid of em.query('Position', 'Resource')) {
        const res  = em.getComponent(rid, 'Resource');
        if (!resourceTypes.has(res.type)) continue;
        const rpos = em.getComponent(rid, 'Position');
        const d    = manhattan(pos.x, pos.y, rpos.x, rpos.y);
        if (d < bestDist && d <= MAX_GATHER_DIST) { bestDist = d; best = { rid, rpos }; }
      }

      if (best) {
        em.addComponent(id, 'State', {
          current: 'moving',
          target:  best.rpos,
          task:    { action: 'gather', resourceId: best.rid, stockType, villagePos: vData.pos },
          timer:   0,
        });
      }
    }
  }
}
