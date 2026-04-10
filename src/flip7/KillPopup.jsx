import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Avatar,
  IconButton,
} from "@mui/material";
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import Player7Card from "./Player7Card";

const KillPopupDialog = ({
  open,
  onClose,
  joueurs = [],
  currentUser = {},
  mode, //3cartes ou stop
  callback,
}) => {
  // Filtrer les joueurs actifs sauf le courant
  const joueursCibles = mode==='stop'?joueurs.filter(
    (j) => j.name !== currentUser.name
  ):joueurs;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth >
      <DialogTitle sx={{ fontWeight: "bold", display:'flex',fontSize: "2rem",background:'silver' }}>
        {mode==='stop'?"Tu as tiré une carte STOP ! Choisis un joueur a eliminer"
            :"Tu as tiré une carte 3Cartes ! Choisis un joueur a charger comme une mule"}
        <Player7Card variant="large" carte={{type:mode, val:'none'}}/>
      </DialogTitle>
      <DialogContent sx={{background:'silver'}}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 3,
            justifyContent: "center",
            py: 2,
          }}
        >
          {joueursCibles.map((j) => (
            <Box
              key={j.name}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
                p: 2,
                borderRadius: 3,
                background: j.mort?"#eeeeee":"#f8fafc",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                minWidth: 100,
                transition: "transform 0.15s, box-shadow 0.15s",
                "&:hover": {
                  transform: "scale(1.06)",
                  boxShadow: "0 6px 24px rgba(0,0,0,0.15)",
                  background: "#e0e7ef",
                },
              }}
              onClick={() => {
                onClose();
                if(j.mort)
                    return;
                callback && callback(j);
              }}
            >
              <Avatar
                src={j.avatar}
                alt={j.name}
                
                sx={{
                  width: 48,
                  height: 48,
                  mb: 1,
                  border: "3px solid #a00",
                  boxShadow: "0 2px 8px #a002",
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  color: "#2d3748",
                  textAlign: "center",
                  mb: 0.5,
                }}
              >
                {j.name}
              </Typography>
              <SentimentVeryDissatisfiedIcon sx={{ color: "#a00", fontSize: 32 }} />
            </Box>
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default KillPopupDialog;
