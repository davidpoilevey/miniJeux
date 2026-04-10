import React, { useState, useEffect, useRef, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import { SEUIL_PREDATEUR,SEUIL_BOOST } from "./Aquarium";
import BacterieDiv from "./BacterieDiv";
import { Adb, BrightnessMedium, Church, Diversity2, Flatware, PestControl, Pets } from "@mui/icons-material";

export const getAggressiviteColor=aggressivite=>{
  let aggColor = 'green';
  if (aggressivite>1) aggColor='teal';
  if (aggressivite>3) aggColor='blue';
  if (aggressivite>7) aggColor='purple';
  if (aggressivite>SEUIL_BOOST) aggColor='red';
  if (aggressivite>SEUIL_PREDATEUR) aggColor='maroon';
  return aggColor;
}
const Bactery = React.forwardRef(({ setDead = () => { }
, type, specialEffect, vitesseMax, champVision, reproductionEnergyThreshold=150
, scars=[], glisse
, ...props }, transmittedRef) => {
  const [position, setPosition] = useState(props.position ?? { x: 0, y: 0 });
  const [vitesse, setVitesse] = useState(props.vitesse ?? { x: 0, y: 0 });
  const [energy, setEnergy] = useState(props.energy ?? 100);
  const [_vitesseMax, setVitesseMax] = useState(vitesseMax);
  const [isAlive, setIsAlive] = useState(props.alive ?? true);
  const [aggressivite, setaggressivite] = useState(props.aggressivite);
  const [canReproduce, setCanReproduce] = useState(false);
  const [seuilReproduction, setseuilReproduction] = useState(reproductionEnergyThreshold);
  const [aggressiviteColor, setAggColor] = useState('green');

  const [name, setName] = useState(props.ptiNom ?? 'noName');
  const [color, setColor] = useState(props.color || 'green');
  const ref = useRef(transmittedRef);

  // Mettre à jour la position, la vitesse et l'énergie
  useEffect(() => {
    // always overried by param
    if (props.position != null)
      setPosition(props.position)
    if (props.vitesse != null)
      setVitesse(props.vitesse);
      if (props.aggressivite != null)
        setaggressivite(props.aggressivite);
    if (props.energy != null) {
      setEnergy(props.energy);
      setCanReproduce(props.energy >= seuilReproduction);
    }

  }, [props.position, props.vitesse, props.energy, aggressivite, seuilReproduction]);
  useEffect(() => {
    // checks on energy changes

    if (energy <= 0)
      return meurt();
    if (energy <= 50)
      setColor('maroon');
    if (energy <= 20)
      setColor('black');
    if (energy > 50)
      setColor('green');
    if (energy > 100)
      setColor('blue');
      if (energy > (reproductionEnergyThreshold-20))
        setColor('gold');
    let aggColor=getAggressiviteColor(aggressivite)
   
      setAggColor(aggColor);
      
    setCanReproduce(energy >= seuilReproduction);
  }, [energy, aggressivite,seuilReproduction])
  
const getJson = ()=>{
  return {
    ptiNom:name,
    position, vitesse, vitesseMax, alive:isAlive, champVision, scars, color, glisse, aggressivite
    , type, energy, specialEffect, reproductionEnergyThreshold:seuilReproduction}
  }


  //   ********  Vie et mort  *********
  const reproduce = () => {
    const newVitesse = { x: -vitesse.x, y: -vitesse.y }; // Reproduction avec même vitesse plus deviation
    const newX = position.x + 2*newVitesse.x; // Variation aléatoire de position
    const newY = position.y + 2*newVitesse.y

    const newName = generateUniqueName(name);
    setEnergy(prevNRJ=>(prevNRJ/2));
    setCanReproduce(false);
    setseuilReproduction(seuilReproduction+20);// on reduit la capacite a se reproduire.. vieillissement
   
    const cv = props.champVision + Math.random() * 10 - 5; // Variation aléatoire de champ de vision
    const vm = props.vitesseMax + Math.random() * 4 - 2; // Variation aléatoire de vitesseMax
    let newGlisse = glisse + Math.random()*0.01-0.02; // Variation aléatoire de glisse +/- 0.02 max de 0.99
    if(newGlisse>0.99)
      newGlisse=0.99;
    const seuil = seuilReproduction + Math.random() * 10 - 5; // Variation aléatoire de reproductionSeuil
    // Créer une nouvelle bactérie avec les mêmes propriétés
    const parentString = name.substring(0,4);
    const nouveauNom=`${newName} ${parentString}son`
    const newBactery = {
      position: { x: newX, y: newY },
      vitesse: newVitesse,
      energy: energy / 2, // Partage d'énergie avec la nouvelle bactérie
      ptiNom: nouveauNom, // Nom différent pour la nouvelle bactérie
      color: color, // Couleur identique
      alive:true
      , champVision:cv
      , vitesseMax:vm
      , scars:[]
      , type:type
      , glisse : newGlisse
     , reproductionEnergyThreshold: seuil, // Seuil de reproduction identique
    };
  
    // Ajouter la nouvelle bactérie à l'Etuve (ou à un autre endroit approprié)
    props.addToEtuve(newBactery, getJson());
  };
  
  useEffect(() => {
    if(canReproduce){
      reproduce();
    }
  },[canReproduce,reproduce]);
  const meurt = () => {
    setIsAlive(false);
    setVitesse({ x: 0, y: 0 });
    setColor('red');
    setDead(getJson());
    // add to grass
  }
  const [icon] = useMemo(() => {
    let ic = <PestControl color={color} />;
    if (type == 'mutant') {
      ic = <BrightnessMedium />;
    }
    if(aggressivite>SEUIL_PREDATEUR)
      ic = <Pets/>
    if (type == 'avenger') {
      ic = <Adb />;
      if(aggressivite>SEUIL_PREDATEUR)
        ic = <Diversity2/>
    }
    return [ic]
  }, [type,aggressivite])

  const asJson = getJson(); 
  if (!isAlive)
    return null;
  return <BacterieDiv ref={ref} bacterie={asJson} 
    isAlive={isAlive}
    icon={icon}
    typeColor={aggressiviteColor}
    handleMouseLeave={props.handleMouseLeave}
    onOpenInfo={props.onOpenInfo} />

});





export default Bactery


const generateUniqueName = (parentName)=> {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let name = '';

  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * letters.length);
    const randomLetter = letters.charAt(randomIndex);
    name += randomLetter;
  }
  if(parentName.indexOf('son')<0)
    name+='1';
  else{
    // then parent owns the generation count
    const genCount = parentName.substring(3,4);
    name+=(Number(genCount)+1);
  }

  return name;
}
