import React from 'react';
import { Paper, Typography, Stack, Chip, Alert } from '@mui/material';

export default function GameInfo({ redsRemaining, lastShot, activePowerUp }) {
  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="body1">
          <strong>Rouges restantes :</strong> {redsRemaining}
        </Typography>

        {/* Résumé du dernier coup */}
        {lastShot && (
          <Alert severity={lastShot.severity} sx={{ py: 0.5 }}>
            <Typography variant="body2">{lastShot.text}</Typography>
          </Alert>
        )}

        {/* Power-up actif */}
        {activePowerUp && (
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Power-up actif :
            </Typography>
            <Chip
              label={`${activePowerUp.emoji} ${activePowerUp.name}`}
              size="small"
              sx={{
                bgcolor: activePowerUp.color,
                color: '#fff',
                fontWeight: 'bold'
              }}
            />
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}
