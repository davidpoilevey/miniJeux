import { BUILDING_TYPES, MERVEILLES_DU_MONDE } from "../data/buildingTypes";

import {  UNIT_TYPES } from "../data/unitTypes";
import { findPath, getDistanceHex, getSurroundingTiles } from "./hexUtils";

export const getYearForTurn=(turn)=> {
  if (turn <= 20) return -2000 + (turn - 1) * 100;
  if (turn <= 40) return 0 + (turn - 21) * 50;
  if (turn <= 60) return 1000 + (turn - 41) * 25;
  if (turn <= 80) return 1500 + (turn - 61) * 10;
  if (turn <= 100) return 1700 + (turn - 81) * 5;
  if (turn <= 120) return 1800 + (turn - 101) * 2;
  return 1840 + (turn - 121); // 1 an par tour
}


export const isSameTile = (a, b) => a && b && a.q === b.q && a.r === b.r;

// builtWonders contient des {id, ownerId} (ou d'anciens ids nus dans les vieilles sauvegardes)
export const isWonderBuilt = (builtWonders, wonderId) =>
  (builtWonders || []).some(w => (w?.id ?? w) === wonderId);

// Générateur d'ids uniques : Date.now() seul crée des doublons quand plusieurs
// unités naissent dans la même milliseconde (et les doublons font disparaître des unités)
let uidCounter = 0;
export const newUid = (prefix) => `${prefix}-${Date.now().toString(36)}-${++uidCounter}`;

// Bilan d'une civilisation : sert au palmarès et au score de fin de partie.
// `techs` est la liste de technologies de la civ (techsUnlocked pour le joueur,
// civ.technologies pour l'IA) — c'est l'appelant qui sait laquelle passer.
export function computeCivStats(civ, cities, tiles, techs = [], builtWonders = [], turn = 0) {
  const civCities = cities.filter(c => c.owner.id === civ.id);
  const population = civCities.reduce((sum, c) => sum + (c.population || 0), 0);
  const unitsOnMap = tiles.filter(t => t.unit?.owner?.id === civ.id).map(t => t.unit);
  const garrisons = civCities.flatMap(c => c.garnison || []);
  const military = [...unitsOnMap, ...garrisons].reduce((sum, u) => sum + (u.attack || 0), 0);
  const wonders = (builtWonders || []).filter(w => w?.ownerId === civ.id).length;
  const score = civCities.length * 100 + population * 50 + techs.length * 20
    + wonders * 200 + Math.max(0, 300 - turn);
  return {
    civ,
    cities: civCities.length,
    population,
    military,
    unitCount: unitsOnMap.length + garrisons.length,
    techCount: techs.length,
    wonders,
    score,
  };
}
/**
 * Vérifie si une tuile est toujours un spot valide pour fonder une ville.
 * @param {{q: number, r: number}} spot - La position à vérifier
 * @param {Array<{q: number, r: number, unit?: any, hasCity?: boolean}>} tiles - La map complète
 * @returns {boolean}
 */
export function isValidCitySpot(spot, tiles) {
  const tile = tiles.find(t => t.q === spot.q && t.r === spot.r);
  if (!tile) return false; // hors carte, ou corrompu

  return !tile.unit && !tile.hasCity;
}

export function findCitySpot(unitTile, tiles, cities) {
  const validSpots = tiles.filter(tile => {
    if (tile.unit || tile.hasCity) return false;
    if (getDistanceHex(tile, unitTile) > 5) return false;

    const surrounding = getSurroundingTiles(tile, tiles, 4);

    const tooClose = cities.some(city => {
      const cityTile = city.position;
      return surrounding.some(t => t.q === cityTile.q && t.r === cityTile.r);
    });

    return !tooClose;
  });

  if (validSpots.length === 0) return null;

  // 🔥 Fonction pour calculer la valeur d’un emplacement
  const scoreSpot = (tile) => {
    const surrounding = getSurroundingTiles(tile, tiles, 1); // rayon 1 => premières cases exploitées
    let score = 0;

    for (const t of surrounding) {
      if (!t.yield) continue;

      // Bonus pour chaque type de ressource récoltable
      for (const [res, val] of Object.entries(t.yield)) {
        score += val;
      }

      // Bonus pour une feature spéciale
      if (t.feature) {
        score += 3; // 💥 poids important pour une ressource stratégique
      }
    }

    return score;
  };

  // ou on retourne un au hasard parce que ca consomme quand meme
  return validSpots[Math.floor(Math.random()*validSpots.length)];
  // 🔍 On choisit le spot qui a le meilleur score économique
  // return validSpots.reduce((best, current) => {
  //   const currentScore = scoreSpot(current);
  //   const bestScore = scoreSpot(best);
  //   return currentScore > bestScore ? current : best;
  // });
}


