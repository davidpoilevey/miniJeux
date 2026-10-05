import React, { useRef } from 'react';
import { Box, FormControlLabel, IconButton, Slider, Stack, Switch, Tooltip, Typography } from '@mui/material';
import { Download, FolderOpen, Pause, PlayArrow, RestartAlt, Save, Tune, Upload } from '@mui/icons-material';
import { decrirePlan } from '../engine/corps';
import { CourbeDistance, CourbeEspeces } from './Courbes';

const Section = ({ titre, children }) => (
  <Box sx={{ mt: 2 }}>
    <Typography sx={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'text.secondary', mb: 0.75 }}>{titre}</Typography>
    {children}
  </Box>
);

const Curseur = ({ label, valeur, ...props }) => (
  <Box sx={{ px: 0.5 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{label}</Typography>
      <Typography sx={{ fontSize: 11, color: 'primary.main' }}>{valeur}</Typography>
    </Box>
    <Slider size="small" {...props} />
  </Box>
);

export default function Panneau({
  evo, stats, version, enMarche, onToggle, onRecommencer, onReglages, params, onParam,
  onSauver, onCharger, aSauvegarde, onExporter, onImporter, message,
}) {
  const fichier = useRef(null);
  const derniere = evo.historique[evo.historique.length - 1];
  const effectifs = derniere ? derniere.effectifs : {};
  const especes = Object.entries(effectifs)
    .map(([id, n]) => ({ e: evo.especesParId[id], n }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 5);

  return (
    <Box sx={{ width: { xs: '100%', md: 340 }, flexShrink: 0, p: 2, overflowY: 'auto', borderLeft: { md: '1px solid rgba(255,255,255,0.06)' } }}>
      <Typography sx={{ fontWeight: 800, fontSize: 22, letterSpacing: -0.5, color: 'primary.main' }}>Bactérie 16</Typography>
      <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
        Les marcheurs · génération {stats.generation} · record {stats.record.toFixed(1)} m
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1.5 }}>
        <IconButton onClick={onToggle} sx={{ bgcolor: 'rgba(255,179,0,0.14)' }}>{enMarche ? <Pause /> : <PlayArrow />}</IconButton>
        <Tooltip title="Nouvelle population (garde les réglages)"><IconButton onClick={onRecommencer}><RestartAlt /></IconButton></Tooltip>
        <Tooltip title="Tous les réglages"><IconButton onClick={onReglages}><Tune /></IconButton></Tooltip>
        <Box sx={{ flex: 1 }} />
        <Tooltip title="Sauver dans le navigateur"><IconButton size="small" onClick={onSauver}><Save fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="Recharger la sauvegarde du navigateur"><span><IconButton size="small" onClick={onCharger} disabled={!aSauvegarde}><FolderOpen fontSize="small" /></IconButton></span></Tooltip>
        <Tooltip title="Exporter les génomes (.json)"><IconButton size="small" onClick={onExporter}><Download fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="Importer des génomes (.json)"><IconButton size="small" onClick={() => fichier.current.click()}><Upload fontSize="small" /></IconButton></Tooltip>
        <input ref={fichier} type="file" accept="application/json,.json" hidden onChange={(e) => { if (e.target.files[0]) onImporter(e.target.files[0]); e.target.value = ''; }} />
      </Box>
      {message && <Typography sx={{ fontSize: 11, color: 'primary.main', mt: 0.5 }}>{message}</Typography>}

      <Stack spacing={0.5} sx={{ mt: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ flex: 1 }}>
            <Curseur label="Vitesse" valeur={params.turbo ? 'turbo' : `×${params.vitesse}`} min={1} max={10} step={1}
              value={params.vitesse} disabled={params.turbo} onChange={(_, v) => onParam('vitesse', v)} />
          </Box>
          <FormControlLabel sx={{ mr: 0 }} control={<Switch size="small" checked={params.turbo} onChange={(_, v) => onParam('turbo', v)} />}
            label={<Typography sx={{ fontSize: 11 }}>Turbo</Typography>} />
        </Box>
        <Curseur label="Taux de mutation" valeur={params.tauxMutation} min={0.0005} max={0.03} step={0.0005}
          value={params.tauxMutation} onChange={(_, v) => onParam('tauxMutation', v)} />
        <Curseur label="Population (génération suivante)" valeur={params.population} min={20} max={300} step={10}
          value={params.population} onChange={(_, v) => onParam('population', v)} />
      </Stack>

      <Section titre="Progrès">
        <CourbeDistance historique={evo.historique} version={version} />
        <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.5 }}>
          <span style={{ color: '#ffb300' }}>━</span> le meilleur · <span style={{ color: '#c8d2dc' }}>━</span> la médiane · pointillés = paliers de la piste
        </Typography>
      </Section>

      <Section titre="Lignées">
        <CourbeEspeces historique={evo.historique} especesParId={evo.especesParId} version={version} />
        <Stack spacing={0.4} sx={{ mt: 1 }}>
          {especes.map(({ e, n }) => (
            <Box key={e.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: `hsl(${e.teinte}, 60%, 55%)`, flexShrink: 0 }} />
              <Typography sx={{ fontSize: 12, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <b>{e.nom}</b> <span style={{ color: '#8a96a3' }}>{decrirePlan(e.plan)}</span>
              </Typography>
              <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{n} · {e.record.toFixed(1)} m</Typography>
            </Box>
          ))}
        </Stack>
        <Typography sx={{ fontSize: 10.5, color: 'text.secondary', mt: 0.5 }}>
          Les 5 espèces les plus nombreuses (le reste en gris). Une espèce = une lignée de même plan (nœuds, griffes) ; une mutation qui ajoute ou retire un membre fonde une espèce fille.
        </Typography>
      </Section>

      <Section titre="Chronique">
        <Stack spacing={0.5}>
          {evo.chronique.slice(0, 25).map((c, k) => (
            <Typography key={`${c.generation}-${k}-${c.texte}`} sx={{ fontSize: 12, opacity: Math.max(0.35, 1 - k * 0.04) }}>
              <span style={{ color: '#6b7a8a' }}>G{c.generation}</span> {c.texte}
            </Typography>
          ))}
        </Stack>
      </Section>
    </Box>
  );
}
