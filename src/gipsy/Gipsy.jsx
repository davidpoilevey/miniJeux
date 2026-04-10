import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import GrassIcon from '@mui/icons-material/Grass';
import useMazeGenerator, { findSpawnInViewport } from './mazeGenerator';
import { GameOver } from '../ChuckNorrisFact';
import { soundManager } from '../rpg/sons/SoundManager';
import sonMarcher from './marcher.mp3';
import sonSurleau from './surleau.mp3';
import sonExplo from './explosion.mp3';
import sonExplo8bit from './explo8bit.mp3';
import sonLevelUp from './levelup.mp3';
import sonSplash from './splash.mp3';

const CELL_SIZE = 40;
const VIEWPORT_COLS = 15;
const VIEWPORT_ROWS = 12;
const MAP_MULTIPLIER = 3;
const MAX_VIES = 5;
const MAP_COLS = VIEWPORT_COLS * MAP_MULTIPLIER;
const MAP_ROWS = VIEWPORT_ROWS * MAP_MULTIPLIER;

const DIRECTION = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 }
};

const GipsyGame = () => {
  const { generateMaze, TILE_TYPES } = useMazeGenerator(MAP_COLS, MAP_ROWS);
const [levelStartTime, setLevelStartTime] = useState(Date.now());
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [vies, setVies] = useState(MAX_VIES);
  const [isGameOver, setGameOver] = useState(false);
  const [gameState, setGameState] = useState('playing'); // 'playing', 'won', 'dead'
  const [map, setMap] = useState([]);
  const [spiderPos, setSpiderPos] = useState({ x: 0, y: 0 });
  const [viewportOffset, setViewportOffset] = useState({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = useState(false);
  const [grassCollected, setGrassCollected] = useState(0);
  const [showMinimap, setShowMinimap] = useState(true);
  const [splatPosition, setSplatPosition] = useState(null); // Position du splat
  const [showSplatAnimation, setShowSplatAnimation] = useState(false);
  const [enemies, setEnemies] = useState([]); // Liste des ennemis
  const [inventory, setInventory] = useState({
    missile: false,
    canoe: false,
    dynamite: 0 // Nombre de dynamites
  });

  const keysPressed = useRef(new Set());
  const lastMoveTime = useRef(0);
  const mapMoveInterval = useRef(null);

  // Initialiser le niveau
  const initLevel = useCallback(() => {
    const { map: newMap, startX, startY, enemies: newEnemies } = generateMaze(level);
    setMap(newMap);
    setLevelStartTime(Date.now());
    setSpiderPos({ x: startX, y: startY });
    setViewportOffset({ x: 0, y: 0 });
    setGameState('playing');
    setIsMoving(false);
    setGrassCollected(0);
    setEnemies(newEnemies);
    setInventory({ missile: false, canoe: false, dynamite: 0 });
  }, [generateMaze, level]);

  //init
  useEffect(() => {
   soundManager.loadSounds({marcher:sonMarcher, surLeau:sonSurleau
    , explo:sonExplo, explo8: sonExplo8bit, splash:sonSplash, levelup:sonLevelUp
   })
  }, []);
  useEffect(() => {
    initLevel();
  }, [initLevel]);

  // Mouvement des ennemis
  useEffect(() => {
    if (gameState !== 'playing' || enemies.length === 0) return;

    const enemyMoveInterval = setInterval(() => {
      setEnemies(prevEnemies => {
        return prevEnemies.map(enemy => {
          let newX = enemy.x;
          let newY = enemy.y;
          let newDirection = enemy.direction;

          if (enemy.axis === 'x') {
            // Déplacement horizontal
            newX = enemy.x + enemy.direction;

            // Vérifier collision avec mur ou bord
            if (newX < 0 || newX >= MAP_COLS ||
              (map[enemy.y] && map[enemy.y][newX] === TILE_TYPES.WALL)) {
              newDirection = -enemy.direction; // Inverser direction
              newX = enemy.x; // Ne pas bouger ce tour-ci
            }
          } else {
            // Déplacement vertical
            newY = enemy.y + enemy.direction;

            // Vérifier collision avec mur ou bord
            if (newY < 0 || newY >= MAP_ROWS ||
              (map[newY] && map[newY][enemy.x] === TILE_TYPES.WALL)) {
              newDirection = -enemy.direction; // Inverser direction
              newY = enemy.y; // Ne pas bouger ce tour-ci
            }
          }

          return {
            ...enemy,
            x: newX,
            y: newY,
            direction: newDirection
          };
        });
      });
    }, 400); // Vitesse de déplacement des ennemis

    return () => clearInterval(enemyMoveInterval);
  }, [gameState, enemies.length, map]);

  // Direction actuelle du balayage
  const currentDirection = useRef(null);

  // Choisir une nouvelle direction aléatoire

const pickNewDirection = useCallback(() => {
  const elapsed = (Date.now() - levelStartTime) / 1000; // en secondes
  const exitX = MAP_COLS - Math.floor(MAP_COLS / 6);
  const exitY = MAP_ROWS - Math.floor(MAP_ROWS / 6);
  
  // Calculer la direction vers la sortie
  const toExitX = exitX - viewportOffset.x;
  const toExitY = exitY - viewportOffset.y;
  
  let directions = [DIRECTION.UP, DIRECTION.DOWN, DIRECTION.LEFT, DIRECTION.RIGHT];
  
  // Après 45 secondes : favoriser la direction vers la sortie (70% de chance)
  if (elapsed > 30 && Math.random() < 0.7) {
    if (Math.abs(toExitX) > Math.abs(toExitY)) {
      currentDirection.current = toExitX > 0 ? DIRECTION.RIGHT : DIRECTION.LEFT;
    } else {
      currentDirection.current = toExitY > 0 ? DIRECTION.DOWN : DIRECTION.UP;
    }
    return;
  }
  
  // Après 1m30 : forcer vers la sortie (95% de chance)
  if (elapsed > 60 && Math.random() < 0.95) {
    if (Math.abs(toExitX) > Math.abs(toExitY)) {
      currentDirection.current = toExitX > 0 ? DIRECTION.RIGHT : DIRECTION.LEFT;
    } else {
      currentDirection.current = toExitY > 0 ? DIRECTION.DOWN : DIRECTION.UP;
    }
    return;
  }
  
  // Sinon : comportement normal
  const validDirections = directions.filter(dir => {
    if (!currentDirection.current) return true;
    if (dir.x === -currentDirection.current.x && dir.y === -currentDirection.current.y) {
      return Math.random() > 0.7;
    }
    return true;
  });
  
  currentDirection.current = validDirections[Math.floor(Math.random() * validDirections.length)];
}, [levelStartTime, viewportOffset]);

  // Mouvement automatique de la map avec balayage
  useEffect(() => {
    if (gameState !== 'playing') return;

    // Initialiser la direction si nécessaire
    if (!currentDirection.current) {
      pickNewDirection();
    }

    const moveSpeed = Math.max(820 - (level * 10), 260); // Plus rapide avec les niveaux

    mapMoveInterval.current = setInterval(() => {
      setViewportOffset(prev => {
        let newX = prev.x + currentDirection.current.x;
        let newY = prev.y + currentDirection.current.y;

        // Vérifier si on atteint les limites
        const maxX = MAP_COLS - VIEWPORT_COLS;
        const maxY = MAP_ROWS - VIEWPORT_ROWS;

        let hitBoundary = false;

        if (newX < 0) {
          newX = 0;
          hitBoundary = true;
        } else if (newX > maxX) {
          newX = maxX;
          hitBoundary = true;
        }

        if (newY < 0) {
          newY = 0;
          hitBoundary = true;
        } else if (newY > maxY) {
          newY = maxY;
          hitBoundary = true;
        }

        // Changer de direction si on atteint une limite
        // OU petite chance de bifurquer avant (10% de chance si on a fait au moins 50% du chemin)
        const progressX = currentDirection.current.x !== 0 ? Math.abs(prev.x - (currentDirection.current.x > 0 ? 0 : maxX)) / maxX : 0;
        const progressY = currentDirection.current.y !== 0 ? Math.abs(prev.y - (currentDirection.current.y > 0 ? 0 : maxY)) / maxY : 0;
        const progress = Math.max(progressX, progressY);

        const shouldBifurcate = progress > 0.2 && Math.random() < 0.15; // 3% de chance par frame si > 50% du chemin

        if (hitBoundary || shouldBifurcate) {
          pickNewDirection();
        }

        return { x: newX, y: newY };
      });
    }, moveSpeed);

    return () => {
      if (mapMoveInterval.current) {
        clearInterval(mapMoveInterval.current);
      }
    };
  }, [gameState, level, pickNewDirection]);

  // Vérifier collision avec les bords du viewport
  useEffect(() => {
    if (gameState !== 'playing') return;

    const spiderViewX = spiderPos.x - viewportOffset.x;
    const spiderViewY = spiderPos.y - viewportOffset.y;

    const currentTile = map[spiderPos.y] && map[spiderPos.y][spiderPos.x];

    // Vérifier collision avec ennemi
    const hitEnemy = enemies.find(e => e.x === spiderPos.x && e.y === spiderPos.y);
    if (hitEnemy) {
      setSplatPosition({ x: spiderPos.x, y: spiderPos.y });
      setShowSplatAnimation(true);
      soundManager.play('splash');
      setGameState('dead');
      if (mapMoveInterval.current) {
        clearInterval(mapMoveInterval.current);
      }
      return;
    }

    // Vérifier si l'araignée est écrasée contre un mur au bord du viewport
    const crushedAgainstEdge = spiderViewX < 0 || spiderViewX >= VIEWPORT_COLS ||
      spiderViewY < 0 || spiderViewY >= VIEWPORT_ROWS;

    // Vérifier collision mortelle (mur ou eau sans canoë)
    const hitWall = currentTile === TILE_TYPES.WALL;
    const hitWater = currentTile === TILE_TYPES.WATER && !inventory.canoe;

    if (crushedAgainstEdge || hitWall || hitWater) {
      // SPLAT!
      setSplatPosition({ x: spiderPos.x, y: spiderPos.y });
      setShowSplatAnimation(true);
      soundManager.play('splash');
      setGameState('dead');
      if (mapMoveInterval.current) {
        clearInterval(mapMoveInterval.current);
      }
      return;
    }

    // Traverser l'eau avec le canoë (consommer le bonus) non on le garde
    // if (currentTile === TILE_TYPES.WATER && inventory.canoe) {
    //   setInventory(prev => ({ ...prev, canoe: false }));
    //}

    // Collecter l'herbe
    if (currentTile === TILE_TYPES.GRASS) {
      setMap(prevMap => {
        const newMap = prevMap.map(row => [...row]);
        newMap[spiderPos.y][spiderPos.x] = TILE_TYPES.EMPTY;
        return newMap;
      });
      setScore(prev => prev + 10);
      setGrassCollected(prev => prev + 1);
    }

    // Collecter la bourse
    if (currentTile === TILE_TYPES.PURSE) {
      setMap(prevMap => {
        const newMap = prevMap.map(row => [...row]);
        newMap[spiderPos.y][spiderPos.x] = TILE_TYPES.EMPTY;
        return newMap;
      });
      setScore(prev => prev + 50);
    }

    // Collecter le missile
    if (currentTile === TILE_TYPES.MISSILE) {
      setMap(prevMap => {
        const newMap = prevMap.map(row => [...row]);
        newMap[spiderPos.y][spiderPos.x] = TILE_TYPES.EMPTY;
        return newMap;
      });
      setInventory(prev => ({ ...prev, missile: true }));
    }

    // Collecter le canoë
    if (currentTile === TILE_TYPES.CANOE) {
      setMap(prevMap => {
        const newMap = prevMap.map(row => [...row]);
        newMap[spiderPos.y][spiderPos.x] = TILE_TYPES.EMPTY;
        return newMap;
      });
      setInventory(prev => ({ ...prev, canoe: true }));
    }

    // Collecter la dynamite
    if (currentTile === TILE_TYPES.DYNAMITE) {
      setMap(prevMap => {
        const newMap = prevMap.map(row => [...row]);
        newMap[spiderPos.y][spiderPos.x] = TILE_TYPES.EMPTY;
        return newMap;
      });
      setInventory(prev => ({ ...prev, dynamite: prev.dynamite + 1 }));
    }

    // Collecter les flèches directionnelles
    if (currentTile >= TILE_TYPES.ARROW_UP && currentTile <= TILE_TYPES.ARROW_RIGHT) {
      setMap(prevMap => {
        const newMap = prevMap.map(row => [...row]);
        newMap[spiderPos.y][spiderPos.x] = TILE_TYPES.EMPTY;
        return newMap;
      });

      // Forcer le changement de direction
      if (currentTile === TILE_TYPES.ARROW_UP) {
        currentDirection.current = DIRECTION.UP;
      } else if (currentTile === TILE_TYPES.ARROW_DOWN) {
        currentDirection.current = DIRECTION.DOWN;
      } else if (currentTile === TILE_TYPES.ARROW_LEFT) {
        currentDirection.current = DIRECTION.LEFT;
      } else if (currentTile === TILE_TYPES.ARROW_RIGHT) {
        currentDirection.current = DIRECTION.RIGHT;
      }
    }

    // Vérifier si l'araignée atteint la sortie
    if (currentTile === TILE_TYPES.EXIT) {
      setGameState('won');
      
soundManager.play('levelup');
      setScore(prev => prev + (level * 100) + (grassCollected * 5));
      if (mapMoveInterval.current) {
        clearInterval(mapMoveInterval.current);
      }
    }
  }, [spiderPos, viewportOffset, gameState, map, level, grassCollected, TILE_TYPES, inventory, enemies]);

  // Gestion du clavier
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
        e.preventDefault();
        keysPressed.current.add(e.key.toLowerCase());
      }

      // Barre d'espace pour dynamite
      if (e.key === ' ' && gameState === 'playing' && inventory.dynamite > 0) {
        e.preventDefault();

soundManager.play('explo');
        // Explosion 3x3
        setMap(prevMap => {
          const newMap = prevMap.map(row => [...row]);
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const explX = spiderPos.x + dx;
              const explY = spiderPos.y + dy;
              if (explX >= 0 && explX < MAP_COLS && explY >= 0 && explY < MAP_ROWS) {
                const tile = newMap[explY][explX];
                // Détruire murs et ennemis (pas l'eau ni la sortie)
                if (tile === TILE_TYPES.WALL) {
                  newMap[explY][explX] = TILE_TYPES.EMPTY;
                }
              }
            }
          }
          return newMap;
        });

        // Détruire les ennemis dans la zone
        setEnemies(prevEnemies =>
          prevEnemies.filter(enemy => {
            const dist = Math.abs(enemy.x - spiderPos.x) + Math.abs(enemy.y - spiderPos.y);
            return dist > 2; // Manhattan distance > 2 = hors de la zone 3x3
          })
        );

        setInventory(prev => ({ ...prev, dynamite: prev.dynamite - 1 }));
      }
    };

    const handleKeyUp = (e) => {
      keysPressed.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, inventory.dynamite, spiderPos]);

  // Boucle de déplacement de l'araignée
  useEffect(() => {
    if (gameState !== 'playing') return;

    const moveInterval = setInterval(() => {
      const now = Date.now();
      if (isMoving || now - lastMoveTime.current < 150) return;

      let direction = null;

      if (keysPressed.current.has('arrowup') || keysPressed.current.has('w')) {
        direction = DIRECTION.UP;
      } else if (keysPressed.current.has('arrowdown') || keysPressed.current.has('s')) {
        direction = DIRECTION.DOWN;
      } else if (keysPressed.current.has('arrowleft') || keysPressed.current.has('a')) {
        direction = DIRECTION.LEFT;
      } else if (keysPressed.current.has('arrowright') || keysPressed.current.has('d')) {
        direction = DIRECTION.RIGHT;
      }

      if (direction) {
        const newX = spiderPos.x + direction.x;
        const newY = spiderPos.y + direction.y;
        // Vérifier les limites de la map
        if (newX >= 0 && newX < MAP_COLS && newY >= 0 && newY < MAP_ROWS) {
          const targetTile = map[newY] && map[newY][newX];

          // Si on a un missile et qu'on touche un mur, le détruire
          if (targetTile === TILE_TYPES.WALL && inventory.missile) {

soundManager.play('explo8');
            setMap(prevMap => {
              const newMap = prevMap.map(row => [...row]);
              newMap[newY][newX] = TILE_TYPES.EMPTY;
              return newMap;
            });
            setInventory(prev => ({ ...prev, missile: false }));
            setIsMoving(true);
            setSpiderPos({ x: newX, y: newY });
            lastMoveTime.current = now;
            setTimeout(() => setIsMoving(false), 100);
            return;
          }

          // Autoriser le déplacement si :
          // - case vide, herbe, sortie, pont, ou bonus
          // - PAS mur (sauf avec missile ci-dessus)
          // - PAS eau (sauf avec canoë vérifié dans collision detection)
          const canMove = targetTile === TILE_TYPES.EMPTY ||
            targetTile === TILE_TYPES.GRASS ||
            targetTile === TILE_TYPES.EXIT ||
            targetTile === TILE_TYPES.BRIDGE ||
            targetTile === TILE_TYPES.PURSE ||
            targetTile === TILE_TYPES.MISSILE ||
            targetTile === TILE_TYPES.CANOE ||
            targetTile === TILE_TYPES.DYNAMITE ||
            (targetTile >= TILE_TYPES.ARROW_UP && targetTile <= TILE_TYPES.ARROW_RIGHT) ||
            (targetTile === TILE_TYPES.WATER && inventory.canoe);

          if (canMove) {
            setIsMoving(true);
if(targetTile === TILE_TYPES.BRIDGE)
soundManager.play('marcher');
if(targetTile === TILE_TYPES.WATER)
soundManager.play('surLeau');
            setSpiderPos({ x: newX, y: newY });
            lastMoveTime.current = now;
            setTimeout(() => setIsMoving(false), 100);
          }
        }
      }
    }, 50);

    return () => clearInterval(moveInterval);
  }, [gameState, spiderPos, isMoving, map, TILE_TYPES, inventory]);

 useEffect(() => {
  if (gameState === 'dead') {

    setTimeout(() => {
      if (vies > 0) {

       const spawn = findSpawnInViewport(
          map,
          viewportOffset,
          VIEWPORT_COLS,
          VIEWPORT_ROWS,
          [TILE_TYPES.EMPTY, TILE_TYPES.GRASS]
        );

        setVies(v => v - 1);
        setGameState('playing');

        if (spawn) {
          setSpiderPos(spawn);
        }

      }
      else setGameOver(true);
    }, 1500);

  }
}, [gameState]);

  const handleNextLevel = () => {
    setLevel(prev => prev + 1);
    setSplatPosition(null);
    setShowSplatAnimation(false);
    initLevel();
  };

  const handleRestart = () => {
    setLevel(1);
    setScore(0);
    setVies(MAX_VIES);
    setSplatPosition(null);
    setShowSplatAnimation(false);
    initLevel();
  };

  const renderCell = (tile, x, y) => {
    const isSpider = spiderPos.x === x && spiderPos.y === y && gameState === 'playing';
    const isSplatHere = splatPosition && splatPosition.x === x && splatPosition.y === y;
    const enemy = enemies.find(e => e.x === x && e.y === y);

    let bgcolor = '#d4e7a6';
    let content = null;
    let borderColor = '#99b87f';

    if (tile === TILE_TYPES.WALL) {
      bgcolor = '#555';
      content = '█';
    } else if (tile === TILE_TYPES.EXIT) {
      bgcolor = '#ffd700';
      content = '★';
    } else if (tile === TILE_TYPES.WATER) {
      bgcolor = '#1e90ff';
      content = '~';
    } else if (tile === TILE_TYPES.BRIDGE) {
      bgcolor = '#8B4513';
      content = '═';
      borderColor = '#654321';
    } else if (tile === TILE_TYPES.GRASS) {
      // bgcolor = '#2a2a2a';
      content = <GrassIcon sx={{ color: '#0d900d', fontSize: '20px' }} />;
    } else if (tile === TILE_TYPES.PURSE) {
      //bgcolor = '#2a2a2a';
      content = '💰';
    } else if (tile === TILE_TYPES.MISSILE) {
      //bgcolor = '#2a2a2a';
      content = '🚀';
    } else if (tile === TILE_TYPES.CANOE) {
      //bgcolor = '#2a2a2a';
      content = '🛶';
    } else if (tile === TILE_TYPES.DYNAMITE) {
      //bgcolor = '#2a2a2a';
      content = '🧨';
    } else if (tile === TILE_TYPES.ARROW_UP) {
      //bgcolor = '#2a2a2a';
      content = '⬆️';
    } else if (tile === TILE_TYPES.ARROW_DOWN) {
      // bgcolor = '#2a2a2a';
      content = '⬇️';
    } else if (tile === TILE_TYPES.ARROW_LEFT) {
      //bgcolor = '#2a2a2a';
      content = '⬅️';
    } else if (tile === TILE_TYPES.ARROW_RIGHT) {
      // bgcolor = '#2a2a2a';
      content = '➡️';
    }

    return (
      <Box
        key={`${x}-${y}`}
        sx={{
          width: CELL_SIZE,
          height: CELL_SIZE,
          bgcolor,
          border: `1px solid ${borderColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          fontWeight: 'bold',
          color: tile === TILE_TYPES.EXIT ? '#000' : tile === TILE_TYPES.WATER ? '#fff' : tile === TILE_TYPES.BRIDGE ? '#fff' : '#fff',
          position: 'relative',
          transition: 'all 0.1s ease-out'
        }}
      >
        {content}
        {enemy && (
          <Box
            sx={{
              position: 'absolute',
              fontSize: '28px',
              transition: 'all 0.1s ease-out',
              filter: 'drop-shadow(0 0 3px rgba(255,0,0,0.8))'
            }}
          >
            👾
          </Box>
        )}
        {isSpider && (
          <Box
            sx={{
              position: 'absolute',
              fontSize: '36px',
              transition: 'all 0.1s ease-out',
              filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.8))',
              zIndex: 10
            }}
          >
            🕷️
          </Box>
        )}
        {isSplatHere && (
          <Box
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: showSplatAnimation ? 'splatPulse 0.5s ease-out' : 'none',
              '@keyframes splatPulse': {
                '0%': {
                  transform: 'scale(0.5)',
                  opacity: 0
                },
                '50%': {
                  transform: 'scale(1.5)',
                  opacity: 1
                },
                '100%': {
                  transform: 'scale(1)',
                  opacity: 1
                }
              }
            }}
          >
            <Box
              sx={{
                fontSize: '40px',
                color: '#ff0000',
                textShadow: '0 0 10px #ff0000, 0 0 20px #ff0000',
                fontWeight: 'bold'
              }}
            >
              💥
            </Box>
          </Box>
        )}
      </Box>
    );
  };

  const renderMinimap = () => {
    const minimapCellSize = 4;

    return (
      <Box
        sx={{
          position: 'fixed',
          bottom: 20,
          left: 20,
          bgcolor: 'rgba(0,0,0,0.9)',
          border: '3px solid #666',
          borderRadius: 1,
          p: 1,
          zIndex: 1000
        }}
      >
        <Typography variant="caption" sx={{ color: '#fff', mb: 1, display: 'block', textAlign: 'center' }}>
          Mini-Map
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(${MAP_COLS}, ${minimapCellSize}px)`,
            gap: 0
          }}
        >
          {map.map((row, y) =>
            row.map((tile, x) => {
              const isSpiderHere = spiderPos.x === x && spiderPos.y === y;
              const isEnemyHere = enemies.find(e => e.x === x && e.y === y);
              const isInViewport =
                x >= viewportOffset.x &&
                x < viewportOffset.x + VIEWPORT_COLS &&
                y >= viewportOffset.y &&
                y < viewportOffset.y + VIEWPORT_ROWS;

              let color = '#1a1a1a';
              if (tile === TILE_TYPES.WALL) color = '#555';
              else if (tile === TILE_TYPES.EXIT) color = '#ffd700';
              else if (tile === TILE_TYPES.WATER) color = '#1e90ff';
              else if (tile === TILE_TYPES.BRIDGE) color = '#8B4513';
              else if (tile === TILE_TYPES.GRASS) color = '#90EE90';
              else if (tile === TILE_TYPES.PURSE || tile === TILE_TYPES.MISSILE ||
                tile === TILE_TYPES.CANOE || tile === TILE_TYPES.DYNAMITE ||
                (tile >= TILE_TYPES.ARROW_UP && tile <= TILE_TYPES.ARROW_RIGHT)) {
                color = '#ffff00'; // Jaune pour les bonus
              }

              if (isEnemyHere) color = '#ff00ff'; // Magenta pour les ennemis
              if (isSpiderHere) color = '#ff0000'; // Rouge pour l'araignée

              return (
                <Box
                  key={`mini-${x}-${y}`}
                  sx={{
                    width: minimapCellSize,
                    height: minimapCellSize,
                    bgcolor: color,
                    border: isInViewport ? '1px solid rgba(255,255,255,0.3)' : 'none',
                    opacity: isInViewport ? 1 : 0.6
                  }}
                />
              );
            })
          )}
        </Box>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setShowMinimap(false)}
          sx={{ mt: 1, width: '100%', color: '#fff', borderColor: '#666' }}
        >
          Fermer
        </Button>
      </Box>
    );
  };

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2,
      p: 3,
      bgcolor: '#18274c',
      minHeight: '100vh'
    }}>
      {showMinimap && renderMinimap()}
      <Box>

               <GameOver open={isGameOver} score={score} 
                    gameName="gipsy"
                        handleClose={()=>setGameOver(false) } handleRestart={handleRestart} />
        <Typography variant="h3" sx={{ color: '#fff', fontFamily: 'monospace' }}>
          🕷️ GIPSY l'araignée CPC464 🕷️
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setShowMinimap(!showMinimap)}
          sx={{ color: '#fff', marginLeft: 5, borderColor: '#666' }}
        >
          {showMinimap ? 'Cacher' : 'Afficher'} Mini-Map
        </Button>
      </Box>
      {gameState === 'won' && (
        <Box sx={{ textAlign: 'center', color: '#0f0', position: 'absolute', top: 150, zIndex: 3 }}>
          <Typography variant="h4" sx={{ mb: 2 }}>
            🎉 NIVEAU TERMINÉ ! 🎉
          </Typography>
          <Button
            variant="contained"
            color="success"
            size="large"
            onClick={handleNextLevel}
          >
            Niveau Suivant
          </Button>
        </Box>
      )}

      {gameState === 'dead' && (
        <Box sx={{ textAlign: 'center', color: '#f00', position: 'absolute', top: 150, zIndex: 3 }}>
          <Typography variant="h4" sx={{ mb: 2 }}>
            💀 SPLASH ! 💀
          </Typography>
          {vies==0&&<Button
            variant="contained"
            color="error"
            size="large"
            onClick={handleRestart}
          >
            Recommencer
          </Button>}
        </Box>
      )}
      <Box sx={{ display: 'flex' }}>

        <Box sx={{
          display: 'flex', flexDirection: 'column', gap: 4, flex: 1
          , color: '#fff', alignItems: 'center', flexWrap: 'wrap'
        }}>
          <Box sx={{display:'flex', alignItems:'baseline',gap:1}}>
           <Typography variant="h6">Niveau: </Typography>
          <Typography variant="h4" color={'secondary.light'}>{level}</Typography>
           </Box>
           <Box sx={{display:'flex',gap:2}}>
             {Array.from({ length: vies }, (_, i) => (
    <span key={i} style={{fontSize:24,background:'rgba(200,200,200,0.73)', borderRadius:6, p:1}}>🕷️</span>
  ))}
           </Box>
          <Box sx={{display:'flex', alignItems:'baseline',gap:1}}>
           <Typography variant="h6">Score: </Typography>
          <Typography variant="h4" color={'secondary.light'}>{score}</Typography>
           </Box>
          <Box sx={{display:'flex', alignItems:'baseline',gap:1}}>
           <Typography variant="h6">Herbe: </Typography>
          <Typography variant="h4" color={'secondary.light'}>{grassCollected} 🌱</Typography>
           </Box>
           
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', bgcolor: '#333', px: 2, py: 1, borderRadius: 1 }}>
            <Typography variant="body2">Inventaire:</Typography>
            {inventory.missile && <Typography variant="body1">🚀</Typography>}
            {inventory.canoe && <Typography variant="body1">🛶</Typography>}
            {inventory.dynamite > 0 && <Typography variant="body1">🧨 x{inventory.dynamite}</Typography>}
            {!inventory.missile && !inventory.canoe && inventory.dynamite === 0 && (
              <Typography variant="body2" sx={{ fontStyle: 'italic', opacity: 0.6 }}>vide</Typography>
            )}
          </Box>

        </Box>
        <Paper
          elevation={8}
          sx={{
            bgcolor: '#000',
            p: 1,
            border: '4px solid #666',
            position: 'relative'
          }}
        >
          <Box
            sx={{
              width: VIEWPORT_COLS * CELL_SIZE,
              height: VIEWPORT_ROWS * CELL_SIZE,
              overflow: 'hidden',
              position: 'relative',
              bgcolor: '#1a1a1a'
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: `repeat(${VIEWPORT_COLS}, ${CELL_SIZE}px)`,
                gridTemplateRows: `repeat(${VIEWPORT_ROWS}, ${CELL_SIZE}px)`,
              }}
            >
              {Array(VIEWPORT_ROWS).fill(null).map((_, row) =>
                Array(VIEWPORT_COLS).fill(null).map((_, col) => {
                  const mapX = viewportOffset.x + col;
                  const mapY = viewportOffset.y + row;
                  const tile = map[mapY] ? map[mapY][mapX] : TILE_TYPES.EMPTY;
                  return renderCell(tile, mapX, mapY);
                })
              )}
            </Box>

            {/* SPLAT Animation Overlay */}
            {gameState === 'dead' && showSplatAnimation && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                  animation: 'splatAppear 0.6s ease-out',
                  '@keyframes splatAppear': {
                    '0%': {
                      opacity: 0,
                      transform: 'scale(0.3)'
                    },
                    '30%': {
                      opacity: 1,
                      transform: 'scale(1.2)'
                    },
                    '100%': {
                      opacity: 0.9,
                      transform: 'scale(1)'
                    }
                  }
                }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    color: '#ff0000',
                    fontWeight: 'bold',
                    fontSize: '120px',
                    fontFamily: 'Impact, monospace',
                    textShadow: `
                    0 0 20px #ff0000,
                    0 0 40px #ff0000,
                    0 0 60px #ff0000,
                    5px 5px 0px #8b0000,
                    10px 10px 0px #660000
                  `,
                    letterSpacing: '10px',
                    transform: 'rotate(-5deg)'
                  }}
                >
                  SPLAT!
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>

        <Typography variant="body2" sx={{ flex: 1, color: '#aaa', textAlign: 'center', maxWidth: 700 }}>
          <strong>Contrôles:</strong> Flèches ou WASD = Déplacement | Espace = Dynamite 🧨
          <br />
          <strong>Objectif:</strong> Atteignez l'étoile ★ | Évitez les ennemis 👾 et l'eau 💧
          <br />
          <strong>Bonus:</strong> 💰 Bourse (+50pts) | 🚀 Missile (détruit 1 mur) | 🛶 Canoë (traverse eau) | 🧨 Dynamite (explosion 3x3) | ⬆️⬇️⬅️➡️ Flèches (change direction map)
          <br />
          La map bouge toute seule... Attention au SPLAT ! 💀
        </Typography>

      </Box>


    </Box>
  );
};

export default GipsyGame;