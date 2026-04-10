import React, { useEffect, useState } from "react";
import { Box, GlobalStyles } from "@mui/material";
import { ADNHandler } from "../../genetic/ADNPlante";
import explosionImg from '../../shootemup/images/explosion.gif';
import imgBug from '../bug_1.png';

import { generateRandomFirstName, generateRandomName } from '../../bitLife/utils/persoUtils';

// Calcule la position interpolée en pixels
function getInterpolatedPosition(creature, tileSize) {
  const from = creature.position;
  const dest = {x:creature.position.x+(creature.direction?.dx||0), y:creature.position.y+(creature.direction?.dy||0)}
  const to = creature.direction!=null?dest : creature.position;
  const t = creature.progress;

  return {
    x: (from.x + (to.x - from.x) * t) * tileSize,
    y: (from.y + (to.y - from.y) * t) * tileSize,
  };
}

export default function GodCreatureLayer({ creatures, tileSize , effects}) {
  return  <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none", // on laisse les clics passer à la grille
      }}
    >

<GlobalStyles
  styles={`
    @keyframes fertilePulse {
      0% {
        transform: scale(0.8);
        opacity: 0.6;
      }
      50% {
        transform: scale(1.2);
        opacity: 0.3;
      }
      100% {
        transform: scale(0.8);
        opacity: 0.6;
      }
    }

    .fertileEffect {
      position: absolute;
      border-radius: 50%;
      background: radial-gradient(rgba(0,255,0,0.3), rgba(0,255,0,0));
      animation: fertilePulse 1.5s infinite;
      pointer-events: none;
    }
@keyframes holyPulse {
    "0%":   { transform: "scale(0.95)", opacity: 0.2 },
    "50%":  { transform: "scale(1)",    opacity: 1.0 },
    "100%": { transform: "scale(0.95)", opacity: 0.2 },
  }
     
    @keyframes riseBloom {
      0% {
        transform: translateY(0);
        opacity: 1;
      }
      100% {
        transform: translateY(-40px);
        opacity: 0;
      }
    }

    .bloomEmoji {
      position: absolute;
      font-size: 24px;
      animation: riseBloom 1.8s ease-out forwards;
      pointer-events: none;
    }
  `}
