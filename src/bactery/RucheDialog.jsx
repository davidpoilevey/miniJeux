

import React, { useMemo } from "react";
import { useSB } from "./SmartBactContext";

import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, List, ListItem, ListItemIcon, ListItemText, Typography } from "@mui/material";

import { allActions, useActions } from "./SBActions";
import { makeStyles } from "@mui/styles";
import { RSRC } from "./SmartRSRC";

const useStyles = makeStyles((theme) => ({
    dialogContent: {
        backgroundColor: '#fffbea', // Jaune très doux en fond
        padding: theme.spacing(4),
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', // Effet d'ombre pour un look plus moderne
    },
    title: {
        color: '#ffc107', // Un jaune plus vif pour le texte
        marginBottom: theme.spacing(3),
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
    },

    button: {
        backgroundColor: '#ffca28',
        color: '#fff',
        fontWeight: 'bold',
        '&:hover': {
            backgroundColor: '#ffa000',
        },
    },
    gridContainer: {
        marginTop: theme.spacing(3),
    },
}));

const RucheDialog = ({ openDialog, handleCloseDialog }) => {
    const { niveau, baseStock, centres } = useSB();
    const classes = useStyles();
    const { handleAction } = useActions();
    const actions = useMemo(() => {
        return allActions.filter(a => (a.niveau == null || (a.niveau === niveau && a.only || (a.niveau <= niveau && !a.only))))
            .map(ac => {
                let notEnoughRessources = false;
                for (let type in ac.couts) {
                    if (baseStock[type] == null || baseStock[type] < ac.couts[type])
                        notEnoughRessources = true;
                }
                if (ac.id.startsWith("creer") && centres.some(centre => ac.id.indexOf(centre.type) > 0))
                    notEnoughRessources = true;//disabled parce qu'existe deja
                return { ...ac, disabled: notEnoughRessources }
            })
    }, [niveau, baseStock.herbe, centres])

    return <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Gestion de la Base</DialogTitle>
        <DialogContent className={classes.dialogContent}>
            <Typography variant="h6" component="div" align="center" className={classes.title}>
                Ressources de la Ruche (Niveau {niveau})
            </Typography>
            <RappelRessources />
            <OrdreDeGroupe />
            <BoutonTriche/>
            <Grid container spacing={2} className={classes.gridContainer}>
                {actions.map((action, aidx) => {
                    return <Grid key={'a' + aidx} item xs={6}>
                        <Button variant="contained" color="primary"
                            disabled={action.disabled}
                            className={classes.button}
                            onClick={() => handleAction(action.id)}>
                            {action.text}
                        </Button>
                        <ActionCouts couts={action.couts} />
                    </Grid>
                })}

            </Grid>

        </DialogContent>
        <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
                Fermer
            </Button>
            {/* Boutons pour les actions */}
        </DialogActions>
    </Dialog>
}
export default RucheDialog;

const BoutonTriche=()=>{
    const {cheatCode} = useSB();
    return <Button onClick={cheatCode}>Cheat code</Button>
}
const OrdreDeGroupe = () => {
    const {getSkill, setSkill} = useSB();
    const {favori}=getSkill()
    const ordres = useMemo(() => {
        let ords = [];
        for (let type in RSRC) {
            ords.push(type)
        }
        return ords
    }, [RSRC]);
    const favoritize = choix=>{
        setSkill('favori', choix);
    }
    return <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems:'center', border:'1px solid red' }}>
        <Typography>Aller en priorité vers</Typography>
            {ordres.map((ordre, oidx) => {

                const RS = RSRC[ordre];
                const RessIcon = RS.icon;
                return <IconButton key={oidx} onClick={()=>favoritize(ordre)}>
                    <RessIcon sx={{color:favori==ordre?'#0040e3':'initial'}}/>
                </IconButton>
            })}
            {favori&&<Button  onClick={()=>favoritize(null)}>
                 Annuler
                </Button>}
        </Box>
    

}
const useListStyles = makeStyles((theme) => ({
    list: {
        marginBottom: theme.spacing(3),
        backgroundColor: '#fff9c4', // Fond légèrement plus foncé pour les ressources
        padding: theme.spacing(1),
        borderRadius: '8px',
        display: 'flex', justifyContent: 'space-around'
    },
    listItem: {
        padding: theme.spacing(1),
        borderBottom: '1px solid #ffe082',
    },
}));


export const RappelRessources = (props) => {
    const { baseStock } = useSB();
    const classes = useListStyles();
    return <Box className={classes.list}>
        {Object.entries(baseStock).map(([resource, quantity]) => {
            const RS = RSRC[resource];
            const RessIcon = RS.icon;
            return <Box key={resource} className={classes.listItem}>

                <RessIcon sx={{ color: RS.color }} />

                <Typography variant="body2">{quantity}</Typography>
            </Box>
        }

        )}
    </Box>
}
export const ActionCouts = ({ couts }) => {

    return <Box sx={{ display: 'flex', gap: 2 }}>
        {Object.keys(couts).map((c, cidx) => {
            const RS = RSRC[c];
            const RessIcon = RS.icon;
            return <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <RessIcon sx={{ color: RS.color }} />
                <Typography key={cidx}
                    variant="caption">{couts[c]}</Typography>
            </Box>
        })}

    </Box>
}