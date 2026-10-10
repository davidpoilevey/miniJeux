import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { CivContextProvider, useCivContext } from './CivContext';
import { UNIT_TYPES } from './data/unitTypes';
import { CIVILIZATIONS } from './data/civilzationTypes';

jest.mock('./CivMap', () => ({ TILE_SIZE: 40 }));
jest.mock('../jds/components/Message', () => ({ __esModule: true, default: () => ({ showAlert: jest.fn(), SnackbarComponent: null }) }));

const player = () => JSON.parse(JSON.stringify(CIVILIZATIONS[0]));
const rival = () => JSON.parse(JSON.stringify(CIVILIZATIONS[1]));
const unit = (type, owner, id, extra = {}) => ({ ...UNIT_TYPES[type], owner, id, remainingMovement: UNIT_TYPES[type].movement, ...extra });
const tile = (q, u = null, extra = {}) => ({ q, r: 0, type: 'plain', unit: u, ...extra });
const city = (owner, extra = {}) => ({ id: 'city', name: 'Test', position: { q: 0, r: 0 }, owner, population: 2,
  buildings: [], garnison: [], productionQueue: [], productionProgress: 0, resources: { food: 0, gold: 0, happiness: 10 }, ...extra });
function setup(state) {
  localStorage.setItem('civ_savegame', JSON.stringify({ economyVersion: 2, ...state }));
  const hook = renderHook(() => useCivContext(), { wrapper: ({ children }) => <CivContextProvider setSelected={jest.fn()}>{children}</CivContextProvider> });
  act(() => hook.result.current.loadCiv());
  return hook;
}
beforeEach(() => jest.spyOn(Math, 'random').mockReturnValue(0.99));
afterEach(() => { jest.restoreAllMocks(); localStorage.clear(); });

test('plusieurs sorties de garnison ne s’écrasent pas', () => {
  const p = player(), r = rival();
  const a = unit('warrior', p, 'a'), b = unit('warrior', p, 'b');
  const { result } = setup({ playerNation: p, civsInGame: [p, r], tiles: [tile(0, null, { hasCity: true }), tile(1), tile(-1), tile(9, unit('worker', r, 'r'))], cities: [city(p, { garnison: [a, b] })] });
  act(() => { const c = result.current.cities[0]; result.current.deployUnit(c, c.garnison[0]); result.current.deployUnit(c, c.garnison[0]); });
  expect(result.current.tiles.filter(t => t.unit?.owner.id === p.id).map(t => t.unit.id).sort()).toEqual(['a', 'b']);
  expect(result.current.cities[0].garnison).toHaveLength(0);
});

test('un ordre automatique ne parcourt qu’un budget par tour', () => {
  const p = player(), r = rival();
  const walker = unit('worker', p, 'walker', { movement: 1, remainingMovement: 0, targetDestination: { q: 4, r: 0 } });
  const { result } = setup({ playerNation: p, civsInGame: [p, r], tiles: [tile(0, walker), tile(1), tile(2), tile(3), tile(4), tile(9, unit('worker', r, 'r'))], cities: [] });
  act(() => result.current.nextTurn());
  expect(result.current.tiles.find(t => t.unit?.id === 'walker').q).toBe(1);
});

test('une merveille ne peut être inaugurée deux fois dans le même tour', () => {
  const p = player(), r = rival();
  const { result } = setup({ playerNation: p, civsInGame: [p, r], tiles: [tile(0, null, { hasCity: true }), tile(5, null, { hasCity: true }), tile(9, unit('worker', r, 'r'))], cities: [city(p, { currentProduction: 'sunTzu', productionQueue: ['sunTzu'], productionProgress: 79 }), city(p, { id: 'second', position: { q: 5, r: 0 }, currentProduction: 'sunTzu', productionQueue: ['sunTzu'], productionProgress: 79 })] });
  act(() => result.current.nextTurn());
  expect(result.current.builtWonders).toHaveLength(1);
  expect(result.current.playerNation.militaryBonus).toBe(2);
  expect(CIVILIZATIONS[0].militaryBonus).toBe(0);
});

