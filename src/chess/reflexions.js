import { applyMove, getAllLegalMoves, undoMove } from "./movements";


export function isSquareAttacked(cases, x, y, attackerColor) {
  const height = cases.length;
  const width = cases[0].length;

  // Directions pour fou/reine (diagonales)
  const diagonals = [
    { dx: 1, dy: 1 },
    { dx: -1, dy: 1 },
    { dx: 1, dy: -1 },
    { dx: -1, dy: -1 }
  ];

  // Directions pour tour/reine (lignes droites)
  const straights = [
    { dx: 0, dy: 1 },
    { dx: 0, dy: -1 },
    { dx: 1, dy: 0 },
    { dx: -1, dy: 0 }
  ];

  // Vérifie les "sliders" (fou, tour, reine)
  function checkSliding(directions, types) {
    for (const { dx, dy } of directions) {
      let nx = x + dx;
      let ny = y + dy;
      while (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const p = cases[ny][nx];
        if (p) {
          if (p.couleur === attackerColor && types.includes(p.type)) {
            return true;
          }
          break; // bloqué
        }
        nx += dx;
        ny += dy;
      }
    }
    return false;
  }

  // Vérifie les cavaliers
  const knightDeltas = [
    [1, 2], [2, 1], [-1, 2], [-2, 1],
    [1, -2], [2, -1], [-1, -2], [-2, -1],
  ];
  for (const [dx, dy] of knightDeltas) {
    const nx = x + dx, ny = y + dy;
    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
      const p = cases[ny][nx];
      if (p && p.couleur === attackerColor && p.type === 'cavalier') {
        return true;
      }
    }
  }

  // Vérifie les pions
  const dir = attackerColor === 'white' ? 1 : -1;
  for (const dx of [-1, 1]) {
    const nx = x + dx, ny = y + dir;
    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
      const p = cases[ny][nx];
      if (p && p.couleur === attackerColor && p.type === 'pion') {
        return true;
      }
    }
  }

  // Vérifie les rois (cases adjacentes)
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const p = cases[ny][nx];
        if (p && p.couleur === attackerColor && p.type === 'roi') {
          return true;
        }
      }
    }
  }

  // Sliders
  if (checkSliding(diagonals, ['fou', 'reine'])) return true;
  if (checkSliding(straights, ['tour', 'reine'])) return true;

  return false;
}
export function filterLegalMoves(moves, cases, playerColor) {
  const legal = [];
  for (const move of moves) {
    const undo = applyMove(move, cases);
    const kingInCheck = isKingInCheck(cases, playerColor);
    undoMove(undo, cases);
    if (!kingInCheck) {
      legal.push(move);
    }
  }
  return legal;
}

export function isKingInCheck(cases, color) {
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const p = cases[y][x];
      if (p && p.type === 'roi' && p.couleur === color) {
        return isSquareAttacked(cases, x, y, color === 'white' ? 'black' : 'white');
      }
    }
  }
  return false; // should never happen
}
// export function isCheckmate(cases, color) {
//   if (!isKingInCheck(cases, color)) return false;

//   // Vérifie si le roi peut se déplacer pour échapper au check
//   for (let y = 0; y < 8; y++) {
//     for (let x = 0; x < 8; x++) {
//       const p = cases[y][x];
//       if (p && p.type === 'roi' && p.couleur === color) {
//         for (let dy = -1; dy <= 1; dy++) {
//           for (let dx = -1; dx <= 1; dx++) {
//             if (dx === 0 && dy === 0) continue;
//             const nx = x + dx, ny = y + dy;
//             if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) {
//               const targetSquare = cases[ny][nx];
//               if (!targetSquare || targetSquare.couleur !== color) {
//                 // Simule le déplacement du roi
//                 const newCases = JSON.parse(JSON.stringify(cases));
//                 newCases[y][x] = null;
//                 newCases[ny][nx] = { ...p, x: nx, y: ny };
//                 if (!isSquareAttacked(newCases, nx, ny, color === 'white' ? 'black' : 'white')) {
//                   return false; // Le roi peut échapper au check
//                 }
//               }
//             }
//           }
//         }
//       }
//     }
//   }

