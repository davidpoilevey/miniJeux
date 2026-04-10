import { useEffect, useRef, useState } from "react";
import { useWB } from "../WBContext";
import { drawSprite, loadAllSprites } from "./sprites/spriteEngine";

// ── Couleurs terrain ─────────────────────────────────────────
const TERRAIN_COLORS = {
  eau:      '#2a6ebb',
  glace:    '#b8daf0',
  neige:    '#ddeaf2',
  montagne: '#7a6852',
  foret:    '#2d6e29',
  plaine:   '#6db33f',
  desert:   '#d4b94a',
  marecage: '#9fbb44',
  riviere:  '#4a8fd4',
};

// ── Couleurs ressources (dot) ────────────────────────────────
const RESOURCE_COLORS = {
  // plantes
  arbre:      '#1a4a15',
  champignon: '#8B4513',
  fougere:    '#3a7a30',
  baies:      '#cc3333',
  herbes:     '#90c040',
  fleurs:     '#cc66cc',
  fruits:     '#ff8833',
  cactus:     '#5a8a2a',
  aloe:       '#7aaa50',
  jonc:       '#6a8a4a',
  nenuphar:   '#3a9a50',
  mousse:     '#4a7a30',
  edelweiss:  '#f0f0f0',
  lichen:     '#aaaa70',
  roseau:     '#8a9a50',
  // minéraux
  or:         '#ffd700',
  fer:        '#9090b0',
  charbon:    '#334',
  petrole:    '#444422',
  silex:      '#b0a090',
  argile:     '#cc8855',
  tourbe:     '#665533',
  sable:      '#e0d080',
  cristal:    '#aaddff',
};

// ── Couleurs état habitant ───────────────────────────────────
const STATE_COLORS = {
  idle:        '#ffffff',
  moving:      '#00e5ff',
  foraging:    '#ff9800',
  resting:     '#ffeb3b',
  building:    '#ce93d8',
  socializing: '#f48fb1',
};

