export const TECHNOLOGIES = {
  agriculture: {
    id: 'agriculture',
    name: 'Agriculture',
    description: 'Permet de construire des fermes',
    cost: 4,
    requires: [],
    unlocks: {
      buildings: ['ferme'],
    },
  },
  ecriture: {
    id: 'ecriture',
    name: 'Écriture',
    description: 'Prérequis à de nombreuses technologies avancées',
    cost: 5,
    requires: ['ageDuBronze'],
    unlocks: {
      buildings:['port']
    },
  },
  imprimerie: {
    id: 'imprimerie',
    name: 'Imprimerie',
    description: "Gutenberg is born. permet d'ouvrir des université",
    cost: 20,
    requires: ['ecriture'],
    unlocks: {
      buildings:['universite']
    },
  },
  construction: {
    id: 'construction',
    name: 'Construction',
    description: 'Prérequis à de nombreuses technologies avancées',
    cost: 20,
    requires: [],
    unlocks: {
      buildings:['port','caserne']
    },
  },
  ageDuBronze: {
    id: 'ageDuBronze',
    name: 'Âge du Bronze',
    description: 'Permet de recruter des archers',
    cost: 10,
    requires: [],
    unlocks: {
      units: ['archer'],
    },
  },
  ageDuFer: {
    id: 'ageDuFer',
    name: 'Âge du Fer',
    description: 'Etape indispensable pour maitriser la guerre',
    cost: 20,
    requires: ['ageDuBronze'],
    unlocks: {
      units: ['legion','spartiate'],
    },
  },
  mathematiques: {
    id: 'mathematiques',
    name: 'Mathématiques',
    description: 'Permet de construire des catapultes et balistes',
    cost: 25,
    requires: ['ageDuBronze'],
    unlocks: {
      units: ['catapulte'],
      buildings: ['atelier'],
    },
  },
  menuiserie: {
    id: 'menuiserie',
    name: 'Menuiserie',
    description: 'Permet la construction de drakkars',
    cost: 16,
    requires: ['ecriture'],
    unlocks: {
      units: ['drakkar'],
    },
  },
  commerce: {
    id: 'commerce',
    name: 'Commerce',
    description: 'Permet de recruter des caravanes',
    cost: 10,
    requires: ['ecriture'],
    unlocks: {
      units: ['caravane'],
    },
  },
  feodalisme: {
    id: 'feodalisme',
    name: 'Féodalisme',
    description: 'Permet de recruter des chevaliers',
    cost: 20,
    requires: ['agriculture', 'commerce'],
    unlocks: {
      units: ['chevalier'],
      buildings: ['chateau'],
    },
  },
  religion: {
    id: 'religion',
    name: 'Religion',
    description: 'La base de la civilisation',
    cost: 10,
    requires: ['ageDuBronze'],
    unlocks: {
      buildings: ['temple'],
    },
  },
  polytheisme: {
    id: 'polytheisme',
    name: 'Polythéisme',
    description: 'Permet de former des Templiers',
    cost: 20,
    requires: ['religion'],
    unlocks: {
      buildings: ['abbaye'],
    },
  },
  monotheisme: {
    id: 'monotheisme',
    name: 'Monothéisme',
    description: 'Permet de former des Templiers',
    cost: 30,
    requires: ['polytheisme'],
    unlocks: {
      units: ['templier'],
      buildings: ['cathedrale'],
    },
  },
  astronomie: {
    id: 'astronomie',
    name: 'Astronomie',
    description: 'Permet de construire caravelles',
    cost: 30,
    requires: ['commerce'],
    unlocks: {
      units: ['caravelle']
    },
  },
  cartographie: {
    id: 'cartographie',
    name: 'Cartographie',
    description: 'Vos explorateurs esquissent les contours du monde : le brouillard laisse deviner le terrain inexploré',
    cost: 15,
    requires: ['ecriture'],
    unlocks: {},
  },
  geographie: {
    id: 'geographie',
    name: 'Géographie',
    description: "La forme du monde n'a plus de secret pour vous : la carte entière se révèle",
    cost: 60,
    requires: ['cartographie', 'astronomie'],
    unlocks: {},
  },
  motorisation: {
    id: 'motorisation',
    name: 'motorisation',
    description: "Permet de construire des destroyers et plein d'autres choses",
    cost: 50,
    requires: ['metallurgie'],
    unlocks: {
      units: ['destroyer', 'camion'],
    },
  },
  poudre: {
    id: 'poudre',
    name: 'Poudre à canon',
    description: 'Permet de produire des mousquetaires',
    cost: 50,
    requires: ['mathematiques', 'commerce'],
    unlocks: {
      units: ['mousquetaire'],
      buildings: ['arsenal'],
    },
  },
  metallurgie: {
    id: 'metallurgie',
    name: 'Métallurgie',
    description: 'Permet de produire des canons',
    cost: 60,
    requires: ['poudre'],
    unlocks: {
      units: ['canon'],
      buildings: ['fonderie'],
    },
  },
  moteurExplosion: {
    id: 'moteurExplosion',
    name: 'Moteur à explosion',
    description: 'Permet de construire des tanks',
    cost: 80,
    requires: ['metallurgie'],
    unlocks: {
      units: ['tank'],
      buildings: ['usine'],
    },
  },
  aviation: {
    id: 'aviation',
    name: 'Aviation',
    description: 'Permet la construction d’avions de chasse',
    cost: 100,
    requires: ['moteurExplosion'],
    unlocks: {
      units: ['avionChasse'],
      buildings: ['aeroport'],
    },
  },
  infanterieModerne: {
    id: 'infanterieModerne',
    name: 'Infanterie moderne',
    description: 'Débloque les soldats modernes',
    cost: 100,
    requires: ['aviation'],
    unlocks: {
      units: ['soldatModerne']
    },
  },
  fission: {
    id: 'fission',
    name: 'Fission',
    description: 'Permet de créer des bombes nucléaires',
    cost: 200,
    requires: ['metallurgie', 'aviation'],
    unlocks: {
      units: ['bombeNucleaire'],
      buildings: ['nucleaire'],
    },
  },
};
