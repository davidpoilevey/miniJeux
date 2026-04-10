import React from 'react';
import { Box, Paper, Typography, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Carte } from './Card';
import { getPlayerName } from '../belote/BiddingDialog';

const DeckContainer = styled(Box)({
  display: 'flex',  position: 'absolute',
    top: '200px',
    left: '50%',
    transform: 'translateX(-50%)',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '24px',
  padding: '20px',
});

const PotDisplay = styled(Paper)({
  backgroundColor: '#2d5a3d',
  color: 'white',
  padding: '16px 32px',
 
  borderRadius: '12px',
  boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
  minWidth: '200px',
  textAlign: 'center',
});

const CommunityCardsZone = styled(Box)({
  display: 'flex',
  gap: '12px',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '140px',
  padding: '20px',
  backgroundColor: 'rgba(45, 90, 61, 0.3)',
  borderRadius: '16px',
  border: '2px solid rgba(255, 255, 255, 0.2)',
});

const BetsDisplay = styled(Box)({
  display: 'flex',
  gap: '16px',
  flexWrap: 'wrap',
  justifyContent: 'center',
});

const PlayerBet = styled(Chip)({
  backgroundColor: '#5a8a6d',
  color: 'white',
  fontWeight: 'bold',
  fontSize: '14px',
  padding: '8px 4px',
  '& .MuiChip-label': {
    padding: '0 12px',
  },
});

const PhaseIndicator = styled(Typography)({
  color: '#ffd700',
  fontWeight: 'bold',
  fontSize: '18px',
  textTransform: 'uppercase',
  letterSpacing: '2px',
  textShadow: '0 2px 4px rgba(0,0,0,0.5)',
});

const PokerDeck = ({ 
  communityCards = [], 
  gamePhase = 'preflop',
  pot = 0,
  currentBets = { bottom: 0, left: 0, top: 0, right: 0 }
}) => {
  
  const getPhaseLabel = () => {
    switch(gamePhase) {
      case 'distribution': return 'Distribution...';
      case 'preflop': return 'Pre-Flop';
      case 'flop': return 'Flop';
      case 'turn': return 'Turn';
      case 'river': return 'River';
      case 'showdown': return 'Showdown !';
      default: return '';
    }
  };
  

  // Calculer le pot total (pot + mises en cours)
  const totalPot = pot + Object.values(currentBets).reduce((sum, bet) => sum + bet, 0);

  return (
    <DeckContainer>
      {/* Indicateur de phase */}

      {/* Pot principal */}
      <PotDisplay elevation={6}>
        <Box sx={{display:'flex', gap:3, alignItems:'center'}}>
 <PhaseIndicator variant="h5">
        {getPhaseLabel()}
      </PhaseIndicator>
        <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
          Pot Total
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          {totalPot} €
        </Typography>
        </Box>
         {/* Mises en cours */}
      {Object.values(currentBets).some(bet => bet > 0) && (
        <Box sx={{ mt: 2 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(255,255,255,0.7)', 
              mb: 1, 
              textAlign: 'center',
              textTransform: 'uppercase',
              fontSize: '12px',
              letterSpacing: '1px'
            }}
          >
            Mises en cours
          </Typography>
          <BetsDisplay>
            {Object.entries(currentBets)
              .filter(([_, bet]) => bet > 0)
              .map(([player, bet]) => (
                <PlayerBet 
                  key={player}
                  label={`${getPlayerName(player)}: ${bet} €`}
                  size="medium"
                />
              ))
            }
          </BetsDisplay>
        </Box>
      )}
     
      </PotDisplay>

      {/* Cartes communes */}
      <CommunityCardsZone>
        {communityCards.length === 0 && gamePhase !== 'distribution' && (
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
            En attente du flop...
          </Typography>
        )}
        
        {communityCards.map((card, index) => (
          <Box 
            key={index}
            sx={{
              animation: 'cardAppear 0.3s ease-out',
              animationDelay: `${index * 0.1}s`,
              animationFillMode: 'backwards',
              '@keyframes cardAppear': {
                from: {
                  opacity: 0,
                  transform: 'translateY(-20px) rotateY(90deg)',
                },
                to: {
                  opacity: 1,
                  transform: 'translateY(0) rotateY(0deg)',
                }
              }
            }}
          >
            <Carte card={card} retourne={false} />
          </Box>
        ))}

        {/* Séparateur visuel entre flop et turn */}
        {communityCards.length >= 4 && (
          <Box sx={{ 
            width: '2px', 
            height: '80px', 
            backgroundColor: 'rgba(255,255,255,0.3)',
            margin: '0 8px'
          }} />
        )}

        {/* Séparateur visuel entre turn et river */}
        {communityCards.length === 5 && (
          <Box sx={{ 
            width: '2px', 
            height: '80px', 
            backgroundColor: 'rgba(255,255,255,0.3)',
            margin: '0 8px'
          }} />
        )}
      </CommunityCardsZone>

     
    </DeckContainer>
  );
};

export default PokerDeck;