import React from 'react';
import { makeStyles } from '@mui/styles';
import { Air, LocalFireDepartment, PublicSharp, WaterDrop } from '@mui/icons-material';
import feuImg from './images/feu.png';
import eauImg from './images/eau.png';
import airImg from './images/air.png';
import terreImg from './images/terre.png';
const useStyles = makeStyles((theme) => ({
  bulle: {
    borderRadius: '50%',
    position: 'absolute',
    zIndex: 1, // Assurez-vous que les bulles sont au-dessus du contenu du composant parent
    // Autres styles personnalisés pour les bulles ici
  },
}));

const Bulle = ({ bulle }) => {
  const classes = useStyles();

  return (
    <div
      className={classes.bulle}
      style={{
        width: bulle.size||20, // Ajustez la taille de la bulle selon vos besoins
        height: bulle.size||20,
        left: bulle.x, // Position horizontale de la bulle
        top: bulle.y, // Position verticale de la bulle
        backgroundColor: bulle.couleur, // Utilisez la couleur de la bulle depuis ses propriétés
      }}
    />
  );
};

export default Bulle;



export const ELTS = {
  feu:{
    name:'feu',
    icon:<LocalFireDepartment />,
    color:'#FF2222',
    image:(size=20)=>{
      return <div style={{width:size+'px', height:size+'px'
      , backgroundImage:`url(${feuImg})`, backgroundSize:'contain'}}/>
    },
    imageSrc:feuImg
  },
  eau:{
    name:'eau',
    icon:<WaterDrop />,
    color:'#1111EE',
    image:(size=20)=>{
      return <div style={{width:size+'px', height:size+'px'
      , backgroundImage:`url(${eauImg})`, backgroundSize:'contain'}}/>
    },
    imageSrc:eauImg
  },
  air:{
    name:'air',
    icon:<Air />,
    color:'#7defee',
    image:(size=20)=>{
      return <div style={{width:size+'px', height:size+'px'
      , backgroundImage:`url(${airImg})`, backgroundSize:'contain'}}/>
    },
    imageSrc:airImg
  },
  terre:{
    name:'terre',
    icon:<PublicSharp />,
    color:'#864646',
    image:(size=20)=>{
      return <div style={{width:size+'px', height:size+'px'
      , backgroundImage:`url(${terreImg})`, backgroundSize:'contain'}}/>
    },
    imageSrc:terreImg
  }
}
