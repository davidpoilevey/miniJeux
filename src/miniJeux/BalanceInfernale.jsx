import React, { useState, useRef, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { GameOver } from "../ChuckNorrisFact";

const TIME_SESSION = 20; // durée totale de la partie en ss
export default function BalanceInfernale() {
  const [pivotX, setPivotX] = useState(50); // pivot en %
  const angleRef = useRef(0); // angle actuel en degrés
  const [weights, setWeights] = useState([{ xPercent: 40, mass: 1 }]); // objets fixés sur la barre
  const [fallingObjects, setFallingObjects] = useState([]); // objets en chute
  const [isGameOver, gameOver] = useState(false);
  const [score, setScore] = useState(0);

  const barRef = useRef(null);

  const [time, setTime] = useState(TIME_SESSION); // chrono global
  const [zones, setZones] = useState({ green: 0, yellow: 0, red: 0 });

  const lastZoneRef = useRef("green");

  const reset = () => {
    setWeights([]);
    setFallingObjects([]);
    angleRef.current=0;
    setTime(TIME_SESSION);
    setZones({ green: 0, yellow: 0, red: 0 });
    setScore(0);
    gameOver(false);
  };
  

  const handleMove = (e) => {
    if (!barRef.current) return;

    let clientX;
    if (e.type.startsWith("touch")) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }

    const rect = barRef.current.getBoundingClientRect();
    let newX = ((clientX - rect.left) / rect.width) * 100;
    newX = Math.max(0, Math.min(100, newX)); // clamp
    setPivotX(newX);
  };

  // Boucle physique
  useEffect(() => {
    let animationFrame;
    const update = () => {
      if (!barRef.current) return;

      const rect = barRef.current.getBoundingClientRect();
      const pivotPos = (pivotX / 100) * rect.width;

      // Calcul du moment total
      let totalMoment = 0;
      weights.forEach((w) => {
        const weightPos = (w.xPercent / 100) * rect.width;
        const distance = weightPos - pivotPos;
        totalMoment += distance * w.mass;
      });

      // petite physique simplifiée
      const torqueFactor = 0.0005; // sensibilité
      const damping = 0.998; // amortissement
angleRef.current = (angleRef.current + totalMoment * torqueFactor) * damping;
     
       // Mise à jour des objets qui tombent
 
setFallingObjects((objs) => {
    if(barRef.current==null) return objs;
  const rect = barRef.current.getBoundingClientRect();
  const barTop = rect.top;

  const remaining = [];
  const landed = [];
  objs.forEach((o) => {
    const newY = o.y + o.speed;
    if (newY >= barTop - 20) {
      landed.push({ ...o });
    } else {
      remaining.push({ ...o, y: newY });
    }
  });

  if (landed.length > 0) {
    setWeights((ws) => [...ws, ...landed]);
  }
  return remaining;
});

      animationFrame = requestAnimationFrame(update);
    };

    animationFrame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrame);
  }, [pivotX, weights]);
  // Spawn d’un objet toutes les secondes
  useEffect(() => {
    const interval = setInterval(() => {
      const xPercent = Math.random() * 100;
      const mass = 0.5 + Math.random() * 3; // masses entre 0.5 et 3.5
      const speed = 4 + Math.random() * 10; // speed entre 3 et 5
       const color = `hsl(${Math.random() * 360}, 70%, 50%)`; // couleur aléatoire
    const radius = 10 + mass * 10; // rayon fonction de la masse

      setFallingObjects((objs) => [
        ...objs,
        { id: Date.now(), xPercent, y: 0, speed, mass, color, radius },
      ]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Chrono + zones
  useEffect(() => {
    if (isGameOver) return;
    const interval = setInterval(() => {
      setTime((t) => t - 0.1);

      // Déterminer zone actuelle
      const abs = Math.abs(angleRef.current); // en degrés
      let zone = "red";
      if (abs < 5) zone = "green";
      else if (abs < 10) zone = "yellow";

      // Incrémenter le compteur de cette zone
      setZones((z) => ({ ...z, [zone]: z[zone] + 0.1 }));
      lastZoneRef.current = zone;

    if(Math.abs(angleRef.current)>60)
       {
        gameOver(true);
         clearInterval(interval);
       }
    }, 100);

    return () => clearInterval(interval);
  }, [setZones,isGameOver]);

  //setScore
  useEffect(() => {
    if(time<=0)
      gameOver(true);
    const total = zones.green*3 + zones.yellow;
    if (total === 0||isGameOver) return;
    setScore(Math.round(total));
  }, [zones, time,isGameOver]);

  // Couleur en fonction de la zone
  const absAngle = Math.abs(angleRef.current);
  let color = "red";
  if (absAngle < 5) color = "limegreen";
  else if (absAngle < 10) color = "gold";

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(180deg, #2b2f38, #111)",
        color: "white",
      }}
      onMouseMove={handleMove}
      onTouchMove={handleMove}
    >
         <GameOver open={isGameOver} score={score} reason={'aucune memoire'} 
                    gameName="balance" handleRestart={reset}
                        handleClose={() => { reset() }}  />
          <Typography variant="h4" gutterBottom>
        La Balance Infernale ⚖️
      </Typography>

 {/* Indicateur */}
      <Box
        sx={{
          width: 200,
          height: 40,
          borderRadius: "20px",
          backgroundColor: color,
          mb: 3,
          transition: "background-color 0.3s ease",
        }}
      />

     {/* Chrono + zones */}
      <Typography variant="h4" gutterBottom>
        ⏱ {time.toFixed(1)} s
      </Typography>
      <Box display="flex" gap={2} mb={2}>
        <Typography sx={{ color: "#2ecc71" }}>
          Vert: {zones.green.toFixed(1)}s
        </Typography>
        <Typography sx={{ color: "#f1c40f" }}>
          Jaune: {zones.yellow.toFixed(1)}s
        </Typography>
        <Typography sx={{ color: "#e74c3c" }}>
          Rouge: {zones.red.toFixed(1)}s
        </Typography>
      </Box>

      <Box
        ref={barRef}
        sx={{
          position: "relative",
          width: "95%",
          height: 300,
        }}
      >
        {/* Barre qui s'incline */}
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "100%",
            height: 20,
            borderRadius: 2,
           background: "linear-gradient(90deg, #888, #ccc, #888)",
           boxShadow: "0px 4px 10px rgba(0,0,0,0.4)",
            transform: `translate(-50%, -50%) rotate(${angleRef.current}deg)`,
            transformOrigin: `${pivotX}% 50%`,
            transition: "transform 0.05s linear",
          }}
        >
          {/* Poids test fixé sur la barre */}
          {weights.map((w, i) => (
            <Box
              key={'w'+i}
              sx={{
                position: "absolute",
                bottom: "100%",
                left: `${w.xPercent}%`,
      width: w.radius * 2,
      height:w.radius * 2,
                borderRadius: "50%",
             
                background: `radial-gradient(circle at 30% 30%, ${w.color} 0%,rgba(0,0,0,0.2) 70%)`,

                boxShadow: "0px 2px 5px rgba(0,0,0,0.5)",
                transform: "translateX(-50%)",
              }}
            />
          ))}
        </Box>

        {/* Pivot draggable */}
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: `${pivotX}%`,
            width: 40,
            height: 40,
            transform: "translate(-50%, -10%)",
            clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
            bgcolor: "#374151",
            boxShadow: "0px 4px 6px rgba(0,0,0,0.5)",
            cursor: "grab",
            "&:active": { cursor: "grabbing" },
          }}
        />
      </Box>
       {/* Objets qui tombent */}
        {fallingObjects.map((o) => (
          <Box
    key={'f'+o.id}
    sx={{
      position: "absolute",
      top: o.y,
      left: `${o.xPercent}%`,
      width: o.radius * 2,
      height: o.radius * 2,
      borderRadius: "50%",
       background: `radial-gradient(circle at 30% 30%, ${o.color} 0%, rgba(0,0,0,0.5) 70%)`,
   boxShadow: `0px 2px 6px rgba(0,0,0,${0.2 + (o.mass / 3) * 0.5})`,
     
      transform: "translateX(-50%)",
    }}
  />
        ))}
    </Box>
  );
}


const darkenColor = (hsl, amount=20) => {
  const [h, s, l] = hsl.match(/\d+/g).map(Number);
  return `hsl(${h}, ${s}%, ${Math.max(0,l-amount)}%)`;
};
