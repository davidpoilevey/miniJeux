import { Box, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import SSGame from './SSGame';
import SSView from './SSView';

const SpeedShoot = ()=>{
   // SSGame fait le provider 
   const [score, setScore] = React.useState(0);
   const [vitesse, setVitesse] = React.useState(0);
   const [posY, setPosY] = React.useState(0);
   const isKeyDown = React.useRef(false);
   const intervalRef = React.useRef(null);
   useEffect(()=>{
    const handleKeyDown = (event) => {
      if(isKeyDown.current)
        return;
        if (event.key === 'ArrowLeft') {
          isKeyDown.current = true;
          intervalRef.current = setInterval(() => {
            setVitesse((prevVitesse) => Math.max(0, prevVitesse - 1));
          }, 1000);
        } else if (event.key === 'ArrowRight' && vitesse < 10) {
          isKeyDown.current = true;
          intervalRef.current = setInterval(() => {
            setVitesse((prevVitesse) => Math.min(10, prevVitesse + 1));
          }, 1000);
        }
        else if(event.key==='ArrowUp'){
          setPosY(p=>Math.max(0,p-5));
        }
        else if(event.key==='ArrowDown'){
          setPosY(p=>Math.min(400,p+5));
        }
      };

    const handleKeyUp = () => {
        clearInterval(intervalRef.current);
        isKeyDown.current = false;
      };
  
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('keyup', handleKeyUp);
  
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keyup', handleKeyUp);   
  
        clearInterval(intervalRef.current);
      };
},[]);
    return <SSGame posY={posY} vitesse={vitesse} setVitesse={setVitesse}
     score={score} setScore={setScore}>
        <SSView >
        </SSView>
        <BarreDeVitesse vitesse={vitesse} score={score}/>
     
    </SSGame>
}

export default SpeedShoot;


const BarreDeVitesse = ({ vitesse, score }) => {
  let vitColor = '#FFFFFF';
  switch(vitesse){

    case 1:vitColor='#99FFFF';break;
    case 2:vitColor='#33FFFF';break;
    case 3:vitColor='#55cc44';break;
    case 4:vitColor='#eeee44';break;
    case 5:vitColor='#FFbb00';break;
    case 6:vitColor='#FFAA00';break;
    case 7:vitColor='#FF8800';break;
    case 8:vitColor='#FF3300';break;
    case 9:vitColor='#FF0000';break;
    case 10:vitColor='#BB0000';break;
    default:
      vitColor = '#FFFFFF';
  }

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        padding: 1, // Add padding for spacing
        borderRadius: 2, // Add rounded corners
        backgroundImage: `linear-gradient(to right, ${vitColor}, #777)`,
      }}
    >
      <Box
        sx={{
          height: 60,
          width: `${vitesse * 100}px`,
          backgroundColor: vitColor,
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'center',
          borderRadius: 2, // Match the outer box's border radius
        }}
      >
        <Typography variant="h5">
          {vitesse}
        </Typography>
      </Box>
      <Typography
        variant="h3"
        sx={{
          backgroundColor: 'blue',
          backgroundImage: 'linear-gradient(to right, #f00, #770, #00a)',

          color: 'yellow',
          borderRadius: 2, // Match the outer box's border radius
          padding: 1, // Add padding for spacing
        }}
      >
        {score}
      </Typography>
    </Box>
  );
};