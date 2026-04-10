/**
 * SimulationEngine - Moteur principal de la simulation
 * Orchestre tous les systèmes ECS
 */

import { EntityManager } from './EntityManager.js';
import { World } from './World.js';
import { MetabolismSystem } from './systems/MetabolismSystem.js';
import { MovementSystem } from './systems/MovementSystem.js';
import { ReproductionSystem } from './systems/ReproductionSystem.js';
import { PhotosynthesisSystem } from './systems/PhotosynthesisSystem.js';
import { CannibalismSystem } from './systems/CannibalismSystem.js';
import { PredatorSystem } from './systems/PredatorSystem.js';
import { PromiscuitySystem } from './systems/PromiscuitySystem.js';
import { ChemicalSystem } from './systems/ChemicalSystem.js';
import { SpecializationSystem } from './systems/SpecializationSystem.js';
import { ExplosiveSystem } from './systems/ExplosiveSystem.js';
import { 
  Position, 
  Genome, 
  Metabolism, 
  OPTIONAL_COMPONENTS, 
  SPECIALIZATION_COMPONENTS,
  Movement,
  Predator
} from './components/Components.js';
import { ADNHandler, randomGenome } from '../../genetic/ADNPlante';
import { 
  generateRandomComponents, 
  generateComponentParameters,
  calculateMaintenanceCost
} from '../utils/RandomBacteriaGenerator.js';
import { ParasiteSystem } from './systems/ParasiteSystem.js';
import { SymbiosisSystem } from './systems/SymbiosisSystem.js';
import { AdhesionSystem } from './systems/AdhesionSystem.js';
import { FiltrationSystem } from './systems/FiltrationSystem.js';
import { BiologicalClockSystem } from './systems/BiologicalClockSystem.js';
import { GeneticRecombinationSystem } from './systems/GeneticRecombination.js';
import { EnhancedSensorsSystem } from './systems/EnhancedSensorsSystem.js';
import { PipeSystem } from './systems/PipeSystem.js';
import { CarbonatePipeSystem } from './systems/CarbonatePipeSystem.js';
import { CellDivisionSystem } from './systems/CellDivisionSystem.js';

