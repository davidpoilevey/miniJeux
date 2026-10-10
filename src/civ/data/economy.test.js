import { energyConversion, productionPreview, queueProduction, shieldCost, migrateCityEconomy, woolConversion } from './economy';
import { computeCityEconomy } from './cityTypes';
import { UNIT_TYPES } from './unitTypes';
import { BUILDING_TYPES } from './buildingTypes';
import { getAvailableProductionsForCity, chooseCityProduction } from '../utils/utils';

const city = (extra = {}) => ({ id: 'c', owner: { id: 'a', bonuses: {} }, population: 2, buildings: [], garnison: [], productionQueue: [], currentProduction: 'pionnier', productionProgress: 0, resources: {}, ...extra });

test('construire n’exige ni bois ni or ni matière, et ne les prélève pas', () => {
  const c = city({ currentProduction: null, resources: { wood: 7, gold: 2 } });
  const queued = queueProduction(c, 'ferme');
  expect(queued.resources).toEqual(c.resources);
  expect(queued.currentProduction).toBe('ferme');
  expect(queued.productionQueue).toEqual(['ferme']);
  const options = getAvailableProductionsForCity(c, { technologies: ['agriculture'] });
  expect(options.find(p => p.id === 'ferme').isAffordable).toBe(true);
});
test('les coûts en boucliers gardent les merveilles et unités avancées plus coûteuses', () => {
  expect(shieldCost(UNIT_TYPES.warrior)).toBe(4);
  expect(shieldCost(UNIT_TYPES.tank)).toBeGreaterThan(shieldCost(UNIT_TYPES.warrior));
  expect(shieldCost(BUILDING_TYPES.ferme)).toBe(12);
});
test('le pétrole est converti automatiquement avec un plafond de huit boucliers', () => {
  expect(energyConversion(city({ resources: { petrole: 100, uranium: 20 } }), 100)).toEqual({ shields: 8, consumed: { petrole: 4 } });
});
test('l’uranium fournit quatre boucliers et les surplus restent en stock', () => {
  expect(energyConversion(city({ resources: { uranium: 10 } }), 6)).toEqual({ shields: 4, consumed: { uranium: 1 } });
});
test('on ne convertit rien sans chantier, en mode marché, ou si les boucliers de base suffisent', () => {
  for (const c of [city({ currentProduction: null }), city({ autoConvertEnergy: false }), city()]) {
    const needed = c.currentProduction && c.autoConvertEnergy !== false ? 0 : 100;
    expect(energyConversion({ ...c, resources: { petrole: 20, uranium: 20 } }, needed).shields).toBe(0);
  }
});
test('le délai estimé tient compte de l’épuisement du stock', () => {
  const c = city({ resources: { petrole: 4 }, currentProduction: 'pionnier' });
  expect(productionPreview(c, { shields: 1 }).turns).toBe(4);
});
test('la nourriture nourrit les habitants et le centre de la ville est récolté une seule fois', () => {
  const c = city({ autoConvertWool: false, position: { q: 0, r: 0 }, assignedTiles: [{ q: 0, r: 0 }, { q: 1, r: 0 }] });
  const economy = computeCityEconomy(c, [{ q: 0, r: 0, type: 'plain' }, { q: 1, r: 0, type: 'forest' }]);
  expect(economy.foodProduced).toBe(4);
  expect(economy.consumption).toBe(4);
  expect(economy.foodNet).toBe(0);
  expect(economy.gains.shields).toBe(3);
});
test('la migration rend les anciens coûts une fois et conserve l’avancement proportionnel', () => {
  const old = city({ currentProduction: 'ferme', productionQueue: ['ferme', 'worker'], productionProgress: 2 });
  const migrated = migrateCityEconomy(old, 1);
  expect(migrated.productionProgress).toBe(8);
  expect(migrated.resources).toMatchObject({ wood: 20, gold: 25, food: 10 });
  expect(migrated.autoConvertEnergy).toBe(true);
  expect(migrateCityEconomy(migrated, 2)).toEqual(migrated);
});
test('l’IA peut lancer une construction sans acheter les matériaux', () => {
  jest.spyOn(Math, 'random').mockReturnValue(0);
  const c = city({ currentProduction: null });
  chooseCityProduction(c, { technologies: [], diplomacyProfile: { expansionniste: 1 } }, []);
  expect(c.currentProduction).toBe('pionnier');
  expect(c.resources).toEqual({});
  jest.restoreAllMocks();
});

test.each([['wood', 1], ['stone', 1], ['iron', 2], ['charbon', 2], ['petrole', 2], ['uranium', 4]])('chaque matériau %s finance effectivement le chantier', (resource, rate) => {
  expect(energyConversion(city({ resources: { [resource]: 1 } }), 8)).toEqual({ consumed: { [resource]: 1 }, shields: rate });
});
test('le plafond est partagé entre les matériaux et les ressources communes passent avant l’uranium', () => {
  expect(energyConversion(city({ resources: { wood: 4, stone: 4, uranium: 20 } }), 100)).toEqual({ consumed: { wood: 4, stone: 4 }, shields: 8 });
});
test('la récolte de bois est immédiatement incluse dans l’estimation du chantier', () => {
  expect(productionPreview(city({ resources: {} }), { shields: 1, wood: 2 }).bonus).toBe(2);
});
test('la laine nourrit sans chantier et reste en stock quand le grenier est rempli ou le réglage désactivé', () => {
  expect(woolConversion(city({ currentProduction: null, resources: { laine: 20 } }))).toEqual({ consumed: 4, food: 8 });
  expect(woolConversion(city({ resources: { laine: 20, food: 200 } }))).toEqual({ consumed: 0, food: 0 });
  expect(woolConversion(city({ autoConvertWool: false, resources: { laine: 20 } }))).toEqual({ consumed: 0, food: 0 });
});
