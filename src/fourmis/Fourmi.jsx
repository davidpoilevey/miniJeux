import { Badge, Box } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { TILE_SIZE, VITESSE_FOURMI } from './Tiles';
import imgFourmi from './images/fourmi.png';
import imgFourmiRemple from './images/fourmiRemplie.png';
import { Puceron } from './Carte';

const FOURMI_SIZE=30;

const Fourmi = ({ fourmi ,getTypeColor}) => {
  const [animationStyle, setAnimationStyle] = useState({});

  useEffect(() => {
    if (fourmi.target) {
      const animationDuration = VITESSE_FOURMI; // en millisecondes
      const startTime = Date.now();

      let progressGuess = Math.random();
      const getProgress = elapsed=>{

        let progress = elapsed / animationDuration;//lineaire par defaut
        if(progressGuess<0.33){ // 1chance sur 3 easein
          progress = Math.pow(elapsed / animationDuration, 2);
        }
        else if(progressGuess<0.66)// 1chance sur 3 easeout
           progress = 1 - Math.pow(1 - elapsed / animationDuration, 2); // Effet ease-out
        return progress;
      }

      const animate = () => {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;

        const targX = fourmi.target.col*TILE_SIZE+TILE_SIZE/2;
        const targY = fourmi.target.row*TILE_SIZE+TILE_SIZE/2;
        if (elapsed < animationDuration) {
             const progress = getProgress(elapsed);
          const newX = fourmi.x + progress * (targX - fourmi.x);
          const newY = fourmi.y + progress * (targY - fourmi.y);

          setAnimationStyle({
            top: newY - FOURMI_SIZE / 2 + 'px',
            left: newX - FOURMI_SIZE / 2 + 'px',
          });

          requestAnimationFrame(animate);
        } else {
          // L'animation est terminée, réinitialise la position
          setAnimationStyle({
            top: targY - FOURMI_SIZE / 2 + 'px',
            left: targX- FOURMI_SIZE / 2 + 'px',
          });
        }
      };

      // Démarre l'animation
      animate();
    }
  }, [fourmi?.target]);
  const teamColor = getTypeColor(fourmi.equipe);
  const img = fourmi.status === 'Remplie'?imgFourmiRemple:imgFourmi;
  return (
    <Box
      style={{
        position: 'absolute',
        width: FOURMI_SIZE + 'px',
        height: FOURMI_SIZE + 'px',
        ...animationStyle,
      }}
    >
    <img alt="fourmi" src={img} width={FOURMI_SIZE}
     style={{ filter: `drop-shadow(5px 5px 5px ${teamColor})` }}/>
    {fourmi.puceron&&<Puceron size={FOURMI_SIZE/2}/>}
    </Box>
  );
};


export default Fourmi;
