/**
 * 
 *
 type Move = {
  from: { x: number, y: number },
  to: { x: number, y: number },
  piece: Piece,
  captured?: Piece,
  promotion?: 'queen' | 'rook' | ...
  special?: 'castlingShort'|'castleLong' | 'enPassant'
}

 */

import { filterLegalMoves, isSquareAttacked } from "./reflexions";

// opts (enPassantTarget, promotions)
export const getAllLegalMoves=(color, cases, opts = {})=> {
  let moves = [];

  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
      const piece = cases[y][x];
      if (piece && piece.couleur === color) {
        if(opts.pieceId && opts.pieceId !== piece.id)
             continue;
        let pieceMoves = [];

        switch (piece.type) {
          case 'pion':
            pieceMoves = generatePawnMoves(piece, cases, opts);
            break;
        case 'tour':
          pieceMoves = generateRookMoves(piece, cases, opts);
          break;
        case 'cavalier':
          pieceMoves = generateKnightMoves(piece, cases, opts);
          break;
        case 'fou':
          pieceMoves = generateBishopMoves(piece, cases, opts);
          break;
        case 'reine':
          pieceMoves = generateQueenMoves(piece, cases, opts);
          break;
        case 'roi':
          pieceMoves = generateKingMoves(piece, cases, opts);
          break;
        default:
          break;
        }

        moves=moves.concat(pieceMoves);
      }
    }
  }
moves = filterLegalMoves(moves, cases, color);
  return moves;
}
export const applyMove=(move, board, state={})=> {
  const { from, to, piece, captured, promotion, special } = move;

  // Snapshots pour undo
  const prevEnPassant = state.enPassantTarget;
  const fromPieceBefore = { ...piece };

  // Enlever de la case de départ
  board[from.y][from.x] = null;

  // Gestion en passant
  let capturedPiece = null;
  if (special === 'enPassant') {
    const direction = piece.couleur === 'white' ? 1 : -1;
    const capY = to.y + direction;
    capturedPiece = board[capY][to.x];
    board[capY][to.x] = null;
  }
  if (special === 'castleShort' || special === 'castleLong') {
  const y = from.y;
  if (special === 'castleShort') {
    // roi e -> g, tour h -> f  (x: 4->6, 7->5)
    const rookFromX = 7;
    const rookToX = 5;
    move._castleRook = board[y][rookFromX];
    board[y][rookFromX] = null;
    board[y][rookToX] = { ...move._castleRook, x: rookToX, y, hasMoved: true };
  } else {
    // roi e -> c, tour a -> d  (x: 4->2, 0->3)
    const rookFromX = 0;
    const rookToX = 3;
    move._castleRook = board[y][rookFromX];
    board[y][rookFromX] = null;
    board[y][rookToX] = { ...move._castleRook, x: rookToX, y, hasMoved: true };
  }
}


  // Capture classique
  if (captured) {
    capturedPiece = board[to.y][to.x];
  }

  // Promotion ?
  let placedPiece = piece;
  if (promotion) {
    placedPiece = {
      id: piece.id + '_promoted',
      type: promotion,
      couleur: piece.couleur,
      x: to.x,
      y: to.y,
      hasMoved: true
    };
  } else {
    placedPiece = {
      ...piece,
      x: to.x,
      y: to.y,
      hasMoved: true
    };
  }

  // Place la pièce
  board[to.y][to.x] = placedPiece;

  // Mettre à jour enPassantTarget (uniquement si un pion vient de sauter 2 cases)
  let newEnPassant = null;
  if (piece.type === 'pion' && Math.abs(to.y - from.y) === 2) {
    // la case "sautée"
    newEnPassant = { y: (to.y + from.y) / 2, x: to.x };
  }
  state.enPassantTarget = newEnPassant;

  // Retourner ce qu’il faut pour undo
  return {
    from,
    to,
    piece: placedPiece,
    captured: capturedPiece,
    undoPromote: promotion ? piece : null,
    special,
    prevEnPassant
  };
}

