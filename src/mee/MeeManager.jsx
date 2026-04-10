import React, { useState, useEffect, useRef } from "react";
import {
    phaseMaison,
    phaseDepart,
    phaseVerger,
    phaseRetour,
    meeColorFromADN,
    nouvelleMeteo,
    newEnfant,
    // ...autres utilitaires
} from "./meeUtils";
import MeeBoard from "./MeeBoard";
import { Box, Button, IconButton, TextField, Typography } from "@mui/material";
import { ADNHandler, randomGenome } from "../genetic/ADNPlante";
import HistoryPanel from "./HistoryMee";
import { Pause, PlayArrow, Restore, Settings } from "@mui/icons-material";
import MeeSetting from "./MeeSettings";
import useShowAlert from '../jds/components/Message';
import ButtonDPY from "../bitLife/ui/ButtonDPY";


const LATENCE = 200;

const initializeMees = (NB_MEE, VERGER_WIDTH, ESPERANCE_VIE) => {
    const allMees = [];
    for (let m = 0; m < NB_MEE; m++) {
        const adn = randomGenome();
        const adnHandler = new ADNHandler(adn);
        // Initialisation de la confiance envers les autres Mee
        const confianceInit = {};
        for (let n = 0; n < NB_MEE; n++) {
            if (n !== m) confianceInit[n] = 0.5;
        }
        const mee = newEnfant({
            id: m, adnHandler: adnHandler
            , maisonId: null,
            x: VERGER_WIDTH / NB_MEE * m,
            y: 0, confiance: confianceInit, ageMax: adnHandler.read10('ageMax') + ESPERANCE_VIE
        })

        allMees.push(mee);
    }
    return allMees;
}

