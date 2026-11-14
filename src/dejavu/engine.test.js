import { createGame, start, step, setAim, echoPos, targetTtl, GRACE, W, H, BONUS_EVERY, FREEZE_TICKS, EAT_POINTS } from './engine';

const goTo = (s, x, y, max = 2000) => {
  setAim(s, x, y);
  for (let i = 0; i < max && s.phase === 'playing' && Math.hypot(s.x - x, s.y - y) > 0.5; i++) step(s);
};
const pick = s => { const n = s.picks; const { x, y } = s.target; goTo(s, x, y); return s.picks === n + 1; };

test('rien ne bouge ni ne presse tant que la partie n’a pas commencé', () => {
  const s = createGame(3);
  for (let i = 0; i < 1000; i++) step(s);
  expect(s.phase).toBe('ready');
  expect(s.echoes).toHaveLength(0);
});

test('ramasser une pastille crée un écho qui rejoue exactement le trajet, en aller-retour', () => {
  const s = createGame(5);
  start(s);
  const x0 = s.x, y0 = s.y;
  expect(pick(s)).toBe(true);
  expect(s.echoes).toHaveLength(1);
  const e = s.echoes[0];
  const n = e.pts.length / 2;
  expect(echoPos(e, e.born)).toEqual([x0, y0]);
  expect(echoPos(e, e.born + n - 1)).toEqual([e.pts[2 * n - 2], e.pts[2 * n - 1]]);
  expect(echoPos(e, e.born + 2 * (n - 1))).toEqual([x0, y0]);
});

test('rester planté à l’arrivée : ton écho finit par te rentrer dedans', () => {
  const s = createGame(5);
  start(s);
  setAim(s, s.target.x, s.target.y);
  while (s.picks === 0) step(s);
  setAim(s, s.x, s.y); // pile là où le trajet s'est terminé
  s.target.ttl = 1e9; // on isole la collision du chrono
  for (let i = 0; i < 2000 && s.phase === 'playing'; i++) step(s);
  expect(s.phase).toBe('dead');
  expect(s.cause.by).toBe('echo');
});

test('un écho naissant est inoffensif pendant sa période de grâce', () => {
  const s = createGame(8);
  start(s);
  setAim(s, s.x + 4, s.y); step(s); step(s);
  s.echoes.push({ pts: [s.x, s.y, s.x, s.y], born: s.etick, madeAt: s.tick, hue: 0 });
  s.target.ttl = 1e9;
  for (let i = 0; i < GRACE - 2; i++) step(s);
  expect(s.phase).toBe('playing');
  step(s); step(s); step(s);
  expect(s.phase).toBe('dead');
});

test('laisser filer le chrono de la pastille met fin à la partie', () => {
  const s = createGame(2);
  start(s);
  for (let i = 0; i < targetTtl(0) + 2; i++) step(s);
  expect(s.cause.by).toBe('timeout');
});

test('même graine, mêmes pastilles — et toujours dans l’arène', () => {
  const a = createGame(99), b = createGame(99);
  start(a); start(b);
  for (let i = 0; i < 6; i++) {
    expect(a.target.x).toBe(b.target.x);
    expect(a.target.x).toBeGreaterThan(0); expect(a.target.x).toBeLessThan(W);
    expect(a.target.y).toBeGreaterThan(0); expect(a.target.y).toBeLessThan(H);
    a.echoes.length = 0; b.echoes.length = 0; // pas de collision : on ne teste que le tirage
    pick(a); pick(b);
    a.echoes.length = 0; b.echoes.length = 0;
  }
});

// --- bonus ---
const still = (s, x, y) => ({ pts: [x, y, x, y], born: s.etick - GRACE, madeAt: s.tick, hue: 0 });
const give = (s, kind) => { s.bonus = { x: s.x, y: s.y, kind, born: s.tick, ttl: 999 }; step(s); };
const fresh = () => { const s = createGame(11); start(s); s.target.ttl = 1e9; s.target.x = 30; s.target.y = 60; return s; };

test('un bonus apparaît toutes les quelques pastilles', () => {
  const s = createGame(4);
  start(s);
  for (let i = 0; i < BONUS_EVERY; i++) { expect(s.bonus).toBeNull(); pick(s); s.echoes.length = 0; }
  expect(['oubli', 'gel', 'lucide']).toContain(s.bonus.kind);
});

test('oubli efface les deux plus vieux échos', () => {
  const s = fresh();
  s.echoes.push(still(s, 300, 100), still(s, 300, 200), still(s, 300, 300));
  const keep = s.echoes[2];
  give(s, 'oubli');
  expect(s.echoes).toEqual([keep]);
});

test('gel : les échos ne bougent plus, puis repartent', () => {
  const s = fresh();
  s.echoes.push({ pts: [300, 100, 301, 100, 302, 100, 303, 100], born: s.etick - GRACE, madeAt: 0, hue: 0 });
  give(s, 'gel');
  const p0 = echoPos(s.echoes[0], s.etick);
  for (let i = 0; i < FREEZE_TICKS - 1; i++) step(s);
  expect(echoPos(s.echoes[0], s.etick)).toEqual(p0);
  step(s); step(s);
  expect(echoPos(s.echoes[0], s.etick)).not.toEqual(p0);
});

test('lucidité : toucher un écho le gobe au lieu de tuer', () => {
  const s = fresh();
  give(s, 'lucide');
  s.echoes.push(still(s, s.x, s.y));
  step(s);
  expect(s.phase).toBe('playing');
  expect(s.echoes).toHaveLength(0);
  expect(s.score).toBe(EAT_POINTS);
});
