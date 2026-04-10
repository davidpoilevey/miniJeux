import { Box, Button } from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";

function getRandomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return { r, g, b };
}

function rgbToString(rgb, alpha = 1) {
    if(rgb==null)
        return 'white';
    const { r, g, b } = rgb;
  return `rgba(${r},${g},${b},${alpha})`;
}

const GRAVITY = 0.3;
const FLOOR_PADDING = 0;
const MIN_RADIUS = 50;
const GROWTH_PER_SEC = 200;

const ClickTouche = () => {
  const [circles, setCircles] = useState([]);
  const [isFalling, setIsFalling] = useState(false);
  const animationRef = useRef();

  React.useEffect(() => {
    if(!isFalling){
        if(animationRef.current!=null)
            cancelAnimationFrame(animationRef.current);
        return;
    }
    const animate = () => {
      setCircles((prevCircles) =>
        prevCircles.map((circle) => {
          if (!circle.falling) return circle;
          let newVy = circle.vy + GRAVITY;
          let newY = circle.y + newVy;
          const bottomLimit = window.innerHeight - circle.radius - FLOOR_PADDING;
          if (newY > bottomLimit) {
            newY = bottomLimit;
            newVy = 0;
            return { ...circle, y: newY, vy: newVy, falling: true };
          }
          return { ...circle, y: newY, vy: newVy };
        })
      );
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [isFalling]);
  const faisTomber=()=>{
    setIsFalling(true);
    setCircles(oldCircles=>{
      return oldCircles.map(c=>({...c, falling:true}))
    })
  }
  const nettoie=()=>{
    setIsFalling(false);
    setCircles([]);
  }
  return <Box>
    <Box display={'flex'}>
      <Button onClick={faisTomber}>Fais tomber</Button>
      <Button onClick={nettoie}>Nettoie</Button>
    </Box>
    <PanneauTouche circles={circles} setCircles={setCircles}/>
  </Box>
}

const PanneauTouche = ({circles, setCircles}) => {
  const boxRef = useRef(null);
  const [draftCircle, setDraftCircle] = useState(null);
  const growRef = useRef();
  const startTimeRef = useRef();

  // Commence à dessiner le cercle
  const handleMouseDown = (e) => {
     console.log('DOWN avant de rajouter '+circles.length);
    const rect = boxRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const color = getRandomColor();
    startTimeRef.current = performance.now();
    setDraftCircle({ x, y, color, radius: MIN_RADIUS });
    
    // Animation de croissance
    const grow = () => {
      const elapsed = (performance.now() - startTimeRef.current) / 1000; // secondes
      const radius = MIN_RADIUS + GROWTH_PER_SEC * elapsed;
      setDraftCircle((prev) => ({ ...prev, radius }));
      growRef.current = requestAnimationFrame(grow);
    };
    growRef.current = requestAnimationFrame(grow);

  };

  // Finalise le cercle
  const handleMouseUp = useCallback(() => {
    if (growRef.current) {
      cancelAnimationFrame(growRef.current);
      growRef.current = null;
    }
    if (draftCircle) {
        console.log('UP: avant de rajouter '+circles.length);
      setCircles(old => [
        ...old,
        {
          ...draftCircle,
          vy: 0,
          falling: false,
        }
      ]);
      setDraftCircle(null);
    }
   
  },[draftCircle, circles.length]);

  useEffect(()=>{

    // Pour gérer mouseup en dehors de la box
    window.addEventListener('mouseup', handleMouseUp);
    return ()=>{
         window.removeEventListener('mouseup', handleMouseUp);
    }
  },[handleMouseUp]);


  return (
    <Box
      ref={boxRef}
      onMouseDown={handleMouseDown}
      style={{
        width: "100vw",
        height: "100vh",
        background: "#f5f5f5",
        position: "relative",
        overflow: "hidden",
        margin: 0,
        padding: 0,
        userSelect: "none"
      }}
    >
      {circles.map((circle, idx) => (
        <div
          key={idx}
          style={{
            position: "absolute",
            left: circle.x - circle.radius,
            top: circle.y - circle.radius,
            width: circle.radius * 2,
            height: circle.radius * 2,
            borderRadius: "50%",
            pointerEvents: "none",
            background: `radial-gradient(circle, 
              ${rgbToString(circle.color, 1)} 0%, 
              ${rgbToString(circle.color, 0.01)} 60%, 
              ${rgbToString(circle.color, 0.001)} 80%, 
              ${rgbToString(circle.color, 0)} 100%)`,
          }}
        />
      ))}
      {draftCircle && (
        <div
          style={{
            position: "absolute",
            left: draftCircle.x - draftCircle.radius,
            top: draftCircle.y - draftCircle.radius,
            width: draftCircle.radius * 2,
            height: draftCircle.radius * 2,
            borderRadius: "50%",
            pointerEvents: "none",
            background: `radial-gradient(circle, 
              ${rgbToString(draftCircle.color, 1)} 0%, 
              ${rgbToString(draftCircle.color, 0.01)} 60%, 
              ${rgbToString(draftCircle.color, 0.001)} 80%, 
              ${rgbToString(draftCircle.color, 0)} 100%)`,
            opacity: 0.7,
          }}
        />
      )}
    </Box>
  );
};

export default ClickTouche;