//   return true; // Pas de mouvement possible pour échapper au check
// }
export function isCheckmate(cases, color) {
  // Première vérification : le roi est-il en échec ?
  if (!isKingInCheck(cases, color)) {
    return false;
  }

  // Méthode complète : vérifier tous les coups légaux possibles
  const allMoves = getAllLegalMoves(color, cases);
  
  // Si aucun coup légal n'est possible, c'est échec et mat
  return allMoves.length === 0;
}
export function isStalemate(cases, color) {
  // Vérifie si le roi n'est pas en échec
  if (isKingInCheck(cases, color)) return false;

  // Vérifie si le joueur a des mouvements légaux
  const moves = getAllLegalMoves(color, cases);
  return moves.length === 0; // Si aucun mouvement légal, c'est un pat
}
export function isInsufficientMaterial(cases) {
  let whitePieces = 0;
  let blackPieces = 0;

  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const piece = cases[y][x];
      if (!piece) continue;

      if (piece.couleur === 'white') {
        whitePieces++;
      } else {
        blackPieces++;
      }

      // Si un joueur a plus de deux pièces, ce n'est pas insuffisant
      if (whitePieces > 2 || blackPieces > 2) return false;
    }
  }

  // Vérifie les types de pièces restantes
  const whiteTypes = new Set();
  const blackTypes = new Set();

  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const piece = cases[y][x];
      if (!piece) continue;

      if (piece.couleur === 'white') {
        whiteTypes.add(piece.type);
      } else {
        blackTypes.add(piece.type);
      }
    }
  }

  // Si les deux joueurs n'ont que des pions et des rois, c'est insuffisant
  if ((whiteTypes.size === 1 && whiteTypes.has('roi') && whitePieces <= 2) &&
      (blackTypes.size === 1 && blackTypes.has('roi') && blackPieces <= 2)) {
    return true;
  }

  // Si un joueur a un fou ou un cavalier et l'autre n'a que des pions et un roi, c'est insuffisant
  if ((whiteTypes.size === 1 && whiteTypes.has('roi') && whitePieces <= 2) ||
      (blackTypes.size === 1 && blackTypes.has('roi') && blackPieces <= 2)) {
    return true;
  }

  return false; // Il y a suffisamment de matériel pour jouer
}



// Version améliorée avec alpha-beta pruning et meilleure évaluation
export const searchRoot = (cases, currentColor, depth = 4) => {
  const moves = getAllLegalMoves(currentColor, cases);
  
  if (moves.length === 0) {
    return null; // Pas de coups légaux
  }

  let bestMove = null;
  let bestScore = -Infinity;
  let alpha = -Infinity;
  let beta = Infinity;

  // Trier les coups pour améliorer l'élagage alpha-beta
  const sortedMoves = sortMovesByPriority(moves, cases, currentColor);

  for (let move of sortedMoves) {
    const undo = applyMove(move, cases);

    // On appelle minimax pour l'adversaire (isMaximizing = false)
    const score = minimax({
      cases,
      depth: depth - 1,
      alpha,
      beta,
      isMaximizing: false, // L'adversaire minimise notre score
      currentPlayer: currentColor === 'white' ? 'black' : 'white',
      rootPlayer: currentColor // On garde trace du joueur racine
    });

    undoMove(undo, cases);

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }

    alpha = Math.max(alpha, score);
    if (beta <= alpha) {
      break; // Élagage alpha-beta
    }
  }

  return bestMove;
};

