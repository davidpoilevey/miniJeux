import EntityManager from './EntityManager';
import Position      from './components/Position';
import Age           from './components/Age';
import Species       from './components/Species';
import Genome        from './components/Genome';
import Needs         from './components/Needs';

import PlantGrowthSystem from './systems/PlantGrowthSystem';
import NeedsSystem       from './systems/NeedsSystem';
import PredatorSystem    from './systems/PredatorSystem';
import MovementSystem    from './systems/MovementSystem';
import SeasonSystem      from './systems/SeasonSystem';
import Predator          from './components/Predator';
import { mutationADN, recombinaisonGenetique } from '../../genetic/ADNPlante';

// Délais en ms selon vitesse 1/2/3
const SPEED_DELAY = [800, 200, 80];

export default class Engine {
  constructor(grid, seaLevel, onTick, onSeasonChange) {
    this.grid     = grid;
    this.seaLevel = seaLevel;
    this.onTick          = onTick;
    this.onSeasonChange  = onSeasonChange;
    this.em         = new EntityManager();
    this._speed     = 1;
    this._timer     = null;
    this.deathStats  = { age: 0, hunger: 0, thirst: 0, predation: 0 };
    this._tickCount  = 0;
    this._reseedAt   = { plants: 0, herbivores: 0, predators: 0 };
    this.seasonSystem = new SeasonSystem();

    // NeedsSystem avant MovementSystem : les targets sont fixées avant le déplacement
    this.systems = [
      new PlantGrowthSystem(),
      new NeedsSystem(),
      new PredatorSystem(),
      new MovementSystem(),
    ];

    this._seedPlants();
    this._seedHerbivores();
    this._seedPredators();
  }

  // ── Seeding plantes ──────────────────────────────────────────

  _seedPlants() {
    for (let y = 0; y < this.grid.rows; y++) {
      for (let x = 0; x < this.grid.cols; x++) {
        const cell = this.grid.getCell(x, y);
        if (!cell) continue;
        if (cell.terrainType === 'eau' || cell.terrainType === 'glace') continue;
        if (cell.fertility < 15) continue;
        if (Math.random() < cell.fertility / 300) this._spawnPlant(x, y, null);
      }
    }
  }

  // ── Seeding herbivores ───────────────────────────────────────

  _seedHerbivores(count = 180) {
    // Collecte des positions de prédateurs pour éviter de spawner trop près
    const predPos = [];
    for (const id of this.em.query('Predator')) {
      const p = this.em.getComponent(id, 'Position');
      if (p) predPos.push(p);
    }

    const landCells = [];
    for (let y = 0; y < this.grid.rows; y++) {
      for (let x = 0; x < this.grid.cols; x++) {
        const cell = this.grid.getCell(x, y);
        if (!cell || cell.altitude < this.seaLevel) continue;
        if (cell.terrainType === 'eau' || cell.terrainType === 'glace') continue;
        landCells.push(cell);
      }
    }

    // Préfère les cellules à distance ≥ 25 de tout prédateur
    const SAFE_DIST = 25;
    const safeCells = predPos.length > 0
      ? landCells.filter(c => predPos.every(p => Math.abs(p.x - c.x) + Math.abs(p.y - c.y) >= SAFE_DIST))
      : landCells;
    const pool = safeCells.length >= count ? safeCells : landCells;

    for (let i = 0; i < count && pool.length > 0; i++) {
      const cell = pool[Math.floor(Math.random() * pool.length)];
      this._spawnHerbivore(cell.x, cell.y, null);
    }
  }

  // ── Spawn ────────────────────────────────────────────────────

  // parentAdn : ADN parent pour reproduction asexuée, null → génome aléatoire.
  _spawnPlant(x, y, parentAdn) {
    const childAdn = parentAdn ? mutationADN(parentAdn) : null;
    const genome   = Genome(childAdn);
    const maxAge   = Math.round(40 + genome.handler.readFloat('longevite') * 120);

    const id = this.em.createEntity();
    this.em.addComponent(id, 'Position', Position(x, y));
    this.em.addComponent(id, 'Species',  Species('plant'));
    this.em.addComponent(id, 'Age',      Age(0, maxAge));
    this.em.addComponent(id, 'Genome',   genome);
    this.em.addComponent(id, 'Plant',    { biomass: 1 + Math.floor(Math.random() * 4) });
    return id;
  }

