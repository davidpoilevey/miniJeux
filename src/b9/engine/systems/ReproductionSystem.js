/**
 * ReproductionSystem - Gère la division cellulaire
 * Reproduction asexuée par division avec mutations
 */

import { 
  Position, 
  Genome, 
  Metabolism,
  OPTIONAL_COMPONENTS,
  Movement
} from '../components/Components.js';
import { ADNHandler } from '../../../genetic/ADNPlante';
import { 
  generateComponentParameters,
  calculateMaintenanceCost 
} from '../../utils/RandomBacteriaGenerator.js';

export class ReproductionSystem {
  constructor(entityManager, world) {
    this.entityManager = entityManager;
    this.world = world;
  }

  /**
   * Mise à jour du système
   */
  update(deltaTime) {
    const entities = this.entityManager.getEntitiesWithComponents([
      'Position',
      'Genome',
      'Metabolism'
    ]);

    let newBornCount = 0;

    for (const entityId of entities) {
      const position = this.entityManager.getComponent(entityId, 'Position');
      const genome = this.entityManager.getComponent(entityId, 'Genome');
      const metabolism = this.entityManager.getComponent(entityId, 'Metabolism');

      // Seuil de reproduction déterminé génétiquement entre 50% et 100% de la capacité max d'énergie
      const reproductionThreshold = metabolism.maxEnergyStored * (0.5 + genome.handler.readFloat('reproductionThreshold') * 0.5);
      if (metabolism.energyStored >= reproductionThreshold|| metabolism.synchronizedReproduction) {
        // Chercher une case libre adjacente
         metabolism.synchronizedReproduction = false;
        const neighbors = this.world.getNeighbors(position.x, position.y);
        const freeNeighbors = neighbors.filter(n => n.entity === null);

        if (freeNeighbors.length > 0) {
          // Choisir une position aléatoire
          const birthPos = freeNeighbors[Math.floor(Math.random() * freeNeighbors.length)];

          // Créer l'enfant avec ADN muté
          const childADN = genome.handler.mutatedVersion();
          const childHandler = new ADNHandler(childADN);
const energyStored = childHandler.read10('energieDeDepart')*10+50;
      const maxAge = childHandler.read10('dureeDeVie')*30+200;//200 a 500
          const childId = this.entityManager.createEntity();
          this.entityManager.addComponent(childId, 'Position', new Position(birthPos.x, birthPos.y));
          this.entityManager.addComponent(childId, 'Genome', new Genome(childADN, childHandler));
          this.entityManager.addComponent(childId, 'Metabolism', new Metabolism(energyStored, maxAge));
         // this.entityManager.addComponent(childId, 'Movement', new Movement(childHandler.readFloat('movementSpeed')));
          // Copier les composants optionnels du parent
          this._inheritComponents(entityId, childId, childHandler);

          
          // Placer sur la grille
          this.world.setEntity(birthPos.x, birthPos.y, childId);

          // Diviser l'énergie
          metabolism.energyStored = reproductionThreshold / 2;

          newBornCount++;
        }
      }
    }

    return { newBorn: newBornCount };
  }

  /**
   * Hérite des composants optionnels du parent (avec mutation possible)
   * @private
   */
 _inheritComponents(parentId, childId, childHandler) {
  const metabolism = this.entityManager.getComponent(childId, 'Metabolism');
  const activeComponents = [];
  
  // LIMITE DE COMPOSANTS
  const MAX_COMPONENTS = Math.ceil(childHandler.readFloat('maxComponents')*3); // ou 3 selon ta préférence
  
  // Parcourir tous les composants optionnels possibles
  for (const componentName in OPTIONAL_COMPONENTS) {
    const hasParentComponent = this.entityManager.hasComponent(parentId, componentName);
    
    const inheritProbability = hasParentComponent ? 0.9 : 0.01;
    
    if (Math.random() < inheritProbability) {
      // VÉRIFIER LA LIMITE
      if (activeComponents.length >= MAX_COMPONENTS) {
        // Si mutation (nouveau composant), échanger avec un existant
        if (!hasParentComponent && activeComponents.length > 0) {
          // Retirer un composant aléatoire
          const removeIndex = Math.floor(Math.random() * activeComponents.length);
          const removedComponent = activeComponents.splice(removeIndex, 1)[0];
          this.entityManager.removeComponent(childId, removedComponent);
        } else {
          continue; // Skip si limite atteinte et pas d'échange
        }
      }
      
      const ComponentClass = OPTIONAL_COMPONENTS[componentName];
      const params = generateComponentParameters(componentName, childHandler);
      const instance = new ComponentClass(...params);
      
      this.entityManager.addComponent(childId, componentName, instance);
      activeComponents.push(componentName);
    }
  }
  
  if (metabolism) {
    metabolism.maintenanceCost = calculateMaintenanceCost(activeComponents);
  }
}
}