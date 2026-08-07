import React from 'react';
import {
  Box, Typography, Paper, Stack, LinearProgress, Alert,
  Card, CardActionArea, CardContent, Chip, Button, Divider,
  Accordion, AccordionSummary, AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ACTIONS } from './data/actions';
import { MEDIAS } from './data/medias';
import { TUNING } from './data/tuning';
import { calculerSondage, impactEvenement } from './moteur';
import { estVeilleElection } from './echeances';
import { usePolitiqueState, usePolitiqueDispatch } from './PolitiqueContext';
import CalendrierSidebar from './CalendrierSidebar';
import PartiPanel from './PartiPanel';

export default function EcranJeu() {
  const { tour, partis, evenementCourant, actionsChoisies, loisCourantes, votesLois, journal, champPolitique } = usePolitiqueState();
  const dispatch = usePolitiqueDispatch();
  const joueur = partis.find((p) => p.estJoueur);
  const sondage = calculerSondage(partis, evenementCourant);
  const veilleElection = estVeilleElection(tour);
  const actionsDisponibles = ACTIONS.filter((act) => !act.disponibleAvantElection || veilleElection);

  const definitionsChoisies = actionsChoisies
    .map((c) => ({ ...c, def: ACTIONS.find((a) => a.id === c.actionId) }));
  const resteTresorerie = joueur.tresorerie - definitionsChoisies.reduce((s, c) => s + (c.def.cout.tresorerie || 0), 0);
  const actionsMax = Math.min(TUNING.actionsParTour + (joueur.actionsBonus || 0), TUNING.actionsMaxParTour);
  const capAtteint = actionsChoisies.length >= actionsMax;
  const equipeAuPlafond = actionsMax >= TUNING.actionsMaxParTour;
  const cibleManquante = definitionsChoisies.some((c) => c.def.cible !== 'aucune' && !c.cibleId);
  const voteManquant = loisCourantes.some((loi) => !votesLois[loi.id]);

  // cibles valides pour une action donnée (médias, ou partis adverses —
  // filtrés sur "a une casserole non exposée" pour la dénonciation)
  const ciblesPour = (act) => {
    if (act.cible === 'media') return MEDIAS;
    if (act.cible === 'parti') {
      return partis
        .filter((p) => !p.estJoueur)
        .filter((p) => !act.requiertCasseroleCible || p.casseroles.some((c) => !c.exposee));
    }
    return [];
  };

  const actionsLegales = actionsDisponibles.filter((act) => !act.illegale);
  const actionsIllegales = actionsDisponibles.filter((act) => act.illegale);

  const renderAction = (act) => {
    const entreeChoisie = actionsChoisies.find((c) => c.actionId === act.id);
    const choisie = !!entreeChoisie;
    const abordable = choisie
      || ((act.cout.tresorerie || 0) <= resteTresorerie && (act.militantsRequis || 0) <= joueur.militants
          && (act.id !== 'renforcerEquipe' || !equipeAuPlafond));
    const desactivee = !choisie && (capAtteint || !abordable);
    const cibles = ciblesPour(act);
    return (
      <Card key={act.id} variant="outlined"
        sx={{ borderColor: choisie ? 'primary.main' : undefined, opacity: desactivee ? 0.5 : 1 }}>
        <CardActionArea
          disabled={desactivee}
          onClick={() => dispatch({ type: 'TOGGLE_ACTION', payload: { actionId: act.id } })}
        >
          <CardContent sx={{ py: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2">{act.nom}</Typography>
              <Typography variant="caption" color="text.secondary">
                {act.cout.tresorerie ? `💰${act.cout.tresorerie} ` : ''}
                {act.militantsRequis ? `👥≥${act.militantsRequis}` : ''}
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">{act.texte}</Typography>
          </CardContent>
        </CardActionArea>

        {choisie && act.cible !== 'aucune' && (
          <Box sx={{ px: 2, pb: 1.5 }}>
            <Typography variant="caption" color="text.secondary">
              {act.cible === 'media' ? 'Choisir un média :' : 'Choisir une cible :'}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mt: 0.5 }}>
              {cibles.length === 0 && (
                <Typography variant="caption" color="text.secondary">
                  Aucune cible valide pour l'instant.
                </Typography>
              )}
              {cibles.map((c) => (
                <Chip
                  key={c.id}
                  label={c.nom}
                  size="small"
                  color={entreeChoisie.cibleId === c.id ? 'primary' : 'default'}
                  onClick={() => dispatch({ type: 'DEFINIR_CIBLE', payload: { actionId: act.id, cibleId: c.id } })}
                />
              ))}
            </Stack>
          </Box>
        )}
      </Card>
    );
  };

  return (
    <Box sx={{ p: 3, display: 'flex', gap: 3, maxWidth: 1300, mx: 'auto' }}>
      <CalendrierSidebar tour={tour} partis={partis} champPolitique={champPolitique} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
      {veilleElection && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Dernier tour avant l'échéance : des actions exceptionnelles sont disponibles.
        </Alert>
      )}

      {evenementCourant && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <strong>{evenementCourant.nom}</strong> — {evenementCourant.texte}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>Lois à voter</Typography>
        <Stack spacing={1.5}>
          {loisCourantes.map((loi) => {
            const vote = votesLois[loi.id];
            return (
              <Box key={loi.id}>
                <Typography variant="subtitle2">{loi.nom}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{loi.texte}</Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant={vote === 'pour' ? 'contained' : 'outlined'}
                    onClick={() => dispatch({ type: 'VOTER_LOI', payload: { loiId: loi.id, vote: 'pour' } })}
                  >
                    Pour
                  </Button>
                  <Button
                    size="small"
                    variant={vote === 'contre' ? 'contained' : 'outlined'}
                    color="secondary"
                    onClick={() => dispatch({ type: 'VOTER_LOI', payload: { loiId: loi.id, vote: 'contre' } })}
                  >
                    Contre
                  </Button>
                </Stack>
              </Box>
            );
          })}
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>Sondage</Typography>
        <Stack spacing={1.5}>
          {partis.map((parti) => {
            const impact = Math.round(impactEvenement(parti, evenementCourant));
            return (
              <Box key={parti.id}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" fontWeight={parti.estJoueur ? 'bold' : 'normal'}>
                    {parti.nom}
                    {impact !== 0 && (
                      <Typography component="span" variant="caption"
                        sx={{ ml: 1, color: impact > 0 ? 'success.main' : 'error.main' }}>
                        ({impact > 0 ? '+' : ''}{impact} événement)
                      </Typography>
                    )}
                  </Typography>
                  <Typography variant="body2">{sondage[parti.id]}%</Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={sondage[parti.id]}
                  sx={{ height: 8, borderRadius: 1, bgcolor: 'action.hover',
                    '& .MuiLinearProgress-bar': { bgcolor: parti.couleur || 'primary.main' } }}
                />
              </Box>
            );
          })}
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Actions ({actionsChoisies.length}/{actionsMax})
        </Typography>

        <Accordion defaultExpanded disableGutters>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Actions légales ({actionsLegales.length})</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={1}>{actionsLegales.map(renderAction)}</Stack>
          </AccordionDetails>
        </Accordion>

        <Accordion disableGutters>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" color="error.main">
              Coups tordus — illégal ({actionsIllegales.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={1}>{actionsIllegales.map(renderAction)}</Stack>
          </AccordionDetails>
        </Accordion>
      </Paper>

      <Button variant="contained" size="large" fullWidth disabled={cibleManquante || voteManquant}
        onClick={() => dispatch({ type: 'VALIDER_TOUR' })}>
        Valider le tour
      </Button>

      {journal.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
          <Typography variant="h6" gutterBottom>Journal</Typography>
          <Divider sx={{ mb: 1 }} />
          <Stack spacing={0.5}>
            {journal.slice(-10).reverse().map((ligne, i) => (
              <Typography key={i} variant="body2" color="text.secondary">{ligne}</Typography>
            ))}
          </Stack>
        </Paper>
      )}
      </Box>
      <PartiPanel parti={joueur} />
    </Box>
  );
}
