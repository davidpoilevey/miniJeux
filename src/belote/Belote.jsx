import React, { useEffect, useRef, useState } from 'react';
import { Box, Paper, Typography, Avatar, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Carte, createDeck, suits } from '../poker/Card';
import { BeloteBar } from './BeloteBar';
import { BiddingDialog } from './BiddingDialog';
import { GameBoard, NORMAL_ORDER, TRUMP_ORDER } from './GameBoard';
import { calculateBelotePoints, getPlayableCards, getWinningCard, isPartner, resolvePli } from './beloteUtils';
import { BeloteSnack, EndRoundDialog } from './EndRoundDialog';
import { GameOver } from '../ChuckNorrisFact';






// Composant principal
const BeloteGame = () => {
    const [gamePhase, setGamePhase] = useState('distribution'); // Phase de départ
    const [deck, setDeck] = useState([]);
     const [isGameOver, gameOver] = useState(false);
    const [atout, setAtout] = useState(null);
    const couleurDemandee = useRef();
    const [taker, setTaker] = useState();
    const [currentRound, setCurrentRound] = useState(0);
    const currentTrick = useRef({ top: null, left: null, right: null, bottom: null });
    const [currentPlayer, setCurrentPlayer] = useState('bottom'); // Qui doit jouer
    const [currentDealer, setCurrentDealer] = useState('bottom'); // Qui doit distribuer et choisir l'atout en 1er
    const [proposedCard, setProposedCard] = useState();
    const [trickWinner, setTrickWinner] = useState(null); // 'top' | 'left' | 'right' | 'bottom'
    const [isCollectingTrick, setIsCollectingTrick] = useState(false);
const [showTakeAlert, setShowTakeAlert] = useState(false);

    const [roundSummary, setRoundSummary] = useState(null);

    // Mains des joueurs
    const [playerHands, setPlayerHands] = useState({
        bottom: [], // Joueur humain
        left: [],
        top: [],
        right: []
    });

    const [remainingCards, setRemainingCards] = useState();
    // Scores
    const [teams, setTeams] = useState({
        team1: { name: 'Votre Équipe', score: 0, plisDuRound: [], players: ['bottom', 'top'] }, // Vous et le joueur d'en face
        team2: { name: 'Équipe adverse', score: 0, plisDuRound: [], players: ['left', 'right'] }
    });


    // Initialisation et distribution
const reset=()=>{
    gameOver(false)
    setGamePhase('distribution');
    setTeams({
        team1: { name: 'Votre Équipe', score: 0, plisDuRound: [], players: ['bottom', 'top'] }, // Vous et le joueur d'en face
        team2: { name: 'Équipe adverse', score: 0, plisDuRound: [], players: ['left', 'right'] }
    })
}

    const distributeCards = () => {
        const newDeck = createDeck({ carte32: true });
        const hands = { bottom: [], left: [], top: [], right: [] };
        const playerOrder = ['bottom', 'left', 'top', 'right'];

        // Distribution classique : 3+2+3 cartes par joueur
        let cardIndex = 0;

        // Premier tour : 3 cartes chacun
        for (let player of playerOrder) {
            hands[player] = newDeck.slice(cardIndex, cardIndex + 3);
            cardIndex += 3;
        }

        // Deuxième tour : 2 cartes chacun
        for (let player of playerOrder) {
            hands[player] = [...hands[player], ...newDeck.slice(cardIndex, cardIndex + 2)];
            cardIndex += 2;
        }


        const proposedCard = newDeck[cardIndex];
        cardIndex++;

        setPlayerHands(hands);
        setDeck(newDeck);
        setProposedCard(proposedCard); // Nouvelle state à ajouter
        setRemainingCards(newDeck.slice(cardIndex)); // Les cartes restantes pour la distribution finale

        // Passer à la phase d'enchères
        setTimeout(() => {
            setGamePhase('bidding');
        }, 1500);
    };


    const finishDistribution = (takerPlayer, atoutColor) => {
        if (atoutColor == null) {
            setGamePhase('distribution');
            return;
        }
        const hands = { ...playerHands };
        const playerOrder = ['bottom', 'left', 'top', 'right'];
        let cardIndex = 0;

        // Le preneur prend la carte retournée + 2 autres

        hands[takerPlayer] = [...hands[takerPlayer], proposedCard, ...remainingCards.slice(0, 2)];
        cardIndex = 2;


        // Les autres joueurs reçoivent 3 cartes chacun
        for (let player of playerOrder) {
            if (player !== takerPlayer) {
                hands[player] = [...hands[player], ...remainingCards.slice(cardIndex, cardIndex + 3)];
                cardIndex += 3;
            }
        }
        setTaker(takerPlayer);
        setAtout(atoutColor);
        setPlayerHands(hands);
        setGamePhase('playing');
        setCurrentPlayer(currentDealer); // Le dealer commence
        setCurrentRound(1);
    };


    const handleCardClick = (card) => {
        if (gamePhase !== 'playing' || currentPlayer !== 'bottom') {
            return; // Pas le tour du joueur ou mauvaise phase
        }

        playCard('bottom', card);
    };

    const playCard = (player, card) => {
        // Retirer la carte de la main du joueur
        setPlayerHands(prev => ({
            ...prev,
            [player]: prev[player].filter(c => c !== card)
        }));

        // Ajouter la carte au pli en cours
        currentTrick.current[player] = card;
        if (couleurDemandee.current == null)
            couleurDemandee.current = card.suit;

        // Passer au joueur suivant
        const nextPlayer = getNextPlayer(player);
        setCurrentPlayer(nextPlayer);

        // Si les 4 ont joué, résoudre le pli
        if (Object.values({ ...currentTrick.current, [player]: card }).every(c => c !== null)) {
            setTimeout(() => resolveTrick(), 1000);
        } else if (nextPlayer !== 'bottom') {
            // IA joue automatiquement
            setTimeout(() => aiPlay(nextPlayer), 800);
        }
    };

    const getNextPlayer = (current) => {
        const order = ['bottom', 'left', 'top', 'right'];
        const index = order.indexOf(current);
        return order[(index + 1) % 4];
    };

 const aiPlay = (player) => {
  const hand = playerHands[player];
  if (hand.length === 0) return;

  const playable = getPlayableCards(hand, couleurDemandee, atout);

  const winning = getWinningCard(
    currentTrick.current,
    atout,
    couleurDemandee
  );

  let cardToPlay;

  // 1️⃣ Si personne n'est encore maître → jouer petit
  if (!winning) {
    cardToPlay = playable[playable.length - 1];
  }
  // 2️⃣ Partenaire maître → jeter le plus petit possible
  else if (isPartner(player, winning.player)) {
    cardToPlay = playable[playable.length - 1];
  }
  // 3️⃣ Adversaire maître → essayer de battre intelligemment
  else {
    const order =
      playable[0].suit === atout ? TRUMP_ORDER : NORMAL_ORDER;

    const betterCards = playable.filter(card => {
      const idx = order.indexOf(card.rank.name);
      return idx < winning.power;
    });

    // battre avec la plus petite carte gagnante
    cardToPlay = betterCards.length > 0
      ? betterCards[betterCards.length - 1]
      : playable[playable.length - 1];
  }

  playCard(player, cardToPlay);
};


    const resolveTrick = () => {
        const winner = resolvePli(currentTrick.current, atout, couleurDemandee.current);

        // Sauvegarde du pli (copie pour éviter les mutations)
        const completedTrick = { ...currentTrick.current };

        setTrickWinner(winner);
        setIsCollectingTrick(true);

        setTeams(prevTeams => {
            // Déterminer l'équipe gagnante
            const winningTeamKey = prevTeams.team1.players.includes(winner)
                ? 'team1'
                : 'team2';

            return {
                ...prevTeams,
                [winningTeamKey]: {
                    ...prevTeams[winningTeamKey],
                    plisDuRound: [
                        ...prevTeams[winningTeamKey].plisDuRound,
                        ...Object.values(completedTrick)
                    ]
                }
            };
        });
        setTimeout(() => {
            setIsCollectingTrick(false);
            setTrickWinner(null);

            currentTrick.current = {
                top: null,
                left: null,
                right: null,
                bottom: null
            };

            setCurrentRound(prev => prev + 1);
            couleurDemandee.current = null;
            setCurrentPlayer(winner);
            if (currentRound > 7) {
                setGamePhase('endRound');

                setTeams(prevTeams => {
                    // Déterminer l'équipe gagnante
                    const winningTeamKey = prevTeams.team1.players.includes(winner)
                        ? 'team1'
                        : 'team2';

                    return {
                        ...prevTeams,
                        [winningTeamKey]: {
                            ...prevTeams[winningTeamKey],
                            score: prevTeams[winningTeamKey].score + 10, // DIX DE DER
                        }
                    };
                });
            }
            if(winner!='bottom')
            aiPlay(winner);

        }, 800);
    };
    const nextRound = () => {
        setGamePhase('distribution');
        setRoundSummary(null);
    }
    useEffect(() => {
  if (taker) {
    setShowTakeAlert(true);
  }
}, [taker]);

    useEffect(() => {

        if (gamePhase === 'distribution') {
            distributeCards();
        }
        if (gamePhase === 'endRound') {

            const takerTeamKey = teams.team1.players.includes(taker)
                ? 'team1'
                : 'team2';
            let pointsTeam1 = calculateBelotePoints(
                teams.team1.plisDuRound,
                atout
            );

            let pointsTeam2 = calculateBelotePoints(
                teams.team2.plisDuRound,
                atout
            );
            let status1 = null, status2 = null;
            if (takerTeamKey == 'team1') {
                status1 = 'winner';
                status2 = 'loser';
                if (pointsTeam1 < 81) {
                    pointsTeam1 = 0;
                    pointsTeam2 = 162;
                    status1 = 'renverse';
                    status2 = 'winner';
                }
            }
            if (takerTeamKey == 'team2') {
                status2 = 'winner';
                status1 = 'loser';
                if (pointsTeam2 < 81) {
                    pointsTeam2 = 0;
                    pointsTeam1 = 162;
                    status2 = 'renverse';
                    status1 = 'winner';
                }
            }
            setRoundSummary({
                team1: {
                    roundPoints: pointsTeam1,
                    totalScore: teams.team1.score+pointsTeam1,
                    status: status1 // 'winner' | 'loser' | 'renverse'
                },
                team2: {
                    roundPoints: pointsTeam2,
                    totalScore: teams.team2.score+pointsTeam2,
                    status: status2
                },
                takerTeam: takerTeamKey
            });

            setTeams(prevTeams => {
                return {
                    team1: { ...prevTeams.team1, plisDuRound:[], score: prevTeams.team1.score + pointsTeam1 },
                    team2: { ...prevTeams.team2, plisDuRound:[], score: prevTeams.team1.score + pointsTeam2 }
                }

            });
            if(teams.team1.score + pointsTeam1>1000||teams.team1.score + pointsTeam1>1000)
                gameOver(true)
            setTaker(null);
            setCurrentDealer(getNextPlayer());

        }
    }, [gamePhase])



    return (
        <GameContainer variant="belote">
               <GameOver open={isGameOver} score={teams.team1.score} 
                    gameName="Belote"
                        handleClose={reset } handleRestart={reset} />
            {/* Barre du haut */}
            <BeloteBar teams={teams} gamePhase={gamePhase}
                taker={taker} currentPlayer={currentPlayer} currentDealer={currentDealer}
                currentRound={currentRound} atout={atout} couleurDemandee={couleurDemandee.current} />
            <BiddingDialog
                open={gamePhase === 'bidding'} currentDealer={currentDealer}
                getNextPlayer={getNextPlayer} proposedCard={proposedCard}
                finishDistribution={finishDistribution}
            />
            <EndRoundDialog open={gamePhase === 'endRound'} teams={teams} roundSummary={roundSummary} nextRound={nextRound} />
            {/* Plateau de jeu */}
            <GameBoard atout={atout} couleurDemandee={couleurDemandee.current}
             trickWinner={trickWinner} isCollectingTrick={isCollectingTrick} currentDealer={currentDealer}
                playerHands={playerHands} currentTrick={currentTrick.current}
                handleCardClick={handleCardClick} />
                <BeloteSnack showTakeAlert={showTakeAlert} setShowTakeAlert={setShowTakeAlert}
                 taker={taker} atout={atout}/>
        </GameContainer>
    );
};

