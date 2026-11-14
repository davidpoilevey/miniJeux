/*
 * Déjà-vu — moteur pur (aucun DOM, pas de hasard caché : tout sort de la graine).
 *
 * Règle unique : chaque trajet entre deux pastilles devient un ÉCHO, une copie de toi
 * qui rejoue ce trajet en aller-retour, pour toujours. Toucher un écho = fin.
 * La difficulté n'est écrite nulle part : c'est le joueur qui la dessine.
 *
 * Bonus (un toutes les BONUS_EVERY pastilles, au prix d'un détour) :
 *   oubli  — efface les 2 plus vieux échos
 *   gel    — fige les échos (toujours mortels, mais immobiles)
 *   lucide — pendant quelques secondes, c'est le joueur qui gobe les échos
 */

export const W = 420;
export const H = 600;
export const DT = 1 / 60;
export const R_PLAYER = 7;
export const R_ECHO = 8;
export const R_TARGET = 13;
export const R_BONUS = 12;
export const SPEED = 300;      // px/s, vitesse max du joueur (donc des échos)
export const GRACE = 45;       // ticks pendant lesquels un écho naissant est inoffensif
export const NEAR = 30;        // distance de frôlement
export const NEAR_POINTS = 3;
export const EAT_POINTS = 15;
export const BONUS_EVERY = 4;
export const BONUS_TTL = 420;
export const FREEZE_TICKS = 210;
export const LUCID_TICKS = 240;
const MARGIN = 28;

function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// La pastille s'impatiente : 8 s au début, 4 s au pire.
export const targetTtl = picks => Math.max(240, 480 - picks * 8);

function randomSpot(s, ok) {
  let x = W / 2, y = H / 4;
  for (let i = 0; i < 40; i++) {
    x = MARGIN + s.rand() * (W - 2 * MARGIN);
    y = MARGIN + 30 + s.rand() * (H - 2 * MARGIN - 30);
    if (ok(x, y)) break;
  }
  return { x, y };
}

function spawnTarget(s) {
  const p = randomSpot(s, (x, y) => Math.hypot(x - s.x, y - s.y) >= 150);
  s.target = { ...p, born: s.tick, ttl: targetTtl(s.picks) };
}

function spawnBonus(s) {
  const r = s.rand();
  const kind = r < 0.4 ? 'oubli' : r < 0.7 ? 'gel' : 'lucide';
  const p = randomSpot(s, (x, y) => Math.hypot(x - s.x, y - s.y) >= 120 && Math.hypot(x - s.target.x, y - s.target.y) >= 90);
  s.bonus = { ...p, kind, born: s.tick, ttl: BONUS_TTL };
}

export function createGame(seed = 1) {
  const s = {
    seed, rand: mulberry(seed), phase: 'ready',
    tick: 0,   // horloge du monde
    etick: 0,  // horloge des échos (s'arrête pendant le gel)
    x: W / 2, y: H * 0.62, aimX: W / 2, aimY: H * 0.62,
    path: [], echoes: [], made: 0, target: null, bonus: null,
    frozen: 0, lucid: 0,
    score: 0, picks: 0, nears: 0, cause: null, events: [],
  };
  s.path.push(s.x, s.y);
  spawnTarget(s);
  return s;
}

export function start(s) {
  if (s.phase !== 'ready') return;
  s.phase = 'playing';
  s.target.born = s.tick;
}

export function setAim(s, x, y) {
  s.aimX = Math.max(R_PLAYER, Math.min(W - R_PLAYER, x));
  s.aimY = Math.max(R_PLAYER, Math.min(H - R_PLAYER, y));
}

// Position d'un écho : aller-retour le long de son trajet, un échantillon par tick d'écho.
export function echoPos(e, etick) {
  const n = e.pts.length / 2;
  if (n < 2) return [e.pts[0], e.pts[1]];
  const period = 2 * (n - 1);
  const k = (etick - e.born) % period;
  const i = k < n ? k : period - k;
  return [e.pts[2 * i], e.pts[2 * i + 1]];
}

function die(s, cause) {
  s.phase = 'dead';
  s.cause = cause;
  s.events.push({ type: 'dead', ...cause });
}

function takeBonus(s) {
  const b = s.bonus;
  s.bonus = null;
  s.events.push({ type: 'bonus', kind: b.kind, x: b.x, y: b.y });
  if (b.kind === 'gel') s.frozen = FREEZE_TICKS;
  if (b.kind === 'lucide') s.lucid = LUCID_TICKS;
  if (b.kind === 'oubli') {
    for (const e of s.echoes.splice(0, 2)) {
      const [x, y] = echoPos(e, s.etick);
      s.events.push({ type: 'forget', x, y, hue: e.hue });
    }
  }
}

export function step(s) {
  s.events.length = 0;
  s.tick++;
  if (s.phase !== 'playing') { s.etick++; return s; } // mort : les échos continuent leur ronde, c'est joli
  if (s.frozen > 0) s.frozen--; else s.etick++;
  if (s.lucid > 0) s.lucid--;

  // déplacement vers la visée, vitesse plafonnée
  const dx = s.aimX - s.x, dy = s.aimY - s.y;
  const d = Math.hypot(dx, dy);
  const max = SPEED * DT;
  if (d > 0.01) {
    const k = d > max ? max / d : 1;
    s.x += dx * k; s.y += dy * k;
  }
  s.path.push(s.x, s.y);

  // bonus
  if (s.bonus) {
    if (Math.hypot(s.bonus.x - s.x, s.bonus.y - s.y) < R_PLAYER + R_BONUS) takeBonus(s);
    else if (s.tick - s.bonus.born > s.bonus.ttl) s.bonus = null;
  }

  // échos : collision, festin (lucidité) et frôlements
  for (let i = 0; i < s.echoes.length; i++) {
    const e = s.echoes[i];
    if (s.etick - e.born < GRACE) continue;
    const [ex, ey] = echoPos(e, s.etick);
    const dist = Math.hypot(ex - s.x, ey - s.y);
    if (s.lucid > 0) {
      if (dist < R_PLAYER + R_ECHO + 6) {
        s.echoes.splice(i--, 1);
        s.score += EAT_POINTS;
        s.events.push({ type: 'eat', x: ex, y: ey, points: EAT_POINTS, hue: e.hue });
      }
      continue;
    }
    if (dist < R_PLAYER + R_ECHO - 1) {
      die(s, { by: 'echo', echo: i, age: (s.tick - e.madeAt) * DT, x: s.x, y: s.y });
      return s;
    }
    if (dist < NEAR) e.close = true;
    else if (e.close) {
      e.close = false;
      s.nears++;
      s.score += NEAR_POINTS;
      s.events.push({ type: 'near', x: s.x, y: s.y, points: NEAR_POINTS });
    }
  }

  // pastille
  const t = s.target;
  const left = t.ttl - (s.tick - t.born);
  if (Math.hypot(t.x - s.x, t.y - s.y) < R_PLAYER + R_TARGET) {
    const points = 10 + Math.ceil(10 * left / t.ttl);
    s.score += points;
    s.picks++;
    s.echoes.push({ pts: s.path, born: s.etick, madeAt: s.tick, hue: (190 + s.made++ * 47) % 360, close: false });
    s.path = [s.x, s.y];
    s.events.push({ type: 'pick', x: t.x, y: t.y, points });
    spawnTarget(s);
    if (!s.bonus && s.picks % BONUS_EVERY === 0) spawnBonus(s);
  } else if (left <= 0) {
    die(s, { by: 'timeout', x: t.x, y: t.y });
  }
  return s;
}
