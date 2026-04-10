/**
 * BiomeWorld — Moteur écosystémique Evo12
 *
 * Gère 8 biomes indépendants avec leurs populations NPC.
 * Pas de grille spatiale : les populations sont des scalaires.
 * Les systèmes de prédation suivent un modèle Lotka-Volterra simplifié.
 * Les événements modifient les populations et les modificateurs de survie.
 */

import { BIOME_ORDER } from '../data/biomes';
import { SPECIES_BY_BIOME } from '../data/species';
import { EVENTS } from '../data/events';

export class BiomeWorld {
  constructor() {
    this.tick = 0;
    this.biomes = {};       // biomeId -> BiomeState
    this.activeEvents = []; // liste des événements en cours
    this.eventHistory = []; // événements terminés (pour l'UI)

    this._init();
  }

  // ── Initialisation ──────────────────────────────────────────────────────────

  _init() {
    for (const biomeId of BIOME_ORDER) {
      const speciesConfig = SPECIES_BY_BIOME[biomeId] || [];
      const species = {};
      for (const sp of speciesConfig) {
        species[sp.id] = {
          id: sp.id,
          name: sp.name,
          emoji: sp.emoji,
          biome: sp.biome,
          role: sp.role,
          behavior: sp.behavior,
          color: sp.color,
          minPop: sp.minPop,
          maxPop: sp.maxPop,
          resilience: sp.resilience,
          population: sp.initialPop,
          extinct: false,
        };
      }
      this.biomes[biomeId] = {
        id: biomeId,
        species,
        playerPopulation: 0,
        // Multiplicateur de pression sur le joueur (1 = normal, >1 = hostile)
        hostilityMod: 1.0,
      };
    }
  }

  reset() {
    this.tick = 0;
    this.activeEvents = [];
    this.eventHistory = [];
    this._init();
  }

  // ── Boucle principale ───────────────────────────────────────────────────────

  /**
   * @param {string[]} playerGenes - gènes débloqués du joueur (pour interactions futures)
   * @param {string}   currentBiome - biome actif du joueur
   */
  /**
   * @param {string[]} playerGenes  - gènes joueur (pour interactions futures)
   * @param {string}   activeBiomeId - biome actif, géré par EntityManager dans Engine → on le saute
   */
  update(playerGenes = [], activeBiomeId = 'ocean') {
    this.tick++;
    this._simulateEcosystems(activeBiomeId);
    this._decayEvents();

    // Tentative de spawn d'événement toutes les ~200 ticks (~30% de chance) - on laisse en commentaire le temps de debugger
    // if (this.tick % 200 === 0 && Math.random() < 0.3) {
    //   this._spawnRandomEvent();
    // }
  }

  // ── Simulation NPC ──────────────────────────────────────────────────────────

  _simulateEcosystems(activeBiomeId) {
    for (const [biomeId, biome] of Object.entries(this.biomes)) {
      // Le biome actif est simulé via les entités dans Engine — ne pas l'écraser ici
      if (biomeId === activeBiomeId) continue;
      this._simulateBiome(biome);
    }
  }

  _simulateBiome(biome) {
    const alive = Object.values(biome.species).filter(s => !s.extinct);

    const totalPrey = alive
      .filter(s => s.role === 'herbivore')
      .reduce((sum, s) => sum + s.population, 0);

    const totalPredators = alive
      .filter(s => s.role === 'predator' || s.role === 'apex')
      .reduce((sum, s) => sum + s.population, 0);

    for (const sp of alive) {
      let delta = 0;

      if (sp.role === 'prey' || sp.role === 'herbivore') {
        // Croissance logistique — freinée par les prédateurs
        delta = 0.02 * sp.population * (1 - sp.population / sp.maxPop);
        if (totalPredators > 0) {
          delta -= 0.01 * sp.population * (totalPredators / 20);
        }
      } else if (sp.role === 'predator') {
        // Dépend des proies disponibles
        delta = totalPrey > 0
          ? 0.01 * sp.population * (totalPrey / 50) - 0.005 * sp.population
          : -0.02 * sp.population;
      } else if (sp.role === 'apex') {
        delta = totalPrey > 0
          ? 0.008 * sp.population * (totalPrey / 40) - 0.008 * sp.population
          : -0.015 * sp.population;
      } else if (sp.role === 'omnivore') {
        // Flexible — croissance modérée indépendante
        delta = 0.005 * sp.population * (1 - sp.population / sp.maxPop);
      }

      sp.population = Math.max(0, Math.min(sp.maxPop, sp.population + delta));

      if (sp.population < sp.minPop) {
        sp.population = 0;
        sp.extinct = true;
      }
    }
  }

