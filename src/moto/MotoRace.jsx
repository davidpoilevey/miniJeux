import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { GameOver } from '../ChuckNorrisFact';
import { WIDTH, HEIGHT, STEP, RIDERS, MAX_SPEED, createInitialState, step, standings } from './engine';
import { createEngineSound } from './engineSound';
import { render } from './render';
import { useGifSprites } from '../dungeon/gifSprite';
import { soundManager, soundMap } from '../rpg/sons/SoundManager';
import playerSrc from './assets/player.png';
import rivalSrc from './assets/rival.png';
import hitGif from './assets/hit.gif';
import electroGif from './assets/electro.gif';
import explosionGif from './assets/explosion.gif';
import kaboumGif from './assets/kaboum.gif';

const loadImage = (src) => {
    const img = new Image();
    img.src = src;
    return img;
};

const KEYS = {
    ArrowUp: 'up',
    ArrowDown: 'down', s: 'down',
    ArrowLeft: 'left', q: 'left', a: 'left',
    ArrowRight: 'right', d: 'right',
};
const STRIKES = { z: -1, x: 1 }; // Z : coup à gauche, X : coup à droite
// soundManager est partagé entre les jeux : on préfixe nos clés
const SOUNDS = ['punch', 'slash', 'explosion', 'explosion2', 'coupReussi', 'coupVide', 'metalImpact', 'levelUp'];

const chrono = (t) => `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, '0')}`;

