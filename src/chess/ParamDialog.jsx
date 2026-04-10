import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Slider, Typography, Stack,
  IconButton,
  Card, Collapse, Table, TableBody, TableRow, TableCell,
  Box,
  Grid,
  CardContent,
  Chip,
  CardActions,
  Tooltip,
  Divider
} from '@mui/material';
import { useChess } from './ChessContext';
import { DIFFICULTY_CONFIGS } from './reflexions';
import { useEffect, useState } from 'react';
import { FAMOUS_OPENINGS } from './Ouvertures';
import Piece from './Piece';
import { CHESS_PUZZLES } from './PuzzleManager';

const difficultySliders = [
  { key: 'depth', label: 'Profondeur de recherche', min: 1, max: 5, step: 1 },
  { key: 'errorRate', label: "Taux d'erreur (faiblesse volontaire)", min: 0, max: 1, step: 0.01 },
  { key: 'blunderChance', label: 'Chance de bourde', min: 0, max: 1, step: 0.01 },
  { key: 'materialWeight', label: 'Importance du matériel', min: 0, max: 1, step: 0.1 },
  { key: 'positionalWeight', label: 'Importance du positionnement', min: 0, max: 1, step: 0.1 },
  { key: 'kingSafetyWeight', label: 'Importance de la sécurité du roi', min: 0, max: 1, step: 0.1 },
  { key: 'randomFactor', label: 'Choix discutables', min: 0, max: 1, step: 0.01 },
];
export default function ParametresDialog({
  open, handleClose, reset

}) {
  const { dureeJeu, setDureeJeu,joueurEstBlanc,changeCouleurJoueur,
    difficulte, setDifficulte , openingManager, startPuzzle} = useChess();
  const restart = () => {
    reset()
    handleClose();
  }
  const [showLevel, setShowLevel] = useState(false);
  const [showOpenings, setShowOpenings] = useState(false);
  const [showPuzzle, setShowPuzzle] = useState(false);
  const [selectedOpening, setSelectedOpening] = useState(null);
useEffect(() => {
  if(selectedOpening!=null) {
    openingManager.startOpening(selectedOpening, joueurEstBlanc? 'white' : 'black');
  }
}, [selectedOpening,joueurEstBlanc]);
useEffect(() => {
  if(open) {
    setSelectedOpening(null); // Réinitialiser l'ouverture sélectionnée à chaque ouverture du dialogue
    setShowOpenings(false); // Fermer la liste des ouvertures
    setShowLevel(false);
    startPuzzle(null);
  }
}, [open]);

  const DURATIONS = [1, 3, 5, 10,  30,];
  const [customConfig, setCustomConfig] = useState(DIFFICULTY_CONFIGS[0]); // Configuration personnalisée par défaut
  const setCustomDifficulty = (key, value) => {
    setCustomConfig(c => ({ ...c, [key]: value }));
    DIFFICULTY_CONFIGS[0][key] = value; // Mettre à
  };

  return (
    <Dialog open={open} onClose={handleClose}
      sx={{ backgroundSize: 'cover', backgroundImage: 'url(https://lelephant-larevue.fr/wp-content/uploads/2016/04/Capture-d%E2%80%99e%CC%81cran-2017-05-23-a%CC%80-10.51.42-1024x681.png)' }} fullWidth>
      <DialogTitle sx={{ background: 'linear-gradient(90deg, #f8f9fbff, #e2e7bcff)',}}>Configurer la partie</DialogTitle>
      <DialogContent  sx={{ background: 'linear-gradient(135deg, #f8f9fbff, #e2e7bcff)',}}>

        {/* Choix de la durée */}
        <Box textAlign={'center'}>
    <Box sx={{display: 'flex', justifyContent: 'center', mb: 2, gap:5}}>
      <Button variant="contained" color={joueurEstBlanc?"success":"inherit"} 
      onClick={()=>{changeCouleurJoueur('white')}}>
        <Piece piece={{ type: 'pion', couleur: 'white' }} 
     />
      </Button>
      
      
      <Button variant="contained" color={!joueurEstBlanc?"success":"inherit"} 
      onClick={()=>{changeCouleurJoueur('black')}}>
        <Piece piece={{ type: 'pion', couleur: 'black' }} 
     />
      </Button>
    
    </Box>
          <Stack direction="row" spacing={2} justifyContent={'center'} sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            ⏱ Durée de la partie
          </Typography>
            {DURATIONS.map((minutes) => (
              <Button
                key={minutes} size="small"
                variant={minutes === dureeJeu ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => setDureeJeu(minutes)}
                sx={{
                  borderRadius: 2,
                  fontWeight: 'bold',
                }}
              >
                {minutes} min
              </Button>
            ))}
          </Stack>
        </Box>
        <Stack spacing={2} textAlign={'center'} sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            onClick={() => setShowOpenings(prev => !prev)}
            fullWidth
            sx={{ mt: 2 }}
          >
            {showOpenings ? '🔒 Fermer les ouvertures' : '📖 Choisir une ouverture'}
          </Button>

          <OpeningSelector
            open={showOpenings}
            selectedOpening={selectedOpening}
            onSelect={setSelectedOpening}
          />
          <Button
            variant="outlined"
            onClick={() => setShowLevel(prev => !prev)}
            fullWidth
            sx={{ mt: 2 }}
          >
            {showLevel ? "🤖 Choisissez votre force" : `🤖 Difficulté de l'IA:  ${DIFFICULTY_CONFIGS[difficulte].name}`}
          </Button>
          
          <Collapse in={difficulte === 0} timeout="auto" unmountOnExit sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mt: 1, mb: 2 }}>
              Réglage fin de l’IA personnalisée
            </Typography>
            <Table size="small">
              <TableBody>
                {difficultySliders.map(({ key, label, min, max, step }) => (
                  <TableRow key={key}>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{label}</TableCell>
                    <TableCell sx={{ minWidth: 200 }}>
                      <Slider
                        size="small"
                        value={customConfig[key]}
                        min={min}
                        max={max}
                        step={step}
                        onChange={(e, val) => setCustomDifficulty(key, val)}
                        valueLabelDisplay="auto"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Collapse>
          <Collapse in={showLevel} timeout="auto" unmountOnExit sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2 }}>
            {Object.entries(DIFFICULTY_CONFIGS).map(([level, config]) => (
              <Card
                key={level}
                variant={+level === difficulte ? 'outlined' : 'elevation'}
                onClick={() => setDifficulte(+level)}
                sx={{
                  width: 200,
                  cursor: 'pointer',
                  border: +level === difficulte ? '3px solid #1976d2' : '1px solid #ccc',
                  boxShadow: +level === difficulte ? 6 : 1,
                  background: 'linear-gradient(135deg, #d8d9dcff, #e5ebf6ff)',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  }
                }}
              >
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {config.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {config.description}
                </Typography>
                <Typography variant="caption" fontStyle="italic" color="text.secondary">
                  Niveau estimé : {config.estimatedElo}
                </Typography>
              </Card>
            ))}
          </Box>

          </Collapse>


          <Button
            variant="outlined"
            onClick={() => setShowPuzzle(prev => !prev)}
            fullWidth
            sx={{ mt: 2 }}
          >
            {showPuzzle ? "🤖 Fermer lez enigmes" : `🤖 Choississez une enigme`}
          </Button>
             <Collapse in={showPuzzle} timeout="auto" unmountOnExit sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2 }}>
      {Object.entries(CHESS_PUZZLES).map(([id, p]) => (
        <Card
          key={id}
          sx={{
            width: 240,
            cursor: 'pointer',
            border: '1px solid #ccc',
            borderRadius: 2,
            boxShadow: 2,
            background: 'linear-gradient(135deg, #d7f7dfff 0%, #eef3fb 100%)',
            transition: 'transform .15s',
            '&:hover': { transform: 'scale(1.03)', boxShadow: 4 }
          }}
          onClick={() => {
            startPuzzle?.(id);
            handleClose();
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Stack spacing={1}>
              <Typography variant="h6" fontWeight="bold" noWrap>
                {p.name}
              </Typography>

              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Chip
                  size="small"
                  sx={{color:getDifficultyInfo(p.difficulty).color}}
                  label={`${getDifficultyInfo(p.difficulty).emoji} ${difficultyLabel(p.difficulty)}`}
                />
                <Chip
                  size="small"
                  variant="outlined"
                  label={`♟ ${typeLabel(p.type)}`}
                />
              </Stack>

              <Tooltip title={p.description} placement="top" arrow>
                <Typography variant="body2" color="text.secondary">
                  {p.description}
                </Typography>
              </Tooltip>

              {p.theme && (
                <Typography variant="caption" color="text.secondary">
                  🎯 Thème : {p.theme.replace(/_/g, ' ')}
                </Typography>
              )}
            </Stack>
          </CardContent>

        </Card>
      ))}
    </Box>
        </Collapse>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ background: 'linear-gradient(135deg, #e2e7bcff, #d4daa9ff)',}}>
        <Button onClick={restart} variant="contained">Recommencer une partie</Button>
        <Button onClick={handleClose} variant="contained">Continuer la partie</Button>
      </DialogActions>
    </Dialog>
  );
}
const OpeningSelector = ({ open, selectedOpening, onSelect }) => {
  return (
    <Collapse in={open} timeout="auto" unmountOnExit sx={{ mt: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          🎯 <span>Choisir une ouverture</span>
        </Typography>
        
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: 1.5,
          maxHeight: '400px',
          overflowY: 'auto',
          pr: 1,
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#c1c1c1',
            borderRadius: '3px',
          },
        }}>
          {Object.entries(FAMOUS_OPENINGS).map(([key, opening]) => {
            const diffInfo = getDifficultyInfo(opening.difficulty);
            const isSelected = selectedOpening === key;
            
            return (
              <Box
                key={key}
                onClick={() => onSelect(key)}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `2px solid ${isSelected ? diffInfo.color : 'transparent'}`,
                  background: isSelected 
                    ? `linear-gradient(135deg, ${diffInfo.bg} 0%, ${diffInfo.color}15 100%)`
                    : '#fafafa',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 25px ${diffInfo.color}30`,
                    background: isSelected 
                      ? `linear-gradient(135deg, ${diffInfo.bg} 0%, ${diffInfo.color}25 100%)`
                      : `linear-gradient(135deg, #ffffff 0%, ${diffInfo.bg} 100%)`,
                  },
                  '&::before': isSelected ? {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: `linear-gradient(90deg, ${diffInfo.color}, ${diffInfo.color}aa)`,
                  } : {},
                }}
              >
                {/* Header avec nom et sélection */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 600,
                      color: isSelected ? diffInfo.color : 'text.primary',
                      flex: 1,
                      mr: 1
                    }}
                  >
                    {opening.name} ({opening.moves.length} coups)
                  </Typography>
                  {isSelected && (
                    <Box sx={{ 
                      background: diffInfo.color,
                      color: 'white',
                      borderRadius: '50%',
                      width: 20,
                      height: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px'
                    }}>
                      ✓
                    </Box>
                  )}
                </Box>

                {/* Description */}
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary',
                    mb: 1.5,
                    lineHeight: 1.4,
                    fontSize: '0.85rem'
                  }}
                >
                  {opening.description}
                </Typography>

                {/* Tags compacts */}
                <Box sx={{ display: 'flex', gap: 1, mb: 1.5}}>
                  <Chip
                    size="small"
                    label={`${diffInfo.emoji} ${difficultyLabel(opening.difficulty)}`}
                    sx={{
                      background: diffInfo.bg,
                      color: diffInfo.color,
                      fontWeight: 500,
                      height: 24,
                      fontSize: '0.75rem',
                      '& .MuiChip-label': { px: 1 }
                    }}
                  />
                  <Chip
                    size="small"
                    label={`📅 ${opening.century}`}
                    sx={{
                      background: '#f5f5f5',
                      color: 'text.secondary',
                      height: 24,
                      fontSize: '0.75rem',
                      '& .MuiChip-label': { px: 1 }
                    }}
                  />
                  {/* Maîtres */}
                <Box>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'text.secondary',
                      fontWeight: 500,
                      display: 'block',
                      mb: 0.5
                    }}
                  >
                    🏆 Maîtres célèbres
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'text.secondary',
                      lineHeight: 1.3,
                      display: 'block'
                    }}
                  >
                    {opening.masters.slice(0, 3).join(' • ')}
                    {opening.masters.length > 3 && ` • +${opening.masters.length - 3}`}
                  </Typography>
                </Box>
                </Box>

                
              </Box>
            );
          })}
        </Box>
        
        {/* Info sélection */}
        {selectedOpening && (
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
            borderRadius: 2,
            border: '1px solid #4caf5050'
          }}>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              ✅ <strong>{FAMOUS_OPENINGS[selectedOpening]?.name}</strong> sélectionnée
            </Typography>
          </Box>
        )}
      </Box>
    </Collapse>
  );
};


