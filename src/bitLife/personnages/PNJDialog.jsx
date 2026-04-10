
import { Avatar, Box, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material"
import React, { useEffect, useMemo, useState } from "react"
import ButtonDPY from "../ui/ButtonDPY";
import { RelationStatus } from "../ui/PersonneCard";
import { usePerso } from "./BitLife";
import QuickDialog from "../utils/QuickDialog";
import { getRandomAccroches } from "../utils/amiUtils";
import { ActiviteButton } from "../activites/ActiviteButton";
import StatComponent from "../utils/StatComponent";
import { useEvents } from "../events/Evenements";
import { Ami } from "./PNJ";

const PNJDialog = ({ pnj, open }) => {
    const [isOpen, setOpen] = useState(open);
    const { perso: joueur } = usePerso();
    // const [currPnj, setCurrPNJ] = useState();
    useEffect(() => {
        setOpen(Boolean(open));
    }, [open]);
    // const handleClose=()=>{
    //     setCurrPNJ(null);

    // }
    const amiPnj = pnj!=null?joueur.findAmi(pnj):null;
    if(amiPnj!=null)
        pnj=amiPnj;// on prend la version la + recente
const isFamille = useMemo(()=>{
    if(joueur==null||pnj==null)
        return false;
    return joueur.getFamille().find(f=>f.nom===pnj.nom);
},[joueur,pnj]);
    if (pnj == null)
        return null;
    return <Dialog open={isOpen}>
        <DialogTitle>{pnj.nom}</DialogTitle>
        <DialogContent sx={{ minHeight:'230px'}} >
            {pnj.titre != null && <Typography variant="h4">{pnj.titre}</Typography>}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '5px'}}>

                <Box sx={{ display: 'flex', flexDirection: 'row', gap: '5px' }}>
                    <PNJIcon pnj={pnj} />
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography>Age:{pnj.etatCivil.age}</Typography>
                    </Box>
                    <RelationStatus status={joueur.perso.connaissances[pnj.nom]}/>
                </Box>
                <StatComponent persoData={pnj}/>
               
            </Box>
        </DialogContent>
        <DialogActions sx={{display:'flex',flexDirection:'column',alignItems:'stretch',gap:'12px',padding:'25px'}}>
            {amiPnj == null && isFamille==null && <SoisMonAmi perso={joueur} pnj={pnj} />}
            {pnj.getActivites().map(actv=>{
                return <ActiviteButton key={actv.nom} activite={actv} pnj={pnj}/>
            })}
            <ButtonDPY type="close" onClick={() => { setOpen(false); }} color="primary">
                Fermer
            </ButtonDPY>
        </DialogActions>
    </Dialog>
}

export default PNJDialog;


export const PNJIcon = ({ pnj, ...props }) => {
    const icon = pnj.getIcon();
    return <Avatar src={require(`../images/${icon}`)} {...props} />
}


const SoisMonAmi = ({ pnj, perso }) => {
    const [dlgText, setdlgText] = useState();
    const { savePerso, replaceIfoundInLieu } = usePerso();

  const { simpleMessage} = useEvents();
    const [phrasesDaccroche, setphrasesDaccroche] = useState([]);
    useEffect(() => {
        setphrasesDaccroche(getRandomAccroches(perso, pnj));
    }, []);
    const askAmi = () => {
        setdlgText(`Vous avez demander a ${pnj.nom} d'etre son ami.\n Quelle phrase d'accroche choisissez-vous ?`);
    }
    const alors = (success) => {
        if (success) {
            const nouvelAmi = new Ami(pnj);
            perso.addAmi(nouvelAmi);
            // changer dans le lieu ou il existe aussi
            replaceIfoundInLieu(pnj, nouvelAmi);
            simpleMessage(`${pnj.nom} est maintenant votre ami`);

        } else {
            setdlgText(`${pnj.nom} vous a mis un vent`);
            perso.setRelationStatus(pnj, -20);
        }
        savePerso({ ...perso });
        setphrasesDaccroche([]);//pour effacer les choix
    }


    return <>
        <QuickDialog titre="Sois mon ami" text={dlgText}>
            {phrasesDaccroche.map((ph,idx) => {
                return <ButtonDPY key={idx} onClick={evt => { alors(ph.success) }}>{ph.text}</ButtonDPY>
            })}
        </QuickDialog>
        <ButtonDPY onClick={evt => { askAmi() }}>Demander a etre son ami</ButtonDPY>
    </>

}