import { useState, useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import ShuffleBoard from './ShuffleBoard';
import { AI_PROFILES, getRandomTaunt } from './AIProfiles';
import ShuffleGameOver from './ShuffleGameOver';
import ShuffleMenu from './ShuffleMenu';
import sonPong from '../images/pong.mp3';
import sonService from '../images/service.mp3';

import { calculateAIDecision, getAIServeRoutine, getPlayerServeStart } from './AIController';
import { soundManager } from '../../rpg/sons/SoundManager';
import { loadGame, saveGame } from '../../civ/utils/saveGame';

export const CANVAS_WIDTH = 600;
export const CANVAS_HEIGHT = 600;
export const PUCK_RADIUS = 12;
export const PADDLE_RADIUS = 35;
export const GOAL_WIDTH = 200;
const FRICTION = 0.995;
const WALL_BOUNCE = 0.95;
const MAX_SPEED = 15;

const UNLOCKEDS = ['rebonds', 'balanced', 'aggressive', 'speedy', 'defensive'];

const ShufflePuck = () => {
  const [gameState, setGameState] = useState('menu');
  const [scores, setScores] = useState({ player: 0, ai: 0 });
  const [winner, setWinner] = useState(null);
  const [selectedAI, setSelectedAI] = useState('simple');
  const [lockedAI, setLockedAI] = useState(UNLOCKEDS);
  const [servingState, setServingState] = useState(null); // {who: 'ai'|'player', routine: {...}, startTime: timestamp}
const [aiTaunt, setAiTaunt] = useState(null);

  const aiProfile = AI_PROFILES[selectedAI];

  const gameLoopRef = useRef(null);
  const stageRef = useRef(null);
  const lastCollisionRef = useRef({ player: 0, ai: 0 });


    // Sauvegarde automatique
    useEffect(() => {
      if(UNLOCKEDS.length>lockedAI.length)
      saveGame(lockedAI,'shufflePuck');
    }, [lockedAI, saveGame]);

  useEffect(()=>{
      const savedGame = loadGame('shufflePuck');
      if (savedGame) {
        setLockedAI(savedGame);
      }
    soundManager.loadSounds({pong:sonPong, service:sonService});
  },[])
  const puckRef = useRef({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    vx: 0,
    vy: 0
  });

  const playerPaddleRef = useRef({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 80,
    prevX: CANVAS_WIDTH / 2,
    prevY: CANVAS_HEIGHT - 80
  });

  const aiPaddleRef = useRef({
    x: CANVAS_WIDTH / 2,
    y: 80,
    targetX: CANVAS_WIDTH / 2,
    targetY: 80,
    state: 'defending', // defending, attacking, returning
    lastDecisionTime: 0
  });

  const [renderTrigger, setRenderTrigger] = useState(0);

  const resetGame = () => {
    puckRef.current = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      vx: 0,
      vy: 0
    };
    playerPaddleRef.current = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - 80,
      prevX: CANVAS_WIDTH / 2,
      prevY: CANVAS_HEIGHT - 80
    };
    aiPaddleRef.current = {
      x: CANVAS_WIDTH / 2,
      y: 80,
      targetX: CANVAS_WIDTH / 2,
      targetY: 80,
      state: 'defending',
      lastDecisionTime: 0
    };
    setScores({ player: 0, ai: 0 });
    setWinner(null);
    lastCollisionRef.current = { player: 0, ai: 0 };
  };

