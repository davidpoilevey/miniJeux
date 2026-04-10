// GameReducer.js - Gestion de l'état global du jeu

export const INITIAL_STATE = {
  // État du joueur
  player: {
    health: 100,
    maxHealth: 100,
    mana: 50,
    maxMana: 50,
    x: 50,
    y: 200,
    velocityX: 0,
    velocityY: 0,
    direction: 'right', // 'left' ou 'right'
    isGrounded: false,
    isJumping: false,
    isInvincible: false,
    isDead: false,
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    stats: {
      attack: 10,
      defense: 5,
      speed: 5,
      magicPower: 10
    }
  },

  // Inventaire
  inventory: {
    items: [],
    maxSlots: 10,
    equippedWeapon: null,
    equippedArmor: null
  },

  // Sorts appris
  spells: {
    learned: [], // IDs des sorts appris
    equipped: [], // 4 slots de sorts équipés
    cooldowns: {} // { spellId: timestamp }
  },

  // État du niveau actuel
  currentLevel: {
    levelId: 'levelTuto',
    currentRoom: 'room-tuto',
    visitedRooms: ['room-tuto'],
    roomStates: {} // État des salles (ennemis tués, items ramassés, etc.)
  },

  // Entités actives dans la salle courante
  entities: {
    enemies: [],
    items: [],
    projectiles: [],
    effects: [],
  obstacles: [] 
  },

  // Combat
  combat: {
    active: false,
    target: null,
    playerTurn: true,
    timeline: []
  },

  // Interface
  ui: {
    dialogVisible: false,
    dialogText: '',
    dialogOptions: [],
    spellBookOpen: false,
    inventoryOpen: false,
    pauseMenuOpen: false,
    notification: null
  },

  // Contrôles
  controls: {
    moveLeft: false,
    moveRight: false,
    fly: false,
    attack: false,
    interact: false,
    castSpell: null // null ou 0-3 pour le slot
  },

  // Meta
  gameState: 'start', // 'start', 'playing', 'paused', 'combat', 'dialog', 'gameOver'
  time: 0
};

// Actions types
export const ACTIONS = {
  // Player
  MOVE_PLAYER: 'MOVE_PLAYER',
  UPDATE_PLAYER_POSITION: 'UPDATE_PLAYER_POSITION',
  UPDATE_PLAYER: 'UPDATE_PLAYER',
  PLAYER_JUMP: 'PLAYER_JUMP',
  PLAYER_LAND: 'PLAYER_LAND',
  UPDATE_PLAYER_VELOCITY: 'UPDATE_PLAYER_VELOCITY',
  DAMAGE_PLAYER: 'DAMAGE_PLAYER',
  HEAL_PLAYER: 'HEAL_PLAYER',
  USE_MANA: 'USE_MANA',
  RESTORE_MANA: 'RESTORE_MANA',
  PLAYER_DEATH: 'PLAYER_DEATH',
  GAIN_XP: 'GAIN_XP',
  LEVEL_UP: 'LEVEL_UP',

  // Inventory
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_ITEM: 'UPDATE_ITEM',
  USE_ITEM: 'USE_ITEM',
  EQUIP_WEAPON: 'EQUIP_WEAPON',
EQUIP_ARMOR: 'EQUIP_ARMOR',
UNEQUIP_WEAPON: 'UNEQUIP_WEAPON',
UNEQUIP_ARMOR: 'UNEQUIP_ARMOR',

  // Spells
  LEARN_SPELL: 'LEARN_SPELL',
  EQUIP_SPELL: 'EQUIP_SPELL',
  CAST_SPELL: 'CAST_SPELL',
  UPDATE_COOLDOWNS: 'UPDATE_COOLDOWNS',

  // Level/Room
  CHANGE_ROOM: 'CHANGE_ROOM',
  LOAD_ROOM: 'LOAD_ROOM',
  UPDATE_ROOM_STATE: 'UPDATE_ROOM_STATE',
  LOAD_SAVE: 'LOAD_SAVE',

  // Entities
  SPAWN_ENEMY: 'SPAWN_ENEMY',
  REMOVE_ENEMY: 'REMOVE_ENEMY',
  UPDATE_ENEMY: 'UPDATE_ENEMY',
  DAMAGE_ENEMY: 'DAMAGE_ENEMY',
  SPAWN_ITEM: 'SPAWN_ITEM',
  COLLECT_ITEM: 'COLLECT_ITEM',
  SPAWN_PROJECTILE: 'SPAWN_PROJECTILE',
  UPDATE_PROJECTILE: 'UPDATE_PROJECTILE',
  REMOVE_PROJECTILE: 'REMOVE_PROJECTILE',
  ADD_EFFECT: 'ADD_EFFECT',
  REMOVE_EFFECT: 'REMOVE_EFFECT',

  //Obstacles
  SPAWN_OBSTACLE: 'SPAWN_OBSTACLE',
UPDATE_OBSTACLE: 'UPDATE_OBSTACLE',
REMOVE_OBSTACLE: 'REMOVE_OBSTACLE',
DAMAGE_OBSTACLE: 'DAMAGE_OBSTACLE',

  // Combat
  START_COMBAT: 'START_COMBAT',
  END_COMBAT: 'END_COMBAT',
  NEXT_TURN: 'NEXT_TURN',

  // UI
  SHOW_DIALOG: 'SHOW_DIALOG',
  HIDE_DIALOG: 'HIDE_DIALOG',
  TOGGLE_SPELLBOOK: 'TOGGLE_SPELLBOOK',
  TOGGLE_INVENTORY: 'TOGGLE_INVENTORY',
  TOGGLE_PAUSE: 'TOGGLE_PAUSE',
  SHOW_NOTIFICATION: 'SHOW_NOTIFICATION',
  HIDE_NOTIFICATION: 'HIDE_NOTIFICATION',

  // Controls
  UPDATE_CONTROLS: 'UPDATE_CONTROLS',

  // Game state
  SET_GAME_STATE: 'SET_GAME_STATE',
  UPDATE_TIME: 'UPDATE_TIME',
  RESET_GAME: 'RESET_GAME'
};

