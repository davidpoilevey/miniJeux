// Nouveau fichier: /src/engine/systems/EnhancedSensorsSystem.js

/**
 * EnhancedSensorsSystem - Vision améliorée pour chasse, fuite et navigation
 * 
 * Capacités:
 * - Détecte prédateurs à distance → Fuite
 * - Détecte proies à distance → Chasse
 * - Guide colonies adhésives vers objectifs
 * - Évite zones dangereuses (toxines, combats)
 */

export class EnhancedSensorsSystem {
  constructor(entityManager, world) {
    this.entityManager = entityManager;
    this.world = world;
  }

  update(deltaTime) {
    const sensors = this.entityManager.getEntitiesWithComponents([
      'Position',
      'Genome',
      'EnhancedSensors'
    ]);

    let predatorDetections = 0;
    let preyDetections = 0;
    let colonyGuidance = 0;
    let dangerAvoidance = 0;

    for (const sensorId of sensors) {
      const position = this.entityManager.getComponent(sensorId, 'Position');
      const genome = this.entityManager.getComponent(sensorId, 'Genome');
      const enhancedSensors = this.entityManager.getComponent(sensorId, 'EnhancedSensors');

      // Rayon de vision total
      const visionRadius = 3 + enhancedSensors.detectionBonus; // 5-8 cellules

      // Scanner l'environnement
      const scanResult = this._scanEnvironment(sensorId, position, visionRadius);

      // Déterminer comportement selon ce qu'on possède
      const hasPredator = this.entityManager.hasComponent(sensorId, 'Predator');
      const hasMovement = this.entityManager.hasComponent(sensorId, 'Movement');
      const hasAdhesion = this.entityManager.hasComponent(sensorId, 'Adhesion');
      const adhesion = this.entityManager.getComponent(sensorId, 'Adhesion');

      // 1. SI PRÉDATEUR : Chasser la proie la plus proche
      if (hasPredator && scanResult.closestPrey && hasMovement) {
        if (this._moveTowards(sensorId, position, scanResult.closestPrey)) {
          preyDetections++;
        }
      }
      // 2. SI DÉTECTE PRÉDATEURS : Fuir
      else if (scanResult.closestThreat && hasMovement) {
        if (this._fleeFrom(sensorId, position, scanResult.closestThreat)) {
          predatorDetections++;
        }
      }
      // 3. SI EN COLONIE : Guider vers zone favorable
      else if (hasAdhesion && adhesion.attachedTo.length > 0) {
        if (this._guideColony(sensorId, position, scanResult, adhesion)) {
          colonyGuidance++;
        }
      }
      // 4. ÉVITER ZONES DANGEREUSES (toxines chimiques)
      else if (scanResult.dangerZone && hasMovement) {
        if (this._avoidDanger(sensorId, position, scanResult.dangerZone)) {
          dangerAvoidance++;
        }
      }
    }

    return {
      sensors: sensors.length,
      predatorDetections,
      preyDetections,
      colonyGuidance,
      dangerAvoidance
    };
  }

