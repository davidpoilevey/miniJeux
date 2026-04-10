
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Stage, Layer, Line, Circle, Rect, Image, Text } from 'react-konva';
import { useTowerDefense } from "./TDContext";
import { createTour, Ennemi, upgradeTour } from "./TDElements";
import imgFond from '../bactery/images/fondTerre.jpg';
import { Avatar, Box, Button, Card, CardActions, CardContent, CardHeader, Popover, Typography } from "@mui/material";

export const tourSize = 50;

export const TDCanvas = ({ size }) => {

  const canvasRef = useRef(null);
  const layerRef = useRef(null);
  const tourGhostRef = useRef();
  const [isTourEditOpen, setIsTourEditOpen] = useState(false);
  const [openedTour, setOpenedTour] = useState();
  const [imageFond, setImageFond] = useState();
  const tourRef = useRef();
  const { modeDeJeu, ennemis, tours, setCanvasSize, setLayerRef, setTours, setMessage, endGame, gameOver
    , canvasEnnemisRef, setMode, projectiles, pognon, setPognon , chemins} = useTowerDefense();

  
    useEffect(() => {
      const newImage = new window.Image();
      newImage.src = imgFond;
      newImage.onload = () => {
        setImageFond(newImage);
      };
    }, []);

  useEffect(() => {
    // partie resize et taille (peut etre separee si faut)
    const canvas = canvasRef.current;
    const stage = canvas.getStage();
    setLayerRef(layerRef.current);
    const resize = () => {
      if (canvas) {
        stage.width(size.width);
        stage.height(size.height);
        setCanvasSize({ width: size.width, height: size.height });
        stage.batchDraw();
      }
    };
    window.addEventListener('resize', resize);
    resize();

    if (tourGhostRef.current) {
      canvas.addEventListener('mousemove', (event) => {
        const stageRect = stage.getStage().container().getBoundingClientRect();
        const x = event.clientX - stageRect.left;
        const y = event.clientY - stageRect.top;

        tourGhostRef.current.style.left = x - tourSize / 2 + 'px';
        tourGhostRef.current.style.top = y - tourSize / 2 + 'px';
      });
    }
    return () => window.removeEventListener('resize', resize);
  }, [size]);


  // update d'ennemis
  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = canvas.getStage();
    const ennemiLayer = stage.findOne('.ennemiLayer');
    const tourLayer = stage.findOne('.tourLayer');
    // on efface tout
    ennemiLayer.removeChildren();
    // on ajoute tout le monde
    ennemis.forEach(nmi => {
      ennemiLayer.add(nmi.shape);
    })
    // Dessiner les éléments sur le canvas
    ennemiLayer.batchDraw();
    tourLayer.batchDraw();

  }, [ennemis]);

const chemin = useMemo(()=>{
  const path=[];
  chemins.forEach(c=>{
    path.push(c.x+25);
    path.push(c.y+25);
  });
  return path
},[chemins,size]);

  useEffect(() => {
    if(gameOver)
      return;
    const canvas = canvasRef.current;
    const stage = canvas.getStage();
    let isRunning = false; 
    // Initialisation du jeu
    let previousTime = performance.now();
    // Boucle de jeu
    function gameLoop() {
      if (!isRunning) return; 
      const currentTime = performance.now();
      const deltaTime = (currentTime - previousTime) / 100; // en secondes
      previousTime = currentTime;

      canvasEnnemisRef.current.forEach(ennemi => {
        // Met à jour la position de l'ennemi en fonction de sa logique de déplacement
        ennemi.move(deltaTime);// 1 pour deltaTime
        // check fin du jeu
        if(ennemi.health>0 && ennemi.shape.x()<10&&ennemi.shape.y()<10)
          endGame();
      });
     
     
      stage.batchDraw();
      requestAnimationFrame(gameLoop);
    }

    gameLoop();
    isRunning = true;
    gameLoop();
  
    return () => {
      isRunning = false; // Arrêter la boucle lors du démontage du composant
    };
  }, [ennemis, gameOver]);


  useEffect(() => {
    const canvas = canvasRef.current;
    let bg=null;
    if (canvas) {
      switch(modeDeJeu){
        case 'amelioration':
          bg='#eef';break;
        case 'construction':
          bg='#ffe';break;
        default:
          bg='white';
      }
      canvas.getStage().container().style.backgroundColor = bg; // Exemple de couleurs
     
      if (modeDeJeu === 'construction') {
        tourGhostRef.current.style.display = 'block';
      } else {
        tourGhostRef.current.style.display = 'none';
      }
    }
  }, [modeDeJeu, tours]);


  const onTourClick=(evt, tour)=>{
    setIsTourEditOpen(evt);
    setOpenedTour(tour);
  }
  const onUpgrade=()=>{
    setPognon(p=>p-openedTour.cost)
    const newTour=upgradeTour(openedTour);
    setTours(oldT=>{
      return oldT.map(t=>{
        if(t.id===openedTour.id)
          return newTour;
        else return t;
      })
    });
  }
  const onCanvasClick = (e) => {
    if (modeDeJeu === 'construction') {
      const stage = e.target.getStage();
      const x = stage.getPointerPosition().x - tourSize / 2;
      const y = stage.getPointerPosition().y - tourSize / 2;
      const newTour = createTour({ x, y });
      if(newTour.cost>pognon){
        setMode('standard');
        return setMessage('Pas assez de fric');
      }
      setTours([...tours, newTour]);
      setPognon(p=>p-newTour.cost);
      setMode('standard');
    }
  }
  

  return <>
    <Box ref={tourGhostRef} style={{
      position: 'absolute',
      zIndex:2,
      width: tourSize,
      height: tourSize,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      borderRadius: '5px',
      pointerEvents: 'none' // Pour ne pas interférer avec les clics sur le canvas
    }}></Box>
    <Stage ref={canvasRef} onClick={onCanvasClick}>
    
    <Layer ref={tourRef} name="cheminLayer">
    <Rect x={0} y={0}      width={size.width}      height={size.height}
      fillLinearGradientStartPoint={{ x: 0, y: 0 }}
      fillLinearGradientEndPoint={{ x: size.width, y: size.height }}
      fillLinearGradientColorStops={[0, '#a2cd5a', 0.1, '#55a630',0.2, '#a2cd5a', 0.3, '#55a630',0.4, '#a2cd5a', 0.5, '#55a630',0.6, '#a2cd5a', 0.7, '#55a630', 0.8, '#55a630',0.9, '#a2cd5a', 1, '#55a630']}
    />
          <Line        points={chemin}        stroke="#da8"        tension={0.1}        strokeWidth={50}
