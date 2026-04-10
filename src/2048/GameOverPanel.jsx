import React from 'react';
import { KeyboardDoubleArrowLeft, KeyboardDoubleArrowRight, KeyboardDoubleArrowUp, KeyboardDoubleArrowDown, RestartAlt } from '@mui/icons-material';
import { useIsMobile } from '../hookGame';
import Button from '@mui/material/Button';
import { Box, Card, Divider, Typography } from '@mui/material';
import { GameOver } from '../ChuckNorrisFact';


export const Score2048 = ({ handleRestart, lastSwipe, score, gridSize, setGridSize }) => {
  const isMobile = useIsMobile();

  const getArrowIcon = (dir) => {
    switch (dir) {
      case "left":  return <KeyboardDoubleArrowLeft fontSize="large" color="primary" />;
      case "right": return <KeyboardDoubleArrowRight fontSize="large" color="primary" />;
      case "up":    return <KeyboardDoubleArrowUp fontSize="large" color="primary" />;
      case "down":  return <KeyboardDoubleArrowDown fontSize="large" color="primary" />;
      default:      return null;
    }
  };

  // ── Version mobile : barre horizontale compacte ──
  if (isMobile) {
    return (
      <Box sx={{
        display: "flex", alignItems: "center", gap: 1,
        flexWrap: "wrap", justifyContent: "center",
        width: "100%",
        background: "rgba(25,25,25,0.85)",
        borderRadius: 3, px: 1.5, py: 0.75,
        color: "#f0f0f0",
      }}>
        <Typography sx={{ fontWeight: "bold", color: "#ffcc00", fontSize: 15, mr: 0.5 }}>
          {score}
        </Typography>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {[3, 4, 6, 12].map((size) => (
            <Button key={size} size="small"
              variant={gridSize === size ? "contained" : "outlined"}
              color={gridSize === size ? "secondary" : "primary"}
              sx={{ minWidth: 32, px: 0.5, fontSize: 13 }}
              onClick={() => setGridSize(size)}>
              {size}×{size}
            </Button>
          ))}
        </Box>
        <Button size="small" variant="contained" color="error"
          onClick={handleRestart} sx={{ minWidth: 36, px: 1 }}>
          <RestartAlt fontSize="small" />
        </Button>
      </Box>
    );
  }

  // ── Version desktop : carte complète ──
  return (
    <Card elevation={10} sx={{
      width: 260, borderRadius: 4,
      backdropFilter: "blur(6px)",
      background: "rgba(25,25,25,0.85)",
      color: "#f0f0f0",
      display: "flex", flexDirection: "column", alignItems: "center",
      p: 2, boxShadow: "0 0 20px #222",
    }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", color: "#ffcc00", textShadow: "0 0 12px #ffcc0044" }}>
        2048
      </Typography>
      <Typography variant="h6" sx={{
        mt: 1, color: "#fafafa", fontFamily: "monospace",
        backgroundColor: "#333", px: 2, py: 1, borderRadius: 2,
        boxShadow: "0 0 8px #000 inset",
      }}>
        Score : {score}
      </Typography>
      <Box sx={{ mt: 2, minHeight: 60 }}>{getArrowIcon(lastSwipe)}</Box>
      <Divider sx={{ my: 2, width: "80%", borderColor: "#555" }} />
      <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.8 }}>Taille de la grille</Typography>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "center" }}>
        {[3, 4, 6, 12].map((size) => (
          <Button key={size}
            variant={gridSize === size ? "contained" : "outlined"}
            color={gridSize === size ? "secondary" : "primary"}
            sx={{ minWidth: 40, borderRadius: 2, transition: "all 0.3s ease", "&:hover": { transform: "scale(1.1)" } }}
            onClick={() => setGridSize(size)}>
            {size}
          </Button>
        ))}
      </Box>
      <Divider sx={{ my: 2, width: "80%", borderColor: "#555" }} />
      <Button variant="contained" color="error" startIcon={<RestartAlt />} onClick={handleRestart}
        sx={{ borderRadius: 3, px: 3, mt: 1, transition: "all 0.3s ease", "&:hover": { backgroundColor: "#ff4444", transform: "scale(1.05)" } }}>
        Recommencer
      </Button>
    </Card>
  );
};

export default GameOver;