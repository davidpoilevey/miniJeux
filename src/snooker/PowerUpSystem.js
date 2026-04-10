// ============================================================================
// SYSTÈME DE POWER-UPS
// ============================================================================

export const POWER_UP_TYPES = {
  BONUS_POINTS: { id: 'BONUS_POINTS', emoji: '💎', name: '+2 Points', color: '#FFD700' },
  FREE_SHOT: { id: 'FREE_SHOT', emoji: '🔄', name: 'Coup Gratuit', color: '#00CED1' },
  SPEED_BOOST: { id: 'SPEED_BOOST', emoji: '⚡', name: 'Boost Vitesse', color: '#FFFF00' },
  JOKER: { id: 'JOKER', emoji: '🎱', name: 'Joker', color: '#FF69B4' },
  DOUBLE_POINTS: { id: 'DOUBLE_POINTS', emoji: '⭐', name: 'Double Points', color: '#FFA500' },
  SUPER_SLIP: { id: 'SUPER_SLIP', emoji: '🧊', name: 'Super Glisse', color: '#87CEEB' },
  EXPLOSION: { id: 'EXPLOSION', emoji: '💥', name: 'Explosion', color: '#FF4500' },
  REVERSE: { id: 'REVERSE', emoji: '🔀', name: 'Inverse', color: '#9370DB' },
  TELEPORT: { id: 'TELEPORT', emoji: '🌀', name: 'Téléport', color: '#FF1493' },
  VISION: { id: 'VISION', emoji: '🔮', name: 'Vision', color: '#00FA9A' },
  SLOW_MOTION: { id: 'SLOW_MOTION', emoji: '⏱️', name: 'Slow Motion', color: '#4169E1' },
  MAGNET: { id: 'MAGNET', emoji: '🧲', name: 'Aimant', color: '#DC143C' }
};

export class PowerUpSystem {
  static getRandomPowerUp() {
    const types = Object.values(POWER_UP_TYPES);
    return types[Math.floor(Math.random() * types.length)];
  }

  static getRandomPosition(tableWidth, tableHeight, tableMargin, balls, ballRadius) {
    const safeDistance = ballRadius * 5; // Distance minimale des billes
    let attempts = 0;
    let x, y;

    while (attempts < 50) {
      x = tableMargin + 100 + Math.random() * (tableWidth - 200);
      y = tableMargin + 100 + Math.random() * (tableHeight - 200);

      // Vérifier qu'on n'est pas trop près d'une bille
      const tooClose = balls.some(ball => {
        if (ball.pocketed) return false;
        const dx = ball.x - x;
        const dy = ball.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < safeDistance;
      });

      if (!tooClose) {
        return { x, y };
      }

      attempts++;
    }

    // Fallback au centre si on ne trouve pas
    return {
      x: tableMargin + tableWidth / 2,
      y: tableMargin + tableHeight / 2
    };
  }

  static checkCollision(ball, powerUp, ballRadius) {
    if (!powerUp.x || !powerUp.y) return false;
    
    const dx = ball.x - powerUp.x;
    const dy = ball.y - powerUp.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < ballRadius * 2;
  }

