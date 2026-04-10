import { Alert, Avatar, Box, Button, Grid, Tooltip, Typography } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";

import diceSprite from "./images/dices.png"; // ton image
import montagneImg from "./images/montagne.jpg"; // ton image
import { GameOver } from "../ChuckNorrisFact";
import avatarIgor from '../bitLife/images/M/adulte/avatar11.png';
import avatarSophie from '../bitLife/images/F/adulte/avatar10.png';
import avatarJohn from '../bitLife/images/M/adulte/avatar12.png';
import avatarUser from '../bitLife/images/M/adulte/joueur.png';
import { Star } from "@mui/icons-material";
import { OnBoardingProvider, OnBoardingStep } from "../OnBoardingContext";
import { useIsMobile } from "../hookGame";

// Composant Dice simple

export function Dice({ value = 1, size = 64, selected = false, secondPair = false, noBorder=true,disabled, onClick }) {
    // largeur et hauteur d'une face
    const faceWidth = 260; // à ajuster selon ton image
    const faceHeight = 182;
    const dicePositions = [
        { x: -22, y: -20 },  // 1
        { x: -97, y: -20 },  // 2
        { x: -173, y: -20 }, // 3
        { x: -22, y: -97 },  // 4
        { x: -97, y: -97 },  // 5
        { x: -173, y: -97 }, // 6
    ];
    const border = useMemo(() => {
      if(noBorder) return "none";
        const brd = "3px solid ";
        if (selected && secondPair)
            return brd + "red";
        if (selected && !secondPair)
            return brd + "blue";

        return brd + "transparent";
    }, [selected, secondPair,noBorder])
    if (value == 0)
        return null;
    const pos = dicePositions[value - 1] || dicePositions[0];

    return (
        <Box onClick={disabled ? undefined : onClick}
            style={{
                width: size,
                height: size,
                backgroundImage: `url(${diceSprite})`,
                backgroundSize: `${faceWidth}px ${faceHeight}px`,
                backgroundPosition: `${pos.x}px ${pos.y}px`,
                backgroundRepeat: "no-repeat",
                border: border,
                borderRadius: "8px",
                cursor: "pointer",
                 opacity: disabled ? 0.5 : 1
            }}
        />
    );
}


// Configuration du jeu
const GAME_CONFIG = {
  COLUMN_HEIGHTS: [3, 5, 7, 9, 11, 13, 11, 9, 7, 5, 3],
  COLUMN_LABELS: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  MAX_ALPINISTES: 3,
  POINT_SIZE: 50,
  PLAYER_DESCRIPTION:{
     joueur:"C'est vous, vous jouez comme vous voulez",
    adv3:"Igor le fou. Il a du mal a s'arreter", adv1:"Sophie la prudente, elle s'errete toujours a temps"
    , adv2:"John Random, se fie a son instinct et au hasard"
  },
  PLAYER_AVATAR:{ 
    joueur:avatarUser,
    adv3:avatarIgor, adv1:avatarSophie, adv2:avatarJohn},
  PLAYER_COLORS: {
    joueur: 'blue',
    adv1: 'orange', 
    adv2: 'darkgreen', 
    adv3: 'darkred'
  }
};

  const verifierSuperposition = (playerId, alpinistes, jetons) => {
    const alpinistesJoueur = alpinistes.filter(a => a.playerId === playerId);
    
    return alpinistesJoueur.some(alpiniste => {
      const position = `${alpiniste.colIndex}-${alpiniste.rowIndex}`;
      // Vérifier si un autre joueur a un jeton à cette position
      return Object.keys(jetons).some(otherPlayer => 
        otherPlayer !== playerId && jetons[otherPlayer].includes(position)
      );
    });
  };
