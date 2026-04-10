import { faClover, faDiamond, faHeart, faSpa } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Button, Popover, Typography } from "@mui/material";
import { Carte, suits } from "../poker/Card";
import { useEffect, useRef, useState } from "react";
import { playersByPosition } from "./beloteUtils";

export const getPlayerName=a=>playersByPosition[a].name;

export const BiddingDialog = ({ 
  open, proposedCard,
 currentDealer,
   getNextPlayer
  , finishDistribution
}) => {

     const [currentBidder, setCurrentBidder] = useState(currentDealer);
     
      const [biddingRound, setBiddingRound] = useState(1);
    
  const isHumanTurn = currentBidder === 'bottom';
  
    const [biddingPasses, setBiddingPasses] = useState(0); // Compteur de "je passe"
   
    // Gérer quand c'est le tour de l'IA
useEffect(() => {
  if (currentBidder !== 'bottom') {
    setTimeout(() => {
      aiDoBidding();
    }, 1500); // L'IA "réfléchit" 1.5s
  }
}, [currentBidder,proposedCard]);
const aiDoBidding = () => {
  // IA simple : 30% de chance de prendre au premier tour
  // Au deuxième tour, 20% de prendre avec une couleur random
  const shouldTake = Math.random() < (biddingRound === 1 ? 0.3 : 0.2);
  
  if (shouldTake) {
    if (biddingRound === 1) {
      handleTake();
    } else {
     
      const randomColor = suits[Math.floor(Math.random() * suits.length)];
      handleChooseColor(randomColor);
    }
  } else {
    handlePass();
  }
};

const handleTake = () => {
 
  finishDistribution(currentBidder, proposedCard?.suit);
};

const handleChooseColor = (color) => {
  
  finishDistribution(currentBidder, color);
};

const handlePass = () => {
  const nextBidder = getNextPlayer(currentBidder);
  const newPasses = biddingPasses + 1;
  setBiddingPasses(newPasses);
  
  // Si les 4 ont passé au premier tour
  if (newPasses === 4 && biddingRound === 1) {
    setBiddingRound(2);
    setBiddingPasses(0);
    setCurrentBidder('bottom'); // Recommence au même joueur
    return;
  }
  
  // Si les 4 ont passé au deuxième tour aussi
  if (newPasses === 4 && biddingRound === 2) {
    // Redistribution !
   finishDistribution();
    return;
  }
  
  setCurrentBidder(nextBidder);
};

  return (
    <Popover  open={open}
  anchorReference="anchorPosition"
  anchorPosition={{
    top: window.innerHeight / 2,
    left: window.innerWidth / 2,
  }}
  transformOrigin={{
    vertical: 'center',
    horizontal: 'center',
  }} maxWidth="sm">
      <Typography variant="h5">
        {biddingRound === 1 ? 'Voulez-vous prendre ?' : 'Choisissez une couleur d\'atout'}
      </Typography>
      
      <Box>
        {biddingRound === 1 && proposedCard && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Typography>Carte proposée :</Typography>
            <Box sx={{height:100, overflow:'hidden'}}><Carte card={proposedCard} />
            </Box>
            {!isHumanTurn && (
              <Typography variant="body1" color="primary">
                {getPlayerName(currentBidder)} réfléchit...
              </Typography>
            )}
          </Box>
        )}
        
        {biddingRound === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography>Personne n'a pris la carte proposée.</Typography>
            <Typography>Choisissez une couleur d'atout ou passez :</Typography>
            
            {!isHumanTurn && (
              <Typography variant="body1" color="primary">
                {getPlayerName(currentBidder)} réfléchit...
              </Typography>
            )}
          </Box>
        )}
      </Box>
      
      {isHumanTurn && (
        <Box sx={{ justifyContent: 'center', gap: 2, pb: 3 }}>
          {biddingRound === 1 ? (
            <>
              <Button 
                variant="contained" 
                color="success" 
                size="large"
                onClick={handleTake}
              >
                Je prends !
              </Button>
              <Button 
                variant="outlined" 
                color="error"
                size="large"
                onClick={handlePass}
              >
                Je passe
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => handleChooseColor('pique')}>
                <FontAwesomeIcon icon={faSpa} size="2x" />
              </Button>
              <Button onClick={() => handleChooseColor('coeur')}>
                <FontAwesomeIcon icon={faHeart} size="2x" color="red" />
              </Button>
              <Button onClick={() => handleChooseColor('carreau')}>
                <FontAwesomeIcon icon={faDiamond} size="2x" color="red" />
              </Button>
              <Button onClick={() => handleChooseColor('trèfle')}>
                <FontAwesomeIcon icon={faClover} size="2x" />
              </Button>
              <Button variant="outlined" color="error" onClick={handlePass}>
                Je passe
              </Button>
            </>
          )}
        </Box>
      )}
    </Popover>
  );
};