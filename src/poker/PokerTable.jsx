import { Alert, Avatar, Box, Card, CardContent, CardHeader, Chip, Grow, Slide, Toolbar, Typography } from "@mui/material";
import Button, { ButtonProps } from '@mui/material/Button';
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Carte, useCardStyles } from "./Card";
import { TapisVert } from "./TapisVert";
import {Clear, Moving, ThumbDown, TouchApp, WavingHand} from '@mui/icons-material/';
import bgImg from './casino.jpg';
import { makeStyles, styled } from "@mui/styles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoins, faPersonHarassing, faPlay } from "@fortawesome/free-solid-svg-icons";
import { yellow } from "@mui/material/colors";
import { IconButton } from "@mui/material";
import { evaluateMain, getStage, STAGES } from "./pokUtils";


const useStyles = makeStyles((theme) => ({
  title: {
    fontWeight: 'bold',
    marginBottom: '16px',
    color: '#ffcc00', // Jaune doré
    textShadow: '2px 2px #ff0000', // Ombre rouge
  },
  infoBox: {
    display: 'flex',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginBottom: theme.spacing(2), // Espace entre le infoBox et les boutons
  },
  gameStageText: {
    fontWeight: 'bold!important',
    textTransform: 'uppercase',
    padding: '10px',
    borderRadius: '40%', // Bouton rond
    backgroundColor: 'rgba(0,250,0,0.2)',

  },
  distributeButton: {
    background: props => (props.bgColor || 'red'),
    borderRadius: '40%', // Bouton rond
    padding: '20px!important', // Taille plus grande
    '&:hover': {
      background: 'radial-gradient(transparent,#495dfb)', // Bleu métallisé plus foncé au survol
    },
  },
distributeIcon:{
  fontSize: '30px', // Taille de l'icône
  marginRight: '10px', // Espacement entre l'icône et le texte
},
  enjeuBox: {
    display: 'flex',
    alignItems: 'center',
  },

  headerRoot: {
    background: 'radial-gradient(at top left, rgba(200,255,190,0.5), rgba(90,95,90,0.8))', // Dégradé doré en diagonale
    padding: theme.spacing(1), // Espacement intérieur du header
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: theme.palette.primary.text, // Couleur du texte (texte blanc)
    borderBottom: '1px solid rgba(0, 0, 0, 0.1)', // Bordure inférieure légère
  },
  headerTitle: {
    fontSize: '1.2rem', // Taille de police du titre
    fontWeight: 'bold', // Texte en gras
  },
  headerIcon: {
    fontSize: '1.5rem', // Taille de police de l'icône
    marginRight: theme.spacing(1), // Espacement à droite de l'icône
  },
  actionButton: {
    padding: '10px!important',
    background: 'linear-gradient(45deg, #ccff00, #f08800)', // Dégradé 
    color: '#111111', // Blanc
    fontWeight: 'bold',
    fontSize: 18,
    borderRadius: 10,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)', // Ombre subtile
    '&:hover': {
      background: 'linear-gradient(45deg, #ccff00, #f0f8f0)',
      boxShadow: '0 6px 12px rgba(0, 0, 0, 0.4)', // Ombre plus intense au survol
    },
  },
}));
const PokerTable = ({ gameStage, message, dealCards, gameRunning, currentPlayer, setCurrentPlayerIndex
  , handlePlayerAction, miseCourante, players, cartesCommunes, currentPlayerIndex, banque, reset, children }) => {
  const btnDisabled = !currentPlayer?.isHuman || currentPlayer?.hand == null;
  const classes = useStyles({ bgColor: gameRunning ? 'blue' : 'radial-gradient(transparent,#f95dfb)' });
  const [msgVisible, setMsgVisible] = useState(false);
  const shakenPlayers = useRef();
  const shake = (joueurIndex) => {
    if(shakenPlayers.current!=null)
      return;
    setCurrentPlayerIndex(-1);
    shakenPlayers.current = joueurIndex;
    setTimeout(() => {
      setCurrentPlayerIndex(joueurIndex);
      shakenPlayers.current = null;
    }, 100);
  }
  useEffect(() => {
    setMsgVisible(false);
    if (message != null && message !== '')
      setTimeout(() => {
        setMsgVisible(true);
      }, 100)
  }, [message]);
  const userMain = useMemo(() => {
    const userCartes = players.find(p => p.isHuman)?.hand || [];
    let carteCommunesOuvertes = [];
    for (let st in cartesCommunes) {//['pre-flop', 'flop', 'turn', 'river']
      if (gameStage !== 'pre-flop' && (st === 'flop' || gameStage === st || gameStage === 'river'))
        carteCommunesOuvertes = carteCommunesOuvertes.concat(cartesCommunes[st]);
    }
    const theMain = evaluateMain(userCartes, carteCommunesOuvertes, true);
    return theMain;
  }, [gameStage, cartesCommunes, players]);
  return (
    <Box sx={{
      display: 'flex', flexDirection: 'column', height: '100%'
      , backgroundImage: `url(${bgImg})`, backgroundSize: 'cover'
    }}>

      <Box className={classes.infoBox}>
        <Grow direction="right" in={msgVisible} timeout={150}>
          <Typography variant='h2'
            sx={{ backgroundColor: 'rgba(200,220,80,0.8)', padding: 2, fontWeight: 'bold', borderRadius: '10px' }}>
            {message}</Typography>
        </Grow>

        <Button onClick={reset}>
          <Typography variant="h6" className={classes.gameStageText}
            sx={{ color: getStage(gameStage).color }}>{gameStage}</Typography>
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flex: 1, overflow:'auto' }}>
        <Box sx={{ display: 'flex', flex: 2, flexDirection: 'column', margin: 2 }}>
          {players.map((player, index) => (
            <JoueurCard key={player.name}
              player={player}
              shakePlayer={shake} isRunning={gameRunning}
              headerClasses={classes}
              playing={gameRunning&&(currentPlayerIndex<0|| currentPlayerIndex === index)} />
          ))}
        </Box>
        <Box sx={{ display: 'flex', flex: 5 }}>
          <TapisVert communityCards={cartesCommunes} gameStage={gameStage}
            userMain={userMain} banque={banque} currentMise={miseCourante} />
        </Box>
        <Box sx={{
          display: 'flex', flex: 1, justifyContent: 'space-evenly', flexDirection: 'column'
          , margin: 2
        }}>
          <IconButton className={gameRunning?null:classes.distributeButton} onClick={dealCards}
          
            disabled={gameRunning}>
            <FontAwesomeIcon icon={faPlay} color={gameRunning?'disabled':'red'} 
            className={classes.distributeIcon} />
            Distribuer les cartes
          </IconButton>
          <Button variant="outlined" color="primary" disabled={btnDisabled}
            className={classes.actionButton} onClick={() => handlePlayerAction('fold')}>
            Se coucher
          </Button>
          {miseCourante > 0 ? (
            <Button variant="outlined" color="primary" disabled={btnDisabled}
              className={classes.actionButton} onClick={() => handlePlayerAction('call')}>
              Payer pour voir
              {currentPlayer!=null && <Typography color="primary" >({miseCourante-currentPlayer.enjeu})</Typography>}
            </Button>
          ) : (
            <Button variant="filled" color="primary" disabled={btnDisabled}
              className={classes.actionButton} onClick={() => handlePlayerAction('check')}>
              Check
            </Button>
          )}
          <Button variant="outlined" color="primary" disabled={btnDisabled} className={classes.actionButton} onClick={(evt) => handlePlayerAction('bet', evt)}>
            Miser
          </Button>
          {children}
        </Box>
      </Box>
    </Box>
  );
}



