import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Stage, Layer, Shape } from 'react-konva';
import { soundManager, soundMap } from '../rpg/sons/SoundManager';
import texturePierre from './texturepierre.png';
import coffreImg from './coffre.png';
import potionImg from './potion.png';
import portalImg from './portal.png';
import solImg from '../civ/images/mur.jpg';
import plafondImg from '../civ/images/fondPanel.png';
import slashGif from './swordSlash.gif';
import diableNoirGif from './diableNoir.gif';
import harpieGif from './harpie.gif';
import lezardGif from './lezard.gif';
import squeletteGif from './squelette.gif';
import diableRougeGif from './diableRouge.gif';
import spectreGif from './spectre.gif';
import oeilVolantGif from './oeilVolant.gif';
import { gifFrame, useGifSprites } from './gifSprite';
import { GameOver } from '../ChuckNorrisFact';

// '#' mur, '.' sol, 'S' départ, 'Z' sortie vers la carte suivante, 'X' coffre, '1'..'4' monstre (le chiffre = ses points de vie)
const MAP_3 = [
  '################',
  '#S.....#......4#',
  '#.####.#.#####.#',
  '#.#.X..#.#.3.#.#',
  '#.#.####.#.#.#.#',
  '#.#1..X..#.#.2.#',
  '#.######.#.###.#',
  '#.1....#.#..4#.#',
  '######.#.###.#1#',
  '#1.2...#...#.#.#',
  '#.########.#.#.#',
  '#.#......#.#...#',
  '#.#3####.#.#####',
  '#...#....#.....#',
  '#####4####3###X#',
  '##############Z#',
];
const MAP_1 = [
  '####################',
  '#S.....#...X....22.#',
  '#......#...3..111..#',
  '#...11.#.#########.#',
  '#....1X#.#...1...#.#',
  '###.####.#.......#.#',
  '#...#....#.#####.#.#',
  '#.....####.#...#.#.#',
  '#.1.#......#.X.#.#.#',
  '#.###.######.###.#.#',
  '#...#.#........#.#.#',
  '#...#.#.######.#.#.#',
  '#...#.#.#....#.#.#.#',
  '#####.#.#..2.#.#.#.#',
  '#.....#.#....#.#.#.#',
  '#.X.2...#.####.#.#.#',
  '#.......#......#.X.#',
  '#.#######.######.###',
  '#.........#........#',
  '#..4......#...3...Z#',
  '####################',
];
const MAP_2 = [
  '####################',
  '#S.....#.4...X....4#',
  '#......#.....2.....#',
  '#..1...#.#########.#',
  '#......#.........#.#',
  '######.##..#####.#.#',
  '#...#......#...#.#.#',
  '#.X.#..X...#...#...#',
  '#...#......#...#.###',
  '###.########.###.#X#',
  '#........#.....#.#3#',
  '#...3....#..1..#.#.#',
  '#........#.....#.#.#',
  '#.######.#####.#4#.#',
  '#......#.....#.#.#.#',
  '#.####.#..X..#.#.#.#',
  '#....#.#.....#.#4#.#',
  '####.#.#######.#.#.#',
  '#....#.........#...#',
  '#..4.#.#########...#',
  '#....#..X....3.#333#',
  '##################Z#',
];
const MAP_4 = [
  '####################',
  '#S......#..........4#',
  '#.#####.#.##########',
  '#.#...#.#.#..1.1.1.#',
  '#.#.X.3...#.######.#',
  '#.###.#####.#....#.#',
  '#..X#.......#.X..#.#',
  '###.###########.##.#',
  '#...#.1..1....#..X.#',
  '#2###1######.#.###.#',
  '#.#...#....#.#...#2#',
  '#.#1###.##.#.###.#.#',
  '#.#..1X..#.#...#.#.#',
  '#.#####..#.###.#.#.#',
  '#....X#..#...#...#.#',
  '#####.#.####.#####.#',
  '#1....#....#...3...#',
  '#.#######..#########',
  '#....2....#....X...#',
  '#.#########.#.###11#',
  '#2.3...4...X#...#22#',
  '#############.X.#44#',
  '##################Z#',
];
// l'ordre des niveaux : le Z d'une carte mène au S de la suivante
const LEVELS = [MAP_1, MAP_2, MAP_3, MAP_4];

