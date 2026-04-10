// MovementSystem.js — déplacement des organismes
//
// v2 — Vision élargie, herbivorie, prédation, fuite
//
// Responsabilités :
//   - Vision étendue selon capteurs (Brain+Eye > Eye > Brain > Chemo > LateralLine > primitif)
//   - Targeting herbivore : Mouth → vise les végétaux dans le champ de perception
//   - Targeting prédateur : Jaw → vise les proies animales dans le champ de perception
//   - Fuite : sans Jaw, pénalise fortement les cases proches d'un prédateur (Jaw) détecté
//   - Navigation vers cible distante : se dirige vers la meilleure case visible en 1 step
//   - Fallback scoring local quand aucune cible pertinente n'est détectée
//   - Contrainte de biome : aérien requiert Wing
//
// Appelé AVANT MetabolismSystem : l'organisme se déplace d'abord, mange ensuite.
// La prédation adjacente est gérée dans MetabolismSystem._predation.

// ── Constantes de calibration ────────────────────────────────────────────────

const BASE_SPEED      = 0.10;   // probabilité de base par tick
const SIZE_SLOWDOWN_K = 0.15;   // ralentissement par unité de displaySize

const APPENDICE_SPEED_BONUS = {
  Leg:      { ground: 0.25, aerial: 0.05, marine: 0.02, deep: 0.02 },
  Fin:      { marine: 0.22, deep:   0.22, ground: 0.02, aerial: 0.01 },
  Tentacle: { marine: 0.14, deep:   0.14, ground: 0.07, aerial: 0.01 },
  Wing:     { aerial: 0.38, ground: 0.09, marine: 0.01, deep:   0.01 },
};

// Portée de vision en cases-monde selon capteurs
const VISION_RANGE_BRAIN_EYE = 5;   // vision maximale
const VISION_RANGE_EYE       = 4;   // vision optique
const VISION_RANGE_BRAIN     = 3;   // intégration mentale seule
const VISION_RANGE_CHEMO     = 3;   // olfaction chimique
const VISION_RANGE_LATERAL   = 2;   // ligne latérale (vibrations)

// Valeurs de cibles dans le champ de vision étendu
const PREY_ANIMAL_VALUE_K  =  8.0;   // Jaw  : proie animale
const PREY_VEGETAL_VALUE_K =  5.0;   // Mouth : végétal (herbivorie)
const PREDATOR_FLEE_K      = -12.0;  // sans Jaw : fuite d'un prédateur détecté

// ── Classe principale ─────────────────────────────────────────────────────────

export class MovementSystem {
  constructor(entityManager, world) {
    this.entityManager = entityManager;
    this.world         = world;
  }

  // ── API publique ──────────────────────────────────────────────────────────

  update(_deltaTime) {
    const entities = this.entityManager.getEntitiesWithComponents(
      ['Metabolism', 'Position', 'BodyPlan']
    );

    for (const entityId of entities) {
      const metabolism = this.entityManager.getComponent(entityId, 'Metabolism');
      if (!metabolism.alive) continue;

      const bodyPlan = this.entityManager.getComponent(entityId, 'BodyPlan');

      // Organismes fixés
      if (this.entityManager.hasComponent(entityId, 'Anchoring')) continue;
      if (bodyPlan.isAnchored) continue;

      const position = this.entityManager.getComponent(entityId, 'Position');

      if (Math.random() > this._moveProbability(bodyPlan, position)) continue;

      const target = this._selectTarget(entityId, position, bodyPlan);
      if (!target) continue;

      this.world.removeEntity(position.x, position.y);
      position.x = target.x;
      position.y = target.y;
      this.world.setEntity(target.x, target.y, entityId);
    }
  }

  // ── Probabilité de mouvement ──────────────────────────────────────────────

  _moveProbability(bodyPlan, position) {
    const biome = this.world.getBiome(position.x, position.y);
    const speed = this._speedFactor(bodyPlan, biome);
    return Math.min(1.0, speed * (bodyPlan.locomotionEfficiency ?? 1.0));
  }

  _speedFactor(bodyPlan, biome) {
    let speed = BASE_SPEED;

    for (const app of bodyPlan.appendices ?? []) {
      const table = APPENDICE_SPEED_BONUS[app.type];
      if (!table) continue;
      speed += app.pairs * (app.size ?? 1) * (table[biome] ?? 0);
    }

    const displaySize = Math.cbrt(
      (bodyPlan.growthFactor ?? 0.05) * Math.max(1, bodyPlan.adultMass ?? 10)
    );
    const sizeFactor = 1 / (1 + displaySize * SIZE_SLOWDOWN_K);

    return speed * sizeFactor;
  }

