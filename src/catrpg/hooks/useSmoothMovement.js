// hooks/useSmoothMovement.js
import { useState, useEffect, useRef } from 'react';
const useSmoothMovement = (startX, startY, duration = 100) => {
  const [position, setPosition] = useState({ x: startX, y: startY });
  const animationRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const moveTo = (targetX, targetY, onDone = () => {}) => {
    cancelAnimationFrame(animationRef.current);
    const start = { ...position };
    const delta = { x: targetX - start.x, y: targetY - start.y };
    const startTime = performance.now();
    setIsAnimating(true);

    const animate = (time) => {
      const elapsed = time - startTime;
      const t = Math.min(elapsed / duration, 1);
      setPosition({
        x: start.x + delta.x * t,
        y: start.y + delta.y * t
      });
      if (t < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        onDone();
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  return [position, moveTo, isAnimating];
};


export default useSmoothMovement;
