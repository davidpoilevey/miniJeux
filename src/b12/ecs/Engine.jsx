/**
 * E12Engine — Orchestrateur principal d'Evo12
 *
 * Réutilisé de b9 (générique) :
 *   - EntityManager : gestion des entités individuelles du biome actif
 *   - Position      : coordonnées de chaque individu (lu par WorldRenderer)
 *
 * Propre à b12 :
 *   - BiomeWorld    : simulation des 7 biomes en arrière-plan (Lotka-Volterra)
 *   - SpeciesComp / Stats : composants des entités individuelles
 *   - playerSpecies : état agrégé de l'espèce joueur
 *
 * Principe "entités = source de vérité" :
 *   - Le biome actif est simulé via entités (EntityManager)
 *   - Avant tout switch de biome : _syncActiveToWorld() lit entités → BiomeWorld
 *   - Après switch : _activateBiome() relit BiomeWorld → crée les entités
 *   - Les 7 autres biomes tournent en compteurs scalaires dans BiomeWorld
 */

import { EntityManager }   from '../../b9/engine/EntityManager';
import { Genome, Position }        from '../../b9/engine/components/Components';
import { BiomeWorld }      from './World';
import { SpeciesComp }     from './components/Species';
import { Stats }           from './components/Stats';
import { Decision }        from './components/Decision';
import { FoodSource }      from './components/FoodSource';
import { DecisionSystem }      from './systems/DecisionSystem';
import { MovementSystem }      from './systems/MovementSystem';
import { ReproductionSystem }  from './systems/ReproductionSystem';
import { GENES }           from '../data/genes';
import { BIOMES, BIOME_ORDER } from '../data/biomes';
import { SPECIES }         from '../data/species';
import { ADNHandler, randomGenome, mutationADN, recombinaisonGenetique } from '../../genetic/ADNPlante';

// Nombre de patches végétaux par biome actif
const FOOD_SOURCE_COUNT = 8;

// ── Dimensions du monde (pixels — utilisées par WorldRenderer) ────────────────
export const WORLD_W = 800;
export const WORLD_H = 600;

// ── État initial joueur ───────────────────────────────────────────────────────

const INITIAL_PLAYER = {
  name: 'Poisson filtreur',
  population: 8,
  currentBiome: 'ocean',
  biomesUnlocked: ['ocean', 'marecage'],
  dominatedBiomes: [],
  genes: [],
  evolutionPoints: 200,
  score: 0,
  age: 0,
};

const MILESTONE_REWARDS = {
  newBiome:        50,
  pop50:           25,
  pop200:          50,
  npcExtinct:      100,
  biomeDomination: 150,
};

const TIME_MILESTONE_INTERVAL = 3600; // ~60s à 60fps

// ── Moteur ────────────────────────────────────────────────────────────────────

export class E12Engine {
  constructor() {
    this.entityManager  = new EntityManager();
    this.world          = new BiomeWorld();
    this.decisionSystem     = new DecisionSystem(this.entityManager, WORLD_W, WORLD_H);
    this.movementSystem     = new MovementSystem(this.entityManager, WORLD_W, WORLD_H);
    this.reproductionSystem = new ReproductionSystem(this.entityManager);

    this.reproductionSystem.setSpawnCallback((parentSp, parentPos, genes, parentId, partnerId) => {
      const parentGenome = parentId != null ? this.entityManager.getComponent(parentId, 'Genome') : null;
      const partnerGenome = partnerId != null ? this.entityManager.getComponent(partnerId, 'Genome') : null;
      let childAdn = null;
      if(partnerGenome){
        
          const [childADN, unusedADN] = recombinaisonGenetique(
          parentGenome.handler.adn,
          partnerGenome.handler.adn
        );
        childAdn=childADN;
      }
      else
        childAdn     = parentGenome ? mutationADN(parentGenome.adn) : randomGenome();

      const entityId = parentSp.isPlayer
        ? this._spawnPlayerEntity(childAdn)
        : this._spawnNpcEntityById(parentSp.speciesId, childAdn);
      if (entityId == null) return;

      // Modificateurs génétiques sur le descendant (joueur uniquement)
      if (parentSp.isPlayer) {
        const stats = this.entityManager.getComponent(entityId, 'Stats');
        if (genes.has('vivipare'))        stats.energy += 30;
        if (genes.has('soins_parentaux')) stats.maxAge  += 100;
        this.player.evolutionPoints++;
        this.player.score++;
      }

      // Positionner près du parent
      const pos = this.entityManager.getComponent(entityId, 'Position');
      pos.x = Math.max(0, Math.min(WORLD_W, parentPos.x + (Math.random() - 0.5) * 30));
      pos.y = Math.max(0, Math.min(WORLD_H, parentPos.y + (Math.random() - 0.5) * 30));
    });

    this.player        = { ...INITIAL_PLAYER, genes: [], biomesUnlocked: [...INITIAL_PLAYER.biomesUnlocked] };
    this.activeBiomeId = 'ocean';
    this.running       = false;
    this.tickCount     = 0;
    this.lastTickTime  = 0;

    this.stats               = { tickCount: 0, population: 0, score: 0, evolutionPoints: INITIAL_PLAYER.evolutionPoints };
    this.log                 = [];
    this.milestones          = new Set();
    this._foodSpawnCooldowns = new Map(); // speciesId → tickCount du dernier spawn
  }

