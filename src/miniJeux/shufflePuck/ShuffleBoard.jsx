
import { Stage, Layer, Circle, Rect, Line, Image } from 'react-konva';
import imgPoutine from '../images/poutine.png';
import imgBoris from '../images/boris.png';
import imgTrudeau from '../images/trudeau.png';
import imgTrump from '../images/trump.png';
import imgXijing from '../images/jiping.png';
import imgObama from '../images/obama.png';
import imgFond from '../images/fondBois.png';

import { Box, Button, Paper, Typography } from '@mui/material';
import { CANVAS_HEIGHT, CANVAS_WIDTH, GOAL_WIDTH, PADDLE_RADIUS, PUCK_RADIUS } from './Shuffle';
import { usePreloadedImages } from '../../civ/utils/hooks';
export const AiImageSources = {
  fond:imgFond,
  boris : imgBoris,
  ronald:imgTrump,
  borak:imgObama,
  chijing:imgXijing,
  justin:imgTrudeau,
  vladimir:imgPoutine
}
const ShuffleBoard = ({ scores, aiProfile, aiTaunt, ...props }) => {
  const images = usePreloadedImages(AiImageSources);
  
  return (
    <Box sx={{ 
      display: 'flex', 
      gap: 4, 
      alignItems: 'stretch', 
      width: '100%', 
      maxWidth: '1400px',
      padding: 2
    }}>
      {/* Plateau de jeu - côté gauche */}
    
        <MainBoard images={images} {...props}/>
    

      {/* Panneau adversaire - côté droit */}
      <Box sx={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        minWidth: '300px'
      }}>
        {/* Zone de taunt / bulle de texte */}
        {aiTaunt && (
          <Paper 
            elevation={4}
            sx={{
              position: 'relative',
              bgcolor: '#fff',
              padding: 2,
              borderRadius: 2,
              border: '3px solid #333',
              minHeight: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: '-20px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '20px solid transparent',
                borderRight: '20px solid transparent',
                borderTop: '20px solid #333',
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                bottom: '-14px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '16px solid transparent',
                borderRight: '16px solid transparent',
                borderTop: '16px solid #fff',
                zIndex: 1,
              }
            }}
          >
            <Typography 
              variant="body1" 
              sx={{ 
                fontFamily: 'monospace',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                textAlign: 'center',
                color: '#333'
              }}
            >
              {aiTaunt}
            </Typography>
          </Paper>
        )}

        {/* Portrait de l'adversaire */}
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2
        }}>
          <Box
            component="img"
            src={images[aiProfile.image]?.src}
            alt={aiProfile.name}
            sx={{
              width: 220,
              height: 220,
              borderRadius: '50%',
              border: '6px solid #ff3333',
              boxShadow: '0 0 40px rgba(255,51,51,0.6)',
              objectFit: 'cover'
            }}
          />
          
          {/* Score de l'IA */}
          <Typography 
            variant="h2" 
            sx={{ 
              color: '#a82121',
              fontFamily: 'monospace',
              fontWeight: 'bold',
              textShadow: '0 0 15px #ff3333',
              fontSize: '4rem'
            }}
          >
            {scores.ai}
          </Typography>
        </Box>

        {/* Infos adversaire */}
        <Paper 
          elevation={3}
          sx={{
            bgcolor: 'rgba(26, 26, 26, 0.9)',
            padding: 2.5,
            borderRadius: 2,
            border: '2px solid #ff3333'
          }}
        >
          <Typography 
            variant="h5" 
            sx={{ 
              color: '#ff3333',
              fontFamily: 'monospace',
              fontWeight: 'bold',
              marginBottom: 1,
              textAlign: 'center'
            }}
          >
            {aiProfile.name}
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#ccc',
              fontFamily: 'monospace',
              textAlign: 'center',
              fontStyle: 'italic'
            }}
          >
            {aiProfile.description}
          </Typography>
        </Paper>

        {/* Score du joueur - plus discret */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          padding: 1.5,
          bgcolor: 'rgba(233, 242, 175, 0.6)',
          borderRadius: 2,
          border: '2px solid #63ff33'
        }}>
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#cc3838',
              fontFamily: 'monospace'
            }}
          >
            TOI
          </Typography>
          <Typography 
            variant="h4" 
            sx={{ 
              color: '#624818',
              fontFamily: 'monospace',
              fontWeight: 'bold'
            }}
          >
            {scores.player}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ShuffleBoard;



