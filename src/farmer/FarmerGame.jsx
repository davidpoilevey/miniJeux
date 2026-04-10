

// src/components/MainLayout.js
import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { FarmingProvider, useFarming } from './FarmingProvider';
import Field, { FieldFantome } from './Field';
import EntrepotPanel from './Entrepot';
import CommandesPanel from './Commandes';
import ZonePrincipale from './ZonePrincipale';

const FarmerGame = () => {
  return (
    <FarmingProvider>
      <MainLayout />
    </FarmingProvider>
  );
};
export default FarmerGame;

const MainLayout = () => {
  const { fields } = useFarming();
 return (
    <Box sx={{display:"flex", height:"100vh", p:2, boxSizing:"border-box", backgroundColor:'#fed191'}}>
      {/* Panneau latéral (colonne de droite) */}
      <Box display="flex" flexDirection="column" gap={2} width="300px">
          <EntrepotPanel/>
          
         <CommandesPanel/>
      </Box>

      {/* Zone principale */}
        <ZonePrincipale/>
    </Box>
  );
};