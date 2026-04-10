import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { STAGE_HEIGHT, STAGE_WIDTH, TILE_SIZE } from './CivMap';
import { generateMapWithTerrain } from "./utils/mapGenerator";
import { BUILDING_TYPES, MERVEILLES_DU_MONDE } from "./data/buildingTypes";
import {  UNIT_TYPES } from "./data/unitTypes";
import { TECHNOLOGIES } from "./data/techTree";
import { computeCityResources } from "./data/cityTypes";
import useShowAlert from '../jds/components/Message';
import { getDistanceHex, getHexNeighbors, getMovementResult, hexToPixel } from "./utils/hexUtils";
import { CIVILIZATIONS, getCivilization } from "./data/civilzationTypes";
import { loadGame, saveGame } from "./utils/saveGame";
import { applyFogOfWar, assignCityTiles, bonusDeBonheur, chooseCityProduction, chooseResearchIfNeeded, findCitySpot, findClosestEnemy, findClosestForeignCity, generateCityName, getGarnisonCount, getRequiredGarnison, getTileCost, getUnitTile, isGarnisonedInCity, isMilitaryUnit, isSameTile, isTileNearMapEdge, isValidCitySpot, moveUnitToward } from "./utils/utils";





const CivContext = createContext(undefined);

export const useCivContext = () => {
  const context = useContext(CivContext);
  if (!context) {
    throw new Error("pas de contexte");
  }
  return context;
};


export const TAUX_BASE = {
  stone: { gold: 1.2, wood: 1.4, iron: 0.6, food: 0.5, charbon: 0.8 },
  iron: { gold: 2.5, wood: 2, food: 1, charbon: 0.5, petrole: 0.7,stone:1.1 },
  wood: { food: 1.2, iron: 0.5, stone: 0.51, charbon: 0.74, gold: 0.8, laine: 0.84 },
  gold: { food: 1.2, wood: 0.9, iron: 0.35, uranium: 0.51, charbon: 0.64, petrole: 0.74 ,stone:0.9},
  food: { wood: 0.6, gold: 0.8, laine: 0.5, charbon: 0.8,stone:0.9},
  charbon: { gold: 1.8, stone:0.9, wood: 1, food: 0.84, petrole: 0.6 },
  petrole: { gold: 3, iron: 1.2, uranium: 0.4, food: 1.2, charbon: 0.8 },
  uranium: { gold: 8, petrole: 2, iron: 0.61 },
  laine: { gold: 0.5, food: 0.9, charbon: 0.8, petrole: 0.4 , stone:0.7},
};

const DUMMY_VILLE = {
  id: 'Paris', name: 'Paris', position: { q: 8, r: 4 }
  , owner: getCivilization('chinois'),              // joueur
  population: 2,       // par défaut : 1
  foundedTurn: 1, productionQueue: []
  , buildings: ['ferme', 'caserne'],        // ex: ['ferme', 'caserne']
  resources: { gold: 111, food: 50, wood: 50, iron: 10 },
  garnison: [{ id: 'unitEnnemi2', ...UNIT_TYPES.warrior, remainingMovement: 2, owner: 'chinois' }]
};



