// ReproductionSystem.js — reproduction asexuée avec mutation
//
// Responsabilités :
//   - Vérifier la maturité (âge + énergie) et armer le flag isMature
//   - Gonad   → bourgeonnement asexué (case voisine libre)
//   - Sporulation → dispersion étendue (végétaux, sessiles)
//   - Appliquer mutationADN() avec un fort taux pour maximiser la diversité
//   - Facturer l'énergie au parent ; bonus Uterus sur l'énergie initiale de l'offspring
//
// Appelé APRÈS MetabolismSystem : l'organisme doit avoir mangé avant de se reproduire.

import { mutationADN } from '../../genetic/ADNPlante';

// ── Constantes de calibration ─────────────────────────────────────────────────

const MUTATION_RATE              = 0.15;  // fort taux (vs 0.05 base) — diversité évolutive maximale
const REPRO_ENERGY_THRESHOLD     = 0.95;  // doit avoir ≥ 55 % de maxEnergy pour se reproduire (↓ de 0.65)
const OFFSPRING_ENERGY_FRACTION  = 0.30;  // le parent cède 30 % de maxEnergy à l'offspring
const GONAD_PROB_K               = 0.005; // prob/tick = Gonad.size × K  (~1 naissance / 200 ticks à size=1, ↑ de 0.002)
const SPORE_PROB_K               = 0.002; // Sporulation : dispersion végétale (↑ de 0.001)
const SPORE_MUTATION_RATE        = 0.2;  // spores mutent plus, marre — fidélité parentale plus grande
const SPORE_ENERGY_COST          = 0.5;  // coût modéré — freine la multiplication géométrique
const SPORE_RADIUS               = 5;     // dispersion maximale en cases-monde
const UTERUS_ENERGY_BONUS        = 0.15;  // Uterus : offspring démarre avec + d'énergie (× size)
const MATURITY_ENERGY_CAP        = 0.40;  // plafond du seuil énergétique pour la maturité par l'âge
                                          // évite qu'un organisme vieux mais affamé reste éternellement juvénile
const CHROMA_REPRO_BONUS         = 0.60;  // Chromatophore : bonus multiplicatif sur la prob. de reproduction
                                          // (+60% à size=1) — la beauté attire, même sans partenaire

// ── Classe principale ─────────────────────────────────────────────────────────

export class ReproductionSystem {
  /**
   * @param {EntityManager} entityManager
   * @param {World}         world
   * @param {Function}      createOrganismFn  (x, y, adn) → entityId
   *   Callback vers C11Engine.createOrganism — évite la dépendance circulaire.
   */
  constructor(entityManager, world, createOrganismFn) {
    this.entityManager  = entityManager;
    this.world          = world;
    this.createOrganism = createOrganismFn;
  }

  // ── API publique ──────────────────────────────────────────────────────────

  update(_deltaTime) {
    const entities = this.entityManager.getEntitiesWithComponents(
      ['Metabolism', 'Position', 'Genome', 'BodyPlan']
    );

    let asexualBirths = 0;
    let spores        = 0;

    for (const entityId of entities) {
      const metabolism = this.entityManager.getComponent(entityId, 'Metabolism');
      if (!metabolism.alive) continue;

      // ── Maturité ──────────────────────────────────────────────────────────
      // GrowthSystem peut déjà avoir positionné isMature (growthFactor ≥ 0.85).
      // Fallback par l'âge : plafonner le seuil énergétique à MATURITY_ENERGY_CAP
      // pour qu'un organisme vieux mais affamé finisse quand même par mûrir.
      if (!metabolism.isMature) {
        const energyRequired = metabolism.maxEnergy
          * Math.min(metabolism.maturityEnergyThreshold, MATURITY_ENERGY_CAP);
        if (
          metabolism.age    >= metabolism.maturityAge &&
          metabolism.energy >= energyRequired
        ) {
          metabolism.isMature = true;
        } else {
          continue;
        }
      }

      // ── Gonad : bourgeonnement asexué ────────────────────────────────────
      const gonad = this.entityManager.getComponent(entityId, 'Gonad');
      if (gonad && metabolism.energy >= metabolism.maxEnergy * REPRO_ENERGY_THRESHOLD) {
        const chroma    = this.entityManager.getComponent(entityId, 'Chromatophore');
        const chromaK   = chroma ? 1.0 + chroma.size * CHROMA_REPRO_BONUS : 1.0;
        if (Math.random() < gonad.size * GONAD_PROB_K * chromaK) {
          if (this._budOff(entityId, metabolism)) asexualBirths++;
        }
      }
      const bodypl= this.entityManager.getComponent(entityId, 'BodyPlan');
      if(bodypl.phylum==='VEGETAL'&& metabolism.energy >= metabolism.maxEnergy * 0.60
        && Math.random() <GONAD_PROB_K
      )
        if (this._budOff(entityId, metabolism)) asexualBirths++;

      // ── Sporulation : dispersion végétale / sessile ──────────────────────
      const sporu = this.entityManager.getComponent(entityId, 'Sporulation');
      if (sporu && metabolism.energy >= metabolism.maxEnergy * 0.40) {
        if (Math.random() < sporu.size * SPORE_PROB_K) {
          if (this._sporulate(entityId, metabolism)) spores++;
        }
      }
    }

    return { asexualBirths, spores };
  }

