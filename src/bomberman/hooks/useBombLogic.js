import { useEffect, useCallback } from 'react';
import { BOMB_TYPES } from '../config/levels';
import { hasBombAt, calculateExplosionCells, destroyBlocksInExplosion, isInExplosion } from '../utils/gameLogic';

/**
 * Hook pour gérer la logique des bombes
 */
export const useBombLogic = (
  player,
  setPlayer,
  bombs,
  setBombs,
  enemies,
  setEnemies,
  grid,
  setGrid,
  powerUps,
  setPowerUps,
  explosions,
  setExplosions,
   setExit,
  gameState
) => {
  
  /**
   * Placer une bombe à la position du joueur
   */
  const placeBomb = useCallback(() => {
    if (gameState !== 'playing') return;
    
    const { x, y } = player.position;
    
    // Vérifier s'il y a déjà une bombe à cette position
    if (hasBombAt(x, y, bombs)) return;
    
    // Vérifier si le joueur a atteint sa limite de bombes
    const activeBombs = bombs.filter(b => b.playerId === 'player').length;
    if (activeBombs >= player.maxBombs) return;
    
    // Récupérer les infos du type de bombe actuel
    const bombInfo = BOMB_TYPES[player.currentBombType.toUpperCase()];
    
    // Créer la nouvelle bombe
    const newBomb = {
      id: Date.now(),
      x,
      y,
      playerId: 'player',
      fireRange: player.fireRange,
      timer: bombInfo.timer,
      type: player.currentBombType,
      placedAt: Date.now()
    };
    
    setBombs(prev => [...prev, newBomb]);
  }, [player, bombs, setBombs, gameState]);

  /**
   * Gérer l'explosion d'une bombe
   */
  const explodeBomb = useCallback((bomb) => {
    // Calculer les cellules touchées
    const explosionCells = calculateExplosionCells(bomb.x, bomb.y, bomb.fireRange, grid);
    
    // Créer l'objet explosion pour l'animation
    const explosion = {
      id: bomb.id,
      cells: explosionCells,
      createdAt: Date.now()
    };
    
    setExplosions(prev => [...prev, explosion]);
    
    // Détruire les blocs et révéler les power-ups
const { revealedPowerUps, exitRevealed } = destroyBlocksInExplosion(explosionCells, grid);    setGrid([...grid]); // Force update
    if (exitRevealed) {
        setExit(exitRevealed);
        }
    // Ajouter les power-ups révélés
    if (revealedPowerUps.length > 0) {
      setPowerUps(prev => [...prev, ...revealedPowerUps]);
    }
    
    // Vérifier si le joueur est touché
    if (isInExplosion(player.position.x, player.position.y, explosionCells)) {
      setPlayer(prev => ({
        ...prev,
        lives: prev.lives - 1
      }));
    }
    
    // Vérifier si des ennemis sont touchés
    setEnemies(prev => prev.map(enemy => {
      if (enemy.alive && isInExplosion(enemy.x, enemy.y, explosionCells)) {
        // Ajouter du score
        setPlayer(p => ({ ...p, score: p.score + 100 }));
        return { ...enemy, alive: false };
      }
      return enemy;
    }));
    
    // Retirer la bombe de la liste
    setBombs(prev => prev.filter(b => b.id !== bomb.id));
    
    // Retirer l'explosion après l'animation (500ms)
    setTimeout(() => {
      setExplosions(prev => prev.filter(e => e.id !== bomb.id));
    }, 500);
    
  }, [grid, setGrid, player, setPlayer, setEnemies, setBombs, setPowerUps, setExplosions,setExit]);

  /**
   * Gérer les timers des bombes
   */
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const interval = setInterval(() => {
      const now = Date.now();
      
      bombs.forEach(bomb => {
        const elapsed = now - bomb.placedAt;
        if (elapsed >= bomb.timer) {
          explodeBomb(bomb);
        }
      });
    }, 50); // Vérifier toutes les 50ms
    
    return () => clearInterval(interval);
  }, [bombs, explodeBomb, gameState]);

  /**
   * Gérer la touche Espace pour placer une bombe
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        placeBomb();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [placeBomb]);

  return { placeBomb, explodeBomb };
};