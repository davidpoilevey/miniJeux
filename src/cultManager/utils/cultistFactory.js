// ============================================
// GÉNÉRATION PROCÉDURALE D'ADEPTES
// ============================================

// Pool d'emojis personnes (environ 20 différents)
const EMOJI_POOL = [
  '👨', '👩', '🧑', '👴', '👵', '🧓',
  '👨‍🦱', '👩‍🦱', '👨‍🦰', '👩‍🦰', '👨‍🦳', '👩‍🦳',
  '👨‍🦲', '👩‍🦲', '🧔', '🧔‍♀️',
  '👨‍💼', '👩‍💼', '👨‍🎓', '👩‍🎓',
  '👨‍🏫', '👩‍🏫', '👨‍⚕️', '👩‍⚕️',
  '👨‍🌾', '👩‍🌾', '👨‍🍳', '👩‍🍳',
  '👨‍🔧', '👩‍🔧', '👨‍🏭', '👩‍🏭',
  '👨‍💻', '👩‍💻', '👨‍🎨', '👩‍🎨',
  '👨‍🚀', '👩‍🚀', '👨‍🚒', '👩‍🚒',
  '🕵️', '🕵️‍♀️', '💂', '💂‍♀️',
  '🥷', '👷', '👷‍♀️', '🤵', '🤵‍♀️',
  '👰', '👰‍♂️', '🤰', '🧑‍🍼',
  '🙍', '🙍‍♂️', '🙎', '🙎‍♂️',
  '🙅', '🙅‍♂️', '🙆', '🙆‍♂️',
  '💁', '💁‍♂️', '🙋', '🙋‍♂️',
  '🧏', '🧏‍♂️', '🙇', '🙇‍♂️',
  '🤦', '🤦‍♂️', '🤷', '🤷‍♂️',
];

// Prénoms variés
const FIRST_NAMES = [
  'Alex', 'Jordan', 'Morgan', 'Casey', 'Taylor', 'Sam', 'Charlie', 'Jamie',
  'Sophie', 'Lucas', 'Emma', 'Noah', 'Olivia', 'Liam', 'Ava', 'Ethan',
  'Mia', 'Mason', 'Isabella', 'William', 'Charlotte', 'James', 'Amelia',
  'Benjamin', 'Harper', 'Elijah', 'Evelyn', 'Logan', 'Abigail', 'Alexander',
  'Emily', 'Michael', 'Elizabeth', 'Daniel', 'Sofia', 'Henry', 'Avery',
  'Jackson', 'Ella', 'Sebastian', 'Scarlett', 'Aiden', 'Grace', 'Matthew',
  'Chloe', 'David', 'Victoria', 'Joseph', 'Madison', 'Carter', 'Luna',
  'Owen', 'Penelope', 'Dylan', 'Layla', 'Luke', 'Riley', 'Gabriel', 'Zoey',
  'Anthony', 'Nora', 'Isaac', 'Lily', 'Grayson', 'Hannah', 'Jack', 'Aria',
  'Julian', 'Aaliyah', 'Levi', 'Brooklyn', 'Christopher', 'Alice', 'Joshua',
  'Marie', 'André', 'Camille', 'Pierre', 'Julie', 'François', 'Céline',
  'Marc', 'Isabelle', 'Jean', 'Nathalie', 'Paul', 'Valérie', 'Michel',
];

// Noms de famille
const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
  'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
  'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark',
  'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King',
  'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green',
  'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
  'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz',
  'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris',
  'Morales', 'Murphy', 'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan',
  'Cooper', 'Peterson', 'Bailey', 'Reed', 'Kelly', 'Howard', 'Ramos',
  'Kim', 'Cox', 'Ward', 'Richardson', 'Watson', 'Brooks', 'Chavez',
  'Dupont', 'Bernard', 'Dubois', 'Lambert', 'Fontaine', 'Rousseau',
  'Vincent', 'Fournier', 'Morel', 'Girard', 'André', 'Lefebvre',
];

// Traits disponibles
const TRAITS = [
  'curieux',
  'seul',
  'vulnerable',
  'decuReligion',
  'rebelle',
  'idealiste',
  'desespere',
  'ambitieux',
  'naif',
  'manipulable',
];

