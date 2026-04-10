// ─────────────────────────────────────────────────────────────
// Définition des 6 villages — nom, couleur, avantage unique.
//
// Bonus possibles :
//   { type: 'stats',    stats: { force|intelligence|charme|perception: N } }
//     → chaque habitant né dans ce village a ces stats augmentées de N
//   { type: 'building', costFactor: 0.0–1.0 }
//     → les bâtiments coûtent X % de moins
//   { type: 'building', productionFactor: N }
//     → les bâtiments produisent N× plus de ressources
// ─────────────────────────────────────────────────────────────

export const VILLAGES = [
  {
    name:  'Strasbourg',
    color: '#e74c3c',   // rouge
    bonus: {
      type:  'stats',
      label: 'Guerriers — Force +25',
      stats: { force: 25 },
    },
  },
  {
    name:  'Haguenau',
    color: '#3498db',   // bleu
    bonus: {
      type:  'stats',
      label: 'Éclaireurs — Perception +25',
      stats: { perception: 25 },
    },
  },
  {
    name:  'Mulhouse',
    color: '#2ecc71',   // vert
    bonus: {
      type:       'building',
      label:      'Bâtisseurs — Coût des bâtiments −30 %',
      costFactor: 0.70,
    },
  },
  {
    name:  'Colmar',
    color: '#f39c12',   // or/orange
    bonus: {
      type:  'stats',
      label: 'Marchands — Charme +25',
      stats: { charme: 25 },
    },
  },
  {
    name:  'Metz',
    color: '#9b59b6',   // violet
    bonus: {
      type:  'stats',
      label: 'Savants — Intelligence +25',
      stats: { intelligence: 25 },
    },
  },
  {
    name:  'Belfort',
    color: '#1abc9c',   // turquoise
    bonus: {
      type:             'building',
      label:            'Productifs — Production des bâtiments ×1.5',
      productionFactor: 1.5,
    },
  },
];

// Lookup rapide par nom
export const VILLAGE_BY_NAME = Object.fromEntries(VILLAGES.map(v => [v.name, v]));
