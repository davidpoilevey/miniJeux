import { ADNHandler, randomGenome, mutationADN } from '../../genetic/ADNPlante';
import { gravite } from './gravite';

const DIRECTIONS = [[0, -1], [-1, 0], [1, 0], [0, 1]];
const KEYS = ['b17Vertical', 'b17Ramification', 'b17Soleil', 'b17Eau', 'b17Partage', 'b17Patience', 'b17Dispersion', 'b17Dormance', 'b17Mineraux', 'b17Secheresse', 'b17Sobriete', 'b17Fertilite', 'b17Prospection'];
// ADNHandler hashes gene names into 400 slots; don't accidentally couple traits.
const slots = KEYS.map(key => {
  let hash = 0;
  for (const character of key) hash = ((hash << 5) - hash + character.charCodeAt(0)) | 0;
  return Math.abs(hash) % 400;
});
if (new Set(slots).size !== KEYS.length) throw new Error('Collision de gènes b17');

export class Jardin {
  constructor({ width = 100, height = 64, founders = 14, random = Math.random } = {}) {
    this.W = width; this.H = height; this.random = random;
    this.tick = 0; this.nextId = 1; this.births = 0; this.deaths = 0;
    this.plants = new Map(); this.grafts = new Map(); this.cooldowns = new Map(); this.events = [];
    this.blooms = [];
    this.spores = new Map(); this.nextSporeId = 1; this.awakenings = 0;
    this.sporeAt = new Int32Array(width * height);
    this.occupied = new Int32Array(width * height);
    this.water = new Float32Array(width * height);
    this.light = new Float32Array(width * height);
    this.moisture = new Float32Array(width * height);
    this.waterRecharge = new Float32Array(width * height);
    this.detritus = new Float32Array(width * height); this.recycled = 0;
    this.nutrients = new Float32Array(width * height); this.soil = new Float32Array(width * height);
    this.soilDepth = Math.max(3, Math.round(height * 0.16)); this.falls = 0; this.fragments = 0;
    this.rain = 1; this.grafted = 0; this.broken = 0;
    this.weatherEnabled = true; this.shower = null; this.showers = 0;
    this.nextShower = 180 + Math.floor(this.random() * 460);
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const a = 0.23 * width + Math.sin(y * 0.17) * 5;
      const b = 0.73 * width + Math.cos(y * 0.13) * 7;
      const wet = Math.exp(-(((x - a) / 7) ** 2)) + Math.exp(-(((x - b) / 9) ** 2));
      const i = this.index(x, y);
      this.moisture[i] = 0.30 + wet * 0.60;
      this.waterRecharge[i] = 0.025 + wet * 0.18;
      this.water[i] = this.moisture[i];
      const depth = Math.max(0, (y - (height - this.soilDepth)) / Math.max(1, this.soilDepth - 1));
      this.soil[i] = depth * (0.8 + 0.5 * (1 + Math.sin(x * 0.19 + Math.cos(x * 0.07))) / 2);
      this.nutrients[i] = this.soil[i];
    }
    for (let n = 0; n < founders; n++) {
      const x = Math.floor((n + 0.5) * width / founders);
      const y = height - 9 - Math.floor(this.random() * Math.min(15, height / 3));
      this.createPlant(x, y, randomGenome());
    }
    this.updateLight();
    this.log('Les premières graines prennent pied sur la paroi.');
  }

  index(x, y) { return y * this.W + x; }
  inside(x, y) { return x >= 0 && x < this.W && y >= 0 && y < this.H; }
  log(text) { this.events.unshift({ tick: this.tick, text }); this.events.length = Math.min(18, this.events.length); }

  createPlant(x, y, adn, parent = null, { revival = false } = {}) {
    if (!this.inside(x, y) || this.occupied[this.index(x, y)]) return null;
    const handler = new ADNHandler(adn);
    const values = KEYS.map(key => handler.readFloat(key));
    const id = this.nextId++;
    const plant = {
      id, adn, handler, lineage: parent ? parent.lineage : id,
      generation: parent ? parent.generation + (revival ? 0 : 1) : 0, age: 0,
      hue: parent ? parent.hue : (id * 137.508) % 360,
      cells: [{ x, y, parent: null, minerals: parent ? 0 : 0.12 }], energy: 6, water: 3, nutrients: 1.8,
      traits: { vertical: values[0], branching: values[1], solar: values[2],
        uptake: values[3], sharing: values[4], patience: values[5], dispersal: values[6], dormancy: values[7], minerals: values[8], drought: values[9], frugality: values[10], fertility: values[11], prospecting: values[12] },
      stress: 0, intake: 0, photo: 0, waterUse: 0, mineralIntake: 0, mineralUse: 0, remoteIntake: 0, falling: false, supported: false, grounded: false,
    };
    this.plants.set(id, plant); this.occupied[this.index(x, y)] = id;
    if (parent && !revival) this.births++;
    return plant;
  }

  updateLight() {
    for (let x = 0; x < this.W; x++) {
      let light = 1;
      for (let y = 0; y < this.H; y++) {
        const i = this.index(x, y);
        this.light[i] = light;
        if (this.occupied[i]) light *= 0.72;
      }
    }
  }

  step() {
    this.tick++;
    this.stepWeather();
    this.stepResources();
    this.gravity();
    this.stepDetritus();
    this.updateLight();
    const plants = [...this.plants.values()];
    // Rotate processing order so the first founder doesn't always claim contested space.
    const offset = Math.floor(this.random() * Math.max(1, plants.length));
    for (let k = 0; k < plants.length; k++) this.metabolize(plants[(k + offset) % plants.length]);
    if (this.tick % 6 === 0) this.findGrafts();
    this.exchange();
    for (let k = 0; k < plants.length; k++) {
      const plant = plants[(k + offset) % plants.length];
      if (!this.plants.has(plant.id)) continue;
      const needs = this.requirements(plant);
      if (plant.energy <= 0 || plant.water <= needs.dryThreshold || plant.nutrients <= 0.001) plant.stress++; else plant.stress = Math.max(0, plant.stress - 2);
      if (plant.stress > 50 || plant.age > 1800 + plant.traits.patience * 2200) { this.kill(plant); continue; }
      if (plant.stress > 8 && plant.cells.length > 1 && this.tick % 12 === 0) {
        let weakest = 0;
        for (let c = 1; c < plant.cells.length; c++) if (this.light[this.index(plant.cells[c].x, plant.cells[c].y)]
          < this.light[this.index(plant.cells[weakest].x, plant.cells[weakest].y)]) weakest = c;
        this.shedCell(plant, weakest);
        continue;
      }
      if (plant.age % needs.growthInterval === 0) this.grow(plant);
      if (plant.age % needs.reproductionInterval === 0) this.reproduce(plant);
    }
    // A death above may have reopened the light during this very tick.
    this.updateLight();
    this.stepSpores();
    this.blooms = this.blooms.filter(b => this.tick - b.born < b.duration
      && this.plants.get(b.plantId)?.cells.includes(b.cell));
  }

  requirements(plant) {
    const { drought, frugality, fertility } = plant.traits;
    return {
      dryThreshold: 0.03 - drought * 0.025,
      waterMaintenance: 0.003 * (1 - drought * 0.6),
      waterPerEnergy: 0.32 * (1 - drought * 0.3),
      photoEfficiency: 1 - drought * 0.25,
      mineralUpkeep: 0.0015 + (1 - frugality) * 0.0025,
      buildMinerals: 0.12 + (1 - frugality) * 0.22,
      seedMinerals: 0.20 + (1 - frugality) * 0.25,
      growthInterval: 4 + Math.round(frugality * 5),
      reproductionInterval: 70 + Math.round((1 - fertility) * 110),
      reproductionChance: 0.10 + fertility * 0.50,
    };
  }

  stepResources() {
    for (let i = 0; i < this.water.length; i++) {
      const deficit = this.moisture[i] * this.rain - this.water[i];
      // Strong sources refill depleted contact cells; excess rain still dries slowly.
      this.water[i] = Math.max(0, this.water[i] + deficit * (deficit > 0 ? this.waterRecharge[i] : 0.025));
      this.nutrients[i] += Math.max(0, this.soil[i] - this.nutrients[i]) * 0.003; // Slow background supply, independent of recycling.
    }
  }

  depositDebris(cell, minerals) {
    if (minerals > 0) this.detritus[this.index(cell.x, cell.y)] += minerals;
  }

  stepDetritus() {
    // Bottom-first: loose debris moves one case per cycle and can rest on tissue.
    for (let y = this.H - 2; y >= 0; y--) for (let x = 0; x < this.W; x++) {
      const i = this.index(x, y), below = this.index(x, y + 1);
      if (this.detritus[i] > 0 && !this.occupied[below]) {
        this.detritus[below] += this.detritus[i]; this.detritus[i] = 0;
      }
    }
    for (let i = 0; i < this.detritus.length; i++) {
      const released = this.detritus[i] * 0.006;
      this.detritus[i] -= released; this.nutrients[i] += released; this.recycled += released;
    }
  }

  gravity() { gravite(this); }

  shedCell(plant, removed) {
    if (plant.cells.length === 1) { this.kill(plant); return; }
    const original = plant.cells, positions = new Map();
    this.depositDebris(original[removed], (original[removed].minerals || 0) + plant.nutrients / original.length);
    const reserves = { energy: plant.energy, water: plant.water, nutrients: plant.nutrients };
    original.forEach((c, i) => { this.occupied[this.index(c.x, c.y)] = 0; if (i !== removed) positions.set(this.index(c.x, c.y), i); });
    const groups = [];
    while (positions.size) {
      const first = positions.values().next().value, queue = [first], group = [];
      positions.delete(this.index(original[first].x, original[first].y));
      while (queue.length) {
        const i = queue.pop(), cell = original[i]; group.push(i);
        for (const [dx, dy] of DIRECTIONS) {
          if (!this.inside(cell.x + dx, cell.y + dy)) continue;
          const key = this.index(cell.x + dx, cell.y + dy), next = positions.get(key);
          if (next !== undefined) { positions.delete(key); queue.push(next); }
        }
      }
      groups.push(group);
    }
    groups.sort((a, b) => b.length - a.length);
    groups.forEach((indices, n) => {
      const root = original[indices[0]];
      const part = n === 0 ? plant : this.createPlant(root.x, root.y, plant.adn, plant, { revival: true });
      const remap = new Map(indices.map((old, i) => [old, i]));
      part.cells = indices.map(old => ({ ...original[old], parent: remap.get(original[old].parent) ?? null }));
      for (const resource of ['energy', 'water', 'nutrients']) part[resource] = reserves[resource] * indices.length / original.length;
      part.age = plant.age; part.stress = plant.stress; part.supported = plant.supported;
      for (const cell of part.cells) this.occupied[this.index(cell.x, cell.y)] = part.id;
    });
    // Reattach each graft to the fragment which actually retains its contact tissue.
    for (const g of [...this.grafts.values()]) {
      if (g.a !== plant.id && g.b !== plant.id) continue;
      const a = this.occupied[this.index(g.from.x, g.from.y)], b = this.occupied[this.index(g.to.x, g.to.y)];
      if (!a || !b) { this.breakGraft(g, 'tissu de greffe disparu'); continue; }
      this.grafts.delete(g.key); g.a = a; g.b = b; g.key = [a, b].sort((x, y) => x - y).join(':'); this.grafts.set(g.key, g);
    }
    for (const bloom of this.blooms) if (bloom.plantId === plant.id) {
      const owner = this.plants.get(this.occupied[this.index(bloom.cell.x, bloom.cell.y)]);
      const cell = owner?.cells.find(c => c.x === bloom.cell.x && c.y === bloom.cell.y);
      if (cell) { bloom.plantId = owner.id; bloom.cell = cell; }
    }
    this.fragments += groups.length - 1;
    this.log(`La plante ${plant.id} perd une cellule${groups.length > 1 ? ` et se sépare en ${groups.length} fragments` : ''}.`);
  }

  startShower(kind = 'random', options = {}) {
    const local = kind === 'local' || (kind === 'random' && this.random() < 0.65);
    const duration = options.duration ?? (100 + Math.floor(this.random() * 140));
    this.shower = {
      local, x: options.x ?? this.random() * this.W, y: options.y ?? this.random() * this.H,
      radius: options.radius ?? (this.W * (0.14 + this.random() * 0.16)),
      intensity: options.intensity ?? (0.016 + this.random() * 0.016),
      remaining: duration, duration,
    };
    this.showers++;
    this.log(local ? 'Une averse arrose une partie de la paroi.' : 'Une pluie traverse toute la paroi.');
  }

  rainAt(x, y) {
    if (!this.shower) return 0;
    if (!this.shower.local) return 1;
    const d2 = (x - this.shower.x) ** 2 + (y - this.shower.y) ** 2;
    return Math.exp(-d2 / (2 * this.shower.radius ** 2));
  }

  stepWeather() {
    if (!this.shower && this.weatherEnabled && this.tick >= this.nextShower) this.startShower();
    if (!this.shower) return;
    for (let y = 0; y < this.H; y++) for (let x = 0; x < this.W; x++) {
      const i = this.index(x, y);
      this.water[i] += Math.min(Math.max(0, 2.5 - this.water[i]), this.shower.intensity * this.rainAt(x, y));
    }
    if (--this.shower.remaining <= 0) {
      this.shower = null;
      this.nextShower = this.tick + 180 + Math.floor(this.random() * 460);
      this.log('La pluie cesse ; la paroi garde son eau.');
    }
  }

  sporulate(plant) {
    const count = plant.traits.dormancy >= 0.5 && plant.cells.length > 1 ? 2 : 1;
    // Keep the base plus one random surviving tissue, rather than picking ideal niches.
    const candidates = [plant.cells[0], ...plant.cells.slice(1)];
    if (candidates.length > 2) {
      const chosen = 1 + Math.floor(this.random() * (candidates.length - 1));
      [candidates[1], candidates[chosen]] = [candidates[chosen], candidates[1]];
    }
    let kept = 0, mineralsKept = 0;
    const mineralBudget = plant.nutrients + plant.cells.reduce((sum, c) => sum + (c.minerals || 0), 0);
    for (const cell of candidates) {
      const i = this.index(cell.x, cell.y);
      if (this.sporeAt[i]) continue;
      const id = this.nextSporeId++;
      this.spores.set(id, {
        id, x: cell.x, y: cell.y, adn: plant.adn, lineage: plant.lineage,
        generation: plant.generation, hue: plant.hue, sourceId: plant.id,
        dormancy: plant.traits.dormancy, uptake: plant.traits.uptake, age: 0, favorable: 0,
        // Salvage a fraction of the constructed tissue plus residual reserves.
        energy: Math.min(0.95, 0.45 + plant.energy / count),
        water: Math.min(0.4, 0.14 + plant.water / count),
        nutrients: Math.min(0.35, mineralBudget / count),
      });
      mineralsKept += this.spores.get(id).nutrients;
      this.sporeAt[i] = id;
      if (++kept >= count) break;
    }
    return { count: kept, nutrients: mineralsKept };
  }

  removeSpore(spore) {
    this.spores.delete(spore.id); this.sporeAt[this.index(spore.x, spore.y)] = 0;
  }

  stepSpores() {
    for (const spore of [...this.spores.values()]) {
      const i = this.index(spore.x, spore.y);
      spore.age++; spore.energy = Math.max(0, spore.energy - (0.00002 + (1 - spore.dormancy) * 0.00005));
      if (spore.energy <= 0) { this.depositDebris(spore, spore.nutrients); this.removeSpore(spore); continue; }
      const favorable = !this.occupied[i] && this.light[i] >= 0.45
        && this.water[i] >= 0.18 + (1 - spore.uptake) * 0.12;
      spore.favorable = favorable ? spore.favorable + 1 : 0;
      if (spore.favorable < 15) continue;
      const plant = this.createPlant(spore.x, spore.y, spore.adn, spore, { revival: true });
      if (plant) {
        plant.energy = spore.energy; plant.water = spore.water; plant.nutrients = spore.nutrients;
        this.removeSpore(spore); this.awakenings++;
        this.log(`La spore de la plante ${spore.sourceId} se réveille : plante ${plant.id}, lignée ${plant.lineage}.`);
      }
    }
  }

  metabolize(plant) {
    plant.age++; plant.intake = 0; plant.photo = 0; plant.mineralIntake = 0; plant.remoteIntake = 0;
    let potentialPhoto = 0;
    const t = plant.traits, needs = this.requirements(plant), capacity = 3 + plant.cells.length * 0.65;
    for (const cell of plant.cells) {
      const i = this.index(cell.x, cell.y);
      const uptake = Math.min(this.water[i], 0.055 + t.uptake * 0.20, Math.max(0, capacity - plant.water));
      this.water[i] -= uptake; plant.water += uptake; plant.intake += uptake;
      let budget = 0.012 + t.minerals * 0.028;
      const sites = [i];
      if (t.prospecting >= 0.5) {
        const neighbors = DIRECTIONS.filter(([dx, dy]) => this.inside(cell.x + dx, cell.y + dy))
          .map(([dx, dy]) => this.index(cell.x + dx, cell.y + dy));
        neighbors.sort((a, b) => this.nutrients[b] - this.nutrients[a]); sites.push(...neighbors);
      }
      for (const site of sites) {
        const minerals = Math.min(this.nutrients[site], budget, Math.max(0, capacity - plant.nutrients));
        this.nutrients[site] -= minerals; plant.nutrients += minerals; plant.mineralIntake += minerals;
        if (site !== i) plant.remoteIntake += minerals;
        budget -= minerals;
        if (budget <= 0 || plant.nutrients >= capacity) break;
      }
      potentialPhoto += this.light[i] * (0.045 + t.solar * 0.035);
    }
    // Every branch feeds the shared body before photosynthesis draws on the pool.
    const before = plant.water;
    plant.water = Math.max(0, plant.water - plant.cells.length * needs.waterMaintenance);
    // Reduce photosynthesis when water is scarce instead of draining the last drop.
    const protectedWater = 0.06 + plant.cells.length * 0.006;
    plant.photo = Math.min(potentialPhoto * needs.photoEfficiency, Math.max(0, plant.water - protectedWater) / needs.waterPerEnergy);
    plant.water -= plant.photo * needs.waterPerEnergy; plant.waterUse = before - plant.water;
    plant.energy += plant.photo;
    // Transport over a larger body is costly, not a free global energy bonus.
    plant.energy = Math.max(0, Math.min(capacity * 2, plant.energy - plant.remoteIntake * 0.15 - plant.cells.length * (0.011 + t.solar * 0.008 + t.uptake * 0.008)));
    plant.mineralUse = Math.min(plant.nutrients, plant.cells.length * needs.mineralUpkeep);
    plant.nutrients -= plant.mineralUse;
  }

  grow(plant) {
    const needs = this.requirements(plant);
    const reserve = plant.cells.length >= 8 ? 5 + plant.traits.patience * 2 : 1.7;
    if (plant.energy < reserve || plant.water < 0.7 || plant.nutrients < needs.buildMinerals + 0.05 || plant.stress > 0) return;
    let best = null, score = -Infinity;
    for (let c = 0; c < plant.cells.length; c++) {
      const cell = plant.cells[c];
      for (const [dx, dy] of DIRECTIONS) {
        const x = cell.x + dx, y = cell.y + dy;
        if (!this.inside(x, y) || this.occupied[this.index(x, y)]) continue;
        let neighbors = 0;
        for (const [nx, ny] of DIRECTIONS) if (this.inside(x + nx, y + ny) && this.occupied[this.index(x + nx, y + ny)] === plant.id) neighbors++;
        const t = plant.traits, i = this.index(x, y);
        const needWater = 1 - Math.min(1, plant.water / (1 + plant.cells.length * 0.35));
        const needMinerals = 1 - Math.min(1, plant.nutrients / (1 + plant.cells.length * 0.08));
        const value = this.light[i] * (0.4 + t.solar) + this.water[i] * (0.5 + needWater * 2 + t.uptake)
          + this.nutrients[i] * needMinerals * (0.4 + t.minerals)
          - dy * (t.vertical - 0.35) * 0.8 + (neighbors - 1) * (0.5 - t.branching)
          + this.random() * (0.1 + t.branching * 0.6);
        if (value > score) { score = value; best = { x, y, parent: c }; }
      }
    }
    if (best) {
      plant.energy -= 0.95; plant.water -= 0.4; plant.nutrients -= needs.buildMinerals;
      best.minerals = needs.buildMinerals;
      plant.cells.push(best); this.occupied[this.index(best.x, best.y)] = plant.id;
    }
  }

  findGrafts() {
    for (const plant of this.plants.values()) {
      if (plant.stress || plant.energy < 1 || plant.water < 0.3) continue;
      for (const cell of plant.cells) for (const [dx, dy] of [[1, 0], [0, 1]]) {
        const x = cell.x + dx, y = cell.y + dy;
        if (!this.inside(x, y)) continue;
        const other = this.plants.get(this.occupied[this.index(x, y)]);
        if (!other || other.id === plant.id || other.stress || other.energy < 1 || other.water < 0.3) continue;
        const key = [plant.id, other.id].sort((a, b) => a - b).join(':');
        if (this.grafts.has(key) || (this.cooldowns.get(key) || 0) > this.tick) continue;
        // Both partners accept; complementary reserves make a contact more useful.
        const mismatch = Math.abs(plant.water / (plant.cells.length + 3) - other.water / (other.cells.length + 3));
        const energyMismatch = Math.abs(plant.energy / (plant.cells.length + 3) - other.energy / (other.cells.length + 3));
        const mineralMismatch = Math.abs(plant.nutrients / (plant.cells.length + 3) - other.nutrients / (other.cells.length + 3));
        if (mismatch + energyMismatch + mineralMismatch < 0.08) continue;
        if (this.random() > plant.traits.sharing * other.traits.sharing * (0.15 + mismatch)) continue;
        plant.energy -= 0.25; other.energy -= 0.25;
        this.grafts.set(key, { key, a: plant.id, b: other.id, from: { ...cell }, to: { x, y }, age: 0, idle: 0, energy: 0, water: 0, nutrients: 0, total: 0 });
        this.grafted++; this.log(`Greffe : plantes ${plant.id} et ${other.id}.`);
      }
    }
  }

  transfer(a, b, resource, conductance) {
    const ca = 3 + a.cells.length * 0.65, cb = 3 + b.cells.length * 0.65;
    const difference = a[resource] / ca - b[resource] / cb;
    const donor = difference > 0 ? a : b, receiver = difference > 0 ? b : a;
    const capacity = resource === 'energy' ? (receiver === a ? ca : cb) * 2 : (receiver === a ? ca : cb);
    const reserve = resource === 'energy' ? 1 : resource === 'nutrients' ? 0.15 : 0.35;
    const amount = Math.min(Math.abs(difference) * conductance, Math.max(0, donor[resource] - reserve), Math.max(0, capacity - receiver[resource]));
    donor[resource] -= amount; receiver[resource] += amount;
    return difference > 0 ? amount : -amount;
  }

  exchange() {
    for (const graft of [...this.grafts.values()]) {
      const a = this.plants.get(graft.a), b = this.plants.get(graft.b);
      if (!a || !b) { this.breakGraft(graft, 'partenaire disparu'); continue; }
      graft.age++;
      const conductance = (0.15 + Math.min(a.traits.sharing, b.traits.sharing) * 0.65) / (1 + (a.cells.length + b.cells.length) * 0.012);
      graft.energy = this.transfer(a, b, 'energy', conductance);
      graft.water = this.transfer(a, b, 'water', conductance);
      graft.nutrients = this.transfer(a, b, 'nutrients', conductance);
      const flow = Math.abs(graft.energy) + Math.abs(graft.water) + Math.abs(graft.nutrients);
      graft.total += flow;
      // A connection has an actual maintenance cost even when nothing crosses it.
      a.energy = Math.max(0, a.energy - 0.008); b.energy = Math.max(0, b.energy - 0.008);
      graft.idle = flow < 0.007 ? graft.idle + 1 : Math.max(0, graft.idle - 2);
      if (a.stress > 18 || b.stress > 18) this.breakGraft(graft, 'partenaire en détresse');
      else if (graft.idle > 80 + Math.min(a.traits.patience, b.traits.patience) * 160) this.breakGraft(graft, 'échanges devenus insuffisants');
    }
  }

  breakGraft(graft, reason) {
    this.grafts.delete(graft.key); this.broken++;
    this.cooldowns.set(graft.key, this.tick + 180);
    this.log(`Rupture ${graft.a} ↔ ${graft.b} : ${reason}.`);
  }

  reproduce(plant) {
    const needs = this.requirements(plant);
    if (plant.cells.length < 8 || plant.energy < 5 || plant.water < 1.8 || plant.nutrients < needs.seedMinerals + 0.15
      || this.random() > needs.reproductionChance) return;
    const parents = new Set(plant.cells.map(c => c.parent));
    const tips = plant.cells.filter((c, i) => !parents.has(i));
    const from = tips[Math.floor(this.random() * tips.length)];
    const distance = 3 + Math.floor(plant.traits.dispersal * 12);
    const x = from.x + Math.round((this.random() * 2 - 1) * distance);
    const y = from.y + Math.round((this.random() * 2 - 1) * distance);
    if (!this.inside(x, y) || this.occupied[this.index(x, y)] || this.water[this.index(x, y)] < 0.04) return;
    const child = this.createPlant(x, y, mutationADN(plant.adn, 0.006), plant);
    if (child) {
      // A seed transfers reserves from the parent; births don't conjure energy.
      plant.energy -= 3; plant.water -= 1.2; plant.nutrients -= needs.seedMinerals;
      child.energy = 3; child.water = 1.2; child.nutrients = needs.seedMinerals;
      this.blooms.push({ plantId: plant.id, cell: from, seedId: child.id, born: this.tick, duration: 180,
        hue: plant.hue, petals: 4 + Math.round(plant.traits.fertility * 3), shape: plant.traits.branching });
      this.log(`Graine de la plante ${plant.id} : naissance ${child.id}, génération ${child.generation}.`);
    }
  }

  kill(plant) {
    if (!this.plants.has(plant.id)) return;
    for (const graft of [...this.grafts.values()]) if (graft.a === plant.id || graft.b === plant.id) this.breakGraft(graft, 'partenaire disparu');
    for (const cell of plant.cells) this.occupied[this.index(cell.x, cell.y)] = 0;
    this.plants.delete(plant.id); this.deaths++;
    const spores = this.sporulate(plant);
    const totalMinerals = plant.nutrients + plant.cells.reduce((sum, c) => sum + (c.minerals || 0), 0);
    const remainder = Math.max(0, totalMinerals - spores.nutrients);
    for (const cell of plant.cells) {
      const share = (cell.minerals || 0) + plant.nutrients / plant.cells.length;
      this.depositDebris(cell, totalMinerals ? share * remainder / totalMinerals : 0);
    }
    for (const key of this.cooldowns.keys()) if (key.split(':').map(Number).includes(plant.id)) this.cooldowns.delete(key);
    this.log(`La plante ${plant.id} se désagrège (${plant.cells.length} cellules) ; ${spores.count} spore${spores.count > 1 ? 's' : ''} reste${spores.count > 1 ? 'nt' : ''}.`);
  }

  get stats() {
    const plants = [...this.plants.values()];
    return { tick: this.tick, plants: plants.length, cells: plants.reduce((n, p) => n + p.cells.length, 0),
      lineages: new Set(plants.map(p => p.lineage)).size, grafts: this.grafts.size,
      births: this.births, deaths: this.deaths, grafted: this.grafted, broken: this.broken,
      recycled: this.recycled, detritus: this.detritus.reduce((sum, n) => sum + n, 0),
      flowers: this.blooms.length, spores: this.spores.size, awakenings: this.awakenings, showers: this.showers,
      falling: plants.filter(p => p.falling).length, grounded: plants.filter(p => p.grounded).length,
      falls: this.falls, fragments: this.fragments,
      dormantLineages: new Set([...this.spores.values()].map(s => s.lineage)).size,
      shower: this.shower ? (this.shower.local ? 'Averse locale' : 'Pluie générale') : null,
      generation: Math.max(0, ...plants.map(p => p.generation)) };
  }
}
