import { useEffect, useRef, useState } from 'react';
import { Arrow, Circle, Layer, Line, Rect, Stage } from 'react-konva';
import {
  Box, Button, Checkbox, Divider, FormControlLabel, MenuItem, TextField, ThemeProvider, Typography, createTheme,
} from '@mui/material';
import {
  ELEMENTS, GRID, PALETTE, dragHandle, ejectVector, flipperTip, getHandles, insertVertex, removeVertex, smoothPath, translate,
} from './elements';
import { DEFAULT_SETTINGS } from './world';

const ACCENT = '#00e5ff';
const GHOST = '#ff9800';
const INVISIBLE = 'rgba(255,255,255,0.001)';   // invisible mais cliquable
const snapTo = (v, step) => Math.round(v / step) * step;
const isTyping = (e) => ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName);

// Une ligne par élément : lisible et diff-friendly une fois collé dans layouts/default.json
export const formatLayout = (layout) => [
  '{',
  `  "width": ${layout.width},`,
  `  "height": ${layout.height},`,
  `  "settings": ${JSON.stringify(layout.settings)},`,
  '  "elements": [',
  layout.elements.map((el) => `    ${JSON.stringify(el)}`).join(',\n'),
  '  ]',
  '}',
  '',
].join('\n');

// ─── État et actions de l'éditeur ────────────────────────────────────────────
export function useEditor(layout, setLayout, active) {
  const [selectedId, setSelectedId] = useState(null);
  const [placing, setPlacing] = useState(null);
  const [snap, setSnap] = useState(true);
  const history = useRef([]);
  const drag = useRef(null);
  const lastDblClick = useRef(0);
  const layoutRef = useRef(layout);
  layoutRef.current = layout;

  const selected = layout.elements.find((el) => el.id === selectedId) ?? null;
  const findEl = (id) => layoutRef.current.elements.find((el) => el.id === id);

  const commit = () => {
    history.current.push(layoutRef.current);
    if (history.current.length > 200) history.current.shift();
  };
  const undo = () => {
    const prev = history.current.pop();
    if (prev) setLayout(prev);
  };

  // Changement de niveau : on repart d'une page blanche
  const reset = () => {
    history.current = [];
    setSelectedId(null);
    setPlacing(null);
  };

  const setElements = (fn) => setLayout((l) => ({ ...l, elements: fn(l.elements) }));
  const updateElement = (id, fn) => setElements((els) => els.map((el) => (el.id === id ? fn(el) : el)));
  const snapPoint = ([x, y]) => (snap ? [snapTo(x, GRID), snapTo(y, GRID)] : [Math.round(x), Math.round(y)]);

  const nextId = (type) => {
    const n = layoutRef.current.elements.reduce((max, el) => {
      const m = el.id.match(new RegExp(`^${type}(\\d+)$`));
      return m ? Math.max(max, Number(m[1])) : max;
    }, 0);
    return `${type}${n + 1}`;
  };

  const add = (type, point) => {
    const el = { id: nextId(type), ...ELEMENTS[type].create(snapPoint(point)) };
    commit();
    setElements((els) => [...els, el]);
    setSelectedId(el.id);
    setPlacing(null);
  };

  const remove = (id) => {
    commit();
    setElements((els) => els.filter((el) => el.id !== id));
    setSelectedId(null);
  };

  const duplicate = (id) => {
    const el = findEl(id);
    if (!el || ELEMENTS[el.type].unique) return;
    const copy = { ...translate(el, 20, 20), id: nextId(el.type) };
    commit();
    setElements((els) => [...els, copy]);
    setSelectedId(copy.id);
  };

  const patchElement = (id, patch) => updateElement(id, (el) => ({ ...el, ...patch }));
  const patchSettings = (patch) => setLayout((l) => ({ ...l, settings: { ...l.settings, ...patch } }));

  // ── Pointeur ──
  const pointerDown = (elId, handle, p) => {
    if (placing) { add(placing, p); return; }
    if (!elId) { setSelectedId(null); return; }
    setSelectedId(elId);
    commit();
    drag.current = { id: elId, handle, start: p, original: findEl(elId), moved: false };
  };

  const pointerMove = (p) => {
    const d = drag.current;
    if (!d) return;
    d.moved = true;
    if (d.handle !== undefined) {
      updateElement(d.id, () => dragHandle(d.original, d.handle, p, snap));
      return;
    }
    // Déplacement global : c'est l'ancre (1er point ou centre) qui s'aligne sur la grille
    const [ax, ay] = d.original.path ? d.original.path[0] : [d.original.x, d.original.y];
    const [nx, ny] = snapPoint([ax + p[0] - d.start[0], ay + p[1] - d.start[1]]);
    updateElement(d.id, () => translate(d.original, nx - ax, ny - ay));
  };

  const pointerUp = () => {
    if (drag.current && !drag.current.moved) history.current.pop();   // simple clic : rien à annuler
    drag.current = null;
  };

  // Konva émet un dblclick pour chaque clic rapproché (un triple clic = 2 dblclick)
  const doubleClick = (elId, handle, p) => {
    const now = performance.now();
    if (now - lastDblClick.current < 500) return;
    lastDblClick.current = now;
    if (!findEl(elId)?.path) return;
    commit();
    updateElement(elId, (el) => (typeof handle === 'number' ? removeVertex(el, handle) : insertVertex(el, snapPoint(p))));
  };

  // ── Raccourcis clavier ──
  useEffect(() => {
    if (!active) return undefined;
    const onKey = (e) => {
      if (isTyping(e)) return;
      const mod = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();
      if (mod && key === 'z') { e.preventDefault(); undo(); return; }
      if (e.key === 'Escape') { setPlacing(null); setSelectedId(null); return; }
      if (!selectedId) return;
      if (mod && key === 'd') { e.preventDefault(); duplicate(selectedId); return; }
      if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); remove(selectedId); return; }
      const nudge = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
      if (nudge) {
        e.preventDefault();
        const s = e.shiftKey ? GRID : 1;
        if (!e.repeat) commit();
        updateElement(selectedId, (el) => translate(el, nudge[0] * s, nudge[1] * s));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return {
    selected, placing, setPlacing, snap, setSnap,
    pointerDown, pointerMove, pointerUp, doubleClick,
    remove, duplicate, undo, commit, reset, patchElement, patchSettings,
  };
}

// ─── Calque Konva posé sur le canvas Matter ──────────────────────────────────
// Matter dessine la table (reconstruite à chaque modif), Konva ne dessine que
// la sélection, les poignées et les zones cliquables.
function ElementShape({ el, selected }) {
  const common = {
    elId: el.id,
    stroke: selected ? ACCENT : INVISIBLE,
    strokeWidth: 2,
  };

  switch (el.type) {
    case 'wall':
    case 'target':
    case 'drain': {
      const shown = el.smooth ? smoothPath(el.path) : el.path;
      return (
        <>
          <Line points={shown.flat()} {...common} hitStrokeWidth={Math.max(16, (el.thickness ?? 8) + 8)} lineCap="round" lineJoin="round" />
          {selected && el.smooth && (
            <Line points={el.path.flat()} stroke={ACCENT} strokeWidth={1} dash={[3, 5]} opacity={0.6} listening={false} />
          )}
        </>
      );
    }
    case 'bumper':
      return <Circle x={el.x} y={el.y} radius={el.r + 3} fill={INVISIBLE} {...common} />;
    case 'hole': {
      const [vx, vy] = ejectVector(el);
      const len = el.eject * 4;
      return (
        <>
          <Circle x={el.x} y={el.y} radius={el.r + 3} fill={INVISIBLE} {...common} />
          <Arrow points={[el.x, el.y, el.x + vx * len, el.y + vy * len]} stroke={GHOST} fill={GHOST}
            strokeWidth={2} pointerLength={8} pointerWidth={8} opacity={selected ? 1 : 0.35} listening={false} />
        </>
      );
    }
    case 'flipper': {
      const tip = flipperTip(el);
      const up = flipperTip(el, true);
      return (
        <>
          <Line points={[el.x, el.y, ...up]} stroke={GHOST} strokeWidth={2} dash={[6, 4]} opacity={selected ? 0.9 : 0.3} listening={false} />
          <Line points={[el.x, el.y, ...tip]} {...common} hitStrokeWidth={22} lineCap="round" />
          <Circle x={el.x} y={el.y} radius={3} fill="#fff" listening={false} />
        </>
      );
    }
    case 'launcher':
      return <Rect x={el.x - 23} y={el.y - 10} width={46} height={20} fill={INVISIBLE} {...common} />;
    default:
      return null;
  }
}

function Grid({ width, height }) {
  const lines = [];
  for (let x = 0; x <= width; x += GRID * 5) lines.push(<Line key={`x${x}`} points={[x, 0, x, height]} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />);
  for (let y = 0; y <= height; y += GRID * 5) lines.push(<Line key={`y${y}`} points={[0, y, width, y]} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />);
  return lines;
}

export function EditorOverlay({ editor, layout }) {
  const { selected, placing, snap } = editor;
  const pos = (e) => {
    const p = e.target.getStage().getPointerPosition();
    return [p.x, p.y];
  };
  const target = (e) => [e.target.getAttr('elId'), e.target.getAttr('handle')];
  const setCursor = (e, cursor) => {
    const stage = e.target.getStage();
    if (stage && !placing) stage.container().style.cursor = cursor;
  };

  return (
    <Stage
      width={layout.width}
      height={layout.height}
      style={{ position: 'absolute', top: 0, left: 0, cursor: placing ? 'crosshair' : 'default' }}
      onPointerDown={(e) => editor.pointerDown(...target(e), pos(e))}
      onPointerMove={(e) => editor.pointerMove(pos(e))}
      onPointerUp={editor.pointerUp}
      onPointerLeave={editor.pointerUp}
      onDblClick={(e) => editor.doubleClick(...target(e), pos(e))}
    >
      {snap && (
        <Layer listening={false}>
          <Grid width={layout.width} height={layout.height} />
        </Layer>
      )}
      <Layer
        onMouseOver={(e) => setCursor(e, e.target.getAttr('handle') !== undefined ? 'crosshair' : 'move')}
        onMouseOut={(e) => setCursor(e, 'default')}
      >
        {layout.elements.map((el) => <ElementShape key={el.id} el={el} selected={el.id === selected?.id} />)}
        {selected && getHandles(selected).map((h) => (
          <Circle key={h.key} x={h.x} y={h.y} radius={6} fill={h.ghost || h.arrow ? GHOST : ACCENT}
            stroke="#fff" strokeWidth={1.5} elId={selected.id} handle={h.key} />
        ))}
      </Layer>
    </Stage>
  );
}

// ─── Panneau latéral ─────────────────────────────────────────────────────────
const darkTheme = createTheme({ palette: { mode: 'dark' } });

const FIELD_LABELS = {
  x: 'X', y: 'Y', r: 'Rayon', color: 'Couleur', hitColor: 'Couleur touchée',
  score: 'Points', kick: 'Kick (vitesse)', thickness: 'Épaisseur', smooth: 'Courbe lissée', bounce: 'Rebond',
  side: 'Côté', length: 'Longueur', angle: 'Angle repos (°)', swing: 'Course (°)',
  delay: 'Délai (ms)', eject: 'Force éjection', ejectAngle: 'Angle éjection (°)', message: 'Message', step: 'Objectif',
  gravity: 'Gravité', ballRadius: 'Rayon bille', ballBounce: 'Rebond bille',
  flipperUp: 'Flipper montée (°/tick)', flipperDown: 'Flipper retour (°/tick)', launchPower: 'Puissance lanceur',
};
const SKIP_FIELDS = ['id', 'type', 'path'];
const fieldSx = { width: '100%' };

function NumberField({ label, value, onChange, onFocus }) {
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);
  return (
    <TextField
      size="small" type="number" label={label} value={text} onFocus={onFocus} sx={fieldSx}
      inputProps={{ step: 'any' }}
      onChange={(e) => {
        setText(e.target.value);
        const n = parseFloat(e.target.value);
        if (!Number.isNaN(n)) onChange(n);
      }}
    />
  );
}

function Field({ name, value, onChange, onFocus }) {
  const label = FIELD_LABELS[name] ?? name;
  if (name === 'side') {
    return (
      <TextField select size="small" label={label} value={value} onFocus={onFocus} onChange={(e) => onChange(e.target.value)} sx={fieldSx}>
        <MenuItem value="left">Gauche</MenuItem>
        <MenuItem value="right">Droite</MenuItem>
      </TextField>
    );
  }
  if (typeof value === 'boolean') {
    return (
      <FormControlLabel
        label={<Typography fontSize={13}>{label}</Typography>}
        control={<Checkbox size="small" checked={value} onFocus={onFocus} onChange={(e) => onChange(e.target.checked)} />}
      />
    );
  }
  if (typeof value === 'number') return <NumberField label={label} value={value} onChange={onChange} onFocus={onFocus} />;
  if (/^#[0-9a-f]{6}$/i.test(value)) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <input type="color" value={value} onFocus={onFocus} onChange={(e) => onChange(e.target.value)}
          style={{ width: 36, height: 26, border: 'none', background: 'none', padding: 0, cursor: 'pointer' }} />
        <Typography fontSize={13}>{label}</Typography>
      </Box>
    );
  }
  return <TextField size="small" label={label} value={value ?? ''} onFocus={onFocus} onChange={(e) => onChange(e.target.value)} sx={fieldSx} />;
}

