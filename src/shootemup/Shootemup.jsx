// src/App.js
import React from 'react';
import { Box, Container, Grid } from '@mui/material';
import Espace from './Espace';
import { SpaceProvider } from './SpaceProvider';

const Shootemup = ()=> {
    const randomSize=Math.round(Math.random() * 2 +1);
  return (
    <SpaceProvider>
      <Grid container spacing={2}  height={'100%'}>
        <Grid item xs={10} height={'100%'} position={'relative'}>
        <div>
      {/* Étoiles défilantes */}
      {Array.from({ length: 20 }).map((_, index) => (
        <div
          key={'star'+index}
          className="star"
          style={{
            zIndex:2,opacity:0.6,
            border:'2px solid #eee',
            top: `0px`, // Position verticale aléatoire
            left: `${Math.random() * 100}%`, // Position horizontale aléatoire
            width: `${randomSize}px`, // Taille aléatoire
            height: `${randomSize}px`, // Taille aléatoire
            animation: `starAnimation ${Math.random() * 10 + 3}s linear infinite, starFlicker 1s linear infinite `, // Durée et vitesse de l'animation aléatoires
          }}
        />
      ))}
    </div>
          <Espace />
          
        </Grid>
        <Grid item xs={2}  sx={{background:'green'}}>
          {/* Ici, vous pouvez ajouter le panneau de résumé des scores */}
        </Grid>
      </Grid>
          </SpaceProvider>
  );
}

export default Shootemup;
