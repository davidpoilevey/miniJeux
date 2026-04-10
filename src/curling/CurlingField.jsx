import React, { useRef, useState } from 'react';
import './css.css';
import Stone from './Stone';
export const stoneSize = 50;
const fieldLimit = 350;
const CurlingField = React.forwardRef(({ addStone, children, ...props },ref) => {


    const [currentStone, setCurrStone] = useState();
    const stoneCount = useRef(0);
    const [isMoving, setIsMoving] = useState(false);

    const handleMouseDown = (event) => {
        setIsMoving(true);
        stoneCount.current++;
        const stoneName = 'stone' + stoneCount.current;
        setCurrStone(newStone(stoneName, { x: event.clientX - stoneSize / 2, y: event.clientY - stoneSize / 2 }));

    };

    const handleMouseUp = () => {
        setIsMoving(false);
        if (currentStone.prevPosition != null && currentStone.position!=null) {

            const velocityX = (currentStone.position.x - currentStone.prevPosition.x) / 8;
            const velocityY = (currentStone.position.y - currentStone.prevPosition.y) / 8;
            const stoneWithVelocity = { ...currentStone, velocity: { x: velocityX, y: velocityY } };
            addStone(stoneWithVelocity);
        }
        setCurrStone(null);
    };

    const handleMouseMove = (event) => {
        const newPosition = {
            x: event.clientX - stoneSize / 2,
            y: event.clientY - stoneSize / 2,
        };
        if (isMoving) {
            setCurrStone((current) => {


                return {
                    ...current,
                    position: newPosition,
                };
            });
            const prevPosition = currentStone.position;
            //au dela de la mite, on mouseUp
            if(prevPosition.x>fieldLimit)
            handleMouseUp(event)
            // Mettre à jour la previousPosition toutes les 16,67 ms (60 FPS)
            setTimeout(() => {
                setCurrStone(old => {
                    return { ...old, prevPosition: prevPosition }
                })
            }, 40);
        }
    };


    return <div className="curling-field"
ref={ref}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        {...props}>
            
        <div className='circle-container'>

<div className=" circle-blue"></div>
<div className=" circle-white"></div>
<div className=" circle-red"></div>
<div className=" circle-limit"></div>
</div>
            {children}
        {currentStone != null && <Stone position={currentStone.position} />}
    </div>;
});

export default CurlingField;

const newStone = (id, position) => {
    const randomColor = 'grey';
    return {
        position: position,
        id: id,
        color: randomColor,
        velocity: { x: 0, y: 0 }
    }
}