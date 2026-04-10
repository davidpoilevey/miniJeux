
import { Genome,  Position } from '../../b9/engine/components/Components';
import { EntityManager } from '../../b9/engine/EntityManager';
import { ADNHandler, randomGenome } from '../../genetic/ADNPlante';
import { GrowthSystem } from '../systems/GrowthSystem';
import { InteractionSystem } from '../systems/InteractionSystem';
import { LocomotionSystem } from '../systems/LocomotionSystem';
import { MetabolismSystem } from '../systems/MetabolismSystem';
import { NavigationSystem } from '../systems/NavigationSystem';
import { ReproductionSystem } from '../systems/ReproductionSystem';
import { generateComponentParameters, generateRandomComponents } from '../utils/phenotype';
import { Bioluminescence, BodyPlan, CAMB_COMPONENTS, Metabolism, Navigation } from './Components';
import { Ocean } from './Ocean';


export class CambrienEngine {
  constructor(worldWidth = 200, worldHeight = 200) {
    this.entityManager = new EntityManager();
    this.ocean = new Ocean(worldWidth, worldHeight);

    // Systèmes
     this.reproductionSystem = new ReproductionSystem(this.entityManager, this.ocean, this.createOrganism);
    this.metabolismSystem = new MetabolismSystem(this.entityManager, this.ocean);
    this.growthSystem = new GrowthSystem(this.entityManager, this.ocean);
    this.interactionSystem = new InteractionSystem(this.entityManager, this.ocean);
    this.navigationSystem = new NavigationSystem(this.entityManager, this.ocean);
    this.locomotionSystem = new LocomotionSystem(this.entityManager, this.ocean);

    // État de la simulation
    this.running = false;
    this.tickCount = 0;
    this.lastTickTime = 0;

  this.populationHistory = [];
  this.maxHistoryLength = 500; // Garder 500 points max
  this.historyInterval = 10; // Enregistrer tous les 10 ticks
 this.stats = {
      tickCount: 0, 
      population: 0
 }
  }

  reset(){
    this.initialize();
  }

  initialize(initialPopulation = 50) {
    this.entityManager.clear();
    this.ocean.reset();
    this.tickCount = 0;
    this.lastTickTime = 0;

    // Créer la population initiale au centre
    const centerX = Math.floor(this.ocean.width / 2);
    const centerY = Math.floor(this.ocean.height / 2);
    const spawnRadius = 100;

    for (let i = 0; i < initialPopulation; i++) {
      // Position aléatoire autour du centre
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * spawnRadius;
      const x = Math.floor(centerX + Math.cos(angle) * distance);
      const y = Math.floor(centerY + Math.sin(angle) * distance);
      const pos = this.ocean.wrap(x, y);

      // Ne pas créer si la case est occupée
      if (!this.ocean.isFree(pos.x, pos.y)) continue;

      // Créer la bactérie avec ADN
      const adn = randomGenome();
      const adnHandler = new ADNHandler(adn);

      const entityId = this.createOrganism(pos.x, pos.y, adn);
     
      
      
      // Générer des composants aléatoires
       const componentProbability = adnHandler.readFloat('componentProbability')/8;
       const activeComponents = generateRandomComponents(componentProbability);
      
      // // Calculer le coût de maintenance total
      // metabolism.maintenanceCost = calculateMaintenanceCost(activeComponents);
      
      // this.entityManager.addComponent(entityId, 'Metabolism', metabolism);

      // // Ajouter les composants optionnels
      for (const componentName of activeComponents) {
        const ComponentClass = CAMB_COMPONENTS[componentName];
        if (ComponentClass) {
          const params = generateComponentParameters(componentName, adnHandler);
          const instance = new ComponentClass(...params);
          this.entityManager.addComponent(entityId, componentName, instance);
        }
      }

    }

    this.updateStats();
  }

