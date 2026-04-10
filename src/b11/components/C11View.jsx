/**
 * C11View - Layout fullscreen avec panneaux coulissants
 */

import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import ChevronLeftIcon  from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import { C11Engine }       from '../engine/C11Engine.jsx';
import WorldRenderer       from './WorldRenderer.jsx';
import CambrienControl     from '../../b10/components/CambrienControl.jsx';
import C11Top              from './C11Top.jsx';

// ── Largeurs des panneaux ──────────────────────────────────────────────────────
const LEFT_W  = 240;   // CambrienControl
const RIGHT_W = 300;   // C11Top

// ── Onglet vertical (bouton coulissant) ───────────────────────────────────────
const PanelTab = ({ side, open, onClick, label }) => {
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
        px: 0.5,
        py: 1.5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.5,
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
        color: '#3a6ea5',
        fontSize: '0.5rem',
        writingMode: 'vertical-rl',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        lineHeight: 1,
      }}>
        {label}
      </Typography>
    </Box>
  );
};

// ── Composant principal ───────────────────────────────────────────────────────

const C11View = () => {
  const [engine]   = useState(() => new C11Engine(200, 200));
  const [running,  setRunning]  = useState(false);
  const [speed,    setSpeed]    = useState(1);
  const [cellSize, setCellSize] = useState(10);
  const [stats,    setStats]    = useState(engine.stats);
  const [leftOpen,  setLeftOpen]  = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const intervalRef = useRef(null);

  // Initialisation
  useEffect(() => {
    engine.initialize();
    setStats({ ...engine.stats });
  }, [engine]);

  // Boucle de simulation
  useEffect(() => {
    if (running) {
      const tickInterval = 1000 / (60 * speed);
      intervalRef.current = setInterval(() => {
        engine.tick(16.67);
        setStats({ ...engine.stats });
      }, tickInterval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, speed, engine]);

  const handleTogglePause = () => { setRunning(r => !r); engine.togglePause(); };
  const handleReset       = () => { setRunning(false); engine.reset(10); };
  const handleSpeedChange = (v) => setSpeed(v);
  const handleEvent       = (type) => engine?.applyEvent(type);

  return (
    <Box sx={{
      position: 'relative',
      width: '100%',
      height: '100vh',
      overflow: 'hidden',
      bgcolor: '#000',
    }}>

      {/* ── Ocean — fond plein écran ── */}
      <Box sx={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: '#000',
      }}>
        <WorldRenderer engine={engine} cellSize={cellSize} />
      </Box>

      {/* ── Panneau gauche : CambrienControl ── */}
      <Box sx={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: LEFT_W,
        transform: leftOpen ? 'translateX(0)' : `translateX(-${LEFT_W}px)`,
        transition: 'transform 0.3s ease',
        zIndex: 10,
        overflowY: 'auto',
        '&::-webkit-scrollbar':       { width: 4 },
        '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
        '&::-webkit-scrollbar-thumb': { bgcolor: '#1e2d45', borderRadius: 2 },
      }}>
        <CambrienControl
          running={running}
          engine={engine}
          onTogglePause={handleTogglePause}
          onReset={handleReset}
          onEvent={handleEvent}
          speed={speed}
          cellSize={cellSize}
          onCellSizeChange={setCellSize}
          onSpeedChange={handleSpeedChange}
          stats={stats}
          title="CAMBRIEN"
          version="11.0"
        />
      </Box>

      {/* ── Tab gauche ── */}
      <PanelTab
        side="left"
        open={leftOpen}
        onClick={() => setLeftOpen(o => !o)}
        label="Ctrl"
      />

      {/* ── Panneau droit : C11Top ── */}
      <Box sx={{
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: RIGHT_W,
        transform: rightOpen ? 'translateX(0)' : `translateX(${RIGHT_W}px)`,
        transition: 'transform 0.3s ease',
        zIndex: 10,
        overflowY: 'auto',
        '&::-webkit-scrollbar':       { width: 4 },
        '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
        '&::-webkit-scrollbar-thumb': { bgcolor: '#222', borderRadius: 2 },
      }}>
        <C11Top engine={engine} />
      </Box>

      {/* ── Tab droit ── */}
      <PanelTab
        side="right"
        open={rightOpen}
        onClick={() => setRightOpen(o => !o)}
        label="Stats"
      />

    </Box>
  );
};

export default C11View;
