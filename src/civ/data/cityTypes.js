/**type City = {
  id: string;                  // ex: "city-001"
  name: string;                // ex: "Rome"
  position: { q: number, r: number }; // position sur la carte
  owner: string;              // joueur
  population: number;         // par défaut : 1
  foundedTurn: number;
  buildings: string[];        // ex: ['ferme', 'caserne']
   productionQueue: string[];      // liste des IDs de bâtiments
  currentProduction: string | null;
  productionProgress: number;
  garnison:[]
  assignedTiles: { q: number, r: number }[]

  resources: {
    food: number;
    gold: number;
    iron: number;
    stone: number;
  };
};
 */

import { BUILDING_TYPES } from "./buildingTypes";

export const computeCityResources = (city, tiles) => {
  const result = {};

  // 1. Tuiles assignées
  const relevantTiles = (city.assignedTiles || [])
    .map(({ q, r }) => tiles.find(t => t.q === q && t.r === r))
    .filter(Boolean);

  const civ = city.owner;

  for (const tile of relevantTiles) {
    const yieldData = tile.yield || {};

    // Bonus de civilisation basé sur le type de terrain (c'est tile.type, pas tile.terrain !)
    // et surtout sans muter civ.bonuses, sinon le bonus gonfle de tour en tour
    const civTileBonus = civ?.bonuses?.[tile.type] || {};
    for (const [res, val] of Object.entries(yieldData)) {
      const bonus = civTileBonus[res] || 0;
      result[res] = (result[res] || 0) + val + bonus;
    }
  }

  // Bonheur : bonus de la civ + un point par citoyen libre (non affecté à une tuile)
  const freeCitizens = Math.max(0, city.population - (city.assignedTiles?.length || 0));
  const happinessBonus = (civ?.bonuses?.happiness || 0) + freeCitizens;
  if (happinessBonus !== 0) result.happiness = (result.happiness || 0) + happinessBonus;

  // 2. Production des bâtiments (brute : le bonus de civ est appliqué globalement dans nextTurn)
  for (const buildingId of city.buildings || []) {
    const building = BUILDING_TYPES[buildingId];
    if (building?.production) {
      for (const [res, val] of Object.entries(building.production)) {
        result[res] = (result[res] || 0) + val;
      }
    }
  }

  return result;
};

// Gain net par tour, bonus de civilisation inclus — la même formule que nextTurn.
// Sert à l'aperçu "production par tour" de la vue ville : ce que le joueur verra
// vraiment tomber dans ses caisses avec l'assignation actuelle des citoyens.
export const computeCityGainsPreview = (city, tiles) => {
  const base = computeCityResources(city, tiles);
  const buildingBonus = city.owner?.buildingBonus || 0;
  const result = {};
  for (const [res, amount] of Object.entries(base))
    result[res] = Math.ceil(amount * (1 + buildingBonus));
  return result;
};

