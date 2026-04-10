import imgSequenceur from './images/sequenceur.png';
import imgCentrale from './images/centrale.jpg';
import imgCentri from './images/centri.jpg';
import imgFiltre from './images/filtre.jpg';
import imgGrouillot from './images/grouillot.png';
import imgSolaire from './images/panneauSolaire.jpeg';
import imgPompe from './images/pompechaleur.jpeg';
import imgBactMoy from './images/ecoli.jpeg';
import imgBactCool from './images/coolBact.jpeg';
import imgBactEvil from './images/bactEvil.jpg';


export const BACTERIA_DATA = [
   {
  id: crypto.randomUUID(),
  name: "E.coli Base",
  description:"Produit surtout de la biomasse",
  level: 1, image:imgBactMoy,
  cost:10,
  health: 100,           // vitalité (0 = morte)
  stability: 1.0,        // 1 = stable, <1 = risque de mutation
  mutationChance: 0.03,  // % par tick
  baseYield: 1.0,        // rendement en biomasse
  baseEnergyCost: 1.0,   // énergie nécessaire par cycle
  baseNutrientCost: 1.0, // nutriments nécessaires par cycle
  optimalTemp:37,
  optimalOxygen:10,
  wasteRate: 0.1,        // proportion de déchet générée
  dna: {                 // gènes actifs (modifiables par recherche)
    efficiency: 1.0,
    resilience: 1.0,
    purity: 1.0,
  },
  genes:[],//"neuroToxique", colourRose, insuline, botulique, acideHcl
  product: [{             // ce que cette souche produit
    name: "biomass",
    value: 5,            // crédits gagnés par unité
  }],
  status: "idle",        // "idle", "growing", "mutated", "dead"
},{
  id: crypto.randomUUID(),
  name: "Staphylocoque",image:imgBactEvil,
  cost:500,
  description:"Produit de l'acide chlorydrique, Gros rendement, grosse consommation, grosse pollution. A tendance a mal supporter la cohabitation avec d'autres souches",
  level: 1,
  health: 100,           // vitalité (0 = morte)
  stability: 0.6,        // 1 = stable, <1 = risque de mutation
  mutationChance: 0.06,  // % par tick
  baseYield: 2.0,        // rendement en biomasse
  baseEnergyCost: 2.0,   // énergie nécessaire par cycle
  baseNutrientCost: 1.4, // nutriments nécessaires par cycle
  optimalTemp:28,
  optimalOxygen:50,
  wasteRate: 0.3,        // proportion de déchet générée
  dna: {                 // gènes actifs (modifiables par recherche)
    efficiency: 1.0,
    resilience: 1.0,
    purity: 1.0,
  },
  genes:['acideHcl','bacteriophageGene'],//"toxineProduction", colourRose
  product: [{             // ce que cette souche produit
    name: "biomass",
    value: 8,            // crédits gagnés par unité
  }, {name:"acideHcl", rentability:1.5, greenWashing:-1}],
  status: "idle",        // "idle", "growing", "mutated", "dead"
},{
  id: crypto.randomUUID(),
  name: "Psychrophile",
  cost:6000,image:imgBactCool,
  description:"Bacterie qui aime le froid. Peu gourmande et bon rendement. Peut fabriquer de l'antigel",
  level: 1,
  health: 100,           // vitalité (0 = morte)
  stability: 0.8,        // 1 = stable, <1 = risque de mutation
  mutationChance: 0.01,  // % par tick
  baseYield: 1.6,        // rendement en biomasse
  baseEnergyCost: 0.6,   // énergie nécessaire par cycle
  baseNutrientCost: 0.6, // nutriments nécessaires par cycle
  optimalTemp:12,
  optimalOxygen:80,
  wasteRate: 0.2,        // proportion de déchet générée
  dna: {                 // gènes actifs (modifiables par recherche)
    efficiency: 0.4,
    resilience: 0.5,
    purity: 0.5,
  },
  genes:['antigelGene',"oxygenAffinity"],
  product: [{             // ce que cette souche produit
    name: "biomass",
    value: 1,            // crédits gagnés par unité
  }, {name:"antigel", rentability:3, greenWashing:-0.5}],
  status: "idle",        // "idle", "growing", "mutated", "dead"
},{
  id: crypto.randomUUID(),
  name: "Thermococcus Ignis",
  cost: 2200,
  description: "Micro-organisme thermophile vivant dans les sources chaudes. Excellente stabilité, mais consomme énormément d’énergie.",
  level: 2,
  health: 100,
  stability: 0.95,
  mutationChance: 0.005,
  baseYield: 2.4,
  baseEnergyCost: 3.0,
  baseNutrientCost: 1.2,
  optimalTemp: 68,
  optimalOxygen: 20,
  wasteRate: 0.25,
  dna: {
    efficiency: 1.3,
    resilience: 1.2,
    purity: 0.8,
  },
  genes: ["heatShock"],
  product: [
    { name: "biomass", value: 5 },
    { name: "thermoEnzyme", rentability: 2.8, greenWashing: 1.2 },
  ],
  status: "idle",
},
{
  id: crypto.randomUUID(),
  name: "Cyanospira Lux",
  cost: 1800,
  description: "Cyanobactérie photosynthétique. Génère de l’énergie propre mais nécessite un environnement très oxygéné.",
  level: 2,
  health: 100,
  stability: 0.7,
  mutationChance: 0.02,
  baseYield: 1.8,
  baseEnergyCost: 0.2,
  baseNutrientCost: 0.8,
  optimalTemp: 30,
  optimalOxygen: 95,
  wasteRate: 0.05,
  dna: {
    efficiency: 1.0,
    resilience: 0.8,
    purity: 1.0,
  },
  genes: ["photoSynth", "biofuelGene"],
  product: [
    { name: "biomass", value: 4 },
    { name: "biofuel", rentability: 2.2, greenWashing: 3.0 },
  ],
  status: "idle",
},
{
  id: crypto.randomUUID(),
  name: "NecroBacter Exitus",
  cost: 3500,
  description: "Souche hautement instable issue d’une expérience douteuse. Produit une neurotoxine très lucrative, mais risque de contamination élevé.",
  level: 3,
  health: 100,
  stability: 0.4,
  mutationChance: 0.08,
  baseYield: 2.2,
  baseEnergyCost: 2.5,
  baseNutrientCost: 2.0,
  optimalTemp: 25,
  optimalOxygen: 35,
  wasteRate: 0.45,
  dna: {
    efficiency: 0.9,
    resilience: 0.5,
    purity: 0.3,
  },
  genes: ["neuroToxGene", "vampireGene"],
  product: [
    { name: "neuroToxine", rentability: 6, greenWashing: -3 },
  ],
  status: "idle",
}


]
// data/geneData.js
export const GENE_DATA = [
  // ---- INSULINE (exemple basique, appliqué une fois) ----
  {
    id: "insulineGene",
    name: "Gène Insuline",
    icon: "🧬",
    description: "Permet à la bactérie de produire de l'insuline — produit commercialisable (valeur modérée).",
    requires: ["advanced_purification"],
    appliedOnce: true, // on ne veut pas empiler plusieurs copies (idempotent)
    effects: [
      {
        type: "addProduct",
        payload: { name: "insuline", rentability: 2.5, greenWashing: 1.5, value: 4 }
      },
      {
        type: "modifyDNA",
        payload: { field: "efficiency", multiplier: 1.03 }
      }
    ]
  },

  // ---- GÈNE: NEURO-TOXINE (fort rendement mais coûteux) ----
  {
    id: "neuroToxGene",
    name: "Gène NeuroToxique",
    icon: "☠️",
    description: "Produit une neuro-toxine très rentable mais rend la souche instable.",
    requires: [],
    appliedOnce: true,
    effects: [
      { type: "addProduct", payload: { name: "neuroToxine", greenWashing: -10,rentability: 6.0 } },
      { type: "modifyStat", payload: { field: "stability", multiplier: 0.8 } }, // + mutation risk
      { type: "modifyStat", payload: { field: "wasteRate", multiplier: 1.5 } } // plus de déchets
    ]
  },

  // ---- GÈNE: BACTERIOPHAGE (négatif / dangereux) ----
  {
    id: "bacteriophageGene",
    name: "Gène Bactériophage",
    icon: "🦠",
    description: "Installe un phage : si une autre souche cohabite dans le même réacteur, risque d'épidémie mortelle.",
    requires: [],
    appliedOnce: true,
    effects: [
      // Effet spécial : déclenché par le moteur de simulation lorsqu'un réacteur contient >=2 souches
      { type: "onCoexistenceDamage", payload: { chancePerTick: 0.05, damage: 40, target: "randomOtherBacteria" } }
    ]
  },

  // ---- GÈNE: TOXINE BOTULIQUE (très rentable mais très gourmand) ----
  {
    id: "botuliqueGene",
    name: "Gène Botulique",
    icon: "☠️",
    description: "Autorise la production de toxine botulique (prix élevé), mais multiplie les coûts en nutriments et assez polluant.",
    requires: [],
    appliedOnce: true,
    effects: [
      { type: "addProduct", payload: { name: "botulique", greenWashing: -3, rentability: 8.0, value: 20 } },
      { type: "modifyStat", payload:  { field: "wasteRate", multiplier: 2 }},
      { type: "modifyStat", payload: { field: "baseNutrientCost", multiplier: 3 } }
    ]
  },
  // ---- GÈNE: Acide Cl ( rentable ) ----
  {
    id: "acideHcl",
    name: "Gène acide chlorydrique",
    icon: "☠️",
    description: "Autorise la production de acide chlorydrique (prix assez élevé),  coûts elevé en énergie, et tres polluant.",
    requires: [],
    appliedOnce: true,
    effects: [
      { type: "addProduct", payload: { name: "botulique", greenWashing: -3, rentability: 8.0, value: 20 } },
      { type: "modifyStat", payload: { field: "baseEnergyCost", multiplier: 3.0 } },
      { type: "modifyStat", payload: { field: "wasteRate", multiplier: 2.5 } }
    ]
  },{
  id: "heatShock",
  name: "Gène Heat Shock",
  icon: "🔥",
  description:
    "Ce gène renforce la résistance de la bactérie à la chaleur en produisant des protéines chaperonnes. Améliore la résilience, mais augmente la consommation d’énergie.",
  requires: [],
  appliedOnce: true,
  effects: [
    { type: "modifyDNA", payload: { field: "resilience", multiplier: 1.3 } },
    { type: "modifyStat", payload: { field: "baseEnergyCost", multiplier: 1.2 } },
    { type: "modifyStat", payload: { field: "optimalTemp", multiplier: 2 } }
  ]
}
,{
  id: "photoSynth",
  name: "Gène Photosynthétique",
  icon: "🌿",
  description:
    "Permet la capture d’énergie lumineuse, réduisant la dépendance énergétique mais nécessitant un environnement oxygéné et stable.",
  requires: [],
  appliedOnce: true,
  effects: [
    { type: "modifyStat", payload: { field: "baseEnergyCost", multiplier: 0.3 } },
    { type: "modifyStat", payload: { field: "baseNutrientCost", multiplier: 0.6 } },
    { type: "modifyDNA", payload: { field: "efficiency", multiplier: 2 } },
    { type: "modifyStat", payload: { field: "optimalOxygen", multiplier: 1.5 }  }
  ]
},{
  id: "oxygenAffinity",
  name: "Gène d’Affinité à l’Oxygène",
  icon: "💨",
  description:
    "Optimise la capture et l’utilisation de l’oxygène. Permet de croître dans des environnements plus pauvres, mais rend la bactérie vulnérable aux pics de pollution.",
  requires: [],
  appliedOnce: true,
  effects: [
    { type: "modifyStat", payload: { field: "optimalOxygen", multiplier: 0.7 } },
    { type: "modifyDNA", payload: { field: "efficiency", multiplier: 1.15 } },
    { type: "modifyStat", payload: { field: "wasteRate", multiplier: 1.2 } }
  ]
}
,{
  id: "biofuelGene",
  name: "Gène de Bio-Carburant",
  icon: "⛽",
  description:
    "Permet la production d’un composé énergétique brut à partir de biomasse. Très rentable et apprecié des bobos, mais énergivore.",
  requires: [],
  appliedOnce: true,
  effects: [
    { type: "addProduct", payload: { name: "biofuel", value: 25, rentability: 2.5, greenWashing: 3 } },
    { type: "modifyStat", payload: { field: "baseEnergyCost", multiplier: 1.8 } },
    { type: "modifyStat", payload: { field: "wasteRate", multiplier: 1.5 } }
  ]
}
,{
  id: "thermoEnzymeGene",
  name: "Gène de Thermo-Enzyme",
  icon: "⛽",
  description:
    "Permet la production d’un enzyme tres recherché . Très rentable dans l'industrie, mais énergivore.",
  requires: [],
  appliedOnce: true,
  effects: [
    { type: "addProduct", payload: { name: "thermoEnzyme",  rentability: 20, greenWashing: -2 } },
    { type: "modifyStat", payload: { field: "baseEnergyCost", multiplier: 2 } },
    { type: "modifyStat", payload: { field: "wasteRate", multiplier: 1.1 } }
  ]
}
,{
  id: "antigelGene",
  name: "Secretion d'antigel",
  icon: "⛽",
  description:
    "Permet la secretion par la bacterie d'un antigel naturel. Assez rentable selon la saison, consomme bcq de nutriments mais peud d'energie",
  requires: [],
  appliedOnce: true,
  effects: [
    { type: "addProduct", payload: { name: "antigel", value: 25, rentability: 2.5, greenWashing: 1 } },
    { type: "modifyStat", payload: { field: "baseNutrientCost", multiplier: 1.8 } },
    { type: "modifyStat", payload: { field: "baseEnergyCost", multiplier: 0.5 } },
    { type: "modifyStat", payload: { field: "optimalTemp", multiplier: 0.5 } },
    { type: "modifyStat", payload: { field: "wasteRate", multiplier: 0.8 } }
  ]
}
,{
  id: "q10Gene",
  name: "Gène de Q10",
  icon: "⛽",
  description:
    "Permet la production de la molecule que veut L'Oreal, c'est inoffensif, mais ils payent tres bien pour ca .",
  requires: [],
  appliedOnce: true,
  effects: [
    { type: "addProduct", payload: { name: "ribosomeQ10",  rentability: 20, greenWashing: -2 } },
    { type: "modifyStat", payload: { field: "wasteRate", multiplier: 2 } }
  ]
}
,
  // ---- GÈNE: HYPERPROD (effet empilable) ----
  {
    id: "hyperProdGene",
    name: "Gène Hyper-Production",
    icon: "⚡",
    description: "Boost massif du rendement (empilable) — risque d'instabilité minorée.",
    requires: [],
    appliedOnce: false, // on peut l'appliquer plusieurs fois pour empiler la production
    effects: [
      { type: "modifyDNA", payload: { field: "efficiency", multiplier: 1.25 } },
      { type: "modifyStat", payload: { field: "mutationChance", additive: 0.02 } }
    ]
  },

  // ---- GÈNE: PURITY_ENH (améliore pureté, appliqué une fois) ----
  {
    id: "purityEnhancer",
    name: "Gène Purity+",
    icon: "✨",
    description: "Augmente la pureté des extraits (utile pour la recherche et la vente).",
    requires: ["insuline"],
    appliedOnce: true,
    effects: [
      { type: "modifyDNA", payload: { field: "purity", multiplier: 1.2 } },
      { type: "addFlag", payload: { flag: "high_purity" } }
    ]
  },

  // ---- GÈNE: VAMPIRE (négatif, vole énergie aux voisines) ----
  {
    id: "vampireGene",
    name: "Gène Vampire",
    icon: "吸",
    description: "La souche pompe de l'énergie aux autres souches du même réacteur — utile en solo mais toxique en groupe.",
    requires: [],
    appliedOnce: true,
    effects: [
      { type: "onCoexistenceDrain", payload: { energyDrainPerTick: 0.5, target: "others" } },
      { type: "modifyStat", payload: { field: "baseYield", multiplier: 1.4 } }
    ]
  },

  // ---- GÈNE: STABILITY_CORE (réduit la mutation) ----
  {
    id: "stabilityCore",
    name: "Gène de stabilisation",
    icon: "🛡️",
    description: "Diminue fortement la probabilité de mutations.",
    requires: [],
    appliedOnce: true,
    effects: [
      { type: "modifyStat", payload: { field: "mutationChance", multiplier: 0.5 } },
      { type: "modifyDNA", payload: { field: "resilience", multiplier: 1.2 } }
    ]
  },

  // ---- GÈNE: WASTE_TO_CREDIT (convertit partie des déchets en crédits) ----
  {
    id: "wasteRecycler",
    name: "Gène Recycler",
    icon: "♻️",
    description: "Transforme une fraction des déchets générés en crédits (faible rendement).",
    requires: [],
    appliedOnce: false,
    effects: [
      { type: "onProduceRecycle", payload: { fraction: 0.1, creditPerUnit: 1 } }
    ]
  },

  // ---- GÈNE: MUTAGEN (expérimental, comportement risqué — appliqué une fois) ----
  {
    id: "mutagenGene",
    name: "Gène Mutagène",
    icon: "⚗️",
    description: "Augmente la diversité génétique : hausse forte des mutations et chance d'apparition de nouveaux gènes (aléatoire).",
    requires: [],
    appliedOnce: true,
    effects: [
      { type: "modifyStat", payload: { field: "mutationChance", multiplier: 2.5 } },
      { type: "onMutationSpawnGene", payload: { chancePerMutation: 0.05 } }
    ]
  }
];


