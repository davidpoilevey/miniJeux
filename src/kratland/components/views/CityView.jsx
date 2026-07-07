/**
 * CityView — Carte de la ville avec menu contextuel au clic.
 */
import { useMemo, useState, useEffect, useRef } from 'react'
import Box            from '@mui/material/Box'
import Typography     from '@mui/material/Typography'
import Paper          from '@mui/material/Paper'
import Menu           from '@mui/material/Menu'
import MenuItem       from '@mui/material/MenuItem'
import { useKrat }    from '../../context/KratContext'
import { pb }         from '../../services/pb'
import { getSpeedMultiplier } from '../../data/catalog'
import CharacterDialog from '../dialogs/CharacterDialog'
import { GridCell as BaseGridCell } from './GridCell'
import imgTerre from '../../../bactery/images/fondTerre.jpg';

const CELL_SIZE = 45

// ─── Terrain ──────────────────────────────────────────────────────────────────

function rollCityTerrain() {
  const r = Math.random()
  if (r > 0.99) return '⛲'
  if (r > 0.96) return '🌿'
  if (r > 0.93) return '🪨'
  return ''
}

const BUILDING_EMOJI = {
  taverne:      '🍺',
  mairie:       '🏛️',
  forge:        '⚒️',
  marche:       '🏪',
  temple:       '⛪',
  bibliotheque: '📚',
  pharmacie:    '⚕️',
  prison:       '⛓️',
  maison:       '🏠',
}

// ─── Cellule ──────────────────────────────────────────────────────────────────

