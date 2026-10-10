import { Jardin } from './Jardin';
import { randomGenome } from '../../genetic/ADNPlante';

const pair = () => {
  const world = new Jardin({ width: 20, height: 20, founders: 0 });
  const a = world.createPlant(8, 12, randomGenome());
  const b = world.createPlant(9, 12, randomGenome());
  return { world, a, b };
};

test('a graft transfers existing water and energy without a free mutualism bonus', () => {
  const { world, a, b } = pair();
  a.energy = 6; b.energy = 2; a.water = 0.5; b.water = 3;
  const energy = a.energy + b.energy, water = a.water + b.water;
  world.grafts.set('1:2', { key: '1:2', a: a.id, b: b.id, age: 0, idle: 0, total: 0 });
  world.exchange();
  expect(a.energy).toBeLessThan(6); expect(b.energy).toBeGreaterThan(2);
  expect(a.water).toBeGreaterThan(0.5); expect(b.water).toBeLessThan(3);
  expect(a.water + b.water).toBeCloseTo(water, 10);
  expect(a.energy + b.energy).toBeCloseTo(energy - 0.016, 10);
});

test('a failing partner loses its connection and death frees its occupied space', () => {
  const { world, a, b } = pair();
  world.grafts.set('1:2', { key: '1:2', a: a.id, b: b.id, age: 0, idle: 0, total: 0 });
  a.stress = 20; world.exchange();
  expect(world.grafts.size).toBe(0); expect(world.broken).toBe(1);
  world.kill(a);
  expect(world.occupied[world.index(8, 12)]).toBe(0);
  expect(world.plants.has(b.id)).toBe(true);
});

test('upper tissues shade lower competitors in their column', () => {
  const { world } = pair();
  world.createPlant(8, 5, randomGenome()); world.updateLight();
  expect(world.light[world.index(8, 12)]).toBeLessThan(world.light[world.index(9, 12)]);
});

test('partners cannot immediately recreate a failed graft', () => {
  const { world, a, b } = pair();
  world.random = () => 0; a.traits.sharing = 1; b.traits.sharing = 1;
  a.water = 0.5; b.water = 3;
  world.findGrafts();
  expect(world.grafts.size).toBe(1);
  world.breakGraft([...world.grafts.values()][0], 'échanges insuffisants');
  world.findGrafts();
  expect(world.grafts.size).toBe(0);
  world.tick += 181; world.findGrafts();
  expect(world.grafts.size).toBe(1);
});

test('a seed inherits its lineage and transfers reserves from its parent', () => {
  const { world, a } = pair();
  a.cells = Array.from({ length: 8 }, () => ({ x: 8, y: 12, parent: null }));
  a.energy = 7; a.water = 3; a.traits.dispersal = 0;
  world.random = () => 0;
  world.water[world.index(5, 9)] = 1;
  world.reproduce(a);
  const child = [...world.plants.values()].find(p => p.generation === 1);
  expect(child).toBeDefined(); expect(child.lineage).toBe(a.lineage);
  expect(a.energy + child.energy).toBe(7);
  expect(a.water + child.water).toBeCloseTo(3);
  expect(child.adn).not.toBe(a.adn);
});

test('drying eventually extinguishes the plants without automatic repopulation', () => {
  const world = new Jardin({ width: 30, height: 25, founders: 4 });
  world.rain = 0; world.weatherEnabled = false; world.water.fill(0);
  for (let i = 0; i < 2000; i++) world.step();
  expect(world.plants.size).toBe(0); expect(world.grafts.size).toBe(0);
  expect([...world.occupied].every(id => id === 0)).toBe(true);
  expect(world.spores.size).toBeGreaterThan(0);
});

test('death leaves at most two dormant tissues with the original genome and lineage', () => {
  const { world, a } = pair();
  a.traits.dormancy = 1;
  a.cells.push({ x: 8, y: 13, parent: 0 }, { x: 8, y: 14, parent: 1 });
  world.occupied[world.index(8, 13)] = a.id; world.occupied[world.index(8, 14)] = a.id;
  world.kill(a);
  expect(world.spores.size).toBe(2);
  for (const spore of world.spores.values()) {
    expect(spore.adn).toBe(a.adn); expect(spore.lineage).toBe(a.lineage);
    expect(world.occupied[world.index(spore.x, spore.y)]).toBe(0);
  }
  world.kill(a);
  expect(world.spores.size).toBe(2);
});

