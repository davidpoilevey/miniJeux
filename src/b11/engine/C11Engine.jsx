
import { Genome,  Position } from '../../b9/engine/components/Components';
import { EntityManager } from '../../b9/engine/EntityManager';
import { ADNHandler, randomGenome } from '../../genetic/ADNPlante';
import { resolvePhylogeny } from '../utils/philogenie';
import { Metabolism, ORGAN_COMPONENTS, ORGAN_MASSES } from './Components';
import { GrowthSystem } from './GrowthSystem';
import { MetabolismSystem } from './MetabolismSystem';
import { MovementSystem } from './MovementSystem';
import { ReproductionSystem } from './ReproductionSystem';

import { World } from './World';


export class C11Engine {
  constructor(worldWidth = 200, worldHeight = 200) {
    this.entityManager = new EntityManager();
    this.world = new World(worldWidth, worldHeight);

    // Systèmes actifs
    this.metabolismSystem = new MetabolismSystem(this.entityManager, this.world);
    this.growthSystem     = new GrowthSystem(this.entityManager, this.world);

    this.movementSystem     = new MovementSystem(this.entityManager, this.world);
    this.reproductionSystem = new ReproductionSystem(
      this.entityManager,
      this.world,
      (x, y, adn) => this.createOrganism(x, y, adn)
    );
   

    // État de la simulation
    this.running = false;
    this.tickCount = 0;
    this.lastTickTime = 0;

  this.populationHistory = [];
  this.maxHistoryLength = 500; // Garder 500 points max
  this.historyInterval = 10; // Enregistrer tous les 10 ticks
  this.stats = {
    tickCount: 0,
    population: 0,
    asexualBirths: 0,
    spores: 0,
  }
  }

  reset(){
    this.initialize();
  }

  initialize(initialPopulation = 150) {
    this.entityManager.clear();
    this.world.reset();
    this.tickCount = 0;
    this.lastTickTime = 0;
    this.populationHistory = [];
    this.stats.asexualBirths = 0;
    this.stats.spores        = 0;

    // Créer la population initiale au centre
    const centerX = Math.floor(this.world.width / 2);
    const centerY = Math.floor(this.world.height / 2);
    const spawnRadius = 100;

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

      const entityId = this.createOrganism(pos.x, pos.y, adn);
     
      
    }

