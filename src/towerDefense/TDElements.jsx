
import { Box } from "@mui/material";
import Konva from "konva";
import React, { useState } from "react";
import { tourSize } from "./TDCanvas";
import tour1Img from './images/tour1.png';
import tour2Img from './images/tour2.png';
import tour3Img from './images/tour3.png';
import tour4Img from './images/tour4.png';
import nmi1Img from './images/nmi1.png';
import nmi2Img from './images/nmi2.png';
import nmiFortImg from './images/nmiFort.png';
import nmiRapideImg from './images/nmiRapide.png';
import tankImg from './images/tank.png';

export const Tower = ({ }) => {

  return <Box />
}

export const useEnnemis=()=>{

  const ENNEMI_TYPES = [
    {
      type: 'base', speed: 3,  healthDeBase:5, imageSrc:nmi1Img, niveau:1
    },{
      type: 'soldat', speed: 4,  healthDeBase:10, imageSrc:nmi2Img, niveau:2
    },{
      type: 'fort', speed: 3,  healthDeBase:70, imageSrc:nmiFortImg, niveau:3
    },{
      type: 'rapide', speed: 5,  healthDeBase:60, imageSrc:nmiRapideImg, niveau:4
    },{
      type: 'tank', speed: 1,  healthDeBase:200, imageSrc:tankImg, niveau:5
    }
  ]
  const ennemiByType = type=>{
   return  ENNEMI_TYPES.find(t=>t.type===type);
  }
  const createEnnemi=(size, chemin, type='base')=>{
  
    const nvelEnnemi = ennemiByType(type);
    nvelEnnemi.path=chemin;
    nvelEnnemi.health=nvelEnnemi.healthDeBase;
    const image = new window.Image();
    image.src = nvelEnnemi.imageSrc;

    nvelEnnemi.shape = new Konva.Image({
      x: size.width-50, y: size.height-50,
      stroke: 'green'
      , image:image
    })
    const bestiole = new Ennemi(nvelEnnemi);//on peut faire varier les classes ou les types
    return bestiole;
  }

  return {createEnnemi, ennemiByType}
}






export class Ennemi {
  constructor({ speed, path = [], type, shape, health=1 }) {
    this.shape = shape;
    this.speed = speed;
    this.type = type;
    this.health = health;
    this.path = path; // Un tableau de points de cheminement
    this.currentPointIndex = 0;
    this.targetPoint = path.length > 0 ? path[0] : { x: 0, y: 0 };
  }

  // Méthode pour mettre à jour la position de l'ennemi
  move(dt) {
    // Supposons que l'ennemi a un attribut 'targetPoint' qui pointe vers le prochain point de cheminement

    const dx = this.targetPoint.x - this.shape.x();
    const dy = this.targetPoint.y - this.shape.y();
    const angle = Math.atan2(dy, dx);

    // Utiliser les setters pour modifier la position
    this.shape.x(this.shape.x() + Math.cos(angle) * this.speed * dt);
    this.shape.y(this.shape.y() + Math.sin(angle) * this.speed * dt);
    // Si l'ennemi est arrivé près du point cible, passer au suivant TODO
    // Dans la méthode move
    if (distance(this.shape.x(), this.shape.y(), this.targetPoint.x, this.targetPoint.y) < 10) {
      this.currentPointIndex++;
      if (this.currentPointIndex < this.path.length) {
        this.targetPoint = this.path[this.currentPointIndex];
      }
    }
  }
}

function distance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}



/** Projectiles */
export class Projectile {
  constructor(startX, startY, endX, endY, fromTower) {
    this.x = startX;
    this.y = startY;
    this.targetX = endX;
    this.targetY = endY;
    this.fromTower = fromTower;
    this.birthDate=new Date();
    this.points=[startX, startY, endX, endY];
    this.radius = 2; // Par exemple
  }
  getColor(){
    switch(this.fromTower){
      case 'basic':return "red";
      case 'medium':return "blue";
      case 'advanced':return "yellow";
      default:return "black"
    }
  }
}

/** TOURS */
const TOURS=[{type:'basic',  imageUrl: tour1Img, range:100, damage:1, timer:6000, health:200, cost:50}
  , {type:'medium', imageUrl: tour2Img, range:150, damage:2, timer:3000, health:500, cost:100}
  , {type:'advanced', imageUrl: tour3Img, range:200, damage:5, timer:1500, health:100, cost:250}
  , {type:'expert',  imageUrl: tour4Img, range:220, damage:10, timer:1000, health:2000, cost:200000000}
  , {type:'impossible',  imageUrl: tour4Img, range:220, damage:10, timer:100, health:2000, cost:2000000}
]
export const createTour=({x,y, type='basic'})=>{
  const tour = TOURS.find(t=>t.type===type);
  if(tour!=null)
  {
    Object.assign(tour,{x,y, width:tourSize, height:tourSize,id:(new Date()).getTime()});
  }
  return {...tour};
}
export const upgradeTour=(tour, virtual)=>{
  const tourIdx = TOURS.findIndex(t=>t.type===tour.type);
  if(tourIdx>=0 && tourIdx<TOURS.length){
    if(virtual)
      return TOURS[tourIdx+1];
    Object.assign(tour,TOURS[tourIdx+1]);
  }
  
  return tour;
}