// Descriptions par trait
const TRAIT_DESCRIPTIONS = {
  curieux: [
    "cherche des réponses au-delà du matérialisme",
    "a toujours été attiré par l'ésotérisme",
    "pense que la science ne peut pas tout expliquer",
    "veut explorer de nouveaux horizons spirituels",
  ],
  seul: [
    "cherche une communauté qui le comprenne",
    "se sent isolé dans la société moderne",
    "n'a jamais trouvé sa place ailleurs",
    "rêve d'appartenir à quelque chose de plus grand",
  ],
  vulnerable: [
    "traverse une période difficile",
    "a récemment vécu un traumatisme",
    "cherche du réconfort et des certitudes",
    "a besoin de se sentir protégé",
  ],
  decuReligion: [
    "est déçu par les religions traditionnelles",
    "a quitté l'église il y a peu",
    "cherche une spiritualité authentique",
    "pense que les institutions religieuses sont corrompues",
  ],
  rebelle: [
    "rejette les normes de la société",
    "veut renverser l'ordre établi",
    "pense que le système est pourri",
    "cherche une révolution spirituelle",
  ],
  idealiste: [
    "croit en un monde meilleur",
    "veut changer les choses",
    "pense pouvoir sauver l'humanité",
    "rêve d'une société plus juste",
  ],
  desespere: [
    "a tout perdu récemment",
    "ne voit plus de sens à sa vie",
    "cherche une raison de continuer",
    "est prêt à tout essayer",
  ],
  ambitieux: [
    "cherche à gravir les échelons",
    "veut avoir de l'influence",
    "pense mériter plus que ce qu'il a",
    "voit le culte comme une opportunité",
  ],
  naif: [
    "croit facilement ce qu'on lui dit",
    "fait confiance trop rapidement",
    "ne voit pas le mal chez les autres",
    "pense que tout le monde est sincère",
  ],
  manipulable: [
    "a du mal à dire non",
    "cherche constamment l'approbation",
    "change d'avis facilement",
    "suit les autres sans réfléchir",
  ],
};

// Stats de base selon le trait
const TRAIT_BASE_STATS = {
  curieux: { devotion: [5, 20], wealth: [50000, 200000], sanity: [70, 90], suspicion: [10, 25] },
  seul: { devotion: [15, 35], wealth: [20000, 80000], sanity: [60, 80], suspicion: [5, 15] },
  vulnerable: { devotion: [20, 40], wealth: [10000, 50000], sanity: [40, 70], suspicion: [0, 10] },
  decuReligion: { devotion: [5, 15], wealth: [80000, 250000], sanity: [75, 95], suspicion: [20, 40] },
  rebelle: { devotion: [10, 25], wealth: [30000, 100000], sanity: [65, 85], suspicion: [30, 50] },
  idealiste: { devotion: [25, 45], wealth: [40000, 120000], sanity: [70, 90], suspicion: [10, 20] },
  desespere: { devotion: [30, 50], wealth: [5000, 30000], sanity: [30, 60], suspicion: [0, 5] },
  ambitieux: { devotion: [5, 20], wealth: [100000, 400000], sanity: [80, 95], suspicion: [25, 45] },
  naif: { devotion: [25, 45], wealth: [15000, 60000], sanity: [50, 75], suspicion: [0, 10] },
  manipulable: { devotion: [20, 40], wealth: [20000, 70000], sanity: [55, 80], suspicion: [5, 15] },
};

/**
 * Construit les hiddenPowers d'un adepte
 * Basé sur son trait + randomisation pour 1-2 powers max
 */
const buildHiddenPower = (trait) => {
  const powers = {};
  
  // Power principal basé sur le trait (probabilité 70%)
  if (Math.random() < 0.7) {
    switch (trait) {
      case "curieux":
        powers.fuiteInfo = 0.2; // Risque de parler aux médias
        break;
      case "seul":
        powers.proselytisme = 1; // Ramène des gens comme lui
        break;
      case "decuReligion":
        powers.notoriete = 2; // Ancien religieux = visibilité
        break;
      case "vulnerable":
        powers.financeOcculte = 0.5; // Donne tout ce qu'il a
        break;
      case "rebelle":
        powers.lanceuseDalertes = 1.5; // Attire l'attention des autorités
        break;
      case "idealiste":
        powers.cohesionGroupe = 2; // Soude le groupe
        break;
      case "desespere":
        powers.manipulateur = 1.5; // Très malléable, influence les autres
        break;
      case "ambitieux":
        powers.influence = 1; // Contacts utiles
        break;
      case "naif":
        powers.proselytisme = 0.5; // Recrute sans le savoir
        break;
      case "manipulable":
        powers.financeOcculte = 0.3; // Facile à exploiter financièrement
        break;
      default:
        break;
    }
  }
  
  // Power secondaire aléatoire (probabilité 40%)
  if (Math.random() < 0.4) {
    const secondaryPowers = [
      { notoriete: 1 },
      { proselytisme: 0.5 },
      { fuiteInfo: 0.1 },
      { financeOcculte: 0.2 },
      { cohesionGroupe: 1 },
      { lanceuseDalertes: 0.5 },
      { influence: 0.5 },
      { manipulateur: 0.5 },
      { paranoiaque: 1 }, // Nouveau: augmente suspicion des autres
    ];
    
    const randomPower = secondaryPowers[Math.floor(Math.random() * secondaryPowers.length)];
    
    // Fusion avec le power existant (évite les doublons)
    Object.keys(randomPower).forEach(key => {
      if (powers[key]) {
        powers[key] += randomPower[key]; // Cumule si déjà présent
      } else {
        powers[key] = randomPower[key];
      }
    });
  }
  
  // Si aucun power n'a été attribué (30% de chance sur le principal raté)
  // On donne un petit power par défaut
  if (Object.keys(powers).length === 0) {
    powers.proselytisme = 0.3;
  }
  
  return [powers]; // Format array pour compatibilité
};

