import { Avatar, Box, Button, Card, CardActions, CardContent, CardHeader, CardMedia, Grid, Typography } from "@mui/material"
import React, { useEffect, useMemo, useState } from "react";
import pierreImg from './images/pierre.png';
import feuilleImg from './images/feuille.png';
import ciseauImg from './images/ciseaux.png';
import avatarVous from './images/avatarVous.png';
import avatarIA from './images/avatarIA.png';
import lizardSpock from './images/lezardPock.jpg';
import lezardImg from './images/lezard.png';
import spockImg from './images/spock.jpg';
import pasBon from '../bitLife/images/png/69dos.jpg';

const imgHeight=300;

const CFM = {
    pierre: {
        label: 'Pierre', img: pierreImg
    },
    feuille: {
        label: 'Feuille', img: feuilleImg
    },
    ciseau: {
        label: 'Ciseaux', img: ciseauImg
    }
};
const CFMSpock = Object.assign({ lezard: {
    label: 'Lézard', img: lezardImg
}, spock: {
    label: 'Spock', img: spockImg
}}, CFM)

const gainMatrixClassique = {
    pierre: { feuille: -1, pierre: 0, ciseau: 1 },
    feuille: { feuille: 0, pierre: 1, ciseau: -1 },
    ciseau: { feuille: 1, pierre: -1, ciseau: 0 },
};

const gainMatrixSpock = {
    pierre: { feuille: -1, pierre: 0, ciseau: 1, lezard:1, spock:-1 },
    feuille: { feuille: 0, pierre: 1, ciseau: -1 , lezard:-1, spock:1},
    ciseau: { feuille: 1, pierre: -1, ciseau: 0 , lezard:1, spock:-1},
    lezard:{feuille: 1, pierre: -1, ciseau: -1 , lezard:0, spock:1},
    spock:{feuille: -1, pierre: 1, ciseau: 1 , lezard:1, spock:0},
};
function resolveDuel(playerChoice, iaChoice, gainMatrix) {
    
    const playerGain = gainMatrix[playerChoice][iaChoice];
    if (playerGain === 1) {
        return 'Victoire';
    } else if (playerGain === -1) {
        return 'Défaite';
    } else {
        return 'Égalité';
    }
}
const randomChoix = (mode) => {
    const keys = Object.keys(mode);
    const randomIdx = Math.floor(Math.random() * keys.length);
    return keys[randomIdx];
}
const getMatrix = cfm=>{
    if(Object.keys(cfm).length===3)
        return gainMatrixClassique;
    if(Object.keys(cfm).length===5)
        return gainMatrixSpock;
    return null;
}
const ChiFuMi = ({onFinish}) => {
    const [playerChoice, setPlayerChoice] = useState();
    const [iaChoice, setIAChoice] = useState();
    const [modeDeJeu, setModeDeJeu] = useState(CFM);
    const [msg, setMsg] = useState();
    const [scoreJoueur, setScoreJoueur] = useState(0);
    const [scoreIA, setScoreIA] = useState(0);

    const imageJoueur = useMemo(() => {
        if(playerChoice==null)
            return null;
        return modeDeJeu[playerChoice].img;
    }, [playerChoice]);
    const imageIA = useMemo(() => {
        if(iaChoice==null)
            return null;
        return modeDeJeu[iaChoice].img;
    }, [iaChoice]);
    const joue = choix => {
        setPlayerChoice(choix);
        setIAChoice(randomChoix(modeDeJeu));
    }
    useEffect(()=>{
        if(iaChoice!=null && playerChoice!=null){
            const res = resolveDuel(playerChoice, iaChoice, getMatrix(modeDeJeu));
            setMsg(res);
            if(typeof onFinish ==='function')
                onFinish(res.startsWith('V'));
            if(res.startsWith('V')) //Victoire
                setScoreJoueur(s=>(s+1));
            if(res.startsWith('D')) //Defaite
                setScoreIA(s=>(s+1));
            
        }
    },[iaChoice,playerChoice,modeDeJeu]);
const msgColor = useMemo(()=>{
    if(msg==null)
        return '#FFF';
    if(msg.startsWith('D'))
        return '#F9aF7f';
    if(msg.startsWith('V'))
        return '#39FF7f';
    else //egalite
        return '#eea'
}, [msg]);
    return <Box sx={{overflow:'auto', height:"100%"}}>
        
    <Box sx={{display:'flex'}}>

        <Card sx={{flex:1}}>
            <CardHeader title="Vous" 
            subheader={'Score '+scoreJoueur}
            avatar={<Avatar src={avatarVous}/>}/>
            { (onFinish == null) && playerChoice != null && <Box sx={{height:imgHeight
            ,backgroundSize:'contain', backgroundRepeat:'no-repeat', backgroundPositionX:'50%',
             backgroundImage:`url(${imageJoueur})`}}/>}
            <CardContent sx={{fontSize:24, backgroundColor:msgColor}}>{msg}</CardContent>
            <CardActions sx={{display:'flex', justifyContent:'space-around', flexWrap:'wrap'}}>
                {Object.keys(modeDeJeu).map((pr, pridx) => {
                    return <Grid key={pridx} item xs={4} >
                        <Button onClick={() => { joue(pr) }}
                            variant="contained" color="primary">
                            {modeDeJeu[pr].label}
                        </Button>
                    </Grid>
                })}
            </CardActions>
        </Card>


        <Card  sx={{flex:1}}>
            <CardHeader title="Votre adversaire" 
            subheader={'Score '+scoreIA}
             avatar={<Avatar src={avatarIA}/>}/>
            {iaChoice != null && <Box sx={{height:imgHeight
            ,backgroundSize:'contain', backgroundRepeat:'no-repeat', backgroundPositionX:'50%',
             backgroundImage:`url(${imageIA})`}}/>
               }
        </Card>

    </Box>
                <Box sx={{display:'flex', flexDirection:'column', alignItems:'center'}} 
                onClick={()=>{setModeDeJeu(CFMSpock)}}>
                    <Typography color="primary">Jouer au mode Lezard-Spock</Typography>
              <img alt="spok" src={lizardSpock} height={300}/>
                </Box>
    </Box>

}
export default ChiFuMi