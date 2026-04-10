import React, { useState, useEffect, useMemo } from 'react';
import { Box, Button } from '@mui/material';
import Tile from './Tile2048';
import  { Score2048 } from './GameOverPanel';
import { GameOver } from '../ChuckNorrisFact';



// Fonction pour calculer les dimensions de la grille en fonction de la taille de l'écran
const calculateGridDimensions = () => {
    const w = window.innerWidth - 16;  // marge latérale
    const h = window.innerHeight - 120; // marge pour le panneau score au-dessus
    return Math.min(w, h);
};
// Fonction pour générer des positions aléatoires
function getRandomPositions(GRID_SIZE, count) {
    const positions = [];
    while (positions.length < count) {
        const newPosition = [Math.floor(Math.random() * GRID_SIZE), Math.floor(Math.random() * GRID_SIZE)];
        if (!positions.some(pos => pos[0] === newPosition[0] && pos[1] === newPosition[1])) {
            positions.push(newPosition);
        }
    }
    return positions;
}


const MainBoard = ({ grid, previousGrid, lastSwipe, GRID_SIZE }) => {
    const [gridSize, setGridSize] = useState(calculateGridDimensions);

    useEffect(() => {
        const handleResize = () => setGridSize(calculateGridDimensions());
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
            width: gridSize,
            height: gridSize,
            userSelect: 'none',
            margin: 'auto',
            gap: 2,
            backgroundColor: '#bbada0',
            borderRadius: 6,
            padding: 4,
        }}>
            {grid.map((row, rowIndex) =>
                row.map((value, colIndex) => {
                    let prevDir = (previousGrid == null || value === previousGrid[rowIndex][colIndex]) ? null : lastSwipe;
                    return (
                        <div key={`${rowIndex}-${colIndex}`} style={{
                            display: 'flex',
                            backgroundColor: '#cdc1b4',
                            borderRadius: 4,
                        }}>
                            <Tile value={value} comeFrom={prevDir} />
                        </div>
                    );
                })
            )}
        </div>
    );
}
const newGrid = (GRID_SIZE) => {
    const newGrid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
    // Générer deux positions aléatoires et les remplir
    const randomPositions = getRandomPositions(2);
    randomPositions.forEach(position => {
        newGrid[position[0]][position[1]] = Math.random() < 0.5 ? 2 : 4;
    });
    return newGrid;
}

const GameBoardMgr = () => {

    const [gridSize, setGridSize] = useState(4);
    const startGrid = newGrid(gridSize);
    const [grid, setGrid] = useState(startGrid);
    const [gameOver, setGameOver] = useState(false);
    const [previousGrid, setPreviousGrid] = useState(grid);
    const [score, setScore] = useState(0);
    const [lastSwipe, setLastSwipe] = useState(null);

    const reset = () => {
        setGrid(newGrid(gridSize));
        setPreviousGrid(null);
        setScore(0);
    }
    useEffect(() => {
        reset();
    }, [gridSize]);
    return <Box sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: { xs: 'center', md: 'flex-start' },
      flexDirection: { xs: 'column', md: 'row' },
      gap: { xs: 1, md: 4 },
      m: 1,
    }}>

        <GameOver open={gameOver} gameName="2048" score={score} handleClose={() => { setGameOver(false) }} handleRestart={reset} />
        <Score2048 score={score} handleRestart={reset} lastSwipe={lastSwipe} gridSize={gridSize} setGridSize={setGridSize} />
        <GameBoard grid={grid} setGrid={setGrid} previousGrid={previousGrid} setPreviousGrid={setPreviousGrid} 
         gridSize={gridSize} setLastSwipe={setLastSwipe} lastSwipe={lastSwipe}
            setGameOver={setGameOver}
            setScore={setScore} />

    </Box>
}
const GameBoard = ({ grid, setGrid, gridSize, setLastSwipe, setScore, setGameOver, lastSwipe,setPreviousGrid,previousGrid }) => {


    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState(null);

    // ── Détection de direction à partir de deux points ──
    const resolveDir = (startXY, endXY) => {
        const dx = endXY[0] - startXY[0];
        const dy = endXY[1] - startXY[1];
        if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return null; // trop petit = clic accidentel
        if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left';
        return dy > 0 ? 'down' : 'up';
    };

    const handleMouseDown = (event) => {
        setIsDragging(true);
        setDragStart([event.clientX, event.clientY]);
    };
    const handleMouseUp = (event) => {
        const dir = resolveDir(dragStart, [event.clientX, event.clientY]);
        if (dir) sendSwipe(dir);
        setIsDragging(false);
    };

    // ── Touch (mobile) ──
    const handleTouchStart = (event) => {
        const t = event.touches[0];
        setDragStart([t.clientX, t.clientY]);
    };
    const handleTouchEnd = (event) => {
        const t = event.changedTouches[0];
        const dir = resolveDir(dragStart, [t.clientX, t.clientY]);
        if (dir) sendSwipe(dir);
    };
    const sendSwipe = dir => {
        setPreviousGrid(JSON.parse(JSON.stringify(grid)));
        handleSwipe(dir);
        setLastSwipe(dir);
    }
    const handleSwipe = (direction) => {


        // Calculer la nouvelle grille
        const _newGrid = moveTiles(grid, direction);
        setScore(grid.flat().reduce((total, value) => total + value, 0));

        setGrid(_newGrid);
        // setIsAnimating(true);
        // animationRef.current = requestAnimationFrame(animate);

    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            switch (event.key) {
                case 'ArrowUp':
                    sendSwipe('up');
                    break;
                case 'ArrowDown':
                    sendSwipe('down');
                    break;
                case 'ArrowLeft':
                    sendSwipe('left');
                    break;
                case 'ArrowRight':
                    sendSwipe('right');
                    break;
                default:

                    return;
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);

        };
    }, [sendSwipe]);
    useEffect(() => {
        // add new Tile each swap

        const newGrid = [...grid]; // Créer une copie pour ne pas modifier l'original

        // Trouver une case vide aléatoire
        const emptyCells = [];
        for (let i = 0; i < grid.length; i++) {
            for (let j = 0; j < grid[0].length; j++) {
                if (newGrid[i][j] === 0) {
                    emptyCells.push({ row: i, col: j });
                }
            }
        }

        if (emptyCells.length === 0) {
            setGameOver(true);
            return newGrid; // La grille est pleine, on ne peut rien ajouter
        }

        // Choisir une case aléatoire parmi les cases vides
        let randomIndex = Math.floor(Math.random() * emptyCells.length);
        const { row, col } = emptyCells[randomIndex];
        // Assigner une valeur aléatoire (2 ou 4) à la case choisie
        newGrid[row][col] = Math.random() < 0.5 ? 2 : 4;
        if (gridSize > 5) {
            randomIndex = Math.floor(Math.random() * emptyCells.length);
            const { row: row2, col: col2 } = emptyCells[randomIndex];
            // Assigner une valeur aléatoire (2 ou 4) à la case choisie
            if (newGrid[row2][col2] === 0)
                newGrid[row2][col2] = Math.random() < 0.5 ? 4 : 8;
        }
        if (gridSize > 10) {
            randomIndex = Math.floor(Math.random() * emptyCells.length);
            const { row: row3, col: col3 } = emptyCells[randomIndex];
            // Assigner une vleur aléatoire (2 ou 4) à la case choisie
            if (newGrid[row3][col3] === 0)
                newGrid[row3][col3] = Math.random() < 0.5 ? 8 : 16;
        }

        setGrid(newGrid);
        return;
    }, [lastSwipe]);


    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'start' }}>

            <div onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}
                onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}
                style={{ touchAction: 'none' }}>
                <MainBoard grid={grid} GRID_SIZE={gridSize}
                    previousGrid={previousGrid} lastSwipe={lastSwipe} />
            </div>
        </Box>
    );
}
export default GameBoardMgr;


