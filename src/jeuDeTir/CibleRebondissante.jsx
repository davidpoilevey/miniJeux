import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Impact } from './JeuDeTir';
const FPS=24;
export const CibleLineaire = ({ impacts ,onClick}) => {
  const [position, setPosition] = useState({ x: -50, y: 250 });
  const speed = 10; // Vitesse de déplacement de la cible (ajustez selon vos besoins)
  const width = 800; // Largeur de l'écran
  const targetSize = 90; // Taille de la cible
const mvtY=useRef(3);
  useEffect(() => {
    const interval = setInterval(() => {
      // Mettre à jour la position de la cible en fonction de la vitesse
      setPosition(prevPosition => {
        let newX = prevPosition.x + speed;
        if (newX >= width + targetSize) {
          newX = -targetSize; // Réinitialise la position à gauche de l'écran une fois que la cible a traversé l'écran
        }
        if(prevPosition.y<200) // descend
          mvtY.current=4;
        else if(prevPosition.y>300)//remonte
         mvtY.current=-4;
        return { x: newX, y: prevPosition.y+mvtY.current };
      });
    }, 1000 / FPS); // Mettez à jour l'animation environ 60 fois par seconde

    return () => clearInterval(interval);
  }, []);

  return <Cible position={position} impacts={impacts} 
  onClick={onClick}/>;
};

export const CibleRebondissante = ({ impacts,onClick }) => {

  const [position, setPosition] = useState({ x: 110, y: 110 });
  const [direction, setDirection] = useState({ x: 1, y: 1 });
  const speed = 5; // Vitesse de déplacement de la cible (ajustez selon vos besoins)
  const width = 800; // Largeur de l'écran
  const height = 600; // Hauteur de l'écran
  const targetSize = 90; // Taille de la cible

  useEffect(() => {
    const interval = setInterval(() => {
      // Mettre à jour la position de la cible en fonction de la vitesse et de la direction
      setPosition(prevPosition => {
        let newX = prevPosition.x + speed * direction.x;
        let newY = prevPosition.y + speed * direction.y;
        if (newX-targetSize < 0) {
          setDirection(prevDirection => ({ ...prevDirection, x: 1 }));
          newX = targetSize;
        }
        if (newX >= width - targetSize) {
          setDirection(prevDirection => ({ ...prevDirection, x: -1 }));
          newX = width - targetSize;
        }
        if (newY-targetSize < 0) {
          setDirection(prevDirection => ({ ...prevDirection, y: 1 }));
          newY = targetSize;
        }
        if (newY >= height - targetSize) {
          setDirection(prevDirection => ({ ...prevDirection, y: -1 }));
          newY = height - targetSize;
        }
        return {
          x: newX,
          y: newY,
        };
      });


    }, 1000 / FPS); // Mettez à jour l'animation environ 60 fois par seconde

    return () => clearInterval(interval);
  }, [direction]);

  return <Cible position={position} impacts={impacts}
  onClick={onClick}/>

};






export const CibleSpirale = ({ impacts,onClick }) => {
  const [position, setPosition] = useState({ x: 400, y: 300 });
  const [angle, setAngle] = useState(0);
  const [radius, setRadius] = useState(10);
  //const rotationSpeed = 0.03; // Vitesse de rotation (ajustez selon vos besoins)
  const centerX = 400; // Coordonnée X du centre du cercle
  const centerY = 300; // Coordonnée Y du centre du cercle
  const targetSize = 90; // Taille de la cible

  useEffect(() => {
    const interval = setInterval(() => {
      // Mettre à jour l'angle
      const rotationSpeed = 10 / radius; 
      setAngle(prevAngle => prevAngle + rotationSpeed);
      setRadius(r=>r+1);

      // Mettre à jour la position de la cible en fonction de l'angle
      const newX = centerX + radius * Math.cos(angle);
      const newY = centerY + radius * Math.sin(angle);
      
      setPosition({ x: newX, y: newY });
      if(radius>300)
      setRadius(10)
    }, 1000 / FPS); // Mettez à jour l'animation environ 60 fois par seconde

    return () => clearInterval(interval);
  }, [angle]);

  return <Cible position={position} 
  onClick={onClick} impacts={impacts} />;
};


