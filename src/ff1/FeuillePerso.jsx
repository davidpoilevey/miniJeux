import React, { useMemo } from 'react';
import { Grid, Avatar, Typography } from '@material-ui/core';
import { Accordion, AccordionDetails, AccordionSummary, Badge, Box, Button, IconButton, LinearProgress, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Popover } from '@mui/material';

import { Expand, ExpandMore, Info } from '@mui/icons-material';
import { usePerso } from './PersoProvider';
import { Loot } from './LootItems';
import { useLog } from './LogProvider';

const PossessionDetail = ({ item }) => {
    // content du popover: id text image valeur nombre
    const {addPossession,applyConsequence} = usePerso();
    const {addLog} = useLog();
    const jete = ()=>{

        addPossession({[item.id]:-1});
    }
    const utilise = ()=>{
        if(item.effet==null){
            addLog("Cet objet n'a aucun effet");
        }
        else{
            applyConsequence(item.effet);
        }
        jete();
    }
    return <Box style={{display:'flex', flexDirection:'row'}}>
        <Box style={{display:'flex', flexDirection:'column',margin:'10px'}}>
            <Box display="flex">
                <img src={item.image} height={50} />
                <Typography variant="h6">{item.text}</Typography>
            </Box>
            <Typography variant="body1">Valeur : {item.valeur}</Typography>
            <Typography variant="body2">Nombre : {item.nombre}</Typography>
        </Box>
        <Box style={{display:'flex', flexDirection:'column'}}>
            <Button onClick={utilise}>Utilise (consommer)</Button>
            <Button onClick={jete}>Jeter</Button>
        </Box>
    </Box>
}
const Possession = ({ item, openPossession, nombre = 0 }) => {
    const objet = Loot.get(item);
    return <ListItem secondaryAction={
        <IconButton aria-label="comment" onClick={evt => { openPossession(evt, objet, nombre) }}>
            <Info />
        </IconButton>
    }>
        <ListItemIcon><img src={objet.image} height={50} alt={item} /></ListItemIcon>
        <ListItemText>{objet.text} : {nombre} x {objet.valeur}</ListItemText>

    </ListItem>
}
const FeuillePerso = () => {
    const { perso } = usePerso();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [currentItem, setCurrentItem] = React.useState(null);

    const openPopover = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    const possessions = useMemo(() => {

        const openPossession = (evt, item, nb) => {
            openPopover(evt);
            setCurrentItem({ ...item, nombre: nb });
        }
        const items = Object.keys(perso.possessions);
        const poss = <List>
            {items.map(item => {
                return <Possession key={item} item={item} openPossession={openPossession}
                    nombre={perso.possessions[item]} />
            })}
        </List>
        return poss;
    }, [perso])
    return (
        <Box style={{display:'flex',flexDirection:'column', flex:1}}>
            {/* En haut de la grille */}
            <Box style={{display:'flex'}}>
                {/* Avatar du personnage */}
             
                    <Avatar src={perso.avatar} alt={perso.nom} />
             
             
                    <Typography variant="h6">{perso.nom}</Typography>
               
                <Box>
                    <Box style={{display:'flex', justifyContent:'end', alignItems:'center',gap:3}}>
                        <Typography variant="body1">Santé</Typography>
                        <LinearProgress value={perso.vie * 5} variant="determinate"
                            color="primary"
                            sx={{ height: '20px', width: '200px' }} />
                        <Typography variant="body1">{perso.vie}</Typography>
                    </Box>
                    <Box  style={{display:'flex', justifyContent:'end', alignItems:'center',gap:3}}>
                        <Typography variant="body1">Bonheur</Typography>
                        <LinearProgress value={perso.bonheur * 5} variant="determinate"
                            color="secondary"
                            sx={{ height: '20px', width: '200px' }} />
                        <Typography variant="body1">{perso.bonheur}</Typography>
                    </Box>
                 </Box>
            </Box>

            {/* En bas de la grille */}
            
                {/* Caractéristiques */}
                <Box style={{ display: "flex", height: '100%', overflow: 'auto' }}>
                    <Box>

                        <Typography variant="h6">Caractéristiques</Typography>
                        {/* Insérez ici la logique pour afficher les caractéristiques du personnage */}
                        <List>
                            <ListItem>Force : {perso.force}</ListItem>
                            <ListItem>Dexterite : {perso.dexterite}</ListItem>
                            <ListItem>Intelligence : {perso.intelligence}</ListItem>
                            <ListItem>Charisme : {perso.charisme}</ListItem>
                        </List>
                    </Box>
                    <Box>
                        <Accordion>
                            <AccordionSummary expandIcon={<ExpandMore />} >
                                <Badge badgeContent={perso.missions.length} color="error">
                                    <Typography variant="h5">Missions en cours</Typography>
                                </Badge>
                            </AccordionSummary>
                            <AccordionDetails>

                                {/* Insérez ici la logique pour afficher les missions en cours du personnage */}
                                {perso.missions.map((mission, midx) => {
                                    return <Typography key={midx} variant='body2'>{mission.text}</Typography>
                                })}
                            </AccordionDetails>
                        </Accordion>
                        <Accordion>
                            <AccordionSummary expandIcon={<ExpandMore />} >
                                <Badge color="success"
                                    badgeContent={Object.keys(perso.possessions).length}>
                                    <Typography variant="h5">Possessions</Typography>
                                </Badge>
                            </AccordionSummary>
                            <AccordionDetails>
                                {possessions}

                                <Popover
                                    open={open}
                                    anchorEl={anchorEl}
                                    onClose={handleClose}
                                    anchorOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'left',
                                    }}
                                >
                                    <PossessionDetail item={currentItem} />
                                </Popover>
                            </AccordionDetails>
                        </Accordion>
                        <Accordion>
                            <AccordionSummary expandIcon={<ExpandMore />} >
                                <Badge badgeContent={perso.connaissances.length}>
                                    <Typography variant="h5">Connaissances</Typography>
                                </Badge>
                            </AccordionSummary>
                            <AccordionDetails>
                                {perso.connaissances.map((mission, midx) => {
                                    return <Typography key={midx} variant='h6'>{mission}</Typography>
                                })}
                            </AccordionDetails>
                        </Accordion>
                    </Box>

                </Box>



        </Box >
    );
};

export default FeuillePerso;
