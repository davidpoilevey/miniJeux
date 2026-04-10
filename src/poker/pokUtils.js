
import { carteNameByValue } from './Card';

export const STAGES = [{ name: 'pre-flop', lowLimit: 15, hiLimit: 25, color: '#92f898' },
{ name: 'flop', lowLimit: 50, hiLimit: 150, color: '#a2a898' },
{ name: 'turn', lowLimit: 100, hiLimit: 255, color: '#e2a828' },
{ name: 'river', lowLimit: 180, hiLimit: 305, color: '#f2c838' }];
export const getStage = gs => {
  for (let s = 0; s < STAGES.length; s++) {
    if (gs === STAGES[s].name)
      return STAGES[s];
  }
  return {};
}



export const evaluateMain = (main, commonCards = [], returnHumanReadable) => {
  // un bon jeu c'est une paire ou des connecteurs assortis
  let humanReadable = 'Rien';
  if (main.length < 2) {
    return returnHumanReadable ? 'Rien' : 0
  }
  let score = Math.max(main[0].rank.value, main[1].rank.value);


  if (main[0].rank.value === main[1].rank.value) // paire
    score += 10;
  if (main[0].suits === main[1].suits) // assortis
    score += 7;
  if (main[0].rank.value === main[1].rank.value + 1 || main[1].rank.value === main[0].rank.value + 1) // connecteurs
    score += 6;

  // c'est aussi une combinaison
  const mainCombinee = main.concat(commonCards);
  let maxval = 0;
  mainCombinee.forEach(m => {
    if (m.rank.value > maxval) {
      maxval = m.rank.value;
    }
  })
  humanReadable = 'Carte haute : ' + carteNameByValue(maxval);
  const mainsVals = mainCombinee.map(c => c.rank.value);
  const compteOccurrences = {};
  mainsVals.forEach(nombre => {
    compteOccurrences[nombre] = (compteOccurrences[nombre] || 0) + 1;
  });
  // if cartes identiques:(carre brelan paire full)  
  for (let mVal in compteOccurrences) {
    const m = Number(mVal);
    if (compteOccurrences[m] === 4) {
      // carré !!!
      score += (10000 + m * m);
      humanReadable = 'Carré de ' + carteNameByValue(m);
    }
    else if (compteOccurrences[m] === 3) {
      // brelan !!!
      score += (1000 + m * m);
      humanReadable = 'Brelan de ' + carteNameByValue(m);
    }
    if (compteOccurrences[m] === 2) {
      // paire
      if (score > 1000)
        humanReadable = 'Full !! ';
      else if (score > 100)
        humanReadable = 'Double Paire  ';
      else
        humanReadable = 'Paire de ' + carteNameByValue(m);
      score += (100 + m);
    }
  }

  // cherche couleur ou presque couleur

  const nbCouleurMax = {};
  mainCombinee.forEach((carte) => {
    if (nbCouleurMax[carte.suit] == null)
      nbCouleurMax[carte.suit] = 0;
    nbCouleurMax[carte.suit]++;
  });
  const arrCoul = Object.values(nbCouleurMax);
  if (arrCoul.includes(5) || arrCoul.includes(6) || arrCoul.includes(7)) {
    // couleur
    score = 5000;
    // on rajoute la valeur des 5 plus haute cartes
    const cleMax = Object.keys(nbCouleurMax).reduce((a, b) => nbCouleurMax[a] > nbCouleurMax[b] ? a : b);// ici coeur

    let coeurs = mainCombinee.filter(carte => carte.suit === cleMax);
    coeurs.sort((a, b) => b.rank.value - a.rank.value); // Trie par ordre décroissant de valeur

    for (let i = 0; i < Math.min(coeurs.length, 5); i++) {
      score += coeurs[i].rank.value;
    }
    humanReadable = 'Couleur'
  }
  if (arrCoul.includes(4) && commonCards.length < 5) {
    // presque couleur, ca vaut de miser
    score += (200);
  }
  if (arrCoul.includes(3) && commonCards.length < 4) {
    // presque couleur, ca vaut de miser
    score += (100);
  }

  // cherche suite ou presque suite
  let longueurMax = 0;
  let longueurCourante = 1;
  let valeurMax = 0;

  for (let i = 1; i < mainsVals.length; i++) {
    if (mainsVals[i] === mainsVals[i - 1] + 1) {
      longueurCourante++;
    } else {
      longueurMax = Math.max(longueurMax, longueurCourante);
      valeurMax = mainsVals[i];
      longueurCourante = 1;
    }
  }
  longueurMax = Math.max(longueurMax, longueurCourante);
  if (longueurMax >= 5) {
    // suite
    score += (2000 + valeurMax * valeurMax);
    humanReadable = 'Suite au ' + carteNameByValue(valeurMax);
  }
  if (longueurMax === 4 && commonCards.length < 5) {
    // presque suite, ca vaut de miser
    score += (200 + valeurMax);
  }
  if (longueurMax === 3 && commonCards.length < 4) {
    // presque suite, ca vaut de miser
    score += (100 + valeurMax);
  }


  if (returnHumanReadable)
    return humanReadable;

  return score;
}


