import { createGame, DIRECTIONS, findPath, nextRoom, ROOMS, sameTile, sightTiles, takeTurn, walkable } from './engine';

const move = (dx, dy) => ({ type: 'move', dx, dy });
const guardAt = (x, y) => ({ ...createGame(0).guards[0], x, y });
const freeze = value => {
  Object.freeze(value);
  Object.values(value).forEach(child => { if (child && typeof child === 'object' && !Object.isFrozen(child)) freeze(child); });
  return value;
};

test.each(ROOMS.map((room, index) => [index + 1, room]))('room %i has connected floors and reachable objectives', (_, room) => {
  const y = room.map.findIndex(row => row.includes('S'));
  const start = { x: room.map[y].indexOf('S'), y };
  expect(room.map.every(row => row.length === 13)).toBe(true);
  room.map.forEach((row, tileY) => [...row].forEach((tile, tileX) => {
    if (tile !== '#') expect(findPath(room, start, { x: tileX, y: tileY }).length).toBeGreaterThan(0);
  }));
  [...room.jewels, ...room.patrols.flat()].forEach(p => expect(walkable(room, p)).toBe(true));
});

test('walls and invalid moves consume no turn; previous states remain immutable', () => {
  const game = freeze(createGame(0));
  expect(takeTurn(game, move(-1, 0))).toBe(game);
  expect(takeTurn(game, move(4, 0))).toBe(game);
  const next = takeTurn(game, move(0, -1));
  expect(next.turns).toBe(1);
  expect(game.player).toEqual({ x: 1, y: 9 });
  expect(next.player).toEqual({ x: 1, y: 8 });
});

test('the displayed sight stops at walls and reaches at most five tiles', () => {
  const tiles = sightTiles(ROOMS[0], { x: 1, y: 1 });
  expect(tiles).toContainEqual({ x: 5, y: 1 });
  expect(tiles).not.toContainEqual({ x: 7, y: 1 });
  expect(tiles).toContainEqual({ x: 1, y: 6 });
  expect(tiles).not.toContainEqual({ x: 1, y: 7 });
});

test('a guard investigates nearby footsteps but cannot hear a silent wait', () => {
  const game = { ...createGame(0), player: { x: 1, y: 5 }, guards: [guardAt(1, 6)] };
  expect(takeTurn(game, move(1, 0)).guards[0].mode).toBe('search');
  const silent = { ...game, player: { x: 2, y: 5 } };
  expect(takeTurn(silent, { type: 'wait' }).guards[0].mode).toBe('patrol');
});

test('a decoy redirects a distant guard for six turns, costs one turn, and expires', () => {
  const game = createGame(0);
  const target = { x: 11, y: 9 };
  const next = takeTurn(game, { type: 'lure', target });
  expect(next.lures).toBe(2);
  expect(next.turns).toBe(1);
  expect(next.lure.ttl).toBe(6);
  expect(next.guards[0].mode).toBe('lure');
  expect(next.guards[0].target).toEqual(target);
  expect(next.guards[0]).toMatchObject(findPath(ROOMS[0], game.guards[0], target)[1]);
  let expired = { ...next, guards: [] };
  for (let i = 0; i < 6; i += 1) expired = takeTurn(expired, { type: 'wait' });
  expect(expired.lure).toBeNull();
  expect(takeTurn({ ...game, lures: 0 }, { type: 'lure', target }).turns).toBe(0);
  expect(takeTurn(game, { type: 'lure', target: { x: 0, y: 0 } })).toBe(game);
});

test('seeing the player takes priority over a decoy', () => {
  const game = { ...createGame(0), player: { x: 5, y: 1 }, guards: [guardAt(1, 1)] };
  const next = takeTurn(game, { type: 'lure', target: { x: 11, y: 9 } });
  expect(next.guards[0].mode).toBe('chase');
  expect(next.guards[0].target).toEqual(game.player);
});

test('guards forget a lost trail and resume their patrol instead of tracking through walls', () => {
  let game = { ...createGame(0), guards: [{ ...guardAt(11, 1), mode: 'chase', target: { x: 9, y: 1 }, memory: 2 }] };
  for (let i = 0; i < 3; i += 1) game = takeTurn(game, { type: 'wait' });
  expect(game.guards[0].mode).toBe('patrol');
  expect(game.guards[0].target).toBeNull();
});

test('the fourth turn gives a pursuing guard two steps; normal turns give one', () => {
  const game = { ...createGame(0), player: { x: 5, y: 1 }, guards: [guardAt(1, 1)] };
  expect(takeTurn({ ...game, roomTurns: 2 }, { type: 'wait' }).guards[0].x).toBe(2);
  expect(takeTurn({ ...game, roomTurns: 3 }, { type: 'wait' }).guards[0].x).toBe(3);
});

