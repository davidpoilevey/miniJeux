import React, { useMemo } from "react";
import { useStyles } from "./utils";
import { Box } from "@mui/material";
import Carte from "./Carte";

const Player = ({ player , playCarte, isCarteValid, isActif}) => {
  const classes = useStyles();
  const positionCls = useMemo(()=>{
    let posCls = '';

    switch (player.position) {
        case 'top':
          posCls = classes.topMiddle;
          break;
        case 'right':
          posCls = classes.middleRight;
          break;
        case 'bottom':
          posCls = classes.bottomMiddle;
          break;
        case 'left':
          posCls = classes.middleLeft;
          break;
        default:
          break;
      }
      return posCls;
  },[player.position])
  
  return <Box className={`${classes.playerCard} ${isActif?classes.playerCardActif:classes.playerCardInActif} ${positionCls}`}>
    <Box className={`${classes.playerNameCard}`}>{player.name}</Box>
    {player.cartes?.map((carte,idx)=>{
        return <Carte key={carte.id} carte={carte} index={idx} isHuman={player.isHuman}
        carteValide = {isCarteValid(carte)}
         onClick={evt=>{playCarte(evt,carte)}}/>
    })}
    </Box>;
};

export default Player;
