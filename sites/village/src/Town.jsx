// Le décor fixe du village, ambiance « conte cosy du soir ».
// Dessiné une seule fois : seuls le personnage et les effets d'approche bougent (voir Scene.jsx).
import { memo, useEffect, useState } from 'react';
import { Circle, Ellipse, Group, Image, Line, Rect, Text } from 'react-konva';
import davidUrl from './art/david.jpg';
import { buildings, props, villageMap } from './map.js';

export const FH = 80; // hauteur des façades
export const SERIF = 'Iowan Old Style, Palatino, Georgia, serif';
export const SANS = 'Futura, Century Gothic, Avenir Next, system-ui, sans-serif';
export const LIGHT = '#ffcf8a';
export const INK = '#1b1722';
const glow = (color = '#ffb45a', blur = 12) => ({ shadowColor: color, shadowBlur: blur, shadowOpacity: 0.9 });

export const byId = Object.fromEntries(buildings.map((b) => [b.id, { ...b, rb: b.base - FH, cx: b.x + b.door }]));

/* ---------------------------------------------------------------- briques */

export function Label({ cx, y, width, text, size = 12, color = '#f3d9a0', font = SERIF, bold, spacing = 0, lit = true }) {
  return <Text x={cx - width / 2} y={y} width={width} align="center" text={text} fontSize={size} fontFamily={font}
    fontStyle={bold ? 'bold' : 'normal'} letterSpacing={spacing} fill={color} {...(lit ? glow(color, 8) : {})} />;
}

function Board({ cx, y, width, height = 22, fill = '#2b211c', ...label }) {
  return (
    <>
      <Rect x={cx - width / 2} y={y} width={width} height={height} cornerRadius={3} fill={fill} stroke={INK} strokeWidth={1.2} />
      <Label cx={cx} y={y + (height - (label.size ?? 12)) / 2 + 1} width={width} {...label} />
    </>
  );
}

function Win({ x, y, width = 24, height = 26, shutters, lit = true, fill = LIGHT }) {
  return (
    <Group>
      {shutters && <Rect x={x - 8} y={y} width={7} height={height} fill="#5e2a2a" stroke={INK} strokeWidth={1} />}
      {shutters && <Rect x={x + width + 1} y={y} width={7} height={height} fill="#5e2a2a" stroke={INK} strokeWidth={1} />}
      <Rect x={x} y={y} width={width} height={height} fill={lit ? fill : '#3a3040'} stroke={INK} strokeWidth={1.2} {...(lit ? glow() : {})} />
      <Line points={[x + width / 2, y, x + width / 2, y + height]} stroke={INK} strokeWidth={1.2} />
      <Line points={[x, y + height * 0.45, x + width, y + height * 0.45]} stroke={INK} strokeWidth={1} />
    </Group>
  );
}

export function Door({ cx, base, fill = '#4a3328', light = LIGHT }) {
  return (
    <Group>
      <Rect x={cx - 17} y={base - 50} width={34} height={50} cornerRadius={[5, 5, 0, 0]} fill={fill} stroke={INK} strokeWidth={1.2} />
      <Rect x={cx - 11} y={base - 44} width={22} height={14} cornerRadius={2} fill={light} stroke={INK} strokeWidth={1} {...(light === LIGHT ? glow() : {})} />
      <Circle x={cx + 10} y={base - 22} radius={2} fill="#e8bd83" />
      <Rect x={cx - 22} y={base - 1} width={44} height={5} cornerRadius={1.5} fill="#6a6470" stroke={INK} strokeWidth={1} />
    </Group>
  );
}

function Digicode({ x, base }) {
  return (
    <Group>
      <Rect x={x} y={base - 34} width={9} height={14} cornerRadius={1.5} fill="#2a2830" stroke={INK} strokeWidth={1} />
      <Circle x={x + 4.5} y={base - 30} radius={1.8} fill="#c0392b" />
      <Text x={x - 3} y={base - 48} text="🔒" fontSize={10} />
    </Group>
  );
}

