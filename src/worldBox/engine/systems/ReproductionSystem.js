// ─────────────────────────────────────────────────────────────
// ReproductionSystem
//
// Conditions pour copuler :
//   • Même village, à portée de perception (1-3 cases)
//   • needs.social >= SOCIAL_MIN pour les deux
//   • Village a au moins 1 maison
//   • Ni l'un ni l'autre n'est déjà en gestation
//   • Cooldown de paire (COUPLE_COOLDOWN ticks)
//   • Population du village < MAX_VILLAGE_POP
//
// Effets sur les parents :
//   social -= 30, energy -= 20, foi += 5
//
// Gestation (20 ticks) stockée sur l'un des parents.
// À terme : l'enfant hérite de la moyenne des stats + mutation ±5.
// ─────────────────────────────────────────────────────────────

const GESTATION_TICKS  = 15;
const SOCIAL_MIN       = 52;   // seuil social pour copuler (52 ≈ équilibre naturel + petit boost)
const COUPLE_COOLDOWN  = 25;   // ticks minimum entre deux copulations de la même paire
const MAX_VILLAGE_POP  = 30;   // cap par village
const MUTATION         = 5;    // amplitude de mutation par trait

function manhattan(ax, ay, bx, by) {
  return Math.abs(ax - bx) + Math.abs(ay - by);
}

function perceptionRange(perception) {
  return Math.max(1, Math.min(3, Math.ceil((perception ?? 50) / 34)));
}

// Héritage d'un trait : moyenne + mutation ±MUTATION, clamp 10-90
function inherit(a, b) {
  const avg = Math.round((a + b) / 2);
  return Math.max(10, Math.min(90, avg + Math.floor(Math.random() * (MUTATION * 2 + 1)) - MUTATION));
}

// ─────────────────────────────────────────────────────────────
export default class ReproductionSystem {
  constructor() {
    this._tick      = 0;
    this._cooldowns = new Map();  // `${minId}-${maxId}` → tick
  }

  _key(a, b)      { return `${Math.min(a, b)}-${Math.max(a, b)}`; }
  _onCooldown(a, b) {
    const last = this._cooldowns.get(this._key(a, b)) ?? -999;
    return (this._tick - last) < COUPLE_COOLDOWN;
  }
  _record(a, b)   { this._cooldowns.set(this._key(a, b), this._tick); }

  update({ em, spawnInhabitant }) {
    this._tick++;

    // Nettoyage périodique
    if (this._tick % 300 === 0) {
      for (const [k, t] of this._cooldowns) {
        if (this._tick - t > COUPLE_COOLDOWN * 2) this._cooldowns.delete(k);
      }
    }

    // ── 1. Décompte des gestations ──────────────────────────────
    for (const id of em.query('Gestation')) {
      const g = em.getComponent(id, 'Gestation');
      if (!g) continue;

      if (g.timer > 1) {
        em.addComponent(id, 'Gestation', { ...g, timer: g.timer - 1 });
        continue;
      }

      // Accouchement !
      em.removeComponent(id, 'Gestation');
      const parentPos = em.getComponent(id, 'Position');
      if (!parentPos) continue;

      const childStats = {
        force:        inherit(g.statsA.force,        g.statsB.force),
        intelligence: inherit(g.statsA.intelligence, g.statsB.intelligence),
        charme:       inherit(g.statsA.charme,       g.statsB.charme),
        perception:   inherit(g.statsA.perception,   g.statsB.perception),
      };
      const childMaxAge = Math.round((g.maxAgeA + g.maxAgeB) / 2)
                        + Math.floor(Math.random() * 11) - 5;

      spawnInhabitant(parentPos.x, parentPos.y, g.groupId, childStats, childMaxAge);
    }

    // ── 2. Détection des rencontres ─────────────────────────────

    // Villages indexés : groupId → Village component (vérif maison + population)
    const villageByGroup = {};
    for (const vid of em.query('Village')) {
      const v = em.getComponent(vid, 'Village');
      villageByGroup[v.groupId] = v;
    }

    // Population actuelle par village
    const popByGroup = {};
    for (const id of em.query('Inhabitant', 'Group')) {
      const grp = em.getComponent(id, 'Group');
      if (grp) popByGroup[grp.groupId] = (popByGroup[grp.groupId] ?? 0) + 1;
    }

    const all = em.query('Position', 'Inhabitant', 'Group', 'Stats', 'Needs');

    for (let i = 0; i < all.length; i++) {
      const idA = all[i];
      if (em.getComponent(idA, 'Gestation')) continue;           // déjà enceinte

      const groupA = em.getComponent(idA, 'Group');
      const needsA = em.getComponent(idA, 'Needs');
      if (!groupA || (needsA?.social ?? 0) < SOCIAL_MIN) continue;

      const village = villageByGroup[groupA.groupId];
      if (!village) continue;
      if ((village.buildings?.maison ?? 0) < 1) continue;        // pas de maison
      if ((popByGroup[groupA.groupId] ?? 0) >= MAX_VILLAGE_POP)  continue; // trop peuplé

      const posA   = em.getComponent(idA, 'Position');
      const statsA = em.getComponent(idA, 'Stats');
      const ageA   = em.getComponent(idA, 'Age');
      const rangeA = perceptionRange(statsA?.perception);

      for (let j = i + 1; j < all.length; j++) {
        const idB = all[j];
        if (em.getComponent(idB, 'Gestation'))  continue;        // déjà enceinte
        if (this._onCooldown(idA, idB))         continue;

        const groupB = em.getComponent(idB, 'Group');
        if (!groupB || groupB.groupId !== groupA.groupId) continue; // villages différents

        const needsB = em.getComponent(idB, 'Needs');
        if ((needsB?.social ?? 0) < SOCIAL_MIN) continue;

        const posB   = em.getComponent(idB, 'Position');
        const statsB = em.getComponent(idB, 'Stats');
        const ageB   = em.getComponent(idB, 'Age');
        const rangeB = perceptionRange(statsB?.perception);
        const range  = Math.max(rangeA, rangeB);

        if (!posB || manhattan(posA.x, posA.y, posB.x, posB.y) > range) continue;

        // ── Copulation ! ──────────────────────────────────────
        this._record(idA, idB);

        // Effets sur les deux parents
        em.addComponent(idA, 'Needs', {
          ...needsA,
          social: Math.max(0, (needsA.social ?? 50) - 15),
          energy: Math.max(0, (needsA.energy ?? 50) - 10),
          foi:    Math.min(100, (needsA.foi    ?? 50) +  5),
        });
        em.addComponent(idB, 'Needs', {
          ...needsB,
          social: Math.max(0, (needsB.social ?? 50) - 30),
          energy: Math.max(0, (needsB.energy ?? 50) - 20),
          foi:    Math.min(100, (needsB.foi    ?? 50) +  5),
        });

        // Gestation sur l'un des deux (idA = "la mère" arbitrairement)
        em.addComponent(idA, 'Gestation', {
          timer:   GESTATION_TICKS,
          groupId: groupA.groupId,
          statsA:  { ...statsA },
          statsB:  { ...statsB },
          maxAgeA: ageA?.maxAge ?? 70,
          maxAgeB: ageB?.maxAge ?? 70,
        });

        break; // idA ne peut pas copuler avec deux partenaires au même tick
      }
    }
  }
}
