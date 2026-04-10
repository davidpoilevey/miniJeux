import { icon } from "@fortawesome/fontawesome-svg-core";
import { Add, Build, Festival, ResetTv, VolumeMute, VolumeUp } from "@mui/icons-material";
import { Box, SpeedDial, SpeedDialAction, SpeedDialIcon } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { TDProvider, useTowerDefense } from "./TDContext";
import { TDCanvas } from "./TDCanvas";

const TowerDefense = () => {
    const [frameSize, setSize] = useState({width:600,height:400});
    const boxRef = useRef();
    useEffect(() => {
        const handleResize = () => {
            if (boxRef.current) {
                const w = boxRef.current.offsetWidth;
                const h = boxRef.current.offsetHeight;
                setSize({width:w, height:h});
            }
        }

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [])
    return <Box ref={boxRef} sx={{ width: '100%', height: '100%' }}>
        <TDProvider>
           
            <TDCanvas size={frameSize}/>
            <TDSpeedDial />
        </TDProvider>
    </Box>

}
export default TowerDefense;

export const UnPeuDeMusique=({mute})=>{
   
    useEffect(()=>{
        const audio = document.getElementById('pachelbel');
        if(mute) 
             audio.pause() 
        else
             audio.play();
    },[mute])
   
   return  <audio id="pachelbel" loop
   src={'https://upload.wikimedia.org/wikipedia/commons/e/e2/Pachelbel_Canon_1694_arrangement.mp3'} />
      
}
const TDSpeedDial = () => {
    const [mute, setMute] = useState(false);
    const actions = [{ name: "Ajoute une tour", mode: "construction", icon: <Festival /> }
        , {name:"Ameliore une tour", mode:"amelioration", icon: <Build />}
        , {name:"Reset tout", mode:"reset", icon: <ResetTv />}
         , {name:`${mute?"Remet":"Coupe"} le son`, mode:"mute", icon: mute?<VolumeUp/>:<VolumeMute />}

        
    ];
    const { setMode, reset , gameOver} = useTowerDefense();
    useEffect(()=>{
        if(gameOver)
            setMute(true);
},[gameOver]);
    const doAction = action => {
        if(action.mode==='reset')
            reset();
        else if(action.mode==='mute')
            setMute(!mute);
        else
            setMode(action.mode);
    }
    return  <>
     <UnPeuDeMusique mute={mute}/>
     <SpeedDial
            ariaLabel="SpeedDial basic example"
            sx={{ position: 'absolute', bottom: 16, right: 16 }}
            icon={<SpeedDialIcon />}
        >
            {actions.map((action) => (
                <SpeedDialAction
                    key={action.name}
                    icon={action.icon}
                    tooltipTitle={action.name}
                    onClick={evt=>{doAction(action)}}
                />
            ))}
        </SpeedDial>
        </>
}