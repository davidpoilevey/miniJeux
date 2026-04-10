import React, { useState, useEffect, useRef, useMemo } from "react";
import { Box, Button, Typography } from "@mui/material";
import Mee from "./Mee";
import { getClanPositions } from "./meeUtils";
import imgPlace from './placeVillage.jpg';
import MeeDialog from "./MeeDialog";



const STEP = 40;
const RAYON_PLACE=60;

const MeeBoard = ({ initialMee = [], setPhase, setPhaseAndUpdate, phase, meteo, VERGER_WIDTH, VERGER_HEIGHT }) => {
  const [mees, setMees] = useState(initialMee);

  const [bordPositions, setBordPositions] = useState({});
  const center = { x: VERGER_WIDTH / 2, y: VERGER_HEIGHT / 2 };

  useEffect(() => {
     setBordPositions(getClanPositions(initialMee, VERGER_WIDTH, VERGER_HEIGHT));
     
    setMees(initialMee);

  }, [initialMee,VERGER_WIDTH,VERGER_HEIGHT]);




useEffect(() => {
  let anim;
  if (phase === "depart" || phase === "retour") {
    anim = setInterval(() => {
      const newMees = mees.map((mee, idx, ms) => {
          const bord = bordPositions[mee.id] || { x: 0, y: 0 };
          let to;
          if (phase === "depart") {
            // Mee cible une place sur le cercle central
            to = getMeePlacePosition(idx, ms.length, center.x, center.y, RAYON_PLACE);
          } else {
            to = bord;
          }
          const dx = to.x - mee.x;
          const dy = to.y - mee.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const step = Math.min(18, dist);
          if (dist < 2) return { ...mee, x: to.x, y: to.y };
          return {
            ...mee,
            x: mee.x + (dx / dist) * step,
            y: mee.y + (dy / dist) * step
          };
        })
      setMees(newMees);
       // Fin de l'animation
        if (newMees.every(mee => {
          const dest = phase === "depart" ? center : bordPositions[mee.id];
          if(dest==null||mee==null)
            return true;
          return Math.abs(mee.x - dest.x) <= RAYON_PLACE && Math.abs(mee.y - dest.y) <= RAYON_PLACE;
        })) {
         setPhaseAndUpdate(newMees, phase === "depart" ? "verger" : "maison");
        }
    }, 16);
  }
  return () => clearInterval(anim);
}, [phase, bordPositions,mees]);

  // Animation
  // useEffect(() => {
  //   let anim;
  //   if (phase === "depart" || phase === "retour") {
  //     anim = setInterval(() => {
  //       setMees(ms =>
  //         ms.map(mee => {
  //           const bord = bordPositions[mee.id] || { x: 0, y: 0 };
  //           const from = phase === "depart" ? bord : center;
  //           const to = phase === "depart" ? center : bord;
  //           // Mouvement linéaire simple
  //           const dx = to.x - mee.x;
  //           const dy = to.y - mee.y;
  //           const dist = Math.sqrt(dx * dx + dy * dy);
  //           const step = Math.min(8, dist); // Vitesse
  //           if (dist < RAYON_PLACE) return { ...mee, x: to.x, y: to.y };
  //           return {
  //             ...mee,
  //             x: mee.x + (dx / dist) * step,
  //             y: mee.y + (dy / dist) * step
  //           };
  //         })
  //       );
  //       // Fin de l'animation
  //       if (mees.every(mee => {
  //         const dest = phase === "depart" ? center : bordPositions[mee.id];
  //         return Math.abs(mee.x - dest.x) < RAYON_PLACE && Math.abs(mee.y - dest.y) < RAYON_PLACE;
  //       })) {
  //         setPhaseAndUpdate(mees, phase === "depart" ? "verger" : "maison");
  //       }
  //     }, 16);
  //   }
  //   return () => clearInterval(anim);
  // }, [phase, bordPositions, mees]);

  

  // Boutons pour lancer les phases
  return (
    <Box style={{
      position: 'relative',
    margin: '14px',
    height: VERGER_HEIGHT,
    width: VERGER_WIDTH,
    background: `url(${imgPlace})`,
    backgroundSize: 'contain',
    backgroundPosition:'center',
    backgroundRepeat:'no-repeat',backgroundColor:'#FFF',
    borderRadius: '24px',
    border: '6px solid',
    borderImage: 'linear-gradient(90deg, #43cea2, #185a9d) 1',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15), 0 1.5px 8px 0 rgba(60,60,60,0.08)'
    }}>

      {/* Verger */}
      <Verger onClick={evt => { setPhase('depart') }} phase={phase}
      meeLength={phase === 'retour' ? 0 : mees.length} meteo={meteo} />

      {mees.map(mee => (
        <Mee key={'meeB'+mee.id} mee={mee}/>
      ))}


    </Box>
  );
}

