import React, { useState, useEffect } from 'react';
import { Avatar, Box, Typography } from '@mui/material';
import './dame.css';
import { Case } from './Case';
import { AIBubble, pickAIDialogue } from './Bavardage';
import avatar from '../bitLife/images/M/adulte/avatar15.png';
import { Pion } from './Pion';
import { useIsMobile } from '../hookGame';

const Damier = ({ reset, gameOver, setScore }) => {
  const taille = 10; // Nombre de cases par ligne et colonne
  const [cases, setCases] = useState([]);
  const [highlightedCase, setHighlightedCase] = useState(null);
  const [caseJouable, setCaseJouable] = useState(null);
  const [tourBlancs, setTourBlancs] = useState(true); // Variable pour suivre le tour des blancs
  const [pionSelectionne, setPionSelectionne] = useState(null); // Variable pour suivre le pion sélectionné par l'utilisateur
  const [lastMove, setLastMove] = useState(null);
  const [bubble, setBubble] = React.useState({ text: '', visible: false });

  const showAIBubble = React.useCallback((text, duration = 2500) => {
    setBubble({ text, visible: true });
    setTimeout(() => setBubble(b => ({ ...b, visible: false })), duration);
  }, []);

  // Fonction pour initialiser le tableau cases avec les pions blancs et noirs
  const initialiserCases = () => {
    const casesInitiales = Array.from({ length: taille }, () => Array(taille).fill(null));
  
    for (let x = 0; x < taille; x++) {
      for (let y = 0; y < taille; y++) {
        // Alterne les couleurs des cases pour créer un motif échiquier
        if ((x + y) % 2 === 0) {
          // Cases noires
          if (x < 4) {
            // 4 premières lignes : pions blancs
            casesInitiales[x][y] = { type: 'pion', couleur: 'black', id: `b-${x}-${y}` };
          } else if (x >= taille - 4) {
            // 4 dernières lignes : pions noirs
            casesInitiales[x][y] = { type: 'pion', couleur: 'white', id: `w-${x}-${y}` };
          }
        }
      }
    }
    setCases(casesInitiales);
  };

  useEffect(() => {
    initialiserCases();
  }, [reset]);





  // Fonction pour gérer le clic sur une case
  const handleClickCase = (x, y) => {
    const pion = cases[x][y];

    if (pion !== null) {
      const couleurJoueur = tourBlancs ? "white" : "black";
      const pionsCapturants = getPionsAvecSautPossible(cases, tourBlancs);

      // Est-ce un pion du joueur courant ?
      if (pion.couleur === couleurJoueur) {
        // Si des prises sont possibles, ne laisser sélectionner que ces pions
        if (pionsCapturants.length === 0 || pionsCapturants.some(p => p.x === x && p.y === y)) {
          setPionSelectionne({ x, y, type: pion.type });
        } else {
          // Clic sur un pion non-capturant alors qu'une prise est possible → on ignore
          setHighlightedCase(pionsCapturants[0]);
          setTimeout(() => setHighlightedCase(null), 500);
        }
      } else {
        // Clic sur pion adverse : désélection
        setPionSelectionne(null);
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

  useEffect(() => {
    if (pionSelectionne == null) return;

    const { saut, normal } = getCasesJouable(cases, pionSelectionne, tourBlancs);
    setCaseJouable(saut.length > 0 ? saut : normal);
  }, [pionSelectionne, tourBlancs]);

  const deplacerPion = (xDepart, yDepart, xArrivee, yArrivee) => {
    const oldBoard = cases; // depuis ton state React
    const movingPawn = oldBoard[xDepart][yDepart];
    if (!movingPawn) return;

    setLastMove({ id: movingPawn.id, from: { x: xDepart, y: yDepart }, to: { x: xArrivee, y: yArrivee } });
    // Copie
    const newBoard = JSON.parse(JSON.stringify(oldBoard));

    // Déplacement
    newBoard[xArrivee][yArrivee] = movingPawn;
    newBoard[xDepart][yDepart] = null;

    let tourSuivant = true;
    const dx = Math.abs(xDepart - xArrivee);
    const dy = Math.abs(yDepart - yArrivee);

    // ----- PRISE ? -----
    if (dx > 1 && dy > 1) {
      const captured = getCapturedOnPath(oldBoard, xDepart, yDepart, xArrivee, yArrivee);
      if (captured) {
        newBoard[captured.x][captured.y] = null;
      }

      // ----- Reprise multiple ? -----
      const isWhiteTurn = movingPawn.couleur === 'white';
      const { saut } = getCasesJouable(
        newBoard,
        { ...movingPawn, x: xArrivee, y: yArrivee },
        isWhiteTurn
      );

      if (saut.length > 0) {
        tourSuivant = false;

        // On fige le nouveau board + on force le joueur à continuer avec ce pion
        setCases(newBoard);
        setPionSelectionne({ x: xArrivee, y: yArrivee });
        setCaseJouable(saut);
        return; // on ne change pas de tour ici !
      }
    }

    // ----- Promotion (seulement si ce n'est pas une dame déjà et que le tour est terminé) -----
    if (tourSuivant && movingPawn.type !== 'dame') {
      const lastRow = newBoard.length - 1;
      if (
        (movingPawn.couleur === 'white' && xArrivee === 0) ||
        (movingPawn.couleur === 'black' && xArrivee === lastRow)
      ) {
        newBoard[xArrivee][yArrivee] = { ...movingPawn, type: 'dame' };
      }
    }

    // ----- Fin du coup -----
    setCases(newBoard);

    if (tourSuivant) {
      setTourBlancs(!tourBlancs);
      setPionSelectionne(null);
      setCaseJouable(null);
    } else {
      // Si tu veux afficher encore uniquement les sauts, tu l’as déjà set plus haut
    }
  };

  // au changement de tour
  useEffect(() => {
    // Vérifie si le jeu est terminé
    const pionsBlancs = collectPions(cases, "white");
    const pionsNoirs = collectPions(cases, "black");
    if ((pionsBlancs.length === 0) !== (pionsNoirs.length === 0)) {
      gameOver(true);
      setScore(pionsBlancs.length - pionsNoirs.length); // Score simple : 1 pr pion restant ou -1 si perdant
      return;
    }
    if (!tourBlancs) {
      
    const line = pickAIDialogue({
      aiCount: pionsNoirs.length,
      playerCount: pionsBlancs.length,
      justCrowned:pionsBlancs.some(p => p.type === 'dame'),
      gameEnded:(pionsBlancs.length === 1 || pionsNoirs.length === 1),
    });

    showAIBubble(line);
      setTimeout(() => {
      playAI({
        cases, callback: (bestMove) => {
          // do the move for black
          if (bestMove == null)
            return;//bizarre, devrait pas arriver
          const { from, to } = bestMove;
          deplacerPion(from.x, from.y, to.x, to.y);
        }
      });
    },600);
    }
  }, [tourBlancs, cases]);
  const isMobile = useIsMobile();
  const CASE_SIZE = isMobile ? Math.floor((window.innerWidth - 28) / taille) : 70;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, py: 2 }}>

      {/* Titre */}
      <Typography sx={{
        color: '#835425',
        fontWeight: 800,
        fontSize: { xs: '2rem', md: '2.6rem' },
        letterSpacing: '-0.02em',
        textTransform: 'uppercase',
        lineHeight: 1,
      }}>
        Jeu de Dames
      </Typography>

      {/* Label de tour */}
      <Typography sx={{
        fontSize: '0.72rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: '#5c605c',
        mb: 0.5,
      }}>
        {tourBlancs ? 'Votre tour' : "Tour de l'IA"}
      </Typography>

      {/* Bulle + Avatar IA */}
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2, mt: 0}}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar src={avatar} sx={{
              width: 72, height: 72,
              border: '2px solid #e6e9e4',
              filter: 'grayscale(20%) brightness(1.05)',
            }} />
            <Box sx={{
              position: 'absolute', bottom: 1, right: 1,
              width: 13, height: 13,
              borderRadius: '50%',
              bgcolor: '#835425',
              border: '2px solid #faf9f6',
            }} />
          </Box>
          <Typography sx={{
            fontSize: '0.72rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#5c605c',
          }}>
            Master IA
          </Typography>
        </Box>
          <AIBubble text={bubble.text} visible={bubble.visible} />
      
      </Box>

      {/* Plateau */}
      <Box
        className="boardDame"
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${taille}, ${CASE_SIZE}px)`,
          gridTemplateRows: `repeat(${taille}, ${CASE_SIZE}px)`,
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(131, 84, 37, 0.12)',
        }}
      >
        {cases.map((row, x) =>
          row.map((pion, y) => {
            const moveFrom = pion && lastMove?.id === pion.id ? lastMove?.from : null;
            const pionSelected = pionSelectionne != null && pionSelectionne.x == x && pionSelectionne.y === y;
            const pionJouable = pionSelected && caseJouable != null && caseJouable.length > 0;
            return <Case key={`${x}-${y}`}
              x={x} y={y} pion={pion}
              size={CASE_SIZE}
              pionSelectionne={pionSelectionne}
              highlighted={highlightedCase?.x === x && highlightedCase?.y === y}
              caseJouable={caseJouable}
              moveFrom={moveFrom}
              onClick={() => handleClickCase(x, y)}>
              <Pion
                pion={pion}
                x={x}
                y={y}
                size={CASE_SIZE}
                moveFrom={moveFrom}
                selected={pionSelectionne?.x === x && pionSelectionne?.y === y}
                jouable={pionJouable} />
            </Case>
          })
        )}
      </Box>

    </Box>
  );
};

export default Damier;



//




// Fonction pour évaluer le plateau


const getPionsAvecSautPossible = (cases, tourBlancs) => {
  const couleur = tourBlancs ? "white" : "black";
  const tousLesPions = collectPions(cases, couleur);
  const pionsCapturants = [];

  for (let pion of tousLesPions) {
    const { saut } = getCasesJouable(cases, pion, tourBlancs);
    if (saut.length > 0) {
      pionsCapturants.push(pion);
    }
  }

  return pionsCapturants;
};

// Fonction pour faire jouer l'IA pour les noirs
const collectPions = (cases, couleur) => {
  const pawns = [];
  for (let x = 0; x < cases.length; x++) {
    for (let y = 0; y < cases[x].length; y++) {
      if (cases[x][y]?.couleur === couleur) {
        pawns.push({ x: x, y: y, type: cases[x][y].type });
      }
    }
  }
  return pawns;
}

// Fonction d'évaluation beaucoup plus stratégique
const evaluateBoard = (cases) => {
  let score = 0;
  const size = cases.length;
  let blackPieces = 0, whitePieces = 0;
  let blackQueens = 0, whiteQueens = 0;
  
  // Première passe : comptage et évaluation de base
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      const piece = cases[x][y];
      if (!piece) continue;
      
      const isBlack = piece.couleur === 'black';
      const multiplier = isBlack ? 1 : -1;
      
      if (isBlack) blackPieces++;
      else whitePieces++;
      
      // Valeur matérielle
      if (piece.type === 'dame') {
        score += multiplier * 100;
        if (isBlack) blackQueens++; else whiteQueens++;
      } else {
        score += multiplier * 30;
        
        // Bonus de progression vers la dame (plus fort)
        const advancement = isBlack ? x : (size - 1 - x);
        score += multiplier * advancement * 8;
        
        // Super bonus pour les pions très proches de la promotion
        if ((isBlack && x >= size - 2) || (!isBlack && x <= 1)) {
          score += multiplier * 40;
        }
      }
      
      // Position défensive : bords et coins
      if (y === 0 || y === size - 1) {
        score += multiplier * 8;
      }
      if ((x === 0 || x === size - 1) && (y === 0 || y === size - 1)) {
        score += multiplier * 15; // Coins super sûrs
      }
      
      // Contrôle du centre
      const centerBonus = Math.max(0, 3 - Math.abs(y - size/2) - Math.abs(x - size/2));
      score += multiplier * centerBonus * 4;
    }
  }
  
  // Évaluations stratégiques globales
  
  // Avantage matériel critique
  const pieceDifference = blackPieces - whitePieces;
  score += pieceDifference * 25;
  
  // Avantage en dames encore plus critique
  const queenDifference = blackQueens - whiteQueens;
  score += queenDifference * 80;
  
  // Bonus pour avoir plus de pièces en fin de partie
  if (blackPieces + whitePieces <= 8) {
    score += pieceDifference * 50; // Chaque pièce compte double en fin de partie
  }
  
  // Évaluation de la mobilité et des menaces
  let blackMobility = 0, whiteMobility = 0;
  let blackThreats = 0, whiteThreats = 0;
  
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      const piece = cases[x][y];
      if (!piece) continue;
      
      const isBlack = piece.couleur === 'black';
      const moves = getCasesJouable(cases, { x, y, couleur: piece.couleur, type: piece.type }, !isBlack);
      
      const mobility = moves.saut.length * 10 + moves.normal.length * 3;
      const threats = moves.saut.length * 15; // Les captures sont des menaces
      
      if (isBlack) {
        blackMobility += mobility;
        blackThreats += threats;
      } else {
        whiteMobility += mobility;
        whiteThreats += threats;
      }
    }
  }
  
  score += (blackMobility - whiteMobility) * 2;
  score += (blackThreats - whiteThreats) * 3;
  
  // Pénalité pour être acculé (pas de mouvement)
  if (blackMobility === 0) score -= 5000;
  if (whiteMobility === 0) score += 5000;
  
  return score;
};

const playAI = (damier) => {
  const cases = JSON.parse(JSON.stringify(damier.cases));
  const blackPawns = collectPions(cases, "black");
  const whitePawns = collectPions(cases, "white");

  let bestMove;
  let bestScore = -Infinity;
  const captureMoves = [];
  const normalMoves = [];

  // Collecter tous les coups possibles
  for (let pawn of blackPawns) {
    const piece = cases[pawn.x][pawn.y];
    if (!piece) continue;
    
    const { saut, normal } = getCasesJouable(cases, { ...pawn, type: piece.type }, false);

    saut.forEach(move => {
      captureMoves.push({ pawn, move, piece });
    });

    normal.forEach(move => {
      normalMoves.push({ pawn, move, piece });
    });
  }

  // Stratégie adaptative selon la situation
  let movesToConsider;
  const totalPieces = blackPawns.length + whitePawns.length;
  
  if (captureMoves.length > 0) {
    // S'il y a des captures, les prioriser mais pas exclusivement
    if (totalPieces > 10) {
      // Début/milieu de partie : 80% captures, 20% coups normaux
      movesToConsider = [...captureMoves, ...normalMoves.slice(0, Math.max(2, Math.floor(normalMoves.length * 0.2)))];
    } else {
      // Fin de partie : considérer plus de coups normaux
      movesToConsider = [...captureMoves, ...normalMoves.slice(0, Math.max(3, Math.floor(normalMoves.length * 0.4)))];
    }
  } else {
    movesToConsider = normalMoves;
  }

  // Tri des coups par priorité (coups de capture d'abord, puis par valeur heuristique)
  movesToConsider.sort((a, b) => {
    const aIsCapture = Math.abs(a.pawn.x - a.move.x) > 1 ? 1 : 0;
    const bIsCapture = Math.abs(b.pawn.x - b.move.x) > 1 ? 1 : 0;
    return bIsCapture - aIsCapture;
  });

  // Ajouter un tout petit peu d'aléatoire (1% seulement)
  const shouldAddRandomness = Math.random() < 0.01;

  // Profondeur adaptative
  let depth = 4; // Profondeur de base augmentée
  if (totalPieces <= 6) depth = 6; // Plus profond en fin de partie
  if (captureMoves.length > 0) depth = 5; // Un peu plus profond s'il y a des captures

  // Simulation Minimax
  for (let { pawn, move, piece } of movesToConsider) {
    const { x, y } = move;
    let capturedPieces = [];

    // Sauvegarder l'état
    const prevPawn = cases[x][y];
    cases[x][y] = { ...piece, x, y };
    cases[pawn.x][pawn.y] = null;

    // Gérer les captures
    if (Math.abs(pawn.x - x) > 1) {
      if (piece.type === 'dame') {
        const dx = Math.sign(x - pawn.x);
        const dy = Math.sign(y - pawn.y);
        let cx = pawn.x + dx;
        let cy = pawn.y + dy;
        
        while (cx !== x || cy !== y) {
          if (cases[cx][cy] !== null) {
            capturedPieces.push({ x: cx, y: cy, piece: cases[cx][cy] });
            cases[cx][cy] = null;
          }
          cx += dx;
          cy += dy;
        }
      } else {
        const xPris = (pawn.x + x) / 2;
        const yPris = (pawn.y + y) / 2;
        if (cases[xPris] && cases[xPris][yPris]) {
          capturedPieces.push({ x: xPris, y: yPris, piece: cases[xPris][yPris] });
          cases[xPris][yPris] = null;
        }
      }
    }

    // Promotion
    const shouldPromote = (piece.type !== 'dame' && x === cases.length - 1);
    if (shouldPromote) {
      cases[x][y].type = 'dame';
    }

    let score = minimax({
      cases,
      depth: depth,
      maximizingPlayer: false,
      alpha: -Infinity,
      beta: Infinity
    });

    // Ajustements de score
    if (capturedPieces.length > 1) {
      score += capturedPieces.length * 30; // Bonus pour captures multiples
    }
    
    if (shouldPromote) {
      score += 60; // Gros bonus pour promotion
    }

    // Micro-randomness si activé
    if (shouldAddRandomness) {
      score += (Math.random() - 0.5) * 10;
    }

    // Restaurer l'état
    cases[pawn.x][pawn.y] = piece;
    cases[x][y] = prevPawn;
    capturedPieces.forEach(({ x: cx, y: cy, piece: capturedPiece }) => {
      cases[cx][cy] = capturedPiece;
    });

    if (bestMove == null || score > bestScore) {
      bestScore = score;
      bestMove = { from: { x: pawn.x, y: pawn.y }, to: { x, y } };
    }
  }

  if (damier.callback) damier.callback(bestMove);
  return bestMove;
};

// Minimax avec élagage Alpha-Beta plus strict
const minimax = ({ cases, depth, maximizingPlayer, alpha, beta }) => {
  if (depth === 0) {
    return evaluateBoard(cases);
  }

  const pawns = maximizingPlayer ? 
    collectPions(cases, "black") : 
    collectPions(cases, "white");
  
  const captureMoves = [];
  const normalMoves = [];

  for (let pawn of pawns) {
    const piece = cases[pawn.x][pawn.y];
    if (!piece) continue;
    
    const { saut, normal } = getCasesJouable(cases, { ...pawn, type: piece.type }, maximizingPlayer);

    saut.forEach(move => {
      captureMoves.push({ pawn, move, piece });
    });

    normal.forEach(move => {
      normalMoves.push({ pawn, move, piece });
    });
  }

  // Prioriser les captures mais pas exclusivement
  const movesToConsider = captureMoves.length > 0 ? 
    [...captureMoves, ...normalMoves.slice(0, Math.min(4, normalMoves.length))] : 
    normalMoves;
  
  if (movesToConsider.length === 0) {
    return maximizingPlayer ? -10000 : 10000;
  }

  let bestScore = maximizingPlayer ? -Infinity : Infinity;

  for (let { pawn, move, piece } of movesToConsider) {
    const { x, y } = move;
    let capturedPieces = [];

    // Appliquer le coup
    const prevPawn = cases[x][y];
    cases[x][y] = { ...piece, x, y };
    cases[pawn.x][pawn.y] = null;

    // Captures
    if (Math.abs(pawn.x - x) > 1) {
      if (piece.type === 'dame') {
        const dx = Math.sign(x - pawn.x);
        const dy = Math.sign(y - pawn.y);
        let cx = pawn.x + dx;
        let cy = pawn.y + dy;
        
        while (cx !== x || cy !== y) {
          if (cases[cx][cy] !== null) {
            capturedPieces.push({ x: cx, y: cy, piece: cases[cx][cy] });
            cases[cx][cy] = null;
          }
          cx += dx;
          cy += dy;
        }
      } else {
        const xPris = (pawn.x + x) / 2;
        const yPris = (pawn.y + y) / 2;
        if (cases[xPris] && cases[xPris][yPris]) {
          capturedPieces.push({ x: xPris, y: yPris, piece: cases[xPris][yPris] });
          cases[xPris][yPris] = null;
        }
      }
    }

    // Promotion
    if (piece.type !== 'dame' && 
        ((piece.couleur === 'black' && x === cases.length - 1) ||
         (piece.couleur === 'white' && x === 0))) {
      cases[x][y].type = 'dame';
    }

    const score = minimax({
      cases,
      depth: depth - 1,
      maximizingPlayer: !maximizingPlayer,
      alpha,
      beta
    });

    // Restaurer l'état
    cases[pawn.x][pawn.y] = piece;
    cases[x][y] = prevPawn;
    capturedPieces.forEach(({ x: cx, y: cy, piece: capturedPiece }) => {
      cases[cx][cy] = capturedPiece;
    });

    if (maximizingPlayer) {
      bestScore = Math.max(bestScore, score);
      alpha = Math.max(alpha, score);
    } else {
      bestScore = Math.min(bestScore, score);
      beta = Math.min(beta, score);
    }

    // Élagage Alpha-Beta strict
    if (beta <= alpha) break;
  }

  return bestScore;
};

// Vos fonctions existantes (inchangées)
const getCapturedOnPath = (board, xFrom, yFrom, xTo, yTo) => {
  const dx = Math.sign(xTo - xFrom);
  const dy = Math.sign(yTo - yFrom);
  let x = xFrom + dx;
  let y = yFrom + dy;

  while (x !== xTo && y !== yTo) {
    if (board[x][y] !== null) {
      return { x, y };
    }
    x += dx;
    y += dy;
  }
  return null;
};

const getCasesJouable = (cases, pion, isBlanc) => {
  const saut = [];
  const normal = [];
  const size = cases.length;
  const direction = isBlanc ? -1 : 1;
  const colorOfPawn = isBlanc ? 'white' : 'black';

  const isInside = (x, y) => x >= 0 && x < size && y >= 0 && y < size;
  const isCellFree = (x, y) => isInside(x, y) && cases[x][y] == null;
  const isEnemyPawn = (x, y) => {
    if (!isInside(x, y)) return false;
    const p = cases[x][y];
    return p && p.couleur !== colorOfPawn;
  };
  const isOwnPawn = (x, y) => {
    if (!isInside(x, y)) return false;
    const p = cases[x][y];
    return p && p.couleur === colorOfPawn;
  };

  if (pion.type === 'dame') {
    const dirs = [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ];

    for (const [dx, dy] of dirs) {
      let x = pion.x + dx;
      let y = pion.y + dy;
      let enemyFound = false;

      while (isInside(x, y)) {
        if (cases[x][y] == null) {
          if (!enemyFound) {
            normal.push({ x, y });
          } else {
            saut.push({ x, y });
          }
          x += dx;
          y += dy;
          continue;
        }

        if (isOwnPawn(x, y)) {
          break;
        }

        if (isEnemyPawn(x, y)) {
          if (enemyFound) {
            break;
          }
          enemyFound = true;
          x += dx;
          y += dy;

          while (isInside(x, y) && cases[x][y] == null) {
            saut.push({ x, y });
            x += dx;
            y += dy;
          }
          break;
        }
      }
    }

    return { saut, normal };
  }

  const normalDirs = [
    [direction, -1],
    [direction, 1],
  ];

  for (const [dx, dy] of normalDirs) {
    const nx = pion.x + dx;
    const ny = pion.y + dy;
    if (isCellFree(nx, ny)) {
      normal.push({ x: nx, y: ny });
    }
  }

  const captureDirs = [
    [1, -1],
    [1, 1],
    [-1, -1],
    [-1, 1],
  ];

  for (const [dx, dy] of captureDirs) {
    const nx = pion.x + dx;
    const ny = pion.y + dy;
    const jx = pion.x + 2 * dx;
    const jy = pion.y + 2 * dy;

    if (isEnemyPawn(nx, ny) && isCellFree(jx, jy)) {
      saut.push({ x: jx, y: jy });
    }
  }

  return { saut, normal };
};