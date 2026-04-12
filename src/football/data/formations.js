// ─── Named formation presets ──────────────────────────────────────────────────
// Chaque formation = 11 joueurs avec rôle + position normalisée (nx, ny).
// nx : 0 = but propre, 1 = but adverse   (notre équipe attaque vers la droite)
// ny : 0 = haut du terrain, 1 = bas
//
// Structure identique à TEAM0_FORM dans engine/formations.js — les branchements
// remplaceront TEAM0_FORM par la formation choisie ici.

export const FORMATIONS = {
  '4-4-2': {
    label: '4-4-2 Classic',
    players: [
      { role: 'gk',  nx: 0.03, ny: 0.50 },
      { role: 'def', nx: 0.17, ny: 0.18 }, { role: 'def', nx: 0.17, ny: 0.39 },
      { role: 'def', nx: 0.17, ny: 0.61 }, { role: 'def', nx: 0.17, ny: 0.82 },
      { role: 'mid', nx: 0.42, ny: 0.15 }, { role: 'mid', nx: 0.42, ny: 0.38 },
      { role: 'mid', nx: 0.42, ny: 0.62 }, { role: 'mid', nx: 0.42, ny: 0.85 },
      { role: 'fwd', nx: 0.68, ny: 0.36 }, { role: 'fwd', nx: 0.68, ny: 0.64 },
    ],
  },
  '4-3-3': {
    label: '4-3-3 Attaque',
    players: [
      { role: 'gk',  nx: 0.03, ny: 0.50 },
      { role: 'def', nx: 0.17, ny: 0.18 }, { role: 'def', nx: 0.17, ny: 0.39 },
      { role: 'def', nx: 0.17, ny: 0.61 }, { role: 'def', nx: 0.17, ny: 0.82 },
      { role: 'mid', nx: 0.38, ny: 0.26 }, { role: 'mid', nx: 0.44, ny: 0.50 },
      { role: 'mid', nx: 0.38, ny: 0.74 },
      { role: 'fwd', nx: 0.72, ny: 0.20 }, { role: 'fwd', nx: 0.76, ny: 0.50 },
      { role: 'fwd', nx: 0.72, ny: 0.80 },
    ],
  },
  '3-5-2': {
    label: '3-5-2 Latéraux',
    players: [
      { role: 'gk',  nx: 0.03, ny: 0.50 },
      { role: 'def', nx: 0.17, ny: 0.25 }, { role: 'def', nx: 0.17, ny: 0.50 },
      { role: 'def', nx: 0.17, ny: 0.75 },
      { role: 'mid', nx: 0.28, ny: 0.08 }, { role: 'mid', nx: 0.40, ny: 0.30 },
      { role: 'mid', nx: 0.44, ny: 0.50 }, { role: 'mid', nx: 0.40, ny: 0.70 },
      { role: 'mid', nx: 0.28, ny: 0.92 },
      { role: 'fwd', nx: 0.68, ny: 0.36 }, { role: 'fwd', nx: 0.68, ny: 0.64 },
    ],
  },
  '5-4-1': {
    label: '5-4-1 Bus',
    players: [
      { role: 'gk',  nx: 0.03, ny: 0.50 },
      { role: 'def', nx: 0.14, ny: 0.10 }, { role: 'def', nx: 0.17, ny: 0.30 },
      { role: 'def', nx: 0.17, ny: 0.50 }, { role: 'def', nx: 0.17, ny: 0.70 },
      { role: 'def', nx: 0.14, ny: 0.90 },
      { role: 'mid', nx: 0.38, ny: 0.20 }, { role: 'mid', nx: 0.40, ny: 0.40 },
      { role: 'mid', nx: 0.40, ny: 0.60 }, { role: 'mid', nx: 0.38, ny: 0.80 },
      { role: 'fwd', nx: 0.68, ny: 0.50 },
    ],
  },
};

export const FORMATION_IDS = Object.keys(FORMATIONS);
export const DEFAULT_FORMATION = '4-4-2';