function minimax({ cases, depth, alpha, beta, isMaximizing, currentPlayer, rootPlayer }) {
  // Conditions d'arrêt
  if (depth === 0) {
    return evaluateBoard(cases, rootPlayer);
  }

  // Vérifier échec et mat / pat
  const moves = getAllLegalMoves(currentPlayer, cases);
  if (moves.length === 0) {
    if (isKingInCheck(cases,currentPlayer)) {
      // Échec et mat : très bon pour l'adversaire, très mauvais pour le joueur actuel
      return isMaximizing ? -999999 + (4 - depth) : 999999 - (4 - depth);
    } else {
      // Pat : match nul
      return 0;
    }
  }

  // Trier les coups pour améliorer l'élagage
  const sortedMoves = sortMovesByPriority(moves, cases, currentPlayer);

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (let move of sortedMoves) {
      const undo = applyMove(move, cases);
      
      const evale = minimax({
        cases,
        depth: depth - 1,
        alpha,
        beta,
        isMaximizing: false,
        currentPlayer: currentPlayer === 'white' ? 'black' : 'white',
        rootPlayer
      });
      
      undoMove(undo, cases);
      
      maxEval = Math.max(maxEval, evale);
      alpha = Math.max(alpha, evale);
      
      if (beta <= alpha) {
        break; // Élagage beta
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let move of sortedMoves) {
      const undo = applyMove(move, cases);
      
      const evale = minimax({
        cases,
        depth: depth - 1,
        alpha,
        beta,
        isMaximizing: true,
        currentPlayer: currentPlayer === 'white' ? 'black' : 'white',
        rootPlayer
      });
      
      undoMove(undo, cases);
      
      minEval = Math.min(minEval, evale);
      beta = Math.min(beta, evale);
      
      if (beta <= alpha) {
        break; // Élagage alpha
      }
    }
    return minEval;
  }
}

// Fonction pour trier les coups par priorité (améliore l'élagage alpha-beta)
function sortMovesByPriority(moves, cases, color) {
  return moves.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    // Priorité 1: Captures (Most Valuable Victim - Least Valuable Attacker)
    if (a.captured) {
      scoreA += getPieceValue(a.captured.type) * 10;
      scoreA -= getPieceValue(a.piece.type); // MVV-LVA
    }
    if (b.captured) {
      scoreB += getPieceValue(b.captured.type) * 10;
      scoreB -= getPieceValue(b.piece.type);
    }

    // Priorité 2: Échecs
    const undoA = applyMove(a, cases);
    if (isKingInCheck(cases, color === 'white' ? 'black' : 'white')) {
      scoreA += 50;
    }
    undoMove(undoA, cases);

    const undoB = applyMove(b, cases);
    if (isKingInCheck(cases, color === 'white' ? 'black' : 'white')) {
      scoreB += 50;
    }
    undoMove(undoB, cases);

    // Priorité 3: Coups vers le centre
    scoreA += getCenterScore(a.to);
    scoreB += getCenterScore(b.to);

    return scoreB - scoreA; // Tri décroissant
  });
}

function getCenterScore(position) {
  const centerSquares = [[3,3], [3,4], [4,3], [4,4]];
  if (centerSquares.some(([r,c]) => r === position.x && c === position.y)) {
    return 10;
  }
  const extendedCenter = [[2,2], [2,3], [2,4], [2,5], [3,2], [3,5], [4,2], [4,5], [5,2], [5,3], [5,4], [5,5]];
  if (extendedCenter.some(([r,c]) => r === position.x && c === position.y)) {
    return 5;
  }
  return 0;
}

// Fonction d'évaluation améliorée
function evaluateBoard(cases, color) {
  let score = 0;

  // 1. Valeur matérielle des pièces
  score += getMaterialValue(cases, color);

  // 2. Position des pièces (tables de positionnement)
  score += getPositionalValue(cases, color);

  // 3. Sécurité du roi
  score += getKingSafety(cases, color);

  // 4. Contrôle du centre
  score += getCenterControl(cases, color);

  // 5. Développement des pièces
  score += getDevelopmentScore(cases, color);

  // 6. Pions doublés/isolés/passés
  score += getPawnStructure(cases, color);

  return score;
}

