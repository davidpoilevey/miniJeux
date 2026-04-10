// components/Enemy.js
import React from 'react';
import basicImg from './images/enemy-basic.png';
import randomImg from './images/enemy-random.png';
import type2Img from './images/enemy-type2.png';
import bossImg from './images/enemy-boss.png';

const Enemy = ({ x, y, type }) => {
  const enemyStyle = {
    width:  ENEMY_TYPE[type].width+'px',
    height:  ENEMY_TYPE[type].height+'px',
    backgroundImage:`url(${ENEMY_TYPE[type].image})`,
    backgroundSize:'contain',
    position: 'absolute',
    left: x,
    top: y,
  };

  return <div style={enemyStyle}></div>;
};

export default Enemy;

export const ENEMY_TYPE={
    'basic':{
        color:'#999',
        image:basicImg,
        move:'alternate',
        width:30,
        height:30
    }
    , 'random':{
       color:'#99FFBB',
       image:randomImg,
       move:'random',
       width:30,
       height:30
    }
    , 'type2':{
       color:'#99FFBB',
       image:type2Img,
       move:'alternate',
       width:50,
       height:40
    }
    , 'boss':{
       color:'#444400',
       image:bossImg,
       move:'boss',
       width:60,
       height:50
    }
}