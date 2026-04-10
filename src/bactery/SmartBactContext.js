import { createContext, useContext, useMemo, useRef, useState } from "react";
import QuickDialog from "../bitLife/utils/QuickDialog";

const SBContext = createContext();
const TOUTPRES = 20;
export const useSB = () => useContext(SBContext);
const ressourceDeBase={herbe:1000,bois:100,charbon:100, acier:100}

const SmartBactContext = ({ initialNumberOfBact = 2, frameWidth, frameHeight, children }) => {
    const [msgText, setmsgText] = useState();
    const baseCentrale = useMemo(() => {
        return {
            x: Math.floor(frameWidth / 2),
            y: Math.floor(frameHeight / 2),
        }
    }, [frameHeight, frameWidth]);
    const baseRessource=useRef(ressourceDeBase);
    const [bacts, setBacteries] = useState([]);
    const [ressources, setRessources] = useState([]);
    const [champVision, setChampVision] = useState(100);
    const [numGrass, setnumGrass] = useState(5);// Nombre initial de patches d'herbe
    const [niveau, setNiveau] = useState(0);
    const [centres, setCentres] = useState([]);
    const [vitesse, setVitesse] = useState(1);
    const [favori, setFavori] = useState();
    const [force, setForce] = useState(5);
    const [stockMax, setStockMax] = useState(10);

    const getSkill = ()=>{
        return {vitesse, force, stockMax, champVision, numGrass, favori}
    }
    const setSkill = (skill, value)=>{
        if(skill==='vitesse')
           {
            setVitesse(value);
            setBacteries(b=>{
                return b.map(bact=>({...bact, vitesse:value}))
            })
           }
        if(skill==='force')
            setForce(value);
        if(skill==='stockMax')
            setStockMax(value);
        if(skill==='champVision')
            setChampVision(value);
        if(skill==='numGrass')
            setnumGrass(value);
        if(skill==='favori')
            setFavori(value);
        if(skill==='customSkin')
            setBacteries(b=>{
                return b.map(bact=>({...bact, customSkin:value}))
            })
    }
    const newBacterie=({ptiNom, position})=>{
        return {
            ptiNom: ptiNom
            , position: position||baseCentrale
            , alive: true
            , champVision: champVision
            , vitesse: vitesse
            , force: force
            , energie: 100
            , stock: 0
            , customSkin:null
            // color, image deduit sans SmartBactery
            , ressources: [] // array de {type, qty}
        }
    }
    const initialize = useMemo(() => {
        return () => {

            baseRessource.current = ressourceDeBase;
            setCentres([]);
            setChampVision(100);
            setRessources([]);
            setVitesse(1);
            setFavori(null);
            setForce(10);
            setStockMax(5);
            setNiveau(0);
            setnumGrass(5);
            const initialBacteries = [];
            for (let b = 0; b < initialNumberOfBact; b++) {

                const randomPos = { x: Math.floor(Math.random() * frameWidth), y: Math.floor(Math.random() * frameHeight) };
                const ptiNom = 'b' + b;
                //New bacterie model
                initialBacteries.push(newBacterie({ptiNom, position:randomPos}));
            }
            setBacteries(initialBacteries);

        }
    }, [initialNumberOfBact, frameWidth, frameHeight, champVision, vitesse, force]);

  
    //quand la bact rentre a la base, elle se vide et donne ses ressrc
    const donne=(bact)=>{
        bact.ressources.forEach(r=>{
            if(baseRessource.current[r.type]==null)
                baseRessource.current[r.type]=0;
            baseRessource.current[r.type]+=r.qty;
        });
        bact.ressources=[];
        const baisse = bact.force<=10?10:(bact.force<=20?7:5);
        bact.energie-=baisse;
        bact.stock=0;
    }
    // quand des ressources sont utilisees par des actions
    const achete=(ressourceNeeded)=>{
        // like {herbe:50, bois:100}
        for(let type in ressourceNeeded){
            if(baseRessource.current[type]>=ressourceNeeded[type])
                baseRessource.current[type]-= ressourceNeeded[type];
            else // pas assez, renvoie l'erreur
                return false;
        }
        return true;//is OK at the end
        
    }
    //execute a chaque changement de direction
    const chercheDirection = bact => {
        //choisis la direction vers ressources si stock est vide ou vers base si plein
        // si pas de ressources en vue, direction random
        const vecteurBase = getNewPosition(bact, baseCentrale);
        let x = bact.directionCible?.x ?? -vecteurBase.x; // s'eloigne de la base au depart (donc negatif, suis un peu)
        let y = bact.directionCible?.y ?? -vecteurBase.y;
        if (bact.stock > stockMax) {
            // Dirige la bactérie vers la base centrale
            x = vecteurBase.x;
            y = vecteurBase.y;
        }
        else {
            //random
        }
        const repulsionForce = (position, size) => {
            const force = { x: 0, y: 0 };
            const margin = 20;
            const maxForce = 2; // Ajustez cette valeur pour contrôler l'intensité de la répulsion

            const distanceToRight = frameWidth - position.x - size / 2;
            const distanceToLeft = position.x - size / 2;
            const distanceToTop = position.y - size / 2;
            const distanceToBottom = frameHeight - position.y - size / 2;

            if (distanceToLeft < margin) force.x = maxForce * (margin - distanceToLeft) / margin;
            if (distanceToRight < margin) force.x = -maxForce * (margin - distanceToRight) / margin;
            if (distanceToTop < margin) force.y = maxForce * (margin - distanceToTop) / margin;
            if (distanceToBottom < margin) force.y = -maxForce * (margin - distanceToBottom) / margin;

            return force;
        };

        // Calcul de la force de répulsion
        const repulsion = repulsionForce(bact.position, 15); // Ajuster bact.size si nécessaire

        // Ajout de la force de répulsion au vecteur directeur
        x += repulsion.x;
        y += repulsion.y;
        const directionCible = {
            x, y
        };

        return directionCible;
    }
const cheatCode=()=>{
    for(let type in baseRessource.current){
       
            baseRessource.current[type]+=100;
    }
}
const attire = (evt) => {
    const mouseX = evt.clientX; // Position X de la souris
    const mouseY = evt.clientY; // Position Y de la souris
  
    // Mettre à jour directionCible pour chaque bactérie à proximité
    setBacteries(oldBact=>{
        return oldBact.map(bacterie => {
            
      const distance = calculateDistance(bacterie.position, {x:mouseX, y:mouseY});
  
      // Si la distance est inférieure à 500px, on met à jour directionCible
      if (distance < champVision) {
        bacterie.directionCible = getNewPosition(bacterie,{ x: mouseX, y: mouseY });
      }
      return bacterie;
    });
  });
}
    const cycleDeVie = () => {
        // deplacement de vitesse*direction, 
        const _currRessource = [...ressources];
        setBacteries(oldb => {
            const newBact = oldb.map(bact => {
                // Si la bactérie n'a pas de direction cible, on la calcule
                if (!bact.directionCible) {
                    bact.directionCible = chercheDirection(bact);
                }

                // Calcul du déplacement basé sur la direction cible
                const deplacement = {
                    x: bact.directionCible.x * bact.vitesse,
                    y: bact.directionCible.y * bact.vitesse
                };
                if (bact.stock < stockMax) {
                    const closestRessource = lookForClosestGrass(bact.position, champVision, _currRessource, true, favori);//TODO apres avoir fait les herbes
                    if (closestRessource != null) {
                        if (Math.abs(closestRessource.position.x - bact.position.x) < TOUTPRES
                            && Math.abs(closestRessource.position.y - bact.position.y) < TOUTPRES) {
                            prend(bact, closestRessource);

                        }
                        bact.directionCible = getNewPosition(bact, closestRessource.position);
                    }
                }
                else{
                    const distance = calculateDistance(bact.position, baseCentrale);
                    if(distance<TOUTPRES)
                        donne(bact);
                    else
                    bact.directionCible = getNewPosition(bact, baseCentrale);
                }
                // Vérification si la bactérie est proche d'un bord
                // Si oui, recalcul de la direction cible
                const newPosition = { x: bact.position.x + deplacement.x, y: bact.position.y + deplacement.y };
                if (newPosition.x < 0 || newPosition.x > frameWidth || newPosition.y < 0 || newPosition.y > frameHeight) //(// vérifier si la nouvelle position est hors des limites) {
                {
                    bact.directionCible = chercheDirection({ ...bact, position: newPosition });
                }
                return { ...bact, position: newPosition };
            })
            return newBact.filter(b=>b.energie>0);
        });
        setRessources(_currRessource.filter(r => (r.reserve > 0)));
    }
    return <SBContext.Provider value={{
        bacteries: bacts, setBacteries
        , initialize, cycleDeVie, newBacterie
        , setRessources, ressources
        , achete, niveau, setNiveau, setMessage:setmsgText
        , setCentres, centres, getSkill, setSkill
        , baseStock:baseRessource.current, cheatCode, attire
    }}>
        {children}
        <QuickDialog text={msgText} titre="Message a caractère informatif" />

    </SBContext.Provider>;
}

