import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogActions,
  Button,
  Box,
  Slider,
  Typography,
  LinearProgress,
  Chip,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { calculateHandStrength, evaluateHand } from './pokUtils';
import { Carte } from './Card';

const StyledDialog = styled(Dialog)({
  '& .MuiDialog-paper': {
    backgroundColor: '#1a2634',
    color: 'white',
    minWidth: '500px',
    maxWidth: '600px',
    borderRadius: '20px',
    border: '3px solid #ffd700',
    boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
  }
});

const SectionBox = styled(Box)({
  padding: '16px',
  backgroundColor: 'rgba(45, 90, 61, 0.3)',
  borderRadius: '12px',
  marginBottom: '12px',
});

const CardsRow = styled(Box)({
  display: 'flex',
  gap: '8px',
  justifyContent: 'center',
  flexWrap: 'wrap',
  marginTop: '12px',
});

const StyledLinearProgress = styled(LinearProgress)(({ strengthvalue }) => {
  let color = '#f44336'; // Rouge par défaut
  if (strengthvalue > 70) color = '#4caf50'; // Vert
  else if (strengthvalue > 40) color = '#ff9800'; // Orange
  
  return {
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    '& .MuiLinearProgress-bar': {
      backgroundColor: color,
      borderRadius: 6,
    }
  };
});

const ActionButton = styled(Button)(({ actiontype }) => {
  const colors = {
    fold: { bg: '#c41e3a', hover: '#8b1123' },
    check: { bg: '#5a8a6d', hover: '#3d6a4d' },
    call: { bg: '#2e7d32', hover: '#1b5e20' },
    raise: { bg: '#f57c00', hover: '#e65100' },
    allin: { bg: '#d32f2f', hover: '#b71c1c' },
  };
  
  const color = colors[actiontype] || colors.check;
  
  return {
    backgroundColor: color.bg,
    color: 'white',
    fontWeight: 'bold',
    fontSize: '16px',
    padding: '12px 24px',
    minWidth: '110px',
    flex: 1,
    '&:hover': {
      backgroundColor: color.hover,
      transform: 'scale(1.05)',
    },
    transition: 'all 0.2s ease',
    '&:disabled': {
      backgroundColor: '#666',
      color: '#999',
    }
  };
});

const RaiseSlider = styled(Slider)({
  color: '#f57c00',
  height: 8,
  '& .MuiSlider-thumb': {
    height: 24,
    width: 24,
    backgroundColor: '#fff',
    border: '2px solid currentColor',
    '&:focus, &:hover, &.Mui-active': {
      boxShadow: '0 0 0 8px rgba(245, 124, 0, 0.16)',
    },
  },
  '& .MuiSlider-track': {
    height: 8,
    borderRadius: 4,
  },
  '& .MuiSlider-rail': {
    height: 8,
    borderRadius: 4,
    opacity: 0.5,
    backgroundColor: '#bfbfbf',
  },
});

