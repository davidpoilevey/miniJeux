import { Box } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getPersoSpriteConfig } from "../hooks";


// gameEntities.js - Définition des entités du jeu
export const ENTITY_TYPES = {
  OBSTACLE: 'obstacle',      // Bloque le mouvement
  INTERACTABLE: 'interactable', // Peut être activé (portes, coffres)
  TRIGGER: 'trigger',        // Déclenche une action au contact
  ENEMY: 'enemy',           // Ennemi
  ITEM: 'item'              // Objet à ramasser
};

// Classe de base pour tous les entities si tu veux de l'héritage
export class BaseEntity {
  constructor(x, y, id, type) {
    this.id = id;
    this.type = type;
    this.x = x;
    this.y = y;
  }
  onHit(){
    // when user hits
  }
  isObstacle() {
    return false;
  }

  isTrigger() { // if true must have onContact(state, dispatch)
    return false;
  }

  isInteractable() { // must have onInteract(state,dispatch) if true
    return false;
  }
}

export const EntityUI = React.memo(React.forwardRef(({completeObj, getEntity,
 onAnimationComplete=()=>{}},ref)=>{
    
    const {position, direction:objectDirection='right', objStatus
      , entity:objectType, monster, scale, startAnimated} = completeObj
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isAnimating, setIsAnimating] = useState(startAnimated);
  const animationRef = useRef(null);
  const prevActionRef = useRef(objStatus);
  const objRef = useRef(completeObj);

  objRef.current = completeObj;

const entity = getEntity(completeObj.id);
  const { 
    getSpriteStyle, 
    totalFrames, 
    animationSpeed, 
    shouldLoop,
  } = useMemo(() => {
  return getPersoSpriteConfig(objectType, monster ? 'monster' : 'object', objStatus);
}, [objectType, monster, objStatus])
  useEffect(() => {
    if (prevActionRef.current !== objStatus) {
      setCurrentFrame(0);
      setIsAnimating(true);
      prevActionRef.current = objStatus;
    }
  }, [objStatus]);

  useEffect(() => {
    if (!isAnimating) return;
    const interval = setInterval(() => {
      setCurrentFrame(prev => {
        
        const next = prev + 1;
        if (next >= totalFrames) {
          if (shouldLoop) return 0;
          else {
            setIsAnimating(false);
            onAnimationComplete?.(objRef.current);
            return prev;
          }
        }
        return next;
      });
    }, animationSpeed);

    animationRef.current = interval;
    return () => clearInterval(interval);
  }, [isAnimating, totalFrames, animationSpeed, shouldLoop, onAnimationComplete]);

    return <Box ref={ref}
        sx={{
          position: 'absolute', 
          left: position.x,
          top: position.y,
          transition: 'left 0.1s linear, top 0.1s linear',
        }}
      >
        <Box
              sx={{
                position: 'relative', // CHANGÉ de absolute à relative car la position est gérée par le parent
                // left et top supprimés - c'est le parent UtopiaLand qui gère la position
               
                // Maintenant on gère UNIQUEMENT la direction ici
                transform: objectDirection === 'left' 
                  ? `scaleX(-${scale}) scaleY(${scale})` 
                  : `scaleX(${scale}) scaleY(${scale})`,
                transformOrigin: 'center center',
                zIndex: 100,
                userSelect: 'none',
                pointerEvents: 'none',
                ...getSpriteStyle(currentFrame),
                filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
              }}
            ></Box>
            { entity.collisionBox && (
  <Box
    sx={{
      position: 'absolute',
      left: entity.collisionBox.offsetX,
      top: entity.collisionBox.offsetY,
      width: entity.collisionBox.width,
      height: entity.collisionBox.height,
      border: '1px dotted yellow',
      zIndex: 999
    }}
  />
)}

      </Box>
}), (prevProps, nextProps) => {
  return (
    prevProps.onAnimationComplete === nextProps.onAnimationComplete &&
    prevProps.completeObj.position.x === nextProps.completeObj.position.x &&
    prevProps.completeObj.position.y === nextProps.completeObj.position.y &&
    prevProps.completeObj.objStatus === nextProps.completeObj.objStatus
  );
});


