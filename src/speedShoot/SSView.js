import { Box, useTheme } from '@mui/material';
import React, { useRef, useEffect, useState } from 'react';
import fondRoulant from './fondroulant.jpg';
import imgCible from './cible.png';
import explosion from '../shootemup/images/explosion.gif';
import { useSSContext } from './SSGame';
import SSPerso from './SSPerso';
import SSEnnemies from './SSEnnemies';

import SSstyles from './SSstyles.css';

const HAUTEUR = 400;


const SSView = ({ children }) => {
  const ref = useRef(null);
  const [sparkles, setSparkles] = useState([]);
  const [viewWidth, setViewWidth] = useState(0);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const {shootAtEnemy, stopShooting, vitesse, checkEnnemiTouche} = useSSContext();
  const cibleDown = evt=>{
    setSparkles(s=>([...s, {x:evt.clientX, y:evt.clientY, birth:(new Date()).getTime()}]));
    shootAtEnemy({x:evt.clientX, y:evt.clientY});
  }
  const cibleUp = evt=>{
    stopShooting({x:evt.clientX, y:evt.clientY});
  }
  useEffect(() => {
    const handleResize = () => {
      if (ref.current) {
        setViewWidth(ref.current.offsetWidth);
      }
    };

    const handleMouseMove = (event) => {
        setCursorPosition({ x: event.clientX, y: event.clientY });
      };
    ref.current.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    handleResize(); // Exécuter immédiatement pour avoir la largeur initiale

    return () => {
      window.removeEventListener('resize', handleResize);
      if(ref.current!=null)
        ref.current.removeEventListener('mousemove', handleMouseMove);
    };
  }, [ref]);

  useEffect(()=>{
  
      // elimination des sparkles apres 2 secondes
      const now=(new Date()).getTime();
      // on verifie qu'un enemi touche le perso
      checkEnnemiTouche(now);
          setSparkles(old=>{
            return old.filter(s=>((now-s.birth)<600));
          })

       
},[checkEnnemiTouche,setSparkles]);

  return (
    <Box className={SSstyles.background}
    sx={{backgroundImage: `url(${fondRoulant})`, 
    width: '100%',
    height: 400,
    position: 'relative',
    cursor: 'none',
    backgroundSize: 'cover',
    animation: vitesse
        ? `scroll ${50/vitesse}s linear infinite`
        : 'none'}}
      ref={ref}

      onMouseDown={cibleDown}
      onMouseUp={cibleUp}
    >
        <CibleCursor cursorPosition={cursorPosition}/>
        {/* Un élément pour détecter les clics */}
     
      <SSPerso/>
      <SSEnnemies screenWidth={viewWidth}/>
      {sparkles.map((s,sidx)=>{
        return <Box sx={{position:'absolute', top:s.y, left:s.x}}><img src={explosion} width={10} height={10} alt="explosion"/></Box>
      })}
      {children}
    </Box>
  );
};

export default SSView;

const CibleCursor = ({cursorPosition })=>{
    return  <div
    style={{
      position: 'absolute',
      top: cursorPosition.y-5,
      left: cursorPosition.x-10,
      width: '30px',
      height: '30px',
      backgroundSize:'cover',
      backgroundImage: 'url('+imgCible+')', 
    }}
  />

}