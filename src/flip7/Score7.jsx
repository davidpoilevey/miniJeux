import { Box, Button, Avatar, Typography, Paper } from "@mui/material";
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';

// Composant Score7
export const Score7 = ({ joueurs = [] }) => (
  <Paper
    elevation={2}
    sx={{
      p: 2,
      borderRadius: 3,
      background: "linear-gradient(270deg,rgb(251, 196, 163) 0%,rgb(243, 245, 128) 100%)",
      minWidth: 220,
      maxWidth: 320,
      width: "100%",
      ml: 2,
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch",
      gap: 1,
    }}
  >
    <Typography
      variant="subtitle2"
      sx={{ fontWeight: "bold", color: "#2d3748", mb: 1, letterSpacing: 1 }}
    >
      Scores
    </Typography>
    {joueurs.map((j) => {
      const isDead = j.mort;
      return (
        <Box
          key={'sc' + j.name}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1,
            py: 0.5,
            borderRadius: 2,
            background: isDead ? "#eee" : "transparent",
            opacity: isDead ? 0.5 : 1,
            filter: isDead ? "grayscale(0.7)" : "none",
            position: "relative",
            transition: "opacity 0.3s, filter 0.3s",
          }}
        >
          <Avatar
            src={j.avatar}
            alt={j.name}
            sx={{ width: 36, height: 36, mr: 1, border: isDead ? "2px solid #a00" : "2px solid #2e7d32" }}
          />
          <Typography variant="body1" sx={{ flex: 1, fontWeight: "bold" }}>
            {j.name}
          </Typography>
          <Typography variant="h6" sx={{ minWidth: 32, textAlign: "right" }}>
            {j.score}
          </Typography>
          {isDead ? (
            <SentimentVeryDissatisfiedIcon sx={{ color: "#a00", ml: 1 }} titleAccess="Joueur éliminé" />
          ) : (
            <EmojiEmotionsIcon sx={{ color: "#2e7d32", ml: 1 }} titleAccess="Joueur actif" />
          )}
        </Box>
      );
    })}
  </Paper>
);

export default Score7;
