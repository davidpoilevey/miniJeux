import { searchRootWithDifficulty } from "./reflexions";

// Base de données des ouvertures célèbres
const FAMOUS_OPENINGS = {
  // OUVERTURES CLASSIQUES
  'ruy_lopez': {
    name: "Ruy López (Défense Espagnole)",
    description: "L'ouverture préférée de Bobby Fischer",
    moves: [
      { from: { row: 6, col: 4 }, to: { row: 4, col: 4 }, color: 'white' }, // 1.e4
      { from: { row: 1, col: 4 }, to: { row: 3, col: 4 }, color: 'black' }, // 1...e5
      { from: { row: 7, col: 6 }, to: { row: 5, col: 5 }, color: 'white' }, // 2.Nf3
      { from: { row: 0, col: 1 }, to: { row: 2, col: 2 }, color: 'black' }, // 2...Nc6
      { from: { row: 7, col: 5 }, to: { row: 4, col: 2 }, color: 'white' },  // 3.Bb5   
    { from: { row: 0, col: 6 }, to: { row: 2, col: 5 }, color: 'black' }, // 3...Nf6
    ],
    difficulty: 'intermediate',
    century: '16ème siècle',
    masters: ['Bobby Fischer', 'Garry Kasparov', 'Magnus Carlsen']
  },
'sicilian_najdorf': {
  name: "Défense Sicilienne – Variante Najdorf",
  description: "Une des variantes les plus célèbres, aimée des joueurs agressifs.",
  moves: [
    { from: { row: 6, col: 4 }, to: { row: 4, col: 4 }, color: 'white' }, // 1.e4
    { from: { row: 1, col: 2 }, to: { row: 3, col: 2 }, color: 'black' }, // 1...c5
    { from: { row: 7, col: 6 }, to: { row: 5, col: 5 }, color: 'white' }, // 2.Nf3
    { from: { row: 0, col: 1 }, to: { row: 2, col: 2 }, color: 'black' }, // 2...Nc6
    { from: { row: 6, col: 3 }, to: { row: 4, col: 3 }, color: 'white' }, // 3.d4
    { from: { row: 3, col: 2 }, to: { row: 4, col: 3 }, color: 'black' }, // 3...cxd4
    { from: { row: 5, col: 5 }, to: { row: 3, col: 4 }, color: 'white' }, // 4.Nxd4
    { from: { row: 0, col: 6 }, to: { row: 2, col: 5 }, color: 'black' }, // 4...Nf6
    { from: { row: 7, col: 5 }, to: { row: 4, col: 2 }, color: 'white' }, // 5.Nc3
    { from: { row: 1, col: 0 }, to: { row: 3, col: 0 }, color: 'black' }, // 5...a6
  ],
  difficulty: 'advanced',
  century: '20ème siècle',
  masters: ['Bobby Fischer', 'Garry Kasparov', 'Magnus Carlsen']
}
,'giuoco_piano': {
  name: "Partie Italienne – Variante Giuoco Piano",
  description: "Une ligne classique qui débouche sur des batailles positionnelles riches.",
  moves: [
    { from: { row: 6, col: 4 }, to: { row: 4, col: 4 }, color: 'white' }, // 1.e4
    { from: { row: 1, col: 4 }, to: { row: 3, col: 4 }, color: 'black' }, // 1...e5
    { from: { row: 7, col: 6 }, to: { row: 5, col: 5 }, color: 'white' }, // 2.Nf3
    { from: { row: 0, col: 1 }, to: { row: 2, col: 2 }, color: 'black' }, // 2...Nc6
    { from: { row: 7, col: 5 }, to: { row: 3, col: 1 }, color: 'white' }, // 3.Bc4
    { from: { row: 0, col: 5 }, to: { row: 2, col: 3 }, color: 'black' }, // 3...Bc5
    { from: { row: 6, col: 3 }, to: { row: 5, col: 3 }, color: 'white' }, // 4.c3
    { from: { row: 1, col: 3 }, to: { row: 2, col: 3 }, color: 'black' }, // 4...d6
    { from: { row: 7, col: 4 }, to: { row: 6, col: 4 }, color: 'white' }, // 5.O-O (Roque)
    { from: { row: 0, col: 4 }, to: { row: 1, col: 4 }, color: 'black' }, // 5...Nf6
  ],
  difficulty: 'intermediate',
  century: '17ème siècle',
  masters: ['Paul Morphy', 'Adolf Anderssen', 'Max Euwe']
}

,'italian_game': {
  name: "Partie Italienne",
  description: "Rapide, directe, idéale pour les amateurs d'attaque.",
  moves: [
    { from: { row: 6, col: 4 }, to: { row: 4, col: 4 }, color: 'white' }, // 1.e4
    { from: { row: 1, col: 4 }, to: { row: 3, col: 4 }, color: 'black' }, // 1...e5
    { from: { row: 7, col: 6 }, to: { row: 5, col: 5 }, color: 'white' }, // 2.Nf3
    { from: { row: 0, col: 1 }, to: { row: 2, col: 2 }, color: 'black' }, // 2...Nc6
    { from: { row: 7, col: 5 }, to: { row: 3, col: 1 }, color: 'white' }, // 3.Bc4
  ],
  difficulty: 'beginner',
  century: '16ème siècle',
  masters: ['Paul Morphy', 'Giulio Cesare Polerio', 'Bobby Fischer']
},
  'sicilian_dragon': {
    name: "Défense Sicilienne - Variante du Dragon",
    description: "Défense explosive et tactique",
    moves: [
      { from: { row: 6, col: 4 }, to: { row: 4, col: 4 }, color: 'white' }, // 1.e4
      { from: { row: 1, col: 2 }, to: { row: 3, col: 2 }, color: 'black' }, // 1...c5
      { from: { row: 7, col: 6 }, to: { row: 5, col: 5 }, color: 'white' }, // 2.Nf3
      { from: { row: 1, col: 3 }, to: { row: 3, col: 3 }, color: 'black' }, // 2...d6
      { from: { row: 6, col: 3 }, to: { row: 4, col: 3 }, color: 'white' }, // 3.d4
      { from: { row: 3, col: 2 }, to: { row: 4, col: 3 }, color: 'black' }, // 3...cxd4
      { from: { row: 5, col: 5 }, to: { row: 4, col: 3 }, color: 'white' }, // 4.Nxd4
      { from: { row: 0, col: 6 }, to: { row: 2, col: 5 }, color: 'black' }, // 4...Nf6
    ],
    difficulty: 'advanced',
    century: '20ème siècle',
    masters: ['Mikhail Tal', 'Garry Kasparov', 'Vladimir Kramnik']
  },
'queens_gambit_declined': {
  name: "Gambit de la Dame – Variante Classique Déclinée",
  description: "Un monument du jeu positionnel, équilibré et robuste.",
  moves: [
    { from: { row: 6, col: 3 }, to: { row: 4, col: 3 }, color: 'white' }, // 1.d4
    { from: { row: 1, col: 3 }, to: { row: 3, col: 3 }, color: 'black' }, // 1...d5
    { from: { row: 6, col: 2 }, to: { row: 4, col: 2 }, color: 'white' }, // 2.c4
    { from: { row: 1, col: 4 }, to: { row: 2, col: 4 }, color: 'black' }, // 2...e6
    { from: { row: 7, col: 6 }, to: { row: 5, col: 5 }, color: 'white' }, // 3.Nc3
    { from: { row: 0, col: 6 }, to: { row: 2, col: 5 }, color: 'black' }, // 3...Nf6
    { from: { row: 7, col: 5 }, to: { row: 5, col: 7 }, color: 'white' }, // 4.Bg5
    { from: { row: 1, col: 5 }, to: { row: 2, col: 5 }, color: 'black' }, // 4...Be7
    { from: { row: 7, col: 4 }, to: { row: 6, col: 4 }, color: 'white' }, // 5.e3
    { from: { row: 0, col: 5 }, to: { row: 1, col: 6 }, color: 'black' }, // 5...O-O (Roque noir)
  ],
  difficulty: 'intermediate',
  century: '15ème siècle',
  masters: ['José Raúl Capablanca', 'Anatoly Karpov', 'Beth Harmon (?)']
}
,
 'queens_gambit': {
  name: "Gambit de la Dame",
  description: "Élégance et contrôle central. Beth Harmon approved.",
  moves: [
    { from: { row: 6, col: 3 }, to: { row: 4, col: 3 }, color: 'white' }, // 1.d4
    { from: { row: 1, col: 3 }, to: { row: 3, col: 3 }, color: 'black' }, // 1...d5
    { from: { row: 6, col: 2 }, to: { row: 4, col: 2 }, color: 'white' }, // 2.c4
    { from: { row: 3, col: 3 }, to: { row: 4, col: 2 }, color: 'black' }, // 2...dxc4 (accepté)
    { from: { row: 7, col: 1 }, to: { row: 5, col: 2 }, color: 'white' }, // 3.Nc3
    { from: { row: 1, col: 4 }, to: { row: 2, col: 4 }, color: 'black' }, // 3...e6
  ],
  difficulty: 'intermediate',
  century: '15ème siècle',
  masters: ['Alexander Alekhine', 'Anatoly Karpov', 'Vladimir Kramnik'],
  variations: {
    accepted: { name: "Gambit accepté", move: { from: { row: 3, col: 3 }, to: { row: 4, col: 2 }, color: 'black' } },
    declined: { name: "Gambit décliné", move: { from: { row: 1, col: 4 }, to: { row: 3, col: 4 }, color: 'black' } }
  }
},
'catalan_closed': {
  name: "Ouverture Catalane (Variante Fermée)",
  description: "Ouverture moderne, flexible, alliant fianchetto et contrôle du centre.",
  moves: [
    { from: { row: 6, col: 3 }, to: { row: 4, col: 3 }, color: 'white' }, // 1.d4
    { from: { row: 1, col: 3 }, to: { row: 3, col: 3 }, color: 'black' }, // 1...d5
    { from: { row: 6, col: 2 }, to: { row: 4, col: 2 }, color: 'white' }, // 2.c4
    { from: { row: 1, col: 6 }, to: { row: 3, col: 6 }, color: 'black' }, // 2...e6
    { from: { row: 7, col: 6 }, to: { row: 5, col: 5 }, color: 'white' }, // 3.Nf3
    { from: { row: 0, col: 6 }, to: { row: 2, col: 5 }, color: 'black' }, // 3...Nf6
    { from: { row: 6, col: 1 }, to: { row: 5, col: 1 }, color: 'white' }, // 4.g3
    { from: { row: 1, col: 2 }, to: { row: 2, col: 2 }, color: 'black' }, // 4...c6
    { from: { row: 7, col: 5 }, to: { row: 6, col: 6 }, color: 'white' }, // 5.Bg2
    { from: { row: 0, col: 5 }, to: { row: 1, col: 4 }, color: 'black' }, // 5...Be7
    { from: { row: 7, col: 4 }, to: { row: 6, col: 4 }, color: 'white' }, // 6.O-O
  ],
  difficulty: 'advanced',
  century: '20ème siècle',
  masters: ['Vladimir Kramnik', 'Vishy Anand', 'Magnus Carlsen']
}
,
'grob_attack': {
  name: "Grob's Attack",
  description: "Une attaque provocante et farfelue, réservée aux audacieux.",
  moves: [
    { from: { row: 6, col: 6 }, to: { row: 4, col: 6 }, color: 'white' }, // 1.g4
    { from: { row: 1, col: 4 }, to: { row: 3, col: 4 }, color: 'black' }, // 1...e5
    { from: { row: 7, col: 6 }, to: { row: 5, col: 5 }, color: 'white' }, // 2.Nf3
    { from: { row: 0, col: 6 }, to: { row: 2, col: 5 }, color: 'black' }, // 2...Nf6
    { from: { row: 6, col: 5 }, to: { row: 4, col: 5 }, color: 'white' }, // 3.f4
    { from: { row: 1, col: 3 }, to: { row: 2, col: 3 }, color: 'black' }, // 3...d6
    { from: { row: 7, col: 5 }, to: { row: 6, col: 4 }, color: 'white' }, // 4.Bg2 (après g4)
  ],
  difficulty: 'troll',
  century: '20ème siècle',
  masters: ['Henri Grob', 'Simon Williams (aka Ginger GM)', 'Personne de sain d’esprit 😅']
}
,
'french_defense': {
  name: "Défense Française",
  description: "Solide comme un roc, mais un peu coincée.",
  moves: [
    { from: { row: 6, col: 4 }, to: { row: 4, col: 4 }, color: 'white' }, // 1.e4
    { from: { row: 1, col: 4 }, to: { row: 2, col: 4 }, color: 'black' }, // 1...e6
    { from: { row: 6, col: 3 }, to: { row: 4, col: 3 }, color: 'white' }, // 2.d4
    { from: { row: 1, col: 3 }, to: { row: 3, col: 3 }, color: 'black' }, // 2...d5
    { from: { row: 7, col: 6 }, to: { row: 5, col: 5 }, color: 'white' }, // 3.Nc3 (variante classique)
    { from: { row: 0, col: 1 }, to: { row: 2, col: 2 }, color: 'black' }, // 3...Nf6
  ],
  difficulty: 'beginner',
  century: '19ème siècle',
  masters: ['Mikhail Botvinnik', 'Viktor Korchnoi', 'Evgeny Bareev']
},

  'kings_indian': {
    name: "Défense Indienne du Roi",
    description: "Défense hypermoderne et agressive",
    moves: [
      { from: { row: 6, col: 3 }, to: { row: 4, col: 3 }, color: 'white' }, // 1.d4
      { from: { row: 0, col: 6 }, to: { row: 2, col: 5 }, color: 'black' }, // 1...Nf6
      { from: { row: 6, col: 2 }, to: { row: 4, col: 2 }, color: 'white' }, // 2.c4
      { from: { row: 1, col: 6 }, to: { row: 2, col: 6 }, color: 'black' }, // 2...g6
      { from: { row: 7, col: 1 }, to: { row: 5, col: 2 }, color: 'white' }, // 3.Nc3
      { from: { row: 0, col: 5 }, to: { row: 2, col: 7 }, color: 'black' }, // 3...Bg7
    ],
    difficulty: 'advanced',
    century: '20ème siècle',
    masters: ['Bobby Fischer', 'Garry Kasparov', 'Hikaru Nakamura']
  },

 'caro_kann': {
  name: "Défense Caro-Kann",
  description: "Défense solide, positionnelle et patiente. Une des préférées de Karpov.",
  moves: [
    { from: { row: 6, col: 4 }, to: { row: 4, col: 4 }, color: 'white' }, // 1.e4
    { from: { row: 1, col: 2 }, to: { row: 2, col: 2 }, color: 'black' }, // 1...c6
    { from: { row: 6, col: 3 }, to: { row: 4, col: 3 }, color: 'white' }, // 2.d4
    { from: { row: 1, col: 3 }, to: { row: 3, col: 3 }, color: 'black' }, // 2...d5
    { from: { row: 7, col: 1 }, to: { row: 5, col: 2 }, color: 'white' }, // 3.Nc3
    { from: { row: 3, col: 3 }, to: { row: 4, col: 3 }, color: 'black' }, // 3...dxe4
    { from: { row: 5, col: 2 }, to: { row: 4, col: 3 }, color: 'white' }, // 4.Nxe4
    { from: { row: 0, col: 5 }, to: { row: 3, col: 2 }, color: 'black' }, // 4...Bf5
    { from: { row: 6, col: 6 }, to: { row: 4, col: 5 }, color: 'white' }, // 5.Ng3
    { from: { row: 3, col: 2 }, to: { row: 2, col: 1 }, color: 'black' }, // 5...Bg6
    { from: { row: 6, col: 7 }, to: { row: 5, col: 7 }, color: 'white' }, // 6.h4
    { from: { row: 1, col: 7 }, to: { row: 2, col: 7 }, color: 'black' }, // 6...h6
    { from: { row: 7, col: 6 }, to: { row: 5, col: 5 }, color: 'white' }, // 7.Nf3
    { from: { row: 0, col: 1 }, to: { row: 2, col: 2 }, color: 'black' }, // 7...Nd7
  ],
  difficulty: 'intermediate',
  century: '19ème siècle',
  masters: ['Anatoly Karpov', 'Petrosian', 'Viswanathan Anand']
}
,

  // GAMBITS SPECTACULAIRES
 'kings_gambit': {
  name: "Gambit du Roi",
  description: "Un sacrifice audacieux pour une attaque rapide et violente.",
  moves: [
    { from: { row: 6, col: 4 }, to: { row: 4, col: 4 }, color: 'white' }, // 1.e4
    { from: { row: 1, col: 4 }, to: { row: 3, col: 4 }, color: 'black' }, // 1...e5
    { from: { row: 6, col: 5 }, to: { row: 4, col: 5 }, color: 'white' }, // 2.f4
    { from: { row: 3, col: 4 }, to: { row: 4, col: 5 }, color: 'black' }, // 2...exf4
    { from: { row: 7, col: 6 }, to: { row: 5, col: 5 }, color: 'white' }, // 3.Nf3
    { from: { row: 0, col: 5 }, to: { row: 1, col: 4 }, color: 'black' }, // 3...Bc5
    { from: { row: 7, col: 5 }, to: { row: 3, col: 1 }, color: 'white' }, // 4.Bc4
    { from: { row: 0, col: 6 }, to: { row: 2, col: 5 }, color: 'black' }, // 4...Nf6
  ],
  difficulty: 'advanced',
  century: '17ème siècle',
  masters: ['Adolf Anderssen', 'Paul Morphy', 'Boris Spassky']
},

  'evans_gambit': {
    name: "Gambit Evans",
    description: "Sacrifice de pion pour initiative",
    moves: [
      { from: { row: 6, col: 4 }, to: { row: 4, col: 4 }, color: 'white' }, // 1.e4
      { from: { row: 1, col: 4 }, to: { row: 3, col: 4 }, color: 'black' }, // 1...e5
      { from: { row: 7, col: 6 }, to: { row: 5, col: 5 }, color: 'white' }, // 2.Nf3
      { from: { row: 0, col: 1 }, to: { row: 2, col: 2 }, color: 'black' }, // 2...Nc6
      { from: { row: 7, col: 5 }, to: { row: 4, col: 2 }, color: 'white' }, // 3.Bc4
      { from: { row: 0, col: 5 }, to: { row: 3, col: 2 }, color: 'black' }, // 3...Bc5
      { from: { row: 6, col: 1 }, to: { row: 4, col: 1 }, color: 'white' }, // 4.b4
    ],
    difficulty: 'expert',
    century: '19ème siècle',
    masters: ['Paul Morphy', 'Garry Kasparov']
  },'halloween_gambit': {
  name: "Gambit Halloween",
  description: "Un sacrifice audacieux de cavalier pour une attaque sauvage et désordonnée, à réserver aux aventuriers du jeu d’échecs !",
  moves: [
    { from: { row: 6, col: 4 }, to: { row: 4, col: 4 }, color: 'white' }, // 1.e4
    { from: { row: 1, col: 4 }, to: { row: 3, col: 4 }, color: 'black' }, // 1...e5
    { from: { row: 7, col: 6 }, to: { row: 5, col: 5 }, color: 'white' }, // 2.Nf3
    { from: { row: 0, col: 1 }, to: { row: 2, col: 2 }, color: 'black' }, // 2...Nc6
    { from: { row: 7, col: 5 }, to: { row: 3, col: 1 }, color: 'white' }, // 3.Ng5 (sacrifice cavalier)
  ],
  difficulty: 'advanced',
  century: '19ème siècle',
  masters: ['Paul Morphy', 'Rudolf Spielmann', 'Alexandra Kosteniuk']
}
,
'london_system': {
  name: "London System",
  description: "Un système solide et flexible, idéal pour les joueurs cherchant un développement rapide et harmonieux.",
  moves: [
    { from: { row: 6, col: 3 }, to: { row: 4, col: 3 }, color: 'white' }, // 1.d4
    { from: { row: 1, col: 4 }, to: { row: 3, col: 4 }, color: 'black' }, // 1...d5
    { from: { row: 7, col: 5 }, to: { row: 5, col: 2 }, color: 'white' }, // 2.Bf4
    { from: { row: 1, col: 3 }, to: { row: 3, col: 3 }, color: 'black' }, // 2...c5
    { from: { row: 6, col: 2 }, to: { row: 4, col: 2 }, color: 'white' }, // 3.c4
    { from: { row: 0, col: 6 }, to: { row: 2, col: 5 }, color: 'black' }, // 3...Nf6
    { from: { row: 7, col: 6 }, to: { row: 5, col: 5 }, color: 'white' }, // 4.Nf3
    { from: { row: 0, col: 1 }, to: { row: 2, col: 2 }, color: 'black' }, // 4...Nc6
  ],
  difficulty: 'intermediate',
  century: '20ème siècle',
  masters: ['Magnus Carlsen', 'Garry Kasparov', 'Vladimir Kramnik']
}
,
  // OUVERTURES MODERNES
 'english_opening': {
  name: "Ouverture Anglaise",
  description: "Stratégie positionnelle et contrôle du centre à distance.",
  moves: [
    { from: { row: 6, col: 2 }, to: { row: 4, col: 2 }, color: 'white' }, // 1.c4
    { from: { row: 1, col: 4 }, to: { row: 3, col: 4 }, color: 'black' }, // 1...e5
    { from: { row: 7, col: 1 }, to: { row: 5, col: 2 }, color: 'white' }, // 2.Nc3
    { from: { row: 0, col: 1 }, to: { row: 2, col: 2 }, color: 'black' }, // 2...Nc6
    { from: { row: 7, col: 6 }, to: { row: 5, col: 5 }, color: 'white' }, // 3.Nf3
    { from: { row: 1, col: 3 }, to: { row: 3, col: 3 }, color: 'black' }, // 3...d6
    { from: { row: 6, col: 3 }, to: { row: 4, col: 3 }, color: 'white' }, // 4.d3
    { from: { row: 0, col: 6 }, to: { row: 2, col: 5 }, color: 'black' }, // 4...Nf6
  ],
  difficulty: 'intermediate',
  century: '20ème siècle',
  masters: ['Mikhail Botvinnik', 'Anatoly Karpov', 'Magnus Carlsen']
}

};

