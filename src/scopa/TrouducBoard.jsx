import { GameBoardTrouduc } from "../belote/GameBoard";
import { Box, Typography, Button, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { getCardPower, groupByRank, sortHandDesc } from "./trouducUtils";
import { Carte } from "../poker/Card";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';


export const TrouducBoard = ({ playerHands, trouducState,handlePass,
    playersCount, setPlayersCount,setTrouducState, initPlayers, handleCardClick, ...props }) => {

    const playerSortedHands = {...playerHands, bottom:sortHandDesc(playerHands.bottom)};

      const grouped = groupByRank(playerSortedHands.bottom);
    
      const playables = Object.entries(grouped)
        .map(([value, cards]) => ({
          value: Number(value),
          cards
        }))
        .filter(play => {
          if (!trouducState.lastPlay) return true;
          return (
            play.cards.length === trouducState.lastPlay.count &&
            play.value > trouducState.lastPlay.rankValue
          );
        }).flatMap(obj => obj.cards);

    return <>
    {trouducState.gamePhase === 'intro'?(
  <TrouducIntroScreen
    playersCount={playersCount}
    setPlayersCount={setPlayersCount}
    onStart={() => {
      initPlayers(playersCount); // bottom, left, top, right, etc.
      setTrouducState(s => ({
        ...s,
        gamePhase: 'distribution'
      }));
    }}
  />
):
<GameBoardTrouduc playerHands={playerSortedHands}
handleCardClick={handleCardClick} passButton={()=>{handlePass('bottom')}}
playable={playables}
currentDealer={trouducState.hierarchy.president} currentPlayer={trouducState.currentPlayer}
passes={trouducState.passes}>

        <TrouducDeck {...props} />
    </GameBoardTrouduc>
    }

</>
}


export const TrouducDeck = ({ tableCards }) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        gap: '-40px'
      }}
    >
      {tableCards.map((card, i) => (
        <Box
          key={i}
          sx={{
            transform: `translateX(${i * -30}px) rotate(${(i - 1) * 5}deg)`,
            zIndex: i
          }}
        >
          <Carte card={card} retourne={false} />
        </Box>
      ))}
    </Box>
  );
};

export const TrouducIntroScreen = ({
  playersCount,
  setPlayersCount,
  onStart
}) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'radial-gradient(circle at center, #3f6f54 0%, #2f4f3e 70%, #243b30 100%)',
        color: 'white'
      }}
    >
      <Box
        sx={{
          width: 420,
          bgcolor: 'rgba(0,0,0,0.45)',
          borderRadius: 3,
          p: 3,
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
        }}
      >
        <Typography variant="h4" sx={{ mb: 1 }}>
          🃏 Le Trouduc
        </Typography>

        <Typography sx={{ opacity: 0.9, mb: 2 }}>
          Débarrassez-vous de vos cartes le plus vite possible.<br />
          Le premier devient <b>Président</b>, le dernier… 😈
        </Typography>

        <Typography sx={{ mb: 1 }}>
          Règles rapides :
        </Typography>

        <Typography sx={{ fontSize: '0.9rem', opacity: 0.85, mb: 2 }}>
          • Jouez des cartes identiques (simple, paire, brelan…)<br />
          • Il faut battre la valeur précédente<br />
          • Le <b>2</b> est la carte la plus forte<br />
          • Quand tout le monde passe, le gagnant relance
        </Typography>

        {/* Nombre de joueurs */}
        <Typography sx={{ mb: 1 }}>
          Nombre de joueurs
        </Typography>

        <ToggleButtonGroup color="primary"
          value={playersCount}
          exclusive size="large"
          onChange={(_, v) => v && setPlayersCount(v)}
          sx={{ mb: 2 ,backgroundColor:'#d28272'}}
        >
          <ToggleButton  value={2}>2</ToggleButton>
          <ToggleButton  value={3}>3</ToggleButton>
          <ToggleButton value={4}>4</ToggleButton>
          <ToggleButton value={5}>5</ToggleButton>
          <ToggleButton  value={6}>6</ToggleButton>
        </ToggleButtonGroup>

        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={onStart}
          sx={{
            bgcolor: '#5a8a6d',
            fontWeight: 'bold',
            '&:hover': { bgcolor: '#4a755c' }
          }}
        >
          ▶️ Commencer la partie
        </Button>
      </Box>
    </Box>
  );
};

