import React from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { KratProvider, useKrat } from './context/KratContext'
import { pb } from './services/pb'
import { CONTEXTUAL_ACTIONS } from './data/catalog'
import ActionDialog from './components/dialogs/ActionDialog'
import CoffreDialog from './components/dialogs/CoffreDialog'
import CharacterDialog from './components/dialogs/CharacterDialog'
import CombatView from './components/views/CombatView'
import WorldMapView from './components/views/WorldMapView'
import AchatDialog from './components/dialogs/AchatDialog'
import { ITEM_TYPES } from './data/catalog'

jest.mock('pocketbase', () => jest.fn().mockImplementation(() => ({
  collection: jest.fn(), createBatch: jest.fn(),
  filter: (_expression, values) => Object.values(values).join('|'),
})))

const ID = 'player000000001'
const clone = value => JSON.parse(JSON.stringify(value))
let game, records, services, batchFail, batchRequests
const makePlayer = () => ({
  id: ID, name: 'Voyageur', gold: 100, inventaire: [],
  stats: { force: 5, intelligence: 5, charisme: 5, bonus: { force: 0, intelligence: 0, charisme: 0 }, competences: {}, pointsDivins: { current: 1, max: 20 } },
  jauges: { forme: { current: 24, max: 24 }, faim: { current: 20, max: 20 }, reputation: { current: 10, max: 20 } },
  location: { position: '0,0', city: 'haguenau', building: null, roomId: null },
})
const playerRecord = () => records.kratPlayers[0]
const npc = (changes = {}) => ({
  id: 'enemy0000000001', name: 'Bandit', _type: 'npc', role: 'bandit', action: 'Attaquer',
  stats: { force: 4 }, hp: { current: 1, max: 20, loot: { gold: 20, pain: 1 } },
  location: clone(playerRecord().location), ...changes,
})
function Harness({ children }) { game = useKrat(); return typeof children === 'function' ? children(game) : children ?? null }
async function setup(children) {
  render(<KratProvider pbId={ID}><Harness>{children}</Harness></KratProvider>)
  await waitFor(() => expect(game.state.loading).toBe(false))
}

beforeEach(() => {
  HTMLElement.prototype.scrollIntoView = jest.fn()
  records = {
    kratPlayers: [makePlayer()], kratNpcs: [], kratItems: [],
    kratCities: [{ id: 'cityrecord', cityId: 'haguenau', name: 'Haguenau', taxMultiplier: 1 }],
    kratBuildings: [{ id: 'buildingrecord', buildingId: 'forge', cityId: 'haguenau', type: 'forge', position: '5,0', roomConfig: 'entrance_shop', name: 'Forge' }],
  }
  services = {}; batchFail = false; batchRequests = []
  pb.collection.mockImplementation(collection => {
    if (services[collection]) return services[collection]
    services[collection] = {
      getOne: jest.fn(async id => {
        const result = records[collection].find(r => r.id === id)
        if (!result) throw Object.assign(new Error('missing'), { status: 404 })
        return clone(result)
      }),
      getFullList: jest.fn(async options => clone(records[collection].filter(r => {
        const f = options?.filter ?? ''
        if (f.includes('groupeChef')) return r.groupeChef === ID
        if (collection === 'kratBuildings' && f) return f.includes(r.buildingId) || f.includes(r.cityId)
        return true
      }))),
      update: jest.fn(async (id, changes) => {
        const record = records[collection].find(r => r.id === id)
        if (!record) throw Object.assign(new Error('missing'), { status: 404 })
        Object.assign(record, clone(changes)); return clone(record)
      }),
      create: jest.fn(async body => {
        if (records[collection].some(r => r.id === body.id)) throw new Error('duplicate id')
        const record = { id: 'created', ...clone(body) }; records[collection].push(record); return clone(record)
      }),
    }
    return services[collection]
  })
  pb.createBatch.mockImplementation(() => {
    const requests = []
    return {
      collection: collection => ({
        create: body => requests.push({ collection, method: 'create', body }),
        update: (id, body) => requests.push({ collection, method: 'update', id, body }),
      }),
      send: async () => {
        batchRequests.push(requests)
        if (batchFail) throw new Error('batch rejected')
        const before = clone(records)
        try {
          for (const r of requests) await pb.collection(r.collection)[r.method](...(r.method === 'create' ? [r.body] : [r.id, r.body]))
        } catch (error) { records = before; throw error }
      },
    }
  })
  jest.spyOn(Math, 'random').mockReturnValue(0.99)
})
afterEach(() => { jest.restoreAllMocks() })

