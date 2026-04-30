import React      from 'react'
import MainView   from './components/MainView'
import HUDJoueur  from './components/HUDJoueur'
import GameMap    from './components/GameMap'
import LoginGate  from './components/LoginGate'

const Kratland = React.forwardRef((props, ref) => {
  return (
    <LoginGate>
      <MainView ref={ref} {...props}>
        <HUDJoueur />
        <GameMap />
      </MainView>
    </LoginGate>
  )
})

Kratland.displayName = 'Kratland'
export default Kratland