export const RESEARCH_DATA = [

  {
    id: "advanced_purification",
    name: "Purification avancée de l'ADN",
    description: "Débloque la centrifugeuse de précision pour l'extraction d'ADN pur.",
    cost: 1,
    duration: 30,
    type: "unlockMachine",
    target: "centrifugeuse",
    requires: [],
    icon: "🧫",
    category: "Instrumentation",
  },
  {
    id: "degagez_espace",
    name: "Se faire un petit bureau sympa",
    description: "Permet d'avoir un open space pour embaucher un grouillot.",
    cost: 0,
    duration: 70,
    type: "unlockMachine",
    target: "grouillot",
    requires: [],
    icon: "🧫",
    category: "Instrumentation",
  },
  {
    id: "avoir_wifi",
    name: "Gratter le wi-fi",
    description: "Obtenir le mot de passe du wifi du MacDo a coté pour faire venir un Community manager.",
    cost: 0,
    duration: 40,
    type: "unlockMachine",
    target: "communityManager",
    requires: ["degagez_espace"],
    icon: "🧫",
    category: "Instrumentation",
  },
  {
    id: "subvention",
    name: "Obtenir une subvention",
    description: "La plus difficile des recherches. Demande du temps, mais permet de s'offrir le sterilisateur a UV",
    cost: 0,
    duration: 200,
    type: "unlockMachine",
    target: "communityManager",
    requires: ["avoir_wifi"],
    icon: "🧫",
    category: "Instrumentation",
  },
  {
    id: "insuline",
    name: "Synthèse d'insuline",
    description: "Permet aux souches avancées de produire de l'insuline.",
    cost: 5,
    duration: 160, // en ticks ou secondes
    type: "geneUnlock", // type : geneUnlock, unlockMachine, statBoost, globalUpgrade...
    target: "insulineGene",
    requires: ["advanced_purification"], // dépendances d'autres recherches
    icon: "🧬",
    category: "Bio-ingénierie",
  },
  {
    id: "biofuel_gene",
    name: "Synthèse de bio-fuel",
    description: "Permet aux souches avancées de produire du bio-fuel (tres rentable).",
    cost: 5,
    duration: 620, // en ticks ou secondes
    type: "geneUnlock", // type : geneUnlock, unlockMachine, statBoost, globalUpgrade...
    target: "biofuelGene",
    requires: ["advanced_purification"], // dépendances d'autres recherches
    icon: "🧬",
    category: "Bio-ingénierie",
  },
  {
    id: "thermoEnzymeRecherche",
    name: "Synthèse de Thermo Enzyme",
    description: "Permet aux souches avancées de produire du thermoEnzyme (tres rentable).",
    cost: 10,
    duration: 620, // en ticks ou secondes
    type: "geneUnlock", // type : geneUnlock, unlockMachine, statBoost, globalUpgrade...
    target: "thermoEnzyme",
    requires: ["advanced_purification"], // dépendances d'autres recherches
    icon: "🧬",
    category: "Bio-ingénierie",
  },
  {
    id: "antigel_gene",
    name: "Synthèse d'anti-gel",
    description: "Permet aux souches  de produire de l'antigel naturel (assez rentable).",
    cost: 10,
    duration: 620, // en ticks ou secondes
    type: "geneUnlock", // type : geneUnlock, unlockMachine, statBoost, globalUpgrade...
    target: "antigelGene",
    requires: ["advanced_purification"], // dépendances d'autres recherches
    icon: "🧬",
    category: "Bio-ingénierie",
  },
  {
    id: "q10Rech",
    name: "Commande L'Oreal",
    description: "On veut produire de l'enzyme Q10 (ultra rentable).",
    cost: 50,
    duration: 1400, // en ticks ou secondes
    type: "geneUnlock", // type : geneUnlock, unlockMachine, statBoost, globalUpgrade...
    target: "q10Gene",
    requires: ["advanced_purification"], // dépendances d'autres recherches
    icon: "🧬",
    category: "Bio-ingénierie",
  },
  {
    id: "toxin_resistance",
    name: "Résistance aux toxines",
    description: "Augmente la résilience des bactéries exposées à des milieux toxiques.",
    cost: 5,
    duration: 280,
    type: "statBoost",
    target: { field: "resilience", multiplier: 2 },
    requires: ["advanced_purification"],
    icon: "🧫",
    category: "Génétique",
  },
  {
    id: "efficiency_multipier",
    name: "Efficacité sur-boostée",
    description: "Augmente l'efficacité des bactéries au maximum.",
    cost: 10,
    duration: 380,
    type: "statBoost",
    target: { field: "resilience", multiplier: 5 },
    requires: ["advanced_purification"],
    icon: "🧫",
    category: "Génétique",
  },
  {
    id: "reactor_optimization",
    name: "Optimisation des bioréacteurs",
    description: "Améliore l'efficacité des réacteurs de 10%.",
    cost: 30,
    duration: 300,
    type: "globalUpgrade",
    target: { field: "efficiency", bonus: 0.1 },
    requires: ["advanced_purification"],
    icon: "⚙️",
    category: "Technologie",
  },
  {
    id: "reactor_superoptimization",
    name: "Boostage TURBO des bioréacteurs",
    description: "Améliore l'efficacité des réacteurs de 50%.",
    cost: 80,
    duration: 1000,
    type: "globalUpgrade",
    target: { field: "efficiency", bonus: 0.5 },
    requires: ["reactor_optimization"],
    icon: "⚙️",
    category: "Technologie",
  },
];


