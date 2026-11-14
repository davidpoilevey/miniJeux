/*
 * Phare Ouest — moteur pur (aucun DOM ; tout le hasard sort de la graine).
 *
 * Les bateaux rentrent vers l'île, capitaines aveugles : ils visent le port en ligne droite.
 * Un bateau ne « voit » les récifs que lorsqu'il est dans le faisceau (b.lit), et s'en
 * souvient mods.memory ticks. Tant qu'il voit, il contourne ; sinon il fonce.
 * Le joueur n'a qu'un faisceau, lourd à tourner : le jeu, c'est de répartir son attention.
 */

export const W = 640;
export const H = 640;
export const CX = 320;
export const CY = 320;
export const DT = 1 / 60;
export const ISLAND_R = 44;
export const QUAY_R = 60;       // rayon d'accostage
export const LOOK = 150;        // distance à laquelle un marin éveillé anticipe un récif
export const HORN_TICKS = 240;  // la corne réveille tout le monde 4 s
export const DAWN_TICKS = 200;
export const MONSTER_SPEED = 27;
export const FEAR_TIME = 0.7;   // secondes de lumière pour renvoyer la Chose au fond
const TAU = Math.PI * 2;

export const TYPES = {
  barque: { speed: 26, turn: 1.7, r: 5, len: 15, pts: 10 },
  voilier: { speed: 38, turn: 1.25, r: 6, len: 21, pts: 15 },
  cargo: { speed: 19, turn: 0.5, r: 9, len: 36, pts: 30 },
};

export const UPGRADES = {
  lentille: { name: 'Lentille de Fresnel', text: 'Faisceau 30 % plus large.' },
  roulements: { name: 'Roulements graissés', text: 'Le phare pivote 40 % plus vite.' },
  corne: { name: 'Seconde corne de brume', text: 'Une corne de plus par nuit.' },
  bouee: { name: 'Bouée lumineuse', text: 'Balise le récif le plus meurtrier : tout le monde l’évite, même dans le noir.' },
  canot: { name: 'Canot de sauvetage', text: 'Un naufrage de plus avant qu’on te retire les clés.' },
  memoire: { name: 'Marins attentifs', text: 'Ils se souviennent 60 % plus longtemps de ce qu’ils ont vu.' },
};

export const wrap = a => { a = (a + Math.PI) % TAU; if (a < 0) a += TAU; return a - Math.PI; };
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Ce que chaque nuit a dans le ventre. La nuit 1 démarre chargée (cargos compris) :
// le jeu n'est drôle que quand il faut choisir qui éclairer. La pente est douce ensuite.
export function nightPlan(n) {
  const storm = n >= 3 && (n % 2 === 1 || n >= 7);
  return {
    boats: Math.round(9 + 1.5 * n),
    gap: Math.max(1.7, 3.6 - 0.15 * n),
    weights: { barque: 5, voilier: 2 + n * 0.7, cargo: 1 + n * 0.7 },
    storm,
    wind: storm ? Math.min(10, 5 + n * 0.5) : 0,
    monsters: n >= 6 ? 2 : n >= 2 ? 1 : 0,
    rocks: Math.min(18, 12 + n),
  };
}

function addRock(s) {
  for (let i = 0; i < 300; i++) {
    const d = 112 + s.rand() * 176, a = s.rand() * TAU, r = 11 + s.rand() * 11;
    const x = CX + Math.cos(a) * d, y = CY + Math.sin(a) * d;
    if (s.rocks.every(o => Math.hypot(o.x - x, o.y - y) >= o.r + r + 46)) {
      const n = 7 + Math.floor(s.rand() * 3);
      s.rocks.push({ x, y, r, beacon: false, kills: 0, born: s.night, shape: Array.from({ length: n }, () => 0.78 + s.rand() * 0.3) });
      return true;
    }
  }
  return false;
}