// ── Build resource lookup map ────────────────────────────────
// Retourne Map<"x,y", { species, type }[]>
function buildResourceMap(em) {
  const map = new Map();
  const ids = em.query('Position', 'Resource');
  for (const id of ids) {
    const pos     = em.getComponent(id, 'Position');
    const species = em.getComponent(id, 'Species');
    const res     = em.getComponent(id, 'Resource');
    const key = `${pos.x},${pos.y}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push({ species: species?.type, type: res.type });
  }
  return map;
}

// ── Build groupId → village color map ────────────────────────
function buildGroupColors(em) {
  const map = {};
  for (const vid of em.query('Village')) {
    const v = em.getComponent(vid, 'Village');
    if (v?.groupId && v?.color) map[v.groupId] = v.color;
  }
  return map;
}

// ── Effets de combat ─────────────────────────────────────────
// type 'battle' : explosion orange/rouge (combat entre habitants)
// type 'siege'  : flash violet/bleu (attaque d'un bâtiment)
function drawBattleEffects(ctx, effects, currentTick, cellSize) {
  const MAX_AGE = 8;
  for (const fx of effects) {
    const age = currentTick - fx.tick;
    if (age > MAX_AGE) continue;
    const t  = age / MAX_AGE;           // 0 = tout frais, 1 = mourant
    const cx = fx.x * cellSize + cellSize / 2;
    const cy = fx.y * cellSize + cellSize / 2;

    const isBattle = fx.type !== 'siege';

    // ── Flash central (ticks 0-1) ─────────────────────────
    if (age <= 1) {
      const fa = (1 - age) * 0.85;
      ctx.fillStyle = isBattle
        ? `rgba(255, 210, 50, ${fa})`
        : `rgba(160, 100, 255, ${fa})`;
      ctx.beginPath();
      ctx.arc(cx, cy, cellSize * 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // ── Anneau intérieur (expansion rapide) ───────────────
    const r1 = cellSize * (0.4 + t * 2.8);
    const a1 = Math.max(0, 1 - t * 1.3);
    ctx.strokeStyle = isBattle
      ? `rgba(255, 100, 10, ${a1})`
      : `rgba(180, 80, 255, ${a1})`;
    ctx.lineWidth = Math.max(1, cellSize * 0.28 * (1 - t));
    ctx.beginPath();
    ctx.arc(cx, cy, r1, 0, Math.PI * 2);
    ctx.stroke();

    // ── Anneau extérieur (expansion lente) ────────────────
    const r2 = cellSize * (0.2 + t * 5);
    const a2 = Math.max(0, 0.55 - t * 0.7);
    ctx.strokeStyle = isBattle
      ? `rgba(220, 30, 0, ${a2})`
      : `rgba(100, 50, 200, ${a2})`;
    ctx.lineWidth = Math.max(1, cellSize * 0.1);
    ctx.beginPath();
    ctx.arc(cx, cy, r2, 0, Math.PI * 2);
    ctx.stroke();

    // ── Icône flottante (ticks 0-3) ───────────────────────
    if (age <= 3) {
      const ia    = 1 - age / 3;
      const emoji = isBattle ? '⚔' : '🔥';
      ctx.font         = `${Math.max(8, cellSize * 0.9)}px sans-serif`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.globalAlpha  = ia;
      ctx.fillText(emoji, cx, cy - cellSize * (0.8 + age * 0.4));
      ctx.globalAlpha  = 1;
    }
  }
}

// ── Draw ─────────────────────────────────────────────────────
function draw(canvas, grid, em, cellSize, selected, battleEffects, currentTick) {
  if (!canvas || !grid) return;
  const ctx = canvas.getContext('2d');
  const { cols, rows } = grid;

  canvas.width  = cols * cellSize;
  canvas.height = rows * cellSize;

  const resMap = buildResourceMap(em);
  const dotR   = Math.max(1, cellSize * 0.18);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const cell = grid.getCell(x, y);
      if (!cell) continue;

      const px = x * cellSize;
      const py = y * cellSize;

      // Fond terrain
      ctx.fillStyle = TERRAIN_COLORS[cell.terrainType] ?? '#888';
      ctx.fillRect(px, py, cellSize, cellSize);

      // Ressources — un dot par ressource présente
      const resources = resMap.get(`${x},${y}`);
      if (resources && resources.length > 0) {
        
        const dotCount = Math.min(resources.length, 4); // max 4 dots visible
        for (let i = 0; i < dotCount; i++) {
          const res = resources[i];
         if(!drawSprite(ctx, res.type, px,py,cellSize,cellSize)){
          
          ctx.fillStyle = RESOURCE_COLORS[res.type] ?? '#fff';
          ctx.beginPath();
          // disposition en 2×2 si plusieurs
          const ox = (i % 2) * (cellSize * 0.4) + cellSize * 0.2;
          const oy = Math.floor(i / 2) * (cellSize * 0.4) + cellSize * 0.2;
          ctx.arc(px + ox, py + oy, dotR, 0, Math.PI * 2);
          ctx.fill();
         }
        }
      }

    }
  }

  // ── Bâtiments ─────────────────────────────────────────────
  for (const bid of em.query('Position', 'Building')) {
    const bpos = em.getComponent(bid, 'Position');
    const bld  = em.getComponent(bid, 'Building');
    const px = bpos.x * cellSize;
    const py = bpos.y * cellSize;
    if (!drawSprite(ctx, bld.type, px, py, cellSize, cellSize)) {
      // Fallback : petit carré brun
      ctx.fillStyle = '#4fcc44';
      ctx.fillRect(px + cellSize * 0.15, py + cellSize * 0.15, cellSize * 0.7, cellSize * 0.7);
    }
  }

  // ── Centres de villages ── croix blanche + nom
  const fontSize = Math.max(8, Math.min(cellSize * 1.1, 14));
  ctx.font         = `bold ${fontSize}px sans-serif`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'top';
  for (const vid of em.query('Position', 'Village')) {
    const vpos    = em.getComponent(vid, 'Position');
    const village = em.getComponent(vid, 'Village');
    const px = vpos.x * cellSize + cellSize / 2;
    const py = vpos.y * cellSize + cellSize / 2;
    const arm = Math.max(3, cellSize * 0.55);

    // Croix
    ctx.strokeStyle = village.color;
    ctx.lineWidth   = Math.max(1, cellSize * 0.14);
    ctx.beginPath(); ctx.moveTo(px - arm, py); ctx.lineTo(px + arm, py); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px, py - arm); ctx.lineTo(px, py + arm); ctx.stroke();

    // Nom sous la croix
    if (village?.groupId) {
      const ty = py + arm + 2;
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      const tw = ctx.measureText(village.groupId).width;
      ctx.fillRect(px - tw / 2 - 2, ty - 1, tw + 4, fontSize + 2);
      ctx.fillStyle = '#fff';
      ctx.fillText(village.groupId, px, ty);
    }
  }

  // ── Habitants ── dessinés par-dessus le terrain et les ressources
  const groupColors    = buildGroupColors(em);
  const inhabitantIds  = em.query('Position', 'Inhabitant', 'State');
  const borderW        = Math.max(1, Math.round(cellSize * 0.13));
  for (const id of inhabitantIds) {
    const pos   = em.getComponent(id, 'Position');
    const group = em.getComponent(id, 'Group');
    const px = pos.x * cellSize;
    const py = pos.y * cellSize;

    // Fond coloré (village)
    const vColor = groupColors[group?.groupId];
    if (vColor) {
      ctx.fillStyle = vColor + '55'; // ~33 % opacité
      ctx.fillRect(px, py, cellSize, cellSize);
    }

    drawSprite(ctx, group?.role, px, py, cellSize, cellSize);

    // Bordure village + chef
    if (vColor) {
      ctx.strokeStyle = group?.role === 'chief' ? '#ffd700' : vColor;
      ctx.lineWidth   = group?.role === 'chief' ? borderW * 2 : borderW;
      ctx.strokeRect(px + ctx.lineWidth / 2, py + ctx.lineWidth / 2,
                     cellSize - ctx.lineWidth, cellSize - ctx.lineWidth);
    }
  }

  // ── Effets de combat ── dessinés par-dessus tout
  if (battleEffects?.length) {
    drawBattleEffects(ctx, battleEffects, currentTick, cellSize);
  }

  // Highlight sélection — dessiné après (pour ne pas être écrasé)
  if (selected !== null && em) {
    const pos = em.getComponent(selected, 'Position');
    if (pos) {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth   = Math.max(1, cellSize * 0.12);
      ctx.strokeRect(
        pos.x * cellSize + ctx.lineWidth / 2,
        pos.y * cellSize + ctx.lineWidth / 2,
        cellSize - ctx.lineWidth,
        cellSize - ctx.lineWidth,
      );
    }
  }
}

// ── Composant ────────────────────────────────────────────────
export default function WBCanvas() {
  const { grid, tick, cellSize, selected, setSelected, engineRef } = useWB();
  const canvasRef = useRef(null);
  const [spritesReady, setSpritesReady] = useState(false);

  // Charge les sprites une seule fois au montage
  useEffect(() => {
    loadAllSprites(() => setSpritesReady(true));
  }, []);

  // Redessine à chaque tick ou changement de cellSize
  useEffect(() => {
    const engine = engineRef.current;
    if (engine?.em && spritesReady)
      draw(canvasRef.current, grid, engine.em, cellSize, selected,
           engine._battleEffects, engine._tickCount);
  }, [tick, grid, cellSize, selected, engineRef, spritesReady]);

  const handleClick = (e) => {
    if (!grid) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top)  / cellSize);
    const em = engineRef.current?.em;
    if (!em) return;

    // Priorité de sélection : habitant > village > ressource
    const atCell = (list) => list.find(id => {
      const p = em.getComponent(id, 'Position');
      return p.x === x && p.y === y;
    });
    const hit =
      atCell(em.query('Position', 'Inhabitant')) ??
      atCell(em.query('Position', 'Village'))    ??
      atCell(em.query('Position', 'Building'))   ??
      atCell(em.query('Position', 'Resource'))   ??
      null;
    setSelected(hit);
  };

  if (!grid) return null;

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      style={{ display: 'block', cursor: 'crosshair', imageRendering: 'pixelated' }}
    />
  );
}