// Petits labels élégants selon niveau
const difficultyLabel = (level) => {
  switch (level) {
    case 'beginner': return 'Débutant 👶';
    case 'intermediate': return 'Intermédiaire 🎯';
    case 'advanced': return 'Avancé 🔥';
    default: return 'Inconnu';
  }
};



const PIECE_ICONS = {
  reine: '♛',
  tour: '♜',
  fou: '♝',
  cavalier: '♞'
};

export function DialogPromotion({ open, onChoose, color = 'white' }) {
  const options = ['reine', 'tour', 'fou', 'cavalier'];
  const isDark = color === 'black';

  return (
    <Dialog open={open} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>
        Choisissez votre promotion
      </DialogTitle>
      <DialogContent>
        <Stack direction="row" justifyContent="center" spacing={3} sx={{ mt: 2 }}>
          {options.map(type => (
            <Stack key={type} alignItems="center" spacing={1}>
              <IconButton
                onClick={() => onChoose(type)}
                sx={{
                  width: 64,
                  height: 64,
                  fontSize: 40,
                  bgcolor: isDark ? '#444' : '#fff',
                  color: isDark ? '#fff' : '#000',
                  border: '2px solid',
                  borderColor: isDark ? '#888' : '#ccc',
                  borderRadius: '50%',
                  boxShadow: 3,
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.15)',
                    bgcolor: isDark ? '#555' : '#eee',
                  }
                }}
              >
                {PIECE_ICONS[type]}
              </IconButton>
              <Typography variant="caption" color="text.secondary">
                {type}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

export function PuzzleSuccess({ open, score, puzzleManager, handleClose}) {
  const stats = puzzleManager.getStats();
const timeSpent = Math.floor((Date.now() - puzzleManager.timeStarted) / 1000);

  return puzzleManager.currentPuzzle==null?null:(
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>
        {puzzleManager.currentPuzzle?.name}
      </DialogTitle>
      <DialogContent>
      <PuzzleStatsDisplay score={score} timeSpent={timeSpent} stats={stats}/>
      </DialogContent>
    </Dialog>
  );
}

const PuzzleStatsDisplay = ({score, timeSpent, stats }) => {
  const {
    solved = 0,
    totalAttempts = 0,
    averageTime = 0,
    difficulty = {},
    successRate = 0,
    averageAttempts = 0,
  } = stats || {};

  const formatPercent = (val) => `${Math.round(val * 100)}%`;

  return (
    <Box
      sx={{
        p: 3,
        border: '2px solid #ddd',
        borderRadius: 2,
        background: 'linear-gradient(135deg, #fafafa, #f0f4f8)',
        maxWidth: 500,
      }}
    >
      <Typography variant="h6" color="success.main" fontWeight="bold" gutterBottom>
        Score pour ce puzzle: {score}
      </Typography>
      <Typography variant="subtitle"  gutterBottom color="success.main" fontWeight="bold" gutterBottom>
        (en {timeSpent} secondes)
      </Typography>
      <Divider sx={{m:2}}/>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        📊 Statistiques des puzzles
      </Typography>

      <Grid container spacing={1}>
        <Grid item xs={6}>
          <Typography variant="body2">✔️ Puzzles résolus :</Typography>
          <Typography variant="subtitle1" fontWeight="medium">{solved}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2">🧪 Tentatives totales :</Typography>
          <Typography variant="subtitle1" fontWeight="medium">{totalAttempts}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2">⏱️ Temps moyen :</Typography>
          <Typography variant="subtitle1" fontWeight="medium">{averageTime}s</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2">🎯 Taux de réussite :</Typography>
          <Typography variant="subtitle1" fontWeight="medium">
            {isNaN(successRate) ? '0%' : successRate+'%'}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body2">📈 Moy. tentatives par puzzle réussi :</Typography>
          <Typography variant="subtitle1" fontWeight="medium">{averageAttempts}</Typography>
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        📚 Par niveau de difficulté :
      </Typography>
      <Stack spacing={1}>
        {['beginner', 'intermediate', 'expert'].map((level) => {
          const label =
            level === 'beginner' ? 'Débutant' :
            level === 'intermediate' ? 'Intermédiaire' :
            'Expert';
          const levelStats = difficulty[level] || {};
          return (
            <Chip
              key={level}
              label={`${label} : ${levelStats.solved || 0}/${levelStats.attempted || 0} résolus`}
              color={
                level === 'beginner' ? 'success' :
                level === 'intermediate' ? 'warning' : 'error'
              }
              variant="outlined"
            />
          );
        })}
      </Stack>
    </Box>
  );
};



const typeLabel = (t) => {
  switch (t) {
    case 'mate_in_1': return 'Mat en 1';
    case 'mate_in_2': return 'Mat en 2';
    case 'mate_in_3': return 'Mat en 3';
    case 'tactic':    return 'Tactique';
    default:          return t;
  }
};
  const getDifficultyInfo = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return { emoji: '🌱', color: '#4caf50', bg: '#e8f5e8' };
      case 'intermediate':
        return { emoji: '⚡', color: '#ff9800', bg: '#fff3e0' };
      case 'advanced':
        return { emoji: '🔥', color: '#f44336', bg: '#ffebee' };
      default:
        return { emoji: '🎯', color: '#2196f3', bg: '#e3f2fd' };
    }
  };
