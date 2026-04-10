import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  Paper,
  LinearProgress,
  Grid,
  Fade,
  Grow,
  Alert,
  Collapse,
} from '@mui/material';
import {
  CheckCircle as AcceptIcon,
  Cancel as RejectIcon,
  AttachMoney as MoneyIcon,
  Psychology as BrainIcon,
  FavoriteBorder as HeartIcon,
  Warning as WarningIcon,
  Visibility as EyeIcon,
  CheckCircle,
} from '@mui/icons-material';
import { generateCultists, calculateRecruitmentCost } from '../utils/cultistFactory';
import { OnBoardingStep } from '../../OnBoardingContext';

/**
 * Phrases de pitch selon le trait
 * Le joueur choisit celle qui lui semble la plus appropriée
 */
const PITCH_PHRASES = {
  curieux: [
    "Nous détenons des savoirs anciens que la science refuse d'admettre...",
    "Rejoignez-nous pour percer les mystères de l'univers",
    "Vous cherchez la vérité ? Elle est ici, cachée aux profanes",
    "Seuls les esprits ouverts peuvent comprendre notre message",
  ],
  seul: [
    "Vous n'êtes plus seul(e). Nous sommes votre nouvelle famille",
    "Ici, tout le monde se soutient. Personne n'est laissé de côté",
    "Rejoignez une communauté qui vous comprend vraiment",
    "Enfin un endroit où vous avez votre place",
  ],
  vulnerable: [
    "Nous vous protégerons. Ici, vous êtes en sécurité",
    "Laissez-nous prendre soin de vous. Vous le méritez",
    "Tous vos problèmes disparaîtront. Faites-nous confiance",
    "Nous savons ce dont vous avez besoin. Suivez-nous",
  ],
  decuReligion: [
    "Les institutions vous ont trahi. Nous sommes différents",
    "La vraie spiritualité n'a pas besoin d'églises corrompues",
    "Retrouvez une foi authentique, loin des dogmes hypocrites",
    "Vous cherchiez Dieu ? Il nous parle directement",
  ],
  rebelle: [
    "Ensemble, nous renverserons l'ordre établi",
    "Rejoignez la résistance spirituelle contre le système",
    "Nous sommes l'avant-garde d'une nouvelle ère",
    "Le chaos actuel cache une vérité révolutionnaire",
  ],
  idealiste: [
    "Vous voulez changer le monde ? Commencez ici",
    "Ensemble, nous bâtirons l'utopie que vous imaginez",
    "Votre vision d'un monde meilleur deviendra réalité",
    "Nous sommes la seule vraie solution aux problèmes de l'humanité",
  ],
  desespere: [
    "Il y a encore de l'espoir. Nous vous le montrerons",
    "Votre vie a un sens. Laissez-nous vous le révéler",
    "Vous n'avez plus rien à perdre. Tentez cette dernière chance",
    "La lumière existe même dans les ténèbres. Suivez-nous",
  ],
  ambitieux: [
    "Ici, votre potentiel sera enfin reconnu",
    "Vous méritez mieux. Nous pouvons vous l'offrir",
    "Devenez quelqu'un d'important dans notre organisation",
    "Le pouvoir et l'influence que vous cherchez sont à portée de main",
  ],
  naif: [
    "Nous sommes les gentils. Les autres vous mentent",
    "Tout le monde ici est sincère et bienveillant",
    "Vous pouvez nous faire confiance aveuglément",
    "Rejoignez-nous, c'est pour votre bien",
  ],
  manipulable: [
    "Vous allez adorer ce que nous faisons. Tout le monde adore",
    "Les personnes intelligentes comme vous comprennent vite",
    "Vous ne voudriez pas décevoir ceux qui croient en vous ?",
    "C'est la meilleure décision que vous puissiez prendre. Vraiment",
  ],
};

/**
 * Efficacité du pitch selon le trait
 * Certaines phrases marchent mieux que d'autres
 */
