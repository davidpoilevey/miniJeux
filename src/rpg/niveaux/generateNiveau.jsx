import { KNIGHT_SIZE } from "../RPGContext";

// Helpers
const sol = (x, y, width = 10000, height = 100) => ({
  entity: 'sol',
  isNotAnimation: true,
  position: { x, y, width, height }
});

const monstre = (entity, x, y, direction = 'left') => ({
  entity: entity,
  objStatus: 'walk',
  monster: true,
  scale: 1,
  direction,
  startAnimated: true, 
  position: { x, y:y-130 }
});
const zombie= (x, y, direction = 'left') => {return monstre('zombie1',x,y,direction)}
const zombie2= (x, y, direction = 'left') => {return monstre('zombie2',x,y,direction)}
const squelette= (x, y, direction = 'left') => {return monstre('squelette',x,y,direction)}
const oeil= (x, y, direction = 'left') => {return monstre('oeil',x,y,direction)}


const coffre = (x, y) => ({
  entity: 'coffre',
  scale:0.3,
  position: { x, y:y-150 }
});

const porte = (x, y, scale = 3) => ({
  entity: 'porte',
  objStatus: 'idle',
  scale,
  position: { x, y:y-64 }
});
const finNiveau = (x, y, scale = 0.4) => ({
  entity: 'finNiveau',
  objStatus: 'idle',
  scale,
  position: { x, y:y-120 }
});

const mur = (x, y, width, height) => ({
  entity: 'mur',
  isNotAnimation: true,
  scale: 1,
  position: {
    x,
    y: y - height,
    width,
    height
  }
});

const murGrimpable = (x, y, width, height) => ({
  entity: 'murGrimpable',
  isNotAnimation: true,
  scale: 1,
  position: {
    x,
    y: y - height,
    width,
    height
  }
});
const murPoussable = (x, y, width, height) => ({
  entity: 'murPoussable',
  isNotAnimation: true,
  scale: 1,
  position: {
    x,
    y: y - height,
    width,
    height
  }
});
const fire = (x,y)=>({ 
    entity:'fire', startAnimated:true
    ,  scale:0.2 
     , position:{x,y:y-116}})


// Générateur de niveau
export const generateNiveau = (niv = 1, baseLevel = 500) => {
  let matos = [];
  const niveauDuSol = baseLevel + KNIGHT_SIZE.height;

  // === SOL PRINCIPAL ===
  matos.push(sol(0, niveauDuSol));

  switch(niv){
    case 1:
        matos=matos.concat(niveau1(niveauDuSol)); break
    case 2:
        matos=matos.concat(niveau2(niveauDuSol)); break
    case 3:
        matos=matos.concat(niveau3(niveauDuSol)); break
    case 4:
        matos=matos.concat(niveau4(niveauDuSol)); break
    case 5:
        matos=matos.concat(niveau5(niveauDuSol)); break

    default:
  }
  return matos;
};


const niveau1=(niveauDuSol)=>{ // tuto
    const arr=[];
     arr.push(porte(250, niveauDuSol));
     arr.push(mur(230, niveauDuSol-80, 50, 400));
     
    arr.push(fire(450, niveauDuSol));
     arr.push(finNiveau(750, niveauDuSol));
    //   arr.push(coffre(450, niveauDuSol));
   //  arr.push(squelette(650, niveauDuSol));
    return arr;
}
const niveau2=(niveauDuSol)=>{ // grimper / se battre / potion
    const arr=[];
    arr.push(murGrimpable(200,niveauDuSol, 300, 180))
    arr.push(coffre(250, niveauDuSol-190, {potions:5}));
     arr.push(oeil(850, niveauDuSol));
     arr.push(fire(850, niveauDuSol));
     arr.push(squelette(650, niveauDuSol));
     arr.push(finNiveau(1070, niveauDuSol));

    return arr;
}
const niveau3=(niveauDuSol)=>{ 
    const arr=[];

     arr.push(murPoussable(200, niveauDuSol, 110, 60));
     arr.push(mur(550, niveauDuSol, 100, 120));
     arr.push(mur(650, niveauDuSol, 100, 150));
     arr.push(mur(750, niveauDuSol, 50, 350));
     arr.push(mur(150, niveauDuSol-180, 200, 50));
     arr.push(murGrimpable(100, niveauDuSol-230, 100, 220));
     arr.push(mur(290, niveauDuSol-420, 200, 50));
     arr.push(mur(700, niveauDuSol-420, 260, 50));
     arr.push(fire(690, niveauDuSol-470));
     arr.push(mur(900, niveauDuSol-220, 320, 30));

     arr.push(mur(1130, niveauDuSol-420, 100, 50));
     arr.push(coffre(1100, niveauDuSol-475));
     arr.push(mur(1230, niveauDuSol, 20, 560));
     arr.push(porte(920, niveauDuSol-245));
     arr.push(mur(900, niveauDuSol-330, 50, 90));
    arr.push(zombie2(1120, niveauDuSol-245));
     arr.push(zombie(1120, niveauDuSol));
     arr.push(finNiveau(1070, niveauDuSol));
    return arr;
}



