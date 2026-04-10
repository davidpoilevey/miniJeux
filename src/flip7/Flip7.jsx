import React, { useEffect, useMemo, useRef, useState } from "react";
import { useFlip7Styles } from "./filpUtils";
import { Box, Button } from "@mui/material";
import { shuffle } from "../uno/utils";
import Flip7Deck from "./Flip7Deck";
import { OtherPlayerGrid, PlayerSet } from "./PlayerSet";
import Score7 from "./Score7";
import avatarUser from '../bitLife/images/M/adulte/avatar1.png';
import avatarIgor from '../bitLife/images/M/adulte/routier.png';
import avatarSophie from '../bitLife/images/F/adulte/avatar16.png';
import avatarJohn from '../bitLife/images/M/jeune/avatar12.png';
import imgStop from './stop.png';
import imgEncore from '../uno/dosdecarte.jpg';
import KillPopupDialog from "./KillPopup";

import SettingsIcon from "@mui/icons-material/Settings";
import ConfigDialog from "./ConfigDialog";
import { GameOver } from "../ChuckNorrisFact";
import { OnBoardingProvider, OnBoardingStep } from "../OnBoardingContext";


const TEMPO_BOT = 600; // ms
const Flip7 = () => {
    const classes = useFlip7Styles();
    const [joueurs, setJoueurs] = useState([]);

    const [killPopupOpen, setKillPopupOpen] = useState(false);
    const killCallbackRef = useRef(null);
    const [pioche, setPioche] = useState();// est un Array
    const [gameOver, setGameOver] = useState(false);//String
    const [userScore, setUserScore] = useState(0);
    const deckRef = useRef();
    const currentJoueur = useRef();
    const [configOpen, setConfigOpen] = useState(false);

    const startGame = (players) => {
        if (players.length === 0)
            return;
        // Clone le deck et la pioche
        const newDeck = [...deckRef.current];
        currentJoueur.current = players[0];
        // définit la pioche
        setPioche(newDeck);
        // Met à jour les joueurs avec leurs nouvelles cartes et sans score
        setJoueurs(players.map(p => ({ ...p, cartes: [], score: 0, mort: false ,deadReason:null})));
    }

    const reset = () => {
        deckRef.current = shuffle(deckRef.current);
        startGame(joueurs);
    }
    const endGame=()=>{
        setGameOver(true);
        setUserScore(joueurs[0].score);
    }
    const endTurn=(winner)=>{
           let maxScore=0;
        const newSetDeJoueur = joueurs.map(p => {
            const newp={...p};
            if(winner!=null){ 
                if(!p.mort)
                    newp.score=getJoueurScore(p);
                 // 15 points bonus et tout le monde compte ses points
                 if(winner.name===p.name)
                    newp.score+=15;
            }
            maxScore = Math.max(maxScore,p.score);
            return { ...newp, cartes: [], mort:false,deadReason:null}
        });
        if(maxScore>300){
endGame();
        }
        else
        setTimeout(() => {
            setJoueurs(newSetDeJoueur);
        }, TEMPO_BOT);
    }
    const openKillPopup=(options)=>{
        killCallbackRef.current = options;
        setKillPopupOpen(true);
    }
    const nextJoueur = () => {
        let takeNext = currentJoueur.current.name === joueurs[joueurs.length - 1];
        for (let j = 0; j < joueurs.length; j++) {
            if (takeNext && !joueurs[j].mort)
                return joueurs[j];
            if (currentJoueur.current.name === joueurs[j].name)
                takeNext = true;
        }
        if (takeNext) {
            // current user passed, but already looped once, a last turn
            for (let j = 0; j < joueurs.length; j++) {
                if (!joueurs[j].mort)
                    return joueurs[j];
            }
        }
        return null;
    }
    const stopCarte = () => {
        const nextJ = joueurs.map(j => {
                if (j.name === currentJoueur.current.name && !j.mort) {
                    let newScore = getJoueurScore(j);
                    currentJoueur.current.mort=true;
                    return { ...j, mort: true, deadReason:"a decidé d'empocher", score: newScore }
                }
                else
                    return j;
            })
        setJoueurs(nextJ);
    }

    const encoreCarte = (carteImposee) => {
        if(pioche.length===0)
           { 
            const newDeck = [...deckRef.current];
            setPioche(newDeck);
           }
        const newCarte = carteImposee||pioche.shift();
        if(carteImposee==null)
            setPioche([...pioche]);
        let stopTurn = false;
        if(checkWinner(currentJoueur.current.cartes||[])){
            // flip seven !!
            return endTurn(currentJoueur.current);
        }
        const newJ = joueurs.map(j => {
            if (j.name === currentJoueur.current.name) {
                const newCartes = [...j.cartes];
                if(!carteImposee)
                    newCartes.push(newCarte);
                let mort = false;
                let deadReason=null
                if (checkBusted(newCartes)) {
                    // Trouver l'index du premier objet avec type: 'joker'
                    const indexJoker = newCartes.findIndex(obj => obj.type === 'joker');
                    if (indexJoker !== -1) { // on laisse une chance d'utiliser le joker
                        if (j.isHuman)
                            stopTurn = true;
                        else {
                            newCartes.splice(indexJoker, 1); // Retire l'objet du tableau original pour les bots
                            newCartes.splice(newCartes.length - 1, 1);
                        }
                    }
                    else
                       {
                        deadReason='Tombé sur un double';
                        mort = true;
                       }
                }
                return { ...j, mort: mort, deadReason:deadReason, cartes: newCartes }
            }
            else
                return j;
        });


        if(newCarte?.type==='stop'){
            // if human, stop turn to ask
            stopTurn=true;
            const toKillFunc=toKill=>{
                const purgedJ=newJ.map(j=>{
                    if(j.name===toKill.name)
                        return {...j, score:getJoueurScore(j), mort:true, deadReason:`${currentJoueur.current.name} a decidé de le stopper`}
                    else if(j.name===currentJoueur.current.name)
                        return {...j, cartes:j.cartes.filter(s=>s.type!=='stop')}
                    else return j;
                })
                setJoueurs(purgedJ);
                if (nextJoueurAvailable(purgedJ)) {
                    currentJoueur.current = nextJoueur();
                }
            }
            if(currentJoueur.current.isHuman){
               return openKillPopup({callback:toKillFunc, mode:newCarte.type});
            }
            else{
                // if not human bust someone after 2 seconds and nextJoueur
                const eligiblePlayers = newJ.filter(j => (!j.mort && j.name !== currentJoueur.current.name));
                if (eligiblePlayers.length > 0) {
                    // Trie par score décroissant et prend le premier (le plus gros score)
                    const next = eligiblePlayers.sort((a, b) => b.score - a.score)[0];
                    toKillFunc(next);
                }
                else // aucun encore vivant ? rerender
                    setJoueurs([...joueurs]);
                return;// on fait pas le dernier setJoueurs
            }
        }
        if(newCarte?.type==='3cartes'){
            const toOverloadFunc=toKill=>{
                let newPioche = [...pioche];
                const purgedJ=newJ.map(j=>{
                    let jr=j;
                    if(j.name===toKill.name)
                    {
                        const newcartes = [...j.cartes];
                        let mort = j.mort;
                        let deadReason=null;
                        for(let t=0;t<3;t++){

                            if(newPioche.length==0){
                                 newPioche=shuffle(deckRef.current)
                            }
                            const newCarte = newPioche.shift();
                            newcartes.push(newCarte);
                            if (checkBusted(newcartes)) {
                                // Trouver l'index du premier objet avec type: 'joker'
                                const indexJoker = newcartes.findIndex(obj => obj.type === 'joker');
                                if (indexJoker !== -1) { // on laisse une chance d'utiliser le joker
                                     newcartes.splice(indexJoker, 1); // Retire l'objet du tableau original pour les bots
                                        const indexDbl = newcartes.findIndex(obj => obj.val === newCarte.val);
                                        newcartes.splice(indexDbl, 1);
                                    
                                }
                                else
                                    {
                                        mort = true;
                                        deadReason='Un double trouvé'
                                        break;
                                    }
                            }
                        }
                        jr= {...j, cartes:newcartes, mort:mort, deadReason:deadReason};
                        
                    }
                    if(j.name===currentJoueur.current.name)
                        jr= {...j, cartes:j.cartes.filter(s=>s.type!=='3cartes')}
                    return jr;
                })
                setPioche(newPioche);
                const currj = purgedJ.find(j=>j.name===toKill.name);
                if(checkWinner(currj.cartes)){
                    // flip seven !!
                    return endTurn(currj);
                }
                setJoueurs(purgedJ);
                if (nextJoueurAvailable(purgedJ)) {
                    currentJoueur.current = nextJoueur();
                }
            }
            if(currentJoueur.current.isHuman){
                return openKillPopup({callback:toOverloadFunc, mode:newCarte.type});
             }
             else{
                 // if not human bust someone after 2 seconds and nextJoueur
                 let next=null;
                 if(Math.random()<currentJoueur.current.seuil)
                    next=currentJoueur.current;
                 else {
                    const eligiblePlayers = newJ.filter(j => (!j.mort));
                    if (eligiblePlayers.length > 0) {
                        // Trie par score décroissant et prend le premier (le plus gros score)
                        next = eligiblePlayers.sort((a, b) => b.score - a.score)[0];
                    }
                 }
                 if(next==null)
                    next=currentJoueur.current;
                toOverloadFunc(next);
                 return;// on fait pas le dernier setJoueurs
             }
        }
        setJoueurs(newJ);

        if (!stopTurn && nextJoueurAvailable(joueurs)) {
            currentJoueur.current = nextJoueur();
        }

    }
   

useEffect(() => {
    if (!currentJoueur.current || joueurs.length===0) return;

    let timeoutId;
    //update currentUser just in case
    currentJoueur.current=joueurs.find(j=>j.name===currentJoueur.current?.name);
    // Si c'est un bot actif
    if (!currentJoueur.current.isHuman && !currentJoueur.current.mort) {
        timeoutId = setTimeout(() => {
            if (joueurEvalue(currentJoueur.current)) encoreCarte();
            else stopCarte();
        }, TEMPO_BOT);
    }
    // Si le joueur courant est mort, on passe au suivant après un petit délai
    else if (currentJoueur.current.mort) {
        if (nextJoueurAvailable(joueurs)) {
            timeoutId = setTimeout(() => {
                currentJoueur.current = nextJoueur();
                setJoueurs([...joueurs]); // retrigger
            }, TEMPO_BOT);
        } else {
            endTurn();
        }
    }

    // Nettoyage du timeout à chaque changement ou démontage du composant
    return () => {
        if (timeoutId) clearTimeout(timeoutId);
    };
}, [joueurs]);

    // initialization
    useEffect(() => {
        // seuil = 0->1 0=prend ses gain rapidement, 1 va jusqu'au flip7
        // isHuman only for user
        // ,cartes:[{val, color, type}] in possession 
        const joueursData = [
            { name: 'Vous', isHuman: true , avatar:avatarUser},
            { name: 'Igor', seuil: 0.8 , avatar:avatarIgor},
            { name: 'Sophie', seuil: 0.3, avatar:avatarSophie },
            { name: 'John', seuil: 0.6 , avatar:avatarJohn},
        ];

        deckRef.current = shuffle(Flip7Deck());

        startGame(joueursData);


    }, []);

    const [joueur, otherPlayer] = useMemo(() => {
        const user = joueurs.find(j => j.isHuman);
        const other = joueurs.filter(j => !j.isHuman);
        return [user, other];
    }, [joueurs]);

    return (
       <OnBoardingProvider app="flip7" stepsConfig={[{id:'intro'}, {id:'cartes'}, {id:'stop'}, {id:'score'}]}>
        <Box className={classes.flip7Board}>
            <GameOver open={gameOver} score={userScore} gameName="Flip Seven"
                handleClose={() => { setGameOver(false) }} handleRestart={reset} />
<KillPopupDialog open={killPopupOpen}
        onClose={() => setKillPopupOpen(false)}
        joueurs={joueurs}
        currentUser={currentJoueur.current}
        mode={killCallbackRef.current?.mode}
        callback={(joueur) => {
          setKillPopupOpen(false);
          if (killCallbackRef.current.callback) {
            killCallbackRef.current.callback(joueur);
          }
        }}
      />
            <OtherPlayerGrid joueurs={otherPlayer} />
            <OnBoardingStep stepId="cartes" condition={joueur?.cartes.length>0} message="Tes cartes s'affichent ici, si tu tires un double tu as perdu ton tour" >
               <PlayerSet joueur={joueur} encoreCarte={encoreCarte}/>
                </OnBoardingStep>
            <Box className={classes.flip7ActionBar}>
            <Box className={classes.flip7ActionButtons}>
  <OnBoardingStep stepId="intro" message="Clique ici pour demander une carte" >
   <Box
    component="img"
    src={imgEncore}
    alt="Encore"
    onClick={() => {
      if (currentJoueur.current?.isHuman) encoreCarte();
    }}
    sx={{
      width: 100,
      cursor: currentJoueur.current?.isHuman ? "pointer" : "not-allowed",
      filter: currentJoueur.current?.isHuman
        ? "drop-shadow(0 6px 18px rgba(0,0,0,0.25))"
        : "grayscale(0.7) opacity(0.5)",
      transition: "transform 0.15s, filter 0.2s",
      borderRadius: 3,
      "&:hover": {
        transform: currentJoueur.current?.isHuman ? "scale(1.06)" : "none",
        filter: currentJoueur.current?.isHuman
          ? "drop-shadow(0 10px 32px rgba(0,0,0,0.32))"
          : "grayscale(0.7) opacity(0.5)",
      },
      mx: 2,
    }}
    tabIndex={currentJoueur.current?.isHuman ? 0 : -1}
    aria-disabled={!currentJoueur.current?.isHuman}
  /> 
  </OnBoardingStep>
  <OnBoardingStep stepId="stop" message="Si tu le sens pas trop, tu peux dire STOP ici et encaisser tes gains actuels" >
  <Box
    component="img"
    src={imgStop}
    alt="Stop"
    onClick={() => {
      if (currentJoueur.current?.isHuman) stopCarte();
    }}
    sx={{
      width: 100, height:100,
      cursor: currentJoueur.current?.isHuman ? "pointer" : "not-allowed",
      filter: currentJoueur.current?.isHuman
        ? "drop-shadow(0 6px 18px rgba(0,0,0,0.25))"
        : "grayscale(0.7) opacity(0.5)",
      transition: "transform 0.15s, filter 0.2s",
      borderRadius: 3,
      "&:hover": {
        transform: currentJoueur.current?.isHuman ? "scale(1.26)" : "none",
        filter: currentJoueur.current?.isHuman
          ? "drop-shadow(0 10px 32px rgba(0,0,0,0.32))"
          : "grayscale(0.7) opacity(0.5)",
      },
      mx: 2,
    }}
    tabIndex={currentJoueur.current?.isHuman ? 0 : -1}
    aria-disabled={!currentJoueur.current?.isHuman}
  /></OnBoardingStep>
</Box>
<OnBoardingStep stepId="score" message="Le premier a 300 a gagné la partie" >
    
      <Score7 joueurs={joueurs} />
</OnBoardingStep>
    </Box>
    <Box sx={{display:'flex', alignItems:'center', gap:'20px'}}>
        
    <Button
  variant="contained" color="primary"  size="large"
  onClick={() => setConfigOpen(true)}
  startIcon={<SettingsIcon />}
>
  Configuration
</Button>
    <Button   color="primary"     variant="contained" size="large"
          onClick={reset}
        >
          Reset
        </Button>
        </Box>
        <ConfigDialog
  open={configOpen}
  onClose={() => setConfigOpen(false)}
  joueurs={joueurs}
  onUpdateJoueurs={newJoueurs=>{setJoueurs(newJoueurs);}}
  avatarDefault="/default-avatar.png" // Chemin vers un avatar par défaut
/>
        </Box>
        
       </OnBoardingProvider> 
    );
}
export default Flip7;





