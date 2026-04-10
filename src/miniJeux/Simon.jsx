import { Box, Button, Grid, Paper, Typography } from '@mui/material';
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { GameOver } from '../ChuckNorrisFact';
import { useIsMobile } from '../hookGame';

const Couleurs = [
  { id: 'rouge', color: '#fe1000', radius: '100% 0 0 0', style: 'haut', frequence: 404 },
  { id: 'bleu', color: '#1019Fa', radius: '0 100% 0 0', style: 'haut', frequence: 494 },
  { id: 'vert', color: '#22Fe10', radius: '0 0 0 100%', style: 'bas', frequence: 304 },
  { id: 'jaune', color: '#fefe00', radius: '0 0 100% 0', style: 'bas', frequence: 224 },
]

const Simon = ({onFinish}) => {
  const isMobile = useIsMobile();
  const SIMON_SIZE = isMobile ? Math.floor((window.innerWidth - 20) / 2) : 350;
  const [activated, setActivated] = useState();
  const [melodie, setMelodie] = useState([]);
  const [melodieJoueur, setMelodieJoueur] = useState([]);
  const [sequence, setSequence] = useState();
  const [msg, setMsg] = useState();
  const [playerTour, setPlayerTour] = useState(false);
  const score = useRef(0);
const [isGameOver, gameOver] = useState(false);

  const cStyle = useCallback((style) => {
    const commonStyle = {

      height: SIMON_SIZE,
      width: SIMON_SIZE,
      cursor: 'pointer',
      transition: 'filter 0.2s ease-in-out',
      filter: 'contrast(0.9)'
    }
    const commonStyleHaut = {
      ...commonStyle,
      boxShadow: 'inset 0px 61px 50px 10px rgba(0, 0, 0, 0.5)'
    }
    const commonStyleBas = {
      ...commonStyle,
      boxShadow: 'inset 10px -20px 50px 10px rgba(0, 0, 0, 0.5)'
    }
    return style === 'bas' ? commonStyleBas : commonStyleHaut
  }, []);

  const osc = useRef();
  const audioContextRef = useRef();
  useEffect(() => {

    const context = new AudioContext();


    osc.current = context.createOscillator();
    osc.current.type = "square";
    osc.current.connect(context.destination);
    osc.current.start();
    audioContextRef.current = context;
    context.suspend();
    return () => osc.current.disconnect(context.destination);
  }, [])
  const initGame = () => {
    const listeCouleur = Couleurs.map(c => c.id);
    const nvelleMelodie = [];
    for (let i = 0; i < 32; i++) {
      nvelleMelodie.push(listeCouleur[Math.floor(Math.random() * 4)]);
    }
    setPlayerTour(false);
    setMelodie(nvelleMelodie);
    setMsg('');
    setSequence(null);
    score.current = 0;
  }

  const playNote = (color) => {
    return new Promise(resolve => {
      audioContextRef.current.resume();
      osc.current.frequency.value = Couleurs.find(c => c.id === color)?.frequence;
      setActivated(color); // Appelle votre fonction existante pour afficher la couleur
      setTimeout(() => {
        setActivated(null); // Réinitialise la couleur
        setTimeout(() => {
          audioContextRef.current.suspend();
          resolve();
        }, 200);
      }, 200);
    });
  };
  const playSequence = (sequence) => {

    sequence.reduce((promise, color) => {
      return promise.then(() => playNote(color));
    }, Promise.resolve());
  };

  useEffect(() => {
    if (sequence != null)
      playSequence(sequence);
  }, [sequence]);
  useEffect(() => {
    if (melodie.length == 0)
      return;
    if (!playerTour) {
      // joue score.current+1 sons
      const sequence = melodie.slice(0, score.current + 1);
      setSequence(sequence);
      setPlayerTour(true);
      setMelodieJoueur([]);
    }
    else {
      // attends
    }

  }, [melodie, playerTour]);
  const clique = couleur => {
    playNote(couleur);
    setMelodieJoueur(m => (m.concat(couleur)));
  }
  useEffect(() => {
    // Si melodieJoueur est vide, on ne fait rien
    if (sequence == null || !melodieJoueur.length) return;

    // On compare chaque élément de melodieJoueur avec l'élément correspondant de sequence
    const isSequenceCorrect = melodieJoueur.every((note, index) => note === sequence[index]);

    // Si la séquence est correcte et que le joueur a joué toutes les notes
    if (isSequenceCorrect && melodieJoueur.length === sequence.length) {
      // Le joueur a gagné un tour
      setTimeout(() => {
        setPlayerTour(false); // Prépare le prochain tour de l'ordinateur
      }, 500);

      // Vous pouvez ici ajouter des actions supplémentaires, comme augmenter le niveau de difficulté, etc.
      score.current++;
    } else if (!isSequenceCorrect) {
      // Le joueur s'est trompé
      setMsg('MAUVAISE melodie');
      playSequence(sequence);
      if(typeof onFinish =='function') 
        onFinish(score.current);
      gameOver(true);
      setMelodie([]);
      // Vous pouvez ici ajouter des actions supplémentaires, comme afficher un message d'erreur, réinitialiser le jeu, etc.
    }
  }, [melodieJoueur, sequence]);

  const offset = SIMON_SIZE / 4;

  // 💡 Arrière-plan qui change selon la couleur activée
  const activeColor = useMemo(() => {
    const color = Couleurs.find(c => c.id === activated)?.color;
    return color || "#000";
  }, [activated]);

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100dvh",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(180deg, ${activeColor}, #1b1b1b,${activeColor}, #f5eeeeff)`,
        transition: "background 0.6s ease-in-out",
      }}
    >
      {/* Cadre principal */}
      <Paper
        elevation={12}
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: "center",
          borderRadius: 5,
          overflow: "hidden",
          border: "3px solid #444",
          boxShadow: "0 0 40px #222",
           transition: 'all 1s ease',
          p: 3,
        }}
      >
        {/* Zone du jeu */}
        <Box
          sx={{
            position: "relative",
            display: "flex",
            background: `linear-gradient(145deg, ${activeColor}, #1b1b1b)`,
           //  opacity: 0.6,
            transition: "opacity 1.5s ease, background-color 1.5s ease",
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
          }}
        >
          <GameOver
            open={isGameOver}
            score={score.current}
            reason={"aucune mémoire"}
            gameName="Simon"
            handleClose={() => gameOver(false)}
          />

          <Box
            sx={{
              position: "absolute",
              zIndex: 2,
              borderRadius: "50%",
              textAlign: "center",
              alignContent: "center",
              left: SIMON_SIZE - offset,
              width: SIMON_SIZE / 2,
              height: SIMON_SIZE / 2,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              color: "white",
            }}
          >
            {msg && (
              <Typography
                variant="h6"
                sx={{
                  textShadow: "2px 1px 2px #000",
                  color: "#ff5050",
                  mb: 1,
                }}
              >
                {msg}
              </Typography>
            )}
            <Typography
              variant="h4"
              sx={{
                backgroundColor: "rgba(255,255,255,0.1)",
                borderRadius: 2,
                px: 2,
                py: 0.5,
                border: "1px solid rgba(255,255,255,0.2)",
                fontFamily: "'Orbitron', sans-serif",
              }}
            >
              {score.current}
            </Typography>
          </Box>

          <Grid
            container
            spacing={0}
            sx={{
              height: SIMON_SIZE * 2,
              width: SIMON_SIZE * 2,
              borderRadius: "50%",
              overflow: "hidden",
              boxShadow: "0 0 30px rgba(0,0,0,0.8) inset",
              border: "4px solid #222",
            }}
          >
            {Couleurs.map((coul, cidx) => (
              <Grid xs={6} item key={cidx}>
                <Box
                  onClick={() => clique(coul.id)}
                  sx={{
                    ...cStyle(coul.style),
                    backgroundColor: coul.color,
                    borderRadius: coul.radius,
                    filter:
                      activated === coul.id
                        ? "brightness(1.8) saturate(1.3)"
                        : "brightness(0.9)",
                    transition: "filter 0.2s, transform 0.2s",
                    cursor: "pointer",
                    "&:active": { transform: "scale(0.97)" },
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Panneau latéral : commandes */}
        <Box
          sx={{
            width: isMobile ? "100%" : 200,
            ml: isMobile ? 0 : 4,
            mt: isMobile ? 2 : 0,
            display: "flex",
            flexDirection: isMobile ? "row" : "column",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              textAlign: "center",
              mb: 2,
              fontFamily: "'Orbitron', sans-serif",
              textTransform: "uppercase",
              letterSpacing: "2px",
            }}
          >
            Simon Memory
          </Typography>

          {melodie.length === 0 && (
            <Button
              onClick={initGame}
              variant="contained"
              color="primary"
              sx={{
                py: 2,
                fontWeight: "bold",
                fontFamily: "'Orbitron', sans-serif",
              }}
            >
              Nouvelle Partie
            </Button>
          )}

          <Box sx={{ flex: 1 }} />

          <Typography
            variant="body2"
            sx={{
              textAlign: "center",
              color: "gray",
              mt: 2,
              fontStyle: "italic",
            }}
          >
            Répète la séquence de lumières !
          </Typography>
        </Box>
      </Paper>
    </Box>
    )
};

export default Simon;