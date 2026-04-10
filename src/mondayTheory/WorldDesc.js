import { duration } from "@mui/material";
import { addEntity, addSystem, addWallRect } from "./ECS";
import {  goalSystem, interactionSystem } from "./systems/AISystem";
import { mentalStateSystem, plantGrowthSystem } from "./systems/miniSystems";
import { movementSystem, pathfindingSystem, vehicleSystem } from "./systems/MovementSystem";
import { decisionSystem, needsSystem } from "./systems/NeedsSystem";
import { scheduleSystem, TimeSystem } from "./systems/TimeSystem";

export function addAllSystems(world) {
  addSystem(world, TimeSystem);
  addSystem(world, plantGrowthSystem);
  addSystem(world, needsSystem);
  addSystem(world, mentalStateSystem);
  addSystem(world, interactionSystem);
  addSystem(world, scheduleSystem);
  addSystem(world, decisionSystem);
  addSystem(world, pathfindingSystem);
  addSystem(world, movementSystem);
  addSystem(world, vehicleSystem);
  addSystem(world, goalSystem);
}
const wallSize=1;
export function addAllWalls(world) { //x, y, width, height
   addWallRect(world, 3, 0, wallSize, 4);
   addWallRect(world, 10, 0, wallSize, 4);//vertical
   addWallRect(world, 20, 0, wallSize, 4);
   addWallRect(world, 8, 4, 4,  wallSize);  //horizontal
   addWallRect(world, 17, 4, 4,  wallSize);
   addWallRect(world, 0, 8, 1,  wallSize);
   addWallRect(world, 4, 8, 5,  wallSize);
   addWallRect(world, 20, 8, wallSize, 5);
   addWallRect(world, 14, 8, wallSize, 5);
   addWallRect(world, 0, 13, 18,  wallSize);
   addWallRect(world, 20, 13, 3,  wallSize);

   addWallRect(world, 5, 18, 20,  wallSize);
   addWallRect(world, 5, 21, 3,  wallSize);
   addWallRect(world, 5, 25, 3,  wallSize);
   addWallRect(world, 20, 28, 5,  wallSize);
   addWallRect(world, 5, 35, 20,  wallSize);
   addWallRect(world, 0, 39, 5,  wallSize);
   addWallRect(world, 20, 19, wallSize, 3);
   addWallRect(world, 7, 22, wallSize, 3);
   addWallRect(world, 20, 24, wallSize, 5);
   addWallRect(world, 20, 30, wallSize, 5);
   addWallRect(world, 12, 30, wallSize, 5);
   addWallRect(world, 5, 25, wallSize, 10);
   addWallRect(world, 5, 39, wallSize, 5);
}

