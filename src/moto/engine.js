// Moteur pseudo-3D façon Road Rash / OutRun : la route est une suite de segments,
// chacun avec une courbure et une hauteur. Rien n'est vraiment en 3D, tout est projeté.
import { stepCombat, RIVAL_WEAPONS } from './combat';

export const WIDTH = 640;
export const HEIGHT = 360;
export const STEP = 1 / 60; // la physique tourne à 60 pas/s quel que soit l'écran

export const SEGMENT_LENGTH = 200;
export const RUMBLE_LENGTH = 3;      // segments par bande de bordure (rouge/blanc)
export const ROAD_WIDTH = 1100;      // demi-largeur de la route
export const LANES = 2;
export const CAMERA_HEIGHT = 1000;
export const CAMERA_DEPTH = 1 / Math.tan((100 / 2) * Math.PI / 180); // FOV 100°
export const DRAW_DISTANCE = 300;    // nombre de segments dessinés
export const PLAYER_Z = CAMERA_HEIGHT * CAMERA_DEPTH; // la moto est juste devant la caméra

export const MAX_SPEED = SEGMENT_LENGTH / STEP; // 1 segment par pas
export const KMH_AT_MAX = 240;
const ACCEL = MAX_SPEED / 5;
const BRAKE = -MAX_SPEED;
const DECEL = -MAX_SPEED / 5;
const OFFROAD_DECEL = -MAX_SPEED / 2;
const OFFROAD_LIMIT = MAX_SPEED / 4;
const CENTRIFUGAL = 0.25;  // dans les virages serrés, il faut lever le pied
const BG_SPEED = 0.002;    // défilement des montagnes dans les virages

export const RIDERS = 16;        // joueur compris
export const RIDER_H = 500;      // hauteur d'un motard dans le monde
// largeur du PNG d'un motard en unités de route (route = -1..1), soit ~0.13 ;
// mais l'image est surtout du vide autour : seul le tiers central (roue, jambes) compte pour les chocs
const SPRITE_W = RIDER_H * 0.52 * (HEIGHT / WIDTH) / ROAD_WIDTH;
const HITBOX_RATIO = 0.3;
const RIDER_W = SPRITE_W * HITBOX_RATIO;
const BIKE_LEN = 300;
const GRID_GAP = 800;            // écart entre deux lignes de la grille de départ
const GRID_ROWS = RIDERS / 2 - 1;
const COUNTDOWN = 3;
// élastique : un adversaire distancé accélère (jusqu'à +RUBBER_BAND), mais pas s'il est juste derrière
const RUBBER_BAND = 0.15;
const RUBBER_START = 1500;  // en deçà de cet écart, pas de bonus : on se bat à la loyale
const RUBBER_FULL = 6000;   // écart supplémentaire pour atteindre le bonus maximal

// Score pour le GameOver (le plus haut gagne) : la place, le chrono et les coups dans la tronche
const SCORE_PER_PLACE = 1000;
const SCORE_PER_SECOND = 10;  // par seconde gagnée sous SCORE_TIME_REF
const SCORE_TIME_REF = 300;
const SCORE_PER_HIT = 500;

const RIVAL_NAMES = ['Le Boucher', 'Mad Max', 'Gégé la Vipère', 'Kiki Kawa', 'Dédé Bitume', 'La Fouine',
    'Big Jo', 'Nanard', 'Rico Turbo', 'Momo Jante', 'Sister Chrome', 'Le Zonard', 'Tata Torque',
    'Jojo Durite', 'Bébert'];

export const COLORS = {
    light: { road: '#6b6b6b', grass: '#3f9b3a', rumble: '#eeeeee', lane: '#eeeeee' },
    dark: { road: '#646464', grass: '#36892f', rumble: '#c0392b' },
    start: { road: '#ffffff', grass: '#3f9b3a', rumble: '#ffffff' },
    fog: '#b8d4dc',
};

// ---------- Construction de la route ----------

const LEN = { SHORT: 25, MEDIUM: 50, LONG: 100 };
const HILL = { NONE: 0, LOW: 20, MEDIUM: 40, HIGH: 60 };
const CURVE = { NONE: 0, EASY: 2, MEDIUM: 4, HARD: 6, HAIRPIN: 10 }; // en épingle, flèche enfoncée ne suffit plus au-delà de ~95 km/h

