// ─── Player stats schema ──────────────────────────────────────────────────────
// Values are 0-100. The four active stats drive gameplay directly:
//   vitesse → movement speed
//   tir     → shot power, accuracy, and willingness to shoot
//   passe   → pass probability and angular accuracy
//   forme   → overall performance multiplier (fatigue, day-form…)

export const STATS_SCHEMA = {
  vitesse:    { label: 'Vitesse',     icon: '⚡' },
  endurance:  { label: 'Endurance',   icon: '🫁' },
  technique:  { label: 'Technique',   icon: '🎯' },
  force:      { label: 'Force',       icon: '💪' },
  passe:      { label: 'Passe',       icon: '🔁' },
  tir:        { label: 'Tir',         icon: '🥅' },
  defense:    { label: 'Défense',     icon: '🛡️' },
};

// Role-specific base values for the four active stats
const ROLE_BASES = {
  gk:  { vitesse: 56, tir: 38, passe: 54, forme: 78 },
  def: { vitesse: 63, tir: 44, passe: 60, forme: 76 },
  mid: { vitesse: 68, tir: 60, passe: 74, forme: 76 },
  fwd: { vitesse: 76, tir: 76, passe: 54, forme: 76 },
};

// Generate randomized stats for a player of given role (±10 variation)
export function generateStats(role) {
  const base = ROLE_BASES[role] || ROLE_BASES.mid;
  const jitter = () => Math.round((Math.random() - 0.5) * 20);
  const cap    = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  return {
    vitesse: cap(base.vitesse + jitter(), 40, 97),
    tir:     cap(base.tir     + jitter(), 28, 97),
    passe:   cap(base.passe   + jitter(), 28, 97),
    forme:   cap(base.forme   + jitter(), 50, 99),
  };
}

// Role-specific stat weights (used for overall rating display)
export const ROLE_WEIGHTS = {
  gk:  { defense: 0.5, force: 0.2, endurance: 0.2, vitesse: 0.1 },
  def: { defense: 0.4, force: 0.2, endurance: 0.2, vitesse: 0.1, passe: 0.1 },
  mid: { passe: 0.3, technique: 0.25, endurance: 0.25, vitesse: 0.1, tir: 0.1 },
  fwd: { tir: 0.35, vitesse: 0.3, technique: 0.2, endurance: 0.15 },
};

export function computeOverall(stats, role) {
  const weights = ROLE_WEIGHTS[role] || ROLE_WEIGHTS.mid;
  return Math.round(
    Object.entries(weights).reduce((sum, [k, w]) => sum + (stats[k] ?? 70) * w, 0)
  );
}
