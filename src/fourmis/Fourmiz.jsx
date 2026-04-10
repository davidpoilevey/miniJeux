import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Fourmi from './Fourmi';
import { TILE_SIZE, TilesProvider, VITESSE_FOURMI, getTileIndices, useTilesContext } from './Tiles';
import Map from './Carte';
import AutoHide from './AutoHide';
import FabSetting from './Dialogs';
import { ThemeProvider, createTheme } from '@mui/material';

const useTypeColor = ()=>{
  const typescolor=useRef({});
  

  return (type)=>{
    if(typescolor.current[type]==null)
      typescolor.current[type]=`#${Math.floor(Math.random() * 16777215).toString(16)}`;
    return typescolor.current[type];
  }
}
const Fourmiz = () => {


  const [configuration, setConfig] = useState({ TAUX_PRODUCTION:4000
    ,pragmatisme: 0.9, colonies:[{ SUCRE_STOCK:2, PONCTION_PAR_FOURMI:40, name:"Fourmis rouges"}] });
    
  const width = window.innerWidth;
  const height = window.innerHeight;

  const nbColumns = Math.floor(width / TILE_SIZE);
  const nbRows = Math.floor(height / TILE_SIZE);

  const getTypeColor = useTypeColor();

  const theme = createTheme({
    palette: {
        background: {
            default: '#EBE8C1',
            paper: '#07C5A3', // Couleur de fond générale
        },
        primary: {
            main: '#9E9C82', // Couleur primaire
        },
        secondary: {
            main: '#757460', // Couleur secondaire
        },
        getTypeColor
    },
});


  return <ThemeProvider theme={theme}><TilesProvider configuration={configuration} nbRows={nbRows} nbColumns={nbColumns}>
    <Map  getTypeColor={getTypeColor}>
      <MondeVivant limits={{ width, height }} config={configuration} getTypeColor={getTypeColor}/>
      <AutoHide>
        <FabSetting config={configuration} setConfig={setConfig} />
      </AutoHide>
    </Map>
  </TilesProvider>
    </ThemeProvider>;
}

