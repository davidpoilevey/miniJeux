import { BUILDING_TYPES } from './buildingTypes';

/**
 * Événements aléatoires à la Civ 1 : chaque événement cible une ville du joueur.
 * `apply` mute la ville (une copie de travail de nextTurn) et retourne le message
 * à afficher dans le journal. `helpers` donne accès à quelques actions globales.
 */
export const RANDOM_EVENTS = [
  {
    id: 'moisson', weight: 3, bad: false,
    condition: () => true,
    apply: (city) => {
      city.resources.food = (city.resources.food || 0) + 30;
      return `🌾 Moisson exceptionnelle à ${city.name} : les greniers débordent (+30 nourriture) !`;
    },
  },
  {
    id: 'filonOr', weight: 3, bad: false,
    condition: () => true,
    apply: (city) => {
      city.resources.gold = (city.resources.gold || 0) + 50;
      return `💰 Un filon d'or est découvert près de ${city.name} (+50 or) !`;
    },
  },
  {
    id: 'percee', weight: 2, bad: false,
    condition: () => true,
    apply: (city) => {
      city.resources.science = (city.resources.science || 0) + 10;
      return `🧪 Un savant de ${city.name} fait une découverte inattendue (+10 science) !`;
    },
  },
  {
    id: 'incendie', weight: 2, bad: true,
    condition: (city) => (city.buildings || []).length > 0,
    apply: (city) => {
      const idx = Math.floor(Math.random() * city.buildings.length);
      const lost = city.buildings[idx];
      city.buildings = city.buildings.filter((_, i) => i !== idx);
      return `🔥 Un incendie ravage ${city.name} : ${BUILDING_TYPES[lost]?.name || lost} part en fumée !`;
    },
  },
  {
    id: 'epidemie', weight: 2, bad: true,
    condition: (city) => city.population > 2,
    apply: (city) => {
      city.population -= 1;
      return `🦠 Une épidémie frappe ${city.name} : 1000 habitants succombent.`;
    },
  },
  {
    id: 'migrationBarbare', weight: 1, bad: true,
    condition: () => true,
    apply: (city, helpers) => {
      helpers?.spawnBarbares?.(2);
      return `🏴‍☠️ Des éclaireurs rapportent une migration barbare aux frontières !`;
    },
  },
];

// tirage pondéré parmi les événements dont la condition passe pour cette ville
export const pickRandomEvent = (city) => {
  const eligible = RANDOM_EVENTS.filter(e => e.condition(city));
  const total = eligible.reduce((sum, e) => sum + e.weight, 0);
  if (total === 0) return null;
  let roll = Math.random() * total;
  for (const e of eligible) {
    roll -= e.weight;
    if (roll <= 0) return e;
  }
  return eligible[eligible.length - 1];
};
