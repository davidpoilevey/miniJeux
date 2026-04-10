import React, { useContext, createContext, useState, useCallback } from "react";
import { useLieux } from "./LieuxProvider";
import { ConsequenceDialog } from "./ConsequenceDialog";

const defaultPerso = {
    nom: 'John Doe'
    , vie: 20
    , avatar: 'https://static.canalblog.com/storagev1/aclcla.canalblog.com/albums/chevalier/avatar.jpg'
    , attaque: 5
    , bonheur: 5
    , force: 5
    , dexterite: 5
    , charisme: 5
    , intelligence: 5
    , missions: []
    , connaissances: ['kamasutra','heraldique']
   , possessions: {or:1000}
}
const PersoContext = createContext();
export const usePerso = () => useContext(PersoContext);
export const PersoProvider = ({ children }) => {
    const [perso, setPerso] = useState(defaultPerso);
    const [consequence, setConsequence] = useState();
    const { setLieu } = useLieux();

    const addDegats = (degats) => {
        setPerso(oldP => {
            const newP = { ...oldP };
            newP.vie -= degats;
            return newP;
        });
    }
    const conditionsOK = conditions => {
        if (conditions == null)
            return true;
        // condition d'action : mission, connaissance, possessions
        for (let key in conditions) {
            if (key === 'mission') {
                // check if perso has this mission
                if (perso.missions.findIndex(m => m.id === conditions[key]) < 0)
                    return false;
            }
            if (key === 'possessions') {
                const cquilfaut = conditions[key]; //{croqs:10}
                for (let needed in cquilfaut) {

                    if (perso.possessions[needed] == null || perso.possessions[needed] < cquilfaut[needed])
                        return false;
                }
            }
            if(key==='connaissance'){
                if (perso.connaissances.indexOf(conditions[key]) < 0)
                return false;
            }
        }
        return true;
    }
  
    const applyConsequence = (conseq) => {
        let currPerso = { ...perso };
        for (let c in conseq) {
            if (c === 'lieu')
                setLieu(conseq.lieu);
            else if (c === 'text')
                setConsequence(conseq);
            else if (c === 'possessions')
                addPossession(conseq[c]);
            else if (c === 'recompense') {

                for (let recKey in conseq.recompense) {
                    const recValue = conseq.recompense[recKey];
                    currPerso = changePerso(currPerso, recKey, recValue);
                }
            }
            else if (currPerso.hasOwnProperty(c))
                currPerso[c] += conseq[c];
        }
        currPerso.bonheur=Math.min(20,currPerso.bonheur);
        currPerso.vie=Math.min(20,currPerso.vie);
        setPerso(currPerso);

    }
    const closeConseq = () => {
        setConsequence(null);
    }
    const addMission = (mission) => {
        setPerso(oldP => {
            const newP = { ...oldP };
            newP.missions.push(mission);
            return newP;
        });
    }
    const addPossession = useCallback(newPoss => {
        let done=false;
        setPerso(oldP => {
            const newP = { ...oldP };
            if(done)
                return oldP;
            for (let item in newPoss) {
                const oldValue = newP.possessions[item] ?? 0;
                const newval = oldValue + newPoss[item];
                if(newval>0)
                    newP.possessions[item] = newval;
                else
                    delete  newP.possessions[item];
            }
            done=true;
            return newP;
        });
    },[setPerso]);
    const changePerso = (perso, key, value) => {
        const newP = { ...perso };
        //key peut avoir bonheur, possessions 
        // les objets-tableaux a incrementer
        if (key === 'possessions') {

            const newPoss = newP[key] || {};
            if (typeof value === 'object') {
                for (let item in value) {
                    const oldValue = newPoss[item] ?? 0;
                    newPoss[item] = oldValue + value[item];
                }
            }

            newP[key] = newPoss;
        }
        else //valeurs directes
            newP[key] = value;
        return newP;
    }
    const valideMission = (mission) => {

        setPerso(oldP => {
            let newP = { ...oldP };
            const midx = newP.missions.findIndex(m => m.id === mission.id);
            if (midx >= 0) {
                // const recomp = newP.missions[midx].recompense;
                // for (let item in recomp) {
                //     if (item !== 'text')
                //         newP = changePerso(newP, item, recomp[item]);
                // }
                newP.missions.splice(midx, 1);
            }
            return newP;
        });
        applyConsequence(mission.recompense);
    }

    return <PersoContext.Provider value={{
        perso, addPossession, conditionsOK, applyConsequence
        , addMission, valideMission, addDegats
    }}>
        {children}
        <ConsequenceDialog consequence={consequence} onDone={closeConseq} />
    </PersoContext.Provider>;
};



