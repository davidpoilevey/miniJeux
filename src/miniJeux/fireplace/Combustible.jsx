import React from 'react';
import { Box, Typography } from '@mui/material';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import imgFlamme from '../images/flamme.gif';

const Combustible = ({ item, fireStarted }) => {
  const isBurning = item.isBurning;
  const heat = Math.round(item.currentHeat || 0);
  const burnDuration = isBurning ? Date.now() - item.burnStartTime : 0;
  const burnProgress = isBurning ? Math.min(burnDuration / item.dureeCombustion, 1) : 0;
  
  const showHeat = heat > 0 && item.id !== 'cendres';

  // --- Logique de couleur des flammes ---
  const getFlameColor = (currentHeat) => {
    if (currentHeat < 50) return '#8B0000';
    if (currentHeat < 200) return '#FF4500';
    if (currentHeat < 500) return '#FFA500';
    if (currentHeat < 1200) return '#FFD700';
    return '#FFFFDD';
  };

  const flameColor = getFlameColor(heat);
  
  // Calculer l'intensité de la flamme selon la chaleur
  const flameOpacity = Math.max(0.4,Math.min(heat / 1000, 0.9));
  const rayonTotal = item.rayonRayonnement || 50;

  return (
    <Box
      key={item.uniqueId}
      sx={{
        position: 'absolute',
        left: item.x,
        top: item.y,
        width: item.width,
        height: item.height,
        background: `url(${item.image})`,
        backgroundSize:'cover',
        border: heat>0 ? `2px solid ${flameColor}` : '2px solid #333',
        borderRadius: 10,
        cursor: !fireStarted ? 'grab' : 'default',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.5rem',
        boxShadow: isBurning 
          ? `0 0 ${20 + (Math.sin(Date.now()/100) * 10)}px ${flameColor}` 
          : 'none',
        opacity: item.id === 'cendres' ? 0.4 : (1 - burnProgress * 0.6),
        transition: 'all 0.3s',
        zIndex: isBurning ? 2 : 1,
        // Remplacer le ::before précédent par celui-ci pour un look "épineux"
'&::before': item.repoussoir > 0 ? {
  content: '""',
  position: 'absolute',
  inset: 0, // Même taille que l'item
  outline: `${item.repoussoir}px dotted ${item.color}`, // Crée des points/pics
  outlineOffset: '2px',
  borderRadius: 10,
  opacity: 0.3,
  zIndex: -1,
  filter: 'drop-shadow(0 0 2px black)',
} : {}
      }}
    
    >
      {/* Effet de flamme GIF autour du combustible */}
      {isBurning && item.id !== 'cendres' && (
        <Box
          sx={{
            position: 'absolute',
            top: -rayonTotal,
            left: -rayonTotal,
            width: item.width + (rayonTotal * 2),
            height: item.height + (rayonTotal * 2),
            backgroundImage: `url(${imgFlamme})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: flameOpacity,
            filter: `hue-rotate(${Math.max(0, (heat - 500) / 10)}deg) brightness(${1 + heat / 2000})`,
            pointerEvents: 'none',
            zIndex: -1,
            mixBlendMode: 'screen', // Mode de fusion pour un effet plus réaliste
          }}
        />
      )}
      
      <span>{item.emoji}</span>

      {showHeat && (
        <Typography
          sx={{
            position: 'absolute',
            bottom: 0,
            fontSize: '0.7rem',
            fontWeight: 'bold',
            color: isBurning ? flameColor : '#555',
            backgroundColor: 'rgba(255,255,255,0.8)',
            padding: '2px 4px',
            borderRadius: '4px',
            pointerEvents: 'none'
          }}
        >
          {heat}° / {item.tempAutoCombustion}°
        </Typography>
      )}

      {isBurning && item.id !== 'cendres' && (
        <LocalFireDepartmentIcon 
          sx={{ 
            position: 'absolute', 
            top: -10,
            color: flameColor,
            animation: 'flicker 0.3s infinite',
            fontSize: '1.8rem'
          }} 
        />
      )}
    </Box>
  );
};

export default Combustible;