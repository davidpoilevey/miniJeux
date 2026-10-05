import React, { useEffect, useRef } from 'react';
import { Box, Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { Replay } from '../engine/Evolution';
import { decrireMorphotype } from '../engine/corps';
import { camera, dessinerCreature, dessinerDecor, dessinerEtiquette, dessinerFantome, dessinerHUD, dessinerPose } from './dessin';

// Le canvas : boucle rAF qui fait avancer la course (ou le replay d'un champion) et la dessine.
// Aucune créature ne transite par le state React ; seules les stats remontent (4 Hz).
export default function Piste({ evoRef, enMarche, vitesse, turbo, champion, onQuitterReplay, onStats }) {
  const boiteRef = useRef(null);
  const canvasRef = useRef(null);
  const etat = useRef({});
  etat.current = { enMarche, vitesse, turbo, champion, onStats };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf, tPrec = performance.now(), dernieresStats = 0;
    let generationVue = evoRef.current.generation;
    let replay = null;
    let bandeau = null;
    const cam = { x: -0.5, y: 0 };

    const boucle = (t) => {
      const dt = Math.min(0.1, (t - tPrec) / 1000);
      tPrec = t;
      const ev = evoRef.current;
      const e = etat.current;
      const dpr = window.devicePixelRatio || 1;
      const W = canvas.width / dpr, H = canvas.height / dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const vue = camera(W, H);

      if (e.champion) {
        // ── Replay d'un champion ──
        if (!replay || replay.champion !== e.champion) { replay = new Replay(e.champion, ev.params, ev.terrain); cam.x = 0; }
        const tAvant = replay.t;
        if (e.enMarche) for (let k = 0; k < e.vitesse; k++) replay.pas();
        const c = replay.creature;
        if (replay.t < tAvant) cam.x = c.comX(); // le replay boucle : la caméra revient au départ d'un coup
        suivre(cam, c.comX() + 0.5, ev.terrain, dt, 8);
        Object.assign(vue, { x: cam.x, y: cam.y });
        const espece = ev.especesParId[e.champion.espece];
        dessinerDecor(ctx, vue, ev.terrain, ev.record);
        replay.poses.forEach((p, k) => dessinerPose(ctx, vue, e.champion.corps, p.px, p.py, espece.teinte, 0.12 + 0.35 * (k / replay.poses.length)));
        dessinerCreature(ctx, vue, c, espece.teinte, replay.t);
        dessinerEtiquette(ctx, vue, c, `${espece.nom} · ${c.distance.toFixed(1)} m`, `hsl(${espece.teinte}, 70%, 28%)`, true);
        dessinerHUD(ctx, W, H, {
          titre: `Champion de la génération ${e.champion.generation}`,
          sousTitre: `${espece.nom} : ${decrireMorphotype(e.champion.corps.morphotype)} · ${e.champion.distance.toFixed(1)} m · une silhouette tous les 70 cm`,
          t: Math.min(replay.t, replay.duree), duree: replay.duree,
        });
      } else {
        // ── La course en direct ──
        replay = null;
        if (e.enMarche) {
          if (e.turbo) {
            const t0 = performance.now();
            while (performance.now() - t0 < 14) ev.pas();
          } else for (let k = 0; k < e.vitesse; k++) ev.pas();
        }
        if (ev.generation !== generationVue) {
          bandeau = { texte: texteFinGeneration(ev), age: 0 };
          generationVue = ev.generation;
        }

        const ordre = ev.classementEnDirect();
        const meneur = ev.creatures[ordre[0]] || ev.creatures[0];
        suivre(cam, meneur.comX() + 0.6, ev.terrain, dt);
        Object.assign(vue, { x: cam.x, y: cam.y });
        const teinte = (k) => ev.especesParId[ev.population[k].espece].teinte;

        dessinerDecor(ctx, vue, ev.terrain, ev.record);
        // Le peloton en fantômes, les trois premiers en entier, le meneur par-dessus tout
        for (let r = ordre.length - 1; r >= 3; r--) dessinerFantome(ctx, vue, ev.creatures[ordre[r]], teinte(ordre[r]), 0.22);
        for (let r = Math.min(2, ordre.length - 1); r >= 0; r--) {
          const k = ordre[r];
          dessinerCreature(ctx, vue, ev.creatures[k], teinte(k), ev.t + k, r === 0 ? 1 : 0.5);
        }
        if (ordre.length) {
          const k = ordre[0];
          const espece = ev.especesParId[ev.population[k].espece];
          const tenant = ev.population[k].elite ? '★ ' : '';
          dessinerEtiquette(ctx, vue, meneur, `${tenant}${espece.nom} · ${Math.max(0, meneur.distance).toFixed(1)} m`, `hsl(${espece.teinte}, 70%, 28%)`, true);
        }
        dessinerHUD(ctx, W, H, {
          titre: `Génération ${ev.generation}`,
          sousTitre: `Qui ira le plus loin vers la droite en ${ev.duree} s ? Les meilleurs se reproduisent.`,
          t: ev.t, duree: ev.duree, record: ev.record.distance,
          positions: ev.creatures.map((c, k) => ({
            x: c.comX(),
            couleur: `hsl(${teinte(k)}, 60%, 42%)`,
            gros: k === ordre[0],
            y: ((k * 7) % 9) - 4, // un peu de dispersion verticale pour distinguer les points
          })),
          legendeCarte: `${ev.creatures.length} créatures dans la course`,
          bandeau,
        });
        if (bandeau) bandeau.age += e.turbo ? dt * 0.5 : dt;
      }

      if (t - dernieresStats > 250) {
        dernieresStats = t;
        e.onStats({ generation: ev.generation, t: ev.t, record: ev.record.distance });
      }
      raf = requestAnimationFrame(boucle);
    };
    raf = requestAnimationFrame(boucle);
    return () => cancelAnimationFrame(raf);
  }, [evoRef]);

  // Le canvas épouse la place disponible (net sur écran Retina)
  useEffect(() => {
    const ajuster = () => {
      const boite = boiteRef.current, canvas = canvasRef.current;
      if (!boite || !canvas) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(boite.clientWidth * dpr);
      canvas.height = Math.round(boite.clientHeight * dpr);
    };
    const ro = new ResizeObserver(ajuster);
    ro.observe(boiteRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <Box ref={boiteRef} sx={{ position: 'relative', flex: 1, minHeight: 0, minWidth: 0, borderRadius: 3, overflow: 'hidden', boxShadow: '0 0 0 1px rgba(255,255,255,0.08)' }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} />
      {champion && (
        <Button size="small" variant="contained" startIcon={<ArrowBack />} onClick={onQuitterReplay}
          sx={{ position: 'absolute', top: 12, right: 12, textTransform: 'none' }}>
          Retour à la course
        </Button>
      )}
    </Box>
  );
}

// Caméra : suit sa cible en douceur ; au changement de génération, elle rembobine jusqu'au départ.
function suivre(cam, x, terrain, dt, raideur = 4) {
  cam.x += (x - cam.x) * Math.min(1, dt * raideur);
  cam.y += (terrain.hauteur(cam.x) - cam.y) * Math.min(1, dt * raideur);
}

function texteFinGeneration(ev) {
  const h = ev.historique[ev.historique.length - 1];
  if (!h) return '';
  if (ev.record.generation === h.generation) return `🏆 Nouveau record : ${h.meilleur.toFixed(1)} m`;
  return `Génération ${h.generation} terminée · meilleur ${h.meilleur.toFixed(1)} m`;
}
