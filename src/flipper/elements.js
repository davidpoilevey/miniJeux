import Matter from 'matter-js';

const { Bodies, Body } = Matter;

// ─── Registre des éléments de la table ───────────────────────────────────────
// Un type = une entrée ici. Chaque entrée sait :
//   create(point)        → nouvel élément avec ses valeurs par défaut (éditeur)
//   build(el, settings)  → les bodies Matter
//   onHit(ctx, body)     → la balle vient de toucher un de ses bodies
//   onStep(ctx, body)    → appelé à chaque tick physique
//   handles / drag       → poignées de l'éditeur (en plus des sommets de `path`)
// Les éléments à `path` (liste de points) ont automatiquement une poignée par sommet.

export const GRID = 10;

const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;
const normDeg = (d) => ((((d + 180) % 360) + 360) % 360) - 180;
const snapTo = (v, step) => Math.round(v / step) * step;

// Lissage de Chaikin — les extrémités restent en place
export const smoothPath = (path, iterations = 3) => {
  let pts = path;
  for (let it = 0; it < iterations; it++) {
    const next = [pts[0]];
    for (let i = 0; i < pts.length - 1; i++) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[i + 1];
      next.push([0.75 * x1 + 0.25 * x2, 0.75 * y1 + 0.25 * y2]);
      next.push([0.25 * x1 + 0.75 * x2, 0.25 * y1 + 0.75 * y2]);
    }
    next.push(pts[pts.length - 1]);
    pts = next;
  }
  return pts;
};

// Une polyligne = un rectangle par segment + un cercle à chaque sommet (jointures lisses)
const segmentBodies = (path, thickness, options) => {
  const bodies = [];
  for (let i = 0; i < path.length - 1; i++) {
    const [x1, y1] = path[i];
    const [x2, y2] = path[i + 1];
    const length = Math.hypot(x2 - x1, y2 - y1);
    if (length < 0.5) continue;
    bodies.push(Bodies.rectangle((x1 + x2) / 2, (y1 + y2) / 2, length, thickness, {
      isStatic: true,
      angle: Math.atan2(y2 - y1, x2 - x1),
      ...options,
    }));
  }
  for (const [x, y] of path) {
    bodies.push(Bodies.circle(x, y, thickness / 2, { isStatic: true, ...options }));
  }
  return bodies;
};

const flash = (body, color, ms = 120) => {
  const original = body.render.fillStyle;
  body.render.fillStyle = color;
  setTimeout(() => { body.render.fillStyle = original; }, ms);
};

// ─── Géométrie des flippers ──────────────────────────────────────────────────
// `angle` = inclinaison au repos sous l'horizontale (°), `swing` = course (°).
// Un flipper gauche pointe vers la droite, un droit vers la gauche (miroir).
export const flipperDir = (el, up = false) => {
  const a = rad(up ? el.angle - normDeg(el.swing) : el.angle);
  return el.side === 'left' ? a : Math.PI - a;
};

export const flipperTip = (el, up = false) => {
  const d = flipperDir(el, up);
  return [el.x + Math.cos(d) * el.length, el.y + Math.sin(d) * el.length];
};

const angleFromPoint = (el, [x, y]) => {
  const d = Math.atan2(y - el.y, x - el.x);
  return normDeg(deg(el.side === 'left' ? d : Math.PI - d));
};

const setFlipperAngle = (body, el, angle, updateVelocity) => {
  Body.setAngle(body, angle, updateVelocity);
  Body.setPosition(body, {
    x: el.x + Math.cos(angle) * el.length / 2,
    y: el.y + Math.sin(angle) * el.length / 2,
  }, updateVelocity);
};

// Direction d'éjection d'un trou : 0° = vers le haut, positif = sens horaire
export const ejectVector = (el) => [Math.sin(rad(el.ejectAngle)), -Math.cos(rad(el.ejectAngle))];
const EJECT_HANDLE_SCALE = 4;   // longueur de la poignée = eject × 4 px