  // ── Bourgeonnement asexué (Gonad) ─────────────────────────────────────────

  /**
   * L'organisme produit un descendant dans une case voisine libre.
   * Le descendant hérite du génome muté ; le parent paie le coût énergétique.
   */
  _budOff(entityId, metabolism) {
    const position = this.entityManager.getComponent(entityId, 'Position');
    const cell     = this._freeNeighbor(position.x, position.y);
    if (!cell) return false;

    const genome   = this.entityManager.getComponent(entityId, 'Genome');
    const childADN = mutationADN(genome.adn, MUTATION_RATE);

    // Coût pour le parent
    metabolism.energy -= metabolism.maxEnergy * OFFSPRING_ENERGY_FRACTION;

    // Création
    const childId = this.createOrganism(cell.x, cell.y, childADN);

    // Bonus Uterus : l'offspring démarre avec plus d'énergie initiale
    const uterus = this.entityManager.getComponent(entityId, 'Uterus');
    if (uterus) {
      const childMeta = this.entityManager.getComponent(childId, 'Metabolism');
      if (childMeta) {
        childMeta.energy = Math.min(
          childMeta.maxEnergy,
          childMeta.energy + childMeta.maxEnergy * UTERUS_ENERGY_BONUS * uterus.size
        );
      }
    }

    return true;
  }

  // ── Sporulation (végétaux, sessiles) ──────────────────────────────────────

  /**
   * Libère une spore dans un rayon SPORE_RADIUS.
   * Coût léger, taux de mutation plus faible (spores = fidélité parentale plus élevée).
   */
  _sporulate(entityId, metabolism) {
    const position = this.entityManager.getComponent(entityId, 'Position');
    const sporu    = this.entityManager.getComponent(entityId, 'Sporulation');
    const bodyPlan = this.entityManager.getComponent(entityId, 'BodyPlan');
    const radius   = Math.max(1, Math.ceil(sporu.size * SPORE_RADIUS));

    // Plantes ancrées : la spore doit atterrir sur un substrat ancrable (GROUND/SEAFLOOR/ROCK),
    // pas dans l'air ni dans l'eau libre — empêche la colonisation du biome aerial.
    const needsAnchor = bodyPlan?.isAnchored ?? false;
    const cell = this._freeCellInRadius(position.x, position.y, radius, needsAnchor);
    if (!cell) return false;

    const genome   = this.entityManager.getComponent(entityId, 'Genome');
    const childADN = mutationADN(genome.adn, SPORE_MUTATION_RATE);

    metabolism.energy -= metabolism.maxEnergy * SPORE_ENERGY_COST;

    this.createOrganism(cell.x, cell.y, childADN);
    return true;
  }

  // ── Recherche de cases libres ─────────────────────────────────────────────

  /** Case voisine directe (8-voisinage) libre et non-aérienne sauf si l'entité a Wing. */
  _freeNeighbor(x, y) {
    const neighbors = this.world.getNeighbors(x, y);
    const free = neighbors.filter(n => this.world.isFree(n.x, n.y));
    if (free.length === 0) return null;
    return free[Math.floor(Math.random() * free.length)];
  }

  /**
   * Cherche une case libre en spirale carrée depuis le centre, jusqu'au rayon demandé.
   * Arrête dès qu'un anneau contient au moins une case candidate.
   * needsAnchor = true → utilise isFreeForAnchored (GROUND/SEAFLOOR/ROCK seulement).
   */
  _freeCellInRadius(x, y, radius, needsAnchor = false) {
    for (let r = 1; r <= radius; r++) {
      const candidates = [];
      for (let dx = -r; dx <= r; dx++) {
        for (let dy = -r; dy <= r; dy++) {
          // Ne considère que le bord de l'anneau carré
          if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
          const pos = this.world.wrap(x + dx, y + dy);
          const ok = needsAnchor
            ? this.world.isFreeForAnchored(pos.x, pos.y)
            : this.world.isFree(pos.x, pos.y);
          if (ok) candidates.push(pos);
        }
      }
      if (candidates.length > 0) {
        return candidates[Math.floor(Math.random() * candidates.length)];
      }
    }
    return null;
  }
}
