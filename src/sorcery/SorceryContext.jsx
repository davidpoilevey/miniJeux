// GameContext.js - Contexte pour partager l'état du jeu

import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { gameReducer, INITIAL_STATE, ACTIONS } from './reducer';
import { loadGame, saveGame } from '../civ/utils/saveGame';
import { soundManager } from '../rpg/sons/SoundManager';
import { sorcerySounds } from './data/sounds';

const GameContext = createContext();

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}


export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);
  const stateRef = useRef(state);

  // Mettre à jour la ref à chaque render
  useEffect(() => {
    stateRef.current = state;
  });

  useEffect(() => {
    const savedGame = loadGame('sorcerySaved');
    if (savedGame) {
      dispatch({ type: ACTIONS.LOAD_SAVE, payload: savedGame });
    }
  }, []); // Une seule fois au démarrage

  // Sauvegarde automatique toutes les 5 secondes (quand en jeu)
  useEffect(() => {
    if (state.gameState !== 'playing') return;
    
    const saveInterval = setInterval(() => {
      saveGame(stateRef.current);
    }, 5000);

    return () => clearInterval(saveInterval);
  }, [state.gameState]);
  // Game loop pour mettre à jour le temps et les cooldowns
  useEffect(() => {
soundManager.loadSounds(sorcerySounds);
    const gameLoop = setInterval(() => {
      if (stateRef.current.gameState === 'playing') {
        dispatch({ type: ACTIONS.UPDATE_TIME, payload: { delta: 16 } });
        dispatch({ type: ACTIONS.UPDATE_COOLDOWNS });
      }
    }, 120); // ~10 FPS

    return () => clearInterval(gameLoop);
  }, []); // Dépendances vides

  // Gestion du clavier
  useEffect(() => {
if(state.gameState==='editor') return;
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'q':
        case 'a':
          dispatch({ type: ACTIONS.UPDATE_CONTROLS, payload: { moveLeft: true } });
          break;
        case 'ArrowRight':
        case 'd':
          dispatch({ type: ACTIONS.UPDATE_CONTROLS, payload: { moveRight: true } });
          break;
        case 'ArrowUp':
        case 'z':
        case 'w':
          // Vol avec flèche du haut ou W
          dispatch({ type: ACTIONS.UPDATE_CONTROLS, payload: { fly: true } });
          break;
        case ' ':
          // Attaque avec espace
          dispatch({ type: ACTIONS.UPDATE_CONTROLS, payload: { attack: true } });
          break;
        case 'e':
          dispatch({ type: ACTIONS.UPDATE_CONTROLS, payload: { interact: true } });
          break;
        case 'i':
          dispatch({ type: ACTIONS.TOGGLE_INVENTORY });
          break;
        case 'k':
          dispatch({ type: ACTIONS.TOGGLE_SPELLBOOK });
          break;
        case 'Escape':
          dispatch({ type: ACTIONS.TOGGLE_PAUSE });
          break;
        case '1':
        case '2':
        case '3':
        case '4':
          // Lancer le sort du slot correspondant
          const slotIndex = parseInt(e.key) - 1;
          dispatch({ type: ACTIONS.UPDATE_CONTROLS, payload: { castSpell: slotIndex } });
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'q':
        case 'a':
          dispatch({ type: ACTIONS.UPDATE_CONTROLS, payload: { moveLeft: false } });
          break;
        case 'ArrowRight':
        case 'd':
          dispatch({ type: ACTIONS.UPDATE_CONTROLS, payload: { moveRight: false } });
          break;
        case 'ArrowUp':
        case 'z':
        case 'w':
          dispatch({ type: ACTIONS.UPDATE_CONTROLS, payload: { fly: false } });
          break;
        case ' ':
          dispatch({ type: ACTIONS.UPDATE_CONTROLS, payload: { attack: false } });
          break;
        case 'e':
          dispatch({ type: ACTIONS.UPDATE_CONTROLS, payload: { interact: false } });
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [state.gameState]); // Pas de dépendances pour éviter les re-render

  const value = {
    state,
    dispatch,
    // Helper functions
    damagePlayer: (amount) => dispatch({ type: ACTIONS.DAMAGE_PLAYER, payload: { amount } }),
    healPlayer: (amount) => dispatch({ type: ACTIONS.HEAL_PLAYER, payload: { amount } }),
    addItem: (itemId, itemData, quantity) => dispatch({
      type: ACTIONS.ADD_ITEM,
      payload: { itemId, itemData, quantity }
    }),
    utiliseItem: (index) => dispatch({ type: ACTIONS.USE_ITEM, payload: { index } }),
    learnSpell: (spellId, spellName) => dispatch({
      type: ACTIONS.LEARN_SPELL,
      payload: { spellId, spellName }
    }),
    castSpell: (spellId, cooldown) => dispatch({
      type: ACTIONS.CAST_SPELL,
      payload: { spellId, cooldown }
    }),
    changeRoom: (roomId, playerX, playerY) => dispatch({
      type: ACTIONS.CHANGE_ROOM,
      payload: { roomId, playerX, playerY }
    }),
    damageEnemy: (enemyId, amount) => dispatch({
      type: ACTIONS.DAMAGE_ENEMY,
      payload: { enemyId, amount }
    }),
    spawnProjectile: (projectile) => dispatch({
      type: ACTIONS.SPAWN_PROJECTILE,
      payload: { projectile }
    }),
    showDialog: (text, options) => dispatch({
      type: ACTIONS.SHOW_DIALOG,
      payload: { text, options }
    }),
    hideDialog: () => dispatch({ type: ACTIONS.HIDE_DIALOG }),
    showNotification: (type, message) => dispatch({
      type: ACTIONS.SHOW_NOTIFICATION,
      payload: { type, message }
    })
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}