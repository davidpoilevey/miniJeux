import { BUILDING_TYPES, MERVEILLES_DU_MONDE } from './buildingTypes';
import { UNIT_TYPES } from './unitTypes';

export const ECONOMY_VERSION = 2;
export const ENERGY_SHIELDS = { wood: 1, stone: 1, iron: 2, charbon: 2, petrole: 2, uranium: 4 };
export const MAX_ENERGY_SHIELDS_PER_TURN = 8;
export const productionDefinition = id => BUILDING_TYPES[id] || UNIT_TYPES[id] || MERVEILLES_DU_MONDE[id];

// Conserve l'ordre de grandeur des anciens délais, avec davantage de travail
// pour les unités/bâtiments qui demandaient beaucoup de matériaux.
export const shieldCost = item => {
  if (!item) return 0;
  const materials = Object.values(item.cost || {}).reduce((sum, value) => sum + value, 0);
  return item.shieldCost || Math.max(4, (item.turns || 1) * 4, Math.ceil(materials / 4));
};

export const queueProduction = (city, id) => ({
  ...city,
  productionQueue: [...(city.productionQueue || []), id],
  ...(!city.currentProduction ? { currentProduction: id, productionProgress: 0 } : {}),
});

// Budget borné, et aucune consommation si le chantier n'en a pas besoin.
// Les unités de matière restent entières ; on conserve les surplus dans le stock.
export function energyConversion(city, needed, limit = MAX_ENERGY_SHIELDS_PER_TURN) {
  const consumed = {};
  let shields = 0;
  if (city.autoConvertEnergy === false || !city.currentProduction) return { consumed, shields };
  const budget = Math.max(0, Math.min(needed, limit));
  for (const [resource, rate] of Object.entries(ENERGY_SHIELDS)) {
    const amount = Math.min(Math.floor(Math.max(0, city.resources[resource] || 0)), Math.floor((budget - shields) / rate));
    if (amount > 0) consumed[resource] = amount;
    shields += amount * rate;
  }
  return { consumed, shields };
}

export function productionPreview(city, gains) {
  const cost = shieldCost(productionDefinition(city.currentProduction));
  const base = Math.max(1, gains.shields || 0);
  const remaining = Math.max(0, cost - (city.productionProgress || 0));
  // La récolte de ce tour peut être convertie immédiatement.
  const available = { ...city, resources: { ...city.resources,
    ...Object.fromEntries(Object.keys(ENERGY_SHIELDS).map(resource => [resource, (city.resources[resource] || 0) + (gains[resource] || 0)])) } };
  const energy = energyConversion(available, remaining - base);
  let turns = null;
  if (city.currentProduction) {
    turns = 0;
    let workLeft = remaining;
    const forecast = { ...city, resources: { ...city.resources } };
    do {
      for (const resource of Object.keys(ENERGY_SHIELDS)) forecast.resources[resource] = (forecast.resources[resource] || 0) + (gains[resource] || 0);
      const extra = energyConversion(forecast, workLeft - base);
      for (const resource of Object.keys(ENERGY_SHIELDS)) forecast.resources[resource] -= extra.consumed[resource] || 0;
      workLeft -= base + extra.shields;
      turns++;
    } while (workLeft > 0);
  }
  return { cost, base, bonus: energy.shields, consumed: energy.consumed, perTurn: base + energy.shields, turns };
}

export function migrateCityEconomy(city, version) {
  const updated = { ...city, resources: { ...city.resources }, autoConvertEnergy: city.autoConvertEnergy ?? true, autoConvertWool: city.autoConvertWool ?? true };
  if (version >= ECONOMY_VERSION) return updated;
  const item = productionDefinition(city.currentProduction);
  if (item) updated.productionProgress = Math.floor((city.productionProgress || 0) * shieldCost(item) / (item.turns || 1));
  // Les anciennes files étaient intégralement payées à l'ajout.
  const queue = [...(city.productionQueue || [])];
  if (city.currentProduction && queue[0] !== city.currentProduction) queue.unshift(city.currentProduction);
  for (const id of queue) {
    for (const [resource, amount] of Object.entries(productionDefinition(id)?.cost || {})) {
      updated.resources[resource] = (updated.resources[resource] || 0) + amount;
    }
  }
  updated.productionQueue = queue;
  return updated;
}

// La laine nourrit la population et remplit le grenier, sans vider les stocks
// quand la réserve nécessaire à la prochaine croissance est déjà disponible.
export function woolConversion(city) {
  if (city.autoConvertWool === false) return { consumed: 0, food: 0 };
  const population = city.population || 1;
  const growthBonus = Math.min(0.5, city.owner?.populationGrowthBonus || 0);
  const reserve = population < 10 ? Math.round((30 + 10 * Math.pow(population, 1.5)) * (1 - growthBonus)) : population * 2;
  const needed = Math.max(0, population * 2 + reserve - (city.resources.food || 0));
  const consumed = Math.min(4, Math.floor(Math.max(0, city.resources.laine || 0)), Math.ceil(needed / 2));
  return { consumed, food: consumed * 2 };
}
