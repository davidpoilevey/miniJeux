import { Box, Chip, Paper, styled, Typography } from "@mui/material"
import { playersByPosition } from "./beloteUtils";

export const SUIT_SYMBOL = {
  coeur: '♥',
  carreau: '♦',
  trèfle: '♣',
  pique: '♠'
};

export const getSuitSymbol = suit => SUIT_SYMBOL[suit] || '?';

export const getCardColor = suit =>
  suit === 'coeur' || suit === 'carreau'
    ? '#c62828'
    : '#1e1e1e';


const TopBar = styled(Paper)({
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  padding: '12px 24px',
  backgroundColor: '#2d5a3d',
  color: 'white',
  boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
});
export const BeloteBar = ({
  teams,
  gamePhase,
  currentRound,
  atout,
  couleurDemandee,
  currentPlayer,
  currentDealer,
  taker
}) => {
  return (
    <TopBar elevation={4}>
      {/* TEAM 1 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h6">{teams.team1.name}</Typography>
        <Chip
          label={teams.team1.score}
          sx={{
            bgcolor: '#5a8a6d',
            color: 'white',
            fontWeight: 'bold'
          }}
        />
      </Box>

      {/* CENTRE */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 2,
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}
      >
       
        {/* JOUEUR COURANT */}
        <Box sx={{display:'flex',flexDirection:'column'}}>
          <Typography variant="caption">Doit jouer</Typography>
        
        <Chip
          label={`▶ ${playersByPosition[currentPlayer]?.name}`}
          variant="outlined"
           color="primary"
          size="small"
        />
        </Box>

        {/* DONNEUR */}
       <Box sx={{display:'flex',flexDirection:'column'}}>
          <Typography variant="caption">Donneur</Typography>
        <Chip
          label={`🎲 ${playersByPosition[currentDealer].name}`}
          variant="outlined"
          color="primary"
          size="small"
        /></Box>


        <Typography variant="body2">
          Pli {currentRound}/8
        </Typography>

        {/* ATOUT */}
        {atout && (
          <Box sx={{display:'flex',flexDirection:'column'}}>
          <Typography variant="caption">Atout</Typography>
       <Chip
            label={getSuitSymbol(atout)}
            sx={{
              fontSize: '22px',
              fontWeight: 'bold',
              color: getCardColor(atout),
              bgcolor: '#f5f5f5'
            }}
          />
          </Box>
        )}

        {/* PRENEUR */}
        {taker && (
            <Box sx={{display:'flex',flexDirection:'column'}}>
          <Typography variant="caption">Preneur</Typography>
       <Chip
            label={`🂡 ${playersByPosition[taker].name}`}
            sx={{
              bgcolor: '#8b1123',
              color: 'white',
              fontWeight: 'bold'
            }}
            size="small"
          /></Box>
        )}
        {/* COULEUR DEMANDEE */}
        {couleurDemandee && (
             <Box sx={{display:'flex',flexDirection:'column'}}>
          <Typography variant="caption">Couleur demandée</Typography>
      <Chip
            label={getSuitSymbol(couleurDemandee)}
            sx={{
              fontSize: '20px',
              color: getCardColor(couleurDemandee),
              bgcolor: '#e0e0e0'
            }}
          /></Box>
        )}

      </Box>

      {/* TEAM 2 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h6">{teams.team2.name}</Typography>
        <Chip
          label={teams.team2.score}
          sx={{
            bgcolor: '#5a8a6d',
            color: 'white',
            fontWeight: 'bold'
          }}
        />
      </Box>
    </TopBar>
  );
};