export function moveUnitToward(unit, goalTile, tiles, options = {}) {
  const { stopBeforeTarget = false } = options;

  let start = tiles.find(t => t.unit?.id === unit.id);
  if (!start) {
    return  { moved: false };
  }

  if (!goalTile) {
    // errance : une destination proche suffit, pas besoin de traverser toute la carte
    const nearby = getSurroundingTiles(start, tiles, 6)
      .filter(t => !t.unit && !t.hasCity && t.type !== 'water');
    if (nearby.length === 0) return { moved: false };
    goalTile = nearby[Math.floor(Math.random() * nearby.length)];
  }

  const path = findPath(start, goalTile, tiles, {
    isTarget: true,
    canCrossWater: unit.canCrossWater,
    armee: UNIT_TYPES[unit.type].armee
  });

  if (!path || path.length < 1 || isSameTile(start, goalTile)) return { moved: false };

  let movementLeft = unit.remainingMovement;
  let lastReachableTile = start;

  for (let i = 0; i < path.length; i++) {
    const tile = path[i];

    // case occupée : on s'arrête juste avant, jamais dessus (sinon on écrase l'unité qui y est)
    if (tile.unit || tile.hasCity) break;

    const cost = getTileCost(tile);
    if (cost > movementLeft) break;

    const isGoal = isSameTile(tile, goalTile);
    if (stopBeforeTarget && isGoal) {
      break; // on ne marche pas sur l'ennemi
    }
    movementLeft -= cost;
    lastReachableTile = tile;
  }

  if (!isSameTile(lastReachableTile, start)) {
    start.unit = null;
    lastReachableTile.unit = { ...unit, remainingMovement: movementLeft };
    return { moved: true , lastReachedPosition:lastReachableTile};
  }

  return { moved: false };
}
export const bonusDeBonheur=(happ, max)=>{
  // on va dire que happiness a 50 c'est top
let bonus=-max/2;
if(happ>0)
  bonus=0;
if(happ>5) bonus= Math.round(max/10);
if(happ>10) bonus= Math.round(max/5);
if(happ>20) bonus= Math.round(max/3);
if(happ>30) bonus= Math.round(max/2);

if(happ>50) bonus=max;
  return bonus;
}

export function isMilitaryUnit(unit) {
  return unit.armee!=='none'
}
export function isGarnisonedInCity(unit, city) {
  return city.garnison.some(g => g.id === unit.id);
}
export function getGarnisonCount(city) {
  return city.garnison.length;
}
export function getRequiredGarnison(profile) {
  return 1 + Math.floor((profile.protectionniste || 0) * 2); // 1–3
}
export const getUnitTile=(unit, tiles)=>{
  const ut= tiles.find(t=>t.unit?.id===unit.id);
  if(ut==null && unit.targetCitySpot){
    return unit.targetCitySpot;
  }
  return ut;
}
export const getAllUnits=(tiles)=>{
  const units=[];
   tiles.forEach(t=>{
    if(t.unit?.id)
      units.push(t.unit);
  });
  return units;
}
export function findClosestEnemy(unit, civilization, tiles, cities, options) {
  const unitTile = getUnitTile(unit, tiles);
  const { getDiplomaticRelation} = options||{};
const units=getAllUnits(tiles);
  // Trouver les unités ennemies valides
  const enemyUnits = units.filter(u =>
    u.owner.id !== civilization.id &&
    !['peace','allied'].includes(getDiplomaticRelation(civilization, u.owner))
  );

  // Trouver les villes ennemies valides
  const enemyCities = cities.filter(c =>
    c.owner.id !== civilization.id &&
    !['peace','allied'].includes(getDiplomaticRelation(civilization, c.owner))
  );

  let closest = null;
  let minDistance = Infinity;

  if (!unitTile) return null;

  // Vérifie les unités ennemies
  for (const enemy of enemyUnits) {
    const ennemyHex = getUnitTile(enemy, tiles);
    if(!ennemyHex) continue;
    const dist = getDistanceHex(unitTile, ennemyHex);
    if (dist < minDistance) {
      minDistance = dist;
      closest = {
        type: 'unit',
        unit: enemy,
        position:ennemyHex,
      };
    }
  }

  // Vérifie les villes ennemies
  for (const city of enemyCities) {
    if(!city.position) continue;
    const dist = getDistanceHex(unitTile, city.position);
    if (dist < minDistance) {
      minDistance = dist;
      closest = {
        type: 'city',
        city,
        position: { q: city.position.q, r: city.position.r },
      };
    }
  }

  return closest;
}


