// components/GameBoard.js
import React, { useContext, useEffect, useRef, useState } from 'react';
import Vaisseau from './Vaisseau';
import Enemy from './Enemy';
import { Box } from '@mui/material';
import { SpaceContext } from './SpaceProvider';
import Tir from './Tir';
import './shoot.css';
import lvlUpImg from './images/lvlup.png';
import explosionImg from './images/explosion.gif';
import multiTirImg from './images/mitraillette.png';

const Espace = () => {
    
  const { vaisseau, explosions,updatePosition, enemies, generateEnemies, shoot, tirs,bonuses, animateTirs, animateEnemies} = useContext(SpaceContext);
  
  const espaceRef = useRef();

  //initialisation
  useEffect(()=>{
    const espaceDispo = espaceRef.current.getBoundingClientRect().width;
    generateEnemies(0, 0, ['boss'],{width:espaceDispo,height:espaceRef.current.getBoundingClientRect().height}, 0.99);
 
  },[])

  // Fonction pour mettre à jour la position du joueur en fonction de la souris
  const handleMouseMove = (event) => {
    const { clientX, clientY } = event;
    // jamais utiliser event.target.getBoundingClientRect().left, parce qu'on peut tomber sur le vaisseau
    const offx = espaceRef.current.getBoundingClientRect().left;
    updatePosition({ x: clientX- offx-25, y: clientY });//25 pour vaisseau image width/2
  };
  // animation

  // Fonction d'animation pour mettre à jour les positions des tirs
 

  // Utiliser requestAnimationFrame pour appeler l'animation à chaque frame
  const animate = () => {
    animateTirs();
    animateEnemies();
    requestAnimationFrame(animate);
  };

  useEffect(() => {
    animate(); // Démarrer l'animation lorsque le composant est monté
    return () => cancelAnimationFrame(animate); // Arrêter l'animation lorsque le composant est démonté
  }, []);

  return (
    <Box ref={espaceRef}
      style={{ position: 'absolute',cursor:'none', background:'#222',height:'100%',width:'100%' }}
      onMouseMove={handleMouseMove}
    >
        {tirs.map((tir, index) => (
        <Tir key={index} x={tir.x} y={tir.y} />
      ))}
      <Vaisseau x={vaisseau.x} y={vaisseau.y} type={vaisseau.type} onClick={shoot}/>
      {enemies.map((enemy) => (
        <Enemy key={enemy.id} x={enemy.x} y={enemy.y} type={enemy.type} />
      ))} 
      {bonuses.map((enemy) => (
        <Bonus key={enemy.id} x={enemy.x} y={enemy.y} type={enemy.type} />
      ))}
      {explosions.map((explo) => (
        <Explosion key={explo.id} x={explo.x} y={explo.y} />
      ))}
     
    </Box>
  );
};

export default Espace;


const Bonus =(props)=>{
    let img = lvlUpImg;
    if(props.type==='multiTir')
        img=multiTirImg;
    const bonusStyle={
        width:30,height:30
        ,backgroundImage:`url(${img})`
        ,backgroundSize:'contain'
        ,position:'absolute'
        ,top:props.y+'px'
        ,left:props.x+'px'
    }
    return <div style={bonusStyle}></div>
}

const Explosion = ({ x, y }) => {
  
    return (
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: '40px',
          height: '40px',
          background: `url(${explosionImg}) center/cover`,
          transition: 'opacity 0.3s ease-in-out',
        }}
      />
    );
  };