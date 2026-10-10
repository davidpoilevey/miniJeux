import { buildDiplomaticDemand, transferTribute } from './diplomacy';
import { assignCityTiles, findClosestEnemy } from './utils';
import { MERVEILLES_DU_MONDE } from '../data/buildingTypes';

const nation = (id, aggressif = 0) => ({ id, diplomacyProfile: { aggressif } });
const city = (id, owner, resources = {}) => ({ id, owner, resources });
afterEach(() => jest.restoreAllMocks());

test('une IA pacifique propose un traité, avec conséquence du refus', () => {
  jest.spyOn(Math, 'random').mockReturnValue(0.5);
  const demand = buildDiplomaticDemand(nation('a'), nation('b'), []);
  expect(demand.type).toBe('peace');
  expect(demand.warOnRefusal).toBe(true);
});
test.each(['gold', 'wood', 'science'])('un tribut peut porter sur %s et ne dépasse pas le stock', resource => {
  jest.spyOn(Math, 'random').mockReturnValue(0);
  const demand = buildDiplomaticDemand(nation('a', 1), nation('b'), [city('a', nation('a')), city('b', nation('b'), resource === 'science' ? {} : { [resource]: 7 })], resource === 'science' ? 7 : 0);
  expect(demand).toMatchObject({ type: 'tribute', resource, amount: 7 });
});
test('le tribut transfère les ressources réelles entre nations sans solde négatif', () => {
  const cities = [city('a', nation('a')), city('b1', nation('b'), { gold: 60 }), city('b2', nation('b'), { gold: 40 })];
  expect(transferTribute(cities, 'b', 'a', 'gold', 101)).toBe(false);
  expect(cities[1].resources.gold).toBe(60);
  expect(transferTribute(cities, 'b', 'a', 'gold', 100)).toBe(true);
  expect(cities.map(c => c.resources.gold)).toEqual([100, 0, 0]);
});
test('une nation neutre, tendue, pacifique ou alliée n’est pas une cible militaire', () => {
  const me = nation('a'), other = nation('b');
  const unit = { id: 'me', owner: me }, enemy = { id: 'enemy', owner: other };
  const tiles = [{ q: 0, r: 0, unit }, { q: 1, r: 0, unit: enemy }];
  for (const relation of ['neutral', 'tendu', 'peace', 'allied']) {
    expect(findClosestEnemy(unit, me, tiles, [], { getDiplomaticRelation: () => relation })).toBeNull();
  }
  expect(findClosestEnemy(unit, me, tiles, [], { getDiplomaticRelation: () => 'war' }).unit).toBe(enemy);
});
test('Wall Street varie de 1 à 3% autour de 2%', () => {
  const random = jest.spyOn(Math, 'random');
  for (const [roll, expected] of [[0, 10100], [0.5, 10200], [1, 10300]]) {
    random.mockReturnValue(roll);
    const cities = [{ resources: { gold: 10000 } }];
    MERVEILLES_DU_MONDE.wallStreet.effectParTurn(cities);
    expect(cities[0].resources.gold).toBe(expected);
  }
});
test('les choix manuels et les citoyens libres survivent à la croissance', () => {
  const tiles = [{ q: 0, r: 0, hasCity: true }, { q: 1, r: 0 }, { q: 0, r: 1, assignedTo: 'other' }];
  const c = { id: 'city', position: tiles[0], population: 3, assignedTiles: [{ q: 1, r: 0 }] };
  assignCityTiles(c, tiles, { fill: false });
  expect(c.assignedTiles).toEqual([{ q: 1, r: 0 }]);
  expect(tiles[1].assignedTo).toBe('city');
  c.assignedTiles = [];
  assignCityTiles(c, tiles, { fill: false });
  expect(c.assignedTiles).toEqual([]);
  expect(tiles[1].assignedTo).toBeNull();
  expect(tiles[2].assignedTo).toBe('other');
});
