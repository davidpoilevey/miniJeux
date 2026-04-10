import React from 'react';
import { Box } from '@mui/material';
import { CELL_TYPES } from '../config/levels';
import nico from '../config/nico.png';

const Cell = ({ cell, size = 40, hasBomb, hasExplosion, hasPlayer,hasExit, hasEnemy, hasPowerUp, powerUpType }) => {
  
  const getCellStyle = () => {
    const baseStyle = {
      width: size,
      height: size,
      border: '1px solid #333',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.2rem'
    };

    // Explosion
    if (hasExplosion) {
      return {
        ...baseStyle,
        bgcolor: '#ff6600',
        boxShadow: '0 0 20px #ff6600, inset 0 0 20px #ffaa00',
        animation: 'explosion 0.5s ease-out'
      };
    }

    // Types de cellules
    switch (cell.type) {
      case CELL_TYPES.WALL:
        return {
          ...baseStyle,
          bgcolor: '#2a2a2a',
          backgroundImage: 'linear-gradient(45deg, #333 25%, transparent 25%, transparent 75%, #333 75%, #333), linear-gradient(45deg, #333 25%, transparent 25%, transparent 75%, #333 75%, #333)',
          backgroundSize: '10px 10px',
          backgroundPosition: '0 0, 5px 5px'
        };
      
      case CELL_TYPES.DESTRUCTIBLE:
        return {
          ...baseStyle,
          bgcolor: '#8B4513',
          backgroundImage: 'linear-gradient(90deg, transparent 40%, rgba(139, 69, 19, 0.5) 40%, rgba(139, 69, 19, 0.5) 60%, transparent 60%)',
          border: '1px solid #654321'
        };
      
      case CELL_TYPES.EMPTY:
      default:
        return {
          ...baseStyle,
          bgcolor: '#1a4d1a'
        };
    }
  };

  const getPowerUpIcon = (type) => {
    const icons = {
      bomb_plus: '💣+',
      fire_plus: '🔥+',
      speed_plus: '⚡',
      life_plus: '❤️',
      grenade: '🎾',
      dynamite: '🧨',
      c4: '📦'
    };
    return icons[type] || '✨';
  };

  return (
    <Box sx={getCellStyle()}>
      {/* Power-up */}
      {hasPowerUp && !hasExplosion && (
        <Box sx={{
          position: 'absolute',
          fontSize: '1.5rem',
          animation: 'float 2s ease-in-out infinite',
          zIndex: 1
        }}>
          {getPowerUpIcon(powerUpType)}
        </Box>
      )}
      
      {/* Bombe */}
      {hasBomb && !hasExplosion && (
        <Box sx={{
          position: 'absolute',
          fontSize: '1.8rem',
          animation: 'pulse 0.5s ease-in-out infinite',
          zIndex: 2
        }}>
          💣
        </Box>
      )}
      
      {/* Joueur */}
      {hasPlayer && !hasExplosion && (
        <Box sx={{
          position: 'absolute',
          fontSize: '2rem',
          height:size,width:size,
          background:`url(${nico})`,
          backgroundSize:'contain',
          backgroundPosition:'center',
          backgroundRepeat:'no-repeat',
          zIndex: 3,
          filter: 'drop-shadow(0 0 3px #fff)'
        }}>
        </Box>
      )}
      {/* Sortie */}
{hasExit && !hasExplosion && (
  <Box sx={{
    position: 'absolute',
    fontSize: '2rem',
    animation: 'float 1.5s ease-in-out infinite',
    zIndex: 1,
    filter: 'drop-shadow(0 0 10px #00ff00)'
  }}>
    🚪
  </Box>
)}
      {/* Ennemi */}
      {hasEnemy && !hasExplosion && (
        <Box sx={{
          position: 'absolute',
          fontSize: '2rem',
          zIndex: 3
        }}>
          👾
        </Box>
      )}

      {/* Styles CSS pour les animations */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
          
          @keyframes explosion {
            0% { 
              transform: scale(0.5);
              opacity: 1;
            }
            100% { 
              transform: scale(1.5);
              opacity: 0.7;
            }
          }
        `}
      </style>
    </Box>
  );
};

export default Cell;