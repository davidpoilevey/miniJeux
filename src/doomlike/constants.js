// Les réglages : écran, caméra, joueur, et tout ce qui se règle au feeling

export const W = 640; // résolution interne, agrandie à l'affichage : de bons gros pixels, façon 1993
export const H = 400;
export const PLANE = 0.66; // demi-largeur du champ de vision (≈ 66°)
export const F = W / (2 * PLANE); // focale : un mur à distance 1 fait F pixels de haut
export const MOUSE_SPEED = 0.0025;
export const TURN_SPEED = 2.5; // rad/s, aux flèches
export const WALK_SPEED = 3; // cases/s
export const PLAYER_RADIUS = 0.2;
export const MONSTER_RADIUS = 0.25;
export const PLAYER_HP = 100;
export const REACH = 0.8; // un monstre frappe à cette distance
export const WINDUP_MS = 400; // il arme son coup avant de frapper
export const SIGHT = 8; // un monstre se réveille si tu passes à 8 pas ou moins...
export const HEARING = 14; // ... ou si tu tires à 14 pas ou moins
export const HIT_FLASH_MS = 150;
export const DYING_MS = 350;
export const MAX_PITCH = 180; // regarder en haut / en bas : on décale l'horizon d'autant de pixels (au plus)
export const HEADSHOT = 4; // multiplicateur de dégâts dans la tête
export const MOVE_SPREAD = 0.04; // tirer en courant, c'est arroser : il faut s'arrêter pour être précis
export const HITMARK_MS = 180;
export const LOOT_MS = 1200; // le « +15 $ » qui s'affiche à chaque monstre tué
export const HEADSHOT_BONUS = 1.5; // un monstre tué d'un headshot rapporte 50 % de plus

export const HUD = { color: '#c8b88a', fontFamily: 'monospace' }; // le style des textes de l'interface
