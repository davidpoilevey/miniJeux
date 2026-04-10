import { Box, Button, Grid, Typography } from "@mui/material";
import { AI_PROFILES } from "./AIProfiles";
import { usePreloadedImages } from "../../civ/utils/hooks";
import { AiImageSources } from "./ShuffleBoard";

const ShuffleMenu=({resetGame, lockedAI, setSelectedAI, selectedAI, setGameState})=>{
   const images = usePreloadedImages(AiImageSources);
    return  <Box sx={{ 
          textAlign: 'center', 
          color: 'white',
          bgcolor: '#b5a349',
          p: 2,
          borderRadius: 2,
          border: '3px solid #00ffff',
          boxShadow: '0 0 30px rgba(0,255,255,0.3)',
          maxWidth: '600px'
        }}>
        
          <Typography variant="body1" sx={{ mb: 2, fontSize: '1.1rem' }}>
            Premier à 7 points gagne !
          </Typography>
          
          <Grid container
           sx={{ display: 'flex', gap: 2, mb: 2, justifyContent: 'center' }}>
            {Object.entries(AI_PROFILES).map(([key, profile]) => {
              return <Grid item xs={3}
                key={key}
                onClick={() => {
                  if(!lockedAI.includes(key))
                  setSelectedAI(key)}}
                sx={{
                  cursor: 'pointer',
                  p: 2,
                  border: selectedAI === key ? '3px solid #ff4400' : '2px solid #444',
                  borderRadius: 2,
                  color:'#000',
                  bgcolor: selectedAI === key ? '#dcb209' : (lockedAI.includes(key)?'#66666666':'#d57676'),
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: '#ff00ff',
                    transform: 'scale(1.05)'
                  }
                }}
              >
                 <Box
            component="img"
            src={images[profile.image]?.src}
            alt={profile.name}
            sx={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              filter:lockedAI.includes(key)?'grayscale(1)':'none',
              border: `6px solid ${lockedAI.includes(key)?'#666666':'#ff3333'}`,
              boxShadow: '0 0 40px rgba(255,51,51,0.6)',
              objectFit: 'cover',
              bgcolor: '#8d6363'
            }}
          />
                <Typography sx={{ fontFamily: 'monospace', fontWeight: 'bold', mb: 0.5 }}>
                  {profile.name}
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#860606' }}>
                  {profile.description}
                </Typography>
              </Grid>
        })}
          </Grid>
          
          <Button 
            variant="contained" 
            size="large"
            onClick={() => {
              resetGame();
              setGameState('playing');
            }}
            sx={{ 
              bgcolor: '#ff6f00',
              color: 'white',
              fontSize: '1.2rem',
              px: 4,
              py: 2,
              fontFamily: 'monospace',
              fontWeight: 'bold',
              boxShadow: '0 0 20px rgba(255,0,255,0.5)',
              '&:hover': { 
                bgcolor: '#f9b005',color:'#000',
                boxShadow: '0 0 30px rgba(255,0,255,0.8)'
              }
            }}
          >
            ▶ START GAME
          </Button>
        </Box>
}

export default ShuffleMenu;