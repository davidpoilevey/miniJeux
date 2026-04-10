// /src/components/CambrienControl.jsx

import React, { useEffect, useRef, useState } from 'react';
import {
  Box, Typography, Button, Slider, Divider, Stack, Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import BoltIcon from '@mui/icons-material/Bolt';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BugReportIcon from '@mui/icons-material/BugReport';

// Séries du mini-graphe population (ordre = ordre de dessin, total en dernier pour rester visible)
const CHART_SERIES = [
  { key: 'predators',      color: '#ff4444', label: 'préd.'  },
  { key: 'photosynthesis', color: '#44aaff', label: 'photo.' },
  { key: 'chemosynthesis', color: '#ffaa33', label: 'chemo.' },
  { key: 'filtration',     color: '#bb77ff', label: 'filtr.' },
  { key: 'mouth',          color: '#ff8844', label: 'herb.'  },
  { key: 'primitive',      color: '#446677', label: 'prim.'  },
  { key: 'total',          color: '#00ff88', label: 'total'  },
];

// Marques du slider de vitesse
const SPEED_MARKS = [
  { value: 1,   label: '1×' },
  { value: 5,   label: '5×' },
  { value: 10,  label: '10×' },
  { value: 20,  label: '20×' },
];
const EVENTS = [
  { type: 'mass_extinction',   label: 'Extinction de masse',    desc: '70% des organismes meurent',                    icon: <WhatshotIcon fontSize="small" />,    color: '#ff4444' },
  { type: 'cambrian_explosion',label: 'Explosion cambrienne',   desc: '100 nouveaux specimens aléatoires',             icon: <AutoAwesomeIcon fontSize="small" />, color: '#ffaa00' },
  { type: 'viral_attack',      label: 'Attaque virale',         desc: 'Détruit les porteurs du composant dominant',    icon: <BugReportIcon fontSize="small" />,   color: '#cc44ff' },
];
const CELL_MARKS = [
  { value: 8,  label: '8' },
  { value: 12, label: '12' },
  { value: 16, label: '16' },
  { value: 20, label: '20' },
];

const CambrienControl = ({
  running,
  speed,
  cellSize,
  engine,
  stats = {},
  onTogglePause,
  onReset, onEvent,
  onSpeedChange,
  onCellSizeChange,
  title   = 'BACTÉRIE',
  version = '10.0',
}) => {
  const canvasRef = useRef(null);
const [anchorEl, setAnchorEl] = useState(null);
const handleEventClick = (type) => { setAnchorEl(null); onEvent?.(type); };
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const history = engine.getPopulationHistory();
    drawMiniChart(canvas, history);
  });
const dayNightRatio = engine.world?.getDayNightRatio();
    const isDay = dayNightRatio > 0.3;
  const history = engine.getPopulationHistory();
  return (
    <Box sx={styles.root}>

      {/* ── Titre ── */}
      <Box sx={styles.titleBlock}>
        <Typography variant="overline" sx={styles.subtitle}>
          Simulation pré-cambrienne
        </Typography>
        <Typography variant="h5" sx={styles.title}>
          {title}
        </Typography>
        <Typography variant="h3" sx={styles.version}>
          {version}
        </Typography>
      </Box>
<Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 1,
            borderRadius: 1,
            background: isDay
              ? `linear-gradient(90deg, #ffd700 0%, #ffed4e ${dayNightRatio * 100}%, #1a1a1a ${dayNightRatio * 100}%, #1a1a1a 100%)`
              : `linear-gradient(90deg, #1a1a1a 0%, #1a1a1a ${dayNightRatio * 100}%, #4a5a8a ${dayNightRatio * 100}%, #4a5a8a 100%)`,
            border: '1px solid #404040',
            position: 'relative'
          }}
        ></Box>
      <Divider sx={styles.divider} />

      {/* ── Contrôles ── */}
      <Stack spacing={2}>

        {/* Start / Pause */}
        <Tooltip title={running ? 'Mettre en pause' : 'Démarrer la simulation'} placement="right">
          <Button
            variant="contained"
            fullWidth
            onClick={onTogglePause}
            startIcon={running ? <PauseIcon /> : <PlayArrowIcon />}
            sx={running ? styles.btnPause : styles.btnPlay}
          >
            {running ? 'Pause' : 'Start'}
          </Button>
        </Tooltip>

        {/* Reset */}
        <Tooltip title="Réinitialiser l'océan" placement="right">
          <Button
            variant="outlined"
            fullWidth
            onClick={onReset}
            startIcon={<RestartAltIcon />}
            sx={styles.btnReset}
          >
            Reset
          </Button>
        </Tooltip>

      </Stack>
