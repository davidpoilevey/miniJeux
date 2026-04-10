
// Knight.js (version corrigée)
import React, { useState, useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { useRPGContext } from './RPGContext';
import { getPersoSpriteConfig } from './hooks';

const Knight = ({ 
  scale = 1,
  action = 'idle',
  onAnimationComplete,
}) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const animationRef = useRef(null);
  const prevActionRef = useRef(action);

  const { 
    getSpriteStyle, 
    totalFrames, 
    animationSpeed, 
    shouldLoop,
  } = getPersoSpriteConfig(action);

  useEffect(() => {
    if (prevActionRef.current !== action) {
      setCurrentFrame(0);
      setIsAnimating(true);
      prevActionRef.current = action;
    }
  }, [action]);

  useEffect(() => {
    if (!isAnimating) return;
    const interval = setInterval(() => {
      setCurrentFrame(prev => {
        const next = prev + 1;
        if (next >= totalFrames) {
          if (shouldLoop) return 0;
          else {
            setIsAnimating(false);
            onAnimationComplete?.(action);
            return prev;
          }
        }
        return next;
      });
    }, animationSpeed);

    animationRef.current = interval;
    return () => clearInterval(interval);
  }, [isAnimating, totalFrames, animationSpeed, shouldLoop, onAnimationComplete]);

  return <KnightBox currentFrame={currentFrame} getSpriteStyle={getSpriteStyle} scale={scale} />;
};

const KnightBox = ({ getSpriteStyle, currentFrame, scale = 1 }) => {
  const { state } = useRPGContext();
  const { direction , knightAction} = state;
const isPushing = knightAction === 'pousse'; // ou un autre flag que tu utilises
  const translateOffset = isPushing ? (direction === 'right' ? '22px' : '-22px') : '0px';

  const transform = `
    scaleX(${direction === 'left' ? -scale : scale})
    scaleY(${scale})
    translateX(${translateOffset})
  `.trim();
  return (
    <Box
      sx={{
        position: 'relative', // CHANGÉ de absolute à relative car la position est gérée par le parent
        // left et top supprimés - c'est le parent UtopiaLand qui gère la position
       
        // Maintenant on gère UNIQUEMENT la direction ici
        transform,
        transformOrigin: 'center center',
        zIndex: 100,
        userSelect: 'none',
        pointerEvents: 'none',
        ...getSpriteStyle(currentFrame, scale),
        filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
      }}
    >
      {/* Indicateur d'état (optionnel, pour le debug) */}
      {process.env.NODE_ENV === 'development' && (
        <Box
          sx={{
            position: 'absolute',
            bottom: -30,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            fontSize: '0.7rem',
            fontFamily: 'monospace',
            whiteSpace: 'nowrap',
            pointerEvents: 'auto'
          }}
        >
          {`Dir: ${direction}`}
        </Box>
      )}
    </Box>
  );
};

export default React.memo(Knight, (prev, next) => prev.action === next.action);