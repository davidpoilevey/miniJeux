// Door.js - Composant pour afficher la porte
import React from 'react';

import { BaseEntity, ENTITY_TYPES } from './Entities';
import { soundManager } from '../sons/SoundManager';


// matos:[{id:'door1', entity:'porte', objStatus:'idle', scale:2  , position:{x:800,y:500}}],

class Door extends BaseEntity {
  constructor(x, y, id = 'door1') {
    super(x, y, id, ENTITY_TYPES.INTERACTABLE);
    this.subtype = 'door';
    this.width = 40;
    this.height = 80;
    this.objStatus = 'closed';
    this.interactionRange = 50;
    this.collisionBox= { width:60, height: 190, offsetX: -20, offsetY: -130 };
  }

  isObstacle() {
    return this.objStatus === 'closed';
  }
  isInteractable() {
    return true;
  }

  onInteract(ctxt, dispatch) { 
    if (this.objStatus === 'closed') {
      this.objStatus = 'open';
      soundManager.play('porte');
      dispatch({type:'UPDATE_MATOS', payload:this});     
    }
  }
}

export function createDoor(x, y, id = 'door1') {
  return new Door(x, y, id);
}


// portal

class Portal extends BaseEntity {
  constructor(x, y, id = 'door1') {
    super(x, y, id, ENTITY_TYPES.TRIGGER);
    this.subtype = 'portal';
    this.width = 64;
    this.height = 80;
    this.stock = 5;
  }
  isTrigger() {
    return true;
  }

  onContact(state, dispatch) { 
    
     dispatch({ type: 'SET_MESSAGE', payload: 'Spawn ennemi !' });
  }
}
export function createPortal(x, y, id = 'portal') {
  return new Portal(x, y, id);
}
class PortalFinNiveau extends BaseEntity {
  constructor(x, y, id = 'door1') {
    super(x, y, id, ENTITY_TYPES.TRIGGER);
    this.subtype = 'finNiveau';
    this.width = 64;
    this.height = 60;
    this.triggered=false;
    this.collisionBox= { width:65, height: 65, offsetX:60, offsetY: 60 };
  }
  isTrigger() {
    return !this.triggered;
  }

  onContact(state, dispatch) {
    this.triggered=true;
    soundManager.play('finNiveau');
    dispatch({ type: 'END_LEVEL' });
     dispatch({ type: 'SET_MESSAGE', payload: 'nouveau niveau!' });
  }
}
export function createPortalFinNiveau(x, y, id = 'portal') {
  return new PortalFinNiveau(x, y, id);
}

class Fire extends BaseEntity {
  constructor(x, y, id = 'door1') {
    super(x, y, id, ENTITY_TYPES.TRIGGER);
    this.subtype = 'fire';
    this.width = 32;
    this.height =12;
    this.collisionBox= { width:50, height: 40, offsetX: 120, offsetY: 105 };
  }
  isTrigger() {
    return true;
  }

  onContact(state, dispatch) { 
    soundManager.play('fire');
    const ouille = Math.floor(Math.random()*5)+2
     dispatch({ type: 'TAKE_DAMAGE', payload: {amount:ouille} });
  }
}
export function createFire(x, y, id = 'portal') {
  return new Fire(x, y, id);
}


class Chest extends BaseEntity {
  constructor(x, y, id) {
    super(x, y, id, ENTITY_TYPES.INTERACTABLE);
   this.subtype='coffre';
    this.needKey=null;
    this.content={gold:10}
    this.objStatus = 'closed';
    this.collisionBox= { width:80, height: 70, offsetX: 75, offsetY: 100 };
  }
  isObstacle() {return true}
  setKey(keyCode){
    this.needKey=keyCode;// juste une string
  }
  setContent(content){
    this.content=content;// {gold, equipment, xp}
  }
  isInteractable() {
    return this.objStatus==='closed'; // On peut interagir seulement si pas ouvert
  }
onInteract(state, dispatch, collisionSystem) {
  if (
    this.objStatus === 'closed' &&
    (this.needKey == null || state.inventory[this.needKey] != null)
  ) {
    soundManager.play('coffre');
    this.objStatus = 'open';
    dispatch({ type: 'UPDATE_MATOS', payload: this });

    dispatch({
      type: 'OPEN_CONTAINER',
      payload: { container: this, key: this.needKey }
    });

    if (this.content?.gold) {
      
      const me = this;

      setTimeout(() => {
        // Ajouter la fumée
        const smoke = {
          id: `smoke-${Date.now()}`,
          entity: 'smokeFX',
          isNotAnimation: true,
          gif: true,
          oneShot: true,
          position: {
            x: this.x+this.collisionBox.offsetX, // ajuster selon centre
            y: this.y+this.collisionBox.offsetY
          }
        };
        dispatch({ type: 'ADD_MATOS', payload: smoke });

        // Supprimer le coffre
        dispatch({ type: 'REMOVE_MATOS', payload: me });
        collisionSystem.removeEntity(me.id);
        soundManager.play('gold');

       // Supprimer la fumée après 1.5s
        setTimeout(() => {
          dispatch({ type: 'REMOVE_MATOS', payload: smoke });
        }, 800);
      }, 1000);
    }
  }
}


}
export function createChest(x, y, id, content={gold:50, potions:3}) {
  const coffre = new Chest(x, y, id);
  coffre.setContent(content);
  return coffre;
}
