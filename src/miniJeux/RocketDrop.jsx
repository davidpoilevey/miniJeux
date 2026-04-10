import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import imgFusee from './images/fusee.png';
import explosionImg from '../shootemup/images/explosion.gif';
import { Stage, Layer, Line, Circle, Group, Image, Shape, Rect } from "react-konva";
import { usePreloadedImages } from "../civ/utils/hooks";
import { Button } from "@mui/material";
import { timerStyle } from "./BatailleNavale";
import { MissionDialog } from "./MissionDialogue";

const FUSEE_HEIGHT = 100;
const FUSEE_STARTX = 50;
const FUSEE_STARTY = 100;
const IMG_TO_LOAD = {fusee:imgFusee, explosion:explosionImg};


export default function RocketDrop() {
    const [rocket, setRocket] = useState({ x: FUSEE_STARTX, y: FUSEE_STARTY, vx: 0, vy: 0, angle: 0 });
    const [thrust, setThrust] = useState(false);
       const crashed = useRef(false);
       const [arrivee, setArrivee] = useState(false);
       const [elapsedTime, setElapsedTime] = useState(0);
         const [startTime, setStartTime] = useState(null);
  const [currentTemplate, setCurrentTemplate] = React.useState('valley');
  const template = useMemo(()=>{
    const tpl = TERRAIN_TEMPLATES[currentTemplate];
    // add start and end point
    tpl.obstacles = tpl.obstacles || [];
    tpl.obstacles.push( { type: 'floating', x: 0, y: 0.3, width: 0.1, height: 0.01, color:'blue' });
    tpl.obstacles.push( { type: 'floating', x: 0.97, y: 0.3,  width: 0.1, height: 0.01, color:'green' });
    return tpl;
  }, [currentTemplate]);
  const nextNiveau = useCallback(()=>{
    const keys = Object.keys(TERRAIN_TEMPLATES);
    const idx = keys.indexOf(currentTemplate);
    const nextIdx = (idx+1)%keys.length;
    setCurrentTemplate(keys[nextIdx]);
    setRocket({ x: FUSEE_STARTX, y: FUSEE_STARTY, vx: 0, vy: 0, angle: 0 });
    setElapsedTime(0);
    setStartTime(Date.now());
    setArrivee(false);
  }, [currentTemplate]);

  const {fusee:fuseeImage, explosion} = usePreloadedImages(IMG_TO_LOAD);
    // Réfs pour les contrôles continus
    const thrustRef = useRef(false);
    const rotateLeftRef = useRef(false);
    const rotateRightRef = useRef(false);

    const rafRef = useRef(null);
    const ref = useRef(null);
    const lastTime = useRef(performance.now());
    const terrainRef = useRef([]);
    const protectionRef = useRef(true); // Protection après crash

    // Paramètres physiques
    const gravity = 500; // px/s²
    const thrustPower = -800; // px/s² (négatif car vers le haut)
    const rotationSpeed = 1; // radians par seconde
    const drag = 0.99; // résistance de l'air
const doCrash = ({vy,vx})=>{
  if(protectionRef.current) return;
    if (!crashed.current) {
        crashed.current=true;
        console.log("💥 Crash! Vitesse d'impact:", Math.sqrt(vy*vy+vx*vx).toFixed(1), "km/h");
    }
};
    // Boucle de mise à jour de la physique
   useEffect(() => {
  let firstFrame = true;
  lastTime.current = performance.now();
 console.log("🚀 useEffect physique lancé");
  const updateRocket = (time) => {
    if (firstFrame) {
      // on initialise sans calculer de delta
      lastTime.current = time;
      firstFrame = false;
      rafRef.current = requestAnimationFrame(updateRocket);
      return;
    }
    

    setRocket((r) => {
      let { x, y, vx, vy, angle } = r;
        const delta = (time - lastTime.current) / 1000;
        lastTime.current = time;
      if (rotateLeftRef.current) angle -= rotationSpeed * delta;
      if (rotateRightRef.current) angle += rotationSpeed * delta;

      let ax = 0;
      let ay = gravity;

      if (thrustRef.current) {
        ax += Math.sin(angle) * -thrustPower;
        ay += Math.cos(angle) * thrustPower;
      }

      vx += ax * delta;
      vy += ay * delta;

      vx *= Math.pow(drag, delta * 60);
      vy *= Math.pow(drag, delta * 60);

      x += vx * delta;
      y += vy * delta;

      const { collision, groundY, arrivee:isArrivee } = checkCollision({ x, y, vx, vy }, terrainRef.current);
      if (collision) {
        if (Math.abs(vy) > 150|| Math.abs(vx) > 150) 
          doCrash({vy,vx});
        else if(isArrivee&&!crashed.current)
         setArrivee(true);
        vy = 0;
        vx=0;
        y= groundY - (FUSEE_HEIGHT / 2);
       // x=wallX- FUSEE_HEIGHT / 2;
       
      }

      return { x, y, vx, vy, angle };
    });

    rafRef.current = requestAnimationFrame(updateRocket);
  };

  rafRef.current = requestAnimationFrame(updateRocket);

  return () => {
    firstFrame = true;
    cancelAnimationFrame(rafRef.current);
  };
}, []);
useEffect(() => {
  if (startTime) {
    protectionRef.current = true;
    const interval = setInterval(() => {
      if(!arrivee)
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }
}, [startTime,arrivee]);
useEffect(() => {
      if (crashed.current) {
        setArrivee(false);
          setTimeout(() => {
              setRocket({ x: FUSEE_STARTX, y: FUSEE_STARTY, vx: 0, vy: 0, angle: 0 });
             
              crashed.current=false
              protectionRef.current = true;
          }, 2000);
      }
}, [elapsedTime]);

    // Gestion des entrées clavier
    useEffect(() => {
        const handleKeyDown = (e) => {
          if(crashed.current) return;
            if (e.code === "Space" || e.code === "ArrowUp") {
                setThrust(true);
                thrustRef.current = true;
                  protectionRef.current = false;
                if(!startTime) 
                  setStartTime(Date.now());
            }
            if (e.code === "ArrowLeft") rotateLeftRef.current = true;
            if (e.code === "ArrowRight") rotateRightRef.current = true;
        };

        const handleKeyUp = (e) => {
            if (e.code === "Space" || e.code === "ArrowUp") {
                setThrust(false);
                thrustRef.current = false;
            }
            if (e.code === "ArrowLeft") rotateLeftRef.current = false;
            if (e.code === "ArrowRight") rotateRightRef.current = false;
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [startTime]);
    return (
        <div ref={ref}
            style={{
                width: "100%",
                height: "100vh",
                position: "relative",backgroundColor: "black",
                overflow: "hidden",
            }}
        >
        
          <MissionDialog open={arrivee} elapsedTime={elapsedTime}
           onClose={() => {
            setStartTime(null);
            setArrivee(false);}
            } nextNiveau={nextNiveau}/>
             <Stage key={currentTemplate} width={window.innerWidth} height={window.innerHeight}>
                <Layer>
                      <TerrainRenderer 
                            template={template} 
                            width={window.innerWidth} 
                            height={window.innerHeight}
                            ref={terrainRef}
                        />
                    <Fusee rocket={rocket} thrust={thrust} explosion={explosion} fuseeImage={fuseeImage}
                    crashed={crashed.current}/>
                </Layer>
            </Stage>
            <FuseeControls setRocket={setRocket} currentTemplate={currentTemplate}
            setCurrentTemplate={setCurrentTemplate}  elapsedTime={elapsedTime}
             rocket={rocket} thrust={thrust} rotateSens={rotateLeftRef.current ? '←' : (rotateRightRef.current ? '→' : 'Aucune')} />

        </div>
    );
}

const TerrainChoice=({currentTemplate, setCurrentTemplate})=>{
    return <div style={{ marginBottom: 20 }}>
        <h2 style={{ color: 'white' }}>Sélectionner un template:</h2>
        {Object.entries(TERRAIN_TEMPLATES).map(([key, tmpl]) => (
          <button
            key={key}
            onClick={() => setCurrentTemplate(key)}
            style={{
              margin: 5,
              padding: '10px 20px',
              background: currentTemplate === key ? '#4CAF50' : '#333',
              color: 'white',
              border: 'none',
              borderRadius: 5,
              cursor: 'pointer'
            }}
          >
            {tmpl.name}
          </button>
        ))}
      </div>
}
const FuseeControls = ({ rocket, thrust,elapsedTime, rotateSens, setRocket, currentTemplate, setCurrentTemplate }) => {
    return <div
        style={{
            position: "fixed",
            left: 10,
            bottom: 10,
            color: "white",
            backgroundColor: "rgba(0,0,0,0.5)",
            fontFamily: "monospace",
        }}
    >
         <TerrainChoice currentTemplate={currentTemplate} setCurrentTemplate={setCurrentTemplate}/>
          
        <Button variant="contained" size="small" onClick={() => {
            setRocket({ x: FUSEE_STARTX, y: FUSEE_STARTY, vx: 0, vy: 0, angle: 0 });
        }}>Reset</Button><br/>
         <div style={timerStyle}>
            {String(Math.floor(elapsedTime / 60)).padStart(2, '0')}:
            {String(elapsedTime % 60).padStart(2, '0')}
          </div>
        🔥 {thrust ? "Poussée active" : "Repos"} <br />
        ↔️ Rotation:{" "}
        {rotateSens}
        <br />
        Angle: {(rocket.angle * 180 / Math.PI).toFixed(1)}°
        <br />
        Vitesse: {(Math.sqrt((rocket.vx * rocket.vx) + (rocket.vy * rocket.vy))).toFixed(1)} km/h
    </div>
}

{/* La fusée */ }

const Fusee = React.forwardRef(({ rocket, thrust, crashed, explosion, fuseeImage }, ref) => {
  const flameRef = useRef();

  // Petit effet de flamme animé (pulsation)

  // Animation de la flamme (taille qui varie)
  useEffect(() => {
    if (flameRef.current==null) return;
    let anim;
    if (thrust) {
      let t = 0;
      const loop = () => {
          if (flameRef.current==null)
             return  cancelAnimationFrame(anim);
        t += 0.2;
        const scale = 0.9 + 0.1 * Math.sin(t * 5);
        flameRef.current.scale({ x: 1, y: scale });
        anim = requestAnimationFrame(loop);
      };
      anim = requestAnimationFrame(loop);
    }
    return () => cancelAnimationFrame(anim);
  }, [thrust]);

  return (
    <Group
      ref={ref}
      x={rocket.x}
      y={rocket.y}
      rotation={(rocket.angle * 180) / Math.PI}
      offsetX={50} // pour centrer la fusée
      offsetY={FUSEE_HEIGHT/2}
    >
      {/* Corps de la fusée */}
      <Image
        image={crashed?explosion:fuseeImage}
        width={100}
        height={FUSEE_HEIGHT}
        shadowColor="orange"
        shadowBlur={thrust ? 10 : 0}
        shadowOpacity={thrust ? 0.8 : 0}
      />

     {/* Flamme moteur — un triangle lumineux */}
      {thrust && (
        <Shape
          ref={flameRef}
          sceneFunc={(ctx, shape) => {
            ctx.beginPath();
            // Triangle centré sous la fusée
            ctx.moveTo(50, FUSEE_HEIGHT); // base gauche
            ctx.lineTo(60, FUSEE_HEIGHT); // base droite
            ctx.lineTo(55, 130); // pointe en bas
            ctx.closePath();

            // Dégradé vertical
            const gradient = ctx.createLinearGradient(0, 100, 0, 130);
            gradient.addColorStop(0, "yellow");
            gradient.addColorStop(0.5, "orange");
            gradient.addColorStop(1, "red");

            ctx.fillStyle = gradient;
            ctx.fill();
          }}
          shadowBlur={15}
          shadowColor="orange"
          opacity={0.9}
        />
      )}
    </Group>
  );
});



// ============ DÉFINITION DES TEMPLATES ============
const TERRAIN_TEMPLATES = {
  valley: {
    name: "Vallée",
    ground: [
      { x: 0, y: 0.5 },
      { x: 0.1, y: 0.9 },
      { x: 0.2, y: 0.8 },
      { x: 0.3, y: 0.8 },
      { x: 0.39, y: 0.7 },
      { x: 0.46, y: 0.6 },
      { x: 0.56, y: 0.35 },
      { x: 0.69, y: 0.28 },
      { x: 0.76, y: 0.8 },
      { x: 0.8, y: 0.6 },
      { x: 0.9, y: 0.5 },
      { x: 1, y: 0.5 },
    ],
    obstacles: [
      { type: 'floating', x: 0.30, y: 0, width: 0.1, height: 0.4 }
    ]
  },
  canyon : {
  name: "Canyon",
  ground: [
    { x: 0, y: 0.4 },
    { x: 0.1, y: 0.4 },
    { x: 0.25, y: 0.94 },
    { x: 0.50, y: 0.8 },
    { x: 0.75, y: 0.94 },
    { x: 0.9, y: 0.5 },
    { x: 1, y: 0.4 }
  ],
  obstacles: [
    { type: 'spike', x: 0.5, baseY: 0.8, height: 0.4 },
    { type: 'floating', x: 0.3, y: 0, width: 0.1, height: 0.3 },
    { type: 'floating', x: 0.7, y: 0, width: 0.1, height: 0.3 }
  ]
},
  
  mountains: {
    name: "Montagnes",
    ground: [
    { x: 0, y: 0.4 },
    { x: 0.1, y: 0.6 },
    { x: 0.25, y: 0.99 },
    { x: 0.32, y: 0.29 },
    { x: 0.40, y: 0.6 },
    { x: 0.5, y: 0.98 },
    { x: 0.6, y: 0.8 },
    { x: 0.75, y: 0.38 },
    { x: 0.8, y: 0.3 },
    { x: 1, y: 0.4 }
    ],
    obstacles: [
      { type: 'floating', x: 0.56, y: 0, width: 0.04, height: 0.45 }
    ]
  },
  
  caves : {
  name: "Cave Maze",
  ground: [
    { x: 0.0, y: 0.85 },
    { x: 0.05, y: 0.8 },
    { x: 0.1, y: 0.9 },
    { x: 0.15, y: 0.7 },
    { x: 0.2, y: 0.8 },
    { x: 0.25, y: 0.6 },
    { x: 0.3, y: 0.75 },
    { x: 0.35, y: 0.65 },
    { x: 0.4, y: 0.8 },
    { x: 0.45, y: 0.6 },
    { x: 0.5, y: 0.9 },
    { x: 0.55, y: 0.7 },
    { x: 0.6, y: 0.8 },
    { x: 0.65, y: 0.65 },
    { x: 0.7, y: 0.75 },
    { x: 0.75, y: 0.7 },
    { x: 0.8, y: 0.85 },
    { x: 0.85, y: 0.7 },
    { x: 0.9, y: 0.8 },
    { x: 0.95, y: 0.75 },
    { x: 1.0, y: 0.85 }
  ],
  obstacles: [
    // Pics au sol
    { type: "spike", x: 0.12, baseY: 0.9, height: 0.08 },
    { type: "spike", x: 0.48, baseY: 0.9, height: 0.1 },
    { type: "spike", x: 0.88, baseY: 0.85, height: 0.07 },

    // Plateformes flottantes (roches suspendues)
    { type: "floating", x: 0.22, y: 0.45, width: 0.08, height: 0.02 },
    { type: "floating", x: 0.35, y: 0.35, width: 0.1, height: 0.02 },
    { type: "floating", x: 0.52, y: 0.4, width: 0.12, height: 0.02 },
    { type: "floating", x: 0.7, y: 0.3, width: 0.09, height: 0.02 },
    { type: "floating", x: 0.83, y: 0.4, width: 0.07, height: 0.02 }
  ]


  }
};

// ============ FONCTION DE COLLISION ============
export function checkCollision(rocket, terrain) {
  if (!terrain) return { collision: false, groundY: 0, wallX: 0 };
  
  const rocketRadius = FUSEE_HEIGHT/2-10; // Rayon de collision de la fusée
  const { x, y } = rocket;
  
  // 1. Vérifier collision avec le sol (segments de terrain)
  const ground = terrain.ground;
  for (let i = 0; i < ground.length - 1; i++) {
    const p1 = ground[i];
    const p2 = ground[i + 1];
    
    // Si la fusée est dans la zone X du segment
    if (x >= p1.x && x <= p2.x) {
      // Interpolation linéaire pour trouver la hauteur du sol
      const t = (x - p1.x) / (p2.x - p1.x);
      const groundY = p1.y + t * (p2.y - p1.y);
      
      // Collision si la fusée touche le sol
      if (y + rocketRadius >= groundY) {
        return { collision: true, groundY, wallX: x };
      }
    }
  }
  
  // 2. Vérifier collision avec les pics
  for (const obstacle of terrain.obstacles) {
    if (obstacle.type === 'spike') {
      const spikeWidth = 20; // Largeur de base du pic
      const spikeTop = obstacle.baseY - obstacle.height;
      
      // Vérifier si la fusée est dans la zone du pic
      if (Math.abs(x - obstacle.x) < spikeWidth / 2 + rocketRadius) {
        // Interpolation pour la forme triangulaire du pic
        const distFromCenter = Math.abs(x - obstacle.x);
        const heightAtX = obstacle.baseY - (obstacle.height * (1 - distFromCenter / (spikeWidth / 2)));
        
        if (y + rocketRadius >= heightAtX && y - rocketRadius <= obstacle.baseY) {
          return { collision: true, groundY: heightAtX, wallX: x };
        }
      }
    }
    
    // 3. Vérifier collision avec les obstacles flottants (rectangles)
    if (obstacle.type === 'floating') {
      const left = obstacle.x - obstacle.width / 2;
      const right = obstacle.x + obstacle.width / 2;
      const top = obstacle.y;
      const bottom = obstacle.y + obstacle.height;
      
      // AABB collision avec cercle
      const closestX = Math.max(left, Math.min(x, right));
      const closestY = Math.max(top, Math.min(y, bottom));
      
      const distX = x - closestX;
      const distY = y - closestY;
      const distSquared = distX * distX + distY * distY;
      
      if (distSquared < rocketRadius * rocketRadius) {
        // Déterminer de quel côté vient la collision
        const groundY = y < obstacle.y ? top : bottom;
        const wallX = x < obstacle.x ? left : right;
        return { collision: true, groundY, wallX, arrivee:obstacle.color==='green'  };
      }
    }
  }
  
  // Vérifier les limites de l'écran (murs latéraux)
  if (y - rocketRadius <= 0) {
    return { collision: true, groundY: rocketRadius, wallX: rocketRadius };
  }
  if (x - rocketRadius <= 0) {
    return { collision: true, groundY: y, wallX: rocketRadius };
  }
  if (x + rocketRadius >= terrain.width) {
    return { collision: true, groundY: y, wallX: terrain.width - rocketRadius };
  }
  
  // Pas de collision
  return { collision: false, groundY: 0, wallX: 0 };
}

// ============ COMPOSANT DE RENDU DU TERRAIN ============
 const TerrainRenderer = React.forwardRef(({ template, width, height }, ref) => {
  const terrainData = useRef(null);

  // Fonction utilitaire : convertir pourcentages -> pixels
  const scaleTemplate = (tpl, width, height) => {
    const scaledGround = tpl.ground.map(p => ({
      x: p.x * width,
      y: p.y * height
    }));

    const scaledObstacles = tpl.obstacles.map(o => {
      if (o.type === 'spike') {
        return {
          ...o,
          x: o.x * width,
          baseY: o.baseY * height,
          height: o.height * height
        };
      }
      if (o.type === 'floating') {
        return {
          ...o,
          x: o.x * width,
          y: o.y * height,
          width: o.width * width,
          height: o.height * height
        };
      }
      return o;
    });

    return { ground: scaledGround, obstacles: scaledObstacles };
  };

  const scaled = useMemo(() => scaleTemplate(template, width, height), [template, width, height]);

  useEffect(() => {
    terrainData.current = {
      ground: scaled.ground,
      obstacles: scaled.obstacles,
      width
    };
    if (ref) ref.current = terrainData.current;
  }, [scaled, width, ref]);

  const groundPoints = scaled.ground.flatMap(p => [p.x, p.y]);
  const closedGroundPoints = [
    ...groundPoints,
    scaled.ground[scaled.ground.length - 1].x, height,
    scaled.ground[0].x, height,
    scaled.ground[0].x, scaled.ground[0].y
  ];

  return (
    <>
      <Line
        points={closedGroundPoints}
        fill="#8B4513"
        stroke="#654321"
        strokeWidth={3}
        closed
      />
      
      {scaled.obstacles.map((obstacle, idx) => {
        if (obstacle.type === 'spike') {
          const spikePoints = [
            obstacle.x - 10, obstacle.baseY,
            obstacle.x, obstacle.baseY - obstacle.height,
            obstacle.x + 10, obstacle.baseY
          ];
          return (
            <Line
              key={`spike-${idx}`}
              points={spikePoints}
              fill={obstacle.color || "#FF4444"}
              stroke="#CC0000"
              strokeWidth={2}
              closed
            />
          );
        }
        if (obstacle.type === 'floating') {
          return (
            <Rect
              key={`floating-${idx}`}
              x={obstacle.x - obstacle.width / 2}
              y={obstacle.y}
              width={obstacle.width}
              height={obstacle.height}
              fill={obstacle.color || "#666666"}
              stroke="#444444"
              strokeWidth={2}
            />
          );
        }
        return null;
      })}
    </>
  );
});

