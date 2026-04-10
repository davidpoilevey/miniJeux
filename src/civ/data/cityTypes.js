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

    // Bonus de civilisation basé sur le type de terrain + bonus par non assigned tile
    const civTileBonus = (civ?.bonuses?.[tile.terrain] || {});
    if(civ?.bonuses?.happiness) civTileBonus.happiness=civ.bonuses.happiness;
    if(civTileBonus.happiness==null) civTileBonus.happiness=0;
 const maxCitizens = city.population;
  const assignedCount = city.assignedTiles?.length || 0;
  const freeCitizens = maxCitizens - assignedCount;
  if(freeCitizens>0) civTileBonus.happiness+=freeCitizens
    for (const [res, val] of Object.entries(yieldData)) {
      const bonus = civTileBonus[res] || 0;
      result[res] = (result[res] || 0) + val + bonus;
    }
  }

  // 2. Bonus des bâtiments
  for (const buildingId of city.buildings || []) {
    const building = BUILDING_TYPES[buildingId];
    if (building?.production) {
      for (const [res, val] of Object.entries(building.production)) {
        const base = val;
        const bonusMultiplier = 1 + (civ?.buildingBonus || 0); // ex: +20% bonus
        const total = Math.round(base * bonusMultiplier);
        result[res] = (result[res] || 0) + total;
      }
    }
  }

  return result;
};

