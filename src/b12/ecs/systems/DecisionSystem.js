/**
 * DecisionSystem — détermine la cible courante de chaque entité
 *
 * Priorités (ordre strict) :
 *   1. Fuite    — un prédateur est à portée de menace → fuir
 *   2. Faim     — énergie < HUNGER_THRESHOLD → chercher nourriture (ou proie)
 *   3. Accouplement — matingNeed >= threshold && énergie suffisante → chercher partenaire
 *   4. Errance  — target aléatoire dans le champ de vision
 *
 * Ne déplace pas les entités — écrit uniquement Decision.targetPos/targetId/intent.
 * Seul MovementSystem se charge du déplacement et des actions (manger, chasser, s'accoupler).
 *
 * Rôles :
 *   herbivore — mange uniquement FoodSource
 *   omnivore  — mange FoodSource + herbivores
 *   predator  — chasse herbivores, omnivores, filtrer (pas apex)
 *   apex      — chasse tout le monde
 *
 * Régulation démographique (per-entity, per-species) :
 *   count >= maxPop → matingNeed bloqué
 *   count <= minPop → taux ×3, seuil ×0.5
 */

import { SPECIES } from "../../data/species";


const HUNGER_THRESHOLD = 40;   // énergie en dessous de laquelle l'entité a faim
const THREAT_RADIUS    = 80;   // portée de détection d'un prédateur
const MATING_NEED_RATE = 2.5;  // incrément de matingNeed par tick (population normale)

// Seuil de matingNeed par rôle — herbivores se reproduisent plus vite,
// apex/prédateurs plus rarement (ils vivent plus longtemps en compensation)
const MATING_THRESHOLD_BY_ROLE = {
  filtrer:   40,
  herbivore: 35,
  omnivore:  55,
  predator:  70,
  apex:      80,
};

export class DecisionSystem {
  constructor(entityManager, worldW, worldH) {
    this.em     = entityManager;
    this.worldW = worldW;
    this.worldH = worldH;
  }

