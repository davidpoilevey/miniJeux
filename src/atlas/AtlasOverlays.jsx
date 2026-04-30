import { useState, useEffect, useRef, useMemo } from 'react';
import { DISTRICTS } from './atlasLayout';

/* ---- Placeholder screenshot quand pas d'image ---- */
function GameScreenPlaceholder({ game }) {
  const seed = game.id;
  const hue = ((seed * 47) % 360);
  const rand = (n) => { const x = Math.sin(seed * 9.1 + n * 2.3) * 10000; return x - Math.floor(x); };
  const variant = seed % 5;
  const bg = `oklch(0.16 0.08 ${hue})`;
  const c1 = `oklch(0.75 0.2 ${hue})`;
  const c2 = `oklch(0.85 0.18 ${(hue + 60) % 360})`;

  let cells = [];
  if (variant === 0) {
    for (let y = 0; y < 5; y++) for (let x = 0; x < 8; x++)
      if (rand(y * 8 + x) > 0.45)
        cells.push(<rect key={`${x}-${y}`} x={x * 12 + 4} y={y * 10 + 20} width="8" height="6" fill={rand(y + x * 3) > 0.5 ? c1 : c2} />);
  } else if (variant === 1) {
    for (let i = 0; i < 6; i++) {
      const s = 100 - i * 15;
      cells.push(<rect key={i} x={(100 - s) / 2} y={(62 - s * 0.62) / 2} width={s} height={s * 0.62} fill="none" stroke={i % 2 === 0 ? c1 : c2} strokeWidth="0.8" opacity={1 - i * 0.1} />);
    }
  } else if (variant === 2) {
    for (let i = 0; i < 8; i++) {
      const x = Math.floor(rand(i) * 10) * 10;
      const y = 62 - (i + 1) * 7;
      const w = (1 + Math.floor(rand(i * 2) * 3)) * 10;
      cells.push(<rect key={i} x={x} y={y} width={w} height="7" fill={[c1, c2, c1][i % 3]} stroke={bg} strokeWidth="0.4" />);
    }
  } else if (variant === 3) {
    for (let i = 0; i < 30; i++)
      cells.push(<circle key={i} cx={rand(i) * 100} cy={rand(i + 10) * 62} r={rand(i + 20) > 0.8 ? 1.2 : 0.5} fill={c2} opacity={0.5 + rand(i + 30) * 0.5} />);
    cells.push(<rect key="s1" x="44" y="46" width="12" height="4" fill={c1} />);
  } else {
    cells.push(<rect key="sky" x="0" y="0" width="100" height="36" fill={`oklch(0.22 0.15 ${hue})`} />);
    cells.push(<circle key="sun" cx="50" cy="36" r="14" fill={c2} opacity="0.8" />);
    for (let i = 0; i < 6; i++)
      cells.push(<line key={`gl${i}`} x1="0" x2="100" y1={36 + i * 5} y2={36 + i * 5} stroke={c1} strokeWidth="0.4" opacity={0.4 + i * 0.1} />);
    cells.push(<rect key="car" x="44" y="52" width="12" height="4" fill={c1} />);
  }

  return (
    <svg viewBox="0 0 100 62" preserveAspectRatio="xMidYMid slice">
      <rect x="0" y="0" width="100" height="62" fill={bg} />
      {cells}
    </svg>
  );
}

