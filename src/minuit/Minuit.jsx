import { useEffect, useRef, useState } from 'react';
import { Button, IconButton, Tooltip } from '@mui/material';
import { ArrowUpward, ArrowDownward, ArrowBack, ArrowForward, Replay, VolumeUp, VolumeOff, HourglassEmpty, HelpOutline } from '@mui/icons-material';
import { GameOver as GameOverPanel } from '../ChuckNorrisFact';
import { soundManager, soundMap } from '../rpg/sons/SoundManager';
import { createGame, nextRoom, ROOMS, sightTiles, takeTurn, tileKey, walkable } from './engine';
import './minuit.css';

const SOUNDS = { step: 'marche', jewel: 'gold', lure: 'metalImpact', caught: 'coupVide', escape: 'finNiveau' };
const MODES = { patrol: 'En patrouille', chase: 'À tes trousses', search: 'Un bruit suspect…', lure: 'Distrait par le leurre' };
const KEYS = { ArrowUp: [0, -1], z: [0, -1], w: [0, -1], ArrowDown: [0, 1], s: [0, 1], ArrowLeft: [-1, 0], q: [-1, 0], a: [-1, 0], ArrowRight: [1, 0], d: [1, 0] };

function readBest() {
  try { return Number(JSON.parse(localStorage.getItem('dpyScores') || '{}').minuit?.score) || 0; } catch { return 0; }
}

function Jewel({ x = 0, y = 0, size = 1 }) {
  return <g transform={`translate(${x} ${y}) scale(${size})`}>
    <path d="M0 -11 9 -3 6 6 0 12 -6 6 -9 -3Z" fill="#edbd62" stroke="#ffe5a4" strokeWidth="1.3" />
    <path d="M-9 -3H9M0 -11-4 -3 0 12 4 -3Z" fill="none" stroke="#fff0bd" strokeWidth="1" opacity=".65" />
  </g>;
}

function Burglar({ x, y }) {
  return <g transform={`translate(${x} ${y})`} className="minuit-piece">
    <ellipse cy="11" rx="13" ry="5" fill="#030e13" opacity=".5" />
    <path d="M-10 12V4Q0 -4 10 4V12" fill="#65c6b1" stroke="#b4f3da" strokeWidth="1" />
    <circle cy="-5" r="8" fill="#f0dcc2" />
    <path d="M-9 -7Q-8 -18 2 -15L9 -8 12 -7Z" fill="#62bba8" stroke="#aeebd4" strokeWidth="1" />
    <path d="M-7 -7Q0 -11 7 -7V-2Q0 1-7 -2Z" fill="#14252b" />
    <circle cx="-3" cy="-5" r="1.2" fill="#fff" /><circle cx="3" cy="-5" r="1.2" fill="#fff" />
  </g>;
}

