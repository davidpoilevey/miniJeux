import Age        from "../../b13/ecs/components/Age";
import Position   from "../../b13/ecs/components/Position";
import Species    from "../../b13/ecs/components/Species";
import EntityManager from "../../b13/ecs/EntityManager";
import { TERRAIN_RESOURCES, pickWeighted } from "./resourceData";
import Group      from "./components/Group";
import Inhabitant from "./components/Inhabitant";
import Inventory  from "./components/Inventory";
import Needs      from "./components/Needs";
import State      from "./components/State";
import Village    from "./components/Village";
import CommunityDecisionSystem from "./systems/CommunityDecisionSystem";
import DecisionSystem          from "./systems/DecisionSystem";
import GatherSystem            from "./systems/GatherSystem";
import MovementSystem          from "./systems/MovementSystem";
import NeedsDecaySystem        from "./systems/NeedsDecaySystem";
import ReproductionSystem      from "./systems/ReproductionSystem";
import ShopSystem              from "./systems/ShopSystem";
import SocialSystem            from "./systems/SocialSystem";

import { VILLAGES, VILLAGE_BY_NAME } from './data/villageData.js';

// Délais en ms selon vitesse 1/2/3
const SPEED_DELAY = [800, 200, 80];
const WATER_TERRAINS     = new Set(['eau', 'neige']);
const VILLAGE_TERRAINS   = new Set(['plaine', 'foret']);

// Cellule infranchissable à pied (eau, glace, rivière)
const cellIsWet = (cell) => !cell || WATER_TERRAINS.has(cell.terrainType) || !!cell.isRiver;
const VILLAGE_COUNT      = 6;
const MIN_VILLAGE_DIST   = 50; // distance de Manhattan entre villages
const INHABITANTS_MIN    = 6;
const INHABITANTS_MAX    = 10;

const SAVE_KEY   = 'worldbox_autosave';
const SAVE_EVERY = 50; // ticks

export default class WBEngine {
  // savedState : objet retourné par getSaveData(), ou null pour un nouveau monde
  constructor(grid, seaLevel, onTick, savedState = null) {
    this.grid       = grid;
    this.seaLevel   = seaLevel;
    this.onTick     = onTick;
    this._speed     = 1;
    this._timer     = null;

    this.systems = [
      new NeedsDecaySystem(),
      new CommunityDecisionSystem(),
      new GatherSystem(),
      new DecisionSystem(),
      new MovementSystem(),
      new SocialSystem(),        // après MovementSystem : positions à jour
      new ReproductionSystem(),  // après Social : needs.social fraîchement mis à jour
      new ShopSystem(),          // après tout : inventaire mis à jour en dernier
    ];

    this._births            = 0;
    this._deaths            = 0;
    this._deathCauses       = {};
    this._populationHistory = []; // [{ tick, [villageName]: pop }]
    this._battleEffects     = []; // [{ x, y, tick, type }]

    if (savedState) {
      this._tickCount   = savedState.tick ?? 0;
      this._births      = savedState.births ?? 0;
      this._deaths      = savedState.deaths ?? 0;
      this._deathCauses = savedState.deathCauses ?? {};
      this.em = EntityManager.fromSave(savedState.em);
    } else {
      this._tickCount = 0;
      this.em = new EntityManager();
      this._seedRessources();
      this._seedMineraux();
      this._seedVillages();
    }
  }

  // ── Seeding plantes ──────────────────────────────────────────

  _seedRessources() {
    for (let y = 0; y < this.grid.rows; y++) {
      for (let x = 0; x < this.grid.cols; x++) {
        const cell = this.grid.getCell(x, y);
        if (cellIsWet(cell)) continue;
        if (cell.fertility < 15) continue;
        if (Math.random() < (cell.fertility / 10000))
          this._spawnPlant(x, y, cell.terrainType);
      }
    }
  }

  // ── Seeding minéraux ─────────────────────────────────────────

  _seedMineraux() {
    for (let y = 0; y < this.grid.rows; y++) {
      for (let x = 0; x < this.grid.cols; x++) {
        const cell = this.grid.getCell(x, y);
        if (cell.terrainType==='eau') continue;
        const config = TERRAIN_RESOURCES[cell.terrainType];
        if (!config) continue;
        for (const { type, prob } of config.minerals) {
          if (Math.random() < prob) this._spawnMineral(x, y, type);
        }
      }
    }
  }