const niveau5 = (niveauDuSol) => {
  const arr = [];
  arr.push(murGrimpable(128, niveauDuSol, 64, 480));
  arr.push(mur(256, niveauDuSol - 480, 192, 64));
  arr.push(mur(186, niveauDuSol - 480, 80, 24));
  arr.push(fire(360, niveauDuSol - 500));
  arr.push(fire(456, niveauDuSol - 500));
  arr.push(mur(426, niveauDuSol - 480, 280, 24));
  arr.push(mur(704, niveauDuSol - 480, 640, 64));
  arr.push(murPoussable(832, niveauDuSol - 544, 96, 64));
  arr.push(mur(832, niveauDuSol - 608, 96, 128));
  arr.push(mur(1472, niveauDuSol - 352, 32, 384));
  arr.push(mur(1472, niveauDuSol, 32, 352));
  arr.push(mur(992, niveauDuSol - 288, 480, 32));
  arr.push(squelette(1100, niveauDuSol-320));
  arr.push(porte(1044, niveauDuSol - 320));
  arr.push(mur(1024, niveauDuSol - 384, 64, 96));
  arr.push(murGrimpable(1184, niveauDuSol, 128, 224));
  arr.push(mur(768, niveauDuSol - 256, 256, 32));
  arr.push(mur(192, niveauDuSol - 256, 192, 32));
  arr.push(mur(544, niveauDuSol, 64, 288));
  arr.push(mur(440, niveauDuSol - 150, 100, 24));
  arr.push(coffre(149, niveauDuSol));
  arr.push(coffre(245, niveauDuSol));
  arr.push(coffre(373, niveauDuSol));
  arr.push(squelette(637, niveauDuSol));
  arr.push(zombie2(1053, niveauDuSol));
  arr.push(finNiveau(1286, niveauDuSol));
  return arr;
};

