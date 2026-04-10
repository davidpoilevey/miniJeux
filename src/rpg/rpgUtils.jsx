import { KNIGHT_SIZE } from "./RPGContext";

// rpgUtils.js - Utilitaires modifiés avec collision
export function launchJump(startPos, dispatch, direction = 'right', safeMoveTo, collisionSystem) {
  const duration = 600; // ms
  const steps = 30;
  const dx = 200;
  const dy = 100;

  // Adapter la direction horizontale selon l'orientation du sprite
  const horizontalDirection = direction === 'left' ? -1 : 1;

  let t = 0;
  const interval = setInterval(() => {
    t++;
    const progress = t / steps;

    // Calculer la position cible
    const targetX = startPos.x + (dx * horizontalDirection) * progress;
    const targetY = startPos.y - dy * Math.sin(Math.PI * progress);
    let result;
    // Utiliser le système de collision pour le mouvement
    if (safeMoveTo) {
      result = safeMoveTo({ x: targetX, y: targetY }, startPos, true);

      // Si bloqué horizontalement, mais pas encore en haut du saut : on tente une montée verticale
      if (!result.interactions?.canMove && progress < 0.5) {
        result = safeMoveTo({ x: startPos.x, y: targetY }, startPos, true);
        // 😬 Si toujours bloqué → repousser contre le mur
        if (!result.interactions?.canMove && result.interactions?.obstacles?.length > 0) {
          const obstacle = result.interactions.obstacles[0]; // tu prends le plus proche
          const knightWidth = KNIGHT_SIZE.width;

          let offsetX = startPos.x;

          if (direction === 'right') {
            // collision à droite, on se cale juste à gauche de l'obstacle
            const obstacleX = obstacle.entity.x || obstacle.entity.position?.x || 0;
            offsetX = obstacleX - knightWidth - 1;
          } else {
            // collision à gauche, on se cale juste à droite de l'obstacle
            const obstacleX = obstacle.entity.x || obstacle.entity.position?.x || 0;
            const obstacleWidth = obstacle.entity.width || obstacle.entity.position?.width || 0;
            offsetX = obstacleX + obstacleWidth + 1;
          }

          result = safeMoveTo({ x: offsetX, y: targetY }, startPos, true);
        }
      }
      dispatch({
        type: 'SAFE_MOVE_TO',
        payload: result
      });
      if (result.snappedToGround) {
        clearInterval(interval);
        dispatch({ type: "SET_ACTION", payload: "idle" }); // ou 'atterris'
      }
    }
    else {
      // Fallback si pas de système de collision
      dispatch({
        type: "MOVE_TO",
        payload: { x: targetX, y: targetY }
      });
    }

    if (t >= steps) {
      clearInterval(interval);
      dispatch({ type: "SET_ACTION", payload: result.interactions?.falling ? 'tombe' : "atterris" });
      if (result.interactions?.falling)
        launchFall({ x: targetX, y: targetY }, direction, 2, dispatch, safeMoveTo, collisionSystem);
      else
        dispatch({ type: 'SET_DOUBLE_JUMP_USED', payload: false });
    }
  }, duration / steps);
  return interval;
}

export function launchFall(startPos, direction, speed, dispatch, safeMoveTo, collisionSystem) {
  let velocityY = 0;
  const gravity = 0.6;
  const maxVelocityY = 18;
  const TICK_MS = 24;

  let currentX = startPos.x;
  let currentY = startPos.y;
  let newDirection = direction, dirChanged = false;
  const interval = setInterval(() => {
    // Appliquer la gravité verticale
    const previousPos = { x: currentX, y: currentY };
    velocityY = Math.min(velocityY + gravity, maxVelocityY);
    const velocityX = (newDirection === 'right' ? 0.5 : -0.5) * speed;
    currentY += velocityY;
    currentX += velocityX;

    const nextPos = { x: currentX, y: currentY };

    // Test au sol
    const collisionsSol = collisionSystem.isOnGround(nextPos);
    let isOnGround = collisionsSol.length > 0;

    if (isOnGround && collisionsSol[0].entity.y < currentY) {
      // on a cogné, mais un truc plus haut... on continue de tomber en inversant la direction
      isOnGround = false;
      if (!dirChanged) {
        dirChanged = true;
        newDirection = (direction == 'right') ? 'left' : 'right';
        currentX -= (velocityX * 2);
      }
    }

    const correctedY = isOnGround
      ? collisionsSol[0].entity.y - KNIGHT_SIZE.height
      : currentY;

    dispatch({
      type: 'APPLY_GRAVITY',
      payload: {
        isOnGround, changeDirection: newDirection,
        belowPos: { x: currentX, y: correctedY }
      }
    });

    // Appliquer mouvement visible
    safeMoveTo({ x: currentX, y: correctedY }, previousPos);

    if (isOnGround) {
      clearInterval(interval);
    }

  }, TICK_MS);

  return interval;
}




// Fonction de mouvement avec collision pour les déplacements normaux
export function moveWithCollision(currentPos, direction, speed, safeMoveTo) {
  const moveDistance = speed || 5;
  let newPos = { ...currentPos };

  switch (direction) {
    case 'left':
      newPos.x -= moveDistance;
      break;
    case 'right':
      newPos.x += moveDistance;
      break;
    case 'up':
      newPos.y -= moveDistance;
      break;
    case 'down':
      newPos.y += moveDistance;
      break;
    default:
  }

  return safeMoveTo(newPos, currentPos);
}


const attackConfigs = {
  attaque1: {
    range: 40,
    area: 'forward'
  },
  attaqueLancee: {
    range: 100,
    area: 'wide'
  },
  attaqueTournoie: {
    range: 60,
    area: 'surround'
  }
};
export function getAttackBox(knightPos, direction, knightAction) {
  const config = attackConfigs[knightAction] || attackConfigs.attaque1;
  const { range, area } = config;

  if (area === 'forward') {
    return {
      x: direction === 'right' ? knightPos.x : knightPos.x - range,
      y: knightPos.y,
      width: KNIGHT_SIZE.width + range,
      height: KNIGHT_SIZE.height
    };
  }

  if (area === 'wide') {
    return {
      x: direction === 'right'
        ? knightPos.x + KNIGHT_SIZE.width / 2
        : knightPos.x - range,
      y: knightPos.y - 10,
      width: range,
      height: KNIGHT_SIZE.height + 20
    };
  }

  if (area === 'surround') {
    return {
      x: knightPos.x - range / 2,
      y: knightPos.y,
      width: KNIGHT_SIZE.width + range,
      height: KNIGHT_SIZE.height
    };
  }

  return {
    x: knightPos.x,
    y: knightPos.y,
    width: KNIGHT_SIZE.width,
    height: KNIGHT_SIZE.height
  };
}
