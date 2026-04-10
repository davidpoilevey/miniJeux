// Projectile.js - Représentation visuelle des projectiles

import React, { useState, useEffect } from 'react';
import { Group, Circle, Star, Line } from 'react-konva';

function Projectile({ projectile }) {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 10) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const getProjectileColor = () => {
    switch (projectile.element) {
      case 'fire':
        return '#e74c3c';
      case 'ice':
        return '#3498db';
      case 'lightning':
        return '#f1c40f';
      case 'shadow':
        return '#34495e';
      case 'arcane':
        return '#9b59b6';
      default:
        return '#ecf0f1';
    }
  };

  const renderFireball = () => (
    <Group x={projectile.x} y={projectile.y}>
      {/* Traînée de feu */}
      <Circle
        x={-15}
        y={0}
        radius={8}
        fill="#e67e22"
        opacity={0.6}
      />
      <Circle
        x={-10}
        y={0}
        radius={10}
        fill="#e74c3c"
        opacity={0.8}
      />
      
      {/* Corps principal */}
      <Circle
        x={0}
        y={0}
        radius={12}
        fill="#e74c3c"
        shadowColor="#c0392b"
        shadowBlur={15}
        shadowOpacity={0.8}
      />
      
      {/* Flammes intérieures */}
      <Circle
        x={0}
        y={0}
        radius={8}
        fill="#f39c12"
      />
      
      {/* Point lumineux */}
      <Circle
        x={0}
        y={0}
        radius={4}
        fill="#fff"
      />
    </Group>
  );

  const renderIceShard = () => (
    <Group x={projectile.x} y={projectile.y} rotation={rotation}>
      <Star
        x={0}
        y={0}
        numPoints={6}
        innerRadius={6}
        outerRadius={12}
        fill="#3498db"
        stroke="#2980b9"
        strokeWidth={2}
        shadowColor="#3498db"
        shadowBlur={10}
      />
      <Circle
        x={0}
        y={0}
        radius={4}
        fill="#ecf0f1"
      />
    </Group>
  );

  const renderLightningBolt = () => (
    <Group x={projectile.x} y={projectile.y}>
      <Line
        points={[-5, -10, 0, 0, -3, 5, 5, 15]}
        stroke="#f1c40f"
        strokeWidth={3}
        lineCap="round"
        lineJoin="round"
        shadowColor="#f39c12"
        shadowBlur={10}
      />
      <Line
        points={[-5, -10, 0, 0, -3, 5, 5, 15]}
        stroke="#fff"
        strokeWidth={1}
        lineCap="round"
        lineJoin="round"
      />
    </Group>
  );

  const renderShadowBlade = () => (
    <Group x={projectile.x} y={projectile.y} rotation={rotation}>
      {/* Ombre éthérée */}
      <Circle
        x={0}
        y={0}
        radius={20}
        fill="#34495e"
        opacity={0.3}
      />
      
      {/* Lame */}
      <Line
        points={[-15, 0, 15, 0]}
        stroke="#34495e"
        strokeWidth={8}
        lineCap="round"
        shadowColor="#000"
        shadowBlur={15}
      />
      
      {/* Bord tranchant */}
      <Line
        points={[-15, 0, 15, 0]}
        stroke="#7f8c8d"
        strokeWidth={2}
        lineCap="round"
      />
      
      {/* Lueur violette */}
      <Line
        points={[-15, 0, 15, 0]}
        stroke="#9b59b6"
        strokeWidth={1}
        lineCap="round"
        opacity={0.5}
      />
    </Group>
  );

  const renderDefault = () => (
    <Group x={projectile.x} y={projectile.y}>
      <Circle
        x={0}
        y={0}
        radius={10}
        fill={getProjectileColor()}
        shadowColor={getProjectileColor()}
        shadowBlur={15}
        shadowOpacity={0.8}
      />
      <Circle
        x={0}
        y={0}
        radius={5}
        fill="#fff"
        opacity={0.6}
      />
    </Group>
  );

  // Rendu selon le type de projectile
  const renderProjectile = () => {
    switch (projectile.spellId) {
      case 'fireball':
        return renderFireball();
      case 'ice-shard':
        return renderIceShard();
      case 'lightning-strike':
        return renderLightningBolt();
      case 'shadow-blade':
        return renderShadowBlade();
      default:
        return renderDefault();
    }
  };

  return renderProjectile();
}

export default Projectile;