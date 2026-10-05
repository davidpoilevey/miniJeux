import React from 'react';
import { Box, Chip, IconButton, Slider, Stack, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from '@mui/material';
import { Pause, PlayArrow, RestartAlt, Tune } from '@mui/icons-material';
import Courbes from './Courbes';
import { GUILDES, GUILDE_COULEURS, ARMES, ARME_COULEURS } from '../engine/phenotype';
import { MILIEUX } from '../engine/params';

const COUCHES = [
  ['bacteries', 'Bactéries', '#ffffff'],
  ['A', 'Sucre', '#3fae8c'],
  ['B', 'Acide', '#ffab40'],
  ['C', 'Déchet', '#9f7bff'],
  ['T', 'Toxine', '#ff5050'],
];

const Section = ({ titre, children }) => (
  <Box sx={{ mt: 2 }}>
    <Typography sx={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'text.secondary', mb: 0.75 }}>{titre}</Typography>
    {children}
  </Box>
);

const Barres = ({ valeurs, noms, couleurs, total }) => (
  <Stack spacing={0.5}>
    {valeurs.map((v, k) => (
      <Box key={noms[k]} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography sx={{ fontSize: 12, width: 86, color: couleurs[k] }}>{noms[k]}</Typography>
        <Box sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <Box sx={{ width: `${total ? (v / total) * 100 : 0}%`, height: '100%', bgcolor: couleurs[k], transition: 'width 0.25s' }} />
        </Box>
        <Typography sx={{ fontSize: 12, width: 44, textAlign: 'right', color: 'text.secondary' }}>{v}</Typography>
      </Box>
    ))}
  </Stack>
);

