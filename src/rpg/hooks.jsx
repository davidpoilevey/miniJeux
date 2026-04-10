import React, { useMemo } from "react";
import imgAttack1 from './images/Attack_KG_1.png';
import imgAttack2 from './images/Attack_KG_2.png';
import imgAttackLancee from './images/Attack_KG_3.png';
import imgAttackTournoie from './images/Attack_KG_4.png';
import imgAccroupiIdle from './images/Crouching_Idle_KG_2.png';
import imgAccroupiMarche from './images/Crouching_Walk_KG_2.png';
import imgDashing from './images/Dashing_KG_1.png';
import imgDrinking from './images/Drinking_KG_1.png';
import imgMort1 from './images/Dying_KG_1.png';
import imgMort2 from './images/Dying_KG_2.png';
import imgCoup from './images/Hurt_KG_2.png';
import imgTombe from './images/Fall_KG_2.gif';
import imgAtterris from './images/Landing_KG_2.png';
import imgIdle from './images/Idle_KG_2.png';
import imgWalking from './images/Walking_KG_2.png';
import imgJump from './images/Jump_KG_2.gif';
import imgWin from './images/knight_win.png';
import imgPowerUp from './images/Power_Up_KG_1.png';
import imgGrimpe from './images/Grab_idle_KG_1.png';
import imgGrimpeEnHaut from './images/Ledge_Grab_KG_1.png';
import imgPushing from './images/Pushing_KG_1.png';
import imgRoulade from './images/Rolling_KG_1.png';
import imgBouclierStart from './images/Shield_Up_KG_1.png';
import imgBouclier from './images/Shield_idle_KG.png';
import imgPorte from './images/door.png';
import imgCoffre from './images/coffre.png';
import imgFire from './images/feu.png';
import imgPortal from './images/portal.png';
import imgFinNiveau from './images/finNiveau.png';
import { createChest, createDoor, createFire, createPortal, createPortalFinNiveau } from "./collision/Porte";
import { createGrimpableWall, createMurPoussable, createSol, createWall } from "./collision/Mur";

import imgSqIdle from './images/Skeleton/Idle.png'
import imgSqAttack from './images/Skeleton/Attack.png'
import imgSqTakeHit from './images/Skeleton/Hurt.png'
import imgSqDie from './images/Skeleton/Dead.png'
import imgSqWalk from './images/Skeleton/Walk.png'
import imgZ1Idle from './images/Zombie_2/Idle.png'
import imgZ1Attack from './images/Zombie_2/Attack.png'
import imgZ1TakeHit from './images/Zombie_2/Hurt.png'
import imgZ1Die from './images/Zombie_2/Dead.png'
import imgZ1Walk from './images/Zombie_2/Walk.png'
import imgZ2Idle from './images/Zombie_3/Idle.png'
import imgZ2Attack from './images/Zombie_3/Attack.png'
import imgZ2TakeHit from './images/Zombie_3/Hurt.png'
import imgZ2Die from './images/Zombie_3/Dead.png'
import imgZ2Walk from './images/Zombie_3/Walk.png'
import imgoeilAttack from './images/oeil/Attack3.png'
import imgoeilTakeHit from './images/oeil/Hurt.png'
import imgoeilDie from './images/oeil/Death.png'
import imgoeilFlight from './images/oeil/Flight.png'
import { createEnnemi } from "./collision/Enemy";

