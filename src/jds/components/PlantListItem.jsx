import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Avatar, Box } from '@mui/material';

export const PositionnedPlantListItem = React.forwardRef(({  plante, handlePlanteEdit, setIsDragging, isDragging, ...props },tref) => {
  const { nom, position} = plante;
  const [pos, setPos] = useState(position);
  const planteRef = useRef(tref);
  const clickTimeoutRef = useRef(null);
  useEffect(()=>{
    if(position!=null)
    setPos(position);
  },[position])
  const setRef=(elt=>{
    planteRef.current=elt;
  })
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [clickTimeout, setClickTimeout] = useState(null);

  const { x, y } = useMemo(()=>{
    return (pos==null)?{x:10,y:10}:pos
  },[pos])
  //(position==null)?{x:10,y:10}:position;

  const handleMouseDown = (event) => {
    const rect = planteRef.current.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;
  
    setDragOffset({ x: offsetX, y: offsetY });
   
    clickTimeoutRef.current = setTimeout(() => {
      setIsDragging(true);
      clickTimeoutRef.current = null;
    }, 500);
  };
  const handleMouseMove = (event) => {
    clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = null;
    if (!isDragging) return;
  

  const x = event.clientX - dragOffset.x;
  const y = event.clientY - dragOffset.y;
    setPos({x,y});
    if (isDragging) {
      event.stopPropagation();
      event.preventDefault(); 
    }
  };
  
  
  const handleMouseUp = (event) => {
    clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = null;

    if (!isDragging) return;
  
    clearTimeout(clickTimeout);
    setClickTimeout(
      setTimeout(() => {
        setIsDragging(false);
        setClickTimeout(null);
      }, 500)
    );
    // save position
  const x = event.clientX - dragOffset.x;
  const y = event.clientY - dragOffset.y;
    handlePlanteEdit({...plante, position:{x,y}})
  };
  const dragFunc = {
    isDragging:isDragging,
    onMouseDown:handleMouseDown,
    onMouseMove:handleMouseMove,
    onMouseUp:handleMouseUp
  }

  const listItemStyle = {
    position: 'absolute',
    left: x,
    top: y,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  return <PlantListItem  ref={setRef} style={listItemStyle}
   plante={plante} 
   {...dragFunc}
  {...props}/>
});
const PlantListItem = React.forwardRef(({onClick, style, plante , isDragging, ...props},ref) => {
  const { nom,  size=60 } = plante;
  
  const listItemStyle = {
     width: size, height: size , ...style
  };

  const handleClick = (evt) => {
    if(isDragging){
      evt.stopPropagation();
    }
    else
    onClick && onClick(evt);
  };
  return (
    <Box ref={ref} style={listItemStyle} onClick={handleClick} {...props}>
    <Box sx={{ width: size, height: size }}>
      <Avatar alt={nom} src={plante.image} sx={{ width: '100%', height: '100%' }} />
    </Box>
    <span style={{ marginTop: '8px' }}>{nom}</span>
  </Box>
  );
});

export default PlantListItem;
