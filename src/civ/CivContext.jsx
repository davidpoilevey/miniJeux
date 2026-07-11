import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { TILE_SIZE } from './CivMap';
import { generateMapWithTerrain } from "./utils/mapGenerator";
import { BUILDING_TYPES, MERVEILLES_DU_MONDE } from "./data/buildingTypes";
import {  UNIT_TYPES } from "./data/unitTypes";
import { TECHNOLOGIES } from "./data/techTree";
import { computeCityResources } from "./data/cityTypes";
import useShowAlert from '../jds/components/Message';
import { getDistanceHex, getHexNeighbors, getMovementResult, hexToPixel } from "./utils/hexUtils";
import { BARBARE_CIV, CIVILIZATIONS, getCivilization } from "./data/civilzationTypes";
import { loadGame, saveGame } from "./utils/saveGame";
import { applyFogOfWar, assignCityTiles, bonusDeBonheur, chooseCityProduction, computeCivStats, findCitySpot, findClosestEnemy, findClosestForeignCity, generateCityName, getTileCost, getUnitTile, isMilitaryUnit, isSameTile, isTileNearMapEdge, isValidCitySpot, isWonderBuilt, moveUnitToward, newUid } from "./utils/utils";
import { getSurroundingTiles } from "./utils/hexUtils";
import { pickRandomEvent } from "./data/randomEvents";





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

export const MAP_SIZES = {
  petite: { label: 'Petite', width: 2400, height: 1200 },
  moyenne: { label: 'Moyenne', width: 4000, height: 2000 },
  grande: { label: 'Grande', width: 5600, height: 2800 },
};

const resolveGameConfig = (cfg = {}) => {
  const size = MAP_SIZES[cfg.mapSize] || MAP_SIZES.moyenne;
  return {
    mapSize: MAP_SIZES[cfg.mapSize] ? cfg.mapSize : 'moyenne',
    width: size.width,
    height: size.height,
    opponents: Math.min(CIVILIZATIONS.length - 1, Math.max(1, cfg.opponents ?? CIVILIZATIONS.length - 1)),
  };
};

