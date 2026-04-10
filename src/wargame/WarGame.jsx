
import React from 'react';
import GameLayout from './GameLayout';
import { WarGameProvider } from './WarGameContext';

const WarGame = ()=>{
      return <WarGameProvider>
        <GameLayout/>
    </WarGameProvider>
}
export default WarGame;