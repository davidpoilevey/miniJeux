import { useState, useEffect, useMemo, useRef, useCallback, Suspense } from 'react';
import './atlas/atlas.css';
import { GAMES_DATA } from './gameData';
import { flattenGames, computeAtlasLayout } from './atlas/atlasLayout';
import { fetchTop10, fetchBestPerGame } from './pocketbaseScores';
import AtlasMap from './atlas/AtlasMap';
import { SearchFloat, DetailPanel, ScoresSheet, CreditsModal, MentionsModal, ContactModal, TweaksPanel } from './atlas/AtlasOverlays';
import { AppBackButton } from './JeuxCards';
import { updatePageTitle } from './seoUtils';
import photoMoi from './DSCN0013.jpg';

const GAMES = flattenGames(GAMES_DATA);

function AppAtlas() {
  const layout = useMemo(() => computeAtlasLayout(GAMES), []);

  const [query, setQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [detailGame, setDetailGame] = useState(null);
  const [selectedApp, setSelectedApp] = useState(() => {
    const id = new URLSearchParams(window.location.search).get('game');
    if (!id) return null;
    return layout.nodes.find(n => n.gameRef?.id === id || n.gameRef?.name === id) ?? null;
  });

  const [scoresOpen, setScoresOpen] = useState(false);
  const [scoresId, setScoresId] = useState(null);
  const [creditsOpen, setCreditsOpen] = useState(false);
  const [mentionsOpen, setMentionsOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [tweaksShown, setTweaksShown] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.matchMedia('(max-width: 760px)').matches);

  const [constellations, setConstellations] = useState(true);
  const [districtBlobs, setDistrictBlobs] = useState(true);
  const [nodeLabels, setNodeLabels] = useState(true);

  const [hud, setHud] = useState({ x: 0, y: 0, z: 1 });
  const [scoresData, setScoresData] = useState({});
  const [hiscores, setHiscores] = useState({});

  const mapRef = useRef(null);
  const gameStartTimeRef = useRef(null);

  // Body classes pour les tweaks
  useEffect(() => {
    const el = document.documentElement;
    el.classList.toggle('no-constellations', !constellations);
    el.classList.toggle('no-blobs', !districtBlobs);
    el.classList.toggle('no-labels', !nodeLabels);
    return () => {
      el.classList.remove('no-constellations', 'no-blobs', 'no-labels');
    };
  }, [constellations, districtBlobs, nodeLabels]);

  // Mobile
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 760px)');
    const cb = () => setIsMobileView(mq.matches);
    mq.addEventListener('change', cb);
    return () => mq.removeEventListener('change', cb);
  }, []);

  // Edit mode tweaks (postMessage compat)
  useEffect(() => {
    const handler = (e) => {
      if (!e.data || typeof e.data !== 'object') return;
      if (e.data.type === '__activate_edit_mode') setTweaksShown(true);
      if (e.data.type === '__deactivate_edit_mode') setTweaksShown(false);
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  // Charger les hiscores réels depuis PocketBase
  useEffect(() => {
    fetchBestPerGame().then(items => {
      const map = {};
      for (const item of items) {
        map[item.gameName] = item.score;
      }
      setHiscores(map);
    }).catch(() => {});
  }, []);

  // Injecter les hiscores dans les nodes
  const nodesWithScores = useMemo(() => {
    return layout.nodes.map(n => ({
      ...n,
      hiscore: hiscores[n.gameRef?.name] ?? hiscores[n.name] ?? 0,
    }));
  }, [layout.nodes, hiscores]);

  const layoutWithScores = useMemo(() => ({
    ...layout,
    nodes: nodesWithScores,
  }), [layout, nodesWithScores]);

  // SEO
  useEffect(() => { updatePageTitle(selectedApp?.gameRef ?? null); }, [selectedApp]);

  const allTags = useMemo(() => {
    const set = new Set();
    layout.nodes.forEach(n => n.tags.forEach(t => set.add(t)));
    return [...set];
  }, [layout]);

  const toggleTag = useCallback((t) =>
    setSelectedTags(s => s.includes(t) ? s.filter(x => x !== t) : [...s, t]),
  []);

  const handleSelect = useCallback((g) => {
    setDetailGame(g);
    mapRef.current?.focusNode(g);
  }, []);

  const handlePlay = useCallback((g) => {
    setSelectedApp(g);
    gameStartTimeRef.current = Date.now();
  }, []);

  const handleClose = useCallback(() => {
    if (!selectedApp || !gameStartTimeRef.current || !window.gtag) {
      setSelectedApp(null);
      return;
    }
    const duree = Math.round((Date.now() - gameStartTimeRef.current) / 1000);
    window.gtag('event', 'jeu_ferme', {
      event_category: 'jeu',
      event_label: selectedApp.name,
      value: duree,
      duree_secondes: duree,
    });
    gameStartTimeRef.current = null;
    setSelectedApp(null);
  }, [selectedApp]);

  const handleShowScores = useCallback((g) => {
    setScoresId(g.id);
    // Charger les scores depuis PocketBase
    fetchTop10(g.gameRef?.name ?? g.name).then(items => {
      setScoresData(prev => ({ ...prev, [g.id]: items }));
    }).catch(() => {});
    setScoresOpen(true);
  }, []);

  const surprise = useCallback(() => {
    let pool = layoutWithScores.nodes;
    if (isMobileView) pool = pool.filter(n => n.tags.includes('mobileFriendly'));
    if (selectedTags.length) pool = pool.filter(n => selectedTags.every(t => n.tags.includes(t)));
    if (!pool.length) pool = layoutWithScores.nodes;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    handleSelect(pick);
  }, [layoutWithScores, isMobileView, selectedTags, handleSelect]);

  // HUD coords
  const onVpChange = useCallback((vp) => {
    const wx = (window.innerWidth / 2 - vp.tx) / vp.zoom;
    const wy = (window.innerHeight / 2 - vp.ty) / vp.zoom;
    setHud({ x: Math.round(wx), y: Math.round(wy), z: vp.zoom });
  }, []);

  // Raccourcis clavier
  useEffect(() => {
    const onKey = (e) => {
      const inInput = e.target.matches('input, textarea');
      if (e.key === 'Escape') {
        if (detailGame) { setDetailGame(null); return; }
        if (scoresOpen) { setScoresOpen(false); return; }
        if (creditsOpen) { setCreditsOpen(false); return; }
      }
      if (inInput) return;
      if (e.key.toLowerCase() === 'r') { e.preventDefault(); surprise(); }
      if (e.key === '0') { e.preventDefault(); mapRef.current?.recenter(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [detailGame, scoresOpen, creditsOpen, surprise]);

  const visibleCount = useMemo(() => {
    const q = query.trim().toLowerCase();
    return layoutWithScores.nodes.filter(n => {
      if (isMobileView && !n.tags.includes('mobileFriendly')) return false;
      if (!isMobileView && selectedTags.length && !selectedTags.every(t => n.tags.includes(t))) return false;
      if (q && !(n.name.toLowerCase().includes(q) || n.desc.toLowerCase().includes(q) || n.tags.some(t => t.toLowerCase().includes(q)))) return false;
      return true;
    }).length;
  }, [query, selectedTags, isMobileView, layoutWithScores]);

  const totalCount = isMobileView
    ? layoutWithScores.nodes.filter(n => n.tags.includes('mobileFriendly')).length
    : layoutWithScores.nodes.length;

  // ---- Vue jeu ----
  if (selectedApp) {
    const GameComponent = selectedApp.component;
    return (
      <Suspense fallback={null}>
        <AppBackButton onClick={handleClose} />
        <GameComponent />
      </Suspense>
    );
  }

  // ---- Vue atlas ----
  return (
    <div className="atlas-app">
      <AtlasMap
        ref={mapRef}
        layout={layoutWithScores}
        query={query}
        selectedTags={selectedTags}
        selectedId={detailGame?.id}
        onSelect={handleSelect}
        isMobileView={isMobileView}
        onVpChange={onVpChange}
      />

      {/* Top bar */}
      <div className="atlas-topbar">
        <div className="atlas-brand">
          <img src={photoMoi} alt="David Poilevey" className="atlas-avatar" />
          <div className="name">mini<em>Jeux</em></div>
          <div className="tag">atlas · {totalCount} games</div>
        </div>
        <div className="atlas-top-actions">
          <button className="atlas-pill" onClick={surprise}>◆ Surprends-moi</button>
          <button className="atlas-pill" onClick={() => setScoresOpen(true)}>★ Hiscores</button>
          <button className="atlas-pill primary" onClick={() => mapRef.current?.recenter()}>◎ Recentrer</button>
        </div>
      </div>

      {/* Search */}
      <SearchFloat
        query={query}
        setQuery={setQuery}
        tags={allTags}
        selectedTags={selectedTags}
        toggleTag={toggleTag}
        isMobileView={isMobileView}
        districts={[]}
        nodes={layoutWithScores.nodes}
        onSelect={handleSelect}
      />

      {/* HUD bas-gauche */}
      <div className="atlas-hud-bl">
        <div className="row"><span className="k">pos</span><span className="v">{hud.x}, {hud.y}</span></div>
        <div className="row"><span className="k">z</span><span className="v">{hud.z.toFixed(2)}×</span></div>
        <div className="row"><span className="k">loaded</span><span className="v">{visibleCount}/{totalCount}</span></div>
      </div>

      {/* Zoom bas-droit */}
      <div className="atlas-hud-br">
        <span className="atlas-zoom-label">vue</span>
        <div className="atlas-zoom-ctrl">
          <button title="zoom -" onClick={() => {
            const m = mapRef.current; if (!m) return;
            const v = m.getVp();
            const cx = window.innerWidth / 2;
            const cy = window.innerHeight / 2;
            const k = 0.8;
            m.setVp({ zoom: Math.max(0.3, v.zoom * k), tx: cx - (cx - v.tx) * k, ty: cy - (cy - v.ty) * k });
          }}>−</button>
          <button title="recentrer" onClick={() => mapRef.current?.recenter()}>◎</button>
          <button title="zoom +" onClick={() => {
            const m = mapRef.current; if (!m) return;
            const v = m.getVp();
            const cx = window.innerWidth / 2;
            const cy = window.innerHeight / 2;
            const k = 1.25;
            m.setVp({ zoom: Math.min(2.5, v.zoom * k), tx: cx - (cx - v.tx) * k, ty: cy - (cy - v.ty) * k });
          }}>+</button>
        </div>
      </div>

      {/* Detail panel */}
      <DetailPanel
        game={detailGame}
        onClose={() => setDetailGame(null)}
        onShowScores={handleShowScores}
        onTagClick={toggleTag}
        onPlay={handlePlay}
      />

      {/* Scores */}
      <ScoresSheet
        open={scoresOpen}
        onClose={() => setScoresOpen(false)}
        selectedId={scoresId}
        setSelectedId={setScoresId}
        games={layoutWithScores.nodes}
        scoresData={scoresData}
      />

      {/* Credits modal */}
      <CreditsModal open={creditsOpen} onClose={() => setCreditsOpen(false)} />
      <MentionsModal open={mentionsOpen} onClose={() => setMentionsOpen(false)} />
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />

      {/* Tweaks */}
      <TweaksPanel
        show={tweaksShown}
        onClose={() => setTweaksShown(false)}
        constellations={constellations} setConstellations={setConstellations}
        districtBlobs={districtBlobs} setDistrictBlobs={setDistrictBlobs}
        nodeLabels={nodeLabels} setNodeLabels={setNodeLabels}
      />

      {/* Credits strip */}
      <div className="atlas-credits-strip">
        <div>© 2026 David Poilevey</div>
        <div>
          <span>/ search</span>
          <span className="dot">·</span>
          <span>R random</span>
          <span className="dot">·</span>
          <span>0 recentrer</span>
          <span className="dot">·</span>
          <span>scroll = zoom</span>
        </div>
        <div style={{ display: 'flex', gap: 14 }}>
          <a href="#mentions" onClick={(e) => { e.preventDefault(); setMentionsOpen(true); }}>Mentions légales</a>
          <a href="#contact" onClick={(e) => { e.preventDefault(); setContactOpen(true); }}>Contact</a>
          <a href="#credits" onClick={(e) => { e.preventDefault(); setCreditsOpen(true); }}>◆ Credits</a>
        </div>
      </div>
    </div>
  );
}

export default AppAtlas;
