import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Stage, Layer, Circle, Group, Rect, Text, Line, Ellipse, RegularPolygon } from 'react-konva';
import { GameOver } from '../ChuckNorrisFact';
import Matter, { Bodies, Body } from 'matter-js';

/*
 * Bouillon de Culture — évolution par la FORME.
 * Deux microbes identiques fusionnent, mais l'évolution change la morphologie
 * (pilule, jumeaux, 8, paramécie, triangle à flagelle, roue, tardigrade...),
 * pas seulement la taille. Toutes les masses sont égales : les gros ne broient
 * pas les petits, ils leur font juste vivre un enfer balistique.
 * Gilou's contribution : 2026-10-26 — v2 "souches mutantes".
 */

const STAGE_W = 420;
const STAGE_H = 640;
const WALL_T = 20;
const WALL_L = 40;
const WALL_R = STAGE_W - 40;
const FLOOR_Y = STAGE_H - 30;
const DANGER_Y = 120;
const DROP_Y = 70;
const COOLDOWN_MS = 480;
const MASS = 0.62; // masse identique pour tous : l'évolution, c'est la forme, pas l'écrasement

// physique : c = cercle, r = capsule (rect arrondi), e = ellipse, p = polygone régulier
const SPECIES = [
  { name: 'Spore',   color: '#9be36a', br: 14,
    phys: [{ t: 'c', o: [0, 0], r: 14 }] },
  { name: 'Bacille', color: '#64c8f0', br: 26,
    phys: [{ t: 'r', o: [0, 0], w: 52, h: 26 }] },
  { name: 'Diplocoque', color: '#f0a860', br: 31,
    phys: [{ t: 'c', o: [-15, 0], r: 15 }, { t: 'c', o: [15, 0], r: 15 }] },
  { name: "L'Huit",  color: '#b06ad0', br: 37,
    phys: [{ t: 'c', o: [0, -16], r: 19 }, { t: 'c', o: [0, 16], r: 19 }] },
  { name: 'Paramécie', color: '#f066a0', br: 41,
    phys: [{ t: 'e', o: [0, 0], rx: 40, ry: 18 }] },
  { name: 'Euglène', color: '#50d0c0', br: 44,
    phys: [{ t: 'p', o: [0, 0], s: 3, r: 42 }], friction: 0.3, restitution: 0.18 },
  { name: 'Rotifère', color: '#f0d050', br: 50,
    phys: [{ t: 'p', o: [0, 0], s: 8, r: 47 }], friction: 0.22, frictionAir: 0.008 },
  { name: 'Tardigrade', color: '#8070f0', br: 62,
    phys: [{ t: 'r', o: [0, 0], w: 104, h: 46 }, { t: 'c', o: [-49, 1], r: 18 }, { t: 'c', o: [49, 1], r: 18 }] },
  { name: 'La Souche-Mère', color: '#f04848', br: 70,
    phys: [{ t: 'c', o: [0, -25], r: 28 }, { t: 'c', o: [-25, 17], r: 28 }, { t: 'c', o: [25, 17], r: 28 }] },
];

const MERGE_PTS = [0, 3, 7, 12, 20, 30, 45, 65, 90, 140];
const DROP_POOL = [0, 0, 0, 0, 1, 1, 1, 2, 2, 3];

const areaOf = (p) => {
  switch (p.t) {
    case 'c': return Math.PI * p.r * p.r;
    case 'r': return p.w * p.h * 0.95; // capsules arrondies
    case 'e': return Math.PI * p.rx * p.ry;
    case 'p': return (p.s / 2) * p.r * p.r * Math.sin(2 * Math.PI / p.s);
    default: return 100;
  }
};

// ---------- petits sons synthétisés, zéro asset ----------
let actx = null;
const beep = (freq, dur = 0.12, type = 'triangle', vol = 0.15) => {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
    const o = actx.createOscillator();
    const g = actx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol, actx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + dur);
    o.connect(g).connect(actx.destination);
    o.start();
    o.stop(actx.currentTime + dur);
  } catch {}
};

const randomDropSpecies = () => DROP_POOL[Math.floor(Math.random() * DROP_POOL.length)];

