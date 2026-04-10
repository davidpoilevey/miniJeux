// /src/components/OrganismPortrait.jsx

import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';

const OrganismPortrait = ({ engine, entityId, size = 60 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || entityId == null) return;

    const plan = engine.getGrowthPlan(entityId);
    if (!plan?.length) return;

    drawPortrait(canvas, plan, size);
  }, [engine, entityId, size]);

  return (
    <Box sx={{
      width: size, height: size,
      borderRadius: '6px',
      overflow: 'hidden',
      border: '1px solid #1e3050',
      flexShrink: 0,
      bgcolor: '#050a10',
    }}>
      <canvas ref={canvasRef} width={size} height={size} />
    </Box>
  );
};

// ============================================================
// RENDU PORTRAIT
// ============================================================

function drawPortrait(canvas, plan, size) {
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = '#050a10';
  ctx.fillRect(0, 0, size, size);

  // ── Bounding box (coordonnées relatives, HEAD = 0,0)
  let minX = 0, maxX = 0, minY = 0, maxY = 0;
  for (const cell of plan) {
    if (cell.x < minX) minX = cell.x;
    if (cell.x > maxX) maxX = cell.x;
    if (cell.y < minY) minY = cell.y;
    if (cell.y > maxY) maxY = cell.y;
  }

  const spanX = maxX - minX + 1;
  const spanY = maxY - minY + 1;
  const span  = Math.max(spanX, spanY, 1);

  // Taille d'une cellule : s'adapte au span, plafonnée
  const padding  = size * 0.1;
  const cellSize = Math.max(2, Math.min(12, (size - padding * 2) / span));

  // Centrage
  const offsetX = (size - spanX * cellSize) / 2 - minX * cellSize;
  const offsetY = (size - spanY * cellSize) / 2 - minY * cellSize;

  for (const cell of plan) {
    const px = offsetX + cell.x * cellSize;
    const py = offsetY + cell.y * cellSize;
    ctx.save();
    drawMiniCell(ctx, px, py, cellSize, cell.role);
    ctx.restore();
  }
}

// ============================================================
// CELLULE MINIATURE
// ============================================================

const MINI_COLORS = {
  HEAD:     '#00cfff',
  SEGMENT:  '#00cc66',
  TAIL:     '#00aa55',
  SPINE:    '#ff4444',
  EYE:      '#cc88ff',
  JAW:      '#ff8800',
  TENTACLE: '#00ffcc',
  PEDUNCLE: '#aa8844',
  FILTER:   '#44ffaa',
  ANCHOR:   '#887755',
};

function drawMiniCell(ctx, x, y, size, role) {
  const color = MINI_COLORS[role] ?? '#446688';
  const half  = size / 2;
  const cx    = x + half;
  const cy    = y + half;
  const r     = Math.max(0.5, half - 0.5); // jamais négatif

  ctx.fillStyle   = color;
  ctx.strokeStyle = color;

  switch (role) {

    case 'HEAD':
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      if (r > 2) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(0.5, r * 0.25), 0, Math.PI * 2);
        ctx.fill();
      }
      break;

    case 'SEGMENT':
      if (size >= 3) {
        miniRoundRect(ctx, x + 0.5, y + 0.5, size - 1, size - 1, Math.max(0.5, size * 0.25));
        ctx.fill();
      } else {
        ctx.fillRect(x, y, size, size);
      }
      break;

    case 'SPINE':
      ctx.beginPath();
      ctx.moveTo(cx, y);
      ctx.lineTo(x + size, y + size);
      ctx.lineTo(x, y + size);
      ctx.closePath();
      ctx.fill();
      break;

    case 'TAIL':
      ctx.beginPath();
      ctx.moveTo(cx, y + size);
      ctx.lineTo(x + size, y);
      ctx.lineTo(x, y);
      ctx.closePath();
      ctx.fill();
      break;

    case 'EYE':
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      if (r > 2) {
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(0.5, r * 0.4), 0, Math.PI * 2);
        ctx.fill();
      }
      break;

    case 'JAW':
      ctx.fillRect(x, y, size, size * 0.6);
      if (size >= 4) {
        ctx.fillStyle = '#fff';
        const tw = size / 3;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(x + i * tw,        y + size * 0.6);
          ctx.lineTo(x + i * tw + tw/2, y + size);
          ctx.lineTo(x + (i+1) * tw,    y + size * 0.6);
          ctx.closePath();
          ctx.fill();
        }
      }
      break;

    case 'TENTACLE':
      ctx.lineWidth = Math.max(1, size * 0.2);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x, cy);
      ctx.bezierCurveTo(cx, y, cx, y + size, x + size, cy);
      ctx.stroke();
      break;

    case 'PEDUNCLE':
      ctx.lineWidth = Math.max(1, size * 0.25);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx, y);
      ctx.lineTo(cx, y + size);
      ctx.stroke();
      break;

    case 'FILTER':
      ctx.fillRect(x + 1, y + 2, size - 2, size - 3);
      if (size >= 5) {
        ctx.strokeStyle = '#aaffee';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < 3; i++) {
          const fx = x + 1 + i * ((size - 2) / 2);
          ctx.beginPath();
          ctx.moveTo(fx, y + 2);
          ctx.lineTo(fx, y);
          ctx.stroke();
        }
      }
      break;

    case 'ANCHOR':
      ctx.lineWidth = Math.max(1, size * 0.2);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx, y); ctx.lineTo(cx, y + size);
      ctx.moveTo(x, cy); ctx.lineTo(x + size, cy);
      ctx.stroke();
      break;

    default:
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
  }
}

function miniRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export default OrganismPortrait;
