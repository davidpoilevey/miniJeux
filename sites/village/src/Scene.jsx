import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Konva from 'konva';
import { Circle, Ellipse, Group, Layer, Line, Rect, Stage, Tag, Text, Label as KLabel } from 'react-konva';
import { cameraFor } from './camera.js';
import { props, villageMap } from './map.js';
import { Town, byId, INK, LIGHT, SANS } from './Town.jsx';

// La carte entière fait plusieurs écrans : on limite la densité pour rester léger sur téléphone.
Konva.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

const BOOKS = ['#7a2e2e', '#2f4f6b', '#5b6b3a', '#8a5a2b', '#4a3b6b', '#2e6b62', '#9a7b2f', '#2f5d8a', '#3d5a80', '#7d4e3b'];
const easeOut = (k) => 1 - (1 - Math.min(1, Math.max(0, k))) ** 3;

/* ---------------------------------------------------------------- effets d'approche */

function DoorHalo({ id }) {
  const { cx, base } = byId[id];
  return <Ellipse x={cx} y={base + 6} radiusX={52} radiusY={22} fillRadialGradientStartRadius={0} fillRadialGradientEndRadius={52}
    fillRadialGradientColorStops={[0, 'rgba(255,213,154,0.55)', 1, 'rgba(255,213,154,0)']} />;
}

function PivotSign({ near, t }) {
  const { cx, rb } = byId.pivot;
  const spin = near ? 360 * easeOut(t / 900) : 0;
  const swing = near ? Math.sin(t / 110) * 5 * Math.max(0, 1 - t / 1200) : 0;
  return (
    <Group x={cx} y={rb - 14} rotation={swing}>
      <Rect x={-36} y={-2} width={72} height={4} cornerRadius={2} fill="#3b2a22" />
      <Rect x={-49} y={8} width={98} height={32} cornerRadius={4} fill="#fff6df" stroke={INK} strokeWidth={1.2}
        shadowColor="#ffcf8a" shadowBlur={near ? 22 : 10} shadowOpacity={0.9} />
      <Pi rotation={spin} />
      <Text x={-12} y={13} text="ivot" fontSize={22} fontStyle="bold" fontFamily={SANS} fill="#111" />
    </Group>
  );
}

// Le π est centré sur lui-même pour tourner sans se décaler.
function Pi({ rotation }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const node = ref.current;
    node.offsetX(node.width() / 2);
    node.offsetY(node.height() / 2);
    node.getLayer()?.batchDraw();
  }, []);
  return <Text ref={ref} x={-21} y={23} text="π" wrap="none" fontSize={25} fontStyle="bold" fontFamily={SANS} fill="#111" rotation={rotation} />;
}

function ArcadeNeon({ near, t }) {
  const { x, width, rb } = byId.arcade;
  const flicker = near && t < 700 && Math.floor(t / 90) % 3 === 1;
  const on = near && !flicker;
  return (
    <Group opacity={on ? 1 : 0.45}>
      <Text x={x} y={rb - 34} width={width} align="center" text="ARCADE" fontSize={22} fontStyle="bold" fontFamily={SANS} letterSpacing={3}
        fill="#ff6fd8" shadowColor="#ff6fd8" shadowBlur={on ? 16 : 6} shadowOpacity={1} />
      <Line points={[x + 20, rb - 8, x + width - 20, rb - 8]} stroke="#5ff2ff" strokeWidth={2} shadowColor="#5ff2ff" shadowBlur={on ? 10 : 3} />
    </Group>
  );
}

function Books({ near, t }) {
  const { x, rb, cx, base } = byId.biblio;
  const lift = near ? easeOut(t / 600) : 0;
  return (
    <Group>
      {BOOKS.map((color, i) => {
        const h = 26 + ((i * 7) % 4) * 4;
        const raised = i === 9 ? lift : 0;
        return <Rect key={color} x={x + 18 + i * 10.2} y={rb + 64 - h - raised * 8} width={9} height={h} cornerRadius={1} fill={color} rotation={-raised * 7} />;
      })}
      <Text x={cx - 10} y={base - 74} text="❦" fontSize={18} fill="#ffd38f" opacity={lift} shadowColor="#ffb45a" shadowBlur={10} />
    </Group>
  );
}

