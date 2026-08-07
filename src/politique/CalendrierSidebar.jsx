import React from 'react';
import { Box, Typography, Paper, Stack, Chip } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { CALENDRIER } from './data/calendrier';
import { nomEcheance } from './echeances';

export default function CalendrierSidebar({ tour, partis, champPolitique }) {
  return (
    <Box sx={{ width: 240, flexShrink: 0 }}>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>Tour {tour}</Typography>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Calendrier électoral</Typography>
        <Stack spacing={1}>
          {CALENDRIER.map((e) => {
            const passee = e.tour < tour;
            const active = e.tour === tour;
            return (
              <Stack key={e.tour} direction="row" spacing={1} alignItems="center"
                sx={{ opacity: passee ? 0.4 : 1 }}>
                <Chip
                  label={`T${e.tour}`}
                  size="small"
                  color={active ? 'primary' : 'default'}
                  variant={active ? 'filled' : 'outlined'}
                />
                <Typography variant="body2">{nomEcheance(e.type)}</Typography>
              </Stack>
            );
          })}
        </Stack>
      </Paper>

      {champPolitique && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Champ politique
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {nomEcheance(champPolitique.type)} — tour {champPolitique.tour}
          </Typography>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={partis.map((p) => ({ name: p.nom, value: champPolitique.resultats[p.id] || 0, couleur: p.couleur }))}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius="85%"
                label={(entry) => (entry.value >= 3 ? `${entry.value}%` : '')}
              >
                {partis.map((p) => (
                  <Cell key={p.id} fill={p.couleur || '#999'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
            {partis.map((p) => (
              <Stack key={p.id} direction="row" spacing={0.5} alignItems="center">
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: p.couleur || '#999' }} />
                <Typography variant="caption" color="text.secondary">{p.nom}</Typography>
              </Stack>
            ))}
          </Stack>
        </Paper>
      )}
    </Box>
  );
}