export const BIO_REACTOR_DATA = [
    {
  id: crypto.randomUUID(),
  name: "Fermenteur 1.0",
  cost:100,
  description:"Reacteur de base pour faire se reproduire les bacteries et produire de la biomasse",
  capacity: 1,            // nb de souches maximum
  assignedBacteria: [],   // ids des souches
  temperature: 37,        // degrés Celsius
  oxygenLevel: 0.8,       // proportion
  nutrientFlow: 1.0,      // débit relatif
  energyUsage: 5,         // consommation par tick
  efficiency: 0.5,        // modificateur général
  contaminationRisk: 0.0, // évolue avec le temps
  status: "running",      // "idle", "running", "maintenance"
},{
  id: crypto.randomUUID(),
  name: "Fermenteur Max Pro",
  cost:500,
  description:"Reacteur amélioré, avec 2 souches cultivables en meme temps. Meilleure efficacité",
  capacity: 2,            // nb de souches maximum
  assignedBacteria: [],   // ids des souches
  temperature: 37,        // degrés Celsius
  oxygenLevel: 0.8,       // proportion
  nutrientFlow: 1.0,      // débit relatif
  energyUsage: 15,         // consommation par tick
  efficiency: 1.0,        // modificateur général
  contaminationRisk: 0.1, // évolue avec le temps
  status: "running",      // "idle", "running", "maintenance"
}, {
  id: crypto.randomUUID(),
  name: "Bio-Reacteur triple",
  cost:12000,
  description:"Reacteur a triple capacité. Super efficace",
  capacity: 3,            // nb de souches maximum
  assignedBacteria: [],   // ids des souches
  temperature: 37,        // degrés Celsius
  oxygenLevel: 0.8,       // proportion
  nutrientFlow: 1.0,      // débit relatif
  energyUsage: 50,         // consommation par tick
  efficiency: 1.4,        // modificateur général
  contaminationRisk: 0.3, // évolue avec le temps
  status: "running",      // "idle", "running", "maintenance"
},{
  id: crypto.randomUUID(),
  name: "Bio-turbinateur",
  cost:100000,
  description:"Reacteur a grande capacité. 5 souches simultanees",
  capacity: 5,            // nb de souches maximum
  assignedBacteria: [],   // ids des souches
  temperature: 37,        // degrés Celsius
  oxygenLevel: 0.8,       // proportion
  nutrientFlow: 1.0,      // débit relatif
  energyUsage: 150,         // consommation par tick
  efficiency: 3.0,        // modificateur général
  contaminationRisk: 0.4, // évolue avec le temps
  status: "running",      // "idle", "running", "maintenance"
}
];