export function addAllEntities(world) {
  addEntity(world, {
    type: "plant",
    spriteId:"plante",
    position: { zone:'home', x: 200, y: 300 },
    growth: { size: 10, max: 40 },
    renderable: true,
  });

  addEntity(world, {
    type: "fridge",
    spriteId:"fridge",
    position: { zone:'home', x: 750, y: 0 , width:50, height:80},

  provides: {
    hunger: -800, // réduit la faim
    hygiene:100
  },
  duration:1,
    renderable: true,
  });
  addEntity(world, {
  type: "cushion",
  spriteId:"cushion",
  position: { zone:'home', x: 360, y: 110 , width:40, height:40},

  provides: {
    energy: -200,
  },
  duration:3,

  renderable: true,
});

addEntity(world, {
  type: "waterBowl",
  position: { zone:'home', x: 750, y: 120 , width:40, height:50},
  spriteId:"lavabo",

  provides: {
    thirst: -200, // réduit la soif
    hygiene:-80
  },
  duration:1,

  renderable: true,
});
addEntity(world, {
  type: "lit",
  position: { zone:'home', x: 180, y: 0 , width:120, height:100},
  spriteId:"lit",

  provides: {
    energy: -800, // augmente l'énergie
    hunger: -20, // augmente la faim (parce que dormir ça creuse)
  },

  renderable: true,
});
addEntity(world, {
  type: "television",
  position: { zone:'home', x: 80, y: 400 , width:60, height:40},
  spriteId:"tele",

  provides: {
    fun: -400, // augmente le fun
  },
  duration:3,

  renderable: true,
});
addEntity(world, {
  type: "wc",
  position: { zone:'home', x: 5, y: 5 , width:80, height:80},
  spriteId:"wc",

  provides: {
    hygiene: -100, // augmente l'hygiène
  },
  duration:1,

  renderable: true,
});
addEntity(world, {
  type: "canape",
  position: { zone:'home', x: 355, y: 405 , width:100, height:60},
  spriteId:"canape",

  provides: {
    energy: -150,
  },
  duration:3,

  renderable: true,
});
addEntity(world, {
  type: "cuisine",
  position: { zone:'home', x: 455, y: 5 , width:180, height:80},
  spriteId:"cuisine",

  provides: {
    hunger: -250
  },
  duration:2,

  renderable: true,
});
addEntity(world, {
  type: "jardin",
  position: { zone:'home', x: 905, y: 85 , width:100, height:180},
  spriteId:"jardin",

  provides: {
    funCat: -250
  },
  duration:3,

  renderable: true,
});
addEntity(world, {
  type: "voiture",
  position: { zone:'home', x: 615, y: 420 , width:120, height:80},
  spriteId:"voiture",

  provides: {
    transport: 2
  },
  duration:1,
speed:5000,
  renderable: true,
});

addEntity(world, {
  type: "entree",
  position: { zone:'home', x: 620, y: 430 , width:40, height:40},
  spriteId:"none",

});
addEntity(world, {
  type: "dalim",
  position: { zone:'work', x: 220, y: 770 , width:40, height:40},

});

addEntity(world, {
  type: "bureau",
  position: { zone:'work', x: 900, y: 780 , width:100, height:100},
  spriteId:"bureau",

  provides: {
    work: -100
  },
  duration:1,

  renderable: true,
});
addEntity(world, {
  type: "bureau",
  position: { zone:'work', x: 600, y: 1300 , width:100, height:100},
  spriteId:"bureau",

  provides: {
    work: -100
  },
  duration:1,

  renderable: true,
});
addEntity(world, {
  type: "bureau",
  position: { zone:'work', x: 300, y: 1300 , width:100, height:100},
  spriteId:"bureau",

  provides: {
    work: -100
  },
  duration:1,

  renderable: true,
});
addEntity(world, {
  type: "wc",
  position: { zone:'work', x: 905, y: 1300 , width:80, height:80},
  spriteId:"wc",

  provides: {
    hygiene: -100, // augmente l'hygiène
  },
  duration:1,

  renderable: true,
});
addEntity(world, {
  type: "cuisine",
  position: { zone:'work', x: 450, y: 750 , width:180, height:80},
  spriteId:"cuisine",

  provides: {
    hunger: -250
  },
  duration:2,

  renderable: true,
});
addEntity(world, {
  type: "machineaCafe",
  position: { zone:'work', x: 750, y: 960 , width:60, height:80},
  spriteId:"cafe",

  provides: {
    fun: -50, social: -20
  },
  duration:2,

  renderable: true,
});

addEntity(world, {
  type: "hamac",
  position: { zone:'work', x: 230, y: 1050 , width:80, height:80},
  spriteId:"hamac",

  provides: {
    energy: -40
  },
  duration:2,

  renderable: true,
});
addEntity(world, {
  type: "docteur",
  position: { zone:'town', x: 30, y: 1600 , width:80, height:80},
  spriteId:"docteur",

  provides: {
    maladie: -100
  },
  duration:2,

  renderable: true,
});



// etres vivants

  addEntity(world, {
  type: "david",
  spriteId:"david",
  position: { zone:'home', x: 40, y: 40, width:60, height:60 },

  needs: {
   
   work: { value: 10, decay: 20 },
  hunger: { value: 20, decay: 2 },
  energy: { value: 20, decay: 1 },
  fun: { value: 50, decay: 1 },
  social: { value: 10, decay: 1 },
  hygiene: { value: 30, decay: 2 }
  },
  mentalState:{
    luxure: 20, stress:3, maladie:0, intoxication:25
  },
schedule: [
  {
    type: "work",
    start: 1,
    end: 12
  }
]
,
  provides: {
    social: -20
  },
  duration:1,


  speed: 1390, // pixels par heure simulée
  renderable: true,
});

  addEntity(world, {
  type: "sebastien",
  spriteId:"seb",
  position: { zone:'work', x: 300, y: 1200, width:60, height:60 },
    sex:"M",
  mentalState:{
    luxure: 20, stress:3, intoxication:25
  },
  needs: {
   
   work: { value: 40, decay: 30 },
  hunger: { value: 20, decay: 0.5 },
  fun: { value: 50, decay: 2 },
  social: { value: 10, decay: 0.5 },
  hygiene: { value: 30, decay: 0.5 }
  },

  provides: {
    social: -50
  },
  duration:1,

  speed: 1460, // pixels par heure simulée
  renderable: true,
});
 addEntity(world, {
  type: "isabelle",
  spriteId:"isa",
  position: { zone:'work', x: 600, y: 1200, width:60, height:60 },

    sex:"F",
  mentalState:{
    luxure: 50, stress:3,  intoxication:25
  },
  needs: {
   work: { value: 96, decay: 20 },
  hunger: { value: 20, decay: 0.5 },
  fun: { value: 50, decay: 1 },
  social: { value: 10, decay: 2 },
  hygiene: { value: 30, decay: 0.5 }
  },

  provides: {
    social: -120
  },
  duration:3,

  speed: 1460, // pixels par heure simulée
  renderable: true,
});
 addEntity(world, {
  type: "boss",
  spriteId:"carol",
  position: { zone:'work', x: 900, y: 900, width:60, height:60 },

    sex:"M",
  mentalState:{
    luxure: 20, stress:3, intoxication:25
  },
  needs: {
   work: { value: 70, decay: 20 },   
  hunger: { value: 20, decay: 0.03 },
  fun: { value: 50, decay: 0.6 },
  social: { value: 10, decay: 1 },
  hygiene: { value: 3, decay: 0.05 }
  },

  provides: {
    social: -100
  },
  duration:2,

  speed: 1460, // pixels par heure simulée
  renderable: true,
});


  addEntity(world, {
  type: "rodolphe",
  spriteId:"rod",
  position: { zone:'home', x: 400, y: 400, width:60, height:60 },

  needs: {
   
  hunger: { value: 20, decay: 2 },
  energy: { value: 10, decay: 3 },
  fun: { value: 50, decay: 1 },
  social: { value: 10, decay: 0.5 },
  hygiene: { value: 30, decay: 1.2 }
  },

  provides: {
    social: -20
  },
  duration:1,

  speed: 1460, // pixels par heure simulée
  renderable: true,
});
  addEntity(world, {
  type: "severine",
  spriteId:"sev",
  position: { zone:'home', x: 600, y: 40, width:60, height:60 },
 sex:"F",
  mentalState:{
    luxure: 20, stress:3, intoxication:25
  },
  needs: {
   
  hunger: { value: 20, decay: 2 },
  energy: { value: 10, decay: 1 },
  fun: { value: 50, decay: 1 },
  social: { value: 10, decay: 1 },
  hygiene: { value: 30, decay: 2 }
  },

  provides: {
    social: -20
  },
  duration:1,


  speed: 1390, // pixels par heure simulée
  renderable: true,
});

  addEntity(world, {
  type: "cat",
  spriteId:"chat",
  position: { zone:'home', x: 200, y: 400, width:60, height:60 },

  needs: {
  energy: { value: 10, decay: 3 },
  thirst: { value: 50, decay: 1 },
  funCat: { value: 10, decay: 0.5 }
  },
   sex:"M",
  mentalState:{
    stress:3, intoxication:25
  },

  speed: 1350, // pixels par heure simulée
  renderable: true,
});

}