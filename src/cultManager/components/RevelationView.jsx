import React, { useState, useEffect } from 'react';
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
  TextField,
  Divider,
  IconButton,
  List,
  ListItem,
  Fade,
  Grow,
} from '@mui/material';
import {
  AutoStories as BookIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Visibility as EyeIcon,
  AttachMoney as MoneyIcon,
  FavoriteBorder as HeartIcon,
  Warning as WarningIcon,
  Lightbulb as IdeaIcon,
} from '@mui/icons-material';
import {
  REVELATION_THEMES,
  INTENSITY_LEVELS,
  createRevelation,
  generateRevelationTitle,
  getRevelationAdvice,
} from '../data/revelations';
import { OnBoardingStep } from '../../OnBoardingContext';

const RevelationView = ({ gameState, setGameState, onBack }) => {
  const [selectedTheme, setSelectedTheme] = useState('apocalypse');
  const [selectedIntensity, setSelectedIntensity] = useState('modere');
  const [customTitle, setCustomTitle] = useState('');
  const [preview, setPreview] = useState(null);
  const [showAdvice, setShowAdvice] = useState(true);

  // Génère un aperçu de la révélation
  useEffect(() => {
    const rev = createRevelation(selectedTheme, selectedIntensity);
    const title = customTitle.trim() || generateRevelationTitle(selectedTheme, selectedIntensity);
    setPreview({ ...rev, title });
  }, [selectedTheme, selectedIntensity, customTitle]);

  // Sauvegarde la révélation
  const handleSaveRevelation = () => {
    if (!preview) return;

    const revelation = {
      ...preview,
      createdDay: gameState.day,
    };

    setGameState(prev => ({
      ...prev,
      revelations: [...prev.revelations, revelation],
    }));

    // Reset
    setCustomTitle('');
    setSelectedIntensity('modere');
    
    // Message de confirmation
    setTimeout(() => {
      // On pourrait ajouter un toast ici
    }, 100);
  };

  // Supprime une révélation
  const handleDeleteRevelation = (revId) => {
    setGameState(prev => ({
      ...prev,
      revelations: prev.revelations.filter(r => r.id !== revId),
    }));
  };

  const advice = gameState.followers.length > 0 
    ? getRevelationAdvice(gameState.followers) 
    : [];

  const themeData = REVELATION_THEMES[selectedTheme];
  const intensityData = INTENSITY_LEVELS[selectedIntensity];

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 4 }}>
      {/* Header */}

      {/* Bouton retour */}
      <Box sx={{ textAlign: 'center', mt: 4, position:'absolute', top:10, left:10 }}>
        <Button
          variant="outlined"
          onClick={onBack}
          sx={{ minWidth: 200, color:'#FEA' }}
        >
          Retour au Cercle
        </Button>
      </Box>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, color:'#bbb', fontFamily: '"Cinzel", serif' }}>
          📖 Écriture de Révélations
        </Typography>
        <OnBoardingStep
  stepId="revelation"
  condition={gameState.revelations.length === 0}
  message="Les Révélations sont des 'vérités divines' que vous vendrez à vos adeptes lors des cérémonies. Plus c'est intense, plus c'est cher... mais plus c'est risqué (scepticisme). Créez-en au moins une avant votre première cérémonie !"