// Toit à deux pans vu de face et de dessus : le pan avant occupe l'essentiel.
function GableRoof({ x, top, width, rb, fill, back }) {
  const ridge = top + (rb - top) * 0.32;
  return (
    <Group>
      <Rect x={x - 4} y={top} width={width + 8} height={ridge - top + 2} fill={back} stroke={INK} strokeWidth={1.2} />
      <Line points={[x - 10, rb + 4, x + width + 10, rb + 4, x + width + 4, ridge, x - 4, ridge]} closed fill={fill} stroke={INK} strokeWidth={1.2} />
      {Array.from({ length: Math.floor((rb - ridge) / 9) }, (_, i) => {
        const y = ridge + 9 * (i + 1);
        const k = (y - ridge) / (rb + 4 - ridge) * 6;
        return <Line key={i} points={[x - 4 - k, y, x + width + 4 + k, y]} stroke={INK} strokeWidth={1} opacity={0.3} />;
      })}
      <Rect x={x} y={rb + 4} width={width} height={6} fill="#000" opacity={0.25} />
    </Group>
  );
}

function FlatRoof({ x, top, width, rb, fill, inner }) {
  return (
    <Group>
      <Rect x={x - 3} y={top} width={width + 6} height={rb - top + 4} fill={fill} stroke={INK} strokeWidth={1.2} />
      <Rect x={x + 7} y={top + 8} width={width - 14} height={rb - top - 14} fill={inner} />
      <Rect x={x} y={rb + 4} width={width} height={5} fill="#000" opacity={0.25} />
    </Group>
  );
}

function Facade({ x, rb, width, fill }) {
  return <Rect x={x} y={rb} width={width} height={FH} fill={fill} stroke={INK} strokeWidth={1.2} />;
}

// Le portrait de David (celui de l'ancien accueil), encadré.
function Portrait({ x, y, size, round }) {
  const [image, setImage] = useState(null);
  useEffect(() => {
    const img = new window.Image();
    img.onload = () => setImage(img);
    img.src = davidUrl;
    return () => { img.onload = null; };
  }, []);
  const clip = round
    ? (ctx) => ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
    : (ctx) => ctx.rect(0, 0, size, size);
  return (
    <Group x={x} y={y}>
      {round
        ? <Circle x={size / 2} y={size / 2} radius={size / 2 + 2.5} fill="#c9a24a" stroke={INK} strokeWidth={1} {...glow('#ffe0a0', 8)} />
        : <Rect x={-2} y={-2} width={size + 4} height={size + 4} fill={LIGHT} stroke={INK} strokeWidth={1.2} {...glow()} />}
      <Group clipFunc={clip}>{image && <Image image={image} width={size} height={size} />}</Group>
    </Group>
  );
}

/* ---------------------------------------------------------------- bâtiments */