  // ── Cycle de vie ─────────────────────────────────────────────────────────────

  initialize() {
    this.reset();
  }

  reset() {
    this.entityManager.clear();
    this.world.reset();
    this.player = {
      ...INITIAL_PLAYER,
      genes: [],
      biomesUnlocked:  [...INITIAL_PLAYER.biomesUnlocked],
      dominatedBiomes: [],
    };
    this.activeBiomeId = 'ocean';
    this.running       = false;
    this.tickCount     = 0;
    this.lastTickTime  = 0;
    this.stats               = { tickCount: 0, population: 0, score: 0, evolutionPoints: INITIAL_PLAYER.evolutionPoints };
    this.log                 = [];
    this.milestones          = new Set();
    this._foodSpawnCooldowns = new Map();

    this._activateBiome('ocean');
  }

  start()       { this.running = true; }
  pause()       { this.running = false; }
  togglePause() { this.running = !this.running; }

  // ── Boucle principale ─────────────────────────────────────────────────────

  tick() {
    if (!this.running) return;

    this.tickCount++;
    this.player.age++;

    // 1. Biome actif — simulation via entités
    this._simulateActive();

    // 2. Entités → BiomeWorld (SoT)
    this._syncActiveToWorld();

    // 3. Biomes arrière-plan (activeBiomeId exclu dans BiomeWorld.update)
    this.world.update(this.player.genes, this.activeBiomeId);

    // 4. Palier de temps
    if (this.tickCount % TIME_MILESTONE_INTERVAL === 0) {
      this._awardPoints(10, 'Résilience — palier de temps atteint');
    }

    // 5. Jalons
    this._checkPopMilestones();
    this._checkNpcExtinctions();
    this._checkBiomeDomination();

    // 6. Game over
    if (this.player.population <= 0) {
      this.running = false;
      this._log('💀 Extinction — votre espèce a disparu de la Terre', 'extinction');
    }

    this._updateStats();
  }

  // ── Gestion du biome actif ────────────────────────────────────────────────

  /**
   * Active un biome : lit BiomeWorld → spawn les entités individuelles.
   * Appelé à l'init et à chaque migration (après _syncActiveToWorld).
   */
  _activateBiome(biomeId) {
    this.entityManager.clear();
    this.activeBiomeId = biomeId;

    const biome = this.world.biomes[biomeId];
    if (!biome) return;

    // Entités NPC
    for (const sp of Object.values(biome.species)) {
      if (sp.extinct) continue;
      const count = Math.round(sp.population);
      const adn = randomGenome(); 
      for (let i = 0; i < count; i++) this._spawnNpcEntity(sp, adn);
    }

    // Entités joueur
    const playerCount = Math.round(this.player.population);
      const adn = randomGenome(); 
    for (let i = 0; i < playerCount; i++) this._spawnPlayerEntity(adn);

    // Patches de végétation (nourriture des bas de chaîne)
    for (let i = 0; i < FOOD_SOURCE_COUNT; i++) this._spawnFoodSource();
  }

