import { Box, Button, Divider, Typography } from '@mui/material';

const Heart = ({ filled }) => (
  <Typography component="span" sx={{ fontSize: 22, filter: filled ? 'none' : 'grayscale(1) opacity(0.3)' }}>
    ❤️
  </Typography>
);

export default function FlipperPanel({ state, onRestart }) {
  const { score, lives, message, steps } = state;

  return (
    <Box sx={{
      width: 180,
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      px: 2, py: 3,
      bgcolor: '#12122a',
      borderLeft: '2px solid #2a2a5a',
      color: '#fff',
    }}>

      {/* Score */}
      <Box>
        <Typography sx={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>
          Score
        </Typography>
        <Typography sx={{ fontSize: 32, fontWeight: 'bold', color: '#f5a623', lineHeight: 1.2 }}>
          {score.toLocaleString()}
        </Typography>
      </Box>

      <Divider sx={{ borderColor: '#2a2a5a' }} />

      {/* Vies */}
      <Box>
        <Typography sx={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1, mb: 0.5 }}>
          Vies
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {[...Array(3)].map((_, i) => <Heart key={i} filled={i < lives} />)}
        </Box>
      </Box>

      <Divider sx={{ borderColor: '#2a2a5a' }} />

      {/* Objectifs / steps */}
      <Box>
        <Typography sx={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>
          Objectifs
        </Typography>
        {Object.entries(steps).map(([key, done]) => (
          <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Box sx={{
              width: 10, height: 10, borderRadius: '50%',
              bgcolor: done ? '#4caf50' : '#333',
              border: '1px solid',
              borderColor: done ? '#4caf50' : '#555',
              flexShrink: 0,
            }} />
            <Typography sx={{ fontSize: 12, color: done ? '#fff' : '#555' }}>
              {STEP_LABELS[key] ?? key}
            </Typography>
          </Box>
        ))}
      </Box>

      <Divider sx={{ borderColor: '#2a2a5a' }} />

      {/* Message narratif */}
      <Box sx={{
        bgcolor: '#1a1a3e', borderRadius: 2, p: 1.5,
        border: '1px solid #2a2a5a', minHeight: 60,
        display: 'flex', alignItems: 'center',
      }}>
        <Typography sx={{ fontSize: 12, color: '#ccc', fontStyle: 'italic', lineHeight: 1.4 }}>
          {message}
        </Typography>
      </Box>

      <Box sx={{ flex: 1 }} />

      {/* Bouton restart */}
      <Button
        variant="contained"
        onClick={onRestart}
        fullWidth
        sx={{
          bgcolor: '#e94560',
          '&:hover': { bgcolor: '#c73652' },
          fontWeight: 'bold',
          letterSpacing: 1,
        }}
      >
        Recommencer
      </Button>

      {/* Contrôles */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography sx={{ fontSize: 10, color: '#444', lineHeight: 1.8 }}>
          ← / Z · Flipper gauche<br />
          → / / · Flipper droit<br />
          Espace · Lancer
        </Typography>
      </Box>

    </Box>
  );
}

// Labels lisibles pour les objectifs — à personnaliser
const STEP_LABELS = {
  step1: 'Passage débloqué',
  step2: 'Zone atteinte',
  step3: '🔥 Bonus activé',
};