const useAI = (gameState, alpinisteState, jetons, getJetonRowIndex) => {
  
  const lancerDes = () => {
    return Array(4).fill().map(() => Math.floor(Math.random() * 6) + 1);
  };
  
  const getPairesDisponibles = (diceValues) => {
    const paires = [];
    // Toutes les combinaisons possibles de 2 dés
    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) {
        const somme = diceValues[i] + diceValues[j];
        const autresPaires = diceValues.filter((_, idx) => idx !== i && idx !== j);
        if (autresPaires.length >= 2) {
          paires.push([somme, autresPaires[0] + autresPaires[1]]);
        } else {
          paires.push([somme]);
        }
      }
    }
    return paires;
  };
  
  
  const strategiePrudente = (paires, playerId, colonnesSuperposees) => {
    // Privilégier les colonnes superposées pour pouvoir valider plus tard
    const pairesAvecSuperposition = paires.filter(paire => 
      paire.some(val => colonnesSuperposees.includes(val - 2))
    );
    
    if (pairesAvecSuperposition.length > 0) {
      return pairesAvecSuperposition[0]; // Première disponible
    }
    
    // Sinon, privilégier les colonnes courtes (2,3,11,12)
    const colonnesCourtes = [0, 1, 9, 10]; // indices des colonnes courtes
    const pairesColonnesCourtes = paires.filter(paire =>
      paire.some(val => colonnesCourtes.includes(val - 2))
    );
    
    return pairesColonnesCourtes.length > 0 ? pairesColonnesCourtes[0] : paires[0];
  };
  
  const strategieRandom = (paires) => {
    return paires[Math.floor(Math.random() * paires.length)];
  };
  
  const strategieAgressive = (paires, playerId) => {
    const jetonsJoueur = jetons[playerId] || [];
    
    // Privilégier les colonnes où on a déjà des jetons
    const colonnesExistantes = jetonsJoueur.map(pos => parseInt(pos.split('-')[0]));
    const pairesExistantes = paires.filter(paire =>
      paire.some(val => colonnesExistantes.includes(val - 2))
    );
    
    return pairesExistantes.length > 0 ? pairesExistantes[0] : paires[0];
  };
  
  const jouerTourIA = (playerId) => {
    const strategies = {
      adv1: strategiePrudente,
      adv2: strategieRandom,
      adv3: strategieAgressive
    };
    
    let deplacementReussi = false;
    let toContinue=false;
    
    if (true) {
      const diceValues = lancerDes();
      const paires = getPairesDisponibles(diceValues);
      
      if (paires.length === 0) {
        // Aucune paire possible, tour terminé par échec
        alpinisteState.annulerAlpinistes(playerId);
        return { success: false, reason: 'Aucune paire possible' };
      }
      
      // Identifier les colonnes superposées
      const colonnesSuperposees = getColonnesSuperposees(playerId, jetons, alpinisteState.alpinistes)
      
      // Choisir une paire selon la stratégie
      const paireChoisie = strategies[playerId](paires, playerId, colonnesSuperposees);
      
      // Tenter de placer les alpinistes
      let placementReussi = false;
      for (const valeur of paireChoisie) {
        const colIndex = valeur - 2;
        if (colIndex >= 0 && colIndex < GAME_CONFIG.COLUMN_HEIGHTS.length) {
          const success = alpinisteState.ajouterAlpiniste(colIndex, playerId, getJetonRowIndex);
          if (success) {
            alpinisteState.deplacerAlpiniste(colIndex, playerId);
            placementReussi = true;
            deplacementReussi = true;
          }
        }
      }
      
      if (!placementReussi) {
        // Impossible de jouer, tour terminé par échec
        alpinisteState.annulerAlpinistes(playerId);
        return { success: false, reason: playerId+" s'est emballé et a tout perdu" };
      }
      
        const nbAlpinistes = alpinisteState.alpinistes.filter(a => a.playerId === playerId).length;
       if (nbAlpinistes < 3) toContinue=true;
      // Pas de superposition, décision selon la stratégie
      if (playerId === 'adv1' && deplacementReussi) {
        // Prudent : s'arrête dès que tous les alpinistes sont placés
       toContinue=false;
      } else if (playerId === 'adv2') {
        // Random : 30% de chance de continuer
        if (Math.random() > 0.3) toContinue=false;
      } else if (playerId === 'adv3') {
        // Agressif : prend plus de risque
        
        if (Math.random() > 0.5) toContinue=false;
      }

      // Vérifier les superpositions
      const aSuperposition = verifierSuperposition(playerId,alpinisteState.alpinistes, jetons);
      
      if (aSuperposition) {
        // Obligé de continuer à cause de la superposition
        toContinue=true;
      }
    }
    
    // Confirmer les alpinistes
    return { success: true, toContinue, reason: 'Tour confirmé pour '+playerId };
  };
  
  return { jouerTourIA };
};
const getColonnesSuperposees=(playerId, jetons, alpinistes)=>{
      const colonnesSuperposees = alpinistes
        .filter(a => a.playerId === playerId)
        .filter(alpiniste => {
          const position = `${alpiniste.colIndex}-${alpiniste.rowIndex}`;
          return Object.keys(jetons).some(otherPlayer => 
            otherPlayer !== playerId && jetons[otherPlayer].includes(position)
          );
        })
        .map(a => a.colIndex);
      return colonnesSuperposees;
      }
