// C11Top.jsx — Tableau des dynasties évolutives
//
// Port de CambrienTop (B10) adapté au modèle ECS de B11 :
//   - activeComponents construits via getOrganismsForStats() (pas de liste inline)
//   - metabolism.energy (pas energyStored)
//   - Coloration par régime alimentaire (autotrophe / herbivore / prédateur / filtreur)
//   - Affichage du phylum (CHORDATA / ARTHROPODA / MOLLUSCA / VERMES / RADIATA / VEGETAL)
//   - Groupe par speciesIdentity (gène ADN, 0.02 de résolution)

import React, { useState, useEffect, useRef } from 'react';
import { Box, Chip, Paper, Stack, Typography } from '@mui/material';

// ── Métadonnées des organes ───────────────────────────────────────────────────

const ORGAN_META = {
  Photosynthesis:  { label: 'Photosynth.',  color: '#88ff44' },
  Chemosynthesis:  { label: 'Chimiosynth.', color: '#ffdd00' },
  Filtration:      { label: 'Filtration',   color: '#44ddff' },
  Jaw:             { label: 'Mâchoire',     color: '#ff4422' },
  Mouth:           { label: 'Bouche',       color: '#ff8844' },
  Eye:             { label: 'Œil',          color: '#cc88ff' },
  Brain:           { label: 'Cerveau',      color: '#aa66ff' },
  GanglionCluster: { label: 'Ganglion',     color: '#8866cc' },
  LateralLine:     { label: 'L. latérale',  color: '#66aacc' },
  Chemoreceptor:   { label: 'Chémoréc.',    color: '#88aaff' },
  Gill:            { label: 'Branchies',    color: '#44bbff' },
  Lung:            { label: 'Poumon',       color: '#aaddff' },
  Wing:            { label: 'Aile',         color: '#ffffaa' },
  Leg:             { label: 'Patte',        color: '#ccaa44' },
  Fin:             { label: 'Nageoire',     color: '#44ccdd' },
  Tentacle:        { label: 'Tentacule',    color: '#00ffcc' },
  Gonad:           { label: 'Gonade',       color: '#ff88cc' },
  Sporulation:     { label: 'Spores',       color: '#cc8844' },
  Regeneration:    { label: 'Régénér.',     color: '#55ff88' },
  Anchoring:       { label: 'Ancrage',      color: '#887755' },
  Bioluminescence: { label: 'Biolum.',      color: '#00ffff' },
  Spine:           { label: 'Épines',       color: '#ff6666' },
  Carapace:        { label: 'Carapace',     color: '#888855' },
  Exoskeleton:     { label: 'Exosq.',       color: '#aaaa66' },
  Heart:           { label: 'Cœur',         color: '#ff5577' },
  Notochord:       { label: 'Notochorde',   color: '#88aacc' },
};

const getOrganMeta = (name) => ORGAN_META[name] ?? { label: name, color: '#668899' };

// ── Régime alimentaire ────────────────────────────────────────────────────────

function getDiet(comps) {
  const has = (n) => comps.includes(n);
  if (has('Jaw'))                                      return 'predator';
  if (has('Photosynthesis') || has('Chemosynthesis'))  return 'autotroph';
  if (has('Filtration'))                               return 'filterer';
  if (has('Mouth'))                                    return 'herbivore';
  return 'primitive';
}

const DIET_META = {
  predator:  { label: 'Prédateur',   color: '#ff4422' },
  autotroph: { label: 'Autotrophe',  color: '#88ff44' },
  filterer:  { label: 'Filtreur',    color: '#44ddff' },
  herbivore: { label: 'Herbivore',   color: '#ffaa44' },
  primitive: { label: 'Primitif',    color: '#668899' },
};

// ── Nom d'espèce généré depuis speciesIdentity ────────────────────────────────

const PREFIXES = ['Archaeo','Proto','Paleo','Neo','Crypto','Endo','Exo','Macro','Micro','Thermo'];
const SUFFIXES = ['morpha','zoa','phyta','bacteris','forme','plasmus','cystis','poda','derma','nema'];

