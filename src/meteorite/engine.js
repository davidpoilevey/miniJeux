import { STAGES, getRandomVariantFromMass, getVariantById, stageIndexForMass } from './MeteorComponent';

export const CANVAS_WIDTH = 1000;
export const CANVAS_HEIGHT = 600;
export const WORLD_SIZE = 5000;
export const START_MASS = 10;
export const STEP_MS = 1000 / 60; // la physique tourne à 60 pas/s quel que soit l'écran

// Physique (unités : pixels et pas de simulation)
const G = 0.9;              // attraction du joueur sur les corps
const G_BODIES = 0.09;      // attraction entre corps
const G_ON_PLAYER = 0.05;   // attraction des corps sur le joueur (un corps 10× plus lourd au contact te retient)
const BASE_THRUST = 0.025;
const NORMAL_MAX_SPEED = 2;
const MAX_BOOST_SPEED = 8;
const MAX_BODY_SPEED = 2;
const MAX_BODIES = 30;
const SATELLITE_GAP = 40;   // écart initial entre la surface du joueur et l'orbite du satellite
const SATELLITE_DECAY = 0.08; // l'orbite se resserre jusqu'à ce que le satellite soit englouti
const INVULN_STEPS = 90;
const DEATH_STEPS = 70;

// Échelle visuelle : le joueur fait PLAYER_R_MIN px en entrant dans un stade, PLAYER_R_MAX en le quittant.
// Tous les corps sont dessinés relativement (rayon ∝ √masse), donc la taille à l'écran dit directement le danger.
const PLAYER_R_MIN = 26;
const PLAYER_R_MAX = 60;
const MAX_BODY_R = 400;
const ZOOM_EASING = 0.03;

// Masse des corps qui apparaissent : log-normale autour de 0.35× le joueur
// → ~35% absorbables, ~50% satellisables, ~10% dangereux, ~3% mortels
// Après les étoiles, la médiane monte jusqu'à SPAWN_RATIO_MEDIAN_END au dernier stade
const SPAWN_RATIO_MEDIAN = 0.35;
const SPAWN_RATIO_MEDIAN_END = 0.55;
const SPAWN_HARDENING_STAGE = 7; // Étoile Naine
const SPAWN_RATIO_SPREAD = 0.9;

const DEFAULT_STATS = { speedMult: 1, growthMult: 1, power: 1 };

let nextBodyId = 1;

// Distance la plus courte sur le tore
export const wrap = (d) => d - WORLD_SIZE * Math.round(d / WORLD_SIZE);
const wrapPos = (v) => ((v % WORLD_SIZE) + WORLD_SIZE) % WORLD_SIZE;

const randomGaussian = (mean, stdDev) => {
    const u1 = 1 - Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2) * stdDev + mean;
};

const statsOf = (player) => getVariantById(player.variantId)?.stats || DEFAULT_STATS;

// Avancement dans le stade, sur une échelle log (0 → 1)
export const stageProgress = (mass, stageIndex) => {
    const stage = STAGES[stageIndex];
    const lo = Math.max(stage.minMass, START_MASS);
    const hi = stage.maxMass === Infinity ? lo * 1000 : stage.maxMass;
    const p = Math.log(Math.max(mass, lo) / lo) / Math.log(hi / lo);
    return Math.min(1, Math.max(0, p));
};

const targetZoom = (state) => {
    const { mass } = state.player;
    const r = PLAYER_R_MIN + (PLAYER_R_MAX - PLAYER_R_MIN) * stageProgress(mass, state.currentStageIndex);
    return r / Math.sqrt(mass);
};

const radiusOf = (state, mass) => Math.min(MAX_BODY_R, Math.max(2, state.view.zoom * Math.sqrt(mass)));

const isOnScreen = (state, x, y) =>
    Math.abs(wrap(x - state.player.x)) < CANVAS_WIDTH / 2 + 100 &&
    Math.abs(wrap(y - state.player.y)) < CANVAS_HEIGHT / 2 + 100;

const applyVariant = (target, variant) => {
    const stage = STAGES[variant.stageIndex];
    target.imageUrl = variant.img;
    target.variantId = variant.id;
    target.stageIndex = variant.stageIndex;
    target.color = stage.color;
    target.glow = stage.glow;
};

const makeBody = (state, mass, x, y, vx, vy) => {
    const body = {
        id: nextBodyId++,
        x, y, vx, vy, mass,
        r: radiusOf(state, mass),
        trail: [], trailCounter: 0,
        rot: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.02,
        age: 0,
    };
    applyVariant(body, getRandomVariantFromMass(mass));
    return body;
};

