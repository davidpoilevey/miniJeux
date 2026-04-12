import React from 'react';
import { Box, Typography } from '@mui/material';
import { TACTICS } from './engine/tactics';
import { OPP_STYLES } from './data/oppStyles';

const fmt = n => String(n).padStart(2, '0');

export default function Scoreboard({ score, time, tactic, oppStyleKey }) {
  const oppStyle = OPP_STYLES[oppStyleKey];

  return (
    <Box sx={{ display: 'flex', gap: 5, alignItems: 'center' }}>

      {/* Player team */}
      <Box sx={{ textAlign: 'right', minWidth: 100 }}>
        <Typography variant="h3" sx={{ color: '#4488ff', fontWeight: 'bold', lineHeight: 1 }}>
          {score[0]}
        </Typography>
        <Typography variant="caption" sx={{ color: '#5588cc', textTransform: 'uppercase', letterSpacing: 1 }}>
          {TACTICS[tactic]?.label ?? '—'}
        </Typography>
      </Box>

      {/* Clock */}
      <Typography variant="h5" sx={{ color: 'white', fontFamily: 'monospace', minWidth: 50, textAlign: 'center' }}>
        {fmt(time)}′
      </Typography>

      {/* Opponent */}
      <Box sx={{ textAlign: 'left', minWidth: 100 }}>
        <Typography variant="h3" sx={{ color: '#ff4444', fontWeight: 'bold', lineHeight: 1 }}>
          {score[1]}
        </Typography>
        {oppStyle && (
          <Typography variant="caption" sx={{ color: '#cc5555', textTransform: 'uppercase', letterSpacing: 1 }}>
            {oppStyle.emoji} {oppStyle.label}
          </Typography>
        )}
      </Box>

    </Box>
  );
}
