import { image } from "framer-motion/client";

// AI Personalities
export const AI_PROFILES = {

  simple: {
    name: "Boris Jimston",
    image: "boris",
    speed: 3.5, // Increased from 5.0
    aggressiveness: 0.2,
    attackAngle: 0.1,
    defenseZone: 0.5,
    reactionTime: 80,
    missChance: 0.08,
    defensePattern: 'stationary',
    serveStyle: 'safe',
    description: "Il apprend juste a jouer"
  },
  rebonds: {
    name: "Chijing Pong",
    image: "chijing",
    speed: 6, // Increased from 5.0
    aggressiveness: 0.4,
    attackAngle: 0.7,
    defenseZone: 0.5,
    reactionTime: 30,
    missChance: 0.08,
    defensePattern: 'patrol',
    serveStyle: 'bounce',
    description: "Du pays du ping-pong, il aime les rebonds"
  },
  balanced: {
    name: "Borak Obamovich",
    image: "borak",
    speed: 4.5, // Increased from 5.0
    aggressiveness: 0.6,
    attackAngle: 0.5,
    defenseZone: 0.15,
    reactionTime: 40,
    missChance: 0.08,
    defensePattern: 'patrol',
    serveStyle: 'tricky',
    description: "Rapide et polyvalent"
  },
  aggressive: {
    name: "Ronald Grump",
    image: "ronald",
    speed: 7.0, // Increased from 5.5
    aggressiveness: 0.9,
    attackAngle: 0.7,
    defenseZone: 0.4,
    reactionTime: 50,
    missChance: 0.15,
    defensePattern: 'aggressive',
    serveStyle: 'power',
    description: "Agressif et imprévisible"
  },
  speedy: {
    name: "Justin Troupeau",
    image: "justin",
    speed: 8, // Increased from 5.0
    aggressiveness: 0.1,
    attackAngle: 0.3,
    defenseZone: 0.9,
    reactionTime: 20,
    missChance: 0.8,
    defensePattern: 'aggressive',
    serveStyle: 'bounce',
    description: "Rapide mais un peu trop sur de lui"
  },
  defensive: {
    name: "Vladimir Bearin",
    image: "vladimir",
    speed: 5.5, // Increased from 4.0
    aggressiveness: 0.3,
    attackAngle: 0.2,
    defenseZone: 0.25,
    reactionTime: 30,
    missChance: 0.05,
    defensePattern: 'stationary',
    serveStyle: 'tricky',
    description: "Défensif et calculateur"
  }
};