const draw = {
  maison: ({ x, top, width, rb, base, cx }) => (
    <>
      <GableRoof x={x} top={top} width={width} rb={rb} fill="#5a3330" back="#6e3e38" />
      <Rect x={x + width / 2 - 24} y={rb - 42} width={48} height={40} fill="#b8a68a" stroke={INK} strokeWidth={1.2} />
      <Line points={[x + width / 2 - 30, rb - 40, x + width / 2, rb - 60, x + width / 2 + 30, rb - 40]} closed fill="#5a3330" stroke={INK} strokeWidth={1.2} />
      <Rect x={x + width / 2 - 25} y={rb - 37} width={8} height={30} fill="#5e2a2a" stroke={INK} strokeWidth={1} />
      <Rect x={x + width / 2 + 17} y={rb - 37} width={8} height={30} fill="#5e2a2a" stroke={INK} strokeWidth={1} />
      <Portrait x={x + width / 2 - 15} y={rb - 37} size={30} />
      <Facade x={x} rb={rb} width={width} fill="#b8a68a" />
      <Win x={x + 34} y={rb + 6} width={22} height={24} shutters /><Win x={x + 124} y={rb + 6} width={22} height={24} shutters />
      <Rect x={x + 2} y={rb + 26} width={width - 4} height={3} fill={INK} />
      {Array.from({ length: 18 }, (_, i) => <Line key={i} points={[x + 6 + i * 9.6, rb + 29, x + 6 + i * 9.6, rb + 40]} stroke={INK} strokeWidth={1} />)}
      <Rect x={x} y={rb + 40} width={width} height={40} fill="#6d6a70" stroke={INK} strokeWidth={1.2} />
      <Rect x={x + 12} y={rb + 46} width={52} height={34} fill="#3d3740" stroke={INK} strokeWidth={1.2} />
      <Circle x={x + 92} y={rb + 58} radius={8} fill="#d9e3d6" stroke={INK} strokeWidth={1} />
      <Ellipse x={x + 92} y={rb + 58} radiusX={4} radiusY={2.5} fill="#6f9a78" />
      <Door cx={cx} base={base} fill="#4a3328" />
    </>
  ),

  pivot: ({ x, top, width, rb, base, cx }) => (
    <>
      <GableRoof x={x} top={top} width={width} rb={rb} fill="#2e3540" back="#3a4350" />
      <Facade x={x} rb={rb} width={width} fill="#55665f" />
      <Win x={x + 16} y={rb + 22} width={36} height={40} /><Win x={x + width - 52} y={rb + 22} width={36} height={40} />
      <Door cx={cx} base={base} fill="#2d3b36" />
      {/* l'enseigne est dessinée dans Scene.jsx : elle réagit à l'approche */}
      <Line points={[cx - 30, rb - 14, cx - 30, rb - 6]} stroke={INK} strokeWidth={1.5} />
      <Line points={[cx + 30, rb - 14, cx + 30, rb - 6]} stroke={INK} strokeWidth={1.5} />
    </>
  ),

  biblio: ({ x, top, width, rb, base, cx }) => (
    <>
      <GableRoof x={x} top={top} width={width} rb={rb} fill="#3b2a26" back="#4a3530" />
      <Facade x={x} rb={rb} width={width} fill="#6e5240" />
      <Board cx={x + width / 2} y={rb - 12} width={150} height={24} text="La Bibliothèque" size={14} />
      <Rect x={x + 12} y={rb + 20} width={110} height={52} cornerRadius={3} fill={LIGHT} stroke={INK} strokeWidth={1.2} {...glow()} />
      <Rect x={x + 14} y={rb + 64} width={106} height={4} fill="#3b2a22" />
      <Door cx={cx} base={base} fill="#4a2424" />
    </>
  ),

  garage: ({ x, top, width, rb, base, cx }) => (
    <>
      <FlatRoof x={x} top={top} width={width} rb={rb} fill="#3a3d44" inner="#4a4e56" />
      <Rect x={x + 120} y={top + 20} width={50} height={26} fill="#5f7a8a" opacity={0.6} />
      <Facade x={x} rb={rb} width={width} fill="#6a6f78" />
      <Board cx={x + width / 2} y={rb - 14} width={120} height={26} fill="#2b2f36" text="GARAGE" size={15} font={SANS} bold spacing={4} color={LIGHT} />
      <Rect x={x + 10} y={rb + 16} width={112} height={64} fill="#4a4e56" stroke={INK} strokeWidth={1.2} />
      {[0, 1, 2].map((i) => <Line key={i} points={[x + 10, rb + 22 + i * 8, x + 122, rb + 22 + i * 8]} stroke="#3a3d44" strokeWidth={2} />)}
      <Rect x={x + 10} y={rb + 44} width={112} height={36} fill={LIGHT} {...glow()} />
      <Line points={[x + 24, base, x + 28, base - 16, x + 48, base - 20, x + 80, base - 20, x + 96, base - 8, x + 100, base]} closed fill="#2a2630" />
      <Circle x={x + 40} y={base} radius={6} fill="#15131c" /><Circle x={x + 86} y={base} radius={6} fill="#15131c" />
      <Door cx={cx} base={base} fill="#3a3d44" />
    </>
  ),

  banque: ({ x, top, width, rb, base, cx }) => (
    <>
      <FlatRoof x={x} top={top} width={width} rb={rb} fill="#7f7a72" inner="#8f8a80" />
      <Line points={[x - 8, rb + 2, x + width / 2, rb - 46, x + width + 8, rb + 2]} closed fill="#a39d92" stroke={INK} strokeWidth={1.2} />
      <Portrait x={x + width / 2 - 16} y={rb - 36} size={32} round />
      <Facade x={x} rb={rb} width={width} fill="#8f8a80" />
      <Rect x={x - 4} y={rb} width={width + 8} height={16} fill="#b2ac9f" stroke={INK} strokeWidth={1} />
      <Label cx={x + width / 2} y={rb + 3} width={width} text="BANQUE" size={11} color="#2b2630" font={SANS} bold spacing={4} lit={false} />
      {[12, 40, width - 52, width - 24].map((dx) => <Rect key={dx} x={x + dx} y={rb + 18} width={11} height={58} fill="#c2bcae" stroke={INK} strokeWidth={1} />)}
      <Rect x={x - 8} y={base - 4} width={width + 16} height={5} fill="#77736c" />
      <Door cx={cx} base={base} fill="#2d2a30" light="#5a5470" />
      <Digicode x={cx + 22} base={base} />
    </>
  ),

  studio: ({ x, top, width, rb, base, cx }) => (
    <>
      <FlatRoof x={x} top={top} width={width} rb={rb} fill="#33364a" inner="#3d4058" />
      <Rect x={x + 30} y={top + 16} width={90} height={30} fill="#7d8fb0" opacity={0.45} />
      <Facade x={x} rb={rb} width={width} fill="#4a4f6a" />
      <Rect x={x + 6} y={rb - 14} width={width - 12} height={24} cornerRadius={4} fill="#1f2030" stroke={INK} strokeWidth={1.2} />
      <Rect x={x + 12} y={rb - 9} width={16} height={12} cornerRadius={2} fill="#c9c6d6" />
      <Circle x={x + 20} y={rb - 3} radius={3.5} fill="#1f2030" stroke="#c9c6d6" />
      <Label cx={x + width / 2 + 10} y={rb - 7} width={width - 30} text="STUDIO PHOTO" size={10} color="#ffe7b0" font={SANS} bold spacing={1.5} />
      <Rect x={x + 10} y={rb + 18} width={70} height={54} fill={LIGHT} stroke={INK} strokeWidth={1.2} {...glow()} />
      {[[16, 24, 24, 20], [46, 24, 28, 18], [46, 46, 28, 22], [16, 48, 24, 18]].map(([a, b, c, d]) => (
        <Rect key={a + b} x={x + a} y={rb + b} width={c} height={d} fill="#3a3040" stroke="#e7d2a6" strokeWidth={2} />
      ))}
      <Door cx={cx} base={base} fill="#2a2c3c" light="#5a5470" />
      <Digicode x={cx + 22} base={base} />
    </>
  ),

  arcade: ({ x, top, width, rb, base, cx }) => (
    <>
      <FlatRoof x={x} top={top} width={width} rb={rb} fill="#1d1630" inner="#251c3c" />
      <Facade x={x} rb={rb} width={width} fill="#2b2140" />
      <Rect x={x + 12} y={rb + 16} width={72} height={56} cornerRadius={3} fill="#141a3a" stroke={INK} strokeWidth={1.2} />
      {['..x...x..', '...x.x...', '..xxxxx..', '.xx.x.xx.', 'xxxxxxxxx', 'x.xxxxx.x', 'x.x...x.x', '...x.x...'].flatMap((row, j) =>
        [...row].map((c, i) => c === 'x' && <Rect key={`${i}-${j}`} x={x + 35 + i * 3} y={rb + 24 + j * 3} width={3} height={3} fill="#7CFF8A" />))}
      <Label cx={x + 48} y={rb + 54} width={70} text="85 jeux" size={9} color="#5ff2ff" font={SANS} />
      <Door cx={cx} base={base} fill="#3a2a5a" light="#ff9ee6" />
      {/* le néon ARCADE est dans Scene.jsx */}
    </>
  ),

  poste: ({ x, top, width, rb, base, cx }) => (
    <>
      <GableRoof x={x} top={top} width={width} rb={rb} fill="#4a3b4a" back="#5a4a5a" />
      <Facade x={x} rb={rb} width={width} fill="#c8b48a" />
      <Board cx={x + width / 2} y={rb - 12} width={110} height={22} fill="#2f3f6b" text="POSTE" size={13} font={SANS} bold spacing={5} />
      <Rect x={x + 12} y={rb + 18} width={52} height={54} fill={LIGHT} stroke={INK} strokeWidth={1.2} {...glow()} />
      <Label cx={x + 38} y={rb + 30} width={52} text={'Livre\nd’or'} size={11} color="#3b2a22" lit={false} />
      <Door cx={cx} base={base} fill="#2f3f6b" />
      <Rect x={x + width - 6} y={base - 4} width={4} height={14} fill={INK} />
      <Rect x={x + width - 14} y={base - 26} width={20} height={24} cornerRadius={5} fill="#2f5d8a" stroke={INK} strokeWidth={1.2} />
      <Rect x={x + width - 10} y={base - 19} width={12} height={2.5} fill={INK} />
    </>
  ),

  usine: ({ x, top, width, rb, base, cx }) => (
    <>
      <Rect x={x} y={top} width={width} height={rb - top + 4} fill="#4a3530" stroke={INK} strokeWidth={1.2} />
      {[0, 1, 2, 3].map((i) => (
        <Group key={i}>
          <Rect x={x + 4} y={top + 6 + i * 16} width={width - 8} height={7} fill={LIGHT} opacity={0.55} {...glow()} />
          <Line points={[x, top + 14 + i * 16, x + width, top + 14 + i * 16]} stroke={INK} strokeWidth={1.2} />
        </Group>
      ))}
      <Rect x={x + width - 30} y={top - 60} width={20} height={80} fill="#6a3328" stroke={INK} strokeWidth={1.2} />
      <Rect x={x + width - 30} y={top - 48} width={20} height={4} fill="#4a2420" />
      {[[0, 0, 8], [8, -16, 11], [20, -34, 14]].map(([dx, dy, r]) => <Circle key={dy} x={x + width - 20 + dx} y={top - 66 + dy} radius={r} fill="#9a93a8" opacity={0.35} />)}
      <Facade x={x} rb={rb} width={width} fill="#7a3b2e" />
      {Array.from({ length: 5 }, (_, i) => <Line key={i} points={[x, rb + 14 + i * 14, x + width, rb + 14 + i * 14]} stroke="#6a3328" strokeWidth={1} />)}
      <Board cx={x + width / 2 - 20} y={rb - 12} width={124} height={22} fill="#2a1c18" text="   L’USINE" size={13} font={SANS} bold spacing={3} />
      {[12, 74].map((dx) => (
        <Group key={dx}>
          <Rect x={x + dx} y={rb + 18} width={54} height={50} fill={LIGHT} stroke={INK} strokeWidth={1.2} {...glow()} />
          <Line points={[x + dx + 18, rb + 18, x + dx + 18, rb + 68]} stroke={INK} strokeWidth={1.1} />
          <Line points={[x + dx + 36, rb + 18, x + dx + 36, rb + 68]} stroke={INK} strokeWidth={1.1} />
          <Line points={[x + dx, rb + 43, x + dx + 54, rb + 43]} stroke={INK} strokeWidth={1.1} />
        </Group>
      ))}
      <Rect x={cx - 24} y={rb + 6} width={48} height={14} cornerRadius={2} fill="#f3e6cc" stroke={INK} strokeWidth={1} />
      <Label cx={cx} y={rb + 9} width={48} text="EMBAUCHE" size={7.5} color="#7a3b2e" font={SANS} bold lit={false} />
      <Door cx={cx} base={base} fill="#3a2420" />
    </>
  ),

  dojo: ({ x, top, width, rb, base, cx }) => (
    <>
      <Line points={[x - 16, rb + 6, x + width + 16, rb + 6, x + width + 2, top + 26, x - 2, top + 26]} closed fill="#2a2228" stroke={INK} strokeWidth={1.2} tension={0.08} />
      <Rect x={x + 10} y={top} width={width - 20} height={30} fill="#352b33" stroke={INK} strokeWidth={1.2} />
      <Line points={[x - 18, rb + 8, x - 8, rb - 2]} stroke={INK} strokeWidth={3} /><Line points={[x + width + 18, rb + 8, x + width + 8, rb - 2]} stroke={INK} strokeWidth={3} />
      <Rect x={x} y={rb + 6} width={width} height={FH - 6} fill="#e8dcc0" stroke={INK} strokeWidth={1.2} {...glow('#ffcf8a', 14)} />
      {Array.from({ length: 6 }, (_, i) => <Line key={i} points={[x + 10 + i * 24, rb + 6, x + 10 + i * 24, base]} stroke="#4a3328" strokeWidth={2} />)}
      {[0, 1, 2].map((i) => <Line key={i} points={[x, rb + 26 + i * 20, x + width, rb + 26 + i * 20]} stroke="#4a3328" strokeWidth={1.2} />)}
      <Board cx={x + width / 2} y={rb - 6} width={64} height={20} fill="#3b2a22" text="DOJO" size={12} font={SANS} bold spacing={4} />
      <Rect x={cx - 19} y={base - 52} width={38} height={52} fill="#c9b48e" stroke={INK} strokeWidth={1.2} />
      <Line points={[cx, base - 52, cx, base]} stroke="#4a3328" strokeWidth={2} />
    </>
  ),

  winstub: ({ x, top, width, rb, base, cx }) => (
    <>
      <GableRoof x={x} top={top} width={width} rb={rb} fill="#5a3330" back="#6e3e38" />
      <Rect x={x + 100} y={top - 18} width={14} height={36} fill="#6a4038" stroke={INK} strokeWidth={1.2} />
      <Ellipse x={x + 107} y={top - 18} radiusX={14} radiusY={5} fill="#5a4030" />
      <Group x={x + 107} y={top - 26}>
        <Ellipse radiusX={8} radiusY={5} fill="#f2efe6" />
        <Line points={[2, -1, 9, -3, 7, 4]} closed fill={INK} />
        <Circle x={-6} y={-7} radius={3.2} fill="#f2efe6" />
        <Line points={[-9, -7, -17, -5, -9, -6]} closed fill="#d9532c" />
      </Group>
      <Facade x={x} rb={rb} width={width} fill="#c9a77a" />
      {[0, 48, 100, width - 5].map((dx) => <Rect key={dx} x={x + dx} y={rb} width={5} height={FH} fill="#3b2a22" />)}
      <Rect x={x} y={rb + 36} width={width} height={4} fill="#3b2a22" />
      <Line points={[x + 6, rb + 2, x + 46, rb + 36]} stroke="#3b2a22" strokeWidth={4} /><Line points={[x + 46, rb + 2, x + 6, rb + 36]} stroke="#3b2a22" strokeWidth={4} />
      <Rect x={x + 10} y={rb + 44} width={74} height={30} fill={LIGHT} stroke={INK} strokeWidth={1.2} {...glow()} />
      {[0, 1, 2].map((i) => <Group key={i}><Circle x={x + 20 + i * 24} y={rb + 74} radius={3} fill="#d9665a" /><Circle x={x + 27 + i * 24} y={rb + 73} radius={3} fill="#e9a15a" /></Group>)}
      <Board cx={x + 74} y={rb + 8} width={56} height={20} text="Winstub" size={11} />
      <Door cx={cx} base={base} fill="#4a2c24" light="#5a3f30" />
    </>
  ),

  boulangerie: ({ x, top, width, rb, base, cx }) => (
    <>
      <GableRoof x={x} top={top} width={width} rb={rb} fill="#6b3a30" back="#7a4638" />
      <Facade x={x} rb={rb} width={width} fill="#d6b98c" />
      <Board cx={x + width / 2} y={rb - 12} width={110} height={22} fill="#3b2a22" text="Boulangerie" size={13} />
      <Text x={x + width / 2 - 8} y={rb - 34} text="🥨" fontSize={16} />
      <Rect x={x + 8} y={rb + 26} width={72} height={48} fill="#5a4a40" stroke={INK} strokeWidth={1.2} />
      <Rect x={x + 8} y={rb + 26} width={72} height={32} fill="#8a8580" stroke={INK} strokeWidth={1} />
      {[0, 1, 2].map((i) => <Line key={i} points={[x + 8, rb + 32 + i * 8, x + 80, rb + 32 + i * 8]} stroke="#6d6a70" strokeWidth={1.2} />)}
      {Array.from({ length: 6 }, (_, i) => <Rect key={i} x={x + 6 + i * 13} y={rb + 14} width={13} height={12} cornerRadius={[0, 0, 6, 6]} fill={i % 2 ? '#f3e6cc' : '#a8432f'} stroke={INK} strokeWidth={0.8} />)}
      <Rect x={x + 26} y={rb + 60} width={36} height={11} cornerRadius={2} fill="#f3e6cc" stroke={INK} strokeWidth={0.8} />
      <Label cx={x + 44} y={rb + 62} width={36} text="FERMÉ" size={7.5} color="#a8432f" font={SANS} bold lit={false} />
      <Door cx={cx} base={base} fill="#4a3328" light="#3a3036" />
    </>
  ),
};

