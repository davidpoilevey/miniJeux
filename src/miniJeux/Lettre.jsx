import { Box, Button } from '@mui/material';
import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line, Circle } from 'react-konva';
import lettreImg from './images/lettre.png';
import lettreInverseImg from './images/lettreInverse.png';

const configs={
  lettre:[{x:50,y:200,id:'tl'}
    , {x:50,y:450,id:'bl'} 
    , {x:450,y:200,id:'tr'} 
    , {x:450,y:450,id:'br'} 
    , {x:250,y:50,id:'md'}
  ]
  , lettreInverse:[{x:50,y:100,id:'bl'}
    , {x:50,y:350,id:'tl'} 
    , {x:450,y:100,id:'br'} 
    , {x:450,y:350,id:'tr'} 
    , {x:250,y:450,id:'md'}
  ]
}

const checkConnexions=(arr)=>{
  const pairs = {};
  for (let i = 0; i < arr.length - 1; i += 2) {
    const pair = arr.slice(i, i + 2).sort().join('');
    if (pairs[pair]) {
      return false;
    }
    if(pair==='brmd'||pair==='blmd')
      return false;
    pairs[pair] = true;
  }
  return true;
}

const Lettre = () => {
  const [lines, setLines] = useState([]);
  const [points, setPoints] = useState([]);
  const [mode, setMode] = useState('lettre');
  const [connexions, setConnexions] = useState([]);
  const [activePoint, setActivePoint] = useState();
  const [gagne, setGagne] = useState(false);
  const [error, setError] = useState();
  const isDrawing = useRef(false);
  const isConnecting = useRef(false);
  const stageRef = useRef(null);

  useEffect(()=>{
    if(mode!=null)
      setPoints(configs[mode]);
  },[mode]);

  useEffect(()=>{
    
  if(!checkConnexions(connexions))
    return setError(true);

  if(!error && lines.length===9)
    setGagne(true);
  },[connexions,error,lines.length]);
  

  const handleMouseDown = (e, pid) => {
    isDrawing.current = true;
    setActivePoint(pid);
    const _lines=gagne?[]:lines;
    
    setGagne(false);
    
    setPoints(pts=>{
      return pts.map(pt=>{
        return {...pt, lighted:pid===pt.id}
      })
    });
    setLines([..._lines, { points: [e.evt.offsetX, e.evt.offsetY] }]);
  };
  
  
const onMouseOver=(e,pid)=>{
if(isDrawing.current && activePoint!=pid){
  //check not in connexions
  setActivePoint(pid);
  setPoints(pts=>{
    return pts.map(pt=>{
      return {...pt, lighted:pt.lighted||pid===pt.id}
    })
  });
  setConnexions(c=>c.concat([activePoint,pid]));
  isConnecting.current=true;// to wait for mouseMove to catch current rerender
  setLines([...lines, { points: [e.evt.offsetX, e.evt.offsetY] }]);
}
}
const onMouseOut=evt=>{
  isConnecting.current=false;
}
  const handleMouseMove = (e) => {
    if (!isDrawing.current||isConnecting.current) {
      return;
    }
    const lastLine = lines[lines.length - 1];
    lastLine.points = [lastLine.points[0],lastLine.points[1],e.evt.offsetX, e.evt.offsetY];
    setLines([...lines]);
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
    if(!gagne)
      setLines([]);
    setConnexions([]);
    setActivePoint(null);
    setError(false);
    setPoints(pts=>{
      return pts.map(pt=>{
        return {...pt, lighted:false}
      })
    });
  };
  return (
    <Box sx={{border:'2px ridge red', width:'100%', background:gagne?'radial-gradient(circle at center, #FF0 0%, #f60 70%)':null}}>
        
    <Stage width={500} height={500} ref={stageRef} margin="auto"
    onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      <Layer>
        {points.map(({x,y, id, lighted},pidx)=>{
          return   <Circle key={pidx}
          x={x} y={y} radius={15} 
           onMouseDown={evt=>{handleMouseDown(evt,id)}}
           onMouseOver={evt=>{onMouseOver(evt,id)}}
           onMouseOut={evt=>{onMouseOut(evt,id)}}
            fill={lighted?"green":"black"} />
        })}
    
        {lines.map((line, i) => (
          <Line key={i} points={line.points} stroke={error?"red":"black"} strokeWidth={error?3:2} />
        ))}
      </Layer>
    </Stage>
    <Box sx={{display:'flex', flexDirection:'column'}}>
      <Button onClick={()=>{setMode('lettre')}}>
        <img src={lettreImg} height={50} alt="lettre"/>
      </Button>
      <Button onClick={()=>{setMode('lettreInverse')}}>
        <img src={lettreInverseImg} alt="inverse" height={50}/>
      </Button>
    </Box>
    </Box>
  );
};

export default Lettre;