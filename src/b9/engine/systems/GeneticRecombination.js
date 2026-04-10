// Nouveau fichier: /src/engine/systems/GeneticRecombinationSystem.js

/**
 * GeneticRecombinationSystem - Reproduction sexuée
 * 
 * Mécanisme:
 * - Trouve un partenaire adjacent compatible
 * - Recombine les ADN (via recombinaisonGenetique)
 * - Boost le threshold de reproduction (plus facile)
 * - Enfant = mélange génétique des deux parents
 */

import { ADNHandler, recombinaisonGenetique } from '../../../genetic/ADNPlante.js';
import { calculateMaintenanceCost, generateComponentParameters } from '../../utils/RandomBacteriaGenerator.js';
import { Genome, Metabolism, Movement, OPTIONAL_COMPONENTS, Position, SPECIALIZATION_COMPONENTS } from '../components/Components.js';

export class GeneticRecombinationSystem {
  constructor(entityManager, world) {
    this.entityManager = entityManager;
    this.world = world;
  }

  update(deltaTime) {
    const recombiners = this.entityManager.getEntitiesWithComponents([
      'Position',
      'Genome',
      'Metabolism',
      'GeneticRecombination'
    ]);

    let sexualReproductions = 0;
    const alreadyMated = new Set(); // Éviter double reproduction

    for (const entityId of recombiners) {
      if (alreadyMated.has(entityId)) continue;

      const position = this.entityManager.getComponent(entityId, 'Position');
      const genome = this.entityManager.getComponent(entityId, 'Genome');
      const metabolism = this.entityManager.getComponent(entityId, 'Metabolism');
      const recombination = this.entityManager.getComponent(entityId, 'GeneticRecombination');

      // Vérifier énergie (threshold boosté)
      const baseThreshold = 50 + genome.handler.readFloat('reproductionThreshold') * 100;
      const sexualThreshold = baseThreshold * 0.7; // 30% plus facile

      if (metabolism.energyStored < sexualThreshold) continue;

      // Chercher un partenaire
      const partner = this._findBestPartner(entityId, position, genome, recombination);
      if (!partner) continue;

      // Vérifier que le partenaire n'a pas déjà mâté
      if (alreadyMated.has(partner.id)) continue;

      const partnerMeta = this.entityManager.getComponent(partner.id, 'Metabolism');
      const partnerGenome = this.entityManager.getComponent(partner.id, 'Genome');

      // Les deux doivent avoir assez d'énergie
      if (partnerMeta.energyStored < sexualThreshold) continue;

      // RECOMBINER LES ADN
      const [childADN] = recombinaisonGenetique(
        genome.handler.adn,
        partnerGenome.handler.adn
      );

      // Trouver case libre adjacente
      const neighbors = this.world.getNeighbors(position.x, position.y);
      const freeSpot = neighbors.find(n => n.entity === null);
      if (!freeSpot) continue;

      // CRÉER L'ENFANT (via ReproductionSystem)
      // Diviser l'énergie entre les deux parents
      const energyCost = sexualThreshold / 2;
      metabolism.energyStored -= energyCost;
      partnerMeta.energyStored -= energyCost;

      // Créer l'entité enfant
      const childId = this._createChild(
        freeSpot.x,
        freeSpot.y,
        childADN,
        energyCost,
        entityId,
        partner.id
      );

      if (childId) {
        sexualReproductions++;
        alreadyMated.add(entityId);
        alreadyMated.add(partner.id);
      }
    }

    return {
      recombiners: recombiners.length,
      sexualReproductions
    };
  }