test('deux effets dans le même tour sauvegardent la somme des dégâts', async () => {
  await setup()
  act(() => { game.actions.applyEffects({ forme: -3 }); game.actions.applyEffects({ forme: -4 }) })
  expect(game.state.player.jauges.forme.current).toBe(17)
  await waitFor(() => expect(playerRecord().jauges.forme.current).toBe(17))
  expect(services.kratPlayers.update).toHaveBeenLastCalledWith(ID, expect.objectContaining({ jauges: expect.objectContaining({ forme: expect.objectContaining({ current: 17 }) }) }), { requestKey: null })
})

test('or et objets de victoire sont tous sauvegardés', async () => {
  await setup()
  act(() => { game.actions.applyEffects({ gold: 20, reputation: 1 }); game.actions.collectLoot({ pain: 1 }) })
  await waitFor(() => { expect(playerRecord().gold).toBe(120); expect(playerRecord().inventaire).toEqual([{ typeId: 'pain', qty: 1 }]) })
})

test('un boost coûte un PD, ne devient pas négatif et ne peut pas être répété sans PD', async () => {
  await setup()
  act(() => { game.actions.boostStat('force'); game.actions.boostStat('force') })
  expect(game.state.player.stats.force).toBe(6)
  expect(game.state.player.stats.pointsDivins.current).toBe(0)
  await waitFor(() => expect(playerRecord().stats.force).toBe(6))
})

test.each([['livre_survie', 'survie'], ['livre_magieFeu', 'magieFeu']])('utiliser %s apprend %s une seule fois', async (typeId, competence) => {
  playerRecord().inventaire = [{ typeId, qty: 1 }]
  await setup()
  act(() => { game.actions.useItem(typeId); game.actions.useItem(typeId) })
  expect(game.state.player.stats.competences[competence]).toBe(1)
  expect(game.state.player.inventaire).toEqual([])
  await waitFor(() => expect(playerRecord().stats.competences[competence]).toBe(1))
})

test.each([['tablette', 'intelligence', 6], ['drone', 'perception', 2]])('le consommable %s applique son effet %s', async (typeId, key, expected) => {
  playerRecord().inventaire = [{ typeId, qty: 1 }]
  await setup()
  act(() => game.actions.useItem(typeId))
  await waitFor(() => expect(playerRecord().stats[key]).toBe(expected))
})

