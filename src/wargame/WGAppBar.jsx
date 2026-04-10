import {
  AppBar,
  Box,
  Button,
  Chip,
  Divider,
  Toolbar,
  Typography,
} from '@mui/material';
import { useWG } from './WarGameContext';

const WGAppBar = () => {
  const {
    turn, phase, credits, currentMission,
    endTurn, reset, enterCaserne, launchMission,
    userUnits, advUnits, purchasedUnits,
  } = useWG();

  const isGameActive = phase === 'PLAYER_TURN' || phase === 'ENEMY_TURN';
  const isGameOver   = phase === 'VICTORY' || phase === 'DEFEAT';
  const isCaserne    = phase === 'CASERNE';

  const freeCount  = currentMission?.playerUnitTypes?.length ?? 0;
  const armyReady  = freeCount + purchasedUnits.length > 0;

  return (
    <AppBar position="static">
      <Toolbar sx={{ gap: 1.5 }}>

        {/* Titre */}
        <Typography
          variant="h6"
          component="div"
          sx={{
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'primary.main',
            textShadow: '0 1px 6px rgba(201,168,76,0.4)',
          }}
        >
          Wargame
        </Typography>

        {/* Séparateur */}
        {(isGameActive || isGameOver) && (
          <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(201,168,76,0.25)', mx: 0.5 }} />
        )}

        {/* Nom de la mission + état de la partie */}
        {(isGameActive || isGameOver) && (
          <>
            {currentMission && (
              <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                {currentMission.name}
              </Typography>
            )}

            <Typography variant="body2" color="text.secondary">
              Tour {turn}
            </Typography>

            <Chip
              size="small"
              label={
                phase === 'PLAYER_TURN' ? 'Votre tour' :
                phase === 'ENEMY_TURN'  ? 'Ennemis…'  :
                phase === 'VICTORY'     ? 'Victoire !' : 'Défaite…'
              }
              color={phase === 'PLAYER_TURN' || phase === 'VICTORY' ? 'success' : 'error'}
              variant="outlined"
              sx={{ borderColor: 'currentColor', fontWeight: 700 }}
            />

            <Typography variant="body2" color="text.secondary">
              {userUnits.length} <Box component="span" sx={{ color: 'success.main' }}>vs</Box> {advUnits.length}
            </Typography>
          </>
        )}

        <Box sx={{ flexGrow: 1 }} />

        {/* Crédits — toujours visible */}
        <Chip
          size="small"
          label={`💰 ${credits} cr`}
          variant="outlined"
          sx={{
            color: 'primary.main',
            borderColor: 'rgba(201,168,76,0.5)',
            fontWeight: 700,
            fontSize: '0.8rem',
          }}
        />

        {/* Partir en mission — visible uniquement en CASERNE */}
        {isCaserne && (
          <>
            <Button variant="contained" color="secondary" size="small" onClick={reset}>
              Retour aux missions
            </Button>
            <Button
              variant="contained"
              color="success"
              size="small"
              disabled={!currentMission || !armyReady}
              onClick={launchMission}
            >
              Partir en mission
            </Button>
          </>
        )}

        {/* Caserne — toujours visible */}
        <Button
          variant={isCaserne ? 'contained' : 'outlined'}
          color="inherit"
          size="small"
          onClick={enterCaserne}
        >
          Caserne
        </Button>

        {/* Fin de tour */}
        {phase === 'PLAYER_TURN' && (
          <Button variant="contained" color="warning" size="small" onClick={endTurn}>
            Fin de tour
          </Button>
        )}

        {/* Après victoire / défaite */}
        {isGameOver && (
          <Button variant="contained" color="inherit" size="small" onClick={reset}>
            Choisir une mission
          </Button>
        )}

      </Toolbar>
    </AppBar>
  );
};

export default WGAppBar;
