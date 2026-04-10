// 8 biomes — configs statiques
// access: liste de gènes requis pour y migrer

export const BIOMES = {
  ocean: {
    id: 'ocean', name: 'Océan', emoji: '🌊',
    access: [],
    color: '#0a3d6b',
    ambiance: 'Point de départ',
    stressors: [],
  },
  marecage: {
    id: 'marecage', name: 'Marécage', emoji: '🌿',
    access: [],
    color: '#2d5a1b',
    ambiance: 'Zone de transition',
    stressors: ['humidity'],
  },
  jungle: {
    id: 'jungle', name: 'Jungle', emoji: '🌴',
    access: ['poumons_primitifs'],
    color: '#87de51',
    ambiance: 'Chaleur humide, compétition dense',
    stressors: ['heat', 'competition'],
  },
  foret: {
    id: 'foret', name: 'Forêt', emoji: '🌲',
    access: ['pattes_primitives', 'fourrure_legere'],
    color: '#0f9b0f',
    ambiance: 'Froid saisonnier, ressources cycliques',
    stressors: ['cold', 'seasonal'],
  },
  savane: {
    id: 'savane', name: 'Savane', emoji: '🦁',
    access: ['endurance', 'pattes_primitives'],
    color: '#a67c11',
    ambiance: 'Course, sécheresse, chasse en meute',
    stressors: ['drought', 'predation'],
  },
  desert: {
    id: 'desert', name: 'Désert', emoji: '🏜️',
    access: ['thermoregulation'],
    color: '#f0c25e',
    ambiance: 'Chaleur extrême, eau rare',
    stressors: ['extreme_heat', 'dehydration'],
  },
  montagne: {
    id: 'montagne', name: 'Montagne', emoji: '⛰️',
    access: ['resistance_froid'],
    color: '#5a6b7a',
    ambiance: 'Altitude, froid, ressources rares',
    stressors: ['altitude', 'cold'],
  },
  toundra: {
    id: 'toundra', name: 'Toundra', emoji: '❄️',
    access: ['fourrure_epaisse', 'hibernation'],
    color: '#a8c8e8',
    ambiance: 'Épreuve ultime, quasi inhabitable',
    stressors: ['extreme_cold', 'starvation'],
  },
};

export const BIOME_ORDER = [
  'ocean', 'marecage', 'jungle', 'foret', 'savane', 'desert', 'montagne', 'toundra',
];
