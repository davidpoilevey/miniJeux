import { useEffect, useMemo, useRef, useState } from 'react';
import { createDeck, shuffle } from '../poker/Card';
import { Box, styled } from '@mui/material';
import { TrouducBoard, TrouducDialog, TrouducEndRoundDialog, TrouducFeedbackDialog } from './TrouducBoard';
import { applyHierarchyExchange, distributeCards, getCardPower, groupByRank, sortHandDesc } from './trouducUtils';
import { playersByPosition } from '../belote/beloteUtils';
import { GameContainer } from '../belote/Belote';

const PLAYERS = ['bottom', 'left', 'top', 'right'];

const NEXT_PLAYER = {
    bottom: 'left',
    left: 'top',
    top: 'right',
    right: 'bottom'
};


const initialTrouducState = {
    currentPlayer: 'bottom',
    hierarchy: { president: null, vicePresident: null, viceTrouduc: null, trouduc: null },
    gamePhase: 'intro',
    lastPlay: null, //  { player, rankValue, count }
    passes: new Set(),
    finishedPlayers: [],
    exchange: {
        pending: false,
        toGive: [],     // cartes que le président rend
        received: []    // cartes reçues du trouduc
    },
    round: 1,
    direction: ['bottom', 'left', 'top', 'right']
};