function Museum({ game, lureMode, onTile }) {
  const room = ROOMS[game.roomIndex];
  const visible = new Set(game.guards.flatMap(g => sightTiles(room, g)).map(tileKey));
  return <svg className={`minuit-map ${lureMode ? 'minuit-aiming' : ''}`} viewBox="0 0 624 528" role="img" aria-label="Plan du musée. Toi en vert, gardiens en rouge, joyaux dorés. Déplace-toi avec les flèches ou les boutons sous le plan.">
    <defs>
      <pattern id="minuit-floor" width="48" height="48" patternUnits="userSpaceOnUse">
        <rect width="48" height="48" fill="#1c3037" /><path d="M0 48V0H48" fill="none" stroke="#2d4145" strokeWidth="1" />
        <path d="M22 24h4M24 22v4" stroke="#40514e" strokeWidth=".8" opacity=".7" />
      </pattern>
      <radialGradient id="minuit-jewel-glow"><stop stopColor="#efc36a" stopOpacity=".25" /><stop offset="1" stopColor="#efc36a" stopOpacity="0" /></radialGradient>
    </defs>
    <rect width="624" height="528" fill="#101e25" />
    {room.map.flatMap((row, y) => [...row].map((tile, x) => {
      if (tile === '#') return <g key={`${x}-${y}`}>
        <rect x={x * 48 + 3} y={y * 48 + 3} width="42" height="42" rx="3" fill="#25383c" />
        <path d={`M${x * 48 + 5} ${y * 48 + 43}v-38h38`} stroke="#3c4d4d" fill="none" strokeWidth="1.4" />
        <path d={`M${x * 48 + 8} ${y * 48 + 45}h37v-36`} stroke="#0c171e" fill="none" strokeWidth="3" />
      </g>;
      const p = { x, y };
      const adjacent = Math.abs(x - game.player.x) + Math.abs(y - game.player.y) === 1;
      return <g key={`${x}-${y}`} data-tile={tileKey(p)} onClick={() => onTile(p)}>
        <rect x={x * 48} y={y * 48} width="48" height="48" fill="url(#minuit-floor)" />
        {visible.has(tileKey(p)) && <rect x={x * 48 + 2} y={y * 48 + 2} width="44" height="44" rx="3" fill="#ed9273" opacity=".16" />}
        {(adjacent || lureMode) && <rect className="minuit-tile-target" x={x * 48 + 5} y={y * 48 + 5} width="38" height="38" rx="4" fill={lureMode ? '#e8bc67' : '#80dac0'} fillOpacity={lureMode ? '.08' : '.09'} stroke={lureMode ? '#e8bc67' : '#80dac0'} strokeOpacity=".3" strokeDasharray="3 4" />}
      </g>;
    }))}
    <g transform={`translate(${game.exit.x * 48 + 24} ${game.exit.y * 48 + 24})`} pointerEvents="none">
      <rect x="-17" y="-20" width="34" height="40" rx="4" fill={game.jewels.length ? '#243d40' : '#35775f'} stroke={game.jewels.length ? '#79908b' : '#9ce2a7'} strokeWidth="2" />
      {game.jewels.length ? <><rect x="-6" y="-1" width="12" height="10" rx="2" fill="#a1b4a5" /><path d="M-4-1v-4a4 4 0 0 1 8 0v4" stroke="#a1b4a5" strokeWidth="2" fill="none" /></> : <path d="M-9 0H9M3-6 9 0 3 6" fill="none" stroke="#caf4c6" strokeWidth="3" />}
    </g>
    {game.jewels.map(j => <g key={tileKey(j)} pointerEvents="none">
      <circle cx={j.x * 48 + 24} cy={j.y * 48 + 24} r="34" fill="url(#minuit-jewel-glow)" />
      <ellipse cx={j.x * 48 + 24} cy={j.y * 48 + 37} rx="11" ry="4" fill="#101e25" />
      <Jewel x={j.x * 48 + 24} y={j.y * 48 + 21} />
    </g>)}
    {game.lure && <g transform={`translate(${game.lure.x * 48 + 24} ${game.lure.y * 48 + 24})`} pointerEvents="none">
      <circle r="18" fill="#e8bc67" fillOpacity=".1" stroke="#e8bc67" strokeDasharray="3 4" />
      <circle r="11" fill="none" stroke="#e8bc67" opacity=".6" /><circle r="4" fill="#e8bc67" />
      <text y="-22" textAnchor="middle" fill="#edce8c" fontSize="10">{game.lure.ttl}</text>
    </g>}
    <g pointerEvents="none">
      {game.guards.map(g => <g key={g.id} transform={`translate(${g.x * 48 + 24} ${g.y * 48 + 24})`} className="minuit-piece">
        <ellipse cy="11" rx="13" ry="5" fill="#030e13" opacity=".5" />
        <path d="M-10 12V3Q0-4 10 3V12" fill="#bd685d" stroke="#f8b4a0" />
        <circle cy="-5" r="8" fill="#e4bf9c" /><path d="M-10-8h20L6-14H-6Z" fill="#cc7b6b" stroke="#f4ad94" />
        <path d="M-4-5h2M2-5h2" stroke="#4e302b" strokeWidth="2" />
        {g.mode === 'chase' && <text y="-22" textAnchor="middle" fontSize="17" fontWeight="900" fill="#ffb39c">!</text>}
        {(g.mode === 'search' || g.mode === 'lure') && <text y="-22" textAnchor="middle" fontSize="15" fontWeight="900" fill="#edce8c">?</text>}
      </g>)}
      <Burglar x={game.player.x * 48 + 24} y={game.player.y * 48 + 24} />
    </g>
  </svg>;
}

