import React, { useState } from 'react';
import ChiFuMi from '../../miniJeux/ChiFuMi';
import {Morpion} from '../../miniJeux/Morpion'
import {Moulin} from '../../miniJeux/Moulin'
import Simon from '../../miniJeux/Simon'
import { Box, Button, Grid, Stack, Typography } from '@mui/material';
import AwaleBoard from '../../awale/AwaleBoard';
import WhackAMole from '../../miniJeux/WhackAMole';
// Ajoute ici tous les mini-jeux que tu veux exposer

const MiniGame_CodePanel = ({ miniGameOptions, onFinish }) => {
  const [code, setCode] = useState("");
  const thisCode = miniGameOptions?.code ?? "4852";

  const handlePress = (digit) => {
    if (code.length >= 4) return;
    setCode(code + digit);
  };

  const handleBack = () => {
    setCode(code.slice(0, -1));
  };

  const handleValidate = () => {
    const isCorrect = code === thisCode;
    onFinish(isCorrect);
  };

  return (<Box sx={{display:'flex', justifyContent:'left', alignItems:'left', margin:4}}>
    
    <Box
      sx={{
        maxWidth: 400,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#1a1a1a",
        border: "3px solid #FFD700",
        borderRadius: 2,
        p: 2,
        fontFamily: '"Press Start 2P", monospace',
        color: "#FFD700",
        gap: 2
      }}
    >
      {/* CLAVIER GAUCHE */}
      <Grid container spacing={1} columns={3} sx={{ width: 150 }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n, i) => (
          <Grid item xs={1} key={i}>
            <Button
              fullWidth
              onClick={() => handlePress(String(n))}
              variant="contained"
              sx={{
                backgroundColor: "#333",
                color: "#FFD700",
                minWidth: 0,
                aspectRatio: "1",
                p: 0,
                fontSize: "14px",
                fontWeight: "bold",
                border: "1px solid #666",
                '&:hover': { backgroundColor: "#555" }
              }}
            >
              {n}
            </Button>
          </Grid>
        ))}
      </Grid>

      {/* ÉCRAN + VALIDATION */}
      <Stack spacing={2} sx={{ flex: 1 }}>
        <Box
          sx={{
            textAlign: "center",
            background: "#000",
            color: "#0f0",
            fontSize: "22px",
            letterSpacing: "0.8rem",
            p: "6px 12px",
            border: "2px inset #444",
            borderRadius: "4px",
            minHeight: 48
          }}
        >
          {code.padEnd(4, "_")}
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            fullWidth
            onClick={handleBack}
            variant="outlined"
            sx={{
              borderColor: "#FFD700",
              color: "#FFD700",
              fontSize: "10px"
            }}
          >
            ⌫ Effacer
          </Button>
          <Button
            fullWidth
            onClick={handleValidate}
            disabled={code.length !== 4}
            variant="contained"
            sx={{
              backgroundColor: "#FFD700",
              color: "#111",
              fontSize: "10px",
              '&:hover': {
                backgroundColor: "#ffc400"
              }
            }}
          >
            ✔ Valider
          </Button>
        </Stack>
      </Stack>
    </Box>

  </Box>
  );
};





const MINI_GAMES = {
  ChiFuMi
  , Morpion
  , Moulin
  , WhackAMole
  , Simon, Awale:AwaleBoard
  , ChoixCode:MiniGame_CodePanel
  // ...
};

const MiniGameRenderer = ({ name, onFinish, context,miniGameOptions }) => {
  const Component = MINI_GAMES[name];
  if (!Component) return <div>Jeu introuvable: {name}</div>;
  return <Component onFinish={onFinish} miniGameOptions={miniGameOptions} 
    context={context} />;
};

export default MiniGameRenderer;

