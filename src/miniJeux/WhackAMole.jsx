import React, { useEffect, useState } from 'react';

import { styled } from '@mui/system';
import moleImg from '../fourmis/images/puceronInactif.png';
import coupVide from './images/coupVide.mp3';
import coupReussi from './images/coupReussi.mp3';
import { soundManager } from '../rpg/sons/SoundManager';

import {
  Box,
  Button,
  Typography,
  Grid,
  Paper,
  Stack,
} from '@mui/material';
import { GameOver } from '../ChuckNorrisFact';


// === CONFIG ===
const GRID_SIZE = 9;
const GAME_DURATION = 20000; // ms

// === STYLED COMPONENTS ===
const Hole = styled(Paper)(({ isMole }) => ({
  width: '100%',
  paddingTop: '100%',
  position: 'relative',
  backgroundColor: isMole ? '#795548' : '#ccc',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',
  overflow: 'hidden',
}));

const MoleImg = styled('img')(({ isFading }) => ({
  position: 'absolute',
  top: '15%',
  left: '15%',
  width: '70%',
  height: '70%',
  pointerEvents: 'none',
  opacity: isFading ? 0 : 1,
  transition: 'opacity 0.3s ease-out',
}));

// === MAIN COMPONENT ===
const WhackAMole = ({onFinish}) => {
  const [moleIndex, setMoleIndex] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION / 1000);
  const [gameRunning, setGameRunning] = useState(false);
  const [moleShowTime, setMoleShowTime] = useState(800);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    soundManager.loadSounds({coupReussi, coupVide})
  },[]);

  const startGame = (difficultyTime) => {
    setScore(0);
    setTimeLeft(GAME_DURATION / 1000);
    setGameRunning(true);
    setMoleShowTime(difficultyTime);
  };

  // Timer countdown
  useEffect(() => {
    if (!gameRunning) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setGameRunning(false);
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameRunning]);

  // Mole interval
  useEffect(() => {
    if (!gameRunning) {
      setMoleIndex(null);
        if(score>0 && typeof onFinish==='function') 
            onFinish(score);
      return;
    }

    const moleInterval = setInterval(() => {
      setTimeout(() => {
        setIsFading(true);
      }, 300); // start fade-out just before switch

      const randomIndex = Math.floor(Math.random() * GRID_SIZE);
      setMoleIndex(randomIndex);
      setIsFading(false);
    }, moleShowTime);

    return () => clearInterval(moleInterval);
  }, [gameRunning, moleShowTime]);
const [isGameOver, setGameOver]=useState(false);
  const handleClick = (index) => {
    if (index === moleIndex) {
      const scorByHit=moleShowTime==750?1:2;//1 en facile, 2 en difficile
      setScore(prev => prev + scorByHit);
        soundManager.play('coupReussi');
      setMoleIndex(null);
      setIsFading(false);
    }
    else
        soundManager.play('coupVide');
  };
return (
  <Box
    sx={{
      maxWidth: 400,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      margin: "20px auto",
      p: 2,
      borderRadius: 4,
      background: "linear-gradient(145deg, #2e2e2e, #1a1a1a)",
      boxShadow: "inset 0 0 15px #000, 0 0 20px #111",
      color: "#fafafa",
      overflow: "hidden",
    }}
  >
    <GameOver
      open={isGameOver}
      score={score}
      gameName="WhackAMole"
      handleClose={() => setGameOver(false)}
    />

    {/* HEADER */}
    <Typography
      variant="h4"
      align="center"
      sx={{
        mb: 1,
        color: "#ffcc00",
        textShadow: "0 0 10px #ffcc0044",
        fontWeight: "bold",
      }}
    >
      Whack-a-Mole 🐹
    </Typography>

    {/* SCORE / TIMER */}
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        width: "100%",
        background: "rgba(255,255,255,0.08)",
        borderRadius: 3,
        px: 2,
        py: 1,
        mb: 1,
        boxShadow: "inset 0 0 10px #000",
      }}
    >
      <Typography variant="body1" sx={{ fontFamily: "monospace" }}>
        Score : {score}
      </Typography>
      <Typography variant="body1" sx={{ fontFamily: "monospace" }}>
        Temps : {timeLeft}s
      </Typography>
    </Box>

    {/* CONTROLS */}
    <Stack
      spacing={1}
      direction="row"
      justifyContent="center"
      sx={{ mb: 2, flexWrap: "wrap" }}
    >
      <Button
        variant="contained"
        color="success"
        size="small"
        sx={{
          flex: 1,
          minWidth: "40%",
          borderRadius: 3,
          fontWeight: "bold",
          transition: "all 0.3s ease",
          "&:hover": { transform: "scale(1.05)" },
        }}
        onClick={() => startGame(750)}
        disabled={gameRunning}
      >
        Facile 😌
      </Button>
      <Button
        variant="contained"
        color="error"
        size="small"
        sx={{
          flex: 1,
          minWidth: "40%",
          borderRadius: 3,
          fontWeight: "bold",
          transition: "all 0.3s ease",
          "&:hover": { transform: "scale(1.05)" },
        }}
        onClick={() => startGame(600)}
        disabled={gameRunning}
      >
        Difficile 😈
      </Button>
    </Stack>

    {/* GAME GRID */}
    <Grid container spacing={1} sx={{ width: "100%" }}>
      {[...Array(GRID_SIZE)].map((_, index) => (
        <Grid item xs={4} key={index}>
          <Hole
            isMole={index === moleIndex}
            onClick={() => handleClick(index)}
            elevation={3}
          >
            {index === moleIndex && (
              <MoleImg src={moleImg} alt="Mole" isFading={isFading} />
            )}
          </Hole>
        </Grid>
      ))}
    </Grid>
  </Box>
);

};

export default WhackAMole;
