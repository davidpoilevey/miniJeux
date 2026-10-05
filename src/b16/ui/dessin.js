import { ZONES } from '../engine/terrain';

// Tout le dessin canvas, en fonctions pures (ctx, données) : testable hors React.
// Coordonnées monde en mètres, y vers le haut ; la caméra fait la conversion.

export const camera = (W, H) => ({ x: 2, y: 0, s: Math.max(28, Math.min(W / 9, H / 3.4)), W, H });
const X = (cam, x) => (x - cam.x) * cam.s + cam.W * 0.42;
const Y = (cam, y) => cam.H * 0.74 - (y - cam.y) * cam.s;

// ── Décor ──
export function dessinerDecor(ctx, cam, terrain, record) {
  const { W, H, s } = cam;
  const ciel = ctx.createLinearGradient(0, 0, 0, H);
  ciel.addColorStop(0, '#9fd3f5');
  ciel.addColorStop(0.65, '#fdf1d6');
  ctx.fillStyle = ciel;
  ctx.fillRect(0, 0, W, H);

  // Collines lointaines en parallaxe : elles donnent la sensation de vitesse
  const colline = (lent, hauteur, couleur, freq) => {
    ctx.fillStyle = couleur;
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let px = 0; px <= W + 8; px += 8) {
      const xm = (px - W * 0.42) / s + cam.x * lent;
      ctx.lineTo(px, H * 0.62 - hauteur * (0.6 + 0.4 * Math.sin(xm * freq) * Math.sin(xm * freq * 0.37 + 1)));
    }
    ctx.lineTo(W, H);
    ctx.fill();
  };
  colline(0.15, H * 0.16, '#c9dfc0', 0.5);
  colline(0.35, H * 0.1, '#a9cf9f', 0.8);

  // Sol : terre + liseré de la couleur de la zone
  const x0 = cam.x - (W * 0.42) / s, x1 = x0 + W / s;
  const pas = 4 / s;
  ctx.beginPath();
  ctx.moveTo(0, H);
  for (let x = x0; x <= x1 + pas; x += pas) ctx.lineTo(X(cam, x), Y(cam, terrain.hauteur(x)));
  ctx.lineTo(W, H);
  ctx.closePath();
  const terre = ctx.createLinearGradient(0, Y(cam, cam.y), 0, H);
  terre.addColorStop(0, '#8a6a4a');
  terre.addColorStop(1, '#4e3a2a');
  ctx.fillStyle = terre;
  ctx.fill();
  ZONES.forEach((z, k) => {
    const a = Math.max(x0, z.x), b = Math.min(x1, k + 1 < ZONES.length ? ZONES[k + 1].x : Infinity);
    if (a >= b) return;
    if (z.surface) {
      // Couche de sable ou de glace : une bande sous la surface
      const ep = 0.14;
      ctx.beginPath();
      for (let x = a; x <= b + pas; x += pas) ctx.lineTo(X(cam, Math.min(x, b)), Y(cam, terrain.hauteur(Math.min(x, b))));
      for (let x = b; x >= a - pas; x -= pas) ctx.lineTo(X(cam, Math.max(x, a)), Y(cam, terrain.hauteur(Math.max(x, a)) - ep));
      ctx.closePath();
      ctx.fillStyle = z.surface;
      ctx.fill();
      if (z.adherence < 0.3) {
        // Reflets : la glace se reconnaît sans lire le panneau
        ctx.strokeStyle = 'rgba(255,255,255,0.9)';
        ctx.lineWidth = Math.max(1.5, s * 0.015);
        for (let m = Math.ceil(a / 0.9) * 0.9; m < b - 0.3; m += 0.9) {
          const gx = X(cam, m), gy = Y(cam, terrain.hauteur(m)) + s * 0.03;
          ctx.beginPath(); ctx.moveTo(gx, gy + s * 0.07); ctx.lineTo(gx + s * 0.12, gy); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(gx + s * 0.1, gy + s * 0.08); ctx.lineTo(gx + s * 0.16, gy + s * 0.045); ctx.stroke();
        }
      }
    }
    ctx.beginPath();
    for (let x = a; x <= b + pas; x += pas) ctx.lineTo(X(cam, Math.min(x, b)), Y(cam, terrain.hauteur(Math.min(x, b))));
    ctx.strokeStyle = z.couleur;
    ctx.lineWidth = Math.max(3, s * 0.06);
    ctx.stroke();
  });

  // Graduations : un trait par mètre, un poteau tous les 5 m
  ctx.textAlign = 'center';
  for (let m = Math.ceil(x0); m <= x1; m++) {
    const gx = X(cam, m), gy = Y(cam, terrain.hauteur(m));
    if (m % 5 === 0 && m !== 0) {
      ctx.fillStyle = 'rgba(60,40,25,0.55)';
      ctx.fillRect(gx - 1.5, gy - s * 0.5, 3, s * 0.5);
      ctx.font = `600 ${Math.max(11, s * 0.2)}px system-ui, sans-serif`;
      ctx.fillText(`${m} m`, gx, gy - s * 0.56);
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillRect(gx - 1, gy + 3, 2, s * 0.12);
    }
  }

  // Panneaux de zone
  ZONES.forEach((z) => {
    if (z.x < x0 - 2 || z.x > x1 + 2) return;
    const gx = X(cam, z.x), gy = Y(cam, terrain.hauteur(z.x));
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(gx - 2, gy - s * 1.1, 4, s * 1.1);
    ctx.font = `700 ${Math.max(12, s * 0.2)}px system-ui, sans-serif`;
    const lw = ctx.measureText(z.nom).width + 16;
    ctx.fillStyle = z.couleur;
    ctx.fillRect(gx - lw / 2, gy - s * 1.1 - s * 0.32, lw, s * 0.32);
    ctx.fillStyle = '#fff';
    ctx.fillText(z.nom, gx, gy - s * 1.1 - s * 0.1);
  });

  // Ligne de départ en damier
  if (x0 < 1 && x1 > -1) {
    const gx = X(cam, 0), gy = Y(cam, 0), c = Math.max(4, s * 0.06);
    for (let k = 0; k < 12; k++) {
      ctx.fillStyle = k % 2 ? '#222' : '#fff';
      ctx.fillRect(gx - c, gy - (k + 1) * c, c, c);
      ctx.fillStyle = k % 2 ? '#fff' : '#222';
      ctx.fillRect(gx, gy - (k + 1) * c, c, c);
    }
  }

  // Drapeau du record
  if (record && record.distance > 0.5 && record.distance > x0 - 1 && record.distance < x1 + 1) {
    const gx = X(cam, record.distance), gy = Y(cam, terrain.hauteur(record.distance));
    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx, gy - s * 1.6); ctx.stroke();
    ctx.fillStyle = '#ffb300';
    ctx.beginPath(); ctx.moveTo(gx, gy - s * 1.6); ctx.lineTo(gx + s * 0.45, gy - s * 1.45); ctx.lineTo(gx, gy - s * 1.3); ctx.fill();
    ctx.font = `700 ${Math.max(11, s * 0.17)}px system-ui, sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#5d4037';
    ctx.fillText(`record ${record.distance.toFixed(1)} m`, gx + 5, gy - s * 1.66);
  }
}

// ── Créatures ──
const mix = (a, b, t) => a.map((v, k) => Math.round(v + (b[k] - v) * t));
const MUSCLE_DETENDU = [244, 160, 190], MUSCLE_CONTRACTE = [200, 20, 70];

// Fantôme : quelques traits, pour les 100 concurrents qui courent en même temps
export function dessinerFantome(ctx, cam, c, teinte, alpha) {
  const { px, py } = c;
  ctx.strokeStyle = `hsla(${teinte}, 55%, 40%, ${alpha})`;
  ctx.lineWidth = Math.max(1, cam.s * 0.02);
  ctx.beginPath();
  c.corps.aretes.forEach((e) => {
    if (e.muscle && e.bloque) return;
    ctx.moveTo(X(cam, px[e.a]), Y(cam, py[e.a]));
    ctx.lineTo(X(cam, px[e.b]), Y(cam, py[e.b]));
  });
  ctx.stroke();
  ctx.fillStyle = `hsla(${teinte}, 55%, 45%, ${alpha})`;
  ctx.beginPath();
  for (let i = 0; i < c.n; i++) {
    ctx.moveTo(X(cam, px[i]) + c.r[i] * cam.s * 0.6, Y(cam, py[i]));
    ctx.arc(X(cam, px[i]), Y(cam, py[i]), c.r[i] * cam.s * 0.6, 0, Math.PI * 2);
  }
  ctx.fill();
}

// Pose figée (chronophotographie, vignettes) : mêmes traits qu'un fantôme, positions fournies
export function dessinerPose(ctx, cam, corps, px, py, teinte, alpha) {
  dessinerFantome(ctx, cam, { corps, px, py, n: corps.noeuds.length, r: corps.noeuds.map((n) => n.r) }, teinte, alpha);
}

// Créature complète : chair, os, muscles qui gonflent, griffes, œil
export function dessinerCreature(ctx, cam, c, teinte, t, alpha = 1) {
  const { px, py } = c;
  const { noeuds, aretes, triangles } = c.corps;
  const sx = (i) => X(cam, px[i]), sy = (i) => Y(cam, py[i]);
  const s = cam.s;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.lineCap = 'round';

  // Chair : les triangles fermés du squelette
  ctx.fillStyle = `hsla(${teinte}, 65%, 72%, 0.55)`;
  triangles.forEach(([a, b, d]) => {
    ctx.beginPath();
    ctx.moveTo(sx(a), sy(a)); ctx.lineTo(sx(b), sy(b)); ctx.lineTo(sx(d), sy(d));
    ctx.fill();
  });

  // Os d'abord, muscles par-dessus
  aretes.forEach((e) => {
    if (e.muscle) return;
    ctx.strokeStyle = '#4a3b35';
    ctx.lineWidth = Math.max(3, s * 0.06);
    ctx.beginPath(); ctx.moveTo(sx(e.a), sy(e.a)); ctx.lineTo(sx(e.b), sy(e.b)); ctx.stroke();
    ctx.strokeStyle = '#f1e7d8';
    ctx.lineWidth = Math.max(1.5, s * 0.028);
    ctx.stroke();
  });
  aretes.forEach((e, k) => {
    if (!e.muscle) return;
    ctx.beginPath(); ctx.moveTo(sx(e.a), sy(e.a)); ctx.lineTo(sx(e.b), sy(e.b));
    if (e.bloque) {
      // Muscle atrophié : sa longueur est déjà fixée par les os, il ne sert à rien
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(120,110,110,0.6)';
      ctx.lineWidth = Math.max(1, s * 0.015);
      ctx.stroke();
      ctx.setLineDash([]);
      return;
    }
    const tension = c.tension[k];
    const [r, g, b] = mix(MUSCLE_DETENDU, MUSCLE_CONTRACTE, (tension + 1) / 2);
    ctx.strokeStyle = `rgb(${r},${g},${b})`;
    ctx.lineWidth = Math.max(2, s * (0.045 + 0.035 * tension * e.uAmpli));
    ctx.stroke();
  });

  // Nœuds : patins clairs (glissent), semelles foncées (accrochent)
  noeuds.forEach((nd, i) => {
    const x = sx(i), y = sy(i), r = nd.r * s;
    if (nd.griffe) {
      // Trois griffes vers le sol : écartées et sombres quand elles sont plantées
      const plantee = c.agrippe[i];
      ctx.strokeStyle = plantee ? '#2b1d14' : '#9e8a7a';
      ctx.lineWidth = Math.max(1.5, s * 0.022);
      for (let k = -1; k <= 1; k++) {
        const ang = Math.PI / 2 + k * (plantee ? 0.7 : 0.35);
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(ang) * r * 0.6, y + Math.sin(ang) * r * 0.6);
        ctx.lineTo(x + Math.cos(ang) * r * 1.6, y + Math.sin(ang) * r * 1.6);
        ctx.stroke();
      }
    }
    const l = 68 - nd.mu * 32; // patin clair, semelle foncée
    ctx.fillStyle = `hsl(${teinte}, 45%, ${l}%)`;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = `hsl(${teinte}, 40%, 25%)`;
    ctx.lineWidth = Math.max(1, s * 0.012);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath(); ctx.arc(x - r * 0.35, y - r * 0.35, r * 0.3, 0, Math.PI * 2); ctx.fill();
  });

  // L'œil, sur la tête (nœud 0) : regarde là où il va, cligne de temps en temps
  const x = sx(0), y = sy(0), r = noeuds[0].r * s;
  const vx = px[0] - c.ox[0], vy = py[0] - c.oy[0];
  const v = Math.hypot(vx, vy) || 1;
  const cligne = (t % 3.7) < 0.12;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  if (cligne) ctx.ellipse(x, y, r * 0.75, r * 0.12, 0, 0, Math.PI * 2);
  else ctx.arc(x, y, r * 0.75, 0, Math.PI * 2);
  ctx.fill();
  if (!cligne) {
    ctx.fillStyle = '#1b1b1b';
    ctx.beginPath();
    ctx.arc(x + (0.3 + 0.7 * (vx / v)) * r * 0.25, y - (vy / v) * r * 0.25, r * 0.36, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// Couronne + étiquette au-dessus du meneur
export function dessinerEtiquette(ctx, cam, c, texte, couleur, couronne) {
  let haut = Infinity, cx = 0;
  for (let i = 0; i < c.n; i++) {
    const y = Y(cam, c.py[i]) - c.r[i] * cam.s;
    if (y < haut) haut = y;
    cx += X(cam, c.px[i]) / c.n;
  }
  const y = haut - 12;
  if (couronne) {
    const k = Math.max(8, cam.s * 0.13);
    ctx.fillStyle = '#ffc107';
    ctx.strokeStyle = '#a07800';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - k, y); ctx.lineTo(cx - k, y - k); ctx.lineTo(cx - k / 2, y - k * 0.5); ctx.lineTo(cx, y - k * 1.2);
    ctx.lineTo(cx + k / 2, y - k * 0.5); ctx.lineTo(cx + k, y - k); ctx.lineTo(cx + k, y); ctx.closePath();
    ctx.fill(); ctx.stroke();
  }
  ctx.font = `700 ${Math.max(11, cam.s * 0.16)}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  const ty = y - (couronne ? cam.s * 0.2 : 0) - 6;
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.strokeText(texte, cx, ty);
  ctx.fillStyle = couleur;
  ctx.fillText(texte, cx, ty);
}