test('charger réunit les propriétaires et efface le résultat de la partie précédente', () => {
  const p = player(), r = rival();
  const { result } = setup({ playerNation: p, civsInGame: [p, r], tiles: [tile(0, unit('worker', p, 'p'))], cities: [city(p)] });
  expect(result.current.tiles[0].unit.owner).toBe(result.current.playerNation);
  expect(result.current.cities[0].owner).toBe(result.current.playerNation);
  act(() => result.current.nextTurn());
  expect(result.current.gameResult.type).toBe('victory');
  act(() => result.current.loadCiv());
  expect(result.current.gameResult).toBeNull();
});

test('la riposte ne réécrit aucune case après le combat', () => {
  jest.useFakeTimers();
  const p = player(), r = rival();
  const { result } = setup({ playerNation: p, civsInGame: [p, r], diplomaticRelations: { 'anglais-francais': 'war' }, tiles: [tile(0, unit('legion', p, 'p')), tile(1, unit('legion', r, 'r'))], cities: [] });
  act(() => result.current.setSelectedUnitPos(result.current.tiles[0]));
  act(() => result.current.attaque(result.current.tiles[1]));
  act(() => result.current.setTiles(prev => prev.map(t => ({ ...t, unit: null }))));
  act(() => jest.runAllTimers());
  expect(result.current.tiles.every(t => !t.unit)).toBe(true);
  jest.useRealTimers();
});


test('sortir une unité amphibie fonctionne aussi pour une ville à l’intérieur des terres', () => {
  const p = player(), r = rival();
  const { result } = setup({ playerNation: p, civsInGame: [p, r], tiles: [tile(0, null, { hasCity: true }), tile(1), tile(9, unit('worker', r, 'r'))], cities: [city(p, { garnison: [unit('soldatModerne', p, 'marine')] })] });
  act(() => result.current.deployUnit(result.current.cities[0], result.current.cities[0].garnison[0]));
  expect(result.current.tiles[1].unit.id).toBe('marine');
});

test('raser une ville termine l’action de l’attaquant', () => {
  const p = player(), r = rival();
  const { result } = setup({ playerNation: p, civsInGame: [p, r], diplomaticRelations: { 'anglais-francais': 'war' }, tiles: [tile(0, unit('warrior', p, 'p')), tile(1, null, { hasCity: true })], cities: [city(r, { position: { q: 1, r: 0 }, population: 1 })] });
  act(() => result.current.setSelectedUnitPos(result.current.tiles[0]));
  act(() => result.current.attaqueCity(result.current.tiles[1]));
  expect(result.current.cities).toHaveLength(0);
  expect(result.current.tiles[0].unit.remainingMovement).toBe(0);
  expect(result.current.tiles[1].hasCity).toBe(false);
});

test('la diplomatie IA n’est pas écrasée par la récolte de fin de tour', () => {
  const p = player(), r = rival(), other = JSON.parse(JSON.stringify(CIVILIZATIONS[2]));
  other.diplomacyProfile = { ...other.diplomacyProfile, aggressif: 0, genereux: 1 };
  Math.random.mockReturnValue(0.1);
  const { result } = setup({ playerNation: p, civsInGame: [p, r, other], tiles: [tile(-5, unit('worker', p, 'p')), tile(0, unit('diplomate', r, 'd')), tile(1, null, { hasCity: true }), tile(5, null, { hasCity: true })], cities: [city(other, { position: { q: 1, r: 0 }, resources: { gold: 200, laine: 20 }, currentProduction: 'worker', productionQueue: ['worker'] }), city(r, { id: 'r', position: { q: 5, r: 0 }, resources: { gold: 200, laine: 20 }, currentProduction: 'worker', productionQueue: ['worker'] })] });
  act(() => result.current.nextTurn());
  expect(result.current.cities.find(c => c.id === 'r').resources.gold).toBe(302);
  expect(result.current.cities.find(c => c.id === 'city').resources.gold).toBe(105);
  expect(result.current.tiles.some(t => t.unit?.id === 'd')).toBe(false);
});

