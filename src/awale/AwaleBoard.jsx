import React, { useCallback, useEffect, useRef, useState } from 'react';
import './awale.css'; // Importation du fichier CSS
import africaImg from './africa.png';
import { BoardRow, PlayerHouse } from './BoardRow';
import { Box, Button, Card, CardActions, CardContent, CardHeader, Typography } from '@mui/material';
import { GameOver } from '../ChuckNorrisFact';
import { useIsMobile } from '../hookGame';

const defaultBoard = [
    [4, 4, 4, 4, 4, 4], // Rangée du joueur 1 (en bas du plateau)
    [4, 4, 4, 4, 4, 4], // Rangée du joueur 2 (en haut du plateau)
]
const AwaleBoard = ({onFinish, catContext}) => {
    const [board, setBoard] = useState(defaultBoard);

    const [playerUpScore, setPlayerUpScore] = useState(0);
    const [playerDownScore, setPlayerDownScore] = useState(0);
    const [playerUp, setPlayerUp] = useState(0); // Graines récoltées par le joueur du haut
    const [playerDown, setPlayerDown] = useState(0); // Graines récoltées par le joueur du bas
    const [gameStatus, setGameStatus] = useState('ongoing');
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);

    const [currentPlayer, setCurrentPlayer] = useState('playerDown'); // Joueur actuel ('playerUp' ou 'playerDown')
    const lastPlayer = useRef('playerUp');

    const handleHoleClick = useCallback((rowIndex, holeIndex) => {
        if (gameStatus === 'ended') {
            return; // Empêcher les actions si le jeu est terminé
        }
        if (rowIndex == null && holeIndex == null)// no moves from AI, change player
            setCurrentPlayer('playerDown');
        if ((currentPlayer === 'playerUp' && rowIndex !== 0) || (currentPlayer === 'playerDown' && rowIndex !== 1)) {
            return; // Empêcher le mouvement si ce n'est pas le tour du joueur
        }

        let seedsCount = board[rowIndex][holeIndex];
        board[rowIndex][holeIndex] = 0;
        let count = 0;
        const delay = 300; // Temps en millisecondes entre chaque appel à setBoard
        const origseedsCount = seedsCount;
        function updateBoard() {
            if (seedsCount > 0) {
                if (rowIndex === 1) {
                    holeIndex++;
                    if (holeIndex >= board[rowIndex].length) {
                        rowIndex = 0;
                        holeIndex = board[rowIndex].length - 1;
                    }
                } else if (rowIndex === 0) {
                    holeIndex--;
                    if (holeIndex < 0) {
                        rowIndex = 1;
                        holeIndex = 0;
                    }
                }

                board[rowIndex][holeIndex]++;
                seedsCount--;
                setBoard([...board]);

                count++;

                if (count <= origseedsCount) {
                    setTimeout(updateBoard, delay); // Appel récursif avec un délai
                }
                else
                    setTimeout(() => { updateGame(rowIndex, holeIndex, board) }, delay);
            }
            else
                setTimeout(() => { updateGame(rowIndex, holeIndex, board) }, delay);
        }

        updateBoard();

        const updateGame = (ridx, hidx, board) => {
            const { newDownCount, newUpCount } = calculateScore({ lastRowIndex: ridx, lastHoleIndex: hidx, board, currentPlayer, playerDown, playerUp });
            if (currentPlayer === 'playerUp')
                setPlayerUp(newUpCount);
            if (currentPlayer === 'playerDown')
                setPlayerDown(newDownCount);
            // Changer de joueur
            setCurrentPlayer((prevPlayer) => (prevPlayer === 'playerUp' ? 'playerDown' : 'playerUp'));
            setBoard([...board]);

        }
    }, [gameStatus, currentPlayer, board, playerUp, playerDown]);
    // Fonction pour gérer l'abandon de la partie
    const abandonGame = () => {
        // Mettre à jour l'état du jeu pour indiquer que la partie est terminée
        setGameStatus('ended');
        if(typeof onFinish =='function')
            onFinish(currentPlayer === 'playerUp');
        // Incrémenter le score du joueur opposé
        if (currentPlayer === 'playerUp') {
            setPlayerDownScore(playerDownScore + 1);
        } else if (currentPlayer === 'playerDown') {
            setPlayerUpScore(playerUpScore + 1);
        }
    };
    // Fonction pour recommencer une partie
    const restartGame = () => {
        // Réinitialiser les états des joueurs et du jeu
        setGameStatus('ongoing');
        // Réinitialiser le plateau de jeu, s'il y en a un
        setBoard([...defaultBoard]);
        // ...
    };

    // Fonction pour vérifier la condition d'abandon
    const shouldAbandon = (board) => {
        // abandonne si peut plus jouer

        // abandonne si moins de 3 graines sur le plateau (et plus de 2 points d'ecart)
        const grainesRestantesUp = board[0].reduce((rowSum, num) => rowSum + num, 0);
        const grainesRestantesDown =  board[1].reduce((rowSum, num) => rowSum + num, 0);
        return ((grainesRestantesUp==0
                ||grainesRestantesDown==0
                ||(grainesRestantesUp+grainesRestantesDown<=3)))

    };