const mkPart = (p, cx, cy, opts) => {
  const px = cx + p.o[0], py = cy + p.o[1];
  switch (p.t) {
    case 'c': return Bodies.circle(px, py, p.r, opts);
    case 'r': return Bodies.rectangle(px, py, p.w, p.h, { ...opts, chamfer: { radius: Math.min(p.w, p.h) / 2 - 0.6 } });
    case 'e': {
      // matter-js n'a pas de Bodies.ellipse : on trace l'ellipse à la main (convexe → fromVertices OK)
      const verts = [];
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        verts.push({ x: Math.cos(a) * p.rx, y: Math.sin(a) * p.ry });
      }
      return Bodies.fromVertices(px, py, [verts], opts);
    }
    case 'p': return Bodies.polygon(px, py, p.s, p.r, 0, opts);
    default: return Bodies.circle(px, py, 14, opts);
  }
};

export default function Bouillon() {
  const [pieces, setPieces] = useState([]);
  const [held, setHeld] = useState(() => ({ level: randomDropSpecies() }));
  const [nextLevel, setNextLevel] = useState(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => parseInt(localStorage.getItem('bouillon_best') || '0', 10));
  const [dangerLevel, setDangerLevel] = useState(0);  const [gameOverOpen, setGameOverOpen] = useState(false);
  const [floaters, setFloaters] = useState([]);
  const [pops, setPops] = useState([]);

  const stageRef = useRef(null);
  const pieceLayerRef = useRef(null);
  const engineRef = useRef(null);
  const bodiesRef = useRef(new Map());
  const aimRef = useRef(STAGE_W / 2);
  const nextIdRef = useRef(1);
  const cooldownUntilRef = useRef(0);
  const burstRef = useRef(false);
  const comboRef = useRef({ count: 0, lastAt: 0 });
  const overRef = useRef(false);
  const heldRef = useRef(held);
  const floatersRef = useRef([]);
  const popsRef = useRef([]);
  const dangerMsRef = useRef(0);

  heldRef.current = held;

  // ---------- création d'une pièce à la morphologie de son espèce ----------
  const spawnPiece = useCallback((level, x, y) => {
    const id = nextIdRef.current++;
    const d = SPECIES[level];
    const partOpts = (k) => ({
      friction: d.friction ?? 0.45,
      frictionStatic: 0.6,
      restitution: d.restitution ?? 0.12,
      frictionAir: d.frictionAir ?? 0.012,
      slop: 0.04,
    });
    let body;
    if (d.phys.length === 1) {
      const p = d.phys[0];
      body = mkPart(p, x, y, { ...partOpts(1), density: MASS / areaOf(p) });
    } else {
      const k = d.phys.length;
      const parts = d.phys.map((p) => mkPart(p, x, y, { ...partOpts(k), density: MASS / (k * areaOf(p)) }));
      body = Body.create({ parts });
      Body.setPosition(body, { x, y });
    }
    body.label = 'piece';
    body.plugin = {
      id,
      level,
      bornAt: performance.now(),
      dangerMs: 0,
      popAt: performance.now(),
    };
    bodiesRef.current.set(id, body);
    Matter.Composite.add(engineRef.current.world, body);
    setPieces((ps) => [...ps, { id, level }]);
    return id;
  }, []);

  // ---------- moteur + boucle ----------
  useEffect(() => {
    const engine = Matter.Engine.create();
    engine.gravity.y = 1.1;
    engineRef.current = engine;

    const walls = [
      Bodies.rectangle(WALL_L - WALL_T / 2, (DANGER_Y + FLOOR_Y) / 2, WALL_T, FLOOR_Y - DANGER_Y + 60, { isStatic: true, label: 'wall' }),
      Bodies.rectangle(WALL_R + WALL_T / 2, (DANGER_Y + FLOOR_Y) / 2, WALL_T, FLOOR_Y - DANGER_Y + 60, { isStatic: true, label: 'wall' }),
      Bodies.rectangle(STAGE_W / 2, FLOOR_Y + WALL_T / 2, STAGE_W, WALL_T, { isStatic: true, label: 'wall' }),
    ];
    Matter.Composite.add(engine.world, walls);

    const mergeQueue = [];
    Matter.Events.on(engine, 'collisionStart', (e) => {
      for (const pair of e.pairs) {
        // certains pairs exposent la PARTIE du corps composé : on remonte au parent
        const a = pair.bodyA.parent || pair.bodyA;
        const b = pair.bodyB.parent || pair.bodyB;
        if (a.label !== 'piece' || b.label !== 'piece') continue;
        if (!a.plugin || !b.plugin) continue;
        if (a.plugin.level !== b.plugin.level || a.id === b.id) continue;
        mergeQueue.push([a, b]);
      }
    });

    const loop = () => {
      const now = performance.now();
      if (overRef.current) { burstRef.current = false; return; }
      // mode rafale : tant que le doigt (ou la souris) est maintenu, ça tombotte
      if (burstRef.current && now > cooldownUntilRef.current) doDropRef.current();
      Matter.Engine.update(engine, 1000 / 60);

      while (mergeQueue.length) {
        const [a, b] = mergeQueue.shift();
        if (!bodiesRef.current.has(a.plugin.id) || !bodiesRef.current.has(b.plugin.id)) continue;
        const level = a.plugin.level;
        if (level >= SPECIES.length - 1) continue;
        const x = (a.position.x + b.position.x) / 2;
        const y = (a.position.y + b.position.y) / 2;
        bodiesRef.current.delete(a.plugin.id);
        bodiesRef.current.delete(b.plugin.id);
        Matter.Composite.remove(engine.world, a);
        Matter.Composite.remove(engine.world, b);
        setPieces((ps) => ps.filter((o) => o.id !== a.plugin.id && o.id !== b.plugin.id));
        const br = SPECIES[level + 1].br;
        // l'évoluée naît SUR PLACE (point de fusion), bornée à l'intérieur des parois —
        // jamais téléportée en altitude, sinon elle est éjectée violemment du tas (voire hors du monde)
        const nx = Math.min(WALL_R - br, Math.max(WALL_L + br, x));
        const ny = Math.min(FLOOR_Y - br, Math.max(DROP_Y + br, y));
        const newId = spawnPiece(level + 1, nx, ny);

        const c = comboRef.current;
        c.count = now - c.lastAt < 2200 ? c.count + 1 : 1;
        c.lastAt = now;
        const mult = Math.min(c.count, 5);
        const pts = MERGE_PTS[level + 1] * mult;
        setScore((s) => {
          const ns = s + pts;
          if (ns > parseInt(localStorage.getItem('bouillon_best') || '0', 10)) {
            localStorage.setItem('bouillon_best', String(ns));
            setBest(ns);
          }
          return ns;
        });

        const color = SPECIES[level + 1].color;
        const fId = 'f' + now + Math.random();
        setFloaters((f) => [
          ...f,
          { id: fId, x, y, text: `+${pts}${mult > 1 ? ` ×${mult}` : ''}`, color: mult > 1 ? '#ffe14d' : '#fff', t0: performance.now() },
        ]);
        setTimeout(() => setFloaters((f) => f.filter((o) => o.id !== fId)), 900);
        const pId = 'p' + now + Math.random();
        setPops((ps) => [...ps, { id: pId, x, y, color, t0: performance.now() }]);
        setTimeout(() => setPops((ps) => ps.filter((o) => o.id !== pId)), 450);

        beep(200 + 35 * level + 45 * Math.min(c.count, 12), 0.14, 'triangle');
        if (level + 1 === SPECIES.length - 1) beep(880, 0.4, 'sine', 0.25);
      }

      syncNodes(now);
    };
    const syncNodes = (now) => {
      const layer = pieceLayerRef.current;
      if (!layer) return;
      let maxDanger = dangerMsRef.current;
      for (const body of bodiesRef.current.values()) {
        const node = layer.findOne('#b' + body.plugin.id);
        if (node) {
          node.position({ x: body.position.x, y: body.position.y });
          node.rotation(body.angle * 57.29);
          const t = (now - body.plugin.popAt) / 260;
          if (t < 1) node.scale({ x: 1 + Math.sin(Math.PI * t) * (0.15 + body.plugin.level * 0.03), y: 1 + Math.sin(Math.PI * t) * (0.15 + body.plugin.level * 0.03) });
          else node.scale({ x: 1, y: 1 });
        }
        const age = now - body.plugin.bornAt;
        const br = SPECIES[body.plugin.level].br;
        const overloaded = age > 2500 && body.position.y - br < DANGER_Y + 6 && body.speed < 0.6;
        if (overloaded) {
          body.plugin.dangerMs += 16.666;
          maxDanger = Math.max(maxDanger, body.plugin.dangerMs);
        } else {
          body.plugin.dangerMs = Math.max(0, body.plugin.dangerMs - 33);
        }
      }
      dangerMsRef.current = maxDanger;
      setDangerLevel(Math.min(1, maxDanger / 4200));
      if (maxDanger > 4200 && !overRef.current) {
        overRef.current = true;
        setGameOverOpen(true);
        beep(110, 0.6, 'sawtooth', 0.2);
      }
      for (const f of floatersRef.current) {
        const node = stageRef.current && stageRef.current.findOne('#' + f.id);
        if (node) {
          const t = (now - f.t0) / 900;
          node.y(-(40 * t));
          node.opacity(1 - t);
        }
      }
      for (const p of popsRef.current) {
        const node = stageRef.current && stageRef.current.findOne('#' + p.id);
        if (node) {
          const t = (now - p.t0) / 450;
          node.radius(10 + 55 * t);
          node.opacity(0.7 * (1 - t));
        }
      }
      const heldNode = stageRef.current && stageRef.current.findOne('#held');
      if (heldNode) heldNode.position({ x: aimRef.current, y: DROP_Y });
      const guideNode = stageRef.current && stageRef.current.findOne('#guide');
      if (guideNode) guideNode.points([aimRef.current, DROP_Y + SPECIES[heldRef.current.level].br, aimRef.current, FLOOR_Y]);
      // dessin immédiat des layers animés (batchDraw de Konva repose sur rAF, coupable d'être en pause)
      layer.draw();
      const layers = stageRef.current && stageRef.current.getLayers();
      if (layers && layers[3]) layers[3].draw();
      if (layers && layers[4]) layers[4].draw();
    };
    // setInterval plutôt que rAF : relayée par le timer du navigateur, la boucle
    // survit aux onglets masqués (Chrome coupe requestAnimationFrame) — et c'est la norme maison.
    const iv = setInterval(loop, 16);
    return () => {
      clearInterval(iv);
      Matter.Composite.clear(engine.world, false);
      Matter.Engine.clear(engine);
    };
  }, [spawnPiece]);

  useEffect(() => {
    floatersRef.current = floaters;
    popsRef.current = pops;
  }, [floaters, pops]);

  useEffect(() => {
    if (nextLevel == null) setNextLevel(randomDropSpecies());
  }, [nextLevel]);

  // ---------- actions joueur ----------
  const doDrop = useCallback(() => {
    if (overRef.current || engineRef.current == null) return;
    if (performance.now() < cooldownUntilRef.current) return;
    const br = SPECIES[heldRef.current.level].br;
    const x = Math.max(WALL_L + br, Math.min(WALL_R - br, aimRef.current));
    spawnPiece(heldRef.current.level, x, DROP_Y + br * 0.5);
    beep(120, 0.06, 'sine', 0.08);
    // rafale : cooldown écourté tant que le doigt reste appuyé
    cooldownUntilRef.current = performance.now() + (burstRef.current ? 240 : COOLDOWN_MS);
    const nxt = nextLevel ?? randomDropSpecies();
    const apres = randomDropSpecies();
    heldRef.current = { level: nxt };
    setHeld(heldRef.current);
    setNextLevel(apres);
  }, [nextLevel, spawnPiece]);

  const doDropRef = useRef(doDrop);
  doDropRef.current = doDrop;

  useEffect(() => {
    const onKey = (e) => {
      if (overRef.current) return;
      if (e.key === 'ArrowLeft') aimRef.current = Math.max(WALL_L, aimRef.current - 24);
      if (e.key === 'ArrowRight') aimRef.current = Math.min(WALL_R, aimRef.current + 24);
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); doDrop(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [doDrop]);

  const reset = useCallback(() => {
    overRef.current = false;
    comboRef.current = { count: 0, lastAt: 0 };
    dangerMsRef.current = 0;
    if (engineRef.current) {
      for (const body of bodiesRef.current.values()) {
        Matter.Composite.remove(engineRef.current.world, body);
      }
    }
    bodiesRef.current.clear();
    setPieces([]);
    setFloaters([]);
    setPops([]);
    setScore(0);
    setDangerLevel(0);
    setHeld({ level: randomDropSpecies() });
    setNextLevel(randomDropSpecies());
    cooldownUntilRef.current = 0;
  }, []);

  const restart = useCallback(() => {
    reset();
    setGameOverOpen(false);
  }, [reset]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
      <Typography variant="h5" sx={{ mb: 0.5 }}>🧫 Bouillon de Culture</Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
        Fusionne deux microbes identiques : l'évolution change leur FORME, pas leur taille. Attention au débordement !
      </Typography>

      <Box sx={{ display: 'flex', gap: 4, mb: 1, alignItems: 'baseline' }}>
        <Typography variant="h4">{score}</Typography>
        <Typography variant="body1" color="textSecondary">record : {best}</Typography>
      </Box>

      <Box sx={{ border: '2px solid #666', borderRadius: 8, overflow: 'hidden', bgcolor: '#0e1a10' }}>
        <Stage
          ref={stageRef}
          width={STAGE_W}
          height={STAGE_H}
          onPointerDown={() => {
            const pos = stageRef.current.getPointerPosition();
            if (!pos || overRef.current) return;
            aimRef.current = Math.max(WALL_L, Math.min(WALL_R, pos.x));
            burstRef.current = true;
            doDropRef.current();
          }}
          onPointerMove={() => {
            const pos = stageRef.current.getPointerPosition();
            if (pos) aimRef.current = Math.max(WALL_L, Math.min(WALL_R, pos.x));
          }}
          onPointerUp={() => { burstRef.current = false; }}
          onPointerLeave={() => { burstRef.current = false; }}
          onPointerCancel={() => { burstRef.current = false; }}
          style={{ touchAction: 'none', cursor: 'pointer' }}
        >
          <Layer listening={false}>
            <Rect x={WALL_L} y={DANGER_Y} width={WALL_R - WALL_L} height={FLOOR_Y - DANGER_Y} fill="#23402a" />
            <Rect x={WALL_L} y={DANGER_Y} width={WALL_R - WALL_L} height={14} fill="#2d5236" />
            <Text x={WALL_L} y={STAGE_H - 58} text="Spore → Bacille → Diplocoque → L'Huit → Paramécie → Euglène → Rotifère → Tardigrade → Souche-Mère" width={WALL_R - WALL_L} align="center" fontSize={9} fill="#5a8a66" />
          </Layer>

          <Layer listening={false}>
            <Line points={[WALL_L - 10, DANGER_Y + 8, WALL_L - 10, FLOOR_Y + 10, WALL_R + 10, FLOOR_Y + 10, WALL_R + 10, DANGER_Y + 8]} stroke="#cfd8dc" strokeWidth={WALL_T} lineJoin="round" opacity={0.85} />
            <ShapeDanger dangerLevel={dangerLevel} />
          </Layer>

          <Layer ref={pieceLayerRef} listening={false}>
            {pieces.map(({ id, level }) => (
              <Group key={id} id={'b' + id} x={STAGE_W / 2} y={DROP_Y}>
                <PieceLooks level={level} eyeSeed={id} />
              </Group>
            ))}
          </Layer>

          <Layer listening={false}>
            {pops.map((p) => (
              <Circle key={p.id} id={p.id} x={p.x} y={p.y} radius={10} stroke={p.color} strokeWidth={5} opacity={0.7} />
            ))}
            {floaters.map((f) => (
              <Text key={f.id} id={f.id} x={f.x - 60} y={f.y - 20} width={120} align="center" text={f.text} fontSize={22} fontStyle="bold" fill={f.color} shadowColor="#000" shadowBlur={6} />
            ))}
          </Layer>

          <Layer>
            <Line id="guide" points={[STAGE_W / 2, DROP_Y, STAGE_W / 2, FLOOR_Y]} stroke="#ffffff" strokeWidth={1.5} dash={[6, 8]} opacity={0.35} listening={false} />
            {held && (
              <Group id="held" x={STAGE_W / 2} y={DROP_Y} opacity={0.95} listening={false}>
                <PieceLooks level={held.level} eyeSeed={0} />
              </Group>
            )}
            <Text x={WALL_R - 40} y={10} text="suivant" fontSize={11} fill="#9be36a" width={40} align="center" listening={false} />
            {nextLevel != null && (
              <Group x={WALL_R - 20} y={44} opacity={0.9} listening={false}>
                <MiniLooks level={nextLevel} />
              </Group>
            )}
          </Layer>
        </Stage>
      </Box>

      <Box sx={{ mt: 1, display: 'flex', gap: 2 }}>
        <Button variant="contained" onClick={doDrop} disabled={gameOverOpen}>
          Lâcher (Espace)
        </Button>
        <Button variant="outlined" onClick={restart}>Recommencer</Button>
      </Box>
      <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
        ← → pour viser · clic pour lâcher · MAINTIENS le clic pour mitrailler · combo si tu fusionnes vite
      </Typography>

      <GameOver
        open={gameOverOpen}
        gameName="Bouillon de Culture"
        score={score}
        gameOverReason="Le bouillon a débordé de la boîte de Pétri !"
        handleClose={() => setGameOverOpen(false)}
        handleRestart={restart}
      />
    </Box>
  );
}

// ================= rendu morphologique =================
const EYE = ({ x, y, r, ang = 0 }) => (
  <>
    <Circle x={x} y={y} radius={r} fill="#fff" />
    <Circle x={x + Math.cos(ang) * r * 0.4} y={y + Math.sin(ang) * r * 0.4 * 0.6} radius={r * 0.5} fill="#222" />
  </>
);

// corps physique dessiné (le rigolo de la famille des shapes)
const PhysShapes = ({ level }) => {
  const sp = SPECIES[level];
  const stroke = shade(sp.color, -45);
  return sp.phys.map((p, i) => {
    if (p.t === 'c') return <Circle key={'p' + i} x={p.o[0]} y={p.o[1]} radius={p.r} fill={sp.color} stroke={stroke} strokeWidth={2.5} />;
    if (p.t === 'r') return <Rect key={'p' + i} x={p.o[0] - p.w / 2} y={p.o[1] - p.h / 2} width={p.w} height={p.h} cornerRadius={Math.min(p.w, p.h) / 2} fill={sp.color} stroke={stroke} strokeWidth={2.5} />;
    if (p.t === 'e') return <Ellipse key={'p' + i} x={p.o[0]} y={p.o[1]} radiusX={p.rx} radiusY={p.ry} fill={sp.color} stroke={stroke} strokeWidth={2.5} />;
    if (p.t === 'p') return <RegularPolygon key={'p' + i} x={p.o[0]} y={p.o[1]} sides={p.s} radius={p.r} rotation={-90} fill={sp.color} stroke={stroke} strokeWidth={2.5} />;
    return null;
  });
};

const CILIA = (() => {
  // paramécie : une couronne de cils
  const out = [];
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const c = Math.cos(a), s = Math.sin(a);
    out.push([32 * c, 15 * s, 32 * c * 1.16, 15 * s * 1.16]);
  }
  return out;
})();

// les yeux et les appendices qui font le charme de chaque stade
const Decor = ({ level, eyeAng }) => {
  switch (level) {
    case 0:
      return (<>
        <EYE x={-4.5} y={-3.5} r={4} ang={eyeAng} />
        <EYE x={4.5} y={-3.5} r={4} ang={eyeAng} />
        <Ellipse x={0} y={5} radiusX={2.5} radiusY={1.5} fill="#222" opacity={0.55} />
      </>);
    case 1:
      return (<>
        <Line points={[-12, -9, -12, 9]} stroke="rgba(0,0,0,0.25)" strokeWidth={2.5} />
        <Line points={[0, -9, 0, 9]} stroke="rgba(0,0,0,0.25)" strokeWidth={2.5} />
        <Line points={[12, -9, 12, 9]} stroke="rgba(0,0,0,0.25)" strokeWidth={2.5} />
        <EYE x={-9} y={-3} r={4.2} ang={eyeAng} />
        <EYE x={9} y={-3} r={4.2} ang={eyeAng} />
      </>);
    case 2:
      return (<>
        <EYE x={-13} y={-3} r={3.8} ang={eyeAng + 1} />
        <EYE x={13} y={-3} r={3.8} ang={eyeAng} />
      </>);
    case 3:
      return (<>
        <EYE x={-5.5} y={-17} r={4} ang={eyeAng} />
        <EYE x={5.5} y={-17} r={4} ang={eyeAng} />
        <Ellipse x={0} y={15} radiusX={4} radiusY={2.4} fill="#222" opacity={0.6} />
        <Line points={[-6, 0, 6, 0]} stroke="rgba(0,0,0,0.3)" strokeWidth={2.5} />
      </>);
    case 4:
      return (<>
        {CILIA.map((c, i) => <Line key={'c' + i} points={c} stroke="rgba(0,0,0,0.35)" strokeWidth={1.6} />)}
        <EYE x={-8} y={-4} r={3.6} ang={eyeAng} />
        <EYE x={8} y={-4} r={3.6} ang={eyeAng} />
        <Ellipse x={2} y={6} radiusX={3} radiusY={5} fill="#222" opacity={0.35} />
      </>);
    case 5:
      return (<>
        <Line points={[0, -27, 4, -40, -4, -52, 3, -64]} tension={0.7} stroke={shade(SPECIES[5].color, -70)} strokeWidth={2.2} />
        <Circle x={-7} y={5} radius={3.2} fill="rgba(0,0,0,0.3)" />
        <Circle x={8} y={9} radius={2.6} fill="rgba(0,0,0,0.3)" />
        <EYE x={-5} y={-6} r={3.4} ang={eyeAng} />
        <EYE x={6} y={-6} r={3.4} ang={eyeAng} />
      </>);
    case 6:
      return (<>
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
          return <Circle key={'d' + i} x={Math.cos(a) * 25} y={Math.sin(a) * 25} radius={3} fill="rgba(0,0,0,0.3)" />;
        })}
        <EYE x={-5} y={-2} r={4.2} ang={eyeAng} />
        <EYE x={5} y={-2} r={4.2} ang={eyeAng} />
        <Ellipse x={0} y={8} radiusX={3.4} radiusY={2} fill="#222" opacity={0.55} />
      </>);
    case 7:
      return (<>
        {[-30, -10, 10, 30].map((lx, i) => [
          <Line key={'l' + i + 'a'} points={[lx, 14, lx - 5, 27]} stroke={shade(SPECIES[7].color, -55)} strokeWidth={4} lineCap="round" />,
          <Line key={'l' + i + 'b'} points={[lx, 14, lx + 5, 27]} stroke={shade(SPECIES[7].color, -55)} strokeWidth={4} lineCap="round" />,
        ])}
        <EYE x={-9} y={-6} r={5.2} ang={eyeAng} />
        <EYE x={9} y={-6} r={5.2} ang={eyeAng} />
        <Line points={[-4, 8, 0, 11, 4, 8]} stroke="#222" strokeWidth={2} lineCap="round" tension={0.5} opacity={0.6} />
      </>);
    default:
      return (<>
        <Line points={[-12, -37, -6, -46, 0, -37, 6, -46, 12, -37]} stroke="#ffd700" strokeWidth={3} />
        <EYE x={-6} y={-22} r={4} ang={eyeAng} />
        <EYE x={6} y={-22} r={4} ang={eyeAng} />
        <EYE x={-21} y={10} r={3.6} ang={eyeAng + 1.5} />
        <EYE x={21} y={10} r={3.6} ang={eyeAng + 2.5} />
        <Line points={[-8, -12, 0, -8, 8, -12]} stroke="#222" strokeWidth={2.2} tension={0.4} opacity={0.7} />
      </>);
  }
};