test('le déplacement manuel retire la fortification, et la refortification ne cumule pas les bonus', () => {
  const p = player(), r = rival();
  const { result } = setup({ playerNation: p, civsInGame: [p, r], tiles: [tile(0, unit('warrior', p, 'p', { fortified: true, defense: UNIT_TYPES.warrior.defense + 5 })), tile(1), tile(9, unit('worker', r, 'r'))], cities: [] });
  act(() => result.current.moveUnit(result.current.tiles[0], result.current.tiles[1]));
  expect(result.current.tiles[1].unit.fortified).toBe(false);
  expect(result.current.tiles[1].unit.defense).toBe(UNIT_TYPES.warrior.defense);
  act(() => result.current.fortifyUnit(result.current.tiles[1]));
  expect(result.current.tiles[1].unit.defense).toBe(UNIT_TYPES.warrior.defense + 5);
});
test('la croissance conserve les affectations manuelles et laisse le nouveau citoyen libre', () => {
  const p = player(), r = rival();
  const { result } = setup({ playerNation: p, civsInGame: [p, r], tiles: [tile(0, null, { hasCity: true }), tile(1), tile(2), tile(9, unit('worker', r, 'r'))], cities: [city(p, { assignedTiles: [{ q: 2, r: 0 }], resources: { food: 999, gold: 0, happiness: 10 } })] });
  act(() => result.current.nextTurn());
  expect(result.current.cities[0].population).toBe(3);
  expect(result.current.cities[0].assignedTiles).toEqual([{ q: 2, r: 0 }]);
});
test('le placement manuel interdit le partage d’une case et maintient sa réservation', () => {
  const p = player(), r = rival();
  const { result } = setup({ playerNation: p, civsInGame: [p, r], tiles: [tile(0, null, { hasCity: true }), tile(1), tile(2), tile(9, unit('worker', r, 'r'))], cities: [city(p, { assignedTiles: [] }), city(p, { id: 'other', position: { q: 3, r: 0 }, assignedTiles: [{ q: 2, r: 0 }] })] });
  act(() => result.current.toggleCityTile('city', result.current.tiles[2]));
  expect(result.current.cities[0].assignedTiles).toEqual([]);
  act(() => result.current.toggleCityTile('city', result.current.tiles[1]));
  expect(result.current.tiles[1].assignedTo).toBe('city');
  act(() => result.current.toggleCityTile('city', result.current.tiles[1]));
  expect(result.current.tiles[1].assignedTo).toBeNull();
});

