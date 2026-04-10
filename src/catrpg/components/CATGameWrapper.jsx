import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Stack, Paper } from '@mui/material';
import { styled } from '@mui/system';

import ezioImg from '../assets/ezio.png';
import CatRPGUI from './CatRGP';

// === BACKGROUND STYLING ===
const FullscreenWrapper = styled(Box)({
  height: '100vh',
  width: '100vw',
  backgroundImage: `url(${ezioImg})`, // Remplace avec ton image
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: `'Press Start 2P', cursive`, // Effet rétro RPG
});

const Overlay = styled(Paper)(({ theme }) => ({
  backgroundColor: 'rgba(0,0,0,0.7)',
  color: '#fff',
  padding: theme.spacing(6),
  textAlign: 'center',
  maxWidth: 500,
  borderRadius: theme.spacing(2),
}));

// === WRAPPER COMPONENT ===
const CatRPG = () => {
  const [hasSave, setHasSave] = useState(false);
  const [savedData, setSavedData] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [loadGame, setLoadGame] = useState(false);

  useEffect(() => {
    const save = localStorage.getItem('catrpg-save');
    if (save) {
      setHasSave(true);
      setSavedData(JSON.parse(save));
    }
  }, []);

  const handleSave = (data) => {
    try {
      localStorage.setItem('catrpg-save', JSON.stringify(data));
      console.log("💾 Sauvegarde réussie !");
    } catch (err) {
      console.error("❌ Échec de la sauvegarde :", err);
    }
  };

  const handleNewGame = () => {
    localStorage.removeItem('catrpg-save');
    setLoadGame(false);
    setGameStarted(true);
  };

  const handleLoadGame = () => {
    setLoadGame(true);
    setGameStarted(true);
  };

  if (gameStarted) {
    return (
      <CatRPGUI 
        loadGame={handleLoadGame}
        loadedData={savedData}
        onSave={handleSave}
      />
    );
  }

  return (
    <FullscreenWrapper>
      <Overlay elevation={6}>
        <Typography variant="h3" gutterBottom>
          🐾 Ezio Trip Reloaded 🐾
        </Typography>
        <Typography variant="h6" gutterBottom>
          Le destin félin t'appelle...
        </Typography>

        <Stack spacing={2} mt={4}>
          <Button variant="contained" color="primary" onClick={handleNewGame}>
            Nouvelle Partie
          </Button>
          {hasSave && (
            <Button variant="contained" color="secondary" onClick={handleLoadGame}>
              Charger Partie
            </Button>
          )}
        </Stack>
      </Overlay>
    </FullscreenWrapper>
  );
};


export default CatRPG;
