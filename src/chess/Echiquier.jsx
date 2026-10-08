import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { Case } from '../dames/Case';
import Piece from './Piece';
import { isCheckmate, isInsufficientMaterial, isKingInCheck, isStalemate } from './reflexions';
import { applyMove, getAllLegalMoves } from './movements';
import { useChess } from './ChessContext';
import { DialogPromotion, PuzzleSuccess } from './ParamDialog';
import { soundManager } from '../rpg/sons/SoundManager';

const Echiquier = ({ reset, gameOver }) => {
    const { setEchec, setCaptured, setMessage, difficulte
        , humanReadableMove, logHistory, joueurEstBlanc, puzzle, puzzleManager, startPuzzle
        , cases, setCases, tourBlancs, setTourBlancs, openingManager
        , setMoveCount, enPassantTarget, setEnPassantTarget, gameFinished, setGameFinished, positionVersion } = useChess();

    const taille = 8; // Nombre de cases par ligne et colonne
    const [highlightedCase, setHighlightedCase] = useState(null);
    const [caseJouable, setCaseJouable] = useState(null);
    const [pionSelectionne, setPionSelectionne] = useState(null); // Variable pour suivre le pion sélectionné par l'utilisateur
    const [lastMove, setLastMove] = useState(null);
    const [pendingPromotion, setPendingPromotion] = useState(null); // null ou { x, y, pion, board }
    const [puzzleScore, setPuzzleScore] = useState(0);
    const [puzzleSolved, setPuzzleSolved] = useState(false);
    const [puzzleReply, setPuzzleReply] = useState(null);
    const humanColor = joueurEstBlanc ? 'white' : 'black';
    const currentColor = tourBlancs ? 'white' : 'black';
    const isHumanTurn = currentColor === humanColor;



    // Fonction pour initialiser le tableau cases avec les pions blancs et noirs
    const initialiserCases = () => {
        const casesInitiales = Array.from({ length: taille }, () => Array(taille).fill(null));
        //ligne noir
        casesInitiales[0] = [
            { type: 'tour', couleur: 'black', id: `tourNoirA8`, hasMoved: false, x: 0, y: 0 },
            { type: 'cavalier', couleur: 'black', id: `cavalierNoirB8`, hasMoved: false, x: 1, y: 0 },
            { type: 'fou', couleur: 'black', id: `fouNoirC8`, hasMoved: false, x: 2, y: 0 },
            { type: 'reine', couleur: 'black', id: `reineNoirD8`, hasMoved: false, x: 3, y: 0 },
            { type: 'roi', couleur: 'black', id: `roiNoirE8`, hasMoved: false, x: 4, y: 0 },
            { type: 'fou', couleur: 'black', id: `fouNoirF8`, hasMoved: false, x: 5, y: 0 },
            { type: 'cavalier', couleur: 'black', id: `cavalierNoirG8`, hasMoved: false, x: 6, y: 0 },
            { type: 'tour', couleur: 'black', id: `tourNoirH8`, hasMoved: false, x: 7, y: 0 }];
        //ligne pions noirs
        casesInitiales[1] = Array(taille).fill(null).map((_, x) => ({ type: 'pion', couleur: 'black', hasMoved: false, x, y: 1, id: `pionNoir${x}` }));
        //ligne pions blancs   
        casesInitiales[6] = Array(taille).fill(null).map((_, x) => ({ type: 'pion', couleur: 'white', hasMoved: false, x, y: 6, id: `pionBlanc${x}` }));
        //ligne blanche
        casesInitiales[7] = [
            { type: 'tour', couleur: 'white', id: `tourBlancA1`, hasMoved: false, x: 0, y: 7 },
            { type: 'cavalier', couleur: 'white', id: `cavalierBlancB1`, hasMoved: false, x: 1, y: 7 },
            { type: 'fou', couleur: 'white', id: `fouBlancC1`, hasMoved: false, x: 2, y: 7 },
            { type: 'reine', couleur: 'white', id: `reineBlancD1`, hasMoved: false, x: 3, y: 7 },
            { type: 'roi', couleur: 'white', id: `roiBlancE1`, hasMoved: false, x: 4, y: 7 },
            { type: 'fou', couleur: 'white', id: `fouBlancF1`, hasMoved: false, x: 5, y: 7 },
            { type: 'cavalier', couleur: 'white', id: `cavalierBlancG1`, hasMoved: false, x: 6, y: 7 },
            { type: 'tour', couleur: 'white', id: `tourBlancH1`, hasMoved: false, x: 7, y: 7 }];


        setCases(casesInitiales);
    };
    // Initialisation d'une partie ou d'un puzzle : les coordonnées du moteur restent fixes.
    useEffect(() => {
        if (puzzle) {
            setCases(JSON.parse(JSON.stringify(puzzle.position)));
        } else {
            initialiserCases();
        }
        setTourBlancs(true);
        setEnPassantTarget(null);
        setGameFinished(false);
        setCaptured({ white: [], black: [] });
        setEchec(false);
        setMoveCount(0);
        setPuzzleScore(0);
        setPuzzleSolved(false);
        setPuzzleReply(null);
        setMessage(puzzle ? "C'est parti pour le " + puzzle.name : "Serrage de mains, on commence !");
    }, [reset, joueurEstBlanc, puzzle]);

    useEffect(() => {
        setCaseJouable(null);
        setPionSelectionne(null);
        setLastMove(null);
        setPendingPromotion(null);
        setPuzzleReply(null);
    }, [reset, joueurEstBlanc, puzzle, positionVersion]);

    const handleClickCase = (x, y) => {
        if (gameFinished || !isHumanTurn || pendingPromotion || puzzleReply || puzzleSolved) return;
        const pion = cases[y][x];
        if (pion?.couleur === humanColor) {
            setPionSelectionne(pion);
        } else if (pionSelectionne && caseJouable?.some(c => c.x === x && c.y === y)) {
            deplacerPion(pionSelectionne.x, pionSelectionne.y, x, y);
        } else {
            setPionSelectionne(null);
            setCaseJouable(null);
        }
    };

    useEffect(() => {
        if (!pionSelectionne || !isHumanTurn || gameFinished) {
            setCaseJouable(null);
            return;
        }
        const jouables = getAllLegalMoves(humanColor, cases, { pieceId: pionSelectionne.id, enPassantTarget });
        setCaseJouable(jouables.map(move => move.to));
    }, [pionSelectionne, cases, isHumanTurn, humanColor, enPassantTarget, gameFinished]);

    function checkCaptureAndCheck(damier, caseArrivee, joueur, state) {
        const adversaire = joueur === 'white' ? 'black' : 'white';

        // === 1. Capture ? ===
        if (caseArrivee && caseArrivee.couleur === adversaire) {
            // Mise à jour des pièces capturées
            setCaptured(prev => {
                return { ...prev, [joueur]: [...prev[joueur], caseArrivee.type] };
            });
            let bonSon = null;
            if (caseArrivee.type === 'fou' || caseArrivee.type === 'cavalier') {
                bonSon = adversaire == 'white' ? 'muhaha' : 'damn';
            }
            if (caseArrivee.type === 'tour' || caseArrivee.type === 'reine') {
                bonSon = adversaire == 'white' ? 'muhaha2' : 'nonono';
            }
            if (bonSon != null)
                soundManager.play(bonSon);
            setMessage(`Prise de ${caseArrivee.type} ${adversaire} !`);
        }
        const board = JSON.parse(JSON.stringify(damier));
        // === 2. Roi adverse est-il en échec ? ===
        if (isKingInCheck(board, adversaire)) {
            setEchec(true);
            soundManager.play('echec');
            setMessage(`Échec au roi ${adversaire} !`);
        } else {
            setEchec(false);
            // on ne vide pas le message si c'était une prise juste avant
            setMessage(prev => (prev?.startsWith("Prise") ? prev : null));
        }
        if(puzzle)
            return;// l'echec et mat est gere par le puzzle

        // === 3. Roi adverse est-il échec et mat ? ===    
        if (isCheckmate(board, adversaire, state)) {
            setMessage(`Échec et mat ! Victoire des ${joueur} !`);
            soundManager.play('etMat');
            gameOver("Echec et mat !", joueur, damier);
            return;
        }
        // === 4. Roi adverse est-il pat ? ===
        if (isStalemate(board, adversaire, state)) {
            setMessage(`Pat ! Match nul !`);
            gameOver("Pat !", null, damier);
            return;
        }
        // === 5. Insuffisance de matériel ? ===
        if (isInsufficientMaterial(board)) {
            setMessage(`Partie nulle par insuffisance de matériel !`);
            gameOver("Partie nulle !", null, damier);
            return;
        }
    }


    const commitMove = (move, result) => {
        const newBoard = cases.map(row => [...row]);
        const state = { enPassantTarget };
        const undo = applyMove(move, newBoard, state);
        soundManager.play('glisse');
        setCases(newBoard);
        setEnPassantTarget(state.enPassantTarget);
        setLastMove({ id: newBoard[move.to.y][move.to.x].id, from: move.from, to: move.to });
        setTourBlancs(move.piece.couleur !== 'white');
        setPionSelectionne(null);
        setCaseJouable(null);
        setMoveCount(prev => prev + 1);
        checkCaptureAndCheck(newBoard, undo.captured, move.piece.couleur, state);
        if (result) {
            setMessage(result.message);
            // L'effet applique les réponses successivement sur le plateau courant.
            setPuzzleReply({ moves: result.autoMoves || [], solved: result.solved, score: result.score });
        }
    };

    const playHumanMove = move => {
        const managerMove = {
            from: { row: move.from.y, col: move.from.x },
            to: { row: move.to.y, col: move.to.x }
        };
        if (puzzle) {
            const result = puzzleManager.validateMove(managerMove);
            if (!result.valid) {
                setMessage(result.message);
                setPionSelectionne(null);
                setCaseJouable(null);
                return;
            }
            commitMove(move, result);
            return;
        }
        // Enregistrer aussi l'état du gestionnaire avant la validation de l'ouverture.
        const openingState = { openingIndex: openingManager.moveIndex, openingActive: openingManager.isActive };
        const validation = openingManager.validatePlayerMove(managerMove, humanColor);
        if (!validation.valid) {
            setMessage(validation.message);
            return;
        }
        logHistory(openingState);
        commitMove(move);
        if (validation.message) setMessage(validation.message);
    };

    const deplacerPion = (xDepart, yDepart, xArrivee, yArrivee) => {
        if (gameFinished || !isHumanTurn || pendingPromotion || puzzleReply) return;
        const movingPiece = cases[yDepart][xDepart];
        const candidates = getAllLegalMoves(humanColor, cases, { pieceId: movingPiece?.id, enPassantTarget });
        const move = candidates.find(candidate => candidate.from.x === xDepart && candidate.from.y === yDepart &&
            candidate.to.x === xArrivee && candidate.to.y === yArrivee);
        if (!move) return;
        if (move.promotion) {
            setPendingPromotion(move);
            return;
        }
        playHumanMove(move);
    };

    const handlePromotionChoice = type => {
        if (!pendingPromotion || gameFinished) return;
        const move = { ...pendingPromotion, promotion: type };
        setPendingPromotion(null);
        playHumanMove(move);
    };

    useEffect(() => {
        if (gameFinished || puzzle || isHumanTurn || cases.length !== 8 || pendingPromotion) return;
        const timeout = setTimeout(() => {
            const damier = cases.map(row => [...row]);
            const bestMove = openingManager.getAIMove(damier, currentColor, difficulte, { enPassantTarget });
            if (!bestMove) return;
            const from = { x: bestMove.from.col ?? bestMove.from.x, y: bestMove.from.row ?? bestMove.from.y };
            const to = { x: bestMove.to.col ?? bestMove.to.x, y: bestMove.to.row ?? bestMove.to.y };
            // Les coups du livre passent eux aussi par la validation du moteur.
            const move = getAllLegalMoves(currentColor, cases, { enPassantTarget }).find(candidate =>
                candidate.from.x === from.x && candidate.from.y === from.y && candidate.to.x === to.x &&
                candidate.to.y === to.y && (!bestMove.promotion || candidate.promotion === bestMove.promotion));
            if (move) commitMove(move);
        }, 60);
        return () => clearTimeout(timeout);
    }, [cases, tourBlancs, joueurEstBlanc, puzzle, gameFinished, pendingPromotion, enPassantTarget, reset, positionVersion, difficulte]);

    useEffect(() => {
        if (!puzzleReply || gameFinished) return;
        const timeout = setTimeout(() => {
            if (puzzleReply.moves.length === 0) {
                if (puzzleReply.solved) {
                    soundManager.play('etMat');
                    setPuzzleScore(puzzleReply.score);
                    setPuzzleSolved(true);
                }
                setPuzzleReply(null);
                return;
            }
            const [reply, ...remaining] = puzzleReply.moves;
            const move = getAllLegalMoves(currentColor, cases, { enPassantTarget }).find(candidate =>
                candidate.from.x === reply.from.col && candidate.from.y === reply.from.row &&
                candidate.to.x === reply.to.col && candidate.to.y === reply.to.row);
            if (move) commitMove(move);
            setPuzzleReply({ ...puzzleReply, moves: remaining });
        }, puzzleReply.moves.length ? 500 : 1500);
        return () => clearTimeout(timeout);
    }, [puzzleReply, cases, currentColor, enPassantTarget, gameFinished, puzzle, positionVersion, reset]);

    const indices = joueurEstBlanc ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
    const lettres = indices.map(x => 'ABCDEFGH'[x]);
    return (<>
        <DialogPromotion
            open={!!pendingPromotion}
            onChoose={handlePromotionChoice}
            color={pendingPromotion?.piece?.couleur}
        />
        {puzzle&&<PuzzleSuccess open={puzzleSolved} handleClose={()=>{
            setPuzzleSolved(false);
            startPuzzle(null);
        }}
             puzzleManager={puzzleManager} score={puzzleScore}/>}
        <Box
            sx={{
                display: 'grid', height: 'fit-content',
                gridTemplateColumns: `40px repeat(${taille}, 70px)`,
                gridTemplateRows: `40px repeat(${taille}, 70px)`,
                border: '2px solid #eee',
                backgroundColor: joueurEstBlanc ? '#f9f9f9' : '#333',
            }}
        >
            {/* Coin vide en haut à gauche */}
            <Box />

            {/* En-tête lettres A à H */}
            {lettres.map((letter) => (
                <Box
                    key={`letter-${letter}`}
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontWeight: 'bold',
                        color: joueurEstBlanc ? '#444' : '#f9f9f9',
                    }}
                >
                    {letter}
                </Box>
            ))}

            {/* Lignes avec numéros + cases */}
            {cases.length === 8 && indices.map(y => {
                const row = cases[y];
                return (
                    <React.Fragment key={`row-${y}`}>
                        {/* Numéro de ligne (inversé pour avoir 8 → 1 en haut → bas) */}
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                fontWeight: 'bold',
                                color: joueurEstBlanc ? '#444' : '#f9f9f9',
                            }}
                        >
                            {8 - y}
                        </Box>

                        {/* Cases de l’échiquier */}
                        {indices.map(x => {
                            const pion = row[x];
                            const moveFrom = pion && lastMove?.id === pion.id ? lastMove?.from : null;
                            const pionSelected = pionSelectionne != null && pionSelectionne.x == x && pionSelectionne.y === y;
                            const pionJouable = pionSelected && caseJouable != null && caseJouable.length > 0;

                            return (
                                <Case
                                    key={`${x}-${y}`}
                                    x={x}
                                    y={y}
                                    pion={pion}
                                    styleMode="simple"
                                    highlighted={highlightedCase?.x === x && highlightedCase?.y === y}
                                    caseJouable={caseJouable}
                                    lastMove={lastMove}
                                    onClick={() => handleClickCase(x, y)}
                                >
                                    <Piece
                                        piece={pion}
                                        x={joueurEstBlanc ? x : 7 - x}
                                        y={joueurEstBlanc ? y : 7 - y} joueurEstBlanc={joueurEstBlanc}
                                        moveFrom={moveFrom && (joueurEstBlanc ? moveFrom : { x: 7 - moveFrom.x, y: 7 - moveFrom.y })}
                                        selected={pionSelectionne?.x === x && pionSelectionne?.y === y}
                                        jouable={pionJouable}
                                    />
                                </Case>
                            );
                        })}
                    </React.Fragment>
                );
            })}
        </Box>

    </>
    );
};

export default Echiquier;