const easeIn = (a, b, p) => a + (b - a) * p * p;
const easeInOut = (a, b, p) => a + (b - a) * (-Math.cos(p * Math.PI) / 2 + 0.5);

export function buildTrack() {
    const segments = [];
    const lastY = () => segments.length ? segments[segments.length - 1].p2.world.y : 0;

    const addSegment = (curve, y) => {
        const n = segments.length;
        segments.push({
            index: n,
            p1: { world: { y: lastY(), z: n * SEGMENT_LENGTH }, camera: {}, screen: {} },
            p2: { world: { y, z: (n + 1) * SEGMENT_LENGTH }, camera: {}, screen: {} },
            curve,
            color: Math.floor(n / RUMBLE_LENGTH) % 2 ? COLORS.dark : COLORS.light,
        });
    };

    // entrée progressive, maintien, sortie progressive ; y = dénivelé en segments
    const addRoad = (enter, hold, leave, curve, y) => {
        const startY = lastY();
        const endY = startY + y * SEGMENT_LENGTH;
        const total = enter + hold + leave;
        for (let n = 0; n < enter; n++) addSegment(easeIn(0, curve, n / enter), easeInOut(startY, endY, n / total));
        for (let n = 0; n < hold; n++) addSegment(curve, easeInOut(startY, endY, (enter + n) / total));
        for (let n = 0; n < leave; n++) addSegment(easeInOut(curve, 0, n / leave), easeInOut(startY, endY, (enter + hold + n) / total));
    };

    const straight = (num = LEN.MEDIUM) => addRoad(num, num, num, 0, 0);
    const hill = (num, height) => addRoad(num, num, num, 0, height);
    const curve = (num, c, height = HILL.NONE) => addRoad(num, num, num, c, height);
    const rollingHills = (num = LEN.SHORT, height = HILL.LOW) => {
        addRoad(num, num, num, 0, height / 2);
        addRoad(num, num, num, 0, -height);
        addRoad(num, num, num, CURVE.EASY, height);
        addRoad(num, num, num, 0, 0);
        addRoad(num, num, num, -CURVE.EASY, height / 2);
        addRoad(num, num, num, 0, 0);
    };
    const sCurves = () => {
        addRoad(LEN.MEDIUM, LEN.MEDIUM, LEN.MEDIUM, -CURVE.EASY, HILL.NONE);
        addRoad(LEN.MEDIUM, LEN.MEDIUM, LEN.MEDIUM, CURVE.MEDIUM, HILL.MEDIUM);
        addRoad(LEN.MEDIUM, LEN.MEDIUM, LEN.MEDIUM, CURVE.EASY, -HILL.LOW);
        addRoad(LEN.MEDIUM, LEN.MEDIUM, LEN.MEDIUM, -CURVE.EASY, HILL.MEDIUM);
        addRoad(LEN.MEDIUM, LEN.MEDIUM, LEN.MEDIUM, -CURVE.MEDIUM, -HILL.MEDIUM);
    };
    // épingle courte et brutale : il faut freiner avant et entrer à la corde
    const hairpin = (dir) => addRoad(15, 30, 15, dir * CURVE.HAIRPIN, 0);
    // petites bosses rapprochées, typiques des routes de campagne
    const bumps = () => {
        [5, -2, -5, 8, 5, -7, 5, -2].forEach(h => addRoad(10, 10, 10, 0, h));
    };

    straight(LEN.SHORT);
    rollingHills();
    curve(LEN.MEDIUM, CURVE.MEDIUM, HILL.LOW);
    hill(LEN.MEDIUM, HILL.HIGH);
    hairpin(-1); // juste derrière la crête, on la découvre au dernier moment
    sCurves();
    curve(LEN.LONG, -CURVE.EASY, HILL.MEDIUM);
    hill(LEN.SHORT, -HILL.MEDIUM);
    bumps();
    curve(LEN.MEDIUM, CURVE.HARD, -HILL.LOW);
    straight();
    hairpin(1);
    hill(LEN.LONG, HILL.HIGH);
    curve(LEN.LONG, -CURVE.MEDIUM, -HILL.HIGH);
    sCurves();
    rollingHills(LEN.SHORT, HILL.MEDIUM);
    curve(LEN.SHORT, CURVE.HARD);
    curve(LEN.SHORT, -CURVE.HARD);
    hill(LEN.MEDIUM, -HILL.MEDIUM);
    bumps();
    curve(LEN.LONG, CURVE.MEDIUM, HILL.MEDIUM);
    hairpin(-1);
    // on redescend à l'altitude de départ pour boucler
    addRoad(200, 200, 200, -CURVE.EASY, -lastY() / SEGMENT_LENGTH);

    // ligne de départ juste devant la première ligne de la grille
    const startIndex = Math.floor((PLAYER_Z + GRID_ROWS * GRID_GAP) / SEGMENT_LENGTH);
    segments[startIndex + 2].color = COLORS.start;
    segments[startIndex + 3].color = COLORS.start;

    const length = segments.length * SEGMENT_LENGTH;
    return { segments, length, finishZ: (startIndex + 2) * SEGMENT_LENGTH + length }; // 1 tour
}

