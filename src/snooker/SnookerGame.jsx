import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';
import { PhysicsEngine, SnookerLogic } from './Physics';
import { PowerUpSystem, POWER_UP_TYPES } from './PowerUpSystem';
import GameCanvas from './GameCanvas';
import PlayerPanel from './PlayerPanel';
import GameInfo from './GameInfo';

// ============================================================================
// CONSTANTES DU JEU
// ============================================================================

const TABLE_RATIO = 2;
const MAX_TABLE_WIDTH = 1000;
const TABLE_MARGIN = 100;
const BALL_RADIUS = 12;
const POCKET_RADIUS = 20;
const BASE_FRICTION = 0.99;
const MIN_SPEED = 0.1;

const BALL_POINTS = {
  red: 1,
  yellow: 2,
  green: 3,
  brown: 4,
  blue: 5,
  pink: 6,
  black: 7
};

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function SnookerGame() {
  const containerRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ 
    width: 1200, 
    height: 700, 
    tableWidth: 1000, 
    tableHeight: 500 
  });
  
  const [balls, setBalls] = useState([]);
  const [pockets, setPockets] = useState([]);
  
  const [gameState, setGameState] = useState({
    currentPlayer: 1,
    scores: [0, 0],
    phase: 'red',
    redsRemaining: 15,
    isAiming: false,
    isShooting: false,
    aimAngle: 0,
    aimPower: 0,
    firstBallHit: null,
    ballsPocketed: [],
    faultInfo: null,
    // Power-ups
    freeShot: false,
    jokerActive: false,
    doublePoints: false,
    visionActive: false,
    activeEffect: null // { type, endTime, ... }
  });

  const [powerUp, setPowerUp] = useState({
    active: null,
    x: null,
    y: null,
    collecting: false,
    collectAnimation: 1.0
  });

  const animationFrameRef = useRef(null);
  const mouseDownPos = useRef(null);

  // Calcul de la taille responsive
  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      
      const containerWidth = containerRef.current.offsetWidth;
      const tableWidth = Math.min(containerWidth - 32, MAX_TABLE_WIDTH);
      const tableHeight = tableWidth / TABLE_RATIO;
      const width = tableWidth + TABLE_MARGIN * 2;
      const height = tableHeight + TABLE_MARGIN * 2;
      
      setCanvasSize({ width, height, tableWidth, tableHeight });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Initialisation
  useEffect(() => {
    if (canvasSize.tableWidth > 0) {
      setBalls(SnookerLogic.initializeBalls(
        canvasSize.tableWidth, 
        canvasSize.tableHeight, 
        TABLE_MARGIN, 
        BALL_RADIUS
      ));
      setPockets(SnookerLogic.getPockets(
        canvasSize.tableWidth, 
        canvasSize.tableHeight, 
        TABLE_MARGIN, 
        POCKET_RADIUS
      ));
      
      // Spawn premier power-up
      spawnPowerUp();
    }
  }, [canvasSize]);

  // Spawn d'un power-up
  const spawnPowerUp = () => {
    const type = PowerUpSystem.getRandomPowerUp();
    const pos = PowerUpSystem.getRandomPosition(
      canvasSize.tableWidth,
      canvasSize.tableHeight,
      TABLE_MARGIN,
      balls,
      BALL_RADIUS
    );
    
    setPowerUp({
      active: type,
      x: pos.x,
      y: pos.y,
      collecting: false,
      collectAnimation: 1.0
    });
  };

  // Boucle de jeu principale
  useEffect(() => {
    if (gameState.isShooting) {
      const animate = () => {
        setBalls(prevBalls => {
          let newBalls = [...prevBalls];
          let anyMoving = false;
          const pocketedThisTurn = [];

          // Appliquer les effets actifs (aimant, etc.)
          newBalls = PowerUpSystem.applyActiveEffects(
            newBalls,
            pockets,
            gameState,
            BALL_RADIUS
          );

          // Friction dynamique selon les effets
          let friction = BASE_FRICTION;
          if (gameState.activeEffect?.type === 'SUPER_SLIP') {
            friction = gameState.activeEffect.frictionMultiplier;
          }

          // Vitesse dynamique selon les effets
          let speedMultiplier = 1;
          if (gameState.activeEffect?.type === 'SLOW_MOTION') {
            speedMultiplier = gameState.activeEffect.speedMultiplier;
          }

          newBalls.forEach((ball, i) => {
            if (ball.pocketed) return;

            // Mise à jour avec friction et vitesse modifiées
            ball.x += ball.vx * speedMultiplier;
            ball.y += ball.vy * speedMultiplier;
            ball.vx *= friction;
            ball.vy *= friction;

            const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
            if (speed < MIN_SPEED) {
              ball.vx = 0;
              ball.vy = 0;
            }

            PhysicsEngine.checkWallCollision(
              ball,
              canvasSize.tableWidth,
              canvasSize.tableHeight,
              TABLE_MARGIN,
              BALL_RADIUS
            );

            const pocket = PhysicsEngine.checkPocket(ball, pockets, POCKET_RADIUS);
            if (pocket) {
              ball.pocketed = true;
              ball.pocketAnimation = 1.0;
              pocketedThisTurn.push(ball);
            }

            if (ball.vx !== 0 || ball.vy !== 0) {
              anyMoving = true;
            }

            // Collisions inter-billes
            for (let j = i + 1; j < newBalls.length; j++) {
              const other = newBalls[j];
              if (!other.pocketed && PhysicsEngine.checkCollision(ball, other, BALL_RADIUS)) {
                if (ball.color === 'white' && !gameState.firstBallHit) {
                  setGameState(prev => ({ ...prev, firstBallHit: other }));
                }
                PhysicsEngine.resolveCollision(ball, other, BALL_RADIUS);
              }
            }

            // Collision avec power-up
            if (ball.color === 'white' && powerUp.active && !powerUp.collecting) {
              if (PowerUpSystem.checkCollision(ball, powerUp, BALL_RADIUS)) {
                collectPowerUp();
              }
            }
          });

          if (pocketedThisTurn.length > 0) {
            setGameState(prev => ({
              ...prev,
              ballsPocketed: [...prev.ballsPocketed, ...pocketedThisTurn]
            }));
          }

          if (!anyMoving) {
            setGameState(prev => {
              const newState = { ...prev, isShooting: false };
              return processEndOfShot(newState, newBalls);
            });
          }

          return newBalls;
        });

        animationFrameRef.current = requestAnimationFrame(animate);
      };

      animationFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState.isShooting, pockets, canvasSize, powerUp, gameState.activeEffect]);

  // Animation de collecte du power-up
  useEffect(() => {
    if (powerUp.collecting) {
      const animateCollect = () => {
        setPowerUp(prev => {
          const newAnim = prev.collectAnimation - 0.05;
          if (newAnim <= 0) {
            return {
              active: null,
              x: null,
              y: null,
              collecting: false,
              collectAnimation: 1.0
            };
          }
          return { ...prev, collectAnimation: newAnim };
        });
      };

      const interval = setInterval(animateCollect, 16);
      return () => clearInterval(interval);
    }
  }, [powerUp.collecting]);

  // Nettoyer les effets expirés
  useEffect(() => {
    if (gameState.activeEffect) {
      const checkExpiry = setInterval(() => {
        const now = Date.now();
        if (now > gameState.activeEffect.endTime) {
          setGameState(prev => ({ ...prev, activeEffect: null }));
        }
      }, 100);

      return () => clearInterval(checkExpiry);
    }
  }, [gameState.activeEffect]);

  const collectPowerUp = () => {
    if (!powerUp.active) return;

    setPowerUp(prev => ({ ...prev, collecting: true }));

    // Appliquer l'effet du power-up
    const result = PowerUpSystem.applyEffect(
      powerUp.active.id,
      gameState,
      balls,
      pockets,
      BALL_RADIUS,
      TABLE_MARGIN,
      canvasSize.tableWidth,
      canvasSize.tableHeight
    );

    setGameState(result.gameState);
    setBalls(result.balls);
  };

  const processEndOfShot = (state, ballsArray) => {
    const { firstBallHit, ballsPocketed, phase, redsRemaining, currentPlayer, scores } = state;
    
    let newScores = [...scores];
    let newRedsRemaining = redsRemaining;
    let newPhase = phase;
    let faultInfo = { valid: true, reason: null, message: null };
    let switchPlayer = false;

    const whitePocketed = ballsPocketed.some(b => b.color === 'white');
    
    // Validation du coup
    const targetType = SnookerLogic.getTargetBallType(redsRemaining, phase);
    let validShot = SnookerLogic.validateShot(firstBallHit, targetType);

    // Joker override
    if (state.jokerActive && firstBallHit) {
      validShot = true;
    }

    if (whitePocketed) {
      faultInfo = {
        valid: false,
        reason: 'WHITE_POCKETED',
        message: 'La bille blanche a été empochée'
      };
      switchPlayer = true;
    } else if (!firstBallHit) {
      faultInfo = {
        valid: false,
        reason: 'NO_BALL_HIT',
        message: 'Aucune bille touchée'
      };
      switchPlayer = true;
    } else if (!validShot) {
      const expectedBall = targetType === 'red' ? 'une rouge' : 'une couleur';
      const hitBall = firstBallHit.color === 'red' ? 'une rouge' : 'une couleur';
      faultInfo = {
        valid: false,
        reason: 'WRONG_BALL_HIT',
        message: `Vous deviez toucher ${expectedBall}, vous avez touché ${hitBall}`
      };
      switchPlayer = true;
    } else {
      // Coup valide - calculer les points
      let pointMultiplier = 1;
      if (state.doublePoints) {
        pointMultiplier = 2;
      }

      ballsPocketed.forEach(ball => {
        if (ball.color === 'white') return;
        
        if (ball.color === 'red') {
          newScores[currentPlayer - 1] += BALL_POINTS.red * pointMultiplier;
          newRedsRemaining--;
        } else {
          newScores[currentPlayer - 1] += BALL_POINTS[ball.color] * pointMultiplier;
        }
      });

      // Logique d'alternance
      if (phase === 'red' && ballsPocketed.some(b => b.color === 'red')) {
        newPhase = 'color';
      } else if (phase === 'color' && ballsPocketed.some(b => b.color !== 'red' && b.color !== 'white')) {
        if (newRedsRemaining > 0) {
          newPhase = 'red';
        } else {
          newPhase = 'final-colors';
        }
      } else if (ballsPocketed.length === 0 || ballsPocketed.every(b => b.color === 'white')) {
        switchPlayer = true;
      }

      // Remettre les couleurs si des rouges restent
      if (newRedsRemaining > 0) {
        ballsArray.forEach(ball => {
          if (ball.pocketed && ball.color !== 'red' && ball.color !== 'white' && ball.originalX) {
            ball.pocketed = false;
            ball.pocketAnimation = 0;
            ball.x = ball.originalX;
            ball.y = ball.originalY;
          }
        });
      }

      // Spawn nouveau power-up après bille empochée
      if (ballsPocketed.length > 0 && ballsPocketed.some(b => b.color !== 'white')) {
        setTimeout(() => spawnPowerUp(), 500);
      }
    }

    // Free shot
    if (state.freeShot) {
      switchPlayer = false;
    }

    // Replacer la blanche si empochée
    if (whitePocketed) {
      const whiteBall = ballsArray.find(b => b.color === 'white');
      if (whiteBall) {
        whiteBall.x = TABLE_MARGIN + canvasSize.tableWidth * 0.25;
        whiteBall.y = TABLE_MARGIN + canvasSize.tableHeight * 0.5;
        whiteBall.pocketed = false;
        whiteBall.pocketAnimation = 0;
      }
    }

    return {
      ...state,
      scores: newScores,
      redsRemaining: newRedsRemaining,
      phase: newPhase,
      currentPlayer: switchPlayer ? (currentPlayer === 1 ? 2 : 1) : currentPlayer,
      firstBallHit: null,
      ballsPocketed: [],
      faultInfo: faultInfo,
      // Reset power-up effects one-shot
      freeShot: false,
      jokerActive: false,
      doublePoints: false,
      visionActive: false
    };
  };

  // Gestion souris
  const handleMouseDown = (e) => {
    if (gameState.isShooting) return;

    const canvas = e.target;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvasSize.width / rect.width);
    const y = (e.clientY - rect.top) * (canvasSize.height / rect.height);

    const whiteBall = balls.find(b => b.color === 'white');
    if (!whiteBall || whiteBall.pocketed) return;

    const dx = x - whiteBall.x;
    const dy = y - whiteBall.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < BALL_RADIUS * 3) {
      mouseDownPos.current = { x, y };
      setGameState(prev => ({ ...prev, isAiming: true }));
    }
  };

  const handleMouseMove = (e) => {
    if (!gameState.isAiming || !mouseDownPos.current) return;

    const canvas = e.target;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvasSize.width / rect.width);
    const y = (e.clientY - rect.top) * (canvasSize.height / rect.height);

    const whiteBall = balls.find(b => b.color === 'white');
    if (!whiteBall) return;

    const dx = x - whiteBall.x;
    const dy = y - whiteBall.y;
    const angle = Math.atan2(dy, dx);
    const power = Math.min(Math.sqrt(dx * dx + dy * dy) / 100, 1.5);

    setGameState(prev => ({
      ...prev,
      aimAngle: angle,
      aimPower: power
    }));
  };

  const handleMouseUp = () => {
    if (!gameState.isAiming) return;

    const { aimAngle, aimPower } = gameState;
    
    setBalls(prevBalls => {
      const newBalls = [...prevBalls];
      const whiteBall = newBalls.find(b => b.color === 'white');
      
      if (whiteBall && aimPower > 0.1) {
        const speed = aimPower * 10;
        whiteBall.vx = -Math.cos(aimAngle) * speed;
        whiteBall.vy = -Math.sin(aimAngle) * speed;
      }
      
      return newBalls;
    });

    setGameState(prev => ({
      ...prev,
      isAiming: false,
      isShooting: aimPower > 0.1,
      aimPower: 0
    }));

    mouseDownPos.current = null;
  };

  const handleNewGame = () => {
    setBalls(SnookerLogic.initializeBalls(
      canvasSize.tableWidth,
      canvasSize.tableHeight,
      TABLE_MARGIN,
      BALL_RADIUS
    ));
    setGameState({
      currentPlayer: 1,
      scores: [0, 0],
      phase: 'red',
      redsRemaining: 15,
      isAiming: false,
      isShooting: false,
      aimAngle: 0,
      aimPower: 0,
      firstBallHit: null,
      ballsPocketed: [],
      faultInfo: null,
      freeShot: false,
      jokerActive: false,
      doublePoints: false,
      visionActive: false,
      activeEffect: null
    });
    spawnPowerUp();
  };

  const targetType = SnookerLogic.getTargetBallType(gameState.redsRemaining, gameState.phase);
  const targetText = targetType === 'red' ? 'Rouge' : 
                     targetType === 'color' ? 'Couleur' : 
                     'Couleurs (ordre)';

  return (
    <Box sx={{ p: 2, height: '100vh', overflow: 'auto', background:'#0f6323' }}>
      <Typography variant="h3" gutterBottom sx={{ textAlign: 'center', mb: 2 }}>
        🎱 Snooker Funky
      </Typography>

      <Stack direction="row" spacing={2} sx={{ height: 'calc(100% - 80px)' }}>
        {/* Panels Joueurs */}
        <Stack spacing={2} sx={{ width: 200, flexShrink: 0 }}>
          <PlayerPanel
            playerNumber={1}
            score={gameState.scores[0]}
            isActive={gameState.currentPlayer === 1}
            emoji="😎"
          />
          <PlayerPanel
            playerNumber={2}
            score={gameState.scores[1]}
            isActive={gameState.currentPlayer === 2}
            emoji="🤓"
          />
           <GameInfo
              targetText={targetText}
              redsRemaining={gameState.redsRemaining}
              faultInfo={gameState.faultInfo}
              activePowerUp={gameState.activeEffect ? 
                POWER_UP_TYPES[gameState.activeEffect.type] : null}
            />

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button 
                variant="contained" 
                onClick={handleNewGame}
                startIcon={<SportsCricketIcon />}
                size="small"
              >
                Nouvelle partie
              </Button>
            </Box>
        </Stack>

        {/* Zone de jeu */}
        <Box ref={containerRef} sx={{ flex: 1, overflow: 'auto' }}>
          <Stack spacing={2}>
           

            <GameCanvas
              canvasSize={canvasSize}
              balls={balls}
              pockets={pockets}
              powerUp={powerUp}
              gameState={gameState}
              tableMargin={TABLE_MARGIN}
              ballRadius={BALL_RADIUS}
              pocketRadius={POCKET_RADIUS}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}