function GarageDisplays({ near, t }) {
  const { x: tx, y: ty, width: tw } = props.totem;
  const { cx, rb } = byId.garage;
  const blink = near && t < 900 && Math.floor(t / 150) % 2 === 1;
  const opacity = near ? (blink ? 0.4 : 1) : 0.55;
  const led = { fontFamily: 'DejaVu Sans Mono, Menlo, monospace', shadowColor: '#7CFF8A', shadowBlur: near ? 8 : 2 };
  return (
    <Group opacity={opacity}>
      <Text x={tx} y={ty + 18} width={tw} align="center" text="1,72" fontSize={9} fill="#7CFF8A" {...led} />
      <Text x={tx} y={ty + 31} width={tw} align="center" text="€/L" fontSize={7} fill="#7CFF8A" {...led} />
      <Rect x={cx - 44} y={rb + 15} width={88} height={12} cornerRadius={2} fill="#15161a" />
      <Text x={cx - 44} y={rb + 17.5} width={88} align="center" text="A4 › Stras · 32 min" fontSize={7} fill="#ffb347"
        {...led} shadowColor="#ffb347" />
    </Group>
  );
}

function PrivateLed({ id, near, t }) {
  const { cx, base, x, rb } = byId[id];
  return (
    <>
      <Circle x={cx + 26.5} y={base - 30} radius={1.9} fill={near ? '#ffcf6a' : '#c0392b'} shadowColor={near ? '#ffcf6a' : '#c0392b'} shadowBlur={6} />
      {id === 'studio' && near && t < 700 && (
        <Circle x={x + 20} y={rb - 3} radius={50} opacity={1 - t / 700} fillRadialGradientStartRadius={0} fillRadialGradientEndRadius={50}
          fillRadialGradientColorStops={[0, 'rgba(255,255,255,1)', 0.4, 'rgba(255,255,255,0.5)', 1, 'rgba(255,255,255,0)']} />
      )}
    </>
  );
}

function Letter({ near, t }) {
  const { x, width, base } = byId.poste;
  const k = near ? easeOut(t / 500) : 0;
  return k > 0 && <Rect x={x + width - 10} y={base - 30 - k * 10} width={13} height={9} cornerRadius={1} fill="#fbf6ec" stroke={INK} strokeWidth={0.8} rotation={-k * 10} />;
}

function Gear({ near, t }) {
  const { x, width, rb } = byId.usine;
  return (
    <Group x={x + width / 2 - 72} y={rb - 1} rotation={near ? t / 6 : 0}>
      <Circle radius={7} stroke="#f3d9a0" strokeWidth={4} dash={[3, 2.5]} />
      <Circle radius={4.5} fill="#d9b779" />
      <Circle radius={1.8} fill="#2a1c18" />
    </Group>
  );
}

// La Banque parle depuis le médaillon du fondateur, au-dessus du fronton.
const bubbleAnchor = { banque: ({ cx, rb }) => ({ cx, base: rb + 22 }) };

function Bubble({ id, text, at }) {
  const { cx, base } = at ?? bubbleAnchor[id]?.(byId[id]) ?? byId[id];
  return (
    <KLabel x={cx} y={base - 62} opacity={0.97}>
      <Tag fill="#fff6df" stroke={INK} strokeWidth={1} cornerRadius={10} pointerDirection="down" pointerWidth={12} pointerHeight={8} />
      <Text text={text} fontSize={11} fontFamily="system-ui, sans-serif" fill="#2b231d" padding={7} />
    </KLabel>
  );
}

