// Enemy.js – version image-based

import React, { memo, useMemo } from 'react';
import { Group, Rect, Image as KonvaImage } from 'react-konva';

function Enemy({ enemy, images }) {
  const image = images[enemy.type];


  // dimensions standard (ajustables plus tard)
  const WIDTH = 64;
  const HEIGHT = 100;

  const isFacingLeft = enemy.direction === 'left';
  const healthRatio = enemy.health / enemy.maxHealth;
  const hasMana = enemy.mana != null && enemy.maxMana != null;
  const manaRatio = hasMana ? enemy.mana / enemy.maxMana : 0;

  // léger fade si mort
  const opacity = enemy.isDead ? 0.4 : 1;

  return (
    <Group x={enemy.x} y={enemy.y} opacity={opacity}>
      {/* Sprite */}
      {image && (
        <KonvaImage
          image={image}
          width={WIDTH}
          height={HEIGHT}
          scaleX={isFacingLeft ? -1 : 1}
          offsetX={isFacingLeft ? WIDTH : 0}
        />
      )}

      {/* Barre de vie */}
      <Rect
        x={0}
        y={-10}
        width={WIDTH}
        height={4}
        fill="#222"
        cornerRadius={2}
      />
      <Rect
        x={0}
        y={-10}
        width={WIDTH * healthRatio}
        height={4}
        fill={
          healthRatio > 0.5
            ? '#27ae60'
            : healthRatio > 0.25
            ? '#f39c12'
            : '#c0392b'
        }
        cornerRadius={2}
      />

      {/* Barre de mana (optionnelle) */}
      {hasMana && (
        <>
          <Rect
            x={0}
            y={-5}
            width={WIDTH}
            height={3}
            fill="#222"
            cornerRadius={2}
          />
          <Rect
            x={0}
            y={-5}
            width={WIDTH * manaRatio}
            height={3}
            fill="#3498db"
            cornerRadius={2}
          />
        </>
      )}
    </Group>
  );
}

export default memo(Enemy, (prevProps, nextProps) => {
  // Re-render seulement si l'ennemi a changé
  return (
    prevProps.enemy.x === nextProps.enemy.x &&
    prevProps.enemy.y === nextProps.enemy.y &&
    prevProps.enemy.health === nextProps.enemy.health &&
    prevProps.enemy.isDead === nextProps.enemy.isDead
  );
});