export default MeeBoard;

function getMeePlacePosition(i, total, centerX, centerY, rayon = RAYON_PLACE) {
  // Répartit les Mee régulièrement sur le cercle
  const angle = (2 * Math.PI * i) / total;
  return {
    x: centerX + rayon * Math.cos(angle),
    y: centerY + rayon * Math.sin(angle)
  };
}
const Verger = ({ meeLength, meteo, onClick, phase }) => {

  // Animation douce du nombre de pommes affichées
  const minPommes = Math.min(10, meeLength);
  const maxPommes = meeLength === 0 ? 0 : 10;
  const bonusNorm = Math.max(-2, Math.min(2, meteo.bonusPommes || 0));
  const ratio = (bonusNorm + 2) / 4;
  const nbPommesCible = Math.round(minPommes + (maxPommes - minPommes) * ratio);
  const [nbPommes, setNbPommes] = useState(nbPommesCible);

  useEffect(() => {
    setNbPommes(nbPommesCible);
    // if (nbPommes === nbPommesCible) return;
    // const timeout = setTimeout(() => {
    //   setNbPommes(nbPommes + Math.sign(nbPommesCible - nbPommes));
    // }, 50); // vitesse de transition (ms)
    // return () => clearTimeout(timeout);
  }, [nbPommes, nbPommesCible]);
  return (
    <Box
      onClick={onClick}
      sx={{
        width: '50%',
        height: '20%',
        top:'10px',right:'10px',marginLeft:'auto',
        background: meteo.background || "#efe",
        backgroundSize:'cover',
        border: "2px solid #bbb",
        borderRadius: 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        flexDirection: "column",
        position: "relative",
        boxShadow: 3,
        cursor: "pointer",
        transition: "background 0.4s"
      }}
    >
      <Typography variant="h6" sx={{ mt: 1, color: "#333" }}>
        Verger
      </Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>
        Météo : <b>{meteo.nom}</b> {meteo.bonusPommes > 0 ? "☀️" : meteo.bonusPommes < 0 ? "❄️" : "🌤️"}
      </Typography>
                 <Typography variant="caption" color={'primary'}>{phase}</Typography>
      {/* <Box
        sx={{
          width: "90%",
          height: "75%",
          display: "flex",
          flexWrap: "wrap",
          alignContent: "flex-end",
          justifyContent: "center",
          overflow: "hidden",
          pb: 2
        }}
      >
        {Array.from({ length: Math.max(0, nbPommes) }).map((_, i) => (
          <span
            key={'pomme'+i}
            role="img"
            aria-label="pomme"
            style={{
              fontSize: 28,
              margin: "2px",
              filter: meteo.bonusPommes < 0 ? "grayscale(0.6)" : "none"
            }}
          >
            {i % 3 === 0 ? "🍏" : "🍎"}
          </span>
        ))}
      </Box> */}
      <Typography variant="caption" sx={{ color: "#333", mb: 1 }}>
        {nbPommes} pommes disponibles
      </Typography>
    </Box>
  );
};



