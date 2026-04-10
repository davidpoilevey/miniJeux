import { useEffect, useRef, useState } from "react";
import { Layer, RegularPolygon, Stage } from "react-konva";
import { checkVictoryByConnection, checkVictoryByEnclosure, useKamon } from "./kamonHooks";
import { axialToPixel } from "../wargame/hooks/hexUtils";
import KamonTile from "./KamonTile";
import { Box, Typography } from "@mui/material";
import { GameOver } from "../ChuckNorrisFact";
import { OnBoardingStep } from "../OnBoardingContext";
import { useIsMobile } from "../hookGame";

const KamonBoard = () => {
  const isMobile = useIsMobile();
  const HEX_SIZE = isMobile ? 28 : 40;
 const containerRef = useRef(null);

      const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
const [currentJoueur, setCurrentJoueur] = useState(true);
const [currentTile, setCurrentTile] = useState(null);
const [resetSeed, setResetSeed] = useState(null);
const [message, setMessage] = useState("");
const [availableKeys, setAvailableKeys] = useState([]);
const [playersTile, setPlayersTile] = useState([]);
const [IATile, setIATile] = useState([]);
const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
const {grid, attachToPlayer} = useKamon(resetSeed);

const reset = () => {
  setCurrentTile(null);
  setAvailableKeys([]);
  setPlayersTile([]);
  setScore(0);
  setIATile([]);
  setMessage("");
  setGameOver(false);
  setCurrentJoueur(true);
  setResetSeed(Date.now()); // simple moyen de forcer la régénération
}
const handleClick = (hex, key) => {
    if(!currentJoueur) {
      setMessage("⛔ Ce n'est pas ton tour !");
      return;
    }
  const radius = 3; // correspond à ton grid actuel
  if(IATile.includes(key)) {
    setMessage("❌ Cette tuile a déjà été choisie par l'IA !");
    return;
  }
  if(playersTile.includes(key)) {
    setMessage("❌ Tu as déjà choisi cette tuile !");
    return;
  }
  setMessage("");
  // --- Premier tour : on ne peut choisir qu’un hex du bord ---
  if (!currentTile) {
    const isEdge =
      Math.abs(hex.q) === radius ||
      Math.abs(hex.r) === radius ||
      Math.abs(hex.s) === radius;

    if (!isEdge) {
      setMessage("⚠️ Tu dois choisir une tuile de bord au premier tour.");
      return;
    }
  setPlayersTile((prev) => [...prev, key]);
  attachToPlayer(hex.key, "player");
    setCurrentTile(hex);
    // plus tard : on déterminera les tuiles accessibles
    return;
  }

  // --- Tours suivants : seulement sur les cases disponibles ---
  if (!availableKeys.includes(key)) {
    setMessage("❌ Tu ne peux pas jouer ici !");
    return;
  }

  // Si tout est valide
  setPlayersTile((prev) => [...prev, key]);
   attachToPlayer(hex.key, "player");
  setCurrentTile(hex);
  // Ici on pourra mettre à jour availableKeys via useEffect ensuite
};

//IA to play
useEffect(() => {
    if (checkVictoryByConnection("player", grid, 3) || checkVictoryByEnclosure("player", grid, 3)) {
      setMessage("🎉 Félicitations ! Tu as gagné !");
      setScore(playersTile.length*3);
      setGameOver(true);
      return;
    }
    if (checkVictoryByConnection("ia", grid, 3) || checkVictoryByEnclosure("ia", grid, 3)) {
      setMessage("🤖 Tu as perdu ! Mieux vaut réessayer."); 
      setScore(playersTile.length);
      setGameOver(true);
    }
    if(!currentJoueur) {
      // Simple délai pour simuler la réflexion de l'IA
      const iaTimeout = setTimeout(() => {
        const radius = 3;
        const iaAvailable = [];

        // Trouver les tuiles disponibles pour l'IA
        grid.forEach((hex, hexKey) => {
          if (
            !playersTile.includes(hexKey) && // pas déjà prise par le joueur
            (hex.color === currentTile.color || hex.symbol === currentTile.symbol)
          ) {
            iaAvailable.push({ hex, hexKey });
          }
        });

        if (iaAvailable.length === 0) {
          setMessage("🤖 L'IA ne peut pas jouer ! Tu as gagné");
          setScore(playersTile.length*2);
          setGameOver(true);
          return;
        }

        // Choisir une tuile aléatoire parmi les disponibles
        const choice =
          iaAvailable[Math.floor(Math.random() * iaAvailable.length)];
          setIATile((prev) => [...prev, choice.hexKey]);
          attachToPlayer(choice.hexKey, "ia");
        setCurrentTile(choice.hex);
    }, 1000);

      return () => clearTimeout(iaTimeout); // Nettoyage si le composant se démonte
    }
},[currentJoueur]);

useEffect(() => {
  if (!currentTile) return;

  const key = `${currentTile.q},${currentTile.r},${currentTile.s}`;
  const newAvailable = [];

  // Parcourir toutes les tuiles pour trouver celles qui ont color=currentTile.color et symbol=currentTile.symbol
  grid.forEach((hex, hexKey) => {
    if (
      hexKey !== key && // exclure la tuile actuelle
      (hex.color === currentTile.color || hex.symbol === currentTile.symbol)
    ) {
      newAvailable.push(hexKey);
    }
  });
  if(newAvailable.length===0&&playersTile.length>0&&IATile.length>0){
    setMessage(!currentJoueur?"❌ Tu ne peux plus jouer ! Tu as perdu":"🤖 L'IA ne peut plus jouer ! Tu as gagné");
     setScore(currentJoueur?playersTile.length*2:playersTile.length);
          setGameOver(true);
          return;
  }
  setAvailableKeys(newAvailable);
  setCurrentJoueur((prev) => !prev);
}, [currentTile]);

        // 4. Effet pour mesurer le conteneur et mettre à jour la taille du Stage
        useEffect(() => {
          const checkSize = () => {
            if (containerRef.current) {
              setStageSize({
                width: containerRef.current.offsetWidth,
                height: containerRef.current.offsetHeight,
              });
            }
          };
      
          checkSize(); // Vérification initiale
      
          // On utilise un ResizeObserver pour détecter les changements de taille
          const resizeObserver = new ResizeObserver(checkSize);
          if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
          }
      
          // Nettoyage au démontage
          return () => resizeObserver.disconnect();
        }, []); // Se lance une fois au montage
         const stageCenter = {
    x: stageSize.width / 2,
    y: stageSize.height / 2,
  };
  if (stageSize.width === 0 || stageSize.height === 0) {
  return <div ref={containerRef} style={{ width: '100%', height: '100%', backgroundColor: '#eee' }} />;
}

   return (
      // Ce div est le conteneur que nous mesurons
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%', backgroundColor: '#333' }}
      >
         <GameOver open={gameOver} gameName="Kamon" score={score} handleClose={() => { setGameOver(false) }}
          handleRestart={reset} />
        {message&&<Box sx={{position:'absolute',zIndex:2,top:100,left:20,p:2, backgroundColor:'#FF4'}}>
            <Typography variant="h6">{message}</Typography></Box>}
              
                 <Stage width={stageSize.width} height={stageSize.height} draggable={!isMobile}>
          {/* On décale le Layer pour que l'hex (0,0) soit au centre */}
          <Layer x={stageCenter.x} y={stageCenter.y}>
            {Array.from(grid.entries()).map(([key, hex]) => {
                  const { x, y } = axialToPixel(hex.q, hex.r, HEX_SIZE);
               return   <KamonTile key={key}
                                  sides={6}
                               hex={{ ...hex, x, y }}
                                size={HEX_SIZE}
                                onClick={() => handleClick(hex, key)}
                                 isCurrent={currentTile === hex}
                                 belongTo={playersTile.includes(key) ? 'player' : IATile.includes(key) ? 'ia' : null}   
                                 isAvailable={availableKeys.includes(key)||(playersTile.length==0&&(Math.abs(hex.q)===3||Math.abs(hex.r)===3||Math.abs(hex.s)===3))}
                                />
            })}
          </Layer>
        </Stage>
         <OnBoardingStep stepId="intro1"
           message="Ton but est de relier un bord a l'autre ou d'empecher ton adversaire de jouer" >
        
        </OnBoardingStep>
        <OnBoardingStep stepId="intro2" condition={currentTile!=null}
           message="Tu ne peux selectionner que des tuiles de la meme couleur ou ayant le meme symbole que la tuile courante (entouree en rouge)" >
      
           </OnBoardingStep>
           
      </div>
    );
}

export default KamonBoard;