import React from 'react';
import { 
  Dialog, 
  DialogContent,
  Button,
  Box,
  Typography,
  Paper,
  Divider,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { evaluateHand } from './pokUtils';
import { Carte } from './Card';
import { getPlayerName } from '../belote/BiddingDialog';

const StyledDialog = styled(Dialog)({
  '& .MuiDialog-paper': {
    backgroundColor: '#1a2634',
    color: 'white',
    minWidth: '700px',
    maxWidth: '900px',
    borderRadius: '20px',
    border: '3px solid #ffd700',
    boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
  }
});

const WinnerBox = styled(Paper)({
  backgroundColor: 'rgba(255, 215, 0, 0.15)',
  border: '2px solid #ffd700',
  borderRadius: '16px',
  padding: '20px',
  marginBottom: '20px',
  textAlign: 'center',
});

const PlayerHandBox = styled(Paper)(({ iswinner }) => ({
  backgroundColor: iswinner ? 'rgba(76, 175, 80, 0.2)' : 'rgba(45, 90, 61, 0.3)',
  border: iswinner ? '2px solid #4caf50' : '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  padding: '16px',
  marginBottom: '12px',
}));

const CommunityCardsBox = styled(Box)({
  display: 'flex',
  gap: '8px',
  justifyContent: 'center',
  flexWrap: 'wrap',
  padding: '16px',
  backgroundColor: 'rgba(45, 90, 61, 0.3)',
  borderRadius: '12px',
  marginBottom: '20px',
});

const PlayerCardsRow = styled(Box)({
  display: 'flex',
  gap: '8px',
  justifyContent: 'center',
  marginTop: '8px',
});

const ContinueButton = styled(Button)({
  backgroundColor: '#4caf50',
  color: 'white',
  fontWeight: 'bold',
  fontSize: '18px',
  padding: '12px 48px',
  borderRadius: '12px',
  '&:hover': {
    backgroundColor: '#388e3c',
    transform: 'scale(1.05)',
  },
  transition: 'all 0.2s ease',
});

const ShowdownPanel = ({ 
  open,
  showdownInfo,
  onContinue
}) => {
  if (!showdownInfo) return null;

  const { 
    winners, 
    potWon, 
    potShare,
    reason,
    playerHands,
    finalCommunityCards,
    activePlayers 
  } = showdownInfo;


  const isWinner = (player) => winners.includes(player);

  // Évaluer toutes les mains des joueurs actifs
  const playerEvaluations = {};
  activePlayers.forEach(player => {
    playerEvaluations[player] = evaluateHand(
      playerHands[player], 
      finalCommunityCards
    );
  });

  const getWinnerText = () => {
    if (reason === 'allfold') {
      return `${getPlayerName(winners[0])} remporte ${potWon}€ !`;
    }
    
    if (winners.length === 1) {
      return `${getPlayerName(winners[0])} remporte ${potWon}€ !`;
    }
    
    return `Égalité ! ${winners.map(w => getPlayerName(w)).join(' et ')} se partagent ${potWon}€`;
  };

  const getWinnerSubtext = () => {
    if (reason === 'allfold') {
      return 'Tous les autres joueurs se sont couchés';
    }
    
    if (winners.length === 1) {
      const evaluation = playerEvaluations[winners[0]];
      return `avec ${evaluation.handName}`;
    }
    
    const evaluation = playerEvaluations[winners[0]];
    return `avec ${evaluation.handName} - ${potShare}€ chacun`;
  };

  return (
    <StyledDialog 
      open={open} 
      maxWidth="md"
      disableEscapeKeyDown
    >
      <DialogContent sx={{ p: 4 }}>
        {/* Titre et gagnant(s) */}
        <WinnerBox elevation={6}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <EmojiEventsIcon sx={{ fontSize: 60, color: '#ffd700' }} />
          </Box>
          
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 'bold', 
              color: '#ffd700',
              mb: 1,
              textShadow: '0 0 10px rgba(255,215,0,0.5)'
            }}
          >
            {getWinnerText()}
          </Typography>
          
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'rgba(255,255,255,0.9)',
              fontStyle: 'italic'
            }}
          >
            {getWinnerSubtext()}
          </Typography>
        </WinnerBox>

        {/* Bouton continuer */}
        <Box sx={{ display: 'flex', justifyContent: 'center', m: 4 }}>
          <ContinueButton
            variant="contained"
            size="large"
            onClick={onContinue}
          >
            Partie suivante →
          </ContinueButton>
        </Box>

        {/* Cartes communes */}
        {reason !== 'allfold' && finalCommunityCards.length > 0 && (
          <>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#ffd700', 
                fontWeight: 'bold',
                mb: 1,
                textAlign: 'center'
              }}
            >
              BOARD FINAL
            </Typography>
            <CommunityCardsBox>
              {finalCommunityCards.map((card, index) => (
                <Box key={index} sx={{ transform: 'scale(0.85)' }}>
                  <Carte card={card} retourne={false} />
                </Box>
              ))}
            </CommunityCardsBox>
          </>
        )}

        <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.2)', my: 3 }} />

        {/* Mains de tous les joueurs actifs */}
        <Typography 
          variant="body1" 
          sx={{ 
            color: '#ffd700', 
            fontWeight: 'bold',
            mb: 2,
            textAlign: 'center'
          }}
        >
          MAINS DES JOUEURS
        </Typography>

        {activePlayers.map(player => {
          const evaluation = playerEvaluations[player];
          const winner = isWinner(player);
          
          return (
            <PlayerHandBox key={player} iswinner={winner ? 1 : 0} elevation={winner ? 4 : 1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: winner ? '#4caf50' : 'white'
                    }}
                  >
                    {getPlayerName(player)}
                  </Typography>
                  {winner && (
                    <EmojiEventsIcon sx={{ color: '#ffd700', fontSize: 24 }} />
                  )}
                </Box>
                
                <Chip 
                  label={evaluation.handName}
                  sx={{ 
                    backgroundColor: winner ? '#4caf50' : '#5a8a6d',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}
                />
              </Box>

              <PlayerCardsRow>
                {playerHands[player].map((card, index) => (
                  <Box key={index} sx={{ transform: 'scale(0.9)' }}>
                    <Carte card={card} retourne={false} />
                  </Box>
                ))}
              </PlayerCardsRow>

              {evaluation.details && Object.keys(evaluation.details).length > 0 && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mt: 1,
                    color: 'rgba(255,255,255,0.7)',
                    fontStyle: 'italic',
                    textAlign: 'center'
                  }}
                >
                  {/* Afficher les détails pertinents selon le type de main */}
                  {evaluation.details.pair && `Paire de ${getCardName(evaluation.details.pair)}`}
                  {evaluation.details.threeOfKind && `Brelan de ${getCardName(evaluation.details.threeOfKind)}`}
                  {evaluation.details.quadValue && `Carré de ${getCardName(evaluation.details.quadValue)}`}
                </Typography>
              )}
            </PlayerHandBox>
          );
        })}

      </DialogContent>
    </StyledDialog>
  );
};

// Fonction helper pour afficher les noms de cartes
const getCardName = (value) => {
  const names = {
    14: 'As',
    13: 'Roi',
    12: 'Dame',
    11: 'Valet',
    10: '10',
    9: '9',
    8: '8',
    7: '7',
    6: '6',
    5: '5',
    4: '4',
    3: '3',
    2: '2'
  };
  return names[value] || value;
};

export default ShowdownPanel;