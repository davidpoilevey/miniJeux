import React from 'react';

const Bille = ({ position, id, radius, type, vitesseX, vitesseY }) => {
  const style = {
    position: 'absolute',
    left: position.x,
    top: position.y,
    width: radius*2,
    height: radius*2,
    borderRadius: '50%',
    backgroundColor: type==='acid'?'purple':'black',
  };

  return <div style={style}></div>;
};

export default Bille;
