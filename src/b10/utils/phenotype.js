import { CAMB_COMPONENTS } from "../engine/Components";


export function generateRandomComponents(activationProbability = 0.3) {
  const activeComponents = [];

  for (const componentName in CAMB_COMPONENTS) {
    if (Math.random() < activationProbability) {
      activeComponents.push(componentName);
    }
  }

  return activeComponents;
}


export function generateComponentParameters(componentName, adnHandler) {
  switch (componentName) {
    case 'Movement':
      return [adnHandler.readFloat(`${componentName}_speed`)];
    case 'Photosynthesis':
      return [adnHandler.readFloat(`${componentName}_efficiency`)];
    case 'Filtration':
      return [adnHandler.readFloat(`${componentName}_efficiency`)];
    case 'EnergyStorage':
      return [100 + adnHandler.readFloat(`${componentName}_capacity`) * 200]; // 100-300
    case 'Predator':
      return [
        adnHandler.readFloat(`${componentName}_power`) * 10 + 5, // 5-15
        Math.floor(adnHandler.readFloat(`${componentName}_range`) * 2) + 1 // 1-2
      ];
case 'Spine':
  return [
    adnHandler.readFloat(`${componentName}_damage`) * 8 + 2,         // 2-10
    Math.floor(adnHandler.readFloat(`${componentName}_count`) * 5) + 1, // 1-5
    Array.from({ length: 3 }, (_, i) =>
      adnHandler.readFloat(`${componentName}_angle_${i}`) * 360
    ) // 3 angles aléatoires 0-360°
  ];

case 'Carapace':
  return [
    adnHandler.readFloat(`${componentName}_protection`) * 20 + 5,    // 5-25
    adnHandler.readFloat(`${componentName}_coverageRatio`),          // 0-1
    adnHandler.readFloat(`${componentName}_weightPenalty`) * 3       // 0-3
  ];

case 'Mucus':
  return [
    adnHandler.readFloat(`${componentName}_viscosity`) * 5,          // 0-5
    adnHandler.readFloat(`${componentName}_slowFactor`) * 0.5 + 0.1,  // 0.1-0.6
    adnHandler.read10(`${componentName}_confusionticks`) ,          // 0-5
  ];

case 'Ink':
  return [
    adnHandler.readFloat(`${componentName}_cloudRadius`) * 50 + 10,  // 10-60
    adnHandler.read10(`${componentName}_confusionDuration`) * 2 + 4, // 5-24
    adnHandler.readFloat(`${componentName}_opacity`)
  ];

case 'Eye':
  return [
    adnHandler.readFloat(`${componentName}_range`) * 100 + 20,       // 20-120
    adnHandler.readFloat(`${componentName}_fieldOfView`) * 180 + 30, // 30-210°
    adnHandler.readFloat(`${componentName}_acuity`) * 2 + 0.5        // 0.5-2.5
  ];

case 'Antenna':
  return [
    adnHandler.readFloat(`${componentName}_sensitivity`) * 2 + 0.5,  // 0.5-2.5
    adnHandler.readFloat(`${componentName}_range`) * 80 + 10  ,
      Math.round(adnHandler.readFloat(`${componentName}length`) * 4) + 1         // 1-5
  ];
case 'Navigation':
  return [
    adnHandler.readFloat(`${componentName}_nemoMood`),  // 0.5-2.5
  ];

case 'Thermoreceptor':
  return [
    adnHandler.readFloat(`${componentName}_sensitivity`) * 3 + 0.2   // 0.2-3.2
  ];

case 'Jaw':
  return [
    adnHandler.readFloat(`${componentName}_bitePower`),    
    adnHandler.readFloat(`${componentName}_handleSize`) * 3 + 1      // 1-4
  ];

case 'Peduncle':
  return [
    adnHandler.readFloat(`${componentName}_length`) * 100 + 10,      // 10-110
    adnHandler.readFloat(`${componentName}_flexibility`)             // 0-1
  ];

case 'Anchoring':
  return [
    adnHandler.readFloat(`${componentName}_strength`) * 20 + 5,      // 5-25
    adnHandler.readFloat(`${componentName}_depth`) * 50 + 5          // 5-55
  ];

case 'Tentacle':
  return [
    adnHandler.readFloat(`${componentName}_length`) * 5 + 1,       // 1-6
    Math.floor(adnHandler.readFloat(`${componentName}_count`) * 4) + 1, // 1-4
    adnHandler.readFloat(`${componentName}_strength`) * 10 + 2       // 2-12
  ];

case 'Cilia':
  return [
    adnHandler.readFloat(`${componentName}_density`) * 100 + 10,     // 10-110
    adnHandler.readFloat(`${componentName}_frequency`) * 20 + 5      // 5-25
  ];

case 'Bioluminescence':
  return [
    adnHandler.readFloat(`${componentName}_intensity`) * 10 + 1,     // 1-11
    adnHandler.read10(`${componentName}_pattern`) // 0-10 pattern ID
  ];

case 'Chemosynthesis':
  return [
    adnHandler.readFloat(`${componentName}_efficiency`) * 2 + 0.5,   // 0.5-2.5
    adnHandler.readFloat(`${componentName}_heatTolerance`) * 300 + 50 // 50-350
  ];

case 'Sporulation':
   return [
    Math.round(adnHandler.readFloat(`${componentName}_sporeCount`)*4)+1,           // 1-5
    adnHandler.readFloat(`${componentName}_dispersalRange`) * 50 + 5  // 5-55
  ];

case 'Hibernation':
  return [
    adnHandler.readFloat(`${componentName}_triggerThreshold`) * 0.5 + 0.1, // 0.1-0.6
    adnHandler.readFloat(`${componentName}_recoveryRate`) * 2 + 0.2        // 0.2-2.2
  ];

case 'Segmentation':
  return [
    Math.floor(adnHandler.readFloat(`${componentName}_segmentCount`) * 6) + 2, // 2-7
    Array.from({ length: 3 }, (_, i) =>
      Math.floor(adnHandler.readFloat(`${componentName}_segmentRole_${i}`) * 5)
    ) // 3 rôles codés 0-4
  ];

case 'Regeneration':
  return [
    adnHandler.readFloat(`${componentName}_regenRate`) * 5 + 0.5,    // 0.5-5.5
    Math.floor(adnHandler.readFloat(`${componentName}_maxHeals`) * 5) + 1 // 1-5
  ];

case 'ColonialBond':
  return [
    adnHandler.readFloat(`${componentName}_bondStrength`) * 10 + 1,  // 1-11
    Math.floor(adnHandler.readFloat(`${componentName}_maxBondCount`) * 5) + 1 // 1-5
  ];

    case 'Parasite':
      return [adnHandler.readFloat(`${componentName}_drain`) * 1 + 0.1]; // 0.5-2.5

    case 'Symbiosis':
      return [
        adnHandler.readFloat(`${componentName}_share`) * 0.5,
        [] // acceptedPartners
      ];
    case 'Cannibalism':
      return [adnHandler.readFloat(`${componentName}_consumption`) * 5]; // 0-5
    case 'BiologicalClock':
      return [
        adnHandler.readFloat(`${componentName}_period`) * 6 + 2, // 2-8 secondes
        adnHandler.readFloat(`${componentName}_phase`)
      ];
    case 'GeneticRecombination':
      return [
        adnHandler.readBool(`${componentName}_ability`),
        adnHandler.readFloat(`${componentName}_preference`)
      ];

    default:
      return [];
  }
}