// Hook pour gérer l'état du jeu principal
const useGameState = (nbJoueurs) => {
  const [currentPlayer, setCurrentPlayer] = useState('joueur');
 const [canRoll, setCanRoll] = useState(true);
const [canConfirm, setCanConfirm] = useState(false);
const [canSelect, setCanSelect] = useState(false);
  const [tour, setTour] = useState(1);
  
  const players = ['joueur', ...Array.from({length: nbJoueurs}, (_, i) => `adv${i+1}`)];
  
  const nextPlayer = () => {
    const currentIndex = players.indexOf(currentPlayer);
    const nextIndex = (currentIndex + 1) % players.length;
    setCurrentPlayer(players[nextIndex]);
    if (nextIndex === 0) setTour(tour + 1);
  };
  const reset=()=>{
    setTour(1);
    setCurrentPlayer('joueur');
  }

  return {
    currentPlayer, reset,
  canRoll,
  canConfirm, 
  canSelect,
  setCanRoll,
  setCanConfirm,
  setCanSelect,
    tour,
    players,
    nextPlayer
  };
};

// Hook pour gérer les alpinistes
const useAlpinistes = () => {
  const [alpinistes, setAlpinistes] = useState([]); // [{colIndex, rowIndex, playerId}]
  const [alpinistesActifs, setAlpinistesActifs] = useState({}); // {joueur: [colIndex1, colIndex2]}
  const [colonnesGagnees, setColonnesGagnees] = useState({}); // {colIndex: joueur, 3:'adv1',4:'adv1'}
  
  const ajouterAlpiniste = (colIndex, playerId = 'joueur', getJetonRowIndex) => {
    // Vérifier si on peut ajouter un alpiniste
    const alpinistesJoueur = alpinistesActifs[playerId] || [];
    
    if (alpinistesJoueur.length >= GAME_CONFIG.MAX_ALPINISTES) {
      // Si 3 alpinistes déjà placés, on ne peut que jouer sur les colonnes occupées
      if (!alpinistesJoueur.includes(colIndex)) {
        return false; // Mouvement invalide
      }
    }

    // Ajouter l'alpiniste à la colonne
    const playerJeton = getJetonRowIndex(colIndex, playerId);
    const startRow = playerJeton||GAME_CONFIG.COLUMN_HEIGHTS[colIndex];
    
    setAlpinistes(prev => {
      // Retirer l'ancien alpiniste s'il existe sur cette colonne
      const oldRowIndex = prev.find(a => (a.colIndex === colIndex && a.playerId === playerId))?.rowIndex||startRow
      const filtered = prev.filter(a => !(a.colIndex === colIndex && a.playerId === playerId));
      return [...filtered, { colIndex, rowIndex: oldRowIndex, playerId }];
    });

    // Mettre à jour les alpinistes actifs
    setAlpinistesActifs(prev => {
      console.log(prev);
      return {
        ...prev,
        [playerId]: [...new Set([...(prev[playerId] || []), colIndex])]
      }
  });

    return true;
  };

  const deplacerAlpiniste = (colIndex, playerId = 'joueur') => {
    setAlpinistes(prev => 
      prev.map(alpiniste => {
        if (alpiniste.colIndex === colIndex && alpiniste.playerId === playerId) {
          const newRow = alpiniste.rowIndex - 1;
          if (newRow < 0) {
            // Victoire sur cette colonne !
            console.log(`${playerId} a conquis la colonne ${GAME_CONFIG.COLUMN_LABELS[colIndex]}!`);
            return null; // Sera filtré
          }
          return { ...alpiniste, rowIndex: newRow };
        }
        return alpiniste;
      }).filter(Boolean)
    );
  };
const confirmerAlpinistes = (playerId, ajouterJeton) => {
    const alpinistesJoueur = alpinistes.filter(a => a.playerId === playerId);
    
    if (alpinistesJoueur.length === 0) {
      console.log(`Aucun alpiniste à confirmer pour ${playerId}`);
      return { success: false, message: "Aucun alpiniste à confirmer" };
    }

    // Transformation des alpinistes en jetons permanents
    const nouveauxJetons = [];
    alpinistesJoueur.forEach(alpiniste => {
      const position = `${alpiniste.colIndex}-${alpiniste.rowIndex}`;
      nouveauxJetons.push({ colIndex: alpiniste.colIndex, position });
      
      // Ajouter le jeton permanent
      ajouterJeton(alpiniste.colIndex, alpiniste.rowIndex, playerId);
      if(alpiniste.rowIndex===0){
        // colonne gagnée
        setColonnesGagnees(prev=>({...prev, [alpiniste.colIndex]:playerId}))
      }
      console.log(`Alpiniste confirmé sur colonne ${GAME_CONFIG.COLUMN_LABELS[alpiniste.colIndex]} à la position ${alpiniste.rowIndex}`);
    });

    // Retirer les alpinistes temporaires
    setAlpinistes(prev => prev.filter(a => a.playerId !== playerId));
    
    // Nettoyer les alpinistes actifs pour ce joueur
    setAlpinistesActifs(prev => ({
      ...prev,
      [playerId]: []
    }));

    console.log(`${nouveauxJetons.length} alpiniste(s) confirmé(s) pour ${playerId}`);
    return { 
      success: true, 
      message: `${nouveauxJetons.length} alpiniste(s) confirmé(s)`,
      jetons: nouveauxJetons 
    };
  };

  const annulerAlpinistes = (playerId) => {
    setAlpinistes(prev => prev.filter(a => a.playerId !== playerId));
    setAlpinistesActifs(prev => ({ ...prev, [playerId]: [] }));
  };

  const getColonnesCliquables = (playerId, escaladeValues) => {
    if (!escaladeValues) return [];
    
    const alpinistesJoueur = alpinistesActifs[playerId] || [];
    const colonnesEscalade = escaladeValues.map(val => val - 2).filter(val=>!(Object.keys(colonnesGagnees).includes(val)));
    
    if (alpinistesJoueur.length >= GAME_CONFIG.MAX_ALPINISTES) {
      // Limité aux colonnes où on a déjà des alpinistes
      return colonnesEscalade.filter(col => alpinistesJoueur.includes(col));
    }
    
    return colonnesEscalade;
  };
  const reset=()=>{
    setColonnesGagnees({});
    setAlpinistes([]);
  }

  return {
    alpinistes,reset,
    alpinistesActifs,
    ajouterAlpiniste,
    deplacerAlpiniste,
    confirmerAlpinistes,
    annulerAlpinistes,
    getColonnesCliquables,colonnesGagnees
  };
};

