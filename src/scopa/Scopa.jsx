import { useEffect, useRef, useState } from 'react';
import { createDeck, shuffle } from '../poker/Card';
import { ScopaBoard } from './ScopaBoard';
import { findCaptures } from './scopaUtils';
import { ScopaDashboard } from './ScopaDash';
import { Box, styled } from '@mui/material';
import { ScopaRoundSummary } from './ScopaFlying';
import scopaSound from './scopa.m4a';
import scopaKevinSound from './scopaKevin.m4a';
import scopaNatSound from './scopaNat.m4a';
import scopaJohnSound from './scopaJohn.m4a';
import { soundManager } from '../rpg/sons/SoundManager';
import { GameContainer } from '../belote/Belote';

const PLAYERS = ['bottom', 'left', 'top', 'right'];

const DEFAULT_TEAMS = {
    team1: { name: "Moi et mon pote", captures: [], scopa: 0, score: 0 },
    team2: { name: "Les autres cons", captures: [], scopa: 0, score: 0 }
};
const NEXT_PLAYER = {
    bottom: 'left',
    left: 'top',
    top: 'right',
    right: 'bottom'
};

const TEAMS = {
    team1: ['bottom', 'top'],
    team2: ['left', 'right']
};
function getTeamOfPlayer(player) {
    return TEAMS.team1.includes(player) ? 'team1' : 'team2';
}