test('a shaded spore waits and revives after the plant above dies, without resetting its genome or minting reserves', () => {
  const { world, a } = pair();
  const shade = world.createPlant(8, 3, randomGenome());
  for (let y = 4; y <= 6; y++) {
    shade.cells.push({ x: 8, y, parent: 0 }); world.occupied[world.index(8, y)] = shade.id;
  }
  world.kill(a); world.updateLight(); world.water[world.index(8, 12)] = 1;
  const spore = [...world.spores.values()].find(s => s.lineage === a.lineage);
  for (let i = 0; i < 30; i++) world.stepSpores();
  expect(world.spores.has(spore.id)).toBe(true); expect(spore.favorable).toBe(0);
  world.kill(shade); world.updateLight();
  const reserves = { energy: spore.energy, water: spore.water };
  for (let i = 0; i < 14; i++) world.stepSpores();
  expect(world.spores.has(spore.id)).toBe(true);
  world.stepSpores();
  const revived = [...world.plants.values()].find(p => p.lineage === a.lineage);
  expect(revived.adn).toBe(a.adn); expect(revived.generation).toBe(a.generation);
  expect(revived.energy).toBeLessThan(reserves.energy); expect(revived.water).toBe(reserves.water);
  expect(world.spores.has(spore.id)).toBe(false); expect(world.births).toBe(0);
});

test('a covered spore and a dry spore cannot germinate', () => {
  const { world, a } = pair(); world.kill(a); world.updateLight();
  const spore = [...world.spores.values()][0];
  world.water[world.index(spore.x, spore.y)] = 0;
  for (let i = 0; i < 20; i++) world.stepSpores();
  expect(world.awakenings).toBe(0);
  world.water[world.index(spore.x, spore.y)] = 1;
  world.createPlant(spore.x, spore.y, randomGenome());
  for (let i = 0; i < 20; i++) world.stepSpores();
  expect(world.awakenings).toBe(0); expect(world.spores.has(spore.id)).toBe(true);
});

test('general rain wets every cell for a finite episode, local rain preferentially wets its patch', () => {
  const world = new Jardin({ width: 20, height: 20, founders: 0 });
  world.weatherEnabled = false; world.water.fill(0);
  world.startShower('general', { duration: 4, intensity: 0.1 });
  for (let i = 0; i < 4; i++) world.stepWeather();
  expect([...world.water].every(w => Math.abs(w - 0.4) < 0.00001)).toBe(true);
  expect(world.shower).toBeNull();
  world.water.fill(0);
  world.startShower('local', { x: 2, y: 2, radius: 1, duration: 1, intensity: 0.1 });
  world.stepWeather();
  expect(world.water[world.index(2, 2)]).toBeCloseTo(0.1);
  expect(world.water[world.index(19, 19)]).toBeLessThan(0.000001);
});

test('rain can awaken an existing dry lineage without introducing any founder', () => {
  const world = new Jardin({ width: 20, height: 20, founders: 0 });
  world.weatherEnabled = false; world.rain = 0; world.water.fill(0);
  const plant = world.createPlant(10, 15, randomGenome()); world.kill(plant);
  for (let i = 0; i < 80; i++) world.step();
  expect(world.plants.size).toBe(0); expect(world.awakenings).toBe(0);
  world.startShower('general', { duration: 100, intensity: 0.04 });
  for (let i = 0; i < 30; i++) world.step();
  expect(world.awakenings).toBe(1);
  expect([...world.plants.values()][0].lineage).toBe(plant.lineage);
  expect(world.births).toBe(0);
});

const tissue = (world, plant, cells) => {
  for (const c of plant.cells) world.occupied[world.index(c.x, c.y)] = 0;
  plant.cells = cells.map(([x, y], i) => ({ x, y, parent: i ? i - 1 : null }));
  for (const c of plant.cells) world.occupied[world.index(c.x, c.y)] = plant.id;
};
const connect = (world, a, b, from = a.cells[0], to = b.cells[0]) => {
  const key = [a.id, b.id].sort((x, y) => x - y).join(':');
  const g = { key, a: a.id, b: b.id, from: { ...from }, to: { ...to }, age: 0, idle: 0, total: 0 };
  world.grafts.set(key, g); return g;
};