export const CivContextProvider = ({ setSelected, selectedNation, children }) => {
  const [tiles, setTiles] = useState([]);
  const [cities, setCities] = useState([DUMMY_VILLE]);
  const [turn, setTurn] = useState(1);
  const [diplomaticInteraction, setDiplomaticInteraction] = useState(null);
  const [playerNation, setPlayerNation] = useState(selectedNation);
  const [diplomaticRelations, setDiplomaticRelations] = useState({});
  const [taux, setTaux] = useState(TAUX_BASE);
  const [historique, setHistorique] = useState({});
  const [techsUnlocked, setTechsUnlocked] = useState([]);
  const [currentResearch, setCurrentResearch] = useState(null);
  const [researchProgress, setResearchProgress] = useState(0);
  const [eventLog, setEventLog] = useState([]);
  const [CIVILIZATIONS_inGame, setCivInGame] = useState([...CIVILIZATIONS]);
  const [fxTrigger, setFxTrigger] = useState(null);
  const [isRunning, setRunning] = useState(false);
  const [selectedUnitPos, setSelectedUnitPos] = useState(null); // ex: { q, r }
  const [builtWonders, setBuiltWonders] = useState([]); // ID des merveilles déjà construites

  const { showAlert, SnackbarComponent } = useShowAlert({ verticalAnchor: 'bottom' });



  const getCityByTile = React.useCallback((tile) => {
    return cities.find(
      city => city.position.q === tile.q && city.position.r === tile.r
    );
  }, [cities]);

  useEffect(() => {
    if (selectedNation && tiles.length==0) {
      setPlayerNation(selectedNation);
      initializeDiplomacy(selectedNation);
      let generated = generateMapWithTerrain(
        STAGE_WIDTH, STAGE_HEIGHT, TILE_SIZE,
        selectedNation // le owner des premières unités
      );
      let placed = false;
      // const placedCities = [];

      // while (!placed) {
      //   placed = placeCity(generated, selectedNation, 'Strasbourg');
      //   if (placed)
      //     placedCities.push(placed);
      // }
      // placed = false
      // while (!placed) {
      //   placed = placeCity(generated, getCivilization('anglais'), 'Londres');
      //   if (placed)
      //     placedCities.push(placed);

      // }
      // setCities(placedCities);
      // placed = false
      CIVILIZATIONS.forEach((civ,cidx)=>{
        placed = false;
        
        while (!placed) {
          placed = placeUnit(generated, {...UNIT_TYPES['pionnier'], id:'Schwarzy-'+cidx}, civ);
         
        }
      })
      

      
      generated = applyFogOfWar(generated, selectedNation.id, getCityByTile)
      setTiles(generated);
    }
  }, [selectedNation]);
  


  // **************Diplomatic et Civilization functions **************************
  const knownCivs = CIVILIZATIONS.map(c => c.id);
  const initializeDiplomacy = (playerCiv) => {
    const initialRelations = {};
    for (const civ of knownCivs) {
      if (civ !== playerCiv) {
        const key = [playerCiv, civ].sort().join('-');
        initialRelations[key] = 'neutral';
      }
    }
    setDiplomaticRelations(initialRelations);
  };


  const getDiplomaticRelation = (civA, civB) => {
    if (civA === civB) return 'self';
    const key = [civA, civB].sort().join('-');
    return diplomaticRelations[key] || 'neutral';
  };

  const setDiplomaticRelation = (civA, civB, status) => {
    const key = [civA, civB].sort().join('-');
    setDiplomaticRelations(prev => ({
      ...prev,
      [key]: status,
    }));
  };
  const RELATION_LEVELS = ['war', 'tendu', 'neutral', 'peace', 'allied'];

  const shiftDiplomaticRelation = (playerNation, targetCiv, up) => {
    setDiplomaticRelations(prev => {
      const key = [playerNation, targetCiv].sort().join('-');
      const current = prev[key] || 'neutral';
      const index = RELATION_LEVELS.indexOf(current);
      const newIndex = Math.max(0, Math.min(RELATION_LEVELS.length - 1, index + (up ? 1 : -1)));
      const next = RELATION_LEVELS[newIndex];

      return {
        ...prev,
        [key]: next,
      };
    });
  };

  // **********************  functions de Tour  *******************
  const nextTurn = () => {

    // au tour des adversaires de jouer
    let newCivCities=[];
   
    const activeCivIds = new Set(tiles
      .flatMap(t => [t.city?.owner?.id, t.unit?.owner?.id])
      .filter(Boolean));

const [surviving, eliminated] = CIVILIZATIONS_inGame.reduce(
  ([alive, dead], civ) => 
    activeCivIds.has(civ.id) 
      ? [alive.concat(civ), dead] 
      : [alive, dead.concat(civ)],
  [[], []]
);
if(eliminated.length>0){

  // Notifier les éliminations
  eliminated.forEach(civ => addEvent(`La civilisation des ${civ.name} a disparu`, 'error', true));
  // Mettre à jour le tableau
  setCivInGame(surviving);
}


    CIVILIZATIONS_inGame.forEach(civ => { 
     const newCities = playAITurn(civ);
     if(newCities.length>0)
      newCivCities = newCivCities.concat(newCities);
     })
     
    // 🧭 Remise à zéro des mouvements et régénération
    setTiles(prev =>
      prev.map(tile => {
        if (tile.unit) {
          return {
            ...tile,
            unit: {
              ...tile.unit,
              hp: Math.min(tile.unit.hpMax, Math.ceil(tile.unit.hp * 1.2)),
              veterancy: tile.unit.veterancy || (tile.unit.hp === tile.unit.hpMax - 1),
              remainingMovement: tile.unit.movement
            }
          };
        }
        return tile;
      })
    );

    // applyFog after move
    setTiles(prev => {
        const tilesWithFog = applyFogOfWar(prev, playerNation.id,getCityByTile);
        return tilesWithFog;
    })
    // mouvements automatiques
setTiles(prev => {
  const updated = prev.map(t => ({ ...t, unit: t.unit ? { ...t.unit } : null })); // copie profonde de l’unité

  for (const tile of updated) {
    const unit = tile.unit;
    if (!unit || !unit.targetDestination) continue;

    const goal = unit.targetDestination;
    const start = { q: tile.q, r: tile.r };

    const result = getMovementResult(unit, start, goal, updated);
    if (!result) continue;

    const { endTile, movementUsed } = result;
    const destTile = updated.find(t => t.q === endTile.q && t.r === endTile.r);

    // ❌ Si bloqué, annule target
    if (destTile.unit || destTile.hasCity) {
      tile.unit.targetDestination = null;
      continue;
    }

    // ✅ Déplacement vers case cible
    destTile.unit = {
      ...unit,
      remainingMovement: unit.movement - movementUsed,
      targetDestination: isSameTile(goal, endTile) ? null : goal,
    };

    tile.unit = null; // cette fois on modifie bien dans `updated`
  }

  return updated;
});


    // application des merveilles
    builtWonders.forEach(id => {
      const merveille = MERVEILLES_DU_MONDE[id];
      merveille.effectParTurn?.(cities);
    });
    // regulation des marché
    const [newTaux, newHistorique] = updateMarketRates(taux, historique);
    setTaux(newTaux);
    setHistorique(newHistorique);

    let sommeScience = 0;

    // 🏙️ Traitement des villes
    const updatedCities = cities.map(city => {
      const updated = { ...city };
      const civ = updated.owner;
      const buildingBonus = civ?.buildingBonus || 0;


      // 1️⃣ Récolte de ressources
      const baseGain = computeCityResources(updated, tiles); // Ex: { food: 2, gold: 1 }

      // 2️⃣ Bonus des bâtiments
      for (const buildingId of updated.buildings || []) {
        const building = BUILDING_TYPES[buildingId];
        if (building?.production) {
          for (const [res, amount] of Object.entries(building.production)) {
            baseGain[res] = (baseGain[res] || 0) + amount;
          }
        }
      }
      // 2.5. Croissance démographique
      const currentPop = updated.population || 1;
      const maxPop = 10;
      const foodAvailable = updated.resources.food || 0;

      const foodNeededForNextPop = pop => Math.round(30 + 10 * Math.pow(pop, 1.5));

      if (currentPop < maxPop) {
        const foodCost = foodNeededForNextPop(currentPop);

        if (foodAvailable >= foodCost) {
          updated.population = currentPop + 1;
          updated.resources.food -= foodCost;
          if(updated.owner.id===playerNation.id)  
            addEvent(`🎉 La ville de ${updated.name} atteint une population de ${updated.population * 1000} personnes !`, 'info');
        }
      }

      // 3️⃣ Bonus de civilisation (ex: +20% sur tous les gains)
      for (const [res, amount] of Object.entries(baseGain)) {
        baseGain[res] = Math.ceil(amount * (1 + buildingBonus));
      }

      // 5️⃣ Application des ressources
      for (const [res, amount] of Object.entries(baseGain)) {
        updated.resources[res] = (updated.resources[res] || 0) + amount;
      }

      // 🛠️ Production
      if (updated.currentProduction) {
        updated.productionProgress += 1;
        const isBuilding = BUILDING_TYPES[updated.currentProduction];
        const isUnit = UNIT_TYPES[updated.currentProduction];
        const turns = isBuilding?.turns || isUnit?.turns || 1;

        if (updated.productionProgress >= turns) {
          if (isBuilding) {
            updated.buildings.push(updated.currentProduction);
            if (isUnit?.type === 'merveille') {
              isUnit.effectInauguration(civ);
              setBuiltWonders(prev => [...prev, isUnit.id]);
            }
if(updated.owner.id===playerNation.id)  
            addEvent("Production achevée : " + updated.currentProduction + " dans la ville de " + updated.name);
          } else if (isUnit) {
            if(updated.owner.id===playerNation.id)  
            addEvent(isUnit.name + " est achevé dans la ville de " + updated.name);
            updated.garnison = [...(updated.garnison || []), {
              id: `${updated.currentProduction}-${Date.now()}`,
              ...isUnit,
              owner: updated.owner,
              remainingMovement: isUnit.movement
            }];
          }

          updated.productionQueue.shift();
          updated.currentProduction = updated.productionQueue[0] || null;
          updated.productionProgress = 0;
        }
      } else if (updated.productionQueue.length > 0) {
        updated.currentProduction = updated.productionQueue[0];
        updated.productionProgress = 0;
      }
      // recupere la science
      sommeScience += updated.resources.science || 0;
      sommeScience += bonusDeBonheur(updated.resources.happiness,20)
      updated.resources.science = 0;
      return updated;
    })
    setCities([...updatedCities,...newCivCities]);


    // 🎓 Avancement de la recherche
    if (currentResearch) {
      const tech = TECHNOLOGIES[currentResearch];
      let progression = Math.max(1, Math.ceil(sommeScience / 5)); // ca peut faire jusqu'a 25-30 avec une  ou deux ecole, reduire pour une echelle de 1 a 10

      // resources.science de toutes les villes + bonus de merveilles ou de civ
      if (playerNation.bonuses.science != null)
        progression += playerNation.bonuses.science;
      setResearchProgress(prev => {
        const newProgress = prev + progression;
        if (newProgress >= tech.cost) {
          addEvent("Nouvelle découverte : " + tech.name, 'success', true);
          setTechsUnlocked(prev => [...prev, tech.id]);
          setCurrentResearch(null);
          return 0;
        }
        return newProgress;
      });
    }
    else addEvent("Nos scientifiques se font chier, donnez leur un objectif")

    // ✅ Fin du tour
    setTurn(prev => prev + 1);
    setRunning(false);
  };

  const addEvent = (text, type = 'info', persistent = false) => {
    const evt = {
      id: Date.now(),
      text,
      type,           // 'info', 'warning', 'success', 'error'
      timestamp: turn,
      persistent
    };

    if (persistent)
      setEventLog(prev => [...prev.slice(-49), evt]); // max 50
    showAlert(text, type);

  };



  const cheatGiveResources = () => {
    if (!selectedCity) return;

    setCities(prev =>
      prev.map(city =>
        city.id === selectedCity.id
          ? {
            ...city,
            resources: {
              food: 999,
              gold: 999,
              iron: 999,
              stone: 999,
              wood: 999,
              charbon: 999,
              petrole: 999,
              laine: 999,
            },
          }
          : city
      )
    );
  };



  // *****************   functions de unit  *************************
  const moveUnit = (from, to) => {
    const movingUnit = from.unit;
    const tileCost = getTileCost(to);
    const updatedUnit = {
      ...movingUnit,
      remainingMovement: movingUnit.remainingMovement - tileCost
    };

    if (to.hasCity) {
      const city = cities.find(c => c.position.q === to.q && c.position.r === to.r);
      if (city && city.owner === movingUnit.owner) {
        // 🏛️ Ajout à la garnison
        setCities(prev =>
          prev.map(c =>
            c.id === city.id
              ? {
                ...c,
                garnison: [...(c.garnison || []), { ...movingUnit, id: `${movingUnit.type}-${Date.now()}` }],
              }
              : c
          )
        );
        // Supprimer de la carte
        setTiles(prev =>
          prev.map(t =>
            t.q === from.q && t.r === from.r
              ? { ...t, unit: null }
              : t
          )
        );
        setSelectedUnitPos(null);
        return;
      }
    }

    setTiles(prev =>
      prev.map(t => {
        if (t.q === from.q && t.r === from.r) return { ...t, unit: null };
        if (t.q === to.q && t.r === to.r) return { ...t, unit: updatedUnit };
        return t;
      })
    );
    to.unit = updatedUnit;
    setSelectedUnitPos(to);
  };
  const fortifyUnit = (pos) => {
    console.log("Fortifier unité en", pos);
    setTiles(prev =>
      prev.map(tile => {
        if (tile.q === pos.q && tile.r === pos.r && !tile.fortified) {
          return { ...tile, unit: { ...tile.unit, fortified: true, defense: tile.unit.defense + 5 } };
        }
        return tile;
      })
    );
    setSelectedUnitPos(null);
    // À implémenter : marquer l’unité comme fortifiée
  };


  const removeUnit = (pos) => {
    addEvent('Unité ' + pos.unit.name + ' nous a quitté, paix a son ame')
    setTiles(prev =>
      prev.map(tile => {
        if (tile.q === pos.q && tile.r === pos.r) {
          return { ...tile, unit: null };
        }
        return tile;
      })
    );
    setSelectedUnitPos(null);
  };
  const deployUnit = (city, unit, returnDestintion) => {
    const voisins = getHexNeighbors(city.position, tiles);
    const tileCibles = voisins
      .map(pos => tiles.find(t => t.q === pos.q && t.r === pos.r))
      .filter(t => t && !t.unit && (!t.hasCity)
        && ((unit.canCrossWater && t.type === 'water')
          || (!unit.canCrossWater && t.type !== 'water')));

    if (tileCibles.length === 0) {
      addEvent("Aucune case libre autour pour sortir l’unité !");
      return;
    }

    const destination = tileCibles[Math.floor(Math.random() * tileCibles.length)];
    // Déployer sur la map
    setTiles(prev =>
      prev.map(t =>
        t.q === destination.q && t.r === destination.r
          ? { ...t, unit: unit }
          : t
      )
    );
    if(returnDestintion)
      return destination;
    
    city.garnison = city.garnison.filter(u => u.id !== unit.id);

    // Retirer de la garnison
    setCities(prev =>
      prev.map(c =>
        c.id === city.id
          ? { ...c, garnison: c.garnison.filter(u => u.id !== unit.id) }
          : c
      )
    );
  }
  const attaque = (defenderTile, providedAttackerTile) => {
    const attackerTile = providedAttackerTile || selectedUnitPos;
    const attackerUnit = attackerTile.unit;
    const defenderUnit = defenderTile.unit;

    if (!attackerUnit || !defenderUnit) return;

    if (attackerUnit.owner.id === defenderUnit.owner.id)
      return setSelectedUnitPos(null); // pas d'attaque alliée

    const { attacker, defender } = resolveCombat(attackerUnit, defenderUnit);
    const attackerCoords = { q: attackerTile.q, r: attackerTile.r };
    const defenderCoords = { q: defenderTile.q, r: defenderTile.r };

    const { x: dx, y: dy } = hexToPixel(defenderTile);
    setFxTrigger({ x: dx, y: dy, type: 'explosion', timestamp: Date.now() });

    // 1. Mettre à jour les tuiles immédiatement après l'attaque
    setTiles(prev =>
      prev.map(t => {
        if (t.q === defenderCoords.q && t.r === defenderCoords.r) {
          return { ...t, unit: defender.hp <= 0 ? null : defender };
        }
        if (t.q === attackerCoords.q && t.r === attackerCoords.r) {
          return { ...t, unit: attacker.hp <= 0 ? null : attacker };
        }
        return t;
      })
    );

    setSelectedUnitPos(null);

    addEvent(`${UNIT_TYPES[attackerUnit.type].name} attaque ${UNIT_TYPES[defenderUnit.type].name}`, 'info', true);

    // 2. Riposte différée si applicable
    const shouldRetaliate = defender.hp > 0 && attacker.hp > 0 && defender.range === 1;

    if (shouldRetaliate) {
      setTimeout(() => {
        const { attacker: defAsAtk, defender: atkAfterRetaliation } = resolveCombat(defender, attacker);

        setTiles(prev =>
          prev.map(t => {
            if (t.q === attackerCoords.q && t.r === attackerCoords.r) {
              return { ...t, unit: atkAfterRetaliation.hp <= 0 ? null : atkAfterRetaliation };
            }
            return t;
          })
        );

        const { x: ax, y: ay } = hexToPixel(attackerTile);
        setFxTrigger({ x: ax, y: ay, type: 'explosion', timestamp: Date.now() });

        addEvent(`${UNIT_TYPES[defenderUnit.type].name} contre-attaque ${UNIT_TYPES[attackerUnit.type].name}`, 'info', true);
      }, 300);
    }
  };

  const attaqueCity = (defenderTile) => {
    const city = cities.find(c => c.position.q === defenderTile.q && c.position.r === defenderTile.r);
    if (!city || city.owner.id === selectedUnitPos.unit.owner.id) return;

    const attackerTile = selectedUnitPos;
    const attackerUnit = attackerTile.unit;

    const attackerCoords = { q: attackerTile.q, r: attackerTile.r };
    const defenderCoords = { q: city.position.q, r: city.position.r };
    const { x: dx, y: dy } = hexToPixel(defenderTile);
    setFxTrigger({ x: dx, y: dy, type: 'explosion', timestamp: Date.now() });

    if (city.garnison && city.garnison.length > 0) {
      const defenderUnit = city.garnison[0];
      const { attacker, defender: newDef } = resolveCombat(attackerUnit, defenderUnit, city.buildings.includes('cityWalls'));

      // Update la garnison
      const updatedGarnison = newDef.hp <= 0
        ? city.garnison.slice(1)
        : [newDef, ...city.garnison.slice(1)];

      setCities(prev =>
        prev.map(c =>
          c.id === city.id ? { ...c, garnison: updatedGarnison } : c
        )
      );

      // Explosion si contre-attaque possible
      const shouldRetaliate = newDef.hp > 0 && attacker.hp > 0 && newDef.range === 1;
      if (shouldRetaliate) {
        setTimeout(() => {
          const { attacker: defAsAtk, defender: atkAfterRetaliation } = resolveCombat(newDef, attacker);

          setTiles(prev =>
            prev.map(t =>
              t.q === attackerCoords.q && t.r === attackerCoords.r
                ? { ...t, unit: atkAfterRetaliation.hp <= 0 ? null : atkAfterRetaliation }
                : t
            )
          );

          const { x: ax, y: ay } = hexToPixel(attackerCoords);
          setFxTrigger({ x: ax, y: ay, type: 'explosion', timestamp: Date.now() });

          addEvent(`${UNIT_TYPES[newDef.type].name} contre-attaque ${UNIT_TYPES[attacker.type].name}`, 'info', true);
        }, 300);
      }

      // Maj attaquant sur la carte
      setTiles(prev =>
        prev.map(t =>
          t.q === attackerCoords.q && t.r === attackerCoords.r
            ? { ...t, unit: attacker.hp <= 0 ? null : attacker }
            : t
        )
      );

      setSelectedUnitPos(null);
      addEvent(`Attaque sur ${city.name}`, 'info', true);
    } else {
      // Pas de garnison : conquête directe
      setCities(prev => {
        return prev.reduce((acc, c) => {
          if (c.id !== city.id) {
            acc.push(c);
            return acc;
          }

          const newOwner = attackerUnit.owner;
          const newPopulation = Math.max(0, c.population - 1);

          if (newPopulation === 0) {
            // 🔥 Ville rasée
            setTiles(prev =>
              prev.map(t =>
                t.q === c.position.q && t.r === c.position.r
                  ? { ...t, hasCity: false }
                  : t
              )
            );
            addEvent(`${c.name} a été rasée !`, 'error', true);
            return acc; // on ne remet pas cette ville dans la liste
          }

          // 🏚️ Pillage : perte aléatoire de bâtiments
          const keptBuildings = [...c.buildings];
          const shuffled = keptBuildings.sort(() => Math.random() - 0.5);
          const survivors = shuffled.slice(0, Math.ceil(keptBuildings.length / 2));

          // 🤝 Nouvelle ville capturée on met la unit dans la garnison et on la retire de la tuile
          acc.push({
            ...c,
            owner: newOwner,
            population: newPopulation,
            buildings: survivors,
            garnison: [{ ...attackerUnit, id: `${attackerUnit.type}-${Date.now()}` }],
          });

  setTiles(prev =>
        prev.map(t =>  t.q === attackerCoords.q && t.r === attackerCoords.r
            ? { ...t, unit: null }: t ));
          // 👁️ On entre dans la ville
          selectCity({ q: c.position.q, r: c.position.r });
          setSelected('city');

          addEvent(`${c.name} a été capturée par ${newOwner.name}`, 'success', true);
          return acc;
        }, []);
      });

    }
  };


  // ***************       functions de Villes **************************
  const foundCity = (pos, cityName, owner) => {
    pos.unit=null;
    if (!cityName||cityName == '')
      cityName = generateCityName(owner, pos.type);
    if (owner == null)
      owner = playerNation;
    const newCity = {
      id: `city-${cities.length + 1}`,
      name: cityName,
      position: pos,
      owner: owner,
      population: 2,
      foundedTurn: turn, // temporaire, à lier au système de tour plus tard
      buildings: [],
      productionQueue: [],
      garnison:[],
      currentProduction: null,
      productionProgress: 0,
      resources: {
        food: 50,
        gold: 50,
        stone: 10,
        iron: 10,
        laine: 10,
        wood: 10,
        petrole: 0, uranium: 0
        , happiness: 10, science: 0
      },
    };

    addEvent("La ville de " + cityName + " vient d'etre creee", 'success', true);
   // setCities(prev => [...prev, newCity]);

    // Supprime le pionnier sur la case
    setTiles(prev =>
      prev.map(tile => {
        if (tile.q === pos.q && tile.r === pos.r) {
          return { ...tile, unit: null, hasCity: true , hasRoad:true}; // on ajoute hasCity ici
        }
        return tile;
      })
    );

    // Fermer les sélections
    setSelectedUnitPos(null);
    setSelected('map');
    return newCity;
  };
  const [selectedCity, setSelectedCity] = useState(null);

  const selectCity = (pos) => {
    const found = cities.find(c => c.position.q === pos.q && c.position.r === pos.r);
    setSelectedCity(found || null);
  };


  /**  **************   Functions pour les AI  ****************** */
  const playAITurn = (civilization) => {
    // must return [] city created
    const allUnits = tiles.filter(t => t.unit != null).map(t => t.unit);
    const civCities = cities.filter(city => city.owner.id === civilization.id);
    const civUnits = allUnits.filter(unit => unit.owner.id === civilization.id);

    // 1. Réassignation des tuiles pour maximiser les ressources
    civCities.forEach(city => {
      assignCityTiles(city, tiles);
    });

    // 2. Choix de la production (unités ou bâtiments)
    let deployedUnits = [];
    civCities.forEach(city => {
      const toDeploy = chooseCityProduction(city, civilization, builtWonders);
      if (toDeploy.length > 0)
        deployedUnits.push({ city: city, toDeploy: toDeploy });
    });
    if (deployedUnits.length > 0) {
      deployedUnits.forEach(un => {
        for (let d = 0; d < un.toDeploy.length; d++)
          deployUnit(un.city, un.toDeploy[d]);
        civUnits.push(un.toDeploy);
      })
    }

    // 3. Recherche scientifique (globale, donc inutile)
    // chooseResearchIfNeeded(civilization);

    const createdCities=[];
    // 4. Actions des unités
    civUnits.forEach(unit => {
      if (unit.remainingMovement > 0) {
       const newcity = handleUnitAI(unit, civilization, {
          getDiplomaticRelation,
        });
        if(newcity)
          createdCities.push(newcity);
      }
    });
    return createdCities
  }

  const launchDiplomaticInteraction = (unit, city) => {


    const fromNation = unit.owner;
    const toNation = city.owner;
    const relation = getDiplomaticRelation(fromNation, toNation);
    const profile = toNation.diplomacyProfile || {};

    const removeDiplomate = () => {
      setTiles(prev =>
        prev.map(t =>
          t.unit?.id === unit.id ? { ...t, unit: null } : t
        )
      );
    };

    const updateCities = updater => {
      setCities(prev => prev.map(c => updater(c)));
    };


    if (relation === 'war') {
      if (profile.agressif < 0.4 && Math.random() > profile.agressif) {
        // Demande de paix acceptée
        setDiplomaticRelation(fromNation, toNation, 'peace');
        addEvent(`${toNation.name} a accepté la paix avec ${fromNation.name}.`, 'info', true);
      } else if (Math.random() > profile.agressif + 0.3) {
        // Tribute accepté
        updateCities(c => {
          if (c.owner === fromNation) {
            return {
              ...c,
              resources: {
                ...c.resources,
                gold: (c.resources.gold || 0) + 100,
              },
            };
          }
          return c;
        });
        shiftDiplomaticRelation(fromNation, toNation, true);
        addEvent(`${toNation.name} a payé un tribut à ${fromNation.name}.`, 'info', true);
      } else {
        // Rien accepté
        addEvent(`${toNation.name} a refusé tout dialogue avec ${fromNation.name}.`, 'warning', true);
      }
    } else if (relation === 'neutral') {
      if (profile.genereux > 0.6 && Math.random() < profile.genereux) {
        setDiplomaticRelation(fromNation, toNation, 'peace');
        updateCities(c => {
          if (c.owner === fromNation) {
            return {
              ...c,
              resources: {
                ...c.resources,
                gold: (c.resources.gold || 0) - 50,
              },
            };
          }
          return c;
        });
        addEvent(`${fromNation.name} a offert la paix à ${toNation.name}.`, 'info', true);
      } else if (profile.opportuniste > 0.4 && Math.random() < profile.opportuniste) {
        updateCities(c => {
          if (c.owner === fromNation) {
            return {
              ...c,
              resources: {
                ...c.resources,
                gold: (c.resources.gold || 0) + 50,
                laine: (c.resources.laine || 0) - 10,
              },
            };
          } else if (c.owner === toNation) {
            return {
              ...c,
              resources: {
                ...c.resources,
                gold: (c.resources.gold || 0) - 50,
                laine: (c.resources.laine || 0) + 10,
              },
            };
          }
          return c;
        });
        shiftDiplomaticRelation(fromNation, toNation, true);
        addEvent(`${fromNation.name} a conclu un accord commercial avec ${toNation.name}.`, 'success', true);
      }
    } else if (relation === 'peace') {
      if (profile.protectionniste > 0.5 && Math.random() < profile.protectionniste) {
        setDiplomaticRelation(fromNation, toNation, 'allied');
        addEvent(`${fromNation.name} et ${toNation.name} forment une alliance.`, 'success', true);
      } else if (profile.opportuniste > 0.3 && Math.random() < profile.opportuniste) {
        // commerce en paix
        updateCities(c => {
          if (c.owner === fromNation) {
            return {
              ...c,
              resources: {
                ...c.resources,
                gold: (c.resources.gold || 0) + 50,
                laine: (c.resources.laine || 0) - 10,
              },
            };
          } else if (c.owner === toNation) {
            return {
              ...c,
              resources: {
                ...c.resources,
                gold: (c.resources.gold || 0) - 50,
                laine: (c.resources.laine || 0) + 10,
              },
            };
          }
          return c;
        });
        shiftDiplomaticRelation(fromNation, toNation, true);
        addEvent(`${fromNation.name} a échangé des ressources avec ${toNation.name}.`, 'info', true);
      }
    }

    removeDiplomate();
  }
  const lostUnit=unit=>{
    // if lost return to rita
    const capitale=cities.find(c=>c.owner.id==unit.owner.id);
    if(capitale!=null){
      return deployUnit(capitale,unit,true);
    }
    return null;
  }
  const handleUnitAI = (unit, civilization, options) => {
    const unitTile = getUnitTile(unit, tiles)||lostUnit(unit);
    if(unitTile==null)
      return null;
    let createdCity=null
    if (unit.type === 'pionnier') {
      if (!unit.targetCitySpot || !isValidCitySpot(unit.targetCitySpot, tiles)) {
        unit.targetCitySpot = findCitySpot(unitTile, tiles, cities);
      }

      const spot = unit.targetCitySpot;
      const someCities = cities.find(c=>c.owner.id===civilization.id);
      if(!someCities)// y a urgence, on s'installe ici
      {
        createdCity = foundCity(unitTile, null,civilization);
      }
      else if (spot && isSameTile(unitTile, spot)) {
        createdCity = foundCity(spot, null,civilization);
        unit.targetCitySpot = null;
      } else {
         const movedResult = moveUnitToward(unit, spot, tiles);
          if(movedResult.moved && isSameTile(movedResult.lastReachedPosition, spot)) 
            createdCity = foundCity(spot, null,civilization);
      }
    }

    else if (isMilitaryUnit(unit)) {
      
      const enemy = findClosestEnemy(unit, civilization, tiles, cities, options); //{type, position , unit/city}
 
      if (enemy) {
        
          // 👣 Avancer jusqu’à être à portée
         const movedResult = moveUnitToward(unit, enemy.position, tiles, { stopBeforeTarget: true });
         if((movedResult.moved && getDistanceHex(movedResult.lastReachedPosition, enemy.position) === 1) 
         || (getDistanceHex(unitTile, enemy.position) === 1)) {
                  // 👊 Déjà à portée → on attaque
                  if(enemy.type==='city')
                    {
                      if(enemy.city.garnison.length==0||enemy.city.garnison.every(g=>g.hp<=0)){
                        // prend la ville
                        enemy.city.owner=civilization;
                        enemy.city.garnison.push(unit);
                        unitTile.unit=null;
                      }
                      else{
                        // attaque le premier garde
                      const garde = enemy.city.garnison[0];
                      attaque({unit:garde, ...enemy.city}, unitTile);
                      }
                  }
                  else
                    attaque(enemy, unitTile);
        }
      } else {
        moveUnitToward(unit, null, tiles);
      }
    }

    else if (unit.type === 'diplomate') {
      const targetCity = findClosestForeignCity(unit, cities,getDiplomaticRelation, tiles);
      if (targetCity) {
        if (isSameTile(unitTile, targetCity)) {
          launchDiplomaticInteraction(unit, targetCity); // on y reviendra
        } else {
          moveUnitToward(unit, targetCity, tiles,{stopBeforeTarget:true});
        }
      }
    }
    return createdCity;
  }

  // pour la sauvegarde
  const getGameState = () => ({
    tiles,
    cities,
    turn,
    diplomaticInteraction,
    playerNation,
    diplomaticRelations,
    taux,
    historique,
    techsUnlocked,
    currentResearch,
    researchProgress,
    eventLog,
    builtWonders,
  });
  const setGameState = (state) => {
    if (!state) return;
    setTiles(state.tiles || []);
    setSelectedCity(null);
    setCities(state.cities || []);
    setTurn(state.turn || 1);
    setDiplomaticInteraction(state.diplomaticInteraction || null);
    setPlayerNation(state.playerNation || null);
    setDiplomaticRelations(state.diplomaticRelations || {});
    setTaux(state.taux || TAUX_BASE);
    setHistorique(state.historique || {});
    setTechsUnlocked(state.techsUnlocked || []);
    setCurrentResearch(state.currentResearch || null);
    setResearchProgress(state.researchProgress || 0);
    setEventLog(state.eventLog || []);
    setBuiltWonders(state.builtWonders || []);
  };
  const saveCiv = () => {
    saveGame(getGameState());
    addEvent("Partie sauvegardee")
  }
  const loadCiv = () => {
    const data = loadGame();
    if (data) {
      setGameState(data);
      addEvent("Partie chargée !");
    } else {
      addEvent("Aucune sauvegarde trouvée.");
    }
    return data;
  }

  const value = {
    tiles,
    setTiles,
    selectedUnitPos,
    saveCiv, loadCiv,
    setSelectedUnitPos,
    moveUnit, fortifyUnit, removeUnit, deployUnit,
    foundCity, fxTrigger, triggerEffect: (x, y, type) => setFxTrigger({ x, y, type, timestamp: Date.now() }),
    cities, selectedCity, getCityByTile,
    selectCity, setSelectedCity,
    setCities,
    turn, diplomaticInteraction, setDiplomaticInteraction,
    setTurn, playerNation,isRunning, setRunning,
    nextTurn, attaque, attaqueCity,
    cheatGiveResources, setDiplomaticRelation
    , techsUnlocked, setTechsUnlocked,
    currentResearch, setCurrentResearch,
    researchProgress, setResearchProgress,
    addEvent, showAlert, eventLog, builtWonders
    , shiftDiplomaticRelation, getDiplomaticRelation, diplomaticRelations
    , taux, setTaux, historique
  };

  return (
    <CivContext.Provider value={value}>
      {children}
      {SnackbarComponent}
    </CivContext.Provider>
  );
};