export function findClosestForeignCity(unit, cities, getDiplomacyRelation, tiles) {
  const myNation = unit.owner;

  const foreignCities = cities.filter(city =>
    city.owner.id !== myNation.id &&
    getDiplomacyRelation(myNation, city.owner) !== 'allied'
  );

  const unitTile = tiles.find(t => t.unit === unit);
  foreignCities.sort((a, b) =>
    getDistanceHex(unitTile, a.position) -
    getDistanceHex(unitTile, b.position)
  );

  return foreignCities[0] || null;
}
export function assignCityTiles(city, allTiles) {
  const MAX_TILES = Math.min(city.population, 10); // 1 par pop, max 10
  const cityTile = allTiles.find(t => t.q === city.position.q && t.r === city.position.r);
  if (!cityTile) return;
  const surroundingTiles = getSurroundingTiles(cityTile, allTiles);

  // On conserve les tuiles déjà assignées (choix manuel du joueur inclus)
  const kept = (city.assignedTiles || [])
    .filter(pos => surroundingTiles.some(t => t.q === pos.q && t.r === pos.r))
    .slice(0, MAX_TILES);
  const keptKeys = new Set(kept.map(p => `${p.q},${p.r}`));

  const candidates = surroundingTiles
    .filter(t => !t.hasCity
      && !keptKeys.has(`${t.q},${t.r}`)
      && (!t.assignedTo || t.assignedTo === city.id)) // pas de vol aux villes voisines
    .sort((a, b) => {
      // Priorité aux tuiles avec feature
      const aScore = a.feature ? 1 : 0;
      const bScore = b.feature ? 1 : 0;
      return bScore - aScore;
    });

  const assigned = [...kept.map(p => ({ q: p.q, r: p.r }))];
  for (const t of candidates) {
    if (assigned.length >= MAX_TILES) break;
    assigned.push({ q: t.q, r: t.r });
  }

  allTiles.forEach(tile => {
    if (tile.assignedTo === city.id) tile.assignedTo = null;
  });
  const assignedKeys = new Set(assigned.map(p => `${p.q},${p.r}`));
  surroundingTiles.forEach(tile => {
    if (assignedKeys.has(`${tile.q},${tile.r}`)) tile.assignedTo = city.id;
  });

  city.assignedTiles = assigned;
}




export function getAvailableProductionsForCity(city, civilization, builtWonders = []) {
  const techsUnlocked = civilization.technologies || [];

  const hasTech = id => techsUnlocked.includes(id);
  const hasBuilding = id => city.buildings.includes(id);

  const isItemAvailable = (item) => {
    const reqs = item.requirements || {};
    if (reqs.science && !hasTech(reqs.science)) return false;
    if (reqs.building && !hasBuilding(reqs.building)) return false;
    if (item.type === 'merveille' && isWonderBuilt(builtWonders, item.id)) return false;
    return true;
  };

  const canAfford = (cost = {}) => {
    return Object.entries(cost).every(([res, amount]) => {
      return (city.resources[res] || 0) >= amount;
    });
  };

  const enrich = (item, type, extra = {}) => ({
    ...item,
    id: item.id || item.type,
    type,
    isAffordable: canAfford(item.cost),
    ...extra,
  });

  const buildings = Object.values(BUILDING_TYPES)
    .filter(isItemAvailable)
    .map(b => enrich(b, 'building'));

  const units = Object.values(UNIT_TYPES)
    .filter(isItemAvailable)
    .map(u => enrich(u, 'unit', { unitType: u.type }));

  const wonders = Object.values(MERVEILLES_DU_MONDE)
    .filter(isItemAvailable)
    .map(w => enrich(w, 'merveille'));

  return [...buildings, ...units, ...wonders];
}


