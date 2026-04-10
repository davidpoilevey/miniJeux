import { useRef, useEffect, useCallback } from 'react';
import { useGeo13 } from '../Geo13Context';
import { POSITIONED_EVENTS } from '../world/GeoEvents';
import { CELL_SIZE } from '../world/WorldGrid';
import { AllImageSources } from '../../civ/utils/imagesImports';
// Icônes FA Free Solid — Path2D créés une fois au niveau module (viewBox FA = width×512)
// Grass MUI (viewBox 24×24)
const GRASS_PATH  = new Path2D('M12 20H2v-2h5.75c-.73-2.81-2.94-5.01-5.75-5.74.64-.16 1.31-.26 2-.26 4.42 0 8 3.58 8 8m10-7.74c-.64-.16-1.31-.26-2-.26-2.93 0-5.48 1.58-6.88 3.93.29.66.53 1.35.67 2.07.13.65.2 1.32.2 2h8v-2h-5.75c.74-2.81 2.95-5.01 5.76-5.74m-6.36-1.24c.78-2.09 2.23-3.84 4.09-5C15.44 6.16 12 9.67 12 14v.02c.95-1.27 2.2-2.3 3.64-3m-4.22-2.17C10.58 6.66 8.88 4.89 6.7 4 8.14 5.86 9 8.18 9 10.71c0 .21-.03.41-.04.61.43.24.83.52 1.22.82.21-1.18.65-2.29 1.24-3.29');
// faFrog (viewBox 576×512)
const FROG_PATH   = new Path2D('M368 32c41.7 0 75.9 31.8 79.7 72.5l85.6 26.3c25.4 7.8 42.8 31.3 42.8 57.9c0 21.8-11.7 41.9-30.7 52.7L400.8 323.5 493.3 416l50.7 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-8.5 0-16.6-3.4-22.6-9.4L346.9 360.2c11.7-36 3.2-77.1-25.4-105.7c-40.6-40.6-106.3-40.6-146.9-.1L101 324.4c-6.4 6.1-6.7 16.2-.6 22.6s16.2 6.6 22.6 .6l73.8-70.2 .1-.1 .1-.1c3.5-3.5 7.3-6.6 11.3-9.2c27.9-18.5 65.9-15.4 90.5 9.2c24.7 24.7 27.7 62.9 9 90.9c-2.6 3.8-5.6 7.5-9 10.9L261.8 416l90.2 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L64 480c-35.3 0-64-28.7-64-64C0 249.6 127 112.9 289.3 97.5C296.2 60.2 328.8 32 368 32zm0 104a24 24 0 1 0 0-48 24 24 0 1 0 0 48z');
const FROG_W = 576; const FROG_H = 512;
// faDragon (viewBox 640×512)
const DRAGON_PATH = new Path2D('M352 124.5l-51.9-13c-6.5-1.6-11.3-7.1-12-13.8s2.8-13.1 8.7-16.1l40.8-20.4L294.4 28.8c-5.5-4.1-7.8-11.3-5.6-17.9S297.1 0 304 0L416 0l32 0 16 0c30.2 0 58.7 14.2 76.8 38.4l57.6 76.8c6.2 8.3 9.6 18.4 9.6 28.8c0 26.5-21.5 48-48 48l-21.5 0c-17 0-33.3-6.7-45.3-18.7L480 160l-32 0 0 21.5c0 24.8 12.8 47.9 33.8 61.1l106.6 66.6c32.1 20.1 51.6 55.2 51.6 93.1C640 462.9 590.9 512 530.2 512L496 512l-64 0L32.3 512c-3.3 0-6.6-.4-9.6-1.4C13.5 507.8 6 501 2.4 492.1C1 488.7 .2 485.2 0 481.4c-.2-3.7 .3-7.3 1.3-10.7c2.8-9.2 9.6-16.7 18.6-20.4c3-1.2 6.2-2 9.5-2.2L433.3 412c8.3-.7 14.7-7.7 14.7-16.1c0-4.3-1.7-8.4-4.7-11.4l-44.4-44.4c-30-30-46.9-70.7-46.9-113.1l0-45.5 0-57zM512 72.3c0-.1 0-.2 0-.3s0-.2 0-.3l0 .6zm-1.3 7.4L464.3 68.1c-.2 1.3-.3 2.6-.3 3.9c0 13.3 10.7 24 24 24c10.6 0 19.5-6.8 22.7-16.3zM130.9 116.5c16.3-14.5 40.4-16.2 58.5-4.1l130.6 87 0 27.5c0 32.8 8.4 64.8 24 93l-232 0c-6.7 0-12.7-4.2-15-10.4s-.5-13.3 4.6-17.7L171 232.3 18.4 255.8c-7 1.1-13.9-2.6-16.9-9s-1.5-14.1 3.8-18.8L130.9 116.5z');
const DRAGON_W = 640; const DRAGON_H = 512;

