

import React, { useCallback, useMemo } from "react";
import { useSB } from "./SmartBactContext";

import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, List, ListItem, ListItemIcon, ListItemText, Slider, Typography } from "@mui/material";


import bact3 from './images/bact3.png';
import bact4 from './images/bact4.png';
import bactRouge from './images/bactRouge.png';
import { makeStyles } from "@mui/styles";

import { ActionCouts, RappelRessources } from "./RucheDialog";
import { Add, SwitchAccessShortcutAdd } from "@mui/icons-material";

const useStyles = makeStyles((theme) => ({
    dialogContent: {
        padding: theme.spacing(4),
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', // Effet d'ombre pour un look plus moderne
    },
    title: {
        marginBottom: theme.spacing(3),
    },
    list: {
        marginBottom: theme.spacing(3),
        padding: theme.spacing(2),
        borderRadius: '8px',
    },
    listItem: {
        padding: theme.spacing(1),
        borderBottom: '1px solid #ffe082',
    },
    button: {
        backgroundColor: '#ffca28',
        color: '#fff',
        fontWeight: 'bold',
        '&:hover': {
            backgroundColor: '#ffa000',
        },
    },
    gridContainer: {
        marginTop: theme.spacing(3),
    },
}));

const Centre={
    'Agro':{
        nom:'Centre agronomique'
         , teinte:'#c5e8af'
        , description:'Permet d\'augmenter les ressources produites'
        , skills:[{field:'numGrass', couts:{bois:50, charbon:50}
            , step:1, max:20
        }]
    }
    , 'Sport':{
        nom:'Centre de fitness' 
        , teinte:'#ffb3a2'
        , description:'Permet de faire monter la force (prendre plus de ressources en une fois) et la vitesse de deplacement'
        , skills:[{field:'force', couts:{bois:20, herbe:20}
            , step:5
            , max:100}
            ,{field:'vitesse', couts:{herbe:50, acier:50}
            , step:0.1
            , max:5}]
    }
    ,
    'Recherche':{
        nom:'Centre de recherche genetique'
        , teinte:'#9fe1f2'
        , description:'Permet de faire monter le champ de vision et le stock maximum qu\'elles peuvent porter'
        , skills:[{
            field:'champVision'
            , couts:{herbe:20, charbon:20}
            , step:10
            , max:400
        }
        ,{field:'stockMax', couts:{charbon:20, bois:20}
            , step:5
            , max:1000}]
    }, 'Beaute':{
        nom:'Centre de soins esthetiques'
         , teinte:'#fec5f0'
        , description:'Permet de changer de skin'
        , skills:[{field:'customSkin'
                , couts:{charbon:50, acier:150}
                , choice:[bact3,bact4,bactRouge]
            }]
    }
}
/**
 * Recherche:permet de monter champVision, stockMax
 * Agro:augmente production ressource
 * Beaute:changer de skin
 * Sport:permet de monter la force et la vitesse
 * 
 * autre idee: baisser l'energie quand elle ramassent, a 0 elles meurent
 */
const CentreDialog = ({ centre, ...props }) => {
    
    const centreObj = Centre[centre];
    const classes = useStyles();
    return <Dialog {...props} >
        <DialogTitle sx={{backgroundColor:centreObj.teinte}}>{centreObj.nom}</DialogTitle>
        <DialogContent  sx={{backgroundColor:centreObj.teinte, opacity:0.7}}>
            <Typography variant="body2" component="div" align="center" className={classes.title}>
               {centreObj.description}
            </Typography>

            {centreObj.skills.map((skill,dkidx)=>{
               return  <SkillChanger key={dkidx} {...skill}/>
            })}
        </DialogContent>
        <DialogActions sx={{justifyContent:'space-between',backgroundColor:centreObj.teinte}}>

        <RappelRessources/>
            <Button onClick={props.onClose} color="primary">
                Fermer
            </Button>
            {/* Boutons pour les actions */}
        </DialogActions>
    </Dialog>
}
export default CentreDialog;

const SkillChanger = ({field, ...skill}) => {
// skill contain field
const {getSkill, setSkill, achete, setMessage} = useSB();
const [skillValue, fieldLabel]=useMemo(()=>{
const sk = getSkill();
const skillLabel={champVision:'Champ de vision'
    , numGrass:'Nombre de ressources maximales presentes'
    , force:'Force'
    , vitesse:'Vitesse'
    , customSkin:'Choisir une skin'
    , stockMax:'Capacité de porter'
}
let sv=null;let lbl='';
if(sk!=null)
    {
        sv = sk[field];
        lbl=skillLabel[field]||'inconnu'
    }
return [sv,lbl];
},[getSkill, field]);
const addToSkill = useCallback(()=>{
    const isOK = achete({ ...skill.couts });
    if (!isOK)
        setMessage('Pas assez de ressources !');
    else
        setSkill(field, skillValue+skill.step);
},[achete,field,skillValue]);


    return <Box sx={{display:'flex', gap:2}}>
        <Typography variant="h6" sx={{textWrap:'nowrap'}}>{fieldLabel}</Typography>
        <Typography variant="h5" sx={{width:'100%'}}>{isNaN(skillValue)?skillValue:skillValue.toFixed(1)}</Typography>
       {skill.max&& // this exclude ressource et customSkin
        <IconButton disabled={skillValue>=skill.max}
        onClick={addToSkill}>
            <SwitchAccessShortcutAdd sx={{color:"#3333ff"}}/>
        </IconButton> }   
        {skill.choice && <Box display="flex">
            {skill.choice.map((choix,idx)=>{
                return <Button key={idx}
                     onClick={()=>{setSkill(field,choix)}}>
                        <img height={20} src={choix} alt="choix"/>
                     </Button>
            })}
            {skill.cancel&& <Button
                     onClick={()=>{setSkill(field,null)}}>Enleve</Button>}
            </Box>}
        <ActionCouts couts={skill.couts}/>
       

    </Box>
}