import { Box, Button, Popover, Typography } from "@mui/material";
import React from "react";

const useMainMenuStyles = {
  root: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    backgroundImage: `url(https://jeux.dokokade.net/wp-content/uploads/2018/05/Sorcery-logo.png)`, // Remplacez par votre image
    backgroundSize: 'contain',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundColor:'#69aa53',
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
  },
  content: {
    position: 'relative',
    backgroundColor:'#66666666',
    padding:10,
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
const SorceryMenu=({onNewGame, onEditeur})=>{
  
 const [creditsAnchor, setCreditsAnchor] = React.useState(null);

 const useStyles= useMainMenuStyles;
  const sertARien = (event) => {
   alert("Putain puisqu'on vous dit qu'il sert a rien")
  };
  const handleCreditsClick = (event) => {
    setCreditsAnchor(event.currentTarget);
  };

  const handleCreditsClose = () => {
    setCreditsAnchor(null);
  };
  
  const creditsOpen = Boolean(creditsAnchor);
  return <div style={useStyles.root}>
   <Box style={useStyles.content}>
        <Typography variant="h4" style={useStyles.title}>
        Presque un remake
        </Typography>
        <Typography variant="h2" style={useStyles.title}>
         Sorcery
        </Typography>
        
        <div style={useStyles.buttonContainer}>
          <Button
            variant="contained"
            color="primary"
            style={useStyles.menuButton}
            onClick={()=>{onNewGame()}}
          >
            Nouveau Jeu
          </Button> 
          <Button
            variant="contained"
            color="primary"
            style={useStyles.menuButton}
            onClick={()=>{onNewGame(true)}}
          >
           Tutoriel
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
            onClick={onEditeur}
          >
           Editeur de niveaux
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
              Développé avec passion par un développeur fan de ses vieux jeux sur Amstrad 
            </Typography>
            <Typography variant="body2" style={useStyles.creditsText}>
              Remerciements spéciaux à Claude 
              </Typography>
                 <Typography variant="body2" style={useStyles.creditsText}>
              <strong>Technologies utilisées :</strong> React, Material-UI, javascript et beaucoup de café ☕
            </Typography>
            <Typography variant="body2" style={useStyles.creditsText}>
              Version 1.0 - 2026
            </Typography>
          </Box>
        </Popover>
      </Box>
 </div>
}
export default SorceryMenu