  /**
   * Lit les entités → met à jour BiomeWorld et player.population.
   * Appelé après chaque simulation ET avant tout switch de biome.
   * Les entités l'emportent toujours sur les scalaires.
   */
  _syncActiveToWorld() {
    const biome = this.world.biomes[this.activeBiomeId];
    if (!biome) return;

    const entities = this.entityManager.getEntitiesWithComponents(['Species']);

    const counts = {};
    let playerCount = 0;

    for (const entityId of entities) {
      const sp = this.entityManager.getComponent(entityId, 'Species');
      if (sp.isPlayer) {
        playerCount++;
      } else {
        counts[sp.speciesId] = (counts[sp.speciesId] || 0) + 1;
      }
    }

    // NPC : entités → BiomeWorld
    for (const sp of Object.values(biome.species)) {
      const count = counts[sp.id] ?? 0;
      sp.population = count;
      sp.extinct    = count < sp.minPop;
    }

    // Joueur
    this.player.population  = playerCount;
    biome.playerPopulation  = playerCount;
  }

  // ── Simulation biome actif ────────────────────────────────────────────────

  /**
   * Simulation émergente : chaque entité prend ses décisions et agit.
   * Naissances et morts sont des conséquences directes du comportement individuel —
   * plus de taux scalaires, plus de Lotka-Volterra injecté sur entités.
   */
  _simulateActive() {
    const genes = new Set(this.player.genes);
    const playerBonuses = {
      energyBonus:          this._getPlayerEnergyBonus(genes),
      speedBonus:           this._getPlayerSpeedBonus(genes),
      predationBonus:       this._getPlayerPredationBonus(genes),
      defenseBonus:         this._getPlayerDefenseBonus(genes),
      energyDrainReduction: this._getPlayerEnergyDrainReduction(genes),
    };

    // 1. Décisions — chaque entité choisit sa cible (flee > faim > reproduction > errance)
    this.decisionSystem.update(genes);

    // 2. Mouvement + consommation (eat / hunt)
    this.movementSystem.update(genes, playerBonuses);

    // 3. Reproduction — paires en contact mutuel avec intent='mate'
    this.reproductionSystem.update(genes);

    // 4. Vieillissement — mort naturelle de toutes les espèces
    for (const entityId of this.entityManager.getEntitiesWithComponents(['Stats'])) {
      const stats = this.entityManager.getComponent(entityId, 'Stats');
      stats.age++;
      if (stats.age >= stats.maxAge) this.entityManager.destroyEntity(entityId);
    }

    // 5. Régulation : FoodSource bonus si herbivores en danger
    this._regulateHerbivoreDensity();
  }

  /**
   * Si une espèce herbivore est sous son minPop, spawn 1 FoodSource supplémentaire
   * pour lui donner une chance de se relancer.
   * Cooldown de 60 ticks par espèce pour éviter le spam.
   */
  _regulateHerbivoreDensity() {
    // Comptage par espèce
    const counts = {};
    for (const entityId of this.entityManager.getEntitiesWithComponents(['Species'])) {
      const sp = this.entityManager.getComponent(entityId, 'Species');
      if (!sp.isPlayer) counts[sp.speciesId] = (counts[sp.speciesId] ?? 0) + 1;
    }

    for (const [speciesId, count] of Object.entries(counts)) {
      const spConfig = SPECIES[speciesId];
      if (!spConfig || spConfig.role !== 'herbivore') continue;
      if (count >= spConfig.minPop) continue;

      const lastSpawn = this._foodSpawnCooldowns.get(speciesId) ?? 0;
      if (this.tickCount - lastSpawn < 60) continue;

      this._spawnFoodSource();
      this._foodSpawnCooldowns.set(speciesId, this.tickCount);
    }
  }

  // ── Spawn ─────────────────────────────────────────────────────────────────

  _spawnPlayerEntity(adn) {
    const entityId = this.entityManager.createEntity();
    this.entityManager.addComponent(entityId, 'Position', new Position(
      Math.random() * WORLD_W, Math.random() * WORLD_H,
    ));
    const role = this._getPlayerRole(this.player.genes);
    this.entityManager.addComponent(entityId, 'Species', new SpeciesComp(
      'player', true, role, 'swarm',
    ));
     const handler = new ADNHandler(adn);
    this.entityManager.addComponent(entityId, 'Genome', new Genome(adn, handler));
   
    this.entityManager.addComponent(entityId, 'Stats', new Stats({ role }));
    this.entityManager.addComponent(entityId, 'Decision', new Decision());
    return entityId;
  }

  _spawnFoodSource() {
    const entityId = this.entityManager.createEntity();
    this.entityManager.addComponent(entityId, 'Position', new Position(
      Math.random() * WORLD_W, Math.random() * WORLD_H,
    ));
    this.entityManager.addComponent(entityId, 'FoodSource', new FoodSource());
    return entityId;
  }