function getMaterialValue(cases, color) {
  let whiteValue = 0;
  let blackValue = 0;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = cases[row][col];
      if (piece) {
        const value = getPieceValue(piece.type);
        if (piece.couleur === 'white') {
          whiteValue += value;
        } else {
          blackValue += value;
        }
      }
    }
  }

  return color === 'white' ? whiteValue - blackValue : blackValue - whiteValue;
}

function getPieceValue(type) {
  const values = {
    'pion': 100,
    'cavalier': 320,
    'fou': 330,
    'tour': 500,
    'reine': 900,
    'roi': 20000
  };
  return values[type] || 0;
}

function getPositionalValue(cases, color) {
  let score = 0;
  
  // Tables de positionnement simplifiées
  const pawnTable = [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5,  5, 10, 25, 25, 10,  5,  5],
    [0,  0,  0, 20, 20,  0,  0,  0],
    [5, -5,-10,  0,  0,-10, -5,  5],
    [5, 10, 10,-20,-20, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0]
  ];

  const knightTable = [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
  ];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = cases[row][col];
      if (piece) {
        let pieceScore = 0;
        const adjustedRow = piece.couleur === 'white' ? row : 7 - row;
        
        switch (piece.type) {
          case 'pion':
            pieceScore = pawnTable[adjustedRow][col];
            break;
          case 'cavalier':
            pieceScore = knightTable[row][col];
            break;
          // Ajouter d'autres tables pour fou, tour, reine, roi...
        }

        if (piece.couleur === color) {
          score += pieceScore;
        } else {
          score -= pieceScore;
        }
      }
    }
  }

  return score;
}

function getKingSafety(cases, color) {
  // Vérifier si le roi est en sécurité (roqué, pions protecteurs, etc.)
  let score = 0;
  
  // Trouver le roi
  const king = findKing(cases, color);
  const enemyKing = findKing(cases, color === 'white' ? 'black' : 'white');
  
  if (!king || !enemyKing) return 0;

  // Pénalité si le roi est exposé au centre en début de partie
  if (king.col >= 2 && king.col <= 5) {
    score -= 40;
  }

  // Bonus pour le roquage (roi sur les colonnes b, c, f, g)
  if (king.col <= 2 || king.col >= 6) {
    score += 20;
  }

  return score;
}

function getCenterControl(cases, color) {
  let score = 0;
  const centerSquares = [[3,3], [3,4], [4,3], [4,4]];
  
  for (let [row, col] of centerSquares) {
    const piece = cases[row][col];
    if (piece) {
      if (piece.couleur === color) {
        score += 10;
      } else {
        score -= 10;
      }
    }
  }
  
  return score;
}

function getDevelopmentScore(cases, color) {
  let score = 0;
  
  // Vérifier si les cavaliers et fous sont développés
  const backRank = color === 'white' ? 7 : 0;
  
  // Cavaliers développés
  if (!cases[backRank][1] || cases[backRank][1].type !== 'cavalier') score += 10;
  if (!cases[backRank][6] || cases[backRank][6].type !== 'cavalier') score += 10;
  
  // Fous développés
  if (!cases[backRank][2] || cases[backRank][2].type !== 'fou') score += 10;
  if (!cases[backRank][5] || cases[backRank][5].type !== 'fou') score += 10;
  
  return score;
}

function getPawnStructure(cases, color) {
  let score = 0;
  
  // Analyser la structure des pions (simplifié)
  for (let col = 0; col < 8; col++) {
    let myPawns = [];
    let enemyPawns = [];
    
    for (let row = 0; row < 8; row++) {
      const piece = cases[row][col];
      if (piece && piece.type === 'pion') {
        if (piece.couleur === color) {
          myPawns.push(row);
        } else {
          enemyPawns.push(row);
        }
      }
    }
    
    // Pénalité pour pions doublés
    if (myPawns.length > 1) {
      score -= 10 * (myPawns.length - 1);
    }
    
    // Bonus pour pions passés
    // ... logique pour détecter les pions passés
  }
  
  return score;
}

