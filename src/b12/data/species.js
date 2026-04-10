// 4 espèces NPC par biome — configurations statiques
// role: 'herbivore' | 'herbivore' | 'predator' | 'apex' | 'omnivore'
// behavior: 'swarm' | 'herd' | 'pack' | 'solitary'

export const SPECIES = {
  // ── OCÉAN ─────────────────────────────────────────────────────────────────
  zooplancton: {
    id: 'zooplancton', name: 'Zooplancton', biome: 'ocean',
    role: 'herbivore', behavior: 'swarm', emoji: '🦐',
    minPop: 5, maxPop: 60, initialPop: 40, resilience: 0.9, color: '#88ccff',
  },
  meduse: {
    id: 'meduse', name: 'Méduse', biome: 'ocean',
    role: 'filtrer', behavior: 'solitary', emoji: '🪼',
    minPop: 2, maxPop: 25, initialPop: 15, resilience: 0.7, color: '#cc88ff',
  },
  requin: {
    id: 'requin', name: 'Requin', biome: 'ocean',
    role: 'predator', behavior: 'solitary', emoji: '🦈',
    minPop: 1, maxPop: 12, initialPop: 8, resilience: 0.8, color: '#336699',
  },
  tortue: {
    id: 'tortue', name: 'Tortue', biome: 'ocean',
    role: 'omnivore', behavior: 'solitary', emoji: '🐢',
    minPop: 2, maxPop: 18, initialPop: 10, resilience: 0.9, color: '#669933',
  },

  // ── MARÉCAGE ──────────────────────────────────────────────────────────────
  grenouille: {
    id: 'grenouille', name: 'Grenouille', biome: 'marecage',
    role: 'herbivore', behavior: 'swarm', emoji: '🐸',
    minPop: 5, maxPop: 40, initialPop: 25, resilience: 0.8, color: '#33cc33',
  },
  serpent_marec: {
    id: 'serpent_marec', name: 'Serpent', biome: 'marecage',
    role: 'predator', behavior: 'solitary', emoji: '🐍',
    minPop: 2, maxPop: 20, initialPop: 12, resilience: 0.75, color: '#666633',
  },
  heron: {
    id: 'heron', name: 'Héron', biome: 'marecage',
    role: 'apex', behavior: 'solitary', emoji: '🦢',
    minPop: 1, maxPop: 15, initialPop: 8, resilience: 0.7, color: '#cccccc',
  },
  crocodile: {
    id: 'crocodile', name: 'Crocodile', biome: 'marecage',
    role: 'apex', behavior: 'solitary', emoji: '🐊',
    minPop: 1, maxPop: 10, initialPop: 5, resilience: 0.85, color: '#336633',
  },

  // ── JUNGLE ────────────────────────────────────────────────────────────────
  singe: {
    id: 'singe', name: 'Singe', biome: 'jungle',
    role: 'omnivore', behavior: 'pack', emoji: '🐒',
    minPop: 4, maxPop: 35, initialPop: 20, resilience: 0.8, color: '#996633',
  },
  jaguar: {
    id: 'jaguar', name: 'Jaguar', biome: 'jungle',
    role: 'apex', behavior: 'solitary', emoji: '🐆',
    minPop: 1, maxPop: 12, initialPop: 6, resilience: 0.8, color: '#cc9900',
  },
  perroquet: {
    id: 'perroquet', name: 'Perroquet', biome: 'jungle',
    role: 'herbivore', behavior: 'swarm', emoji: '🦜',
    minPop: 3, maxPop: 30, initialPop: 18, resilience: 0.75, color: '#33cc66',
  },
  boa: {
    id: 'boa', name: 'Boa', biome: 'jungle',
    role: 'predator', behavior: 'solitary', emoji: '🐍',
    minPop: 1, maxPop: 15, initialPop: 8, resilience: 0.7, color: '#666600',
  },

  // ── FORÊT ─────────────────────────────────────────────────────────────────
  cerf: {
    id: 'cerf', name: 'Cerf', biome: 'foret',
    role: 'herbivore', behavior: 'herd', emoji: '🦌',
    minPop: 4, maxPop: 30, initialPop: 18, resilience: 0.75, color: '#cc9966',
  },
  loup: {
    id: 'loup', name: 'Loup', biome: 'foret',
    role: 'predator', behavior: 'pack', emoji: '🐺',
    minPop: 2, maxPop: 18, initialPop: 10, resilience: 0.8, color: '#888888',
  },
  hibou: {
    id: 'hibou', name: 'Hibou', biome: 'foret',
    role: 'apex', behavior: 'solitary', emoji: '🦉',
    minPop: 1, maxPop: 12, initialPop: 6, resilience: 0.7, color: '#cc9933',
  },
  sanglier: {
    id: 'sanglier', name: 'Sanglier', biome: 'foret',
    role: 'omnivore', behavior: 'herd', emoji: '🐗',
    minPop: 2, maxPop: 25, initialPop: 14, resilience: 0.8, color: '#663333',
  },

  // ── SAVANE ────────────────────────────────────────────────────────────────
  zebre: {
    id: 'zebre', name: 'Zèbre', biome: 'savane',
    role: 'herbivore', behavior: 'herd', emoji: '🦓',
    minPop: 5, maxPop: 40, initialPop: 25, resilience: 0.75, color: '#ccccaa',
  },
  lion: {
    id: 'lion', name: 'Lion', biome: 'savane',
    role: 'apex', behavior: 'pack', emoji: '🦁',
    minPop: 1, maxPop: 15, initialPop: 8, resilience: 0.85, color: '#cc9900',
  },
  hyene: {
    id: 'hyene', name: 'Hyène', biome: 'savane',
    role: 'omnivore', behavior: 'pack', emoji: '🐕',
    minPop: 2, maxPop: 20, initialPop: 12, resilience: 0.8, color: '#996633',
  },
  girafe: {
    id: 'girafe', name: 'Girafe', biome: 'savane',
    role: 'herbivore', behavior: 'solitary', emoji: '🦒',
    minPop: 2, maxPop: 18, initialPop: 10, resilience: 0.7, color: '#cc9933',
  },

  // ── DÉSERT ────────────────────────────────────────────────────────────────
  scorpion: {
    id: 'scorpion', name: 'Scorpion', biome: 'desert',
    role: 'predator', behavior: 'solitary', emoji: '🦂',
    minPop: 3, maxPop: 25, initialPop: 15, resilience: 0.85, color: '#cc6600',
  },
  varan: {
    id: 'varan', name: 'Varan', biome: 'desert',
    role: 'omnivore', behavior: 'solitary', emoji: '🦎',
    minPop: 2, maxPop: 20, initialPop: 12, resilience: 0.8, color: '#996600',
  },
  fennec: {
    id: 'fennec', name: 'Fennec', biome: 'desert',
    role: 'omnivore', behavior: 'solitary', emoji: '🦊',
    minPop: 2, maxPop: 18, initialPop: 10, resilience: 0.75, color: '#cc9966',
  },
  serpent_sonnette: {
    id: 'serpent_sonnette', name: 'Serpent sonnette', biome: 'desert',
    role: 'apex', behavior: 'solitary', emoji: '🐍',
    minPop: 1, maxPop: 12, initialPop: 6, resilience: 0.8, color: '#996633',
  },

  // ── MONTAGNE ──────────────────────────────────────────────────────────────
  bouquetin: {
    id: 'bouquetin', name: 'Bouquetin', biome: 'montagne',
    role: 'herbivore', behavior: 'herd', emoji: '🐐',
    minPop: 3, maxPop: 25, initialPop: 14, resilience: 0.75, color: '#ccaa88',
  },
  aigle: {
    id: 'aigle', name: 'Aigle', biome: 'montagne',
    role: 'apex', behavior: 'solitary', emoji: '🦅',
    minPop: 1, maxPop: 10, initialPop: 5, resilience: 0.8, color: '#996633',
  },
  ours: {
    id: 'ours', name: 'Ours', biome: 'montagne',
    role: 'omnivore', behavior: 'solitary', emoji: '🐻',
    minPop: 1, maxPop: 15, initialPop: 8, resilience: 0.85, color: '#663300',
  },
  marmotte: {
    id: 'marmotte', name: 'Marmotte', biome: 'montagne',
    role: 'herbivore', behavior: 'swarm', emoji: '🐿️',
    minPop: 4, maxPop: 30, initialPop: 18, resilience: 0.7, color: '#cc9966',
  },

  // ── TOUNDRA ───────────────────────────────────────────────────────────────
  caribou: {
    id: 'caribou', name: 'Caribou', biome: 'toundra',
    role: 'herbivore', behavior: 'herd', emoji: '🦌',
    minPop: 4, maxPop: 30, initialPop: 18, resilience: 0.75, color: '#ccaa88',
  },
  loup_arctique: {
    id: 'loup_arctique', name: 'Loup arctique', biome: 'toundra',
    role: 'predator', behavior: 'pack', emoji: '🐺',
    minPop: 2, maxPop: 15, initialPop: 8, resilience: 0.8, color: '#eeeeee',
  },
  renard_arctique: {
    id: 'renard_arctique', name: 'Renard arctique', biome: 'toundra',
    role: 'omnivore', behavior: 'solitary', emoji: '🦊',
    minPop: 2, maxPop: 18, initialPop: 10, resilience: 0.75, color: '#eeeeff',
  },
  boeuf_musque: {
    id: 'boeuf_musque', name: 'Bœuf musqué', biome: 'toundra',
    role: 'herbivore', behavior: 'herd', emoji: '🐃',
    minPop: 3, maxPop: 20, initialPop: 12, resilience: 0.85, color: '#996633',
  },
};

// Index par biome (construit au chargement)
export const SPECIES_BY_BIOME = {};
for (const sp of Object.values(SPECIES)) {
  if (!SPECIES_BY_BIOME[sp.biome]) SPECIES_BY_BIOME[sp.biome] = [];
  SPECIES_BY_BIOME[sp.biome].push(sp);
}
