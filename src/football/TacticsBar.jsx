import React from 'react';
import { Box, Chip } from '@mui/material';
import { TACTICS } from './engine/tactics';
import { CW } from './engine/constants';

export default function TacticsBar({ tactic }) {
  return (
    <Box sx={{ display: 'flex', gap: 0.7, flexWrap: 'wrap', justifyContent: 'center', maxWidth: CW }}>
      {Object.entries(TACTICS).map(([tid, t]) => (
        <Chip
          key={tid}
          size="small"
          label={`[${t.key.toUpperCase()}] ${t.label}`}
          variant={tactic === tid ? 'filled' : 'outlined'}
          sx={{
            fontSize: '0.62rem',
            color:   tactic === tid ? '#000' : '#999',
            bgcolor: tactic === tid ? 'gold' : 'transparent',
            borderColor: tactic === tid ? 'gold' : '#383850',
            cursor: 'default',
            '&:hover': { bgcolor: tactic === tid ? 'gold' : 'rgba(255,255,255,0.05)' },
          }}
        />
      ))}
      <Chip
        size="small"
        label="[S] Substitution"
        variant="outlined"
        sx={{ fontSize: '0.62rem', color: '#999', borderColor: '#383850' }}
      />
    </Box>
  );
}
