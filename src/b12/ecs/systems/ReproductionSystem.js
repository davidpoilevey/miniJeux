/**
 * ReproductionSystem — gère la reproduction physique entre entités
 *
 * Détecte les paires d'entités qui sont proches ET mutuellement en intent='mate',
 * et déclenche la reproduction : coût énergétique, reset matingNeed, spawn descendant(s).
 *
 * Appelé après MovementSystem (les entités sont déjà à leur position du tick courant).
 * MovementSystem ne gère plus la reproduction — il amène les entités au contact,
 * ReproductionSystem prend le relais.
 *
 * Gènes joueur pris en compte (offspring uniquement) :
 *   - ponte_optimisee  : 2 descendants au lieu de 1
 *   - vivipare         : descendant commence avec +30 énergie
 *   - soins_parentaux  : descendant commence avec +100 maxAge
 */

const MATE_RADIUS      = 14;  // pixels — cohérent avec CONSUME_RADIUS du MovementSystem
const MATE_ENERGY_MIN  = 30;  // énergie minimale conservée après reproduction
const MATE_ENERGY_COST = 20;  // énergie dépensée par chaque parent (× offspringCount)

export class ReproductionSystem {
  constructor(entityManager) {
    this.em            = entityManager;
    this.spawnCallback = null; // (sp, parentPos, playerGenes) => void — injecté par Engine
  }

  /** Injecté par Engine pour spawner les descendants. */
  setSpawnCallback(fn) { this.spawnCallback = fn; }

  /**
   * @param {Set<string>} playerGenes - gènes débloqués du joueur
   */
  update(playerGenes = new Set()) {
    const entityIds = this.em.getEntitiesWithComponents(['Position', 'Species', 'Stats', 'Decision']);
    const processed = new Set(); // éviter de traiter deux fois la même paire

    for (const id of entityIds) {
      if (processed.has(id)) continue;
      if (!this.em.getComponent(id, 'Species')) continue; // détruit plus tôt ce tick

      const decision = this.em.getComponent(id, 'Decision');
      if (decision.intent !== 'mate' || !decision.targetId) continue;

      const partnerId = decision.targetId;
      if (processed.has(partnerId)) continue;

      // Partenaire toujours vivant ?
      if (!this.em.getComponent(partnerId, 'Species')) {
        decision.targetPos = null;
        decision.targetId  = null;
        decision.intent    = 'wander';
        continue;
      }

      // Même espèce ? (garanti par DecisionSystem, vérification défensive)
      const sp        = this.em.getComponent(id, 'Species');
      const partnerSp = this.em.getComponent(partnerId, 'Species');
      if (sp.speciesId !== partnerSp.speciesId) continue;

      // Partenaire aussi en mode mate ?
      const partnerDecision = this.em.getComponent(partnerId, 'Decision');
      if (partnerDecision.intent !== 'mate') continue;

      // Proximité physique ?
      const pos     = this.em.getComponent(id, 'Position');
      const partPos = this.em.getComponent(partnerId, 'Position');
      if (this._dist(pos, partPos) > MATE_RADIUS) continue;

      // Énergie suffisante des deux côtés ?
      const stats        = this.em.getComponent(id, 'Stats');
      const partnerStats = this.em.getComponent(partnerId, 'Stats');
      if (stats.energy < MATE_ENERGY_MIN || partnerStats.energy < MATE_ENERGY_MIN) continue;

      // ── Reproduction ────────────────────────────────────────────────────
      stats.energy        -= MATE_ENERGY_COST;
      partnerStats.energy -= MATE_ENERGY_COST;

      decision.matingNeed        = 0;
      partnerDecision.matingNeed = 0;

      decision.intent            = 'wander';
      decision.targetPos         = null;
      decision.targetId          = null;
      partnerDecision.intent     = 'wander';
      partnerDecision.targetPos  = null;
      partnerDecision.targetId   = null;

      // ponte_optimisee : 2 descendants, mais coûte un 2e MATE_ENERGY_COST si l'énergie le permet
      const hasDoubleSpawn = sp.isPlayer && playerGenes.has('ponte_optimisee');
      const offspringCount = (hasDoubleSpawn && stats.energy >= MATE_ENERGY_COST && partnerStats.energy >= MATE_ENERGY_COST) ? 2 : 1;
      if (offspringCount === 2) {
        stats.energy        -= MATE_ENERGY_COST;
        partnerStats.energy -= MATE_ENERGY_COST;
      }
      for (let i = 0; i < offspringCount; i++) {
        if (this.spawnCallback) this.spawnCallback(sp, pos, playerGenes, id, partnerId);
      }

      processed.add(id);
      processed.add(partnerId);
    }
  }

  _dist(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
