import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react'
import { buildRooms, ROOM_DEFINITIONS, CITY_GEO, BUILDING_ASSETS, BUILDING_TYPE_IMAGES, ITEM_TYPES, NPC_SPAWN_TEMPLATES, ROLES, RANDOM_ENCOUNTERS, getSpeedMultiplier, getInventoryRoom } from '../data/catalog'
import { pb, savePlayer, queuePlayerWrite, saveNpcLocation } from '../services/pb'

// ─── Couleurs et max des jauges (côté catalog, jamais en base) ────────────────

const JAUGE_COLORS = {
  forme:      '#984300',
  faim:       '#825100',
  reputation: '#944a23',
}

const JAUGE_MAX = { forme: 24, faim: 20, reputation: 20 }

// ─── Helpers inventaire ───────────────────────────────────────────────────────

function getMovementCost(state, position) {
  const parse = value => typeof value === 'string' && /^\d+,\d+$/.test(value) ? value.split(',').map(Number) : null
  const target = parse(position)
  const start = parse(state.player.location.position)
  const map = state.player.location.city ? state.city : state.world
  if (!target || !start || target[0] >= map.width || target[1] >= map.height) return null
  const distance = Math.abs(target[0] - start[0]) + Math.abs(target[1] - start[1])
  return Math.round(distance * getSpeedMultiplier(state.player.inventaire ?? []) * 10) / 100
}

function addInventoryItems(inventaire, typeId, qty) {
  const def = ITEM_TYPES[typeId]
  if (!def || !Number.isInteger(qty) || qty <= 0) return inventaire
  if (!def.stackable) return [...inventaire, { typeId, qty }]
  const added = Math.min(qty, getInventoryRoom(inventaire, typeId))
  if (!added) return inventaire
  if (inventaire.some(slot => slot.typeId === typeId)) {
    let remaining = added
    return inventaire.map(slot => {
      if (slot.typeId !== typeId || !remaining) return slot
      const result = { ...slot, qty: slot.qty + remaining }
      remaining = 0
      return result
    })
  }
  return [...inventaire, { typeId, qty: added }]
}

function removeOneFromSlots(inventaire, typeId) {
  const result = []
  let removed = false
  for (const slot of inventaire) {
    if (slot.typeId === typeId && !removed) {
      removed = true
      if (slot.qty > 1) result.push({ ...slot, qty: slot.qty - 1 })
    } else {
      result.push(slot)
    }
  }
  return result
}

// ─── Rencontre aléatoire ──────────────────────────────────────────────────────
// Retourne true si une rencontre a été déclenchée (combat lancé).

async function tryEncounter(zoneType, location, dispatch, pb, chance = 0.10) {
  if (Math.random() >= chance) return false
  const pool = RANDOM_ENCOUNTERS[zoneType]
  if (!pool?.length) return false
  const template = pool[Math.floor(Math.random() * pool.length)]
  try {
    const created = await pb.collection('kratNpcs').create({
      name:      template.name,
      role:      'Hostile',
      action:    'Attaquer',
      avatarUrl: template.avatarUrl ?? '',
      stats:     template.stats,
      hp:        { ...template.hp, loot: template.loot ?? {} },
      location,
      shop:      null,
      mission:   null,
    })
    const npc = normalizeNpc(created)
    dispatch({ type: 'SET_ACTIVE_PNJ',  pnj: [npc], encounterMessage: `Soudain, un ${template.name} vous agresse !` })
    dispatch({ type: 'NAVIGATE', view: 'combat' })
    return true
  } catch { return false }
}

// ─── Helpers DB ───────────────────────────────────────────────────────────────

export function isAliveNpc(n) {
  if (!n || n._type === 'player' || n.type === 'Joueur') return false
  try {
    const hp = typeof n.hp === 'string' ? JSON.parse(n.hp) : n.hp
    return (hp?.current ?? 20) > 0
  } catch { return false }
}

function normalizeNpc(n) {
  return {
    id:        n.id,
    name:      n.name,
    type:      'PNJ',
    _type:     'npc',
    role:      n.role      ?? '',
    action:    n.action    ?? 'Parler',
    avatarUrl: n.avatarUrl ?? '',
    stats:     n.stats     ?? { force: 5, intelligence: 5, charisme: 5 },
    hp:        n.hp        ?? { current: 20, max: 20 },
    location:  n.location  ?? {},
    shop:      n.shop      ?? null,
    mission:   n.mission   ?? null,
  }
}

function mergeJaugesColors(dbJauges) {
  const result = {}
  for (const key of Object.keys(JAUGE_MAX)) {
    result[key] = {
      current: dbJauges?.[key]?.current ?? JAUGE_MAX[key],
      max:     dbJauges?.[key]?.max     ?? JAUGE_MAX[key],
      color:   JAUGE_COLORS[key],
    }
  }
  return result
}

async function fetchBuilding(buildingId, roomId = 'entrance') {
  try {
    const recs = await pb.collection('kratBuildings').getFullList({ filter: `buildingId="${buildingId}"`, requestKey: null })
    if (!recs.length) return null
    const br = recs[0]
    let inhabitants = []
    try {
      const raw = await pb.collection('kratNpcs').getFullList({ filter: `location.building="${buildingId}"`, requestKey: null })
      inhabitants = raw.filter(n => !n.groupeChef && isAliveNpc(n))
    } catch { /* filtre JSON non supporté — skip */ }
    const assets = BUILDING_ASSETS[br.buildingId] ?? {}
    const rooms = buildRooms(br.roomConfig)
    if (br.type === 'mairie' && !rooms.find(r => r.id === 'prison')) {
      rooms.push(ROOM_DEFINITIONS.prison)
    }
    return {
      id:            br.buildingId,
      name:          br.name,
      type:          br.type,
      cityId:        br.cityId,
      ownerId:       br.ownerId   ?? null,
      roomConfig:    br.roomConfig,
      description:   assets.description  ?? '',
      roomImageUrl:  assets.roomImageUrl ?? BUILDING_TYPE_IMAGES[br.type] ?? null,
      rooms,
      currentRoomId: roomId,
      inhabitants:   inhabitants.map(normalizeNpc),
      roomItems:     [],
    }
  } catch { return null }
}

