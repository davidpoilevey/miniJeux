// components/Player.jsx
import { useEffect, useState } from 'react';
import { Image as KonvaImage, Text } from 'react-konva';
import { TILE_SIZE } from '../data/maps';

const SPRITE_WIDTH = TILE_SIZE;
const SPRITE_HEIGHT = TILE_SIZE;
const ANIMATION_SPEED = 150; // ms

const directionMap = {
  down: 0,
  left: 1,
  right: 2,
  up: 3
};

const CatPlayer = ({ x, y, direction = 'down', isMoving = false, image }) => {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
   // if (!isMoving) return;

    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % 3);
    }, ANIMATION_SPEED);

    return () => clearInterval(interval);
  }, []);

  const frameY = directionMap[direction] || 0;

  return (
    <KonvaImage
      image={image}
      x={x}
      y={y}
      width={SPRITE_WIDTH}
      height={SPRITE_HEIGHT}
      crop={{
        x: frameIndex * SPRITE_WIDTH,
        y: frameY * SPRITE_HEIGHT,
        width: SPRITE_WIDTH,
        height: SPRITE_HEIGHT
      }}
    />
  );
};

export const MiaulableIndicator = ({ row, col }) => {
  const x = col * TILE_SIZE + TILE_SIZE - 14;
  const y = row * TILE_SIZE -4;

  return (
    <Text
      text="🔉" // ou "🔊" / "🔈"
      x={x}
      y={y}
      fontSize={14}
      fill="gold"
      opacity={0.6}
      shadowColor="black"
      shadowBlur={2}
      shadowOpacity={0.4}
    />
  );
};
export default CatPlayer;
