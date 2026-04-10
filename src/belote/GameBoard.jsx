
import { Avatar, Box, Button, Chip, GlobalStyles, Paper, Tooltip, Typography } from '@mui/material';
import { keyframes, styled } from '@mui/material/styles';
import { Carte, suits } from '../poker/Card';
import { getPlayableCards, playersByPosition } from './beloteUtils';
import { useMemo, useRef, useState } from 'react';


const CardsContainer = styled(Box)({
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
});
const PlayerZone = styled(Box)(({ position }) => {
    const positions = {
        top: {
            position: 'absolute',
            top: '70px',
            left: '50%',
            transform: 'translateX(-50%)',
        },
        left: {
            position: 'absolute',
            left: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
        },
        right: {
            position: 'absolute',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
        },
        bottom: {
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
        },
    };

    return positions[position];
});

const AnimatedCenterZone = styled(Box, {
    shouldForwardProp: prop =>
        prop !== 'collecting' && prop !== 'winner'
})(({ collecting, winner }) => ({
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '400px',
    height: '300px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'transform 0.7s ease-in',
    transform: collecting
        ? getCollectTransform(winner)
        : 'translate(-50%, -50%)'
}));


const getCollectTransform = winner => {
    switch (winner) {
        case 'top':
            return 'translate(-50%, -120%) scale(0.3)';
        case 'bottom':
            return 'translate(-50%, 40%) scale(0.3)';
        case 'left':
            return 'translate(-120%, -50%) scale(0.3)';
        case 'right':
            return 'translate(40%, -50%) scale(0.3)';
        default:
            return 'translate(-50%, -50%)';
    }
};


export const GameBoardTrouduc = ({  ...props }) => {

    return <GameBoardCore sortedHand={props.playerHands?.bottom}
     {...props}/>
}
export const GameBoardScopa = ({  ...props }) => {

    return <GameBoardCore sortedHand={props.playerHands.bottom}
     playable={props.playerHands.bottom} {...props}/>
}
export const GameBoard = ({ couleurDemandee, atout
    , currentTrick,trickWinner, isCollectingTrick, ...props }) => {


    const sortedHand = sortHand(props.playerHands.bottom, atout);
    const playable = getPlayableCards(sortedHand, props.couleurDemandee, atout);
    return <GameBoardCore sortedHand={sortedHand} playable={playable} {...props}>
         {/* Zone centrale - Pli en cours */}
        <AnimatedCenterZone
            collecting={isCollectingTrick}
            winner={trickWinner}
        >


            {currentTrick.left && (
                <PlayedCard position="left">

                    <Carte
                        card={currentTrick.left}
                        retourne={false}
                    />
                </PlayedCard>
            )}

            {currentTrick.right && (
                <PlayedCard position="right">
                    <Carte
                        card={currentTrick.right}
                        retourne={false}
                    />
                </PlayedCard>
            )}

            {currentTrick.bottom && (
                <PlayedCard position="bottom">
                    <Carte
                        card={currentTrick.bottom}
                        retourne={false}
                    />
                </PlayedCard>
            )}
            {currentTrick.top && (
                <PlayedCard position="top">
                    <Carte
                        card={currentTrick.top}
                        retourne={false}
                    />
                </PlayedCard>
            )}
        </AnimatedCenterZone>

    </GameBoardCore>
}


const dealerStyle = {
  boxShadow: '0 0 18px rgba(255,215,0,0.9)',
  border: '3px solid gold',
  animation: 'pulse 1.5s infinite'
};

