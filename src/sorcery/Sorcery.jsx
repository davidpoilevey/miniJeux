// Game.js - Composant principal du jeu

import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, Button } from '@mui/material';
import { useGame, GameProvider } from './SorceryContext';
import { ACTIONS } from './reducer';
import SorceryCanvas from './SorceryCanvas';
import HUD from './HUD';
import Inventory from './inventory';
import SpellBook from './spellBook';
import levelTutoData from './data/levelTuto.json';
import level1Data from './data/level-1.json';
import enemiesData from './data/enemies.json';
import itemsData from './data/items.json';
import obstaclesData from './data/obstacles.json';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Instructions from './ui/Instructions';
import { SorceryGameOver, SorceryNotif } from './ui/Divers';
import SorceryMenu from './ui/SorceryMenu';
import LevelEditor from './ui/LevelEditor';
import { soundManager } from '../rpg/sons/SoundManager';

const LEVELS = {
  'levelTuto': levelTutoData,
  'level-1': level1Data
};


const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3498db',
    },
    secondary: {
      main: '#9b59b6',
    },
    background: {
      default: '#1a1a2e',
      paper: '#34495e',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

const Sorcery = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GameProvider>
        <Game />
      </GameProvider>
    </ThemeProvider>
  );
}

function Game() {
  const { state, dispatch } = useGame();
  const stateRef = useRef(state);
  const [currentLevelId, setCurrentLevelId] = useState('levelTuto');
  const [currentLevelData, setCurrentLevelData] = useState(LEVELS['levelTuto']);
  const [currentRoomData, setCurrentRoomData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mettre à jour la ref à chaque render
  useEffect(() => {
    stateRef.current = state;
  });
  const onNewGame = (tuto) => {
    dispatch({ type: ACTIONS.RESET_GAME });
    dispatch({ type: ACTIONS.SET_GAME_STATE, payload: { state: 'playing' } });
    loadLevel(tuto ? 'levelTuto' : 'level-1');
  }
  const onEditeur = () => {
    dispatch({ type: ACTIONS.SET_GAME_STATE, payload: { state: 'editor' } });
  }
  const loadLevel = (levelId, startRoomId = null) => {
    const levelData = LEVELS[levelId];

    if (!levelData) {
      console.error(`Niveau ${levelId} introuvable`);
      return;
    }

    setCurrentLevelId(levelId);
    setCurrentLevelData(levelData);
    const roomToLoad = startRoomId || levelData.startRoom;
    loadRoom(roomToLoad, levelData);
  };
  // Charger la salle initiale au démarrage
  useEffect(() => {
    const startLevelId = state.currentLevel.levelId || 'levelTuto';
    const startRoomId = state.currentLevel.currentRoom || LEVELS[startLevelId]?.startRoom;

    loadLevel(startLevelId, startRoomId);
    setLoading(false);
  }, []);

  // Charger une salle
  const loadRoom = (roomId, levelData = currentLevelData, playerPos) => {
    const room = levelData.rooms.find(r => r.id === roomId);
if(playerPos==null)
  playerPos = levelData.playerPosition;
    if (!room) {
      console.error(`Salle ${roomId} introuvable`);
      return;
    }

    setCurrentRoomData(room);

    const obstacles = room.entities
      .filter(e => e.type === 'obstacle')
      .map(entityDef => {
        const obstacleTemplate = obstaclesData.obstacles.find(o => o.id === entityDef.id);

        if (!obstacleTemplate) {
          console.error(`Template obstacle ${entityDef.id} introuvable`);
          return null;
        }

        return {
          id: `${room.id}-${entityDef.id}`,
          x: entityDef.x,
          y: entityDef.y,
          width: entityDef.width || 60,
          height: entityDef.height || 60,
          ...obstacleTemplate,
          health: obstacleTemplate.health, // Santé actuelle
          isBurning: false
        };
      })
      .filter(Boolean);

    // Charger les entités de la salle
    const enemies = room.entities
      .filter(e => e.type === 'enemy')
      .map(entityDef => {
        const enemyTemplate = enemiesData.enemies.find(e => e.id === entityDef.enemyType);

        if (!enemyTemplate) {
          console.error(`Template ennemi ${entityDef.enemyType} introuvable`);
          return null;
        }

        return {
          id: entityDef.id,
          type: entityDef.enemyType,
          name: enemyTemplate.name,
          x: entityDef.x,
          y: entityDef.y,
          spawnX: entityDef.x,  // ← Ajoute ça
          spawnY: entityDef.y,
          width: entityDef.width ?? 64, height: entityDef.height ?? 100,
          health: enemyTemplate.stats.health,
          maxHealth: enemyTemplate.stats.maxHealth,
          mana: enemyTemplate.stats.mana,
          maxMana: enemyTemplate.stats.maxMana,
          attack: enemyTemplate.stats.attack,
          defense: enemyTemplate.stats.defense,
          speed: enemyTemplate.stats.speed,
          behavior: enemyTemplate.behavior,
          attacks: enemyTemplate.attacks,
          loot: enemyTemplate.loot,
          xpReward: enemyTemplate.xpReward,
          isDead: false,
          velocityY: 0,  // ← Ajoute ça
          isGrounded: false,
          direction: 'left'
        };
      })
      .filter(Boolean);

    const items = room.entities
      .filter(e => e.type === 'item')
      .map(entityDef => {
        const itemTemplate = itemsData.items.find(i => i.id === entityDef.id);

        if (!itemTemplate) {
          console.error(`Template item ${entityDef.id} introuvable`);
          return null;
        }

        return {
          id: `${room.id}-${entityDef.id}`,
          itemId: entityDef.id,
          x: entityDef.x,
          y: entityDef.y,
          width: entityDef.width,
          height: entityDef.height,
          ...itemTemplate
        };
      })
      .filter(Boolean);


    dispatch({
      type: ACTIONS.LOAD_ROOM,
      payload: { enemies, items, obstacles, playerPosition:playerPos }
    });
  };




  // Gestion des transitions entre salles
  useEffect(() => {
    if (!currentRoomData) return;

    const checkRoomExit = () => {
      const player = stateRef.current.player;
      const exits = currentRoomData.exits || [];

      exits.forEach(exit => {
        const playerInExitX = player.x + 30 > exit.x && player.x < exit.x + exit.width;
        const playerInExitY = player.y + 50 > exit.y && player.y < exit.y + exit.height;

        if (playerInExitX && playerInExitY) {
          // EXIT LEVEL - Passer au niveau suivant
          if (exit.type === 'exitLevel') {
            // Bloquer le jeu pour afficher la narration
            dispatch({ type: ACTIONS.SET_GAME_STATE, payload: { state: 'levelComplete' } });

              soundManager.play('endLevel');
            // Donner l'XP
            if (exit.xpReward) {
              dispatch({
                type: ACTIONS.GAIN_XP,
                payload: { amount: exit.xpReward }
              });
            }

            // Afficher la narration
            dispatch({
              type: ACTIONS.SHOW_DIALOG,
              payload: {
                text: exit.narrative || 'Niveau terminé !',
                options: [
                  {
                    text: 'Continuer',
                    action: () => {
                      dispatch({ type: ACTIONS.HIDE_DIALOG });
                      dispatch({ type: ACTIONS.SET_GAME_STATE, payload: { state: 'playing' } });
                      // toujours remettre au coin topleft
                      dispatch({ type: ACTIONS.UPDATE_PLAYER_POSITION, payload: { x: 0, y: 200 } });
                      loadLevel(exit.toLevel);
                    }
                  }
                ]
              }
            });

            return;
          }

          // EXIT NORMALE - Changer de room
          if (exit.locked) {
            const hasKey = stateRef.current.inventory.items.some(item => item.id === exit.requiredItem);

            if (!hasKey) {
              dispatch({
                type: ACTIONS.SHOW_NOTIFICATION,
                payload: {
                  type: 'error',
                  message: `Porte verrouillée ! Clé requise : ${exit.requiredItem}`
                }
              });
              return;
            }
          }

          const nextRoom = currentLevelData.rooms.find(r => r.id === exit.toRoom);

          if (!nextRoom) return;

       const linkedExit = nextRoom.exits?.find(e => e.name === exit.linkedExit);

let newPlayerX, newPlayerY;

if (linkedExit) {
  // Calculer la direction de l'exit d'arrivée basée sur sa position
  let exitDirection = 'right';
  if (linkedExit.direction === 'right') exitDirection = 'left';
  else if (linkedExit.x  === 'left') exitDirection = 'right';
  else if (linkedExit.y  === 'bottom') exitDirection = 'top';
  else if (linkedExit.y  === 'top') exitDirection = 'bottom';
  
  // Positionner le joueur DEVANT la porte, pas dessus
  switch (exitDirection) {
    case 'right':
      // Exit à droite → placer le joueur à droite de la porte
      newPlayerX = linkedExit.x + linkedExit.width + 50;
      newPlayerY = linkedExit.y + linkedExit.height / 2 - 25;
      break;
    case 'left':
      // Exit à gauche → placer le joueur à gauche de la porte
      newPlayerX = linkedExit.x -50;
      newPlayerY = linkedExit.y + linkedExit.height / 2 - 25;
      break;
    case 'top':
      // Exit en haut → placer le joueur en haut
      newPlayerX = linkedExit.x + linkedExit.width / 2 - 15;
      newPlayerY = linkedExit.y -100 ;
      break;
    case 'bottom':
      // Exit en bas → placer le joueur en dessous
      newPlayerX = linkedExit.x + linkedExit.width / 2 - 15;
      newPlayerY = linkedExit.y + linkedExit.height + 20;
      break;
    default:
      newPlayerX = linkedExit.x + linkedExit.width / 2 - 15;
      newPlayerY = linkedExit.y + linkedExit.height / 2 - 25;
  }
} else {
  console.warn(`Exit liée "${exit.linkedExit}" introuvable dans room ${exit.toRoom}`);
  newPlayerX = 100;
  newPlayerY = 300;
}

dispatch({
  type: ACTIONS.CHANGE_ROOM,
  payload: {
    roomId: exit.toRoom,
    playerX: newPlayerX,
    playerY: newPlayerY
  }
});
soundManager.play('porte');
          loadRoom(exit.toRoom,undefined, {x:newPlayerX, y:newPlayerY});
        }
      });
    };

    const interval = setInterval(checkRoomExit, 50); // Check toutes les 50ms
    return () => clearInterval(interval);
  }, [currentRoomData]); // Seulement quand on change de room !

  // Affichage des notifications
  useEffect(() => {
    if (state.ui.notification) {
      const timer = setTimeout(() => {
        dispatch({ type: ACTIONS.HIDE_NOTIFICATION });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [state.ui.notification, dispatch]);

  if (loading) {
    return (
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1a1a2e'
        }}
      >
        <CircularProgress size={60} sx={{ color: '#3498db' }} />
      </Box>
    );
  }

  if (state.gameState == 'editor')
    return <LevelEditor />;
  else return state.gameState === "start" ? <SorceryMenu onNewGame={onNewGame} onEditeur={onEditeur} /> : <Box
    sx={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      backgroundColor: '#0f0f1e',
      position: 'relative'
    }}
  >
    {/* Titre de la salle */}
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        px: 3,
        py: 1,
        backgroundColor: 'rgba(26, 26, 46, 0.9)',
        border: '2px solid #3498db',
        zIndex: 1000
      }}
    >
      <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
        {currentRoomData?.name || 'Salle inconnue'}
      </Typography>
      <Typography variant="caption" sx={{ color: '#95a5a6' }}>
        {currentRoomData?.description}
      </Typography>
    </Paper>

    {/* Notification */}
    {state.ui.notification && (
      <SorceryNotif state={state} />
    )}

    {/* Canvas du jeu */}
    <SorceryCanvas roomData={currentRoomData} />

    {/* HUD */}
    <HUD />

    {/* Interfaces */}
    <Inventory />
    <SpellBook />

    {/* Game Over */}
    {state.gameState === 'gameOver' && (
      <SorceryGameOver dispatch={dispatch} loadRoom={loadRoom}
        currentLevelData={currentLevelData} loadLevel={loadLevel} />
    )}

    {/* Instructions initiales */}
    <Instructions />

    <style>
      {`
          @keyframes slideDown {
            from {
              transform: translateX(-50%) translateY(-20px);
              opacity: 0;
            }
            to {
              transform: translateX(-50%) translateY(0);
              opacity: 1;
            }
          }
        `}
    </style>
  </Box>
    ;
}


export default Sorcery;