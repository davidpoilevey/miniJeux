import teteImg from './tete.jpg';
import texture from './serpent.jpg';
import explosion from '../../shootemup/images/explosion.gif';
import { useMemo } from 'react';
import { BorderClear, NotInterested, SlowMotionVideo, Speed, Superscript } from '@mui/icons-material';

export const NODESIZE = 20;
export const SnakeNode = ({node})=>{
  if(node==null)
    return null;
    return <div style={{position:'absolute', top:node.y, left:node.x
        , height:NODESIZE+(node.next==null?10:0), width:NODESIZE+(node.next==null?10:0)
        , backgroundSize:'contain', borderRadius:'8px'
    , backgroundImage:'url('+(node.next==null?teteImg:texture)}}>

    </div>
  }
  export const BONUS_TYPES=['vitesse','ralentis','plus2','remove'];
  export const Bonus = ({type, x, y})=>{
    const BonusIcon = useMemo(()=>{
        let ic = null;
        switch(type){
            case 'vitesse':
                ic = Speed;break
                case 'ralentis':  ic = SlowMotionVideo;break
            case 'plus2':  ic = Superscript;break
            case 'remove':  ic = BorderClear;break
            default: ic = NotInterested
        }
        return ic;
    },[type])
    return  <div style={{position:'absolute', top:y, left:x
        , height:NODESIZE, width:NODESIZE, borderRadius:'8px'}}>
            <BonusIcon color="primary"/>
    </div>
  }
  export const WallBox = ({ wall }) => {
    const gradient = createGradient(wall.width, wall.height); // Créer un gradient
  
    return (
      <div
        style={{
          position: 'absolute',
          top: wall.y,
          left: wall.x,
          height: wall.height,
          width: wall.width,
          background: gradient,
          border: '1px solid black'
        }}
      />
    );
  };
  
  // Fonction pour créer un gradient (exemple avec CSS)
  function createGradient(width, height) {
    return `linear-gradient(to right, #4CAF50, #009688)`;
  }