test('a whole body settles without deformation and falls again when its base disappears', () => {
  const { world, a } = pair();
  tissue(world, a, [[5, 17], [5, 18], [5, 19]]);
  world.gravity(); expect(a.supported).toBe(true);
  world.shedCell(a, 2); world.gravity();
  expect(a.cells.map(c => c.y)).toEqual([18, 19]);
  expect(world.occupied[world.index(5, 17)]).toBe(0);
  expect(world.occupied[world.index(5, 19)]).toBe(a.id);
  expect(world.falls).toBe(1);
  world.gravity(); expect(a.falling).toBe(false);
});

test('a graft anchors a lateral plant, its rupture releases it, and airborne grafts move with both bodies', () => {
  const { world, a, b } = pair();
  tissue(world, a, [[8, 17], [8, 18], [8, 19]]); tissue(world, b, [[9, 17], [9, 16]]);
  const g = connect(world, a, b);
  world.gravity(); expect(b.cells[0].y).toBe(17); expect(b.supported).toBe(true); expect(b.grounded).toBe(false);
  world.breakGraft(g, 'test'); world.gravity();
  expect(b.cells[0].y).toBe(18); expect(b.falling).toBe(true);
  tissue(world, a, [[8, 10]]); tissue(world, b, [[9, 10]]);
  const airborne = connect(world, a, b); world.gravity();
  expect(airborne.from.y).toBe(11); expect(airborne.to.y).toBe(11);
  expect(a.cells[0].y).toBe(11); expect(b.cells[0].y).toBe(11);
});

test('a broken stem separates live fragments, preserves inheritance and apportions remaining reserves', () => {
  const { world, a, b } = pair();
  tissue(world, a, [[5, 15], [5, 16], [5, 17], [5, 18], [5, 19]]);
  tissue(world, b, [[6, 15]]);
  connect(world, a, b, a.cells[0], b.cells[0]);
  a.energy = 10; a.water = 5; a.nutrients = 2;
  world.shedCell(a, 2);
  const pieces = [...world.plants.values()].filter(p => p.lineage === a.lineage);
  expect(pieces).toHaveLength(2); expect(world.fragments).toBe(1); expect(world.births).toBe(0);
  expect(pieces.reduce((n, p) => n + p.energy, 0)).toBe(8);
  expect(pieces.reduce((n, p) => n + p.nutrients, 0)).toBeCloseTo(1.6);
  for (const p of pieces) { expect(p.adn).toBe(a.adn); expect(p.generation).toBe(a.generation); }
  world.gravity();
  expect(world.occupied[world.index(5, 15)]).toBe(0);
  expect(world.occupied[world.index(5, 19)]).not.toBe(0);
  const g = [...world.grafts.values()][0];
  expect(world.occupied[world.index(g.from.x, g.from.y)]).toBe(g.a);
  expect(world.occupied[world.index(g.to.x, g.to.y)]).toBe(g.b);
});

test('nutrients are harvested from soil, limit growth and pass through grafts without creation', () => {
  const { world, a, b } = pair();
  expect(world.nutrients[world.index(8, 5)]).toBe(0);
  expect(world.nutrients[world.index(8, 19)]).toBeGreaterThan(0);
  tissue(world, a, [[8, 19]]); a.nutrients = 0;
  const before = world.nutrients[world.index(8, 19)]; world.metabolize(a);
  expect(a.mineralIntake).toBeGreaterThan(0);
  expect(world.nutrients[world.index(8, 19)]).toBeCloseTo(before - a.mineralIntake);
  a.nutrients = 0; a.energy = 6; a.water = 3; world.grow(a); expect(a.cells).toHaveLength(1);
  a.nutrients = 3; b.nutrients = 0; const total = a.nutrients + b.nutrients;
  connect(world, a, b); world.exchange();
  expect(b.nutrients).toBeGreaterThan(0); expect(a.nutrients + b.nutrients).toBeCloseTo(total, 10);
});