export const GameBoardCore = ({ playerHands,currentDealer, currentPlayer,passes, playable, lastAction, sortedHand, passButton, handleCardClick , children}) => {
 const humanIsDealer = currentDealer === 'bottom';
  const humanIsCurrent = currentPlayer === 'bottom'||currentPlayer==null;
  const humanHasPassed = passes instanceof Set ? passes.has('bottom') : false;

  if(!humanIsCurrent)
    playable=[];
    return <>
    <GlobalStyles
        styles={{
          '@keyframes pulse': {
            '0%': { boxShadow: '0 0 10px rgba(255,215,0,0.6)' },
  '50%': { boxShadow: '0 0 22px rgba(255,215,0,0.95)' },
  '100%': { boxShadow: '0 0 10px rgba(255,215,0,0.6)' }
          }
        }}
      />
        <PlayerZone position="top">
            <AIPlayer
                name={'top'} currentDealer={currentDealer} 
                currentPlayer={currentPlayer}
                passes={passes} lastAction={lastAction}
                cardsCount={playerHands.top.length}
            />
        </PlayerZone>

        {/* Joueur de gauche */}
        <PlayerZone position="left">
            <AIPlayer currentDealer={currentDealer}
                currentPlayer={currentPlayer}
                passes={passes}
                name={'left'} lastAction={lastAction}
                cardsCount={playerHands.left.length}
            />
        </PlayerZone>

        {/* Joueur de droite */}
        <PlayerZone position="right">
            <AIPlayer currentDealer={currentDealer}
                currentPlayer={currentPlayer}
                passes={passes}
                name={'right'} lastAction={lastAction}
                cardsCount={playerHands.right.length}
            />
        </PlayerZone>

       {children}
        {/* Joueur humain en bas */}
        <PlayerZone position="bottom">
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <AIPlayerCard elevation={3}>
                    <Box sx={{ position: 'relative' }}>
                        {humanHasPassed && (
          <Typography
            sx={{
              position: 'absolute',
              right: -10,
              top: -10,
              fontSize: '1.1rem'
            }}
          >
            ⛔
          </Typography>
        )}
        {humanIsDealer && (
          <Typography
            sx={{
              position: 'absolute',
              top: -12,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '1.2rem'
            }}
          >
            👑
          </Typography>
        )}
        <Avatar src={playersByPosition.bottom.avatar} 
        sx={{ bgcolor: '#57ab74', border: '2px solid white'
             ,...(humanIsDealer ? dealerStyle : {})
         }}>

                    </Avatar>
                    </Box>
                    <Box sx={{display:'flex', gap:4}}>
                      {passButton &&<Button color='primary'
                      variant={playable.length==0?'contained':'outlined'}
                       onClick={passButton}>Passer</Button>}
                       <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {playersByPosition.bottom.name}
                    </Typography>
                     </Box>
                    <CardsContainer>
                        {sortedHand.map((card, index) => {
                            const isPlayable = playable.includes(card);

                            return (
                                <Tooltip  key={index} title={!isPlayable ? 'Vous devez fournir ou couper' : ''}>
                                    <Box
                                       
                                        onClick={isPlayable ? () => handleCardClick(card) : undefined}
                                        sx={{
                                            marginLeft: index === 0 ? 0 : '-30px',
                                            cursor: isPlayable ? 'pointer' : 'not-allowed',
                                            transition: 'transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease',

                                            filter: isPlayable ? 'none' : 'brightness(50%)',
                                            pointerEvents: isPlayable ? 'auto' : 'none',

                                            '&:hover': isPlayable
                                                ? {
                                                    transform: 'translateY(-12px) scale(1.05)',
                                                    boxShadow: '0px 8px 20px rgba(0,0,0,0.3)',
                                                    zIndex: 10
                                                }
                                                : {}
                                        }}
                                    >

                                        <Carte card={card} retourne={false} />

                                    </Box></Tooltip>
                            );
                        })}
                    </CardsContainer>


                </AIPlayerCard>
            </Box>
        </PlayerZone>
    </>
}



export const TRUMP_ORDER = ["V", "9", "A", "10", "R", "D", "8", "7"];
export const NORMAL_ORDER = ["A", "10", "R", "D", "V", "9", "8", "7"];
function sortHand(hand, atout) {
    return [...hand].sort((a, b) => {
        // 1️⃣ Couleur
        const suitDiff =
            suits.indexOf(a.suit) - suits.indexOf(b.suit);

        if (suitDiff !== 0) return suitDiff;

        // 2️⃣ Valeur selon atout ou non
        const order =
            a.suit === atout ? TRUMP_ORDER : NORMAL_ORDER;

        return order.indexOf(a.rank.name) - order.indexOf(b.rank.name);
    });
}


const AIPlayerCard = styled(Paper)({
    padding: '12px 20px',
    backgroundColor: '#3d6a4d',
    overflow: 'hidden',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    minWidth: '150px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
});




const PlayedCard = styled(Box)(({ position }) => {
    const positions = {
        top: { top: '0', left: '50%', transform: 'translateX(-50%)' },
        left: { left: '0', top: '50%', transform: 'translateY(-50%)' },
        right: { right: '0', top: '50%', transform: 'translateY(-50%)' },
        bottom: { bottom: '0', left: '50%', transform: 'translateX(-50%)' },
    };

    return {
        position: 'absolute',
        width: '80px',
        height: '120px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '24px',
        fontWeight: 'bold',
        ...positions[position],
    };
});

