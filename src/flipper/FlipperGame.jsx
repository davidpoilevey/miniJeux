import { useEffect, useRef, useReducer } from 'react';
import Matter, { Body, World } from 'matter-js';
import { Box, Typography } from '@mui/material';
import { BALL, FLIPPER_CoteLEFT, FLIPPER_CoteRIGHT, FLIPPER_H, FLIPPER_LEFT, FLIPPER_RIGHT, FLIPPER_W, PLUNGER, TROUS } from './tableConfig';
import { createBodies } from './bodies';
import { animateFlipper, applyFlipperImpulse, checkHoles, clampFlipper, getCfgByLabel, handleTargetHit, lerpFlipper, setFlipperAngle } from './utils';
import { INITIAL_STATE, gameReducer } from './gameState';
import FlipperPanel from './FlipperPanel';

export const COLORS = {
    bg: '#1a1a2e',
    table: '#16213e',
    flipper: '#e94560',
    bumper: '#f5a623',
    ball: '#ffffff',
    wall: '#0f3460',
    text: '#ffffff',
};

const leftConfigs = [FLIPPER_LEFT, FLIPPER_CoteLEFT];
const rightConfigs = [FLIPPER_RIGHT, FLIPPER_CoteRIGHT];

export default function FlipperGame() {
    const canvasRef = useRef(null);
    const engineRef = useRef(null);
    const renderRef = useRef(null);
    const runnerRef = useRef(null);
    const bodiesRef = useRef({});
    const capturedRef = useRef(null);
    const dispatchRef = useRef(null);   // ← accès au dispatch depuis la game loop

    const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);

    // Angles cibles (lerp)
    const targetsRef = useRef({
        left: leftConfigs.map(cfg => cfg.angleDown),
        right: rightConfigs.map(cfg => cfg.angleDown),
    });

    // Flippers actifs (pour l'impulsion)
    const activeRef = useRef({});  // { flipperLeft: true/false, ... }


    // On garde dispatch à jour dans le ref
    dispatchRef.current = dispatch;

    // ── Init Matter ─────────────────────────────────────────────────────────────
    useEffect(() => {
        const { Engine, Render, Runner, Events } = Matter;

        const engine = Engine.create({
            gravity: { x: 0, y: 1 },
            positionIterations: 10,   // défaut: 6
            velocityIterations: 8,
        });
        const render = Render.create({
            canvas: canvasRef.current,
            engine,
            options: {
                width: FLIPPER_W,
                height: FLIPPER_H,
                background: COLORS.bg,
                wireframes: false,
            },
        });
        const runner = Runner.create({ delta: 1000 / 120 }); // 120fps au lieu de 60

        engineRef.current = engine;
        renderRef.current = render;
        runnerRef.current = runner;

        const bodies = createBodies(engine, FLIPPER_W, FLIPPER_H);

        bodies.flippersLeft.forEach((flipper, i) => {
            const cfg = leftConfigs[i];
            setFlipperAngle(flipper, cfg.pivot, cfg.angleDown, cfg.width / 2);
        });
        bodies.flippersRight.forEach((flipper, i) => {
            const cfg = rightConfigs[i];
            setFlipperAngle(flipper, cfg.pivot, cfg.angleDown, -cfg.width / 2);
        });

        bodiesRef.current = bodies;

        const { walls, balls, targets, plunger, bumpers, trous, flippersLeft, flippersRight } = bodies;

        // Corps simples
        World.add(engine.world, [...trous, ...targets, ...walls, ...balls, plunger, ...bumpers, ...flippersLeft, ...flippersRight])


        // ── Collisions ────────────────────────────────────────────────────────
        Events.on(engine, 'collisionStart', (e) => {
            e.pairs.forEach(({ bodyA, bodyB }) => {
                const ball = [bodyA, bodyB].find(b => b.label.startsWith('ball'));
                const bumper = [bodyA, bodyB].find(b => b.label?.startsWith('bumper'));
                const floor = [bodyA, bodyB].find(b => b.label === 'floor');
                const flipper = [bodyA, bodyB].find(b => b.label?.startsWith('flipper'));
                const target = [bodyA, bodyB].find(b => b.label?.startsWith('target'));
if(ball && target)
handleTargetHit(bodyA, bodyB, dispatchRef.current);
                if (ball && bumper) {
                    dispatchRef.current({ type: 'BUMP', points: bumper.scoreValue ?? 100 });
                    // Flash visuel
                    const originalColor = bumper.render.fillStyle;
                    bumper.render.fillStyle = '#ffffff';
                    setTimeout(() => { bumper.render.fillStyle = originalColor; }, 120);
                }

                if (ball && floor) {
                    dispatchRef.current({ type: 'LOSE_BALL' });
                }
                const isActive = flipper && activeRef.current[flipper.label];

            });
        });
        Events.on(engine, 'beforeUpdate', () => {
            bodiesRef.current.flippersLeft.forEach((f, i) => {
                const cfg = leftConfigs[i];
                lerpFlipper(f, cfg.pivot, targetsRef.current.left[i], cfg.width / 2, 0.5);
            });
            bodiesRef.current.flippersRight.forEach((f, i) => {
                const cfg = rightConfigs[i];
                lerpFlipper(f, cfg.pivot, targetsRef.current.right[i], -cfg.width / 2, 0.5);
            });
            checkHoles(
                bodiesRef.current.balls[0],
                TROUS,
                capturedRef,
                dispatchRef.current,
                (hole) => console.log(`Sorti du trou ${hole.id}`)
            );

        });

        Render.run(render);
        Runner.run(runner, engine);

        return () => {
            Render.stop(render);
            Runner.stop(runner);
            Engine.clear(engine);
            render.canvas.remove();
        };
    }, []);

    const chargeStartRef = useRef(null);
    const plungerIntervalRef = useRef(null);

    const reset = () => {
        const ball = bodiesRef.current.balls[0];
        Body.setPosition(ball, { x: FLIPPER_W - 30, y: FLIPPER_H - 80 });

    }
    // ── Clavier ─────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!state.lives) return;   // plus de vies, on coupe les controls

        const onKeyDown = (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'z') {
                
                targetsRef.current.left = leftConfigs.map(cfg => cfg.angleUp);

                // Impulsion immédiate si la balle est sur un flipper gauche
                const ball = bodiesRef.current.balls[0];
                if(!activeRef.current['flipperLeft'])
                bodiesRef.current.flippersLeft.forEach((flipper, i) => {
                    const cfg = leftConfigs[i];
                    const dist = Math.hypot(ball.position.x - flipper.position.x,
                        ball.position.y - flipper.position.y);
                    if (dist < cfg.width) {
                        applyFlipperImpulse(ball, flipper, cfg);
                    }
                });
                activeRef.current['flipperLeft'] = true;
            }

            if (e.key === 'ArrowRight' || e.key === '/') {
                targetsRef.current.right = rightConfigs.map(cfg => cfg.angleUp);

                const ball = bodiesRef.current.balls[0];
                 if(!activeRef.current['flipperRight'])
                bodiesRef.current.flippersRight.forEach((flipper, i) => {
                    const cfg = rightConfigs[i];
                    const dist = Math.hypot(ball.position.x - flipper.position.x,
                        ball.position.y - flipper.position.y);
                    if (dist < cfg.width) {
                        applyFlipperImpulse(ball, flipper, cfg);
                    }
                });
                activeRef.current['flipperRight'] = true;
            }

            if (e.key === ' ' && chargeStartRef.current == null) {
                chargeStartRef.current = Date.now();
                plungerIntervalRef.current = setInterval(() => {
                    const charge = Math.min((Date.now() - chargeStartRef.current) / 1000, 1);
                    Body.setPosition(bodiesRef.current.plunger, { x: PLUNGER.x, y: PLUNGER.y + charge * 40 });
                }, 16);
            }
        };

        const onKeyUp = (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'z') {

                activeRef.current[leftConfigs[0].options.label] = false;
                targetsRef.current.left = leftConfigs.map(cfg => cfg.angleDown);
            }
            if (e.key === 'ArrowRight' || e.key === '/') {

                activeRef.current[rightConfigs[0].options.label] = false;
                targetsRef.current.right = rightConfigs.map(cfg => cfg.angleDown);
            }
            if (e.key === ' ' && chargeStartRef.current != null) {
                clearInterval(plungerIntervalRef.current);
                plungerIntervalRef.current = null;
                const force = Math.min((Date.now() - chargeStartRef.current) / 1000, 1);
                chargeStartRef.current = null;
                Body.setVelocity(bodiesRef.current.balls[0], { x: 0, y: -force * 40 });
                setTimeout(() => {
                    Body.setPosition(bodiesRef.current.plunger, { x: PLUNGER.x, y: PLUNGER.y });
                }, 500);
            }
        };

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
        };
    }, [state.lives]);   // ← se rebanche quand les vies changent

    // ── Render ──────────────────────────────────────────────────────────────────
    return (
        <Box sx={{ display: 'flex', alignItems: 'stretch' }}>
            <canvas ref={canvasRef} width={FLIPPER_W} height={FLIPPER_H} />
            <FlipperPanel
                state={state}
                onRestart={() => {
                    dispatch({ type: 'RESET' });
                    reset();
                }}
            />
        </Box>
    );
}