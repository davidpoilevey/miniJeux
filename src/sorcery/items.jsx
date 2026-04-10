// Item.js - Représentation visuelle des items

import React, { useState, useEffect, memo } from 'react';
import { Group, Circle, Star, Text, Image } from 'react-konva';

function Item({ item , images}) {
  const [float, setFloat] = useState(0);

  // Animation de flottement
  useEffect(() => {
    const interval = setInterval(() => {
      setFloat((prev) => (prev + 0.1) % (Math.PI * 2));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const getItemColor = () => {
    switch (item.type) {
      case 'consumable':
        return item.sprite?.includes('red') ? '#e74c3c' : '#3498db';
      case 'key':
        return '#f39c12';
      case 'spell-scroll':
        return '#9b59b6';
      case 'material':
        return '#95a5a6';
      case 'weapon':
        return '#e67e22';
      case 'armor':
        return '#c5ad98';
    case 'container':
      return '#8B4513';
    case 'dangerous':
      return '#e74c3c';
      case 'regenerative':
  return item.resourceType === 'health' ? '#2ecc71' : '#3498db';
      default:
        return '#eff1ec';
    }
  };

  const getItemSymbol = () => {
    switch (item.type) {
      case 'consumable':
        return '🧪';
      case 'key':
        return '🔑';
      case 'spell-scroll':
        return '📜';
      case 'material':
        return '💎';
      case 'weapon':
        return '⚔️';
      case 'armor':
        return '🛡️';
    case 'container':
      return '📦';
    case 'dangerous':
      return '⚠️';
      case 'regenerative':
  return item.resourceType === 'health' ? '🍲' : '⛲';
      default:
        return '❔';
    }
  };
  
  const isFloating=['spell-scroll', 'consumable', 'key', 'material', 'weapon'].includes(item.type);

  const floatOffset = isFloating?Math.sin(float) * 5:0;

  return (
    <Group x={item.x} y={item.y + floatOffset}>
      {/* Aura lumineuse */}
      {isFloating&&<><Circle
        x={0}
        y={0}
        radius={item.width||25}
        fill={getItemColor()}
        opacity={0.3 + Math.sin(float) * 0.1}
      />

      {/* Étoile brillante pour les items rares */}
      {(item.type === 'spell-scroll' || item.type === 'key') && (
        <Star
          x={0}
          y={0}
          numPoints={5}
          innerRadius={15}
          outerRadius={25}
          fill={getItemColor()}
          opacity={0.5}
          rotation={float * 50}
        />
      )}

      {/* Corps de l'item */}
      <Circle
        x={0}
        y={0}
        radius={15}
        fill={getItemColor()}
        stroke="#fff"
        strokeWidth={2}
        shadowColor="black"
        shadowBlur={10}
        shadowOpacity={0.5}
      />
      </>}

      {/* Symbole */}
     {/* Symbole ou Image */}
      {item.sprite && images?.[item.sprite] ? (
        <Image
          x={-(item.width || 30) / 2}
          y={-(item.height || 30) / 2}
          width={item.width || 30}
          height={item.height || 30}
          image={images[item.sprite]}
        />
      ) : (
        <Text
          x={-10}
          y={-10}
          text={getItemSymbol()}
          fontSize={20}
          align="center"
          width={20}
        />
      )}

      {/* Nom de l'item (au survol) */}
      <Text
        x={-40}
        y={25}
        text={item.name}
        fontSize={10}
        fill="white"
        align="center"
        width={80}
        shadowColor="black"
        shadowBlur={3}
      />
    </Group>
  );
}

export default memo(Item, (prevProps, nextProps) => {
  // Re-render seulement si l'item a changé
  return (
    prevProps.item.x === nextProps.item.x &&
    prevProps.item.y === nextProps.item.y
  );
});