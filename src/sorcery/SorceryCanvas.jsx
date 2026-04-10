// GameCanvas.js - Composant principal avec Konva pour le rendu du jeu

import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Rect, Circle, Text, Image } from 'react-konva';

import { useGame } from './SorceryContext';
import { ACTIONS } from './reducer';
import Player from './Player';
import Enemy from './Enemy';
import Item from './items';
import Projectile from './Projectile';
import Platform from './Platform';
// GameCanvas.js - Composant principal avec Konva pour le rendu du jeu
import Exit from './Exit';
import { usePreloadedImages } from '../civ/utils/hooks';
import { sorceryImgSources } from './imageSources';
import itemsData from './data/items.json';
import Obstacle from './Obstacle';
import Effect from './Effect';
import { soundManager } from '../rpg/sons/SoundManager';


const PHYSICS_INTERVAL = 60;
const GRAVITY = 0.3;
const MOVE_SPEED = 5;
const FLY_SPEED = 3; // Vitesse de vol vers le haut

function SorceryCanvas({ roomData }) {
  const { state, dispatch } = useGame();
  const stageRef = useRef(null);
  const stateRef = useRef(state);
  const [isAttacking, setIsAttacking] = useState(false);
  const roomDataRef = useRef(roomData);
  const images = usePreloadedImages(sorceryImgSources);
  const parallaxLayers = [
  { id: 'bg-0', image: images['bg1'], factor: 0, opacity: 0.6 },
  { id: 'bg-1', image: images['bg2'], factor: 0.1, opacity: 0.65 },
  { id: 'bg-2', image: images['bg3'], factor: 0.15, opacity: 0.7 },
  { id: 'bg-3', image: images['bg4'], factor: 0.2, opacity: 0.8 },
  { id: 'bg-4', image: images['bg5'], factor: 0.25, opacity: 0.9 },
  { id: 'bg-5', image: images['bg6'], factor: 0.3, opacity: 1 },
  { id: 'bg-7', image: images['bg7'], factor: 0.4, opacity: 1 }
];

  // Mettre à jour les refs à chaque render
  useEffect(() => {
    stateRef.current = state;
    roomDataRef.current = roomData;
  });

  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight - 100 // Laisser de la place pour le HUD
  });

  // Gestion du redimensionnement
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight - 100
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
const [lastPhysicsUpdate, setLastPhysicsUpdate] = useState(0);
  // Game loop - Physique et déplacements
    // Éviter de vérifier TOUS les obstacles/ennemis à chaque frame
