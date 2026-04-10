import React, { useEffect, useState } from 'react';
import './Board.css';
import { Alert, Snackbar } from '@mui/material';
import { useIsMobile } from '../hookGame';

export const ROWS = 6;
export const COLS = 7;

const Board = ({ currentPlayer, onWinner, onPlayerChange, clear, thinking }) => {
    const [board, setBoard] = useState(Array(ROWS).fill(Array(COLS).fill(null)));
    const [disabled, setDisabled] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [fallingToken, setFallingToken] = useState(null);
    const isMobile = useIsMobile();
    const playAI = () => {
        const emptyColumns = [];
        for (let col = 0; col < COLS; col++) {
            if (!board[0][col]) {
                emptyColumns.push(col);
            }
        }

        if (emptyColumns.length > 0) {
            let bestScore = -Infinity;
            let bestCol = -1;//emptyColumns[0];

            const pireCols = [];
            emptyColumns.forEach((col) => {
                const newBoard = makeMove(board, col, currentPlayer);
                const score = minimax(newBoard, 5, true, -Infinity, Infinity);//on joue pour l'AI on est le MaximizingPlayer
                const scoreUser = minimax(newBoard, 5, false, -Infinity, Infinity);//on joue pour l'AI on est le MaximizingPlayer

                if (score > bestScore) {
                    bestScore = score;
                    bestCol = col;
                }

                if (scoreUser < bestScore) {
                    pireCols.push(col);
                }

            });
            if (bestScore <= 0) {
                const availableCols = emptyColumns.filter((col) => !pireCols.includes(col));
                if (availableCols.length > 0) {
                    let highestScore = -Infinity;
                    let highestScoreCol = availableCols[0];

                    availableCols.forEach((col) => {
                        const newBoard = makeMove(board, col, currentPlayer);
                        const score = minimax(newBoard, 5, true, -Infinity, Infinity);

                        if (score > highestScore) {
                            highestScore = score;
                            highestScoreCol = col;
                        }
                    });

                    bestCol = highestScoreCol;
                }
            }
            if (bestCol <= 0)
                bestCol = Math.floor(Math.random() * COLS);

            handleColumnClick(bestCol);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (fallingToken?.col != null) {
                const newBoard = fallingToken.board;
                setBoard(newBoard);
                if (checkWinner(newBoard, currentPlayer)) {
                    setDisabled(true);
                    onWinner(currentPlayer);
                }
                else {

                    onPlayerChange();
                }
                setFallingToken(null); // Arrête l'animation du jeton tombant après un certain délai
            }
        }, 300);

        return () => clearTimeout(timer);
    
  }, [currentPlayer, fallingToken, onPlayerChange, onWinner]);

useEffect(() => {
    if (clear) {
        // Effectuer les étapes de réinitialisation ici
        setBoard(Array(ROWS).fill(Array(COLS).fill(null)));
        setDisabled(false);
    }
}, [clear]);
useEffect(() => {
    if (thinking) {
        // Effectuer les étapes de réinitialisation ici
        setDisabled(true);
    }
    else {
        if (disabled)// previously disabled, donc thinking
            playAI();
        setDisabled(false);

    }
}, [thinking]);

const handleColumnClick = (colIndex) => {
    if (disabled && thinking) {
        setSnackbarOpen(true);
        return;
    }
    if (board[0][colIndex]) {
        return;
    }

    const newBoard = board.map((row) => [...row]); // Créer une copie en profondeur du tableau

    for (let row = ROWS - 1; row >= 0; row--) {
        if (!newBoard[row][colIndex]) {
            newBoard[row][colIndex] = currentPlayer;
            break;
        }
    }
    setFallingToken({ col: colIndex, board: newBoard });

};

const handleSnackbarClose = () => {
    setSnackbarOpen(false);
};


