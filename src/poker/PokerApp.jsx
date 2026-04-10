// PokerApp.js
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Carte, carteNameByValue, createDeck, shuffle, useCardStyles } from './Card';
import { faCoins, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import PokerTable from './PokerTable';
import { Box, Button, IconButton, Menu, MenuItem, Slider, TextField } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { evaluateChoix, evaluateMain, getStage } from './pokUtils';
import imgVous from './avatars/imgVous.png';
import imgJohn from './avatars/imgJohn.png';
import imgNatacha from './avatars/imgNatacha.png';
import imgKevin from './avatars/imgKevin.png';

const numPlayers = 4;
const BLINDE = 20;


const PokerApp = () => {
  const deck = useRef();
  const [players, setPlayers] = useState([]);
  const [cartesCommunes, setCarteCommunes] = useState();
  const [gameStage, setGameStage] = useState('pre-flop');
  const gameRunning = useRef(false);
  const [nextPlayerIndex, setNextPlayerIndex] = useState(0);
  const currentPlayerIndex = useRef(0);
  const [donneurIndex, setDonneurIndex] = useState(0);
  const [betEvent, setBetEvent] = useState();
  const [playerMise, setPlayerMise] = useState();
  const [banque, setBanque] = useState(0);
  const mise = useRef(0);
  const [resetFlag, setResetFlag] = useState({});
  const [message, setMessage] = useState('Bienvenue au poker');

  // Calcule l'index du joueur pour la petite blinde
  const newSmallBlindPlayerIndex = (donneurIndex + 1) % numPlayers;
  const newBigBlindPlayerIndex = (donneurIndex + 2) % numPlayers;


  // Initialisation du jeu
  useEffect(() => {
    const _deck = createDeck();
    setGameStage('pre-flop');
    setCarteCommunes({});
    setNextPlayerIndex(0);
    setDonneurIndex(1);
    setBanque(0);
    const joueursNames = [
      { name: "Vous", isHuman: true, avatar:imgVous
        , profile: { tight: 0, bluff: 0 } }
      , { name: "John", avatar:imgJohn
        , profile: { tight: 90, bluff: 10 } }
      , { name: "Natacha", avatar:imgNatacha
        , profile: { tight: 30, bluff: 80 } }
      , { name: "Kevin", avatar:imgKevin
        , profile: { tight: 10, bluff: 50 } }
    ]
    const newPlayers = joueursNames.map((joueur, index) => ({
     ...joueur,
      joueurIndex: index,
      isHuman: joueur.isHuman ?? false,
      enjeu: 0,
      folded: false,
      argent: 1000
    }));

    deck.current = shuffle(_deck); // Copie le jeu de cartes et mélangé
    setPlayers(newPlayers);
    gameRunning.current = false;

  }, [resetFlag]);
  const reset = () => {
    setResetFlag({});
  }
  const getCartesCommunes = useCallback(() => {

    let carteCommunesOuvertes = [];
    for (let st in cartesCommunes) {//['pre-flop', 'flop', 'turn', 'river']
      if (gameStage !== 'pre-flop' && (st === 'flop' || gameStage === st || gameStage === 'river'))
        carteCommunesOuvertes = carteCommunesOuvertes.concat(cartesCommunes[st]);
    }
    return carteCommunesOuvertes;

  }, [cartesCommunes, gameStage]);
  // Changement de joueur
  useEffect(() => {
    if (nextPlayerIndex === currentPlayerIndex.current)
      return;
    currentPlayerIndex.current = nextPlayerIndex;
    if (nextPlayerIndex < 0)
      return;
    const currentPlayer = players.length > currentPlayerIndex.current ? getPlayerByID(currentPlayerIndex.current) : null;
    const AIToPlay = (currentPlayer != null && !currentPlayer.isHuman && currentPlayer.hand != null);
    let _currentPlayer = currentPlayer;
    if (currentPlayerIndex.current === -1) {
      // on refait un tour pour egaliser les mises
      const nextPlayer = findNextPlayerToAct(players, mise.current, currentPlayerIndex.current);
      if (nextPlayer) {
        return setNextPlayerIndex(nextPlayer.joueurIndex);
      } else {
        return nextStage(); // Tous les joueurs ont égalisé l'enjeu maximum, nextStage
      }
    }
    if (AIToPlay && _currentPlayer?.choixJoueur != null && _currentPlayer.enjeu < mise.current) {
      // on refait un tour
      const nextPlayer = findNextPlayerToAct(players, mise.current, currentPlayerIndex.current);
      if (nextPlayer != null) {
        _currentPlayer = { ...nextPlayer, choixJoueur: null }
      }
      else
        return nextStage();
    }
    if (_currentPlayer != null) {

      if (AIToPlay) {
        // a l'AI de jouer
        const player = _currentPlayer;
        if (_currentPlayer?.choixJoueur != null) {
          // ici on est sur que c'est le dernier joueur a pas avoir refait un tour, mais qu'il a la meme mise que tout le monde, nextStage!
          return nextStage();
        }
        if (player) {
          if (player.folded) //next player
          {
            // verifier qu'il reste un joueur
            const leftPlayers = findLeftPlayers(players, mise.current);
            if (leftPlayers != null && leftPlayers.length > 1) {

              return setNextPlayerIndex((currentPlayerIndex.current + 1) % numPlayers);
            }
            else
              nextStage();
          }
          else {

            const score = evaluateMain(player.hand, getCartesCommunes()); // evalue si la main vaut le coup
            const choix = evaluateChoix(player, score, mise.current, gameStage); // decide selon le score s'il faut check, miser ou se coucher
            const pmise = Math.min((score<300)?BLINDE:(BLINDE*score/100) , player.argent);// si le score est bon, la mise monte
            handlePlayerAction(choix, null, pmise);
          }
        }
      }
      setMessage(`A ${_currentPlayer.name} de jouer`);
    }
  }, [nextPlayerIndex, players, getCartesCommunes]);




  // function de jeu
  const dealCards = () => {
    const remainingDeck = shuffle(deck.current);
    gameRunning.current = true;
    const hands = Array(numPlayers).fill([]); // Crée un tableau vide pour chaque main de joueur
    remainingDeck.splice(0, 1);// on grille une carte
    // Distribue les cartes de départ (2 cartes fermées) aux joueurs
    for (let j = 0; j < numPlayers; j++) {
      const cards = remainingDeck.splice(0, 2);
      hands[j] = cards;
    }

    remainingDeck.splice(0, 1);// on grille une carte
    // Distribue les cartes communes (flop, turn, river)
    const communityCards = {
      flop: remainingDeck.splice(0, 3),
      turn: remainingDeck.splice(0, 1),
      river: remainingDeck.splice(0, 1),
    };

    setCarteCommunes(communityCards);
    setGameStage('pre-flop');

    // Donne les mains aux joueurs
    setPlayers(pls => {
      return pls.map((p, idx) => ({
        ...p,
        hand: hands[idx],
        enjeu: idx === newSmallBlindPlayerIndex ? BLINDE / 2
          : (idx === newBigBlindPlayerIndex ? BLINDE : 0),
        argent: idx === newSmallBlindPlayerIndex ? p.argent - BLINDE / 2
          : (idx === newBigBlindPlayerIndex ? p.argent - BLINDE : p.argent)
        // Soustrait la petite et grosse blinde 
      }));
    });
    setBanque(b => (b + 1.5 * BLINDE));// 1 blinde et demi
    // reset mise courante
    mise.current = BLINDE;
  };

  const nextStage = (useplayers) => {
    const stages = ['pre-flop', 'flop', 'turn', 'river'];
    const currentIndex = stages.findIndex((stage) => stage === gameStage);
    let p = useplayers || players;
    // Vérifie que tous les joueurs ont le même enjeu
    const enjeuMax = p.reduce((max, player) => Math.max(max, player.enjeu), 0);
    // Vérifier si certains joueurs n'ont pas misé la somme la plus élevée
    const joueursSansEnjeuMax = p.filter(player => (!player.folded && player.enjeu < enjeuMax));


    if (joueursSansEnjeuMax.length > 0) {
      // Certains joueurs n'ont pas misé la somme la plus élevée, ils doivent refaire leur choix

      setNextPlayerIndex(joueursSansEnjeuMax[0].joueurIndex); // Mise à -1 pour que le prochain joueur soit le joueur suivant
      p = p.map(pl => {
        if (pl.enjeu < enjeuMax) {
          // Réinitialiser le choix des joueurs qui n'ont pas misé la somme la plus élevée
          return { ...pl, choixJoueur: null };
        }
        return pl;
      });
      setPlayers(p);
      return;
    }


    if (currentIndex < stages.length - 1) {
      setGameStage(stages[currentIndex + 1]);
      mise.current = 0;
      // setMiseCourante(0);
      if (getPlayerByID(donneurIndex).folded) {
        const next = findNextPlayerToAct(p, mise.current, currentPlayerIndex.current);
        if (next != null)
           setNextPlayerIndex(next.joueurIndex);
      }
      else
        setNextPlayerIndex(donneurIndex);
      // clear choixJoueur
      setPlayers(oldPlayers => {
        return oldPlayers.map(p => ({ ...p, choixJoueur: null }));
      });
    }
    else {
      // end round.. find active player with better hand
      let winner = null;
      gameRunning.current = false;
      let bestScore = 0;
      p.forEach(pl => {
        const score = evaluateMain(pl.hand, getCartesCommunes());
        if(!pl.folded && score > bestScore) {
          winner = pl;
          bestScore = score;
        }
      });
      if (winner != null)
        onAUnWinner(winner);
      else
        alert('y a un probleme, y a pas de gagnant');
    }
  };

 

  const getPlayerByID = (playerIdx) => {
    return players.find(p => p.joueurIndex === playerIdx);
  }

  // ***********  Victoire  *****************
  const onAUnWinner = (winner) => {

    // increment donneurIndex
    setDonneurIndex((donneurIndex + 1) % numPlayers);
    // reset des folded et choixJoueurs
    setPlayers(p => {
      return p.map(pl => {
        pl.folded = false;
        pl.choixJoueur = null;
        pl.enjeu = 0;
        // winner takes it all
        if (pl.joueurIndex === winner.joueurIndex)
          pl.argent += banque;
        return pl;
      })
    });
    setMessage(winner.name + ' a gagné ' + banque+'$ avec '+evaluateMain(winner.hand, getCartesCommunes(), true));
    // reset de la banque
    setBanque(0);
    gameRunning.current = false;
  }

  // ************    Actions de jeu   ***************************
  const handlePlayerAction = (action, evt, score) => {

    const player = players.find(p => p.joueurIndex === currentPlayerIndex.current);
    const newPlayer = { ...player };
    // Logique pour gérer l'action du joueur (vérifier, passer, miser)
    // Mettre à jour l'état des joueurs et de l'index du joueur en cours en conséquence
    if (action === 'fold') {
      //player se couche
      newPlayer.folded = true;
    }
    if (action === 'check') {
      //player check.. next done after
      newPlayer.choixJoueur = 'check';

    }
    if (action === 'call') {
      // Vérifie si le joueur a suffisamment d'argent pour caller
      
        const diff = mise.current - player.enjeu;
        if (player.argent < mise.current) {
          newPlayer.choixJoueur = 'TAPIS ' + (player.argent);
          newPlayer.argent =0;//TAPIS
        }
        else{
          newPlayer.argent -= diff;
          newPlayer.choixJoueur = 'call' + (mise.current);
        }
        // Met à jour l'argent du joueur en déduisant la mise courante
        newPlayer.enjeu = mise.current;
        setBanque(oldBanque => oldBanque + diff);
      
    }
    if (action === 'bet') {
      // ouvrir un slider qui va de mise.current a player.argent
      if (evt != null)
        return setBetEvent(evt);
      else {
        // on miseDone, use playerMise
        // sur OK definir somme misee et continuer la-dessus
        // Vérifie si le joueur a suffisamment d'argent pour miser
        const sommeMisee = Math.max(player.isHuman?playerMise:score, BLINDE);
        if (player.argent >= sommeMisee) {
          const nouvelleMise = Math.round(player.enjeu + sommeMisee);
          // Met à jour l'argent du joueur en déduisant la mise courante multipliée par 2
          newPlayer.argent -= sommeMisee;
          newPlayer.enjeu = nouvelleMise;
          newPlayer.choixJoueur = 'bet' + (sommeMisee);
          setBanque(oldBanque => oldBanque + sommeMisee);
          mise.current = nouvelleMise;
        }
        else {
          // tapis
          newPlayer.enjeu = player.argent;
          newPlayer.argent = 0;
          newPlayer.choixJoueur = 'TAPIS ' + (player.argent);
        }
        // reset temp states
        setPlayerMise(null);
        setBetEvent(null);
      }
    }
    // update player
    const updatedPlayers = players.map(p => {
      if (p.joueurIndex === currentPlayerIndex.current) {
        return newPlayer;
      }
      return p;
    });
    setPlayers(updatedPlayers);


    const nextPlayerToAct = findNextPlayerToAct(updatedPlayers, mise.current, currentPlayerIndex.current);

    setTimeout(() => {//petit delai avant de jouer
      if(!gameRunning.current)
        return;
      if (nextPlayerToAct != null && nextPlayerToAct.name !== newPlayer.name)
        setNextPlayerIndex(nextPlayerToAct.joueurIndex);
      else {
        nextStage(updatedPlayers);
      }
    }, 400);

  };

  useEffect(() => {
    if (playerMise != null) {
      handlePlayerAction('bet');
    }
  }, [playerMise]);

  // debug
  const evalAllMains=()=>{
    
  players.forEach(pl => {
    let score = evaluateMain(pl.hand, getCartesCommunes());
    console.log('pour '+pl.name+' main='+score);
  });
}

  return (

    <PokerTable gameStage={gameStage} message={message} dealCards={dealCards} currentPlayer={getPlayerByID(currentPlayerIndex.current)}
      handlePlayerAction={handlePlayerAction} miseCourante={mise.current}
      setCurrentPlayerIndex={setNextPlayerIndex} reset={reset} gameRunning={gameRunning.current}
      players={players} cartesCommunes={cartesCommunes} currentPlayerIndex={currentPlayerIndex.current} banque={banque} >
      <BetPopup event={betEvent} from={mise.current} to={getPlayerByID(currentPlayerIndex.current)?.argent}
        onValidate={setPlayerMise} />
        <Button onClick={evalAllMains}>Debug: EvaluateMains</Button>
    </PokerTable>
  );

};

const BetPopup = ({ event, from, to = 20, onValidate }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [currMise, setcurrMise] = useState(from);
  useEffect(() => {
    // = open
    if (event != null)
      setAnchorEl(event.currentTarget || event.target);
    else
      setAnchorEl(null);
  }, [event]);

  const handleClose = () => {
    setAnchorEl(null);
  };
  if(to<BLINDE)
    return null;
  return <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}

  >
    <MenuItem sx={{ width: '100%' }}>
      <Box sx={{
        width: '100%', padding: 2, display: 'flex', gap: 2, alignItems: 'center', margin: '8px'
        , border: '4px ridge green', borderRadius: '15px', backgroundColor: 'beige'
      }}>
        <FontAwesomeIcon icon={faCoins} />
        <Slider value={currMise}
          sx={{ minWidth: 300 }} valueLabelDisplay="auto"
          min={Math.max(0,from)} max={Math.max(to,from)} step={BLINDE}
          marks
          onChange={(event, value) => setcurrMise(value)} />
        <TextField label="Mise" value={currMise} />
        <IconButton onClick={() => { onValidate(currMise) }}>
          <FontAwesomeIcon icon={faCircleCheck} color="blue" />
        </IconButton>
      </Box>
    </MenuItem>

  </Menu>
}

export default PokerApp;







// **************   Function utiles et statiques  *************************


const findLeftPlayers = (players, miseCurrent) => {
  const nextPlayer = players.find((player) => player.enjeu < miseCurrent && !player.folded);
  return nextPlayer;
};

// Fonction pour trouver le prochain joueur qui doit agir
const findNextPlayerToAct = (players, miseCurrent, currentPlayerIndexCurrent) => {
  let idx = currentPlayerIndexCurrent;
  if (currentPlayerIndexCurrent < 0)
    idx++;
  let nextIndex = (idx + 1) % numPlayers;
  const nextPlayers = players.filter((player) => ((miseCurrent === 0 || player.enjeu < miseCurrent) && !player.folded && player.choixJoueur == null));
  let breakCnt = 0;
  while (!nextPlayers.find(p => p.joueurIndex === nextIndex)) {
    nextIndex = (nextIndex + 1) % numPlayers;
    breakCnt++;
    if (breakCnt > 5) {
      // no more next
      nextIndex = null;
      break;

    }
  }
  if (nextIndex == null || currentPlayerIndexCurrent === nextIndex)
    return null;
  return players[nextIndex];
};