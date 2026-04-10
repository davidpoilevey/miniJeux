import playerImg from './playerNoir.png';
import coussinImg from './coussin.png';
import croqsImg from './croqs.png';
import carreauImg from './carreau.jpg';
import pancarteImg from './pancarte.png';
import interiorImg from './interior.png';
import avatarCopain from './copain.png';
import radioImg from './radio.png';
import sevImg from './sev.jpg';
import rodImg from './rod.jpg';
import ratImg from './rat.png';
import coffreImg from './coffre.png';
import saleMatouImg from './saleMatou.png';
import ezioImg from './ezio.png';
import gipsyImg from './gipsy.png';
import griffeImg from './griffes.png';
import robotImg from './robot.png';
import vomiImg from './vomi.png';
import exteriorImg from './exterior.png';
import frigoImg from './frigo.png';
import tileListImg from './Tilelist3.png';
import furnitureImg from './furniture.png';
import megaphoneImg from './megaphone.png';
import PQImg from './PQ.png';
import herbeImg from '../../civ/images/plain.png';
import murDechirableImg from '../../ff1/images/fondBois.jpg';
import murImg from '../../civ/images/mur.jpg';
import pnjImg from '../../bitLife/images/medecin.png';
import avatarPapa from '../../bitLife/images/M/adulte/avatar4.png';
import avatarMaman from '../../bitLife/images/F/jeune/avatar12.png';
import porteImg from '../../ff1/images/porte.png';
import feuImg from '../../rpg/images/feu.png';
import avatar1 from '../../bitLife/images/M/adulte/avatar1.png';
import avatar2 from '../../bitLife/images/M/adulte/avatar2.png';
import avatar3 from '../../bitLife/images/F/adulte/avatar3.png';

import explosionImg from '../../shootemup/images/explosion.gif';
import mystere1 from '../../civ/images/mineDor.png';

import rivièreImg from '../../civ/images/water.png';
import { TILE_SIZE } from '../data/maps';
export const CATRPGSources = {
  player : playerImg,
  vieuxSage:avatar1,
   explosion : explosionImg,
  mec:avatar2,
  gipsy:gipsyImg,
  feu:feuImg,
  coussin:coussinImg,
  pancarte:pancarteImg,
  robot:robotImg,
  coffre:coffreImg,
  PQ:PQImg,
  griffe:griffeImg,
  frigo:frigoImg,
  megaphone:megaphoneImg,
  saleMatou:saleMatouImg,
  ezio:ezioImg,
  nana:avatar3,
  exterior:exteriorImg,
  interior:interiorImg,
  tileList:tileListImg,
  furniture:furnitureImg,
  0:  carreauImg,
  100:  carreauImg,
  1:murImg,
  2:porteImg,
  //3: carrelage cuisine
  4:herbeImg,
  5:rivièreImg,
  boiteMystere:mystere1,
  9:mystere1,
  10:pnjImg,
  papa:avatarPapa,
  vomi:vomiImg,
  dechirable:murDechirableImg,
  copain:avatarCopain,
  rat:ratImg,
  radio:radioImg,
  maman:sevImg,
  rod:rodImg,
  croqs:croqsImg
}
export const CATRPGSpeakers = {

  system: '⚙️',
  info: '🫧',
  robot:'🤖',
  ouhla:'🧯',
  chat:'🐈‍⬛',
  insecte:'🪰',
  papa:'🧑‍💻',
  maman:'🧑',
  interdit:'⛔',
  default: '❓',
}



