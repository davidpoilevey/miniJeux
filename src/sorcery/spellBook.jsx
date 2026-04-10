// SpellBook.js - Interface de gestion des sorts

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Paper,
  Typography,
  Box,
  IconButton,
  Divider,
  Chip,
  LinearProgress
} from '@mui/material';
import { Close, AutoAwesome } from '@mui/icons-material';
import { useGame } from './SorceryContext';
import spellsData from './data/spells.json';

function SpellBook() {
  const { state, dispatch } = useGame();
  const { spells, ui, player } = state;
  const [selectedSlot, setSelectedSlot] = useState(null);

  const handleClose = () => {
    dispatch({ type: 'TOGGLE_SPELLBOOK' });
    setSelectedSlot(null);
  };

  const handleEquipSpell = (spellId) => {
    if (selectedSlot !== null) {
      dispatch({
        type: 'EQUIP_SPELL',
        payload: { slot: selectedSlot, spellId }
      });
      setSelectedSlot(null);
    }
  };

  const getSpellIcon = (spellId) => {
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
  };

  const getElementColor = (element) => {
    const colors = {
      'fire': '#e74c3c',
      'ice': '#3498db',
      'lightning': '#f1c40f',
      'shadow': '#34495e',
      'light': '#ecf0f1',
      'arcane': '#9b59b6'
    };
    
    return colors[element] || '#95a5a6';
  };

  const getTypeColor = (type) => {
    const colors = {
      'offensive': '#e74c3c',
      'support': '#2ecc71',
      'utility': '#3498db',
      'ultimate': '#9b59b6'
    };
    
    return colors[type] || '#95a5a6';
  };

  const learnedSpellsData = spellsData.spells.filter(spell => 
    spells.learned.includes(spell.id)
  );

  return (
    <Dialog
      open={ui.spellBookOpen}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#1a1a2e',
          color: 'white',
          border: '2px solid #9b59b6'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          📖 Grimoire de Sorts
        </Typography>
        <IconButton onClick={handleClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <Divider sx={{ borderColor: '#9b59b6' }} />

      <DialogContent>
        {/* Slots de sorts équipés */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#9b59b6' }}>
            ⚡ Sorts Équipés
          </Typography>
          
          <Grid container spacing={2}>
            {[0, 1, 2, 3].map((slot) => {
              const equippedSpellId = spells.equipped[slot];
              const equippedSpell = equippedSpellId 
                ? spellsData.spells.find(s => s.id === equippedSpellId)
                : null;
              
              return (
                <Grid item xs={3} key={slot}>
                  <Paper
                    onClick={() => setSelectedSlot(slot)}
                    sx={{
                      p: 2,
                      backgroundColor: selectedSlot === slot ? '#3498db' : '#34495e',
                      border: '3px solid',
                      borderColor: selectedSlot === slot ? '#2ecc71' : equippedSpell ? getElementColor(equippedSpell.element) : '#7f8c8d',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      minHeight: 120,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        borderColor: '#2ecc71'
                      }
                    }}
                  >
                    {equippedSpell ? (
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography sx={{ fontSize: 40, mb: 1 }}>
                          {getSpellIcon(equippedSpell.id)}
                        </Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {equippedSpell.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#95a5a6' }}>
                          Touche {slot + 1}
                        </Typography>
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography sx={{ fontSize: 40, color: '#7f8c8d', mb: 1 }}>
                          ∅
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#7f8c8d' }}>
                          Slot {slot + 1} - Vide
                        </Typography>
                      </Box>
                    )}
                    
                    {selectedSlot === slot && (
                      <Chip
                        label="Sélectionné"
                        size="small"
                        sx={{
                          mt: 1,
                          backgroundColor: '#2ecc71',
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    )}
                  </Paper>
                </Grid>
              );
            })}
          </Grid>

          {selectedSlot !== null && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: '#2ecc71', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ color: '#1a1a2e', fontWeight: 'bold' }}>
                ✨ Slot {selectedSlot + 1} sélectionné ! Cliquez sur un sort ci-dessous pour l'équiper.
              </Typography>
            </Box>
          )}
        </Box>

        <Divider sx={{ borderColor: '#7f8c8d', my: 3 }} />

        {/* Liste des sorts appris */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2, color: '#9b59b6' }}>
            📚 Sorts Appris ({learnedSpellsData.length})
          </Typography>
          
          <Grid container spacing={2}>
            {learnedSpellsData.map((spell) => {
              const isEquipped = spells.equipped.includes(spell.id);
              const canCast = player.mana >= spell.stats.manaCost;
              
              return (
                <Grid item xs={6} key={spell.id}>
                  <Paper
                    onClick={() => selectedSlot !== null && handleEquipSpell(spell.id)}
                    sx={{
                      p: 2,
                      backgroundColor: '#34495e',
                      border: '2px solid',
                      borderColor: isEquipped ? '#2ecc71' : getElementColor(spell.element),
                      cursor: selectedSlot !== null ? 'pointer' : 'default',
                      transition: 'all 0.2s',
                      '&:hover': selectedSlot !== null ? {
                        transform: 'scale(1.02)',
                        borderColor: '#3498db'
                      } : {},
                      opacity: isEquipped ? 0.7 : 1
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Typography sx={{ fontSize: 48 }}>
                        {getSpellIcon(spell.id)}
                      </Typography>
                      
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {spell.name}
                          </Typography>
                          {isEquipped && (
                            <Chip
                              label="Équipé"
                              size="small"
                              sx={{
                                backgroundColor: '#2ecc71',
                                color: 'white',
                                fontWeight: 'bold'
                              }}
                            />
                          )}
                        </Box>
                        
                        <Typography variant="body2" sx={{ color: '#95a5a6', mb: 1 }}>
                          {spell.description}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip
                            label={spell.element}
                            size="small"
                            sx={{
                              backgroundColor: getElementColor(spell.element),
                              color: 'white'
                            }}
                          />
                          <Chip
                            label={spell.type}
                            size="small"
                            sx={{
                              backgroundColor: getTypeColor(spell.type),
                              color: 'white'
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>
                    
                    {/* Stats du sort */}
                    <Grid container spacing={1}>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center', p: 1, backgroundColor: '#2c3e50', borderRadius: 1 }}>
                          <Typography variant="caption" sx={{ color: '#95a5a6' }}>
                            Dégâts
                          </Typography>
                          <Typography variant="h6" sx={{ color: '#e74c3c', fontWeight: 'bold' }}>
                            {spell.stats.damage || 0}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center', p: 1, backgroundColor: '#2c3e50', borderRadius: 1 }}>
                          <Typography variant="caption" sx={{ color: '#95a5a6' }}>
                            Mana
                          </Typography>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              color: canCast ? '#3498db' : '#e74c3c',
                              fontWeight: 'bold' 
                            }}
                          >
                            {spell.stats.manaCost}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center', p: 1, backgroundColor: '#2c3e50', borderRadius: 1 }}>
                          <Typography variant="caption" sx={{ color: '#95a5a6' }}>
                            Cooldown
                          </Typography>
                          <Typography variant="h6" sx={{ color: '#f39c12', fontWeight: 'bold' }}>
                            {spell.stats.cooldown / 1000}s
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>

          {learnedSpellsData.length === 0 && (
            <Paper sx={{ p: 4, backgroundColor: '#2c3e50', textAlign: 'center' }}>
              <Typography sx={{ color: '#95a5a6', fontSize: 48, mb: 2 }}>
                📜
              </Typography>
              <Typography variant="h6" sx={{ color: '#7f8c8d' }}>
                Aucun sort appris pour le moment
              </Typography>
              <Typography variant="body2" sx={{ color: '#95a5a6', mt: 1 }}>
                Trouvez des parchemins de sorts pour apprendre de nouveaux pouvoirs !
              </Typography>
            </Paper>
          )}
        </Box>

        {/* Instructions */}
        <Box sx={{ mt: 3, p: 2, backgroundColor: '#2c3e50', borderRadius: 1 }}>
          <Typography variant="caption" sx={{ color: '#95a5a6' }}>
            💡 Astuce : Sélectionnez un slot (1-4) puis cliquez sur un sort pour l'équiper. Appuyez sur <strong>K</strong> pour fermer le grimoire.
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default SpellBook;