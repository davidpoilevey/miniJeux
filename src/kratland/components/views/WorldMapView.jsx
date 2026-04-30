

import { useState, useEffect, useMemo, useRef } from 'react'
import { Box, Typography, Tooltip, Paper } from '@mui/material'
import { useKrat } from '../../context/KratContext'
import { pb }       from '../../services/pb'

function rollTerrainEmoji() {
  const r = Math.random()
  if (r > 0.985) return '🌋'
  if (r > 0.96)  return '⛰️'
  if (r > 0.93)  return '🌲'
  if (r > 0.91)  return '🌳'
  return ''
}

const CELL_SIZE = 34

export default function WorldMapView() {
  const { state, actions } = useKrat()
  const { world, player } = state
  const [others, setOthers] = useState([])

  const forme = player.jauges.forme.current
  const playerPos = player.location.position
  const [pc, pr] = (playerPos ?? '0,0').split(',').map(Number)

  // Terrain généré une seule fois et figé dans un ref
  const terrainRef = useRef(null)
  if (!terrainRef.current ||
      terrainRef.current.width !== world.width ||
      terrainRef.current.height !== world.height) {
    const map = {}
    for (let r = 0; r < world.height; r++)
      for (let c = 0; c < world.width; c++)
        map[`${c},${r}`] = rollTerrainEmoji()
    terrainRef.current = { width: world.width, height: world.height, map }
  }

  // 1. Récupération des données réelles (PNJs + Joueurs)
  useEffect(() => {
    let cancelled = false
    if (pb === null || world.id === '') return null;
    // On récupère tout le monde sur la carte du monde
    Promise.all([
      pb.collection('kratNpcs').getFullList(),
      pb.collection('kratPlayers').getFullList(),
    ]).then(([npcs, players]) => {
      if (cancelled) return

      const all = [
        ...npcs.map(n => ({ ...n, _type: 'npc' })),
        ...players
          .filter(p => p.id !== player.id)
          .map(p => ({ ...p, _type: 'player' })),
      ]

    // Filtrage : on ne garde que ceux qui sont "hors sol" (pas en ville, pas en bâtiment)
const worldChars = all.filter(c => {
  // Sécurité pour le parsing
  let loc = c.location;
  if (typeof loc === 'string') {
    try { loc = JSON.parse(loc); } catch (e) { return false; }
  }
  
  if (!loc) return false;

  // Logique d'inclusion sur le World :
  // 1. Doit avoir une position (x,y)
  // 2. city doit être null (ou undefined/vide)
  // 3. building doit être null (ou undefined/vide)
  const hasPosition = !!loc.position;
  const isNotInCity = !loc.city;
  const isNotInBuilding = !loc.building;

  return hasPosition && isNotInCity && isNotInBuilding;
});

      setOthers(worldChars)
    }).catch(err => console.error("Erreur fetch world:", err))

    return () => { cancelled = true }
  }, [world.id, playerPos]) // On rafraîchit quand on bouge ou change de monde

  // 2. Mapping de la grille (Villes + Personnages)
  const cellMap = useMemo(() => {
    const map = {}
    
    // On place les villes
    world.cities.forEach(c => { 
        map[c.position] = { type: 'city', info: c, emoji: '🏙️' } 
    })

    // On place les personnages (PNJ ou Players)
    others.forEach(char => {
      const loc = typeof char.location === 'string' ? JSON.parse(char.location) : char.location
      const pos = loc.position
      
      // Priorité : si plusieurs sur la case, on peut stocker un array ou le premier
      if (!map[pos] || map[pos].type !== 'city') {
        map[pos] = { 
          type: char._type, 
          info: char, 
          emoji: char._type === 'player' ? '👤' : (char.role === 'monstre' ? '🐅' : '🧙') 
        }
      }
    })
    
    return map
  }, [world.cities, others])

  const handleClick = (pos, cellData) => {
    if (pos === playerPos) return
    
    if (cellData?.type === 'city') return actions.enterCity(cellData.info.id)
    if (cellData?.type === 'npc') return actions.startCombat(cellData.info) // Ta future feature !
    
    // Déplacement classique
    const [tc, tr] = pos.split(',').map(Number)
    const distance = Math.abs(tc - pc) + Math.abs(tr - pr)
    const cost = Math.round(distance * 10) / 100
    if (forme >= cost) actions.movePlayer(pos, cost)
  }


  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>🗺️ {world.name}</Typography>

      <Box sx={{
        display: 'inline-flex', flexDirection: 'column',
        border: '3px solid #2c3e50', bgcolor: '#f0f0f0'
      }}>
        {Array.from({ length: world.height }, (_, r) => (
          <Box key={r} sx={{ display: 'flex' }}>
            {Array.from({ length: world.width }, (_, c) => {
              const pos = `${c},${r}`
              const cellData = cellMap[pos]
              const isPlayer = pos === playerPos
              const terrain = terrainRef.current.map[pos]

              const distance = Math.abs(c - pc) + Math.abs(r - pr)
              const cost = Math.round(distance * 10) / 100
              const canReach = forme >= cost

              return (
                <Tooltip key={pos} title={cellData?.info?.name || (isPlayer ? "Moi" : `Coût: ${cost}`)}>
                  <Box
                    onClick={() => handleClick(pos, cellData)}
                    sx={{
                      width: CELL_SIZE, height: CELL_SIZE,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '22px', cursor: canReach ? 'pointer' : 'default',
                      border: '0.1px solid rgba(0,0,0,0.05)',
                      opacity: canReach || isPlayer ? 1 : 0.4,
                      bgcolor: isPlayer ? 'rgba(0,255,0,0.1)' : 'transparent',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' }
                    }}
                  >
                    {isPlayer ? '🧙‍♂️' : (cellData?.emoji || terrain)}
                  </Box>
                </Tooltip>
              )
            })}
          </Box>
        ))}
      </Box>

      <Paper sx={{ mt: 2, p: 2, bgcolor: '#2c3e50', color: '#fff', display: 'flex', gap: 3 }}>
        <Typography variant="body2">📍 {playerPos}</Typography>
        <Typography variant="body2">⚡ Forme: {forme.toFixed(1)}</Typography>
        <Typography variant="body2" sx={{ ml: 'auto' }}>👥 {others.length} présences détectées</Typography>
      </Paper>
    </Box>
  )
}