// Système de gestion des ouvertures
class OpeningManager {
  constructor() {
    this.currentOpening = null;
    this.moveIndex = 0;
    this.isActive = false;
    this.playerCanDeviate = true;
  }

  // Démarrer une ouverture spécifique
  startOpening(openingKey, playerColor = 'white') {
    this.currentOpening = FAMOUS_OPENINGS[openingKey];
    this.moveIndex = 0;
    this.isActive = true;
    this.playerColor = playerColor;
    this.playerIsWhite = playerColor === 'white';
    if (!this.currentOpening) {
      throw new Error(`Ouverture '${openingKey}' non trouvée`);
    }

    console.log(`🎭 Ouverture lancée: ${this.currentOpening.name}`);
    console.log(`📚 ${this.currentOpening.description}`);
    console.log(`👑 Maîtres célèbres: ${this.currentOpening.masters.join(', ')}`);
    
    return this.currentOpening;
  }

  // Obtenir le prochain coup de l'ouverture
  getNextOpeningMove(currentColor) {
    if (!this.isActive || !this.currentOpening) {
      return null;
    }

    const moves = this.currentOpening.moves;
    
    if (this.moveIndex >= moves.length) {
      this.isActive = false;
      console.log(`✅ Ouverture ${this.currentOpening.name} terminée !`);
      return null;
    }

    const originalMove = moves[this.moveIndex];
    
    // Vérifier si c'est le tour de la couleur demandée
    const moveColor = this.playerIsWhite ? originalMove.color : this.invertColor(originalMove.color);
    
    if (moveColor === currentColor) {
      this.moveIndex++;
      
      // Transformer le coup si le joueur est noir
      return this.playerIsWhite ? originalMove : this.transformMoveForBlackPlayer(originalMove);
    }

    return null;
  }
transformMoveForBlackPlayer(move) {
    return {
      ...move,
      from: { row: 7 - move.from.row, col: move.from.col },
      to: { row: 7 - move.to.row, col: move.to.col },
      color: this.invertColor(move.color)
    };
  }

