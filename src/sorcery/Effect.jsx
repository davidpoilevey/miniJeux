import React, { useState, useEffect } from 'react';
import { Group, Circle, Star, Ring, Line, Rect } from 'react-konva';

function Effect({ effect, player }) {
  const [opacity, setOpacity] = useState(1);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const effectX = effect.followPlayer && player ? player.x + 15 : effect.x;
  const effectY = effect.followPlayer && player ? player.y + 25 : effect.y;

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / effect.duration;
      
      if (progress >= 1) {
        clearInterval(interval);
        return;
      }
      
      // Animations communes
      setOpacity(1 - progress);
      setRotation(progress * 360);
      
      // Scale selon le type
      if (effect.type === 'teleport-flash') {
        setScale(1 + progress * 2);
      } else if (effect.type === 'freeze-wave') {
        setScale(progress * 3);
      } else {
        setScale(1 + progress * 0.5);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [effect.duration, effect.type]);

  // Healing Aura (vert lumineux)
  if (effect.type === 'healing-aura') {
    return (
      <Group x={effectX} y={effectY} opacity={opacity} scaleX={scale} scaleY={scale}>
        <Circle radius={30} fill="#2ecc71" opacity={0.3} />
        <Circle radius={20} fill="#27ae60" opacity={0.5} />
        <Circle radius={10} fill="#fff" opacity={0.8} />
        
        {[0, 72, 144, 216, 288].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const distance = 25 + Math.sin(Date.now() / 200 + i) * 5;
          return (
            <Star
              key={i}
              x={Math.cos(rad) * distance}
              y={Math.sin(rad) * distance}
              numPoints={4}
              innerRadius={2}
              outerRadius={4}
              fill="#2ecc71"
            />
          );
        })}
      </Group>
    );
  }

  // Teleport Flash (flash violet/arcane)
  if (effect.type === 'teleport-flash') {
    return (
      <Group x={effectX} y={effectY} opacity={opacity} scaleX={scale} scaleY={scale}>
        <Circle radius={25} fill="#9b59b6" opacity={0.6} />
        <Circle radius={15} fill="#8e44ad" opacity={0.8} />
        <Star
          numPoints={8}
          innerRadius={10}
          outerRadius={20}
          fill="#fff"
          rotation={rotation}
        />
        
        {/* Particules qui s'éloignent */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const distance = scale * 15;
          return (
            <Circle
              key={i}
              x={Math.cos(rad) * distance}
              y={Math.sin(rad) * distance}
              radius={3}
              fill="#9b59b6"
            />
          );
        })}
      </Group>
    );
  }

  // Freeze Wave (onde de glace bleue)
  if (effect.type === 'freeze-wave') {
    return (
      <Group x={effectX} y={effectY} opacity={opacity}>
        {/* Ondes concentriques */}
        <Ring
          innerRadius={scale * 40}
          outerRadius={scale * 45}
          fill="#3498db"
          opacity={0.7}
        />
        <Ring
          innerRadius={scale * 60}
          outerRadius={scale * 63}
          fill="#5dade2"
          opacity={0.5}
        />
        <Ring
          innerRadius={scale * 80}
          outerRadius={scale * 82}
          fill="#aed6f1"
          opacity={0.3}
        />
        
        {/* Cristaux de glace */}
        {[0, 60, 120, 180, 240, 300].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const distance = scale * 50;
          return (
            <Star
              key={i}
              x={Math.cos(rad) * distance}
              y={Math.sin(rad) * distance}
              numPoints={6}
              innerRadius={4}
              outerRadius={8}
              fill="#ecf0f1"
              rotation={rotation + angle}
            />
          );
        })}
      </Group>
    );
  }

  // Ghost Aura (aura fantomatique violette/ombre)
  if (effect.type === 'ghost-aura') {
    const pulse = Math.sin(Date.now() / 200) * 0.2 + 0.8;
    
    return (
      <Group x={effectX} y={effectY} opacity={0.6}>
        {/* Aura pulsante */}
        <Circle 
          radius={35 * pulse} 
          fill="#34495e" 
          opacity={0.4}
        />
        <Circle 
          radius={25 * pulse} 
          fill="#9b59b6" 
          opacity={0.5}
        />
        
        {/* Volutes d'ombre */}
        {[0, 90, 180, 270].map((angle, i) => {
          const rad = (angle + rotation) * Math.PI / 180;
          const distance = 20 + Math.sin(Date.now() / 300 + i) * 5;
          return (
            <Group key={i} rotation={rotation}>
              <Line
                points={[
                  Math.cos(rad) * distance,
                  Math.sin(rad) * distance,
                  Math.cos(rad) * (distance + 10),
                  Math.sin(rad) * (distance + 10)
                ]}
                stroke="#34495e"
                strokeWidth={3}
                opacity={0.6}
                lineCap="round"
              />
            </Group>
          );
        })}
        
        {/* Particules fantomatiques */}
        {[30, 120, 210, 300].map((angle, i) => {
          const rad = (angle - rotation) * Math.PI / 180;
          const distance = 30;
          return (
            <Circle
              key={`particle-${i}`}
              x={Math.cos(rad) * distance}
              y={Math.sin(rad) * distance}
              radius={2}
              fill="#9b59b6"
              opacity={pulse}
            />
          );
        })}
      </Group>
    );
  }

  // Shield Aura (bouclier doré/arcane)
  if (effect.type === 'shield-aura') {
    const pulse = Math.sin(Date.now() / 150) * 0.15 + 0.85;
    
    return (
      <Group x={effectX} y={effectY} opacity={0.7}>
        {/* Bouclier hexagonal */}
        <Star
          numPoints={6}
          innerRadius={25 * pulse}
          outerRadius={35 * pulse}
          fill="#3498db"
          opacity={0.3}
          rotation={rotation / 2}
        />
        <Star
          numPoints={6}
          innerRadius={20 * pulse}
          outerRadius={30 * pulse}
          stroke="#2980b9"
          strokeWidth={3}
          opacity={0.8}
          rotation={rotation / 2}
        />
        
        {/* Runes autour */}
        {[0, 60, 120, 180, 240, 300].map((angle, i) => {
          const rad = (angle + rotation) * Math.PI / 180;
          const distance = 40;
          return (
            <Rect
              key={i}
              x={Math.cos(rad) * distance - 3}
              y={Math.sin(rad) * distance - 3}
              width={6}
              height={6}
              fill="#f39c12"
              rotation={rotation + angle}
            />
          );
        })}
        
        {/* Éclat central */}
        <Circle
          radius={8}
          fill="#fff"
          opacity={pulse}
        />
      </Group>
    );
  }

  return null;
}

export default Effect;