export const findSegment = (track, z) =>
    track.segments[Math.floor(z / SEGMENT_LENGTH) % track.segments.length];

const wrap = (v, max) => {
    let r = v % max;
    return r < 0 ? r + max : r;
};

// ---------- État & physique ----------

// Grille de départ : 2 motos par ligne, le joueur part bon dernier
function createRivals() {
    const weapons = [...RIVAL_WEAPONS].sort(() => Math.random() - 0.5);
    const rivals = [];
    for (let i = 0; i < RIDERS - 1; i++) {
        const row = Math.floor(i / 2);
        const lane = i % 2 ? 0.35 : -0.35;
        rivals.push({
            z: PLAYER_Z + (GRID_ROWS - row) * GRID_GAP, // distance cumulée, ne boucle pas : sert au classement
            x: lane,
            lane,
            speed: 0,
            maxSpeed: MAX_SPEED * (0.8 + Math.random() * 0.17),
            name: RIVAL_NAMES[i],
            weapon: weapons[i],
            cooldown: 0,
            immuneUntil: 0,
            finishTime: null,
        });
    }
    return rivals;
}

export function createInitialState() {
    return {
        track: buildTrack(),
        distance: 0,  // distance cumulée de la caméra
        position: 0,  // la même, ramenée sur la boucle
        speed: 0,
        playerX: 0.35, // -1 .. 1 = sur la route, au-delà = dans l'herbe
        lean: 0,
        bgOffset: 0,
        rivals: createRivals(),
        rank: RIDERS,
        countdown: COUNTDOWN,
        time: 0,         // chrono depuis le GO
        finished: null,  // { rank, time } une fois la ligne franchie
        weapon: 'hit',
        attacks: [],
        strikeCooldown: 0,
        message: null,
        events: [],      // sons à jouer, vidés par le composant à chaque frame
        hitsLanded: 0,   // coups portés par le joueur
    };
}

function stepRivals(state) {
    const { track, rivals } = state;
    const player = { z: state.distance + PLAYER_Z, x: state.playerX, speed: state.speed };
    const others = [player, ...rivals];

    for (const r of rivals) {
        // lève le pied dans les virages
        const seg = findSegment(track, r.z % track.length);
        // derrière le joueur, ils mettent la gomme pour revenir ; devant, ils roulent à leur rythme
        const gap = player.z - r.z;
        const boost = 1 + RUBBER_BAND * Math.min(1, Math.max(0, gap - RUBBER_START) / RUBBER_FULL);
        const target = Math.min(MAX_SPEED, r.maxSpeed * boost) * (1 - Math.abs(seg.curve) * 0.035);
        r.speed = Math.max(0, r.speed + (r.speed < target ? ACCEL * 0.9 : BRAKE * 0.3) * STEP);

        // quelqu'un de plus lent devant ? on se décale, sinon on regagne sa trajectoire
        const blocker = others.find(o => o !== r && o.z > r.z && o.z - r.z < 1500
            && Math.abs(o.x - r.x) < SPRITE_W && o.speed < r.speed);
        if (blocker) {
            const dir = blocker.x > r.x ? -1 : 1;
            r.x += (Math.abs(r.x + dir * 0.3) > 0.85 ? -dir : dir) * STEP * 0.8;
        } else {
            r.x += Math.sign(r.lane - r.x) * Math.min(Math.abs(r.lane - r.x), STEP * 0.2);
        }
        r.x = Math.max(-0.85, Math.min(0.85, r.x));
        r.z += r.speed * STEP;
    }
}