export const evaluateChoix = (player, score, mise, gameStage) => {
  const { tight, bluff } = player.profile;
  const CALL_CHECK = (mise > 0) ? 'call' : 'check';
  // Fonction pour le test "tight"
  const scoreTest = (tightValue, miz) => {
    let randomAction = Math.random() * 100 ; // Générer un nombre aléatoire entre 0 et 100 pondéré par la mise courante.. si y a trop le jeu, le bluff est dangereux
    if(miz!=null){
      // un bluffeur peut miser gros si la mise est pas importante 
      randomAction-=(mise/10);
    }

    return randomAction < tightValue;
  };
  // score pondéré par nb de carte en jeu
  const limiteMauvaise = getStage(gameStage).lowLimit;
  const limiteBonne = getStage(gameStage).hiLimit;

  if (score < limiteMauvaise) {
    // Main mauvaise
    if (scoreTest(tight)) {// le mec ne joue qu'avec une bonne main
      return 'fold';
    } else {// capable de rever
      return (scoreTest(bluff, mise)) ? CALL_CHECK : 'fold';
    }
  } else if (score >= limiteMauvaise && score < limiteBonne) {
    // Main moyenne
    if (scoreTest(tight)) {
      return (scoreTest(bluff, mise)) ? CALL_CHECK : 'fold';
    } else {
      return (scoreTest(bluff, mise)) ? CALL_CHECK : 'fold';
    }
  } else {
    // Bonne main
    if (scoreTest(tight)) {
      return (scoreTest(bluff, mise)) ? 'bet' : CALL_CHECK;
    } else {
      return  (scoreTest(bluff, mise)) ? 'bet' : CALL_CHECK;
    }
  }
};


// PokerClaude funcs
/**
 * Système d'évaluation des mains de poker Texas Hold'em
 * Fonctionne avec n'importe quelle combinaison de cartes (2 à 7 cartes)
 */

// Constantes pour les rangs des mains
export const HAND_RANKS = {
  HIGH_CARD: 1,
  PAIR: 2,
  TWO_PAIR: 3,
  THREE_OF_KIND: 4,
  STRAIGHT: 5,
  FLUSH: 6,
  FULL_HOUSE: 7,
  FOUR_OF_KIND: 8,
  STRAIGHT_FLUSH: 9,
  ROYAL_FLUSH: 10
};

// Labels pour l'affichage
export const HAND_LABELS = {
  1: 'Carte haute',
  2: 'Paire',
  3: 'Double paire',
  4: 'Brelan',
  5: 'Suite',
  6: 'Couleur',
  7: 'Full',
  8: 'Carré',
  9: 'Quinte flush',
  10: 'Quinte flush royale'
};

// Convertir les valeurs des cartes en nombres
const getCardValue = (card) => {
  const valueMap = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    'V': 11, 'D': 12, 'R': 13, 'A': 14
  };
  return valueMap[card.rank.name] || card.rank.value;
};

// Normaliser les noms de couleur
const normalizeSuit = (suit) => {
  const suitMap = {
    'pique': 'spades',
    'coeur': 'hearts',
    'carreau': 'diamonds',
    'trèfle': 'clubs',
    'spades': 'spades',
    'hearts': 'hearts',
    'diamonds': 'diamonds',
    'clubs': 'clubs'
  };
  return suitMap[suit] || suit;
};

