import { useMemo, useRef, useState } from "react";
import { useSB } from "./SmartBactContext";

export const allActions = [
    {
        id: 'pondreBacterie', text: 'Pondre une bacterie', disabled: false
        , niveau:0
        , couts: { herbe: 50 }
    }
    , {
        id: 'ameliorerRuche', text: 'Ameliorer la base', disabled: false
        , niveau:0, only:true
        , couts: { herbe: 50}
    }
    , {
        id: 'ameliorerRuche2', text: 'Ameliorer la base au niveau 2', disabled: false
        , niveau:1, only:true
        , couts: { herbe: 150, bois: 100 }
    }
    , {
        id: 'ameliorerRuche3', text: 'Ameliorer la base au niveau 3', disabled: false
        , niveau:2, only:true
        , couts: { charbon: 200, bois: 200}
    }
    , {
        id: 'ameliorerRuche4', text: 'Ameliorer la base au niveau 4', disabled: false
        , niveau:3, only:true
        , couts: { herbe:800, charbon: 800, bois: 800, acier: 800}
    }
    , {
        id: 'creerRecherche', text: 'Centre de recherche genetique'
        , niveau:2
        , couts: { herbe: 10, bois: 50, charbon: 100 }
    }
    , {
        id: 'creerSport', text: 'Creer un centre de fitness'
        , niveau:1
        , couts: {  bois: 300, charbon:200, acier: 50 }
    }
    , {
        id: 'creerBeaute', text: 'Creer un centre de beauté'
        , niveau:3
        , couts: { herbe: 100, bois: 200, acier: 200}
    }
    , {
        id: 'creerAgro', text: 'Recherche agronomique'
        , niveau:1
        , couts: { herbe: 150, bois: 150, charbon: 150 }
    }
]

const getActionById = actionID => {
    const theAction = allActions.filter(a => a.id == actionID);
    if (theAction != null && theAction.length > 0)
        return theAction[0];
    return { id: 'dummyAction', text: 'tu devrais meme pas voir ca', couts: { intelligence: -2 } };
}

export const useActions = () => {
    const { setBacteries, newBacterie, achete, setMessage, setNiveau, setCentres } = useSB();
   const bacid=useRef(1);
    const handleAction = (actionID) => {
        const action = getActionById(actionID);
        const isOK = achete({ ...action.couts });
        if (!isOK)
            setMessage('Pas assez de ressources !');
        else
            if (actionID === 'pondreBacterie') {

                setBacteries(old => {
                    const newbac = newBacterie({ ptiNom: 'c' + bacid.current });
                    bacid.current++;
                    return [...old, newbac]
                });
            }
            else if (actionID.startsWith('ameliorerRuche')) {
                
                const lastLetter =  actionID.substring(actionID.length - 1);
                const niv = isNaN(lastLetter)?1:Number(lastLetter);
                setNiveau(niv);
            }
            else if (actionID.startsWith('creer')) {
                
                const creer =  actionID.substring(5, actionID.length);
                setCentres(oldc=>{
                    return [...oldc, {type:creer}];
                });
               
            }
    }
    return { handleAction }
}