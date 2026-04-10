import React, { useState, useRef, useEffect } from 'react';
import './Arkanoid.css';
import Brique from './Brique';
import { AcUnit, AssistWalker, AttachmentOutlined, ControlPointDuplicate, Coronavirus, FireExtinguisher, FitnessCenter, FoodBank, MultilineChart, PlusOne, PointOfSale, SlowMotionVideo, SpaOutlined, Speed, StickyNote2, Whatshot, ZoomInMap, ZoomOutMap } from '@mui/icons-material';



export const BRIQUE_TYPE = {
    'standard':{
        color:'#E8E899'
        , borderColor:'#dbdad9'
        ,width:50
        ,height:40
    }
    ,'dur':{
        color:'#989898'
        , borderColor:'#A8A859'
        ,width:50
        ,height:40
        ,resistance:'double'
    }
    ,'speed':{
        color:'#E8E8FF'
        , borderColor:'#A8A8F9'
        ,width:40
        ,height:40
        ,cadeau:{
            icon:<Speed/>
            , vitesse:4
        }
    }
    ,'slow':{
        color:'#E8CFB9'
        , borderColor:'#A8E859'
        ,width:60
        ,height:40

        ,cadeau:{
            icon:<AssistWalker/>
            , vitesse:1.1
        }
    }
    ,'gros':{
        color:'#fab093'
        , borderColor:'#f783b0'
        ,width:80
        ,height:40

        ,cadeau:{
            icon:<ZoomOutMap/>
            , vitesse:1.5
        }
    }
    ,'petit':{
        borderColor:'#FEBF99'
        , color:'#ffF1F6'
        ,width:30
        ,height:40

        ,cadeau:{
            icon:<ZoomInMap/>
            , vitesse:3.5
        }
    }
    ,'collante':{
        color:'#f5eab3'
        , borderColor:'#e49bf2'
        ,width:50
        ,height:40

        ,cadeau:{
            icon:<AttachmentOutlined/>
            , vitesse:1.7
        }
    }
    ,'multi':{
        color:'#76f274'
        , borderColor:'#aecaf5'
        ,width:50
        ,height:40

        ,cadeau:{
            icon:<ControlPointDuplicate/>
            , vitesse:3
        }
    }
    ,'effect':{
        color:'#5d5aed'
        , borderColor:'#e9e8fc'
        ,width:50
        ,height:40

        ,cadeau:{
            icon:<FitnessCenter/>
            , vitesse:1.8
        }
    }
    ,'fire':{
        color:'#f5412a'
        , borderColor:'#f5ef38'
        ,width:50
        ,height:40

        ,cadeau:{
            icon:<Whatshot/>
            , vitesse:2.5
        }
    }
    ,'acid':{
        color:'#6ceba5'
        , borderColor:'#c9f5ee'
        ,width:50
        ,height:40

        ,cadeau:{
            icon:<Coronavirus/>
            , vitesse:1.4
        }
    }
    ,'vie':{
        color:'#6cFFa5'
        , borderColor:'#c9053e'
        ,width:50
        ,height:40

        ,cadeau:{
            icon:<PlusOne/>
            , vitesse:1.1
        }
    }

}

const BriqueBuilder = ({ briques, setBriques, schema }) => {
  const BRIQUE_MARGIN = 5;


  const currentWidth = useRef(50);
  const currentHeight = useRef(20);

  useEffect(() => {
    if (schema.length === 0) return;

    let newBriques = [];
    let currentTop = 0;

    schema.forEach((row, rowIndex) => {
      let currentLeft = 0;
      row.forEach((brique, brickIndex) => {
        if (brique == null) {
            currentLeft += currentWidth.current + BRIQUE_MARGIN;
            return;
        }
        if (currentWidth.current < brique.width) currentWidth.current = brique.width;
        if (currentHeight.current < brique.height) currentHeight.current = brique.height;

        newBriques.push({
          id: `r${rowIndex}-b${brickIndex}`,
          type: brique.type,
          width: brique.width,
          height: brique.height,
          resistance:BRIQUE_TYPE[brique.type].resistance||'simple',
          left: currentLeft,
          top: currentTop,
        });

        currentLeft += brique.width + BRIQUE_MARGIN;
      });

      currentTop += currentHeight.current + BRIQUE_MARGIN;
      currentWidth.current = 50;
    });

    setBriques(newBriques);
  }, [schema]);


  return (
    <>
      {briques.map((brique) => (
        <Brique key={brique.id} {...brique}
        style={{ left: brique.left, top: brique.top }} />
      ))}
    </>
  );
};

export default BriqueBuilder;