export const MACHINE_DATA = [
  {
    id: "filtre",
    name: "Filtre à air",
    description: "Réduit les déchets et la pollution en purifiant les émissions du réacteur.",
    category: "security",image:imgFiltre,
    powerUsage: 3,
    cost: 100, status:1.0,
    effect: (lab) => { if(!lab.machines.find(m=>m.id==='filtre')?.active)
        return;
      lab.resources.waste = Math.max(0, lab.resources.waste - Math.random());
      lab.resources.contamination =Math.max(0,lab.resources.contamination-0.01);// diminution de 1%
      
    },
    effectAchat: (lab) => {
      lab.unlockedMachines.splice(0,0,"filtreParticule","tuyau");
      return lab;
    },
  },{
    id: "filtreParticule",
    name: "Filtre à particules",
    description: "Réduit fortement les déchets et la pollution.",
    category: "security",
    powerUsage: 20,
    cost: 5000, status:1.0,
    effect: (lab) => {
      if(!lab.machines.find(m=>m.id==='filtreParticule')?.active)
        return;
      lab.resources.waste = Math.max(0, lab.resources.waste - Math.random()*10);
      lab.resources.contamination = Math.max(0,lab.resources.contamination-0.1);// diminution de 10%
      
     lab.reactors.forEach((r) => {
        r.contaminationRisk =  r.contaminationRisk*0.995; //diminue de 0.5% chaque tick le risque
      });
    },
    effectAchat: (lab) => {
     lab.reactors.forEach((r) => {
        r.contaminationRisk =  r.contaminationRisk*0.5; //diminue de moitie le risque
      });
    },
  },
  {
    id: "centrifugeuse",
    name: "Centrifugeuse",
    description: "Permet d'extraire de l'ADN brut",
    category: "production", image:imgCentri,
    powerUsage: 40,costOnUse:true,
    cost: 600,status:1.0,
    
    actions:[{id:'extraire_adn', name:"Extraire de l'ADN brut (100₡)", effect:(lab, api)=>{
      let souche = null;let log='';
      lab.bacteria.forEach(b=>{
        if(!lab.resources.adn_brut?.includes(b.id)){
          souche=b.id;
          log=b.name;
          return;
        }
      })
      if(souche==null) {
         lab.logs.push({ id: crypto.randomUUID(), message: "Toutes les souches ont été purifiées, Gardez votre argent", severity:'urgent', time: Date.now() });

        return lab;
      }
          lab.logs.push({ id: crypto.randomUUID(), message: "Vous possedez maintenant l'ADN brut de "+log, severity:'urgent', time: Date.now() });

      return {...lab, resources:{...lab.resources
        , credits:lab.resources.credits-100
        , adn_brut:[...(lab.resources?.adn_brut||[]), souche]}}
    }}],

    effect: (lab) => {
      if(!lab.unlockedMachines.includes('sequenceur_adn'))
        lab.unlockedMachines.push('sequenceur_adn');
      if(!lab.unlockedMachines.includes('sterilisateur_uv'))
        lab.unlockedMachines.push('sterilisateur_uv');
      return lab;
    },
    effectAchat: (lab) => {
      lab.unlockedMachines.splice(0,0,"sequenceur_adn","sterilisateur_uv");
      return lab;
    },
  },
  {
    id: "pompeChaleur",
    name: "Pompe a chaleur",
    description: "Produit de l'energie pour le labo (5/tick) pour un maximum de 100",
    category: "support",image:imgPompe,
    powerUsage: 0,costOnUse:true,
    cost: 200,status:1.0,
    
    effect: (lab) => {
      if(lab.machines.find(m=>m.id==='pompeChaleur')?.active)
      lab.resources.energy = Math.min(100, lab.resources.energy+5);
    },
    effectAchat: (lab) => {
      lab.unlockedMachines.splice(0,0,"panneauSolaire");
      return lab;
    },
  },
  {
    id: "panneauSolaire",
    name: "Panneau solaire",
    description: "Produit de l'energie pour le labo (25/tick, max 200)",
    category: "support",image:imgSolaire,
    powerUsage: 0, costOnUse:true,
    cost: 1000,status:1.0,
    
    effect: (lab) => {

       if(!lab.machines.find(m=>m.id==='panneauSolaire')?.active)
        return;
      lab.resources.energy = Math.min(200, lab.resources.energy+45);
    },
    effectAchat: (lab) => {
      lab.resources.reputation = Math.min(100, lab.resources.reputation+12);
      lab.unlockedMachines.splice(0,0,"arabes","centraleNucleaire");
    },
  },
  {
    id: "arabes",
    name: "Pipeline de gasoil",
    description: "Produit de l'energie pour le labo (50/tick, max 500), sale reputation par contre",
    category: "support",
    powerUsage: 0,costOnUse:true,
    cost: 10000,status:1.0,
    
    effect: (lab) => {
      
       if(!lab.machines.find(m=>m.id==='arabes')?.active)
        return;
      lab.resources.energy = Math.min(200, lab.resources.energy+50);
      lab.resources.reputation = Math.max(0, lab.resources.reputation-1);
       lab.reactors.forEach((r) => {
        r.contaminationRisk = Math.min(100, r.contaminationRisk + 0.04);
      });
    },
  },
  {
    id: "centraleNucleaire",
    name: "Centrale nucleaire",
    description: "Produit de l'energie infinie pour le labo (200/sec). Mais gros dangers de contamination et sale reputation",
    category: "support", image:imgCentrale,
    powerUsage: 0,
    cost: 25000,status:1.0,
    
    effect: (lab) => {

       if(!lab.machines.find(m=>m.id==='centraleNucleaire')?.active)
        return;
      lab.resources.energy = Math.min(2000, lab.resources.energy+200);
      lab.resources.reputation = Math.max(0, lab.resources.reputation-0.2);
       lab.reactors.forEach((r) => {
        r.contaminationRisk = Math.min(100, r.contaminationRisk + 0.01);
      });
    },
    effectAchat: (lab) => {
      lab.resources.energy = Math.min(200, lab.resources.energy+50);
      lab.resources.reputation = Math.max(0, lab.resources.reputation-1);
       lab.reactors.forEach((r) => {
        r.contaminationRisk = Math.min(100, r.contaminationRisk + 0.25);
      });
    },
  },
  {
    id: "grouillot",
    name: "Grouillot a nutriment",
    description: "Smicard chargé de remplir la cuve a nutriment avec une pelle (-3₡/tick)",
    category: "support", image:imgGrouillot,
    powerUsage: 2,
    cost: 200,status:1.0,
    
    effect: (lab) => {

       if(!lab.machines.find(m=>m.id==='grouillot')?.active)
        return;
      lab.resources.credits -=3;     
      lab.resources.nutrients = Math.min(200, lab.resources.nutrients+2);
    },
      effectAchat: (lab) => {
       lab.unlockedMachines.splice(0,0,"citerne");
    },
  },
  {
    id: "citerne",
    name: "Camion citerne de nutriment",
    description: "Enorme citerne pour remplir regulierement les nutriment (-20₡/tick)",
    category: "support",
    powerUsage: 2,
    cost: 2000,status:1.0,
    
    effect: (lab) => {

       if(!lab.machines.find(m=>m.id==='citerne')?.active)
        return;
      lab.resources.credits -=20;     
      lab.resources.nutrients = Math.min(500, lab.resources.nutrients+20);
    },
  },
  {
    id: "sterilisateur_uv",
    name: "Stérilisateur UV",
    description: "Réduit le risque de contamination global. Peut s'activer pour reduire la pollution. Necessite une subvention",
    category: "security",
    powerUsage: 3, 
    cost: 3000,status:1.0,
    actions:[{id:'sterilise', name:'Flasher la zone aux UV a 80 MegaWatt (100₡)', effect:(lab)=>{
      return {...lab
        , logs: [...lab.logs, { id: crypto.randomUUID(), message: "Vous avez reduit la contamination par deux", severity:'urgent', time: Date.now() }]
        , resources:{...lab.resources
        , credits:lab.resources.credits-100
        , contamination:lab.resources.contamination/2}}
    }}],
    effect: (lab) => {

       if(!lab.machines.find(m=>m.id==='sterilisateur_uv')?.active)
        return;
      lab.resources = {...lab.resources, contamination:lab.resources.contamination*0.99} //-1% par sec
      lab.reactors.forEach((r) => {
        r.contaminationRisk = Math.max(0, r.contaminationRisk - 0.01);
      });
    },
      effectAchat: (lab) => {
       lab.unlockedMachines.splice(0,0,"socorep","bioreacteur_enzymatique");
    },
  },{
    id: "socorep",
    name: "Contrat sous-traitance “EcoWaste”",
    description: "Une société externe vient vider les bennes — mais pas gratuitement. (20₡/sec)",
    category: "security",
    powerUsage: 1, 
    cost: 200,status:1.0,
    actions:[{id:'nettoyage', name:'Nettoyage complet de la zone (1000₡)', effect:(lab)=>{
      return {...lab,  logs:[...lab.logs,{ id: crypto.randomUUID(), message: "Tout a ete nettoyé.Vous pouvez recommencez a polluer", severity:'urgent', time: Date.now() }],
    resources:{...lab.resources
        , credits:lab.resources.credits-1000
        , waste:0
        , contamination:lab.resources.contamination/10}}
    }}],
    effect: (lab) => {

       if(!lab.machines.find(m=>m.id==='socorep')?.active)
        return;
      lab.resources = {...lab.resources, credits:lab.resources.credits-20
        , waste:lab.resources.waste-2} //-2% par sec
     
    },
      effectAchat: (lab) => {
      lab.resources.reputation = Math.max(0, lab.resources.reputation - 20);
    },
  },{
    id: "gerald",
    name: "Lobbyiste",
    description: "Un ex-ministre peut faire jouer ses relations pour soigner votre reputation, mais les diners au Fouquet's coutent cher (50₡/sec)",
    category: "security",
    powerUsage: 1, 
    cost: 2000,status:1.0,
    actions:[{id:'mib', name:"Men in Black (Rien ne s'est passé) (1000₡)", effect:(lab)=>{
      return {...lab, logs:[...lab.logs,{ id: crypto.randomUUID(), message: "C'etait une invasion de criquets mexicains... Rien ne s'est passé, vous adorez Bact.Inc. Rentrez chez vous", severity:'urgent', time: Date.now() }],
        resources:{...lab.resources
        , credits:lab.resources.credits-1000
        , reputation:90}}
    }}],
    effect: (lab) => {

       if(!lab.machines.find(m=>m.id==='gerald')?.active)
        return;
      lab.resources = {...lab.resources, reputation:Math.min(100, lab.resources.reputation + 3)
        , waste:lab.resources.waste-2} //-2% par sec
     
    },
      effectAchat: (lab) => {
      lab.resources.reputation = Math.min(100, lab.resources.reputation + 20);
    },
  },
  {
  id: "bioreacteur_enzymatique",
  name: "Bioréacteur enzymatique",
  description: "Utilise des enzymes mutantes pour décomposer les déchets organiques. Consomme un peu d'énergie, mais réduit durablement les déchets.",
  category: "security",
  cost: 3600,
  powerUsage: 10,
  effect: (lab) => {
       if(!lab.machines.find(m=>m.id==='bioreacteur_enzymatique')?.active)
        return;
    const wasteBefore = lab.resources.waste;
    const reduced = wasteBefore * 0.95; // -5% par tick
    lab.resources.waste = reduced;
    lab.resources.contamination = Math.max(0, lab.resources.contamination - 0.0005);
    return lab;
  },
      effectAchat: (lab) => {
      lab.resources.reputation = Math.min(100, lab.resources.reputation + 10);
    },
  actions: [
    {
      id: "cycle_recyclage",
      name: "Lancer un cycle de biodégradation (200₡)",
      effect: (lab) => ({
        ...lab,
        resources: {
          ...lab.resources,
          credits: lab.resources.credits - 200,
          waste: Math.max(0, lab.resources.waste * 0.7), // purge de 30 %
        }
      }),
    },
  ],
},

{
  id: "sequenceur_adn",
  name: "Séquenceur ADN", image:imgSequenceur,
  description: "Permet de jouer avec l'ADN brut extrait.",
  category: "production",
  powerUsage: 30,
  cost: 2500, status: 1.0,
  actions: [
    {
      id: 'sequenceRandom',
      name: 'Faire tourner au hasard (400₡)',
      // effet immédiat : choisit un gène aléatoire et l'ajoute aux unlocked (coûte & augmente contamination)
      effect: (lab) => {
        // IMPORTANT : ce code est exécuté dans setLabState(prev => { let lab = {...prev}; ...; return lab; })
        const GENE_IDS = GENE_DATA.map(g => g.id);
        const pick = GENE_IDS[Math.floor(Math.random() * GENE_IDS.length)];

        lab.resources = lab.resources || {};
        lab.resources.credits = (lab.resources.credits || 0) - 400;
        lab.resources.contamination = Math.max(1, (lab.resources.contamination || 0) + Math.random() * 0.2);

        // ajout au research.current.unlockedGenes si present — ici on push dans lab.research (fallback)
        if (lab) {
          lab.pendingResearch=(rech)=>{rech.unlockedGenes = Array.from(new Set([...(rech.unlockedGenes || []), pick]));return rech;}
           lab.logs.push({ id: crypto.randomUUID(), message: `Nouveau gene decouvert par hasard ${pick}`, severity:'urgent', time: Date.now() });

         }

        return lab;
      }
    },

    {
      id: 'useCRISPR',
      name: 'Utiliser le CRISPR (1500₡)',
      // effet : ENQUEUE une requête UI — ne tente pas d'ouvrir la dialog ici
      effect: (lab) => {

       if(!lab.machines.find(m=>m.id==='useCRISPR')?.active)
        return;
        lab.pendingMachineActions = lab.pendingMachineActions || [];
        lab.pendingMachineActions.push({
          id: crypto.randomUUID(),
          machineId: "sequenceur_adn",
          actionId: "useCRISPR",
          meta: { cost: 1500, contamination: 0.1 }, // métadonnées utiles pour la UI et l'exécution
          createdAt: Date.now(),
        });
        // coût immédiat optionnel : on peut réserver la somme ici or lors de confirmation
        lab.resources = lab.resources || {};
        lab.resources.credits = (lab.resources.credits || 0) - 1500; // réserve le coût maintenant
        lab.resources.contamination = Math.min(1, (lab.resources.contamination || 0) + 0.1);
        lab.logs = lab.logs || [];
        lab.logs.push({ id: crypto.randomUUID(), message: `CRISPR demandé sur ${lab.pendingMachineActions.at(-1).id}`,severity:'urgent', time: Date.now() });

        return lab;
      }
    }
  ]
}
,
  {
    id: "tuyau",
    name: "Gros tuyaux",
    description: "Double le debit en nutriments",
    category: "support",
    powerUsage: 5,
    cost: 600,status:1.0,
    effectAchat: (lab) => {
      lab.reactors.forEach((r) => {
        r.nutrientFlow*=2;
      });
    },
  },
  {
    id: "communityManager",
    name: "Community manager",
    description: "Soigne votre reputation sur les reseaux. Demande du reseau",
    category: "support",
    powerUsage: 5,
    cost: 1000,status:1.0,
    effect: (lab) => {
       if(!lab.machines.find(m=>m.id==='communityManager')?.active)
        return;
      lab.resources.reputation = Math.min(100, lab.resources.reputation + 1);
    }
    ,   effectAchat: (lab) => {
       lab.unlockedMachines.splice(0,0,"gerald");
    },
  },
];




