// src/components/CommandesPanel.js
import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, Button, IconButton } from '@mui/material';
import { Refresh, RefreshRounded } from '@mui/icons-material';
import { useFarming } from './FarmingProvider';
import { PLANTES, PRODUCTIONS } from './farmData';
import { getRandomCommande } from './farmUtils';

const MAX_COMMANDES_BASE = 3;

const CommandesPanel = () => {
  const { commandes, setCommandes, diamond, resources, livreCommande, setLogMessage, setMoney, level } = useFarming();
  const maxCommandes = MAX_COMMANDES_BASE + Math.floor(diamond / 5);

  const refreshCommandes = () => {
    const newCommandes = Array.from({ length: maxCommandes }, () => getRandomCommande(level));
    setCommandes(newCommandes);
    setLogMessage("Toutes les commandes ont ete rafraichies");
  };

  const refreshSingleCommande = (commandeIndex) => {
    const newCommande = getRandomCommande(level);
    if (newCommande) {
      const newCommandes = [...commandes];
      newCommandes[commandeIndex] = newCommande;
      setCommandes(newCommandes);
    }
  };

  useEffect(() => {
    if (!commandes || commandes.length === 0) {
      refreshCommandes();
    }
  }, [commandes]);

  const canFulfillCommande = (commande) => {
    const currentStock = resources[commande.itemId] || 0;
    return currentStock >= commande.quantite;
  };

  const handleLivrer = (commandeId) => {
    livreCommande(commandeId);
  };

  const getStockStatus = (commande) => {
    const currentStock = resources[commande.itemId] || 0;
    const canFulfill = canFulfillCommande(commande);
    
    return {
      canFulfill,
      currentStock,
      needed: commande.quantite,
      missing: Math.max(0, commande.quantite - currentStock)
    };
  };

  return (
    <Paper elevation={3} sx={{flex:1, p: 2, height: '100%', backgroundColor: '#fdeb97', overflow:'auto' }}>
      <Box display={'flex'} alignItems={'center'}>
      <Typography variant="h6" >
        📦 Commandes ({commandes.length}/{maxCommandes})
      </Typography>

        <IconButton fullWidth variant="outlined" disabled={commandes.length>1} onClick={refreshCommandes}>
          <RefreshRounded/>
        </IconButton>
        </Box>
      <Box sx={{display:'flex', flexWrap:'wrap', gap:2}}>
        {commandes.map((commande, index) => {
          const stockStatus = getStockStatus(commande);
          const isDisabled = !stockStatus.canFulfill;
          
          return (
            <Box key={commande.id} sx={{position:'relative', maxWidth:150, margin:2}}>
               <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    refreshSingleCommande(index);
                  }}
                  sx={{
                    position: 'absolute',
                    top: 2,                     right: 2,
                    width: 24,                    height: 24,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)'
                    }
                  }}
                >
                  <Refresh fontSize="small" />
                </IconButton>
              <Paper
                sx={{
                  p: 1.5,
                  top:24,position:'relative',
                  textAlign: 'center',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  opacity: isDisabled ? 0.5 : 1,
                  backgroundColor: isDisabled ? '#f5f5f5' : 'white',
                  '&:hover': {
                    backgroundColor: isDisabled ? '#f5f5f5' : '#f0fff0'
                  },
                  border: isDisabled ? '1px solid #ccc' : '1px solid transparent',
                  filter: isDisabled ? 'grayscale(50%)' : 'none'
                }}
                onClick={() => !isDisabled && handleLivrer(commande.id)}
              >
                {/* Bouton de rafraîchissement individuel */}
               

                <Box>
                  <img 
                    src={commande.img} 
                    alt={commande.id}
                    style={{
                      height:64,
                      filter: isDisabled ? 'grayscale(60%)' : 'none',
                      opacity: isDisabled ? 0.7 : 1
                    }}
                  />
                </Box>
                
                <Typography variant="body1" sx={{ fontWeight: isDisabled ? 'normal' : 'bold' }}>
                  {commande.quantite} × {commande.name}
                </Typography>
                
                <Typography variant="caption" display="block">
                  💰 {commande.reward} boules
                </Typography>

                {/* Affichage du stock */}
                <Typography 
                  variant="caption" 
                  display="block"
                  sx={{ 
                    color: stockStatus.canFulfill ? 'green' : 'red',
                    fontWeight: 'bold',
                    mt: 0.5
                  }}
                >
                  Stock: {stockStatus.currentStock}/{stockStatus.needed}
                  {!stockStatus.canFulfill && (
                    <span style={{ color: 'red' }}>
                      {' '}(manque {stockStatus.missing})
                    </span>
                  )}
                </Typography>

                {/* Overlay pour les commandes non réalisables */}
                {isDisabled && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(200, 200, 200, 0.3)',
                      borderRadius: 1
                    }}
                  >
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        padding: '2px 6px',
                        borderRadius: 1,
                        fontWeight: 'bold',
                        color: 'red'
                      }}
                    >
                      Stock insuffisant
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Box>
          );
        })}
      </Box>

    </Paper>
  );
};

export default CommandesPanel;