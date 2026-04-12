import { FX, FW, FY, FH } from './constants';
import { generateStats } from '../data/playerStats';

// Normalized [0-1] formation coords (x, y within the field).
// Team 0 attacks right, team 1 attacks left.

const TEAM0_FORM = [
  { role: 'gk',  nx: 0.03, ny: 0.50 },
  { role: 'def', nx: 0.17, ny: 0.18 }, { role: 'def', nx: 0.17, ny: 0.39 },
  { role: 'def', nx: 0.17, ny: 0.61 }, { role: 'def', nx: 0.17, ny: 0.82 },
  { role: 'mid', nx: 0.42, ny: 0.15 }, { role: 'mid', nx: 0.42, ny: 0.38 },
  { role: 'mid', nx: 0.42, ny: 0.62 }, { role: 'mid', nx: 0.42, ny: 0.85 },
  { role: 'fwd', nx: 0.68, ny: 0.36 }, { role: 'fwd', nx: 0.68, ny: 0.64 },
];

const TEAM1_FORM = [
  { role: 'gk',  nx: 0.97, ny: 0.50 },
  { role: 'def', nx: 0.83, ny: 0.18 }, { role: 'def', nx: 0.83, ny: 0.39 },
  { role: 'def', nx: 0.83, ny: 0.61 }, { role: 'def', nx: 0.83, ny: 0.82 },
  { role: 'mid', nx: 0.58, ny: 0.15 }, { role: 'mid', nx: 0.58, ny: 0.38 },
  { role: 'mid', nx: 0.58, ny: 0.62 }, { role: 'mid', nx: 0.58, ny: 0.85 },
  { role: 'fwd', nx: 0.32, ny: 0.36 }, { role: 'fwd', nx: 0.32, ny: 0.64 },
];

// Player runtime shape.
// bx/by   = formation base position (canvas px) — used by AI to compute target
// hasBall = true when this player currently owns the ball
// boost   = remaining frames of speed boost (substitution)
// num     = shirt number [1-11]
function mkPlayer(f, team, num) {
  const x = FX + f.nx * FW;
  const y = FY + f.ny * FH;
  return { x, y, role: f.role, team, bx: x, by: y, hasBall: false, boost: 0, stun: 0, num, ...generateStats(f.role) };
}

export function makePlayers() {
  return [
    ...TEAM0_FORM.map((f, i) => mkPlayer(f, 0, i + 1)),
    ...TEAM1_FORM.map((f, i) => mkPlayer(f, 1, i + 1)),
  ];
}

export function makeInitialBall() {
  return { x: FX + FW / 2, y: FY + FH / 2, vx: 1.2, vy: 0.8, owner: null, lob: 0 };
}

// Convert a rich playerGen player → lean engine player
export function playerToEngine(p, team, num) {
  const x = FX + p.nx * FW;
  const y = FY + p.ny * FH;
  return {
    x, y, role: p.role, team, bx: x, by: y,
    hasBall: false, boost: 0, stun: 0,
    num, name: p.name ?? null,
    ...(p.stats ?? {}),   // spread vitesse, tir, passe, forme
  };
}