export function createGame(seed = 1) {
  const s = {
    seed, rand: mulberry(seed), tick: 0, phase: 'title', night: 0,
    score: 0, saved: 0, wrecks: 0, maxWrecks: 3,
    beam: { a: -Math.PI / 2, target: -Math.PI / 2, half: 0.14, speed: 3.2 },
    mods: { memory: 90, horn: 1 }, taken: {},
    hornLeft: 0, hornT: 0,
    rocks: [], boats: [], moored: [], monsters: [], queue: [],
    wind: { x: 0, y: 0 }, storm: false, flash: 0, flashIn: 0,
    stats: { saved: 0, lost: 0, bonus: 0 }, offers: [], dawnT: 0, nextId: 1, events: [],
  };
  while (s.rocks.length < nightPlan(1).rocks && addRock(s)); // la baie existe dès l'écran-titre
  return s;
}

function pickType(s, weights) {
  let total = 0;
  for (const k in weights) total += weights[k];
  let r = s.rand() * total;
  for (const k in weights) { r -= weights[k]; if (r <= 0) return k; }
  return 'barque';
}

export function startNight(s) {
  s.night++;
  const plan = nightPlan(s.night);
  while (s.rocks.length < plan.rocks && addRock(s));
  s.queue = [];
  let at = s.tick + 50;
  for (let i = 0; i < plan.boats; i++) {
    s.queue.push({ at: Math.round(at), type: pickType(s, plan.weights), bearing: s.rand() * TAU });
    at += plan.gap * 60 * (0.65 + s.rand() * 0.7);
  }
  const wa = s.rand() * TAU;
  s.wind = { x: Math.cos(wa) * plan.wind, y: Math.sin(wa) * plan.wind };
  s.storm = plan.storm;
  s.flash = 0; s.flashIn = 200 + s.rand() * 300;
  s.monsters = Array.from({ length: plan.monsters }, (_, i) => ({ state: 'under', t: 360 + s.rand() * 300 + i * 300, fear: 0, x: 0, y: 0, target: 0, lit: false, born: 0 }));
  s.hornLeft = s.mods.horn; s.hornT = 0;
  s.stats = { saved: 0, lost: 0, bonus: 0 };
  s.boats = []; s.moored = [];
  s.phase = 'night';
  return s;
}

export function setBeamTarget(s, x, y) {
  if (Math.hypot(x - CX, y - CY) > 4) s.beam.target = Math.atan2(y - CY, x - CX);
}

export function inBeam(s, x, y, r = 0) {
  const d = Math.hypot(x - CX, y - CY);
  if (d < 1) return true;
  return Math.abs(wrap(Math.atan2(y - CY, x - CX) - s.beam.a)) < s.beam.half + Math.asin(Math.min(1, r / d));
}

export function horn(s) {
  if (s.phase !== 'night' || s.hornLeft <= 0 || s.hornT > 0) return false;
  s.hornLeft--;
  s.hornT = HORN_TICKS;
  return true;
}

function spawnBoat(s, q) {
  const c = Math.cos(q.bearing), sn = Math.sin(q.bearing);
  const t = (W / 2 + 16) / Math.max(Math.abs(c), Math.abs(sn)); // sur le bord du carré, juste hors champ
  s.boats.push({
    id: s.nextId++, type: q.type, x: CX + c * t, y: CY + sn * t, h: q.bearing + Math.PI,
    state: 'sailing', lit: false, memory: 0, danger: false, t: 0, trail: [], cause: null, look: Math.floor(s.rand() * 1000),
  });
}

function wreck(s, b, cause, rock) {
  b.state = 'sinking'; b.t = 0; b.cause = cause; b.danger = false;
  if (s.phase !== 'night') return;
  s.wrecks++; s.stats.lost++;
  if (rock) rock.kills++;
  s.events.push({ type: 'wreck', cause, boat: b, x: b.x, y: b.y });
  if (s.wrecks >= s.maxWrecks) { s.phase = 'over'; s.events.push({ type: 'over' }); }
}

