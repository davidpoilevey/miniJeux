// Door.js - Composant pour afficher la porte
import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import { BaseEntity, ENTITY_TYPES } from './Entities';
import imgTerre from '../../bactery/images/fondTerre.jpg';
import imgPierre from '../images/stone.jpg';
import imgCarton from '../images/carton.jpg';
import { KNIGHT_SIZE } from '../RPGContext';

const WallUI = ({ x, y, width, height , subtype}) => {
  const bg = useMemo(()=>{
    let bg = '#847853'
    if(subtype==='murGrimpable')
      bg=`url(${imgTerre})`;
    if(subtype==='mur')
      bg=`url(${imgPierre})`;
    if(subtype==='murPoussable')
      bg=`url(${imgCarton})`;
    return bg;
  },[subtype])
  return (
    <Box
      sx={{
        position: 'absolute',
        left: x,
        top: y,
        width: width,
        height: height,
        backgroundSize:'cover',
        backgroundImage: bg,
        border: '2px solid rgb(239, 16, 16)',
        borderRadius: '18px 18px 0 0'
      }}
    >
    </Box>
  );
};

export default WallUI;



class Wall extends BaseEntity {
  constructor(x, y,width,height, id) {
    super(x, y, id, ENTITY_TYPES.OBSTACLE);
    this.subtype = 'wall';
    this.width = width;
    this.height = height;
    
    this.collisionBox= { width, height, offsetX: 0, offsetY: 0 }
  }
  isObstacle() {
    return true;
  }
}

class GrimpableWall extends Wall {
  constructor(x, y,width,height, id) {
    super(x, y, width,height, id, ENTITY_TYPES.OBSTACLE);
    this.subtype = 'grimpable';
  }
  isInteractable(){
    return true;
  }
  onInteract(state, dispatch){

    dispatch({type:'SET_GRIMPANT', payload:{grimpant:!state.grimpant, mur:this}})
  }
}
export function createWall(x, y, width,height,id = 'door1') {
  return new Wall(x, y,width,height, id);
}
export function createSol(x, y, width,height,id = 'door1') {
  const sol = new Wall(x, y,width,height, id);
  sol.subtype='sol'
  return sol;
}


export function createGrimpableWall(x, y, width,height,id = 'door1') {
  return new GrimpableWall(x, y,width,height, id);
}

class PushableWall extends Wall {
  constructor(x, y, width, height, id) {
    super(x, y, width, height, id, ENTITY_TYPES.OBSTACLE);
    this.subtype = 'pushable';
    this.isBeingPushed = false;
    this.pushInterval = null;
  }

  isInteractable() {
    return true;
  }

  onInteract(state, dispatch, collisionSystem) {
    if (this.isBeingPushed) return;

    const knightX = state.knightPos.x;
    const wallX = this.x;
    const direction = knightX < wallX ? 'right' : 'left';

    this.startPushLoop(direction, dispatch, state, collisionSystem);
    dispatch({ type: 'SET_ACTION', payload: 'pousse' });
  }

  startPushLoop(direction, dispatch, state, collisionSystem) {
    if (this.pushInterval) return;

    this.isBeingPushed = true;
    const speed = 1; // très lent
let knightX = state.knightPos.x;
    this.pushInterval = setInterval(() => {
      const delta = direction === 'right' ? speed : -speed;
      const nextX = this.x + delta;

      const nextPos = { x: nextX, y: this.y };
      const collision = collisionSystem.canMoveTo(
        { x: this.x, y: this.y },
        nextPos,
        this.collisionBox, this.id
      );

      if (!collision.canMove) {
        this.stopPushLoop();
        return;
      }

      this.x = nextX;
      this.position={x : nextX, y:this.y, width:this.width, height:this.height}

      dispatch({ type: 'UPDATE_MATOS', payload: this });
      knightX+=delta;
      dispatch({ type: 'MOVE_TO', payload: {...state.knightPos, x:knightX} });

      // Si le joueur n’est plus collé, on arrête (à implémenter proprement ailleurs)
      const dx = Math.abs(knightX+KNIGHT_SIZE.width - this.x);
      if (dx > 64) {
        this.stopPushLoop();
        dispatch({ type: 'SET_ACTION', payload: 'idle' });
      }

    }, 30);
  }

  stopPushLoop() {
    if (this.pushInterval) {
      clearInterval(this.pushInterval);
      this.pushInterval = null;
    }
    this.isBeingPushed = false;
  }
}
export function createMurPoussable(x, y, width, height, id = 'push1') {
  return new PushableWall(x, y, width, height, id);
}