const niveau4 = (niveauDuSol) => {
  const arr = [];
  arr.push(mur(160, niveauDuSol, 32, 32));
  arr.push(mur(160, niveauDuSol - 32, 32, 32));
  arr.push(mur(128, niveauDuSol, 32, 32));
  arr.push(mur(192, niveauDuSol - 32, 32, 32));
  arr.push(mur(416, niveauDuSol - 32, 32, 32));
  arr.push(mur(448, niveauDuSol - 32, 32, 32));
  arr.push(mur(448, niveauDuSol, 32, 32));
  arr.push(mur(480, niveauDuSol, 32, 32));
  arr.push(mur(160, niveauDuSol - 128, 32, 32));
  arr.push(mur(128, niveauDuSol - 160, 32, 32));
  arr.push(mur(160, niveauDuSol - 160, 32, 32));
  arr.push(mur(128, niveauDuSol - 192, 32, 32));
  arr.push(mur(0, niveauDuSol - 192, 32, 32));
  arr.push(mur(32, niveauDuSol - 192, 32, 32));
  arr.push(mur(448, niveauDuSol - 128, 32, 32));
  arr.push(mur(448, niveauDuSol - 160, 32, 32));
  arr.push(mur(480, niveauDuSol - 160, 32, 32));
  arr.push(mur(480, niveauDuSol - 192, 160, 32));
  arr.push(mur(800, niveauDuSol - 160, 32, 32));
  arr.push(mur(832, niveauDuSol - 160, 32, 32));
  arr.push(mur(864, niveauDuSol - 160, 32, 32));
  arr.push(mur(896, niveauDuSol - 160, 32, 32));
  arr.push(mur(896, niveauDuSol - 128, 32, 32));
  arr.push(mur(928, niveauDuSol - 128, 32, 32));
  arr.push(mur(928, niveauDuSol - 128, 32, 32));
  arr.push(mur(928, niveauDuSol - 96, 32, 32));
  arr.push(mur(960, niveauDuSol - 96, 32, 32));
  arr.push(mur(992, niveauDuSol - 96, 32, 32));
  arr.push(mur(1024, niveauDuSol - 96, 32, 32));
  arr.push(mur(1056, niveauDuSol - 96, 32, 32));
  arr.push(mur(1056, niveauDuSol - 128, 32, 32));
  arr.push(mur(1056, niveauDuSol - 160, 32, 32));
  arr.push(mur(1056, niveauDuSol - 192, 32, 32));
  arr.push(mur(1056, niveauDuSol - 224, 32, 32));
  arr.push(mur(1056, niveauDuSol - 256, 32, 32));
  arr.push(mur(1056, niveauDuSol - 288, 32, 32));
  arr.push(mur(1024, niveauDuSol - 288, 32, 32));
  arr.push(mur(992, niveauDuSol - 288, 32, 32));
  arr.push(mur(960, niveauDuSol - 288, 32, 32));
  arr.push(mur(928, niveauDuSol - 288, 32, 32));
  arr.push(mur(896, niveauDuSol - 288, 32, 32));
  arr.push(mur(768, niveauDuSol - 288, 128, 32));
  arr.push(mur(736, niveauDuSol - 288, 32, 32));
  arr.push(porte(884, niveauDuSol - 192));
  arr.push(coffre(917, niveauDuSol - 128));
  arr.push(coffre(-75, niveauDuSol - 224));
  arr.push(zombie(509, niveauDuSol - 224));
  arr.push(murGrimpable(384, niveauDuSol - 224, 32, 32));
  arr.push(murGrimpable(384, niveauDuSol - 256, 32, 32));
  arr.push(murGrimpable(384, niveauDuSol - 288, 32, 32));
  arr.push(mur(352, niveauDuSol - 288, 32, 32));
  arr.push(mur(320, niveauDuSol - 288, 32, 32));
  arr.push(mur(288, niveauDuSol - 288, 32, 32));
  arr.push(mur(64, niveauDuSol - 192, 32, 32));
  arr.push(mur(96, niveauDuSol - 192, 32, 32));
  arr.push(murGrimpable(256, niveauDuSol - 224, 32, 32));
  arr.push(murGrimpable(256, niveauDuSol - 256, 32, 32));
  arr.push(murGrimpable(256, niveauDuSol - 288, 32, 32));
  arr.push(squelette(509, niveauDuSol));
  arr.push(squelette(637, niveauDuSol));
  arr.push(murPoussable(800, niveauDuSol - 352, 32, 32));
  arr.push(murPoussable(800, niveauDuSol - 320, 32, 32));
  arr.push(murPoussable(832, niveauDuSol - 320, 32, 32));
  arr.push(murPoussable(832, niveauDuSol - 352, 32, 32));
  arr.push(mur(1024, niveauDuSol - 352, 64, 128));
  arr.push(mur(1024, niveauDuSol - 320, 32, 32));
  arr.push(mur(1056, niveauDuSol - 320, 32, 32));
  arr.push(mur(1024, niveauDuSol - 480, 32, 32));
  arr.push(mur(1056, niveauDuSol - 480, 32, 32));
  arr.push(mur(1088, niveauDuSol - 320, 32, 32));
  arr.push(mur(1120, niveauDuSol - 320, 32, 32));
  arr.push(mur(1152, niveauDuSol - 320, 32, 32));
  arr.push(mur(1184, niveauDuSol - 320, 32, 32));
  arr.push(mur(1216, niveauDuSol - 320, 32, 32));
  arr.push(finNiveau(1158, niveauDuSol));
  arr.push(mur(416, niveauDuSol - 160, 32, 32));
  arr.push(fire(104, niveauDuSol));
  arr.push(fire(168, niveauDuSol));
  arr.push(fire(232, niveauDuSol));
  arr.push(murGrimpable(768, niveauDuSol, 32, 192));
  arr.push(mur(1152, niveauDuSol - 448, 160, 32));
  arr.push(mur(1248, niveauDuSol - 480, 64, 192));
  arr.push(mur(800, niveauDuSol - 640, 448, 32));
  arr.push(murGrimpable(640, niveauDuSol - 192, 32, 352));
  return arr;
};

const niveauX = (niveauDuSol) => {
  const arr = [];
  return arr;
};