const MondeVivant = ({ config,getTypeColor }) => {

  const { findTarget, replaceTile,  fourmiProduction } = useTilesContext();
  const [fourmisPositions, setFourmisPositions] = useState([]);
  const fourmiDico = useRef({});

// reset on colonies changes
useEffect(()=>{
if(config.colonies!=null){
  fourmiDico.current={};
  setFourmisPositions([]);
}
},[config.colonies])
  useEffect(() => {
    if (fourmiProduction.length>0) {
      fourmiProduction.forEach(fourmi=>{
        fourmiDico.current[fourmi.id] = [];

      setFourmisPositions(f => {
        if (f.find(frmi => frmi.id === fourmi.id))
          return f;
        else
          return f.concat(fourmi);
      });
      })
      
    }

  }, [fourmiProduction]);
  const connaitTarget = (fourmiID, tile) => {
    const tilesConnus = fourmiDico.current[fourmiID];
    if (tilesConnus != null) {
      return tilesConnus.find(t => t.id === tile.id) != null;
    }
    return false;
  }
  // Fonction de déplacement des fourmis
  const moveAnts = useCallback(() => {
    const tilesToUpdate = [];
    setFourmisPositions((positions) => {
      return positions.map((fourmi) => {
        // Logique de mouvement de la fourmi
        let target = fourmi.target;
        let pragma = fourmi.pragmatique ?? Math.random() > config.pragmatisme;
        const jeLaisse = fourmi.status === 'Remplie' ? 'sucre' : 'colonie'+fourmi.equipe;
        const jeCherche = fourmi.status !== 'Remplie' ? 'sucre' : 'colonie'+fourmi.equipe;
        let laissePheromone = !connaitTarget(fourmi.id, target);
        const COLONIE_COURANTE = config.colonies.findIndex(c=>c.name===fourmi.equipe);// ne devrait jamais etre -1
        // reset target
        if (target != null) {
          // utilise info sur target pour poser pheromone
          const targX = fourmi.target.col * TILE_SIZE + TILE_SIZE / 2;
          const targY = fourmi.target.row * TILE_SIZE + TILE_SIZE / 2;

          fourmi.x = targX;
          fourmi.y = targY;
          const type = target.type;

          if (target.puceron) {
            // 2 cas, puceron libre ou puceron en culture
            if (target.puceron === true && fourmi.status !== 'Remplie' && target.type === 'eau') {// en fait, plante, alors en culture s'y interesse si pas remplie
              fourmi.status = 'Remplie';
              fourmi.lastCase = "0";
              fourmiDico.current[fourmi.id] = [];
              target.puceron = false;
            }
            if (target.type !== 'eau' && !fourmi.puceron) {
              // alors la prend sur le dos si libre pour l'amener sur une plante
              target.puceron = null;
              fourmi.puceron = true;
            }
          }
          if (fourmi.puceron && target.type === 'eau' && target.puceron == null) {
            // depose son puceron, prend son lait et repars
            fourmi.puceron = null;
            target.puceron = true;
            fourmi.status = 'Remplie';
            fourmiDico.current[fourmi.id] = [];
          }
          if (type === 'sucre' && fourmi.status !== 'Remplie') {
            // si target est un sucre, reste une seconde, lui pompe 2 unites et retourne a la colonie

            fourmi.status = 'Remplie';
            fourmi.lastCase = "0";
            fourmiDico.current[fourmi.id] = [];
            // Réduit le contenu de la tuile
            target.contenu -= Number(config.colonies[COLONIE_COURANTE]?.SUCRE_STOCK);
            if (target.contenu <= 0) {
              target.type = 'herbe';
              target.color = 'lightgreen';
            }

          }
          else if (type === 'colonie' && fourmi.status === 'Remplie') {
            // si target est un sucre, reste une seconde, lui pompe 2 unites et retourne a la colonie

            fourmiDico.current[fourmi.id] = [];
            fourmi.status = null;
            fourmi.lastCase = "0";
            // Ajoute des trucs a la colonie.., TODO
            target.reserve = target.reserve + Number(config.colonies[COLONIE_COURANTE]?.SUCRE_STOCK);
          }
          // laisse pheromone sur case courante si pas deja

          const newPhero = { ...target.pheromone };
          if (target.type !== 'colonie') {
            if (newPhero[jeCherche] == null)
              newPhero[jeCherche] = 0;
            else {
              newPhero[jeCherche] = Math.max(0, (newPhero[jeCherche] - (laissePheromone ? 1 : 3)));// reduit fortement si on trouve pas ce qu'on cherche et qu'en plus on connait deja.
            }


            if (newPhero[jeLaisse] == null)
              newPhero[jeLaisse] = 0;

            if (laissePheromone)
              newPhero[jeLaisse] += 5;// sinon on oncr de 5 a chaque passage
            else if (newPhero[jeLaisse] > 0)
              newPhero[jeLaisse]--;// reduit la pheromone si pas interesse

          }
          if (fourmiDico.current[fourmi.id] == null)
            fourmiDico.current[fourmi.id] = [];
          fourmiDico.current[fourmi.id].push(target);
          tilesToUpdate.push({ ...target, pheromone: newPhero });

        }
        const oldTargetID = fourmi.target?.id ?? 0;
        const [tx, ty, t] = findTarget({ position: fourmi, autour: 1, connaitTarget });
        if (t != null)
          target = t;
        // a chaque changement de cible, une fourmi peut se remettre en question. on met a 5%
        if (Math.random() < 0.05)
          pragma = !pragma;

        return { ...fourmi, pragmatique: pragma, target: target, lastCase: oldTargetID }
      });
    });


    replaceTile(tilesToUpdate);

  }, [setFourmisPositions, findTarget, replaceTile]);

  // Utilisation de useEffect pour appeler moveAnts à intervalles réguliers
  useEffect(() => {
    const intervalId = setInterval(() => {
      moveAnts();
    }, VITESSE_FOURMI); // Appelle animateAnts environ 60 fois par seconde

    // Nettoie l'intervalle lors du démontage du composant
    return () => clearInterval(intervalId);
  }, [config.colonies]);
  return <>

    {/* Rendu des fourmis à leurs positions respectives */}
    {fourmisPositions.map((position, index) => (
      <Fourmi key={index} fourmi={position} getTypeColor={getTypeColor}  />
    ))}
  </>
}




export default Fourmiz;