const JoueurCard = ({ player, playing, headerClasses, shakePlayer, isRunning }) => {
  const classes = useCardStyles();
  useEffect(() => {
    let timeoutid = null;
    if (playing && !player.isHuman) {
      // peut-etre bloqué ? lancer un shakePlayer apres 1/2 sec
      timeoutid = setTimeout(() => {
        shakePlayer(player.joueurIndex);
      }, 500);
    }
    return () => {
      if (timeoutid != null)
        clearTimeout(timeoutid);
    }
  }, [playing, player.isHuman, player.joueurIndex])
  return <Card variant="outlined" sx={{ backgroundColor: 'rgba(100,200,100,0.5)' }}>
    <CardHeader
      classes={{ root: headerClasses.headerRoot }}
      sx={{ padding: '4px' }}
      avatar={<Avatar src={player.avatar} alt={player.name}/>}
      title={ <Typography variant="h6">{player.name}</Typography>}
      subheader={<Box className={headerClasses.enjeuBox}>
        
        <Typography className={headerClasses.infoText}>Mise : {player?.enjeu || 0}</Typography>
        <FontAwesomeIcon icon={faCoins} style={{ color: yellow[300] }} />
      </Box>}
      action={playing && !player.isHuman ? <IconButton onClick={()=>{shakePlayer(player.joueurIndex);}}>
        <FontAwesomeIcon icon={faPersonHarassing} />
        <Typography>Eh reveille-toi {player.name} !</Typography>
      </IconButton> : null}
    />
    <CardContent sx={{ paddingTop: '4px', paddingBottom: '4px!important', display: 'flex', alignItems:'start'
      , backgroundColor: player.folded ? '#888888' : null }}>
      <Typography variant="h6" className={headerClasses.headerTitle} color={playing ? 'primary' : 'default'}>
        {player.argent}
      </Typography>
      {player.hand != null &&
        <Box >
<Box className={classes.carteContainer}>
  
          {player.hand.map((card, index) => (
            <Carte key={index} card={card} carte2={index === 1} retourne={!player.isHuman&&isRunning} />
          ))}
</Box>
        </Box>
      }
     {(player.choixJoueur||player.folded) && <StatusJoueur choix={player.choixJoueur} folded={player.folded} 
     shake={()=>{shakePlayer(player.joueurIndex)}}/>}
    </CardContent>

  </Card>
}


