/**
 * MetabolismSystem - Gère la consommation/production d'énergie
 * Responsabilités:
 * - Consommation basale d'énergie
 * - Absorption de ressources environnementales
 * - Mort par famine
 * - Modulation selon cycle jour/nuit et génome
 */

export class MetabolismSystem {
  constructor(entityManager, world) {
    this.entityManager = entityManager;
    this.world = world;
  }

  /**
   * Mise à jour du système
   * @param {number} deltaTime - Temps écoulé depuis le dernier tick (ms)
   */
  update(deltaTime) {
    const entities = this.entityManager.getEntitiesWithComponents([
      'Position',
      'Genome',
      'Metabolism'
    ]);

    const toDestroy = [];
    const dayNightRatio = this.world.getDayNightRatio();

    for (const entityId of entities) {
      const position = this.entityManager.getComponent(entityId, 'Position');
      const genome = this.entityManager.getComponent(entityId, 'Genome');
      const metabolism = this.entityManager.getComponent(entityId, 'Metabolism');
      const programmedDeath = this.entityManager.getComponent(entityId, 'ProgrammedDeath');

      if (metabolism.isDormant) {
        // Coût minimal seulement
        metabolism.energyStored -= metabolism.maintenanceCost;

        // Pas d'absorption
        // Pas de vieillissement (ou très lent)
        metabolism.age += deltaTime / 10000; // 100× plus lent

        // Mort si épuisé
        if (metabolism.energyStored <= 0) {
          toDestroy.push(entityId);
        }
        continue; // Skip le reste
      }
      // Paramètres génétiques
      const metabolicRate = genome.handler.readFloat('vitesseMetabolique');
      const absorptionEfficiency = genome.handler.readFloat('absorptionEfficiency');
      const dayNightSensitivity = genome.handler.readFloat('dayNightSensitivity');
      const nightActivity = genome.handler.readBool('nightActivity');

      if (programmedDeath && metabolism.age > 10) {
        programmedDeath.ticksSinceBirth++;
        console.log(`ProgrammedDeath: age=${metabolism.age.toFixed(0)} / ${programmedDeath.lifespan}, energy=${metabolism.energyStored.toFixed(1)}`);
      }
      // Dans MetabolismSystem, APRÈS calcul maintenanceCost :

      // Bonus colonie homogène
      const adhesion = this.entityManager.getComponent(entityId, 'Adhesion');
      if (adhesion && adhesion.attachedTo.length > 0) {
        const genome = this.entityManager.getComponent(entityId, 'Genome');
        if (genome) {
          const mySpecies = genome.handler.readFloat('speciesIdentity');
          let homogeneous = true;

          for (const connectedId of adhesion.attachedTo) {
            const connectedGenome = this.entityManager.getComponent(connectedId, 'Genome');
            if (connectedGenome) {
              const connectedSpecies = connectedGenome.handler.readFloat('speciesIdentity');
              if (Math.abs(mySpecies - connectedSpecies) > 0.1) {
                homogeneous = false;
                break;
              }
            }
          }

          // Bonus -50% coût Adhesion si colonie pure
          if (homogeneous) {
            metabolism.energyStored += 0.075; // Rembourse la moitié du coût
          }
        }
      }
      // Modulation jour/nuit personnalisée
      let activityMultiplier = 1.0;
      if (nightActivity) {
        // Actif la nuit, ralenti le jour
        activityMultiplier = 0.5 + (1.0 - dayNightRatio) * dayNightSensitivity;
      } else {
        // Actif le jour, ralenti la nuit
        activityMultiplier = 0.5 + dayNightRatio * dayNightSensitivity;
      }

      // Consommation basale (coût de la vie)
      let basalCost = metabolicRate * activityMultiplier;

      // Coût supplémentaire si énergie très haute (>150)
      // Simule l'inefficacité métabolique de la surabondance
      if (metabolism.energyStored > metabolism.maxEnergyStored * 0.75) {
        basalCost *= 1.5; // +50% de coût basal
      }

      // Coût de maintenance des composants
      const maintenanceCost = metabolism.maintenanceCost * activityMultiplier;

      // Coût total
      const totalCost = basalCost + maintenanceCost;
      metabolism.energyStored -= totalCost;

      // Absorption de ressources environnementales
      const absorptionAttempt = absorptionEfficiency * activityMultiplier;
      const absorbed = this.world.consumeReserve(
        position.x,
        position.y,
        absorptionAttempt
      );
      metabolism.energyStored += absorbed;

      // Plafond d'énergie stockée selon EnergyStorage
      const hasStorage = this.entityManager.hasComponent(entityId, 'EnergyStorage');
      let maxEnergy = metabolism.maxEnergyStored; // Cap par défaut: 100 (pas 200 !)

      if (hasStorage) {
        const storage = this.entityManager.getComponent(entityId, 'EnergyStorage');
        maxEnergy = storage.maxCapacity;
      }

      metabolism.energyStored = Math.min(maxEnergy, metabolism.energyStored);

      // Âge
      metabolism.age += deltaTime / 1000; // Conversion en secondes

      // Mort par famine
      if (metabolism.energyStored <= 0) {
        toDestroy.push(entityId);
      }
      // Mort par vieillesse (optionnel, si on veut limiter la durée de vie)
      if (metabolism.age >= metabolism.maxAge) {
        toDestroy.push(entityId);
      }
      // les suicidaire ProgrammedDeath
      if (programmedDeath && (programmedDeath.shouldDie || programmedDeath.ticksSinceBirth >= programmedDeath.lifespan)) {
        toDestroy.push(entityId);
      }
    }
    // Dans MetabolismSystem.js - AVANT destroyEntity

    // Destruction des entités mortes
    for (const entityId of toDestroy) {
      const position = this.entityManager.getComponent(entityId, 'Position');

      // VÉRIFIER SI EXPLOSIVE AVANT DE DÉTRUIRE
      const hasExplosive = this.entityManager.hasComponent(entityId, 'Explosive');

      // Dans MetabolismSystem, AVANT destruction

      if (hasExplosive) {
        // Vérifier si prédateur dans les environs
        const neighbors = this.world.getNeighbors(position.x, position.y);
        let hasPredatorNearby = false;

        for (const neighbor of neighbors) {
          if (neighbor.entity) {
            const isPredator = this.entityManager.hasComponent(neighbor.entity, 'Predator');
            if (isPredator) {
              hasPredatorNearby = true;
              break;
            }
          }
        }

        // Exploser SEULEMENT si prédateur proche (sinon mort silencieuse)
        if (hasPredatorNearby) {
          this.explosiveSystem.registerExplosion(entityId);
        }
      }
      if (hasExplosive) {
        // Enregistrer l'explosion (sera traitée par ExplosiveSystem)
        if (this.explosiveSystem) {
          this.explosiveSystem.registerExplosion(entityId);
        }
      }

      // CHEMICAL BURST
      const hasChemicalBurst = this.entityManager.hasComponent(entityId, 'ChemicalBurst');
      if (hasChemicalBurst) {
        const burst = this.entityManager.getComponent(entityId, 'ChemicalBurst');
        if (!burst.triggered) {
          // Émettre la molécule en grande quantité
          this.world.emitChemical(position.x, position.y, burst.burstMolecule, burst.burstAmount);
          burst.triggered = true;
        }
      }

      // ENREGISTRER CADAVRE pour Filtration
      if (this.filtrationSystem && position) {
        this.filtrationSystem.registerDeath(position.x, position.y);
      }
      if (position) {
        this.world.removeEntity(position.x, position.y);
      }
      this.entityManager.destroyEntity(entityId);
    }


    return {
      alive: entities.length - toDestroy.length,
      died: toDestroy.length
    };
  }
}