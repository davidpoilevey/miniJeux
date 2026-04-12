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
import { Close as CloseIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { useChess } from './ChessContext';
import { DIFFICULTY_CONFIGS } from './reflexions';
import { useEffect, useState } from 'react';
import { FAMOUS_OPENINGS } from './Ouvertures';
import Piece from './Piece';
import { CHESS_PUZZLES } from './PuzzleManager';

const LABEL_SX = {
  fontSize: '0.62rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: '#5c605c',
  display: 'block',
};

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

  const maxDifficulty = Object.keys(DIFFICULTY_CONFIGS).length - 1;
  const sliderDifficulte = Math.max(1, difficulte);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 4,
          background: '#faf9f6',
          boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
          overflow: 'hidden',
          m: 2,
        }
      }}
    >
      {/* ── Header ── */}
      <Box sx={{
        px: 4, py: 3,
        borderBottom: '1px solid rgba(175,179,174,0.12)',
        background: '#ffffff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      }}>
        <Box>
          <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: '#2f3430', lineHeight: 1.2 }}>
            Configuration de la partie
          </Typography>
          <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#5c605c', mt: 0.5 }}>
            Échecs
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small" sx={{ color: '#5c605c' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* ── Body ── */}
      <DialogContent sx={{ p: 4, background: '#faf9f6' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: { xs: 4, md: 6 } }}>

          {/* ── Colonne gauche ── */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>

            {/* Couleur */}
            <Box>
              <Typography sx={LABEL_SX}>Couleur des pièces</Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 1.5 }}>
                {[
                  { couleur: 'white', label: 'Les Blancs', isSelected: joueurEstBlanc },
                  { couleur: 'black', label: 'Les Noirs',  isSelected: !joueurEstBlanc },
                ].map(({ couleur, label, isSelected }) => (
                  <Box
                    key={couleur}
                    onClick={() => changeCouleurJoueur(couleur)}
                    sx={{
                      flex: 1, py: 3, px: 2,
                      borderRadius: 3,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5,
                      cursor: 'pointer',
                      background: isSelected ? '#835425' : '#ffffff',
                      border: `1px solid ${isSelected ? '#835425' : 'rgba(175,179,174,0.25)'}`,
                      boxShadow: isSelected ? '0 0 0 3px rgba(131,84,37,0.12)' : 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Piece piece={{ type: 'pion', couleur }} />
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: isSelected ? '#fff6f1' : '#2f3430' }}>
                      {label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Durée */}
            <Box>
              <Typography sx={LABEL_SX}>Durée de la partie (minutes)</Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                {DURATIONS.map(d => (
                  <Box
                    key={d}
                    onClick={() => setDureeJeu(d)}
                    sx={{
                      flex: 1, py: 1.5,
                      borderRadius: 2,
                      textAlign: 'center',
                      cursor: 'pointer',
                      fontSize: '0.875rem', fontWeight: 700,
                      background: d === dureeJeu ? '#D2B48C' : '#f4f4f0',
                      color: d === dureeJeu ? '#ffffff' : '#2f3430',
                      transition: 'background 0.15s',
                      '&:hover': { background: d === dureeJeu ? '#C8A882' : '#e6e9e4' },
                      userSelect: 'none',
                    }}
                  >
                    {d}
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Difficulté IA */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={LABEL_SX}>Difficulté de l'IA</Typography>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#D2B48C' }}>
                  {DIFFICULTY_CONFIGS[sliderDifficulte]?.name} • {DIFFICULTY_CONFIGS[sliderDifficulte]?.estimatedElo} Elo
                </Typography>
              </Box>
              <Box sx={{ background: '#f4f4f0', borderRadius: 3, p: 3, mt: 1.5 }}>
                <Slider
                  value={sliderDifficulte}
                  min={1}
                  max={maxDifficulty}
                  step={1}
                  onChange={(_, val) => setDifficulte(val)}
                  sx={{
                    color: '#D2B48C',
                    '& .MuiSlider-thumb': { bgcolor: '#835425', width: 16, height: 16 },
                    '& .MuiSlider-track': { height: 4 },
                    '& .MuiSlider-rail': { height: 4, opacity: 0.3 },
                    mb: 0.5,
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 0.5 }}>
                  {['Initié', 'Intermédiaire', 'Maître'].map(t => (
                    <Typography key={t} sx={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5c605c' }}>
                      {t}
                    </Typography>
                  ))}
                </Box>
                {DIFFICULTY_CONFIGS[difficulte]?.description && (
                  <Typography sx={{ fontSize: '0.75rem', color: '#5c605c', fontStyle: 'italic', mt: 2, lineHeight: 1.5 }}>
                    "{DIFFICULTY_CONFIGS[difficulte].description}"
                  </Typography>
                )}
              </Box>
              {/* Réglages personnalisés (niveau 0) */}
              <Collapse in={difficulte === 0} timeout="auto" unmountOnExit>
                <Box sx={{ mt: 2, p: 3, background: '#f4f4f0', borderRadius: 3 }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#2f3430', mb: 2 }}>
                    Réglage personnalisé
                  </Typography>
                  <Table size="small">
                    <TableBody>
                      {difficultySliders.map(({ key, label, min, max, step }) => (
                        <TableRow key={key}>
                          <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.72rem', border: 'none', py: 0.5, color: '#5c605c' }}>{label}</TableCell>
                          <TableCell sx={{ minWidth: 120, border: 'none', py: 0.5 }}>
                            <Slider
                              size="small"
                              value={customConfig[key]}
                              min={min} max={max} step={step}
                              onChange={(e, val) => setCustomDifficulty(key, val)}
                              valueLabelDisplay="auto"
                              sx={{ color: '#D2B48C' }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </Collapse>
            </Box>
          </Box>

          {/* ── Colonne droite ── */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>

            {/* Ouvertures */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography sx={LABEL_SX}>Sélection de l'Ouverture</Typography>
                <Typography
                  onClick={() => setShowOpenings(p => !p)}
                  sx={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#D2B48C', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                >
                  {showOpenings ? 'Réduire' : 'Voir tout'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {Object.entries(FAMOUS_OPENINGS)
                  .slice(0, showOpenings ? undefined : 3)
                  .map(([key, opening]) => {
                    const isSelected = selectedOpening === key;
                    return (
                      <Box
                        key={key}
                        onClick={() => setSelectedOpening(isSelected ? null : key)}
                        sx={{
                          display: 'flex', alignItems: 'center', gap: 1.5,
                          p: 1.5, borderRadius: 2,
                          background: '#ffffff',
                          border: `1px solid ${isSelected ? '#D2B48C' : 'rgba(175,179,174,0.15)'}`,
                          boxShadow: isSelected ? '0 2px 8px rgba(210,180,140,0.2)' : 'none',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          '&:hover': { borderColor: 'rgba(210,180,140,0.4)' },
                        }}
                      >
                        <Box sx={{
                          width: 40, height: 40, borderRadius: 1.5,
                          background: '#e6e9e4', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '1.1rem',
                        }}>
                          ♟
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#2f3430' }} noWrap>
                            {opening.name}
                          </Typography>
                          <Typography sx={{ fontSize: '0.68rem', color: '#5c605c', fontStyle: 'italic' }} noWrap>
                            {opening.description?.slice(0, 50)}{opening.description?.length > 50 ? '…' : ''}
                          </Typography>
                        </Box>
                        {isSelected && <CheckCircleIcon sx={{ color: '#D2B48C', fontSize: '1.1rem', flexShrink: 0 }} />}
                      </Box>
                    );
                  })}
              </Box>
              {selectedOpening && (
                <Box sx={{ mt: 1.5, px: 2, py: 1, background: 'rgba(210,180,140,0.12)', borderRadius: 2, border: '1px solid rgba(210,180,140,0.3)' }}>
                  <Typography sx={{ fontSize: '0.75rem', color: '#835425', fontWeight: 600 }}>
                    ✓ {FAMOUS_OPENINGS[selectedOpening]?.name} sélectionnée
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Puzzles */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography sx={LABEL_SX}>Entraînement Tactique</Typography>
                <Typography
                  onClick={() => setShowPuzzle(p => !p)}
                  sx={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#D2B48C', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                >
                  {showPuzzle ? 'Réduire' : 'Voir tout'}
                </Typography>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                {Object.entries(CHESS_PUZZLES)
                  .slice(0, showPuzzle ? undefined : 4)
                  .map(([id, p]) => (
                    <Box
                      key={id}
                      onClick={() => { startPuzzle(id); handleClose(); }}
                      sx={{
                        p: 2, borderRadius: 2,
                        background: '#f4f4f0',
                        cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', gap: 0.5,
                        transition: 'background 0.15s',
                        '&:hover': { background: '#e6e9e4' },
                      }}
                    >
                      <Typography sx={{ fontSize: '1.1rem', lineHeight: 1 }}>
                        {getDifficultyInfo(p.difficulty).emoji}
                      </Typography>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#2f3430', mt: 0.5 }} noWrap>
                        {p.name}
                      </Typography>
                      <Typography sx={{ fontSize: '0.65rem', color: '#5c605c' }}>
                        {typeLabel(p.type)}
                      </Typography>
                    </Box>
                  ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      {/* ── Footer ── */}
      <Box sx={{
        px: 4, py: 3,
        borderTop: '1px solid rgba(175,179,174,0.12)',
        background: '#ffffff',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5,
      }}>
        <Button
          fullWidth
          onClick={restart}
          sx={{
            py: 2, borderRadius: 3,
            background: '#835425',
            color: '#fff6f1',
            fontWeight: 800, fontSize: '1rem',
            boxShadow: '0 4px 16px rgba(131,84,37,0.25)',
            textTransform: 'none',
            '&:hover': { background: '#75481a', boxShadow: '0 6px 20px rgba(131,84,37,0.3)' },
          }}
        >
          Commencer la partie
        </Button>
        <Button
          onClick={handleClose}
          sx={{ color: '#777c77', fontSize: '0.75rem', textTransform: 'none', fontWeight: 500 }}
          size="small"
        >
          Continuer la partie en cours
        </Button>
        <Typography sx={{ mt: 0.5, fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#afb3ae' }}>
          Bonne chance, grand maître.
        </Typography>
      </Box>
    </Dialog>
  );
}




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