const calculatePitchSuccess = (trait, pitchIndex) => {
  // Chaque phrase a un taux de base (60-90%)
  const baseRates = [70, 80, 75, 85];
  
  // Modificateurs selon le trait (certains traits sont plus faciles)
  const traitDifficulty = {
    desespere: 1.2,
    vulnerable: 1.15,
    naif: 1.1,
    manipulable: 1.1,
    seul: 1.05,
    curieux: 1,
    idealiste: 1,
    rebelle: 0.9,
    decuReligion: 0.85,
    ambitieux: 0.8,
  };
  
  const difficulty = traitDifficulty[trait] || 1;
  const baseRate = baseRates[pitchIndex] || 75;
  
  return Math.min(95, Math.round(baseRate * difficulty));
};

const RecruitmentView = ({ gameState, setGameState, onBack }) => {
  const [candidates, setCandidates] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPitchChoice, setShowPitchChoice] = useState(false);
  const [sessionStats, setSessionStats] = useState({ recruited: 0, rejected: 0, failed: 0 });
  const [result, setResult] = useState(null);

  // Génération de 3 candidats au début
  useEffect(() => {
    const lastId = Math.max(
      ...gameState.followers.map(f => f.id),
      0
    );
    const newCandidates = generateCultists(3, lastId + 1);
    setCandidates(newCandidates);
  }, []);

  const currentCandidate = candidates[currentIndex];
  const isLastCandidate = currentIndex >= candidates.length - 1;

  // Refuser directement
  const handleReject = () => {
    setResult({ type: 'rejected', candidate: currentCandidate });
    setSessionStats(prev => ({ ...prev, rejected: prev.rejected + 1 }));
    
    setTimeout(() => {
      if (isLastCandidate) {
        endSession();
      } else {
        setCurrentIndex(prev => prev + 1);
        setResult(null);
      }
    }, 1000);
  };

  // Tenter de recruter (affiche les choix de pitch)
  const handleAttemptRecruit = () => {
    const cost = calculateRecruitmentCost(currentCandidate);
    
    if (gameState.treasury < cost) {
      setResult({ type: 'noMoney', cost });
      setTimeout(() => setResult(null), 1500);
      return;
    }
    
    setShowPitchChoice(true);
  };

  // Choix d'un pitch
  const handlePitchChoice = (pitchIndex) => {
    const cost = calculateRecruitmentCost(currentCandidate);
    const successRate = calculatePitchSuccess(currentCandidate.trait, pitchIndex);
    const success = Math.random() * 100 < successRate;

    if (success) {
      // Recrutement réussi !
      const newFollower = {
        ...currentCandidate,
        joinedDay: gameState.day,
      };

      setGameState(prev => ({
        ...prev,
        treasury: prev.treasury - cost,
        followers: [...prev.followers, newFollower],
        notoriety: Math.min(100, prev.notoriety + 1), // +1% notoriété par recrue
      }));

      setResult({ type: 'success', candidate: currentCandidate, cost });
      setSessionStats(prev => ({ ...prev, recruited: prev.recruited + 1 }));
    } else {
      // Échec du recrutement (mais paiement quand même)
      setGameState(prev => ({
        ...prev,
        treasury: prev.treasury - cost,
      }));

      setResult({ type: 'failed', candidate: currentCandidate, cost });
      setSessionStats(prev => ({ ...prev, failed: prev.failed + 1 }));
    }

    setShowPitchChoice(false);
    
    setTimeout(() => {
      if (isLastCandidate) {
        endSession();
      } else {
        setCurrentIndex(prev => prev + 1);
        setResult(null);
      }
    }, 1500);
  };

  // Fin de session
  const endSession = () => {
    setGameState(prev => ({
      ...prev,
      recruitmentSessionUsed: true,
    }));
    setTimeout(() => {
      onBack();
    }, 1000);
  };

  if (!currentCandidate) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5">Chargement des profils...</Typography>
      </Box>
    );
  }

  const recruitmentCost = calculateRecruitmentCost(currentCandidate);
  const canAfford = gameState.treasury >= recruitmentCost;

  // Couleur du trait
  const getTraitColor = (trait) => {
    const colors = {
      curieux: '#9c27b0',
      seul: '#3f51b5',
      vulnerable: '#f44336',
      decuReligion: '#ff9800',
      rebelle: '#e91e63',
      idealiste: '#4caf50',
      desespere: '#607d8b',
      ambitieux: '#ffd700',
      naif: '#00bcd4',
      manipulable: '#795548',
    };
    return colors[trait] || '#757575';
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', py: 1 }}>
      {/* Header */}
      
      <Box sx={{ textAlign: 'center', mb: 1 }}>
        <Typography variant="h4" sx={{ mb: 1, color:'#aaa',fontFamily: '"Cinzel", serif' }}>
          🎭 Session de Recrutement
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Profil {currentIndex + 1} / {candidates.length}
        </Typography>
        
        {/* Stats de session */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 1 }}>
          <Chip
            icon={<CheckCircle style={{ color: '#4caf50' }} />}
            label={`Recrutés: ${sessionStats.recruited}`}
            size="small"
            sx={{ bgcolor: 'rgba(76, 175, 80, 0.2)' }}
          />
          <Chip
            icon={<RejectIcon style={{ color: '#f44336' }} />}
            label={`Refusés: ${sessionStats.rejected}`}
            size="small"
            sx={{ bgcolor: 'rgba(244, 67, 54, 0.2)' }}
          />
          <Chip
            icon={<WarningIcon style={{ color: '#ff9800' }} />}
            label={`Échecs: ${sessionStats.failed}`}
            size="small"
            sx={{ bgcolor: 'rgba(255, 152, 0, 0.2)' }}
          />
        </Box>
      </Box>
      {/* Carte du candidat */}
      <Collapse in={!showPitchChoice && !result} timeout={500}>
        <Card
          sx={{
            maxWidth: 500,
            mx: 'auto',
            mb: 1,
            background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
            border: `2px solid ${getTraitColor(currentCandidate.trait)}`,
          }}
        >
          <CardContent>
            {/* Avatar et nom */}
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography sx={{ fontSize: '4rem', mb: 1 }}>
                {currentCandidate.emoji}
              </Typography>
              <OnBoardingStep
  stepId="recruit"
  condition={!gameState.recruitmentSessionUsed && gameState.day === 1}
  message="Vous pouvez recruter jusqu'à 3 candidats par session (1 session par tour). Choisissez un pitch adapté à leur profil pour maximiser vos chances. Attention au coût !"
