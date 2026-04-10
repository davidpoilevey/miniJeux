import { Box, Typography, Tooltip } from '@mui/material';
import { useMono } from './MonoContext';

const PropertyBadge = ({ caseInfo, calculerLoyer }) => {
  const loyer = calculerLoyer(caseInfo.id);
  
  return (
    <Tooltip 
      title={
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
            {caseInfo.name}
          </Typography>
          <Typography variant="caption" display="block">
            Loyer: {loyer.toLocaleString()}€
          </Typography>
        </Box>
      }
      arrow
    >
      <Box
        sx={{
          width: 16,
          height: 16,
          borderRadius: '50%',
          backgroundColor: caseInfo.colorGroup || 'gray',
          border: '1px solid #333',
          cursor: 'pointer',
          display: 'inline-block'
        }}
      />
    </Tooltip>
  );
};

export const PlayerInfo = () => {
  const { joueurs, currentJoueur, board, calculerLoyer } = useMono();
  
  return (
    <Box sx={{ 
      position: 'fixed', 
      top: 100, 
      right: 200, 
      backgroundColor: 'rgba(255,255,255,0.95)',
      padding: 2,
      borderRadius: 2,
      boxShadow: 3,
      minWidth: 250
    }}>
      {joueurs.map((j, idx) => {
        // Récupérer les propriétés du joueur
        const proprietes = j.proprietes.map(propId => 
          board.flat().find(c => c.id === propId)
        ).filter(Boolean);

        return (
          <Box 
            key={j.id} 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: 0.5,
              padding: 1,
              marginBottom: 1,
              backgroundColor: idx === currentJoueur ? 'rgba(0,255,0,0.1)' : 'transparent',
              borderRadius: 1,
              border: idx === currentJoueur ? '2px solid #4caf50' : 'none'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box 
                sx={{ 
                  width: 24, 
                  height: 24, 
                  borderRadius: '50%', 
                  backgroundColor: j.color,
                  border: '2px solid #333'
                }} 
              />
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: idx === currentJoueur ? 'bold' : 'normal',
                  flex: 1
                }}
              >
                {j.name}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 'bold',
                  color: j.argent < 0 ? 'error.main' : 'success.main'
                }}
              >
                {j.argent.toLocaleString()}€
              </Typography>
            </Box>
            
            {/* Affichage des propriétés */}
            {proprietes.length > 0 && (
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 0.5, 
                marginLeft: 4,
                marginTop: 0.5
              }}>
                {proprietes.map(prop => (
                  <PropertyBadge 
                    key={prop.id} 
                    caseInfo={prop} 
                    calculerLoyer={calculerLoyer}
                  />
                ))}
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
};