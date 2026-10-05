import React from 'react';
import { Box, Button, Drawer, Slider, Typography } from '@mui/material';
import { DEFAULT_PARAMS, PARAM_GROUPS } from '../engine/params';

// Réglages à chaud : les sliders écrivent directement dans soupe.params.
export default function Reglages({ ouvert, onFermer, params, onChange }) {
  return (
    <Drawer anchor="right" open={ouvert} onClose={onFermer} PaperProps={{ sx: { width: { xs: '100%', sm: 340 }, p: 2, bgcolor: '#0b1118' } }}>
      <Typography sx={{ fontWeight: 800, fontSize: 18, color: 'primary.main' }}>Réglages de la gélose</Typography>
      <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 1 }}>Appliqués en direct, sans tuer la population.</Typography>
      {PARAM_GROUPS.map((g) => (
        <Box key={g.titre} sx={{ mt: 2 }}>
          <Typography sx={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'text.secondary' }}>{g.titre}</Typography>
          {g.params.map(([cle, label, min, max, pas]) => (
            <Box key={cle} sx={{ px: 0.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: 12 }}>{label}</Typography>
                <Typography sx={{ fontSize: 12, color: params[cle] === DEFAULT_PARAMS[cle] ? 'text.secondary' : 'primary.main' }}>
                  {+params[cle].toFixed(5)}
                </Typography>
              </Box>
              <Slider size="small" min={min} max={max} step={pas} value={params[cle]} onChange={(_, v) => onChange(cle, v)} />
            </Box>
          ))}
        </Box>
      ))}
      <Button sx={{ mt: 2 }} variant="outlined" onClick={() => PARAM_GROUPS.forEach((g) => g.params.forEach(([cle]) => onChange(cle, DEFAULT_PARAMS[cle])))}>
        Valeurs par défaut
      </Button>
    </Drawer>
  );
}
