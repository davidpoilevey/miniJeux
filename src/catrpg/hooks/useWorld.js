// hooks/useWorld.js
import { useCallback, useEffect, useMemo, useState } from 'react';
import { mapsByName, TILE_SIZE } from '../data/maps';
import { tileBehaviors } from '../data/tileTypes';
import useInventory from './useInventory';
import useDialogueEngine from './useDialogueEngine';
import useSmoothMovement from './useSmoothMovement';
import useQuests from './useQuests';
import { soundManager } from '../../rpg/sons/SoundManager';
import { rocsTypes } from './useCATImage';

export const useWorld = (config) => {
// config can be {showQuestBanner}
const showQuestBanner = useMemo(()=>{
  return config?.showQuestBanner?config?.showQuestBanner:(msg)=>{alert(" showQuestBanne a pas pu ecrire "+msg)}
},[config?.showQuestBanner]);
  // INITIALISATION
  const [zone, setZone] = useState(mapsByName.balcon); // balcon est le depart officiel
  const [playerState, setPlayerState] = useState({ 
    croqs:1,
     pdv: 10,
      maxPdv:50,
       vomito:80,
       level:1 });//pdv de depart
 const [tilePosition, setTilePosition] = useState({ 
  row: 1, 
  col: 1 }); // ou autre position de départ
  
const [position, moveToPosition, isAnimating] = useSmoothMovement(tilePosition.col * TILE_SIZE, tilePosition.row * TILE_SIZE);
const [isLoaded, setIsLoaded] = useState(false);

  const [pendingExit, setPendingExit] = useState(null);
  const [dialogue, setDialogue] = useState(null);
  const [triggerKey, setZoneChangeKey] = useState(0);
  const [nbVomi, setNbVomi] = useState(0);
  const [tileStates, setTileStates] = useState({});
  const [effects, setEffects] = useState({});
  const [mute, setMute] = useState(true);
  const [isSaoul, setSaoul] = useState(false);
  const [nuit, setNuit] = useState(false);
const [resetDialoguePlayed, setResetDialoguePlayed] = useState(0);
const [disabledDialogues, setDisabledDialogues] = useState(new Set());





const {
  items: inventory,
  addItem,
  removeItem,
  hasItem
} = useInventory(['clé','griffe']);
const addCroqs=amount=>{
  setPlayerState(state=>{
    return {...state, croqs:state.croqs+amount}
  })
}

const addPdv=amount=>{
  setPlayerState(state=>{
    return {...state, pdv:Math.min(state.maxPdv, state.pdv+amount)}
  })
}
const setLevel=lvl=>{
  setPlayerState(state=>{
    return {...state, level:lvl}
  })
}
const updatePlayerState=newState=>{
   setPlayerState(state=>{
    return {...state, ...newState}
  })
}

const getTileData = (zoneName, row, col) => {
  let tiledata =  mapsByName[zoneName]?.interactions?.[`${row},${col}`] ?? null;
  if(tiledata==null) // fallback sur foreground
   tiledata =  mapsByName[zoneName]?.foreground?.[`${row},${col}`] ?? null;
  return tiledata;
};

const getAllTileStates = (zoneName) => {
  const output = {};
  const prefix = `${zoneName}:`;
  for (const key in tileStates) {
    if (key.startsWith(prefix)) {
      const cleanKey = key.replace(`${prefix}`, '');
      output[cleanKey] = tileStates[key];
    }
  }
  return output;
};
const removeEntity = (tileKey) => {
  setZone((prevZone) => {
    const newForeground = { ...prevZone.foreground };
    const newInteractions = { ...prevZone.interactions };

    delete newForeground[tileKey];
    delete newInteractions[tileKey];

    return {
      ...prevZone,
      foreground: newForeground,
      interactions: newInteractions,
    };
  });
};

const moveEntity = (tileId, newPosition) => {
  const { row, col } = newPosition;

  setZone((prevZone) => {
    let entityToMove = null;
    let interactionToMove = null;
    const newForeground = { ...prevZone.foreground };
    const newInteractions = { ...prevZone.interactions };

    // 1️⃣ Trouver et retirer l'entité dans foreground
    for (const key in newForeground) {
      if (newForeground[key]?.tileType === tileId) {
        entityToMove = newForeground[key];
        delete newForeground[key];
        break;
      }
    }

    // 2️⃣ Trouver et retirer l'interaction liée
    for (const key in newInteractions) {
      const behaviorType = newInteractions[key]?.moveWith ?? newInteractions[key]?.behaviorType ?? tileId;
      if (behaviorType === tileId) {
        interactionToMove = newInteractions[key];
        delete newInteractions[key];
        break;
      }
    }

    // 3️⃣ Ajouter l’entité à la nouvelle position
    if (entityToMove) {
      newForeground[`${row},${col}`] = {
        ...entityToMove
      };
    }

    if (interactionToMove) {
      newInteractions[`${row},${col}`] = {
        ...interactionToMove
      };
    }

    return {
      ...prevZone,
      foreground: newForeground,
      interactions: newInteractions,
    };
  });
};

  const getTileState = (zoneName, row, col) =>{
     let tileId = zone.tileMap?.[row]?.[col];
      const fgData = zone.foreground?.[`${row},${col}`];
      if (fgData) 
        tileId = fgData.tileType;
       const tileData = getTileData(zoneName, Number(row), Number(col));

      return  tileStates[`${zoneName}:${row},${col}`] ?? tileData?.state ?? fgData?.state;
  }
   

  const updateTileState = (zoneName, row, col, newState) => {
    setTileStates((prev) => ({
      ...prev,
      [`${zoneName}:${row},${col}`]: newState
    }));
  };

const triggerExplosionAt = (row, col, tileKey) => {
  const key = tileKey??`${row},${col}`;
  if(tileKey=='tonnerre')
    triggerTonnerre();
  else{
    
  setEffects(prev => ({
    ...prev,
    [key]: { type: 'explosion', image: 'explosion' }
  }));

  setTimeout(() => {
    setEffects(prev => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  }, 500); // durée de l’effet
  }
};

const getBehaviour=tileKey=>{
  const tileData = zone.interactions?.[tileKey];
  const behaviorId = tileData?.behaviorType ?? tileKey;
  return tileBehaviors[behaviorId];
}

const canWalk = (row, col) => {
  
let tileId = zone.tileMap?.[row]?.[col];
      const fgData = zone.foreground?.[`${row},${col}`];
      if (fgData) 
        tileId = fgData.tileType;
  if(rocsTypes.includes(tileId))
    return false;
  
  const behavior = getBehaviour(tileId);
  const tileState = getTileState(zone.name, row, col);

  if (!behavior) return true; // fallback : autorisé si pas défini

  if (typeof behavior.isWalkable === 'function') {
    return behavior.isWalkable(tileState, playerState);
  }

  return true; // par défaut walkable
};

const onFadeComplete = () => {
    if (!pendingExit) return;
    const nextZone = mapsByName[pendingExit.targetZone];
    setZone(nextZone);
    setNuit(nextZone.nuit);
     setTilePosition({ row: pendingExit.spawn.y, col: pendingExit.spawn.x });
    moveToPosition(pendingExit.spawn.x * TILE_SIZE, pendingExit.spawn.y * TILE_SIZE);
   
    setPendingExit(null);
  }
  const takeDamage = dmg => setPlayerState(p => ({ ...p, pdv: p.pdv - dmg }));

  const moveToZone = (zoneId, spawn={ x: 1, y: 1 })=>{
     setPendingExit({
        targetZone: zoneId,
        spawn: spawn // coordonnées dans la nouvelle map
      })
      setZoneChangeKey(Date.now());
  }
  const _startDialogue = d=>startDialogue(d);
  // ...

// 🎉 LEVEL UP ICI
const levelUp = useCallback((prev) => {
  const newLevel = playerState.level + 1;

  setPlayerState?.((prevState) => ({
    ...prevState,
    level: newLevel,
    maxPdv: prevState.maxPdv + 10,
    pdv: prevState.maxPdv + 10 // full heal sur le nouveau max
  }));

  setTimeout(()=>{
    if(newLevel==2)
      dialogueEngine.startDialogue('tutoLevel');
    else
      setDialogue(`⭐ Niveau ${newLevel} atteint !`);
  },6000);
  soundManager?.play?.('levelUp');

  return newLevel;
},[setPlayerState, playerState.level]);


const quests = useQuests({
  inventory: playerState.inventory,
  tilePosition,
  zone,
  showQuestBanner,
   startDialogue:_startDialogue,
 addItem, addCroqs, addPdv, hasItem, 
      levelUp, 
      moveToZone
});
const handleSave = () => {
  const saveData = {
    playerState,
    inventory,
    quests:quests.activeQuests,
    zoneName: zone.name,
    tilePosition,
    disabledDialoguesArray: Array.from(disabledDialogues)
  };
config.onSave(saveData);
showQuestBanner("Sauvegarde reussie")
};

const handleLoad = useCallback(() => {
  config?.loadGame();
},[config.loadGame]);


 useEffect(() => {
  
 if (config.loadGame&&config.loadedData!=null) {
    const saved = JSON.parse(localStorage.getItem('catrpg-save') || '{}');
    if (!saved) return;

    if (saved.playerState) setPlayerState(saved.playerState);
    if (saved.tilePosition) {
          setTilePosition(saved.tilePosition);
       moveToPosition(saved.tilePosition.col * TILE_SIZE, saved.tilePosition.row * TILE_SIZE);
 
    }
    if (saved.zoneName) setZone(mapsByName[saved.zoneName]);
    if (saved.inventory) {
      inventory.forEach(removeItem);
      saved.inventory.forEach(addItem);
    }
    if (saved.quests) quests.setAllQuests(saved.quests);
    if (saved.disabledDialoguesArray)
      setDisabledDialogues(new Set(saved.disabledDialoguesArray));
    if (typeof saved.resetDialoguePlayed === 'number')
      setResetDialoguePlayed(saved.resetDialoguePlayed);
  }
  showQuestBanner("Jeu rechargé")
   setIsLoaded(true);
  }, [config.loadGame, config.loadedData]);


// DEMARAGE de zone
useEffect(() => {
  if (!isLoaded) return; // Ne rien faire tant que tout n'est pas chargé

  const questId = zone.questOnEnter;
  if (questId && !quests.hasStarted(questId)) {
    quests?.startQuest?.(questId);
  }
}, [zone, quests, isLoaded]);

  const isOccupied = (fg, inter, row, col) => {
  const key = `${row},${col}`;
  return fg[key] || inter[key];
};
const findFreeAdjacent = (fg, inter, baseRow, baseCol) => {
  const directions = [
    { dx: 0, dy: -1 },
    { dx: 1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
    { dx: -1, dy: -1 },
    { dx: 1, dy: -1 },
    { dx: 1, dy: 1 },
    { dx: -1, dy: 1 }
  ];

  for (const { dx, dy } of directions) {
    const row = baseRow + dy;
    const col = baseCol + dx;
    if (!isOccupied(fg, inter, row, col)) {
      return { row, col };
    }
  }

  return null;
};

const leaveVomiTile = (position) => {
  if (!position) return;

  setZone((prevZone) => {
    const newFg = { ...prevZone.foreground };
    const newInteractions = { ...prevZone.interactions };

    let { row, col } = position;

    // Vérifie si la tile est occupée
    if (isOccupied(newFg, newInteractions, row, col)) {
      const altPos = findFreeAdjacent(newFg, newInteractions, row, col);
      if (!altPos) {
        console.warn('🤢 Aucune place libre pour vomir !');
        return prevZone; // Annule si aucune case disponible
      }
      row = altPos.row;
      col = altPos.col;
    }

    const key = `${row},${col}`;

    newFg[key] = {
      tileType: 'vomi',
      state: 'frais'
    };

    newInteractions[key] = {
      dialogueId: 'vomir',
      behaviorType: 'vomi'
    };

    return {
      ...prevZone,
      foreground: newFg,
      interactions: newInteractions
    };
  });
};

const triggerVomi = () => {
  // Reset la jauge
  setPlayerState(prev => ({ ...prev, vomito: 0 }));
setNbVomi(n=>(n+1));
  // Effet visuel : ajout d’une "trace" sur la carte
  leaveVomiTile(tilePosition);

  // Son bien dégueu
  soundManager?.play?.('vomito');

  // Impact gameplay : perte de pdv, objets, etc.
  setPlayerState(prev => ({
    ...prev,
    pdv: Math.max(prev.pdv - 5, 1) // exemple : perte de 5 pdv
  }));

  showQuestBanner?.("🤮 Le chat a vomi ! Beurk !");
};
useEffect(() => {
  if ((playerState.pdv ?? 1) <= 0) {
    showQuestBanner(`
      😼 Oh non, Ezio a vomi. 
      Il n'avait assez plus de point de Forme.
      Surveillez votre barre de vie la prochaine fois
      (Dormez pour la recharger)
      Il parait que si on demande a papa de nettoyer il le fait`);
    triggerVomi();

    // on redonne un petit point de vie
    setPlayerState((prev) => ({
      ...prev,
      pdv: 1
    }));
  }
}, [playerState.pdv]);

useEffect(() => {
  if ((playerState.vomito ?? 0) >= 100) {
    triggerVomi();
  }
}, [playerState.vomito]);

const increaseVomito = (amount = 10) => {
  setPlayerState((prev) => {
    const newVomito = (prev.vomito ?? 0) + amount;
    return {
      ...prev,
      vomito: newVomito
    };
  });
};
const triggerTonnerre=()=>{
soundManager.play('tonnerre');
config.setLightning(true);
}
const [cLaFin, diCFini] = useState(false);
const endGame = ()=>{
  diCFini(true);
}
const CATManager = {
removeEntity,
unPeuDeMusique:ziqon=>{
  setMute(!ziqon)},
moveEntity, 
endGame,
remplit:pos=>{
  // setTileState a plein
  updateTileState(pos.zone, pos.row, pos.col, "plein");
},
setSaoul:(duree=5000)=>{
  setSaoul(true);
  setTimeout(()=>{setSaoul(false)}, duree);
},
vomito:increaseVomito,
closeCurrentDialogue:()=>{
  dialogueEngine.closeCurrentDialogue();
},
triggerEffect:({row, col, tileKey, type='explosion'})=>{
  
  triggerExplosionAt(row,col,tileKey);
},
disableDialog : (dialogueId) => {
  setDisabledDialogues((prev) => new Set([...prev, dialogueId]));
},
enableDialog : (dialogueId) => {
  setDisabledDialogues((prev) => {
    const updated = new Set(prev);
    updated.delete(dialogueId);
    return updated;
  });
},
  resetCroquettes:(dialogueId)=>{
    //markPlayed
    setResetDialoguePlayed(dialogueId);
    // remettre state 10 pour toutes les croquettes de tous les tileState
    
    setTileStates((prev) => {
      const newStates = { ...prev };

      for (const key in prev) {
        const [zoneName, row, col] = key.split(":");
        let nRow=Number(row),nCol=Number(col);
        // y a un bug qqpart
        if(row.indexOf(',')>0){
          const splt = row.split(',');
          nRow=Number(splt[0]);
          nCol=Number(splt[1]);
        }
        const tileData = getTileData(zoneName, Number(nRow), Number(nCol));

        if (tileData?.tileType === 'croqs' || tileData?.behaviourType === 'croqs') {
          newStates[key] = 10;
        }
      }

      return newStates;
    });
  }
  , resetDialoguePlayed
}
  const dialogueEngine = useDialogueEngine({
    onEffect: {
      addItem, addCroqs, addPdv, hasItem, soundManager, levelUp,
      takeDamage, quests, CATManager,
      moveToZone
    }
  });
  const isDialogueDisabled = (dialogueId) => {
  return disabledDialogues?.has?.(dialogueId);
};

  const safeStartDialogue = (dialogueId, startNode) => {
  if (isDialogueDisabled(dialogueId) && startNode==null) {
    console.log(`Dialogue "${dialogueId}" désactivé, ignoré.`);
    return;
  }
  dialogueEngine.startDialogue(dialogueId, startNode);
};

const startDialogue = useCallback((dialogid)=>{
  safeStartDialogue(dialogid);
},[safeStartDialogue]);

const moveTo = (nextRow, nextCol) => {
  const tile = zone.tileMap?.[nextRow]?.[nextCol];
  const exit = zone.exits?.[`${nextRow},${nextCol}`];

  if (exit) {
    setPendingExit(exit);
    setZoneChangeKey(Date.now());
    return;
  }

  if (canWalk(nextRow, nextCol)) {
    setTilePosition({ row: nextRow, col: nextCol });
    moveToPosition(nextCol * TILE_SIZE, nextRow * TILE_SIZE);
  }
};
const reset = () => {
  // Reset du player
  setPlayerState({
    croqs: 1,
    pdv: 10,
    maxPdv: 50,
    vomito: 0,
    inventory:['clé','griffe'],
    level: 1
  });

  // Reset de la zone
  setZone(mapsByName.balcon); // ← zone de départ officielle ?
  setTilePosition({ row: 5, col: 5 });

  // Reset des quêtes
   quests.setAllQuests({});

  // Reset des dialogues joués
  setDisabledDialogues(new Set());

  // Reset des tileStates, effets visuels etc.
  setTileStates({});
  setEffects({});

  // Autres resets possibles
  setDialogue(null);
  setPendingExit(null);
};


  return {
    zone, triggerKey, onFadeComplete,
    position, tilePosition,isAnimating, dialogue, setDialogue, inventory,
  addItemToInventory: addItem,
  removeItemFromInventory: removeItem, addCroqs,addPdv,addItem,
  hasItemInInventory: hasItem, takeDamage,nuit,
    moveTo, getTileState,getAllTileStates, updateTileState, playerState ,updatePlayerState, canWalk
    , dialogueEngine, getTileData, triggerExplosionAt, effects, quests, nbVomi, isSaoul
    , CATManager, mute, safeStartDialogue, handleLoad, handleSave, cLaFin, reset
  };
};


