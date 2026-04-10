/**
 * ControlPanel - Panneau de contrôle de la simulation
 */

import React from 'react';
import {
  Paper,
  Stack,
  Button,
  ButtonGroup,
  Slider,
  Typography,
  Divider,
  Chip,
  Box
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Refresh,
  Speed
} from '@mui/icons-material';
import EventsMenu from './EventsMenu';

const ControlPanel = ({
  running, engine, onEvent,
  onTogglePause,
  onReset,onViewModeChange, viewMode,
  speed,
  onSpeedChange, onThanos,
  stats
}) => {
  const dayNightRatio = engine?.world?.getDayNightRatio() || 0;
  const isDay = dayNightRatio > 0.3;
  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        border: '1px solid #404040'
      }}
    >
      <Stack spacing={3}>
        {/* Titre */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: '#00ff88',
            fontFamily: '"Courier New", monospace',
            letterSpacing: '0.03em'
          }}
        >
          BACTÉRIE 9.0
        </Typography>
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
        >
          <Typography
            sx={{
              fontFamily: '"Courier New", monospace',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: isDay ? '#000' : '#aaa',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5
            }}
          >
            {isDay ? '☀️' : '🌙'}
            {isDay ? 'JOUR' : 'NUIT'}
            <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>
              {(dayNightRatio * 100).toFixed(0)}%
            </span>
          </Typography>
        </Box>

        <Divider sx={{ borderColor: '#404040' }} />

        {/* Contrôles principaux */}
        <Stack direction="row" spacing={2} justifyContent="center">
          <ButtonGroup variant="contained" size="medium">
            <Button
              onClick={onTogglePause}
              startIcon={running ? <Pause /> : <PlayArrow />}
              sx={{
                bgcolor: running ? '#ff4444' : '#00ff88',
                color: '#000',
                fontWeight: 700,
                '&:hover': {
                  bgcolor: running ? '#ff6666' : '#00ffaa'
                }
              }}
            >
              {running ? 'PAUSE' : 'PLAY'}
            </Button>
            <Button
              onClick={onReset}
              startIcon={<Refresh />}
              sx={{
                bgcolor: '#4488ff',
                color: '#fff',
                fontWeight: 700,
                '&:hover': {
                  bgcolor: '#66aaff'
                }
              }}
            >
              RESET
            </Button>

          </ButtonGroup>
        </Stack>
       <EventsMenu onEvent={onEvent} />


{/* TOGGLE VIEW MODE */}
<Stack spacing={1}>
  <Typography 
    variant="caption" 
    sx={{ 
      color: '#00ff88',
      fontFamily: '"Courier New", monospace',
      fontWeight: 700
    }}
  >
    MODE AFFICHAGE
  </Typography>
  
  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
    {[
      { value: 'bacteria', label: '🦠', name: 'Bactéries' },
      { value: 'chemA', label: 'A', name: 'Glycoald.' },
      { value: 'chemB', label: 'B', name: 'Phytosynol' },
      { value: 'chemC', label: 'C', name: 'Xenofer.' },
      { value: 'chemD', label: 'D', name: 'Chromatin' },
      { value: 'reserves', label: '🌱', name: 'Réserves' },
      { value: 'overlay', label: '👁️', name: 'Overlay' }
    ].map(mode => (
      <Button
        key={mode.value}
        variant={viewMode === mode.value ? 'contained' : 'outlined'}
        size="small"
        onClick={() => onViewModeChange(mode.value)}
        sx={{
          minWidth: '45px',
          fontFamily: '"Courier New", monospace',
          fontSize: '0.7rem',
          bgcolor: viewMode === mode.value ? '#00ff88' : 'transparent',
          color: viewMode === mode.value ? '#000' : '#00ff88',
          borderColor: '#00ff88',
          '&:hover': {
            bgcolor: viewMode === mode.value ? '#00ff88' : '#00ff8822',
            borderColor: '#00ff88'
          }
        }}
        title={mode.name}
      >
        {mode.label}
      </Button>
    ))}
  </Stack>
