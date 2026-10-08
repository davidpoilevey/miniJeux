import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { ChessProvider, useChess } from './ChessContext';
import InfoPanel from './InfoPanel';

jest.mock('../rpg/sons/SoundManager', () => ({ soundManager: { loadSounds: jest.fn(), play: jest.fn() } }));
jest.mock('../dames/Bavardage', () => ({ pickAIDialogue: () => null }));
jest.mock('./ParamDialog', () => ({ __esModule: true, default: () => null }));
let chess;
const gameOver = jest.fn();
function Harness() {
  chess = useChess();
  return <InfoPanel reset={chess.resetTimer} gameOver={(reason, winner) => {
    gameOver(reason, winner);
    chess.setGameFinished(true);
  }} />;
}
function setup() {
  render(<ChessProvider><Harness /></ChessProvider>);
  act(() => chess.setDureeJeu(1));
  act(() => chess.resetTimer());
}
beforeEach(() => { jest.useFakeTimers(); gameOver.mockClear(); });
afterEach(() => { jest.clearAllTimers(); jest.useRealTimers(); });

test('le chrono expire une seule fois et repart avec la même durée', () => {
  setup();
  act(() => jest.advanceTimersByTime(60000));
  expect(gameOver).toHaveBeenCalledTimes(1);
  expect(gameOver).toHaveBeenCalledWith('Temps écoulé', 'black');
  act(() => chess.resetTimer());
  expect(gameOver).toHaveBeenCalledTimes(1);
  expect(screen.getByText('01:00')).toBeTruthy();
  act(() => jest.advanceTimersByTime(1000));
  expect(screen.getByText('00:59')).toBeTruthy();
});

test('avec un joueur noir, le temps écoulé donne la victoire aux blancs', () => {
  setup();
  act(() => chess.changeCouleurJoueur('black'));
  act(() => jest.advanceTimersByTime(60000));
  expect(gameOver).toHaveBeenCalledWith('Temps écoulé', 'white');
});

test('une fin de partie arrête le chrono', () => {
  setup();
  act(() => jest.advanceTimersByTime(1000));
  expect(screen.getByText('00:59')).toBeTruthy();
  act(() => chess.setGameFinished(true));
  act(() => jest.advanceTimersByTime(90000));
  expect(screen.getByText('00:59')).toBeTruthy();
  expect(gameOver).not.toHaveBeenCalled();
});