  //  Inverser la couleur
  invertColor(color) {
    return color === 'white' ? 'black' : 'white';
  }
  // Vérifier si le joueur suit l'ouverture
  validatePlayerMove(move, currentColor) {
    if (!this.isActive || !this.currentOpening) {
      return { valid: true, message: "" };
    }

    const expectedOriginalMove = this.currentOpening.moves[this.moveIndex];
    
    if (!expectedOriginalMove) {
      return { valid: true, message: "" };
    }

    // Transformer le coup attendu si nécessaire
    const expectedMove = this.playerIsWhite ? 
      expectedOriginalMove : 
      this.transformMoveForBlackPlayer(expectedOriginalMove);

    // Vérifier si c'est le bon joueur
    const expectedColor = this.playerIsWhite ? expectedOriginalMove.color : this.invertColor(expectedOriginalMove.color);
    
    if (expectedColor !== currentColor) {
      return { valid: true, message: "" };
    }

    const isCorrect = (
      move.from.row === expectedMove.from.row &&
      move.from.col === expectedMove.from.col &&
      move.to.row === expectedMove.to.row &&
      move.to.col === expectedMove.to.col
    );

    if (isCorrect) {
      this.moveIndex++;
      return { 
        valid: true, 
        message: `✅ Parfait ! Coup ${this.moveIndex} de ${this.currentOpening.name}` 
      };
    } else if (this.playerCanDeviate) {
      this.isActive = false;
      return { 
        valid: true, 
        message: `🎯 Vous déviez de ${this.currentOpening.name}. L'IA continue normalement.` 
      };
    } else {
      return { 
        valid: false, 
        message: `❌ Ce coup ne correspond pas à ${this.currentOpening.name}. Essayez: ${this.formatMove(expectedMove)}` 
      };
    }
  }