// ─────────────────────────────────────────────────────────────
// IMAGES
// ─────────────────────────────────────────────────────────────


const TERRAIN_COLORS = {
  eau:      '#1a5276',
  plaine:   '#7daa5e',
  foret:    '#1e6b30',
  montagne: '#7f8c8d',
  desert:   '#d4ac6e',
  marecage: '#9cae4f',
  riviere:  '#2980b9',
  glace:    '#dce9f5',
  neige:    '#e4eff7',
};

function loadTerrainImages(sources) {
  return new Promise((resolve) => {
    const images = {};
    let loaded = 0;
    const keys = Object.keys(sources);
    keys.forEach((key) => {
      const img = new Image();
      img.onload  = () => { images[key] = img; if (++loaded === keys.length) resolve(images); };
      img.onerror = () => {             if (++loaded === keys.length) resolve(images); };
      img.src = sources[key];
    });
  });
}

// ─────────────────────────────────────────────────────────────
// TERRAIN EFFECTIF (applique seaLevel sans muter la grille)
// ─────────────────────────────────────────────────────────────

function getEffectiveTerrain(cell, seaLevel) {
  if (cell.altitude < seaLevel) return 'eau';
  if (cell.isRiver)             return 'riviere';
  return cell.terrainType;
}

function drawCell(ctx, cell, images, seaLevel) {
  const terrain = getEffectiveTerrain(cell, seaLevel);
  const px = cell.x * CELL_SIZE;
  const py = cell.y * CELL_SIZE;
  const cs = CELL_SIZE;

  switch (terrain) {
    case 'marecage': {
       if (images.marecage) ctx.drawImage(images.marecage, px, py, cs, cs);
      else { 
      ctx.fillStyle = TERRAIN_COLORS.marecage; ctx.fillRect(px, py, cs, cs);
      }
      ctx.fillStyle = 'rgba(40, 110, 80, 0.42)';
      ctx.fillRect(px, py, cs, cs);
      break;
    }
    case 'riviere': {
      if (images.eau) ctx.drawImage(images.eau, px, py, cs, cs);
      else { ctx.fillStyle = TERRAIN_COLORS.riviere; ctx.fillRect(px, py, cs, cs); }
      ctx.fillStyle = 'rgba(100, 180, 255, 0.35)';
      ctx.fillRect(px, py, cs, cs);
      break;
    }
    case 'neige': {
      if (images.montagne) ctx.drawImage(images.montagne, px, py, cs, cs);
      else { ctx.fillStyle = TERRAIN_COLORS.neige; ctx.fillRect(px, py, cs, cs); }
      ctx.fillStyle = 'rgba(230, 245, 255, 0.60)';
      ctx.fillRect(px, py, cs, cs);
      break;
    }
    case 'glace': {
      ctx.fillStyle = TERRAIN_COLORS.glace;
      ctx.fillRect(px, py, cs, cs);
      ctx.fillStyle = 'rgba(200, 230, 255, 0.30)';
      ctx.fillRect(px, py, cs / 2, cs / 2);
      break;
    }
    default: {
      const img = images[terrain];
      if (img) {
        ctx.drawImage(img, px, py, cs, cs);
      } else {
        ctx.fillStyle = TERRAIN_COLORS[terrain] ?? '#555';
        ctx.fillRect(px, py, cs, cs);
      }
    }
  }
}

function drawGrid(ctx, grid, images, seaLevel) {
  for (let y = 0; y < grid.rows; y++) {
    for (let x = 0; x < grid.cols; x++) {
      const cell = grid.getCell(x, y);
      if (cell) drawCell(ctx, cell, images, seaLevel);
    }
  }
}

// ─────────────────────────────────────────────────────────────
// ENTITÉS (canvas transparent superposé)
// ─────────────────────────────────────────────────────────────

// Facteur de lerp par frame (~60fps) : atteint 95 % en ~200 ms
const LERP = 0.15;

function drawPlants(ctx, em) {
  const plants = em.query('Position', 'Plant', 'Genome');
  for (const id of plants) {
    const pos    = em.getComponent(id, 'Position');
    const plant  = em.getComponent(id, 'Plant');
    const genome = em.getComponent(id, 'Genome');
    const px = pos.x * CELL_SIZE;
    const py = pos.y * CELL_SIZE;
    const hue   = Math.round(160 - genome.handler.readFloat('teinte') * 80);
    const scale = (CELL_SIZE / 24) * (0.35 + (plant.biomass / 10) * 0.65);
    const off   = (CELL_SIZE - 24 * scale) / 2;
    ctx.save();
    ctx.translate(px + off, py + off);
    ctx.scale(scale, scale);
    ctx.fillStyle = `hsla(${hue}, 72%, 42%, 0.88)`;
    ctx.fill(GRASS_PATH);
    ctx.restore();
  }
}

function drawIconAt(ctx, path, vbW, vbH, px, py, sizeFactor, hue, sat, lit, alpha) {
  const scale = (CELL_SIZE / Math.max(vbW, vbH)) * sizeFactor;
  const offX  = (CELL_SIZE - vbW * scale) / 2;
  const offY  = (CELL_SIZE - vbH * scale) / 2;
  ctx.save();
  ctx.translate(px + offX, py + offY);
  ctx.scale(scale, scale);
  ctx.fillStyle = `hsla(${hue}, ${sat}%, ${lit}%, ${alpha})`;
  ctx.fill(path);
  ctx.restore();
}

function drawPredators(ctx, em) {
  const predators = em.query('Position', 'Predator', 'Genome');
  for (const id of predators) {
    const pos    = em.getComponent(id, 'Position');
    const genome = em.getComponent(id, 'Genome');

    if (pos.vx === undefined) { pos.vx = pos.x; pos.vy = pos.y; }
    pos.vx += (pos.x - pos.vx) * LERP;
    pos.vy += (pos.y - pos.vy) * LERP;

    const hue = Math.round(genome.handler.readFloat('teinte') * 30); // 0°–30° rouge-orange
    drawIconAt(ctx, DRAGON_PATH, DRAGON_W, DRAGON_H,
               pos.vx * CELL_SIZE, pos.vy * CELL_SIZE, 0.90, hue, 88, 52, 0.92);
  }
}

function drawHerbivores(ctx, em) {
  const herbivores = em.query('Position', 'Species', 'Genome');
  for (const id of herbivores) {
    const species = em.getComponent(id, 'Species');
    if (species.type !== 'herbivore') continue;

    const pos    = em.getComponent(id, 'Position');
    const genome = em.getComponent(id, 'Genome');

    if (pos.vx === undefined) { pos.vx = pos.x; pos.vy = pos.y; }
    pos.vx += (pos.x - pos.vx) * LERP;
    pos.vy += (pos.y - pos.vy) * LERP;

    const hue = Math.round(200 + genome.handler.readFloat('teinte') * 120); // 80°–140° vert
    drawIconAt(ctx, FROG_PATH, FROG_W, FROG_H,
               pos.vx * CELL_SIZE, pos.vy * CELL_SIZE, 0.80, hue, 82, 48, 0.990);
  }
}

// ─────────────────────────────────────────────────────────────
// COMPOSANT — deux canvases : terrain (statique) + entités (RAF)
// ─────────────────────────────────────────────────────────────