// Hook pour gérer les jetons permanents

// Hook pour gérer les jetons permanents
const useJetons = (nbJoueurs) => {
  const [jetons, setJetons] = useState({});

const createInitialJetons = () => {
  const initial = { joueur: [] };
  for (let i = 0; i < nbJoueurs; i++) {
    initial[`adv${i + 1}`] = [];
  }
  return initial;
};

useEffect(() => {
  setJetons(createInitialJetons());
}, [nbJoueurs]);

const resetJetons = () => {
  setJetons(createInitialJetons());
};

  const ajouterJeton = (colIndex, rowIndex, playerId) => {
    const position = `${colIndex}-${rowIndex}`;
    
    setJetons(prev => {
      const jetonsJoueur = [...(prev[playerId] || [])];
      
      // Vérifier s'il y a déjà un jeton sur cette colonne
      const existingIndex = jetonsJoueur.findIndex(pos => pos.startsWith(`${colIndex}-`));
      
      if (existingIndex !== -1) {
        // Remplacer l'ancien jeton par le nouveau (plus avancé)
        jetonsJoueur[existingIndex] = position;
        console.log(`Jeton mis à jour pour ${playerId} sur colonne ${colIndex}: ${position}`);
      } else {
        // Ajouter un nouveau jeton
        jetonsJoueur.push(position);
        console.log(`Nouveau jeton ajouté pour ${playerId}: ${position}`);
      }
      
      return {
        ...prev,
        [playerId]: jetonsJoueur
      };
    });
  };

  const supprimerJeton = (colIndex, playerId) => {
    setJetons(prev => ({
      ...prev,
      [playerId]: (prev[playerId] || []).filter(pos => !pos.startsWith(`${colIndex}-`))
    }));
  };

  
  const getJetonSurColonne = (colIndex, playerId) => {
    const jetonsJoueur = jetons[playerId] || [];
    return jetonsJoueur.find(pos => pos.startsWith(`${colIndex}-`));
  };
  const getJetonRowIndex = (colIndex, playerId) => {
    const jeton = getJetonSurColonne(colIndex, playerId);
    if(jeton!=null)
        return jeton.substring(jeton.indexOf('-')+1);
    return null;
  };

  return { 
    jetons, resetJetons,
    ajouterJeton, 
    supprimerJeton, 
    getJetonRowIndex,
    getJetonSurColonne 
  };
};


