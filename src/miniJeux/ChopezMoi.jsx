import React, { useState, useEffect, useRef } from "react";
import { Box, Button, Typography, Slider, Avatar } from "@mui/material";
import imgMoi from '../DSCN0013.jpg';
import { GameOver } from "../ChuckNorrisFact";

export default function ChopezMoi() {
    const [level, setLevel] = useState(1);

    const [startTime, setStartTime] = useState(null);
    const [totalTime, setTotalTime] = useState(null);
    const [pos, setPos] = useState({ x: 50, y: 50 });
    const [time, setTime] = useState(0);
    const [running, setRunning] = useState(false);
    const [caught, setCaught] = useState(false);
    const [challengeMode, setChallengeMode] = useState(false);
    const [score, setScore] = useState(0);
    const [isGameOver, setGameOver] = useState(false);
    const [clones, setClones] = useState([]);
    const master = useRef(pos);
    const boxRef = useRef(null);
    const mouseRef = useRef({ x: 0, y: 0 });
    const velocity = useRef({ dx: 2, dy: 1.5 });

    // Chrono
    useEffect(() => {
        if (!running) return;
        const timer = setInterval(() => {
            setTime((t) => t + 0.1);
            setTotalTime((t) => t + 0.1);
        }, 100);
        return () => clearInterval(timer);
    }, [running]);
    // on level change
    const changeLevel = (lvl) => {
        velocity.current = { dx: 3, dy: 2 };
        if (lvl >= 3) {
            velocity.current = { dx: 5, dy: 4 };
        }
        setPos({ x: 50, y: 50 });
        setCaught(false);
         setRunning(true);
        setLevel(lvl);
        setTime(0);
    }
    const removeClone = cl => {
        setClones(c => c.filter(l => l.id != cl.id));
    }
    // Déplacement / logique du carré
    useEffect(() => {
        if (!running || caught) return;
        if (level === 7 || level === 8 || level === 9) {
            const count = level === 7 ? 4 : 6;
            setClones(
                Array.from({ length: count }, (_, i) => {
                    const offX = Math.min(60, Math.max(-60, Math.random() * 100 - 50));
                    const offY = Math.min(60, Math.max(-60, Math.random() * 100 - 50));
                    return {
                        id: i,
                        x: pos.x + offX,
                        y: pos.y + offY,
                        offX, offY, vitesse: velocity.current
                    }
                })
            );
        } else {
            setClones([]);
        }

        const frame = setInterval(() => {

            const frameW = boxRef.current?.offsetWidth || 400;
            const frameH = boxRef.current?.offsetHeight || 300;
            setClones(prev =>
                prev.map(c => {
                    let { x, y, vitesse } = c;
                    let { dx, dy } = vitesse;


                    if (level >= 7) {
                        if (level === 7) {
                            x = (c.offX + (master.current.x)) ;
                            y = (c.offY + (master.current.y)) ;
                        }
                        if (level >= 8) {
                            // Les clones bougent indépendamment ou fuient la souris

                            x = c.x + dx;
                            y = c.y + dy;
                            dx *= 1 + (Math.random() - 0.5) * 0.3;
                            dy *= 1 + (Math.random() - 0.5) * 0.3;
                            x += dx;
                            y += dy;

                            if (level === 9) {
                                const mx = mouseRef.current.x - x;
                                const my = mouseRef.current.y - y;
                                const dist = Math.sqrt(mx * mx + my * my);
                                if (dist < 100) {
                                    x -= (mx / dist) * 5;
                                    y -= (my / dist) * 5;
                                }
                            }

                        }

                        if (x < 0 || x > frameW - 50) {
                            dx *= -1;
                            x = (x < 0 ? 0 : frameW - 50);
                        }
                        if (y < 0 || y > frameH - 50) {
                            dy *= -1;
                            y = (y < 0 ? 0 : frameH - 50);
                        }
                        dx = Math.max(-10, Math.min(10, dx));
                        dy = Math.max(-10, Math.min(10, dy));
                        return { ...c, x, y, vitesse: { dx, dy } }
                    }
                    return c;
                })
            );

            setPos((prev) => {
                let { x, y } = prev;
                let { dx, dy } = velocity.current;


                // Niveau 3 : vitesse accrue et random
                if (level >= 3) {
                    velocity.current.dx *= 1 + (Math.random() - 0.5) * 0.3;
                    velocity.current.dy *= 1 + (Math.random() - 0.5) * 0.3;
                }
                // Niveau 2+ : déplacement
                if (level >= 2) {
                    x += dx;
                    y += dy;
                }


                // Niveau 4 : évite le curseur
                if (level >= 4) {
                    const mx = mouseRef.current.x - x;
                    const my = mouseRef.current.y - y;
                    const dist = Math.sqrt(mx * mx + my * my);
                    if (dist < 100) {
                        x -= (mx / dist) * 5;
                        y -= (my / dist) * 5;
                    }
                }

                // Niveau 5 : téléportation d’urgence
                if (level >= 5) {
                    const mx = mouseRef.current.x - x;
                    const my = mouseRef.current.y - y;
                    const dist = Math.sqrt(mx * mx + my * my);
                    if (level === 5 && dist < 60 && Math.random() < 0.05) {
                        x = Math.random() * (frameW - 50);
                        y = Math.random() * (frameH - 50);
                    }
                    if (level === 6 && dist < 120) {
                        const angle = Math.atan2(my, mx) + (Math.random() - 0.5); // déviation aléatoire
                        x -= Math.cos(angle) * 6;
                        y -= Math.sin(angle) * 6;
                    }
                    if (level === 10 && dist < 50) {
                        x = frameW - mouseRef.current.x;
                        y = frameH - mouseRef.current.y;
                    }

                }


                if (x < 0 || x > frameW - 50) {
                    velocity.current.dx *= -1;
                    x = (x < 0 ? 0 : frameW - 50);
                }
                if (y < 0 || y > frameH - 50) {
                    velocity.current.dy *= -1;
                    y = (y < 0 ? 0 : frameH - 50);
                }
                velocity.current.dx = Math.max(-20, Math.min(20, velocity.current.dx));
                velocity.current.dy = Math.max(-20, Math.min(20, velocity.current.dy));
                master.current = { x, y };
                return { x, y };
            });
        }, 30);

        return () => clearInterval(frame);
    }, [level, running, caught]);

    // Souris pour le suivi
    const handleMouseMove = (e) => {
        const rect = boxRef.current.getBoundingClientRect();
        mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    // Clic sur le carré
    const handleCatch = () => {
        setCaught(true);
        setRunning(false);
       setTimeout(()=>{

        if (level < 10) {
            changeLevel(level + 1);
        } else {
            const elapsed = (Date.now() - startTime) / 1000;
            setTotalTime(elapsed);
            setChallengeMode(false);
            setScore(Math.round(10000 / elapsed));
            setGameOver(true);
        }
       },2000);
    };

    const reset = () => {
        setTime(0);
        setCaught(false);
        setPos({ x: 50, y: 50 });
        setRunning(true);
    };

    return (
        <Box
            sx={{
                margin: "auto",
                textAlign: "center",
                color: "white",
                p: 2,
                background: "radial-gradient(circle at top, #ed4c4cff 0%, #000 30%)",
                borderRadius: 4,
                boxShadow: "0 0 25px #111",
            }}
        >
            <Typography variant="h5" sx={{ mb: 1 }}>
                🎯 Chopez-moi !
            </Typography>
            <GameOver
                open={isGameOver}
                score={score}
                gameName="chopezMoi"
                handleRestart={() => {
                    setGameOver(false); setChallengeMode(false);
                }}
                handleClose={() => setGameOver(false)}
            />
            {challengeMode&&<Typography variant="h6" color={'primary'}>Niveau {level}/10</Typography>}
            {challengeMode?<Typography variant="body2" sx={{ mb: 1 }}>
                {running ? `⏱️ Temps : ${challengeMode ? totalTime.toFixed(1) : time.toFixed(1)} s` : "Arreté"}
            </Typography>:<Button
                variant="contained"
                onClick={() => {
                    setLevel(1);
                     setTotalTime(0); setTime(0);
                    setStartTime(Date.now());
                    setChallengeMode(true);
                    setRunning(true);
                }}
            >
                Lancer le défi 🎯
            </Button>
}

            

            {/* <Button
                variant="contained"
                color={caught ? "secondary" : "primary"}
                onClick={reset}
                sx={{ mb: 2 }}
            >
                {caught ? "Rejouer" : running ? "Recommencer" : "Démarrer"}
            </Button> */}

            <Box
                ref={boxRef}
                onMouseMove={handleMouseMove}
                sx={{
                    width: "100%",
                    height: 500,
                    background: "linear-gradient(0deg,#993,#151515)",
                    borderRadius: 3,
                    position: "relative",
                    overflow: "hidden",
                    cursor: "crosshair",
                }}
            >
                <Avatar src={imgMoi}
                    onClick={handleCatch}
                     draggable={false}
                    sx={{
                        width: 50,
                        height: 50, zIndex: 2,
                        border: running ? null : '3px dotted ' + (caught ? "#00ff88" : "#ff4444"),
                        position: "absolute",
                        left: pos.x,
                        top: pos.y,
                         cursor: "pointer",
                        transition: "background-color 0.3s",
                        boxShadow: caught ? "0 0 20px #00ff8855" : "0 0 15px #ff000055",
                    }}
                />
                {clones.map((c, cidx) => (
                    <Avatar src={imgMoi}
                        key={'clone' + cidx}
                         draggable={false}
                        onClick={() => removeClone(c)}
                        sx={{
                            position: 'absolute',
                            left: c.x + c.offX,
                            top: c.y + c.offY,
                            width: 50,
                            height: 50,
                            borderRadius: '50%',
                            userSelect: "none",
                        boxShadow: caught ? "0 0 20px #00ff8855" : "0 0 15px #ff000055",
                        }}
                    />
                ))}

            </Box>

            {caught && (
                <Typography variant="h6" sx={{ mt: 2, color: "#00ff88" }}>
                    Gagné en {time.toFixed(1)} s !
                </Typography>
            )}
        </Box>
    );
}
