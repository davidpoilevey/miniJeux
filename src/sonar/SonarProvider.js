// SonarProvider.js
import React, { createContext, useState } from 'react';

export const SonarContext = createContext();
const SonarProvider = ({ children }) => {
  const [sonarRadius, setSonarRadius] = useState(200);
  const [boatSpeed, setBoatSpeed] = useState(1);
  const [playerCoins, setPlayerCoins] = useState(2000);

  return (
    <SonarContext.Provider
      value={{
        sonarRadius,
        setSonarRadius,
        boatSpeed,
        setBoatSpeed,
        playerCoins,
        setPlayerCoins,
      }}
    >
      {children}
    </SonarContext.Provider>
  );
};

export default SonarProvider;
