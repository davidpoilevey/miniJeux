import React, { useRef, useEffect } from 'react';

const Graph = ({ equation, setErr , scaleX, scaleY}) => {
  const canvasRef = useRef(null);


  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    quadrillage(ctx, width, height, scaleX, scaleY);
  

    // Dessine la fonction
    ctx.beginPath();
    ctx.moveTo(-width / 2, calculateY(-width / 2));
    for (let x = -width / 2 + 1; x <= width / 2; x++) {
      const y = calculateY(x/scaleX);
      ctx.lineTo(x + width / 2, height / 2 - y);
    }
    ctx.strokeStyle = 'blue';
    ctx.stroke();

    function calculateY(x) {
      // Évalue l'équation pour obtenir la valeur de y en fonction de x
      // Ici, nous évaluons la fonction "equation" passée en tant que prop\
      let y=0;
      try{
         y = eval(equation);

      }
      catch(e){
        // badly formed
        setErr('Equation non conforme');
      }
      return y * scaleY; // Ajuste la valeur de l'échelle verticale
    }
  }, [equation, scaleX, scaleY]);

  return <canvas ref={canvasRef} width={400} height={400} style={{ border: '1px solid black' , backgroundColor:'#e8e8e8'}} />;
};

export default Graph;


const quadrillage = (ctx, width, height, scaleX, scaleY) => {
  let numStepsX = Math.ceil(width / (2 * scaleX));
  let numStepsY = Math.ceil(height / (2 * scaleY));
  let factor=1;
  if(numStepsX<2){
    numStepsX*=5;
    numStepsY*=5;
    factor=5;
  }

  if(numStepsX>10){
    numStepsX/=5;
    numStepsY/=5;
    factor=0.2;
  }

  // Dessine le quadrillage (lignes verticales)
  for (let i = -numStepsX; i <= numStepsX; i++) {
    const x = i * scaleX/factor + width / 2;

    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.strokeStyle = '#ccc'; // Couleur des lignes du quadrillage
    ctx.stroke();

    // Ajoute les repères numériques (en utilisant Math.round pour arrondir les valeurs)
    ctx.fillStyle = 'black';
    const rep = factor>1?((x - width / 2) / scaleX).toFixed(2):Math.round((x - width / 2) / scaleX);
    ctx.fillText(rep, x, height / 2 + 12);
  }

  // Dessine le quadrillage (lignes horizontales)
  for (let i = -numStepsY; i <= numStepsY; i++) {
    const y = i * scaleY/factor + height / 2;

    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.strokeStyle = '#ccc'; // Couleur des lignes du quadrillage
    ctx.stroke();

    // Ajoute les repères numériques (en utilisant Math.round pour arrondir les valeurs)
    ctx.fillStyle = 'black';
    const rep = factor>1?-((y - height / 2) / scaleY).toFixed(2):-Math.round((y - height / 2) / scaleY);
    ctx.fillText(rep, width / 2 + 8, y);
  }

  // Dessine l'axe des x
  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.strokeStyle = 'black';
  ctx.stroke();

  // Dessine l'axe des y
  ctx.beginPath();
  ctx.moveTo(width / 2, 0);
  ctx.lineTo(width / 2, height);
  ctx.stroke();
};
