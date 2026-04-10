import React, { useCallback } from 'react';
import { Box } from '@mui/material';
import { Pion } from './Pion';
import imgNoire from './caseNoire.png';
import imgBlanche from './caseBlanche.jpg';
export const CASE_SIZE = 70;

export const Case = ({ pion, x, y, caseJouable, highlighted,lastMove, styleMode, size = CASE_SIZE, children,  ...props }) => {
  const _CASE_SIZE = size;
  const isJouable = useCallback((x, y) => {
    if (caseJouable == null)
      return false;
    let isok = false;
    caseJouable.forEach(c => {
      if (c.x === x && c.y === y)
        isok = true;
    });
    return isok;
  }, [caseJouable]);
  const czjouable = isJouable(x, y);
  const oldMove = lastMove && ((lastMove.from.x === x && lastMove.from.y === y)||(lastMove.to.x === x && lastMove.to.y === y));
  return <Box

    className={` ${highlighted ? 'highlighted' : ''}`}
    {...props}
    sx={{
      width: _CASE_SIZE,
      height: _CASE_SIZE,
      position:'relative',
       border: '6px solid transparent',
    boxSizing: 'border-box',
      display: 'flex',
      background: styleMode === 'simple'
        ? `${x % 2 !== y % 2 ? 'rgba(212, 198, 149, 1)' : 'rgba(250, 240, 191, 1)'}`
        : `url(${x % 2 == y % 2 ? imgNoire : imgBlanche})`,
      cursor: czjouable ? 'pointer' : 'default',
      filter: !czjouable && oldMove ? 'hue-rotate(270deg)' : undefined,
      transform: styleMode!='simple'&&czjouable ? 'scale(1.1)' : 'none',
      zIndex: 10,
      transition: 'all 0.2s ease',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '24px',
    }}
  >
   {children}
  {/* Point sombre au centre si case jouable en mode simple */}
    {styleMode === 'simple' && czjouable && (
      <Box
        sx={{
          position: 'absolute',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          zIndex: 5,
        }}
      />
    )}
  </Box>;
};