// independant functions

const getJoueurScore=(j)=>{
    let newScore = j.score;
    let multiplier=1;

    j.cartes.forEach(c => {
        if (!isNaN(c.val))
            newScore += c.val;
        else{
            if(c.type.startsWith('+'))
                newScore += Number(c.type.substring(1,10));
            if(c.type==='x2')
                multiplier*=2;
        }
    });
    return newScore*multiplier;
}
const checkBusted = cartes => {
    // check doubles
    const compteur = {};
    for (const obj of cartes) {
        const val = obj?.val;
        if (val !== undefined && !isNaN(val)) {
            compteur[val] = (compteur[val] || 0) + 1;
        }
    }

    let busted = Object.values(compteur).some(count => count >= 2);
    return busted;

}
const checkWinner=cartes=>{
    let nb=0;
    cartes.forEach(c=>{
        if(c==null)
            return;
        if(c.val!='none')
            nb++;
    });
    return (nb>=7);
}
const nextJoueurAvailable = (joueurs) => {
    let avail = false;
    joueurs.forEach(j => {
        if (!j.mort)
            avail = true;
    });
    return avail;
}
const joueurEvalue = joueurATester => {
    const nbCartes = joueurATester.cartes?.length;
    let sum = 0;
    joueurATester.cartes.forEach(c => {
        if(c==null)
            return;
        if (!isNaN(c.val))
            sum += c.val
    });
    const feelings = Math.round(Math.random() * sum) - sum / 2;
    // plus la somme des valeurs est elevee, plus le seuil baisse
    return (nbCartes < (8 * joueurATester.seuil + Math.min(5, feelings)));
}