// Composant DicePanel amélioré
function DicePanel({ onEscaladeChange, canRoll, canConfirm, canSelect, setCanRoll, setCanConfirm, setCanSelect
    , currentPlayer, onConfirmerTour, onAnnulerTour, cliquableCols, aSuperposition, diceSize = 64}) {
  const [diceValues, setDiceValues] = useState([0, 0, 0, 0]);
  const [selectedDice, setSelectedDice] = useState([]);
  const [escaladeValues, setEscaladeValues] = useState(null);

  useEffect(() => {
    onEscaladeChange(escaladeValues);
  }, [escaladeValues, onEscaladeChange]);

const rollDice = () => {
  const newValues = Array(4).fill().map(() => Math.floor(Math.random() * 6) + 1);
  setDiceValues(newValues);
  resetSelection();
  setCanRoll(false);
  setCanConfirm(false);
  setCanSelect(true);
};

  const resetSelection = () => {
    setSelectedDice([]);
    setEscaladeValues(null);
    setCanSelect(true);
  };

  const handleSelect = (index) => {
    if (selectedDice.includes(index)) return;

    const newSelection = [...selectedDice, index];
    setSelectedDice(newSelection);

    if (newSelection.length >= 2) {
      const firstPair = diceValues[newSelection[0]] + diceValues[newSelection[1]];
      const escVal = [firstPair];

    if (newSelection.length === 2) {
      // Trouver les dés restants
      const remainingIndexes = diceValues
        .map((_, i) => i)
        .filter((i) => !newSelection.includes(i));

      const secondPair =
        diceValues[remainingIndexes[0]] + diceValues[remainingIndexes[1]];

      escVal.push(secondPair);
      setSelectedDice([...newSelection,remainingIndexes[0], remainingIndexes[1]])
      setCanSelect(false); // On peut désactiver directement
    }
     
      setEscaladeValues(escVal);
    }
  };

  const handleConfirmer = () => {
    const result = onConfirmerTour();
    if (result.success) {
      resetSelection();
      
    } else {
      alert(result.message);
    }
  };

  const handleArreter = () => {
    onAnnulerTour();
    resetSelection();
  };

  return (
    <div style={{ position: 'absolute', top: 10, left: 10, textAlign: "center" }}>
      <Typography variant="h6" style={{ marginBottom: 10 }}>
        Joueur: {currentPlayer} 
      </Typography>
      <OnBoardingStep stepId="somme" condition={diceValues.length>0} message="Selectionnez 2 dés pour former 2 sommes" >
        
      <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "20px" }}>
        {diceValues.map((value, idx) => (
          <Dice
            key={idx}
            value={value}
            size={diceSize}
            secondPair={idx >= 2}
            selected={selectedDice.includes(idx)}
            onClick={() => handleSelect(idx)}
            disabled={!canSelect}
          />
        ))}
      </div>
      </OnBoardingStep>
 <OnBoardingStep stepId="escValues" condition={escaladeValues?.length>0} message="Ici est indiqué les colonnes que vous pouvez cliquer" >
  
      <div style={{ marginBottom: "10px" }}>
        {(escaladeValues==null||escaladeValues.length==0)?<Typography variant="h6">Cliquez les dés pour faire des paires</Typography>
        :<Typography variant="h6">Escalades possibles:</Typography>}
        {escaladeValues?.map((val, idx) => (
          <Typography key={idx} variant="h5">{val}</Typography>
        ))}
      </div>
 </OnBoardingStep>
      
      <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
        <OnBoardingStep stepId="intro"  message="Cliquez sur LANCER pour lancer vos 2 dés" >
          
                   <Button 
          variant="contained" 
          disabled={!canRoll || currentPlayer!='joueur'}
          color="primary" 
          onClick={rollDice}
        >
          {canConfirm?'Relancer':'Lancer'}
        </Button>
        </OnBoardingStep>
       {canConfirm &&   <OnBoardingStep stepId="jetons"  message="Relancer les des , au risque de tout perdre ou valider la progression pour securiser vos jetons" >
       <Button 
          variant="contained" 
          color="success" 
          disabled={aSuperposition}
          onClick={handleConfirmer}
        >
          Valider la progression {aSuperposition&&'Case occupee'}
        </Button> </OnBoardingStep>}
       {!canConfirm && !canRoll && cliquableCols.length==0 && selectedDice.length==4 && <Button 
          variant="contained" 
          color="error" 
          onClick={handleArreter}
        >
          Et merde !
        </Button>}
        {selectedDice.length==4 && !canRoll && <Button 
          variant="contained" 
          color="warning" 
          disabled={canSelect}
          onClick={resetSelection}
        >
          Reset
        </Button>}
      </div>
    </div>
  );
}


