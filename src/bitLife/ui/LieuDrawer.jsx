
import { Avatar, Box, List, ListItem, Menu, Typography } from "@mui/material";
import React from "react";
import { usePerso } from "../personnages/BitLife";
import ButtonDPY from "./ButtonDPY";
import { green } from "@mui/material/colors";
import { useTheme } from "@emotion/react";


const LieuBox = ({ lieu, setLieu, agePeriode}) => {
  const { lieux } = usePerso();
  const theme = useTheme();
  const plieux = [];
  for (let l in lieux) {
    if (lieux[l].ageLimited == null || lieux[l].ageLimited.indexOf(agePeriode)>=0)
      plieux.push(lieux[l]);
  }
  return ( <Box sx={{display:'flex',flexDirection:'row',gap:'2px',padding:'2px',flex:1}}>
    
  
        {plieux.map(l => {
          return <Box sx={{ bgcolor: l.color, border:l.type===lieu?'5px solid '+theme.palette.primary.dark:null 
          , borderRadius:'10px',width:'80px',justifyContent:'center',alignItems:'center',flexDirection:'column',display:'flex',cursor:'pointer'}}
          onClick={evt => { setLieu(l.type) }} key={l.titre} >
             <l.Icon sx={{color:theme.palette.text.primary}}/>
             {l.type}
          </Box>
          // return <Avatar size="large" sx={{ bgcolor: l.color, border:l.type===lieu?'5px solid '+theme.palette.primary.dark:null }} 
          // onClick={evt => { setLieu(l.type) }} key={l.titre}>
          //       <l.Icon sx={{color:theme.palette.text.primary}}/>
          
          // </Avatar>
        })}

      </Box>
  );
};

export default LieuBox