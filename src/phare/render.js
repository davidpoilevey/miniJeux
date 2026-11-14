/*
 * Phare Ouest — rendu canvas.
 *
 * Trois calques par image :
 *   1. scene : la baie peinte « en plein jour » (mer, récifs, île, bateaux, Chose, pluie)
 *   2. dark  : la nuit, un aplat sombre qu'on TROUE (destination-out) là où il y a de la lumière :
 *              faisceau, halo du phare, lanternes, bouées, éclairs
 *   3. écran : scene + dark, puis tout ce qui brille par-dessus (lueur du faisceau, feux, HUD)
 * Rien n'est donc « éclairé » à la main : ce qui est dans le faisceau apparaît, c'est tout.
 */
import { W, H, CX, CY, ISLAND_R, QUAY_R, DAWN_TICKS, HORN_TICKS, FEAR_TIME } from './engine';

const TAU = Math.PI * 2;
const BEAM_R = 470;
const hash = i => { const x = Math.sin(i * 127.1 + 3.7) * 43758.5453; return x - Math.floor(x); };
const ease = x => x * x * (3 - 2 * x);

const WAVES = Array.from({ length: 260 }, (_, i) => ({ x: hash(i) * W, y: hash(i + 500) * H, l: 7 + hash(i + 900) * 12, b: i % 6 }));
const RAIN = Array.from({ length: 120 }, (_, i) => ({ x: hash(i + 70) * W, y: hash(i + 170) * H, v: 0.7 + hash(i + 270) * 0.6 }));
const ISLAND = Array.from({ length: 14 }, (_, i) => 0.9 + hash(i + 33) * 0.2);
const HOUSES = [[-23, -15, 0.3], [-27, 6, -0.2], [-13, 25, 0.5], [10, 27, -0.4], [26, 10, 0.2], [25, -15, -0.3], [7, -29, 0.1], [-9, -28, -0.2]];
const PIERS = [0.4, 1.5, 2.6, 3.7, 4.8, 5.9];
const HULLS = ['#8a5a33', '#3f6f8f', '#9b6b3c', '#8f3f3f', '#4d7a55'];
const CARGO_HULLS = ['#8a332c', '#2f4f6b', '#3c3c44', '#5a3a6b'];
const BOXES = ['#d8553d', '#3d8fd8', '#e0b23a', '#4caf6d', '#c9c9c9', '#e07a2f'];

function smoothBlob(c, x, y, r, shape, rot = 0) {
  const n = shape.length;
  const pt = i => { const a = rot + (i / n) * TAU, f = shape[(i + n) % n]; return [x + Math.cos(a) * r * f, y + Math.sin(a) * r * f]; };
  const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  c.beginPath();
  const m0 = mid(pt(-1), pt(0));
  c.moveTo(m0[0], m0[1]);
  for (let i = 0; i < n; i++) { const p = pt(i), m = mid(p, pt(i + 1)); c.quadraticCurveTo(p[0], p[1], m[0], m[1]); }
  c.closePath();
}

function rockPath(c, x, y, r, shape, scale = 1) {
  c.beginPath();
  shape.forEach((f, i) => {
    const a = (i / shape.length) * TAU;
    c[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * r * f * scale, y + Math.sin(a) * r * f * scale);
  });
  c.closePath();
}