// Fonctions utilitaires (tu dois les implémenter selon ton code)
function findKing(cases, color) {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = cases[row][col];
      if (piece && piece.type === 'roi' && piece.couleur === color) {
        return { row, col };
      }
    }
  }
  return null;
}

// Configuration des niveaux de difficulté
export const DIFFICULTY_CONFIGS = {

  0: { // Custom
    name: "Personnalisé",
    description: "Configuration personnalisée aux petits oignons",
    depth: 3,
    errorRate: 0.08,
    materialWeight: 1.0,
    positionalWeight: 0.7,
    kingSafetyWeight: 0.6,
    randomFactor: 0.1,
    blunderChance: 0.04,
    estimatedElo: "???"
  },
  1: { // Débutant
    name: "Débutant",
    description: "Fait des erreurs simples, bon pour apprendre",
    depth: 2,
    errorRate: 0.25, // 25% de chance de faire une erreur
    materialWeight: 1.0,
    positionalWeight: 0.3,
    kingSafetyWeight: 0.2,
    randomFactor: 0.3,
    blunderChance: 0.15, // Chance de faire une grosse erreur
    estimatedElo: "800-1000"
  },
  2: { // Facile
    name: "Facile", 
    description: "Joue correctement mais manque de stratégie",
    depth: 2,
    errorRate: 0.15,
    materialWeight: 1.0,
    positionalWeight: 0.5,
    kingSafetyWeight: 0.4,
    randomFactor: 0.2,
    blunderChance: 0.08,
    estimatedElo: "1000-1200"
  },
  3: { // Moyen
    name: "Moyen",
    description: "Bon joueur de club",
    depth: 3,
    errorRate: 0.05,
    materialWeight: 1.0,
    positionalWeight: 0.7,
    kingSafetyWeight: 0.6,
    randomFactor: 0.1,
    blunderChance: 0.04,
    estimatedElo: "1200-1500"
  },
  4: { // Difficile
    name: "Difficile",
    description: "Joueur expérimenté",
    depth: 4,
    errorRate: 0.04,
    materialWeight: 1.0,
    positionalWeight: 0.9,
    kingSafetyWeight: 0.8,
    randomFactor: 0.05,
    blunderChance: 0.02,
    estimatedElo: "1500-1800"
  },
  5: { // Expert
    name: "Expert",
    description: "Niveau maître",
    depth: 5,
    errorRate: 0.02,
    materialWeight: 1.0,
    positionalWeight: 1.0,
    kingSafetyWeight: 1.0,
    randomFactor: 0.02,
    blunderChance: 0.005,
    estimatedElo: "1800-2200"
  },
  6: { // Maître
    name: "Maître",
    description: "Magnus Carlsen approuve",
    depth: 6,
    errorRate: 0.01,
    materialWeight: 1.0,
    positionalWeight: 1.0,
    kingSafetyWeight: 1.0,
    randomFactor: 0.01,
    blunderChance: 0.001,
    estimatedElo: "2200+"
  }
};

export const searchRootWithDifficulty = (cases, currentColor, difficulty = 3) => {
  const config = DIFFICULTY_CONFIGS[difficulty];
  
  if (!config) {
    throw new Error(`Niveau de difficulté ${difficulty} non supporté`);
  }

  const moves = getAllLegalMoves(currentColor, cases);
  
  if (moves.length === 0) {
    return null;
  }

  // Chance de faire une grosse erreur (blunder)
  if (Math.random() < config.blunderChance) {
    console.log(`IA niveau ${difficulty}: Blunder intentionnel !`);
    return getBlunderMove(moves, cases, currentColor);
  }

  // Chance de faire une erreur normale
  if (Math.random() < config.errorRate) {
    console.log(`IA niveau ${difficulty}: Erreur tactique`);
    return getSuboptimalMove(cases, currentColor, config);
  }

  // Jouer normalement avec la configuration du niveau
  return searchOptimalMove(cases, currentColor, config);
};