test('le don au temple se rend correctement et ne dépasse pas le portefeuille', async () => {
  playerRecord().gold = 12
  const donate = CONTEXTUAL_ACTIONS.temple.entrance.find(a => a.id === 'donate')
  await setup(<ActionDialog open action={donate} onClose={() => {}} />)
  fireEvent.click(screen.getByRole('button', { name: /Donner de l'argent/ }))
  await waitFor(() => expect(playerRecord().gold).toBe(0))
  expect(typeof game.state.player.gold).toBe('number')
  expect(screen.getByText('Succès !')).toBeTruthy()
})

test('un don est interdit en dessous du minimum', async () => {
  playerRecord().gold = 9
  await setup(<ActionDialog open action={CONTEXTUAL_ACTIONS.temple.entrance.find(a => a.id === 'donate')} onClose={() => {}} />)
  expect(screen.getByRole('button', { name: /Donner de l'argent/ }).disabled).toBe(true)
})

test('entrer dans un bâtiment éloigné paie le déplacement', async () => {
  await setup()
  await act(async () => game.actions.enterBuilding('forge'))
  expect(game.state.player.jauges.forme.current).toBe(23.5)
  await waitFor(() => expect(playerRecord().location.building).toBe('forge'))
  expect(playerRecord().jauges.forme.current).toBe(23.5)
})

test('un bâtiment inaccessible ne permet pas de contourner la forme', async () => {
  playerRecord().jauges.forme.current = 0
  await setup()
  await act(async () => expect(await game.actions.enterBuilding('forge')).toBe(false))
  expect(game.state.currentView).toBe('city')
  expect(services.kratPlayers.update).not.toHaveBeenCalled()
})

test('on ne peut pas quitter la ville depuis une case sans sortie', async () => {
  await setup()
  act(() => expect(game.actions.exitToWorld()).toBe(false))
  expect(game.state.currentView).toBe('city')
})

test('entrer en ville depuis le monde paie la distance, sans double débit', async () => {
  playerRecord().location = { position: '0,0', city: null, building: null, roomId: null }
  await setup()
  await act(async () => game.actions.enterCity('haguenau'))
  expect(game.state.player.jauges.forme.current).toBe(22.3)
  await waitFor(() => expect(playerRecord().jauges.forme.current).toBe(22.3))
})

test('aucun combat à distance, contre un mort ou contre un joueur', async () => {
  await setup()
  act(() => {
    game.actions.startCombat(npc({ location: { ...playerRecord().location, position: '5,0' } }))
    game.actions.startCombat(npc({ hp: { current: 0, max: 20 } }))
    game.actions.startCombat(npc({ _type: 'player' }))
  })
  expect(game.state.currentView).toBe('city')
  expect(game.state.activeEnemies).toEqual([])
})

test('le menu joueur ne propose plus le faux PvP', async () => {
  await setup(<CharacterDialog open target={{ id: 'other', _type: 'player', name: 'Autre joueur' }} onClose={() => {}} />)
  expect(screen.queryByRole('button', { name: /Attaquer/ })).toBeNull()
})

test('le monde masque les PNJ morts', async () => {
  playerRecord().location = { position: '0,0', city: null, building: null, roomId: null }
  records.kratNpcs.push(npc({ name: 'PNJ mort', hp: { current: 0, max: 20 }, location: { position: '1,0', city: null, building: null } }))
  await setup(<WorldMapView />)
  await waitFor(() => expect(screen.getByText(/0 présences détectées/)).toBeTruthy())
  expect(screen.queryByText('PNJ mort')).toBeNull()
})

test('une victoire vide le butin, et le PNJ ne peut plus être combattu', async () => {
  records.kratNpcs.push(npc())
  await setup(game => game.state.currentView === 'combat' ? <CombatView /> : null)
  act(() => game.actions.startCombat(clone(records.kratNpcs[0])))
  const attack = screen.getByRole('button', { name: /Attaque Nue/ })
  fireEvent.click(attack)
  fireEvent.click(attack)
  await waitFor(() => expect(playerRecord().gold).toBe(125))
  expect(playerRecord().inventaire).toEqual([{ typeId: 'pain', qty: 1 }])
  expect(records.kratNpcs[0].hp).toMatchObject({ current: 0, loot: {} })
  fireEvent.click(screen.getByRole('button', { name: 'Terminer' }))
  act(() => game.actions.startCombat(clone(records.kratNpcs[0])))
  expect(game.state.currentView).toBe('city')
  expect(playerRecord().gold).toBe(125)
})

test('les ripostes de plusieurs ennemis sont sauvegardées comme un seul total', async () => {
  Math.random.mockReturnValue(0)
  records.kratNpcs.push(npc({ hp: { current: 20, max: 20 } }), npc({ id: 'enemy0000000002', hp: { current: 20, max: 20 } }))
  await setup(game => game.state.currentView === 'combat' ? <CombatView /> : null)
  act(() => game.actions.startCombat(clone(records.kratNpcs)))
  fireEvent.click(screen.getByRole('button', { name: /Attaque Nue/ }))
  await waitFor(() => expect(playerRecord().jauges.forme.current).toBe(18))
  expect(game.state.player.jauges.forme.current).toBe(18)
})

test('les transferts du coffre sont suspendus sans mutation de contenu', async () => {
  records.kratItems.push({ id: 'chest', typeId: 'pain', qty: 4, location: { roomId: 'coffre', buildingId: 'forge' } })
  await setup(<CoffreDialog open isOwner buildingId="forge" onClose={() => {}} />)
  await waitFor(() => expect(screen.getByText(/×4/)).toBeTruthy())
  expect(screen.getByText(/temporairement suspendus/)).toBeTruthy()
  screen.getAllByRole('button', { name: /←/ }).forEach(button => expect(button.disabled).toBe(true))
  expect(services.kratItems.update).not.toHaveBeenCalled()
  expect(services.kratItems.create).not.toHaveBeenCalled()
})

test('une construction refusée conserve les matériaux et ne crée rien', async () => {
  playerRecord().inventaire = [{ typeId: 'planche', qty: 10 }, { typeId: 'fer_brut', qty: 4 }]
  batchFail = true
  jest.spyOn(console, 'error').mockImplementation(() => {})
  await setup()
  await act(async () => expect(await game.actions.buildHouse()).toBe('error'))
  expect(game.state.player.inventaire).toEqual(playerRecord().inventaire)
  expect(records.kratBuildings).toHaveLength(1)
  expect(playerRecord().inventaire).toEqual([{ typeId: 'planche', qty: 10 }, { typeId: 'fer_brut', qty: 4 }])
})

test('la maison et le débit des matériaux partagent la même transaction', async () => {
  playerRecord().inventaire = [{ typeId: 'planche', qty: 12 }, { typeId: 'fer_brut', qty: 4 }]
  await setup()
  await act(async () => expect(await game.actions.buildHouse()).toBe('built'))
  expect(batchRequests).toHaveLength(1)
  expect(batchRequests[0].map(r => r.collection)).toEqual(['kratBuildings', 'kratPlayers'])
  expect(playerRecord().inventaire).toEqual([{ typeId: 'planche', qty: 2 }])
  expect(game.state.currentView).toBe('building')
})

test('une pile pleine interdit l’achat dans le dialogue et dans l’action', async () => {
  playerRecord().inventaire = [{ typeId: 'pain', qty: 10 }]
  await setup(<AchatDialog open item={{ key: 'pain', ...ITEM_TYPES.pain }} onClose={() => {}} />)
  expect(screen.getByRole('button', { name: 'Pile pleine' }).disabled).toBe(true)
  act(() => expect(game.actions.buyItem('pain', 4)).toBe(false))
  expect(playerRecord().gold).toBe(100)
  expect(services.kratPlayers.update).not.toHaveBeenCalled()
})

test('un achat valide ne débite qu’une fois, et un dépassement de pile est refusé', async () => {
  playerRecord().inventaire = [{ typeId: 'pain', qty: 9 }]
  await setup()
  act(() => expect(game.actions.buyItem('pain', 4, 2)).toBe(false))
  act(() => expect(game.actions.buyItem('pain', 4, 1)).toBe(true))
  await waitFor(() => expect(playerRecord().gold).toBe(96))
  expect(playerRecord().inventaire).toEqual([{ typeId: 'pain', qty: 10 }])
})

test('les récompenses plafonnent les piles existantes et nouvelles à l’écran et en base', async () => {
  playerRecord().inventaire = [{ typeId: 'pain', qty: 9 }]
  await setup()
  act(() => { game.actions.applyEffects({ item: 'pain' }); game.actions.applyEffects({ item: 'pain' }); game.actions.collectLoot({ pain: 100, gold: 2000 }) })
  await waitFor(() => expect(playerRecord().inventaire).toEqual([{ typeId: 'pain', qty: 10 }, { typeId: 'gold', qty: 1000 }]))
  expect(game.state.player.inventaire).toEqual(playerRecord().inventaire)
})

test('dormir dans son lit est gratuit, une chambre de taverne reste payante', async () => {
  playerRecord().gold = 0
  playerRecord().inventaire = [{ typeId: 'lit', qty: 1 }]
  const sleep = CONTEXTUAL_ACTIONS.maison.sleeping.find(a => a.id === 'sleep_room')
  await setup(<ActionDialog open action={sleep} onClose={() => {}} />)
  expect(sleep.condition(game.state)).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Se coucher' }))
  await waitFor(() => expect(playerRecord().stats.pointsDivins.current).toBe(6))
  expect(playerRecord().gold).toBe(0)
  expect(CONTEXTUAL_ACTIONS.taverne.sleeping.find(a => a.id === 'sleep_room').onSuccess.gold).toBe(-10)
})

test('les compagnons suivent bâtiment, pièce, ville et carte mondiale', async () => {
  records.kratNpcs.push(npc({ id: 'ally00000000001', action: 'Suivre', groupeChef: ID }))
  await setup()
  await act(async () => game.actions.enterBuilding('forge'))
  await waitFor(() => { expect(records.kratNpcs[0].location).toEqual(game.state.player.location); expect(playerRecord().location).toEqual(game.state.player.location) })
  act(() => game.actions.selectRoom('shop'))
  await waitFor(() => expect(records.kratNpcs[0].location.roomId).toBe('shop'))
  await act(async () => game.actions.exitBuilding())
  act(() => game.actions.movePlayer(game.state.city.exits[0], undefined, { transition: true }))
  act(() => game.actions.exitToWorld())
  await waitFor(() => { expect(records.kratNpcs[0].location.city).toBeNull(); expect(records.kratNpcs[0].location).toEqual(game.state.player.location); expect(playerRecord().location).toEqual(game.state.player.location) })
  await act(async () => game.actions.enterCity('haguenau'))
  await waitFor(() => { expect(records.kratNpcs[0].location).toEqual(game.state.player.location); expect(playerRecord().location).toEqual(game.state.player.location) })
})

async function setupPrison() {
  records.kratBuildings.push({ id: 'townhall', buildingId: 'mairie', cityId: 'haguenau', type: 'mairie', position: '1,1', roomConfig: 'entrance_prison' })
  playerRecord().location = { city: 'haguenau', building: 'mairie', position: null, roomId: 'prison' }
  playerRecord().jauges.reputation.current = 0
  await setup()
}

test('une évasion conserve la mauvaise réputation sans réincarcération automatique', async () => {
  await setupPrison()
  act(() => game.actions.escapeFromPrison(2))
  await waitFor(() => expect(playerRecord().stats.fugitive).toBe(true))
  expect(game.state.player.jauges.reputation.current).toBe(0)
  await act(async () => game.actions.exitBuilding())
  expect(game.state.player.location.building).toBeNull()
  await act(async () => game.actions.enterBuilding('forge'))
  expect(game.state.player.location.building).toBe('forge')
})

test('la police peut repérer un évadé et le remettre en prison', async () => {
  await setupPrison()
  act(() => game.actions.escapeFromPrison(2))
  await act(async () => game.actions.exitBuilding())
  Math.random.mockReturnValue(0)
  act(() => game.actions.movePlayer('2,1'))
  await waitFor(() => { expect(game.state.building.currentRoomId).toBe('prison'); expect(game.state.loading).toBe(false) })
  await waitFor(() => expect(playerRecord().stats.fugitive).toBe(false))
  expect(playerRecord().location.roomId).toBe('prison')
})

test('la discrétion réduit la probabilité de repérage des évadés', async () => {
  await setupPrison()
  act(() => game.actions.escapeFromPrison(2))
  await act(async () => game.actions.exitBuilding())
  Math.random.mockReturnValue(0.1)
  act(() => expect(game.actions.movePlayer('2,1', undefined, { discreet: true, transition: true })).toBe(true))
  expect(game.state.player.location.building).toBeNull()
  act(() => expect(game.actions.movePlayer('3,1', undefined, { transition: true })).toBe(false))
  await waitFor(() => { expect(game.state.building.currentRoomId).toBe('prison'); expect(game.state.loading).toBe(false) })
})

test('un PNJ vaincu ailleurs pendant le combat ne rapporte aucun nouveau butin', async () => {
  records.kratNpcs.push(npc())
  await setup(game => game.state.currentView === 'combat' ? <CombatView /> : null)
  act(() => game.actions.startCombat(clone(records.kratNpcs[0])))
  records.kratNpcs[0].hp.current = 0
  fireEvent.click(screen.getByRole('button', { name: /Attaque Nue/ }))
  await waitFor(() => expect(screen.getByText(/Aucun butin supplémentaire/)).toBeTruthy())
  expect(playerRecord().gold).toBe(100)
  expect(playerRecord().inventaire).toEqual([])
})

test('un échec du débit dans la transaction ne laisse pas de maison gratuite', async () => {
  playerRecord().inventaire = [{ typeId: 'planche', qty: 10 }, { typeId: 'fer_brut', qty: 4 }]
  jest.spyOn(console, 'error').mockImplementation(() => {})
  await setup()
  services.kratPlayers.update.mockRejectedValueOnce(new Error('player update failed'))
  await act(async () => expect(await game.actions.buildHouse()).toBe('error'))
  expect(records.kratBuildings).toHaveLength(1)
  expect(playerRecord().inventaire).toHaveLength(2)
})

test('une victoire refusée ne tue pas les PNJ et ne débite ni ne crédite le joueur', async () => {
  records.kratNpcs.push(npc())
  batchFail = true
  await setup(game => game.state.currentView === 'combat' ? <CombatView /> : null)
  act(() => game.actions.startCombat(clone(records.kratNpcs[0])))
  fireEvent.click(screen.getByRole('button', { name: /Attaque Nue/ }))
  await waitFor(() => expect(screen.getByText(/Impossible de valider le combat/)).toBeTruthy())
  expect(records.kratNpcs[0].hp.current).toBe(1)
  expect(records.kratNpcs[0].hp.loot.gold).toBe(20)
  expect(playerRecord().gold).toBe(100)
  expect(playerRecord().inventaire).toEqual([])
})

test('deux déplacements rapides ne peuvent pas inverser la position sauvegardée du compagnon', async () => {
  records.kratNpcs.push(npc({ id: 'ally00000000001', action: 'Suivre', groupeChef: ID }))
  await setup()
  const update = services.kratNpcs.update.getMockImplementation()
  let release
  services.kratNpcs.update.mockImplementationOnce(async (...args) => {
    await new Promise(resolve => { release = resolve })
    return update(...args)
  })
  act(() => { game.actions.movePlayer('1,0', undefined, { transition: true }); game.actions.movePlayer('2,0', undefined, { transition: true }) })
  await waitFor(() => expect(services.kratNpcs.update).toHaveBeenCalledTimes(1))
  await act(async () => release())
  await waitFor(() => expect(records.kratNpcs[0].location.position).toBe('2,0'))
  expect(services.kratNpcs.update).toHaveBeenCalledTimes(2)
})

test('un habitant sans pièce spécifique peut être combattu dans son bâtiment', async () => {
  playerRecord().location = { city: 'haguenau', building: 'forge', position: null, roomId: 'shop' }
  const inhabitant = npc({ location: { city: 'haguenau', building: 'forge', roomId: null, position: null } })
  records.kratNpcs.push(inhabitant)
  await setup()
  act(() => game.actions.startCombat(inhabitant))
  expect(game.state.currentView).toBe('combat')
})
