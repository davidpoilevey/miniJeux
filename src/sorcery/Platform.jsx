// Platform.js - Représentation visuelle des plateformes

import React from 'react';
import { Rect, Line } from 'react-konva';

function Platform({ platform }) {
  return (
    <>
      {/* Corps de la plateforme */}
      <Rect
        x={platform.x}
        y={platform.y}
        width={platform.width}
        height={platform.height}
        fill="#34495e"
        cornerRadius={2}
      />
      
      {/* Surface supérieure (plus claire) */}
      <Rect
        x={platform.x}
        y={platform.y}
        width={platform.width}
        height={5}
        fill="#7f8c8d"
        cornerRadius={[2, 2, 0, 0]}
      />
      
      {/* Lignes de détail */}
      <Line
        points={[
          platform.x,
          platform.y + 5,
          platform.x + platform.width,
          platform.y + 5
        ]}
        stroke="#95a5a6"
        strokeWidth={1}
      />
      
      {/* Ombres sur les côtés */}
      <Rect
        x={platform.x}
        y={platform.y}
        width={3}
        height={platform.height}
        fill="#2c3e50"
        opacity={0.5}
      />
      <Rect
        x={platform.x + platform.width - 3}
        y={platform.y}
        width={3}
        height={platform.height}
        fill="#2c3e50"
        opacity={0.5}
      />
    </>
  );
}

export default Platform;