  /**
   * Effectue un tick de simulation
   * @param {number} deltaTime - Temps écoulé en ms
   */
  tick(deltaTime = 16.67) { // ~60fps par défaut
    this.tickCount++;

    // Mise à jour du cycle jour/nuit
    this.ocean.update(deltaTime);
 
      this.growthSystem.update(deltaTime);

    this.navigationSystem.update(deltaTime);
    this.locomotionSystem.update(deltaTime);
    this.interactionSystem.update(deltaTime);
   Object.assign(this.stats, this.reproductionSystem.update(deltaTime));
    
    this.metabolismSystem.update(deltaTime);
    
    // Mise à jour des statistiques
   // this.stats.births = reproductionResult.newBorn;
    this.updateStats();

    if (this.tickCount % this.historyInterval === 0) {
      this._recordHistory();
    }
  }

/**
 * Crée une entité de base avec tous les composants minimaux
 * Point d'entrée unique pour toute création d'organisme
 */
createOrganism(x, y, adnSource = null) {
  // Génome
  const adn = adnSource 
    ? adnSource                  // Hérité (reproduction)
    : randomGenome();            // Aléatoire (spawn initial)
  const handler = new ADNHandler(adn);

  // Lire traits depuis ADN
  const symmetry = this._readSymmetry(handler);
  const maxSegments = Math.ceil(handler.readFloat('maxSegments') * 10) + 3; // 3-13
  const locomotionMode = this._readLocomotionMode(handler);
  const maxAge = Math.ceil(handler.readFloat('maxAge') * 100) + 50; // 50-150
  const maxEnergy = 50 + handler.readFloat('maxEnergy') * 150; // 50-200

  // Créer entité
  const entityId = this.entityManager.createEntity();

  // Composants minimaux
  this.entityManager.addComponent(entityId, 'Position', 
    new Position(x, y)
  );
  
  this.entityManager.addComponent(entityId, 'Genome', 
    new Genome(adn, handler)
  );
  const metabolism = new Metabolism(maxEnergy, maxAge);
  metabolism.oxygenConsumption=handler.readFloat('oxygeneConso');
  metabolism.maturityAge=maxAge*handler.readFloat('maturityAge')*0.6;// un minimum de 60%
  metabolism.isMature=false;
  metabolism.maturityEnergyThreshold=handler.readFloat('energyMature');
  this.entityManager.addComponent(entityId, 'Metabolism',
    metabolism
  );
  
  this.entityManager.addComponent(entityId, 'BodyPlan',
    new BodyPlan(symmetry, maxSegments, locomotionMode)
  );
   this.entityManager.addComponent(entityId, 'Navigation', new Navigation());
  

  // Placer sur la grille (cellule HEAD initiale)
  const bodyPlan = this.entityManager.getComponent(entityId, 'BodyPlan');
  bodyPlan.cells.push({ x, y, role: 'HEAD', age: 0 });
  this.ocean.setEntity(x, y, entityId);

  return entityId;
}
 updateStats() {
    this.stats.population = this.entityManager.getEntityCount();

    // Calcul du TPS (ticks per second)
    const now = performance.now();
    if (this.lastTickTime > 0) {
      const elapsed = (now - this.lastTickTime) / 1000;
      this.stats.ticksPerSecond = Math.round(1 / elapsed);
    }

  this.stats.population = this.entityManager.getEntityCount();
  this.stats.tickCount = this.tickCount; 
    this.lastTickTime = now;
  }
// Dans CambrienEngine.js
 getOrganismsForStats() {
    const entities = this.entityManager.getEntitiesWithComponents(['Position']);
    return entities.map(id => {
      const entity = this.entityManager.entities.get(id);
      
      
      // Lister tous les composants optionnels actifs
      const activeComponents = [];
      for (const componentName in CAMB_COMPONENTS) {
        if (this.entityManager.hasComponent(id, componentName)) {
          activeComponents.push(componentName);
        }
      }
      
      return {
        id,
        position: this.entityManager.getComponent(id, 'Position'),
        genome: this.entityManager.getComponent(id, 'Genome'),
        bodyPlan: this.entityManager.getComponent(id, 'BodyPlan'),
        metabolism: this.entityManager.getComponent(id, 'Metabolism'),
        activeComponents
      };
    });
  }

getGrowthPlan(entityId) {
  const bodyplan = this.entityManager.getComponent(entityId, 'BodyPlan');
  if(bodyplan==null)
    return null;
return this.growthSystem._buildGrowthPlan(entityId
  , this.entityManager.getComponent(entityId, 'Genome')
,bodyplan )
}
getOrganismsForRendering() {
  const organisms = this.entityManager.getEntitiesWithComponents([
    'Position',
    'BodyPlan',
    'Metabolism',
  ]);

  return organisms.map(entityId => ({
    position: this.entityManager.getComponent(entityId, 'Position'),
    bodyPlan: this.entityManager.getComponent(entityId, 'BodyPlan'),
    metabolism: this.entityManager.getComponent(entityId, 'Metabolism'),
    ink: this.entityManager.getComponent(entityId, 'Ink'),
    bioluminescence: this.entityManager.getComponent(entityId, 'Bioluminescence')
  }));
}
// À ajouter dans CambrienEngine.js

applyEvent(type) {
  const all = this.entityManager.getEntitiesWithComponents(['Position']);

  switch (type) {

    case 'mass_extinction':
      for (const id of all) {
        if (Math.random() < 0.7) this.entityManager.destroyEntity(id);
      }
      break;

    case 'cambrian_explosion':
      for (let i = 0; i < 100; i++) {
        const x = Math.floor(Math.random() * this.ocean.width);
        const y = Math.floor(Math.random() * this.ocean.height);
        if (!this.ocean.isFree(x, y)) continue;
        const entityId = this.createOrganism(x, y);
        const handler = this.entityManager.getComponent(entityId, 'Genome').handler;
        const active = generateRandomComponents(0.3);
        for (const name of active) {
          const C = CAMB_COMPONENTS[name];
          if (C) this.entityManager.addComponent(
            entityId, name,
            new C(...generateComponentParameters(name, handler))
          );
        }
      }
      break;

    case 'viral_attack': {
      // Trouver le composant le plus répandu
      const freq = new Map();
      for (const id of all) {
        for (const name of Object.keys(CAMB_COMPONENTS)) {
          if (this.entityManager.hasComponent(id, name))
            freq.set(name, (freq.get(name) ?? 0) + 1);
        }
      }
      if (!freq.size) break;
      const dominant = [...freq.entries()].sort((a, b) => b[1] - a[1])[0][0];
      for (const id of all) {
        if (this.entityManager.hasComponent(id, dominant))
          this.entityManager.destroyEntity(id);
      }
      break;
    }
    default:
  }
}
getOceanState() {
  return this.ocean.getWorldState();
}
// Helpers lecture ADN
_readSymmetry(handler) {
  const val = handler.readFloat('symmetry');
  if (val < 0.35) return 'asymmetric';
  if (val < 0.5)  return 'bilateral';
  if (val < 0.75) return 'radial3';
  return 'radial5';
}

_readLocomotionMode(handler) {
  const val = handler.readFloat('locomotionMode');
  if (val < 0.2)  return 'crawl';
  if (val < 0.4)  return 'undulate';
  if (val < 0.6)  return 'pulse';
  if (val < 0.8)  return 'anchored';
  return 'float';
}

  /**
   * Démarre la simulation
   */
  start() {
    this.running = true;
  }

  /**
   * Met en pause la simulation
   */
  pause() {
    this.running = false;
  }

  /**
   * Toggle pause
   */
  togglePause() {
    this.running = !this.running;
  }

_recordHistory() {
  const entities = this.entityManager.getEntitiesWithComponents(['Position']);
  
  let predators = 0;
  let photosynthesis = 0;
  let filtration = 0;
  
  for (const entityId of entities) {
    if (this.entityManager.hasComponent(entityId, 'Predator')) predators++;
    if (this.entityManager.hasComponent(entityId, 'Photosynthesis')) photosynthesis++;
    if (this.entityManager.hasComponent(entityId, 'Filtration')) filtration++;
  }
  
  this.populationHistory.push({
    tick: this.tickCount,
    total: entities.length,
    predators,
    photosynthesis,
    filtration
  });
  
  // Limiter taille historique
  if (this.populationHistory.length > this.maxHistoryLength) {
    this.populationHistory.shift();
  }
}
getPopulationHistory() {
  return this.populationHistory;
}

getStats() {
  return {};
}
}