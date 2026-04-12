import React, { useRef, useEffect } from 'react';
import { CW, CH, TOTAL_FRAMES } from './engine/constants';
import { TACTICS, KEY_MAP } from './engine/tactics';
import { makePlayers, makeInitialBall, playerToEngine } from './engine/formations';
import { updateOwnership } from './engine/ai';
import { moveTeam0 } from './engine/playerAI';
import { moveTeam1, OPP_STYLES, pickRandomStyle } from './engine/opponentAI';
import { updateBall, checkGoal } from './engine/physics';
import { drawScene } from './engine/renderer';

// ─── Game state ───────────────────────────────────────────────────────────────

// equipe / equipeAdverse : tableaux de joueurs riches (playerGen format), ou null → fallback formations.js
// styleAdverse : clé string OPP_STYLES, ou null → random
function makeGameState(equipe, equipeAdverse, styleAdverse) {
  const oppStyleKey = styleAdverse ?? pickRandomStyle();
  const { stealChance, stealRange } = OPP_STYLES[oppStyleKey] ?? OPP_STYLES.attacking;

  let players;
  if (equipe?.length && equipeAdverse?.length) {
    const team0 = equipe.slice(0, 11).map((p, i) => playerToEngine(p, 0, i + 1));
    const team1 = equipeAdverse.slice(0, 11).map((p, i) => playerToEngine(p, 1, i + 1));
    players = [...team0, ...team1];
  } else {
    players = makePlayers();
  }

  return {
    players,
    ball:          makeInitialBall(),
    tactic:        'attack',
    score:         [0, 0],
    frame:         0,
    phase:         'playing',
    goalAnim:      0,
    lastGoalTeam:  -1,
    oppStyleKey,
    oppStealChance: stealChance,
    oppStealRange:  stealRange,
    subCooldown:   0,
    events:        [],
  };
}

function resetAfterGoal(g) {
  g.phase   = 'playing';
  g.players = makePlayers();
  g.ball    = {
    ...makeInitialBall(),
    vx: g.lastGoalTeam === 0 ? -1.2 : 1.2,
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Stade({ onUpdate, equipe, equipeAdverse, styleAdverse }) {
  const canvasRef = useRef(null);
  const G         = useRef(null);
  const rafRef    = useRef(null);

  useEffect(() => {
    G.current = makeGameState(equipe, equipeAdverse, styleAdverse);
    syncUiNow(G.current, 0);

    function syncUiNow(g, mins) {
      onUpdate({
        score:       [...g.score],
        time:        mins,
        tactic:      g.tactic,
        phase:       g.phase,
        oppStyleKey: g.oppStyleKey,
      });
    }

    function update() {
      const g = G.current;
      if (!g) return;

      if (g.goalAnim > 0) {
        g.goalAnim--;
        if (g.goalAnim === 0) resetAfterGoal(g);
        return;
      }
      if (g.phase === 'ended') return;

      g.frame++;
      if (g.subCooldown > 0) g.subCooldown--;
      g.events = g.events.filter(e => e.frames-- > 0);

      if (g.frame >= TOTAL_FRAMES) {
        g.phase = 'ended';
        syncUiNow(g, 90);
        return;
      }
      const mins = Math.floor((g.frame / TOTAL_FRAMES) * 90);

      if (g.frame === Math.floor(TOTAL_FRAMES / 2)) {
        g.events.push({ text: '⏸ MI-TEMPS', frames: 120 });
      }

      updateOwnership(g);

      const tDef = TACTICS[g.tactic] || TACTICS.attack;
      g.players.forEach((p, idx) => {
        if (p.team === 0) moveTeam0(g, p, idx, tDef);
        else               moveTeam1(g, p);
        if (p.boost > 0) p.boost--;
      });

      updateBall(g);

      const goalScored = checkGoal(g);
      if (goalScored || g.frame % 30 === 0) syncUiNow(g, mins);
    }

    function draw() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      drawScene(canvas.getContext('2d'), G.current);
    }

    const handleKey = (e) => {
      const g = G.current;
      if (!g) return;
      const key = e.key.toLowerCase();

      if (g.phase === 'ended' && (key === 'enter' || key === ' ')) {
        G.current = makeGameState(equipe, equipeAdverse, styleAdverse);
        syncUiNow(G.current, 0);
        return;
      }

      if (KEY_MAP[key]) {
        g.tactic = KEY_MAP[key];
        onUpdate(s => ({ ...s, tactic: g.tactic }));
      }

      if (key === 's' && g.subCooldown <= 0) {
        g.players.filter(p => p.team === 0 && p.role !== 'gk').forEach(p => { p.boost = 180; });
        g.subCooldown = 400;
        g.events.push({ text: '🔄 SUBSTITUTION !', frames: 100 });
      }
    };

    window.addEventListener('keydown', handleKey);

    const loop = () => { update(); draw(); rafRef.current = requestAnimationFrame(loop); };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('keydown', handleKey);
      cancelAnimationFrame(rafRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <canvas
      ref={canvasRef}
      width={CW}
      height={CH}
      style={{ border: '2px solid #2a2a3a', borderRadius: 6, maxWidth: '100%', display: 'block' }}
    />
  );
}
