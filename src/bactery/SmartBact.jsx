import React, { useState, useEffect, useRef, useMemo, useLayoutEffect, useCallback } from "react";
import { Box, Button, List, ListItem, ListItemIcon, ListItemText, Menu, MenuItem, TextField, Typography } from "@mui/material";
import SmartBactContext, { calculateDistance, useSB } from "./SmartBactContext";
import SmartBactery from "./SmartBactery";
import { RSRC, SBRessource } from "./SmartRSRC";
import Ruche from "./Ruche";

import fondTerre from './images/fondTerre.jpg';

export const bactWidth = 20;
export const bactHeight = 20;







export const SmartBactPanel = () => {
    const [frameWidth, setFrameWidth] = useState(0);
    const [frameHeight, setFrameHeight] = useState(0);
    const aquaRef = useRef();
    useLayoutEffect(() => {
        if (aquaRef.current) {
            setTimeout(()=>{

                const { width, height } = aquaRef.current.getBoundingClientRect();
                setFrameWidth(width);
                setFrameHeight(height);
            },500);
        }
      }, [aquaRef]);
    useEffect(() => {
        const handleResize = () => {
            const { width, height } = aquaRef.current.getBoundingClientRect();
          setFrameWidth(width);
          setFrameHeight(height);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    
    const initialConfig = {
        frameHeight, frameWidth
    }
    return <Box sx={{height:'100%'}}>
        <SmartBactContext  {...initialConfig}>
            <Etuve  ref={aquaRef}     {...initialConfig} />
        </SmartBactContext>
    </Box>
}
export default SmartBactPanel;
export const Etuve = React.forwardRef(({ frameWidth, frameHeight },aquaRef) => {

    const { bacteries, setBacteries, attire, initialize , cycleDeVie, ressources, setRessources, baseStock, getSkill, niveau} = useSB();
    const {numGrass} = getSkill();
    const [frameRate, setframeRate] = useState(10); // Taux de rafraîchissement de la simulation (en fps)
   
    const faisPousserRessource = useCallback(()=>{
        const rs = Object.keys(RSRC);
        if(frameWidth<100)
            return;

const weights = Object.values(RSRC).map(item => item.weight);
const randomType = getRandomTypeWithWeights(rs, weights);
        if(RSRC[randomType].niveau>niveau)
            return;
        // DEFINITION Ressource
        const randomRessource={
            type:randomType
            , reserve:RSRC[randomType].reserveBase
            ,position:{x:Math.random()*frameWidth, y:Math.random()*frameHeight}}
        setRessources(r=>{
            const newRess=[...r];
            if(r.length<numGrass)
                newRess.push(randomRessource);
            return newRess;
        })
    },[frameHeight, frameWidth, numGrass, setRessources, niveau]);
    
    useEffect(()=>{
       const intvl = setInterval(()=>{
        cycleDeVie();
        faisPousserRessource();
        },frameRate);
        return () => {
            clearInterval(intvl);
          };
    },[cycleDeVie, frameRate, faisPousserRessource]);
    

    return <Box sx={{height:'100%', display:'flex', flexDirection:'column'}}>
     
        <Box ref={aquaRef} display="flex" flexDirection="row"
        onClick={attire}
         sx={{position:'relative',height:'100%', width:'100%'}}>
           <Box sx={{width:'100%',height:'100%',opacity:0.5, backgroundImage:`url(${fondTerre})`, backgroundSize:'contain'}}/>
                <Ruche 
                frameWidth={frameWidth} frameHeight={frameHeight}/>
                {bacteries.map(bact => {
                    return <SmartBactery key={bact.ptiNom}
                        bacterie={bact}
                    />
                })}
                {ressources.map((patch, idx) => (
          <SBRessource key={patch.id} ressource={patch} />
        ))}
               
           

        </Box>

        <Box sx={{display:'flex', gap:4}}>
            
            <TextField sx={{marginLeft:5}} label="Taux de rafraichissement" value={frameRate} type="number"
                onChange={evt => (setframeRate(evt.target.value))} />
            <Box sx={{display:'flex', flex:1}}>
                <Typography variant="h6">Ressources</Typography>
                <Box sx={{display:'flex'}}>
                   {Object.keys(baseStock).map((ressType,ridx)=>{
                    const RS = RSRC[ressType];
                    const RessIcon = RS.icon;
                    return <ListItem key={ridx}>
                        <ListItemIcon>
                            <RessIcon  sx={{color:RS.color}}/>
                        </ListItemIcon>
                        <ListItemText primary={ressType} secondary={baseStock[ressType]} />
                    </ListItem>
                   })} 
                </Box>
            </Box>
            <Button title="Reset"  onClick={initialize}>Reset</Button>
        </Box>
    </Box>
})


const getRandomTypeWithWeights=(types, weights)=> {
    // Vérification de la cohérence entre les tableaux
    if (types.length !== weights.length) {
      throw new Error("Les tableaux types et weights doivent avoir la même longueur.");
    }
  
    // Créer un tableau pondéré
    const weightedTypes = [];
    types.forEach((type, index) => {
      for (let i = 0; i < weights[index]; i++) {
        weightedTypes.push(type);
      }
    });
  
    // Sélectionner un élément aléatoire dans le tableau pondéré
    const randomIndex = Math.floor(Math.random() * weightedTypes.length);
    return weightedTypes[randomIndex];
  }