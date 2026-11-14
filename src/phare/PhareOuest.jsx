import { useEffect, useRef, useState } from 'react';
import { Box, Button, IconButton, Paper, Typography } from '@mui/material';
import { VolumeUp, VolumeOff, Campaign } from '@mui/icons-material';
import { GameOver as GameOverPanel } from '../ChuckNorrisFact';
import { soundManager, soundMap } from '../rpg/sons/SoundManager';
import { W, CX, CY, DT, UPGRADES, createGame, startNight, step, setBeamTarget, horn, chooseUpgrade, nightPlan } from './engine';
import { createRenderer } from './render';

/*
 * Phare Ouest — le second jeu de Claude.
 * Un faisceau, des capitaines aveugles, et la seule ressource qui compte : l'attention.
 */

const BEST_KEY = 'phareouest_best';
const SOUNDS = { arrive: 'gold', wreck: 'glou', taken: 'punch', alarm: 'metalImpact', repel: 'slash', thunder: 'explosion', dawn: 'finNiveau', upgrade: 'levelUp' };
const pick = a => a[Math.floor(Math.random() * a.length)];

const NAMES = {
  barque: ['La Mouette Rieuse', 'Le Pas-Pressé', 'Le Bigorneau', 'La Sardine Têtue', 'Le Pourquoi-Pas-Moi', 'La Belle-Mère'],
  voilier: ['Le Courant d’Air', 'L’Apéro', 'Le Sans-Souci', 'La Vie d’Artiste', 'Le Vent Debout', 'Le Crédit Maritime'],
  cargo: ['L’Insubmersible II', 'Le Titan-hic', 'Le Poids des Mots', 'Le Gros Léon', 'Le Bout du Rouleau', 'Le Tout-Doux'],
};
const nameOf = b => NAMES[b.type][b.look % NAMES[b.type].length];
const RADIO = {
  arrive: ['Merci gardien !', 'À quai. On vous doit une bolée.', 'Rentrés. Le chat va bien.', 'Jolie lumière. Très tendance.', 'On n’a rien vu, mais on a tout évité.', 'Amarrés ! Qui a les clés du bistrot ?'],
  rock: ['C’était quoi, ce bruit ?', 'On avait dit À DROITE du caillou.', 'Je le sentais pas, ce raccourci.', 'Le phare, c’est décoratif ?', 'Glou.', 'Quelqu’un a vu passer un rocher ?'],
  monster: ['Y a un truc qui nous tire vers le b…', 'Dites, c’est normal, les tentacules ?', 'Elle a l’air affectueuse. Trop.'],
};
const SYSTEM = {
  surface: ['Quelque chose remue dans le noir…', 'Deux yeux, là-bas. Ce n’est pas un phoque.'],
  repel: ['La Chose replonge. Elle boude.', 'Trop de lumière pour elle. Petite nature.'],
  horn: ['MEUUUUH. Tout le monde ouvre l’œil quatre secondes.'],
};

function bannerFor(n) {
  if (n === 1) return 'Éclaire ceux qui foncent sur un récif. Leur lanterne clignote rouge quand ça sent le bois mouillé.';
  if (n === 2) return 'On raconte qu’une Chose rôde par ici. Elle n’aime pas la lumière : garde-la dans le faisceau.';
  if (n === 3) return 'Tempête. Le vent pousse tout le monde de travers.';
  if (n === 6) return 'La Chose a invité sa cousine.';
  if (nightPlan(n).storm) return pick(['Tempête. Encore.', 'Ça souffle. Les trajectoires mentent.']);
  return pick(['La marée a découvert un nouveau récif.', 'Mer calme. Méfiance.', 'Les cargos tournent comme des armoires : éclaire-les de loin.']);
}

