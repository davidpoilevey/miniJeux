import React, { useEffect, useMemo, useState } from "react"
import { usePerso } from "./PersoProvider";
import { Box, Button, Typography } from "@mui/material";
import { parcheminStyle } from "./Entree";

const JetDeDes = ({jet, onDone})=>{
// jet is [attribut, difficulte, [reussite, echec]]
const [resultat, setResultat] = useState();
const [rolling, setRolling] = useState(false);
const {applyConsequence, perso} = usePerso();
const {attribut, difficulte, reussite, echec} = useMemo(()=>{
    if(jet==null||jet.length!=3)
        return {};
    const reussEchec = jet[2];
    return {attribut:jet[0], difficulte:jet[1]
    ,reussite : ()=>{
        applyConsequence(reussEchec[0]);
    }
    ,echec : ()=>{
        applyConsequence(reussEchec[1]);
    }}
},[jet,applyConsequence]);
useEffect(()=>{
    if(resultat){
        let doFunc = null;
        if((resultat+perso[attribut])<difficulte)
            doFunc = echec;
        else
            doFunc = reussite;
        setTimeout(doFunc, 1000);
    }
},[resultat])
const findResult = ()=>{
    setRolling(false);
    const de = Math.ceil(Math.random()*20);
    setResultat(de);
}
const lanceDes = ()=>{
    setRolling(true);
    setTimeout(findResult,1000);
}

return <Box style={{margin:'5px', ...parcheminStyle}}>
    <Typography variant="h6">Jet de {attribut}</Typography>
    <Typography variant="caption">Difficulté {difficulte}</Typography>
    <Box>
       {resultat==null?(rolling?<img src="https://art.ngfiles.com/images/1263000/1263935_machinakaisa_d20-go-speen.gif?f1588891364" height="100"/>
        :<img src="https://i.etsystatic.com/8800676/r/il/ddd626/3226445398/il_1588xN.3226445398_kul9.jpg" height="100"/>)
       :<Typography variant="h3">{resultat}</Typography>}
       <Button variant="contained" onClick={lanceDes}>Lance le dé</Button>
    </Box>
</Box>
}
export default JetDeDes;