import React, { useState, useRef, useEffect, useCallback } from 'react';

/*
 * CASSE-CLAVIER
 * -------------
 * Le successeur spirituel des jeux qui bousillaient ton joystick.
 * Une balle tombe dans l'une de 3 voies (gauche / centre / droite).
 * Quand elle atteint la ligne de frappe, il faut marteler un maximum
 * de touches DU BON CÔTÉ EN MÊME TEMPS : plus il y en a, plus le
 * "coup" est puissant (et plus tu gagnes de points).
 *
 * Le mapping des zones utilise `event.code` (position physique de la
 * touche) et non `event.key` (caractère affiché) : le jeu se comporte
 * donc IDENTIQUEMENT en QWERTY et en AZERTY, sans configuration.
 *
 * Note d'intégration : ce fichier n'importe volontairement pas
 * @mui/material (non disponible dans le bac à sable de prévisualisation
 * des artifacts). Le rendu ci-dessous est en styles inline / CSS brut.
 * La logique de jeu est indépendante de la couche visuelle : tu peux
 * remplacer les <div>/<button> par des <Box>/<Button> MUI dans ton
 * projet sans toucher au reste.
 */

// --- Mapping des zones par position physique de touche (layout-agnostic) ---
const ZONES = {
  left: new Set([
    'Tab', 'ShiftLeft', 'Digit1', 'Digit2', 'Digit3', 'Digit4',
    'KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyA', 'KeyS', 'KeyD', 'KeyF',
    'KeyZ', 'KeyX', 'KeyC',
  ]),
  center: new Set([
    'Digit5', 'Digit6', 'Digit7',
    'KeyT', 'KeyY', 'KeyU', 'KeyG', 'KeyH', 'KeyV', 'KeyB', 'KeyN',
  ]),
  right: new Set([
    'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal',
    'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight', 'Backslash',
    'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote',
    'Comma', 'Period', 'Slash', 'ShiftRight',
  ]),
};

const LANES = ['left', 'center', 'right'];
const LANE_LABEL = { left: 'GAUCHE', center: 'CENTRE', right: 'DROITE' };
const LANE_HINT = {
  left: 'TAB Q W E A S D Z X C 1-4',
  center: 'T Y U G H B N 5-7',
  right: 'I O P J K L 8-0',
};

const HIT_LINE = 84;      // position (%) de la ligne de frappe
const WIN_BEFORE = 7;     // tolérance avant la ligne (%)
const WIN_AFTER = 9;      // tolérance après la ligne (%)
const BASE_SPEED = 24;    // % par seconde, en début de partie
const SPEED_PER_POINT = 1.1;
const MAX_SPEED = 60;
const START_LIVES = 3;

function getZone(code) {
  for (const z of LANES) {
    if (ZONES[z].has(code)) return z;
  }
  return null;
}

function zoneCounts(pressedSet) {
  const counts = { left: 0, center: 0, right: 0 };
  pressedSet.forEach((code) => {
    const z = getZone(code);
    if (z) counts[z] += 1;
  });
  return counts;
}

