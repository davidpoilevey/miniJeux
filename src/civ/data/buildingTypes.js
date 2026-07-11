/**type Building = {
  id: string;
  name: string;
  description: string;
  icon: string; // unicode ou MUI icon
  production?: {
    food?: number;
    gold?: number;
    iron?: number;
    stone?: number;
    wood?: number;
    charbon?: number;
    petrole?: number;
    laine?: number;
  };
  
  cost: {
    gold?: number;
    stone?: number;
    wood?: number;
  };
  turns: number; // nombre de tours pour être construit
};
 */
export const BUILDING_TYPES = {
  ferme: {
    id: 'ferme',
    name: 'Ferme',
    description: 'Produit de la nourriture et de la laine permet de recruter une caravane.',
    icon: '🌾',
    production: { food: 3, laine:2 },
    producesUnits: ['pionnier', 'caravane'],
    cost: { wood: 20, gold: 20 },
    turns: 3
    , requirements: {
      science: 'agriculture'
    },
  },
  feuDeCamp: {
    id: 'feuDeCamp',
    name: 'Feu de camp',
    description: "Permet l’entraînement d'archer, produit 2 charbon/tour",
    icon: '🔥',
    production: { charbon: 2 },
    producesUnits: [ 'archer'],
    cost: { wood: 10, gold: 20 },
    turns: 4
    , requirements: {
      science: "ageDuBronze"
    },
  },
  caserne: {
    id: 'caserne',
    name: 'Caserne',
    description: 'Permet l’entraînement d’unités d’infanterie avancees.',
    icon: '🏰',
    producesUnits: [ 'legion','spartiate'],
    cost: { stone: 10, wood:10, gold: 40 },
    turns: 4
    , requirements: {
      science: "ageDuFer"
    },
  },
  cityWalls: {
    id: 'cityWalls',
    name: 'Murailles',
    description: 'Augmente la defense de la ville et produit de la pierre.',
    icon: '⛪',
     production: { stone: 2 },
    cost: { stone: 20, gold: 30 },
    turns: 5
    , requirements: {
      science: 'construction'
    }
    },
  abbaye: {
    id: 'abbaye',
    name: 'Abbaye',
    description: 'Permet la formation de Moines. Peut générer foi (à venir).',
    icon: '⛪',
    production: { happiness: 10, science:2 },
     producesUnits: ['moine'],
    cost: { stone: 20, gold: 20 , food:20},
    turns: 5
    , requirements: {
      science: 'polytheisme'
    }
    },
  cathedrale: {
    id: 'cathedrale',
    name: 'Cathedrale',
    description: 'Permet la formation de Moines. Peut générer foi (à venir).',
    icon: '⛪',
    production: { happiness: 20,gold:5 },
     producesUnits: ['moine'],
    cost: { stone: 60, gold: 100 },
    turns: 5
    , requirements: {
      science: 'monotheisme'
    }
    },
    temple: {
      id: 'temple',
      name: 'Temple',
      description: 'Rend les gens plus heureux et permet de produire moine et templier',
      icon: '⛪',
      producesUnits: ['moine','templier'],
      production: { happiness: 10 ,gold: 2},
      cost: { stone: 10, wood:10, food:10,laine:10 },
      turns: 5
      , requirements: {
        science: 'religion',
        building: 'caserne',
      },
    },
    ecole: {
      id: 'ecole',
      name: 'Ecole',
      description: 'Rend les gens plus heureux et plus intelligents',
      icon: '📚',
      production: { happiness: 2, science:5 },
      cost: { wood: 10, stone:10,gold: 40 },
      turns: 5
      , requirements: {
        science: 'ecriture'
      },
    },
    bibliotheque: {
      id: 'bibliotheque',
      name: 'Bibliotheque',
      description: 'Rend les gens beaucoup plus intelligents',
      icon: '🏫',
      production: { happiness: 5, science:10 },
      cost: { wood: 10, gold: 10, laine:10 ,charbon:10},
      turns: 5
      , requirements: {
        building: 'ecole'
      },
    },
    universite: {
      id: 'universite',
      name: 'Universite',
      description: "Principalement pour flatter l'ego de la bourgeoisie, mais ca aide quand meme a la culture globale",
      icon: '🏯',
      production: { gold: 2, science:20 },
      cost: { wood: 20, gold: 30, laine:15, stone:20 },
      turns: 10
      , requirements: {
        building: 'ecole', science:'imprimerie'
      },
    },
    chateau: {
      id: 'chateau',
      name: 'Château',
      description: 'Infrastructure militaire féodale avancée. Produit des chevaliers. Rapporte Or, bonheur et science',
      icon: '🏰',
      production: { gold: 10, happiness:2, science:2 },
      producesUnits: ['chevalier', 'diplomate'],
      cost: { stone: 50, gold: 50 },
      turns: 6
      , requirements: {
        science: 'feodalisme',
        building: 'caserne',
      }
    },
    port: {
      id: 'port',
      name: 'Port',
      description: 'Permet de construire des unités navales.',
      icon: '⚓',
      production: { food: 5 ,gold: 10},
      producesUnits: ['drakkar', 'caravelle', 'destroyer'],
      cost: { wood: 40, gold: 62, stone: 20 },
      turns: 5
      , requirements: {
        science: 'construction'
      },
    },
    arsenal: {
      id: 'arsenal',
      name: 'Arsenal',
      description: 'Permet de produire des mousquetaires et de la poudre',
      icon: '🏗️',
      production: {  charbon:4,gold: 10},
      producesUnits: ['mousquetaire','soldatModerne'],
      cost: { wood: 20, gold: 40, charbon:20, iron:10 },
      turns: 5, requirements: {
        science: 'poudre',
        building: 'caserne',
      },
    },
    fonderie: {
      id: 'fonderie',
      name: 'Fonderie',
      description: 'Permet de produire des armes de siège comme le canon.',
      icon: '🔥',
      production: { gold: 10 },
      producesUnits: ['canon'],
      cost: { iron: 40, stone: 50 },
      turns: 6, requirements: {
        science: 'metallurgie', building:'arsenal'
      },
    },
    usine: {
      id: 'usine',
      name: 'Usine',
      description: 'Permet la production de chars d’assaut.',
      icon: '🏭',
      production: { food: 15 },
      producesUnits: ['tank'],
      cost: { stone: 100, iron: 100, gold: 200 },
      turns: 7, requirements: {
        science: 'moteurExplosion'
      },
    },
    aeroport: {
      id: 'aeroport',
      name: 'Aéroport',
      description: 'Permet la construction d’avions de chasse.',
      icon: '🛫',
      production: { happiness: 15 },
      producesUnits: ['avionChasse'],
      cost: { petrole: 20, gold: 60,charbon:10 },
      turns: 6, requirements: {
        science: 'aviation'
      },
    },
   
    'nucleaire': {
      id: 'nucleaire',
      name: 'Complexe nucléaire',
      description: 'Permet la fabrication de bombes nucléaires (dangereux).',
      icon: '☢️',
      production:{uranium:4},
      producesUnits: ['bombeNucleaire'],
      cost: { gold: 150, uranium: 20 },
      turns: 10, requirements: {
        science: 'fission'
      },
    },
    atelier: {
      id: 'atelier',
      name: 'Atelier',
      description: 'Permet de produire des armes de siège antiques (baliste, catapulte).',
      icon: '🔧',
      production: { happiness: 5, gold:5 },
      producesUnits: ['baliste', 'catapulte'],
      cost: { wood: 60, gold: 80 },
      turns: 4, requirements: {
        science: 'mathematiques'
      },
    },
    
  };

  export const MERVEILLES_DU_MONDE={

    sunTzu: {
      id: 'sunTzu',
      name: 'Sun-Tzu War academie',
      description: 'Rend toutes vos unités plus fortes en attaque (+2 attaque)',
      icon: '🪖',
      type:'merveille',
      effectInauguration:civilization=>{
        civilization.militaryBonus+=2
      },
      cost: { wood: 50, iron:20, gold: 180 },
      turns: 20, requirements: {
        science: 'ageDuFer'
      },
    }, pyramide: {
      id: 'pyramide',
      name: 'Pyramides',
      description: 'Ameliore le rendement de vos cultures grace au Nil (+20% de productivite)',
      icon: '🔺',
      type:'merveille',
      effectInauguration:civilization=>{
        civilization.buildingBonus+=0.2;
      },
      effectParTurn:cities=>{
        cities.forEach(city=>{
          city.resources.food+=3;
        })
      },
      cost: { stone: 250,  gold: 100, food:50 },
      turns: 20, requirements: {
        science: 'ageDuBronze'
      },
    },jardinBabylone: {
      id: 'jardinBabylone',
      name: 'Jardin de Babylone',
      description: 'La population se multiplie  20% plus vite et est plus cultivée',
      icon: '🫜',
      type:'merveille',
      effectInauguration:civilization=>{
        civilization.populationGrowthBonus+=0.2;
      },
      effectParTurn:cities=>{
         cities.forEach(city=>{
          city.resources.happiness+=1;
          city.resources.science+=1;
        })
      },
      cost: { wood: 40,  gold: 100, food:50, laine:50 },
      turns: 20, requirements: {
        science: 'agriculture'
      },
    }
    ,wallStreet: {
      id: 'wallStreet',
      name: 'Wall street',
      description: "Les villes gagnent plus d'argent (20% de plus)",
      icon: '🪙',
      type:'merveille',
      effectInauguration:civilization=>{
       
      },
      effectParTurn:cities=>{
        cities.forEach(city=>{
          city.resources.gold=Math.round(city.resources.gold*1.2);
        })
      },
      cost: { wood: 10,  gold: 200, charbon:50 },
      turns: 20, requirements: {
        science: 'imprimerie'
      },
    }
    ,basilique: {
      id: 'basilique',
      name: 'Basilique St-Pierre',
      description: "Rend les gens tres heureux",
      icon: '💒',
      type:'merveille',
      effectInauguration:civilization=>{
       
      },
      effectParTurn:cities=>{
        cities.forEach(city=>{
          city.resources.happiness+=10;
        })
      },
      cost: { wood: 100,  stone: 200, gold:50 },
      turns: 20, requirements: {
        science: 'monotheisme'
      },
    },
  }
