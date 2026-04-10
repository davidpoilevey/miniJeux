import { Box, Button, Card, CardActions, CardContent, CardHeader, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import imgCul4 from './images/cul.png';
import imgCul1 from './images/cul1.png';
import imgCul2 from './images/cul2.png';
import imgCul3 from './images/cul3.png';

import sonPet1 from './images/sonPet1.wav';
import sonPet2 from './images/sonPet2.wav';
import sonPet3 from './images/sonPet3.wav';
import sonPet4 from './images/sonPet5.mp3';
import sonPet5 from './images/sonPet4.mp3';
import fond from './images/fondGaz.jpg';
import imgMerde0 from './images/merde0.png';
import imgMerde1 from './images/merde1.png';
import imgMerde2 from './images/merde2.png';
import imgMerde3 from './images/merde3.png';
import imgMerde4 from './images/merde4.png';
import imgMerde5 from './images/merde5.png';
import imgMerde6 from './images/merde6.png';
import imgMerde7 from './images/merde7.png';
import imgMerde8 from './images/merde8.png';
import imgMerde9 from './images/merde9.png';

const Clicker = () => {
    return <ClickerContextProvider>
        <Box sx={{ display: 'flex',height:'calc(100% - 60px)' }}>
            <ClickerMenu />
            <ClickerBoard />
        </Box>
    </ClickerContextProvider>
}
export default Clicker;
const merdeWidth=20;
const listDeCul=[{image:imgCul1, cost:20},{image:imgCul2, cost:500}, {image:imgCul3, cost:5000}, {image:imgCul4, cost:50000}]

const ClickerBoard = ({ }) => {
const {clique, points, ptByClick, ptBySecond, buy,clickTips, setClickTips} = useClickerContext();
const [merdes, setMerdes] = useState([]);
const [imgCulIdx, setImgCulIdx] = useState(0);
const [imgCul, setImgCul] = useState(imgCul1);
const [prixCul, setPrixCul] = useState(500);
const containerRef = useRef();
const upgradeImg=()=>{
    if(imgCulIdx>2)
        return;
    setImgCulIdx(oidx=>(oidx+1));
    buy(null,prixCul);
    
}
useEffect(()=>{
    setImgCul(listDeCul[imgCulIdx].image);
    setPrixCul(listDeCul[imgCulIdx].cost);
},[imgCulIdx])
const doClick=()=>{
    clique();
    setClickTips(cp=>{
        const newcp = cp.filter(c=>c.id.getTime()>((new Date()).getTime()-1000));
        return [...newcp, {text:ptByClick, id:(new Date())}]
    });
    const newImage = {
        id: Date.now(),
        top: -50, // Position initiale en haut
        left:Math.random()*containerRef.current.offsetWidth,
        duration: Math.random() * 2 + 1, // Durée de l'animation aléatoire
      };
  
      setMerdes([...merdes, newImage]);
    };
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        let intervalId = null;
        const containerHeight = containerRef.current.clientHeight;
        const LIMIT=containerHeight;
        const animate = () => {
          setMerdes(oldMerdes=>{
            const newmerdes = oldMerdes.map((merde,idx,orig)=>{
                let newTop=merde.top;
                let stopped = false;
                if(merde.stopped)
                    return merde;
                if (newTop >= LIMIT)
                    return {...merde, top:LIMIT, stopped:true};

                newTop+=(containerHeight / merde.duration) * 2;
                orig.forEach(m=>{
                    if(m.left>merde.left&&m.left<(merde.left+merdeWidth) && m.top<=newTop+merdeWidth)
                    {
                        stopped=true;
                        newTop=m.top-merdeWidth;
                    }
                });
                return {...merde, top:newTop, stopped:stopped};
            });
            return newmerdes;
          })
          
        };
  
        intervalId = setInterval(animate, 50); // Animate at 60 FPS (1000ms / 60fps = 16ms)
  
        return () => clearInterval(intervalId); 
      }, [merdes]);

    return <Box ref={containerRef} 
    sx={{display:'flex', flexDirection:'column', userSelect:'none',
        backgroundImage:`url(${fond})`, backgroundSize:'cover',
    width:'100%', alignItems:'center', justifyContent:'center', position:'relative'}}>

       
      <Box sx={{backgroundColor:'rgba(200,200,200,0.6)'}}>
      <Typography variant="h5">{points<1000000000?points.toLocaleString():points.toExponential(2)} pets</Typography>
        <Typography variant="body2">{ptByClick.toLocaleString()} pets/clic</Typography>
        <Typography variant="body2">{ptBySecond.toLocaleString()} pets/sec</Typography>
        
      </Box>
      <Box sx={{position:'relative', width:'200px'}}>
        {clickTips.map((tip,tidx)=>{
            return <ClickTip key={'tip'+tip.id} text={tip.text} fromTimer={tip.fromTimer}/>
        })}
        </Box>
        {/* ici les objets qui tombent */}
        {merdes.map((merde,midx)=>{
            return <Merde {...merde} key={'m'+midx}/>
        })}
        <ClickBait onClick={doClick} image={imgCul}/>
        <Button variant="contained" disabled={points<prixCul}
            onClick={upgradeImg}>Ameliore ce cul ({prixCul})</Button>
    </Box>
}
const merdeImage=[imgMerde0,imgMerde1,imgMerde2,imgMerde3,imgMerde4,imgMerde5,imgMerde6,imgMerde7,imgMerde8,imgMerde9]
const Merde = (merde)=>{
const theImage = useMemo(()=>{
const choix = Math.floor(Math.random()*10);
return merdeImage[choix];
},[])
    return <Box  style={{
        position:'absolute',
        top: `${merde.top}px`,
        left:`${merde.left}px`,
        transition: `top ${merde.duration}s ease-in`,
      }}>
       
          <img src={theImage} height={20} alt="Image" />
    </Box>
}
const ClickTip=({text, fromTimer=false})=>{
    const [isVisible, setIsVisible] = useState(true);
    const classes = useStyle();
    useEffect(() => {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5); // Durée de vie du texte en millisecondes
  
      return () => clearTimeout(timer);
    }, [isVisible]);
    const leftPos = useMemo(()=>{
        return (Math.random()*200);
    },[])
  
    return (
      <Typography sx={{position:'absolute', left:leftPos,color: '#000000',
background: fromTimer?'#AFAFFF':'#FFAFAF',
textShadow: `2px 2px 0 ${fromTimer?'#5cbcbc':'#fcbc5c'}, 4px 4px 0 #ec9c9c`}}
      className={isVisible ? classes.floatingTextVisible : classes.floatingTextDead}>
        {text}
      </Typography>
    );
}
const useStyle =  makeStyles((theme) => ({
    bouton :{
        /* Styles de base du bouton */
         backgroundSize:'cover', backgroundPosition:'center',
        padding: '10px',
        cursor: 'pointer',
        transition: 'transform 0.1s ease-in-out'
      }
      
      ,rebond :{
        transform: 'scale(1.2)'
      }
    
      ,floatingTextDead :{
        opacity: 0,
        transform: 'translateY(-100px)',
        transition: 'opacity 1s ease-in-out, transform 1s ease-in-out'
      },
      
      floatingTextVisible :{
        opacity: 1,
        transform: 'translateY(0)',
       
      }
}));

