import React from 'react'
import { useReglages } from './ReglageContext';
import { Button } from '@mui/material';
import { useBull } from './BulContext';
import BulleButton from './BulleButton';

const RandomConfig = ()=>{

    const {  setAttrRapports,  setRepRapports,NB_FEU, setNB_FEU, NB_EAU, setNB_EAU , NB_AIR, setNB_AIR, NB_TERRE, setNB_TERRE
        , FORCEFACTOR, setFORCEFACTOR, setNB_YEUX } = useReglages();
        const { reset } = useBull();

    const makeMagic=()=>{
        const attrRapport = generateRandomRapports();
        const repRapport = generateRandomRapports();
        // evite d'avoir le meme dans attraction et repulsion
        for(let attr in repRapport){
         for(let subElt in repRapport[attr]){
          if(attrRapport[attr][subElt]!=null)
            delete attrRapport[attr][subElt];// on enleve l'attraction
         }
        }
        const { NB_AIR, NB_EAU, NB_FEU, NB_TERRE,NB_YEUX, FORCEFACTOR } = generateRandomValues();

        setNB_AIR(NB_AIR);
        setNB_EAU(NB_EAU);
        setNB_FEU(NB_FEU);
        setNB_TERRE(NB_TERRE);
        setFORCEFACTOR(FORCEFACTOR); 
        setNB_YEUX(NB_YEUX)
        setAttrRapports(attrRapport);
        setRepRapports(repRapport);
        reset();
    }

    return <BulleButton onClick={makeMagic}>Config au hasard</BulleButton>
    
}
export default RandomConfig;

const generateRandomRapports = () => {
    const elements = ['feu', 'air', 'eau', 'terre'];
    const rapports = {};
  
    for (const element of elements) {
      rapports[element] = {};
  
      // Générer un nombre aléatoire de rapports pour chaque élément (de 0 à 2)
      const numRapports = Math.floor(Math.random() * 3);
      const otherElements = [...elements]
  
      for (let i = 0; i < numRapports; i++) {
        const otherElement = otherElements[Math.floor(Math.random() * otherElements.length)];
        const value = Math.random() * 5; // Valeur aléatoire entre 0 et 5
  
        rapports[element][otherElement] = value;
      }
    }
  
    return rapports;
  };
  const generateRandomValues = () => {
    const generateRandomValueInRange = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
  
    const NB_AIR = generateRandomValueInRange(10, 100);
    const NB_EAU = generateRandomValueInRange(10, 100);
    const NB_FEU = generateRandomValueInRange(10, 100);
    const NB_TERRE = generateRandomValueInRange(10, 100);
    const NB_YEUX = generateRandomValueInRange(3, 20);
    const FORCEFACTOR = generateRandomValueInRange(2, 12);
  
    return {
      NB_AIR,
      NB_EAU,
      NB_FEU,
      NB_YEUX,
      NB_TERRE,
      FORCEFACTOR,
    };
  };
  