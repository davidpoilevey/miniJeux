// Les monstres : qui ils sont, et comment ils te chassent
import harpieGif from '../dungeon/harpie.gif';
import squeletteGif from '../dungeon/squelette.gif';
import diableRougeGif from '../dungeon/diableRouge.gif';
import spectreGif from '../dungeon/spectre.gif';
import { soundManager } from '../rpg/sons/SoundManager';
import { MONSTER_RADIUS, REACH, SIGHT, WINDUP_MS } from './constants';
import { DIRS, MAP, cellKey, tryMove } from './map';

// height : taille (un mur = 1), lift : décollage du sol, speed : cases/s, reward : $ à la mort
// head : où est la tête dans l'image, [décalage vers la droite depuis le centre, descente depuis le haut, rayon],
// le tout en fraction de la hauteur du monstre (relevé à la main sur les GIF)
export const MONSTER_TYPES = {
  1: { name: 'Harpie', hp: 3, speed: 2.6, height: 0.55, lift: 0.3, damage: 4, attackMs: 700, reward: 10, head: [0.165, 0.4, 0.07] },
  2: { name: 'Squelette', hp: 6, speed: 1.6, height: 0.8, lift: 0, damage: 8, attackMs: 1000, reward: 15, head: [-0.02, 0.25, 0.07] },
  3: { name: 'Diable rouge', hp: 10, speed: 1.4, height: 0.9, lift: 0, damage: 12, attackMs: 1200, reward: 25, head: [0, 0.26, 0.07] },
  4: { name: 'Spectre', hp: 16, speed: 1.1, height: 1, lift: 0.05, damage: 20, attackMs: 1500, reward: 40, head: [-0.1, 0.38, 0.17] },
};
export const GIFS = { 1: harpieGif, 2: squeletteGif, 3: diableRougeGif, 4: spectreGif };

export const findMonsters = () => {
  const monsters = [];
  MAP.forEach((row, y) => [...row].forEach((c, x) => {
    const type = MONSTER_TYPES[c];
    if (type) monsters.push({ type: c, x: x + 0.5, y: y + 0.5, hp: type.hp, awake: false, attackAt: null, hitAt: -1e9, deadAt: null, phase: Math.random() * 1000 });
  }));
  return monsters;
};

export const updateMonsters = (g, dt, t) => {
  const p = g.player;
  for (const m of g.monsters) {
    if (m.deadAt) continue;
    const type = MONSTER_TYPES[m.type];
    const dist = Math.hypot(p.x - m.x, p.y - m.y);
    const steps = g.field.get(cellKey(m.x, m.y));
    if (!m.awake && steps !== undefined && steps <= SIGHT) m.awake = true;
    if (!m.awake) continue;
    if (dist < REACH) {
      if (m.attackAt === null) m.attackAt = t + WINDUP_MS;
      else if (t >= m.attackAt) {
        p.hp = Math.max(0, p.hp - type.damage);
        g.hurtAt = t;
        m.attackAt = t + type.attackMs;
        soundManager.play('slash');
      }
      continue;
    }
    m.attackAt = null;
    // loin : on suit le GPS case par case ; tout près : droit sur le joueur
    let tx = p.x;
    let ty = p.y;
    if (steps > 1) {
      const cx = Math.floor(m.x);
      const cy = Math.floor(m.y);
      const next = DIRS.find(([dx, dy]) => g.field.get(`${cx + dx},${cy + dy}`) === steps - 1);
      if (next) {
        tx = cx + next[0] + 0.5;
        ty = cy + next[1] + 0.5;
      }
    }
    const len = Math.hypot(tx - m.x, ty - m.y) || 1;
    const s = type.speed * dt;
    tryMove(m, m.x + ((tx - m.x) / len) * s, m.y + ((ty - m.y) / len) * s, MONSTER_RADIUS);
  }
  // pas de monstres empilés les uns dans les autres
  const alive = g.monsters.filter((m) => !m.deadAt);
  for (let i = 0; i < alive.length; i++) {
    for (let j = i + 1; j < alive.length; j++) {
      const a = alive[i];
      const b = alive[j];
      const d = Math.hypot(b.x - a.x, b.y - a.y);
      if (d >= 2 * MONSTER_RADIUS || d === 0) continue;
      const push = (2 * MONSTER_RADIUS - d) / 2 / d;
      const ox = (b.x - a.x) * push;
      const oy = (b.y - a.y) * push;
      tryMove(a, a.x - ox, a.y - oy, MONSTER_RADIUS);
      tryMove(b, b.x + ox, b.y + oy, MONSTER_RADIUS);
    }
  }
};