  _spawnNpcEntity(sp, adn) {
    const entityId = this.entityManager.createEntity();
    this.entityManager.addComponent(entityId, 'Position', new Position(
      Math.random() * WORLD_W, Math.random() * WORLD_H,
    ));
    this.entityManager.addComponent(entityId, 'Species', new SpeciesComp(
      sp.id, false, sp.role, sp.behavior,
    ));

    const handler = new ADNHandler(adn);
    this.entityManager.addComponent(entityId, 'Genome', new Genome(adn, handler));
    this.entityManager.addComponent(entityId, 'Stats', new Stats({ role: sp.role }));
    this.entityManager.addComponent(entityId, 'Decision', new Decision());
    return entityId;
  }

  _spawnNpcEntityById(speciesId, adn) {
    const sp = SPECIES[speciesId];
    if (!sp) return null;
    return this._spawnNpcEntity(sp, adn ?? randomGenome());
  }

  // ── Jalons ────────────────────────────────────────────────────────────────

  _checkPopMilestones() {
    const pop = this.player.population;
    if (pop >= 50 && !this.milestones.has('pop50')) {
      this.milestones.add('pop50');
      this._awardPoints(MILESTONE_REWARDS.pop50, '🏆 Population dépasse 50 individus');
    }
    if (pop >= 200 && !this.milestones.has('pop200')) {
      this.milestones.add('pop200');
      this._awardPoints(MILESTONE_REWARDS.pop200, '🏆 Population dépasse 200 individus');
    }
  }

  _checkNpcExtinctions() {
    const biome = this.world.biomes[this.activeBiomeId];
    if (!biome) return;
    for (const sp of Object.values(biome.species)) {
      const key = `extinct_${sp.id}`;
      if (sp.extinct && !this.milestones.has(key)) {
        this.milestones.add(key);
        this._awardPoints(MILESTONE_REWARDS.npcExtinct, `🏆 Espèce éliminée : ${sp.name}`);
      }
    }
  }

  _checkBiomeDomination() {
    if (this.player.dominatedBiomes.includes(this.activeBiomeId)) return;
    if (this.player.population < 10) return;

    // Domination = player pop > somme de toutes les populations NPC
    let npcTotal = 0;
    for (const entityId of this.entityManager.getEntitiesWithComponents(['Species'])) {
      const sp = this.entityManager.getComponent(entityId, 'Species');
      if (!sp.isPlayer) npcTotal++;
    }
    if (this.player.population <= npcTotal) return;

    const biome = BIOMES[this.activeBiomeId];
    this.player.dominatedBiomes.push(this.activeBiomeId);
    this._awardPoints(MILESTONE_REWARDS.biomeDomination, `👑 Biome dominé : ${biome?.name ?? this.activeBiomeId}`);

    // Cherche le prochain biome accessible non-dominé
    const dominatedSet = new Set(this.player.dominatedBiomes);
    const next = BIOME_ORDER.find(id => {
      if (id === this.activeBiomeId) return false;
      if (!this.player.biomesUnlocked.includes(id)) return false;
      if (dominatedSet.has(id)) return false;
      const cfg = BIOMES[id];
      return !cfg?.access.some(req => !this.player.genes.includes(req));
    });

    if (next) {
      this._log(`👑 ${biome?.name} dominé — migration vers ${BIOMES[next]?.name}`, 'domination');
      this.migrateToBiome(next);
    } else {
      this._log('🌍 Tous les biomes accessibles conquis — victoire !', 'victory');
    }
  }

  _awardPoints(amount, reason) {
    this.player.evolutionPoints += amount;
    this.player.score           += amount;
    this._log(`+${amount} pts — ${reason}`, 'reward');
  }

  _log(message, type = 'info') {
    this.log.unshift({ message, type, tick: this.tickCount });
    if (this.log.length > 30) this.log.pop();
  }

  _updateStats() {
    const now = performance.now();
    if (this.lastTickTime > 0) {
      this.stats.ticksPerSecond = Math.round(1000 / (now - this.lastTickTime));
    }
    this.lastTickTime          = now;
    this.stats.tickCount       = this.tickCount;
    this.stats.population      = Math.round(this.player.population);
    this.stats.score           = this.player.score;
    this.stats.evolutionPoints = this.player.evolutionPoints;
  }

  // ── Helpers gènes joueur ──────────────────────────────────────────────────