const MainBoard = ({aiProfile,images, setGameState, stageRef,puckRef, handleMouseMove, aiPaddleRef, playerPaddleRef})=>{
  return <Box>
            <Stage
              ref={stageRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              onMouseMove={handleMouseMove}
              style={{ 
                border: '6px solid #e7ed98',
                borderRadius: '12px',
                cursor: 'none',
              }}
            >
              <Layer>
                {/* Table design */}
                <Rect
                  x={0}
                  y={0}
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                  fill="#406d39"
                />
                 <Image image={images['fond']} 
                  x={0}
                  y={0}
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}/>
                
                {/* Center line */}
                <Line
                  points={[0, CANVAS_HEIGHT / 2, CANVAS_WIDTH, CANVAS_HEIGHT / 2]}
                  stroke="#d3f3d9"
                  strokeWidth={3}
                  dash={[15, 15]}
                  opacity={0.3}
                />
                
                {/* Center circle */}
                <Circle
                  x={CANVAS_WIDTH / 2}
                  y={CANVAS_HEIGHT / 2}
                  radius={60}
                  stroke="#c1f5c5"
                  strokeWidth={3}
                  opacity={0.3}
                />

                {/* Goals */}
                <Rect
                  x={CANVAS_WIDTH / 2 - GOAL_WIDTH / 2}
                  y={-5}
                  width={GOAL_WIDTH}
                  height={15}
                  fill="#ff3333"
                  shadowBlur={20}
                  shadowColor="#ff3333"
                />
                <Rect
                  x={CANVAS_WIDTH / 2 - GOAL_WIDTH / 2}
                  y={CANVAS_HEIGHT - 5}
                  width={GOAL_WIDTH}
                  height={15}
                  fill="#3366ff"
                  shadowBlur={20}
                  shadowColor="#3366ff"
                />

                {/* AI Paddle */}
                <Circle
                  x={aiPaddleRef.current.x}
                  y={aiPaddleRef.current.y}
                  radius={PADDLE_RADIUS}
                  fill="#ff3333"
                  shadowBlur={20}
                  shadowColor="#ff3333"
                  stroke="#ff6666"
                  strokeWidth={3}
                />

                {/* Player Paddle */}
                <Circle
                  x={playerPaddleRef.current.x}
                  y={playerPaddleRef.current.y}
                  radius={PADDLE_RADIUS}
                  fill="#3366ff"
                  shadowBlur={20}
                  shadowColor="#3366ff"
                  stroke="#6699ff"
                  strokeWidth={3}
                />

                {/* Puck with trail effect */}
                <Circle
                  x={puckRef.current.x}
                  y={puckRef.current.y}
                  radius={PUCK_RADIUS + 5}
                  fill="#ffff00"
                  opacity={0.3}
                  shadowBlur={30}
                  shadowColor="#ffff00"
                />
                <Circle
                  x={puckRef.current.x}
                  y={puckRef.current.y}
                  radius={PUCK_RADIUS}
                  fill="#ffff00"
                  shadowBlur={20}
                  shadowColor="#ffff00"
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              </Layer>
            </Stage>
            
            <Button 
              variant="outlined"
              onClick={() => setGameState('menu')}
              sx={{ 
                color: '#f6f0ac', 
                borderColor: '#eaeba7',
                mt: 2,
                fontFamily: 'monospace',
                '&:hover': {
                  borderColor: '#efe5a4',
                  bgcolor: 'rgba(0,255,255,0.1)'
                }
              }}
            >
              ◀ QUIT
            </Button>
          </Box>
}