export function chooseCityProduction(city, civilization, builtWonders) {
  // checker la garnison
  const unitToDeploy=[];
  city.garnison.forEach(unit => {
    // Par exemple : pionnier ou unité militaire (hors minimum défensif)
     if (isMilitaryUnit(unit)) {
        const garrisonCount = getGarnisonCount(city);
        const minRequired = getRequiredGarnison(civilization.diplomacyProfile);
        if (garrisonCount > minRequired) {
         unitToDeploy.push(unit);
        }
    }
    else
     unitToDeploy.push(unit);
});

  if (!city.productionQueue) city.productionQueue = [];
  if (city.currentProduction || city.productionQueue?.length)
     return unitToDeploy;

  const profile = civilization.diplomacyProfile;
  const buildable = getAvailableProductionsForCity(city, civilization, builtWonders); // doit inclure unités + bâtiments + merveilles

const affordable = buildable.filter(p => p.isAffordable);

  if (!buildable.length) return unitToDeploy;

  const setCityProd=(cit,prod)=>{
    cit.currentProduction = prod.id;
    cit.productionQueue.push(prod.id);
    cit.productionProgress = 0;

        for (const [res, amount] of Object.entries(prod.cost || {})) {
          cit.resources[res] = (cit.resources[res] || 0) - amount;
        }
  }
  // Pionnier ?
  if (Math.random() < (profile.expansionniste || 0.3)) {
    const settler = affordable.find(p => p.type === 'unit' && p.unitType === 'pionnier');
    if (settler) {
     setCityProd(city,settler);
    }
  }
  // Militaire ?
  else if (Math.random() < (profile.aggressif || 0.3)) {
    const military = affordable.find(p => p.type === 'unit' && isMilitaryUnit(p));
    if (military) {
     setCityProd(city,military);
    }
  }
  // diplomate ?
  else if (Math.random() < (profile.opportuniste || 0.3)) {
    const diplomat = affordable.find(p => p.type === 'unit' && p.unitType === 'diplomate');
    if (diplomat) {
     setCityProd(city,diplomat);
    }
  }
  else if(affordable.length>0){
  // Aléatoire dans le reste (bâtiments ou autres unités)
  const fallback = affordable[Math.floor(Math.random() * affordable.length)];
  setCityProd(city,fallback);

  }


      return unitToDeploy;
}




