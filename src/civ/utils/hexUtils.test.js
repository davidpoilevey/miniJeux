import { findPath, getMovementResult } from './hexUtils';
import { chooseCityProduction, getAvailableProductionsForCity, moveUnitToward } from './utils';
import { UNIT_TYPES } from '../data/unitTypes';
import { BUILDING_TYPES } from '../data/buildingTypes';
import { TECHNOLOGIES } from '../data/techTree';

const tile = (q, type = 'plain', extra = {}) => ({ q, r: 0, type, ...extra });
const unit = (type, extra = {}) => ({ ...UNIT_TYPES[type], id: 'test', remainingMovement: UNIT_TYPES[type].movement, ...extra });

test('le premier pas paie le terrain et exige assez de mouvement', () => {
  const map = [tile(0), tile(1, 'mountain')];
  expect(getMovementResult(unit('warrior', { remainingMovement: 1 }), map[0], map[1], map)).toBeNull();
  expect(getMovementResult(unit('warrior', { remainingMovement: 3 }), map[0], map[1], map).movementUsed).toBe(3);
  expect(getMovementResult(unit('warrior', { remainingMovement: 0 }), map[0], map[1], map)).toBeNull();
});

test('les bateaux naviguent et les terres ne traversent pas la mer', () => {
  const sea = [tile(0, 'water'), tile(1, 'water'), tile(2, 'water')];
  expect(getMovementResult(unit('drakkar'), sea[0], sea[2], sea).movementUsed).toBe(2);
  const coast = [tile(0), tile(1, 'water'), tile(2)];
  expect(findPath(coast[0], coast[2], coast, UNIT_TYPES.warrior)).toBeNull();
  expect(findPath(coast[1], coast[2], coast, UNIT_TYPES.drakkar)).toBeNull();
  expect(getMovementResult(unit('avionChasse'), coast[0], coast[2], coast).movementUsed).toBe(2);
});

test('le mouvement IA respecte aussi la mer et les obstacles', () => {
  const boat = unit('drakkar');
  const sea = [tile(0, 'water', { unit: boat }), tile(1, 'water'), tile(2, 'water')];
  expect(moveUnitToward(boat, sea[2], sea).moved).toBe(true);
  expect(sea[2].unit.remainingMovement).toBe(1);
  const warrior = unit('warrior');
  const coast = [tile(0, 'plain', { unit: warrior }), tile(1, 'water'), tile(2)];
  expect(moveUnitToward(warrior, coast[2], coast).moved).toBe(false);
});

test.each(Object.entries(UNIT_TYPES))('%s référence des prérequis existants', (id, def) => {
  if (def.requirements?.science) expect(TECHNOLOGIES[def.requirements.science]).toBeDefined();
  if (def.requirements?.building) expect(BUILDING_TYPES[def.requirements.building]).toBeDefined();
});

test('une sortie IA conserve le nombre minimal de gardes', () => {
  const civ = { diplomacyProfile: { protectionniste: 0.8 } };
  const city = { garnison: [unit('warrior'), unit('warrior'), unit('warrior')], productionQueue: ['worker'], currentProduction: 'worker' };
  expect(chooseCityProduction(city, civ, []).length).toBe(1);
});

test('les bâtiments déjà construits ne sont pas proposés à nouveau à l’IA', () => {
  const city = { buildings: ['ferme'], productionQueue: ['ecole'], resources: {} };
  const productions = getAvailableProductionsForCity(city, { technologies: Object.keys(TECHNOLOGIES) });
  expect(productions.some(p => p.id === 'ferme' || p.id === 'ecole')).toBe(false);
});

test('un déplacement IA retire la fortification et restaure la défense', () => {
  const guard = unit('warrior', { fortified: true, defense: UNIT_TYPES.warrior.defense + 5 });
  const map = [tile(0, 'plain', { unit: guard }), tile(1)];
  moveUnitToward(guard, map[1], map);
  expect(map[1].unit.fortified).toBe(false);
  expect(map[1].unit.defense).toBe(UNIT_TYPES.warrior.defense);
});
