export const ROOMS = [
  {
    name: 'La galerie des murmures',
    subtitle: 'Un gardien. Trois joyaux. Une très mauvaise idée.',
    map: [
      '#############',
      '#.....#....E#',
      '#.##..#.#...#',
      '#..#....#.#.#',
      '#..#.##...#.#',
      '#.....#.....#',
      '#.##..#.##..#',
      '#..#.....#..#',
      '#..#..#.....#',
      '#S....#.....#',
      '#############',
    ],
    jewels: [{ x: 2, y: 1 }, { x: 5, y: 7 }, { x: 11, y: 7 }],
    patrols: [[{ x: 9, y: 1 }, { x: 11, y: 5 }, { x: 7, y: 7 }, { x: 4, y: 5 }]],
  },
  {
    name: 'Le cabinet des convoitises',
    subtitle: 'Ils sont deux. Essaie de ne pas faire les présentations.',
    map: [
      '#############',
      '#.....#....E#',
      '#.##.....##.#',
      '#....#.#....#',
      '###..#.#..#.#',
      '#....#....#.#',
      '#.##...##...#',
      '#....#....#.#',
      '#.#..#.##...#',
      '#S..........#',
      '#############',
    ],
    jewels: [{ x: 1, y: 1 }, { x: 7, y: 5 }, { x: 11, y: 9 }],
    patrols: [
      [{ x: 4, y: 1 }, { x: 4, y: 5 }, { x: 1, y: 7 }],
      [{ x: 11, y: 3 }, { x: 7, y: 7 }, { x: 11, y: 9 }],
    ],
  },
  {
    name: 'La chambre du dernier éclat',
    subtitle: 'La sortie est là. La cupidité aussi.',
    map: [
      '#############',
      '#.....#....E#',
      '#.##..#.##..#',
      '#..#.....#..#',
      '#..#.###.#..#',
      '#.....#.....#',
      '#.##.....##.#',
      '#....#.#....#',
      '#.##.#.#.##.#',
      '#S..........#',
      '#############',
    ],
    jewels: [{ x: 1, y: 1 }, { x: 5, y: 5 }, { x: 11, y: 7 }],
    patrols: [
      [{ x: 5, y: 1 }, { x: 1, y: 5 }, { x: 5, y: 9 }],
      [{ x: 9, y: 1 }, { x: 11, y: 5 }, { x: 7, y: 9 }],
    ],
  },
];

export const DIRECTIONS = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }];
export const sameTile = (a, b) => a.x === b.x && a.y === b.y;
export const tileKey = p => `${p.x},${p.y}`;
export const walkable = (room, p) => Boolean(room.map[p.y]?.[p.x] && room.map[p.y][p.x] !== '#');

export function findPath(room, start, end) {
  const queue = [[start]];
  const seen = new Set([tileKey(start)]);
  for (let i = 0; i < queue.length; i += 1) {
    const path = queue[i];
    const last = path[path.length - 1];
    if (sameTile(last, end)) return path;
    for (const d of DIRECTIONS) {
      const next = { x: last.x + d.x, y: last.y + d.y };
      if (walkable(room, next) && !seen.has(tileKey(next))) {
        seen.add(tileKey(next));
        queue.push([...path, next]);
      }
    }
  }
  return [];
}

// The lit corridors are exactly what a guard can see; walls stop their sight.
export function sightTiles(room, guard) {
  const tiles = [];
  for (const d of DIRECTIONS) {
    for (let distance = 1; distance <= 5; distance += 1) {
      const p = { x: guard.x + d.x * distance, y: guard.y + d.y * distance };
      if (!walkable(room, p)) break;
      tiles.push(p);
    }
  }
  return tiles;
}

function marker(room, char) {
  const y = room.map.findIndex(row => row.includes(char));
  return { x: room.map[y].indexOf(char), y };
}

function guardsFor(room, seed) {
  return room.patrols.map((patrol, id) => {
    const index = (seed + id) % patrol.length;
    return { ...patrol[index], id, waypoint: (index + 1) % patrol.length, mode: 'patrol', target: null, memory: 0 };
  });
}

function enterRoom(state, roomIndex) {
  const room = ROOMS[roomIndex];
  return {
    ...state, roomIndex, phase: 'playing', player: marker(room, 'S'),
    exit: marker(room, 'E'), jewels: room.jewels.map(p => ({ ...p })),
    guards: guardsFor(room, state.seed), lures: 3, lure: null, roomTurns: 0,
    message: roomIndex === 0 ? 'Prends les trois joyaux, puis rejoins la porte en haut à droite.' : room.subtitle,
    event: 'start',
  };
}

export function createGame(seed = Math.floor(Math.random() * 100000)) {
  return enterRoom({ seed: Math.abs(Math.trunc(seed)), hearts: 3, score: 0, turns: 0, collected: 0, hits: 0 }, 0);
}

