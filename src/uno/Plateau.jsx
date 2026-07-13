import React, { useEffect, useRef, useState } from 'react';
import Player from './Joueur';
import { shuffle, useStyles } from './utils';
import UnoDeck, { specialCardsNoColor } from './UnoDeck';
import Carte, { FlyingCarte } from './Carte';
import { Box, Button } from '@mui/material';
import { Pioche, Tas } from './TasPioche';
import ColorChoiceDialog from './ColorChoice';
import { GameOver } from '../ChuckNorrisFact';

const UnoBoard = () => {
    const classes = useStyles();
    const [joueurs, setJoueurs] = useState([]);
    const [colorChoiceOpen, setShowColorChoice] = useState(false);
    const [cardEffect, setCardEffect] = useState();//String
    const [gameOver, setGameOver] = useState(false);//String
    const [score, setScore] = useState(0);
    
    const [flyingCarte, setFlyingCarte] = useState();//Carte
    const [pioche, setPioche] = useState();// est un Array
    const [nextUpdated, setUpdateNext] = useState();
    const [sens, setSens] = useState('anti');// est horaire/anti
   // const [tas, setTas] = useState();// est un Array
    const pile = useRef([]);
    const [centralPos, setCentralPos] = useState({ x: 0, y: 0 })// est une position
    const currentJoueur = useRef();
    const maskColor = useRef();
    const deckRef = useRef();
    const refTas = useRef();// est du DOM


    const startGame = (players) => {
        if (players.length == 0||pile.current.length>0)
            return;
        // Clone le deck et la pioche
        const newDeck = [...deckRef.current];

        // Distribue 7 cartes à chaque joueur
        const joueursWithCards = players.map((joueur) => {
            const cartesDuJoueur = [];
            for (let i = 0; i < 7; i++) {
                const randomIndex = Math.floor(Math.random() * newDeck.length);
                const carte = newDeck.splice(randomIndex, 1)[0];
                cartesDuJoueur.push(carte);
            }
            return {
                ...joueur,
                cartes: cartesDuJoueur,
            };
        });
        currentJoueur.current = joueursWithCards[0];

        // La première carte de la pioche devient la carte centrale
        if (newDeck.length > 0) {
            pile.current = newDeck.splice(0, 1);
        }
        // Met à jour le deck avec les cartes restantes et définit la pioche
        setPioche(newDeck);


        // Met à jour les joueurs avec leurs nouvelles cartes
        setJoueurs(joueursWithCards);
    }

    const reset = ()=>{
        deckRef.current = shuffle(UnoDeck());
        pile.current=[]
        startGame(joueurs);
    }
    // initialization
    useEffect(() => {
        const positions = ['bottom', 'right', 'top', 'left'];
        const joueursData = [
            { name: 'Vous', isHuman: true },
            { name: 'Joueur 2' },
            { name: 'Joueur 3' },
            { name: 'Joueur 4' },
        ];

        deckRef.current = shuffle(UnoDeck());

        const joueursWithPosition = joueursData.map((joueur, index) => ({
            ...joueur,
            joueurIndex: index,
            position: positions[index],
        }));
        startGame(joueursWithPosition);


    }, []);



    //***********  function de jeu************ */

    const clickPioche = () => {
        if (pioche.length === 0 ||!currentJoueur.current.isHuman) return;
        piocheCarte(currentJoueur.current, 1);
        nextPlayer(1);
    };

    const piocheCarte = (player, nbCarte)=>{
        // Prend les 2 première carte de la pioche
        const onPioche = pioche.slice(0, nbCarte);

        // Retire les carte de la pioche
        const newPioche = [...pioche.slice(nbCarte)];
        setPioche(newPioche);

        player.cartes = player.cartes.concat(onPioche);
        setJoueurs(oldj => {// update joueurSuivant
            return oldj.map(j=>{
                if(j.name===player.name)
                    return player;
                 else 
                    return j;
            });
        });
   }
   
    const playCarte = (evt, carte, fromPos) => {

        let posleft=20,postop=20;
        if(evt!=null){
             posleft = evt.clientX;
             postop = evt.clientY;
        }
        else if(fromPos!=null){
            if(fromPos==='top'){
                posleft=centralPos.x;
            }
            if(fromPos==='left'){
                postop=centralPos.y;
            }
            if(fromPos==='right'){
                postop=centralPos.y;
                posleft=centralPos.x*2-20;
            }
        }
        else alert('Houston on a un probleme')
       
        
        setFlyingCarte({...carte, id:'flyingCarte', position:{top:postop, left:posleft}});


    };
   
    
    const flyinCarteArrived = () => {
        // Retire la carte de la main du joueur et 
        const joueurActif = currentJoueur.current;
        // Quand le déplacement est fini, retirer la carte de la main du joueur
        // et l'ajouter à tas (setTas)
        const carte = joueurActif.cartes.find(c=>(c.color===flyingCarte.color&&c.type===flyingCarte.type&&c.value==flyingCarte.value));
        if(carte==null){
            console.log('Houston on a un probleme de carte nulle');
             setFlyingCarte(null);
             return;
    }
        const newCartes = joueurActif.cartes.filter((c) => c.id !== carte.id);
        joueurActif.cartes = newCartes;
        setJoueurs(oldj => {// update joueurSuivant
            return oldj.map(j=>{
                if(j.name===joueurActif.name)
                    return {...joueurActif};
                 else 
                    return j;
            });
        });
        
        //l'ajoute à tas (setTas)
        pile.current = pile.current.concat(carte);
        // Envoyer l'événement applyCardEffect(card) pour gérer l'effet de la carte (à faire)
        applyCardEffect(carte);
        // Nettoie le flyingcarte de la carte
        setFlyingCarte(null);


    };
    const isCarteValid = (carte) => {
        // depend de la derniere carte du tas
        const lastCard = pile.current[pile.current.length - 1];
        if (!lastCard || specialCardsNoColor.find(c => c === carte.type)) {// les joker et +4 sont toujours valide
            // Si le tas est vide, toutes les cartes sont valides
            return true;
        }
        if(maskColor.current!=null)
            return (carte.color === maskColor.current);
        return (carte.color === lastCard.color) || (carte.value === lastCard.value);


    }
    const nextPlayer = (rang=1, withSens) => {
        
        if(currentJoueur.current.cartes.length==0)
            {
                setScore(joueurs
                    .flatMap(obj => obj.cartes) // Aplatit le tableau de cartes en un seul tableau
                    .reduce((acc, carte) => acc + carte.value, 0));
                return setGameOver(true);
            }
        let joueurSuivant = whosNext(rang, withSens);
      
        currentJoueur.current = joueurSuivant;
        if(!joueurSuivant.isHuman)// on joue pour lui
        {

            // s'il a une carte valide
            const validCartes =  joueurSuivant.cartes.filter(c=>(isCarteValid(c)));
            if(validCartes.length>0){
                // il la joue
                const validCartesSansJoker = validCartes.filter(c=>(!specialCardsNoColor.includes(c.type)));
                if(validCartesSansJoker.length>0)
                    playCarte(null, validCartesSansJoker[0], joueurSuivant.position);
                else// joue un joker si pas le choix
                    playCarte(null, validCartes[0], joueurSuivant.position);

            }
            else{
                piocheCarte(joueurSuivant,1);
                nextPlayer(1);
            }
            // sinon il pioche
            // et on passe au suivant
        }
    }
    const whosNext = (rang=1, withSens) => {
        const jidx = currentJoueur.current.joueurIndex;
        if(withSens==null)
            withSens=sens;
        const sensHoraire = withSens === 'horaire' ? -rang : rang;
        const joueur = joueurs.find(j=>j.joueurIndex=== Math.abs((joueurs.length+jidx + sensHoraire) % 4));
        return joueur;
    }
    const applyCardEffect = carte => {
        setCardEffect(carte.type);
        setTimeout(()=>{applyCardEffectLaSuite(carte)}, 800);// on laisse un temps pour lire l'effet de l carte
    }
    const applyCardEffectLaSuite = carte => {
        if (carte.type === 'number') {
            // aucun effet, on passe au joueur suivant
            nextPlayer(1);
        }
        const joueurSuivant = whosNext();

        if (carte.type === 'passeTonTour') {
            nextPlayer((carte.type === 'passeTonTour')?2:1);
        }
        //'+2', 'inversion', 'passeTonTour' 'joker','+4'
        if (carte.type === '+2') {
            // on prend 2 de la pioche pour les donner au suivant
            piocheCarte(joueurSuivant, 2);
           
            nextPlayer(1);
        }
        if (carte.type === 'inversion') {
            setSens(os=>(os==='anti'?'horaire':'anti'));
            nextPlayer(1, sens==='anti'?'horaire':'anti');
        }
        if (carte.type === 'joker') {
            setShowColorChoice(true);
        }
        if (carte.type === '+4') {
            // on prend 4 de la pioche pour les donner au suivant
            piocheCarte(joueurSuivant, 4);
          
            setShowColorChoice(true);
        }
        setUpdateNext({});
    }
    const colorChosen = color=>{
        // apply maskColor
        maskColor.current = color;
        setShowColorChoice(false);// ferme popup
        nextPlayer(1);
    }
    const setrefTas=(elt)=>{
        if(elt!=null ){

            const { left, top, width, height } = elt.getBoundingClientRect();
            if(refTas.current==null || centralPos.x!==left || centralPos.y!==top){
                setCentralPos({ x: left, y: top });
                refTas.current=elt;
            }

            // const centerX = left + width / 2;
            // const centerY = top + height / 2;
        }
    }



    return (
        <Box className={classes.unoBoard}>
            <GameOver open={gameOver} score={score}  gameName="Uno"
    handleClose={() => { setGameOver(false) }} handleRestart={reset} />
            <div className={classes.sensBackground+' '+(sens==='horaire'?classes.sensHoraire:classes.sensAnti)}/>
            {/* Tapis vert au centre */}
            <Button onClick={reset}>RESET</Button>
            <Tas tas={pile.current} cardEffect={cardEffect} ref={setrefTas}/>
            <Pioche pioche={pioche} onClick={clickPioche} />
            {/* Joueurs autour du tapis vert */}
            {joueurs.map((joueur, index) => (
                <Player key={index} player={joueur} forUpdate={nextUpdated} isActif={currentJoueur.current.name===joueur.name} playCarte={playCarte} isCarteValid={isCarteValid} />
            ))}
            <ColorChoiceDialog open={colorChoiceOpen} onChosen={colorChosen}/>
            
            {flyingCarte && <FlyingCarte carte={flyingCarte} arrived={flyinCarteArrived} centre={centralPos}/>}
        </Box>
    );
};

export default UnoBoard;



const createNewCarte = ({id,  color, value,type,refCallback}) => {
    return (
      <Carte
        key={id}
        isHuman={false}

        refCallback={refCallback}
        carte={{
          id: id,
          color: color,
          value: value,
          type:type
        }}
      />
    );
  };