  // Intégrer avec l'IA existante
  getAIMove(cases, currentColor, difficulty) {
    const openingMove = this.getNextOpeningMove(currentColor);
    
    if (openingMove) {
      const displayColor = this.playerIsWhite ? 
        (openingMove.color === 'white' ? 'Blancs' : 'Noirs') :
        (openingMove.color === 'white' ? 'Noirs' : 'Blancs');
        
      console.log(`🤖 IA (${displayColor}) joue: ${this.formatMove(openingMove)} (${this.currentOpening.name})`);
      return this.convertToMoveFormat(openingMove, cases);
    }

    // Utiliser l'IA normale
    return searchRootWithDifficulty(cases, currentColor, difficulty);
  }

  // Utilitaires
  formatMove(move, isWhite) {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = (this.playerIsWhite||isWhite) ? 
      ['8', '7', '6', '5', '4', '3', '2', '1'] :  // Vue normale
      ['1', '2', '3', '4', '5', '6', '7', '8'];   // Vue inversée
    
    
    const from = files[move.from.col??move.from.x] + ranks[move.from.row??move.from.y];
    const to = files[move.to.col??move.to.x] + ranks[move.to.row??move.to.y];
    
    return `${from}-${to}`;
  }

  convertToMoveFormat(openingMove, cases) {
    // Convertir le format d'ouverture vers le format de ton jeu
    const piece = cases[openingMove.from.row][openingMove.from.col];
    const captured = cases[openingMove.to.row][openingMove.to.col];
    
    return {
      from: openingMove.from,
      to: openingMove.to,
      piece: piece,
      captured: captured
    };
  }

