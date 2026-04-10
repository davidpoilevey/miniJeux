import { NORMAL_ORDER, TRUMP_ORDER } from "./GameBoard";


import imgVous from '../poker/avatars/imgVous.png';
import imgJohn from '../poker/avatars/imgJohn.png';
import imgNatacha from '../poker/avatars/imgNatacha.png';
import imgKevin from '../poker/avatars/imgKevin.png';
const joueursNames = [
  { 
    name: "Vous", 
    isHuman: true, 
    avatar: imgVous,
    position: "bottom"
  },
  { 
    name: "John", 
    avatar: imgJohn,
    position: "left",
    profile: {
      tight: 0.8,        // Joueur serré (0 = loose, 1 = tight)
      aggressive: 0.7,   // Agressivité (raise plutôt que call)
      bluff: 0.25,        // Tendance au bluff
      flambeur: 0.3,     // Multiplicateur de mise (1 = normal, 2 = double)
      fold_threshold: 15 // Force de main minimum pour rester (0-100)
    }
  },
  { 
    name: "Natacha", 
    avatar: imgNatacha,
    position: "top",
    profile: {
      tight: 0.5,        // Joueur équilibré
      aggressive: 0.2,   // Plutôt passif (call plus que raise)
      bluff: 0.1,        // Bluffe peu
      flambeur: 0.8,     // Mise petit
      fold_threshold: 25 // Ne joue que des bonnes mains
    }
  },
  { 
    name: "Kevin", 
    avatar: imgKevin,
    position: "right",
    profile: {
      tight: 0.3,        // Joueuse loose (joue beaucoup de mains)
      aggressive: 0.9,   // Très agressive (relance souvent)
      bluff: 0.6,        // Bluffe régulièrement
      flambeur: 1.5,     // Mise gros quand elle raise
      fold_threshold: 10 // Joue des mains faibles
    }
  }
];

export const playersByPosition = joueursNames.reduce((acc, player) => {
  acc[player.position] = player;
  return acc;
}, {});


export function resolvePli(pli, atout, couleurDemandee) {
    // Ordres de puissance

    const players = Object.keys(pli);

    // Enrichit chaque carte avec sa puissance réelle
    const cards = players.map(player => {
        const card = pli[player];
        const isTrump = card.suit === atout;
        const order = isTrump ? TRUMP_ORDER : NORMAL_ORDER;

        return {
            player,
            card,
            isTrump,
            isDemandedSuit: card.suit === couleurDemandee,
            power: order.indexOf(card.rank.name)
        };
    });

    // 1️⃣ Y a-t-il au moins un atout ?
    const trumpsPlayed = cards.filter(c => c.isTrump);
    if (trumpsPlayed.length > 0) {
        trumpsPlayed.sort((a, b) => a.power - b.power);
        return trumpsPlayed[0].player;
    }

    // 2️⃣ Sinon, on regarde la couleur demandée
    const demandedSuitCards = cards.filter(c => c.isDemandedSuit);
    demandedSuitCards.sort((a, b) => a.power - b.power);

    return demandedSuitCards[0].player;
}
export function calculateBelotePoints(cards, atout) {
    const TRUMP_POINTS = {
        V: 20,
        9: 14,
        A: 11,
        10: 10,
        R: 4,
        D: 3
    };

    const NORMAL_POINTS = {
        A: 11,
        10: 10,
        R: 4,
        D: 3,
        V: 2
    };

    return cards.reduce((total, card) => {
        const isTrump = card.suit === atout;
        const rankName = card.rank.name;

        const points = isTrump
            ? TRUMP_POINTS[rankName] || 0
            : NORMAL_POINTS[rankName] || 0;

        return total + points;
    }, 0);
}
export function getPlayableCards(hand, couleurDemandee, atout) {
  if (!couleurDemandee) {
    return hand;
  }

  const sameSuit = hand.filter(card => card.suit === couleurDemandee);
  if (sameSuit.length > 0) {
    return sameSuit;
  }

  const trumps = hand.filter(card => card.suit === atout);
  if (trumps.length > 0) {
    return trumps;
  }

  return hand;
}


export function getWinningCard(trick, atout, couleurDemandee) {
  const entries = Object.entries(trick).filter(([, c]) => c);

  if (entries.length === 0) return null;

  const scored = entries.map(([player, card]) => {
    const isTrump = card.suit === atout;
    const order = isTrump ? TRUMP_ORDER : NORMAL_ORDER;

    return {
      player,
      card,
      isTrump,
      power: order.indexOf(card.rank.name)
    };
  });

  const trumps = scored.filter(c => c.isTrump);
  if (trumps.length > 0) {
    trumps.sort((a, b) => a.power - b.power);
    return trumps[0];
  }

  const demanded = scored.filter(c => c.card.suit === couleurDemandee);
  demanded.sort((a, b) => a.power - b.power);
  return demanded[0];
}
export function isPartner(player, other) {
  return (
    (player === 'top' && other === 'bottom') ||
    (player === 'bottom' && other === 'top') ||
    (player === 'left' && other === 'right') ||
    (player === 'right' && other === 'left')
  );
}