  update(playerGenes = new Set()) {
    const entityIds = this.em.getEntitiesWithComponents(['Position', 'Species', 'Stats', 'Decision']);
    const foodIds   = this.em.getEntitiesWithComponents(['Position', 'FoodSource']);

    // ── Précalcul des snapshots + listes de proies ─────────────────────────
    const entityData = new Map(); // id → { pos, sp, stats, decision }
    const predators  = [];        // { id, pos, sp } — prédateurs + apex (détection menace)

    const preyForOmnivore = []; // herbivore + filtrer
    const preyForPredator = []; // herbivore + omnivore + filtrer
    const preyForApex     = []; // tout sauf apex

    for (const id of entityIds) {
      const pos      = this.em.getComponent(id, 'Position');
      const sp       = this.em.getComponent(id, 'Species');
      const stats    = this.em.getComponent(id, 'Stats');
      const decision = this.em.getComponent(id, 'Decision');
      entityData.set(id, { pos, sp, stats, decision });

      if (sp.role === 'predator' || sp.role === 'apex') predators.push({ id, pos, sp });

      switch (sp.role) {
        case 'herbivore':
        case 'filtrer':
          preyForOmnivore.push({ id, pos, sp });
          preyForPredator.push({ id, pos, sp });
          preyForApex.push({ id, pos, sp });
          break;
        case 'omnivore':
          preyForPredator.push({ id, pos, sp });
          preyForApex.push({ id, pos, sp });
          break;
        case 'predator':
          preyForApex.push({ id, pos, sp });
          break;
        default: break;
      }
    }

    // ── Comptage population par espèce ─────────────────────────────────────
    const speciesCounts = new Map(); // speciesId → count
    for (const [, { sp }] of entityData) {
      speciesCounts.set(sp.speciesId, (speciesCounts.get(sp.speciesId) ?? 0) + 1);
    }

    const foodAvailable = foodIds
      .map(id => ({ id, pos: this.em.getComponent(id, 'Position'), fs: this.em.getComponent(id, 'FoodSource') }))
      .filter(f => f.fs.energy > 1);

    // ── Décision par entité ────────────────────────────────────────────────
    for (const id of entityIds) {
      const { pos, sp, stats, decision } = entityData.get(id);
      const genome     = this.em.getComponent(id, 'Genome');
      const viewRadius = genome ? genome.handler.readFloat('champVision') * 100 + 100 : 150;

      // ── Régulation démographique ──────────────────────────────────────────
      const spConfig = SPECIES[sp.speciesId];
      const count    = speciesCounts.get(sp.speciesId) ?? 0;
      const atMax    = spConfig != null && count >= spConfig.maxPop;
      const atMin    = spConfig != null && count <= spConfig.minPop;

      // matingNeed bloqué si plafond atteint ; boosté si population en danger
      if (!atMax && stats.energy >= HUNGER_THRESHOLD) {
        const rate = atMin ? MATING_NEED_RATE * 3 : MATING_NEED_RATE;
        decision.matingNeed = Math.min(100, decision.matingNeed + rate);
      }

      // ── Priorité 1 : fuite ───────────────────────────────────────────────
      // herbivores, omnivores et le joueur (filtrer) fuient les prédateurs
      if (sp.role === 'herbivore' || sp.role === 'omnivore' || sp.role === 'filtrer') {
        const threat = this._nearestInRadius(
          pos,
          predators.filter(p => p.sp.speciesId !== sp.speciesId),
          THREAT_RADIUS,
        );
        if (threat) {
          decision.intent    = 'flee';
          decision.targetPos = { x: threat.pos.x, y: threat.pos.y };
          decision.targetId  = null;
          continue;
        }
      }

      if (decision.intent != null && decision.targetPos != null) {
        if (decision.intent === 'wander') {
          // Si la cible d'errance est atteinte ou plus pertinente, en choisir une autre
          const dist = this._dist(pos, decision.targetPos);
          if (dist < 5 || dist > viewRadius) {
            decision.intent    = null;
            decision.targetPos = null;
          } else {
            continue;
          }
        } else if (decision.intent === 'mate' && stats.energy < 20) {
          // Abandonner la recherche de partenaire seulement si énergie critique
          decision.intent    = null;
          decision.targetPos = null;
          decision.targetId  = null;
        } else {
          continue; // décision déjà prise et toujours pertinente
        }
      }

      const hungry = stats.energy < HUNGER_THRESHOLD;

      // ── Priorité 2 : faim ────────────────────────────────────────────────
      if (hungry) {
        const role = sp.role;

        if (role === 'herbivore' || role === 'filtrer') {
          const foods = foodAvailable.map(f => ({ id: f.id, pos: f.pos }));
          const food  = this._nearestInRadius(pos, foods, viewRadius) ?? this._nearest(pos, foods);
          if (food) {
            decision.intent    = 'eat';
            decision.targetPos = food.pos;
            decision.targetId  = food.id;
          } else {
            this._setWander(pos, decision, id);
          }

        } else if (role === 'predator') {
          const huntable = preyForPredator.filter(p => p.sp.speciesId !== sp.speciesId && entityData.has(p.id));
          const prey     = this._nearestInRadius(pos, huntable, viewRadius) ?? this._nearest(pos, huntable);
          if (prey) {
            decision.intent    = 'hunt';
            decision.targetPos = prey.pos;
            decision.targetId  = prey.id;
          } else {
            this._setWander(pos, decision, id);
          }

        } else if (role === 'apex') {
          const huntable = preyForApex.filter(p => p.sp.speciesId !== sp.speciesId && entityData.has(p.id));
          const prey     = this._nearestInRadius(pos, huntable, viewRadius) ?? this._nearest(pos, huntable);
          if (prey) {
            decision.intent    = 'hunt';
            decision.targetPos = prey.pos;
            decision.targetId  = prey.id;
          } else {
            this._setWander(pos, decision,id);
          }

        } else if (role === 'omnivore') {
          const huntable = preyForOmnivore.filter(p => p.sp.speciesId !== sp.speciesId && entityData.has(p.id));
          const foods    = foodAvailable.map(f => ({ id: f.id, pos: f.pos }));
          const nearFood = this._nearestInRadius(pos, foods, viewRadius);
          const nearPrey = this._nearestInRadius(pos, huntable, viewRadius);

          if (nearFood && nearPrey) {
            if (this._dist(pos, nearFood.pos) <= this._dist(pos, nearPrey.pos)) {
              decision.intent    = 'eat';
              decision.targetPos = nearFood.pos;
              decision.targetId  = nearFood.id;
            } else {
              decision.intent    = 'hunt';
              decision.targetPos = nearPrey.pos;
              decision.targetId  = nearPrey.id;
            }
          } else if (nearFood) {
            decision.intent    = 'eat';
            decision.targetPos = nearFood.pos;
            decision.targetId  = nearFood.id;
          } else if (nearPrey) {
            decision.intent    = 'hunt';
            decision.targetPos = nearPrey.pos;
            decision.targetId  = nearPrey.id;
          } else {
            this._setWander(pos, decision,id);
          }
        }
        continue;
      }

      // ── Priorité 3 : reproduction ─────────────────────────────────────────
      const baseMating      = MATING_THRESHOLD_BY_ROLE[sp.role] ?? 60;
      const matingThreshold = atMin ? baseMating * 0.5 : baseMating;
      if (decision.matingNeed >= matingThreshold) {
        const congeners = [];
        for (const [otherId, other] of entityData) {
          if (otherId !== id && other.sp.speciesId === sp.speciesId) {
            congeners.push({ id: otherId, pos: other.pos });
          }
        }
        const partner = this._nearestInRadius(pos, congeners, viewRadius+decision.matingNeed);
        if (partner) {
          decision.intent    = 'mate';
          decision.targetPos = partner.pos;
          decision.targetId  = partner.id;
          continue;
        }
      }

      // ── Priorité 4 : errance ─────────────────────────────────────────────
      this._setWander(pos, decision,id);
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  _nearestInRadius(origin, candidates, radius) {
    let minD = Infinity, best = null;
    for (const c of candidates) {
      const d = this._dist(origin, c.pos);
      if (d < radius && d < minD) { minD = d; best = c; }
    }
    return best;
  }

  _nearest(origin, candidates) {
    let minD = Infinity, best = null;
    for (const c of candidates) {
      const d = this._dist(origin, c.pos);
      if (d < minD) { minD = d; best = c; }
    }
    return best;
  }

  _setWander(pos, decision,id) {
    decision.intent = 'wander';
     const genome     = this.em.getComponent(id, 'Genome');

    if (!decision.targetPos) {
      const angle = Math.random() * Math.PI * 2;
      const dist  = 40 + genome.handler.read10('errance') * 20;
      decision.targetPos = {
        x: Math.max(0, Math.min(this.worldW, pos.x + Math.cos(angle) * dist)),
        y: Math.max(0, Math.min(this.worldH, pos.y + Math.sin(angle) * dist)),
      };
      decision.targetId = null;
    }
  }

  _dist(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
