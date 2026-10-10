import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CivCity from './CivCity';
import { useCivContext } from './CivContext';
import { getProductionOptionsForCity } from './utils/AddToProductionPopover';
import { MERVEILLES_DU_MONDE } from './data/buildingTypes';
import { UNIT_TYPES } from './data/unitTypes';
import { CIVILIZATIONS } from './data/civilzationTypes';
import { computeCityResources } from './data/cityTypes';

jest.mock('./CivContext', () => ({ useCivContext: jest.fn(), TAUX_BASE: { wood: { gold: 1 } } }));
jest.mock('./utils/ZoneInfluenceCanvas', () => ({ ZoneInfluenceCanvas: () => null }));
jest.mock('./utils/MarchePanel', () => ({ __esModule: true, default: () => null, MarcheRoyalDialog: () => null }));
jest.mock('./utils/hooks', () => ({ usePreloadedImages: () => ({}) }));

const makeCity = (extra = {}) => ({ id: 'c', name: 'Test', owner: CIVILIZATIONS[0], foundedTurn: 1,
  population: 2, resources: {}, buildings: [], garnison: [], productionQueue: [], productionProgress: 0, ...extra });
function renderCity(initial, techs = []) {
  let latest;
  const setCities = jest.fn(fn => { latest = fn([initial])[0]; });
  useCivContext.mockReturnValue({ cities: [initial], selectedCity: initial, tiles: [], setCities, techsUnlocked: techs, builtWonders: [] });
  render(<CivCity />);
  return () => latest;
}
test('la vue ville affiche une merveille en cours sans planter', () => {
  renderCity(makeCity({ currentProduction: 'sunTzu', productionQueue: ['sunTzu'] }));
  expect(screen.getAllByText(new RegExp(MERVEILLES_DU_MONDE.sunTzu.name)).length).toBeGreaterThan(0);
});
test('annuler la production en cours conserve la suivante et remet sa progression à zéro', () => {
  const latest = renderCity(makeCity({ currentProduction: 'worker', productionQueue: ['worker', 'warrior'], productionProgress: 2 }));
  fireEvent.click(screen.getAllByTestId('CancelIcon')[0]);
  expect(latest().currentProduction).toBe('warrior');
  expect(latest().productionQueue).toEqual(['warrior']);
  expect(latest().productionProgress).toBe(0);
});
test('supprimer la deuxième occurrence ne supprime pas la production en cours', () => {
  const latest = renderCity(makeCity({ currentProduction: 'worker', productionQueue: ['worker', 'worker'], productionProgress: 2 }));
  fireEvent.click(screen.getAllByTestId('CancelIcon')[1]);
  expect(latest().currentProduction).toBe('worker');
  expect(latest().productionQueue).toEqual(['worker']);
  expect(latest().productionProgress).toBe(2);
});
test('les bâtiments construits ou en file sont bloqués dans le sélecteur', () => {
  const options = getProductionOptionsForCity(makeCity({ buildings: ['ferme'], productionQueue: ['ecole'], resources: { wood: 999, gold: 999, stone: 999 } }), ['agriculture', 'ecriture']);
  expect(options.find(p => p.id === 'ferme').isAvailable).toBe(false);
  expect(options.find(p => p.id === 'ecole').isAvailable).toBe(false);
});
test('les bonus de terrain peuvent apporter une ressource absente du rendement de base', () => {
  const c = makeCity({ owner: CIVILIZATIONS.find(civ => civ.id === 'eldoria'), assignedTiles: [{ q: 0, r: 0 }] });
  const gain = computeCityResources(c, [{ q: 0, r: 0, type: 'desert', yield: { gold: 1 } }]);
  expect(gain.petrole).toBe(6);
  expect(gain.uranium).toBe(2);
});

test('on peut ajouter une ferme sans acheter du bois ou de l’or', () => {
  const latest = renderCity(makeCity(), ['agriculture']);
  fireEvent.click(screen.getByRole('button', { name: 'Ajouter à la production' }));
  fireEvent.click(screen.getByText('🌾 Ferme'));
  expect(latest().currentProduction).toBe('ferme');
  expect(latest().resources).toEqual({});
});
test('le mode marché désactive la conversion automatique en un clic', () => {
  const latest = renderCity(makeCity({ resources: { petrole: 20, uranium: 10 } }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Matériaux → boucliers automatiquement' }));
  expect(latest().autoConvertEnergy).toBe(false);
  expect(latest().resources).toEqual({ petrole: 20, uranium: 10 });
});

test('la laine peut être réservée au marché indépendamment des matériaux', () => {
  const latest = renderCity(makeCity({ autoConvertEnergy: true }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Laine → nourriture automatiquement' }));
  expect(latest().autoConvertWool).toBe(false);
  expect(latest().autoConvertEnergy).toBe(true);
});
