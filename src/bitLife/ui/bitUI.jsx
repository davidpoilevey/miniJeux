import React, { useCallback, useEffect, useState } from "react";
import { AppBar, Box, CssBaseline, Grow, IconButton, List, ListItem, ListItemText, Slide, Toolbar, Typography, useTheme } from '@mui/material';
import { Menu } from "@mui/icons-material";

import { useEvents } from "../events/Evenements";
import { usePerso } from "../personnages/BitLife";
import BitContent from "./BitContent";
import ButtonDPY from "./ButtonDPY";
import JoueurCard from "./JoueurCard";
import { MessageAccueil } from "../events/MessageAccueil";
import StatComponent from "../utils/StatComponent";
import { PersonneButton } from "./PersonneCard";
import LieuBox from "./LieuDrawer";
import { PersoMenu } from "../personnages/PersoMenu";

const BitUI = () => {

  
  const [lieu, setLieu] = useState('maison');
  
  const theme = useTheme();
  const [historiqIn, sethistoriqIn] = useState(false);
  const [persoMenuOpen, setPersoMenuOpen] = useState(false);

  const ref = React.useRef();
  const { perso, useLieu , historique, addLog} = usePerso();
  const { evenementAleatoireAnnee , simpleMessage} = useEvents();
  const lastPeriode=React.useRef();
  const periode = perso.getAgePeriode();
  useEffect(()=>{

    if(periode!==lastPeriode.current){
      lastPeriode.current = periode;
      let msg = "";
      if(periode==='adulescent'&&perso.perso.caractere.intelligent>30){

        perso.perso.diplomes.push('bac');
        msg="Felicitations vous avez obtenu le baccalaureat. Vous pouvez aller a la fac et choisir une specialité";
      }
      if(periode==='adulte'&&perso.perso.diplomes.find(d=>d.indexOf("Etudes")>=0)){
        const spe = perso.perso.diplomes.find(d=>d.indexOf("Etudes")>=0)
        const speNom = spe.substring(7);
        if(perso.perso.caractere.intelligent>66)
          {
            msg="Felicitations vous avez obtenu votre diplome en "+speNom+".";
            perso.perso.diplomes.push(speNom);
          }
        else
          msg="Malheureusement vos etudes se sont terminees sur un echec, vous etes trop cons, changez de voie. Vous n'etes pas fait pour le "+speNom+".";
      }
      
      msg=msg+'\n'+  MessageAccueil[periode];
      simpleMessage(msg);
    }
  },[periode]);
  const nvelleAnnee = useCallback(() => {
    
    
    perso.prendDeLage();
    let onFaitLeBilan="Bon anniversaire, vous avez "+perso.perso.etatCivil.age+" ans"
    if(perso.perso.enceinte)
      onFaitLeBilan+=('\n'+perso.pondUnDChiard({}));
    if(periode==='adulte'||periode==='adulescent')
      onFaitLeBilan+=(' '+perso.bilanFinancier());
    onFaitLeBilan+=(perso.perteDamis());

    // if annee speciale (passage d'agePeriode), une alerte pour dire ce qu'il y a de nouveau
   simpleMessage(onFaitLeBilan);
    if(periode===lastPeriode.current)
      evenementAleatoireAnnee(perso.getAgePeriode());
     
    
  }, [periode, perso, simpleMessage]);
  const lieuObj = useLieu(lieu);

  
  

  if(perso==null||lieuObj==null)
    return <div>Loading...</div>
  return <Box sx={{ pb: 7 ,height:'100%', backgroundColor:theme.palette.background.default}} ref={ref}>
    <CssBaseline />
        <AppBar position="static" >
        <Toolbar sx={{backgroundColor:lieuObj.color}}>
          <IconButton            size="large"            edge="start"            sx={{ mr: 2 }}
          onClick={evt=>{ sethistoriqIn(!historiqIn)} } >
            <Menu />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" >
            {lieuObj.titre}
          </Typography>
          {lieuObj.metier!=null&&
            <><Typography variant="body1">
            {lieuObj.metier.nomSociete}
          </Typography>
          <Typography variant="caption">
            {perso.perso.titre}
          </Typography></>
          }
          </Box>
          <LieuBox agePeriode={periode} setLieu={setLieu} lieu={lieu} />
          <ButtonDPY type="bonneAnnee" sx={{flex:1,backgroundColor:theme.palette.primary.main, color:theme.palette.text.primary}} 
            onClick={nvelleAnnee}>Bonne annee</ButtonDPY>
          <PersonneButton perso={perso}  sx={{ flexGrow: 1 }} onClick={setPersoMenuOpen}/>
          <PersoMenu open={persoMenuOpen} perso={perso}/>
        </Toolbar>
      </AppBar>

    {/* <JoueurCard perso={perso}/> */}
    

    <Box sx={{display:'flex',height:'100%',gap:'5px'}}>
      <Slide in={historiqIn} direction="right" unmountOnExit>
      <List sx={{flex:1, overflow:'auto', backgroundColor:theme.palette.background.paper}}>
        <Typography variant="h6" color="primary">Historique</Typography>
        {historique.map(((message, index) => (
          <ListItem key={index} sx={{color:theme.palette.text.secondary, backgroundColor:theme.palette.background.default, margin:'3px', border:'1px solid lightgray', borderRadius:'10px'}}>
            <ListItemText primary={message} />
          </ListItem>
        )))}
      </List>
      </Slide>
      <Box sx={{flex:5,overflow:'auto'}}>
        <BitContent perso={perso} lieuObj={lieuObj}/>
      </Box>
      <StatComponent persoData={perso.perso} isJoueur />
    </Box>
   
   
    {/* <LieuDrawer open={lieuxDrawerOpen} agePeriode={perso.getAgePeriode()} setLieu={setLieu} lieu={lieu} onClose={evt => { setLieuxDrawerOpen(false) }} />
    */}
    
  </Box>
}

export default BitUI;