export function gameReducer(state, action) {
  switch (action.type) {
case ACTIONS.LOAD_SAVE:
  return {
    ...state,
    player: action.payload.player || state.player,
    inventory: action.payload.inventory || state.inventory,
    spells: action.payload.spells || state.spells,
    currentLevel: action.payload.currentLevel || state.currentLevel
  };
    // ===== PLAYER ACTIONS =====
    case ACTIONS.UPDATE_PLAYER_POSITION:
      return {
        ...state,
        player: {
          ...state.player,
          x: action.payload.x ?? state.player.x,
          y: action.payload.y ?? state.player.y,
          direction: action.payload.direction ?? state.player.direction
        }
      };

    case ACTIONS.UPDATE_PLAYER_VELOCITY:
      return {
        ...state,
        player: {
          ...state.player,
          velocityX: action.payload.velocityX ?? state.player.velocityX,
          velocityY: action.payload.velocityY ?? state.player.velocityY
        }
      };

    case ACTIONS.PLAYER_JUMP:
      return {
        ...state,
        player: {
          ...state.player,
          isJumping: true,
          isGrounded: false,
          velocityY: -12 // Force du saut
        }
      };

    case ACTIONS.PLAYER_LAND:
      return {
        ...state,
        player: {
          ...state.player,
          isJumping: false,
          isGrounded: true,
          velocityY: 0
        }
      };

    case ACTIONS.DAMAGE_PLAYER:
      const newHealth = Math.max(0, state.player.health - action.payload.amount);
      return {
        ...state,
        player: {
          ...state.player,
          health: newHealth,
          isDead: newHealth === 0
        },
        gameState: newHealth === 0 ? 'gameOver' : state.gameState
      };

    case ACTIONS.HEAL_PLAYER:
      return {
        ...state,
        player: {
          ...state.player,
          health: Math.min(state.player.maxHealth, state.player.health + action.payload.amount)
        }
      };

    case ACTIONS.UPDATE_PLAYER:
      return {
        ...state,
        player: {
          ...state.player,
         ...action.payload
        }
      };

    case ACTIONS.USE_MANA:
      return {
        ...state,
        player: {
          ...state.player,
          mana: Math.max(0, state.player.mana - action.payload.amount)
        }
      };

    case ACTIONS.RESTORE_MANA:
      return {
        ...state,
        player: {
          ...state.player,
          mana: Math.min(state.player.maxMana, state.player.mana + action.payload.amount)
        }
      };

    case ACTIONS.GAIN_XP:
      const newXp = state.player.xp + action.payload.amount;
      const shouldLevelUp = newXp >= state.player.xpToNextLevel;
      
      if (shouldLevelUp) {
        return gameReducer(state, { type: ACTIONS.LEVEL_UP, payload: { xp: newXp } });
      }
      
      return {
        ...state,
        player: {
          ...state.player,
          xp: newXp
        }
      };

    case ACTIONS.LEVEL_UP:
      const level = state.player.level + 1;
      const remainingXp = action.payload.xp - state.player.xpToNextLevel;
      
      return {
        ...state,
        player: {
          ...state.player,
          level,
          xp: remainingXp,
          xpToNextLevel: Math.floor(state.player.xpToNextLevel * 1.5),
          maxHealth: state.player.maxHealth + 20,
          health: state.player.maxHealth + 20,
          maxMana: state.player.maxMana + 10,
          mana: state.player.maxMana + 10,
          stats: {
            attack: state.player.stats.attack + 2,
            defense: state.player.stats.defense + 1,
            speed: state.player.stats.speed + 1,
            magicPower: state.player.stats.magicPower + 2
          }
        },
        ui: {
          ...state.ui,
          notification: {
            type: 'level-up',
            message: `Niveau ${level} atteint !`
          }
        }
      };
case ACTIONS.SPAWN_OBSTACLE:
  return {
    ...state,
    entities: {
      ...state.entities,
      obstacles: [...state.entities.obstacles, action.payload.obstacle]
    }
  };

case ACTIONS.UPDATE_OBSTACLE:
  return {
    ...state,
    entities: {
      ...state.entities,
      obstacles: state.entities.obstacles.map(obstacle =>
        obstacle.id === action.payload.obstacleId
          ? { ...obstacle, ...action.payload.updates }
          : obstacle
      )
    }
  };

case ACTIONS.REMOVE_OBSTACLE:
  return {
    ...state,
    entities: {
      ...state.entities,
      obstacles: state.entities.obstacles.filter(o => o.id !== action.payload.obstacleId)
    }
  };

case ACTIONS.DAMAGE_OBSTACLE:
  const updatedObstacles = state.entities.obstacles.map(obstacle => {
    if (obstacle.id === action.payload.obstacleId && obstacle.destructible) {
      const newHealth = obstacle.health - action.payload.amount;
      return {
        ...obstacle,
        health: Math.max(0, newHealth),
        isDestroyed: newHealth <= 0
      };
    }
    return obstacle;
  });

  return {
    ...state,
    entities: {
      ...state.entities,
      obstacles: updatedObstacles
    }
  };
    // ===== INVENTORY ACTIONS =====
    case ACTIONS.ADD_ITEM:
      const existingItemIndex = state.inventory.items.findIndex(
        item => item.id === action.payload.itemId && item.stackable
      );

      if (existingItemIndex !== -1) {
        const updatedItems = [...state.inventory.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + (action.payload.quantity || 1)
        };
        
        return {
          ...state,
          inventory: {
            ...state.inventory,
            items: updatedItems
          }
        };
      }

      if (state.inventory.items.length >= state.inventory.maxSlots) {
        return {
          ...state,
          ui: {
            ...state.ui,
            notification: {
              type: 'error',
              message: 'Inventaire plein !'
            }
          }
        };
      }

      return {
        ...state,
        inventory: {
          ...state.inventory,
          items: [
            ...state.inventory.items,
            {
              id: action.payload.itemId,
              quantity: action.payload.quantity || 1,
              ...action.payload.itemData
            }
          ]
        }
      };
case ACTIONS.UPDATE_ITEM:
  return {
    ...state,
    entities: {
      ...state.entities,
      items: state.entities.items.map(item =>
        item.id === action.payload.itemId
          ? { ...item, ...action.payload.updates }
          : item
      )
    }
  };
    case ACTIONS.REMOVE_ITEM:
      return {
        ...state,
        inventory: {
          ...state.inventory,
          items: state.inventory.items.filter((_, index) => index !== action.payload.index)
        }
      };

    case ACTIONS.USE_ITEM:
      // Logique d'utilisation d'item (potions, etc.)
      const item = state.inventory.items[action.payload.index];
      let newState = { ...state };

      if (item.effect?.type === 'heal') {
        newState = gameReducer(newState, {
          type: ACTIONS.HEAL_PLAYER,
          payload: { amount: item.effect.amount }
        });
      } else if (item.effect?.type === 'mana') {
        newState = gameReducer(newState, {
          type: ACTIONS.RESTORE_MANA,
          payload: { amount: item.effect.amount }
        });
      }

      // Retirer l'item de l'inventaire
      const updatedItems = [...newState.inventory.items];
      if (item.quantity > 1) {
        updatedItems[action.payload.index] = {
          ...item,
          quantity: item.quantity - 1
        };
      } else {
        updatedItems.splice(action.payload.index, 1);
      }

      return {
        ...newState,
        inventory: {
          ...newState.inventory,
          items: updatedItems
        }
      };
// Combat
case ACTIONS.EQUIP_WEAPON:
  // Si une arme était déjà équipée, la remettre dans l'inventaire
  const newItemsWithOldWeapon = state.inventory.equippedWeapon
    ? [...state.inventory.items, state.inventory.equippedWeapon]
    : state.inventory.items;
  
  // Retirer la nouvelle arme de l'inventaire
  const itemsAfterWeaponEquip = newItemsWithOldWeapon.filter((_, i) => 
    i !== action.payload.fromIndex + (state.inventory.equippedWeapon ? 1 : 0)
  );

  return {
    ...state,
    inventory: {
      ...state.inventory,
      items: itemsAfterWeaponEquip,
      equippedWeapon: action.payload.weapon
    },
    player: {
      ...state.player,
      stats: {
        ...state.player.stats,
        attack: state.player.stats.attack + (action.payload.weapon.stats.attack || 0),
        speed: state.player.stats.speed + (action.payload.weapon.stats.speed || 0)
      }
    }
  };

case ACTIONS.EQUIP_ARMOR:
  const newItemsWithOldArmor = state.inventory.equippedArmor
    ? [...state.inventory.items, state.inventory.equippedArmor]
    : state.inventory.items;
  
  const itemsAfterArmorEquip = newItemsWithOldArmor.filter((_, i) => 
    i !== action.payload.fromIndex + (state.inventory.equippedArmor ? 1 : 0)
  );

  return {
    ...state,
    inventory: {
      ...state.inventory,
      items: itemsAfterArmorEquip,
      equippedArmor: action.payload.armor
    },
    player: {
      ...state.player,
      stats: {
        ...state.player.stats,
        defense: state.player.stats.defense + (action.payload.armor.stats.defense || 0),
        speed: state.player.stats.speed + (action.payload.armor.stats.speed || 0)
      }
    }
  };
    // ===== SPELLS ACTIONS =====
    case ACTIONS.LEARN_SPELL:
      if (state.spells.learned.includes(action.payload.spellId)) {
        return state;
      }

      return {
        ...state,
        spells: {
          ...state.spells,
          learned: [...state.spells.learned, action.payload.spellId]
        },
        ui: {
          ...state.ui,
          notification: {
            type: 'spell-learned',
            message: `Nouveau sort appris : ${action.payload.spellName}`
          }
        }
      };

    case ACTIONS.EQUIP_SPELL:
      const equipped = [...state.spells.equipped];
      equipped[action.payload.slot] = action.payload.spellId;

      return {
        ...state,
        spells: {
          ...state.spells,
          equipped
        }
      };

    case ACTIONS.CAST_SPELL:
      return {
        ...state,
        spells: {
          ...state.spells,
          cooldowns: {
            ...state.spells.cooldowns,
            [action.payload.spellId]: Date.now() + action.payload.cooldown
          }
        }
      };

    case ACTIONS.UPDATE_COOLDOWNS:
      const now = Date.now();
      const updatedCooldowns = Object.keys(state.spells.cooldowns).reduce((acc, spellId) => {
        if (state.spells.cooldowns[spellId] > now) {
          acc[spellId] = state.spells.cooldowns[spellId];
        }
        return acc;
      }, {});

      return {
        ...state,
        spells: {
          ...state.spells,
          cooldowns: updatedCooldowns
        }
      };

    // ===== ROOM/LEVEL ACTIONS =====
    case ACTIONS.CHANGE_ROOM:
      return {
        ...state,
        currentLevel: {
          ...state.currentLevel,
          currentRoom: action.payload.roomId,
          visitedRooms: state.currentLevel.visitedRooms.includes(action.payload.roomId)
            ? state.currentLevel.visitedRooms
            : [...state.currentLevel.visitedRooms, action.payload.roomId]
        },
        player: {
          ...state.player,
          x: action.payload.playerX,
          y: action.payload.playerY
        },
        entities: {
          enemies: [],
          items: [],
          projectiles: [],
          obstacles:[],
          effects: []
        }
      };

    case ACTIONS.LOAD_ROOM:
      return {
        ...state,
        
        player: {
          ...state.player,
          x: action.payload.playerPosition?.x??state.player.x,
          y: action.payload.playerPosition?.y??state.player.x
        },
        entities: {
          ...state.entities,
          enemies: action.payload.enemies || [],
          items: action.payload.items || [],
          obstacles: action.payload.obstacles || []
        }
      };

    case ACTIONS.UPDATE_ROOM_STATE:
      return {
        ...state,
        currentLevel: {
          ...state.currentLevel,
          roomStates: {
            ...state.currentLevel.roomStates,
            [action.payload.roomId]: {
              ...state.currentLevel.roomStates[action.payload.roomId],
              ...action.payload.state
            }
          }
        }
      };

    // ===== ENTITIES ACTIONS =====
    case ACTIONS.SPAWN_ENEMY:
      return {
        ...state,
        entities: {
          ...state.entities,
          enemies: [...state.entities.enemies,{
        ...action.payload.enemy,
        velocityY: 0,  // ← Ajoute ça
        isGrounded: false
      }]
        }
      };

    case ACTIONS.REMOVE_ENEMY:
      return {
        ...state,
        entities: {
          ...state.entities,
          enemies: state.entities.enemies.filter(e => e.id !== action.payload.enemyId)
        }
      };

    case ACTIONS.UPDATE_ENEMY:
      return {
        ...state,
        entities: {
          ...state.entities,
          enemies: state.entities.enemies.map(enemy =>
            enemy.id === action.payload.enemyId
              ? { ...enemy, ...action.payload.updates }
              : enemy
          )
        }
      };

    case ACTIONS.DAMAGE_ENEMY:
      const updatedEnemies = state.entities.enemies.map(enemy => {
        if (enemy.id === action.payload.enemyId) {
          const newEnemyHealth = Math.max(0, enemy.health - action.payload.amount);
          return {
            ...enemy,
            health: newEnemyHealth,
            isDead: newEnemyHealth === 0
          };
        }
        return enemy;
      });

      return {
        ...state,
        entities: {
          ...state.entities,
          enemies: updatedEnemies
        }
      };
case ACTIONS.ADD_EFFECT:
  return {
    ...state,
    entities: {
      ...state.entities,
      effects: [
        ...state.entities.effects,
        { ...action.payload.effect, createdAt: Date.now() }
      ]
    }
  };
    case ACTIONS.SPAWN_PROJECTILE:
      return {
        ...state,
        entities: {
          ...state.entities,
          projectiles: [...state.entities.projectiles, action.payload.projectile]
        }
      };

    case ACTIONS.UPDATE_PROJECTILE:
      return {
        ...state,
        entities: {
          ...state.entities,
          projectiles: state.entities.projectiles.map(proj =>
            proj.id === action.payload.projectileId
              ? { ...proj, ...action.payload.updates }
              : proj
          )
        }
      };

    case ACTIONS.REMOVE_PROJECTILE:
      return {
        ...state,
        entities: {
          ...state.entities,
          projectiles: state.entities.projectiles.filter(p => p.id !== action.payload.projectileId)
        }
      };

    case ACTIONS.COLLECT_ITEM:
      return {
        ...state,
        entities: {
          ...state.entities,
          items: state.entities.items.filter(item => item.id !== action.payload.itemId)
        }
      };

    // ===== UI ACTIONS =====
    case ACTIONS.SHOW_DIALOG:
      return {
        ...state,
        ui: {
          ...state.ui,
          dialogVisible: true,
          dialogText: action.payload.text,
          dialogOptions: action.payload.options || []
        },
        gameState: 'dialog'
      };

    case ACTIONS.HIDE_DIALOG:
      return {
        ...state,
        ui: {
          ...state.ui,
          dialogVisible: false,
          dialogText: '',
          dialogOptions: []
        },
        gameState: 'playing'
      };

    case ACTIONS.TOGGLE_SPELLBOOK:
      return {
        ...state,
        ui: {
          ...state.ui,
          spellBookOpen: !state.ui.spellBookOpen
        },
        gameState: state.ui.spellBookOpen ? 'playing' : 'paused'
      };

    case ACTIONS.TOGGLE_INVENTORY:
      return {
        ...state,
        ui: {
          ...state.ui,
          inventoryOpen: !state.ui.inventoryOpen
        },
        gameState: state.ui.inventoryOpen ? 'playing' : 'paused'
      };

    case ACTIONS.SHOW_NOTIFICATION:
      return {
        ...state,
        ui: {
          ...state.ui,
          notification: action.payload
        }
      };

    case ACTIONS.HIDE_NOTIFICATION:
      return {
        ...state,
        ui: {
          ...state.ui,
          notification: null
        }
      };

    // ===== CONTROLS =====
    case ACTIONS.UPDATE_CONTROLS:
      return {
        ...state,
        controls: {
          ...state.controls,
          ...action.payload
        }
      };

    // ===== GAME STATE =====
    case ACTIONS.SET_GAME_STATE:
      return {
        ...state,
        gameState: action.payload.state
      };

    case ACTIONS.UPDATE_TIME:
      return {
        ...state,
        time: state.time + action.payload.delta
      };

    case ACTIONS.RESET_GAME:
      return INITIAL_STATE;

    default:
      return state;
  }
}