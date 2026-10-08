import React from 'react';
import { Paper, Typography, Stack, Box } from '@mui/material';
import { BALL_COLORS } from './GameCanvas';

const Swatch = ({ color }) => (
  <Box sx={{
    width: 22,
    height: 22,
    borderRadius: '50%',
    bgcolor: BALL_COLORS[color],
    border: '2px solid rgba(0,0,0,0.6)',
    boxShadow: 'inset -3px -3px 4px rgba(0,0,0,0.35)'
  }} />
);

export default function TurnBanner({ playerNumber, emoji, color, target, gameOver, lastShot }) {
  if (gameOver) {
    return (
      <Paper sx={{ p: 1.5, bgcolor: '#FFD700', textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#000' }}>
          {lastShot?.text}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 1.5, bgcolor: color, transition: 'background-color 0.3s ease' }}>
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#000' }}>
          {emoji} Joueur {playerNumber}, vise {target?.label.toUpperCase()}
        </Typography>
        <Stack direction="row" spacing={0.5}>
          {target?.colors.map(c => <Swatch key={c} color={c} />)}
        </Stack>
      </Stack>
    </Paper>
  );
}