const MotoRace = () => {
    const canvasRef = useRef(null);
    const stateRef = useRef(null);
    if (!stateRef.current) stateRef.current = createInitialState();
    const inputRef = useRef({ up: false, down: false, left: false, right: false, strike: 0 });
    const spritesRef = useRef(null);
    if (!spritesRef.current) spritesRef.current = { player: loadImage(playerSrc), rival: loadImage(rivalSrc) };
    spritesRef.current.fx = useGifSprites({ hit: hitGif, electro: electroGif, explosion: explosionGif, kaboum: kaboumGif });
    const [results, setResults] = useState(null);
    const [gameOverOpen, setGameOverOpen] = useState(false);
    const engineRef = useRef(null);

    useEffect(() => {
        soundManager.loadSounds(Object.fromEntries(SOUNDS.map(k => [`moto.${k}`, soundMap[k]])));

        // moteur muet quand l'onglet est caché
        const onVisibility = () => engineRef.current?.[document.hidden ? 'suspend' : 'resume']();
        document.addEventListener('visibilitychange', onVisibility);
        return () => {
            document.removeEventListener('visibilitychange', onVisibility);
            engineRef.current?.close();
            engineRef.current = null;
        };
    }, []);

    useEffect(() => {
        const onKey = (pressed) => (e) => {
            // on laisse tranquilles les champs de saisie (pseudo du GameOver…)
            const el = e.target;
            if (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)) return;
            // le navigateur n'autorise le son qu'après une action du joueur
            if (pressed && !engineRef.current) engineRef.current = createEngineSound();
            const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
            if (STRIKES[key]) {
                if (pressed && !e.repeat) inputRef.current.strike = STRIKES[key];
                e.preventDefault();
                return;
            }
            const action = KEYS[key];
            if (!action) return;
            e.preventDefault();
            inputRef.current[action] = pressed;
        };
        const down = onKey(true), up = onKey(false);
        window.addEventListener('keydown', down);
        window.addEventListener('keyup', up);
        return () => {
            window.removeEventListener('keydown', down);
            window.removeEventListener('keyup', up);
        };
    }, []);

    // Boucle de jeu : physique à pas fixe (vitesse réelle même si l'écran rame), rendu à chaque frame
    useEffect(() => {
        const ctx = canvasRef.current.getContext('2d');
        let rafId;
        let last = performance.now();
        let acc = 0;
        let lastResults = 0;

        const frame = (now) => {
            const state = stateRef.current;
            acc += Math.min(100, now - last);
            last = now;
            while (acc >= STEP * 1000) {
                acc -= STEP * 1000;
                step(state, inputRef.current);
            }
            render(ctx, state, spritesRef.current);
            for (const key of new Set(state.events)) soundManager.play(`moto.${key}`, { volume: 0.6 });
            engineRef.current?.update(state.speed / MAX_SPEED, inputRef.current.up && !state.finished);
            state.events.length = 0;

            // classement affiché à l'arrivée, puis mis à jour à mesure que les autres franchissent la ligne
            if (state.finished && now - lastResults > 500) {
                lastResults = now;
                setResults({ ...state.finished, table: standings(state) });
            }
            rafId = requestAnimationFrame(frame);
        };

        rafId = requestAnimationFrame(frame);
        return () => cancelAnimationFrame(rafId);
    }, []);

    const restart = () => {
        stateRef.current = createInitialState();
        setResults(null);
        setGameOverOpen(false);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2, background: '#111', minHeight: '100vh', color: '#eee' }}>
            <Box sx={{ position: 'relative', width: '100%', maxWidth: 960 }}>
                <canvas
                    ref={canvasRef}
                    width={WIDTH}
                    height={HEIGHT}
                    style={{
                        width: '100%',
                        height: 'auto',
                        aspectRatio: `${WIDTH} / ${HEIGHT}`,
                        imageRendering: 'pixelated',
                        display: 'block',
                        border: '4px solid #333',
                        borderRadius: 8,
                        boxSizing: 'border-box',
                    }}
                />
                {results && (
                    <Paper sx={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        p: 2, background: 'rgba(0,0,0,0.85)', color: '#fff', width: 'min(92%, 520px)', maxHeight: '94%', overflowY: 'auto', boxSizing: 'border-box',
                    }}>
                        <Typography variant="h5" sx={{ fontFamily: 'monospace', fontWeight: 'bold', color: results.rank <= 3 ? '#ffd54f' : '#fff' }}>
                            {results.rank === 1 ? 'VICTOIRE !' : `${results.rank}e / ${RIDERS}`} — {chrono(results.time)}
                        </Typography>
                        <Typography sx={{ fontFamily: 'monospace', fontSize: 13, opacity: 0.8 }}>
                            place {results.place} + chrono {results.chrono} + coups ×{results.hits} {results.fights}
                        </Typography>
                        <Typography sx={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#76ff03', mb: 1 }}>
                            SCORE {results.score}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                            <Button variant="outlined" color="warning" fullWidth onClick={restart}>Rejouer</Button>
                            <Button variant="contained" color="warning" fullWidth onClick={() => setGameOverOpen(true)}>Continuer</Button>
                        </Stack>
                        <Box component="ol" sx={{ fontFamily: 'monospace', fontSize: 12, pl: 3, mt: 1, mb: 0, columnCount: 2, columnGap: 3 }}>
                            {results.table.map((r) => (
                                <li key={r.name} style={{ color: r.isPlayer ? '#76ff03' : '#ddd', fontWeight: r.isPlayer ? 'bold' : 'normal' }}>
                                    {r.name} {r.time !== null ? chrono(r.time) : '…'}
                                </li>
                            ))}
                        </Box>
                    </Paper>
                )}
            </Box>
            <GameOver
                open={gameOverOpen}
                score={results?.score ?? 0}
                gameName="Moto Rash"
                gameOverReason={results && `${results.rank === 1 ? 'Victoire' : `${results.rank}e / ${RIDERS}`} en ${chrono(results.time)}, ${results.hits} coup${results.hits > 1 ? 's' : ''} dans la tronche`}
                handleClose={() => setGameOverOpen(false)}
                handleRestart={restart}
            />
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.7 }}>
                ↑ : gaz — ↓ / S : frein — ← → / Q D : se pencher — Z : coup à gauche — X : coup à droite
            </Typography>
        </Box>
    );
};

export default MotoRace;
