// components/Tir.js
import React from 'react';

const Tir = ({ x, y }) => {
  const tirStyle = {
    width: '3px',
    height: '10px',
    backgroundColor: 'yellow',
    position: 'absolute',
    left: x,
    top: y,
  };

  return <div style={tirStyle}></div>;
};

export default Tir;
