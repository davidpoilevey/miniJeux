/**
 * ChemicalSystem - Gère l'écologie chimique
 * 
 * 4 molécules neutres: Glycoaldéhyde (A), Phytosynol (B), Xenoferrine (C), Chromatin-X (D)
 * Chaque bactérie définit génétiquement sa perception de chaque molécule:
 * - ATTRACT: Se dirige vers
 * - REPEL: Fuit
 * - TOXIN: Subit des dégâts
 * - NUTRIENT: Gagne de l'énergie
 * - NEUTRAL: Ignore
 * 
 * Systèmes:
 * 1. Émission (ChemicalEmitter)
 * 2. Diffusion/dégradation (tous les 5 ticks)
 * 3. Réception (ChemicalReceptor)
 *    - Chimiotaxie (mouvement vers/depuis)
 *    - Effets (toxin/nutrient)
 */

export class ChemicalSystem {
  constructor(entityManager, world) {
    this.entityManager = entityManager;
    this.world = world;
    this.ticksSinceLastDiffusion = 0;
  }

  /**
   * Mise à jour du système
   * @param {number} deltaTime
   */
  update(deltaTime) {
    // 1. Émission
    const emissionStats = this._updateEmission();
    
    // 2. Diffusion (tous les 5 ticks pour optimiser)
    this.ticksSinceLastDiffusion++;
    if (this.ticksSinceLastDiffusion >= 5) {
      this.world.diffuseChemicals();
      this.ticksSinceLastDiffusion = 0;
    }
    
    // 3. Réception (effets et chimiotaxie)
    const receptionStats = this._updateReception();
    
    return {
      emitters: emissionStats.emitters,
      totalEmitted: emissionStats.totalEmitted,
      receptors: receptionStats.receptors,
      chemotaxisEvents: receptionStats.chemotaxisEvents,
      toxinDamage: receptionStats.toxinDamage,
      nutrientGain: receptionStats.nutrientGain
    };
  }

  /**
   * Phase 1: Émission de molécules
   * @private
   */
  _updateEmission() {
    const emitters = this.entityManager.getEntitiesWithComponents([
      'Position',
      'ChemicalEmitter'
    ]);

    let totalEmitted = 0;

    for (const entityId of emitters) {
      const position = this.entityManager.getComponent(entityId, 'Position');
      const emitter = this.entityManager.getComponent(entityId, 'ChemicalEmitter');

      // Émettre chaque molécule configurée
      for (const molecule of emitter.emittedMolecules) {
        
        this.world.emitChemical(
          position.x,
          position.y,
          molecule,
          emitter.emissionRate
        );

  // ⚠️ AJOUTER UN COÛT ÉNERGÉTIQUE
 const currentConcentration = this.world.getChemicalConcentration(
    position.x,
    position.y,
    molecule
  );
  
  // Coût augmente si déjà saturé (empêche spam)
  const emissionCost = emitter.emissionRate * 0.1 * (1 + currentConcentration * 0.5);
  
  const metabolism = this.entityManager.getComponent(entityId, 'Metabolism');
  if (metabolism) {
    metabolism.energyStored -= emissionCost;
  }
        totalEmitted += emitter.emissionRate;
      }
    }

    return {
      emitters: emitters.length,
      totalEmitted: totalEmitted.toFixed(2)
    };
  }