const W = 1120;
const H = 720;
// position de l'œil dans sa case : distance jusqu'au bord avant (1 = dos au mur de derrière, 0.5 = milieu de la case)
const EYE = 0.5;
// largeur à l'écran du mur juste devant soi : 55% laisse voir une demi-dalle à ses pieds (sur l'idée du fiston)
const WALL_AHEAD = 0.55;
const F = WALL_AHEAD * W * EYE; // focale
const NEAR = F / W; // plan de coupe proche : là où les murs latéraux touchent le bord
const MAX_DEPTH = 4;
const MAX_LAT = 3;
const SLASH_MS = 600; // temps de récupération de l'épée
const SLASH_SPEED = 1; // vitesse de lecture du gif (0.5 = deux fois plus lent)
const TICK_MS = 80; // horloge du jeu : animation des monstres + leurs attaques
const ATTACK_MS = 1500; // un monstre au contact frappe toutes les 1,5 s
const HIT_FLASH_MS = 200;
const PLAYER_HP = 10;
const SIGHT = 6; // un monstre te piste s'il peut t'atteindre en 6 pas ou moins
const POTION_HEAL = [4, 8];
const LEVEL_BONUS = 100; // score = or ramassé + 100 par sortie franchie + secondes restantes à chaque sortie
const LEVEL_TIME = 200; // secondes par niveau ; à 0 on continue, mais sans bonus de temps

// height : hauteur du monstre (un mur = 1), lift : décollage du sol (pour ceux qui volent), step : ms par pas
const MONSTER_TYPES = {
  4: { name: 'Le diable noir', height: 0.8, lift: 0, step: 1400 },
  3: { name: 'Le diable rouge', height: 0.85, lift: 0, step: 1100 },
  2: { name: 'Le spectre', height: 0.65, lift: 0.08, step: 900 },
  1: { name: "L'œil volant", height: 0.7, lift: 0.25, step: 600 },
};
const GIFS = { 4: spectreGif, 3: diableRougeGif, 2: squeletteGif, 1: harpieGif, slash: slashGif };

// N, E, S, O
const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]];
const DIR_NAMES = ['Nord', 'Est', 'Sud', 'Ouest'];

const findStart = (map) => {
  for (let y = 0; y < map.length; y++) {
    const x = map[y].indexOf('S');
    if (x >= 0) return { x, y, dir: 1 };
  }
  return { x: 1, y: 1, dir: 1 };
};

const findChests = (map) => {
  const chests = new Set();
  map.forEach((row, y) => [...row].forEach((c, x) => c === 'X' && chests.add(`${x},${y}`)));
  return chests;
};

const findMonsters = (map) => {
  const monsters = [];
  map.forEach((row, y) => [...row].forEach((c, x) => {
    if (MONSTER_TYPES[c]) monsters.push({ id: `${x},${y}`, x, y, type: c, hp: Number(c), readyAt: null, moveAt: null, hitAt: 0 });
  }));
  return monsters;
};

const isWall = (map, x, y) => (map[y]?.[x] ?? '#') === '#';

// la case et ses 4 voisines : ce que le joueur a "vu" en passant
const around = (x, y) => [`${x},${y}`, ...DIRS.map(([dx, dy]) => `${x + dx},${y + dy}`)];

// minimap : uniquement les cases déjà explorées, en haut à droite de la vue
const drawMinimap = (c, map, player, seen, chests) => {
  const cols = Math.max(...map.map((r) => r.length));
  const cell = Math.min(20, Math.floor(360 / Math.max(cols, map.length)));
  const ox = W - cols * cell - 16;
  const oy = 16;
  c.fillStyle = 'rgba(0,0,0,0.75)';
  c.fillRect(ox - 8, oy - 8, cols * cell + 16, map.length * cell + 16);
  for (const key of seen) {
    const [x, y] = key.split(',').map(Number);
    if (y < 0 || y >= map.length || x < 0 || x >= cols) continue;
    c.fillStyle = isWall(map, x, y) ? '#3b352c' : '#a8956f'; // sol clair : les couloirs sautent aux yeux
    c.fillRect(ox + x * cell, oy + y * cell, cell, cell);
    if (map[y][x] === 'Z') {
      c.fillStyle = '#7fd8ff';
      c.fillRect(ox + x * cell + cell * 0.2, oy + y * cell + cell * 0.2, cell * 0.6, cell * 0.6);
    }
    if (chests.has(key)) {
      c.fillStyle = '#e0b030';
      c.beginPath();
      c.arc(ox + (x + 0.5) * cell, oy + (y + 0.5) * cell, cell * 0.3, 0, Math.PI * 2);
      c.fill();
    }
  }
  // le joueur : une flèche dans sa direction
  const cx = ox + (player.x + 0.5) * cell;
  const cy = oy + (player.y + 0.5) * cell;
  c.save();
  c.translate(cx, cy);
  c.rotate((player.dir * Math.PI) / 2);
  c.fillStyle = '#ff5040';
  c.beginPath();
  c.moveTo(0, -cell * 0.45);
  c.lineTo(cell * 0.35, cell * 0.35);
  c.lineTo(-cell * 0.35, cell * 0.35);
  c.closePath();
  c.fill();
  c.restore();
};