// ─── Les types ───────────────────────────────────────────────────────────────
export const ELEMENTS = {
  wall: {
    label: 'Mur', icon: '〰️',
    create: ([x, y]) => ({ type: 'wall', path: [[x, y], [x + 100, y]], thickness: 10, smooth: false, bounce: 0.3, color: '#0f3460' }),
    minPoints: 2,
    build: (el) => segmentBodies(el.smooth ? smoothPath(el.path) : el.path, el.thickness, {
      restitution: el.bounce,
      friction: 0.02,
      render: { fillStyle: el.color },
    }),
  },

  bumper: {
    label: 'Bumper', icon: '🔴',
    create: ([x, y]) => ({ type: 'bumper', x, y, r: 24, kick: 12, score: 100, color: '#f5a623' }),
    build: (el) => [Bodies.circle(el.x, el.y, el.r, { isStatic: true, restitution: 0.5, render: { fillStyle: el.color } })],
    handles: (el) => [{ key: 'r', x: el.x + el.r, y: el.y }],
    drag: (el, key, [x, y]) => ({ ...el, r: Math.max(6, Math.round(Math.hypot(x - el.x, y - el.y))) }),
    onHit: (ctx, body) => {
      const { ball } = ctx;
      const el = body.el;
      const dx = ball.position.x - el.x;
      const dy = ball.position.y - el.y;
      const d = Math.hypot(dx, dy) || 1;
      Body.setVelocity(ball, { x: (dx / d) * el.kick, y: (dy / d) * el.kick });
      ctx.dispatch({ type: 'BUMP', points: el.score });
      ctx.popup(el.x, el.y - el.r - 10, el.score);
      ctx.sound('bumper');
      flash(body, '#ffffff');
    },
  },

  flipper: {
    label: 'Flipper', icon: '🏏',
    create: ([x, y]) => ({ type: 'flipper', x, y, side: 'left', length: 90, angle: 25, swing: 50, color: '#e94560' }),
    build: (el) => {
      const dir = flipperDir(el);
      const body = Bodies.rectangle(
        el.x + Math.cos(dir) * el.length / 2,
        el.y + Math.sin(dir) * el.length / 2,
        el.length, 14,
        { isStatic: true, angle: dir, chamfer: { radius: 6 }, render: { fillStyle: el.color } },
      );
      body.flipAngle = dir;
      return [body];
    },
    handles: (el) => {
      const [tx, ty] = flipperTip(el);
      const [ux, uy] = flipperTip(el, true);
      return [{ key: 'tip', x: tx, y: ty }, { key: 'up', x: ux, y: uy, ghost: true }];
    },
    drag: (el, key, p, snap) => {
      const a = Math.round(angleFromPoint(el, p));
      // Toujours le chemin court : une course entre -180° et 180°
      if (key === 'up') return { ...el, swing: Math.round(normDeg(el.angle - a)) };
      const length = Math.hypot(p[0] - el.x, p[1] - el.y);
      return { ...el, angle: a, length: Math.max(20, snap ? snapTo(length, 5) : Math.round(length)) };
    },
    // Rotation à vitesse constante, avec vitesse transmise à Matter → vrais rebonds
    onStep: (ctx, body) => {
      const el = body.el;
      const up = ctx.input[el.side];
      const target = flipperDir(el, up);
      const maxStep = rad(up ? ctx.settings.flipperUp : ctx.settings.flipperDown);
      const delta = Math.max(-maxStep, Math.min(maxStep, target - body.flipAngle));
      body.flipAngle += delta;
      setFlipperAngle(body, el, body.flipAngle, true);
    },
  },

  hole: {
    label: 'Trou', icon: '🕳️',
    create: ([x, y]) => ({ type: 'hole', x, y, r: 18, delay: 1000, eject: 14, ejectAngle: 0, score: 500, message: 'Dans le mille !', color: '#6a3d3d' }),
    build: (el) => [Bodies.circle(el.x, el.y, el.r, {
      isStatic: true, isSensor: true,
      render: { fillStyle: el.color, strokeStyle: '#f5a623', lineWidth: 3 },
    })],
    handles: (el) => {
      const [vx, vy] = ejectVector(el);
      return [
        { key: 'r', x: el.x + el.r, y: el.y },
        { key: 'eject', x: el.x + vx * el.eject * EJECT_HANDLE_SCALE, y: el.y + vy * el.eject * EJECT_HANDLE_SCALE, arrow: true },
      ];
    },
    drag: (el, key, [x, y], snap) => {
      const dx = x - el.x;
      const dy = y - el.y;
      if (key === 'r') return { ...el, r: Math.max(8, Math.round(Math.hypot(dx, dy))) };
      const a = normDeg(deg(Math.atan2(dx, -dy)));
      return {
        ...el,
        ejectAngle: snap ? snapTo(a, 5) : Math.round(a),
        eject: Math.max(1, Math.round(Math.hypot(dx, dy) / EJECT_HANDLE_SCALE)),
      };
    },
    // Capture → délai → éjection. Tout est piloté par le temps moteur : pas de
    // setTimeout qui survivrait à une pause ou à une reconstruction du monde.
    onStep: (ctx, body) => {
      const el = body.el;
      const { ball, time } = ctx;
      if (ball.isStatic) return;

      if (body.capturedUntil != null) {
        if (time < body.capturedUntil) {
          Body.setPosition(ball, { x: el.x, y: el.y });
          Body.setVelocity(ball, { x: 0, y: 0 });
          return;
        }
        const [vx, vy] = ejectVector(el);
        const jitter = (Math.random() - 0.5) * 2;
        Body.setPosition(ball, { x: el.x + vx * (el.r + 2), y: el.y + vy * (el.r + 2) });
        Body.setVelocity(ball, { x: vx * el.eject + jitter, y: vy * el.eject });
        body.capturedUntil = null;
        body.cooldownUntil = time + 400;
        return;
      }

      if (time < (body.cooldownUntil ?? 0)) return;
      if (Math.hypot(ball.position.x - el.x, ball.position.y - el.y) < el.r) {
        body.capturedUntil = time + el.delay;
        ctx.dispatch({ type: 'ADD_SCORE', points: el.score });
        ctx.popup(el.x, el.y - el.r - 10, el.score);
        ctx.sound('hole');
        ctx.dispatch({ type: 'SET_MESSAGE', message: el.message });
      }
    },
  },

  target: {
    label: 'Cible', icon: '🎯',
    create: ([x, y]) => ({ type: 'target', path: [[x, y], [x + 60, y]], score: 300, step: 'step1', message: '🎯 Cible touchée !', color: '#f46c2c', hitColor: '#ffffff' }),
    minPoints: 2, maxPoints: 2,
    build: (el) => segmentBodies(el.path, 8, {
      restitution: 0.6,
      render: { fillStyle: el.color },
    }).slice(0, 1),
    onHit: (ctx, body) => {
      const el = body.el;
      const [[x1, y1], [x2, y2]] = el.path;
      ctx.dispatch({ type: 'ADD_SCORE', points: el.score });
      ctx.popup((x1 + x2) / 2, Math.min(y1, y2) - 14, el.score);
      ctx.sound('target');
      ctx.dispatch({ type: 'SET_MESSAGE', message: el.message });
      if (el.step) ctx.dispatch({ type: 'STEP_UNLOCK', step: el.step, message: el.message });
      flash(body, el.hitColor, 150);
    },
  },

  drain: {
    label: 'Drain', icon: '⬇️',
    create: ([x, y]) => ({ type: 'drain', path: [[x, y], [x + 80, y]] }),
    minPoints: 2, maxPoints: 2,
    build: (el) => segmentBodies(el.path, 6, {
      isSensor: true,
      render: { fillStyle: 'rgba(255, 60, 60, 0.35)' },
    }).slice(0, 1),
    onHit: (ctx) => ctx.loseBall(),
  },

  launcher: {
    label: 'Lanceur', icon: '🚀', unique: true,
    create: ([x, y]) => ({ type: 'launcher', x, y, color: '#f5a623' }),
    build: (el) => [Bodies.rectangle(el.x, el.y, 40, 14, { isStatic: true, render: { fillStyle: el.color } })],
    // Espace maintenu : le plunger descend. Relâché : la balle part, si elle est dessus.
    onStep: (ctx, body) => {
      const el = body.el;
      const { input, ball, settings } = ctx;
      const charge = input.chargeStart != null ? Math.min((ctx.now() - input.chargeStart) / 1000, 1) : 0;
      Body.setPosition(body, { x: el.x, y: el.y + charge * 30 });

      if (input.release != null) {
        const onPlunger = Math.abs(ball.position.x - el.x) < 25
          && ball.position.y < el.y + 30
          && ball.position.y > el.y - settings.ballRadius * 4;
        if (onPlunger) {
          Body.setVelocity(ball, { x: 0, y: -input.release * settings.launchPower });
          ctx.sound('launch');
        }
        input.release = null;
      }
    },
  },
};

