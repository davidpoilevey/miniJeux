import { BUILDINGS } from '../data/buildingData';
import Position from '../../../b13/ecs/components/Position';
import Building from '../components/Building';

const IMPASSABLE_TYPES = new Set(['eau', 'glace', 'montagne']);
const isImpassable = (cell) => !cell || IMPASSABLE_TYPES.has(cell.terrainType) || !!cell.isRiver;

// ─────────────────────────────────────────────────────────────
// CommunityDecisionSystem — modèle "déficit"
//
// Les communityNeeds représentent un DÉFICIT (0 = satisfait, 100 = critique).
// Les bâtiments RÉDUISENT le déficit via leur needContribution.
// _pickPlan choisit le besoin le plus ÉLEVÉ (le plus urgent).
//
// Sources de déficit :
//   shelter        = pop × 10           (chaque habitant a besoin d'un toit)
//   food_security  = pop × 8            (chaque habitant a besoin de nourriture)
//   community      = 20 + bâtiments×10  (plus on bâtit, plus on a besoin d'un centre)
//   culture        = 100 − avg(foi,social)  (malheur des habitants = besoin de culture)
//   commerce       = 80 − argent×2      (peu d'argent = besoin de marchés)
//   defense        = aggressionPressure (augmente lors des batailles, décroît lentement)
//   knowledge      = parent pauvre (haute quand les autres sont satisfaits)
//
// Impôt : +1 argent/habitant tous les 10 ticks (création magique).
// Decay  : aggressionPressure −0.3/tick.
// ─────────────────────────────────────────────────────────────

const PRIMARY_NEEDS = ['shelter', 'food_security', 'community', 'culture', 'commerce', 'defense'];
const ALL_NEEDS     = [...PRIMARY_NEEDS, 'knowledge'];

export default class CommunityDecisionSystem {
  constructor() { this._tick = 0; }

  update({ em, grid }) {
    this._tick++;
    const collectTax = this._tick % 10 === 0;

    for (const vid of em.query('Village')) {
      const v = em.getComponent(vid, 'Village');

      const members = em.query('Inhabitant', 'Group')
        .filter(id => em.getComponent(id, 'Group').groupId === v.groupId);
      const pop = Math.max(1, members.length);

      // ── Impôt ───────────────────────────────────────────────
      if (collectTax) {
        v.stockpile.argent = (v.stockpile.argent ?? 0) + members.length;
      }

      // ── Decay agression ─────────────────────────────────────
      if ((v.aggressionPressure ?? 0) > 0) {
        v.aggressionPressure = Math.max(0, v.aggressionPressure - 0.3);
      }

      // ── 1. Déficits bruts ────────────────────────────────────
      const ownedBldCount = Object.values(v.buildings).reduce((s, n) => s + n, 0);

      let sumHappy = 0;
      for (const mid of members) {
        const mn = em.getComponent(mid, 'Needs');
        sumHappy += mn ? ((mn.foi ?? 50) + (mn.social ?? 50)) / 2 : 50;
      }
      const avgHappiness = sumHappy / pop; // pop ≥ 1

      const raw = {
        shelter:       Math.min(100, pop * 10),
        food_security: Math.min(100, pop * 8),
        community:     Math.min(100, 20 + ownedBldCount * 10),
        culture:       Math.min(100, Math.max(0, 100 - avgHappiness)),
        commerce:      Math.max(0, Math.min(100, 80 - (v.stockpile.argent ?? 0) * 2)),
        defense:       Math.min(100, v.aggressionPressure ?? 0),
      };

      // ── 2. Réduction par les bâtiments ───────────────────────
      const needs = { ...raw };
      let knowledgeReduction = 0;

      for (const bld of BUILDINGS) {
        const count = v.buildings[bld.id] ?? 0;
        if (count === 0) continue;
        for (const [need, value] of Object.entries(bld.needContribution ?? {})) {
          if (need === 'knowledge') { knowledgeReduction += count * value; continue; }
          needs[need] = (needs[need] ?? 0) - count * value;
        }
      }

      for (const n of PRIMARY_NEEDS) needs[n] = Math.max(0, Math.min(100, needs[n]));

      // ── 3. Knowledge — parent pauvre ─────────────────────────
      // Émerge quand les besoins primaires sont satisfaits (bas)
      const avgPrimary = PRIMARY_NEEDS.reduce((s, n) => s + needs[n], 0) / PRIMARY_NEEDS.length;
      const rawKnowledge = Math.max(0, 80 - avgPrimary * 0.8);
      needs.knowledge = Math.max(0, Math.min(100, rawKnowledge - knowledgeReduction));

      // ── 4. Production des bâtiments → stockpile ─────────────
      const prodFactor    = v.bonus?.type === 'building' && v.bonus.productionFactor
        ? v.bonus.productionFactor : 1;
      const NON_RESOURCES = new Set(['warrior', 'archer', 'canon']);
      for (const bld of BUILDINGS) {
        const count = v.buildings[bld.id] ?? 0;
        if (count === 0 || !bld.produces) continue;
        for (const [resource, amount] of Object.entries(bld.produces)) {
          if (NON_RESOURCES.has(resource)) continue;
          v.stockpile[resource] = (v.stockpile[resource] ?? 0) + count * amount * 0.05 * prodFactor;
        }
      }

      v.communityNeeds = needs;

      // ── 5. Plan & collecte ───────────────────────────────────
      if (!v.currentPlan) v.currentPlan = this._pickPlan(v);

      if (v.currentPlan) {
        const missing = {};
        for (const [res, needed] of Object.entries(v.currentPlan.cost)) {
          const diff = needed - (v.stockpile[res] ?? 0);
          if (diff > 0) missing[res] = diff;
        }
        v.currentPlan.missing = missing;

        if (Object.keys(missing).length > 0) {
          v.gatherOrder = Object.keys(missing)[0];
        } else {
          v.gatherOrder = null;
          this._executeBuild(v, vid, em, grid);
        }
      } else {
        v.gatherOrder = null;
      }

      em.addComponent(vid, 'Village', v);
    }
  }