// Composant Point amélioré
const Point = ({ position, jetons, alpinistes, size = GAME_CONFIG.POINT_SIZE }) => {
  let color = 'gray';

  if (jetons) {
    Object.keys(jetons).forEach(player => {
      if (jetons[player].includes(position)) color = GAME_CONFIG.PLAYER_COLORS[player];
    });
  }

  const alpiniste = alpinistes?.find(a => `${a.colIndex}-${a.rowIndex}` === position);
  if (alpiniste) {
    color = GAME_CONFIG.PLAYER_COLORS[alpiniste.playerId];
    return (
      <Box style={{ width: size, height: size, borderRadius: "50%", backgroundColor: color,
        margin: "2px auto", cursor: "pointer", border: '3px solid orange', boxSizing: 'border-box' }} />
    );
  }

  return (
    <Box style={{ width: size, height: size, borderRadius: "50%",
      backgroundColor: "rgba(200,200,200,0.8)", border: `${Math.max(3, Math.round(size / 5))}px solid ${color}`,
      margin: "2px auto", cursor: "pointer", boxSizing: "border-box" }} />
  );
};

// Composant principal
export const Alpiniste = () => {
  const nbJoueurs = 3;
   const [gameOver, setGameOver] = useState(false);
      const [score, setScore] = useState(0);
  const [escaladeValues, setEscaladeValues] = useState(null);
  const [message, setMessage] = useState();
  const gameState = useGameState(nbJoueurs);
  const alpinisteState = useAlpinistes();
  const { jetons , ajouterJeton, getJetonRowIndex, resetJetons} = useJetons(nbJoueurs);
  const {jouerTourIA} = useAI(gameState, alpinisteState, jetons, getJetonRowIndex);
  
  const restartGame=()=>{
    setGameOver(false);
    setMessage(null);
    gameState.reset();
    alpinisteState.reset();
    resetJetons();
  }
  const handleConfirmerTour = () => {
    const result = alpinisteState.confirmerAlpinistes(gameState.currentPlayer, ajouterJeton);
    if (result.success) {
      // Passer au joueur suivant
      gameState.nextPlayer();
      gameState.setCanRoll(true);
        gameState.setCanConfirm(false);
        gameState.setCanSelect(false);
      return { success: true, message: result.message };
    }
    return result;
  };
  const cliquableCols = alpinisteState.getColonnesCliquables(gameState.currentPlayer, escaladeValues);
    useEffect(()=>{
      let interval;
      if(gameState.currentPlayer!='joueur')
       {
        let res=null;
        let result = {toContinue:true};
         interval = setInterval(()=>{
            result = jouerTourIA(gameState.currentPlayer);
            if(!result.toContinue)
              {
                clearInterval(interval);
                setTimeout(()=>{

                  if(result.success)
                    res=handleConfirmerTour();
                  else
                    res=handleAnnulerTour();
                },100)
                if(result?.reason)
                  setMessage(result.reason);
              }

        },100)
        
       }
       return ()=>{
         clearInterval(interval);
       }
    },[gameState.currentPlayer,jouerTourIA,  handleConfirmerTour]);
    
   const handleColumnClick = (colIndex) => {
  if (!cliquableCols.includes(colIndex)) return;
  let res=null;
  const success = alpinisteState.ajouterAlpiniste(colIndex, gameState.currentPlayer, getJetonRowIndex);
  if (success) {
    res=alpinisteState.deplacerAlpiniste(colIndex, gameState.currentPlayer);
    if(res?.message)
      setMessage(res.message);
    // Déplacement réussi : on peut relancer ou confirmer
    gameState.setCanRoll(true);

    gameState.setCanConfirm(true);
    setEscaladeValues(ev=>{
     if (!ev) return ev;
  
      const targetValue = GAME_CONFIG.COLUMN_LABELS[colIndex]; // La valeur de dé correspondant à cette colonne (2-12)
       
      // Compter combien de fois cette valeur apparaît dans escaladeValues
      const occurrencesDisponibles = ev.find(val => val === targetValue);
      
      // Si on a utilisé toutes les occurrences disponibles pour cette valeur
      if (occurrencesDisponibles) {
        // Retirer une occurrence de cette valeur
        const newEv = [...ev];
        const index = newEv.indexOf(targetValue);
        if (index !== -1) {
          newEv.splice(index, 1);
        }
        return newEv;
      }
      
      return ev; // Pas de changement si on peut encore utiliser cette valeur
    })
  }
};
const isMobile = useIsMobile();
useEffect(() => {
  if (!alpinisteState.colonnesGagnees) return;

  const counts = {};
  Object.values(alpinisteState.colonnesGagnees).forEach((player) => {
    counts[player] = (counts[player] || 0) + 1;
  });

  for (const [player, count] of Object.entries(counts)) {
    if (count >= 3) {
      setGameOver(true);

      let score;
      if (player === 'joueur') {
        const autres = Object.entries(counts)
          .filter(([p]) => p !== 'joueur')
          .reduce((sum, [, c]) => sum + c, 0);
        score = 10 - autres;
      } else {
        score = counts['joueur'] || 0;
      }

      setScore(score);
      break;
    }
  }
}, [alpinisteState.colonnesGagnees]);


  const handleAnnulerTour = () => {
    alpinisteState.annulerAlpinistes(gameState.currentPlayer);
    // Les alpinistes sont perdus, passer au joueur suivant
    gameState.nextPlayer();
    gameState.setCanRoll(true);
    gameState.setCanConfirm(false);
    gameState.setCanSelect(false);
    console.log(`Tour annulé pour ${gameState.currentPlayer} - Alpinistes perdus !`);
  };

const aSuperposition = verifierSuperposition(gameState.currentPlayer,alpinisteState.alpinistes, jetons);
const colonnesPrises = Object.keys(alpinisteState.colonnesGagnees).map(c=>Number(c));
const pointSize = isMobile ? 26 : GAME_CONFIG.POINT_SIZE;
const columnPadding = isMobile ? 3 : 20;
const diceSize = 64;
  return (
    <OnBoardingProvider app="cantstop" stepsConfig={[{id:'intro'}, {id:'somme'}, {id:'escValues'}, {id:'jetons'}]}>
       <Box style={{ display: "flex", flexDirection: "column", minHeight: "100dvh" }}>
      <DicePanel aSuperposition={aSuperposition}
       onConfirmerTour={handleConfirmerTour}
        onAnnulerTour={handleAnnulerTour}
        onEscaladeChange={setEscaladeValues}
        cliquableCols={cliquableCols}
        diceSize={diceSize}
        {...gameState}
      />
      <GameOver open={gameOver} score={score}  gameName="cantstop"
                     handleClose={() => { setGameOver(false) }} handleRestart={restartGame} />
     {!isMobile && <MessageBox message={message} colonnesGagnees={alpinisteState.colonnesGagnees}/>}

      <Box
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundImage:`url(${montagneImg})`,backgroundSize:'cover'
          , backgroundPosition:'top', backgroundPositionX:'-120px', backgroundPositionY:'-87px'
        }}
      >
        {GAME_CONFIG.COLUMN_HEIGHTS.map((height, colIndex) => (
          <Box
            key={colIndex}
            onClick={() => {if(!colonnesPrises.includes(colIndex))
                            handleColumnClick(colIndex);}}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: columnPadding,
              backgroundColor: cliquableCols.includes(colIndex) ? 'yellow' : (colonnesPrises.includes(colIndex)?GAME_CONFIG.PLAYER_COLORS[alpinisteState.colonnesGagnees[colIndex]]:'transparent'),
              cursor: cliquableCols.includes(colIndex) ? 'pointer' : 'default'
            }}
          >
            {Array.from({ length: height }, (_, rowIndex) => (
              <Point
                key={rowIndex}
                position={`${colIndex}-${rowIndex}`}
                jetons={jetons}
                alpinistes={alpinisteState.alpinistes}
                size={pointSize}
              />
            ))}
            <div style={{ marginTop: "2px", padding: isMobile ? 3 : 10, borderRadius:5, fontWeight: "bold", fontSize: isMobile ? '0.7rem' : '1rem', backgroundColor:'#eee' }}>
              {GAME_CONFIG.COLUMN_LABELS[colIndex]}
            </div>
          </Box>
        ))}
      </Box>

      {/* Zone d'information — masquée sur mobile (debug) */}
      {!isMobile && <Box style={{ padding: 20, backgroundColor: '#f5f5f5' }}>
        <Typography>
          Tour {gameState.tour} - {gameState.currentPlayer} - Phase: {gameState.gamePhase}
        </Typography>
        <Typography>
          Alpinistes actifs: {JSON.stringify(alpinisteState.alpinistesActifs[gameState.currentPlayer] || [])}
        </Typography>
        <Typography>
          Jetons permanents: {JSON.stringify(jetons[gameState.currentPlayer] || [])}
        </Typography>
      </Box>}
    </Box>
    </OnBoardingProvider>
  );
};


