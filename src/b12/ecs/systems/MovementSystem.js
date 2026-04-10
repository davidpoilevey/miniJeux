/**
 * MovementSystem — déplacement physique et consommation
 *
 * Responsabilités :
 *   - Drainer l'énergie (métabolisme) — détruire si énergie nulle
 *   - Déplacer vers Decision.targetPos (ou fuir à partir de cette pos si intent='flee')
 *   - Régénérer les FoodSources
 *   - Agir sur la cible à portée : manger (eat) ou chasser (hunt)
 *
 * La reproduction (intent='mate') est gérée par ReproductionSystem après ce système.
 * La logique de choix de cible est entièrement dans DecisionSystem.
 */

const CONSUME_RADIUS = 14;   // pixels pour déclencher une action sur cible
const ENERGY_DRAIN   = 0.12; // par tick (métabolisme de base)

// ── Tables de combat ──────────────────────────────────────────────────────────
// Puissance d'attaque de base par rôle (avant bonus génétiques)
const BASE_ATTACK_BY_ROLE = {
  filtrer:   0,
  herbivore: 0,
  omnivore:  20,
  predator:  45,
  apex:      70,
};

// Défense de base par rôle (avant bonus génétiques joueur)
// Formule : mitigation = min(0.6,  defense / (defense + 50))
const BASE_DEFENSE_BY_ROLE = {
  filtrer:   2,
  herbivore: 5,
  omnivore:  12,
  predator:  22,
  apex:      38,
};

const SPEED_BY_BEHAVIOR = {
  swarm:    1.0,
  herd:     0.9,
  pack:     1.6,
  solitary: 1.3,
  filtrer:  0.8,
};

export class MovementSystem {
  constructor(entityManager, worldW, worldH) {
    this.em     = entityManager;
    this.worldW = worldW;
    this.worldH = worldH;
  }

  update(_playerGenes = new Set(), {
    energyBonus          = 0,
    speedBonus           = 0,
    predationBonus       = 0,
    defenseBonus         = 0,
    energyDrainReduction = 0,
  } = {}) {
    const entityIds = this.em.getEntitiesWithComponents(['Position', 'Species', 'Stats', 'Decision']);
    const foodIds   = this.em.getEntitiesWithComponents(['Position', 'FoodSource']);

    // ── Régénération des sources alimentaires ─────────────────────────────
    for (const fsId of foodIds) {
      const fs = this.em.getComponent(fsId, 'FoodSource');
      fs.energy = Math.min(fs.maxEnergy, fs.energy + fs.regenRate);
    }

    // ── Déplacement + action de chaque entité ────────────────────────────
    for (const id of entityIds) {
      // L'entité a pu être détruite par une proie consommée plus tôt dans le tick
      if (!this.em.getComponent(id, 'Species')) continue;

      const pos      = this.em.getComponent(id, 'Position');
      const sp       = this.em.getComponent(id, 'Species');
      const stats    = this.em.getComponent(id, 'Stats');
      const decision = this.em.getComponent(id, 'Decision');

      // Métabolisme
      const drain = sp.isPlayer
        ? Math.max(0.005, ENERGY_DRAIN - energyDrainReduction)
        : ENERGY_DRAIN;
      stats.energy = Math.max(0, stats.energy - drain);
      if (stats.energy <= 0) {
        this.em.destroyEntity(id);
        continue;
      }

      if (!decision.targetPos) continue;

      const speed = this._speed(sp, sp.isPlayer ? speedBonus : 0);

      if (decision.intent === 'flee') {
        // Fuite — s'éloigne de la position de menace
        this._moveAwayFrom(pos, decision.targetPos, speed * 1.4);
        decision.targetPos = null; // re-évaluée au prochain tick par DecisionSystem
      } else {
        const dist = this._dist(pos, decision.targetPos);

        if (dist < CONSUME_RADIUS && decision.targetId != null && decision.intent !== 'mate') {
          // À portée d'action — eat ou hunt (mate géré par ReproductionSystem)
          const eb = sp.isPlayer ? energyBonus    : 0;
          const pb = sp.isPlayer ? predationBonus : 0;
          this._actOnTarget(stats, sp, decision, eb, pb, defenseBonus);
          decision.intent = null; // re-évalué au prochain tick par DecisionSystem
        } else if (dist > 0.5) {
          this._moveToward(pos, decision.targetPos, speed);
        } else if (decision.intent === 'wander') {
          // Target d'errance atteinte → en chercher une autre
          decision.targetPos = null;
          decision.targetId  = null;
        }
      }
    }
  }