function stepBoats(s) {
  const live = s.phase === 'night';
  for (const b of s.boats) {
    b.t++;
    if (b.state !== 'sailing') continue;
    const T = TYPES[b.type];
    b.lit = live && inBeam(s, b.x, b.y, T.r);
    if (b.lit) b.memory = s.mods.memory; else if (b.memory > 0) b.memory--;
    const aware = b.lit || b.memory > 0 || s.hornT > 0;
    b.aware = aware;

    const dx = CX - b.x, dy = CY - b.y, dist = Math.hypot(dx, dy);
    const ux = dx / dist, uy = dy / dist;
    let desired = Math.atan2(dy, dx);
    let block = null, bt = Infinity, blat = 0, bclear = 0;
    b.danger = false;
    for (const rock of s.rocks) {
      const rx = rock.x - b.x, ry = rock.y - b.y;
      const t = rx * ux + ry * uy;           // distance du récif le long de la route
      if (t <= 0 || t > dist) continue;
      const lat = ux * ry - uy * rx;          // écart latéral (>0 : récif à gauche de la route)
      if (aware || rock.beacon) {
        const clear = rock.r + T.r + 9;
        if (Math.abs(lat) < clear && t < LOOK && t < bt) { block = rock; bt = t; blat = lat; bclear = clear; }
      } else if (Math.abs(lat) < rock.r + T.r * 0.7 && t / T.speed < 4) b.danger = true;
    }
    if (block) { // viser le point de passage, du côté où la route passe déjà
      const side = blat > 1 ? -1 : blat < -1 ? 1 : (b.id % 2 ? 1 : -1);
      desired = Math.atan2(block.y + side * ux * bclear * 1.3 - b.y, block.x - side * uy * bclear * 1.3 - b.x);
    }
    b.h += clamp(wrap(desired - b.h), -T.turn * DT, T.turn * DT);
    b.x += (Math.cos(b.h) * T.speed + s.wind.x) * DT;
    b.y += (Math.sin(b.h) * T.speed + s.wind.y) * DT;
    if (s.tick % 5 === 0) { b.trail.push(b.x, b.y); if (b.trail.length > 28) b.trail.splice(0, 2); }

    const hit = s.rocks.find(rock => Math.hypot(rock.x - b.x, rock.y - b.y) < rock.r + T.r * 0.7);
    if (hit) { wreck(s, b, 'rock', hit); continue; }
    if (Math.hypot(CX - b.x, CY - b.y) < QUAY_R) {
      b.state = 'moored';
      s.moored.push({ a: Math.atan2(b.y - CY, b.x - CX), type: b.type, look: b.look });
      if (live) {
        s.score += T.pts; s.saved++; s.stats.saved++;
        s.events.push({ type: 'arrive', boat: b, x: b.x, y: b.y, points: T.pts });
      }
    }
  }
  s.boats = s.boats.filter(b => b.state === 'sailing' || (b.state === 'sinking' && b.t < 200));
}

