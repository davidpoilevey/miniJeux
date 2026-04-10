// ─────────────────────────────────────────────────────────────
// SPRITE CONFIG — registre de tous les tilesets
// ─────────────────────────────────────────────────────────────
//
// Deux modes :
//   'grid'  → grille régulière, cols × rows
//             chaque sprite référencé par { sheet, col, row }
//
//   'atlas' → positions libres
//             chaque sprite référencé par { sheet, sprite: 'name' }
//             sprites: { name: { x, y, w, h } }
//
// Le mapping ressource→sprite est stocké dans SPRITE_MAP en bas.
// Les valeurs de mapping peuvent être éditées via WBCalibrator.
// ─────────────────────────────────────────────────────────────

import buildingImg  from '../assets/buildingTileset.png';
import building2Img from '../assets/buildTileset2.png';
import mineralImg   from '../assets/mineralTileSet.png';
import plantImg     from '../assets/plantSprite.png';
import persoImg     from '../assets/persoTileset.png';
import caserneImg     from '../assets/caserne.png';
import perso2Img    from '../assets/perso2Tileset.jpg';

export const SHEETS = {
  minerals: {
    label: 'Minéraux (grid 3×4)',
    src:   mineralImg,
    mode:  'grid',
    cols:  3,
    rows:  4,
  },
  caserne: {
    label: 'Casernes',
    src:   caserneImg,
    mode:  'grid',
    cols:  3,
    rows:  2,
    sprites:{
  "0,0": "caserne",
  "0,1": "tour_de_guet",
  "2,1": "forteresse",
    }
  },
  buildings: {
    label: 'Bâtiments ronds (grid 5×6)',
    src:   buildingImg,
    mode:  'grid',
    cols:  5,
    rows:  6,
    sprites:{
  "0,3": "temple",
  "2,3": "eglise",
  "4,3": "cathedrale",
  "0,4": "grenier",
  "1,4": "ferme",
  "3,4": "silo",
  "4,4": "plantation",
  "0,5": "marche",
  "1,2": "port",
  "2,5": "banque",
  "4,5": "tresor_royal"
}
  },
  buildings2: {
    label: 'Bâtiments médiévaux (atlas)',
    src:   building2Img,
    mode:  'atlas',
    sprites:{
  "place_centrale": {
    "x": 7,
    "y": 16,
    "w": 56,
    "h": 81
  },
  "hutte": {
    "x": 10,
    "y": 264,
    "w": 71,
    "h": 77
  },
  "maison": {
    "x": 85,
    "y": 265,
    "w": 67,
    "h": 78
  },
  "villa": {
    "x": 156,
    "y": 265,
    "w": 75,
    "h": 82
  },
  "immeuble": {
    "x": 376,
    "y": 6,
    "w": 90,
    "h": 94
  },
  "mairie": {
    "x": 276,
    "y": 353,
    "w": 101,
    "h": 103
  },
  "place_forte": {
    "x": 387,
    "y": 130,
    "w": 100,
    "h": 89
  },
  "chateau": {
    "x": 277,
    "y": 141,
    "w": 93,
    "h": 105
  },
  "statue": {
    "x": 391,
    "y": 342,
    "w": 28,
    "h": 41
  },
  "librarie": {
    "x": 5,
    "y": 357,
    "w": 71,
    "h": 88
  },
  "ecole": {
    "x": 216,
    "y": 18,
    "w": 63,
    "h": 78
  },
  "universite": {
    "x": 163,
    "y": 351,
    "w": 94,
    "h": 122
  },
  "bibliotheque": {
    "x": 7,
    "y": 121,
    "w": 98,
    "h": 109
  }
},  // à remplir via WBCalibrator
  },
  plants: {
    label: 'Plantes (atlas)',
    src:   plantImg,
    mode:  'atlas',
    sprites: {
  "cactus": {
    "x": 206,
    "y": 203,
    "w": 37,
    "h": 37
  },
  "aloe": {
    "x": 344,
    "y": 200,
    "w": 25,
    "h": 30
  },
  "edelweiss": {
    "x": 157,
    "y": 72,
    "w": 29,
    "h": 23
  },
  "champignon": {
    "x": 28,
    "y": 228,
    "w": 33,
    "h": 24
  },
  "baies": {
    "x": 57,
    "y": 66,
    "w": 33,
    "h": 30
  },
  "herbes": {
    "x": 223,
    "y": 34,
    "w": 24,
    "h": 25
  },
  "fleurs": {
    "x": 158,
    "y": 32,
    "w": 28,
    "h": 29
  },
  "fruits": {
    "x": 251,
    "y": 68,
    "w": 33,
    "h": 28
  },
  "arbre": {
    "x": 249,
    "y": 322,
    "w": 37,
    "h": 65
  },
  "fougere": {
    "x": 146,
    "y": 345,
    "w": 32,
    "h": 32
  },
  "jonc": {
    "x": 136,
    "y": 386,
    "w": 39,
    "h": 62
  },
  "nenuphar": {
    "x": 131,
    "y": 224,
    "w": 41,
    "h": 23
  },
  "mousse": {
    "x": 136,
    "y": 287,
    "w": 41,
    "h": 22
  },
  "lichen": {
    "x": 0,
    "y": 440,
    "w": 65,
    "h": 31
  },
  "roseau": {
    "x": 280,
    "y": 387,
    "w": 37,
    "h": 60
  }
}
  },
  perso: {
    label: 'Personnages pixel (grid 5×4)',
    src:   persoImg,
    mode:  'grid',
    cols:  5,
    rows:  4,
    sprites:{
  "2,1": "chief",
  "0,0": "human1",
  "0,1": "human2",
  "1,0": "human3",
  "0,2": "human4",
  "1,2": "human5",
  "2,0": "human6",
  "2,2": "human7",
  "3,0": "human8",
  "3,1": "human9",
  "3,2": "human10",
  "4,0": "human11",
  "4,1": "human12",
  "4,2": "human13",
  
}
  },
  perso2: {
    label: 'Personnages RPG (grid 10×6)',
    src:   perso2Img,
    mode:  'grid',
    cols:  10,
    rows:  6,
  },
};

