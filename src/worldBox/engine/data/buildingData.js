// ─────────────────────────────────────────────────────────────
// BUILDING DATA — arbre technologique complet
// ─────────────────────────────────────────────────────────────
//
// trigger          : construit quand communityNeeds[need] < threshold
// cost             : ressources stockpile consommées
// needContribution : apport au communityNeed par instance construite
//                    (lu par CommunityDecisionSystem pour dériver les needs)
// maxPerVillage    : nb max de ce bâtiment
// requires         : prérequis { buildingId: minCount }
// ─────────────────────────────────────────────────────────────

export const BUILDINGS = [

  // ═══════════════════════════════════════════════════════════
  // SHELTER — hutte → maison → villa → immeuble
  // ═══════════════════════════════════════════════════════════
  {
    id: 'hutte', label: 'Hutte',
    trigger:         { need: 'shelter',   threshold: 12 },
    cost:            { bois: 3 },
    needContribution:{ shelter: 15 },
    maxPerVillage: 2,
  },
  {
    id: 'maison', label: 'Maison',
    trigger:         { need: 'shelter',   threshold: 32 },
    cost:            { bois: 6, argile: 3 },
    needContribution:{ shelter: 20 },
    maxPerVillage: 3,
    requires:        { hutte: 1 },
  },
  {
    id: 'villa', label: 'Villa',
    trigger:         { need: 'shelter',   threshold: 52 },
    cost:            { bois: 12, argile: 6, silex: 4 },
    needContribution:{ shelter: 35 },
    maxPerVillage: 3,
    requires:        { maison: 3 },
  },
  {
    id: 'immeuble', label: 'Immeuble',
    trigger:         { need: 'shelter',   threshold: 72 },
    cost:            { bois: 25, argile: 12, silex: 10, fer: 5 },
    needContribution:{ shelter: 45 },
    maxPerVillage: 2,
    requires:        { villa: 2 },
  },

  // ═══════════════════════════════════════════════════════════
  // COMMUNITY — place_centrale → mairie → place_forte → chateau
  // ═══════════════════════════════════════════════════════════
  {
    id: 'place_centrale', label: 'Place centrale',
    trigger:         { need: 'community', threshold: 15 },
    cost:            { bois: 8, silex: 5, argile: 3, charbon: 2 },
    needContribution:{ community: 10 },
    maxPerVillage: 1,
    requires:        { maison: 2 },
  },
  {
    id: 'mairie', label: 'Mairie',
    trigger:         { need: 'community', threshold: 35 },
    cost:            { bois: 15, silex: 10, argile: 5 },
    needContribution:{ community: 20 },
    maxPerVillage: 1,
    requires:        { place_centrale: 1 },
  },
  {
    id: 'place_forte', label: 'Place forte',
    trigger:         { need: 'community', threshold: 55 },
    cost:            { charbon: 20, silex: 25, fer: 6 },
    needContribution:{ community: 20 },
    maxPerVillage: 1,
    requires:        { mairie: 1 },
  },
  {
    id: 'chateau', label: 'Château',
    trigger:         { need: 'community', threshold: 75 },
    cost:            { argent: 300, silex: 50, charbon:20, fer: 12, or: 5 },
    needContribution:{ community: 25 },
    maxPerVillage: 1,
    requires:        { place_forte: 1 },
  },

  // ═══════════════════════════════════════════════════════════
  // FOOD SECURITY — grenier → ferme → silo → plantation
  // ═══════════════════════════════════════════════════════════
  {
    id: 'grenier', label: 'Grenier',
    trigger:         { need: 'food_security', threshold: 25 },
    cost:            { bois: 8, silex: 3 },
    needContribution:{ food_security: 15 },
    maxPerVillage: 2,
     produces : { nourriture: 1},
    requires:        { maison: 2 },
  },
  {
    id: 'ferme', label: 'Ferme',
    trigger:         { need: 'food_security', threshold: 45 },
    cost:            { bois: 12, argile: 5 },
    needContribution:{ food_security: 15 },
    maxPerVillage: 3,
    allows:['nunchuck'], // débloque une arme de défense
    produces : { nourriture: 2},
    requires:        { grenier: 1 },
  },
  {
    id: 'silo', label: 'Silo à grain',
    trigger:         { need: 'food_security', threshold: 62 },
    cost:            { bois: 18, argile: 18, fer: 2 },
    needContribution:{ food_security: 18 },
    maxPerVillage: 2,
    produces : { nourriture: 2},
    requires:        { ferme: 2 },
  },
  {
    id: 'plantation', label: 'Plantation',
    trigger:         { need: 'food_security', threshold: 78 },
    cost:            { bois: 10, argile: 10, fer: 10, silex: 10 },
    needContribution:{ food_security: 22 },
    maxPerVillage: 2,
    produces : { nourriture: 5, argent:1 },
    requires:        { silo: 1 },
  },

  // ═══════════════════════════════════════════════════════════
  // CULTURE — statue → temple → eglise → cathedrale
  // ═══════════════════════════════════════════════════════════
  {
    id: 'statue', label: 'Statue',
    trigger:         { need: 'culture', threshold: 18 },
    cost:            { silex: 6, argile: 3 },
    needContribution:{ culture: 8, community: 5 },
    maxPerVillage: 2,
    requires:        { place_centrale: 1 },
  },
  {
    id: 'temple', label: 'Temple',
    trigger:         { need: 'culture', threshold: 38 },
    cost:            { silex: 10, argile: 5, fer: 10 },
    needContribution:{ culture: 22, community: 8 },
    maxPerVillage: 2,
    allows:['crucifix'],
    requires:        { statue: 1 },
  },
  {
    id: 'eglise', label: 'Église',
    trigger:         { need: 'culture', threshold: 62 },
    cost:            { bois: 15, silex: 30, argile: 18, or: 10 },
    needContribution:{ culture: 24, community: 10 },
    maxPerVillage: 1
    , produces : { argent: 1},
    requires:        { temple: 1 },
  },
  {
    id: 'cathedrale', label: 'Cathédrale',
    trigger:         { need: 'culture', threshold: 86 },
    cost:            { bois: 25, silex: 25, fer: 15, or: 20 },
    needContribution:{ culture: 30, community: 15 },
    maxPerVillage: 1,
    allows:['sortilege'],
     produces : { argent: 2},
    requires:        { eglise: 1 },
  },

  // ═══════════════════════════════════════════════════════════
  // KNOWLEDGE — bibliotheque → universite
  // ═══════════════════════════════════════════════════════════
  {
    id: 'librarie', label: 'Librairie',
    trigger:         { need: 'knowledge', threshold: 15 },
    cost:            { bois: 15},
    needContribution:{ knowledge: 10, culture: 2 },
    maxPerVillage: 1,
    allows:['livre'],
    requires:        { place_centrale: 1 },
  },
  {
    id: 'ecole', label: 'Ecole',
    trigger:         { need: 'knowledge', threshold: 25 },
    cost:            { bois: 25, silex: 15, sable: 10 },
    needContribution:{ knowledge: 50, culture: 10 },
    maxPerVillage: 1,
    requires:        { mairie: 1 },
  },{
    id: 'bibliotheque', label: 'Bibliothèque',
    trigger:         { need: 'knowledge', threshold: 50 },
    cost:            { bois: 40, argile:10 },
    needContribution:{ knowledge: 25, culture: 5 },
    maxPerVillage: 1,
    allows:['sortilege'],
    requires:        { librarie: 1 },
  },
  {
    id: 'universite', label: 'Université',
    trigger:         { need: 'knowledge', threshold: 75 },
    cost:            { bois: 25, silex: 25, or: 10 },
    needContribution:{ knowledge: 50, culture: 10 },
    maxPerVillage: 1,
    requires:        {ecole:1, bibliotheque: 1 ,place_forte:1},
  },

  // ═══════════════════════════════════════════════════════════
  // COMMERCE — marche → port
  // ═══════════════════════════════════════════════════════════
  {
    id: 'marche', label: 'Marché',
    trigger:         { need: 'commerce', threshold: 15 },
    cost:            { bois: 10, sable: 10 },
    needContribution:{ commerce: 20, food_security: 8 },
    maxPerVillage: 1,
    produces : { nourriture: 1, argent:1 }, // produit de la nourriture chaque tick
    requires:        { place_centrale: 1 },
  },
  {
    id: 'port', label: 'Port',
    trigger:         { need: 'commerce', threshold: 30 },
    cost:            { bois: 20, sable: 25 },
    needContribution:{ commerce: 25, food_security: 12 },
    maxPerVillage: 1,
    allows:['bateau'],
    produces : { nourriture: 2, argent:2 },
    requires:        { marche: 1 },
  },


  {
    id: 'banque', label: 'Banque',
    trigger:         { need: 'commerce', threshold: 58 },
    cost:            {  silex: 10, fer: 10 },
    needContribution:{  commerce: 40 },
    maxPerVillage: 1,
    produces : {  argent:3 },
    requires:        { port: 1, mairie: 1 },
  },
  {
    id: 'tresor_royal', label: 'Trésor royal',
    trigger:         { need: 'commerce', threshold: 86 },
    cost:            { argile: 35, silex: 25, or: 25, fer: 12 },
    needContribution:{  commerce: 50, community: 10 },
    maxPerVillage: 1,
    produces : {  argent:5 },
    requires:        { banque: 1, chateau: 1 },
  },
  // defense : caserne → tour de guet → forteresse
  {
    id: 'caserne', label: 'Caserne',
    trigger:         { need: 'defense', threshold: 15 },
    cost:            { bois: 10, argile: 5 },
    needContribution:{ defense: 20, community: 5 },
    maxPerVillage: 1,
    allows:['epee'],
    requires:        { place_centrale: 1 },
  },
  {
    id: 'tour_de_guet', label: 'Tour de guet',
    trigger:         { need: 'defense', threshold: 50 },
    cost:            { bois: 20, fer: 5 },
    needContribution:{ defense: 25, community: 8 },
    maxPerVillage: 1,
    allows:['arc'],
    requires:        { caserne: 1 },
  },
  {
    id: 'forteresse', label: 'Forteresse',
    trigger:         { need: 'defense', threshold: 86 },
    cost:            { bois: 35, fer: 12, argile: 15, silex: 25 },
    needContribution:{ defense: 50, community: 15 },
    maxPerVillage: 1,
    allows:['canon'],
    requires:        { tour_de_guet: 1, place_forte: 1 }, 
  }
];