/* ---------------------------------------------------------------- sol et décor */

const streets = [
  [0, 470, 1360, 82],        // rue principale
  [30, 250, 1310, 72],       // ruelle haute
  [100, 780, 700, 62],       // ruelle basse
  [800, 320, 200, 232],      // place de la fontaine
  [252, 320, 56, 150], [532, 320, 56, 150], [1262, 320, 60, 150], // passages vers le haut
  [330, 552, 56, 228], [712, 552, 56, 228],                       // passages vers le bas
  [230, 100, 30, 150], [410, 100, 150, 150], [710, 100, 30, 150], [890, 100, 70, 150], [1170, 100, 30, 150], // fonds de ruelles
];

const cobbles = [];
for (let row = 0; row < 37; row++) {
  for (let col = 0; col < 36; col++) {
    cobbles.push({ x: col * 38 - (row % 2) * 19 + (row * col) % 4, y: 96 + row * 21 + (col % 3), w: 28 + (row * 5 + col * 3) % 8, o: 0.35 + ((row * 3 + col) % 4) * 0.1 });
  }
}

const lanterns = [[280, 466], [560, 466], [812, 466], [988, 466], [1250, 466], [245, 246], [535, 246], [725, 246], [935, 246], [1185, 246], [318, 776], [700, 776]];
const stars = Array.from({ length: 30 }, (_, i) => [(i * 97) % 1360, (i * 37) % 80 + 6, i % 5 ? 0.8 : 1.4]);

