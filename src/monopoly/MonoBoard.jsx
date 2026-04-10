import { Box, Button, Typography } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { useMono } from "./MonoContext";
import { MonoCase } from "./MonoCase";
import { Dice } from "../miniJeux/Alpiniste";

const BOARD_SIZE = 11; // cases par côté
const BOARD_HEIGHT = 800; // hauteur fixe, ajustable
const baseCell = BOARD_HEIGHT / BOARD_SIZE; // taille d'une case carrée standard

export const MonopolyBoard = () => {
    const [boardWidth, setBoardWidth] = useState(window.innerWidth);
    const { board, joueurs, playerByCase } = useMono();
    const handleResize = useCallback(() => {
        setBoardWidth(window.innerWidth);
    }, []);

    useEffect(() => {
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [handleResize]);

    // largeur théorique de la ligne du bas si tout était carré :
    const expectedWidth = baseCell * BOARD_SIZE;
    // différence réelle : on donne tout à la gare
    const extraSpace = boardWidth - expectedWidth;
    const gareWidth = baseCell + Math.max(0, extraSpace);

    return <Box>
        {board.map((row, cidx) => {
            return <Box key={'row' + cidx}
                sx={{
                    display: "flex",
                    alignItems: "stretch",
                    height: baseCell,
                    width: "100%",
                    backgroundColor: "#e8e6d8",
                }}
            >
                {row.map(c => {
                    return <MonoCase key={"left" + c.id}
                    players={playerByCase(c.order)}
                        baseCell={baseCell} monocase={c} />
                })}
            </Box>
        })}

    </Box>
}




// Centre du board : des et infos courantes
export const Centre = () => {
     const { 
      avanceJoueur, 
      currentJoueur, 
      joueurs, 
      setCurrentJoueur,
      iaDecision,
      isIAPlaying,
      setIsIAPlaying,sortirPrison,
      modalAction
    } = useMono();
    const [deLanced, setDeLanced] = React.useState([]);
    const [isRolling, setIsRolling] = React.useState(false);
    const [waitingForModal, setWaitingForModal] = React.useState(false);

    // Effet pour faire jouer l'IA automatiquement
    useEffect(() => {
        const joueur=joueurs[currentJoueur];
        if(joueur.enPrison>0){
          // Le joueur est en prison, on lance la modal sortirPrison automatiquement
          setWaitingForModal(true);
           sortirPrison(lanceDe);
          return;
        }
      if (currentJoueur !== 0  && !isIAPlaying && deLanced.length === 0 && !modalAction) {
        const timer = setTimeout(() => {
          setIsIAPlaying(true);
          lanceDe();
        }, 500);
        
        return () => clearTimeout(timer);
      }
    }, [currentJoueur,  deLanced, modalAction]);

    // Effet pour gérer les décisions de l'IA après avoir atterri sur une case
    useEffect(() => {
      if (currentJoueur !== 0 && modalAction) {
        iaDecision(currentJoueur);
      }
    }, [modalAction, currentJoueur]);

     // Effet pour détecter la fermeture de la modal et passer au joueur suivant
    useEffect(() => {
      if (waitingForModal && !modalAction) {
        // La modal vient de se fermer, on peut passer au suivant
        const timer = setTimeout(() => {
          
            setCurrentJoueur((prev) => (prev + 1) % joueurs.length);
          setDeLanced([]);
          setIsRolling(false);
          setIsIAPlaying(false);
          setWaitingForModal(false);
        }, 500);
        
        return () => clearTimeout(timer);
      }
    }, [modalAction, waitingForModal]);

    const lanceDe = () => {
        setIsRolling(true);
        const de1 = Math.ceil(Math.random() * 6);
        const de2 = Math.ceil(Math.random() * 6);
        const total = de1 + de2;
        const isDouble = de1 === de2;
        
        setDeLanced([de1, de2]);
        avanceJoueur(total);
        
       setTimeout(() => {
          // On vérifie si une modal doit s'ouvrir
          // Si oui, on attend qu'elle se ferme avant de passer au suivant
          setWaitingForModal(true);
          
          // Si c'est un double et pas de modal, on peut relancer
          // if (isDouble && !modalAction) {
          //   setIsRolling(false);
          //   setWaitingForModal(false);
          //   if (currentJoueur !== 0) {
          //     setDeLanced([]);
          //   }
          // }
        }, 2000);
    };

    useEffect(() => {
        setDeLanced([]);
    }, [currentJoueur]);

    const joueurActuel = joueurs[currentJoueur];

    if (deLanced.length > 0) {
        const isDouble = deLanced[0] === deLanced[1];
        return (
            <Box sx={{
                width: '100%', 
                height: '100%', 
                textAlign: 'center', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: 2
            }}>
                <Dice size={64} value={deLanced[0]} />
                <Dice size={64} value={deLanced[1]} />
                <Typography variant="h5">Total: {deLanced[0] + deLanced[1]}</Typography>
                {isDouble && <Typography color="success.main">Double ! 🎉</Typography>}
            </Box>
        );
    }

   return (
        <Box sx={{
            width: '100%', 
            height: '100%', 
            textAlign: 'center', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 1
        }}>
            <Typography variant="h6" sx={{ color: joueurActuel.color, fontWeight: 'bold' }}>
                Tour de {joueurActuel.name}
            </Typography>
            {currentJoueur === 0 ? (
                <Button 
                    onClick={lanceDe} 
                    variant="text" 
                    disabled={isRolling}
                    size="large"
                >
                    Lancez les dés !
                </Button>
            ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body1">
                      {joueurActuel.name} réfléchit...
                  </Typography>
                  <Box className="loading-dots">⏳</Box>
                </Box>
            )}
        </Box>
    );
};