// silhouette complète d'une pièce
const PieceLooks = ({ level, eyeSeed }) => {
  const eyeAng = seedAngle(eyeSeed);
  return (<>
    <PhysShapes level={level} />
    <Decor level={level} eyeAng={eyeAng} />
  </>);
};

// version mini pour l'aperçu "suivant"
const MiniLooks = ({ level }) => {
  const sp = SPECIES[level];
  const s = 12 / sp.br;
  return (
    <Group scale={{ x: s, y: s }}>
      <PhysShapes level={level} />
    </Group>
  );
};

const ShapeDanger = ({ dangerLevel }) => {
  const opacity = dangerLevel > 0 ? 0.25 + 0.75 * dangerLevel : 0.12;
  const dash = [12 + 10 * (1 - dangerLevel), 8];
  return (
    <>
      <Line points={[WALL_L, DANGER_Y, WALL_R, DANGER_Y]} stroke={dangerLevel > 0.6 ? '#ff4136' : '#ffb700'} strokeWidth={2} dash={dash} opacity={opacity} />
      <Text x={WALL_L + 6} y={DANGER_Y - 18} text="ne pas remplir au-delà" fontSize={11} fill="#ffb700" opacity={0.55} />
    </>
  );
};

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const clamp = (v) => Math.max(0, Math.min(255, v));
  const r = clamp((n >> 16) + amt);
  const g = clamp(((n >> 8) & 0xff) + amt);
  const b = clamp((n & 0xff) + amt);
  return `rgb(${r},${g},${b})`;
}

function seedAngle(seed) {
  return (((seed * 137.5 + 42) % 360) / 360) * Math.PI * 2;
}
