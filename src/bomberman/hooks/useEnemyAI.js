import { useEffect, useCallback } from 'react';
import { DIRECTION } from '../config/levels';
import { canEnemyMove } from '../utils/gameLogic';

/**
 * Hook pour gérer le mouvement des IAs ennemies
 * Version basique : mouvement aléatoire
 * TODO: Peut être amélioré avec une IA plus intelligente
 */
export const useEnemyAI = (
  enemies,
  setEnemies,
  grid,
  bombs,
  gameState
) => {
  
  /**
   * Fonction de mouvement d'un ennemi (peut être personnalisée plus tard)
   */
  const moveEnemy = useCallback((enemyId) => {
    if (gameState !== 'playing') return;
    
    setEnemies(prev => {
      return prev.map(enemy => {
        if (enemy.id !== enemyId || !enemy.alive) return enemy;
        
        // Choisir une direction aléatoire
        const directions = [DIRECTION.UP, DIRECTION.DOWN, DIRECTION.LEFT, DIRECTION.RIGHT];
        const randomDirection = directions[Math.floor(Math.random() * directions.length)];
        
        const newX = enemy.x + randomDirection.x;
        const newY = enemy.y + randomDirection.y;
        
        // Vérifier si le mouvement est valide
        if (canEnemyMove(newX, newY, grid, bombs, prev, enemyId)) {
          return {
            ...enemy,
            x: newX,
            y: newY
          };
        }
        
        return enemy;
      });
    });
  }, [setEnemies, grid, bombs, gameState]);

  /**
   * Boucle de mouvement pour tous les ennemis vivants
   */
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const interval = setInterval(() => {
      enemies.forEach(enemy => {
        if (enemy.alive) {
          moveEnemy(enemy.id);
        }
      });
    }, 400); // Les ennemis bougent toutes les 400ms (un peu plus lent que le joueur)
    
    return () => clearInterval(interval);
  }, [enemies, moveEnemy, gameState]);

  return { moveEnemy };
};

/**
 * TODO: Fonction pour une IA plus intelligente
 * Idées d'amélioration:
 * - Éviter les zones d'explosion
 * - Chasser le joueur quand il est proche
 * - Pathfinding simple vers le joueur
 * - Pattern de mouvement différent selon le type d'ennemi
 */
export const smartEnemyMove = (enemy, playerPos, grid, bombs, enemies) => {
  // À implémenter plus tard si besoin
  // Pour l'instant, on garde le mouvement aléatoire
};