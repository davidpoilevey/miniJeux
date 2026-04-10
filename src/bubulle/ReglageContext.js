// ReglagesContext.js
import React, { createContext, useContext, useState } from 'react';

const ReglagesContext = createContext();

export function useReglages() {
  return useContext(ReglagesContext);
}

export function ReglagesProvider({ children }) {

const [NB_FEU, setNB_FEU] = useState(5);
const [NB_EAU, setNB_EAU] = useState(5);
const [NB_AIR, setNB_AIR] = useState(5);
const [NB_TERRE, setNB_TERRE] = useState(5);
const [FORCEFACTOR, setFORCEFACTOR] = useState(2);
const [NB_YEUX, setNB_YEUX] = useState(5);

  const [rayonInfluence, setRayonInfluence] = useState(100);
  const [attractionRapport, setAttrRapports] = useState({
    feu: {
    },
    air: {
    },
    eau: {
    },
    terre: {
    },
  });
  const [repulsionRapport, setRepRapports] = useState({
    feu: {
    },
    air: {
    },
    eau: {
    },
    terre: {
    },
  });

  return (
    <ReglagesContext.Provider value={{ attractionRapport, setAttrRapports, repulsionRapport, setRepRapports
    , rayonInfluence, setRayonInfluence, NB_FEU, setNB_FEU, NB_EAU, setNB_EAU , NB_AIR, setNB_AIR, NB_TERRE, setNB_TERRE
    , FORCEFACTOR, setFORCEFACTOR,NB_YEUX, setNB_YEUX}}>
      {children}
    </ReglagesContext.Provider>
  );
}