const StatusJoueur=({choix, folded,  shake})=>{
  const [bgcolor, Sicon, choixLabel] = useMemo(()=>{
    let    clr='rgba(20,0,0,0.3)';

    let ic=null;
    let lbl='En attente';
    if(folded){
      ic=ThumbDown;
      lbl='Couché';
    }
    else if(choix!=null){
      if(choix==='check'){
        ic=TouchApp;
        clr='rgba(0,102,10,0.7)';
        lbl='Check...';
      }
      else if(choix.startsWith('call')){

        ic=WavingHand;
        clr='rgba(0,12,102,0.7)';
        lbl='Je suis...';

      }
      else if(choix.startsWith('bet')){
        
        ic=Moving;       
         clr='rgba(120,12,10,0.7)';
         lbl='Je relance';

      }
      else if(choix.startsWith('TAPIS')){
        
        ic=Moving;       
         clr='rgba(250,12,10,0.7)';
         lbl='Tapis !';

      }
    }
    return [clr, ic,lbl];
  },[choix,folded])
  
    return <Box 
    sx={{display:'flex', backgroundColor:bgcolor,  textShadow: '2px 2px #db6900'
      , padding:'5px', fontWeight:'bold',fontSize:'18px', width:'100%',alignItems:'center',borderRadius:'5px',marginTop:'5px'
     }}
    onClick={shake}>
      <Sicon/>
{choixLabel} 
    </Box>
  //return    {player.choixJoueur != null && <Alert sx={{ position: 'relative', zIndex: 4 }} severity='info'>{player.choixJoueur}</Alert>}
   
}


export default PokerTable;