</Stack>
        {/* Vitesse de simulation */}
        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Speed sx={{ color: '#00ff88' }} />
            <Typography
              variant="body2"
              sx={{
                color: '#aaa',
                fontFamily: '"Courier New", monospace'
              }}
            >
              VITESSE: {speed}x
            </Typography>
          </Stack>
          <Slider
            value={speed}
            onChange={(e, value) => onSpeedChange(value)}
            min={1}
            max={10}
            step={1}
            marks
            sx={{
              color: '#00ff88',
              '& .MuiSlider-thumb': {
                bgcolor: '#00ff88',
                border: '2px solid #000'
              },
              '& .MuiSlider-track': {
                bgcolor: '#00ff88'
              },
              '& .MuiSlider-rail': {
                bgcolor: '#404040'
              }
            }}
          />
        </Stack>

        <Divider sx={{ borderColor: '#404040' }} />

        {/* Statistiques */}
        <Stack spacing={2}>
          <Typography
            variant="subtitle2"
            sx={{
              color: '#00ff88',
              fontFamily: '"Courier New", monospace',
              letterSpacing: '0.05em'
            }}
          >
            STATISTIQUES
          </Typography>
          <Chip
            label={`Tick: ${stats.tickCount || 0}`}
            sx={{
              bgcolor: '#666',
              color: '#fff',
              fontWeight: 600,
              fontFamily: '"Courier New", monospace'
            }}
          />
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              label={`Pop: ${stats.population}`}
              sx={{
                bgcolor: '#00ff88',
                color: '#000',
                fontWeight: 700,
                fontFamily: '"Courier New", monospace'
              }}
            />
            <Chip
              label={`Naissances: ${stats.totalBirths}`}
              sx={{
                bgcolor: '#44ff88',
                color: '#000',
                fontWeight: 600,
                fontFamily: '"Courier New", monospace'
              }}
            />
            <Chip
              label={`Décès: ${stats.totalDeaths}`}
              sx={{
                bgcolor: '#ff4444',
                color: '#fff',
                fontWeight: 600,
                fontFamily: '"Courier New", monospace'
              }}
            />
            <Chip
              label={`TPS: ${stats.ticksPerSecond}`}
              sx={{
                bgcolor: '#4488ff',
                color: '#fff',
                fontWeight: 600,
                fontFamily: '"Courier New", monospace'
              }}
            />
          </Stack>


          <Stack spacing={0.5}>
            <Typography variant="caption" sx={{ color: '#888', fontFamily: '"Courier New", monospace' }}>
              Tick: {stats.tickCount || 0} | Δ Naiss: +{stats.births} | Δ Décès: -{stats.deaths}
            </Typography>

            <Typography variant="caption" sx={{ color: '#ff4444', fontFamily: '"Courier New", monospace' }}>
              🦷 Kills: {stats.predatorKills}
            </Typography>

            <Typography variant="caption" sx={{ color: '#ff88ff' }}>
              💑 Sexe: {stats.sexualReproductions}
            </Typography>
            
  <Typography variant="caption" sx={{ color: '#88bbdd' }}>
    🏗️ Struct: {stats.carbonateStructures} ({stats.carbonateSegments} segments)
  </Typography>
  

            <Typography variant="caption" sx={{ color: '#ff4400', fontFamily: '"Courier New", monospace' }}>
              💥 Ex: {stats.explosions} (☠️ {stats.explosionKills})
            </Typography>

            <Typography variant="caption" sx={{ color: '#ff66ff', fontFamily: '"Courier New", monospace' }}>
              🦟 Par.: {stats.parasiteDrains} drains
            </Typography>


            <Typography variant="caption" sx={{ color: '#88aaff' }}>
              🍄 Filtr.: {stats.organicFeeders}O / {stats.mineralFeeders}M
            </Typography>
            
  <Typography variant="caption" sx={{ color: '#cc88ff' }}>
    🌸 Sporulation: {stats.sporulations} ({stats.sporesCreated} spores)
  </Typography>
  
            <Typography variant="caption" sx={{ color: '#6666ff' }}>
              ⏸️ Dormance: {stats.dormantBacteria} | 🕐 Migrations: {stats.clockMigrations}
            </Typography>

            <Typography variant="caption" sx={{ color: '#44ffaa', fontFamily: '"Courier New", monospace' }}>
              🤝 Symbioses: {stats.symbioticPartnerships}
            </Typography>

            <Typography variant="caption" sx={{ color: '#ffdd00', fontFamily: '"Courier New", monospace' }}>
              ⭐ Spécialisations: {stats.specializations}
            </Typography>

          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default ControlPanel;