import { Box, Button, ButtonBase, Chip, Divider, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Stack, Typography } from "@mui/material"
import ProductionWidget from "../components/ProductionWidget"
import { Bolt, Clear, FireTruck, MoreVert, Pause, PlayArrow, Save, SaveAlt } from "@mui/icons-material"
import { useLab } from "../LabContext"
import { useEffect, useState } from "react"
import laboImg from '../images/labo.png';
import rechImg from '../images/recherche.png';
import marketImg from '../images/labMarket.png';

import AlertConsole from "../components/LabLogPopper"
import { OnBoardingStep } from "../../OnBoardingContext"

const BactIncBureau = ({tab, setTab, handleSelect})=>{
    const {labState, setLabState, saveLab, loadLab, clearLab} = useLab();
    useEffect(()=>{
      if(labState.nextDest!=null){
        if(labState.nextDest==='labo')
            setTab(0);
        if(labState.nextDest==='market')
            setTab(2);
        if(labState.nextDest==='recherche')
            setTab(1);
        setTimeout(()=>{
            //reset
            setLabState(ls=>({...ls, nextDest:null}))
        })
      }  
    },[labState.nextDest, tab])
   const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

const tabButtons = [
  { id: 0, label: "Laboratoire", img: laboImg, name:'labo' },
  { id: 1, label: "Recherche", img: rechImg , name:'recherche'},
  { id: 2, label: "Marché", img: marketImg , name:'market'},
];
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleCheat = () => {
    setLabState(prev => ({
      ...prev,
      resources: { ...prev.resources, credits:  1000 },
    }));
    handleMenuClose();
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: 250,
        gap: 3,
        overflow: "auto",
        backgroundColor: labState.paused
          ? "rgba(238, 76, 109, 0.67)"
          : "rgba(187, 245, 199, 0.3)",
      }}
    >
      <Box sx={{ display: "flex", m:1,p:1,justifyContent: "space-between", alignItems: "center"
        , borderRadius:3, background:'rgba(214, 129, 179, 0.43)'
       }}>
         <OnBoardingStep stepId="intro" 
          message="Bienvenue dans Bacteria Incorporation. Tu diriges un labo de recherche microbiologique. Dans le Menu a coté de ce titre, tu trouveras de quoi sauvegarder ta partie, faire pause ou un cheat code" >
        <Typography variant="h4">Bact. Inc.</Typography>

          </OnBoardingStep>
                  

        <IconButton onClick={handleMenuOpen}>
          <MoreVert />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              borderRadius: 2,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            },
          }}
        >
          <MenuItem onClick={() => { setLabState(ls => {
      return { ...ls, paused: !labState.paused }
    }); handleMenuClose(); }}>
            <ListItemIcon>
             <IconButton onClick={evt => {
   
  }}>
    {labState.paused ? <Pause color="error" /> : <PlayArrow color="success" />}
  </IconButton>
            </ListItemIcon>
            <ListItemText>{labState.paused ?'Reprendre':'Pause'}</ListItemText>
          </MenuItem>

          <Divider />

          <MenuItem onClick={() => { saveLab("manual"); handleMenuClose(); }}>
            <ListItemIcon>
              <SaveAlt fontSize="small" />
            </ListItemIcon>
            <ListItemText>Sauvegarder</ListItemText>
          </MenuItem>

          <MenuItem onClick={() => { loadLab(); handleMenuClose(); }}>
            <ListItemIcon>
              <FireTruck fontSize="small" />
            </ListItemIcon>
            <ListItemText>Charger</ListItemText>
          </MenuItem>

          <MenuItem onClick={() => { clearLab(); handleMenuClose(); }}>
            <ListItemIcon>
              <Clear fontSize="small" />
            </ListItemIcon>
            <ListItemText>Réinitialiser</ListItemText>
          </MenuItem>

          <Divider />

          <MenuItem onClick={handleCheat}>
            <ListItemIcon>
              <Bolt fontSize="small" sx={{ color: "gold" }} />
            </ListItemIcon>
            <ListItemText>Cheat Code (+1000 crédits)</ListItemText>
          </MenuItem>
        </Menu>
      </Box>
     <OnBoardingStep stepId="bonneChance" 
          message="Bonne chance , surveillez bien vos reacteurs et vos souches, tout s'abime et l'efficacité de vos machines et la santé des bacteries depend de vos reglages et de la pollution que vous generez. Pensez a acheter une source d'energie et bien gerer vos credits. En cliquant sur ce panneau d'alert vous aurez l'historique complet" >
    
