import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { ChessProvider, useChess } from './ChessContext';
import { EchecBoard } from './EchecBoard';
import { OpeningManager } from './Ouvertures';
import { getAllLegalMoves } from './movements';

jest.mock('../rpg/sons/SoundManager', () => ({ soundManager: { loadSounds: jest.fn(), play: jest.fn() } }));
jest.mock('../civ/utils/saveGame', () => ({ loadGame: jest.fn(), saveGame: jest.fn() }));
jest.mock('../ChuckNorrisFact', () => ({ GameOver: ({ open, handleClose }) => open ? <button onClick={handleClose}>Fermer fin</button> : null }));
jest.mock('../civ/utils/MainMenu', () => ({ useMainMenuStyles: {} }));
jest.mock('../dames/Case', () => ({ Case: ({ x, y, children, onClick }) => <button data-testid={`case-${x}-${y}`} onClick={onClick}>{children}</button> }));
jest.mock('./Piece', () => ({ __esModule: true, default: ({ piece }) => piece ? `${piece.type}-${piece.couleur}` : null }));
jest.mock('./ParamDialog', () => ({
  DialogPromotion: ({ open, onChoose }) => open ? <button onClick={() => onChoose('cavalier')}>Promouvoir</button> : null,
  PuzzleSuccess: ({ open }) => open ? <span>Puzzle résolu</span> : null
}));
jest.mock('./InfoPanel', () => ({ __esModule: true, default: function Controls({ reset, gameOver }) {
  const chess = require('./ChessContext').useChess();
  return <>
    <button onClick={() => chess.changeCouleurJoueur('black')}>Noirs</button>
    <button onClick={chess.handleUndo}>Annuler</button>
    <button onClick={reset}>Repartir</button>
    <button onClick={() => gameOver('Abandon', 'black')}>Terminer</button>
    <output data-testid="state">{JSON.stringify({ board: chess.cases, turn: chess.tourBlancs, captures: chess.captured, ep: chess.enPassantTarget, finished: chess.gameFinished })}</output>
  </>;
} }));

let chess;
function Access() { chess = useChess(); return null; }
function setup() { return render(<ChessProvider><Access /><EchecBoard /></ChessProvider>); }
const square = (x, y) => screen.getByTestId(`case-${x}-${y}`);
const move = (x, y, tx, ty) => { fireEvent.click(square(x, y)); fireEvent.click(square(tx, ty)); };
const state = () => JSON.parse(screen.getByTestId('state').textContent);
const tick = () => act(() => jest.advanceTimersByTime(60));
const customBoard = pieces => {
  const board = Array.from({ length: 8 }, () => Array(8).fill(null));
  for (const [type, couleur, x, y] of pieces) board[y][x] = { id: `${type}-${couleur}-${x}-${y}`, type, couleur, x, y, hasMoved: true };
  act(() => { chess.setCases(board); chess.setTourBlancs(true); });
};

beforeEach(() => {
  jest.useFakeTimers();
  jest.spyOn(OpeningManager.prototype, 'getAIMove').mockImplementation((board, color, difficulty, opts) =>
    getAllLegalMoves(color, board, opts).find(m => m.piece.type === 'pion' && m.from.x === 4 && Math.abs(m.to.y - m.from.y) === 2) ||
    getAllLegalMoves(color, board, opts)[0]);
});
afterEach(() => { jest.clearAllTimers(); jest.useRealTimers(); jest.restoreAllMocks(); });

test('annuler le premier tour puis plusieurs tours restaure les positions', () => {
  setup();
  const initial = state().board;
  fireEvent.click(screen.getByText('Annuler'));
  expect(state().board).toEqual(initial);
  move(4, 6, 4, 4); tick();
  const first = state().board;
  move(6, 7, 5, 5); tick();
  fireEvent.click(screen.getByText('Annuler'));
  expect(state().board).toEqual(first);
  fireEvent.click(screen.getByText('Annuler'));
  expect(state().board).toEqual(initial);
  expect(state().ep).toBeNull();
});

