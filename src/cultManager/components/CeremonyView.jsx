import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  Grid,
  Chip,
  Alert,
  LinearProgress,
  Checkbox,
  FormControlLabel,
  Divider,
  Fade,
  Grow,
  List,
  ListItem,
  Slide,
} from '@mui/material';
import {
  MusicNote as MusicIcon,
  AutoAwesome as SymbolIcon,
  Science as SubstanceIcon,
  CheckCircle as SuccessIcon,
  Cancel as FailIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { processTurn } from '../utils/turnmechanisms';
import { OnBoardingStep } from '../../OnBoardingContext';


const MUSIC_OPTIONS = [
  { id: 'calm', name: 'Musique Calme', icon: '🎵', devotionBonus: 0, sanityImpact: 0, description: 'Apaisante et rassurante' },
  { id: 'hypnotic', name: 'Musique Hypnotique', icon: '🌀', devotionBonus: 5, sanityImpact: -3, description: 'Répétitive et envoûtante' },
  { id: 'intense', name: 'Musique Intense', icon: '🔥', devotionBonus: 10, sanityImpact: -7, description: 'Percussions puissantes' },
];

const SYMBOL_OPTIONS = [
  { id: 'simple', name: 'Symboles Simples', icon: '✨', impressionBonus: 0, skepticismRisk: 0, description: 'Discrets et élégants' },
  { id: 'mystical', name: 'Symboles Mystiques', icon: '🔮', impressionBonus: 5, skepticismRisk: 5, description: 'Ésotériques et intrigants' },
  { id: 'extreme', name: 'Symboles Extrêmes', icon: '👁️', impressionBonus: 10, skepticismRisk: 15, description: 'Impressionnants mais risqués' },
];
// Configuration de difficulté selon les symboles
const SYMBOL_DIFFICULTY = {
  simple: {
    beatCount: 6,
    timePerBeat: 1200, // ms
    symbolPool: ['✨', '⭐', '💫'],
  },
  mystical: {
    beatCount: 8,
    timePerBeat: 1400,
    symbolPool: ['✨', '🔮', '⭐', '💫', '🌟'],
  },
  extreme: {
    beatCount: 10,
    timePerBeat: 1500,
    symbolPool: ['✨', '🔮', '👁️', '⭐', '💫', '🌟', '🌙', '☀️'],
  },
};

// Filtres visuels selon les substances
const SUBSTANCE_EFFECTS = {
  none: {
    filter: 'none',
    shake: 0,
    blur: 0,
  },
  incense: {
    filter: 'brightness(0.95) contrast(1.1)',
    shake: 1,
    blur: 1,
  },
  herbs: {
    filter: 'brightness(0.9) contrast(1.2) saturate(1.3)',
    shake: 5,
    blur: 2,
  },
  strong: {
    filter: 'brightness(0.85) contrast(1.4) saturate(1.5) hue-rotate(10deg)',
    shake: 8,
    blur: 4,
  },
};
const SUBSTANCE_OPTIONS = [
  { id: 'none', name: 'Aucune', icon: '🚫', devotionBonus: 0, sanityImpact: 0, heatRisk: 0, description: 'Sobre et sûr' },
  { id: 'incense', name: 'Encens', icon: '🌿', devotionBonus: 3, sanityImpact: -1, heatRisk: 0, description: 'Ambiance mystique' },
  { id: 'herbs', name: 'Herbes Douces', icon: '🍃', devotionBonus: 7, sanityImpact: -4, heatRisk: 2, description: 'Légèrement psychoactif' },
  { id: 'strong', name: 'Substances Fortes', icon: '💊', devotionBonus: 15, sanityImpact: -10, heatRisk: 10, description: 'Dangereux mais efficace' },
];

// Symboles pour le rhythm game
const RHYTHM_SYMBOLS = ['✨', '🔮', '👁️', '🌟', '💫', '⭐'];

const CeremonyView = ({ gameState, setGameState, onBack }) => {
  const [phase, setPhase] = useState('preparation'); // preparation, ritual, results
  const [selectedMusic, setSelectedMusic] = useState('calm');
  const [selectedSymbols, setSelectedSymbols] = useState('simple');
  const [selectedSubstance, setSelectedSubstance] = useState('none');
  const [selectedRevelations, setSelectedRevelations] = useState([]);
  
  // Rhythm game
  const [rhythmSequence, setRhythmSequence] = useState([]);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [playerHits, setPlayerHits] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [beatTimestamp, setBeatTimestamp] = useState(null);
  const [feedback, setFeedback] = useState(null);
const [beatTimeout, setBeatTimeout] = useState(null);
const [shakeOffset, setShakeOffset] = useState({ x: 0, y: 0 });
  // Résultats
  const [ceremonySuccess, setCeremonySuccess] = useState(false);
  const [turnReport, setTurnReport] = useState(null);

  // Génère la séquence de rhythm game
 const generateRhythmSequence = () => {
  const difficulty = SYMBOL_DIFFICULTY[selectedSymbols];
  const sequence = [];
  
  for (let i = 0; i < difficulty.beatCount; i++) {
    const randomSymbol = difficulty.symbolPool[Math.floor(Math.random() * difficulty.symbolPool.length)];
    sequence.push(randomSymbol);
  }
  
  return sequence;
};

  // Démarre le rituel
  const startRitual = () => {
    if (selectedRevelations.length === 0) {
      alert('Sélectionnez au moins une révélation à présenter !');
      return;
    }
    
    const sequence = generateRhythmSequence();
    setRhythmSequence(sequence);
    setPhase('ritual');
    setCurrentBeat(0);
    setPlayerHits(0);
    
    // Démarre le rhythm game après 1s
    setTimeout(() => {
      setGameStarted(true);
      setBeatTimestamp(Date.now());
    }, 1000);
  };

  // Gestion du clic sur symbole
  const handleSymbolClick = (symbol) => {
    if (!gameStarted || currentBeat >= rhythmSequence.length) return;
    
  const difficulty = SYMBOL_DIFFICULTY[selectedSymbols];
    const isCorrect = symbol === rhythmSequence[currentBeat];
    const timingDelay = Date.now() - beatTimestamp;
  const perfectTiming = timingDelay < difficulty.timePerBeat;
    
    if (isCorrect && perfectTiming) {
      setPlayerHits(prev => prev + 1);
      setFeedback({ type: 'success', symbol });
    } else if(isCorrect){
         setFeedback({ type: 'late', symbol });
    } else {
      setFeedback({ type: 'fail', symbol });
    }
    
    // Next beat
  setTimeout(() => {
    setFeedback(null);
    if (currentBeat + 1 < rhythmSequence.length) {
      setCurrentBeat(prev => prev + 1);
      setBeatTimestamp(Date.now());
    } else {
      // Fin du rhythm game
      finishRitual();
    }
  }, 500);
  };

  // Termine le rituel et calcule les résultats
  const finishRitual = () => {
    setGameStarted(false);
  
  // Calcule le succès (seuil variable selon difficulté)
  const successThresholds = {
    simple: 0.5,    // 50% minimum pour symboles simples
    mystical: 0.6,  // 60% pour mystiques
    extreme: 0.7,   // 70% pour extrêmes
  };
  
  const successRate = playerHits / rhythmSequence.length;
  const threshold = successThresholds[selectedSymbols];
  const success = successRate >= threshold;
  
  setCeremonySuccess(success);
    
    // Prépare les données pour le calcul du tour
    const revelationsToSell = gameState.revelations.filter(r => selectedRevelations.includes(r.id));
    
    const ceremonyResults = {
      selectedRevelations: revelationsToSell,
      ceremonySuccess: success,
      musicChoice: selectedMusic,
      symbolsChoice: selectedSymbols,
      substanceChoice: selectedSubstance,
    };
    
    // Calcule le tour
    const newGameState = processTurn(gameState, ceremonyResults);
    
    // Applique les bonus de cérémonie
    const musicData = MUSIC_OPTIONS.find(m => m.id === selectedMusic);
    const substanceData = SUBSTANCE_OPTIONS.find(s => s.id === selectedSubstance);
    
    // Applique impacts sur les followers
    newGameState.followers = newGameState.followers.map(f => ({
      ...f,
      sanity: Math.max(0, f.sanity + musicData.sanityImpact + substanceData.sanityImpact),
      devotion: Math.min(100, f.devotion + musicData.devotionBonus + substanceData.devotionBonus),
    }));
    
    // Applique heat risk
    if (substanceData.heatRisk > 0) {
      const heatIncrease = Math.random() * 100 < substanceData.heatRisk ? 5 : 0;
      newGameState.heat = Math.min(100, newGameState.heat + heatIncrease);
    }
    
    setTurnReport(newGameState.turnReport);
    setGameState(newGameState);
    
    setTimeout(() => {
      setPhase('results');
    }, 1000);
  };

  // Toggle révélation
  const toggleRevelation = (revId) => {
    setSelectedRevelations(prev =>
      prev.includes(revId)
        ? prev.filter(id => id !== revId)
        : [...prev, revId]
    );
  };

  // Retour au dashboard
  const returnToDashboard = () => {
    // Reset de la session de recrutement si elle a été utilisée
    
    onBack();
  };

  // Rendu de la préparation
  const renderPreparation = () => (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>

      <Typography variant="h4" sx={{ mb: 4, color:'secondary.light', textAlign: 'center', fontFamily: '"Cinzel", serif' }}>
        🎪 Préparation de la Cérémonie
      </Typography>

      <Grid container spacing={3}>
        {/* Musique */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <MusicIcon sx={{ mr: 1 }} />
                Musique
              </Typography>
              {MUSIC_OPTIONS.map(music => (
                <Button
                  key={music.id}
                  fullWidth
                  variant={selectedMusic === music.id ? 'contained' : 'outlined'}
                  onClick={() => setSelectedMusic(music.id)}
                  sx={{ mb: 1, justifyContent: 'flex-start', py: 1.5 }}
                >
                  <Box sx={{ textAlign: 'left', width: '100%' }}>
                    <Typography variant="body2">
                      {music.icon} {music.name}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', opacity: 0.7 }}>
                      {music.description}
                    </Typography>
                  </Box>
                </Button>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Symboles */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <SymbolIcon sx={{ mr: 1 }} />
                Décoration
              </Typography>
              {SYMBOL_OPTIONS.map(symbol => (
                <Button
                  key={symbol.id}
                  fullWidth
                  variant={selectedSymbols === symbol.id ? 'contained' : 'outlined'}
                  onClick={() => setSelectedSymbols(symbol.id)}
                  sx={{ mb: 1, justifyContent: 'flex-start', py: 1.5 }}
                >
                  <Box sx={{ textAlign: 'left', width: '100%' }}>
                    <Typography variant="body2">
                      {symbol.icon} {symbol.name}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', opacity: 0.7 }}>
                      {symbol.description}
                    </Typography>
                  </Box>
                </Button>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Substances */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <SubstanceIcon sx={{ mr: 1 }} />
                Substances
              </Typography>
              {SUBSTANCE_OPTIONS.map(substance => (
                <Button
                  key={substance.id}
                  fullWidth
                  variant={selectedSubstance === substance.id ? 'contained' : 'outlined'}
                  onClick={() => setSelectedSubstance(substance.id)}
                  sx={{ mb: 1, justifyContent: 'flex-start', py: 1.5 }}
                >
                  <Box sx={{ textAlign: 'left', width: '100%' }}>
                    <Typography variant="body2">
                      {substance.icon} {substance.name}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', opacity: 0.7 }}>
                      {substance.description}
                    </Typography>
                  </Box>
                </Button>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Révélations à présenter */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <OnBoardingStep
  stepId="ceremony-prep"
  condition={gameState.day === 1}
  message="La Cérémonie est l'action qui fait PASSER LE TOUR. Configurez l'ambiance (musique, symboles, substances), sélectionnez vos révélations à vendre, puis lancez le rituel. Plus vous prenez de risques (symboles extrêmes, substances fortes), plus c'est difficile mais plus les effets sont puissants !"
>
              <Typography variant="h6" sx={{ mb: 2 }}>
                📖 Révélations à présenter ({selectedRevelations.length} sélectionnée{selectedRevelations.length > 1 ? 's' : ''})
              </Typography>
              </OnBoardingStep>
              {gameState.revelations.length === 0 ? (
                <Alert severity="warning">
                  Vous n'avez pas encore créé de révélations. Retournez à l'Écriture pour en créer.
                </Alert>
              ) : (
                <Grid container spacing={2}>
                  {gameState.revelations.map(rev => (
                    <Grid item xs={12} sm={6} md={4} key={rev.id}>
                      <Paper
                        sx={{
                          p: 2,
                          border: selectedRevelations.includes(rev.id) ? `2px solid ${rev.themeColor}` : '1px solid rgba(255,255,255,0.1)',
                          cursor: 'pointer',
                          '&:hover': { borderColor: rev.themeColor },
                        }}
                        onClick={() => toggleRevelation(rev.id)}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={selectedRevelations.includes(rev.id)}
                              sx={{ color: rev.themeColor }}
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="subtitle2" sx={{ color: rev.themeColor }}>
                                {rev.themeIcon} {rev.title}
                              </Typography>
                              <Chip
                                label={`$${rev.price}`}
                                size="small"
                                icon={<MoneyIcon style={{ fontSize: 12 }} />}
                                sx={{ mt: 0.5, bgcolor: 'rgba(255, 215, 0, 0.2)' }}
                              />
                            </Box>
                          }
                        />
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Boutons */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button variant="outlined" onClick={onBack} sx={{ minWidth: 150 }}>
          Annuler
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={startRitual}
          disabled={selectedRevelations.length === 0}
          sx={{
            minWidth: 200,
            background: 'linear-gradient(45deg, #9c27b0, #ba68c8)',
          }}
        >
          Commencer le Rituel
        </Button>
      </Box>
    </Box>
  );

  const effects = SUBSTANCE_EFFECTS[selectedSubstance];
  
  // Effet de shake (tremblement)
  useEffect(() => {
    if (gameStarted && effects.shake > 0) {
      const interval = setInterval(() => {
        setShakeOffset({
          x: (Math.random() - 0.5) * effects.shake,
          y: (Math.random() - 0.5) * effects.shake,
        });
      }, 50);
      return () => clearInterval(interval);
    } else {
      setShakeOffset({ x: 0, y: 0 });
    }
  }, [gameStarted, effects.shake]);

  // Rendu du rhythm game
const renderRitual = () => {
  const difficulty = SYMBOL_DIFFICULTY[selectedSymbols];

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', textAlign: 'center' }}>
      <Typography variant="h4" sx={{ mb: 1, color: 'primary.light', fontFamily: '"Cinzel", serif' }}>
        ✨ Le Rituel
      </Typography>
      <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
        Cliquez sur les symboles dans l'ordre où ils apparaissent
      </Typography>
      <Chip 
        label={`Difficulté: ${SYMBOL_OPTIONS.find(s => s.id === selectedSymbols)?.name}`}
        size="small"
        sx={{ mb: 1 }}
      />

      {/* Progression */}
      <Box sx={{ mb: 2 }}>
        <LinearProgress
          variant="determinate"
          value={(currentBeat / rhythmSequence.length) * 100}
          sx={{ height: 8, borderRadius: 1 }}
        />
        <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
          {currentBeat + 1} / {rhythmSequence.length} • Réussis: {playerHits}
        </Typography>
      </Box>

      {/* Zone principale avec effets */}
      <Box
        sx={{
          filter: effects.filter,
          transition: 'filter 0.3s',
        }}
      >
        {/* Symbole actuel à cliquer */}
        {gameStarted && currentBeat < rhythmSequence.length && (
          <Grow in>
            <Paper
              sx={{
                p: 2,
                mb: 2,
                background: 'linear-gradient(135deg, #9c27b022 0%, #ba68c822 100%)',
                border: '2px solid #9c27b0',
                transform: `translate(${shakeOffset.x}px, ${shakeOffset.y}px)`,
                filter: effects.blur > 0 ? `blur(${effects.blur}px)` : 'none',
              }}
            >
              <Typography 
                sx={{ 
                  fontSize: '6rem', 
                  animation: `pulse ${difficulty.timePerBeat}ms linear`,
                }}
              >
                {rhythmSequence[currentBeat]}
              </Typography>
              
              {/* Barre de temps pour ce beat */}
              <LinearProgress
                variant="determinate"
                value={100}
                sx={{
                  mt: 2,
                  height: 6,
                  borderRadius: 1,
                  animation: `countdown ${difficulty.timePerBeat}ms linear`,
                  '@keyframes countdown': {
                    from: { width: '100%' },
                    to: { width: '0%' },
                  },
                }}
                color="secondary"
              />
            </Paper>
          </Grow>
        )}

        {/* Feedback */}
        {feedback && (
          <Fade in>
            <Alert
              severity={feedback.type === 'success' ? 'success' : 'error'}
              sx={{ mb: 3, position:'absolute', top:20, left:20 }}
            >
              {feedback.type === 'success' ? '✓ Parfait !' :(feedback.type === 'late'?'En retard': '✗ Raté...')}
            </Alert>
          </Fade>
        )}

        {/* Grille de symboles cliquables */}
        {gameStarted && (
          <Grid 
            container 
            spacing={2} 
            sx={{ 
              maxWidth: 500, 
              mx: 'auto',
              transform: `translate(${shakeOffset.x}px, ${shakeOffset.y}px)`,
            }}
          >
            {difficulty.symbolPool.map((symbol, idx) => (
              <Grid item xs={selectedSymbols=='extreme'?3:4} key={idx}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => handleSymbolClick(symbol)}
                  sx={{
                    py: 3,
                    fontSize: '2rem',
                    filter: effects.blur > 0 ? `blur(${effects.blur }px)` : 'none',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      transition: 'transform 0.2s',
                    },
                  }}
                >
                  {symbol}
                </Button>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Indicateurs d'effets actifs */}
      {effects.shake > 0 && (
        <Alert severity="warning" sx={{ mt: 3, color:'#FE9' }}>
          💊 Les substances perturbent votre vision...
        </Alert>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
      `}</style>
    </Box>
  );
};

  // Rendu des résultats
  const renderResults = () => {
    if (!turnReport) return null;

    const totalRevenue = turnReport.donations + turnReport.revelationSales;

    return (
      <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
        <OnBoardingStep
  stepId="ceremony-done"
  condition={gameState.day === 2} // Jour 2 = vient de finir le jour 1
  message="Bravo ! Vous venez de terminer votre premier tour. Vous voyez ici le résultat : argent collecté, nouveaux adeptes recrutés passivement, événements survenus. Le recrutement est à nouveau disponible. Continuez à recruter, créer des révélations, et faire des cérémonies jusqu'à atteindre les conditions pour la Grande Ascension finale ! 🎭"
>
        <Typography variant="h4" sx={{ mb: 4, textAlign: 'center', color:'secondary.light',fontFamily: '"Cinzel", serif' }}>
          📊 Rapport du Jour {gameState.day}
        </Typography>
</OnBoardingStep>
        {ceremonySuccess ? (
          <Alert severity="success" sx={{ mb: 3 }} icon={<SuccessIcon />}>
            <Typography variant="h6">🎉 Cérémonie réussie !</Typography>
            <Typography variant="body2">L'ambiance était parfaite, les adeptes sont conquis</Typography>
          </Alert>
        ) : (
          <Alert severity="warning" sx={{ mb: 3 }} icon={<FailIcon />}>
            <Typography variant="h6">😕 Cérémonie moyenne...</Typography>
            <Typography variant="body2">Quelques ratés, mais ça passe</Typography>
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Finances */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: 'secondary.main' }}>
                  💰 Finances
                </Typography>
                <List>
                  <ListItem>
                    <Typography variant="body2" sx={{ flex: 1 }}>Dons des adeptes</Typography>
                    <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                      +${turnReport.donations.toLocaleString()}
                    </Typography>
                  </ListItem>
                  <ListItem>
                    <Typography variant="body2" sx={{ flex: 1 }}>Vente de révélations</Typography>
                    <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                      +${turnReport.revelationSales.toLocaleString()}
                    </Typography>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <Typography variant="body1" sx={{ flex: 1, fontWeight: 'bold' }}>Total</Typography>
                    <Typography variant="h6" sx={{ color: 'secondary.main', fontWeight: 'bold' }}>
                      +${totalRevenue.toLocaleString()}
                    </Typography>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Adeptes */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  👥 Adeptes
                </Typography>
                <List>
                  <ListItem>
                    <Typography variant="body2" sx={{ flex: 1 }}>Nouveaux recrutés</Typography>
                    <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                      +{turnReport.newRecruits}
                    </Typography>
                  </ListItem>
                  <ListItem>
                    <Typography variant="body2" sx={{ flex: 1 }}>Départs</Typography>
                    <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                      -{turnReport.departures.length}
                    </Typography>
                  </ListItem>
                  {turnReport.skepticalCount > 0 && (
                    <ListItem>
                      <Typography variant="body2" sx={{ flex: 1 }}>Devenus sceptiques</Typography>
                      <Typography variant="body2" sx={{ color: 'warning.main', fontWeight: 'bold' }}>
                        {turnReport.skepticalCount}
                      </Typography>
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Événements */}
          {turnReport.events.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    ⚡ Événements
                  </Typography>
                  {turnReport.events.map((event, idx) => (
                    <Alert key={idx} severity="info" sx={{ mb: 2 }}>
                      <Typography variant="subtitle2">{event.title}</Typography>
                      <Typography variant="body2">{event.description}</Typography>
                    </Alert>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={returnToDashboard}
            sx={{
              minWidth: 250,
              background: 'linear-gradient(45deg, #9c27b0, #ba68c8)',
            }}
          >
            Retour au Cercle
          </Button>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ py: 4, minHeight: '80vh' }}>
      {phase === 'preparation' && renderPreparation()}
      {phase === 'ritual' && renderRitual()}
      {phase === 'results' && renderResults()}
    </Box>
  );
};

export default CeremonyView;