/**
 * Évalue une main de poker
 * @param {Array} holeCards - Les 2 cartes du joueur
 * @param {Array} communityCards - Les cartes communes (0 à 5)
 * @returns {Object} { rank, handRank, handName, cards, score, details }
 */
export const evaluateHand = (holeCards, communityCards = []) => {
  const allCards = [...holeCards, ...communityCards];
  
  if (allCards.length < 2) {
    return {
      rank: 0,
      handRank: HAND_RANKS.HIGH_CARD,
      handName: 'Pas assez de cartes',
      cards: [],
      score: 0,
      details: {}
    };
  }
  
  // Trouver la meilleure main de 5 cartes parmi toutes les combinaisons possibles
  if (allCards.length >= 5) {
    return findBestHand(allCards);
  } else {
    // Moins de 5 cartes : évaluer ce qu'on a (preflop ou pour l'IA)
    return evaluatePartialHand(allCards);
  }
};

/**
 * Trouve la meilleure main de 5 cartes parmi toutes les combinaisons
 */
const findBestHand = (cards) => {
  const combinations = getCombinations(cards, 5);
  let bestHand = null;
  let bestScore = 0;
  
  for (let combo of combinations) {
    const evaluation = evaluate5CardHand(combo);
    if (evaluation.score > bestScore) {
      bestScore = evaluation.score;
      bestHand = evaluation;
    }
  }
  
  return bestHand;
};

/**
 * Génère toutes les combinaisons de k cartes parmi n
 */
const getCombinations = (arr, k) => {
  if (k === 1) return arr.map(x => [x]);
  if (k === arr.length) return [arr];
  
  const combinations = [];
  for (let i = 0; i <= arr.length - k; i++) {
    const head = arr[i];
    const tailCombinations = getCombinations(arr.slice(i + 1), k - 1);
    for (let tail of tailCombinations) {
      combinations.push([head, ...tail]);
    }
  }
  return combinations;
};

/**
 * Évalue une main de 5 cartes exactement
 */
