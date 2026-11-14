import {
  createGame, startNight, step, setBeamTarget, inBeam, horn, chooseUpgrade, nightPlan,
  CX, CY, DAWN_TICKS, FEAR_TIME, DT, W, H,
} from './engine';

// Une nuit vide, sans récif ni file d'attente, pour poser ses propres pions.
const bay = () => {
  const s = createGame(7);
  startNight(s);
  s.queue = []; s.rocks = []; s.monsters = [];
  return s;
};
const boat = (s, x, y, type = 'barque') => {
  const b = { id: s.nextId++, type, x, y, h: Math.atan2(CY - y, CX - x), state: 'sailing', lit: false, memory: 0, danger: false, t: 0, trail: [], cause: null, look: 0 };
  s.boats.push(b);
  return b;
};
const rock = (s, x, y, r = 16) => { const k = { x, y, r, beacon: false, kills: 0, born: 0, shape: [1, 1, 1, 1, 1, 1, 1] }; s.rocks.push(k); return k; };
const point = (s, x, y) => { setBeamTarget(s, x, y); s.beam.a = s.beam.target; };
const run = (s, ticks, each) => { for (let i = 0; i < ticks && s.phase === 'night'; i++) { each?.(); step(s); } };

test('dans le noir, un bateau fonce droit sur le récif qui barre sa route', () => {
  const s = bay();
  rock(s, CX + 160, CY);
  boat(s, CX + 300, CY);
  point(s, CX, CY - 200); // le faisceau regarde ailleurs
  run(s, 600);
  expect(s.wrecks).toBe(1);
  expect(s.rocks[0].kills).toBe(1);
});

test('le même bateau, suivi par le faisceau, contourne et rentre au port', () => {
  const s = bay();
  rock(s, CX + 160, CY);
  const b = boat(s, CX + 300, CY);
  run(s, 1200, () => point(s, b.x, b.y));
  expect(s.wrecks).toBe(0);
  expect(s.saved).toBe(1);
  expect(s.moored).toHaveLength(1);
});

test('la mémoire est courte : éclairé trop tôt puis abandonné, il retourne taper', () => {
  const s = bay();
  rock(s, CX + 120, CY);
  const b = boat(s, CX + 300, CY);
  run(s, 60, () => point(s, b.x, b.y)); // un coup de projecteur de loin…
  point(s, CX, CY - 200);               // …puis on regarde ailleurs
  run(s, 800);
  expect(s.wrecks).toBe(1);
});

test('un récif balisé est évité sans aucune lumière', () => {
  const s = bay();
  rock(s, CX + 160, CY).beacon = true;
  boat(s, CX + 300, CY);
  point(s, CX, CY - 200);
  run(s, 1200);
  expect(s.wrecks).toBe(0);
  expect(s.saved).toBe(1);
});

test('la corne de brume réveille tout le monde, une fois par nuit', () => {
  const s = bay();
  rock(s, CX + 110, CY);
  const b = boat(s, CX + 215, CY);
  point(s, CX, CY - 200);
  expect(horn(s)).toBe(true);
  expect(horn(s)).toBe(false);
  step(s);
  expect(b.aware).toBe(true);
  run(s, 600);
  expect(s.wrecks).toBe(0);
});

test('la lentille est lourde : le faisceau ne saute pas, il tourne', () => {
  const s = bay();
  point(s, CX + 100, CY);
  setBeamTarget(s, CX - 100, CY);
  step(s);
  expect(Math.abs(s.beam.a)).toBeLessThan(0.1);
  expect(inBeam(s, CX - 100, CY)).toBe(false);
  for (let i = 0; i < 120; i++) step(s);
  expect(inBeam(s, CX - 100, CY)).toBe(true);
});

test('la Chose emporte un bateau dans le noir, mais replonge sous la lumière', () => {
  const dark = bay();
  boat(dark, CX + 250, CY, 'cargo');
  dark.monsters = [{ state: 'hunt', x: CX + 250, y: CY + 60, target: dark.boats[0].id, fear: 0, lit: false, born: 0, t: 0 }];
  point(dark, CX, CY - 200);
  run(dark, 400);
  expect(dark.wrecks).toBe(1);

  const lit = bay();
  boat(lit, CX + 250, CY, 'cargo');
  const m = { state: 'hunt', x: CX + 250, y: CY + 60, target: lit.boats[0].id, fear: 0, lit: false, born: 0, t: 0 };
  lit.monsters = [m];
  run(lit, Math.ceil(FEAR_TIME / DT) + 5, () => point(lit, m.x, m.y));
  expect(m.state).toBe('under');
  expect(lit.wrecks).toBe(0);
});

test('trois naufrages : on rend les clés', () => {
  const s = bay();
  rock(s, CX + 150, CY); rock(s, CX - 150, CY); rock(s, CX, CY + 150);
  boat(s, CX + 300, CY); boat(s, CX - 300, CY); boat(s, CX, CY + 300);
  point(s, CX, CY - 200);
  run(s, 900);
  expect(s.phase).toBe('over');
});

test('fin de nuit : l’aube, trois offres, et l’amélioration choisie s’applique à la nuit suivante', () => {
  const s = bay();
  rock(s, CX - 200, CY - 200); // hors de la route : de quoi poser une bouée si c'est l'offre tirée
  boat(s, CX + 80, CY);
  run(s, 300);
  expect(s.phase).toBe('dawn');
  expect(s.stats.bonus).toBe(20); // nuit parfaite
  for (let i = 0; i < DAWN_TICKS; i++) step(s);
  expect(s.phase).toBe('shop');
  expect(new Set(s.offers).size).toBe(3);
  const half = s.beam.half, max = s.maxWrecks, horns = s.mods.horn, mem = s.mods.memory, speed = s.beam.speed;
  expect(chooseUpgrade(s, 'pas-en-rayon')).toBe(false);
  expect(chooseUpgrade(s, s.offers[0])).toBe(true);
  expect(s.phase).toBe('night');
  expect(s.night).toBe(2);
  const changed = s.beam.half > half || s.maxWrecks > max || s.mods.horn > horns || s.mods.memory > mem || s.beam.speed > speed || s.rocks.some(r => r.beacon);
  expect(changed).toBe(true);
});

test('la baie est navigable : récifs espacés, dans le champ, et de plus en plus nombreux', () => {
  for (let seed = 1; seed <= 30; seed++) {
    const s = createGame(seed);
    for (let n = 1; n <= 8; n++) {
      startNight(s);
      expect(s.rocks).toHaveLength(nightPlan(n).rocks);
    }
    s.rocks.forEach((a, i) => {
      expect(a.x - a.r).toBeGreaterThan(0); expect(a.x + a.r).toBeLessThan(W);
      expect(a.y - a.r).toBeGreaterThan(0); expect(a.y + a.r).toBeLessThan(H);
      s.rocks.slice(i + 1).forEach(b => expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThanOrEqual(a.r + b.r + 46));
    });
  }
});
