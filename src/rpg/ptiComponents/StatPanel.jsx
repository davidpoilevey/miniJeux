import React, { useState } from 'react';
import {
  Box,
  LinearProgress,
  Typography,
  IconButton,
  Popover,
  Divider,
  Tooltip
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import { useRPGContext } from '../RPGContext';
import { BackHand } from '@mui/icons-material';

export default function KnightStatsPanel() {
  const { state , restartLevel, toMainMenu} = useRPGContext();
  const { pdv, xp, gold } = state.knightRPStat;
  const potions = state.inventory?.potions || 0;
  const keys = state.inventory?.keys || [];

  const maxPdv = 100;
  const hpPercent = (pdv / maxPdv) * 100;

  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpenInfo = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseInfo = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      {/* === PANEL PRINCIPAL === */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          width: 200,
          p: 1.5,
          borderRadius: 2,
          bgcolor: 'rgba(10,10,10,0.75)',
          border: '1px solid #555',
          boxShadow: '0 0 10px rgba(255, 215, 0, 0.2)',
          zIndex: 90,
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}
      >
        {/* PV */}
        <Box sx={{position:'relative'}}>
          <LinearProgress
            variant="determinate"
            value={hpPercent} width={100}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: '#2c2c2c',
              '& .MuiLinearProgress-bar': {
                backgroundColor: pdv < 30 ? '#ff1744' : '#00e676'
              }
            }}
          />

        {/* Bouton Info */}
        <Box sx={{ position:'absolute', right:-10,top:-10  }}>
          <IconButton size="small" onClick={handleOpenInfo} sx={{ color: '#ccc' }}>
            <InfoOutlinedIcon fontSize="small" />
          </IconButton>
        </Box>
        </Box>

        {/* Infos rapides */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <StarIcon sx={{ color: '#ffd700', fontSize: 20 }} />
            <Typography sx={{ fontSize: 14, color: '#fff' }}>{xp}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <MonetizationOnIcon sx={{ color: '#ffeb3b', fontSize: 20 }} />
            <Typography sx={{ fontSize: 14, color: '#fff' }}>{gold}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LocalHospitalIcon sx={{ color: '#e53935', fontSize: 20 }} />
            <Typography sx={{ fontSize: 14, color: '#fff' }}>{potions}</Typography>
          </Box>
        </Box>

        {/* Clefs */}
        {keys.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 0.5 }}>
            <VpnKeyIcon sx={{ color: '#90caf9', fontSize: 20 }} />
            <Typography sx={{ fontSize: 13, color: '#fff' }}>
              {keys.join(', ')}
            </Typography>
          </Box>
        )}

<Tooltip title="Recommencer le niveau">
  <IconButton size="small" tabIndex={-1}
    sx={{
      position: 'absolute',
      top: 56,       right: 12,
      zIndex: 9999,
      backgroundColor: 'rgba(255,255,255,0.8)',
      '&:hover': { backgroundColor: 'rgba(255,255,255,1)' }
    }}
    onClick={(evt) => {
      restartLevel();
    }}
  >
    <RestartAltIcon fontSize="small" />
  </IconButton>
</Tooltip>
<Tooltip title="Revenir au menu">
  <IconButton size="small" tabIndex={-1}
    sx={{
      position: 'absolute',
      top: 0,       left: -20,
      zIndex: 9999,
      backgroundColor: 'rgba(108, 165, 115, 0.8)',
      '&:hover': { backgroundColor: 'rgba(255,255,255,1)' }
    }}
    onClick={(evt) => {
      toMainMenu();
    }}
  >
    <BackHand fontSize="small" color='primary' />
  </IconButton>
</Tooltip>
      </Box>

    {state.gameMessage && (
        <Box
          sx={{
            position: 'absolute',
            top: 115,
            left: 18,
            backgroundColor: 'rgba(255, 255, 0, 0.9)',
            color: '#333',
            padding: 1,
            borderRadius: 1,
            fontSize: '0.8rem'
          }}
        >
          {state.gameMessage}
        </Box>
      )}

      {/* === POPUP DES RACCOURCIS CLAVIER === */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleCloseInfo}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        PaperProps={{
          sx: {
            p: 2,
            bgcolor: '#222',
            color: '#fff',
            border: '1px solid #555',
            boxShadow: '0 0 10px rgba(255,255,255,0.1)',
            fontSize: 13,
            fontFamily: 'monospace'
          }
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Raccourcis clavier
        </Typography>
        <Divider sx={{ mb: 1, borderColor: '#444' }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <span>Fleches : Déplacement</span>
          <span>P : Potion 🧪</span>
          <span>D : Bouclier 🛡️</span>
          <span>E / Espace : Interaction</span>
          <span>X : Attaque ⚔️</span>
          <span>Z : Tournoie 🌀</span>
          <span>C : Attaque lancée ➹</span>
        </Box>
      </Popover>
    </>
  );
}
