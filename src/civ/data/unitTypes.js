

export const UNIT_TYPES = {
  worker: {
  type: 'worker',  name: 'Travailleur',
  icon: '🛠️',  attack: 1,  defense: 1,
  hp: 5,  hpMax: 5,  movement: 1,  range: 1,  armee: 'none',
  turns: 1,  fortified: false,  canCrossWater: false,  canHeal: false,  veterancy: false,
  cost: {
    food: 10,
    gold: 5,
  },
  actions: [
    { id: 'labour', label: 'Améliorer (Labourer/miner)' },
    { id: 'road', label: 'Construire une route' },
    { id: 'dig', label: 'Creuser' },
  ],
  requirements: {}
}

  , pionnier: {
    type: 'pionnier',    name: 'Pionnier',
    icon: '🧑🏼‍🤝‍🧑🏻', imageSrc:null, armee:'none',
    attack: 1,    defense: 1, hp:5, hpMax:5,
    movement: 2,  range: 1,turns:3,
     fortified:false,canCrossWater:false,canHeal:true,veterancy:false,
    cost: {
      gold: 10, laine:5, wood:5, food:10
    },
    actions: [
      { id: 'city', label: 'Fonder une ville' },
      { id: 'fortify', label: 'Fortifier' },
      { id: 'disband', label: 'Dissoudre' },
    ],
  requirements: {building:null, science:null}  
  }
 , warrior: {
    type: 'warrior',   name: 'Guerrier',
    icon: '🗡️', imageSrc:null,
    attack: 2,  defense: 1, hp:5,hpMax:5,
    movement: 2, range:1 , armee:'infanterie', turns:1,
    fortified:false,canCrossWater:false,canHeal:false,veterancy:false,
    cost: {
      gold: 10,
    },
    actions: [
      { id: 'fortify', label: 'Fortifier' },
      { id: 'disband', label: 'Dissoudre' },
    ],
  requirements: {}                               
  },
  phalange: {
    type: 'phalange',   name: 'Phalange',
    icon: '🔱', imageSrc:null, armee:'infanterie',
    attack: 1,  defense: 2, hp:6,hpMax:6,
    movement: 1, range:1 , turns:1,
    fortified:false,canCrossWater:false,canHeal:false,veterancy:false,
    cost: {
      gold: 8, iron:5
    },
    actions: [
      { id: 'fortify', label: 'Fortifier' },
      { id: 'disband', label: 'Dissoudre' },
    ],
  requirements: {building:null, science:"ageDuBronze"}
  }
  , archer: {
    type: 'archer',    name: 'Archer',
    icon: '🏹', imageSrc:null, armee:'infanterie',
    attack: 5,    defense: 2, hp:8, hpMax:8,
    movement: 3,  range: 2,turns:2,
     fortified:false,canCrossWater:false,canHeal:false,veterancy:false,
    cost: {
      gold: 15,
      wood:5
    },
    actions: [
      { id: 'fortify', label: 'Fortifier' },
      { id: 'disband', label: 'Dissoudre' },
    ],
  requirements: {building:'feuDeCamp'}
  }
  , diplomate: {
    type: 'diplomate',    name: 'Diplomate',
    icon: '🚴🏻', imageSrc:null, armee:'none',
    attack: 1,    defense: 1, hp:5, hpMax:5,
    movement: 5,  range: 1,turns:2,
     fortified:false,canCrossWater:false,canHeal:true,veterancy:false,
    cost: {
      gold: 20
    },
    actions: [
      { id: 'fortify', label: 'Fortifier' },
      { id: 'disband', label: 'Dissoudre' },
    ],
  requirements: {building:null, science:'ecriture'}
  }
  , caravane: {
    type: 'caravane',    name: 'Caravane',
    icon: '🐫', imageSrc:null, armee:'none',
    attack: 1,    defense: 1, hp:5, hpMax:5,
    movement: 3,  range: 1,turns:3,
     fortified:false,canCrossWater:false,canHeal:false,veterancy:false,
    cost: {
      gold: 10
    },
    actions: [
      { id: 'fortify', label: 'Fortifier' },
      { id: 'disband', label: 'Dissoudre' },
    ],
  requirements: {building:null, science:"commerce"}  
  } 
  , camion: {
    type: 'camion',    name: 'Camion',
    icon: '🚛', imageSrc:null, armee:'none',
    attack: 1,    defense: 5, hp:10, hpMax:10,
    movement: 6,  range: 1,turns:3,
     fortified:false,canCrossWater:false,canHeal:false,veterancy:false,
    cost: {
      gold: 10
    },
    actions: [
      { id: 'fortify', label: 'Fortifier' },
      { id: 'disband', label: 'Dissoudre' },
    ],
  requirements: {building:null, science:"motorisation"}  
  }
  , moine: {
    type: 'moine',    name: 'Moine',
    icon: '🧎‍➡️', imageSrc:null, armee:'none',
    attack: 3,    defense: 3, hp:8, hpMax:8,
    movement: 3,  range: 1,turns:2,
     fortified:false,canCrossWater:false,canHeal:true,veterancy:false,
    cost: {
      laine:10, wood:10
    },
    actions: [
      { id: 'heal', label: 'Soigner alentours' },
      { id: 'fortify', label: 'Fortifier' },
      { id: 'disband', label: 'Dissoudre' },
    ],
  requirements: {building:'abbaye', science:'monotheisme'}  
  }
  , drakkar: {
    type: 'drakkar',    name: 'Drakkar',
    icon: '🚣🏻', imageSrc:null, armee:'naval',
    attack: 5,    defense: 2, hp:6, hpMax:6,
    movement: 3,  range: 1,turns:2,
     fortified:false,veterancy:false
     ,canCrossWater:true,canHeal:false,
    cost: {
      gold: 10, wood:10, laine:10
    },
    actions: [
      { id: 'fortify', label: 'Fortifier' },
      { id: 'disband', label: 'Dissoudre' },
    ],
  requirements: {building:'port', science:"menuiserie"}  
  }
  ,baliste: {
    type: 'baliste', name: 'Baliste', icon: '🎯', imageSrc: null,
    attack: 8, defense: 1, hp: 5, hpMax: 5, armee:'armeDeGuerre',
    movement: 1, range: 1,turns:2,
    fortified: false, canCrossWater: false, canHeal: false, veterancy: false,
    cost: { gold: 5, wood: 10 , happiness:5 },
    actions: [
      { id: 'fortify', label: 'Fortifier' },
      { id: 'disband', label: 'Dissoudre' },
    ],
    requirements: { building: null, science: 'construction' },
  }
  , catapulte: {
    type: 'catapulte',    name: 'Catapulte',
    icon: '🏗️', imageSrc:null, armee:'armeDeGuerre',
    attack: 15,    defense: 1, hp:8, hpMax:8,
    movement: 2,  range: 1,turns:2,
     fortified:false,veterancy:false
     ,canCrossWater:false,canHeal:false,
    cost: {
      stone: 10, wood:15
    },
    actions: [
      { id: 'fortify', label: 'Fortifier' },
      { id: 'disband', label: 'Dissoudre' },
    ],
  requirements: {building:null, science:"mathematiques"}  
  }
  ,legion: {
    type: 'legion',   name: 'Légion',
    icon: '🛡️', imageSrc:null, armee:'infanterie',
    attack: 5,  defense: 5, hp:10,hpMax:10,
    movement: 3, range:1 , turns:2,
    fortified:false,canCrossWater:false,canHeal:false,veterancy:false,
    cost: {
      food: 10, gold:5, iron:10
    },
    actions: [
      { id: 'fortify', label: 'Fortifier' },
      { id: 'disband', label: 'Dissoudre' },
    ],
  requirements: {building:null, science:"ageDuFer"}                               
  } ,spartiate: {
    type: 'spartiate',   name: 'Spartiate',
    icon: '🤾🏿', imageSrc:null, armee:'infanterie',
    attack: 7,  defense: 2, hp:12,hpMax:12,
    movement: 3, range:1 , turns:2,
    fortified:false,canCrossWater:false,canHeal:false,veterancy:false,
    cost: {
      food:10, gold:8, iron:8, happiness:10 
    },
    actions: [
      { id: 'fortify', label: 'Fortifier' },
      { id: 'disband', label: 'Dissoudre' },
    ],
  requirements: {building:null, science:"ageDuBronze"}                               
  } 
  ,chevalier: {
    type: 'chevalier',   name: 'Chevalier',
    icon: '⚔️', imageSrc:null, armee:'infanterie',
    attack: 10,  defense: 5, hp:15,hpMax:15,
    movement: 4, range:1 , turns:1,
    fortified:false,canCrossWater:false,canHeal:false,veterancy:false,
    cost: {
      gold: 20, iron:10, food:10
    },
    actions: [
      { id: 'fortify', label: 'Fortifier' },
      { id: 'disband', label: 'Dissoudre' },
    ],
  requirements: {building:"chateau", science:"Feodalisme"}                               
  }
  , templier: {
    type: 'templier', name: 'Templier', icon: '⛨', imageSrc: null,
    attack: 12, defense: 4, hp: 15, hpMax: 15, armee:'infanterie',
    movement: 3, range: 1,turns:2,
    fortified: false, canCrossWater: false, canHeal: true, veterancy: false,
    cost: { gold: 25, iron: 12 , laine:10},
    actions: [
      { id: 'prier', label: 'Prier (soigner)' },
      { id: 'fortify', label: 'Fortifier' },
      { id: 'disband', label: 'Dissoudre' },
    ],
    requirements: { building: 'abbaye', science: 'monotheisme' },
  }
  , caravelle: {
    type: 'caravelle',    name: 'Caravelle',
    icon: '⛵', imageSrc:null, armee:'naval',
    attack: 10,    defense:5, hp:10, hpMax:10,
    movement: 5,  range: 2,turns:2,
     fortified:false,veterancy:false
     ,canCrossWater:true,canHeal:false,
    cost: {
      gold: 10, laine:20, wood:10
    },
    actions: [
      { id: 'fortify', label: 'Fortifier' },
      { id: 'disband', label: 'Dissoudre' },
    ],
  requirements: {building:"port", science:"astronomie"}  
  },
   destroyer: {
    type: 'destroyer',    name: 'Destroyer',
    icon: '⛵', imageSrc:null, armee:'naval',
    attack: 20,    defense:10, hp:20, hpMax:20,
    movement: 6,  range: 2,turns:4,
     fortified:false,veterancy:false
     ,canCrossWater:true,canHeal:false,
    cost: {
      gold: 50, iron:10, petrole:10, happiness:20 
    },
    actions: [
      { id: 'fortify', label: 'Fortifier' },
      { id: 'disband', label: 'Dissoudre' },
    ],
  requirements: {building:"port", science:"motorisation"}  
  }
  ,mousquetaire: {
    type: 'mousquetaire', name: 'Mousquetaire', icon: '🔫', imageSrc: null,
    attack: 12, defense: 10, hp: 16, hpMax: 16, armee:'infanterie',
    movement: 3, range: 2,turns:1,
    fortified: false, canCrossWater: false, canHeal: false, veterancy: false,
    cost: { gold: 10, iron: 10, laine: 10 },
    actions: [
      { id: 'fortify', label: 'Fortifier' },
      { id: 'disband', label: 'Dissoudre' },
    ],
    requirements: { building: 'arsenal', science: 'Poudre à canon' },
  },
   canon: {
    type: 'canon', name: 'Canon', icon: '💥', imageSrc: null,
    attack: 20, defense: 2, hp: 5, hpMax: 5, armee:'armeDeGuerre',
    movement: 2, range: 3, turns:3,
    fortified: false, canCrossWater: false, canHeal: false, veterancy: false,
    cost: { charbon: 10, iron: 10 , wood:10, gold:20},
    actions: [
      { id: 'fortify', label: 'Fortifier' },
      { id: 'disband', label: 'Dissoudre' },
    ],
    requirements: { building: 'fonderie', science: 'Metallurgie' },
  }
 ,tank: {
    type: 'tank', name: 'Char d’assaut', icon: '🛻', imageSrc: null,
    attack: 25, defense: 16, hp: 30, hpMax: 30, armee:'infanterie',
    movement: 4, range: 1,turns:3,
    fortified: false, canCrossWater: false, canHeal: false, veterancy: false,
    cost: { gold: 50, iron: 40, petrole: 30, happiness:10  },
    actions: [
      { id: 'fortify', label: 'Fortifier' },
      { id: 'disband', label: 'Dissoudre' },
    ],
    requirements: { building: 'usine', science: 'Moteur à explosion' },
  },
  avionChasse: {
    type: 'avionChasse', name: 'Avion de chasse', icon: '✈️', imageSrc: null,
    attack: 35, defense: 10, hp: 15, hpMax: 15, armee:'aviation',
    movement: 8, range: 3,turns:4,
    fortified: false, canCrossWater: true, canHeal: false, veterancy: false,
    cost: { gold: 80, iron: 50, petrole: 30, happiness:10  },
    actions: [
      { id: 'disband', label: 'Dissoudre' },
    ],
    requirements: { building: 'aeroport', science: 'Aviation' },
  }
  ,soldatModerne: {
    type: 'soldatModerne', name: 'Meuh-rines', icon: '🪖', imageSrc: null,
    attack: 18, defense: 15, hp: 15, hpMax: 15, armee:'infanterie',
    movement: 4, range: 2,turns:3,
    fortified: false, canCrossWater: true, canHeal: true, veterancy: false,
    cost: { gold: 30, food:20, laine:10, petrole: 5, iron:5, happiness:5 },
    actions: [
      { id: 'fortify', label: 'Fortifier' },
      { id: 'disband', label: 'Dissoudre' },
    ],
    requirements: { building: 'arsenal', science: 'Infanterie moderne' },
  },
  bombeNucleaire: {
    type: 'bombeNucleaire', name: 'Bombe nucléaire', icon: '☢️', imageSrc: null,
    attack: 999, defense: 1, hp: 1, hpMax: 1,turns:5,
    movement: 6, range: 1, armee:'armeDeGuerre',
    fortified: false, canCrossWater: true, canHeal: false, veterancy: false,
    cost: { gold: 100, uranium: 50 },
    actions: [
      { id: 'nuke', label: 'Lancer Bombe Nuke' },
      { id: 'disband', label: 'Dissoudre' },
    ],
    requirements: { building: 'complexe nucléaire', science: 'Fission' },
  },
};



