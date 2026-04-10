import { useEffect, useCallback } from 'react';
import { DIRECTION } from '../config/levels';
import { canPlayerMove } from '../utils/gameLogic';

/**
 * Hook pour gérer le mouvement du joueur via le clavier
 */
export const usePlayerMovement = (
  player,
  setPlayer,
  grid,
  bombs,
  enemies,
  gameState,
  speed
) => {
  const movePlayer = useCallback((direction) => {
    if (gameState !== 'playing') return;
    
    setPlayer(prev => {
      const newX = prev.position.x + direction.x;
      const newY = prev.position.y + direction.y;
      
      if (canPlayerMove(newX, newY, grid, bombs, enemies)) {
        return {
          ...prev,
          position: { x: newX, y: newY }
        };
      }
      
      return prev;
    });
  }, [setPlayer, grid, bombs, enemies, gameState]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'playing') return;
      
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          movePlayer(DIRECTION.UP);
          break;
        case 'ArrowDown':
          e.preventDefault();
          movePlayer(DIRECTION.DOWN);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          movePlayer(DIRECTION.LEFT);
          break;
        case 'ArrowRight':
          e.preventDefault();
          movePlayer(DIRECTION.RIGHT);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePlayer, gameState]);

  return { movePlayer };
};