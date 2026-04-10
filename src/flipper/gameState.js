// ─── État initial ─────────────────────────────────────────────────────────────
export const INITIAL_STATE = {
  score:  0,
  lives:  3,
  ball:   1,      // numéro de balle en cours (multiball plus tard)
  message: 'Appuie sur Espace pour lancer !',

  // Étapes de débloquage — à personnaliser selon le design
  steps: {
    step1: false,   // ex: bumper central touché 3 fois
    step2: false,   // ex: passage du bas débloqué
    step3: false,   // ex: zone chaude atteinte
  },

  // Compteurs intermédiaires
  counters: {
    bumperHits: 0,
  },
};

// ─── Reduceur simple ──────────────────────────────────────────────────────────
export const gameReducer = (state, action) => {
  switch (action.type) {

    case 'BUMP': {
      const hits = state.counters.bumperHits + 1;
      return {
        ...state,
        score: state.score + action.points,
        counters: { ...state.counters, bumperHits: hits },
        // Exemple : step1 se débloque après 3 hits
        steps: { ...state.steps, step1: hits >= 3 },
        message: hits >= 3 && !state.steps.step1 ? '🔥 Passage débloqué !' : state.message,
      };
    }

    case 'STEP_UNLOCK':
      return {
        ...state,
        steps: { ...state.steps, [action.step]: true },
        message: action.message ?? state.message,
      };

    case 'SET_MESSAGE':
      return { ...state, message: action.message };

    case 'LOSE_BALL':
      return {
        ...state,
        lives: Math.max(0, state.lives - 1),
        message: state.lives > 1 ? 'Aïe... encore une chance' : 'Game Over 💀',
      };

    case 'ADD_SCORE':
      return { ...state, score: state.score + action.points };

    case 'RESET':
      return INITIAL_STATE;

    default:
      return state;
  }
};