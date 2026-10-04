// La carte et sa géométrie : murs, rayons, déplacements

// '#' mur, '.' sol, 'S' départ, '1'..'4' monstre (voir MONSTER_TYPES)
export const MAP = [
  '########################',
  '#S.....#.......#.......#',
  '#......#...1...#...2...#',
  '#.............1........#',
  '#......#.......#.......#',
  '#......#...2...#...3...#',
  '###.#######.#######.####',
  '#......................#',
  '#...1..........4.....1.#',
  '#.....####....####.....#',
  '#.....####..2.####..2..#',
  '#.....####....####.....#',
  '#..3...............3...#',
  '#......2.......4.......#',
  '########################',
];

export const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]];

export const isWall = (x, y) => (MAP[y]?.[x] ?? '#') === '#';
export const cellKey = (x, y) => `${Math.floor(x)},${Math.floor(y)}`;

export const findStart = () => {
  for (let y = 0; y < MAP.length; y++) {
    const x = MAP[y].indexOf('S');
    if (x >= 0) return { x: x + 0.5, y: y + 0.5, a: 0 };
  }
  return { x: 1.5, y: 1.5, a: 0 };
};

// distance (en pas) de chaque case jusqu'au joueur, en contournant les murs : le GPS des monstres
export const distanceField = (px, py) => {
  const dist = new Map([[cellKey(px, py), 0]]);
  let front = [[Math.floor(px), Math.floor(py)]];
  for (let d = 1; front.length; d++) {
    const next = [];
    for (const [x, y] of front) {
      for (const [dx, dy] of DIRS) {
        const k = `${x + dx},${y + dy}`;
        if (dist.has(k) || isWall(x + dx, y + dy)) continue;
        dist.set(k, d);
        next.push([x + dx, y + dy]);
      }
    }
    front = next;
  }
  return dist;
};

// Lancer de rayon case par case (DDA) jusqu'au premier mur.
// dist est mesurée en "longueurs de (dx, dy)" : distance perpendiculaire pour les rayons de la caméra,
// distance réelle pour un rayon unitaire (le tir).
export const castRay = (px, py, dx, dy) => {
  let mx = Math.floor(px);
  let my = Math.floor(py);
  const ddx = dx === 0 ? 1e30 : Math.abs(1 / dx);
  const ddy = dy === 0 ? 1e30 : Math.abs(1 / dy);
  const sx = dx < 0 ? -1 : 1;
  const sy = dy < 0 ? -1 : 1;
  let sdx = (dx < 0 ? px - mx : mx + 1 - px) * ddx;
  let sdy = (dy < 0 ? py - my : my + 1 - py) * ddy;
  let side = 0;
  for (let i = 0; i < 64; i++) {
    if (sdx < sdy) { sdx += ddx; mx += sx; side = 0; } else { sdy += ddy; my += sy; side = 1; }
    if (isWall(mx, my)) break;
  }
  const dist = side === 0 ? sdx - ddx : sdy - ddy;
  const hitAt = side === 0 ? py + dist * dy : px + dist * dx;
  return { dist, side, wallX: hitAt - Math.floor(hitAt), flip: (side === 0 && dx > 0) || (side === 1 && dy < 0) };
};

// un cercle de rayon r tient-il en (x, y) sans toucher de mur ?
export const free = (x, y, r) => !isWall(Math.floor(x - r), Math.floor(y - r)) && !isWall(Math.floor(x + r), Math.floor(y - r))
  && !isWall(Math.floor(x - r), Math.floor(y + r)) && !isWall(Math.floor(x + r), Math.floor(y + r));

// axe par axe : contre un mur, on glisse au lieu de coller
export const tryMove = (o, nx, ny, r) => {
  if (free(nx, o.y, r)) o.x = nx;
  if (free(o.x, ny, r)) o.y = ny;
};