const ClickBait=(props)=>{
    const [isBouncing, setIsBouncing] = useState(false);
    const audioRef1 = useRef(null);
    const audioRef2 = useRef(null);
    const audioRef3 = useRef(null);
    const audioRef4 = useRef(null);
    const audioRef5 = useRef(null);
const classes = useStyle();
    useEffect(() => {
      if (isBouncing) {
        const choix = Math.floor(Math.random()*5);
        if(choix===0)
        audioRef1.current.play();
        if(choix===1)
        audioRef2.current.play();
        if(choix===2)
        audioRef3.current.play();
        if(choix===3)
        audioRef4.current.play();
        if(choix===4)
        audioRef5.current.play();
        const timeoutId = setTimeout(() => {
          setIsBouncing(false);
        }, 100); // Durée de l'animation en ms
  
        return () => clearTimeout(timeoutId);
      }
    }, [isBouncing]);
  
    return <Box onClick={evt=>{
        setIsBouncing(true);
        props.onClick(evt);
    }}  className={`${classes.bouton} ${isBouncing ? classes.rebond : ''}`}
    sx={{backgroundImage:`url(${props.image})`
    , borderRadius:'50%',width:'200px',height:'200px'}}>
         <audio ref={audioRef1} src={sonPet1} />
         <audio ref={audioRef2} src={sonPet2} />
         <audio ref={audioRef3} src={sonPet3} />
         <audio ref={audioRef4} src={sonPet4} />
         <audio ref={audioRef5} src={sonPet5} />
    </Box>
}
const ClickerMenu = ({  }) => {
    const {ameliorations, buy , points, ptBySecond} = useClickerContext();
    return <Box sx={{ display: 'flex', flexDirection: 'column' , overflow:'auto'
    , backgroundImage:`url(${fond})`, backgroundSize:'cover',filter:'contrast(1.1)'
    , color:'cornsilk', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)'}}>
        {ameliorations.map((am, aidx) => {
            return <Amelioration value={am} buy={buy} ptBySecond={ptBySecond} points={points}
            key={'am' + aidx} />
        })}
    </Box>
}
const Amelioration = ({ value, buy , points,ptBySecond }) => {
  const realCost = value.timerRate!=null?ptBySecond*50:value.cost;
    return <Box>
        <Box>
        <Typography variant="h6">{value.name}</Typography>
            </Box> 
            
            <Typography>{value.description}</Typography>
            {value.moreByClick>0 && <Typography color="primary">+{value.moreByClick.toLocaleString()} pt par clic</Typography>}
            {value.moreBySecond>0 && <Typography color="primary">+{value.moreBySecond.toLocaleString()} pt par seconde</Typography>}
  
            <Button  variant="contained" disabled={realCost>points}
            onClick={evt => { buy(value.id); }}>Achete ({realCost.toLocaleString()})</Button>
          </Box> 
}
const AMELIORATIONS = [
    {
        id: 'haricot', name:'des Haricots'
        , cost: 10
        , moreByClick: 1
        , moreBySecond: 0
        , description: 'Le classique'
    },  {
        id: 'feves', name:'des feves'
        , cost: 50
        , moreByClick: 10
        , moreBySecond: 0
        , description: 'au hasard'
    }, {
        id: 'munster', name:'Du munster'
        , cost: 1000
        , moreBySecond: 50
        , moreByClick: 0
        , description: 'Le fromage qui permet des sailencieux mais mortels'
    }, {
        id: 'chou', name:'du chou'
        , cost: 1000
        , moreByClick: 400
        , moreBySecond: 0
        , description: 'Le chou, une valeur indeniable'
    }, {
        id: 'choucroute', name:'de la choucroute'
        , cost: 100000
        , moreBySecond: 6000
        , moreByClick: 0
        , description: 'La choucroute, y a rien de pire'
    }, {
        id: 'ventdefolie', name:'Vent de folie'
        , cost: 1000
        , moreBySecond: 0
        , moreByClick: 0
        , timerRate: 100
        , description: 'Les clics par secondes deviennent des clics par 10 millisecondes pendant 10 secondes'
    }
]
const useAmeliorations = () => {
    const [ams, setAms] = useState(AMELIORATIONS);
    const amById = amid => {
        return ams.find(a => a.id === amid);
    }
    const inflation = (amid) => {

        // cost augmente et moreBy aussi
        setAms(oldAms => {
            const newAms = oldAms.map(am => {
                if (am.id === amid)
                    return {
                        ...am, moreBySecond: am.moreBySecond * 1.6, moreByClick: Math.round(am.moreByClick * 1.2)
                        , cost: Math.round(am.cost * 1.4)
                    }
                else
                    return am;
            });

            return newAms;
        });
    }
    return { inflation, amById, ameliorations: ams };
}
const ClickerContext = createContext();

export const useClickerContext = () => {
    return useContext(ClickerContext);
}
export const ClickerContextProvider = ({ hiscores = { score: 0 }, children }) => {
    const [points, setPoints] = useState(0);
    const [clickTips, setClickTips]=useState([]);
    const [ptByClick, setPtByClick] = useState(1);
    const [timerRate, setTimerRate] = useState(1);
    const [ptBySecond, setPtBySecond] = useState(0);
    const { inflation, amById, ameliorations } = useAmeliorations();
    const buy = (amelID, freeCost) => {
        if(freeCost!=null)
        {
            setPoints(pts => (pts - freeCost));
            return;
        }
        const amelioration = amById(amelID);
        if(amelioration.timerRate!=null){
            amelioration.cost=ptBySecond*50;
            setTimerRate(amelioration.timerRate);
        }
        setPoints(pts => (pts - amelioration.cost));
        if (amelioration.moreByClick)
            setPtByClick(pt => (pt + amelioration.moreByClick));
        if (amelioration.moreBySecond)
            setPtBySecond(pt => (pt + amelioration.moreBySecond));
        
        inflation(amelID);
    }
    const clique = () => {
        setPoints(pts => (pts + ptByClick));
    }
    const updateBySecond = () => {
        setPoints(pts => (pts + ptBySecond));
    }
    useEffect(() => {
       
        const interval = setTimeout(() => {
            if(timerRate>1)
                setTimerRate(1);// remet a 1 si ca change apres 5 secondes
        }, 5000);

        // Nettoyez l'intervalle lorsque le composant est démonté
        return () => {
            clearTimeout(interval);
        };
    },[timerRate]);
    useEffect(() => {
        // intervalMove
        const interval = setInterval(() => {
            updateBySecond();
            if(ptBySecond>0)
            setClickTips(cp=>{
                return [...cp, {text:ptBySecond,fromTimer:true, id:(new Date())}]
            });
        }, 1000/timerRate);

        // Nettoyez l'intervalle lorsque le composant est démonté
        return () => {
            clearInterval(interval);
        };
    }, [ptBySecond,timerRate]);
    const ctxt = {
        points, buy, clique, ptByClick, ptBySecond, ameliorations
        ,clickTips, setClickTips
    }
    return <ClickerContext.Provider value={ctxt}>{children}</ClickerContext.Provider>
}