/* ---- Search bar flottante ---- */
export function SearchFloat({ query, setQuery, tags, selectedTags, toggleTag, isMobileView, districts, nodes, onSelect }) {
  const inputRef = useRef(null);
  const [focused, setFocused] = useState(false);
  const [cursor, setCursor] = useState(-1);

  // Raccourcis globaux /  et Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        inputRef.current.blur();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Suggestions filtrées
  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !nodes) return [];
    return nodes
      .filter(n =>
        n.name.toLowerCase().includes(q) ||
        n.desc.toLowerCase().includes(q) ||
        n.tags.some(t => t.toLowerCase().includes(q))
      )
      .sort((a, b) => {
        const aStart = a.name.toLowerCase().startsWith(q);
        const bStart = b.name.toLowerCase().startsWith(q);
        if (aStart !== bStart) return aStart ? -1 : 1;
        return a.name.localeCompare(b.name);
      })
      .slice(0, 7);
  }, [query, nodes]);

  const showSuggestions = focused && suggestions.length > 0;

  const selectSuggestion = (n) => {
    onSelect(n);
    setQuery('');
    setCursor(-1);
    inputRef.current?.blur();
  };

  const onKeyDown = (e) => {
    if (!showSuggestions) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor(c => Math.min(c + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor(c => Math.max(c - 1, 0));
    } else if (e.key === 'Enter' && cursor >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[cursor]);
    }
  };

  const districtTags = DISTRICTS.map(d => d.tag);
  const orderedTags = [
    ...districtTags.filter(t => tags.includes(t)),
    ...tags.filter(t => !districtTags.includes(t)).sort(),
  ];
  const tagColor = (t) => {
    const d = DISTRICTS.find(x => x.tag === t);
    return d ? d.color : 'var(--ink-dim)';
  };

  // Highlight du texte matché
  const highlight = (text, q) => {
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark>{text.slice(idx, idx + q.length)}</mark>
        {text.slice(idx + q.length)}
      </>
    );
  };

  return (
    <div className="atlas-search">
      <div className="row">
        <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setCursor(-1); }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={onKeyDown}
          placeholder="trouve un jeu, un tag, un vibe…"
        />
        {query
          ? <button className="clear-btn" onMouseDown={(e) => { e.preventDefault(); setQuery(''); setCursor(-1); }}>×</button>
          : <span className="hint">/ ou ⌘K</span>
        }
      </div>

      {/* Dropdown suggestions */}
      {showSuggestions && (
        <div className="atlas-suggestions">
          {suggestions.map((n, i) => (
            <button key={n.id}
              className={'suggestion' + (i === cursor ? ' active' : '')}
              onMouseDown={(e) => { e.preventDefault(); selectSuggestion(n); }}
              onMouseEnter={() => setCursor(i)}
            >
              <span className="sdot" style={{ background: n.district?.color }} />
              <span className="sname">{highlight(n.name, query.trim())}</span>
              <span className="sdistrict">{n.district?.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Chips de tags (masqués si suggestions visibles) */}
      {!isMobileView && !showSuggestions && (
        <div className="atlas-search-tags">
          {orderedTags.map(t => {
            const isDistrict = districtTags.includes(t);
            const active = selectedTags.includes(t);
            return (
              <button key={t}
                className={'chip' + (isDistrict ? ' dot' : '') + (active ? ' active' : '')}
                style={{ '--c': tagColor(t) }}
                onClick={() => toggleTag(t)}
              >
                {t}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---- Detail panel ---- */
export function DetailPanel({ game, onClose, onShowScores, onTagClick, onPlay }) {
  return (
    <aside className={'atlas-detail' + (game ? ' open' : '')}>
      {game && (
        <>
          <div className="d-head" style={{ '--c': game.district?.color }}>
            <button className="d-close" onClick={onClose}>×</button>
            <div className="d-coord">
              <span className="bullet" style={{ background: game.district?.color }}></span>
              <span>{game.district?.label} · N{String(Math.abs(Math.round(game.y))).padStart(3, '0')} · E{String(Math.abs(Math.round(game.x))).padStart(3, '0')}</span>
            </div>
            <div className="d-name">{game.name}</div>
          </div>
          <div className="d-body">
            <div className="atlas-d-screen">
              {game.image
                ? <img src={game.image} alt={game.name} />
                : <GameScreenPlaceholder game={game} />
              }
            </div>
            <div className="atlas-d-desc">{game.desc}</div>
            <div className="atlas-d-meta">
              <div className="cell">
                <div className="k">Top score</div>
                <div className="v">{game.hiscore > 0 ? game.hiscore.toLocaleString() : '—'}</div>
              </div>
              <div className="cell">
                <div className="k">Genre</div>
                <div className="v" style={{ textTransform: 'capitalize', fontSize: 16 }}>
                  {game.district?.label || 'Original'}
                </div>
              </div>
            </div>
            <div className="atlas-d-tags">
              {game.tags.map(t => (
                <span key={t}
                  className={'t' + (t === 'mobileFriendly' ? ' mobile' : '')}
                  onClick={() => onTagClick(t)}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="d-foot">
            <button className="btn" onClick={() => onShowScores(game)}>★ Scores</button>
            <button className="btn play" onClick={() => onPlay(game)}>▶ Jouer</button>
          </div>
        </>
      )}
    </aside>
  );
}

/* ---- Scores sheet ---- */
export function ScoresSheet({ open, onClose, selectedId, setSelectedId, games, scoresData }) {
  const sorted = useMemo(() => [...games].sort((a, b) => b.hiscore - a.hiscore), [games]);
  const activeId = selectedId ?? sorted[0]?.id;
  const game = games.find(g => g.id === activeId) || sorted[0];
  const scores = scoresData[activeId] || [];

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <>
      <div className={'atlas-backdrop' + (open ? ' show' : '')} onClick={onClose} />
      <div className={'atlas-scores-sheet' + (open ? ' open' : '')}>
        <div className="atlas-scores-handle" onClick={onClose} />
        <div className="atlas-scores-head">
          <div className="atlas-scores-title">Hall of <em>fame</em></div>
          <button className="atlas-scores-close" onClick={onClose}>fermer · esc</button>
        </div>
        <div className="atlas-scores-body">
          <div className="atlas-scores-picker">
            {sorted.map(g => (
              <div key={g.id}
                className={'item' + (g.id === activeId ? ' active' : '')}
                onClick={() => setSelectedId(g.id)}
              >
                <span>{g.name}</span>
                <span className="sc">{g.hiscore > 0 ? g.hiscore.toLocaleString() : '—'}</span>
              </div>
            ))}
          </div>
          <div className="atlas-scores-list">
            {game && (
              <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 28, fontStyle: 'italic', marginBottom: 14 }}>
                {game.name}
              </div>
            )}
            {scores.length > 0 ? (
              <table className="atlas-scores-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Joueur</th>
                    <th style={{ textAlign: 'right' }}>Score</th>
                    <th style={{ textAlign: 'right' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((s, i) => (
                    <tr key={s.id || i}>
                      <td className={`rank rank-${i + 1}`}>{String(i + 1).padStart(2, '0')}</td>
                      <td className="name">{s.user}</td>
                      <td className="score">{s.score.toLocaleString()}</td>
                      <td className="date">{new Date(s.created).toLocaleDateString('fr-FR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 20 }}>
                Pas encore de scores publiés.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ---- Credits modal ---- */
export function CreditsModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <div className={'atlas-credits-modal' + (open ? ' open' : '')} onClick={onClose}>
      <div className="card" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose}>×</button>
        <h2>colophon <em>&</em> credits</h2>
        <div className="sub">miniJeux · v0.42 · avril 2026</div>
        <div className="line"><span className="role">Design</span>Un portail-carte interactif.</div>
        <div className="line"><span className="role">Code</span>React · SVG · passion.</div>
        <div className="line"><span className="role">Jeux</span>~90 remakes &amp; originaux maison.</div>
        <div className="line"><span className="role">Typographie</span>Instrument Serif · JetBrains Mono.</div>
        <div className="thanks">
          Merci aux bornes d'arcade, aux salles obscures des années 90,
          et à celui qui a inventé la touche Ctrl-Z.
        </div>
      </div>
    </div>
  );
}

/* ---- Mentions légales modal ---- */
export function MentionsModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <div className={'atlas-credits-modal' + (open ? ' open' : '')} onClick={onClose}>
      <div className="card" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose}>×</button>
        <h2>mentions <em>&</em> confidentialité</h2>
        <div className="sub">miniJeux · david poilevey · 2026</div>
        <div className="line"><span className="role">Auteur</span>David Poilevey — projet personnel.</div>
        <div className="line"><span className="role">Hébergeur</span>GitHub Pages — GitHub, Inc. — San Francisco, USA.</div>
        <div className="line"><span className="role">Données</span>Aucune donnée nominative collectée. Google Analytics anonyme.</div>
        <div className="line"><span className="role">Copyright</span>© 2026 David Poilevey. Tous droits réservés.</div>
        <div className="thanks">
          Toute reproduction du contenu est interdite sans autorisation préalable.
        </div>
      </div>
    </div>
  );
}

/* ---- Contact modal ---- */
export function ContactModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <div className={'atlas-credits-modal' + (open ? ' open' : '')} onClick={onClose}>
      <div className="card" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose}>×</button>
        <h2>dire <em>bonjour</em></h2>
        <div className="sub">miniJeux · contact</div>
        <div className="line">
          <span className="role">Qui</span>
          David Poilevey — passionné de React et de jeux rétro.
        </div>
        <div className="line">
          <span className="role">Email</span>
          <a href="mailto:david.poilevey@gmail.com"
            style={{ color: 'var(--accent)', textDecoration: 'none', fontStyle: 'italic' }}
            onClick={(e) => e.stopPropagation()}
          >
            david.poilevey@gmail.com
          </a>
        </div>
        <div className="thanks">
          Questions, bugs, suggestions, fan mail ou insultes amicales — tout est bienvenu.
        </div>
      </div>
    </div>
  );
}

/* ---- Tweaks panel ---- */
export function TweaksPanel({ show, onClose, constellations, setConstellations, districtBlobs, setDistrictBlobs, nodeLabels, setNodeLabels }) {
  return (
    <div className={'atlas-tweaks' + (show ? ' show' : '')}>
      <div className="h">
        <span className="t">Tweaks</span>
        <button className="x" onClick={onClose}>×</button>
      </div>
      <div className="body">
        {[
          ['Constellations', constellations, setConstellations],
          ['Districts glow', districtBlobs, setDistrictBlobs],
          ['Node labels', nodeLabels, setNodeLabels],
        ].map(([label, val, setter]) => (
          <label key={label}>
            {label}
            <div className="seg">
              <button className={val ? 'active' : ''} onClick={() => setter(true)}>On</button>
              <button className={!val ? 'active' : ''} onClick={() => setter(false)}>Off</button>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
