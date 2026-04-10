import { GameOver } from "../ChuckNorrisFact"
import React, { useState } from "react";
import Echiquier from "./Echiquier";

import { Box, Button, Popover, Typography } from '@mui/material';
import InfoPanel from './InfoPanel'; // nouveau composant à créer
import { ChessProvider, useChess } from "./ChessContext";
import { useMainMenuStyles } from "../civ/utils/MainMenu";

const Echecs = () => {
 const [gameState, setGameState] = useState('mainMenu');

   switch (gameState) {
     case 'mainMenu':
       return (
         <MainMenu forChess
           onNewGame={() => { setGameState('playing'); }}
           onGameLoaded={(withNation) => {
             setGameState('playing');
           }}
         />
       );
       case 'playing':
    return <ChessProvider>
        <EchecBoard/>
    </ChessProvider>
      default:
        return <Typography variant="h4">Échecs</Typography>;  
   }  
}
export default Echecs;
export const EchecBoard = () => {
  const [isGameOver, setGameOver] = useState(false);
  const [gameOverReason, setGameOverReason] = useState();
  const [score, setScore] = useState(0);
  const [resetID, setResetID] = useState(0);

  const { setEchec,setCaptured, joueurEstBlanc, setMessage, resetTimer , getScore} = useChess();

  const _setGameOver = (reason, gagnant) => {
    setGameOver(true);
    setGameOverReason(reason);
    setScore(getScore(gagnant));
  };
  const reset = () => {
    setResetID(prev => prev + 1);
    setScore(0);
    setGameOver(false);
    setGameOverReason(null);
    setCaptured({ white: [], black: [] });
    setEchec(false);
    setMessage(null);
    resetTimer();
  };

  return (
    <Box sx={{ height: '100%', backgroundColor:joueurEstBlanc? 'rgba(236, 234, 225, 1)' : 'rgba(141, 140, 136, 1)'
    , padding: 6, overflow: 'auto', display: 'flex', gap: 4 }}>
      <GameOver
        open={isGameOver}
        gameOverReason={gameOverReason}
        gameName="echec"
        score={score}
        handleClose={() => setGameOver(false)}
        handleRestart={reset}
      />

      <Echiquier
        reset={resetID}
        gameOver={_setGameOver}
      />

      <InfoPanel
      reset={reset}
       gameOver={_setGameOver}
      />
    </Box>
  );
};






export const MainMenu = ({ onNewGame, onGameLoaded }) => {
  
  
 const [creditsAnchor, setCreditsAnchor] = React.useState(null);

  const sertARien = (event) => {
   alert("Putain puisqu'on vous dit qu'il sert a rien")
  };
  const handleCreditsClick = (event) => {
    setCreditsAnchor(event.currentTarget);
  };

  const handleCreditsClose = () => {
    setCreditsAnchor(null);
  };
 const useStyles= useMainMenuStyles;
  const creditsOpen = Boolean(creditsAnchor);
  return (
    <div style={useStyles.rootChess}>
      <div style={useStyles.overlay} />
      <Box style={useStyles.content}>
        <Typography variant="h4" style={useStyles.title}>
         Osez affronter 
        </Typography>
        <Typography variant="h2" style={useStyles.title}>
          Claude Magnus le bot d'échec 
        </Typography>
        
        <div style={useStyles.buttonContainer}>
          <Button
            variant="contained"
            color="primary"
            style={useStyles.menuButton}
            onClick={onNewGame}
          >
            Nouveau Jeu
          </Button>
          
           <Button
            variant="contained"
            style={useStyles.menuButton}
            onClick={handleCreditsClick}
          >
            Crédits
          </Button>
           <Button
            variant="contained"
            style={useStyles.menuButton}
            onClick={sertARien}
          >
            Bouton qui sert a rien
          </Button>
          {/* Boutons futurs */}
          {/* 
          <Button
            variant="contained"
           sx={useStyles.menuButton}
            style={{ backgroundColor: '#666' }}
          >
            Options
          </Button>
          */}
        </div>
         <Popover
          open={creditsOpen}
          anchorEl={creditsAnchor}
          onClose={handleCreditsClose}
          anchorOrigin={{
            vertical: 'center',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'center',
            horizontal: 'left',
          }}
        >
          <Box sx={useStyles.creditsPopover}>
            <Typography variant="h6" style={useStyles.creditsTitle}>
              Crédits
            </Typography>
            <Typography variant="body2" style={useStyles.creditsText}>
              Développé avec passion par un développeur fan d'echecs autant que son fils 
            </Typography>
            <Typography variant="body2" style={useStyles.creditsText}>
Rodolphe ce jeu est pour toi   </Typography>
            <Typography variant="body2" style={useStyles.creditsText}>
              Remerciements spéciaux à Claude qui a tellement peaufiné l'algorithme qu'il a merité de porter le nom du bot 
              </Typography>
                 <Typography variant="body2" style={useStyles.creditsText}>
              <strong>Technologies utilisées :</strong> React, Material-UI, javascript et beaucoup de café ☕
            </Typography>
            <Typography variant="body2" style={useStyles.creditsText}>
              Version 1.0 - 2025
            </Typography>
          </Box>
        </Popover>
      </Box>
    </div>
  );
};

