// ============================================================================
// RÈGLES DU SNOOKER (pur, sans React)
// ============================================================================
//
// Phases :
//  - 'red'      : il faut toucher une rouge en premier, seules les rouges peuvent tomber
//  - 'color'    : après une rouge, une couleur au choix (la 1re touchée = la couleur annoncée),
//                 elle est toujours remise sur son spot
//  - 'sequence' : plus de rouges, les couleurs dans l'ordre jaune → noire, elles restent dans la poche

export const BALL_POINTS = {
  red: 1,
  yellow: 2,
  green: 3,
  brown: 4,
  blue: 5,
  pink: 6,
  black: 7
};

export const COLOR_ORDER = ['yellow', 'green', 'brown', 'blue', 'pink', 'black'];

export const BALL_NAMES = {
  white: 'blanche',
  red: 'rouge',
  yellow: 'jaune',
  green: 'verte',
  brown: 'marron',
  blue: 'bleue',
  pink: 'rose',
  black: 'noire'
};

const FOUL_MIN = 4;

const isColor = (c) => COLOR_ORDER.includes(c);
const value = (c) => BALL_POINTS[c] || 0;
const other = (player) => (player === 1 ? 2 : 1);

// Ce que le joueur doit viser. colorsOnTable : couleurs encore sur la table.
export function getTarget(phase, colorsOnTable) {
  if (phase === 'red') return { label: 'une rouge', colors: ['red'] };
  if (phase === 'color') return { label: 'une couleur', colors: COLOR_ORDER };
  const next = COLOR_ORDER.find(c => colorsOnTable.includes(c));
  return next ? { label: `la ${BALL_NAMES[next]}`, colors: [next] } : null;
}

const listNames = (colors) => colors.map(c => BALL_NAMES[c]).join(' + ');

// Calcule l'issue d'un coup.
//  - state     : { phase, currentPlayer, scores, jokerActive, doublePoints, freeShot }
//  - firstHit  : couleur de la 1re bille touchée par la blanche (ou null)
//  - potted    : couleurs empochées pendant le coup (blanche comprise)
//  - colorsBefore : couleurs présentes sur la table avant le coup
//  - redsLeft  : rouges restant sur la table après le coup
export function resolveShot({ state, firstHit, potted, colorsBefore, redsLeft }) {
  const { phase, currentPlayer, jokerActive, doublePoints, freeShot } = state;
  const scores = [...state.scores];
  const target = getTarget(phase, colorsBefore);
  const pots = potted.filter(c => c !== 'white');
  const pottedColors = pots.filter(isColor);
  const me = `Joueur ${currentPlayer}`;
  const opponent = `Joueur ${other(currentPlayer)}`;
  const afterColors = redsLeft > 0 ? 'red' : 'sequence';

  // --- Détection de faute ---
  let foul = null;
  if (potted.includes('white')) {
    foul = 'la blanche est tombée';
  } else if (!firstHit) {
    foul = 'aucune bille touchée';
  } else if (!jokerActive && !target.colors.includes(firstHit)) {
    foul = `${BALL_NAMES[firstHit]} touchée en premier (il fallait ${target.label})`;
  } else if (!jokerActive) {
    const legal = phase === 'red'
      ? pots.every(c => c === 'red')
      : pots.length <= 1 && pots.every(c => c === firstHit);
    if (!legal) {
      const wrong = phase === 'red' ? pots.filter(c => c !== 'red') : pots;
      foul = `${listNames(wrong)} empochée${wrong.length > 1 ? 's' : ''} (il fallait ${target.label})`;
    }
  }

  if (foul) {
    const ballOn = phase === 'red' ? 1 : phase === 'sequence' ? value(target.colors[0]) : value(firstHit);
    const penalty = Math.max(FOUL_MIN, ballOn, value(firstHit), ...pots.map(value));

    const base = {
      phase: afterColors,
      redsRemaining: redsLeft,
      respot: pottedColors,
      whiteRespot: potted.includes('white'),
      legalPot: false,
      gameOver: false
    };

    if (freeShot) {
      return {
        ...base,
        scores,
        currentPlayer,
        summary: { severity: 'warning', text: `Coup Gratuit 🔄 : ${foul}, mais la faute est annulée. ${me} rejoue` }
      };
    }
    scores[other(currentPlayer) - 1] += penalty;
    return {
      ...base,
      scores,
      currentPlayer: other(currentPlayer),
      summary: { severity: 'error', text: `Faute de ${me} : ${foul}. +${penalty} pour ${opponent}` }
    };
  }

  // --- Coup valide ---
  if (pots.length === 0) {
    const keep = freeShot;
    return {
      scores,
      phase: phase === 'color' ? afterColors : phase,
      redsRemaining: redsLeft,
      currentPlayer: keep ? currentPlayer : other(currentPlayer),
      respot: [],
      whiteRespot: false,
      legalPot: false,
      gameOver: false,
      summary: keep
        ? { severity: 'info', text: `Rien empoché, mais Coup Gratuit 🔄 : ${me} rejoue` }
        : { severity: 'info', text: `Rien empoché, au tour de ${opponent}` }
    };
  }

  const mult = doublePoints ? 2 : 1;
  const points = pots.reduce((sum, c) => sum + value(c), 0) * mult;
  scores[currentPlayer - 1] += points;

  // En séquence finale les couleurs restent dans la poche, sinon elles reviennent
  const respot = phase === 'sequence' ? [] : pottedColors;
  const colorsLeft = colorsBefore.filter(c => !pots.includes(c) || respot.includes(c));
  const gameOver = phase === 'sequence' && colorsLeft.length === 0;

  // (avec le Joker on peut empocher une couleur en visant une rouge, et inversement)
  let nextPhase = 'sequence';
  if (phase === 'red') nextPhase = pots.includes('red') ? 'color' : afterColors;
  if (phase === 'color') nextPhase = pottedColors.length > 0 ? afterColors : 'color';
  const detail = `+${points} (${listNames(pots)}${mult > 1 ? ' ×2' : ''})`;

  let summary = { severity: 'success', text: `${detail}, ${me} continue` };
  if (gameOver) {
    const [s1, s2] = scores;
    summary = {
      severity: 'success',
      text: s1 === s2
        ? `${detail}. Fin de partie : égalité ${s1} partout !`
        : `${detail}. 🏆 Joueur ${s1 > s2 ? 1 : 2} gagne ${Math.max(s1, s2)} à ${Math.min(s1, s2)} !`
    };
  }

  return {
    scores,
    phase: nextPhase,
    redsRemaining: redsLeft,
    currentPlayer,
    respot,
    whiteRespot: false,
    legalPot: true,
    gameOver,
    summary
  };
}
