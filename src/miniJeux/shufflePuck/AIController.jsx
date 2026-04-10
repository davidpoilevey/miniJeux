// aiController.js
// AI behavior controller for Shuffle Puck - IMPROVED VERSION

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 600;
const PADDLE_RADIUS = 35;
const PUCK_RADIUS = 15;

/**
 * Calculate AI paddle target position and state based on game situation
 * @param {Object} puck - Puck state {x, y, vx, vy}
 * @param {Object} aiPaddle - AI paddle state {x, y, vx, vy, state, lastDecisionTime, windupPhase}
 * @param {Object} aiProfile - AI personality profile
 * @param {number} now - Current timestamp
 * @returns {Object} - {targetX, targetY, state, accelerationX, accelerationY, windupPhase}
 */
export const calculateAIDecision = (puck, aiPaddle, aiProfile, now) => {
  // CRITICAL: If already committed to strike, don't recalculate until impact/completion
  const isCommittedToStrike = aiPaddle.windupPhase === 'striking' || 
                               aiPaddle.windupPhase === 'striking_from_side' ||
                               aiPaddle.windupPhase === 'following_through';
  
  if (isCommittedToStrike) {
    // Already striking - maintain current target and acceleration
    const distToTarget = Math.hypot(aiPaddle.targetX - aiPaddle.x, aiPaddle.targetY - aiPaddle.y);
    const distToPuck = Math.hypot(puck.x - aiPaddle.x, puck.y - aiPaddle.y);
    
    // Only release commit if we've passed the puck or are very far from target
    if (distToTarget < 15 || distToPuck > 150) {
      // Strike completed or lost the puck - reset
      aiPaddle.windupPhase = null;
      aiPaddle.lastDecisionTime = 0; // Force immediate new decision
      return null;
    }
    
    // Maintain strike - no new decision
    return null;
  }
  
  // Skip if not time for new decision
  const adjustedReactionTime = aiProfile.reactionTime * 0.7;
  if (now - aiPaddle.lastDecisionTime < adjustedReactionTime) {
    return null;
  }

  const aiZoneTop = 0;
  const aiZoneBottom = CANVAS_HEIGHT / 2;
  const aiDefenseY = aiZoneTop + (aiZoneBottom - aiZoneTop) * aiProfile.defenseZone;
  
  const puckInAIZone = puck.y < CANVAS_HEIGHT / 2;
  const puckInPlayerZone = puck.y >= CANVAS_HEIGHT / 2;
  const puckSpeed = Math.hypot(puck.vx, puck.vy);
  const puckMoving = puckSpeed > 0.5;
  const distanceToPuck = Math.hypot(puck.x - aiPaddle.x, puck.y - aiPaddle.y);
  
  // CHEAT: Detect stuck in corners
  const cornerMargin = 80;
  const inCorner = (
    (puck.x < cornerMargin || puck.x > CANVAS_WIDTH - cornerMargin) ||
    (puck.y < cornerMargin || puck.y > CANVAS_HEIGHT - cornerMargin)
  );
  
  if (inCorner && !puckMoving) {
    return {
      teleport: true,
      targetX: CANVAS_WIDTH / 2,
      targetY: puckInAIZone ? CANVAS_HEIGHT * 0.25 : CANVAS_HEIGHT * 0.75,
      state: 'engaging'
    };
  }
  
  let targetX = aiPaddle.x;
  let targetY = aiDefenseY;
  let state = 'defending';
  let accelerationX = 0;
  let accelerationY = 0;
  let windupPhase = null;

  // ========== ATTACK MODE ==========
  if (puckInAIZone) {
    const puckBehindPaddle = puck.y < aiPaddle.y - 15;
    
    if (puckBehindPaddle) {
      // DANGER ZONE - repositioning needed
      const needToGoAround = aiPaddle.y > puck.y + 10;
      
      if (needToGoAround) {
        targetX = puck.x;
        targetY = Math.max(aiZoneTop + PADDLE_RADIUS + 5, puck.y - 40);
        state = 'repositioning';
        accelerationX = 0.5;
        accelerationY = 0.5;
      } else {
        // Clear the puck sideways
        const goalCenter = CANVAS_WIDTH / 2;
        const pushDirection = puck.x < goalCenter ? -70 : 70;
        targetX = puck.x + pushDirection;
        targetY = puck.y + 20;
        state = 'clearing';
        accelerationX = 1.2;
        accelerationY = 0.8;
      }
    } else {
      // ========== MAIN ATTACK LOGIC WITH WIND-UP ==========
      const shouldMiss = Math.random() < aiProfile.missChance;
      
      if (!shouldMiss) {
        // Predict puck future position
        const predictFrames = puckMoving ? Math.max(5, 15 - aiProfile.speed) : 0;
        let predictedX = puck.x + puck.vx * predictFrames;
        let predictedY = puck.y + puck.vy * predictFrames;
        
        // Clamp to AI zone
        predictedX = Math.max(PADDLE_RADIUS + 20, Math.min(CANVAS_WIDTH - PADDLE_RADIUS - 20, predictedX));
        predictedY = Math.max(aiZoneTop + PADDLE_RADIUS, Math.min(aiZoneBottom - PADDLE_RADIUS - 30, predictedY));
        
        // Calculate optimal strike vector (from puck toward player goal)
        const goalCenterX = CANVAS_WIDTH / 2;
        const goalY = CANVAS_HEIGHT - 50; // Player's goal area
        
        // Direction from puck to goal
        const toGoalX = goalCenterX - predictedX;
        const toGoalY = goalY - predictedY;
        const toGoalDist = Math.hypot(toGoalX, toGoalY);
        const toGoalNormX = toGoalX / toGoalDist;
        const toGoalNormY = toGoalY / toGoalDist;
        
        // Vector from current position to puck
        const toPuckX = predictedX - aiPaddle.x;
        const toPuckY = predictedY - aiPaddle.y;
        const toPuckDist = Math.hypot(toPuckX, toPuckY);
        
        // ===== SPECIAL CASE: Puck is stationary and very close =====
        const veryCloseToPuck = toPuckDist < 80;
        
        if (!puckMoving && veryCloseToPuck) {
          // Puck is right in front of us - we need to circle around it
          
          // Check if we're already in good lateral position (to the side)
          const lateralOffset = Math.abs(aiPaddle.x - predictedX);
          
          // Hysteresis: once we start circling, continue until we're well positioned
          const isCurrentlyCircling = aiPaddle.windupPhase === 'circling_around';
          const needsLateralMovement = isCurrentlyCircling ? lateralOffset < 70 : lateralOffset < 60;
          
          if (needsLateralMovement) {
            // Phase 1: Move to the SIDE first (perpendicular to goal direction)
            // Choose left or right based on which side has more space
            const goLeft = aiPaddle.x > CANVAS_WIDTH / 2;
            const lateralDistance = 80;
            
            targetX = predictedX + (goLeft ? -lateralDistance : lateralDistance);
            targetY = predictedY - 40; // Behind the puck vertically
            state = 'circling';
            windupPhase = 'circling_around';
            accelerationX = 1.2;
            accelerationY = 0.8;
          } else {
            // Phase 2: We're to the side now, COMMIT TO STRIKE!
            targetX = predictedX + toGoalNormX * 30; // Strike THROUGH the puck
            targetY = predictedY + toGoalNormY * 30;
            state = 'striking';
            windupPhase = 'striking_from_side';
            
            // MASSIVE acceleration - no holding back
            const strikeAcceleration = 5.0 + aiProfile.aggressiveness * 3.0;
            accelerationX = strikeAcceleration;
            accelerationY = strikeAcceleration;
          }
        } 
        // ===== NORMAL CASE: Wind-up logic for moving or distant pucks =====
        else {
          // Wind-up distance based on AI profile
          const windupDistance = 70 + (1 - aiProfile.aggressiveness) * 50;
          
          // IDEAL wind-up position: BEHIND the puck (opposite to goal)
          const idealWindupX = predictedX - toGoalNormX * windupDistance;
          const idealWindupY = predictedY - toGoalNormY * windupDistance;
          
          // Clamp windup position to AI zone
          const clampedWindupX = Math.max(PADDLE_RADIUS, Math.min(CANVAS_WIDTH - PADDLE_RADIUS, idealWindupX));
          const clampedWindupY = Math.max(aiZoneTop + PADDLE_RADIUS, Math.min(aiZoneBottom - PADDLE_RADIUS, idealWindupY));
          
          // CRITICAL: Check if wind-up position was clamped (out of bounds)
          const windupWasClamped = Math.abs(idealWindupX - clampedWindupX) > 10 || 
                                   Math.abs(idealWindupY - clampedWindupY) > 10;
          
          // If windup is impossible (clamped), use LATERAL approach instead
          if (windupWasClamped) {
            // Can't wind-up behind - use lateral strike like close pucks
            const lateralOffset = Math.abs(aiPaddle.x - predictedX);
            const isCurrentlyCircling = aiPaddle.windupPhase === 'circling_around';
            const needsLateralMovement = isCurrentlyCircling ? lateralOffset > 10 : lateralOffset > 20;
            
            if (needsLateralMovement) {
              const goLeft = aiPaddle.x > CANVAS_WIDTH / 2;
              const lateralDistance = 80;
              
              targetX = predictedX + (goLeft ? -lateralDistance : lateralDistance);
              targetY = Math.max(aiZoneTop + PADDLE_RADIUS + 10, predictedY - 20);
              state = 'circling';
              windupPhase = 'circling_around';
              accelerationX = 1.2;
              accelerationY = 0.8;
            } else {
              targetX = predictedX + toGoalNormX * 30;
              targetY = predictedY + toGoalNormY * 30;
              state = 'striking';
              windupPhase = 'striking_from_side';
              
              const strikeAcceleration = 5.0 + aiProfile.aggressiveness * 3.0;
              accelerationX = strikeAcceleration;
              accelerationY = strikeAcceleration;
            }
          } else {
            // Normal windup possible
            // Check paddle's position relative to ideal wind-up
            const distToIdealWindup = Math.hypot(clampedWindupX - aiPaddle.x, clampedWindupY - aiPaddle.y);
          
          // Check if paddle is BEHIND the puck (good position for striking)
          const dotProduct = (toPuckX * toGoalNormX + toPuckY * toGoalNormY) / toPuckDist;
          const isInStrikePosition = dotProduct > 0.3;
          
          // Hysteresis for strike readiness
          const isCurrentlyPreparing = aiPaddle.windupPhase === 'moving_to_windup';
          const windupThreshold = isCurrentlyPreparing ? 30 : 50; // Tighter when already preparing
          const readyToStrike = isInStrikePosition && distToIdealWindup < windupThreshold;
          
          // ===== DECISION TREE =====
          
          // Case 1: Not in good strike position - reposition
          if (!readyToStrike) {
            targetX = clampedWindupX;
            targetY = clampedWindupY;
            state = 'preparing';
            windupPhase = 'moving_to_windup';
            accelerationX = 1.2;
            accelerationY = 1.2;
          }
          // Case 2: Good position - CHARGE!
          else if (toPuckDist > PADDLE_RADIUS + PUCK_RADIUS + 10) {
            // Target is PAST the puck to ensure follow-through
            targetX = predictedX + toGoalNormX * 40;
            targetY = predictedY + toGoalNormY * 40;
            state = 'striking';
            windupPhase = 'striking';
            
            // EXPLOSIVE acceleration - COMMIT TO STRIKE
            const strikeAcceleration = 5.0 + aiProfile.aggressiveness * 3.0;
            accelerationX = strikeAcceleration;
            accelerationY = strikeAcceleration;
          }
          // Case 3: Very close - follow through
          else {
            targetX = predictedX + toGoalNormX * 50;
            targetY = predictedY + toGoalNormY * 50;
            state = 'following_through';
            windupPhase = 'following_through';
            accelerationX = 2.0;
            accelerationY = 2.0;
          }
          } // End of normal windup else block
        }
        
      } else {
        // Intentional miss
        targetX = puck.x + (Math.random() - 0.5) * 150;
        targetY = Math.min(aiDefenseY + 50, puck.y);
        state = 'attacking';
        accelerationX = 0.8;
        accelerationY = 0.6;
        windupPhase = 'missing';
      }
    }
  } 
  // ========== DEFENSE MODE ==========
  else if (puckInPlayerZone) {
    state = 'defending';
    
    switch (aiProfile.defensePattern) {
      case 'stationary':
        targetX = CANVAS_WIDTH / 2 + (puck.x - CANVAS_WIDTH / 2) * 0.2;
        targetY = aiDefenseY;
        accelerationX = 0.3;
        accelerationY = 0.3;
        break;
        
      case 'patrol':
        const patrolTime = now / 1000;
        const patrolRange = 150;
        targetX = CANVAS_WIDTH / 2 + Math.sin(patrolTime * 1.5) * patrolRange;
        targetY = aiDefenseY;
        accelerationX = 0.4;
        accelerationY = 0.3;
        break;
        
      case 'aggressive':
        targetX = CANVAS_WIDTH / 2 + (puck.x - CANVAS_WIDTH / 2) * 0.5;
        targetY = aiZoneBottom - PADDLE_RADIUS - 20;
        accelerationX = 0.6;
        accelerationY = 0.4;
        
        if (puck.vy < -2 && Math.random() < aiProfile.aggressiveness) {
          const interceptFrames = 10;
          targetX = puck.x + puck.vx * interceptFrames;
          accelerationX = 1.2;
        }
        break;
        
      default:
        const trackingFactor = aiProfile.aggressiveness * 0.6;
        targetX = CANVAS_WIDTH / 2 + (puck.x - CANVAS_WIDTH / 2) * trackingFactor;
        targetY = aiDefenseY;
        accelerationX = 0.4;
        accelerationY = 0.3;
    }
  }

  // Clamp targets to valid bounds
  targetX = Math.max(PADDLE_RADIUS, Math.min(CANVAS_WIDTH - PADDLE_RADIUS, targetX));
  targetY = Math.max(aiZoneTop + PADDLE_RADIUS, Math.min(aiZoneBottom - PADDLE_RADIUS, targetY));

  return { 
    targetX, 
    targetY, 
    state, 
    accelerationX, 
    accelerationY,
    windupPhase
  };
};