const spawnMedian = (stageIndex) => {
    const t = Math.max(0, (stageIndex - SPAWN_HARDENING_STAGE + 1) / (STAGES.length - SPAWN_HARDENING_STAGE));
    return SPAWN_RATIO_MEDIAN + (SPAWN_RATIO_MEDIAN_END - SPAWN_RATIO_MEDIAN) * t;
};

const spawnBody = (state, minDist) => {
    const { player } = state;
    const ratio = Math.min(20, Math.max(0.02,
        Math.exp(randomGaussian(Math.log(spawnMedian(state.currentStageIndex)), SPAWN_RATIO_SPREAD))));

    const angle = Math.random() * Math.PI * 2;
    const dist = minDist + Math.random() * 800;

    // Vitesse orbitale autour du joueur : sous-orbitale au début (les corps tombent vers toi),
    // légèrement sur-orbitale après les étoiles (ils tournent autour, il faut aller les chercher)
    const playerR = radiusOf(state, player.mass);
    const orbitFactor = state.currentStageIndex >= SPAWN_HARDENING_STAGE ? 1.1 : 0.6;
    const orbitalSpeed = Math.sqrt(G * playerR * playerR / dist) * orbitFactor;

    return makeBody(state, player.mass * ratio,
        wrapPos(player.x + Math.cos(angle) * dist),
        wrapPos(player.y + Math.sin(angle) * dist),
        -Math.sin(angle) * orbitalSpeed + (Math.random() - 0.5),
        Math.cos(angle) * orbitalSpeed + (Math.random() - 0.5));
};

const freshView = () => ({ zoom: 0, shake: 0, flash: 0, pulse: 0, leadX: 0, leadY: 0 });

export const createInitialState = (variant) => {
    const state = {
        player: {
            x: WORLD_SIZE / 2, y: WORLD_SIZE / 2, vx: 0, vy: 0,
            mass: START_MASS, variantId: variant.id, imageUrl: variant.img,
            rot: 0, invuln: 0,
        },
        currentStageIndex: 0,
        score: 0,
        bodies: [],
        particles: [],
        absorbing: [],
        view: freshView(),
        scroll: { x: 0, y: 0 },
        spawnTimer: 0,
        dying: 0,
    };
    state.view.zoom = targetZoom(state);
    state.player.r = radiusOf(state, START_MASS);
    for (let i = 0; i < 15; i++) state.bodies.push(spawnBody(state, 250));
    return state;
};

// Les URLs d'images changent d'un build à l'autre : on les retrouve via l'id de la variante
const freshImage = (entity) => getVariantById(entity.variantId)?.img || entity.imageUrl;

// Remet d'aplomb une sauvegarde (y compris celles de l'ancienne version)
export const restoreState = (saved) => {
    const state = {
        ...saved,
        score: saved.score || 0,
        particles: [],
        absorbing: [],
        view: freshView(),
        scroll: saved.scroll || { x: 0, y: 0 },
        spawnTimer: 0,
        dying: 0,
    };
    state.player = { rot: 0, ...saved.player, imageUrl: freshImage(saved.player), invuln: 60 };
    state.view.zoom = targetZoom(state);
    state.player.r = radiusOf(state, state.player.mass);
    state.bodies = (saved.bodies || []).filter(Boolean).map(b => ({
        rot: 0, spin: 0.005, trailCounter: 0,
        ...b,
        id: nextBodyId++,
        imageUrl: freshImage(b),
        trail: [],
        age: 100,
        r: radiusOf(state, b.mass),
        isSatellite: Boolean(b.isSatellite && b.orbitGap !== undefined),
    }));
    return state;
};

const burst = (state, x, y, color, count, speed = 3, baseVx = 0, baseVy = 0) => {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const v = speed * (0.3 + Math.random());
        state.particles.push({
            x, y,
            vx: baseVx + Math.cos(angle) * v,
            vy: baseVy + Math.sin(angle) * v,
            life: 1,
            decay: 0.015 + Math.random() * 0.02,
            color,
            size: 1.5 + Math.random() * 2.5,
        });
    }
    if (state.particles.length > 800) state.particles.splice(0, state.particles.length - 800);
};