  // ── Action sur cible ──────────────────────────────────────────────────────

  _actOnTarget(attackerStats, attackerSp, decision, energyBonus = 0, predationBonus = 0, defenseBonus = 0) {
    const targetId = decision.targetId;

    // Cible disparue ?
    if (!this.em.getComponent(targetId, 'Position')) {
      decision.targetPos = null;
      decision.targetId  = null;
      return;
    }

    switch (decision.intent) {

      case 'eat': {
        const fs = this.em.getComponent(targetId, 'FoodSource');
        if (fs && fs.energy >= 1) {
          const gain       = Math.min(fs.energy, 5);
          fs.energy       -= gain;
          attackerStats.energy = Math.min(attackerStats.maxEnergy, attackerStats.energy + gain * (1 + energyBonus));
        }
        decision.targetPos = null;
        decision.targetId  = null;
        break;
      }

      case 'hunt': {
        const preySp    = this.em.getComponent(targetId, 'Species');
        const preyStats = this.em.getComponent(targetId, 'Stats');
        if (preySp && preyStats) {
          // ── Force d'attaque ──────────────────────────────────────────────
          let attack = BASE_ATTACK_BY_ROLE[attackerSp.role] ?? 15;
          if (attackerSp.isPlayer) attack *= (1 + predationBonus);

          // ── Défense de la proie ──────────────────────────────────────────
          // Les gènes défensifs du joueur s'ajoutent quand la proie est le joueur
          let defense = BASE_DEFENSE_BY_ROLE[preySp.role] ?? 5;
          if (preySp.isPlayer) defense += defenseBonus * 30;

          // ── Résolution : mitigation plafonnée à 60% ──────────────────────
          const mitigation = Math.min(0.6, defense / (defense + 50));
          const damage     = Math.max(1, attack * (1 - mitigation));

          preyStats.energy     = Math.max(0, preyStats.energy - damage);
          attackerStats.energy = Math.min(attackerStats.maxEnergy, attackerStats.energy + damage * (1 + energyBonus));

          // La proie ne meurt que quand son énergie atteint 0
          if (preyStats.energy <= 0) this.em.destroyEntity(targetId);
        }
        decision.targetPos = null;
        decision.targetId  = null;
        break;
      }

      default:
        decision.targetPos = null;
        decision.targetId  = null;
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  _speed(sp, speedBonus = 0) {
    const base = SPEED_BY_BEHAVIOR[sp.behavior] ?? 1.2;
    return sp.isPlayer ? base + speedBonus : base;
  }

  _moveToward(pos, target, speed) {
    const dx   = target.x - pos.x;
    const dy   = target.y - pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 0.5) return;
    pos.x = Math.max(0, Math.min(this.worldW, pos.x + (dx / dist) * speed));
    pos.y = Math.max(0, Math.min(this.worldH, pos.y + (dy / dist) * speed));
  }

  _moveAwayFrom(pos, threat, speed) {
    const dx   = pos.x - threat.x;
    const dy   = pos.y - threat.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    pos.x = Math.max(0, Math.min(this.worldW, pos.x + (dx / dist) * speed));
    pos.y = Math.max(0, Math.min(this.worldH, pos.y + (dy / dist) * speed));
  }

  _dist(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
