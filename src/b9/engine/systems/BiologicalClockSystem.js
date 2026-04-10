// Nouveau fichier: /src/engine/systems/BiologicalClockSystem.js

/**
 * BiologicalClockSystem - Rythmes circadiens et comportements synchronisés
 * 
 * Actions selon phase du cycle (période personnalisée):
 * - Migration coordonnée (essaims)
 * - Dispersion (évitement surpopulation)
 * - Reproduction synchronisée (événements de ponte)
 * - Dormance (hibernation défensive)
 * - Émission chimique pulsée (communication temporelle)
 */

export class BiologicalClockSystem {
  constructor(entityManager, world) {
    this.entityManager = entityManager;
    this.world = world;
  }

  update(deltaTime) {
    const clockers = this.entityManager.getEntitiesWithComponents([
      'Position',
      'Genome',
      'Metabolism',
      'BiologicalClock'
    ]);

    const globalDayNight = this.world.getDayNightRatio(); // 0.0 = nuit, 1.0 = jour

    let migrations = 0;
    let dispersals = 0;
    let synchronizedReproductions = 0;
    let dormancyEntered = 0;
    let dormancyExited = 0;
    let chemicalPulses = 0;

    for (const entityId of clockers) {
      const position = this.entityManager.getComponent(entityId, 'Position');
      const genome = this.entityManager.getComponent(entityId, 'Genome');
      const metabolism = this.entityManager.getComponent(entityId, 'Metabolism');
      const clock = this.entityManager.getComponent(entityId, 'BiologicalClock');

      // Avancer la phase personnelle
      clock.phase += (deltaTime / 1000) / clock.period;
      if (clock.phase >= 1.0) clock.phase -= 1.0;

      // Lire les préférences génétiques
      const behaviorType = this._getBehaviorType(genome);
      const activationPhase = genome.handler.readFloat('clockActivationPhase'); // 0.0-1.0

      // Vérifier si dans la fenêtre d'activation
      const phaseDiff = Math.abs(clock.phase - activationPhase);
      const inWindow = phaseDiff < 0.1 || phaseDiff > 0.9; // Fenêtre de 20%

      

if (inWindow) {
  // BONUS MÉTABOLIQUE durant phase active
  // Métabolisme optimisé = moins de coût, plus d'absorption
  
  const syncBonus = this._getSynchronyBonus(entityId, position, clock);
  metabolism.energyStored += syncBonus;
  
      // Dans la fenêtre d'activation → Exécuter comportement
      switch (behaviorType) {
        case 'migration':
          if (this._tryMigration(entityId, position, genome, globalDayNight)) {
            migrations++;
          }
          break;

        case 'dispersal':
          if (this._tryDispersal(entityId, position)) {
            dispersals++;
          }
          break;

        case 'reproduction':
          if (this._trySynchronizedReproduction(entityId, metabolism, clock)) {
            synchronizedReproductions++;
          }
          break;

        case 'dormancy':
          if (!metabolism.isDormant) {
            this._enterDormancy(entityId, metabolism);
            dormancyEntered++;
          }
          break;

        case 'chemical_pulse':
          if (this._tryChemicalPulse(entityId)) {
            chemicalPulses++;
          }
          break;
          default:
      }

      } else {
  // Hors fenêtre : économie d'énergie (repos)
  const restBonus = 0.1; // Petit bonus de repos
  metabolism.energyStored += restBonus;
  
  // Sortir de dormance si dedans
  if (metabolism.isDormant) {
    this._exitDormancy(entityId, metabolism);
    dormancyExited++;
  }
}
    }

    return {
      clockers: clockers.length,
      migrations,
      dispersals,
      synchronizedReproductions,
      dormancyEntered,
      dormancyExited,
      chemicalPulses
    };
  }

  /**
   * Détermine le type de comportement selon génome
   * @private
   */
  _getBehaviorType(genome) {
    const types = ['migration', 'reproduction','migration',  'dormancy','migration',  'chemical_pulse'];
    const index = Math.floor(genome.handler.readFloat('clockBehavior') * types.length);
    return types[index];
  }

