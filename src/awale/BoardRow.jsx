import React from 'react';
import './awale.css';
import imgSeed from './seed.png';
import imgBois from './bois.jpg';
import boardRowImg from './boardRow.jpg';
import mamadouImg from './mamadou.jpeg';
import playerImg from '../apple-icon-144x144.png';
import { Box, Typography } from '@mui/material';
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
  const isVous = playerName === 'Vous';
  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 2,
      background: isVous ? 'rgba(145,71,35,0.08)' : '#f3eddf',
      border: `1px solid ${isVous ? 'rgba(145,71,35,0.25)' : 'rgba(139,113,106,0.18)'}`,
      borderRadius: 3, px: 2.5, py: 1.5,
    }}>
      <Box sx={{
        width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
        border: `2px solid ${isVous ? 'rgba(145,71,35,0.3)' : 'rgba(139,113,106,0.25)'}`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}>
        <img src={isVous ? playerImg : mamadouImg} alt={playerName}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </Box>
      <Box>
        <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#1d1c13', lineHeight: 1 }}>
          {playerName}
        </Typography>
        <Box sx={{
          display: 'inline-flex', alignItems: 'center', mt: 0.75,
          bgcolor: isVous ? 'rgba(145,71,35,0.12)' : '#eee8da',
          borderRadius: 99, px: 1.5, py: 0.4,
        }}>
          <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: '#914723', letterSpacing: '-0.01em' }}>
            {collectedSeeds}
          </Typography>
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#58423c', ml: 0.6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            graines
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default PlayerHouse;
