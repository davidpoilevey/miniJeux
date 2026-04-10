import React from 'react';
import { Box } from '@mui/material';
import Cell from './Cell';
import { GRID_SIZE } from '../config/levels';
import { isInExplosion } from '../utils/gameLogic';

const GameBoard = ({ 
  grid, 
  player, 
  enemies, 
  bombs, 
  explosions, 
  powerUps, exit, 
  cellSize = 40 
}) => {
  
  const isExplosionAt = (x, y) => {
    return explosions.some(explosion => 
      isInExplosion(x, y, explosion.cells)
    );
  };

  const hasBombAt = (x, y) => {
    return bombs.some(bomb => bomb.x === x && bomb.y === y);
  };

  const getEnemyAt = (x, y) => {
    return enemies.find(enemy => enemy.alive && enemy.x === x && enemy.y === y);
  };

  const getPowerUpAt = (x, y) => {
    return powerUps.find(powerUp => powerUp.x === x && powerUp.y === y);
  };

  return (
    <Box sx={{
      display: 'inline-block',
      bgcolor: '#0a0a0a',
      padding: 2,
      borderRadius: 2,
      boxShadow: '0 0 30px rgba(0,0,0,0.8)'
    }}>
      {grid.map((row, y) => (
        <Box key={y} sx={{ display: 'flex' }}>
          {row.map((cell, x) => {
            const hasPlayer = player.position.x === x && player.position.y === y;
            const hasEnemy = getEnemyAt(x, y);
            const hasBomb = hasBombAt(x, y);
            const hasExplosion = isExplosionAt(x, y);
            const powerUp = getPowerUpAt(x, y);
 const hasExit = exit && exit.x === x && exit.y === y;
            return (
              <Cell
                key={`${x}-${y}`}
                cell={cell}
                size={cellSize}
                hasPlayer={hasPlayer}
                hasEnemy={!!hasEnemy}
                hasBomb={hasBomb}
                hasExplosion={hasExplosion}
                hasPowerUp={!!powerUp}
                powerUpType={powerUp?.type}
                 hasExit={hasExit} 
              />
            );
          })}
        </Box>
      ))}
    </Box>
  );
};

export default GameBoard;