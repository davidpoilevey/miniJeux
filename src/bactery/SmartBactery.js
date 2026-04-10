import { Grass } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import React, { useMemo } from "react";
import bact0 from './images/bact0.png';
import bact1 from './images/bact1.png';
import bact2 from './images/bact2.png';
import bact3 from './images/bact3.png';
import bact4 from './images/bact4.png';
import bactRouge from './images/bactRouge.png';


const SmartBactery = React.forwardRef((props, ref)=>{
    const {bacterie, ...rest} = props;
    const bactSize = 20;
    const {position, champVision, customSkin, vitesse, force, energie} = bacterie;
    const {icon, specialEffect, color} = useMemo(()=>{
        // 
        let ic=bact0;
        const bad=energie<20;
        let clr='#000';
        if(customSkin!=null)
            ic=customSkin;
        else{
            if(champVision>200&&vitesse>1.5&&force>10){
                ic=bact4;
            }
            else if(champVision>150&&vitesse>1.2)
                ic=bact3;
            else if(champVision>100){
                ic=bact2;
            }
            else if(vitesse>1)
                ic=bact1;
            else if(energie<50)
                ic=bactRouge;
        }
        
        return {icon:ic, specialEffect:bad, color:clr};
    },[champVision, customSkin, vitesse, force, energie]);

    const containerStyle = {
        position: 'absolute',
        top: `${position.y-bactSize/2}px`,
        left: `${position.x-bactSize/2}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
    };
    const circleStyle = {
        width: `${bactSize}px`,
        height: `${bactSize}px`,
        borderRadius: '50%',
        border: '1px dashed #000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative', // pour positionner les cicatrices
        color: color,
        filter: `drop-shadow(0px 0px 8px ${color})${specialEffect ? ' blur(1px)' : ''}`,
    };
    return (
        <Box ref={ref} style={containerStyle}>
        
            <div title={bacterie.ptiNom}
                style={circleStyle}
            >
                <img alt="bact" src={icon} width="100%" height="100%"/>
            </div>
            <Typography>{bacterie.stock}</Typography>
        </Box>
    );
});
export default SmartBactery;