  // ── Seeding villages ─────────────────────────────────────────

  _seedVillages() {
    // Cellules candidates (terrains habitables, loin des bords)
    const margin = 5;
    const candidates = [];
    for (let y = margin; y < this.grid.rows - margin; y++) {
      for (let x = margin; x < this.grid.cols - margin; x++) {
        const cell = this.grid.getCell(x, y);
        if (cell && VILLAGE_TERRAINS.has(cell.terrainType) && !cell.isRiver) candidates.push(cell);
      }
    }

    // Tirage aléatoire + espacement minimum
    const shuffled = candidates.sort(() => Math.random() - 0.5);
    const centers  = [];
    for (const cell of shuffled) {
      if (centers.length >= VILLAGE_COUNT) break;
      const tooClose = centers.some(c =>
        Math.abs(c.x - cell.x) + Math.abs(c.y - cell.y) < MIN_VILLAGE_DIST
      );
      if (!tooClose) centers.push(cell);
    }

    for (let gid = 0; gid < centers.length; gid++) {
      const center = centers[gid];
      const vConfig = VILLAGES[gid];

      // Entité Village (centre du groupe, stockpile, plan)
      const vid = this.em.createEntity();
      this.em.addComponent(vid, 'Position', Position(center.x, center.y));
      this.em.addComponent(vid, 'Species',  Species('village'));
      this.em.addComponent(vid, 'Village',  Village(vConfig.name, vConfig.color, vConfig.bonus));

      const count   = INHABITANTS_MIN + Math.floor(Math.random() * (INHABITANTS_MAX - INHABITANTS_MIN + 1));
      const members = [];

      for (let i = 0; i < count; i++) {
        const ox = Math.floor((Math.random() - 0.5) * 8);
        const oy = Math.floor((Math.random() - 0.5) * 8);
        const cx = Math.max(0, Math.min(this.grid.cols - 1, center.x + ox));
        const cy = Math.max(0, Math.min(this.grid.rows - 1, center.y + oy));
        const cell = this.grid.getCell(cx, cy);
        if (cellIsWet(cell)) continue;
        members.push(this._spawnInhabitant(cx, cy, vConfig.name));
      }

      // Le membre le plus intelligent devient chef
      if (members.length > 0) {
        const chief = members.reduce((best, id) => {
          const sb = this.em.getComponent(best, 'Stats');
          const sc = this.em.getComponent(id,   'Stats');
          return sc.intelligence > sb.intelligence ? id : best;
        });
        const g = this.em.getComponent(chief, 'Group');
        this.em.addComponent(chief, 'Group', { ...g, role: 'chief' });
      }
    }
  }

  // ── Spawn ────────────────────────────────────────────────────

  _spawnPlant(x, y, terrainType) {
    const plantType = pickWeighted(TERRAIN_RESOURCES[terrainType]?.plants);
    if (!plantType) return null;
    const id = this.em.createEntity();
    this.em.addComponent(id, 'Position', Position(x, y));
    this.em.addComponent(id, 'Species',  Species('plant'));
    this.em.addComponent(id, 'Resource', { type: plantType, reserve: 20, maxReserve: 20 });
    this.em.addComponent(id, 'Age',      Age(0, Math.floor(Math.random() * 30) + 10));
    return id;
  }

  _spawnMineral(x, y, mineralType) {
    const id = this.em.createEntity();
    this.em.addComponent(id, 'Position', Position(x, y));
    this.em.addComponent(id, 'Species',  Species('mineral'));
    this.em.addComponent(id, 'Resource', { type: mineralType, reserve: 10, maxReserve: 10 });
    return id;
  }

