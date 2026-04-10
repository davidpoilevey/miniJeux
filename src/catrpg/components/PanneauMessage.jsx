// components/PanneauMessage.jsx
import { Group, Image as KonvaImage, Rect, Text } from 'react-konva';
import { useEffect, useRef, useState } from 'react';

import { MAP_HEIGHT, MAP_WIDTH } from '../data/maps';

const PAN_WIDTH = 300;
const PAN_HEIGHT = 180;

const PanneauMessage = ({ image, message, onDone }) => {
    
  const [visibleText, setVisibleText] = useState('');
  const timerRef = useRef(null);
  const indexRef = useRef(0);

useEffect(() => {
  if (!message) return;

  setVisibleText('');
  indexRef.current = 0;

  const typingSpeed = 30; // ms par caractère pour l'animation
  const minDisplay = 1500; // durée minimale d'affichage en ms
  const maxDisplay = 4000; // durée maximale en ms

  // Calcule la durée en fonction du nombre de caractères
  const dynamicDuration = Math.min(
    maxDisplay,
    Math.max(minDisplay, message.length * 50) // ← 50ms par caractère affiché
  );

  const interval = setInterval(() => {
    indexRef.current++;
    setVisibleText(message.slice(0, indexRef.current));
    if (indexRef.current >= message.length) {
      clearInterval(interval);
    }
  }, typingSpeed);

  timerRef.current = setTimeout(() => {
    onDone?.();
  }, dynamicDuration);

  return () => {
    clearInterval(interval);
    clearTimeout(timerRef.current);
  };
}, [message]);

const groupRef = useRef();
useEffect(() => {
  if (image?.complete && groupRef.current) {
    groupRef.current.getLayer().batchDraw();
  }
}, [message]);
  if (!message || !image) return null;

  const img = image;
  const x = (MAP_WIDTH - PAN_WIDTH) / 2;

  return  <Group  x={x} y={240} ref={groupRef}>
    
      <KonvaImage image={img} width={PAN_WIDTH} height={PAN_HEIGHT} />
      <Text
      x={32} y={40}
        text={visibleText}
        width={PAN_WIDTH - 64}
        height={PAN_HEIGHT - 60}
        fontSize={16}
        fill="white"
        fontFamily="serif"
        fontStyle="bold"
        align="center"
        verticalAlign="middle"
        lineHeight={1.3}
        shadowColor="black"
        shadowBlur={4}
        shadowOffset={{ x: 1, y: 1 }}
        shadowOpacity={0.5}
      />
    </Group>
      
};

export default PanneauMessage;
