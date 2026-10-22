import { useEffect, useRef, useState } from 'react';
import { Button, IconButton, Tooltip } from '@mui/material';
import { Pause, PlayArrow, VolumeUp, VolumeOff, FastForward, Replay } from '@mui/icons-material';
import { GameOver as GameOverPanel } from '../ChuckNorrisFact';
import { soundManager, soundMap } from '../rpg/sons/SoundManager';
import {
  W, C, PLAYER, NEUTRAL, FACTIONS, LEVELS, TAUNTS, AIS, createLevel, step, previewShot, sendFleet, totals, levelScore,
} from './engine';
import './orbitales.css';

const SOUNDS = { launch: 'slash', capture: 'coupReussi', lost: 'coupVide', burn: 'fire', win: 'finNiveau', lose: 'explosion' };
const RATIOS = [0.25, 0.5, 0.75, 1];
const TICK = 1000 / 60;
const pick = a => a[Math.floor(Math.random() * a.length)];

const STARS = Array.from({ length: 170 }, (_, i) => ({ x: (i * 7919) % 1000, y: (i * 104729) % 997, r: ((i * 31) % 10) / 10 + 0.3, p: i }));

// Formation stable des vaisseaux autour du centre de la flotte
function formation(f) {
  const n = Math.min(Math.ceil(f.ships), 26);
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = i * 2.39996 + f.id;
    const d = 3.2 * Math.sqrt(i);
    pts.push([Math.cos(a) * d, Math.sin(a) * d]);
  }
  return pts;
}

