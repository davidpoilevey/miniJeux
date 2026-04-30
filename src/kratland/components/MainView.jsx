/**
 * MainView — Mise en page principale du jeu.
 *
 * Attend exactement 2 enfants :
 *   1. Le contenu de la sidebar (HUDJoueur)
 *   2. Le contenu principal (GameMap)
 *
 * La sidebar est fixée à gauche (position: fixed).
 * Le contenu principal prend tout l'espace restant (ml = SIDEBAR_WIDTH).
 */
import React from 'react'
import Box   from '@mui/material/Box'

const SIDEBAR_WIDTH = 300  // px

const MainView = React.forwardRef(({ children, ...props }, ref) => {
  const childArray = React.Children.toArray(children)
  const sidebarContent = childArray[0]
  const mainContent    = childArray[1]

  return (
    <Box
      ref={ref}
      sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}
      {...props}
    >
      {/* ── Sidebar fixe ── */}
      <Box
        component="aside"
        sx={{
          width:       SIDEBAR_WIDTH,
          flexShrink:  0,
          position:    'fixed',
          top:         0,
          left:        0,
          height:      '100vh',
          bgcolor:     'background.paper',
          boxShadow:   '4px 0 24px rgba(28,28,19,0.07)',
          overflowY:   'auto',
          zIndex:      1200,
          display:     'flex',
          flexDirection: 'column',
          // Masquer la scrollbar native tout en conservant le défilement
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {sidebarContent}
      </Box>

      {/* ── Zone de contenu principale ── */}
      <Box
        component="main"
        sx={{
          flexGrow:   1,
          ml:         `${SIDEBAR_WIDTH}px`,
          minHeight:  '100vh',
          bgcolor:    'background.default',
        }}
      >
        {mainContent}
      </Box>
    </Box>
  )
})

MainView.displayName = 'MainView'
export { SIDEBAR_WIDTH }
export default MainView
