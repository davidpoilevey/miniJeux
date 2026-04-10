import { useEffect } from 'react';

/**
 * Hook pour la boucle de jeu principale
 * Gère les collisions continues et les conditions de victoire/défaite
 */
export const useGameLoop = (
  gameState,
  setGameState,
  player,
  setPlayer,
  enemies,
  setEnemies,
  powerUps,
  setPowerUps,
  exit, 
  explosions,
  currentLevel,
  setCurrentLevel
) => {
  
  /**
   * Vérifier les collisions joueur-ennemi
   */
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const checkCollisions = () => {
      // Collision avec les ennemis
      const collidedWithEnemy = enemies.some(
        enemy => enemy.alive && 
                 enemy.x === player.position.x && 
                 enemy.y === player.position.y
      );
      
      if (collidedWithEnemy) {
        setPlayer(prev => ({
          ...prev,
          lives: prev.lives - 1
        }));
      }
      
      // Ramasser les power-ups
      powerUps.forEach(powerUp => {
        if (powerUp.x === player.position.x && powerUp.y === player.position.y) {
          applyPowerUp(powerUp.type);
          setPowerUps(prev => prev.filter(p => p !== powerUp));
        }
      });
      // Vérifier si le joueur atteint la sortie
if (exit && 
    exit.x === player.position.x && 
    exit.y === player.position.y) {
  setGameState('levelComplete');
}
    };
    
    const interval = setInterval(checkCollisions, 100);
    return () => clearInterval(interval);
}, [gameState, player.position, enemies, powerUps, exit, setPlayer, setPowerUps, setGameState]);

  /**
   * Appliquer un power-up au joueur
   */
  const applyPowerUp = (type) => {
    setPlayer(prev => {
      const updated = { ...prev };
      
      switch (type) {
        case 'bomb_plus':
          updated.maxBombs = Math.min(prev.maxBombs + 1, 8);
          updated.score += 50;
          break;
        case 'fire_plus':
          updated.fireRange = Math.min(prev.fireRange + 1, 10);
          updated.score += 50;
          break;
        case 'speed_plus':
          updated.speed = Math.min(prev.speed + 1, 3);
          updated.score += 50;
          break;
        case 'life_plus':
          updated.lives = prev.lives + 1;
          updated.score += 100;
          break;
        case 'grenade':
          updated.currentBombType = 'grenade';
          updated.score += 30;
          break;
        case 'dynamite':
          updated.currentBombType = 'dynamite';
          updated.score += 30;
          break;
        case 'c4':
          updated.currentBombType = 'c4';
          updated.score += 30;
          break;
        default:
          break;
      }
      
      return updated;
    });
  };

  /**
   * Vérifier la condition de défaite
   */
  useEffect(() => {
    if (gameState === 'playing' && player.lives <= 0) {
      setGameState('gameOver');
    }
  }, [player.lives, gameState, setGameState]);

  /**
   * Vérifier la condition de victoire
   */
  useEffect(() => {
    if (gameState === 'playing') {
      const allEnemiesDead = enemies.every(enemy => !enemy.alive);
      
      if (allEnemiesDead && enemies.length > 0) {
        setGameState('levelComplete');
      }
    }
  }, [enemies, gameState, setGameState]);

  return { applyPowerUp };
};