import { Box, Grid, List, ListItem } from "@mui/material";
import React from "react";
import { PersoProvider, usePerso } from "./PersoProvider";
import { LieuxProvider } from "./LieuxProvider";
import { FFMap } from "./FFMap";
import { LogProvider, useLog } from "./LogProvider";
import FeuillePerso from "./FeuillePerso";

import imgParchemin from './images/parchemin.jpg';

const FinalFantasy10 = ()=>{

    return <Box style={{display:'flex', height:'100%'}}>
        <LogProvider>
    <LieuxProvider>
        <PersoProvider>
                <FFMap/>
            <FFFiche/>
        </PersoProvider>
            </LieuxProvider>
            </LogProvider>
    </Box>
}
export default FinalFantasy10;

export const parcheminStyle = {backgroundImage:`url(${imgParchemin})`, backgroundSize:'cover'}
const FFFiche=()=>{
const {log} = useLog();
    return <Box style={{flex:1, height:'100%', display:'flex', ...parcheminStyle}}>
        <List sx={{overflow:'auto',flex:1}}>
           {log.map((l,lidx)=>{
            return <ListItem key={lidx}>{l}</ListItem>
           })}
        </List>
        <FeuillePerso/>
    </Box>
}
