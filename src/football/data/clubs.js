// ─── Liste des clubs adverses disponibles ─────────────────────────────────────
// forme : 1 (faible) → 5 (élite)
// reward : gain en M€ en cas de victoire
// style  : clé dans OPP_STYLES — définit l'IA adverse

export const CLUBS = [
  // ── Élite — prise de risque max, récompense max ────────────────────────────
  { id:  1, name: 'Real Madrid',         abbr: 'RMA', country: '🇪🇸', style: 'counter',    forme: 5, reward: 13.0 },
  { id:  2, name: 'Manchester City',     abbr: 'MCI', country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', style: 'possession', forme: 5, reward: 11.5 },
  { id:  3, name: 'Bayern Munich',       abbr: 'BAY', country: '🇩🇪', style: 'pressing',   forme: 5, reward: 12.0 },

  // ── Très forts ─────────────────────────────────────────────────────────────
  { id:  4, name: 'FC Barcelone',        abbr: 'BAR', country: '🇪🇸', style: 'possession', forme: 4, reward:  8.5 },
  { id:  5, name: 'Liverpool FC',        abbr: 'LIV', country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', style: 'pressing',   forme: 4, reward:  9.0 },
  { id:  6, name: 'PSG',                 abbr: 'PSG', country: '🇫🇷', style: 'attacking',  forme: 4, reward:  9.5 },
  { id:  7, name: 'Atletico Madrid',     abbr: 'ATM', country: '🇪🇸', style: 'defensive',  forme: 4, reward:  7.5 },

  // ── Solides ────────────────────────────────────────────────────────────────
  { id:  8, name: 'Inter Milan',         abbr: 'INT', country: '🇮🇹', style: 'defensive',  forme: 3, reward:  6.0 },
  { id:  9, name: 'Napoli',              abbr: 'NAP', country: '🇮🇹', style: 'attacking',  forme: 3, reward:  6.5 },
  { id: 10, name: 'Borussia Dortmund',   abbr: 'BVB', country: '🇩🇪', style: 'counter',    forme: 3, reward:  5.8 },
  { id: 11, name: 'RB Leipzig',          abbr: 'RBL', country: '🇩🇪', style: 'pressing',   forme: 3, reward:  5.5 },

  // ── Accessibles ────────────────────────────────────────────────────────────
  { id: 12, name: 'Séville FC',          abbr: 'SEV', country: '🇪🇸', style: 'counter',    forme: 2, reward:  4.5 },
  { id: 13, name: 'Porto',               abbr: 'POR', country: '🇵🇹', style: 'attacking',  forme: 2, reward:  4.0 },
  { id: 14, name: 'Ajax Amsterdam',      abbr: 'AJX', country: '🇳🇱', style: 'chaos',      forme: 2, reward:  3.5 },

  // ── Facile ─────────────────────────────────────────────────────────────────
  { id: 15, name: 'Shakhtar Donetsk',   abbr: 'SHA', country: '🇺🇦', style: 'counter',    forme: 1, reward:  2.5 },
    { id: 16, name: 'Haguenau FC',   abbr: 'HAG', country: '🇫🇷', style: 'counter',    forme: 5, reward:  25 },

];
