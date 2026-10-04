import {
    WIDTH, HEIGHT, SEGMENT_LENGTH, ROAD_WIDTH, LANES, CAMERA_HEIGHT, CAMERA_DEPTH,
    DRAW_DISTANCE, PLAYER_Z, MAX_SPEED, KMH_AT_MAX, COLORS, RIDERS, RIDER_H, findSegment,
} from './engine';
import { WEAPONS, PLAYER, attackSpot, effectLength, isImmune } from './combat';
import { gifFrame } from '../dungeon/gifSprite';

const FOG_DENSITY = 5;
const HORIZON = HEIGHT / 2;

// 3D monde -> écran
function project(p, cameraX, cameraY, cameraZ) {
    p.camera.x = (p.world.x || 0) - cameraX;
    p.camera.y = p.world.y - cameraY;
    p.camera.z = p.world.z - cameraZ;
    p.screen.scale = CAMERA_DEPTH / p.camera.z;
    p.screen.x = Math.round(WIDTH / 2 + p.screen.scale * p.camera.x * WIDTH / 2);
    p.screen.y = Math.round(HEIGHT / 2 - p.screen.scale * p.camera.y * HEIGHT / 2);
    p.screen.w = Math.round(p.screen.scale * ROAD_WIDTH * WIDTH / 2);
}

function polygon(ctx, x1, y1, x2, y2, x3, y3, x4, y4, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.lineTo(x4, y4);
    ctx.closePath();
    ctx.fill();
}

// (x1,y1,w1) = bord proche, (x2,y2,w2) = bord lointain
function drawSegment(ctx, x1, y1, w1, x2, y2, w2, fog, color) {
    const r1 = w1 / Math.max(6, 2 * LANES), r2 = w2 / Math.max(6, 2 * LANES);
    const l1 = w1 / Math.max(32, 8 * LANES), l2 = w2 / Math.max(32, 8 * LANES);

    ctx.fillStyle = color.grass;
    ctx.fillRect(0, y2, WIDTH, y1 - y2);

    polygon(ctx, x1 - w1 - r1, y1, x1 - w1, y1, x2 - w2, y2, x2 - w2 - r2, y2, color.rumble);
    polygon(ctx, x1 + w1 + r1, y1, x1 + w1, y1, x2 + w2, y2, x2 + w2 + r2, y2, color.rumble);
    polygon(ctx, x1 - w1, y1, x1 + w1, y1, x2 + w2, y2, x2 - w2, y2, color.road);

    if (color.lane) {
        const lw1 = w1 * 2 / LANES, lw2 = w2 * 2 / LANES;
        let lx1 = x1 - w1 + lw1, lx2 = x2 - w2 + lw2;
        for (let lane = 1; lane < LANES; lane++, lx1 += lw1, lx2 += lw2) {
            polygon(ctx, lx1 - l1 / 2, y1, lx1 + l1 / 2, y1, lx2 + l2 / 2, y2, lx2 - l2 / 2, y2, color.lane);
        }
    }

    if (fog < 1) {
        ctx.globalAlpha = 1 - fog;
        ctx.fillStyle = COLORS.fog;
        ctx.fillRect(0, y2, WIDTH, y1 - y2);
        ctx.globalAlpha = 1;
    }
}

// Silhouette de montagnes périodique (offset dans [0,1[ -> boucle sans couture)
function drawMountains(ctx, offset, baseY, amp, color, waves) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, HEIGHT);
    for (let x = 0; x <= WIDTH; x += 4) {
        const u = x / (WIDTH * 2) + offset;
        let h = 0;
        for (const [k, a, phase] of waves) h += a * Math.sin(2 * Math.PI * k * u + phase);
        ctx.lineTo(x, baseY - amp * (0.5 + 0.5 * h));
    }
    ctx.lineTo(WIDTH, HEIGHT);
    ctx.closePath();
    ctx.fill();
}

function drawBackground(ctx, bgOffset) {
    const sky = ctx.createLinearGradient(0, 0, 0, HORIZON);
    sky.addColorStop(0, '#3f7fd0');
    sky.addColorStop(1, '#cfe8f4');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    drawMountains(ctx, bgOffset * 0.5, HORIZON, 70, '#9fb4cc', [[3, 0.6, 0], [7, 0.3, 1.3], [13, 0.1, 2.1]]);
    drawMountains(ctx, bgOffset, HORIZON + 4, 35, '#7fa58a', [[5, 0.5, 0.7], [11, 0.35, 2.4], [19, 0.15, 0.2]]);

    // terrain lointain (vallées visibles dans les descentes), noyé dans la brume
    const ground = ctx.createLinearGradient(0, HORIZON, 0, HEIGHT);
    ground.addColorStop(0, COLORS.fog);
    ground.addColorStop(0.6, '#6fa86c');
    ctx.fillStyle = ground;
    ctx.fillRect(0, HORIZON + 4, WIDTH, HEIGHT - HORIZON - 4);
}