/**
 * Generate AI's serve routine
 * Each routine defines: paddle position, puck position, animation, and strike parameters
 * @param {Object} aiProfile - AI personality profile
 * @returns {Object} - Complete serve routine configuration
 */
export const getAIServeRoutine = (aiProfile) => {
  const centerX = CANVAS_WIDTH / 2;
  const aiHomeY = CANVAS_HEIGHT * 0.25; // AI's comfort zone
  
  switch (aiProfile.serveStyle) {
    case 'power':
      // POWER SERVE: Paddle recule profondément, puis SMASH brutal central
      return {
        type: 'power_smash',
        description: "Winds up and SMASHES it!",
        
        // Puck starts center
        puckStartX: centerX,
        puckStartY: aiHomeY,
        
        // Paddle animation phases
        phases: [
          {
            name: 'windup',
            duration: 500,
            paddleX: centerX,
            paddleY: 50, // Recule tout en haut
          },
          {
            name: 'approach',
            duration: 300,
            paddleX: centerX,
            paddleY: aiHomeY - 80, // S'approche du palet
          },
          {
            name: 'strike',
            duration: 100,
            // Frappe À TRAVERS le palet
            strikeVelocity: {
              vx: (Math.random() - 0.5) * 2, // Presque droit
              vy: 10 + Math.random() * 3 // BRUTAL
            }
          }
        ]
      };
      
    case 'tricky':
      // TRICKY SERVE: Feinte gauche-droite, puis tir en coin surprise
      const feintSide = Math.random() > 0.5 ? 1 : -1;
      const shootSide = -feintSide; // Tire du côté opposé à la feinte
      
      return {
        type: 'feint_corner',
        description: "Feints and shoots to corner!",
        
        puckStartX: centerX,
        puckStartY: aiHomeY,
        
        phases: [
          {
            name: 'feint_setup',
            duration: 200,
            paddleX: centerX + (feintSide * 100),
            paddleY: aiHomeY - 40,
          },
          {
            name: 'feint_move',
            duration: 400,
            // Oscille pendant la feinte
            oscillate: true,
            oscillateAxis: 'x',
            oscillateAmount: 60 * feintSide,
            oscillateSpeed: 3,
            paddleY: aiHomeY - 40,
          },
          {
            name: 'quick_reposition',
            duration: 150,
            paddleX: centerX + (shootSide * 80),
            paddleY: aiHomeY - 60,
          },
          {
            name: 'strike',
            duration: 100,
            strikeVelocity: {
              vx: shootSide * (6 + Math.random() * 3), // Vers le coin
              vy: 7 + Math.random() * 2
            }
          }
        ]
      };
      
    case 'safe':
      // SAFE SERVE: Paddle tourne autour du palet, puis pousse doucement avec spin
      return {
        type: 'spin_circle',
        description: "Calculated spin shot...",
        
        puckStartX: centerX,
        puckStartY: aiHomeY,
        
        phases: [
          {
            name: 'circle_start',
            duration: 400,
            // Commence à droite du palet
            paddleX: centerX + 70,
            paddleY: aiHomeY,
          },
          {
            name: 'circle_motion',
            duration: 600,
            // Fait un arc de cercle autour du palet
            circular: true,
            circleRadius: 70,
            circleCenterX: centerX,
            circleCenterY: aiHomeY,
            circleStartAngle: 0, // Commence à droite (0°)
            circleEndAngle: 180, // Finit à gauche (180°)
          },
          {
            name: 'strike',
            duration: 100,
            strikeVelocity: {
              vx: (Math.random() - 0.5) * 3, // Léger angle
              vy: 6 + Math.random() * 1.5 // Modéré
            }
          }
        ]
      };
      
    case 'bounce':
      // BOUNCE SERVE: Paddle va sur le côté, frappe le mur latéral
      const bounceSide = Math.random() > 0.5 ? 1 : -1;
      
      return {
        type: 'wall_bounce',
        description: "Bank shot off the wall!",
        
        // Palet sur le côté pour le bounce
        puckStartX: centerX + (bounceSide * 150),
        puckStartY: aiHomeY + 30,
        
        phases: [
          {
            name: 'setup',
            duration: 300,
            paddleX: centerX + (bounceSide * 200),
            paddleY: aiHomeY + 50,
          },
          {
            name: 'windup',
            duration: 400,
            paddleX: centerX + (bounceSide * 250), // Encore plus sur le côté
            paddleY: aiHomeY + 30,
          },
          {
            name: 'strike',
            duration: 100,
            strikeVelocity: {
              vx: -bounceSide * (7 + Math.random() * 2), // VERS le mur opposé
              vy: 6 + Math.random() * 2
            }
          }
        ]
      };
      
    default:
      // DEFAULT: Simple et rapide
      return {
        type: 'simple_serve',
        description: "Quick serve!",
        
        puckStartX: centerX,
        puckStartY: aiHomeY,
        
        phases: [
          {
            name: 'windup',
            duration: 400,
            paddleX: centerX,
            paddleY: aiHomeY - 60,
          },
          {
            name: 'strike',
            duration: 100,
            strikeVelocity: {
              vx: (Math.random() - 0.5) * 3,
              vy: 7 + Math.random() * 2
            }
          }
        ]
      };
  }
};

export const getPlayerServeStart = () => {
  return {
    vx: 0,
    vy: 0
  };
};