function Ground() {
  const clip = (ctx) => streets.forEach(([x, y, w, h]) => ctx.rect(x, y, w, h));
  return (
    <>
      <Rect width={villageMap.width} height={villageMap.height} fill="#25352e" />
      <Rect width={villageMap.width} height={96} fill="#1c2142" />
      {stars.map(([x, y, r]) => <Circle key={x} x={x} y={y} radius={r} fill="#fff" opacity={0.6} />)}
      <Circle x={1290} y={36} radius={14} fill="#f6e9c8" opacity={0.9} /><Circle x={1297} y={31} radius={12} fill="#1c2142" />
      <Line points={[0, 96, 200, 70, 420, 88, 640, 66, 900, 90, 1120, 64, 1360, 84, 1360, 100, 0, 100]} closed fill="#232a3e" />
      {Array.from({ length: 40 }, (_, i) => <Ellipse key={i} x={(i * 173) % 1360} y={110 + (i * 251) % 760} radiusX={40} radiusY={16} fill="#2c3f36" opacity={0.7} />)}
      <Group clipFunc={clip}>
        <Rect width={villageMap.width} height={villageMap.height} fill="#3b3a48" />
        {cobbles.map(({ x, y, w, o }) => <Rect key={`${x},${y}`} x={x} y={y} width={w} height={16} cornerRadius={6} fill="#4a4858" opacity={o} />)}
      </Group>
      {streets.map(([x, y, w, h]) => <Rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} stroke="#2a2a36" strokeWidth={2} />)}
    </>
  );
}

