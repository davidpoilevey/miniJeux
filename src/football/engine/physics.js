import { FX, FW, FY, FH, BR, GY1, GY2, GH, GW, BALL_FRICTION, BALL_BOUNCE, d2 } from './constants';

export function updateBall(g) {
  const { ball, players } = g;

  if (ball.lob > 0) ball.lob--;

  if (ball.owner !== null) {
    const own = players[ball.owner];
    if (own) { ball.x = own.x; ball.y = own.y; }
    return;
  }

  ball.x += ball.vx;
  ball.y += ball.vy;
  ball.vx *= BALL_FRICTION;
  ball.vy *= BALL_FRICTION;

  // Top/bottom walls
  if (ball.y < FY + BR)      { ball.y = FY + BR;      ball.vy *= -BALL_BOUNCE; }
  if (ball.y > FY + FH - BR) { ball.y = FY + FH - BR; ball.vy *= -BALL_BOUNCE; }

  // Left/right walls — only outside goal mouth
  const inGoalY = ball.y > GY1 && ball.y < GY2;
  if (!inGoalY) {
    if (ball.x < FX + BR)      { ball.x = FX + BR;      ball.vx *= -BALL_BOUNCE; }
    if (ball.x > FX + FW - BR) { ball.x = FX + FW - BR; ball.vx *= -BALL_BOUNCE; }
  }
}

// Returns true if a goal was scored (caller should sync UI)
export function checkGoal(g) {
  const { ball } = g;
  if (ball.y <= GY1 || ball.y >= GY2) return false;

  let scored = -1;
  if (ball.x < FX - GW)      scored = 1; // opp scores in left goal
  if (ball.x > FX + FW + GW) scored = 0; // player scores in right goal
  if (scored < 0) return false;

  g.score[scored]++;
  g.lastGoalTeam = scored;
  g.goalAnim = 160;
  g.phase = 'goal';
  ball.owner = null;
  return true;
}

export function shoot(g, player, targetSide) {
  const { ball } = g;
  ball.owner = null;
  player.hasBall = false;
  const t = Math.max(0, Math.min(1, ((player.tir ?? 70) - 40) / 60));
  const power = 7 + t * 7 + Math.random() * 3;            // 7–17 based on tir
  // Direction: aim at a random point in goal then add angular wobble (bad shooter = wider error)
  const gx  = targetSide === 1 ? FX + FW + 10 : FX - 10;
  const gy  = FY + FH / 2 + (Math.random() - 0.5) * GH * (0.70 - t * 0.30);
  const base = Math.atan2(gy - ball.y, gx - ball.x);
  const err  = (1 - t) * 0.18;                            // max ±0.18 rad (~10°) for poor shooter
  const angle = base + (Math.random() - 0.5) * err * 2;
  ball.vx = Math.cos(angle) * power;
  ball.vy = Math.sin(angle) * power;
  ball.lob = Math.floor(7 + power * 0.55);                // ~11–17 frames airborne: no instant recatch
}

export function pass(g, player, team) {
  const { ball, players } = g;
  const teammates = players.filter(p => p.team === team && !p.hasBall && p.role !== 'gk');
  if (!teammates.length) return;

  const fwd = team === 0
    ? teammates.filter(p => p.x > player.x + 25)
    : teammates.filter(p => p.x < player.x - 25);
  const pool = fwd.length ? fwd : teammates;
  const target = pool.reduce((b, p) => d2(player, p) < d2(player, b) ? p : b);

  ball.owner = null;
  player.hasBall = false;
  const t = Math.max(0, Math.min(1, ((player.passe ?? 70) - 40) / 60));
  const spd    = 5 + t * 4 + Math.random() * 2;           // 5–11 based on passe
  const maxErr = (1 - t) * 0.28;                          // angular error: 0.28 rad → 0
  const angle  = Math.atan2(target.y - ball.y, target.x - ball.x)
               + (Math.random() - 0.5) * maxErr * 2;
  ball.vx = Math.cos(angle) * spd;
  ball.vy = Math.sin(angle) * spd;
}

// GK clears the ball well past the center line — lobbed over the crowd
export function clearBall(g, player) {
  const { ball } = g;
  ball.owner = null;
  player.hasBall = false;
  const dir     = player.team === 0 ? 1 : -1;
  const targetX = FX + FW / 2 + dir * (FW * 0.18 + Math.random() * FW * 0.15);
  const targetY = FY + FH * (0.25 + Math.random() * 0.50);
  const dx = targetX - ball.x, dy = targetY - ball.y;
  const dd = Math.hypot(dx, dy);
  const power = 11 + Math.random() * 4;
  ball.vx = (dx / dd) * power;
  ball.vy = (dy / dd) * power;
  ball.lob = 28 + Math.floor(Math.random() * 18); // 28–46 frames: flies over attacker in front
}