function foam(c, x, y, r, t, seed, alpha) {
  c.beginPath();
  for (let i = 0; i <= 28; i++) {
    const a = (i / 28) * TAU, rr = r + 2.5 + 1.8 * Math.sin(a * 5 + t * 1.6 + seed) + 1.2 * Math.sin(a * 9 - t * 2.3 + seed * 2);
    c[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  c.strokeStyle = `rgba(235,250,255,${alpha})`; c.lineWidth = 1.6; c.stroke();
}

function wedge(c, a, half, col0, col1) {
  const g = c.createRadialGradient(CX, CY, 6, CX, CY, BEAM_R);
  g.addColorStop(0, col0); g.addColorStop(1, col1);
  c.fillStyle = g;
  c.beginPath(); c.moveTo(CX, CY); c.arc(CX, CY, BEAM_R, a - half, a + half); c.closePath(); c.fill();
}

function glow(c, x, y, r, color) {
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
}

function hull(c, bow, hw, stern) {
  c.beginPath();
  c.moveTo(bow, 0);
  c.quadraticCurveTo(bow * 0.3, -hw * 1.25, stern, -hw * 0.8);
  c.lineTo(stern, hw * 0.8);
  c.quadraticCurveTo(bow * 0.3, hw * 1.25, bow, 0);
  c.closePath();
}

// Bateau dessiné proue vers +x, centré sur l'origine.
function drawBoat(c, type, look) {
  c.lineWidth = 1; c.strokeStyle = 'rgba(15,10,8,0.85)';
  if (type === 'barque') {
    c.fillStyle = HULLS[look % HULLS.length]; hull(c, 8, 4.2, -7); c.fill(); c.stroke();
    c.fillStyle = 'rgba(0,0,0,0.28)'; hull(c, 5.5, 2.6, -5.5); c.fill();
    c.fillStyle = '#d2b07a'; c.fillRect(-3.5, -3, 1.6, 6); c.fillRect(1, -3, 1.6, 6);
  } else if (type === 'voilier') {
    c.fillStyle = '#ece6d6'; hull(c, 11, 4.6, -10); c.fill(); c.stroke();
    c.fillStyle = '#c59f66'; hull(c, 8, 3, -8.5); c.fill();
    const side = look % 2 ? 1 : -1;
    c.fillStyle = 'rgba(255,255,255,0.96)'; c.strokeStyle = 'rgba(60,70,90,0.6)';
    c.beginPath(); c.moveTo(3, 0); c.quadraticCurveTo(-2, side * 8, -9, side * 2); c.closePath(); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(10, 0); c.quadraticCurveTo(7, side * 4, 4, side * 0.5); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#4a3b2a'; c.beginPath(); c.arc(3, 0, 1.1, 0, TAU); c.fill();
  } else {
    c.fillStyle = CARGO_HULLS[look % CARGO_HULLS.length];
    c.beginPath(); c.moveTo(18, 0); c.quadraticCurveTo(13, -7, 5, -7); c.lineTo(-18, -7); c.lineTo(-18, 7); c.lineTo(5, 7); c.quadraticCurveTo(13, 7, 18, 0); c.closePath();
    c.fill(); c.stroke();
    c.fillStyle = '#4b515b'; c.fillRect(-16.5, -5.5, 24, 11);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) {
      c.fillStyle = BOXES[(look + i * 3 + j * 5) % BOXES.length];
      c.fillRect(-9.5 + i * 5.2, -5 + j * 5.2, 4.6, 4.6);
    }
    c.fillStyle = '#f1efe8'; c.fillRect(-16, -5, 5, 10);
    c.fillStyle = '#26323f'; c.fillRect(-12.2, -4, 1, 8);
    c.fillStyle = '#222'; c.beginPath(); c.arc(-14.5, 0, 1.6, 0, TAU); c.fill();
  }
}

const BOAT_SCALE = 1.3; // dessinés plus gros que leur coque physique : lisibles, et indulgents
const BOW = { barque: 8 * BOAT_SCALE, voilier: 11 * BOAT_SCALE, cargo: 18 * BOAT_SCALE };

function drawMonster(c, m, s, t) {
  const rise = Math.min(1, (s.tick - m.born) / 40);
  const lit = m.lit;
  c.lineCap = 'round';
  for (let i = 0; i < 7; i++) {
    let a = (i / 7) * TAU + Math.sin(t * 0.7 + i) * 0.25;
    let x = m.x + Math.cos(a) * 9 * rise, y = m.y + Math.sin(a) * 9 * rise;
    for (let j = 0; j < 7; j++) {
      a += Math.sin(t * (lit ? 11 : 3) + i * 1.7 + j * 0.8) * (lit ? 0.55 : 0.28);
      const nx = x + Math.cos(a) * 6.5 * rise, ny = y + Math.sin(a) * 6.5 * rise;
      c.strokeStyle = lit ? `hsl(${272 + j * 4},42%,${46 - j * 2}%)` : '#221b36';
      c.lineWidth = 5.2 - j * 0.6;
      c.beginPath(); c.moveTo(x, y); c.lineTo(nx, ny); c.stroke();
      x = nx; y = ny;
    }
  }
  const g = c.createRadialGradient(m.x - 2, m.y - 2, 1, m.x, m.y, 14 * rise + 0.1);
  g.addColorStop(0, lit ? '#8a5cc0' : '#2a2242'); g.addColorStop(1, lit ? '#3c2560' : '#15112a');
  c.fillStyle = g; c.beginPath(); c.arc(m.x, m.y, 13 * rise, 0, TAU); c.fill();
}

function buoyIcon(c, x, y, lost) {
  c.globalAlpha = lost ? 0.3 : 1;
  c.lineWidth = 4.5;
  c.strokeStyle = '#f4f1ea'; c.beginPath(); c.arc(x, y, 7, 0, TAU); c.stroke();
  c.strokeStyle = '#d8452f';
  for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(x, y, 7, i * Math.PI / 2 + 0.25, i * Math.PI / 2 + 0.95); c.stroke(); }
  c.globalAlpha = 1;
  if (lost) {
    c.strokeStyle = '#ff5a48'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(x - 7, y - 7); c.lineTo(x + 7, y + 7); c.moveTo(x + 7, y - 7); c.lineTo(x - 7, y + 7); c.stroke();
  }
}

