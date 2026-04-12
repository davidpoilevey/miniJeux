// AI for the player's team (team 0, attacks right).
// Computes a tactical home position from the active TACTIC, then delegates to runDecision.
// Special tactic flags (cross, markOpp) are handled here before the shared decision.

import { FX, FW, FY, FH, PR, GY1, GY2, BASE_SPD, clamp, lerp, d2 } from './constants';
import { moveToward } from './ai';
import { runDecision } from './decision';
import { clearBall } from './physics';

export function moveTeam0(g, p, idx, tDef) {
  // Stun: can't move
  if (p.stun > 0) { p.stun--; return; }

  const { ball, players } = g;

  // ── GK: special — always guard the left goal ───────────────────────────────
  if (p.role === 'gk') {
    if (p.hasBall) { clearBall(g, p); return; }
    const urgency = ball.x < FX + FW * 0.25 ? 2.2 : 1.3;
    moveToward(p, FX + FW * 0.055, clamp(ball.y, GY1 + PR, GY2 - PR), BASE_SPD * urgency);
    return;
  }

  // Select mode: withBall when our team has possession, withoutBall otherwise
  const ourTeamHasBall = ball.owner !== null && players[ball.owner]?.team === 0;
  const mode  = ourTeamHasBall ? tDef.withBall : tDef.withoutBall;
  const speed = BASE_SPD * (p.vitesse ?? 70) / 70 * mode.speedMul * ((p.forme ?? 76) / 100) * (p.boost > 0 ? 1.35 : 1);

  // ── Tactic overrides — handle before shared decision ──────────────────────

  if (tDef.markOpp) {
    const opps = players.filter(q => q.team === 1 && q.role !== 'gk');
    const nearest = opps.reduce((b, q) => d2(p, q) < d2(p, b) ? q : b, { x: 9999, y: 9999 });
    moveToward(p, nearest.x, nearest.y, speed);
    return;
  }

  if (tDef.cross) {
    const isWide = p.role === 'mid' && (idx === 5 || idx === 8);
    if (isWide || p.role === 'fwd') {
      // Hug touchline and push forward
      moveToward(p, FX + FW * 0.82, p.by < FY + FH / 2 ? FY + PR * 2 : FY + FH - PR * 2, speed);
      return;
    }
  }

  // ── Compute tactical home position ────────────────────────────────────────
  // dir = +1: team 0 attacks right, forwardPush > 0 means further right
  const homeX = clamp(p.bx + mode.forwardPush * FW, FX + PR, FX + FW - PR);
  const homeY = clamp(lerp(p.by, ball.y, mode.ballW * 0.85), FY + PR, FY + FH - PR);

  // ── Shared decision tree ──────────────────────────────────────────────────
  runDecision(p, g, { x: homeX, y: homeY }, speed, { holdBall: !!tDef.holdBall });
}
