import React from 'react';
import { Box, Typography, Paper, Stack, Divider, Chip } from '@mui/material';
import { MEDIAS } from './data/medias';

export default function PartiPanel({ parti }) {
  const mediasInfluences = MEDIAS
    .map((m) => ({ ...m, valeur: parti.mediaInfluence[m.id] || 0 }))
    .filter((m) => m.valeur !== 0);

  const casserolesExposees = parti.casseroles.filter((c) => c.exposee).length;
  const casserolesCachees = parti.casseroles.length - casserolesExposees;

  return (
    <Box sx={{ width: 240, flexShrink: 0 }}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ color: parti.couleur || undefined }}>
          {parti.nom}
        </Typography>

        <Stack spacing={0.75}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Trésorerie</Typography>
            <Typography variant="body2">💰 {parti.tresorerie}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Militants</Typography>
            <Typography variant="body2">👥 {parti.militants}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Estime</Typography>
            <Typography variant="body2">{Math.round(parti.estime)}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Démagogie</Typography>
            <Typography variant="body2">🎭 {Math.round(parti.demagogie)}</Typography>
          </Stack>
        </Stack>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" gutterBottom>Influence médias</Typography>
        {mediasInfluences.length === 0 ? (
          <Typography variant="caption" color="text.secondary">Aucune pour l'instant.</Typography>
        ) : (
          <Stack spacing={0.5}>
            {mediasInfluences.map((m) => (
              <Stack key={m.id} direction="row" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">{m.nom}</Typography>
                <Typography variant="caption">{m.valeur > 0 ? '+' : ''}{Math.round(m.valeur)}</Typography>
              </Stack>
            ))}
          </Stack>
        )}

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" gutterBottom>Casseroles</Typography>
        <Stack direction="row" spacing={1}>
          <Chip size="small" label={`${casserolesCachees} cachée(s)`} />
          {casserolesExposees > 0 && (
            <Chip size="small" color="error" label={`${casserolesExposees} exposée(s)`} />
          )}
          {parti.casseroles.length === 0 && (
            <Typography variant="caption" color="text.secondary">Aucune.</Typography>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
