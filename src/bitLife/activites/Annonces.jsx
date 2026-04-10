import React, { useEffect, useMemo, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import ButtonDPY from '../ui/ButtonDPY';
import { Alert, Box, Typography, useTheme } from '@mui/material';
import { Job, Jobs } from './Jobs';
import { getRandomAccroches } from '../utils/amiUtils';
import { useEvents } from '../events/Evenements';
import { usePerso } from '../personnages/BitLife';

export const AnnoncesDialog = ({ type,nouveauJob, plutotCeMessage, ...props }) => {
    // 4 types possible : bureau, service, industrie, exception
    const [open, setOpen] = useState(false);
   
    const [currentJob, setCurrentJob] = useState();
    const theme = useTheme();
    const jobDispo = useMemo(() => {
        if (type == null)
            return [];
        let allJobs=[];
        if (type === 'all')
         {
            for(let t of Object.keys(Jobs)){
                allJobs=allJobs.concat(Jobs[t]);
            }
         }
        const metiers = type == 'all'?allJobs:Jobs[type];
        const petitesAnnonces = []
        // instancier des variante des metiers de base
        metiers.forEach(metier => {

            const ptitAnnonce = new Job(metier);
            petitesAnnonces.push(ptitAnnonce);
        })
        return petitesAnnonces;

    }, [type]);
    useEffect(() => {
        setOpen(type != null);
    }, [type]);
    const handleClose = () => {
        setOpen(false);

    };

    const handleOK = () => {
        setOpen(false);
    };

    const { simpleMessage } = useEvents();
    const [phrasesDaccroche, setphrasesDaccroche] = useState();
    const alors = () => {
        const success = Math.random() > 0.5
        let msgSuccess = '';
        if (success) {
            msgSuccess = `Felicitations, vous etes embauché comme ${currentJob.nom}
        dans la societe ${currentJob.nomSociete} pour un salaire de ${currentJob.salaire * 100} euros par mois`;
            nouveauJob(currentJob);
            //addLog(msgSuccess);
        } else {

            msgSuccess = `La société ${currentJob.nomSociete} est au regret de vous dire que vous ne convenez pas
         pour le poste de ${currentJob.nom} , mais nous vous remercions de l'interet que vous nous avez porté`;

        }
        if(plutotCeMessage!=null)
            plutotCeMessage(msgSuccess);
        else
            simpleMessage(msgSuccess);
        handleClose();
        setphrasesDaccroche(null);//pour effacer les choix
    }

    const sendCV = (job) => {
        setCurrentJob(job);
        setphrasesDaccroche(getRandomAccroches(null, true, true)[0]);
    }

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle sx={{ backgroundColor: theme.palette.background.paper }}>Annonces de {type}</DialogTitle>
            <DialogContent sx={{ padding: '10px', backgroundColor: theme.palette.background.default }}>
                {phrasesDaccroche != null ? <>
                    <Typography variant='caption'>A l'entretien d'embauche on vous pose cette question</Typography>
                    <Typography variant='h6'>{phrasesDaccroche.question}</Typography>
                    {phrasesDaccroche.options.map((ph, idx) => {
                        return <ButtonDPY key={idx} style={{margin:'10px'}}
                         onClick={evt => { alors() }}>{ph}</ButtonDPY>
                    })}
                </>
                    : (jobDispo.map(job => {
                        return <JobCard job={job} key={job.nom} sendCV={() => { sendCV(job) }} />
                    }))}


            </DialogContent>
            <DialogActions sx={{ backgroundColor: theme.palette.background.paper, gap:'10px' }}>

                <ButtonDPY onClick={handleOK} color="primary" >
                    D'accord
                </ButtonDPY>


            </DialogActions>
        </Dialog>
    );
};


const JobCard = ({ job, sendCV }) => {
    let notPossible=null;
   
    const persoHook = usePerso();
    if(persoHook!=null){
        const perso = persoHook.perso
    const periode=perso.getAgePeriode();
    if(job.prerequis!=null){
        for(let prereq in job.prerequis){
            if(prereq==='fullTime' && periode!=='adulte')
                notPossible="C'est un metier a plein temps, vous avez encore la fac a suivre...";
            if(prereq==='voiture' && perso.perso.possessions.find(p=>p.nom==='voiture')==null)
                notPossible="Une voiture est necessaire pour exercer ce metier";
            if(prereq==='diplome'){
                const wantedDiplome = job.prerequis[prereq];
                if(perso.perso.diplomes.indexOf(wantedDiplome)<0)
                    notPossible="Vous n'avez pas le diplome necessaire ("+wantedDiplome+")";
            }
            if(prereq==='intelligent'){
                if(perso.perso.caractere.intelligent<job.prerequis[prereq])
                notPossible="Vous n'avez pas le QI suffisant pour ce job ("+job.prerequis[prereq]+" en intelligence)";
            }
            if(prereq==='pervers'){
                if(perso.perso.caractere.pervers<job.prerequis[prereq])
                notPossible="Vous n'avez pas la lubricité necessaire pour ce job ("+job.prerequis[prereq]+" en perversite)";
            }
            if(prereq==='argent'){
                if(perso.perso.argent<job.prerequis[prereq])
                notPossible="Vous n'avez pas les fonds necessaires ("+job.prerequis[prereq]+"euros)";
            }
        }
    }
}
    // branche, nom, description, nbPersonnes, promotion, rangs, image, salaire, activites
    return <Box sx={{ display: 'flex', flexDirection: 'column' , padding:2, margin:2, backgroundColor:'cornsilk'}}>
        <Box>
        <Typography>Branche {job.branche}</Typography>
            <Typography variant="h6">{job.nom}</Typography>
            <Typography variant="body2" color="textSecondary">
                {job.description}
            </Typography>
        </Box>

        <Typography variant='caption'>La société {job.nomSociete} recherche activement H/F pour un poste
            de {job.nom}. La remuneration attractive est de {job.salaire * 100} euros par mois, sans compter les tickets restaus</Typography>

        {notPossible==null?<ButtonDPY onClick={sendCV}>Postuler</ButtonDPY>
                :<Alert severity='warning'>{notPossible}</Alert>}

    </Box>
}

