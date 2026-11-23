import { villageMap } from './map.js';

const speed = 132;
const playerRadius = 9;

export const walkingBounds = {
  left: playerRadius,
  top: playerRadius,
  right: villageMap.width - playerRadius,
  bottom: villageMap.height - playerRadius,
};

export const blockedAreas = villageMap.obstacles.map(({ x, y, width, height }) => ({
  left: x - playerRadius,
  top: y - playerRadius,
  right: x + width + playerRadius,
  bottom: y + height + playerRadius,
}));

const vectors = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export function canStand(x, y) {
  if (x < walkingBounds.left || x > walkingBounds.right ||
      y < walkingBounds.top || y > walkingBounds.bottom) return false;

  return blockedAreas.every(({ left, top, right, bottom }) => (
    x <= left || x >= right || y <= top || y >= bottom
  ));
}

function stepDistance(elapsed) {
  return speed * Math.min(elapsed, 32) / 1000;
}

function move(player, x, y, facing) {
  if (x === player.x && y === player.y && facing === player.facing) return player;
  return { x, y, facing, distance: (player.distance ?? 0) + Math.hypot(x - player.x, y - player.y) };
}

export function advance(player, directions, elapsed) {
  let dx = 0;
  let dy = 0;
  let facing;

  for (const direction of new Set(directions)) {
    const vector = vectors[direction];
    dx += vector.x;
    dy += vector.y;
    facing = direction;
  }

  const length = Math.hypot(dx, dy);
  if (!length) return player;

  if (!dx) facing = dy < 0 ? 'up' : 'down';
  else if (!dy) facing = dx < 0 ? 'left' : 'right';

  const distance = stepDistance(elapsed);
  const nextX = player.x + dx * distance / length;
  const nextY = player.y + dy * distance / length;
  const x = canStand(nextX, player.y) ? nextX : player.x;
  const y = canStand(x, nextY) ? nextY : player.y;

  return move(player, x, y, facing);
}

export function advanceToward(player, target, elapsed) {
  const dx = target.x - player.x;
  const dy = target.y - player.y;
  const length = Math.hypot(dx, dy);
  if (!length) return player;

  const distance = stepDistance(elapsed);
  const x = distance >= length ? target.x : player.x + dx * distance / length;
  const y = distance >= length ? target.y : player.y + dy * distance / length;
  if (!canStand(x, y)) return player;

  const facing = Math.abs(dx) > Math.abs(dy)
    ? (dx < 0 ? 'left' : 'right')
    : (dy < 0 ? 'up' : 'down');
  return move(player, x, y, facing);
}

export function nearbyDoor(player) {
  return Object.keys(villageMap.doors).find((id) => {
    const { x, y, radius } = villageMap.doors[id].approach;
    return Math.hypot(x - player.x, y - player.y) <= radius;
  });
}
