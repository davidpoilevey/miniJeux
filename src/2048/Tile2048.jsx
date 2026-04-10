import React, {useState, useEffect, useMemo, useRef} from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const getColor = (value) => {
    switch (value) {
      case 2:
        return '#eee4da';
      case 4:
        return '#cde0c8';
      case 8:
        return '#f2b179';
      case 16:
        return '#f59563';
      case 32:
        return '#f67c5f';
      case 64:
        return '#f65e3b';
      case 128:
        return '#edcf72';
      case 256:
        return '#93fce1';
      case 512:
        return '#ed7cc1';
      case 1024:
        return '#4dc8c0';
      case 2048:
        return '#2dd5ef';
      default:
        return '#5c5053'; // Couleur par défaut pour les valeurs supérieures à 2048
    }
  };

  const getFontSize = (value) => {
    return `${Math.min(64 / value, 48)}px`;
  };

  const initialTransform = (cf) => {
    switch (cf) {
      case 'up':
        return 'translateY(180px)';
      case 'down':
        return 'translateY(-180px)';
      case 'left':
        return 'translateX(180px)';
      case 'right':
        return 'translateX(-180px)';
      default:
        return 'none';
    }
  };
const Tile = ({ value , comeFrom}) => {
    
      
  const _internalFrom = useRef('');
  if(_internalFrom.current?.startsWith('0')){
    if(_internalFrom.current!==('0'+comeFrom))
      _internalFrom.current = comeFrom;
  }
  
  const [internalFrom, setInternalFrom] = useState();
  const styles = useMemo(()=>{
    if(_internalFrom.current==null)
      _internalFrom.current = comeFrom;
    const useDir=internalFrom??_internalFrom.current;
    const tsf = initialTransform(useDir);
    const iop =(useDir==null||useDir.startsWith('0'))?1:0.3;
return  {
    card: {
      display: 'flex',
      borderRadius:'8px', 
      margin:'4px',
      flex:1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: getColor(value),
      fontSize: getFontSize(value),
      transition: 'transform 300ms ease-in',
      opacity:iop,
      transform : tsf
    },
  }
  },[value, internalFrom]);
  
  useEffect(()=>{
    let timeout=null;
    setInternalFrom(null);
    if(comeFrom!=null){
    _internalFrom.current = comeFrom;
     timeout = setTimeout(() => {
      setInternalFrom('0'+comeFrom);
      _internalFrom.current = '0'+comeFrom;
      }, 30);
    }

  return () => clearTimeout(timeout);
  },[comeFrom]);



  return value==0?null:(
    <Card sx={styles.card} className="tile">
      <CardContent sx={{padding:'2px', paddingBottom:'2px!important'}}>
        <Typography variant="h5" component="div">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};



export default Tile;