import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FileUploadIcon  from '@mui/icons-material/FileUpload';
import {
  Alert, Box, Button, ButtonGroup, Chip, IconButton,
  MenuItem, Select, Slider, Snackbar, TextField,
  Tooltip, Typography,
} from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SHEETS } from './sprites/spriteConfig';
import { getCalibrationData, saveCalibrationData } from './sprites/spriteEngine';

// ── Constantes visuelles ──────────────────────────────────────
const GRID_COLOR        = 'rgba(255,255,255,0.35)';
const HOVER_COLOR       = 'rgba(255,230,0,0.30)';
const MAPPED_COLOR      = 'rgba(0,230,100,0.30)';
const MAPPED_BORDER     = '#00e676';
const ATLAS_RECT_COLOR  = 'rgba(0,200,255,0.25)';
const ATLAS_RECT_BORDER = '#00c8ff';
const DRAWING_COLOR     = 'rgba(255,200,0,0.20)';
const DRAWING_BORDER    = '#ffc800';
const SELECT_BORDER     = '#fff176';

// Types disponibles pour l'assignation
const RESOURCE_TYPES = [
  '— plantes —',
  'arbre','champignon','fougere','baies','herbes','fleurs','fruits',
  'cactus','aloe','jonc','nenuphar','mousse','edelweiss','lichen','roseau',
  '— minéraux —',
  'or','fer','charbon','petrole','silex','argile','tourbe','sable','cristal',
  '— bâtiments —',
  'hutte','maison','villa','immeuble',
  'place_centrale','mairie','place_forte','chateau',
  'grenier','ferme','silo','plantation',
  'statue','temple','eglise','cathedrale',
  'bibliotheque','universite',
  'marche','port',
  'ecole','banque','librarie','tresor_royal',
  '— habitants —',
  'human','chief',
];

// ─────────────────────────────────────────────────────────────