// Sprite posé sur la route : (x, y) = point de contact au sol, h = hauteur à l'écran
function drawSprite(ctx, img, x, y, h, clipY, lean = 0, badge = null) {
    if (!img || !img.complete || !img.naturalWidth) return;
    const w = h * img.naturalWidth / img.naturalHeight;
    ctx.save();
    if (y > clipY) { // en partie caché derrière une crête
        ctx.beginPath();
        ctx.rect(0, 0, WIDTH, clipY);
        ctx.clip();
    }
    ctx.translate(x, y);
    ctx.rotate(lean);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.45, h * 0.05, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.drawImage(img, -w / 2, -h, w, h);
    if (badge) { // pastille de l'arme portée
        const r = Math.max(2, h * 0.07);
        ctx.fillStyle = badge;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = Math.max(1, r * 0.3);
        ctx.beginPath();
        ctx.arc(0, -h - r * 1.6, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }
    ctx.restore();
}

// Effet de coup (GIF décodé), centré à mi-hauteur de motard
function drawEffect(ctx, gif, ms, x, y, h, clipY) {
    if (!gif) return;
    const { crop } = gif;
    const w = h * crop.w / crop.h;
    ctx.save();
    if (y > clipY) {
        ctx.beginPath();
        ctx.rect(0, 0, WIDTH, clipY);
        ctx.clip();
    }
    ctx.drawImage(gifFrame(gif, ms), crop.x, crop.y, crop.w, crop.h, x - w / 2, y - h / 2, w, h);
    ctx.restore();
}

const chrono = (t) => `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, '0')}`;

function text(ctx, str, x, y, size, align = 'left', color = '#fff') {
    ctx.font = `bold ${size}px monospace`;
    ctx.textAlign = align;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillText(str, x + 2, y + 2);
    ctx.fillStyle = color;
    ctx.fillText(str, x, y);
}

function drawHud(ctx, state) {
    const kmh = Math.round(state.speed / MAX_SPEED * KMH_AT_MAX);
    text(ctx, `${kmh} km/h`, WIDTH - 16, HEIGHT - 16, 22, 'right');
    text(ctx, 'POS', 16, 24, 14);
    text(ctx, `${state.rank}/${RIDERS}`, 16, 56, 32, 'left', state.rank <= 3 ? '#ffd54f' : '#fff');
    text(ctx, chrono(state.finished?.time ?? state.time), WIDTH - 16, 30, 20, 'right');
    text(ctx, `COUPS ${state.hitsLanded}`, 16, 78, 14);
    text(ctx, WEAPONS[state.weapon].name.toUpperCase(), 16, HEIGHT - 16, 18, 'left', WEAPONS[state.weapon].badge ?? '#ddd');
    if (state.message) text(ctx, state.message.text, WIDTH / 2, HEIGHT / 4, 26, 'center', '#ffd54f');

    if (state.countdown > -1) {
        const label = state.countdown > 0 ? String(Math.ceil(state.countdown)) : 'GO !';
        text(ctx, label, WIDTH / 2, HEIGHT / 3, 64, 'center', state.countdown > 0 ? '#fff' : '#76ff03');
    }
}

export function render(ctx, state, sprites) {
    const { track, position, playerX } = state;
    const baseSegment = findSegment(track, position);
    const basePercent = (position % SEGMENT_LENGTH) / SEGMENT_LENGTH;
    const playerSegment = findSegment(track, position + PLAYER_Z);
    const playerPercent = ((position + PLAYER_Z) % SEGMENT_LENGTH) / SEGMENT_LENGTH;
    const playerY = playerSegment.p1.world.y + (playerSegment.p2.world.y - playerSegment.p1.world.y) * playerPercent;

    drawBackground(ctx, state.bgOffset);

    let maxY = HEIGHT; // tout ce qui est sous cette ligne est déjà caché par une colline plus proche
    let x = 0;
    let dx = -(baseSegment.curve * basePercent);
    const count = track.segments.length;
    const visible = [];
    const slices = []; // par segment : décalage de virage et ligne de crête, pour poser les motos

    // projection d'avant en arrière (les virages s'accumulent), dessin d'arrière en avant
    for (let n = 0; n < DRAW_DISTANCE; n++) {
        const segment = track.segments[(baseSegment.index + n) % count];
        const looped = segment.index < baseSegment.index;
        const cameraZ = position - (looped ? track.length : 0);
        const fog = 1 / Math.exp((n / DRAW_DISTANCE) ** 2 * FOG_DENSITY);
        slices[n] = { x, dx, clip: maxY };

        // les virages : chaque segment est décalé un peu plus que le précédent
        project(segment.p1, playerX * ROAD_WIDTH - x, playerY + CAMERA_HEIGHT, cameraZ);
        project(segment.p2, playerX * ROAD_WIDTH - x - dx, playerY + CAMERA_HEIGHT, cameraZ);
        x += dx;
        dx += segment.curve;

        const { p1, p2 } = segment;
        if (p1.camera.z <= CAMERA_DEPTH || p2.screen.y >= p1.screen.y || p2.screen.y >= maxY) continue;

        visible.push({ x1: p1.screen.x, y1: p1.screen.y, w1: p1.screen.w, x2: p2.screen.x, y2: p2.screen.y, w2: p2.screen.w, fog, color: segment.color });
        maxY = p2.screen.y;
    }

    for (let i = visible.length - 1; i >= 0; i--) {
        const s = visible[i];
        drawSegment(ctx, s.x1, s.y1, s.w1, s.x2, s.y2, s.w2, s.fog, s.color);
    }

    // motos : projetées une par une, dessinées de la plus lointaine à la plus proche
    const bikes = [];
    const playerH = RIDER_H * (CAMERA_DEPTH / PLAYER_Z) * HEIGHT / 2;
    const offRoad = Math.abs(playerX) > 1 && state.speed > 0;
    bikes.push({
        rel: PLAYER_Z, img: sprites?.player, x: WIDTH / 2, h: playerH, clip: HEIGHT, lean: state.lean,
        y: HEIGHT - 2 + (offRoad ? Math.round(Math.random() * 3 - 1.5) : 0),
    });

    // (z, x) monde -> point au sol à l'écran
    const projectSpot = (worldZ, worldX) => {
        const rel = ((worldZ - position) % track.length + track.length) % track.length;
        if (rel < 100 || rel >= DRAW_DISTANCE * SEGMENT_LENGTH) return null;
        const z = worldZ % track.length;
        const seg = findSegment(track, z);
        const slice = slices[(seg.index - baseSegment.index + count) % count];
        if (!slice) return null;
        const p = (z % SEGMENT_LENGTH) / SEGMENT_LENGTH;
        const worldY = seg.p1.world.y + (seg.p2.world.y - seg.p1.world.y) * p;
        const scale = CAMERA_DEPTH / rel;
        const camX = worldX * ROAD_WIDTH - playerX * ROAD_WIDTH + slice.x + slice.dx * p;
        return {
            rel, scale, clip: slice.clip,
            x: WIDTH / 2 + scale * camX * WIDTH / 2,
            y: HEIGHT / 2 - scale * (worldY - playerY - CAMERA_HEIGHT) * HEIGHT / 2,
        };
    };

    for (const [i, r] of state.rivals.entries()) {
        if (isImmune(state, i) && Math.floor(state.time * 8) % 2) continue; // clignote
        const spot = projectSpot(r.z, r.x);
        if (spot) bikes.push({ ...spot, img: sprites?.rival, h: RIDER_H * spot.scale * HEIGHT / 2, badge: WEAPONS[r.weapon].badge });
    }

    for (const a of state.attacks) {
        const at = attackSpot(state, a);
        const spot = projectSpot(at.z, at.x);
        if (!spot) continue;
        const riderH = RIDER_H * spot.scale * HEIGHT / 2;
        bikes.push({
            ...spot, rel: spot.rel - 1, effect: sprites?.fx?.[a.weapon], ms: a.age / effectLength(a) * WEAPONS[a.weapon].duration * 1000,
            y: spot.y - riderH * 0.55, h: WEAPONS[a.weapon].size * riderH,
        });
    }

    bikes.sort((a, b) => b.rel - a.rel);
    for (const b of bikes) {
        if (b.effect !== undefined) drawEffect(ctx, b.effect, b.ms, b.x, b.y, b.h, b.clip);
        else drawSprite(ctx, b.img, b.x, b.y, b.h, b.clip, b.lean, b.badge);
    }

    // flash rouge quand on encaisse un coup
    if (state.attacks.some(a => a.landed && a.target === PLAYER && a.age < 0.35)) {
        ctx.fillStyle = 'rgba(255,0,0,0.18)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }
    drawHud(ctx, state);
}
