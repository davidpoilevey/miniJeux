import { KNIGHT_SIZE } from "../RPGContext";
import { BaseEntity, ENTITY_TYPES } from "./Entities";

const ENEMY_STAT={
  squelette:{health:20, speed:1, attack:12, reward:{xp:2,gold:5}},
  oeil:{health:30, speed:3,  attack:10,reward:{xp:1,gold:2}},
  zombie1:{health:40, speed:1,  attack:5,reward:{xp:8,gold:1}},
  zombie2:{health:10, speed:2,  attack:3,reward:{xp:5,gold:15}}
}
class Enemy extends BaseEntity {
  constructor(conf, id) {
    super(conf.position.x, conf.position.y, id, ENTITY_TYPES.ENEMY);
    const stats = ENEMY_STAT[conf.entity];
    this.health = stats?.health||100;
    this.speed = stats?.speed||2;
    this.attack = stats?.attack||5;
    Object.assign(this,conf);
    this.direction='left';
    this.width=64;this.height=68;
  this.walkInterval = null; 

    this.collisionBox= { width:64, height:80, offsetX: 35, offsetY: 50 }
  }

  isTrigger() {
    return true; // Les ennemis se declenchent et attaquent
  }
 onHit(state, dispatch) {
  this.health -= state.knightRPStat.attack;
const nextX = this.x + (this.direction === 'right' ? 5 : -5) ;
  this.position = { x: nextX, y: this.y };
  this.x=nextX;
  if (this.health <= 0) {
    this.die(dispatch);
  } else {
    this.objStatus = 'takeHit';
    dispatch({ type: 'UPDATE_MATOS', payload: this });
  }
}
die(dispatch) {
  this.objStatus = 'die';
    dispatch({ type: 'UPDATE_MATOS', payload: this });
  //dispatch({ type: 'REMOVE_MATOS', payload: { id: this.id } });

  dispatch({
    type: 'GAIN_REWARD',
    payload: ENEMY_STAT[this.entity].reward
  });
}


  startWalkingLoop(dispatch, collisionSystem) {
  if (this.walkInterval) return; // éviter de lancer plusieurs fois

  this.walkInterval = setInterval(() => {
   const nextX = this.x + (this.direction === 'right' ? 1 : -1) * this.speed;
    const targetPos = { x: nextX, y: this.y };

    // Est-ce que le squelette a une size ? Sinon on lui donne
    const size = this.size || { width: 50, height: 100 }; // ajustable par monstre

    const result = collisionSystem.canMoveTo(
      { x: this.x, y: this.y },
      targetPos,
      size, this.id
    );

    if (result.canMove) {
      this.x = targetPos.x;
      this.position = { x: this.x, y: this.y };
    } else {
      // Optionnel : demi-tour quand bloqué ?
      if(this.allerRetour)
        this.direction = this.direction === 'right' ? 'left' : 'right';
      else
        this.objStatus='idle';
    }
    dispatch({ type: 'UPDATE_MATOS', walkingRadar: true, payload: this });

  }, 1000 / 30); // ~30fps
}
stopWalkingLoop() {
  if (this.walkInterval) {
    clearInterval(this.walkInterval);
    this.walkInterval = null;
  }
}
onDestroy() {
  this.stopWalkingLoop();
  // Autres cleanups si besoin
}



  onContact(state, dispatch, collisionSystem){
    // se retourne vers le joueur et attaque
    this.direction = state.knightPos.x<this.x?'left':'right';
    if(this.objStatus=='attaque'){
      // verifie qu'il est pas trop loin si oui marche
      if(Math.abs(state.knightPos.x-this.x)>KNIGHT_SIZE.width)
       {
        this.objStatus='walk';
        this.startWalkingLoop(dispatch, collisionSystem);
       } 
    }
    else  if(Math.abs(state.knightPos.x-this.x)<KNIGHT_SIZE.width){
      this.objStatus='attaque';
      this.stopWalkingLoop();
      this.position={x:this.x, y:this.y}
      dispatch({type:"UPDATE_MATOS", payload:this})
    }
  }
}

export function createEnnemi(conf,id = 'door1') {
  return new Enemy(conf, id);
}