const renderBoard = () => {
    
    return board.map((row, rowIndex) => (
        
        <div key={rowIndex} className="rowp4">
            {row.map((cell, colIndex) => {
                   const cellClass = `${isMobile?'cellp4Mob':'cellp4'} ${colIndex === fallingToken?.col ? 'falling' : ''} ${cell ?? ''}`;
     
                 const delay = fallingToken?.col === colIndex ? rowIndex * 0.5 + 's' : '0s';
                 const pulseAnimation = `
                 @keyframes pulse-${rowIndex}-${colIndex} {
                   0% {
                     background-color: transparent;
                   }
                   ${rowIndex}0% {
                     background-color: ${cell??currentPlayer??'transparent'}; /* ou la couleur correspondante */
                   }
                   100% {
                     background-color: transparent;
                   }
                 }
               `;
               const animStyle={
                transitionDelay: delay,
                animation: colIndex === fallingToken?.col ? `pulse-${rowIndex}-${colIndex} 0.${('1'+rowIndex*3)}s linear` : 'none',
              }
               return (
                <React.Fragment key={colIndex}>
                  <style>{pulseAnimation}</style>
                  <div
                    className={cellClass}
                    style={cell==null&&colIndex === fallingToken?.col?animStyle:null}
                    onClick={() => handleColumnClick(colIndex)}
                  />
                </React.Fragment>
              );
            }
                
            )}
        </div>
    ));
};

return (
    <div className={`boardp4 ${disabled ? 'disabled' : ''}`}>
        {renderBoard()}
        <Snackbar
            open={snackbarOpen}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            autoHideDuration={3000}
            onClose={handleSnackbarClose}
        ><Alert severity='warning'>Ca sert a rien de cliquer, le jeu est fini.</Alert></Snackbar>
    </div>
);
};

export default Board;

const evaluateBoard = (board, winner) => {
    if (winner === 'yellow') {
        return 100;
    } else if (winner === 'red') {
        return -100;
    } else {
        return 0;
    }
};
const findBottomEmptyRow = (board, col) => {
    for (let row = ROWS - 1; row >= 0; row--) {
        if (!board[row][col]) {
            return row;
        }
    }
    return -1;
};

const makeMove = (board, col, player) => {
    const newBoard = board.map((row) => [...row]);
    const row = findBottomEmptyRow(newBoard, col);

    if (row !== -1) {
        newBoard[row][col] = player;
    }

    return newBoard;
};
const minimax = (board, depth, isMaximizingPlayer, alpha, beta) => {
    let winner = null;
    if (checkWinner(board, isMaximizingPlayer ? 'red' : 'yellow'))
        winner = isMaximizingPlayer ? 'red' : 'yellow';

    if (depth === 0 || winner) {
        return evaluateBoard(board, winner);
    }

    if (isMaximizingPlayer) {
        let bestScore = -Infinity;

        for (let col = 0; col < COLS; col++) {
            if (!board[0][col]) {
                const newBoard = makeMove(board, col, 'yellow');
                const score = minimax(newBoard, depth - 1, false, alpha, beta);
                bestScore = Math.max(bestScore, score);
                alpha = Math.max(alpha, bestScore);

                if (alpha >= beta) {
                    break;
                }
            }
        }

        return bestScore;
    } else {
        let bestScore = Infinity;

        for (let col = 0; col < COLS; col++) {
            if (!board[0][col]) {
                const newBoard = makeMove(board, col, 'red');
                const score = minimax(newBoard, depth - 1, true, alpha, beta);
                bestScore = Math.min(bestScore, score);
                beta = Math.min(beta, bestScore);

                if (beta <= alpha) {
                    break;
                }
            }
        }

        return bestScore;
    }
};


const checkWinner = (board, player) => {
    // Vérifier les lignes horizontales
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col <= COLS - 4; col++) {
            if (
                board[row][col] === player &&
                board[row][col + 1] === player &&
                board[row][col + 2] === player &&
                board[row][col + 3] === player
            ) {
                return true;
            }
        }
    }

    // Vérifier les lignes verticales
    for (let col = 0; col < COLS; col++) {
        for (let row = 0; row <= ROWS - 4; row++) {
            if (
                board[row][col] === player &&
                board[row + 1][col] === player &&
                board[row + 2][col] === player &&
                board[row + 3][col] === player
            ) {
                return true;
            }
        }
    }

    // Vérifier les diagonales (\)
    for (let row = 0; row <= ROWS - 4; row++) {
        for (let col = 0; col <= COLS - 4; col++) {
            if (
                board[row][col] === player &&
                board[row + 1][col + 1] === player &&
                board[row + 2][col + 2] === player &&
                board[row + 3][col + 3] === player
            ) {
                return true;
            }
        }
    }

    // Vérifier les diagonales (/)
    for (let row = 0; row <= ROWS - 4; row++) {
        for (let col = 3; col < COLS; col++) {
            if (
                board[row][col] === player &&
                board[row + 1][col - 1] === player &&
                board[row + 2][col - 2] === player &&
                board[row + 3][col - 3] === player
            ) {
                return true;
            }
        }
    }

    return false;
};