function searchOptimalMove(cases, currentColor, config) {
  const moves = getAllLegalMoves(currentColor, cases);
  let bestMove = null;
  let bestScore = -Infinity;
  let alpha = -Infinity;
  let beta = Infinity;

  // Trier les coups avec un peu d'aléatoire selon le niveau
  const sortedMoves = sortMovesByPriorityWithRandomness(moves, cases, currentColor, config.randomFactor);

  for (let move of sortedMoves) {
    const undo = applyMove(move, cases);

    const score = minimaxWithDifficulty({
      cases,
      depth: config.depth - 1,
      alpha,
      beta,
      isMaximizing: false,
      currentPlayer: currentColor === 'white' ? 'black' : 'white',
      rootPlayer: currentColor,
      config
    });

    undoMove(undo, cases);

    // Ajouter un facteur aléatoire selon le niveau
    const adjustedScore = score + (Math.random() - 0.5) * config.randomFactor * 50;

    if (adjustedScore > bestScore) {
      bestScore = adjustedScore;
      bestMove = move;
    }

    alpha = Math.max(alpha, adjustedScore);
    if (beta <= alpha) {
      break;
    }
  }

  return bestMove;
}

function minimaxWithDifficulty({ cases, depth, alpha, beta, isMaximizing, currentPlayer, rootPlayer, config }) {
  if (depth === 0) {
    return evaluateBoardWithDifficulty(cases, rootPlayer, config);
  }

  const moves = getAllLegalMoves(currentPlayer, cases);
  if (moves.length === 0) {
    if (isKingInCheck(cases, currentPlayer)) {
      return isMaximizing ? -999999 + (config.depth - depth) : 999999 - (config.depth - depth);
    } else {
      return 0;
    }
  }

  const sortedMoves = sortMovesByPriorityWithRandomness(moves, cases, currentPlayer, config.randomFactor);

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (let move of sortedMoves) {
      const undo = applyMove(move, cases);
      
      const evale = minimaxWithDifficulty({
        cases,
        depth: depth - 1,
        alpha,
        beta,
        isMaximizing: false,
        currentPlayer: currentPlayer === 'white' ? 'black' : 'white',
        rootPlayer,
        config
      });
      
      undoMove(undo, cases);
      
      maxEval = Math.max(maxEval, evale);
      alpha = Math.max(alpha, evale);
      
      if (beta <= alpha) {
        break;
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let move of sortedMoves) {
      const undo = applyMove(move, cases);
      
      const evale = minimaxWithDifficulty({
        cases,
        depth: depth - 1,
        alpha,
        beta,
        isMaximizing: true,
        currentPlayer: currentPlayer === 'white' ? 'black' : 'white',
        rootPlayer,
        config
      });
      
      undoMove(undo, cases);
      
      minEval = Math.min(minEval, evale);
      beta = Math.min(beta, evale);
      
      if (beta <= alpha) {
        break;
      }
    }
    return minEval;
  }
}

function evaluateBoardWithDifficulty(cases, color, config) {
  let score = 0;

  // Pondérer les différents aspects selon le niveau
  score += getMaterialValue(cases, color) * config.materialWeight;
  score += getPositionalValue(cases, color) * config.positionalWeight;
  score += getKingSafety(cases, color) * config.kingSafetyWeight;
  
  // Les niveaux faibles ne voient pas certains aspects stratégiques
  if (config.positionalWeight > 0.5) {
    score += getCenterControl(cases, color) * 0.5;
    score += getDevelopmentScore(cases, color) * 0.3;
  }
  
  if (config.positionalWeight > 0.7) {
    score += getPawnStructure(cases, color) * 0.2;
  }

  return score;
}

