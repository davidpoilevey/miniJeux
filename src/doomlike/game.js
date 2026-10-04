// Une partie : son état de départ, et ce qui se passe à chaque image
import { fire, placePickups, updatePickups, updateRockets } from './combat';
import { DYING_MS, MONSTER_RADIUS, PLAYER_HP, PLAYER_RADIUS, TURN_SPEED, WALK_SPEED } from './constants';
import { cellKey, distanceField, findStart, tryMove } from './map';
import { findMonsters, updateMonsters } from './monsters';
import { WEAPONS } from './weapons';

export const newGame = (save) => {
  const start = findStart();
  const monsters = findMonsters();
  return {
    save, // le portefeuille et les viseurs (partagé avec la boutique)
    earned: 0, // ce que cette partie a rapporté
    loot: null,
    player: { ...start, pitch: 0, hp: PLAYER_HP },
    monsters,
    pickups: placePickups(start, monsters),
    rockets: [],
    explosions: [],
    owned: WEAPONS.map((_, i) => i === 0), // au départ : le pistolet, et c'est tout
    weapon: 0,
    shotAt: -1e9,
    hurtAt: -1e9,
    hit: null, // dernier tir au but : { at, head } pour le hitmarker
    moving: false,
    message: null,
    keys: {},
    firing: false,
    bob: 0,
    field: null,
    fieldKey: '',
    status: 'play',
  };
};

export const update = (g, dt, t) => {
  const p = g.player;
  const k = g.keys;
  // e.code = touche physique : W/A/S/D QWERTY = Z/Q/S/D en AZERTY
  if (k.ArrowLeft) p.a -= TURN_SPEED * dt;
  if (k.ArrowRight) p.a += TURN_SPEED * dt;
  const fwd = (k.KeyW || k.ArrowUp ? 1 : 0) - (k.KeyS || k.ArrowDown ? 1 : 0);
  const strafe = (k.KeyD ? 1 : 0) - (k.KeyA ? 1 : 0);
  const cos = Math.cos(p.a);
  const sin = Math.sin(p.a);
  const mx = cos * fwd - sin * strafe;
  const my = sin * fwd + cos * strafe;
  const len = Math.hypot(mx, my);
  g.moving = len > 0;
  if (len) {
    const s = (WALK_SPEED * dt) / len;
    tryMove(p, p.x + mx * s, p.y + my * s, PLAYER_RADIUS);
    g.bob += dt * 10;
  }
  // on ne traverse pas les monstres : ils nous repoussent
  for (const m of g.monsters) {
    if (m.deadAt) continue;
    const d = Math.hypot(p.x - m.x, p.y - m.y);
    const min = PLAYER_RADIUS + MONSTER_RADIUS;
    if (d < min && d > 0) tryMove(p, p.x + ((p.x - m.x) / d) * (min - d), p.y + ((p.y - m.y) / d) * (min - d), PLAYER_RADIUS);
  }
  const key = cellKey(p.x, p.y);
  if (g.fieldKey !== key) {
    g.field = distanceField(p.x, p.y);
    g.fieldKey = key;
  }
  updatePickups(g, t);
  if (g.firing && t - g.shotAt >= WEAPONS[g.weapon].cooldown) fire(g, t);
  updateRockets(g, dt, t);
  updateMonsters(g, dt, t);
  g.monsters = g.monsters.filter((m) => !m.deadAt || t - m.deadAt < DYING_MS);
  if (p.hp <= 0) g.status = 'dead';
  else if (!g.monsters.length) g.status = 'won';
};