test('walking onto a guard or being reached costs exactly one heart, preserves loot, and resets patrols', () => {
  const game = { ...createGame(0), player: { x: 1, y: 5 }, guards: [guardAt(2, 5)], collected: 1, score: 120 };
  const caught = takeTurn(game, move(1, 0));
  expect(caught).toMatchObject({ hearts: 2, hits: 1, collected: 1, score: 120, player: { x: 1, y: 9 } });
  expect(caught.jewels).toEqual(game.jewels);
  expect(caught.guards).toEqual(createGame(0).guards);
  const approached = takeTurn({ ...game, guards: [guardAt(3, 5)] }, move(1, 0));
  expect(approached.hearts).toBe(2);
  const lost = takeTurn({ ...game, hearts: 1 }, move(1, 0));
  expect(lost.phase).toBe('lost');
  expect(takeTurn(lost, { type: 'wait' })).toBe(lost);
});

test('collecting cannot duplicate a jewel and a locked exit does not end the room', () => {
  let game = { ...createGame(0), player: { x: 1, y: 1 }, guards: [] };
  game = takeTurn(game, move(1, 0));
  expect(game.score).toBe(120);
  expect(game.jewels).toHaveLength(2);
  game = takeTurn(game, { type: 'wait' });
  expect(game.score).toBe(120);
  expect(takeTurn({ ...game, player: game.exit }, { type: 'wait' }).phase).toBe('playing');
});

test('all three rooms can be completed, with score and hearts carried forward', () => {
  let game = createGame(0);
  for (let roomIndex = 0; roomIndex < 3; roomIndex += 1) {
    // Isolate objective/transition rules from guard strategy in this test.
    game = { ...game, guards: [] };
    for (const target of [...game.jewels, game.exit]) {
      const path = findPath(ROOMS[roomIndex], game.player, target);
      for (const step of path.slice(1)) game = takeTurn(game, move(step.x - game.player.x, step.y - game.player.y));
      expect(sameTile(game.player, target)).toBe(true);
    }
    expect(game.phase).toBe(roomIndex === 2 ? 'won' : 'cleared');
    if (roomIndex < 2) {
      const score = game.score;
      game = nextRoom(game);
      expect(game).toMatchObject({ roomIndex: roomIndex + 1, hearts: 3, lures: 3, score, roomTurns: 0 });
    }
  }
  expect(game.collected).toBe(9);
  expect(game.score).toBeGreaterThanOrEqual(1530);
});

test('a complete heist with live guards can be won without losing a heart', () => {
  const directions = { U: [0, -1], R: [1, 0], D: [0, 1], L: [-1, 0] };
  const routes = [
    ['UUUUUUUURRRDD', { x: 11, y: 1 }, 'DDRDDRRRDRRURUUUUUU'],
    ['', { x: 1, y: 1 }, 'UUUURRUULLUURRWRRDRDDDRRRDDDRRDUUUUUUUU'],
    ['UUUUUUUUR', { x: 1, y: 9 }, 'RRDDDDRDRRRDRRRUUUUUU'],
  ];
  let game = createGame(0);
  for (const [before, target, after] of routes) {
    for (const part of [before, { type: 'lure', target }, after]) {
      const actions = typeof part === 'string' ? [...part].map(c => c === 'W' ? { type: 'wait' } : move(...directions[c])) : [part];
      actions.forEach(action => { game = takeTurn(game, action); });
    }
    expect(game.hearts).toBe(3);
    expect(['cleared', 'won']).toContain(game.phase);
    if (game.phase === 'cleared') game = nextRoom(game);
  }
  expect(game).toMatchObject({ phase: 'won', collected: 9, hearts: 3 });
});

test('every starting patrol configuration offers a safe first movement in every room', () => {
  for (let seed = 0; seed < 12; seed += 1) {
    let game = createGame(seed);
    for (let roomIndex = 0; roomIndex < 3; roomIndex += 1) {
      const hasSafeMove = DIRECTIONS.some(d => {
        const next = takeTurn(game, move(d.x, d.y));
        return next !== game && next.hearts === game.hearts;
      });
      expect(hasSafeMove).toBe(true);
      if (roomIndex < 2) game = nextRoom({ ...game, phase: 'cleared' });
    }
  }
});

test('deterministic games retain valid geometry and bounded resources over varied actions', () => {
  for (let seed = 0; seed < 15; seed += 1) {
    let game = createGame(seed);
    for (let turn = 0; turn < 100; turn += 1) {
      const d = DIRECTIONS[(turn * 3 + seed) % 4];
      game = takeTurn(game, turn % 7 ? move(d.x, d.y) : { type: 'wait' });
      expect(walkable(ROOMS[game.roomIndex], game.player)).toBe(true);
      game.guards.forEach(g => expect(walkable(ROOMS[game.roomIndex], g)).toBe(true));
      expect(game.hearts).toBeGreaterThanOrEqual(0);
      expect(game.lures).toBeGreaterThanOrEqual(0);
      expect(Number.isFinite(game.score)).toBe(true);
    }
  }
});
