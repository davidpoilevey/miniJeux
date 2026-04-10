import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { randomGenome, recombinaisonGenetique } from './ADNPlante';

import Plant20 from './Plant20';
import { animateFruit, drawFruit, drawPlant } from './canvasDraws';
import { trouveUnNom } from './plantUtils';
const INTERVAL = 500;
const VITESSE_ROLLING=5;
const VITESSE_TOMBING=8;
const NBPLANTES_DEPART=5;
export const SCENE = {
    SOL_Y: 700,
    SCENE_WIDTH: 600,
    HAUTEUR_SERRE: 800
}


const PotDeFleur20 = () => {

    const [plantes, setPlantes] = useState([]);
    const [cycleDeVie, setcycleDeVie] = useState(0);
    const [generation, setGeneration] = useState(1);
    const [herbes, setInfos] = useState([]);
    const [message, setMessage] = useState('');
    const [scores, setScores] = useState([]);
    const [hiscore, setHiScore] = useState({ score: 1000, adn: [] });
    const [adnPool, setAdnPool] = useState([]);

    const potRef = useRef();

    const initPlantes = (adnToUse) => {
        let genome = null;
      
        const potRect = potRef.current.getBoundingClientRect();
        const plantes = [];
        for(let i=0;i<NBPLANTES_DEPART;i++){
            const posX = Math.random()*potRect.width;
            genome = randomGenome();
            plantes.push({ id: trouveUnNom(), adn: genome, positionX:posX });
        }
        setPlantes(plantes);
        setMessage('Nouvelle population');
    }
    const onNewPlant=fruitsMurs=>{
        //TODO trouver un nommage rigolo
        setPlantes(prevPlantes=>{
            const newplts=[...prevPlantes];//.filter(p=>p.vie);
            fruitsMurs.forEach(fruitMur=>{
                newplts.push({id:trouveUnNom(), positionX:fruitMur.x, adn:fruitMur.adn});
            });
            return newplts;
        })
    }
    const deadPlant=(plant)=>{
        // le plan est mort
        setMessage('le plant '+plant.id+' est mort');
        setPlantes(plantes.filter(p=>p.id!==plant.id));
    }


    useEffect(() => {
        setInterval(() => {
            setcycleDeVie(cycle => (cycle + 1));
        }, INTERVAL);
        const potRect = potRef.current.getBoundingClientRect();
        SCENE.HAUTEUR_SERRE = potRect.height;
        SCENE.SCENE_WIDTH = potRect.width;
        SCENE.SOL_Y = potRect.height * 0.8;
    }, []);
    useEffect(() => {
        if (cycleDeVie == 0)
            initPlantes();
    }, [cycleDeVie]);
    const reinit = () => {
        setcycleDeVie(0);
    }
    const reset = () => {
        setcycleDeVie(0);
        if (scores.length >= 100)
            nextGen();
        // initPlantes();
    }
    const replayHiscore = () => {
        initPlantes(hiscore.adn)
    }
    const nextGen = () => {
        if (scores.length < 10) {
            setMessage('Echantillonnage trop petit, minimum 10')
            return;
        }
        else
            setMessage('Nouvelle generation');
        setGeneration(gen => (gen + 1));
        let newPool = [];
        // selection des meilleurs
        const elite = scores.sort((sc1, sc2) => { return sc1.score > sc2.score ? 1 : -1 }).slice(0, 5);


        // Reproduction des meilleurs, stockage des ADN dans un pool
        for (let i = 0; i < elite.length; i++) {
            const adam = elite[i];
            newPool.push(adam.adn);
            // Calculer le nombre de fois que le membre actuel sera recombiné
            const numberOfRecombinations = elite.length - i;

            for (let j = 0; j < numberOfRecombinations; j++) {
                const eve = j === 0 ? elite[0] : elite[j - 1]; // elite[0] est toujours inclus
                const childs = recombinaisonGenetique(adam.adn, eve.adn);
                newPool.push(...childs);
            }
        }
        setAdnPool(newPool.reverse());
        setScores([]);
    }

    return (
        <Box display={'flex'}>
            <Box display={'flex'} flexDirection={'column'}>
                <Button onClick={reinit}>Recommence</Button>
                {message !== '' && <Typography variant='h6'>{message}</Typography>}
                <Typography>Plantes traitees : {plantes.length}</Typography>
                {/* <Typography>Generation: {generation}</Typography> */}
                <Typography>Cycle de vie: {cycleDeVie}</Typography>
                {/* <Typography>ADn disponible: {adnPool.length}</Typography>
                <Typography>Hi-score: {1000 - hiscore.score}</Typography> */}


                <Button onClick={replayHiscore} disabled={hiscore.adn.length == 0}>Rejoue le champion</Button>
                <Button onClick={nextGen}>Next generation</Button>
            </Box>
            <Box ref={potRef}
               
            >
                <Scene plantes={plantes} cycleDeVie={cycleDeVie} 
                setInfos={setInfos}
                onNewPlant={onNewPlant} deadPlant={deadPlant}>

                </Scene>
            </Box>
            <InfoBox infos={herbes}/>
        </Box>
    );
};

export default PotDeFleur20;