function encounter({ science = false, aggressive = false, third = false } = {}) {
  const p = player(), r = rival(), other = JSON.parse(JSON.stringify(CIVILIZATIONS[2]));
  r.diplomacyProfile.aggressif = aggressive ? 1 : 0;
  other.diplomacyProfile.aggressif = 0;
  return setup({ playerNation: p, civsInGame: third ? [p, r, other] : [p, r],
    tiles: [tile(0, null, { hasCity: true }), tile(1, unit('warrior', r, 'r')), tile(3, null, { hasCity: true }), ...(third ? [tile(-1, unit('warrior', other, 'o')), tile(-3, null, { hasCity: true })] : [])],
    researchProgress: science ? 15 : 0, currentResearch: science ? 'fission' : null,
    cities: [city(p), city(r, { id: 'r', position: { q: 3, r: 0 } }), ...(third ? [city(other, { id: 'o', position: { q: -3, r: 0 } })] : [])] });
}
test('l’IA présente une audience sans attaquer le joueur neutre ; accepter signe la paix', () => {
  const { result } = encounter();
  act(() => result.current.nextTurn());
  expect(result.current.cities[0].owner.id).toBe(player().id);
  expect(result.current.pendingAudience.demand.type).toBe('peace');
  const turn = result.current.turn;
  act(() => result.current.nextTurn());
  expect(result.current.turn).toBe(turn);
  act(() => result.current.resolveAudience(true));
  expect(result.current.getDiplomaticRelation(player(), rival())).toBe('peace');
  expect(result.current.pendingAudience).toBeNull();
});
test('refuser une proposition déclare la guerre avant toute attaque', () => {
  const { result } = encounter();
  act(() => result.current.nextTurn());
  act(() => result.current.resolveAudience(false));
  expect(result.current.getDiplomaticRelation(player(), rival())).toBe('war');
});
test('le tribut scientifique prélève les points de recherche sans retirer de technologie', () => {
  Math.random.mockReturnValue(0);
  const { result } = encounter({ science: true, aggressive: true });
  act(() => result.current.nextTurn());
  expect(result.current.pendingAudience.demand).toMatchObject({ resource: 'science', amount: 10 });
  const points = result.current.researchProgress;
  const rivalPoints = result.current.civsInGame.find(c => c.id === rival().id).researchProgress;
  act(() => result.current.resolveAudience(true));
  expect(result.current.researchProgress).toBe(points - 10);
  expect(result.current.civsInGame.find(c => c.id === rival().id).researchProgress).toBe(rivalPoints + 10);
  expect(result.current.techsUnlocked).toEqual([]);
});
test('plusieurs émissaires attendent leur tour, y compris après sauvegarde et chargement', () => {
  const { result } = encounter({ third: true });
  act(() => result.current.nextTurn());
  expect(result.current.pendingAudience.fromNation.id).toBe(rival().id);
  act(() => result.current.saveCiv());
  act(() => result.current.loadCiv());
  act(() => result.current.resolveAudience(true));
  expect(result.current.pendingAudience.fromNation.id).toBe(CIVILIZATIONS[2].id);
});
test('le joueur ne peut pas attaquer directement une nation neutre', () => {
  const p = player(), r = rival();
  const { result } = setup({ playerNation: p, civsInGame: [p, r], tiles: [tile(0, unit('legion', p, 'p')), tile(1, unit('legion', r, 'r'))], cities: [] });
  act(() => result.current.setSelectedUnitPos(result.current.tiles[0]));
  act(() => result.current.attaque(result.current.tiles[1]));
  expect(result.current.tiles[0].unit.hp).toBe(UNIT_TYPES.legion.hp);
  expect(result.current.tiles[1].unit.hp).toBe(UNIT_TYPES.legion.hp);
});

test('le déplacement automatique retire aussi le bonus de fortification', () => {
  const p = player(), r = rival();
  const { result } = setup({ playerNation: p, civsInGame: [p, r], tiles: [tile(0, unit('warrior', p, 'p', { fortified: true, defense: UNIT_TYPES.warrior.defense + 5, targetDestination: { q: 1, r: 0 } })), tile(1), tile(9, unit('worker', r, 'r'))], cities: [] });
  act(() => result.current.nextTurn());
  expect(result.current.tiles[1].unit.fortified).toBe(false);
  expect(result.current.tiles[1].unit.defense).toBe(UNIT_TYPES.warrior.defense);
});
test('un tribut devenu impayable ne crée pas de stock négatif ni de paix gratuite', () => {
  Math.random.mockReturnValue(0);
  const { result } = encounter({ science: true, aggressive: true });
  act(() => result.current.nextTurn());
  act(() => result.current.setResearchProgress(0));
  expect(result.current.audienceCanAccept).toBe(false);
  act(() => result.current.resolveAudience(true));
  expect(result.current.researchProgress).toBe(0);
  expect(result.current.getDiplomaticRelation(player(), rival())).toBe('neutral');
  expect(result.current.pendingAudience).not.toBeNull();
});

