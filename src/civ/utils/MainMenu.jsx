import React, { useEffect } from 'react';
import { useCivContext } from '../CivContext';
import { Box, Button, Popover, Typography } from '@mui/material';
import civCover from '../images/civCover.jpg';
import chessCover from '../images/echec.png';

export const useMainMenuStyles = {
  root: {
    width: '100vw',
    height: '100vh',
    backgroundImage: `url(${civCover})`, // Remplacez par votre image
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },rootChess: {
    width: '100vw',
    height: '100vh',
    backgroundImage: `url(${chessCover})`, // Remplacez par votre image
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  content: {
    position: 'relative',
    zIndex: 10,
    textAlign: 'center',
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: '30px',
    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    alignItems: 'center',
  },
  menuButton: {
    width: 320,
    padding: '8px 16px',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      transform: 'scale(1.05)',
    },
  },
  newGameButton: {
    backgroundColor: '#88a9f2',
    '&:hover': {
      backgroundColor: '#7899e2',
    },
  },
  loadGameButton: {
    backgroundColor: '#a8a9c2',
    '&:hover': {
      backgroundColor: '#9889a2',
    },
  }, creditsButton: {
    backgroundColor: '#666',
    '&:hover': {
      backgroundColor: '#555',
    },
  },
  creditsPopover: {
    padding: '20px',
    maxWidth: 400,
    textAlign: 'left',
  },
  creditsTitle: {
    marginBottom: '15px',
    fontWeight: 'bold',
  },
  creditsText: {
    marginBottom: '8px',
    lineHeight: 1.6,
  },
}



export const MainMenu = ({ onNewGame, onGameLoaded }) => {
  
  const { loadCiv, addEvent} = useCivContext();
  const handleLoadGame = () => {
   const data = loadCiv();
      if (data?.playerNation) {

        onGameLoaded(data.playerNation);
      }
    
  };
 const [creditsAnchor, setCreditsAnchor] = React.useState(null);

  const sertARien = (event) => {
   addEvent("Putain puisqu'on vous dit qu'il sert a rien")
  };
  const handleCreditsClick = (event) => {
    setCreditsAnchor(event.currentTarget);
  };

  const handleCreditsClose = () => {
    setCreditsAnchor(null);
  };

  const creditsOpen = Boolean(creditsAnchor);
  const useStyles= useMainMenuStyles;
  return (
    <div style={useStyles.root}>
      <div style={useStyles.overlay} />
      <Box style={useStyles.content}>
        <Typography variant="h3" style={useStyles.title}>
         Selbst machtig
        </Typography>
        <Typography variant="h1" style={useStyles.title}>
          Civilization 
        </Typography>
        
        <div style={useStyles.buttonContainer}>
          <Button
            variant="contained"
            color="primary"
            style={useStyles.menuButton}
            onClick={onNewGame}
          >
            Nouveau Jeu
          </Button>
          
          <Button
            variant="contained"
            style={useStyles.menuButton}
            onClick={handleLoadGame}
          >
            Charger une Partie
          </Button>
           <Button
            variant="contained"
            style={useStyles.menuButton}
            onClick={handleCreditsClick}
          >
            Crédits
          </Button>
           <Button
            variant="contained"
            style={useStyles.menuButton}
            onClick={sertARien}
          >
            Bouton qui sert a rien
          </Button>
          {/* Boutons futurs */}
          {/* 
          <Button
            variant="contained"
           sx={useStyles.menuButton}
            style={{ backgroundColor: '#666' }}
          >
            Options
          </Button>
          */}
        </div>
         <Popover
          open={creditsOpen}
          anchorEl={creditsAnchor}
          onClose={handleCreditsClose}
          anchorOrigin={{
            vertical: 'center',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'center',
            horizontal: 'left',
          }}
        >
          <Box sx={useStyles.creditsPopover}>
            <Typography variant="h6" style={useStyles.creditsTitle}>
              Crédits
            </Typography>
            <Typography variant="body2" style={useStyles.creditsText}>
              Développé avec passion par un développeur qui se souvient avec nostalgie de Civilization I (1991). 
            </Typography>
            <Typography variant="body2" style={useStyles.creditsText}>

              Ceci est un hommage a ce jeu sur lequel j'avais perdu des centaines d'heures.
               Il n'est que justice que j'en perde a nouveau une bonne centaine pour le refaire de zero a ma sauce
                        </Typography>
            <Typography variant="body2" style={useStyles.creditsText}>
              Remerciements spéciaux à la communauté open source pour les icones gratuits, les images volées. 
              </Typography>
            <Typography variant="body2"  style={useStyles.creditsText}>
             Special dedicade a <strong>ChatGPT et Claude 4</strong> - qui m'ont filé un coup de main non negligeable
            </Typography>
            <div>Icônes conçues par <a href="https://www.flaticon.com/fr/auteurs/juicy-fish" title="juicy_fish">juicy_fish</a> from <a href="https://www.flaticon.com/fr/" title="Flaticon">www.flaticon.com</a></div><div>Icônes conçues par <a href="https://www.flaticon.com/fr/auteurs/vectorsmarket15" title="vectorsmarket15">vectorsmarket15</a> from <a href="https://www.flaticon.com/fr/" title="Flaticon">www.flaticon.com</a></div><div>Icônes conçues par <a href="https://www.flaticon.com/fr/auteurs/surang" title="surang">surang</a> from <a href="https://www.flaticon.com/fr/" title="Flaticon">www.flaticon.com</a></div><div>Icônes conçues par <a href="https://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/fr/" title="Flaticon">www.flaticon.com</a></div><div>Icônes conçues par <a href="https://www.flaticon.com/fr/auteurs/dewi-sari" title="Dewi Sari">Dewi Sari</a> from <a href="https://www.flaticon.com/fr/" title="Flaticon">www.flaticon.com</a></div>
            <Typography variant="body2" style={useStyles.creditsText}>
              <strong>Technologies utilisées :</strong> React, Material-UI, javascript et beaucoup de café ☕
            </Typography>
            <Typography variant="body2" style={useStyles.creditsText}>
              Version 1.0 - 2025
            </Typography>
          </Box>
        </Popover>
      </Box>
    </div>
  );
};

