import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box } from '@mui/material';

/** Code genetique: [1:en bas, 2:a gauche, 3: en haut, 4: a droite]
 * A:fais pousser bourgeon
 * T: fais pousser feuille
 * C: fais pousser fruit
 * G: fais rien pousser
 *  */ 


const CELLULE_SIZE=7;

const buildOccupiedSet = (struct) => {
    const set = new Set();
    struct.forEach(cell => set.add(`${cell.x},${cell.y}`));
    return set;
};

const Plante = ({ adn, plantationRect, murs=[],cycleDeVie  ,nextPlante}) => {
    const [plantStructure, setPlantStructure] = useState([]);
    const lastCycle=useRef(0);
  // Utilisez la fonctionMagique() pour obtenir les éléments de la plante
 useEffect(()=>{
    lastCycle.current = 0;
    setPlantStructure([{x:plantationRect.width/2, y:plantationRect.height-10, type:'bourgeon'}]);
  },[adn,plantationRect]);
  const caseOccupee=(posATester, occupiedSet)=>{
    if(occupiedSet.has(`${posATester.x},${posATester.y}`)) return true;
    if(posATester.x<0||posATester.x>plantationRect.width||posATester.y<0) return true;
    for(const mur of murs){
        if(posATester.x+CELLULE_SIZE>mur.x && posATester.x<mur.x+mur.width
            && posATester.y+CELLULE_SIZE>mur.y && posATester.y<mur.y+mur.height)
            return true;
    }
    return false;
  }
  useEffect(()=>{
    const eltsToAdd = [];
    const root=plantStructure[0];
    if(root==null)
    return;
    const bourgeons = plantStructure.filter(b=>b.type==='bourgeon');
    const arn=adn[cycleDeVie%adn.length];
    if(arn==null){
       throw new Error('plus de cycle de vie');
    }
    const occupied = buildOccupiedSet(plantStructure);
    bourgeons.forEach(bourgeon=>{

            // que faire dans la case en bas:
            const caseDenBas={x:bourgeon.x,y:bourgeon.y+CELLULE_SIZE}
            if(caseDenBas.y<root.y && !caseOccupee(caseDenBas, occupied)){
                const codon=arn[0];
                if(codon==='A'){
                    eltsToAdd.push({...caseDenBas, type:'bourgeon'})
                }
                if(codon==='T'){
                    eltsToAdd.push({...caseDenBas, type:'feuille'})
                }
                if(codon==='C'){
                    eltsToAdd.push({...caseDenBas, type:'fruit'})
                }
                if(codon==='G'){
                   // rien du tout
                }
            }
            
            // que faire dans la case a gauche:
            const caseDeGauche={x:bourgeon.x-CELLULE_SIZE,y:bourgeon.y}
            if(!caseOccupee(caseDeGauche, occupied)){

                const codon=arn[1];
                if(codon==='A'){
                    eltsToAdd.push({...caseDeGauche, type:'bourgeon'})
                }
                if(codon==='T'){
                    eltsToAdd.push({...caseDeGauche, type:'feuille'})
                }
                if(codon==='C'){
                    eltsToAdd.push({...caseDeGauche, type:'fruit'})
                }
            }
            
            // que faire dans la case en haut:
            const caseDenHaut={x:bourgeon.x,y:bourgeon.y-CELLULE_SIZE}

            if(!caseOccupee(caseDenHaut, occupied)){

                const codon=arn[2];
                if(codon==='A'){
                    eltsToAdd.push({...caseDenHaut, type:'bourgeon'})
                }
                if(codon==='T'){
                    eltsToAdd.push({...caseDenHaut, type:'feuille'})
                }
                if(codon==='C'){
                    eltsToAdd.push({...caseDenHaut, type:'fruit'})
                }
            }
            
            // que faire dans la case a droite:
            const caseDeDroite={x:bourgeon.x+CELLULE_SIZE,y:bourgeon.y}

            if(!caseOccupee(caseDeDroite, occupied)){

                const codon=arn[3];
                if(codon==='A'){
                    eltsToAdd.push({...caseDeDroite, type:'bourgeon'})
                }
                if(codon==='T'){
                    eltsToAdd.push({...caseDeDroite, type:'feuille'})
                }
                if(codon==='C'){
                    eltsToAdd.push({...caseDeDroite, type:'fruit'})
                }
            }
            
    })
   
    if(eltsToAdd.length>0){

        setPlantStructure(oldElts=>([...oldElts, ...eltsToAdd]));
        lastCycle.current=cycleDeVie;
    }
    // sinon ca pue, la plante est condamnee
    else{
        // la plante meurt, ses fruits deviennent des graines et le cycle recommence
        setPlantStructure(oldStruct=>{
            const occupiedDeath = buildOccupiedSet(oldStruct);
            let bourgeonLimit=10;
            const newStruct=[];
            const sortedStruct = oldStruct.sort((c1,c2)=>(c1.y>c2.y?1:-1));
            sortedStruct.forEach(cell=>{

                if(cell.type==='feuille')// elle meurt
                    newStruct.push({...cell, type:'feuillemorte'})
                else if(bourgeonLimit>0 && cell.type==='fruit'){// seulement 3 fruits au maximum peuvent renaitre
                    bourgeonLimit--;
                    newStruct.push({...cell, type:'bourgeon'});
                }
                else // devient du bois si 1 case libre pas loin
                  {
                    if(!caseOccupee({x:cell.x+CELLULE_SIZE, y:cell.y}, occupiedDeath)
                    ||!caseOccupee({x:cell.x-CELLULE_SIZE, y:cell.y}, occupiedDeath)
                    ||!caseOccupee({x:cell.x, y:cell.y+CELLULE_SIZE}, occupiedDeath)
                    ||!caseOccupee({x:cell.x, y:cell.y-CELLULE_SIZE}, occupiedDeath)
                    )
                     newStruct.push({...cell, type:'bois'});
                  }
            });
            // and filter to remove dead wood

            return newStruct;
        });
        if(lastCycle.current+5<cycleDeVie ||  lastCycle.current>cycleDeVie+2){

        // si la structure n'avance plus pendant 5 tours, c'est mort, ou si le lastCycle est superieur au cycle courant (=bug)
        // on enregistre le score et l'ADN
        
        const higherPoint = plantStructure.reduce((min, box) => (box.y < min ? box.y : min), Number.POSITIVE_INFINITY);
        
        nextPlante(higherPoint, adn);
        }
    }

    
   //return <BioCellule positionDepart={plantation} arn={adn[0]}/>// execute le 1er codon
  },[cycleDeVie]);

const boxColor = (boxtype)=>{
    if(boxtype==='bourgeon') return 'lime';
    if(boxtype==='fruit') return 'red';
    if(boxtype==='bois') return 'brown';
    if(boxtype==='feuillemorte') return '#e0bda9';
    else return 'green';
}
  return (
    <>
      {plantStructure.map((box, index) => (
        <Box
          key={index}
          style={{
            width: CELLULE_SIZE+'px',
            height: CELLULE_SIZE+'px',
            backgroundColor: boxColor(box.type), // Couleur des boîtes
            position: 'absolute',
            border:'1px solid black',
            top: box.y + 'px',
            left: box.x + 'px',
          }}
        />
      ))}
    </>
  );
};

export default Plante;

const BioCellule = ({positionDepart, arn})=>{

    return {x:positionDepart.x, y:positionDepart.y}
}