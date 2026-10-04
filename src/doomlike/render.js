// Le rendu du monde (murs, monstres, objets), puis l'arme et le HUD par-dessus
import { gifFrame } from '../dungeon/gifSprite';
import { DYING_MS, F, H, HIT_FLASH_MS, PLANE, W } from './constants';
import { drawHud } from './hud';
import { castRay } from './map';
import { MONSTER_TYPES } from './monsters';
import { drawWeapon } from './weaponView';
import { BLAST_MS, PICKUP_SIZE, WEAPONS } from './weapons';

export const shade = (d) => Math.max(0.08, Math.min(1, 1.1 - d * 0.09));
export const SIDE_LIGHT = 0.75; // une face sur deux un peu plus sombre : les angles se lisent mieux

const zBuffer = new Float32Array(W); // distance du mur, colonne par colonne : les monstres se cachent derrière
// La ligne d'horizon à l'écran. Regarder en haut, dans un raycaster, c'est juste la faire descendre
// (la vieille triche de Duke Nukem 3D) : tout le monde se dessine par rapport à elle.
let horizon = H / 2;

export const drawBackground = (c) => {
  const ceil = c.createLinearGradient(0, 0, 0, horizon);
  ceil.addColorStop(0, '#2a241c');
  ceil.addColorStop(1, '#050403');
  c.fillStyle = ceil;
  c.fillRect(0, 0, W, horizon);
  const floor = c.createLinearGradient(0, horizon, 0, H);
  floor.addColorStop(0, '#050403');
  floor.addColorStop(1, '#4a4034');
  c.fillStyle = floor;
  c.fillRect(0, horizon, W, H - horizon);
};

// un rayon par colonne d'écran, une tranche de texture d'un pixel de large par rayon
export const drawWalls = (c, p, tex) => {
  const dirX = Math.cos(p.a);
  const dirY = Math.sin(p.a);
  const plX = -dirY * PLANE;
  const plY = dirX * PLANE;
  for (let x = 0; x < W; x++) {
    const cam = (2 * (x + 0.5)) / W - 1;
    const hit = castRay(p.x, p.y, dirX + plX * cam, dirY + plY * cam);
    const d = Math.max(hit.dist, 0.05);
    zBuffer[x] = d;
    const h = F / d;
    const top = horizon - h / 2;
    if (tex) {
      let u = Math.floor(hit.wallX * tex.width);
      if (hit.flip) u = tex.width - 1 - u;
      c.drawImage(tex, u, 0, 1, tex.height, x, top, 1, h);
    } else {
      c.fillStyle = '#6b6156';
      c.fillRect(x, top, 1, h);
    }
    c.fillStyle = `rgba(0,0,0,${1 - shade(d) * (hit.side ? SIDE_LIGHT : 1)})`;
    c.fillRect(x, top, 1, h);
  }
};

// une image debout dans le monde, en ne dessinant que les colonnes devant les murs
export const drawClipped = (c, img, crop, left, top, w, h, depth) => {
  const x0 = Math.max(0, Math.floor(left));
  const x1 = Math.min(W, Math.ceil(left + w));
  let run = null;
  for (let x = x0; x <= x1; x++) {
    const visible = x < x1 && depth < zBuffer[x];
    if (visible && run === null) run = x;
    if (!visible && run !== null) {
      const su = crop.x + ((run - left) / w) * crop.w;
      const sw = ((x - run) / w) * crop.w;
      c.drawImage(img, su, crop.y, sw, crop.h, run, top, x - run, h);
      run = null;
    }
  }
};

export const drawMonster = (c, sprite, m, sx, depth, t) => {
  if (!sprite) return;
  const type = MONSTER_TYPES[m.type];
  const { crop } = sprite;
  const h = (type.height * F) / depth;
  const w = (h * crop.w) / crop.h;
  const bottom = horizon + ((0.5 - type.lift) * F) / depth;
  const dying = m.deadAt ? Math.min(1, (t - m.deadAt) / DYING_MS) : 0;
  const shownH = h * (1 - dying); // il s'effondre
  const hurt = dying || t - m.hitAt < HIT_FLASH_MS;
  c.filter = hurt ? 'sepia(1) saturate(8) hue-rotate(-40deg) brightness(1.2)' : `brightness(${shade(depth)})`;
  drawClipped(c, gifFrame(sprite, t + m.phase), crop, sx - w / 2, bottom - shownH, w, shownH, depth);
  c.filter = 'none';
};

