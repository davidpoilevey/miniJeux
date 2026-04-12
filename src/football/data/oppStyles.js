// ─── Styles de jeu adverses ────────────────────────────────────────────────────
// Chaque style définit les paramètres withBall / withoutBall passés à l'IA adverse.
// Structure identique à TACTICS dans engine/tactics.js pour branchement direct.

export const OPP_STYLES = {
  attacking: {
    label: 'Attaquante',     emoji: '⚔️',
    desc:  'Ligne haute, pression constante',
    withBall:    { forwardPush: 0.28, ballW: 0.50, speedMul: 1.10 },
    withoutBall: { forwardPush: 0.10, ballW: 0.40, speedMul: 1.15 },
    stealChance: 0.040, stealRange: 14,
  },
  defensive: {
    label: 'Défensive',      emoji: '🛡️',
    desc:  'Bloc bas, contres rapides',
    withBall:    { forwardPush:  0.18, ballW: 0.35, speedMul: 1.05 },
    withoutBall: { forwardPush: -0.22, ballW: 0.08, speedMul: 0.95 },
    stealChance: 0.018, stealRange: 12,
  },
  pressing: {
    label: 'Pressing',       emoji: '🔥',
    desc:  'Harcèlement permanent sur tout le terrain',
    withBall:    { forwardPush: 0.28, ballW: 0.60, speedMul: 1.20 },
    withoutBall: { forwardPush: 0.00, ballW: 0.78, speedMul: 1.30 },
    stealChance: 0.065, stealRange: 16,
  },
  counter: {
    label: 'Contre-attaque', emoji: '⚡',
    desc:  'Compact sans ballon, explosif avec',
    withBall:    { forwardPush:  0.40, ballW: 0.55, speedMul: 1.45 },
    withoutBall: { forwardPush: -0.28, ballW: 0.06, speedMul: 0.88 },
    stealChance: 0.022, stealRange: 12,
  },
  possession: {
    label: 'Possession',     emoji: '🎯',
    desc:  'Circulation patiente, jamais en danger',
    withBall:    { forwardPush:  0.12, ballW: 0.22, speedMul: 0.85 },
    withoutBall: { forwardPush: -0.12, ballW: 0.30, speedMul: 1.05 },
    stealChance: 0.020, stealRange: 13,
  },
  chaos: {
    label: 'Chaos total',    emoji: '🌀',
    desc:  'Imprévisible — tout le monde court partout',
    withBall:    { forwardPush: 0.32, ballW: 0.80, speedMul: 1.30 },
    withoutBall: { forwardPush: 0.15, ballW: 0.80, speedMul: 1.30 },
    stealChance: 0.050, stealRange: 15,
  },
};

const STYLE_KEYS = Object.keys(OPP_STYLES);
export const pickRandomStyle = () => STYLE_KEYS[Math.floor(Math.random() * STYLE_KEYS.length)];
