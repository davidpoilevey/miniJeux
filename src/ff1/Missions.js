
import { Box, Button, Paper, Typography } from "@mui/material";
import React from "react";

/** MISSION=
 * {                               id : id de la mission (le meme que la key)
                                text:'text de la mission'
                                , choix : [] // liste d'actions possible
                                , conditions:{  } // condition necessaires pour accomplir la mission
                                , recompense:{  } // consequence d'une mission reussie
                            }
 */
                           export const Missions = {
                                chatCroquettes:{
                                    id:'chatCroquettes',
                                    text:'Trouver des croquettes'
                                    , conditions:{
                                        possessions:{croquettes:10}
                                    }
                                    , recompense:{
                                        text:'Il roucoule de remerciement et se frotte a votre jambe'
                                        , bonheur:1
                                        ,  possessions:{croquettes:-10}
                                    }
                                }
                                , putasse:{
                                    id:'putasse', text:'La fille vous met au defi de la faire jouir'
                                    , conditions:{
                                        connaissance:'kamasutra', possessions:{or:100}
                                    }
                                    , recompense:{
                                        text:"Vous lui montrez l'etendue de vos talents et la faites hurler de plaisir.\n Vous vous faites jeter de l'hotel"
                                       , image:'https://el.phncdn.com/gif/30043941.gif'
                                        ,bonheur:2
                                        ,  possessions:{or:-100}
                                    }
                                }
                                , maquereau:{
                                    id:'maquereau', text:"Aider la fille de rue a se debarrasser de son mac "
                                    , conditions:{
                                        possessions:{passportFille:1}
                                    }
                                    , recompense:{
                                        text:"La fille est trop contente et vous remercie avec une pipe gratuite"
                                        , image:"https://el.phncdn.com/gif/47808501.gif"
                                        , bonheur:2,vie:1
                                    }
                                }
                            }

export const MissionPossible=({mission, takeMission, validable})=>{

    if(mission==null)
        return null;
    return <Paper elevation={2}>
        <Typography variant="h6">{mission.text}</Typography>
        <Box display="flex">

        <Button onClick={evt=>{takeMission(false);}}>Accepter la mission</Button>
        <Box display={'flex'} flexDirection={'column'}>

        <Button disabled={!validable}
        onClick={evt=>{takeMission(true);}}>Valider la mission</Button>
        {!validable && <Typography variant="caption">{JSON.stringify(mission.conditions)}</Typography>}
        </Box>
        </Box>
       
    </Paper>
}