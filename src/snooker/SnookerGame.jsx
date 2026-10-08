import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';
import { PhysicsEngine, SnookerLogic } from './Physics';
import { PowerUpSystem, POWER_UP_TYPES } from './PowerUpSystem';
import { COLOR_ORDER, getTarget, resolveShot } from './Rules';
import GameCanvas from './GameCanvas';
import PlayerPanel from './PlayerPanel';
import GameInfo from './GameInfo';
import TurnBanner from './TurnBanner';

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

// Effet sur la blanche (SHIFT pendant la visée)
const SPIN_TRANSFER = 0.65;     // part de la vitesse d'avant le choc rendue par l'effet
const SPIN_DECAY = 0.993;       // l'effet s'use en roulant
const SPIN_ROLL = 0.003;        // avant le choc : le coulé roule plus loin, le rétro freine
const SPIN_SENSITIVITY = 80;    // pixels de souris pour passer de 0 à l'effet max
const SIDE_SPIN = {
  transfer: 0.5,                // déviation sur la bande, en part de la vitesse d'impact
  cushionLoss: 0.6              // part de l'effet latéral qui survit à chaque bande
};
// Le point de frappe reste dans la bille : (side, spin) borné au disque unité
const clampHit = (side, spin) => {
  const d = Math.hypot(side, spin);
  return d > 1 ? { side: side / d, spin: spin / d } : { side, spin };
};

const PLAYERS = [
  { emoji: '😎', color: '#FF9800' },
  { emoji: '🤓', color: '#29B6F6' }
];

const INITIAL_GAME_STATE = {
  currentPlayer: 1,
  scores: [0, 0],
  phase: 'red',
  redsRemaining: 15,
  isAiming: false,
  isShooting: false,
  aimAngle: 0,
  aimPower: 0,
  spin: 0,          // -1 rétro … +1 coulé
  side: 0,          // -1 gauche … +1 droite
  spinMode: false,  // SHIFT enfoncé : la souris règle l'effet, la visée est gelée
  lastShot: null, // { severity, text } — résumé du dernier coup
  gameOver: false,
  // Power-ups
  freeShot: false,
  jokerActive: false,
  doublePoints: false,
  visionActive: false,
  activeEffect: null // { type, endTime, ... }
};