function sortMovesByPriorityWithRandomness(moves, cases, color, randomFactor) {
  // Trier normalement d'abord
  const sorted = sortMovesByPriority(moves, cases, color);
  
  // Ajouter de l'aléatoire selon le niveau
  if (randomFactor > 0.1) {
    // Mélanger un peu l'ordre pour les niveaux faibles
    for (let i = 0; i < Math.floor(sorted.length * randomFactor); i++) {
      const j = Math.floor(Math.random() * sorted.length);
      const k = Math.floor(Math.random() * sorted.length);
      [sorted[j], sorted[k]] = [sorted[k], sorted[j]];
    }
  }
  
  return sorted;
}

function getBlunderMove(moves, cases, color) {
  // Trouve un mouvement qui sacrifie du matériel ou expose le roi
  const blunderMoves = moves.filter(move => {
    const undo = applyMove(move, cases);
    
    // Vérifier si ce coup expose notre roi
    const kingSafe = !isKingInCheck(cases, color);
    
    // Vérifier si on sacrifie une pièce précieuse
    const sacrificesPiece = move.piece && getPieceValue(move.piece.type) > 100;
    
    undoMove(undo, cases);
    
    return !kingSafe || sacrificesPiece;
  });
  
  if (blunderMoves.length > 0) {
    return blunderMoves[Math.floor(Math.random() * blunderMoves.length)];
  }
  
  // Sinon, juste un coup aléatoire
  return moves[Math.floor(Math.random() * moves.length)];
}

function getSuboptimalMove(cases, currentColor, config) {
  // Utilise une profondeur réduite pour simuler une erreur tactique
  const moves = getAllLegalMoves(currentColor, cases);
  let bestMove = null;
  let bestScore = -Infinity;

  // Analyse superficielle (depth 1 ou 2 max)
  const shallowDepth = Math.max(1, config.depth - 2);

  for (let move of moves) {
    const undo = applyMove(move, cases);

    const score = minimaxWithDifficulty({
      cases,
      depth: shallowDepth,
      alpha: -Infinity,
      beta: Infinity,
      isMaximizing: false,
      currentPlayer: currentColor === 'white' ? 'black' : 'white',
      rootPlayer: currentColor,
      config: { ...config, depth: shallowDepth + 1 }
    });

    undoMove(undo, cases);

    // Plus d'aléatoire pour les erreurs
    const adjustedScore = score + (Math.random() - 0.5) * 100;

    if (adjustedScore > bestScore) {
      bestScore = adjustedScore;
      bestMove = move;
    }
  }

  return bestMove;
}

// Fonction utilitaire pour obtenir les infos du niveau
export function getDifficultyInfo(difficulty) {
  return DIFFICULTY_CONFIGS[difficulty] || DIFFICULTY_CONFIGS[3];
}

// Fonction pour ajuster dynamiquement la difficulté selon les performances du joueur
export function suggestDifficultyAdjustment(playerWins, aiWins, currentDifficulty) {
  const totalGames = playerWins + aiWins;
  
  if (totalGames < 3) {
    return { suggestion: currentDifficulty, reason: "Pas assez de parties pour évaluer" };
  }
  
  const winRate = playerWins / totalGames;
  
  if (winRate > 0.7 && currentDifficulty < 6) {
    return { 
      suggestion: currentDifficulty + 1, 
      reason: `Taux de victoire de ${Math.round(winRate * 100)}% - Augmenter la difficulté ?`
    };
  } else if (winRate < 0.3 && currentDifficulty > 1) {
    return { 
      suggestion: currentDifficulty - 1, 
      reason: `Taux de victoire de ${Math.round(winRate * 100)}% - Diminuer la difficulté ?`
    };
  }
  
  return { 
    suggestion: currentDifficulty, 
    reason: `Taux de victoire de ${Math.round(winRate * 100)}% - Niveau adapté`
  };
}

// Export de la fonction principale pour remplacer ton searchRoot