export const CivContextProvider = ({ setSelected, selectedNation, gameConfig, children }) => {
  const [tiles, setTiles] = useState([]);
  const [cities, setCities] = useState([]);
  const [mapConfig, setMapConfig] = useState(() => resolveGameConfig(gameConfig));
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
  const [gameResult, setGameResult] = useState(null); // {type:'victory'|'defeat', turn, score, classement}

  const { showAlert, SnackbarComponent } = useShowAlert({ verticalAnchor: 'bottom' });



  const getCityByTile = React.useCallback((tile) => {
    return cities.find(
      city => city.position.q === tile.q && city.position.r === tile.r
    );
  }, [cities]);

  useEffect(() => {
    if (selectedNation && tiles.length==0) {
      const config = resolveGameConfig(gameConfig);
      setMapConfig(config);
      setPlayerNation(selectedNation);
      // les technologies de départ de la nation (elles n'étaient jamais appliquées !)
      setTechsUnlocked([...(selectedNation.startingTechs || [])]);
      initializeDiplomacy(selectedNation);
      let generated = generateMapWithTerrain(
        config.width, config.height, TILE_SIZE,
        selectedNation // le owner des premières unités
      );

      // le joueur + N adversaires tirés au hasard
      const opponents = CIVILIZATIONS
        .filter(c => c.id !== selectedNation.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, config.opponents);
      const inGame = [selectedNation, ...opponents];
      setCivInGame(inGame);

      inGame.forEach((civ,cidx)=>{
        let placed = false;
        let attempts = 0;
        while (!placed && attempts++ < 200) {
          placed = placeUnit(generated, {...UNIT_TYPES['pionnier'], id:'Schwarzy-'+cidx}, civ);
        }
      })


      generated = applyFogOfWar(generated, selectedNation.id, getCityByTile)
      setTiles(generated);
    }
  }, [selectedNation]);
  


  // **************Diplomatic et Civilization functions **************************
  // Les relations sont indexées par id : on accepte indifféremment un id ou un objet civ,
  // sinon la clé devient "[object Object]" et toutes les paires partagent la même relation
  const civId = (civ) => civ?.id ?? civ;
  const relationKey = (civA, civB) => [civId(civA), civId(civB)].sort().join('-');

  const knownCivs = CIVILIZATIONS.map(c => c.id);
  const initializeDiplomacy = (playerCiv) => {
    const playerId = civId(playerCiv);
    const initialRelations = {};
    for (const civ of knownCivs) {
      if (civ !== playerId) {
        initialRelations[relationKey(playerId, civ)] = 'neutral';
      }
    }
    setDiplomaticRelations(initialRelations);
  };


  const getDiplomaticRelation = (civA, civB) => {
    const a = civId(civA), b = civId(civB);
    if (a === b) return 'self';
    // on ne négocie pas avec les barbares
    if (a === BARBARE_CIV.id || b === BARBARE_CIV.id) return 'war';
    return diplomaticRelations[relationKey(a, b)] || 'neutral';
  };

  const setDiplomaticRelation = (civA, civB, status) => {
    const key = relationKey(civA, civB);
    setDiplomaticRelations(prev => ({
      ...prev,
      [key]: status,
    }));
  };
  const RELATION_LEVELS = ['war', 'tendu', 'neutral', 'peace', 'allied'];

  const shiftDiplomaticRelation = (playerNation, targetCiv, up) => {
    setDiplomaticRelations(prev => {
      const key = relationKey(playerNation, targetCiv);
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

    // une civ est vivante si elle a une unité sur la carte, une ville, ou une unité en garnison
    const activeCivIds = new Set([
      ...tiles.map(t => t.unit?.owner?.id),
      ...cities.map(c => c.owner?.id),
      ...cities.flatMap(c => (c.garnison || []).map(u => u.owner?.id)),
    ].filter(Boolean));

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

    // 🏁 Fin de partie ? (les barbares ne comptent pas dans les survivants)
    if (!gameResult) {
      const playerAlive = activeCivIds.has(playerNation.id);
      const rivalsAlive = CIVILIZATIONS_inGame.some(civ =>
        civ.id !== playerNation.id && activeCivIds.has(civ.id));

      if (!playerAlive || !rivalsAlive) {
        const classement = CIVILIZATIONS_inGame.map(civ =>
          computeCivStats(civ, cities, tiles,
            civ.id === playerNation.id ? techsUnlocked : (civ.technologies || civ.startingTechs || []),
            builtWonders, turn)
        ).sort((a, b) => b.score - a.score);

        setGameResult({
          type: playerAlive ? 'victory' : 'defeat',
          turn,
          score: classement.find(c => c.civ.id === playerNation.id)?.score || 0,
          classement,
        });
        addEvent(playerAlive
          ? "🏆 Votre civilisation règne désormais sans partage !"
          : "💀 Votre civilisation a été rayée de l'histoire...", playerAlive ? 'success' : 'error', true);
        setRunning(false);
        return; // la partie est finie, inutile de jouer le tour
      }
    }


    // seules les civs adverses sont pilotées par l'IA — pas celle du joueur !
    CIVILIZATIONS_inGame.filter(civ => civ.id !== playerNation.id).forEach(civ => {
     const newCities = playAITurn(civ);
     if(newCities.length>0)
      newCivCities = newCivCities.concat(newCities);
     })

    // 🏴‍☠️ les hordes existantes attaquent, puis de nouvelles surgissent parfois du brouillard
    playAITurn(BARBARE_CIV);
    if (Math.random() < Math.min(0.25, 0.05 + turn * 0.002)) {
      spawnBarbares(1);
    }
     
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


    // application des merveilles (chacune ne profite qu'aux villes de son propriétaire)
    builtWonders.forEach(w => {
      const merveille = MERVEILLES_DU_MONDE[w?.id ?? w];
      if (!merveille) return;
      const ownerCities = w?.ownerId ? cities.filter(c => c.owner.id === w.ownerId) : cities;
      merveille.effectParTurn?.(ownerCities);
    });
    // regulation des marché
    const [newTaux, newHistorique] = updateMarketRates(taux, historique);
    setTaux(newTaux);
    setHistorique(newHistorique);

    let sommeScience = 0;
    // unités du joueur terminées ce tour : elles sortent sur la carte, prêtes à agir
    const unitsToDeploy = [];

    // 🏙️ Traitement des villes
    const updatedCities = cities.map(city => {
      const updated = { ...city, resources: { ...city.resources } };
      const civ = updated.owner;
      const buildingBonus = civ?.buildingBonus || 0;

      // 0️⃣ Complète les tuiles exploitées si la ville a des citoyens libres
      if ((updated.assignedTiles?.length || 0) < updated.population) {
        assignCityTiles(updated, tiles);
      }

      // 1️⃣ Récolte de ressources (tuiles + bâtiments — computeCityResources fait déjà les deux,
      // l'ancienne boucle ici comptait la production des bâtiments en double)
      const baseGain = computeCityResources(updated, tiles); // Ex: { food: 2, gold: 1 }

      // 2.5. Croissance démographique
      const currentPop = updated.population || 1;
      const maxPop = 10;
      const foodAvailable = updated.resources.food || 0;

      // le bonus de croissance de la civ réduit la nourriture nécessaire
      const growthBonus = civ?.populationGrowthBonus || 0;
      const foodNeededForNextPop = pop => Math.round((30 + 10 * Math.pow(pop, 1.5)) * (1 - Math.min(0.5, growthBonus)));

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
        const isWonder = MERVEILLES_DU_MONDE[updated.currentProduction];
        const turns = isBuilding?.turns || isUnit?.turns || isWonder?.turns || 1;

        if (updated.productionProgress >= turns) {
          if (isBuilding) {
            updated.buildings = [...updated.buildings, updated.currentProduction];
if(updated.owner.id===playerNation.id)
            addEvent("Production achevée : " + updated.currentProduction + " dans la ville de " + updated.name);
          } else if (isWonder) {
            if (isWonderBuilt(builtWonders, isWonder.id)) {
              // une autre civ l'a finie avant nous, tant pis pour les ressources investies
              if(updated.owner.id===playerNation.id)
                addEvent(`${isWonder.name} a déjà été inaugurée ailleurs, vos ouvriers rentrent bredouilles`, 'warning', true);
            } else {
              isWonder.effectInauguration?.(civ);
              setBuiltWonders(prev => [...prev, { id: isWonder.id, ownerId: updated.owner.id }]);
              addEvent(`🏛️ ${updated.owner.name} : la merveille ${isWonder.name} est inaugurée à ${updated.name} !`, 'success', true);
            }
          } else if (isUnit) {
            const newUnit = {
              ...isUnit,
              id: newUid(updated.currentProduction),
              owner: updated.owner,
              remainingMovement: isUnit.movement
            };
            if (updated.owner.id === playerNation.id) {
              // 🐣 le joueur reçoit ses unités actives devant la ville — plus de
              // recrues oubliées en garnison faute d'avoir vu passer la snackbar
              unitsToDeploy.push({ city: updated, unit: newUnit });
              addEvent(`${isUnit.name} est achevé et attend vos ordres devant ${updated.name}`, 'success', true);
            } else {
              updated.garnison = [...(updated.garnison || []), newUnit];
            }
          }

          updated.productionQueue = updated.productionQueue.slice(1);
          updated.currentProduction = updated.productionQueue[0] || null;
          updated.productionProgress = 0;
        }
      } else if (updated.productionQueue.length > 0) {
        updated.currentProduction = updated.productionQueue[0];
        updated.productionProgress = 0;
      }
      // recupere la science (seules NOS villes financent NOS chercheurs)
      if (updated.owner.id === playerNation.id) {
        sommeScience += updated.resources.science || 0;
        sommeScience += bonusDeBonheur(updated.resources.happiness,20)
      }
      updated.resources.science = 0;
      return updated;
    })

    // 🐣 Sortie des unités fraîchement produites sur une case libre autour de leur ville.
    // Mutation directe des tuiles, committée par les setTiles déjà programmés du tour.
    unitsToDeploy.forEach(({ city, unit }) => {
      const free = getHexNeighbors(city.position, tiles).filter(t =>
        !t.unit && !t.hasCity
        && ((unit.canCrossWater && t.type === 'water') || (!unit.canCrossWater && t.type !== 'water')));
      if (free.length > 0) {
        free[Math.floor(Math.random() * free.length)].unit = unit;
      } else {
        // aucune case libre : repli en garnison
        city.garnison = [...(city.garnison || []), unit];
        addEvent(`${unit.name} attend en garnison à ${city.name} (aucune case libre autour)`, 'warning', true);
      }
    });

    // 🎲 Parfois, le destin s'invite dans une ville du joueur
    if (Math.random() < 0.12) {
      const playerCities = updatedCities.filter(c => c.owner.id === playerNation.id);
      if (playerCities.length > 0) {
        const targetCity = playerCities[Math.floor(Math.random() * playerCities.length)];
        const event = pickRandomEvent(targetCity);
        if (event) {
          const message = event.apply(targetCity, { spawnBarbares });
          addEvent(message, event.bad ? 'warning' : 'success', true);
        }
      }
    }

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
      id: newUid('evt'),
      text,
      type,           // 'info', 'warning', 'success', 'error'
      timestamp: turn,
      persistent
    };

    // tout va au journal du tableau de bord ; la snackbar n'interrompt
    // que pour l'important (fini l'empilement de toasts en fin de tour)
    setEventLog(prev => [...prev.slice(-49), evt]); // max 50
    if (type === 'warning' || type === 'error')
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
      if (city && city.owner.id === movingUnit.owner.id) {
        // 🏛️ Ajout à la garnison
        setCities(prev =>
          prev.map(c =>
            c.id === city.id
              ? {
                ...c,
                garnison: [...(c.garnison || []), { ...movingUnit, id: newUid(movingUnit.type) }],
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
    setTiles(prev =>
      prev.map(tile => {
        // le check se fait sur l'unité, sinon on peut refortifier à l'infini (+5 def à chaque fois)
        if (tile.q === pos.q && tile.r === pos.r && tile.unit && !tile.unit.fortified) {
          return { ...tile, unit: { ...tile.unit, fortified: true, defense: tile.unit.defense + 5, remainingMovement: 0 } };
        }
        return tile;
      })
    );
    setSelectedUnitPos(null);
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

    // ⚔️ portée et mouvement : pas d'attaque à l'autre bout de la carte
    const distance = getDistanceHex(attackerTile, defenderTile);
    if (distance > (attackerUnit.range || 1)) {
      if (attackerUnit.owner.id === playerNation.id)
        addEvent(`${UNIT_TYPES[attackerUnit.type].name} est trop loin pour attaquer (portée ${attackerUnit.range || 1})`, 'warning');
      return setSelectedUnitPos(null);
    }
    if (attackerUnit.remainingMovement <= 0) {
      if (attackerUnit.owner.id === playerNation.id)
        addEvent("Cette unité a déjà agi ce tour-ci", 'warning');
      return setSelectedUnitPos(null);
    }

    const { attacker, defender } = resolveCombat(attackerUnit, defenderUnit);
    attacker.remainingMovement = 0; // attaquer termine le tour de l'unité
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

    // 2. Riposte différée si le défenseur survit et peut atteindre l'attaquant
    const shouldRetaliate = defender.hp > 0 && attacker.hp > 0 && (defender.range || 1) >= distance;

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

    // ⚔️ même règle que contre les unités : portée + mouvement
    const distance = getDistanceHex(attackerTile, defenderTile);
    if (distance > (attackerUnit.range || 1) || attackerUnit.remainingMovement <= 0) {
      addEvent(distance > (attackerUnit.range || 1)
        ? `Trop loin pour attaquer ${city.name} (portée ${attackerUnit.range || 1})`
        : "Cette unité a déjà agi ce tour-ci", 'warning');
      return setSelectedUnitPos(null);
    }

    const attackerCoords = { q: attackerTile.q, r: attackerTile.r };
    const defenderCoords = { q: city.position.q, r: city.position.r };
    const { x: dx, y: dy } = hexToPixel(defenderTile);
    setFxTrigger({ x: dx, y: dy, type: 'explosion', timestamp: Date.now() });

    if (city.garnison && city.garnison.length > 0) {
      const defenderUnit = city.garnison[0];
      const { attacker, defender: newDef } = resolveCombat(attackerUnit, defenderUnit, city.buildings.includes('cityWalls'));
      attacker.remainingMovement = 0; // attaquer termine le tour de l'unité

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
      const shouldRetaliate = newDef.hp > 0 && attacker.hp > 0 && (newDef.range || 1) >= distance;
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
            garnison: [{ ...attackerUnit, id: newUid(attackerUnit.type) }],
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
    if (owner == null)
      owner = playerNation;
    if (!cityName||cityName == '')
      cityName = generateCityName(owner, pos.type);
    const newCity = {
      id: newUid('city'),
      name: cityName,
      position: { q: pos.q, r: pos.r },
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

    // la ville exploite tout de suite ses meilleures tuiles voisines
    assignCityTiles(newCity, tiles);

    addEvent("La ville de " + cityName + " vient d'etre creee",
      owner.id === playerNation.id ? 'success' : 'info', owner.id === playerNation.id);

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

  // 🏴‍☠️ Fait surgir des barbares du brouillard, loin des villes.
  // Mutation directe des tuiles (comme le tour IA), committée par les setTiles de fin de tour.
  const MAX_BARBARES = 6;
  const spawnBarbares = (count = 1) => {
    const existing = tiles.filter(t => t.unit?.owner?.id === BARBARE_CIV.id).length;
    const budget = Math.min(count, MAX_BARBARES - existing);
    if (budget <= 0) return;

    // les hordes s'arment avec les époques
    const unitType = turn > 80 ? 'mousquetaire' : turn > 40 ? 'legion' : 'warrior';
    const candidates = tiles.filter(t =>
      t.type !== 'water' && !t.unit && !t.hasCity && !t.explored
      && cities.every(c => getDistanceHex(t, c.position) > 3));
    if (candidates.length === 0) return;

    let nearPlayer = false;
    for (let i = 0; i < budget; i++) {
      const tile = candidates[Math.floor(Math.random() * candidates.length)];
      if (tile.unit) continue; // déjà pris par un spawn de cette même passe
      tile.unit = {
        ...UNIT_TYPES[unitType],
        id: newUid('barbare'),
        owner: BARBARE_CIV,
        remainingMovement: UNIT_TYPES[unitType].movement,
      };
      if (cities.some(c => c.owner.id === playerNation.id && getDistanceHex(tile, c.position) <= 8))
        nearPlayer = true;
    }
    if (nearPlayer)
      addEvent("🏴‍☠️ Des barbares rôdent près de vos terres...", 'warning', true);
  };

  const playAITurn = (civilization) => {
    // must return [] city created
    const allUnits = tiles.filter(t => t.unit != null).map(t => t.unit);
    const civCities = cities.filter(city => city.owner.id === civilization.id);
    const civUnits = allUnits.filter(unit => unit.owner.id === civilization.id);

    // 1. Choix de la production (unités ou bâtiments)
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
        // les unités déployées ce tour n'agissent qu'au tour suivant : elles ne sont
        // pas encore sur `tiles` (setTiles en attente) et les faire agir les dupliquerait
      })
    }

    // 2. Recherche scientifique : l'IA débloque petit à petit des technologies,
    // ce qui élargit ce que ses villes savent construire
    if (civCities.length > 0 && Math.random() < 0.15) {
      const known = civilization.technologies || (civilization.technologies = [...(civilization.startingTechs || [])]);
      const candidates = Object.values(TECHNOLOGIES).filter(t =>
        !known.includes(t.id) && (t.requires || []).every(r => known.includes(r)));
      if (candidates.length > 0) {
        const cheapest = candidates.sort((a, b) => a.cost - b.cost)[0];
        known.push(cheapest.id);
      }
    }

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

  // 🎭 Audiences : un émissaire ennemi arrivé chez le joueur formule une demande,
  // le joueur accepte ou refuse (et en assume les conséquences)
  const [pendingAudience, setPendingAudience] = useState(null);

  const buildAudienceDemand = (fromNation, relation) => {
    const profile = fromNation.diplomacyProfile || {};
    if (relation === 'war' || relation === 'tendu') {
      return (profile.aggressif || 0) > 0.5
        ? { type: 'tribute', text: 'exigent un tribut de 100 or pour épargner vos villes' }
        : { type: 'peace', text: 'proposent de signer la paix' };
    }
    if (relation === 'neutral') {
      return (profile.opportuniste || 0) > 0.4
        ? { type: 'trade', text: 'proposent un échange commercial : 10 laine contre 50 or' }
        : { type: 'peace', text: 'proposent un pacte de paix' };
    }
    return { type: 'alliance', text: 'proposent une alliance militaire' };
  };

  // applique un delta de ressources sur la ville la plus riche du joueur
  const adjustPlayerResources = (delta) => {
    setCities(prev => {
      const richest = prev.filter(c => c.owner.id === playerNation.id)
        .sort((a, b) => (b.resources.gold || 0) - (a.resources.gold || 0))[0];
      if (!richest) return prev;
      const resources = { ...richest.resources };
      for (const [res, amount] of Object.entries(delta))
        resources[res] = (resources[res] || 0) + amount;
      return prev.map(c => c.id === richest.id ? { ...c, resources } : c);
    });
  };

  const resolveAudience = (accepted) => {
    if (!pendingAudience) return;
    const { fromNation, demand } = pendingAudience;
    const profile = fromNation.diplomacyProfile || {};

    if (accepted) {
      switch (demand.type) {
        case 'tribute':
          adjustPlayerResources({ gold: -100 });
          shiftDiplomaticRelation(playerNation, fromNation, true);
          addEvent(`Vous avez payé un tribut de 100 or aux ${fromNation.name}.`, 'warning', true);
          break;
        case 'peace':
          setDiplomaticRelation(playerNation, fromNation, 'peace');
          addEvent(`La paix est signée avec les ${fromNation.name}.`, 'success', true);
          break;
        case 'trade':
          adjustPlayerResources({ laine: -10, gold: 50 });
          shiftDiplomaticRelation(playerNation, fromNation, true);
          addEvent(`Accord commercial conclu avec les ${fromNation.name} (+50 or).`, 'success', true);
          break;
        case 'alliance':
          setDiplomaticRelation(playerNation, fromNation, 'allied');
          addEvent(`Alliance militaire conclue avec les ${fromNation.name} !`, 'success', true);
          break;
        default:
      }
    } else {
      shiftDiplomaticRelation(playerNation, fromNation, false);
      if (demand.type === 'tribute' && (profile.aggressif || 0) > 0.6) {
        setDiplomaticRelation(playerNation, fromNation, 'war');
        addEvent(`Les ${fromNation.name} déclarent la guerre suite à votre refus !`, 'error', true);
      } else {
        addEvent(`L'émissaire des ${fromNation.name} repart déçu de votre cour.`, 'info', true);
      }
    }
    setPendingAudience(null);
  };

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

    // 🎭 Un émissaire arrive chez le JOUEUR : audience à sa cour, c'est à lui de décider
    if (toNation.id === playerNation.id) {
      setPendingAudience({ fromNation, demand: buildAudienceDemand(fromNation, relation) });
      removeDiplomate();
      return;
    }


    if (relation === 'war') {
      if (profile.aggressif < 0.4 && Math.random() > profile.aggressif) {
        // Demande de paix acceptée
        setDiplomaticRelation(fromNation, toNation, 'peace');
        addEvent(`${toNation.name} a accepté la paix avec ${fromNation.name}.`, 'info', true);
      } else if (Math.random() > (profile.aggressif || 0.5) + 0.3) {
        // Tribute accepté
        updateCities(c => {
          if (c.owner.id === fromNation.id) {
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
          if (c.owner.id === fromNation.id) {
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
          if (c.owner.id === fromNation.id) {
            return {
              ...c,
              resources: {
                ...c.resources,
                gold: (c.resources.gold || 0) + 50,
                laine: (c.resources.laine || 0) - 10,
              },
            };
          } else if (c.owner.id === toNation.id) {
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
          if (c.owner.id === fromNation.id) {
            return {
              ...c,
              resources: {
                ...c.resources,
                gold: (c.resources.gold || 0) + 50,
                laine: (c.resources.laine || 0) - 10,
              },
            };
          } else if (c.owner.id === toNation.id) {
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

  // Attaque d'une ville défendue par l'IA : résout le combat contre le premier garde.
  // Mutations directes (garnison, tuile de l'attaquant) : elles sont committées par les
  // setTiles/setCities de fin de tour, comme le reste du tour IA.
  const aiAttaqueCity = (attackerTile, city) => {
    const attackerUnit = attackerTile.unit;
    const garde = (city.garnison || [])[0];
    if (!attackerUnit || !garde) return;

    const { attacker, defender: newDef } = resolveCombat(attackerUnit, garde, city.buildings.includes('cityWalls'));
    attacker.remainingMovement = 0;

    city.garnison = newDef.hp <= 0 ? city.garnison.slice(1) : [newDef, ...city.garnison.slice(1)];
    attackerTile.unit = attacker.hp <= 0 ? null : attacker;

    const { x, y } = hexToPixel(city.position);
    setFxTrigger({ x, y, type: 'explosion', timestamp: Date.now() });
    if (city.owner.id === playerNation.id)
      addEvent(`${city.name} est attaquée par les ${getCivilization(attackerUnit.owner)?.name || 'ennemis'} !`, 'error', true);
  };
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
         // après déplacement, l'unité vit sur sa NOUVELLE tuile (l'ancienne est vide)
         const atkTile = movedResult.moved ? movedResult.lastReachedPosition : unitTile;
         const atkUnit = atkTile.unit;
         if (atkUnit && atkUnit.remainingMovement > 0
             && getDistanceHex(atkTile, enemy.position) <= (atkUnit.range || 1)) {
                  // 👊 À portée → on attaque
                  if(enemy.type==='city')
                    {
                      const garnisonVivante = (enemy.city.garnison || []).filter(g => g.hp > 0);
                      if(garnisonVivante.length === 0){
                        const ancienOwner = enemy.city.owner;
                        if (civilization.id === BARBARE_CIV.id) {
                          // 🏴‍☠️ les barbares ne gouvernent pas : ils pillent et repartent avec le butin
                          enemy.city.population = Math.max(1, enemy.city.population - 1);
                          enemy.city.resources = Object.fromEntries(
                            Object.entries(enemy.city.resources || {}).map(([res, val]) => [res, Math.ceil((val || 0) / 2)]));
                          atkTile.unit = null; // la horde disparaît avec son butin
                          addEvent(`${enemy.city.name} a été pillée par les barbares !`,
                            ancienOwner.id === playerNation.id ? 'error' : 'warning', true);
                        } else {
                          // prend la ville
                          enemy.city.owner=civilization;
                          enemy.city.garnison=[{ ...atkUnit, remainingMovement: 0 }];
                          atkTile.unit=null;
                          addEvent(`${enemy.city.name} a été capturée par ${civilization.name} !`,
                            ancienOwner.id === playerNation.id ? 'error' : 'warning', true);
                        }
                      }
                      else{
                        // attaque le premier garde
                        aiAttaqueCity(atkTile, enemy.city);
                      }
                  }
                  else
                    attaque(enemy.position, atkTile);
        }
      } else {
        moveUnitToward(unit, null, tiles);
      }
    }

    else if (unit.type === 'diplomate') {
      const targetCity = findClosestForeignCity(unit, cities,getDiplomaticRelation, tiles);
      if (targetCity) {
        // la destination est la POSITION de la ville (la ville elle-même n'a pas de q/r :
        // l'A* cherchait un objectif introuvable et explorait toute la carte pour rien)
        if (getDistanceHex(unitTile, targetCity.position) <= 1) {
          launchDiplomaticInteraction(unit, targetCity);
        } else {
          const movedResult = moveUnitToward(unit, targetCity.position, tiles,{stopBeforeTarget:true});
          if (movedResult.moved && getDistanceHex(movedResult.lastReachedPosition, targetCity.position) <= 1)
            launchDiplomaticInteraction(movedResult.lastReachedPosition.unit, targetCity);
        }
      }
    }
    return createdCity;
  }

  // 🕊️ Soin : le moine (ou templier) soigne les unités alliées adjacentes, et lui-même
  const healAround = (pos) => {
    const healer = pos.unit;
    if (!healer) return;
    const HEAL_AMOUNT = 5;
    const zone = getSurroundingTiles(pos, tiles, 1);
    let healedCount = 0;

    setTiles(prev =>
      prev.map(t => {
        const inZone = zone.some(z => z.q === t.q && z.r === t.r);
        if (!inZone || !t.unit || t.unit.owner.id !== healer.owner.id) return t;
        if (t.unit.hp >= t.unit.hpMax && t.unit.id !== healer.id) return t;
        healedCount++;
        return {
          ...t,
          unit: {
            ...t.unit,
            hp: Math.min(t.unit.hpMax, t.unit.hp + HEAL_AMOUNT),
            // soigner occupe le tour du soigneur
            remainingMovement: t.unit.id === healer.id ? 0 : t.unit.remainingMovement,
          }
        };
      })
    );
    setSelectedUnitPos(null);
    addEvent(healedCount > 1
      ? `${UNIT_TYPES[healer.type].name} a soigné les troupes alentour (+${HEAL_AMOUNT} PV)`
      : "Personne à soigner ici, le moine médite", healedCount > 1 ? 'success' : 'info');
  };

  // ☢️ La bombe explose sur place : tout ce qui vit dans un rayon de 2 disparaît
  const detonateNuke = (pos) => {
    const bomb = pos.unit;
    if (!bomb) return;
    const NUKE_RADIUS = 2;
    const zone = getSurroundingTiles(pos, tiles, NUKE_RADIUS);
    const zoneKeys = new Set(zone.map(z => `${z.q},${z.r}`));

    const { x, y } = hexToPixel(pos);
    setFxTrigger({ x, y, type: 'explosion', timestamp: Date.now() });

    // unités et améliorations vaporisées (la bombe aussi)
    setTiles(prev =>
      prev.map(t => {
        if (!zoneKeys.has(`${t.q},${t.r}`)) return t;
        return { ...t, unit: null, feature: null, hasRoad: false, yield: undefined };
      })
    );

    // villes touchées : la moitié de la population et de la garnison partent en fumée
    setCities(prev =>
      prev.reduce((acc, c) => {
        if (!zoneKeys.has(`${c.position.q},${c.position.r}`)) {
          acc.push(c);
          return acc;
        }
        const newPop = Math.floor(c.population / 2);
        if (newPop <= 0) {
          setTiles(prevTiles =>
            prevTiles.map(t =>
              t.q === c.position.q && t.r === c.position.r ? { ...t, hasCity: false } : t
            )
          );
          addEvent(`${c.name} a été rayée de la carte par le feu nucléaire !`, 'error', true);
          return acc;
        }
        acc.push({
          ...c,
          population: newPop,
          garnison: (c.garnison || []).slice(0, Math.floor((c.garnison || []).length / 2)),
        });
        addEvent(`${c.name} est dévastée par l'explosion nucléaire`, 'error', true);
        return acc;
      }, [])
    );

    setSelectedUnitPos(null);
    addEvent("☢️ Détonation nucléaire ! Le monde entier vous regarde avec effroi.", 'error', true);
    // le monde entier vous en veut
    CIVILIZATIONS_inGame.forEach(civ => {
      if (civ.id !== bomb.owner.id) setDiplomaticRelation(bomb.owner, civ, 'war');
    });
  };

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
    civsInGame: CIVILIZATIONS_inGame,
    gameConfig: mapConfig,
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
    setCivInGame(state.civsInGame || [...CIVILIZATIONS]);
    setMapConfig(resolveGameConfig(state.gameConfig));
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
    mapConfig,
    selectedUnitPos,
    saveCiv, loadCiv,
    setSelectedUnitPos,
    moveUnit, fortifyUnit, removeUnit, deployUnit, healAround, detonateNuke,
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
    gameResult, pendingAudience, resolveAudience,
    civsInGame: CIVILIZATIONS_inGame,
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
  // nouvelle référence, sinon React ne voit pas le changement et les graphiques figent
  return [newRates, { ...historique }];
}

function resolveCombat(attacker, defender, cityWalls) {
  //check militaryBonus
  const atkCiv = getCivilization(attacker.owner);
  const defCiv = getCivilization(defender.owner);

  // parenthèses obligatoires : sans elles, un militaryBonus undefined donne NaN et l'attaque tombe à 0
  const atk = attacker.attack + (attacker.veterancy ? 2 : 0) + (atkCiv?.militaryBonus || 0);
  const def = defender.defense + (defender.veterancy ? 1 : 0) + (defCiv?.militaryBonus || 0);
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
    !t.unit && // ne pas écraser le pionnier d'une autre civ déjà placé
    !t.hasCity &&
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




