import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { peindre } from './peindre';

// Le canvas : boucle rAF qui fait avancer la soupe et la peint.
// Aucune entité ne transite par le state React ; seules les stats remontent (4 Hz).
export default function Gelose({ soupeRef, enMarche, mode, couches, ticksParFrame, selection, onSelection, onStats }) {
  const boiteRef = useRef(null);
  const canvasRef = useRef(null);
  const etat = useRef({});
  etat.current = { enMarche, mode, couches, ticksParFrame, selection, onStats };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const hors = document.createElement('canvas');
    const ctxHors = hors.getContext('2d');
    let image = null;
    let raf;
    let dernieresStats = 0;

    const boucle = (t) => {
      const s = soupeRef.current;
      const e = etat.current;
      if (hors.width !== s.W || hors.height !== s.H) {
        hors.width = s.W;
        hors.height = s.H;
        image = ctxHors.createImageData(s.W, s.H);
      }
      if (e.enMarche) for (let k = 0; k < e.ticksParFrame; k++) s.step();

      peindre(s, image.data, e.couches, e.mode);
      ctxHors.putImageData(image, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(hors, 0, 0, canvas.width, canvas.height);

      const b = e.selection;
      if (b && !b.mort) {
        const k = canvas.width / s.W;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(1.5, k * 0.4);
        ctx.beginPath();
        ctx.arc(((b.i % s.W) + 0.5) * k, (((b.i / s.W) | 0) + 0.5) * k, k * 3, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (t - dernieresStats > 250) {
        dernieresStats = t;
        e.onStats(s.stats);
      }
      raf = requestAnimationFrame(boucle);
    };
    raf = requestAnimationFrame(boucle);
    return () => cancelAnimationFrame(raf);
  }, [soupeRef]);

  // Le canvas épouse la place disponible en gardant le ratio de la grille
  useEffect(() => {
    const ajuster = () => {
      const s = soupeRef.current;
      const boite = boiteRef.current;
      const canvas = canvasRef.current;
      if (!boite || !canvas) return;
      const r = Math.min(boite.clientWidth / s.W, boite.clientHeight / s.H);
      const dpr = window.devicePixelRatio || 1;
      canvas.style.width = `${Math.floor(s.W * r)}px`;
      canvas.style.height = `${Math.floor(s.H * r)}px`;
      canvas.width = Math.round(s.W * r * dpr);
      canvas.height = Math.round(s.H * r * dpr);
    };
    const ro = new ResizeObserver(ajuster);
    ro.observe(boiteRef.current);
    return () => ro.disconnect();
  }, [soupeRef]);

  const cliquer = (ev) => {
    const s = soupeRef.current;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor(((ev.clientX - rect.left) / rect.width) * s.W);
    const y = Math.floor(((ev.clientY - rect.top) / rect.height) * s.H);
    // La plus proche dans un rayon de 2 cases : les doigts sont plus gros que les bactéries
    let trouvee = null, d2min = Infinity;
    for (let dy = -2; dy <= 2; dy++)
      for (let dx = -2; dx <= 2; dx++) {
        const b = s.bacterieEn(x + dx, y + dy);
        if (b && dx * dx + dy * dy < d2min) { d2min = dx * dx + dy * dy; trouvee = b; }
      }
    onSelection(trouvee);
  };

  return (
    <Box ref={boiteRef} sx={{ flex: 1, minHeight: 0, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <canvas
        ref={canvasRef}
        onClick={cliquer}
        style={{ borderRadius: 14, cursor: 'crosshair', imageRendering: 'pixelated', boxShadow: '0 0 60px rgba(93,255,138,0.07), 0 0 0 1px rgba(255,255,255,0.06)' }}
      />
    </Box>
  );
}