function Fountain() {
  const { x, y } = props.fountain;
  return (
    <Group>
      <Ellipse x={x} y={y + 6} radiusX={40} radiusY={22} fill="#15131c" opacity={0.4} />
      <Ellipse x={x} y={y} radiusX={36} radiusY={20} fill="#6d6a70" stroke={INK} strokeWidth={1.2} />
      <Ellipse x={x} y={y - 2} radiusX={29} radiusY={15} fill="#3d5a80" />
      <Ellipse x={x - 8} y={y - 6} radiusX={10} radiusY={3} fill="#9fc4e8" opacity={0.5} />
      <Rect x={x - 4} y={y - 28} width={8} height={26} fill="#8a8580" stroke={INK} strokeWidth={1} />
      <Ellipse x={x} y={y - 28} radiusX={11} radiusY={4} fill="#8a8580" stroke={INK} strokeWidth={1} />
      <Circle x={x} y={y - 34} radius={4} fill="#9fc4e8" opacity={0.8} />
    </Group>
  );
}

function Pond() {
  const { x, y, width, height } = props.pond;
  return (
    <Group>
      <Rect x={x - 6} y={y - 6} width={width + 12} height={height + 12} cornerRadius={50} fill="#4a4858" />
      <Rect x={x} y={y} width={width} height={height} cornerRadius={46} fill="#24365a" stroke={INK} strokeWidth={1.2} />
      {[[60, 30], [150, 70], [200, 40]].map(([dx, dy]) => <Line key={dx} points={[x + dx, y + dy, x + dx + 30, y + dy]} stroke="#6a8ab8" strokeWidth={1.5} opacity={0.5} />)}
      <Ellipse x={x + 160} y={y + 34} radiusX={40} radiusY={10} fill="#ffcf8a" opacity={0.12} />
      {[[100, 60], [128, 74]].map(([dx, dy], i) => (
        <Group key={i} x={x + dx} y={y + dy} scaleX={i ? -1 : 1}>
          <Ellipse radiusX={9} radiusY={5} fill="#d9c9a0" /><Circle x={-7} y={-5} radius={4} fill="#3b6b4a" /><Line points={[-11, -5, -15, -4, -11, -3]} closed fill="#e9a15a" />
        </Group>
      ))}
      {[10, 18, 26, 236, 244].map((dx) => <Line key={dx} points={[x + dx, y + height - 6, x + dx + 2, y + height - 26]} stroke="#4a6a3a" strokeWidth={2} />)}
    </Group>
  );
}

