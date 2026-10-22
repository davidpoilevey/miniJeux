import { render, screen, act, fireEvent } from '@testing-library/react';
import ParametresDialog from './ParamDialog';
import { ChessProvider, useChess } from './ChessContext';

let chess;
function Spy() { chess = useChess(); return null; }

test('le bouton personnalisé déplie les réglages fins', () => {
  render(<ChessProvider><Spy /><ParametresDialog open handleClose={() => {}} reset={() => {}} /></ChessProvider>);
  const btn = screen.getByText(/Régler l'IA moi-même/i);
  expect(screen.queryByText(/Chance de bourde/i)).toBeNull();
  act(() => { fireEvent.click(btn); });
  expect(chess.difficulte).toBe(0);
  expect(screen.getByText(/Chance de bourde/i)).toBeTruthy();
  expect(screen.getByText(/Personnalisé/)).toBeTruthy();
  act(() => { fireEvent.click(screen.getByText(/Revenir aux niveaux prédéfinis/i)); });
  expect(chess.difficulte).toBe(3);
});
