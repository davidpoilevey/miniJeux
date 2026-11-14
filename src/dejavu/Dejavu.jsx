import { useEffect, useRef, useState } from 'react';
import { Box, Button, IconButton, Typography } from '@mui/material';
import { VolumeUp, VolumeOff } from '@mui/icons-material';
import { GameOver as GameOverPanel } from '../ChuckNorrisFact';
import { soundManager, soundMap } from '../rpg/sons/SoundManager';
import { W, H, DT, R_PLAYER, R_ECHO, R_TARGET, GRACE, createGame, start, step, setAim, echoPos } from './engine';

/*
 * Déjà-vu — le jeu de Claude.
 * Tu ramasses des pastilles. Chaque trajet devient un écho de toi qui le rejoue en boucle.
 * Aucun ennemi n'est programmé : la difficulté, c'est ton propre passé.
 */

const BEST_KEY = 'dejavu_best';
const SOUNDS = { pick: 'gold', near: 'slash', dead: 'punch' };
const pickOne = a => a[Math.floor(Math.random() * a.length)];

const EPITAPHS = [
  age => `Percuté par toi-même d'il y a ${age} s. Il ne t'en veut pas : il ne se souvient de rien.`,
  age => `Ton toi d'il y a ${age} s avait la priorité. Il venait de droite, dans le temps.`,
  age => `Collision avec un écho vieux de ${age} s. Il faisait exactement ce que tu lui avais montré.`,
  age => `Tu t'es rentré dedans. L'autre toi (${age} s d'ancienneté) décline toute responsabilité.`,
];
const TIMEOUTS = [
  'Trou de mémoire : la pastille s’est lassée de t’attendre.',
  'Trop prudent. Tes échos, eux, n’hésitent jamais.',
];

function wrap(ctx, text, x, y, maxW, lh) {
  let line = '';
  for (const word of text.split(' ')) {
    const t = line ? `${line} ${word}` : word;
    if (ctx.measureText(t).width > maxW && line) { ctx.fillText(line, x, y); y += lh; line = word; } else line = t;
  }
  ctx.fillText(line, x, y);
  return y + lh;
}

const paths = new WeakMap(); // tracé mis en cache par écho
function echoPath(e) {
  let p = paths.get(e);
  if (!p) {
    p = new Path2D();
    p.moveTo(e.pts[0], e.pts[1]);
    for (let i = 2; i < e.pts.length; i += 2) p.lineTo(e.pts[i], e.pts[i + 1]);
    paths.set(e, p);
  }
  return p;
}

