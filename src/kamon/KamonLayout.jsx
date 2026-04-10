// src/GameLayout.jsx

import React, { useState } from 'react';
import {
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Box,
  Grid,
  Paper,
} from '@mui/material';
import KamonBoard from './KamonBoard';
import { OnBoardingProvider } from '../OnBoardingContext';



const KamonLayout = () => {
  return (
    // Structure flex verticale pour remplir la vue
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <CssBaseline />
            <OnBoardingProvider app="kamon" stepsConfig={[{id:'intro1'}, {id:'intro2'}]}>
                
      {/* 1. Barre de titre */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div">
            Kamon
          </Typography>
        </Toolbar>
      </AppBar>

      {/* 2. Zone de contenu principale (le reste de l'écran) */}
      <Box
        component="main"
        sx={{
          flexGrow: 1, // Prend toute la place restante
          padding: 2,
          overflow: 'hidden', // Empêche le débordement
          height: 'calc(100vh - 64px)' // Hauteur restante (viewport - appbar)
        }}
      >
       
            <Paper sx={{ height: '100%', overflow: 'hidden', backgroundColor: '#333' }}>
              <KamonBoard/>
            </Paper>
      </Box>
      </OnBoardingProvider>
    </Box>
  );
};

export default KamonLayout;