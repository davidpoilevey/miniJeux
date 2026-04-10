// /src/components/OceanRenderer.jsx

import React, { useRef, useEffect } from 'react';

// ============================================================
// CACHE COULEURS BIOMES
// Clé : "hexString_nutrientBrightness_lightBonus"
// ============================================================
const biomeColorCache = new Map();

function getBiomeColor(baseColor, nutrientBrightness, lightBonus) {
  const key = `${baseColor}_${nutrientBrightness}_${lightBonus}`;
  let cached = biomeColorCache.get(key);
  if (cached) return cached;

  const rgb = hexToRgb(baseColor);
  const adjusted = adjustBrightness(rgb, nutrientBrightness + lightBonus);
  cached = rgbToString(adjusted);
  biomeColorCache.set(key, cached);
  return cached;
}

// ============================================================
// COMPOSANT
// ============================================================

const OceanRenderer = ({ engine, cellSize = 10 }) => {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    animationFrameId: null,
    lastFrameTime: 0,
    dirty: true,           // premier rendu forcé
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const oceanState = engine.getOceanState();

    canvas.width  = oceanState.width  * cellSize;
    canvas.height = oceanState.height * cellSize;

    const TARGET_FPS = 30;
    const FRAME_MS   = 1000 / TARGET_FPS;

    const state = stateRef.current;

    // L'engine peut signaler qu'il y a eu un changement
    // Si engine expose un flag, on le lit ; sinon on force dirty à chaque tick
    const markDirty = () => { state.dirty = true; };
    engine.onUpdate?.(markDirty); // hook optionnel côté engine

    const render = (timestamp) => {
      state.animationFrameId = requestAnimationFrame(render);

      const elapsed = timestamp - state.lastFrameTime;
      if (elapsed < FRAME_MS) return; // throttle 30fps
      state.lastFrameTime = timestamp - (elapsed % FRAME_MS); // drift correction

      // Si engine n'expose pas onUpdate, on considère toujours dirty
      if (!engine.onUpdate) state.dirty = true;

      if (!state.dirty) return;
      state.dirty = false;

      // Rendu
      drawBiomes(ctx, engine.ocean, cellSize);

    // Panache hydrothermal
  const surge = engine.ocean.thermalSurge;
  if (surge) {
    drawThermalSurge(ctx, surge, cellSize);
  }

      const organisms = engine.getOrganismsForRendering();
      for (let i = 0; i < organisms.length; i++) {
        drawOrganism(ctx, organisms[i], cellSize);
      }
    };

    state.animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(state.animationFrameId);
      engine.offUpdate?.(markDirty);
    };
  }, [engine, cellSize]);

  return (
    <div style={{ overflow: 'auto', width: '100%', height: '100%' }}>
      <canvas
        ref={canvasRef}
        style={{
          border: '2px solid #333',
          borderRadius: '4px',
          imageRendering: 'auto',
          display: 'block',   // évite le gap inline sous le canvas
        }}
      />
    </div>
  );
};

// ============================================================
// PANACHE HYDROTHERMAL
// ============================================================