// Taux de base robustes et équilibrés

const updateMarketRates = (currentRates, historique) => {
  const newRates = {};
  for (const from in currentRates) {
    newRates[from] = {};
    for (const to in currentRates[from]) {
      const base = currentRates[from][to];
      const variation = 1 + (Math.random() * 0.2 - 0.1); // ±10%
      const newRate = +(base * variation).toFixed(2);
      newRates[from][to] = newRate;

      // Historique pour graphique
      if (!historique[from]) historique[from] = {};
      if (!historique[from][to]) historique[from][to] = [];
      historique[from][to].push(newRate);
      if (historique[from][to].length > 20) historique[from][to].shift(); // 20 derniers tours
    }
  }
  return [newRates, historique];
}

function resolveCombat(attacker, defender, cityWalls) {
  //check militaryBonus
  const atkCiv = getCivilization(attacker.owner);
  const defCiv = getCivilization(defender.owner);


  const atk = attacker.attack + (attacker.veterancy ? 2 : 0) + atkCiv?.militaryBonus || 0;
  const def = defender.defense + (defender.veterancy ? 1 : 0) + defCiv?.militaryBonus || 0;
  const fortifyBonus = cityWalls ? 3 : (defender.fortified ? 1 : 0);

  const damageToDef = Math.max(1, atk - (def + fortifyBonus));
  const damageToAtk = Math.max(0, Math.floor((def + fortifyBonus) / 2));

  const newDefHP = defender.hp - damageToDef;
  const newAtkHP = attacker.hp - damageToAtk;

  return {
    attacker: { ...attacker, hp: newAtkHP },
    defender: { ...defender, hp: newDefHP }
  };
}

