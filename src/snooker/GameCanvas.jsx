import React, { useRef, useEffect, useState } from 'react';
import { Paper, Box } from '@mui/material';
import imgFond from './fond.jpg';
import imgBois from '../ff1/images/fondBois.jpg';

const BALL_COLORS = {
  white: '#FFFFFF',
  red: '#DC143C',
  yellow: '#FFD700',
  green: '#228B22',
  brown: '#8B4513',
  blue: '#0000CD',
  pink: '#FF69B4',
  black: '#000000'
};

export default function GameCanvas({
  canvasSize,
  balls,
  pockets,
  powerUp,
  gameState,
  tableMargin,
  ballRadius,
  pocketRadius,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave
}) {
  const canvasRef = useRef(null);
  const feltTextureRef = useRef(null);
  const woodTextureRef = useRef(null);
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, text: '' });

  // Charger les textures
  useEffect(() => {
    const feltImg = new Image();
    feltImg.src = imgFond;
    
      feltTextureRef.current = feltImg;
    

    const woodImg = new Image();
    woodImg.src = imgBois;
    
      woodTextureRef.current = woodImg;
    
  }, []);

  // Rendu du canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

    // Fond de canvas (sombre)
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    // Bordures en bois
    if (woodTextureRef.current) {
      const pattern = ctx.createPattern(woodTextureRef.current, 'repeat');
      ctx.fillStyle = pattern;
    } else {
      ctx.fillStyle = '#8B4513';
    }
    ctx.fillRect(tableMargin - 20, tableMargin - 20, canvasSize.tableWidth + 40, canvasSize.tableHeight + 40);

    // Fond de table (texture feutre ou vert)
    if (feltTextureRef.current) {
      const pattern = ctx.createPattern(feltTextureRef.current, 'repeat');
      ctx.fillStyle = pattern;
    } else {
      ctx.fillStyle = '#0B6623';
    }
    ctx.fillRect(tableMargin, tableMargin, canvasSize.tableWidth, canvasSize.tableHeight);

    // Poches
    pockets.forEach(pocket => {
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(pocket.x, pocket.y, pocketRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Ombre autour de la poche
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.lineWidth = 3;
      ctx.stroke();
    });

    // Power-up sur la table
    if (powerUp.active && powerUp.x && powerUp.y) {
      const powerUpType = powerUp.active;
      
      // Cercle de fond
      ctx.fillStyle = powerUpType.color;
      ctx.beginPath();
      ctx.arc(powerUp.x, powerUp.y, ballRadius * 1.5, 0, Math.PI * 2);
      ctx.fill();
      
      // Contour
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Emoji
      ctx.font = `${ballRadius * 2}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(powerUpType.emoji, powerUp.x, powerUp.y);

      // Animation zoom si collecté
      if (powerUp.collecting) {
        const scale = 1 + (1 - powerUp.collectAnimation) * 0.5;
        ctx.save();
        ctx.translate(powerUp.x, powerUp.y);
        ctx.scale(scale, scale);
        ctx.globalAlpha = powerUp.collectAnimation;
        
        ctx.fillStyle = powerUpType.color;
        ctx.beginPath();
        ctx.arc(0, 0, ballRadius * 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.font = `${ballRadius * 2}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(powerUpType.emoji, 0, 0);
        
        ctx.restore();
      }
    }

    // Ligne de visée et queue
    if (gameState.isAiming) {
      const whiteBall = balls.find(b => b.color === 'white');
      if (whiteBall) {
        const { aimAngle, aimPower } = gameState;
        
        // Ligne de visée (direction où la bille va partir)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        
        const aimLength = 300 * aimPower;
        const shotAngle = aimAngle + Math.PI;
        const aimX = whiteBall.x + Math.cos(shotAngle) * aimLength;
        const aimY = whiteBall.y + Math.sin(shotAngle) * aimLength;
        
        ctx.beginPath();
        ctx.moveTo(whiteBall.x, whiteBall.y);
        ctx.lineTo(aimX, aimY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Vision (trajectoire prédite avec rebonds)
        if (gameState.visionActive) {
          ctx.strokeStyle = 'rgba(0, 255, 255, 0.4)';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          
          // Simulation simple de 2 rebonds (simplifié)
          let x = whiteBall.x;
          let y = whiteBall.y;
          let vx = -Math.cos(aimAngle) * aimPower * 10;
          let vy = -Math.sin(aimAngle) * aimPower * 10;
          
          ctx.beginPath();
          ctx.moveTo(x, y);
          
          for (let i = 0; i < 100; i++) {
            x += vx * 0.5;
            y += vy * 0.5;
            
            // Rebonds
            if (x - ballRadius < tableMargin || x + ballRadius > tableMargin + canvasSize.tableWidth) {
              vx = -vx;
            }
            if (y - ballRadius < tableMargin || y + ballRadius > tableMargin + canvasSize.tableHeight) {
              vy = -vy;
            }
            
            ctx.lineTo(x, y);
          }
          
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Queue de billard (côté où on tire)
        const cueLength = 150 + aimPower * 50;
        const cueStartX = whiteBall.x + Math.cos(aimAngle) * (ballRadius + 10 + aimPower * 30);
        const cueStartY = whiteBall.y + Math.sin(aimAngle) * (ballRadius + 10 + aimPower * 30);
        const cueEndX = cueStartX + Math.cos(aimAngle) * cueLength;
        const cueEndY = cueStartY + Math.sin(aimAngle) * cueLength;
        
        // Dégradé pour la queue
        const gradient = ctx.createLinearGradient(cueStartX, cueStartY, cueEndX, cueEndY);
        gradient.addColorStop(0, '#CD853F');
        gradient.addColorStop(1, '#8B4513');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cueStartX, cueStartY);
        ctx.lineTo(cueEndX, cueEndY);
        ctx.stroke();
      }
    }

    // Billes
    balls.forEach(ball => {
      if (ball.pocketed && ball.pocketAnimation <= 0) return;

      const radius = ball.pocketAnimation 
        ? ballRadius * ball.pocketAnimation 
        : ballRadius;

      if (ball.pocketAnimation > 0) {
        ball.pocketAnimation -= 0.05;
      }

      // Ombre de la bille
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.arc(ball.x + 2, ball.y + 2, radius, 0, Math.PI * 2);
      ctx.fill();

      // Bille
      ctx.fillStyle = BALL_COLORS[ball.color];
      
      if (ball.color === 'white') {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
      } else {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
      }
      
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Reflet sur la bille
      const gradient = ctx.createRadialGradient(
        ball.x - radius * 0.3, 
        ball.y - radius * 0.3, 
        0, 
        ball.x - radius * 0.3, 
        ball.y - radius * 0.3, 
        radius
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
      gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.1)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Numéro sur les billes de couleur
      if (ball.number) {
        ctx.fillStyle = ball.color === 'yellow' ? '#000' : '#FFF';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ball.number, ball.x, ball.y);
      }
    });

    // Effet visuel pour Slow Motion
    if (gameState.activeEffect && gameState.activeEffect.type === 'SLOW_MOTION') {
      ctx.fillStyle = 'rgba(65, 105, 225, 0.1)';
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
    }

    // Effet visuel pour Super Slip
    if (gameState.activeEffect && gameState.activeEffect.type === 'SUPER_SLIP') {
      ctx.fillStyle = 'rgba(135, 206, 235, 0.1)';
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
    }

  }, [balls, pockets, powerUp, gameState, canvasSize, tableMargin, ballRadius, pocketRadius]);

  const handleCanvasMouseMove = (e) => {
    // Vérifier si on survole le power-up
    if (powerUp.active && powerUp.x && powerUp.y && !powerUp.collecting) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) * (canvasSize.width / rect.width);
      const mouseY = (e.clientY - rect.top) * (canvasSize.height / rect.height);

      const dx = mouseX - powerUp.x;
      const dy = mouseY - powerUp.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < ballRadius * 2) {
        setTooltip({
          show: true,
          x: e.clientX - rect.left,
          y: e.clientY - rect.top - 40,
          text: powerUp.active.name
        });
      } else {
        setTooltip({ show: false, x: 0, y: 0, text: '' });
      }
    } else {
      setTooltip({ show: false, x: 0, y: 0, text: '' });
    }

    // Appeler le handler original
    onMouseMove(e);
  };

  return (
    <Paper sx={{ p: 1, display: 'inline-block', maxWidth: '100%', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onMouseDown={onMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={(e) => {
          setTooltip({ show: false, x: 0, y: 0, text: '' });
          onMouseLeave(e);
        }}
        style={{ 
          display: 'block',
          cursor: gameState.isAiming ? 'crosshair' : 'pointer',
          border: '2px solid #333',
          maxWidth: '100%',
          height: 'auto'
        }}
      />
      
      {/* Tooltip */}
      {tooltip.show && (
        <Box
          sx={{
            position: 'absolute',
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translateX(-50%)',
            bgcolor: 'rgba(0, 0, 0, 0.85)',
            color: 'white',
            px: 1.5,
            py: 0.5,
            borderRadius: 1,
            fontSize: '0.875rem',
            fontWeight: 'bold',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            zIndex: 1000,
            boxShadow: 2
          }}
        >
          {tooltip.text}
        </Box>
      )}
    </Paper>
  );
}