test.each([true, false])('conversion énergétique activée=%s : les stocks et le chantier suivent le réglage', automatic => {
  const p = player(), r = rival();
  const { result } = setup({ playerNation: p, civsInGame: [p, r], tiles: [tile(0, null, { hasCity: true }), tile(9, unit('worker', r, 'r'))], cities: [city(p, { currentProduction: 'pionnier', productionQueue: ['pionnier'], autoConvertEnergy: automatic, resources: { food: 50, petrole: 10, uranium: 2 } })] });
  act(() => result.current.nextTurn());
  expect(result.current.cities[0].productionProgress).toBe(automatic ? 8 : 1);
  expect(result.current.cities[0].resources.petrole).toBe(automatic ? 7 : 10);
  expect(result.current.cities[0].resources.uranium).toBe(2);
});
test('une production normale se termine sans consommer de pétrole inutilement', () => {
  const p = player(), r = rival();
  const { result } = setup({ playerNation: p, civsInGame: [p, r], tiles: [tile(0, null, { hasCity: true }), tile(1), tile(9, unit('worker', r, 'r'))], cities: [city(p, { currentProduction: 'warrior', productionQueue: ['warrior'], productionProgress: 3, resources: { food: 50, petrole: 10, uranium: 2 } })] });
  act(() => result.current.nextTurn());
  expect(result.current.cities[0].currentProduction).toBeNull();
  expect(result.current.cities[0].resources.petrole).toBe(10);
  expect(result.current.tiles.some(t => t.unit?.type === 'warrior')).toBe(true);
});
test('le blé nourrit la population : déficit, réserves puis famine', () => {
  const p = player(), r = rival();
  const { result } = setup({ playerNation: p, civsInGame: [p, r], tiles: [tile(0, null, { type: 'mountain', hasCity: true }), tile(9, unit('worker', r, 'r'))], cities: [city(p, { resources: { food: 4 } })] });
  act(() => result.current.nextTurn());
  expect(result.current.cities[0].resources.food).toBe(0);
  expect(result.current.cities[0].population).toBe(2);
  act(() => result.current.nextTurn());
  expect(result.current.cities[0].population).toBe(1);
  expect(result.current.cities[0].resources.food).toBe(0);
});
test('charger une ancienne économie rembourse les coûts une fois et sauvegarde le nouveau format', () => {
  const p = player(), r = rival();
  const { result } = setup({ economyVersion: 1, playerNation: p, civsInGame: [p, r], tiles: [tile(0, null, { hasCity: true }), tile(9, unit('worker', r, 'r'))], cities: [city(p, { currentProduction: 'ferme', productionQueue: ['ferme'], productionProgress: 2, resources: { wood: 0, gold: 0 }, autoConvertEnergy: false })] });
  expect(result.current.cities[0].productionProgress).toBe(8);
  expect(result.current.cities[0].resources.wood).toBe(20);
  act(() => result.current.saveCiv());
  expect(JSON.parse(localStorage.getItem('civ_savegame')).economyVersion).toBe(2);
  act(() => result.current.loadCiv());
  expect(result.current.cities[0].resources.wood).toBe(20);
  expect(result.current.cities[0].autoConvertEnergy).toBe(false);
});

