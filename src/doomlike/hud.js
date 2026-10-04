// Le HUD : viseur, hitmarker, vie, argent, armes, messages
import { spreadOf } from './combat';
import { F, H, HITMARK_MS, LOOT_MS, W } from './constants';
import { CROSSHAIR_SIZE } from './crosshairs';
import { WEAPONS } from './weapons';

export const hudText = (c, text, x, y, color) => {
  c.fillStyle = '#000';
  c.fillText(text, x + 1, y + 1);
  c.fillStyle = color;
  c.fillText(text, x, y);
};

// viseur Classique façon CS : quatre traits qui s'écartent avec la dispersion (en courant, il s'ouvre)
export const drawClassic = (c, spread) => {
  const cx = W / 2 + 0.5;
  const cy = H / 2 + 0.5;
  const gap = 3 + spread;
  c.strokeStyle = 'rgba(120,255,140,0.85)';
  c.lineWidth = 1;
  c.beginPath();
  [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
    c.moveTo(cx + dx * gap, cy + dy * gap);
    c.lineTo(cx + dx * (gap + 6), cy + dy * (gap + 6));
  });
  c.stroke();
  c.fillStyle = 'rgba(120,255,140,0.85)';
  c.fillRect(W / 2, H / 2, 1, 1);
};

// un viseur acheté (image) : il grossit avec la dispersion, comme le Classique s'ouvre
export const drawCursorImage = (c, { img, crop }, spread) => {
  const s = CROSSHAIR_SIZE + spread;
  c.imageSmoothingQuality = 'high'; // de 512 px à 30 d'un coup : sans ça, les traits fins disparaissent
  c.drawImage(img, crop.x, crop.y, crop.w, crop.h, W / 2 - s / 2, H / 2 - s / 2, s, s);
};

// le viseur équipé, puis un hitmarker en croix quand ça touche, rouge si c'est la tête
export const drawCrosshair = (c, g, cursors, t) => {
  const cursor = cursors[g.save.crosshair];
  if (cursor) drawCursorImage(c, cursor, spreadOf(g) * F);
  else drawClassic(c, spreadOf(g) * F);
  if (!g.hit || t - g.hit.at > HITMARK_MS) return;
  const cx = W / 2 + 0.5;
  const cy = H / 2 + 0.5;
  const k = 1 - (t - g.hit.at) / HITMARK_MS;
  c.strokeStyle = g.hit.head ? `rgba(255,60,40,${k})` : `rgba(255,255,255,${k})`;
  c.lineWidth = g.hit.head ? 2 : 1;
  c.beginPath();
  [[1, 1], [-1, 1], [1, -1], [-1, -1]].forEach(([dx, dy]) => {
    c.moveTo(cx + dx * 5, cy + dy * 5);
    c.lineTo(cx + dx * 11, cy + dy * 11);
  });
  c.stroke();
};

export const drawHud = (c, g, cursors, t) => {
  drawCrosshair(c, g, cursors, t);
  if (g.explosions.some((e) => t - e.at < 120)) {
    c.fillStyle = 'rgba(255,180,80,0.12)'; // le boum éclaire tout
    c.fillRect(0, 0, W, H);
  }
  if (t - g.hurtAt < 250) {
    c.fillStyle = `rgba(170,0,0,${0.4 * (1 - (t - g.hurtAt) / 250)})`;
    c.fillRect(0, 0, W, H);
  }
  const { hp } = g.player;
  c.font = 'bold 18px monospace';
  c.textAlign = 'left';
  hudText(c, `♥ ${hp}`, 12, H - 12, hp <= 25 ? '#ff5040' : '#c8b88a');
  hudText(c, `☠ ${g.monsters.filter((m) => !m.deadAt).length}`, 12, 26, '#c8b88a');
  c.textAlign = 'right';
  hudText(c, `${g.save.money} $`, W - 12, 26, '#7fd87f');
  if (g.loot && t - g.loot.at < LOOT_MS) {
    c.globalAlpha = 1 - (t - g.loot.at) / LOOT_MS;
    hudText(c, `+${g.loot.amount} $`, W - 12, 48 - 8 * c.globalAlpha, '#b8ffb0'); // il monte en s'effaçant
    c.globalAlpha = 1;
  }
  hudText(c, `[${g.weapon + 1}] ${WEAPONS[g.weapon].name}`, W - 12, H - 12, '#c8b88a');
  // les emplacements d'armes : en main, ramassée, pas encore trouvée
  c.font = 'bold 14px monospace';
  WEAPONS.forEach((_, i) => {
    const color = i === g.weapon ? '#ffd860' : g.owned[i] ? '#c8b88a' : '#4a4540';
    hudText(c, `${i + 1}`, W - 12 - (WEAPONS.length - 1 - i) * 16, H - 36, color);
  });
  if (g.message && t - g.message.at < 2000) {
    c.font = 'bold 20px monospace';
    c.textAlign = 'center';
    hudText(c, g.message.text, W / 2, 70, '#ffd860');
  }
};
