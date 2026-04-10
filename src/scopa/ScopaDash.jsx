import { Box, Typography, Button, Divider } from '@mui/material';
import { Carte } from '../poker/Card';

export const ScopaDashboard = ({
  teams,
  round,
  deck,
  lastCapture,
  onRestart
}) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 16,
        right: 16,
        width: 260,
        bgcolor: 'rgba(25,30,28,0.9)',
        color: 'white',
        borderRadius: 2,
        padding: 2,
        boxShadow: '0 10px 25px rgba(0,0,0,0.45)',
        fontSize: '0.85rem'
      }}
    >
      {/* HEADER */}
      <Box
  sx={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 1
  }}
>
  <Typography sx={{ fontWeight: 'bold' }}>
    🃏 Scopa — Manche {round}
  </Typography>

  <Box sx={{ display: 'flex', gap: 0.5 }}>
    {Array.from({
      length: Math.round(deck.length / 12)
    }).map((_, i) => (
      <Carte
        key={i} card={{}}
        retourne={true}
        width={20}
        height={50}
      />
    ))}
  </Box>
</Box>

      <Divider sx={{ mb: 1, bgcolor: 'rgba(255,255,255,0.2)' }} />

      {/* SCORE */}
      <Box sx={{ mb: 1 }}>
        <Typography sx={{ fontWeight: 'bold' }}>Score</Typography>

        <Typography>
          🔵 Équipe 1 — <b>{teams.team1.score}</b> pts
          {teams.team1.scopa > 0 && ` ✨${teams.team1.scopa}`}
        </Typography>

        <Typography>
          🔴 Équipe 2 — <b>{teams.team2.score}</b> pts
          {teams.team2.scopa > 0 && ` ✨${teams.team2.scopa}`}
        </Typography>
      </Box>

      <Divider sx={{ mb: 1, bgcolor: 'rgba(255,255,255,0.2)' }} />

      {/* DERNIÈRE PRISE */}
      <Box>
        <Typography sx={{ fontWeight: 'bold', mb: 0.5 }}>
          Dernière prise
        </Typography>

        {lastCapture ? (
          <>
            <Typography sx={{ opacity: 0.85, mb: 0.5 }}>
              {lastCapture.team === 'team1' ? '🔵 Équipe 1' : '🔴 Équipe 2'}
              {lastCapture.scopa && (
                <span style={{ color: '#ffd700', marginLeft: 6 }}>
                  ⭐ SCOPA
                </span>
              )}
            </Typography>

            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {lastCapture.cards.map((card, i) => (
                <Carte
                  key={i}
                  card={card}
                  width={36}
                  height={56}
                />
              ))}
            </Box>
          </>
        ) : (
          <Typography sx={{ opacity: 0.6 }}>—</Typography>
        )}
      </Box>

      <Divider sx={{ my: 1, bgcolor: 'rgba(255,255,255,0.2)' }} />

      {/* ACTION */}
      <Button
        variant="contained"
        fullWidth
        size="small"
        onClick={onRestart}
        sx={{
          bgcolor: '#5a8a6d',
          fontWeight: 'bold',
          '&:hover': { bgcolor: '#4a755c' }
        }}
      >
        🔁 Nouvelle partie
      </Button>
    </Box>
  );
};