// ── Interface dessinée dans le canvas ──
export function dessinerHUD(ctx, W, H, h) {
  const p = Math.min(1, h.t / h.duree);
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(30,30,40,0.88)';
  ctx.font = '800 22px system-ui, sans-serif';
  ctx.fillText(h.titre, 16, 34);
  ctx.font = '500 13px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(30,30,40,0.7)';
  ctx.fillText(h.sousTitre, 16, 54);

  // Chrono
  const bw = Math.min(220, W * 0.4);
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.fillRect(16, 64, bw, 6);
  ctx.fillStyle = p < 0.85 ? '#43a047' : '#e53935';
  ctx.fillRect(16, 64, bw * p, 6);
  ctx.fillStyle = 'rgba(30,30,40,0.6)';
  ctx.font = '500 11px system-ui, sans-serif';
  ctx.fillText(`${h.t.toFixed(1)} / ${h.duree} s`, 16 + bw + 8, 71);

  // Mini-carte de la course : chaque point est une créature
  if (h.positions) {
    const mx0 = W * 0.5, mw = W * 0.5 - 16, my = 22;
    const xmax = Math.max(10, h.record * 1.15, ...h.positions.map((q) => q.x)) ;
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.fillRect(mx0, my - 2, mw, 4);
    ZONES.forEach((z, k) => {
      if (z.x > xmax) return;
      const a = mx0 + (Math.max(0, z.x) / xmax) * mw;
      const b = mx0 + (Math.min(xmax, ZONES[k + 1]?.x ?? xmax) / xmax) * mw;
      ctx.fillStyle = z.couleur;
      ctx.fillRect(a, my - 2, b - a, 4);
    });
    h.positions.forEach((q) => {
      ctx.fillStyle = q.couleur;
      ctx.beginPath();
      ctx.arc(mx0 + (Math.max(0, q.x) / xmax) * mw, my + (q.y || 0), q.gros ? 4.5 : 2.5, 0, Math.PI * 2);
      ctx.fill();
    });
    if (h.record > 0) {
      const rx = mx0 + (h.record / xmax) * mw;
      ctx.fillStyle = '#ffb300';
      ctx.fillRect(rx - 1, my - 9, 2, 16);
    }
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(30,30,40,0.65)';
    ctx.font = '500 11px system-ui, sans-serif';
    ctx.fillText(h.legendeCarte, mx0 + mw, my + 20);
  }

  // Bandeau d'événement (fin de génération, record…)
  if (h.bandeau && h.bandeau.age < 2.5) {
    const a = Math.min(1, (2.5 - h.bandeau.age) * 2);
    ctx.globalAlpha = a;
    ctx.font = '800 20px system-ui, sans-serif';
    const lw = ctx.measureText(h.bandeau.texte).width + 40;
    ctx.fillStyle = 'rgba(25,25,35,0.82)';
    const bx = (W - lw) / 2, by = H * 0.18;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(bx, by, lw, 42, 21) : ctx.rect(bx, by, lw, 42);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(h.bandeau.texte, W / 2, by + 28);
    ctx.globalAlpha = 1;
  }

  // Légende
  const ly = H - 14;
  ctx.font = '500 11px system-ui, sans-serif';
  ctx.textAlign = 'left';
  let lx = 16;
  const item = (dessin, texte) => {
    dessin(lx, ly - 4);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillText(texte, lx + 26, ly);
    lx += 26 + ctx.measureText(texte).width + 14;
  };
  ctx.lineCap = 'round';
  item((x, y) => { ctx.strokeStyle = '#4a3b35'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 20, y); ctx.stroke(); ctx.strokeStyle = '#f1e7d8'; ctx.lineWidth = 2; ctx.stroke(); }, 'os');
  item((x, y) => { const g = ctx.createLinearGradient(x, 0, x + 20, 0); g.addColorStop(0, 'rgb(244,160,190)'); g.addColorStop(1, 'rgb(200,20,70)'); ctx.strokeStyle = g; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 20, y); ctx.stroke(); }, 'muscle (rouge = contracté)');
  item((x, y) => { ctx.strokeStyle = '#2b1d14'; ctx.lineWidth = 2; for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(x + 10, y - 2); ctx.lineTo(x + 10 + k * 6, y + 5); ctx.stroke(); } ctx.fillStyle = '#7a6a5a'; ctx.beginPath(); ctx.arc(x + 10, y - 3, 4, 0, 7); ctx.fill(); }, 'griffe');
}

export { X as versEcranX, Y as versEcranY };
