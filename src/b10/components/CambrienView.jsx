/**
 * SimulationView - Composant principal de la simulation
 */

import React, { useState, useEffect, useRef } from 'react';
import { Container, Grid, Paper, Box, Stack } from '@mui/material';
import { CambrienEngine } from '../engine/CambrienEngine.js';
import ControlPanel from '../../b9/components/ControlPanel.jsx';
import OceanRenderer from './OceanRenderer.jsx';
import CambrienControl from './CambrienControl.jsx';
import CambrienTop from './CambrienTop.jsx';

const CambrienView = () => {
  const [engine] = useState(() => new CambrienEngine(200, 200));
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [cellSize, setCellSize] = useState(10);
  const [stats, setStats] = useState(engine.getStats());
  const intervalRef = useRef(null);
const [viewMode, setViewMode] = useState('bacteria');

  // Initialisation
  useEffect(() => {
    engine.initialize();
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
  
  const handleTogglePause = () => {
    setRunning(!running);
    engine.togglePause();
  };

  const handleReset = () => {
    setRunning(false);
    engine.reset(10);
   // setStats(engine.getStats());
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
              <CambrienControl
                running={running} engine={engine}
                onTogglePause={handleTogglePause}
                onReset={handleReset}
                 onEvent={handleEvent}
                speed={speed} 
                 cellSize={cellSize}
  onCellSizeChange={setCellSize}
                onSpeedChange={handleSpeedChange}
                stats={stats}
              />
              {/* <ComponentStatsPanel engine={engine}/> */}
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
              <OceanRenderer engine={engine} cellSize={cellSize} /> 

            </Paper>
               {/* <PopulationChart historyData={engine.getPopulationHistory()} /> */}
          </Grid>

          <Grid item xs={12} md={3}>

            <CambrienTop engine={engine} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default CambrienView;