<Button variant="outlined" fullWidth onClick={e => setAnchorEl(e.currentTarget)}
  startIcon={<BoltIcon />} sx={styles.btnEvent}>
  Événement
</Button>
<Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
  PaperProps={{ sx: { bgcolor: '#0d0f1a', border: '1px solid #1e2d45', minWidth: 240 } }}>
  {EVENTS.map(({ type, label, desc, icon, color }) => (
    <MenuItem key={type} onClick={() => handleEventClick(type)}
      sx={{ '&:hover': { bgcolor: '#111827' }, py: 1 }}>
      <ListItemIcon sx={{ color, minWidth: 32 }}>{icon}</ListItemIcon>
      <ListItemText
        primary={<Typography sx={{ color, fontSize: '0.8rem', fontWeight: 700 }}>{label}</Typography>}
        secondary={<Typography sx={{ color: '#556', fontSize: '0.65rem' }}>{desc}</Typography>}
      />
    </MenuItem>
  ))}
</Menu>
      <Divider sx={styles.divider} />

      {/* ── Zoom ── */}
      <Box>
        <Typography variant="overline" sx={styles.sectionLabel}>
          Zoom
        </Typography>
        <Typography variant="h6" sx={styles.speedValue}>
          {cellSize}px
        </Typography>
        <Slider
          value={cellSize}
          min={6}
          max={20}
          step={1}
          marks={CELL_MARKS}
          onChange={(_, v) => onCellSizeChange(v)}
          sx={styles.slider}
        />
      </Box>

      <Divider sx={styles.divider} />

      {/* ── Vitesse ── */}
      <Box>
        <Typography variant="overline" sx={styles.sectionLabel}>
          Vitesse
        </Typography>
        <Typography variant="h6" sx={styles.speedValue}>
          {speed}×
        </Typography>
        <Slider
          value={speed}
          min={1}
          max={20}
          step={1}
          marks={SPEED_MARKS}
          onChange={(_, v) => onSpeedChange(v)}
          sx={styles.slider}
        />
      </Box>

      <Divider sx={styles.divider} />

      {/* ── Stats population ── */}
      <Box>
        <Typography variant="overline" sx={styles.sectionLabel}>
          Population
        </Typography>
        <Typography variant="h4" sx={styles.popValue}>
          {engine.stats.population}
        </Typography>
        {history.length > 1 && (
          <Box sx={{ mt: 1 }}>
            <canvas
              ref={canvasRef}
              width={176}
              height={60}
              style={{ display: 'block', borderRadius: 4 }}
            />
            {/* Légende — petits tirets colorés, 2 colonnes */}
            <Stack direction="row" flexWrap="wrap" gap={0.8} sx={{ mt: 0.75 }}>
              {CHART_SERIES.map(({ color, label }) => (
                <Stack key={label} direction="row" alignItems="center" spacing={0.4}>
                  <Box sx={{ width: 10, height: 3, borderRadius: 1, bgcolor: color }} />
                  <Typography variant="caption" sx={{ color: '#446688', fontSize: '0.6rem' }}>
                    {label}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        )}
      </Box>

      <Divider sx={styles.divider} />

      {/* ── Stratégies énergétiques (dernière mesure) ── */}
      {history.length > 0 && (() => {
        const last = history[history.length - 1];
        return (
          <StatGroup label="Énergie" rows={[
            { label: 'Herbivores',     value: last.mouth          ?? 0, color: '#ff8844' },
            { label: 'Prédateurs',     value: last.predators      ?? 0, color: '#ff6666' },
            { label: 'Photosynthèse',  value: last.photosynthesis ?? 0, color: '#44aaff' },
            { label: 'Chimiosynthèse', value: last.chemosynthesis ?? 0, color: '#ffaa33' },
            { label: 'Filtration',     value: last.filtration     ?? 0, color: '#bb77ff' },
            { label: 'Primitifs',      value: last.primitive      ?? 0, color: '#446677' },
          ]} />
        );
      })()}

      <Divider sx={styles.divider} />

      <StatGroup label="Reproduction" rows={[
        { label: 'Asexuée',     value: stats.asexualBirths ?? 0 },
        { label: 'Fornication', value: stats.sexualBirths  ?? 0 },
        { label: 'Spores',      value: stats.spores        ?? 0 },
      ]} />
    </Box>
  );
};

// ============================================================
// STAT GROUP — bloc réutilisable pour n'importe quelle source
// ============================================================

const StatGroup = ({ label, rows }) => (
  <Box sx={{ mb: 0.5 }}>
    <Typography variant="overline" sx={styles.sectionLabel}>
      {label}
    </Typography>
    <Stack spacing={0.3} sx={{ mt: 0.5 }}>
      {rows.map(({ label: rowLabel, value, color }) => (
        <Stack key={rowLabel} direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" sx={{ color: '#446688', fontSize: '0.7rem' }}>
            {rowLabel}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: color ?? '#7ab3e0', fontVariantNumeric: 'tabular-nums', fontWeight: 700, fontSize: '0.75rem' }}
          >
            {typeof value === 'number' ? value.toLocaleString() : value}
          </Typography>
        </Stack>
      ))}
    </Stack>
  </Box>
);

