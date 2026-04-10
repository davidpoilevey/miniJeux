import { Bodies } from 'matter-js';
import { BALL, BUMPERS, FLIPPER_CoteLEFT, FLIPPER_CoteRIGHT, FLIPPER_LEFT, FLIPPER_RIGHT, PLUNGER, RAMPES, TARGETS, TROUS, WALLS } from './tableConfig';
import { createBumper, createCurvedRamp, createHoleVisual, createTarget, wallFromPoints } from './utils';

// Pour chaque mur :

export const createBodies = (engine, WIDTH, HEIGHT)=>{

    const bodies={balls:[], walls:[], flippersLeft:[], flippersRight:[]
      ,targets:[]  , trous:[], bumpers:[],plunger:null};
   

    for(let w of WALLS)
        bodies.walls.push(Bodies.rectangle(w.x, w.y, w.width, w.height
        , { isStatic: true, label: w.label , render: { fillStyle: '#7945e9' } }))

    for(let w of RAMPES)
        bodies.walls.push(wallFromPoints(w.x1,w.y1,w.x2,w.y2));

// Pour la bille :
bodies.balls.push(Bodies.circle(BALL.x, BALL.y, BALL.radius, BALL.options));

// Pour les flippers :
bodies.flippersLeft.push(Bodies.rectangle(FLIPPER_LEFT.x, FLIPPER_LEFT.y, FLIPPER_LEFT.width, FLIPPER_LEFT.height, FLIPPER_LEFT.options));
bodies.flippersLeft.push(Bodies.rectangle(FLIPPER_CoteLEFT.x, FLIPPER_CoteLEFT.y, FLIPPER_CoteLEFT.width, FLIPPER_CoteLEFT.height, FLIPPER_CoteLEFT.options));

bodies.flippersRight.push(Bodies.rectangle(FLIPPER_RIGHT.x, FLIPPER_RIGHT.y, FLIPPER_RIGHT.width, FLIPPER_RIGHT.height, FLIPPER_RIGHT.options));
bodies.flippersRight.push(Bodies.rectangle(FLIPPER_CoteRIGHT.x, FLIPPER_CoteRIGHT.y, FLIPPER_CoteRIGHT.width, FLIPPER_CoteRIGHT.height, FLIPPER_CoteRIGHT.options));

//Bumpers
BUMPERS.forEach(b => {
  bodies.bumpers.push(createBumper(b.x, b.y, b.radius, b.color, b.force));
});

//TARGETS
TARGETS.forEach(b => {
  bodies.targets.push(createTarget(b));
});
//trous
TROUS.forEach(b => {
  bodies.trous.push(createHoleVisual(b));
});

//plunger
bodies.plunger = Bodies.rectangle(
  PLUNGER.x, PLUNGER.y, PLUNGER.width, PLUNGER.height, PLUNGER.options
);

//rampes
const panierBasket = createCurvedRamp();
bodies.walls.push(...panierBasket);

return bodies;
}