import React, { useEffect, useRef } from 'react';
import { ZONES } from '../engine/terrain';

const preparer = (canvas, hauteur) => {
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.clientWidth, H = hauteur;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  return [ctx, W, H];
};
const style = (h) => ({ width: '100%', height: h, display: 'block', borderRadius: 8, background: 'rgba(255,255,255,0.03)' });

// Progrès : le meilleur (or) et la médiane (gris) de chaque génération, avec les paliers de la piste
export function CourbeDistance({ historique, version, hauteur = 120 }) {
  const ref = useRef(null);
  useEffect(() => {
    const [ctx, W, H] = preparer(ref.current, hauteur);
    if (historique.length < 2) return;
    const n = historique.length;
    const max = Math.max(5, ...historique.map((h) => h.meilleur)) * 1.1;
    const x = (k) => (k / (n - 1)) * (W - 4) + 2;
    const y = (v) => H - 4 - (Math.max(0, v) / max) * (H - 10);

    ctx.font = '10px system-ui, sans-serif';
    ZONES.forEach((z) => {
      if (z.x <= 0 || z.x > max) return;
      ctx.strokeStyle = z.couleur + '90';
      ctx.setLineDash([3, 4]);
      ctx.beginPath(); ctx.moveTo(0, y(z.x)); ctx.lineTo(W, y(z.x)); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = z.couleur;
      ctx.fillText(z.nom, 4, Math.max(10, y(z.x) - 3));
    });
    const ligne = (cle, couleur, largeur) => {
      ctx.beginPath();
      historique.forEach((h, k) => ctx.lineTo(x(k), y(h[cle])));
      ctx.strokeStyle = couleur;
      ctx.lineWidth = largeur;
      ctx.stroke();
    };
    ligne('mediane', 'rgba(200,210,220,0.6)', 1.2);
    ligne('meilleur', '#ffb300', 2);
  }, [historique, version, hauteur]);
  return <canvas ref={ref} style={style(hauteur)} />;
}

// Lignées : part des 5 espèces les plus nombreuses du moment, empilée sur les générations
// (le reste en gris). Rangées dans l'ordre de l'arbre (une fille juste à côté de sa mère) :
// on voit les formes naître les unes des autres et se remplacer (diagramme de Muller simplifié).
export function CourbeEspeces({ historique, especesParId, version, hauteur = 130 }) {
  const ref = useRef(null);
  useEffect(() => {
    const [ctx, W, H] = preparer(ref.current, hauteur);
    if (historique.length < 2) return;
    const fenetre = historique.slice(-120);
    const n = fenetre.length;
    const derniers = fenetre[n - 1].effectifs;
    const presentes = new Set(Object.keys(derniers).sort((a, b) => derniers[b] - derniers[a]).slice(0, 5).map(Number));

    const enfants = new Map();
    especesParId.forEach((e) => {
      const p = e.parent ?? -1;
      if (!enfants.has(p)) enfants.set(p, []);
      enfants.get(p).push(e.id);
    });
    const ordre = [];
    const parcourir = (id) => {
      if (presentes.has(id)) ordre.push(id);
      (enfants.get(id) || []).forEach(parcourir);
    };
    (enfants.get(-1) || []).forEach(parcourir);

    // Parts lissées sur 5 générations : avec 100 individus, l'effectif brut zigzague
    const parts = fenetre.map((h) => {
      const t = sommer(h.effectifs), p = {};
      for (const id in h.effectifs) p[id] = h.effectifs[id] / t;
      return p;
    });
    const lisse = (id, k) => {
      let s = 0, m = 0;
      for (let j = Math.max(0, k - 2); j <= Math.min(n - 1, k + 2); j++) { s += parts[j][id] || 0; m++; }
      return s / m;
    };
    const x = (k) => (k / (n - 1)) * W;
    const cumul = new Array(n).fill(0);
    ordre.forEach((id) => {
      const e = especesParId[id];
      const haut = fenetre.map((h, k) => cumul[k] + lisse(id, k));
      ctx.beginPath();
      for (let k = 0; k < n; k++) ctx.lineTo(x(k), H - haut[k] * H);
      for (let k = n - 1; k >= 0; k--) ctx.lineTo(x(k), H - cumul[k] * H);
      ctx.closePath();
      ctx.fillStyle = `hsla(${e.teinte}, 60%, 55%, 0.9)`;
      ctx.fill();
      for (let k = 0; k < n; k++) cumul[k] = haut[k];
    });
    // Toutes les autres espèces, regroupées
    ctx.beginPath();
    for (let k = 0; k < n; k++) ctx.lineTo(x(k), 0);
    for (let k = n - 1; k >= 0; k--) ctx.lineTo(x(k), H - cumul[k] * H);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    ctx.fill();
  }, [historique, especesParId, version, hauteur]);
  return <canvas ref={ref} style={style(hauteur)} />;
}

const sommer = (o) => {
  let s = 0;
  for (const k in o) s += o[k];
  return s || 1;
};
