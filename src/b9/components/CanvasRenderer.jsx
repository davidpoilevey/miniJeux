// CanvasRenderer.jsx - VERSION COMPLÈTE AVEC TOGGLES

import React, { useRef, useEffect } from 'react';
import { calculateBacteriaColor } from '../utils/RandomBacteriaGenerator.js';
import { OPTIONAL_COMPONENTS, SPECIALIZATION_COMPONENTS } from '../engine/components/Components.js';

const CanvasRenderer = ({ engine, cellSize = 6, viewMode = 'bacteria' }) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const worldState = engine.getWorldState();

    canvas.width = worldState.width * cellSize;
    canvas.height = worldState.height * cellSize;

    const render = () => {
      const dayNightRatio = engine.world.getDayNightRatio();
      
      // Fond
      const nightColor = Math.floor(20 + 30 * dayNightRatio);
      ctx.fillStyle = `rgb(${nightColor}, ${nightColor}, ${nightColor + 10})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Rendu selon mode
      switch (viewMode) {
        case 'bacteria':
          drawEnvironment(ctx, engine.world, cellSize, dayNightRatio);
          const entities = engine.getEntitiesForRendering();
          for (const entity of entities) {
            drawBacteria(ctx, entity, cellSize);
          }
          break;

        case 'chemA':
          drawChemicalMap(ctx, engine.world, cellSize, 'A', 180);
          break;

        case 'chemB':
          drawChemicalMap(ctx, engine.world, cellSize, 'B', 120);
          break;

        case 'chemC':
          drawChemicalMap(ctx, engine.world, cellSize, 'C', 300);
          break;

        case 'chemD':
          drawChemicalMap(ctx, engine.world, cellSize, 'D', 60);
          break;

        case 'reserves':
          drawReservesMap(ctx, engine.world, cellSize, dayNightRatio);
          break;

        case 'overlay':
          drawChemicalOverlay(ctx, engine.world, cellSize);
          const entitiesOverlay = engine.getEntitiesForRendering();
          for (const entity of entitiesOverlay) {
            drawBacteria(ctx, entity, cellSize);
          }
          break;

        default:
          break;
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [engine, cellSize, viewMode]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        border: '2px solid #333',
        borderRadius: '4px',
        imageRendering: 'pixelated',
        maxWidth: '100%',
        height: 'auto'
      }}
    />
  );
};

// ============================================================================
// CARTE THERMIQUE CHIMIQUE
// ============================================================================

function drawChemicalMap(ctx, world, cellSize, molecule, hue) {
  const step = 2; // Plus détaillé que bacteria (2 au lieu de 4)
  
  for (let y = 0; y < world.height; y += step) {
    for (let x = 0; x < world.width; x += step) {
      const concentration = world.getChemicalConcentration(x, y, molecule);
      
      if (concentration < 0.01) {
        // Noir si pas de chimie
        ctx.fillStyle = '#000';
      } else {
        // Gradient de couleur selon concentration
        const intensity = Math.min(1, concentration / 5); // Normaliser 0-5 → 0-1
        const lightness = 20 + intensity * 60; // 20% → 80%
        const saturation = 50 + intensity * 50; // 50% → 100%
        
        ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      }
      
      ctx.fillRect(x * cellSize, y * cellSize, cellSize * step, cellSize * step);
    }
  }
  
  // Légende en bas à droite
  drawLegend(ctx, world, molecule, hue);
}

// ============================================================================
// CARTE RÉSERVES
// ============================================================================

function drawReservesMap(ctx, world, cellSize, dayNightRatio) {
  const step = 2;
  
  for (let y = 0; y < world.height; y += step) {
    for (let x = 0; x < world.width; x += step) {
      const reserve = world.getReserve(x, y);
      const potential = world.getPotential(x, y);
      
      // Ratio réserve/potentiel
      const ratio = potential > 0 ? reserve / potential : 0;
      
      // Gradient vert selon fertilité
      const intensity = Math.min(1, ratio);
      const lightness = 20 + intensity * 60;
      const saturation = 40 + intensity * 40;
      
      ctx.fillStyle = `hsl(120, ${saturation}%, ${lightness}%)`;
      ctx.fillRect(x * cellSize, y * cellSize, cellSize * step, cellSize * step);
    }
  }
  
  // Légende
  drawReservesLegend(ctx, world);
}

// ============================================================================
// OVERLAY (Chimie transparente + bactéries)
// ============================================================================

function drawChemicalOverlay(ctx, world, cellSize) {
  const chemicalHues = { A: 180, B: 120, C: 300, D: 60 };
  const step = 2;
  
  for (let y = 0; y < world.height; y += step) {
    for (let x = 0; x < world.width; x += step) {
      const dominant = world.getDominantChemical(x, y);
      
      if (dominant && dominant.concentration > 0.5) {
        const hue = chemicalHues[dominant.molecule];
        const intensity = Math.min(0.5, dominant.concentration / 10);
        const lightness = 30 + intensity * 40;
        
        ctx.fillStyle = `hsla(${hue}, 80%, ${lightness}%, 0.4)`;
        ctx.fillRect(x * cellSize, y * cellSize, cellSize * step, cellSize * step);
      }
    }
  }
}

// ============================================================================
// LÉGENDES
// ============================================================================

function drawLegend(ctx, world, molecule, hue) {
  const width = world.width * 6;
  const height = world.height * 6;
  
  // Fond légende
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(width - 120, height - 80, 110, 70);
  
  // Titre
  const names = { A: 'Glycoaldéhyde', B: 'Phytosynol', C: 'Xenoferrine', D: 'Chromatin-X' };
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 10px monospace';
  ctx.fillText(names[molecule], width - 115, height - 65);
  
  // Gradient barre
  for (let i = 0; i <= 100; i++) {
    const intensity = i / 100;
    const lightness = 20 + intensity * 60;
    const saturation = 50 + intensity * 50;
    ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    ctx.fillRect(width - 115 + i, height - 50, 1, 10);
  }
  
  // Labels
  ctx.fillStyle = '#aaa';
  ctx.font = '8px monospace';
  ctx.fillText('0', width - 115, height - 30);
  ctx.fillText('Max', width - 30, height - 30);
}

function drawReservesLegend(ctx, world) {
  const width = world.width * 6;
  const height = world.height * 6;
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(width - 120, height - 80, 110, 70);
  
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 10px monospace';
  ctx.fillText('Réserves', width - 115, height - 65);
  
  for (let i = 0; i <= 100; i++) {
    const intensity = i / 100;
    const lightness = 20 + intensity * 60;
    const saturation = 40 + intensity * 40;
    ctx.fillStyle = `hsl(120, ${saturation}%, ${lightness}%)`;
    ctx.fillRect(width - 115 + i, height - 50, 1, 10);
  }
  
  ctx.fillStyle = '#aaa';
  ctx.font = '8px monospace';
  ctx.fillText('Vide', width - 115, height - 30);
  ctx.fillText('Plein', width - 30, height - 30);
}

// ============================================================================
// FONCTIONS EXISTANTES (inchangées)
// ============================================================================

function drawEnvironment(ctx, world, cellSize, dayNightRatio) {
  const chemicalHues = { A: 180, B: 120, C: 300, D: 60 };
  const step = 4;
  
  for (let y = 0; y < world.height; y += step) {
    for (let x = 0; x < world.width; x += step) {
      const reserve = world.getReserve(x, y);
      const fertility = reserve / 100;
      const green = Math.floor(40 + 60 * fertility * dayNightRatio);
      const brown = Math.floor(30 + 20 * (1 - fertility));
      const dominant = world.getDominantChemical(x, y);
      
      if (dominant && dominant.concentration > 0.5) {
        const chemHue = chemicalHues[dominant.molecule];
        const chemStrength = Math.min(0.3, dominant.concentration / 10);
        const baseH = 120;
        const baseS = 30;
        const baseL = (brown + green) / 5;
        const finalH = baseH + (chemHue - baseH) * chemStrength;
        const finalS = baseS + (60 - baseS) * chemStrength;
        ctx.fillStyle = `hsl(${finalH}, ${finalS}%, ${baseL}%)`;
      } else {
        ctx.fillStyle = `rgb(${brown}, ${green}, ${brown})`;
      }
      
      ctx.fillRect(x * cellSize, y * cellSize, cellSize * step, cellSize * step);
    }
  }
}

function drawBacteria(ctx, entity, cellSize) {
  const x = entity.position.x * cellSize;
  const y = entity.position.y * cellSize;
  const energy = entity.metabolism?.energyStored || 50;
  const energyRatio = Math.min(1, Math.max(0, energy / 150));
  const components = entity.activeComponents || [];
  
  if (components.length === 0) {
    ctx.fillStyle = `hsl(0, 0%, ${40 + energyRatio * 20}%)`;
    ctx.fillRect(x, y, cellSize, cellSize);
    return;
  }
  
  const colors = components.slice(0, 4).map(name => {
    const Component = OPTIONAL_COMPONENTS[name] || SPECIALIZATION_COMPONENTS[name];
    return Component && Component.COLOR ? Component.COLOR : null;
  }).filter(c => c !== null);
  
  if (colors.length === 0) {
    ctx.fillStyle = `hsl(0, 0%, ${40 + energyRatio * 20}%)`;
    ctx.fillRect(x, y, cellSize, cellSize);
    return;
  }
  
  const lightness = 40 + energyRatio * 20;
  
  if (colors.length === 1) {
    ctx.fillStyle = `hsl(${colors[0].h}, ${colors[0].s}%, ${lightness}%)`;
    ctx.fillRect(x, y, cellSize, cellSize);
  } else if (colors.length === 2) {
    ctx.fillStyle = `hsl(${colors[0].h}, ${colors[0].s}%, ${lightness}%)`;
    ctx.fillRect(x, y, cellSize / 2, cellSize);
    ctx.fillStyle = `hsl(${colors[1].h}, ${colors[1].s}%, ${lightness}%)`;
    ctx.fillRect(x + cellSize / 2, y, cellSize / 2, cellSize);
  } else if (colors.length === 3) {
    ctx.fillStyle = `hsl(${colors[0].h}, ${colors[0].s}%, ${lightness}%)`;
    ctx.fillRect(x, y, cellSize / 2, cellSize / 2);
    ctx.fillStyle = `hsl(${colors[1].h}, ${colors[1].s}%, ${lightness}%)`;
    ctx.fillRect(x + cellSize / 2, y, cellSize / 2, cellSize / 2);
    ctx.fillStyle = `hsl(${colors[2].h}, ${colors[2].s}%, ${lightness}%)`;
    ctx.fillRect(x, y + cellSize / 2, cellSize, cellSize / 2);
  } else {
    ctx.fillStyle = `hsl(${colors[0].h}, ${colors[0].s}%, ${lightness}%)`;
    ctx.fillRect(x, y, cellSize / 2, cellSize / 2);
    ctx.fillStyle = `hsl(${colors[1].h}, ${colors[1].s}%, ${lightness}%)`;
    ctx.fillRect(x + cellSize / 2, y, cellSize / 2, cellSize / 2);
    ctx.fillStyle = `hsl(${colors[2].h}, ${colors[2].s}%, ${lightness}%)`;
    ctx.fillRect(x, y + cellSize / 2, cellSize / 2, cellSize / 2);
    ctx.fillStyle = `hsl(${colors[3].h}, ${colors[3].s}%, ${lightness}%)`;
    ctx.fillRect(x + cellSize / 2, y + cellSize / 2, cellSize / 2, cellSize / 2);
  }
  
  if (energyRatio > 0.7) {
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(x, y, cellSize, cellSize);
  }
}

export default CanvasRenderer;