export default function GameBoardScopa() {
    // 🃏 deck & hands
    const [deck, setDeck] = useState([]);
    const [animation, setAnimation] = useState(null);
    const [playerHands, setPlayerHands] = useState({
        bottom: [],
        left: [],
        top: [],
        right: []
    });
    const [pendingCapture, setPendingCapture] = useState(null);
    const [showSummary, setShowSummary] = useState(false);
    const [roundPoints, setRoundPoints] = useState({
        team1: 0,
        team2: 0
    });
    const [round, setRound] = useState(0);
    const [endRound, setEndRound] = useState(false);

    // 🧺 table
    const [tableCards, setTableCards] = useState([]);
    const [lastCapture, setLastCapture] = useState();
    // 🧮 captures par équipe
    const [teams, setTeams] = useState({ ...DEFAULT_TEAMS });

    // 🔁 tour
    const [currentPlayer, setCurrentPlayer] = useState('bottom');
    const [currentDealer, setCurrentDealer] = useState('bottom');

    /* ===================== INIT ===================== */
    useEffect(() => {
        startNewRound();
        soundManager.loadSounds({
            scopa: scopaSound, scopaJohn: scopaJohnSound
            , scopaNat: scopaNatSound, scopaKevin: scopaKevinSound
        })
    }, []);
    // changement de joueur
    useEffect(() => {
        if (currentPlayer !== 'bottom') {
            const timer = setTimeout(() => {
                aiPlay(currentPlayer);
            }, 600);

            return () => clearTimeout(timer);
        }
    }, [currentPlayer]);

    const aiPlay = (player) => {
        const hand = playerHands[player];
        if (!hand || hand.length === 0) return;

        // chercher une carte qui capture
        let cardToPlay = null;

        for (let card of hand) {
            const captures = findCaptures(card, tableCards);
            if (captures.length > 0) {

                cardToPlay = card;
                break;
            }
        }

        // sinon jouer une carte au hasard (ou la plus petite)
        if (!cardToPlay) {
            cardToPlay = hand[Math.floor(Math.random() * hand.length)];
        }

        playCard(player, cardToPlay);
    };


    const startNewRound = () => {
        const newDeck = shuffle(createDeck({ scopa: true }));
        setDeck(newDeck);
        setRound(r => r + 1);
        setEndRound(false);
        setPlayerHands({
            bottom: newDeck.slice(0, 3),
            left: newDeck.slice(3, 6),
            top: newDeck.slice(6, 9),
            right: newDeck.slice(9, 12)
        });

        setTableCards(newDeck.slice(12, 16)); // 4 cartes sur la table
        setDeck(newDeck.slice(16));


        const keepScore1 = teams.team1.score;
        const keepScore2 = teams.team2.score;
        setTeams({
            team1: { ...DEFAULT_TEAMS.team1, score: keepScore1 }
            , team2: { ...DEFAULT_TEAMS.team2, score: keepScore2 }
        });

    };

    /* ===================== JEU ===================== */

    const playCard = (player, card) => {
        // retirer de la main
        setPlayerHands(prev => ({
            ...prev,
            [player]: prev[player].filter(c => c !== card)
        }));

        // chercher captures possibles
        const captures = findCaptures(card, tableCards);

        if (captures.length === 0) {
            setTableCards(prev => [...prev, card]);
            nextTurn(player);
            return;
        }

        if (captures.length === 1 || player !== 'bottom') {
            let cardToPlay = captures[0];
            if (player !== 'bottom')// take best 
                cardToPlay = captures.sort((a, b) => b.length - a.length)[0];


            setAnimation({
                phase: 'play',
                player,
                playedCard: card,
                takenCards: cardToPlay
            });
            //remplace par animation.  applyCapture(player, card, cardToPlay);
            return;
        }
        setPendingCapture({
            player,
            playedCard: card,
            options: captures
        });
    };

    const getScopaSound = (player) => {
        switch (player) {
            case 'left':
                return 'scopaJohn';
            case 'top':
                return 'scopaNat';
            case 'right':
                return 'scopaKevin';
            case 'bottom':
            default:
                return 'scopa';
        }
    };

    const applyCapture = (player, playedCard, takenCards) => {
        setTableCards(prev =>
            prev.filter(c => !takenCards.includes(c))
        );

        const teamKey = getTeamOfPlayer(player);
        const isScopa = tableCards.length === takenCards.length;
        if (isScopa)
            soundManager.play(getScopaSound(player));
        setTeams(prev => ({
            ...prev,
            [teamKey]: {
                ...prev[teamKey],
                captures: [
                    ...prev[teamKey].captures,
                    playedCard,
                    ...takenCards
                ],
                scopa: prev[teamKey].scopa + (isScopa ? 1 : 0)
            }
        }));

        setLastCapture({
            team: teamKey,
            cards: [playedCard, ...takenCards],
            scopa: isScopa
        });

        setPendingCapture(null);
        nextTurn(player);
    };

    const nextTurn = (player) => {
        const next = NEXT_PLAYER[player];
        setCurrentPlayer(next);

        setPlayerHands(prev => {
            const everyoneEmpty = PLAYERS.every(p => prev[p].length === 0);
            if (everyoneEmpty && deck.length > 0) {
                dealNextHands();
            }
            if (everyoneEmpty && deck.length === 0) {
                setEndRound(true);
            }
            return prev;
        });

    };

    const dealNextHands = () => {
        setPlayerHands({
            bottom: deck.slice(0, 3),
            left: deck.slice(3, 6),
            top: deck.slice(6, 9),
            right: deck.slice(9, 12)
        });
        setDeck(deck.slice(12));
    };
    const getNextPlayer = (current) => {
        const order = ['bottom', 'left', 'top', 'right'];
        const index = order.indexOf(current);
        return order[(index + 1) % 4];
    };
    /* ===================== FIN DE MANCHE ===================== */
    useEffect(() => {
        if (endRound) {

            let team1Score = teams.team1.scopa;
            let team2Score = teams.team2.scopa;

            const lastTeam = lastCapture.team;

            const t1 = lastTeam === 'team1'
                ? [...teams.team1.captures, ...tableCards]
                : teams.team1.captures;

            const t2 = lastTeam === 'team2'
                ? [...teams.team2.captures, ...tableCards]
                : teams.team2.captures;




            /* 1️⃣ majorité de cartes */
            if (t1.length > t2.length) team1Score += 1;
            else if (t2.length > t1.length) team2Score += 1;

            /* 2️⃣ majorité de carreaux */
            const t1Carreaux = t1.filter(c => c.suit === 'carreau').length;
            const t2Carreaux = t2.filter(c => c.suit === 'carreau').length;

            if (t1Carreaux > t2Carreaux) team1Score += 1;
            else if (t2Carreaux > t1Carreaux) team2Score += 1;

            /* 3️⃣ majorité de 7 */
            const t1Sevens = t1.filter(c => c.rank.value === 7).length;
            const t2Sevens = t2.filter(c => c.rank.value === 7).length;

            if (t1Sevens > t2Sevens) team1Score += 1;
            else if (t2Sevens > t1Sevens) team2Score += 1;

            /* 4️⃣ 7 de carreau */
            const has7Carreau = (cards) =>
                cards.some(c => c.suit === 'carreau' && c.rank.value === 7);

            if (has7Carreau(t1)) team1Score += 1;
            if (has7Carreau(t2)) team2Score += 1;

            /* 5️⃣ mise à jour finale */
            setTeams(prev => ({
                team1: {
                    ...prev.team1,
                    score: (prev.team1.score || 0) + team1Score
                },
                team2: {
                    ...prev.team2,
                    score: (prev.team2.score || 0) + team2Score
                }
            }));
            setRoundPoints({
                team1: team1Score,
                team2: team2Score
            });
            setShowSummary(true);

        }
    }, [endRound])



    return <GameContainer variant='scopa'>
        <ScopaDashboard
            teams={teams}
            round={round} deck={deck}
            lastCapture={lastCapture}
            onRestart={startNewRound}
        />
        <ScopaRoundSummary
            open={showSummary}
            teams={teams}
            roundPoints={roundPoints}
            onNextRound={() => {
                setShowSummary(false);
                const nextToPlay = getNextPlayer(currentDealer);
                setCurrentPlayer(nextToPlay);
                setCurrentDealer(nextToPlay);
                startNewRound();
            }}
        />

        <ScopaBoard playCard={playCard} currentDealer={currentDealer}
            pendingCapture={pendingCapture}
            setAnimation={setAnimation} animation={animation}
            onSelectCapture={applyCapture}
            playerHands={playerHands} tableCards={tableCards} />;
    </GameContainer>
}
