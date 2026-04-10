// /src/components/CambrienTop.jsx

import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import OrganismPortrait from './OrganismePortrait';

// ============================================================
// UTILS COMPOSANTS
// Couleurs et labels définis localement — CAMB_COMPONENTS
// n'a pas forcément de .COLOR comme l'ancien système
// ============================================================

const COMPONENT_META = {
  Photosynthesis:      { label: 'Photosynth.', color: '#88ff44' },
  Chemosynthesis:      { label: 'Chimiosynth.', color: '#ffcc00' },
  Filtration:          { label: 'Filtration',  color: '#44ddff' },
  Predator:            { label: 'Prédateur',   color: '#ff4444' },
  Parasite:            { label: 'Parasite',    color: '#cc44ff' },
  Cannibalism:         { label: 'Cannibale',   color: '#ff8800' },
  Symbiosis:           { label: 'Symbiose',    color: '#44ffaa' },
  EnergyStorage:       { label: 'Réserve E.',  color: '#ffee88' },
  Hibernation:         { label: 'Hibernation', color: '#aabbcc' },
  GeneticRecombination:{ label: 'Sexué',       color: '#ff88cc' },
  Sporulation:         { label: 'Spores',      color: '#cc8844' },
  Spine:               { label: 'Épines',      color: '#ff6666' },
  Carapace:            { label: 'Carapace',    color: '#888855' },
  Mucus:               { label: 'Mucus',       color: '#88ccaa' },
  Ink:                 { label: 'Encre',       color: '#4444aa' },
  Eye:                 { label: 'Œil',         color: '#cc88ff' },
  Antenna:             { label: 'Antenne',     color: '#88aaff' },
  Thermoreceptor:      { label: 'Thermo.',     color: '#ff8844' },
  Jaw:                 { label: 'Mâchoire',    color: '#ff5500' },
  Tentacle:            { label: 'Tentacule',   color: '#00ffcc' },
  Cilia:               { label: 'Cils',        color: '#aaffee' },
  Peduncle:            { label: 'Pédoncule',   color: '#aa8855' },
  Anchoring:           { label: 'Ancrage',     color: '#887755' },
  Segmentation:        { label: 'Segments',    color: '#aaaaaa' },
  Regeneration:        { label: 'Régénér.',    color: '#55ff88' },
  Bioluminescence:     { label: 'Biolum.',     color: '#00ffff' },
  Movement:            { label: 'Mobilité',    color: '#ffffff' },
  BiologicalClock:     { label: 'Rythme bio.', color: '#ffaaff' },
};

const getMeta = (name) =>
  COMPONENT_META[name] ?? { label: name, color: '#888' };

// ============================================================
// GÉNÉRATION NOM D'ESPÈCE depuis speciesIdentity
// (simplifié — à remplacer par ton SpeciesNamer si tu l'adaptes)
// ============================================================

const PREFIXES = ['Archaeo','Proto','Paleo','Neo','Crypto','Endo','Exo','Macro','Micro','Thermo'];
const SUFFIXES = ['morpha','zoa','phyta','bacteris','forme','plasmus','cystis','poda','derma','nema'];

function generateSpeciesName(val) {
  const i1 = Math.floor(val * PREFIXES.length) % PREFIXES.length;
  const i2 = Math.floor(val * 97 * SUFFIXES.length) % SUFFIXES.length;
  return `${PREFIXES[i1]}${SUFFIXES[i2]}`;
}