const newShot = () => ({ firstHit: null, pocketed: [], visionCollected: false });

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

  const [gameState, setGameState] = useState(INITIAL_GAME_STATE);

  const [powerUp, setPowerUp] = useState({
    active: null,
    x: null,
    y: null,
    collecting: false,
    collectAnimation: 1.0
  });

  const mouseDownPos = useRef(null);
  const lastMouseRef = useRef(null);
  // Déplacement de souris fait sous SHIFT, retiré de la visée pour qu'elle ne saute pas au relâchement
  const aimOffsetRef = useRef({ x: 0, y: 0 });

  // Refs lues par la boucle d'animation : toujours à jour, contrairement aux closures
  const ballsRef = useRef(balls);
  const gameStateRef = useRef(gameState);
  const powerUpRef = useRef(powerUp);
  const shotRef = useRef(newShot());
  ballsRef.current = balls;
  gameStateRef.current = gameState;
  powerUpRef.current = powerUp;

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

  // SHIFT : mode réglage de l'effet (pour l'affichage de la jauge)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Shift') return;
      const down = e.type === 'keydown';
      setGameState(prev => (prev.spinMode === down ? prev : { ...prev, spinMode: down }));
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKey);
    };
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
      ballsRef.current,
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
    if (!gameState.isShooting) return;

    let frame;
    const animate = () => {
      const newBalls = ballsRef.current;
      const { activeEffect } = gameStateRef.current;

      // Appliquer les effets actifs (aimant, etc.)
      PowerUpSystem.applyActiveEffects(newBalls, pockets, gameStateRef.current, BALL_RADIUS);

      // Friction dynamique selon les effets
      let friction = BASE_FRICTION;
      if (activeEffect?.type === 'SUPER_SLIP') {
        friction = activeEffect.frictionMultiplier;
      }

      // Vitesse dynamique selon les effets
      let speedMultiplier = 1;
      if (activeEffect?.type === 'SLOW_MOTION') {
        speedMultiplier = activeEffect.speedMultiplier;
      }

      newBalls.forEach((ball, i) => {
        if (ball.pocketed) return;

        // Mise à jour avec friction et vitesse modifiées
        const ballFriction = ball.spin ? Math.min(friction + ball.spin * SPIN_ROLL, 0.998) : friction;
        ball.x += ball.vx * speedMultiplier;
        ball.y += ball.vy * speedMultiplier;
        ball.vx *= ballFriction;
        ball.vy *= ballFriction;
        if (ball.spin) ball.spin *= SPIN_DECAY;
        if (ball.side) ball.side *= SPIN_DECAY;

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
          BALL_RADIUS,
          SIDE_SPIN
        );

        if (PhysicsEngine.checkPocket(ball, pockets, POCKET_RADIUS)) {
          ball.pocketed = true;
          ball.pocketAnimation = 1.0;
          ball.vx = 0;
          ball.vy = 0;
          shotRef.current.pocketed.push(ball);
          return;
        }

        // Collisions inter-billes
        for (let j = i + 1; j < newBalls.length; j++) {
          const other = newBalls[j];
          if (!other.pocketed && PhysicsEngine.checkCollision(ball, other, BALL_RADIUS)) {
            if (!shotRef.current.firstHit) {
              if (ball.color === 'white') shotRef.current.firstHit = other;
              else if (other.color === 'white') shotRef.current.firstHit = ball;
            }
            const spinner = ball.spin ? ball : other.spin ? other : null;
            const vBefore = spinner && { vx: spinner.vx, vy: spinner.vy };
            if (PhysicsEngine.resolveCollision(ball, other, BALL_RADIUS) && spinner) {
              PhysicsEngine.applySpin(spinner, vBefore.vx, vBefore.vy, SPIN_TRANSFER);
            }
          }
        }

        // Collision avec power-up
        const pu = powerUpRef.current;
        if (ball.color === 'white' && pu.active && !pu.collecting) {
          if (PowerUpSystem.checkCollision(ball, pu, BALL_RADIUS)) {
            collectPowerUp();
          }
        }
      });

      setBalls([...newBalls]);

      // Testé après toutes les collisions : une bille mise en mouvement en fin de boucle compte aussi
      const anyMoving = newBalls.some(b => !b.pocketed && (b.vx !== 0 || b.vy !== 0));
      if (anyMoving) {
        frame = requestAnimationFrame(animate);
      } else {
        endShot();
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [gameState.isShooting, pockets, canvasSize]);

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
    const current = powerUpRef.current;
    if (!current.active || current.collecting) return;

    // Marqué tout de suite pour ne pas le ramasser deux fois avant le prochain rendu
    powerUpRef.current = { ...current, collecting: true };
    setPowerUp(prev => ({ ...prev, collecting: true }));
    if (current.active.id === 'VISION') shotRef.current.visionCollected = true;

    // Les effets sur les billes sont appliqués en place sur ballsRef
    const { gameState: fx } = PowerUpSystem.applyEffect(
      current.active.id,
      gameStateRef.current,
      ballsRef.current,
      pockets,
      BALL_RADIUS,
      TABLE_MARGIN,
      canvasSize.tableWidth,
      canvasSize.tableHeight
    );

    // On ne fusionne que les champs des power-ups, sans écraser le reste de l'état
    const { scores, freeShot, jokerActive, doublePoints, visionActive, activeEffect } = fx;
    setGameState(prev => ({ ...prev, scores, freeShot, jokerActive, doublePoints, visionActive, activeEffect }));
  };

  // Remet une bille sur la table : son spot, sinon le plus haut spot libre, sinon glisse vers la gauche
  const respotBall = (ball, allBalls) => {
    const isFree = (x, y) => allBalls.every(o =>
      o === ball || o.pocketed || Math.hypot(o.x - x, o.y - y) >= BALL_RADIUS * 2
    );

    const spots = ball.color === 'white'
      ? [{ x: TABLE_MARGIN + canvasSize.tableWidth * 0.25, y: TABLE_MARGIN + canvasSize.tableHeight * 0.5 }]
      : [ball, ...[...COLOR_ORDER].reverse().map(c => allBalls.find(b => b.color === c))]
          .map(b => ({ x: b.originalX, y: b.originalY }));

    let spot = spots.find(s => isFree(s.x, s.y));
    if (!spot) {
      let x = spots[0].x;
      while (x > TABLE_MARGIN + BALL_RADIUS && !isFree(x, spots[0].y)) x -= 2;
      spot = { x, y: spots[0].y };
    }

    Object.assign(ball, { x: spot.x, y: spot.y, vx: 0, vy: 0, spin: 0, side: 0, pocketed: false, pocketAnimation: 0 });
  };

  const endShot = () => {
    const shot = shotRef.current;
    const allBalls = ballsRef.current;
    const state = gameStateRef.current;

    const colorsBefore = allBalls
      .filter(b => COLOR_ORDER.includes(b.color) && (!b.pocketed || shot.pocketed.includes(b)))
      .map(b => b.color);

    const result = resolveShot({
      state,
      firstHit: shot.firstHit?.color ?? null,
      potted: shot.pocketed.map(b => b.color),
      colorsBefore,
      redsLeft: allBalls.filter(b => b.color === 'red' && !b.pocketed).length
    });

    result.respot.forEach(color => respotBall(allBalls.find(b => b.color === color), allBalls));
    if (result.whiteRespot) respotBall(allBalls.find(b => b.color === 'white'), allBalls);
    setBalls([...allBalls]);

    // Spawn nouveau power-up après une bille empochée réglementairement
    if (result.legalPot && !result.gameOver) {
      setTimeout(() => spawnPowerUp(), 500);
    }

    setGameState(prev => ({
      ...prev,
      isShooting: false,
      scores: result.scores,
      phase: result.phase,
      redsRemaining: result.redsRemaining,
      currentPlayer: result.currentPlayer,
      lastShot: result.summary,
      gameOver: result.gameOver,
      // Reset power-up effects one-shot (la Vision ramassée sert au coup suivant)
      freeShot: false,
      jokerActive: false,
      doublePoints: false,
      visionActive: shot.visionCollected
    }));
  };

  // Gestion souris
  const handleMouseDown = (e) => {
    if (gameState.isShooting || gameState.gameOver) return;

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
      lastMouseRef.current = { x, y };
      aimOffsetRef.current = { x: 0, y: 0 };
      setGameState(prev => ({ ...prev, isAiming: true }));
    }
  };

  const handleMouseMove = (e) => {
    if (!gameState.isAiming || !mouseDownPos.current) return;

    const canvas = e.target;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvasSize.width / rect.width);
    const y = (e.clientY - rect.top) * (canvasSize.height / rect.height);

    const last = lastMouseRef.current;
    lastMouseRef.current = { x, y };

    // SHIFT : visée gelée, haut = coulé, bas = rétro, gauche/droite = effet latéral
    if (e.shiftKey) {
      aimOffsetRef.current.x += x - last.x;
      aimOffsetRef.current.y += y - last.y;
      const dSide = (x - last.x) / SPIN_SENSITIVITY;
      const dSpin = -(y - last.y) / SPIN_SENSITIVITY;
      setGameState(prev => ({ ...prev, ...clampHit(prev.side + dSide, prev.spin + dSpin) }));
      return;
    }

    const whiteBall = balls.find(b => b.color === 'white');
    if (!whiteBall) return;

    const dx = x - aimOffsetRef.current.x - whiteBall.x;
    const dy = y - aimOffsetRef.current.y - whiteBall.y;
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

    const { aimAngle, aimPower, spin, side } = gameState;
    const shoot = aimPower > 0.1;

    if (shoot) {
      const whiteBall = ballsRef.current.find(b => b.color === 'white');
      const speed = aimPower * 10;
      whiteBall.vx = -Math.cos(aimAngle) * speed;
      whiteBall.vy = -Math.sin(aimAngle) * speed;
      whiteBall.spin = spin;
      whiteBall.side = side;
      shotRef.current = newShot();
    }

    setGameState(prev => ({
      ...prev,
      isAiming: false,
      isShooting: shoot,
      aimPower: 0,
      spin: shoot ? 0 : prev.spin,
      side: shoot ? 0 : prev.side
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
    setGameState(INITIAL_GAME_STATE);
    spawnPowerUp();
  };

  const colorsOnTable = balls.filter(b => COLOR_ORDER.includes(b.color) && !b.pocketed).map(b => b.color);
  const target = getTarget(gameState.phase, colorsOnTable);
  const player = PLAYERS[gameState.currentPlayer - 1];

  return (
    <Box sx={{ p: 2, height: '100vh', overflow: 'auto', background:'#0f6323' }}>
      <Typography variant="h3" gutterBottom sx={{ textAlign: 'center', mb: 2 }}>
        🎱 Snooker Funky
      </Typography>

      <Stack direction="row" spacing={2} sx={{ height: 'calc(100% - 80px)' }}>
        {/* Panels Joueurs */}
        <Stack spacing={2} sx={{ width: 200, flexShrink: 0 }}>
          {PLAYERS.map((p, i) => (
            <PlayerPanel
              key={i}
              playerNumber={i + 1}
              score={gameState.scores[i]}
              isActive={!gameState.gameOver && gameState.currentPlayer === i + 1}
              emoji={p.emoji}
              color={p.color}
            />
          ))}
           <GameInfo
              redsRemaining={gameState.redsRemaining}
              lastShot={gameState.lastShot}
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
            <TurnBanner
              playerNumber={gameState.currentPlayer}
              emoji={player.emoji}
              color={player.color}
              target={target}
              gameOver={gameState.gameOver}
              lastShot={gameState.lastShot}
            />

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