>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Créez des "vérités divines" à vendre lors des cérémonies
        </Typography>
        </OnBoardingStep>
      </Box>

      <Grid container spacing={3}>
        {/* Colonne gauche : Création */}
        <Grid item xs={12} md={7}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <IdeaIcon sx={{ mr: 1, color: 'secondary.main' }} />
                Nouvelle Révélation
              </Typography>

              {/* Choix du thème */}
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                1. Choisissez un thème
              </Typography>
              <Grid container spacing={1} sx={{ mb: 3 }}>
                {Object.entries(REVELATION_THEMES).map(([key, theme]) => (
                  <Grid item xs={6} sm={4} key={key}>
                    <Button
                      fullWidth
                      variant={selectedTheme === key ? 'contained' : 'outlined'}
                      onClick={() => setSelectedTheme(key)}
                      sx={{
                        py: 1.5,
                        backgroundColor: selectedTheme === key ? theme.color : 'transparent',
                        borderColor: theme.color,
                        color: selectedTheme === key ? '#fff' : theme.color,
                        '&:hover': {
                          backgroundColor: selectedTheme === key ? theme.color : `${theme.color}22`,
                          borderColor: theme.color,
                        },
                      }}
                    >
                      <Box>
                        <Typography sx={{ fontSize: '1.5rem', mb: 0.5 }}>
                          {theme.icon}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          {theme.name}
                        </Typography>
                      </Box>
                    </Button>
                  </Grid>
                ))}
              </Grid>

              {/* Choix de l'intensité */}
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                2. Choisissez l'intensité
              </Typography>
              <Grid container spacing={1} sx={{ mb: 3 }}>
                {Object.entries(INTENSITY_LEVELS).map(([key, intensity]) => (
                  <Grid item xs={6} sm={3} key={key}>
                    <Button
                      fullWidth
                      variant={selectedIntensity === key ? 'contained' : 'outlined'}
                      onClick={() => setSelectedIntensity(key)}
                      sx={{
                        py: 2,
                        flexDirection: 'column',
                        backgroundColor: selectedIntensity === key ? 'primary.main' : 'transparent',
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {intensity.name}
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.65rem', opacity: 0.8 }}>
                        {intensity.description}
                      </Typography>
                    </Button>
                  </Grid>
                ))}
              </Grid>

              {/* Titre personnalisé (optionnel) */}
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                3. Titre (optionnel)
              </Typography>
              <TextField
                fullWidth
                placeholder={`Ex: ${generateRevelationTitle(selectedTheme, selectedIntensity)}`}
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                sx={{ mb: 3 }}
                helperText="Laissez vide pour un titre auto-généré"
              />

              {/* Aperçu */}
              {preview && (
                <Grow in>
                  <Paper
                    sx={{
                      p: 3,
                      mb: 3,
                      background: `linear-gradient(135deg, ${themeData.color}22 0%, transparent 100%)`,
                      border: `2px solid ${themeData.color}`,
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 1, color: themeData.color }}>
                      {themeData.icon} {preview.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontStyle: 'italic', mb: 2, color: 'text.secondary' }}
                    >
                      "{preview.text}"
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <MoneyIcon sx={{ color: 'secondary.main', mb: 0.5 }} />
                          <Typography variant="h6" sx={{ color: 'secondary.main' }}>
                            ${preview.price}
                          </Typography>
                          <Typography variant="caption">Prix de vente</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <HeartIcon sx={{ color: 'success.main', mb: 0.5 }} />
                          <Typography variant="h6" sx={{ color: 'success.main' }}>
                            +{preview.devotionBoost}%
                          </Typography>
                          <Typography variant="caption">Dévotion</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <WarningIcon sx={{ color: 'error.main', mb: 0.5 }} />
                          <Typography variant="h6" sx={{ color: 'error.main' }}>
                            {preview.skepticismRisk}%
                          </Typography>
                          <Typography variant="caption">Risque</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grow>
              )}

              {/* Bouton de sauvegarde */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={handleSaveRevelation}
                sx={{
                  py: 1.5,
                  background: `linear-gradient(45deg, ${themeData.color}, ${themeData.color}cc)`,
                  '&:hover': {
                    background: `linear-gradient(45deg, ${themeData.color}cc, ${themeData.color})`,
                  },
                }}
              >
                Sauvegarder cette Révélation
              </Button>
            </CardContent>
          </Card>

          {/* Conseils stratégiques */}
          {advice.length > 0 && showAdvice && (
            <Fade in>
              <Alert
                severity="info"
                icon={<IdeaIcon />}
                onClose={() => setShowAdvice(false)}
                sx={{ mb: 3 }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  💡 Conseils stratégiques
                </Typography>
                {advice.map((tip, idx) => (
                  <Typography key={idx} variant="body2" sx={{ mb: 0.5 }}>
                    {tip}
                  </Typography>
                ))}
              </Alert>
            </Fade>
          )}
        </Grid>

        {/* Colonne droite : Bibliothèque de révélations */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <BookIcon sx={{ mr: 1, color: 'secondary.main' }} />
                Vos Révélations ({gameState.revelations.length})
              </Typography>

              {gameState.revelations.length === 0 ? (
                <Paper
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    bgcolor: 'rgba(156, 39, 176, 0.1)',
                    border: '2px dashed rgba(156, 39, 176, 0.3)',
                  }}
                >
                  <BookIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Aucune révélation créée pour le moment.
                    <br />
                    Créez votre première "vérité divine" !
                  </Typography>
                </Paper>
              ) : (
                <List sx={{ maxHeight: 600, overflow: 'auto' }}>
                  {gameState.revelations.map((rev) => (
                    <ListItem
                      key={rev.id}
                      sx={{
                        mb: 2,
                        flexDirection: 'column',
                        alignItems: 'stretch',
                        bgcolor: 'background.paper',
                        border: `1px solid ${rev.themeColor}44`,
                        borderRadius: 1,
                        p: 2,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" sx={{ color: rev.themeColor, fontWeight: 'bold' }}>
                            {rev.themeIcon} {rev.title}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                            {rev.themeName} • {rev.intensityName} • Jour {rev.createdDay}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteRevelation(rev.id)}
                          sx={{ color: 'error.main' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>

                      <Typography
                        variant="body2"
                        sx={{ fontStyle: 'italic', mb: 2, color: 'text.secondary', fontSize: '0.85rem' }}
                      >
                        "{rev.text}"
                      </Typography>

                      <Grid container spacing={1}>
                        <Grid item xs={4}>
                          <Chip
                            icon={<MoneyIcon style={{ fontSize: 14 }} />}
                            label={`$${rev.price}`}
                            size="small"
                            sx={{ bgcolor: 'rgba(255, 215, 0, 0.2)', width: '100%' }}
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <Chip
                            icon={<HeartIcon style={{ fontSize: 14 }} />}
                            label={`+${rev.devotionBoost}%`}
                            size="small"
                            sx={{ bgcolor: 'rgba(76, 175, 80, 0.2)', width: '100%' }}
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <Chip
                            icon={<WarningIcon style={{ fontSize: 14 }} />}
                            label={`${rev.skepticismRisk}%`}
                            size="small"
                            sx={{ bgcolor: 'rgba(244, 67, 54, 0.2)', width: '100%' }}
                          />
                        </Grid>
                      </Grid>

                      {rev.soldCount > 0 && (
                        <Typography variant="caption" sx={{ color: 'success.main', mt: 1, display: 'block' }}>
                          ✓ Vendue {rev.soldCount} fois
                        </Typography>
                      )}
                    </ListItem>
                  ))}
                </List>
              )}

              {gameState.revelations.length > 0 && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    Vous pourrez vendre ces révélations lors de la prochaine cérémonie
                  </Typography>
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      

      {/* Bouton retour */}
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button
          variant="outlined"
          onClick={onBack}
          sx={{ minWidth: 200, color:'#FEA' }}
        >
          Retour au Cercle
        </Button>
      </Box>
    </Box>
  );
};

export default RevelationView;