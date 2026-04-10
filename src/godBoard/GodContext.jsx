import React, { createContext, useContext, useReducer, useState } from "react";
import { addPlantAround, computeNextDirection } from "./utils/shortUtils";
import { randomGenome, recombinaisonGenetique } from "../genetic/ADNPlante";
import { newCreature } from "./utils/GodCreatureManager";
import InfoDialog from "./components/InfoDialog";

const GRIDSIZE = { width: 50, height: 40 }
const buildRandomCreature = (type) => {
  const adn = randomGenome();
  const creat = newCreature(adn);
  // must add type, position
  creat.type = type;

  creat.needForSex = 0.9

  creat.position = {
    x: Math.floor(Math.random() * GRIDSIZE.width)//gridSize.width*tileSize
    , y: Math.floor(Math.random() * GRIDSIZE.height)//gridSize.height*tileSize
  }
  return creat;
}
// Créatures de départ pour test
const initialState = {
  tileSize: 32,
  tick: 0,
  godMode: null,
  populationHistory: [], planteHistory: [],
  gridSize: GRIDSIZE,
  plants: [], // positions de plantes
  corpses: [],
  effects: [],
  GOD_CONFIG: {
    plantGrowthRate: 0.21, // probabilité qu'une plante pousse à chaque tick
    maxPlants: 50,
    plantsByTick: 4
    , sexNeed: 0.01 // augmentation besoin sexuel
    , hungerDecay: 0.02 // augmentation hunger by tick
  },
  creatures: [
    buildRandomCreature('herbivore'),
    buildRandomCreature('herbivore'),
    buildRandomCreature('herbivore'),
    buildRandomCreature('herbivore'),
    buildRandomCreature('herbivore'),
  ],
};