/>

      {creatures.map((creature) => {
        const { x, y } = getInterpolatedPosition(creature, tileSize);

        return (
          <Box
            key={creature.id}
            sx={{
              position: "absolute",
              transform: `translate(${x}px, ${y}px)`,
              transition: "transform 100ms linear",
              width: tileSize * 0.8,
              height: tileSize * 0.8,
              backgroundColor: creature.color || "gray",
              borderRadius: "50%",
              borderWidth:'thick',
              border:creature.hunger>0.7?'2px dotted red':(creature.needForSex>0.7?'2px solid green':null),
              zIndex: 10,
            }}
          >
            <Box
        sx={{
          width: "100%",
          height: "100%",
          backgroundImage: `url(${imgBug})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: `contain`, 
        }}
      />

      {/* Icône charognard */}
      {creature.isCharognard && (
        <Box
          sx={{
            position: "absolute",
            bottom: 2,
            right: 2,
            fontSize: tileSize * 0.2,
            backgroundColor: "rgba(255,255,255,0.6)",
            borderRadius: "50%",
            px: "2px",
            lineHeight: 1,
          }}
        >
          🦴
        </Box>
      )}

      {/* Barre de faim en haut */}
      <Box
        sx={{
          position: "absolute",
          top: 1,
          left: 1,
          right: 1,
          height: 4,
          backgroundColor: "rgba(255,0,0,0.3)",
        }}
      >
        <Box
          sx={{
            width: `${Math.floor(creature.hunger * 100)}%`,
            height: "100%",
            backgroundColor: "red",
          }}
        />
      </Box>

      {/* Barre de libido en dessous */}
      <Box
        sx={{
          position: "absolute",
          top: 6,
          left: 1,
          right: 1,
          height: 3,
          backgroundColor: "rgba(255,105,180,0.3)",
        }}
      >
        <Box
          sx={{
            width: `${Math.floor(creature.needForSex * 100)}%`,
            height: "100%",
            backgroundColor: "hotpink",
          }}
        />
  </Box>
  </Box>
        );
      })}
      {effects.map((effect) =>{
        if(effect.type === "explosion"){
          return <img
            key={effect.id}
            src={explosionImg}
            alt="Explosion"
            style={{
              position: "absolute",
              left: effect.x * tileSize,              top: effect.y * tileSize,
              width: tileSize,              height: tileSize,
              pointerEvents: "none",
            }}
          />
        }
        else if(effect.type === "asteroide"){
          return <img
            key={effect.id}
            src={explosionImg}
            alt="Explosion"
            style={{
              position: "absolute",
              left: effect.x * tileSize,              top: effect.y * tileSize,
              width: tileSize*effect.radius,              height: tileSize*effect.radius, transform: "translate(-50%, -50%) scale(2)",
              pointerEvents: "none",
            }}
          />
        }
        else if(effect.type === "fertile"){
          return [...Array(3)].map((_, i) => (
    <div
      key={effect.id + "-bloom" + i}
      className="fertileEffect"
      style={{
        left: effect.x * tileSize + tileSize / 2 + Math.random() * 50*effect.radius - 25*effect.radius,
        top: effect.y * tileSize + tileSize / 2 + Math.random() * 50*effect.radius - 25*effect.radius,
        transform: "translate(-50%, -50%)",
        animationDelay: `${i * 0.3}s`,
      }}
    >
      🌱
    </div>
  ))
        } else if(effect.type === "holy"){
          return <Box
        key={effect.id}
        sx={{
          position: "absolute",
          left: (effect.x -  effect.radius) * tileSize,
          top: (effect.y -  effect.radius) * tileSize,
          width: tileSize * effect.radius*2,
          height:  tileSize * effect.radius*2,
    background: "radial-gradient(circle, rgba(242, 195, 229, 0.2) 0%, rgba(240, 48, 189, 0.1) 50%, transparent 100%)",
   
     animation: "flash linear 4s infinite",
          zIndex: 10,
          borderRadius:'50%',
          pointerEvents: "none",
        }}
      />
        }
        else if (effect.type === "colonne_divine") {
    return (
      <Box
        key={effect.id}
        sx={{
          position: "absolute",
          left: (effect.x - 0.5) * tileSize,
          top: 0,
          width: tileSize * 5,
          height: "100%",
          background: "linear-gradient(to bottom, rgba(255,255,0,0.5), transparent)",
          zIndex: 10,
          pointerEvents: "none",
          animation: "flash 0.4s ease-out",
        }}
      />
    );
  }
      }
)}


    </Box>
  
}


export const colorFromADN = (adnHandler) => {
    // Un float pour chaque composante
    const r = 100+Math.floor(adnHandler.readFloat('color_rouge') * 155);
    const g = 100+Math.floor(adnHandler.readFloat('color_vert') * 155); 
    const b = 100 +Math.floor(adnHandler.readFloat('color_bleu') * 155);  
    const a =  Math.min(1, (adnHandler.readFloat('alpha')+0.4)); 
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}
export const newCreature=(adn, type)=>{
 const adnHandler = new ADNHandler(adn);
 const ptiNom = generateRandomFirstName(adnHandler.readBool('chromosomY')?'M':'F')+' '+generateRandomName();
                    const creature = {
                        id: crypto.randomUUID(), adn: adn, adnHandler:adnHandler
                        , name:ptiNom
      ,progress: 0, hunger:0, needForSex:0, alive:true,
      isCharognard:adnHandler.readFloat('charognard')<0.1, //seulement 10% de charo au depart
      speed: adnHandler.readFloat('speed')/4,
      color: colorFromADN(adnHandler),
                    };
    return creature;
}

export function GodSpriteCreature({ tileSize, creature, children }) {
  const { x, y } = creature.position;
  const { hunger, needForSex, isCharognard } = creature;

  return (
    <Box
      sx={{
        position: "absolute",
        left: x * tileSize,
        top: y * tileSize,
        width: tileSize,
        height: tileSize,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {/* Sprite image centrée et contenue */}
      <Box
        sx={{
          width: "100%",
          height: "100%",
          backgroundImage: `url(${imgBug})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: `-${2 * 64}px 0px`, // frame 3, ligne 1
          backgroundSize: `${5 * 64}px auto`, // 5 frames de 64px côte à côte
          imageRendering: "pixelated",
        }}
      />

      {/* Icône charognard */}
      {isCharognard && (
        <Box
          sx={{
            position: "absolute",
            bottom: 2,
            right: 2,
            fontSize: tileSize * 0.2,
            backgroundColor: "rgba(255,255,255,0.6)",
            borderRadius: "50%",
            px: "2px",
            lineHeight: 1,
          }}
        >
          🦴
        </Box>
      )}

      {/* Barre de faim en haut */}
      <Box
        sx={{
          position: "absolute",
          top: 1,
          left: 1,
          right: 1,
          height: 4,
          backgroundColor: "rgba(255,0,0,0.3)",
        }}
      >
        <Box
          sx={{
            width: `${Math.floor(hunger * 100)}%`,
            height: "100%",
            backgroundColor: "red",
          }}
        />
      </Box>

      {/* Barre de libido en dessous */}
      <Box
        sx={{
          position: "absolute",
          top: 6,
          left: 1,
          right: 1,
          height: 3,
          backgroundColor: "rgba(255,105,180,0.3)",
        }}
      >
        <Box
          sx={{
            width: `${Math.floor(needForSex * 100)}%`,
            height: "100%",
            backgroundColor: "hotpink",
          }}
        />


      </Box>

      {children}
    </Box>
  );
}