function generateSpeciesName(val) {
  const i1 = Math.floor(val * PREFIXES.length) % PREFIXES.length;
  const i2 = Math.floor(val * 97 * SUFFIXES.length) % SUFFIXES.length;
  return `${PREFIXES[i1]}${SUFFIXES[i2]}`;
}

function speciesColor(val) {
  return `hsl(${Math.floor(val * 360)}, 75%, 58%)`;
}

// ── Icônes phylum ─────────────────────────────────────────────────────────────

const PHYLUM_ICON = {
  CHORDATA:   '🐟',
  ARTHROPODA: '🦀',
  MOLLUSCA:   '🐙',
  VERMES:     '🪱',
  RADIATA:    '🪼',
  VEGETAL:    '🌿',
};

// ── Composant principal ───────────────────────────────────────────────────────

const C11Top = ({ engine }) => {
  const [dynasties, setDynasties] = useState([]);
  const timerRef = useRef(null);

  useEffect(() => {
    // Recalcul toutes les 2 secondes — getOrganismsForStats est coûteux
    timerRef.current = setInterval(() => {
      setDynasties(computeDynasties(engine));
    }, 2000);
    setDynasties(computeDynasties(engine));

    return () => clearInterval(timerRef.current);
  }, [engine]);

  if (!dynasties.length) {
    return (
      <Paper elevation={3} sx={styles.root}>
        <Typography variant="h6" sx={styles.title}>DYNASTIES</Typography>
        <Typography variant="caption" sx={{ color: '#334' }}>
          En attente de données…
        </Typography>
      </Paper>
    );
  }

  const total = dynasties.reduce((s, d) => s + d.count, 0);

  return (
    <Paper elevation={3} sx={styles.root}>
      <Typography variant="h6" sx={styles.title}>DYNASTIES</Typography>

      <Stack spacing={1.5}>
        {dynasties.map(({ key, name, color, phylum, diet, count, avgEnergy, organs }, idx) => {
          const pct      = total > 0 ? ((count / total) * 100).toFixed(1) : '0';
          const isLeader = idx === 0;
          const dietMeta = DIET_META[diet];

          return (
            <Box key={key} sx={{
              ...styles.card,
              border: isLeader ? `2px solid ${color}` : '1px solid #2a2a2a',
              boxShadow: isLeader ? `0 0 10px ${color}33` : 'none',
            }}>

              {/* ── Header ── */}
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={0.8}>
                <Stack spacing={0.3}>
                  <Stack direction="row" spacing={0.6} alignItems="center">
                    <Typography sx={{ fontSize: '0.9rem', lineHeight: 1 }}>
                      {PHYLUM_ICON[phylum] ?? '🧬'}
                    </Typography>
                    <Typography sx={{ color, fontFamily: 'monospace', fontWeight: 700, fontSize: '0.7rem' }}>
                      #{idx + 1}
                    </Typography>
                    <Chip
                      label={name}
                      size="small"
                      sx={{ bgcolor: color, color: '#000', fontFamily: 'monospace', fontWeight: 700, fontSize: '0.65rem', height: 18 }}
                    />
                  </Stack>
                  <Chip
                    label={dietMeta.label}
                    size="small"
                    sx={{ bgcolor: dietMeta.color + '33', color: dietMeta.color, border: `1px solid ${dietMeta.color}55`, fontSize: '0.6rem', height: 16, alignSelf: 'flex-start' }}
                  />
                </Stack>

                <Stack spacing={0.3} alignItems="flex-end">
                  <Chip label={count}       size="small" sx={styles.chipGreen} />
                  <Chip label={`${pct}%`}   size="small" sx={styles.chipBlue} />
                  <Chip label={`⚡${avgEnergy.toFixed(0)}`} size="small" sx={styles.chipAmber} />
                </Stack>
              </Stack>

              {/* ── Organes dominants ── */}
              {organs.length > 0 ? (
                <Stack direction="row" flexWrap="wrap" gap={0.4} sx={{ ml: 0.5 }}>
                  {organs.map(({ name: oName, pct: oPct }) => {
                    const meta     = getOrganMeta(oName);
                    const strength = oPct >= 90 ? '+++' : oPct >= 70 ? '++' : '+';
                    return (
                      <Stack key={oName} direction="row" alignItems="center" spacing={0.3}>
                        <Typography sx={{ color: oPct >= 90 ? '#00ff88' : oPct >= 70 ? '#ffaa00' : '#446', fontFamily: 'monospace', fontSize: '0.55rem', fontWeight: 700 }}>
                          {strength}
                        </Typography>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: meta.color, flexShrink: 0 }} />
                        <Typography sx={{ color: '#aab', fontFamily: 'monospace', fontSize: '0.6rem' }}>
                          {meta.label}
                        </Typography>
                      </Stack>
                    );
                  })}
                </Stack>
              ) : (
                <Typography variant="caption" sx={{ color: '#333', ml: 0.5, fontStyle: 'italic', fontSize: '0.6rem' }}>
                  aucun organe dominant
                </Typography>
              )}
            </Box>
          );
        })}
      </Stack>
    </Paper>
  );
};

