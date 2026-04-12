// Shared primitives used by both playerAI and opponentAI.

import { d2, STUN_FRAMES } from './constants';

// ─── Ball ownership & stealing ────────────────────────────────────────────────
//
// Steal parameters per team:
//   Team 0 (player): tactic-driven (tackle = aggressive)
//   Team 1 (opponent): style-driven (stored in g.oppStealChance / g.oppStealRange)
//
// On a successful steal the victim is stunned for STUN_FRAMES.

export function updateOwnership(g) {
  const { ball, players, tactic } = g;

  // Lobbed ball: airborne — no one can catch it yet
  if (ball.lob > 0) return;

  // Free ball: nearest player claims it
  if (ball.owner === null) {
    let best = -1, bestD = 16;
    players.forEach((p, i) => {
      if (p.stun > 0) return; // stunned players can't grab a free ball
      const dd = d2(p, ball);
      if (dd < bestD) { bestD = dd; best = i; }
    });
    if (best >= 0) {
      ball.owner = best;
      ball.vx = ball.vy = 0;
      players.forEach(p => p.hasBall = false);
      players[best].hasBall = true;
    }
    return;
  }

  const owner = players[ball.owner];
  if (!owner) { ball.owner = null; return; }

  players.forEach((p, i) => {
    if (p.team === owner.team) return;
    if (p.stun > 0) return; // stunned: can't steal

    const isOurTeam = p.team === 0;
    const chance = isOurTeam
      ? (tactic === 'tackle' ? 0.12  : 0.028)
      : (g.oppStealChance    ?? 0.028);
    const range = isOurTeam
      ? (tactic === 'tackle' ? 20    : 13)
      : (g.oppStealRange     ?? 13);

    if (d2(p, owner) < range && Math.random() < chance) {
      // Successful steal — victim gets stunned
      owner.stun = STUN_FRAMES;
      ball.owner = i;
      players.forEach(q => q.hasBall = false);
      p.hasBall = true;
    }
  });
}

// ─── Shared movement primitive ────────────────────────────────────────────────

export function moveToward(p, tx, ty, speed) {
  const dx = tx - p.x, dy = ty - p.y;
  const dd = Math.hypot(dx, dy);
  if (dd < 0.5) return;
  const s = Math.min(speed, dd);
  p.x += (dx / dd) * s;
  p.y += (dy / dd) * s;
}