export default SmartBactContext;


const prend = (bact, ressource) => {
    // recupere les ressources
    let nb = bact.force;
    ressource.reserve -= nb;
    bact.ressources.push({ type: ressource.type, qty: nb });
    bact.stock += nb;
}

// Fonction utiles pour calculer la distance entre deux points
const getNewPosition = (bact, targetPosition) => {
    // renvoie new position selon vitesse et direction
    const vecteurDirecteur = {
        x: targetPosition.x - bact.position.x,
        y: targetPosition.y - bact.position.y
    };
    if(vecteurDirecteur.x==0&&vecteurDirecteur.y==0){
        vecteurDirecteur.x=Math.random()-0.5;
        vecteurDirecteur.y=Math.random()-0.5;
    }
    const norme = Math.sqrt(vecteurDirecteur.x * vecteurDirecteur.x + vecteurDirecteur.y * vecteurDirecteur.y);
    const vecteurDirecteurNormalise = {
        x: vecteurDirecteur.x / norme,
        y: vecteurDirecteur.y / norme
    };
    return {
        x: vecteurDirecteurNormalise.x * bact.vitesse,
        y: vecteurDirecteurNormalise.y * bact.vitesse
    }
}

export const calculateDistance = (point1, point2) => {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
};

// const isColliding = (bact1, bact2) => {
//     return (
//         bact1.position.x < bact2.position.x + bactWidth &&
//         bact1.position.x + bactWidth > bact2.position.x &&
//         bact1.position.y < bact2.position.y + bactHeight &&
//         bact1.position.y + bactHeight > bact2.position.y
//     );
// };
const lookForClosestGrass = (bacterie, champVision, allGrass, returnGrass, favori) => {
    let closestGrass = null;
    let closestDistance = Infinity;

    allGrass.forEach((grass) => {
        const distance = calculateDistance(bacterie, grass.position);
        if ((favori==null||favori===grass.type) 
            && distance < closestDistance && distance < champVision) {
            closestDistance = distance;
            closestGrass = grass;
        }
    });
    if (returnGrass) {
        return closestGrass;
    }
    return closestGrass ? closestGrass.position : null;
};