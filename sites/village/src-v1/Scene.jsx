import { memo, useEffect, useState } from 'react';
import { Circle, Ellipse, Group, Image, Layer, Line, Rect, Stage } from 'react-konva';
import { villageMap } from './map.js';
import logoUrl from './art/pivot.jpeg';

const path = [58, 125, 242, 125, 242, 237, 591, 237, 591, 361, 58, 361];
const shrubs = [[43, 78, 1], [86, 56, 0.6], [166, 66, 0.9], [216, 54, 0.5],
  [603, 74, 1.3], [637, 118, 0.8], [580, 162, 0.9], [642, 279, 1.15],
  [626, 345, 0.65], [33, 313, 0.75], [133, 382, 0.5], [345, 386, 0.7], [474, 389, 0.55]];
const paving = Array.from({ length: 12 }, (_, row) =>
  Array.from({ length: 16 }, (_, column) => ({
    x: column * 39 - (row % 2) * 19,
    y: row * 26 + 106,
    tone: ['#647168', '#59675f', '#616e64', '#6a776a'][(row * 7 + column * 13) % 4],
  })));

const Ground = memo(function Ground() {
  return (
    <>
      <Rect width={villageMap.width} height={villageMap.height} fill="#31453c" />
      {shrubs.map(([x, y, scale]) => (
        <Group key={x} x={x} y={y} scaleX={scale} scaleY={scale}>
          <Ellipse y={8} radiusX={23} radiusY={10} fill="#25392f" />
          <Circle x={-9} radius={13} fill="#3b5545" />
          <Circle x={7} y={-6} radius={16} fill="#496452" />
          <Circle x={-1} y={-11} radius={7} fill="#5b745d" opacity={0.6} />
        </Group>
      ))}
      <Line points={path} closed fill="#293b32" stroke="#495e50" strokeWidth={11} lineJoin="round" />
      <Group clipFunc={(context) => {
        context.moveTo(path[0], path[1]);
        for (let i = 2; i < path.length; i += 2) context.lineTo(path[i], path[i + 1]);
        context.closePath();
      }}>
        <Rect width={villageMap.width} height={villageMap.height} fill="#4b5951" />
        {paving.map((row) => row.map(({ x, y, tone }) => (
          <Rect key={`${x},${y}`} x={x} y={y} width={37} height={24} cornerRadius={3} fill={tone} />
        )))}
      </Group>
      <Rect x={85} y={139} width={102} height={49} fill="#647368" stroke="#9caa8d" dash={[4, 5]} cornerRadius={8} />
    </>
  );
});

function Window({ x, y }) {
  return (
    <Group x={x} y={y}>
      <Rect width={58} height={39} fill="#3d302a" cornerRadius={6} />
      <Rect x={5} y={5} width={48} height={29} fill="#e7af71" cornerRadius={3} />
      <Line points={[29, 5, 29, 34]} stroke="#704d39" strokeWidth={3} />
      <Line points={[-3, 39, 61, 39]} stroke="#bd8b59" strokeWidth={4} lineCap="round" />
    </Group>
  );
}

const House = memo(function House() {
  const [logo, setLogo] = useState(null);
  const { x, y, width, height } = villageMap.obstacles[0];

  useEffect(() => {
    const image = new window.Image();
    image.onload = () => setLogo(image);
    image.src = logoUrl;
    return () => { image.onload = null; };
  }, []);

  return (
    <Group x={x} y={y} listening={false}>
      <Rect x={7} y={12} width={width + 11} height={height + 1} fill="#222d29" opacity={0.55} cornerRadius={7} />
      <Rect width={width} height={height} fill="#85604a" cornerRadius={5} />
      <Rect x={6} y={89} width={width - 12} height={62} fill="#a57b5d" cornerRadius={3} />
      <Line points={[0, 0, width, 0, width - 14, 92, 14, 92]} closed fill="#554344" stroke="#302b2e" strokeWidth={4} lineJoin="round" />
      <Line points={[26, 3, width - 26, 3, width - 46, 72, 46, 72]} closed fill="#675053" stroke="#806064" strokeWidth={2} />
      <Line points={[14, 92, width - 14, 92]} stroke="#352b30" strokeWidth={7} lineCap="round" />
      <Rect x={94} y={20} width={109} height={37} cornerRadius={4} fill="#f6eacd" stroke="#322b2c" strokeWidth={3} />
      {logo && <Image x={97} y={25} image={logo} width={103} height={27} crop={{ x: 10, y: 71, width: 160, height: 42 }} />}
      <Window x={31} y={103} />
      <Window x={223} y={103} />
    </Group>
  );
});

