// ─────────────────────────────────────────────────────────────
// SocialSystem
//
// Chaque tick, quand deux habitants sont assez proches :
//   • Même village  → interaction sociale (+social selon charme)
//   • Diff. villages → bataille mortelle (min 20 dégâts)
//
// Quand un habitant est proche d'un bâtiment ennemi :
//   → attaque le bâtiment (dégâts basés sur force + armes)
//   → si hp < 50 → conquête : le bâtiment change de village
//
// Cooldown par paire/cible : 10 ticks.
// ─────────────────────────────────────────────────────────────

import { ITEM_BY_ID } from '../data/itemData.js';

const COOLDOWN        = 10;   // ticks entre deux interactions pour la même paire
const BATTLE_MIN_DMG  = 20;   // dégâts minimaux par bataille
const CONQUER_HP      = 50;   // seuil de conquête d'un bâtiment

function manhattan(ax, ay, bx, by) {
  return Math.abs(ax - bx) + Math.abs(ay - by);
}

function perceptionRange(perception) {
  return Math.max(1, Math.min(3, Math.ceil((perception ?? 50) / 34)));
}

// ── Interaction amicale ──────────────────────────────────────
function socialBoost(em, idA, idB, statsA, statsB) {
  const charme = (statsA?.charme ?? 50) + (statsB?.charme ?? 50);
  const gain   = 1 + Math.floor(charme / 50);   // 1 – 5

  const needsA = em.getComponent(idA, 'Needs');
  const needsB = em.getComponent(idB, 'Needs');
  if (needsA) em.addComponent(idA, 'Needs', { ...needsA, social: Math.min(100, (needsA.social ?? 50) + gain) });
  if (needsB) em.addComponent(idB, 'Needs', { ...needsB, social: Math.min(100, (needsB.social ?? 50) + gain) });
}

// ── Bonus d'armes dans l'inventaire ─────────────────────────
function weaponBonus(em, id) {
  const inv = em.getComponent(id, 'Inventory');
  if (!inv?.items?.length) return 0;
  return inv.items.reduce((sum, itemId) => {
    const item = ITEM_BY_ID[itemId];
    return sum + (item?.effect?.type === 'weapon' ? (item.effect.attackBonus ?? 0) : 0);
  }, 0);
}

// ── Roll d'attaque ───────────────────────────────────────────
function attackRoll(em, id) {
  const stats = em.getComponent(id, 'Stats');
  return (stats?.force ?? 50) + weaponBonus(em, id) + Math.floor(Math.random() * 21 - 10);
}

// ── Bataille (mortelle) ───────────────────────────────────────
// Perdant subit max(50% de son énergie, BATTLE_MIN_DMG).
// Si énergie ≤ 0 → mort.
// Retourne l'id du perdant (ou null si les deux sont déjà détruits).
export function battle(em, idA, idB, onDeath) {
 const grpA = em.getComponent(idA, 'Group');
  const grpB = em.getComponent(idB, 'Group');
  const rollA = attackRoll(em, idA)+grpA?.role==='chief' ? 20 : 0; // bonus de chef
  const rollB = attackRoll(em, idB)+grpB?.role==='chief' ? 20 : 0; // bonus de chef

  const loserId    = rollA >= rollB ? idB : idA;
  const loserNeeds = em.getComponent(loserId, 'Needs');
  if (!loserNeeds) return null;

  const energy  = loserNeeds.energy ?? 50;
  const damage  = Math.max(BATTLE_MIN_DMG, Math.floor(energy * 0.5));
  const newEnergy = Math.max(0, energy - damage);

  if (newEnergy <= 0) {
    em.destroyEntity(loserId);
    onDeath?.('combat');
  } else {
    em.addComponent(loserId, 'Needs', { ...loserNeeds, energy: newEnergy });
  }
  return loserId;
}

// ─────────────────────────────────────────────────────────────
export default class SocialSystem {
  constructor() {
    this._tick      = 0;
    this._cooldowns = new Map(); // clé `${minId}-${maxId}` → tick
  }

  _key(a, b) {
    return `${Math.min(a, b)}-${Math.max(a, b)}`;
  }

  _onCooldown(a, b) {
    const last = this._cooldowns.get(this._key(a, b)) ?? -999;
    return (this._tick - last) < COOLDOWN;
  }

  _record(a, b) {
    this._cooldowns.set(this._key(a, b), this._tick);
  }

