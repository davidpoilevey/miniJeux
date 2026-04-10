// ─────────────────────────────────────────────────────────────
// ShopSystem
//
// Quand un habitant se trouve à portée d'un bâtiment de son
// village qui `allows` un item qu'il ne possède pas encore,
// il l'acquiert automatiquement (économie bypassée pour l'instant).
//
// Effets à l'acquisition :
//   weapon     → reste dans l'inventaire (utilisé par battle())
//   navigation → reste dans l'inventaire (utilisé par MovementSystem)
//   stat_boost → boost permanent immédiat sur Stats
//   need_boost → boost immédiat sur Needs
// ─────────────────────────────────────────────────────────────

import { ITEMS_BY_BUILDING, ITEM_BY_ID } from '../data/itemData.js';

const SHOP_RANGE = 2;   // portée d'achat en cases de Manhattan
const COOLDOWN   = 15;  // ticks entre deux tentatives d'achat pour un habitant

function manhattan(ax, ay, bx, by) {
  return Math.abs(ax - bx) + Math.abs(ay - by);
}

export default class ShopSystem {
  constructor() {
    this._tick      = 0;
    this._cooldowns = new Map(); // entityId → tick
  }

  update({ em }) {
    this._tick++;

    // ── Index des bâtiments vendeurs : buildingType → [{ bid, pos, groupId }] ──
    const shopsByType = {};
    for (const bid of em.query('Position', 'Building')) {
      const bld  = em.getComponent(bid, 'Building');
      const bpos = em.getComponent(bid, 'Position');
      if (!bld || !bpos || !ITEMS_BY_BUILDING[bld.type]) continue;
      (shopsByType[bld.type] ??= []).push({ bid, pos: bpos, groupId: bld.groupId });
    }

    // ── Parcourt les habitants avec un inventaire ────────────
    for (const id of em.query('Position', 'Inventory', 'Group')) {
      const last = this._cooldowns.get(id) ?? -999;
      if (this._tick - last < COOLDOWN) continue;

      const pos   = em.getComponent(id, 'Position');
      const inv   = em.getComponent(id, 'Inventory');
      const group = em.getComponent(id, 'Group');

      let bought = false;

      for (const [bldType, shops] of Object.entries(shopsByType)) {
        if (bought) break;
        const availableItems = ITEMS_BY_BUILDING[bldType];
        // Items disponibles que l'habitant ne possède pas encore
        const missing = availableItems.filter(iid => !inv.items.includes(iid));
        if (!missing.length) continue;

        for (const { pos: bpos, groupId } of shops) {
          if (groupId !== group.groupId) continue; // même village seulement
          if (manhattan(pos.x, pos.y, bpos.x, bpos.y) > SHOP_RANGE) continue;

          // Achète le premier item manquant
          const itemId = missing[0];
          const item   = ITEM_BY_ID[itemId];
          if (!item) continue;

          const newInv = { ...inv, items: [...inv.items, itemId] };
          em.addComponent(id, 'Inventory', newInv);
          this._cooldowns.set(id, this._tick);
          this._applyEffect(em, id, item);
          bought = true;
          break;
        }
      }
    }
  }

  _applyEffect(em, id, item) {
    const { effect } = item;
    if (!effect) return;

    if (effect.type === 'stat_boost') {
      const stats = em.getComponent(id, 'Stats');
      if (stats) {
        em.addComponent(id, 'Stats', {
          ...stats,
          [effect.stat]: Math.min(90, (stats[effect.stat] ?? 50) + effect.value),
        });
      }
    }

    if (effect.type === 'need_boost') {
      const needs = em.getComponent(id, 'Needs');
      if (needs) {
        em.addComponent(id, 'Needs', {
          ...needs,
          [effect.need]: Math.min(100, (needs[effect.need] ?? 50) + effect.value),
        });
      }
    }

    // 'weapon' et 'navigation' → effets passifs gérés ailleurs (battle / MovementSystem)
  }
}
