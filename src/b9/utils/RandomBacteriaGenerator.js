/**
 * RandomBacteriaGenerator - Génère des bactéries avec composants aléatoires
 */

import { OPTIONAL_COMPONENTS, SPECIALIZATION_COMPONENTS } from '../engine/components/Components.js';

/**
 * Génère une liste aléatoire de composants pour une bactérie
 * Chaque composant a une probabilité indépendante d'être activé
 * 
 * @param {number} activationProbability - Probabilité qu'un composant soit activé (0.0 - 1.0)
 * @returns {Array} Liste des noms de composants activés
 */
export function generateRandomComponents(activationProbability = 0.3) {
  const activeComponents = [];
  
  for (const componentName in OPTIONAL_COMPONENTS) {
    if (Math.random() < activationProbability) {
      activeComponents.push(componentName);
    }
  }
  
  return activeComponents;
}

/**
 * Génère des paramètres pour un composant donné en utilisant l'ADN
 * 
 * @param {string} componentName - Nom du composant
 * @param {ADNHandler} adnHandler - Handler ADN pour générer les paramètres
 * @returns {Array} Arguments pour le constructeur
 */
export function generateComponentParameters(componentName, adnHandler) {
  switch (componentName) {
    case 'Movement':
      return [adnHandler.readFloat(`${componentName}_speed`)];
      
    case 'ChemicalReceptor':
      const reactions = {};
      const reactionTypes = ['ATTRACT', 'REPEL', 'TOXIN', 'NUTRIENT', 'NEUTRAL'];
      ['A', 'B', 'C', 'D'].forEach(molecule => {
        const reactionIndex = Math.floor(adnHandler.readFloat(`${componentName}_reaction_${molecule}`) * reactionTypes.length);
        reactions[molecule] = reactionTypes[reactionIndex];
      });
      return [
        adnHandler.readFloat(`${componentName}_sensitivity`),
        Math.floor(adnHandler.readFloat(`${componentName}_radius`) * 5) + 1, // 1-5
        reactions
      ];
      
    case 'ChemicalEmitter':
      // Émet 1 à 3 molécules
      const numMolecules = Math.floor(adnHandler.readFloat(`${componentName}_numMolecules`) * 3) + 1;
      const allMolecules = ['A', 'B', 'C', 'D'];
      const emitted = [];
      for (let i = 0; i < numMolecules; i++) {
        const moleculeIndex = Math.floor(adnHandler.readFloat(`${componentName}_molecule_${i}`) * allMolecules.length);
        const molecule = allMolecules[moleculeIndex];
        if (!emitted.includes(molecule)) {
          emitted.push(molecule);
        }
      }
      return [
        emitted,
        adnHandler.readFloat(`${componentName}_rate`) * 2 // 0-2
      ];
      
    case 'Photosynthesis':
      return [adnHandler.readFloat(`${componentName}_efficiency`)];
      case 'Pipe':
  return [
    adnHandler.readFloat(`${componentName}_flowRate`) * 1.5 + 0.5, // 0.5-2.0
    adnHandler.readFloat(`${componentName}_pressure`) // 0.0-1.0
  ];
    case 'Filtration':
      const filterTypes = ['organic', 'mineral', 'all'];
      const filterIndex = Math.floor(adnHandler.readFloat(`${componentName}_type`) * filterTypes.length);
      return [
        filterTypes[filterIndex],
        adnHandler.readFloat(`${componentName}_efficiency`)
      ];
      
    case 'EnergyStorage':
      return [100 + adnHandler.readFloat(`${componentName}_capacity`) * 200]; // 100-300
      
    case 'ToxinTolerance':
      return [adnHandler.readFloat(`${componentName}_tolerance`)];
      case 'CarbonatePipe':
  return [
    adnHandler.readFloat(`${componentName}_direction`) * Math.PI * 2, // Angle 0-2π
    adnHandler.readFloat(`${componentName}_strength`), // 0.0-1.0
    adnHandler.readFloat(`${componentName}_maxLength`) * 20 + 10 // 10-30
  ];
    case 'Predator':
      return [
        adnHandler.readFloat(`${componentName}_power`) * 10 + 5, // 5-15
        Math.floor(adnHandler.readFloat(`${componentName}_range`) * 2) + 1 // 1-2
      ];
      
    case 'Parasite':
      return [adnHandler.readFloat(`${componentName}_drain`) * 1 + 0.1]; // 0.5-2.5
      
    case 'Symbiosis':
      return [
        adnHandler.readFloat(`${componentName}_share`) * 0.5,
        [] // acceptedPartners
      ];
      case 'ChemicalBurst':
  const molecules = ['A', 'B', 'C', 'D'];
  return [
    molecules[Math.floor(adnHandler.readFloat(`${componentName}_molecule`) * 4)],
    adnHandler.readFloat(`${componentName}_amount`) * 40 + 30 // 10-50
  ];
    case 'Immunity':
      return [adnHandler.readFloat(`${componentName}_defense`) * 10]; // 0-10
      
    case 'Cannibalism':
      return [adnHandler.readFloat(`${componentName}_consumption`) * 5]; // 0-5
      
    case 'Adhesion':
      return [adnHandler.readFloat(`${componentName}_strength`)];
      
    case 'ReinforcedWall':
      const protection = adnHandler.readFloat(`${componentName}_protection`) * 10;
      return [
        protection,
        protection * 0.1 // metabolicCost proportionnel
      ];
      
    case 'ColonialMatrix':
      return [
        adnHandler.readFloat(`${componentName}_strength`) * 5,
        Math.floor(adnHandler.readFloat(`${componentName}_radius`) * 3) + 2 // 2-4
      ];
      case 'Explosive':
  return [
    Math.floor(adnHandler.readFloat(`${componentName}_radius`) * 3) + 1, // 3-7
    adnHandler.readFloat(`${componentName}_damage`) * 200 + 50 // 50-250
  ];
    case 'ProgrammedDeath':
      return [
        Math.floor(adnHandler.readFloat(`${componentName}_lifespan`) * 2000) + 100, // 1000-6000 ticks
        adnHandler.readBool(`${componentName}_altruistic`)
      ];
      
    case 'BiologicalClock':
      return [
        adnHandler.readFloat(`${componentName}_period`) * 6 + 2, // 2-8 secondes
        adnHandler.readFloat(`${componentName}_phase`)
      ];
      
  case 'CellDivision':
  const patterns = ['ring', 'cross', 'random'];
  const patternIndex = Math.floor(adnHandler.readFloat(`${componentName}_pattern`) * 3);
  return [
    patterns[patternIndex],
    100 + adnHandler.readFloat(`${componentName}_threshold`) * 100 // 100-200
  ];
    case 'GeneticMutation':
      return [adnHandler.readFloat(`${componentName}_rate`) * 0.1]; // 0-10%
      
    case 'GeneticRecombination':
      return [
        adnHandler.readBool(`${componentName}_ability`),
        adnHandler.readFloat(`${componentName}_preference`)
      ];
      
    // Composants de spécialisation
    case 'EnhancedSensors':
      return [Math.floor(adnHandler.readFloat(`${componentName}_bonus`) * 4) + 2]; // 2-5
      
    case 'Muscular':
      return [
        adnHandler.readFloat(`${componentName}_movement`) * 0.3 + 0.2, // 0.2-0.5
        adnHandler.readFloat(`${componentName}_adhesion`) * 0.4 + 0.3  // 0.3-0.7
      ];
      
    case 'CrystallineCilia':
      return [adnHandler.readFloat(`${componentName}_attack`) * 0.4 + 0.3]; // 0.3-0.7
      
    case 'ThickCuticle':
      return [adnHandler.readFloat(`${componentName}_defense`) * 4 + 3]; // 3-7
      
    case 'MetabolicBoost':
      return [adnHandler.readFloat(`${componentName}_boost`) * 0.4 + 0.3]; // 0.3-0.7
      
    default:
      return [];
  }
}

