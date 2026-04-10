/**
 * 
 * ***************.    ZONE.   ***************************
  zone:{
   tileMap:[]
   , exits:{
   }
   , interactions:{
         'x,y': {
        dialogueId, keyRequired, once, miaulable, behaviorType, reward
        }
}, foreground:{
         'x,y': {
        tileType:'tableCarre' // doit exister dans imageSources
        , ratio:2 // pour agrandir / retrecir
        }
}



****************.   TILETYPE.  *********************
tileTypeId: {
    name: 'tileTypeId',
   isWalkable: () => true
 , onEnter: (context) =>{  
    context.showDialogue();// lance dialogueId si existe
 }, onInteract: ({  
   
          tileState
          , tileData
          , quests,
          triggerEffect: (type) => triggerExplosionAt(row, col),
          updateTileState: (newState) => updateTileState(zone.name, row, col, newState),
          playerState
          , hasItemInInventory
          , updatePlayerState,
          addItem: (item) => addItemToInventory(item),
          showDialogue: (text) => {
            }
    })=>{..}

  }


**********.   dialogue.  ******************
monDialogue: {
  start: "intro",
  nodes: {
    ...commonNodes, // inclus fin et miauled
    intro: {
    image:Speaker,
    url,
    short (if true, timeout et pouf)
      text: [...],
      options: [{text: "...", next: "..."}, ...],
      effect: ({ addItem, addCroqs, addPdv, hasItem, soundManager,
                    takeDamage, quests, CATManager,
                    moveToZone, ...dansUseWorld.js}) => {...},
      next: "..."
    },
    
  }
}

 onEffect: {
      addItem, addCroqs, addPdv, hasItem, soundManager, setLevel,
      takeDamage, quests, CATManager,
      moveToZone
    }
      
***************.  QUETES.  *********************
nomDeLaQuete: {
  name: "Titre",
  description: "But général",
  steps: [
    { type: "dialogue" | "item" | "position" | "scripted", ... },
    ...
  ],
  reward: { inventory: [...] }
}



 * }
 */