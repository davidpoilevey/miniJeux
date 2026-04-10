
import React, { useMemo, useRef, useState } from 'react';

import './tir.css';
import  { CibleGiratoire, CibleLineaire, CibleRebondissante , CibleSpirale} from './CibleRebondissante';
import balleImg from './bullet.png';
import fondImg from './fond.png';
import { Button } from '@mui/material';

const NB_TIR_PAR_PLAYER=5;

const JeuDeTir = () => {
  
  const [cibleImpacts, setCibleImpacts] = useState([]);
  const [impacts, setImpacts] = useState([]);
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [currentCibleIdx, setCurrentCibleIdx] = useState(0);
  const [evtCls, setEvent] = useState();

  const nbTir=useRef(0);
  const handleCanvasClick = (event, dansLeFond) => {
    // Obtenez les coordonnées du clic par rapport au canvas
    const canvas = event.target;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if(canvas.className?.startsWith('cercle') || canvas.className==='target'){
      if(dansLeFond)
        return;// si on arrive la, c'est un clic sur la cible, mais detecté aussi par le fond, on oublie le 2eme.
      let newScore=0;
      if(canvas.className==='target') newScore=50;
      if(canvas.className==='cercle1') newScore=25;
      if(canvas.className==='cercle2') newScore=10;
      if(canvas.className==='cercle3') newScore=5;
      if(currentPlayer===1)
        setScore1(sc=>sc+newScore);
        if(currentPlayer===2)
          setScore2(sc=>sc+newScore);
      setCibleImpacts(oldC=>{
        return [...oldC, {cercle:canvas.className, position:{x:x-5,y:y-5}}]
      });
      event.stopPropagation();
    }
    else
    // Ajoutez les coordonnées du nouvel impact à la liste des impacts
    setImpacts((prevImpacts) => [...prevImpacts, { x, y }]);


    nbTir.current++;
    if(nbTir.current>=NB_TIR_PAR_PLAYER){
      setCurrentPlayer(currentPlayer===1?2:1);
      setEvent('changePlayer');
      setTimeout(() => {
        setEvent(null);
      }, 500);
      nbTir.current=0;
    }
  };

  const cibles = [CibleLineaire, CibleRebondissante, CibleGiratoire,CibleSpirale];
  const nextCible = ()=>{
    setCurrentCibleIdx(idx=>((idx+1)%cibles.length));
    setCibleImpacts([]);

  }
  const CurrentCible = cibles[currentCibleIdx];
  
  
  return (
    <div style={{display:'flex' ,justifyContent:'center'}}>
    <div style={{display:'flex' ,background:`url(${fondImg}`, backgroundSize:'cover'}}>
      
    <div className={"game-container"+(evtCls!=null?` ${evtCls}`:'')}  onClick={evt=>{handleCanvasClick(evt,true)}} >
       {impacts.map((impact, index) => (
      <Impact 
        key={index}
        position={impact}
      />
    ))}
   
     <CurrentCible  impacts={cibleImpacts} onClick={handleCanvasClick}/>
    </div>

      <ScoreTable score1={score1} score2={score2} 
      nextCible={nextCible}
      currentPlayer={currentPlayer} nbTir={nbTir}/>
    </div>
    </div>
  );
};



export default JeuDeTir;



const ScoreTable = ({ score1,score2, currentPlayer, nbTir , nextCible}) => {
  return (
    <div className="score-table">
      <div className="table-header">
        <div>Player</div>
        <div>Score</div>
      </div>
      
        <div  className={`player ${currentPlayer===1?'active':''}`}>
          <div className='playerNameAndBalle'>Player 1
{currentPlayer===1?<Balles nb={nbTir.current}/>:null}
          
          </div>
          <div>{score1}</div>
        </div>
        <div  className={`player ${currentPlayer===2?'active':''}`}>
          <div className='playerNameAndBalle'>Player 2
{currentPlayer===2?<Balles nb={nbTir.current}/>:null}</div>
          <div>{score2}</div>
        </div>
        
        <Button onClick={nextCible} variant='contained' 
        style={{width:'100%', bottom:'0px', position:'absolute'}}
        disabled={currentPlayer===2||nbTir.current>0}>Prochaine cible</Button>
    </div>
  );
};

const Balles = ({nb})=>{
  const balles=[];

  for (let n = 0; n < (5-nb); n++) {
    balles.push(<Balle key={'b'+n}/>);
  }
  
  return <>
  {balles}
  </>
}
const Balle=()=>{
  return <img src={balleImg} alt="balle" height={40}/>
}


export const Impact = ({position, onCible})=>{

  return <div
  className={`impact`}
  style={{ left: position.x, top: position.y,zIndex:onCible?10:1 }}
/>
}



