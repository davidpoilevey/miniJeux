// /src/components/WorldRenderer.jsx

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
// ICÔNES DE COMPOSANTS — chargement PNG depuis src/b11/assets/
// Placer les fichiers : Eye.png, Jaw.png, Mouth.png, Antenna.png,
//   Brain.png, GanglionCluster.png, Spine.png, Carapace.png,
//   Exoskeleton.png, ElectricOrgan.png, Heart.png, Notochord.png,
//   Bioluminescence.png, LateralLine.png, Chemoreceptor.png
// Les fichiers absents sont ignorés silencieusement.
// ============================================================

const _assetCtx = (() => {
  try { return require.context('../assets', false, /\.png$/); }
  catch (e) { return null; }
})();

const _iconCache = new Map();

function _getIcon(name) {
  if (_iconCache.has(name)) return _iconCache.get(name);
  let img = null;
  if (_assetCtx) {
    try {
      const src = _assetCtx(`./${name}.png`);
      img = new Image();
      img.src = src;
    } catch (e) { /* fichier absent — ignoré */ }
  }
  _iconCache.set(name, img);
  return img;
}

// Segment cible prioritaire par composant (premier segment disponible dans segCenters)
const COMPONENT_SEGMENT_PRIORITY = {
  Eye:           ['HEAD', 'MANTLE', 'BODY'],
  Jaw:           ['HEAD', 'MANTLE', 'BODY'],
  Mouth:         ['HEAD', 'MANTLE', 'BODY'],
  Antenna:       ['HEAD', 'THORAX'],
  Brain:         ['HEAD', 'MANTLE', 'BODY'],
  GanglionCluster: ['HEAD', 'THORAX'],
  Chemoreceptor: ['HEAD', 'BODY'],
  LateralLine:   ['BODY', 'HEAD'],
  Spine:         ['BODY', 'THORAX', 'ABDOMEN', 'MANTLE'],
  Carapace:      ['THORAX', 'BODY', 'MANTLE'],
  Exoskeleton:   ['THORAX', 'ABDOMEN', 'BODY'],
  ElectricOrgan: ['BODY', 'THORAX'],
  Heart:         ['BODY', 'THORAX', 'MANTLE'],
  Notochord:     ['BODY', 'THORAX'],
  Bioluminescence: ['BODY', 'THORAX', 'ABDOMEN'],
};

// ============================================================
// COMPOSANT
// ============================================================