async function fetchCity(cityId) {
  try {
    const [cityRecs, bldgRecs] = await Promise.all([
      pb.collection('kratCities').getFullList({ filter: `cityId="${cityId}"`, requestKey: null }),
      pb.collection('kratBuildings').getFullList({ filter: `cityId="${cityId}"`, requestKey: null }),
    ])
    const cr  = cityRecs[0]
    const geo = CITY_GEO[cityId] ?? { width: 12, height: 8, exits: [] }
    return {
      id:           cityId,
      name:         cr?.name          ?? cityId,
      mayor:        cr?.mayor         ?? '',
      taxMultiplier: cr?.taxMultiplier ?? 1.0,
      budget:        cr?.budget        ?? 0,
      buildings: bldgRecs.map(b => ({ id: b.buildingId, position: b.position, type: b.type, ownerId: b.ownerId ?? null })),
      width:     geo.width,
      height:    geo.height,
      exits:     geo.exits,
    }
  } catch(e) {
    console.error('fetchCity error:', e)
    return null 
    }
}

// ─── État initial (skeleton — remplacé dès que le useEffect d'init tourne) ────

const FALLBACK_PLAYER = {
  id:        null,
  name:      '',
  gold:      0,
  avatarUrl: '',
  stats: {
    force:        5,
    intelligence: 5,
    charisme:     5,
    bonus:        { force: 0, intelligence: 0, charisme: 0 },
    competences:  {},
    pointsDivins: { current: 0, max: 20 },
  },
  jauges: {
    forme:      { current: 24, max: 24, color: JAUGE_COLORS.forme      },
    faim:       { current: 20, max: 20, color: JAUGE_COLORS.faim       },
    reputation: { current: 10, max: 20, color: JAUGE_COLORS.reputation },
  },
  location:      { position: null, city: 'haguenau', building: 'gilded-griffin', roomId: 'entrance' },
  inventaire:    [],
  lastLoginDate: null,
}

