import { FilterHdr, Forest, Grass, OutdoorGrill } from "@mui/icons-material"
import { Box, Typography } from "@mui/material"
import React from "react";
import bois from './images/bois.png';
import charbon from './images/charbon.png';
import herbe from './images/herbe.png';
import acier from './images/acier.png';
import errorImg from './images/bactRouge.png';



export const RSRC={
    'herbe':{
        icon:Grass
        , reserveBase:20
        , niveau:0
        , weight:60
        , color:'#88ff88'
    }, 'bois':{
        icon:Forest
        , reserveBase:50
        , niveau:0
        , weight:35
        , color:'#882220'
    }, 'charbon':{
        icon:OutdoorGrill
        , reserveBase:80
        , niveau:1
        , weight:8.5
        , color:'#000000'
    }, 'acier':{
        icon:FilterHdr
        , reserveBase:120
        , weight:2
        , niveau:2
        , color:'#0010a3'
    }
}

const Ball = ({color, children})=>{
return <Box sx={{
    width: '4px',
  height: '4px',
  borderRadius: '50%',
  backgroundColor: color||'darkblue',
  margin: '1px'
  }}>{children}</Box>
}
 

const BallStack = ({sur, color, reserve }) => {
    const balls = [];
    // step est genre 2 quand sur est 50 et 10 quand sur est 200
    const step = Math.round(sur/10);
    for (let i = 0; i < reserve; i+=step) {
      balls.push(<Ball key={i} color={color}/>);
    }
  
    return (
      <div style={{
        display: 'flex',
        maxWidth:50,
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {balls}
      </div>
    );
  };
export const SBRessource = React.forwardRef(({ressource, ...props}, ref)=>{
    const {position, type, reserve} = ressource;
    const RS = RSRC[type];
    let imgRess=null;
    switch(type){
        case 'herbe':imgRess=herbe;break;
        case 'acier':imgRess=acier;break;
        case 'bois':imgRess=bois;break;
        case 'charbon':imgRess=charbon;break;
        default:imgRess=errorImg
    }
  
    
    return  <Box sx={{ position: 'absolute', top: position.y, left: position.x }}>
    <div style={{
        width: 40,
        height: 40,
        borderRadius: '50%', // Pour une forme circulaire
        overflow: 'hidden',
        position: 'relative'
    }}>
        <img src={imgRess} alt={type} width={40} height={40} />
    </div>
    <BallStack reserve={reserve} sur={RS.reserveBase} color={RS.color}/>
</Box>
})