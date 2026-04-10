import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';

import imgTerre from '../../bactery/images/fondTerre.jpg';
import imgPierre from '../images/stone.jpg';
import imgCarton from '../images/carton.jpg';


const TILE_SIZE = 32;
const CANVAS_WIDTH = 1600;
const CANVAS_HEIGHT = 800;

const tools = [
  { label: '🧱 Mur', type: 'mur', width: 64, height: 64 , offsetX:0},
  { label: '🧱 Mur Grimpable', type: 'murGrimpable', width: 64, height: 64  , offsetX:0},
  { label: '🧱 Mur Poussable', type: 'murPoussable', width: 64, height: 64  , offsetX:0},
  { label: '🪙 Coffre', type: 'coffre', width: 64, height: 64  , offsetX:75},
  { label: '👁️ Oeil', type: 'oeil', width: 64, height: 64  , offsetX:35},
  { label: '🧟 Zombie', type: 'squelette', width: 64, height: 64  , offsetX:35},
  { label: '🧟 Zombie 2', type: 'zombie', width: 64, height: 64  , offsetX:35},
  { label: '🧟‍♀️ Zombie 3', type: 'zombie2', width: 64, height: 64  , offsetX:35},
  { label: '🔥 Piège feu', type: 'fire', width: 64, height: 64  , offsetX:120},
  { label: '🚪 Porte', type: 'porte', width: 64, height: 64  , offsetX:-20},
  { label: '🏁 Fin niveau', type: 'finNiveau', width: 64, height: 64  , offsetX:90}
];

const isResizableType = (type) =>
  ['mur', 'murPoussable', 'murGrimpable'].includes(type);

export default function EditeurNiveau() {
  const canvasRef = useRef(null);
  const [selectedTool, setSelectedTool] = useState(tools[0]);
  const [entities, setEntities] = useState([]);
  const [niveauDuSol, setNiveauDuSol] = useState(CANVAS_HEIGHT - 64);
const [dragStart, setDragStart] = useState(null);
const [isDragging, setIsDragging] = useState(false);
const [mousePos, setMousePos] = useState(null);
// const bg = useMemo(()=>{
//     let bg = '#847853'
//     if(subtype==='murGrimpable')
//       bg=`url(${imgTerre})`;
//     if(subtype==='mur')
//       bg=`url(${imgPierre})`;
//     if(subtype==='murPoussable')
//       bg=`url(${imgCarton})`;
//     return bg;
//   },[subtype])

 useEffect(() => {
  draw();
}, [entities, selectedTool, dragStart, mousePos, isDragging]);

const textures = useRef({});

useEffect(() => {
  const sources = {
    mur: imgPierre,
    murGrimpable: imgTerre,
    murPoussable: imgCarton
  };

  Object.entries(sources).forEach(([type, src]) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      textures.current[type] = img;
      draw(); // redraw une fois chargée
    };
  });
}, []);


  // autosave
  useEffect(() => {
    if(entities.length>0)
  localStorage.setItem('editeur_niveau_autosave', JSON.stringify(entities));
}, [entities]);
// autoload
useEffect(() => {
  const saved = localStorage.getItem('editeur_niveau_autosave');
  if (saved) {
    try {
      setEntities(JSON.parse(saved));
    } catch (e) {
      console.warn("Impossible de charger la sauvegarde du niveau");
    }
  }
}, []);



  const snap = (value) => Math.floor(value / TILE_SIZE) * TILE_SIZE;

const handleMouseDown = (e) => {
  if (e.button !== 0) return; // ignore clic droit
  const rect = canvasRef.current.getBoundingClientRect();
  const x = snap(e.clientX - rect.left);
  const y = snap(e.clientY - rect.top);

  if (isResizableType(selectedTool.type)) {
    setDragStart({ x, y });
    setMousePos({ x, y });
    setIsDragging(true);
  } else {
    // Poser directement l'objet avec ses dimensions par défaut
    const newEntity = {
      ...selectedTool,
      x,
      y,
      width: selectedTool.width,
      height: selectedTool.height
    };
    setEntities([...entities, newEntity]);
  }
};


