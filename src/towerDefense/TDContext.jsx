import React, { useEffect, useRef, useState } from "react";
import QuickDialog from "../bitLife/utils/QuickDialog";
import { useEnnemis, Ennemi, Projectile } from "./TDElements";
import { tourSize } from "./TDCanvas";
import { GameOver } from "../ChuckNorrisFact";


function isWithinRange(tower, enemy) {
  const dx = tower.x+tourSize/2 - enemy.shape.x();
  const dy = tower.y+tourSize/2 - enemy.shape.y();
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance <= tower.range;
}
function generateZigzagPath(canvasSize, step) {
  const path = [];
  let x = canvasSize.width-50;
  let y = canvasSize.height-50;

  // Alternate between horizontal and vertical movements
  while (x > 0 && y > 0) {
    path.push({ x, y });
    if (path.length % 2 === 0) {
      // Even steps: move up
      y -= step;
    } else {
      // Odd steps: move left
      x -= step;
    }
  }

  // Ensure the final point is at the top-left corner
  path.push({ x: 0, y: 0 });

  return path;
}

const TowerDefenseContext = React.createContext();

export const useTowerDefense = () => React.useContext(TowerDefenseContext);

export const TDProvider = ({ children }) => {
  const [msgText, setMessage] = useState();
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 400 });
  const [layerRef, setLayerRef] = useState();
  const [gameOver, setGameOver] = useState(false);//String
  const [modeDeJeu, setMode] = useState('standard');
  const [ennemis, setEnnemis] = useState([]);
  const [projectiles, setProjectiles] = useState([]);
  const [pognon, setPognon] = useState(200);
  const canvasEnnemisRef = useRef([]);
  const [tours, setTours] = useState([]);
  const [chemins, setChemins] = useState([]);
  const {createEnnemi, ennemiByType} = useEnnemis();

  const endGame=()=>{
    setGameOver(true);
  }
const reset=()=>{
  setTours([]);
  setMessage(null);
  setGameOver(false);
  setProjectiles([]);
  setPognon(200);
  setEnnemis([]);
}
useEffect(()=>{
  setChemins(generateZigzagPath(canvasSize, canvasSize.width/4));
},[canvasSize]);
  useEffect(()=>{
    canvasEnnemisRef.current=ennemis;
  },[ennemis]);

  useEffect(() => {
    let tid = null;
    // choix du type d'ennemi (selon niveau des tours)
    let tourValue=0,typeEnnemi='base',speedEnnemi=3000;
    tours.forEach(tour=>{
      tourValue+=tour.cost
    });
    if(tourValue<=180);// garde les valeurs base
    else  if(tourValue<=250){
      typeEnnemi='soldat';
      speedEnnemi=2000;
    } else  if(tourValue<=450){
      typeEnnemi='fort';
      speedEnnemi=2000;
    } else  if(tourValue<=1000){
      typeEnnemi='rapide';
      speedEnnemi=2000;
    } else  if(tourValue>2000){
      typeEnnemi='tank';
      speedEnnemi=5000;
    }
    // interval de creation d'ennemis
    tid = setInterval(() => {
      // base , soldat, fort, rapide, tank
      canvasEnnemisRef.current.push(createEnnemi(canvasSize, chemins, typeEnnemi));
      setEnnemis(canvasEnnemisRef.current);
    }, speedEnnemi);

    const towerid = [];
    tours.forEach(tower => {
      // pour chaque Tour
      towerid.push(setInterval(() => {
        const newProjectiles=[];
        canvasEnnemisRef.current.forEach(enemy => {
          if (isWithinRange(tower, enemy)) {
            const NMI = ennemiByType(enemy.type)
            enemy.health -= tower.damage;
            enemy.shape.opacity(Math.max(0.2,enemy.health/NMI.healthDeBase));
            newProjectiles.push(new Projectile(tower.x+tourSize/2, tower.y+tourSize/2
              , enemy.shape.x(), enemy.shape.y(), tower.type));
            if (enemy.health <= 0)
             {
              enemy.dead = true;
              enemy.shape.opacity(0);
              setPognon(p=>(p+(NMI.niveau*4)));
             } 
            // Ajouter des effets visuels ici (par exemple, créer une shape Konva et l'animer)
          }
        });
        canvasEnnemisRef.current=canvasEnnemisRef.current.filter(nmi=>(!nmi.dead));
        setEnnemis(canvasEnnemisRef.current);

        if(newProjectiles.length>0)
          setProjectiles(oldProj=>{
            const newProjs=oldProj.filter(p => ((p.birthDate.getTime()+1000)<(new Date()).getTime()));
              return newProjs.concat(newProjectiles);
        });
      }, tower.timer));

    });
    return () => {
      if (tid != null)
        clearInterval(tid);
      if (towerid.length > 0) {
        towerid.forEach(t => (clearInterval(t)));
      }
    };
  }, [tours,canvasSize, chemins]);

  const ctxt = {
    setMessage, setMode, setCanvasSize, setLayerRef
    , ennemis, tours, setTours, modeDeJeu, canvasEnnemisRef
    , projectiles, pognon,setPognon, reset, chemins, endGame, gameOver
  }
  return <TowerDefenseContext.Provider value={ctxt}>
    {children}
    <QuickDialog text={msgText} titre="Message a caractère informatif" />
<GameOver open={gameOver} score={pognon} gameName="Tower defense"
    handleClose={() => { setGameOver(false) }} handleRestart={reset} />
  </TowerDefenseContext.Provider>;
}
