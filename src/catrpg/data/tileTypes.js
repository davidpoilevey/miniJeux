// data/tileBehaviors.js

import { soundManager } from "../../rpg/sons/SoundManager";

const commonBehaviour = {
 isWalkable: () => true
 , onEnter: ({ tileData, showDialogue}) =>{  
    showDialogue();
 }
 , onInteract: ({ tileData, showDialogue}) =>{  
    showDialogue();
 }
};
/*
0:carrelage
1:mur
2:porte
4:herbe
5:eau
6:herbe nonWalkable
*/
export const tileBehaviors = {
  0: {
    name: 'carrelage',
   ...commonBehaviour
  },
  100: {
    name: 'invisibleMur',
    isWalkable: () => false
  },
  1: {
    name: 'pierre',
    ...commonBehaviour,
    isWalkable: () => false
  },
  2: {
    name: 'porte',
     onEnter: ({ tileData, tileState,hasItemInInventory, updateTileState, showDialogue}) =>{  
      if(tileState==null){
        updateTileState(tileData?.keyRequired?'closed':'open');
      }
      if(tileData?.keyRequired){
        
        if(tileState=='closed' && hasItemInInventory(tileData?.keyRequired)) // laisse passer
          {
            updateTileState('open');
            soundManager.play('porte');
          }

      }
      showDialogue();
 },
    state: 'closed',
    isWalkable: (state, player) => state === 'open',
    
    onInteract: (context) => {
      const { tileData, tileState, playerState,hasItemInInventory, updateTileState, showDialogue } = context;
 if (tileState === 'open') {
        showDialogue('La porte est déjà ouverte.');
        return;
      }

      const requiredKey = tileData?.keyRequired ?? 'clé';
      if (hasItemInInventory(requiredKey)) {
        updateTileState('open');
        if(!tileData?.silent)
        showDialogue(`Tu ouvres la porte avec la ${requiredKey}.`, true);
      } else {
        if(tileData?.dialogueId)
          showDialogue(tileData.dialogueId);
        else if(!tileData?.silent)
          showDialogue(`Il te faut la ${requiredKey}.`, true);
      }
    }
  },
  dechirable: {
  name: "dechirable",
  ...commonBehaviour,
  state: 10,
  isWalkable: (state, player) => state <= 0,

  onInteract: (context) => {
    const {
      tileData,
      triggerEffect,
      tileState = 10,
      playerState,
      updatePlayerState,
      hasItemInInventory,
      updateTileState,
      showDialogue
    } = context;

    const dialogueId = tileData?.dialogueId;

    if (tileState <= 0) {
      if (dialogueId) {
        showDialogue(dialogueId, null, "completed");
      } else {
        showDialogue("Les restes du mur sont au sol.", true);
      }
      return;
    }

    if (hasItemInInventory("griffe")) {
      const nb=Math.round(Math.random()*5);
      const newState = tileState - nb;
      updateTileState(newState);
      updatePlayerState({pdv:playerState.pdv-2})
      soundManager.play("slash");
      triggerEffect("explosion");

      // Dialogue contextuel en fonction du tileState
      if (dialogueId) {
        if (tileState === 10) {
          showDialogue(dialogueId,null,  "start");
        } else if (newState <= 0) {
          showDialogue(dialogueId,null, "completed");
        } else {
          soundManager.play('sword');
        }
      } else {
        showDialogue("Ca s’effrite ! Tu perds "+nb+" pt de forme", true);
      }
    } else {
      showDialogue("Tu ne peux pas le gratter sans griffe...", true);
    }
  }
},
  4: {
    name: 'herbe',
    ...commonBehaviour,
  }
,
  5: {
    name: 'eau',
    ...commonBehaviour,
    isWalkable: (state, player) => {
        return (player?.bateau)||false;
    },
    onInteract: ({ tileState, updateTileState, addItem, showDialogue }) => {
    
    }
  },
  6: {
    name: 'herbeNonWalkable',
   ...commonBehaviour,
    isWalkable: () => false
  },
  recipient:{
    name:'recipient',
    ...commonBehaviour,
     isWalkable: (state) => state==='vide',
    state: 'vide',
      onEnter: ({tileState='vide', quests, updateTileState, updatePlayerState, playerState, showDialogue}) => {
     //??
     if(tileState==='plein'){
        updatePlayerState({...playerState, pdv:playerState.maxPdv, vomito:2});
        quests.completeQuest('escalier');
      showDialogue("Tu te desalteres et te rafraichis le gosier")
     }
     else{
      showDialogue("C'est desesperement vide")
     }
     updateTileState(tileState);
        }
  },
  vase:{
    name:'vase',
    ...commonBehaviour,
    state: 'vide',
      onEnter: (context) => {
        soundManager.play('explosion');
        context.updatePlayerState(Math.round(Math.random()*30))
     context.showDialogue("Patatras ! Tu as tout renversé malheureux", true)
        }
  },
  alcool:{
    name:'vase',
    ...commonBehaviour,
    state: 'vide',
      onEnter: (context) => {
     context.showDialogue("De l'alcool ! Interagis avec la patte pour boire", true)
        }
        , onInteract:(ctx)=>{
           soundManager.play('glou'); soundManager.play('glou');
          ctx.CATManager.setSaoul(ctx.tileData?.duree||5000);
           ctx.showDialogue("Ouah.. Ca tourne...", true)
           ctx.updatePlayerState({...ctx.playerState, pdv:ctx.playerState.pdv+Math.round(Math.random()*20)});
     
        }
  },
  potion:{
    name:'potion',
    ...commonBehaviour,
    state: 'vide',
      onEnter: (context) => {
     context.showDialogue("Une potion miraculeuse ! Interagis avec la patte pour boire", true)
        }
        , onInteract:(ctx)=>{
         soundManager.play('glou');
           ctx.showDialogue("Ca va beaucoup mieux", true)
           ctx.updatePlayerState({...ctx.playerState, pdv:ctx.playerState.maxPdv, vomito:0});
     
        }
  },
  potionDegueu:{
    name:'potionDegueu',
    ...commonBehaviour,
    state: 'vide',
      onEnter: (context) => {
     context.showDialogue("Une potion douteuse ! Interagis avec la patte pour boire", true)
        }
        , onInteract:(ctx)=>{
         soundManager.play('glou');
           ctx.showDialogue("Euh.. c'etait quoi ce truc ?", true)
           ctx.CATManager.vomito(95);
     
        }
  },
  declenchableVide:{
    name:'declenchableVide',
    ...commonBehaviour
  },
  declenchable:{
    name:'declenchable',
    ...commonBehaviour
    ,  isWalkable: () => false,
  }
  , tonnerre:{
    name:'tonnerre'
    , ...commonBehaviour
    , onEnter:({triggerEffect, tileData})=>{
    triggerEffect( "tonnerre");
    }
  }
  , sale:{
     name:'sale',
    ...commonBehaviour
    , onEnter:(ctx)=>{
      ctx.CATManager.vomito(Math.round(Math.random()*20));
      ctx.showDialogue("Berk, c'est sale")
    }}
  , piquant:{
    name:'piquant',
    ...commonBehaviour
    , onEnter:(ctx)=>{
      ctx.updatePlayerState({...ctx.playerState, pdv:ctx.playerState.pdv-Math.round(Math.random()*10)});
      ctx.showDialogue("Aie ca pique !")
    }
  },
   pickable: {
    onEnter: ({ tileState,  showDialogue }) => {
      // Si déjà ramassé (state falsy), ne rien faire
      if (!tileState) return;
       showDialogue();
    },
    state:10,
    onInteract: ({ tileState, updateTileState, showDialogue,CATManager, tileData, addItem }) => {
      if (!tileState) return; // déjà ramassé

      const itemName = tileData?.item || tileData?.tileType;
      if(tileData.removeItem)
        CATManager.removeEntity(tileData.removeItem);
      soundManager.play('ramasse');
      showDialogue?.(`Tu as ramassé ${itemName}`);
      updateTileState(0); // rend invisible (via opacity)
      addItem(itemName);
    }
  },
  pnj:{
    name:'pnj',
     ...commonBehaviour,
    isWalkable: () => false,
    state: {
      dialogues:[]
    },
      onInteract: (context) => {
      const { tileData, tileState, quests,hasItemInInventory, updateTileState,playerState, updatePlayerState, showDialogue } = context;
          showDialogue(tileData?.dialogueId);
        }
  },
  coffre:{ // tileData peut avoir dialogueId , keyRequired ou reward
    name: 'coffre',
    ...commonBehaviour,
    state: 'closed',
    isWalkable: (state, player) => false,
    onInteract: (context) => {
      const { tileData, tileState, quests,hasItemInInventory, updateTileState,playerState, updatePlayerState, showDialogue } = context;
      if(!tileData?.keyRequired && tileState==='closed')
          {
            updateTileState('open');
             showDialogue("Il n'etait pas fermé.");
          }
      else if (tileState === 'open') {
       //deja ouvert
        return;
      }
// on va dire c'est soit il a un dialogueId qui fait tout, soit il a un keyRequired+reward
      const requiredKey = tileData?.keyRequired ?? 'clé';
      if (hasItemInInventory(requiredKey)) {
        updateTileState('open');
        if(quests?.takeReward && tileData?.reward)
          quests.takeReward(tileData?.reward);
        else
         updatePlayerState({croqs:playerState?.croqs||0+Math.round(Math.random()*5)});
        showDialogue(`Tu ouvres le coffre avec la ${requiredKey}.`, true);
      } else {
        if(tileData?.dialogueId)
          showDialogue(tileData?.dialogueId);
        else
          showDialogue(`Il te faut la ${requiredKey}.`);
      }
    }
  },
  10: {
    name: 'pnj',
    ...commonBehaviour,
    isWalkable: () => false,
    onInteract: ({ tileData, showDialogue }) =>
      showDialogue()
  },
  radio: {
    name: 'radio',
    ...commonBehaviour,
    isWalkable: () => false,
    onInteract: ({ tileState, updateTileState, CATManager }) =>{

     const newState =(tileState==null||tileState=='eteins')?'allume':'eteins';
     
      CATManager.unPeuDeMusique((newState==='allume'));
     updateTileState(newState)
    }
  },
  vomi: {
  name: "vomi",
    ...commonBehaviour,
  onEnter: ({ showDialogue, CATManager }) => {
    CATManager.vomito(5);
    showDialogue(`Beurk...
      Ca sent le vomi`);
  }
},
papa: {
  name: 'papa',
  ...commonBehaviour,
  isWalkable: () => false,
  onEnter: ({
    tileState = { agaceLevel: 0, position: null },
    tileData,
    updateTileState,
    CATManager,
    showDialogue,
  }) => {
    const agace = tileState.agaceLevel ?? 0;
    const papaPosition = tileState.position ?? tileData?.position;

    // Dialogue final
    if (agace >= 5) {
      showDialogue('parlerPapa', 'vasy');
 // TODO      CATManager.moveEntity('papa', { x: 15, y: 14 }); // vers la porte ?
 
      return;
    }

    // Répliques croissantes
    const phrasesPapa = [
      "Pas maintenant chatchat",
      "Oui tu es gentil, mais laisse-moi bosser",
      "T'es chiant, dégage !",
      "Penible boy",
      "t'es relou",
      "Vas-y pas maintenant",
      "Putain casse-couille en chef"
    ];


    // Affichage de la réplique correspondante
    const phrase = phrasesPapa[Math.min(agace, phrasesPapa.length - 1)];
    showDialogue(phrase, true);

    // Update tileState (persistance)
    if(papaPosition!=null)
    updateTileState({
      agaceLevel: agace + 1,
      position: papaPosition
    });
  }
}

,
  maman: {
    name: 'maman',
    ...commonBehaviour,
    isWalkable: () => false,
    onInteract: ({ tileData, showDialogue }) =>
      showDialogue()
  },
  croqs:{
    name:"croqs",
    ...commonBehaviour,
    state:10,
    onInteract: ({ tileState, showDialogue, updatePlayerState, playerState, updateTileState }) =>{
      if(tileState==null)
        updateTileState(10);
      else if(tileState>0){
        const nb=Math.round(Math.random()*5);
       updatePlayerState({croqs:playerState.croqs+nb});
       updateTileState(tileState-nb);
       soundManager.play('miam');
      }
      else
      showDialogue("Il n'y a plus aucune croquette ici", true)
    }
     
  }
  , coussin:{
    name:'coussin',
    ...commonBehaviour,
    onInteract: ({ tileData, showDialogue,playerState,  updatePlayerState }) =>
      {
        updatePlayerState({pdv:Math.min(playerState.maxPdv,playerState.pdv+10)});
        soundManager.play('ronfle');
        showDialogue("Rrrrrr..... Zzzzzzzz..... \n(+10 points de fatigue)", true);
      }
    
  }
  // 110 = escalier
  , 110:{
    name:110,
    ...commonBehaviour,
    state:"closed",
    isWalkable: (state, player) => state === 'open',
     onInteract: (context) => {
      const { tileData, tileState, quests,hasItemInInventory, updateTileState, showDialogue } = context;
 if (tileState === 'open') {
    soundManager.play('glou');
        return;
      }

      const requiredKey = tileData?.keyRequired ?? 'clé';
      if (hasItemInInventory(requiredKey)) {
        updateTileState('open');
        if(tileData?.openMessage){
          showDialogue(tileData.openMessage, true);
        }
      } else {
        if(tileData?.dialogueId)
          showDialogue(tileData.dialogueId);
        else
          showDialogue(`Il te faut la ${requiredKey}.`);
      }
    }
  }
};
