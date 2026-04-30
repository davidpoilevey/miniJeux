export const DISTRICTS = [
  { tag: 'gestion',     cx: -600, cy: -300, color: 'var(--d-gestion)',     label: 'Gestion' },
  { tag: 'board',     cx:  200, cy:  600, color: 'var(--d-board)',     label: 'Jeux de plateau' },
  { tag: 'evolution',     cx:  600, cy: -350, color: 'var(--d-evolution)',     label: 'Evolution' },
  { tag: 'cartes',     cx: -500, cy:  400, color: 'var(--d-cartes)',     label: 'Cartes' },
  { tag: 'iaInside',      cx:    0, cy: -600, color: 'var(--d-iaInside)',      label: 'Avec IA' },
  { tag: 'workInProgress', cx:  650, cy:  300, color: 'var(--d-workInProgress)', label: 'Work in progress' },
  { tag: 'mobileFriendly',    cx: -200, cy: -550, color: 'var(--d-mobileFriendly)',    label: 'Pour mobile' },
  { tag: 'rpg',        cx: -800, cy:    0, color: 'var(--d-rpg)',        label: 'RPG' },
  { tag: 'retro',     cx:  850, cy:    0, color: 'var(--d-retro)',     label: 'Retro' },
];

const MISC = { cx: 0, cy: 0, color: 'var(--d-misc)', label: 'Originals' };

function assignDistrict(game) {
  for (const d of DISTRICTS) {
    if (game.tags.includes(d.tag)) return d;
  }
  return MISC;
}

function seeded(n) {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function computeAtlasLayout(games) {
  const counts = {};
  const positioned = [];

  games.forEach((g) => {
    const d = assignDistrict(g);
    const k = d.label;
    counts[k] = (counts[k] || 0) + 1;
    const idx = counts[k] - 1;

    const r1 = seeded(g.id * 3.1) * 180 + 80;
    const angle = (idx * 2.4 + seeded(g.id) * 0.9) * Math.PI * 2 / 6;
    const jitterX = (seeded(g.id * 7.3) - 0.5) * 50;
    const jitterY = (seeded(g.id * 11.7) - 0.5) * 50;

    positioned.push({
      ...g,
      district: d,
      x: d.cx + Math.cos(angle) * r1 + jitterX,
      y: d.cy + Math.sin(angle) * r1 + jitterY,
    });
  });

  const lines = [];
  const byDistrict = {};
  positioned.forEach(p => {
    const k = p.district.label;
    if (!byDistrict[k]) byDistrict[k] = [];
    byDistrict[k].push(p);
  });

  Object.values(byDistrict).forEach(arr => {
    arr.forEach(a => {
      const others = arr.filter(b => b.id !== a.id)
        .map(b => ({ b, d: Math.hypot(a.x - b.x, a.y - b.y) }))
        .sort((u, v) => u.d - v.d)
        .slice(0, 2);
      others.forEach(({ b }) => {
        const key = [a.id, b.id].sort().join('-');
        if (!lines.some(l => l.key === key)) {
          lines.push({ key, x1: a.x, y1: a.y, x2: b.x, y2: b.y });
        }
      });
    });
  });

  return { nodes: positioned, lines, districts: [...DISTRICTS, MISC] };
}

export function flattenGames(gamesData) {
  const result = [];
  let numericId = 1;
  for (const cat of gamesData) {
    for (const game of (cat.jeux || [])) {
      result.push({
        id: numericId++,
        name: (game.name || 'UNKNOWN').toUpperCase(),
        desc: game.description || '',
        comment: game.description || '',
        tags: game.tags || [],
        hiscore: 0,
        image: game.image || null,
        component: game.component,
        gameRef: game,
      });
    }
  }
  return result;
}