const Gene = ({ nom, valeur, signe = false }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <Typography sx={{ fontSize: 11, width: 92, color: 'text.secondary' }}>{nom}</Typography>
    <Box sx={{ flex: 1, height: 4, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.06)', position: 'relative' }}>
      {signe ? (
        <Box sx={{ position: 'absolute', top: 0, height: '100%', bgcolor: valeur >= 0 ? '#5dff8a' : '#ff5050',
          left: valeur >= 0 ? '50%' : `${50 + valeur * 50}%`, width: `${Math.abs(valeur) * 50}%` }} />
      ) : (
        <Box sx={{ height: '100%', width: `${Math.min(1, valeur) * 100}%`, bgcolor: '#9fd8ff', borderRadius: 2 }} />
      )}
    </Box>
  </Box>
);

function Inspecteur({ b }) {
  const ph = b.ph;
  const humeur = (poids) => ['A', 'B', 'C', 'T'].map((c, k) => <Gene key={c} nom={`→ ${c}`} valeur={poids[k]} signe />);
  return (
    <Section titre={b.mort ? '† Feu la bactérie' : 'Bactérie observée'}>
      <Typography sx={{ fontSize: 12, mb: 1 }}>
        <span style={{ color: GUILDE_COULEURS[ph.guilde] }}>{GUILDES[ph.guilde]}</span> ·{' '}
        <span style={{ color: ARME_COULEURS[ph.arme] }}>{ARMES[ph.arme]}</span> · gén. {b.gen} · âge {b.age}/{ph.longevite}
      </Typography>
      <Stack spacing={0.4}>
        <Gene nom="énergie" valeur={b.e / ph.seuilDivision} />
        <Gene nom="enzyme A" valeur={ph.eA} />
        <Gene nom="enzyme B" valeur={ph.eB} />
        <Gene nom="enzyme C" valeur={ph.eC} />
        <Gene nom="toxine" valeur={ph.toxine} />
        <Gene nom="résistance" valeur={ph.resistance} />
        <Gene nom="mobilité" valeur={ph.mobilite} />
        <Typography sx={{ fontSize: 11, color: 'text.secondary', pt: 0.5 }}>Affamée, elle cherche :</Typography>
        {humeur(ph.faim)}
        <Typography sx={{ fontSize: 11, color: 'text.secondary', pt: 0.5 }}>Repue, elle cherche :</Typography>
        {humeur(ph.repu)}
      </Stack>
    </Section>
  );
}

export default function Panneau({
  stats, historique, chronique, enMarche, onToggle, onRecommencer, onReglages,
  ticksParFrame, onVitesse, mode, onMode, couches, onCouches, selection, milieu, onMilieu,
}) {
  const parArmes = mode === 'armes';
  return (
    <Box sx={{ width: { xs: '100%', md: 340 }, flexShrink: 0, p: 2, overflowY: 'auto', borderLeft: { md: '1px solid rgba(255,255,255,0.06)' } }}>
      <Typography sx={{ fontWeight: 800, fontSize: 22, letterSpacing: -0.5, color: 'primary.main' }}>Bactérie 15.5</Typography>
      <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
        tick {stats.tick} · génération {stats.genMax} · {stats.population} bactéries{stats.hiver ? ' · ❄️ hiver' : ''}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
        <IconButton onClick={onToggle} sx={{ bgcolor: 'rgba(93,255,138,0.12)' }}>{enMarche ? <Pause /> : <PlayArrow />}</IconButton>
        <Tooltip title="Nouvelle gélose (garde les réglages)"><IconButton onClick={onRecommencer}><RestartAlt /></IconButton></Tooltip>
        <Tooltip title="Réglages"><IconButton onClick={onReglages}><Tune /></IconButton></Tooltip>
        <Box sx={{ flex: 1, px: 1 }}>
          <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>vitesse ×{ticksParFrame}</Typography>
          <Slider size="small" min={1} max={8} step={1} value={ticksParFrame} onChange={(_, v) => onVitesse(v)} />
        </Box>
      </Box>

      <Section titre="Milieu">
        <ToggleButtonGroup size="small" exclusive fullWidth value={milieu} onChange={(_, v) => v && onMilieu(v)}>
          {MILIEUX.map((m) => (
            <ToggleButton key={m.id} value={m.id} sx={{ px: 0.5, fontSize: 11 }}>{m.emoji} {m.nom}</ToggleButton>
          ))}
        </ToggleButtonGroup>
        <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.75, minHeight: 32 }}>
          {MILIEUX.find((m) => m.id === milieu)?.recit}
        </Typography>
      </Section>

      <Section titre="Regarder">
        <ToggleButtonGroup size="small" exclusive fullWidth value={mode} onChange={(_, v) => v && onMode(v)}>
          <ToggleButton value="regime">Régime</ToggleButton>
          <ToggleButton value="armes">Armes</ToggleButton>
          <ToggleButton value="lignee">Lignées</ToggleButton>
        </ToggleButtonGroup>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
          {COUCHES.map(([cle, label, couleur]) => (
            <Chip key={cle} size="small" label={label} variant={couches[cle] ? 'filled' : 'outlined'}
              onClick={() => onCouches({ ...couches, [cle]: !couches[cle] })}
              sx={{ borderColor: couleur, color: couches[cle] ? '#000' : couleur, bgcolor: couches[cle] ? couleur : 'transparent', '&:hover': { bgcolor: couleur, color: '#000' } }} />
          ))}
        </Box>
      </Section>

      <Section titre={parArmes ? 'Guerre chimique' : 'Guildes'}>
        <Barres
          valeurs={parArmes ? stats.armes : stats.guildes}
          noms={parArmes ? ARMES : GUILDES}
          couleurs={parArmes ? ARME_COULEURS : GUILDE_COULEURS}
          total={stats.population}
        />
        <Box sx={{ mt: 1 }}>
          <Courbes historique={historique} cle={parArmes ? 'armes' : 'guildes'} couleurs={parArmes ? ARME_COULEURS : GUILDE_COULEURS} version={stats.tick} />
        </Box>
        <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.5 }}>
          ── lignées effectives : {stats.lignees.toFixed(1)} · mobilité moyenne {(stats.mobilite * 100).toFixed(0)} %
        </Typography>
      </Section>

      {selection ? (
        <Inspecteur b={selection} />
      ) : (
        <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 2, fontStyle: 'italic' }}>Cliquez une bactérie pour lire son génome.</Typography>
      )}

      <Section titre="Chronique">
        <Stack spacing={0.5}>
          {chronique.slice(0, 25).map((c, k) => (
            <Typography key={`${c.tick}-${k}`} sx={{ fontSize: 12, opacity: Math.max(0.35, 1 - k * 0.04) }}>
              <span style={{ color: '#6b7a8a' }}>{String(c.tick).padStart(6, ' ')}</span> {c.texte}
            </Typography>
          ))}
        </Stack>
      </Section>
    </Box>
  );
}