test('annuler ou recommencer pendant le délai IA annule le coup programmé', () => {
  setup();
  const initial = state().board;
  move(4, 6, 4, 4);
  fireEvent.click(screen.getByText('Annuler')); tick();
  expect(state().board).toEqual(initial);
  expect(OpeningManager.prototype.getAIMove).not.toHaveBeenCalled();
  move(4, 6, 4, 4);
  fireEvent.click(screen.getByText('Repartir')); tick();
  expect(state().board).toEqual(initial);
  expect(OpeningManager.prototype.getAIMove).not.toHaveBeenCalled();
});

test('jouer les noirs : les blancs commencent, puis les noirs sont sélectionnables', () => {
  setup();
  fireEvent.click(screen.getByText('Noirs'));
  expect(square(4, 0).textContent).toBe('roi-black');
  expect(square(3, 0).textContent).toBe('reine-black');
  expect(screen.getAllByTestId(/^case-/)[0]).toBe(square(7, 7));
  move(4, 1, 4, 3);
  expect(state().board[1][4]).not.toBeNull();
  tick();
  expect(OpeningManager.prototype.getAIMove.mock.calls[0][1]).toBe('white');
  expect(state().board[4][4].couleur).toBe('white');
  move(4, 1, 4, 3);
  expect(state().board[3][4].couleur).toBe('black');
  expect(state().turn).toBe(true);
});

test('fin de partie : fermer le dialogue ne permet pas de continuer', () => {
  setup();
  move(4, 6, 4, 4);
  const before = state().board;
  fireEvent.click(screen.getByText('Terminer'));
  fireEvent.click(screen.getByText('Fermer fin')); tick();
  expect(OpeningManager.prototype.getAIMove).not.toHaveBeenCalled();
  move(3, 6, 3, 4);
  expect(state().board).toEqual(before);
  expect(state().finished).toBe(true);
  fireEvent.click(screen.getByText('Repartir'));
  move(3, 6, 3, 4);
  expect(state().board[4][3].couleur).toBe('white');
});

test('capture en passant sur le plateau, comptage et annulation', () => {
  setup();
  customBoard([['roi', 'white', 4, 7], ['roi', 'black', 4, 0], ['pion', 'white', 4, 3], ['pion', 'black', 3, 3]]);
  act(() => chess.setEnPassantTarget({ x: 3, y: 2 }));
  const before = state().board;
  move(4, 3, 3, 2);
  expect(state().board[3][3]).toBeNull();
  expect(state().board[2][3].couleur).toBe('white');
  expect(state().captures.white).toEqual(['pion']);
  fireEvent.click(screen.getByText('Annuler'));
  expect(state().board).toEqual(before);
  expect(state().captures.white).toEqual([]);
  expect(state().ep).toEqual({ x: 3, y: 2 });
});

test('le choix de promotion termine le coup et peut être annulé', () => {
  setup();
  customBoard([['roi', 'white', 4, 7], ['roi', 'black', 4, 0], ['pion', 'white', 0, 1], ['tour', 'black', 7, 0]]);
  const before = state().board;
  move(0, 1, 0, 0);
  expect(state().board).toEqual(before);
  fireEvent.click(screen.getByText('Promouvoir'));
  expect(state().board[0][0].type).toBe('cavalier');
  fireEvent.click(screen.getByText('Annuler'));
  expect(state().board).toEqual(before);
});

test('une nulle après un coup empêche toute réponse IA', () => {
  setup();
  customBoard([['roi', 'white', 4, 7], ['roi', 'black', 4, 0], ['fou', 'white', 0, 5]]);
  move(0, 5, 1, 4); tick();
  expect(state().finished).toBe(true);
  expect(OpeningManager.prototype.getAIMove).not.toHaveBeenCalled();
});

test('la sauvegarde et le chargement conservent la possibilité de prendre en passant', () => {
  const { saveGame, loadGame } = require('../civ/utils/saveGame');
  setup();
  customBoard([['roi', 'white', 4, 7], ['roi', 'black', 4, 0], ['pion', 'white', 4, 3], ['pion', 'black', 3, 3]]);
  act(() => chess.setEnPassantTarget({ x: 3, y: 2 }));
  act(() => chess.savePartie());
  const saved = saveGame.mock.calls[saveGame.mock.calls.length - 1][0];
  expect(saved.enPassantTarget).toEqual({ x: 3, y: 2 });
  fireEvent.click(screen.getByText('Repartir'));
  loadGame.mockReturnValue(saved);
  act(() => chess.loadPartie());
  move(4, 3, 3, 2);
  expect(state().board[3][3]).toBeNull();
  expect(state().captures.white).toEqual(['pion']);
});

