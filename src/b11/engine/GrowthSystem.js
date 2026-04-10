// GrowthSystem.js — croissance morphologique des organismes
//
// Responsabilités :
//   - Lire les tailles d'organes depuis le génome (initOrganism)
//   - Calculer adultMass depuis les composants exprimés
//   - Mettre à jour growthFactor tick par tick (courbe logistique, énergie-dépendante)
//   - Dériver segmentSizes (données visuelles lues par le renderer)
//   - Valider les contraintes appendices/muscle → locomotionEfficiency
//   - Recalculer maintenanceCost proportionnel à la taille courante
//
// Séparé de MetabolismSystem : opère sur BodyPlan (morphologie), pas sur le flux énergétique.
// Dépend de Metabolism uniquement pour lire/consommer l'énergie de croissance.

import { ORGAN_COMPONENTS, ORGAN_MASSES } from './Components';

// ── Constantes de calibration ──────────────────────────────────

const BIRTH_GROWTH      = 0.05;   // growthFactor initial
const MATURITY_GROWTH   = 0.85;   // seuil de maturité sexuelle
const GROWTH_K_BASE     = 0.002;   // taux logistique de base (pic à growthFactor=0.5)
const GROWTH_K_MUSCLE   = 0.01;   // bonus de vitesse par unité de MuscleFiber.size
const GROWTH_E_FACTOR   = 0.30;   // énergie consommée par unité de masse construite
const MUSCLE_BUDGET_K   = 4.0;    // budget musculaire = MuscleFiber.size × K
const NOTOCHORD_BONUS   = 0.25;   // bonus budget muscle chez les Chordés (notochorde)
const MAX_LOCO_PENALTY  = 0.80;   // pénalité locomotion maximale (jamais < 20%)
const MAINTENANCE_K     = 0.08;   // coût maintenance = masse × size × K
const APPENDICE_MAINT_K = 0.05;   // fraction du coût musculaire → maintenance par tick

// ── Coût musculaire par paire × size ──────────────────────────
const APPENDICE_MUSCLE_COST = {
  Leg:      1.2,  // pattes : poussée contre substrat, coût maximal
  Fin:      0.6,  // nageoires : flottabilité assiste la propulsion
  Tentacle: 0.4,  // tentacules : hydraulique ou muscle lisse, bon marché
  Wing:     2.0,  // ailes : puissance massique la plus élevée (vol)
};

// ── Proportions normalisées des segments par embranchement ────
// wr, hr : fraction de displaySize (1.0 = taille totale de l'organisme)
const SEGMENT_SHAPES = {
  CHORDATA: {
    HEAD: { wr: 0.55, hr: 0.20 },  // céphalon large, court
    BODY: { wr: 0.40, hr: 0.80 },  // tronc myotomique, axe long
  },
  ARTHROPODA: {
    HEAD:    { wr: 0.60, hr: 0.22 },  // céphalon large (yeux + pièces buccales)
    THORAX:  { wr: 0.50, hr: 0.38 },  // bloc locomoteur (pattes)
    ABDOMEN: { wr: 0.45, hr: 0.40 },  // gut + gonades
  },
  MOLLUSCA: {
    HEAD:   { wr: 0.50, hr: 0.18 },  // tête céphalopode, yeux latéraux
    MANTLE: { wr: 0.70, hr: 0.55 },  // masse viscérale dominante
    FOOT:   { wr: 0.55, hr: 0.27 },  // organe locomoteur aplati
  },
  // VERMES et VEGETAL : formes dynamiques — traitées séparément
  RADIATA: {
    BODY: { wr: 1.00, hr: 0.45 },  // cloche/disque aplati, wr=1 → cercle
  },
};

export class GrowthSystem {
  constructor(entityManager, world) {
    this.entityManager = entityManager;
    this.world         = world;
  }

  // ── API publique ─────────────────────────────────────────────

  /**
   * Initialisation d'un nouvel organisme, appelé une fois depuis createOrganism.
   * Lit les tailles d'organes depuis le génome, calcule adultMass,
   * initialise segmentSizes et recalcule maintenanceCost.
   */
  initOrganism(entityId) {
    this._readOrganSizesFromGenome(entityId);
    const bodyPlan = this.entityManager.getComponent(entityId, 'BodyPlan');
    this._computeAdultMass(entityId, bodyPlan);
    this._computeSegmentSizes(entityId, bodyPlan);
    this._validateAppendices(entityId, bodyPlan);
    this._updateMaintenanceCost(entityId, bodyPlan);
  }