// ============================================================
// MINI GRAPHE — dessin canvas direct, zéro dépendance
// ============================================================

function drawMiniChart(canvas, history) {
  if (history.length < 2) return;
  const ctx  = canvas.getContext('2d');
  const W    = canvas.width;
  const H    = canvas.height;
  const n    = history.length;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#0a1520';
  ctx.fillRect(0, 0, W, H);

  const maxTotal = Math.max(...history.map(h => h.total ?? 0), 1);

  for (const { key, color } of CHART_SERIES) {
    // Rétrocompat : sauter les séries absentes de l'historique (ex. B10 sans chemosynthesis)
    if (!history.some(h => (h[key] ?? 0) > 0)) continue;

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth   = key === 'total' ? 1.5 : 1;
    ctx.globalAlpha = key === 'total' ? 0.9 : 0.75;

    for (let i = 0; i < n; i++) {
      const x = (i / (n - 1)) * W;
      const y = H - ((history[i][key] ?? 0) / maxTotal) * (H - 4) - 2;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
}

// ============================================================
// STYLES
// ============================================================

const styles = {
  root: {
    width: 220,
    minHeight: '100%',
    bgcolor: '#0a0f1a',
    border: '1px solid #1e2d45',
    borderRadius: 2,
    p: 2.5,
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    boxSizing: 'border-box',
    userSelect: 'none',
  },

  titleBlock: {
    textAlign: 'center',
    mb: 1,
  },
  subtitle: {
    color: '#3a6ea5',
    fontSize: '0.6rem',
    letterSpacing: '0.15em',
    lineHeight: 1,
    display: 'block',
  },
  title: {
    color: '#7ab3e0',
    fontWeight: 700,
    letterSpacing: '0.2em',
    lineHeight: 1.1,
  },
  btnEvent: {
  borderColor: '#2a1f4a', color: '#9966ff',
  '&:hover': { borderColor: '#6633cc', bgcolor: '#0d0a1a' },
  fontWeight: 600,
},
  version: {
    color: '#c8e6ff',
    fontWeight: 900,
    lineHeight: 1,
    fontSize: '3rem',
  },

  divider: {
    borderColor: '#1e2d45',
    my: 2,
  },

  sectionLabel: {
    color: '#3a6ea5',
    fontSize: '0.65rem',
    letterSpacing: '0.12em',
    display: 'block',
    mb: 0.5,
  },

  btnPlay: {
    bgcolor: '#1a5c3a',
    color: '#a8f0c6',
    '&:hover': { bgcolor: '#236b45' },
    fontWeight: 700,
    letterSpacing: '0.08em',
  },
  btnPause: {
    bgcolor: '#5c4a1a',
    color: '#f0d8a8',
    '&:hover': { bgcolor: '#6b5520' },
    fontWeight: 700,
    letterSpacing: '0.08em',
  },
  btnReset: {
    borderColor: '#2a3f5c',
    color: '#5a8ab8',
    '&:hover': {
      borderColor: '#3a5c8a',
      bgcolor: '#0d1826',
    },
    fontWeight: 600,
  },

  speedValue: {
    color: '#c8e6ff',
    fontWeight: 700,
    lineHeight: 1,
    mb: 1.5,
  },

  slider: {
    color: '#3a6ea5',
    '& .MuiSlider-mark': { bgcolor: '#1e2d45' },
    '& .MuiSlider-markLabel': { color: '#3a6ea5', fontSize: '0.65rem' },
    '& .MuiSlider-thumb': {
      bgcolor: '#7ab3e0',
      width: 14, height: 14,
    },
    '& .MuiSlider-rail': { bgcolor: '#1e2d45' },
  },

  popValue: {
    color: '#c8e6ff',
    fontWeight: 900,
    lineHeight: 1,
    fontSize: '2rem',
    mb: 0.5,
  },

  statsPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.5,
  },
};

export default CambrienControl;