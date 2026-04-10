import React, { useEffect, useState } from 'react';
import {
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Button,
  Paper,
  
} from '@mui/material';
import {makeStyles} from '@mui/styles';
import { Personnage } from '../personnages/Personnage';
import { Famille } from '../personnages/PNJ';
import { generateRandomFirstName, generateRandomName } from './persoUtils';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
    textAlign: 'center',
    maxWidth: 400,
    margin: 'auto',
    marginTop: theme.spacing(5),
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: theme.spacing(2),
    color: '#4CAF50', // Green color
  },
  image: {
    width: '100%',
    height: 'auto',
    marginBottom: theme.spacing(2),
  },
  radioGroup: {
    marginBottom: theme.spacing(2),
  },
}));

const CreationMode = ({ done }) => {
  const classes = useStyles();
  const [sexe, setSexe] = useState('M');
  const [nom, setNom] = useState(generateRandomName());
  const [prenom, setPrenom] = useState('');

 useEffect(()=>{
  setPrenom(generateRandomFirstName(sexe));
  },[sexe]) 
  const handleSexeChange = (event) => {
    setSexe(event.target.value);
  };

  const handleNomChange = (event) => {
    setNom(event.target.value);
  };

  const handlePrenomChange = (event) => {
    setPrenom(event.target.value);
  };

  
  const handleValidation = () => {
    if (sexe && nom && prenom) {
      const joueur =  new Personnage({etatCivil:{sex:sexe, nom : prenom+' '+nom, age:0} });
      // on ajoute le apa et la maman
      const maman = new Famille({nom:generateRandomFirstName('F')+' '+nom,
        etatCivil: {  age: 28, sex: 'F' }
        , lienDeParente: 'Maman'
    });
    const papa = new Famille({nom:generateRandomFirstName('M')+' '+nom,  etatCivil: {age: 32, sex: 'M' }, lienDeParente: 'Papa' });
    joueur.addFamille(maman);
    joueur.addFamille(papa);
      done(joueur);
    } else {
      console.error('Veuillez remplir tous les champs');
    }
  };

  return (
    <Paper className={classes.root} elevation={3}>
      <Typography className={classes.title}>Bienvenue dans le jeu BiteLife</Typography>

      <img
        className={classes.image}
        src={sexe==="M"?"https://lareclame.fr/wp-content/uploads/2010/03/specsaver-lynx-arttop.jpg":"https://media.tenor.com/VbYtvjUsy_MAAAAC/bh187-wonder-woman1984.gif"}
        alt="Game Illustration"
      />

      <Typography>
        Avant de plonger dans l'aventure, veuillez définir le personnage que vous voulez jouer.
      </Typography>

      <RadioGroup
        className={classes.radioGroup}
        row
        aria-label="sexe"
        name="sexe"
        value={sexe}
        onChange={handleSexeChange}
      >
        <FormControlLabel value="M" control={<Radio />} label="Masculin" />
        <FormControlLabel value="F" control={<Radio />} label="Féminin" />
      </RadioGroup>

      <TextField
        label="Nom"
        variant="outlined"
        fullWidth
        value={nom}
        onChange={handleNomChange}
        margin="normal"
      />

      <TextField
        label="Prénom"
        variant="outlined"
        fullWidth
        value={prenom}
        onChange={handlePrenomChange}
        margin="normal"
      />

      <Button variant="contained" color="primary" onClick={handleValidation}>
        Commencer l'aventure
      </Button>
    </Paper>
  );
};

export default CreationMode;
