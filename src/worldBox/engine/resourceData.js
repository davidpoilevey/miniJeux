// ─────────────────────────────────────────────────────────────
// RESOURCE DATA — config statique terrain → plantes / minéraux
// ─────────────────────────────────────────────────────────────
//
// plants   : liste de { type, weight } — tirage pondéré
//            la fréquence globale de spawn dépend déjà de cell.fertility
//            dans _seedRessources() (Math.random() < fertility / 300)
//
// minerals : liste de { type, prob } — probabilité absolue par cellule
//            indépendant de la fertilité (géologie, pas biologie)
//
// ─────────────────────────────────────────────────────────────

export const TERRAIN_RESOURCES = {
  foret: {
    plants: [
      { type: 'arbre',      weight: 5 },
      { type: 'champignon', weight: 4 },
      { type: 'fougere',    weight: 3 },
      { type: 'baies',      weight: 2 },
    ],
    minerals: [
      { type: 'silex',   prob: 0.02  },
      { type: 'cristal', prob: 0.002 },
    ],
  },

  plaine: {
    plants: [
      { type: 'herbes',  weight: 5 },
      { type: 'fleurs',  weight: 3 },
      { type: 'fruits',  weight: 2 },
    ],
    minerals: [
      { type: 'argile',  prob: 0.02 },
      { type: 'silex',   prob: 0.01 },
    ],
  },

  desert: {
    plants: [
      { type: 'cactus',  weight: 6 },
      { type: 'aloe',    weight: 2 },
    ],
    minerals: [
      { type: 'petrole', prob: 0.025 },
      { type: 'sable',   prob: 0.06  },
    ],
  },

  marecage: {
    plants: [
      { type: 'jonc',     weight: 5 },
      { type: 'nenuphar', weight: 4 },
      { type: 'mousse',   weight: 3 },
    ],
    minerals: [
      { type: 'tourbe', prob: 0.07 },
      { type: 'silex',  prob: 0.005 },
    ],
  },

  montagne: {
    plants: [
      { type: 'edelweiss', weight: 2 },
      { type: 'lichen',    weight: 5 },
    ],
    minerals: [
      { type: 'or',      prob: 0.018 },
      { type: 'fer',     prob: 0.05  },
      { type: 'charbon', prob: 0.04  },
    ],
  },

  neige: {
    plants: [
      { type: 'lichen', weight: 1 },
    ],
    minerals: [
      { type: 'fer',     prob: 0.05 },
      { type: 'cristal', prob: 0.08 },
    ],
  },

  riviere: {
    plants: [
      { type: 'roseau', weight: 5 },
      { type: 'jonc',   weight: 4 },
    ],
    minerals: [
      { type: 'sable', prob: 0.09  },
      { type: 'or',    prob: 0.006 }, // alluvial, rare
    ],
  },

  glace: { plants: [
      { type: 'edelweiss', weight: 2 }
    ], minerals: [{ type: 'or',      prob: 0.018 },
      { type: 'fer',     prob: 0.01  },
      { type: 'petrole', prob: 0.02  }] },
  eau:   { plants: [], minerals: [
      ] },
};

// ─────────────────────────────────────────────────────────────
// Tirage pondéré parmi une liste de { type, weight }
// ─────────────────────────────────────────────────────────────
export function pickWeighted(items) {
  if (!items || items.length === 0) return null;
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item.type;
  }
  return items[items.length - 1].type;
}