const createSatellite = (state, mass, angle, dir) => {
    const { player } = state;
    const sat = makeBody(state, mass, 0, 0, player.vx, player.vy);
    const orbitR = player.r + sat.r + SATELLITE_GAP;
    sat.x = wrapPos(player.x + Math.cos(angle) * orbitR);
    sat.y = wrapPos(player.y + Math.sin(angle) * orbitR);
    sat.isSatellite = true;
    sat.orbitGap = SATELLITE_GAP;
    sat.orbitAngle = angle;
    sat.orbitDir = dir;
    sat.age = 100;
    return sat;
};

// ---------------------------------------------------------------------------
// Un pas de simulation. `emit` reçoit les événements (sons, level-up, game over).
// ---------------------------------------------------------------------------
export const step = (state, input, emit) => {
    const { player, view } = state;
    const stats = statsOf(player);
    const alive = state.dying === 0;

    player.r = radiusOf(state, player.mass);
    state.bodies.forEach(b => { b.r = radiusOf(state, b.mass); });
    const powerG = G * stats.power * player.r * player.r;

    // --- Joueur ---
    if (alive) {
        if (input.boosting) {
            const px = CANVAS_WIDTH / 2 - view.leadX;
            const py = CANVAS_HEIGHT / 2 - view.leadY;
            const angle = Math.atan2(input.aimY - py, input.aimX - px);
            const cos = Math.cos(angle), sin = Math.sin(angle);
            player.vx += cos * BASE_THRUST * stats.speedMult;
            player.vy += sin * BASE_THRUST * stats.speedMult;

            // Réacteur
            state.particles.push({
                x: player.x - cos * player.r, y: player.y - sin * player.r,
                vx: player.vx - cos * 2 + (Math.random() - 0.5), vy: player.vy - sin * 2 + (Math.random() - 0.5),
                life: 1, decay: 0.05, color: '#FFB347', size: 2 + Math.random() * 2,
            });
        }

        // Les corps attirent aussi le joueur
        state.bodies.forEach(body => {
            if (body.isSatellite) return;
            const dx = wrap(body.x - player.x);
            const dy = wrap(body.y - player.y);
            const distSq = dx * dx + dy * dy;
            if (distSq < 1) return;
            const dist = Math.sqrt(distSq);
            const a = G_ON_PLAYER * body.r * body.r / distSq;
            player.vx += (dx / dist) * a;
            player.vy += (dy / dist) * a;
        });

        const damping = input.boosting ? 0.999 : 0.995;
        player.vx *= damping;
        player.vy *= damping;

        // Limite douce : au-delà du max on ralentit progressivement (garde l'élan et les rebonds)
        const maxSpeed = (input.boosting ? MAX_BOOST_SPEED : NORMAL_MAX_SPEED) * stats.speedMult;
        const speed = Math.hypot(player.vx, player.vy);
        if (speed > maxSpeed) {
            const s = Math.max(maxSpeed, speed * 0.97) / speed;
            player.vx *= s;
            player.vy *= s;
        }

        player.x = wrapPos(player.x + player.vx);
        player.y = wrapPos(player.y + player.vy);
        state.scroll.x += player.vx;
        state.scroll.y += player.vy;

        // Évaporation : rester immobile fait perdre du terrain
        const stage = STAGES[state.currentStageIndex];
        if (stage.evaporation) {
            player.mass = Math.max(stage.minMass, player.mass * (1 - stage.evaporation.rate / 60));
            if (Math.random() < 0.6) {
                const angle = Math.random() * Math.PI * 2;
                const v = 0.4 + Math.random() * 0.8;
                state.particles.push({
                    x: player.x + Math.cos(angle) * player.r, y: player.y + Math.sin(angle) * player.r,
                    vx: player.vx + Math.cos(angle) * v, vy: player.vy + Math.sin(angle) * v,
                    life: 0.7, decay: 0.015, color: stage.evaporation.color, size: 1 + Math.random() * 1.5,
                });
            }
        }
    }

    // --- Corps célestes ---
    const free = state.bodies.filter(b => !b.isSatellite);

    // Gravité entre corps
    for (let i = 0; i < free.length; i++) {
        const a = free[i];
        for (let j = i + 1; j < free.length; j++) {
            const b = free[j];
            const dx = wrap(b.x - a.x);
            const dy = wrap(b.y - a.y);
            const distSq = dx * dx + dy * dy;
            if (distSq < 1) continue;
            const dist = Math.sqrt(distSq);
            const f = G_BODIES / distSq;
            a.vx += (dx / dist) * f * b.r * b.r;
            a.vy += (dy / dist) * f * b.r * b.r;
            b.vx -= (dx / dist) * f * a.r * a.r;
            b.vy -= (dy / dist) * f * a.r * a.r;
        }
    }

    state.bodies.forEach(body => {
        body.age++;
        body.rot += body.spin;

        if (body.isSatellite) {
            // Orbite circulaire qui se resserre lentement
            body.orbitGap = Math.max(-body.r, body.orbitGap - SATELLITE_DECAY);
            const orbitR = player.r + body.r + body.orbitGap;
            body.orbitAngle += body.orbitDir * Math.sqrt(powerG / orbitR) / orbitR;
            const nx = wrapPos(player.x + Math.cos(body.orbitAngle) * orbitR);
            const ny = wrapPos(player.y + Math.sin(body.orbitAngle) * orbitR);
            body.vx = wrap(nx - body.x);
            body.vy = wrap(ny - body.y);
            body.x = nx;
            body.y = ny;
            return;
        }

        // Attraction du joueur (accélération indépendante de la masse du corps)
        if (alive) {
            const dx = wrap(player.x - body.x);
            const dy = wrap(player.y - body.y);
            const distSq = dx * dx + dy * dy;
            if (distSq > 1) {
                const dist = Math.sqrt(distSq);
                const a = powerG / distSq;
                body.vx += (dx / dist) * a;
                body.vy += (dy / dist) * a;
            }
        }

        const bodySpeed = Math.hypot(body.vx, body.vy);
        if (bodySpeed > MAX_BODY_SPEED) {
            body.vx = (body.vx / bodySpeed) * MAX_BODY_SPEED;
            body.vy = (body.vy / bodySpeed) * MAX_BODY_SPEED;
        }
        body.x = wrapPos(body.x + body.vx);
        body.y = wrapPos(body.y + body.vy);

        if (++body.trailCounter >= 4) {
            body.trailCounter = 0;
            body.trail.push({ x: body.x, y: body.y });
            if (body.trail.length > 24) body.trail.shift();
        }
    });

    // Collisions entre corps : le plus lourd récupère la moitié de l'autre
    for (let i = 0; i < state.bodies.length; i++) {
        const a = state.bodies[i];
        if (a.dead) continue;
        for (let j = i + 1; j < state.bodies.length; j++) {
            const b = state.bodies[j];
            if (b.dead || (a.isSatellite && b.isSatellite)) continue;
            const dx = wrap(b.x - a.x);
            const dy = wrap(b.y - a.y);
            if (Math.hypot(dx, dy) >= a.r + b.r) continue;

            const [winner, loser] = a.mass >= b.mass ? [a, b] : [b, a];
            const gained = loser.mass / 2;
            if (!winner.isSatellite) {
                winner.vx = (winner.vx * winner.mass + loser.vx * gained) / (winner.mass + gained);
                winner.vy = (winner.vy * winner.mass + loser.vy * gained) / (winner.mass + gained);
            }
            winner.mass += gained;
            winner.r = radiusOf(state, winner.mass);
            loser.dead = true;

            if (stageIndexForMass(winner.mass) > winner.stageIndex) {
                applyVariant(winner, getRandomVariantFromMass(winner.mass));
            }

            const cx = wrapPos(a.x + dx * a.r / (a.r + b.r));
            const cy = wrapPos(a.y + dy * a.r / (a.r + b.r));
            burst(state, cx, cy, winner.glow, 24, 2.5, winner.vx, winner.vy);
            if (isOnScreen(state, cx, cy)) emit({ type: 'crash' });
            if (a.dead) break;
        }
    }

    // Collisions avec le joueur
    if (alive) {
        for (const body of state.bodies) {
            if (body.dead) continue;
            const dx = wrap(body.x - player.x);
            const dy = wrap(body.y - player.y);
            const dist = Math.hypot(dx, dy);
            if (dist >= player.r + body.r) continue;

            const ratio = player.mass / body.mass;
            const contactX = wrapPos(player.x + dx * player.r / (player.r + body.r));
            const contactY = wrapPos(player.y + dy * player.r / (player.r + body.r));
            const impactAngle = Math.atan2(dy, dx);

            // CAS 1 : absorption quasi complète (√power : les variantes puissantes restent avantagées sans tout rafler)
            if (ratio >= 4 / Math.sqrt(stats.power)) {
                player.mass += body.mass * stats.growthMult * 0.75;
                body.dead = true;
                state.absorbing.push({
                    imageUrl: body.imageUrl, glow: body.glow, color: body.color,
                    angle: impactAngle, dist, r: body.r, rot: body.rot, t: 0,
                });
                burst(state, contactX, contactY, body.glow, Math.round(stats.power * stats.power * 20), 2.5, player.vx, player.vy);
                state.score += state.currentStageIndex + 1;
                view.pulse = Math.max(view.pulse, 0.1);
                view.shake = Math.max(view.shake, 1.5);
                emit({ type: 'absorb' });
            }

            // CAS 2 : satellisation
            else if (ratio >= 1) {
                // Sens de l'orbite = sens dans lequel le corps arrivait
                const cross = dx * (body.vy - player.vy) - dy * (body.vx - player.vx);
                const dir = cross < 0 ? -1 : 1;
                let satMass, offsets;

                if (ratio < 2) {
                    player.mass += body.mass * 0.25 * stats.growthMult;
                    satMass = body.mass * 0.25;
                    offsets = stats.power > 1 ? [-0.9, 0, 0.9] : [-0.45, 0.45];
                } else {
                    const absorbed = body.mass * (0.3 + stats.power * 0.2) * stats.growthMult;
                    player.mass += absorbed;
                    satMass = Math.max(0, body.mass - absorbed * stats.power);
                    offsets = satMass <= 0 ? [] : stats.power > 1 ? [-0.45, 0.45] : [0];
                }

                offsets.forEach(o => state.bodies.push(createSatellite(state, satMass, impactAngle + o, dir)));
                body.dead = true;
                burst(state, contactX, contactY, body.glow, 30, 3, player.vx, player.vy);
                state.score += state.currentStageIndex + 1;
                view.pulse = Math.max(view.pulse, 0.15);
                view.shake = Math.max(view.shake, 4);
                emit({ type: 'satellite' });
            }

            // Juste touché : on traverse tant qu'on clignote
            else if (player.invuln > 0) {
                continue;
            }

            // CAS 3 : collision dommageable, on perd la moitié de la masse
            else if (ratio >= 0.5) {
                player.mass *= 0.5;
                const newStageIndex = stageIndexForMass(player.mass);
                if (newStageIndex < state.currentStageIndex) {
                    state.currentStageIndex = newStageIndex;
                    const variant = getRandomVariantFromMass(player.mass);
                    player.imageUrl = variant.img;
                    player.variantId = variant.id;
                }
                // Recul
                player.vx -= (dx / dist) * 6;
                player.vy -= (dy / dist) * 6;
                player.invuln = INVULN_STEPS;
                body.dead = true;
                burst(state, contactX, contactY, '#f5f365', 60, 4);
                burst(state, contactX, contactY, body.glow, 30, 3, body.vx, body.vy);
                view.shake = 14;
                view.flash = 0.6;
                emit({ type: 'damage' });
            }

            // CAS 4 : game over
            else {
                state.dying = DEATH_STEPS;
                burst(state, player.x, player.y, '#4ECDC4', 60, 5, body.vx, body.vy);
                burst(state, player.x, player.y, '#FF4757', 60, 3.5, body.vx, body.vy);
                view.shake = 24;
                view.flash = 1;
                emit({ type: 'death' });
                break;
            }
        }
    }

    state.bodies = state.bodies.filter(b => !b.dead);

    // --- Effets ---
    state.particles = state.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.life -= p.decay;
        return p.life > 0;
    });

    // Corps absorbés : aspirés en spirale
    state.absorbing = state.absorbing.filter(a => {
        a.t += 1 / 24;
        a.angle += 0.2;
        a.dist *= 0.86;
        a.rot += 0.3;
        return a.t < 1;
    });

    view.zoom += (targetZoom(state) - view.zoom) * ZOOM_EASING;
    view.shake = view.shake > 0.1 ? view.shake * 0.88 : 0;
    view.flash = view.flash > 0.01 ? view.flash * 0.92 : 0;
    view.pulse *= 0.85;
    view.leadX += (player.vx * 18 - view.leadX) * 0.04;
    view.leadY += (player.vy * 18 - view.leadY) * 0.04;
    player.rot += 0.003;
    if (player.invuln > 0) player.invuln--;

    // --- Spawn ---
    state.spawnTimer--;
    if (state.bodies.length < 10 || (state.spawnTimer <= 0 && state.bodies.length < MAX_BODIES)) {
        state.bodies.push(spawnBody(state, 400));
        state.spawnTimer = 30;
    }

    // --- Fin de partie / évolution ---
    if (state.dying > 0) {
        if (--state.dying === 0) emit({ type: 'gameover' });
    } else if (player.mass >= STAGES[state.currentStageIndex].maxMass) {
        emit({ type: state.currentStageIndex === STAGES.length - 1 ? 'victory' : 'levelup' });
    }
};
