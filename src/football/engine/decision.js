// Shared decision tree — called by both playerAI and opponentAI.
//
// Each frame, a player asks: "what should I do right now?"
// The answer depends on the ball's proximity and ownership, not on the team.
//
// homePos  — tactical home position pre-computed by the caller (from tactic or OPP_STYLE)
// speed    — base movement speed for this tick (already includes tactic/style multiplier)
// opts     — overrides: { holdBall }

import { FX, FW, FY, FH, NEARBY, THREAT_RANGE, d2, lerp, clamp } from './constants';
import { shoot, pass } from './physics';
import { moveToward } from './ai';

const SHOOT_ZONE = 0.70; // fraction of FW: team 0 shoots beyond this, team 1 below (1 - SHOOT_ZONE)

export function runDecision(p, g, homePos, speed, opts = {}) {
  const { ball, players } = g;
  const distBall = d2(p, ball);

  // ── 1. Has the ball ───────────────────────────────────────────────────────
  if (p.hasBall) {
    // Hold tactic: stay put, don't advance
    if (opts.holdBall) {
      moveToward(p, homePos.x, homePos.y, speed * 0.5);
      return;
    }

    const tPasse = Math.max(0, Math.min(1, ((p.passe ?? 70) - 40) / 60));
    const tTir   = Math.max(0, Math.min(1, ((p.tir   ?? 70) - 40) / 60));
    const passProb  = 0.15 + tPasse * 0.20; // 0.15 → 0.35 as passe improves
    const shootProb = 0.010 + tTir * 0.030; // 0.010 → 0.040 as tir improves

    // Threatened: opponent dangerously close → pass
    const threatened = players.some(q => q.team !== p.team && q.stun === 0 && d2(p, q) < THREAT_RANGE);
    if (threatened && Math.random() < passProb) {
      pass(g, p, p.team);
      return;
    }

    // In shooting range → shoot
    const inRange = p.team === 0
      ? p.x > FX + FW * SHOOT_ZONE
      : p.x < FX + FW * (1 - SHOOT_ZONE);
    if (inRange && Math.random() < shootProb) {
      shoot(g, p, p.team === 0 ? 1 : 0);
      return;
    }

    // Dribble toward goal: aim at a point ahead, gently angling toward goal center
    const goalX  = p.team === 0 ? FX + FW * 0.88 : FX + FW * 0.12;
    const goalY  = lerp(p.y, FY + FH / 2, 0.22);
    moveToward(p, goalX, goalY, speed);
    return;
  }

  // ── 2. Ball is nearby ─────────────────────────────────────────────────────
  if (distBall < NEARBY) {
    if (ball.owner === null) {
      // Sprint to free ball
      moveToward(p, ball.x, ball.y, speed * 1.2);
      return;
    }

    const owner = players[ball.owner];

    if (owner.team !== p.team) {
      // Close in to tackle (steal itself is handled by updateOwnership)
      moveToward(p, ball.x, ball.y, speed * 1.1);
      return;
    }

    // Ally has the ball nearby — make a forward run in your lane
    const dir   = p.team === 0 ? 1 : -1;
    const runX  = clamp(homePos.x + dir * 60, FX + FW * 0.05, FX + FW * 0.95);
    moveToward(p, runX, homePos.y, speed * 0.85);
    return;
  }

  // ── 3. Ball is far ────────────────────────────────────────────────────────
  const allyHasBall = ball.owner !== null && players[ball.owner]?.team === p.team;

  // Small jitter so players look alive when holding position
  const jx = (Math.random() - 0.5) * 1.5;
  const jy = (Math.random() - 0.5) * 1.5;

  if (allyHasBall) {
    // Ally in possession: walk forward into position, no rush
    moveToward(p, homePos.x + jx, homePos.y + jy, speed * 0.72);
  } else {
    // Opponent has ball or ball is loose: trot back to tactical shape
    moveToward(p, homePos.x + jx, homePos.y + jy, speed * 1.0);
  }
}
