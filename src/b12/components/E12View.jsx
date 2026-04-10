/**
 * E12View — layout fullscreen avec panneaux coulissants
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, Button, ButtonGroup } from '@mui/material';
import ChevronLeftIcon  from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { E12Engine }      from '../ecs/Engine';
import WorldRenderer      from '../ui/WorldRenderer';
import EspeceControl     from '../ui/EspeceControl';

// ── Largeurs des panneaux ─────────────────────────────────────────────────────
const LEFT_W  = 240;
const RIGHT_W = 300;

// ── Onglet vertical coulissant ────────────────────────────────────────────────
const PanelTab = ({ side, open, onClick, label , children}) => {
  const isLeft = side === 'left';
  return (
    <Box
      onClick={onClick}
      sx={{
        position: 'absolute',
        [isLeft ? 'left' : 'right']: open ? (isLeft ? LEFT_W : RIGHT_W) : 0,
        top: '50%',
        transform: 'translateY(-50%)',
        transition: `${isLeft ? 'left' : 'right'} 0.3s ease`,
        zIndex: 20,
        cursor: 'pointer',
        bgcolor: '#0a0f1a',
        border: '1px solid #1e2d45',
        ...(isLeft
          ? { borderLeft: 'none', borderRadius: '0 6px 6px 0' }
          : { borderRight: 'none', borderRadius: '6px 0 0 6px' }),
        px: 0.5, py: 1.5,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5,
        '&:hover': { bgcolor: '#111827' },
        userSelect: 'none',
      }}
    >
      {isLeft
        ? (open ? <ChevronLeftIcon  sx={{ color: '#3a6ea5', fontSize: 16 }} />
                : <ChevronRightIcon sx={{ color: '#3a6ea5', fontSize: 16 }} />)
        : (open ? <ChevronRightIcon sx={{ color: '#3a6ea5', fontSize: 16 }} />
                : <ChevronLeftIcon  sx={{ color: '#3a6ea5', fontSize: 16 }} />)
      }
      <Typography sx={{
        color: '#3a6ea5', fontSize: '0.5rem',
        writingMode: 'vertical-rl', letterSpacing: '0.12em',
        textTransform: 'uppercase', lineHeight: 1,
      }}>
        {label}
      </Typography>
      {children}
    </Box>
  );
};

// ── Composant principal ───────────────────────────────────────────────────────

const E12View = () => {
  const [engine]  = useState(() => new E12Engine());
  const [running, setRunning]     = useState(false);
  const [speed,   setSpeed]       = useState(1);
  const [stats,   setStats]       = useState(() => engine.stats);
  const [entities, setEntities]   = useState([]);
  const [playerState, setPlayerState] = useState(() => engine.getPlayerState());
  
  const [leftOpen,  setLeftOpen]  = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const intervalRef = useRef(null);

  // Initialisation
  useEffect(() => {
    engine.initialize();
    setStats({ ...engine.stats });
    setEntities(engine.getActiveEntities());
  }, [engine]);

  // Boucle de simulation
  useEffect(() => {
    if (running) {
      const tickInterval = Math.max(16, 1000 / (60 * speed));
      intervalRef.current = setInterval(() => {
        engine.tick();
        setStats({ ...engine.stats });
        setEntities(engine.getActiveEntities());
        setPlayerState(engine.getPlayerState());
      }, tickInterval);
    } else {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => clearInterval(intervalRef.current);
  }, [running, speed, engine]);

  const handleTogglePause = useCallback(() => {
    setRunning(r => !r);
    engine.togglePause();
  }, [engine]);

  const handleUpdate = useCallback(() => {
    setStats({ ...engine.stats });
    setPlayerState(engine.getPlayerState());
  }, [engine]);

  const handleReset = useCallback(() => {
    setRunning(false);
    engine.reset();
    setStats({ ...engine.stats });
    setEntities(engine.getActiveEntities());
    setPlayerState(engine.getPlayerState());
  }, [engine]);

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', bgcolor: '#000' }}>

      {/* ── Canvas biome actif ── */}
      <Box sx={{
        position: 'absolute', inset: 0,
        display: 'flex', justifyContent: 'center', alignItems: 'center',
      }}>
        <WorldRenderer
          entities={entities}
          playerGenes={engine.player.genes}
          biomeId={engine.getActiveBiomeId()}
        />
      </Box>

      {/* ── HUD minimal (provisoire) ── */}
      <Box sx={{
        position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center', gap: 2, zIndex: 30,
        bgcolor: 'rgba(0,0,0,0.55)', borderRadius: 1, px: 2, py: 0.5,
      }}>
        <Typography variant="caption" sx={{ color: '#aaa', fontFamily: 'monospace' }}>
          Pop <strong style={{ color: '#00ffaa' }}>{stats.population}</strong>
          &nbsp;|&nbsp;
          Pts <strong style={{ color: '#ffcc44' }}>{stats.evolutionPoints}</strong>
          &nbsp;|&nbsp;
          Score <strong style={{ color: '#fff' }}>{stats.score}</strong>
          &nbsp;|&nbsp;
          Tick <strong style={{ color: '#888' }}>{stats.tickCount}</strong>
        </Typography>
        <ButtonGroup size="small" variant="outlined">
          <Button onClick={handleTogglePause} sx={{ color: '#aaa', borderColor: '#333', fontSize: '0.65rem' }}>
            {running ? '⏸' : '▶'}
          </Button>
          <Button onClick={handleReset} sx={{ color: '#aaa', borderColor: '#333', fontSize: '0.65rem' }}>
            ↺
          </Button>
          {[0.5, 1, 2, 4].map(s => (
            <Button
              key={s}
              onClick={() => setSpeed(s)}
              sx={{
                color: speed === s ? '#00ffaa' : '#aaa',
                borderColor: '#333', fontSize: '0.65rem',
              }}
            >
              {s}×
            </Button>
          ))}
        </ButtonGroup>
      </Box>

      {/* ── Panneau gauche ── */}
      <Box sx={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: LEFT_W,
        transform: leftOpen ? 'translateX(0)' : `translateX(-${LEFT_W}px)`,
        transition: 'transform 0.3s ease', zIndex: 10, overflowY: 'auto',
        bgcolor: 'rgba(10,15,26,0.85)',
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-thumb': { bgcolor: '#1e2d45', borderRadius: 2 },
      }}>
        <EspeceControl
          engine={engine}
          playerState={playerState}
          stats={stats}
          onUpdate={handleUpdate}
        />
      </Box>
      <PanelTab side="left" open={leftOpen} onClick={() => setLeftOpen(o => !o)} label="Ctrl">

      </PanelTab>

      {/* ── Panneau droit ── */}
      <Box sx={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: RIGHT_W,
        transform: rightOpen ? 'translateX(0)' : `translateX(${RIGHT_W}px)`,
        transition: 'transform 0.3s ease', zIndex: 10, overflowY: 'auto',
        bgcolor: 'rgba(10,15,26,0.85)',
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-thumb': { bgcolor: '#222', borderRadius: 2 },
      }}>
        {/* TODO: Stats / EvoTree */}
      </Box>
      <PanelTab side="right" open={rightOpen} onClick={() => setRightOpen(o => !o)} label="Stats" />

    </Box>
  );
};

export default E12View;
