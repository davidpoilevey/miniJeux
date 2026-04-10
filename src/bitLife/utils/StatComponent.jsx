import { Alert, AlertTitle, Avatar, Badge, Box, Button, Dialog, DialogContent, DialogTitle, LinearProgress, Menu, MenuItem, Typography, styled, useTheme } from "@mui/material";
import React, { useMemo, useState } from "react";
import imageM from '../images/sexM.png';
import imageF from '../images/sexF.png';
import portMonnaie from '../images/portemonnaie.png';
import { usePerso } from "../personnages/BitLife";

const StatComponent = ({ persoData, isJoueur = false }) => {
  /** onlyCaractere is for pnjDialog
   * a organiser:   , jauges: {
          sante: 100,
          bonheur: 100,
          karma: 0,
          social: 0,
      }
      ,caractere:{
          pervers:80,
          violent:20,
          intelligent:60
      }
      , maladies: []
      , competences: [
          {
              permis: []
              , combat: 0
          }
      ]
      , amis: []
      , famille: []
      , connaissances: {}
      , diplomes: []
      , possessions: []
      , argent: 0
   */
  return <Box sx={{ display: 'flex', flexDirection: 'column' }}>

    {isJoueur && <><Box sx={{ display: 'flex', flexDirection: 'column', }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography>Sexe:</Typography>
        <img src={persoData.etatCivil.sex === 'M' ? imageM : imageF} alt={'sex' + persoData.etatCivil.sex} />
      </Box>
      {persoData.enceinte && <Alert severity="warning">ENCEINTE !!</Alert>}
      <Typography>Argent : {persoData.argent} euros</Typography>
      <Typography>Niveau de promotion : {persoData.metier?.promotion} </Typography>
      <Box sx={{ display: 'flex' }}>

        <ClefsAffichage label="Amis" clefs={persoData.amis.map(f => f.nom)} />
        <ClefsAffichage label="Famille" clefs={persoData.famille.map(f => f.nom)} />
        <ClefsAffichage label="Connaissances" clefs={Object.keys(persoData.connaissances)} />
      </Box>

    </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', }}>
        <Typography>Jauges:</Typography>
        <Jauge from="Santé" value={persoData.jauges.sante} />
        <Jauge from="Bonheur" value={persoData.jauges.bonheur} />
        <Jauge from="Karma" value={persoData.jauges.karma} />
        <Jauge from="Vie sociale" value={persoData.jauges.social} />


      </Box>
    </>}
    <Box sx={{ display: 'flex', flexDirection: 'column', }}>
      <Typography>Caractere:</Typography>
      <Jauge to="Prude" from="Pervers" colorMin={"#66AFFF"} colorMax="#FFBBAA" value={persoData.caractere?.pervers ?? 50} />
      <Jauge to="Calme" from="Violent" colorMin={"#aCFBaF"} colorMax="#BB2222" invertedColor value={persoData.caractere?.violent ?? 50} />
      <Jauge to="Con" from="Intelligent" colorMin={"#999999"} colorMax="#AFFBFF" value={persoData.caractere?.intelligent ?? 50} />


    </Box>
    {isJoueur && <Box>
      {persoData.maladies.length > 0 && <>
        {persoData.maladies.map(m => (<Alert severity="warning"><AlertTitle>Maladie</AlertTitle>{m}</Alert>))}
      </>}
      {persoData.diplomes.length > 0 && <Box sx={{ display: 'flex' }}>
        <Typography variant="h6">Diplomes</Typography>:
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {persoData.diplomes.map(dip => {
            return <Typography color="text.secondary">{dip}</Typography>
          })}

        </Box>
      </Box>}
      {persoData.possessions.length > 0 && <PossessionButton/>}

    </Box>}

  </Box>
}
export default StatComponent;

const PossessionButton=()=>{
  const [open, setOpen] = useState(false);
  const [soldPoss, setSoldPoss]=useState();
  const theme = useTheme();
  const {perso} = usePerso();
  const possessions = useMemo(()=>{
    return perso.perso.possessions;
  },[perso])
  const handleClose = () => {
    setOpen(false);
  };
  const openPossession=(evt)=>{
    setOpen(true);
  }
  const reventeDone=()=>{
    perso.revend(soldPoss);
    setSoldPoss(null);
  }
  const revendre=(obj)=>{
    const newObj = {...obj, valeur:obj.valeur*0.7};
    setSoldPoss(newObj);
  }
  return <>
 <Button onClick={openPossession}>
    <img src={portMonnaie} height={100} alt="Possessions"/>
  </Button>
  <Dialog open={open} onClose={handleClose}>
      <DialogTitle >Possessions</DialogTitle>
      <DialogContent>
        {soldPoss!=null &&<Box><Alert severity="success" 
        onClose={()=>{ setSoldPoss(null);}}
        action={<Button onClick={reventeDone} variant="filled">Accepter</Button>}>
          Vous avez mis {soldPoss.nom} en vente sur leBonCoin.
         Un trou du cul vous en propose {soldPoss.valeur}</Alert></Box> }
        {possessions.map(poss=>{
         return  <Box key={poss.nom} sx={{display:'flex',flexDirection:'column',gap:'5px'}}>
          <Box sx={{display:'flex', backgroundColor:theme.palette.background.default, border:'1px solid '+theme.palette.primary.main, borderRadius:'5px'
          ,padding:'5px',gap:'5px',alignItems:'center',justifyContent:'end'}}>
            {poss.image!=null && <img src={poss.image} height={100} alt={poss.nom}/>}
          <Typography color="text.secondary">{poss.nom}</Typography>
          <Typography variant="caption" color="text.secondary">{poss.valeur} $</Typography>
          <Button  color="primary" variant="contained" onClick={()=>{revendre(poss)}}>Revendre</Button>
          </Box>

     </Box>
        })}
        
      </DialogContent>
      </Dialog>
   </>
}
const ClefsAffichage = ({ label, clefs = [] }) => {
  const [menuAnchor, setMenuAnchor] = useState(null);

  const handleMenuOpen = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  return (
    <div>
      <Button onClick={handleMenuOpen}>
        {label}: {clefs.length}
      </Button>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        {clefs.map((clef, index) => (
          <MenuItem key={index} onClick={handleMenuClose}>
            {clef}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};
const Jauge = ({ from, to, value, colorMin = "#FF0000", colorMax = "#00FF00" }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
      <Typography variant="body2" color="textSecondary" style={{ marginRight: '10px' }}>
        {from}
      </Typography>
      <CustomProgressBar colorMin={colorMin} colorMax={colorMax} value={value} />
      <Typography variant="body2" color="textSecondary" style={{ marginLeft: '10px' }}>
        {to}
      </Typography>
    </div>
  );
};

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: 18,
    top: -7,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}));
const CustomProgressBar = ({ value, colorMin, colorMax }) => {
  const percentage = Math.min(100, Math.max(0, value)); // Assurer que la valeur est entre 0 et 100
  const limitMin = Math.max(0, percentage - 10);
  const limitMax = Math.min(100, percentage + 10);
  const gradient = `linear-gradient(to right, ${colorMax} 0%, ${colorMax} ${limitMin}%, ${colorMin} ${limitMax}%, ${colorMin} 100%)`;


  return (
    <StyledBadge badgeContent={`${percentage}%`} color="primary">
      <Box
        sx={{
          minWidth: '200px',
          flex: 2,
          height: 10,
          borderRadius: 5,
          backgroundImage: gradient,
          position: 'relative',
        }}
      >
        <Typography
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'black',
          }}
        >

        </Typography>
      </Box>
    </StyledBadge>
  );
};
