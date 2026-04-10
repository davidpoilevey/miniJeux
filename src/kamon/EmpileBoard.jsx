import { useEffect, useRef, useState } from "react";
import { GameOver } from "../ChuckNorrisFact";
import { Box, Typography, Paper, Button, IconButton } from "@mui/material";
import { Layer, Stage } from "react-konva";
import { generateRandomPile, generateRandomPiles, useEmpileTruc } from "./EmpileHooks";
import { axialToPixel } from "../wargame/hooks/hexUtils";
import EmpileTile from "./EmpileTile";
import { ArrowUpward } from "@mui/icons-material";

const HEX_SIZE = 60;
const MINI_HEX_SIZE = 30;

// Composant pour afficher une pile proposée
const ProposedPile = ({ pile, index, isSelected, onSelect }) => {
  return (
    <Paper
      elevation={isSelected ? 8 : 2}
      sx={{
        p: 2,
        mb: 2,
        cursor: 'pointer',display:'flex',
        border: isSelected ? '3px solid #4CAF50' : '2px solid transparent',
        backgroundColor: isSelected ? '#e8f5e9' : 'white',
        transition: 'all 0.2s',
        '&:hover': {
          transform: 'scale(1.05)',
          elevation: 4
        }
      }}
      onClick={onSelect}
    >
      <Typography variant="caption" color="text.secondary" gutterBottom>
        Pile #{index + 1}
      </Typography>
      
      <Stage width={MINI_HEX_SIZE * 3} height={MINI_HEX_SIZE * 3}>
        <Layer x={MINI_HEX_SIZE * 1.5} y={MINI_HEX_SIZE * 1.5+20}>
          <EmpileTile
            hex={{ 
              q: 0, 
              r: 0, 
              s: 0, 
              x: 0, 
              y: 0, 
              pile 
            }}
            size={MINI_HEX_SIZE}
            onClick={onSelect}
          />
        </Layer>
      </Stage>
      
      <Box sx={{ mt: 1 }}>
        {pile.map((item, idx) => (
          <Typography key={idx} variant="caption" display="block">
            {item.nb}x <span style={{ color: item.color }}>●</span>
          </Typography>
        ))}
      </Box>
    </Paper>
  );
};

