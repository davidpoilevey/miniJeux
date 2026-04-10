import { Box, Button, Dialog, DialogContent, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { AI_PROFILES } from "./AIProfiles";

const ShuffleGameOver = ({setGameState,setSelectedAI, setLockedAI,lockedAI, gameState, winner, scores, resetGame})=>{
 const [unlockedPerso, setUnlocked] = useState();
  useEffect(()=>{
    if(gameState === 'gameOver' && winner === 'player'){
      const unlocked = lockedAI.shift();
      setLockedAI([...lockedAI])
      setUnlocked(unlocked);
    }
  },[winner]);
    return  <Dialog 
        open={gameState === 'gameOver'} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { 
            bgcolor: '#0d0d0d',
            border: '4px solid #00ffff',
            boxShadow: '0 0 50px rgba(0,255,255,0.5)'
          }
        }}
      >
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography 
              variant="h3" 
              sx={{ 
                mb: 3,
                color: winner === 'player' ? '#00ff00' : '#ff3333',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                textShadow: winner === 'player' 
                  ? '0 0 20px #00ff00' 
                  : '0 0 20px #ff3333'
              }}
            >
              {winner === 'player' ? '🏆 VICTORY! 🏆' : '💀 DEFEAT 💀'}
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, color: 'white', fontFamily: 'monospace' }}>
              {scores.ai} - {scores.player}
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, color: '#aaa' }}>
              {winner === 'player' 
                ? "Tu as écrasé le robot ! Champion !"
                : "Le robot t'a détruit... Revanche ?"}
            </Typography>
            {winner === 'player'&&unlockedPerso!=null&&<Box>
               <Typography variant="body1" sx={{ mb: 4, color: '#caadad' }}>
                Tu as debloqué un nouveau personnage
               </Typography>
                <Typography variant="body1" sx={{ mb: 4, color: '#caadad' }}>
                {AI_PROFILES[unlockedPerso].name}
               </Typography>
                 <Button 
                variant="contained"
                onClick={() => {
                  resetGame();
                  setSelectedAI(unlockedPerso);
                  setGameState('playing');
                }}
                sx={{ 
                  bgcolor: '#ff00ff',
                  color: 'white',
                  fontFamily: 'monospace',
                  fontSize: '1.1rem',
                  px: 3,
                  '&:hover': { bgcolor: '#cc00cc' }
                }}
              >
                ▶ L'AFFRONTER DIRECTEMENT
              </Button>
              </Box>}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button 
                variant="contained"
                onClick={() => {
                  resetGame();
                  setGameState('playing');
                }}
                sx={{ 
                  bgcolor: '#ff00ff',
                  color: 'white',
                  fontFamily: 'monospace',
                  fontSize: '1.1rem',
                  px: 3,
                  '&:hover': { bgcolor: '#cc00cc' }
                }}
              >
                ▶ REPLAY
              </Button>
              <Button 
                variant="outlined"
                onClick={() => setGameState('menu')}
                sx={{ 
                  color: '#00ffff',
                  borderColor: '#00ffff',
                  fontFamily: 'monospace',
                  fontSize: '1.1rem',
                  px: 3
                }}
              >
                ◀ MENU
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
}

export default ShuffleGameOver;