/>
    </Layer>
      <Layer ref={tourRef} name="tourLayer">
    
        {tours.map((tour, index) => (
          <Tour key={index} {...tour} onTourClick={onTourClick} modeDeJeu={modeDeJeu}/>))}

        {projectiles.map((prj, index) => (
          <Bullet key={index} projectile={prj} />))}
          <Text
            x={size.width-100}
            y={10}
            text={pognon}
            fontSize={36}
            fill="blue"
          />
          
      </Layer>
      <Layer ref={layerRef} name="ennemiLayer">
        {/* Tes éléments Konva ici */}
      
      </Layer>
    </Stage>

 <TourDialog open={isTourEditOpen} tour={openedTour} pognon={pognon}
 onUpgrade={onUpgrade} onClose={() => {
    setIsTourEditOpen(false);
    setMode('standard')}} />
  </>
}

const Bullet= ({projectile}) => {
  const [opacity, setOpacity] = useState(1);
  const {points, birthDate} = projectile;
  useEffect(() => {
   // const timeoutId = setTimeout(() => {
      const fadeInterval = setInterval(() => {
        setOpacity(prevOpacity => Math.max(0, prevOpacity - 0.1));
      }, 50); // Ajustez l'intervalle pour contrôler la vitesse du fondu

      // Nettoyer l'intervalle à la fin du fondu
      setTimeout(() => {
        clearInterval(fadeInterval);
      }, 500); // Durée totale du fondu
    // }, 1000 - (Date.now() - birthDate)); // Démarrer le fondu après 1 seconde

    return () => clearInterval(fadeInterval);
  }, [birthDate]);
  return <Line points={points}  stroke={projectile.getColor()} strokeWidth={2} opacity={opacity} />

}

const Tour = ({modeDeJeu, onTourClick, ...tour}) => {

  
  const image = useMemo(()=>{
    const img = new window.Image();
    img.src = tour.imageUrl;
    return img;
  },[tour.imageUrl]);

  return (
   <Image
      image={image}
      x={tour.x}
      y={tour.y}
      onClick={modeDeJeu === 'amelioration' ? (evt)=>{onTourClick(evt, tour)} : undefined}
      stroke={modeDeJeu === 'amelioration' ? 'green' : 'transparent'}
      strokeWidth={3}
      width={tour.width}
      height={tour.height}
    />
  );
}



const TourDialog = ({ tour, onClose, open, pognon, onUpgrade }) => {

if(tour==null)
  return null;
  const nextTour = upgradeTour(tour,true);



  return (
    <Popover
    open={Boolean(open)}
    anchorEl={open}
    onClose={onClose}
    anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
    }}
    transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
    }}
>
    <Card sx={{ minWidth: 275 }}>
      <CardHeader title=" Informations de la tour" avatar={<Avatar src={tour.imageUrl}/>}/>
      <CardContent sx={{display:'flex',flexDirection:'column'}}>
        <PtitLigne label="Niveau" value={tour.type} nextValue={nextTour.type}/>
        <PtitLigne label="Prix" value={tour.cost} nextValue={nextTour.cost}/>
        <PtitLigne label="Vie" value={tour.health} nextValue={nextTour.health}/>
        <PtitLigne label=" Dégâts" value={tour.damage} nextValue={nextTour.damage}/>
        <PtitLigne label="Portée" value={tour.range+' pixels'} nextValue={nextTour.range}/>
        <PtitLigne label="Rythme" value={ `Tir toutes les ${tour.timer/1000} secondes`} nextValue={nextTour.timer/1000+' secondes'}/>
       
      </CardContent>
      <CardActions>
        <Button size="small" variant="contained" disabled={tour.cost>=pognon} onClick={onUpgrade}>
          Améliorer
        </Button>
        <Button size="small" onClick={onClose}>
          Fermer
        </Button>
      </CardActions>
    </Card>
    </Popover>
  );
};

const PtitLigne = ({label, value, nextValue})=>{
  return  <Box sx={{display:'flex', alignItems:'center'}}>
  <Typography variant="body2"> {label} : </Typography>
   <Typography variant="body1" color="primary"> {value} </Typography>
   <Typography variant="caption" color="text.secondary"> -&gt;{nextValue} </Typography>
  </Box>
}