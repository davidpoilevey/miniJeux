// Deck.js
import React from 'react';
import imgRoi from './roi.png';
import imgReine from './reine.png';
import imgValet from './valet.png';
import { Box, Card, CardContent, Typography } from "@mui/material";
import { makeStyles } from '@mui/styles';
import dos from './dosDeCarte.png';
import { getCardColor, getSuitSymbol } from '../belote/BeloteBar';


const ranks = [{name:'2', value:2},
{name:'3', value:3},
{name:'4', value:4},
{name:'5', value:5},
{name:'6', value:6},
{name:'7', value:7},
{name:'8', value:8},
{name:'9', value:9},
{name:'10', value:10},
{name:'V', value:11, label:"Valet"},
{name:'D', value:12, label:"Dame"},
{name:'R', value:13,label:"Roi"},
{name:'A', value:14, label:"As"}];
export const suits = ['pique', 'coeur', 'carreau', 'trèfle'];
export const carteNameByValue = value=>{
  let name='Inconnue';
  ranks.forEach(c=>{
    if(c.value===Number(value))
      name=c.label||c.name;
  })
  return name;
}
export const createDeck = (opts = { carte32: false, scopa: false }) => {
  const deck = [];

  for (let suit of suits) {
    for (let rank of ranks) {

      // belote 32
      if (opts.carte32 && rank.value < 7) continue;

      // scopa : on enlève 8, 9, 10
      if (opts.scopa && ['8', '9', '10'].includes(rank.name)) continue;

      let adjustedRank = rank;

      if (opts.scopa) {
        // copie pour ne pas muter l'objet global
        adjustedRank = { ...rank };

        if (rank.name === 'A') {
          adjustedRank.value = 1;
        } else if (rank.name === 'D') {
          adjustedRank.value = 8;
        } else if (rank.name === 'V') {
          adjustedRank.value = 9;
        } else if (rank.name === 'R') {
          adjustedRank.value = 10;
        }
      }

      deck.push({ rank: adjustedRank, suit });
    }
  }

  return shuffle(deck);
};

export const shuffle = (deck) => {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  
    return deck;
  };

  export const useCardStyles = makeStyles((theme) => ({
    carteContainer: {
        display:'flex',flexDirection:'row',
      position: 'relative',
      marginLeft: theme.spacing(2), // Espacement entre les cartes
    },
    alertStyle:{
      zIndex:2,
      position:'relative'
    },
    joueurCardRoot: {
      background: 'linear-gradient(45deg, #ffd700, #ffaf00)', // Dégradé doré en diagonale
      padding: '12px', // Espacement intérieur du header
    },
  }));

  export const Carte = React.forwardRef(
  ({ card, carte2 = false, retourne = false , width=80, height=120}, ref) => {
    const suitSymbol = getSuitSymbol(card.suit);
    const suitColor = getCardColor(card.suit);

    return (
      <Card
        ref={ref}
        sx={{
          position: 'relative',
          minWidth: width,
          minHeight: height,
          borderRadius: 2,
          boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
          background: retourne ? `url(${dos})` : '#fafafa',
          backgroundSize: 'cover',
          transform: carte2 ? 'rotate(10deg) translateX(-10px)' : 'none',
          transition: 'transform 0.2s ease'
        }}
      >
        {!retourne && (
          <>
            {/* Coin haut gauche */}
            <Box
              sx={{
                position: 'absolute',
                background: 'linear-gradient(#fff, #f3f3f3)',
                top: 6,
                left: 6,
                color: suitColor,
                textAlign: 'center'
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                {card.rank.name}
              </Typography>
              <Typography sx={{ fontSize: 16 }}>{suitSymbol}</Typography>
            </Box>

            {/* Centre */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: 40,
                color: suitColor,
                opacity: 0.85
              }}
            >
             <CardMiddle suitSymbol={suitSymbol} name={card.rank.name}/> 
            </Box>

            {/* Coin bas droit (miroir) */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 6,
                right: 6,
                transform: 'rotate(180deg)',
                color: suitColor,
                textAlign: 'center'
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                {card.rank.name}
              </Typography>
              <Typography sx={{ fontSize: 16 }}>{suitSymbol}</Typography>
            </Box>
          </>
        )}
      </Card>
    );
  }
);


const CardMiddle=({name, suitSymbol})=>{
  let img=null;
  switch(name){
    case 'R':
      img=imgRoi;break;
    case 'D':
      img=imgReine;break;
    case 'V':
      img=imgValet;break;
    default:
  }
  if(img!=null)
    return <img src={img} alt={name} height={50}/>
  else
    return suitSymbol
}