  update({ em, onDeath, addBattleEffect }) {
    this._tick++;

    // Nettoyage périodique des cooldowns obsolètes
    if (this._tick % 200 === 0) {
      for (const [k, t] of this._cooldowns) {
        if (this._tick - t > COOLDOWN * 2) this._cooldowns.delete(k);
      }
    }

    // Pré-cache : villages par groupId (pour la conquête + agression)
    const villageEntityByGroup = {};
    for (const vid of em.query('Village')) {
      const v = em.getComponent(vid, 'Village');
      if (v) villageEntityByGroup[v.groupId] = vid;
    }

    const toDestroy    = new Set();   // habitants morts ce tick
    const aggrAdds     = new Map();   // vid → pression à ajouter

    const addAggr = (vid, amount) =>
      aggrAdds.set(vid, (aggrAdds.get(vid) ?? 0) + amount);

    // ── Bâtiments ennemis indexés par position ────────────────
    const buildingEntities = em.query('Position', 'Building');

    // ── Habitants ─────────────────────────────────────────────
    const all = em.query('Position', 'Inhabitant', 'Group', 'Stats');

    // ── 1. Batailles inter-villages ───────────────────────────
    for (let i = 0; i < all.length; i++) {
      const idA = all[i];
      if (toDestroy.has(idA)) continue;

      const posA   = em.getComponent(idA, 'Position');
      const statsA = em.getComponent(idA, 'Stats');
      const groupA = em.getComponent(idA, 'Group');
      if (!posA || !groupA) continue;

      const rangeA = perceptionRange(statsA?.perception);

      for (let j = i + 1; j < all.length; j++) {
        const idB = all[j];
        if (toDestroy.has(idB)) continue;
        if (this._onCooldown(idA, idB)) continue;

        const posB   = em.getComponent(idB, 'Position');
        const statsB = em.getComponent(idB, 'Stats');
        const groupB = em.getComponent(idB, 'Group');
        if (!posB || !groupB) continue;

        const rangeB = perceptionRange(statsB?.perception);
        const range  = Math.max(rangeA, rangeB);

        if (manhattan(posA.x, posA.y, posB.x, posB.y) > range) continue;

        this._record(idA, idB);

        if (groupA.groupId === groupB.groupId) {
          socialBoost(em, idA, idB, statsA, statsB);
        } else {
          const loserId = battle(em, idA, idB, onDeath);
          if (loserId !== null) toDestroy.add(loserId);
          // Les deux villages se sentent agressés
          const vidA = villageEntityByGroup[groupA.groupId];
          const vidB = villageEntityByGroup[groupB.groupId];
          if (vidA) addAggr(vidA, 5);
          if (vidB) addAggr(vidB, 5);
          // Effet visuel — au point de contact (milieu des deux combattants)
          addBattleEffect?.(
            Math.round((posA.x + posB.x) / 2),
            Math.round((posA.y + posB.y) / 2),
            'battle',
          );
        }
      }
    }

    // ── 2. Attaques de bâtiments ennemis ─────────────────────
    for (const idA of all) {
      if (toDestroy.has(idA)) continue;

      const posA   = em.getComponent(idA, 'Position');
      const groupA = em.getComponent(idA, 'Group');
      const statsA = em.getComponent(idA, 'Stats');
      if (!posA || !groupA) continue;

      const rangeA = perceptionRange(statsA?.perception);

      for (const bid of buildingEntities) {
        const bld  = em.getComponent(bid, 'Building');
        if (!bld || bld.groupId === groupA.groupId) continue;

        const bpos = em.getComponent(bid, 'Position');
        if (!bpos) continue;
        if (manhattan(posA.x, posA.y, bpos.x, bpos.y) > rangeA) continue;
        if (this._onCooldown(idA, bid)) continue;

        this._record(idA, bid);

        // Village défenseur ressent l'agression
        const defVid = villageEntityByGroup[bld.groupId];
        if (defVid) addAggr(defVid, 2);

        // Dégâts sur le bâtiment
        const roll   = attackRoll(em, idA);
        const damage = Math.max(BATTLE_MIN_DMG, roll);
        const newHp  = (bld.hp ?? 200) - damage;

        // Effet visuel sur le bâtiment attaqué
        addBattleEffect?.(bpos.x, bpos.y, 'siege');

        if (newHp < CONQUER_HP) {
          // ── Conquête ──────────────────────────────────────
          const oldGroupId = bld.groupId;
          const newGroupId = groupA.groupId;

          em.addComponent(bid, 'Building', { ...bld, groupId: newGroupId, hp: 200 });

          const oldVid = villageEntityByGroup[oldGroupId];
          if (oldVid) {
            const oldV = em.getComponent(oldVid, 'Village');
            if (oldV && (oldV.buildings[bld.type] ?? 0) > 0) {
              em.addComponent(oldVid, 'Village', {
                ...oldV, buildings: { ...oldV.buildings, [bld.type]: oldV.buildings[bld.type] - 1 },
              });
            }
          }

          const newVid = villageEntityByGroup[newGroupId];
          if (newVid) {
            const newV = em.getComponent(newVid, 'Village');
            if (newV) {
              em.addComponent(newVid, 'Village', {
                ...newV, buildings: { ...newV.buildings, [bld.type]: (newV.buildings[bld.type] ?? 0) + 1 },
              });
            }
          }
        } else {
          em.addComponent(bid, 'Building', { ...bld, hp: newHp });
        }
      }
    }

    // ── 3. Appliquer les pressions d'agression ────────────────
    for (const [avid, add] of aggrAdds) {
      const av = em.getComponent(avid, 'Village');
      if (av) em.addComponent(avid, 'Village', {
        ...av,
        aggressionPressure: Math.min(100, (av.aggressionPressure ?? 0) + add),
      });
    }
  }
}