// Le reducer = un switch sur les types d'actions
function godReducer(state, action) {
  switch (action.type) {
    case "TICK_CREATURES":
      const { newCreatures, remainingPlants, newCorpses } = tickCreatures(state);
  
      const newPopulation = newCreatures.length;
      const newPlantulation = remainingPlants.length;
      const newConfig = adaptConfig(state.GOD_CONFIG, newPopulation, newPlantulation);
      const newTick = state.tick + 1;
      return {
        ...state,
        tick: newTick,
        effects: state.effects.filter((e) => Date.now() - e.createdAt < e.duree),
        GOD_CONFIG: newConfig,
        creatures: newCreatures.filter(c => c.alive),
        corpses:newCorpses,
        plants: tickPlants(remainingPlants, state.gridSize, state.GOD_CONFIG, newCorpses),
        populationHistory: [
          ...state.populationHistory.slice(-100), // on garde les 100 derniers ticks max
          { tick: newTick, population: newPopulation, plantes: newPlantulation },
        ]
      };
    case "HOLY_ZONE":
      const radius = Math.floor(Math.random() * 6) + 5; // 5 à 10
      // and provide food
      const plants = addPlantAround(action.payload.x, action.payload.y, 3);
      return {
        ...state,
        godMode: null
        , plants: state.plants.concat(plants)
        , effects: [
          ...state.effects,
          {
            id: Date.now(),
            x: action.payload.x,
            y: action.payload.y,
            type: "holy",
            radius: radius,
            createdAt: Date.now(),
            duree: 15000
          }
        ],
      }
    case "FERTILE_ZONE":
      const { x, y } = action.payload;
      const radiusf = Math.floor(Math.random() * 4) + 3; // entre 3 et 6

      const newPlantes = addPlantAround(x, y, radiusf);


      return {
        ...state,
        godMode: null
        , plants: state.plants.concat(newPlantes)
        , effects: [
          ...state.effects,
          {
            id: Date.now(), // ou uuid si tu préfères
            x: action.payload.x,
            y: action.payload.y,
            radius: radiusf,
            type: "fertile", duree: 1000,
            createdAt: Date.now(),
          },
        ],
      }
    case "KILL_CREATURE_AT":
      return {
        ...state,
        godMode: null,
        creatures: state.creatures.filter(c => c.position.x !== action.payload.x && c.position.y !== action.payload.y)
        , effects: [
          ...state.effects,
          {
            id: Date.now(), // ou uuid si tu préfères
            x: action.payload.x,
            y: action.payload.y,
            type: "explosion", duree: 1000,
            createdAt: Date.now(),
          },
        ],
      };
    case "COLONNE_DIVINE": {
      const { x } = action.payload;
      const minX = x - 2;
      const maxX = x + 2;

      return {
        ...state,
        godMode: null,
        creatures: state.creatures.filter(c => c.position.x < minX || c.position.x > maxX),
        plants: state.plants.filter((p) => p.x < minX || p.x > maxX),
         corpses: state.corpses.filter((p) => p.x < minX || p.x > maxX),
        effects: [
          ...state.effects,
          {
            id: crypto.randomUUID(),
            x,
            type: "colonne_divine",
            createdAt: Date.now(),
          },
        ],
      };
    }

    case "ASTEROID": {
      const { x, y } = action.payload;
      const radius = Math.floor(Math.random() * 4) + 3; // 3 à 6

      const isInRadius = (e) =>
        Math.hypot(e.position?.x - x, e.position?.y - y) <= radius ||
        Math.hypot(e.x - x, e.y - y) <= radius;

      return {
        ...state,
        godMode: null,
        creatures: state.creatures.filter((c) => !isInRadius(c)),
        plants: state.plants.filter((p) => !isInRadius(p)),
        corpses: state.corpses.filter((p) => !isInRadius(p)),
        effects: [
          ...state.effects,
          {
            id: crypto.randomUUID(),
            x, y,
            type: "asteroide",
            radius, duree: 2000,
            createdAt: Date.now(),
          },
        ],
      };
    }

    case "ADD_CREATURE":
      return {
        ...state,
        creatures: [...state.creatures, buildRandomCreature(action.type || 'herbivore')]
      };
    case 'SET_GOD_MODE':
      return { ...state, godMode: action.payload };
    case "RESET":
      return {
        ...state,
        plants: [],corpses:[],
        godMode: null,
        creatures: [buildRandomCreature(action.type || 'herbivore')],
      };

    default:
      return state;
  }
}
const adaptConfig = (config, pop, plt) => {
  const ratio = Math.min(Math.max(pop / 100, 0), 1); // entre 0 et 1
  return {
    ...config,
    hungerDecay: 0.01 + 0.02 * ratio,   // de 0.01 à 0.03
    sexNeed: 0.03 - 0.025 * ratio,      // de 0.03 à 0.005
  };
}
export const GodContext = createContext();

export function GodProvider({ children }) {
  const [state, dispatch] = useReducer(godReducer, initialState);
  const [frameRate, setFrameRate] = useState(200);
  const [selectedCreature, setSelectedCreature] = useState(null);

  const handleGodClick = (e) => {
    const { godMode } = state;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / state.tileSize);
    const y = Math.floor((e.clientY - rect.top) / state.tileSize);
    if (godMode == null) {
      const creature = state.creatures.find(c => c.position.x === x && c.position.y === y);
      if (creature) {
        setSelectedCreature(creature);
      }
      return;
    }
    dispatch({ type: godMode, payload: { x, y } });

  };

  React.useEffect(() => {
    const intvl = setInterval(() => {
      dispatch({ type: "TICK_CREATURES" })
    }, frameRate);
    return () => {
      clearInterval(intvl);
    };
  }, [frameRate]);

  return (
    <GodContext.Provider value={{ state, dispatch, handleGodClick }}>
      {children}
      <InfoDialog selectedCreature={selectedCreature}
        onClose={() => setSelectedCreature(null)} />
    </GodContext.Provider>
  );
}

export function useGod() {
  return useContext(GodContext);
}



