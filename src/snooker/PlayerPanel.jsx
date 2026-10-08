import React from 'react';
import { Paper, Typography, Avatar, Stack } from '@mui/material';

export default function PlayerPanel({ playerNumber, score, isActive, emoji, color }) {
  return (
    <Paper
      sx={{
        p: 2,
        bgcolor: isActive ? `${color}33` : 'background.paper',
        border: `3px solid ${isActive ? color : 'transparent'}`,
        opacity: isActive ? 1 : 0.7,
        transition: 'all 0.3s ease'
      }}
    >
      <Stack alignItems="center" spacing={1}>
        <Avatar sx={{
          width: 60,
          height: 60,
          fontSize: '2rem',
          bgcolor: color,
          transform: isActive ? 'scale(1.1)' : 'scale(1)',
          transition: 'transform 0.3s ease'
        }}>
          {emoji}
        </Avatar>
        <Typography variant="h6">Joueur {playerNumber}</Typography>
        <Typography variant="h4" sx={{ color }}>
          {score}
        </Typography>
      </Stack>
    </Paper>
  );
}
