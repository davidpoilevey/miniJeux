import React, { memo, useEffect, useRef } from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import { Creature } from '../engine/Creature';
import { decrireMorphotype } from '../engine/corps';
import { Terrain } from '../engine/terrain';
import { dessinerCreature } from './dessin';

// La galerie des champions : un portrait par génération, au repos.
// On y lit l'évolution de la forme ; un clic lance le replay.
const PLAT = new Terrain(0);
const LARG = 92, HAUT = 64;

const Portrait = memo(function Portrait({ champion, espece }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = LARG * dpr;
    canvas.height = HAUT * dpr;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const c = new Creature(champion.corps, PLAT);
    let x0 = Infinity, x1 = -Infinity, y1 = 0;
    for (let i = 0; i < c.n; i++) {
      x0 = Math.min(x0, c.px[i] - c.r[i]); x1 = Math.max(x1, c.px[i] + c.r[i]);
      y1 = Math.max(y1, c.py[i] + c.r[i]);
    }
    const s = Math.min((LARG - 10) / (x1 - x0), (HAUT - 14) / y1);
    // Caméra ad hoc : même convention que dessin.js (x à 42 %, sol à 74 %)
    const cam = { s, W: LARG, H: HAUT, x: (x0 + x1) / 2 - (LARG * 0.08) / s, y: (HAUT - 6 - HAUT * 0.74) / s };
    ctx.fillStyle = `hsla(${espece.teinte}, 40%, 92%, 1)`;
    ctx.fillRect(0, 0, LARG, HAUT);
    ctx.fillStyle = '#8a6a4a';
    ctx.fillRect(0, HAUT - 6, LARG, 6);
    dessinerCreature(ctx, cam, c, espece.teinte, 1);
  }, [champion, espece]);
  return <canvas ref={ref} style={{ width: LARG, height: HAUT, display: 'block', borderRadius: 6 }} />;
});

export default function Galerie({ champions, especesParId, choisi, onChoisir, version }) {
  const defil = useRef(null);
  useEffect(() => {
    const d = defil.current;
    if (d) d.scrollLeft = d.scrollWidth;
  }, [version]);

  return (
    <Box ref={defil} sx={{ display: 'flex', gap: 1, overflowX: 'auto', py: 1, px: 0.5, minHeight: 104 }}>
      {champions.length === 0 && (
        <Typography sx={{ fontSize: 12, color: 'text.secondary', fontStyle: 'italic', alignSelf: 'center', px: 1 }}>
          Ici s'aligneront les champions de chaque génération. Cliquez-en un pour revoir sa course.
        </Typography>
      )}
      {champions.map((ch, k) => {
        const e = especesParId[ch.espece];
        const nouvelle = k > 0 && champions[k - 1].corps.morphotype !== ch.corps.morphotype;
        const actif = choisi && choisi.generation === ch.generation;
        return (
          <Tooltip key={ch.generation} title={`${e.nom} : ${decrireMorphotype(ch.corps.morphotype)}`}>
            <Box onClick={() => onChoisir(ch)} sx={{
              flexShrink: 0, cursor: 'pointer', borderRadius: 2, p: 0.5, position: 'relative',
              border: `2px solid ${actif ? '#ffb300' : `hsla(${e.teinte}, 60%, 55%, 0.7)`}`,
              bgcolor: actif ? 'rgba(255,179,0,0.12)' : 'transparent',
              transition: 'transform 0.15s', '&:hover': { transform: 'translateY(-2px)' },
            }}>
              <Portrait champion={ch} espece={e} />
              <Typography sx={{ fontSize: 10.5, textAlign: 'center', mt: 0.25, lineHeight: 1.2 }}>
                <span style={{ color: '#8a96a3' }}>G{ch.generation}</span> {ch.distance.toFixed(1)} m
              </Typography>
              {nouvelle && (
                <Box sx={{ position: 'absolute', top: -7, left: 6, fontSize: 9, px: 0.6, borderRadius: 1, bgcolor: `hsl(${e.teinte}, 70%, 45%)`, color: '#fff', fontWeight: 700 }}>
                  nouvelle forme
                </Box>
              )}
            </Box>
          </Tooltip>
        );
      })}
    </Box>
  );
}