const popIn = keyframes`
  0% {
    transform: scale(0) translateY(10px);
    opacity: 0;
  }
  50% {
    transform: scale(1.1) translateY(0);
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
`;
const ActionBubbleStyled = styled(Paper)(({ actiontype, position, isFading }) => {
  const colors = {
    fold: '#c41e3a',
    check: '#5a8a6d',
    call: '#2e7d32',
    raise: '#f57c00',
    allin: '#d32f2f',
  };
  
  // Positions adaptées selon le joueur
  const positions = {
    top: {
      top: '100%',
      right: '-50px',
      transform: 'translateY(-50%)',
    },
    left: {
      top: '50%',
      right: '-120px',
      transform: 'translateY(-50%)',
    },
    right: {
      top: '50%',
      left: '-120px',
      transform: 'translateY(-50%)',
    },
    bottom: {
      top: '-60px',
      left: '50%',
      transform: 'translateX(-50%)',
    },
  };
  
  return {
    position: 'absolute',
    ...positions[position],
    backgroundColor: colors[actiontype] || '#5a8a6d',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '20px',
    fontWeight: 'bold',
    fontSize: '14px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
    animation: `${popIn} 0.3s ease-out`,
    zIndex: 1000,
    whiteSpace: 'nowrap',
    border: '2px solid white',
    opacity: isFading ? 0.4 : 1,
    transition: 'opacity 0.5s ease-out',
  };
});

const ActionBubble = ({ action, position }) => {
  if (!action) return null;
  
  return (
    <ActionBubbleStyled 
      actiontype={action.action}
      position={position}
      isFading={action.isFading}
    >
      {action.label}
    </ActionBubbleStyled>
  );
};


// Composant pour afficher un joueur IA
const AIPlayer = ({ name, cardsCount, currentDealer, currentPlayer, passes, lastAction }) => {
  const isDealer = currentDealer === name;
  const isCurrent = currentPlayer === name;
  const hasPassed = passes instanceof Set ? passes.has(name) : false;
  const playerAction = useRef();
  const actionWithFading = useMemo(()=>{
  const showAction = lastAction && lastAction.player === name;
    if(showAction)
      playerAction.current=lastAction;
    
    return {...playerAction.current, isFading:!showAction}
}
  ,[lastAction]);

  return ( <Box sx={{ position: 'relative' }}>
      
        <ActionBubble 
        action={actionWithFading} 
        position={name}
      />
      
    <AIPlayerCard
      elevation={isCurrent ? 8 : isDealer ? 6 : 3}
      sx={{
        opacity: hasPassed ? 0.4 : 1,
        filter: hasPassed ? 'grayscale(80%)' : 'none',
        transform: isCurrent ? 'translateY(-6px)' : 'none',
        transition: 'all 0.25s ease',
        border: isCurrent ? '2px solid #7CFFB2' : '2px solid transparent',
        boxShadow: isCurrent
          ? '0 0 16px rgba(124,255,178,0.8)'
          : undefined
      }}
    >
      <Box sx={{ position: 'relative' }}>
        {/* Président */}
        {isDealer && (
          <Typography
            sx={{
              position: 'absolute',
              top: -14,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '1.3rem'
            }}
          >
            👑
          </Typography>
        )}

        {/* Joueur courant */}
        {isCurrent && (
          <Typography
            sx={{
              position: 'absolute',
              bottom: -18,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '1.1rem'
            }}
          >
            ▶️
          </Typography>
        )}

        {/* A passé */}
        {hasPassed && (
          <Typography
            sx={{
              position: 'absolute',
              right: -10,
              top: -10,
              fontSize: '1.1rem'
            }}
          >
            ⛔
          </Typography>
        )}

        <Avatar
          src={playersByPosition[name].avatar}
          sx={{
            bgcolor: '#2d5a3d',
            border: '2px solid white'
          }}
        />
      </Box>

      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
        {playersByPosition[name].name}
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
        {[...Array(cardsCount)].map((_, i) => (
          <Box key={'ai-' + i} sx={{ marginLeft: -2 }}>
            <Carte
              width={30}
              height={45}
              card={{}}
              retourne
            />
          </Box>
        ))}
      </Box>
    </AIPlayerCard>
    </Box>
  );
};