  /**
   * Scanner l'environnement dans le rayon de vision
   * @private
   */
  _scanEnvironment(sensorId, position, radius) {
    const genome = this.entityManager.getComponent(sensorId, 'Genome');
    const mySpeciesId = genome?.handler.readFloat('speciesIdentity') || 0;
    
    const hasPredator = this.entityManager.hasComponent(sensorId, 'Predator');
    const metabolism = this.entityManager.getComponent(sensorId, 'Metabolism');

    let closestPrey = null;
    let closestThreat = null;
    let dangerZone = null;
    let bestResource = null;

    let minPreyDist = Infinity;
    let minThreatDist = Infinity;
    let maxDanger = 0;
    let maxResource = 0;

    // Scanner dans le rayon
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx === 0 && dy === 0) continue;

        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > radius) continue;

        const pos = this.world.wrap(position.x + dx, position.y + dy);
        const targetId = this.world.getEntity(pos.x, pos.y);

        // A. Détecter autres bactéries
        if (targetId && targetId !== sensorId) {
          const targetGenome = this.entityManager.getComponent(targetId, 'Genome');
          const targetPredator = this.entityManager.getComponent(targetId, 'Predator');
          const targetMeta = this.entityManager.getComponent(targetId, 'Metabolism');

          if (!targetGenome || !targetMeta) continue;

          const targetSpeciesId = targetGenome.handler.readFloat('speciesIdentity');
          const speciesDiff = Math.abs(mySpeciesId - targetSpeciesId);

          // PROIE potentielle (si je suis prédateur)
          if (hasPredator && speciesDiff > 0.2) {
            if (distance < minPreyDist) {
              minPreyDist = distance;
              closestPrey = { x: pos.x, y: pos.y, distance };
            }
          }

          // MENACE potentielle (si lui est prédateur ET différente espèce)
          if (targetPredator && speciesDiff > 0.2 && !hasPredator) {
            if (distance < minThreatDist) {
              minThreatDist = distance;
              closestThreat = { x: pos.x, y: pos.y, distance };
            }
          }
        }

        // B. Détecter toxines chimiques
        const receptors = this.entityManager.getComponent(sensorId, 'ChemicalReceptor');
        if (receptors) {
          for (const molecule of ['A', 'B', 'C', 'D']) {
            if (receptors.reactions[molecule] === 'TOXIN') {
              const concentration = this.world.getChemicalConcentration(pos.x, pos.y, molecule);
              if (concentration > maxDanger) {
                maxDanger = concentration;
                dangerZone = { x: pos.x, y: pos.y, danger: concentration };
              }
            }
          }
        }

        // C. Détecter ressources
        const reserve = this.world.getReserve(pos.x, pos.y);
        if (reserve > maxResource) {
          maxResource = reserve;
          bestResource = { x: pos.x, y: pos.y, reserve };
        }
      }
    }

    return {
      closestPrey,
      closestThreat,
      dangerZone: maxDanger > 2.0 ? dangerZone : null,
      bestResource: maxResource > 50 ? bestResource : null
    };
  }

  /**
   * Se diriger vers une cible
   * @private
   */
  _moveTowards(entityId, position, target) {
    const dx = target.x - position.x;
    const dy = target.y - position.y;

    // Normaliser direction
    const magnitude = Math.sqrt(dx * dx + dy * dy);
    if (magnitude === 0) return false;

    const dirX = Math.round(dx / magnitude);
    const dirY = Math.round(dy / magnitude);

    const newPos = this.world.wrap(position.x + dirX, position.y + dirY);

    if (this.world.isFree(newPos.x, newPos.y)) {
      this.world.removeEntity(position.x, position.y);
      position.x = newPos.x;
      position.y = newPos.y;
      this.world.setEntity(position.x, position.y, entityId);
      return true;
    }
    return false;
  }

  /**
   * Fuir d'une menace
   * @private
   */
  _fleeFrom(entityId, position, threat) {
    const dx = position.x - threat.x;
    const dy = position.y - threat.y;

    const magnitude = Math.sqrt(dx * dx + dy * dy);
    if (magnitude === 0) return false;

    const dirX = Math.round(dx / magnitude);
    const dirY = Math.round(dy / magnitude);

    const newPos = this.world.wrap(position.x + dirX, position.y + dirY);

    if (this.world.isFree(newPos.x, newPos.y)) {
      this.world.removeEntity(position.x, position.y);
      position.x = newPos.x;
      position.y = newPos.y;
      this.world.setEntity(position.x, position.y, entityId);
      return true;
    }
    return false;
  }

  /**
   * Guider une colonie adhésive vers un objectif
   * @private
   */
  _guideColony(entityId, position, scanResult, adhesion) {
    // Priorité : Fuite > Chasse > Ressources
    let targetDir = null;

    if (scanResult.closestThreat) {
      // Fuir la menace
      const dx = position.x - scanResult.closestThreat.x;
      const dy = position.y - scanResult.closestThreat.y;
      targetDir = { dx, dy };
    } else if (scanResult.closestPrey) {
      // Chasser
      const dx = scanResult.closestPrey.x - position.x;
      const dy = scanResult.closestPrey.y - position.y;
      targetDir = { dx, dy };
    } else if (scanResult.bestResource) {
      // Vers ressources
      const dx = scanResult.bestResource.x - position.x;
      const dy = scanResult.bestResource.y - position.y;
      targetDir = { dx, dy };
    }

    if (!targetDir) return false;

    // Normaliser
    const magnitude = Math.sqrt(targetDir.dx * targetDir.dx + targetDir.dy * targetDir.dy);
    if (magnitude === 0) return false;

    const dirX = Math.round(targetDir.dx / magnitude);
    const dirY = Math.round(targetDir.dy / magnitude);

    // Stocker direction pour que Muscular ou AdhesionSystem l'utilise
    const genome = this.entityManager.getComponent(entityId, 'Genome');
    if (genome) {
      // Stocker dans un composant temporaire (ou directement dans Adhesion)
      adhesion.guidedDirection = { dx: dirX, dy: dirY };
      return true;
    }

    return false;
  }

  /**
   * Éviter zone dangereuse
   * @private
   */
  _avoidDanger(entityId, position, dangerZone) {
    return this._fleeFrom(entityId, position, dangerZone);
  }
}