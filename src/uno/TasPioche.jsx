import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Carte from "./Carte";
import dosCarte from './dosdecarte.jpg';
import { Box, Typography } from "@mui/material";
import './pioche.css';

const useStyles = makeStyles((theme) => ({
  tas: {
    left:'-10px',
    position: "relative",
    display: "inline-block",
  },
  pioche: {
    left:'100px',
    height:'100px',
    width:'60px',
    position: "relative",
    display: "inline-block",
        background: `url(${dosCarte})`, // Remplacez 'chemin/vers/texture.png' par le chemin de votre image de texture
        backgroundSize: '100% 100%',
      
  },
  carte: {
    position: "absolute",
    top: 0,
    left: 0,
    transform: (props) => `rotate(${props.rotation}deg)`,
    transition: "transform 0.3s ease",
    cursor: "pointer",
  },
}));

export const Tas = React.forwardRef(({ tas, cardEffect },ref) => {
  const classes = useStyles();
    const _tas = tas!=null&&tas.length>5?tas.splice(-5):tas;
    const lastCard = _tas!=null?_tas[tas.length-1]:{};
  return(
    <Box className={classes.tas} ref={ref}>
        {cardEffect && <CardEffect color={lastCard.color}>{cardEffect}</CardEffect>}
      {_tas!=null&&_tas.map((carte, index) => (
        <Box
          key={index}
          className={classes.carte}
          style={{ zIndex: index }}
        >
          <Carte  key={carte.id} carte={carte} carteValide={true}/>
        </Box>
      ))}
    </Box>
  );
});

export const Pioche = ({ pioche, onClick }) => {
    const classes = useStyles();
  
    return pioche==null?null:(
      <div className={classes.pioche} onClick={onClick}>
        
        
      </div>
    );
  };
  const CardEffect = ({classes,color, children})=>{
    
    return <Box className={'flash-text'}><span style={{textTransform:'capitalize',color:color}}>{children}</span></Box>
  }