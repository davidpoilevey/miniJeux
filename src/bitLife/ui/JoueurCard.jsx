import React, { useEffect, useMemo, useState } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';

import { PNJIcon } from '../personnages/PNJDialog';
import { Avatar, CardActions, CardContent, Collapse, Icon, IconButton, Typography, useTheme } from '@mui/material';
import StatComponent from '../utils/StatComponent';
import { ExpandLess, ExpandMore } from '@mui/icons-material';

const JoueurCard = ({ perso }) => {
    const { perso: p, nom, titre } = perso;
    const [expanded, setExpanded] = useState(false);
const theme = useTheme();
    const handleExpandClick = () => {
        setExpanded(!expanded);
    };
    return (
        <Card sx={{ minWidth: 200 ,display:'flex',flexDirection:'column',alignItems:'end'}} >

            <CardHeader
                avatar={<PNJIcon pnj={perso} />}
                title={<><Typography sx={{wrap:'no-wrap'}}>{p.etatCivil.nom} {p.etatCivil.age}ans</Typography>
                </>}
                subheader={p.titre}
                action={
                    <IconButton
                        aria-expanded={expanded}
                        aria-label="Voir les statistiques"
                        onClick={handleExpandClick}
                    >
                        {expanded?<ExpandLess/>:<ExpandMore />}
                    </IconButton>
                }
            />
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <CardContent  sx={{backgroundColor:theme.palette.background.default}}>
               
                    <StatComponent persoData={p} isJoueur />
                </CardContent>
            </Collapse>
            <CardActions>

                <JoueurActions />

            </CardActions>
        </Card>
    );
};

export default JoueurCard;

const JoueurActions = () => {
    return null;
}