const WorldRenderer = ({ engine, cellSize = 10 }) => {
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
    const worldState = engine.getWorldState();

    canvas.width  = worldState.width  * cellSize;
    canvas.height = worldState.height * cellSize;

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
      drawBiomes(ctx, engine.world, cellSize);

    // Panache hydrothermal
  const surge = engine.world.thermalSurge;
  if (surge) {
    drawThermalSurge(ctx, surge, cellSize);
  }

      // Organismes — au premier plan (par-dessus fond et effets thermaux)
      const organisms = engine.getOrganismsForRendering();
      for (let i = 0; i < organisms.length; i++) {
        drawOrganism(ctx, organisms[i], cellSize);
      }

      // Nuages d'encre — par-dessus les organismes (masquent la visibilité)
      drawInkClouds(ctx, engine.world.inkClouds, cellSize);
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

// Couleurs substrats — uniquement pour les solides (SEAFLOOR=1, ROCK=3)
// GROUND(2) et AIR(4) sont rendus via le système de biomes
const SUBSTRATE_COLORS = {
  1: '#1a3a5c',  // SEAFLOOR — fond marin sombre
  3: '#4a3728',  // ROCK     — rocher brun sombre
};

function drawBiomes(ctx, world, cellSize) {
  const tileSize = cellSize * BIOME_STEP;

  for (let y = 0; y < world.height; y += BIOME_STEP) {
    for (let x = 0; x < world.width; x += BIOME_STEP) {

      if (world.isSolid(x, y)) {
        // Substrat solide (SEAFLOOR, ROCK) : couleur fixe + relief
        const sub = world.getSubstrate(x, y);
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
        const biome = world.getBiome(x, y);
        const props = world.getBiomeProperties(biome);
        const light  = world.getLightAt(x, y);
        const lightBonus = Math.floor(light * 30);

        ctx.fillStyle = getBiomeColor(props.color, 0, lightBonus);
        ctx.fillRect(x * cellSize, y * cellSize, tileSize, tileSize);

        // Points nutrients — 1 point par cellule du tile selon densité
        const nutrients = world.getNutrients(x, y);
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

// Palette par embranchement : fill = corps, head = céphalon/apex, stroke = contour
const PHYLUM_PALETTE = {
  CHORDATA:   { fill: '#1a6ac8', head: '#3399ff', stroke: '#6aadff' },
  ARTHROPODA: { fill: '#a05010', head: '#cc7733', stroke: '#eeaa44' },
  MOLLUSCA:   { fill: '#772299', head: '#aa44dd', stroke: '#cc88ff' },
  VERMES:     { fill: '#cc2255', head: '#ee4477', stroke: '#ff99bb' },
  RADIATA:    { fill: '#007788', head: '#00aabb', stroke: '#44ddcc' },
  VEGETAL:    { fill: '#1a5c1a', head: '#33aa33', stroke: '#66ff66' },
};

/**
 * Point d'entrée — route vers le dessinateur par phylum.
 * Les bébés (growthFactor faible) sont semi-transparents.
 */
function drawOrganism(ctx, organism, cellSize) {
  const { position, bodyPlan, metabolism } = organism;
  if (!position || !bodyPlan) return;
  if (metabolism?.alive === false) return;

  const px  = (position.x + 0.5) * cellSize;
  const py  = (position.y + 0.5) * cellSize;
  const g   = bodyPlan.growthFactor ?? 0.05;
  const pal = PHYLUM_PALETTE[bodyPlan.phylum] ?? { fill: '#888', head: '#aaa', stroke: '#ccc' };

  ctx.save();
  ctx.globalAlpha = 0.55 + g * 0.45;

  // Appendices drawn BEFORE body segments (appear behind)
  const segCenters = _computeSegmentCenters(px, py, bodyPlan, cellSize);
  _drawAppendices(ctx, bodyPlan, cellSize, pal, segCenters);

  switch (bodyPlan.phylum) {
    case 'CHORDATA': _drawHorizontalSegments(ctx, px, py, bodyPlan, cellSize, pal); break;
    case 'VERMES':   _drawWorm(ctx, px, py, bodyPlan, cellSize, pal);               break;
    case 'RADIATA':  _drawRadiata(ctx, px, py, bodyPlan, cellSize, pal);            break;
    case 'VEGETAL':  _drawVegetal(ctx, px, py, bodyPlan, cellSize, pal);            break;
    default:         _drawVerticalSegments(ctx, px, py, bodyPlan, cellSize, pal);   // ARTHROPODA, MOLLUSCA
  }

  // Effets visuels spéciaux (glows, encre) — par-dessus le corps
  _drawOrganismEffects(ctx, px, py, cellSize, organism.activeComponents ?? []);

  // Icônes de composants par-dessus le corps
  _drawComponentIcons(ctx, organism, cellSize, segCenters);

  ctx.restore();
}

// ── CHORDATA : segments côte-à-côte (HEAD gauche → BODY droite) ───────────
// Convention : sz.h = étendue le long de l'axe de nage, sz.w = galbe transversal
function _drawHorizontalSegments(ctx, px, py, bodyPlan, cs, pal) {
  const segs = bodyPlan.segments ?? [];
  let totalLen = 0;
  for (const s of segs) {
    const sz = bodyPlan.segmentSizes?.[s];
    if (sz) totalLen += sz.h * cs;
  }
  let ox = -totalLen / 2;
  segs.forEach((s, i) => {
    const sz = bodyPlan.segmentSizes?.[s];
    if (!sz) return;
    const rx = Math.max(2, (sz.h * cs) / 2);
    const ry = Math.max(2, (sz.w * cs) / 2);
    ctx.fillStyle   = i === 0 ? pal.head : pal.fill;
    ctx.strokeStyle = pal.stroke;
    ctx.lineWidth   = Math.max(0.5, cs * 0.05);
    ctx.beginPath();
    ctx.ellipse(px + ox + rx, py, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ox += rx * 1.8;
  });
}

// ── ARTHROPODA, MOLLUSCA : segments empilés verticalement ─────────────────
function _drawVerticalSegments(ctx, px, py, bodyPlan, cs, pal) {
  const segs = bodyPlan.segments ?? [];
  let totalLen = 0;
  for (const s of segs) {
    const sz = bodyPlan.segmentSizes?.[s];
    if (sz) totalLen += sz.h * cs;
  }
  let oy = -totalLen / 2;
  segs.forEach((s, i) => {
    const sz = bodyPlan.segmentSizes?.[s];
    if (!sz) return;
    const rx = Math.max(2, (sz.w * cs) / 2);
    const ry = Math.max(2, (sz.h * cs) / 2);
    ctx.fillStyle   = i === 0 ? pal.head : pal.fill;
    ctx.strokeStyle = pal.stroke;
    ctx.lineWidth   = Math.max(0.5, cs * 0.05);
    ctx.beginPath();
    ctx.ellipse(px, py + oy + ry, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    oy += ry * 1.8;
  });
}

// ── VERMES : chaîne de segments de taille décroissante (tête → queue) ─────
function _drawWorm(ctx, px, py, bodyPlan, cs, pal) {
  const n   = bodyPlan.segmentCount ?? bodyPlan.segments?.length ?? 3;
  const sz0 = bodyPlan.segmentSizes?.[0] ?? { w: 0.35, h: 1 / Math.max(1, n) };
  const rx0 = Math.max(2, (sz0.w * cs) / 2);
  const ry0 = Math.max(2, (sz0.h * cs) / 2);
  const oy0 = -(n * ry0 * 1.8) / 2;
  for (let i = 0; i < n; i++) {
    const taper = 1 - i * (0.5 / Math.max(1, n));
    ctx.fillStyle   = i === 0 ? pal.head : pal.fill;
    ctx.strokeStyle = pal.stroke;
    ctx.lineWidth   = 0.5;
    ctx.beginPath();
    ctx.ellipse(px, py + oy0 + i * ry0 * 1.8 + ry0, rx0 * taper, ry0, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}

// ── RADIATA : cloche aplatie + tentacules pendants ─────────────────────────
function _drawRadiata(ctx, px, py, bodyPlan, cs, pal) {
  const sz = bodyPlan.segmentSizes?.['BODY'] ?? { w: 1, h: 0.45 };
  const rx = Math.max(3, (sz.w * cs) / 2);
  const ry = Math.max(2, (sz.h * cs) / 2);
  ctx.fillStyle   = pal.fill;
  ctx.strokeStyle = pal.stroke;
  ctx.lineWidth   = Math.max(0.5, cs * 0.05);
  ctx.beginPath();
  ctx.ellipse(px, py, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  const tentApp = (bodyPlan.appendices ?? []).find(a => a.type === 'Tentacle');
  const count   = tentApp ? tentApp.pairs * 2 : 6;
  ctx.strokeStyle = pal.stroke;
  ctx.lineWidth   = 0.5;
  const tentLen   = ry * 1.2;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(px + Math.cos(angle) * rx * 0.7, py + Math.sin(angle) * ry);
    ctx.lineTo(
      px + Math.cos(angle) * (rx * 0.7 + tentLen * 0.3),
      py + Math.sin(angle) * ry + tentLen
    );
    ctx.stroke();
  }
}

// ── VEGETAL : stipe vertical + branches latérales par étages ──────────────
function _drawVegetal(ctx, px, py, bodyPlan, cs, pal) {
  const sz    = bodyPlan.segmentSizes?.['BODY'] ?? { w: 0.3, h: 1.0 };
  const stemW = Math.max(1.5, (sz.w * cs) / 4);
  const stemH = Math.max(4, sz.h * cs);
  ctx.fillStyle   = pal.fill;
  ctx.strokeStyle = pal.stroke;
  ctx.lineWidth   = 0.5;
  ctx.beginPath();
  ctx.ellipse(px, py, stemW, stemH / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  const branches  = Math.min(8, bodyPlan.branchCount ?? 1);
  const branchLen = stemW * 3 + branches * stemW;
  ctx.strokeStyle = pal.head;
  ctx.lineWidth   = Math.max(0.5, stemW * 0.6);
  for (let i = 0; i < branches; i++) {
    const yOff = -stemH / 2 + (i + 0.5) * (stemH / branches);
    const dir  = i % 2 === 0 ? -1 : 1;
    ctx.beginPath();
    ctx.moveTo(px, py + yOff);
    ctx.lineTo(px + dir * branchLen, py + yOff - branchLen * 0.4);
    ctx.stroke();
  }
}

// ============================================================
// APPENDICES
// ============================================================

/**
 * Calcule les centres de chaque segment du plan corporel.
 * CHORDATA : layout horizontal (HEAD gauche → BODY droit).
 * Autres    : layout vertical  (tête haut → abdomen bas).
 * Retourne  { segName: { cx, cy, rx, ry }, ... }
 */
function _computeSegmentCenters(px, py, bodyPlan, cs) {
  const centers = {};
  const segs    = bodyPlan.segments ?? [];

  if (bodyPlan.phylum === 'CHORDATA') {
    let totalLen = 0;
    for (const s of segs) {
      const sz = bodyPlan.segmentSizes?.[s];
      if (sz) totalLen += sz.h * cs;
    }
    let ox = -totalLen / 2;
    for (const s of segs) {
      const sz = bodyPlan.segmentSizes?.[s];
      if (!sz) continue;
      const rx = Math.max(2, (sz.h * cs) / 2);
      const ry = Math.max(2, (sz.w * cs) / 2);
      centers[s] = { cx: px + ox + rx, cy: py, rx, ry };
      ox += rx * 1.8;
    }
  } else {
    let totalLen = 0;
    for (const s of segs) {
      const sz = bodyPlan.segmentSizes?.[s];
      if (sz) totalLen += sz.h * cs;
    }
    let oy = -totalLen / 2;
    for (const s of segs) {
      const sz = bodyPlan.segmentSizes?.[s];
      if (!sz) continue;
      const rx = Math.max(2, (sz.w * cs) / 2);
      const ry = Math.max(2, (sz.h * cs) / 2);
      centers[s] = { cx: px, cy: py + oy + ry, rx, ry };
      oy += ry * 1.8;
    }
  }

  return centers;
}

/**
 * Dispatche le dessin des appendices.
 * Appelé AVANT le corps pour que les appendices apparaissent derrière.
 * RADIATA  : tentacules déjà dessinés dans _drawRadiata — ignorés ici.
 * VEGETAL  : branches via branchCount, pas via appendices — ignoré ici.
 */
function _drawAppendices(ctx, bodyPlan, cs, pal, segCenters) {
  if (bodyPlan.phylum === 'RADIATA' || bodyPlan.phylum === 'VEGETAL') return;
  for (const app of (bodyPlan.appendices ?? [])) {
    if (app.type === 'Fin')      _drawFins(ctx, app, cs, pal, segCenters);
    if (app.type === 'Wing')     _drawWings(ctx, app, cs, pal, segCenters, bodyPlan.phylum);
    if (app.type === 'Leg') {
      // chordataLimb : membres tétrapodes en vue du dessus (haut/bas du corps horizontal)
      if (app.chordataLimb) _drawChordataLimbs(ctx, app, cs, pal, segCenters);
      else                  _drawLegs(ctx, app, cs, pal, segCenters);
    }
    if (app.type === 'Tentacle') _drawTentaclesApp(ctx, app, cs, pal, segCenters);
  }
}

// ── Nageoires — CHORDATA (corps horizontal) ───────────────────────────────
// Dessine : nageoire dorsale (triangle haut) + caudale (fourche droite) + pectorales si pairs≥2
function _drawFins(ctx, app, cs, pal, segCenters) {
  const seg = segCenters['BODY'] ?? segCenters['HEAD'];
  if (!seg) return;

  const sz = Math.max(cs * 0.4, seg.ry * (1.2 + (app.size ?? 0.5)));

  ctx.save();
  ctx.fillStyle   = pal.stroke;
  ctx.strokeStyle = pal.stroke;
  ctx.lineWidth   = 0.5;
  ctx.globalAlpha *= 0.7;

  // Nageoire dorsale — triangle pointant vers le haut
  ctx.beginPath();
  ctx.moveTo(seg.cx - sz * 0.5, seg.cy - seg.ry);
  ctx.lineTo(seg.cx + sz * 0.5, seg.cy - seg.ry);
  ctx.lineTo(seg.cx,            seg.cy - seg.ry - sz * 1.1);
  ctx.closePath();
  ctx.fill();

  // Nageoire caudale — deux triangles formant une fourche à droite
  const tx = seg.cx + seg.rx;
  const tf = Math.max(2, sz * 0.9);
  ctx.beginPath();
  ctx.moveTo(tx,            seg.cy);
  ctx.lineTo(tx + tf,       seg.cy - tf * 0.75);
  ctx.lineTo(tx + tf * 0.35, seg.cy);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(tx,            seg.cy);
  ctx.lineTo(tx + tf,       seg.cy + tf * 0.75);
  ctx.lineTo(tx + tf * 0.35, seg.cy);
  ctx.closePath();
  ctx.fill();

  // Nageoires pectorales — petites ellipses si pairs ≥ 2
  if ((app.pairs ?? 1) >= 2) {
    const pfx = seg.cx - seg.rx * 0.3;
    const pfh = Math.max(1.5, sz * 0.55);
    const pfw = Math.max(1.5, sz * 0.22);
    ctx.beginPath();
    ctx.ellipse(pfx, seg.cy - seg.ry - pfh * 0.35, pfw, pfh,  Math.PI * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(pfx, seg.cy + seg.ry + pfh * 0.35, pfw, pfh, -Math.PI * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ── Ailes — CHORDATA (haut/bas) ou ARTHROPODA (gauche/droite) ─────────────
function _drawWings(ctx, app, cs, pal, segCenters, phylum) {
  const seg = phylum === 'CHORDATA'
    ? (segCenters['BODY']   ?? segCenters['HEAD'])
    : (segCenters['THORAX'] ?? segCenters['BODY']);
  if (!seg) return;

  const wLen  = Math.max(cs * 0.7, (phylum === 'CHORDATA' ? seg.ry : seg.rx) * (2.5 + (app.size ?? 0.5) * 2));
  const wBase = Math.max(2, (phylum === 'CHORDATA' ? seg.rx : seg.ry) * 0.9);

  ctx.save();
  ctx.fillStyle   = pal.fill;
  ctx.strokeStyle = pal.stroke;
  ctx.lineWidth   = 0.5;
  ctx.globalAlpha *= 0.45;

  if (phylum === 'CHORDATA') {
    _wingTriangle(ctx,
      seg.cx - wBase * 0.4, seg.cy - seg.ry,
      seg.cx + wBase * 0.4, seg.cy - seg.ry,
      seg.cx,               seg.cy - seg.ry - wLen);
    _wingTriangle(ctx,
      seg.cx - wBase * 0.4, seg.cy + seg.ry,
      seg.cx + wBase * 0.4, seg.cy + seg.ry,
      seg.cx,               seg.cy + seg.ry + wLen);
  } else {
    _wingTriangle(ctx,
      seg.cx - seg.rx, seg.cy - wBase * 0.4,
      seg.cx - seg.rx, seg.cy + wBase * 0.4,
      seg.cx - seg.rx - wLen, seg.cy);
    _wingTriangle(ctx,
      seg.cx + seg.rx, seg.cy - wBase * 0.4,
      seg.cx + seg.rx, seg.cy + wBase * 0.4,
      seg.cx + seg.rx + wLen, seg.cy);
  }

  ctx.restore();
}

function _wingTriangle(ctx, x1, y1, x2, y2, x3, y3) {
  ctx.beginPath();
  ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
}

// ── Pattes — ARTHROPODA (corps vertical) ──────────────────────────────────
// Paires de lignes brisées de chaque côté du segment d'attache (THORAX / ABDOMEN)
function _drawLegs(ctx, app, cs, pal, segCenters) {
  const seg = segCenters[app.segment ?? 'THORAX'];
  if (!seg) return;

  const pairs  = Math.min(app.pairs ?? 1, 5);
  const legLen = Math.max(cs * 0.5, seg.rx * (1.5 + (app.size ?? 0.5) * 2));

  ctx.save();
  ctx.strokeStyle = pal.stroke;
  ctx.lineWidth   = Math.max(0.5, cs * 0.045);
  ctx.globalAlpha *= 0.9;

  const yStep = pairs > 1 ? (seg.ry * 1.5) / (pairs - 1) : 0;
  const yBase = seg.cy - (pairs > 1 ? seg.ry * 0.75 : 0);

  for (let p = 0; p < pairs; p++) {
    const rootY = yBase + p * yStep;
    // Patte gauche : racine → genou → pied
    ctx.beginPath();
    ctx.moveTo(seg.cx - seg.rx,                rootY);
    ctx.lineTo(seg.cx - seg.rx - legLen * 0.55, rootY + legLen * 0.38);
    ctx.lineTo(seg.cx - seg.rx - legLen,        rootY + legLen * 0.72);
    ctx.stroke();
    // Patte droite (miroir)
    ctx.beginPath();
    ctx.moveTo(seg.cx + seg.rx,                rootY);
    ctx.lineTo(seg.cx + seg.rx + legLen * 0.55, rootY + legLen * 0.38);
    ctx.lineTo(seg.cx + seg.rx + legLen,        rootY + legLen * 0.72);
    ctx.stroke();
  }

  ctx.restore();
}

// ── Membres tétrapodes — CHORDATA (vue du dessus, corps horizontal) ────────
// 2 paires distribuées le long du corps, s'étendant perpendiculairement (haut/bas).
// legLen basé sur ry (épaisseur transversale), pas rx (longueur), pour rester proportionné.
function _drawChordataLimbs(ctx, app, cs, pal, segCenters) {
  const seg = segCenters['BODY'] ?? segCenters['HEAD'];
  if (!seg) return;

  const pairs   = Math.min(app.pairs ?? 2, 4);
  const limbLen = Math.max(cs * 0.45, seg.ry * (2.2 + (app.size ?? 0.5) * 1.5));

  ctx.save();
  ctx.strokeStyle = pal.stroke;
  ctx.lineWidth   = Math.max(0.8, cs * 0.06);
  ctx.globalAlpha *= 0.9;

  // Distribue les paires le long de l'axe X, couvrant 80 % de la longueur du corps
  const spread = seg.rx * 0.8;
  const xStep  = pairs > 1 ? (spread * 2) / (pairs - 1) : 0;

  for (let p = 0; p < pairs; p++) {
    const ax = seg.cx - spread + p * xStep;
    // Membre dorsal (haut)
    ctx.beginPath();
    ctx.moveTo(ax,                  seg.cy - seg.ry);
    ctx.lineTo(ax + limbLen * 0.20, seg.cy - seg.ry - limbLen * 0.55);
    ctx.lineTo(ax + limbLen * 0.08, seg.cy - seg.ry - limbLen);
    ctx.stroke();
    // Membre ventral (bas, symétrique)
    ctx.beginPath();
    ctx.moveTo(ax,                  seg.cy + seg.ry);
    ctx.lineTo(ax + limbLen * 0.20, seg.cy + seg.ry + limbLen * 0.55);
    ctx.lineTo(ax + limbLen * 0.08, seg.cy + seg.ry + limbLen);
    ctx.stroke();
  }

  ctx.restore();
}

// ── Tentacules — MOLLUSCA (corps vertical) ────────────────────────────────
// Éventail vers le bas depuis la base du segment HEAD (ou MANTLE)
function _drawTentaclesApp(ctx, app, cs, pal, segCenters) {
  const seg = segCenters['HEAD'] ?? segCenters['MANTLE'] ?? Object.values(segCenters)[0];
  if (!seg) return;

  const count = (app.pairs ?? 2) * 2;
  const tLen  = Math.max(cs * 0.4, seg.ry * (1.5 + (app.size ?? 0.5)));

  ctx.save();
  ctx.strokeStyle = pal.stroke;
  ctx.lineWidth   = Math.max(0.5, cs * 0.035);
  ctx.globalAlpha *= 0.75;

  const baseY = seg.cy + seg.ry;
  for (let i = 0; i < count; i++) {
    const t    = count > 1 ? i / (count - 1) : 0.5;
    const xOff = (t - 0.5) * seg.rx * 1.5;
    ctx.beginPath();
    ctx.moveTo(seg.cx + xOff,         baseY);
    ctx.lineTo(seg.cx + xOff * 1.3,   baseY + tLen);
    ctx.stroke();
  }

  ctx.restore();
}

// ── Icônes de composants ── cercles autour du segment cible ──────────────
function _drawComponentIcons(ctx, organism, cs, segCenters) {
  const comps = organism.activeComponents;
  if (!comps?.length) return;

  // Grouper chaque composant vers son segment prioritaire disponible
  const groups = new Map();
  for (const comp of comps) {
    const prio = COMPONENT_SEGMENT_PRIORITY[comp];
    if (!prio) continue;
    const segName = prio.find(s => segCenters[s]);
    if (!segName) continue;
    if (!groups.has(segName)) groups.set(segName, []);
    groups.get(segName).push(comp);
  }
  if (!groups.size) return;

  const iconSize = Math.max(6, Math.min(cs * 0.75, 14));

  ctx.save();
  ctx.globalAlpha = 0.92; // icônes quasi-opaques par-dessus le corps

  for (const [segName, icons] of groups) {
    const seg = segCenters[segName];
    if (!seg) continue;
    const r = Math.max(seg.rx, seg.ry) + iconSize * 0.65;
    const n = icons.length;
    for (let i = 0; i < n; i++) {
      const angle = (2 * Math.PI * i / n) - Math.PI / 2; // commence en haut
      const ix = Math.round(seg.cx + Math.cos(angle) * r - iconSize / 2);
      const iy = Math.round(seg.cy + Math.sin(angle) * r - iconSize / 2);
      const img = _getIcon(icons[i]);
      if (img?.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, ix, iy, iconSize, iconSize);
      }
    }
  }

  ctx.restore();
}

// ============================================================
// EFFETS VISUELS PAR ORGANISME
// ============================================================

/**
 * Glows et marquages spéciaux selon les composants actifs.
 * Appelé à l'intérieur du ctx.save() de drawOrganism (globalAlpha déjà appliqué).
 */
function _drawOrganismEffects(ctx, px, py, cs, activeComponents) {
  if (!activeComponents.length) return;
  ctx.save();

  // Bioluminescence — halo cyan/bleu
  if (activeComponents.includes('Bioluminescence')) {
    const r = cs * 1.8;
    const g = ctx.createRadialGradient(px, py, r * 0.15, px, py, r);
    g.addColorStop(0,   'rgba(0, 255, 200, 0.50)');
    g.addColorStop(0.5, 'rgba(0, 180, 255, 0.20)');
    g.addColorStop(1,   'rgba(0, 80,  255, 0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
  }

  // ElectricOrgan — halo bleu électrique
  if (activeComponents.includes('ElectricOrgan')) {
    const r = cs * 1.4;
    const g = ctx.createRadialGradient(px, py, r * 0.1, px, py, r);
    g.addColorStop(0,   'rgba(180, 220, 255, 0.55)');
    g.addColorStop(0.4, 'rgba(80,  160, 255, 0.22)');
    g.addColorStop(1,   'rgba(20,   60, 255, 0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
  }

  // ToxinGland — halo vert venin
  if (activeComponents.includes('ToxinGland')) {
    const r = cs * 1.1;
    const g = ctx.createRadialGradient(px, py, r * 0.2, px, py, r);
    g.addColorStop(0,   'rgba(140, 255, 60, 0.45)');
    g.addColorStop(0.5, 'rgba(60,  200,  0, 0.18)');
    g.addColorStop(1,   'rgba(0,    80,  0, 0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
  }

  // Chromatophore — shimmer arc-en-ciel animé
  if (activeComponents.includes('Chromatophore')) {
    const r   = cs * 1.0;
    const hue = Math.floor(((performance.now() / 1800) % 1) * 360);
    ctx.fillStyle = `hsla(${hue}, 90%, 65%, 0.35)`;
    ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
  }

  // InkSac — tache sombre visible dans le corps
  if (activeComponents.includes('InkSac')) {
    ctx.fillStyle = 'rgba(15, 8, 35, 0.60)';
    const r = Math.max(2, cs * 0.20);
    ctx.beginPath(); ctx.arc(px, py - cs * 0.08, r, 0, Math.PI * 2); ctx.fill();
  }

  ctx.restore();
}

// ============================================================
// NUAGES VFX — encre / toxine / décharge électrique
// ============================================================

function drawInkClouds(ctx, inkClouds, cellSize) {
  if (!inkClouds?.length) return;
  ctx.save();

  for (const cloud of inkClouds) {
    const cx = (cloud.x + 0.5) * cellSize;
    const cy = (cloud.y + 0.5) * cellSize;
    const r  = cloud.radius * cellSize;
    const t  = cloud.type ?? 'ink';

    if (t === 'ink') {
      // ── Encre — nuage opaque sombre (aveuglant) ─────────────────
      const alpha = Math.min(0.72, (cloud.ttl / 40) * 0.72);
      const grad  = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0,   `rgba(8,  4, 25, ${alpha})`);
      grad.addColorStop(0.5, `rgba(15, 8, 40, ${(alpha * 0.65).toFixed(2)})`);
      grad.addColorStop(1,   'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();

    } else if (t === 'toxin') {
      // ── Toxine — brume verte persistante ────────────────────────
      const alpha = Math.min(0.55, (cloud.ttl / 25) * 0.55);
      const grad  = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0,   `rgba(60, 220, 30, ${alpha})`);
      grad.addColorStop(0.4, `rgba(40, 160, 10, ${(alpha * 0.7).toFixed(2)})`);
      grad.addColorStop(1,   'rgba(0, 80, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();

    } else if (t === 'electric') {
      // ── Décharge électrique — flash bref bleu-blanc + arcs ──────
      const life  = cloud.ttl / 5;   // 1.0 → 0.0 sur 5 ticks
      const alpha = life * 0.85;
      const grad  = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0,   `rgba(255, 255, 255, ${alpha})`);
      grad.addColorStop(0.3, `rgba(140, 210, 255, ${(alpha * 0.75).toFixed(2)})`);
      grad.addColorStop(1,   'rgba(20, 80, 255, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();

      // Arcs rayonnants pseudo-aléatoires (déterministes → stables entre frames)
      ctx.strokeStyle = `rgba(200, 240, 255, ${(alpha * 0.9).toFixed(2)})`;
      ctx.lineWidth   = Math.max(0.8, cellSize * 0.08);
      ctx.shadowColor = '#80cfff';
      ctx.shadowBlur  = 6;
      const arcCount = 6;
      for (let i = 0; i < arcCount; i++) {
        const angle  = (i / arcCount) * Math.PI * 2;
        const jitter = ((i * 7919 + cloud.ttl * 31) % 100) / 100 - 0.5;
        const midR   = r * (0.4 + jitter * 0.2);
        const midAng = angle + jitter * 0.6;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.quadraticCurveTo(
          cx + Math.cos(midAng) * midR, cy + Math.sin(midAng) * midR,
          cx + Math.cos(angle)  * r * 0.85, cy + Math.sin(angle) * r * 0.85
        );
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
    }
  }
  ctx.restore();
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

export default WorldRenderer;