/**
 * Génère un nombre aléatoire dans un range
 */
const randomInRange = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Choisit un élément aléatoire dans un tableau
 */
const randomChoice = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * Crée un adepte avec un ID donné
 */
export const createCultist = (id) => {
  const trait = randomChoice(TRAITS);
  const stats = TRAIT_BASE_STATS[trait];
  const emoji = randomChoice(EMOJI_POOL);
  const firstName = randomChoice(FIRST_NAMES);
  const lastName = randomChoice(LAST_NAMES);
  
  // Initiale du nom pour anonymat (style "Tom R.")
  const displayName = `${firstName} ${lastName.charAt(0)}.`;
  
  const description = randomChoice(TRAIT_DESCRIPTIONS[trait]);
  
  return {
    id,
    name: displayName,
    fullName: `${firstName} ${lastName}`, // Stocké mais pas affiché
    emoji,
    devotion: randomInRange(stats.devotion[0], stats.devotion[1]),
    wealth: randomInRange(stats.wealth[0], stats.wealth[1]),
    sanity: randomInRange(stats.sanity[0], stats.sanity[1]),
    suspicion: randomInRange(stats.suspicion[0], stats.suspicion[1]),
    trait,
    description,
    hiddenPower: buildHiddenPower(trait),
    joinedDay: null, // Sera défini au recrutement
    revealed: false, // Les hiddenPowers sont-ils révélés ?
  };
};

/**
 * Génère plusieurs adeptes
 */
export const generateCultists = (count, startId = 1) => {
  const cultists = [];
  for (let i = 0; i < count; i++) {
    cultists.push(createCultist(startId + i));
  }
  return cultists;
};

/**
 * Génère un adepte de base (recruté passivement)
 */
export const createBaseCultist = (id, currentDay) => {
  const emoji = randomChoice(EMOJI_POOL);
  const firstName = randomChoice(FIRST_NAMES);
  
  // Traits pondérés pour les adeptes de base (plus de naïfs/vulnérables)
  const baseTraits = [
    'naif', 'naif', 'naif', // 30% naïf
    'manipulable', 'manipulable', // 20% manipulable
    'curieux', 'curieux', // 20% curieux
    'seul', 'seul', // 20% seul
    'vulnerable', // 10% vulnérable
  ];
  
  const trait = randomChoice(baseTraits);
  const description = `a suivi ${randomChoice(['un ami', 'un collègue', 'un proche', 'quelqu\'un du groupe'])}`;
  
  return {
    id,
    name: `${firstName} ${randomChoice(['D.', 'M.', 'L.', 'P.', 'K.'])}`,
    fullName: `${firstName} Doe`,
    emoji,
    devotion: randomInRange(5, 15), // Faible au début
    wealth: randomInRange(500, 5000), // Peu d'argent
    sanity: randomInRange(70, 95), // Sain d'esprit
    suspicion: randomInRange(0, 10), // Peu suspect
    trait,
    description,
    hiddenPower: [{}], // Pas de hidden power pour les adeptes de base
    joinedDay: currentDay,
    revealed: true, // Rien à révéler
    isBase: true, // Flag pour identifier les adeptes de base
  };
};

/**
 * Calcule les coûts de recrutement selon la richesse et le trait
 */
export const calculateRecruitmentCost = (cultist) => {
  const baseCost = 500;
  const wealthFactor = cultist.wealth * 0.01; // 1% de leur richesse
  
  // Modificateur selon le trait
  const traitModifiers = {
    desespere: 0.5, // Moins cher (désespéré)
    vulnerable: 0.7,
    naif: 0.8,
    seul: 0.9,
    curieux: 1,
    idealiste: 1.1,
    manipulable: 0.8,
    decuReligion: 1.3, // Plus cher (méfiant)
    rebelle: 1.2,
    ambitieux: 1.5, // Très cher (veut quelque chose)
  };
  
  const modifier = traitModifiers[cultist.trait] || 1;
  
  return Math.round((baseCost + wealthFactor) * modifier);
};

// Export des constantes pour utilisation externe
export { TRAITS, TRAIT_DESCRIPTIONS, EMOJI_POOL };