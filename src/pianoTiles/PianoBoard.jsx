import { Box, Button, Slider, Typography } from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { HAUTEUR, NOTE_HEIGHT, PianoContextProvider, usePiano } from "./PianoContext";
import { makeStyles } from "@mui/styles";
import { ahVousDiraisJe, bohemian, DoReMi } from "./chansons";
import { noteConfig, useAudio } from "./SoundSystem";
import { CaptageKey } from "./CaptageKey";
import { useGlobalScores } from "../App";
import { PublishScore } from "../pocketbaseScores";

const PianoTiles = () => {

    const {getScoreByGame} = useGlobalScores();
    const hiscores = getScoreByGame('pianoTile');
    return <PianoContextProvider hiscores={hiscores}>
        <PianoPanel />
    </PianoContextProvider>
}

const COLUMN_WIDTH = 100;

const useStyles = makeStyles((theme) => ({
    column: {
        height: '100%', width: COLUMN_WIDTH
        , position: 'relative'
    },
    root: {
        display: 'flex', position: 'relative', margin: 'auto'
        , width: '100%', height: '100%'
    }
}));

const PianoPanel = () => {
    const { lanceChanson, running, setRunning, findNote, rythme, setScore } = usePiano();
    
    const {playNote, stopAllNotes, playNoteAuto} = useAudio({rythme});
    const stopNotes = useRef({});
    const [pressedKeys, setPressedKeys] = useState([]);
    const [effets, setEffets] = useState({});
    
    const handleKeyPress = useCallback((event) => {
        if (['e', 'r', 'u', 'i'].includes(event.key)) {
            setPressedKeys(oldKeys=>[...oldKeys, event.key]);
            // Vous pouvez ici déclencher des actions spécifiques en fonction de la touche pressée
            // verifier que les coordonnees de la box E correspondent a une position de note 
            const {note, marge} = findNote(event.key);
            let effet = 'effetRate';
            if(note!=null){
                if(marge>NOTE_HEIGHT/2)
                   {
                    setScore(sc=>(sc+5));
                    effet='effetNaze';
                   } 
                   else  if(marge>10)
                    {
                     setScore(sc=>(sc+10));
                     effet='effetBon';
                    } 
                    else{

                     setScore(sc=>(sc+20));
                     effet='effetPerfect';
                    }
                // playNoteAuto(note);
                // if(stopNotes.current[event.key]!=null)
                //     stopNotes.current[event.key]();
                // const stopNote=playNote(note);// on peut rajouter type:"square"
                // stopNotes.current[event.key]=stopNote;
                // selon la marge d'erreur afficher effet different
            }
            else{
                // y avait rien, afficher effet raté
            }
            setEffets(oldEffects=>{
                return {...oldEffects, [event.key]: effet};
            });
        }
    },[setEffets, findNote]);

    const handleKeyRelease = useCallback((event) => {
        if (['e', 'r', 'u', 'i'].includes(event.key)) {
            setPressedKeys(old=>old.filter(key => key !== event.key));
            setEffets(old=>({...old, [event.key]:null}));
            if(stopNotes.current[event.key]!=null)
               {
                stopNotes.current[event.key]();
                stopNotes.current[event.key]=null;
               }
        }
    },[setPressedKeys]);
    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        window.addEventListener('keyup', handleKeyRelease);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
            window.removeEventListener('keyup', handleKeyRelease);

        };
    }, [handleKeyPress,handleKeyRelease]);
    return (
        <Box sx={{display:'flex', flexDirection:'column'}}>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, zIndex:2 }}>
                <Button
                    variant="contained"
                    color="primary"
                    disabled={running}
                    onClick={() => lanceChanson(ahVousDiraisJe)}
                >
                    Ah vous dirais-je maman
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    disabled={running}
                    onClick={() => lanceChanson(DoReMi)}
                >
                    Do re mi
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    disabled={running}
                    onClick={() => lanceChanson(bohemian)}
                >
                  Bohemian Rhapsody
                </Button>
                
                <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => setRunning(!running)}
                >
                    {running ? 'Stop' : 'Start'}
                </Button>
            </Box>
            <PianoBoard pressedKeys={pressedKeys} effets={effets}/>
        </Box>
    );
}
const PianoBoard = ({ pressedKeys,effets }) => {
    const cols = ['e', 'r', 'u', 'i']
    const colsColor = ['#2222ff', '#eeed74', '#f73040', '#42F834']
    const { notes, rythme, setRythme,score } = usePiano();
    const {getScoreByGame} = useGlobalScores();
    const hiscore = getScoreByGame('pianoTile')
    const classes = useStyles();
    return <Box className={classes.root}>
        <Box sx={{ flex: 1 , height:300, margin:'auto'}}>
            <Slider orientation="vertical" onChange={(evt, value) => {
                 setRythme(value) }} valueLabelDisplay="auto"
                value={rythme} min={2} max={15} step={0.5} />
        </Box>
       
        {cols.map((col, cidx) => {
            return <Box key={cidx}
                className={classes.column}>
                    <CaptageKey  effet={effets[col]} touche={col}/>
                     
                {notes[col] && notes[col].map((n, nidx) => {
                    return <Box key={'c' + nidx} sx={{
                        position: 'absolute', left: 0, width: '100%'
                        ,boxSizing:'border-box',border:'5px solid #eee'
                        , height: n.hauteur, top: n.y, backgroundColor: colsColor[cidx]
                    }}>
{/* Boxes qui tombent */}
                    </Box>
                })}
            </Box>
        })}

        <Box sx={{ flex: 1 ,display:'flex',flexDirection:'column'}}>
            <Typography>Score</Typography>
            <Typography variant="h4" color="primary">{score}</Typography>

            <Typography variant="caption">Hi-Score</Typography>
            <Typography variant="caption" color="secondary">{hiscore?.score||0}</Typography>

            {score > 0 && <PublishScore gameName="pianoTile" score={score} darkMode={false} />}
        </Box>
    </Box>
}
export default PianoTiles