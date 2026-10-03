import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import Matter from 'matter-js';
import { Box } from '@mui/material';
import { LEVELS, getLevel } from './layouts';
import { attachGameLoop, buildWorld } from './world';
import { INITIAL_STATE, gameReducer } from './gameState';
import FlipperPanel from './FlipperPanel';
import { loadSounds, playSound } from './sounds';
import { EditorOverlay, EditorPanel, formatLayout, useEditor } from './FlipperEditor';

const { Engine, Events, Render, Runner } = Matter;

// L'éditeur n'existe qu'en dev : en prod on joue la table du fichier
const DEV = process.env.NODE_ENV !== 'production';
const DRAFT_KEY = 'flipper.layoutDraft';   // + '.<niveau>'
const LEVEL_KEY = 'flipper.level';
const BG = '#1a1a2e';

const POPUP_MS = 900;      // durée de vie d'un "+100"
const POPUP_RISE = 40;     // px parcourus vers le haut

// Dessine les "+points" par-dessus le rendu Matter : ils montent et s'estompent
const drawPopups = (c, popups, now) => {
  c.save();
  c.font = 'bold 18px sans-serif';
  c.textAlign = 'center';
  c.lineWidth = 4;
  c.strokeStyle = BG;
  c.fillStyle = '#ffd54f';
  for (const p of popups) {
    const t = (now - p.t0) / POPUP_MS;
    const y = Math.max(18, p.y - t * POPUP_RISE);
    c.globalAlpha = 1 - t * t;
    c.strokeText(p.text, p.x, y);
    c.fillText(p.text, p.x, y);
  }
  c.restore();
};

const LEFT_KEYS = ['ArrowLeft', 'z', 'Z'];
const RIGHT_KEYS = ['ArrowRight', '/'];
const isTyping = (e) => ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName);

const storage = {
  get: (key) => { try { return localStorage.getItem(key); } catch { return null; } },
  set: (key, value) => { try { localStorage.setItem(key, value); } catch { /* tant pis */ } },
  remove: (key) => { try { localStorage.removeItem(key); } catch { /* tant pis */ } },
};

// Ancien brouillon (avant les niveaux) = brouillon de default
const draftKey = (name) => `${DRAFT_KEY}.${name}`;
if (DEV && storage.get(DRAFT_KEY)) {
  storage.set(draftKey('default'), storage.get(DRAFT_KEY));
  storage.remove(DRAFT_KEY);
}

const loadLayout = (name) => {
  if (DEV) {
    try {
      const draft = JSON.parse(storage.get(draftKey(name)));
      // Brouillon identique à un autre niveau = il a été copié dans son fichier : périmé
      const copied = draft && LEVELS.some((l) => l.name !== name && formatLayout(l.layout) === formatLayout(draft));
      if (copied) storage.remove(draftKey(name));
      else if (draft) return draft;
    } catch {
      // brouillon illisible : on prend le fichier
    }
  }
  return getLevel(name).layout;
};