const MeeManager = ({ }) => {
    const [mees, setMees] = useState([]);
    const [params, setParams] = useState({
        COUT_SURPOP : 1.1,
        VERGER_WIDTH: 500,
        VERGER_HEIGHT: 600,
        ESPERANCE_VIE: 15,
        seuilRepro: 6,
        PETITE_CONFIANCE: 0.02,
        MOYENNE_CONFIANCE: 0.05,
        GRANDE_CONFIANCE: 0.1,
        SEUIL_ALLIANCE: 0.6,
        probaBaseRepro: 0.6,
    });
    const [phase, setPhase] = useState("depart");
    const [nbMee, setNbMee] = useState(12);
    const [meteo, setMeteo] = useState({});
    const [openParam, setOpenParam] = useState(false);
    const { showAlert, SnackbarComponent } = useShowAlert();

    const stateUpdate = useRef(0);
    const nextId = useRef(0);
    const setPhaseAndUpdate = (newMees, newPhase) => {

        setPhase(newPhase);
        setMees(oldMees => {
            return oldMees.map(mee => {
                const updatedMee = newMees.find(m => m.id === mee.id);
                if (updatedMee != null) {
                    return { ...mee, x: updatedMee.x, y: updatedMee.y }
                }
                return mee;
            })
        });
        stateUpdate.current++;
    }
    //init au changement de nbMee
    useEffect(() => {
        reset();
        setMeteo(nouvelleMeteo());
        // eslint-disable-next-line
    }, [nbMee]);

    const reset = () => {
        const allMees = initializeMees(nbMee, params.VERGER_WIDTH, params.ESPERANCE_VIE);
        nextId.current = allMees.length + 1;
        setPhase('depart');
        setMees(allMees);
    };
    // Changement de phase
    useEffect(() => {
        if (mees.length === 0) return;
        let newMees = JSON.parse(JSON.stringify(mees));
        const startTime = (new Date()).getTime();
        switch (phase) {
            case "maison":
                const facteurSurpop = mees.length / nbMee;
                const coutSurvieEffectif = meteo.coutSurvie * (params.COUT_SURPOP + (facteurSurpop - 1));
                newMees = phaseMaison(newMees, nextId, coutSurvieEffectif, params);
                 break;
            case "depart":
                if (meteo.nom === 'Neige' || meteo.nom === 'Canicule' || Math.random() < 0.35)
                    setMeteo(nouvelleMeteo());//le temps peut rester le meme 3 jours d'affilee en moyenne
                newMees = phaseDepart(newMees, nbMee, params);
                break;
            case "verger":
                newMees = phaseVerger(newMees, meteo);
                break;
            case "retour":
                newMees = phaseRetour(newMees, params);
                break;
            default:
                break;
        }

        setMees(newMees);
        stateUpdate.current++;
        // eslint-disable-next-line
    }, [phase]);
    const handleMeeAction = (action) => {
        showAlert(action.label + ' : ' + action.description)
        // thanos, disette, blizzard, favoriserClan, tuerMee, bisounours, enfer, social
        if(action.key==='disette'){
            setParams({...params, COUT_SURPOP:1.5})
        }
        if(action.key==='blizzard'){
            setMeteo( { nom: "Tempete de neige", coutSurvie: 3, bonusPommes: -2.5, background: `#eee`, proba: 0.1 }, )
        }
        if(action.key==='favoriserClan'){
           showAlert('pas encore fait')
        }
        if(action.key==='tuerMee'){
           showAlert('pas encore fait')
        }
        if (action.key === 'thanos') {
            setMees(mees.filter(mee => (Math.random() > 0.5)))
        }
        if (action.key === 'bisounours') {
            setMees(oldmees => {
                return oldmees.map(mee => {
                    return {
                        ...mee, propCooperation: Math.min(1, mee.propCooperation + 0.2)
                        , reputation: Math.min(1, mee.reputation + 0.4)
                    }
                });
            });
        }
        if (action.key === 'social') {
            setMees(oldmees => {
                return oldmees.map(mee => {
                    return {
                        ...mee, sociabilite: Math.min(1, mee.sociabilite + 0.2)
                        , propTrahison: Math.max(0, mee.propTrahison - 0.2)
                    }
                });
            });
        }
        if (action.key === 'enfer') {
            setMees(oldmees => {
                return oldmees.map(mee => {
                    return {
                        ...mee, propTrahison: Math.min(1, mee.propTrahison + 0.2)
                        , propCooperation: Math.max(0, mee.propCooperation - 0.1)
                    }
                });
            });
        }
    }
    const timeoutRef = useRef();
    // Automatisation des transitions
    useEffect(() => {
        // Nettoie les timeouts précédents
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        if (phase === "verger") {
            // Passe à "retour" après 200ms
            timeoutRef.current = setTimeout(() => setPhase("retour"), LATENCE);
        } else if (phase === "maison") {
            // Passe à "depart" après 200ms
            timeoutRef.current = setTimeout(() => setPhase("depart"), LATENCE);
        }
        // Pas d'automatisation pour "depart" → "verger" (gérée par l'animation)
        // Pas d'automatisation pour "retour" → "maison" (à ajouter si besoin)
        return () => clearTimeout(timeoutRef.current);
    }, [phase, setPhase]);

    return <Box sx={{
        height: '100%', display: 'flex'
        , background: 'linear-gradient(180deg,rgb(253, 245, 162) 0%,rgb(244, 146, 34) 100%)'
    }}>

        <Box>
            <MeeBoard initialMee={mees} phase={phase} meteo={meteo}
                setPhase={setPhase} setPhaseAndUpdate={setPhaseAndUpdate}
                VERGER_WIDTH={params.VERGER_WIDTH} VERGER_HEIGHT={params.VERGER_HEIGHT} ESPERANCE_VIE={params.ESPERANCE_VIE} />

            {/* Boutons de contrôle */}
            <Box sx={{ display: 'flex', gap: 3 }}>

                <IconButton disabled={phase === 'pause'} variant="contained"
                    onClick={() => setPhase("pause")}><Pause /></IconButton>
                <IconButton disabled={phase !== 'pause'} variant="contained"
                    onClick={() => setPhase("depart")}><PlayArrow /></IconButton>
                <IconButton onClick={() => { reset() }} color="secondary"><Restore /></IconButton>
                <Box sx={{ display: 'flex', maxWidth: 120, alignItems: 'center' }}>
                    <Typography sx={{ textWrapMode: 'nowrap' }}>{mees.length} /</Typography>
                    <TextField label="Nombre de mees" value={nbMee} type="number" onChange={evt => {
                        setNbMee(evt.target.value);
                    }}></TextField>
                </Box>
                <ButtonDPY onClick={setOpenParam} >GOD mode</ButtonDPY>
              
                <MeeSetting
                    open={openParam}
                    onClose={() => setOpenParam(false)}
                    values={params}
                    onChange={setParams}
                    onAction={handleMeeAction}
                />
            </Box>
        </Box>
        <HistoryPanel mees={mees} />
        {SnackbarComponent}
    </Box>
};

export default MeeManager;
