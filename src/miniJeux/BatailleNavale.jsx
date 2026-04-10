import { ResetTv, ResetTvOutlined } from '@mui/icons-material';
import { Box, IconButton, Tooltip } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { GameOver } from '../ChuckNorrisFact';
import { soundManager, soundMap } from '../rpg/sons/SoundManager';

const GRID_SIZE = 12;
const WEAPONS = {
  BOMBINETTE: { name: 'Bombinette', cost: 100, range: 0, icon: '💣', damage: 1 },
  BOMBE: { name: 'Bombe', cost: 300, range: 1, icon: '💥', damage: 1 },
  NUCLEAIRE: { name: 'Nucléaire', cost: 800, range: 2, icon: '☢️', damage: 1 }
};

const SHIPS = [
  { name: 'Porte-avion', size: 5, reward: 500 },
  { name: 'Croiseur', size: 4, reward: 400 },
  { name: 'Destroyer 1', size: 3, reward: 300 },
  { name: 'Destroyer 2', size: 3, reward: 300 },
  { name: 'Sous-marin 1', size: 2, reward: 200 },
  { name: 'Sous-marin 2', size: 2, reward: 200 },
  { name: 'Patrouilleur', size: 1, reward: 100 }
];

const BattleShipGame = () => {
  const [gameState, setGameState] = useState('setup');
  const [playerGrid, setPlayerGrid] = useState([]);
  const [enemyGrid, setEnemyGrid] = useState([]);
  const [playerShots, setPlayerShots] = useState([]);
  const [enemyShots, setEnemyShots] = useState([]);
  const [selectedWeapon, setSelectedWeapon] = useState('BOMBINETTE');
  const [playerMoney, setPlayerMoney] = useState(500);
  const [enemyMoney, setEnemyMoney] = useState(500);
  const [currentPlayer, setCurrentPlayer] = useState('player');
  const [message, setMessage] = useState('Placez vos navires (placement aléatoire)');
  const [playerShips, setPlayerShips] = useState([]);
  const [enemyShips, setEnemyShips] = useState([]);
  const [startTime, setStartTime] = useState(null);
const [elapsedTime, setElapsedTime] = useState(0);
  const [hoveredCell, setHoveredCell] = useState(null);
   const [gameOver, setGameOver] = useState(false);
      const [score, setScore] = useState(0);

  useEffect(() => {
    initializeGame();
     soundManager.loadSounds(soundMap);
  }, []);
useEffect(() => {
  if (startTime && gameState === 'playing') {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }
}, [startTime, gameState]);

  const initializeGame = () => {
    const emptyGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
    setPlayerGrid(JSON.parse(JSON.stringify(emptyGrid)));
    setEnemyGrid(JSON.parse(JSON.stringify(emptyGrid)));
    setPlayerMoney(500);
    setEnemyMoney(500);
    setCurrentPlayer('player');
    setPlayerShots([]);
    setEnemyShots([]);
    setStartTime(null);
setElapsedTime(0);
  };

  const placeShipsRandomly = (grid) => {
    const newGrid = JSON.parse(JSON.stringify(grid));
    const placedShips = [];

    for (let shipIndex = 0; shipIndex < SHIPS.length; shipIndex++) {
      const ship = SHIPS[shipIndex];
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < 100) {
        const horizontal = Math.random() > 0.5;
        const row = Math.floor(Math.random() * GRID_SIZE);
        const col = Math.floor(Math.random() * GRID_SIZE);

        if (canPlaceShip(newGrid, row, col, ship.size, horizontal)) {
          const shipCells = [];
          for (let i = 0; i < ship.size; i++) {
            const r = horizontal ? row : row + i;
            const c = horizontal ? col + i : col;
            newGrid[r][c] = shipIndex;
            shipCells.push({ row: r, col: c, hit: false });
          }
          placedShips.push({ ...ship, cells: shipCells, sunk: false });
          placed = true;
        }
        attempts++;
      }
    }

    return { grid: newGrid, ships: placedShips };
  };

  const canPlaceShip = (grid, row, col, size, horizontal) => {
    if (horizontal) {
      if (col + size > GRID_SIZE) return false;
      for (let i = 0; i < size; i++) {
        if (grid[row][col + i] !== null) return false;
      }
    } else {
      if (row + size > GRID_SIZE) return false;
      for (let i = 0; i < size; i++) {
        if (grid[row + i][col] !== null) return false;
      }
    }
    return true;
  };

  const startGame = () => {
    const playerSetup = placeShipsRandomly(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null)));
    const enemySetup = placeShipsRandomly(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null)));
   initializeGame();
   setStartTime(Date.now());
    setPlayerGrid(playerSetup.grid);
    setEnemyGrid(enemySetup.grid);
    setPlayerShips(playerSetup.ships);
    setEnemyShips(enemySetup.ships);
    setGameState('playing');
    setMessage('À votre tour ! Choisissez une case à attaquer');
  };

  const getAffectedCells = (row, col, range) => {
    const cells = [];
    for (let r = Math.max(0, row - range); r <= Math.min(GRID_SIZE - 1, row + range); r++) {
      for (let c = Math.max(0, col - range); c <= Math.min(GRID_SIZE - 1, col + range); c++) {
        cells.push({ row: r, col: c });
      }
    }
    return cells;
  };

  const handleCellClick = (row, col) => {
    if (gameState !== 'playing' || currentPlayer !== 'player') return;
    
    const weapon = WEAPONS[selectedWeapon];
    
    if (playerMoney < weapon.cost) {
      setMessage('Pas assez d\'argent ! Utilisez une bombinette');
      return;
    }

    if (playerShots.some(s => s.row === row && s.col === col)) {
      setMessage('Vous avez déjà tiré ici !');
      return;
    }

    const affectedCells = getAffectedCells(row, col, weapon.range);
    const newShots = [...playerShots];
    let totalReward = 0;
    let hits = 0;
    let msgPrioritaire=false;

    affectedCells.forEach(cell => {
      if (!newShots.some(s => s.row === cell.row && s.col === cell.col)) {
        const isHit = enemyGrid[cell.row][cell.col] !== null;
        newShots.push({ ...cell, hit: isHit });
        
        if (isHit) {
          hits++;
          totalReward += 50;
          const shipIndex = enemyGrid[cell.row][cell.col];
          const ship = enemyShips[shipIndex];
          const shipCell = ship.cells.find(c => c.row === cell.row && c.col === cell.col);
          if (shipCell) shipCell.hit = true;
          
          if (ship.cells.every(c => c.hit) && !ship.sunk) {
            ship.sunk = true;
            totalReward += ship.reward;
            msgPrioritaire=true;
            soundManager.play('fire');
            setMessage(`💥 ${ship.name} coulé ! +${ship.reward}$ !`);
          }
        }
      }
    });

    setPlayerShots(newShots);
    setPlayerMoney(prev => prev - weapon.cost + totalReward + 100);

    if (enemyShips.every(s => s.sunk)) {
      setGameState('gameOver');
      setGameOver(true);
      soundManager.play('finNiveau');
      setScore(playerMoney+Math.max(0,(1000-elapsedTime))+playerShips.reduce((acc, ship) => acc + (ship.sunk ? 0 : ship.reward), 0));
      setMessage('🎉 VICTOIRE ! Vous avez coulé toute la flotte ennemie !');
      return;
    }

    if (hits === 0) {
      setMessage('Plouf... Raté !');
    } else if (!msgPrioritaire) {
      setMessage(`Touché ! ${hits} case(s) !`);
    }

    setCurrentPlayer('enemy');
    setTimeout(enemyTurn, 500);
  };

 const enemyTurn = () => {
  let row, col;
  let useTargetedMode = false;

  // Mode ciblé : chercher les hits non coulés
  const uncoveredHits = enemyShots.filter(shot => {
    if (!shot.hit) return false;
    // Vérifier si ce hit appartient à un bateau non coulé
    const shipIndex = playerGrid[shot.row][shot.col];
    if (shipIndex === null) return false;
    const ship = playerShips[shipIndex];
    return ship && !ship.sunk;
  });

  if (uncoveredHits.length > 0) {
    // Trouver les cases adjacentes non tirées
    const targetCandidates = [];
    
    uncoveredHits.forEach(hit => {
      const adjacents = [
        { row: hit.row - 1, col: hit.col },     // haut
        { row: hit.row + 1, col: hit.col },     // bas
        { row: hit.row, col: hit.col - 1 },     // gauche
        { row: hit.row, col: hit.col + 1 }      // droite
      ];

      adjacents.forEach(adj => {
        if (adj.row >= 0 && adj.row < GRID_SIZE && 
            adj.col >= 0 && adj.col < GRID_SIZE &&
            !enemyShots.some(s => s.row === adj.row && s.col === adj.col)) {
          targetCandidates.push(adj);
        }
      });
    });

    if (targetCandidates.length > 0) {
      // Si on a plusieurs hits alignés, privilégier la même direction
      if (uncoveredHits.length >= 2) {
        const sorted = [...uncoveredHits].sort((a, b) => a.row - b.row || a.col - b.col);
        const isHorizontal = sorted[0].row === sorted[1].row;
        const isVertical = sorted[0].col === sorted[1].col;

        const directionalTargets = targetCandidates.filter(t => {
          if (isHorizontal) {
            return uncoveredHits.some(h => h.row === t.row);
          } else if (isVertical) {
            return uncoveredHits.some(h => h.col === t.col);
          }
          return true;
        });

        if (directionalTargets.length > 0) {
          const target = directionalTargets[Math.floor(Math.random() * directionalTargets.length)];
          row = target.row;
          col = target.col;
          useTargetedMode = true;
        }
      }
      
      if (!useTargetedMode) {
        const target = targetCandidates[Math.floor(Math.random() * targetCandidates.length)];
        row = target.row;
        col = target.col;
        useTargetedMode = true;
      }
    }
  }

  // Mode aléatoire si pas de cible
  if (!useTargetedMode) {
    let attempts = 0;
    do {
      row = Math.floor(Math.random() * GRID_SIZE);
      col = Math.floor(Math.random() * GRID_SIZE);
      attempts++;
    } while (enemyShots.some(s => s.row === row && s.col === col) && attempts < 100);
  }

  // Toujours utiliser bombinette en mode ciblé pour économiser
  const weapon = useTargetedMode ? WEAPONS.BOMBINETTE : 
                 (enemyMoney >= 300 && Math.random() > 0.7 ? WEAPONS.BOMBE : WEAPONS.BOMBINETTE);
  
  const affectedCells = getAffectedCells(row, col, weapon.range);
  const newShots = [...enemyShots];
  let totalReward = 0;

  affectedCells.forEach(cell => {
    if (!newShots.some(s => s.row === cell.row && s.col === cell.col)) {
      const isHit = playerGrid[cell.row][cell.col] !== null;
      newShots.push({ ...cell, hit: isHit });
      
      if (isHit) {
        const shipIndex = playerGrid[cell.row][cell.col];
        const ship = playerShips[shipIndex];
        const shipCell = ship.cells.find(c => c.row === cell.row && c.col === cell.col);
        if (shipCell) shipCell.hit = true;
        
        if (ship.cells.every(c => c.hit) && !ship.sunk) {
          ship.sunk = true;
          totalReward += ship.reward;
          setMessage(`💀 L'ennemi a coulé votre ${ship.name} !`);
        }
      }
    }
  });

  setEnemyShots(newShots);
  setEnemyMoney(prev => prev - weapon.cost + totalReward + 100);

  if (playerShips.every(s => s.sunk)) {
    setGameState('gameOver');
    soundManager.play('slash');
    setMessage('💀 DÉFAITE ! Toute votre flotte a été coulée...');
    return;
  }

  setCurrentPlayer('player');
};

  const renderCell = (row, col, isPlayer) => {
    const grid = isPlayer ? playerGrid : enemyGrid;
    const shots = isPlayer ? enemyShots : playerShots;
    const shot = shots.find(s => s.row === row && s.col === col);
    
    let style = {
      width: '32px',
      height: '32px',
      border: '1px solid #93c5fd',
      cursor: isPlayer ? 'default' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      transition: 'all 0.2s'
    };
   
    let content = '';

    if (isPlayer) {
      if (grid[row][col] !== null) {
        style.backgroundColor = '#4b5563';
        if (shot && shot.hit) {
          style.backgroundColor = '#dc2626';
          content = '💥';
        }
      } else if (shot) {
        style.backgroundColor = '#bfdbfe';
        content = '○';
      } else {
        style.backgroundColor = '#eff6ff';
      }
    } else {
      if (shot) {
        if (shot.hit) {
          style.backgroundColor = '#ef4444';
          content = '💥';
        } else {
          style.backgroundColor = '#bfdbfe';
          content = '○';
        }
      } else {
        style.backgroundColor = '#dbeafe';
      }

      if (hoveredCell && !isPlayer && gameState === 'playing' && currentPlayer === 'player') {
        const weapon = WEAPONS[selectedWeapon];
        const affectedCells = getAffectedCells(hoveredCell.row, hoveredCell.col, weapon.range);
        if (affectedCells.some(c => c.row === row && c.col === col)) {
          style.boxShadow = 'inset 0 0 0 2px #fbbf24';
        }
      }
    }

    return (
      <div
        key={`${row}-${col}`}
        style={style}
        onClick={() => !isPlayer && handleCellClick(row, col)}
        onMouseEnter={() => !isPlayer && setHoveredCell({ row, col })}
        onMouseLeave={() => !isPlayer && setHoveredCell(null)}
      >
        {content}
      </div>
    );
  };

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #0e7490 100%)',
    padding: '30px',
    fontFamily: 'Arial, sans-serif'
  };

  const titleStyle = {
    fontSize: '36px',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '10px',
    textAlign: 'center'
  };

  const messageStyle = {
    textAlign: 'center',
    color: '#fde047',
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '20px'
  };

  const weaponPanelStyle = {
    backgroundColor: '#1f2937',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    gap: '24px'
  };

  const moneyStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#fbbf24',
    fontSize: '20px',
    fontWeight: 'bold'
  };

  const gridsContainerStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '32px',
    maxWidth: '1400px',
    margin: '0 auto'
  };

  const gridPanelStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '20px'
  };

  const gridTitleStyle = {
    fontSize: '20px',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '12px',
    textAlign: 'center'
  };

  const gridStyle = {
    display: 'inline-grid',
    gridTemplateColumns: `repeat(${GRID_SIZE}, 32px)`,
    gap: '0'
  };

  const statsStyle = {
    marginTop: '12px',
    color: 'white',
    fontSize: '14px'
  };
 
    
  const buttonStyle = {
    backgroundColor: '#16a34a',
    color: 'white',
    fontWeight: 'bold',gap:'5px',
    padding: '16px 32px',
    borderRadius: '8px',
    fontSize: '20px',
    border: 'none',
    cursor: 'pointer'
  };

  const getWeaponButtonStyle = (key, weapon) => {
    const isSelected = selectedWeapon === key;
    const canAfford = playerMoney >= weapon.cost && currentPlayer === 'player';
    
    return {
      padding: '12px 24px',
      borderRadius: '8px',
      fontWeight: '600',
      border: 'none',
      cursor: canAfford ? 'pointer' : 'not-allowed',
      backgroundColor: isSelected ? '#ea580c' : canAfford ? '#374151' : '#111827',
      color: canAfford ? 'white' : '#6b7280',
      boxShadow: isSelected ? '0 0 0 4px #fb923c' : 'none',
      transition: 'all 0.2s'
    };
  };

  return (
    <div style={containerStyle}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={titleStyle}>
          ⚓ Bataille Navale Explosive 💣
        </h1>
           <GameOver open={gameOver} score={score}  gameName="batailleNavale"
                        handleClose={() => { setGameOver(false); }}
                         handleRestart={startGame} />
        <div style={messageStyle}>
          {message}
        </div>

        {gameState === 'setup' && (
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={startGame}
              style={buttonStyle}
              onMouseOver={(e) => e.target.style.backgroundColor = '#15803d'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#16a34a'}
            >
              🚀 Commencer la partie
            </button>
          </div>
        )}

        {gameState !== 'setup' && (
          <div>
            <div style={weaponPanelStyle}>
            
            <Tooltip title="Recommencer une partie">
              <IconButton
              onClick={startGame}
              style={buttonStyle}
              onMouseOver={(e) => e.target.style.backgroundColor = '#15803d'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#16a34a'}
            >
              Recommencer 
             <ResetTv/>
            </IconButton>
            </Tooltip>
            <Box>
              <div style={moneyStyle}>
             💰 {playerMoney}$
              </div>
              {gameState === 'playing' && (
  <div style={timerStyle}>
    {String(Math.floor(elapsedTime / 60)).padStart(2, '0')}:
    {String(elapsedTime % 60).padStart(2, '0')}
  </div>
)}
            </Box>
              
              {Object.entries(WEAPONS).map(([key, weapon]) => (
                <button
                  key={key}
                  onClick={() => setSelectedWeapon(key)}
                  disabled={playerMoney < weapon.cost || currentPlayer !== 'player'}
                  style={getWeaponButtonStyle(key, weapon)}
                >
                  <div style={{ fontSize: '24px', marginBottom: '4px' }}>{weapon.icon}</div>
                  <div style={{ fontSize: '14px' }}>{weapon.name}</div>
                  <div style={{ fontSize: '12px' }}>{weapon.cost}$</div>
                </button>
              ))}
            </div>

            <div style={gridsContainerStyle}>
              <div style={gridPanelStyle}>
                <h2 style={gridTitleStyle}>Votre Flotte</h2>
                <div style={gridStyle}>
                  {Array(GRID_SIZE).fill(null).map((_, row) =>
                    Array(GRID_SIZE).fill(null).map((_, col) => renderCell(row, col, true))
                  )}
                </div>
                <div style={statsStyle}>
                  {playerShips.filter(s => !s.sunk).length} / {playerShips.length} navires
                </div>
              </div>

              <div style={gridPanelStyle}>
                <h2 style={gridTitleStyle}>Flotte Ennemie</h2>
                <div style={gridStyle}>
                  {Array(GRID_SIZE).fill(null).map((_, row) =>
                    Array(GRID_SIZE).fill(null).map((_, col) => renderCell(row, col, false))
                  )}
                </div>
                <div style={statsStyle}>
                  {enemyShips.filter(s => !s.sunk).length} / {enemyShips.length} navires
                </div>
              </div>
            </div>

            {gameState === 'gameOver' && (
              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <button
                  onClick={() => {
                    setGameState('setup');
                    setPlayerMoney(500);
                    setEnemyMoney(500);
                    setCurrentPlayer('player');
                    initializeGame();
                  }}
                  style={buttonStyle}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#15803d'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#16a34a'}
                >
                  🔄 Nouvelle partie
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BattleShipGame;

 export const timerStyle = {
  backgroundColor: '#1a1a1a',
  color: '#00ff00',
  fontFamily: '"Courier New", monospace',
  fontSize: '24px',
  fontWeight: 'bold',
  padding: '8px 20px',
  borderRadius: '4px',
  border: '2px solid #333',
  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5), 0 0 10px rgba(0,255,0,0.3)',
  letterSpacing: '2px',
  textAlign: 'center',
  minWidth: '120px'
};