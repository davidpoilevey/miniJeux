import React, { useState, useEffect, useMemo } from 'react';
import { Box } from '@mui/material';
import { Case } from '../dames/Case';
import Piece from './Piece';
import { filterLegalMoves, isCheckmate, isInsufficientMaterial, isKingInCheck, isStalemate, searchRoot, searchRootWithDifficulty } from './reflexions';
import { getAllLegalMoves } from './movements';
import { useChess } from './ChessContext';
import { DialogPromotion, PuzzleSuccess } from './ParamDialog';
import { soundManager } from '../rpg/sons/SoundManager';

const Echiquier = ({ reset, gameOver }) => {
    const { setEchec, setCaptured, setMessage, difficulte
        , humanReadableMove, logHistory, joueurEstBlanc, puzzle, puzzleManager, startPuzzle
        , cases, setCases, tourBlancs, setTourBlancs, openingManager
        , setMoveCount } = useChess();

    const taille = 8; // Nombre de cases par ligne et colonne
    const [highlightedCase, setHighlightedCase] = useState(null);
    const [caseJouable, setCaseJouable] = useState(null);
    const [pionSelectionne, setPionSelectionne] = useState(null); // Variable pour suivre le pion sélectionné par l'utilisateur
    const [lastMove, setLastMove] = useState(null);
    const [pendingPromotion, setPendingPromotion] = useState(null); // null ou { x, y, pion, board }
    const [puzzleScore, setPuzzleScore] = useState(0);
    const [puzzleSolved, setPuzzleSolved] = useState(false);



    // Fonction pour initialiser le tableau cases avec les pions blancs et noirs
    const initialiserCases = () => {
        const casesInitiales = Array.from({ length: taille }, () => Array(taille).fill(null));
        //ligne noir
        casesInitiales[0] = [
            { type: 'tour', couleur: 'black', id: `tourNoirA8`, hasMoved: false, x: 0, y: 0 },
            { type: 'cavalier', couleur: 'black', id: `cavalierNoirB8`, hasMoved: false, x: 1, y: 0 },
            { type: 'fou', couleur: 'black', id: `fouNoirC8`, hasMoved: false, x: 2, y: 0 },
            { type: joueurEstBlanc ? 'reine' : 'roi', couleur: 'black', id: `reineNoirD8`, hasMoved: false, x: 3, y: 0 },
            { type: joueurEstBlanc ? 'roi' : 'reine', couleur: 'black', id: `roiNoirE8`, hasMoved: false, x: 4, y: 0 },
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
//demarrage
    useEffect(() => {
        initialiserCases();
        setMoveCount(0);
        setCaseJouable(null);
        setPionSelectionne(null);
        setLastMove(null);

        setMessage("Serrage de mains, on commence !");
    }, [reset, joueurEstBlanc]);
//demarrage puzzle
    useEffect(() => {
        if (puzzle == null)
            return;
        setCases(JSON.parse(JSON.stringify(puzzle.position)));
        setMoveCount(0);
        setCaseJouable(null);
        setPionSelectionne(null);
        setLastMove(null);
        setPuzzleScore(0);
        setMessage("C'est parti pour le " + puzzle.name);
    }, [puzzle]);





    // Fonction pour gérer le clic sur une case
    const handleClickCase = (x, y) => {
        const pion = cases[y][x];

        if (pion !== null) {
            if (openingManager.isActive) {
                // montre le prochain coup attendu

                const ouverture = openingManager.currentOpening.moves[openingManager.moveIndex];
                if (ouverture) {
                    const coup = humanReadableMove(ouverture)
                    setMessage("Coup attendu : " + coup);
                }
            }
            const couleurJoueur = tourBlancs ? "white" : "black";

            // Est-ce un pion du joueur courant ?
            if (pion.couleur === couleurJoueur) {
                setPionSelectionne({ x, y, type: pion.type, id: pion.id });

            } else {
                // Clic sur pion adverse : désélection, s'il est dans les cases jouables, deplacer pour prendre
                if (pionSelectionne && caseJouable
                    && caseJouable.some(c => c.x === x && c.y === y))
                    deplacerPion(pionSelectionne.x, pionSelectionne.y, x, y);
                // Désélectionne et clean
                setPionSelectionne(null);
                setCaseJouable(null);
            }
        } else if (pionSelectionne !== null && caseJouable.length > 0) {
            // Clic sur une case vide valide
            for (let cj = 0; cj < caseJouable.length; cj++) {
                if (caseJouable[cj].x === x && caseJouable[cj].y === y) {
                    deplacerPion(pionSelectionne.x, pionSelectionne.y, x, y);
                    break;
                }
            }
        }
    };
const showPuzzleSuccessMessage=sc=>{
    setPuzzleScore(sc);
    setPuzzleSolved(true);
}
    useEffect(() => {
        if (pionSelectionne == null || !tourBlancs) return;

        const damier = JSON.parse(JSON.stringify(cases));
        let jouables = getAllLegalMoves('white', damier, { pieceId: pionSelectionne.id });
        setCaseJouable(jouables.map(move => move.to));
    }, [pionSelectionne, tourBlancs]);

    function checkCaptureAndCheck(damier, caseArrivee) {
        const joueur = tourBlancs ? 'white' : 'black';
        const adversaire = tourBlancs ? 'black' : 'white';

        // === 1. Capture ? ===
        if (caseArrivee && caseArrivee.couleur === adversaire) {
            // Mise à jour des pièces capturées
            setCaptured(prev => {
                const updated = { ...prev };
                updated[joueur].push(caseArrivee.type);
                return updated;
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
        if (isCheckmate(board, adversaire)) {
            setMessage(`Échec et mat ! Victoire des ${joueur} !`);
            soundManager.play('etMat');
            gameOver("Echec et mat !", joueur);
            return;
        }
        // === 4. Roi adverse est-il pat ? ===
        if (isStalemate(board, adversaire)) {
            setMessage(`Pat ! Match nul !`);
            gameOver("Pat !", joueur);
            return;
        }
        // === 5. Insuffisance de matériel ? ===
        if (isInsufficientMaterial(board)) {
            setMessage(`Partie nulle par insuffisance de matériel !`);
            gameOver("Partie nulle !", joueur);
            return;
        }
    }


    const deplacerPion = (xDepart, yDepart, xArrivee, yArrivee, takeThisBoard) => {
        const oldBoard = takeThisBoard||cases; // depuis ton state React
        const movingPawn = oldBoard[yDepart][xDepart];
        if (!movingPawn) return;
        soundManager.play('glisse');
        movingPawn.x = xArrivee;
        movingPawn.y = yArrivee;
        movingPawn.hasMoved = true; // Marque le pion comme ayant été déplacé
        setLastMove({ id: movingPawn.id, from: { x: xDepart, y: yDepart }, to: { x: xArrivee, y: yArrivee } });
        // Copie
        const newBoard = JSON.parse(JSON.stringify(oldBoard));

        // Déplacement
        const caseArrivee = { ...newBoard[yArrivee][xArrivee] };

        newBoard[yDepart][xDepart] = null;
        // piece deplacee
        newBoard[yArrivee][xArrivee] = movingPawn;

        // ----- Promotion (seulement si ce n'est pas une dame déjà et que le tour est terminé) -----
        if (movingPawn.type === 'pion') {
            const lastRow = newBoard.length - 1;
            const promotionRow = movingPawn.couleur === 'white' ? 0 : lastRow;
            if (yArrivee === promotionRow) {
                if (movingPawn.couleur === 'black') {
                    soundManager.play('muhaha2');
                    // IA ou joueur noir : promote direct
                    newBoard[yArrivee][xArrivee] = { ...movingPawn, type: 'reine' };
                } else {
                    // Blanc : demander via Dialog
                    setPendingPromotion({
                        x: xArrivee,
                        y: yArrivee,
                        pion: movingPawn,
                        board: newBoard,
                        caseArrivee
                    });
                    return; // Attente choix user
                }
            }
        }
            // Roque (court ou long)
        if (movingPawn.type === 'roi' && Math.abs(xArrivee - xDepart) === 2) {
            const isShortCastle = xArrivee - xDepart === 2; // Court
            // deplacer la tour
            const rookX = isShortCastle ? 7 : 0; // Tour à droite
            const rookNewX = isShortCastle ? 5 : 3; // Tour à gauche
            const rookY = yArrivee; // même rang que le roi
            const rook = newBoard[rookY][rookX];
            if (rook) {
                rook.x = rookNewX;
                rook.y = yArrivee;
                rook.hasMoved = true; // Marque la tour comme ayant été déplacée
                newBoard[rookY][rookNewX] = rook; // Met à jour la tour
                newBoard[rookY][rookX] = null; // Vide l'ancienne case de la tour
            }
        }

        checkCaptureAndCheck(newBoard, caseArrivee);
        if (movingPawn.couleur === 'white') {
            const move4Manager = {
                from: { row: yDepart, col: xDepart }
                , to: { row: yArrivee, col: xArrivee }
            }
            if (puzzle) {
                const result = puzzleManager.validateMove(move4Manager);
                if(result.message&&result.message!='')
                    setMessage(result.message);
                if (result.valid) {
                    // Jouer le coup du joueur
                    setCases(newBoard);
                    const makeMove = (otomove)=>{
                         const { from, to } = otomove;
                          deplacerPion(from.col ?? from.x, from.row ?? from.y, to.col ?? to.x, to.row ?? to.y, newBoard);
                    }
                    if (result.autoMoves) {
                        result.autoMoves.forEach(autoMove => {
                            setTimeout(() => makeMove(autoMove), 500); // Petit délai pour l'effet visuel
                        });
                    }

                    if (result.solved) {
                        // Puzzle terminé !
                        soundManager.play('etMat');
                        setTimeout(()=>{
                            showPuzzleSuccessMessage(result.score);
                        },1500)
                    }
                }
                else{ //invalid
                    setPionSelectionne(null);
                    setCaseJouable(null);
                    
                    movingPawn.x = xDepart;
                    movingPawn.y = yDepart;
                }
                return;//le puzzle gere tout
            }
            const validation = openingManager.validatePlayerMove(move4Manager, movingPawn.couleur);
            if (validation.message) {
                setMessage(validation.message);
            }
        }
        // ----- Fin du coup -----
        setCases(newBoard);
        if(!puzzle)
        setTourBlancs(!tourBlancs);
        setPionSelectionne(null);
        setCaseJouable(null);
        setMoveCount(prev => prev + 1);
    };
    const handlePromotionChoice = (type) => {
        if (!pendingPromotion) return;
        const { x, y, pion, board, caseArrivee } = pendingPromotion;

        const promoted = { ...pion, type };
        board[y][x] = promoted;

        checkCaptureAndCheck(board, caseArrivee);

        setCases(board);
        setTourBlancs(!tourBlancs);
        setPionSelectionne(null);
        setCaseJouable(null);
        setMoveCount(prev => prev + 1);
        setPendingPromotion(null); // reset
    };

    // au changement de tour
    useEffect(() => {
        // Vérifie si le jeu est terminé
        if (!tourBlancs && !puzzle) {
            logHistory();
            setTourBlancs(true);
            setTimeout(() => {

                const damier = JSON.parse(JSON.stringify(cases));
                const bestMove = openingManager.getAIMove(damier, 'black', difficulte); // Appel de la fonction de recherche
                if (bestMove == null)
                    return;//bizarre, devrait pas arriver
                const { from, to } = bestMove;
                deplacerPion(from.col ?? from.x, from.row ?? from.y, to.col ?? to.x, to.row ?? to.y);

            }, 60);
        }
    }, [cases])

    const lettres = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    return (<>
        <DialogPromotion
            open={!!pendingPromotion}
            onChoose={handlePromotionChoice}
            color={pendingPromotion?.pion?.couleur}
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
            {cases.map((row, y) => {
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
                            {joueurEstBlanc ? (8 - y) : (y + 1)}
                        </Box>

                        {/* Cases de l’échiquier */}
                        {row.map((pion, x) => {
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
                                        x={x}
                                        y={y} joueurEstBlanc={joueurEstBlanc}
                                        moveFrom={moveFrom}
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

