import { assignSkill, BUILD_STEPS, createGame, MAX_FALL, releaseBlocker, stepGame, TICK_MS } from './engine';
import { LEVELS } from './levels';

const level = LEVELS[0];
const walker = (overrides = {}) => ({ id: 0, x: 6, y: 9, direction: 1, status: 'walking', fall: 0, actionTicks: 0, steps: 0, ...overrides });
function withLemming(l, customLevel = level) {
  return { ...createGame(customLevel), lemmings: [l], released: customLevel.total };
}

test('digging removes earth layer by layer without mutating the initial level', () => {
  const original = withLemming(walker());
  let game = assignSkill(original, 0, 'digger');
  for (let i = 0; i < 9; i++) game = stepGame(game, level);
  expect(game.terrain[10][6]).toBe('.');
  expect(game.terrain[11][6]).toBe('.');
  expect(game.terrain[12][6]).toBe('.');
  expect(original.terrain[10][6]).toBe('#');
  expect(createGame(level).terrain[10][6]).toBe('#');
  expect(game.skills.digger).toBe(level.skills.digger - 1);
});

test('invalid jobs, empty stocks and rock digging consume no capacity', () => {
  const state = withLemming(walker({ x: 20, y: 23 }));
  expect(assignSkill(state, 0, 'digger')).toBe(state);
  expect(assignSkill(state, 0, 'unknown')).toBe(state);
  const falling = withLemming(walker({ status: 'falling', y: 3 }));
  expect(assignSkill(falling, 0, 'blocker')).toBe(falling);
  const empty = { ...state, skills: { ...state.skills, builder: 0 } };
  expect(assignSkill(empty, 0, 'builder')).toBe(empty);
});

test('a blocker reverses a walker and falls if its support disappears', () => {
  let state = withLemming(walker({ x: 5 }));
  state.lemmings.push(walker({ id: 1, x: 6, status: 'blocking' }));
  state = stepGame(state, level);
  expect(state.lemmings[0].direction).toBe(-1);
  expect(state.lemmings[0].x).toBe(5);
  state.terrain[10][6] = '.';
  state = stepGame(state, level);
  expect(state.lemmings[1].status).toBe('falling');
});

test('a builder spans the ravine and a follower can climb the completed stairs', () => {
  let state = assignSkill(withLemming(walker({ x: 28, y: 23 })), 0, 'builder');
  for (let i = 0; i < BUILD_STEPS * 4; i++) state = stepGame(state, level);
  expect(state.lemmings[0]).toMatchObject({ x: 40, y: 11, status: 'walking' });
  state.lemmings.push(walker({ id: 1, x: 28, y: 23 }));
  for (let i = 0; i < 100; i++) state = stepGame(state, level);
  expect(state.lemmings.every(l => l.status === 'saved')).toBe(true);
});

test('releasing a blocker with no stock lets the troupe through without refunding or spending skills', () => {
  const original = withLemming(walker({ x: 6, status: 'blocking' }));
  original.skills.blocker = 0;
  original.lemmings.push(walker({ id: 1, x: 5 }));
  const released = releaseBlocker(original, 0);
  expect(original.lemmings[0].status).toBe('blocking');
  expect(released.skills).toEqual(original.skills);
  const next = stepGame(released, level);
  expect(next.lemmings[0]).toMatchObject({ x: 7, status: 'walking' });
  expect(next.lemmings[1]).toMatchObject({ x: 6, direction: 1 });
  expect(releaseBlocker(released, 0)).toBe(released);
  expect(releaseBlocker({ ...original, result: 'lost' }, 0).result).toBe('lost');
});

test('building stops at rock without erasing it', () => {
  let state = assignSkill(withLemming(walker({ x: 24, y: 9 })), 0, 'builder');
  for (let i = 0; i < 4; i++) state = stepGame(state, level);
  expect(state.terrain[9][25]).toBe('X');
  expect(state.lemmings[0]).toMatchObject({ status: 'walking', direction: -1 });
});

test('a dangerous fall is fatal even inside the exit', () => {
  let state = withLemming(walker({ x: 56, y: 23, status: 'falling', fall: MAX_FALL + 1 }));
  state = stepGame(state, level);
  expect(state.saved).toBe(0);
  expect(state.lost).toBe(1);
});

test('the first level can save its target using digging and a bridge', () => {
  let state = createGame(level);
  let dug = false;
  let built = false;
  for (let i = 0; i < 1400 && !state.result; i++) {
    const digger = state.lemmings.find(l => l.status === 'walking' && l.y === 9 && l.x === 10);
    if (!dug && digger) { state = assignSkill(state, digger.id, 'digger'); dug = true; }
    const builder = state.lemmings.find(l => l.status === 'walking' && l.y === 23 && l.x === 28 && l.direction === 1);
    if (!built && builder) { state = assignSkill(state, builder.id, 'builder'); built = true; }
    state = stepGame(state, level);
  }
  expect(dug && built).toBe(true);
  expect(state.saved).toBeGreaterThanOrEqual(level.required);
  expect(state.result).toBe('won');
  expect(state.saved + state.lost).toBe(level.total);
});

test('timeout accounts for everyone, and a restart restores stocks and terrain', () => {
  const short = { ...level, timeSeconds: TICK_MS / 1000 };
  const state = stepGame(createGame(short), short);
  expect(state.result).toBe('lost');
  expect(state.lost).toBe(short.total);
  expect(stepGame(state, short)).toBe(state);
  expect(createGame(level).skills).toEqual(level.skills);
});

test('a different level layout, population and exit use the same engine', () => {
  const tiny = { ...level, width: 12, height: 8, terrain: [{ rect: [0, 6, 12, 2], material: 'X' }], spawn: { x: 2, y: 2 }, exit: { x: 8, y: 3, width: 2, height: 3 }, total: 3, required: 3, releaseEvery: 10 };
  let state = createGame(tiny);
  for (let i = 0; i < 100 && !state.result; i++) state = stepGame(state, tiny);
  expect(state.result).toBe('won');
  expect(state.saved).toBe(3);
});