function draw(ctx, s, view, now) {
  ctx.setTransform(view.k, 0, 0, view.k, 0, 0);
  ctx.fillStyle = '#0a0d18';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(160,180,255,0.07)';
  for (let x = 30; x < W; x += 30) for (let y = 30; y < H; y += 30) ctx.fillRect(x, y, 1.2, 1.2);

  // les trajets : le dessin de ta partie
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 1.4;
  for (const e of s.echoes) {
    ctx.strokeStyle = `hsla(${e.hue},85%,68%,${s.phase === 'dead' ? 0.42 : 0.2})`;
    ctx.stroke(echoPath(e));
  }
  if (s.phase === 'playing' && s.path.length > 2) {
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.beginPath(); ctx.moveTo(s.path[0], s.path[1]);
    for (let i = 2; i < s.path.length; i += 2) ctx.lineTo(s.path[i], s.path[i + 1]);
    ctx.stroke();
  }

  // pastille + chrono
  const t = s.target;
  if (s.phase !== 'dead' || s.cause.by === 'timeout') {
    const left = s.phase === 'playing' ? Math.max(0, 1 - (s.tick - t.born) / t.ttl) : s.phase === 'ready' ? 1 : 0;
    const pulse = 1 + 0.08 * Math.sin(now / 160);
    const hot = left < 0.3;
    ctx.shadowColor = hot ? '#ff6a5a' : '#ffd76a'; ctx.shadowBlur = 16;
    ctx.fillStyle = hot ? '#ff8a6a' : '#ffd76a';
    ctx.globalAlpha = s.phase === 'dead' ? 0.3 : 1;
    ctx.beginPath(); ctx.arc(t.x, t.y, (R_TARGET - 5) * pulse, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = hot ? '#ff8a6a' : 'rgba(255,215,106,0.8)'; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.arc(t.x, t.y, R_TARGET + 3, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * left); ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // échos
  s.echoes.forEach((e, i) => {
    const [x, y] = echoPos(e, s.tick);
    const age = s.tick - e.born;
    const killer = s.phase === 'dead' && s.cause.echo === i;
    if (age < GRACE) { // matérialisation : anneau qui se referme, inoffensif
      const k = age / GRACE;
      ctx.strokeStyle = `hsla(${e.hue},90%,70%,${0.3 + 0.5 * k})`; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(x, y, R_ECHO + 14 * (1 - k), 0, Math.PI * 2); ctx.stroke();
      return;
    }
    ctx.shadowColor = `hsl(${e.hue},90%,60%)`; ctx.shadowBlur = killer ? 26 : 12;
    ctx.fillStyle = `hsl(${e.hue},85%,${killer ? 80 : 64}%)`;
    ctx.beginPath(); ctx.arc(x, y, R_ECHO, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(10,13,24,0.75)';
    ctx.beginPath(); ctx.arc(x, y, R_ECHO - 4.5, 0, Math.PI * 2); ctx.fill();
  });

  // toi
  if (s.phase !== 'dead' || Math.floor(now / 180) % 2) {
    ctx.shadowColor = '#fff'; ctx.shadowBlur = 14; ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(s.x, s.y, R_PLAYER, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
  }

  // points qui s'envolent
  ctx.textAlign = 'center'; ctx.font = '600 14px system-ui, sans-serif';
  view.floaters = view.floaters.filter(f => now - f.t0 < 800);
  for (const f of view.floaters) {
    const k = (now - f.t0) / 800;
    ctx.globalAlpha = 1 - k; ctx.fillStyle = f.color;
    ctx.fillText(f.text, f.x, f.y - 14 - 26 * k);
  }
  ctx.globalAlpha = 1;

  // score
  ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.font = '700 24px system-ui, sans-serif';
  ctx.fillText(String(s.score), 14, 32);
  ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.font = '500 12px system-ui, sans-serif';
  ctx.fillText(`${s.echoes.length} écho${s.echoes.length > 1 ? 's' : ''} · record ${view.best}`, W - 14, 28);

  if (s.phase === 'ready') {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff'; ctx.font = 'italic 44px Georgia, serif';
    ctx.fillText('Déjà-vu', W / 2, 150);
    ctx.fillStyle = 'rgba(255,255,255,0.72)'; ctx.font = '15px system-ui, sans-serif';
    let y = wrap(ctx, 'Attrape la pastille. Chaque trajet que tu fais revient le refaire, en boucle, pour toujours.', W / 2, 190, 300, 22);
    wrap(ctx, 'Ne te touche pas.', W / 2, y + 6, 300, 22);
    ctx.fillStyle = `rgba(255,215,106,${0.6 + 0.4 * Math.sin(now / 300)})`; ctx.font = '600 14px system-ui, sans-serif';
    ctx.fillText(view.touch ? 'Glisse le doigt n’importe où pour partir' : 'Clique pour partir — le point suit ta souris', W / 2, H - 60);
  }
  if (s.phase === 'dead') {
    ctx.fillStyle = 'rgba(6,8,16,0.55)'; ctx.fillRect(0, 180, W, 190);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff'; ctx.font = 'italic 30px Georgia, serif';
    ctx.fillText(view.record ? 'Nouveau record' : 'Déjà-vu', W / 2, 222);
    ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.font = '14px system-ui, sans-serif';
    const y = wrap(ctx, view.epitaph, W / 2, 252, 330, 20);
    ctx.fillStyle = '#ffd76a'; ctx.font = '700 22px system-ui, sans-serif';
    ctx.fillText(`${s.score} points · ${s.picks} pastille${s.picks > 1 ? 's' : ''}`, W / 2, y + 22);
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '12px system-ui, sans-serif';
    ctx.fillText('Ce dessin, c’est ta partie. Touche pour en refaire un.', W / 2, y + 50);
  }
}

export default function Dejavu() {
  const canvasRef = useRef(null);
  const game = useRef(null);
  const view = useRef({ k: 1, floaters: [], best: 0, touch: false, epitaph: '', record: false, deadAt: 0, drag: null });
  const mutedRef = useRef(false);
  const [muted, setMuted] = useState(false);
  const [over, setOver] = useState(null); // score final, ou null en cours de partie
  const [showPanel, setShowPanel] = useState(false);

  const newGame = () => {
    game.current = createGame((Math.random() * 2 ** 31) | 0);
    view.current.floaters = [];
    view.current.record = false;
    setOver(null);
  };

  useEffect(() => {
    view.current.best = Number(localStorage.getItem(BEST_KEY)) || 0;
    soundManager.loadSounds(Object.fromEntries(Object.values(SOUNDS).map(k => [`dv.${k}`, soundMap[k]])));
    newGame();
    return () => Object.values(SOUNDS).forEach(k => soundManager.stop(`dv.${k}`));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const resize = () => {
      const cssW = Math.max(240, Math.min(W, window.innerWidth - 16, (window.innerHeight - 190) * W / H));
      const dpr = window.devicePixelRatio || 1;
      canvas.style.width = `${cssW}px`; canvas.style.height = `${cssW * H / W}px`;
      canvas.width = Math.round(cssW * dpr); canvas.height = Math.round(cssW * H / W * dpr);
      view.current.k = canvas.width / W;
    };
    resize();
    window.addEventListener('resize', resize);

    const sfx = (name, volume) => { if (!mutedRef.current) soundManager.play(`dv.${SOUNDS[name]}`, { volume }); };
    let last = performance.now(), acc = 0;
    const id = setInterval(() => { // setInterval : la norme maison
      const now = performance.now();
      acc += Math.min(0.1, (now - last) / 1000); last = now;
      const s = game.current, v = view.current;
      if (!s || !ctx) return;
      while (acc >= DT) {
        acc -= DT;
        step(s);
        for (const e of s.events) {
          if (e.type === 'pick') { v.floaters.push({ x: e.x, y: e.y, text: `+${e.points}`, color: '#ffd76a', t0: now }); sfx('pick', 0.25); }
          if (e.type === 'near') { v.floaters.push({ x: e.x, y: e.y, text: `frôlé +${e.points}`, color: '#8fe3ff', t0: now }); sfx('near', 0.08); }
          if (e.type === 'dead') {
            sfx('dead', 0.35);
            v.deadAt = now;
            v.epitaph = e.by === 'echo' ? pickOne(EPITAPHS)(Math.max(1, Math.round(e.age))) : pickOne(TIMEOUTS);
            v.record = s.score > v.best;
            if (v.record) { v.best = s.score; localStorage.setItem(BEST_KEY, String(s.score)); }
            setOver(s.score);
          }
        }
      }
      draw(ctx, s, v, now);
    }, 16);
    return () => { clearInterval(id); window.removeEventListener('resize', resize); };
  }, []);

  const toGame = e => {
    const r = canvasRef.current.getBoundingClientRect();
    return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height];
  };
  const onDown = e => {
    const v = view.current;
    const [x, y] = toGame(e);
    v.touch = e.pointerType !== 'mouse';
    if (game.current.phase === 'dead') {
      if (performance.now() - v.deadAt < 600) return; // pas de relance sur un clic de panique
      newGame();
    }
    const s = game.current;
    if (s.phase === 'ready') start(s);
    if (v.touch) { v.drag = [x, y]; e.currentTarget.setPointerCapture?.(e.pointerId); } else setAim(s, x, y);
  };
  const onMove = e => {
    const v = view.current, s = game.current;
    const [x, y] = toGame(e);
    if (e.pointerType === 'mouse') { setAim(s, x, y); return; }
    if (!v.drag) return; // tactile : glisser relatif, le doigt ne cache jamais le point
    setAim(s, s.aimX + (x - v.drag[0]) * 1.25, s.aimY + (y - v.drag[1]) * 1.25);
    v.drag = [x, y];
  };
  const onUp = () => { view.current.drag = null; };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, py: 1, userSelect: 'none' }}>
      <canvas
        ref={canvasRef}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
        style={{ touchAction: 'none', borderRadius: 14, cursor: 'crosshair', boxShadow: '0 8px 30px rgba(0,0,0,0.45)', display: 'block' }}
      />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minHeight: 40 }}>
        <IconButton aria-label={muted ? 'Activer les sons' : 'Couper les sons'} onClick={() => { mutedRef.current = !muted; setMuted(!muted); }}>
          {muted ? <VolumeOff /> : <VolumeUp />}
        </IconButton>
        {over !== null && <Button variant="contained" onClick={newGame}>Rejouer</Button>}
        {over > 0 && <Button onClick={() => setShowPanel(true)}>Publier mon score</Button>}
      </Box>
      <Typography variant="caption" sx={{ opacity: 0.6, maxWidth: W, textAlign: 'center', px: 1 }}>
        Plus tu vas droit, plus tes échos seront sages. Les frôler rapporte. Hésiter aussi se rejoue.
      </Typography>
      {showPanel && <GameOverPanel open gameName="dejavu" score={over} gameOverReason={view.current.epitaph} handleClose={() => setShowPanel(false)} handleRestart={() => { setShowPanel(false); newGame(); }} />}
    </Box>
  );
}
