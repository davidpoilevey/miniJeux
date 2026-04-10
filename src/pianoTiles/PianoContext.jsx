
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ahVousDiraisJe } from "./chansons";
import { noteConfig, useAudio } from "./SoundSystem";
import { useGlobalScores } from "../App";
const PianoContext = createContext();
export const NOTE_HEIGHT=50;
export const HAUTEUR=500;



export const usePiano=()=> {
    return useContext(PianoContext);
  }
export const PianoContextProvider = ({hiscores={score:0}, children})=>{

    const [chanson, setChanson] = useState(); // {touche:'u', note:'sol', duree:1},{touche:'blank', note:'', duree:0.5},
    const [running, setRunning]=useState(false);
    const [rythme, setRythme]=useState(2);
    const [score, setScore]=useState(0);
    const [notes, setNotes]=useState({});
    const { playNoteAuto} = useAudio({rythme});
    const {setScore:setGlobalScore} = useGlobalScores();
  
    useEffect(()=>{
        if(hiscores.score<score)
             setGlobalScore('pianoTile',score);
    },[score,hiscores.score]);
    useEffect(()=>{
        const notes={};
        let currHeight=0;
        const noteHeight=(NOTE_HEIGHT);
        if(chanson==null)
            return;
        chanson.forEach((note,nidx)=>{
            if(notes[note.touche]==null)
                notes[note.touche]=[];
            if(note.retour)
                currHeight+=(noteHeight*note.retour);
            currHeight-=noteHeight*note.duree;
            if(note.touche!=='blank')
             notes[note.touche].push({hauteur:NOTE_HEIGHT*note.duree, y:currHeight, note:note.note});
           
        });
        setNotes(notes);
    },[chanson]);

    const lanceChanson=(chanson)=>{
        if(intervalId.current)
            clearInterval(intervalId.current);
        setChanson([...chanson]);
        setScore(0);
        setRunning(true);
    }
    const dressNote = (n)=>{
        
       const  note=noteConfig(n.note);// renvoie {frequence,type}
        note.duree=(((n.hauteur/NOTE_HEIGHT)*1000)/rythme);
        return note;
    }
    const findNote=useCallback((touche)=>{
        let note=null;
        let marge=null;
        // trouver parmi les notes de la touche en cours celles qui ont y proche de hauteur. touche=e,r,u,i
      if(notes[touche]!=null)
        notes[touche].forEach(n=>{
            if(n.y+n.hauteur>HAUTEUR&&n.y<(HAUTEUR+NOTE_HEIGHT)){
                // la note est dedans
                note = dressNote(n);
                marge=Math.abs(n.y+n.hauteur-(HAUTEUR+NOTE_HEIGHT));
            }
        });
        return {note, marge};
    },[notes]);

    const intervalId=useRef();
    useEffect(()=>{
       
        if(running){
           intervalId.current = setInterval(()=>{
                setNotes(oldNotes=>{
                    const newNotes={};
                    for (const [key, value] of Object.entries(oldNotes)) {
                        // filter pour enlever celles qui debordent
                        newNotes[key]=value.map(n=>{
                            const newHauteur = n.y+rythme;
                            let played=n.played;
                            if(newHauteur+n.hauteur>=(HAUTEUR+NOTE_HEIGHT) && !n.played){
                              const note = dressNote(n);
                              playNoteAuto(note);
                              played=true;
                            }
                         return   {...n, played, y:newHauteur}
                        });//map pour faire avancer
                      }
                      
                    return newNotes;
                })
            },10);
        }
        return()=>{
            if(intervalId.current)
                clearInterval(intervalId.current);
        }
    },[running, rythme]);
    return <PianoContext.Provider value={{chanson, notes
    , running, setRunning, lanceChanson,rythme, setRythme
   , score, setScore
    , findNote}}>
{children}
    </PianoContext.Provider>
}