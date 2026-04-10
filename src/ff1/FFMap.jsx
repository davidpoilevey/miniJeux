import { Alert, AlertTitle, Avatar, Box, Button, Card, CardActions, CardContent, CardHeader, CardMedia } from "@mui/material";
import React from "react";
import { Lieux, useLieux } from "./LieuxProvider";
import { usePerso } from "./PersoProvider";
import imgBois from './images/fondBois.jpg';
import { makeStyles } from "@mui/styles";
/**
 * point d'interet = {
 *      id: 'le nom du point'
 *      , image : '' // une image
 *      , text: '' // une description
 *      , actions : [] // actions possibles 
 * }
 * 
 * action = {
 *      text : 'le texte de l'action a faire
 *      , condition : {} // conditions a remplir pour que la mission soit disponible
 *      , consequence : {} // les consequences
 * }
 * 
 * consequence = ... dans LieuxProvider
 * 
 * 
 * mission = ... dans ConsequenceDialog
 * 
 */

export const FFMap = () => {
    const { currentLieu } = useLieux();
    const imageStyle = { display:'flex', alignItems:'start',justifyContent:'space-evenly', flex: 1, flexWrap:'wrap'
        , backgroundSize: 'cover' };
    const lieuObj = Lieux[currentLieu];


    if (lieuObj == null)
        return <Alert severity="warning"><AlertTitle>Lieu non defini</AlertTitle>Le lieu {currentLieu} n'existe pas</Alert>;
    if (lieuObj.image != null)
        imageStyle.backgroundImage = 'url(' + lieuObj.image + ')';
    return <Box style={imageStyle}>
        {lieuObj.pointsInteret.map(pi => {
            return <PointDInteret key={pi.id} value={pi} />
        })}
    </Box>;
};


const useStyles = makeStyles((theme) => ({
    card: {
      maxWidth: 400,
      margin: '10px',
      backgroundSize:'cover',
      backgroundImage: `url(${imgBois})`,
    },
    header: {
        color: theme.palette.secondary.contrastText,
        fontSize:'18px',fontWeight:'bold'
    },
    actions: {
      justifyContent: 'space-between',
    },
    button: {
      backgroundColor: theme.palette.secondary.main,
      color: theme.palette.secondary.contrastText,
      '&:hover': {
        backgroundColor: theme.palette.secondary.dark,
      },
    },
  }));
const PointDInteret = ({ value }) => {
    const { conditionsOK, applyConsequence } = usePerso();
    const classes = useStyles();
    return <Card className={classes.card}>
        <CardHeader disableTypography
            className={classes.header} avatar={<Avatar variant="square" src={value.image}/>} 
        title={value.text??value.id}></CardHeader>
       
        <CardContent>

        </CardContent>
        <CardActions style={{flexDirection:'column'}}>
            {value.actions?.map((action,idx) => {
                if (!conditionsOK(action.condition))
                    return null;
                return <Button variant="contained" key={idx} onClick={evt => { applyConsequence(action.consequence) }}>
                    {action.text}
                </Button>
            })}
        </CardActions>
    </Card>
}