// L'arme tenue en main, avec son recul et sa flamme
import { H, W } from './constants';
import { MUZZLE_AT, WEAPONS } from './weapons';

export const poly = (c, color, pts) => {
  c.fillStyle = color;
  c.beginPath();
  pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.closePath();
  c.fill();
};

export const disc = (c, color, x, y, r) => {
  c.fillStyle = color;
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fill();
};

// chaque arme renvoie la position de sa (ou ses) bouche(s) pour la flamme
export const drawPistol = (c, x, y) => {
  poly(c, '#2a2a2e', [[x - 24, y - 60], [x - 15, y - 150], [x + 15, y - 150], [x + 24, y - 60]]); // culasse
  poly(c, '#4a4a52', [[x - 9, y - 62], [x - 6, y - 148], [x, y - 148], [x - 2, y - 62]]); // reflet
  c.fillStyle = '#111';
  c.fillRect(x - 3, y - 158, 6, 9); // guidon
  disc(c, '#000', x, y - 140, 5);
  poly(c, '#b07a55', [[x - 60, y], [x - 34, y - 80], [x + 34, y - 80], [x + 60, y]]); // le poing
  c.strokeStyle = '#7a4f33';
  c.lineWidth = 2;
  [-16, 0, 16].forEach((dx) => {
    c.beginPath();
    c.moveTo(x + dx, y - 78);
    c.lineTo(x + dx * 1.4, y - 30);
    c.stroke();
  });
  return [[x, y - 150]];
};

// une arme de profil (image), tenue de façon à ce que le bout du canon tombe en (ax, ay)
export const drawHeld = (c, { img, crop }, hand, ax, ay) => {
  const s = hand.width / crop.w;
  const w = crop.w * s;
  const h = crop.h * s;
  const f = hand.flip ? -1 : 1;
  // le bout du canon, vu depuis le centre de l'image, une fois retournée et inclinée
  const lx = f * (hand.muzzle[0] - crop.x - crop.w / 2) * s;
  const ly = (hand.muzzle[1] - crop.y - crop.h / 2) * s;
  const cos = Math.cos(hand.rot);
  const sin = Math.sin(hand.rot);
  c.save();
  c.translate(ax - (lx * cos - ly * sin), ay - (lx * sin + ly * cos));
  c.rotate(hand.rot);
  c.scale(f, 1);
  c.drawImage(img, crop.x, crop.y, crop.w, crop.h, -w / 2, -h / 2, w, h);
  c.restore();
  return [[ax, ay]];
};

export const drawWeapon = (c, g, weaponSprites, t) => {
  const w = WEAPONS[g.weapon];
  const since = t - g.shotAt;
  const recoil = Math.max(0, 1 - since / 160) * w.kick;
  const bobX = Math.sin(g.bob) * 10;
  const bobY = Math.abs(Math.cos(g.bob)) * 8;
  let muzzles;
  if (!w.img) muzzles = drawPistol(c, W / 2 + bobX, H + 8 + bobY + recoil);
  else if (weaponSprites[w.img]) {
    muzzles = drawHeld(c, weaponSprites[w.img], w.hand, MUZZLE_AT[0] + bobX + recoil / 2, MUZZLE_AT[1] + bobY + recoil);
  } else return;
  if (since < 70) {
    const r = 18 + 30 * (1 - since / 70) * w.flash;
    muzzles.forEach(([fx, fy]) => {
      const glow = c.createRadialGradient(fx, fy, 0, fx, fy, r);
      glow.addColorStop(0, 'rgba(255,255,220,1)');
      glow.addColorStop(0.4, 'rgba(255,180,60,0.9)');
      glow.addColorStop(1, 'rgba(255,80,0,0)');
      c.fillStyle = glow;
      c.fillRect(fx - r, fy - r, 2 * r, 2 * r);
    });
    c.fillStyle = 'rgba(255,210,140,0.08)'; // le coup de feu éclaire la pièce
    c.fillRect(0, 0, W, H);
  }
};
