import { Box } from "@mui/material"
import React, { useEffect, useState } from "react"
import { useSSContext } from "./SSGame";
import imgPetit from '../shootemup/images/enemy-basic.png';
import imgMoyen from '../shootemup/images/enemy-type2.png';
import imgGrand from '../shootemup/images/enemy-boss.png';
import soleilImg from './soleil.png';

// Types d'ennemis avec leurs caractéristiques
const ennemisTypes = [
    {
      type: 'petit',
      img: imgPetit,
      width: 40,
      height: 40,
    },
    {
      type: 'moyen',
      img: imgMoyen,
      width: 60,
      height: 60,
    },
    {
      type: 'grand',
      img: imgGrand,
      width: 80,
      height: 80,
    },
  ];
  export const ennemisByType = type=>{
    return ennemisTypes.find(e=>e.type===type);
  }


const SSEnnemies=({screenWidth})=>{
   
    const {enemies, perso, setEnnemies, vitesse, gameOver} = useSSContext();
    const [intervalId, setIntervalId] = useState(null);
    const [tick, setTick] = useState(1);
    const lastCreated = React.useRef(0);
    const positionY = perso.y;
    useEffect(() => {
      const now=(new Date()).getTime();
      const startInterval = () => {
       if(intervalId!=null)
         clearTimeout(intervalId);
        setIntervalId(setTimeout(createEnnemi, 100));
      };
        const createEnnemi = () => {
          const newEnnemi = {
            x: screenWidth,
            y: positionY,
            vie: Math.floor(Math.random() * 3) + 1, // Entre 1 et 5
            vitesse: vitesse+Math.floor(Math.random() * 5), // Entre 1 et 5
            type: ennemisTypes[Math.floor(Math.random() * ennemisTypes.length)].type,
          };
          setEnnemies(n=>{return [...n, newEnnemi]});
         
          lastCreated.current=now;
        };
    
    if(screenWidth>0 && now-lastCreated.current>100)
        startInterval();
    
        return () => clearTimeout(intervalId);
      }, [setEnnemies, positionY, screenWidth,vitesse,tick]);

      useEffect(() => {
        // timer general
      const intervalTime = Math.random() * 2000 + 1000; // Entre 100ms et 3s
       
        const intervalId = setInterval(()=>{ setTick(t=>t+1);}, intervalTime);
        return () => clearInterval(intervalId);
      },[tick]);
      useEffect(() => {
        const moveEnnemies = () => {
          setEnnemies(prevEnnemies => {
            return prevEnnemies.map(ennemi => {
              const distanceX = perso.x - ennemi.x;
              const distanceY = perso.y - ennemi.y;
              const angle = Math.atan2(distanceY, distanceX);
    
              const newX = ennemi.x + ennemi.vitesse * Math.cos(angle);
              const newY = ennemi.y + ennemi.vitesse * Math.sin(angle);
    
              return {
                ...ennemi,
                x: newX,
                y: newY,
              };
            });
          });
        };
    
        // Par exemple, mettre à jour la position des ennemis 60 fois par seconde
        let intervalId=null;
        if(!gameOver)
         intervalId = setInterval(moveEnnemies, 1000 / 20);
    
        return () => intervalId?clearInterval(intervalId):null;
      }, [setEnnemies, perso.x, perso.y, gameOver]);


    return <>
    {enemies.map((enmy,idx)=>{
        return <EnemyBox  key={'enmy'+idx} enmy={enmy}/>
    })}
    </>
}
export default SSEnnemies;

const EnemyBox=({enmy})=>{

  const enmyType = ennemisByType(enmy.type);
  const imgEnnemi = enmyType.img;
  const enmyWidth = enmyType.width;
  const enmyHeight = enmyType.height;
  let vies=new Array(enmy.vie).fill(1);
 
  
  return <Box sx={{position:'absolute', top:enmy.y, left:enmy.x, display:'flex'}}>
  <img src={imgEnnemi} alt={enmy.type} width={enmyWidth} height={enmyHeight}/>
  {vies.map((v,idx)=><Box sx={{position:'absolute',left:idx*10}}>
    <img src={soleilImg} alt='soleil' width={15} height={15}/></Box>)}
</Box>
}