test('la promotion humaine fonctionne aussi avec les noirs', () => {
  setup();
  fireEvent.click(screen.getByText('Noirs')); tick();
  customBoard([['roi', 'white', 4, 7], ['roi', 'black', 4, 0], ['pion', 'black', 0, 6], ['tour', 'white', 7, 7]]);
  act(() => chess.setTourBlancs(false));
  move(0, 6, 0, 7);
  fireEvent.click(screen.getByText('Promouvoir'));
  expect(state().board[7][0].type).toBe('cavalier');
  expect(state().board[7][0].couleur).toBe('black');
});

test('un coup refusé par une ouverture ne modifie ni plateau ni historique', () => {
  setup();
  act(() => {
    chess.openingManager.startOpening('ruy_lopez');
    chess.openingManager.playerCanDeviate = false;
  });
  const initial = state().board;
  move(3, 6, 3, 4);
  expect(state().board).toEqual(initial);
  fireEvent.click(screen.getByText('Annuler'));
  expect(state().board).toEqual(initial);
  expect(state().turn).toBe(true);
});

test.each([[6, 5, 7], [2, 3, 0]])('roque vers la colonne %s et annulation de la tour', (kingX, rookX, originalRookX) => {
  setup();
  customBoard([['roi', 'white', 4, 7], ['roi', 'black', 4, 0], ['tour', 'white', originalRookX, 7]]);
  act(() => chess.setCases(chess.cases.map(row => row.map(piece => piece ? { ...piece, hasMoved: false } : null))));
  const before = state().board;
  move(4, 7, kingX, 7);
  expect(state().board[7][kingX].type).toBe('roi');
  expect(state().board[7][rookX].type).toBe('tour');
  expect(state().board[7][originalRookX]).toBeNull();
  fireEvent.click(screen.getByText('Annuler'));
  expect(state().board).toEqual(before);
});

test('le livre des ouvertures fonctionne avec les noirs et après annulation', () => {
  OpeningManager.prototype.getAIMove.mockRestore();
  setup();
  fireEvent.click(screen.getByText('Noirs'));
  act(() => chess.openingManager.startOpening('ruy_lopez', 'black'));
  tick();
  expect(state().board[4][4].couleur).toBe('white');
  const before = state().board;
  move(4, 1, 4, 3); tick();
  expect(state().board[5][5].type).toBe('cavalier');
  fireEvent.click(screen.getByText('Annuler'));
  expect(state().board).toEqual(before);
  expect(chess.openingManager.moveIndex).toBe(1);
  move(4, 1, 4, 3); tick();
  expect(state().board[5][5].type).toBe('cavalier');
});

test('un puzzle refuse les mauvais coups puis valide sa solution', () => {
  setup();
  act(() => chess.startPuzzle('back_rank_mate_simple'));
  const before = state().board;
  move(3, 7, 3, 6);
  expect(state().board).toEqual(before);
  move(3, 7, 3, 0);
  expect(state().board[0][3].type).toBe('tour');
  act(() => jest.advanceTimersByTime(1500));
  expect(screen.getByText('Puzzle résolu')).toBeTruthy();
  expect(OpeningManager.prototype.getAIMove).not.toHaveBeenCalled();
});

test('une réponse de puzzle utilise le nouveau plateau et est annulée au redémarrage', () => {
  setup();
  act(() => chess.startPuzzle('back_rank_mate_simple'));
  customBoard([['roi', 'white', 4, 7], ['roi', 'black', 4, 0], ['pion', 'white', 4, 6], ['pion', 'black', 3, 1]]);
  jest.spyOn(chess.puzzleManager, 'validateMove').mockReturnValue({
    valid: true, solved: false, autoMoves: [{ from: { row: 1, col: 3 }, to: { row: 3, col: 3 } }]
  });
  move(4, 6, 4, 4);
  act(() => jest.advanceTimersByTime(500));
  expect(state().board[4][4].couleur).toBe('white');
  expect(state().board[3][3].couleur).toBe('black');
  expect(state().turn).toBe(true);
  fireEvent.click(screen.getByText('Repartir'));
  const before = state().board;
  act(() => jest.advanceTimersByTime(2000));
  expect(state().board).toEqual(before);
});
