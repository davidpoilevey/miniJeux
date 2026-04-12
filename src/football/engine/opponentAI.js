// AI for the opponent team (team 1, attacks left).
// A style is picked once at match start (pickRandomStyle) and stays fixed.
// Computes a style-based home position, then delegates to the shared runDecision.

import { FX, FW, FY, FH, PR, GY1, GY2, BASE_SPD, clamp, lerp } from './constants';
import { moveToward } from './ai';
import { runDecision } from './decision';
import { clearBall } from './physics';
import { OPP_STYLES, pickRandomStyle } from '../data/oppStyles';

export { OPP_STYLES, pickRandomStyle };

// ─── Movement ─────────────────────────────────────────────────────────────────

export function moveTeam1(g, p) {
  // Stun: can't move
  if (p.stun > 0) { p.stun--; return; }

  const { ball, players } = g;
  const style = OPP_STYLES[g.oppStyleKey] || OPP_STYLES.attacking;

  // ── GK: special — always guard the right goal ──────────────────────────────
  if (p.role === 'gk') {
    if (p.hasBall) { clearBall(g, p); return; }
    const urgency = ball.x > FX + FW * 0.75 ? 2.2 : 1.3;
    moveToward(p, FX + FW * 0.945, clamp(ball.y, GY1 + PR, GY2 - PR), BASE_SPD * urgency);
    return;
  }

  // Select mode: withBall when this team has possession
  const oppTeamHasBall = ball.owner !== null && players[ball.owner]?.team === 1;
  const mode  = oppTeamHasBall ? style.withBall : style.withoutBall;
  const speed = BASE_SPD * (p.vitesse ?? 70) / 70 * mode.speedMul * ((p.forme ?? 76) / 100);

  // ── Compute tactical home position ────────────────────────────────────────
  // dir = -1: team 1 attacks left, forwardPush > 0 moves them toward lower X
  const homeX = clamp(p.bx - mode.forwardPush * FW, FX + PR, FX + FW - PR);
  const homeY = clamp(lerp(p.by, ball.y, mode.ballW * 0.85), FY + PR, FY + FH - PR);

  // ── Shared decision tree ──────────────────────────────────────────────────
  runDecision(p, g, { x: homeX, y: homeY }, speed);
}
