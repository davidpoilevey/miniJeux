import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import GameBoard from './GameBoard';
import ScorePanel from './ScorePanel';
import { LEVELS, INITIAL_PLAYER_STATE } from '../config/levels';
import { usePlayerMovement } from '../hooks/usePlayerMovement';
import { useEnemyAI } from '../hooks/useEnemyAI';
import { useBombLogic } from '../hooks/useBombLogic';
import { useGameLoop } from '../hooks/useGameLoop';
import { generateMap, getEnemySpawnPositions } from '../utils/MapGenerator';
import { useGlobalScores } from '../../App';
import { PublishScore } from '../../pocketbaseScores';

const BombermanGame = () => {
  // État du jeu
  const [gameState, setGameState] = useState('menu'); // menu, playing, paused, levelComplete, gameOver
  const [currentLevel, setCurrentLevel] = useState(0);
  const [exit, setExit] = useState(null);
  const {setScore, getScoreByGame} = useGlobalScores();
   const hiscore = getScoreByGame('bomberman');
  // État du plateau
  const [grid, setGrid] = useState([]);
  const [player, setPlayer] = useState({ ...INITIAL_PLAYER_STATE });
  const [enemies, setEnemies] = useState([]);
  const [bombs, setBombs] = useState([]);
  const [explosions, setExplosions] = useState([]);
  const [powerUps, setPowerUps] = useState([]);
  useEffect(()=>{
    if(gameState==='victory'||gameState==='gameOver'){

      if(hiscore.score<player.score)
        setScore('bomberman',player.score);
    }
  },[gameState])

  /**
   * Initialiser un niveau
   */
  const initLevel = (levelIndex) => {
    const levelConfig = LEVELS[levelIndex];
    
    // Générer la carte
    const newGrid = generateMap(levelConfig);
    setGrid(newGrid);
    
    // Réinitialiser le joueur (garder le score et les stats)
    setPlayer(prev => ({
      ...prev,
      position: { x: 1, y: 1 }
    }));
    
    // Créer les ennemis
    const enemyPositions = getEnemySpawnPositions(levelConfig.enemies);
    const newEnemies = enemyPositions.map((pos, index) => ({
      id: `enemy-${index}`,
      x: pos.x,
      y: pos.y,
      alive: true
    }));
    setEnemies(newEnemies);
    
    // Réinitialiser les bombes et explosions
    setBombs([]);
    setExplosions([]);
    setPowerUps([]);
    setExit(null);
    setCurrentLevel(levelIndex);
    setGameState('playing');
  };

  /**
   * Démarrer une nouvelle partie
   */
  const startNewGame = () => {
    setPlayer({ ...INITIAL_PLAYER_STATE });
    initLevel(0);
  };

  /**
   * Passer au niveau suivant
   */
  const nextLevel = () => {
    const nextLevelIndex = currentLevel + 1;
    
    if (nextLevelIndex < LEVELS.length) {
      initLevel(nextLevelIndex);
    } else {
      // Victoire totale !
      setGameState('victory');
    }
  };

  /**
   * Recommencer le niveau actuel
   */
  const retryLevel = () => {
    setPlayer({ ...INITIAL_PLAYER_STATE });
    initLevel(currentLevel);
  };

  // Hooks de gameplay
  usePlayerMovement(player, setPlayer, grid, bombs, enemies, gameState, player.speed);
  useEnemyAI(enemies, setEnemies, grid, bombs, gameState);
useBombLogic(player, setPlayer, bombs, setBombs, enemies, setEnemies, grid, setGrid, powerUps, setPowerUps, explosions, setExplosions, setExit, gameState);
 useGameLoop(gameState, setGameState, player, setPlayer, enemies, setEnemies, powerUps, setPowerUps, exit, explosions, currentLevel, setCurrentLevel);
  // Écran de menu
  if (gameState === 'menu') {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: '#0a0a0a',
        gap: 3
      }}>
        <Typography 
          variant="h2" 
          sx={{ 
            color: '#ff6600',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            textShadow: '0 0 20px #ff6600',
            mb: 2
          }}
        >
          💣 BOMBERMAN 💣
        </Typography>
        
        <Typography 
          variant="h6" 
          sx={{ 
            color: '#ccc',
            fontFamily: 'monospace',
            mb: 4
          }}
        >
          Remake Rétro
        </Typography>
        
        <Button
          variant="contained"
          size="large"
          onClick={startNewGame}
          sx={{
            bgcolor: '#ff6600',
            color: '#fff',
            fontFamily: 'monospace',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            padding: '15px 50px',
            '&:hover': {
              bgcolor: '#ff8833'
            }
          }}
        >
          NOUVELLE PARTIE
        </Button>
      </Box>
    );
  }

  // Écran de victoire de niveau
  if (gameState === 'levelComplete') {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: '#0a0a0a',
        gap: 3
      }}>
        <Typography 
          variant="h3" 
          sx={{ 
            color: '#00ff00',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            textShadow: '0 0 20px #00ff00'
          }}
        >
          🎉 NIVEAU TERMINÉ ! 🎉
        </Typography>
        
        <Paper sx={{ bgcolor: 'rgba(26, 26, 26, 0.9)', padding: 3, borderRadius: 2 }}>
          <Typography variant="h5" sx={{ color: '#ffcc00', fontFamily: 'monospace', mb: 1 }}>
            Score: {player.score}
          </Typography>
          <Typography variant="body1" sx={{ color: '#ccc', fontFamily: 'monospace' }}>
            Vies restantes: {player.lives} ❤️
          </Typography>
        </Paper>
        
        <Button
          variant="contained"
          size="large"
          onClick={nextLevel}
          sx={{
            bgcolor: '#00ff00',
            color: '#000',
            fontFamily: 'monospace',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            '&:hover': {
              bgcolor: '#33ff33'
            }
          }}
        >
          NIVEAU SUIVANT
        </Button>
      </Box>
    );
  }

  // Écran de game over
  if (gameState === 'gameOver') {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: '#0a0a0a',
        gap: 3
      }}>
        <Typography 
          variant="h3" 
          sx={{ 
            color: '#ff3333',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            textShadow: '0 0 20px #ff3333'
          }}
        >
          💀 GAME OVER 💀
        </Typography>
        
        <Paper sx={{ bgcolor: 'rgba(26, 26, 26, 0.9)', padding: 3, borderRadius: 2 }}>
          <Typography variant="h5" sx={{ color: '#ffcc00', fontFamily: 'monospace', mb: 1 }}>
            Score final: {player.score}
          </Typography>
          <Typography variant="body1" sx={{ color: '#ccc', fontFamily: 'monospace' }}>
            Niveau atteint: {currentLevel + 1}
          </Typography>

          <Typography variant="body1" sx={{ color: '#a4e518', fontFamily: 'monospace', mb: 1 }}>
            Hi-score: {hiscore.score}
          </Typography>
          <PublishScore gameName="bomberman" score={player.score} />
        </Paper>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={retryLevel}
            sx={{
              bgcolor: '#ff6600',
              fontFamily: 'monospace',
              '&:hover': { bgcolor: '#ff8833' }
            }}
          >
            RÉESSAYER
          </Button>
          
          <Button
            variant="outlined"
            onClick={startNewGame}
            sx={{
              borderColor: '#ff6600',
              color: '#ff6600',
              fontFamily: 'monospace',
              '&:hover': {
                borderColor: '#ff8833',
                bgcolor: 'rgba(255, 102, 0, 0.1)'
              }
            }}
          >
            NOUVELLE PARTIE
          </Button>
        </Box>
      </Box>
    );
  }

  // Victoire totale
  if (gameState === 'victory') {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: '#0a0a0a',
        gap: 3
      }}>
        <Typography 
          variant="h2" 
          sx={{ 
            color: '#ffcc00',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            textShadow: '0 0 30px #ffcc00',
            mb: 2
          }}
        >
          🏆 VICTOIRE ! 🏆
        </Typography>
        
        <Typography variant="h5" sx={{ color: '#00ff00', fontFamily: 'monospace', mb: 3 }}>
          Vous avez terminé tous les niveaux !
        </Typography>
        
        <Paper sx={{ bgcolor: 'rgba(26, 26, 26, 0.9)', padding: 4, borderRadius: 2 }}>
          <Typography variant="h4" sx={{ color: '#ffcc00', fontFamily: 'monospace', mb: 2 }}>
            Score final: {player.score}
          </Typography>
          <Typography variant="body1" sx={{ color: '#a4e518', fontFamily: 'monospace', mb: 1 }}>
            Hi-score: {hiscore.score}
          </Typography>
          <PublishScore gameName="bomberman" score={player.score} />
        </Paper>

        <Button
          variant="contained"
          size="large"
          onClick={startNewGame}
          sx={{
            bgcolor: '#ffcc00',
            color: '#000',
            fontFamily: 'monospace',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            '&:hover': {
              bgcolor: '#ffdd33'
            }
          }}
        >
          REJOUER
        </Button>
      </Box>
    );
  }

  // Jeu en cours
  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      minHeight: '100vh',
      bgcolor: '#0a0a0a',
      padding: 4,
      gap: 3
    }}>
      {/* Plateau de jeu */}
      <GameBoard
        grid={grid}
         exit={exit}
        player={player}
        enemies={enemies}
        bombs={bombs}
        explosions={explosions}
        powerUps={powerUps}
        cellSize={40}
      />
      
      {/* Panneau de score */}
      <ScorePanel
        player={player}
        levelInfo={LEVELS[currentLevel]}
        gameState={gameState}
      />
    </Box>
  );
};

export default BombermanGame;