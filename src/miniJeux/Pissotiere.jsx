
import { Alert, AlertTitle, Box, Button, Typography } from "@mui/material"
import React, { useEffect, useMemo, useRef, useState } from "react";
import imgFond from './images/pissotiere.png';
import imgMechant from './images/mechantPisse.png';
import porteWC from './images/porteWC2.png';
import imgPerso from './images/persoPisse.png';
import imgPersoGo from './images/persoPisseGo.png';

const URINOIR_WIDTH = 60;
const BGWIDTH = 600;
const goToPos = idx => {
    switch (idx) {
        case 0: return 30;
        case 1: return 120;
        case 2: return 220;
        case 3: return 320;
        case 4: return 410;
        case 5: return 510;
        default: return 600;
    }
}
const REGLES = [
    { mec: [0, 4], soluce: 2, regle: 'Toujours au plus eloigné des intrus' }
    , { mec: [0, 1,  5], mechant: [2], soluce: 4, regle: 'A choisir, on evite les balezes' }
    , { mec: [1], soluce: 5, regle: 'Toujours au plus eloigné des intrus' }
    , { mec: [1, 4, 5], soluce: 0, regle: 'A choisir, le mur c\'est bien' }
    , { mec: [1,5], soluce: 3, regle: 'Bien vu au milieu' }
    , { mec: [0, 2, 4, 5], soluce: 1, regle: 'On evite de faire le plus gros troupeau' }
    , { mec: [3], soluce: 0, regle: 'Toujours au plus eloigné des intrus' }
    , { mec: [0, 1], mechant: [4], soluce: 2, regle: 'A choisir, on evite les balezes' }
    , { mec: [0, 3], soluce: 5, regle: 'Ici c\'etait safe' }
    , { mec: [0,5], mechant: [2,3], soluce: 4, regle: 'En cas de danger, pres de la porte' }
    , { mec: [], mechant: [0,5], soluce: 3, regle: 'On combine: au plus eloigné et en cas de danger,pres de la porte' }
    , { mec: [], soluce: 0, regle: 'Le piege, quand y a personne, on se met au plus loin' }
]
const Pissotiere = () => {
    const [regleIndex, setregleIndex] = useState(0);
    const [explicationDeRegle, setexplicationDeRegle] = useState();
    const [success, setSuccess] = useState(false);
    const [persoPos, setpersoPos] = useState(BGWIDTH);
    const [urinoirs, setUrinoirs] = useState([{ left: 30 }, { left: 120 }, { left: 220 }, { left: 320 }, { left: 410 }, { left: 510 }]);

    const regle = REGLES[regleIndex];
    const nextRegle = () => {
        if(regleIndex>=(REGLES.length-1))
            setregleIndex(0);// on boucle, y a jamais de fin
        else
            setregleIndex(r => r + 1);
        setexplicationDeRegle(null);
        setpersoPos(BGWIDTH);
        setUrinoirs(urs => {
            return urs.map(ur => ({ ...ur, good: false, bad: false }));
        })
    }
    const pisseurs = useMemo(() => {
        const mecs = [];
        regle.mec.forEach(uIdx => {
            mecs.push({ left: goToPos(uIdx) })
        })
        regle.mechant?.forEach(uIdx => {
            mecs.push({ left: goToPos(uIdx), type: 'mechant' })
        })
        return mecs;
    }, [regleIndex]);
    const cliqueUrinoir = pidx => {
        if(explicationDeRegle!=null)
            return;
        setpersoPos(goToPos(pidx));
        setSuccess(regle.soluce === pidx);
        setUrinoirs(ur => {
            return ur.map((u, uidx) => ({
                ...u, good: regle.soluce === uidx
                , bad: uidx === pidx && regle.soluce !== uidx
            }))
        })
        setexplicationDeRegle(regle.regle);
    }

    return <Box sx={{ width: '100%', height: '100%' }}>
        {explicationDeRegle != null? <Alert  severity={success ? 'success' : 'error'}>
            <AlertTitle>{success ? "Bravo" : "Helas"}
            </AlertTitle>
            <Typography variant="h5">{explicationDeRegle}</Typography>
        </Alert>:
         <Alert  severity="info">
         <AlertTitle>Ca urge
         </AlertTitle>
         <Typography variant="h5">Choisissez vite un pissoir</Typography>
     </Alert>
        }
        <Box sx={{ height: '100%', display: 'flex', alignItems:'center', justifyContent:'space-between' }}>
            <Box sx={{position:'absolute', left:BGWIDTH+20, top:200}}>
                <img src={porteWC}  style={{ width: 170, height:260 }} alt="portewc"/>
            </Box>
            <Box sx={{
                backgroundImage: `url(${imgFond})`, backgroundSize: 'contain', backgroundPosition: '0px 36px', backgroundRepeat: 'no-repeat'
                , height: '100%', width: BGWIDTH
                , position: 'relative'
            }}>
                <PersoSprite left={persoPos} />
                {pisseurs.map((p, pidx) => {
                    return <Pisseur key={'p' + pidx} {...p} />
                })}
                {urinoirs.map((p, pidx) => {
                    return <Urinoir key={'u' + pidx} index={pidx}

                        onClick={evt => { cliqueUrinoir(pidx) }} {...p} />
                })}
            </Box>
           
            <Button variant="contained" sx={{height:100, marginRight:10}}
            onClick={nextRegle}>prochaine regle</Button>
        </Box>

    </Box>
}
export default Pissotiere;
const PersoSprite = ({ left }) => {
    return <Box sx={{ position: 'absolute', top: 281, left: left, transition:`left 0.5s ease-in` }}>
        <img alt="perso" src={imgPerso} style={{ width: 118 }} />
    </Box>
}

const Urinoir = ({ left, index, onClick, good, bad }) => {
    const lightBorder = useMemo(() => {
        let border = null;
        if (good)
            border = '8px ridge green';
        if (bad)
            border = '8px groove red';
        return border;

    }, [good, bad])
    return <Box sx={{
        position: 'absolute', top: 206, left: left, width: URINOIR_WIDTH
        , height: 200, border: lightBorder
    }}
        onClick={onClick}>
    </Box>
}

const Pisseur = ({ left, type }) => {
    return <Box sx={{ position: 'absolute', top: type == 'mechant' ?221:191, left: left }}>
        <img alt="perso" src={type == 'mechant' ? imgMechant : imgPersoGo} style={{ width: type == 'mechant' ?100:118 }} />
    </Box>
}