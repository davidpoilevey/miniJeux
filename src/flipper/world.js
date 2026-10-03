import Matter from 'matter-js';
import { ELEMENTS } from './elements';

const { Bodies, Body, Composite } = Matter;

export const DEFAULT_SETTINGS = {
  gravity: 1,
  ballRadius: 12,
  ballBounce: 0.6,
  flipperUp: 5,       // °/tick (120 ticks/s)
  flipperDown: 3,
  launchPower: 40,
};

// ─── (Re)construit tout le monde Matter à partir du layout ───────────────────
// Le cadre (haut, gauche, droite) est implicite, le bas est un drain.
export const buildWorld = (engine, layout) => {
  const { width: W, height: H } = layout;
  const settings = { ...DEFAULT_SETTINGS, ...layout.settings };

  Composite.clear(engine.world, false);
  engine.gravity.y = settings.gravity;

  const frameOpts = { isStatic: true, render: { visible: false } };
  const frame = [
    Bodies.rectangle(W / 2, -20, W + 80, 40, frameOpts),
    Bodies.rectangle(-20, H / 2, 40, H + 80, frameOpts),
    Bodies.rectangle(W + 20, H / 2, 40, H + 80, frameOpts),
  ];
  const floor = Bodies.rectangle(W / 2, H + 30, W + 80, 20, { ...frameOpts, isSensor: true });
  floor.el = { type: 'drain' };

  const items = [];
  for (const el of layout.elements) {
    const def = ELEMENTS[el.type];
    if (!def) continue;
    for (const body of def.build(el, settings)) {
      body.el = el;
      body.label = el.type;
      items.push(body);
    }
  }

  const launcher = layout.elements.find((el) => el.type === 'launcher');
  const spawnPoint = launcher
    ? { x: launcher.x, y: launcher.y - 7 - settings.ballRadius - 1 }
    : { x: W / 2, y: 60 };

  const ball = Bodies.circle(spawnPoint.x, spawnPoint.y, settings.ballRadius, {
    restitution: settings.ballBounce,
    friction: 0.01,
    frictionAir: 0.008,
    label: 'ball',
    render: { fillStyle: '#ffffff' },
  });

  Composite.add(engine.world, [...frame, floor, ...items, ball]);

  return {
    layout,
    settings,
    ball,
    items,
    stepping: items.filter((b) => ELEMENTS[b.el.type].onStep),

    spawnBall() {
      Body.setStatic(ball, false);
      Body.setPosition(ball, spawnPoint);
      Body.setVelocity(ball, { x: 0, y: 0 });
      Body.setAngularVelocity(ball, 0);
    },
    // Balle perdue : on la gare hors écran, immobile, en attendant la suivante
    parkBall() {
      Body.setStatic(ball, true);
      Body.setPosition(ball, { x: -100, y: -100 });
    },
    teleportBall(x, y) {
      Body.setStatic(ball, false);
      Body.setPosition(ball, { x, y });
      Body.setVelocity(ball, { x: 0, y: 0 });
    },
  };
};

// Branche les events Matter une seule fois ; ils délèguent au monde courant
export const attachGameLoop = (engine, getCtx) => {
  const { Events } = Matter;

  const onCollision = (e) => {
    const ctx = getCtx();
    if (!ctx) return;
    for (const { bodyA, bodyB } of e.pairs) {
      const other = bodyA.label === 'ball' ? bodyB : bodyB.label === 'ball' ? bodyA : null;
      if (!other?.el || ctx.ball.isStatic) continue;
      ELEMENTS[other.el.type]?.onHit?.(ctx, other);
    }
  };

  const onStep = () => {
    const ctx = getCtx();
    if (!ctx) return;
    ctx.time = engine.timing.timestamp;
    for (const body of ctx.world.stepping) ELEMENTS[body.el.type].onStep(ctx, body);
    // Filet de sécurité si la balle a traversé un mur
    const { x, y } = ctx.ball.position;
    if (!ctx.ball.isStatic && (y > ctx.world.layout.height + 60 || x < -60 || x > ctx.world.layout.width + 60)) ctx.loseBall();
  };

  Events.on(engine, 'collisionStart', onCollision);
  Events.on(engine, 'beforeUpdate', onStep);
  return () => {
    Events.off(engine, 'collisionStart', onCollision);
    Events.off(engine, 'beforeUpdate', onStep);
  };
};
