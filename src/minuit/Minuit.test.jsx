import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Minuit from './Minuit';
import * as engine from './engine';
import { soundManager } from '../rpg/sons/SoundManager';

jest.mock('../rpg/sons/SoundManager', () => ({
  soundMap: {},
  soundManager: { loadSounds: jest.fn(), play: jest.fn(), stop: jest.fn(), isPlaying: jest.fn(() => false) },
}));
jest.mock('../ChuckNorrisFact', () => ({
  GameOver: ({ open, gameName, score, handleRestart }) => open ? <div role="dialog">{gameName} : {score}<button onClick={handleRestart}>Rejouer le casse</button></div> : null,
}));

beforeEach(() => jest.clearAllMocks());
afterEach(() => jest.restoreAllMocks());

test('starting enables keyboard play, blocked moves cost nothing, and decoys use the selected tile', () => {
  render(<Minuit />);
  const main = screen.getByRole('main', { name: 'Le Casse de Minuit' });
  expect(screen.getByRole('button', { name: 'Monter' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Tenter le casse' }));
  expect(screen.getByRole('button', { name: 'Monter' })).toBeEnabled();
  expect(screen.getByText('TOUR 00')).toBeInTheDocument();
  fireEvent.keyDown(main, { key: 'ArrowLeft' });
  expect(screen.getByText('TOUR 00')).toBeInTheDocument();
  fireEvent.keyDown(main, { key: 'ArrowUp' });
  expect(screen.getByText('TOUR 01')).toBeInTheDocument();
  fireEvent.keyDown(main, { key: 'ArrowUp', repeat: true });
  expect(screen.getByText('TOUR 01')).toBeInTheDocument();
  fireEvent.keyDown(main, { key: 'l' });
  expect(screen.getByRole('button', { name: /Annuler/ })).toHaveAttribute('aria-pressed', 'true');
  fireEvent.click(main.querySelector('[data-tile="11,9"]'));
  expect(screen.getByText('TOUR 02')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Leurre · 2/ })).toBeEnabled();
});

test('rules and restart remain available and restart clears the current run', () => {
  render(<Minuit />);
  fireEvent.click(screen.getByRole('button', { name: 'Tenter le casse' }));
  fireEvent.click(screen.getByRole('button', { name: 'Monter' }));
  expect(screen.getByText('TOUR 01')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Afficher les règles' }));
  expect(screen.getByRole('heading', { name: 'Le règlement, à peu près.' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Recommencer le casse' }));
  expect(screen.getByText('TOUR 00')).toBeInTheDocument();
  expect(screen.getByLabelText('3 chances restantes')).toBeInTheDocument();
});

test('the shared sound manager plays events and can be muted', () => {
  render(<Minuit />);
  fireEvent.click(screen.getByRole('button', { name: 'Tenter le casse' }));
  fireEvent.click(screen.getByRole('button', { name: 'Monter' }));
  expect(soundManager.play).toHaveBeenCalledWith('minuit.marche', { volume: 0.1 });
  fireEvent.click(screen.getByRole('button', { name: 'Couper les sons' }));
  soundManager.play.mockClear();
  fireEvent.click(screen.getByRole('button', { name: 'Monter' }));
  expect(soundManager.play).not.toHaveBeenCalled();
});

test('the shared end panel receives the catalogue id and score, and can restart', () => {
  render(<Minuit />);
  fireEvent.click(screen.getByRole('button', { name: 'Tenter le casse' }));
  jest.spyOn(engine, 'takeTurn').mockReturnValueOnce({ ...engine.createGame(0), phase: 'won', score: 1803, turns: 104, event: 'escape' });
  fireEvent.click(screen.getByRole('button', { name: 'Monter' }));
  expect(screen.getByRole('dialog')).toHaveTextContent('minuit : 1803');
  fireEvent.click(screen.getByRole('button', { name: 'Rejouer le casse' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByText('TOUR 00')).toBeInTheDocument();
});