export function nextRoom(state) {
  return state.phase === 'cleared' ? enterRoom(state, state.roomIndex + 1) : state;
}

function caught(state) {
  const hearts = state.hearts - 1;
  return {
    ...state, hearts, hits: state.hits + 1, player: marker(ROOMS[state.roomIndex], 'S'),
    guards: guardsFor(ROOMS[state.roomIndex], state.seed), lure: null,
    phase: hearts === 0 ? 'lost' : 'playing', event: 'caught',
    message: hearts === 0 ? 'Le musée te remercie de ta visite. La police aussi.' : 'Repéré ! Retour à l’entrée. Tu conserves tes joyaux.',
  };
}

export function takeTurn(state, action) {
  if (state.phase !== 'playing') return state;
  const room = ROOMS[state.roomIndex];
  let player = { ...state.player };
  if (action.type === 'move') {
    if (!DIRECTIONS.some(d => d.x === action.dx && d.y === action.dy)) return state;
    player = { x: player.x + action.dx, y: player.y + action.dy };
    if (!walkable(room, player)) return state;
  } else if (action.type === 'lure') {
    if (!state.lures || !walkable(room, action.target) || sameTile(player, action.target)) return state;
  } else if (action.type !== 'wait') return state;

  let next = {
    ...state, player, turns: state.turns + 1, roomTurns: state.roomTurns + 1,
    guards: state.guards.map(g => ({ ...g })), event: action.type === 'wait' ? 'wait' : 'step',
    lure: state.lure ? { ...state.lure, ttl: state.lure.ttl - 1 } : null,
    message: action.type === 'wait' ? 'Tu retiens ton souffle. Les gardiens continuent.' : 'Un pas de plus. Reste hors des couloirs éclairés.',
  };
  if (next.lure?.ttl <= 0) next.lure = null;
  if (action.type === 'lure') {
    next.lures -= 1;
    next.lure = { ...action.target, ttl: 6 };
    next.event = 'lure';
    next.message = 'Le leurre sonne pendant 6 tours. Les gardiens vont enquêter… sauf s’ils te voient.';
  }
  // Walking onto a guard is a capture, even if that guard was about to leave.
  if (next.guards.some(g => sameTile(g, player))) return caught(next);

  const found = state.jewels.some(j => sameTile(j, player));
  if (found) {
    next.jewels = state.jewels.filter(j => !sameTile(j, player));
    next.collected += 1;
    next.score += 120;
    next.event = 'jewel';
    next.message = next.jewels.length ? 'Un joyau dans la poche. Personne n’a rien vu. Enfin, espérons.' : 'Les trois joyaux sont à toi. La sortie est ouverte !';
  }
  if (sameTile(player, next.exit) && !next.jewels.length) {
    next.phase = state.roomIndex === ROOMS.length - 1 ? 'won' : 'cleared';
    next.score += 150 + Math.max(0, 65 - next.roomTurns) * 3;
    next.event = 'escape';
    next.message = 'Disparu dans la nuit. Avec quelques souvenirs.';
    return next;
  }

  for (const guard of next.guards) {
    const sees = sightTiles(room, guard).some(p => sameTile(p, player));
    const hearing = action.type === 'move' && findPath(room, guard, player).length <= 3;
    if (sees) {
      guard.mode = 'chase';
      guard.target = { ...player };
      guard.memory = 5;
    } else if (next.lure) {
      guard.mode = 'lure';
      guard.target = { x: next.lure.x, y: next.lure.y };
      guard.memory = 1;
    } else if (hearing) {
      guard.mode = 'search';
      guard.target = { ...player };
      guard.memory = 3;
    } else if (guard.memory > 0) {
      guard.memory -= 1;
    } else {
      guard.mode = 'patrol';
      guard.target = null;
    }

    const patrol = room.patrols[guard.id];
    const target = guard.target || patrol[guard.waypoint];
    const path = findPath(room, guard, target);
    const speed = guard.mode === 'chase' && next.roomTurns % 4 === 0 ? 2 : 1;
    for (const step of path.slice(1, speed + 1)) {
      guard.x = step.x;
      guard.y = step.y;
      if (sameTile(guard, player)) return caught(next);
    }
    if (sameTile(guard, target) && guard.mode === 'patrol') guard.waypoint = (guard.waypoint + 1) % patrol.length;
  }

  if (next.guards.some(g => g.mode === 'chase') && next.event === 'step') {
    next.message = next.roomTurns % 4 === 3 ? 'Attention : au prochain tour, un gardien en poursuite fera DEUX pas.' : 'Il t’a vu ! Brise sa ligne de vue derrière un mur.';
  }
  return next;
}