function Fields({ obj, onChange, onFocus }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.2, alignItems: 'center' }}>
      {Object.entries(obj).filter(([k]) => !SKIP_FIELDS.includes(k)).map(([k, v]) => (
        // Les textes libres (message…) prennent toute la largeur
        <Box key={k} sx={{ gridColumn: typeof v === 'string' && !v.startsWith('#') && k !== 'side' ? '1 / -1' : 'auto' }}>
          <Field name={k} value={v} onFocus={onFocus} onChange={(val) => onChange({ [k]: val })} />
        </Box>
      ))}
    </Box>
  );
}

const Section = ({ title, children }) => (
  <Box>
    <Typography sx={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>{title}</Typography>
    {children}
  </Box>
);

export function EditorPanel({ editor, layout, levelName, isSaved, onPlay, onRevert }) {
  const file = `layouts/${levelName}.json`;
  const { selected, placing, setPlacing, snap, setSnap } = editor;
  const [copied, setCopied] = useState(false);
  const hasLauncher = layout.elements.some((el) => el.type === 'launcher');

  const copy = () => {
    navigator.clipboard.writeText(formatLayout(layout)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={{
        width: 280, height: layout.height, overflowY: 'auto', boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column', gap: 2, px: 2, py: 2,
        bgcolor: '#12122a', borderLeft: '2px solid #2a2a5a', color: '#fff',
      }}>
        <Button variant="contained" onClick={onPlay} sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#3d8b40' }, fontWeight: 'bold' }}>
          ▶ Tester (E)
        </Button>

        <Section title={placing ? `Clique sur la table pour poser : ${ELEMENTS[placing].label}` : 'Ajouter'}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.75 }}>
            {PALETTE.filter((t) => !(ELEMENTS[t].unique && hasLauncher)).map((type) => (
              <Button key={type} size="small" variant={placing === type ? 'contained' : 'outlined'}
                onClick={() => setPlacing(placing === type ? null : type)}
                sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>
                {ELEMENTS[type].icon}&nbsp;{ELEMENTS[type].label}
              </Button>
            ))}
          </Box>
        </Section>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <FormControlLabel label={<Typography fontSize={13}>Grille</Typography>}
            control={<Checkbox size="small" checked={snap} onChange={(e) => setSnap(e.target.checked)} />} />
          <Button size="small" onClick={editor.undo}>↶ Annuler</Button>
        </Box>

        <Divider sx={{ borderColor: '#2a2a5a' }} />

        {selected ? (
          <Section title={`${ELEMENTS[selected.type].icon} ${ELEMENTS[selected.type].label} · ${selected.id}`}>
            <Fields obj={selected} onFocus={editor.commit} onChange={(patch) => editor.patchElement(selected.id, patch)} />
            <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
              {!ELEMENTS[selected.type].unique && (
                <Button size="small" variant="outlined" onClick={() => editor.duplicate(selected.id)}>Dupliquer</Button>
              )}
              <Button size="small" variant="outlined" color="error" onClick={() => editor.remove(selected.id)}>Supprimer</Button>
            </Box>
          </Section>
        ) : (
          <Section title="Réglages de la table">
            <Fields obj={{ ...DEFAULT_SETTINGS, ...layout.settings }} onFocus={editor.commit} onChange={editor.patchSettings} />
          </Section>
        )}

        <Divider sx={{ borderColor: '#2a2a5a' }} />

        <Section title="Sauvegarde">
          <Typography sx={{ fontSize: 12, color: isSaved ? '#4caf50' : '#f5a623', mb: 1 }}>
            {isSaved
              ? `✅ Identique à ${file}`
              : `✏️ Brouillon (gardé dans le navigateur). Copie le JSON dans ${file} pour le garder.`}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button size="small" variant="contained" onClick={copy}>{copied ? 'Copié !' : 'Copier le JSON'}</Button>
            {!isSaved && <Button size="small" color="warning" onClick={onRevert}>Revenir au fichier</Button>}
          </Box>
        </Section>

        <Typography sx={{ fontSize: 10.5, color: '#666', lineHeight: 1.7 }}>
          Clic : sélectionner · glisser : déplacer<br />
          Poignées bleues : forme · orange : flipper levé / éjection<br />
          Double-clic sur un mur : ajouter un point · sur un point : l'enlever<br />
          Flèches : décaler (Maj = ×10) · ⌘D dupliquer<br />
          Suppr : supprimer · ⌘Z annuler · Échap : désélectionner<br />
          En test : clic sur la table = bille téléportée
        </Typography>
      </Box>
    </ThemeProvider>
  );
}
