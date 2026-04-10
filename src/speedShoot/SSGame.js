
import React, { createContext, useContext, useState } from "react"
import { ennemisByType } from "./SSEnnemies";
import { PSIZE } from "./SSPerso";
import { GameOver } from "../ChuckNorrisFact";

const SpeedShootContext = createContext();
export const useSSContext = () => useContext(SpeedShootContext);

const initPerso = ()=>{
    return {
        x:100, y:200
        ,arme:'pierre'
        , armure:0
        , vie:3
        , lastTouched:0
    }
}
const SSGame=({vitesse,setVitesse, posY, setScore, score, children})=>{

    const [enemies, setEnnemies] = useState([]);
    const [gameOver, setGameOver] = React.useState(false);
    const [perso, setPerso] = useState(initPerso());
    const reset=()=>{
        setScore(0);
        setVitesse(0);
        setGameOver(false) 
        setPerso(initPerso());
        setEnnemies([]);
    }
    React.useEffect(()=>{
        setPerso(p=>({...p, y:posY}));
    },[posY]);
    const checkEnnemiTouche = (now)=>{
       
        if((now-perso.lastTouched)<2000) // pas de double touche pendant 2 sec
            return;
        enemies.forEach((enmy,eidx)=>{
            const nmy = ennemisByType(enmy.type);
            if(perso.x+PSIZE/2>enmy.x&&perso.x+PSIZE/2<enmy.x+nmy.width
                &&perso.y+PSIZE/2>enmy.y&&perso.y+PSIZE/2<enmy.y+nmy.height
            )
            {
               // perd une vie
               const newVie = perso.vie-1;
               setPerso(old=>({...old, vie:newVie, lastTouched:(new Date()).getTime()}));
               if(newVie<0)
               {
                setGameOver(true);
               }
            }
            
        });
    }
    const shootAtEnemy = (pos)=>{
        //TODO comparer position enemis
        const newEnnemies=[];
        let sc=0;
        enemies.forEach((enmy,eidx)=>{
            const nmy = ennemisByType(enmy.type);
            if(pos.x>enmy.x&&pos.x<enmy.x+nmy.width
                &&pos.y>enmy.y&&pos.y<enmy.y+nmy.height
            )
            {
                enmy.vie--;
                sc++;// 1 point par enmi touche
            }
            if(enmy.vie>0)
                newEnnemies.push(enmy);
            else
                sc+=10;// 10 point par enmi tue
        });
       
        setEnnemies(newEnnemies);
        if(sc>0)
        setScore(s=>(s+sc*vitesse));

    }
    const stopShooting = (pos)=>{
        
    }
    return <SpeedShootContext.Provider value={{perso, setPerso, enemies, setEnnemies
        , shootAtEnemy, stopShooting, vitesse, checkEnnemiTouche, gameOver
    }}>
    <GameOver open={gameOver} score={score} gameName="SpeedShoot"
    handleClose={() => { setGameOver(false) }} handleRestart={reset} />
        {children}
    </SpeedShootContext.Provider>
}
export default SSGame;