export const generateCityName=(civilization, terrainType)=> {
  const culture = civilization.id;
  const terrain = terrainType.toLowerCase();

  const syllables = {
    anglais: {
      prefixes: ['New ', 'Fort ', 'Lake ', 'North ', ''],
      cores: ['York', 'haven', 'chester', 'bury', 'mouth', 'bridge'],
      suffixes: ['', 'ton', 'ville', 'bury', 'hill']
    },
    allemand: {
      prefixes: ['Neu', 'Alt', '', 'Sankt'],
      cores: ['berg', 'dorf', 'heim', 'thal', 'furt'],
      suffixes: ['', 'stadt', 'berg', 'tal']
    },
    francais: {
      prefixes: ['Saint-', 'Mont', 'La ', 'Le ', 'Vieux ', ''],
      cores: ['ville', 'lune', 'roche', 'bois', 'fort', 'mer'],
      suffixes: ['', '-sur-Mer', '-en-Bois', '-le-Haut']
    },
    bresilien: {
      prefixes: ['São ', 'Nova ', 'Rio ', ''],
      cores: ['Luz', 'Sol', 'Flor', 'Verde', 'Brisa'],
      suffixes: ['', 'ópolis', 'ao', 'ina']
    },
    chinois: {
      prefixes: ['Xīn', 'Lóng', 'Hǎi', 'Běi', ''],
      cores: ['chuan', 'zhou', 'jing', 'li', 'shan'],
      suffixes: ['', 'cheng', 'guó']
    },
    zoulous: {
      prefixes: ['Kwa', 'Um', 'Zwe', 'Ama', ''],
      cores: ['zulu', 'bani', 'langa', 'kazi', 'ndaba'],
      suffixes: ['', 'wana', 'lela']
    },
    indien: {
      prefixes: ['Sri ', 'New ', 'Raj ', ''],
      cores: ['nagar', 'pur', 'abad', 'gaon', 'asthan'],
      suffixes: ['', 'garh', 'istan']
    },
    eldoria: {
      prefixes: ['El', 'Val', 'Aer', 'Thal', ''],
      cores: ['dore', 'rion', 'myr', 'ven', 'lor'],
      suffixes: ['', 'eth', 'wyn', 'as', 'ir']
    }
  };

  const terrainHints = {
    forest: ['Bois', 'Sylva', 'Ligna', 'Oak', 'Forêt'],
    desert: ['Dune', 'Sable', 'Thar', 'Zar', 'Arid'],
    mountain: ['Roche', 'Mont', 'Haute', 'Pic', 'Col'],
    water: ['Lac', 'Riv', 'Mer', 'Delta', 'Port'],
    plain: ['Val', 'Champ', 'Ferme', 'Pré']
  };

  const cultureSet = syllables[culture] || syllables.eldoria;
  const hintWords = terrainHints[terrain] || [];

  // Construction du nom
  const prefix = randomPick(cultureSet.prefixes);
  const core = randomPick(cultureSet.cores);
  const suffix = randomPick(cultureSet.suffixes);
  const terrainWord = Math.random() < 0.3 ? randomPick(hintWords) : '';

  let name = `${prefix}${core}${suffix}`;
  if (terrainWord && Math.random() < 0.5) name += '-' + terrainWord;

  return name.trim().replace(/\s+/g, ' ');
}

function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}


export function isTileNearMapEdge(tile, map, margin = 2) {
  const tileMap = new Map(map.map(t => [`${t.q},${t.r}`, true]));

  let toCheck = [tile];
  const visited = new Set([`${tile.q},${tile.r}`]);

  // BFS jusqu'à margin profondeur
  for (let depth = 0; depth < margin; depth++) {
    const next = [];
    for (const t of toCheck) {
      for (const { dq, dr } of [
        { dq: +1, dr:  0 }, { dq: +1, dr: -1 }, { dq:  0, dr: -1 },
        { dq: -1, dr:  0 }, { dq: -1, dr: +1 }, { dq:  0, dr: +1 },
      ]) {
        const nq = t.q + dq;
        const nr = t.r + dr;
        const key = `${nq},${nr}`;
        if (!tileMap.has(key)) return true; // bord détecté
        if (!visited.has(key)) {
          visited.add(key);
          next.push({ q: nq, r: nr });
        }
      }
    }
    toCheck = next;
  }

  return false; // pas de bord détecté dans la marge
}

export const TERRAIN_COST = {
  plain: 1,
  forest: 2,
  mountain: 3,
  water: 999, // sauf si canCrossWater: true, then
  desert: 1,
};

export const getTileCost = (tile) => {
  if (tile.hasRoad) return TERRAIN_COST[tile.type]/2 || 0.5;
  return TERRAIN_COST[tile.type] || 1;
};

export const applyFogOfWar=(tiles, playerId,getCityByTile)=> {
  const newTiles = tiles.map(tile => ({
    ...tile,
    visible: false // reset visible à chaque tour
  }));

  for (const tile of newTiles) {
    const unit = tile.unit;
    const city = tile.hasCity;
   
    const isPlayerUnit = unit?.owner?.id === playerId||getCityByTile(tile)?.owner?.id===playerId;

    if (!isPlayerUnit) continue;
    const range = unit?.range || city?3:1;
    const surrounding = getSurroundingTiles(tile, newTiles, range);

    surrounding.forEach(t => {
      t.explored = true;
      t.visible = true;
    });

    // La tuile actuelle de l’unité aussi
    tile.explored = true;
    tile.visible = true;
  }

  return newTiles;
}