  /** Rôle joueur déduit de ses gènes ALIMENTATION (priorité décroissante). */
  _getPlayerRole(genes) {
    const g = genes instanceof Set ? genes : new Set(genes);
    if (g.has('machoire_puissante'))   return 'apex';
    if (g.has('dents_specialisees'))   return 'predator';
    if (g.has('dents_primitives'))     return 'omnivore';
    if (g.has('excroissance_osseuse')) return 'herbivore';
    return 'filtrer';
  }

  /** Somme des energyBonus de tous les gènes actifs. */
  _getPlayerEnergyBonus(genes) {
    let bonus = 0;
    for (const geneId of genes) {
      const eff = GENES[geneId]?.effects?.energyBonus;
      if (eff) bonus += eff;
    }
    return bonus;
  }

  /** Bonus de vitesse selon le biome actif (speedWater en milieu aquatique, speedLand sinon). */
  _getPlayerSpeedBonus(genes) {
    const isAquatic = ['ocean', 'marecage'].includes(this.activeBiomeId);
    let bonus = 0;
    for (const geneId of genes) {
      const eff = GENES[geneId]?.effects;
      if (!eff) continue;
      if (isAquatic  && eff.speedWater) bonus += eff.speedWater;
      if (!isAquatic && eff.speedLand)  bonus += eff.speedLand;
    }
    return bonus;
  }

  /** Bonus de rendement sur la chasse uniquement. */
  _getPlayerPredationBonus(genes) {
    let bonus = 0;
    for (const geneId of genes) {
      const eff = GENES[geneId]?.effects?.predationBonus;
      if (eff) bonus += eff;
    }
    return bonus;
  }

  /** Somme des bonus de défense (réduit les dégâts reçus en combat). */
  _getPlayerDefenseBonus(genes) {
    let bonus = 0;
    for (const geneId of genes) {
      const eff = GENES[geneId]?.effects?.defense;
      if (eff) bonus += eff;
    }
    return bonus;
  }

  /** Réduction du drain énergétique par tick (soustrait au ENERGY_DRAIN de base). */
  _getPlayerEnergyDrainReduction(genes) {
    let reduction = 0;
    for (const geneId of genes) {
      const eff = GENES[geneId]?.effects?.energyDrain;
      if (eff) reduction += eff;
    }
    return reduction;
  }

  /** Met à jour le rôle de toutes les entités joueur existantes. */
  _updatePlayerEntityRoles() {
    const role = this._getPlayerRole(this.player.genes);
    for (const entityId of this.entityManager.getEntitiesWithComponents(['Species'])) {
      const sp = this.entityManager.getComponent(entityId, 'Species');
      if (sp.isPlayer) sp.role = role;
    }
  }

  // ── Commandes joueur ──────────────────────────────────────────────────────

  /** @returns {{ success: boolean, error?: string }} */
  unlockGene(geneId) {
    const gene = GENES[geneId];
    if (!gene)                                   return { success: false, error: 'Gène inconnu' };
    if (this.player.genes.includes(geneId))      return { success: false, error: 'Déjà débloqué' };
    if (this.player.evolutionPoints < gene.cost) return { success: false, error: `Insuffisant (${gene.cost} pts requis)` };

    for (const req of gene.requires) {
      if (!this.player.genes.includes(req)) {
        return { success: false, error: `Prérequis manquant : ${GENES[req]?.name ?? req}` };
      }
    }

    this.player.evolutionPoints -= gene.cost;
    this.player.genes.push(geneId);
    this._updatePlayerEntityRoles();

    for (const biomeId of gene.unlocksBiomes) {
      if (!this.player.biomesUnlocked.includes(biomeId)) {
        this.player.biomesUnlocked.push(biomeId);
        this._log(`🌍 Nouveau biome débloqué : ${BIOMES[biomeId]?.name ?? biomeId}`, 'biome');
      }
    }

    this._log(`🧬 Gène débloqué : ${gene.name}`, 'gene');
    return { success: true };
  }

