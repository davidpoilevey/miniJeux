import { createContext, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import { CollisionSystem } from "./collision/CollisionSystem";
import { createMatos } from "./hooks";
import { ENTITY_TYPES } from "./collision/Entities";
import { isKnightInRange } from "./collision/EnemyAI";
import { soundManager, soundMap } from "./sons/SoundManager";
import { generateNiveau } from "./niveaux/generateNiveau";
import { getAttackBox } from "./rpgUtils";


export const KNIGHT_SIZE = { width: 80, height: 64 };

const RPGContext = createContext();

function rpgReducer(state, action) {
  //TODO pour updater le state direct
  // action {type, payload, actionName}
  switch (action.type) {
    case "ATTACK":
      if (action.payload.type === state.knightAction)
        return state;
      // c'est l'endroit ou taper de l'ennemi ou taper des portes
      return {
        ...state, crouched: false
        , knightAction: action.payload.type
      }
    case 'CROUCH':
      return { ...state, crouched: action.payload }
    case "JUMP":
      // pesque un MOVE avec speed*1.1, bnus au saut
      if (state.knightAction === 'saut')
        return state;
      return {
        ...state, crouched: false,
        knightAction: 'saut',
      };
case 'SET_DOUBLE_JUMP_USED':
  return {
    ...state,
    hasDoubleJumped: action.payload
  };


    case "UPDATE_ALL":
      return { ...state, ...action.payload };

    case "DUMMY":
      return { ...state };
    case "SET_ACTION":
      return {
        ...state,
        knightAction: action.payload,
      };
    case "NEXT_ANIMATION":
      const isMonster = action.payload?.monster;

      return !isMonster ? state :
        {
          ...state,
          matos: state.matos.map(obj => {
            if (obj.id === action.payload.id && action.payload != null)
              return {
                ...obj, direction: action.payload.direction
                , objStatus: action.payload.objStatus
                , position: { x: action.payload.x, y: action.payload.y }
              }
            else return obj;
          })
        }
    case 'REMOVE_MATOS':
      const matosRestants = state.matos.filter(obj => obj.id !== action.payload.id);
      const toRemove = state.matos.find(obj => obj.id === action.payload.id);
      if (toRemove?.onDestroy) toRemove.onDestroy();
      return { ...state, matos: matosRestants };

    case 'UPDATE_MATOS':
      return {
        ...state,
        matos: state.matos.map(obj => {
          if (obj.id !== action.payload.id) return obj;
          if (action.walkingRadar) {
            // change only position and et objStatus to 'attaque' if knight in range

            const changed = obj.x !== action.payload.x || obj.y !== action.payload.y;
            const newObjStatus = (isKnightInRange(action.payload, state.knightPos, 40)) ? 'attaque' : obj.objStatus
            return changed ? {
              ...obj, objStatus: newObjStatus
              , x: action.payload.x, y: action.payload.y
              , position: { x: action.payload.x, y: action.payload.y }
            } : obj;
          }
          const changed =
            obj.x !== action.payload.x ||
            obj.y !== action.payload.y ||
            obj.objStatus !== action.payload.objStatus;

          return changed ? { ...obj, ...action.payload } : obj;
        })
      };

    case "MOVE_TO":
      return {
        ...state,
        knightPos: { ...state.knightPos, x: action.payload.x, y: action.payload.y },
      };
    case "MOVE":
      /* on laisse le safeMoveTo faire le deplacement, knightPos: {
                ...state.knightPos,
                x: state.knightPos.x + (action.payload.direction == 'right' ? 1 : -1) * state.speed
                , y: state.knightPos.y
              }*/
      return {
        ...state
        , gameMessage: null
        , direction: action.payload.direction
        , knightAction: (state.crouched ? 'accroupiMarche' : 'marche')
      }
    case "MOVE_UPDOWN":
      let currentGrimpant = true, currentAnim = 'grimpe', currInteract = state.currentInteraction;
      let newPos = {
        ...state.knightPos,
        x: state.knightPos.x
        , y: state.knightPos.y + (action.payload.direction == 'down' ? 1 : -1) * state.speed / 4
      }
      // si au-dessus du mur, passe en grimpeEnHaut, si en bas, repasse en idle
      if (newPos.y < state.currentInteraction.y) {
        currentAnim = 'grimpeEnHaut'; currentGrimpant = false;
        //newPos.x+=(KNIGHT_SIZE.width/2*(state.direction==='left'?-1:1));
        newPos.y = state.currentInteraction.y - KNIGHT_SIZE.height;
        state.baseLevel = state.currentInteraction.y - KNIGHT_SIZE.height;
      }
      if ((newPos.y + KNIGHT_SIZE.height) > (state.currentInteraction.y + state.currentInteraction.height)) {
        currentAnim = 'idle'; currentGrimpant = false; currInteract = null;
        newPos.y = state.baseLevel;
      }
      return {
        ...state
        , knightPos: newPos
        , knightAction: currentAnim, grimpant: currentGrimpant, currentInteraction: currInteract
      }
    case "END_GRIMPETTE":
      return { ...state, knightAction: 'idle', knightPos: { ...state.knightPos, y: state.baseLevel } }

    case 'SAFE_MOVE_TO':
      // Nouveau type d'action pour les mouvements avec collision
      const safenewPos = { ...state.knightPos, ...action.payload.position };
      let isJumping = state.knightAction === 'saut';
      let hasDoubleJumped=state.hasDoubleJumped;
      const snapped = action.payload.snappedToGround; // ← Ce champ est défini par correctPosition
      if (snapped && (!isJumping && state.knightAction !== 'tombe')) {
        safenewPos.x = state.knightPos.x;
        safenewPos.y = state.knightPos.y;
      }
      if (snapped && isJumping && safenewPos.y < state.knightPos.y) {
        safenewPos.x = state.knightPos.x;
        safenewPos.y = state.knightPos.y;
      }
      if (!action.payload.interactions?.canMove && !snapped) {
        isJumping = false;
        hasDoubleJumped=false;
        // safenewPos.y = state.baseLevel; // 💥 chute totale uniquement si pas un atterrissage valide
      }


      return {
        ...state,
        knightPos: safenewPos,
        knightAction: (!isJumping && action.payload.interactions?.falling) ? 'tombe'
          : (isJumping && !action.payload.interactions?.canMove) ? 'idle' : state.knightAction,
        falling: isJumping ? false : action.payload.interactions?.falling,
        hasDoubleJumped,
        nearbyInteractables: action.payload.interactions?.interactables || [],
        gameMessage: action.payload.corrected ? 'Chemin bloqué!' : state.gameMessage
      };
    case 'APPLY_GRAVITY': {

      if (action.payload.isOnGround) {
        const newPos = (action.payload.belowPos) ? { x: state.knightPos.x, y: action.payload.belowPos?.y } : state.knightPos;
        return {
          ...state, falling: false, baseLevel: newPos.y || state.baseLevel
          , direction: action.payload.changeDirection
          , knightPos: newPos
          , knightAction: 'atterris'
        };
      }
      return {
        ...state,
        knightPos: action.payload.belowPos,
        falling: true,
        knightAction: 'tombe'
      };
    }
    case 'TAKE_DAMAGE':
      if (state.isInvincible) {
        return {
          ...state,
          gameMessage: 'Paré ! 🛡️'
        };
      }
      const newPdv = Math.max(0, state.knightRPStat.pdv - action.payload.amount);
      return {
        ...state,
        knightRPStat: {
          ...state.knightRPStat,
          pdv: newPdv
        },
        knightPos: { ...state.knightPos, x: state.knightPos.x + 5 * (state.direction === 'left' ? -1 : 1) },
        knightAction: newPdv<1?'die':'coup' // pour jouer l'animation
      };
    case 'SE_PROTEGER':
      if (state.knightAction !== 'bouclierStart' && state.knightAction !== 'bouclier') {
        return { ...state, knightAction: 'bouclierStart' };
      }
      return state;

    case 'STOP_PROTEGER':
      return {
        ...state,
        knightAction: 'idle',
        isInvincible: false
      };
    case 'OPEN_CONTAINER':
      const { container } = action.payload;

      const newKnightStat = {
        ...state.knightRPStat,
        gold: state.knightRPStat.gold + (container.content.gold || 0),
      };

      const newInventory = {
        ...state.inventory,
        potions: (state.inventory?.potions || 0) + (container.content.potions || 0),
      };

      return {
        ...state,
        knightRPStat: newKnightStat,
        inventory: newInventory,
        gameMessage: `Coffre ouvert ! 💰 +${container.content.gold || 0} 🧪 +${container.content.potions || 0}`,
        matos: state.matos.map(obj => obj.id === container.id ? { ...obj, isOpen: true } : obj),
      };
    case 'ADD_MATOS':
      return {
        ...state,
        matos: [...state.matos, action.payload]
      };

    case 'USE_POTION':
      if (state.inventory.potions <= 0 || state.knightRPStat.pdv >= 100) {
        return {
          ...state,
          gameMessage: 'Pas de potion ou vie pleine ! 🧪'
        };
      }

      return {
        ...state,
        knightAction: 'boit',
        knightRPStat: {
          ...state.knightRPStat,
          pdv: Math.min(100, state.knightRPStat.pdv + 30)
        },
        inventory: {
          ...state.inventory,
          potions: state.inventory.potions - 1
        },
        gameMessage: 'Potion bue ! 🧪 +30 pdv'
      };

    case 'GAIN_REWARD':
      //action payload is {gold, xp, pdv}
      const newStats = { ...state.knightRPStat };
      if (action.payload.gold) newStats.gold += action.payload.gold;
      if (action.payload.xp) newStats.xp += action.payload.xp;
      if (action.payload.pdv) newStats.pdv += action.payload.pdv;
      return {
        ...state,
        knightRPStat: newStats,
        knightAction: 'victoire' // pour jouer l'animation
      };

    case 'END_LEVEL':
      return {
        ...state,
        gameMessage: '✨ Niveau terminé !',
        transitionToNextLevel: true // optionnel
      };

    case 'SET_MESSAGE':
      return {
        ...state,
        gameMessage: action.payload
      };
    case 'INTERACT':
      return {
        ...state,
        currentInteraction: action.payload
      };

    case 'SET_GRIMPANT':
      let currentGrimpant2=true, currentAnim2='grimpe', baseLevel2=state.baseLevel;
      let newPosY = state.knightPos.y - KNIGHT_SIZE.height / 2;
       if (state.currentInteraction && newPosY < state.currentInteraction.y) {
        currentAnim2 = 'grimpeEnHaut'; currentGrimpant2 = false;
        //newPos.x+=(KNIGHT_SIZE.width/2*(state.direction==='left'?-1:1));
        newPosY = state.currentInteraction.y - KNIGHT_SIZE.height;
        baseLevel2 = state.currentInteraction.y - KNIGHT_SIZE.height;
      }
      return {
        ...state,
        grimpant: currentGrimpant2
        , knightAction: currentAnim2
        , knightPos: {
          ...state.knightPos, y: newPosY
          , x: (state.direction === 'right' ? (action.payload.mur.x - 50) : (action.payload.mur.x + action.payload.mur.width - 40))
        }
        , baseLevel:baseLevel2
        , currentInteraction: action.payload.mur
      };
    case 'END_INTERACTION':
      return {
        ...state,
        currentInteraction: null
      };
    case "END_ANIMATION":
      let newAnim = 'idle';
      let isInvincible = false;
      if (state.crouched) newAnim = 'accroupiIdle';
      if (state.grimpant) newAnim = 'grimpe';
      if (state.falling) newAnim = 'tombe';
      if (state.knightAction === 'bouclierStart') {
        isInvincible = true;
        newAnim = 'bouclier'
      }

      return {
        ...state,
        isInvincible
        , knightAction: newAnim
      }
    default:
      return state;
  }

}
const initialState = {
  falling: false, grimpant: false, crouched: false, isInvincible: false // agit sur l'animation
  , direction: 'right', knightAction: 'idle', // agit sur l'animation
  speed: 10, knightRPStat: { xp: 20, pdv: 100, attack: 10, defense: 1, gold: 2 }, // chevalier stats
  knightPos: { x: 40, y: 600, }, baseLevel: 600, // position

  // pour le decor
  matos: [],
  inventory: {
    potions: 6, keys: ['red', 'platinum']
  },
  level: 1, hasDoubleJumped: false,
  //  pour les interactions
  nearbyInteractables: [],
  currentInteraction: null,
  gameMessage: null
}

export const RPGProvider = ({startlevel=1, setSelectedLevel, children }) => {
  const collisionSystemRef = useRef(new CollisionSystem());

  const [state, dispatch] = useReducer(rpgReducer, initialState);
  useEffect(() => {
    soundManager.loadSounds(soundMap);
    const newMatos = clearAndFillNiveau(startlevel);
    const mapWidth = Math.max(...newMatos.map(obj => obj.position?.x || 0)) + 400;

    dispatch({ type: "UPDATE_ALL", payload: { ...state, mapWidth: mapWidth, matos: newMatos } })
    // Ajouter d'autres obstacles si nécessaire
    // const wall = createWall(300, 400, 20, 100, 'wall1');
    // collisionSystem.addEntity('wall1', wall);

  }, [startlevel]);

const toMainMenu=()=>{
setSelectedLevel(null);
}
  const clearAndFillNiveau = niv => {
    const collisionSystem = collisionSystemRef.current;
    collisionSystem.clear();
    // Ajouter la porte
    const newMatos = [];
    const objectList = generateNiveau(niv, initialState.baseLevel);
    objectList.forEach(object => {
      const objid = crypto.randomUUID();
      object.id = objid;
      newMatos.push(object);
      const obj = createMatos(object, objid);
      collisionSystem.addEntity(objid, obj);
      if (object.monster && object.objStatus === 'walk' && obj.startWalkingLoop)
        obj.startWalkingLoop(dispatch, collisionSystem);
    });
    return newMatos;
  }

  const getEntity = entityID => {
    const collisionSystem = collisionSystemRef.current;
    const entity = collisionSystem.getEntities().get(entityID);
    return entity;

  }
  function restartLevel() {
    nextLevel(state.level);
  }
  function nextLevel(newLevl) {
    if (newLevl == null)
      newLevl = state.level + 1;

    const newMatos = clearAndFillNiveau(newLevl);

    const mapWidth = Math.max(...newMatos.map(obj => obj.position?.x || 0)) + 400;
    dispatch({
      type: "UPDATE_ALL", payload: {
        ...state
        , matos: newMatos, baseLevel: 500
        , transitionToNextLevel: false
        , knightAction: 'idle', knightPos: { x: 20, y: state.baseLevel }
        , level: newLevl, mapWidth: mapWidth
      }
    });
  }
  // fonctions de combat
function handleKnightAttack() {
  const collisionSystem = collisionSystemRef.current;
  const { knightPos, direction, knightAction } = state;

  const attackBox = getAttackBox(knightPos, direction, knightAction);

  const hits = collisionSystem.getCollisions(attackBox, {
    width: attackBox.width,
    height: attackBox.height
  });

  const enemiesHit = hits.filter(c => c.entity.type === ENTITY_TYPES.ENEMY);

  enemiesHit.forEach(hit => {
    hit.entity.onHit(state, dispatch); // ou .takeDamage(), .applyHit(), etc.
  });
}


  // Fonction de mouvement sécurisé
  const safeMoveTo = (targetPosition, sourcePosition, doNotCommit) => {
    const collisionSystem = collisionSystemRef.current;
    const result = collisionSystem.correctPosition(
      targetPosition, sourcePosition || state.knightPos,
      KNIGHT_SIZE,
      'knight', state.mapWidth
    );
    if(!doNotCommit)
    dispatch({
      type: 'SAFE_MOVE_TO',
      payload: result
    });

    // Traiter les triggers (contact automatique)
    if (result.interactions?.triggers) {
      result.interactions.triggers.forEach(({ entity }) => {
        if (entity.onContact) {
          entity.onContact(state, dispatch, collisionSystem);
        }
      });
    }

    return result;
  };
  const stopPoussee = () => {
    const entities = collisionSystemRef.current.getEntities();

    for (const [, entity] of entities) {
      if (
        entity.subtype === 'pushable' &&
        typeof entity.stopPushLoop === 'function' &&
        entity.isBeingPushed // ou autre flag défini par toi
      ) {
        entity.stopPushLoop();
        break; // On suppose qu'on ne pousse qu’un bloc à la fois
      }
    }
  };
const isOnGround = ()=>{
  return collisionSystemRef.current.isOnGround(state.knightPos)
}

  // Fonction d'interaction
  const interact = () => {
    if (state.nearbyInteractables.length > 0) {
      const entity = state.nearbyInteractables[0].entity;
      if (entity.onInteract) {
        entity.onInteract(state, dispatch, collisionSystemRef.current);
      }
    } else {
      dispatch({ type: 'SET_MESSAGE', payload: 'Rien à activer ici' });
    }
  };

  const value = {
    state,
    dispatch, getEntity,
    collisionSystem: collisionSystemRef.current,
    safeMoveTo, handleKnightAttack, restartLevel,
    interact, nextLevel, stopPoussee, isOnGround
    , toMainMenu
  };

  return <RPGContext.Provider value={value}>
    {children}
  </RPGContext.Provider>
}

export function useRPGContext() {
  return useContext(RPGContext);
}
