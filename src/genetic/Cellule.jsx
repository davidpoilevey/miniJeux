import React, { useEffect, useMemo, useState } from "react";
import { ADN } from "./ADN";
import { Box } from "@mui/material";
import './cell.css';

const FROTTEMENT=0.21;
const RENDEMENT_PUISSANCE = 6;// facteur de multiplication de l'energie

export const getCellSize = (cell) => {

    const cellAdn = new ADN(cell.adn);
    return cellAdn.getSize();
}
const Cellule=({chaineADN,id,position,petri,displayInfo,isParent,...props})=>{
   const thisAdn =  useMemo(()=>{
            const adn = new ADN(chaineADN);
            return adn;
    },[chaineADN]);
    
    const [pos, setPos] = useState(position);
    const [energie, setEnergie] = useState(100);
    const [vitesse, setVitesse] = useState(0);
    const [angle, setAngle] = useState(0);
    useEffect(()=>{
        if(isParent){
            petri.aAccouche(id);
            setEnergie(100);
        }
    },[id, isParent, petri]);
    

    useEffect(()=>{
       const rencontre = petri.updatePosition(id, pos, energie);
       if(rencontre!=null){
        // soit bouffe soit autre cellule
        if(rencontre.id.startsWith('bouffe')){// bouffe donne 20 energie
            setEnergie(nrj=>(nrj+rencontre.valeurNutritive||20));
            petri.removeBouffe(rencontre.id);
        }
        else{ // plus gros enleve moitie energie du plus petit, tous reculent de 10
            if(getCellSize(rencontre)>thisAdn.getSize()){
                setEnergie(nrj=>nrj/2);
                const aie=energie/10;// moins on a d'energie, moins on recule
                setPos({x:pos.x - (rencontre.position.x-pos.x), y:pos.y - aie*(rencontre.position.y-pos.y)})
            }
            else if(getCellSize(rencontre)<thisAdn.getSize()){
                setEnergie(nrj=>(nrj+60));
                // elle reculera d'elle meme et se prendre la perte d'energie
            }
            else{
                // meme taille, mouvement de recul quand meme
                setPos({x:pos.x - (rencontre.position.x-pos.x), y:pos.y - 2*(rencontre.position.y-pos.y)})
            }
        }
       }
    },[energie, id, petri, pos, thisAdn])
    useEffect(()=>{
     //  const intv = setInterval(()=>{
        const moveAction = ()=>{
        // choix d'une direction
        const newAngle = thisAdn.getDirection({id:id, ...pos}, angle, petri)
        setAngle(newAngle);
        // choix d'une quantite d'energie a mettre pour obtenir la vitesse
        const nrj = thisAdn.getAdrenaline(vitesse, energie);
        if(nrj>0){

            setEnergie(oldNrj=>(oldNrj-Math.max(1,nrj+thisAdn.getSize())));// si on a decide d'y aller, c'est un minimum de 1
        }
        const frottement = FROTTEMENT * vitesse**2;
        const acc = (nrj*RENDEMENT_PUISSANCE / thisAdn.getSize()) - (frottement / thisAdn.getSize())
        let speed = vitesse + acc;
        setVitesse(Math.max(0,speed));
        // deplacement
        const newX = pos.x + Math.cos(newAngle) * speed;
        const newY = pos.y + Math.sin(newAngle) * speed;
        setPos({x:newX,y:newY});

       // nager dans le substrat donne de l'energie, perte de N pour le metabolisme automatique
        setEnergie(oldNrj=>{
            const metabolisme = thisAdn.getMetabolism();
            let newNrj = oldNrj-metabolisme;// perte automatque
            newNrj+=speed*metabolisme/5;// gaine selon vitesse
            return newNrj;
            
        });
        setTimeout(()=>{requestAnimationFrame(moveAction);}, 1000/thisAdn.getTimer())
        

        }
        requestAnimationFrame(moveAction);
        //, 1000/thisAdn.getTimer());
       // return ()=>{clearInterval(intv)}
    },[pos, angle, energie, thisAdn, id, petri, vitesse]);

    useEffect(()=>{
        if(energie<=0){
            petri.celluleMeurt(id);
        }
    },[energie, id, petri])

    const cellStyle={
        position:'absolute',
        borderRadius:'50%',
        top:pos.y,
        left:pos.x,
        background:thisAdn.getColor(),
        width:thisAdn.getSize(),
        height:thisAdn.getSize(),


    }

    const showDetails=(evt)=>{
        displayInfo(evt,{id:id, energie, vitesse, adn:chaineADN});
    }

return <Box sx={cellStyle} className={"morte"} onMouseOver={showDetails}>

</Box>

}
export default Cellule;