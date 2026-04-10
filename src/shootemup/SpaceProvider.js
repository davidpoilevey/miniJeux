// src/SpaceContext.js
import React, { createContext, useEffect, useRef, useState } from 'react';
import { ENEMY_TYPE } from './Enemy';
import { VAISSEAU_WIDTH } from './Vaisseau';

const SpaceContext = createContext();
/**
 * tirs: {id, x,y,dx,dy}
 * vaisseau:{x,y,type}
 * enemy {id, x, y, type, bonus}
 */
const ENEMY_MARGIN = 50;
const SpaceProvider = ({ children }) => {

    const [bonuses, setBonuses] = useState([]);
    const [enemies, setEnemies] = useState([]);
    const [multiTir, setMultiTir] = useState(false);
    const [explosions, setExplosions] = useState([]);
    const [tirs, setTirs] = useState([]); // État local pour les tirs du vaisseau
    const spaceWidth = useRef();
    const spaceHeight = useRef();
    const tirID = useRef(1);
    const vaisseauPosition=useRef();
    const [vaisseau, setVaisseau] = useState({ x: 200, y: 200, type: 'v1' });

    // Fonction pour générer les ennemis de manière aléatoire avec des schémas
    const generateEnemies = (nbRow, nbEnemyPerRow, enemyTypes, espaceDispo, bonusProbability) => {
        const newEnemies = [];
        if(espaceDispo!=null)
            {
                spaceWidth.current = espaceDispo.width;
                spaceHeight.current = espaceDispo.height;
            }
        for (let row = 0; row < nbRow; row++) {
            for (let enemyIndex = 0; enemyIndex < nbEnemyPerRow; enemyIndex++) {
                const typeIndex = Math.floor(Math.random() * enemyTypes.length);
                const type = enemyTypes[typeIndex];
                const isBonus = Math.random() < bonusProbability;

                newEnemies.push({
                    id: row * nbEnemyPerRow + enemyIndex,
                    x: (enemyIndex + 0.5) * (spaceWidth.current / nbEnemyPerRow),
                    y: (row + 1) * ENEMY_MARGIN, // Distance entre les rangées d'ennemis
                    type,
                    bonus: isBonus,
                });
            }
        }
        setEnemies(newEnemies);
    };
    // plus d'ennemis, on en remet
    useEffect(()=>{
        if(enemies.length==0 && spaceWidth.current!=null)
            generateEnemies(3,6,['basic','type2','boss'],null,0.2);
    },[enemies.length])

    const updatePosition = (pos) => {
        setVaisseau(oldv => {
            return { ...oldv, x: pos.x, y: pos.y }
        })
    }
    const shoot = (prendCeVaisseau) => {

        const v = vaisseauPosition.current||vaisseau;
        // Générer les tirs en fonction du type de vaisseau (v1, v2, v3, etc.)
        const newTirs = [];
        switch (vaisseau.type) {
            case 'v1':
                newTirs.push({ id: tirID.current++, x: v.x + VAISSEAU_WIDTH / 2, y: v.y, dx: 0, dy: -5 });

                break;
            case 'v2':
                newTirs.push({ id: tirID.current++, x: v.x + VAISSEAU_WIDTH / 2 - 10, y: v.y, dx: -1, dy: -5 });
                newTirs.push({ id: tirID.current++, x: v.x + VAISSEAU_WIDTH / 2 + 10, y: v.y, dx: 1, dy: -5 });
                break;
            case 'v3':
                newTirs.push({ id: tirID.current++, x: v.x, y: v.y, dx: -1, dy: -5 });
                newTirs.push({ id: tirID.current++, x: v.x + VAISSEAU_WIDTH / 2, y: v.y, dx: 0, dy: -5 });
                newTirs.push({ id: tirID.current++, x: v.x + VAISSEAU_WIDTH, y: v.y, dx: 1, dy: -5 });
                break;
            // Ajoutez d'autres cas pour les autres types de vaisseau

            case 'v4':
                newTirs.push({ id: tirID.current++, x: v.x + VAISSEAU_WIDTH / 2 - 10, y: v.y, dx: -2, dy: -3 });
                newTirs.push({ id: tirID.current++, x: v.x + VAISSEAU_WIDTH / 2 + 10, y: v.y, dx: -1, dy: -4 });
                newTirs.push({ id: tirID.current++, x: v.x + VAISSEAU_WIDTH / 2 - 10, y: v.y, dx: 0, dy: -5 });
                newTirs.push({ id: tirID.current++, x: v.x + VAISSEAU_WIDTH / 2 + 10, y: v.y, dx: 1, dy: -4 });
                newTirs.push({ id: tirID.current++, x: v.x + VAISSEAU_WIDTH / 2 - 10, y: v.y, dx: 2, dy: -3 });
                newTirs.push({ id: tirID.current++, x: v.x + VAISSEAU_WIDTH / 2 + 10, y: v.y, dx: 0, dy: -3 });
                break;
            default:
                break;
        }
        setTirs((prevTirs) => [...prevTirs, ...newTirs]);
    };
    const checkHit = (tir) => {
        for (const nmy of enemies) {
            if (
                tir.x >= nmy.x &&
                tir.x <= nmy.x + ENEMY_TYPE[nmy.type].width &&
                tir.y >= nmy.y &&
                tir.y <= nmy.y + ENEMY_TYPE[nmy.type].height
            )
                return nmy

        }
        return null;
    }
    const animateTirs = () => {
        setTirs((prevTirs) => {
            const tirLost = [];
            const newTirs = [];
            prevTirs.forEach((tir) => {
                if (tir == null)
                    return;//??
                const newtir = {
                    ...tir,
                    x: tir.x + tir.dx,
                    y: tir.y + tir.dy,
                };

                if (newtir.x < 0 || newtir.x > spaceWidth.current || newtir.y < 0)
                    tirLost.push(tir.id);
                else
                    newTirs.push(newtir);
            })

            return newTirs;
        }
        );

    };
    // check collisions vaisseau bonus enemies
    useEffect(() => {
        let touched=null;
        let crushed=false;
        bonuses.forEach(b=>{
            if (
                b.x >= vaisseau.x &&
                b.x <= vaisseau.x + VAISSEAU_WIDTH &&
                b.y >= vaisseau.y &&
                b.y <= vaisseau.y + 50
            )
            {
               touched=b;
            }
        });
        enemies.forEach(b=>{
            if (
                b.x+ ENEMY_TYPE[b.type].width >= vaisseau.x &&
                b.x <= vaisseau.x + VAISSEAU_WIDTH &&
                b.y+ENEMY_TYPE[b.type].height >= vaisseau.y &&
                b.y <= vaisseau.y + 50
            )
            {
               crushed=true;
            }
        });
        if(crushed){
            setExplosions(expl=>{
               return [...expl, {id:'crash'+vaisseau.x, x:vaisseau.x ,y:vaisseau.y}];
            });

            // remove vaisseau, vie,
            // update score
        }
        if(touched!=null){
            if(touched.type==='lvlUp'){
                if(vaisseau.type==='v1')
                    setVaisseau({...vaisseau, type:'v2'});
                    if(vaisseau.type==='v2')
                        setVaisseau({...vaisseau, type:'v3'});
                        if(vaisseau.type==='v3')
                            setVaisseau({...vaisseau, type:'v4'});

            }
            else if(touched.type==='multiTir'){
                setMultiTir(true);
            }
            //ENLEVE BONUS,
            setBonuses(bs=>bs.filter(b=>b.id!==touched.id));
        }

    },[vaisseau,bonuses,enemies]);
    useEffect(()=>{
        if(explosions.length>0){
            // replace vaisseau par explosion
            setTimeout(()=>{
                setExplosions([]);
            },500)
        }
    },[explosions])
    // check collisions tir ennemis
    useEffect(() => {
        const touches = [];
        const tirLost = [];
        // else 
        tirs.forEach(tir => {
            const touche = checkHit(tir);
            if (touche != null) {
                touches.push(touche);

            setExplosions(expl=>{
                return [...expl, {id:'explo'+tir.id, x:tir.x ,y:tir.y}];
             });
                tirLost.push(tir.id);
            }
        });


        if (touches.length > 0) {
            // enleve enemy, lache bonus
            setEnemies((prevEn) => {
                const newEnemies = [];
                prevEn.forEach(nmy => {
                    if (touches.find(t => t.id === nmy.id)) {
                        if (nmy.bonus)
                            lacheBonus(nmy);
                    }
                    else
                        newEnemies.push(nmy);
                });
                return newEnemies;
            }
            );
        }
        if (tirLost.length > 0){
           const newtirs= tirs.filter(tir => !tirLost.find(tid => tid === tir.id))
            setTirs(newtirs);
        }

    }, [tirs, enemies]);
    const intervalMulti = useRef();
    useEffect(()=>{

        if(multiTir ){
            vaisseauPosition.current={x:vaisseau.x, y:vaisseau.y}
            if(intervalMulti.current==null)
            intervalMulti.current = setInterval(()=>{
                shoot();
            },200)
        }
        else if(intervalMulti.current!=null)
            clearInterval(intervalMulti.current)
       // return () => clearInterval(intervalMulti.current);
    },[multiTir, vaisseau.x, vaisseau.y])
    const lacheBonus = (position) => {
        setBonuses(oldB => {
            let bonusType='lvlUp';
            if(Math.random()<0.5)
                bonusType = 'multiTir';
            const newBonus = {id:'bonus'+bonuses.length, ...position, type:bonusType }
            return [...oldB, newBonus];
        })
    }
    const animateEnemies = () => {
        const speedFactor = 0.5;
        setEnemies((prevEn) =>
            prevEn.map((ennemi) => {
                const newEnnemi = { ...ennemi };
                // selon type ca bouge autrement
                if (newEnnemi.type === 'basic'||newEnnemi.type === 'random') {
                    //basic.. 50px vers la droite, puis vers la gauche
                    if (newEnnemi.sens === 'droite') {
                        newEnnemi.x += speedFactor;
                        if (newEnnemi.x + ENEMY_TYPE[newEnnemi.type].width > spaceWidth.current) {
                            //border du screen, descend et repart dans l'autre sens
                            newEnnemi.sens = 'gauche';
                            if(newEnnemi.type === 'basic')
                                newEnnemi.y += ENEMY_TYPE[newEnnemi.type].height + ENEMY_MARGIN
                        }
                    }
                    else {//gauche ou null

                        newEnnemi.x -= speedFactor;
                        if (newEnnemi.x < 0) {
                            //border du screen, descend et repart dans l'autre sens
                            newEnnemi.sens = 'droite';
                            if(newEnnemi.type === 'basic')
                                 newEnnemi.y += ENEMY_TYPE[newEnnemi.type].height + ENEMY_MARGIN
                        }
                    }

                }
                if (newEnnemi.type === 'type2') {
                    // Faire mouvement en forme de lemniscate (8)
                    const t = performance.now() * 0.001; // Utilisez un temps continu pour un mouvement plus fluide
                    const a = 300; // Ajustez les valeurs pour le mouvement souhaité
                    if(newEnnemi.basePoint==null){
                        newEnnemi.basePoint={
                            x:(Math.random()*(spaceWidth.current-250))+250
                            ,y:(Math.random()*(spaceHeight.current-250))+150
                        }
                    }
                    const x = newEnnemi.basePoint.x + a * Math.cos(t) / (1 + Math.sin(t) ** 2);
                    const y = newEnnemi.basePoint.y + a * Math.sin(t) * Math.cos(t) / (1 + Math.sin(t) ** 2);
            
                    newEnnemi.x =Math.min(Math.max(0,x),spaceWidth.current);
                    newEnnemi.y =Math.min(Math.max(0,y),spaceHeight.current);
                  }
                  if (newEnnemi.type === 'boss') {
                    if (!newEnnemi.target) {
                      // Déterminer une cible aléatoire {x, y} sur l'écran
                      newEnnemi.target = {
                        x: Math.random() * (spaceWidth.current - ENEMY_TYPE[newEnnemi.type].width),
                        y: Math.random() * (spaceHeight.current - ENEMY_TYPE[newEnnemi.type].height),
                      };
                    }
            
                    const dx = newEnnemi.target.x - newEnnemi.x;
                    const dy = newEnnemi.target.y - newEnnemi.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
            
                    if (distance > speedFactor) {
                      const angle = Math.atan2(dy, dx);
                      newEnnemi.x += Math.cos(angle) * speedFactor;
                      newEnnemi.y += Math.sin(angle) * speedFactor;
                    } else {
                      // Arrivé à la cible, déterminer une nouvelle cible
                      newEnnemi.target = {
                        x: Math.random() * (spaceWidth.current - ENEMY_TYPE[newEnnemi.type].width),
                        y: Math.random() * (spaceHeight.current - ENEMY_TYPE[newEnnemi.type].height),
                      };
                    }
                  }       
                  // pour tous, on remonte en haut si en bas
                  if(newEnnemi.y>spaceHeight.current)
                    newEnnemi.y=ENEMY_MARGIN;

                return newEnnemi;
            })
        );
    }


    return (
        <SpaceContext.Provider
            value={{
                vaisseau,explosions,
                updatePosition,
                generateEnemies,
                enemies,
                shoot,
                tirs, bonuses,
                animateTirs, animateEnemies
            }}
        >
            {children}
        </SpaceContext.Provider>
    );
};

export { SpaceProvider, SpaceContext };
