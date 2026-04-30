import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { buildRooms, CITY_GEO, BUILDING_ASSETS, BUILDING_TYPE_IMAGES, ITEM_TYPES } from '../data/catalog'
import { pb } from '../services/pb'

// ─── Couleurs et max des jauges (côté catalog, jamais en base) ────────────────

const JAUGE_COLORS = {
  forme:      '#984300',
  faim:       '#825100',
  reputation: '#944a23',
}

const JAUGE_MAX = { forme: 24, faim: 20, reputation: 20 }

// ─── Helpers DB ───────────────────────────────────────────────────────────────

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
      inhabitants = await pb.collection('kratNpcs').getFullList({ filter: `location.building="${buildingId}"`, requestKey: null })
    } catch { /* filtre JSON non supporté — skip */ }
    const assets = BUILDING_ASSETS[br.buildingId] ?? {}
    return {
      id:            br.buildingId,
      name:          br.name,
      type:          br.type,
      cityId:        br.cityId,
      roomConfig:    br.roomConfig,
      description:   assets.description  ?? '',
      roomImageUrl:  assets.roomImageUrl ?? BUILDING_TYPE_IMAGES[br.type] ?? null,
      rooms:         buildRooms(br.roomConfig),
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
      buildings: bldgRecs.map(b => ({ id: b.buildingId, position: b.position, type: b.type })),
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

  city:     { id: '', name: '', mayor: '', buildings: [], width: 12, height: 8, exits: [] },

  building: { id: '', name: '', type: '', roomConfig: '', description: '', roomImageUrl: null,
               rooms: [], currentRoomId: 'entrance', inhabitants: [], roomItems: [] },

  combat: {
    enemy:          null,
    playerImageUrl: '',
    arenaImageUrl:  '',
    log:            [],
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
      const { itemKey, price } = action
      const itemDef    = ITEM_TYPES[itemKey]
      const inventaire = state.player.inventaire ?? []
      const existing   = inventaire.find(i => i.typeId === itemKey)
      let newInventaire
      if (itemDef?.stackable && existing) {
        const max = itemDef.maxStack ?? 99
        newInventaire = inventaire.map(i =>
          i.typeId === itemKey ? { ...i, qty: Math.min(i.qty + 1, max) } : i
        )
      } else {
        newInventaire = [...inventaire, { typeId: itemKey, qty: 1 }]
      }
      return {
        ...state,
        player: { ...state.player, gold: state.player.gold - price, inventaire: newInventaire },
      }
    }

    case 'TRADE_ITEM':
      return { ...state, player: { ...state.player, gold: action.gold, inventaire: action.inventaire } }

    case 'SET_INVENTAIRE':
      return { ...state, player: { ...state.player, inventaire: action.inventaire } }

    case 'APPLY_EFFECTS': {
      const { gold = 0, forme = 0, faim = 0, reputation = 0, item = null, pointsDivins = 0 } = action
      const j     = state.player.jauges
      const clamp = (v, max) => Math.max(0, Math.min(max, v))
      let inventaire = state.player.inventaire ?? []
      if (item) {
        const itemDef  = ITEM_TYPES[item]
        const existing = inventaire.find(i => i.typeId === item)
        if (itemDef?.stackable && existing) {
          const max = itemDef.maxStack ?? 99
          inventaire = inventaire.map(i => i.typeId === item ? { ...i, qty: Math.min(i.qty + 1, max) } : i)
        } else {
          inventaire = [...inventaire, { typeId: item, qty: 1 }]
        }
      }
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
      return { ...state, activePnj: list[0] ?? null, activeEnemies: list }
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
      const city = { id: action.cityId, name: '', mayor: '', buildings: [], ...geo }
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
  pb.collection('kratPlayers').update(pbId, { location, jauges }).catch(() => {})
}

export function KratProvider({ children, pbId, onAuthError }) {
  const [state, dispatch] = useReducer(kratReducer, initialState)

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

  // ── Actions ────────────────────────────────────────────────────────────────

  const actions = {
    navigateTo: (view) => dispatch({ type: 'NAVIGATE', view }),

    selectRoom: (roomId) => {
      dispatch({ type: 'SELECT_ROOM', roomId })
      const loc = { ...state.player.location, roomId }
      saveLocation(state.player.id, loc, state.player.jauges)
    },

    updateJauge:       (jauge, current) => dispatch({ type: 'UPDATE_JAUGE',       jauge, current }),
    updateStatBonus:   (stat, bonus)    => dispatch({ type: 'UPDATE_STAT_BONUS',   stat, bonus   }),
    updateCompetence:  (key, value)     => dispatch({ type: 'UPDATE_COMPETENCE',   key, value    }),
    appendCombatLog:   (entry)          => dispatch({ type: 'COMBAT_LOG_APPEND',   entry         }),
    startCombat: (pnj) => {
      const enemies = Array.isArray(pnj) ? pnj : (pnj ? [pnj] : [])
      dispatch({ type: 'SET_ACTIVE_PNJ', pnj: enemies })
      dispatch({ type: 'NAVIGATE', view: 'combat' })
    },

    exitBattle: () => {
      dispatch({ type: 'SET_ACTIVE_PNJ', pnj: null })
      const loc  = state.player.location
      const view = loc.building ? 'building' : loc.city ? 'city' : 'worldmap'
      dispatch({ type: 'NAVIGATE', view })
    },
    collectLoot: (loot) => {
      // loot = { typeId: qty, ... } — le gold est déjà géré par applyEffects
      let inventaire = [...(state.player.inventaire ?? [])]
      Object.entries(loot).forEach(([typeId, qty]) => {
        const itemDef = ITEM_TYPES[typeId]
        if (!itemDef || qty <= 0) return
        const existing = inventaire.find(s => s.typeId === typeId)
        if (itemDef.stackable && existing) {
          const max = itemDef.maxStack ?? 99
          inventaire = inventaire.map(s =>
            s.typeId === typeId ? { ...s, qty: Math.min(s.qty + qty, max) } : s
          )
        } else {
          inventaire.push({ typeId, qty })
        }
      })
      dispatch({ type: 'SET_INVENTAIRE', inventaire })
      pb.collection('kratPlayers').update(state.player.id, { inventaire }).catch(() => {})
    },

    tradeItem: (typeIdToGet, tradeForTypeId, goldCost = 0) => {
      const inventaire = state.player.inventaire ?? []
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
      const newGold = state.player.gold - goldCost
      dispatch({ type: 'TRADE_ITEM', inventaire: newInventaire, gold: newGold })
      pb.collection('kratPlayers').update(state.player.id, { gold: newGold, inventaire: newInventaire }).catch(() => {})
    },

    buyItem: (itemKey, price) => {
      const itemDef    = ITEM_TYPES[itemKey]
      const inventaire = state.player.inventaire ?? []
      const existing   = inventaire.find(i => i.typeId === itemKey)
      let newInventaire
      if (itemDef?.stackable && existing) {
        const max = itemDef.maxStack ?? 99
        newInventaire = inventaire.map(i =>
          i.typeId === itemKey ? { ...i, qty: Math.min(i.qty + 1, max) } : i
        )
      } else {
        newInventaire = [...inventaire, { typeId: itemKey, qty: 1 }]
      }
      dispatch({ type: 'BUY_ITEM', itemKey, price })
      pb.collection('kratPlayers').update(state.player.id, {
        gold:      state.player.gold - price,
        inventaire: newInventaire,
      }).catch(() => {})
    },

    becomeMayor: () => {
      const mayorName = state.player.name
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

    applyEffects: ({ gold = 0, forme = 0, faim = 0, reputation = 0, item = null, pointsDivins = 0 } = {}) => {
      dispatch({ type: 'APPLY_EFFECTS', gold, forme, faim, reputation, item, pointsDivins })
      const j     = state.player.jauges
      const clamp = (v, max) => Math.max(0, Math.min(max, v))
      const newGold   = state.player.gold + gold
      const newJauges = {
        ...j,
        forme:      { ...j.forme,      current: clamp(j.forme.current      + forme,      j.forme.max)      },
        faim:       { ...j.faim,       current: clamp(j.faim.current       + faim,       j.faim.max)       },
        reputation: { ...j.reputation, current: clamp(j.reputation.current + reputation, j.reputation.max) },
      }
      const update = { gold: newGold, jauges: newJauges }
      if (item) {
        const inventaire = state.player.inventaire ?? []
        const itemDef    = ITEM_TYPES[item]
        const existing   = inventaire.find(i => i.typeId === item)
        update.inventaire = itemDef?.stackable && existing
          ? inventaire.map(i => i.typeId === item ? { ...i, qty: i.qty + 1 } : i)
          : [...inventaire, { typeId: item, qty: 1 }]
      }
      if (pointsDivins !== 0) {
        const pd = state.player.stats.pointsDivins ?? { current: 0, max: 20 }
        const newPd = { ...pd, current: Math.max(0, Math.min(pd.max, pd.current + pointsDivins)) }
        update.stats = { ...state.player.stats, pointsDivins: newPd }
      }
      pb.collection('kratPlayers').update(state.player.id, update).catch(() => {})
    },

    boostStat: (stat) => {
      const pd = state.player.stats.pointsDivins ?? { current: 0, max: 20 }
      if (pd.current < 1) return
      const newPd    = { ...pd, current: pd.current - state.player.stats[stat] }
      const newStats = { ...state.player.stats, [stat]: (state.player.stats[stat] ?? 0) + 1, pointsDivins: newPd }
      dispatch({ type: 'SET_PLAYER_STATS', stats: newStats })
      pb.collection('kratPlayers').update(state.player.id, { stats: newStats }).catch(() => {})
    },

    acquireCompetence: (key) => {
      const comp  = state.player.stats.competences ?? {}
      const n     = Object.keys(comp).length
      const cost  = n === 0 ? 0 : n * n
      const pd    = state.player.stats.pointsDivins ?? { current: 0, max: 20 }
      if (pd.current < cost) return
      const newPd    = { ...pd, current: pd.current - cost }
      const newStats = { ...state.player.stats, competences: { ...comp, [key]: 1 }, pointsDivins: newPd }
      dispatch({ type: 'SET_PLAYER_STATS', stats: newStats })
      pb.collection('kratPlayers').update(state.player.id, { stats: newStats }).catch(() => {})
    },

    updateAvatar: (url) => {
      dispatch({ type: 'SET_AVATAR_URL', url })
      pb.collection('kratPlayers').update(state.player.id, { avatarUrl: url }).catch(() => {})
    },

    doWork: (act) => {
      const { salary = 0, forme = 0, faim = 0, reputation = 0 } = act
      dispatch({ type: 'DO_WORK', salary, forme, faim, reputation })
      const j     = state.player.jauges
      const clamp = (v, max) => Math.max(0, Math.min(max, v))
      const newJauges = {
        ...j,
        forme:      { ...j.forme,      current: clamp(j.forme.current      + forme,      j.forme.max)      },
        faim:       { ...j.faim,       current: clamp(j.faim.current       + faim,       j.faim.max)       },
        reputation: { ...j.reputation, current: clamp(j.reputation.current + reputation, j.reputation.max) },
      }
      pb.collection('kratPlayers').update(state.player.id, { gold: state.player.gold + salary, jauges: newJauges }).catch(() => {})
    },

    hireNpc: (npc, cost) => {
      if (state.player.gold < cost) return
      const memberLoc = { ...(npc.location ?? {}), position: state.player.location.position }
      const npcWithLoc = { ...npc, location: memberLoc }
      dispatch({ type: 'HIRE_NPC', npc: npcWithLoc, cost })
      pb.collection('kratNpcs').update(npc.id, { groupeChef: state.player.id, location: memberLoc }).catch(() => {})
      pb.collection('kratPlayers').update(state.player.id, { gold: state.player.gold - cost }).catch(() => {})
    },

    spawnNpc: async (template) => {
      const loc = state.player.location
      const data = {
        name:      template.name,
        role:      template.role,
        action:    template.action    ?? 'Embaucher',
        avatarUrl: template.avatarUrl ?? '',
        stats:     template.stats     ?? { force: 5, intelligence: 5, charisme: 5 },
        hp:        template.hp        ?? { current: 10, max: 10 },
        shop:      null,
        mission:   null,
        groupeChef: state.player.id,
        location:  loc,
      }
      try {
        const created = await pb.collection('kratNpcs').create(data)
        const npc = normalizeNpc(created)
        dispatch({ type: 'HIRE_NPC', npc, cost: 0 })
      } catch {}
    },

    fireNpc: (npcId) => {
      dispatch({ type: 'FIRE_NPC', npcId })
      pb.collection('kratNpcs').update(npcId, { groupeChef: null }).catch(() => {})
    },

    movePlayer: (position, cost) => {
      dispatch({ type: 'PLAYER_MOVE', position, cost })
      const forme    = state.player.jauges.forme
      const newForme = Math.round((forme.current - cost) * 10) / 10
      const newJauges = { ...state.player.jauges, forme: { ...forme, current: newForme } }
      const newLoc   = { ...state.player.location, position }
      saveLocation(state.player.id, newLoc, newJauges)
      // Déplacer les membres du groupe avec le joueur
      if (state.groupe?.length > 0) {
        const updatedGroupe = state.groupe.map(m => {
          const loc = { ...(m.location ?? {}), position }
          pb.collection('kratNpcs').update(m.id, { location: loc }).catch(() => {})
          return { ...m, location: loc }
        })
        dispatch({ type: 'SET_GROUPE', groupe: updatedGroupe })
      }
    },

    exitBuilding: async () => {
      dispatch({ type: 'EXIT_BUILDING' })
      const b      = state.city.buildings.find(b => b.id === state.building.id)
      const newLoc = { position: b?.position ?? '0,0', city: state.city.id, building: null, roomId: null }
      saveLocation(state.player.id, newLoc, state.player.jauges)
      const city = await fetchCity(state.city.id)
      if (city) dispatch({ type: 'SET_CITY', city })
    },

    enterBuilding: async (buildingId) => {
      dispatch({ type: 'ENTER_BUILDING', buildingId })
      const newLoc = { position: null, city: state.city.id, building: buildingId, roomId: 'entrance' }
      saveLocation(state.player.id, newLoc, state.player.jauges)
      const bldg = await fetchBuilding(buildingId)
      if (bldg) dispatch({ type: 'SET_BUILDING', building: bldg })
      else      dispatch({ type: 'SET_LOADING', value: false })
    },

    exitToWorld: () => {
      dispatch({ type: 'EXIT_TO_WORLD' })
      const c      = state.world.cities.find(c => c.id === state.city.id)
      const newLoc = { position: c?.position ?? '0,0', city: null, building: null, roomId: null }
      saveLocation(state.player.id, newLoc, state.player.jauges)
    },

    enterCity: async (cityId) => {
      dispatch({ type: 'ENTER_CITY', cityId })
      const geo    = CITY_GEO[cityId]
      const newLoc = { position: geo?.exits[0] ?? '0,0', city: cityId, building: null, roomId: null }
      saveLocation(state.player.id, newLoc, state.player.jauges)
      const city = await fetchCity(cityId)
      if (city) dispatch({ type: 'SET_CITY', city })
      else      dispatch({ type: 'SET_LOADING', value: false })
    },
  }

  // ── Prison automatique si réputation ≤ 0 ─────────────────────────────────
  useEffect(() => {
    if (state.loading) return
    if (state.player.jauges.reputation.current > 0) return
    const loc = state.player.location
    const inPrison = state.building?.type === 'mairie' && loc.roomId === 'bed'
    if (inPrison) return
    const mairie = state.city?.buildings?.find(b => b.type === 'mairie')
    if (!mairie) return

    dispatch({ type: 'ENTER_BUILDING', buildingId: mairie.id, roomId: 'bed' })
    const newLoc = { position: null, city: state.city.id, building: mairie.id, roomId: 'bed' }
    saveLocation(state.player.id, newLoc, state.player.jauges)
    fetchBuilding(mairie.id, 'bed').then(bldg => {
      if (bldg) dispatch({ type: 'SET_BUILDING', building: bldg })
      else      dispatch({ type: 'SET_LOADING', value: false })
    })
  }, [state.player.jauges.reputation.current, state.loading])

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