function drawThermalSurge(ctx, surge, cellSize) {
  const { x, y, radius, intensity, ticksLeft, ticksMax } = surge;
  const cx = x * cellSize;
  const cy = y * cellSize;
  const r  = radius * cellSize;

  // Ratio de vie restante (1.0 → 0.0) pour fade-out
  const lifeRatio = ticksMax ? ticksLeft / ticksMax : 1;

  ctx.save();

  // ── Halo extérieur — chaleur diffuse
  const haloGrad = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r * 1.2);
  haloGrad.addColorStop(0,   `rgba(255, 80,  0, ${intensity * 0.15 * lifeRatio})`);
  haloGrad.addColorStop(0.6, `rgba(200, 40,  0, ${intensity * 0.08 * lifeRatio})`);
  haloGrad.addColorStop(1,   `rgba(100,  0,  0, 0)`);
  ctx.fillStyle = haloGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.2, 0, Math.PI * 2);
  ctx.fill();

  // ── Cœur — zone de mort
  const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  coreGrad.addColorStop(0,   `rgba(255, 240, 180, ${intensity * 0.9 * lifeRatio})`);
  coreGrad.addColorStop(0.2, `rgba(255, 140,  20, ${intensity * 0.7 * lifeRatio})`);
  coreGrad.addColorStop(0.5, `rgba(200,  50,   0, ${intensity * 0.45 * lifeRatio})`);
  coreGrad.addColorStop(1,   `rgba(100,   0,   0, 0)`);
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // ── Panache ascendant — colonnes de chaleur
  const t = performance.now() / 1000;
  const plumeCount = Math.ceil(radius / 4);
  for (let i = 0; i < plumeCount; i++) {
    const angle  = (i / plumeCount) * Math.PI * 2 + t * 0.3;
    const drift  = Math.sin(t * 1.5 + i * 1.3) * cellSize * 2;
    const px     = cx + Math.cos(angle) * radius * cellSize * 0.3 + drift;
    const height = r * (0.8 + Math.sin(t * 2 + i) * 0.2);

    const plumeGrad = ctx.createLinearGradient(px, cy, px, cy - height);
    plumeGrad.addColorStop(0,   `rgba(255, 160, 30, ${intensity * 0.6 * lifeRatio})`);
    plumeGrad.addColorStop(0.5, `rgba(255,  80, 10, ${intensity * 0.3 * lifeRatio})`);
    plumeGrad.addColorStop(1,   `rgba(150,  20,  0, 0)`);

    ctx.fillStyle = plumeGrad;
    ctx.beginPath();
    const w = cellSize * (1.5 + Math.sin(t + i) * 0.5);
    ctx.ellipse(px, cy - height * 0.5, w, height * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Anneau de choc — bord actif
  ctx.strokeStyle = `rgba(255, 200, 50, ${intensity * 0.5 * lifeRatio})`;
  ctx.lineWidth   = 1.5;
  ctx.shadowColor = '#ff8800';
  ctx.shadowBlur  = 8;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.85, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.restore();
}

// ============================================================
// BIOMES (fond)
// ============================================================

const BIOME_STEP = 5;

// Couleurs substrats (constantes, pas besoin de cache)
const SUBSTRATE_COLORS = {
  1: '#1a3a5c',  // fond marin — bleu-gris sombre
  2: '#c2a46e',  // plage — sable
  3: '#4a3728',  // rocher — brun sombre
};

function drawBiomes(ctx, ocean, cellSize) {
  const tileSize = cellSize * BIOME_STEP;

  for (let y = 0; y < ocean.height; y += BIOME_STEP) {
    for (let x = 0; x < ocean.width; x += BIOME_STEP) {
      const sub = ocean.getSubstrate(x, y);

      if (sub !== 0) {
        // Substrat solide : couleur fixe + légère variation de luminosité
        ctx.fillStyle = SUBSTRATE_COLORS[sub] ?? '#333';
        ctx.fillRect(x * cellSize, y * cellSize, tileSize, tileSize);

        // Relief : highlight sur le bord haut/gauche
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(x * cellSize, y * cellSize, tileSize, 2);
        ctx.fillRect(x * cellSize, y * cellSize, 2, tileSize);

        // Ombre sur bord bas/droite
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.fillRect(x * cellSize, (y + BIOME_STEP - 1) * cellSize, tileSize, cellSize);
        ctx.fillRect((x + BIOME_STEP - 1) * cellSize, y * cellSize, cellSize, tileSize);
      } else {
        // Eau : biome normal — luminosité basée sur la lumière uniquement
        const biome = ocean.getBiome(x, y);
        const props = ocean.getBiomeProperties(biome);
        const light  = ocean.getLightAt(x, y);
        const lightBonus = Math.floor(light * 30);

        ctx.fillStyle = getBiomeColor(props.color, 0, lightBonus);
        ctx.fillRect(x * cellSize, y * cellSize, tileSize, tileSize);

        // Points nutrients — 1 point par cellule du tile selon densité
        const nutrients = ocean.getNutrients(x, y);
        if (nutrients > 1) {
          const dotSize  = Math.max(1, Math.round(cellSize / 10));
          const density  = Math.min(1, nutrients / 40); // seuil max à 40
          const dotCount = Math.round(density * BIOME_STEP * BIOME_STEP * 0.25); // max 25% des cellules
          ctx.fillStyle  = `rgba(80, 255, 120, ${0.3 + density * 0.5})`;
          for (let d = 0; d < dotCount; d++) {
            // Position pseudo-aléatoire mais déterministe (pas de Math.random → stable entre frames)
            const seed = (x * 7 + y * 13 + d * 31) & 0xffff;
            const dx   = ((seed * 9301 + 49297) % 233280) / 233280 * tileSize;
            const dy   = ((seed * 4231 + 12345) % 233280) / 233280 * tileSize;
            ctx.fillRect(
              x * cellSize + dx,
              y * cellSize + dy,
              dotSize, dotSize
            );
          }
        }
      }
    }
  }
}

// ============================================================
// ORGANISMES
// ============================================================

function drawOrganism(ctx, organism, cellSize) {
  const { bodyPlan, metabolism } = organism;
  const stored = metabolism.energyStored ?? metabolism.maxEnergyStored ?? null;
  const max    = metabolism.maxEnergyStored ?? null;
  const energyRatio = (stored !== null && max > 0) ? Math.min(1, stored / max) : null;
  const cells = bodyPlan.cells;

  // --- Halo bioluminescent global (sous les cellules)
  const bio = organism.bioluminescence;
  if (bio) {
    const head = cells[0];
    if (head) {
      // Pulse selon pattern : 'steady' | 'pulse' | 'flash'
      const t = performance.now() / 1000;
      let pulse = bio.intensity ?? 0.8;
      if (bio.pattern === 'pulse') pulse *= 0.5 + 0.5 * Math.sin(t * 2);
      if (bio.pattern === 'flash') pulse *= Math.random() > 0.85 ? 1 : 0.1;

      ctx.save();
      const hx = head.x * cellSize;
      const hy = head.y * cellSize;
      const hr = (cells.length * 0.6 + 3) * cellSize; // rayon proportionnel à la taille
      const grad = ctx.createRadialGradient(hx, hy, 0, hx, hy, hr);
      grad.addColorStop(0,   `rgba(0, 255, 180, ${pulse * 0.35})`);
      grad.addColorStop(0.5, `rgba(0, 200, 255, ${pulse * 0.15})`);
      grad.addColorStop(1,   `rgba(0, 100, 200, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(hx, hy, hr, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    const absX = cell.x * cellSize;
    const absY = cell.y * cellSize;
    ctx.save();
    drawCell(ctx, absX, absY, cellSize, cell.role, isNaN(energyRatio) ? 1 : energyRatio);
    ctx.restore();
  }


  // Nuage d'encre
  const ink = organism.ink;
  if (ink?.inkCloud) {
    const { x, y, radius, opacity } = ink.inkCloud;
    ctx.save();
    const grad = ctx.createRadialGradient(
      x * cellSize, y * cellSize, 0,
      x * cellSize, y * cellSize, radius * cellSize
    );
    grad.addColorStop(0, `rgba(30, 0, 60, ${opacity * 0.85})`);
    grad.addColorStop(0.5, `rgba(60, 0, 100, ${opacity * 0.5})`);
    grad.addColorStop(1, `rgba(80, 20, 120, 0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x * cellSize, y * cellSize, radius * cellSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Contour haute énergie
  if (energyRatio > 0.7) {
    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      ctx.strokeRect(cell.x * cellSize, cell.y * cellSize, cellSize, cellSize);
    }
    ctx.restore();
  }
}

// Rôles qui bénéficient du shadowBlur (pièces nobles)
const GLOWING_ROLES = new Set(['HEAD', 'EYE', 'SPINE', 'JAW', 'TENTACLE', 'TAIL']);
// [hue, saturation, lightness_base, halo_color]
// ============================================================
const ROLE_STYLE = {
  HEAD:      { h: 195, s: 100, l: 70, halo: '#00cfff', haloSize: 10 },
  SEGMENT:   { h: 145, s:  80, l: 55, halo: '#00ff88', haloSize:  5 },
  TAIL:      { h: 160, s:  70, l: 50, halo: '#00dd77', haloSize:  4 },
  SPINE:     { h:   0, s: 100, l: 65, halo: '#ff4444', haloSize:  7 },
  EYE:       { h: 270, s: 100, l: 80, halo: '#cc88ff', haloSize: 12 },
  JAW:       { h:  25, s: 100, l: 60, halo: '#ff8800', haloSize:  6 },
  TENTACLE:  { h: 175, s:  90, l: 60, halo: '#00ffcc', haloSize:  6 },
  PEDUNCLE:  { h:  40, s:  60, l: 45, halo: '#aa7733', haloSize:  3 },
  FILTER:    { h: 150, s:  80, l: 60, halo: '#44ffaa', haloSize:  5 },
  ANCHOR:    { h:  20, s:  70, l: 40, halo: '#885522', haloSize:  3 },
  DEFAULT:   { h: 200, s:  30, l: 50, halo: '#445566', haloSize:  3 },
};

// ============================================================
// CELLULES PAR RÔLE — style bioluminescent
// Chaque appel est encadré par save/restore dans drawOrganism
// ============================================================

// Facteur de débordement : les cellules "débordent" sur leurs voisines
// pour créer une continuité organique. 0.72 = overlap de ~44% du rayon
const OVERFLOW = 1.02;

function drawCell(ctx, x, y, size, role, energyRatio) {
  const half = size / 2;
  const cx   = x + half;
  const cy   = y + half;
  const r    = Math.max(0.5, half * (1 + OVERFLOW));

  if (energyRatio === null) {
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  const style    = ROLE_STYLE[role] ?? ROLE_STYLE.DEFAULT;
  const l        = 40 + energyRatio * 35;
  const haloSize = style.haloSize * (0.5 + energyRatio * 0.8);

  if (GLOWING_ROLES.has(role)) {
    ctx.shadowColor = style.halo;
    ctx.shadowBlur  = haloSize;
  }

  switch (role) {

    case 'HEAD':
      ctx.fillStyle = `hsl(${style.h}, ${style.s}%, ${l}%)`;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 6;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(0.5, half * 0.28), 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'SEGMENT':
      ctx.fillStyle = `hsl(${style.h}, ${style.s}%, ${l}%)`;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'TAIL':
      ctx.fillStyle = `hsl(${style.h}, ${style.s}%, ${l}%)`;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.75, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'SPINE':
      ctx.fillStyle = `hsl(${style.h}, ${style.s}%, ${l}%)`;
      ctx.beginPath();
      ctx.moveTo(cx,                         y  - half * OVERFLOW);
      ctx.lineTo(x + size + half * OVERFLOW, y + size + half * OVERFLOW);
      ctx.lineTo(x       - half * OVERFLOW,  y + size + half * OVERFLOW);
      ctx.closePath();
      ctx.fill();
      break;

    case 'EYE':
      ctx.fillStyle = `hsl(${style.h}, ${style.s}%, ${l}%)`;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(0.5, half * 0.38), 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 4;
      ctx.shadowColor = '#ffffff';
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath();
      ctx.arc(cx - half * 0.2, cy - half * 0.2, Math.max(0.5, half * 0.18), 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'JAW': {
      const jawW    = size * (1 + OVERFLOW);
      const jawLeft = x - half * OVERFLOW;
      ctx.fillStyle = `hsl(${style.h}, ${style.s}%, ${l}%)`;
      ctx.fillRect(jawLeft, y - half * OVERFLOW, jawW, size * 0.65);
      ctx.fillStyle = `hsl(${style.h}, ${style.s}%, ${l + 10}%)`;
      const tw = jawW / 3;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(jawLeft + i * tw,          y + size * 0.65);
        ctx.lineTo(jawLeft + i * tw + tw / 2, y + size + half * OVERFLOW);
        ctx.lineTo(jawLeft + (i + 1) * tw,    y + size * 0.65);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }

    case 'TENTACLE':
      ctx.strokeStyle = `hsl(${style.h}, ${style.s}%, ${l}%)`;
      ctx.lineWidth   = size * 0.5;
      ctx.lineCap     = 'round';
      ctx.beginPath();
      ctx.moveTo(x - half * OVERFLOW, cy);
      ctx.bezierCurveTo(cx, y - half * OVERFLOW,
                        cx, y + size + half * OVERFLOW,
                        x + size + half * OVERFLOW, cy);
      ctx.stroke();
      ctx.fillStyle = `hsl(${style.h}, ${style.s}%, ${l + 15}%)`;
      ctx.beginPath();
      ctx.arc(x + size + half * OVERFLOW, cy, Math.max(0.5, half * 0.5), 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'PEDUNCLE':
      ctx.strokeStyle = `hsl(${style.h}, ${style.s}%, ${l}%)`;
      ctx.lineWidth   = size * 0.5;
      ctx.lineCap     = 'round';
      ctx.beginPath();
      ctx.moveTo(cx, y  - half * OVERFLOW);
      ctx.lineTo(cx, y + size + half * OVERFLOW);
      ctx.stroke();
      break;

    case 'FILTER':
      ctx.fillStyle = `hsl(${style.h}, ${style.s}%, ${l - 10}%)`;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `hsl(${style.h}, ${style.s}%, ${l + 20}%)`;
      ctx.lineWidth = 0.8;
      for (let i = 0; i < 5; i++) {
        const fx = x + 1 + i * ((size - 2) / 4);
        ctx.beginPath();
        ctx.moveTo(fx, y + 2);
        ctx.lineTo(fx, y - half * OVERFLOW);
        ctx.stroke();
      }
      break;

    case 'ANCHOR':
      ctx.strokeStyle = `hsl(${style.h}, ${style.s}%, ${l}%)`;
      ctx.lineWidth   = size * 0.35;
      ctx.lineCap     = 'round';
      ctx.beginPath();
      ctx.moveTo(cx, y  - half * OVERFLOW); ctx.lineTo(cx, y + size + half * OVERFLOW);
      ctx.moveTo(x - half * OVERFLOW, cy);  ctx.lineTo(x + size + half * OVERFLOW, cy);
      ctx.stroke();
      break;

    default:
      ctx.fillStyle = `hsl(${style.h}, ${style.s}%, ${l}%)`;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
  }

  ctx.shadowBlur = 0;
}

// ============================================================
// HELPER — rect à coins arrondis (compatible tous navigateurs)
// ============================================================
function roundRect(ctx, x, y, w, h, r) {
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

// ============================================================
// UTILS
// ============================================================

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 0, g: 0, b: 0 };
}

function adjustBrightness(rgb, amount) {
  return {
    r: Math.min(255, Math.max(0, rgb.r + amount)),
    g: Math.min(255, Math.max(0, rgb.g + amount)),
    b: Math.min(255, Math.max(0, rgb.b + amount))
  };
}

function rgbToString({ r, g, b }) {
  return `rgb(${r}, ${g}, ${b})`;
}

export default OceanRenderer;