export const undoMove=(undo, board, state={})=> {
  const { from, to, piece, captured, undoPromote, special, prevEnPassant } = undo;

  // Vider la case d'arrivée
  board[to.y][to.x] = null;

  // Restaure le pion original si promotion
  const restoredPiece = undoPromote
    ? { ...undoPromote } // le pion d'origine
    : { ...piece, x: from.x, y: from.y };

  // Restaure la pièce à la case de départ
  board[from.y][from.x] = restoredPiece;

  // Restaure la pièce capturée
  if (captured) {
    if (special === 'enPassant') {
      const dir = restoredPiece.couleur === 'white' ? 1 : -1;
      const capy = to.y + dir;
      board[capy][to.x] = captured;
    } else {
      board[to.y][to.x] = captured;
    }
  }
  if (special === 'castleShort' || special === 'castleLong') {
  const y = from.y;
  if (special === 'castleShort') {
    const rookFromX = 7;
    const rookToX = 5;
    board[y][rookFromX] = { ...board._castleRook, x: rookFromX, y };
    board[y][rookToX] = null;
  } else {
    const rookFromX = 0;
    const rookToX = 3;
    board[y][rookFromX] = { ...board._castleRook, x: rookFromX, y };
    board[y][rookToX] = null;
  }
}


  // Restaure l'état enPassant
  state.enPassantTarget = prevEnPassant;
}

function inside(x, y) {
  return x >= 0 && x < 8 && y >= 0 && y < 8;
}

/**
 * Génère les coups légaux pour un pion.
 *
 * @param {Object} piece - { id, type: 'pawn', couleur: 'white'|'black', x, y, ... }
 * @param {Array<Array<Object|null>>} cases - board 8x8
 * @param {Object} opts
 * @param {{x:number,y:number}|null} [opts.enPassantTarget] - case où un en passant est possible
 * @param {Array<string>} [opts.promotions] - pièces possibles en promotion
 * @returns {Array<Object>} moves
 *
 * Move = {
 *   from: {x,y},
 *   to: {x,y},
 *   piece,
 *   captured?: piece|null,
 *   promotion?: 'queen'|'rook'|'bishop'|'knight',
 *   special?: 'enPassant'
 * }
 */