const evaluate5CardHand = (cards) => {
  const values = cards.map(getCardValue).sort((a, b) => b - a);
  const suits = cards.map(c => normalizeSuit(c.suit));
  
  const valueCounts = {};
  values.forEach(v => valueCounts[v] = (valueCounts[v] || 0) + 1);
  
  const counts = Object.values(valueCounts).sort((a, b) => b - a);
  const uniqueValues = Object.keys(valueCounts).map(Number).sort((a, b) => b - a);
  
  const isFlush = suits.every(s => s === suits[0]);
  const isStraight = checkStraight(values);
  const isRoyal = isStraight && values[0] === 14 && values[4] === 10;
  
  let handRank, handName, score;
  const details = {};
  
  // Quinte flush royale
  if (isFlush && isRoyal) {
    handRank = HAND_RANKS.ROYAL_FLUSH;
    handName = HAND_LABELS[handRank];
    score = 10000000;
  }
  // Quinte flush
  else if (isFlush && isStraight) {
    handRank = HAND_RANKS.STRAIGHT_FLUSH;
    handName = HAND_LABELS[handRank];
    score = 9000000 + values[0];
    details.highCard = values[0];
  }
  // Carré
  else if (counts[0] === 4) {
    handRank = HAND_RANKS.FOUR_OF_KIND;
    handName = HAND_LABELS[handRank];
    const quadValue = uniqueValues.find(v => valueCounts[v] === 4);
    const kicker = uniqueValues.find(v => valueCounts[v] === 1);
    score = 8000000 + quadValue * 100 + kicker;
    details.quadValue = quadValue;
    details.kicker = kicker;
  }
  // Full
  else if (counts[0] === 3 && counts[1] === 2) {
    handRank = HAND_RANKS.FULL_HOUSE;
    handName = HAND_LABELS[handRank];
    const threeValue = uniqueValues.find(v => valueCounts[v] === 3);
    const pairValue = uniqueValues.find(v => valueCounts[v] === 2);
    score = 7000000 + threeValue * 100 + pairValue;
    details.threeOfKind = threeValue;
    details.pair = pairValue;
  }
  // Couleur
  else if (isFlush) {
    handRank = HAND_RANKS.FLUSH;
    handName = HAND_LABELS[handRank];
    score = 6000000 + values[0] * 10000 + values[1] * 100 + values[2];
    details.highCards = values;
  }
  // Suite
  else if (isStraight) {
    handRank = HAND_RANKS.STRAIGHT;
    handName = HAND_LABELS[handRank];
    score = 5000000 + values[0];
    details.highCard = values[0];
  }
  // Brelan
  else if (counts[0] === 3) {
    handRank = HAND_RANKS.THREE_OF_KIND;
    handName = HAND_LABELS[handRank];
    const threeValue = uniqueValues.find(v => valueCounts[v] === 3);
    const kickers = uniqueValues.filter(v => valueCounts[v] === 1);
    score = 4000000 + threeValue * 10000 + kickers[0] * 100 + kickers[1];
    details.threeOfKind = threeValue;
    details.kickers = kickers;
  }
  // Double paire
  else if (counts[0] === 2 && counts[1] === 2) {
    handRank = HAND_RANKS.TWO_PAIR;
    handName = HAND_LABELS[handRank];
    const pairs = uniqueValues.filter(v => valueCounts[v] === 2).sort((a, b) => b - a);
    const kicker = uniqueValues.find(v => valueCounts[v] === 1);
    score = 3000000 + pairs[0] * 10000 + pairs[1] * 100 + kicker;
    details.highPair = pairs[0];
    details.lowPair = pairs[1];
    details.kicker = kicker;
  }
  // Paire
  else if (counts[0] === 2) {
    handRank = HAND_RANKS.PAIR;
    handName = HAND_LABELS[handRank];
    const pairValue = uniqueValues.find(v => valueCounts[v] === 2);
    const kickers = uniqueValues.filter(v => valueCounts[v] === 1);
    score = 2000000 + pairValue * 100000 + kickers[0] * 1000 + kickers[1] * 10 + kickers[2];
    details.pair = pairValue;
    details.kickers = kickers;
  }
  // Carte haute
  else {
    handRank = HAND_RANKS.HIGH_CARD;
    handName = HAND_LABELS[handRank];
    score = 1000000 + values[0] * 10000 + values[1] * 100 + values[2];
    details.highCards = values;
  }
  
  return {
    rank: handRank,
    handRank,
    handName,
    cards,
    score,
    details
  };
};

/**
 * Vérifie si les valeurs forment une suite
 */
const checkStraight = (values) => {
  // Suite classique
  for (let i = 0; i < values.length - 1; i++) {
    if (values[i] - values[i + 1] !== 1) {
      // Vérifier la suite A-2-3-4-5 (roue)
      if (values[0] === 14 && values[1] === 5 && values[2] === 4 && values[3] === 3 && values[4] === 2) {
        return true;
      }
      return false;
    }
  }
  return true;
};

/**
 * Évalue une main partielle (2-4 cartes) - utile pour le preflop et l'IA
 */
const evaluatePartialHand = (cards) => {
  const values = cards.map(getCardValue).sort((a, b) => b - a);
  const suits = cards.map(c => normalizeSuit(c.suit));
  
  const valueCounts = {};
  values.forEach(v => valueCounts[v] = (valueCounts[v] || 0) + 1);
  
  const counts = Object.values(valueCounts).sort((a, b) => b - a);
  const uniqueValues = Object.keys(valueCounts).map(Number).sort((a, b) => b - a);
  
  let handRank, handName, score;
  const details = {
    suitedCards: suits.length > 1 && suits[0] === suits[1],
    connectedCards: values.length > 1 && Math.abs(values[0] - values[1]) <= 2,
    highCard: values[0]
  };
  
  // Paire
  if (counts[0] === 2) {
    handRank = HAND_RANKS.PAIR;
    handName = HAND_LABELS[handRank];
    const pairValue = uniqueValues.find(v => valueCounts[v] === 2);
    score = 2000000 + pairValue * 100000;
    details.pair = pairValue;
  }
  // Brelan (si 3+ cartes)
  else if (counts[0] === 3) {
    handRank = HAND_RANKS.THREE_OF_KIND;
    handName = HAND_LABELS[handRank];
    const threeValue = uniqueValues.find(v => valueCounts[v] === 3);
    score = 4000000 + threeValue * 10000;
    details.threeOfKind = threeValue;
  }
  // Carte haute
  else {
    handRank = HAND_RANKS.HIGH_CARD;
    handName = HAND_LABELS[handRank];
    score = 1000000 + values[0] * 10000 + (values[1] || 0) * 100;
    details.highCards = values;
  }
  
  return {
    rank: handRank,
    handRank,
    handName,
    cards,
    score,
    details,
    isPartialHand: true
  };
};

