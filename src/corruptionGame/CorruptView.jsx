import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  CardMedia,
  Typography, 
  Button, 
  LinearProgress,
  Chip,
  Stack,
  Paper,
  Fade,
  Grow
} from '@mui/material';
import { Whatshot, Opacity, Psychology } from '@mui/icons-material';
import { useGameState, useGameDispatch } from './CorruptProvider';
import { gameData } from './corruptData';
import { soundManager } from '../rpg/sons/SoundManager';

const categoryColors = {
  'soin': 'linear-gradient(135deg, #16a085 0%, #2ecc71 100%)',      // Vert (Soin)
  'combat': 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',     // Rouge (Combat)
  'excitation': 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)', // Orange (Excitation)
  'discussion': 'linear-gradient(135deg, #2980b9 0%, #3498db 100%)', // Bleu (Discussion)
  'pervers': 'linear-gradient(135deg, #da33a5ff 0%, #f23eb3ff 100%)',    // Violet (Pervers)
  'corruption': 'linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%)',    // Violet (Pervers)
  'null': 'linear-gradient(135deg, #bdc3c7 0%, #7f8c8d 100%)',       // Gris/Jaune (Par défaut)
};
  // Fonction pour obtenir la couleur selon la statistique
  const getStatColor = (stat, value) => {
    if (stat === 'mana') return '#2196f3';
    if (stat === 'excitation') return value > 70 ? '#f44336' : '#ff9800';
    if (stat === 'corruption') return value > 50 ? '#9c27b0' : '#673ab7';
    return '#757575';
  };

function CorruptView() {
  const state = useGameState();
  const dispatch = useGameDispatch();
  
  const message = state.message || null;
  
  const scene = gameData[state.currentScene];
  const choices = typeof scene?.getChoices === 'function' 
    ? scene.getChoices(state.stats) 
    : scene?.choices || [];
    // NOUVELLE LIGNE : Gère les descriptions dynamiques
  const description = typeof scene.getDescription === 'function'
    ? scene.getDescription(state)
    : scene.description;

  const handleChoiceClick = (choice) => {
    dispatch({ type: 'HANDLE_CHOICE', payload: choice });
    if (choice.target && gameData[choice.target]?.onEnter) {
      dispatch(gameData[choice.target].onEnter);
    }
    if(choice.sound)
      soundManager.play(choice.sound);
  };
const getButtonColor = (category) => {
    // Si la catégorie n'est pas définie (undefined), utilise 'null'. Sinon, utilise la catégorie.
    const key = category ?? 'null'; 
    return categoryColors[key] || categoryColors['null']; // Retourne le dégradé ou la couleur par défaut
};

  const stats = [
    { 
      label: 'Mana', 
      value: state.stats.mana, 
      max: 100, 
      icon: <Opacity />, 
      key: 'mana' 
    },
    { 
      label: 'Excitation', 
      value: state.stats.excitation, 
      max: 100, 
      icon: <Whatshot />, 
      key: 'excitation' 
    },
    { 
      label: 'Corruption', 
      value: state.stats.corruption, 
      max: 100, 
      icon: <Psychology />, 
      key: 'corruption' 
    }
  ];

  return (
    <Box sx={{
      height: '100%',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2,
      gap: 2
    }}>
      {/* Card principale du jeu */}
      <Card sx={{
        maxWidth: 900,
        flex: 1, overflow:'auto', height:'100%',
        bgcolor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 3,
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
      }}>
        
        {/* Image de la scène */}
        {scene?.image && (
          <Fade in timeout={800}>
            <CardMedia
              component="img"
              image={scene.image}
              alt="Scene"
              sx={{
                height: 250,
                objectFit: 'contain',
                filter: 'brightness(0.9) contrast(1.1)'
              }}
            />
          </Fade>
        )}

        {/* Description de la scène */}
        <CardContent sx={{ p: 4 }}>
          <Fade in timeout={1000}>
            <Paper 
              elevation={0}
              sx={{
                p: 3,
                bgcolor: 'rgba(0, 0, 0, 0.03)',
                borderLeft: '4px solid #673ab7',
                mb: 3
              }}
            >
              <Typography 
                variant="body1" 
                sx={{
                  fontSize: '1.1rem',
                  lineHeight: 1.8,
                  color: 'text.primary',
                  whiteSpace: 'pre-line',
                  fontFamily: '"Merriweather", "Georgia", serif'
                }}
              >
                {description}
              </Typography>
            </Paper>
          </Fade>

          {/* Choix */}
          <Box sx={{display:'flex', gap:3, flexWrap:'wrap'}}>
            {choices.map((choice, index) => (
              <Grow 
                in 
                timeout={500 + (index * 150)} 
                key={index}
              >
                <Button
                  variant="contained"
                  size="large"
                  disabled={choice.disabled?choice.disabled(state.stats):false}
                  onClick={() => handleChoiceClick(choice)}
                  sx={{
                    py: 2,
                    px: 3,
                    textAlign: 'left',
                    justifyContent: 'flex-start',
                    fontSize: '1rem',
                    maxWidth:'30%',
                    fontWeight: 500,
                    textTransform: 'none',
                   background: getButtonColor(choice.category),
                    color: 'white',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.3)'
                    }
                  }}
                >
                  {choice.text}
                </Button>
              </Grow>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Tableau de bord à droite */}
      <Box sx={{
        width: 280,
        height: '85vh',
        bgcolor: 'rgba(0, 0, 0, 0.85)',
        borderRadius: 3,
        backdropFilter: 'blur(10px)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 3
      }}>
        
        {/* Message d'alerte/notification */}
        {message && (
          <Fade in timeout={500}>
            <Paper 
              elevation={3}
              sx={{
                p: 2.5,
                bgcolor: 'rgba(255, 215, 0, 0.15)',
                border: '2px solid rgba(255, 215, 0, 0.6)',
                borderRadius: 2,
                boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)'
              }}
            >
              <Typography 
                variant="body2" 
                sx={{
                  color: '#FFD700',
                  fontWeight: 600,
                  textAlign: 'center',
                  fontSize: '0.95rem',
                  lineHeight: 1.5,
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                {message}
              </Typography>
            </Paper>
          </Fade>
        )}

        {/* Stats verticales */}
        <Box sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'flex-end',
          gap: 2,
          pt: 2
        }}>
          {stats.map((stat) => (
            <Box 
              key={stat.key}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
                gap: 2
              }}
            >
              {/* Icône en haut */}
              <Box sx={{
                bgcolor: getStatColor(stat.key, stat.value),
                borderRadius: '50%',
                p: 1.5,
                boxShadow: `0 4px 12px ${getStatColor(stat.key, stat.value)}40`
              }}>
                {stat.icon}
              </Box>

              {/* Barre verticale */}
              <Box sx={{
                flex: 1,
                width: 50,
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 3,
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column-reverse'
              }}>
                <Box
                  sx={{
                    width: '100%',
                    height: `${(stat.value / stat.max) * 100}%`,
                    bgcolor: getStatColor(stat.key, stat.value),
                    borderRadius: 3,
                    transition: 'height 0.5s ease',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      inset: 0,
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      animation: 'pulse 2s ease-in-out infinite'
                    }
                  }}
                />
                
                {/* Valeur au centre de la barre */}
                <Typography
                  variant="h6"
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                    zIndex: 2
                  }}
                >
                  {stat.value.toFixed(1)}%
                </Typography>
              </Box>

              {/* Label en bas */}
              <Typography
                variant="caption"
                sx={{
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  letterSpacing: 1
                }}
              >
                {stat.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export default CorruptView;