  // ── Événements ──────────────────────────────────────────────────────────────

  _spawnRandomEvent() {
    const eventIds = Object.keys(EVENTS);
    const eventId = eventIds[Math.floor(Math.random() * eventIds.length)];
    const def = EVENTS[eventId];

    const biomeId = def.biomes === 'any'
      ? BIOME_ORDER[Math.floor(Math.random() * BIOME_ORDER.length)]
      : def.biomes[Math.floor(Math.random() * def.biomes.length)];

    this._applyEvent(eventId, biomeId);
  }

  /**
   * Déclenche un événement dans un biome (appelable par l'Engine ou en interne).
   * @returns {object} l'événement instancié
   */
  triggerEvent(eventId, biomeId) {
    return this._applyEvent(eventId, biomeId);
  }

  _applyEvent(eventId, biomeId) {
    const def = EVENTS[eventId];
    if (!def) return null;

    const biome = this.biomes[biomeId];
    if (!biome) return null;

    const event = {
      ...def,
      targetBiome: biomeId,
      remainingTicks: def.duration,
      startedAt: this.tick,
    };

    this.activeEvents.push(event);

    // Impact immédiat sur les populations NPC
    switch (def.effect) {
      case 'extinction_partielle':
        for (const sp of Object.values(biome.species)) {
          if (!sp.extinct) {
            sp.population *= (1 - def.severity * (1 - sp.resilience));
          }
        }
        biome.hostilityMod = Math.min(2.0, biome.hostilityMod + def.severity * 0.5);
        break;

      case 'herbivore_collapse':
        for (const sp of Object.values(biome.species)) {
          if (!sp.extinct && (sp.role === 'herbivore')) {
            sp.population *= (1 - def.severity);
          }
        }
        break;

      case 'species_collapse': {
        const candidates = Object.values(biome.species).filter(s => !s.extinct);
        if (candidates.length > 0) {
          const target = candidates[Math.floor(Math.random() * candidates.length)];
          target.population *= (1 - def.severity);
        }
        break;
      }

      case 'hostile_biomes':
        biome.hostilityMod = Math.min(2.0, biome.hostilityMod + def.severity);
        break;

      case 'new_predator':
        // Augmente la pression prédatrice sans ajouter d'espèce concrète
        biome.hostilityMod = Math.min(2.5, biome.hostilityMod + def.severity * 0.8);
        break;

      case 'invasion':
        for (const sp of Object.values(biome.species)) {
          if (!sp.extinct && sp.role !== 'apex') {
            sp.population *= (1 - def.severity * 0.5);
          }
        }
        break;
    }

    return event;
  }

  _decayEvents() {
    this.activeEvents = this.activeEvents.filter(ev => {
      ev.remainingTicks--;
      if (ev.remainingTicks <= 0) {
        // Fin d'événement : restaurer le modificateur d'hostilité progressivement
        if (ev.targetBiome && this.biomes[ev.targetBiome]) {
          const biome = this.biomes[ev.targetBiome];
          biome.hostilityMod = Math.max(1.0, biome.hostilityMod - 0.3);
        }
        this.eventHistory.push({ ...ev, endedAt: this.tick });
        return false;
      }
      return true;
    });
  }

  // ── Snapshots pour React ─────────────────────────────────────────────────────

  getSnapshot() {
    const snap = {};
    for (const [biomeId, biome] of Object.entries(this.biomes)) {
      snap[biomeId] = {
        id: biomeId,
        playerPopulation: biome.playerPopulation,
        hostilityMod: biome.hostilityMod,
        activeEvent: this.activeEvents.find(e => e.targetBiome === biomeId) || null,
        species: Object.fromEntries(
          Object.entries(biome.species).map(([id, sp]) => [id, {
            id: sp.id,
            name: sp.name,
            emoji: sp.emoji,
            role: sp.role,
            color: sp.color,
            population: Math.round(sp.population),
            extinct: sp.extinct,
          }])
        ),
      };
    }
    return snap;
  }

  /**
   * Espèce la plus nombreuse dans un biome (pour la mini-map).
   */
  getDominantSpecies(biomeId) {
    const biome = this.biomes[biomeId];
    if (!biome) return null;
    let max = 0, dominant = null;
    for (const sp of Object.values(biome.species)) {
      if (!sp.extinct && sp.population > max) {
        max = sp.population;
        dominant = sp;
      }
    }
    return dominant;
  }
}