// distance (en pas) de chaque case jusqu'au joueur, en contournant murs et coffres
const distanceField = (map, player, chests) => {
  const dist = new Map([[`${player.x},${player.y}`, 0]]);
  let front = [[player.x, player.y]];
  for (let d = 1; d <= SIGHT && front.length; d++) {
    const next = [];
    for (const [x, y] of front) {
      for (const [dx, dy] of DIRS) {
        const k = `${x + dx},${y + dy}`;
        if (dist.has(k) || isWall(map, x + dx, y + dy) || chests.has(k)) continue;
        dist.set(k, d);
        next.push([x + dx, y + dy]);
      }
    }
    front = next;
  }
  return dist;
};

// case relative au joueur : f cases devant, l cases à droite (l<0 = gauche)
const relCell = ({ x, y, dir }, f, l) => {
  const [fx, fy] = DIRS[dir];
  const [rx, ry] = DIRS[(dir + 1) % 4];
  return [x + fx * f + rx * l, y + fy * f + ry * l];
};

// projection (lat, hauteur, distance) -> écran
const proj = (lat, h, dist) => [W / 2 + (lat * F) / dist, H / 2 - (h * F) / dist];

// luminosité selon la distance (1 = plein jour, enfin... plein donjon)
const shade = (d) => Math.min(0.9, Math.max(0.06, 0.9 - (d - 1) * 0.3));
const SIDE_LIGHT = 0.7; // les murs latéraux prennent moins la lumière de la torche
const FLOOR_LIGHT = 0.5; // les dalles (sol, plafond) sont très claires : on les calme pour rester dans l'ambiance

const useImage = (src) => {
  const [img, setImg] = useState(null);
  useEffect(() => {
    const i = new window.Image();
    i.onload = () => setImg(i);
    i.src = src;
  }, [src]);
  return img;
};

const drawFront = (c, tex, lat0, lat1, d) => {
  const [x0, y0] = proj(lat0, 0.5, d);
  const [x1, y1] = proj(lat1, -0.5, d);
  c.drawImage(tex, x0, y0, x1 - x0, y1 - y0);
  c.fillStyle = `rgba(0,0,0,${1 - shade(d)})`;
  c.fillRect(x0, y0, x1 - x0, y1 - y0);
};

// Mur latéral : on découpe la texture en bandes verticales, chacune à sa distance,
// ce qui donne une perspective correcte. Le clip redresse les bords en escalier.
const drawSide = (c, tex, lat, z, d0, d1) => {
  const pts = [proj(lat, 0.5, d0), proj(lat, 0.5, d1), proj(lat, -0.5, d1), proj(lat, -0.5, d0)];
  c.save();
  c.beginPath();
  pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.closePath();
  c.clip();
  const n = Math.max(2, Math.min(200, Math.ceil(Math.abs(pts[1][0] - pts[0][0]) / 2))); // bandes de ~2px
  for (let i = 0; i < n; i++) {
    const da = d0 + ((d1 - d0) * i) / n;
    const db = d0 + ((d1 - d0) * (i + 1)) / n;
    const [xa, ya] = proj(lat, 0.5, da);
    const [xb] = proj(lat, 0.5, db);
    const yBottom = proj(lat, -0.5, da)[1];
    const u0 = (da - z) * tex.width;
    const u1 = Math.min(tex.width, (db - z) * tex.width);
    const left = Math.min(xa, xb);
    const w = Math.abs(xb - xa) + 0.5; // léger recouvrement contre les coutures
    c.drawImage(tex, u0, 0, u1 - u0, tex.height, left, ya, w, yBottom - ya);
  }
  // l'ombre en une seule passe (dégradé), pour ne pas rayer le mur aux recouvrements
  const xNear = pts[0][0];
  const xFar = pts[1][0];
  const grad = c.createLinearGradient(xNear, 0, xFar, 0);
  for (let i = 0; i <= 8; i++) {
    const d = d0 + ((d1 - d0) * i) / 8;
    grad.addColorStop(Math.min(1, Math.max(0, (proj(lat, 0, d)[0] - xNear) / (xFar - xNear))), `rgba(0,0,0,${1 - shade(d) * SIDE_LIGHT})`);
  }
  c.fillStyle = grad;
  c.fillRect(Math.min(xNear, xFar), 0, Math.abs(xFar - xNear), H);
  c.restore();
};