const InfoBox=({infos})=>{
    return <Box sx={{display:'flex',flexDirection:'column'}}>
        {infos.map(plante=>{
            return <Box>
                    <Typography variant='h6'>{plante.id}</Typography>
                    <Typography variant='h6'>Vie : {plante.vie}</Typography>
                </Box>
        })}
    </Box>
}

const Scene = ({ cycleDeVie, plantes , onNewPlant,deadPlant,setInfos}) => {
    const canvasRef = React.useRef(null);
   // const [herbes, setHerbes] = useState([]);
   const herbes=useRef([]);
    const [murs, setMurs] = useState([]);

    const updatePlant = (plant) => {
       
        if (plant.tronc.positionX == null) {
            plant.tronc.positionX = Math.round(Math.random() * SCENE.SCENE_WIDTH);
        }
        
            const foundPlantIdx=herbes.current.findIndex(p=>p.id===plant.id);
        if(foundPlantIdx>=0){
            //replace
            herbes.current.splice(foundPlantIdx,1,plant);
        }
        else //add
            herbes.current.push(plant);
    
           setInfos(herbes.current);
    }
    useEffect(() => {
        const canvas = canvasRef.current;
        if (plantes.length > 0 && plantes[0].plantationRect != null) {

            canvas.width = plantes[0].plantationRect.width;
            canvas.height = plantes[0].plantationRect.height;
        }
        else {

            canvas.width = SCENE.SCENE_WIDTH;
            canvas.height = SCENE.HAUTEUR_SERRE;
        }
    }, []);
    useEffect(() => {
        herbes.current=[];
    }, [plantes]);

    
    React.useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        murs.forEach(fruit => {
            drawFruit(ctx, fruit);
        })
    }, [murs]);
    React.useEffect(() => {


        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        // Effacer le canvas avant de dessiner
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Créer un dégradé de couleur
        const gradient = ctx.createLinearGradient(0, 0, 0, SCENE.SOL_Y);
        gradient.addColorStop(0, 'rgba(255, 255, 100, 0.8)'); // Jaune opaque en bas
        gradient.addColorStop(1, 'rgba(255, 255, 255, 1)'); // Jaune transparent en haut

        // Appliquer le dégradé
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, SCENE.SOL_Y);

        // Dessiner la partie basse (marron)
        ctx.fillStyle = '#D17B19';
        ctx.fillRect(0, SCENE.SOL_Y, canvas.width, canvas.height - SCENE.SOL_Y);


        
        // Dessiner chaque plante
        let nextMurs = [];
        herbes.current.forEach(plant => {
            if(plant.vie<0)
                deadPlant(plant);
            drawPlant(ctx, plant);

            if (plant.fruitMurs != null && plant.fruitMurs.length > 0) {

                if(!nextMurs.find(m=>m.id===plant.fruitMurs.id))
                    nextMurs = nextMurs.concat(plant.fruitMurs);
                delete plant.fruitMurs;
            }
        });
        // if (nextMurs.length > 0) {
        //     setMurs(prevMurs => prevMurs.concat(nextMurs));
        // }

           // animation des fruits murs
           const newPlantes=[];
           setMurs(prevMurs => {
               const newMurs = nextMurs;
               prevMurs.forEach(fruitmur => {
                   const fruit = { maturite: 0, ...fruitmur };
                   
                   let forgetIt=false;
                   if (fruit.y < SCENE.SOL_Y) {
   
                       // Faire tomber le fruit
                       fruit.y += VITESSE_TOMBING;
                   }
                   else {
   
                       // Le faire rouler
                       if (fruit.rolling) {
                           fruit.maturite++;// il ne vieillit que quand il roule
                           fruit.x += fruit.direction * VITESSE_ROLLING;
                           if (fruit.maturite>10||Math.abs(fruit.x - fruit.startX) >= 100) {
                               fruit.rolling = false;
                           }
                       } else if (fruit.rolling == null) {
                           fruit.startX = fruit.x;
                           fruit.direction = Math.random() < 0.5 ? -1 : 1;
                           fruit.rolling = true;
                       }
                       else if (fruit.rolling === false) {
                           // fin du roulage, une nouvelle plante apparait 
                           newPlantes.push(fruit);
                           forgetIt=true;
                       }
   
                   }
                   if(!forgetIt)
                       newMurs.push(fruit);
               });
               return newMurs;
           });
           if(newPlantes.length>0){
               // nouvelle plante (made unique by id)
               var plantsUniques = {};

                newPlantes.forEach(function(objet) {
                    // Si l'ID de l'objet n'existe pas encore dans l'objet objetsUniques, l'ajouter
                    if (!plantsUniques[objet.id]) {
                        plantsUniques[objet.id] = objet;
                    }
                });

               onNewPlant(Object.values(plantsUniques));
           }

    }, [cycleDeVie]);

    return <>
        <canvas ref={canvasRef} />
        {plantes.map((plante, idx) => {
            return <Plant20 key={plante.id || ('plante' + idx)}
                plantID={plante.id || ('plante' + idx)}
                updatePlant={updatePlant}
                {...plante} cycleDeVie={cycleDeVie} />
        })}

    </>;
};