// Le chat dort au bord de la rue ; il se redresse et miaule quand on approche.
function Cat({ awake }) {
  const { x, y } = props.cat;
  return (
    <Group x={x} y={y}>
      <Ellipse y={2} radiusX={13} radiusY={4} fill="#15131c" opacity={0.5} />
      {awake ? (
        <>
          <Ellipse y={-7} radiusX={7} radiusY={9} fill="#d98a3a" />
          <Circle y={-18} radius={6} fill="#d98a3a" />
          <Line points={[-5, -21, -4, -28, 0, -23]} closed fill="#d98a3a" />
          <Line points={[5, -21, 4, -28, 0, -23]} closed fill="#d98a3a" />
          <Circle x={-2.2} y={-18.5} radius={1} fill={INK} /><Circle x={2.2} y={-18.5} radius={1} fill={INK} />
          <Line points={[6, 0, 13, -4, 12, -14]} stroke="#d98a3a" strokeWidth={3} lineCap="round" tension={0.5} />
        </>
      ) : (
        <>
          <Ellipse y={-4} radiusX={11} radiusY={6} fill="#d98a3a" />
          <Circle x={-8} y={-6} radius={4.5} fill="#d98a3a" />
          <Line points={[-11, -9, -11, -13, -8, -10]} closed fill="#d98a3a" />
          <Line points={[-12, -6, -10, -5.5]} stroke={INK} strokeWidth={0.8} />
          <Line points={[10, -2, 13, 1, 6, 2]} stroke="#d98a3a" strokeWidth={3} lineCap="round" tension={0.5} />
          <Text x={8} y={-22} text="z" fontSize={9} fill="#f4eddc" opacity={0.6} />
        </>
      )}
    </Group>
  );
}

function Splash({ splash, t, reduced }) {
  if (!splash || t > 1000) return null;
  const k = reduced ? 0.4 : t / 1000; // mouvements réduits : une image fixe, le temps du plouf
  return (
    <Group x={splash.x} y={splash.y} opacity={1 - k}>
      {[0, 0.35].map((delay) => Math.max(0, k - delay) > 0 && (
        <Ellipse key={delay} radiusX={8 + 34 * (k - delay)} radiusY={4 + 13 * (k - delay)} stroke="#e4f1ff" strokeWidth={2.5} />
      ))}
      {[-2, -1, 0, 1, 2].map((d) => <Circle key={d} x={d * 6 * (1 + 1.5 * k)} y={-(24 - Math.abs(d) * 5) * Math.sin(Math.PI * k) - 2} radius={2.6} fill="#e4f1ff" />)}
    </Group>
  );
}

/* ---------------------------------------------------------------- personnage */

// David : cheveux bouclés noir et gris, lunettes rondes, bouc, pull gris, écharpe colorée.
function Walker({ player, walking, reduced }) {
  const stride = walking && !reduced ? Math.sin((player.distance ?? 0) / 4) * 3 : 0;
  const side = player.facing === 'left' ? -1 : player.facing === 'right' ? 1 : 0;
  const back = player.facing === 'up';
  const face = !back;
  const curls = [[-7, -45, 4], [-2.5, -48.5, 4.6], [3, -48.5, 4.6], [7.5, -45, 4], [9.2, -40.5, 2.8], [-9.2, -40.5, 2.8]];
  return (
    <Group x={player.x} y={player.y} listening={false}>
      <Ellipse y={2} radiusX={12} radiusY={5} fill="#15131c" opacity={0.6} />
      <Rect x={-7} y={-14 + stride} width={6} height={15} cornerRadius={2.5} fill="#2a3040" />
      <Rect x={1} y={-14 - stride} width={6} height={15} cornerRadius={2.5} fill="#2a3040" />
      <Rect x={-11} y={-32} width={22} height={20} cornerRadius={6} fill="#8d8f93" stroke="#4a4a50" strokeWidth={1} />
      {[-6, 0, 6].map((dx) => <Line key={dx} points={[dx, -28, dx, -14]} stroke="#a5a7ab" strokeWidth={1.3} dash={[2, 1.5]} />)}
      <Rect x={-10} y={-33} width={20} height={6} cornerRadius={3} fill="#5b7a3a" />
      {[[-6, -30, '#b8452f'], [-1, -31, '#d9a23a'], [4, -29.5, '#b8452f'], [8, -31, '#d9a23a']].map(([x, y, c]) => <Circle key={x} x={x} y={y} radius={1.4} fill={c} />)}
      {face && <Rect x={side ? side * 4 - 2.5 : 2} y={-29} width={5} height={11} cornerRadius={2} fill="#5b7a3a" />}
      <Circle x={side * 1.5} y={-40} radius={9} fill={back ? '#2b2522' : '#dcae8a'} />
      {face && (
        <Group x={side * 2.5}>
          {(side ? [side * 2.5] : [-3.8, 3.8]).map((gx) => (
            <Group key={gx}>
              <Circle x={gx} y={-40} radius={3.1} fill="rgba(207,230,239,0.3)" stroke="#d7d0c4" strokeWidth={1} />
              <Circle x={gx} y={-40} radius={0.9} fill="#2b231d" />
            </Group>
          ))}
          {!side && <Line points={[-0.7, -40.3, 0.7, -40.3]} stroke="#d7d0c4" strokeWidth={1} />}
          <Line points={[-3.4 + side * 2, -35.6, side * 2, -37, 3.4 + side * 2, -35.6]} stroke="#3a2c26" strokeWidth={1.3} tension={0.5} lineCap="round" />
          <Line points={[-2.6 + side * 2, -34.4, side * 2, -30, 2.6 + side * 2, -34.4]} closed fill="#3a2c26" tension={0.3} />
        </Group>
      )}
      {curls.map(([x, y, r]) => <Circle key={`${x},${y}`} x={x - side * 1.5} y={y} radius={r} fill="#2b2522" />)}
      <Line points={[1, -50.5, 4, -51.5, 6, -49.5]} stroke="#8a8580" strokeWidth={1.3} tension={0.5} lineCap="round" />
      <Line points={[-8, -46, -6.5, -48, -4.5, -48.5]} stroke="#8a8580" strokeWidth={1.3} tension={0.5} lineCap="round" />
    </Group>
  );
}