export const PRODUCT_GLOBAL = [
  { id: "biomass", name: "Bio-masse", value: 2, icon: "🌿", volatility: 0.02, trend: 1, history: [] },
  { id: "insuline", name: "Insuline", value: 4, icon: "🧬", volatility: 0.025, trend: 1, history: [] },
  { id: "neuroToxine", name: "Neuro-Toxique", value: 8, icon: "☠️", volatility: 0.035, trend: 1.001, history: [] },
  { id: "botulique", name: "Toxine botulique", value: 6, icon: "☠️", volatility: 0.03, trend: 1.001, history: [] },
  { id: "acideHcl", name: "Acide HCl", value: 3, icon: "⚗️", volatility: 0.015, trend: 1, history: [] },
  {
  id: "biofuel",
  name: "Bio-Carburant",
  icon: "⛽",
  value: 10,
  volatility: 0.045,
  trend: 1.002,
  history: []
},{
  id: "thermoEnzyme",
  name: "Thermo-Enzyme",
  icon: "🧫",
  value: 4,
  volatility: 0.03,
  trend: 1.000,
  history: []
},{
  id: "antigel",
  name: "Protéine Antigel",
  icon: "❄️",
  value: 3,
  volatility: 0.02,
  trend: 1.001,
  history: []
},{
  id: "ribosomeQ10",
  name: "Ribosome-Q10",
  icon: "💎",
  value: 15,
  volatility: 0.06,
  trend: 1.004,
  history: [],
  bonus: { reputation: 4 }
}




];
// le meme mais pour la vente, donc on rajoute nutrients pour l'achat
const PRODUCTMARKET_GLOBAL=[...PRODUCT_GLOBAL, { id: "nutrients", name: "Nutriments", value: 1, icon: "🌿", volatility: 0.01, trend: 1, history: [] },
  ]