/**
 * Calcule la couleur combinée d'une bactérie selon ses composants
 * Mélange les teintes HSL des composants actifs
 * 
 * @param {Array} componentNames - Liste des noms de composants actifs
 * @param {number} energyRatio - Ratio d'énergie (0.0 - 1.0) pour la luminosité
 * @returns {Object} { h, s, l } en HSL
 */
export function calculateBacteriaColor(componentNames, energyRatio = 0.5) {
  if (componentNames.length === 0) {
    // Bactérie basique sans composants = gris
    return {
      h: 0,
      s: 0,
      l: 40 + energyRatio * 20
    };
  }
  
  // Collecter les couleurs des composants
  const colors = componentNames
    .map(name => {
      // Chercher dans optionnels puis spécialisations
      const Component = OPTIONAL_COMPONENTS[name] || SPECIALIZATION_COMPONENTS[name];
      return Component && Component.COLOR ? Component.COLOR : null;
    })
    .filter(color => color !== null);
  
  if (colors.length === 0) {
    return {
      h: 0,
      s: 0,
      l: 40 + energyRatio * 20
    };
  }
  
  // Calculer la moyenne des teintes (avec gestion du cercle de couleur)
  // Conversion en vecteurs pour gérer le wrap-around de 0-360
  let sinSum = 0;
  let cosSum = 0;
  let satSum = 0;
  
  for (const color of colors) {
    const hueRad = (color.h * Math.PI) / 180;
    sinSum += Math.sin(hueRad);
    cosSum += Math.cos(hueRad);
    satSum += color.s;
  }
  
  // Moyenne circulaire de la teinte
  const avgHue = (Math.atan2(sinSum, cosSum) * 180) / Math.PI;
  const finalHue = avgHue < 0 ? avgHue + 360 : avgHue;
  
  // Moyenne de la saturation
  const avgSat = satSum / colors.length;
  
  // Luminosité basée sur l'énergie
  const lightness = 40 + energyRatio * 20;
  
  return {
    h: Math.round(finalHue),
    s: Math.round(avgSat),
    l: Math.round(lightness)
  };
}

/**
 * Calcule le coût de maintenance total d'une bactérie
 * 
 * @param {Array} componentNames - Liste des noms de composants actifs
 * @returns {number} Coût total par tick
 */
export function calculateMaintenanceCost(componentNames) {
  let totalCost = 0;
  

  for (const name of componentNames) {
    // Chercher dans les composants optionnels
    let Component = OPTIONAL_COMPONENTS[name];
    
    // Si pas trouvé, chercher dans les spécialisations
    if (!Component) {
      Component = SPECIALIZATION_COMPONENTS[name];
    }
    
    if (Component && Component.MAINTENANCE_COST !== undefined) {
      totalCost += Component.MAINTENANCE_COST;
    }
  }
  
  return totalCost;
}

