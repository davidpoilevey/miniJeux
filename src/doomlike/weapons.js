// L'arsenal : réglages des armes, roquettes et armes à ramasser
import uziImg from './uzi.png';
import pompeImg from './pompe.png';
import lanceroqImg from './lanceroq.png';
import { H, W } from './constants';

// spread : dispersion de chaque plomb (radians), kick : recul visuel (px), knockback : recul du monstre par plomb,
// flash : taille de la flamme. img : l'arme se ramasse dans la carte (seul le pistolet est là dès le départ).
// hand : comment on la tient à l'écran. L'image est de profil : flip la retourne, rot l'incline (radians),
// width = largeur affichée, muzzle = bout du canon (en px dans l'image d'origine), calé juste sous le viseur.
export const WEAPONS = [
  { name: 'Pistolet', pellets: 1, spread: 0.003, damage: 2, cooldown: 350, kick: 10, flash: 1, sound: 'punch' },
  { name: 'Uzi', pellets: 1, spread: 0.05, damage: 1, cooldown: 90, kick: 5, flash: 0.7, sound: 'punch', volume: 0.35,
    img: 'uzi', hand: { flip: true, rot: 0.35, width: 170, muzzle: [530, 87] } },
  { name: 'Fusil à pompe', pellets: 8, spread: 0.11, damage: 1, cooldown: 900, kick: 28, knockback: 0.08, flash: 1.6, sound: 'explosion',
    img: 'pompe', hand: { flip: true, rot: 0, width: 220, muzzle: [300, 25] } },
  { name: 'Lance-roquettes', rocket: true, cooldown: 1100, kick: 30, flash: 1.3, sound: 'coupVide',
    img: 'lanceroq', hand: { flip: false, rot: 0, width: 280, muzzle: [140, 35] } },
];
export const WEAPON_IMAGES = { uzi: uziImg, pompe: pompeImg, lanceroq: lanceroqImg };
export const MUZZLE_AT = [W / 2 + 30, H / 2 + 70]; // où se trouve le bout du canon à l'écran
export const PICKUP_SIZE = 0.45; // taille d'une arme posée au sol (un mur = 1)
export const PICKUP_MIN_STEPS = 6; // pas d'arme trop près du départ : il faut aller la chercher
export const ROCKET_SPEED = 9; // cases/s
export const ROCKET_DAMAGE = 14; // au centre de l'explosion, moins en s'éloignant
export const SPLASH = 1.6; // rayon du souffle
export const BLAST_MS = 450;
