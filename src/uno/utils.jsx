import { makeStyles } from "@mui/styles";
import imgHoraire from './horaire.png';
import imgAntiHoraire from './anti.png';


export const shuffle = (deck) => {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  
    return deck;
  };

export const useStyles = makeStyles((theme) => ({
    unoBoard: {

    // backgroundImage: ``,
    // backgroundRepeat: 'no-repeat',
    // backgroundPosition: 'center',
    // backgroundSize: 'contain',
      backgroundColor: 'green', // Couleur du tapis vert
      position:'relative',
      width: '100%',
      height: '100%',
      borderRadius: '10px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
sensBackground:{
    position: 'absolute',
    top: '25%',
    left: '25%',
    width: '50%',
    height: '50%',
    backgroundSize: 'cover',
    opacity: 0.2, // Réglez l'opacité de l'image 1 si nécessaire

},
  sensHoraire: {
    backgroundImage: `url(${imgHoraire})`,
  },
  sensAnti: {
    backgroundImage: `url(${imgAntiHoraire})`,
  },
    playerCard: {
      backgroundColor: 'rgba(100,250,160,0.4)', // Couleur des cartes des joueurs
      width: '100px',
      height: '100px',
      borderRadius: '10px',
    },
    playerCardActif: {
      backgroundColor: 'rgba(200,250,160,0.8)', // Couleur des cartes des joueurs
    },
    playerCardInActif: {
      backgroundColor: 'rgba(100,250,160,0.4)', // Couleur des cartes des joueurs
    },
    playerNameCard:{
        margin:'5px',
        fontSize:'16px'
    },
    topMiddle: {
      position: 'absolute',
      top: '10px',
      left: '50%',
      transform: 'translateX(-50%)',
    },
    middleRight: {
      position: 'absolute',
      top: '50%',
      right: '20px',
      transform: 'translateY(-50%)',
    },
    bottomMiddle: {
      position: 'absolute',
      bottom: '50px',
      left: '30px',
      width:'80%'
      , height:'150px'
    },
    middleLeft: {
      position: 'absolute',
      top: '50%',
      left: '20px',
      transform: 'translateY(-50%)',
    },
  }));
  