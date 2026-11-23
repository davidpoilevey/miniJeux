import { blockedAreas, canStand, walkingBounds } from './movement.js';

function insideInterval(start, end, min, max) {
  if (start === end) {
    return start > min && start < max ? [-Infinity, Infinity] : [Infinity, -Infinity];
  }
  const first = (min - start) / (end - start);
  const last = (max - start) / (end - start);
  return [Math.min(first, last), Math.max(first, last)];
}

function isClear(from, to) {
  return blockedAreas.every(({ left, top, right, bottom }) => {
    const [enterX, exitX] = insideInterval(from.x, to.x, left, right);
    const [enterY, exitY] = insideInterval(from.y, to.y, top, bottom);
    return Math.max(0, enterX, enterY) >= Math.min(1, exitX, exitY);
  });
}

const corners = blockedAreas.flatMap(({ left, top, right, bottom }) => {
  // Keep a little space at corners so movement stays clear of the wall as it turns.
  const clearance = 1;
  return [
    { x: left - clearance, y: top - clearance },
    { x: right + clearance, y: top - clearance },
    { x: left - clearance, y: bottom + clearance },
    { x: right + clearance, y: bottom + clearance },
  ];
}).filter(({ x, y }) => canStand(x, y));

export function findRoute(from, click) {
  const target = {
    x: Math.max(walkingBounds.left, Math.min(click.x, walkingBounds.right)),
    y: Math.max(walkingBounds.top, Math.min(click.y, walkingBounds.bottom)),
  };
  if (!canStand(target.x, target.y)) return [];
  if (isClear(from, target)) return [target];

  // The destination and the corners are the only places a shortest path needs to turn.
  const nodes = [from, target, ...corners];
  const distances = nodes.map(() => Infinity);
  const previous = nodes.map(() => -1);
  const pending = new Set(nodes.keys());
  distances[0] = 0;

  while (pending.size) {
    const nearest = [...pending].reduce((best, index) => distances[index] < distances[best] ? index : best);
    if (!Number.isFinite(distances[nearest])) return [];
    if (nearest === 1) {
      const route = [];
      for (let index = 1; index !== 0; index = previous[index]) route.push(nodes[index]);
      return route.reverse();
    }

    pending.delete(nearest);
    const point = nodes[nearest];
    for (const index of pending) {
      const next = nodes[index];
      const distance = distances[nearest] + Math.hypot(next.x - point.x, next.y - point.y);
      if (distance < distances[index] && isClear(point, next)) {
        distances[index] = distance;
        previous[index] = nearest;
      }
    }
  }

  return [];
}