  /** @returns {{ success: boolean, error?: string }} */
  migrateToBiome(biomeId) {
    if (!this.player.biomesUnlocked.includes(biomeId))
      return { success: false, error: 'Biome non débloqué' };
    if (this.player.currentBiome === biomeId)
      return { success: false, error: 'Déjà dans ce biome' };

    const biomeConfig = BIOMES[biomeId];
    if (biomeConfig) {
      for (const req of biomeConfig.access) {
        if (!this.player.genes.includes(req)) {
          return { success: false, error: `Gène requis : ${GENES[req]?.name ?? req}` };
        }
      }
    }

    // Sauvegarder l'état courant dans BiomeWorld
    this._syncActiveToWorld();
    const prevBiome = this.world.biomes[this.player.currentBiome];
    if (prevBiome) prevBiome.playerPopulation = 0;

    this.player.currentBiome = biomeId;
    this.player.population   = INITIAL_PLAYER.population; // repartir de la population de base

    // Spawner les entités du nouveau biome
    this._activateBiome(biomeId);

    const key = `visited_${biomeId}`;
    if (!this.milestones.has(key)) {
      this.milestones.add(key);
      this._awardPoints(MILESTONE_REWARDS.newBiome, `🗺️ Premier passage : ${biomeConfig?.name ?? biomeId}`);
    }

    this._log(`🚀 Migration vers ${biomeConfig?.name ?? biomeId}`, 'migration');
    return { success: true };
  }

  /** Recommence le biome actif avec la population de base, sans toucher aux gènes ni aux points. */
  restartBiome() {
    this._syncActiveToWorld();
    this.player.population = INITIAL_PLAYER.population;
    this._activateBiome(this.player.currentBiome);
    const name = BIOMES[this.player.currentBiome]?.name ?? this.player.currentBiome;
    this._log(`🔄 Recommencer : ${name}`, 'migration');
    return { success: true };
  }

  /** Vend un gène possédé — remboursement à 50% du coût d'achat.
   *  Bloqué si d'autres gènes possédés en dépendent.
   *  Ne retire pas les biomes débloqués par ce gène.
   */
  sellGene(geneId) {
    const gene = GENES[geneId];
    if (!gene) return { success: false, error: 'Gène inconnu' };
    if (!this.player.genes.includes(geneId)) return { success: false, error: 'Gène non possédé' };

    const dependents = this.player.genes.filter(id => GENES[id]?.requires.includes(geneId));
    if (dependents.length > 0) {
      const names = dependents.map(id => GENES[id]?.name ?? id).join(', ');
      return { success: false, error: `Prérequis de : ${names}` };
    }

    const refund = Math.floor(gene.cost / 2);
    this.player.genes = this.player.genes.filter(id => id !== geneId);
    this.player.evolutionPoints += refund;
    this._updatePlayerEntityRoles();
    this._log(`↩ Gène vendu : ${gene.name} (+${refund} pts)`, 'gene');
    return { success: true, refund };
  }

  applyEvent(type) {
    const event = this.world.triggerEvent(type, this.activeBiomeId);
    if (event) this._log(`⚡ Événement : ${event.name}`, 'event');
  }

  // ── Getters ───────────────────────────────────────────────────────────────

  getWorldSnapshot() { return this.world.getSnapshot(); }
  getPlayerState()   {
    return {
      ...this.player,
      genes:           [...this.player.genes],
      biomesUnlocked:  [...this.player.biomesUnlocked],
      dominatedBiomes: [...this.player.dominatedBiomes],
    };
  }
  getStats()         { return { ...this.stats }; }
  getLog()           { return [...this.log]; }
  getActiveBiomeId() { return this.activeBiomeId; }

  /** Snapshot des entités du biome actif — lu par WorldRenderer. */
  getActiveEntities() {
    const creatures = this.entityManager
      .getEntitiesWithComponents(['Position', 'Species'])
      .map(entityId => ({
        id:      entityId,
        pos:     this.entityManager.getComponent(entityId, 'Position'),
        species: this.entityManager.getComponent(entityId, 'Species'),
        stats:   this.entityManager.getComponent(entityId, 'Stats'),
        isFood:  false,
      }));

    const foods = this.entityManager
      .getEntitiesWithComponents(['Position', 'FoodSource'])
      .map(entityId => {
        const fs = this.entityManager.getComponent(entityId, 'FoodSource');
        return {
          id:           entityId,
          pos:          this.entityManager.getComponent(entityId, 'Position'),
          isFood:       true,
          foodEnergy:   fs.energy,
          foodMaxEnergy: fs.maxEnergy,
        };
      });

    return [...creatures, ...foods];
  }

  getAvailableGenes() {
    return Object.values(GENES).filter(gene =>
      !this.player.genes.includes(gene.id) &&
      gene.requires.every(req => this.player.genes.includes(req))
    );
  }

  getLockedGenes() {
    return Object.values(GENES).filter(gene =>
      !this.player.genes.includes(gene.id) &&
      !gene.requires.every(req => this.player.genes.includes(req))
    );
  }
}