function peacefulBattle(cityTarget = false) {
  const p = player(), r = rival();
  return setup({ playerNation: p, civsInGame: [p, r], diplomaticRelations: { 'anglais-francais': 'peace' },
    tiles: [tile(0, unit('legion', p, 'p')), tile(1, cityTarget ? null : unit('legion', r, 'r'), { hasCity: cityTarget })],
    cities: cityTarget ? [city(r, { id: 'r', position: { q: 1, r: 0 }, population: 1 })] : [] });
}
test.each([false, true])('attaquer en paix demande confirmation (ville=%s) ; annuler ne dépense rien', cityTarget => {
  const { result } = peacefulBattle(cityTarget);
  act(() => result.current.setSelectedUnitPos(result.current.tiles[0]));
  const attack = () => cityTarget ? result.current.attaqueCity(result.current.tiles[1]) : result.current.attaque(result.current.tiles[1]);
  const movement = result.current.tiles[0].unit.remainingMovement;
  act(attack);
  expect(result.current.pendingDiplomaticAction).toMatchObject({ type: 'war', relation: 'peace' });
  const turn = result.current.turn;
  act(() => result.current.nextTurn());
  expect(result.current.turn).toBe(turn);
  act(() => result.current.resolveDiplomaticAction(false));
  expect(result.current.getDiplomaticRelation(player(), rival())).toBe('peace');
  expect(result.current.tiles[0].unit.remainingMovement).toBe(movement);
  act(attack);
  act(() => result.current.resolveDiplomaticAction(true));
  expect(result.current.getDiplomaticRelation(player(), rival())).toBe('war');
  expect(result.current.pendingDiplomaticAction).toBeNull();
  expect(result.current.tiles[0].unit?.remainingMovement || 0).toBe(0);
  if (cityTarget) expect(result.current.cities).toHaveLength(0);
});
test('aucune rupture de paix proposée pour une cible hors de portée', () => {
  const { result } = peacefulBattle();
  act(() => result.current.setTiles(prev => prev.map(t => t.q === 1 ? { ...t, q: 10 } : t)));
  act(() => result.current.setSelectedUnitPos(result.current.tiles[0]));
  act(() => result.current.attaque(result.current.tiles[1]));
  expect(result.current.pendingDiplomaticAction).toBeNull();
  expect(result.current.getDiplomaticRelation(player(), rival())).toBe('peace');
});
test.each([true, false])('un ultimatum transfère un vrai tribut ou déclenche la guerre (accepté=%s)', accepted => {
  const p = player(), r = rival();
  const { result } = setup({ playerNation: p, civsInGame: [p, r], diplomaticRelations: { 'anglais-francais': 'peace' }, tiles: [],
    cities: [city(p, { resources: { gold: 5 } }), city(r, { id: 'r', resources: { gold: 70 } })] });
  Math.random.mockReturnValue(0);
  act(() => result.current.requestTribute(result.current.civsInGame[1]));
  expect(result.current.pendingDiplomaticAction.demand).toMatchObject({ resource: 'gold', amount: 70 });
  Math.random.mockReturnValue(accepted ? 0.99 : 0);
  act(() => result.current.resolveDiplomaticAction(true));
  expect(result.current.getDiplomaticRelation(p, r)).toBe(accepted ? 'peace' : 'war');
  expect(result.current.cities[0].resources.gold).toBe(accepted ? 75 : 5);
  expect(result.current.cities[1].resources.gold).toBe(accepted ? 0 : 70);
});
test('la laine du stock évite la famine et la conversion peut être désactivée', () => {
  const p = player(), r = rival();
  const { result } = setup({ playerNation: p, civsInGame: [p, r], tiles: [tile(0, null, { type: 'mountain', hasCity: true }), tile(9, unit('worker', r, 'r'))], cities: [city(p, { resources: { food: 0, laine: 10 } })] });
  act(() => result.current.nextTurn());
  expect(result.current.cities[0].population).toBe(2);
  expect(result.current.cities[0].resources).toMatchObject({ laine: 6, food: 4 });
});
test('le bonheur ne découvre plus instantanément une technologie et l’IA progresse sans tirage aléatoire', () => {
  const p = player(), r = rival();
  const { result } = setup({ playerNation: p, civsInGame: [p, r], currentResearch: 'agriculture',
    tiles: [tile(0, null, { hasCity: true }), tile(20, null, { hasCity: true })],
    cities: [city(p, { resources: { food: 500, happiness: 1000 } }), city(r, { id: 'r', position: { q: 20, r: 0 }, resources: { food: 500 } })] });
  for (let i = 0; i < 11; i++) act(() => result.current.nextTurn());
  expect(result.current.currentResearch).toBe('agriculture');
  expect(result.current.researchProgress).toBe(11);
  expect(result.current.civsInGame[1].technologies).toEqual([]);
  act(() => result.current.nextTurn());
  expect(result.current.techsUnlocked).toContain('agriculture');
  expect(result.current.civsInGame[1].technologies).toContain('agriculture');
});
