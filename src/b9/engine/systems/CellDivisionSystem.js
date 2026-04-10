// Nouveau fichier: /src/engine/systems/CellDivisionSystem.js

import { ADNHandler } from '../../../genetic/ADNPlante.js';
import { calculateMaintenanceCost, generateComponentParameters } from '../../utils/RandomBacteriaGenerator.js';
import { Genome, Metabolism, OPTIONAL_COMPONENTS, Position, SPECIALIZATION_COMPONENTS } from '../components/Components.js';

/**
 * CellDivisionSystem - Sporulation explosive
 * 
 * Comportements:
 * - 'ring': 8 spores en anneau (parent meurt)
 * - 'cross': 4 spores en croix (parent survit affaibli)
 * - 'random': 3-5 spores aléatoires adjacentes
 * 
 * Stratégie: Colonisation rapide, dispersion, boom démographique
 */

export class CellDivisionSystem {
  constructor(entityManager, world) {
    this.entityManager = entityManager;
    this.world = world;
  }

  update(deltaTime) {
    const sporulators = this.entityManager.getEntitiesWithComponents([
      'Position',
      'Genome',
      'Metabolism',
      'CellDivision'
    ]);

    let sporulations = 0;
    let totalSpores = 0;
    const sporulationTypes = { ring: 0, cross: 0, random: 0 };

    for (const parentId of sporulators) {
      const position = this.entityManager.getComponent(parentId, 'Position');
      const genome = this.entityManager.getComponent(parentId, 'Genome');
      const metabolism = this.entityManager.getComponent(parentId, 'Metabolism');
      const cellDivision = this.entityManager.getComponent(parentId, 'CellDivision');

      // Déjà sporulé
      if (cellDivision.hasSporulated) continue;

      // Vérifier énergie
      if (metabolism.energyStored < cellDivision.burstThreshold) continue;

      // Probabilité de sporulation (5% par tick si conditions ok)
      if (Math.random() > 0.05) continue;

      // SPORULER
      const spores = this._sporulate(
        parentId,
        position,
        genome,
        metabolism,
        cellDivision
      );

      if (spores > 0) {
        sporulations++;
        totalSpores += spores;
        sporulationTypes[cellDivision.sporulationPattern]++;
        cellDivision.hasSporulated = true;

        // Pattern 'ring' : Parent meurt
        if (cellDivision.sporulationPattern === 'ring') {
          this.world.removeEntity(position.x, position.y);
          this.entityManager.destroyEntity(parentId);
        }
        // Autres patterns : Parent survit mais épuisé
        else {
          metabolism.energyStored = 10;
        }
      }
    }

    return {
      sporulators: sporulators.length,
      sporulations,
      totalSpores,
      sporulationTypes
    };
  }

  /**
   * Crée les spores selon le pattern
   * @private
   */
  _sporulate(parentId, parentPos, parentGenome, parentMeta, cellDivision) {
    const pattern = cellDivision.sporulationPattern;
    let positions = [];

    switch (pattern) {
      case 'ring':
        // 8 cases autour (anneau complet)
        positions = [
          [-1, -1], [0, -1], [1, -1],
          [-1,  0],          [1,  0],
          [-1,  1], [0,  1], [1,  1]
        ];
        break;

      case 'cross':
        // 4 cases cardinales (croix)
        positions = [
          [0, -1], // Nord
          [-1, 0], // Ouest
          [1,  0], // Est
          [0,  1]  // Sud
        ];
        break;

      case 'random':
        // 3-5 cases aléatoires parmi les 8
        const allPositions = [
          [-1, -1], [0, -1], [1, -1],
          [-1,  0],          [1,  0],
          [-1,  1], [0,  1], [1,  1]
        ];
        const count = 3 + Math.floor(Math.random() * 3); // 3-5
        for (let i = 0; i < count; i++) {
          const idx = Math.floor(Math.random() * allPositions.length);
          positions.push(allPositions.splice(idx, 1)[0]);
        }
        break;
    }

    let sporesCreated = 0;

    for (const [dx, dy] of positions) {
      const sporePos = this.world.wrap(parentPos.x + dx, parentPos.y + dy);

      // Vérifier si libre
      if (!this.world.isFree(sporePos.x, sporePos.y)) continue;

      // CRÉER SPORE
      const sporeId = this._createSpore(
        sporePos.x,
        sporePos.y,
        parentGenome,
        parentMeta,
        parentId
      );

      if (sporeId) sporesCreated++;
    }

    return sporesCreated;
  }

  /**
   * Crée une spore (clone du parent)
   * @private
   */
  _createSpore(x, y, parentGenome, parentMeta, parentId) {
    
    const sporeId = this.entityManager.createEntity();

    // Position
    this.entityManager.addComponent(sporeId, 'Position', new Position(x, y));
    this.world.setEntity(x, y, sporeId);

    // Genome (clone avec petite mutation)
    const sporeADN = parentGenome.handler.mutatedVersion();
    const sporeHandler = new ADNHandler(sporeADN);
    this.entityManager.addComponent(sporeId, 'Genome', new Genome(sporeADN, sporeHandler));

    // Metabolism (peu d'énergie initiale)
    const sporeMeta = new Metabolism(
      15, // Énergie minimale
      parentMeta.maxEnergyStored,
      parentMeta.maxAge
    );
    this.entityManager.addComponent(sporeId, 'Metabolism', sporeMeta);

    // Hériter composants
    this._inheritComponents(parentId, sporeId, sporeHandler);

    return sporeId;
  }

  /**
   * Hérite composants du parent (sauf CellDivision si 'ring')
   * @private
   */
  _inheritComponents(parentId, childId, childHandler) {
    const activeComponents = [];
    const MAX_COMPONENTS = 4;

const ALL_COMPONENTS = { ...OPTIONAL_COMPONENTS , ...SPECIALIZATION_COMPONENTS };
    for (const componentName in ALL_COMPONENTS) {
      // Hériter si parent a le composant
      if (this.entityManager.hasComponent(parentId, componentName)) {
        // Probabilité 95% (très fidèle)
        if (Math.random() < 0.95) {
          if (activeComponents.length >= MAX_COMPONENTS) break;

          const ComponentClass = ALL_COMPONENTS[componentName];
          const params = generateComponentParameters(componentName, childHandler);
          const instance = new ComponentClass(...params);

          this.entityManager.addComponent(childId, componentName, instance);
          activeComponents.push(componentName);
        }
      }
    }

    // Mettre à jour coût
    const metabolism = this.entityManager.getComponent(childId, 'Metabolism');
    if (metabolism) {
      metabolism.maintenanceCost = calculateMaintenanceCost(activeComponents);
    }
  }
}