    this.updateStats();
  }

  /**
   * Effectue un tick de simulation
   * @param {number} deltaTime - Temps écoulé en ms
   */
  tick(deltaTime = 16.67) { // ~60fps par défaut
    this.tickCount++;

    this.world.update(deltaTime);

    // Ordre : déplacement → énergie → reproduction → croissance
    this.movementSystem.update(deltaTime);                              // l'organisme se déplace d'abord
    this.metabolismSystem.update(deltaTime);                            // mange + maintenance + mort
    const { asexualBirths, spores } = this.reproductionSystem.update(deltaTime);
    this.stats.asexualBirths += asexualBirths;
    this.stats.spores        += spores;
    this.growthSystem.update(deltaTime);                                // consomme le surplus pour grandir

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
  const adn     = adnSource ?? randomGenome();
  const handler = new ADNHandler(adn);

  // Paramètres métaboliques depuis ADN
  const maxAge    = Math.ceil(handler.readFloat('maxAge') * 1000) + 500;
  const maxEnergy = 50 + handler.readFloat('maxEnergy') * 150;

  // Résolution phylogénétique — le cœur du système
  const { bodyPlan, components, silentGenes } = resolvePhylogeny(handler);

  // maintenanceCost sera calculé précisément par GrowthSystem.initOrganism
  // (qui lit les tailles d'organes depuis le génome avant de sommer)
  const maintenanceCost = [...components].reduce(
    (sum, name) => sum + (ORGAN_MASSES[name] ?? 1) * 0.02, 0
  );

  // Entité
  const entityId = this.entityManager.createEntity();

  this.entityManager.addComponent(entityId, 'Position', new Position(x, y));
  this.entityManager.addComponent(entityId, 'Genome',   new Genome(adn, handler));

  const metabolism = new Metabolism(maxEnergy, maxAge);
  metabolism.oxygenConsumption          = handler.readFloat('oxygeneConso');
  metabolism.maturityAge                = maxAge * handler.readFloat('maturityAge') * 0.6;
  metabolism.isMature                   = false;
  metabolism.maturityEnergyThreshold    = handler.readFloat('energyMature');
  metabolism.maintenanceCost            = maintenanceCost;
  this.entityManager.addComponent(entityId, 'Metabolism', metabolism);

  // BodyPlan issu de l'embranchement
  this.entityManager.addComponent(entityId, 'BodyPlan', bodyPlan);

  // Composants fonctionnels exprimés — instanciés via ORGAN_COMPONENTS
  for (const componentName of components) {
    const Cls = ORGAN_COMPONENTS[componentName];
    this.entityManager.addComponent(
      entityId, componentName,
      Cls ? new Cls() : { active: true }
    );
  }

  // Gènes silencieux — présents mais sans effet
  // Stockés dans Genome pour transmission fidèle
  const genome = this.entityManager.getComponent(entityId, 'Genome');
  genome.silentGenes = silentGenes;

  // Placement sur la grille
  this.world.setEntity(x, y, entityId);

  // Initialisation morphologique : lit les tailles d'organes, calcule adultMass,
  // initialise segmentSizes et recalcule maintenanceCost précisément
  this.growthSystem.initOrganism(entityId);

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
  
// À ajouter dans CambrienEngine.js

getWorldState() {
  return this.world.getWorldState();
}

/**
 * Fournit les données minimales nécessaires au renderer pour chaque organisme.
 * Appelé à chaque frame RAF — doit rester léger (pas de copie profonde).
 */
getOrganismsForRendering() {
  const entities = this.entityManager.getEntitiesWithComponents(['Position', 'BodyPlan']);
  return entities.map(entityId => ({
    position:         this.entityManager.getComponent(entityId, 'Position'),
    bodyPlan:         this.entityManager.getComponent(entityId, 'BodyPlan'),
    metabolism:       this.entityManager.getComponent(entityId, 'Metabolism'),
    activeComponents: C11Engine.VISUAL_COMPONENTS.filter(
      name => this.entityManager.hasComponent(entityId, name)
    ),
  }));
}

// Sous-ensemble de composants visualisés par icône PNG dans WorldRenderer.
// Moins coûteux que TRACKED_COMPONENTS (appelé à chaque frame).
static VISUAL_COMPONENTS = [
  'Eye', 'Jaw', 'Mouth', 'Antenna', 'Brain', 'GanglionCluster',
  'Spine', 'Carapace', 'Exoskeleton', 'ElectricOrgan',
  'Heart', 'Notochord', 'Bioluminescence', 'LateralLine', 'Chemoreceptor',
  'Chromatophore', 'InkSac', 'ToxinGland',
];
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
  const entities = this.entityManager.getEntitiesWithComponents(['Metabolism']);

  let predators      = 0;
  let photosynthesis = 0;
  let chemosynthesis = 0;
  let filtration     = 0;
  let mouth          = 0;
  let primitive      = 0;

  const has = (id, comp) => this.entityManager.hasComponent(id, comp);

  for (const entityId of entities) {
    const meta = this.entityManager.getComponent(entityId, 'Metabolism');
    if (!meta?.alive) continue;

    // Même ordre de priorité que getDiet() dans C11Top — catégories mutuellement exclusives
    if      (has(entityId, 'Jaw'))                                         predators++;
    else if (has(entityId, 'Photosynthesis') || has(entityId, 'Chemosynthesis')) {
      if (has(entityId, 'Photosynthesis')) photosynthesis++;
      else                                 chemosynthesis++;
    }
    else if (has(entityId, 'Filtration'))                                  filtration++;
    else if (has(entityId, 'Mouth'))                                       mouth++;
    else                                                                   primitive++;
  }

  this.populationHistory.push({
    tick: this.tickCount,
    total: entities.length,
    predators,
    photosynthesis,
    chemosynthesis,
    filtration,
    mouth,
    primitive,
  });

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

// ── Stats détaillées pour les panneaux de lignées ────────────────────────────

// Organes à surveiller pour la fréquence des traits
static TRACKED_COMPONENTS = [
  'Photosynthesis', 'Chemosynthesis', 'Filtration',
  'Jaw', 'Mouth', 'Gut',
  'Eye', 'Brain', 'GanglionCluster', 'LateralLine', 'Chemoreceptor',
  'Gill', 'Lung',
  'Wing', 'Leg', 'Fin', 'Tentacle',
  'Gonad', 'Uterus', 'Sporulation',
  'Regeneration', 'Anchoring', 'Bioluminescence',
  'Spine', 'Carapace', 'Exoskeleton',
  'Heart', 'Notochord',
];

/**
 * Données complètes pour les panneaux de lignées (CambrienTop / C11Top).
 * Construit activeComponents depuis l'ECS — appelé ≤ 1×/s, pas dans le hot path.
 */
getOrganismsForStats() {
  const entities = this.entityManager.getEntitiesWithComponents(
    ['Position', 'BodyPlan', 'Genome', 'Metabolism']
  );
  return entities.map(entityId => {
    const activeComponents = C11Engine.TRACKED_COMPONENTS.filter(
      name => this.entityManager.hasComponent(entityId, name)
    );
    return {
      id:               entityId,
      genome:           this.entityManager.getComponent(entityId, 'Genome'),
      bodyPlan:         this.entityManager.getComponent(entityId, 'BodyPlan'),
      metabolism:       this.entityManager.getComponent(entityId, 'Metabolism'),
      activeComponents,
    };
  });
}

// ── Événements interactifs ───────────────────────────────────────────────────

applyEvent(type) {
  switch (type) {

    case 'mass_extinction': {
      const entities = this.entityManager.getEntitiesWithComponents(['Metabolism']);
      for (const id of entities) {
        if (Math.random() < 0.70) {
          const meta = this.entityManager.getComponent(id, 'Metabolism');
          if (meta) meta.alive = false;
        }
      }
      break;
    }

    case 'cambrian_explosion': {
      for (let i = 0; i < 100; i++) {
        const x   = Math.floor(Math.random() * this.world.width);
        const y   = Math.floor(Math.random() * this.world.height);
        const pos = this.world.wrap(x, y);
        if (this.world.isFree(pos.x, pos.y)) {
          this.createOrganism(pos.x, pos.y);
        }
      }
      break;
    }

    case 'viral_attack': {
      // Identifie le composant le plus répandu et tue 60% de ses porteurs
      const entities = this.entityManager.getEntitiesWithComponents(['Metabolism']);
      const counts   = {};
      for (const id of entities) {
        for (const comp of C11Engine.TRACKED_COMPONENTS) {
          if (this.entityManager.hasComponent(id, comp)) {
            counts[comp] = (counts[comp] ?? 0) + 1;
          }
        }
      }
      const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
      if (dominant) {
        for (const id of entities) {
          if (this.entityManager.hasComponent(id, dominant) && Math.random() < 0.60) {
            const meta = this.entityManager.getComponent(id, 'Metabolism');
            if (meta) meta.alive = false;
          }
        }
      }
      break;
    }

    default: break;
  }
}
}