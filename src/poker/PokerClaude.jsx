import { useState, useEffect, useRef } from 'react';
import { Box, styled } from '@mui/material';
import { GameBoardCore } from '../belote/GameBoard';
import PokerDeck from './PokerDeck';
import { createDeck } from './Card';
import PokerActionsDialog from './PokerActionsDialog';
import { calculateHandStrength, determineWinners, evaluateHand } from './pokUtils';
import ShowdownPanel from './ShowDownPanel';
import { playersByPosition } from '../belote/beloteUtils';
import { GameContainer } from '../belote/Belote';

const PokerGame = () => {
    // ===== DECK ET CARTES =====
    const [deck, setDeck] = useState([]);
    const [playerHands, setPlayerHands] = useState({
        bottom: [],
        left: [],
        top: [],
        right: []
    });
    const [communityCards, setCommunityCards] = useState([]); // Cartes au centre (flop, turn, river)
    const [burnedCards, setBurnedCards] = useState([]); // Cartes brûlées

    // ===== PHASES DU JEU =====
    const [gamePhase, setGamePhase] = useState('distribution'); // distribution, preflop, flop, turn, river, showdown

    const [showdownInfo, setShowdownInfo] = useState(null);

    // ===== JOUEURS =====
    const playerOrder = ['bottom', 'left', 'top', 'right'];
    const [currentDealer, setCurrentDealer] = useState('bottom'); // Le bouton
    const [currentPlayer, setCurrentPlayer] = useState(null); // Qui doit jouer
    const [passes, setPasses] = useState(new Set()); // Joueurs qui ont fold
    const [allIns, setAllIns] = useState(new Set()); // Joueurs en all-in

    // ===== MISES =====
    const [playerChips, setPlayerChips] = useState({
        bottom: 1000,
        left: 1000,
        top: 1000,
        right: 1000
    });
    const [pot, setPot] = useState(0); // Pot total
    const [currentBets, setCurrentBets] = useState({
        bottom: 0,
        left: 0,
        top: 0,
        right: 0
    }); // Mises actuelles dans ce tour d'enchères
    const [minRaise, setMinRaise] = useState(20); // Relance minimale
    const [bigBlind, setBigBlind] = useState(20);
    const [smallBlind, setSmallBlind] = useState(10);

    // ===== ACTIONS DU TOUR =====
    const [playerActions, setPlayerActions] = useState({}); // Historique des actions de chaque joueur
    const [lastRaiser, setLastRaiser] = useState(null); // Dernier joueur à avoir relancé

    // ===== UI =====
    const [actionButtons, setActionButtons] = useState([]); // Boutons d'action disponibles
    const [lastAction, setLastAction] = useState(null);
    // Structure: { player: 'left', action: 'raise', amount: 50, timestamp: Date.now() }
    const [raiseAmount, setRaiseAmount] = useState(0);

    // ===== INITIALISATION =====
    useEffect(() => {
        startNewGame();
    }, []);

    const startNewGame = () => {
        const newDeck = createDeck({ carte32: false });
        setDeck(newDeck);
        setPasses(new Set());
        setAllIns(new Set());
        setCurrentBets({ bottom: 0, left: 0, top: 0, right: 0 });
        setPot(0);
        setCommunityCards([]);
        setBurnedCards([]);
        setPlayerActions({});
        setLastRaiser(null);

        // Passer au joueur suivant comme dealer
        // const nextDealer = getNextPlayer(currentDealer);
        // setCurrentDealer(nextDealer);

        distributeCards(newDeck);
    };

    // ===== DISTRIBUTION =====
    const distributeCards = (gameDeck) => {
        const hands = { bottom: [], left: [], top: [], right: [] };
        let cardIndex = 0;

        // Déterminer qui est la small blind et big blind
        const smallBlindPlayer = getNextPlayer(currentDealer);
        const bigBlindPlayer = getNextPlayer(smallBlindPlayer);

        // Distribuer 2 cartes à chaque joueur (une par une, alternance)
        for (let i = 0; i < 2; i++) {
            for (let player of playerOrder) {
                hands[player].push(gameDeck[cardIndex]);
                cardIndex++;
            }
        }

        setPlayerHands(hands);
        setDeck(gameDeck.slice(cardIndex)); // Deck restant

        // Placer les blinds
        placeBlinds(smallBlindPlayer, bigBlindPlayer);

        // Démarrer le preflop
        setTimeout(() => {
            setGamePhase('preflop'); // Le changement de gaePhase fait moveToNextPlayer
            setLastRaiser(bigBlindPlayer); // La big blind est considérée comme une "relance"
        }, 1000);
    };

    const placeBlinds = (smallBlindPlayer, bigBlindPlayer) => {
        const newBets = { ...currentBets };
        const newChips = { ...playerChips };

        // Small blind
        const sbAmount = Math.min(smallBlind, newChips[smallBlindPlayer]);
        newBets[smallBlindPlayer] = sbAmount;
        newChips[smallBlindPlayer] -= sbAmount;

        // Big blind
        const bbAmount = Math.min(bigBlind, newChips[bigBlindPlayer]);
        newBets[bigBlindPlayer] = bbAmount;
        newChips[bigBlindPlayer] -= bbAmount;

        setCurrentBets(newBets);
        setPlayerChips(newChips);
        setPot(sbAmount + bbAmount);
        setMinRaise(bigBlind);

        // Enregistrer les actions
        setPlayerActions({
            [smallBlindPlayer]: 'small blind',
            [bigBlindPlayer]: 'big blind'
        });
    };

    // ===== NAVIGATION JOUEURS =====
    const getNextPlayer = (player) => {
        const index = playerOrder.indexOf(player);
        return playerOrder[(index + 1) % 4];
    };

    const getNextActivePlayer = (startPlayer) => {
        let player = startPlayer;
        let count = 0;

        while (count < 4) {
            if (!passes.has(player) && !allIns.has(player)) {
                return player;
            }
            player = getNextPlayer(player);
            count++;
        }

        return null; // Tous les joueurs sont fold ou all-in
    };

    // ===== LOGIQUE DU TOUR D'ENCHÈRES =====
    const isRoundComplete = () => {
        // Le tour est fini si tous les joueurs actifs ont misé le même montant
        // et que tous ont eu l'occasion de parler après la dernière relance
        const activePlayers = playerOrder.filter(p => !passes.has(p) && !allIns.has(p));

        if (activePlayers.length <= 1) return true;

        const maxBet = Math.max(...Object.values(currentBets));

        // Vérifier que tous les joueurs actifs ont soit misé le max, soit sont all-in
        const allMatched = activePlayers.every(p =>
            currentBets[p] === maxBet || allIns.has(p)
        );

        // Vérifier que tous ont agi au moins une fois
        const allActed = activePlayers.every(p => playerActions[p]);

        // Si quelqu'un a relancé, tous ceux après lui doivent avoir parlé
        if (lastRaiser) {
            let player = getNextPlayer(lastRaiser);
            while (player !== lastRaiser) {
                if (!passes.has(player) && !allIns.has(player) && !playerActions[player]) {
                    return false;
                }
                player = getNextPlayer(player);
            }
        }

        return allMatched && allActed;
    };

    const advanceToNextPhase = () => {
        // Ajouter les mises au pot
        const totalBets = Object.values(currentBets).reduce((sum, bet) => sum + bet, 0);
        setPot(prev => prev + totalBets);

        // Réinitialiser les mises du tour
        setCurrentBets({ bottom: 0, left: 0, top: 0, right: 0 });
        setPlayerActions({});
        setLastRaiser(null);
        let newDeck = [...deck];
        let newCommunity = [...communityCards];
        let newBurned = [...burnedCards];

        // Brûler une carte avant chaque phase
        if (gamePhase !== 'preflop') {
            newBurned.push(newDeck[0]);
            newDeck = newDeck.slice(1);
        }

        switch (gamePhase) {
            case 'preflop':
                // Brûler une carte puis révéler 3 cartes (flop)
                newBurned.push(newDeck[0]);
                newCommunity = newDeck.slice(1, 4);
                newDeck = newDeck.slice(4);
                setGamePhase('flop');
                break;

            case 'flop':
                // Révéler 1 carte (turn)
                newCommunity.push(newDeck[0]);
                newDeck = newDeck.slice(1);
                setGamePhase('turn');
                break;

            case 'turn':
                // Révéler 1 carte (river)
                newCommunity.push(newDeck[0]);
                newDeck = newDeck.slice(1);
                setGamePhase('river');
                break;

            case 'river':
                // Showdown !
                setGamePhase('showdown');
                endRound(null, 'showdown'); // null = on va déterminer les winners
                return;

            default:
                break;
        }

        setCommunityCards(newCommunity);
        setDeck(newDeck);
        setBurnedCards(newBurned);

        // Le premier à parler après le flop/turn/river est le joueur après le dealer

        const firstPlayer = getNextActivePlayer(getNextPlayer(currentDealer));
        setCurrentPlayer(firstPlayer);
        setCurrentBets({ ...currentBets });
    };
    useEffect(() => {
        if (gamePhase != 'distribution' && gamePhase != 'showDown')
            moveToNextPlayer();
    }, [gamePhase])

    // ===== ACTIONS DES JOUEURS =====
    const handleFold = () => {
        setPasses(prev => new Set([...prev, currentPlayer]));
        setPlayerActions(prev => ({ ...prev, [currentPlayer]: 'fold' }));
        setLastAction({
            player: currentPlayer,
            action: 'fold',
            label: 'Se couche',
            timestamp: Date.now()
        });
        // Vérifier s'il ne reste qu'un joueur
        const activePlayers = playerOrder.filter(p => !passes.has(p) && p !== currentPlayer);
        if (activePlayers.length === 1) {
            // Un seul joueur reste, il gagne
            endRound([activePlayers[0]], 'allfold');
            return;
        }

        moveToNextPlayer();
    };

    const handleCheck = () => {
        setPlayerActions(prev => ({ ...prev, [currentPlayer]: 'check' }));
        setLastAction({
            player: currentPlayer,
            action: 'check',
            label: 'Parole',
            timestamp: Date.now()
        });
        moveToNextPlayer();
    };

    const handleCall = () => {
        const maxBet = Math.max(...Object.values(currentBets));
        const toCall = maxBet - currentBets[currentPlayer];
        const actualCall = Math.min(toCall, playerChips[currentPlayer]);

        const newBets = { ...currentBets };
        const newChips = { ...playerChips };

        newBets[currentPlayer] += actualCall;
        newChips[currentPlayer] -= actualCall;

        setCurrentBets(newBets);
        setPlayerChips(newChips);

        if (newChips[currentPlayer] === 0) {
            setAllIns(prev => new Set([...prev, currentPlayer]));
            setPlayerActions(prev => ({ ...prev, [currentPlayer]: 'all-in' }));
            setLastAction({
                player: currentPlayer,
                action: 'allin',
                label: `Tapis ! (${actualCall}€)`,
                amount: actualCall,
                timestamp: Date.now()
            });
        } else {
            setPlayerActions(prev => ({ ...prev, [currentPlayer]: 'call' }));
            setLastAction({
                player: currentPlayer,
                action: 'call',
                label: `Suit (${actualCall}€)`,
                amount: actualCall,
                timestamp: Date.now()
            });
        }

        moveToNextPlayer();
    };

    const handleRaise = (amount) => {
        const maxBet = Math.max(...Object.values(currentBets));
        const totalBet = maxBet + amount;
        const toAdd = totalBet - currentBets[currentPlayer];
        const actualRaise = Math.min(toAdd, playerChips[currentPlayer]);

        const newBets = { ...currentBets };
        const newChips = { ...playerChips };

        newBets[currentPlayer] += actualRaise;
        newChips[currentPlayer] -= actualRaise;

        setCurrentBets(newBets);
        setPlayerChips(newChips);
        setMinRaise(amount);
        setLastRaiser(currentPlayer);

        if (newChips[currentPlayer] === 0) {
            setAllIns(prev => new Set([...prev, currentPlayer]));
            setPlayerActions(prev => ({ ...prev, [currentPlayer]: 'all-in' }));
            setLastAction({
                player: currentPlayer,
                action: 'allin',
                label: `Tapis ! (${actualRaise}€)`,
                amount: actualRaise,
                timestamp: Date.now()
            });
        } else {
            setPlayerActions(prev => ({ ...prev, [currentPlayer]: `raise ${amount}` }));
            setLastAction({
                player: currentPlayer,
                action: 'raise',
                label: `Relance de ${amount}€`,
                amount,
                timestamp: Date.now()
            });
        }

        moveToNextPlayer();
    };

    const moveToNextPlayer = () => {
        if (isRoundComplete()) {
            // Petit délai avant de passer à la phase suivante
            setTimeout(() => {
            advanceToNextPhase();
            }, 2500);
        } else {
            const nextPlayer = getNextActivePlayer(getNextPlayer(currentPlayer));
            
            // Délai avant de passer au joueur suivant immediat si humain
            if(currentPlayer==='bottom')
                 setCurrentPlayer(nextPlayer);
            else
            setTimeout(() => {
            setCurrentPlayer(nextPlayer);
            }, 2500);
        }
        };

    // ===== IA BASIQUE =====
    const aiPlay = (player) => {
        const playerProfile = playersByPosition[player];

        // Si c'est un humain (sécurité)
        if (playerProfile.isHuman) return;

        const profile = playerProfile.profile;
        const strength = calculateHandStrength(playerHands[player], communityCards);
        const maxBet = Math.max(...Object.values(currentBets));
        const toCall = maxBet - currentBets[player];
        const canCheck = toCall === 0;

        // 1. DÉCISION DE BASE : Fold, Call ou Raise ?
        let decision = 'fold';

        // Ajuster le seuil de fold selon le profil
        const effectiveThreshold = profile.fold_threshold * (1 + (gamePhase === 'preflop' ? profile.tight : 0));

        // Main trop faible → Fold (sauf bluff possible)
        if (strength < effectiveThreshold) {
            // Chance de bluff selon le profil
            const bluffChance = profile.bluff * (gamePhase === 'preflop' ? 0.5 : 1);
            if (Math.random() < bluffChance && toCall < playerChips[player] * 0.3) {
                decision = 'bluff_raise'; // Bluff !
            } else {
                decision = 'fold';
            }
        }
        // Main correcte → Call ou Raise selon agressivité
        else if (strength >= effectiveThreshold && strength < 70) {
            if (canCheck) {
                decision = 'check';
            } else {
                // Plus la main est forte, plus on a de chances de raise
                const raiseChance = profile.aggressive * (strength / 100);
                if (Math.random() < raiseChance) {
                    decision = 'raise';
                } else {
                    decision = 'call';
                }
            }
        }
        // Main forte → Raise ou Slow play
        else {
            // Joueur tight peut slow play (check/call pour piéger)
            const slowPlayChance = profile.tight * 0.3;
            if (Math.random() < slowPlayChance && canCheck) {
                decision = 'check'; // Slow play
            } else if (Math.random() < slowPlayChance && !canCheck) {
                decision = 'call'; // Slow play
            } else {
                decision = 'raise';
            }
        }

        // 2. EXÉCUTION DE LA DÉCISION
        switch (decision) {
            case 'fold':
                handleFold();
                break;

            case 'check':
                handleCheck();
                break;

            case 'call':
                // Vérifier si on a assez de jetons
                if (toCall >= playerChips[player]) {
                    handleCall(); // All-in automatique
                } else {
                    handleCall();
                }
                break;

            case 'raise':
            case 'bluff_raise':
                // Calculer le montant de la relance selon le profil
                let raiseMultiplier = 1;

                // Ajuster selon le trait flambeur
                raiseMultiplier *= profile.flambeur;

                // Si c'est un bluff, mise plus grosse pour faire peur
                if (decision === 'bluff_raise') {
                    raiseMultiplier *= 1.5;
                }

                // Si main très forte, grosse relance
                if (strength > 85) {
                    raiseMultiplier *= 1.3;
                }

                // Calculer la relance finale
                let raiseAmount = Math.floor(minRaise * raiseMultiplier);

                // S'assurer que c'est au moins le minRaise
                raiseAmount = Math.max(raiseAmount, minRaise);

                // Ne pas relancer plus que ce qu'on a
                const maxRaise = playerChips[player] - toCall;
                raiseAmount = Math.min(raiseAmount, maxRaise);

                // Si on ne peut pas relancer suffisamment, call à la place
                if (raiseAmount < minRaise) {
                    handleCall();
                } else {
                    handleRaise(raiseAmount);
                }
                break;

            default:
                handleFold();
        }

        // 3. LOG pour debug (optionnel)
        console.log(`${playerProfile.name} (force: ${strength}%) → ${decision}`);
    };

    // ===== FIN DE PARTIE =====

    const endRound = (winners = null, reason = 'showdown') => {
        let finalWinners = winners;

        // Si pas de winners fournis, c'est qu'on arrive au showdown
        if (!finalWinners) {
            const activePlayers = playerOrder.filter(p => !passes.has(p));
            const hands = {};

            activePlayers.forEach(player => {
                hands[player] = { holeCards: playerHands[player] };
            });

            finalWinners = determineWinners(hands, communityCards);
        }

        // Calculer le pot total
        const totalPot = pot + Object.values(currentBets).reduce((sum, bet) => sum + bet, 0);
        const potShare = Math.floor(totalPot / finalWinners.length);

        // Distribuer les gains
        const newChips = { ...playerChips };
        finalWinners.forEach(winner => {
            newChips[winner] += potShare;
        });

        setPlayerChips(newChips);

        // Préparer les infos pour le recap
        setShowdownInfo({
            winners: finalWinners,
            potWon: totalPot,
            potShare,
            reason,
            playerHands: { ...playerHands },
            finalCommunityCards: [...communityCards],
            activePlayers: playerOrder.filter(p => !passes.has(p))
        });

        setGamePhase('showdown');
    };
    const resetGame = () => {
        setShowdownInfo(null);

        // Passer au joueur suivant comme dealer
        const nextDealer = getNextPlayer(currentDealer);
        setCurrentDealer(nextDealer);

        // Reset de tout
        setPasses(new Set());
        setAllIns(new Set());
        setCurrentBets({ bottom: 0, left: 0, top: 0, right: 0 });
        setPot(0);
        setCommunityCards([]);
        setBurnedCards([]);
        setPlayerActions({});
        setLastRaiser(null);

        setGamePhase('distribution');

        // Relancer la distribution
        setTimeout(() => {
            const newDeck = createDeck({ carte32: false });
            setDeck(newDeck);
            distributeCards(newDeck);
        }, 500);
    };


    // ===== ACTIONS DISPONIBLES POUR LE JOUEUR HUMAIN =====
    useEffect(() => {
        let clearTimer = null;
        if (gamePhase !== 'distribution' && gamePhase !== 'showdown') {
            if (currentPlayer === 'bottom')
                updateAvailableActions();
            else if (currentPlayer && currentPlayer !== 'bottom') {
                // L'IA joue immédiatement
                aiPlay(currentPlayer);

                // On efface l'action après 2 secondes
                clearTimer = setTimeout(() => {
                    setLastAction(null);
                }, 2000);

            }
        }
        return () => {
            if (clearTimer != null)
                clearTimeout(clearTimer);
        }

    }, [currentPlayer, currentBets, playerChips]);

    const updateAvailableActions = () => {
        const maxBet = Math.max(...Object.values(currentBets));
        const toCall = maxBet - currentBets.bottom;
        const canCheck = toCall === 0;
        const chipCount = playerChips.bottom;

        const actions = [];

        actions.push({ type: 'fold', label: 'Fold' });

        if (canCheck) {
            actions.push({ type: 'check', label: 'Check' });
        } else if (chipCount >= toCall) {
            actions.push({ type: 'call', label: `Call ${toCall}`, amount: toCall });
        }

        if (chipCount > toCall) {
            const maxRaise = chipCount - toCall;
            actions.push({
                type: 'raise',
                label: 'Raise',
                minAmount: minRaise,
                maxAmount: maxRaise
            });
        }

        if (chipCount <= toCall) {
            actions.push({ type: 'allin', label: 'All-in', amount: chipCount });
        }

        setActionButtons(actions);
    };

    // ===== PROPS POUR LES COMPOSANTS =====
    const handleCardClick = (card) => {
        // Au poker, on ne clique pas vraiment sur les cartes
        // mais tu peux utiliser ça pour autre chose
    };

    const pokerDeckProps = {
        communityCards,
        gamePhase,
        pot,
        currentBets,
    };

    // Cartes jouables (aucune au poker, on ne joue pas de cartes)
    const playable = [];

    // Tri de la main du joueur (optionnel)
    const sortedHand = playerHands.bottom;

    return <GameContainer variant='poker'>

        <GameBoardCore playerHands={playerHands}
            currentDealer={currentDealer}
            currentPlayer={currentPlayer}
            passes={passes}
            lastAction={lastAction}
            playable={playable}
            sortedHand={sortedHand}
            handleCardClick={handleCardClick}
        >
            <PokerDeck {...pokerDeckProps} />

            {/* Dialog d'actions pour le joueur humain */}
            {currentPlayer === 'bottom' && gamePhase !== 'distribution' && gamePhase !== 'showdown' && (
                <PokerActionsDialog
                    actions={actionButtons}
                    playerHoleCards={playerHands.bottom}
                    communityCards={communityCards}
                    pot={pot + Object.values(currentBets).reduce((sum, bet) => sum + bet, 0)}
                    currentBet={Math.max(...Object.values(currentBets)) - currentBets.bottom}
                    playerChips={playerChips.bottom}
                    onAction={(action, amount) => {
                        switch (action) {
                            case 'fold': handleFold(); break;
                            case 'check': handleCheck(); break;
                            case 'call': handleCall(); break;
                            case 'raise': handleRaise(amount); break;
                            case 'allin': handleCall(); break; // All-in = call avec tout ce qu'on a
                            default:
                        }
                    }}
                />
            )}
            {/* Panel de showdown */}
            <ShowdownPanel
                open={gamePhase === 'showdown'}
                showdownInfo={showdownInfo}
                onContinue={resetGame}
            />
        </GameBoardCore>
    </GameContainer>
};

export default PokerGame;
