import React, { useState, useRef, useMemo, useCallback } from 'react';
import { WORD_SETS } from './MotCacheData';
import fondTel from './images/fondTel.jpg';

const GRID_SIZE = 10;
const DIRS = [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]];
const WORD_COLORS = ['#7c3aed','#059669','#dc2626','#2563eb','#d97706','#0891b2','#be185d','#65a30d'];
const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// ─── génération de grille ────────────────────────────────────────────────────

function buildGrid(words) {
  const grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
  const placed = [];

  for (const word of words) {
    let ok = false;
    for (let attempt = 0; attempt < 400 && !ok; attempt++) {
      const [dr, dc] = DIRS[Math.floor(Math.random() * DIRS.length)];
      const r0 = Math.floor(Math.random() * GRID_SIZE);
      const c0 = Math.floor(Math.random() * GRID_SIZE);
      const cells = [];
      let valid = true;
      for (let i = 0; i < word.length; i++) {
        const r = r0 + dr * i, c = c0 + dc * i;
        if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) { valid = false; break; }
        if (grid[r][c] && grid[r][c] !== word[i]) { valid = false; break; }
        cells.push({ r, c });
      }
      if (valid) {
        cells.forEach(({ r, c }, i) => { grid[r][c] = word[i]; });
        placed.push({ word, cells });
        ok = true;
      }
    }
  }

  for (let r = 0; r < GRID_SIZE; r++)
    for (let c = 0; c < GRID_SIZE; c++)
      if (!grid[r][c]) grid[r][c] = ABC[Math.floor(Math.random() * ABC.length)];

  return { grid, placed };
}

// ─── direction snappée sur 8 axes ────────────────────────────────────────────

function snapDir(dr, dc) {
  if (!dr && !dc) return [0, 0];
  const angle = Math.atan2(dr, dc);
  const snapped = Math.round(angle * 4 / Math.PI) * Math.PI / 4;
  return [Math.round(Math.sin(snapped)), Math.round(Math.cos(snapped))];
}

function getLineCells(start, end) {
  const rawDr = end.r - start.r, rawDc = end.c - start.c;
  if (!rawDr && !rawDc) return [start];
  const [sdr, sdc] = snapDir(rawDr, rawDc);
  const len = Math.max(Math.abs(rawDr), Math.abs(rawDc));
  const cells = [];
  for (let i = 0; i <= len; i++) {
    const r = start.r + sdr * i, c = start.c + sdc * i;
    if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) cells.push({ r, c });
  }
  return cells;
}

// ─── style boutons ────────────────────────────────────────────────────────────

const btn = (extra = {}) => ({
  padding: '10px 16px', fontSize: 14, borderRadius: 12,
  cursor: 'pointer', fontWeight: 'bold', border: 'none', ...extra,
});

// ─── composant principal ──────────────────────────────────────────────────────