function speciesColor(val) {
  const h = Math.floor(val * 360);
  return `hsl(${h}, 80%, 60%)`;
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

const CambrienTop = ({ engine }) => {
  const organisms = engine.getOrganismsForStats();
  if (!organisms.length) return null;

  // ── Grouper par espèce (speciesIdentity arrondi à 2 décimales)
  const speciesMap = new Map();

  for (const org of organisms) {
    const handler = org.genome?.handler;
    if (!handler) continue;

    const speciesVal = handler.readFloat('speciesIdentity') ?? 0;
    const key = speciesVal.toFixed(2);

    if (!speciesMap.has(key)) {
      speciesMap.set(key, {
        key,
        speciesVal,
        name: generateSpeciesName(speciesVal),
        color: speciesColor(speciesVal),
        count: 0,
        totalEnergy: 0,
        componentFreq: new Map(),
        firstEntityId: org.id,  // ← on stocke l'id, pas l'organisme
      });
    }

    const sp = speciesMap.get(key);
    sp.count++;
    sp.totalEnergy += org.metabolism?.energyStored ?? 0;

    // activeComponents : tableau de noms de composants présents sur l'entité
    for (const compName of (org.activeComponents ?? [])) {
      sp.componentFreq.set(compName, (sp.componentFreq.get(compName) ?? 0) + 1);
    }
  }

  // ── Trier par effectif, top 8
  const top = Array.from(speciesMap.values())
    .map(sp => ({
      ...sp,
      avgEnergy: sp.count > 0 ? sp.totalEnergy / sp.count : 0,
      components: Array.from(sp.componentFreq.entries())
        .map(([name, cnt]) => ({
          name,
          pct: (cnt / sp.count) * 100,
        }))
        .filter(c => c.pct >= 50) // seulement si présent dans ≥50% de l'espèce
        .sort((a, b) => b.pct - a.pct)
        .slice(0, 5),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const total = organisms.length;

  return (
    <Paper elevation={3} sx={styles.root}>
      <Typography variant="h6" sx={styles.title}>
        DYNASTIES
      </Typography>

      <Stack spacing={1.5}>
        {top.map(({ key, name, color, count, avgEnergy, components, firstEntityId }, idx) => {
          const pct = ((count / total) * 100).toFixed(1);
          const isLeader = idx === 0;

          return (
            <Box key={key} sx={{
              ...styles.card,
              border: isLeader ? `2px solid ${color}` : '1px solid #2a2a2a',
              boxShadow: isLeader ? `0 0 10px ${color}33` : 'none',
            }}>
              {/* ── Header ── */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.8}>
                <Stack direction="row" spacing={0.8} alignItems="center">
                  <OrganismPortrait engine={engine} entityId={firstEntityId} size={52} />
                  <Stack spacing={0.3}>
                    <Typography sx={{ color, fontFamily: 'monospace', fontWeight: 700, fontSize: '0.75rem' }}>
                      #{idx + 1}
                    </Typography>
                    <Chip
                      label={name}
                      size="small"
                      sx={{ bgcolor: color, color: '#000', fontFamily: 'monospace', fontWeight: 700, fontSize: '0.7rem' }}
                    />
                  </Stack>
                </Stack>

                <Stack direction="row" spacing={0.5}>
                  <Chip label={count}    size="small" sx={styles.chipGreen} />
                  <Chip label={`${pct}%`} size="small" sx={styles.chipBlue} />
                  <Chip label={`E:${avgEnergy.toFixed(0)}`} size="small" sx={styles.chipAmber} />
                </Stack>
              </Stack>

              {/* ── Composants dominants ── */}
              {components.length > 0 ? (
                <Stack spacing={0.25} sx={{ ml: 1.5 }}>
                  {components.map(({ name: cName, pct: cPct }) => {
                    const meta = getMeta(cName);
                    const symbol = cPct >= 90 ? '+++' : cPct >= 70 ? '++' : '+';
                    const labelColor = cPct >= 90 ? '#00ff88' : cPct >= 70 ? '#ffaa00' : '#668899';

                    return (
                      <Stack key={cName} direction="row" spacing={0.8} alignItems="center">
                        <Typography sx={{ color: labelColor, fontFamily: 'monospace', fontSize: '0.65rem', fontWeight: 700, minWidth: 26 }}>
                          {symbol}
                        </Typography>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: meta.color, border: '1px solid #555', flexShrink: 0 }} />
                        <Chip
                          label={meta.label}
                          size="small"
                          sx={styles.chipComponent}
                        />
                        <Typography sx={{ color: '#555', fontFamily: 'monospace', fontSize: '0.6rem' }}>
                          {cPct.toFixed(0)}%
                        </Typography>
                      </Stack>
                    );
                  })}
                </Stack>
              ) : (
                <Typography variant="caption" sx={{ color: '#333', ml: 1.5, fontStyle: 'italic' }}>
                  aucun composant dominant
                </Typography>
              )}
            </Box>
          );
        })}
      </Stack>
    </Paper>
  );
};

// ============================================================
// STYLES
// ============================================================

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
  chipGreen:     { bgcolor: '#00ff88', color: '#000', fontFamily: 'monospace', fontSize: '0.65rem', fontWeight: 700 },
  chipBlue:      { bgcolor: '#4488ff', color: '#fff', fontFamily: 'monospace', fontSize: '0.65rem' },
  chipAmber:     { bgcolor: '#ffaa00', color: '#000', fontFamily: 'monospace', fontSize: '0.65rem' },
  chipComponent: { bgcolor: '#1e1e1e', color: '#ccd', fontFamily: 'monospace', fontSize: '0.62rem', height: 18, '& .MuiChip-label': { px: 0.5 } },
};

export default CambrienTop;