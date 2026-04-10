import React, { useEffect, useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { specialCards, specialCardsNoColor } from './UnoDeck';
import { Box } from '@material-ui/core';

const useStyles = makeStyles({
  carte: {
    position: 'absolute',
    width: '60px',
    height: '100px',
    borderRadius: '15px',
    boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.3)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '18px',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  flyingCard: {
    
  },
  disabled: {
    filter: 'brightness(0.5)',
  },
  // Ajoutez d'autres styles pour les autres types de cartes si nécessaire
});

const Carte = ({ carte, index, isHuman=false,carteValide, onClick, position }) => {  // props contains onClick
  const classes = useStyles(carte);
  const refCarte = useRef();
  const setRef=(elt)=>{
    if(refCarte.current==null)
        refCarte.current=elt;
        
  }
const posStyle = (position==null&&index!=null)?{left:(index*20)+'px'}
:(position||{});
if(isHuman)
    posStyle.left=(index*110 )+'px'


posStyle.border= '8px double '+carte.color;
posStyle.backgroundImage=carte.color==='multicolore'?'background-image: radial-gradient(circle at 50% 50%, red 0%, red 25%, blue 25%, blue 50%, green 50%, green 75%, yellow 75%, yellow 100%);'
                                                  :'repeating-linear-gradient(45deg, '+carte.color+', '+carte.color+' 10px, #eeeebb 10px, #eeeebb 20px)';

  const renderCardContent = () => {
    if (carte.color!=null) {
      return <Box ref={setRef}
      onClick={carteValide?onClick:null}
      style={{...posStyle}}
       className={`${classes.carte}`}>
        {carte.value>10?carte.type:carte.value}
        </Box>;
    } else if (specialCardsNoColor.some(c=>c===carte.type)) {
      return <Box  ref={setRef} onClick={onClick} 
       style={{...posStyle,background:'rgba(200,200,200,0.6)'}}
        className={`${classes.carte}`}>{carte.type}</Box>;
    }
    // Ajoutez des cas pour les autres types de cartes si nécessaire
  };

  return <Box className={carteValide?'':classes.disabled}>
    {renderCardContent()}</Box>;
};

export default Carte;

export const FlyingCarte = ({ carte, centre, arrived }) => {
    const [currentPosition, setCurrentPosition] = useState(carte.position);
  
    useEffect(() => {
      // Calculez la distance à parcourir
      const deltaX = centre.x - carte.position.left;
      const deltaY = centre.y - carte.position.top;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  
      // Vitesse de l'animation en pixels par milliseconde
      const speed = 0.9;
      const intervalDelay = 50; // Environ 60 images par seconde
  
      let progress = 0;
  
      const intervalId = setInterval(() => {
        // Vérifiez si l'animation est terminée
        if (progress >= distance) {
          // Arrêtez l'intervalle
          clearInterval(intervalId);
          // Appelez le callback arrived
          arrived();
          return;
        }
  
        // Calculez la nouvelle position en fonction de la vitesse et du temps écoulé
        progress += speed * intervalDelay;
        const newPosition = {
          top: carte.position.top + (progress * deltaY) / distance,
          left: carte.position.left + (progress * deltaX) / distance,
        };
  
        // Mettez à jour la position actuelle
        setCurrentPosition(newPosition);
      }, intervalDelay);
  
      // Nettoyez l'intervalle lorsqu'il n'est plus nécessaire
      return () => clearInterval(intervalId);
    }, [carte, centre, arrived]);
  
    const classes = useStyles(carte);
  
    return (
      <div
        className={`${classes.flyingCard}`}
        style={{
          top: currentPosition.top,
          left: currentPosition.left,
        }}
      >
        <Carte carte={carte} position={currentPosition} carteValide />
      </div>
    );
  };
  