function Totem() {
  const { x, y, width, height } = props.totem;
  return (
    <Group>
      <Rect x={x} y={y} width={width} height={height - 20} cornerRadius={3} fill="#2b2f36" stroke={INK} strokeWidth={1.2} />
      <Rect x={x + width / 2 - 2} y={y + height - 20} width={4} height={20} fill={INK} />
      <Label cx={x + width / 2} y={y + 6} width={width} text="SP95" size={7} color="#f4eddc" font={SANS} bold lit={false} />
      <Text x={x + width / 2 - 7} y={y + 44} text="⛽" fontSize={12} />
    </Group>
  );
}

function Tree({ x, y }) {
  return (
    <Group x={x} y={y}>
      <Ellipse y={2} radiusX={22} radiusY={7} fill="#15131c" opacity={0.5} />
      <Rect x={-4} y={-18} width={8} height={20} fill="#3b2a22" />
      <Circle x={-10} y={-28} radius={16} fill="#263d31" />
      <Circle x={9} y={-32} radius={18} fill="#2f4a3a" />
      <Circle x={0} y={-44} radius={15} fill="#33503f" />
    </Group>
  );
}

export function Lantern({ x, y, lit = 1 }) {
  return (
    <Group x={x} y={y}>
      <Circle y={-56} radius={34} fillRadialGradientStartRadius={0} fillRadialGradientEndRadius={34}
        fillRadialGradientColorStops={[0, `rgba(255,213,154,${0.5 * lit})`, 1, 'rgba(255,213,154,0)']} />
      <Line points={[0, 0, 0, -50]} stroke={INK} strokeWidth={3} lineCap="round" />
      <Line points={[-6, -62, 6, -62, 4, -50, -4, -50]} closed fill="#ffd38f" stroke={INK} strokeWidth={1} {...glow('#ffb45a', 10)} />
      <Line points={[-8, -62, 0, -68, 8, -62]} closed fill={INK} />
    </Group>
  );
}

export const Town = memo(function Town() {
  return (
    <>
      <Ground />
      <Pond />
      {buildings.map((b) => <Group key={b.id}>{draw[b.id](byId[b.id])}</Group>)}
      <Fountain />
      <Totem />
      {lanterns.map(([x, y]) => <Lantern key={`${x}-${y}`} x={x} y={y} />)}
      {props.trees.map(([x, y]) => <Tree key={`${x}-${y}`} x={x} y={y} />)}
      <Rect width={villageMap.width} height={villageMap.height} fill="#1c2142" opacity={0.1} listening={false} />
    </>
  );
});
