import React from 'react';
import './awale.css';
import imgSeed from './seed.png';
import imgBois from './bois.jpg';
import boardRowImg from './boardRow.jpg';
import { Box } from '@mui/material';
import {makeStyles} from '@mui/styles';
import { useIsMobile } from '../hookGame';

const Seed = () => {
  const isMobile = useIsMobile();
  const size = isMobile ? '24px' : '40px';
  return <div className="seed"><img style={{ width: size, height: size }} src={imgSeed} alt="" /></div>;
};

const useStyles = makeStyles((theme) => ({
  hole: {
    
    flexWrap: 'wrap',
    flexBasis: '20%',
    /* Ajustez la valeur en fonction du nombre de trous par rangée */
  flex:1,height:'100%',
    borderRadius: '45%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer', /* 
    background-color: #c2a67f;Couleur de fond brun
    background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.3) 25%, transparent 25%, transparent 75%, rgba(255, 255, 255, 0.3) 75%, rgba(255, 255, 255, 0.3)), linear-gradient(45deg, rgba(0, 0, 0, 0.1) 25%, transparent 25%, transparent 75%, rgba(0, 0, 0, 0.1) 75%, rgba(0, 0, 0, 0.1)); Texture de bois
     */
     
     boxShadow: '0 3px 6px rgba(0, 0, 0, 0.16)',
   

    // Ajoute le style pour l'image de fond ici
    backgroundImage: `url(${imgBois})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',

    /* ... (d'autres styles) */
  },
  boardRow:{
    display: 'flex', height:150, width:'100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundImage:`url(${boardRowImg})`
  
  }
}));

export const BoardRow = ({ row, rowIndex, handleHoleClick , disabled=false}) => {
const classes = useStyles();

  return <Box component="div" className={classes.boardRow+(disabled?' rowdisabled':'')} sx={{ height: { xs: 100, md: 150 } }}>
  {row.map((seeds, index) => (
    <Box className={classes.hole}
      key={index}
      onClick={() => handleHoleClick(rowIndex, index)}
    >
      {seeds > 9 ? (
        <div className="seed-text">{seeds}</div>
      ) : (
        Array.from({ length: seeds }).map((_, i) => <Seed key={i} />)
      )}
    </Box>
  ))}
</Box>
}
  



export const PlayerHouse = ({ playerName, collectedSeeds }) => {
  return (
    <div className="player-house">
      <h2>{playerName}</h2>
      <div className="seeds-container" style={{display:'flex', flexWrap:'wrap'}}>{collectedSeeds}
        {[...Array(collectedSeeds)].map((_, index) => (
           <Seed key={index} />
        ))}
      </div>
    </div>
  );
};

export default PlayerHouse;
