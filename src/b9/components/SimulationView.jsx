/**
 * SimulationView - Composant principal de la simulation
 */

import React, { useState, useEffect, useRef } from 'react';
import { Container, Grid, Paper, Box, Stack } from '@mui/material';
import { SimulationEngine } from '../engine/SimulationEngine.js';
import CanvasRenderer from './CanvasRenderer.jsx';
import ControlPanel from './ControlPanel.jsx';
import ComponentStatsPanel from './ComponentStatsPanel.jsx';
import TopCombosPanel from './TopCombosPanel.jsx';
import PopulationChart from './PopulationChart.jsx';

const SimulationView = () => {
  const [engine] = useState(() => new SimulationEngine(200, 200));
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [stats, setStats] = useState(engine.getStats());
  const intervalRef = useRef(null);
const [viewMode, setViewMode] = useState('bacteria');

  // Initialisation
  useEffect(() => {
    engine.initialize(100);
    setStats(engine.getStats());
  }, [engine]);

  // Boucle de simulation
  useEffect(() => {
    if (running) {
      const tickInterval = 1000 / (60 * speed); // 60 ticks/sec * vitesse
      
      intervalRef.current = setInterval(() => {
        engine.tick(16.67); // ~60fps nominal
        setStats(engine.getStats());
      }, tickInterval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [running, speed, engine]);
// Dans SimulationView.jsx

const handleThanos = () => {
  if (engine) {
    engine.thanosSelection();
  }
};
  const handleTogglePause = () => {
    setRunning(!running);
    engine.togglePause();
  };

  const handleReset = () => {
    setRunning(false);
    engine.reset(100);
    setStats(engine.getStats());
  };

  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
  };
  const handleEvent = (eventType) => {
  if (engine) {
    engine.applyEvent(eventType);
  }
};

  return (
    <Box 
      sx={{ 
        height: '100%',overflow:'auto',
        background: 'linear-gradient(to bottom, #0a0a0a 0%, #1a1a1a 100%)',
        py: 4, pr:0
      }}
    >
      <Container maxWidth="xl" paddingRight={0}>
        <Grid container spacing={2}>
          {/* Panneau de contrôle */}
          <Grid item xs={12} md={2}>
            <Stack spacing={3}>
              <ControlPanel
                running={running} engine={engine}
                onTogglePause={handleTogglePause}
                onReset={handleReset}
                 viewMode={viewMode}
  onViewModeChange={setViewMode}  onEvent={handleEvent}
                speed={speed} onThanos={handleThanos} 
                onSpeedChange={handleSpeedChange}
                stats={stats}
              />
              <ComponentStatsPanel engine={engine}/>
            </Stack>
          </Grid>

          {/* Canvas de simulation */}
          <Grid item xs={12} md={7}>
            <Paper 
              elevation={3}
              sx={{
                p: 2,
                bgcolor: '#1a1a1a',
                border: '1px solid #404040',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <CanvasRenderer engine={engine} cellSize={4}  viewMode={viewMode} />

            </Paper>
               <PopulationChart historyData={engine.getPopulationHistory()} />
          </Grid>

          <Grid item xs={12} md={3}>

              <TopCombosPanel engine={engine} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default SimulationView;