<AlertConsole onClick={() => handleSelect({history:true})} />
  </OnBoardingStep>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1,p:1 }}>
      {tabButtons.map(({ id, label, img , name}) => (
           <OnBoardingStep stepId={name} 
                          message={name==='market'?"Vous avez besoin d'un bio-reacteur et d'une premiere souche, allez au marché"
                          :(name=='labo'?"Quand vous aurez acheté le fermenteur et une E.Coli, retournez au labo et cliquez sur le reacteur"
                          :"Lancez vos recherche ici, pour debloquer des machines ou de nouvelles technologies")} >
        <ButtonBase
          key={id}
          onClick={() => setTab(id)}
          sx={{
            position: "relative",
            width: "100%",
            height: 80, 
            borderRadius: 2,
            overflow: "hidden",
            background:'rgba(0,0,0,0.4)',
            border: tab === id ? "3px solid #4caf50" : "2px solid transparent",
            boxShadow:
              tab === id
                ? "0 0 10px rgba(76,175,80,0.5)"
                : "0 2px 4px rgba(0,0,0,0.2)",
            transition: "all 0.2s ease",
            "&:hover": {
              transform: "scale(1.02)",
              boxShadow: "0 0 10px rgba(76,175,80,0.7)",
            },
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${img})`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              filter: tab === id ? "brightness(1)" : "brightness(0.6)",
              transition: "filter 0.3s",
            }}
          />
                            
          
          <Typography
            variant="h6"
            sx={{
              position: "relative",
              zIndex: 1,
              color: "white",
              textShadow: "0 0 4px rgba(0,0,0,0.8)",
              fontWeight: "bold",
            }}
          >
            {label}
          </Typography>
        </ButtonBase>
                          </OnBoardingStep>
      ))}
    </Box>
      <InfoStack/>
    </Box>
  );

}
export default BactIncBureau;


const InfoStack = () => {
  const { labState } = useLab();
  const {
    reactors,
    bacteria,
    machines,
    resources
  } = labState;
  const {
    energy,
    nutrients,
    waste,
    contamination, reputation,
    credits, ...products } = resources;

  return <Stack direction="column" spacing={1} alignItems="center" flexWrap="wrap">
    <Chip label={`💰 Crédits : ${credits.toFixed(2)} ₡`} color="primary" />
    <Chip
      label={`⚡ Énergie : ${energy.toFixed(2)}`}
      color={energy > 30 ? "success" : "warning"}
    />
    <Chip
      label={`🧫 Nutr. : ${nutrients.toFixed(2)}`}
      color={nutrients > 30 ? "success" : "warning"}
    />
    <Chip
      label={`☣️ Déchets : ${waste.toFixed(2)}`}
      color={waste < 50 ? "info" : (waste < 100 ? "warning" : "error")}
    />
    <Chip
      label={`🦠 Pollution : ${(contamination * 100).toFixed(2)}%`}
      color={contamination < 0.5 ? "default" : "error"}
    />
    <Chip
      label={`🦠 Reputation : ${reputation.toFixed(2)}%`}
      color={reputation > 80 ? "success" : (reputation > 30 ? "info" : "error")}
    />
    <ProductionWidget resources={products} />
  </Stack>
}