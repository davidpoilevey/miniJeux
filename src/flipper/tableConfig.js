// ─── Dimensions du terrain ────────────────────────────────────────────────────



export const FLIPPER_W = 1000;   // largeur canvas
export const FLIPPER_H = 760;   // hauteur canvas (paysage)

// Position de spawn de la bille dans le couloir
export const BALL = {
  x: FLIPPER_W - 30,
  y: FLIPPER_H - 80,         // juste au-dessus du plunger au repos
  radius: 12,
  options: {
    restitution: 0.6,
    friction: 0.01,
    frictionAir: 0.008,
    label: 'ball',
    render: { fillStyle: '#ffffff' },
  }
};
// ─── Couloir de lancement (à droite du terrain) ──────────────────────────────
export const PLUNGER_LANE = {
  x:       FLIPPER_W - 30,   // position horizontale du couloir
  wallWidth: 8,
  wallHeight: 300,
  // mur gauche du couloir
  leftWall:  { x: FLIPPER_W - 55, y: FLIPPER_H - 150 },
  // mur droit du couloir (bord droit du canvas)
  rightWall: { x: FLIPPER_W - 5,  y: FLIPPER_H - 150 },
};
// ─── Flippers ─────────────────────────────────────────────────────────────────
// En paysage, les flippers sont au bas-centre, symétriques
export const FLIPPER_LEFT = {
  x: 360,       // position du centre du flipper
  y: FLIPPER_H-100,
  width: 100,
  height: 14,
  pivot: { x: 310, y: FLIPPER_H-100 },   // point de rotation — extrémité gauche
  angleDown: 0.4,               // angle repos (en radians)
  angleUp: -0.4,                // angle activé
  options: {
    isStatic: true,             // on gère nous-mêmes la rotation
    label: 'flipperLeft',
    render: { fillStyle: '#e94560' },
  }
};

export const FLIPPER_CoteLEFT = {
  x: 100,       // position du centre du flipper
  y: 350,
  width: 80,
  height: 14,
  pivot: { x: 100, y: 360 },   // point de rotation — extrémité gauche
  angleDown: 0.7,               // angle repos (en radians)
  angleUp: -0.2,                // angle activé
  options: {
    isStatic: true,             // on gère nous-mêmes la rotation
    label: 'flipperCoteLeft',
    render: { fillStyle: '#e94560' },
  }
};

export const RAMPES = [
  { x1: PLUNGER_LANE.leftWall.x, y1: 0
    ,  x2: PLUNGER_LANE.rightWall.x, y2: PLUNGER_LANE.wallHeight },   // rampe bas-gauche
  { x1: 700, y1: 400,  x2: 800, y2: 500 },   // rampe bas-droite
   { x1: 0, y1: FLIPPER_H-200,  x2: 320, y2: FLIPPER_H-100 },
   { x1: 580, y1: FLIPPER_H-100,  x2: PLUNGER_LANE.leftWall.x, y2: FLIPPER_H-200 },
   { x1: 0, y1: 200,  x2: 100, y2: 350 },
   { x1: 300, y1: 100,  x2: 500, y2: 200 },
];
export const FLIPPER_RIGHT = {
  x: 540,
  y: FLIPPER_H-100,
  width: 100,
  height: 14,
  pivot: { x: 590, y: FLIPPER_H-100 },   // point de rotation — extrémité droite
  angleDown: -0.4,
  angleUp: 0.4,
  options: {
    isStatic: true,
    label: 'flipperRight',
    render: { fillStyle: '#e94560' },
  }
};


export const FLIPPER_CoteRIGHT = {
  x: 660,
  y: 400,
  width: 80,
  height: 14,
  pivot: { x: 700, y: 400 },   // point de rotation — extrémité droite
  angleDown: -0.9,
  angleUp: 0,
  options: {
    isStatic: true,
    label: 'flipperRight',
    render: { fillStyle: '#e94560' },
  }
};


// Plunger — le rectangle qui monte et donne l'impulsion
export const PLUNGER = {
  x:      FLIPPER_W - 30,    // centre du couloir
  y:      FLIPPER_H - 40,    // en bas du couloir
  width:  42,
  height: 14,
  options: {
    isStatic: true,
    label: 'plunger',
    render: { fillStyle: '#f5a623' },
  }
};

export const TROUS = [
    {x:FLIPPER_W - 75, y:FLIPPER_H - 280,  color: '#b17007', radius:20
        , delay: 1000,        // ms avant expulsion
    ejectForce: 24,  label:"trouRampe", message: 'Dans le mille !', points: 500 }
]


export const TARGETS = [
    {x1:10, y1:10, x2:80, y2:0,angle:0, color: '#f46c2c', hitColor: '#ffffff',
     points: 300, step: 'step1', message: '🎯 Cible touchée !'}
]

export const BUMPERS = [
  { x: 400, y: 380, radius: 28, color: '#f5a623', label:"bumper1", force: 1.8 },
  { x: 720, y: 320, radius: 24, color: '#e94560',  label:"bumper2",force: 1.5 },
  { x: 250, y: 220, radius: 24, color: '#81c331',  label:"bumper2",force: 1.5 },
  { x: 550, y: 10, radius: 24, color: '#3ca608',  label:"bumper2",force: 1.5 },
  { x: 700, y: 160, radius: 32, color: '#00d4ff',  label:"bumper3",force: 2.0 },
];

// ─── Murs ─────────────────────────────────────────────────────────────────────
export const WALLS = [
  // Sol
  { x: FLIPPER_W / 2, y: FLIPPER_H + 10, width: FLIPPER_W,  height: 20, label: 'floor' },
  // Plafond
  { x: FLIPPER_W / 2, y: -10,    width: FLIPPER_W,  height: 20, label: 'ceiling' },
  // Mur gauche
  { x: -10,   y: FLIPPER_H / 2,  width: 20, height: FLIPPER_H,  label: 'wallLeft' },
  // Mur droit (arrête-toi avant le couloir)
  { x: FLIPPER_W + 10, y: FLIPPER_H / 2, width: 20, height: FLIPPER_H,  label: 'wallRight' },
  // Couloir gauche (sépare le terrain du couloir)
  { x: PLUNGER_LANE.leftWall.x, y: PLUNGER_LANE.leftWall.y,
    width: PLUNGER_LANE.wallWidth, height: PLUNGER_LANE.wallHeight, label: 'laneLeft' },
  // Couloir droit (bord intérieur du mur droit)
  { x: PLUNGER_LANE.rightWall.x, y: PLUNGER_LANE.rightWall.y,
    width: PLUNGER_LANE.wallWidth, height: PLUNGER_LANE.wallHeight, label: 'laneRight' },

];