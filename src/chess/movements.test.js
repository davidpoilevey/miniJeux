import { applyMove, undoMove, getAllLegalMoves } from './movements';
import { isInsufficientMaterial, isKingInCheck, isCheckmate, searchRoot, searchRootWithDifficulty } from './reflexions';

const emptyBoard = () => Array.from({ length: 8 }, () => Array(8).fill(null));
const put = (board, type, couleur, x, y, hasMoved = false) => {
  board[y][x] = { id: `${type}-${couleur}-${x}-${y}`, type, couleur, x, y, hasMoved };
  return board[y][x];
};
const kings = () => {
  const board = emptyBoard();
  put(board, 'roi', 'white', 4, 7);
  put(board, 'roi', 'black', 4, 0);
  return board;
};

function initialBoard() {
  const board = emptyBoard();
  const types = ['tour', 'cavalier', 'fou', 'reine', 'roi', 'fou', 'cavalier', 'tour'];
  types.forEach((type, x) => {
    put(board, type, 'black', x, 0);
    put(board, 'pion', 'black', x, 1);
    put(board, 'pion', 'white', x, 6);
    put(board, type, 'white', x, 7);
  });
  return board;
}

function perft(board, color, depth, state = {}) {
  if (!depth) return 1;
  let count = 0;
  for (const move of getAllLegalMoves(color, board, state)) {
    const undo = applyMove(move, board, state);
    count += perft(board, color === 'white' ? 'black' : 'white', depth - 1, state);
    undoMove(undo, board, state);
  }
  return count;
}

test('les simulations conservent intégralement le plateau et les droits de roque', () => {
  const board = kings();
  put(board, 'tour', 'white', 0, 7);
  put(board, 'tour', 'white', 7, 7);
  const before = JSON.parse(JSON.stringify(board));
  const moves = getAllLegalMoves('white', board);
  expect(moves.filter(m => m.special?.startsWith('castle'))).toHaveLength(2);
  expect(board).toEqual(before);
  for (const move of moves) {
    const state = { enPassantTarget: { x: 3, y: 2 } };
    const originalState = { ...state };
    const undo = applyMove(move, board, state);
    undoMove(undo, board, state);
    expect(board).toEqual(before);
    expect(state).toEqual(originalState);
  }
});

test('les promotions et captures sont réversibles', () => {
  const board = kings();
  put(board, 'pion', 'white', 0, 1, true);
  put(board, 'tour', 'black', 1, 0, true);
  const before = JSON.parse(JSON.stringify(board));
  const moves = getAllLegalMoves('white', board, { pieceId: board[1][0].id });
  expect(moves.filter(m => m.promotion)).toHaveLength(8);
  for (const move of moves) {
    const undo = applyMove(move, board);
    undoMove(undo, board);
    expect(board).toEqual(before);
  }
});

test.each(['white', 'black'])('en passant pour %s : capture, annulation et expiration', color => {
  const board = kings();
  const y = color === 'white' ? 3 : 4;
  const targetY = color === 'white' ? 2 : 5;
  put(board, 'pion', color, 4, y, true);
  put(board, 'pion', color === 'white' ? 'black' : 'white', 3, y, true);
  const state = { enPassantTarget: { x: 3, y: targetY } };
  const before = JSON.parse(JSON.stringify(board));
  const ep = getAllLegalMoves(color, board, state).find(m => m.special === 'enPassant');
  expect(ep).toBeDefined();
  expect(board).toEqual(before);
  const undo = applyMove(ep, board, state);
  expect(board[y][3]).toBeNull();
  expect(board[targetY][3].couleur).toBe(color);
  expect(undo.captured.type).toBe('pion');
  expect(state.enPassantTarget).toBeNull();
  undoMove(undo, board, state);
  expect(board).toEqual(before);
  const other = getAllLegalMoves(color, board, state).find(m => m.piece.type === 'roi');
  applyMove(other, board, state);
  expect(getAllLegalMoves(color, board, state).some(m => m.special === 'enPassant')).toBe(false);
});

test('en passant ne peut pas découvrir une attaque sur son propre roi', () => {
  const board = emptyBoard();
  put(board, 'roi', 'white', 7, 3);
  put(board, 'roi', 'black', 7, 0);
  put(board, 'tour', 'black', 0, 3);
  put(board, 'pion', 'white', 6, 3, true);
  put(board, 'pion', 'black', 5, 3, true);
  const before = JSON.parse(JSON.stringify(board));
  expect(getAllLegalMoves('white', board, { enPassantTarget: { x: 5, y: 2 } }).some(m => m.special === 'enPassant')).toBe(false);
  expect(board).toEqual(before);
});

test('en passant est pris en compte pour répondre à un échec', () => {
  const board = emptyBoard();
  put(board, 'roi', 'white', 4, 4);
  put(board, 'roi', 'black', 7, 0);
  put(board, 'pion', 'white', 4, 3, true);
  put(board, 'pion', 'black', 3, 3, true);
  const state = { enPassantTarget: { x: 3, y: 2 } };
  expect(isKingInCheck(board, 'white')).toBe(true);
  const move = getAllLegalMoves('white', board, state).find(m => m.special === 'enPassant');
  expect(move).toBeDefined();
  applyMove(move, board, state);
  expect(isKingInCheck(board, 'white')).toBe(false);
  expect(isCheckmate(board, 'white', state)).toBe(false);
});

test.each([
  [[], true], [['tour'], false], [['reine'], false], [['pion'], false],
  [['fou'], true], [['cavalier'], true], [['cavalier', 'cavalier'], false],
  [['fou', 'cavalier'], false]
])('matériel restant %j : insuffisant = %s', (types, expected) => {
  const board = kings();
  types.forEach((type, x) => put(board, type, 'white', x, 5));
  expect(isInsufficientMaterial(board)).toBe(expected);
});

test('fous seuls : nulle uniquement si toutes les cases sont de même couleur', () => {
  const board = kings();
  put(board, 'fou', 'white', 0, 5);
  put(board, 'fou', 'black', 2, 3);
  expect(isInsufficientMaterial(board)).toBe(true);
  board[3][2] = null;
  put(board, 'fou', 'black', 3, 3);
  expect(isInsufficientMaterial(board)).toBe(false);
});

test('nombre de positions légales initiales aux profondeurs 1, 2 et 3', () => {
  const board = initialBoard();
  const before = JSON.parse(JSON.stringify(board));
  expect(perft(board, 'white', 1)).toBe(20);
  expect(perft(board, 'white', 2)).toBe(400);
  expect(perft(board, 'white', 3)).toBe(8902);
  expect(board).toEqual(before);
});

test('la recherche IA et les suggestions voient en passant sans changer le plateau', () => {
  const board = kings();
  put(board, 'pion', 'white', 4, 3, true);
  put(board, 'pion', 'black', 3, 3, true);
  const before = JSON.parse(JSON.stringify(board));
  const state = { enPassantTarget: { x: 3, y: 2 } };
  const originalState = JSON.parse(JSON.stringify(state));
  const random = jest.spyOn(Math, 'random').mockReturnValue(0.5);
  try {
    expect(searchRoot(board, 'white', 2, state).special).toBe('enPassant');
    expect(searchRootWithDifficulty(board, 'white', 1, state).special).toBe('enPassant');
    expect(board).toEqual(before);
    expect(state).toEqual(originalState);
  } finally { random.mockRestore(); }
});
