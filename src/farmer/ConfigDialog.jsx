import React, { useEffect, useState } from 'react';
import {
  Dialog,  DialogTitle,  DialogContent,  DialogActions,  Button,
  Typography,  Box,  Switch,  FormControlLabel,  TextField,  Divider,
  Alert,  IconButton,  Slider,  Chip
} from '@mui/material';
import {
  Warning,  RestartAlt,  AttachMoney,  Grass,  Speed,  Close,  SecurityUpdate,  BugReport,
  Diamond} from '@mui/icons-material';
import { useFarming } from './FarmingProvider';

const ConfigDialog = ({ open, onClose }) => {
  const { reset, money, setMoney, level, setLevel, xMode, setXmode, engrais, diamond, setDiamond, setEngrais } = useFarming();
  
  const [tempMoney, setTempMoney] = useState(money);
  const [tempDiamond, setTempDiamond] = useState(diamond);
  const [tempLevel, setTempLevel] = useState(level);
  const [tempEngrais, setTempEngrais] = useState(engrais);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  useEffect(()=>{
     setTempMoney(money);
    setTempLevel(level);
    setTempEngrais(engrais);
    setTempDiamond(diamond);
  },[level,money,xMode,engrais])

  const handleSave = () => {
    setMoney(tempMoney);
    setLevel(tempLevel);
    setEngrais(tempEngrais);
    setDiamond(tempDiamond);
    onClose();
  };

  const handleReset = () => {
    reset();
    setShowResetConfirm(false);
    onClose();
  };

  const quickAddMoney = (amount) => {
    setTempMoney(prev => Math.max(0, prev + amount));
  };
  const quickAddDiamond = (amount) => {
    setTempDiamond(prev => Math.max(0, prev + amount));
  };

  const quickAddEngrais = (amount) => {
    setTempEngrais(prev => Math.max(0, prev + amount));
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg,rgb(165, 163, 163) 0%,rgb(155, 50, 50) 50%,rgb(214, 206, 206) 100%)',
          border: '2px solid #ff4444',
          borderRadius: '12px',
          boxShadow: '0 0 30px rgba(255, 68, 68, 0.3)',
          position: 'relative',
          overflow: 'visible',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -2,
            left: -2,
            right: -2,
            bottom: -2,
            background: 'linear-gradient(45deg, #ff4444, #ffaa00, #ff4444, #ffaa00)',
            borderRadius: '12px',
            zIndex: -1,
            animation: 'dangerGlow 2s ease-in-out infinite alternate'
          },
          '@keyframes dangerGlow': {
            '0%': { opacity: 0.5 },
            '100%': { opacity: 1 }
          }
        }
      }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(90deg, #ff4444, #cc0000)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        position: 'relative'
      }}>
        <Warning sx={{ animation: 'warning-blink 1s infinite' }} />
        <Typography variant="h6" sx={{ fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
          ZONE DE CONFIGURATION DANGEREUSE
        </Typography>
        <IconButton 
          onClick={onClose}
          sx={{ 
            position: 'absolute',
            right: 8,
            color: 'white',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
          }}
        >
          <Close />
        </IconButton>
        <style jsx>{`
          @keyframes warning-blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0.3; }
          }
        `}</style>
      </DialogTitle>

      <DialogContent sx={{ backgroundColor: '#181818', color: 'white', p: 3 }}>
        <Alert 
          severity="warning" 
          sx={{ 
            mb: 3, 
            backgroundColor: 'rgba(255, 193, 7, 0.1)',color: '#ffc107',
            border: '1px solid #ffc107',
            '& .MuiAlert-icon': { color: '#ffc107' }
          }}
        >
          <Typography variant="body2">
            ⚠️ Attention ! Ces options peuvent affecter l'équilibre du jeu.
          </Typography>
        </Alert>

        {/* Mode X */}
        <Box sx={{ mb: 3, p: 2, border: '1px solid #444', borderRadius: 2 }}>
          <FormControlLabel
            control={
              <Switch 
                checked={xMode} 
                onChange={(e) => setXmode(e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#ff4444',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#ff4444',
                  },
                }}
              />
            }
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <Speed color={xMode ? "error" : "disabled"} />
                <Typography>Mode X 🍆</Typography>
                {xMode && <Chip label="ACTIF" color="error" size="small" />}
              </Box>
            }
            sx={{ color: 'white' }}
          />
        </Box>

        <Divider sx={{ my: 2, borderColor: '#444' }} />

        {/* Niveau du joueur */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ color: '#ffc107', fontWeight: 'bold' }}>
            <SecurityUpdate sx={{ mr: 1, verticalAlign: 'middle' }} />
            Niveau du joueur
          </Typography>
          <Box sx={{ px: 2 }}>
            <Slider
              value={tempLevel}
              onChange={(_, value) => setTempLevel(value)}
              min={1}
              max={20}
              marks={[
                { value: 1, label: '1' },
                { value: 5, label: '5' },
                { value: 10, label: '10' },
                { value: 15, label: '15' },
                { value: 20, label: '20' }
              ]}
              valueLabelDisplay="on"
              sx={{
                color: '#ffc107',
                '& .MuiSlider-thumb': {
                  backgroundColor: '#ffc107',
                },
                '& .MuiSlider-track': {
                  backgroundColor: '#ffc107',
                },
                '& .MuiSlider-rail': {
                  backgroundColor: '#444',
                }
              }}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2, borderColor: '#444' }} />

        {/* Section Cheats */}
        <Typography variant="h6" sx={{ color: '#ff4444', mb: 2, fontWeight: 'bold' }}>
          <BugReport sx={{ mr: 1, verticalAlign: 'middle' }} />
          CHEATS & HACKS
        </Typography>

        {/* Argent */}
        <Box sx={{ mb: 3, p: 2, border: '1px dashed #ff4444', borderRadius: 2, backgroundColor: 'rgba(55, 255, 248, 0.15)' }}>
          <Typography variant="subtitle2" gutterBottom sx={{ color: '#ffaa00' }}>
            <AttachMoney sx={{ mr: 1, verticalAlign: 'middle' }} />
            Argent : {tempMoney.toLocaleString()}$
          </Typography>
          <Box display="flex" gap={1} mb={1}>
            <Button size="small" variant="outlined" onClick={() => quickAddMoney(100)} sx={{ color: '#4caf50', borderColor: '#4caf50' }}>
              +100$
            </Button>
            <Button size="small" variant="outlined" onClick={() => quickAddMoney(1000)} sx={{ color: '#4caf50', borderColor: '#4caf50' }}>
              +1K$
            </Button>
            <Button size="small" variant="outlined" onClick={() => quickAddMoney(10000)} sx={{ color: '#4caf50', borderColor: '#4caf50' }}>
              +10K$
            </Button>
            <Button size="small" variant="outlined" onClick={() => setTempMoney(0)} sx={{ color: '#f44336', borderColor: '#f44336' }}>
              Reset
            </Button>
          </Box>
          <TextField
            type="number"
            value={tempMoney}
            onChange={(e) => setTempMoney(Math.max(0, parseInt(e.target.value) || 0))}
            size="small"
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: '#444' },
                '&:hover fieldset': { borderColor: '#666' },
                '&.Mui-focused fieldset': { borderColor: '#ffc107' }
              }
            }}
          />
        </Box>
 {/* Engrais */}
        <Box sx={{ mb: 3, p: 2, border: '1px dashed #4caf50', borderRadius: 2, backgroundColor: 'rgba(231, 231, 41, 0.15)' }}>
          <Typography variant="subtitle2" gutterBottom sx={{ color: '#fcfcd0' }}>
            <Diamond sx={{ mr: 1, verticalAlign: 'middle' }} />
            Diamants : {tempDiamond}
          </Typography>
          <Box display="flex" gap={1} mb={1}>
            <Button size="small" variant="outlined" onClick={() => quickAddDiamond(5)} sx={{ color: '#4caf50', borderColor: '#4caf50' }}>
              +5
            </Button>
            <Button size="small" variant="outlined" onClick={() => quickAddDiamond(20)} sx={{ color: '#4caf50', borderColor: '#4caf50' }}>
              +20
            </Button>
            <Button size="small" variant="outlined" onClick={() => quickAddDiamond(100)} sx={{ color: '#4caf50', borderColor: '#4caf50' }}>
              +100
            </Button>
            <Button size="small" variant="outlined" onClick={() => setTempDiamond(0)} sx={{ color: '#f44336', borderColor: '#f44336' }}>
              Reset
            </Button>
          </Box>
          <TextField
            type="number"
            value={tempDiamond}
            onChange={(e) => setTempDiamond(Math.max(0, parseInt(e.target.value) || 0))}
            size="small"
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: '#444' },
                '&:hover fieldset': { borderColor: '#666' },
                '&.Mui-focused fieldset': { borderColor: '#4caf50' }
              }
            }}
          />
        </Box>
        {/* Engrais */}
        <Box sx={{ mb: 3, p: 2, border: '1px dashedrgb(136, 210, 139)', borderRadius: 2, backgroundColor: 'rgba(76, 175, 80, 0.15)' }}>
          <Typography variant="subtitle2" gutterBottom sx={{ color: '#4cff50' }}>
            <Grass sx={{ mr: 1, verticalAlign: 'middle' }} />
            Engrais : {tempEngrais}
          </Typography>
          <Box display="flex" gap={1} mb={1}>
            <Button size="small" variant="outlined" onClick={() => quickAddEngrais(5)} sx={{ color: '#4caf50', borderColor: '#4caf50' }}>
              +5
            </Button>
            <Button size="small" variant="outlined" onClick={() => quickAddEngrais(20)} sx={{ color: '#4caf50', borderColor: '#4caf50' }}>
              +20
            </Button>
            <Button size="small" variant="outlined" onClick={() => quickAddEngrais(100)} sx={{ color: '#4caf50', borderColor: '#4caf50' }}>
              +100
            </Button>
            <Button size="small" variant="outlined" onClick={() => setTempEngrais(0)} sx={{ color: '#f44336', borderColor: '#f44336' }}>
              Reset
            </Button>
          </Box>
          <TextField
            type="number"
            value={tempEngrais}
            onChange={(e) => setTempEngrais(Math.max(0, parseInt(e.target.value) || 0))}
            size="small"
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: '#444' },
                '&:hover fieldset': { borderColor: '#666' },
                '&.Mui-focused fieldset': { borderColor: '#4caf50' }
              }
            }}
          />
        </Box>

        <Divider sx={{ my: 2, borderColor: '#444' }} />

        {/* Reset Game */}
        <Box sx={{ p: 2, border: '2px solid #ff0000', borderRadius: 2, backgroundColor: 'rgba(255, 0, 0, 0.1)' }}>
          <Typography variant="subtitle1" gutterBottom sx={{ color: '#ff4444', fontWeight: 'bold' }}>
            <RestartAlt sx={{ mr: 1, verticalAlign: 'middle' }} />
            ZONE CRITIQUE
          </Typography>
          {!showResetConfirm ? (
            <Button
              variant="outlined"
              color="error"
              startIcon={<Warning />}
              onClick={() => setShowResetConfirm(true)}
              sx={{ 
                borderColor: '#ff4444',
                color: '#ff4444',
                '&:hover': {
                  borderColor: '#ff0000',
                  backgroundColor: 'rgba(255, 0, 0, 0.1)'
                }
              }}
            >
              Réinitialiser le jeu
            </Button>
          ) : (
            <Box>
              <Typography variant="body2" color="error" gutterBottom>
                ⚠️ ATTENTION ! Cette action supprimera TOUTE votre progression !
              </Typography>
              <Box display="flex" gap={1}>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={handleReset}
                  sx={{ fontWeight: 'bold' }}
                >
                  CONFIRMER LA SUPPRESSION
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setShowResetConfirm(false)}
                  sx={{ color: 'white', borderColor: '#666' }}
                >
                  Annuler
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ backgroundColor: '#1a1a1a', p: 2 }}>
        <Button 
          onClick={onClose}
          sx={{ color: '#999' }}
        >
          Annuler
        </Button>
        <Button 
          onClick={handleSave}
          variant="contained"
          sx={{
            background: 'linear-gradient(45deg, #ff4444, #cc0000)',
            '&:hover': {
              background: 'linear-gradient(45deg, #cc0000, #990000)',
            }
          }}
        >
          Sauvegarder
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfigDialog;