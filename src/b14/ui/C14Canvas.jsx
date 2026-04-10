import { useRef, useEffect, useCallback } from 'react';
import { useC14, POSITIONED_EVENTS } from '../C14Context';
import { CELL_SIZE } from '../../b13/world/WorldGrid';
import { drawPlants, hitTestCell } from '../plants/PlantRenderer';

// ── Couleurs terrain ──────────────────────────────────────────────────────────

const TERRAIN_COLORS = {
  eau:      '#4d7a96',
  plaine:   '#b3bd70',
  foret:    '#1e6b30',
  montagne: '#979b9c',
  desert:   '#f0be72',
  marecage: '#bbb17c',
  riviere:  '#2980b9',
  glace:    '#dce9f5',
  neige:    '#b8cbd8',
};

function getEffectiveTerrain(cell, seaLevel) {
  if (cell.altitude < seaLevel) return 'eau';
  if (cell.isRiver)             return 'riviere';

  const { altitude, temperature, humidity } = cell;

  if (temperature < -8)                                    return 'glace';
  if ((altitude >= 30 && temperature < 3) || altitude >= 70) return 'neige';
  if (altitude >= 55)                                      return 'montagne';

  if (altitude < seaLevel + 10) {
    return humidity > 52 ? 'marecage' : 'plaine';
  }

  if (humidity < 26) return 'desert';
  if (humidity > 58) return 'foret';

  return humidity > 42 ? 'foret' : 'plaine';
}

function drawGrid(ctx, grid, seaLevel) {
  for (let y = 0; y < grid.rows; y++) {
    for (let x = 0; x < grid.cols; x++) {
      const cell = grid.getCell(x, y);
      if (!cell) continue;
      const terrain = getEffectiveTerrain(cell, seaLevel);
      ctx.fillStyle = TERRAIN_COLORS[terrain] ?? '#555';
      ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

      if (cell.altitude > 60 && terrain !== 'eau') {
        const shade = Math.min(1, Math.max(0.02, (cell.altitude - 40) / 30));
        ctx.fillStyle = `rgba(255,255,255,${shade})`;
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      } else if (cell.altitude < 40 && terrain !== 'eau') {
        const shade = (40 - cell.altitude) / 120;
        ctx.fillStyle = `rgba(0,0,0,${shade * 0.4})`;
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }
  }
}

// ── Composant principal ───────────────────────────────────────────────────────

export default function C14Canvas() {
  const {
    grid, seaLevel, gridVersion,
    plantsRef,
    cellSize,
    activeEvent, applyGeoEvent,
    selectedFlower, setSelectedFlower,
    setSelectedFruit,
  } = useC14();

  const canvasRef    = useRef(null);
  const flowerHitRef = useRef(new Map());
  const fruitHitRef  = useRef(new Map());

  // Refs pour que doRender soit stable (sans dépendances qui changent souvent)
  const gridRef            = useRef(grid);
  const seaLevelRef        = useRef(seaLevel);
  const selectedFlowerRef  = useRef(selectedFlower);

  useEffect(() => { gridRef.current = grid; },           [grid]);
  useEffect(() => { seaLevelRef.current = seaLevel; },   [seaLevel]);
  useEffect(() => { selectedFlowerRef.current = selectedFlower; }, [selectedFlower]);

  // ── Fonction de rendu unique : terrain + plantes sur un seul canvas ────────
  const doRender = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !gridRef.current || canvas.width === 0) return;
    const ctx = canvas.getContext('2d');
    drawGrid(ctx, gridRef.current, seaLevelRef.current);
    drawPlants(
      ctx,
      plantsRef.current,
      CELL_SIZE,
      selectedFlowerRef.current?.id ?? null,
      flowerHitRef.current,
      fruitHitRef.current,
    );
  }, [plantsRef]); // plantsRef est un ref stable

  // ── Taille du canvas ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!grid || !canvasRef.current) return;
    canvasRef.current.width  = grid.cols * CELL_SIZE;
    canvasRef.current.height = grid.rows * CELL_SIZE;
  }, [grid]);

  // ── Redessine immédiatement après un geoEvent ─────────────────────────────
  useEffect(() => {
    doRender();
  }, [gridVersion, doRender]);

  // ── Redessine immédiatement quand la sélection change (highlight fleur) ───
  useEffect(() => {
    doRender();
  }, [selectedFlower, doRender]);

  // ── Boucle de rendu à 800ms (plantes) ────────────────────────────────────
  useEffect(() => {
    if (!grid) return;
    doRender();
    const id = setInterval(doRender, 800);
    return () => clearInterval(id);
  }, [grid, doRender]);

  // ── Interaction (souris + touch) ──────────────────────────────────────────
  const pointerDownRef = useRef(null);

  const interactAt = useCallback((clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    if (activeEvent && POSITIONED_EVENTS.has(activeEvent)) {
      const cellX = Math.floor((clientX - rect.left) / cellSize);
      const cellY = Math.floor((clientY - rect.top)  / cellSize);
      applyGeoEvent(activeEvent, cellX, cellY);
      return;
    }

    const flowerHit = hitTestCell(clientX, clientY, rect, cellSize, flowerHitRef.current);
    if (flowerHit) {
      setSelectedFlower(flowerHit);
      setSelectedFruit(null);
      return;
    }
    const fruitHit = hitTestCell(clientX, clientY, rect, cellSize, fruitHitRef.current);
    if (fruitHit) {
      setSelectedFruit(fruitHit);
      setSelectedFlower(null);
      return;
    }
    setSelectedFlower(null);
    setSelectedFruit(null);
  }, [activeEvent, applyGeoEvent, cellSize, setSelectedFlower, setSelectedFruit]);

  const handlePointerDown = useCallback((e) => {
    pointerDownRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handlePointerUp = useCallback((e) => {
    const start = pointerDownRef.current;
    pointerDownRef.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.sqrt(dx * dx + dy * dy) > 10) return;
    interactAt(e.clientX, e.clientY);
  }, [interactAt]);

  if (!grid) {
    return (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#4b5563', fontFamily: 'monospace', fontSize: 14,
      }}>
        Génération du monde carbonifère…
      </div>
    );
  }

  const w    = grid.cols * CELL_SIZE;
  const h    = grid.rows * CELL_SIZE;
  const zoom = cellSize / CELL_SIZE;

  const isPlacing = activeEvent && POSITIONED_EVENTS.has(activeEvent);

  return (
    <div style={{ width: w * zoom, height: h * zoom, flexShrink: 0, position: 'relative' }}>
      <div style={{
        position: 'relative', width: w, height: h,
        transform: `scale(${zoom})`, transformOrigin: 'top left',
      }}>
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          style={{
            position: 'absolute', top: 0, left: 0,
            imageRendering: 'pixelated',
            cursor: isPlacing ? 'crosshair' : 'pointer',
            touchAction: 'manipulation',
          }}
        />
      </div>
    </div>
  );
}