const isMobile = useIsMobile();
    useEffect(() => {
        if (currentPlayer === 'playerUp' && lastPlayer.current === 'playerDown') {
            // Vérification de la condition d'abandon
            if (shouldAbandon(board)) {
                setScore(playerDown);
                setGameOver(true);
                abandonGame();
            }
            else
                simulatePlayerUp({ board: board, play: handleHoleClick });
        }
        lastPlayer.current = currentPlayer;
    }, [currentPlayer, board,playerDown, handleHoleClick, abandonGame]);

    return (
        <Box sx={{  backgroundImage:`url(${africaImg})`, backgroundSize:'contain', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100dvh', padding: { xs: '10px', md: '20px' }}} >
            {/* Panneau des scores */}
              <GameOver open={gameOver} score={score}  gameName="Awale"
                handleClose={() => { setGameOver(false) }} handleRestart={restartGame} />
            <Box display={'flex'} 
            width={'100%'} justifyContent={'space-evenly'} alignItems={'center'}>

               {onFinish==null && !isMobile && <ScoreCard flex={1} playerUpScore={playerUpScore} playerDownScore={playerDownScore} abandonGame={abandonGame}
                    gameStatus={gameStatus} restartGame={restartGame} />
    }
                <Box sx={{ display: 'flex',gap:1,p:1, flex:3, flexDirection: 'column', alignItems: 'center' }}>

                    <PlayerHouse className={currentPlayer === 'playerUp' ? 'activePlayer' : 'waitingPlayer'}
                        playerName="Mamadou" collectedSeeds={playerUp} />
                    <BoardRow
                        row={board[0]}
                        rowIndex={0}
                        handleHoleClick={handleHoleClick}
                        disabled={currentPlayer === 'playerDown'}
                    />
                    <BoardRow
                        row={board[1]}
                        rowIndex={1}
                        handleHoleClick={handleHoleClick}
                        disabled={currentPlayer === 'playerUp'}
                    />
                    <PlayerHouse className={currentPlayer === 'playerUp' ? 'activePlayer' : 'waitingPlayer'}
                        playerName="Vous" collectedSeeds={playerDown} />
                </Box>
            </Box>
             {onFinish==null && isMobile && <ScoreCard flex={1} playerUpScore={playerUpScore} playerDownScore={playerDownScore} abandonGame={abandonGame}
                    gameStatus={gameStatus} restartGame={restartGame} />}
        </Box>
    );
};

export default AwaleBoard;

const ScoreCard = ({ playerUpScore, playerDownScore, abandonGame, gameStatus, restartGame, ...props }) => {
    return <Card sx={{backgroundColor:'#dfc48b', height:'fit-content'}} {...props}>
        <CardHeader sx={{backgroundColor:'#b5954fff'}}
         title="Score" subheader={gameStatus==='ended'?'FIN de partie':''} />
        <CardContent className="card-content">
            <Box display={'flex'} flexDirection={'column'} >
                <Box display={'flex'} flexDirection={'row'} alignItems={'center'}>
                    Mamadou: <Typography padding={4} variant='h6' color="secondary"> {playerUpScore} </Typography> Victoires
                </Box>
                <Box display={'flex'} flexDirection={'row'} alignItems={'center'}>
                    Vous: <Typography padding={4} variant='h6' color="secondary"> {playerDownScore} </Typography>  Victoires
                </Box>

            </Box>
        </CardContent>
        {/* Boutons d'abandonner et recommencer */}
        <CardActions className="card-actions">
            <Button variant="outlined" onClick={abandonGame} disabled={gameStatus === 'ended'}>
                Abandonner
            </Button>
            <Button variant="outlined" onClick={restartGame} disabled={gameStatus === 'ongoing'}>
                Recommencer
            </Button>
        </CardActions>
    </Card>
}
const simulatePlayerUp = ({ board, play }) => {
    // Copiez le plateau actuel pour effectuer la simulation
    const simulatedBoard = JSON.parse(JSON.stringify(board));
    const availableTrous = [];
    simulatedBoard[0].forEach((t, idx) => {
        if (t > 0)
            availableTrous.push(idx);
    })
    let bestMove = null;
    let bestScore = -Infinity;

    // Parcourez tous les mouvements possibles pour le joueur UP
    for (let rowIndex = 0; rowIndex < simulatedBoard.length; rowIndex++) {
        for (let holeIndex = 0; holeIndex < simulatedBoard[rowIndex].length; holeIndex++) {
            if (rowIndex === 1) continue; // Ignore les mouvements invalides pour le joueur UP

            if (simulatedBoard[rowIndex][holeIndex] > 0) {
                // Effectuez la simulation du mouvement
                let seedsCount = simulatedBoard[rowIndex][holeIndex];
                simulatedBoard[rowIndex][holeIndex] = 0;

                let currentRowIndex = rowIndex;
                let currentHoleIndex = holeIndex;

                while (seedsCount > 0) {
                    // Mettez à jour les indices pour simuler la capture et le déplacement des graines

                    // = (currentHoleIndex + 1) % simulatedBoard[currentRowIndex].length;
                    if (currentRowIndex === 0) {
                        currentHoleIndex--;
                        if (currentHoleIndex < 0) {
                            currentHoleIndex = 0;
                            currentRowIndex = 1;
                        }
                    }
                    else
                        currentHoleIndex++;
                    simulatedBoard[currentRowIndex][currentHoleIndex]++;
                    seedsCount--;

                  
                    if (currentHoleIndex === simulatedBoard[currentRowIndex].length - 1) {// derniere de la ligne adverse
                        // simulate distribution sur tout la ligne qui nous interesse pas
                        seedsCount -= 6;
                    }
                }
                  // Évaluez l'état résultant du plateau (vous pouvez utiliser d'autres critères d'évaluation)
                  if (seedsCount <= 0) {

                    const score = evaluateBoard(simulatedBoard, holeIndex, currentRowIndex);

                    if (score > bestScore) {
                        bestScore = score;
                        if (score === 0) {
                            //choose randomly in aval trous
                            bestMove = { rowIndex, holeIndex: availableTrous[availableTrous.length - 1] };
                        }
                        else
                            bestMove = { rowIndex, holeIndex };
                    }
                }
            }
        }
    }

    // Effectuez le meilleur mouvement sur le plateau réel
    if (bestMove) {
        play(bestMove.rowIndex, bestMove.holeIndex);
    }
    else {
        // no move, on passe la main
        play();
    }
};

const evaluateBoard = (board, lastHoleIndex, lastRowIndex) => {
    // Retournez le score calculé

    // Exemple simple : retourner la somme des graines capturées par le joueur UP
    let upScore = 0;
    for (let holeIndex = 0; holeIndex < board[0].length; holeIndex++) {
        const { newUpCount } = calculateScore({ lastRowIndex, lastHoleIndex, board, currentPlayer: 'playerUp', playerDown: 0, playerUp: 0 });
        upScore += newUpCount;
    }
    return upScore;
};

const calculateScore = ({ lastRowIndex, lastHoleIndex, board, currentPlayer, playerDown, playerUp }) => {


    let newDownCount = playerDown;
    let newUpCount = playerUp;
    const lastSeedsCount = board[lastRowIndex][lastHoleIndex];

    if ((currentPlayer === 'playerUp' && lastRowIndex === 1) || (currentPlayer === 'playerDown' && lastRowIndex === 0)) {
        if (lastSeedsCount === 3 || lastSeedsCount === 2) {
            board[lastRowIndex][lastHoleIndex] = 0;

            if (currentPlayer === 'playerUp') {
                newUpCount += lastSeedsCount;

                // on regarde vers la gauche si on peut encore ramasser
                let prevHole = lastHoleIndex - 1;
                let prevSeedCount = board[lastRowIndex][prevHole];

                while (prevHole >= 0 && (prevSeedCount === 2 || prevSeedCount === 3)) {
                    board[lastRowIndex][prevHole] = 0;
                    newUpCount += prevSeedCount;
                    prevHole--;
                    prevSeedCount = board[lastRowIndex][prevHole];

                }

            } else if (currentPlayer === 'playerDown') {
                newDownCount += lastSeedsCount;
                // on regarde vers la gauche si on peut encore ramasser
                let prevHole = lastHoleIndex + 1;
                let prevSeedCount = board[lastRowIndex][prevHole];

                while (prevHole <= 5 && (prevSeedCount === 2 || prevSeedCount === 3)) {
                    board[lastRowIndex][prevHole] = 0;
                    newDownCount += prevSeedCount;
                    prevHole++;
                    prevSeedCount = board[lastRowIndex][prevHole];

                }

            }


        }
    }
    return { newDownCount: newDownCount, newUpCount: newUpCount }
}