const updateTaunt = (scorer, newScores, aiName) => {
  let situation;
  
  if (newScores.player === newScores.ai) {
    situation = 'tied';
  } else if (scorer === 'ai') {
    situation = newScores.ai > newScores.player ? 'aiScoring_aiLeading' : 'aiScoring_playerLeading';
  } else {
    situation = newScores.ai > newScores.player ? 'playerScoring_aiLeading' : 'playerScoring_playerLeading';
  }
  
  const taunt = getRandomTaunt(situation, aiName);
  setAiTaunt(taunt);
  
  // Efface le taunt après 4 secondes
  setTimeout(() => setAiTaunt(null), 4000);
};

  const startNewRound = (scorer) => {
    // Place puck in the zone of who got scored on (they serve)
    const isAIServing = scorer === 'player'; // Player scored, so AI serves
    const puckY = isAIServing ? CANVAS_HEIGHT * 0.25 : CANVAS_HEIGHT * 0.75;

    if (isAIServing) {
      // AI serves - set up serve routine
      soundManager.play('service');
      const routine = getAIServeRoutine(aiProfile);
      setServingState({
        who: 'ai',
        routine: routine,
        startTime: Date.now()
      });

      // Puck starts stationary during serve routine
      puckRef.current = {
        x: CANVAS_WIDTH / 2,
        y: puckY,
        vx: 0,
        vy: 0
      };
    } else {
      // Player serves - puck is stationary, player hits it
      const velocity = getPlayerServeStart();
      puckRef.current = {
        x: CANVAS_WIDTH / 2,
        y: puckY,
        vx: velocity.vx,
        vy: velocity.vy
      };
      setServingState(null);
    }

    lastCollisionRef.current = { player: 0, ai: 0 };
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    gameLoopRef.current = setInterval(() => {
      const puck = puckRef.current;
      const playerPaddle = playerPaddleRef.current;
      const aiPaddle = aiPaddleRef.current;
      const now = Date.now();

      // Handle AI serve routine
    if (servingState && servingState.who === 'ai') {
  const elapsed = now - servingState.startTime;
  const routine = servingState.routine;
  
  // Initialize serve if first frame
  if (!servingState.initialized) {
    // Position the puck at serve start position
    puck.x = routine.puckStartX;
    puck.y = routine.puckStartY;
    puck.vx = 0;
    puck.vy = 0;
    servingState.initialized = true;
    servingState.currentPhaseIndex = 0;
    servingState.phaseStartTime = now;
  }
  
  // Get current phase
  let totalElapsed = 0;
  let currentPhase = null;
  let phaseElapsed = 0;
  
  for (let i = 0; i < routine.phases.length; i++) {
    const phase = routine.phases[i];
    if (elapsed < totalElapsed + phase.duration) {
      currentPhase = phase;
      phaseElapsed = elapsed - totalElapsed;
      servingState.currentPhaseIndex = i;
      break;
    }
    totalElapsed += phase.duration;
  }
  
  // Execute current phase
  if (currentPhase) {
    if (currentPhase.name === 'strike') {
      // STRIKE PHASE - Apply velocity to puck
      puck.vx = currentPhase.strikeVelocity.vx;
      puck.vy = currentPhase.strikeVelocity.vy;
      setServingState(null); // Serve done
    } else {
      // ANIMATION PHASE - Move paddle
      
      // Handle oscillation
      if (currentPhase.oscillate) {
        const oscillateProgress = phaseElapsed / currentPhase.duration;
        const oscillation = Math.sin(oscillateProgress * Math.PI * currentPhase.oscillateSpeed);
        
        if (currentPhase.oscillateAxis === 'x') {
          aiPaddle.x = (routine.puckStartX || CANVAS_WIDTH / 2) + (oscillation * currentPhase.oscillateAmount);
          aiPaddle.y = currentPhase.paddleY;
        } else {
          aiPaddle.x = currentPhase.paddleX;
          aiPaddle.y = (routine.puckStartY || CANVAS_HEIGHT * 0.25) + (oscillation * currentPhase.oscillateAmount);
        }
      }
      // Handle circular motion
      else if (currentPhase.circular) {
        const circleProgress = phaseElapsed / currentPhase.duration;
        const angleRange = currentPhase.circleEndAngle - currentPhase.circleStartAngle;
        const currentAngle = currentPhase.circleStartAngle + (circleProgress * angleRange);
        const angleRad = (currentAngle * Math.PI) / 180;
        
        aiPaddle.x = currentPhase.circleCenterX + Math.cos(angleRad) * currentPhase.circleRadius;
        aiPaddle.y = currentPhase.circleCenterY + Math.sin(angleRad) * currentPhase.circleRadius;
      }
      // Handle linear interpolation to target position
      else {
        const progress = phaseElapsed / currentPhase.duration;
        const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease-out cubic
        
        // Get starting position (from previous phase or current position)
        let startX = aiPaddle.x;
        let startY = aiPaddle.y;
        
        if (servingState.currentPhaseIndex > 0) {
          const prevPhase = routine.phases[servingState.currentPhaseIndex - 1];
          if (prevPhase.paddleX !== undefined) startX = prevPhase.paddleX;
          if (prevPhase.paddleY !== undefined) startY = prevPhase.paddleY;
        }
        
        // Interpolate to target
        aiPaddle.x = startX + (currentPhase.paddleX - startX) * easeProgress;
        aiPaddle.y = startY + (currentPhase.paddleY - startY) * easeProgress;
      }
    }
  } else {
    // All phases complete but no strike phase found? End serve
    setServingState(null);
  }
  
  setRenderTrigger(prev => prev + 1);
  return;
}

      // Update puck position
      puck.x += puck.vx;
      puck.y += puck.vy;

      // Apply friction
      puck.vx *= FRICTION;
      puck.vy *= FRICTION;

      // Stop very slow movements
      if (Math.abs(puck.vx) < 0.1) puck.vx = 0;
      if (Math.abs(puck.vy) < 0.1) puck.vy = 0;

      // Wall collisions (left and right)
      if (puck.x - PUCK_RADIUS < 0) {
        puck.x = PUCK_RADIUS;
        puck.vx = Math.abs(puck.vx) * WALL_BOUNCE;
      }
      if (puck.x + PUCK_RADIUS > CANVAS_WIDTH) {
        puck.x = CANVAS_WIDTH - PUCK_RADIUS;
        puck.vx = -Math.abs(puck.vx) * WALL_BOUNCE;
      }

      // Top wall collision (with goal)
      if (puck.y - PUCK_RADIUS < 0) {
        const goalLeft = CANVAS_WIDTH / 2 - GOAL_WIDTH / 2;
        const goalRight = CANVAS_WIDTH / 2 + GOAL_WIDTH / 2;

        if (puck.x < goalLeft || puck.x > goalRight) {
          puck.y = PUCK_RADIUS;
          puck.vy = Math.abs(puck.vy) * WALL_BOUNCE;
        } else {
          // Player scored!
         
          setScores(prev => {
            const newScores = { ...prev, player: prev.player + 1 };
              updateTaunt('player', newScores, aiProfile.image); // utilise aiProfile.image comme identifiant
 
            if (newScores.player >= 7) {
              setWinner('player');
              setGameState('gameOver');
            }
            return newScores;
          });
          startNewRound('player'); // Player scored, AI serves
          return;
        }
      }

      // Bottom wall collision (with goal)
      if (puck.y + PUCK_RADIUS > CANVAS_HEIGHT) {
        const goalLeft = CANVAS_WIDTH / 2 - GOAL_WIDTH / 2;
        const goalRight = CANVAS_WIDTH / 2 + GOAL_WIDTH / 2;

        if (puck.x < goalLeft || puck.x > goalRight) {
          puck.y = CANVAS_HEIGHT - PUCK_RADIUS;
          puck.vy = -Math.abs(puck.vy) * WALL_BOUNCE;
        } else {
          // AI scored!
       
          setScores(prev => {
            const newScores = { ...prev, ai: prev.ai + 1 };
            updateTaunt('ai', newScores, aiProfile.image); // utilise aiProfile.image comme identifiant
           if (newScores.ai >= 7) {
              setWinner('ai');
              setGameState('gameOver');
            }
            return newScores;
          });
          startNewRound('ai'); // AI scored, player serves
          return;
        }
      }

      // Player paddle collision - IMPROVED PHYSICS
      const playerDist = Math.hypot(puck.x - playerPaddle.x, puck.y - playerPaddle.y);
      if (playerDist < PUCK_RADIUS + PADDLE_RADIUS && now - lastCollisionRef.current.player > 100) {
        lastCollisionRef.current.player = now;
soundManager.play('pong');
        // Calculate collision normal
        const nx = (puck.x - playerPaddle.x) / playerDist;
        const ny = (puck.y - playerPaddle.y) / playerDist;

        // Paddle velocity (from mouse movement)
        const paddleVx = (playerPaddle.x - playerPaddle.prevX) * 0.8;
        const paddleVy = (playerPaddle.y - playerPaddle.prevY) * 0.8;

        // Relative velocity
        const relVx = puck.vx - paddleVx;
        const relVy = puck.vy - paddleVy;

        // Velocity along collision normal
        const velAlongNormal = relVx * nx + relVy * ny;

        // Don't resolve if velocities are separating
        if (velAlongNormal < 0) {
          // Apply impulse
          const impulse = -1.8 * velAlongNormal; // 1.8 = restitution
          puck.vx += impulse * nx + paddleVx;
          puck.vy += impulse * ny + paddleVy;

          // Cap max speed
          const speed = Math.hypot(puck.vx, puck.vy);
          if (speed > MAX_SPEED) {
            puck.vx = (puck.vx / speed) * MAX_SPEED;
            puck.vy = (puck.vy / speed) * MAX_SPEED;
          }
        }

        // Push puck outside paddle
        const overlap = (PUCK_RADIUS + PADDLE_RADIUS) - playerDist;
        puck.x += nx * overlap;
        puck.y += ny * overlap;
      }

      // AI paddle collision - IMPROVED PHYSICS
   // AI paddle collision - IMPROVED PHYSICS WITH PADDLE VELOCITY
const aiDist = Math.hypot(puck.x - aiPaddle.x, puck.y - aiPaddle.y);
if (aiDist < PUCK_RADIUS + PADDLE_RADIUS && now - lastCollisionRef.current.ai > 100) {
  lastCollisionRef.current.ai = now;
soundManager.play('pong');
  const nx = (puck.x - aiPaddle.x) / aiDist;
  const ny = (puck.y - aiPaddle.y) / aiDist;

  // Initialize paddle velocity if not exists
  if (!aiPaddle.vx) aiPaddle.vx = 0;
  if (!aiPaddle.vy) aiPaddle.vy = 0;

  // Calculate RELATIVE velocity (puck relative to paddle)
  const relVx = puck.vx - aiPaddle.vx;
  const relVy = puck.vy - aiPaddle.vy;
  const relVelAlongNormal = relVx * nx + relVy * ny;

  // Only apply impulse if puck and paddle are approaching each other
  // OR if paddle is moving toward puck (for hitting stationary pucks)
  const paddleVelAlongNormal = aiPaddle.vx * nx + aiPaddle.vy * ny;
  
  if (relVelAlongNormal < 0 || paddleVelAlongNormal > 0.5) {
    // Calculate impulse based on PADDLE velocity when puck is stationary
    const puckSpeed = Math.hypot(puck.vx, puck.vy);
    const paddleSpeed = Math.hypot(aiPaddle.vx, aiPaddle.vy);
    
    let impulse;
    if (puckSpeed < 0.5 && paddleSpeed > 1.0) {
      // Puck is stationary, paddle is moving - DIRECT MOMENTUM TRANSFER
      impulse = paddleSpeed * 1.5; // Transfer 150% of paddle velocity
    } else {
      // Normal collision with relative velocity
      impulse = -3.2 * relVelAlongNormal;
    }
    
    puck.vx += impulse * nx;
    puck.vy += impulse * ny;

    const speed = Math.hypot(puck.vx, puck.vy);
    if (speed > MAX_SPEED) {
      puck.vx = (puck.vx / speed) * MAX_SPEED;
      puck.vy = (puck.vy / speed) * MAX_SPEED;
    }
    
    // Paddle loses some velocity on impact (recoil)
    aiPaddle.vx *= 0.7;
    aiPaddle.vy *= 0.7;
  }

  // Separate overlapping objects
  const overlap = (PUCK_RADIUS + PADDLE_RADIUS) - aiDist;
  if (overlap > 0) {
    puck.x += nx * overlap;
    puck.y += ny * overlap;
  }
}
      // AI movement - Use external controller
      const aiDecision = calculateAIDecision(
        puckRef.current,
        aiPaddle,
        aiProfile,
        now
      );
if (aiDecision) {
  // Check if AI wants to teleport stuck puck
  if (aiDecision.teleport) {
    puck.x = aiDecision.targetX;
    puck.y = aiDecision.targetY;
    puck.vx = 0;
    puck.vy = 0;
    if (aiDecision.targetY < CANVAS_HEIGHT / 2) {
      const routine = getAIServeRoutine(aiProfile);
      setServingState({
        who: 'ai',
        routine: routine,
        startTime: now
      });
    }
  } else {
    // Update AI state and targets
    aiPaddle.targetX = aiDecision.targetX;
    aiPaddle.targetY = aiDecision.targetY;
    aiPaddle.state = aiDecision.state;
    aiPaddle.windupPhase = aiDecision.windupPhase;
    aiPaddle.lastDecisionTime = now;
    
    // Initialize velocity if not exists
    if (!aiPaddle.vx) aiPaddle.vx = 0;
    if (!aiPaddle.vy) aiPaddle.vy = 0;
    
    // Store acceleration for committed strikes
    if (!aiPaddle.committedAccelX) aiPaddle.committedAccelX = aiDecision.accelerationX;
    if (!aiPaddle.committedAccelY) aiPaddle.committedAccelY = aiDecision.accelerationY;
    
    // Use stored acceleration if striking, otherwise use new decision
    const accelX = (aiPaddle.state === 'striking' || aiPaddle.state === 'following_through') 
                    ? aiPaddle.committedAccelX 
                    : aiDecision.accelerationX;
    const accelY = (aiPaddle.state === 'striking' || aiPaddle.state === 'following_through') 
                    ? aiPaddle.committedAccelY 
                    : aiDecision.accelerationY;
    
    aiPaddle.committedAccelX = accelX;
    aiPaddle.committedAccelY = accelY;
  }
}

// ===== PHYSICS-BASED MOVEMENT WITH ACCELERATION =====
// Initialize velocity if not exists
if (!aiPaddle.vx) aiPaddle.vx = 0;
if (!aiPaddle.vy) aiPaddle.vy = 0;

const diffX = aiPaddle.targetX - aiPaddle.x;
const diffY = aiPaddle.targetY - aiPaddle.y;
const distance = Math.hypot(diffX, diffY);

if (distance > 2) {
  // Calculate desired acceleration based on committed values or current state
  const baseAcceleration = aiProfile.speed * 0.15;
  const accelX = (aiPaddle.committedAccelX || 0.5) * baseAcceleration;
  const accelY = (aiPaddle.committedAccelY || 0.5) * baseAcceleration;
  
  // Apply acceleration toward target
  const dirX = diffX / distance;
  const dirY = diffY / distance;
  
  aiPaddle.vx += dirX * accelX;
  aiPaddle.vy += dirY * accelY;
  
  // CRITICAL: Higher max velocity for striking states
  const isStriking = aiPaddle.state === 'striking' || aiPaddle.state === 'following_through';
  const maxVelocity = aiProfile.speed * (
    isStriking ? 5.0 :                      // VERY FAST strike - NO BRAKING
    aiPaddle.state === 'circling' ? 1.8 :
    aiPaddle.state === 'preparing' ? 1.2 :
    aiPaddle.state === 'clearing' ? 1.8 :
    aiPaddle.state === 'attacking' ? 1.5 :
    0.8
  );
  
  // Clamp velocity
  const currentSpeed = Math.hypot(aiPaddle.vx, aiPaddle.vy);
  if (currentSpeed > maxVelocity) {
    aiPaddle.vx = (aiPaddle.vx / currentSpeed) * maxVelocity;
    aiPaddle.vy = (aiPaddle.vy / currentSpeed) * maxVelocity;
  }
  
  // Apply velocity to position
  aiPaddle.x += aiPaddle.vx;
  aiPaddle.y += aiPaddle.vy;
  
  // Apply friction ONLY if NOT striking (no braking during strike!)
  const friction = isStriking ? 0.98 : 0.85;
  aiPaddle.vx *= friction;
  aiPaddle.vy *= friction;
  
} else {
  // Reached target - reset committed acceleration and apply damping
  aiPaddle.committedAccelX = null;
  aiPaddle.committedAccelY = null;
  aiPaddle.vx *= 0.5;
  aiPaddle.vy *= 0.5;
}

// Keep AI paddle in bounds
aiPaddle.x = Math.max(PADDLE_RADIUS, Math.min(CANVAS_WIDTH - PADDLE_RADIUS, aiPaddle.x));
aiPaddle.y = Math.max(PADDLE_RADIUS, Math.min(CANVAS_HEIGHT / 2 - PADDLE_RADIUS, aiPaddle.y));

// Stop velocity if hitting boundaries
if (aiPaddle.x <= PADDLE_RADIUS || aiPaddle.x >= CANVAS_WIDTH - PADDLE_RADIUS) {
  aiPaddle.vx = 0;
}
if (aiPaddle.y <= PADDLE_RADIUS || aiPaddle.y >= CANVAS_HEIGHT / 2 - PADDLE_RADIUS) {
  aiPaddle.vy = 0;
}

setRenderTrigger(prev => prev + 1);
    }, 1000 / 60);

    return () => clearInterval(gameLoopRef.current);
  }, [gameState, servingState]);

  const handleMouseMove = (e) => {
    if (gameState !== 'playing') return;

    const stage = stageRef.current;
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    const paddle = playerPaddleRef.current;
    paddle.prevX = paddle.x;
    paddle.prevY = paddle.y;

    if (pos.y > CANVAS_HEIGHT / 2) {
      paddle.x = Math.max(PADDLE_RADIUS, Math.min(CANVAS_WIDTH - PADDLE_RADIUS, pos.x));
      paddle.y = Math.max(CANVAS_HEIGHT / 2 + PADDLE_RADIUS, Math.min(CANVAS_HEIGHT - PADDLE_RADIUS, pos.y));
    }
  };


  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2,
      p: 3,
      bgcolor: '#f8f9c2',
      minHeight: '100vh'
    }}>
      <Typography
        variant="h2"
        sx={{
          color: '#615c1e',
          fontFamily: '"Press Start 2P", monospace',
          textShadow: '0 0 20px #e4dc40, 0 0 40px #fff200',
          mb: 2,
          fontSize: { xs: '1.5rem', md: '2.5rem' }
        }}
      >
        SHUFFLE PUCK CAFÉ
      </Typography>

      {gameState === 'menu' && (
        <ShuffleMenu resetGame={resetGame} lockedAI={lockedAI} setSelectedAI={setSelectedAI}
          selectedAI={selectedAI} setGameState={setGameState} />
      )}

      {(gameState === 'playing' || gameState === 'paused') && (
        <ShuffleBoard aiProfile={aiProfile}
        aiTaunt={aiTaunt}
          scores={scores} setGameState={setGameState}
          stageRef={stageRef} puckRef={puckRef} handleMouseMove={handleMouseMove}
          aiPaddleRef={aiPaddleRef} playerPaddleRef={playerPaddleRef} />
      )}

      {/* Game Over Dialog */}
      <ShuffleGameOver setGameState={setGameState} 
      setSelectedAI={setSelectedAI} 
      lockedAI={lockedAI} setLockedAI={setLockedAI} gameState={gameState}
        winner={winner} scores={scores} resetGame={resetGame} />

    </Box>
  );
};

export default ShufflePuck;