function Door({ ready }) {
  const { anchor } = villageMap.doors.pivot;
  return (
    <Group x={anchor.x} y={anchor.y}>
      <Ellipse y={5} radiusX={33} radiusY={16} fill={ready ? '#ffe0a3' : '#edb472'} opacity={ready ? 0.42 : 0.18} listening={false} />
      <Rect x={-23} y={-56} width={46} height={56} fill={ready ? '#efc086' : '#48342e'} cornerRadius={[9, 9, 1, 1]} />
      <Rect x={-18} y={-51} width={36} height={49} fill="#3c4f45" stroke="#262d29" strokeWidth={2} cornerRadius={[5, 5, 1, 1]} />
      <Rect x={-11} y={-44} width={22} height={16} fill={ready ? '#ffe7ae' : '#c49465'} cornerRadius={3} />
      <Circle x={10} y={-15} radius={2.5} fill="#e8bd83" />
      <Rect x={-26} y={-1} width={52} height={6} cornerRadius={2} fill="#a9987f" />
    </Group>
  );
}

function Walker({ player, walking, reduced }) {
  const stride = walking && !reduced ? Math.sin((player.distance ?? 0) / 4) * 3 : 0;
  const side = player.facing === 'left' ? -1 : player.facing === 'right' ? 1 : 0;
  const showsFace = player.facing !== 'up';
  return (
    <Group x={player.x} y={player.y} listening={false}>
      <Ellipse y={2} radiusX={12} radiusY={6} fill="#202b26" opacity={0.72} />
      <Rect x={-6} y={-8 + stride} width={5} height={9} cornerRadius={2} fill="#2d2629" />
      <Rect x={1} y={-8 - stride} width={5} height={9} cornerRadius={2} fill="#2d2629" />
      <Rect x={-9} y={-20} width={18} height={15} cornerRadius={5} fill="#7d3841" stroke="#43252c" strokeWidth={2} />
      <Rect x={-8} y={-20} width={16} height={4} cornerRadius={2} fill="#e4a65e" />
      <Circle x={side * 2} y={-25} radius={7} fill={showsFace ? '#edbb87' : '#65413a'} />
      {showsFace && <Circle x={side * 6} y={-25} radius={1.3} fill="#3c2d2c" />}
      <Rect x={-10 + side * 3} y={-30} width={20} height={4} cornerRadius={2} fill="#f5d197" stroke="#704c3a" strokeWidth={1} />
      <Rect x={-6 + side * 2} y={-35} width={12} height={7} cornerRadius={3} fill="#f5d197" stroke="#704c3a" strokeWidth={1} />
    </Group>
  );
}

export default function Scene({ viewport, ready, player, walking, reduced, target }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(viewport.current);
    return () => observer.disconnect();
  }, [viewport]);

  const scale = width / villageMap.width;
  return width > 0 && (
    <div aria-hidden="true">
      <Stage width={width} height={villageMap.height * scale} scaleX={scale} scaleY={scale} listening={false}>
        <Layer listening={false}>
          <Ground />
          <House />
        </Layer>
        <Layer listening={false}>
          <Door ready={ready} />
          {target && <Circle x={target.x} y={target.y} radius={7} stroke="#ffdf9d" strokeWidth={2} />}
          <Walker player={player} walking={walking} reduced={reduced} />
        </Layer>
      </Stage>
    </div>
  );
}