function stepMonsters(s) {
  const sailing = s.boats.filter(b => b.state === 'sailing');
  for (const m of s.monsters) {
    if (m.state === 'under') {
      if (--m.t > 0) continue;
      const prey = sailing.filter(b => Math.hypot(b.x - CX, b.y - CY) > 150 && b.x > 30 && b.x < W - 30 && b.y > 30 && b.y < H - 30);
      m.t = 60;
      if (!prey.length) continue;
      const target = prey[Math.floor(s.rand() * prey.length)];
      for (let i = 0; i < 10; i++) {
        const a = s.rand() * TAU;
        const x = clamp(target.x + Math.cos(a) * 125, 24, W - 24), y = clamp(target.y + Math.sin(a) * 125, 24, H - 24);
        if (Math.hypot(x - CX, y - CY) < 110 || inBeam(s, x, y, 30) || Math.hypot(x - target.x, y - target.y) < 90) continue;
        Object.assign(m, { state: 'hunt', x, y, target: target.id, fear: 0, lit: false, born: s.tick });
        s.events.push({ type: 'surface', x, y });
        break;
      }
      continue;
    }
    let target = sailing.find(b => b.id === m.target);
    if (!target) {
      target = sailing.reduce((best, b) => (!best || Math.hypot(b.x - m.x, b.y - m.y) < Math.hypot(best.x - m.x, best.y - m.y) ? b : best), null);
      if (!target) { m.state = 'under'; m.t = 120; continue; }
      m.target = target.id;
    }
    const dx = target.x - m.x, dy = target.y - m.y, d = Math.hypot(dx, dy) || 1;
    m.lit = inBeam(s, m.x, m.y, 12);
    if (m.lit) {
      m.fear += DT;
      m.x -= dx / d * 10 * DT; m.y -= dy / d * 10 * DT; // elle recule en sifflant
      if (m.fear >= FEAR_TIME) {
        m.state = 'under'; m.t = 420 + s.rand() * 300;
        s.score += 5;
        s.events.push({ type: 'repel', x: m.x, y: m.y, points: 5 });
      }
      continue;
    }
    m.fear = Math.max(0, m.fear - DT * 0.4);
    m.x += dx / d * MONSTER_SPEED * DT; m.y += dy / d * MONSTER_SPEED * DT;
    if (d < TYPES[target.type].r + 9) {
      m.state = 'under'; m.t = 600 + s.rand() * 300;
      wreck(s, target, 'monster');
    }
  }
}

function offers(s) {
  const ids = Object.keys(UPGRADES);
  const out = [];
  while (out.length < 3) out.push(ids.splice(Math.floor(s.rand() * ids.length), 1)[0]);
  return out;
}

export function chooseUpgrade(s, id) {
  if (s.phase !== 'shop' || !s.offers.includes(id)) return false;
  s.taken[id] = (s.taken[id] || 0) + 1;
  if (id === 'lentille') s.beam.half *= 1.3;
  if (id === 'roulements') s.beam.speed *= 1.4;
  if (id === 'corne') s.mods.horn++;
  if (id === 'canot') s.maxWrecks++;
  if (id === 'memoire') s.mods.memory = Math.round(s.mods.memory * 1.6);
  if (id === 'bouee') {
    const worst = s.rocks.filter(r => !r.beacon).sort((a, b) => b.kills - a.kills)[0];
    if (worst) worst.beacon = true;
  }
  startNight(s);
  return true;
}

export function step(s) {
  s.events.length = 0;
  s.tick++;
  const bm = s.beam, max = bm.speed * DT; // lentille lourde : approche amortie, vitesse plafonnée
  bm.a = wrap(bm.a + clamp(wrap(bm.target - bm.a) * 0.25, -max, max));
  if (s.phase === 'title' || s.phase === 'shop') return s;

  if (s.phase === 'dawn') {
    stepBoats(s);
    if (++s.dawnT >= DAWN_TICKS) { s.phase = 'shop'; s.offers = offers(s); }
    return s;
  }

  const live = s.phase === 'night';
  if (s.hornT > 0) s.hornT--;
  if (live) while (s.queue.length && s.queue[0].at <= s.tick) spawnBoat(s, s.queue.shift());
  stepBoats(s);
  if (s.phase === 'night') stepMonsters(s);
  if (s.flash > 0) s.flash--;
  if (s.storm && --s.flashIn <= 0) { s.flash = 30; s.flashIn = 300 + s.rand() * 420; s.events.push({ type: 'thunder' }); }

  if (s.phase === 'night' && !s.queue.length && !s.boats.some(b => b.state === 'sailing')) {
    s.phase = 'dawn'; s.dawnT = 0;
    s.monsters.forEach(m => { m.state = 'under'; });
    s.stats.bonus = s.stats.lost === 0 ? 20 * s.night : 0;
    s.score += s.stats.bonus;
    s.events.push({ type: 'dawn', ...s.stats });
  }
  return s;
}
