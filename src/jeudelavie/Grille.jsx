import React, { useState, useRef } from "react";
import "./Cellule.css";
import CelluleDeLaVie, { CelluleDeLaVie20 } from "./CelluleDeLaVie";
import { Box } from "@mui/material";
import { CELL_SIZE } from "./JeuDeLaVie20";

export const GrilleDeLaVie20 = React.forwardRef(({ grille, setGrille, addMolecule},ref) => {
  const [drawMode, setDrawMode] = useState(false);

  const handleCellClick = (x, y) => {
    const newGrille = [...grille];
    newGrille[y][x] = addMolecule(newGrille[y][x]);
    setGrille(newGrille);
  };
  const onMouseDown = evt=>{
    setDrawMode(true);
  }
  const onMouseUp = evt=>{
    setDrawMode(false);
  }
  const onMouseMove=(evt)=>{
    let x = Math.round(evt.target.offsetLeft/CELL_SIZE);
    let y = Math.round(evt.target.offsetTop/CELL_SIZE);
    if(drawMode){
      const newGrille = [...grille];
      for(let px=-1;px<=1;px++){
        for(let py=-1;py<=1;py++){
        
      newGrille[y+py][x+px] =  addMolecule(newGrille[y+py][x+px]);
        }
      }
      setGrille(newGrille);
    }
  }
// 
  return (
    <Box ref={ref} className="grille" sx={{backgroundColor:'black'}}

    onMouseMove={(evt)=>{onMouseMove(evt)}}
    onMouseDown={onMouseDown}
    onMouseUp={onMouseUp}
    >
      {grille.map((ligne, y) =>
        ligne.map((cellule, x) => (
          <CelluleDeLaVie20
            key={`${x}-${y}`}
            alive={cellule}
            x={x} y={y}
            onClick={() => handleCellClick(x, y)}
           
          />
        ))
      )}
    </Box>
  );
});








// For Conway style
const GrilleDeLaVie = React.forwardRef(({ grille, setGrille }, ref) => {
  const drawModeRef = useRef(false);

  const handleCellClick = (x, y) => {
    setGrille(prev => {
      const g = prev.map(r => [...r]);
      g[y][x] = g[y][x] ? 0 : 1;
      return g;
    });
  };

  // ── Paint a 5×5 brush around (cx, cy) ──
  const paintBrush = (cx, cy) => {
    setGrille(prev => {
      const g = prev.map(r => [...r]);
      const R = 2;
      for (let py = -R; py <= R; py++)
        for (let px = -R; px <= R; px++) {
          const ny = cy + py, nx = cx + px;
          if (ny >= 0 && ny < g.length && nx >= 0 && nx < (g[0]?.length ?? 0))
            g[ny][nx] = 1;
        }
      return g;
    });
  };

  // ── Compute cell from touch/mouse event on the container ──
  const cellFromEvent = (clientX, clientY, target) => {
    const rect = target.getBoundingClientRect();
    return {
      cx: Math.floor((clientX - rect.left) / CELL_SIZE),
      cy: Math.floor((clientY - rect.top) / CELL_SIZE),
    };
  };

  // ── Mouse (desktop) : précision cellule par cellule ──
  const onMouseDown = () => { drawModeRef.current = true; };
  const onMouseUp   = () => { drawModeRef.current = false; };
  const onMouseMove = (x, y) => {
    if (!drawModeRef.current) return;
    setGrille(prev => {
      const g = prev.map(r => [...r]);
      g[y][x] = 1;
      return g;
    });
  };

  // ── Touch (mobile) ──
  const onTouchStart = (e) => {
    drawModeRef.current = true;
    const t = e.touches[0];
    const { cx, cy } = cellFromEvent(t.clientX, t.clientY, e.currentTarget);
    paintBrush(cx, cy);
  };
  const onTouchMove = (e) => {
    if (!drawModeRef.current) return;
    const t = e.touches[0];
    const { cx, cy } = cellFromEvent(t.clientX, t.clientY, e.currentTarget);
    paintBrush(cx, cy);
  };
  const onTouchEnd = () => { drawModeRef.current = false; };

  return (
    <Box ref={ref} className="grille"
      sx={{ touchAction: 'none' }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {grille.map((ligne, y) =>
        ligne.map((cellule, x) => (
          <CelluleDeLaVie
            key={`${x}-${y}`}
            alive={cellule}
            x={x} y={y}
            onClick={() => handleCellClick(x, y)}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseMove={() => onMouseMove(x, y)}
          />
        ))
      )}
    </Box>
  );
});

export default GrilleDeLaVie;
