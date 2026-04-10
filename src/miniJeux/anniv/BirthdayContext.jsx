import React, { createContext, useContext, useState } from 'react';
import { CAKE_W, CANDLE_H } from './Birthday';
import { soundManager } from '../../rpg/sons/SoundManager';

export const BirthdayContext = createContext();
export const useBirthday = () => useContext(BirthdayContext);

export const LEVELS = [
  { level: 1, candles: 5,  label: '5 ans 👶' },
  { level: 2, candles: 10, label: '10 ans 🎒' },
  { level: 3, candles: 20, label: '20 ans 🍺' },
  { level: 4, candles: 30, label: '30 ans 😬' },
  { level: 5, candles: 54, label: '54 ans 🧓' },
];

export const BirthdayProvider = ({ children }) => {
  const [phase, setPhase] = useState('idle'); // idle | playing | win | lose
  const [level, setLevel] = useState(LEVELS[0]);
  const [candles, setCandles] = useState([]);

  const startGame = (selectedLevel) => {
    setLevel(selectedLevel);
    // Chaque bougie a une position relative fixe sur le gâteau
    const total = selectedLevel.candles;
   
const ROWS = total <= 10 ? 1 : total <= 30 ? 2 : 3;
const perRow = Math.ceil(total / ROWS);

const newCandles = Array.from({ length: total }, (_, i) => {
  const row = Math.floor(i / perRow);
  const posInRow = i % perRow;
  const countInRow = Math.min(perRow, total - row * perRow);
  return {
    id: i,
    lit: true,
    offsetX: -CAKE_W / 2 + 20 + (posInRow * (CAKE_W - 40)) / (countInRow - 1 || 1),
    offsetY: -55 - row * CANDLE_H, // chaque rangée monte de 35px
  };
});
    setCandles(newCandles);
    setPhase('playing');
  };

  const blowCandle = (id) => {
    setCandles(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, lit: false } : c);
      if (updated.every(c => !c.lit)) {
        setPhase('win');
         soundManager.play('yeah');
      }
      return updated;
    });
  };

  const endGame = () => {
    setPhase('lose');
    soundManager.play('ohhh');
  }

  return (
    <BirthdayContext.Provider value={{
      phase, level, levels: LEVELS, candles,
      startGame, blowCandle, endGame, setPhase
    }}>
      {children}
    </BirthdayContext.Provider>
  );
};