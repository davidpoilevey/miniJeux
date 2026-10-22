// Orbitales — moteur pur (pas de React ici). Monde logique 1000 x 1000, soleil au centre.
export const W = 1000;
export const C = W / 2;
export const SUN_R = 46;
export const CORONA_R = 92;      // dans ce rayon, le soleil grignote les flottes
export const BURN = 2.2;         // fraction perdue par seconde passée dans la couronne (exp)
export const SHIP_SPEED = 95;    // unités / seconde
export const NEUTRAL = 0, PLAYER = 1;

export const FACTIONS = {
  0: { name: 'Neutre', color: '#8a93a6', glow: '#8a93a6' },
  1: { name: 'Toi', color: '#5ee6d0', glow: '#5ee6d0' },
  2: { name: 'Amiral Ksarr', color: '#ff6b6b', glow: '#ff4d4d' },
  3: { name: 'Comtesse Nébule', color: '#c39bff', glow: '#a77bff' },
};

// Personnalités : thinkEvery (s), moves par réflexion, marge, agressivité envers le joueur, conscience du soleil
export const AIS = {
  2: { lazy: { thinkEvery: 2.6, moves: 1, margin: 1.5, aggro: 0.6, sunAware: false, reserve: 0.25 },
       normal: { thinkEvery: 1.5, moves: 2, margin: 1.3, aggro: 1, sunAware: false, reserve: 0.2 },
       sharp: { thinkEvery: 0.9, moves: 3, margin: 1.2, aggro: 1.4, sunAware: true, reserve: 0.15 } },
  3: { normal: { thinkEvery: 1.4, moves: 2, margin: 1.25, aggro: 1.1, sunAware: true, reserve: 0.2 },
       sharp: { thinkEvery: 0.8, moves: 3, margin: 1.15, aggro: 1.5, sunAware: true, reserve: 0.12 } },
};

export const LEVELS = [
  { name: 'Premier contact', planets: 7, ais: [[2, 'lazy']], aiStart: 10, playerStart: 30, neutralMax: 14 },
  { name: 'La ceinture tiède', planets: 9, ais: [[2, 'normal']], aiStart: 20, playerStart: 30, neutralMax: 20 },
  { name: 'Éclipse partielle', planets: 10, ais: [[3, 'normal']], aiStart: 30, playerStart: 30, neutralMax: 22 },
  { name: 'Ménage à trois', planets: 11, ais: [[2, 'normal'], [3, 'normal']], aiStart: 30, playerStart: 35, neutralMax: 24 },
  { name: 'Le grand brasier', planets: 11, ais: [[2, 'sharp']], aiStart: 40, playerStart: 35, neutralMax: 26, bigSun: true },
  { name: 'La cour de la Comtesse', planets: 12, ais: [[3, 'sharp']], aiStart: 45, playerStart: 35, neutralMax: 28 },
  { name: 'Hégémonie', planets: 13, ais: [[2, 'sharp'], [3, 'sharp']], aiStart: 45, playerStart: 40, neutralMax: 30 },
];

export const TAUNTS = {
  2: {
    start: ['Ksarr ici. Rends-toi, ça ira plus vite.', 'Mes radars disent que tu es petit. Mes radars ont raison.', 'Encore un capitaine du dimanche.'],
    capture: ['Merci pour la planète. Elle est plus jolie en rouge.', 'Oups. C’était à toi ?', 'Ma collection s’agrandit.'],
    lose: ['Coup de chance.', 'Je te laissais gagner celle-là. Pour la confiance.', 'Note pour plus tard : te détester.'],
    burn: ['Le soleil était là AVANT, je te signale ?!', 'Qui a mis une étoile au milieu du système ?', 'Aïe. Mes vaisseaux.'],
    win: ['Rouge. Partout. Comme je les aime.', 'Rentre chez toi, il n’y a plus de chez toi.'],
    dying: ['Ce n’est qu’un repli stratégique…', 'Je reviendrai. Avec des crèmes solaires.'],
  },
  3: {
    start: ['Enchantée. Vous allez adorer perdre.', 'Mes planètes tournent pour moi, très cher.', 'Asseyez-vous, je vous en prie. À genoux, si possible.'],
    capture: ['Je prends. Vous n’en faisiez rien.', 'Charmant petit caillou.', 'Tout vient à point à qui sait orbiter.'],
    lose: ['Quelle vulgarité.', 'Gardez-la, elle était décorative.', 'Vous jouez comme un astéroïde : vite et sans grâce.'],
    burn: ['Rien.', 'Je n’ai rien vu. Vous non plus.'],
    win: ['Le système est à moi. Comme prévu.', 'Merci d’être passé, la sortie est par là.'],
    dying: ['Ceci n’est pas une défaite. C’est une ellipse.', 'Je me retire dans mes appartements.'],
  },
};