// Dalle de sol (h = -0.5) ou de plafond (h = 0.5) d'une case : bandes horizontales (à distance
// constante, donc perspective exacte), chacune à sa largeur moyenne. Pas de clip (il crénèle les
// diagonales) : le pixel d'écart aux coutures est caché par les joints, et sous les murs par les murs.
const drawPlaneCell = (c, tex, l, z, d0, d1, h, joints) => {
  const pts = [proj(l - 0.5, h, d0), proj(l + 0.5, h, d0), proj(l + 0.5, h, d1), proj(l - 0.5, h, d1)];
  const xs = pts.map((p) => p[0]);
  const yFar = pts[2][1];
  if (Math.min(...xs) > W || Math.max(...xs) < 0 || yFar > H || yFar < 0) return; // hors écran
  joints.push(pts);
  const yNear = Math.min(H, Math.max(0, pts[0][1]));
  const n = Math.max(2, Math.min(200, Math.ceil(Math.abs(yNear - yFar) / 2)));
  for (let i = 0; i < n; i++) {
    const da = d0 + ((d1 - d0) * i) / n;
    const db = d0 + ((d1 - d0) * (i + 1)) / n;
    const ya = proj(l, h, da)[1];
    const yb = proj(l, h, db)[1];
    const [xl] = proj(l - 0.5, h, (da + db) / 2);
    const [xr] = proj(l + 0.5, h, (da + db) / 2);
    const top = Math.min(ya, yb);
    const bottom = Math.max(ya, yb);
    if (top > H || bottom < 0) continue; // bande hors de l'écran
    const v0 = (1 - (db - z)) * tex.height;
    const v1 = (1 - (da - z)) * tex.height;
    c.drawImage(tex, 0, Math.max(0, v0), tex.width, v1 - Math.max(0, v0), xl, top, xr - xl, bottom - top + 0.5);
  }
};

// les joints entre dalles, en un seul tracé par-dessus (lissé, et pas assombri deux fois là où deux dalles se touchent)
const drawJoints = (c, joints) => {
  c.beginPath();
  for (const pts of joints) {
    pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.closePath();
  }
  c.strokeStyle = 'rgba(0,0,0,0.45)';
  c.lineWidth = 2;
  c.stroke();
};

// ombre du sol et du plafond : la distance ne dépend que de l'écart à l'horizon, un dégradé vertical suffit
const drawPlaneShade = (c) => {
  const grad = c.createLinearGradient(0, 0, 0, H);
  for (let i = 0; i <= 24; i++) {
    const y = (H * i) / 24;
    const gap = Math.abs(y - H / 2);
    const d = gap > 0 ? (0.5 * F) / gap : Infinity;
    grad.addColorStop(i / 24, `rgba(0,0,0,${1 - shade(d) * FLOOR_LIGHT})`);
  }
  c.fillStyle = grad;
  c.fillRect(0, 0, W, H);
};

// objet posé au sol, au centre de la case
const drawSprite = (c, img, lat, d, worldW) => {
  const w = (worldW * F) / d;
  const h = (w * img.height) / img.width;
  const [cx, bottom] = proj(lat, -0.5, d);
  c.filter = `brightness(${shade(d)})`;
  c.drawImage(img, cx - w / 2, bottom - h, w, h);
  c.filter = 'none';
};

// monstre : l'image courante du gif, recadrée, debout (ou en vol) au centre de la case
const drawMonster = (c, sprite, m, lat, d, now) => {
  const type = MONSTER_TYPES[m.type];
  const { crop } = sprite;
  const h = (type.height * F) / d;
  const w = (h * crop.w) / crop.h;
  let [cx, bottom] = proj(lat, -0.5 + type.lift, d);
  const hit = now - m.hitAt < HIT_FLASH_MS;
  if (hit) cx += Math.sin(now / 15) * (12 / d); // il encaisse
  c.filter = hit ? 'sepia(1) saturate(8) hue-rotate(-40deg) brightness(1.2)' : `brightness(${shade(d)})`;
  c.drawImage(gifFrame(sprite, now), crop.x, crop.y, crop.w, crop.h, cx - w / 2, bottom - h, w, h);
  c.filter = 'none';
};

// la sortie : une arche de pierre, avec une lueur magique qui pulse dans l'ouverture
const PORTAL_HEIGHT = 0.95;
const drawPortal = (c, img, lat, d, now) => {
  const h = (PORTAL_HEIGHT * F) / d;
  const w = (h * img.width) / img.height;
  const [cx, bottom] = proj(lat, -0.5, d);
  const x0 = cx - w / 2;
  const y0 = bottom - h;
  // l'ouverture de l'arche occupe ~36-61% en largeur et ~31-88% en hauteur de l'image
  const gx = x0 + w * 0.485;
  const gy = y0 + h * 0.6;
  const pulse = 0.75 + 0.25 * Math.sin(now / 250);
  const glow = c.createRadialGradient(gx, gy, 0, gx, gy, h * 0.3);
  glow.addColorStop(0, `rgba(200,240,255,${pulse})`);
  glow.addColorStop(0.5, `rgba(90,140,255,${0.7 * pulse})`);
  glow.addColorStop(1, 'rgba(60,0,160,0)');
  c.fillStyle = glow;
  c.fillRect(x0 + w * 0.34, y0 + h * 0.3, w * 0.3, h * 0.6);
  c.filter = `brightness(${shade(d)})`;
  c.drawImage(img, x0, y0, w, h);
  c.filter = 'none';
};

