import React from 'react';
import {
  Box, Typography, Paper, Button, LinearProgress, Grid, Divider, Tooltip, Stack, Chip, Card, CardContent, CardActions
} from '@mui/material';
import { useCivContext } from './CivContext';
import { TECHNOLOGIES } from './data/techTree';
import { ButtonCiv, PaperCiv, paperPropsCiv, TypoCiv } from './utils/civUI';

const CivRecherche = () => {
  const {
    techsUnlocked,
    currentResearch,
    setCurrentResearch,
    researchProgress,
  } = useCivContext();

  const availableTechs = Object.values(TECHNOLOGIES)
    .filter(tech =>
      !techsUnlocked.includes(tech.id) &&
      tech.requires.every(req => techsUnlocked.includes(req))
    );

  const researching = currentResearch && TECHNOLOGIES[currentResearch];

  return (
  <Grid container spacing={4} {...paperPropsCiv}>
  {/* Bloc principal : recherche en cours + disponibles */}
  <Grid item xs={12} md={8}>
    {/* Recherche en cours */}
    <PaperCiv sx={{ p: 3, mb: 4 }}>
      {researching ? (
        <>
          <TypoCiv variant="h6">🔍 En cours : {researching.name}</TypoCiv>
          <TypoCiv variant="body2">{researching.description}</TypoCiv>
          <LinearProgress
            variant="determinate"
            value={(researchProgress / researching.cost) * 100}
            sx={{ mt: 2, height: 10 }}
            color="secondary"
          />
          <TypoCiv variant="caption">
            {researchProgress} / {researching.cost} points
          </TypoCiv>
        </>
      ) : (
        <TypoCiv color="warning.main">⚠️ Aucune recherche en cours</TypoCiv>
      )}
    </PaperCiv>

    {/* Technologies disponibles */}
    <TypoCiv variant="h6" gutterBottom>🧪 Choisissez une technologie</TypoCiv>
    <Grid container spacing={2}>
      {availableTechs.map(tech => (
        <Grid item xs={12} sm={6} key={tech.id}>
          <Card variant="outlined" sx={paperPropsCiv.sx}>
            <CardContent>
              <Typography variant="subtitle1">{tech.name}</Typography>
              <Typography variant="body2" color="text.secondary">{tech.description}</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="caption">⏳ Coût : {tech.cost}</Typography>

              {/* Effets débloqués */}
              {tech.unlocks && (
                <Box mt={1}>
                  {tech.unlocks.units && (
                    <TypoCiv variant="body2" sx={{ mt: 1 }}>
                      🪖 Unités : {tech.unlocks.units.map(u => <Chip size="small" key={u} label={u} sx={{ mr: 0.5 }} />)}
                    </TypoCiv>
                  )}
                  {tech.unlocks.buildings && (
                    <TypoCiv variant="body2" sx={{ mt: 1 }}>
                      🏗️ Bâtiments : {tech.unlocks.buildings.map(b => <Chip size="small" key={b} label={b} sx={{ mr: 0.5 }} />)}
                    </TypoCiv>
                  )}
                </Box>
              )}

              {/* Prérequis */}
              {tech.requires.length > 0 && (
                <TypoCiv variant="body2" sx={{ mt: 1 }}>
                  🔗 Requiert : {tech.requires.map(req => (
                    <Chip size="small" key={req} label={TECHNOLOGIES[req]?.name || req} variant="outlined" sx={{ mr: 0.5 }} />
                  ))}
                </TypoCiv>
              )}
            </CardContent>
            <CardActions>
              <ButtonCiv
                fullWidth
                variant="contained"
                color="primary"
                size="small"
                disabled={!!currentResearch}
                onClick={() => setCurrentResearch(tech.id)}
              >
                Rechercher
              </ButtonCiv>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  </Grid>

  {/* Colonne droite : techs acquises */}
  <Grid item xs={12} md={4}>
    <PaperCiv sx={{ p: 2, height: '100%', overflowY: 'auto' }}>
      <TypoCiv variant="h6" gutterBottom>📚 Technologies acquises</TypoCiv>
      <Stack spacing={1}>
        {techsUnlocked.map(techId => (
          <Chip
            key={techId}
            label={TECHNOLOGIES[techId]?.name}
            
            variant="filled"
          />
        ))}
      </Stack>
    </PaperCiv>
  </Grid>
</Grid>

  );
};

export default CivRecherche;
