// HUD.js - Interface utilisateur principale

import React from 'react';
import { Box, Paper, Typography, LinearProgress, Chip, Stack } from '@mui/material';
import { Favorite, AutoAwesome, Star } from '@mui/icons-material';

import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

import { useGame } from './SorceryContext';

function HUD() {
  const { state } = useGame();
  const { player, spells, currentLevel } = state;

  const healthPercent = (player.health / player.maxHealth) * 100;
  const manaPercent = (player.mana / player.maxMana) * 100;
  const xpPercent = (player.xp / player.xpToNextLevel) * 100;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 100,
        backgroundColor: 'rgba(26, 26, 46, 0.95)',
        borderTop: '2px solid #3498db',
        display: 'flex',
        alignItems: 'center',
        padding: 2,
        zIndex: 1000
      }}
    >
      {/* Partie gauche - Stats du joueur */}
      <Box sx={{ flex: 1 }}>
        <Stack spacing={1}>
          {/* Barre de vie */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Favorite sx={{ color: '#e74c3c' }} />
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>
                  VIE
                </Typography>
                <Typography variant="caption" sx={{ color: 'white' }}>
                  {player.health} / {player.maxHealth}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={healthPercent}
                sx={{
                  height: 12,
                  borderRadius: 1,
                  backgroundColor: '#2c3e50',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor:
                      healthPercent > 50
                        ? '#2ecc71'
                        : healthPercent > 25
                        ? '#f39c12'
                        : '#e74c3c',
                    borderRadius: 1
                  }
                }}
              />
            </Box>
          </Box>

          {/* Barre de mana */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesome sx={{ color: '#3498db' }} />
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>
                  MANA
                </Typography>
                <Typography variant="caption" sx={{ color: 'white' }}>
                  {player.mana} / {player.maxMana}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={manaPercent}
                sx={{
                  height: 12,
                  borderRadius: 1,
                  backgroundColor: '#2c3e50',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#3498db',
                    borderRadius: 1
                  }
                }}
              />
            </Box>
          </Box>
        </Stack>
      </Box>

      {/* Partie centrale - Sorts équipés */}
      <Box
        sx={{
          flex: 2,
          display: 'flex',
          justifyContent: 'center',
          gap: 2,
          px: 4
        }}
      >
        {[0, 1, 2, 3].map((slot) => {
          const spellId = spells.equipped[slot];
          const isOnCooldown = spellId && spells.cooldowns[spellId] > Date.now();
          
          return (
            <Paper
              key={slot}
              elevation={3}
              sx={{
                width: 60,
                height: 60,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: spellId ? '#34495e' : '#2c3e50',
                border: '2px solid',
                borderColor: isOnCooldown ? '#95a5a6' : '#3498db',
                position: 'relative',
                opacity: isOnCooldown ? 0.5 : 1
              }}
            >
              {spellId ? (
                <>
                  <Typography sx={{ fontSize: 24 }}>
                    {getSpellIcon(spellId)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'white', fontSize: 10 }}>
                    {slot + 1}
                  </Typography>
                  
                  {isOnCooldown && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Typography sx={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                        {Math.ceil((spells.cooldowns[spellId] - Date.now()) / 1000)}s
                      </Typography>
                    </Box>
                  )}
                </>
              ) : (
                <Typography sx={{ color: '#7f8c8d', fontSize: 10 }}>
                  {slot + 1}
                </Typography>
              )}
            </Paper>
          );
        })}
      </Box>

      {/* Partie droite - Niveau et XP */}
      <Box sx={{ flex: 1, textAlign: 'right' }}>
        
        <Stack spacing={1} alignItems="flex-end">
          <Chip
            icon={<Star />}
            label={`Niveau ${player.level}`}
            sx={{
              backgroundColor: '#9b59b6',
              color: 'white',
              fontWeight: 'bold',
              fontSize: 14
            }}
          />
          
          {/* Barre d'XP */}
          <Box sx={{ width: '100%', maxWidth: 200 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>
                XP
              </Typography>
              <Typography variant="caption" sx={{ color: 'white' }}>
                {player.xp} / {player.xpToNextLevel}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={xpPercent}
              sx={{
                height: 8,
                borderRadius: 1,
                backgroundColor: '#2c3e50',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#9b59b6',
                  borderRadius: 1
                }
              }}
            />
          </Box>

          {/* Salle actuelle */}
          <Typography variant="caption" sx={{ color: '#95a5a6' }}>
            Salle: {currentLevel.currentRoom}
          </Typography>
        </Stack>
      </Box>
      <DialogBox />
    </Box>
  );
}

// Helper pour obtenir l'icône d'un sort
function getSpellIcon(spellId) {
  const icons = {
    'fireball': '🔥',
    'ice-shard': '❄️',
    'lightning-strike': '⚡',
    'shadow-blade': '🗡️',
    'healing-light': '✨',
    'mana-shield': '🛡️',
    'teleport': '🌀',
    'ghost-walk': '👻',
    'time-freeze': '🥶',
    'meteor-storm': '☄️'
  };
  
  return icons[spellId] || '✦';
}

export default HUD;



function DialogBox() {
  const { state } = useGame();
  const { ui } = state;

  if (!ui.dialogVisible) return null;

  return (
    <Dialog
      open={ui.dialogVisible}
      maxWidth="md"
      PaperProps={{
        sx: {
          backgroundColor: '#1a1a2e',
          color: 'white',
          border: '2px solid #f39c12',
          minWidth: 500
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', fontSize: 24, color: '#f39c12' }}>
        🎉 Niveau Terminé !
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body1" sx={{ fontSize: 16, lineHeight: 1.8, mb: 2 }}>
          {ui.dialogText}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        {ui.dialogOptions?.map((option, index) => (
          <Button
            key={index}
            variant="contained"
            onClick={option.action}
            sx={{
              backgroundColor: '#f39c12',
              color: '#1a1a2e',
              fontWeight: 'bold',
              fontSize: 16,
              px: 4,
              '&:hover': {
                backgroundColor: '#e67e22'
              }
            }}
          >
            {option.text}
          </Button>
        ))}
      </DialogActions>
    </Dialog>
  );
}
