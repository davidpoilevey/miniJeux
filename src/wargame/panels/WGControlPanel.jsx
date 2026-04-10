import { Box, Button, Chip, Paper, Typography } from "@mui/material";
import { useWG } from "../WarGameContext";

export const WGControlPanel = () => {
  const { turn, phase, endTurn, userUnits, advUnits, reset } = useWG();

  return (
    <Paper sx={{ padding: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>Contrôle</Typography>

      <Box sx={{ mb: 2 }}>
        <Typography variant="body1" sx={{ mb: 1 }}>Tour {turn}</Typography>
        <Chip
          label={
            phase === 'PLAYER_TURN' ? 'Votre tour' :
            phase === 'ENEMY_TURN'  ? 'Tour ennemi…' :
            phase === 'VICTORY'     ? 'Victoire !' :
                                      'Défaite…'
          }
          color={
            phase === 'PLAYER_TURN' ? 'success' :
            phase === 'VICTORY'     ? 'success' : 'error'
          }
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="body2">Vos unités : {userUnits.length}</Typography>
        <Typography variant="body2">Ennemis : {advUnits.length}</Typography>
      </Box>

      {phase === 'PLAYER_TURN' && (
        <Button variant="contained" color="warning" onClick={endTurn} fullWidth>
          Fin de tour
        </Button>
      )}

      {(phase === 'VICTORY' || phase === 'DEFEAT') && (
        <Button variant="contained" color="primary" onClick={reset} fullWidth sx={{ mt: 2 }}>
          Nouvelle partie
        </Button>
      )}
    </Paper>
  );
};