  static applyEffect(type, gameState, balls, pockets, ballRadius, tableMargin, tableWidth, tableHeight) {
    const whiteBall = balls.find(b => b.color === 'white');
    if (!whiteBall) return { gameState, balls };

    let newGameState = { ...gameState };
    let newBalls = [...balls];
    const isMoving = whiteBall.vx !== 0 || whiteBall.vy !== 0;

    switch (type) {
      case 'BONUS_POINTS':
        newGameState.scores[gameState.currentPlayer - 1] += 2;
        break;

      case 'FREE_SHOT':
        newGameState.freeShot = true;
        break;

      case 'SPEED_BOOST':
        if (isMoving) {
          const whiteBallRef = newBalls.find(b => b.color === 'white');
          whiteBallRef.vx *= 1.5;
          whiteBallRef.vy *= 1.5;
          // Légère déviation aléatoire
          const deviation = (Math.random() - 0.5) * 0.3;
          const angle = Math.atan2(whiteBallRef.vy, whiteBallRef.vx) + deviation;
          const speed = Math.sqrt(whiteBallRef.vx ** 2 + whiteBallRef.vy ** 2);
          whiteBallRef.vx = Math.cos(angle) * speed;
          whiteBallRef.vy = Math.sin(angle) * speed;
        }
        break;

      case 'JOKER':
        newGameState.jokerActive = true;
        break;

      case 'DOUBLE_POINTS':
        newGameState.doublePoints = true;
        break;

      case 'SUPER_SLIP':
        newGameState.activeEffect = {
          type: 'SUPER_SLIP',
          endTime: Date.now() + 2000,
          frictionMultiplier: 0.995 // Moins de friction
        };
        if (isMoving) {
          const whiteBallRef = newBalls.find(b => b.color === 'white');
          const deviation = (Math.random() - 0.5) * 0.2;
          const angle = Math.atan2(whiteBallRef.vy, whiteBallRef.vx) + deviation;
          const speed = Math.sqrt(whiteBallRef.vx ** 2 + whiteBallRef.vy ** 2);
          whiteBallRef.vx = Math.cos(angle) * speed;
          whiteBallRef.vy = Math.sin(angle) * speed;
        }
        break;

      case 'EXPLOSION':
        // Repousser toutes les billes dans un rayon
        const explosionRadius = ballRadius * 10;
        newBalls.forEach(ball => {
          if (ball.pocketed || ball.color === 'white') return;
          
          const dx = ball.x - whiteBall.x;
          const dy = ball.y - whiteBall.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < explosionRadius && distance > 0) {
            const force = 8 * (1 - distance / explosionRadius);
            ball.vx = (dx / distance) * force;
            ball.vy = (dy / distance) * force;
            // Légère déviation
            const deviation = (Math.random() - 0.5) * 0.3;
            const angle = Math.atan2(ball.vy, ball.vx) + deviation;
            const speed = Math.sqrt(ball.vx ** 2 + ball.vy ** 2);
            ball.vx = Math.cos(angle) * speed;
            ball.vy = Math.sin(angle) * speed;
          }
        });
        break;

      case 'REVERSE':
        if (isMoving) {
          const whiteBallRef = newBalls.find(b => b.color === 'white');
          whiteBallRef.vx = -whiteBallRef.vx;
          whiteBallRef.vy = -whiteBallRef.vy;
        }
        break;

      case 'TELEPORT':
        if (isMoving) {
          const whiteBallRef = newBalls.find(b => b.color === 'white');
          const speed = Math.sqrt(whiteBallRef.vx ** 2 + whiteBallRef.vy ** 2);
          const angle = Math.atan2(whiteBallRef.vy, whiteBallRef.vx);
          
          // Position aléatoire safe
          const newPos = this.getRandomPosition(tableWidth, tableHeight, tableMargin, newBalls.filter(b => b.color !== 'white'), ballRadius);
          whiteBallRef.x = newPos.x;
          whiteBallRef.y = newPos.y;
          // Garde la vitesse et direction
          whiteBallRef.vx = Math.cos(angle) * speed;
          whiteBallRef.vy = Math.sin(angle) * speed;
        }
        break;

      case 'VISION':
        newGameState.visionActive = true;
        break;

      case 'SLOW_MOTION':
        newGameState.activeEffect = {
          type: 'SLOW_MOTION',
          endTime: Date.now() + 2000,
          speedMultiplier: 0.4
        };
        if (isMoving) {
          const whiteBallRef = newBalls.find(b => b.color === 'white');
          const deviation = (Math.random() - 0.5) * 0.2;
          const angle = Math.atan2(whiteBallRef.vy, whiteBallRef.vx) + deviation;
          const speed = Math.sqrt(whiteBallRef.vx ** 2 + whiteBallRef.vy ** 2);
          whiteBallRef.vx = Math.cos(angle) * speed;
          whiteBallRef.vy = Math.sin(angle) * speed;
        }
        break;

      case 'MAGNET':
        newGameState.activeEffect = {
          type: 'MAGNET',
          endTime: Date.now() + 2000,
          magnetForce: 0.15
        };
        break;

      default:
        break;
    }

    return { gameState: newGameState, balls: newBalls };
  }

  static applyActiveEffects(balls, pockets, gameState, ballRadius) {
    if (!gameState.activeEffect) return balls;

    const now = Date.now();
    if (now > gameState.activeEffect.endTime) {
      return balls; // Effet terminé
    }

    const newBalls = [...balls];

    if (gameState.activeEffect.type === 'MAGNET') {
      // Attirer les billes vers les poches proches
      newBalls.forEach(ball => {
        if (ball.pocketed) return;
        
        pockets.forEach(pocket => {
          const dx = pocket.x - ball.x;
          const dy = pocket.y - ball.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < ballRadius * 15 && distance > 0) {
            const force = gameState.activeEffect.magnetForce * (1 - distance / (ballRadius * 15));
            ball.vx += (dx / distance) * force;
            ball.vy += (dy / distance) * force;
          }
        });
      });
    }

    return newBalls;
  }
}