import React, { useState, useEffect, useCallback, useContext } from "react";
import imgBateau from "./bateau.png";
import { Box } from "@mui/material";
import { SonarContext } from "./SonarProvider";

const Bateau = ({bounding, trySonar, peche}) => {
  const [posLeft, setPosLeft] = useState(400);
  const [posTop, setPosTop] = useState(400);
  const [limit, setLimit] = useState(400);
  
  const {  boatSpeed } = useContext(SonarContext);
  


  const doAction = useCallback(action=>{
    switch (action) {
        case "ArrowUp":
            if(posTop<0)
            setPosTop((prevTop) => prevTop + boatSpeed);
            else
          setPosTop((prevTop) => prevTop - boatSpeed);
          break;
        case "ArrowDown":

        if(posTop>limit.bottom)
        setPosTop((prevTop) => prevTop - boatSpeed);
        else
          setPosTop((prevTop) => prevTop + boatSpeed);
          break;
        case "ArrowLeft":
            if(posLeft<0)
            setPosLeft((prevTop) => prevTop + boatSpeed);
            else
          setPosLeft((prevLeft) => prevLeft - boatSpeed);
          break;
        case "ArrowRight":
            if(posLeft>(limit.right))
            setPosLeft((prevTop) => prevTop - boatSpeed);
            else
          setPosLeft((prevLeft) => prevLeft + boatSpeed);
          break;
        case "Enter":
            peche({x:posLeft+40,y:posTop+40});
            break;
        case " ":
            trySonar({x:posLeft+40,y:posTop+40});
        default:
          break;
      }
  },[limit, posLeft, posTop, trySonar]);

  useEffect(() => {
    if(bounding==null)
    return;
    const limits = bounding.getBoundingClientRect();
    setLimit(limits);

  }, [bounding]);
  useEffect(() => {
   
    const handleKeyDown = (event) => {
     doAction(event.key);
    };

    // Ajouter le gestionnaire d'événements sur l'élément window
    window.addEventListener("keydown", handleKeyDown);

    // Nettoyage du gestionnaire d'événements lors du démontage du composant
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [ doAction]);

  return (
    <Box sx={{ position: "absolute", top: posTop, left: posLeft }}>
      <img src={imgBateau} alt="bateau" />
    </Box>
  );
};

export default Bateau;
