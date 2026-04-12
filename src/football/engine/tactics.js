// Tactic definitions for the player's team.
//
// Unified format — same structure as OPP_STYLES so both AIs feed the same decision engine.
//
// forwardPush  — how far to shift base position toward the opponent's goal
//                positive = push forward, negative = hold back / retreat
//                applied as: homeX = bx + forwardPush * FW * dir   (dir = ±1 per team)
// ballW        — weight [0–1] pulling each player toward the ball (both axes)
// speedMul     — speed multiplier
//
// Special flags (handled in playerAI before runDecision):
//   cross    — wide mids + fwds go to touchline
//   markOpp  — every outfield player locks onto nearest opponent
//   holdBall — ball carrier does not advance, just holds position

export const TACTICS = {
  attack:   { label: 'Attaque',           key: 'a',
    withBall:    { forwardPush: 0.25, ballW: 0.40, speedMul: 1.10 },
    withoutBall: { forwardPush: 0.20, ballW: 0.38, speedMul: 1.05 },
  },
  defend:   { label: 'Défense',           key: 'd',
    withBall:    { forwardPush: -0.10, ballW: 0.15, speedMul: 1.00 },
    withoutBall: { forwardPush: -0.25, ballW: 0.08, speedMul: 1.00 },
  },
  tackle:   { label: 'Tacle',             key: 't',
    withBall:    { forwardPush:  0.10, ballW: 0.50, speedMul: 1.20 },
    withoutBall: { forwardPush:  0.00, ballW: 0.90, speedMul: 1.30 },
    stealBonus: true,
  },
  hold:     { label: 'Garder',            key: 'g',
    withBall:    { forwardPush:  0.00, ballW: 0.08, speedMul: 0.70 },
    withoutBall: { forwardPush:  0.05, ballW: 0.05, speedMul: 0.80 },
    holdBall: true,
  },
  press:    { label: 'Presse haute',      key: 'p',
    withBall:    { forwardPush:  0.35, ballW: 0.55, speedMul: 1.15 },
    withoutBall: { forwardPush:  0.40, ballW: 0.65, speedMul: 1.20 },
  },
  flee:     { label: 'Fuite',             key: 'f',
    withBall:    { forwardPush: -0.30, ballW: 0.10, speedMul: 1.30 },
    withoutBall: { forwardPush: -0.55, ballW: 0.00, speedMul: 1.40 },
  },
  cross:    { label: 'Centre',            key: 'c',
    withBall:    { forwardPush:  0.15, ballW: 0.20, speedMul: 1.00 },
    withoutBall: { forwardPush:  0.10, ballW: 0.18, speedMul: 1.00 },
    cross: true,
  },
  dribble:  { label: 'Dribble danger',    key: 'x',
    withBall:    { forwardPush:  0.30, ballW: 0.20, speedMul: 1.20 },
    withoutBall: { forwardPush:  0.25, ballW: 0.25, speedMul: 1.15 },
  },
  fallback: { label: 'Repli',             key: 'r',
    withBall:    { forwardPush: -0.20, ballW: 0.05, speedMul: 1.20 },
    withoutBall: { forwardPush: -0.48, ballW: 0.00, speedMul: 1.30 },
  },
  mark:     { label: 'Marquage indiv.',   key: 'm',
    withBall:    { forwardPush:  0.05, ballW: 0.10, speedMul: 1.00 },
    withoutBall: { forwardPush:  0.00, ballW: 0.00, speedMul: 1.00 },
    markOpp: true,
  },
  zone:     { label: 'Zone pressante',    key: 'z',
    withBall:    { forwardPush:  0.10, ballW: 0.40, speedMul: 1.05 },
    withoutBall: { forwardPush:  0.05, ballW: 0.55, speedMul: 1.10 },
  },
  rhythm:   { label: 'Haut rythme',       key: 'h',
    withBall:    { forwardPush:  0.15, ballW: 0.40, speedMul: 1.60 },
    withoutBall: { forwardPush:  0.10, ballW: 0.40, speedMul: 1.60 },
  },
};

export const KEY_MAP = Object.fromEntries(
  Object.entries(TACTICS).map(([id, t]) => [t.key, id])
);
