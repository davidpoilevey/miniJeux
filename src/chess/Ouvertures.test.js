import { applyMove, getAllLegalMoves } from './movements';
import { FAMOUS_OPENINGS } from './Ouvertures';

const emptyBoard = () => Array.from({ length: 8 }, () => Array(8).fill(null));
const put = (board, type, couleur, x, y) => {
  board[y][x] = { id: `${type}-${couleur}-${x}-${y}`, type, couleur, x, y, hasMoved: false };
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

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const sq = p => files[p.col] + (8 - p.row);

// Un coup du livre injouable fige la partie : l'IA ne trouve rien à jouer et le joueur
// se fait refuser tous ses coups. Chaque ligne doit donc être jouable de bout en bout.
test.each(Object.keys(FAMOUS_OPENINGS))('la ligne %s est entièrement légale', key => {
  const opening = FAMOUS_OPENINGS[key];
  const board = initialBoard();
  const state = {};
  opening.moves.forEach((bookMove, index) => {
    const move = getAllLegalMoves(bookMove.color, board, state).find(candidate =>
      candidate.from.x === bookMove.from.col && candidate.from.y === bookMove.from.row &&
      candidate.to.x === bookMove.to.col && candidate.to.y === bookMove.to.row);
    expect(move ? 'ok' : `coup ${index} injouable : ${sq(bookMove.from)}-${sq(bookMove.to)} (${bookMove.color})`).toBe('ok');
    applyMove(move, board, state);
  });
});