export default function PhareOuest() {
  const canvasRef = useRef(null);
  const game = useRef(null);
  const renderer = useRef(null);
  const audio = useRef(null);
  const view = useRef({ floaters: [], radio: null, banner: null, best: 0, record: false, touch: false, lastAlarm: 0, pointer: false });
  const mutedRef = useRef(false);
  const [muted, setMuted] = useState(false);
  const [ui, setUi] = useState({ phase: 'title', hornLeft: 0, hornBusy: false, night: 0 });
  const [showPanel, setShowPanel] = useState(false);

  const sfx = (name, volume) => { if (!mutedRef.current) soundManager.play(`ph.${SOUNDS[name]}`, { volume }); };
  const say = (text, color) => { view.current.radio = { text, color, t0: performance.now() }; };

  // corne de brume : deux dents de scie graves dans un filtre — pas de mp3 de corne en rayon
  const foghorn = () => {
    if (mutedRef.current) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      const ac = audio.current || (audio.current = new AC());
      const now = ac.currentTime, gain = ac.createGain(), filter = ac.createBiquadFilter();
      filter.type = 'lowpass'; filter.frequency.value = 420;
      filter.connect(gain); gain.connect(ac.destination);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.15);
      gain.gain.setValueAtTime(0.2, now + 1.3);
      gain.gain.linearRampToValueAtTime(0, now + 1.9);
      [87, 131].forEach(f => { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.connect(filter); o.start(now); o.stop(now + 2); });
    } catch (e) { /* pas d'audio, pas de corne */ }
  };

  const newGame = () => {
    game.current = createGame((Math.random() * 2 ** 31) | 0);
    Object.assign(view.current, { floaters: [], radio: null, banner: null, record: false });
    setShowPanel(false);
  };
  const beginNight = () => {
    const s = game.current;
    view.current.banner = { text: `Nuit ${s.night}`, sub: bannerFor(s.night), t0: performance.now() };
  };
  const light = () => { startNight(game.current); beginNight(); };
  const blow = () => { if (horn(game.current)) { foghorn(); say(pick(SYSTEM.horn), '#9dffb0'); } };
  const buy = id => { if (chooseUpgrade(game.current, id)) { sfx('upgrade', 0.3); beginNight(); } };

  useEffect(() => {
    view.current.best = Number(localStorage.getItem(BEST_KEY)) || 0;
    soundManager.loadSounds(Object.fromEntries(Object.values(SOUNDS).map(k => [`ph.${k}`, soundMap[k]])));
    newGame();
    const onKey = e => { if (e.code === 'Space') { e.preventDefault(); blow(); } };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      Object.values(SOUNDS).forEach(k => soundManager.stop(`ph.${k}`));
      audio.current?.close?.();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const r = renderer.current = createRenderer(canvas);
    const resize = () => r?.resize(Math.max(260, Math.min(W, window.innerWidth - 16, window.innerHeight - 200)));
    resize();
    window.addEventListener('resize', resize);

    let last = performance.now(), acc = 0, shown = '';
    const id = setInterval(() => { // setInterval : la norme maison
      const now = performance.now();
      acc += Math.min(0.1, (now - last) / 1000); last = now;
      const s = game.current, v = view.current;
      if (!s) return;
      if (document.hidden) { acc = 0; return; }
      if (s.phase === 'title') s.beam.target = now / 1000 * 0.55; // le phare tourne tout seul en attendant
      while (acc >= DT) {
        acc -= DT;
        step(s);
        for (const e of s.events) {
          if (e.type === 'arrive') { v.floaters.push({ x: e.x, y: e.y, text: `+${e.points}`, color: '#ffd98a', t0: now }); sfx('arrive', 0.2); if (Math.random() < 0.55) say(`${nameOf(e.boat)} : « ${pick(RADIO.arrive)} »`); }
          if (e.type === 'wreck') {
            v.floaters.push({ x: e.x, y: e.y, text: 'naufrage', color: '#ff7a66', t0: now });
            sfx(e.cause === 'monster' ? 'taken' : 'wreck', 0.4);
            say(`${nameOf(e.boat)} : « ${pick(RADIO[e.cause])} »`, '#ff9a88');
          }
          if (e.type === 'surface') say(pick(SYSTEM.surface), '#d7ff5a');
          if (e.type === 'repel') { v.floaters.push({ x: e.x, y: e.y, text: `+${e.points}`, color: '#d7ff5a', t0: now }); sfx('repel', 0.2); say(pick(SYSTEM.repel), '#d7ff5a'); }
          if (e.type === 'thunder') sfx('thunder', 0.12);
          if (e.type === 'dawn') sfx('dawn', 0.25);
          if (e.type === 'over') {
            v.record = s.score > v.best;
            if (v.record) { v.best = s.score; localStorage.setItem(BEST_KEY, String(s.score)); }
          }
        }
        if (s.phase === 'night' && now - v.lastAlarm > 1400 && s.boats.some(b => b.danger)) { v.lastAlarm = now; sfx('alarm', 0.1); }
      }
      r?.draw(s, v, now);
      const key = `${s.phase}|${s.hornLeft}|${s.hornT > 0}|${s.night}`;
      if (key !== shown) { shown = key; setUi({ phase: s.phase, hornLeft: s.hornLeft, hornBusy: s.hornT > 0, night: s.night }); }
    }, 16);
    return () => { clearInterval(id); window.removeEventListener('resize', resize); };
  }, []);

  const aim = e => {
    const rect = canvasRef.current.getBoundingClientRect();
    setBeamTarget(game.current, (e.clientX - rect.left) * W / rect.width, (e.clientY - rect.top) * W / rect.height);
  };
  const onDown = e => {
    view.current.touch = e.pointerType !== 'mouse';
    e.currentTarget.setPointerCapture?.(e.pointerId);
    if (game.current.phase === 'title') light();
    aim(e);
  };
  const onMove = e => { if (game.current.phase !== 'title' && (e.pointerType === 'mouse' || e.buttons)) aim(e); };

  const s = game.current;
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, py: 1, userSelect: 'none' }}>
      <Box sx={{ position: 'relative', lineHeight: 0 }}>
        <canvas
          ref={canvasRef}
          onPointerDown={onDown} onPointerMove={onMove}
          style={{ touchAction: 'none', borderRadius: 14, cursor: 'crosshair', boxShadow: '0 10px 34px rgba(0,0,0,0.5)', display: 'block', background: '#0b3852' }}
        />
        {ui.phase === 'shop' && s && (
          <Paper elevation={8} sx={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-42%)', width: 'min(92%, 430px)', p: 2, lineHeight: 1.4, bgcolor: 'rgba(12,22,38,0.9)', color: '#f3efe6', borderRadius: 3, backdropFilter: 'blur(3px)' }}>
            <Typography sx={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 22, textAlign: 'center' }}>Le jour se lève sur la baie</Typography>
            <Typography sx={{ fontSize: 13, opacity: 0.75, textAlign: 'center', mb: 1.5 }}>
              La commune t’accorde un petit quelque chose avant la nuit {s.night + 1}.
            </Typography>
            {s.offers.map(id => (
              <Button key={id} fullWidth onClick={() => buy(id)} sx={{ display: 'block', textAlign: 'left', textTransform: 'none', mb: 1, p: 1.2, color: '#f3efe6', border: '1px solid rgba(255,217,138,0.35)', borderRadius: 2, '&:hover': { bgcolor: 'rgba(255,217,138,0.12)', borderColor: '#ffd98a' } }}>
                <Typography sx={{ fontWeight: 700, color: '#ffd98a', fontSize: 15 }}>
                  {UPGRADES[id].name}{s.taken[id] ? ` (déjà ×${s.taken[id]})` : ''}
                </Typography>
                <Typography sx={{ fontSize: 13, opacity: 0.85 }}>{UPGRADES[id].text}</Typography>
              </Button>
            ))}
          </Paper>
        )}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minHeight: 40, flexWrap: 'wrap', justifyContent: 'center' }}>
        <IconButton aria-label={muted ? 'Activer les sons' : 'Couper les sons'} onClick={() => { mutedRef.current = !muted; setMuted(!muted); }}>
          {muted ? <VolumeOff /> : <VolumeUp />}
        </IconButton>
        {ui.phase === 'night' && (
          <Button variant="contained" color="warning" startIcon={<Campaign />} disabled={ui.hornLeft <= 0 || ui.hornBusy} onClick={blow}>
            Corne de brume ({ui.hornLeft})
          </Button>
        )}
        {ui.phase === 'over' && <Button variant="contained" onClick={newGame}>Reprendre du service</Button>}
        {ui.phase === 'over' && s?.score > 0 && <Button onClick={() => setShowPanel(true)}>Publier mon score</Button>}
      </Box>
      <Typography variant="caption" sx={{ opacity: 0.65, maxWidth: W, textAlign: 'center', px: 1 }}>
        Lanterne <b style={{ color: '#3fbf6a' }}>verte</b> : il voit les récifs. <b style={{ color: '#e0553f' }}>Rouge qui clignote</b> : il va taper.
        La corne (ou Espace) réveille tout le monde 4 s. La Chose se chasse à la lumière.
      </Typography>
      {showPanel && <GameOverPanel open gameName="phareouest" score={s.score} gameOverReason={`Clés confisquées après ${s.night} nuit${s.night > 1 ? 's' : ''}.`} handleClose={() => setShowPanel(false)} handleRestart={newGame} />}
    </Box>
  );
}