>
              <Typography variant="h5" sx={{ fontFamily: '"Cinzel", serif', mb: 1 }}>
                {currentCandidate.name}
              </Typography>
              </OnBoardingStep>
              <Chip
                label={currentCandidate.trait}
                sx={{
                  backgroundColor: getTraitColor(currentCandidate.trait),
                  color: 'white',
                  fontWeight: 'bold',
                }}
              />
            </Box>

            {/* Description */}
            <Paper sx={{ p: 2, mb: 3, bgcolor: 'rgba(0,0,0,0.3)' }}>
              <Typography
                variant="body2"
                sx={{ fontStyle: 'italic', color: 'text.secondary', textAlign: 'center' }}
              >
                "{currentCandidate.description}"
              </Typography>
            </Paper>

            {/* Stats visibles */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <HeartIcon sx={{ color: 'error.main', fontSize: 20 }} />
                  <Typography variant="caption" display="block">Dévotion</Typography>
                  <Typography variant="h6">{currentCandidate.devotion}%</Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <BrainIcon sx={{ color: 'info.main', fontSize: 20 }} />
                  <Typography variant="caption" display="block">Sanité</Typography>
                  <Typography variant="h6">{currentCandidate.sanity}%</Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <MoneyIcon sx={{ color: 'secondary.main', fontSize: 20 }} />
                  <Typography variant="caption" display="block">Richesse</Typography>
                  <Typography variant="h6" sx={{ color: 'secondary.main' }}>
                    ${(currentCandidate.wealth / 1000).toFixed(0)}k
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <WarningIcon sx={{ color: 'warning.main', fontSize: 20 }} />
                  <Typography variant="caption" display="block">Suspicion</Typography>
                  <Typography variant="h6">{currentCandidate.suspicion}%</Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Coût de recrutement */}
            <Alert
              severity={canAfford ? "info" : "error"}
              icon={<MoneyIcon />}
              sx={{ mb: 2 }}
            >
              <Typography variant="body2">
                Coût de recrutement: <strong>${recruitmentCost}</strong>
              </Typography>
              {!canAfford && (
                <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                  Fonds insuffisants (${gameState.treasury} disponibles)
                </Typography>
              )}
            </Alert>

            {/* Boutons d'action */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                color="error"
                size="large"
                startIcon={<RejectIcon />}
                onClick={handleReject}
              >
                Refuser
              </Button>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                startIcon={<AcceptIcon />}
                onClick={handleAttemptRecruit}
                disabled={!canAfford}
              >
                Recruter
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Collapse>

      {/* Choix de pitch */}
      {showPitchChoice && (
        <Fade in timeout={500}>
          <Box>
            <Typography variant="h6" sx={{ textAlign: 'center', mb: 3, fontFamily: '"Cinzel", serif' }}>
              Choisissez votre approche
            </Typography>
            <Grid container spacing={2}>
              {PITCH_PHRASES[currentCandidate.trait].map((phrase, index) => {
                const successRate = calculatePitchSuccess(currentCandidate.trait, index);
                return (
                  <Grid item xs={12} key={index}>
                    <Paper
                      onClick={() => handlePitchChoice(index)}
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        border: '1px solid rgba(156, 39, 176, 0.3)',
                        '&:hover': {
                          borderColor: 'primary.main',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(156, 39, 176, 0.4)',
                        },
                      }}
                    >
                      <Typography variant="body1" sx={{ mb: 1, fontStyle: 'italic' }}>
                        "{phrase}"
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={successRate}
                          sx={{ flex: 1, height: 6, borderRadius: 1 }}
                          color={successRate >= 80 ? 'success' : successRate >= 65 ? 'warning' : 'error'}
                        />
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {successRate}% chances
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setShowPitchChoice(false)}
              sx={{ mt: 2 }}
            >
              Annuler
            </Button>
          </Box>
        </Fade>
      )}

      {/* Résultats */}
      {result && (
        <Fade in timeout={500}>
          <Alert
            severity={
              result.type === 'success' ? 'success' :
              result.type === 'rejected' ? 'info' :
              result.type === 'noMoney' ? 'warning' :
              'error'
            }
            sx={{ maxWidth: 500, mx: 'auto' }}
          >
            {result.type === 'success' && (
              <>
                <Typography variant="h6">🎉 Recrutement réussi !</Typography>
                <Typography variant="body2">
                  {result.candidate.name} rejoint le Cercle Intérieur (coût: ${result.cost})
                </Typography>
              </>
            )}
            {result.type === 'failed' && (
              <>
                <Typography variant="h6">❌ Recrutement échoué</Typography>
                <Typography variant="body2">
                  {result.candidate.name} a refusé votre offre... (perte: ${result.cost})
                </Typography>
              </>
            )}
            {result.type === 'rejected' && (
              <Typography variant="h6">
                ↩️ Vous avez rejeté {result.candidate.name}
              </Typography>
            )}
            {result.type === 'noMoney' && (
              <Typography variant="h6">
                💰 Fonds insuffisants (besoin de ${result.cost})
              </Typography>
            )}
          </Alert>
        </Fade>
      )}

      {isLastCandidate && result && (
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Session terminée. Retour au dashboard...
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default RecruitmentView;