import React from "react";
import "./Cellule.css"; // Créez un fichier CSS pour styliser les cellules
import { CELL_SIZE } from "./JeuDeLaVie";
import { Box } from "@mui/material";

//moyenne:optimal de la courbe, ecartType:largeur de la courbe
export const MOLECULE={
  
 
  rouge:{
    color:{R:255, G:0, B:0},
    coeff:{moyenne:8, ecartType:4},
    seuil:0.4
  },
  violet:{
    color:{R:0, G:0, B:255},
    coeff:{moyenne:7, ecartType:4},
    seuil:0.5
  },
  vert:{
    color:{R:0, G:255, B:0},
    coeff:{moyenne:9, ecartType:3},
    seuil:0.5
  },
}
/**
 * cellObj = 
 *  {bleu:1, chlore:0.2
 *  }
 *  
 */
const getColor = (cellObj)=>{
  let cellObjR255 = 0;
  let cellObjG255 = 0;
  let cellObjB255 = 0;
  let cellObjAlpha=0;
  let val=0;
 
  for(let mol in cellObj)
 {
  const molVal = (cellObj[mol]||0);
  if(molVal>0){
    
  cellObjR255 += MOLECULE[mol].color.R*molVal;
  cellObjG255 += MOLECULE[mol].color.G*molVal;
  cellObjB255 += MOLECULE[mol].color.B*molVal;
  val+=(molVal*molVal);
}
 }
 cellObjAlpha=Math.min(1,val);
 
  
  return `rgba(${cellObjR255}, ${cellObjG255},${cellObjB255},${cellObjAlpha})`;
}
export const CelluleDeLaVie20 = ({ alive, x,y,...props }) => {
    const color = getColor(alive); 
  return <Box style={{top:y*CELL_SIZE, left:x*CELL_SIZE, width:CELL_SIZE,height:CELL_SIZE
  , position:'absolute', backgroundColor:color}} {...props} />;
};
const CelluleDeLaVie = ({ alive, x,y,...props }) => {
    const classDeVie =  alive===1?'alive':(alive===2?'malade':(alive===3?'surchauffe':'dead'));
  return <div className={`cellLife ${classDeVie}`} style={{top:y*CELL_SIZE, left:x*CELL_SIZE}} {...props} />;
};

export default CelluleDeLaVie;
