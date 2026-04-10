import { Avatar, Box, Paper, Typography } from "@mui/material";
import React from "react";
import Player7Card from "./Player7Card";
import OtherPlayer from "./OtherPlayer";

export const PlayerSet=({joueur={cartes:[]}, encoreCarte})=>{

    const clickOnCard=c=>{
        if(c.type==='stop'||c.type==='3cartes'){
            encoreCarte(c);
        }
    }
    return <Box sx={{display:'flex'}}>
         {joueur.deadReason && <Box
          sx={{
            position: "absolute",
            top: "50%",            left: "50%",
            transform: "translate(-50%, -50%) rotate(-15deg)",
            bgcolor: "rgba(200,0,0,0.85)",
            color: "#fff",            fontWeight: "bold",
            fontSize: 28,            px: 4,    py: 1,
            borderRadius: 2,            boxShadow: "0 4px 24px #0006",            zIndex: 10,
            textTransform: "uppercase",
            letterSpacing: 2,            border: "3px solid #fff",
            opacity: 0.92,            pointerEvents: "none",
            fontFamily: '"Oswald", "Arial Black", Arial, sans-serif',
            textAlign: "center",
            userSelect: "none",
          }}
        >
          {joueur.deadReason}
        </Box>}
        
{joueur.cartes.map((c,idx)=>{
    return <Player7Card  key={'scw'+idx} carte={c}
    onClick={()=>{clickOnCard(c)}}/>
})}
    </Box>
}

export const OtherPlayerGrid = ({joueurs=[]})=>{
    return <Box sx={{display:'flex', width:'100%', justifyContent:'space-evenly'}}>
        {joueurs.map(j=>{
            return <OtherPlayer key={'op'+j.name} joueur={j}/>
        })}
    </Box>
}
