// Le combat : tirs, dégâts, explosions, ramassage d'armes
import { soundManager } from '../rpg/sons/SoundManager';
import { F, HEADSHOT, HEADSHOT_BONUS, HEARING, LOOT_MS, MONSTER_RADIUS, MOVE_SPREAD } from './constants';
import { castRay, cellKey, distanceField, isWall, tryMove } from './map';
import { MONSTER_TYPES } from './monsters';
import { storeSave } from './save';
import { BLAST_MS, PICKUP_MIN_STEPS, ROCKET_DAMAGE, ROCKET_SPEED, SPLASH, WEAPONS } from './weapons';

// chaque arme à ramasser sur une case libre tirée au sort, assez loin du départ
export const placePickups = (start, monsters) => {
  const fromStart = distanceField(start.x, start.y);
  const taken = new Set(monsters.map((m) => cellKey(m.x, m.y)));
  const cells = [...fromStart].filter(([k, d]) => d >= PICKUP_MIN_STEPS && !taken.has(k)).map(([k]) => k.split(',').map(Number));
  return WEAPONS.flatMap((w, i) => (w.img ? [i] : [])).map((i) => {
    const [x, y] = cells.splice(Math.floor(Math.random() * cells.length), 1)[0];
    return { weapon: i, x: x + 0.5, y: y + 0.5 };
  });
};

// le premier monstre (vivant) touché par un tir dans la direction a, avant le mur.
// slope : de combien le tir monte par case parcourue (0 = droit devant, à hauteur des yeux).
// On sait aussi s'il a pris la balle dans la tête : { m, head }
export const hitscan = (g, a, slope) => {
  const p = g.player;
  const dx = Math.cos(a);
  const dy = Math.sin(a);
  let best = null;
  let bestT = castRay(p.x, p.y, dx, dy).dist;
  for (const m of g.monsters) {
    if (m.deadAt) continue;
    const type = MONSTER_TYPES[m.type];
    const rx = m.x - p.x;
    const ry = m.y - p.y;
    const t = rx * dx + ry * dy; // distance le long du tir
    if (t <= 0 || t >= bestT) continue;
    const side = rx * dy - ry * dx; // où passe le tir, à droite (+) ou à gauche (-) de son centre
    const z = t * slope; // à quelle hauteur (0 = les yeux, -0.5 = le sol)
    const top = type.lift - 0.5 + type.height;
    const [hx, hy, hr] = type.head;
    const head = Math.hypot(side - hx * type.height, z - (top - hy * type.height)) < hr * type.height;
    const body = Math.abs(side) < MONSTER_RADIUS + 0.05 && z < top && z > top - type.height;
    if (!head && !body) continue;
    best = { m, head };
    bestT = t;
  }
  return best;
};

// renvoie true si le coup l'a tué (et alors, ça paie)
export const hurt = (g, m, damage, t, head = false) => {
  if (m.deadAt) return false;
  m.hp -= damage;
  m.hitAt = t;
  m.awake = true;
  if (m.hp > 0) return false;
  m.deadAt = t;
  soundManager.play('fire');
  const gain = Math.round(MONSTER_TYPES[m.type].reward * (head ? HEADSHOT_BONUS : 1));
  g.save.money += gain;
  g.earned += gain;
  // plusieurs morts d'un coup (pompe, roquette) : on cumule l'affichage
  g.loot = { amount: gain + (g.loot && t - g.loot.at < LOOT_MS ? g.loot.amount : 0), at: t };
  storeSave(g.save);
  return true;
};

// dispersion actuelle de l'arme en main (radians) : celle de l'arme, plus un gros bonus si on court
export const spreadOf = (g) => (WEAPONS[g.weapon].spread ?? 0) + (g.moving ? MOVE_SPREAD : 0);