function GridCell({ pos, info, isPlayer, groupeSize, canReach, onClick }) {
  const { building, exit, chars = [], terrain } = info ?? {}
  const hasChars   = chars.length > 0
  const aggressive = chars.find(c => c._type === 'npc' && c.action === 'Attaquer')

  let bgColor = null
  if (building)  bgColor = 'rgba(180,140,80,0.25)'
  else if (exit) bgColor = 'rgba(200,160,40,0.15)'
  else if (hasChars) bgColor = aggressive ? 'rgba(200,30,30,0.15)' : 'rgba(80,80,200,0.12)'

  const tipParts = []
  if (isPlayer)  tipParts.push('Vous êtes ici')
  if (building)  tipParts.push(building.type ?? building.id)
  if (exit)      tipParts.push('Sortie')
  if (hasChars)  tipParts.push(chars.map(c => `${c.name}${c.role ? ` (${c.role})` : ''}`).join(', '))
  if (!canReach && !building && !exit && !isPlayer) tipParts.push('Forme insuffisante')
  const tip = tipParts.join(' · ') || null

  const primaryCharEmoji = chars[0]?._type === 'player' ? '👤' : (aggressive ? '😠' : '🧑')

  let content, isDecor = false
  if (isPlayer)      { content = groupeSize > 0 ? `🧙‍♂️+${groupeSize}` : '🧙‍♂️' }
  else if (building) { content = BUILDING_EMOJI[building.type] ?? '🏠' }
  else if (exit)     { content = '🚪' }
  else if (hasChars) { content = chars.length > 1 ? `${primaryCharEmoji}${chars.length}` : primaryCharEmoji }
  else               { content = terrain; isDecor = !!terrain }

  return (
    <BaseGridCell
      pos={pos}
      size={CELL_SIZE}
      tooltip={tip}
      bgColor={bgColor}
      canReach={canReach}
      isPlayer={isPlayer}
      isDecor={isDecor}
      cursor={canReach || building || exit || isPlayer || hasChars ? 'pointer' : 'not-allowed'}
      indicator={!isPlayer && building && aggressive ? 'error.main' : null}
      onClick={(e) => onClick(pos, info, e)}
    >
      {content}
    </BaseGridCell>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function CityView() {
  const { state, actions } = useKrat()
  const { city, player, groupe } = state
  const forme      = player.jauges.forme.current
  const playerPos  = player.location.position
  const speedMult  = getSpeedMultiplier(player.inventaire ?? [])

  const [cityChars,    setCityChars]    = useState([])
  const [selectedChar, setSelectedChar] = useState(null)
  const [menuState,    setMenuState]    = useState(null)

  // Terrain figé
  const terrainRef = useRef(null)
  if (!terrainRef.current ||
      terrainRef.current.width  !== city.width ||
      terrainRef.current.height !== city.height) {
    const map = {}
    for (let r = 0; r < city.height; r++)
      for (let c = 0; c < city.width; c++)
        map[`${c},${r}`] = rollCityTerrain()
    terrainRef.current = { width: city.width, height: city.height, map }
  }

  useEffect(() => {
    if (!city?.id) return
    let cancelled = false
    Promise.all([
      pb.collection('kratNpcs').getFullList(),
      pb.collection('kratPlayers').getFullList(),
    ]).then(([npcs, players]) => {
      if (cancelled) return
      const all = [
        ...npcs.map(n => ({ id: n.id, name: n.name, role: n.role, action: n.action,
          avatarUrl: n.avatarUrl, location: n.location, hp: n.hp, _type: 'npc',
          shop: n.shop ?? null, mission: n.mission ?? null })),
        ...players
          .filter(p => p.id !== player.id)
          .map(p => ({ id: p.id, name: p.name, avatarUrl: p.avatarUrl,
            location: p.location, _type: 'player' })),
      ]
      setCityChars(all.filter(c => {
        const loc = typeof c.location === 'string' ? JSON.parse(c.location) : (c.location ?? {})
        if (loc.city !== city.id || loc.building || loc.roomId) return false
        if (c._type === 'npc') {
          const hp = typeof c.hp === 'string' ? JSON.parse(c.hp) : (c.hp ?? { current: 1 })
          if ((hp.current ?? 1) <= 0) return false
        }
        return true
      }))
    }).catch(() => {})
    return () => { cancelled = true }
  }, [city?.id])

  // Combat automatique si NPC(s) agressif(s) sur la même case
  useEffect(() => {
    if (!playerPos || !cityChars.length) return
    const aggressors = cityChars.filter(c => {
      const loc = typeof c.location === 'string' ? JSON.parse(c.location) : (c.location ?? {})
      return loc.position === playerPos && c._type === 'npc' && c.action === 'Attaquer'
    })
    if (aggressors.length > 0) actions.startCombat(aggressors)
  }, [playerPos, cityChars])

  const cellMap = useMemo(() => {
    const map = {}
    city.buildings.forEach(b => {
      const pos = b.position
      map[pos] = { ...map[pos], building: b }
    })
    city.exits.forEach(pos => { map[pos] = { ...map[pos], exit: true } })
    cityChars.forEach(c => {
      const loc = typeof c.location === 'string' ? JSON.parse(c.location) : (c.location ?? {})
      const pos = loc?.position
      if (!pos) return
      map[pos] = { ...map[pos], chars: [...(map[pos]?.chars ?? []), c] }
    })
    for (let r = 0; r < city.height; r++)
      for (let c = 0; c < city.width; c++) {
        const pos = `${c},${r}`
        map[pos] = { terrain: terrainRef.current?.map[pos] ?? '', ...(map[pos] ?? {}) }
      }
    return map
  }, [city, cityChars])

  const [pc, pr] = (playerPos ?? '0,0').split(',').map(Number)

  // Fiable sans ownerId en PB — on contrôle le format de buildingId
  const hasHouse = city.buildings.some(b => b.id === `maison_${player.id}`)

  const inv = player.inventaire ?? []
  const canBuildHouse = !hasHouse
    && (inv.find(i => i.typeId === 'planche')?.qty  ?? 0) >= 10
    && (inv.find(i => i.typeId === 'fer_brut')?.qty ?? 0) >= 4

  function getCost(pos) {
    const [tc, tr] = pos.split(',').map(Number)
    const distance = Math.abs(tc - pc) + Math.abs(tr - pr)
    return Math.round(distance * speedMult * 10) / 100
  }

  function handleCellClick(pos, info, event) {
    const chars    = info?.chars ?? []
    const canReach = forme >= getCost(pos)
    if (!canReach && !info?.building && !info?.exit && pos !== playerPos && !chars.length) return
    event.stopPropagation()
    setMenuState({ pos, info, cost: getCost(pos), canReach, anchorPos: { top: event.clientY, left: event.clientX } })
  }

  function closeMenu() { setMenuState(null) }

  function handleMove(pos, cost, info, options = {}) {
    actions.movePlayer(pos, cost, options)
    const chars       = info?.chars ?? []
    const firstTalkable = chars.find(c => c._type !== 'npc' || c.action !== 'Attaquer')
    if (firstTalkable) setSelectedChar(firstTalkable)
  }

  // ── Menu items ──────────────────────────────────────────────────────────────

  function renderMenuItems() {
    if (!menuState) return null
    const { pos, info, cost, canReach } = menuState
    const chars    = info?.chars ?? []
    const isPlayer = pos === playerPos
    const items    = []

    if (isPlayer) {
      // Building or exit on player's cell
      if (info?.building) items.push(
        <MenuItem key="enter" onClick={() => { closeMenu(); actions.enterBuilding(info.building.id) }}>
          🚪 Entrer dans le bâtiment
        </MenuItem>
      )
      if (info?.exit) items.push(
        <MenuItem key="exit-world" onClick={() => { closeMenu(); actions.exitToWorld() }}>
          🌍 Quitter la ville
        </MenuItem>
      )
      // Talkable chars on same cell
      chars.filter(c => c._type !== 'npc' || c.action !== 'Attaquer').forEach(c => items.push(
        <MenuItem key={`talk-${c.id}`} onClick={() => { closeMenu(); setSelectedChar(c) }}>
          💬 Parler à {c.name}
        </MenuItem>
      ))
      // Build house
      if (!hasHouse) items.push(
        <MenuItem key="build" disabled={!canBuildHouse} onClick={() => { closeMenu(); actions.buildHouse() }}>
          <Box>
            <Typography variant="body2">🏗️ Construire une cabane</Typography>
            <Typography variant="caption" color={canBuildHouse ? 'text.secondary' : 'error'}>
              10 planches · 4 fer brut
            </Typography>
          </Box>
        </MenuItem>
      )
    } else if (info?.building) {
      items.push(
        <MenuItem key="enter" onClick={() => { closeMenu(); actions.enterBuilding(info.building.id) }}>
          🚪 Entrer dans le bâtiment
        </MenuItem>
      )
    } else if (info?.exit) {
      items.push(
        <MenuItem key="exit-world" onClick={() => { closeMenu(); actions.exitToWorld() }}>
          🌍 Quitter la ville
        </MenuItem>
      )
    } else if (canReach) {
      items.push(
        <MenuItem key="move" onClick={() => { const s = menuState; closeMenu(); handleMove(s.pos, s.cost, s.info) }}>
          🚶 Se déplacer <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>({cost.toFixed(1)} forme)</Typography>
        </MenuItem>
      )
      items.push(
        <MenuItem key="discreet" disabled={forme < cost * 2}
          onClick={() => { const s = menuState; closeMenu(); handleMove(s.pos, s.cost, s.info, { discreet: true }) }}>
          🥷 Discrètement <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>({(cost * 2).toFixed(1)} forme, 1% rencontre)</Typography>
        </MenuItem>
      )
    }

    if (!items.length) items.push(<MenuItem key="none" disabled>Aucune action disponible</MenuItem>)
    return items
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
        🏙️ {city.name}
      </Typography>

      <Box sx={{
        display: 'inline-flex', flexDirection: 'column',
        borderRadius: 1,
        boxShadow: '0 0 0 2px rgba(44,62,80,0.45), 0 6px 24px rgba(0,0,0,0.22)',
       background:`url(${imgTerre})`
      }}>
        {Array.from({ length: city.height }, (_, row) => (
          <Box key={row} sx={{ display: 'flex' }}>
            {Array.from({ length: city.width }, (_, col) => {
              const pos  = `${col},${row}`
              const cost = getCost(pos)
              return (
                <GridCell
                  key={pos}
                  pos={pos}
                  info={cellMap[pos]}
                  isPlayer={pos === playerPos}
                  groupeSize={pos === playerPos ? (groupe?.length ?? 0) : 0}
                  canReach={forme >= cost}
                  onClick={handleCellClick}
                />
              )
            })}
          </Box>
        ))}
      </Box>

      <Paper sx={{ mt: 2, p: 1.5, bgcolor: '#2c3e50', color: '#fff',
        display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center', borderRadius: 2 }}>
        <Typography variant="body2">📍 {playerPos}</Typography>
        <Typography variant="body2">⚡ Forme : {forme.toFixed(1)}</Typography>
        <Typography variant="body2">👤 Maire : {city.mayor || '—'}</Typography>
        {hasHouse && <Typography variant="body2">🏠 Propriétaire</Typography>}
        {cityChars.length > 0 && (
          <Typography variant="body2" sx={{ ml: 'auto' }}>
            👥 {cityChars.length} présence{cityChars.length > 1 ? 's' : ''} détectée{cityChars.length > 1 ? 's' : ''}
          </Typography>
        )}
      </Paper>

      {/* Menu contextuel */}
      <Menu
        open={!!menuState}
        onClose={closeMenu}
        anchorReference="anchorPosition"
        anchorPosition={menuState?.anchorPos}
      >
        {renderMenuItems()}
      </Menu>

      <CharacterDialog
        target={selectedChar}
        open={!!selectedChar}
        onClose={() => setSelectedChar(null)}
      />
    </Box>
  )
}
