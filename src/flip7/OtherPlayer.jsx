import { Box, Typography, Paper, Avatar } from "@mui/material";
import Player7Card from "./Player7Card";
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied'; // Icône "mort"
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions'; // Icône "vivant"

const OtherPlayer = ({ joueur = { cartes: [], mort: false } }) => {
  const isDead = joueur.mort;

  return (
    <Paper
      elevation={3}
      sx={{
        flex: 1,
        minWidth: 0,
        m: 1,
        p: 2,
        borderRadius: 3,
        background: isDead
          ? "linear-gradient(90deg,rgb(241, 232, 130) 0%,rgb(237, 210, 179) 100%)"
          : "linear-gradient(90deg,rgb(255, 251, 29) 0%,rgb(244, 145, 15) 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        opacity: isDead ? 0.76 : 1,
        pointerEvents: isDead ? "none" : "auto",
        transition: "opacity 0.3s, filter 0.3s",
      }}
    >
      {/* Overlay pour le voile de mort */}
      {isDead && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            filter: isDead ? "grayscale(0.7)" : "none",
            background: "rgba(80,80,80,0.25)",
            borderRadius: 3,
            zIndex: 2,
          }}
        />
      )}

      {/* Tampon DEAD REASON */}
      {isDead && joueur.deadReason && (
        <Box
          sx={{
            position: "absolute",
            top: "50%",            left: "50%",
            transform: "translate(-50%, -50%) rotate(-15deg)",
            bgcolor: "rgba(200,0,0,0.85)",
            color: "#fff",            fontWeight: "bold",
            fontSize: 28,            px: 4,    py: 1,
            borderRadius: 2,            boxShadow: "0 4px 24px #0006",            zIndex: 10,
            textTransform: "uppercase",
            letterSpacing: 2,            border: "3px solid #fff",
            opacity: 0.92,            pointerEvents: "none",
            fontFamily: '"Oswald", "Arial Black", Arial, sans-serif',
            textAlign: "center",
            userSelect: "none",
          }}
        >
          {joueur.deadReason}
        </Box>
      )}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          position: "relative",
          zIndex: 3,
          mb: 1,
        }}
      >
        <Avatar  src={joueur.avatar}
            alt={joueur.name}
            sx={{ width: 56, height: 56, mr: 1, border: isDead ? "2px solid #a00" : "2px solid #2e7d32" }}
          />
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: "bold",
            letterSpacing: 1,
            color: isDead ? "#666" : "#2d3748",
            textShadow: "0 1px 2px #fff8",
            mr: 1,
          }}
        >
          {joueur.name}
        </Typography>
        {isDead ? (
          <SentimentVeryDissatisfiedIcon
            sx={{ color: "#a00", fontSize: 26, verticalAlign: "middle" }}
            titleAccess="Joueur éliminé"
          />
        ) : (
          <EmojiEmotionsIcon
            sx={{ color: "#2e7d32", fontSize: 22, verticalAlign: "middle" }}
            titleAccess="Joueur actif"
          />
        )}
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 1,
          justifyContent: "center",
          flexWrap: "wrap",
          width: "100%",
          zIndex: 3,
        }}
      >
        {joueur.cartes.map((c, idx) => (
          <Player7Card key={"p7" + idx} carte={c} variant="small" />
        ))}
      </Box>
    </Paper>
  );
};

export default OtherPlayer;