export const MARKET_BASE = {
  tick: 0,
  prices: PRODUCTMARKET_GLOBAL,
  contracts: [
    {
      id: "start",
      name: "Obtenir 1500 credits",
      reward: { credits: 1000, reputation: 10, pendingResearch:r=>({...r, points:r.points+1}) },
      condition: lab => lab.resources.credits>1500,
      description: "Prouver que vous savez gerer une production. La biomasse se vend bien.",
    },
    {
      id: "start_recherche",
      name: "Creer un gene",
      reward: { credits: 1000, reputation: 15,  pendingResearch:r=>({...r, points:r.points+2}) },
      condition: (lab, research) => research.unlockedGenes.includes('insulineGene'),
      description: "Creer le gene de production d'insuline.",
    },
    {
      id: "apply_recherche",
      name: "Ajouter le gene de l'insuline a une bacterie",
      reward: { credits: 2000, reputation: 25 ,  pendingResearch:r=>({...r, points:r.points+3})},
      condition: (lab, research) => lab.bacteria.find(b=>b.genes.includes('insulineGene'))!=null,
      description: "Modifier une souche pour y incorporer le gene de production d'insuline.",
    },
    {
      id: "insuline",
      name: "Production d'insuline",
      reward: { credits: 3000, reputation: 25,  pendingResearch:r=>({...r, points:r.points+1})},
      condition: lab => lab.resources.insuline >= 50,
      description: "Produisez au moins 50 insulines.",
    },
    {
      id: "advanced_search",
      name: "Recherche avancée",
      reward: { credits: 5000, reputation: -25,  pendingResearch:r=>({...r, points:r.points+3}) },
      condition: (lab, research) => research.unlockedGenes.length>=3,
      description: "Decouvrez au moins 3 genes.",
    },
    {
      id: "acide",
      name: "Production d'acide",
      reward: { credits: 3000, reputation: -25, pendingResearch:r=>({...r, points:r.points+1}) },
      condition: lab => lab.resources.acideHcl >= 500,
      description: "La petrochime a besoin de litres d'acide a bas cout (500litres).",
    },
  ],
};

