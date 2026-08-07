import React, { useState } from 'react';
import { Box, Typography, TextField, Slider, Button, Stack, Paper } from '@mui/material';
import { AXES } from './data/axes';
import { usePolitiqueDispatch } from './PolitiqueContext';

export default function AccueilPolitique() {
  const dispatch = usePolitiqueDispatch();
  const [nom, setNom] = useState('');
  const [positions, setPositions] = useState(
    Object.fromEntries(AXES.map((axe) => [axe.id, 0]))
  );

  const peutValider = nom.trim().length > 0;

  const valider = () => {
    if (!peutValider) return;
    dispatch({ type: 'CREER_PARTI_JOUEUR', payload: { nom: nom.trim(), positions } });
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>Fonder son parti</Typography>

      <TextField
        label="Nom du parti"
        fullWidth
        value={nom}
        onChange={(e) => setNom(e.target.value)}
        sx={{ mb: 4 }}
      />

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Positionnement idéologique</Typography>
        <Stack spacing={3}>
          {AXES.map((axe) => (
            <Box key={axe.id}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">{axe.gauche}</Typography>
                <Typography variant="body2" color="text.secondary">{axe.droite}</Typography>
              </Stack>
              <Slider
                value={positions[axe.id]}
                min={-100}
                max={100}
                onChange={(e, value) => setPositions((prev) => ({ ...prev, [axe.id]: value }))}
              />
            </Box>
          ))}
        </Stack>
      </Paper>

      <Button
        variant="contained"
        size="large"
        fullWidth
        sx={{ mt: 4 }}
        disabled={!peutValider}
        onClick={valider}
      >
        Entrer en campagne
      </Button>
    </Box>
  );
}