export class SimulationEngine {
  constructor(worldWidth = 200, worldHeight = 200) {
    this.entityManager = new EntityManager();
    this.world = new World(worldWidth, worldHeight);

    // Systèmes
    this.metabolismSystem = new MetabolismSystem(this.entityManager, this.world);
    this.movementSystem = new MovementSystem(this.entityManager, this.world);
    this.reproductionSystem = new ReproductionSystem(this.entityManager, this.world);
    this.photosynthesisSystem = new PhotosynthesisSystem(this.entityManager, this.world);
    this.cannibalismSystem = new CannibalismSystem(this.entityManager, this.world);
    this.predatorSystem = new PredatorSystem(this.entityManager, this.world);
    this.promiscuitySystem = new PromiscuitySystem(this.entityManager, this.world);
    this.chemicalSystem = new ChemicalSystem(this.entityManager, this.world);
    this.adhesionSystem = new AdhesionSystem(this.entityManager, this.world);

this.carbonatePipeSystem = new CarbonatePipeSystem(this.entityManager, this.world);

this.pipeSystem = new PipeSystem(this.entityManager, this.world);
this.enhancedSensorsSystem = new EnhancedSensorsSystem(this.entityManager, this.world);
this.cellDivisionSystem = new CellDivisionSystem(this.entityManager, this.world);

    this.recombinationSystem = new GeneticRecombinationSystem(this.entityManager, this.world);


this.biologicalClockSystem = new BiologicalClockSystem(this.entityManager, this.world);

    this.filtrationSystem = new FiltrationSystem(this.entityManager, this.world);

this.parasiteSystem = new ParasiteSystem(this.entityManager, this.world);
this.symbiosisSystem = new SymbiosisSystem(this.entityManager, this.world);
    this.explosiveSystem = new ExplosiveSystem(this.entityManager, this.world);
    this.specializationSystem = new SpecializationSystem(this.entityManager, this.world);
this.metabolismSystem.explosiveSystem = this.explosiveSystem;
this.metabolismSystem.filtrationSystem = this.filtrationSystem;

    // État de la simulation
    this.running = false;
    this.tickCount = 0;
    this.lastTickTime = 0;

  this.populationHistory = [];
  this.maxHistoryLength = 500; // Garder 500 points max
  this.historyInterval = 10; // Enregistrer tous les 10 ticks

    // Statistiques
    this.stats = {
      tickCount: 0, 
      population: 0,xenophobiaEvents: 0,
      births: 0, parasites: 0,
  parasiteDrains: 0,
  symbiotes: 0,
  sexualReproductions: 0,
  symbioticPartnerships: 0,
  chemicalBursts: 0,
      deaths: 0, explosions: 0,
  explosionKills: 0,
      totalBirths: 0,  adhesionConnections: 0, disconnections:0,
  chainMoves: 0,
      totalDeaths: 0,
      ticksPerSecond: 0,
      photosynthesizers: 0,
  organicFeeders: 0,
  mineralFeeders: 0,
      energyFromPhotosynthesis: 0,
      cannibals: 0,
      cannibalismDeaths: 0,
  dormantBacteria: 0,
  clockMigrations: 0,
  clockReproductions: 0,
  carbonateStructures: 0,
  carbonateSegments: 0,
      predators: 0,
  pipeNodes: 0,
  pipeConnections: 0,
      predatorKills: 0,
      stressedBacteria: 0,
      stressPercentage: 0,
      chemicalEmitters: 0,
      chemicalReceptors: 0,
      chemotaxisEvents: 0,
      specializations: 0,sporulations : 0, sporesCreated:0
    };
    
  }