  // ── Sélection de la case cible ────────────────────────────────────────────

  /**
   * 1. Vision étendue (range > 1) : scanner le champ de perception,
   *    trouver la meilleure cible, se diriger vers elle en 1 step.
   * 2. Fallback scoring local : gradient nutritif/respiratoire sur les voisins.
   * 3. Primitif : marche aléatoire.
   */
  _selectTarget(entityId, position, _bodyPlan) {
    const neighbors  = this.world.getNeighbors(position.x, position.y);
    const candidates = neighbors.filter(n => this._canMoveTo(entityId, n));
    if (candidates.length === 0) return null;

    const visionRange = this._getVisionRange(entityId);

    if (visionRange > 1) {
      const goal = this._scanForGoal(entityId, position, visionRange);
      if (goal) {
        const toward = this._moveToward(goal, candidates);
        if (toward) return toward;
      }
    }

    // Fallback : scoring local sur les 8 voisins
    const hasBrain    = this.entityManager.hasComponent(entityId, 'Brain');
    const hasSense    = hasBrain
                      || this.entityManager.hasComponent(entityId, 'Eye')
                      || this.entityManager.hasComponent(entityId, 'Chemoreceptor');
    const hasGanglion = this.entityManager.hasComponent(entityId, 'GanglionCluster');

    if (hasSense)                            return this._bestCandidate(entityId, candidates, hasBrain);
    if (hasGanglion && Math.random() < 0.5) return this._bestCandidate(entityId, candidates, false);
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  // ── Vision étendue ────────────────────────────────────────────────────────

  /**
   * Portée de perception selon les capteurs présents.
   * Brain+Eye = vision maximale (5 cases).
   * LateralLine = détecte les vibrations des organismes mobiles (2 cases).
   */
  _getVisionRange(entityId) {
    const hasBrain = this.entityManager.hasComponent(entityId, 'Brain');
    const hasEye   = this.entityManager.hasComponent(entityId, 'Eye');
    if (hasBrain && hasEye)                                           return VISION_RANGE_BRAIN_EYE;
    if (hasEye)                                                       return VISION_RANGE_EYE;
    if (hasBrain)                                                     return VISION_RANGE_BRAIN;
    if (this.entityManager.hasComponent(entityId, 'Chemoreceptor')) return VISION_RANGE_CHEMO;
    if (this.entityManager.hasComponent(entityId, 'LateralLine'))   return VISION_RANGE_LATERAL;
    return 1;
  }

  /**
   * Scanne un disque de rayon `range` et retourne la case avec le meilleur score.
   * Inclut les cases occupées par des proies potentielles.
   * Retourne null si aucune case ne dépasse le seuil 0.
   */
  _scanForGoal(entityId, position, range) {
    const hasBrain = this.entityManager.hasComponent(entityId, 'Brain');
    let bestScore  = 0;   // seuil : ne pas foncer vers une zone pauvre
    let bestCell   = null;

    for (let dy = -range; dy <= range; dy++) {
      for (let dx = -range; dx <= range; dx++) {
        if (dx === 0 && dy === 0) continue;
        if (dx * dx + dy * dy > range * range) continue;

        const pos = this.world.wrap(position.x + dx, position.y + dy);
        if (this.world.isSolid(pos.x, pos.y)) continue;

        // Léger bonus de proximité : à score égal, préférer les cibles plus proches
        const dist        = Math.sqrt(dx * dx + dy * dy);
        const proximBonus = (range - dist) / range * 0.5;
        const score       = this._scoreCellGoal(entityId, pos, hasBrain) + proximBonus;

        if (score > bestScore) {
          bestScore = score;
          bestCell  = pos;
        }
      }
    }

    return bestCell;
  }

  /**
   * Score d'une case dans le champ de vision étendu.
   *   - Nutriments libres (toujours)
   *   - Végétal en vue + Mouth → bonus herbivorie
   *   - Animal en vue + Jaw   → bonus prédation
   *   - Prédateur (Jaw) en vue sans propre Jaw → malus fuite
   *   - Brain : intègre O₂ et compatibilité respiratoire
   */
  _scoreCellGoal(entityId, pos, hasBrain) {
    let score = this.world.getNutrients(pos.x, pos.y);

    const occupant = this.world.getEntity(pos.x, pos.y);
    if (occupant !== null && occupant !== entityId) {
      const occupantPlan = this.entityManager.getComponent(occupant, 'BodyPlan');
      if (occupantPlan) {
        const isVegetal      = occupantPlan.phylum === 'VEGETAL';
        const selfHasJaw     = this.entityManager.hasComponent(entityId, 'Jaw');
        const selfHasMouth   = this.entityManager.hasComponent(entityId, 'Mouth');
        const occupantHasJaw = this.entityManager.hasComponent(occupant,  'Jaw');

        if (isVegetal && selfHasMouth) {
          // Herbivorie : valeur proportionnelle à la biomasse du végétal
          const mass = (occupantPlan.adultMass ?? 5) * (occupantPlan.growthFactor ?? 0.1);
          score += mass * PREY_VEGETAL_VALUE_K;

        } else if (!isVegetal && selfHasJaw) {
          // Prédation : valeur = énergie courante de la proie
          const preyMeta = this.entityManager.getComponent(occupant, 'Metabolism');
          score += (preyMeta?.energy ?? 10) * PREY_ANIMAL_VALUE_K;

        } else if (!selfHasJaw && occupantHasJaw) {
          // Fuite : prédateur détecté, organisme sans défense
          score += PREDATOR_FLEE_K;
        }
      }
    }

    if (hasBrain) {
      const oxygen    = this.world.getOxygen(pos.x, pos.y);
      const biome     = this.world.getBiome(pos.x, pos.y);
      const respBonus = this._biomeRespCompatibility(entityId, biome);
      score += oxygen * 0.5 + respBonus * 2.0;
    }

    return score;
  }

  /**
   * Parmi les candidates libres (voisinage immédiat), choisit celle
   * qui minimise la distance euclidienne à `goal` (wrap-aware).
   */
  _moveToward(goal, candidates) {
    let best     = null;
    let bestDist = Infinity;

    for (const c of candidates) {
      let ddx = Math.abs(c.x - goal.x);
      let ddy = Math.abs(c.y - goal.y);
      // Chemin le plus court sur carte torique
      if (ddx > this.world.width  / 2) ddx = this.world.width  - ddx;
      if (ddy > this.world.height / 2) ddy = this.world.height - ddy;
      const d2 = ddx * ddx + ddy * ddy;
      if (d2 < bestDist) { bestDist = d2; best = c; }
    }

    return best;
  }

  // ── Scoring local (fallback) ──────────────────────────────────────────────

  _bestCandidate(entityId, candidates, hasBrain) {
    let best      = candidates[0];
    let bestScore = -Infinity;
    for (const n of candidates) {
      const score = this._scoreCell(entityId, n, hasBrain);
      if (score > bestScore) { bestScore = score; best = n; }
    }
    return best;
  }

  _scoreCell(entityId, n, hasBrain) {
    const nutrients = this.world.getNutrients(n.x, n.y);
    if (!hasBrain) return nutrients;

    const oxygen    = this.world.getOxygen(n.x, n.y);
    const biome     = this.world.getBiome(n.x, n.y);
    const respBonus = this._biomeRespCompatibility(entityId, biome);
    return nutrients + oxygen * 0.5 + respBonus * 2.0;
  }

  // ── Contraintes de biome ──────────────────────────────────────────────────

  /**
   * Filtre dur : case libre (isFree) + contrainte aérienne (Wing requis).
   * Les prédateurs restent adjacents à leurs proies ; l'attaque est gérée
   * dans MetabolismSystem._predation (pas de déplacement sur case occupée).
   */
  _canMoveTo(entityId, neighbor) {
    if (!this.world.isFree(neighbor.x, neighbor.y)) return false;

    if (this.world.getBiome(neighbor.x, neighbor.y) === 'aerial') {
      return this.entityManager.hasComponent(entityId, 'Wing');
    }

    return true;
  }

  _biomeRespCompatibility(entityId, biome) {
    const hasGill = this.entityManager.hasComponent(entityId, 'Gill');
    const hasLung = this.entityManager.hasComponent(entityId, 'Lung');

    if (biome === 'aerial' || biome === 'ground') {
      return hasLung ? 1.0 : 0.3;
    } else {
      return hasGill ? 1.0 : (hasLung ? 0.6 : 0.5);
    }
  }
}
