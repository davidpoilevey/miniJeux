import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import pionBlanc from './images/pionB.png';
import pionNoir from './images/pionN.png';
import dameBlanche from './images/reineB.png';
import dameNoire from './images/reineN.png';
import roiBlanc from './images/roiB.png';
import roiNoir from './images/roiN.png';
import fouBlanc from './images/fouB.png';
import fouNoir from './images/fouN.png';
import cavBlanc from './images/cavalierB.png';
import cavNoir from './images/cavalierN.png';
import tourBlanche from './images/tourB.png';
import tourNoire from './images/tourN.png';
import { CASE_SIZE } from '../dames/Case';


const Piece = React.memo(function Piece({
  piece, joueurEstBlanc=true,onClick,
  x,
  y,
  moveFrom,
  selected = false,
  jouable = false,
}) {

const ref = useSlideFrom(moveFrom, { x, y }, CASE_SIZE, [piece?.id, moveFrom?.x, moveFrom?.y, x, y]);

  const pieceURL = useMemo(() => {
  let isWhite = piece?.couleur === 'white';
  if(!joueurEstBlanc)
    isWhite = !isWhite; // Inverser la couleur si le joueur est noir
    switch (piece?.type) {
      case 'pion':
        return isWhite ? pionBlanc : pionNoir;
      case 'reine':
      case 'dame':
        return isWhite ? dameBlanche : dameNoire;
      case 'roi':
        return isWhite ? roiBlanc : roiNoir;
      case 'fou':
        return isWhite ? fouBlanc : fouNoir;
      case 'cavalier':
        return isWhite ? cavBlanc : cavNoir;
      case 'tour':
        return isWhite ? tourBlanche : tourNoire;
      default:
        return null; // Si le type de pièce n'est pas reconnu
    }
    
  }, [piece]);


  if(piece==null) {
    return null; // Si pas de pion, on ne rend rien
  }
const border = selected
    ? `4px solid ${jouable ? 'limegreen' : 'red'}`
    : null;

  return (
    <Box
      ref={ref}
      onClick={onClick}
      sx={{
        width: 70,
        height: 70,
        backgroundImage: `url(${pieceURL})`,
        backgroundSize: 'cover',
        backgroundPosition: piece.type==='pion'?'center':'top',
        border,
        willChange: 'transform',
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
    </Box>
  );
});

export default Piece

export function useSlideFrom(moveFrom, to, size, deps = [], duration = 400) {
  const ref = React.useRef(null);

  React.useLayoutEffect(() => {
    if (!moveFrom || !ref.current) return;

    const dy = (moveFrom.y - to.y) * size;
    const dx = (moveFrom.x - to.x) * size;

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

