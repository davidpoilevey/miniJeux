import React from 'react';
import { Paper, Typography, Avatar, Stack } from '@mui/material';

export default function PlayerPanel({ playerNumber, score, isActive, emoji }) {
  return (
    <Paper 
      sx={{ 
        p: 2,
        bgcolor: isActive ? 'primary.light' : 'background.paper',
        border: isActive ? 2 : 0,
        borderColor: 'primary.main',
        transition: 'all 0.3s ease'
      }}
    >
      <Stack alignItems="center" spacing={1}>
        <Avatar sx={{ 
          width: 60, 
          height: 60, 
          fontSize: '2rem',
          transform: isActive ? 'scale(1.1)' : 'scale(1)',
          transition: 'transform 0.3s ease'
        }}>
          {emoji}
        </Avatar>
        <Typography variant="h6">Joueur {playerNumber}</Typography>
        <Typography variant="h4" color="primary">
          {score}
        </Typography>
      </Stack>
    </Paper>
  );
}