test('several long-lived gardens keep positions, parents and physical graft contacts consistent', () => {
  for (let seed = 1; seed <= 3; seed++) {
    let state = seed; const random = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
    const world = new Jardin({ random });
    for (let tick = 0; tick < 2500; tick++) {
      world.step();
      if (tick % 50) continue;
      const positions = new Set();
      for (const p of world.plants.values()) {
        for (const resource of ['energy', 'water', 'nutrients']) expect(Number.isFinite(p[resource]) && p[resource] >= 0).toBe(true);
        p.cells.forEach(c => {
          expect(world.inside(c.x, c.y)).toBe(true); const i = world.index(c.x, c.y);
          expect(positions.has(i)).toBe(false); positions.add(i);
          expect(world.occupied[i]).toBe(p.id);
          expect(c.parent === null || Boolean(p.cells[c.parent])).toBe(true);
        });
      }
      expect([...world.occupied].filter(Boolean)).toHaveLength(positions.size);
      for (const g of world.grafts.values()) {
        expect(world.occupied[world.index(g.from.x, g.from.y)]).toBe(g.a);
        expect(world.occupied[world.index(g.to.x, g.to.y)]).toBe(g.b);
        expect(Math.abs(g.from.x - g.to.x) + Math.abs(g.from.y - g.to.y)).toBe(1);
      }
    }
  }
});

const thirstyBranch = (source, reverse = false) => {
  const world = new Jardin({ width: 40, height: 20, founders: 0, random: () => 0.5 });
  world.weatherEnabled = false;
  world.moisture.fill(0.30); world.waterRecharge.fill(0.025); world.water.fill(0);
  const plant = world.createPlant(20, 19, randomGenome());
  plant.traits.solar = 0.5; plant.traits.uptake = 0.5; plant.traits.minerals = 0.5; plant.traits.patience = 1;
  const cells = Array.from({ length: 10 }, (_, i) => [20 + i, 19]);
  tissue(world, plant, reverse ? cells.reverse() : cells);
  if (source) { world.moisture[world.index(29, 19)] = 0.9; world.waterRecharge[world.index(29, 19)] = 0.205; }
  // Isolate survival of the same connected body, without growing or producing seeds.
  world.grow = () => {}; world.reproduce = () => {}; world.updateLight();
  return { world, plant };
};

test('one branch touching a fissure sustains a mostly dry body for hundreds of cycles', () => {
  const { world, plant } = thirstyBranch(true);
  for (let i = 0; i < 900; i++) world.step();
  expect(world.plants.has(plant.id)).toBe(true); expect(plant.cells).toHaveLength(10);
  expect(plant.stress).toBe(0); expect(plant.energy).toBeGreaterThan(1); expect(plant.water).toBeGreaterThan(0.03);
  const dry = thirstyBranch(false);
  for (let i = 0; i < 900; i++) dry.world.step();
  expect(dry.world.plants.has(dry.plant.id)).toBe(false);
});

test('collecting before consuming makes a last branch as useful as a first branch and conserves water', () => {
  const first = thirstyBranch(true, true), last = thirstyBranch(true);
  first.plant.water = 0.02; last.plant.water = 0.02;
  for (const { world, plant } of [first, last]) {
    world.stepResources();
    const before = plant.water + [...world.water].reduce((n, value) => n + value, 0);
    world.metabolize(plant);
    const after = plant.water + [...world.water].reduce((n, value) => n + value, 0);
    expect(after).toBeCloseTo(before - plant.waterUse, 6);
    expect(plant.waterUse).toBeCloseTo(plant.photo * 0.32 + plant.cells.length * 0.003, 10);
  }
  expect(first.plant.photo).toBeCloseTo(last.plant.photo, 10);
  expect(first.plant.water).toBeCloseTo(last.plant.water, 10);
});

test('a fissure remains a finite source: a larger dry body cannot live on a single contact indefinitely', () => {
  const { world, plant } = thirstyBranch(true);
  tissue(world, plant, Array.from({length: 20}, (_, i) => [10 + i, 19]));
  world.moisture.fill(0); world.moisture[world.index(29, 19)] = 0.9;
  for (let i = 0; i < 900; i++) world.step();
  expect(plant.cells.length < 20 || !world.plants.has(plant.id)).toBe(true);
});

test('outside fissures there is more background water, and surplus rain still fades gradually', () => {
  const world = new Jardin({founders: 0});
  const low = Math.min(...world.moisture), high = Math.max(...world.moisture);
  expect(low).toBeGreaterThanOrEqual(0.299); expect(high / low).toBeLessThan(3.1);
  world.rain = 0; world.water.fill(1); world.stepResources();
  expect(world.water[0]).toBeCloseTo(0.975);
  expect([...world.water].every(value => Math.abs(value - 0.975) < 0.00001)).toBe(true);
});
