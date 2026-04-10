// Arbre évolutif — tous les gènes débloquables
// requires: prérequis (IDs de gènes)
// unlocksBiomes: biomes débloqués à l'achat
// effects: modificateurs appliqués à la simulation joueur

export const GENES = {

  // ── ALIMENTATION ──────────────────────────────────────────────────────────

  excroissance_osseuse: {
    id: 'excroissance_osseuse', name: 'Excroissance osseuse',
    category: 'ALIMENTATION', cost: 15, requires: [],
    unlocksBiomes: [],
    effects: { broutage: true, energyBonus: 0.1 },
    description: 'Excroissance osseuse — Permet de brouter les vegetaux, devient herbivore',
  },
  dents_primitives: {
    id: 'dents_primitives', name: 'Dents primitives',
    category: 'ALIMENTATION', cost: 20, requires: ['excroissance_osseuse'],
    unlocksBiomes: [],
    effects: {omnivore: true, energyBonus: 0.2 },
    description: 'Premières dents — permet de manger petits animaux, condition pour omnivore',
  },
  dents_specialisees: {
    id: 'dents_specialisees', name: 'Dents spécialisées',
    category: 'ALIMENTATION', cost: 25, requires: ['dents_primitives'],
    unlocksBiomes: [],
    effects: { predation: true },
    description: 'Dents adaptées — amélioration de la chasse',
  
  },
  machoire_puissante: {
    id: 'machoire_puissante', name: 'Mâchoire puissante',
    category: 'ALIMENTATION', cost: 30, requires: ['dents_specialisees'],
    unlocksBiomes: [],
    effects: { predationBonus:0.1, apexAccess: true },
    description: 'Mâchoire renforcée — prédateur actif capable de chasser l\'apex',
  },

  // ── LOCOMOTION ────────────────────────────────────────────────────────────

  nageoires_renforcees: {
    id: 'nageoires_renforcees', name: 'Nageoires renforcées',
    category: 'LOCOMOTION', cost: 15, requires: [],
    unlocksBiomes: [],
    effects: { speedWater: 0.3 },
    description: 'Meilleure nage — vitesse aquatique +',
  },
  poumons_primitifs: {
    id: 'poumons_primitifs', name: 'Poumons primitifs',
    category: 'LOCOMOTION', cost: 30, requires: [],
    unlocksBiomes: ['marecage'],
    effects: { energyBonus:0.12 },
    description: 'Respiration amphibie — débloque Marécage',
  },
  poumons_developpes: {
    id: 'poumons_developpes', name: 'Poumons développés',
    category: 'LOCOMOTION', cost: 40, requires: ['poumons_primitifs'],
    unlocksBiomes: ['desert'],
    effects: { energyBonus:0.16 },
    description: 'Respiration aérienne , Poumons performants — condition pour conquerir les biomes terrestres',
  },
  pattes_primitives: {
    id: 'pattes_primitives', name: 'Pattes primitives',
    category: 'LOCOMOTION', cost: 35, requires: ['poumons_primitifs'],
    unlocksBiomes: ['jungle'],
    effects: { speedLand: 0.2 },
    description: 'Premières pattes — condition pour les biomes terrestres',
  },
  pattes_puissantes: {
    id: 'pattes_puissantes', name: 'Pattes puissantes',
    category: 'LOCOMOTION', cost: 25, requires: ['pattes_primitives','poumons_developpes'],
    unlocksBiomes: ['foret','toundra'],
    effects: { speedLand: 0.5 },
    description: 'Pattes robustes — vitesse terrestre +',
  },
  griffes: {
    id: 'griffes', name: 'Griffes',
    category: 'LOCOMOTION', cost: 20, requires: ['pattes_puissantes','poumons_developpes'],
    unlocksBiomes: ['montagne'],
    effects: {  predationBonus:0.2 },
    description: 'Griffes acérées — escalade et prédation, débloque Montagne',
  },
  endurance: {
    id: 'endurance', name: 'Endurance',
    category: 'LOCOMOTION', cost: 25, requires: ['pattes_puissantes','poumons_developpes'],
    unlocksBiomes: ['savane'],
    effects: { speedLand: 0.8,energyDrain:-0.01 },
    description: 'Endurance accrue — survie en milieu ouvert, débloque Savane',
  },

  // ── DÉFENSE ───────────────────────────────────────────────────────────────

  ecailles_renforcees: {
    id: 'ecailles_renforcees', name: 'Écailles renforcées',
    category: 'DEFENSE', cost: 25, requires: [],
    unlocksBiomes: [],
    effects: { defense: 0.4, heatResistance: 0.2 },
    description: 'Écailles épaisses — résistance physique aux attaques',
  },
  camouflage: {
    id: 'camouflage', name: 'Camouflage',
    category: 'DEFENSE', cost: 15, requires: [],
    unlocksBiomes: [],
    effects: { defense: 0.2 },
    description: 'Mimétisme — réduit fortement les attaques de prédateurs',
  },
  venin: {
    id: 'venin', name: 'Venin',
    category: 'DEFENSE', cost: 30, requires: [],
    unlocksBiomes: [],
    effects: { defense: 0.6 },
    description: 'Glandes à venin — dissuade les prédateurs et peut tuer',
  },
  fourrure_legere: {
    id: 'fourrure_legere', name: 'Fourrure légère',
    category: 'DEFENSE', cost: 20, requires: [],
    unlocksBiomes: ['foret'],
    effects: { coldResistance: 0.3, heatResistance: 0.1 },
    description: 'Premier pelage — résistance au froid légère, débloque Forêt',
  },
  fourrure_epaisse: {
    id: 'fourrure_epaisse', name: 'Fourrure épaisse',
    category: 'DEFENSE', cost: 30, requires: ['fourrure_legere'],
    unlocksBiomes: ['toundra'],
    effects: { coldResistance: 0.7 },
    description: 'Pelage dense — survie en milieu glacial, débloque Toundra',
  },

  // ── SOCIAL ────────────────────────────────────────────────────────────────

  banc_defensif: {
    id: 'banc_defensif', name: 'Banc défensif',
    category: 'SOCIAL', cost: 15, requires: [],
    unlocksBiomes: [],
    effects: { defense: 0.4 },
    description: 'Nage en banc serré — résistance aux prédateurs',
  },
  communication_primitive: {
    id: 'communication_primitive', name: 'Communication primitive',
    category: 'SOCIAL', cost: 25, requires: [],
    unlocksBiomes: [],
    effects: { coordination: 0.3 },
    description: 'Signaux basiques — coordination de groupe améliorée',
  },
  chasse_en_meute: {
    id: 'chasse_en_meute', name: 'Chasse en meute',
    category: 'SOCIAL', cost: 40, requires: ['communication_primitive'],
    unlocksBiomes: [],
    effects: { predationEfficiency: 2.0 },
    description: 'Chasse coordonnée — efficacité prédation ×2',
  },
  comportement_territorial: {
    id: 'comportement_territorial', name: 'Comportement territorial',
    category: 'SOCIAL', cost: 30, requires: ['communication_primitive'],
    unlocksBiomes: [],
    effects: { territory: true, resourceControl: 0.4 },
    description: 'Défense de territoire — zone de ressources protégée',
  },
  soins_parentaux: {
    id: 'soins_parentaux', name: 'Soins parentaux',
    category: 'SOCIAL', cost: 35, requires: [],
    unlocksBiomes: [],
    effects: { juvenileSurvival: 0.5 },
    description: 'Élevage des juvéniles — taux de survie des jeunes +',
  },

  // ── REPRODUCTION ──────────────────────────────────────────────────────────

  ponte_optimisee: {
    id: 'ponte_optimisee', name: 'Ponte optimisée',
    category: 'REPRODUCTION', cost: 20, requires: [],
    unlocksBiomes: [],
    effects: { birthRate: 0.3 },
    description: 'Ponte massive — croissance de population +',
  },
  vivipare: {
    id: 'vivipare', name: 'Vivipare',
    category: 'REPRODUCTION', cost: 35, requires: [],
    unlocksBiomes: [],
    effects: { juvenileSurvival: 0.4, birthRate: 0.1 },
    description: 'Naissance vivante — survie des jeunes ++',
  },
  selection_sexuelle: {
    id: 'selection_sexuelle', name: 'Sélection sexuelle',
    category: 'REPRODUCTION', cost: 25, requires: [],
    unlocksBiomes: [],
    effects: { geneticQuality: 0.3 },
    description: 'Choix du partenaire — qualité génétique des descendants +',
  },

  // ── ADAPTATION CLIMATIQUE ─────────────────────────────────────────────────

  thermoregulation: {
    id: 'thermoregulation', name: 'Thermorégulation',
    category: 'ADAPTATION', cost: 30, requires: [],
    unlocksBiomes: ['desert'],
    effects: { heatResistance: 0.6 },
    description: 'Régulation thermique interne — résistance chaleur extrême, débloque Désert',
  },
  hibernation: {
    id: 'hibernation', name: 'Hibernation',
    category: 'ADAPTATION', cost: 30, requires: [],
    unlocksBiomes: ['toundra'],
    effects: { winterSurvival: 0.7 },
    description: 'Ralentissement métabolique hivernal — survie en disette, condition Toundra',
  },
  resistance_froid: {
    id: 'resistance_froid', name: 'Résistance altitude',
    category: 'ADAPTATION', cost: 25, requires: ['fourrure_legere'],
    unlocksBiomes: ['montagne'],
    effects: { altitudeResistance: 0.5, coldResistance: 0.4 },
    description: 'Adaptation à l\'altitude et au froid — débloque Montagne',
  },
};

export const GENE_CATEGORIES = [
  'ALIMENTATION', 'LOCOMOTION', 'DEFENSE', 'SOCIAL', 'REPRODUCTION', 'ADAPTATION',
];