function tickCreatures({ creatures, plants, corpses, gridSize, GOD_CONFIG, effects }) {
  const newCreatures = [];
  const remainingPlants = [...plants];
  const newCorpses = [...corpses];
  for (let creature of creatures) {
    let updated = { ...creature };

    // Incrémentation naturelle des besoins
    updated.hunger = Math.min(1, updated.hunger + GOD_CONFIG.hungerDecay);
    updated.needForSex = Math.min(1, updated.needForSex + GOD_CONFIG.sexNeed);
    if (updated.hunger >= 1) {
      updated.alive = false;
      newCorpses.push({
        id: `${creature.id}-${Date.now()}`,
        x: creature.position.x,
        y: creature.position.y,
        createdAt: Date.now(),
        rotProgress: 0, // utile pour une disparition future
      });
    }

    // Si pas de direction, on en déduit une
    if (updated.direction === null) {
      const dir = computeNextDirection(updated, creatures, plants, newCorpses, effects, gridSize);
      if (dir) {
        updated.direction = dir;
        updated.progress = 0;
        newCreatures.push(updated);
        continue;
      }
    }

    // Mouvement
    const newProgress = updated.progress + updated.speed;
    if (newProgress >= 1) {
      const destX = updated.position.x + (updated.direction?.dx || 0);
      const destY = updated.position.y + (updated.direction?.dy || 0);

      if (
        destX >= 0 && destX < gridSize.width &&
        destY >= 0 && destY < gridSize.height
      ) {

        // 👀 Vérifier si une plante est sur cette case
        const plantIndex = remainingPlants.findIndex(
          p => p.x === destX && p.y === destY
        );
        const partnerIndex = creatures.findIndex(
          p => p.position.x === updated.position.x && p.position.y === updated.position.y
            && p.id !== updated.id && p.needForSex > 0.5 && updated.needForSex > 0.5
        );
        if (partnerIndex > -1) {
          // copulation
          const partner = creatures[partnerIndex];
          const babies = recombinaisonGenetique(updated.adn, partner.adn);
          const baby = newCreature(babies[0]);
          baby.type = updated.type;
          baby.position = { x: destX, y: destY }
          newCreatures.push(baby);
          updated.needForSex = Math.max(0, updated.needForSex - updated.adnHandler.readFloat('cigaretteApresLamour'))
          partner.needForSex = Math.max(0, partner.needForSex - partner.adnHandler.readFloat('cigaretteApresLamour'))
        }
        if (plantIndex !== -1) {
          // 🌿 Manger la plante
          remainingPlants.splice(plantIndex, 1);
          updated.hunger = updated.hunger/2;
        }
        if(creature.isCharognard){
          const corpseIndex = newCorpses.findIndex(
            c => c.x === updated.position.x && c.y === updated.position.y
          );
          if (corpseIndex !== -1) {
            updated.hunger = 0;
            newCorpses.splice(corpseIndex, 1); // le cadavre est mangé
          }
        }

        updated.position = { x: destX, y: destY };
        updated.progress = 0;
        updated.direction = null;
      } else {
        // Rebond hors de la grille
        updated.progress = 0;
        updated.direction = null;
      }
    } else {
      updated.progress = newProgress;
    }

    newCreatures.push(updated);
  }

  return { newCreatures, remainingPlants, newCorpses: newCorpses };
}


function tickPlants(plants, gridSize, config, corpses) {
  const newPlants = [...plants];

  if (plants.length >= config.maxPlants) return plants;
  for (let i = 0; i < config.plantsByTick; i++) {

    const chance = Math.random();
    if (chance < config.plantGrowthRate) {
      // Essayer de faire pousser une plante à un endroit vide
        const x = Math.floor(Math.random() * gridSize.width);
        const y = Math.floor(Math.random() * gridSize.height);
        const alreadyExists = plants.some(p => p.x === x && p.y === y);
        const hasCorpse = corpses.some(c =>
          Math.abs(c.x - x) <= 2 && Math.abs(c.y - y) <= 2
        );
        
        if (!alreadyExists && !hasCorpse) {
          newPlants.push({ x, y });
          break;
        }
      }
    
  }

  return newPlants;
}