  /**
   * Phase 2: Réception et réaction aux molécules
   * @private
   */
_updateReception() {
  const receptors = this.entityManager.getEntitiesWithComponents([
    'Position',
    'Metabolism',
    'ChemicalReceptor'
  ]);

  let chemotaxisEvents = 0;
  let toxinDamage = 0;
  let nutrientGain = 0;

  // BATCH: Calculer gradients UNE FOIS pour toutes molécules
  const gradientCache = new Map();

  for (const entityId of receptors) {
    const position = this.entityManager.getComponent(entityId, 'Position');
    const metabolism = this.entityManager.getComponent(entityId, 'Metabolism');
    const receptor = this.entityManager.getComponent(entityId, 'ChemicalReceptor');
 const emitter = this.entityManager.getComponent(entityId, 'ChemicalEmitter');
  
    // Rayon (avec EnhancedSensors)
    let detectionRadius = receptor.detectionRadius;
    const hasEnhancedSensors = this.entityManager.hasComponent(entityId, 'EnhancedSensors');
    if (hasEnhancedSensors) {
      const sensors = this.entityManager.getComponent(entityId, 'EnhancedSensors');
      detectionRadius += sensors.detectionBonus;
    }

    // Pour chaque molécule
    for (const molecule of ['A', 'B', 'C', 'D']) {
      const reaction = receptor.reactions[molecule];
      if (reaction === 'NEUTRAL') continue;

      // Concentration locale (pas de gradient nécessaire pour TOXIN/NUTRIENT)
      const localConcentration = this.world.getChemicalConcentration(
        position.x,
        position.y,
        molecule
      );

           const hasToxinTolerance = this.entityManager.hasComponent(entityId, 'ToxinTolerance');
      // TOXIN/NUTRIENT : Pas besoin de gradient
      if (reaction === 'TOXIN') {
        if (localConcentration > 0.1 && !metabolism.isDormant) {
          const damage = localConcentration * receptor.sensitivity*(hasToxinTolerance ? 0.2 : 10);
          metabolism.energyStored -= damage;
          toxinDamage += damage;
        }
        continue;
      }

      if (reaction === 'NUTRIENT') {
        if (localConcentration > 0.1) {
           if (emitter && emitter.emittedMolecules.includes(molecule)) {
      // Skip : ne peut pas s'auto-nourrir
      break;
    }
          const energy = localConcentration * receptor.sensitivity * 0.005;
          metabolism.energyStored += energy;
          nutrientGain += energy;
        }
        continue;
      }

      // ATTRACT/REPEL : Besoin du gradient
      const cacheKey = `${position.x},${position.y},${molecule},${detectionRadius}`;
      let gradient;
      
      if (gradientCache.has(cacheKey)) {
        gradient = gradientCache.get(cacheKey);
      } else {
        gradient = this.world.getChemicalGradient(
          position.x,
          position.y,
          molecule,
          detectionRadius
        );
        gradientCache.set(cacheKey, gradient);
      }

      if (gradient.strength > 0.1) {
        const attract = reaction === 'ATTRACT';
        this._performChemotaxis(entityId, gradient, receptor.sensitivity, attract);
        chemotaxisEvents++;
      }
    }
  }

  return {
    receptors: receptors.length,
    chemotaxisEvents,
    toxinDamage: toxinDamage.toFixed(2),
    nutrientGain: nutrientGain.toFixed(2)
  };
}

  /**
   * Effectue la chimiotaxie (mouvement vers/depuis un gradient)
   * @private
   */
  _performChemotaxis(entityId, gradient, sensitivity, attract) {
    // Ne bouger que si la bactérie a Movement OU si le gradient est très fort
    const hasMovement = this.entityManager.hasComponent(entityId, 'Movement');
    if (!hasMovement && gradient.strength < 2.0) return;

    const position = this.entityManager.getComponent(entityId, 'Position');

    // Direction de mouvement
    let dirX = Math.round(gradient.dx);
    let dirY = Math.round(gradient.dy);

    // Si répulsion, inverser
    if (!attract) {
      dirX = -dirX;
      dirY = -dirY;
    }

    // Probabilité de mouvement basée sur la sensibilité et la force du gradient
    const moveProbability = sensitivity * Math.min(1.0, gradient.strength / 2.0);
    if (Math.random() > moveProbability) return;

    // Calculer nouvelle position
    const newPos = this.world.wrap(position.x + dirX, position.y + dirY);

    // Déplacement si la case est libre
    if (this.world.isFree(newPos.x, newPos.y)) {
      this.world.removeEntity(position.x, position.y);
      position.x = newPos.x;
      position.y = newPos.y;
      this.world.setEntity(position.x, position.y, entityId);
    }
  }
}