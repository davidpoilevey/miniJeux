/**
 * SpecializationSystem - Gère les transformations en cellules spécialisées
 * 
 * Déclenché quand:
 * - energyStored > seuil (150+)
 * - Aucune case libre pour se diviser
 * - Permission génétique (canSpecialize)
 * - Pas encore spécialisé
 * 
 * Coût: 100 énergie
 * Gain: 1 composant avancé aléatoire parmi:
 * - EnhancedSensors (Œil)
 * - Muscular (Muscles)
 * - CrystallineCilia (Cils cristallins)
 * - ThickCuticle (Cuticule épaisse)
 * - MetabolicBoost (Turbo métabolique)
 */

import { OPTIONAL_COMPONENTS, SPECIALIZATION_COMPONENTS } from '../components/Components.js';
import { generateComponentParameters, calculateMaintenanceCost } from '../../utils/RandomBacteriaGenerator.js';

export class SpecializationSystem {
  constructor(entityManager, world) {
    this.entityManager = entityManager;
    this.world = world;
  }

  /**
   * Mise à jour du système
   */
  update(deltaTime) {
    const candidates = this.entityManager.getEntitiesWithComponents([
      'Position',
      'Genome',
      'Metabolism'
    ]);

    let transformations = 0;
    const specializationTypes = {};

    for (const entityId of candidates) {
      const position = this.entityManager.getComponent(entityId, 'Position');
      const genome = this.entityManager.getComponent(entityId, 'Genome');
      const metabolism = this.entityManager.getComponent(entityId, 'Metabolism');

      // Vérifier les conditions de spécialisation
      

      // 2. Seuil d'énergie
      const specializationThreshold = metabolism.maxEnergyStored * (0.5 + genome.handler.readFloat('specializationThreshold') * 0.5);
      if (metabolism.energyStored < specializationThreshold) continue;

      // 3. Pas déjà spécialisé (n'a aucun composant de spécialisation)
      const hasSpecialization = this._hasAnySpecialization(entityId);
      if (hasSpecialization) continue;

      // 4. Aucune case libre pour se diviser (bloqué)
      // const neighbors = this.world.getNeighbors(position.x, position.y);
      // const freeNeighbors = neighbors.filter(n => n.entity === null);
      // if (freeNeighbors.length > 0) continue; // Peut encore se diviser, pas besoin de spécialiser

      // Toutes conditions remplies → Transformation !
      
      // Choisir un composant de spécialisation selon le contexte génétique
      const specializationType = this._chooseSpecialization(entityId, genome);
      if (!specializationType) continue;

      const ComponentClass = SPECIALIZATION_COMPONENTS[specializationType];
      if (!ComponentClass) continue;

      // Coût de transformation
      const cost = ComponentClass.SPECIALIZATION_COST || 100;
      if (metabolism.energyStored < cost) continue;

      // Appliquer le coût
      metabolism.energyStored -= cost;

      // Créer le composant avec paramètres génétiques
      const params = generateComponentParameters(specializationType, genome.handler);
      const instance = new ComponentClass(...params);
      this.entityManager.addComponent(entityId, specializationType, instance);

      // Mettre à jour le coût de maintenance
      const allComponents = this._getAllComponentNames(entityId);
      metabolism.maintenanceCost = calculateMaintenanceCost(allComponents);

      transformations++;
      specializationTypes[specializationType] = (specializationTypes[specializationType] || 0) + 1;
    }

    return {
      transformations,
      specializationTypes
    };
  }

  /**
   * Vérifie si l'entité a déjà une spécialisation
   * @private
   */
  _hasAnySpecialization(entityId) {
    for (const specializationName in SPECIALIZATION_COMPONENTS) {
      if (this.entityManager.hasComponent(entityId, specializationName)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Choisit un type de spécialisation selon le contexte
   * @private
   */
  _chooseSpecialization(entityId, genome) {
    // Pondération selon les composants existants
    const weights = {
      EnhancedSensors: 1.0,
      Muscular: 2.0,
      CrystallineCilia: 2.0,
      ThickCuticle: 1.0,
      MetabolicBoost: 0.5
    };

    // Bonus si a des composants synergiques
    if (this.entityManager.hasComponent(entityId, 'ChemicalReceptor')) {
      weights.EnhancedSensors = 3.0; // Synergie: meilleure détection
    }
    
    if (this.entityManager.hasComponent(entityId, 'Movement') || 
        this.entityManager.hasComponent(entityId, 'Adhesion')) {
      weights.Muscular = 3.0; // Synergie: mouvement/adhésion améliorés
    }
    
    if (this.entityManager.hasComponent(entityId, 'Predator')) {
      weights.CrystallineCilia = 3.0; // Synergie: attaque renforcée
    }
    
    if (this.entityManager.hasComponent(entityId, 'Immunity') || 
        this.entityManager.hasComponent(entityId, 'ReinforcedWall')) {
      weights.ThickCuticle = 3.0; // Synergie: défense maximale
    }
    
    if (this.entityManager.hasComponent(entityId, 'Photosynthesis')) {
      weights.MetabolicBoost = 3.0; // Synergie: production boostée
    }

    // Sélection pondérée aléatoire
    const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
    let random = genome.handler.readFloat('specializationChoice') * totalWeight;

    for (const [type, weight] of Object.entries(weights)) {
      random -= weight;
      if (random <= 0) {
        return type;
      }
    }

    return 'EnhancedSensors'; // Fallback
  }

  /**
   * Récupère tous les noms de composants d'une entité
   * @private
   */
  _getAllComponentNames(entityId) {
    
    const allComponents = [];
    
    // Composants optionnels
    for (const componentName in OPTIONAL_COMPONENTS) {
      if (this.entityManager.hasComponent(entityId, componentName)) {
        allComponents.push(componentName);
      }
    }
    
    // Composants de spécialisation
    for (const componentName in SPECIALIZATION_COMPONENTS) {
      if (this.entityManager.hasComponent(entityId, componentName)) {
        allComponents.push(componentName);
      }
    }
    
    return allComponents;
  }
}