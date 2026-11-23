import assert from 'node:assert/strict';
import { test } from 'node:test';
import { villageMap } from './map.js';
import { advance, advanceToward, canStand, nearbyDoor } from './movement.js';
import { findRoute } from './route.js';

function walk(start, directions, steps) {
  let player = start;
  for (let i = 0; i < steps; i++) player = advance(player, directions, 16);
  return player;
}

test('the entrance route goes around the wall and reaches the door from the street', () => {
  let player = walk(villageMap.spawn, ['right'], 80);
  assert.ok(player.x > 220 && player.x < 235);
  assert.equal(player.y, villageMap.spawn.y);
  assert.equal(nearbyDoor(player), undefined);

  player = walk(player, ['down'], 44);
  player = walk(player, ['right'], 89);
  assert.equal(nearbyDoor(player), 'pivot');
  assert.ok(canStand(player.x, player.y));
});

test('the requested return point is outside the obstacle and inside the interaction zone', () => {
  const { resume } = villageMap.doors.pivot;
  assert.ok(canStand(resume.x, resume.y));
  assert.equal(nearbyDoor(resume), 'pivot');
});

test('opposite directions cancel and diagonals preserve walking speed', () => {
  const spawn = villageMap.spawn;
  assert.equal(advance(spawn, ['left', 'right'], 16), spawn);
  const diagonal = advance(spawn, ['right', 'down'], 16);
  const straight = advance(spawn, ['right', 'right'], 16);
  assert.ok(Math.abs(diagonal.distance - straight.distance) < 1e-9);
});

test('clicking clear ground leads directly to the exact destination', () => {
  const target = { x: 180, y: 190 };
  assert.deepEqual(findRoute(villageMap.spawn, target), [target]);
  const close = { x: target.x - 1, y: target.y, facing: 'left' };
  assert.deepEqual(advanceToward(close, target, 16), { ...target, facing: 'right', distance: 1 });
});

test('a route around the house keeps every step out of the wall and reaches the threshold', () => {
  const { resume } = villageMap.doors.pivot;
  const route = findRoute(villageMap.spawn, resume);
  assert.ok(route.length > 1);

  let player = villageMap.spawn;
  for (const waypoint of route) {
    for (let tick = 0; tick < 400; tick++) {
      if (player.x === waypoint.x && player.y === waypoint.y) break;
      player = advanceToward(player, waypoint, 16);
      assert.ok(canStand(player.x, player.y));
    }
    assert.equal(player.x, waypoint.x);
    assert.equal(player.y, waypoint.y);
  }
  assert.equal(nearbyDoor(player), 'pivot');
});

test('clicking inside the house is ignored and an edge click stays inside the map', () => {
  assert.deepEqual(findRoute(villageMap.spawn, { x: 390, y: 130 }), []);
  const route = findRoute(villageMap.spawn, { x: 0, y: 175 });
  const target = route.at(-1);
  assert.ok(target.x > 0 && canStand(target.x, target.y));
});
