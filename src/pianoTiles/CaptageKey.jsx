import { Box, Typography } from "@mui/material";
import React, { useMemo } from "react";
import { HAUTEUR, NOTE_HEIGHT } from "./PianoContext";

export const CaptageKey = ({effet, touche})=>{

    const borderStyle = useMemo(()=>{
        if(effet==null)
            return {border:'2px solid black'};
        else if(effet==='effetRate'){
            return {border: '3px dashed red', boxShadow: '0px 0px 5px red'}
        }
        else if(effet==='effetNaze'){
            return {border: '5px ridge orange', boxShadow: '0px 0px 8px yellow'}
        }
        else if(effet==='effetBon'){
            return {border: '10px double green', boxShadow: '0px 2px 10px green'}
        }
        else if(effet==='effetPerfect'){
            return {border: '6px dashed #508dd1'
               , filter:'drop-shadow(5px 4px 17px blue)', background: 'linear-gradient(0, #44aef4, #ddeef8)'}
        }

    },[effet]);
    return <Box sx={{
        position: 'absolute', left: 0, top: HAUTEUR, right:0 ,boxSizing:'border-box'
        , textTransform:'capitalize', textAlign:'center', zIndex:2
         , height: NOTE_HEIGHT + 'px'
        , ...borderStyle
       
    }}>
        {/* Boite a capter */}
        <Typography variant="h5">{touche}</Typography></Box>
}