function draw(ctx, s, ui, size, now) {
  const k = size / W;
  ctx.setTransform(k * ui.dpr, 0, 0, k * ui.dpr, 0, 0);
  const g = ctx.createRadialGradient(C, C, 40, C, C, 720);
  g.addColorStop(0, '#1b1530'); g.addColorStop(0.5, '#0b0d1c'); g.addColorStop(1, '#04050c');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, W);
  for (const st of STARS) {
    ctx.globalAlpha = 0.35 + 0.35 * Math.sin(now / 900 + st.p);
    ctx.fillStyle = '#cfd8ff';
    ctx.fillRect(st.x, st.y, st.r * 1.6, st.r * 1.6);
  }
  ctx.globalAlpha = 1;
  const fontPx = Math.max(15, 12 / k);

  // anneaux d'orbite
  const radii = [...new Set(s.planets.map(p => p.r))];
  ctx.lineWidth = 1 / k;
  ctx.setLineDash([4 / k, 7 / k]);
  ctx.strokeStyle = 'rgba(150,170,255,0.13)';
  radii.forEach(r => { ctx.beginPath(); ctx.arc(C, C, r, 0, Math.PI * 2); ctx.stroke(); });
  ctx.setLineDash([]);

  // soleil + couronne
  const pulse = 1 + 0.05 * Math.sin(now / 300);
  const cg = ctx.createRadialGradient(C, C, s.sunR * 0.5, C, C, s.coronaR * 1.25 * pulse);
  cg.addColorStop(0, 'rgba(255,190,90,0.55)'); cg.addColorStop(0.55, 'rgba(255,100,40,0.18)'); cg.addColorStop(1, 'rgba(255,60,20,0)');
  ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(C, C, s.coronaR * 1.25 * pulse, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,120,60,0.35)'; ctx.lineWidth = 1.2 / k; ctx.setLineDash([2 / k, 6 / k]);
  ctx.beginPath(); ctx.arc(C, C, s.coronaR, now / 4000, now / 4000 + Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
  const sg = ctx.createRadialGradient(C - 10, C - 10, 4, C, C, s.sunR);
  sg.addColorStop(0, '#fffbe0'); sg.addColorStop(0.5, '#ffd36a'); sg.addColorStop(1, '#ff8a2a');
  ctx.fillStyle = sg; ctx.shadowColor = '#ffae42'; ctx.shadowBlur = 40;
  ctx.beginPath(); ctx.arc(C, C, s.sunR, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;

  // aperçu de tir
  const tgt = ui.hover != null ? s.planets[ui.hover] : null;
  if (ui.sel.length && tgt) {
    for (const id of ui.sel) {
      const src = s.planets[id];
      if (src === tgt) continue;
      const shot = previewShot(s, src, tgt);
      const danger = shot.survive < 0.97;
      ctx.strokeStyle = danger ? 'rgba(255,120,70,0.9)' : 'rgba(94,230,208,0.75)';
      ctx.lineWidth = 2 / k; ctx.setLineDash([8 / k, 6 / k]);
      ctx.beginPath(); ctx.moveTo(src.x, src.y); ctx.lineTo(shot.x, shot.y); ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 1.5 / k;
      ctx.beginPath(); ctx.arc(shot.x, shot.y, tgt.rad + 4, 0, Math.PI * 2); ctx.stroke();
      if (ui.sel.length === 1 || danger) {
        ctx.font = `600 ${fontPx * 0.85}px system-ui, sans-serif`; ctx.textAlign = 'center';
        ctx.fillStyle = danger ? '#ffab7a' : '#bff7ee';
        const label = `${shot.T.toFixed(1)} s${danger ? `  ☀ −${Math.round((1 - shot.survive) * 100)} %` : ''}`;
        ctx.fillText(label, (src.x + shot.x) / 2, (src.y + shot.y) / 2 - 8);
      }
    }
  } else if (ui.sel.length && ui.dragging && ui.pointer) {
    ctx.strokeStyle = 'rgba(94,230,208,0.4)'; ctx.lineWidth = 1.5 / k; ctx.setLineDash([5 / k, 6 / k]);
    ui.sel.forEach(id => { const p = s.planets[id]; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(ui.pointer.x, ui.pointer.y); ctx.stroke(); });
    ctx.setLineDash([]);
  }

  // flottes
  for (const f of s.fleets) {
    const col = FACTIONS[f.owner].color;
    const dx = f.x1 - f.x0, dy = f.y1 - f.y0, len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len;
    ctx.strokeStyle = col; ctx.globalAlpha = 0.18; ctx.lineWidth = 2 / k;
    ctx.beginPath(); ctx.moveTo(f.x - ux * 30, f.y - uy * 30); ctx.lineTo(f.x, f.y); ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = f.burning > 0 ? '#ffb070' : col;
    for (const [ox, oy] of formation(f)) {
      const x = f.x + ox, y = f.y + oy;
      ctx.beginPath(); ctx.moveTo(x + ux * 4, y + uy * 4); ctx.lineTo(x - ux * 3 - uy * 2.4, y - uy * 3 + ux * 2.4); ctx.lineTo(x - ux * 3 + uy * 2.4, y - uy * 3 - ux * 2.4); ctx.fill();
    }
    if (f.ships >= 4) {
      ctx.font = `600 ${fontPx * 0.75}px system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.fillStyle = col;
      ctx.fillText(Math.round(f.ships), f.x, f.y - 16 - Math.sqrt(f.ships));
    }
  }
  for (const sp of s.sparks) { ctx.globalAlpha = sp.life / 0.6; ctx.fillStyle = '#ffcf7a'; ctx.fillRect(sp.x, sp.y, 2.5, 2.5); }
  ctx.globalAlpha = 1;

  // planètes
  for (const p of s.planets) {
    const fac = FACTIONS[p.owner];
    const lx = C - p.x, ly = C - p.y, ll = Math.hypot(lx, ly) || 1; // éclairées depuis le soleil
    const pg = ctx.createRadialGradient(p.x + (lx / ll) * p.rad * 0.5, p.y + (ly / ll) * p.rad * 0.5, 1, p.x, p.y, p.rad * 1.15);
    pg.addColorStop(0, p.owner === NEUTRAL ? '#c9cfdb' : '#ffffff'); pg.addColorStop(0.35, fac.color); pg.addColorStop(1, '#05060d');
    if (p.owner !== NEUTRAL) { ctx.shadowColor = fac.glow; ctx.shadowBlur = 18; }
    ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(p.x, p.y, p.rad, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    if (p.flash > 0) {
      ctx.strokeStyle = fac.color; ctx.globalAlpha = p.flash; ctx.lineWidth = 3 / k;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.rad + (1 - p.flash) * 50, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
    }
    if (ui.sel.includes(p.id) || ui.hover === p.id) {
      ctx.strokeStyle = ui.sel.includes(p.id) ? '#5ee6d0' : '#ffffff'; ctx.lineWidth = 2.5 / k;
      ctx.setLineDash(ui.sel.includes(p.id) ? [] : [5 / k, 4 / k]);
      ctx.beginPath(); ctx.arc(p.x, p.y, p.rad + 7, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.font = `700 ${fontPx}px system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 3.5 / k; ctx.strokeStyle = 'rgba(0,0,0,0.75)';
    const txt = String(Math.floor(p.ships));
    ctx.strokeText(txt, p.x, p.y); ctx.fillStyle = '#fff'; ctx.fillText(txt, p.x, p.y);
    ctx.textBaseline = 'alphabetic';
  }
}

function PowerBar({ hud }) {
  const total = hud.players.reduce((a, o) => a + hud.tot[o].ships, 0) || 1;
  return <div className="orb-power" aria-label="Rapport de forces">
    {hud.players.map(o => <div key={o} style={{ flexGrow: hud.tot[o].ships / total, background: FACTIONS[o].color }} title={`${FACTIONS[o].name} : ${Math.round(hud.tot[o].ships)} vaisseaux`} />)}
  </div>;
}

export default function Orbitales() {
  const canvas = useRef(null);
  const wrap = useRef(null);
  const game = useRef(null);
  const ui = useRef({ sel: [], hover: null, dragging: false, pointer: null, down: null, dpr: 1, size: 600, ratio: 0.5, speed: 1 });
  const flow = useRef({ screen: 'title', paused: false });
  const [screen, setScreen] = useState('title'); // title | intro | playing | won | lost | over
  const [hud, setHud] = useState(null);
  const [ratio, setRatio] = useState(0.5);
  const [speed, setSpeed] = useState(1);
  const [paused, setPaused] = useState(false);
  const [sound, setSound] = useState(true);
  const [taunt, setTaunt] = useState(null);
  const [run, setRun] = useState({ level: 0, score: 0, lives: 3 });
  const [result, setResult] = useState(null);
  const [hint, setHint] = useState(0);
  const [showGameOver, setShowGameOver] = useState(false);
  const soundRef = useRef(true);
  const tauntAt = useRef({});
  const hintRef = useRef(0);

  flow.current.screen = screen;
  flow.current.paused = paused;
  soundRef.current = sound;
  ui.current.ratio = ratio;
  ui.current.speed = speed;
  hintRef.current = hint;

  function sfx(name, volume = 0.25) {
    if (!soundRef.current) return;
    soundManager.play(`orb.${SOUNDS[name]}`, { volume });
  }

  function say(owner, kind, force) {
    const now = performance.now();
    if (!force && now - (tauntAt.current[owner] || 0) < 6000) return;
    tauntAt.current[owner] = now;
    setTaunt({ owner, text: pick(TAUNTS[owner][kind]), id: now });
  }

  function newDemo() {
    const s = createLevel(3, (Math.random() * 1e9) | 0);
    s.ais.push({ owner: PLAYER, ...AIS[3].normal, next: 2 });
    s.demo = true;
    game.current = s;
  }

  // sons
  useEffect(() => {
    soundManager.loadSounds(Object.fromEntries(Object.values(SOUNDS).map(k => [`orb.${k}`, soundMap[k]])));
    return () => Object.values(SOUNDS).forEach(k => soundManager.stop(`orb.${k}`));
  }, []);

  // taille du canvas
  useEffect(() => {
    function resize() {
      const el = wrap.current; if (!el) return;
      const size = Math.floor(Math.min(el.clientWidth, Math.max(320, window.innerHeight - 150)));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ui.current.size = size; ui.current.dpr = dpr;
      canvas.current.width = size * dpr; canvas.current.height = size * dpr;
      canvas.current.style.width = `${size}px`; canvas.current.style.height = `${size}px`;
    }
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // boucle principale
  useEffect(() => {
    if (!game.current || game.current.demo) newDemo();
    let last = performance.now(), hudClock = 0, launchSfx = 0;
    const id = setInterval(() => {
      const now = performance.now();
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const s = game.current; if (!s) return;
      const fl = flow.current;
      const running = (fl.screen === 'playing' && !fl.paused && !document.hidden) || (s.demo && fl.screen === 'title');
      if (running) {
        const sub = s.demo ? 1 : ui.current.speed;
        for (let i = 0; i < sub; i++) step(s, dt);
        if (s.demo && s.phase !== 'playing') newDemo();
      }
      if (!s.demo) {
        for (const e of s.events) {
          if (e.type === 'launch' && e.owner === PLAYER && now - launchSfx > 120) { launchSfx = now; sfx('launch', 0.12); }
          if (e.type === 'capture' && e.owner === PLAYER) { sfx('capture', 0.25); if (e.from !== NEUTRAL && Math.random() < 0.6) say(e.from, 'lose'); }
          if (e.type === 'capture' && e.from === PLAYER) { sfx('lost', 0.3); say(e.owner, 'capture'); }
          if (e.type === 'burn' && e.owner !== PLAYER && Math.random() < 0.5) say(e.owner, 'burn');
          if (e.type === 'burn' && e.owner === PLAYER) sfx('burn', 0.15);
          if (e.type === 'eliminated') say(e.owner, 'dying', true);
          if (e.type === 'launch' && e.owner === PLAYER && hintRef.current === 0) setHint(1);
          if (e.type === 'capture' && e.owner === PLAYER && hintRef.current === 1) setHint(2);
        }
      }
      s.events.length = 0;
      draw(canvas.current.getContext('2d'), s, ui.current, ui.current.size, now);
      hudClock -= dt;
      if (!s.demo && hudClock <= 0) {
        hudClock = 0.2;
        setHud({ tot: totals(s), players: s.players, t: s.t, name: s.name });
        if (s.phase !== 'playing' && fl.screen === 'playing') finish(s);
      }
    }, TICK);
    return () => clearInterval(id);
  }, []);

  function finish(s) {
    ui.current.sel = []; ui.current.hover = null;
    if (s.phase === 'won') {
      const sc = levelScore(s);
      sfx('win', 0.3);
      setResult({ ...sc, t: s.t, stats: s.stats });
      setRun(r => ({ ...r, score: r.score + sc.total }));
      setScreen('won');
    } else {
      sfx('lose', 0.3);
      if (s.winner) say(s.winner, 'win', true);
      setResult({ t: s.t, stats: s.stats, winner: s.winner });
      setRun(r => ({ ...r, lives: r.lives - 1 }));
      setScreen('lost');
    }
  }

  function startLevel(level) {
    game.current = createLevel(level);
    ui.current.sel = []; ui.current.hover = null;
    tauntAt.current = {};
    setTaunt(null); setPaused(false); setResult(null);
    setHud({ tot: totals(game.current), players: game.current.players, t: 0, name: game.current.name });
    setScreen('intro');
  }

  function go() {
    setScreen('playing');
    const s = game.current;
    s.ais.forEach((ai, i) => setTimeout(() => say(ai.owner, 'start', true), 600 + i * 2600));
  }

  function newRun() {
    setRun({ level: 0, score: 0, lives: 3 });
    setShowGameOver(false);
    setHint(0);
    startLevel(0);
  }

  // --- entrées pointeur -------------------------------------------------
  function toWorld(e) {
    const r = canvas.current.getBoundingClientRect();
    const k = W / r.width;
    return { x: (e.clientX - r.left) * k, y: (e.clientY - r.top) * k };
  }
  function planetAt(pt) {
    const s = game.current; const k = ui.current.size / W;
    let best = null, bd = Infinity;
    for (const p of s.planets) {
      const d = Math.hypot(p.x - pt.x, p.y - pt.y);
      if (d < Math.max(p.rad + 16, 26 / k) && d < bd) { bd = d; best = p; }
    }
    return best;
  }
  function launch(target) {
    const s = game.current, u = ui.current;
    for (const id of u.sel) {
      const src = s.planets[id];
      if (src.owner !== PLAYER || src === target) continue;
      sendFleet(s, src, target, Math.max(1, src.ships * u.ratio));
    }
    u.sel = [];
  }
  const active = () => flow.current.screen === 'playing' && !flow.current.paused;

  function onDown(e) {
    if (!active()) return;
    canvas.current.setPointerCapture?.(e.pointerId);
    const pt = toWorld(e), p = planetAt(pt), u = ui.current;
    u.pointer = pt; u.down = pt;
    if (p && p.owner === PLAYER) {
      if (!u.sel.includes(p.id)) u.sel = u.sel.length && !e.shiftKey ? [p.id] : [...u.sel, p.id];
      u.dragging = true; u.hover = null; u.moved = false;
    } else if (p && u.sel.length) { launch(p); }
    else u.sel = [];
  }
  function onMove(e) {
    const s = game.current; if (!s || s.demo) return;
    const pt = toWorld(e), u = ui.current, p = planetAt(pt);
    u.pointer = pt;
    if (u.down && Math.hypot(pt.x - u.down.x, pt.y - u.down.y) > 20) u.moved = true;
    if (u.dragging && p && p.owner === PLAYER && !u.sel.includes(p.id) && u.moved) u.sel = [...u.sel, p.id];
    u.hover = p && u.sel.length && !(u.sel.length === 1 && u.sel[0] === p.id) ? p.id : null;
  }
  function onUp(e) {
    const u = ui.current;
    if (!u.dragging) return;
    u.dragging = false; u.down = null;
    if (!u.moved || !active()) return; // simple tap : on garde la sélection, le prochain tap choisit la cible
    const p = planetAt(toWorld(e));
    if (p) { u.sel = u.sel.filter(id => id !== p.id); launch(p); }
    u.hover = null;
  }

  // clavier : 1-4 ratio, espace pause
  useEffect(() => {
    function onKey(e) {
      if (/INPUT|TEXTAREA/.test(e.target.tagName)) return;
      const n = Number(e.key);
      if (n >= 1 && n <= 4) setRatio(RATIOS[n - 1]);
      if (e.key === ' ' && flow.current.screen === 'playing') { e.preventDefault(); setPaused(p => !p); }
      if (e.key.toLowerCase() === 'a' && flow.current.screen === 'playing') ui.current.sel = game.current.planets.filter(p => p.owner === PLAYER).map(p => p.id);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!taunt) return;
    const id = setTimeout(() => setTaunt(t => (t && t.id === taunt.id ? null : t)), 4200);
    return () => clearTimeout(id);
  }, [taunt]);

  const L = LEVELS[Math.min(run.level, LEVELS.length - 1)];
  const enemies = game.current && !game.current.demo ? game.current.ais.map(a => a.owner) : L.ais.map(a => a[0]);
  const lastCampaign = run.level === LEVELS.length - 1;
  const HINTS = [
    'Glisse depuis ta planète turquoise vers une planète grise. Le chiffre, ce sont les vaisseaux.',
    'Les grosses planètes produisent plus vite. Les neutres, elles, ne produisent rien.',
    'Le soleil brûle les flottes qui traversent sa couronne. Vise quand c’est aligné !',
  ];

  return <div className="orb">
    <div className="orb-top">
      <div className="orb-title"><span className="orb-logo">◐</span> ORBITALES</div>
      {screen !== 'title' && hud && <>
        <div className="orb-level">Système {run.level + 1}<span> · {hud.name}</span></div>
        <div className="orb-meta"><span className="orb-lives">{'●'.repeat(Math.max(0, run.lives))}<i>{'●'.repeat(Math.max(0, 3 - run.lives))}</i></span><span>{run.score.toLocaleString('fr-FR')} pts</span><span>{Math.floor(hud.t / 60)}:{String(Math.floor(hud.t % 60)).padStart(2, '0')}</span></div>
      </>}
    </div>
    {screen !== 'title' && hud && <PowerBar hud={hud} />}

    <div className="orb-stage" ref={wrap}>
      <canvas ref={canvas} className="orb-canvas" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onContextMenu={e => e.preventDefault()} />

      {taunt && screen !== 'title' && <div className="orb-taunt" key={taunt.id} style={{ '--c': FACTIONS[taunt.owner].color }}>
        <b>{FACTIONS[taunt.owner].name}</b>{taunt.text}
      </div>}
      {screen === 'playing' && run.level === 0 && hint < 3 && <div className="orb-hint" onClick={() => setHint(h => h + 1)}>{HINTS[hint]} <small>✕</small></div>}
      {paused && screen === 'playing' && <div className="orb-overlay"><div className="orb-card"><h2>Pause</h2><Button variant="contained" className="orb-cta" onClick={() => setPaused(false)}>Reprendre</Button></div></div>}

      {screen === 'title' && <div className="orb-overlay soft"><div className="orb-card">
        <p className="orb-eyebrow">UNE GUERRE AU RALENTI · AUTOUR D’UNE ÉTOILE TRÈS CHAUDE</p>
        <h1>Orbitales</h1>
        <ul>
          <li><b>Glisse</b> d’une de tes planètes vers une autre pour y envoyer une flotte.</li>
          <li>Tout <b>tourne</b> : vise où la cible <i>sera</i>, pas où elle est.</li>
          <li>Le <b>soleil</b> grille ce qui passe trop près. Patience, alignement, et… feu.</li>
        </ul>
        <Button variant="contained" className="orb-cta" onClick={newRun}>Prendre les commandes</Button>
        <p className="orb-fine">7 systèmes · 2 IA à faire taire · 3 vies</p>
      </div></div>}

      {screen === 'intro' && <div className="orb-overlay"><div className="orb-card">
        <p className="orb-eyebrow">SYSTÈME {run.level + 1}{run.level >= LEVELS.length ? ' · MODE INFINI' : ` / ${LEVELS.length}`}</p>
        <h2>{game.current.name}</h2>
        <div className="orb-vs">{enemies.map(o => <span key={o} style={{ color: FACTIONS[o].color }}>{FACTIONS[o].name}</span>)}</div>
        {L.bigSun && <p className="orb-warn">☀ Étoile géante : la couronne est bien plus large.</p>}
        {enemies.length > 1 && <p className="orb-warn">Elles se détestent aussi entre elles. Profites-en.</p>}
        <Button variant="contained" className="orb-cta" onClick={go}>Lancer la partie</Button>
      </div></div>}

      {screen === 'won' && result && <div className="orb-overlay"><div className="orb-card">
        <p className="orb-eyebrow">SYSTÈME CONQUIS EN {Math.floor(result.t / 60)}:{String(Math.floor(result.t % 60)).padStart(2, '0')}</p>
        <h2>{lastCampaign ? 'L’étoile est à toi.' : pick(['Joli coup.', 'Propre.', 'Le silence radio, enfin.'])}</h2>
        <table className="orb-score"><tbody>
          <tr><td>Conquête</td><td>{result.base}</td></tr>
          <tr><td>Rapidité</td><td>{result.speed}</td></tr>
          <tr><td>Flotte restante</td><td>{result.fleet}</td></tr>
          <tr><td>Grillés par le soleil</td><td className="burn">{Math.round(result.stats.burned)} 🔥</td></tr>
          <tr className="sum"><td>Total de la course</td><td>{run.score.toLocaleString('fr-FR')}</td></tr>
        </tbody></table>
        <Button variant="contained" className="orb-cta" onClick={() => { setRun(r => ({ ...r, level: r.level + 1 })); startLevel(run.level + 1); }}>
          {lastCampaign ? 'Continuer en mode infini' : 'Système suivant →'}
        </Button>
        {run.level >= LEVELS.length - 1 && <Button className="orb-link" onClick={() => { setScreen('over'); setShowGameOver(true); }}>Encaisser le score</Button>}
      </div></div>}

      {screen === 'lost' && result && <div className="orb-overlay"><div className="orb-card">
        <p className="orb-eyebrow">{run.lives > 0 ? `IL TE RESTE ${run.lives} VIE${run.lives > 1 ? 'S' : ''}` : 'PLUS DE VIES'}</p>
        <h2>{result.winner ? `${FACTIONS[result.winner].name} l’emporte.` : 'Tout le monde a perdu.'}</h2>
        <p className="orb-sub">{Math.round(result.stats.burned) > 10 ? `Petit indice : ${Math.round(result.stats.burned)} de tes vaisseaux ont fini en barbecue solaire.` : 'Astuce : un rival qui vient d’attaquer laisse souvent sa planète presque vide.'}</p>
        {run.lives > 0
          ? <Button variant="contained" className="orb-cta" onClick={() => startLevel(run.level)}>Retenter ce système</Button>
          : <Button variant="contained" className="orb-cta" onClick={() => { setScreen('over'); setShowGameOver(true); }}>Voir mon score</Button>}
      </div></div>}

      {screen === 'over' && <div className="orb-overlay"><div className="orb-card">
        <p className="orb-eyebrow">FIN DE CAMPAGNE · SYSTÈME {run.level + 1}</p>
        <h2>{run.score.toLocaleString('fr-FR')} points</h2>
        <Button variant="contained" className="orb-cta" onClick={newRun}>Nouvelle campagne</Button>
      </div></div>}
    </div>

    {screen !== 'title' && <div className="orb-controls">
      <div className="orb-ratio" role="group" aria-label="Part de la garnison envoyée">
        <span>Envoyer</span>
        {RATIOS.map((r, i) => <button key={r} className={ratio === r ? 'on' : ''} onClick={() => setRatio(r)} title={`Touche ${i + 1}`}>{r * 100} %</button>)}
      </div>
      <div className="orb-tools">
        <Tooltip title="Vitesse ×2"><IconButton className={speed === 2 ? 'on' : ''} onClick={() => setSpeed(v => (v === 1 ? 2 : 1))} aria-label="Accélérer"><FastForward /></IconButton></Tooltip>
        <Tooltip title="Pause (espace)"><span><IconButton onClick={() => setPaused(p => !p)} aria-label="Pause" disabled={screen !== 'playing'}>{paused ? <PlayArrow /> : <Pause />}</IconButton></span></Tooltip>
        <Tooltip title={sound ? 'Couper le son' : 'Activer le son'}><IconButton onClick={() => setSound(v => !v)} aria-label="Son">{sound ? <VolumeUp /> : <VolumeOff />}</IconButton></Tooltip>
        <Tooltip title="Recommencer ce système (coûte une vie)"><span><IconButton onClick={() => { if (screen === 'playing' && run.lives > 1) { setRun(r => ({ ...r, lives: r.lives - 1 })); startLevel(run.level); } }} aria-label="Recommencer" disabled={screen !== 'playing' || run.lives <= 1}><Replay /></IconButton></span></Tooltip>
      </div>
    </div>}
    {screen !== 'title' && <p className="orb-help">Glisse pour envoyer · passe sur plusieurs planètes pour les combiner · tap-tap marche aussi · <kbd>A</kbd> tout sélectionner · <kbd>1-4</kbd> part envoyée · <kbd>espace</kbd> pause</p>}

    {showGameOver && <GameOverPanel open gameName="orbitales" score={run.score} gameOverReason={run.lives > 0 ? 'Campagne encaissée !' : 'Ta flotte a fini en poussière d’étoile.'} handleClose={() => setShowGameOver(false)} handleRestart={newRun} />}
  </div>;
}