  /**
   * Trouve le meilleur partenaire selon préférence génétique
   * @private
   */
// Dans GeneticRecombinationSystem.js

_findBestPartner(entityId, position, genome, recombination) {
  const mySpeciesId = genome.handler.readFloat('speciesIdentity');
  const matingPreference = recombination.matingPreference;

  const neighbors = this.world.getNeighbors(position.x, position.y);
  let bestPartner = null;
  let bestScore = -1;

  // LIMITE: Évaluer max 3 candidats (au lieu de tous)
  let candidatesChecked = 0;
  const MAX_CANDIDATES = 3;

  for (const neighbor of neighbors) {
    if (!neighbor.entity || neighbor.entity === entityId) continue;
    if (candidatesChecked >= MAX_CANDIDATES) break; // Early exit

    // Doit avoir GeneticRecombination
    const partnerRecombination = this.entityManager.getComponent(
      neighbor.entity,
      'GeneticRecombination'
    );
    if (!partnerRecombination || !partnerRecombination.recombinationAbility) continue;

    const partnerGenome = this.entityManager.getComponent(neighbor.entity, 'Genome');
    const partnerMeta = this.entityManager.getComponent(neighbor.entity, 'Metabolism');
    if (!partnerGenome || !partnerMeta) continue;

    candidatesChecked++;

    const partnerSpeciesId = partnerGenome.handler.readFloat('speciesIdentity');
    const speciesDiff = Math.abs(mySpeciesId - partnerSpeciesId);

    const compatibilityScore = matingPreference < 0.5
      ? 1.0 - speciesDiff
      : speciesDiff;

    const energyBonus = partnerMeta.energyStored / 200;
    const finalScore = compatibilityScore + energyBonus * 0.2;

    if (finalScore > bestScore) {
      bestScore = finalScore;
      bestPartner = {
        id: neighbor.entity,
        x: neighbor.x,
        y: neighbor.y
      };
    }
  }

  return bestPartner;
}

  /**
   * Crée l'enfant issu de reproduction sexuée
   * @private
   */
  _createChild(x, y, childADN, energyAmount, parent1Id, parent2Id) {
    

    const childId = this.entityManager.createEntity();

    // Position
    this.entityManager.addComponent(childId, 'Position', new Position(x, y));
    this.world.setEntity(x, y, childId);

    // Genome (ADN recombiné)
    const childHandler = new ADNHandler(childADN);
    this.entityManager.addComponent(childId, 'Genome', new Genome(childADN, childHandler));
    this.entityManager.addComponent(childId, 'Movement', new Movement(childHandler.readFloat('movementSpeed')));

    // Metabolism
    const parent1Meta = this.entityManager.getComponent(parent1Id, 'Metabolism');
    const metabolism = new Metabolism(
      energyAmount,
      parent1Meta.maxAge
    );
    this.entityManager.addComponent(childId, 'Metabolism', metabolism);

    // Hériter composants (mélange des deux parents)
    this._inheritFromBothParents(parent1Id, parent2Id, childId, childHandler);

    return childId;
  }

  /**
   * Hérite composants des deux parents (union des deux)
   * @private
   */
  _inheritFromBothParents(parent1Id, parent2Id, childId, childHandler) {
    

    const activeComponents = [];
    const MAX_COMPONENTS = 4;

const ALL_COMPONENTS = { ...OPTIONAL_COMPONENTS , ...SPECIALIZATION_COMPONENTS };
    for (const componentName in ALL_COMPONENTS) {
      const hasParent1 = this.entityManager.hasComponent(parent1Id, componentName);
      const hasParent2 = this.entityManager.hasComponent(parent2Id, componentName);

      // Si au moins un parent a le composant : 80% d'héritage
      // Si les deux ont : 95% d'héritage
      let inheritProb = 0;
      if (hasParent1 && hasParent2) {
        inheritProb = 0.95;
      } else if (hasParent1 || hasParent2) {
        inheritProb = 0.50;
      } else {
        inheritProb = 0.02; // Mutation rare
      }

      if (Math.random() < inheritProb) {
        if (activeComponents.length >= MAX_COMPONENTS) break;

        const ComponentClass = ALL_COMPONENTS[componentName];
        const params = generateComponentParameters(componentName, childHandler);
        const instance = new ComponentClass(...params);

        this.entityManager.addComponent(childId, componentName, instance);
        activeComponents.push(componentName);
      }
    }

    // Mettre à jour maintenance
    const metabolism = this.entityManager.getComponent(childId, 'Metabolism');
    if (metabolism) {
      metabolism.maintenanceCost = calculateMaintenanceCost(activeComponents);
    }
  }
}