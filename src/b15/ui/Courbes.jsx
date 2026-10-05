import React, { useEffect, useRef } from 'react';

// Aires empilées des 3 catégories (guildes ou armes) + ligne des lignées effectives.
export default function Courbes({ historique, cle, couleurs, version, hauteur = 110 }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.clientWidth, H = hauteur;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);
    if (historique.length < 2) return;

    const n = historique.length;
    const max = Math.max(1, ...historique.map((h) => h.population));
    const x = (k) => (k / (n - 1)) * W;
    const y = (v) => H - (v / max) * (H - 4);

    // Aires empilées, de bas en haut
    const cumul = new Array(n).fill(0);
    for (let c = 0; c < 3; c++) {
      ctx.beginPath();
      for (let k = 0; k < n; k++) ctx.lineTo(x(k), y(cumul[k] + historique[k][cle][c]));
      for (let k = n - 1; k >= 0; k--) ctx.lineTo(x(k), y(cumul[k]));
      ctx.closePath();
      ctx.fillStyle = couleurs[c] + 'b0';
      ctx.fill();
      for (let k = 0; k < n; k++) cumul[k] += historique[k][cle][c];
    }

    // Lignées effectives (échelle propre, en blanc)
    const maxL = Math.max(1, ...historique.map((h) => h.lignees));
    ctx.beginPath();
    for (let k = 0; k < n; k++) ctx.lineTo(x(k), H - (historique[k].lignees / maxL) * (H - 6) - 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }, [historique, cle, couleurs, version, hauteur]);

  return <canvas ref={ref} style={{ width: '100%', height: hauteur, display: 'block', borderRadius: 8, background: 'rgba(255,255,255,0.03)' }} />;
}
