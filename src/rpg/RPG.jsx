import React, { useState, useEffect, useRef } from 'react';

import { Box, Typography, Button, Stack } from '@mui/material';
import { UtopiaLand } from './UtopiaLand';
import { RPGProvider } from './RPGContext';
import { KeyManager } from './KeyManager';
import { NiveauBuilderDialog } from './editeurNiveaux/EditeurNiveau';


const RPG=()=>{
 const [selectedLevel, setSelectedLevel] = useState(null);

  return (
    <RPGProvider startlevel={selectedLevel} setSelectedLevel={setSelectedLevel}>
      {selectedLevel ? (
        <>
        <KeyManager/>
        <UtopiaLand />
        </>
      ) : (
        <MainMenu onSelectLevel={setSelectedLevel} />
      )}
    </RPGProvider>
  );
}





export default RPG;



const levels = [
  { id: 1, name: '👨🏻‍🎓 Tutoriel' },
  { id: 3, name: '🕸️ Un peu de parcours' },
  { id: 4, name: '🌲 Le niveau de Rodolphe' },
  { id: 5, name: '🔥 Donjon nazouille' },
  { id: 6, name: '🔥pour le debug' }
];

const MainMenu = ({ onSelectLevel }) => {
  const [openEditor, setOpenEditor] = useState(false);
  return (
    <Box
      sx={{
        height: '100vh',
        background: 'radial-gradient(circle at center, #1e1e1e, #000)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontFamily: 'Georgia, serif',
        gap: 4
      }}
    >
      <Typography variant="h2" sx={{ fontWeight: 'bold', color: '#f0e68c' }}>
        🛡️ Utopia Quest
      </Typography>

      <Typography variant="h5" sx={{ fontStyle: 'italic', mb: 4 }}>
        Choisis ton destin, aventurier...
      </Typography>

      <Box gap={2}>
        {levels.map((level) => (
          <Button
            key={level.id}
            onClick={() => onSelectLevel(level.id)}
            variant="contained"
            sx={{ m:2,
              backgroundColor: '#6b4226',
              color: '#fff',
              width: 350,
              fontSize: '1.4rem',
              '&:hover': {
                backgroundColor: '#8b5e3c'
              }
            }}
          >
            {level.name}
          </Button>
        ))}
      </Box>

      <Typography variant="h5" sx={{ fontStyle: 'italic', mb: 4 }}>
       Construis ton propre niveau
      </Typography>
<Button variant="contained" onClick={()=>{setOpenEditor(true)}}
            sx={{
              backgroundColor: '#6b4226',
              color: '#ff0',
              width: 350,
              fontSize: '1.4rem',
              '&:hover': {
                backgroundColor: '#8b5e3c'
              }
            }}
          >
            Editeur de niveau
          </Button>
      <NiveauBuilderDialog open={openEditor} handleClose={()=>{setOpenEditor(false)}}/>
    </Box>
  );
};