  /**
   * Migration coordonnée
   * @private
   */
  _tryMigration(entityId, position, genome, globalDayNight) {
    const hasMovement = this.entityManager.hasComponent(entityId, 'Movement');
    if (!hasMovement) return false;

    // Direction selon moment du jour/nuit
    const directionPhase = genome.handler.readFloat('migrationDirection');
    const angle = directionPhase * Math.PI * 2 + globalDayNight * Math.PI; // Rotation selon jour/nuit
    
    const dx = Math.round(Math.cos(angle));
    const dy = Math.round(Math.sin(angle));

    const newPos = this.world.wrap(position.x + dx, position.y + dy);
    
    if (this.world.isFree(newPos.x, newPos.y)) {
      this.world.removeEntity(position.x, position.y);
      position.x = newPos.x;
      position.y = newPos.y;
      this.world.setEntity(position.x, position.y, entityId);
      return true;
    }
    return false;
  }
// Dans BiologicalClockSystem.js

_getSynchronyBonus(entityId, position, clock) {
  const neighbors = this.world.getNeighbors(position.x, position.y);
  let syncedCount = 0;
  
  // Early exit si pas de voisins occupés
  let hasOccupied = false;
  for (const neighbor of neighbors) {
    if (neighbor.entity) {
      hasOccupied = true;
      break;
    }
  }
  if (!hasOccupied) return 0;
  
  for (const neighbor of neighbors) {
    if (!neighbor.entity) continue;
    
    const neighborClock = this.entityManager.getComponent(neighbor.entity, 'BiologicalClock');
    if (!neighborClock) continue;
    
    // Vérifier phase
    const phaseDiff = Math.abs(clock.phase - neighborClock.phase);
    if (phaseDiff < 0.1 || phaseDiff > 0.9) {
      syncedCount++;
      // Early exit si déjà max bonus
      if (syncedCount >= 4) break; // Cap à 4 voisins
    }
  }
  
  return syncedCount * 0.2;
}
  /**
   * Dispersion (fuite du cluster)
   * @private
   */
  _tryDispersal(entityId, position) {
    const hasMovement = this.entityManager.hasComponent(entityId, 'Movement');
    if (!hasMovement) return false;

    // Compter voisins
    const neighbors = this.world.getNeighbors(position.x, position.y);
    const occupiedCount = neighbors.filter(n => n.entity !== null).length;

    if (occupiedCount < 4) return false; // Pas assez dense pour disperser

    // Fuir vers la zone la moins dense
    let bestDir = null;
    let minNeighbors = 9;

    for (const neighbor of neighbors) {
      if (neighbor.entity !== null) continue;

      const subNeighbors = this.world.getNeighbors(neighbor.x, neighbor.y);
      const subCount = subNeighbors.filter(n => n.entity !== null).length;

      if (subCount < minNeighbors) {
        minNeighbors = subCount;
        bestDir = { x: neighbor.x, y: neighbor.y };
      }
    }

    if (bestDir) {
      this.world.removeEntity(position.x, position.y);
      position.x = bestDir.x;
      position.y = bestDir.y;
      this.world.setEntity(position.x, position.y, entityId);
      return true;
    }
    return false;
  }

  /**
   * Reproduction synchronisée (ponte)
   * @private
   */
  _trySynchronizedReproduction(entityId, metabolism, clock) {
    // Fenêtre ultra-courte (1% du cycle)
    const preciseDiff = Math.abs(clock.phase - 0.5); // Phase de reproduction = 0.5
    if (preciseDiff > 0.01) return false;

    // Déclencher reproduction si énergie > 70% (plus facile que normal)
    if (metabolism.energyStored > 70) {
      // Marquer pour reproduction (ReproductionSystem le gérera)
      metabolism.synchronizedReproduction = true;
      return true;
    }
    return false;
  }

  /**
   * Entrer en dormance
   * @private
   */
_enterDormancy(entityId, metabolism) {
  metabolism.isDormant = true;
  metabolism.dormancyStartEnergy = metabolism.energyStored;
  metabolism.preDormancyMaintenanceCost = metabolism.maintenanceCost;
  
  // Réduction drastique
  metabolism.maintenanceCost *= 0.05; // 95% de réduction (au lieu de 90%)
  
}

  /**
   * Sortir de dormance
   * @private
   */
  _exitDormancy(entityId, metabolism) {
    metabolism.isDormant = false;
    
    // Restaurer coûts
    if (metabolism.preDormancyMaintenanceCost !== undefined) {
      metabolism.maintenanceCost = metabolism.preDormancyMaintenanceCost;
    }
  }

  /**
   * Émission chimique pulsée
   * @private
   */
  _tryChemicalPulse(entityId) {
    const hasEmitter = this.entityManager.hasComponent(entityId, 'ChemicalEmitter');
    if (!hasEmitter) return false;

    const position = this.entityManager.getComponent(entityId, 'Position');
    const emitter = this.entityManager.getComponent(entityId, 'ChemicalEmitter');

    // Pulse massif (×5 normal)
    for (const molecule of emitter.emittedMolecules) {
      this.world.emitChemical(position.x, position.y, molecule, emitter.emissionRate * 5);
    }
    return true;
  }
}