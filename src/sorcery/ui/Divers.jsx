import { Box, Button, Paper, Typography } from "@mui/material";
import { ACTIONS } from "../reducer";

export const SorceryNotif=({state})=>{
    return <Paper
          elevation={5}
          sx={{
            position: 'absolute',
            top: 100,
            left: '50%',
            transform: 'translateX(-50%)',
            px: 4,
            py: 2,
            backgroundColor:
              state.ui.notification.type === 'level-up'
                ? '#9b59b6'
                : state.ui.notification.type === 'error'
                ? '#e74c3c'
                : '#2ecc71',
            zIndex: 1001,
            animation: 'slideDown 0.3s ease-out'
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              textAlign: 'center'
            }}
          >
            {state.ui.notification.message}
          </Typography>
        </Paper>
}
export const SorceryGameOver=({dispatch, loadRoom, currentLevelData, loadLevel})=>{
    return <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
          }}
        >
          <Typography
            variant="h2"
            sx={{
              color: '#e74c3c',
              fontWeight: 'bold',
              mb: 2,
              textShadow: '0 0 20px #e74c3c'
            }}
          >
            💀 GAME OVER
          </Typography>
          <Typography variant="h5" sx={{ color: '#95a5a6', mb: 4 }}>
            Vous êtes tombé au combat...
          </Typography>
          <Paper
            sx={{
              px: 4,
              py: 2,
              backgroundColor: '#3498db',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: '#2980b9'
              }
            }}
            onClick={() => {
              dispatch({ type: ACTIONS.RESET_GAME });
              loadRoom(currentLevelData.startRoom);
            }}
          >
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
              🔄 Recommencer
            </Typography>
          </Paper>
<Button
  variant="contained"
  onClick={() => {
    dispatch({ type: ACTIONS.RESET_GAME });
    loadLevel('levelTuto');
  }}
  sx={{
    backgroundColor: '#e74c3c',
    color: 'white',mt:2,
    '&:hover': { backgroundColor: '#c0392b' }
  }}
>
  Nouvelle Partie
</Button>
        </Box>
}