// le coup d'épée, joué une fois par-dessus la vue
const drawSlash = (c, sprite, elapsed) => {
  const { crop } = sprite;
  const w = W * 0.6;
  const h = (w * crop.h) / crop.w;
  c.drawImage(gifFrame(sprite, Math.min(elapsed, sprite.total - 1)), crop.x, crop.y, crop.w, crop.h, (W - w) / 2, (H - h) / 2, w, h);
};

const drawBackground = (c) => {
  const ceil = c.createLinearGradient(0, 0, 0, H / 2);
  ceil.addColorStop(0, '#1c1813');
  ceil.addColorStop(1, '#000');
  c.fillStyle = ceil;
  c.fillRect(0, 0, W, H / 2);
  const floor = c.createLinearGradient(0, H / 2, 0, H);
  floor.addColorStop(0, '#000');
  floor.addColorStop(1, '#3a332a');
  c.fillStyle = floor;
  c.fillRect(0, H / 2, W, H / 2);
};

// Rendu "peintre" : du plus loin au plus proche, de l'extérieur vers le centre
const drawView = (c, map, player, tex, images, chests, monsterAt, sprites, now) => {
  drawBackground(c);
  if (!tex) return;
  const lats = [];
  for (let a = MAX_LAT; a >= 1; a--) lats.push(-a, a);
  lats.push(0);
  // sol et plafond d'abord, sous tout le reste
  if (images.floor && images.ceiling) {
    const joints = [];
    for (let f = MAX_DEPTH; f >= 0; f--) {
      const z = f - 1 + EYE; // distance entre l'œil et le bord le plus proche de la case f
      for (const l of lats) {
        const [cx, cy] = relCell(player, f, l);
        if (isWall(map, cx, cy) || z + 1 <= NEAR) continue;
        drawPlaneCell(c, images.floor, l, z, Math.max(z, NEAR), z + 1, -0.5, joints);
        drawPlaneCell(c, images.ceiling, l, z, Math.max(z, NEAR), z + 1, 0.5, joints);
      }
    }
    drawJoints(c, joints);
    drawPlaneShade(c);
  }
  for (let f = MAX_DEPTH; f >= 0; f--) {
    const z = f - 1 + EYE;
    for (const l of lats) {
      const [cx, cy] = relCell(player, f, l);
      if (isWall(map, cx, cy)) {
        // face latérale (visible si la case n'est pas dans l'axe)
        if (l !== 0) {
          const d0 = Math.max(z, NEAR);
          if (d0 < z + 1) drawSide(c, tex, l < 0 ? l + 0.5 : l - 0.5, z, d0, z + 1);
        }
        if (f >= 1) drawFront(c, tex, l - 0.5, l + 0.5, z);
      } else if (f >= 1 && images.chest && chests.has(`${cx},${cy}`)) {
        drawSprite(c, images.chest, l, z + 0.5, 0.55);
      } else if (f >= 1) {
        if (images.portal && map[cy][cx] === 'Z') drawPortal(c, images.portal, l, z + 0.5, now);
        const m = monsterAt.get(`${cx},${cy}`);
        if (m && sprites[m.type]) drawMonster(c, sprites[m.type], m, l, z + 0.5, now);
      }
    }
  }
};

