import React, { useState, useRef, useCallback } from 'react';
import { WORD_SETS } from './AnagramData';
import fondTel from './images/fondTel.jpg';

const CIRCLE_RADIUS = 110;
const CENTER = { x: 160, y: 160 };

const getLetterPositions = (letters) =>
  letters.map((letter, i) => {
    const angle = (2 * Math.PI * i) / letters.length - Math.PI / 2;
    return {
      letter,
      x: CENTER.x + CIRCLE_RADIUS * Math.cos(angle),
      y: CENTER.y + CIRCLE_RADIUS * Math.sin(angle),
      index: i,
    };
  });

const btn = (extra = {}) => ({
  padding: '12px 20px', fontSize: 15, borderRadius: 12,
  cursor: 'pointer', fontWeight: 'bold', border: 'none',
  ...extra,
});

export default function AnagramGame() {
  const [setIndex, setSetIndex] = useState(0);
  const [foundWords, setFoundWords] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [message, setMessage] = useState('');
  const [currentPos, setCurrentPos] = useState(null);
  const [hintIndex, setHintIndex] = useState(null);
  const [abandoned, setAbandoned] = useState(false);
  const svgRef = useRef(null);
  const hintTimer = useRef(null);

  const currentSet = WORD_SETS[setIndex];
  const positions = getLetterPositions(currentSet.letters);
  const remainingWords = currentSet.words.filter(w => !foundWords.includes(w));
  const allFound = remainingWords.length === 0;

  const reset = useCallback(() => {
    setCurrentPath([]);
    setIsDragging(false);
    setCurrentPos(null);
    setMessage('');
    setHintIndex(null);
  }, []);

  const nextSet = useCallback(() => {
    setSetIndex(i => (i + 1) % WORD_SETS.length);
    setFoundWords([]);
    setAbandoned(false);
    setHintIndex(null);
    reset();
  }, [reset]);

  const getSVGPoint = (e) => {
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const touch = e.touches?.[0] ?? e;
    return {
      x: ((touch.clientX - rect.left) / rect.width) * 320,
      y: ((touch.clientY - rect.top) / rect.height) * 320,
    };
  };

  const getHitLetter = (pt) =>
    positions.find(p => {
      const dx = p.x - pt.x, dy = p.y - pt.y;
      return Math.sqrt(dx * dx + dy * dy) < 28;
    });

  const handleStart = (e) => {
    e.preventDefault();
    const pt = getSVGPoint(e);
    const hit = getHitLetter(pt);
    if (hit) {
      setIsDragging(true);
      setCurrentPath([hit]);
      setCurrentPos(pt);
      setMessage('');
      setHintIndex(null);
    }
  };

  const handleMove = (e) => {
    e.preventDefault();
    if (!isDragging) return;
    const pt = getSVGPoint(e);
    setCurrentPos(pt);
    const hit = getHitLetter(pt);
    if (hit && !currentPath.find(p => p.index === hit.index)) {
      setCurrentPath(prev => [...prev, hit]);
    }
  };

  const handleEnd = (e) => {
    e.preventDefault();
    if (!isDragging) return;
    setIsDragging(false);
    setCurrentPos(null);

    if (currentPath.length < 3) { reset(); return; }

    const word = currentPath.map(p => p.letter).join('');
    if (currentSet.words.includes(word)) {
      if (foundWords.includes(word)) {
        setMessage(`"${word}" déjà trouvé !`);
      } else {
        setFoundWords(prev => [...prev, word]);
        setMessage(`Bravo ! "${word}" ✨`);
      }
    } else {
      setMessage(`"${word}" n'est pas dans la liste...`);
    }
    setCurrentPath([]);
  };

  const handleIndice = () => {
    const unfound = currentSet.words.find(w => !foundWords.includes(w));
    if (!unfound) return;
    const idx = currentSet.letters.indexOf(unfound[0]);
    clearTimeout(hintTimer.current);
    setHintIndex(idx);
    hintTimer.current = setTimeout(() => setHintIndex(null), 2500);
  };

  const handleAbandon = () => {
    setAbandoned(true);
    setMessage('');
  };

  return (
    <div style={{
      minHeight: '100dvh',
      backgroundImage: `url(${fondTel})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: 16,
      overflowY: 'auto',
    }}>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        fontFamily: 'sans-serif', padding: '16px 16px 20px',
        width: '100%', maxWidth: 400,
        userSelect: 'none', touchAction: 'none',
        background: 'rgba(255,255,255,0.58)',
        borderRadius: 24,
        boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
      }}>
        <h2 style={{ fontSize: 22, marginBottom: 8, margin: '0 0 8px' }}>🔤 Anagrammes</h2>

        <svg
          ref={svgRef}
          viewBox="0 0 320 320"
          style={{ width: '100%', maxWidth: 340, cursor: 'crosshair', touchAction: 'none' }}
          onMouseDown={handleStart} onMouseMove={handleMove} onMouseUp={handleEnd}
          onTouchStart={handleStart} onTouchMove={handleMove} onTouchEnd={handleEnd}
        >
          <circle cx={CENTER.x} cy={CENTER.y} r={CIRCLE_RADIUS} fill="none" stroke="#ddd" strokeWidth={1} />

          {currentPath.length > 1 && currentPath.slice(0, -1).map((p, i) => (
            <line key={i}
              x1={p.x} y1={p.y} x2={currentPath[i + 1].x} y2={currentPath[i + 1].y}
              stroke="#7c3aed" strokeWidth={4} strokeLinecap="round"
            />
          ))}

          {isDragging && currentPos && currentPath.length > 0 && (
            <line
              x1={currentPath[currentPath.length - 1].x}
              y1={currentPath[currentPath.length - 1].y}
              x2={currentPos.x} y2={currentPos.y}
              stroke="#7c3aed" strokeWidth={4} strokeLinecap="round" strokeDasharray="6 4"
            />
          )}

          {positions.map((p, i) => {
            const inPath = currentPath.find(cp => cp.index === i);
            const isHint = !isDragging && hintIndex === i;
            return (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r={26}
                  fill={inPath ? '#7c3aed' : isHint ? '#f59e0b' : '#f3f0ff'}
                  stroke={inPath ? '#5b21b6' : isHint ? '#d97706' : '#c4b5fd'}
                  strokeWidth={isHint ? 3 : 2}
                />
                <text x={p.x} y={p.y + 7}
                  textAnchor="middle" fontSize={20} fontWeight="bold"
                  fill={inPath || isHint ? 'white' : '#4c1d95'}
                >
                  {p.letter}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Message */}
        <div style={{ minHeight: 28, fontSize: 17, fontWeight: 'bold', color: '#7c3aed', margin: '4px 0 8px' }}>
          {message}
        </div>

        {/* Zone mots : trouvés (violet) + révélés après abandon (rouge) — scrollable */}
        <div style={{
          width: '100%', maxHeight: 130, overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 6,
          justifyContent: 'center', padding: '4px 2px',
        }}>
          {foundWords.length === 0 && !abandoned && (
            <span style={{ color: '#aaa', fontSize: 15 }}>Tracez un mot entre les lettres...</span>
          )}
          {foundWords.map(w => (
            <span key={w} style={{
              background: '#ede9fe', color: '#5b21b6',
              borderRadius: 20, padding: '4px 14px', fontWeight: 'bold', fontSize: 16,
            }}>{w}</span>
          ))}
          {abandoned && remainingWords.map(w => (
            <span key={w} style={{
              background: '#fee2e2', color: '#b91c1c',
              borderRadius: 20, padding: '4px 14px', fontWeight: 'bold', fontSize: 16,
              opacity: 0.85,
            }}>{w}</span>
          ))}
        </div>

        {/* Score */}
        <div style={{ fontSize: 15, color: '#888', marginBottom: 12 }}>
          {foundWords.length} / {currentSet.words.length} mots trouvés
        </div>

        {/* Boutons */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={reset} style={btn({ background: '#f3f0ff', color: '#5b21b6', border: '2px solid #c4b5fd' })}>
            🔄 Recommencer
          </button>

          {!allFound && !abandoned && (
            <button onClick={handleIndice} style={btn({ background: '#fef3c7', color: '#92400e', border: '2px solid #fcd34d' })}>
              💡 Indice
            </button>
          )}

          {!allFound && !abandoned && (
            <button onClick={handleAbandon} style={btn({ background: '#fee2e2', color: '#b91c1c', border: '2px solid #fca5a5' })}>
              🏳️ J'abandonne
            </button>
          )}

          {(allFound || abandoned) && (
            <button onClick={nextSet} style={btn({ background: '#7c3aed', color: 'white' })}>
              Suivant ➡️
            </button>
          )}
        </div>

        {allFound && (
          <div style={{ marginTop: 14, fontSize: 20, fontWeight: 'bold', color: '#059669' }}>
            🎉 Tous les mots trouvés !
          </div>
        )}
      </div>
    </div>
  );
}