export default function Minuit() {
  const [game, setGame] = useState(createGame);
  const [started, setStarted] = useState(false);
  const [lureMode, setLureMode] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [best, setBest] = useState(readBest);
  const root = useRef(null);
  const soundTurn = useRef(0);
  const room = ROOMS[game.roomIndex];
  const active = started && game.phase === 'playing';

  useEffect(() => {
    if (game.score > best) setBest(game.score);
  }, [game.score, best]);

  useEffect(() => {
    soundManager.loadSounds(Object.fromEntries(Object.values(SOUNDS).map(key => [`minuit.${key}`, soundMap[key]])));
    return () => Object.values(SOUNDS).forEach(key => soundManager.stop(`minuit.${key}`));
  }, []);

  useEffect(() => {
    if (soundTurn.current === game.turns) return;
    soundTurn.current = game.turns;
    if (!soundEnabled || !SOUNDS[game.event]) return;
    const key = `minuit.${SOUNDS[game.event]}`;
    if (game.event === 'step' && soundManager.isPlaying(key)) return;
    soundManager.play(key, { volume: game.event === 'step' ? 0.1 : 0.3 });
  }, [game.turns, game.event, soundEnabled]);

  useEffect(() => {
    if (game.phase === 'won' || game.phase === 'lost') setShowGameOver(true);
  }, [game.phase]);

  function play(action) {
    if (!active) return;
    setGame(current => takeTurn(current, action));
    setLureMode(false);
  }

  function start(retry = false) {
    setGame(createGame(retry ? game.seed : undefined));
    setStarted(true);
    setLureMode(false);
    setShowGameOver(false);
    root.current?.focus({ preventScroll: true });
  }

  function onTile(target) {
    if (lureMode) play({ type: 'lure', target });
    else if (Math.abs(target.x - game.player.x) + Math.abs(target.y - game.player.y) === 1) {
      play({ type: 'move', dx: target.x - game.player.x, dy: target.y - game.player.y });
    }
  }

  function onKeyDown(event) {
    if (event.altKey || event.metaKey || event.ctrlKey || event.target.isContentEditable || /BUTTON|INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    if (KEYS[key] || key === ' ' || key === 'l' || key === 'Escape') {
      event.preventDefault();
      if (event.repeat) return;
      if (!active) return;
      if (key === 'Escape') setLureMode(false);
      else if (key === 'l' && game.lures) setLureMode(value => !value);
      else if (key === ' ') play({ type: 'wait' });
      else if (KEYS[key]) play({ type: 'move', dx: KEYS[key][0], dy: KEYS[key][1] });
    }
  }

  const ended = game.phase !== 'playing';
  return <main className={`minuit ${started ? 'minuit-started' : ''}`} ref={root} tabIndex={0} onKeyDown={onKeyDown} aria-label="Le Casse de Minuit">
    <div className="minuit-shell">
      <header className="minuit-header">
        <div className="minuit-wordmark"><svg viewBox="0 0 32 32" aria-hidden="true"><Jewel x={16} y={16} /></svg><span>LES NUITS MAL HONNÊTES</span></div>
        <div className="minuit-edition">UN DUEL DE RUSE <span>✳</span> CONTRE L’IA</div>
      </header>

      <section className="minuit-heading">
        <div><p className="minuit-eyebrow">UNE VISITE TRÈS PRIVÉE</p><h1>Le casse <em>de minuit.</em></h1></div>
        <div className="minuit-intro">Trois salles. Neuf joyaux.<br />Des gardiens un peu trop consciencieux.<br /><strong>À toi de leur donner le change.</strong>{!started && <Button className="minuit-quickstart" onClick={() => start()}>Entrer →</Button>}</div>
      </section>

      <div className="minuit-layout">
        <section className="minuit-board-panel" aria-label="Salle du musée">
          <div className="minuit-board-top"><div><span className="minuit-room-number">0{game.roomIndex + 1}</span><span>{room.name}</span></div><span className="minuit-live-dot">{!started ? 'MINUIT PILE' : active ? 'À TOI DE JOUER' : 'RIDEAU'}</span>{started && <span className="minuit-mobile-hud">♥ {game.hearts} <span>◆ {3 - game.jewels.length}/3</span></span>}</div>
          <div className="minuit-board-wrap">
            <Museum game={game} lureMode={lureMode && active} onTile={onTile} />
            {ended && <div className="minuit-curtain"><div className="minuit-result" role="status">
              <span className="minuit-eyebrow">{game.phase === 'lost' ? 'FIN DE LA VISITE' : game.phase === 'won' ? 'LE MUSÉE EST ALLÉGÉ' : 'BIEN MAL ACQUIS'}</span>
              <h2>{game.phase === 'lost' ? 'Pris la main dans le sac.' : game.phase === 'won' ? (game.hits ? 'L’art de disparaître.' : 'Un véritable fantôme.') : 'Une salle de moins.'}</h2>
              <p>{game.phase === 'lost' ? 'Les joyaux étaient presque à toi. Une diversion au bon endroit aurait peut-être tout changé.' : game.phase === 'won' ? 'Neuf joyaux, trois salles et une réputation parfaitement douteuse. Le jour peut se lever.' : 'Le sac s’alourdit. Les choses se corsent dans la salle suivante.'}</p>
              <div className="minuit-result-score">{game.score.toLocaleString('fr-FR')} <small>points</small></div>
              <Button className="minuit-primary" variant="contained" onClick={() => {
                if (game.phase === 'cleared') { setGame(nextRoom); setLureMode(false); root.current?.focus({ preventScroll: true }); }
                else start(true);
              }}>{game.phase === 'cleared' ? 'La salle suivante →' : 'Retenter le casse →'}</Button>
              {game.phase !== 'cleared' && <><Button className="minuit-text-button" onClick={() => setShowGameOver(true)}>Score et classement</Button><Button className="minuit-text-button" onClick={() => start()}>Changer les patrouilles</Button></>}
            </div></div>}
          </div>
          <div className="minuit-legend"><span><i className="minuit-swatch player" /> Toi</span><span><i className="minuit-swatch guard" /> Gardien</span><span><i className="minuit-swatch vision" /> Son regard</span><span><i className="minuit-swatch gem" /> Joyau</span></div>
        </section>

        <aside className="minuit-sidebar">
          {!started ? <div className="minuit-welcome">
            <p className="minuit-eyebrow">LE PLAN EST SIMPLE.</p><h2>Entre. Empoche.<br /><em>Éclipse-toi.</em></h2>
            <ol><li><b>01</b><span>Ramasse les <strong>3 joyaux</strong> de chaque salle pour ouvrir sa sortie.</span></li><li><b>02</b><span>À chaque action, les gardiens avancent. <strong>Toi seul règles le rythme.</strong></span></li><li><b>03</b><span>Un gardien approche ? Lance un <strong>leurre sonore</strong> pour l’attirer ailleurs.</span></li></ol>
            <Button variant="contained" className="minuit-primary" onClick={() => start()}>Tenter le casse <ArrowForward fontSize="small" /></Button>
            <p className="minuit-fineprint">Flèches ou ZQSD · Clic ou commandes tactiles<br />Aucun chrono. Juste tes mauvaises intentions.</p>
          </div> : <>
            <div className="minuit-stats"><div><span>DISCRÉTION</span><div className="minuit-hearts" aria-label={`${game.hearts} chances restantes`}>{[0, 1, 2].map(i => <span key={i} className={i >= game.hearts ? 'spent' : ''}>♥</span>)}</div></div><div><span>BUTIN</span><strong>{game.score.toLocaleString('fr-FR')}<small> pts</small></strong></div></div>
            <div className="minuit-mission"><div className="minuit-mission-head"><span>LA COLLECTION</span><span>{3 - game.jewels.length} / 3</span></div><div className="minuit-jewel-slots">{[0, 1, 2].map(i => <svg key={i} viewBox="0 0 64 48" className={i >= 3 - game.jewels.length ? 'empty' : ''} aria-hidden="true"><Jewel x={32} y={24} size={1.2} /></svg>)}</div><p>{game.jewels.length ? 'Récupère les joyaux dorés, puis rejoins la porte ↗' : 'La porte est ouverte. File en haut à droite !'}</p></div>
            <div className={`minuit-dispatch ${game.event === 'caught' ? 'danger' : ''}`} role="status" aria-live="polite"><span className="minuit-eyebrow">DANS TON OREILLETTE</span><p>{lureMode ? 'Choisis une dalle sur le plan. Le bruit y attirera les gardiens pendant 6 tours. Lancer consomme un tour.' : game.message}</p></div>
            <div className="minuit-guards">{game.guards.map(g => <div key={g.id}><span><i className={`minuit-status-dot ${g.mode}`} />Gardien {g.id + 1}</span><strong>{MODES[g.mode]}</strong></div>)}</div>
            <div className="minuit-beat"><span>TOUR {game.roomTurns.toString().padStart(2, '0')}</span><div aria-label={`Prochain double pas dans ${4 - game.roomTurns % 4} tours`}>{[1, 2, 3, 4].map(i => <i key={i} className={`${i <= game.roomTurns % 4 ? 'filled' : ''} ${i === 4 ? 'sprint' : ''}`} />)}</div></div>
            <p className="minuit-sprint-note">Tous les 4 tours, un gardien en poursuite fait deux pas.</p>
          </>}
          <div className="minuit-record"><span>TON MEILLEUR CASSE</span><strong>{best.toLocaleString('fr-FR')} <small>pts</small></strong></div>
        </aside>
      </div>

      <section className="minuit-controls" aria-label="Commandes">
        <div className="minuit-pad">{[[0, -1, ArrowUpward, 'Monter'], [-1, 0, ArrowBack, 'Aller à gauche'], [0, 1, ArrowDownward, 'Descendre'], [1, 0, ArrowForward, 'Aller à droite']].map(([dx, dy, Icon, label], i) => <IconButton key={label} className={`minuit-direction direction-${i}`} aria-label={label} disabled={!active || !walkable(room, { x: game.player.x + dx, y: game.player.y + dy })} onClick={() => { play({ type: 'move', dx, dy }); root.current?.focus({ preventScroll: true }); }}><Icon fontSize="small" /></IconButton>)}</div>
        <div className="minuit-actions"><Button className={lureMode ? 'minuit-lure selected' : 'minuit-lure'} startIcon={<VolumeUp />} disabled={!active || !game.lures} aria-pressed={lureMode} onClick={() => { setLureMode(v => !v); root.current?.focus({ preventScroll: true }); }}>{lureMode ? 'Annuler' : `Leurre · ${game.lures}`}<kbd>L</kbd></Button><Button className="minuit-wait" startIcon={<HourglassEmpty />} disabled={!active} onClick={() => { play({ type: 'wait' }); root.current?.focus({ preventScroll: true }); }}>Attendre <kbd>␣</kbd></Button></div>
        <div className="minuit-tools"><Tooltip title={soundEnabled ? 'Couper les sons' : 'Activer les sons'}><IconButton aria-label={soundEnabled ? 'Couper les sons' : 'Activer les sons'} aria-pressed={soundEnabled} onClick={() => { if (soundEnabled) Object.values(SOUNDS).forEach(key => soundManager.stop(`minuit.${key}`)); setSoundEnabled(v => !v); }}>{soundEnabled ? <VolumeUp /> : <VolumeOff />}</IconButton></Tooltip><Tooltip title="Comment jouer"><IconButton aria-label="Afficher les règles" aria-expanded={showRules} onClick={() => setShowRules(v => !v)}><HelpOutline /></IconButton></Tooltip><Tooltip title="Recommencer le casse"><IconButton aria-label="Recommencer le casse" onClick={() => start(true)}><Replay /></IconButton></Tooltip></div>
      </section>
      {showRules && <section className="minuit-rules"><h2>Le règlement, à peu près.</h2><p>Déplace-toi avec les flèches, ZQSD / WASD, les boutons ou un clic sur une case voisine. Chaque déplacement, attente ou leurre fait avancer les gardiens. Un clic sur un mur ne coûte rien.</p><p>Les zones saumon montrent leur vision : cinq cases en ligne droite, arrêtées par les murs. Ils entendent tes pas à deux cases de chemin. Une fois ta piste perdue, ils fouillent quelques tours puis reprennent leur ronde. Tous les quatre tours, un gardien en poursuite fait deux pas : surveille les quatre petits repères.</p><p>Appuie sur L ou « Leurre », puis clique une dalle pour activer un leurre sonore pendant six tours. Tous les gardiens l’entendent, mais te voir passe avant le bruit. Tu disposes de trois leurres par salle. Espace permet d’attendre en silence.</p><p>Ramasse les trois joyaux de chaque salle, puis franchis la porte. Une capture coûte un cœur et te renvoie à l’entrée ; tes joyaux restent acquis. Tu as trois cœurs pour les trois salles. Chaque joyau vaut 120 points ; sortir rapporte 150 points et un bonus si tu utilises moins de 65 tours. Ton record est conservé sur cet appareil.</p></section>}
      <footer className="minuit-footer"><span>PRENDS TON TEMPS. PAS CELUI DES GARDIENS.</span><span>01 — 03 <span className="minuit-footer-star">✳</span> LE CASSE DE MINUIT</span></footer>
      {showGameOver && <GameOverPanel open gameName="minuit" score={game.score} gameOverReason={game.phase === 'won' ? 'Neuf joyaux. Un casse réussi !' : 'Pris la main dans le sac !'} handleClose={() => setShowGameOver(false)} handleRestart={() => start(true)} />}
    </div>
  </main>;
}
