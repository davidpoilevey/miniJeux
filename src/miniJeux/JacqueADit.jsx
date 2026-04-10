import React, { useState, useEffect, useCallback, useRef } from "react";
import { Box, Typography, Paper, LinearProgress, Button, Fade } from "@mui/material";
import { GameOver } from "../ChuckNorrisFact";
import { ThumbDown, ThumbUp } from "@mui/icons-material";

// mapping des synonymes pour chaque touche
const COMMAND_SYNONYMS = {
  Haut: ["Haut", "vers le ciel", "la flèche qui monte", "la touche ↑"],
  Bas: ["Bas", "vers le sol", "la flèche qui descend", "la touche ↓"],
  Gauche: ["Gauche", "à gauche", "le côté gauche", "la flèche du côté gauche", "la touche ←"],
  Droite: ["Droite", "à droite", "le côté droit", "la flèche du côté droit", "la touche →"],
  Espace: ["Espace", "barre d’espace", "la touche du vide", "le long rectangle en bas"],
  A: ["la touche A", "A"],
  B: ["la touche B", "B"],
  C: ["la touche C", "C"],
  Bite:["Touchez-vous la bite","Touche ta bite","Branle-toi","mets un doigt dans le cul"]
};

const KEY_MAPPING = {
  ArrowUp: "Haut",
  ArrowDown: "Bas",
  ArrowLeft: "Gauche",
  ArrowRight: "Droite",
  " ": "Espace",
  a: "A",
  b: "B",
  c: "C",
  A: "A",
  B: "B",
  C: "C",
};

const NAMES = ["Mohammed", "Jacky", "Jacquouille", "Schack"];
const ROUND_DURATION = 3000; // 2s par commande

export default function JacquesADit() {
  const [currentCommand, setCurrentCommand] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const expectedActionRef = useRef(null);
  const withJacquesRef = useRef(false);
  const answeredRef = useRef(false);
  const [feedback, setFeedback] = useState(null);
  const [totalTime, setTotalTime] = useState(0);
  const tick = useRef();
  const [pret, setPret] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const cBon = useCallback(() => {
    setScore((s) => s + 1);
    setFeedback("up");
  }, [setScore]);
  const cPasBon = useCallback(() => {
    setScore((s) => s - 1);
    setFeedback("down");
  }, [setScore]);
  const start = useCallback(() => {
    setScore(0);
    setTotalTime(Date.now());
    setGameOver(false);
    setPret(true);
  }, []);
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);
  // Choisit une commande piégeuse
  const newCommand = useCallback(() => {
    const actions = Object.keys(COMMAND_SYNONYMS);
    let action=null;
    while(action===null || action===expectedActionRef.current){
     action = actions[Math.floor(Math.random() * actions.length)];
    }
    const synonyms = COMMAND_SYNONYMS[action];
    const synonym = synonyms[Math.floor(Math.random() * synonyms.length)];
    const hasJacques = Math.random() < 0.6;
    const withSpeaker = hasJacques || Math.random() < 0.5;
    const speaker = hasJacques ? "Jacques" : NAMES[Math.floor(Math.random() * NAMES.length)];


    let text = withSpeaker ? (speaker + ' a dit : ') : '';
    text += synonym;
    setCurrentCommand(text);

    expectedActionRef.current = action;
    withJacquesRef.current = hasJacques;
    answeredRef.current = false;
    setTimeLeft(ROUND_DURATION);
  }, []);
  useEffect(() => {
    if (!pret) return;
    newCommand();
    tick.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 10) {
          // Fin de round
          if (!answeredRef.current) {
            if(withJacquesRef.current) cPasBon();
            else cBon();
           
          }
          newCommand();
          return ROUND_DURATION;
        }
        return prev - 100;
      });
      const elapsed = Date.now() - totalTime;
      if (elapsed > 60000) {
        setPret(false);
        setGameOver(true);
        clearInterval(tick.current);
      }
    }, 100);

    return () => clearInterval(tick.current);
  }, [newCommand, pret]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 20));
    }, 20);
    return () => clearInterval(timer);
  }, []);
  // Gestion des touches
  useEffect(() => {
    const handleKeyDown = (e) => {
      const action = KEY_MAPPING[e.key];
      answeredRef.current = true;

      if (!action) {
        if(expectedActionRef.current==='Bite' && withJacquesRef.current) // ca marche toujours si on touche n'importe quoi
          cBon();
        else
        cPasBon();
      } else {
        if (withJacquesRef.current && action === expectedActionRef.current) {
          cBon();
        } else if (!withJacquesRef.current) {
          cPasBon();
        }
      }
      e.preventDefault();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [newCommand]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
       background: "linear-gradient(135deg, #4a90e2 0%, #a0a0a0 100%)",
    animation: "gradientAnimation 10s ease infinite",
      }}
    >
      <GameOver open={gameOver} score={score} gameName="jacqueADit"
        handleClose={() => { setGameOver(false) }} handleRestart={start} />
      <Paper
        elevation={6}
        sx={{
          p: 4,
          borderRadius: 3,
          textAlign: "center",
          width: 400,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h4" gutterBottom>
            🎮 Jacques a dit
          </Typography>
  <Fade in={!!feedback} timeout={800}>
        <Box sx={{ height: 70, display: "flex", alignItems: "center" }}>
          {feedback === "up" && <ThumbUp sx={{ fontSize: 60, color: "green" }} />}
          {feedback === "down" && <ThumbDown sx={{ fontSize: 60, color: "red" }} />}
        </Box>
      </Fade>
        </Box>


        <Paper elevation={3} sx={{ p: 3, minWidth: 300, textAlign: "center"
          , background: "linear-gradient(135deg, #f4ddaaff 0%, #f2f0c4ff 100%)", }}>
          <Typography variant="h5">{currentCommand}</Typography>
          <Typography
            sx={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: "2rem", width:'150px', marginLeft:'25%',
              mt: 2,border:'1px solid black', borderRadius:2, padding:'0 2px',
              color: "black", backgroundColor:'rgb(200,220,200)'
            }}
          >
            {(timeLeft / 1000).toFixed(3)}s
          </Typography>
        </Paper>

        <Typography variant="body1" gutterBottom>
          Appuie sur la bonne touche si (et seulement si) Jacques a parlé.
          Ne rien faire quand un imposteur parle rapporte aussi des points !
        </Typography>
        {!pret && <Button variant="contained" color="primary" size="large" onClick={start}>Pret ? Tu as Une minute !</Button>}

        <Typography variant="h5" sx={{ mt: 3 }}>
          Score : {score}
        </Typography>
      </Paper>
    </Box>
  );
}
