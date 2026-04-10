import React from 'react';
import { Paper, Typography, Stack, Chip, Alert } from '@mui/material';

export default function GameInfo({ targetText, redsRemaining, faultInfo, activePowerUp }) {
  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
          <Typography variant="body1">
            <strong>À jouer :</strong> {targetText}
          </Typography>
          <Typography variant="body1">
            <strong>Rouges restantes :</strong> {redsRemaining}
          </Typography>
        </Stack>

        {/* Affichage de la faute */}
        {faultInfo && !faultInfo.valid && (
          <Alert severity="error" sx={{ py: 0.5 }}>
            <Typography variant="body2">
              <strong>Faute !</strong> {faultInfo.message}
            </Typography>
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