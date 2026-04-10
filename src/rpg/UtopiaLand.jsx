// UtopiaLand.js - Modifié avec système d'interaction
import { Box, GlobalStyles } from "@mui/material";
import Knight from "./Knight";
import { useEffect, useState } from "react";
import { useRPGContext } from "./RPGContext";
import { launchFall, launchJump, moveWithCollision } from "./rpgUtils";
import MatosLayer from "./MatosLayer";
import imglayer1 from './images/layer1.png';
import imglayer2 from './images/layer2.png';
import imglayer3 from './images/layer3.png';
import imglayer4 from './images/layer4.png';
import imglayer5 from './images/layer5.png';
import KnightStatsPanel from "./ptiComponents/StatPanel";

export const UtopiaLand = () => {
  const { state, dispatch, safeMoveTo, collisionSystem, handleKnightAttack, nextLevel } = useRPGContext();
  const { knightAction, knightPos, direction, nearbyInteractables, mapWidth, speed } = state;

  useEffect(() => {
    // pour toutes les actions qui declenche autre chose apres un certain temps
    let timeout = null, interval = null;
    if (knightAction === "saut") {
      interval = launchJump(knightPos, dispatch, direction, safeMoveTo, collisionSystem);
    }
    if (knightAction === "grimpeEnHaut") {
      timeout = setTimeout(() => {
        dispatch({ type: "END_GRIMPETTE", payload: "idle" });
      }, 1200);
    }

    if (knightAction === "tombe") {
      interval = launchFall(knightPos, direction, speed, dispatch, safeMoveTo, collisionSystem);

    }

    return () => {
      if (timeout)
        clearTimeout(timeout);
      if (interval)
        clearInterval(interval);
    }
  }, [knightAction]);

  // NextLevel transition
  useEffect(() => {
  if (state.transitionToNextLevel) {
    setTimeout(() => {
      nextLevel();
    }, 1500); // délai pour laisser l’effet
  }
}, [state.transitionToNextLevel]);


  // Gestion du mouvement continu pour la marche
  useEffect(() => {
    if (knightAction !== 'marche'&&knightAction !== 'accroupiMarche') return;

    const moveInterval = setInterval(() => {
      moveWithCollision(knightPos, direction, knightAction === 'accroupiMarche'?2:3, safeMoveTo);
    }, 10);

    return () => clearInterval(moveInterval);
  }, [knightAction, direction, knightPos]);

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%', backgroundColor: '#87CEEB' }}>
      <ParallaxBackground offsetX={knightPos.x / 4} mapWidth={mapWidth}/>
      <KnightStatsPanel />
      <MatosLayer />

      {/* Knight */}
      <Box
        sx={{
          position: 'absolute',
          left: knightPos.x,
          top: knightPos.y,
          filter: state.isInvincible ? 'drop-shadow(0 0 10px cyan)' : 'none',
          transition: 'left 0.1s linear, top 0.1s linear',
        }}
      >
        <Knight
          action={knightAction}
          onAnimationComplete={(action) => {
            if (action.startsWith('attaque')) {
              handleKnightAttack();
            }
            dispatch({ type: "END_ANIMATION" });

          }}
        />
      </Box>

{state.transitionToNextLevel && (
  <FadeOverlay
    color={'#000'}
    duration={2000}
  />
)}



      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: 1,
            borderRadius: 1,
            fontSize: '0.7rem',
            fontFamily: 'monospace'
          }}
        >
          Pos: {Math.round(knightPos.x)}, {Math.round(knightPos.y)} |
          Action: {knightAction} |
          Direction: {direction} |
          Interactables: {nearbyInteractables.length}
        </Box>
      )}
      <GlobalStyles
    styles={{
      '@keyframes fadeBlackOut': {
        '0%': { opacity: 0 },
        '50%': { opacity: 0.8 },
        '100%': { opacity: 0 }
      }
    }}
  />
    </Box>
  );
};

function FadeOverlay({ color = '#000', duration = 1000 }) {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: color,
        zIndex: 9999,
        pointerEvents: 'none',
        animation: `fadeBlackOut ${duration}ms ease-in-out forwards`
      }}
    />
  );
}

const ParallaxBackground = ({ offsetX = 0, mapWidth = 3000 }) => {
  const layers = [
    { src: imglayer5, speed: 0.2 },
    { src: imglayer4, speed: 0.4 },
    { src: imglayer3, speed: 0.6 },
    { src: imglayer2, speed: 0.8 },
    { src: imglayer1, speed: 1.0 },
  ];

  return (
    <Box sx={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0 }}>
      {layers.map((layer, index) => (
        <Box
          key={index}
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundImage: `url(${layer.src})`,
            backgroundRepeat: 'repeat-x',
            backgroundPosition: `${-offsetX * layer.speed}px 0`,
            backgroundSize: 'auto 100%',
            pointerEvents: 'none',
          }}
        />
      ))}
    </Box>
  );
};
