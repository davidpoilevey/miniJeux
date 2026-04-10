import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Slide } from "@mui/material";
import { styled } from "@mui/system";

// Animation d'apparition (un petit fade + slide)
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Styles personnalisés — thème lunaire rétro
const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiPaper-root": {
    background: "radial-gradient(circle at 20% 20%, #101010, #050505 90%)",
    border: "2px solid #4af",
    borderRadius: "8px",
    boxShadow: "0 0 25px rgba(80,180,255,0.4)",
    color: "#D0F0FF",
    fontFamily: "'Press Start 2P', monospace",
    textShadow: "0 0 4px #4af",
    padding: "8px",
  },
}));

const GlowingButton = styled(Button)({
  color: "#D0F0FF",
  borderColor: "#4af",
  fontFamily: "'Press Start 2P', monospace",
  textShadow: "0 0 3px #4af",
  "&:hover": {
    backgroundColor: "rgba(100,200,255,0.1)",
    borderColor: "#6cf",
  },
});

// Utilitaire pour formater le temps écoulé
const formatTime = (ms) => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}:${remaining.toString().padStart(2, "0")}`;
};

export const MissionDialog = ({ open, elapsedTime, nextNiveau, onClose }) => {
  return (
    <StyledDialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={onClose}
      aria-describedby="mission-complete-description"
    >
      <DialogTitle sx={{ textAlign: "center", fontSize: "1.2rem" }}>
        🚀 Mission accomplie !
      </DialogTitle>

      <DialogContent>
        <Typography
          id="mission-complete-description"
          align="center"
          sx={{
            fontSize: "0.9rem",
            marginTop: 2,
            color: "#9FE6FF",
          }}
        >
          Temps total :
          <br />
          <span style={{ fontSize: "1.5rem", color: "#4af" }}>
            {String(Math.floor(elapsedTime / 60)).padStart(2, '0')}:{String(elapsedTime % 60).padStart(2, '0')}
          </span>
        </Typography>

        <Typography
          align="center"
          sx={{
            marginTop: 3,
            fontSize: "0.75rem",
            color: "#6CF",
            opacity: 0.8,
          }}
        >
          “Le vide t’a observé. Et il t’a trouvé rapide.”
        </Typography>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", paddingBottom: 3 }}>
        <GlowingButton variant="outlined" onClick={nextNiveau}>
          Niveau Suivant ➜
        </GlowingButton>
        <GlowingButton variant="outlined" onClick={onClose}>
          Quitter
        </GlowingButton>
      </DialogActions>
    </StyledDialog>
  );
};