  // statsOverride : traits hérités des parents (optionnel)
  // maxAge        : espérance de vie héritée (optionnel)
  _spawnInhabitant(x, y, groupId = 0, statsOverride = {}, maxAge = null, trackBirth = false) {
    if (trackBirth) this._births++;

    // Applique le bonus de stats du village (culture/entraînement)
    const vBonus    = VILLAGE_BY_NAME[groupId]?.bonus;
    const statBonus = vBonus?.type === 'stats' ? (vBonus.stats ?? {}) : {};
    const rand      = () => Math.floor(Math.random() * 80) + 10;
    const boosted   = (key) => {
      const base = statsOverride[key] ?? rand();
      return Math.min(100, base + (statBonus[key] ?? 0));
    };
    const computedStats = {
      force:        boosted('force'),
      intelligence: boosted('intelligence'),
      charme:       boosted('charme'),
      perception:   boosted('perception'),
    };

    const randomRole = `human${Math.floor(Math.random() * 13) + 1}`;
    const id = this.em.createEntity();
    this.em.addComponent(id, 'Position',   Position(x, y));
    this.em.addComponent(id, 'Species',    Species('human'));
    this.em.addComponent(id, 'Inhabitant', Inhabitant());
    this.em.addComponent(id, 'Stats',      computedStats);
    this.em.addComponent(id, 'Needs',      Needs());
    this.em.addComponent(id, 'State',      State());
    this.em.addComponent(id, 'Group',      Group(groupId, randomRole));
    this.em.addComponent(id, 'Inventory',  Inventory());
    this.em.addComponent(id, 'Age',        Age(0, maxAge ?? (50 + Math.floor(Math.random() * 50))));
    return id;
  }

  // ── Tick ─────────────────────────────────────────────────────

  tick() {
    this._tickCount++;
    const ctx = {
      grid:            this.grid,
      em:              this.em,
      seaLevel:        this.seaLevel,
      spawnPlant:      (x, y, t) => this._spawnPlant(x, y, t),
      spawnMineral:    (x, y, t) => this._spawnMineral(x, y, t),
      spawnInhabitant: (x, y, g, so, ma) => this._spawnInhabitant(x, y, g, so, ma, true),
      addBattleEffect: (x, y, type = 'battle') => {
        this._battleEffects.push({ x, y, tick: this._tickCount, type });
        // Limite à 50 effets simultanés
        if (this._battleEffects.length > 50) this._battleEffects.shift();
      },
      onDeath: (cause = 'inconnu') => {
        this._deaths++;
        this._deathCauses[cause] = (this._deathCauses[cause] ?? 0) + 1;
      },
    };
    for (const system of this.systems) system.update(ctx);

    // Nettoyage des effets de combat expirés (> 8 ticks)
    this._battleEffects = this._battleEffects.filter(e => this._tickCount - e.tick <= 8);

    // Snapshot population toutes les 10 ticks (max 300 points)
    if (this._tickCount % 10 === 0) {
      const point = { tick: this._tickCount };
      for (const vid of this.em.query('Village')) {
        const v   = this.em.getComponent(vid, 'Village');
        const pop = this.em.query('Inhabitant', 'Group')
          .filter(id => this.em.getComponent(id, 'Group').groupId === v.groupId).length;
        point[v.groupId] = pop;
      }
      this._populationHistory.push(point);
      if (this._populationHistory.length > 300) this._populationHistory.shift();
    }

    if (this._tickCount % SAVE_EVERY === 0) this._autoSave();
    this.onTick?.();
  }

  // ── Sauvegarde ───────────────────────────────────────────────

  _autoSave() {
    if (!this._seed) return; // seed injectée par WBContext
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.getSaveData()));
    } catch (e) { /* quota dépassé ou SSR */ }
  }

  getSaveData() {
    return { version: 1, tick: this._tickCount, seed: this._seed, seaLevel: this.seaLevel,
             births: this._births, deaths: this._deaths,
             deathCauses: this._deathCauses, em: this.em.toSave() };
  }

  static hasSave()   { return !!localStorage.getItem(SAVE_KEY); }
  static readSave()  { try { return JSON.parse(localStorage.getItem(SAVE_KEY)); } catch { return null; } }
  static clearSave() { localStorage.removeItem(SAVE_KEY); }

  // ── Contrôles ────────────────────────────────────────────────

  start() {
    if (this._timer) return;
    const delay = SPEED_DELAY[this._speed - 1] ?? 400;
    this._timer = setInterval(() => this.tick(), delay);
  }

  stop() {
    clearInterval(this._timer);
    this._timer = null;
  }

  setSpeed(speed) {
    this._speed = speed;
    if (this._timer) { this.stop(); this.start(); }
  }

  setSeaLevel(sl) { 
    this.seaLevel = sl;
   }

  get isRunning() { return this._timer !== null; }
}