export const OBJECT_ANIMATIONS = {
    coffre:{
        src:imgCoffre, frames:4, 
        frameWidth:923/4, frameHeight:270,speed:200,loop:false
    },
      fire: { 
            src: imgFire, 
            frames: 4, 
            frameWidth: 1190/4, 
            frameHeight: 210, 
            speed: 100,
            loop: true 
        },
      porte: { 
            src: imgPorte, 
            frames: 5, 
            frameWidth: 80/5, 
            frameHeight: 32, 
            speed: 100,
            loop: false 
        }
        , portal: { 
            src: imgPortal, 
            frames: 10, 
            frameWidth: 64, 
            frameHeight: 64, 
            speed: 100,
            loop: true 
        }
        , finNiveau: { 
            src: imgFinNiveau, 
            frames: 5, 
            frameWidth: 900/5, 
            frameHeight: 187, 
            speed: 200,
            loop: true 
        },
        squelette_idle:{
            src:imgSqIdle,
            frames:6,
            frameWidth:768/6,
            frameHeight:128, 
            speed: 50,
            loop: true 
        },
        squelette_attaque:{
            src:imgSqAttack,
            frames:5,
            frameWidth:640/5,
            frameHeight:128, 
            speed: 100,
            loop: false 
        },
        squelette_takeHit:{
            src:imgSqTakeHit,
            frames:4,
            frameWidth:512/4,
            frameHeight:128, 
            speed: 100,
            loop: false 
        },
        squelette_die:{
            src:imgSqDie,
            frames:5,
            frameWidth:640/5,
            frameHeight:128, 
            speed: 100,
            loop: false 
        },
        squelette_walk:{
            src:imgSqWalk,
            frames:10,
            frameWidth:128,
            frameHeight:128, 
            speed: 100,
            loop: true 
        }

        , zombie1_idle:{
            src:imgZ1Idle,
            frames:6,
            frameWidth:768/6,
            frameHeight:128, 
            speed: 50,
            loop: true 
        },
        zombie1_attaque:{
            src:imgZ1Attack,
            frames:5,
            frameWidth:640/5,
            frameHeight:128, 
            speed: 100,
            loop: false 
        },
       zombie1_takeHit:{
            src:imgZ1TakeHit,
            frames:4,
            frameWidth:512/4,
            frameHeight:128, 
            speed: 100,
            loop: false 
        },
        zombie1_die:{
            src:imgZ1Die,
            frames:5,
            frameWidth:640/5,
            frameHeight:128, 
            speed: 100,
            loop: false 
        },
        zombie1_walk:{
            src:imgZ1Walk,
            frames:10,
            frameWidth:128,
            frameHeight:128, 
            speed: 100,
            loop: true 
        }         , zombie2_idle:{
            src:imgZ2Idle,
            frames:6,
            frameWidth:768/6,
            frameHeight:128, 
            speed: 50,
            loop: true 
        },
        zombie2_attaque:{
            src:imgZ2Attack,
            frames:5,
            frameWidth:640/5,
            frameHeight:128, 
            speed: 100,
            loop: false 
        },
       zombie2_takeHit:{
            src:imgZ2TakeHit,
            frames:4,
            frameWidth:512/4,
            frameHeight:128, 
            speed: 100,
            loop: false 
        },
        zombie2_die:{
            src:imgZ2Die,
            frames:5,
            frameWidth:640/5,
            frameHeight:128, 
            speed: 100,
            loop: false 
        },
        zombie2_walk:{
            src:imgZ2Walk,
            frames:10,
            frameWidth:128,
            frameHeight:128, 
            speed: 100,
            loop: true 
        }

            , oeil_idle:{
            src:imgoeilFlight,
            frames:8,
            frameWidth:1200/8,
            frameHeight:150, 
            speed: 50,
            loop: true 
        },
        oeil_attaque:{
            src:imgoeilAttack,
            frames:6,
            frameWidth:900/6,
            frameHeight:150, 
            speed: 100,
            loop: false 
        },
       oeil_takeHit:{
            src:imgoeilTakeHit,
            frames:4,
            frameWidth:600/4,
            frameHeight:150, 
            speed: 100,
            loop: false 
        },
        oeil_die:{
            src:imgoeilDie,
            frames:4,
            frameWidth:600/4,
            frameHeight:150, 
            speed: 100,
            loop: false 
        },
        oeil_walk:{
            src:imgoeilFlight,
            frames:8,
            frameWidth:1200/8,
            frameHeight:150, 
            speed: 100,
            loop: true 
        }
}
export const ANIMATIONS={
        // Attaques
        attaque1: { 
            src: imgAttack1, 
            frames: 6, 
            frameWidth: 100, 
            frameHeight: 64, 
            speed: 100,
            loop: false 
        },
        attaque2: { 
            src: imgAttack2, 
            frames: 6, 
            frameWidth: 100, 
            frameHeight: 64, 
            speed: 120,
            loop: false 
        },
        attaqueLancee: { 
            src: imgAttackLancee, 
            frames: 9, 
            frameWidth: 100, 
            frameHeight: 64, 
            speed: 80,
            loop: false 
        },
        attaqueTournoie: { 
            src: imgAttackTournoie, 
            frames: 5, 
            frameWidth: 100, 
            frameHeight: 64, 
            speed: 60,
            loop: false 
        },
        
        // Mouvement de base
        idle: { 
            src: imgIdle, 
            frames: 4, 
            frameWidth: 100, 
            frameHeight: 64, 
            speed: 200,
            loop: true 
        },
        marche: { 
            src: imgWalking, 
            frames: 7, 
            frameWidth: 100, 
            frameHeight: 64, 
            speed: 100,
            loop: true 
        },
        course: { 
            src: imgDashing, 
            frames: 4, 
            frameWidth: 100, 
            frameHeight: 64, 
            speed: 80,
            loop: false 
        },
        
        // Saut et chute
        saut: { 
            src: imgJump, 
            frames: 6, 
            frameWidth: 100, 
            frameHeight: 64, 
            speed: 200,
            loop: false 
        },
        tombe: { 
            src: imgTombe, 
            frames: 3, 
            frameWidth: 100, 
            frameHeight: 64, 
            speed: 150,
            loop: true 
        },
        atterris: { 
            src: imgAtterris, 
            frames: 4, 
            frameWidth: 100, 
            frameHeight: 64, 
            speed: 100,
            loop: false 
        },
        
        // Accroupi
        accroupiIdle: { 
            src: imgAccroupiIdle, 
            frames: 3, 
            frameWidth: 100, 
            frameHeight: 64, 
            speed: 200,
            loop: true 
        },
        accroupiMarche: { 
            src: imgAccroupiMarche, 
            frames: 4, 
            frameWidth: 100, 
            frameHeight: 64, 
            speed: 120,
            loop: true 
        },
        
        // Actions spéciales
        boit: { 
            src: imgDrinking, 
            frames: 7, 
            frameWidth: 100, 
            frameHeight: 64, 
            speed: 200,
            loop: false 
        },
        powerUp: { 
            src: imgPowerUp, 
            frames: 10, 
            frameWidth: 100, 
            frameHeight: 64, 
            speed: 100,
            loop: false 
        },
        pousse: { 
            src: imgPushing, 
            frames: 5, 
            frameWidth: 100, 
            frameHeight: 64, 
            speed: 150,
            loop: true 
        },
        roulade: { 
            src: imgRoulade, 
            frames: 10, 
            frameWidth: 100, 
            frameHeight: 64, 
            speed: 60,
            loop: false 
        },
        
        // Grimpe
        grimpe: { 
            src: imgGrimpe, 
            frames: 3, 
            frameWidth: 100, 
            frameHeight: 64, 
            speed: 100,
            loop: true 
        },
        grimpeEnHaut: { 
            src: imgGrimpeEnHaut, 
            frames: 6, 
            frameWidth: 100, 
            frameHeight: 64, 
            speed: 200,
            loop: false 
        },
        
        // Défense
        bouclierStart: { 
            src: imgBouclierStart, 
            frames: 7, 
            frameWidth: 100, 
            frameHeight: 64, 
            speed: 100,
            loop: false 
        },
        bouclier: { 
            src: imgBouclier, 
            frames: 4, 
            frameWidth: 100, 
            frameHeight: 64, 
            speed: 200,
            loop: true 
        },
        
        // Dégâts et mort
        coup: { 
            src: imgCoup, 
            frames: 4, 
            frameWidth: 100, 
            frameHeight: 64, 
            speed: 150,
            loop: false 
        },
        mort1: { 
            src: imgMort1, 
            frames: 5, 
            frameWidth: 100, 
            frameHeight: 64, 
            speed: 200,
            loop: false 
        },
        mort2: { 
            src: imgMort2, 
            frames: 6, 
            frameWidth: 100, 
            frameHeight: 64, 
            speed: 250,
            loop: false 
        },
        
        // Victoire
        victoire: { 
            src: imgWin, 
            frames: 5, 
            frameWidth: 100, 
            frameHeight: 64, 
            speed: 120,
            loop: true 
        }
    }