const EmpileBoard = ({onBackToMenu, loadSavedGame}) => {
  const containerRef = useRef(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
 
  const { grid, addPile, totalScore, score,objective, setScore,level
    , message, setMessage,gameOver, setGameOver } = useEmpileTruc({loadSavedGame});
  
  // État pour les piles proposées
  const [proposedPiles, setProposedPiles] = useState([]);
  const [selectedPileIndex, setSelectedPileIndex] = useState(null);

  // Générer 3 nouvelles piles aléatoires
  const generateProposedPiles = () => {
     const newPiles = generateRandomPiles({level, score});
    
    setProposedPiles(newPiles);
    setSelectedPileIndex(null);
  };

  // Initialiser les piles proposées au chargement
  useEffect(() => {
    generateProposedPiles();
  }, []);

  const reset = () => {
    setScore(0);
    setGameOver(false);
    generateProposedPiles();
  };

  const handleClick = (hex, key) => {
    if (selectedPileIndex === null) {
      setMessage("Sélectionnez d'abord une pile à gauche !");
      setTimeout(() => setMessage(""), 2000);
      return;
    }
    // count nb of distinct color left in all piles
    const distinctColors = new Set();
    grid.forEach(h => {
        h.pile.forEach(item => {
            distinctColors.add(item.color);
        });
    });
    

    // Placer la pile sélectionnée
    const selectedPile = proposedPiles[selectedPileIndex];
    addPile(key, selectedPile);
    proposedPiles.splice(selectedPileIndex,1);
    if(proposedPiles.length==0)
        setProposedPiles(generateRandomPiles({level, score, colorLimit:(distinctColors.size <= 3)?Array.from(distinctColors):null}));
    else
      setProposedPiles([...proposedPiles]);
    setSelectedPileIndex(null);
   
  };

  // Mesurer le conteneur
  useEffect(() => {
    const checkSize = () => {
      if (containerRef.current) {
        setStageSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    checkSize();
    const resizeObserver = new ResizeObserver(checkSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  const stageCenter = {
    x: stageSize.width / 2,
    y: stageSize.height / 2,
  };

  

  return (
    <Box sx={{ display: 'flex', width: '100%', height: '100%' }}>
      {/* Panneau latéral gauche */}
      <Box
        sx={{
          maxWidth: 250,
          backgroundColor: '#f5f5f5',
          p: 2,
          overflowY: 'auto',
          borderRight: '2px solid #ccc'
        }}
      >
      
      {/* Le reste de ton UI existant */}
  

        <Objectifs 
          level={level} 
          score={score} 
          totalScore={totalScore} 
          objective={objective} 
          message={message} 
        />
       

        <Typography variant="subtitle2" sx={{ mt: 3, mb: 2 }}>
          Piles disponibles:
        </Typography>

        {proposedPiles.map((pile, index) => (
          <ProposedPile
            key={index}
            pile={pile}
            index={index}
            isSelected={selectedPileIndex === index}
            onSelect={() => setSelectedPileIndex(index)}
          />
        ))}

        <Button
          variant="outlined"
          fullWidth
          sx={{ mt: 2 }}
          onClick={generateProposedPiles}
        >
          Nouvelles piles
        </Button>

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 1 }}
          onClick={reset}
        >
          Recommencer
        </Button>
      </Box>

      {/* Zone de jeu principale */}
      <Box
        ref={containerRef}
        sx={{ 
          flex: 1, 
          backgroundColor: '#8f8b8b',
          position: 'relative'
        }}
      >
        <GameOver 
          open={gameOver} 
          gameName="empileTrucs" 
          score={totalScore} 
          handleClose={() => setGameOver(false)}
          handleRestart={reset} 
        />
        
        {message && (
          <Box sx={{
            position: 'absolute',
            zIndex: 2,
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            p: 2,
            backgroundColor: '#FFD700',
            borderRadius: 2,
            boxShadow: 3
          }}>
            <Typography variant="h6">{message}</Typography>
          </Box>
        )}
{(stageSize.width === 0 || stageSize.height === 0)?<div ref={containerRef} style={{ width: '100%', height: '100%', backgroundColor: '#eee' }} />
:<Stage width={stageSize.width} height={stageSize.height} draggable>
          <Layer x={stageCenter.x} y={stageCenter.y}>
            {Array.from(grid.entries())
              .map(([key, hex]) => {
                const { x, y } = axialToPixel(hex.q, hex.r, HEX_SIZE);
                const totalHeight = hex.pile.reduce((sum, item) => sum + item.nb, 0);
                return { key, hex, x, y, totalHeight };
              })
              .sort((a, b) => {
                if (a.totalHeight === 0 && b.totalHeight > 0) return -1;
                if (a.totalHeight > 0 && b.totalHeight === 0) return 1;
                const depthA = a.hex.r + a.hex.q;
                const depthB = b.hex.r + b.hex.q;
                if (depthA !== depthB) return depthA - depthB;
                return a.totalHeight - b.totalHeight;
              })
              .map(({ key, hex, x, y }) => (
                <EmpileTile
                  key={key}
                  hex={{ ...hex, x, y }}
                  size={HEX_SIZE}
                  onClick={() => handleClick(hex, key)}
                />
              ))}
          </Layer>
        </Stage>
  }
      </Box>
    </Box>
  );
};

export default EmpileBoard;



const Objectifs = ({level, score, totalScore, objective, message})=>{
  return <Paper style={{ m:1, fontSize: 18,padding:3 }}>
  <Typography variant="h6">Niveau: {level}</Typography>
  <Typography variant="h6">Score: {score}</Typography>
  <Typography color="text.secondary">Total: {totalScore}</Typography>
  <Box sx={{m:1,p:1, background: 'rgba(212, 113, 8, 0.5)', borderRadius: 5, fontSize:24 }}>
    {objective.type === 'score' ? (
      <>📊 Objectif: {score}/{objective.target} points</>
    ) : (
      <>🎯 Objectif: Libérer tous les counters ({objective.current}/{objective.target})</>
    )}
  </Box>
  {message && (
    <Typography style={{ marginTop: 10, padding: 10, background: 'rgba(0,255,0,0.3)', borderRadius: 5 }}>
      {message}
    </Typography>
  )}
</Paper>
}