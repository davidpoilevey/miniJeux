import React from 'react';
import { Box, Typography, Paper, LinearProgress, Chip } from '@mui/material';
import { BOMB_TYPES } from '../config/levels';

const ScorePanel = ({ player, levelInfo, gameState }) => {
  
  const getBombIcon = (type) => {
    const icons = {
      grenade: '🎾',
      dynamite: '🧨',
      c4: '📦'
    };
    return icons[type] || '💣';
  };

  const getBombName = (type) => {
    return BOMB_TYPES[type.toUpperCase()]?.name || 'Bombe';
  };

  return (
    <Paper 
      elevation={4}
      sx={{
        width: 280,
        bgcolor: 'rgba(26, 26, 26, 0.95)',
        padding: 3,
        borderRadius: 2,
        border: '2px solid #ff6600',
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5
      }}
    >
      {/* Titre du niveau */}
      <Box sx={{ textAlign: 'center', borderBottom: '2px solid #ff6600', pb: 1.5 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            color: '#ff6600',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            fontSize: '1.2rem'
          }}
        >
          NIVEAU {levelInfo.level}
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#ccc',
            fontFamily: 'monospace',
            fontStyle: 'italic',
            mt: 0.5
          }}
        >
          {levelInfo.title}
        </Typography>
      </Box>

      {/* Vies */}
      <Box>
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#aaa',
            fontFamily: 'monospace',
            mb: 0.5
          }}
        >
          VIES
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {[...Array(Math.max(player.lives, 0))].map((_, i) => (
            <Box key={i} sx={{ fontSize: '1.5rem' }}>❤️</Box>
          ))}
          {player.lives === 0 && (
            <Typography sx={{ color: '#ff3333', fontFamily: 'monospace' }}>
              GAME OVER
            </Typography>
          )}
        </Box>
      </Box>

      {/* Score */}
      <Box>
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#aaa',
            fontFamily: 'monospace',
            mb: 0.5
          }}
        >
          SCORE
        </Typography>
        <Typography 
          variant="h4" 
          sx={{ 
            color: '#ffcc00',
            fontFamily: 'monospace',
            fontWeight: 'bold'
          }}
        >
          {player.score}
        </Typography>
      </Box>

      {/* Type de bombe actuel */}
      <Box>
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#aaa',
            fontFamily: 'monospace',
            mb: 1
          }}
        >
          BOMBE ACTUELLE
        </Typography>
        <Chip
          icon={<span style={{ fontSize: '1.5rem' }}>{getBombIcon(player.currentBombType)}</span>}
          label={getBombName(player.currentBombType)}
          sx={{
            bgcolor: '#ff6600',
            color: '#fff',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            fontSize: '0.9rem'
          }}
        />
      </Box>

      {/* Stats */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {/* Bombes max */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" sx={{ color: '#aaa', fontFamily: 'monospace' }}>
              BOMBES
            </Typography>
            <Typography variant="body2" sx={{ color: '#fff', fontFamily: 'monospace', fontWeight: 'bold' }}>
              {player.maxBombs}
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={(player.maxBombs / 8) * 100} 
            sx={{
              height: 8,
              borderRadius: 1,
              bgcolor: '#333',
              '& .MuiLinearProgress-bar': {
                bgcolor: '#ff6600'
              }
            }}
          />
        </Box>

        {/* Portée du feu */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" sx={{ color: '#aaa', fontFamily: 'monospace' }}>
              PORTÉE 🔥
            </Typography>
            <Typography variant="body2" sx={{ color: '#fff', fontFamily: 'monospace', fontWeight: 'bold' }}>
              {player.fireRange}
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={(player.fireRange / 10) * 100} 
            sx={{
              height: 8,
              borderRadius: 1,
              bgcolor: '#333',
              '& .MuiLinearProgress-bar': {
                bgcolor: '#ff3333'
              }
            }}
          />
        </Box>

        {/* Vitesse */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" sx={{ color: '#aaa', fontFamily: 'monospace' }}>
              VITESSE ⚡
            </Typography>
            <Typography variant="body2" sx={{ color: '#fff', fontFamily: 'monospace', fontWeight: 'bold' }}>
              {player.speed}
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={(player.speed / 3) * 100} 
            sx={{
              height: 8,
              borderRadius: 1,
              bgcolor: '#333',
              '& .MuiLinearProgress-bar': {
                bgcolor: '#ffcc00'
              }
            }}
          />
        </Box>
      </Box>

      {/* Commandes */}
      <Box sx={{ 
        mt: 1, 
        pt: 2, 
        borderTop: '1px solid #444'
      }}>
        <Typography 
          variant="caption" 
          sx={{ 
            color: '#777',
            fontFamily: 'monospace',
            display: 'block',
            mb: 0.5
          }}
        >
          COMMANDES
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            color: '#999',
            fontFamily: 'monospace',
            display: 'block',
            fontSize: '0.7rem'
          }}
        >
          ⬆️⬇️⬅️➡️ Déplacer<br/>
          ESPACE Poser bombe
        </Typography>
      </Box>
    </Paper>
  );
};

export default ScorePanel;