import React, { useState } from 'react';
import Board, { COLS } from './Board';
import ScoreBoard from './ScoreBoard';
import { Box, Dialog, DialogTitle } from '@mui/material';

const Game = () => {
  const [currentPlayer, setCurrentPlayer] = useState('red');
  const [winner, setWinner] = useState(null);
  const [doClear,setDoClear]=useState(false);
  const [thinking, setThinking] = useState(false);
  
  const handleWinner = (player) => {
    setWinner(player);
  };

  const handlePlayerChange = () => {
    setCurrentPlayer(currentPlayer === 'red' ? 'yellow' : 'red');

    if (currentPlayer === 'red') {
        setThinking(true);
        setTimeout(() => {
          setThinking(false);
        }, 500);
      }
  };
  const onReset=()=>{
    //setWinner a null, clearBoard
    setCurrentPlayer('red');
    setWinner(null);
    setDoClear(true);

  setTimeout(() => {
    setDoClear(false);
  }, 100); 
  }

  return (
    <Box sx={{display:'flex', flexDirection:'column',alignItems:'center'}}>
      {winner ? (
        <h2>Puissance 4</h2>
      ) : (
        <h2>C'est au tour du joueur {currentPlayer}.</h2>
      )}
      <Board currentPlayer={currentPlayer} clear={doClear} thinking={thinking}
       onWinner={handleWinner} onPlayerChange={handlePlayerChange} />
      <ScoreBoard winner={winner} onReset={onReset}/>
      <Dialog open={thinking} onClose={() => {}}>
        <DialogTitle>Minute, je reflechis...</DialogTitle>
      </Dialog>
    </Box>
  );
};

export default Game;