  /**
   * Mise à jour de la croissance, appelée à chaque tick.
   * Ne traite que les organismes vivants non encore adultes.
   */
  update(_deltaTime) {
    const entities = this.entityManager.getEntitiesWithComponents(['Metabolism', 'BodyPlan']);
    for (const entityId of entities) {
      const metabolism = this.entityManager.getComponent(entityId, 'Metabolism');
      if (!metabolism.alive) continue;

      const bodyPlan = this.entityManager.getComponent(entityId, 'BodyPlan');
      if (bodyPlan.growthFactor >= 1.0) continue;

      this._grow(entityId, bodyPlan, metabolism);
    }
  }

  // ── Initialisation ────────────────────────────────────────────

  /**
   * Lit la taille de chaque organe exprimé depuis le génome.
   * Convention : gène "mouthSize", "brainSize", etc. → plage [0.5 ; 1.5]
   */
  _readOrganSizesFromGenome(entityId) {
    const genome  = this.entityManager.getComponent(entityId, 'Genome');
    const handler = genome.handler;

    for (const organName of Object.keys(ORGAN_COMPONENTS)) {
      const organ = this.entityManager.getComponent(entityId, organName);
      if (!organ || organ.size === undefined) continue;

      // camelCase : "BrainSize" → "brainSize"
      const geneKey = organName[0].toLowerCase() + organName.slice(1) + 'Size';
      organ.size = 0.5 + handler.readFloat(geneKey) * 1.0;   // 0.5 – 1.5
    }
  }

  /**
   * Somme les masses des organes (pondérées par size) + appendices → adultMass
   */
  _computeAdultMass(entityId, bodyPlan) {
    let mass = 0;

    for (const organName of Object.keys(ORGAN_COMPONENTS)) {
      const organ = this.entityManager.getComponent(entityId, organName);
      if (!organ) continue;
      mass += (ORGAN_MASSES[organName] ?? 1) * (organ.size ?? 1);
    }

    for (const app of bodyPlan.appendices ?? []) {
      mass += app.pairs * (app.size ?? 1) * 2;
    }

    bodyPlan.adultMass = Math.max(1, mass);
  }

  // ── Tailles de segments ───────────────────────────────────────

  /**
   * Calcule segmentSizes en cellules-monde.
   * displaySize = cbrt(growthFactor × adultMass) — dimension linéaire ∝ masse^(1/3)
   */
  _computeSegmentSizes(entityId, bodyPlan) {
    const g           = bodyPlan.growthFactor;
    const displaySize = Math.cbrt(g * bodyPlan.adultMass);
    const phylum      = bodyPlan.phylum;

    if (phylum === 'VERMES') {
      this._computeWormSegments(bodyPlan, displaySize);
    } else if (phylum === 'VEGETAL') {
      this._computeVegetalSegments(bodyPlan, displaySize);
    } else {
      const shapes = SEGMENT_SHAPES[phylum] ?? SEGMENT_SHAPES.RADIATA;
      for (const seg of bodyPlan.segments) {
        const shape = shapes[seg] ?? { wr: 0.5, hr: 0.5 };
        bodyPlan.segmentSizes[seg] = {
          w: displaySize * shape.wr,
          h: displaySize * shape.hr,
        };
      }
    }
  }

  /** Ver : N segments identiques empilés, élargis si segmentCount < 3 */
  _computeWormSegments(bodyPlan, displaySize) {
    const n  = bodyPlan.segmentCount ?? bodyPlan.segments.length;
    const wr = n < 3 ? 0.45 : 0.35;
    const hr = 1.0 / n;
    for (let i = 0; i < n; i++) {
      bodyPlan.segmentSizes[i] = {
        w: displaySize * wr,
        h: displaySize * hr,
      };
    }
  }

  /** Végétal : stipe fin qui s'élargit avec le nombre de branches */
  _computeVegetalSegments(bodyPlan, displaySize) {
    const branches = bodyPlan.branchCount ?? 1;
    const wr = Math.min(0.85, 0.15 + branches * 0.08);
    bodyPlan.segmentSizes['BODY'] = {
      w: displaySize * wr,
      h: displaySize * 1.0,
    };
  }

  // ── Contraintes musculaires ───────────────────────────────────