const PokerActionsDialog = ({ 
  actions = [], 
  onAction,
  playerHoleCards = [],
  communityCards = [],
  pot = 0,
  currentBet = 0,
  playerChips = 0
}) => {
  const [raiseAmount, setRaiseAmount] = useState(0);
  const [showRaiseSlider, setShowRaiseSlider] = useState(false);

  const raiseAction = actions.find(a => a.type === 'raise');
  
  // Évaluer la main du joueur
  const handEvaluation = playerHoleCards.length > 0 
    ? evaluateHand(playerHoleCards, communityCards)
    : null;
    
  const handStrength = playerHoleCards.length > 0
    ? calculateHandStrength(playerHoleCards, communityCards)
    : 0;

  // Initialiser le montant de la relance au minimum quand on affiche le slider
  React.useEffect(() => {
    if (raiseAction && showRaiseSlider && raiseAmount === 0) {
      setRaiseAmount(raiseAction.minAmount);
    }
  }, [showRaiseSlider, raiseAction]);

  const handleActionClick = (action) => {
    if (action.type === 'raise') {
      setShowRaiseSlider(true);
    } else {
      onAction(action.type, action.amount);
      setShowRaiseSlider(false);
      setRaiseAmount(0);
    }
  };

  const handleRaiseConfirm = () => {
    onAction('raise', raiseAmount);
    setShowRaiseSlider(false);
    setRaiseAmount(0);
  };

  const handleRaiseCancel = () => {
    setShowRaiseSlider(false);
    setRaiseAmount(0);
  };

  const getActionLabel = (action) => {
    switch(action.type) {
      case 'fold': return 'Fold';
      case 'check': return 'Check';
      case 'call': return `Call ${action.amount}€`;
      case 'raise': return 'Raise';
      case 'allin': return `All-in (${action.amount}€)`;
      default: return action.label;
    }
  };

  const getRecommendation = () => {
    if (!handEvaluation) return '';
    
    if (handStrength >= 80) return '🔥 Main excellente - Relancer fortement !';
    if (handStrength >= 60) return '💪 Bonne main - Relancer ou suivre';
    if (handStrength >= 40) return '👍 Main correcte - Suivre prudemment';
    if (handStrength >= 25) return '⚠️ Main faible - Attention';
    return '❌ Main très faible - Se coucher recommandé';
  };

  const getStrengthColor = () => {
    if (handStrength >= 70) return '#4caf50';
    if (handStrength >= 40) return '#ff9800';
    return '#f44336';
  };

  return (
    <StyledDialog 
      open={actions.length > 0} 
      disableEscapeKeyDown
      maxWidth="md"
    >
      <DialogContent sx={{ p: 3 }}>
        {!showRaiseSlider ? (
          <>
            {/* Board (Cartes communes) */}
            <SectionBox>
              <Typography variant="body2" sx={{ color: '#ffd700', fontWeight: 'bold', mb: 1 }}>
                CARTES COMMUNES
              </Typography>
              {communityCards.length === 0 ? (
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', textAlign: 'center', py: 2 }}>
                  En attente du flop...
                </Typography>
              ) : (
                <CardsRow>
                  {communityCards.map((card, index) => (
                    <Box key={index} sx={{ transform: 'scale(0.8)' }}>
                      <Carte card={card} retourne={false} />
                    </Box>
                  ))}
                </CardsRow>
              )}
            </SectionBox>

            {/* Main du joueur */}
            <SectionBox>
              <Typography variant="body2" sx={{ color: '#ffd700', fontWeight: 'bold', mb: 1 }}>
                VOTRE MAIN
              </Typography>
              <CardsRow>
                {playerHoleCards.map((card, index) => (
                  <Box key={index}>
                    <Carte card={card} retourne={false} />
                  </Box>
                ))}
              </CardsRow>
              
              {handEvaluation && (
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" sx={{ color: getStrengthColor(), fontWeight: 'bold' }}>
                      {handEvaluation.handName}
                    </Typography>
                    <Chip 
                      label={`${handStrength}%`}
                      sx={{ 
                        backgroundColor: getStrengthColor(),
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '16px'
                      }}
                    />
                  </Box>
                  
                  <StyledLinearProgress 
                    variant="determinate" 
                    value={handStrength} 
                    strengthvalue={handStrength}
                  />
                  
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mt: 1, 
                      fontStyle: 'italic', 
                      color: 'rgba(255,255,255,0.8)',
                      textAlign: 'center'
                    }}
                  >
                    {getRecommendation()}
                  </Typography>
                </Box>
              )}
            </SectionBox>

            {/* Infos de la partie */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-around', mb: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                  Pot
                </Typography>
                <Typography variant="h6" sx={{ color: '#ffd700', fontWeight: 'bold' }}>
                  {pot}€
                </Typography>
              </Box>
              
              <Divider orientation="vertical" flexItem sx={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                  À suivre
                </Typography>
                <Typography variant="h6" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
                  {currentBet}€
                </Typography>
              </Box>
              
              <Divider orientation="vertical" flexItem sx={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                  Vos jetons
                </Typography>
                <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                  {playerChips}€
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.1)', my: 2 }} />

            {/* Boutons d'action */}
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 2, 
                textAlign: 'center',
                color: '#ffd700',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
            >
              Votre décision
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              gap: 2,
              flexWrap: 'wrap'
            }}>
              {actions.map((action, index) => (
                <ActionButton
                  key={index}
                  actiontype={action.type}
                  variant="contained"
                  onClick={() => handleActionClick(action)}
                  size="large"
                >
                  {getActionLabel(action)}
                </ActionButton>
              ))}
            </Box>
          </>
        ) : (
          /* Mode Raise */
          <Box sx={{ px: 2 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 3, 
                textAlign: 'center',
                color: '#ffd700',
                fontWeight: 'bold'
              }}
            >
              Choisissez le montant de la relance
            </Typography>

            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 3 
            }}>
              <Chip 
                label={`Min: ${raiseAction.minAmount}€`} 
                sx={{ backgroundColor: '#5a8a6d', color: 'white', fontWeight: 'bold' }}
              />
              <Chip 
                label={`${raiseAmount}€`} 
                sx={{ 
                  backgroundColor: '#f57c00', 
                  color: 'white',
                  fontSize: '22px',
                  fontWeight: 'bold',
                  padding: '12px 8px',
                  height: 'auto'
                }}
              />
              <Chip 
                label={`Max: ${raiseAction.maxAmount}€`} 
                sx={{ backgroundColor: '#5a8a6d', color: 'white', fontWeight: 'bold' }}
              />
            </Box>
            
            <RaiseSlider
              value={raiseAmount}
              onChange={(e, newValue) => setRaiseAmount(newValue)}
              min={raiseAction.minAmount}
              max={raiseAction.maxAmount}
              step={raiseAction.minAmount >= 100 ? 50 : raiseAction.minAmount >= 20 ? 10 : 5}
              marks={[
                { value: raiseAction.minAmount, label: `${raiseAction.minAmount}€` },
                { value: raiseAction.maxAmount, label: `${raiseAction.maxAmount}€` },
              ]}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value}€`}
            />
            
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              justifyContent: 'center',
              mt: 4 
            }}>
              <ActionButton
                actiontype="fold"
                onClick={handleRaiseCancel}
              >
                Annuler
              </ActionButton>
              <ActionButton
                actiontype="raise"
                onClick={handleRaiseConfirm}
                sx={{ flex: 2 }}
              >
                Relancer {raiseAmount}€
              </ActionButton>
            </Box>
          </Box>
        )}
      </DialogContent>
    </StyledDialog>
  );
};

export default PokerActionsDialog;