  // Obtenir des suggestions d'ouvertures
  static getSuggestedOpenings(playerLevel = 'beginner') {
    const suggestions = [];
    
    for (const [key, opening] of Object.entries(FAMOUS_OPENINGS)) {
      if (opening.difficulty === playerLevel || playerLevel === 'all') {
        suggestions.push({
          key,
          name: opening.name,
          description: opening.description,
          difficulty: opening.difficulty,
          masters: opening.masters
        });
      }
    }
    
    return suggestions;
  }

  // Obtenir toutes les ouvertures avec métadonnées
  static getAllOpenings() {
    return Object.entries(FAMOUS_OPENINGS).map(([key, opening]) => ({
      key,
      ...opening
    }));
  }

  // Obtenir ouverture aléatoire selon niveau
  static getRandomOpening(difficulty = 'intermediate') {
    const suitableOpenings = Object.keys(FAMOUS_OPENINGS).filter(
      key => FAMOUS_OPENINGS[key].difficulty === difficulty
    );
    
    if (suitableOpenings.length === 0) {
      return Object.keys(FAMOUS_OPENINGS)[0]; // Fallback
    }
    
    return suitableOpenings[Math.floor(Math.random() * suitableOpenings.length)];
  }
}

// Export pour utilisation
export { OpeningManager, FAMOUS_OPENINGS };

// Exemple d'utilisation dans ton composant principal:
/*
const openingManager = new OpeningManager();

// Démarrer une ouverture
openingManager.startOpening('ruy_lopez', 'white');

// Dans ta fonction de coup de l'IA
function getAIMove(cases, color, difficulty) {
  return openingManager.getAIMove(cases, color, difficulty);
}

// Valider le coup du joueur
function validateMove(move, color) {
  return openingManager.validatePlayerMove(move, color);
}

// Obtenir les ouvertures disponibles
const suggestions = OpeningManager.getSuggestedOpenings('intermediate');
*/