export const fire = (g, t) => {
  const w = WEAPONS[g.weapon];
  const p = g.player;
  g.shotAt = t;
  soundManager.play(w.sound, { volume: w.volume });
  if (w.rocket) {
    g.rockets.push({ x: p.x, y: p.y, dx: Math.cos(p.a), dy: Math.sin(p.a) });
  }
  const spread = spreadOf(g);
  let touched = false;
  let headshot = false;
  let headKill = false;
  for (let i = 0; i < (w.pellets ?? 0); i++) {
    const a = p.a + (Math.random() * 2 - 1) * spread;
    const slope = p.pitch / F + (Math.random() * 2 - 1) * spread; // le viseur est au centre, l'horizon a bougé
    const hit = hitscan(g, a, slope);
    if (!hit) continue;
    const { m, head } = hit;
    if (w.knockback) tryMove(m, m.x + Math.cos(a) * w.knockback, m.y + Math.sin(a) * w.knockback, MONSTER_RADIUS);
    touched = true;
    headshot ||= head;
    if (hurt(g, m, w.damage * (head ? HEADSHOT : 1), t, head) && head) headKill = true;
  }
  if (touched) g.hit = { at: t, head: headshot };
  if (headshot) soundManager.play('metalImpact', { volume: 0.6 }); // le « ding »
  if (headKill) g.message = { text: 'HEADSHOT !', at: t };
  // le bruit réveille le voisinage
  g.monsters.forEach((m) => {
    if ((g.field.get(cellKey(m.x, m.y)) ?? Infinity) <= HEARING) m.awake = true;
  });
};

// le souffle : dégâts et recul d'autant plus forts qu'on est près du centre, mais il ne traverse pas les murs
export const explode = (g, x, y, t) => {
  g.explosions.push({ x, y, at: t });
  soundManager.play('explosion2');
  for (const m of g.monsters) {
    if (m.deadAt) continue;
    const d = Math.hypot(m.x - x, m.y - y);
    if (d > SPLASH) continue;
    if (d > 0.05 && castRay(x, y, (m.x - x) / d, (m.y - y) / d).dist < d) continue;
    const k = 1 - Math.max(0, d - MONSTER_RADIUS) / SPLASH; // mesuré depuis son bord : un tir direct fait le plein
    if (d > 0.05) tryMove(m, m.x + ((m.x - x) / d) * k * 0.6, m.y + ((m.y - y) / d) * k * 0.6, MONSTER_RADIUS);
    hurt(g, m, Math.ceil(ROCKET_DAMAGE * k), t);
  }
  g.monsters.forEach((m) => {
    if (Math.hypot(m.x - x, m.y - y) < 6) m.awake = true;
  });
};

// la roquette avance par petits pas (pour ne pas sauter par-dessus un monstre) et explose au premier obstacle
export const updateRockets = (g, dt, t) => {
  const n = Math.ceil((ROCKET_SPEED * dt) / 0.1);
  const step = (ROCKET_SPEED * dt) / n;
  g.rockets = g.rockets.filter((r) => {
    for (let i = 0; i < n; i++) {
      const nx = r.x + r.dx * step;
      const ny = r.y + r.dy * step;
      if (isWall(Math.floor(nx), Math.floor(ny))) {
        explode(g, r.x, r.y, t);
        return false;
      }
      if (g.monsters.some((m) => !m.deadAt && Math.hypot(m.x - nx, m.y - ny) < MONSTER_RADIUS + 0.1)) {
        explode(g, nx, ny, t);
        return false;
      }
      r.x = nx;
      r.y = ny;
    }
    return true;
  });
  g.explosions = g.explosions.filter((e) => t - e.at < BLAST_MS);
};

// marcher sur une arme la ramasse, et on l'a aussitôt en main
export const updatePickups = (g, t) => {
  const p = g.player;
  g.pickups = g.pickups.filter((k) => {
    if (Math.hypot(k.x - p.x, k.y - p.y) > 0.5) return true;
    g.owned[k.weapon] = true;
    g.weapon = k.weapon;
    g.message = { text: `${WEAPONS[k.weapon].name} ramassé !`, at: t };
    soundManager.play('levelUp');
    return false;
  });
};
