import React, { useState, useEffect, useRef } from 'react';

import { Box } from '@mui/material';
import { LevelUpPending, MiniMap } from './LevelUp';
import { clearMeteor, GameOverBox, saveMeteor, STAGE_VARIANTS, STAGES } from './MeteorComponent';
import { StatBox } from './StatBox';
import { CANVAS_WIDTH, CANVAS_HEIGHT, WORLD_SIZE, START_MASS, STEP_MS, createInitialState, restoreState, step } from './engine';
import { renderWorld } from './render';
import { soundManager, soundMap } from '../rpg/sons/SoundManager';
import { GameOver } from '../ChuckNorrisFact';

const DPR = Math.min(2, window.devicePixelRatio || 1);

// Son joué pour chaque événement du moteur : [clé, volume]
const EVENT_SOUNDS = {
    absorb: ['glou', 0.5],
    satellite: ['gold', 0.35],
    crash: ['sword', 0.15],
    damage: ['slash', 0.7],
    death: ['fire', 0.8],
    levelup: ['finNiveau', 0.7],
    victory: ['finNiveau', 0.9],
};

const STOP_EVENTS = ['levelup', 'gameover', 'victory'];

const CosmicMeteorGame = () => {
    const canvasRef = useRef(null);
    const stateRef = useRef(null);
    const inputRef = useRef({ aimX: CANVAS_WIDTH / 2 + 100, aimY: CANVAS_HEIGHT / 2, keyBoost: false, pointerBoost: false });
    const imageCache = useRef({});
    const lastSoundAt = useRef({});

    const [gameState, setGameState] = useState('selectImage');
    const [pendingStage, setPendingStage] = useState(0);
    const [hud, setHud] = useState({ score: 0, mass: START_MASS, stage: 0 });

    // Précharge images et sons
    useEffect(() => {
        Object.values(STAGE_VARIANTS).forEach(variants => variants.forEach(variant => {
            const img = new Image();
            img.src = variant.img;
            imageCache.current[variant.img] = img;
        }));
        soundManager.loadSounds({
            glou: soundMap.glou,
            gold: soundMap.gold,
            sword: soundMap.sword,
            slash: soundMap.slash,
            fire: soundMap.fire,
            finNiveau: soundMap.finNiveau,
        });
    }, []);

    // Barre espace = boost
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                inputRef.current.keyBoost = true;
            }
        };
        const handleKeyUp = (e) => {
            if (e.code === 'Space') inputRef.current.keyBoost = false;
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    const syncHud = () => {
        const s = stateRef.current;
        setHud({ score: Math.floor(s.score), mass: s.player.mass, stage: s.currentStageIndex });
    };

    const playSound = (type) => {
        const sound = EVENT_SOUNDS[type];
        if (!sound) return;
        const [key, volume] = sound;
        const now = performance.now();
        if (now - (lastSoundAt.current[key] || 0) < 90) return; // évite la mitraillette
        lastSoundAt.current[key] = now;
        soundManager.play(key, { volume });
    };

    // Boucle de jeu : physique à pas fixe, rendu à chaque frame
    useEffect(() => {
        if (gameState !== 'playing') return;
        const ctx = canvasRef.current.getContext('2d');
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

        const state = stateRef.current;
        let rafId;
        let last = performance.now();
        let acc = 0;
        let lastHud = 0;

        const frame = (now) => {
            const raw = inputRef.current;
            const input = { aimX: raw.aimX, aimY: raw.aimY, boosting: raw.keyBoost || raw.pointerBoost };

            acc += Math.min(100, now - last);
            last = now;
            let stopped = null;
            while (acc >= STEP_MS && !stopped) {
                acc -= STEP_MS;
                step(state, input, (e) => {
                    playSound(e.type);
                    if (STOP_EVENTS.includes(e.type)) stopped = e.type;
                });
            }

            renderWorld(ctx, state, imageCache.current, input, now);

            if (stopped === 'levelup') {
                syncHud();
                setPendingStage(state.currentStageIndex + 1);
                setGameState('selectImage');
                return;
            }
            if (stopped === 'gameover' || stopped === 'victory') {
                if (stopped === 'victory') clearMeteor();
                syncHud();
                setGameState(stopped);
                return;
            }
            if (now - lastHud > 100) {
                syncHud();
                lastHud = now;
            }
            rafId = requestAnimationFrame(frame);
        };

        rafId = requestAnimationFrame(frame);
        return () => cancelAnimationFrame(rafId);
    }, [gameState]);

    // Souris / doigt : viser, maintenir = boost
    const setAim = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        inputRef.current.aimX = (e.clientX - rect.left) * CANVAS_WIDTH / rect.width;
        inputRef.current.aimY = (e.clientY - rect.top) * CANVAS_HEIGHT / rect.height;
    };
    const handlePointerDown = (e) => {
        setAim(e);
        inputRef.current.pointerBoost = true;
        canvasRef.current.setPointerCapture(e.pointerId);
    };
    const handlePointerUp = () => {
        inputRef.current.pointerBoost = false;
    };

    const chooseVariant = (variant) => {
        if (pendingStage === 0) {
            stateRef.current = createInitialState(variant);
        } else {
            const state = stateRef.current;
            state.currentStageIndex = pendingStage;
            state.player.imageUrl = variant.img;
            state.player.variantId = variant.id;
            saveMeteor(state);
        }
        syncHud();
        setGameState('playing');
    };

    const loadSavedGame = (savedGame) => {
        stateRef.current = restoreState(savedGame);
        syncHud();
        setGameState('playing');
    };

    const continueGame = () => {
        const state = stateRef.current;
        state.bodies = [];
        state.spawnTimer = 0;
        state.score = Math.floor(state.score / 2);
        state.player.invuln = 120;
        syncHud();
        setGameState('playing');
    };

    const resetGame = () => {
        setPendingStage(0);
        setGameState('selectImage');
    };

    const getStage = () => STAGES[hud.stage];

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                background: 'linear-gradient(to bottom, #1a237e, #000000)',
                color: 'white',
                p: 2
            }}
        >
            <StatBox resetGame={resetGame} getStage={getStage} score={hud.score} mass={hud.mass} />

            <Box sx={{ position: 'relative', width: '100%', maxWidth: CANVAS_WIDTH + 8 }}>
                <canvas
                    ref={canvasRef}
                    width={CANVAS_WIDTH * DPR}
                    height={CANVAS_HEIGHT * DPR}
                    onPointerMove={setAim}
                    onPointerDown={handlePointerDown}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    onContextMenu={(e) => e.preventDefault()}
                    style={{
                        width: '100%',
                        height: 'auto',
                        aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}`,
                        border: '4px solid #00bcd4',
                        borderRadius: '8px',
                        boxShadow: '0 8px 32px rgba(0, 188, 212, 0.3)',
                        cursor: 'none',
                        touchAction: 'none',
                        display: 'block',
                        boxSizing: 'border-box',
                        background: '#050a26'
                    }}
                />
                {gameState === 'playing' && stateRef.current && (
                    <MiniMap
                        player={stateRef.current.player}
                        bodies={stateRef.current.bodies}
                        worldSize={WORLD_SIZE}
                    />
                )}
                {gameState === 'gameover' && (
                    <GameOverBox score={hud.score} continueGame={continueGame} resetGame={resetGame} getStage={() => getStage().name} />
                )}
                <GameOver
                    open={gameState === 'victory'}
                    score={hud.score}
                    gameName="meteor"
                    gameOverReason="🕳️ Trou noir ultime atteint !"
                    handleClose={resetGame}
                    handleRestart={resetGame}
                />
                {gameState === 'selectImage' && (
                    <LevelUpPending
                        availableVariants={STAGE_VARIANTS[pendingStage]}
                        onChoose={chooseVariant}
                        onLoad={loadSavedGame}
                        mass={hud.mass}
                        pendingStage={pendingStage}
                    />
                )}
            </Box>
        </Box>
    );
};

export default CosmicMeteorGame;
