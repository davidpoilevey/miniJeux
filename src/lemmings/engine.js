export const TICK_MS = 120;
export const MAX_FALL = 16;
export const BUILD_STEPS = 12;
export const SKILLS = {
  blocker: { label: 'Bloqueur', symbol: '✋', help: 'Fait rebrousser chemin aux autres. Clique à nouveau sur lui pour le remettre en marche.' },
  digger: { label: 'Creuseur', symbol: '↓', help: 'Creuse sous ses pieds. La roche grise est indestructible.' },
  builder: { label: 'Constructeur', symbol: '↗', help: 'Construit un escalier de 12 marches dans sa direction de marche.' },
};
export const isActive = l => l.status !== 'saved' && l.status !== 'dead';

export function createGame(level) {
  const terrain = Array.from({ length: level.height }, () => Array(level.width).fill('.'));
  for (const { rect: [x, y, w, h], material } of level.terrain) {
    for (let row = y; row < y + h; row++) {
      for (let col = x; col < x + w; col++) {
        if (terrain[row] && col >= 0 && col < level.width) terrain[row][col] = material;
      }
    }
  }
  return { terrain, lemmings: [], skills: { ...level.skills }, tick: 0, released: 0, saved: 0, lost: 0, result: null };
}

// A lemming occupies (x,y) and (x,y-1); its feet rest on (x,y+1).
const tile = (s, x, y) => s.terrain[y]?.[x] ?? '.';
const solid = (s, x, y) => tile(s, x, y) !== '.';
const fits = (s, x, y) => x >= 0 && x < s.terrain[0].length && y >= 1 && !solid(s, x, y) && !solid(s, x, y - 1);
const grounded = (s, l) => solid(s, l.x, l.y + 1);

export function releaseBlocker(state, id) {
  if (state.result || !state.lemmings.some(l => l.id === id && l.status === 'blocking')) return state;
  return {
    ...state,
    lemmings: state.lemmings.map(l => l.id === id
      ? { ...l, status: 'walking', actionTicks: 0, fall: 0 }
      : l),
  };
}

export function assignSkill(state, id, skill) {
  const l = state.lemmings.find(item => item.id === id);
  if (state.result || !SKILLS[skill] || !(state.skills[skill] > 0) || !l ||
      l.status !== 'walking' || !grounded(state, l)) return state;
  if (skill === 'digger' && tile(state, l.x, l.y + 1) !== '#') return state;
  return {
    ...state,
    skills: { ...state.skills, [skill]: state.skills[skill] - 1 },
    lemmings: state.lemmings.map(item => item.id === id
      ? { ...item, status: { blocker: 'blocking', digger: 'digging', builder: 'building' }[skill], actionTicks: 0, steps: 0 }
      : item),
  };
}

function finishLemming(s, l, status) {
  l.status = status;
  s[status === 'saved' ? 'saved' : 'lost']++;
}

export function stepGame(state, level) {
  if (state.result) return state;
  const s = { ...state, terrain: state.terrain.map(row => [...row]), lemmings: state.lemmings.map(l => ({ ...l })), tick: state.tick + 1 };
  if (s.released < level.total && (s.tick - 1) % level.releaseEvery === 0) {
    s.lemmings.push({ id: s.released, x: level.spawn.x, y: level.spawn.y, direction: level.spawn.direction || 1, status: 'falling', fall: 0, actionTicks: 0, steps: 0 });
    s.released++;
  }
  for (const l of s.lemmings) {
    if (!isActive(l)) continue;
    if (l.y >= level.height - 1) {
      finishLemming(s, l, 'dead');
      continue;
    }
    if (!grounded(s, l)) {
      l.status = 'falling';
      l.y++;
      l.fall++;
      continue;
    }
    if (l.status === 'falling') {
      if (l.fall > MAX_FALL) {
        finishLemming(s, l, 'dead');
        continue;
      }
      l.status = 'walking';
      l.fall = 0;
    }
    const e = level.exit;
    if (l.x >= e.x && l.x < e.x + e.width && l.y >= e.y && l.y < e.y + e.height) {
      finishLemming(s, l, 'saved');
      continue;
    }
    if (l.status === 'blocking') continue;
    if (l.status === 'digging') {
      if (tile(s, l.x, l.y + 1) !== '#') {
        l.status = 'walking';
      } else if (++l.actionTicks >= 3) {
        s.terrain[l.y + 1][l.x] = '.';
        l.y++;
        l.actionTicks = 0;
        // Stay a digger across successive layers, then fall into the cave.
      }
      continue;
    }
    const nx = l.x + l.direction;
    const blocked = s.lemmings.some(other => other.id !== l.id && other.status === 'blocking' &&
      grounded(s, other) && other.x === nx && Math.abs(other.y - l.y) <= 1);
    if (l.status === 'building') {
      if (++l.actionTicks < 4) continue;
      l.actionTicks = 0;
      if (blocked || solid(s, nx, l.y) || !fits(s, nx, l.y - 1)) {
        l.status = 'walking';
        l.direction *= -1;
        continue;
      }
      s.terrain[l.y][nx] = 'B';
      l.x = nx;
      l.y--;
      if (++l.steps === BUILD_STEPS) l.status = 'walking';
      continue;
    }
    if (!blocked && fits(s, nx, l.y)) {
      l.x = nx;
    } else if (!blocked && solid(s, nx, l.y) && fits(s, nx, l.y - 1)) {
      l.x = nx;
      l.y--;
    } else {
      l.direction *= -1;
    }
  }
  const timedOut = s.tick * TICK_MS >= level.timeSeconds * 1000;
  if (timedOut) {
    for (const l of s.lemmings) if (isActive(l)) finishLemming(s, l, 'dead');
    s.lost += level.total - s.released;
    s.result = s.saved >= level.required ? 'won' : 'lost';
  } else if (s.released === level.total && s.lemmings.every(l => !isActive(l))) {
    s.result = s.saved >= level.required ? 'won' : 'lost';
  }
  return s;
}