export const CibleGiratoire = ({ impacts,onClick }) => {
  const [position, setPosition] = useState({ x: 300, y: 300 });
  const [angle, setAngle] = useState(0);
  const rotationSpeed = 0.05; // Vitesse de rotation (ajustez selon vos besoins)
  const centerX = 400; // Coordonnée X du centre du cercle
  const centerY = 300; // Coordonnée Y du centre du cercle
  const targetSize = 90; // Taille de la cible

  useEffect(() => {
    const interval = setInterval(() => {
      // Mettre à jour l'angle
      setAngle(prevAngle => prevAngle + rotationSpeed);

      // Mettre à jour la position de la cible en fonction de l'angle
      const newX = centerX + Math.cos(angle) * 200;
      const newY = centerY + Math.sin(angle) * 150;
      
      setPosition({ x: newX, y: newY });
    }, 1000 / FPS); // Mettez à jour l'animation environ 60 fois par seconde

    return () => clearInterval(interval);
  }, [angle]);

  return <Cible position={position} impacts={impacts} onClick={onClick}/>;
};

const Cible = ({impacts, position,onClick})=>{

  const [cibleProperties, setCibleProperties] = useState({
    rayonCercle1: 30,
    epaisseurCercle1: 2,
    rayonCercle2: 60,
    epaisseurCercle2: 2,
    rayonCercle3: 90,
    epaisseurCercle3: 2,
  });
  const { impactsTarget, impacts1, impacts2, impacts3 } = useMemo(() => {
    let onTarg = [], on1 = [], on2 = [], on3 = [];
    if (impacts != null) {
      impacts.forEach((imp, impIdx) => {
        if (imp.cercle === 'target')
          onTarg.push(<Impact key={impIdx} position={imp.position} onCible />);
        if (imp.cercle === 'cercle1')
          on1.push(<Impact key={impIdx} position={imp.position} onCible/>);
        if (imp.cercle === 'cercle2')
          on2.push(<Impact key={impIdx} position={imp.position} onCible/>);
        if (imp.cercle === 'cercle3')
          on3.push(<Impact key={impIdx} position={imp.position} onCible/>);
      });
    }
    return { impactsTarget: onTarg, impacts1: on1, impacts2: on2, impacts3: on3 };

  }, [impacts]);

  const handleClick = () => {
    console.log('Cible cliquée !');
  };
  return <>
    <div
    onMouseDown={onClick}
      className="cercle3"
      style={{
        width: cibleProperties.rayonCercle3 * 2,
        height: cibleProperties.rayonCercle3 * 2,
        borderWidth: cibleProperties.epaisseurCercle3,
        left: position.x - cibleProperties.rayonCercle3 + 5,
        top: position.y - cibleProperties.rayonCercle3 + 5,zIndex:1 ,
      }}
    >
      {impacts3}
    </div>
    <div
    onMouseDown={onClick}
      className="cercle2"
      style={{
        width: cibleProperties.rayonCercle2 * 2,
        height: cibleProperties.rayonCercle2 * 2,
        borderWidth: cibleProperties.epaisseurCercle2,
        left: position.x - cibleProperties.rayonCercle2 + 5,
        top: position.y - cibleProperties.rayonCercle2 + 5,zIndex:2 ,
      }}
    >
      {impacts2}
    </div>
    <div
    onMouseDown={onClick}
      className="cercle1"
      style={{
        width: cibleProperties.rayonCercle1 * 2,
        height: cibleProperties.rayonCercle1 * 2,
        borderWidth: cibleProperties.epaisseurCercle1,
        left: position.x - cibleProperties.rayonCercle1 + 5,
        top: position.y - cibleProperties.rayonCercle1 + 5,zIndex:3 ,
      }}
    >
      {impacts1}
    </div>
    <div
    onMouseDown={onClick}
      className="target"
      style={{ left: position.x-7, top: position.y-7,zIndex:4 }}
    >

      {impactsTarget.map(imp => {
        return imp;
      })}
    </div>
  </>;
}