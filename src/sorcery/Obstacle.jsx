import React, { memo } from 'react';
import { Group, Rect, Image } from 'react-konva';

function Obstacle({ obstacle, image }) {
  if (obstacle.isDestroyed) return null;

  return (
    <Group x={obstacle.x} y={obstacle.y}>
      {image ? (
        <Image
          x={0}
          y={0}
          width={obstacle.width}
          height={obstacle.height}
          image={image}
          opacity={obstacle.isBurning ? 0.8 : 1}
        />
      ) : (
        <Rect
          x={0}
          y={0}
          width={obstacle.width}
          height={obstacle.height}
          fill={obstacle.isBurning ? '#e74c3c' : '#7f8c8d'}
          stroke="#2c3e50"
          strokeWidth={2}
        />
      )}
      
      {/* Barre de vie si destructible */}
      {obstacle.destructible && obstacle.health < obstacle.maxHealth && (
        <>
          <Rect
            x={0}
            y={-10}
            width={obstacle.width}
            height={4}
            fill="#333"
          />
          <Rect
            x={0}
            y={-10}
            width={obstacle.width}
            height={4}
            fill="#e74c3c"
          />
        </>
      )}
    </Group>
  );
}

export default memo(Obstacle, (prevProps, nextProps) => {
  // Re-render seulement si l'item a changé
  return (
    prevProps.obstacle.health === nextProps.obstacle.health &&
    prevProps.obstacle.isBurning === nextProps.obstacle.isBurning&&
    prevProps.obstacle.isDestroyed === nextProps.obstacle.isDestroyed
  );
});