// Index rapide id → building
export const BUILDING_BY_ID = Object.fromEntries(BUILDINGS.map(b => [b.id, b]));

// ─────────────────────────────────────────────────────────────
// RESOURCE MAPPINGS
// ─────────────────────────────────────────────────────────────

export const STOCK_FROM_RESOURCE = {
  bois:       ['arbre', 'fougere', 'roseau', 'jonc'],
  nourriture: ['baies', 'fruits', 'champignon', 'cactus', 'aloe', 'herbes', 'nenuphar'],
  argile:     ['argile'],
  charbon:    ['charbon', 'tourbe', 'petrole'],
  silex:      ['silex', 'sable'],
  fer:        ['fer'],
  or:         ['or'],
};

export const RESOURCE_YIELD = {
  arbre:      { bois: 2 },
  fougere:    { bois: 1 },
  roseau:     { bois: 1 },
  jonc:       { bois: 1 },
  baies:      { nourriture: 2 },
  fruits:     { nourriture: 3 },
  champignon: { nourriture: 2 },
  cactus:     { nourriture: 1 },
  aloe:       { nourriture: 1 },
  herbes:     { nourriture: 1 },
  nenuphar:   { nourriture: 1 },
  argile:     { argile: 2 },
  charbon:    { charbon: 2 },
  tourbe:     { charbon: 1 },
  petrole:    { charbon: 2 },
  silex:      { silex: 3 },
  sable:      { silex: 1 },
  fer:        { fer: 1 },
  or:         { or: 1 },
};