export default function FlipperGame() {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const renderRef = useRef(null);
  const runnerRef = useRef(null);
  const worldRef = useRef(null);
  const ctxRef = useRef(null);        // contexte lu par la game loop (null = pause)
  const inputRef = useRef({ left: false, right: false, chargeStart: null, release: null });
  const popupsRef = useRef([]);       // { x, y, text, t0 }

  const [levelName, setLevelName] = useState(() => getLevel(storage.get(LEVEL_KEY)).name);
  const [layout, setLayout] = useState(() => loadLayout(levelName));
  const fileLayout = getLevel(levelName).layout;
  const [mode, setMode] = useState('play');
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);
  const editor = useEditor(layout, setLayout, mode === 'edit');

  const modeRef = useRef(mode);
  const livesRef = useRef(state.lives);
  modeRef.current = mode;
  livesRef.current = state.lives;

  const isSaved = useMemo(() => formatLayout(layout) === formatLayout(fileLayout), [layout, fileLayout]);

  const switchMode = (next) => {
    Object.assign(inputRef.current, { left: false, right: false, chargeStart: null, release: null });
    setMode(next);
  };

  // ── Moteur : créé une fois ──────────────────────────────────────────────────
  useEffect(() => {
    loadSounds();
    const engine = Engine.create({ positionIterations: 10, velocityIterations: 8 });
    const render = Render.create({
      canvas: canvasRef.current,
      engine,
      options: { width: layout.width, height: layout.height, background: BG, wireframes: false },
    });
    const runner = Runner.create({ delta: 1000 / 120 });
    engineRef.current = engine;
    renderRef.current = render;
    runnerRef.current = runner;

    const detach = attachGameLoop(engine, () => ctxRef.current);
    const onAfterRender = () => {
      const now = performance.now();
      popupsRef.current = popupsRef.current.filter((p) => now - p.t0 < POPUP_MS);
      drawPopups(render.context, popupsRef.current, now);
    };
    Events.on(render, 'afterRender', onAfterRender);
    Render.run(render);

    return () => {
      Events.off(render, 'afterRender', onAfterRender);
      detach();
      Render.stop(render);
      Runner.stop(runner);
      Engine.clear(engine);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Monde : reconstruit à chaque modif du layout (édition) ou entrée en jeu ──
  useEffect(() => {
    Render.setSize(renderRef.current, layout.width, layout.height);   // au cas où un niveau change de taille
    const world = buildWorld(engineRef.current, layout);
    worldRef.current = world;
    popupsRef.current = [];
    if (mode !== 'play') {
      ctxRef.current = null;
      return undefined;
    }

    ctxRef.current = {
      world,
      ball: world.ball,
      settings: world.settings,
      input: inputRef.current,
      time: 0,
      now: () => performance.now(),
      dispatch,
      popup: (x, y, points) => {
        if (points) popupsRef.current.push({ x, y, text: `+${points}`, t0: performance.now() });
      },
      sound: playSound,
      loseBall: () => {
        if (world.ball.isStatic) return;
        world.parkBall();
        playSound('lost');
        dispatch({ type: 'LOSE_BALL' });
      },
    };
    dispatch({ type: 'RESET' });
    Runner.run(runnerRef.current, engineRef.current);
    return () => Runner.stop(runnerRef.current);
  }, [layout, mode]);

  // ── Balle suivante après une perte ──────────────────────────────────────────
  useEffect(() => {
    const world = worldRef.current;
    if (mode !== 'play' || state.lives <= 0 || !world?.ball.isStatic) return undefined;
    const t = setTimeout(() => world.spawnBall(), 700);
    return () => clearTimeout(t);
  }, [state.lives, mode]);

  // ── Brouillon auto-sauvé (dev) ──────────────────────────────────────────────
  useEffect(() => {
    if (!DEV) return;
    if (isSaved) storage.remove(draftKey(levelName));
    else storage.set(draftKey(levelName), JSON.stringify(layout));
  }, [layout, isSaved, levelName]);

  // ── Clavier (jeu) ───────────────────────────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e) => {
      if (isTyping(e)) return;
      if (DEV && e.key.toLowerCase() === 'e' && !e.metaKey && !e.ctrlKey) {
        switchMode(modeRef.current === 'play' ? 'edit' : 'play');
        return;
      }
      if (modeRef.current !== 'play' || livesRef.current <= 0) return;
      const input = inputRef.current;
      if (LEFT_KEYS.includes(e.key)) { input.left = true; e.preventDefault(); }
      if (RIGHT_KEYS.includes(e.key)) { input.right = true; e.preventDefault(); }
      if (e.key === ' ') {
        e.preventDefault();   // sinon la page défile
        if (input.chargeStart == null) input.chargeStart = performance.now();
      }
    };
    const onKeyUp = (e) => {
      const input = inputRef.current;
      if (LEFT_KEYS.includes(e.key)) input.left = false;
      if (RIGHT_KEYS.includes(e.key)) input.right = false;
      if (e.key === ' ' && input.chargeStart != null) {
        input.release = Math.min((performance.now() - input.chargeStart) / 1000, 1);
        input.chargeStart = null;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // En test (dev) : clic sur la table = on y pose la bille
  const onCanvasPointerDown = (e) => {
    if (!DEV || mode !== 'play' || state.lives <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    worldRef.current.teleportBall(
      (e.clientX - rect.left) * (layout.width / rect.width),
      (e.clientY - rect.top) * (layout.height / rect.height),
    );
  };

  const restart = () => {
    dispatch({ type: 'RESET' });
    worldRef.current.spawnBall();
  };

  const revert = () => {
    if (!window.confirm(`Oublier le brouillon et revenir à layouts/${levelName}.json ?`)) return;
    editor.commit();
    setLayout(fileLayout);
  };

  // Le brouillon du niveau quitté est déjà sauvé par l'effet ci-dessus
  const chooseLevel = (name) => {
    if (name === levelName) return;
    storage.set(LEVEL_KEY, name);
    editor.reset();
    setLevelName(name);
    setLayout(loadLayout(name));
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'stretch' }}>
      <Box sx={{ position: 'relative', width: layout.width, height: layout.height, flexShrink: 0 }}>
        <canvas ref={canvasRef} onPointerDown={onCanvasPointerDown} style={{ display: 'block' }} />
        {mode === 'edit' && <EditorOverlay editor={editor} layout={layout} />}
      </Box>
      {mode === 'edit' ? (
        <EditorPanel editor={editor} layout={layout} levelName={levelName} isSaved={isSaved} onPlay={() => switchMode('play')} onRevert={revert} />
      ) : (
        <FlipperPanel
          state={state}
          levels={LEVELS.map((l) => l.name)}
          level={levelName}
          onLevelChange={chooseLevel}
          onRestart={restart}
          onEdit={DEV ? () => switchMode('edit') : null}
        />
      )}
    </Box>
  );
}