export default function CasseClavier() {
  const [phase, setPhase] = useState('idle'); // idle | playing | gameover
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(START_LIVES);
  const [lane, setLane] = useState('center');
  const [message, setMessage] = useState(null); // { text, kind }
  const [best, setBest] = useState(0);

  const pressedRef = useRef(new Set());
  const ballYRef = useRef(0);
  const ballElRef = useRef(null);
  const hitLineElRef = useRef(null);
  const laneRef = useRef('center');
  const speedRef = useRef(BASE_SPEED);
  const windowActiveRef = useRef(false);
  const windowForceRef = useRef(0);
  const roundResolvedRef = useRef(false);
  const rafRef = useRef(null);
  const lastTsRef = useRef(null);
  const roundTimeoutRef = useRef(null);
  const meterRefs = useRef({ left: null, center: null, right: null });
  const phaseRef = useRef('idle');
  const scoreRef = useRef(0);
  const livesRef = useRef(START_LIVES);

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // --- Écoute clavier globale ---
  useEffect(() => {
    const onKeyDown = (e) => {
      if (phaseRef.current === 'playing' && getZone(e.code)) e.preventDefault();
      pressedRef.current.add(e.code);
    };
    const onKeyUp = (e) => {
      pressedRef.current.delete(e.code);
    };
    const clearPressed = () => pressedRef.current.clear();

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', clearPressed);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', clearPressed);
    };
  }, []);

  const spawnRound = useCallback(() => {
    const next = LANES[Math.floor(Math.random() * LANES.length)];
    laneRef.current = next;
    setLane(next);
    ballYRef.current = 0;
    windowActiveRef.current = false;
    windowForceRef.current = 0;
    roundResolvedRef.current = false;
    speedRef.current = Math.min(MAX_SPEED, BASE_SPEED + scoreRef.current * SPEED_PER_POINT);
    setMessage(null);
  }, []);

  const endRound = useCallback((success, force) => {
    roundResolvedRef.current = true;

    if (success) {
      const gained = Math.max(1, force);
      scoreRef.current += gained;
      setScore(scoreRef.current);
      setMessage({ text: force >= 5 ? `SMASH ! +${gained}` : `+${gained}`, kind: 'hit' });
    } else {
      livesRef.current -= 1;
      setLives(livesRef.current);
      setMessage({ text: 'RATÉ !', kind: 'miss' });
      if (livesRef.current <= 0) {
        setBest((b) => Math.max(b, scoreRef.current));
        setPhase('gameover');
        return;
      }
    }

    roundTimeoutRef.current = setTimeout(() => {
      if (phaseRef.current === 'playing') spawnRound();
    }, 480);
  }, [spawnRound]);

  // --- Boucle de jeu ---
  useEffect(() => {
    if (phase !== 'playing') return undefined;

    const tick = (ts) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = Math.min(0.05, (ts - lastTsRef.current) / 1000);
      lastTsRef.current = ts;

      if (!roundResolvedRef.current) {
        ballYRef.current += speedRef.current * dt;
        const y = ballYRef.current;
        const inWindow = y >= HIT_LINE - WIN_BEFORE && y <= HIT_LINE + WIN_AFTER;
        if (inWindow) windowActiveRef.current = true;

        if (windowActiveRef.current) {
          const counts = zoneCounts(pressedRef.current);
          const force = counts[laneRef.current] || 0;
          if (force > windowForceRef.current) windowForceRef.current = force;
        }

        if (ballElRef.current) {
          ballElRef.current.style.top = `${Math.min(y, 100)}%`;
        }
        if (hitLineElRef.current) {
          hitLineElRef.current.style.opacity = windowActiveRef.current ? '1' : '0.35';
        }

        if (y > HIT_LINE + WIN_AFTER || y >= 100) {
          endRound(windowForceRef.current > 0, windowForceRef.current);
        }
      }

      // VU-mètres en temps réel sur les 3 zones (feedback tactile permanent)
      const liveCounts = zoneCounts(pressedRef.current);
      LANES.forEach((z) => {
        const el = meterRefs.current[z];
        if (el) {
          const pct = Math.min(100, liveCounts[z] * 20);
          el.style.height = `${pct}%`;
          el.style.opacity = liveCounts[z] > 0 ? '1' : '0.25';
        }
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
    };
  }, [phase, endRound]);

  useEffect(() => () => {
    if (roundTimeoutRef.current) clearTimeout(roundTimeoutRef.current);
  }, []);

  const startGame = () => {
    scoreRef.current = 0;
    livesRef.current = START_LIVES;
    setScore(0);
    setLives(START_LIVES);
    setMessage(null);
    setPhase('playing');
    spawnRound();
  };

  const isPlaying = phase === 'playing';

  return (
    <div style={styles.page}>
      <style>{css}</style>
      <div style={styles.cabinet} tabIndex={0}>
        <div className="cc-scanlines" />

        <div style={styles.topBar}>
          <div style={styles.scoreBlock}>
            <span style={styles.topLabel}>SCORE</span>
            <span style={styles.scoreValue}>{String(score).padStart(3, '0')}</span>
          </div>
          <div style={styles.titleBlock}>
            <span style={styles.title}>CASSE-CLAVIER</span>
            {best > 0 && <span style={styles.bestLine}>MEILLEUR : {best}</span>}
          </div>
          <div style={styles.livesBlock}>
            <span style={styles.topLabel}>VIES</span>
            <div style={styles.livesRow}>
              {Array.from({ length: START_LIVES }).map((_, i) => (
                <span
                  key={i}
                  style={{
                    ...styles.lifePip,
                    opacity: i < lives ? 1 : 0.15,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div style={styles.field}>
          {LANES.map((z) => (
            <div key={z} style={styles.laneCol}>
              <div style={styles.laneTrack}>
                {lane === z && isPlaying && (
                  <div ref={ballElRef} className="cc-ball" style={styles.ball} />
                )}
                {z === LANES[1] && (
                  <div ref={hitLineElRef} style={styles.hitLine} />
                )}
              </div>
              <div style={styles.meterWrap}>
                <div
                  ref={(el) => { meterRefs.current[z] = el; }}
                  style={styles.meterFill}
                />
              </div>
              <span style={styles.laneLabel}>{LANE_LABEL[z]}</span>
              <span style={styles.laneHint}>{LANE_HINT[z]}</span>
            </div>
          ))}

          {message && (
            <div
              key={message.text + Date.now()}
              className="cc-message"
              style={{
                ...styles.message,
                color: message.kind === 'hit' ? '#39ff88' : '#ff5f5f',
              }}
            >
              {message.text}
            </div>
          )}

          {!isPlaying && (
            <div style={styles.overlay}>
              {phase === 'gameover' ? (
                <>
                  <span style={styles.overlayTitle}>GAME OVER</span>
                  <span style={styles.overlaySub}>Score final : {score}</span>
                </>
              ) : (
                <>
                  <span style={styles.overlayTitle}>PRÊT ?</span>
                  <span style={styles.overlaySub}>
                    Tape un maximum de touches du bon côté quand la balle
                    touche la ligne.
                  </span>
                </>
              )}
              <button style={styles.startButton} onClick={startGame}>
                {phase === 'gameover' ? 'REJOUER' : 'DÉMARRER'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100%',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#05070a',
    padding: 16,
    boxSizing: 'border-box',
    fontFamily: "'Courier New', ui-monospace, monospace",
  },
  cabinet: {
    position: 'relative',
    width: '100%',
    maxWidth: 460,
    background: '#0a0f0c',
    border: '3px solid #1c2b22',
    borderRadius: 10,
    boxShadow: '0 0 0 6px #05070a, inset 0 0 40px rgba(57,255,136,0.06)',
    padding: 14,
    outline: 'none',
    overflow: 'hidden',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  topLabel: {
    display: 'block',
    fontSize: 10,
    letterSpacing: 2,
    color: '#5f8f74',
  },
  scoreBlock: { display: 'flex', flexDirection: 'column' },
  scoreValue: {
    fontSize: 22,
    fontWeight: 700,
    color: '#39ff88',
    textShadow: '0 0 8px rgba(57,255,136,0.6)',
    letterSpacing: 2,
  },
  titleBlock: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  title: {
    fontSize: 13,
    fontWeight: 700,
    color: '#c9ffde',
    letterSpacing: 3,
    textShadow: '0 0 6px rgba(57,255,136,0.4)',
  },
  bestLine: { fontSize: 9, color: '#5f8f74', marginTop: 2, letterSpacing: 1 },
  livesBlock: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end' },
  livesRow: { display: 'flex', gap: 4, marginTop: 3 },
  lifePip: {
    width: 10,
    height: 10,
    background: '#ff5f5f',
    boxShadow: '0 0 6px rgba(255,95,95,0.7)',
    borderRadius: 2,
  },
  field: {
    position: 'relative',
    display: 'flex',
    gap: 8,
    background: '#060907',
    border: '1px solid #16241b',
    borderRadius: 6,
    padding: '10px 8px 12px',
  },
  laneCol: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
  },
  laneTrack: {
    position: 'relative',
    width: '100%',
    height: 260,
    background: 'linear-gradient(180deg, #0b120d 0%, #060907 100%)',
    border: '1px solid #142018',
    borderRadius: 4,
    overflow: 'hidden',
  },
  ball: {
    position: 'absolute',
    left: '50%',
    top: '0%',
    width: 16,
    height: 16,
    marginLeft: -8,
    marginTop: -8,
    borderRadius: '50%',
    background: '#39ff88',
    boxShadow: '0 0 10px 3px rgba(57,255,136,0.75)',
  },
  hitLine: {
    position: 'absolute',
    left: -60,
    right: -60,
    top: `${HIT_LINE}%`,
    height: 0,
    borderTop: '2px dashed #ffb23f',
    opacity: 0.35,
  },
  meterWrap: {
    width: '60%',
    height: 26,
    background: '#0b120d',
    border: '1px solid #142018',
    borderRadius: 3,
    display: 'flex',
    alignItems: 'flex-end',
    overflow: 'hidden',
  },
  meterFill: {
    width: '100%',
    height: '0%',
    background: 'linear-gradient(180deg, #ffb23f, #39ff88)',
    transition: 'height 70ms linear, opacity 150ms linear',
  },
  laneLabel: {
    fontSize: 11,
    letterSpacing: 2,
    color: '#8fd6ab',
    fontWeight: 700,
  },
  laneHint: {
    fontSize: 8,
    letterSpacing: 0.5,
    color: '#3d5c48',
    textAlign: 'center',
  },
  message: {
    position: 'absolute',
    top: '38%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: 2,
    pointerEvents: 'none',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    background: 'rgba(5,8,6,0.86)',
    textAlign: 'center',
    padding: 24,
  },
  overlayTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: '#39ff88',
    letterSpacing: 3,
    textShadow: '0 0 8px rgba(57,255,136,0.6)',
  },
  overlaySub: {
    fontSize: 12,
    color: '#8fd6ab',
    maxWidth: 300,
    lineHeight: 1.5,
  },
  startButton: {
    marginTop: 6,
    padding: '10px 22px',
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 2,
    color: '#05070a',
    background: '#39ff88',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    boxShadow: '0 3px 0 #1c8f4f',
  },
};

const css = `
  .cc-scanlines {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: repeating-linear-gradient(
      to bottom,
      rgba(0,0,0,0) 0px,
      rgba(0,0,0,0) 2px,
      rgba(0,0,0,0.18) 3px
    );
    mix-blend-mode: multiply;
    z-index: 5;
  }
  .cc-message {
    animation: cc-float-fade 0.75s ease-out forwards;
  }
  @keyframes cc-float-fade {
    0% { opacity: 0; transform: translate(-50%, -35%); }
    20% { opacity: 1; transform: translate(-50%, -50%); }
    100% { opacity: 0; transform: translate(-50%, -70%); }
  }
`;