import React, { useCallback, useEffect } from "react";
import { KNIGHT_SIZE, useRPGContext } from "./RPGContext";
import {EntityUI } from "./collision/Entities";
import WallUI from "./collision/Mur";
import { Alert, Box } from "@mui/material";
import imgSol from './images/fondSol.png';
import imgSmoke from './images/pouff.gif';
import { EnemyAI } from "./collision/EnemyAI";

const MatosLayer = React.forwardRef(({...props}, ref)=>{

  const { state, dispatch, getEntity, collisionSystem} = useRPGContext();
  const { matos, knightPos } = state;

   
   const stableAnimationComplete = useCallback((obj) => {
    
  if (obj.monster) {
    EnemyAI.handleAnimationComplete(obj, knightPos, dispatch, getEntity, collisionSystem);
  }

  dispatch({ type: 'NEXT_ANIMATION', payload: obj });
}, [dispatch, knightPos]);

    return   <React.Fragment  ref={ref}>
      {/* Porte */}
      {matos.map(obj=>{
        if(obj.isNotAnimation)
          return <EntityInanimatedUI key={obj.id}
            objectType={obj.entity} 
            matosObject={obj}/>
        else
          return <EntityUI key={obj.id} getEntity={getEntity}
            onAnimationComplete={stableAnimationComplete }
            completeObj={obj}/>
      })}
      </React.Fragment>
});

export default MatosLayer





const EntityInanimatedUI=({objectType, matosObject})=>{
// smokeFX
if(objectType==='smokeFX')
  return <Box
    component="img"
    src={`${imgSmoke}`} // ou object.src si tu veux le rendre dynamique
    sx={{ position: 'absolute',
        left: matosObject.position.x,
        top: matosObject.position.y,
      width: 64,
      height: 64,
      pointerEvents: 'none',
      userSelect: 'none',
      zIndex: 100
    }}
  />
  if(objectType==='mur'||objectType==='murGrimpable'||objectType==='murPoussable')
    return <WallUI subtype={matosObject.entity} {...matosObject.position}/>
if(objectType==='sol')
  return <FloorUI {...matosObject.position}/>
  return <Alert severity="warning">Il faut le definir ici ce {objectType}</Alert>;
}
const FloorUI = ({ x, y, width, height }) => {
  
  return (
    <Box
      sx={{
        position: 'absolute',
        left: x,
        top: y,
        width: '100%',
        height: height,
        backgroundSize:'cover',backgroundPositionY:-40,
        backgroundImage: `url(${imgSol})`

      }}
    >
    </Box>
  );
};
