
const TROUDUC_ORDER = [
  '3','4','5','6','7','8','9','10','V','D','R','A','2'
];

export const getCardPower = (card) =>
  TROUDUC_ORDER.indexOf(card.rank.name)+1;

export const distributeCards = (deck, players) => {
  const hands = {};
  players.forEach(p => hands[p] = []);

  let i = 0;
  while (deck.length) {
    const card = deck.pop();
    hands[players[i % players.length]].push(card);
    i++;
  }

  return hands;
};

const getWorstCards = (hand, count) =>
  [...hand]
    .sort((a, b) => getCardPower(a) - getCardPower(b))
    .slice(0, count);
    const getBestCards = (hand, count) =>
  [...hand]
    .sort((a, b) => getCardPower(b) - getCardPower(a))
    .slice(0, count);
export const applyHierarchyExchange = ({
  hands,
  hierarchy,
  playersCount,
  humanPlayer = 'bottom'
}) => {
  const newHands = structuredClone(hands);

  const pending = {
    president: null,
    vicePresident: null
  };

  const {
    president,
    vicePresident,
    viceTrouduc,
    trouduc
  } = hierarchy;

  let lastTrouducExchange = null;
  let lastViceTrouducExchange = null;
  // --------------------
  // Trouduc → Président
  // --------------------
  if (president && trouduc) {
    const cardsFromTrouduc = getBestCards(newHands[trouduc], 2);

    newHands[trouduc] =
      newHands[trouduc].filter(c => !cardsFromTrouduc.includes(c));

    newHands[president].push(...cardsFromTrouduc);

    if (president === humanPlayer) {
      // humain → échange manuel
      pending.president = cardsFromTrouduc;
    } else {
      // IA → échange auto (pires cartes)
      const giveBack = getWorstCards(newHands[president], 2);

      newHands[president] =
        newHands[president].filter(c => !giveBack.includes(c));

      newHands[trouduc].push(...giveBack);
      lastTrouducExchange= {
            given: cardsFromTrouduc, role: 'trouduc',
            received: giveBack // celles reçues automatiquement
        }
    }
  }

  // --------------------
  // Vice-trouduc → Vice-président
  // --------------------
  if (
    playersCount >= 4 &&
    vicePresident &&
    viceTrouduc
  ) {
    const cardFromViceTrouduc =
      getBestCards(newHands[viceTrouduc], 1)[0];

    newHands[viceTrouduc] =
      newHands[viceTrouduc].filter(c => c !== cardFromViceTrouduc);

    newHands[vicePresident].push(cardFromViceTrouduc);

    if (vicePresident === humanPlayer) {
      pending.vicePresident = [cardFromViceTrouduc];
    } else {
      const giveBack =
        getWorstCards(newHands[vicePresident], 1);

      newHands[vicePresident] =
        newHands[vicePresident].filter(c => c !== giveBack[0]);

      newHands[viceTrouduc].push(giveBack[0]);
      lastViceTrouducExchange= {
            given: [cardFromViceTrouduc], role: 'viceTrouduc',
            received: giveBack // celles reçues automatiquement
        }
    }
  }

  return {
    hands: newHands,
    pending, lastTrouducExchange, lastViceTrouducExchange
  };
};

export const groupByRank = (hand) => {
  return hand.reduce((acc, c) => {
    acc[getCardPower(c)] = acc[getCardPower(c)] || [];
    acc[getCardPower(c)].push(c);
    return acc;
  }, {});
};

export const playTrouducCards = ({
  player,
  cards,
  state,
  playerHands
}) => {
  if (!isValidPlay(cards, state.lastPlay)) {
    throw new Error('Coup invalide');
  }

  // retirer les cartes
  const newHands = {
    ...playerHands,
    [player]: playerHands[player].filter(
      c => !cards.includes(c)
    )
  };

  const newState = {
    ...state,
    lastPlay: {
      value: getCardPower(cards[0]),
      count: cards.length,
      player
    },
    passes: new Set(),
  };

  if (newHands[player].length === 0) {
    newState.finishedPlayers = [
      ...state.finishedPlayers,
      player
    ];
  }

  return { newHands, newState };
};
export const passTurn = (player, state) => {
  const passes = new Set(state.passes);
  passes.add(player);

  return {
    ...state,
    passes
  };
};

export const isValidPlay = (cards, lastPlay) => {
  if (!cards.length) return false;

  const value = getCardPower(cards[0]);
  const sameValue = cards.every(
    c => getCardPower(c) === value
  );

  if (!sameValue) return false;

  if (!lastPlay) return true;

  return (
    cards.length === lastPlay.count &&
    value > lastPlay.value
  );
};


export const dealTrouduc = (deck, players) => {
  const hands = {};
  players.forEach(p => hands[p] = []);

  let i = 0;
  while (deck.length) {
    hands[players[i % players.length]].push(deck.pop());
    i++;
  }

  return hands;
};
export const shouldResetTrick = (state, players) => {
  const activePlayers = players.filter(
    p => !state.finishedPlayers.includes(p)
  );

  return (
    state.lastPlay &&
    state.passes.size === activePlayers.length - 1
  );
};
export const resetTrick = (state) => ({
  ...state,
  lastPlay: null,
  passes: new Set(),
  currentPlayer: state.lastPlay.player
});
export const trouducAIPlay = ({
  player,
  hand,
  lastPlay
}) => {
  const groups = {};

  hand.forEach(card => {
    const v = getCardPower(card);
    groups[v] = groups[v] || [];
    groups[v].push(card);
  });

  const possiblePlays = Object.values(groups)
    .filter(g => !lastPlay || g.length >= lastPlay.count)
    .map(g => g.slice(0, lastPlay?.count || 1))
    .filter(g => isValidPlay(g, lastPlay));

  if (!possiblePlays.length) return null;

  // jouer le plus petit possible
  return possiblePlays.sort(
    (a, b) => getCardPower(a[0]) - getCardPower(b[0])
  )[0];
};
export const isGameOver = (state, players) =>
  state.finishedPlayers.length === players.length - 1;

    
export const sortHandDesc = (hand) =>
  [...hand].sort(
    (a, b) => getCardPower(b) - getCardPower(a)
  );