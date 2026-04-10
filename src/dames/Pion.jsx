import React from 'react';
import { Circle } from '@mui/icons-material';
import { Box } from '@mui/material';
import { CASE_SIZE } from './Case';
import pionBlanc from './pionBlanc.jpg';
import pionNoir from './pionNoir.png';

export const Pion = React.memo(function Pion({
  pion,
  x,
  y,
  moveFrom,
  selected = false,
  jouable = false,
  size = CASE_SIZE,
}) {

  const duration = 400; // ms
  const pionSize = Math.min(50, size - 14);

const ref = useSlideFrom(moveFrom, { x, y }, size, [pion?.id, moveFrom?.x, moveFrom?.y, x, y]);

  if(pion==null) {
    return null; // Si pas de pion, on ne rend rien
  }
  const isWhite = pion.couleur === 'white';
  const textureURL = isWhite ? pionBlanc : pionNoir;
const border = selected
    ? `4px solid ${jouable ? 'limegreen' : 'red'}`
    : `1px solid ${isWhite ? '#555' : '#777'}`;

  return (
    <Box
      ref={ref}
      sx={{
        width: pionSize,
        height: pionSize,
        borderRadius: '50%',
        backgroundImage: `url(${textureURL})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        border,
        boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.5)',
        willChange: 'transform',
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      {pion.type === 'dame' && (
        <Box
          sx={{
            position: 'absolute',
            top: '25%',
            left: '25%',
            width: '50%',
            height: '50%',
            borderRadius: '50%',
            border: `2px solid ${isWhite ? '#aaa' : '#ccc'}`,
            boxShadow: '0 0 3px rgba(0,0,0,0.6)',
          }}
        />
      )}
    </Box>
  );
});



export function useSlideFrom(moveFrom, to, size, deps = [], duration = 400) {
  const ref = React.useRef(null);

  React.useLayoutEffect(() => {
    if (!moveFrom || !ref.current) return;

    const dx = (moveFrom.y - to.y) * size;
    const dy = (moveFrom.x - to.x) * size;

    const el = ref.current;
    el.style.transition = 'none';
    el.style.transform = `translate(${dx}px, ${dy}px)`;

    // Force le reflow pour que le style soit bien pris en compte
    // (c'est l'équivalent de `el.offsetHeight`)
    void el.offsetWidth;

    // Puis déclenche l'animation vers translate(0, 0)
    requestAnimationFrame(() => {
      el.style.transition = `transform ${duration}ms ease`;
      el.style.transform = `translate(0, 0)`;
    });
  }, deps);

  return ref;
}

