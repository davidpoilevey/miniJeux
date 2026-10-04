import { STEP, PLAYER_Z } from './engine';

// Les armes, de la plus faible à la plus forte.
// reach : portée latérale (unités de route), slow : part de vitesse perdue par la victime,
// duration : durée de l'animation (s), size : taille de l'effet (× hauteur d'un motard)
// badge : pastille au-dessus du motard qui la porte, sound : son à l'impact (clé du soundMap)
export const WEAPONS = {
    hit: { name: 'Poing', reach: 0.35, slow: 0.25, duration: 0.2, size: 0.5, badge: null, sound: 'punch' },
    electro: { name: 'Électro', reach: 0.4, slow: 0.45, duration: 0.3, size: 0.8, badge: '#ffeb3b', sound: 'slash' },
    explosion: { name: 'Explosion', reach: 0.6, slow: 0.7, duration: 0.6, size: 1.1, badge: '#ff9800', sound: 'explosion' },
    kaboum: { name: 'Kaboum', reach: 0.8, slow: 1, duration: 0.9, size: 1.6, badge: '#f44336', sound: 'explosion2' },
};
const POWER = Object.keys(WEAPONS);

export const COUNTER_WINDOW = 0.4; // le coup porte au bout de ce délai : riposter avant = contre
const STRIKE_DZ = 450;             // portée en profondeur (devant/derrière)
const PLAYER_COOLDOWN = 0.35;
const RIVAL_AGGRO = 0.6;           // tentatives de coup par seconde quand le joueur est à portée
export const IMMUNITY = 5;         // un adversaire touché est intouchable pendant ce temps (anti-acharnement)

export const PLAYER = -1;

// un coup reste affiché au moins jusqu'à son impact (l'animation est étirée si besoin)
export const effectLength = (a) => Math.max(WEAPONS[a.weapon].duration, COUNTER_WINDOW);

// 7 poings, 4 électro, 3 explosions et un fou furieux avec le kaboum
export const RIVAL_WEAPONS = ['kaboum', 'explosion', 'explosion', 'explosion', 'electro', 'electro', 'electro', 'electro',
    'hit', 'hit', 'hit', 'hit', 'hit', 'hit', 'hit'];

const riderOf = (state, id) => id === PLAYER
    ? { z: state.distance + PLAYER_Z, x: state.playerX }
    : state.rivals[id];

const weaponOf = (state, id) => id === PLAYER ? state.weapon : state.rivals[id].weapon;

function setWeapon(state, id, weapon) {
    if (id === PLAYER) state.weapon = weapon;
    else state.rivals[id].weapon = weapon;
}

function slowDown(state, id, slow) {
    if (id === PLAYER) state.speed *= 1 - slow;
    else state.rivals[id].speed *= 1 - slow;
}

// la cible est-elle du bon côté, à portée ?
function inReach(state, attackerId, targetId, side) {
    const a = riderOf(state, attackerId), t = riderOf(state, targetId);
    const dx = (t.x - a.x) * side;
    return dx > -0.05 && dx <= WEAPONS[weaponOf(state, attackerId)].reach && Math.abs(t.z - a.z) < STRIKE_DZ;
}

function findTarget(state, attackerId, side) {
    if (attackerId !== PLAYER) return inReach(state, attackerId, PLAYER, side) ? PLAYER : null;
    const me = riderOf(state, PLAYER);
    let best = null, bestDist = Infinity;
    state.rivals.forEach((r, i) => {
        const d = Math.abs(r.x - me.x) + Math.abs(r.z - me.z) / STRIKE_DZ;
        if (d < bestDist && !isImmune(state, i) && inReach(state, PLAYER, i, side)) { best = i; bestDist = d; }
    });
    return best;
}

export const isImmune = (state, id) => id !== PLAYER && state.rivals[id].immuneUntil > state.time;

function startAttack(state, attackerId, side) {
    state.attacks.push({
        attacker: attackerId, side, weapon: weaponOf(state, attackerId),
        target: findTarget(state, attackerId, side), age: 0, resolved: false,
    });
}

// Riposte du joueur : un coup ennemi lancé il y a moins de COUNTER_WINDOW, venant du côté frappé,
// est annulé et l'arme est volée si elle est meilleure que la nôtre.
function tryCounter(state, side) {
    const me = riderOf(state, PLAYER);
    const a = state.attacks.find(a => a.target === PLAYER && !a.resolved && a.age < COUNTER_WINDOW
        && Math.sign(riderOf(state, a.attacker).x - me.x) !== -side);
    if (!a) return;
    a.resolved = true;
    a.countered = true;
    if (POWER.indexOf(a.weapon) > POWER.indexOf(state.weapon)) {
        state.weapon = a.weapon;
        setWeapon(state, a.attacker, 'hit');
        state.message = { text: `CONTRE ! ${WEAPONS[a.weapon].name} volé !`, t: 1.5 };
        state.events.push('levelUp');
    } else {
        state.message = { text: 'CONTRE !', t: 1 };
        state.events.push('metalImpact');
    }
}

export function stepCombat(state, strike) {
    const racing = !state.finished;

    // le joueur frappe (Z = gauche, X = droite)
    state.strikeCooldown = Math.max(0, state.strikeCooldown - STEP);
    if (strike && racing && state.strikeCooldown === 0) {
        tryCounter(state, strike);
        startAttack(state, PLAYER, strike);
        state.strikeCooldown = PLAYER_COOLDOWN;
        state.events.push('coupVide'); // retour immédiat, que le coup porte ou non
    }

    // les adversaires frappent quand le joueur passe à portée
    const me = riderOf(state, PLAYER);
    state.rivals.forEach((r, i) => {
        r.cooldown = Math.max(0, r.cooldown - STEP);
        if (!racing || r.cooldown > 0) return;
        const side = Math.sign(me.x - r.x) || 1;
        if (inReach(state, i, PLAYER, side) && Math.random() < RIVAL_AGGRO * STEP) {
            startAttack(state, i, side);
            r.cooldown = 1.5 + Math.random() * 1.5;
        }
    });

    // impact : on revérifie la portée, on a pu s'écarter entre-temps
    for (const a of state.attacks) {
        a.age += STEP;
        if (a.resolved || a.age < COUNTER_WINDOW) continue;
        a.resolved = true;
        if (a.target === null || isImmune(state, a.target) || !inReach(state, a.attacker, a.target, a.side)) continue;
        slowDown(state, a.target, WEAPONS[a.weapon].slow);
        if (a.target !== PLAYER) state.rivals[a.target].immuneUntil = state.time + IMMUNITY;
        a.landed = true;
        state.events.push(WEAPONS[a.weapon].sound);
        if (a.attacker === PLAYER) {
            state.events.push('coupReussi');
            state.hitsLanded++;
        }
    }
    state.attacks = state.attacks.filter(a => a.age < effectLength(a));

    if (state.message && (state.message.t -= STEP) <= 0) state.message = null;
}

// position monde d'un effet : sur la victime, ou dans le vide du côté frappé
export function attackSpot(state, a) {
    const at = riderOf(state, a.attacker);
    const t = a.target === null ? null : riderOf(state, a.target);
    return t
        ? { z: t.z, x: t.x }
        : { z: at.z, x: at.x + a.side * Math.min(0.25, WEAPONS[a.weapon].reach) };
}
