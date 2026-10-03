import { CANVAS_WIDTH, CANVAS_HEIGHT, wrap } from './engine';

const PLAYER_GLOW = '#4ECDC4';

const STAR_COLORS = ['#FFA078', '#FFDCAA', '#FFFFFF', '#A0B4FF'];
const STAR_LAYERS = [
    { count: 150, size: 1, speed: 0.3, alpha: 0.4 },
    { count: 50, size: 1.5, speed: 0.6, alpha: 0.6 },
    { count: 20, size: 2, speed: 1, alpha: 0.8 }
];
// Tirées une seule fois : positions à l'écran, décalées par la parallaxe
const STARS = STAR_LAYERS.flatMap(layer => Array.from({ length: layer.count }, () => ({
    layer,
    x: Math.random() * CANVAS_WIDTH,
    y: Math.random() * CANVAS_HEIGHT,
    color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
    alpha: layer.alpha * (0.5 + Math.random() * 0.5),
    phase: Math.random() * Math.PI * 2,
})));

const mod = (v, m) => ((v % m) + m) % m;

const drawOrb = (ctx, img, x, y, r, rot, glow, fallbackColor) => {
    const gradient = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 1.6);
    gradient.addColorStop(0, glow + '80');
    gradient.addColorStop(0.5, glow + '30');
    gradient.addColorStop(1, glow + '00');
    ctx.fillStyle = gradient;
    ctx.fillRect(x - r * 1.6, y - r * 1.6, r * 3.2, r * 3.2);

    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    if (img && img.complete && img.naturalWidth > 0) {
        ctx.clip();
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.drawImage(img, -r, -r, r * 2, r * 2);
    } else {
        ctx.fillStyle = fallbackColor;
        ctx.fill();
    }
    ctx.restore();
};

const ring = (ctx, x, y, r, color, width) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
};