const initialState = {
  loading:       true,
  currentView:   'building',
  activePnj:     null,
  activeEnemies: [],
  groupe:        [],
  player: FALLBACK_PLAYER,

  world: {
    id:     'kratland',
    width:  25,
    height: 16,
    name:   'Terres de Kratland',
    king:   'Arthur',
    cities: [
      { id: 'haguenau',   position: '10,7' },
      { id: 'strasbourg', position: '14,8' },
      { id: 'paris',      position: '2,3'  },
      { id: 'washington', position: '12,12' },
    ],
    exits: [],
  },

  city:     { id: '', name: '', mayor: '', buildings: [], budget: 0, width: 12, height: 8, exits: [] },

  building: { id: '', name: '', type: '', roomConfig: '', ownerId: null, description: '', roomImageUrl: null,
               rooms: [], currentRoomId: 'entrance', inhabitants: [], roomItems: [] },

  combat: {
    enemy:            null,
    playerImageUrl:   '',
    arenaImageUrl:    '',
    log:              [],
    encounterMessage: null,
  },
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

function kratReducer(state, action) {
  switch (action.type) {

    case 'INIT':
      return {
        ...state,
        loading:     false,
        player:      action.player,
        currentView: action.currentView,
        city:        action.city     ?? state.city,
        building:    action.building ?? state.building,
        groupe:      action.groupe   ?? [],
      }

    case 'HIRE_NPC':
      return {
        ...state,
        groupe: [...state.groupe, action.npc],
        player: { ...state.player, gold: state.player.gold - action.cost },
      }

    case 'FIRE_NPC':
      return { ...state, groupe: state.groupe.filter(m => m.id !== action.npcId) }

    case 'SET_GROUPE':
      return { ...state, groupe: action.groupe }

    case 'SET_LOADING':
      return { ...state, loading: action.value }

    case 'SET_BUILDING':
      return { ...state, loading: false, building: action.building, currentView: 'building' }

    case 'SET_CITY':
      return { ...state, loading: false, city: action.city, currentView: 'city' }

    case 'SET_CITY_MAYOR':
      return { ...state, city: { ...state.city, mayor: action.mayor } }

    case 'SET_TAX_MULTIPLIER':
      return { ...state, city: { ...state.city, taxMultiplier: action.value } }

    case 'ADD_CITY_BUDGET':
      return { ...state, city: { ...state.city, budget: (state.city.budget ?? 0) + action.amount } }

    case 'ADD_CITY_BUILDING':
      return { ...state, city: { ...state.city, buildings: [...state.city.buildings, action.building] } }

    case 'NAVIGATE':
      return { ...state, currentView: action.view }

    case 'SELECT_ROOM':
      return {
        ...state,
        building: { ...state.building, currentRoomId: action.roomId },
        player:   { ...state.player, location: { ...state.player.location, roomId: action.roomId } },
      }

    case 'UPDATE_JAUGE': {
      const { jauge, current } = action
      return {
        ...state,
        player: {
          ...state.player,
          jauges: { ...state.player.jauges, [jauge]: { ...state.player.jauges[jauge], current } },
        },
      }
    }

    case 'UPDATE_STAT_BONUS': {
      const { stat, bonus } = action
      return {
        ...state,
        player: {
          ...state.player,
          stats: { ...state.player.stats, bonus: { ...state.player.stats.bonus, [stat]: bonus } },
        },
      }
    }

    case 'UPDATE_COMPETENCE': {
      const competences = { ...state.player.stats.competences }
      if (action.value === 0) delete competences[action.key]
      else competences[action.key] = action.value
      return {
        ...state,
        player: { ...state.player, stats: { ...state.player.stats, competences } },
      }
    }

    case 'BUY_ITEM': {
      const { itemKey, price, qty = 1 } = action
      const newInventaire = addInventoryItems(state.player.inventaire ?? [], itemKey, qty)
      return {
        ...state,
        player: { ...state.player, gold: state.player.gold - price, inventaire: newInventaire },
      }
    }

    case 'TRADE_ITEM':
      return { ...state, player: { ...state.player, gold: action.gold, inventaire: action.inventaire } }

    case 'SET_PLAYER_RESOURCES':
      return { ...state, player: { ...state.player, ...action.changes } }

    case 'SET_INVENTAIRE':
      return { ...state, player: { ...state.player, inventaire: action.inventaire } }

    case 'USE_ITEM':
      return { ...state, player: { ...state.player, inventaire: action.inventaire, jauges: action.jauges, gold: action.gold, stats: action.stats ?? state.player.stats } }

    case 'APPLY_EFFECTS': {
      const { gold = 0, forme = 0, faim = 0, reputation = 0, item = null, pointsDivins = 0 } = action
      const j     = state.player.jauges
      const clamp = (v, max) => Math.max(0, Math.min(max, v))
      let inventaire = state.player.inventaire ?? []
      if (item) inventaire = addInventoryItems(inventaire, item, 1)
      return {
        ...state,
        player: {
          ...state.player,
          gold: state.player.gold + gold,
          inventaire,
          stats: (() => {
            if (pointsDivins === 0) return state.player.stats
            const pd = state.player.stats.pointsDivins ?? { current: 0, max: 20 }
            return { ...state.player.stats, pointsDivins: { ...pd, current: Math.max(0, Math.min(pd.max, pd.current + pointsDivins)) } }
          })(),
          jauges: {
            ...j,
            forme:      { ...j.forme,      current: clamp(j.forme.current      + forme,      j.forme.max)      },
            faim:       { ...j.faim,       current: clamp(j.faim.current       + faim,       j.faim.max)       },
            reputation: { ...j.reputation, current: clamp(j.reputation.current + reputation, j.reputation.max) },
          },
        },
      }
    }

    case 'DO_WORK': {
      const { salary = 0, forme = 0, faim = 0, reputation = 0 } = action
      const j     = state.player.jauges
      const clamp = (v, max) => Math.max(0, Math.min(max, v))
      return {
        ...state,
        player: {
          ...state.player,
          gold: state.player.gold + salary,
          jauges: {
            ...j,
            forme:      { ...j.forme,      current: clamp(j.forme.current      + forme,      j.forme.max)      },
            faim:       { ...j.faim,       current: clamp(j.faim.current       + faim,       j.faim.max)       },
            reputation: { ...j.reputation, current: clamp(j.reputation.current + reputation, j.reputation.max) },
          },
        },
      }
    }

    case 'PLAYER_MOVE': {
      const { position, cost } = action
      const forme = state.player.jauges.forme
      return {
        ...state,
        player: {
          ...state.player,
          location: { ...state.player.location, position },
          jauges: {
            ...state.player.jauges,
            forme: { ...forme, current: Math.round((forme.current - cost) * 10) / 10 },
          },
        },
      }
    }
    case 'SET_ACTIVE_PNJ': {
      const list = Array.isArray(action.pnj) ? action.pnj : (action.pnj ? [action.pnj] : [])
      return {
        ...state,
        activePnj:    list[0] ?? null,
        activeEnemies: list,
        combat: { ...state.combat, encounterMessage: action.encounterMessage ?? null },
      }
    }

    case 'EXIT_BUILDING': {
      const b = state.city.buildings.find(b => b.id === state.building.id)
      return {
        ...state,
        currentView: 'city',
        player: {
          ...state.player,
          location: { position: b?.position ?? '0,0', city: state.city.id, building: null, roomId: null },
        },
      }
    }

    case 'ENTER_BUILDING': {
      const roomId = action.roomId ?? 'entrance'
      return {
        ...state,
        loading:     true,
        currentView: 'building',
        building: {
          ...state.building,
          id:            action.buildingId,
          currentRoomId: roomId,
          inhabitants:   [],
          roomItems:     [],
        },
        player: {
          ...state.player,
          location: { position: null, city: state.city?.id ?? '', building: action.buildingId, roomId },
        },
      }
    }

    case 'EXIT_TO_WORLD': {
      const c = state.world.cities.find(c => c.id === state.city.id)
      return {
        ...state,
        currentView: 'worldmap',
        player: {
          ...state.player,
          location: { position: c?.position ?? '0,0', city: null, building: null, roomId: null },
        },
      }
    }

    case 'ENTER_CITY': {
      const geo  = CITY_GEO[action.cityId] ?? { width: 12, height: 8, exits: [] }
      const city = { id: action.cityId, name: '', mayor: '', buildings: [], budget: 0, ...geo }
      return {
        ...state,
        loading:     true,
        currentView: 'city',
        city,
        player: {
          ...state.player,
          location: { position: geo.exits[0] ?? '0,0', city: action.cityId, building: null, roomId: null },
        },
      }
    }

    case 'COMBAT_LOG_APPEND':
      return { ...state, combat: { ...state.combat, log: [...state.combat.log, action.entry] } }

    case 'SET_PLAYER_STATS':
      return { ...state, player: { ...state.player, stats: action.stats } }

    case 'SET_AVATAR_URL':
      return { ...state, player: { ...state.player, avatarUrl: action.url } }

    default:
      return state
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const KratContext = createContext(null)

function saveLocation(pbId, location, jauges) {
  if (!pbId) return
  savePlayer(pbId, { location, jauges }).catch(() => {})
}

export function KratProvider({ children, pbId, onAuthError }) {
  const [state, reducerDispatch] = useReducer(kratReducer, initialState)
  const stateRef = useRef(state)
  stateRef.current = state
  function dispatch(action) {
    stateRef.current = kratReducer(stateRef.current, action)
    reducerDispatch(action)
  }

  // ── Chargement initial depuis PocketBase ───────────────────────────────────
  useEffect(() => {
    async function init() {
      if (!pbId) { dispatch({ type: 'SET_LOADING', value: false }); return }
      try {
        const pr = await pb.collection('kratPlayers').getOne(pbId, { requestKey: null })

        const location = pr.location ?? FALLBACK_PLAYER.location
        const jauges   = mergeJaugesColors(pr.jauges)

        const player = {
          id:            pr.playerId    ?? pr.id,
          name:          pr.name        ?? 'Inconnu',
          gold:          pr.gold        ?? 0,
          avatarUrl:     pr.avatarUrl   ?? '',
          stats: {
            ...(pr.stats ?? FALLBACK_PLAYER.stats),
            bonus:        pr.stats?.bonus        ?? { force: 0, intelligence: 0, charisme: 0 },
            competences:  pr.stats?.competences  ?? {},
            // Rétrocompat : ancienne position top-level → stats.pointsDivins
            pointsDivins: (() => {
              const pd = pr.stats?.pointsDivins ?? pr.pointsDivins
              return pd && typeof pd === 'object' ? pd : { current: 0, max: 20 }
            })(),
          },
          jauges,
          location,
          inventaire:    pr.inventaire    ?? [],
          lastLoginDate: pr.lastLoginDate ?? null,
        }

        let currentView = 'worldmap'
        let city        = null
        let building    = null

        if (location.building) {
          currentView = 'building'
          ;[city, building] = await Promise.all([
            fetchCity(location.city),
            fetchBuilding(location.building, location.roomId ?? 'entrance'),
          ])
        } else if (location.city) {
          currentView = 'city'
          city = await fetchCity(location.city)
        }

        let groupe = []
        try {
          const groupeNpcs = await pb.collection('kratNpcs').getFullList({
            filter: `groupeChef='${pr.id}'`, requestKey: null,
          })
          groupe = groupeNpcs.map(normalizeNpc)
        } catch { /* groupeChef field may not exist yet */ }

        dispatch({ type: 'INIT', player, city, building, currentView, groupe })
      } catch (e) {
        console.error('Kratland init error:', e)
        if (e?.status === 404 && onAuthError) { onAuthError(); return }
        dispatch({ type: 'SET_LOADING', value: false })
      }
    }
    init()
  }, [pbId])

  const playerTransactionRef = useRef(false)

  // ── Actions ────────────────────────────────────────────────────────────────

  function syncGroupLocation(location) {
    if (!stateRef.current.groupe.length) return
    const groupe = stateRef.current.groupe.map(member => {
      const loc = { ...location }
      saveNpcLocation(member.id, loc).catch(() => {})
      return { ...member, location: loc }
    })
    dispatch({ type: 'SET_GROUPE', groupe })
  }

  function arrestPlayer() {
    const snapshot = stateRef.current
    if (!snapshot.player.location.city) return false
    const mairie = snapshot.city.buildings.find(b => b.type === 'mairie')
    if (!mairie) return false
    const stats = { ...snapshot.player.stats, fugitive: false }
    dispatch({ type: 'SET_PLAYER_STATS', stats })
    dispatch({ type: 'ENTER_BUILDING', buildingId: mairie.id, roomId: 'prison' })
    const location = { position: null, city: snapshot.city.id, building: mairie.id, roomId: 'prison' }
    savePlayer(snapshot.player.id, { location, jauges: snapshot.player.jauges, stats }).catch(() => {})
    syncGroupLocation(location)
    fetchBuilding(mairie.id, 'prison').then(building => {
      if (building) dispatch({ type: 'SET_BUILDING', building })
      else dispatch({ type: 'SET_LOADING', value: false })
    })
    return true
  }

  const actions = {
    navigateTo: (view) => dispatch({ type: 'NAVIGATE', view }),

    selectRoom: (roomId) => {
      dispatch({ type: 'SELECT_ROOM', roomId })
      const loc = { ...stateRef.current.player.location, roomId }
      saveLocation(stateRef.current.player.id, loc, stateRef.current.player.jauges)
      syncGroupLocation(loc)
    },

    updateJauge:       (jauge, current) => dispatch({ type: 'UPDATE_JAUGE',       jauge, current }),
    updateStatBonus:   (stat, bonus)    => dispatch({ type: 'UPDATE_STAT_BONUS',   stat, bonus   }),
    updateCompetence:  (key, value)     => dispatch({ type: 'UPDATE_COMPETENCE',   key, value    }),
    appendCombatLog:   (entry)          => dispatch({ type: 'COMBAT_LOG_APPEND',   entry         }),
    startCombat: (pnj) => {
      if (playerTransactionRef.current) return
      const enemies = (Array.isArray(pnj) ? pnj : (pnj ? [pnj] : [])).filter(n => {
        if (!isAliveNpc(n)) return false
        let loc
        try { loc = typeof n.location === 'string' ? JSON.parse(n.location) : n.location } catch { return false }
        const here = stateRef.current.player.location
        if (!loc) return false
        return (loc.city || null) === (here.city || null)
          && (loc.building || null) === (here.building || null)
          && (!loc.roomId || loc.roomId === here.roomId)
          && (here.building || loc.position === here.position)
      })
      if (!enemies.length) return
      dispatch({ type: 'SET_ACTIVE_PNJ', pnj: enemies })
      dispatch({ type: 'NAVIGATE', view: 'combat' })
    },

    exitBattle: () => {
      dispatch({ type: 'SET_ACTIVE_PNJ', pnj: null })
      const loc  = stateRef.current.player.location
      const view = loc.building ? 'building' : loc.city ? 'city' : 'worldmap'
      dispatch({ type: 'NAVIGATE', view })
    },
    completeVictory: async (enemies) => {
      if (playerTransactionRef.current) throw new Error('Une action est déjà en cours.')
      playerTransactionRef.current = true
      const playerId = stateRef.current.player.id
      try {
        return await queuePlayerWrite(playerId, async () => {
          const defeated = []
          for (const enemy of enemies) {
            const record = await pb.collection('kratNpcs').getOne(enemy.id, { requestKey: null })
            if (isAliveNpc(record)) defeated.push(record)
          }
          if (!defeated.length) return { gold: 0, items: {}, count: 0 }
          let lootGold = 0
          const items = {}
          for (const enemy of defeated) {
            const hp = typeof enemy.hp === 'string' ? JSON.parse(enemy.hp) : enemy.hp
            for (const [key, qty] of Object.entries(hp?.loot ?? {})) {
              if (!Number.isInteger(qty) || qty <= 0) continue
              if (key === 'gold') lootGold += qty
              else if (ITEM_TYPES[key]) items[key] = (items[key] ?? 0) + qty
            }
          }
          const gold = Math.floor(Math.random() * 5) + defeated.length + lootGold
          const reward = { type: 'APPLY_EFFECTS', gold, reputation: 1 }
          const rewarded = kratReducer(stateRef.current, reward).player
          let inventaire = rewarded.inventaire ?? []
          for (const [key, qty] of Object.entries(items)) inventaire = addInventoryItems(inventaire, key, qty)
          const batch = pb.createBatch()
          for (const enemy of defeated) {
            const hp = typeof enemy.hp === 'string' ? JSON.parse(enemy.hp) : enemy.hp
            batch.collection('kratNpcs').update(enemy.id, { hp: { ...hp, current: 0, loot: {} } })
          }
          const changes = { gold: rewarded.gold, jauges: rewarded.jauges, inventaire }
          batch.collection('kratPlayers').update(playerId, changes)
          await batch.send({ requestKey: null })
          dispatch({ type: 'SET_PLAYER_RESOURCES', changes })
          return { gold, items, count: defeated.length }
        })
      } finally {
        playerTransactionRef.current = false
      }
    },

    collectLoot: (loot) => {
      if (playerTransactionRef.current) return
      // loot = { typeId: qty, ... } — le gold est déjà géré par applyEffects
      let inventaire = [...(stateRef.current.player.inventaire ?? [])]
      Object.entries(loot).forEach(([typeId, qty]) => {
        inventaire = addInventoryItems(inventaire, typeId, qty)
      })
      dispatch({ type: 'SET_INVENTAIRE', inventaire })
      savePlayer(stateRef.current.player.id, { inventaire }).catch(() => {})
    },

    dropItem: (typeId) => {
      if (playerTransactionRef.current) return
      const inventaire = removeOneFromSlots(stateRef.current.player.inventaire ?? [], typeId)
      dispatch({ type: 'SET_INVENTAIRE', inventaire })
      savePlayer(stateRef.current.player.id, { inventaire }).catch(() => {})
    },

    dropItems: (typeId, qty = 1) => {
      if (playerTransactionRef.current) return
      let inventaire = stateRef.current.player.inventaire ?? []
      for (let i = 0; i < qty; i++) inventaire = removeOneFromSlots(inventaire, typeId)
      dispatch({ type: 'SET_INVENTAIRE', inventaire })
      savePlayer(stateRef.current.player.id, { inventaire }).catch(() => {})
    },

    useItem: (typeId) => {
      if (playerTransactionRef.current) return
      const player = stateRef.current.player
      const def = ITEM_TYPES[typeId]
      if (!def || !(player.inventaire ?? []).some(s => s.typeId === typeId && s.qty > 0)) return
      const effects = def.effects ?? {}
      const clamp = (v, max) => Math.max(0, Math.min(max, v))
      const jauges = { ...player.jauges }
      for (const key of ['forme', 'faim', 'reputation']) {
        if (Number.isFinite(effects[key])) {
          jauges[key] = { ...jauges[key], current: clamp(jauges[key].current + effects[key], jauges[key].max) }
        }
      }
      let stats = { ...player.stats }
      if (effects.competence) {
        stats.competences = { ...stats.competences, [effects.competence]: 1 }
      }
      for (const key of ['force', 'intelligence', 'charisme', 'perception']) {
        if (Number.isFinite(effects[key])) stats[key] = (stats[key] ?? 0) + effects[key]
      }
      if (Number.isFinite(effects.pointsDivins)) {
        const pd = stats.pointsDivins ?? { current: 0, max: 20 }
        stats.pointsDivins = { ...pd, current: clamp(pd.current + effects.pointsDivins, pd.max) }
      }
      const gold = player.gold + (Number.isFinite(effects.gold) ? effects.gold : 0)
      const inventaire = removeOneFromSlots(player.inventaire ?? [], typeId)
      dispatch({ type: 'USE_ITEM', inventaire, jauges, gold, stats })
      savePlayer(player.id, { inventaire, jauges, gold, stats }).catch(() => {})
    },

    sellItem: (typeId) => {
      if (playerTransactionRef.current) return
      const def = ITEM_TYPES[typeId]
      if (!def?.prix) return
      const sellPrice  = Math.max(1, Math.floor(def.prix * 0.5))
      const newGold    = stateRef.current.player.gold + sellPrice
      const inventaire = removeOneFromSlots(stateRef.current.player.inventaire ?? [], typeId)
      dispatch({ type: 'TRADE_ITEM', inventaire, gold: newGold })
      savePlayer(stateRef.current.player.id, { inventaire, gold: newGold }).catch(() => {})
    },

    tradeItem: (typeIdToGet, tradeForTypeId, goldCost = 0) => {
      if (playerTransactionRef.current) return
      const inventaire = stateRef.current.player.inventaire ?? []
      if (!Number.isFinite(goldCost) || goldCost < 0 || stateRef.current.player.gold < goldCost) return false
      if (!inventaire.some(slot => slot.typeId === tradeForTypeId && slot.qty > 0)) return false
      let newInventaire = []
      let removed = false
      for (const slot of inventaire) {
        if (slot.typeId === tradeForTypeId && !removed) {
          if (slot.qty > 1) newInventaire.push({ ...slot, qty: slot.qty - 1 })
          removed = true
        } else {
          newInventaire.push(slot)
        }
      }
      if (getInventoryRoom(newInventaire, typeIdToGet) < 1) return false
      const getItemDef = ITEM_TYPES[typeIdToGet]
      const existing = newInventaire.find(i => i.typeId === typeIdToGet)
      if (getItemDef?.stackable && existing) {
        const max = getItemDef.maxStack ?? 99
        newInventaire = newInventaire.map(i =>
          i.typeId === typeIdToGet ? { ...i, qty: Math.min(i.qty + 1, max) } : i
        )
      } else {
        newInventaire.push({ typeId: typeIdToGet, qty: 1 })
      }
      const newGold = stateRef.current.player.gold - goldCost
      dispatch({ type: 'TRADE_ITEM', inventaire: newInventaire, gold: newGold })
      savePlayer(stateRef.current.player.id, { gold: newGold, inventaire: newInventaire }).catch(() => {})
      return true
    },

    buyItem: (itemKey, price, qty = 1) => {
      if (playerTransactionRef.current) return
      const itemDef = ITEM_TYPES[itemKey]
      const player = stateRef.current.player
      const actualQty = itemDef?.stackable ? qty : 1
      if (!itemDef || !Number.isFinite(price) || price < 0 || !Number.isInteger(actualQty) || actualQty <= 0) return false
      if (getInventoryRoom(player.inventaire ?? [], itemKey) < actualQty) return false
      const totalPrice = price * actualQty
      if (player.gold < totalPrice) return false
      dispatch({ type: 'BUY_ITEM', itemKey, price: totalPrice, qty: actualQty })
      const boughtPlayer = stateRef.current.player
      savePlayer(boughtPlayer.id, { gold: boughtPlayer.gold, inventaire: boughtPlayer.inventaire }).catch(() => {})

      // Fiscalité municipale : la part du prix catalogue au-delà de 1× (taxMultiplier du maire) revient au budget de la ville.
      // Calculée sur le prix catalogue, indépendamment d'un éventuel marchandage négocié par le joueur.
      const taxMultiplier = state.city?.taxMultiplier ?? 1
      if (taxMultiplier > 1 && itemDef?.prix) {
        const taxUnit    = Math.round(itemDef.prix * (taxMultiplier - 1))
        const taxRevenue = taxUnit * (itemDef.stackable ? qty : 1)
        if (taxRevenue > 0) actions.addCityBudget(taxRevenue)
      }
      return true
    },

    becomeMayor: () => {
      const mayorName = stateRef.current.player.name
      dispatch({ type: 'SET_CITY_MAYOR', mayor: mayorName })
      pb.collection('kratCities')
        .getFullList({ filter: `cityId="${state.city.id}"` })
        .then(recs => {
          if (recs.length) pb.collection('kratCities').update(recs[0].id, { mayor: mayorName }).catch(() => {})
        })
        .catch(() => {})
    },

    setTaxMultiplier: (value) => {
      dispatch({ type: 'SET_TAX_MULTIPLIER', value })
      pb.collection('kratCities')
        .getFullList({ filter: `cityId="${state.city.id}"` })
        .then(recs => {
          if (recs.length) pb.collection('kratCities').update(recs[0].id, { taxMultiplier: value }).catch(() => {})
        })
        .catch(() => {})
    },

    // Crédite le budget municipal (impôts sur ventes/salaires). Re-fetch le record pour limiter les écrasements concurrents.
    addCityBudget: (amount) => {
      const delta = Math.round(amount ?? 0)
      if (!delta || !state.city?.id) return
      dispatch({ type: 'ADD_CITY_BUDGET', amount: delta })
      pb.collection('kratCities')
        .getFullList({ filter: `cityId="${state.city.id}"` })
        .then(recs => {
          if (recs.length) {
            const rec = recs[0]
            pb.collection('kratCities').update(rec.id, { budget: (rec.budget ?? 0) + delta }).catch(() => {})
          }
        })
        .catch(() => {})
    },

    applyEffects: ({ gold = 0, forme = 0, faim = 0, reputation = 0, item = null, pointsDivins = 0 } = {}) => {
      if (playerTransactionRef.current) return
      if (![gold, forme, faim, reputation, pointsDivins].every(Number.isFinite)) return
      const effect = { type: 'APPLY_EFFECTS', gold, forme, faim, reputation, item, pointsDivins }
      dispatch(effect)
      const player = stateRef.current.player
      const update = { gold: player.gold, jauges: player.jauges }
      if (item) update.inventaire = player.inventaire
      if (pointsDivins !== 0) update.stats = player.stats
      return savePlayer(player.id, update).catch(() => {})
    },

    boostStat: (stat) => {
      if (!['force', 'intelligence', 'charisme'].includes(stat)) return
      const pd = stateRef.current.player.stats.pointsDivins ?? { current: 0, max: 20 }
      if (pd.current < 1) return
      const newPd    = { ...pd, current: pd.current - 1 }
      const newStats = { ...stateRef.current.player.stats, [stat]: (stateRef.current.player.stats[stat] ?? 0) + 1, pointsDivins: newPd }
      dispatch({ type: 'SET_PLAYER_STATS', stats: newStats })
      savePlayer(stateRef.current.player.id, { stats: newStats }).catch(() => {})
    },

    acquireCompetence: (key) => {
      const comp  = stateRef.current.player.stats.competences ?? {}
      const n     = Object.keys(comp).length
      const cost  = n === 0 ? 0 : n * n
      const pd    = stateRef.current.player.stats.pointsDivins ?? { current: 0, max: 20 }
      if (pd.current < cost) return
      const newPd    = { ...pd, current: pd.current - cost }
      const newStats = { ...stateRef.current.player.stats, competences: { ...comp, [key]: 1 }, pointsDivins: newPd }
      dispatch({ type: 'SET_PLAYER_STATS', stats: newStats })
      savePlayer(stateRef.current.player.id, { stats: newStats }).catch(() => {})
    },

    updateAvatar: (url) => {
      dispatch({ type: 'SET_AVATAR_URL', url })
      savePlayer(stateRef.current.player.id, { avatarUrl: url }).catch(() => {})
    },

    doWork: ({ salary = 0, forme = 0, faim = 0, reputation = 0 }) => {
      if (playerTransactionRef.current) return
      dispatch({ type: 'DO_WORK', salary, forme, faim, reputation })
      const player = stateRef.current.player
      savePlayer(player.id, { gold: player.gold, jauges: player.jauges }).catch(() => {})
    },

    hireNpc: (npc, cost) => {
      if (playerTransactionRef.current) return
      if (stateRef.current.player.gold < cost) return
      const memberLoc = { ...(npc.location ?? {}), position: stateRef.current.player.location.position }
      const npcWithLoc = { ...npc, location: memberLoc }
      dispatch({ type: 'HIRE_NPC', npc: npcWithLoc, cost })
      pb.collection('kratNpcs').update(npc.id, { groupeChef: stateRef.current.player.id, location: memberLoc }).catch(() => {})
      savePlayer(stateRef.current.player.id, { gold: stateRef.current.player.gold }).catch(() => {})
    },

    spawnNpc: async (template) => {
      if (playerTransactionRef.current) return 'busy'
      const cost = ROLES[template.role]?.cost ?? 0
      if (stateRef.current.player.gold < cost) return 'too_poor'
      const loc  = stateRef.current.player.location
      const data = {
        name:       template.name,
        role:       template.role,
        action:     template.action    ?? 'Suivre',
        avatarUrl:  template.avatarUrl ?? '',
        stats:      template.stats     ?? { force: 5, intelligence: 5, charisme: 5 },
        hp:         template.hp        ?? { current: 10, max: 10 },
        shop:       null,
        mission:    null,
        groupeChef: stateRef.current.player.id,
        location:   loc,
      }
      try {
        const created = await pb.collection('kratNpcs').create(data)
        const npc = normalizeNpc(created)
        dispatch({ type: 'HIRE_NPC', npc, cost })
        savePlayer(stateRef.current.player.id, { gold: stateRef.current.player.gold }).catch(() => {})
        return 'hired'
      } catch { return 'error' }
    },

    buildHouse: async () => {
      if (playerTransactionRef.current) return 'busy'
      const snapshot = stateRef.current
      const player = snapshot.player
      if (snapshot.currentView !== 'city' || !player.location.position) return 'invalid'
      playerTransactionRef.current = true
      const buildingId = `maison_${player.id}`
      const cityId = snapshot.city.id
      const position = player.location.position
      try {
        await queuePlayerWrite(player.id, async () => {
          const existing = await pb.collection('kratBuildings').getFullList({
            filter: pb.filter('buildingId = {:id}', { id: buildingId }), requestKey: null,
          })
          if (existing.length) throw new Error('Vous possédez déjà une maison.')
          const record = await pb.collection('kratPlayers').getOne(player.id, { requestKey: null })
          const inv = record.inventaire ?? []
          if ((inv.find(i => i.typeId === 'planche')?.qty ?? 0) < 10 || (inv.find(i => i.typeId === 'fer_brut')?.qty ?? 0) < 4) {
            throw new Error('Matériaux insuffisants.')
          }
          let inventaire = inv
          for (let i = 0; i < 10; i++) inventaire = removeOneFromSlots(inventaire, 'planche')
          for (let i = 0; i < 4; i++) inventaire = removeOneFromSlots(inventaire, 'fer_brut')
          const batch = pb.createBatch()
          // ID déterministe : deux demandes de construction ne peuvent pas créer deux maisons.
          batch.collection('kratBuildings').create({
            id: player.id, buildingId, type: 'maison', cityId, position,
            roomConfig: 'entrance_bed', name: `Maison de ${player.name}`, ownerId: player.id,
          })
          batch.collection('kratPlayers').update(player.id, { inventaire })
          await batch.send({ requestKey: null })
          dispatch({ type: 'SET_INVENTAIRE', inventaire })
        })
      } catch (error) {
        console.error('Construction impossible :', error)
        return 'error'
      } finally {
        playerTransactionRef.current = false
      }
      dispatch({ type: 'ADD_CITY_BUILDING', building: { id: buildingId, position, type: 'maison', ownerId: player.id } })
      const newLoc = { position: null, city: cityId, building: buildingId, roomId: 'entrance' }
      dispatch({ type: 'ENTER_BUILDING', buildingId })
      saveLocation(player.id, newLoc, stateRef.current.player.jauges)
      syncGroupLocation(newLoc)
      const bldg = await fetchBuilding(buildingId)
      if (bldg) dispatch({ type: 'SET_BUILDING', building: { ...bldg, ownerId: player.id } })
      else dispatch({ type: 'SET_LOADING', value: false })
      return 'built'
    },

    escapeFromPrison: (formeCost, goldCost = 0) => {
      const player = stateRef.current.player
      const forme = player.jauges.forme
      const newForme = Math.max(0, forme.current - formeCost)
      const newGold = player.gold + goldCost
      const newJauges = { ...player.jauges, forme: { ...forme, current: newForme } }
      const newLoc = { ...player.location, roomId: 'entrance' }
      const stats = { ...player.stats, fugitive: true }
      dispatch({ type: 'UPDATE_JAUGE', jauge: 'forme', current: newForme })
      if (goldCost !== 0) dispatch({ type: 'APPLY_EFFECTS', gold: goldCost })
      dispatch({ type: 'SET_PLAYER_STATS', stats })
      dispatch({ type: 'SELECT_ROOM', roomId: 'entrance' })
      savePlayer(player.id, { gold: newGold, jauges: newJauges, location: newLoc, stats }).catch(() => {})
      syncGroupLocation(newLoc)
    },

    checkForPolice: ({ discreet = false } = {}) => {
      const snapshot = stateRef.current
      const player = snapshot.player
      if (!player.stats.fugitive || player.jauges.reputation.current > 0 || !player.location.city) return false
      const comp = player.stats.competences ?? {}
      const exhausted = player.jauges.forme.current < player.jauges.forme.max / 4
      const chance = Math.max(0.03, 0.15 + (exhausted ? 0.05 : 0) - (comp.discretion ? 0.05 : 0) - (comp.survie ? 0.02 : 0)) * (discreet ? 0.5 : 1)
      return Math.random() < chance && arrestPlayer()
    },

    fireNpc: (npcId) => {
      dispatch({ type: 'FIRE_NPC', npcId })
      pb.collection('kratNpcs').update(npcId, { groupeChef: null, action:'Embaucher' }).catch(() => {})
    },

    movePlayer: (position, _cost, options = {}) => {
      if (playerTransactionRef.current) return false
      const snapshot = stateRef.current
      const retreat = options.retreat && snapshot.currentView === 'combat'
      const cost = getMovementCost(snapshot, position)
      if (cost === null || snapshot.player.location.building) return false
      const actualCost = retreat ? 0 : cost * (options.discreet ? 2 : 1)
      if (snapshot.player.jauges.forme.current < actualCost) return false
      dispatch({ type: 'PLAYER_MOVE', position, cost: actualCost })
      const player = stateRef.current.player
      saveLocation(player.id, player.location, player.jauges)
      syncGroupLocation(player.location)
      if (!retreat && cost > 0 && actions.checkForPolice(options)) return false
      if (!retreat && !options.transition) {
        const zoneType = player.location.city ? 'city' : 'worldmap'
        tryEncounter(zoneType, player.location, dispatch, pb, options.discreet ? 0.01 : 0.10)
      }
      return true
    },

    exitBuilding: async () => {
      dispatch({ type: 'EXIT_BUILDING' })
      const b      = state.city.buildings.find(b => b.id === state.building.id)
      const newLoc = { position: b?.position ?? '0,0', city: state.city.id, building: null, roomId: null }
      saveLocation(stateRef.current.player.id, newLoc, stateRef.current.player.jauges)
      syncGroupLocation(newLoc)
      if (actions.checkForPolice()) return
      const [encountered, city] = await Promise.all([
        tryEncounter('city', newLoc, dispatch, pb),
        fetchCity(state.city.id),
      ])
      if (city) dispatch({ type: 'SET_CITY', city })
      if (encountered) dispatch({ type: 'NAVIGATE', view: 'combat' })
    },

    enterBuilding: async (buildingId) => {
      const snapshot = stateRef.current
      const destination = snapshot.city.buildings.find(b => b.id === buildingId)
      if (snapshot.currentView !== 'city' || !destination) return false
      if (!actions.movePlayer(destination.position, undefined, { transition: true })) return false
      dispatch({ type: 'ENTER_BUILDING', buildingId })
      const newLoc = { position: null, city: state.city.id, building: buildingId, roomId: 'entrance' }
      saveLocation(stateRef.current.player.id, newLoc, stateRef.current.player.jauges)
      syncGroupLocation(newLoc)
      const [encountered, bldg] = await Promise.all([
        tryEncounter('city', newLoc, dispatch, pb),
        fetchBuilding(buildingId),
      ])
      if (bldg) dispatch({ type: 'SET_BUILDING', building: bldg })
      else      dispatch({ type: 'SET_LOADING', value: false })
      if (encountered) dispatch({ type: 'NAVIGATE', view: 'combat' })
    },

    exitToWorld: () => {
      if (playerTransactionRef.current) return false
      const snapshot = stateRef.current
      if (snapshot.currentView !== 'city' || !snapshot.city.exits.includes(snapshot.player.location.position)) return false
      dispatch({ type: 'EXIT_TO_WORLD' })
      const c      = state.world.cities.find(c => c.id === state.city.id)
      const newLoc = { position: c?.position ?? '0,0', city: null, building: null, roomId: null }
      saveLocation(stateRef.current.player.id, newLoc, stateRef.current.player.jauges)
      syncGroupLocation(newLoc)
      tryEncounter('worldmap', newLoc, dispatch, pb)
    },

    enterCity: async (cityId) => {
      const snapshot = stateRef.current
      const destination = snapshot.world.cities.find(c => c.id === cityId)
      if (snapshot.currentView !== 'worldmap' || !destination) return false
      if (!actions.movePlayer(destination.position, undefined, { transition: true })) return false
      dispatch({ type: 'ENTER_CITY', cityId })
      const geo    = CITY_GEO[cityId]
      const newLoc = { position: geo?.exits[0] ?? '0,0', city: cityId, building: null, roomId: null }
      saveLocation(stateRef.current.player.id, newLoc, stateRef.current.player.jauges)
      syncGroupLocation(newLoc)
      const [encountered, city] = await Promise.all([
        tryEncounter('worldmap', newLoc, dispatch, pb),
        fetchCity(cityId),
      ])
      if (city) dispatch({ type: 'SET_CITY', city })
      else      dispatch({ type: 'SET_LOADING', value: false })
      if (actions.checkForPolice()) return
      if (encountered) dispatch({ type: 'NAVIGATE', view: 'combat' })
    },
  }

  // ── Prison automatique si réputation ≤ 0 ─────────────────────────────────
  useEffect(() => {
    if (state.loading) return
    if (state.player.jauges.reputation.current > 0) return
    const loc = state.player.location
    const inPrison = state.building?.type === 'mairie' && loc.roomId === 'prison'
    if (inPrison) return
    if (state.player.stats.fugitive) return
    arrestPlayer()
  }, [state.player.jauges.reputation.current, state.loading])

  useEffect(() => {
    if (!state.player.stats.fugitive || state.player.jauges.reputation.current <= 0) return
    const stats = { ...stateRef.current.player.stats, fugitive: false }
    dispatch({ type: 'SET_PLAYER_STATS', stats })
    savePlayer(state.player.id, { stats }).catch(() => {})
  }, [state.player.jauges.reputation.current, state.player.stats.fugitive])

  return (
    <KratContext.Provider value={{ state, actions }}>
      {children}
    </KratContext.Provider>
  )
}

/** Hook d'accès au contexte Kratland */
export function useKrat() {
  const ctx = useContext(KratContext)
  if (!ctx) throw new Error("useKrat doit être utilisé à l'intérieur d'un KratProvider")
  return ctx
}

export default KratContext
