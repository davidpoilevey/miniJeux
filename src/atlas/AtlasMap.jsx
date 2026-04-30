import { useState, useEffect, useRef, useMemo, useCallback, forwardRef, useImperativeHandle } from 'react';

function computeFitVp(w, h) {
  const worldW = 2000;
  const worldH = 1600;
  const padding = 120;
  const zoomX = (w - padding * 2) / worldW;
  const zoomY = (h - padding * 2) / worldH;
  const zoom = Math.max(0.3, Math.min(1.5, Math.min(zoomX, zoomY)));
  return { zoom, tx: w / 2, ty: h / 2 };
}

const WORLD = { minX: -1400, maxX: 1400, minY: -900, maxY: 900 };
const GRID_STEP = 100;
const MAJOR_STEP = 500;

const tickX = [];
const tickY = [];
for (let x = WORLD.minX; x <= WORLD.maxX; x += GRID_STEP) tickX.push(x);
for (let y = WORLD.minY; y <= WORLD.maxY; y += GRID_STEP) tickY.push(y);

const AtlasMap = forwardRef(function AtlasMap(
  { layout, query, selectedTags, selectedId, onSelect, isMobileView, onVpChange },
  ref
) {
  const containerRef = useRef(null);
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [vp, setVpState] = useState(() => computeFitVp(window.innerWidth, window.innerHeight));
  const dragRef = useRef({ dragging: false });
  const vpRef = useRef(vp);

  const setVp = useCallback((updater) => {
    setVpState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      vpRef.current = next;
      return next;
    });
  }, []);

  useEffect(() => {
    onVpChange?.(vp);
  }, [vp]);

  useEffect(() => {
    const onR = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onR);
    return () => window.removeEventListener('resize', onR);
  }, []);

  const recenter = useCallback(() => {
    setVp(computeFitVp(size.w, size.h));
  }, [size, setVp]);

  const focusNode = useCallback((n) => {
    const currentZoom = vpRef.current.zoom;
    const z = Math.max(currentZoom, 1.3);
    setVp({ zoom: z, tx: size.w / 2 - n.x * z, ty: size.h / 2 - n.y * z });
  }, [size, setVp]);

  useImperativeHandle(ref, () => ({ recenter, focusNode, getVp: () => vpRef.current, setVp }), [recenter, focusNode, setVp]);

  // Pointer handlers
  const onPointerDown = useCallback((e) => {
    if (e.target.closest('.atlas-node')) return;
    const v = vpRef.current;
    dragRef.current = {
      dragging: true,
      startX: e.clientX, startY: e.clientY,
      startTx: v.tx, startTy: v.ty,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.classList.add('dragging');
  }, []);

  const onPointerMove = useCallback((e) => {
    const d = dragRef.current;
    if (!d.dragging) return;
    setVp(v => ({
      ...v,
      tx: d.startTx + (e.clientX - d.startX),
      ty: d.startTy + (e.clientY - d.startY),
    }));
  }, [setVp]);

  const onPointerUp = useCallback((e) => {
    dragRef.current.dragging = false;
    e.currentTarget.classList.remove('dragging');
  }, []);

  // Wheel : attacher en non-passive pour pouvoir appeler preventDefault
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e) => {
      e.preventDefault();
      const delta = -e.deltaY * 0.0015;
      setVp(v => {
        const newZoom = Math.max(0.3, Math.min(2.5, v.zoom * (1 + delta)));
        const rect = el.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;
        const k = newZoom / v.zoom;
        return { zoom: newZoom, tx: cx - (cx - v.tx) * k, ty: cy - (cy - v.ty) * k };
      });
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, [setVp]);

  const matchSet = useMemo(() => {
    const q = query.trim().toLowerCase();
    const set = new Set();
    layout.nodes.forEach(n => {
      if (isMobileView && !n.tags.includes('mobileFriendly')) return;
      if (!isMobileView && selectedTags.length > 0 && !selectedTags.every(t => n.tags.includes(t))) return;
      if (q && !(
        n.name.toLowerCase().includes(q) ||
        n.desc.toLowerCase().includes(q) ||
        n.tags.some(t => t.toLowerCase().includes(q))
      )) return;
      set.add(n.id);
    });
    return set;
  }, [layout, query, selectedTags, isMobileView]);

  const hasFilter = query || selectedTags.length || isMobileView;

  return (
    <div
      className="atlas-map-stage"
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <svg className="atlas-map-svg" width={size.w} height={size.h}>
        <g transform={`translate(${vp.tx} ${vp.ty}) scale(${vp.zoom})`}>
          {/* Grille */}
          {tickX.map(x => (
            <line key={`vx${x}`}
              x1={x} y1={WORLD.minY} x2={x} y2={WORLD.maxY}
              className={x % MAJOR_STEP === 0 ? 'atlas-grid-major' : 'atlas-grid-line'}
            />
          ))}
          {tickY.map(y => (
            <line key={`vy${y}`}
              x1={WORLD.minX} y1={y} x2={WORLD.maxX} y2={y}
              className={y % MAJOR_STEP === 0 ? 'atlas-grid-major' : 'atlas-grid-line'}
            />
          ))}

          {/* District blobs */}
          {layout.districts.map(d => (
            <circle key={d.label}
              cx={d.cx} cy={d.cy} r="260"
              fill={d.color}
              className="atlas-district-blob"
            />
          ))}

          {/* Constellations */}
          {layout.lines.map(l => (
            <line key={l.key}
              x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
              className="atlas-constellation-line"
            />
          ))}

          {/* District labels */}
          {layout.districts.map(d => (
            <text key={`t-${d.label}`}
              x={d.cx} y={d.cy - 240}
              className="atlas-district-label"
            >
              {d.label}
            </text>
          ))}

          {/* Nodes */}
          {layout.nodes.map(n => {
            const matched = matchSet.has(n.id);
            const dimmed = hasFilter && !matched;
            const isSel = n.id === selectedId;
            const r0 = 6 + (n.hiscore > 50000 ? 3 : 0);
            return (
              <g key={n.id}
                className={'atlas-node' + (dimmed ? ' dim' : '') + (isSel ? ' selected' : '')}
                transform={`translate(${n.x} ${n.y})`}
                style={{ '--c': n.district.color, '--r0': `${r0}px` }}
                onClick={(e) => { e.stopPropagation(); onSelect(n); }}
              >
                <circle className="pulse" r={r0} />
                <circle className="ring" r={r0} />
                <circle className="dot" r={r0 * 0.42} />
                <text className="label" y={-r0 - 7} textAnchor="middle">{n.name}</text>
                {n.hiscore > 0 && (
                  <text className="sub" y={r0 + 12} textAnchor="middle">★ {n.hiscore.toLocaleString()}</text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
});

export default AtlasMap;
