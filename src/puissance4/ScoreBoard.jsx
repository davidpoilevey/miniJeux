import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Button, makeStyles } from '@material-ui/core';

import './Board.css';

const useStyles = makeStyles({
  winnerAnimation: {
    textAlign: 'center',
    marginTop: '20px',
  },
  scoreTable: {
    marginTop: '20px',
  },
});


const ScoreBoard = ({ winner, onReset }) => {
  const classes = useStyles();
  const [victoires, setVictoires] = useState({ red: 0, yellow: 0 });
// change victoires on winner change
  useEffect(()=>{
    if(winner!=null){
       
       
        setVictoires(oldVic=>{
            const newVic = {...oldVic};
            newVic[winner]++;
            return newVic;
        });
    }
  },[winner]);

  const handleReset = () => {
    setVictoires({ red: 0, yellow: 0 });
    onReset();
  };
  const handleNewGame = () => {
  
    onReset();
  };

  return (
    <div className='score-container'>
      {winner && (
        <div className="winner-animation">
          <h3>{winner} a gagné !</h3>
        </div>
      )}
      
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Joueur</TableCell>
            <TableCell>Victoires</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Red</TableCell>
            <TableCell>{victoires.red}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Yellow</TableCell>
            <TableCell>{victoires.yellow}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      
      <div className="button-container">
        <Button variant="contained" color="primary" onClick={handleNewGame}>
          Nouvelle partie
        </Button>
        <Button variant="contained" color="secondary" onClick={handleReset}>
          Reset
        </Button>
      </div>
    </div>
  );
      }

export default ScoreBoard;