// --- RNG déterministe ---------------------------------------------------
export function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// --- Orbites -----------------------------------------------------------
// Période ~ r^1.5 (Kepler, à peu près). Une planète à r=420 fait le tour en ~100 s.
export const capOf = p => 120 + p.size * 60;
export const periodFor = r => 100 * Math.pow(r / 420, 1.5);
export function planetPos(p, t) {
  const a = p.a0 + (2 * Math.PI * t) / p.period;
  return { x: C + Math.cos(a) * p.r, y: C + Math.sin(a) * p.r };
}

// --- Création d'un niveau ----------------------------------------------
export function createLevel(levelIndex, seed = (Math.random() * 1e9) | 0) {
  const L = LEVELS[Math.min(levelIndex, LEVELS.length - 1)];
  const extra = Math.max(0, levelIndex - (LEVELS.length - 1)); // mode infini
  const rand = rng(seed + levelIndex * 7919);
  const players = [PLAYER, ...L.ais.map(a => a[0])];
  const k = players.length;
  // 5 anneaux ; toutes les planètes d'un anneau tournent ensemble. Chaque groupe neutre est
  // répété k fois à 2π/k : le système reste parfaitement équitable pendant toute la partie.
  const r0 = L.bigSun ? 175 : 150;
  const radii = [0, 1, 2, 3, 4].map(i => r0 + i * ((448 - r0) / 4));
  const HOME = 2;
  const homeAngle = rand() * Math.PI * 2;
  const rings = radii.map(() => []); // angles déjà pris (référence groupe)
  const planets = [];
  const add = (ring, a, owner, size, ships) => planets.push({
    id: planets.length, ring, r: radii[ring], a0: a, period: periodFor(radii[ring]), size, rad: 13 + size * 7,
    prod: 0.55 + size * 0.45, owner, ships, x: 0, y: 0, flash: 0,
  });
  players.forEach((o, j) => add(HOME, homeAngle + (j * 2 * Math.PI) / k, o, 3, o === PLAYER ? L.playerStart : L.aiStart + extra * 8));
  rings[HOME].push(0);
  const sep = ring => (2 * 38) / radii[ring] + 0.12; // écart angulaire mini entre deux planètes
  const free = (ring, a) => rings[ring].every(b => {
    for (let j = 0; j < k; j++) {
      let d = Math.abs(((a - b + (j * 2 * Math.PI) / k) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI);
      if (d < sep(ring)) return false;
    }
    return true;
  });
  const groups = Math.max(2, Math.round((L.planets + Math.min(extra, 4) * 2 - k) / k));
  for (let g = 0, tries = 0; g < groups && tries < 400; tries++) {
    const ring = Math.floor(rand() * 5);
    const rel = rand() * Math.PI * 2;
    if (!free(ring, rel)) continue;
    rings[ring].push(rel);
    const size = ring === 0 ? 1 + Math.floor(rand() * 2) : 1 + Math.floor(rand() * 3);
    const ships = Math.round(3 + rand() * (L.neutralMax - 3) * (0.45 + size / 5) * (ring === 0 ? 0.6 : 1));
    for (let j = 0; j < k; j++) add(ring, homeAngle + rel + (j * 2 * Math.PI) / k, NEUTRAL, size, ships);
    g++;
  }
  const ais = L.ais.map(([owner, level]) => ({ owner, ...AIS[owner][level], next: 1.5 + rand() * 1.5, sunAware: AIS[owner][level].sunAware || extra > 0 }));
  const state = {
    levelIndex, seed, name: extra ? `${L.name} +${extra}` : L.name, sunR: L.bigSun ? SUN_R * 1.35 : SUN_R, coronaR: L.bigSun ? CORONA_R * 1.4 : CORONA_R,
    t: 0, planets, fleets: [], ais, players, events: [], sparks: [], phase: 'playing', winner: null, nextFleetId: 1,
    stats: { sent: 0, burned: 0, captured: 0, lost: 0 },
  };
  positions(state);
  return state;
}

function positions(state) {
  state.planets.forEach(p => Object.assign(p, planetPos(p, state.t)));
}

// --- Interception : où sera la cible quand la flotte arrivera ? -------------
export function intercept(state, from, target) {
  let T = Math.hypot(target.x - from.x, target.y - from.y) / SHIP_SPEED;
  let pos = target;
  for (let i = 0; i < 8; i++) {
    pos = planetPos(target, state.t + T);
    T = Math.max(0, Math.hypot(pos.x - from.x, pos.y - from.y) - target.rad * 0.6) / SHIP_SPEED;
  }
  return { T, x: pos.x, y: pos.y };
}

// Temps passé dans la couronne sur le segment a→b (vitesse SHIP_SPEED) → fraction de survivants
export function sunSurvival(state, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
  if (!len) return 1;
  const ux = dx / len, uy = dy / len;
  const fx = a.x - C, fy = a.y - C;
  const proj = -(fx * ux + fy * uy);
  const d2 = fx * fx + fy * fy - proj * proj;
  const R = state.coronaR;
  if (d2 >= R * R) return 1;
  const half = Math.sqrt(R * R - d2);
  const inside = Math.max(0, Math.min(len, proj + half) - Math.max(0, proj - half));
  return Math.exp(-BURN * inside / SHIP_SPEED);
}

export function previewShot(state, src, target) {
  const hit = intercept(state, src, target);
  return { ...hit, survive: sunSurvival(state, src, hit) };
}

// --- Actions --------------------------------------------------------------
export function sendFleet(state, src, target, count) {
  count = Math.floor(Math.min(count, src.ships));
  if (count < 1 || src === target) return null;
  const hit = intercept(state, src, target);
  src.ships -= count;
  const f = { id: state.nextFleetId++, owner: src.owner, ships: count, initial: count, x0: src.x, y0: src.y, x1: hit.x, y1: hit.y, x: src.x, y: src.y, t0: state.t, T: Math.max(0.3, hit.T), target: target.id, burning: 0 };
  state.fleets.push(f);
  if (src.owner === PLAYER) state.stats.sent += count;
  state.events.push({ type: 'launch', owner: src.owner });
  return f;
}

// --- Simulation -------------------------------------------------------------
export function step(state, dt) {
  if (state.phase !== 'playing') return state;
  state.t += dt;
  positions(state);
  for (const p of state.planets) {
    if (p.owner !== NEUTRAL) p.ships = Math.min(p.ships + p.prod * dt, capOf(p));
    p.flash = Math.max(0, p.flash - dt);
  }
  const arrived = [];
  for (const f of state.fleets) {
    const k = Math.min(1, (state.t - f.t0) / f.T);
    f.x = f.x0 + (f.x1 - f.x0) * k;
    f.y = f.y0 + (f.y1 - f.y0) * k;
    const inCorona = Math.hypot(f.x - C, f.y - C) < state.coronaR;
    if (inCorona) {
      const before = f.ships;
      f.ships *= Math.exp(-BURN * dt);
      f.burning = 0.25;
      if (f.owner === PLAYER) state.stats.burned += before - f.ships;
      if (Math.random() < 0.6) state.sparks.push({ x: f.x, y: f.y, vx: (Math.random() - 0.5) * 80, vy: (Math.random() - 0.5) * 80, life: 0.6 });
      if (!f.sunNoted && f.initial >= 6) { f.sunNoted = true; state.events.push({ type: 'burn', owner: f.owner }); }
    } else f.burning = Math.max(0, f.burning - dt);
    if (f.ships < 0.5) f.dead = true;
    else if (k >= 1) arrived.push(f);
  }
  for (const f of arrived) { f.dead = true; land(state, f); }
  state.fleets = state.fleets.filter(f => !f.dead);
  state.sparks.forEach(s => { s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt; });
  state.sparks = state.sparks.filter(s => s.life > 0);

  for (const ai of state.ais) {
    ai.next -= dt;
    if (ai.next <= 0) { ai.next = ai.thinkEvery * (0.8 + Math.random() * 0.4); think(state, ai); }
  }
  checkEnd(state);
  return state;
}

function land(state, f) {
  const p = state.planets[f.target];
  const ships = Math.floor(f.ships + 0.5);
  if (p.owner === f.owner) { p.ships += ships; return; }
  p.ships -= ships;
  if (p.ships < 0) {
    const prev = p.owner;
    p.owner = f.owner;
    p.ships = -p.ships;
    p.flash = 0.9;
    state.events.push({ type: 'capture', owner: f.owner, from: prev, planet: p.id });
    if (f.owner === PLAYER) state.stats.captured++;
    if (prev === PLAYER) state.stats.lost++;
  } else state.events.push({ type: 'hit', owner: f.owner, planet: p.id });
}

export function alive(state, owner) {
  return state.planets.some(p => p.owner === owner) || state.fleets.some(f => f.owner === owner);
}

function checkEnd(state) {
  const living = state.players.filter(o => alive(state, o));
  for (const ai of state.ais) {
    if (!ai.dead && !alive(state, ai.owner)) { ai.dead = true; state.events.push({ type: 'eliminated', owner: ai.owner }); }
  }
  if (!living.includes(PLAYER)) { state.phase = 'lost'; state.winner = living[0] ?? null; }
  else if (living.length === 1) { state.phase = 'won'; state.winner = PLAYER; }
}

export function totals(state) {
  const tot = {};
  state.players.forEach(o => { tot[o] = { ships: 0, planets: 0, prod: 0 }; });
  state.planets.forEach(p => { if (tot[p.owner]) { tot[p.owner].ships += p.ships; tot[p.owner].planets++; tot[p.owner].prod += p.prod; } });
  state.fleets.forEach(f => { if (tot[f.owner]) tot[f.owner].ships += f.ships; });
  return tot;
}

// --- IA ---------------------------------------------------------------------
// Garnison estimée de p à l'instant t+T, en comptant les flottes déjà en route.
function projected(state, p, T, me) {
  let ships = p.owner === me ? p.ships : -p.ships;
  if (p.owner !== NEUTRAL) ships += (p.owner === me ? 1 : -1) * p.prod * T;
  for (const f of state.fleets) {
    if (f.target !== p.id || f.t0 + f.T > state.t + T + 0.01) continue;
    ships += f.owner === me ? f.ships : (p.owner === me ? -f.ships : 0);
  }
  return ships; // > 0 : à moi ; < 0 : il faut ce nombre-là pour la prendre
}

export function think(state, ai) {
  const me = ai.owner;
  const mine = state.planets.filter(p => p.owner === me);
  if (!mine.length) return;
  const avail = new Map(mine.map(p => [p.id, p.ships]));

  // 1) Défense : une planète va tomber ? on envoie du renfort depuis la plus proche.
  for (const p of mine) {
    const threats = state.fleets.filter(f => f.target === p.id && f.owner !== me);
    if (!threats.length) continue;
    const last = Math.max(...threats.map(f => f.t0 + f.T - state.t));
    const balance = projected(state, p, last, me);
    if (balance >= 0) { avail.set(p.id, Math.max(0, Math.min(avail.get(p.id), balance - 1))); continue; }
    avail.set(p.id, 0);
    const helpers = mine.filter(h => h !== p && avail.get(h.id) > 3).map(h => ({ h, shot: previewShot(state, h, p) }))
      .filter(o => o.shot.T < last).sort((a, b) => a.shot.T - b.shot.T);
    let need = -balance + 2;
    for (const { h, shot } of helpers) {
      if (need <= 0) break;
      const surv = ai.sunAware ? shot.survive : 1;
      if (surv < 0.6) continue;
      const n = Math.min(avail.get(h.id) * 0.8, need / surv);
      if (n >= 1) { sendFleet(state, h, p, n); avail.set(h.id, avail.get(h.id) - n); need -= n * surv; }
    }
  }

  // 2) Attaque : meilleur rapport valeur / coût
  for (let m = 0; m < ai.moves; m++) {
    let best = null;
    for (const src of mine) {
      const free = avail.get(src.id) * (1 - ai.reserve);
      if (free < 4) continue;
      for (const tgt of state.planets) {
        if (tgt.owner === me || (tgt.owner === PLAYER && state.t < 12)) continue; // trêve d'ouverture
        const shot = previewShot(state, src, tgt);
        const surv = ai.sunAware ? shot.survive : 1;
        if (surv < 0.25) continue;
        const need = Math.max(1, -projected(state, tgt, shot.T, me)) * ai.margin + 2;
        const send = need / Math.max(surv, 0.05);
        if (projected(state, tgt, shot.T, me) > 0 || send > free) continue;
        let value = tgt.prod * 10 * (tgt.owner === PLAYER ? ai.aggro : tgt.owner === NEUTRAL ? 1 : 0.8);
        const score = value / (send + shot.T * 2.5 + 5);
        if (!best || score > best.score) best = { score, src, tgt, send };
      }
    }
    if (!best) { if (m === 0) assault(state, ai, mine, avail); break; }
    sendFleet(state, best.src, best.tgt, best.send);
    avail.set(best.src.id, avail.get(best.src.id) - best.send);
  }

  // 3) Logistique : les planètes arrière riches poussent vers le front (la plus proche d'un ennemi)
  if (Math.random() < 0.35 && mine.length > 1) {
    const rich = mine.filter(p => avail.get(p.id) > 40).sort((a, b) => b.ships - a.ships)[0];
    const enemies = state.planets.filter(p => p.owner !== me && p.owner !== NEUTRAL);
    if (rich && enemies.length) {
      const dist = p => Math.min(...enemies.map(e => Math.hypot(e.x - p.x, e.y - p.y)));
      const front = mine.filter(p => p !== rich).sort((a, b) => dist(a) - dist(b))[0];
      if (front && dist(front) < dist(rich) - 80) {
        const shot = previewShot(state, rich, front);
        if (!ai.sunAware || shot.survive > 0.85) sendFleet(state, rich, front, avail.get(rich.id) * 0.5);
      }
    }
  }
}

// Assaut combiné : aucune planète seule ne suffit, alors plusieurs convergent sur la même cible.
// Plus les hangars débordent (proche du plafond), plus l'IA accepte une marge serrée.
function assault(state, ai, mine, avail) {
  const full = mine.reduce((a, p) => a + p.ships / capOf(p), 0) / mine.length;
  if (Math.random() > 0.25 + full) return;
  const margin = full > 0.85 ? 1.05 : ai.margin;
  let best = null;
  for (const tgt of state.planets) {
    if (tgt.owner === ai.owner || (tgt.owner === PLAYER && state.t < 12)) continue;
    const shots = mine.map(src => ({ src, shot: previewShot(state, src, tgt) }))
      .map(o => ({ ...o, surv: ai.sunAware ? o.shot.survive : 1 }))
      .filter(o => o.surv > 0.5 && avail.get(o.src.id) > 5).sort((a, b) => a.shot.T - b.shot.T);
    let power = 0;
    const used = [];
    for (const o of shots) {
      used.push(o);
      power += avail.get(o.src.id) * (1 - ai.reserve) * o.surv;
      const proj = projected(state, tgt, o.shot.T, ai.owner);
      if (proj > 0) break; // déjà gagnée par les flottes en route
      const need = -proj * margin + 3;
      if (power >= need) {
        const score = (tgt.prod * (tgt.owner === PLAYER ? ai.aggro : 1)) / (need + o.shot.T * 2);
        if (!best || score > best.score) best = { score, tgt, used: [...used], ratio: need / power };
        break;
      }
    }
  }
  if (!best) return;
  for (const o of best.used) {
    const n = avail.get(o.src.id) * (1 - ai.reserve) * Math.min(1, best.ratio * 1.1);
    sendFleet(state, o.src, best.tgt, n);
    avail.set(o.src.id, avail.get(o.src.id) - n);
  }
}

// --- Score ------------------------------------------------------------------
export function levelScore(state) {
  const speed = Math.max(0, Math.round(1500 - state.t * 8));
  const tot = totals(state)[PLAYER];
  return { base: 1000 + state.levelIndex * 250, speed, fleet: Math.round(tot.ships), total: 1000 + state.levelIndex * 250 + speed + Math.round(tot.ships) };
}