  // Choisit le bâtiment dont le besoin associé est le plus ÉLEVÉ.
  // Prérequis remplis + quota non atteint + need > 5 (seuil minimal).
  _pickPlan(v) {
    let bestScore = 5;
    let bestBld   = null;

    for (const bld of BUILDINGS) {
      const current = v.communityNeeds[bld.trigger.need] ?? 0;
      if (current <= bestScore) continue;

      if ((v.buildings[bld.id] ?? 0) >= bld.maxPerVillage) continue;

      if (bld.requires) {
        const ok = Object.entries(bld.requires).every(([req, n]) => (v.buildings[req] ?? 0) >= n);
        if (!ok) continue;
      }

      bestScore = current;
      bestBld   = bld;
    }

    if (!bestBld) return null;
    // Applique le bonus de coût du village (Bâtisseurs = −30 %)
    const costFactor = v.bonus?.type === 'building' && v.bonus.costFactor ? v.bonus.costFactor : 1;
    const cost = {};
    for (const [res, amount] of Object.entries(bestBld.cost)) {
      cost[res] = Math.max(1, Math.ceil(amount * costFactor));
    }
    return { buildingId: bestBld.id, label: bestBld.label, cost, missing: {} };
  }

  _executeBuild(v, vid, em, grid) {
    const bld = BUILDINGS.find(b => b.id === v.currentPlan.buildingId);
    if (!bld) { v.currentPlan = null; return; }

    // Utilise le coût du plan (déjà ajusté par costFactor dans _pickPlan)
    for (const [res, amount] of Object.entries(v.currentPlan.cost)) {
      v.stockpile[res] = Math.max(0, (v.stockpile[res] ?? 0) - amount);
    }
    v.buildings[bld.id] = (v.buildings[bld.id] ?? 0) + 1;
    v.currentPlan = null;

    const vpos = em.getComponent(vid, 'Position');
    if (vpos && grid) {
      const slot = this._findBuildingSlot(vpos, bld.id, em, grid);
      if (slot) {
        const eid = em.createEntity();
        em.addComponent(eid, 'Position', Position(slot.x, slot.y));
        em.addComponent(eid, 'Building', Building(bld.id, bld.label, v.groupId));
      }
    }
  }

  _findBuildingSlot(vpos, bldId, em, grid) {
    if (bldId === 'place_centrale') return { x: vpos.x, y: vpos.y };

    const occupied = new Set(
      em.query('Position', 'Building').map(id => {
        const p = em.getComponent(id, 'Position');
        return `${p.x},${p.y}`;
      })
    );
    occupied.add(`${vpos.x},${vpos.y}`);

    for (let r = 1; r <= 12; r++) {
      for (let dx = -r; dx <= r; dx++) {
        for (let dy = -r; dy <= r; dy++) {
          if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
          const x = vpos.x + dx;
          const y = vpos.y + dy;
          if (x < 0 || y < 0 || x >= grid.cols || y >= grid.rows) continue;
          if (occupied.has(`${x},${y}`)) continue;
          const cell = grid.getCell(x, y);
          if (isImpassable(cell)) continue;
          return { x, y };
        }
      }
    }
    return null;
  }
}
