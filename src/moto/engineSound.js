// Bruit de moteur synthétisé (Web Audio), sans fichier son.
// Deux oscillateurs (dent de scie + carré une octave plus bas) passés dans un passe-bas,
// avec un léger « pout-pout » (modulation d'amplitude au rythme des explosions du moteur).
// La boîte de vitesses fait monter le régime puis le fait retomber à chaque passage de rapport.

const GEARS = [0.12, 0.25, 0.4, 0.56, 0.74, 1]; // fin de chaque rapport, en fraction de la vitesse max
const IDLE_HZ = 38;
const MAX_HZ = 190;

// régime moteur 0..1 selon la vitesse : remonte dans chaque rapport
function rpmOf(speedPercent) {
    let low = 0;
    for (const high of GEARS) {
        if (speedPercent <= high) return 0.3 + 0.7 * (speedPercent - low) / (high - low);
        low = high;
    }
    return 1;
}

export function createEngineSound() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    const ctx = new Ctx();

    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.value = 3;
    filter.frequency.value = 600;

    const pulse = ctx.createGain(); // modulé par le lfo
    pulse.gain.value = 0.75;
    pulse.connect(filter);
    filter.connect(master);

    const saw = ctx.createOscillator();
    saw.type = 'sawtooth';
    const sub = ctx.createOscillator();
    sub.type = 'square';
    const subGain = ctx.createGain();
    subGain.gain.value = 0.5;
    saw.connect(pulse);
    sub.connect(subGain).connect(pulse);

    const lfo = ctx.createOscillator();
    lfo.type = 'square';
    const lfoDepth = ctx.createGain();
    lfoDepth.gain.value = 0.25;
    lfo.connect(lfoDepth).connect(pulse.gain);

    [saw, sub, lfo].forEach(o => o.start());
    ctx.resume?.();

    const set = (param, value) => param.setTargetAtTime(value, ctx.currentTime, 0.05);

    return {
        // à appeler à chaque frame
        update(speedPercent, throttle) {
            const hz = IDLE_HZ + (MAX_HZ - IDLE_HZ) * (speedPercent < 0.01 ? 0 : rpmOf(speedPercent));
            set(saw.frequency, hz);
            set(sub.frequency, hz / 2);
            set(lfo.frequency, hz / 4);
            set(filter.frequency, 300 + hz * (throttle ? 6 : 3)); // gaz ouverts = son plus rageur
            set(master.gain, throttle ? 0.11 : 0.07);
        },
        resume: () => ctx.resume(),
        suspend: () => ctx.suspend(),
        close: () => ctx.close(),
    };
}
