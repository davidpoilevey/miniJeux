// Les viseurs de la boutique
import shootCur from './cursors/shoot_16212178.png';
import lunetteCur from './cursors/target_865470.png';
import sniperCur from './cursors/crosshair_865479.png';
import braiseCur from './cursors/aim_18844558.png';
import cibleCur from './cursors/crosshair_4018979.png';
import neonCur from './cursors/target_7442262.png';
import prismeCur from './cursors/focus_14604515.png';

// La boutique de viseurs. Le Classique est gratuit (dessiné, il s'ouvre quand on court) ;
// les autres sont des images, qui grossissent un peu avec la dispersion.
// Le budget de départ paie les deux moins chers, et pas un de plus : pour les beaux, il faudra chasser.
export const CROSSHAIRS = [
  { id: 'classique', name: 'Classique', price: 0 },
  { id: 'sobre', name: 'Sobre', price: 40, src: shootCur },
  { id: 'lunette', name: 'Lunette', price: 60, src: lunetteCur },
  { id: 'sniper', name: 'Sniper', price: 150, src: sniperCur },
  { id: 'braise', name: 'Braise', price: 200, src: braiseCur },
  { id: 'cible', name: 'Cible', price: 300, src: cibleCur },
  { id: 'neon', name: 'Néon', price: 400, src: neonCur },
  { id: 'prisme', name: 'Prisme', price: 500, src: prismeCur },
];
export const CURSOR_IMAGES = Object.fromEntries(CROSSHAIRS.filter((x) => x.src).map((x) => [x.id, x.src]));
export const CROSSHAIR_SIZE = 32; // taille à l'arrêt, avec l'arme la plus précise