const getNearbyEntities = (x, y, radius = 200) => {
  return {
    obstacles: state.entities.obstacles.filter(obs => 
      !obs.isDestroyed &&
      Math.abs(obs.x - x) < radius &&
      Math.abs(obs.y - y) < radius
    ),
    enemies: state.entities.enemies.filter(enemy =>
      !enemy.isDead &&
      Math.abs(enemy.x - x) < radius &&
      Math.abs(enemy.y - y) < radius
    )
  };
};
  useEffect(() => {
    let animationFrameId;

    const gameLoop = () => {
      const state = stateRef.current;
      const roomData = roomDataRef.current;
 const maintenant = Date.now();

      if (state.gameState !== 'playing') {
        animationFrameId = requestAnimationFrame(gameLoop);
        return;
      }

  if (maintenant - lastPhysicsUpdate >= PHYSICS_INTERVAL) {
    setLastPhysicsUpdate(maintenant);

      const player = state.player;
      let newVelocityX = 0;
      let newVelocityY = player.velocityY;
      let newDirection=player.direction;
      let newX = player.x;
      let newY = player.y;

      // Déplacement horizontal
      if (state.controls.moveLeft) {
        newVelocityX = -MOVE_SPEED;
        newDirection='left';
      } else if (state.controls.moveRight) {
        newVelocityX = MOVE_SPEED;
        newDirection='right';
      }

      // Vol (espace) - décolle doucement
      if (state.controls.fly) {
        newVelocityY = -FLY_SPEED; // Monte quand on appuie sur espace
      } else {
        // Gravité appliquée seulement si on ne vole pas
        newVelocityY += GRAVITY;
      }

      // Appliquer les vélocités
      newX += newVelocityX;
      newY += newVelocityY;

    

      // Collision avec les plateformes
      let isOnPlatform = false;
// Utiliser dans les collisions
const nearby = getNearbyEntities(player.x, player.y);
nearby.obstacles.forEach(obstacle => {
  // Collision seulement avec les obstacles proches

      // Collision avec les obstacles (même logique que plateformes)
      state.entities.obstacles.forEach(obstacle => {
        if (obstacle.isDestroyed || !obstacle.collision) return;
if (player.isGhost) return;
        const playerBottom = newY + 50;
        const playerTop = newY;
        const playerLeft = newX;
        const playerRight = newX + 30;

        const obstacleTop = obstacle.y;
        const obstacleBottom = obstacle.y + obstacle.height;
        const obstacleLeft = obstacle.x;
        const obstacleRight = obstacle.x + obstacle.width;

        // Collision par le dessus SEULEMENT si l'obstacle est "walkable" (plateforme)
        if (
          obstacle.walkable &&
          playerBottom >= obstacleTop &&
          playerBottom <= obstacleTop + 10 && // Seulement très proche du haut
          playerRight > obstacleLeft &&
          playerLeft < obstacleRight &&
          newVelocityY >= 0
        ) {
          newY = obstacleTop - 50;
          newVelocityY = 0;
          isOnPlatform = true;

          if (!player.isGrounded) {
            dispatch({ type: ACTIONS.PLAYER_LAND });
              soundManager.play('marche');
          }
        }

        // Collisions latérales (pour tous les obstacles avec collision)
        if (playerBottom > obstacleTop && playerTop < obstacleBottom) {
          // Collision droite
          if (playerRight > obstacleLeft && playerRight < obstacleLeft + 10 && newVelocityX > 0) {
            newX = obstacleLeft - 30;
            newVelocityX = 0;
          }
          // Collision gauche
          if (playerLeft < obstacleRight && playerLeft > obstacleRight - 10 && newVelocityX < 0) {
            newX = obstacleRight;
            newVelocityX = 0;
          }
        }

        // Collision par le bas (tête contre obstacle)
        if (
          playerTop <= obstacleBottom &&
          playerTop >= obstacleBottom - 10 &&
          playerRight > obstacleLeft &&
          playerLeft < obstacleRight &&
          newVelocityY < 0
        ) {
          newY = obstacleBottom;
          newVelocityY = 0;
        }
      });
});

      if (roomData?.platforms) {
        roomData.platforms.forEach(platform => {
          const playerBottom = newY + 50; // Hauteur du joueur
          const playerTop = newY;
          const playerLeft = newX;
          const playerRight = newX + 30; // Largeur du joueur

          const platformTop = platform.y;
          const platformBottom = platform.y + platform.height;
          const platformLeft = platform.x;
          const platformRight = platform.x + platform.width;

          // Collision par le bas (atterrissage)
          if (
            playerBottom >= platformTop &&
            playerBottom <= platformBottom &&
            playerRight > platformLeft &&
            playerLeft < platformRight &&
            newVelocityY >= 0
          ) {
            newY = platformTop - 50;
            newVelocityY = 0;
            isOnPlatform = true;

            if (!player.isGrounded) {
              dispatch({ type: ACTIONS.PLAYER_LAND });
              soundManager.play('marche');
            }
          }

          // Collision par le haut
          if (
            playerTop <= platformBottom &&
            playerTop >= platformTop &&
            playerRight > platformLeft &&
            playerLeft < platformRight &&
            newVelocityY < 0
          ) {
            newY = platformBottom;
            newVelocityY = 0;
          }

          // Collision latérale
          if (
            playerBottom > platformTop &&
            playerTop < platformBottom
          ) {
            if (playerRight > platformLeft && playerRight < platformLeft + 10 && newVelocityX > 0) {
              newX = platformLeft - 30;
              newVelocityX = 0;
            }
            if (playerLeft < platformRight && playerLeft > platformRight - 10 && newVelocityX < 0) {
              newX = platformRight;
              newVelocityX = 0;
            }
          }
        });
      }

      // Limites de la salle
      if (newX < 0) newX = 0;
      if (newX > (roomData?.width || 800) - 30) newX = (roomData?.width || 800) - 30;
      if (newY < 0)
        newY = 0;
      if (newY > dimensions.height - 50) {
        newY = dimensions.height - 50;
        newVelocityY = 0;
        isOnPlatform = true;
        if (!player.isGrounded) {
          dispatch({ type: ACTIONS.PLAYER_LAND });
              soundManager.play('marche');
        }
      }

      // Mettre à jour la position
      if (newX !== player.x || newY !== player.y) { 
        dispatch({
          type: ACTIONS.UPDATE_PLAYER_POSITION,
          payload: { x: newX, y: newY }
        });
      }

      if (newVelocityX !== player.velocityX || newVelocityY !== player.velocityY) {
        dispatch({
          type: ACTIONS.UPDATE_PLAYER_VELOCITY,
          payload: { velocityX: newVelocityX, velocityY: newVelocityY }
        });
      }

      // Update des projectiles
      state.entities.projectiles.forEach(projectile => {
        const newProjX = projectile.x + projectile.velocityX;
        const newProjY = projectile.y + projectile.velocityY;

        // rencontre avec obstacle
        state.entities.obstacles.forEach(obstacle => {
          if (obstacle.isDestroyed || !obstacle.destructible) return;

          const distance = Math.sqrt(
            Math.pow(newProjX - obstacle.x - obstacle.width / 2, 2) +
            Math.pow(newProjY - obstacle.y - obstacle.height / 2, 2)
          );

          if (distance < obstacle.width / 2) {
            // Dégâts à l'obstacle
            dispatch({
              type: ACTIONS.DAMAGE_OBSTACLE,
              payload: { obstacleId: obstacle.id, amount: projectile.damage }
            });

            // Si c'est du feu et que l'obstacle brûle
            if (projectile.element === 'fire' && obstacle.burnable && !obstacle.isBurning) {

              soundManager.play('fire');
              dispatch({
                type: ACTIONS.UPDATE_OBSTACLE,
                payload: {
                  obstacleId: obstacle.id,
                  updates: { isBurning: true }
                }
              });
            }

            // Retirer le projectile
            dispatch({
              type: ACTIONS.REMOVE_PROJECTILE,
              payload: { projectileId: projectile.id }
            });
          }
        });
        // Vérifier si le projectile sort de l'écran
        if (
          newProjX < 0 ||
          newProjX > (roomData?.width || 800) ||
          newProjY < 0 ||
          newProjY > dimensions.height
        ) {
          dispatch({
            type: ACTIONS.REMOVE_PROJECTILE,
            payload: { projectileId: projectile.id }
          });
        } else {
          dispatch({
            type: ACTIONS.UPDATE_PROJECTILE,
            payload: {
              projectileId: projectile.id,
              updates: { x: newProjX, y: newProjY }
            }
          });
// Collision projectiles ennemis → joueur
if (projectile.isEnemyProjectile) {
  const distanceToPlayer = Math.sqrt(
    Math.pow(newProjX - player.x, 2) + 
    Math.pow(newProjY - player.y, 2)
  );

  if (distanceToPlayer < 30) {
    if (!player.isInvincible && !player.isGhost) {

              soundManager.play('hit');
      dispatch({
        type: ACTIONS.DAMAGE_PLAYER,
        payload: { amount: projectile.damage }
      });
    }
    
    dispatch({
      type: ACTIONS.REMOVE_PROJECTILE,
      payload: { projectileId: projectile.id }
    });
  }
}
else
          // Collision avec les ennemis
          state.entities.enemies.forEach(enemy => {
            if (!enemy.isDead) {
              const distance = Math.sqrt(
                Math.pow(newProjX - (enemy.x+enemy.width/2), 2) + Math.pow(newProjY - (enemy.y+enemy.height/2), 2)
              );

              if (distance < 60) {
                dispatch({
                  type: ACTIONS.DAMAGE_ENEMY,
                  payload: { enemyId: enemy.id, amount: projectile.damage }
                });
                dispatch({
                  type: ACTIONS.REMOVE_PROJECTILE,
                  payload: { projectileId: projectile.id }
                });
              }
            }
          });

        }
      });
// Physique des ennemis (gravité + collisions)
state.entities.enemies.forEach(enemy => {
  if (enemy.isDead) return;
  if (enemy.behavior.type === 'flying') return; // Les volants ignorent la gravité
  
  let newEnemyY = enemy.y;
  let newEnemyVelocityY = enemy.velocityY || 0;
  let enemyIsGrounded = false;
  
  // Gravité
  newEnemyVelocityY += GRAVITY;
  newEnemyY += newEnemyVelocityY;
  
  // Collision avec plateformes
  roomData?.platforms?.forEach(platform => {
    const enemyBottom = newEnemyY + (enemy.height || 100);
    const enemyLeft = enemy.x;
    const enemyRight = enemy.x + (enemy.width || 64);
    
    if (
      enemyBottom >= platform.y &&
      enemyBottom <= platform.y + 10 &&
      enemyRight > platform.x &&
      enemyLeft < platform.x + platform.width &&
      newEnemyVelocityY >= 0
    ) {
      newEnemyY = platform.y - (enemy.height || 50);
      newEnemyVelocityY = 0;
      enemyIsGrounded = true;
    }
  });
  
  // Collision avec obstacles
  state.entities.obstacles.forEach(obstacle => {
    if (obstacle.isDestroyed || !obstacle.collision) return;
    
    const enemyBottom = newEnemyY + (enemy.height || 50);
    const enemyLeft = enemy.x;
    const enemyRight = enemy.x + (enemy.width || 40);
    
    if (
      enemyBottom >= obstacle.y &&
      enemyBottom <= obstacle.y + 10 &&
      enemyRight > obstacle.x &&
      enemyLeft < obstacle.x + obstacle.width &&
      newEnemyVelocityY >= 0 &&
      obstacle.walkable
    ) {
      newEnemyY = obstacle.y - (enemy.height || 50);
      newEnemyVelocityY = 0;
      enemyIsGrounded = true;
    }
  });
  
  // Limites de la salle
  if (newEnemyY > dimensions.height - (enemy.height || 50)) {
    newEnemyY = dimensions.height - (enemy.height || 50);
    newEnemyVelocityY = 0;
    enemyIsGrounded = true;
  }
  
  // Mettre à jour si changement
  if (newEnemyY !== enemy.y || newEnemyVelocityY !== enemy.velocityY || enemyIsGrounded !== enemy.isGrounded) {
    dispatch({
      type: ACTIONS.UPDATE_ENEMY,
      payload: {
        enemyId: enemy.id,
        updates: { 
          y: newEnemyY, 
          velocityY: newEnemyVelocityY,
          isGrounded: enemyIsGrounded
        }
      }
    });
  }
});

     // IA des ennemis
state.entities.enemies.forEach(enemy => {
  if (enemy.isDead) return;
  if (enemy.frozen && Date.now() < enemy.frozenUntil) return; // Frozen
  if (enemy.stunned && Date.now() < enemy.stunnedUntil) return; // Stunned
  
  const distanceToPlayer = Math.sqrt(
    Math.pow(enemy.x - player.x, 2) + 
    Math.pow((enemy.y+enemy.height/2) - player.y, 2)
  );
  const behavior = enemy.behavior;

  // AGGRESSIVE - Charge le joueur
  if (behavior.type === 'aggressive' && distanceToPlayer < behavior.detectionRange) {
    const direction = player.x > enemy.x ? 1 : -1;
    const newEnemyX = enemy.x + direction * behavior.moveSpeed;

  // Vérifier collision avec obstacles
  let canMove = true;
  state.entities.obstacles.forEach(obstacle => {
    if (obstacle.isDestroyed || !obstacle.collision) return;
    
    const wouldCollide = 
      newEnemyX + (enemy.width || 40) > obstacle.x &&
      newEnemyX < obstacle.x + obstacle.width &&
      enemy.y + (enemy.height || 50) > obstacle.y &&
      enemy.y < obstacle.y + obstacle.height;
    
    if (wouldCollide) {
      canMove = false;
    }
  });
  
  if (canMove) {
    dispatch({
      type: ACTIONS.UPDATE_ENEMY,
      payload: {
        enemyId: enemy.id,
        updates: { x: newEnemyX, direction: direction > 0 ? 'right' : 'left' }
      }
    });
  }

    if (distanceToPlayer < behavior.attackRange) {
      const now = Date.now();
      const lastAttack = enemy.lastAttack || 0;
      
      if (now - lastAttack > behavior.attackCooldown) {
        if (!player.isInvincible && !player.isGhost) {
              soundManager.play('hit');
          dispatch({
            type: ACTIONS.DAMAGE_PLAYER,
            payload: { amount: enemy.attack }
          });
        }
        dispatch({
          type: ACTIONS.UPDATE_ENEMY,
          payload: {
            enemyId: enemy.id,
            updates: { lastAttack: now }
          }
        });
      }
    }
  }
  
  // RANGED - Garde ses distances et attaque à distance
  else if (behavior.type === 'ranged' && distanceToPlayer < behavior.detectionRange) {
    const tooClose = distanceToPlayer < behavior.keepDistance;
    const direction = tooClose ? (player.x > enemy.x ? -1 : 1) : (player.x > enemy.x ? 1 : -1);
     
  if (tooClose || distanceToPlayer > behavior.attackRange) {
    let newEnemyX = enemy.x + direction * behavior.moveSpeed;
    
    // Vérifier collision avec obstacles
    let canMove = true;
    state.entities.obstacles.forEach(obstacle => {
      if (obstacle.isDestroyed || !obstacle.collision) return;
      
      const wouldCollide = 
        newEnemyX + (enemy.width || 40) > obstacle.x &&
        newEnemyX < obstacle.x + obstacle.width &&
        enemy.y + (enemy.height || 50) > obstacle.y &&
        enemy.y < obstacle.y + obstacle.height;
      
      if (wouldCollide) {
        canMove = false;
      }
    });
    
    if (canMove) {
      dispatch({
        type: ACTIONS.UPDATE_ENEMY,
        payload: {
          enemyId: enemy.id,
          updates: { x: newEnemyX, direction: player.x > enemy.x ? 'right' : 'left' }
        }
      });
    }
  }
    
    // Attaque à distance
    if (distanceToPlayer <= behavior.attackRange) {
      const now = Date.now();
      const lastAttack = enemy.lastAttack || 0;
      
      if (now - lastAttack > behavior.attackCooldown) {
        // Lancer un projectile ennemi
        const attack = enemy.attacks.find(a => a.projectile);
        if (attack) {
          const direction = player.x > enemy.x ? 1 : -1;
          const projectile = {
            id: `enemy-projectile-${Date.now()}`,
            isEnemyProjectile: true,
            x: enemy.x + (direction > 0 ? 40 : 0),
            y: enemy.y + 25,
            velocityX: direction * (attack.speed || 5),
            velocityY: 0,
            damage: attack.damage,
            element: attack.element || 'shadow'
          };
          
          dispatch({
            type: ACTIONS.SPAWN_PROJECTILE,
            payload: { projectile }
          });
        }
        
        dispatch({
          type: ACTIONS.UPDATE_ENEMY,
          payload: {
            enemyId: enemy.id,
            updates: { lastAttack: now }
          }
        });
      }
    }
  }
  // GUARDIAN - Patrouille autour d'une zone et défend
else if (behavior.type === 'guardian' && distanceToPlayer < behavior.detectionRange) {
  const guardX = behavior.patrolArea?.centerX || enemy.spawnX || enemy.x;
  const guardRadius = behavior.patrolArea?.radius || 100;
  
  const distanceFromGuardPoint = Math.sqrt(
    Math.pow(enemy.x - guardX, 2) + 
    Math.pow(enemy.y - (enemy.spawnY || enemy.y), 2)
  );
  
  // Si le joueur est dans la zone OU si l'ennemi est trop loin de son poste
  const shouldReturnToPost = distanceFromGuardPoint > guardRadius;
  const playerInZone = distanceToPlayer < guardRadius;
  
  if (shouldReturnToPost) {
    // Retourner au poste de garde
    const directionToPost = guardX > enemy.x ? 1 : -1;
    let newEnemyX = enemy.x + directionToPost * behavior.moveSpeed;
    
    // Vérifier collision avec obstacles
    let canMove = true;
    state.entities.obstacles.forEach(obstacle => {
      if (obstacle.isDestroyed || !obstacle.collision) return;
      
      const wouldCollide = 
        newEnemyX + (enemy.width || 40) > obstacle.x &&
        newEnemyX < obstacle.x + obstacle.width &&
        enemy.y + (enemy.height || 50) > obstacle.y &&
        enemy.y < obstacle.y + obstacle.height;
      
      if (wouldCollide) canMove = false;
    });
    
    if (canMove) {
      dispatch({
        type: ACTIONS.UPDATE_ENEMY,
        payload: {
          enemyId: enemy.id,
          updates: { x: newEnemyX, direction: directionToPost > 0 ? 'right' : 'left' }
        }
      });
    }
  } else if (playerInZone) {
    // Attaquer le joueur s'il est dans la zone
    const direction = player.x > enemy.x ? 1 : -1;
    
    if (distanceToPlayer > behavior.attackRange) {
      let newEnemyX = enemy.x + direction * behavior.moveSpeed;
      
      let canMove = true;
      state.entities.obstacles.forEach(obstacle => {
        if (obstacle.isDestroyed || !obstacle.collision) return;
        
        const wouldCollide = 
          newEnemyX + (enemy.width || 40) > obstacle.x &&
          newEnemyX < obstacle.x + obstacle.width &&
          enemy.y + (enemy.height || 50) > obstacle.y &&
          enemy.y < obstacle.y + obstacle.height;
        
        if (wouldCollide) canMove = false;
      });
      
      if (canMove) {
        dispatch({
          type: ACTIONS.UPDATE_ENEMY,
          payload: {
            enemyId: enemy.id,
            updates: { x: newEnemyX, direction: direction > 0 ? 'right' : 'left' }
          }
        });
      }
    }
    
    // Attaquer si à portée
    if (distanceToPlayer < behavior.attackRange) {
      const now = Date.now();
      const lastAttack = enemy.lastAttack || 0;
      
      if (now - lastAttack > behavior.attackCooldown) {
        if (!player.isInvincible && !player.isGhost) {
              soundManager.play('hit');
          dispatch({
            type: ACTIONS.DAMAGE_PLAYER,
            payload: { amount: enemy.attack }
          });
        }
        dispatch({
          type: ACTIONS.UPDATE_ENEMY,
          payload: {
            enemyId: enemy.id,
            updates: { lastAttack: now }
          }
        });
      }
    }
  }
}
 // FLYING - Vole et pique sur le joueur
else if (behavior.type === 'flying' && distanceToPlayer < behavior.detectionRange) {
  const targetY = player.y + 10; // Vole à la même hauteur que le joueur
  const directionX = player.x > enemy.x ? 1 : -1;
  const directionY = targetY > enemy.y ? 1 : -1;
  
  const newEnemyX = enemy.x + directionX * behavior.moveSpeed;
  const newEnemyY = enemy.y + directionY * (behavior.moveSpeed / 2);

  dispatch({
    type: ACTIONS.UPDATE_ENEMY,
    payload: {
      enemyId: enemy.id,
      updates: { 
        x: newEnemyX, 
        y: newEnemyY,
        direction: directionX > 0 ? 'right' : 'left'
      }
    }
  });

  // Attaque au corps à corps quand proche
  if (distanceToPlayer < behavior.attackRange) {
    const now = Date.now();
    const lastAttack = enemy.lastAttack || 0;
    
    if (now - lastAttack > behavior.attackCooldown) {
      if (!player.isInvincible && !player.isGhost) {
              soundManager.play('hit');
        dispatch({
          type: ACTIONS.DAMAGE_PLAYER,
          payload: { amount: enemy.attack }
        });
      }
      dispatch({
        type: ACTIONS.UPDATE_ENEMY,
        payload: {
          enemyId: enemy.id,
          updates: { lastAttack: now }
        }
      });
    }
  }
}
});

      // Retirer les ennemis morts après un délai
      state.entities.enemies.forEach(enemy => {
        if (enemy.isDead && !enemy.deathHandled) {
          setTimeout(() => {
            dispatch({
              type: ACTIONS.REMOVE_ENEMY,
              payload: { enemyId: enemy.id }
            });
              soundManager.play('gold');
            dispatch({
              type: ACTIONS.GAIN_XP,
              payload: { amount: enemy.xpReward || 10 }
            });
          }, 500);

          dispatch({
            type: ACTIONS.UPDATE_ENEMY,
            payload: {
              enemyId: enemy.id,
              updates: { deathHandled: true }
            }
          });
        }
      });
      // Nettoyer les effets expirés
      const now = Date.now();
      state.entities.effects.forEach(effect => {
        if (effect.createdAt && now - effect.createdAt > effect.duration) {
          dispatch({
            type: ACTIONS.REMOVE_EFFECT,
            payload: { effectId: effect.id }
          });
        }
      });

      // Dégâts des items dangereux (piques, brasiers)
      state.entities.items.forEach(item => {
        if (item.type === 'dangerous') {
          const distance = Math.sqrt(
            Math.pow(player.x - item.x, 2) +
            Math.pow(player.y - item.y, 2)
          );

          const hitRadius = Math.max(item.width || 30, item.height || 30) / 2;

          if (distance < hitRadius) {
            const now = Date.now();
            const lastDamage = item.lastDamageTime || 0;

            if (!player.isInvincible && now - lastDamage > (item.damageInterval || 1000)) {
              soundManager.play('hit');
              dispatch({
                type: ACTIONS.DAMAGE_PLAYER,
                payload: { amount: item.damage || 10 }
              });

              // Marquer le temps du dernier dégât
              dispatch({
                type: ACTIONS.UPDATE_ITEM,
                payload: {
                  itemId: item.id,
                  updates: { lastDamageTime: now }
                }
              });
            }
          }
        }
        // Régénération passive (marmites, fontaines)

        if (item.type === 'regenerative') {
          const distance = Math.sqrt(
            Math.pow(player.x - item.x, 2) +
            Math.pow(player.y - item.y, 2)
          );

          const regenRadius = Math.max(item.width || 30, item.height || 30) / 2 + 20; // Zone de régén

          if (distance < regenRadius) {
            const now = Date.now();
            const lastRegen = item.lastRegenTime || 0;

            // Régénère toutes les secondes
            if (now - lastRegen > 500) {
              if (item.resourceType === 'health' && player.health < player.maxHealth) {
              soundManager.play('soin');
                dispatch({
                  type: ACTIONS.HEAL_PLAYER,
                  payload: { amount: item.healPerSecond || 5 }
                });
              } else if (item.resourceType === 'mana' && player.mana < player.maxMana) {
              soundManager.play('soin');
                dispatch({
                  type: ACTIONS.RESTORE_MANA,
                  payload: { amount: item.healPerSecond || 3 }
                });
              }

              dispatch({
                type: ACTIONS.UPDATE_ITEM,
                payload: {
                  itemId: item.id,
                  updates: { lastRegenTime: now }
                }
              });
            }
          }
        }
      });
      // Lancer de sorts (touches 1-4)
      if (state.controls.castSpell !== null) {
        const slotIndex = state.controls.castSpell;
        const spellId = state.spells.equipped[slotIndex];

        if (spellId) {
          // Vérifier le cooldown
          const isOnCooldown = state.spells.cooldowns[spellId] && state.spells.cooldowns[spellId] > Date.now();

          if (!isOnCooldown) {
            // Charger les données du sort
            const spellsData = require('./data/spells.json');
            const spell = spellsData.spells.find(s => s.id === spellId);

            if (spell && player.mana >= spell.stats.manaCost) {
              // Consommer le mana
              dispatch({
                type: ACTIONS.USE_MANA,
                payload: { amount: spell.stats.manaCost }
              });

              // Appliquer le cooldown
              dispatch({
                type: ACTIONS.CAST_SPELL,
                payload: { spellId: spell.id, cooldown: spell.stats.cooldown }
              });

              // Créer le projectile OU appliquer l'effet
              if (spell.projectile) {
                // Sorts projectiles (existant)
                const direction = player.direction === 'right' ? 1 : -1;
                const projectile = {
                  id: `projectile-${Date.now()}`,
                  spellId: spell.id,
                  element: spell.element,
                  x: player.x + (direction > 0 ? 30 : 0),
                  y: player.y + 25,
                  velocityX: direction * spell.projectile.speed,
                  velocityY: 0,
                  damage: spell.stats.damage,
                  piercing: spell.projectile.piercing || false,
                  maxPierce: spell.projectile.maxPierce || 0,
                  pierceCount: 0
                };

                dispatch({
                  type: ACTIONS.SPAWN_PROJECTILE,
                  payload: { projectile }
                });
              } else if (spell.casting?.targetSelf) {
                // Sorts sur soi (healing, shield, etc.)
                spell.effects?.forEach(effect => {
                  if (effect.type === 'heal') {
              soundManager.play('soin');
                    dispatch({
                      type: ACTIONS.HEAL_PLAYER,
                      payload: { amount: effect.amount }
                    });

                    // Effet visuel de soin
                    dispatch({
                      type: ACTIONS.ADD_EFFECT,
                      payload: {
                        effect: {
                          id: `effect-${Date.now()}`,
                          type: 'healing-aura',
                          x: player.x + 15,
                          y: player.y + 25,
                          duration: 1000
                        }
                      }
                    });
                  }

                  if (effect.type === 'shield') {
                    dispatch({
                      type: ACTIONS.UPDATE_PLAYER,
                      payload: {isInvincible:true}
                    });

                    setTimeout(() => {
                      dispatch({
                        type: ACTIONS.UPDATE_PLAYER,
                        payload:  {isInvincible:false}
                      });
                    }, effect.duration || 1000);
                    // Effet visuel de soin
                    dispatch({
                      type: ACTIONS.ADD_EFFECT,
                      payload: {
                        effect: {
                          id: `effect-${Date.now()}`,
                          type: 'shield-aura',
      followPlayer: true, 
                          x: player.x + 15,
                          y: player.y + 25,
                          duration: effect.duration
                        }
                      }
                    });
                  }
                  else if (effect.type === 'teleport') {
                    // Trouver une position libre dans le range
                    const maxDistance = spell.effects[0].maxDistance || 200;
                    const direction = player.direction === 'right' ? 1 : -1;

                    let teleportX = player.x + (direction * maxDistance);
                    let teleportY = player.y;

                    // Vérifier collisions avec obstacles
                    let finalX = teleportX;
                    let isClear = true;

                    state.entities.obstacles.forEach(obstacle => {
                      if (obstacle.isDestroyed || !obstacle.collision) return;

                      const wouldCollide =
                        teleportX + 30 > obstacle.x &&
                        teleportX < obstacle.x + obstacle.width &&
                        teleportY + 50 > obstacle.y &&
                        teleportY < obstacle.y + obstacle.height;

                      if (wouldCollide) {
                        isClear = false;
                        // Téléporter juste avant l'obstacle
                        if (direction > 0) {
                          finalX = Math.min(finalX, obstacle.x - 35);
                        } else {
                          finalX = Math.max(finalX, obstacle.x + obstacle.width + 5);
                        }
                      }
                    });

                    // Limites de la salle
                    finalX = Math.max(0, Math.min(finalX, (roomData?.width || 800) - 30));

                    // Téléporter
                    dispatch({
                      type: ACTIONS.UPDATE_PLAYER_POSITION,
                      payload: { x: finalX, y: teleportY }
                    });

                    // Effet visuel
                    dispatch({
                      type: ACTIONS.ADD_EFFECT,
                      payload: {
                        effect: {
                          id: `effect-${Date.now()}`,
                          type: 'teleport-flash',
                          x: player.x + 15,
                          y: player.y + 25,
                          duration: 300
                        }
                      }
                    });

                    setTimeout(() => {
                      dispatch({
                        type: ACTIONS.ADD_EFFECT,
                        payload: {
                          effect: {
                            id: `effect-${Date.now()}-arrive`,
                            type: 'teleport-flash',
                            x: finalX + 15,
                            y: teleportY + 25,
                            duration: 300
                          }
                        }
                      });
                    }, 50);
                  }
                  else if (effect.type === 'freeze-all') {
  // Geler tous les ennemis
  state.entities.enemies.forEach(enemy => {
    if (!enemy.isDead) {
      dispatch({
        type: ACTIONS.UPDATE_ENEMY,
        payload: {
          enemyId: enemy.id,
          updates: {
            frozen: true,
            frozenUntil: Date.now() + effect.duration
          }
        }
      });
    }
  });
  
  // Effet visuel global
  dispatch({
    type: ACTIONS.ADD_EFFECT,
    payload: {
      effect: {
        id: `effect-${Date.now()}`,
        type: 'freeze-wave',
      followPlayer: true, 
        x: player.x + 15,
        y: player.y + 25,
        duration: effect.duration
      }
    }
  });
}
else if (effect.type === 'ghost') {
  dispatch({
    type: ACTIONS.UPDATE_PLAYER,
    payload: { 
      isGhost: true,
      isInvincible: true
    }
  });
  
  setTimeout(() => {
    dispatch({
      type: ACTIONS.UPDATE_PLAYER,
      payload: { 
        isGhost: false,
        isInvincible: false
      }
    });
  }, effect.duration);
  
  // Effet visuel
  dispatch({
    type: ACTIONS.ADD_EFFECT,
    payload: {
      effect: {
        id: `effect-${Date.now()}`,
        type: 'ghost-aura',
      followPlayer: true, 
        x: player.x + 15,
        y: player.y + 25,
        duration: effect.duration
      }
    }
  });
}
                });
              }
            }
          }
        }

        // Réinitialiser le contrôle
        dispatch({
          type: ACTIONS.UPDATE_CONTROLS,
          payload: { castSpell: null }
        });
      }

      // Attaque au corps à corps (espace)
      if (state.controls.attack && player.canAttack !== false) {
        const weapon = state.inventory.equippedWeapon;
        const attackDamage = player.stats.attack + (weapon?.stats.attack || 0);
        const attackRange = weapon?.range || 40;
        const attackWidth = weapon?.width || 50;

        // Activer l'animation d'attaque
        setIsAttacking(true);
        setTimeout(() => setIsAttacking(false), 200); // Durée de l'animation

        const attackX = player.direction === 'right'
          ? player.x + 30
          : player.x - attackRange;
        const attackY = player.y;

        // Vérifier collision avec ennemis
        state.entities.enemies.forEach(enemy => {
          if (enemy.isDead) return;

          const inRangeX = enemy.x >= attackX && enemy.x <= attackX + attackRange;
          const inRangeY = Math.abs(enemy.y - attackY) < attackWidth;

          if (inRangeX && inRangeY) {
            dispatch({
              type: ACTIONS.DAMAGE_ENEMY,
              payload: { enemyId: enemy.id, amount: attackDamage }
            });
          }
        });

        // Vérifier collision avec obstacles destructibles
        state.entities.obstacles.forEach(obstacle => {
          if (!obstacle.destructible || obstacle.isDestroyed) return;

          const inRangeX = obstacle.x >= attackX && obstacle.x <= attackX + attackRange;
          const inRangeY = Math.abs(obstacle.y - attackY) < attackWidth;

          if (inRangeX && inRangeY) {
            dispatch({
              type: ACTIONS.DAMAGE_OBSTACLE,
              payload: { obstacleId: obstacle.id, amount: attackDamage }
            });
          }
        });

        // Cooldown d'attaque (éviter le spam)
        dispatch({
          type: ACTIONS.UPDATE_PLAYER_POSITION,
          payload: { canAttack: false }
        });

        setTimeout(() => {
          dispatch({
            type: ACTIONS.UPDATE_PLAYER_POSITION,
            payload: { canAttack: true }
          });
        }, weapon?.attackSpeed || 500); // Vitesse d'attaque selon l'arme
      }
    }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    gameLoop(); // Démarrer la boucle

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []); // Dépendances vides - le loop tourne en continu

  // Détection de collecte d'items
  useEffect(() => {
    if (state.controls.interact) {
      state.entities.items.forEach(item => {
        const distance = Math.sqrt(
          Math.pow(state.player.x - item.x, 2) +
          Math.pow(state.player.y - item.y, 2)
        );

        if (distance < 50) {
          // CONTAINER (coffre)
          if (item.type === 'container') {
            if (item.locked) {
              // Vérifier si le joueur a la clé
              const hasKey = state.inventory.items.some(i => i.id === item.requiredKey);

              if (hasKey) {
                // Ouvrir le coffre et donner les items
                item.contains?.forEach(loot => {
                  dispatch({
                    type: ACTIONS.ADD_ITEM,
                    payload: {
                      itemId: loot.itemId,
                      itemData: itemsData.items.find(i => i.id === loot.itemId),
                      quantity: loot.quantity || 1
                    }
                  });
                });

                // Retirer le coffre (ou le marquer comme ouvert)
                dispatch({
                  type: ACTIONS.COLLECT_ITEM,
                  payload: { itemId: item.id }
                });

                dispatch({
                  type: ACTIONS.SHOW_NOTIFICATION,
                  payload: { type: 'success', message: 'Coffre ouvert !' }
                });
              } else {
                dispatch({
                  type: ACTIONS.SHOW_NOTIFICATION,
                  payload: { type: 'error', message: `Clé requise: ${item.requiredKey}` }
                });
              }
            }
            return; // Ne pas collecter automatiquement
          }

          // ITEMS NORMAUX (collectables)
          if (item.type !== 'dangerous' && item.type !== 'regenerative') {
            dispatch({
              type: ACTIONS.COLLECT_ITEM,
              payload: { itemId: item.id }
            });

            dispatch({
              type: ACTIONS.ADD_ITEM,
              payload: {
                itemId: item.itemId,
                itemData: item,
                quantity: 1
              }
            });

            if (item.type === 'spell-scroll') {
              dispatch({
                type: ACTIONS.LEARN_SPELL,
                payload: {
                  spellId: item.learnSpell,
                  spellName: item.name
                }
              });
            }
          }
        }
      });
      // Détection d'interaction avec obstacles (destruction par item)

  state.entities.obstacles.forEach(obstacle => {
     if (obstacle.requiredItem && !obstacle.isDestroyed) {
    // Trouver le point le plus proche de l'obstacle
    const playerCenterX = state.player.x + 15;
    const playerCenterY = state.player.y + 25;
    
    const closestX = Math.max(obstacle.x, Math.min(playerCenterX, obstacle.x + obstacle.width));
    const closestY = Math.max(obstacle.y, Math.min(playerCenterY, obstacle.y + obstacle.height));
    
    const distance = Math.sqrt(
      Math.pow(playerCenterX - closestX, 2) +
      Math.pow(playerCenterY - closestY, 2)
    );

    if (distance < 50) {
      const hasItem = state.inventory.items.some(item => item.id === obstacle.requiredItem);
      
      if (hasItem) {
        dispatch({
          type: ACTIONS.UPDATE_OBSTACLE,
          payload: {
            obstacleId: obstacle.id,
            updates: { isDestroyed: true }
          }
        });
        
        dispatch({
          type: ACTIONS.SHOW_NOTIFICATION,
          payload: { 
            type: 'success', 
            message: `${obstacle.name} détruit !` 
          }
        });
      } else {
        dispatch({
          type: ACTIONS.SHOW_NOTIFICATION,
          payload: { 
            type: 'error', 
            message: `Item requis : ${obstacle.requiredItem}` 
          }
        });
      }
    }
  }
  });

    }
  }, [state.controls.interact, state.entities.items, state.player.x, state.player.y, dispatch]);
const cameraX = state.player.x-dimensions.width/8+100;

  return (
    <Stage width={dimensions.width} height={dimensions.height} ref={stageRef}>
      <Layer listening={false}>
    {parallaxLayers.reverse().map(layer => (
      <Image
        key={layer.id}
        image={layer.image}
        x={-cameraX * layer.factor}
        y={0}
        width={layer.width}
        height={dimensions.height}
        opacity={layer.opacity}
      />
    ))}
  </Layer>
      <Layer>
        {/* Background 
        <Rect
          x={0}
          y={0}
          width={roomData?.width || dimensions.width}
          height={dimensions.height}
          fill={roomData?.color || "#394e32"}
        />
*/}
        {/* Plateformes */}
        {roomData?.platforms?.map((platform, index) => (
          <Platform key={index} platform={platform} />
        ))}
        {/* Obstacles */}
        {state.entities.obstacles.map((obstacle,idx) => (
          <Obstacle
            key={obstacle.id+'-'+idx}
            obstacle={obstacle}
            image={images?.[obstacle.isBurning ? obstacle.burnedSprite : obstacle.sprite]}
          />
        ))}
        {/* Exits/Portes */}
       {/* Exits/Portes */}
{roomData?.exits?.map((exit, index) => {
  const isLocked = exit.locked && !state.inventory.items.some(item => item.id === exit.requiredItem);
  return <Exit key={index} exit={exit} isLocked={isLocked} />;
})}

        {/* Items */}
        {state.entities.items.map((item,idx) => {
          
          return <Item key={item.id+'-'+idx} item={item} images={images} />;
        })}

        {/* Ennemis */}
        {state.entities.enemies.map((enemy,idx) => (
          <Enemy key={enemy.id+'-'+idx} enemy={enemy} images={images}/>
        ))}

        {/* Projectiles */}
        {state.entities.projectiles.map((projectile,idx) => (
          <Projectile key={projectile.id+'-'+idx} projectile={projectile} />
        ))}
        {/* Effets visuels */}
        {state.entities.effects.map((effect) => (
          <Effect key={effect.id} effect={effect} player={state.player}/>
        ))}

        {/* Joueur */}
        <Player
          player={state.player}
          equippedWeapon={state.inventory.equippedWeapon}
          equippedArmor={state.inventory.equippedArmor}
          weaponImage={state.inventory.equippedWeapon ? images?.[state.inventory.equippedWeapon.sprite] : null}
          armorImage={state.inventory.equippedArmor ? images?.[state.inventory.equippedArmor.sprite] : null}
          isAttacking={isAttacking}
        />

        {/* Debug info */}
        <Text
          x={10}
          y={10}
          text={`FPS: ~60 | Pos: ${Math.floor(state.player.x)}, ${Math.floor(state.player.y)}`}
          fontSize={12}
          fill="white"
        />
      </Layer>
    </Stage>
  );
}

export default SorceryCanvas;