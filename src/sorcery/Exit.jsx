// Exit.js - Représentation visuelle des sorties/portes

import React from 'react';
import { Group, Rect, Text } from 'react-konva';


function Exit({ exit, isLocked }) {
  const isLevelExit = exit.type === 'exitLevel';
  const getExitColor = () => {
    if (isLocked) return '#95a5a6'; // Gris si verrouillée
    if (isLevelExit) return '#f39c12'; 
    switch (exit.direction) {
      case 'right':
        return '#3498db';
      case 'left':
        return '#2ecc71';
      case 'top':
        return '#9b59b6';
      case 'bottom':
        return '#e67e22';
      default:
        return '#95a5a6';
    }
  };

  const getExitLabel = () => {
    if (isLocked) return '🔒';
    if (isLevelExit) return '⭐';
    // Calculer la direction basée sur la position
    if (exit.x <= 10) return '←';
    if (exit.x >= 750) return '→';
    if (exit.y <= 10) return '↑';
    if (exit.y >= 350) return '↓';
    return '•';
  };

  return (
    <Group x={exit.x} y={exit.y}>
      <Rect
        x={0}
        y={0}
        width={exit.width}
        height={exit.height}
        fill={getExitColor()}
        opacity={isLocked ? 0.5 : 0.3}
        cornerRadius={5}
      />
      
      <Rect
        x={0}
        y={0}
        width={exit.width}
        height={exit.height}
        stroke={getExitColor()}
        strokeWidth={3}
        cornerRadius={5}
        shadowColor={getExitColor()}
        shadowBlur={isLocked ? 5 : 10}
      />

      <Text
        x={exit.width / 2 - 10}
        y={exit.height / 2 - 10}
        text={getExitLabel()}
        fontSize={20}
        fill="white"
        fontStyle="bold"
      />
    </Group>
  );
}
export default Exit;