/**
 * Compare deux évaluations de mains
 * @returns {number} 1 si hand1 gagne, -1 si hand2 gagne, 0 si égalité
 */
export const compareHands = (hand1, hand2) => {
  if (hand1.score > hand2.score) return 1;
  if (hand1.score < hand2.score) return -1;
  return 0;
};

/**
 * Calcule la force de la main en pourcentage (pour l'IA)
 * @param {Array} holeCards - Cartes du joueur
 * @param {Array} communityCards - Cartes communes
 * @returns {number} Force de 0 à 100
 */
export const calculateHandStrength = (holeCards, communityCards = []) => {
  if(holeCards==null|holeCards.length < 2) return 0;
  const evaluation = evaluateHand(holeCards, communityCards);
  
  // Preflop (2 cartes seulement)
  if (communityCards.length === 0) {
    return calculatePreflopStrength(holeCards);
  }
  
  // Avec cartes communes, on se base sur le rang de la main
  const strengthMap = {
    [HAND_RANKS.HIGH_CARD]: 10,
    [HAND_RANKS.PAIR]: 30,
    [HAND_RANKS.TWO_PAIR]: 50,
    [HAND_RANKS.THREE_OF_KIND]: 60,
    [HAND_RANKS.STRAIGHT]: 70,
    [HAND_RANKS.FLUSH]: 75,
    [HAND_RANKS.FULL_HOUSE]: 85,
    [HAND_RANKS.FOUR_OF_KIND]: 95,
    [HAND_RANKS.STRAIGHT_FLUSH]: 98,
    [HAND_RANKS.ROYAL_FLUSH]: 100
  };
  
  return strengthMap[evaluation.handRank] || 0;
};

/**
 * Calcule la force d'une main preflop
 */
const calculatePreflopStrength = (holeCards) => {
  const values = holeCards.map(getCardValue).sort((a, b) => b - a);
  const suits = holeCards.map(c => normalizeSuit(c.suit));
  const suited = suits[0] === suits[1];
  const gap = Math.abs(values[0] - values[1]);
  
  let strength = 0;
  
  // Paire
  if (values[0] === values[1]) {
    strength = 50 + values[0] * 3; // AA = 92, KK = 89, etc.
  }
  // Cartes hautes
  else {
    const highCard = values[0];
    const lowCard = values[1];
    
    strength = highCard * 2 + lowCard;
    
    // Bonus si suited
    if (suited) strength += 5;
    
    // Bonus si connectées
    if (gap === 0) strength += 8;
    else if (gap === 1) strength += 5;
    else if (gap === 2) strength += 2;
    
    // Bonus pour A-K, A-Q, A-J
    if (highCard === 14) {
      if (lowCard >= 11) strength += 10;
    }
  }
  
  return Math.min(100, strength);
};

/**
 * Détermine le gagnant parmi plusieurs joueurs
 * @param {Object} playerHands - { playerId: { holeCards, communityCards } }
 * @returns {Array} IDs des gagnants (peut être plusieurs en cas d'égalité)
 */
export const determineWinners = (playerHands, communityCards) => {
  const evaluations = {};
  
  // Évaluer chaque main
  for (let [playerId, hand] of Object.entries(playerHands)) {
    evaluations[playerId] = evaluateHand(hand.holeCards, communityCards);
  }
  
  // Trouver le meilleur score
  const bestScore = Math.max(...Object.values(evaluations).map(e => e.score));
  
  // Retourner tous les joueurs avec le meilleur score
  return Object.keys(evaluations).filter(id => evaluations[id].score === bestScore);
};