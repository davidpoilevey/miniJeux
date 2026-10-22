import { createLevel, sendFleet, step, previewShot, planetPos, sunSurvival, LEVELS, PLAYER, NEUTRAL, C } from './engine';

test('chaque niveau est équitable : les foyers sont symétriques et les neutres répétés par joueur', () => {
  LEVELS.forEach((_, i) => {
    const s = createLevel(i, 42);
    const homes = s.planets.filter(p => p.owner !== NEUTRAL);
    expect(homes).toHaveLength(s.players.length);
    expect(new Set(homes.map(p => p.r)).size).toBe(1);
    expect(s.planets.filter(p => p.owner === NEUTRAL).length % s.players.length).toBe(0);
  });
});

test('une flotte arrive pile sur la planète en mouvement', () => {
  const s = createLevel(0, 7);
  s.ais = [];
  const src = s.planets.find(p => p.owner === PLAYER);
  const tgt = s.planets.find(p => p.owner === NEUTRAL && sunSurvival(s, src, previewShot(s, src, p)) === 1);
  const f = sendFleet(s, src, tgt, 1);
  const arrival = f.t0 + f.T;
  while (s.t < arrival - 1 / 60) step(s, 1 / 60);
  const there = planetPos(tgt, arrival);
  expect(Math.hypot(f.x1 - there.x, f.y1 - there.y)).toBeLessThan(tgt.rad);
});

test('traverser le soleil coûte cher, le contourner rien du tout', () => {
  const s = createLevel(0, 1);
  expect(sunSurvival(s, { x: C - 300, y: C }, { x: C + 300, y: C })).toBeLessThan(0.2);
  expect(sunSurvival(s, { x: C - 300, y: C - 200 }, { x: C + 300, y: C - 200 })).toBe(1);
});

test('une flotte suffisante capture la cible', () => {
  const s = createLevel(0, 3);
  s.ais = [];
  const src = s.planets.find(p => p.owner === PLAYER);
  src.ships = 500;
  const tgt = s.planets.find(p => p.owner === NEUTRAL);
  sendFleet(s, src, tgt, 400);
  for (let i = 0; i < 60 * 30 && tgt.owner !== PLAYER; i++) step(s, 1 / 60);
  expect(tgt.owner).toBe(PLAYER);
});
