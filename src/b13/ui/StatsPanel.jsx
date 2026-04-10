import { useRef, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip as ChartTooltip } from 'recharts';
import { useGeo13 } from '../Geo13Context';

const AUTO_EVENT_LABELS = {
  earthquake:   '⚡ Séisme',
  volcano:      '🌋 Volcan',
  flood:        '🌊 Inondation',
  drought:      '☀ Sécheresse',
  meteor:       '☄ Météorite',
  mountainRange:'⛰ Orogénèse',
  warming:        '🌡️ Réchauffement',
  glaciation:     '🧊 Glaciation',
  predatorBoost:  '🦖 Nv. prédateur',
};

function StatBlock({ label, value, color = '#d1d5db' }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, minWidth: 56 }}>
      <Typography sx={{ fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, lineHeight: 1 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 20, fontWeight: 'bold', color, lineHeight: 1.1, fontFamily: 'monospace' }}>
        {value}
      </Typography>
    </Box>
  );
}

export default function StatsPanel() {
  const { engineRef, entityVersion, tick, isRunning, toggleRun, speed, setSpeed, grid, gridVersion, cellSize, setCellSize, lastAutoEvent, season } = useGeo13();
  const em = engineRef.current?.em;
  const historyRef = useRef([]);

  // ── Comptages courants + historique ────────────────────────────
  // Calculés pendant le rendu (déclenché par entityVersion), stockés dans un ref.
  // La garde sur tick évite les doublons en React StrictMode (double invoke).
  const predCount  = em ? em.query('Predator').length                    : 0;
  const herbCount  = em ? em.query('Needs').length - predCount           : 0;
  const plantCount = em ? em.query('Plant').length                       : 0;
  const lastEntry  = historyRef.current[historyRef.current.length - 1];
  if (em && (!lastEntry || lastEntry.tick !== tick)) {
    const next = historyRef.current.slice(-149);
    next.push({ tick, plants: plantCount, herbivores: herbCount, predators: predCount });
    historyRef.current = next;
  }
  const history = historyRef.current;

  // ── Causes de mort ─────────────────────────────────────────────
  const deaths = useMemo(() => {
    const d = engineRef.current?.deathStats;
    return d ?? { age: 0, hunger: 0, thirst: 0, predation: 0 };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engineRef, entityVersion]);

  // ── Température moyenne (stable, recalculée seulement si la grid change) ─
  const avgTemp = useMemo(() => {
    if (!grid) return '—';
    let sum = 0, n = 0;
    for (let y = 0; y < grid.rows; y++) {
      for (let x = 0; x < grid.cols; x++) {
        const cell = grid.getCell(x, y);
        if (cell?.temperature !== undefined) { sum += cell.temperature; n++; }
      }
    }
    return n > 0 ? `${Math.round(sum / n)}°` : '—';
  }, [grid, gridVersion]);

  const toggleSx = {
    '& .MuiToggleButton-root': {
      color: '#6b7280', borderColor: '#374151',
      fontFamily: 'monospace', fontSize: 11, px: 1.2, py: 0.5, letterSpacing: 2,
      '&.Mui-selected': { color: '#6ee7b7', background: '#064e3b', borderColor: '#10b981', '&:hover': { background: '#065f46' } },
      '&:hover': { background: '#1f2937' },
    },
  };

  return (
    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2, px: 3, overflow: 'hidden' }}>

      {/* Play / Pause */}
      <Tooltip title={isRunning ? 'Pause' : 'Reprendre'}>
        <IconButton
          onClick={toggleRun}
          size="small"
          sx={{
            color: isRunning ? '#6ee7b7' : '#9ca3af',
            border: '1px solid',
            borderColor: isRunning ? '#10b981' : '#374151',
            borderRadius: 1.5,
            '&:hover': { background: '#1f2937' },
          }}
        >
          {isRunning ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
        </IconButton>
      </Tooltip>

      {/* Vitesse + Zoom (colonne) */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <ToggleButtonGroup
          value={speed}
          exclusive
          onChange={(_, v) => v !== null && setSpeed(v)}
          size="large"
          sx={toggleSx}
        >
          <ToggleButton value={1}>●○○</ToggleButton>
          <ToggleButton value={2}>●●○</ToggleButton>
          <ToggleButton value={3}>●●●</ToggleButton>
        </ToggleButtonGroup>
        <ToggleButtonGroup
          value={cellSize}
          exclusive
          onChange={(_, v) => v !== null && setCellSize(v)}
          size="large"
          sx={toggleSx}
        >
          <ToggleButton value={14}>-</ToggleButton>
          <ToggleButton value={22}>⊙</ToggleButton>
          <ToggleButton value={34}>+</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Divider orientation="vertical" flexItem sx={{ borderColor: '#374151', mx: 1 }} />

      <StatBlock label="Tick" value={tick} />

      {season && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, minWidth: 64 }}>
          <Typography sx={{ fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, lineHeight: 1 }}>
            Saison
          </Typography>
          <Typography sx={{ fontSize: 16, lineHeight: 1.1, fontFamily: 'monospace' }}>
            {season.icon} {season.name}
          </Typography>
        </Box>
      )}

      {/* Graphe population — plantes sur axe gauche, animaux sur axe droit */}
      <Box sx={{ width: 210, height: 58, flexShrink: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history} margin={{ top: 3, right: 3, bottom: 3, left: 3 }}>
            <YAxis yAxisId="plants"  hide domain={[0, 'auto']} />
            <YAxis yAxisId="animals" hide domain={[0, 'auto']} orientation="right" />
            <ChartTooltip
              contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 4, fontSize: 11, padding: '4px 8px' }}
              labelStyle={{ color: '#6b7280', marginBottom: 2 }}
              labelFormatter={(t) => `Tick ${t}`}
              formatter={(v, name) => [v.toLocaleString(), name]}
            />
            <Line yAxisId="plants"  type="monotone" dataKey="plants"     stroke="#6ee7b7" dot={false} strokeWidth={1.5} isAnimationActive={false} />
            <Line yAxisId="animals" type="monotone" dataKey="herbivores" stroke="#fbbf24" dot={false} strokeWidth={1.5} isAnimationActive={false} />
            <Line yAxisId="animals" type="monotone" dataKey="predators"  stroke="#f87171" dot={false} strokeWidth={2}   isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      <StatBlock label="Temp. moy." value={avgTemp} />

      {lastAutoEvent && (tick - lastAutoEvent.tick) < 20 && (
        <Box sx={{
          fontSize: 11, fontFamily: 'monospace', color: '#fde68a',
          border: '1px solid #92400e', borderRadius: 1, px: 1, py: 0.5,
          background: '#1c1007', whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          {AUTO_EVENT_LABELS[lastAutoEvent.type] ?? lastAutoEvent.type}
        </Box>
      )}

      <Divider orientation="vertical" flexItem sx={{ borderColor: '#374151', mx: 1 }} />

      <StatBlock label="† Âge"      value={deaths.age}       color="#9ca3af" />
      <StatBlock label="† Faim"     value={deaths.hunger}    color="#f97316" />
      <StatBlock label="† Soif"     value={deaths.thirst}    color="#60a5fa" />
      <StatBlock label="† Prédat."  value={deaths.predation} color="#f87171" />
    </Box>
  );
}