export const TilesetFrames = {
  // === Interior.png ===
  101: {
    imageKey: 'interior',     // correspondra à ta clé dans usePreloadedImages
    tileX: 0,
    tileY: 4.4,        
    ratio:1.5,
    tileWidth:2.5,
    tileHeight:2,         // la grande table ronde
    label: 'table_ronde'
  },
  102: {
    imageKey: 'interior',
    tileX: 3.4,
    tileY: 5.3, 
    tileWidth:1.8,
    tileHeight:1.5, 
    label: 'table_basse'
  },
  'vase': {
    imageKey: 'interior',
    tileX: 2.4,
    tileY: 11.5,    
    tileWidth:0.8,
    tileHeight:1,
    ratio:1.2,
    label: 'vase'
  },
  'alcool': {
    imageKey: 'interior',
    tileX: 5.5,
    tileY: 8.5,    
    tileWidth:0.5,
    tileHeight:0.5,ratio:3,
    label: 'alcool'
  },
  'potion': {
    imageKey: 'interior',
    tileX: 5.4,
    tileY: 8,    
    tileWidth:0.5,
    tileHeight:0.5,ratio:2,
    label: 'potion'
  },
  'potionDegueu': {
    imageKey: 'interior',
    tileX: 5.4,
    tileY: 8,    
    tileWidth:0.5,
    tileHeight:0.5,ratio:2,
    label: 'potionDegueu'
  },
  104: {
    imageKey: 'interior',
    tileX: 1.4,
    tileY: 0,    
    tileWidth:1,
    tileHeight:1.5,
    label: 'lit'
  },
  coffret: {
    imageKey: 'interior',
    tileX: 3.5,
    tileY: 0,    
    tileWidth:1,
    tileHeight:1,
    label: 'coffret'
  },
  armoire:{
     imageKey: 'interior',
    tileX: 0,
    tileY: 2.5,    
    tileWidth:2,
    tileHeight:2,
    label: 'armoirePleine'
  },
  tableCarre:{
     imageKey: 'interior',
    tileX: 3.5,
    tileY: 1,    
    tileWidth:1.5,
    tileHeight:1.5,
    label: 'tableCarre'
  },
  armoireVide:{
     imageKey: 'interior',
    tileX: 1.8,
    tileY: 2.5,    
    tileWidth:1.7,
    tileHeight:2,
    label: 'armoireVide'
  },
  110: {
    imageKey: 'interior',
    tileX: 0,
    tileY: 0,    
    tileWidth:1.5,
    tileHeight:2,
    label: 'escalier'
  },

  // === Exterior.png ===
  arbre: {
    imageKey: 'exterior',
    tileX: 5,
    tileY: 6,
    tileWidth:1.8,
    tileHeight:2,
    label: 'arbre'
  },
  buisson: {
    imageKey: 'exterior',
    tileX: 0,
    tileY: 7,
    tileWidth:1.5,
    tileHeight:1.5,
    label: 'arbre'
  },
  
  souche: {
    imageKey: 'exterior',
    tileX: 3,
    tileY: 18.5,
    label: 'arbre'
  },
  maison: {
    imageKey: 'exterior',
    tileX: 0,
    tileY: 0,
    tileWidth:5,
    tileHeight:5,
    label: 'maison'
  },
  champignon: {
    imageKey: 'exterior',
    tileX: 2,
    tileY: 18.5,
    label: 'arbre'
  },
  pommier: {
    imageKey: 'exterior',
    tileX: 4,
    tileY: 10.5,
    tileWidth:1.8,
    tileHeight:2,
    label: 'fleur_bleue'
  },
  trou: {
    imageKey: 'exterior',
    tileX: 1.5,
    tileY: 7,
    label: 'fleur_bleue'
  },
  rocher: {
    imageKey: 'exterior',
    tileX: 1.8,
    tileY: 22.6,
    label: 'fleur_bleue'
  },
  caillou: {
    imageKey: 'exterior',
    tileX: 1.5,
    tileY: 13.5,
    label: 'fleur_bleue'
  },
// === Furniture.png ===
wc:{
  imageKey:'furniture',
  tileX:0,
  tileY:9,
  label:'wc'
},
3:{
  imageKey:'furniture',
  tileX:0,
  tileY:2,
  label:'carreau'
},
baignoire:{
  imageKey:'furniture',
  tileX:4,
  tileY:10,
    tileWidth:1,
    tileHeight:2,
  label:'baignoire'
},
baignoirePleine:{
  imageKey:'furniture',
  tileX:4,
  tileY:10,
    tileWidth:1,
    tileHeight:2,
  label:'baignoire'
},
cuisiniere:{
  imageKey:'furniture',
  tileX:3,
  tileY:6,
    tileHeight:1.5,
  label:'cuisiniere'
},
frigo2:{
  imageKey:'furniture',
  tileX:4,
  tileY:6,
    tileHeight:2,
  label:'frigo2'
},
chaiseFace:{
  imageKey:'furniture',
  tileX:12,
  tileY:6,
  label:'chaiseFace'
},
chaiseDroite:{
  imageKey:'furniture',
  tileX:13,
  tileY:6,
  label:'chaiseDroite'
},
chaiseGauche:{
  imageKey:'furniture',
  tileX:13,
  tileY:7,
  label:'chaiseGauche'
},
canape:{
  imageKey:'furniture',
  tileX:15,
  tileY:10,
    tileHeight:2,
  label:'canape'
},
tele:{
  imageKey:'furniture',
  tileX:12,
  tileY:8,
    tileWidth:2,
  label:'tele'
},
fauteuil:{
  imageKey:'furniture',
  tileX:13,
  tileY:10,
    tileWidth:2,
    tileHeight:2,
  label:'fauteuil'
},
fauteuilBureau:{
  imageKey:'furniture',
  tileX:1,
  tileY:5,
    tileHeight:2,
  label:'fauteuilBureau'
},
lavabo:{
  imageKey:'furniture',
  tileX:3,
  tileY:8,
    tileHeight:2,
  label:'lavaboVide'
},
lavaboPlein:{
  imageKey:'furniture',
  tileX:4,
  tileY:8,
    tileHeight:2,
  label:'lavaboPlein'
},
  // === tileList3.png ===
  301: {
    imageKey: 'tileList',
    tileX: 4,
    tileY: 2,   
    tileWidth:8,
    tileHeight:10, 
    ratio:0.5,
    label: 'lit_bleu'
  },
  302: {
    imageKey: 'tileList',
    tileX: 15,
    tileY: 1,   
    tileWidth:18,
    tileHeight:12, 
    ratio:0.5,
    label: 'lit_beige'
  }
};

// utile pour automatiser
export const getFrameById = (tileId) => {
  const frame = TilesetFrames[tileId];
  if (!frame) return null;
  return {
    ...frame,
    crop: {
      x: frame.tileX * TILE_SIZE,
      y: frame.tileY * TILE_SIZE,
      width:  (frame.tileWidth||1) *TILE_SIZE,
      height: (frame.tileHeight||1) *TILE_SIZE
    }
  };
};

