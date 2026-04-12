import { GameOver } from "../ChuckNorrisFact"
import React, { useState } from "react";
import Echiquier from "./Echiquier";

import { Avatar, Box, Button, Popover, Typography } from '@mui/material';
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

  const { setEchec, setCaptured, joueurEstBlanc, setMessage, resetTimer, getScore,
    gamePhase, openingManager, puzzle, tourBlancs } = useChess();

  const phaseLabel = puzzle ? puzzle.name
    : openingManager?.isActive ? openingManager.currentOpening?.name
    : gamePhase === 'opening' ? 'Ouverture'
    : gamePhase === 'middlegame' ? 'Milieu de jeu'
    : 'Finale';

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
    <Box sx={{ height: '100%', background: '#faf9f6', p: '24px 32px', overflow: 'auto', display: 'flex', gap: 5, alignItems: 'flex-start' }}>
      <GameOver
        open={isGameOver}
        gameOverReason={gameOverReason}
        gameName="echec"
        score={score}
        handleClose={() => setGameOver(false)}
        handleRestart={reset}
      />

      {/* Colonne plateau */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>

        {/* Titre + bloc adversaire */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <Box>
            <Typography sx={{ fontSize: '2.6rem', fontWeight: 800, color: '#2f3430', lineHeight: 1, letterSpacing: '-0.02em' }}>
              Echecs
            </Typography>
            <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#5c605c', mt: 0.5 }}>
              {phaseLabel}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, background: '#f4f4f0', px: 2.5, py: 1.5, borderRadius: 2 }}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#5c605c' }}>Adversaire</Typography>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#2f3430' }}>Claudius Magnus</Typography>
            </Box>
            <Avatar sx={{ width: 36, height: 36, bgcolor: '#e0d2c7', color: '#5b5149', fontSize: '0.875rem', fontWeight: 700 }}>AI</Avatar>
          </Box>
        </Box>

        {/* Plateau */}
        <Box sx={{ background: '#f4f4f0', p: 1.5, borderRadius: 2, border: '1px solid rgba(175,179,174,0.12)', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}>
          <Echiquier reset={resetID} gameOver={_setGameOver} />
        </Box>

        {/* Bloc joueur */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, background: '#f4f4f0', px: 2.5, py: 1.5, borderRadius: 2, alignSelf: 'flex-start' }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: joueurEstBlanc ? '#ffdcc1' : '#2f3430', color: joueurEstBlanc ? '#835425' : '#fff', fontSize: '0.75rem', fontWeight: 800 }}>
            {joueurEstBlanc ? 'W' : 'B'}
          </Avatar>
          <Box>
            <Typography sx={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#5c605c' }}>
              {tourBlancs ? 'Votre tour' : 'En attente'}
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#2f3430' }}>Vous</Typography>
          </Box>
        </Box>

      </Box>

      {/* Panneau droit */}
      <InfoPanel reset={reset} gameOver={_setGameOver} />
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