export const renderWorld = (ctx, state, images, input, time) => {
    const { player, view } = state;
    const shakeX = (Math.random() - 0.5) * 2 * view.shake;
    const shakeY = (Math.random() - 0.5) * 2 * view.shake;
    const camX = player.x + view.leadX;
    const camY = player.y + view.leadY;
    const sx = (x) => wrap(x - camX) + CANVAS_WIDTH / 2 + shakeX;
    const sy = (y) => wrap(y - camY) + CANVAS_HEIGHT / 2 + shakeY;
    const visible = (x, y, r) => x > -r && x < CANVAS_WIDTH + r && y > -r && y < CANVAS_HEIGHT + r;

    // Fond
    const bg = ctx.createRadialGradient(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 0, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH * 0.7);
    bg.addColorStop(0, '#111c63');
    bg.addColorStop(1, '#050a26');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Étoiles en parallaxe
    STARS.forEach(s => {
        const x = mod(s.x - (state.scroll.x + view.leadX) * s.layer.speed, CANVAS_WIDTH);
        const y = mod(s.y - (state.scroll.y + view.leadY) * s.layer.speed, CANVAS_HEIGHT);
        ctx.globalAlpha = s.alpha * (0.75 + 0.25 * Math.sin(time * 0.002 + s.phase));
        ctx.fillStyle = s.color;
        ctx.fillRect(x, y, s.layer.size, s.layer.size);
    });
    ctx.globalAlpha = 1;

    const px = sx(player.x);
    const py = sy(player.y);
    const alive = state.dying === 0;

    // Zone d'influence gravitationnelle
    if (alive) {
        ctx.setLineDash([4, 12]);
        ctx.lineDashOffset = -time * 0.01;
        ring(ctx, px, py, player.r * 6, 'rgba(100, 200, 255, 0.12)', 1);
        ctx.setLineDash([]);
    }

    // Traînées
    ctx.globalAlpha = 0.18;
    state.bodies.forEach(body => {
        if (body.isSatellite || body.trail.length < 2) return;
        ctx.strokeStyle = body.color;
        ctx.lineWidth = Math.min(6, Math.max(1.5, body.r * 0.25));
        ctx.beginPath();
        let prevX = null, prevY = null;
        [...body.trail, body].forEach(p => {
            const x = sx(p.x), y = sy(p.y);
            // Un saut = passage de l'autre côté du tore : on coupe le trait
            if (prevX === null || Math.abs(x - prevX) > 200 || Math.abs(y - prevY) > 200) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
            prevX = x; prevY = y;
        });
        ctx.stroke();
    });
    ctx.globalAlpha = 1;

    // Corps célestes
    state.bodies.forEach(body => {
        const x = sx(body.x), y = sy(body.y);
        if (!visible(x, y, body.r * 2)) return;

        ctx.globalAlpha = Math.min(1, body.age / 40);
        drawOrb(ctx, images[body.imageUrl], x, y, body.r, body.rot, body.glow, body.color);

        const massRatio = body.mass / player.mass;
        if (body.isSatellite) {
            ring(ctx, x, y, body.r + 2, 'rgba(255, 215, 0, 0.7)', 1.5);
        } else if (massRatio > 2) {
            // Mortel : anneau rouge qui pulse
            const pulse = Math.sin(time * 0.008);
            ring(ctx, x, y, body.r + 5 + pulse * 2, '#FF4757', 2.5);
            ring(ctx, x, y, body.r + 12 + pulse * 4, `rgba(255, 71, 87, ${0.25 + pulse * 0.15})`, 1.5);
        } else if (massRatio > 1) {
            // Dangereux : te coûte la moitié de ta masse
            ring(ctx, x, y, body.r + 4, '#FFA502', 2);
        }
        ctx.globalAlpha = 1;
    });

    // Corps en train d'être aspirés
    state.absorbing.forEach(a => {
        const x = px + Math.cos(a.angle) * a.dist;
        const y = py + Math.sin(a.angle) * a.dist;
        ctx.globalAlpha = 1 - a.t * 0.7;
        drawOrb(ctx, images[a.imageUrl], x, y, Math.max(0.5, a.r * (1 - a.t)), a.rot, a.glow, a.color);
    });
    ctx.globalAlpha = 1;

    // Particules (additives)
    ctx.globalCompositeOperation = 'lighter';
    state.particles.forEach(p => {
        const x = sx(p.x), y = sy(p.y);
        if (!visible(x, y, p.size)) return;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(x, y, p.size * (0.5 + p.life * 0.5), 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;

    // Joueur
    if (alive) {
        const r = player.r * (1 + view.pulse);
        const blinking = player.invuln > 0 && Math.floor(player.invuln / 6) % 2 === 0;
        ctx.globalAlpha = blinking ? 0.35 : 1;

        const halo = ctx.createRadialGradient(px, py, 0, px, py, r * 2);
        halo.addColorStop(0, PLAYER_GLOW + 'AA');
        halo.addColorStop(0.6, PLAYER_GLOW + '44');
        halo.addColorStop(1, PLAYER_GLOW + '00');
        ctx.fillStyle = halo;
        ctx.fillRect(px - r * 2, py - r * 2, r * 4, r * 4);

        drawOrb(ctx, images[player.imageUrl], px, py, r, player.rot, PLAYER_GLOW, PLAYER_GLOW);
        ring(ctx, px, py, r, '#95E1D3', 2);

        // Chevron de visée
        const angle = Math.atan2(input.aimY - py, input.aimX - px);
        const tipD = r + 16;
        ctx.fillStyle = input.boosting ? '#FFD700' : '#95E1D3';
        ctx.beginPath();
        ctx.moveTo(px + Math.cos(angle) * tipD, py + Math.sin(angle) * tipD);
        ctx.lineTo(px + Math.cos(angle + 0.25) * (r + 6), py + Math.sin(angle + 0.25) * (r + 6));
        ctx.lineTo(px + Math.cos(angle - 0.25) * (r + 6), py + Math.sin(angle - 0.25) * (r + 6));
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;

        // Réticule à la place du curseur
        ctx.globalAlpha = 0.6;
        ring(ctx, input.aimX, input.aimY, 7, input.boosting ? '#FFD700' : '#95E1D3', 1.5);
        ctx.fillStyle = '#95E1D3';
        ctx.fillRect(input.aimX - 1, input.aimY - 1, 2, 2);
        ctx.globalAlpha = 1;
    }

    // Flash d'impact
    if (view.flash > 0) {
        ctx.fillStyle = `rgba(255, 60, 60, ${view.flash * 0.35})`;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
};
