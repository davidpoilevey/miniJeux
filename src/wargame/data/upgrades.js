/**
 * Améliorations permanentes achetables en Caserne.
 * effect : { type: 'unitType' | 'all', [stat]: delta, ... }
 * Stats valides : movement, attack, defense, range
 */
export const WG_UPGRADES = [
  // ── Guerrier ────────────────────────────────────────────────────────────────
  {
    id: 'armure_renforcee',
    name: 'Armure renforcée',
    description: 'Les guerriers portent des plaques d\'acier trempé.',
    cost: 100,
    effect: { type: 'guerrier', defense: 1 },
  },
  {
    id: 'lames_acier',
    name: 'Lames en acier',
    description: 'Les guerriers frappent plus fort grâce à de meilleures lames.',
    cost: 150,
    effect: { type: 'guerrier', attack: 1 },
  },

  // ── Archer ──────────────────────────────────────────────────────────────────
  {
    id: 'carquois_leger',
    name: 'Carquois léger',
    description: 'Un carquois allégé permet aux archers de se déplacer plus vite.',
    cost: 120,
    effect: { type: 'archer', movement: 1 },
  },
  {
    id: 'arc_long',
    name: 'Arc long',
    description: 'Un arc plus puissant offre une case de portée supplémentaire.',
    cost: 200,
    effect: { type: 'archer', range: 1 },
  },
  {
    id: 'fleches_trempees',
    name: 'Flèches trempées',
    description: 'Des pointes durcies au feu augmentent les dégâts des archers.',
    cost: 160,
    effect: { type: 'archer', attack: 1 },
  },

  // ── Légion ──────────────────────────────────────────────────────────────────
  {
    id: 'formation_tortue',
    name: 'Formation en tortue',
    description: 'Les légions tiennent mieux leurs positions sous les assauts.',
    cost: 160,
    effect: { type: 'legion', defense: 2 },
  },
  {
    id: 'charge_legionnaire',
    name: 'Charge du légionnaire',
    description: 'Entraînement au corps à corps intensifié.',
    cost: 180,
    effect: { type: 'legion', attack: 1 },
  },

  // ── Canon ───────────────────────────────────────────────────────────────────
  {
    id: 'poudre_noire',
    name: 'Poudre noire améliorée',
    description: 'Une poudre plus dense permet aux canons de tirer plus loin.',
    cost: 280,
    effect: { type: 'canon', range: 1 },
  },
  {
    id: 'boulets_explosifs',
    name: 'Boulets explosifs',
    description: 'Des boulets à charge interne causent des dégâts renforcés.',
    cost: 320,
    effect: { type: 'canon', attack: 1 },
  },

  // ── Moine ───────────────────────────────────────────────────────────────────
  {
    id: 'prieres_protection',
    name: 'Prières de protection',
    description: 'La foi des moines renforce leur endurance au combat.',
    cost: 130,
    effect: { type: 'moine', defense: 2 },
  },

  // ── Mousquetaire ────────────────────────────────────────────────────────────
  {
    id: 'mousquets_precision',
    name: 'Mousquets de précision',
    description: 'Des canons rayés améliorent la précision des mousquetaires.',
    cost: 200,
    effect: { type: 'mousquetaire', attack: 1 },
  },
  {
    id: 'poudre_mousquet',
    name: 'Poudre fine',
    description: 'Une poudre plus raffinée allonge la portée des mousquets.',
    cost: 180,
    effect: { type: 'mousquetaire', range: 1 },
  },

  // ── Cavalier (caravane) ─────────────────────────────────────────────────────
  {
    id: 'montures_guerre',
    name: 'Montures de guerre',
    description: 'Des chevaux de race permettent aux cavaliers de galoper plus loin.',
    cost: 220,
    effect: { type: 'caravane', movement: 2 },
  },
  {
    id: 'lance_charge',
    name: 'Lance de charge',
    description: 'Une lance renforcée maximise l\'impact de la charge.',
    cost: 180,
    effect: { type: 'caravane', attack: 1 },
  },

  // ── Catapulte ───────────────────────────────────────────────────────────────
  {
    id: 'projectiles_explosifs',
    name: 'Projectiles explosifs',
    description: 'Des projectiles améliorés augmentent les dégâts des catapultes.',
    cost: 250,
    effect: { type: 'catapulte', attack: 1 },
  },
  {
    id: 'torsion_catapulte',
    name: 'Torsion renforcée',
    description: 'Un mécanisme de tension amélioré allonge la portée des catapultes.',
    cost: 230,
    effect: { type: 'catapulte', range: 1 },
  },

  // ── Baliste ─────────────────────────────────────────────────────────────────
  {
    id: 'boulons_acier',
    name: 'Boulons en acier',
    description: 'Des boulons plus lourds augmentent les dégâts des balistes.',
    cost: 210,
    effect: { type: 'baliste', attack: 1 },
  },

  // ── Toutes unités ───────────────────────────────────────────────────────────
  {
    id: 'ravitaillement',
    name: 'Ravitaillement amélioré',
    description: 'Une meilleure logistique renforce légèrement la résistance de toutes les troupes.',
    cost: 350,
    effect: { type: 'all', defense: 1 },
  },
];