const handleMouseUp = (e) => {
  if (e.button !== 0) return;

  if (!isDragging || !dragStart || !mousePos) return;

  const x = Math.min(dragStart.x, mousePos.x);
  const y = Math.min(dragStart.y, mousePos.y);
  const w = Math.abs(dragStart.x - mousePos.x) || TILE_SIZE;
  const h = Math.abs(dragStart.y - mousePos.y) || TILE_SIZE;

  const newEntity = {
    ...selectedTool,
    x,
    y,
    width: w,
    height: h
  };

  setEntities([...entities, newEntity]);
  setDragStart(null);
  setMousePos(null);
  setIsDragging(false);
};





  const draw = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Grille
    ctx.strokeStyle = '#ddd';
    for (let x = 0; x < CANVAS_WIDTH; x += TILE_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y < CANVAS_HEIGHT; y += TILE_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    // Niveau du sol
    ctx.strokeStyle = 'green';
    ctx.beginPath();
    ctx.moveTo(0, niveauDuSol);
    ctx.lineTo(CANVAS_WIDTH, niveauDuSol);
    ctx.stroke();

    // Entités
  for (const ent of entities) {
  const w = ent.width || TILE_SIZE;
  const h = ent.height || TILE_SIZE;

  const isWall = ['mur', 'murGrimpable', 'murPoussable'].includes(ent.type);
  const img = textures.current[ent.type];

  if (isWall && img) {
    const pattern = ctx.createPattern(img, 'repeat');
    ctx.fillStyle = pattern;
    ctx.fillRect(ent.x, ent.y, w, h);
  } else {
    // fallback: carré noir + nom
    ctx.fillStyle = 'black';
    ctx.fillRect(ent.x, ent.y, w, h);
    ctx.fillStyle = 'white';
    ctx.font = '10px monospace';
    ctx.fillText(ent.type, ent.x + 4, ent.y + 12);
  }
}

// Rectangle en drag (prévisualisation)
if (isDragging && dragStart && mousePos) {
  const x = Math.min(dragStart.x, mousePos.x);
  const y = Math.min(dragStart.y, mousePos.y);
  const w = Math.abs(dragStart.x - mousePos.x);
  const h = Math.abs(dragStart.y - mousePos.y);

  ctx.strokeStyle = 'rgba(0,0,255,0.5)';
  ctx.setLineDash([4, 2]);
  ctx.strokeRect(x, y, w, h);
  ctx.setLineDash([]);
}


  };
const exportToClipboard = () => {
  const withSize = ['mur', 'murPoussable', 'murGrimpable'];

  const lines = entities.map(ent => {
    const toolDef = tools.find(t => t.type === ent.type);
    const offsetX = toolDef?.offsetX || 0;

    const dx = ent.x - offsetX;
    const dy = niveauDuSol - ent.y-ent.height;

    const xExpr = `${dx}`;
    const yExpr = dy === 0 ? 'niveauDuSol' : `niveauDuSol - ${dy}`;

    if (withSize.includes(ent.type)) {
      return `arr.push(${ent.type}(${xExpr}, ${yExpr}, ${ent.width}, ${ent.height}));`;
    } else {
      return `arr.push(${ent.type}(${xExpr}, ${yExpr}));`;
    }
  });

  const code = `const niveauX = (niveauDuSol) => {\n  const arr = [];\n  ${lines.join('\n  ')}\n  return arr;\n};`;
  navigator.clipboard.writeText(code);
  alert("Code de niveau copié dans le presse-papier !");
};




  const clearLevel = () => {
    if (window.confirm("Tout effacer ?")) {
      setEntities([]);
    }
  };

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>🧱 Editeur de niveau</Typography>
      <Stack direction="row" spacing={1} mb={2} flexWrap="wrap">
        {tools.map(tool => (
          <Button
            key={tool.type}
            variant={selectedTool.type === tool.type ? 'contained' : 'outlined'}
            onClick={() => setSelectedTool(tool)}
          >
            {tool.label}
          </Button>
        ))}
      </Stack>

      <Stack direction="row" spacing={2} mb={2}>
        <Button variant="contained" color="success" onClick={exportToClipboard}>📤 Exporter en code</Button>
        <Button variant="outlined" color="error" onClick={clearLevel}>🗑️ Effacer tout</Button>
      </Stack>

     <canvas
  ref={canvasRef}
  width={CANVAS_WIDTH}
  height={CANVAS_HEIGHT}
  style={{
    border: '2px solid #333',
    background: '#f5f5f5',
    cursor: isDragging ? 'crosshair' : 'default'
  }}
 onContextMenu={(e) => {
  e.preventDefault();
  setIsDragging(false); // ⛔ stop toute action
  setDragStart(null);
  setMousePos(null);

  const rect = canvasRef.current.getBoundingClientRect();
  const x = snap(e.clientX - rect.left);
  const y = snap(e.clientY - rect.top);

  const updated = entities.filter(ent => {
    const w = ent.width || TILE_SIZE;
    const h = ent.height || TILE_SIZE;
    return !(x >= ent.x && x < ent.x + w && y >= ent.y && y < ent.y + h);
  });

  setEntities(updated);
}}

 onMouseDown={handleMouseDown}
onMouseUp={handleMouseUp}
onMouseMove={(e) => {
  if (!isDragging || !dragStart) return;
  const rect = canvasRef.current.getBoundingClientRect();
  const x = snap(e.clientX - rect.left);
  const y = snap(e.clientY - rect.top);
  setMousePos({ x, y });
}}

/>

    </Box>
  );
}

export const NiveauBuilderDialog = ({ open=false, handleClose }) =>{
  const doClose =(evt,reason)=>{
    if(reason!='backdropClick')
     handleClose(evt);
  } 
  
  
  return (
    <Dialog open={open} onClose={doClose} fullScreen>
      <DialogTitle>Editeur de niveau</DialogTitle>
      <DialogContent>
       <EditeurNiveau/>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Fermer</Button>
        <Button onClick={()=>{}}>Sauver</Button>
      </DialogActions>
    </Dialog>
  );
}