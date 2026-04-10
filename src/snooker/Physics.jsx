
// ============================================================================
// CONSTANTES DU JEU
// ============================================================================


export const BALL_RADIUS = 12;
export const POCKET_RADIUS = 20;
const FRICTION = 0.98; // Frottement pour ralentir les billes
const MIN_SPEED = 0.1; // Vitesse minimale avant arrêt complet


// ============================================================================
// MOTEUR PHYSIQUE
// ============================================================================

export class PhysicsEngine {
  static checkCollision(ball1, ball2, ballRadius) {
    const dx = ball2.x - ball1.x;
    const dy = ball2.y - ball1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < ballRadius * 2;
  }

  static resolveCollision(ball1, ball2, ballRadius) {
    const dx = ball2.x - ball1.x;
    const dy = ball2.y - ball1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return;

    const nx = dx / distance;
    const ny = dy / distance;

    const dvx = ball1.vx - ball2.vx;
    const dvy = ball1.vy - ball2.vy;

    const dvn = dvx * nx + dvy * ny;

    if (dvn <= 0) return;

    const impulse = dvn;

    ball1.vx -= impulse * nx;
    ball1.vy -= impulse * ny;
    ball2.vx += impulse * nx;
    ball2.vy += impulse * ny;

    const overlap = ballRadius * 2 - distance;
    if (overlap > 0) {
      const separationX = (overlap / 2) * nx;
      const separationY = (overlap / 2) * ny;
      ball1.x -= separationX;
      ball1.y -= separationY;
      ball2.x += separationX;
      ball2.y += separationY;
    }
  }

  static checkWallCollision(ball, tableWidth, tableHeight, tableMargin, ballRadius) {
    const minX = tableMargin + ballRadius;
    const maxX = tableMargin + tableWidth - ballRadius;
    const minY = tableMargin + ballRadius;
    const maxY = tableMargin + tableHeight - ballRadius;
    
    let collided = false;

    if (ball.x < minX) {
      ball.x = minX;
      ball.vx = -ball.vx;
      collided = true;
    } else if (ball.x > maxX) {
      ball.x = maxX;
      ball.vx = -ball.vx;
      collided = true;
    }

    if (ball.y < minY) {
      ball.y = minY;
      ball.vy = -ball.vy;
      collided = true;
    } else if (ball.y > maxY) {
      ball.y = maxY;
      ball.vy = -ball.vy;
      collided = true;
    }

    return collided;
  }

  static checkPocket(ball, pockets, pocketRadius) {
    for (let pocket of pockets) {
      const dx = ball.x - pocket.x;
      const dy = ball.y - pocket.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < pocketRadius) {
        return pocket;
      }
    }
    return null;
  }

  static updateBall(ball, friction, minSpeed) {
    ball.x += ball.vx;
    ball.y += ball.vy;
    ball.vx *= friction;
    ball.vy *= friction;

    const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
    if (speed < minSpeed) {
      ball.vx = 0;
      ball.vy = 0;
    }
  }
}

// ============================================================================
// LOGIQUE DU SNOOKER
// ============================================================================

export class SnookerLogic {
  static initializeBalls(tableWidth, tableHeight, tableMargin, ballRadius) {
    const balls = [];
    
    // Bille blanche (cue ball) - avec offset de marge
    balls.push({
      id: 'white',
      color: 'white',
      x: tableMargin + tableWidth * 0.25,
      y: tableMargin + tableHeight * 0.5,
      vx: 0,
      vy: 0,
      pocketed: false,
      number: null
    });

    // 15 billes rouges en triangle
    const redStartX = tableMargin + tableWidth * 0.75;
    const redStartY = tableMargin + tableHeight * 0.5;
    const rowOffsetX = ballRadius * 1.8;
    const rowOffsetY = ballRadius * 1.732;

    let redId = 0;
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col <= row; col++) {
        balls.push({
          id: `red-${redId++}`,
          color: 'red',
          x: redStartX + row * rowOffsetX,
          y: redStartY + (col - row / 2) * rowOffsetY,
          vx: 0,
          vy: 0,
          pocketed: false,
          number: null
        });
      }
    }

    // Billes de couleur avec positions fixes (avec offset de marge)
    const colorBalls = [
      { color: 'yellow', x: tableMargin + tableWidth * 0.22, y: tableMargin + tableHeight * 0.35, number: 2 },
      { color: 'green', x: tableMargin + tableWidth * 0.22, y: tableMargin + tableHeight * 0.65, number: 3 },
      { color: 'brown', x: tableMargin + tableWidth * 0.22, y: tableMargin + tableHeight * 0.5, number: 4 },
      { color: 'blue', x: tableMargin + tableWidth * 0.5, y: tableMargin + tableHeight * 0.5, number: 5 },
      { color: 'pink', x: redStartX - ballRadius * 3, y: tableMargin + tableHeight * 0.5, number: 6 },
      { color: 'black', x: tableMargin + tableWidth * 0.88, y: tableMargin + tableHeight * 0.5, number: 7 }
    ];

    colorBalls.forEach(ball => {
      balls.push({
        id: ball.color,
        color: ball.color,
        x: ball.x,
        y: ball.y,
        vx: 0,
        vy: 0,
        pocketed: false,
        number: ball.number,
        originalX: ball.x,
        originalY: ball.y
      });
    });

    return balls;
  }

  static getPockets(tableWidth, tableHeight, tableMargin, pocketRadius) {
    const margin = tableMargin + 10; // 10px à l'intérieur de la bordure
    const tableRight = tableMargin + tableWidth - 10;
    const tableBottom = tableMargin + tableHeight - 10;
    const tableMiddleX = tableMargin + tableWidth / 2;
    const tableMiddleY = tableMargin + tableHeight / 2;
    
    return [
      { x: margin, y: margin }, // Top-left
      { x: tableMiddleX, y: margin }, // Top-middle
      { x: tableRight, y: margin }, // Top-right
      { x: margin, y: tableBottom }, // Bottom-left
      { x: tableMiddleX, y: tableBottom }, // Bottom-middle
      { x: tableRight, y: tableBottom } // Bottom-right
    ];
  }

  static getTargetBallType(redsRemaining, phase) {
    if (redsRemaining > 0) {
      return phase === 'red' ? 'red' : 'color';
    }
    return 'final-colors';
  }

  static validateShot(firstBallHit, targetType) {
    if (!firstBallHit) return false;
    
    if (targetType === 'red') {
      return firstBallHit.color === 'red';
    } else if (targetType === 'color') {
      return firstBallHit.color !== 'red' && firstBallHit.color !== 'white';
    } else if (targetType === 'final-colors') {
      return firstBallHit.color !== 'red' && firstBallHit.color !== 'white';
    }
    
    return false;
  }
}
