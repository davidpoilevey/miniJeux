import React from 'react';
import { Box, Drawer, Slider, Typography } from '@mui/material';
import { PARAM_GROUPS } from '../engine/params';

// Tous les boutons, appliqués à chaud dans evolution.params (certains à la génération suivante)
export default function Reglages({ ouvert, onFermer, params, onChange }) {
  return (
    <Drawer anchor="right" open={ouvert} onClose={onFermer} PaperProps={{ sx: { width: 320, p: 2.5 } }}>
      {PARAM_GROUPS.map((g) => (
        <Box key={g.titre} sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'text.secondary', mb: 1 }}>{g.titre}</Typography>
          {g.params.map(([cle, label, min, max, pas, aide]) => (
            <Box key={cle} sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: 12 }}>{label}</Typography>
                <Typography sx={{ fontSize: 12, color: 'primary.main' }}>{params[cle]}</Typography>
              </Box>
              <Slider size="small" min={min} max={max} step={pas} value={params[cle]} onChange={(_, v) => onChange(cle, v)} />
              <Typography sx={{ fontSize: 10.5, color: 'text.secondary', mt: -0.5 }}>{aide}</Typography>
            </Box>
          ))}
        </Box>
      ))}
    </Drawer>
  );
}