  /**
   * Initialise la simulation avec une population de départ
   * @param {number} initialPopulation - Nombre de bactéries
   * @param {number} componentProbability - Probabilité qu'un composant soit activé (0.0-1.0)
   */
  initialize(initialPopulation = 100) {
    this.entityManager.clear();
    this.world.reset();
    this.tickCount = 0;

    // Créer la population initiale au centre
    const centerX = Math.floor(this.world.width / 2);
    const centerY = Math.floor(this.world.height / 2);
    const spawnRadius = 20;

    for (let i = 0; i < initialPopulation; i++) {
      // Position aléatoire autour du centre
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * spawnRadius;
      const x = Math.floor(centerX + Math.cos(angle) * distance);
      const y = Math.floor(centerY + Math.sin(angle) * distance);
      const pos = this.world.wrap(x, y);

      // Ne pas créer si la case est occupée
      if (!this.world.isFree(pos.x, pos.y)) continue;

      // Créer la bactérie avec ADN
      const adn = randomGenome();
      const adnHandler = new ADNHandler(adn);

      const entityId = this.entityManager.createEntity();
      this.entityManager.addComponent(entityId, 'Position', new Position(pos.x, pos.y));
      this.entityManager.addComponent(entityId, 'Genome', new Genome(adn, adnHandler));
     // this.entityManager.addComponent(entityId, 'Movement', new Movement(adnHandler.readFloat('movementSpeed')));
      const energyStored = adnHandler.read10('energieDeDepart')*10+50;
      const maxAge = adnHandler.read10('dureeDeVie')*10+200;
      const metabolism = new Metabolism(energyStored, maxAge);
      
      // Générer des composants aléatoires
      const componentProbability = adnHandler.readFloat('componentProbability')/8;
      const activeComponents = generateRandomComponents(componentProbability);
      
      // Calculer le coût de maintenance total
      metabolism.maintenanceCost = calculateMaintenanceCost(activeComponents);
      
      this.entityManager.addComponent(entityId, 'Metabolism', metabolism);

      // Ajouter les composants optionnels
      for (const componentName of activeComponents) {
        const ComponentClass = OPTIONAL_COMPONENTS[componentName];
        if (ComponentClass) {
          const params = generateComponentParameters(componentName, adnHandler);
          const instance = new ComponentClass(...params);
          this.entityManager.addComponent(entityId, componentName, instance);
        }
      }

      this.world.setEntity(pos.x, pos.y, entityId);
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
    this.world.updateDayNight(deltaTime);

    // Régénération environnementale (tous les 10 ticks pour optimiser)
    if (this.tickCount % 10 === 0) {
      this.world.regenerateReserves();
    }

    // Exécution des systèmes dans l'ordre logique
    // 1. Chimie (émission, diffusion, réception)
    const chemicalResult = this.chemicalSystem.update(deltaTime);
    
    // 2. Production d'énergie (photosynthèse)
    const photosynthesisResult = this.photosynthesisSystem.update(deltaTime);
    
const clockResult = this.biologicalClockSystem.update(deltaTime);
    // 3. Stress de promiscuité (coût de densité)
    const promiscuityResult = this.promiscuitySystem.update(deltaTime);

  // Phase 0: Nettoyer
  const cleanResult = this.adhesionSystem.cleanHeterogeneousConnections();
    const adhesionConnectionResult = this.adhesionSystem.updateConnections(deltaTime);
const adhesionMoveResult = this.adhesionSystem.moveChains(deltaTime);

    // 4. Métabolisme (consommation basale)
    const metabolismResult = this.metabolismSystem.update(deltaTime);
    
const pipeResult = this.pipeSystem.update(deltaTime);
    // 5. Prédation active (chasse)
    const predatorResult = this.predatorSystem.update(deltaTime);
const parasiteResult = this.parasiteSystem.update(deltaTime);
const symbiosisResult = this.symbiosisSystem.update(deltaTime);
    
    // 6. Cannibalisme (survie désespérée sur faibles)
    const cannibalismResult = this.cannibalismSystem.update(deltaTime);
    const explosiveResult = this.explosiveSystem.update(deltaTime);
const filtrationResult = this.filtrationSystem.update(deltaTime);

    // 7. Spécialisation (transformation si bloqué avec énergie max)
    const specializationResult = this.specializationSystem.update(deltaTime);
const recombinationResult = this.recombinationSystem.update(deltaTime);
    
    // 8. Mouvement (recherche de ressources/fuite) - chimiotaxie déjà gérée dans ChemicalSystem
    this.movementSystem.update(deltaTime);
    
const cellDivisionResult = this.cellDivisionSystem.update(deltaTime);
    // 9. Reproduction (si énergie suffisante)
    const reproductionResult = this.reproductionSystem.update(deltaTime);

const carbonateResult = this.carbonatePipeSystem.update(deltaTime);

    // Mise à jour des statistiques
    this.stats.births = reproductionResult.newBorn;
this.stats.parasites = parasiteResult.parasites;
this.stats.parasiteDrains = parasiteResult.feedingEvents;
this.stats.symbiotes = symbiosisResult.symbiotes;
this.stats.carbonateStructures = carbonateResult.newStructures;
this.stats.carbonateSegments = carbonateResult.totalSegments;
this.stats.sporulations = cellDivisionResult.sporulations;
this.stats.sporesCreated = cellDivisionResult.totalSpores;
this.stats.organicFeeders = filtrationResult.organicBonuses;
this.stats.dormantBacteria = clockResult.dormancyEntered - clockResult.dormancyExited;
this.stats.clockMigrations = clockResult.migrations;
this.stats.clockReproductions = clockResult.synchronizedReproductions;
this.stats.mineralFeeders = filtrationResult.mineralBonuses;
this.stats.symbioticPartnerships = symbiosisResult.partnerships;
    this.stats.deaths = metabolismResult.died + cannibalismResult.deaths + predatorResult.kills;
    this.stats.totalBirths += reproductionResult.newBorn;
    this.stats.totalDeaths += metabolismResult.died + cannibalismResult.deaths + predatorResult.kills;
    this.stats.photosynthesizers = photosynthesisResult.photosynthesizers;
    this.stats.energyFromPhotosynthesis = photosynthesisResult.totalProduced;
    this.stats.cannibals = cannibalismResult.cannibals;
    this.stats.adhesionConnections = adhesionConnectionResult.newConnections;

    this.stats.disconnections= cleanResult.disconnections;
this.stats.chainMoves = adhesionMoveResult.chainMoves;

    this.stats.phagocytosed = adhesionMoveResult.phagocytosed || 0;
this.stats.explosions = explosiveResult.explosions;
this.stats.explosionKills = explosiveResult.kills;
    this.stats.cannibalismDeaths = cannibalismResult.deaths;
    this.stats.predators = predatorResult.predators;
this.stats.pipeNodes = pipeResult.nodes;
this.stats.pipeConnections = pipeResult.newConnections;
    this.stats.predatorKills = predatorResult.kills;
    this.stats.stressedBacteria = promiscuityResult.stressedBacteria;
    this.stats.stressPercentage = promiscuityResult.stressPercentage;
    this.stats.xenophobiaEvents = promiscuityResult.xenophobiaEvents;
    this.stats.chemicalEmitters = chemicalResult.emitters;
    this.stats.chemicalReceptors = chemicalResult.receptors;
    this.stats.chemotaxisEvents = chemicalResult.chemotaxisEvents;
    this.stats.specializations = specializationResult.transformations;
    
    this.updateStats();

    if (this.tickCount % this.historyInterval === 0) {
      this._recordHistory();
    }
  }

  /**
   * Met à jour les statistiques
   */
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

// Getter pour le composant
getPopulationHistory() {
  return this.populationHistory;
}
// Dans SimulationEngine.js - Nouvelle méthode
// Dans SimulationEngine.js

/**
 * Applique un événement écologique
 */
applyEvent(eventType) {
  const events = {
    javel: () => this.thanosSelection(),
    drought: () => this._eventDrought(),
    heatwave: () => this._eventHeatwave(),

  radiation: () => this._eventRadiation(),
  centralvoid: () => this._eventCentralVoid(),
  edgebonus: () => this._eventEdgeBonus(),
  gradient: () => this._eventGradientPressure(),
  chemstorm: () => this._eventChemicalStorm(),
  extinction: () => this._eventMassExtinction(),
    iceage: () => this._eventIceAge(),
    virus: () => this._eventVirus(),
    toxicbloom: () => this._eventToxicBloom(),
    predatorwave: () => this._eventPredatorWave(),
    fertility: () => this._eventFertility()
  };

  const eventFn = events[eventType];
  if (eventFn) {
    const result = eventFn();
    console.log(`🌍 Événement: ${eventType}`, result);
    return result;
  }
}

// ============================================================================
// ÉVÉNEMENTS
// ============================================================================

_eventDrought() {
  // Sécheresse : Réserves -70%
  for (let y = 0; y < this.world.height; y++) {
    for (let x = 0; x < this.world.width; x++) {
      const index = y * this.world.width + x;
      const currentReserve = this.world.getReserve(x, y);
      this.world.reserves.set(index, currentReserve * 0.3);
    }
  }
  return { type: 'drought', message: 'Sécheresse ! Réserves -70%' };
}

_eventHeatwave() {
  // Canicule : Jour permanent avec bonus ×3 pendant 500 ticks
  this.world.forceDay = true;
  this.world.forceDayMultiplier = 3.0;
  this.world.forceEventDuration = 500;
  
  setTimeout(() => {
    this.world.forceDay = false;
    this.world.forceDayMultiplier = 1.0;
  }, 500 * (1000 / 60)); // Approximatif
  
  return { type: 'heatwave', message: 'Canicule ! Jour ×3 pendant 500 ticks' };
}

_eventIceAge() {
  // Ère glaciaire : Nuit permanente, coûts ×2 pendant 500 ticks
  this.world.forceNight = true;
  this.world.iceAgePenalty = 2.0;
  this.world.forceEventDuration = 500;
  
  setTimeout(() => {
    this.world.forceNight = false;
    this.world.iceAgePenalty = 1.0;
  }, 500 * (1000 / 60));
  
  return { type: 'iceage', message: 'Ère glaciaire ! Nuit permanente, coûts ×2' };
}

_eventVirus() {
  // Attaque virale : Cible le composant le plus répandu
  const componentCounts = new Map();
  const entities = this.entityManager.getEntitiesWithComponents(['Position']);
  
  // Compter composants
  for (const entityId of entities) {
   
    for (const compName in OPTIONAL_COMPONENTS) {
      if (this.entityManager.hasComponent(entityId, compName)) {
        componentCounts.set(compName, (componentCounts.get(compName) || 0) + 1);
      }
    }
  }
  
  // Trouver le plus répandu
  let maxCount = 0;
  let targetComponent = null;
  for (const [comp, count] of componentCounts.entries()) {
    if (count > maxCount) {
      maxCount = count;
      targetComponent = comp;
    }
  }
  
  if (!targetComponent) return { type: 'virus', message: 'Aucun composant ciblé' };
  
  // Infecter 90% des porteurs du composant
  let infected = 0;
  for (const entityId of entities) {
    if (this.entityManager.hasComponent(entityId, targetComponent)) {
      if (Math.random() < 0.9) {
        const metabolism = this.entityManager.getComponent(entityId, 'Metabolism');
        if (metabolism) {
          metabolism.energyStored -= 150; // Dégâts viraux
          infected++;
        }
      }
    }
  }
  
  return { 
    type: 'virus', 
    message: `Virus cible ${targetComponent} ! ${infected} infectés`
  };
}

_eventCentralVoid() {
  // Gouffre central : Zone morte au centre (30% du plateau)
  const centerX = this.world.width / 2;
  const centerY = this.world.height / 2;
  const voidRadius = Math.min(this.world.width, this.world.height) * 0.3;

  let affected = 0;

  for (let y = 0; y < this.world.height; y++) {
    for (let x = 0; x < this.world.width; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Zone morte
      if (distance < voidRadius) {
        const index = y * this.world.width + x;
        
        // Réserves quasi-nulles (gradient)
        const depletionRatio = 1 - (distance / voidRadius); // 1 au centre, 0 aux bords
        const currentReserve = this.world.getReserve(x, y);
        this.world.reserves.set(index, currentReserve * (0.1 + depletionRatio * 0.2)); // 10-30%
        
        // Dispersion chimique ×5
        for (const molecule of ['A', 'B', 'C', 'D']) {
          const concentration = this.world.getChemicalConcentration(x, y, molecule);
          if (concentration > 0) {
            const chemIndex = index;
            if (this.world.chemicals[molecule]) {
              this.world.chemicals[molecule][chemIndex] *= 0.2; // -80% concentration
            }
          }
        }

        affected++;
      }
    }
  }

  // Réduire production photosynthèse au centre (lumière faible)
  this.world.centralVoid = {
    active: true,
    centerX,
    centerY,
    radius: voidRadius,
    duration: 1000 // 1000 ticks
  };

  setTimeout(() => {
    this.world.centralVoid = null;
  }, 1000 * (1000 / 60));

  return { 
    type: 'centralvoid', 
    message: `Gouffre central ! ${affected} cellules affectées`
  };
}

_eventEdgeBonus() {
  // Bordures fertiles : Périphérie ×3 ressources
  const edgeWidth = 20; // 20 cellules depuis les bords

  for (let y = 0; y < this.world.height; y++) {
    for (let x = 0; x < this.world.width; x++) {
      // Distance aux bords
      const distToEdge = Math.min(
        x,
        y,
        this.world.width - x - 1,
        this.world.height - y - 1
      );

      if (distToEdge < edgeWidth) {
        const index = y * this.world.width + x;
        const currentReserve = this.world.getReserve(x, y);
        const potential = this.world.getPotential(x, y);
        this.world.reserves.set(index, Math.min(potential * 3, currentReserve * 3));
      }
    }
  }

  return { type: 'edgebonus', message: 'Bordures fertiles ! Périphérie ×3' };
}

_eventGradientPressure() {
  // Gradient horizontal : Ouest riche, Est pauvre
  for (let y = 0; y < this.world.height; y++) {
    for (let x = 0; x < this.world.width; x++) {
      const index = y * this.world.width + x;
      const ratio = x / this.world.width; // 0 à l'ouest, 1 à l'est
      
      const currentReserve = this.world.getReserve(x, y);
      // Ouest : ×2, Est : ×0.2
      const multiplier = 2.0 - ratio * 1.8;
      this.world.reserves.set(index, currentReserve * multiplier);
    }
  }

  // Gradient lumière aussi
  this.world.lightGradient = {
    active: true,
    direction: 'horizontal',
    duration: 800
  };

  setTimeout(() => {
    this.world.lightGradient = null;
  }, 800 * (1000 / 60));

  return { type: 'gradient', message: 'Gradient horizontal ! Ouest fertile, Est désertique' };
}

_eventChemicalStorm() {
  // Tempête chimique : Émission aléatoire massive de TOUTES les molécules
  const molecules = ['A', 'B', 'C', 'D'];
  let hotspots = 0;

  for (let i = 0; i < 50; i++) { // 50 points d'émission
    const x = Math.floor(Math.random() * this.world.width);
    const y = Math.floor(Math.random() * this.world.height);
    const molecule = molecules[Math.floor(Math.random() * 4)];
    
    this.world.emitChemical(x, y, molecule, 30 + Math.random() * 50); // 30-80
    hotspots++;
  }

  return { type: 'chemstorm', message: `Tempête chimique ! ${hotspots} hotspots` };
}

_eventMassExtinction() {
  // Extinction massive : Tue 80% (plus sévère que Javel)
  const entities = this.entityManager.getEntitiesWithComponents(['Position', 'Metabolism']);
  const toDestroy = [];

  for (const entityId of entities) {
    const metabolism = this.entityManager.getComponent(entityId, 'Metabolism');

    let survivalChance = 0.2; // Base 20%

    // Bonus dormance
    if (metabolism.isDormant) {
      survivalChance += 0.5; // +50%
    }

    // Bonus défense
    const immunity = this.entityManager.getComponent(entityId, 'Immunity');
    const cuticle = this.entityManager.getComponent(entityId, 'ThickCuticle');
    if (immunity) survivalChance += immunity.defense * 0.02;
    if (cuticle) survivalChance += cuticle.defenseBonus * 0.03;

    if (Math.random() >= survivalChance) {
      toDestroy.push(entityId);
    }
  }

  // Détruire
  for (const entityId of toDestroy) {
    const position = this.entityManager.getComponent(entityId, 'Position');
    if (position) {
      this.world.removeEntity(position.x, position.y);
    }
    this.entityManager.destroyEntity(entityId);
  }

  // Réduire ressources aussi
  for (let y = 0; y < this.world.height; y++) {
    for (let x = 0; x < this.world.width; x++) {
      const index = y * this.world.width + x;
      const currentReserve = this.world.getReserve(x, y);
      this.world.reserves.set(index, currentReserve * 0.1); // -90%
    }
  }

  return { 
    type: 'extinction', 
    message: `Extinction massive ! ${toDestroy.length} morts`
  };
}
_eventRadiation() {
  // Radiation : Mutations massives (50% de la population mute)
  const entities = this.entityManager.getEntitiesWithComponents(['Genome']);
  let mutated = 0;

  for (const entityId of entities) {
    if (Math.random() < 0.5) {
      const genome = this.entityManager.getComponent(entityId, 'Genome');
      const mutatedADN = genome.handler.mutatedVersion();
      genome.handler.adn = mutatedADN;
      mutated++;
    }
  }

  return { type: 'radiation', message: `Radiation ! ${mutated} mutations` };
}

_eventToxicBloom() {
  // Bloom toxique : Émission massive de molécule random
  const molc=['A','B','C','D'];
const theMolec = molc[Math.floor(Math.random()*4)];
  for (let y = 0; y < this.world.height; y += 5) {
    for (let x = 0; x < this.world.width; x += 5) {
      this.world.emitChemical(x, y, theMolec, 50); // Énorme concentration
    }
  }
  return { type: 'toxicbloom', message: 'Bloom toxique ! Molécule '+theMolec+' partout' };
}

_eventPredatorWave() {
  
  
  let spawned = 0;
  const targetCount = Math.floor(this.entityManager.getEntityCount() * 0.2); // 10% de la pop
  
  for (let i = 0; i < targetCount; i++) {
    const x = Math.floor(Math.random() * this.world.width);
    const y = Math.floor(Math.random() * this.world.height);
    
    if (!this.world.isFree(x, y)) continue;
    
    const adn = randomGenome();
    const handler = new ADNHandler(adn);
    const entityId = this.entityManager.createEntity();
    
    this.entityManager.addComponent(entityId, 'Position', new Position(x, y));
    this.entityManager.addComponent(entityId, 'Genome', new Genome(adn, handler));
    this.entityManager.addComponent(entityId, 'Movement', new Movement(handler.readFloat('movementSpeed')));

    this.entityManager.addComponent(entityId, 'Metabolism', new Metabolism(200, 150));
    
    const params = generateComponentParameters('Predator', handler);
    this.entityManager.addComponent(entityId, 'Predator', new Predator(...params));
    
    this.world.setEntity(x, y, entityId);
    spawned++;
  }
  
  return { type: 'predatorwave', message: `${spawned} prédateurs aliens spawned` };
}

_eventFertility() {
  // Fertilisation : Réserves ×3
  for (let y = 0; y < this.world.height; y++) {
    for (let x = 0; x < this.world.width; x++) {
      const index = y * this.world.width + x;
      const currentReserve = this.world.getReserve(x, y);
      const potential = this.world.getPotential(x, y);
      this.world.reserves.set(index, Math.min(potential * 3, currentReserve * 3));
    }
  }
  return { type: 'fertility', message: 'Fertilisation ! Réserves ×3' };
}
/**
 * Sélection drastique type Thanos
 * Tue 50% de la population, réduit ressources et énergie
 * Favorise dormants et immunity
 */
thanosSelection() {
  const entities = this.entityManager.getEntitiesWithComponents(['Position', 'Metabolism']);
  const toDestroy = [];
  const survivors = [];

  for (const entityId of entities) {
    const metabolism = this.entityManager.getComponent(entityId, 'Metabolism');
    const position = this.entityManager.getComponent(entityId, 'Position');

    // Calculer probabilité de survie
    let survivalChance = 0.01; // Base 1%

    // BONUS DORMANCE : +40%
    if (metabolism.isDormant) {
      survivalChance += 0.1;
    }

    // BONUS IMMUNITY : +defense × 2%
    const immunity = this.entityManager.getComponent(entityId, 'Immunity');
    if (immunity) {
      survivalChance += immunity.defense * 0.02; // 0-20%
    }

    // BONUS THICK CUTICLE : +defenseBonus × 3%
    const cuticle = this.entityManager.getComponent(entityId, 'ThickCuticle');
    if (cuticle) {
      survivalChance += cuticle.defenseBonus * 0.03; // 0-21%
    }

    // BONUS REINFORCED WALL : +protection × 1%
    const wall = this.entityManager.getComponent(entityId, 'ReinforcedWall');
    if (wall) {
      survivalChance += wall.protection * 0.01; // 0-10%
    }

    // MALUS ÉNERGIE FAIBLE : Si <30% énergie, -20%
    const energyRatio = metabolism.energyStored / metabolism.maxEnergyStored;
    if (energyRatio < 0.3) {
      survivalChance -= 0.2;
    }

    // Tirage au sort
    if (Math.random() < survivalChance) {
      // SURVIVANT : Réduction drastique d'énergie
      if (!metabolism.isDormant) {
        metabolism.energyStored *= 0.3; // -70% énergie
      } else {
        metabolism.energyStored *= 0.5; // -50% si dormant
      }
      survivors.push(entityId);
    } else {
      // MORT
      toDestroy.push(entityId);
    }
  }

  // Détruire les victimes
  for (const entityId of toDestroy) {
    const position = this.entityManager.getComponent(entityId, 'Position');
    
    // Enregistrer cadavre pour Filtration
    if (this.filtrationSystem && position) {
      this.filtrationSystem.registerDeath(position.x, position.y);
    }

    if (position) {
      this.world.removeEntity(position.x, position.y);
    }
    this.entityManager.destroyEntity(entityId);
  }

  // Réduire drastiquement les ressources environnementales
  for (let y = 0; y < this.world.height; y++) {
    for (let x = 0; x < this.world.width; x++) {
      const index = y * this.world.width + x;
      const currentReserve = this.world.getReserve(x, y);
      this.world.reserves.set(index, currentReserve * 0.2); // -80% ressources
    }
  }

  console.log(`🌀 SÉLECTION THANOS : ${toDestroy.length} morts, ${survivors.length} survivants`);

  return {
    killed: toDestroy.length,
    survived: survivors.length
  };
}
  /**
   * Réinitialise complètement la simulation
   */
  reset(initialPopulation = 100) {
    this.pause();
    this.initialize(initialPopulation);
    this.populationHistory=[];
    this.stats.totalBirths = 0;
    this.stats.totalDeaths = 0;
    this.stats.photosynthesizers = 0;
    this.stats.energyFromPhotosynthesis = 0;
    this.stats.cannibals = 0;
    this.stats.cannibalismDeaths = 0;
    this.stats.predators = 0;
    this.stats.predatorKills = 0;
    this.stats.stressedBacteria = 0;
    this.stats.stressPercentage = 0;
    this.stats.chemicalEmitters = 0;
    this.stats.chemicalReceptors = 0;
    this.stats.chemotaxisEvents = 0;
  }

  /**
   * Récupère toutes les entités avec leurs composants (pour le rendu)
   */
  getEntitiesForRendering() {
    const entities = this.entityManager.getEntitiesWithComponents(['Position']);
    return entities.map(id => {
      const entity = this.entityManager.entities.get(id);
      
      
      // Lister tous les composants optionnels actifs
      const activeComponents = [];
      for (const componentName in OPTIONAL_COMPONENTS) {
        if (this.entityManager.hasComponent(id, componentName)) {
          activeComponents.push(componentName);
        }
      }
      
      // Ajouter les composants de spécialisation
      for (const componentName in SPECIALIZATION_COMPONENTS) {
        if (this.entityManager.hasComponent(id, componentName)) {
          activeComponents.push(componentName);
        }
      }
      
      return {
        id,
        position: this.entityManager.getComponent(id, 'Position'),
        genome: this.entityManager.getComponent(id, 'Genome'),
        metabolism: this.entityManager.getComponent(id, 'Metabolism'),
        activeComponents
      };
    });
  }

  /**
   * Récupère les statistiques actuelles
   */
  getStats() {
    return { ...this.stats };
  }

  /**
   * Récupère l'état du monde
   */
  getWorldState() {
    return {
      dayNightRatio: this.world.getDayNightRatio(),
      isDay: this.world.dayNightCycle.isDay,
      width: this.world.width,
      height: this.world.height
    };
  }
}