// Types proposés dans la palette de l'éditeur, dans l'ordre
export const PALETTE = ['wall', 'bumper', 'flipper', 'hole', 'target', 'drain', 'launcher'];

// ─── Opérations génériques de l'éditeur ──────────────────────────────────────
export const getHandles = (el) => {
  const def = ELEMENTS[el.type];
  const vertices = el.path ? el.path.map(([x, y], i) => ({ key: i, x, y, vertex: true })) : [];
  return [...vertices, ...(def.handles?.(el) ?? [])];
};

export const dragHandle = (el, key, [x, y], snap) => {
  if (typeof key === 'number') {
    const p = snap ? [snapTo(x, GRID), snapTo(y, GRID)] : [Math.round(x), Math.round(y)];
    return { ...el, path: el.path.map((pt, i) => (i === key ? p : pt)) };
  }
  return ELEMENTS[el.type].drag(el, key, [x, y], snap);
};

export const translate = (el, dx, dy) => {
  if (el.path) return { ...el, path: el.path.map(([x, y]) => [x + dx, y + dy]) };
  return { ...el, x: el.x + dx, y: el.y + dy };
};

// Insère un sommet sur le segment le plus proche du point
export const insertVertex = (el, [x, y]) => {
  const def = ELEMENTS[el.type];
  if (!el.path || el.path.length >= (def.maxPoints ?? Infinity)) return el;
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < el.path.length - 1; i++) {
    const [x1, y1] = el.path[i];
    const [x2, y2] = el.path[i + 1];
    const len2 = (x2 - x1) ** 2 + (y2 - y1) ** 2 || 1;
    const t = Math.max(0, Math.min(1, ((x - x1) * (x2 - x1) + (y - y1) * (y2 - y1)) / len2));
    const d = Math.hypot(x - (x1 + t * (x2 - x1)), y - (y1 + t * (y2 - y1)));
    if (d < bestDist) { bestDist = d; best = i; }
  }
  const path = [...el.path];
  path.splice(best + 1, 0, [Math.round(x), Math.round(y)]);
  return { ...el, path };
};

export const removeVertex = (el, index) => {
  if (!el.path || el.path.length <= (ELEMENTS[el.type].minPoints ?? 2)) return el;
  return { ...el, path: el.path.filter((_, i) => i !== index) };
};