export default function WBCalibrator() {
  const [sheetKey,     setSheetKey]     = useState(Object.keys(SHEETS)[0]);
  const [zoom,         setZoom]         = useState(2);
  const [allData,      setAllData]      = useState(getCalibrationData);
  const [hovered,      setHovered]      = useState(null);   // { col, row } ou { x, y }
  const [selected,     setSelected]     = useState(null);   // { col, row } grid
  const [assignValue,  setAssignValue]  = useState('');
  const [drawing,      setDrawing]      = useState(null);   // { sx,sy,ex,ey } px zoomed
  const [pendingRect,  setPendingRect]  = useState(null);   // { x,y,w,h } px original
  const [pendingName,  setPendingName]  = useState('');
  const [snack,        setSnack]        = useState('');

  const canvasRef = useRef(null);
  const imgRef    = useRef(null);
  const isDrawing = useRef(false);

  const sheet       = SHEETS[sheetKey];
  const sheetData   = allData[sheetKey] ?? {};   // mapping calibré pour cette sheet

  // ── Chargement de l'image ────────────────────────────────
  useEffect(() => {
    imgRef.current = null;
    const img = new Image();
    img.onload = () => { imgRef.current = img; redraw(); };
    img.src = sheet.src;
  }, [sheetKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Redraw ───────────────────────────────────────────────
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const img    = imgRef.current;
    if (!canvas || !img) return;

    const W = img.naturalWidth  * zoom;
    const H = img.naturalHeight * zoom;
    canvas.width  = W;
    canvas.height = H;

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0, W, H);

    if (sheet.mode === 'grid') {
      drawGrid(ctx, W, H, img, sheet, zoom, sheetData, hovered, selected);
    } else {
      drawAtlas(ctx, sheetData, zoom, hovered, drawing);
    }
  }, [zoom, sheet, sheetData, hovered, selected, drawing]);

  useEffect(() => { redraw(); }, [redraw]);

  // ── Sauvegarde ───────────────────────────────────────────
  const persist = (nextData) => {
    setAllData(nextData);
    saveCalibrationData(nextData);
  };

  // ── Handlers grid ────────────────────────────────────────
  const cellFromEvent = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const px   = e.clientX - rect.left;
    const py   = e.clientY - rect.top;
    const img  = imgRef.current;
    if (!img) return null;
    const tileW = (img.naturalWidth  * zoom) / sheet.cols;
    const tileH = (img.naturalHeight * zoom) / sheet.rows;
    return { col: Math.floor(px / tileW), row: Math.floor(py / tileH) };
  };

  const pixelFromEvent = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      zx: e.clientX - rect.left,
      zy: e.clientY - rect.top,
      ox: (e.clientX - rect.left) / zoom,  // original coords
      oy: (e.clientY - rect.top)  / zoom,
    };
  };

  const handleMouseMove = (e) => {
    if (sheet.mode === 'grid') {
      setHovered(cellFromEvent(e));
    } else {
      const { zx, zy } = pixelFromEvent(e);
      setHovered({ zx, zy });
      if (isDrawing.current) setDrawing(d => d ? { ...d, ex: zx, ey: zy } : d);
    }
  };

  const handleMouseLeave = () => setHovered(null);

  const handleClick = (e) => {
    if (sheet.mode !== 'grid') return;
    const cell = cellFromEvent(e);
    setSelected(cell);
    // Pré-remplit avec la valeur déjà assignée si elle existe
    const existing = sheetData[`${cell.col},${cell.row}`];
    setAssignValue(existing ?? '');
  };

  const handleMouseDown = (e) => {
    if (sheet.mode !== 'atlas') return;
    const { zx, zy } = pixelFromEvent(e);
    isDrawing.current = true;
    setDrawing({ sx: zx, sy: zy, ex: zx, ey: zy });
    setPendingRect(null);
    setPendingName('');
  };

  const handleMouseUp = (e) => {
    if (sheet.mode !== 'atlas' || !isDrawing.current) return;
    isDrawing.current = false;
    const { ox, oy } = pixelFromEvent(e);
    if (drawing) {
      const x = Math.min(drawing.sx, drawing.ex) / zoom;
      const y = Math.min(drawing.sy, drawing.ey) / zoom;
      const w = Math.abs(drawing.ex - drawing.sx) / zoom;
      const h = Math.abs(drawing.ey - drawing.sy) / zoom;
      if (w > 4 && h > 4) {
        setPendingRect({ x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) });
      }
      setDrawing(null);
    }
  };

  // ── Assignation ──────────────────────────────────────────
  const assignGrid = () => {
    if (!selected || !assignValue || assignValue.startsWith('—')) return;
    const key     = `${selected.col},${selected.row}`;
    const updated = { ...allData, [sheetKey]: { ...sheetData, [key]: assignValue } };
    persist(updated);
    setSelected(null);
    setAssignValue('');
  };

  const assignAtlas = () => {
    if (!pendingRect || !pendingName || pendingName.startsWith('—')) return;
    const updated = {
      ...allData,
      [sheetKey]: {
        ...sheetData,
        sprites: { ...(sheetData.sprites ?? {}), [pendingName]: pendingRect },
      },
    };
    persist(updated);
    setPendingRect(null);
    setPendingName('');
  };

  const removeEntry = (key) => {
    if (sheet.mode === 'grid') {
      const { [key]: _, ...rest } = sheetData;
      persist({ ...allData, [sheetKey]: rest });
    } else {
      const { [key]: _, ...rest } = (sheetData.sprites ?? {});
      persist({ ...allData, [sheetKey]: { ...sheetData, sprites: rest } });
    }
  };

  // ── Export / Import JSON ─────────────────────────────────
  const exportJSON = () => {
    const data  = sheet.mode === 'grid' ? sheetData : (sheetData.sprites ?? {});
    const text  = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(text);
    setSnack('JSON copié dans le presse-papiers !');
  };

  const importJSON = () => {
    const text = prompt('Colle le JSON ici :');
    if (!text) return;
    try {
      const parsed = JSON.parse(text);
      const updated = sheet.mode === 'grid'
        ? { ...allData, [sheetKey]: parsed }
        : { ...allData, [sheetKey]: { ...sheetData, sprites: parsed } };
      persist(updated);
      setSnack('Importé !');
    } catch { setSnack('JSON invalide.'); }
  };

  // ── Rendu ────────────────────────────────────────────────
  const gridEntries  = sheet.mode === 'grid'  ? Object.entries(sheetData) : [];
  const atlasSprites = sheet.mode === 'atlas' ? Object.entries(sheetData.sprites ?? {}) : [];
  const img          = imgRef.current;
  const tileW = img && sheet.mode === 'grid' ? Math.round(img.naturalWidth  / sheet.cols) : null;
  const tileH = img && sheet.mode === 'grid' ? Math.round(img.naturalHeight / sheet.rows) : null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', bgcolor: '#1a1a2e' }}>

      {/* ── Toolbar ── */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 1, flexWrap: 'wrap', borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Select size="small" value={sheetKey} onChange={e => { setSheetKey(e.target.value); setSelected(null); setPendingRect(null); }} sx={{ minWidth: 240 }}>
          {Object.entries(SHEETS).map(([k, s]) => (
            <MenuItem key={k} value={k}>{s.label}</MenuItem>
          ))}
        </Select>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 160 }}>
          <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>Zoom {zoom}×</Typography>
          <Slider size="small" min={1} max={5} step={0.5} value={zoom} onChange={(_, v) => setZoom(v)} sx={{ width: 100 }} />
        </Box>

        {tileW && <Typography variant="caption" color="text.secondary">{tileW}×{tileH}px / tile</Typography>}
        {img    && <Typography variant="caption" color="text.secondary">{img.naturalWidth}×{img.naturalHeight}px</Typography>}

        <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
          <Tooltip title="Importer JSON"><IconButton size="small" onClick={importJSON}><FileUploadIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Copier JSON"><Button size="small" variant="outlined" startIcon={<ContentCopyIcon />} onClick={exportJSON}>Export JSON</Button></Tooltip>
        </Box>
      </Box>

      {/* ── Corps principal ── */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', gap: 0 }}>

        {/* Canvas */}
        <Box sx={{ flex: 1, overflow: 'auto', bgcolor: '#111', p: 1 }}>
          <canvas
            ref={canvasRef}
            style={{ cursor: sheet.mode === 'grid' ? 'pointer' : 'crosshair', display: 'block' }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
          />
          {hovered && (
            <Typography variant="caption" sx={{ color: '#aaa', mt: 0.5, display: 'block' }}>
              {sheet.mode === 'grid'
                ? `Cellule (col ${hovered.col}, row ${hovered.row})`
                : `x=${Math.round(hovered.zx / zoom)}  y=${Math.round(hovered.zy / zoom)}`}
            </Typography>
          )}
        </Box>

        {/* Panneau latéral */}
        <Box sx={{ width: 280, display: 'flex', flexDirection: 'column', borderLeft: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', overflow: 'hidden' }}>

          {/* ── Assignment UI ── */}
          <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>

            {/* Grid mode */}
            {sheet.mode === 'grid' && (
              <>
                <Typography variant="caption" color="text.secondary">
                  {selected ? `Cellule (${selected.col}, ${selected.row})` : 'Cliquez une cellule'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                  <Select size="small" value={assignValue} onChange={e => setAssignValue(e.target.value)} displayEmpty sx={{ flex: 1 }}>
                    <MenuItem value=""><em>— choisir —</em></MenuItem>
                    {RESOURCE_TYPES.map(t => (
                      <MenuItem key={t} value={t} disabled={t.startsWith('—')} sx={t.startsWith('—') ? { opacity: 0.5, fontStyle: 'italic', fontSize: 11 } : {}}>{t}</MenuItem>
                    ))}
                  </Select>
                  <Button size="small" variant="contained" disabled={!selected || !assignValue || assignValue.startsWith('—')} onClick={assignGrid}>✓</Button>
                </Box>
              </>
            )}

            {/* Atlas mode */}
            {sheet.mode === 'atlas' && (
              <>
                <Typography variant="caption" color="text.secondary">
                  {pendingRect
                    ? `Rect : ${pendingRect.x},${pendingRect.y}  ${pendingRect.w}×${pendingRect.h}px`
                    : 'Cliquez-glissez pour dessiner un rectangle'}
                </Typography>
                {pendingRect && (
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                    <Select size="small" value={pendingName} onChange={e => setPendingName(e.target.value)} displayEmpty sx={{ flex: 1 }}>
                      <MenuItem value=""><em>— nommer —</em></MenuItem>
                      {RESOURCE_TYPES.map(t => (
                        <MenuItem key={t} value={t} disabled={t.startsWith('—')} sx={t.startsWith('—') ? { opacity: 0.5, fontStyle: 'italic', fontSize: 11 } : {}}>{t}</MenuItem>
                      ))}
                    </Select>
                    <Button size="small" variant="contained" disabled={!pendingName || pendingName.startsWith('—')} onClick={assignAtlas}>✓</Button>
                    <Button size="small" onClick={() => setPendingRect(null)}>✗</Button>
                  </Box>
                )}
              </>
            )}
          </Box>

          {/* ── Liste des assignments ── */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              {sheet.mode === 'grid' ? `${gridEntries.length} cellule(s) assignée(s)` : `${atlasSprites.length} sprite(s) défini(s)`}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {sheet.mode === 'grid' && gridEntries.map(([key, name]) => (
                <Chip key={key} size="small" label={`${name} (${key})`} color="success" variant="outlined"
                  onDelete={() => removeEntry(key)} />
              ))}
              {sheet.mode === 'atlas' && atlasSprites.map(([name, rect]) => (
                <Chip key={name} size="small"
                  label={`${name} [${rect.x},${rect.y} ${rect.w}×${rect.h}]`}
                  color="info" variant="outlined"
                  onDelete={() => removeEntry(name)} />
              ))}
            </Box>
          </Box>

          {/* ── Instructions ── */}
          <Box sx={{ p: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>
              {sheet.mode === 'grid'
                ? '1. Cliquez une cellule\n2. Choisissez le type\n3. Validez\nVert = assigné, Jaune = survol'
                : '1. Cliquez-glissez un rect\n2. Choisissez le type\n3. Validez\nBleu = défini'}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Snackbar open={!!snack} autoHideDuration={2500} onClose={() => setSnack('')}>
        <Alert severity="success" variant="filled" sx={{ width: '100%' }}>{snack}</Alert>
      </Snackbar>
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────
// FONCTIONS DE DESSIN (canvas)
// ─────────────────────────────────────────────────────────────

function drawGrid(ctx, W, H, img, sheet, zoom, sheetData, hovered, selected) {
  const tileW = W / sheet.cols;
  const tileH = H / sheet.rows;

  // Cellules assignées
  for (const [key, name] of Object.entries(sheetData)) {
    const [col, row] = key.split(',').map(Number);
    ctx.fillStyle = MAPPED_COLOR;
    ctx.fillRect(col * tileW, row * tileH, tileW, tileH);
    ctx.strokeStyle = MAPPED_BORDER;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(col * tileW + 1, row * tileH + 1, tileW - 2, tileH - 2);
    ctx.fillStyle   = '#fff';
    ctx.font        = `bold ${Math.max(9, tileW * 0.16)}px sans-serif`;
    ctx.textAlign   = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, col * tileW + tileW / 2, row * tileH + tileH / 2);
  }

  // Hover
  if (hovered) {
    ctx.fillStyle = HOVER_COLOR;
    ctx.fillRect(hovered.col * tileW, hovered.row * tileH, tileW, tileH);
  }

  // Sélection
  if (selected) {
    ctx.strokeStyle = SELECT_BORDER;
    ctx.lineWidth   = 2.5;
    ctx.setLineDash([4, 3]);
    ctx.strokeRect(selected.col * tileW + 1, selected.row * tileH + 1, tileW - 2, tileH - 2);
    ctx.setLineDash([]);
  }

  // Lignes de grille
  ctx.strokeStyle = GRID_COLOR;
  ctx.lineWidth   = 1;
  ctx.setLineDash([]);
  for (let c = 0; c <= sheet.cols; c++) {
    ctx.beginPath(); ctx.moveTo(c * tileW, 0); ctx.lineTo(c * tileW, H); ctx.stroke();
  }
  for (let r = 0; r <= sheet.rows; r++) {
    ctx.beginPath(); ctx.moveTo(0, r * tileH); ctx.lineTo(W, r * tileH); ctx.stroke();
  }

  // Indices col,row sur chaque cellule (petits)
  ctx.fillStyle    = 'rgba(255,255,255,0.4)';
  ctx.font         = `${Math.max(7, tileW * 0.12)}px monospace`;
  ctx.textAlign    = 'left';
  ctx.textBaseline = 'top';
  for (let r = 0; r < sheet.rows; r++) {
    for (let c = 0; c < sheet.cols; c++) {
      ctx.fillText(`${c},${r}`, c * tileW + 3, r * tileH + 3);
    }
  }
}

function drawAtlas(ctx, sheetData, zoom, hovered, drawing) {
  const sprites = sheetData.sprites ?? {};

  // Rects définis
  for (const [name, rect] of Object.entries(sprites)) {
    ctx.fillStyle   = ATLAS_RECT_COLOR;
    ctx.strokeStyle = ATLAS_RECT_BORDER;
    ctx.lineWidth   = 1.5;
    ctx.fillRect  (rect.x * zoom, rect.y * zoom, rect.w * zoom, rect.h * zoom);
    ctx.strokeRect(rect.x * zoom, rect.y * zoom, rect.w * zoom, rect.h * zoom);
    ctx.fillStyle    = '#fff';
    ctx.font         = `bold 11px sans-serif`;
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(name, rect.x * zoom + 3, rect.y * zoom + 2);
  }

  // Rectangle en cours de dessin
  if (drawing) {
    const x = Math.min(drawing.sx, drawing.ex);
    const y = Math.min(drawing.sy, drawing.ey);
    const w = Math.abs(drawing.ex - drawing.sx);
    const h = Math.abs(drawing.ey - drawing.sy);
    ctx.fillStyle   = DRAWING_COLOR;
    ctx.strokeStyle = DRAWING_BORDER;
    ctx.lineWidth   = 2;
    ctx.setLineDash([5, 3]);
    ctx.fillRect  (x, y, w, h);
    ctx.strokeRect(x, y, w, h);
    ctx.setLineDash([]);
    // Dimensions
    ctx.fillStyle    = DRAWING_BORDER;
    ctx.font         = '11px monospace';
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`${Math.round(w / zoom)}×${Math.round(h / zoom)}px`, x + 3, y - 2);
  }

  // Crosshair de position
  if (hovered && !drawing) {
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth   = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(hovered.zx, 0); ctx.lineTo(hovered.zx, ctx.canvas.height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, hovered.zy); ctx.lineTo(ctx.canvas.width, hovered.zy);  ctx.stroke();
    ctx.setLineDash([]);
  }
}
