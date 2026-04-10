import { KNIGHT_SIZE } from "../RPGContext";
import { soundManager } from "../sons/SoundManager";


function checkRectCollision(a, b) {
  return !(
    a.x + a.width < b.x ||
    a.x > b.x + b.width ||
    a.y + a.height < b.y ||
    a.y > b.y + b.height
  );
}

export function isKnightInRange(enemy, knightPos, range = 40) {
  const knightBox = {
    x: knightPos.x,
    y: knightPos.y,
    width: KNIGHT_SIZE.width,
    height: KNIGHT_SIZE.height,
  };

  const attackBox = {
    x: enemy.direction === 'right' ? enemy.x + enemy.width : enemy.x - range,
    y: enemy.y,
    width: range,
    height: enemy.height,
  };

  return checkRectCollision(knightBox, attackBox);
}

function attackKnight(enemy, knightPos, dispatch) {
  if (isKnightInRange(enemy, knightPos)) {
    soundManager.play('slash');
    dispatch({
      type: 'TAKE_DAMAGE',
      payload: { amount: enemy.attack || 5 }
    });
  }
}

function handleAnimationComplete(enemy, knightPos, dispatch, getEntity, collisionSystem) {
  if (enemy.objStatus === 'die') {
    enemy.stopWalkingLoop?.();
    collisionSystem.removeEntity(enemy);
    dispatch({ type: 'REMOVE_MATOS', payload: { id: enemy.id } });
    return;
  }

  if (enemy.objStatus === 'takeHit') {
    enemy.objStatus = 'attaque';
    dispatch({ type: 'NEXT_ANIMATION', payload: enemy });
    return;
  }

  if (enemy.objStatus === 'attaque') {
    // Cooldown aléatoire avant prochaine action
    enemy.objStatus = 'idle';
      attackKnight(enemy, knightPos, dispatch);

    const cooldown = Math.random() * 1700 + 300;

    setTimeout(() => {

      const distance = Math.abs(enemy.x - knightPos.x);
        const enmiEntity = getEntity(enemy.id);
      if (distance < KNIGHT_SIZE.width) {
        enemy.objStatus = 'attaque';
        if(enmiEntity && enmiEntity.stopWalkingLoop)
            enmiEntity.stopWalkingLoop();
      } else {
        enemy.objStatus = 'walk';
        if(enmiEntity && enmiEntity.startWalkingLoop)
            enmiEntity.startWalkingLoop(dispatch,collisionSystem);
      }

      dispatch({ type: 'NEXT_ANIMATION', payload: enemy });
    }, cooldown);

    return;
  }

  enemy.objStatus = 'idle';
  dispatch({ type: 'NEXT_ANIMATION', payload: enemy });
}

export const EnemyAI = {
  handleAnimationComplete,
  attackKnight,
  isKnightInRange,
};