function generatePawnMoves(piece, cases, opts = {}) {
  const enPassantTarget = opts.enPassantTarget || null;
  const promotions = opts.promotions || ['reine', 'tour', 'fou', 'cavalier'];

  const moves = [];
  const dir = piece.couleur === 'white' ? -1 : 1;
  const startRank = piece.couleur === 'white' ? 6 : 1;
  const promoRank = piece.couleur === 'white' ? 0 : 7;

  const x = piece.x;
  const y = piece.y;

  // 1) Avance d'une case
  const oneY = y + dir;
  if (inside(x, oneY) && cases[oneY][x] == null) {
    pushForwardMove(x, oneY);

    // 2) Avance de deux cases depuis le rang de départ (si la case du milieu est libre aussi)
    const twoY = y + 2 * dir;
    if (y === startRank && cases[twoY][x] == null) {
      moves.push({
        from: { x, y },
        to: { x, y:twoY },
        piece
      });
    }
  }

  // 3) Prises diagonales
  [-1, 1].forEach(dx => {
    const tx = x + dx;
    const ty = y + dir;
    if (!inside(tx, ty)) return;
    const target = cases[ty][tx];
    if (target && target.couleur !== piece.couleur) {
      pushCaptureMove(tx, ty, target);
    }
  });

  // 4) En passant
  if (enPassantTarget) {
    const ex = enPassantTarget.x;
    const ey = enPassantTarget.y;
    if (ey === y + dir && Math.abs(ex - x) === 1) {
      const capturedPawn = cases[y][ex]; // le pion à côté, sur la rangée actuelle
      if (capturedPawn && capturedPawn.type === 'pion' && capturedPawn.couleur !== piece.couleur) {
        moves.push({
          from: { x, y },
          to: { x: ex, y: ey },
          piece,
          captured: capturedPawn,
          special: 'enPassant'
        });
      }
    }
  }

  return moves;

  // ------------ Helpers

  function pushForwardMove(tx, ty) {
    if (ty === promoRank) {
      promotions.forEach(p => {
        moves.push({
          from: { x, y },
          to: { x: tx, y: ty },
          piece,
          promotion: p
        });
      });
    } else {
      moves.push({
        from: { x, y },
        to: { x: tx, y: ty },
        piece
      });
    }
  }

  function pushCaptureMove(tx, ty, captured) {
    if (ty === promoRank) {
      promotions.forEach(p => {
        moves.push({
          from: { x, y },
          to: { x: tx, y: ty },
          piece,
          captured,
          promotion: p
        });
      });
    } else {
      moves.push({
        from: { x, y },
        to: { x: tx, y: ty },
        piece,
        captured
      });
    }
  }
}
function generateKnightMoves(piece, cases) {
  if (!piece || (piece.type !== 'cavalier')) return [];

  const moves = [];
  const { x, y } = piece;

  const myColor = piece.couleur != null ? piece.couleur : piece.color;
  const height = cases.length;
  const width = cases[0].length;

  const deltas = [
    { dx:  1, dy:  2 },
    { dx:  2, dy:  1 },
    { dx:  2, dy: -1 },
    { dx:  1, dy: -2 },
    { dx: -1, dy: -2 },
    { dx: -2, dy: -1 },
    { dx: -2, dy:  1 },
    { dx: -1, dy:  2 },
  ];

  for (const { dx, dy } of deltas) {
    const nx = x + dx;
    const ny = y + dy;

    if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;

    const target = cases[ny][nx];
    if (!target) {
      // case vide
      moves.push({
        from: { x, y },
        to: { x: nx, y: ny },
        piece
      });
    } else {
      const targetColor = target.couleur != null ? target.couleur : target.color;
      if (targetColor !== myColor) {
        // capture
        moves.push({
          from: { x, y },
          to: { x: nx, y: ny },
          piece,
          captured: target
        });
      }
      // sinon, même couleur -> pas jouable
    }
  }

  return moves;
}
function generateRookMoves(piece, cases) {
  if (!piece || (piece.type !== 'tour'&&piece.type!='reine')) return [];

  const moves = [];
  const { x, y } = piece;
  const color = piece.couleur || piece.color;

  const height = cases.length;
  const width = cases[0].length;

  const directions = [
    { dx: 0, dy: -1 }, // ↑
    { dx: 0, dy:  1 }, // ↓
    { dx: -1, dy: 0 }, // ←
    { dx:  1, dy: 0 }, // →
  ];

  for (const { dx, dy } of directions) {
    let nx = x + dx;
    let ny = y + dy;

    while (nx >= 0 && nx < width && ny >= 0 && ny < height) {
      const target = cases[ny][nx];

      if (!target) {
        // case vide
        moves.push({
          from: { x, y },
          to: { x: nx, y: ny },
          piece
        });
      } else {
        const targetColor = target.couleur || target.color;
        if (targetColor !== color) {
          // capture
          moves.push({
            from: { x, y },
            to: { x: nx, y: ny },
            piece,
            captured: target
          });
        }
        // bloqué, on s’arrête
        break;
      }

      nx += dx;
      ny += dy;
    }
  }

  return moves;
}
function generateBishopMoves(piece, cases) {
  if (!piece || (piece.type !== 'fou'&&piece.type!='reine')) return [];

  const moves = [];
  const { x, y } = piece;
  const color = piece.couleur || piece.color;

  const height = cases.length;
  const width = cases[0].length;

  const directions = [
    { dx: -1, dy: -1 }, // ↖
    { dx: -1, dy:  1 }, // ↗
    { dx:  1, dy: -1 }, // ↙
    { dx:  1, dy:  1 }, // ↘
  ];

  for (const { dx, dy } of directions) {
    let nx = x + dx;
    let ny = y + dy;

    while (nx >= 0 && nx < width && ny >= 0 && ny < height) {
      const target = cases[ny][nx];

      if (!target) {
        // case vide
        moves.push({
          from: { x, y },
          to: { x: nx, y: ny },
          piece
        });
      } else {
        const targetColor = target.couleur || target.color;
        if (targetColor !== color) {
          // capture
          moves.push({
            from: { x, y },
            to: { x: nx, y: ny },
            piece,
            captured: target
          });
        }
        // bloqué, on s’arrête
        break;
      }

      nx += dx;
      ny += dy;
    }
  }

  return moves;
}
function generateQueenMoves(piece, cases) {
  if (!piece || piece.type !== 'reine') return [];

  // La reine combine les mouvements de la tour et du fou
  return [
    ...generateRookMoves(piece, cases),
    ...generateBishopMoves(piece, cases)
  ];
}
function generateKingMoves(piece, cases) {
  if (!piece || piece.type !== 'roi') return [];

  const moves = [];
  const { x, y } = piece;
  const color = piece.couleur || piece.color;

  const height = cases.length;
  const width = cases[0].length;

  const deltas = [
    { dx: -1, dy: -1 }, // ↖
    { dx: -1, dy:  0 }, // ↑
    { dx: -1, dy:  1 }, // ↗
    { dx:  0, dy: -1 }, // ←
    { dx:  0, dy:  1 }, // →
    { dx:  1, dy: -1 }, // ↙
    { dx:  1, dy:  0 }, // ↓
    { dx:  1, dy:  1 }, // ↘
  ];

  for (const { dx, dy } of deltas) {
    const nx = x + dx;
    const ny = y + dy;

    if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;

    const target = cases[ny][nx];
    if (!target) {
      // case vide
      moves.push({
        from: { x, y },
        to: { x: nx, y: ny },
        piece
      });
    } else {
      const targetColor = target.couleur || target.color;
      if (targetColor !== color) {
        // capture
        moves.push({
          from: { x, y },
          to: { x: nx, y: ny },
          piece,
          captured: target
        });
      }
      // sinon, même couleur -> pas jouable
    }
  }

    // 2) Roques
  // conditions de base : le roi n'a jamais bougé et n'est pas en échec
  if (!piece.hasMoved && !isSquareAttacked(cases, x, y, color === 'white' ? 'black' : 'white')) {
    // PETIT roque (côté roi)
    // blanc: roi e1 -> g1 (x=4 -> 6, y=7); noir: e8 -> g8 (x=4 -> 6, y=0) 
    // (adapte à ton orientation)

    // court (roi -> x+2)
    if (canCastleShort(cases, piece, isSquareAttacked)) {
      moves.push({
        from: { x, y },
        to: { x: x + 2, y },
        piece,
        special: 'castleShort'
      });
    }

    // long (roi -> x-2)
    if (canCastleLong(cases, piece, isSquareAttacked)) {
      moves.push({
        from: { x, y },
        to: { x: x - 2, y },
        piece,
        special: 'castleLong'
      });
    }
  }

  return moves;
}

function canCastleShort(cases, king, isSquareAttacked) {
  const color = king.couleur;
  const y = king.y;
  const enemy = color === 'white' ? 'black' : 'white';

  const rook = cases[y][7];
  if (!rook || rook.type !== 'tour' || rook.couleur !== color || rook.hasMoved) return false;

  // cases entre roi et tour doivent être vides
  if (cases[y][5] || cases[y][6]) return false;

  // roi ne traverse pas des cases attaquées
  if (
    isSquareAttacked(cases, 5, y, enemy) ||
    isSquareAttacked(cases, 6, y, enemy)
  ) return false;

  return true;
}

function canCastleLong(cases, king, isSquareAttacked) {
  const color = king.couleur;
  const y = king.y;
  const enemy = color === 'white' ? 'black' : 'white';

  const rook = cases[y][0];
  if (!rook || rook.type !== 'tour' || rook.couleur !== color || rook.hasMoved) return false;

  // cases entre roi et tour
  if (cases[y][1] || cases[y][2] || cases[y][3]) return false;

  if (
    isSquareAttacked(cases, 2, y, enemy) ||
    isSquareAttacked(cases, 3, y, enemy)
  ) return false;

  return true;
}