/**role: 'president' | 'vicePresident'
received: Card[]
toGive: Card[]
hand: Card[]
onSelect(card)
onConfirm() */
export const TrouducDialog=({exchangeData, role= 'president' , received,toGive, hand
    , onSelect,onConfirm})=>{

    if(exchangeData!=null) //role, received, toGive
    {
received=exchangeData.received;
toGive=exchangeData.toGive;
role=exchangeData.role
    }

    return <Dialog open>
  <DialogTitle>
    {role === 'president' ? '👑 Échange du Président' : '🥈 Échange du Vice-Président'}
  </DialogTitle>

  <DialogContent>
    <Typography>
      Cartes reçues :
    </Typography>

    <Box sx={{ display: 'flex', gap: 1 }}>
      {received.map(c => (
        <Carte key={c.id} card={c} />
      ))}
    </Box>

    <Typography sx={{ mt: 2 }}>
      Sélectionnez {received.length} carte(s) à rendre :
    </Typography>

    <Box sx={{ display: 'flex', gap: 1 }}>
      {hand.map(card => (
        <Box
          key={card.id}
          onClick={() => onSelect(card)}
          sx={{
            opacity: toGive.includes(card) ? 0.5 : 1,
            cursor: 'pointer'
          }}
        >
          <Carte card={card} />
        </Box>
      ))}
    </Box>
  </DialogContent>

  <DialogActions>
    <Button
      disabled={toGive.length !== received.length}
      onClick={onConfirm}
    >
      Valider
    </Button>
  </DialogActions>
</Dialog>

}
export const TrouducEndRoundDialog = ({
  open,
  hierarchy,
  playersByPosition,
  onNextRound
}) => {
  if (!hierarchy) return null;

  const Row = ({ emoji, role, player }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
      <Typography fontSize="1.5rem">{emoji}</Typography>
      <Typography sx={{ minWidth: 130 }}>{role}</Typography>
      <Typography fontWeight="bold">
        {playersByPosition[player]?.name}
      </Typography>
    </Box>
  );

  return (
    <Dialog open={open} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ textAlign: 'center' }}>
        🏁 Fin du round
      </DialogTitle>

      <DialogContent>
        <Row emoji="👑" role="Président" player={hierarchy.president} />
        <Row emoji="🥈" role="Vice-président" player={hierarchy.vicePresident} />
        <Row emoji="😐" role="Vice-trouduc" player={hierarchy.viceTrouduc} />
        <Row emoji="💩" role="Trouduc" player={hierarchy.trouduc} />
      </DialogContent>

      <DialogActions>
        <Button
          fullWidth
          variant="contained"
          onClick={onNextRound}
          sx={{
            bgcolor: '#5a8a6d',
            '&:hover': { bgcolor: '#4a755c' }
          }}
        >
          ▶️ Manche suivante
        </Button>
      </DialogActions>
    </Dialog>
  );
};


export const TrouducFeedbackDialog = ({ exchange, onClose }) => {
  if (!exchange) return null;

  const { given, received } = exchange;

  return (
    <Dialog open onClose={onClose}>
      <DialogTitle sx={{ textAlign: 'center' }}>
        💩 Vous êtes le Trouduc
      </DialogTitle>

      <DialogContent>
        <Typography sx={{ mb: 1 }}>
          Vous avez donné :
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          {given.map((c, i) => (
            <Carte key={'g'+i} card={c} />
          ))}
        </Box>

        <Typography sx={{ mb: 1 }}>
          Vous avez reçu :
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {received.map((c, i) => (
            <Carte key={'r'+i} card={c} />
          ))}
        </Box>

        <Typography
          sx={{
            mt: 2,
            fontStyle: 'italic',
            color: '#aaa',
            textAlign: 'center'
          }}
        >
          Courage… la roue tourne 😉
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};