const MessageBox = ({message, colonnesGagnees }) => {
  // Compte des colonnes gagnées par joueur
  const counts = {};
  Object.values(colonnesGagnees || {}).forEach((player) => {
    counts[player] = (counts[player] || 0) + 1;
  });

  // Liste fixe pour l'affichage
  const players = Object.keys(GAME_CONFIG.PLAYER_AVATAR);

  return (
    <Box
      sx={{
        position: "absolute",
        right: 10,
        top: 10,
        p: 2,
        backgroundColor: "rgba(0,0,0,0.4)",
        borderRadius: 2,
        boxShadow: 3,
        width: 300
      }}
    >
      <Grid container spacing={2}>
        {players.map((playerKey) => (
          <Grid item xs={6} key={playerKey}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1
              }}
            >
              <Tooltip title={GAME_CONFIG.PLAYER_DESCRIPTION[playerKey]}>
                
              {/* Avatar avec contour coloré */}
              <Avatar
                src={GAME_CONFIG.PLAYER_AVATAR[playerKey]}
                sx={{
                  width: 48,
                  height: 48,
                  backgroundColor:'rgba(255,255,255,0.7)',
                  border: `12px solid ${GAME_CONFIG.PLAYER_COLORS[playerKey]}`
                }}
              />
              </Tooltip>
              {/* Étoiles */}
              <Box sx={{ display: "flex", gap: 0.5 }}>
                {Array.from({ length: counts[playerKey] || 0 }).map((_, i) => (
                  <Star key={i} sx={{ color: "#fbc02d" }} />
                ))}
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};


export default Alpiniste;