// ─────────────────────────────────────────────────────────────
// SPRITE MAP — type de ressource/entité → référence sprite
//
// Ces valeurs sont des hypothèses initiales basées sur
// l'aspect visuel des tilesets. À affiner via WBCalibrator.
// ─────────────────────────────────────────────────────────────

export const SPRITE_MAP = {
  // ── Minéraux (mineralTileSet grid 3×4) ───────────────────
  // Row 0 : mousse-cube | caisse bois | pierre grise
  // Row 1 : glace       | métal       | cristal
  // Row 2 : charbon     | lave        | argile brun
  // Row 3 : sable       | neige       | tourbe verte
  silex:   { sheet: 'minerals', col: 2, row: 0 },
  fer:     { sheet: 'minerals', col: 1, row: 1 },
  cristal: { sheet: 'minerals', col: 2, row: 1 },
  or:      { sheet: 'minerals', col: 0, row: 1 },  // glace/brillant — à recalibrer
  charbon: { sheet: 'minerals', col: 0, row: 2 },
  petrole: { sheet: 'minerals', col: 1, row: 2 },
  argile:  { sheet: 'minerals', col: 2, row: 2 },
  sable:   { sheet: 'minerals', col: 0, row: 3 },
  tourbe:  { sheet: 'minerals', col: 2, row: 3 },

  // ── Plantes (atlas — à calibrer) ─────────────────────────
  arbre:      { sheet: 'plants', sprite: 'arbre' },
  champignon: { sheet: 'plants', sprite: 'champignon' },
  fougere:    { sheet: 'plants', sprite: 'fougere' },
  baies:      { sheet: 'plants', sprite: 'baies' },
  herbes:     { sheet: 'plants', sprite: 'herbes' },
  fleurs:     { sheet: 'plants', sprite: 'fleurs' },
  fruits:     { sheet: 'plants', sprite: 'fruits' },
  cactus:     { sheet: 'plants', sprite: 'cactus' },
  aloe:       { sheet: 'plants', sprite: 'aloe' },
  jonc:       { sheet: 'plants', sprite: 'jonc' },
  nenuphar:   { sheet: 'plants', sprite: 'nenuphar' },
  mousse:     { sheet: 'plants', sprite: 'mousse' },
  edelweiss:  { sheet: 'plants', sprite: 'edelweiss' },
  lichen:     { sheet: 'plants', sprite: 'lichen' },
  roseau:     { sheet: 'plants', sprite: 'roseau' },

  // ── Bâtiments (buildings2 atlas) ──────────────────────────
  hutte:          { sheet: 'buildings2', sprite: 'hutte' },
  maison:         { sheet: 'buildings2', sprite: 'maison' },
  villa:          { sheet: 'buildings2', sprite: 'villa' },
  immeuble:       { sheet: 'buildings2', sprite: 'immeuble' },
  place_centrale: { sheet: 'buildings2', sprite: 'place_centrale' },
  mairie:         { sheet: 'buildings2', sprite: 'mairie' },
  place_forte:    { sheet: 'buildings2', sprite: 'place_forte' },
  chateau:        { sheet: 'buildings2', sprite: 'chateau' },
  statue:         { sheet: 'buildings2', sprite: 'statue' },
  librarie:       { sheet: 'buildings2', sprite: 'librarie' },
  ecole:          { sheet: 'buildings2', sprite: 'ecole' },
  bibliotheque:   { sheet: 'buildings2', sprite: 'bibliotheque' },
  universite:     { sheet: 'buildings2', sprite: 'universite' },

  // ── Bâtiments (buildings grid 5×6) ────────────────────────
  temple:         { sheet: 'buildings', col: 0, row: 3 },
  eglise:         { sheet: 'buildings', col: 2, row: 3 },
  cathedrale:     { sheet: 'buildings', col: 4, row: 3 },
  grenier:        { sheet: 'buildings', col: 0, row: 4 },
  ferme:          { sheet: 'buildings', col: 1, row: 4 },
  silo:           { sheet: 'buildings', col: 3, row: 4 },
  plantation:     { sheet: 'buildings', col: 4, row: 4 },
  marche:         { sheet: 'buildings', col: 0, row: 5 },
  port:           { sheet: 'buildings', col: 1, row: 2 },
  banque:         { sheet: 'buildings', col: 2, row: 5 },
  tresor_royal:   { sheet: 'buildings', col: 4, row: 5 },

  // ── Bâtiments militaires (caserne grid 3×2) ───────────────
  caserne:        { sheet: 'caserne', col: 0, row: 0 },
  tour_de_guet:   { sheet: 'caserne', col: 0, row: 1 },
  forteresse:     { sheet: 'caserne', col: 2, row: 1 },

  // ── Personnages ───────────────────────────────────────────
  human1:  { sheet: 'perso', col: 0, row: 0 },
  human2:  { sheet: 'perso', col: 0, row: 1 },
  human3:  { sheet: 'perso', col: 1, row: 0 },
  human4:  { sheet: 'perso', col: 0, row: 2 },
  human5:  { sheet: 'perso', col: 1, row: 2 },
  human6:  { sheet: 'perso', col: 2, row: 0 },
  human7:  { sheet: 'perso', col: 2, row: 2 },
  human8:  { sheet: 'perso', col: 3, row: 0 },
  human9:  { sheet: 'perso', col: 3, row: 1 },
  human10: { sheet: 'perso', col: 3, row: 2 },
  human11: { sheet: 'perso', col: 4, row: 0 },
  human12: { sheet: 'perso', col: 4, row: 1 },
  human13: { sheet: 'perso', col: 4, row: 2 },
  chief:   { sheet: 'perso', col: 2, row: 1 },
};
