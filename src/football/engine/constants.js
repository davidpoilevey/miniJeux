// ─── Canvas & Field ───────────────────────────────────────────────────────────
export const CW = 860, CH = 540;
export const FX = 20,  FY = 30;    // field origin (canvas px)
export const FW = 820, FH = 490;   // field size (canvas px)

// Goals
export const GH = 84;              // goal height
export const GW = 14;              // goal depth (drawn)
export const GY1 = FY + (FH - GH) / 2;
export const GY2 = GY1 + GH;

// Actors
export const PR = 9;               // player radius
export const BR = 6;               // ball radius

// Physics
export const BASE_SPD     = 2.2;
export const BALL_FRICTION = 0.984;
export const BALL_BOUNCE   = 0.65;

// Match timing  (30 real sec → 90 game min)
export const TOTAL_FRAMES = 60 * 30;

// Decision thresholds
export const NEARBY       = 90;   // ball is "in play range" — player reacts actively
export const THREAT_RANGE = 28;   // opponent this close to ball carrier → pass
export const STUN_FRAMES  = 60;   // frames a tackled player stays stunned (~1 s)

// ─── Math helpers ─────────────────────────────────────────────────────────────
export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export const d2    = (a, b)      => Math.hypot(a.x - b.x, a.y - b.y);
export const lerp  = (a, b, t)   => a + (b - a) * t;