// une boule de lumière (roquette, explosion), à la hauteur h (0 = hauteur des yeux)
export const drawGlow = (c, sx, depth, h, radius, alpha) => {
  const col = Math.round(sx);
  if (col < 0 || col >= W || depth > zBuffer[col] + radius) return; // derrière un mur
  const r = (radius * F) / depth;
  const sy = horizon - (h * F) / depth;
  const glow = c.createRadialGradient(sx, sy, 0, sx, sy, r);
  glow.addColorStop(0, `rgba(255,255,220,${alpha})`);
  glow.addColorStop(0.35, `rgba(255,170,50,${0.9 * alpha})`);
  glow.addColorStop(1, 'rgba(255,60,0,0)');
  c.fillStyle = glow;
  c.fillRect(sx - r, sy - r, 2 * r, 2 * r);
};

// une arme posée au sol : elle flotte et brille, on a envie de marcher dessus
export const drawPickup = (c, sprite, k, sx, depth, t) => {
  if (!sprite) return;
  const { img, crop } = sprite;
  const scale = (PICKUP_SIZE * F) / depth / Math.max(crop.w, crop.h);
  const w = crop.w * scale;
  const h = crop.h * scale;
  const lift = 0.1 + 0.05 * Math.sin(t / 250 + k.x);
  const bottom = horizon + ((0.5 - lift) * F) / depth;
  drawGlow(c, sx, depth, lift - 0.5 + PICKUP_SIZE / 2, PICKUP_SIZE * 0.7, 0.25);
  c.filter = `brightness(${Math.min(1.2, shade(depth) * 1.4)})`;
  drawClipped(c, img, crop, sx - w / 2, bottom - h, w, h, depth);
  c.filter = 'none';
};

// tout ce qui se tient debout dans le monde, du plus loin au plus proche
export const drawBillboards = (c, g, { sprites, weaponSprites }, t) => {
  const p = g.player;
  const dirX = Math.cos(p.a);
  const dirY = Math.sin(p.a);
  const items = [
    ...g.monsters.map((o) => ({ kind: 'monster', o })),
    ...g.pickups.map((o) => ({ kind: 'pickup', o })),
    ...g.rockets.map((o) => ({ kind: 'rocket', o })),
    ...g.explosions.map((o) => ({ kind: 'blast', o })),
  ]
    .map((it) => {
      const rx = it.o.x - p.x;
      const ry = it.o.y - p.y;
      return { ...it, depth: rx * dirX + ry * dirY, lat: ry * dirX - rx * dirY };
    })
    .filter((it) => it.depth > 0.15)
    .sort((a, b) => b.depth - a.depth);
  for (const { kind, o, depth, lat } of items) {
    const sx = W / 2 + (lat * F) / depth;
    if (kind === 'monster') drawMonster(c, sprites[o.type], o, sx, depth, t);
    else if (kind === 'pickup') drawPickup(c, weaponSprites[WEAPONS[o.weapon].img], o, sx, depth, t);
    else if (kind === 'rocket') drawGlow(c, sx, depth, -0.05, 0.12, 1);
    else {
      const k = Math.min(1, Math.max(0, (t - o.at) / BLAST_MS));
      drawGlow(c, sx, depth, -0.1, 0.3 + 1.1 * k, 1 - k);
    }
  }
};

export const render = (c, g, assets, t) => {
  horizon = H / 2 + g.player.pitch;
  drawBackground(c);
  drawWalls(c, g.player, assets.tex);
  drawBillboards(c, g, assets, t);
  drawWeapon(c, g, assets.weaponSprites, t);
  drawHud(c, g, assets.cursors, t);
};
