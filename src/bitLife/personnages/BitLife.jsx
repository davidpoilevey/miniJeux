import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import BitUI from '../ui/bitUI';
import { Personnage } from './Personnage';
import { Famille, NPlusUn } from './PNJ';
import { LieuDeTravail, createLieu } from '../lieux/Lieu';
import { ActiviteProvider } from '../activites/ActiviteProvider';
import { ThemeProvider, createTheme } from '@mui/material';
import { Consequences } from '../events/Consequences';
import { Jobs } from '../activites/Jobs';
import { createRandomPeople } from '../utils/persoUtils';
import CreationMode from '../utils/CreationMode';
import QuickDialog from '../utils/QuickDialog';



const PersoContext = createContext();
export const usePerso = () => useContext(PersoContext);

export const PersoProvider = ({ persoConf, children }) => {
    // public functions
    const [perso, setPerso] = useState(persoConf);
    const [lieuObjects, setLieux] = useState({});
    const [historique, setHistorique] = useState(['Vous etes nés.']);
    useEffect(() => {
        //a l'init on cree tous les Lieux
        setLieux({
            'maison': createLieu('maison'),
            'exterieur': createLieu('exterieur'),
            'ecole': createLieu('ecole'),
            'lycee': createLieu('lycee'),
            'fac': createLieu('fac'),
            'travail': new LieuDeTravail({ type:'travail', metier:Jobs.anpe }),
            'ephad': createLieu('ephad'),
        })
    }, []);
    useEffect(() => {
        if (persoConf != null)
            setPerso(persoConf);
    }, [persoConf])
    const nouveauJob = metier=>{
        // ajouter le metier au perso
        setPerso(oldperso=>{
            const newPerso= {...oldperso};
            newPerso.perso.metier=metier;
            newPerso.perso.titre=metier.rangs[0];
            return newPerso;
        });
        // ajouter le lieu de travail et les collegues
       const persToAdd=createRandomPeople(metier.nbPersonnes, ['adulte']);
       // add boss
       persToAdd.push(new NPlusUn({nom:"Christophe Rohmer"}));

        const lieudetravail = new LieuDeTravail({ type:'travail', personnes:persToAdd, metier:metier});
       
        setLieux({...lieuObjects, travail:lieudetravail}); 

    }
    const useLieu = useCallback(lieu => {
        let lieuObj = null;
        if (lieu != null && lieuObjects[lieu] == null && lieu !== 'maison') {
            // // create lieu
            // lieuObj = createLieu(lieu);
            // setLieux({ ...lieuObjects, [lieu]: lieuObj });
        }
        else
            lieuObj = lieuObjects[lieu];
        return lieuObj;
    }, [lieuObjects]);
    const replaceIfoundInLieu = useCallback((pnj, replacement) => {

        for (let l in lieuObjects) {
            const lieu = lieuObjects[l];
            if (lieu.personnes == null)
                continue;
            for (let p = 0; p < lieu.personnes.length; p++) {
                if (lieu.personnes[p].nom === pnj.nom) {
                    lieu.personnes[p] = replacement;
                    break;
                }
            }
        }

    }, [lieuObjects]);

   

    /*  internal function */
    const addLog = (text, level) => {
        setHistorique(h => h.concat(text));
    }
    const savePerso=(persoConf)=>{
        if(persoConf instanceof Personnage)
            setPerso(persoConf);
        else if(persoConf!=null){

                    perso.perso=persoConf.perso??persoConf;
                    perso.wrapAmis();
                    setPerso(perso);
                }
        else
        setPerso(persoConf);
    }


    const value = {
        perso: perso, savePerso,
        useLieu, lieux: lieuObjects, replaceIfoundInLieu, nouveauJob,
        addLog, historique
    }
    return <PersoContext.Provider value={value}>{children}</PersoContext.Provider>;
}


const theme = createTheme({
    palette: {
        background: {
            default: '#EBE8C1',
            paper: '#C7C5A3', // Couleur de fond générale
        },
        primary: {
            main: '#9E9C82', // Couleur primaire
        },
        secondary: {
            main: '#757460', // Couleur secondaire
        },
    },
});
export const EntreeDansLaVie = () => {
   
    const [joueur, setJoueur] = useState();
    const [mortText, setmortText] = useState();
    
    const setMort = cause=>{
        setmortText(cause);
        setJoueur(null);
    }
    return <ThemeProvider theme={theme}>
        {joueur==null? <CreationMode done={setJoueur}/>
        :<PersoProvider persoConf={joueur}>
        <ActiviteProvider enCasDeMort={setMort}>
           <BitUI />
        </ActiviteProvider>
    </PersoProvider>}
    <QuickDialog text={mortText} titre="Fin de vie" />
    </ThemeProvider>
}

export default EntreeDansLaVie;