export function getPersoSpriteConfig(action, type, status) {
  if (type === 'monster') {
    action = `${action}_${status}`; // squelette_idle etc.
  }

  let spriteConfig;
  if (type == null) {
    spriteConfig = ANIMATIONS;
  } else if (type === 'object' || type === 'monster') {
    spriteConfig = OBJECT_ANIMATIONS;
  } else {
    throw new Error(`Type "${type}" inconnu dans getPersoSpriteConfig`);
  }

  const currentSprite = spriteConfig[action] || spriteConfig.idle;

  const getSpritePosition = (frameIndex) => {
    const x = (frameIndex % Math.floor(currentSprite.frameWidth)) * currentSprite.frameWidth;
    const y = Math.floor(frameIndex / Math.floor(currentSprite.frameWidth)) * currentSprite.frameHeight;
    return { x: -x, y: -y };
  };

  const getSpriteStyle = (frameIndex = 0, scale = 1) => {
  const position = getSpritePosition(frameIndex);
  return {
    width: currentSprite.frameWidth * scale,
    height: currentSprite.frameHeight * scale,
    backgroundImage: `url(${currentSprite.src})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: `${position.x * scale}px ${position.y * scale}px`,
    backgroundSize: `${currentSprite.frameWidth * currentSprite.frames}px ${currentSprite.frameHeight}px`
  };
};


  return {
    sprite: currentSprite,
    getSpritePosition,
    getSpriteStyle,
    totalFrames: currentSprite.frames,
    frameWidth: currentSprite.frameWidth,
    frameHeight: currentSprite.frameHeight,
    animationSpeed: currentSprite.speed,
    shouldLoop: currentSprite.loop,
    availableActions: Object.keys(spriteConfig)
  };
}



/* Procedure pour creer un nouvel objet
- s'il est animé: l'avoir dans OBJECT_ANIMATIONS
- s'il est inanimé avoir son UI definie et l'appeler dans EntityInanimatedUI

-l'avoir dans createMatos (en-dessous)
avoir sa BaseEntity et arranger sa collisionBox
- l'avoir dans generateNiveau

*/


export const createMatos=(obj, objid)=>{
  if(obj.entity==='porte')
    return createDoor(obj.position.x, obj.position.y, objid);
  if(obj.entity==='coffre')
    return createChest(obj.position.x, obj.position.y, objid, obj.content);
  if(obj.entity==='portal')
    return createPortal(obj.position.x, obj.position.y, objid);
  if(obj.entity==='finNiveau')
    return createPortalFinNiveau(obj.position.x, obj.position.y, objid);
  if(obj.entity==='fire')
    return createFire(obj.position.x, obj.position.y, objid);
  if(obj.entity==='sol')
    return createSol(obj.position.x, obj.position.y, obj.position.width, obj.position.height, objid);
 
  if(obj.monster)
    return createEnnemi(obj, objid);
 
  if(obj.entity==='mur')
    return createWall(obj.position.x, obj.position.y, obj.position.width, obj.position.height, objid);
 
  if(obj.entity==='murPoussable')
    return createMurPoussable(obj.position.x, obj.position.y, obj.position.width, obj.position.height, objid);
 
  if(obj.entity==='murGrimpable')
    return createGrimpableWall(obj.position.x, obj.position.y, obj.position.width, obj.position.height, objid);
 else
  {
    alert(' type '+obj?.type+' pas defini')
  }
}

