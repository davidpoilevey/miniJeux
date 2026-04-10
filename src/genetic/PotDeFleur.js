import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { randomGenome, recombinaisonGenetique, mutationADN, TAUX_MUTATION } from './ADNPlante';
import Plante from './Plante';
const INTERVAL=20;

const PotDeFleur = () => {

    const [plantes,setPlantes] = useState([]);
    const [cycleDeVie,setcycleDeVie] = useState(0);
    const [generation,setGeneration] = useState(1);
    const [message,setMessage] = useState('');
    const [scores, setScores] = useState([]);
    const [murs, setMurs] = useState([]);
    const [hiscore, setHiScore] = useState({score:Number.POSITIVE_INFINITY,adn:[]});
    const [adnPool, setAdnPool] = useState([]);

    const potRef = useRef();
    const potHeightRef = useRef(1000);

    const initPlantes = (adnToUse)=>{
        let genome=null;
        if(adnToUse!=null)
            genome=adnToUse;
       else if(adnPool.length>0){
            const adnPoolCopy = [...adnPool];
            genome=adnPoolCopy.pop();
            setAdnPool(adnPoolCopy);
        }
        else genome = randomGenome();
        const potRect = potRef.current.getBoundingClientRect();
        const plante = {id:'la premiere', adn:genome, plantationRect:potRect};
        setPlantes([plante]);
        setMessage('Nouvelle population');
    }
    const initMurs = ()=>{
        const potRect = potRef.current.getBoundingClientRect();
        potHeightRef.current = potRect.height;
        const justeUneBarre =[{x:potRect.width/2-100, y:potRect.height-100, width:40, height:10}
    ,{x:potRect.width/2+10, y:potRect.height-100, width:40, height:10}
    , {x:potRect.width/4, y:potRect.height/2+100, width:10, height:200}
    , {x:potRect.width/1.5+50, y:potRect.height/2+100, width:10, height:200}
    ,{x:potRect.width/2-50, y:potRect.height/2, width:100, height:10}
,{x:potRect.width/2-50, y:potRect.height/4, width:200, height:10}]; 
        setMurs(justeUneBarre)
    }
    useEffect(()=>{
        initMurs();
        const intervalId = setInterval(()=>{
            setcycleDeVie(cycle=>(cycle+1));
        },INTERVAL);
        return ()=> clearInterval(intervalId);
    },[]);
    useEffect(()=>{
    //   if(cycleDeVie>=100){
    //     setMessage('Cycle de vie maximum atteint. Bravo');
    //     setGeneration(gen=>gen+1);
    //   }
      if(cycleDeVie===0)
         initPlantes();
    },[cycleDeVie]);
    const nextPlante=(score, adn)=>{
        if(score<hiscore.score)
            setHiScore({score:score, adn:[...adn]});
        setScores(old=>[...old, {score:score, adn:adn}]);
        setcycleDeVie(0);
    }
    useEffect(()=>{
        if(scores.length>=100) nextGen();
    },[scores]);
    const replayHiscore=()=>{
       initPlantes(hiscore.adn)
    }
    const nextGen=()=>{
        if(scores.length<10)
        {
            setMessage('Echantillonnage trop petit, minimum 10')
            return;
        }
        setMessage('Nouvelle generation');
        setGeneration(gen=>(gen+1));
        let newPool=[];
        // Sélection des meilleurs (sans muter le tableau de state)
        const elite = [...scores].sort((sc1, sc2)=>sc1.score-sc2.score).slice(0,5);

        // Garder l'élite directement
        elite.forEach(ind => newPool.push(ind.adn));

        // Toutes les paires uniques → recombinaison + mutation
        for (let i = 0; i < elite.length; i++) {
            for (let j = i + 1; j < elite.length; j++) {
                const childs = recombinaisonGenetique(elite[i].adn, elite[j].adn);
                childs.forEach(child => newPool.push(mutationADN(child, TAUX_MUTATION)));
            }
        }
        setAdnPool(newPool.reverse());
        setScores([]);
    }

  return (
    <Box display={'flex'}>
        <Box  display={'flex'} flexDirection={'column'}>
{message!=='' && <Typography variant='h6'>{message}</Typography>}
<Typography>Plantes traitees : {scores.length}</Typography>
<Typography>Generation: {generation}</Typography>
<Typography>Cycle de vie: {cycleDeVie}</Typography>
<Typography>ADn disponible: {adnPool.length}</Typography>
<Typography>Hi-score: {Number.isFinite(hiscore.score) ? potHeightRef.current-hiscore.score : '-'}</Typography>


<Button onClick={replayHiscore}>Rejoue le champion</Button>
        <Button onClick={nextGen}>Next generation</Button>
        </Box>
    <Box ref={potRef}
      style={{
        position: 'absolute',
        bottom: '50px',
        left: '25%',
        width: '50vw', // Moitié de la largeur de l'écran
        height: '90vh', // Moitié de la hauteur de l'écran
        backgroundColor: '#ccc', // Couleur du pot
        border: '1px solid #333', // Bordure
        borderBottom:'3px dashed black',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end', // Aligner le contenu en bas
        alignItems: 'center', // Centrer horizontalement
      }}
    >
        {Number.isFinite(hiscore.score) && <Box style={{position:'absolute',top:hiscore.score, left:0,width:'100%',height:0, border:'1px dashed red'}}/>}
        {plantes.map((plante,idx)=>{
            return <Plante key={idx} {...plante} cycleDeVie={cycleDeVie} nextPlante={nextPlante} murs={murs}/>
        })}
          {murs.map((mur,idx)=>{
            return <Mur key={'mur'+idx} {...mur}/>
        })}
        
        
    </Box>
    </Box>
  );
};

export default PotDeFleur;


const Mur = ({x, y, width, height})=>{
    return <Box style={{position:'absolute', top:y, left:x, width:width, height:height, backgroundColor:'#333'}}></Box>
}