export default function GameBoardTrouduc() {
    // 🃏 deck & hands

    const [trouducState, setTrouducState] = useState({ ...initialTrouducState });
    const [playersCount, setPlayersCount] = useState(4);
    const [playerHands, setPlayerHands] = useState({
        bottom: [],
        left: [],
        top: [],
        right: []
    });

    // 🧺 table
    const [tableCards, setTableCards] = useState([]);
    const [passes, setPasses] = useState([]);


    const startDistribution = () => {
        const players = Object.keys(playerHands); // bottom, left, top, right...
        const deck = createDeck();
        const dealtHands = distributeCards(deck, players);
       

        setPlayerHands(dealtHands);
startHierarchyExchange(dealtHands)
    };

    const getActivePlayers = (playerHands, finishedPlayers) =>
  Object.keys(playerHands).filter(
    p => !finishedPlayers.includes(p)
  );

    const handlePass = (player) => {
        if (trouducState.currentPlayer !== player) return;

        setTrouducState(prev => {
            const newPasses = new Set(prev.passes);
            newPasses.add(player);

            const activePlayers = getActivePlayers(playerHands, prev.finishedPlayers);

const everyoneElsePassed =
  prev.lastPlay &&
  activePlayers
    .filter(p => p !== prev.lastPlay.player)
    .every(p => newPasses.has(p));


            if (everyoneElsePassed) {
                if (prev.lastPlay.player != 'bottom')
                    setTimeout(() => {
                        aiPlay(player);
                    }, 700);
                return {
                    ...prev,
                    passes: new Set(),
                    lastPlay: null,
                    currentPlayer: prev.lastPlay.player // ✅ LE FIX EST LÀ
                };
            }

            return {
                ...prev,
                passes: newPasses,
                currentPlayer: getNextActivePlayer(player)
            };
        });
    };
    const getNextActivePlayer = (current) => {
        const players = Object.keys(playerHands);
        const finished = trouducState.finishedPlayers;

        let idx = players.indexOf(current);

        do {
            idx = (idx + 1) % players.length;
        } while (finished.includes(players[idx]));

        return players[idx];
    };

const startHierarchyExchange = (dealtHands) => {
    const { hands, pending, lastTrouducExchange, lastViceTrouducExchange } = applyHierarchyExchange({
  hands: dealtHands,
  hierarchy: trouducState.hierarchy,
  playersCount
});

setPlayerHands(hands);

if (pending.president) {
  setTrouducState(s => ({
    ...s,
    gamePhase: 'exchange',
    exchange: {
      role: 'president',
      received: pending.president,
      toGive: []
    }
  }));
} else if (pending.vicePresident) {
  setTrouducState(s => ({
    ...s,
    gamePhase: 'exchange',
    exchange: {
      role: 'vicePresident',
      received: pending.vicePresident,
      toGive: []
    }
  }));
} else {
  endExchange({lastTrouducExchange, lastViceTrouducExchange});
}

};

    const validatePresidentExchange = (cardsToGive) => {
  const {
    president,
    vicePresident,
    viceTrouduc,
    trouduc
  } = trouducState.hierarchy;

  const role = trouducState.exchange.role;

  setPlayerHands(prev => {
    const next = structuredClone(prev);

    if (role === 'president') {
      // Président → Trouduc (2 cartes)
      next[president] =
        next[president].filter(
          c => !cardsToGive.find(
            g => g.rank.name === c.rank.name && g.suit === c.suit
          )
        );

      next[trouduc].push(...cardsToGive);
    }

    if (role === 'vicePresident') {
      // Vice-président → Vice-trouduc (1 carte)
      next[vicePresident] =
        next[vicePresident].filter(
          c => !cardsToGive.find(
            g => g.rank.name === c.rank.name && g.suit === c.suit
          )
        );

      next[viceTrouduc].push(...cardsToGive);
    }

    return next;
  });

  setTrouducState(s => ({
    ...s,
    exchange: { pending: false, toGive: [], received: [], role: null },
    currentPlayer: president||'bottom', // le président commence TOUJOURS
    gamePhase: 'playing'
  }));
};


    const endExchange = ({lastTrouducExchange, lastViceTrouducExchange}) => {
        setTrouducState(s => ({
            ...s,
            lastTrouducExchange,
            lastViceTrouducExchange,
            gamePhase: 'playing',
            currentPlayer: s.hierarchy.president||'bottom'
        }));
    };
    const handleCardClick = (card, player = 'bottom') => {
        if (trouducState.currentPlayer !== player) return;

        const hand = playerHands[player];

        // toutes les cartes de même valeur
        const sameRankCards = hand.filter(
            c => c.rank.value === card.rank.value
        );

        const count = sameRankCards.length;
        const value = getCardPower(card);

        // Validation minimale
        if (trouducState.lastPlay) {
            if (count !== trouducState.lastPlay.count) return;
            if (value <= trouducState.lastPlay.rankValue) return;
        }

        // Retirer les cartes de la main
        const newHand = hand.filter(
            c => getCardPower(c) !== value
        );

        setPlayerHands(prev => ({
            ...prev,
            [player]: newHand
        }));

        // 🔥 FINI ?
        if (newHand.length === 0) {
            onPlayerFinished(player);
        }

        // Mettre sur la pile
        setTableCards(sameRankCards);


        setPasses([]);

        // Joueur suivant
        setTrouducState(s => ({
            ...s,
            lastPlay: {
                player,
                rankValue: value,
                count
            },
            currentPlayer: getNextActivePlayer(player)
        }));
    };
    const onPlayerFinished = (player) => {
        setTrouducState(s => ({
            ...s,
            finishedPlayers: [...s.finishedPlayers, player]
        }));
    };
    const aiPlay = (player) => {
        const hand = playerHands[player];
        if (!hand || hand.length === 0) {
            handlePass(player);
            return;
        }

        const grouped = groupByRank(hand);

        const playable = Object.entries(grouped)
            .map(([value, cards]) => ({
                value: Number(value),
                cards
            }))
            .filter(play => {
                if (!trouducState.lastPlay) return true;
                return (
                    play.cards.length === trouducState.lastPlay.count &&
                    play.value > trouducState.lastPlay.rankValue
                );
            })
            .sort((a, b) => a.value - b.value);

        if (playable.length === 0) {
            handlePass(player);
            return;
        }

        const choice = playable[0];

        // jouer
        handleCardClick(choice.cards[0], player);
    };

    // sureveillance endRound
    useEffect(() => {
        if (
            trouducState.gamePhase === 'playing' &&
            trouducState.finishedPlayers.length === PLAYERS.length - 1
        ) {
           endRound();
        }
    }, [trouducState.finishedPlayers]);
  const computeHierarchy = (finishedPlayers, allPlayers=PLAYERS) => {
  const lastPlayer = allPlayers.find(
    p => !finishedPlayers.includes(p)
  );

  const order = [...finishedPlayers, lastPlayer];

  return {
    president: order[0] || null,
    vicePresident: order[1] || null,
    viceTrouduc: order[2] || null,
    trouduc: order[3] || null
  };
};
const endRound = () => {
  const allPlayers = Object.keys(playerHands);

  const hierarchy = computeHierarchy(
    trouducState.finishedPlayers,
    allPlayers
  );

  setTrouducState(prev => ({
    ...prev,
    hierarchy,
    gamePhase: 'endRound'
  }));
};
const onSelect = (card) => {
  setTrouducState(prev => {
    const { toGive, received } = prev.exchange;

    // déjà sélectionnée → on enlève
    if (toGive.includes(card)) {
      return {
        ...prev,
        exchange: {
          ...prev.exchange,
          toGive: toGive.filter(c => c !== card)
        }
      };
    }

    // pas encore sélectionnée mais quota atteint → on ignore
    if (toGive.length >= received.length) {
      return prev;
    }

    // ajout
    return {
      ...prev,
      exchange: {
        ...prev.exchange,
        toGive: [...toGive, card]
      }
    };
  });
};
const onConfirm = () => {
  const { toGive, received } = trouducState.exchange;

  // sécurité
  if (toGive.length !== received.length) return;

  validatePresidentExchange(toGive);
};


    const nextRound = () => {
        setTrouducState(s => ({
            ...s,
            hierarchy: computeHierarchy(s.finishedPlayers),
            finishedPlayers: [],
            lastPlay: null,
            passes: new Set(),
            round: s.round + 1,
            gamePhase: 'distribution'
        }));
        setTableCards([]);
    };
    const initPlayers = cnt => setPlayersCount(cnt);
    // changement de joueur
    useEffect(() => {
        const player = trouducState.currentPlayer;
        if (!player) return;

        if (player !== 'bottom') {
            const timer = setTimeout(() => {
                aiPlay(player);
            }, 700);

            return () => clearTimeout(timer);
        }
    }, [trouducState.currentPlayer]);

    // suveillance gamePhase
    useEffect(() => {
        if (trouducState.gamePhase === 'distribution') {
            startDistribution();
        }
    }, [trouducState.gamePhase]);

const trouducExchange=useMemo(()=>{
    if(trouducState.hierarchy.trouduc==='bottom')
        return trouducState.lastTrouducExchange;
    if(trouducState.hierarchy.viceTrouduc==='bottom')
        return trouducState.lastViceTrouducExchange;
    return null;
},[trouducState.lastTrouducExchange, trouducState.lastViceTrouducExchange]);

    /* ===================== FIN DE MANCHE ===================== */


    return <GameContainer variant='trouduc'>

<TrouducEndRoundDialog
  open={trouducState.gamePhase === 'endRound'}
  hierarchy={trouducState.hierarchy}
  playersByPosition={playersByPosition}
  onNextRound={() => {
    nextRound(); // mains, passes, finishedPlayers, tableCards…
  }}
/>
{(trouducExchange) && (
  <TrouducFeedbackDialog
    exchange={trouducExchange}
    onClose={() =>
      setTrouducState(s => ({
        ...s,
        lastTrouducExchange: null,
        lastViceTrouducExchange: null
      }))
    }
  />
)}

{trouducState.gamePhase==='exchange'&&<TrouducDialog exchangeData={trouducState.exchange}
    onSelect={onSelect} hand={playerHands.bottom}
     onConfirm={onConfirm}/>}

        <TrouducBoard trouducState={trouducState}
            setPlayersCount={setPlayersCount} playersCount={playersCount}
            setTrouducState={setTrouducState} initPlayers={initPlayers}
            handleCardClick={handleCardClick} handlePass={handlePass}
            playerHands={playerHands} tableCards={tableCards} />;
    </GameContainer>
}