// Coups de coude involontaires : le plus rapide est freiné par celui qu'il percute
function collide(state) {
    const pz = state.distance + PLAYER_Z;
    for (const r of state.rivals) {
        const dz = r.z - pz;
        if (Math.abs(dz) > BIKE_LEN || Math.abs(r.x - state.playerX) > RIDER_W) continue;
        if (dz > 0 && state.speed > r.speed) {
            state.speed = r.speed * 0.9;
            state.distance -= BIKE_LEN - dz;
        } else if (dz <= 0 && r.speed > state.speed) {
            r.speed = state.speed * 0.9;
            r.z = pz - BIKE_LEN;
        }
        const push = Math.sign(state.playerX - r.x) || 1;
        state.playerX += push * 0.02;
        r.x -= push * 0.02;
    }
}

export function step(state, input) {
    const { track } = state;
    if (state.countdown > -1) state.countdown -= STEP; // -1 : on affiche encore « GO ! » une seconde
    const strike = input.strike;
    input.strike = 0;
    if (state.countdown > 0) return;
    state.time += STEP;
    if (state.finished) input = {}; // la course est finie, on se laisse rouler

    const seg = findSegment(track, state.position + PLAYER_Z);
    const speedPercent = state.speed / MAX_SPEED;
    const dx = STEP * 2 * speedPercent; // à fond, on traverse la route en 1 s

    state.distance += STEP * state.speed;
    state.bgOffset = wrap(state.bgOffset + BG_SPEED * seg.curve * speedPercent, 1);

    const steer = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    state.playerX += steer * dx;
    state.playerX -= dx * speedPercent * seg.curve * CENTRIFUGAL;

    if (input.up) state.speed += ACCEL * STEP;
    else if (input.down) state.speed += BRAKE * STEP;
    else state.speed += DECEL * STEP;

    if (Math.abs(state.playerX) > 1 && state.speed > OFFROAD_LIMIT) state.speed += OFFROAD_DECEL * STEP;

    state.playerX = Math.max(-2.5, Math.min(2.5, state.playerX));
    state.speed = Math.max(0, Math.min(MAX_SPEED, state.speed));
    state.lean += (steer * 0.35 * Math.min(1, speedPercent * 3) - state.lean) * 0.15;

    stepRivals(state);
    collide(state);
    stepCombat(state, strike);
    state.position = wrap(state.distance, track.length);

    for (const r of state.rivals) {
        if (r.finishTime === null && r.z >= track.finishZ) r.finishTime = state.time;
    }
    if (state.finished) return;
    const pz = state.distance + PLAYER_Z;
    state.rank = 1 + state.rivals.filter(r => r.z > pz).length;
    if (pz >= track.finishZ) state.finished = { rank: state.rank, time: state.time, ...raceScore(state.rank, state.time, state.hitsLanded) };
}

export function raceScore(rank, time, hits) {
    const place = (RIDERS + 1 - rank) * SCORE_PER_PLACE;
    const chrono = Math.max(0, Math.round((SCORE_TIME_REF - time) * SCORE_PER_SECOND));
    const fights = hits * SCORE_PER_HIT;
    return { hits, place, chrono, fights, score: place + chrono + fights };
}

// Classement : d'abord les arrivés au chrono, puis les autres selon la distance parcourue
export function standings(state) {
    const all = [
        { name: 'Toi', isPlayer: true, time: state.finished?.time ?? null, z: state.distance + PLAYER_Z },
        ...state.rivals.map(r => ({ name: r.name, time: r.finishTime, z: r.z })),
    ];
    return all.sort((a, b) => {
        if (a.time !== null && b.time !== null) return a.time - b.time;
        if (a.time !== null || b.time !== null) return a.time !== null ? -1 : 1;
        return b.z - a.z;
    });
}