function wrapText(c, text, x, y, maxW, lh) {
  let line = '';
  for (const word of text.split(' ')) {
    const tt = line ? `${line} ${word}` : word;
    if (c.measureText(tt).width > maxW && line) { c.fillText(line, x, y); y += lh; line = word; } else line = tt;
  }
  c.fillText(line, x, y);
  return y + lh;
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const scene = document.createElement('canvas'), dark = document.createElement('canvas');
  const sc = scene.getContext('2d'), dk = dark.getContext('2d');
  let k = 1;

  function resize(cssSize) {
    const px = Math.round(cssSize * Math.min(2, window.devicePixelRatio || 1));
    [canvas, scene, dark].forEach(c => { c.width = px; c.height = px; });
    canvas.style.width = `${cssSize}px`; canvas.style.height = `${cssSize}px`;
    k = px / W;
  }

  function drawScene(s, t, day) {
    const c = sc;
    c.setTransform(k, 0, 0, k, 0, 0);
    const sea = c.createRadialGradient(CX, CY, 40, CX, CY, 470);
    sea.addColorStop(0, '#1f7284'); sea.addColorStop(0.5, '#135a72'); sea.addColorStop(1, '#0b3852');
    c.fillStyle = sea; c.fillRect(0, 0, W, H);
    if (day > 0) { c.fillStyle = `rgba(130,205,222,${0.16 * day})`; c.fillRect(0, 0, W, H); }
    glow(c, CX, CY, 108, 'rgba(110,215,205,0.5)'); // hauts-fonds

    // clapot : six familles de vaguelettes qui s'allument à tour de rôle et dérivent avec le vent
    c.lineCap = 'round'; c.lineWidth = 1.2;
    const driftX = t * (5 + s.wind.x * 1.5), driftY = t * (2 + s.wind.y * 1.5);
    for (let b = 0; b < 6; b++) {
      const a = 0.06 + 0.2 * Math.max(0, Math.sin(t * 1.1 + b * 1.05));
      c.strokeStyle = `rgba(200,238,246,${a})`;
      c.beginPath();
      for (const w of WAVES) {
        if (w.b !== b) continue;
        const x = ((w.x + driftX) % W + W) % W, y = ((w.y + driftY) % H + H) % H;
        c.moveTo(x - w.l / 2, y); c.quadraticCurveTo(x, y - 3, x + w.l / 2, y);
      }
      c.stroke();
    }

    // sillages
    for (const b of s.boats) {
      if (b.state !== 'sailing') continue;
      const n = b.trail.length / 2;
      for (let i = 0; i < n; i++) {
        const x0 = b.trail[2 * i], y0 = b.trail[2 * i + 1];
        const x1 = i + 1 < n ? b.trail[2 * i + 2] : b.x, y1 = i + 1 < n ? b.trail[2 * i + 3] : b.y;
        const f = (i + 1) / n;
        c.strokeStyle = `rgba(225,246,255,${f * 0.34})`; c.lineWidth = 1 + (1 - f) * (b.type === 'cargo' ? 8 : 4.5);
        c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
      }
    }

    // récifs
    s.rocks.forEach((r, i) => {
      foam(c, r.x, r.y, r.r, t, i * 1.3, 0.5);
      foam(c, r.x, r.y, r.r + 5, t * 0.7, i * 2.1, 0.2);
      rockPath(c, r.x + 1.5, r.y + 2.5, r.r, r.shape); c.fillStyle = 'rgba(0,0,0,0.35)'; c.fill();
      rockPath(c, r.x, r.y, r.r, r.shape); c.fillStyle = '#474c55'; c.fill();
      c.strokeStyle = '#23262c'; c.lineWidth = 1.2; c.stroke();
      rockPath(c, r.x - r.r * 0.14, r.y - r.r * 0.18, r.r, r.shape, 0.62); c.fillStyle = '#6a717b'; c.fill();
      rockPath(c, r.x - r.r * 0.22, r.y - r.r * 0.28, r.r, r.shape, 0.3); c.fillStyle = '#8b929c'; c.fill();
      if (r.beacon) {
        c.fillStyle = '#f4f1ea'; c.beginPath(); c.arc(r.x, r.y, 4.2, 0, TAU); c.fill();
        c.fillStyle = '#d8452f'; c.beginPath(); c.arc(r.x, r.y, 2.6, 0, TAU); c.fill();
      }
    });

    // l'île
    foam(c, CX, CY, ISLAND_R + 1, t, 0.4, 0.55);
    foam(c, CX, CY, ISLAND_R + 8, t * 0.6, 2.2, 0.2);
    for (const a of PIERS) {
      c.save(); c.translate(CX, CY); c.rotate(a);
      c.fillStyle = '#7d5f3d'; c.fillRect(ISLAND_R - 6, -2.2, 21, 4.4);
      c.fillStyle = 'rgba(0,0,0,0.25)'; for (let i = 0; i < 5; i++) c.fillRect(ISLAND_R - 3 + i * 4, -2.2, 0.8, 4.4);
      c.restore();
    }
    smoothBlob(c, CX, CY, ISLAND_R, ISLAND); c.fillStyle = '#dcc68c'; c.fill();
    smoothBlob(c, CX, CY, ISLAND_R - 6, ISLAND, 0.5); c.fillStyle = '#5f9455'; c.fill();
    c.fillStyle = '#4f8247';
    [[-14, 6, 9], [12, -6, 8], [2, 15, 7], [-4, -17, 6]].forEach(([x, y, r]) => { c.beginPath(); c.arc(CX + x, CY + y, r, 0, TAU); c.fill(); });
    for (const [x, y, rot] of HOUSES) {
      c.save(); c.translate(CX + x, CY + y); c.rotate(rot);
      c.fillStyle = 'rgba(0,0,0,0.28)'; c.fillRect(-4, -2.5, 10.5, 8.5);
      c.fillStyle = '#b85a43'; c.fillRect(-5, -4, 10, 4);
      c.fillStyle = '#93432f'; c.fillRect(-5, 0, 10, 4);
      c.fillStyle = '#e9e2d0'; c.fillRect(-5, -0.4, 10, 0.8);
      c.restore();
    }
    // bateaux à quai
    for (const m of s.moored) {
      c.save();
      c.translate(CX + Math.cos(m.a) * (QUAY_R - 4), CY + Math.sin(m.a) * (QUAY_R - 4));
      c.rotate(m.a + Math.PI + Math.sin(t * 1.7 + m.look) * 0.06);
      drawBoat(c, m.type, m.look);
      c.restore();
    }
    // le phare
    c.fillStyle = 'rgba(0,0,0,0.3)'; c.beginPath(); c.ellipse(CX + 4, CY + 6, 13, 11, 0.6, 0, TAU); c.fill();
    c.fillStyle = '#f3efe6'; c.beginPath(); c.arc(CX, CY, 12, 0, TAU); c.fill();
    c.fillStyle = '#cf4632'; c.beginPath(); c.arc(CX, CY, 9.2, 0, TAU); c.fill();
    c.fillStyle = '#f3efe6'; c.beginPath(); c.arc(CX, CY, 6.2, 0, TAU); c.fill();
    c.save(); c.translate(CX, CY); c.rotate(s.beam.a);
    c.fillStyle = '#2b2f36'; c.fillRect(-3.5, -3.5, 10, 7);
    c.fillStyle = '#ffe9a0'; c.fillRect(4.5, -2.5, 2.5, 5);
    c.restore();

    // la Chose
    for (const m of s.monsters) if (m.state === 'hunt') drawMonster(c, m, s, t);

    // bateaux
    for (const b of s.boats) {
      c.save();
      c.translate(b.x, b.y);
      if (b.state === 'sinking') {
        const f = Math.min(1, b.t / 200);
        for (let i = 0; i < 3; i++) {
          const rr = b.t * 0.22 + i * 9;
          c.strokeStyle = b.cause === 'monster' ? `rgba(190,150,255,${0.5 * (1 - f)})` : `rgba(235,250,255,${0.55 * (1 - f)})`;
          c.lineWidth = 1.5; c.beginPath(); c.arc(0, 0, rr, 0, TAU); c.stroke();
        }
        for (let i = 0; i < 6; i++) { // débris
          const a = b.look + i * 1.05, d = 4 + f * (14 + (i % 3) * 7);
          c.fillStyle = `rgba(150,110,70,${1 - f})`; c.fillRect(Math.cos(a) * d, Math.sin(a) * d, 2.5, 1.5);
        }
        c.globalAlpha = Math.max(0, 1 - f * 1.4);
        c.rotate(b.h + f * 1.3); c.scale(BOAT_SCALE * (1 - f * 0.45), BOAT_SCALE * (1 - f * 0.45));
      } else {
        c.rotate(b.h + Math.sin(t * 2.1 + b.look) * 0.05);
        c.scale(BOAT_SCALE, BOAT_SCALE);
      }
      drawBoat(c, b.type, b.look);
      c.restore();
    }

    // pluie : sur la scène, donc presque invisible dans le noir et striée d'argent dans le faisceau
    if (s.storm && s.phase !== 'shop') {
      c.strokeStyle = `rgba(215,235,255,${0.5 * (1 - day)})`; c.lineWidth = 1;
      c.beginPath();
      for (const r of RAIN) {
        const x = ((r.x + t * (60 + s.wind.x * 14) * r.v) % W + W) % W, y = ((r.y + t * 520 * r.v) % H + H) % H;
        c.moveTo(x, y); c.lineTo(x - 2 - s.wind.x * 0.5, y - 11);
      }
      c.stroke();
    }
  }

  function drawDark(s, darkA, beamOn, flash) {
    const c = dk;
    c.setTransform(k, 0, 0, k, 0, 0);
    c.globalCompositeOperation = 'source-over';
    c.clearRect(0, 0, W, H);
    c.fillStyle = `rgba(5,9,24,${darkA})`; c.fillRect(0, 0, W, H);
    c.globalCompositeOperation = 'destination-out';
    const { a, half } = s.beam;
    if (beamOn > 0) { // pénombre en fines passes, puis le cœur net : son bord est celui qui compte pour jouer
      for (let i = 9; i >= 1; i--) wedge(c, a, half * (1 + i * 0.11), `rgba(0,0,0,${0.13 * beamOn})`, `rgba(0,0,0,${0.05 * beamOn})`);
      wedge(c, a, half, `rgba(0,0,0,${beamOn})`, `rgba(0,0,0,${0.72 * beamOn})`);
    }
    glow(c, CX, CY, 100, 'rgba(0,0,0,0.9)');
    for (const b of s.boats) if (b.state === 'sailing') glow(c, b.x, b.y, 24, 'rgba(0,0,0,0.6)');
    for (const r of s.rocks) if (r.beacon) glow(c, r.x, r.y, 30, 'rgba(0,0,0,0.75)');
    if (s.hornT > 0) glow(c, CX, CY, 520, `rgba(0,0,0,${0.16 * s.hornT / HORN_TICKS})`);
    if (flash > 0) { c.fillStyle = `rgba(0,0,0,${0.78 * flash})`; c.fillRect(0, 0, W, H); }
    c.globalCompositeOperation = 'source-over';
  }

  function draw(s, view, now) {
    const t = now / 1000;
    const day = s.phase === 'shop' ? 1 : s.phase === 'dawn' ? ease(s.dawnT / DAWN_TICKS) : 0;
    const flash = s.flash > 0 ? (s.flash / 30) * (0.55 + 0.45 * Math.sin(s.flash * 1.9)) : 0;
    const beamOn = 1 - day;

    drawScene(s, t, day);
    drawDark(s, 0.84 * (1 - day), beamOn, flash);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(scene, 0, 0);
    ctx.drawImage(dark, 0, 0);
    ctx.setTransform(k, 0, 0, k, 0, 0);

    // tout ce qui émet de la lumière
    ctx.globalCompositeOperation = 'lighter';
    if (beamOn > 0) {
      wedge(ctx, s.beam.a, s.beam.half, `rgba(255,226,150,${0.27 * beamOn})`, 'rgba(255,226,150,0.03)');
      wedge(ctx, s.beam.a, s.beam.half * 0.45, `rgba(255,244,205,${0.14 * beamOn})`, 'rgba(255,244,205,0)');
      glow(ctx, CX, CY, 26, `rgba(255,236,170,${0.75 * beamOn})`);
    }
    const night = 1 - day;
    const litWindows = Math.min(HOUSES.length, 2 + Math.floor(s.saved / 4));
    HOUSES.slice(0, litWindows).forEach(([x, y]) => glow(ctx, CX + x, CY + y, 7, `rgba(255,205,120,${0.75 * night})`));
    for (const r of s.rocks) if (r.beacon) glow(ctx, r.x, r.y, 12, `rgba(255,80,60,${(0.5 + 0.5 * Math.sin(t * 5)) * night})`);
    for (const b of s.boats) {
      if (b.state !== 'sailing') continue;
      const lx = b.x + Math.cos(b.h) * BOW[b.type], ly = b.y + Math.sin(b.h) * BOW[b.type];
      const blink = Math.sin(t * 16) > 0;
      const col = b.danger ? (blink ? '255,70,50' : '120,30,20') : b.aware ? '140,255,175' : '255,214,140';
      glow(ctx, lx, ly, b.danger ? 12 : 8, `rgba(${col},0.95)`);
    }
    for (const m of s.monsters) {
      if (m.state !== 'hunt') continue;
      const tg = s.boats.find(b => b.id === m.target);
      const a = tg ? Math.atan2(tg.y - m.y, tg.x - m.x) : 0;
      const rise = Math.min(1, (s.tick - m.born) / 40);
      for (const sgn of [-1, 1]) glow(ctx, m.x + Math.cos(a) * 4 - Math.sin(a) * 3.2 * sgn, m.y + Math.sin(a) * 4 + Math.cos(a) * 3.2 * sgn, 4.5, `rgba(215,255,90,${0.9 * rise})`);
    }
    ctx.globalCompositeOperation = 'source-over';

    // alertes : un bateau qui va taper sans le savoir
    ctx.textAlign = 'center';
    for (const b of s.boats) {
      if (b.state !== 'sailing' || !b.danger) continue;
      const p = (t * 1.6) % 1;
      ctx.strokeStyle = `rgba(255,80,60,${0.8 * (1 - p)})`; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(b.x, b.y, 12 + p * 14, 0, TAU); ctx.stroke();
      ctx.fillStyle = '#ff6a55'; ctx.font = '800 15px system-ui, sans-serif';
      ctx.fillText('!', b.x, b.y - 16);
    }
    // jauge de peur de la Chose
    for (const m of s.monsters) {
      if (m.state !== 'hunt' || m.fear <= 0) continue;
      ctx.strokeStyle = '#d7ff5a'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(m.x, m.y, 24, -Math.PI / 2, -Math.PI / 2 + TAU * Math.min(1, m.fear / FEAR_TIME)); ctx.stroke();
    }

    if (flash > 0) { ctx.fillStyle = `rgba(225,235,255,${0.1 * flash})`; ctx.fillRect(0, 0, W, H); }
    if (s.phase === 'dawn') { ctx.fillStyle = `rgba(255,150,105,${0.2 * Math.sin(Math.PI * s.dawnT / DAWN_TICKS)})`; ctx.fillRect(0, 0, W, H); }

    // points et mots qui s'envolent
    view.floaters = view.floaters.filter(f => now - f.t0 < 1100);
    ctx.font = '700 14px system-ui, sans-serif';
    for (const f of view.floaters) {
      const p = (now - f.t0) / 1100;
      ctx.globalAlpha = 1 - p * p; ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y - 14 - 24 * p);
    }
    ctx.globalAlpha = 1;

    drawHud(s, view, now, t);
  }

  function drawHud(s, view, now, t) {
    ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 6;
    if (s.phase !== 'title') {
      ctx.textAlign = 'left';
      ctx.fillStyle = '#fff'; ctx.font = 'italic 21px Georgia, serif';
      ctx.fillText(`Nuit ${s.night}`, 16, 30);
      ctx.font = '700 17px system-ui, sans-serif'; ctx.fillStyle = '#ffd98a';
      ctx.fillText(`${s.score}`, 16, 52);
      const left = s.queue.length + s.boats.filter(b => b.state === 'sailing').length;
      if (s.phase === 'night') {
        ctx.font = '500 12px system-ui, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.65)';
        ctx.fillText(`encore ${left} en mer`, 16, 70);
      }
      ctx.shadowBlur = 0;
      for (let i = 0; i < s.maxWrecks; i++) buoyIcon(ctx, W - 22 - i * 25, 24, i >= s.maxWrecks - s.wrecks);
      ctx.shadowBlur = 6;
    }

    // radio
    if (view.radio && now - view.radio.t0 < 4200) {
      const p = (now - view.radio.t0) / 4200;
      ctx.globalAlpha = p < 0.08 ? p / 0.08 : p > 0.8 ? (1 - p) / 0.2 : 1;
      ctx.font = 'italic 14px Georgia, serif'; ctx.textAlign = 'center';
      const w = Math.min(W - 40, ctx.measureText(view.radio.text).width + 28);
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(6,10,22,0.72)';
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(W / 2 - w / 2, H - 46, w, 28, 14) : ctx.rect(W / 2 - w / 2, H - 46, w, 28); ctx.fill();
      ctx.fillStyle = view.radio.color || '#f3efe6';
      ctx.fillText(view.radio.text, W / 2, H - 27, W - 60);
      ctx.globalAlpha = 1; ctx.shadowBlur = 6;
    }

    // bandeau de début de nuit
    if (view.banner && now - view.banner.t0 < 3600 && s.phase === 'night') {
      const p = (now - view.banner.t0) / 3600;
      ctx.globalAlpha = p < 0.1 ? p / 0.1 : p > 0.75 ? (1 - p) / 0.25 : 1;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff'; ctx.font = 'italic 40px Georgia, serif';
      ctx.fillText(view.banner.text, W / 2, 150);
      ctx.font = '15px system-ui, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.85)';
      wrapText(ctx, view.banner.sub, W / 2, 180, 420, 21);
      ctx.globalAlpha = 1;
    }

    ctx.textAlign = 'center';
    if (s.phase === 'title') {
      ctx.shadowColor = 'rgba(255,220,140,0.55)'; ctx.shadowBlur = 24;
      ctx.fillStyle = '#fff6dc'; ctx.font = 'italic 62px Georgia, serif';
      ctx.fillText('Phare Ouest', W / 2, 150);
      ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 6;
      ctx.fillStyle = 'rgba(255,255,255,0.86)'; ctx.font = '16px system-ui, sans-serif';
      const y = wrapText(ctx, 'Les capitaines sont aveugles. Un bateau ne voit les récifs que dans ta lumière — et il oublie vite.', W / 2, 186, 430, 23);
      ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = 'italic 14px Georgia, serif';
      ctx.fillText('Un seul faisceau. Trois naufrages, et on te retire les clés.', W / 2, y + 6);
      ctx.fillStyle = `rgba(255,217,138,${0.6 + 0.4 * Math.sin(t * 3.3)})`; ctx.font = '600 15px system-ui, sans-serif';
      ctx.fillText(view.touch ? 'Touche la mer pour prendre ton quart' : 'Clique pour prendre ton quart', W / 2, H - 70);
      if (view.best > 0) { ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '12px system-ui, sans-serif'; ctx.fillText(`record : ${view.best}`, W / 2, H - 48); }
    }
    if (s.phase === 'dawn') {
      ctx.globalAlpha = Math.min(1, s.dawnT / 50);
      ctx.fillStyle = '#fff'; ctx.font = 'italic 44px Georgia, serif';
      ctx.fillText('L’aube', W / 2, 150);
      ctx.font = '16px system-ui, sans-serif';
      const st = s.stats;
      ctx.fillText(`${st.saved} rentré${st.saved > 1 ? 's' : ''} · ${st.lost} naufrage${st.lost > 1 ? 's' : ''}`, W / 2, 182);
      if (st.bonus) { ctx.fillStyle = '#ffd98a'; ctx.font = '700 15px system-ui, sans-serif'; ctx.fillText(`Nuit blanche, nuit parfaite : +${st.bonus}`, W / 2, 208); }
      ctx.globalAlpha = 1;
    }
    if (s.phase === 'over') {
      ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(5,8,18,0.6)'; ctx.fillRect(0, 100, W, 150); ctx.shadowBlur = 6;
      ctx.fillStyle = '#fff'; ctx.font = 'italic 38px Georgia, serif';
      ctx.fillText(view.record ? 'Record… et clés confisquées' : 'Clés confisquées', W / 2, 150);
      ctx.font = '15px system-ui, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.fillText(`Tu as tenu ${s.night} nuit${s.night > 1 ? 's' : ''} et ramené ${s.saved} bateau${s.saved > 1 ? 'x' : ''} à bon port.`, W / 2, 182);
      ctx.fillStyle = '#ffd98a'; ctx.font = '700 22px system-ui, sans-serif';
      ctx.fillText(`${s.score} points`, W / 2, 218);
    }
    ctx.shadowBlur = 0;
  }

  return { resize, draw };
}
