import { Bodies, Body } from "matter-js";
import { FLIPPER_H, FLIPPER_W } from "./tableConfig";

// ─── Positionne un flipper statique autour de son pivot ───────────────────────
export const setFlipperAngle = (body, pivot, angle, halfWidth) => {
  Body.setAngle(body, angle);
  Body.setPosition(body, {
    x: pivot.x + Math.cos(angle) * halfWidth,
    y: pivot.y + Math.sin(angle) * halfWidth,
  });
};

// ─── Lerp d'angle — à appeler dans beforeUpdate ───────────────────────────────
export const lerpFlipper = (body, pivot, targetAngle, halfWidth, speed = 0.5) => {
  const next = body.angle + (targetAngle - body.angle) * speed;
  setFlipperAngle(body, pivot, next, halfWidth);
};

// ─── Impulsion sur la balle au contact d'un flipper actif ────────────────────
// Simule honnêtement : balle au bout = plus vite, près du pivot = moins fort
export const applyFlipperImpulse = (ball, flipper, cfg) => {
  // Distance point de contact → pivot
  const dx    = ball.position.x - cfg.pivot.x;
  const dy    = ball.position.y - cfg.pivot.y;
  const dist  = Math.hypot(dx, dy);
  const ratio = Math.min(dist / cfg.width, 1);   // 0 (pivot) → 1 (extrémité)

  const speed = ratio * 18;                       // max ~18px/frame à l'extrémité

  // Direction perpendiculaire au flipper (vers le haut)
  const angle = flipper.angle - Math.PI / 2;

  Body.setVelocity(ball, {
    x: Math.cos(angle) * speed,
    y: Math.sin(angle) * speed - 4,              // boost vertical constant
  });
};

// ─── Retrouve la config d'un flipper par son label ───────────────────────────
export const getCfgByLabel = (label, leftConfigs, rightConfigs) => {
  return [...leftConfigs, ...rightConfigs].find(cfg => cfg.options.label === label);
};

/**
 * @param {number} x
 * @param {number} y
 * @param {number} radius
 * @param {string} color     - ex: '#f5a623'
 * @param {number} force     - restitution, entre 0 et 2 (1.5 = gros rebond)
 * @param {string} label     - pour identifier la collision
 */
export const createBumper = (x, y, radius = 24, color = '#f5a623', force = 1.5, label = 'bumper') => {
  return Bodies.circle(x, y, radius, {
    isStatic:    true,
    restitution: force,
    friction:    0,
    label,
    render: { fillStyle: color },
  });
};

export const createHoleVisual = (hole) =>
  Bodies.circle(hole.x, hole.y, hole.radius, {
    isStatic:    true,
    isSensor:    true,       // ← traversable, pas de collision physique
    label:       `trou_${hole.id}`,
    render: {
      fillStyle:   '#6a3d3d',
      strokeStyle: '#f5a623',
      lineWidth:   3,
    },
  });

// ─── Logique de capture — à appeler dans beforeUpdate ────────────────────────
export const checkHoles = (ball, holes, capturedRef, dispatch, onEject) => {
  if (capturedRef.current) return;   // déjà dans un trou

  for (const hole of holes) {
    const dx   = ball.position.x - hole.x;
    const dy   = ball.position.y - hole.y;
    const dist = Math.hypot(dx, dy);

    if (dist < hole.radius) {
      capturedRef.current = hole.id;

      // 1. Capture : immobilise la balle au centre du trou
      Body.setVelocity(ball, { x: 0, y: 0 });
      Body.setPosition(ball, { x: hole.x, y: hole.y });
      Body.setStatic(ball, true);

      // 2. Message + points
      dispatch({ type: 'ADD_SCORE',   points: hole.points ?? 0 });
      dispatch({ type: 'SET_MESSAGE', message: hole.message ?? '...' });

      // 3. Expulsion après délai
      setTimeout(() => {
        const dev = Math.random()*20-10;
        Body.setStatic(ball, false);
        Body.setPosition(ball, { x: hole.x, y: hole.y - hole.radius });
        Body.setVelocity(ball, { x: dev, y: -(hole.ejectForce ?? 12) });
        capturedRef.current = null;
        onEject?.(hole);          // callback optionnel pour d'autres effets
      }, hole.delay ?? 1000);

      break;
    }
  }
};

// ─── Création — même logique que wallFromPoints mais avec label + meta ─────────
export const createTarget = (target, thickness = 8) => {
  const cx     = (target.x1 + target.x2) / 2;
  const cy     = (target.y1 + target.y2) / 2;
  const length = Math.hypot(target.x2 - target.x1, target.y2 - target.y1);
  const angle  = Math.atan2(target.y2 - target.y1, target.x2 - target.x1);

  const body = Bodies.rectangle(cx, cy, length, thickness, {
    isStatic:    true,
    restitution: 0.6,
    angle,
    label:       `target_${target.id}`,
    render: {
      fillStyle:   target.color ?? '#f46c2c',
      strokeStyle: '#ffffff',
      lineWidth:   1,
    },
  });

  // On colle les metadata directement sur le body — accessible dans collisionStart
  body.targetData = {
    id:       target.id,
    points:   target.points  ?? 100,
    step:     target.step    ?? null,
    message:  target.message ?? '🎯 Touché !',
    hitColor: target.hitColor ?? '#ffffff',
    baseColor: target.color  ?? '#f46c2c',
  };

  return body;
};

// ─── Handler — à brancher dans collisionStart ─────────────────────────────────
export const handleTargetHit = (bodyA, bodyB, dispatch) => {
  const ball   = [bodyA, bodyB].find(b => b.label === 'ball');
  const target = [bodyA, bodyB].find(b => b.label?.startsWith('target_'));

  if (!ball || !target) return;

  const { points, step, message, hitColor, baseColor } = target.targetData;

  dispatch({ type: 'ADD_SCORE',   points });
  dispatch({ type: 'SET_MESSAGE', message });

  if (step) {
    dispatch({ type: 'STEP_UNLOCK', step, message });
  }

  // Flash de couleur
  target.render.fillStyle = hitColor;
  setTimeout(() => { target.render.fillStyle = baseColor; }, 150);
};

// Tu donnes deux points, elle calcule tout le reste
export const wallFromPoints = (x1, y1, x2, y2, thickness = 10, options = {}) => {
  const cx     = (x1 + x2) / 2;
  const cy     = (y1 + y2) / 2;
  const length = Math.hypot(x2 - x1, y2 - y1);
  const angle  = Math.atan2(y2 - y1, x2 - x1);

  return Bodies.rectangle(cx, cy, length, thickness, {
    isStatic: true,
    angle,
    render: { fillStyle: '#0f3460' },
    ...options,
  });
};

export const createCurvedRamp = (world) => {
  const segments = 8;
  const bodies = [];
  
  for (let i = 0; i < segments; i++) {
    const t = i / (segments - 1);               // 0 → 1
    const angle = (Math.PI / 2) * t;            // 0° → 90°
    
    const x = (FLIPPER_W - 55) - Math.cos(angle) * 60; // centre de l'arc
    const y = (FLIPPER_H - 300) + Math.sin(angle) * 60;// rayon = 60px
    
    bodies.push(Bodies.rectangle(x, y, 18, 8, {
      isStatic: true,
      angle: angle,
      render: { fillStyle: '#e7da50' },
      label: 'ramp',
    }));
  }
  return bodies;
}