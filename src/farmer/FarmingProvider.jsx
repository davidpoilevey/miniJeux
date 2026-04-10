// src/context/FarmingContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentMission, MISSION_TYPES, MISSIONS_BY_LEVEL, PRODUCTIONS } from './farmData';
import ConfigDialog from './ConfigDialog';

const FarmingContext = createContext();
const LOCAL_STORAGE_KEY = 'farming-save';
const emptyResources = {
    wheat: 0, carrot: 0,  raisin: 0, orange:0,piment:0, onion:0, bite:0,cul:0,chatte:0
  }

export const useFarming = () => useContext(FarmingContext);
const DEFAULT_PROGRESS={
    progress:  0,
    completed: false, claimed:false
  }

export const FarmingProvider = ({ children }) => {
  const [fields, setFields] = useState([]);
  const [money, _setMoney] = useState(200);
  const [level, setLevel] = useState(1);
  const [xMode, setXMode] = useState(false);
  const [logMessage, setLogMessage] = useState();
  const [warehouseSize, setEntrepotSize] = useState(25);
  const [configOpened, openConfig] = useState(false);
  const [diamond, setDiamond] = useState(1);
   const [missionProgress, setMissionProgress] = useState(DEFAULT_PROGRESS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [engrais, setEngrais] = useState(10);
  const [resources, setResources] = useState(emptyResources);
  const [buildings, setBuildings] = useState({});
  const [commandes, setCommandes] = useState([]);

const livreCommande = commandeId=>{
  const commande = commandes.find(c => c.id === commandeId);
      if (!commande) return;
  const currentStock = resources[commande.itemId] || 0;
      // Vérifier si la commande peut être livrée
      if (!currentStock >= commande.quantite) {
        return; // Ne rien faire si pas assez de stock
      }
       if(getCurrentMission(level).type===MISSION_TYPES.DELIVER_ORDERS)
      setMissionProgress(prev=>({...prev, progress:prev.progress+1}));
  setLogMessage("commande effectuée");
      const updatedStock = { ...resources, [commande.itemId]: currentStock - commande.quantite };
      const newCommandes = commandes.filter(c => c.id !== commandeId);
  
      setResources(updatedStock);
      setMoney(money + commande.reward);
      setCommandes(newCommandes);
}
const jetteResource = (ressID, nb)=>{
  setResources(prev=>{
   return {...prev, [ressID]:prev[ressID]-nb}
  });
  setLogMessage("Vous venez de jeter "+nb+" "+ressID);
}
  const setMoney = bonus=>{
    const earntMoney = bonus-money;
    if(earntMoney>0 && getCurrentMission(level).type===MISSION_TYPES.EARN_MONEY)
      setMissionProgress(prev=>({...prev, progress:prev.progress+earntMoney}));
    _setMoney(bonus);
  }
  const levelUp = (reward) => {
    setLevel(prev=>(prev+1));
    _setMoney(prev=>(prev+(reward.money||0)));
    setDiamond(prev=>(prev+(reward.diamond||0)));
    setEngrais(prev=>(prev+(reward.engrais||0)));
    setMissionProgress(DEFAULT_PROGRESS);
    setLogMessage("Nouveau niveau !");
  }
  const reset=()=>{
    setLevel(1);setFields([]);setEntrepotSize(25);
    _setMoney(200); setResources(emptyResources);setBuildings([]);
    setDiamond(1);
    setEngrais(10);
    setMissionProgress(DEFAULT_PROGRESS);
    setLogMessage("Tu repars a zero");
  }
  const setXmode=(newXMode=true)=>{
    setLevel(11);setResources(emptyResources);
    setEngrais(prev=>prev+10);
    setMissionProgress(DEFAULT_PROGRESS);
    setXMode(newXMode);
    setLogMessage("On veut du frisson ?");
  }
 

  // special case building mission
  useEffect(()=>{

      
      if(getCurrentMission(level).type===MISSION_TYPES.BUILD_BUILDING 
                &&buildings[getCurrentMission(level).targetBuilding]!=null)
     setMissionProgress(prev=>({...prev, progress:prev.progress+1, completed:true}));
  },[level])
  //Production
  useEffect(() => {
  const interval = setInterval(() => {
    setBuildings(prevBuildings => {
      const newBuildings = { ...prevBuildings };
      const newRessources = { ...resources };
    
      for (const [id, building] of Object.entries(prevBuildings)) {
        const { currentProduction, productionStarted } = building;
        if (!currentProduction || !productionStarted) continue;

        const prod = PRODUCTIONS.find(p => p.id === currentProduction);
        if (!prod) continue;

        const elapsed = Date.now() - productionStarted;

        if (elapsed >= prod.tempsProduction) {
            // Ajoute la production
            newRessources[prod.id] = (newRessources[prod.id] || 0) + prod.quantiteProduite;

    if(getCurrentMission(level).type===MISSION_TYPES.PRODUCE_ITEM)
      setMissionProgress(prev=>({...prev, progress:prev.progress+prod.quantiteProduite}));
setLogMessage("Fabrication de "+prod.name+" terminée dans "+building.name);
            // Stop la production
            newBuildings[id] = {
              ...building, currentProduction:null,
              productionStarted: null
            };
          
        }
      }

      // Met à jour ressources et bâtiments
      setResources(newRessources);
      return newBuildings;
    });
  }, 1000);

  return () => clearInterval(interval);
}, [resources, setBuildings, setResources]);

  // Chargement depuis localStorage au démarrage
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.money !== undefined) _setMoney(parsed.money);
        if (parsed.diamond !== undefined) setDiamond(parsed.diamond);
        if (parsed.resources) setResources(parsed.resources);
        if (parsed.buildings) setBuildings(parsed.buildings);
        if (parsed.commandes) setCommandes(parsed.commandes);
        if (parsed.fields) setFields(parsed.fields);
        if (parsed.engrais) setEngrais(parsed.engrais);
        if (parsed.warehouseSize) setEntrepotSize(parsed.warehouseSize);
        if (parsed.level) setLevel(parsed.level);
        if (parsed.missionProgress) setMissionProgress(parsed.missionProgress);
      } catch (e) {
        console.error('Erreur de chargement de la sauvegarde :', e);
      }
    }
    setIsLoaded(true);
  }, []);
   // Sauvegarde automatique à chaque changement majeur
  useEffect(() => {
    if(!isLoaded)
        return;
    const save = {
      resources,
      buildings,
      commandes, engrais,
      fields,level,missionProgress,
      money, diamond, warehouseSize
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(save));
  }, [resources, buildings, commandes, fields, isLoaded]);

  const value = {
    resources, fields,setFields,level, missionProgress, setMissionProgress,
    setResources,setMoney,money,diamond, setDiamond, 
    buildings,warehouseSize,setEntrepotSize,logMessage, setLogMessage,
    setBuildings, livreCommande, jetteResource, reset, openConfig
    ,commandes, setCommandes,levelUp, engrais, setEngrais
    , xMode, setXmode, setLevel
  };

  return (
    <FarmingContext.Provider value={value}>
      {children}
      <ConfigDialog open={configOpened} onClose={()=>{openConfig(false)}}/>
    </FarmingContext.Provider>
  );
};