/* ---------------------------------------------------------------- scène */

export default function Scene({ viewport, view, nearby, bubble, catClose, catSays, splash, player, walking, reduced, target }) {
  const [width, setWidth] = useState(0);
  const [t, setT] = useState(0);
  const [splashT, setSplashT] = useState(1000);

  useEffect(() => {
    if (!splash) return undefined;
    setSplashT(0);
    const timer = window.setInterval(() => {
      const elapsed = performance.now() - splash.at;
      setSplashT(elapsed);
      if (elapsed > 1000) window.clearInterval(timer);
    }, 33);
    return () => window.clearInterval(timer);
  }, [splash]);

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(viewport.current);
    return () => observer.disconnect();
  }, [viewport]);

  // Horloge des effets : elle ne tourne que devant une porte, et jamais en mouvements réduits.
  useEffect(() => {
    setT(reduced ? 10000 : 0);
    if (!nearby || reduced) return undefined;
    const start = performance.now();
    const timer = window.setInterval(() => setT(performance.now() - start), 33);
    return () => window.clearInterval(timer);
  }, [nearby, reduced]);

  if (width <= 0) return null;
  const scale = width / view.width;
  const camera = cameraFor(player, view);
  const near = (id) => nearby === id;
  const fx = (id) => ({ near: near(id), t });

  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div style={{ transform: `translate(${-camera.x * scale}px, ${-camera.y * scale}px)`, willChange: 'transform' }}>
        <Stage width={villageMap.width * scale} height={villageMap.height * scale} scaleX={scale} scaleY={scale} listening={false}>
          <Layer listening={false}>
            <Town />
          </Layer>
          <Layer listening={false}>
            {nearby && <DoorHalo id={nearby} />}
            <PivotSign {...fx('pivot')} />
            <ArcadeNeon {...fx('arcade')} />
            <Books {...fx('biblio')} />
            <GarageDisplays {...fx('garage')} />
            <PrivateLed id="banque" {...fx('banque')} />
            <PrivateLed id="studio" {...fx('studio')} />
            <Letter {...fx('poste')} />
            <Gear {...fx('usine')} />
            <Splash splash={splash} t={splashT} reduced={reduced} />
            {target && <Circle x={target.x} y={target.y} radius={7} stroke="#ffdf9d" strokeWidth={2} />}
            {/* le plus au sud est dessiné devant */}
            {player.y >= props.cat.y && <Cat awake={catClose} />}
            <Walker player={player} walking={walking} reduced={reduced} />
            {player.y < props.cat.y && <Cat awake={catClose} />}
            {nearby && bubble && <Bubble id={nearby} text={bubble} />}
            {catClose && <Bubble at={{ cx: props.cat.x, base: props.cat.y + 32 }} text={catSays} />}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}
