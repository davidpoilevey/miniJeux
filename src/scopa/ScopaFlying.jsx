import { motion } from 'framer-motion';
import { Carte } from '../poker/Card';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Divider,
  styled
} from '@mui/material';
import { useMemo } from 'react';

const PLAYER_ORIGINS = {
  bottom: { x: 0, y: 160 },
  top: { x: 0, y: -160 },
  left: { x: -220, y: 0 },
  right: { x: 220, y: 0 }
};

export const FlyingCard = ({ player, card, onDone }) => {
  const origin = PLAYER_ORIGINS[player];

  return (
    <motion.div
      initial={{ x: origin.x, y: origin.y, scale: 0.8 }}
      animate={{ x: 0, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      onAnimationComplete={onDone}
      style={{ position: 'absolute', zIndex: 50 }}
    >
      <Carte card={card} retourne={false} />
    </motion.div>
  );
};

const TypoScore = styled(Typography)({
   display:'flex', gap:2, alignItems:'center'
});

const TeamCard = ({ team,wins,  roundPoints, isWinner }) => {
  const cards = team.captures;
  const carreaux = cards.filter(c => c.suit === 'carreau').length;
  const sevens = cards.filter(c => c.rank.value === 7).length;
  const has7Carreau = cards.some(
    c => c.suit === 'carreau' && c.rank.value === 7
  );

  return (
    <Box
      sx={{
        bgcolor: isWinner ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.08)',
        border: isWinner ? '2px solid gold' : '1px solid rgba(255,255,255,0.2)',
        borderRadius: 2,
        padding: 2,
        boxShadow: isWinner ? '0 0 20px rgba(255,215,0,0.4)' : 'none'
      }}
    >
      <Typography variant="h6" sx={{ mb: 1 }}>
        {team.name} {isWinner && '🏆'}
      </Typography>
<TypoScore >
  🃏 Cartes : {cards.length}
  {wins.cards && <Stars count={1} />}
</TypoScore>

<TypoScore>
  ♦️ Carreaux : {carreaux}
  {wins.carreaux && <Stars count={1} />}
</TypoScore>

<TypoScore>
  7️⃣ Sept : {sevens}
  {wins.sevens && <Stars count={1} />}
</TypoScore>

<TypoScore>
  ♦️7 : {has7Carreau && '✔️'}
  {wins.sevenCarreau && <Stars count={1} />}
</TypoScore>

<TypoScore>
  ✨ Scopa : {team.scopa}
  {team.scopa > 0 && <Stars count={team.scopa} />}
</TypoScore>

      <Divider sx={{ my: 1, bgcolor: 'rgba(255,255,255,0.2)' }} />

     <Box
  sx={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    mt: 1
  }}
>
  <Box>
    <Typography sx={{ fontWeight: 'bold', fontSize: '1.3rem' }}>
      ➕ {roundPoints} points
    </Typography>
    <Typography sx={{ opacity: 0.85 }}>
      Total : {team.score}
    </Typography>
  </Box>

  <Stars
    big={isWinner}
    count={team.scopa}
  />
</Box>

    </Box>
  );
};

export const ScopaRoundSummary = ({
  open,
  teams,
  roundPoints,
  onNextRound
}) => {
  const winner =
    roundPoints.team1 > roundPoints.team2
      ? 'team1'
      : roundPoints.team2 > roundPoints.team1
      ? 'team2'
      : null;
      const wins = useMemo(() => computeRoundWins(teams), [teams]);


  return (
    <Dialog
      open={open}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: '#2f4f3e',
          color: 'white',
          borderRadius: 3
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', fontSize: '1.5rem' }}>
        🃏 Fin de manche – Scopa
      </DialogTitle>

      <DialogContent>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 2
          }}
        >
          <TeamCard
            team={teams.team1}
  wins={wins.team1}
            roundPoints={roundPoints.team1}
            isWinner={winner === 'team1'}
          />
          <TeamCard
  wins={wins.team2}
            team={teams.team2}
            roundPoints={roundPoints.team2}
            isWinner={winner === 'team2'}
          />
        </Box>

        {winner === null && (
          <Typography
            align="center"
            sx={{ mt: 2, fontStyle: 'italic', opacity: 0.8 }}
          >
            🤝 Manche nulle
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
        <Button
          variant="contained"
          size="large"
          onClick={onNextRound}
          sx={{
            bgcolor: '#5a8a6d',
            fontWeight: 'bold',
            px: 4,
            '&:hover': { bgcolor: '#4a755c' }
          }}
        >
          ▶️ Nouvelle manche
        </Button>
      </DialogActions>
    </Dialog>
  );
};
const Stars = ({ big = false, count = 0 }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
    {big && (
      <Typography
        sx={{
          fontSize: '2rem',
          color: 'gold',
          textShadow: '0 0 8px rgba(255,215,0,0.8)'
        }}
      >
        ⭐
      </Typography>
    )}
    {Array.from({ length: count }).map((_, i) => (
      <Typography
        key={i}
        sx={{
          fontSize: '1.2rem',
          color: '#ffd700',
          textShadow: '0 0 6px rgba(255,215,0,0.6)'
        }}
      >
        ✨
      </Typography>
    ))}
  </Box>
);
const computeRoundWins = (teams) => {
  const t1 = teams.team1.captures;
  const t2 = teams.team2.captures;

  const count = (cards, fn) => cards.filter(fn).length;

  const stats = {
    team1: {
      cards: t1.length,
      carreaux: count(t1, c => c.suit === 'carreau'),
      sevens: count(t1, c => c.rank.value === 7),
      has7Carreau: t1.some(
        c => c.suit === 'carreau' && c.rank.value === 7
      )
    },
    team2: {
      cards: t2.length,
      carreaux: count(t2, c => c.suit === 'carreau'),
      sevens: count(t2, c => c.rank.value === 7),
      has7Carreau: t2.some(
        c => c.suit === 'carreau' && c.rank.value === 7
      )
    }
  };

  return {
    team1: {
      cards: stats.team1.cards > stats.team2.cards,
      carreaux: stats.team1.carreaux > stats.team2.carreaux,
      sevens: stats.team1.sevens > stats.team2.sevens,
      sevenCarreau: stats.team1.has7Carreau
    },
    team2: {
      cards: stats.team2.cards > stats.team1.cards,
      carreaux: stats.team2.carreaux > stats.team1.carreaux,
      sevens: stats.team2.sevens > stats.team1.sevens,
      sevenCarreau: stats.team2.has7Carreau
    }
  };
};
