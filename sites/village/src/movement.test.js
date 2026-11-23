import assert from 'node:assert/strict';
import { test } from 'node:test';
import { villageMap } from './map.js';
import { advance, advanceToward, canStand, nearbyDoor } from './movement.js';
import { findRoute } from './route.js';

function follow(start, route) {
  let player = start;
  for (const waypoint of route) {
    for (let tick = 0; tick < 2000; tick++) {
      if (player.x === waypoint.x && player.y === waypoint.y) break;
      player = advanceToward(player, waypoint, 16);
      assert.ok(canStand(player.x, player.y), `bloqué en ${player.x},${player.y}`);
    }
    assert.equal(player.x, waypoint.x);
    assert.equal(player.y, waypoint.y);
  }
  return player;
}

test('the spawn point is on the street, away from every door', () => {
  assert.ok(canStand(villageMap.spawn.x, villageMap.spawn.y));
  assert.equal(nearbyDoor(villageMap.spawn), undefined);
});

test('every return point is outside the walls and in front of its own door', () => {
  for (const [id, { resume }] of Object.entries(villageMap.doors)) {
    assert.ok(canStand(resume.x, resume.y), id);
    assert.equal(nearbyDoor(resume), id);
  }
});

test('a clicked route reaches every door from the spawn without crossing a wall', () => {
  for (const [id, { resume }] of Object.entries(villageMap.doors)) {
    const route = findRoute(villageMap.spawn, resume);
    assert.ok(route.length, `pas de chemin vers ${id}`);
    assert.equal(nearbyDoor(follow(villageMap.spawn, route)), id);
  }
});

test('walking with the keys up the alley reaches the upper lane', () => {
  let player = { x: 560, y: 510, facing: 'down' };
  for (let i = 0; i < 200; i++) player = advance(player, ['up'], 16);
  assert.ok(player.y < 320 && canStand(player.x, player.y));
});

test('opposite directions cancel and diagonals preserve walking speed', () => {
  const spawn = villageMap.spawn;
  assert.equal(advance(spawn, ['left', 'right'], 16), spawn);
  const diagonal = advance(spawn, ['right', 'down'], 16);
  const straight = advance(spawn, ['right', 'right'], 16);
  assert.ok(Math.abs(diagonal.distance - straight.distance) < 1e-9);
});

test('clicking inside a building is ignored and an edge click stays inside the map', () => {
  assert.deepEqual(findRoute(villageMap.spawn, { x: 420, y: 380 }), []);
  const target = findRoute(villageMap.spawn, { x: 0, y: 510 }).at(-1);
  assert.ok(target.x > 0 && canStand(target.x, target.y));
});