export default function Geo13Canvas({images}) {
  const { grid, seaLevel, gridVersion, engineRef, activeEvent, applyGeoEvent, cellSize, season } = useGeo13();
  const terrainRef = useRef(null);
  const entityRef  = useRef(null);
  const imagesRef  = useRef(null);
  const readyRef   = useRef(false); 
 
  // Chargement des images terrain
  useEffect(() => {
    
      imagesRef.current = images;
      readyRef.current  = true;
      // Déclenche un premier rendu terrain dès que les images sont là
      if (terrainRef.current && grid) {
        const canvas = terrainRef.current;
        canvas.width  = grid.cols * CELL_SIZE;
        canvas.height = grid.rows * CELL_SIZE;
        const ctx = canvas.getContext('2d');
        drawGrid(ctx, grid, images, seaLevel);
      }
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);

  // Redessine le terrain uniquement sur changement géologique
  useEffect(() => {
    if (!readyRef.current || !grid || !terrainRef.current) return;
    const canvas = terrainRef.current;
    canvas.width  = grid.cols * CELL_SIZE;
    canvas.height = grid.rows * CELL_SIZE;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx, grid, imagesRef.current, seaLevel);
  }, [grid, seaLevel, gridVersion]);

  // Synchronise la taille du canvas entités sur le terrain
  useEffect(() => {
    if (!grid || !entityRef.current) return;
    entityRef.current.width  = grid.cols * CELL_SIZE;
    entityRef.current.height = grid.rows * CELL_SIZE;
  }, [grid]);

  // Boucle RAF — redessine les entités à 60 fps avec interpolation
  useEffect(() => {
    if (!grid) return;
    let rafId;

    function animate() {
      const em     = engineRef.current?.em;
      const canvas = entityRef.current;
      if (em && canvas && canvas.width > 0) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawPlants(ctx, em);
        drawHerbivores(ctx, em);
        drawPredators(ctx, em);
      }
      rafId = requestAnimationFrame(animate);
    }

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [grid, engineRef]);

  // Clic → événement positionné (coordonnées compensées par le zoom)
  const handleClick = useCallback((e) => {
    if (!activeEvent || !POSITIONED_EVENTS.has(activeEvent)) return;
    const canvas = entityRef.current;
    if (!canvas) return;
    const rect  = canvas.getBoundingClientRect();
    // rect.width = canvas.width * zoomFactor → diviser par cellSize pour obtenir la cellule
    const cellX = Math.floor((e.clientX - rect.left) / cellSize);
    const cellY = Math.floor((e.clientY - rect.top)  / cellSize);
    applyGeoEvent(activeEvent, cellX, cellY);
  }, [activeEvent, applyGeoEvent, cellSize]);


  const isPlacing = activeEvent && POSITIONED_EVENTS.has(activeEvent);

  if (!grid) {
    return (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#4b5563', fontFamily: 'monospace',
      }}>
        Génération du monde…
      </div>
    );
  }

  const w = grid.cols * CELL_SIZE;
  const h = grid.rows * CELL_SIZE;
  const zoom = cellSize / CELL_SIZE;

  return (
    <div style={{ width: w * zoom, height: h * zoom, flexShrink: 0 }}>
      {/* Wrapper de transform : canvas dessinés à taille native, puis mis à l'échelle */}
      <div style={{ position: 'relative', width: w, height: h, transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
        {/* Couche 1 : terrain — ne redessine que sur événements géologiques */}
        <canvas
          ref={terrainRef}
          style={{ position: 'absolute', top: 0, left: 0, imageRendering: 'pixelated' }}
        />
        {/* Couche 2 : entités — RAF 60 fps, transparent */}
        <canvas
          ref={entityRef}
          onClick={handleClick}
          style={{
            position: 'absolute', top: 0, left: 0,
            imageRendering: 'pixelated',
            cursor: isPlacing ? 'crosshair' : 'default',
          }}
        />
        {/* Couche 3 : teinte saisonnière — overlay CSS, transitions douces */}
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          background: season?.tintColor ?? 'transparent',
          transition: 'background 4s ease',
          pointerEvents: 'none',
        }} />
      </div>
    </div>
  );
}