export default BeloteGame;



// Styled components
const GAME_VARIANTS = {
  belote: {
    title: 'Belote',
    gradient: {
      inner: '#998957',
      mid: '#6f6136',
      outer: '#3b3724'
    }
  },
  poker: {
    title: 'Poker',
    gradient: {
      inner: '#8b1e1e',
      mid: '#4a0f0f',
      outer: '#1f0707'
    }
  },
  scopa: {
    title: 'Scopa',
    gradient: {
      inner: '#2f7d32',
      mid: '#1b5e20',
      outer: '#0d2e10'
    }
  },
  trouduc: {
    title: 'Trou du cul',
    gradient: {
      inner: '#3f51b5',
      mid: '#283593',
      outer: '#141b4d'
    }
  }
};
const GameTitle = styled('div')({
  position: 'absolute',
  top: 12,
  left: 16,
  fontSize: 18,
  fontWeight: 600,
  color: 'rgba(255,255,255,0.85)',
  textShadow: '0 2px 6px rgba(0,0,0,0.5)',
  pointerEvents: 'none'
});

const GameContainerRoot = styled(Box)(({ theme, $variant }) => {
  const v = GAME_VARIANTS[$variant] ?? GAME_VARIANTS.belote;

  return {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    background: `radial-gradient(
      circle at center,
      ${v.gradient.inner} 0%,
      ${v.gradient.mid} 60%,
      ${v.gradient.outer} 100%
    )`
  };
});
export function GameContainer({ variant = 'belote', children }) {
  const v = GAME_VARIANTS[variant] ?? GAME_VARIANTS.belote;

  return (
    <GameContainerRoot $variant={variant}>
      <GameTitle>{v.title}</GameTitle>
      {children}
    </GameContainerRoot>
  );
}