  /**
   * Compare le coût total des appendices au budget musculaire.
   * Si dépassement → pénalité sur locomotionEfficiency (jamais < 20%).
   * Les appendices ne sont PAS supprimés — le génotype est préservé.
   */
  _validateAppendices(entityId, bodyPlan) {
    if (!bodyPlan.appendices?.length) {
      bodyPlan.locomotionEfficiency = 1.0;
      return;
    }

    const muscle    = this.entityManager.getComponent(entityId, 'MuscleFiber');
    const notochord = this.entityManager.getComponent(entityId, 'Notochord');

    let muscleBudget = muscle ? muscle.size * MUSCLE_BUDGET_K : 0;

    // Notochorde amplifie l'efficacité musculaire chez les Chordés
    if (notochord && bodyPlan.phylum === 'CHORDATA') {
      muscleBudget *= 1 + notochord.size * NOTOCHORD_BONUS;
    }

    let totalCost = 0;
    for (const app of bodyPlan.appendices) {
      const unitCost = APPENDICE_MUSCLE_COST[app.type] ?? 0.5;
      totalCost += app.pairs * (app.size ?? 1) * unitCost;
    }

    if (totalCost <= muscleBudget) {
      bodyPlan.locomotionEfficiency = 1.0;
    } else {
      const overrun = totalCost - muscleBudget;
      const penalty = Math.min(MAX_LOCO_PENALTY, overrun / muscleBudget);
      bodyPlan.locomotionEfficiency = 1.0 - penalty;
    }
  }

  // ── Maintenance ───────────────────────────────────────────────

  /**
   * Recalcule maintenanceCost en fonction de la taille courante.
   * Un organisme de growthFactor=0.05 dépense ~5% du coût adulte.
   */
  _updateMaintenanceCost(entityId, bodyPlan) {
    const metabolism = this.entityManager.getComponent(entityId, 'Metabolism');

    // Coût organes
    let organCost = 0;
    for (const organName of Object.keys(ORGAN_COMPONENTS)) {
      const organ = this.entityManager.getComponent(entityId, organName);
      if (!organ) continue;
      organCost += (ORGAN_MASSES[organName] ?? 1) * (organ.size ?? 1) * MAINTENANCE_K;
    }

    // Coût appendices (différencié par type)
    let appendiceCost = 0;
    for (const app of bodyPlan.appendices ?? []) {
      const unitCost = APPENDICE_MUSCLE_COST[app.type] ?? 0.5;
      appendiceCost += app.pairs * (app.size ?? 1) * unitCost * APPENDICE_MAINT_K;
    }

    metabolism.maintenanceCost = (organCost + appendiceCost) * bodyPlan.growthFactor;
  }

  // ── Croissance ────────────────────────────────────────────────

  /**
   * Applique un pas de croissance logistique, énergie-dépendant.
   *
   * Courbe : rate = k × g × (1-g) × 4   (pic à g=0.5)
   * La croissance consomme : rate × adultMass × GROWTH_E_FACTOR
   * Elle stalle si l'énergie disponible < coût ou si energie < 25% du max.
   */
  _grow(entityId, bodyPlan, metabolism) {
    // Énergie minimale requise pour croître
    if (metabolism.energy / metabolism.maxEnergy < 0.25) return;

    const surplus = metabolism.energy - metabolism.maintenanceCost * 10;
    if (surplus <= 0) return;

    // Taux logistique (muscle accélère légèrement la croissance)
    const muscle = this.entityManager.getComponent(entityId, 'MuscleFiber');
    const k      = GROWTH_K_BASE + (muscle ? muscle.size * GROWTH_K_MUSCLE : 0);
    const g      = bodyPlan.growthFactor;
    const rate   = k * g * (1 - g) * 0.5;   // ≈ 0.04/tick au pic

    // Coût énergétique de la construction de tissu
    const energyCost = rate * bodyPlan.adultMass * GROWTH_E_FACTOR;
    if (metabolism.energy < energyCost) return;

    metabolism.energy      -= energyCost;
    bodyPlan.growthFactor   = Math.min(1.0, g + rate);

    // Mises à jour morphologiques
    this._computeSegmentSizes(entityId, bodyPlan);
    this._validateAppendices(entityId, bodyPlan);
    this._updateMaintenanceCost(entityId, bodyPlan);

    // Maturité sexuelle
    if (!metabolism.isMature && bodyPlan.growthFactor >= MATURITY_GROWTH) {
      metabolism.isMature = true;
    }
  }
}