export default function MotsCaches() {
  const [setIndex, setSetIndex] = useState(0);
  const [foundWords, setFoundWords] = useState([]);
  const [selecting, setSelecting] = useState(false);
  const [startCell, setStartCell] = useState(null);
  const [currentCells, setCurrentCells] = useState([]);
  const [message, setMessage] = useState('');
  const [hintCell, setHintCell] = useState(null);
  const [abandoned, setAbandoned] = useState(false);
  const svgRef = useRef(null);
  const hintTimer = useRef(null);

  const currentSet = WORD_SETS[setIndex];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const { grid, placed } = useMemo(() => buildGrid(currentSet.words), [setIndex]);

  // taille de cellule responsive (calculée une fois)
  const CELL_PX = Math.floor((Math.min(window.innerWidth, 420) - 32) / GRID_SIZE);
  const GRID_PX = CELL_PX * GRID_SIZE;

  const remainingWords = currentSet.words.filter(w => !foundWords.includes(w));
  const allFound = remainingWords.length === 0;

  const nextSet = useCallback(() => {
    setSetIndex(i => (i + 1) % WORD_SETS.length);
    setFoundWords([]);
    setAbandoned(false);
    setHintCell(null);
    setCurrentCells([]);
    setSelecting(false);
    setMessage('');
  }, []);

  // ── coordonnées SVG → cellule ──

  const getSVGCell = (e) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const touch = e.touches?.[0] ?? e;
    const x = ((touch.clientX - rect.left) / rect.width) * GRID_PX;
    const y = ((touch.clientY - rect.top) / rect.height) * GRID_PX;
    const c = Math.floor(x / CELL_PX), r = Math.floor(y / CELL_PX);
    if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) return { r, c };
    return null;
  };

  // ── handlers drag ──

  const handleStart = (e) => {
    e.preventDefault();
    const cell = getSVGCell(e);
    if (!cell) return;
    setSelecting(true);
    setStartCell(cell);
    setCurrentCells([cell]);
    setMessage('');
    setHintCell(null);
  };

  const handleMove = (e) => {
    e.preventDefault();
    if (!selecting || !startCell) return;
    const cell = getSVGCell(e);
    if (cell) setCurrentCells(getLineCells(startCell, cell));
  };

  const handleEnd = (e) => {
    e.preventDefault();
    if (!selecting) return;
    setSelecting(false);

    const letters = currentCells.map(({ r, c }) => grid[r][c]);
    const forward = letters.join('');
    const backward = [...letters].reverse().join('');
    const match = placed.find(pw => pw.word === forward || pw.word === backward);

    if (match) {
      if (foundWords.includes(match.word)) {
        setMessage(`"${match.word}" déjà trouvé !`);
      } else {
        setFoundWords(prev => [...prev, match.word]);
        setMessage(`Bravo ! "${match.word}" ✨`);
      }
    } else if (currentCells.length > 1) {
      setMessage('Pas dans la liste...');
    }
    setCurrentCells([]);
  };

  // ── indice ──

  const handleIndice = () => {
    const unfound = placed.find(pw => !foundWords.includes(pw.word));
    if (!unfound) return;
    clearTimeout(hintTimer.current);
    setHintCell(unfound.cells[0]);
    hintTimer.current = setTimeout(() => setHintCell(null), 2500);
  };

  // ─── rendu SVG ────────────────────────────────────────────────────────────

  const cx = (c) => c * CELL_PX + CELL_PX / 2;
  const cy = (r) => r * CELL_PX + CELL_PX / 2;

  return (
    <div style={{
      minHeight: '100dvh',
      backgroundImage: `url(${fondTel})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: 12,
      overflowY: 'auto',
    }}>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        fontFamily: 'sans-serif', padding: '14px 12px 16px',
        width: '100%', maxWidth: 420,
        background: 'rgba(255,255,255,0.88)',
        borderRadius: 24,
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
      }}>

        <h2 style={{ fontSize: 20, margin: '0 0 2px' }}>🔍 Mots Cachés</h2>
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 10 }}>
          Thème : <strong style={{ color: '#4c1d95' }}>{currentSet.theme}</strong>
        </div>

        {/* ── Grille ── */}
        <svg
          ref={svgRef}
          viewBox={`0 0 ${GRID_PX} ${GRID_PX}`}
          style={{ width: '100%', maxWidth: GRID_PX, touchAction: 'none', cursor: 'crosshair', display: 'block' }}
          onMouseDown={handleStart} onMouseMove={handleMove} onMouseUp={handleEnd}
          onTouchStart={handleStart} onTouchMove={handleMove} onTouchEnd={handleEnd}
        >
          {/* fond blanc */}
          <rect x={0} y={0} width={GRID_PX} height={GRID_PX} fill="white" rx={4} />

          {/* lignes de grille */}
          {Array.from({ length: GRID_SIZE + 1 }, (_, i) => (
            <React.Fragment key={i}>
              <line x1={i * CELL_PX} y1={0} x2={i * CELL_PX} y2={GRID_PX} stroke="#e5e7eb" strokeWidth={1} />
              <line x1={0} y1={i * CELL_PX} x2={GRID_PX} y2={i * CELL_PX} stroke="#e5e7eb" strokeWidth={1} />
            </React.Fragment>
          ))}

          {/* surlignage mots trouvés */}
          {foundWords.map(word => {
            const pw = placed.find(p => p.word === word);
            if (!pw) return null;
            const color = WORD_COLORS[currentSet.words.indexOf(word) % WORD_COLORS.length];
            const f = pw.cells[0], l = pw.cells[pw.cells.length - 1];
            return (
              <line key={word}
                x1={cx(f.c)} y1={cy(f.r)} x2={cx(l.c)} y2={cy(l.r)}
                stroke={color} strokeWidth={CELL_PX * 0.82} strokeLinecap="round" opacity={0.35}
              />
            );
          })}

          {/* mots révélés après abandon */}
          {abandoned && placed.filter(pw => !foundWords.includes(pw.word)).map(pw => {
            const f = pw.cells[0], l = pw.cells[pw.cells.length - 1];
            return (
              <line key={pw.word}
                x1={cx(f.c)} y1={cy(f.r)} x2={cx(l.c)} y2={cy(l.r)}
                stroke="#9ca3af" strokeWidth={CELL_PX * 0.82} strokeLinecap="round" opacity={0.4}
              />
            );
          })}

          {/* sélection en cours */}
          {currentCells.map(({ r, c }) => (
            <rect key={`sel-${r}-${c}`}
              x={c * CELL_PX} y={r * CELL_PX} width={CELL_PX} height={CELL_PX}
              fill="#7c3aed" opacity={0.25}
            />
          ))}

          {/* lettres */}
          {grid.map((row, r) => row.map((letter, c) => {
            const pw = foundWords
              .map(w => placed.find(p => p.word === w))
              .find(p => p?.cells.some(cell => cell.r === r && cell.c === c));
            const foundColor = pw
              ? WORD_COLORS[currentSet.words.indexOf(pw.word) % WORD_COLORS.length]
              : null;
            const isHint = hintCell?.r === r && hintCell?.c === c;
            const isRevealed = abandoned && !foundColor &&
              placed.filter(p => !foundWords.includes(p.word))
                .some(p => p.cells.some(cell => cell.r === r && cell.c === c));

            return (
              <text key={`${r}-${c}`}
                x={cx(c)} y={r * CELL_PX + CELL_PX * 0.68}
                textAnchor="middle"
                fontSize={CELL_PX * 0.58}
                fontWeight={foundColor || isHint ? 'bold' : '600'}
                fill={foundColor || (isHint ? '#d97706' : isRevealed ? '#374151' : '#1e293b')}
              >
                {letter}
              </text>
            );
          }))}
        </svg>

        {/* ── Message ── */}
        <div style={{ minHeight: 26, fontSize: 16, fontWeight: 'bold', color: '#7c3aed', margin: '6px 0 4px' }}>
          {message}
        </div>

        {/* ── Chips des mots à trouver — scrollable ── */}
        <div style={{
          width: '100%', maxHeight: 110, overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          display: 'flex', flexWrap: 'wrap', gap: 6,
          justifyContent: 'center', padding: '2px 4px 4px',
          marginBottom: 8,
        }}>
          {currentSet.words.map((word, i) => {
            const found = foundWords.includes(word);
            const color = WORD_COLORS[i % WORD_COLORS.length];
            return (
              <span key={word} style={{
                borderRadius: 16, padding: '3px 12px', fontSize: 14, fontWeight: 'bold',
                background: found ? color : 'transparent',
                color: found ? 'white' : '#6b7280',
                border: `2px solid ${found ? color : '#d1d5db'}`,
                textDecoration: found ? 'line-through' : 'none',
                opacity: found ? 0.85 : 1,
              }}>{word}</span>
            );
          })}
        </div>

        {/* ── Score ── */}
        <div style={{ fontSize: 14, color: '#888', marginBottom: 10 }}>
          {foundWords.length} / {currentSet.words.length} mots trouvés
        </div>

        {/* ── Boutons ── */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {!allFound && !abandoned && (
            <button onClick={handleIndice}
              style={btn({ background: '#fef3c7', color: '#92400e', border: '2px solid #fcd34d' })}>
              💡 Indice
            </button>
          )}
          {!allFound && !abandoned && (
            <button onClick={() => { setAbandoned(true); setMessage(''); }}
              style={btn({ background: '#fee2e2', color: '#b91c1c', border: '2px solid #fca5a5' })}>
              🏳️ J'abandonne
            </button>
          )}
          {(allFound || abandoned) && (
            <button onClick={nextSet}
              style={btn({ background: '#7c3aed', color: 'white' })}>
              Suivant ➡️
            </button>
          )}
        </div>

        {allFound && (
          <div style={{ marginTop: 12, fontSize: 18, fontWeight: 'bold', color: '#059669' }}>
            🎉 Tous les mots trouvés !
          </div>
        )}
      </div>
    </div>
  );
}
