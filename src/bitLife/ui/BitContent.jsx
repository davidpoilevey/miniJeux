
import { useState } from "react";
import { AccordionContent } from "./AccordionContent";
import { Box, Typography, useTheme } from '@mui/material';
import { usePerso } from "../personnages/BitLife";
import PersonneCard from "./PersonneCard";
import PNJDialog from "../personnages/PNJDialog";
import { ActiviteButton } from "../activites/ActiviteButton";


const BitContent = ({ perso, lieuObj }) => {


    if (lieuObj == null)
        return null;
    return (
        <AccordionContent lieu={lieuObj}>

        </AccordionContent>

    );
};
export default BitContent;


export const ActiviteList = ({ lieu }) => {
    // activite is Activite (voir BaseDevent)
    const activites = lieu.getActivites();
    return <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'start',padding:'10px',minWidth:250,  gap: '15px'
    ,overflow:'auto', height:'80vh' }}>
        {activites.map((activite, index) => (
            <ActiviteButton key={index} activite={activite} />
        ))}
    </Box>
};

export const PersonneList = ({ lieu }) => {
    // Logique spécifique pour l'onglet "Personnes"
    const { perso } = usePerso();
    const [openPersonne, setOpen] = useState(false);
    const [currPnj, setCurrPNJ] = useState();
    const theme = useTheme();
    const typoStyle = {backgroundColor:theme.palette.background.paper, borderRadius:'5px',padding:'10px'};
    const famille = perso.getFamille();
   // const personnes = (lieu.type === 'maison')?famille.concat(perso.getAmis()):lieu.getPeople();
    const personneCards = ()=>{

        if(lieu.type==='maison'){
            return <Box>
                <Typography variant="h6" color="text.secondary" sx={typoStyle}>Famille</Typography>
                <>{famille.map((pnj, index) => (
                <PersonneCard key={index} perso={pnj} onClick={(evt) => { setOpen(evt); setCurrPNJ(pnj); }} />
    
            ))}</>
             <Typography variant="h6" color="text.secondary" sx={typoStyle}>Amis</Typography>
                <>{perso.getAmis().map((pnj, index) => (
                <PersonneCard key={index} perso={pnj} onClick={(evt) => { setOpen(evt); setCurrPNJ(pnj); }} />
    
            ))}</>
            </Box>
        }
        else{
           return <>{lieu.getPeople().map((pnj, index) => (
                <PersonneCard key={index} perso={pnj} onClick={(evt) => { setOpen(evt); setCurrPNJ(pnj); }} />
    
            ))}</>;
        }
    };
    return <Box sx={{
        display: 'flex', flexWrap: 'wrap',overflow:'auto',
        gap: 3, // Espacement entre les Card
        justifyContent: 'space-evenly',alignItems:'start'
    }}>

       {personneCards()}
        <PNJDialog open={openPersonne} pnj={currPnj} />
    </Box>
};

