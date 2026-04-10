// Inventory.js - Interface de gestion de l'inventaire

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Paper,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Button,
  Divider
} from '@mui/material';
import { Close, Delete } from '@mui/icons-material';
import { useGame } from './SorceryContext';

function Inventory() {
  const { state, dispatch, utiliseItem } = useGame();
  const { inventory, ui } = state;

  const handleClose = () => {
    dispatch({ type: 'TOGGLE_INVENTORY' });
  };

 const handleUseItem = (index) => {
  const item = inventory.items[index];
  
  if (item.type === 'consumable') {
    utiliseItem(index);
  } else if (item.type === 'weapon') {
    // Équiper l'arme
    dispatch({
      type: 'EQUIP_WEAPON',
      payload: { weapon: item, fromIndex: index }
    });
  } else if (item.type === 'armor') {
    // Équiper l'armure
    dispatch({
      type: 'EQUIP_ARMOR',
      payload: { armor: item, fromIndex: index }
    });
  }
};

  const getItemIcon = (item) => {
    const icons = {
      'consumable': '🧪',
      'regenerative': '❤️‍🩹',
      'key': '🔑',
      'spell-scroll': '📜',
      'material': '💎',
      'weapon': '⚔️',
      'armor': '🛡️'
    };
    
    return icons[item.type] || '❔';
  };

  const getItemColor = (item) => {
    const colors = {
      'consumable': '#e74c3c',
      'key': '#f39c12',
      'spell-scroll': '#9b59b6',
      'material': '#95a5a6',
      'weapon': '#e67e22',
      'armor': '#e67e22',
      'regenerative': '#1cb987'
    };
    
    return colors[item.type] || '#ecf0f1';
  };

  return (
    <Dialog
      open={ui.inventoryOpen}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#1a1a2e',
          color: 'white',
          border: '2px solid #3498db'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          📦 Inventaire
        </Typography>
        <IconButton onClick={handleClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <Divider sx={{ borderColor: '#3498db' }} />

      <DialogContent>
         {/* Section équipement */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#3498db' }}>
            ⚔️ Équipement
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Paper
                sx={{
                  p: 2,
                  backgroundColor: '#34495e',
                  border: '2px solid #e67e22',
                  textAlign: 'center'
                }}
              >
                <Typography variant="subtitle2" sx={{ color: '#95a5a6', mb: 1 }}>
                  Arme
                </Typography>
                {inventory.equippedWeapon ? (
                  <Box>
                    <Typography sx={{ fontSize: 32 }}>⚔️</Typography>
                    <Typography variant="body2">{inventory.equippedWeapon.name}</Typography>
                    <Typography variant="caption" sx={{ color: '#95a5a6' }}>
                      ATK +{inventory.equippedWeapon.stats.attack}
                    </Typography>
                  </Box>
                ) : (
                  <Typography sx={{ color: '#7f8c8d' }}>Aucune</Typography>
                )}
              </Paper>
            </Grid>

            <Grid item xs={6}>
              <Paper
                sx={{
                  p: 2,
                  backgroundColor: '#34495e',
                  border: '2px solid #3498db',
                  textAlign: 'center'
                }}
              >
                <Typography variant="subtitle2" sx={{ color: '#95a5a6', mb: 1 }}>
                  Armure
                </Typography>
                {inventory.equippedArmor ? (
                  <Box>
                    <Typography sx={{ fontSize: 32 }}>🛡️</Typography>
                    <Typography variant="body2">{inventory.equippedArmor.name}</Typography>
                    <Typography variant="caption" sx={{ color: '#95a5a6' }}>
                      DEF +{inventory.equippedArmor.stats.defense}
                    </Typography>
                  </Box>
                ) : (
                  <Typography sx={{ color: '#7f8c8d' }}>Aucune</Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Instructions */}
        <Box sx={{ mt: 3, p: 2, backgroundColor: '#2c3e50', borderRadius: 1 }}>
          <Typography variant="caption" sx={{ color: '#95a5a6' }}>
            💡 Astuce : Cliquez sur une potion pour l'utiliser. Appuyez sur <strong>I</strong> pour fermer l'inventaire.
          </Typography>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ color: '#95a5a6' }}>
            Objets: {inventory.items.length} / {inventory.maxSlots}
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {/* Grille d'items */}
          {Array.from({ length: inventory.maxSlots }).map((_, index) => {
            const item = inventory.items[index];
            
            return (
              <Grid item xs={3} key={index}>
                <Paper
                  elevation={3}
                  sx={{
                    height: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: item ? '#34495e' : '#2c3e50',
                    border: '2px solid',
                    borderColor: item ? getItemColor(item) : '#7f8c8d',
                    position: 'relative',
                    cursor: item ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                    '&:hover': item ? {
                      transform: 'scale(1.05)',
                      borderColor: '#3498db'
                    } : {}
                  }}
                  onClick={() => item && handleUseItem(index)}
                >
                  {item ? (
                    <Tooltip
                      title={
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {item.name}
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                            {item.description}
                          </Typography>
                          {item.type === 'consumable' && (
                            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#2ecc71' }}>
                              Clic pour utiliser
                            </Typography>
                          )}
                        </Box>
                      }
                      arrow
                    >
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography sx={{ fontSize: 36 }}>
                          {getItemIcon(item)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'white', mt: 0.5 }}>
                          {item.name}
                        </Typography>
                        {item.stackable && item.quantity > 1 && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 5,
                              right: 5,
                              backgroundColor: '#2ecc71',
                              borderRadius: '50%',
                              width: 24,
                              height: 24,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: 10 }}>
                              {item.quantity}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Tooltip>
                  ) : (
                    <Typography sx={{ color: '#7f8c8d', fontSize: 12 }}>
                      Vide
                    </Typography>
                  )}
                </Paper>
              </Grid>
            );
          })}
        </Grid>

       
      </DialogContent>
    </Dialog>
  );
}

export default Inventory;