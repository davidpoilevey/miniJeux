// GameContext.js
import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { soundManager } from '../rpg/sons/SoundManager';
import gemirSound from './images/gemir.mp3';
import criSound from './images/scream.mp3';

const GameStateContext = createContext();
const GameDispatchContext = createContext();

const initialState = {
  currentScene: 'Introduction',
  stats: {
    mana: 100,
    excitation: 0,
    corruption: 0
  }
};

// Le "cerveau" de votre jeu
function gameReducer(state, action) {
  //Wrapper .  D'abord, on exécute l'action de l'utilisateur
  const nextState = coreGameReducer(state, action);
  
  // 4. Ensuite, on passe le NOUVEL état à notre vérificateur de surcharge
  const finalState = checkExcitationOverload(nextState);
  
  // 5. On retourne l'état final (qui a été vérifié ET potentiellement modifié)
  return finalState;
}
function coreGameReducer(state, action) {
  switch (action.type) {
    case 'NAVIGATE':
      return { ...state, currentScene: action.target };
    
    case 'GAIN_CORRUPTION':
      return {
        ...state, 
        stats: { ...state.stats, corruption: state.stats.corruption + action.payload }
      };
    case 'PERTE_TEMPS':
      return {
        ...state,
        stats: { ...state.stats, corruption: state.stats.corruption -Math.ceil(Math.random()*2)
          , excitation:  state.stats.excitation -Math.ceil(Math.random()*3) , mana:  state.stats.mana -Math.ceil(Math.random()*4)}
      };
    case 'RESET_SOUND':
      return {...state, sound:null};
    case 'LUCIDITE':
      return {
        ...state,
        stats: { ...state.stats, corruption: Math.max(0,state.stats.corruption -Math.ceil(Math.random()*20))
          , excitation:  5 }
      };
      
    // ... autres actions (GAIN_EXCITATION, REGEN_MANA, etc.) ...
    case 'GAIN_EXCITATION': // avec un cheat code payload==11:gemir, =15:muhaha
      return {
        ...state,sound:action.payload===11?'gemir':(action.payload===15?'muhaha':null),
        stats: { ...state.stats, excitation: state.stats.excitation + action.payload }
      }; 
      case 'COST_MANA':// fait perdre le mana en payload et un peu tout
      return {
        ...state,
        stats: { ...state.stats,  excitation: Math.max(0,state.stats.excitation - 10)
           , corruption: Math.max(0,state.stats.corruption - Math.ceil(Math.random()*3))
          , mana: state.stats.mana - action.payload }
      };
      case 'REGEN_MANA':
      return {
        ...state,
        stats: { ...state.stats,  excitation: Math.max(0,state.stats.excitation - action.payload/2)
          , mana: state.stats.mana + action.payload }
      };
      case 'TOUCH_RUNE':
         return {
        ...state,
        stats: { ...state.stats, mana: state.stats.mana - action.payload 
            , excitation: state.stats.excitation + action.payload
        , message:"Vous vous sentez plus excitée"}
      };
      case 'SELF_CORRUPT':
           return {
        ...state,
        stats: { ...state.stats, mana: state.stats.mana - action.payload 
            , corruption:state.stats.corruption+Math.round(Math.random()*10+1)
            , excitation: state.stats.excitation/2
        , message:"Vous passez un peu plus du coté de la luxure"}
      };
      case 'COMBAT_FEU':
         return {
        ...state,
        currentScene:action.payload.target,
        stats: { ...state.stats, mana: state.stats.mana - action.payload.mana 
             , message:"Foule de beu"
            , corruption: Math.max(0,state.stats.corruption - Math.ceil(Math.random()*10))
            , excitation: Math.max(0,state.stats.excitation - 30) }
      };
      case 'FIN_JEU':
         return { ...state, currentScene: 'finalScene', final:action.payload };
    // Gère les choix complexes
    case 'HANDLE_CHOICE':
      const choice = action.payload;
      if (choice.target) {
        return { ...state, currentScene: choice.target };
      }
      if (choice.action) {
        // Renvoie à lui-même pour gérer les actions de stats
        return gameReducer(state, { type: choice.action, payload: choice.payload });
      }
      return state;

    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

// Le "Provider" qui englobe votre jeu
export const CorruptProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  useEffect(()=>{
     soundManager.loadSounds({
          gemir: gemirSound,
          muhaha: criSound,});
  },[]);

  useEffect(()=>{
    if(state.sound!=null)
     {
      soundManager.play(state.sound);
      dispatch({ type: 'RESET_SOUND' });
     }
  },[state.sound]);
  return (
    <GameStateContext.Provider value={state}>
      <GameDispatchContext.Provider value={dispatch}>
        {children}
      </GameDispatchContext.Provider>
    </GameStateContext.Provider>
  );
};

// Hooks personnalisés pour accéder à l'état et aux actions
export const useGameState = () => useContext(GameStateContext);
export const useGameDispatch = () => useContext(GameDispatchContext);



// Cette fonction vérifie l'état APRÈS chaque action
function checkExcitationOverload(state) {
  const { stats } = state;

  // L'état est-il en surcharge ?
  if (stats.excitation > 100) {
    
    // Votre logique :
    // "un peu moins de corruption" (disons 1 à 5, au lieu de 1-11)
    const corruptionGain = Math.round(Math.random() * 4 + 1); 
    
    // "perte random d'excitation (entre 10 et 50)"
    const excitationLoss = Math.round(Math.random() * 40 + 10);
    
    // On retourne un NOUVEL état, modifié
    return {
      ...state,
        message: "Votre corps frémit ! L'excès de plaisir se grave dans votre âme..." ,
      stats: {
        ...stats,
        // On applique la perte d'excitation
        excitation: stats.excitation - excitationLoss,
        // On applique le gain de corruption
        corruption: stats.corruption + corruptionGain,
        // On garde le mana intact (comme demandé)
        mana: stats.mana
      }
    };
  }
  
  // Si pas de surcharge, on retourne l'état tel quel.
  return state;
}