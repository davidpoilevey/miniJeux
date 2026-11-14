import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import C14TopBar from './C14TopBar';
import { useC14 } from '../C14Context';
jest.mock('../C14Context', () => ({ useC14: jest.fn(), WORLD_NAMES: { pangee: 'Dagobah', gondwana: 'Endor' } }));
jest.mock('../Carbonifere14', () => ({ styles: { header: {}, title: {}, subtitle: {} } }));
let resetWorld;
beforeEach(() => {
  resetWorld = jest.fn().mockResolvedValue({ ok: true });
  useC14.mockReturnValue({ tick: 12, worldSeed: 42, worldIds: ['pangee', 'gondwana'], selectedWorldId: 'pangee', setSelectedWorldId: jest.fn(), statsCache: {}, seaLevel: 30, cellSize: 16, setCellSize: jest.fn(), resetWorld, serverStatus: 'ok' });
});
test('annuler la confirmation ne transmet aucune commande', () => {
  render(<C14TopBar />);
  fireEvent.click(screen.getByRole('button', { name: /Repartir de zéro/ }));
  expect(screen.getByRole('dialog')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Annuler' }));
  expect(resetWorld).not.toHaveBeenCalled();
});
test('confirmer envoie uniquement le monde affiché dans la confirmation', async () => {
  render(<C14TopBar />);
  fireEvent.click(screen.getByRole('button', { name: /Repartir de zéro/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Recréer cette planète' }));
  await waitFor(() => expect(resetWorld).toHaveBeenCalledWith('pangee'));
  await screen.findByText(/Reset de Dagobah envoyé/);
});
test('un échec reste visible et permet une nouvelle tentative', async () => {
  resetWorld.mockResolvedValue({ ok: false });
  render(<C14TopBar />);
  fireEvent.click(screen.getByRole('button', { name: /Repartir de zéro/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Recréer cette planète' }));
  await screen.findByText(/Impossible d’envoyer le reset/);
  expect(screen.getByRole('dialog')).toBeTruthy();
});
