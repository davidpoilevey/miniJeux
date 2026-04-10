// components/Player.js
import React, { useMemo } from 'react';
import v1Img from './images/vaisseau1.png';
import v2Img from './images/vaisseau2.png';
import v3Img from './images/vaisseau3.png';
import v4Img from './images/vaisseau4.png';
import { Box } from '@mui/material';

export const VAISSEAU_WIDTH=50;
const Vaisseau = ({ x, y, type ,onClick}) => {
  const vaisseauImage = useMemo(()=>{
    let img=v1Img;
    if(type==='v2') img=v2Img;
    if(type==='v3') img=v3Img;
    if(type==='v4') img=v4Img;
    return img;
  },[type])
  const playerStyle = {
    width: VAISSEAU_WIDTH+'px',
    height: '50px',
    backgroundImage: `url(${vaisseauImage})`,
    backgroundSize:'contain',
    position: 'absolute',
    left: x,
    top: y,
  };

  return <Box onClick={onClick} style={playerStyle}></Box>;
};

export default Vaisseau;
