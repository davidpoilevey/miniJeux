// Événements dynamiques de l'écosystème
// effect: identifie le type d'impact appliqué par BiomeWorld
// survivedPoints: points accordés au joueur s'il survit à l'événement dans son biome
// biomes: liste de biomes candidats, ou 'any'

export const EVENTS = {
  eruption: {
    id: 'eruption', name: 'Éruption volcanique', emoji: '🌋',
    effect: 'extinction_partielle',
    description: 'Extinction partielle dans un biome',
    severity: 0.5,
    biomes: ['jungle', 'montagne'],
    duration: 30,
    survivedPoints: 0,
  },
  glaciation: {
    id: 'glaciation', name: 'Glaciation', emoji: '❄️',
    effect: 'hostile_biomes',
    description: 'Les biomes tempérés deviennent hostiles temporairement',
    severity: 0.3,
    biomes: ['foret', 'savane', 'marecage'],
    duration: 60,
    survivedPoints: 75,
  },
  montee_eaux: {
    id: 'montee_eaux', name: 'Montée des eaux', emoji: '🌊',
    effect: 'invasion',
    description: 'L\'océan envahit le marécage — espèces terrestres fragilisées',
    severity: 0.35,
    biomes: ['marecage'],
    duration: 40,
    survivedPoints: 0,
  },
  secheresse: {
    id: 'secheresse', name: 'Sécheresse', emoji: '☀️',
    effect: 'herbivore_collapse',
    description: 'Les herbivores de savane et désert s\'effondrent',
    severity: 0.6,
    biomes: ['savane', 'desert'],
    duration: 50,
    survivedPoints: 0,
  },
  epidemie: {
    id: 'epidemie', name: 'Épidémie', emoji: '🦠',
    effect: 'species_collapse',
    description: 'Une espèce NPC s\'effondre brutalement, déséquilibre la chaîne',
    severity: 0.8,
    biomes: 'any',
    duration: 20,
    survivedPoints: 60,
  },
  espece_invasive: {
    id: 'espece_invasive', name: 'Espèce invasive', emoji: '👑',
    effect: 'new_predator',
    description: 'Une espèce agressive apparaît — pression accrue sur le joueur',
    severity: 0.4,
    biomes: 'any',
    duration: 80,
    survivedPoints: 80,
  },
};
