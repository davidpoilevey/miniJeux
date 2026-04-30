/**
 * GameMap — Routeur de vues principal.
 *
 * Affiche la vue correspondant à state.currentView :
 *   'building'  → BuildingRoomView
 *   'combat'    → CombatView
 *   'worldmap'  → WorldMapView  (placeholder)
 *   'city'      → CityView      (placeholder)
 */
import React             from 'react'
import Box               from '@mui/material/Box'
import CircularProgress  from '@mui/material/CircularProgress'

import BuildingRoomView from './views/BuildingRoomView'
import CombatView       from './views/CombatView'
import WorldMapView     from './views/WorldMapView'
import CityView         from './views/CityView'
import { useKrat }      from '../context/KratContext'

const VIEWS = {
  building: BuildingRoomView,
  combat:   CombatView,
  worldmap: WorldMapView,
  city:     CityView,
}

export default function GameMap() {
  const { state } = useKrat()

  const ViewComponent = VIEWS[state.currentView] ?? BuildingRoomView

  return (
    <Box sx={{ p: 4, minHeight: '100vh', position: 'relative' }}>
      {state.loading && (
        <Box sx={{
          position: 'absolute', inset: 0, zIndex: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          bgcolor: 'rgba(245,242,235,0.7)',
        }}>
          <CircularProgress size={40} sx={{ color: 'primary.main' }} />
        </Box>
      )}
      <ViewComponent />
    </Box>
  )
}
