import React, { useEffect, useState } from "react"
import { Avatar, Box, Button, Card, CardActions, CardContent, CardHeader, List, ListItem, Typography } from "@mui/material"
import { usePerso } from "./PersoProvider"

import imgRat from './images/rat.png';
import { useLog } from "./LogProvider";
import { Loot } from "./LootItems";
import { makeStyles } from "@mui/styles";
import imgParchemin from './images/parchemin.jpg';

export const Ennemis = {
    vieuxRat: {
        image: imgRat, nom: "Vieux rat"
        , attaque: 1, vie: 2, initiative: 2
        , loot: [Loot.get('queueDeRat'), Loot.get('or',2)]
    }
    , mac:{
        image:'https://static.vecteezy.com/ti/vecteur-libre/p3/26575302-stereotype-masculin-brute-franchi-mains-sur-poitrine-avec-une-mine-renfrognee-et-une-cruel-petit-sourire-satisfait-plat-style-vecteur-illustration-bodybuilder-avec-portant-une-rouge-t-chemise-et-une-noir-chapeau-stock-vecteur-image-vectoriel.jpg'
        , nom:"Brute de macquereau"
        , attaque:5, vie:10, initiative:2
        , loot:[Loot.get('passportFille'), Loot.get('or',200)]
    }
    , garde:{
        image:'https://us.123rf.com/450wm/classicvector/classicvector2007/classicvector200700257/152060199-chevalier-arm%C3%A9-m%C3%A9di%C3%A9val-garde-homme-prot%C3%A9geant-le-ch%C3%A2teau-armure-gardant-un-personnage-masculin.jpg'
        , nom:"Garde du chateau"
        , attaque:3, vie:10, initiative:3
        , loot:[ Loot.get('or',10)]
    }
}


export const CombatZone = ({ ennemis, onDone }) => {
    const { addPossession, perso, addDegats } = usePerso();
    const [localEnnemis, setLocalEnnemis] = useState(ennemis);
    const {addLog} = useLog();
    useEffect(() => {
        if (localEnnemis.length == 0)
            onDone();
    }, [localEnnemis]);
    const ennemiDone = (nmi) => {
        if (nmi == null)//fuite
            {
                addLog("Vous fuyez le combat lachement");
                return onDone();
            }
            addLog("Vous tuez "+nmi.nom);
            if (nmi?.loot != null)
               {
                addPossession(Loot.toPossession(nmi.loot));
                addLog("Vous recuperez "+Loot.toString(nmi.loot));
               } 

        setLocalEnnemis(oldNmis => {
            const newList = [...oldNmis];
            const nmiIdx = oldNmis.indexOf(nmi);
            if (nmiIdx >= 0)
                newList.splice(nmiIdx, 1);
            return newList;
        })
    }
    return <Box>
        {localEnnemis.map((ennemi, eidx) => {
            return <Ennemi ennemi={ennemi} key={eidx}
                perso={perso} persoDegats={addDegats}
                battu={ennemiDone} />
        })}

    </Box>
}


const useStyles = makeStyles((theme) => ({
    card: {
      maxWidth: 400,
      margin: '10px',
      backgroundSize:'cover',
      backgroundImage: `url(${imgParchemin})`,
    },
    header: {
      backgroundColor: 'rgba(255,0,20,0.4)',
    },
    actions: {
      justifyContent: 'space-between',
    },
    button: {
      backgroundColor: theme.palette.secondary.main,
      color: theme.palette.secondary.contrastText,
      '&:hover': {
        backgroundColor: theme.palette.secondary.dark,
      },
    },
  }));
const Ennemi = ({ ennemi, battu, perso, persoDegats }) => {
    // ennemi = {nom, image, vie, attaque, initiative, loot}
    const [nmiActions, setActions] = useState([]);
    const [vieNmi, setvieNmi] = useState(ennemi.vie);
    const [tourJoueur, setTourJoueur] = useState(perso.initiative ?? 0 > ennemi.initiative ?? 0);
    useEffect(() => {
        if (vieNmi <= 0)
            battu(ennemi);
    }, [vieNmi]);

  
    useEffect(()=>{
          // Fonction pour gérer l'attaque de l'ennemi
          let tid=null
        const attaquerEnnemi = () => {
            const degatsEnnemi = ennemi.attaque
            persoDegats(degatsEnnemi);
            setActions((prevActions) => [...prevActions, `${ennemi.nom} vous inflige ${degatsEnnemi} points de dégâts !`]);
            setTourJoueur(true); // Passer le tour au joueur
        };
        if(!tourJoueur)
        tid = setTimeout(attaquerEnnemi, 1000);
    return ()=>{
        if(tid!=null)
        clearTimeout(tid);
    }
        
    },[tourJoueur]);

    const attaquer = () => {
        const degats = perso.attaque;
        setvieNmi((prevVie) => prevVie - degats);
        setActions((prevActions) => [...prevActions, `Vous infligez ${degats} points de dégâts !`]);
        setTourJoueur(false); // Passer le tour à l'ennemi
    };
const otherOptions=[];
    const fuir = () => {
        battu();//=victoire sans loot
    }
    const classes = useStyles();
    return  (
        <Card className={classes.card}>
          <CardHeader
            className={classes.header}
            avatar={ennemi.image != null && <Avatar src={ennemi.image} />}
            title="Combat"
            subheader={`Contre ${ennemi.nom}`}
          />
          <CardContent>
            <List>
              {nmiActions.map((ax, idx) => (
                <ListItem key={idx}>
                  <Typography variant="body2">{ax}</Typography>
                </ListItem>
              ))}
            </List>
          </CardContent>
          <CardActions className={classes.actions}>
            {tourJoueur && (
              <Button onClick={attaquer} className={classes.button} disabled={!tourJoueur}>
                Attaquer
              </Button>
            )}
            {tourJoueur && (
              <Button onClick={fuir} className={classes.button} disabled={!tourJoueur}>
                Fuir
              </Button>
            )}
            {otherOptions.map((opt, idx) => (
              <Button key={idx} onClick={opt.action} className={classes.button}>
                {opt.label}
              </Button>
            ))}
          </CardActions>
        </Card>
      );
}