const DungeonMaster = () => {
  const [level, setLevel] = useState(0);
  const map = LEVELS[level];
  const [player, setPlayer] = useState(() => findStart(LEVELS[0]));
  const [chests, setChests] = useState(() => findChests(LEVELS[0]));
  const [monsters, setMonsters] = useState(() => findMonsters(LEVELS[0]));
  const [hp, setHp] = useState(PLAYER_HP);
  const [hurtAt, setHurtAt] = useState(0);
  const [now, setNow] = useState(Date.now);
  const [gold, setGold] = useState(0);
  const [potions, setPotions] = useState(0);
  const [seen, setSeen] = useState(() => { const p = findStart(LEVELS[0]); return new Set(around(p.x, p.y)); });
  const [won, setWon] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [bonk, setBonk] = useState(false);
  const [slash, setSlash] = useState(null); // timestamp du coup en cours
  const [message, setMessage] = useState(null);
  const [levelStartAt, setLevelStartAt] = useState(Date.now);
  const [endedAt, setEndedAt] = useState(null); // le chrono se fige en fin de partie
  const [timeBonus, setTimeBonus] = useState(0); // cumul des secondes restantes aux sorties
  const tex = useImage(texturePierre);
  const images = { chest: useImage(coffreImg), portal: useImage(portalImg), floor: useImage(solImg), ceiling: useImage(plafondImg) };
  const sprites = useGifSprites(GIFS);
  const dead = hp <= 0;
  const over = dead || won; // plus rien ne bouge
  const [gameOverOpen, setGameOverOpen] = useState(false);
  const timeLeft = Math.max(0, LEVEL_TIME - Math.floor(((endedAt ?? now) - levelStartAt) / 1000));
  const score = gold + LEVEL_BONUS * (won ? LEVELS.length : level) + timeBonus;
  const monsterAt = new Map(monsters.map((m) => [`${m.x},${m.y}`, m]));
  // position du joueur à jour même entre deux rendus : les touches rapides ne perdent pas de pas,
  // et un monstre ne lui marche pas dessus
  const playerRef = useRef(player);
  playerRef.current = player;

  useEffect(() => {
    soundManager.loadSounds({ sword: soundMap.sword, coffre: soundMap.coffre, fire: soundMap.fire, slash: soundMap.slash, glou: soundMap.glou, porte: soundMap.porte, finNiveau: soundMap.finNiveau });
    const id = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(id);
  }, []);

  // À chaque tic : les monstres qui te sentent se rapprochent d'un pas (chacun à son rythme),
  // ceux au contact (devant, derrière ou sur les côtés) préparent puis portent leur coup
  useEffect(() => {
    if (over) return;
    let hits = 0;
    const field = distanceField(map, player, chests);
    const occupied = new Set(monsters.map((m) => `${m.x},${m.y}`));
    const updates = new Map(); // id -> champs modifiés
    monsters.forEach((m) => {
      const u = {};
      const adjacent = Math.abs(m.x - player.x) + Math.abs(m.y - player.y) === 1;
      if (!adjacent) {
        if (m.readyAt !== null) u.readyAt = null;
        const d = field.get(`${m.x},${m.y}`);
        if (d === undefined) {
          if (m.moveAt !== null) u.moveAt = null; // il t'a perdu
        } else if (m.moveAt === null) {
          u.moveAt = now + MONSTER_TYPES[m.type].step; // il t'a repéré
        } else if (now >= m.moveAt) {
          u.moveAt = now + MONSTER_TYPES[m.type].step;
          const step = DIRS.map(([dx, dy]) => [m.x + dx, m.y + dy])
            .find(([x, y]) => field.get(`${x},${y}`) === d - 1 && !occupied.has(`${x},${y}`) && d > 1);
          if (step) {
            occupied.delete(`${m.x},${m.y}`);
            occupied.add(`${step[0]},${step[1]}`);
            [u.x, u.y] = step;
          }
        }
      } else if (m.readyAt === null) {
        u.readyAt = now + ATTACK_MS; // il arme son coup
      } else if (now >= m.readyAt) {
        hits++;
        u.readyAt = now + ATTACK_MS;
      }
      if (Object.keys(u).length) updates.set(m.id, u);
    });
    if (updates.size) {
      setMonsters((prev) => prev.map((m) => {
        const u = updates.get(m.id);
        if (!u) return m;
        const p = playerRef.current;
        if (u.x !== undefined && u.x === p.x && u.y === p.y) return { ...m, ...u, x: m.x, y: m.y }; // le joueur est passé avant
        return { ...m, ...u };
      }));
    }
    if (hits) {
      setHp((h) => Math.max(0, h - hits));
      setHurtAt(now);
      soundManager.play('slash');
    }
  }, [now]);

  useEffect(() => {
    if (!over) return;
    setEndedAt(Date.now());
    setGameOverOpen(true);
  }, [over]);

  const say = (text) => {
    setMessage(text);
    setTimeout(() => setMessage((m) => (m === text ? null : m)), 2000);
  };

  // on arrive au départ d'une carte : ses monstres et ses coffres, minimap vierge.
  // PV, or et potions voyagent avec le joueur.
  const enterLevel = (i) => {
    const m = LEVELS[i];
    const p = findStart(m);
    setLevel(i);
    playerRef.current = p;
    setPlayer(p);
    setChests(findChests(m));
    setMonsters(findMonsters(m));
    setSeen(new Set(around(p.x, p.y)));
    setLevelStartAt(Date.now());
  };

  const restart = () => {
    enterLevel(0);
    setHp(PLAYER_HP);
    setGold(0);
    setPotions(0);
    setWon(false);
    setGameOverOpen(false);
    setTimeBonus(0);
    setEndedAt(null);
  };

  const takeExit = () => {
    setTimeBonus(timeBonus + timeLeft);
    if (level === LEVELS.length - 1) {
      setWon(true);
      soundManager.play('finNiveau');
      return;
    }
    enterLevel(level + 1);
    soundManager.play('porte');
    say(`Niveau ${level + 2}${timeLeft ? ` — bonus de temps : +${timeLeft}` : ''}`);
  };

  const drink = () => {
    if (!potions) return;
    if (hp >= PLAYER_HP) {
      say('Tu es déjà en pleine forme');
      return;
    }
    const heal = POTION_HEAL[0] + Math.floor(Math.random() * (POTION_HEAL[1] - POTION_HEAL[0] + 1));
    const healed = Math.min(PLAYER_HP, hp + heal) - hp; // on ne dépasse pas le maximum
    setHp((h) => Math.min(PLAYER_HP, h + heal));
    setPotions(potions - 1);
    soundManager.play('glou');
    say(`Glou glou... +${healed} PV`);
  };

  const turn = (delta) => {
    const p = playerRef.current;
    playerRef.current = { ...p, dir: (p.dir + delta + 4) % 4 };
    setPlayer(playerRef.current);
  };

  // step: 0 avant, 1 droite, 2 arrière, 3 gauche (relatif)
  const move = (step) => {
    const player = playerRef.current;
    const [dx, dy] = DIRS[(player.dir + step) % 4];
    const nx = player.x + dx;
    const ny = player.y + dy;
    if (isWall(map, nx, ny) || chests.has(`${nx},${ny}`) || monsterAt.has(`${nx},${ny}`)) {
      setBonk(true);
      setTimeout(() => setBonk(false), 150);
      return;
    }
    if (map[ny][nx] === 'Z') {
      takeExit();
      return;
    }
    playerRef.current = { ...player, x: nx, y: ny };
    setPlayer(playerRef.current);
    setSeen((prev) => new Set([...prev, ...around(nx, ny)]));
  };

  // Espace : on agit sur la case devant soi. Un coffre ? on l'ouvre. Sinon, on tape (et tant mieux s'il y a un monstre).
  const act = () => {
    const [fx, fy] = relCell(playerRef.current, 1, 0);
    const key = `${fx},${fy}`;
    if (chests.has(key)) {
      const loot = 10 + Math.floor(Math.random() * 41);
      const next = new Set(chests);
      next.delete(key);
      setChests(next);
      const found = Math.floor(Math.random() * 3); // 0, 1 ou 2 potions
      setGold(gold + loot);
      setPotions(potions + found);
      soundManager.play('coffre');
      say(`Coffre ouvert : +${loot} pièces d'or${found ? ` et ${found} potion${found > 1 ? 's' : ''}` : ''} !`);
      return;
    }
    if (slash) return; // l'épée n'est pas encore revenue
    const t = Date.now();
    setSlash(t);
    soundManager.play('sword');
    setTimeout(() => setSlash(null), SLASH_MS);
    const target = monsterAt.get(key);
    if (!target) return;
    if (target.hp > 1) {
      setMonsters((prev) => prev.map((m) => (m.id === target.id ? { ...m, hp: m.hp - 1, hitAt: t } : m)));
      return;
    }
    setMonsters((prev) => prev.filter((m) => m.id !== target.id));
    soundManager.play('fire');
    say(`${MONSTER_TYPES[target.type].name} est terrassé !`);
  };

  useEffect(() => {
    // e.code = touche physique : A Z E / Q S D en AZERTY, comme le pavé de DM
    const actions = {
      ArrowUp: () => move(0), KeyW: () => move(0),
      ArrowDown: () => move(2), KeyS: () => move(2),
      ArrowLeft: () => turn(-1), KeyQ: () => turn(-1),
      ArrowRight: () => turn(1), KeyE: () => turn(1),
      KeyA: () => move(3), KeyD: () => move(1),
      Space: act,
      KeyP: drink,
    };
    // M (e.key, pas e.code : en AZERTY le M n'est pas à la place du M QWERTY) : minimap tant qu'on appuie
    const isM = (e) => e.key === 'm' || e.key === 'M';
    // on laisse tranquilles les touches tapées dans un champ (le pseudo du GameOver)
    const typing = (e) => ['INPUT', 'TEXTAREA'].includes(e.target.tagName);
    const onKey = (e) => {
      if (typing(e)) return;
      if (isM(e)) {
        setShowMap(true);
        return;
      }
      const action = actions[e.code];
      if (!action || over) return;
      e.preventDefault();
      if (!e.repeat || e.code !== 'Space') action();
    };
    const onKeyUp = (e) => !typing(e) && isM(e) && setShowMap(false);
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKeyUp);
    };
  });

  const pad = [
    { label: '↺', title: 'Tourner à gauche (A / ←)', fn: () => turn(-1) },
    { label: '▲', title: 'Avancer (Z / ↑)', fn: () => move(0) },
    { label: '↻', title: 'Tourner à droite (E / →)', fn: () => turn(1) },
    { label: '◀', title: 'Pas de côté gauche (Q)', fn: () => move(3) },
    { label: '▼', title: 'Reculer (S / ↓)', fn: () => move(2) },
    { label: '▶', title: 'Pas de côté droit (D)', fn: () => move(1) },
  ];

  // les boutons ne prennent pas le focus, sinon Espace les déclencherait en double
  const noFocus = (e) => e.preventDefault();
  const hud = { color: '#c8b88a', fontFamily: 'monospace' };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, p: 2, bgcolor: '#000', minHeight: '100%' }}>
      <GameOver open={gameOverOpen} score={score} gameName="Dungeon Master"
        gameOverReason={won ? 'Victoire !' : `Mort au niveau ${level + 1}`}
        handleClose={() => setGameOverOpen(false)} handleRestart={restart} />
      <Box sx={{ position: 'relative', border: '4px solid #555', transform: bonk ? 'translateX(4px)' : 'none' }}>
        <Stage width={W} height={H}>
          <Layer>
            <Shape listening={false}
              sceneFunc={(ctx) => {
                drawView(ctx._context, map, player, tex, images, chests, monsterAt, sprites, now);
                if (slash && sprites.slash) drawSlash(ctx._context, sprites.slash, (now - slash) * SLASH_SPEED);
                if (showMap) drawMinimap(ctx._context, map, player, seen, chests);
              }} />
          </Layer>
        </Stage>
        <Typography sx={{ ...hud, fontSize: 28, position: 'absolute', top: 12, left: 16, textShadow: '0 0 6px #000',
          color: timeLeft <= 30 ? '#ff5040' : hud.color, opacity: timeLeft ? 1 : 0.5 }}>
          ⏳ {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
        </Typography>
        {now - hurtAt < HIT_FLASH_MS && (
          <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(160,0,0,0.35)', pointerEvents: 'none' }} />
        )}
        {message && (
          <Typography sx={{ ...hud, fontSize: 22, position: 'absolute', bottom: 16, width: '100%', textAlign: 'center', textShadow: '0 0 4px #000' }}>
            {message}
          </Typography>
        )}
        {dead && (
          <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(40,0,0,0.75)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
            <Typography sx={{ ...hud, fontSize: 48, color: '#d33' }}>Tu es mort</Typography>
            <Typography sx={hud}>Le donjon garde ses {gold} pièces d'or... et tes os.</Typography>
            <Button variant="outlined" onClick={restart} sx={{ color: '#c8b88a', borderColor: '#555' }}>Recommencer</Button>
          </Box>
        )}
        {won && (
          <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,10,40,0.8)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
            <Typography sx={{ ...hud, fontSize: 48, color: '#7fd8ff' }}>Victoire !</Typography>
            <Typography sx={hud}>Tu ressors du donjon avec {gold} pièces d'or, {hp} PV et {timeBonus} secondes d'avance. Chapeau.</Typography>
            <Button variant="outlined" onClick={restart} sx={{ color: '#c8b88a', borderColor: '#555' }}>Rejouer</Button>
          </Box>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <Box sx={{ minWidth: 110 }}>
          <Typography sx={hud}>Niveau {level + 1} / {LEVELS.length}</Typography>
          <Typography sx={hud}>⌖ {DIR_NAMES[player.dir]}</Typography>
          <Typography sx={{ ...hud, color: hp <= 3 ? '#d33' : hud.color }}>♥ {hp} / {PLAYER_HP}</Typography>
          <Typography sx={hud}>🪙 {gold}</Typography>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 48px)', gap: 0.5 }}>
          {pad.map((b) => (
            <Button key={b.label} title={b.title} onClick={b.fn} onMouseDown={noFocus} variant="outlined"
              sx={{ minWidth: 48, height: 40, color: '#c8b88a', borderColor: '#555', fontSize: 20 }}>
              {b.label}
            </Button>
          ))}
        </Box>
        <Button title="Frapper / ouvrir (Espace)" onClick={act} onMouseDown={noFocus} variant="outlined"
          sx={{ minWidth: 64, height: 84, color: '#c8b88a', borderColor: '#555', fontSize: 28 }}>
          ⚔
        </Button>
        <Box sx={{ minWidth: 160 }}>
          <Typography sx={{ ...hud, fontSize: 12, opacity: 0.7 }}>Inventaire</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 220 }}>
            {potions === 0 && <Typography sx={{ ...hud, opacity: 0.4 }}>vide</Typography>}
            {Array.from({ length: potions }, (_, i) => (
              <img key={i} src={potionImg} alt="potion" title="Boire une potion (P) : +4 à +8 PV" onClick={drink}
                style={{ width: 40, height: 40, cursor: 'pointer' }} />
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DungeonMaster;
