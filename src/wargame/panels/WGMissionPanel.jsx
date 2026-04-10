import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Grid,
  Typography,
} from "@mui/material";
import { WG_MISSIONS } from "../data/missions";
import { WG_UNITS } from "../data/units";
import { useWG } from "../WarGameContext";

const OBJECTIVE_COLOR = {
  DESTROY_ALL:     'error',
  DESTROY_CHIEF:   'warning',
  DESTROY_BASE:    'secondary',
  SURVIVE_N_TURNS: 'info',
};

// Accent colors matching the theme palette
const OBJECTIVE_ACCENT = {
  DESTROY_ALL:     '#e05252',
  DESTROY_CHIEF:   '#d4843a',
  DESTROY_BASE:    '#9b2335',
  SURVIVE_N_TURNS: '#3a86b0',
};

const stars = (n) => '★'.repeat(n) + '☆'.repeat(4 - n);

export const WGMissionPanel = () => {
  const { startMission } = useWG();

  return (
    <Box sx={{ height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

      {/* ── En-tête atmosphérique ── */}
      <Box sx={{
        px: 4, py: 3,
        background: 'linear-gradient(180deg, rgba(201,168,76,0.10) 0%, transparent 100%)',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}>
        <Typography variant="overline" sx={{ color: 'primary.light', letterSpacing: '0.2em', fontSize: '0.7rem' }}>
          Mode Campagne
        </Typography>
        <Typography variant="h4" sx={{
          textTransform: 'uppercase',
          color: 'primary.main',
          textShadow: '0 2px 12px rgba(201,168,76,0.25)',
          lineHeight: 1.1,
        }}>
          Choisissez votre mission
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Préparez vos troupes en Caserne avant de partir au combat.
        </Typography>
      </Box>

      {/* ── Grille de missions ── */}
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Grid container spacing={3}>
          {WG_MISSIONS.map((mission, idx) => {
            const accent = OBJECTIVE_ACCENT[mission.objective] ?? '#5a5040';

            const playerNames = mission.playerUnitTypes
              .map(type => WG_UNITS.find(u => u.type === type)?.name)
              .filter(Boolean);

            const enemyDesc = mission.enemyGroups.map(g => {
              const name = WG_UNITS.find(u => u.type === g.unitType)?.name ?? g.unitType;
              const label = g.isChief ? `${name} (Chef)` : g.isBase ? `${name} (Objectif)` : name;
              return `${g.count}× ${label}`;
            }).join(', ');

            return (
              <Grid item xs={12} sm={6} md={4} key={mission.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderTop: `3px solid ${accent}`,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 32px rgba(0,0,0,0.7), 0 0 0 1px ${accent}50`,
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, pb: 1 }}>

                    {/* Mission N */}
                    <Typography variant="overline" sx={{
                      color: accent,
                      letterSpacing: '0.18em',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                    }}>
                      Mission {idx + 1}
                    </Typography>

                    {/* Nom */}
                    <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', mt: 0.25 }}>
                      {mission.name}
                    </Typography>

                    {/* Description */}
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.55 }}>
                      {mission.description}
                    </Typography>

                    {/* Objectif */}
                    <Chip
                      size="small"
                      label={mission.objectiveLabel}
                      color={OBJECTIVE_COLOR[mission.objective] ?? 'default'}
                      sx={{ mb: 2, fontWeight: 700 }}
                    />

                    {/* Difficulté */}
                    <Typography variant="caption" display="block" sx={{ mb: 1, color: 'primary.main', letterSpacing: '0.04em' }}>
                      Difficulté : {stars(mission.difficulty)}
                    </Typography>

                    {/* Troupes / Ennemis */}
                    <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.4 }}>
                      <Typography variant="caption" display="block" color="text.secondary">
                        <Box component="span" sx={{ color: 'success.main', fontWeight: 700 }}>Vos troupes : </Box>
                        {playerNames.join(', ')}
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        <Box component="span" sx={{ color: 'error.main', fontWeight: 700 }}>Ennemis : </Box>
                        {enemyDesc}
                      </Typography>
                    </Box>

                  </CardContent>

                  <CardActions sx={{ px: 2, pb: 2, pt: 0.5 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={() => startMission(mission)}
                    >
                      Lancer la mission
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Box>
  );
};