// Dictionnaire de dialogues par personnage et situation
export const getTauntDialogues = (aiName) => {
  const dialogues = {
    boris: {
      aiScoring_aiLeading: [
        "Yes! C'est comme ça qu'on fait!",
        "Tu vois Boris is best !",
        "Une biere pour célébrer!",
        "Trop facile pour moi!"
      ],
      aiScoring_playerLeading: [
        "Je reviens dans partie!",
        "Pas fini encore!",
        "Boris  jamais abandonner!",
        "Tu vas voir maintenant!"
      ],
      playerScoring_aiLeading: [
        "Bah... juste chanceux",
        "Profite, ça va pas durer",
        "Boris laisse toi gagner un peu",
        "Hmph... coup de chance"
      ],
      playerScoring_playerLeading: [
        "Nooo! Pas possible!",
        "Boris pas content!",
        "Tu triches ou quoi?!",
        "Grrrr..."
      ],
      tied: [
        "Match serré... j'aime ça!",
        "Égalité... pour l'instant",
        "Intéressant..."
      ]
    },
    ronald: {
  aiScoring_aiLeading: [
    "Point ÉNORME ! Le meilleur !",
    "Je gagne, et pas qu’un peu !",
    "Personne ne marque comme moi !",
    "Tir absolument phénoménal !"
  ],
  aiScoring_playerLeading: [
    "Mensonges ! Je reviens au score !",
    "Le retour commence MAINTENANT !",
    "T’as encore rien vu !",
    "Je fais les meilleurs retours !"
  ],
  playerScoring_aiLeading: [
    "Truqué ! Totalement truqué !",
    "Décision catastrophique !",
    "Tir chanceux, pathétique !",
    "Chasse aux sorcières !"
  ],
  playerScoring_playerLeading: [
    "C’est un désastre !",
    "Le pire accord commercial de l’histoire !",
    "Incroyable ! Tellement injuste !",
    "T’es viré… de la victoire !"
  ],
  tied: [
    "Égalité, mais je vais gagner !",
    "Coude à coude, les amis !",
    "Le meilleur match de tous les temps !"
  ]
},
borak: {
  aiScoring_aiLeading: [
    "Oui nous pouvons… gagner ça !",
    "Voilà ce que j’appelle jouer !",
    "Espoir ? Non. Victoire !",
    "Changeons… le score !"
  ],
  aiScoring_playerLeading: [
    "Soyons clairs : je reviens au score",
    "Ce n’est pas terminé",
    "C’est notre moment",
    "L’audace de l’espoir… de gagner !"
  ],
  playerScoring_aiLeading: [
    "Eh bien… ça arrive",
    "Je l’admets, joli tir",
    "Bien joué, mais insuffisant",
    "La démocratie en action, j’imagine"
  ],
  playerScoring_playerLeading: [
    "C’est… préoccupant",
    "Il nous faut du changement, vite !",
    "Euh… soyons clairs, c’est mauvais",
    "Michelle ne va pas aimer ça"
  ],
  tied: [
    "Un match équilibré, comme il faut",
    "Coude à coude !",
    "Le peuple mérite un match serré"
  ]
},
chijing: {
  aiScoring_aiLeading: [
    "中国赢了 ! La Chine gagne !",
    "Le dragon s’élève !",
    "L’harmonie par la victoire !",
    "Comme prévu !"
  ],
  aiScoring_playerLeading: [
    "La partie longue continue",
    "La patience mène à la victoire",
    "Un point après l’autre",
    "Le retour est inévitable"
  ],
  playerScoring_aiLeading: [
    "Revers temporaire",
    "Crédit social… diminué",
    "Hmm… noté",
    "Cela sera retenu"
  ],
  playerScoring_playerLeading: [
    "Ceci est… sans précédent",
    "Inacceptable !",
    "Le parti n’est pas satisfait",
    "Rééducation nécessaire !"
  ],
  tied: [
    "L’équilibre, comme toute chose",
    "Parfaitement équilibré",
    "Yin et yang"
  ]
},
justin: {
  aiScoring_aiLeading: [
    "Désolé… mais pas vraiment !",
    "Ô Canada ! 🍁",
    "Voilà comment on fait, hein !",
    "Magnifique tir, mon pote !"
  ],
  aiScoring_playerLeading: [
    "Pas de souci, je reviens, hein !",
    "Ça va être serré, camarade !",
    "Le retour est réel !",
    "Fais-moi confiance, je gère !"
  ],
  playerScoring_aiLeading: [
    "Beau tir… j’imagine",
    "Okay okay, t’en as mis un",
    "Ça… c’est la diversité du score ?",
    "Ça pourrait être pire, hein"
  ],
  playerScoring_playerLeading: [
    "Ce n’est pas très inclusif !",
    "On doit en parler…",
    "Euh… c’est problématique",
    "Je m’excuse… attends, pourquoi je perds ?!"
  ],
  tied: [
    "Une égalité ! Tellement canadien !",
    "Partageons la victoire, hein ?",
    "Parfaitement équilibré, comme mes selfies"
  ]
},
vladimir: {
  aiScoring_aiLeading: [
    "Как и планировал…",
    "Russie puissante !",
    "Tout se déroule selon le plan",
    "Trop facile, camarade"
  ],
  aiScoring_playerLeading: [
    "Retraite stratégique… puis victoire",
    "J’ai une opération spéciale pour gagner",
    "Aucune inquiétude",
    "Laissons-les croire qu’ils gagnent…"
  ],
  playerScoring_aiLeading: [
    "Perte acceptable",
    "Petit prix à payer",
    "Ça ne signifie rien",
    "Je l’autorise… pour l’instant"
  ],
  playerScoring_playerLeading: [
    "Ceci est… провокация !",
    "Propagande occidentale !",
    "Impossible !",
    "Le КГБ va enquêter !"
  ],
  tied: [
    "La guerre froide continue…",
    "Impasse… pour l’instant",
    "Nous nous rencontrons en égaux"
  ]
}

  };

  return dialogues[aiName] || dialogues.boris; // fallback sur boris
};

// Fonction pour obtenir un taunt aléatoire
export const getRandomTaunt = (situation, aiName) => {
  const dialogues = getTauntDialogues(aiName);
  const options = dialogues[situation] || [];
  if (options.length === 0) return null;
  return options[Math.floor(Math.random() * options.length)];
};
