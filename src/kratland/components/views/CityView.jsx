/**
 * CityView — Carte de la ville, style WorldMap.
 *
 * Règles d'interaction :
 *  - Bâtiment   → enterBuilding
 *  - Sortie     → exitToWorld
 *  - Case vide  → déplacer (coût forme)
 *  - NPC/Joueur sur la même case :
 *      action === 'Attaquer' → startCombat automatique
 *      sinon                  → CharacterDialog
 */
import { useMemo, useState, useEffect, useRef } from 'react'
import Box            from '@mui/material/Box'
import Typography     from '@mui/material/Typography'
import Tooltip        from '@mui/material/Tooltip'
import Paper          from '@mui/material/Paper'
import { useKrat }    from '../../context/KratContext'
import { pb }         from '../../services/pb'
import CharacterDialog from '../dialogs/CharacterDialog'

const CELL_SIZE = 45

// ─── Terrain et bâtiments en emoji ───────────────────────────────────────────

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
}

// ─── Cellule ──────────────────────────────────────────────────────────────────

function GridCell({ pos, info, isPlayer, groupeSize, canReach, onClick }) {
  const { building, exit, chars = [], terrain } = info ?? {}
  const hasChars   = chars.length > 0
  const aggressive = chars.find(c => c._type === 'npc' && c.action === 'Attaquer')

  let bgColor = 'transparent'
  if (isPlayer)   bgColor = 'rgba(0,200,80,0.18)'
  else if (building)  bgColor = 'rgba(180,140,80,0.18)'
  else if (exit)      bgColor = 'rgba(200,160,40,0.12)'
  else if (hasChars)  bgColor = aggressive ? 'rgba(200,30,30,0.12)' : 'rgba(80,80,200,0.10)'

  const tipParts = []
  if (isPlayer)  tipParts.push('Vous êtes ici')
  if (building)  tipParts.push(building.type ?? building.id)
  if (exit)      tipParts.push('Sortie')
  if (hasChars)  tipParts.push(chars.map(c => `${c.name}${c.role ? ` (${c.role})` : ''}`).join(', '))
  if (!canReach && !building && !exit && !isPlayer) tipParts.push(`Forme insuffisante`)
  const tip = tipParts.join(' · ') || null

  const primaryCharEmoji = chars[0]?._type === 'player' ? '👤' : (aggressive ? '😠' : '🧑')

  const cell = (
    <Box
      onClick={() => onClick(pos, info)}
      sx={{
        position: 'relative',
        width: CELL_SIZE, height: CELL_SIZE,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '0.5px solid',
        borderColor: exit ? 'rgba(200,160,40,0.5)' : 'rgba(0,0,0,0.06)',
        bgcolor: bgColor,
        cursor: canReach || building || exit || isPlayer || hasChars ? 'pointer' : 'not-allowed',
        opacity: !canReach && !building && !exit && !isPlayer && !hasChars ? 0.35 : 1,
        transition: 'background-color 0.08s',
        fontSize: CELL_SIZE * 0.58,
        lineHeight: 1,
        userSelect: 'none',
        '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' },
        flexShrink: 0,
      }}
    >
      {isPlayer
        ? (groupeSize > 0 ? `🧙‍♂️+${groupeSize}` : '🧙‍♂️')
        : building
          ? (BUILDING_EMOJI[building.type] ?? '🏠')
          : exit
            ? '🚪'
            : hasChars
              ? (chars.length > 1 ? `${primaryCharEmoji}${chars.length}` : primaryCharEmoji)
              : terrain}

      {/* Dot rouge si NPC agressif cohabite avec un bâtiment */}
      {!isPlayer && building && aggressive && (
        <Box sx={{ position: 'absolute', top: 2, right: 2,
          width: 5, height: 5, bgcolor: 'error.main', borderRadius: '50%' }} />
      )}
    </Box>
  )

  return tip
    ? <Tooltip title={tip} placement="top" arrow><span>{cell}</span></Tooltip>
    : cell
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function CityView() {
  const { state, actions } = useKrat()
  const { city, player, groupe } = state
  const forme    = player.jauges.forme.current
  const playerPos = player.location.position

  const [cityChars,    setCityChars]    = useState([])
  const [selectedChar, setSelectedChar] = useState(null)

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

  // Fetch PNJs + joueurs présents dans la ville (hors bâtiments)
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

  // Combat automatique si NPC(s) agressif(s) sur la même case que le joueur
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
    // Injecter le terrain dans chaque case (sans écraser les autres infos)
    for (let r = 0; r < city.height; r++)
      for (let c = 0; c < city.width; c++) {
        const pos = `${c},${r}`
        map[pos] = { terrain: terrainRef.current?.map[pos] ?? '', ...(map[pos] ?? {}) }
      }
    return map
  }, [city, cityChars])

  const [pc, pr] = (playerPos ?? '0,0').split(',').map(Number)

  function handleClick(pos, info) {
    const chars = info?.chars ?? []

    // Clic sur la case du joueur : ouvrir dialog si des persos sont là
    if (pos === playerPos) {
      const talkable = chars.find(c => c._type !== 'npc' || c.action !== 'Attaquer')
      if (talkable) setSelectedChar(talkable)
      return
    }

    if (info?.building) { actions.enterBuilding(info.building.id); return }
    if (info?.exit)     { actions.exitToWorld();                    return }

    const [tc, tr] = pos.split(',').map(Number)
    const distance = Math.abs(tc - pc) + Math.abs(tr - pr)
    const cost     = Math.round(distance * 10) / 100
    if (forme < cost) return

    actions.movePlayer(pos, cost)

    // Interaction après le déplacement
    const aggressors = chars.filter(c => c._type === 'npc' && c.action === 'Attaquer')
    if (aggressors.length > 0) {
      actions.startCombat(aggressors)
    } else if (chars.length > 0) {
      setSelectedChar(chars[0])
    }
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* En-tête */}
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
        🏙️ {city.name}
      </Typography>

      {/* Grille */}
      <Box sx={{
        display: 'inline-flex', flexDirection: 'column',
        border: '3px solid #2c3e50', bgcolor: '#e8e4d8',
      }}>
        {Array.from({ length: city.height }, (_, row) => (
          <Box key={row} sx={{ display: 'flex' }}>
            {Array.from({ length: city.width }, (_, col) => {
              const pos      = `${col},${row}`
              const distance = Math.abs(col - pc) + Math.abs(row - pr)
              const cost     = Math.round(distance * 10) / 100
              return (
                <GridCell
                  key={pos}
                  pos={pos}
                  info={cellMap[pos]}
                  isPlayer={pos === playerPos}
                  groupeSize={pos === playerPos ? (groupe?.length ?? 0) : 0}
                  canReach={forme >= cost}
                  onClick={handleClick}
                />
              )
            })}
          </Box>
        ))}
      </Box>

      {/* Footer */}
      <Paper sx={{ mt: 2, p: 1.5, bgcolor: '#2c3e50', color: '#fff',
        display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center', borderRadius: 2 }}>
        <Typography variant="body2">📍 {playerPos}</Typography>
        <Typography variant="body2">⚡ Forme : {forme.toFixed(1)}</Typography>
        <Typography variant="body2">
          👤 Maire : {city.mayor || '—'}
        </Typography>
        {cityChars.length > 0 && (
          <Typography variant="body2" sx={{ ml: 'auto' }}>
            👥 {cityChars.length} présence{cityChars.length > 1 ? 's' : ''} détectée{cityChars.length > 1 ? 's' : ''}
          </Typography>
        )}
      </Paper>

      {/* Dialog interactions personnage */}
      <CharacterDialog
        target={selectedChar}
        open={!!selectedChar}
        onClose={() => setSelectedChar(null)}
      />
    </Box>
  )
}
