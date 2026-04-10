import React, { useState, useEffect, useRef, useCallback } from 'react';

import { Box, Typography, Button, Paper } from '@mui/material';
import { LevelUpPending, MiniMap } from './LevelUp';
import { GameOverBox, getRandomVariantFromMass, getVariantById, loadMeteor, saveMeteor, STAGE_VARIANTS, STAGES } from './MeteorComponent';
import { StatBox } from './StatBox';

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 600;

const G = 0.9; // Constante gravitationnelle
const WORLD_SIZE = 5000;
const MAX_BODY_SPEED = 2;

const DEFAULT_STATE = {
    player: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, vx: 0, vy: 0, mass: 10, radius: 35 },
    currentStageIndex: 0,
    bodies: [],
    particles: [],
    camera: { x: 0, y: 0 },
    mousePos: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 },
    lastSpawn: 0,
    time: 0,
    isBoosting: false
};
const STAR_COLORS = [
    [255, 160, 120], // rouge clair
    [255, 220, 170], // jaune
    [255, 255, 255], // blanc
    [160, 180, 255]  // bleu clair
];
const starLayers = [
    { count: 150, size: 1, speed: 0.3, alpha: 0.4 },
    { count: 50, size: 1.5, speed: 0.6, alpha: 0.6 },
    { count: 20, size: 2, speed: 1, alpha: 0.8 }
];
// Fonction helper pour générer un nombre aléatoire suivant une distribution gaussienne (Box-Muller)
const randomGaussian = (mean, stdDev) => {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return z0 * stdDev + mean;
};
const CosmicMeteorGame = () => {
    // Étoiles avec effet de parallaxe (3 couches)

    const canvasRef = useRef(null);
    const MAX_BOOST_SPEED = 8;
    const NORMAL_MAX_SPEED = 2;
    const [gameState, setGameState] = useState(null);
    const [score, setScore] = useState(0);
    const [mass, setMass] = useState(10);
    const [currentStage, setCurrentStage] = useState(0);
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [miniMapState, updateMiniMapState] = useState(0);
    const [initialized, setInitialized] = useState(false);
    const [pendingStage, setPendingStage] = useState(0);
    const stateRef = useRef(structuredClone(DEFAULT_STATE));


    const [availableVariants, setAvailableVariants] = useState([]);
    const [selectedPlayerImage, setSelectedPlayerImage] = useState(null);

    // Ajoute un cache d'images chargées
    const imageCache = useRef({});

    // Fonction pour précharger les images
    const preloadImage = (url) => {
        if (imageCache.current[url]) return imageCache.current[url];

        const img = new Image();
        img.src = url;
        imageCache.current[url] = img;
        return img;
    };

    // Précharge toutes les images au montage
    useEffect(() => {
        // On récupère toutes les images de tous les variants de tous les stages
        Object.values(STAGE_VARIANTS).forEach(variants => {
            variants.forEach(variant => preloadImage(variant.img));
        });
        showVariantSelection(0);
    }, []);
    // Génération de corps célestes
    const generateBody = useCallback((minDist = 300) => {
        const currentStageIndex = stateRef.current.currentStageIndex;
        const currentStage = STAGES[currentStageIndex];

        // Détermine quel stage utiliser pour ce body
        let selectedStageIndex = currentStageIndex;
        const rand = Math.random();

        if (rand < 0.1 && currentStageIndex > 0) {
            // 10% de chance : stage inférieur
            selectedStageIndex = currentStageIndex - 1;
        } else if (rand < 0.15 && currentStageIndex < STAGES.length - 1) {
            // 5% de chance : stage supérieur
            selectedStageIndex = currentStageIndex + 1;
        }
        // Sinon 85% : stage courant (pas besoin de else)

        const selectedStage = STAGES[selectedStageIndex];
        const [minMass, maxMass] = selectedStage.bodyMassRange;

        // Masse aléatoire dans la plage du stage sélectionné

        // Génération de masse avec distribution gaussienne centrée sur le joueur
        const playerMass = stateRef.current.player.mass;
        const mean = Math.max(minMass, Math.min(maxMass, playerMass)); // Centre sur le joueur, limité à la plage
        const stdDev = (maxMass - minMass) / 4; // Écart-type = 1/4 de la plage (95% des valeurs dans la plage)

        let mass;
        let attempts = 0;
        do {
            mass = randomGaussian(mean, stdDev);
            attempts++;
            // Fallback si trop de tentatives (cas extrême)
            if (attempts > 50) {
                mass = minMass + Math.random() * (maxMass - minMass);
                break;
            }
        } while (mass < minMass || mass > maxMass);


        // Sélectionne un variant aléatoire pour ce stage
        const stageVariants = STAGE_VARIANTS[selectedStageIndex];
        if (!stageVariants || stageVariants.length === 0) {
            console.error(`Pas de variants pour le stage ${selectedStageIndex}`);
            return null;
        }

        const variant = stageVariants[Math.floor(Math.random() * stageVariants.length)];

        // Position aléatoire à distance minimale
        let x, y, dist;
        do {
            const angle = Math.random() * Math.PI * 2;
            dist = minDist + Math.random() * 800;
            x = stateRef.current.player.x + Math.cos(angle) * dist;
            y = stateRef.current.player.y + Math.sin(angle) * dist;
        } while (dist < minDist);

        // Calcule vitesse orbitale
        const dx = x - stateRef.current.player.x;
        const dy = y - stateRef.current.player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const orbitalSpeed = Math.sqrt(G * mass / (distance)) * 0.6;

        return {
            x, y,
            vx: -dy / distance * orbitalSpeed + (Math.random() - 0.5),
            vy: dx / distance * orbitalSpeed + (Math.random() - 0.5),
            mass: mass,
            radius: Math.sqrt(mass) * currentStage.playerScale, // Utilise le scale du stage actuel pour cohérence visuelle
            imageUrl: variant.img,
            variantId: variant.id,
            stageIndex: selectedStageIndex, // Pour savoir de quel stage vient le body
            trail: [], color: selectedStage.color,
            glow: selectedStage.glow,
        };
    }, []);

    // Initialisation
    useEffect(() => {
        setInitialized(true);
        const handleKeyDown = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                stateRef.current.isBoosting = true;
            }
        };

        const handleKeyUp = (e) => {
            if (e.code === 'Space') {
                stateRef.current.isBoosting = false;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    //reinitialisation
    useEffect(() => {
        if (initialized) {

            const state = stateRef.current;
            if (selectedPlayerImage == null) {
                state.player.imageUrl = STAGE_VARIANTS[state.currentStageIndex][0].img;

            }
            state.bodies = Array.from({ length: 15 }, () => generateBody(200));
            state.player.radius = Math.sqrt(state.player.mass) * STAGES[state.currentStageIndex].playerScale;
        }
    }, [initialized]);

    // Renommé pour plus de clarté car on ne sélectionne plus juste une image
    const showVariantSelection = (nvStage) => {
        if (nvStage === null || nvStage >= STAGES.length) return;

        if (nvStage > 0)
            saveMeteor(stateRef.current);
        // Au lieu de setAvailableImages, on passe les objets variants complets
        setAvailableVariants(STAGE_VARIANTS[nvStage]);
        setGameState('selectImage');
    };
    const confirmImageAndAdvance = (variant, savedGame) => {
        let newStageIndex = null;
        let newStage = null;
        if (savedGame != null) {
            stateRef.current = savedGame;
            variant = getVariantById(savedGame.player.variantId);
            newStageIndex = savedGame.currentStageIndex;
            newStage = STAGES[newStageIndex];
        }
        else {

            newStageIndex = pendingStage;
            newStage = STAGES[newStageIndex];

            stateRef.current.currentStageIndex = newStageIndex;
        }
        const state = stateRef.current;

        // On stocke la variante et ses stats dans le player
        state.player.imageUrl = variant.img;
        state.player.variantId = variant.id; // On garde juste l'id

        // Reset de la progression interne au stage
        state.player.absorbedMass = 0;

        // Recalcule le radius avec le nouveau scale du stage
        state.player.radius = Math.sqrt(state.player.mass) * newStage.playerScale;

        // Régénération des corps (on peut utiliser le scale ici aussi si besoin)
        //state.bodies = Array.from({ length: 15 }, () => generateBody(200));

        setCurrentStage(newStageIndex);
        setSelectedPlayerImage(variant.img);
        setShowLevelUp(false);
        setGameState('playing');
    };

    // Créer des particules
    const createParticles = (x, y, color, count = 20) => {
        const particles = [];
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;
            particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                color,
                size: 2 + Math.random() * 3
            });
        }
        return particles;
    };

    // Boucle de jeu
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationId;

        const gameLoop = (timestamp) => {
            const state = stateRef.current;
           
            state.time = timestamp;
            if (gameState !== 'playing') return;
            // Mise à jour de la caméra
            state.camera.x = state.player.x - CANVAS_WIDTH / 2;
            state.camera.y = state.player.y - CANVAS_HEIGHT / 2;
            // Sécurité : on définit des multiplicateurs par défaut si jamais variantStats n'est pas encore chargé
            const vStats = getVariantById(state.player.variantId)?.stats || { speedMult: 1, growthMult: 1, power: 1 };

            const currentStageData = STAGES[state.currentStageIndex];
            const playerScale = currentStageData.playerScale;
            
            const effectiveG = G*(playerScale**2); // G diminue avec les stages

            // --- MOUVEMENT ---
            if (state.isBoosting) {
                const targetAngle = Math.atan2(
                    state.mousePos.y + state.camera.y - state.player.y,
                    state.mousePos.x + state.camera.x - state.player.x
                );

                // STATS VARIANT : Application du speedMult sur la poussée (thrust)
                const baseThrust = 0.025;
                const thrust = baseThrust * vStats.speedMult;

                state.player.vx += Math.cos(targetAngle) * thrust;
                state.player.vy += Math.sin(targetAngle) * thrust;
            }

            // // Amortissement (plus fort quand pas de boost)
            const damping = state.isBoosting ? 0.999 : 0.995;
            state.player.vx *= damping;
            state.player.vy *= damping;

            // Limite de vitesse (dynamique selon le boost ET la variante)
            // STATS VARIANT : Application du speedMult sur la vitesse max
            const maxSpeed = (state.isBoosting ? MAX_BOOST_SPEED : NORMAL_MAX_SPEED) * vStats.speedMult;

            const speed = Math.sqrt(state.player.vx ** 2 + state.player.vy ** 2);
            if (speed > maxSpeed) {
                state.player.vx = (state.player.vx / speed) * maxSpeed;
                state.player.vy = (state.player.vy / speed) * maxSpeed;
            }

            // Mise à jour position joueur
            state.player.x += state.player.vx;
            state.player.y += state.player.vy;

            // Wraparound du monde
            if (state.player.x < 0) state.player.x += WORLD_SIZE;
            if (state.player.x > WORLD_SIZE) state.player.x -= WORLD_SIZE;
            if (state.player.y < 0) state.player.y += WORLD_SIZE;
            if (state.player.y > WORLD_SIZE) state.player.y -= WORLD_SIZE;

            // Mise à jour des corps célestes
            state.bodies.forEach((body, i) => {
                // Gravité du joueur
                const dx = state.player.x - body.x;
                const dy = state.player.y - body.y;
                const distSq = (dx * dx  + dy * dy);
                const dist = Math.sqrt(distSq);
                body.radius = Math.sqrt(body.mass) * playerScale;
                if (dist > 1) {
                    // Force gravitationnelle : F = G * M1 * M2 / d²
                    const gravityForce = effectiveG * (state.player.mass * body.mass) * vStats.power / (distSq);

                    // Accélération : a = F / m (la masse du body résiste à l'attraction)
                    const acceleration = gravityForce / body.mass;

                    body.vx += (dx / dist) * acceleration;
                    body.vy += (dy / dist) * acceleration;
                    if (body.isSatellite && dist > 400) {
                        body.isSatellite = false; // Redevient un body normal
                    }
                }
                // ========== Stabilisation orbitale pour les satellites ==========
                if (body.isSatellite && dist > 1) {
                    // Calcule la vitesse orbitale idéale pour cette distance
                    const idealOrbitalSpeed = Math.sqrt(effectiveG * state.player.mass / dist);

                    // Vecteur tangentiel (perpendiculaire au rayon)
                    const tangentX = -dy / dist;
                    const tangentY = dx / dist;

                    // Vitesse actuelle du satellite (relative au joueur)
                    const relVx = body.vx - state.player.vx;
                    const relVy = body.vy - state.player.vy;

                    // Projection de la vitesse sur la tangente (vitesse orbitale actuelle)
                    const currentOrbitalSpeed = relVx * tangentX + relVy * tangentY;

                    // Correction progressive vers la vitesse idéale (facteur 0.1 = correction douce)
                    const speedCorrection = (idealOrbitalSpeed - currentOrbitalSpeed) * 0.5;

                    body.vx += tangentX * speedCorrection;
                    body.vy += tangentY * speedCorrection;

                    // Optionnel : Amortissement de la composante radiale (évite oscillations)
                    const radialX = dx / dist;
                    const radialY = dy / dist;
                    const radialSpeed = relVx * radialX + relVy * radialY;

                    // Réduit la vitesse radiale de 10% à chaque frame
                    body.vx -= radialX * radialSpeed * 0.1;
                    body.vy -= radialY * radialSpeed * 0.1;
                }
                // Gravité entre corps
                const toSplice=[];
                state.bodies.forEach((other, j) => {
                    if (i >= j) return;
                    const dx2 = other.x - body.x;
                    const dy2 = other.y - body.y;
                    const distSq2 = (dx2 * dx2 + dy2 * dy2);
                    const dist2 = Math.sqrt(distSq2);

                    if (dist2 > 1) {
                        const force2 = effectiveG * (body.mass * other.mass) / (distSq2);
                        const fx = (dx2 / dist2) * force2 * playerScale * 0.1;
                        const fy = (dy2 / dist2) * force2 * playerScale * 0.1;

                        body.vx += fx / body.mass;
                        body.vy += fy / body.mass;
                        other.vx -= fx / other.mass;
                        other.vy -= fy / other.mass;
                    }
                    if (dist2 < other.radius + body.radius) {
                        // collision
                        let winner=body;
                        if(body.mass >other.mass){
                            //body winner
                            toSplice.push(j);
                              body.mass+=other.mass/2;
                        }
                        else{ //other winner
                                winner=other;
                              toSplice.push(i);
                              other.mass+=body.mass/2;
                        }
                      
                        // Vérifie descente de stage
                        const newStageIndex = STAGES.findIndex(stage =>
                            winner.mass >= stage.minMass && winner.mass < stage.maxMass
                        );

                        if (newStageIndex !== -1 && newStageIndex > winner.stageIndex) {
                            winner.stageIndex = newStageIndex;
                            const newVariant = getRandomVariantFromMass(winner.mass);
                            winner.imageUrl = newVariant.img;
                            winner.variantId = newVariant.id;
                        }
                        state.particles.push(...createParticles(winner.x, winner.y, '#FF4757', 30));
                    }
                });
                if(toSplice.length>0){
                    for(let s=0;s<toSplice.length;s++)
                     state.bodies.splice(toSplice[s], 1);
                }

                // Mise à jour position
                body.x += body.vx;
                body.y += body.vy;
                const bodySpeed = Math.sqrt(body.vx ** 2 + body.vy ** 2);
                if (bodySpeed > MAX_BODY_SPEED) {
                    body.vx = (body.vx / bodySpeed) * MAX_BODY_SPEED;
                    body.vy = (body.vy / bodySpeed) * MAX_BODY_SPEED;
                }

                // Trail
                // Trail (ajoute un point seulement tous les 3 frames)
                if (!body.trail) body.trail = [];
                if (!body.trailCounter) body.trailCounter = 0;

                body.trailCounter++;
                if (body.trailCounter >= 30) { // Un point tous les 3 frames
                    body.trail.push({ x: body.x, y: body.y });
                    body.trailCounter = 0;
                    updateMiniMapState(s => s + 1);
                }

                if (body.trail.length > 30) body.trail.shift(); // Garde 30 points espacés

                // Wraparound
                if (body.x < 0) body.x += WORLD_SIZE;
                if (body.x > WORLD_SIZE) body.x -= WORLD_SIZE;
                if (body.y < 0) body.y += WORLD_SIZE;
                if (body.y > WORLD_SIZE) body.y -= WORLD_SIZE;

                // Collision avec le joueur
                if ((dist < state.player.radius + body.radius) || dist < 50) {
                    const effectiveMassRatio = state.player.mass / body.mass;
                    const currentStageData = STAGES[state.currentStageIndex];

                    // ========== HELPER FUNCTIONS ==========
                    const updatePlayerMass = (massChange) => {
                        state.player.mass += massChange;
                        state.player.absorbedMass += massChange;
                        state.player.radius = Math.sqrt(state.player.mass) * currentStageData.playerScale;
                        setMass(state.player.mass);
                    };

                    const removeBody = () => {
                        state.bodies.splice(i, 1);
                    };

                    const createOrbitalSatellite = (mass, variant, angleOffset = 0) => {
                        const satStage = STAGES[variant.stageIndex];
                        const safeDistance = state.player.radius + Math.sqrt(mass) * satStage.playerScale + 40;
                        const baseAngle = Math.atan2(body.y - state.player.y, body.x - state.player.x);
                        const angle = baseAngle + angleOffset;

                        const satX = state.player.x + Math.cos(angle) * safeDistance;
                        const satY = state.player.y + Math.sin(angle) * safeDistance;
                        const orbitalSpeed = Math.sqrt(effectiveG * state.player.mass / safeDistance);

                        return {
                            x: satX,
                            y: satY,
                            vx: -Math.sin(angle) * orbitalSpeed * state.player.vx,
                            vy: Math.cos(angle) * orbitalSpeed * state.player.vy,
                            mass,
                            radius: Math.sqrt(mass) * satStage.playerScale,
                            imageUrl: variant.img,
                            variantId: variant.id,
                            stats: variant.stats,
                            stageIndex: variant.stageIndex,
                            color: satStage.color,
                            glow: satStage.glow,
                            trail: [],
                            trailCounter: 0,
                            isSatellite: true
                        };
                    };

                    const checkStageProgression = () => {
                        if (state.player.mass >= currentStageData.maxMass) {
                            setPendingStage(state.currentStageIndex + 1);
                            setShowLevelUp(true);
                            showVariantSelection(state.currentStageIndex + 1);
                        }
                    };

                    // ========== CAS 1 : ABSORPTION QUASI-COMPLÈTE (ratio >= 4/power) ==========
                    if (effectiveMassRatio >= 4 / vStats.power) {
                        const gainedMass = body.mass * vStats.growthMult * 0.75;

                        updatePlayerMass(gainedMass);
                        state.particles.push(...createParticles(state.player.x, state.player.y, body.color,
                            Math.round(vStats.power * vStats.power * 30)));
                        removeBody();
                        setScore(s => s + (state.currentStageIndex+1));
                        checkStageProgression();
                    }

                    // ========== CAS 2 : SATELLISATION (1 <= ratio < 4/power) ==========
                    else if (effectiveMassRatio >= 1) {

                        // CAS 2A : Double satellite (1 <= ratio < 2)
                        if (effectiveMassRatio < 2) {
                            const absorbedMass = body.mass * 0.25 * vStats.growthMult;
                            const satelliteMass = body.mass * 0.25;

                            updatePlayerMass(absorbedMass);

                            const satVariant = getRandomVariantFromMass(satelliteMass);
                            state.bodies.push(
                                createOrbitalSatellite(satelliteMass, satVariant, Math.PI / 6),
                                createOrbitalSatellite(satelliteMass, satVariant, -Math.PI / 6)
                            );
                            if(vStats.power>1)
                              state.bodies.push(createOrbitalSatellite(satelliteMass, satVariant, Math.PI / 4));
                            state.particles.push(...createParticles(state.player.x, state.player.y, body.color, 20));
                            removeBody();
                            setScore(s => s + (state.currentStageIndex+1));
                        }

                        // CAS 2B : Satellite unique (ratio >= 2)
                        else {
                            const absorptionRate = 0.3 + vStats.power * 0.2;
                            const absorbedMass = body.mass * absorptionRate * vStats.growthMult;
                            const satelliteMass = Math.max(0, body.mass - absorbedMass * vStats.power);

                            updatePlayerMass(absorbedMass);

                            if (satelliteMass > 0) {
                                const satVariant = getRandomVariantFromMass(satelliteMass);
                                const satStage = STAGES[satVariant.stageIndex];
                                createOrbitalSatellite(satelliteMass, satVariant, Math.PI / 10)
                                state.particles.push(...createParticles(state.player.x, state.player.y, body.color, 30));
                                 if(vStats.power>1)
                              state.bodies.push(createOrbitalSatellite(satelliteMass, satVariant, Math.PI / 4));
                         
                              
                            } 
                            
                                removeBody();
                            

                            state.particles.push(...createParticles(state.player.x, state.player.y, body.color, 10));
                            setScore(s => s + (state.currentStageIndex+1));
                        }

                        checkStageProgression();
                    }

                    // ========== CAS 3 : COLLISION DOMMAGEABLE (0.5 <= ratio < 1) ==========
                    else if (effectiveMassRatio >= 0.5) {
                        const lostMass = state.player.mass * 0.5;
                        state.player.mass -= lostMass;
                        state.player.absorbedMass = Math.max(0, state.player.absorbedMass - lostMass);

                        // Vérifie descente de stage
                        const newStageIndex = STAGES.findIndex(stage =>
                            state.player.mass >= stage.minMass && state.player.mass < stage.maxMass
                        );

                        if (newStageIndex !== -1 && newStageIndex < state.currentStageIndex) {
                            state.currentStageIndex = newStageIndex;
                            setCurrentStage(newStageIndex);

                            const newVariant = getRandomVariantFromMass(state.player.mass);
                            state.player.imageUrl = newVariant.img;
                            state.player.variantId = newVariant.id;
                            state.player.stats = newVariant.stats;
                        }

                        // Recalcule radius et éjecte le joueur
                        const newStage = STAGES[state.currentStageIndex];
                        state.player.radius = Math.sqrt(state.player.mass) * newStage.playerScale;

                        const dx = state.player.x - body.x;
                        const dy = state.player.y - body.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        const ejectDistance = state.player.radius + body.radius + 100;

                        state.player.x = body.x + (dx / dist) * ejectDistance;
                        state.player.y = body.y + (dy / dist) * ejectDistance;
                        state.player.vx += (dx / dist) * 3;
                        state.player.vy += (dy / dist) * 3;

                        state.particles.push(...createParticles(state.player.x, state.player.y, '#f5f365', 60));
                        removeBody();

                        setMass(state.player.mass);
                    }

                    // ========== CAS 4 : GAME OVER (ratio < 0.5) ==========
                    else {
                        setGameState('gameover');
                        state.particles.push(...createParticles(state.player.x, state.player.y, '#FF4757', 50));
                    }
                }
            });

            // Mise à jour particules
            state.particles = state.particles.filter(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.life -= 0.002;
                p.size *= 0.99;
                return p.life > 0;
            });

            // Spawn de nouveaux corps
            if (timestamp - state.lastSpawn > 500 && state.bodies.length < 30) {
                state.bodies.push(generateBody(400));
                state.lastSpawn = timestamp;
            }
            else if (state.bodies.length < 10)
                state.lastSpawn = 0;

            // Rendu
            ctx.fillStyle = '#0b1557ff';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);


            starLayers.forEach((layer, layerIndex) => {
                for (let i = 0; i < layer.count; i++) {
                    const seed = i * 137.5 + layerIndex * 1000;

                    // pseudo-random déterministe à partir du seed
                    const r1 = Math.abs(Math.sin(seed)) % 1;
                    const r2 = Math.abs(Math.sin(seed * 12.9898)) % 1;

                    const colorIndex = Math.floor(r1 * STAR_COLORS.length);
                    const [r, g, b] = STAR_COLORS[colorIndex];

                    // luminosité individuelle autour de celle du layer
                    const alpha = layer.alpha * (0.5 + r2 * 0.5);

                    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;

                    const baseX = (seed % WORLD_SIZE);
                    const baseY = ((seed * 1.618) % WORLD_SIZE);

                    const sx = (baseX - state.camera.x * layer.speed) % CANVAS_WIDTH;
                    const sy = (baseY - state.camera.y * layer.speed) % CANVAS_HEIGHT;

                    const x = sx < 0 ? sx + CANVAS_WIDTH : sx;
                    const y = sy < 0 ? sy + CANVAS_HEIGHT : sy;

                    ctx.beginPath();
                    ctx.arc(x, y, layer.size, 0, Math.PI * 2);
                    ctx.fill();
                }
            });

            // Étoiles
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            for (let i = 0; i < 100; i++) {
                const sx = ((i * 137.5) % WORLD_SIZE - state.camera.x) % CANVAS_WIDTH;
                const sy = ((i * 91.7) % WORLD_SIZE - state.camera.y) % CANVAS_HEIGHT;
                ctx.fillRect(sx, sy, 1, 1);
            }
            // Ajoute cette section juste après le rendu des étoiles et avant la grille d'influence :

            // Visualisation des bords du monde (portails)
            // Visualisation des bords du monde (portails)
            const edgeAlpha = 0.3;
            const edgeWidth = 80;

            // Calcule où sont les bords du monde par rapport à la caméra
            const leftEdgeScreen = -state.camera.x;
            const rightEdgeScreen = WORLD_SIZE - state.camera.x;
            const topEdgeScreen = -state.camera.y;
            const bottomEdgeScreen = WORLD_SIZE - state.camera.y;

            // Bord gauche visible ?
            if (leftEdgeScreen > -100 && leftEdgeScreen < CANVAS_WIDTH) {
                const gradient = ctx.createLinearGradient(leftEdgeScreen, 0, leftEdgeScreen + edgeWidth, 0);
                gradient.addColorStop(0, `rgba(0, 255, 255, ${edgeAlpha})`);
                gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
                ctx.fillStyle = gradient;
                ctx.fillRect(leftEdgeScreen, 0, edgeWidth, 600);
            }

            // Bord droit visible ?
            if (rightEdgeScreen > 0 && rightEdgeScreen < CANVAS_WIDTH + 100) {
                const gradient = ctx.createLinearGradient(rightEdgeScreen - edgeWidth, 0, rightEdgeScreen, 0);
                gradient.addColorStop(0, 'rgba(0, 255, 255, 0)');
                gradient.addColorStop(1, `rgba(0, 255, 255, ${edgeAlpha})`);
                ctx.fillStyle = gradient;
                ctx.fillRect(rightEdgeScreen - edgeWidth, 0, edgeWidth, 600);
            }

            // Bord haut visible ?
            if (topEdgeScreen > -100 && topEdgeScreen < CANVAS_HEIGHT) {
                const gradient = ctx.createLinearGradient(0, topEdgeScreen, 0, topEdgeScreen + edgeWidth);
                gradient.addColorStop(0, `rgba(0, 255, 255, ${edgeAlpha})`);
                gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, topEdgeScreen, CANVAS_WIDTH, edgeWidth);
            }

            // Bord bas visible ?
            if (bottomEdgeScreen > 0 && bottomEdgeScreen < CANVAS_HEIGHT + 100) {
                const gradient = ctx.createLinearGradient(0, bottomEdgeScreen - edgeWidth, 0, bottomEdgeScreen);
                gradient.addColorStop(0, 'rgba(0, 255, 255, 0)');
                gradient.addColorStop(1, `rgba(0, 255, 255, ${edgeAlpha})`);
                ctx.fillStyle = gradient;
                ctx.fillRect(0, bottomEdgeScreen - edgeWidth, CANVAS_WIDTH, edgeWidth);
            }

            // Particules sur les bords visibles
            [
                { edge: leftEdgeScreen, isVertical: true },
                { edge: rightEdgeScreen, isVertical: true },
                { edge: topEdgeScreen, isVertical: false },
                { edge: bottomEdgeScreen, isVertical: false }
            ].forEach(({ edge, isVertical }) => {
                const visible = isVertical ?
                    (edge > -100 && edge < CANVAS_WIDTH + 100) :
                    (edge > -100 && edge < CANVAS_WIDTH - 100);

                if (visible) {
                    for (let i = 0; i < 5; i++) {
                        const px = isVertical ? edge + (Math.random() - 0.5) * 30 : Math.random() * CANVAS_WIDTH;
                        const py = isVertical ? Math.random() * CANVAS_HEIGHT : edge + (Math.random() - 0.5) * 30;

                        ctx.fillStyle = `rgba(0, 255, 255, ${0.3 + Math.random() * 0.5})`;
                        ctx.beginPath();
                        ctx.arc(px, py, 1 + Math.random() * 2, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            });
            // Grille d'influence gravitationnelle
            if (state.player.mass > 30) {
                ctx.strokeStyle = 'rgba(100, 200, 255, 0.1)';
                ctx.lineWidth = 1;
                const influenceRadius = Math.sqrt(state.player.mass) * 15 * playerScale;
                ctx.beginPath();
                ctx.arc(
                    state.player.x - state.camera.x,
                    state.player.y - state.camera.y,
                    influenceRadius, 0, Math.PI * 2
                );
                ctx.stroke();
            }

            // Trails des corps
            state.bodies.forEach(body => {
                if (body.trail && body.trail.length > 1) {
                    ctx.strokeStyle = body.color;
                    ctx.lineWidth = 2;
                    ctx.globalAlpha = 0.2;
                    ctx.beginPath();
                    ctx.moveTo(body.trail[0].x - state.camera.x, body.trail[0].y - state.camera.y);
                    body.trail.forEach(p => {
                        ctx.lineTo(p.x - state.camera.x, p.y - state.camera.y);
                    });
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                }
            });

            // Corps célestes
            state.bodies.forEach(body => {
                const x = body.x - state.camera.x;
                const y = body.y - state.camera.y;

                // Lueur
                const gradient = ctx.createRadialGradient(x, y, 0, x, y, body.radius * 1.5);
                gradient.addColorStop(0, body.glow + '80');
                gradient.addColorStop(0.5, body.glow + '40');
                gradient.addColorStop(1, body.glow + '00');
                ctx.fillStyle = gradient;
                ctx.fillRect(x - body.radius * 2, y - body.radius * 2, body.radius * 4, body.radius * 4);

                // Image du corps
                const img = imageCache.current[body.imageUrl];
                if (img && img.complete) {
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(x, y, body.radius, 0, Math.PI * 2);
                    ctx.clip();
                    ctx.drawImage(img, x - body.radius, y - body.radius, body.radius * 2, body.radius * 2);
                    ctx.restore();
                } else {
                    // Fallback si l'image n'est pas chargée
                    ctx.fillStyle = body.color;
                    ctx.beginPath();
                    ctx.arc(x, y, body.radius, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Indicateur de danger OU satellite
                if (body.isSatellite) {
                    ctx.strokeStyle = '#FFD700';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(x, y, body.radius + 3, 0, Math.PI * 2);
                    ctx.stroke();
                } else if (body.mass > state.player.mass) {
                    ctx.strokeStyle = '#FF4757';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(x, y, body.radius + 5, 0, Math.PI * 2);
                    ctx.stroke();
                }
            });



            // Particules
            state.particles.forEach(p => {
                ctx.fillStyle = p.color + Math.floor(p.life * 255).toString(16).padStart(2, '0');
                ctx.beginPath();
                ctx.arc(p.x - state.camera.x, p.y - state.camera.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });

            // Joueur
            const px = state.player.x - state.camera.x;
            const py = state.player.y - state.camera.y;

            // Lueur du joueur
            const playerGradient = ctx.createRadialGradient(px, py, 0, px, py, state.player.radius * 2);
            playerGradient.addColorStop(0, '#4ECDC4AA');
            playerGradient.addColorStop(0.6, '#4ECDC444');
            playerGradient.addColorStop(1, '#4ECDC400');
            ctx.fillStyle = playerGradient;
            ctx.fillRect(px - state.player.radius * 2.5, py - state.player.radius * 2.5,
                state.player.radius * 5, state.player.radius * 5);

            // Image du joueur
            const playerImg = imageCache.current[state.player.imageUrl];
            if (playerImg && playerImg.complete) {
                ctx.save();
                ctx.beginPath();
                ctx.arc(px, py, state.player.radius, 0, Math.PI * 2);
                ctx.clip();
                ctx.drawImage(playerImg, px - state.player.radius, py - state.player.radius,
                    state.player.radius * 2, state.player.radius * 2);
                ctx.restore();
            } else {
                // Fallback
                ctx.fillStyle = '#4ECDC4';
                ctx.beginPath();
                ctx.arc(px, py, state.player.radius, 0, Math.PI * 2);
                ctx.fill();
            }

            // Contour
            ctx.strokeStyle = '#95E1D3';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(px, py, state.player.radius, 0, Math.PI * 2);
            ctx.stroke();

            // Direction
            // Direction (vers la souris au lieu de la vitesse)
            const targetAngle = Math.atan2(
                state.mousePos.y + state.camera.y - state.player.y,
                state.mousePos.x + state.camera.x - state.player.x
            );

            ctx.strokeStyle = state.isBoosting ? '#FFD700' : '#95E1D3'; // Jaune si boost actif
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(
                px + Math.cos(targetAngle) * state.player.radius * 1.5,
                py + Math.sin(targetAngle) * state.player.radius * 1.5
            );
            ctx.stroke();

            animationId = requestAnimationFrame(gameLoop);
        };

        animationId = requestAnimationFrame(gameLoop);
        return () => cancelAnimationFrame(animationId);
    }, [gameState, generateBody]);

    // Gestion souris
    const handleMouseMove = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        stateRef.current.mousePos = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const handleTouchMove = (e) => {
        e.preventDefault();
        const rect = canvasRef.current.getBoundingClientRect();
        const touch = e.touches[0];
        stateRef.current.mousePos = {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
        };
    };
    const continueGame = () => {
        stateRef.current.bodies = [];
        stateRef.current.lastSpawn = 0;
        setScore(score / 2);
        setGameState('playing');
    }
    const resetGame = () => {
        const {variantId, imageUrl} = stateRef.current.player ;
        stateRef.current = structuredClone(DEFAULT_STATE);
stateRef.current.player.variantId=variantId;
stateRef.current.player.imageUrl=imageUrl;
        setScore(0);
        setMass(10);
        setCurrentStage(0)
        setGameState('playing');
    };
    const getStage = () => STAGES[currentStage];


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
            {/* Stats */}
            <StatBox resetGame={resetGame} getStage={getStage} score={score} mass={mass} />

            {/* Canvas */}
            <Box sx={{ position: 'relative' }}>
                <canvas
                    ref={canvasRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    onMouseMove={handleMouseMove}
                    onTouchMove={handleTouchMove}
                    style={{
                        border: '4px solid #00bcd4',
                        borderRadius: '8px',
                        boxShadow: '0 8px 32px rgba(0, 188, 212, 0.3)',
                        cursor: 'none',
                        display: 'block'
                    }}
                />
                {gameState === 'playing' && (
                    <MiniMap
                        player={stateRef.current.player}
                        bodies={stateRef.current.bodies}
                        worldSize={WORLD_SIZE}
                        updateState={miniMapState}
                    />
                )}
                {/* Game Over Overlay */}
                {gameState === 'gameover' && (
                    <GameOverBox score={score} continueGame={continueGame} resetGame={resetGame} getStage={() => { return getStage().name }} />
                )}
                {gameState === 'selectImage' && availableVariants.length > 0 && (
                    <LevelUpPending availableVariants={availableVariants}
                        confirmImageAndAdvance={confirmImageAndAdvance}
                        mass={mass} pendingStage={pendingStage} />
                )}

            </Box>

        </Box>
    );
}

export default CosmicMeteorGame;