function placeUnit(map, unitObj, owner, tile = null) {
  let targetTile = tile;


  if (!targetTile) {
  const landTiles = map.filter(t =>
    t.type !== 'water' &&
    !t.city &&
    !isTileNearMapEdge(t, map)
  );

  if (landTiles.length === 0) {
    console.warn("Aucune tuile intérieure disponible pour placer une ville.");
    return null;
  }

  targetTile = landTiles[Math.floor(Math.random() * landTiles.length)];
}


  if (targetTile.type === 'water') {
    console.warn("Impossible de placer une unité sur une tuile d'eau.");
    return null;
  }

  // Création de l’unité
  const unit = {
    ...unitObj,
    remainingMovement: unitObj.movement,
    owner: owner
  };
  targetTile.unit = unit;
  return unit;
}

function placeCity(map, civ, cityName, tile = null) {

  let targetTile = tile;
  if (cityName == null)
    cityName = civ.name + ' ' + Math.floor(Math.random() * 100)

  if (!targetTile) {
    const landTiles = map.filter(t =>
      t.type !== 'water' &&
      !t.city &&
      !isTileNearMapEdge(t, map) // ← ici on évite les bords
    );

    if (landTiles.length === 0) {
      console.warn("Aucune tuile intérieure disponible pour placer une ville.");
      return null;
    }

    targetTile = landTiles[Math.floor(Math.random() * landTiles.length)];
  }

  // Vérification de sécurité
  if (targetTile.type === 'water' || targetTile.city) {
    console.warn("Impossible de placer une ville sur cette tuile.");
    return null;
  }

  // Création de la ville
  const city = {
    id: `city_${cityName.replace(/\s/g, "_")}_${Date.now()}`,
    name: cityName,
    position: { q: targetTile.q, r: targetTile.r },
    owner: civ, currentProduction: "worker", productionProgress: 1,
    productionQueue: ["worker"], population: 2,       // par défaut : 1
    foundedTurn: 1
    , buildings: ['ferme', 'caserne'],        // ex: ['ferme', 'caserne']
    resources: { gold: 111, food: 50, wood: 50, iron: 10 },
    garnison: [{ id: 'unitEnnemi2', ...UNIT_TYPES.warrior, remainingMovement: 2, owner: civ }
    ]

  };

  targetTile.hasCity = true;
  targetTile.hasRoad = true;


  return city;
}




