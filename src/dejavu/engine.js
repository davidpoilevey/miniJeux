/*
 * Déjà-vu — moteur pur (aucun DOM, pas de hasard caché : tout sort de la graine).
 *
 * Règle unique : chaque trajet entre deux pastilles devient un ÉCHO, une copie de toi
 * qui rejoue ce trajet en aller-retour, pour toujours. Toucher un écho = fin.
 * La difficulté n'est écrite nulle part : c'est le joueur qui la dessine.
 */

export const W = 420;
export const H = 600;
export const DT = 1 / 60;
export const R_PLAYER = 7;
export const R_ECHO = 8;
export const R_TARGET = 13;
export const SPEED = 300;      // px/s, vitesse max du joueur (donc des échos)
export const GRACE = 45;       // ticks pendant lesquels un écho naissant est inoffensif
export const NEAR = 30;        // distance de frôlement
export const NEAR_POINTS = 3;
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

function spawnTarget(s) {
  let x = W / 2, y = H / 4;
  for (let i = 0; i < 40; i++) {
    x = MARGIN + s.rand() * (W - 2 * MARGIN);
    y = MARGIN + 30 + s.rand() * (H - 2 * MARGIN - 30);
    if (Math.hypot(x - s.x, y - s.y) >= 150) break;
  }
  s.target = { x, y, born: s.tick, ttl: targetTtl(s.picks) };
}

export function createGame(seed = 1) {
  const s = {
    seed, rand: mulberry(seed), tick: 0, phase: 'ready',
    x: W / 2, y: H * 0.62, aimX: W / 2, aimY: H * 0.62,
    path: [], echoes: [], target: null,
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

// Position d'un écho : aller-retour le long de son trajet, un échantillon par tick.
export function echoPos(e, tick) {
  const n = e.pts.length / 2;
  if (n < 2) return [e.pts[0], e.pts[1]];
  const period = 2 * (n - 1);
  const k = (tick - e.born) % period;
  const i = k < n ? k : period - k;
  return [e.pts[2 * i], e.pts[2 * i + 1]];
}

function die(s, cause) {
  s.phase = 'dead';
  s.cause = cause;
  s.events.push({ type: 'dead', ...cause });
}

export function step(s) {
  s.events.length = 0;
  s.tick++;
  if (s.phase !== 'playing') return s; // mort : les échos continuent leur ronde, c'est joli

  // déplacement vers la visée, vitesse plafonnée
  const dx = s.aimX - s.x, dy = s.aimY - s.y;
  const d = Math.hypot(dx, dy);
  const max = SPEED * DT;
  if (d > 0.01) {
    const k = d > max ? max / d : 1;
    s.x += dx * k; s.y += dy * k;
  }
  s.path.push(s.x, s.y);

  // échos : collision et frôlements
  for (let i = 0; i < s.echoes.length; i++) {
    const e = s.echoes[i];
    if (s.tick - e.born < GRACE) continue;
    const [ex, ey] = echoPos(e, s.tick);
    const dist = Math.hypot(ex - s.x, ey - s.y);
    if (dist < R_PLAYER + R_ECHO - 1) {
      die(s, { by: 'echo', echo: i, age: (s.tick - e.made) * DT, x: s.x, y: s.y });
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
    s.echoes.push({ pts: s.path, born: s.tick, made: s.tick, hue: (190 + s.echoes.length * 47) % 360, close: false });
    s.path = [s.x, s.y];
    s.events.push({ type: 'pick', x: t.x, y: t.y, points });
    spawnTarget(s);
  } else if (left <= 0) {
    die(s, { by: 'timeout', x: t.x, y: t.y });
  }
  return s;
}
