import React, { useState } from "react";
import './css.css';
import { ROUGE } from "./CurlingGame";
const Stone = React.forwardRef(({position, velocity, setGlisseFactor,color,winner=false, ...props}, ref)=>{

    const canHover = (typeof setGlisseFactor === 'function');
    const [isHovered, setIsHovered] = useState(false);
    const colorHtml = canHover?(color==ROUGE?'red':'blue'):'transparent';
  const handleMouseEnter = () => {
    setIsHovered(true);
    if(canHover)
    setGlisseFactor(0.998);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if(canHover)
    setGlisseFactor(0.99);
  };
if(position==null)
return null;
  return (
    <div ref={ref}
      className="stone"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ left: `${position.x}px`, top: `${position.y}px`
      ,boxShadow:'0 0 6px 3px '+colorHtml }}
    >
        {winner&&<span role="img" style={{fontSize:'30px'}}>👑</span>}
       {isHovered&&canHover && <Broom position={position} />}
    </div>
  );
});
export default Stone;



const Broom = ({ position }) => {
    return (
      <div
        className="broom"
        style={{ left: `${position.x+60}px`, top: `${position.y}px` }}
      >
        🧹
      </div>
    );
  };