function moveTiles(grid, direction) {
    const newGrid = [...grid]; // Créer une copie pour ne pas modifier la grille originale

    // Déterminer la fonction de comparaison et le sens de parcours en fonction de la direction
    let compare, iStart, iEnd, jStart, jEnd, iInc, jInc;
    switch (direction) {
        case 'left':
            compare = (a, b) => a > b;
            iStart = 0;
            iEnd = grid.length;
            jStart = 0;
            jEnd = grid[0].length;
            iInc = 1;
            jInc = 1;
            break;
        case 'right':
            compare = (a, b) => a > b;
            iStart = 0;
            iEnd = grid.length;
            jStart = grid[0].length - 1;
            jEnd = -1;
            iInc = 1;
            jInc = -1;
            break;
        case 'up':
            compare = (a, b) => a > b;
            iStart = 0;
            iEnd = grid[0].length;
            jStart = 0;
            jEnd = grid.length;
            iInc = 1;
            jInc = 1;
            break;
        case 'down':
            compare = (a, b) => a > b;
            iStart = grid.length - 1;
            iEnd = -1;
            jStart = 0;
            jEnd = grid.length;
            iInc = -1;
            jInc = 1;
            break;
        default:
    }

    for (let i = iStart; i !== iEnd; i += iInc) {
        for (let j = jStart; j !== jEnd; j += jInc) {
            let current = newGrid[i][j];
            if (current === 0) continue;

            let next = j;
            if (direction === 'up' || direction === 'down') {
                next = i; // Pour les mouvements verticaux, on modifie l'indice de ligne

                while (next !== (iStart - iInc) && next !== iEnd && (newGrid[next - iInc]?.[j] === 0 || newGrid[next - iInc]?.[j] === current)) {
                    next -= iInc;
                }

                if (next !== i && next !== (iStart - iInc) && next !== iEnd && newGrid[next]?.[j] === current) {
                    newGrid[next][j] *= 2;
                    newGrid[i][j] = 0;
                }
                else if (next !== i) {

                    newGrid[next][j] = current;
                    newGrid[i][j] = 0;
                }
            }
            else {// left or right
                next = j; // Pour les mouvements horiz, on modifie l'indice de col

                while (next !== (jStart - jInc) && next !== jEnd && (newGrid[i][next - jInc] === 0 || newGrid[i][next - jInc] === current)) {
                    next -= jInc;
                }

                if (next !== j && next !== (jStart - jInc) && next !== jEnd && newGrid[i][next] === current) {
                    newGrid[i][next] *= 2;
                    newGrid[i][j] = 0;
                }
                else if (next !== j) {
                    newGrid[i][next] = current;
                    newGrid[i][j] = 0;
                }
            }
        }
    }

    return newGrid;
}