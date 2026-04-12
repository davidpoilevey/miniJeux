// ─── Roster data ──────────────────────────────────────────────────────────────
// Placeholder roster – real data will be injected via a ref from the parent.
// Structure matches generateStats() output + display fields.

export const MY_SQUAD = [
  {
    id: 1,
    name: 'M. NAVAS',
    role: 'gk',
    roleLabel: 'Gardien de but',
    roleCode: 'GK',
    forme: 88,
    overall: 84,
    stats: { tir: 72, passe: 54, vitesse: 56, forme: 88 },
    tacticRoles: ['Libero', 'Relanceur'],
    estimatedPrice: null,
  },
  {
    id: 2,
    name: 'S. RAMOS',
    role: 'def',
    roleLabel: 'Défenseur Central',
    roleCode: 'CB',
    forme: 72,
    overall: 89,
    stats: { tir: 44, passe: 60, vitesse: 63, forme: 72 },
    tacticRoles: ['Défense'],
    estimatedPrice: 22.0,
  },
  {
    id: 3,
    name: 'K. MBAPPÉ',
    role: 'fwd',
    roleLabel: 'Ailier Gauche',
    roleCode: 'LW',
    forme: 95,
    overall: 97,
    stats: { tir: 94, passe: 82, vitesse: 99, forme: 95 },
    tacticRoles: ['Ailier Intérieur', 'Finition'],
    estimatedPrice: 180.5,
  },
  {
    id: 4,
    name: 'T. KROOS',
    role: 'mid',
    roleLabel: 'Milieu Central',
    roleCode: 'CM',
    forme: 80,
    overall: 91,
    stats: { tir: 78, passe: 92, vitesse: 68, forme: 80 },
    tacticRoles: ['Métronome', 'Relais'],
    estimatedPrice: 35.0,
  },
];

// ─── Transfer market ──────────────────────────────────────────────────────────

export const TRANSFER_MARKET = [
  {
    id: 10,
    name: 'L. MODRIĆ',
    role: 'mid',
    roleLabel: 'Milieu Offensif',
    roleCode: 'CAM',
    overall: 87,
    price: 12.4,
  },
  {
    id: 11,
    name: 'V. VAN DIJK',
    role: 'def',
    roleLabel: 'Défenseur Central',
    roleCode: 'CB',
    overall: 92,
    price: 28.1,
  },
  {
    id: 12,
    name: 'E. HAALAND',
    role: 'fwd',
    roleLabel: 'Avant-Centre',
    roleCode: 'ST',
    overall: 93,
    price: 65.0,
  },
];