// ── Calcul des dynasties ──────────────────────────────────────────────────────

function computeDynasties(engine) {
  const organisms = engine.getOrganismsForStats();
  if (!organisms.length) return [];

  const speciesMap = new Map();

  for (const org of organisms) {
    const handler = org.genome?.handler;
    if (!handler) continue;
    if (!org.metabolism?.alive) continue;

    const val = handler.readFloat('speciesIdentity') ?? 0;
    const key = val.toFixed(2);

    if (!speciesMap.has(key)) {
      speciesMap.set(key, {
        key,
        name:          generateSpeciesName(val),
        color:         speciesColor(val),
        phylum:        org.bodyPlan?.phylum ?? 'UNKNOWN',
        count:         0,
        totalEnergy:   0,
        compFreq:      new Map(),
        // Régime alimentaire : vote majoritaire
        dietVotes:     {},
      });
    }

    const sp = speciesMap.get(key);
    sp.count++;
    sp.totalEnergy += org.metabolism?.energy ?? 0;

    // Fréquence des organes
    for (const comp of (org.activeComponents ?? [])) {
      sp.compFreq.set(comp, (sp.compFreq.get(comp) ?? 0) + 1);
    }

    // Vote régime alimentaire
    const diet = getDiet(org.activeComponents ?? []);
    sp.dietVotes[diet] = (sp.dietVotes[diet] ?? 0) + 1;
  }

  return Array.from(speciesMap.values())
    .map(sp => ({
      ...sp,
      avgEnergy: sp.count > 0 ? sp.totalEnergy / sp.count : 0,
      diet:      Object.entries(sp.dietVotes).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'primitive',
      organs:    Array.from(sp.compFreq.entries())
        .map(([name, cnt]) => ({ name, pct: (cnt / sp.count) * 100 }))
        .filter(c => c.pct >= 50)
        .sort((a, b) => b.pct - a.pct)
        .slice(0, 5),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = {
  root: {
    p: 2,
    background: 'linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 100%)',
    border: '1px solid #222',
    overflowY: 'auto',
    maxHeight: '90vh',
  },
  title: {
    color: '#00ff88',
    fontFamily: 'monospace',
    fontSize: '0.95rem',
    letterSpacing: '0.1em',
    mb: 1.5,
  },
  card: {
    p: 1.2,
    bgcolor: '#111',
    borderRadius: 1,
  },
  chipGreen: { bgcolor: '#00ff88', color: '#000', fontFamily: 'monospace', fontSize: '0.6rem', fontWeight: 700, height: 18 },
  chipBlue:  { bgcolor: '#4488ff', color: '#fff', fontFamily: 'monospace', fontSize: '0.6rem', height: 18 },
  chipAmber: { bgcolor: '#ffaa00', color: '#000', fontFamily: 'monospace', fontSize: '0.6rem', height: 18 },
};

export default C11Top;