  // parentAdns : [adn1, adn2] pour reproduction sexuée, null → génome aléatoire.
  _spawnHerbivore(x, y, parentAdns) {
    let childAdn = null;
    if (parentAdns) {
      const [c] = recombinaisonGenetique(parentAdns[0], parentAdns[1]);
      childAdn = c;
    }
    const genome = Genome(childAdn);
    const maxAge = Math.round(80 + genome.handler.readFloat('longevite') * 200);

    const id = this.em.createEntity();
    this.em.addComponent(id, 'Position', Position(x, y));
    this.em.addComponent(id, 'Species',  Species('herbivore'));
    this.em.addComponent(id, 'Age',      Age(0, maxAge));
    this.em.addComponent(id, 'Genome',   genome);
    this.em.addComponent(id, 'Needs',    Needs(x, y));
    return id;
  }

  _seedPredators(count = 28) {
    const landCells = [];
    for (let y = 0; y < this.grid.rows; y++) {
      for (let x = 0; x < this.grid.cols; x++) {
        const cell = this.grid.getCell(x, y);
        if (cell && cell.altitude >= this.seaLevel &&
            cell.terrainType !== 'eau' && cell.terrainType !== 'glace') {
          landCells.push(cell);
        }
      }
    }
    for (let i = 0; i < count && landCells.length > 0; i++) {
      const cell = landCells[Math.floor(Math.random() * landCells.length)];
      this._spawnPredator(cell.x, cell.y, null);
    }
  }

  _spawnPredator(x, y, parentAdns) {
    let childAdn = null;
    if (parentAdns) {
      const [c] = recombinaisonGenetique(parentAdns[0], parentAdns[1]);
      childAdn = c;
    }
    const genome = Genome(childAdn);
    const maxAge = Math.round(200 + genome.handler.readFloat('longevite') * 400); // 200–600 ticks

    const id = this.em.createEntity();
    this.em.addComponent(id, 'Position', Position(x, y));
    this.em.addComponent(id, 'Species',  Species('predator'));
    this.em.addComponent(id, 'Age',      Age(0, maxAge));
    this.em.addComponent(id, 'Genome',   genome);
    this.em.addComponent(id, 'Needs',    Needs(x, y));
    this.em.addComponent(id, 'Predator', Predator());
    return id;
  }

  // ── Tick ─────────────────────────────────────────────────────

  tick() {
    this._tickCount++;

    // SeasonSystem en premier : met à jour saison + températures avant les autres
    const prevSeasonIdx = this.seasonSystem.seasonIndex;
    this.seasonSystem.update({ grid: this.grid, seaLevel: this.seaLevel });

    const ctx = {
      grid:            this.grid,
      em:              this.em,
      seaLevel:        this.seaLevel,
      season:          this.seasonSystem.season,
      spawnPlant:      (x, y, parentAdn)  => this._spawnPlant(x, y, parentAdn),
      spawnHerbivore:  (x, y, parentAdns) => this._spawnHerbivore(x, y, parentAdns),
      spawnPredator:   (x, y, parentAdns) => this._spawnPredator(x, y, parentAdns),
      recordDeath:     (cause)            => { this.deathStats[cause] = (this.deathStats[cause] ?? 0) + 1; },
    };
    for (const system of this.systems) system.update(ctx);

    if (this.seasonSystem.seasonIndex !== prevSeasonIdx) {
      this.onSeasonChange?.(this.seasonSystem.season);
    }
    this._checkPopulationThresholds();
    this.onTick?.();
  }

  get season()      { return this.seasonSystem.season; }
  get yearProgress(){ return this.seasonSystem.yearProgress; }

  // ── Seuils de résilience évolutive ───────────────────────────
  // Si une population s'effondre, de nouvelles espèces émergent spontanément.
  // Cooldown de 50 ticks entre deux reseeds pour éviter le spam en cas de crash profond.

  _checkPopulationThresholds() {
    const t         = this._tickCount;
    const predCount = this.em.query('Predator').length;
    const herbCount = this.em.query('Needs').length - predCount;
    const plantCount = this.em.query('Plant').length;

    if (plantCount < 1000 && t >= this._reseedAt.plants) {
      this._seedPlants();
      this._reseedAt.plants = t + 150;
    }
    // Ne reseed les herbivores que si les prédateurs ne sont pas en surnombre :
    // inutile de les nourrir si la population prédatrice est trop dense —
    // mieux vaut laisser les prédateurs mourir de faim d'abord.
    if (herbCount < 100 && predCount <= Math.max(25, herbCount * 3) && t >= this._reseedAt.herbivores) {
      this._seedHerbivores(160);
      this._reseedAt.herbivores = t + 150;
    }
    if (predCount < 20 && t >= this._reseedAt.predators) {
      this._seedPredators(20);
      this._reseedAt.predators = t + 150;
    }
  }

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

  seedNewPredators(count = 15) {
    this._seedPredators(count);
  }

  setSeaLevel(sl) {
    this.seaLevel = sl;
  }

  get isRunning() { return this._timer !== null; }
}
