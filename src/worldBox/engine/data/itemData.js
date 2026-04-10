// ─────────────────────────────────────────────────────────────
// ITEM DATA — objets portés dans l'inventaire des habitants
//
// effect.type :
//   'weapon'     → attackBonus ajouté au roll de force dans battle()
//   'navigation' → bateau : permet de marcher sur 'eau'
//   'stat_boost' → bonus permanent sur un champ de Stats (intelligence…)
//   'need_boost' → boost immédiat sur un champ de Needs (foi…)
//
// Les bâtiments qui vendent chaque item sont définis par leur champ
// `allows` dans buildingData.js — l'index ITEMS_BY_BUILDING en découle.
// ─────────────────────────────────────────────────────────────

import { BUILDINGS } from './buildingData.js';

export const ITEMS = [
  { id: 'epee',      label: 'Épée',      icon: '⚔️',  effect: { type: 'weapon',     attackBonus: 20 } },
  { id: 'arc',       label: 'Arc',       icon: '🏹',  effect: { type: 'weapon',     attackBonus: 15 } },
  { id: 'nunchuck',  label: 'Nunchuck',  icon: '🥊',  effect: { type: 'weapon',     attackBonus: 12 } },
  { id: 'sortilege', label: 'Sortilège', icon: '✨',  effect: { type: 'weapon',     attackBonus: 25 } },
  { id: 'canon',     label: 'Canon',     icon: '💣',  effect: { type: 'weapon',     attackBonus: 35 } },
  { id: 'bateau',    label: 'Bateau',    icon: '⛵',  effect: { type: 'navigation' } },
  { id: 'livre',     label: 'Livre',     icon: '📚',  effect: { type: 'stat_boost', stat: 'intelligence', value: 10 } },
  { id: 'crucifix',  label: 'Crucifix',  icon: '✝️',  effect: { type: 'need_boost', need: 'foi',          value: 20 } },
];

export const ITEM_BY_ID = Object.fromEntries(ITEMS.map(i => [i.id, i]));

// Index : buildingType → [itemId, …]  (construit depuis les champs `allows` de buildingData)
export const ITEMS_BY_BUILDING = {};
for (const bld of BUILDINGS) {
  if (bld.allows?.length) ITEMS_BY_BUILDING[bld.id] = bld.allows;
}
