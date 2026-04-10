import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Container,
  Alert,
} from '@mui/material';
import {
  Campaign as MediaIcon,
  Terrain as RetreatIcon,
  TrendingUp as StatsIcon,
} from '@mui/icons-material';

const ManagementView = ({ gameState, setGameState, onBack, openActionModal }) => {
  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>

      <Box sx={{ mt: 2, textAlign: 'center',position:'absolute',top:10, left:10, minWidth: 200  }}>
        <Button variant="outlined" onClick={onBack} sx={{color:'primary.light'}}>
          Retour au Cercle
        </Button>
      </Box>
      <Typography variant="h4" sx={{ mb: 4, color:'secondary.light', textAlign: 'center', fontFamily: '"Cinzel", serif' }}>
        ⚙️ Management de la Secte
      </Typography>

      <Grid container spacing={3}>
        {/* Événement médiatique */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <MediaIcon sx={{ mr: 1, color: 'info.main' }} />
                Événement Médiatique
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                Organisez une conférence publique pour attirer l'attention sur votre mouvement. 
                Risqué mais efficace pour gagner en notoriété.
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Chip label="Coût: $5,000" icon={<span>💰</span>} sx={{ mr: 1 }} />
                <Chip label="+15-25% notoriété" color="info" size="small" sx={{ mr: 1 }} />
                <Chip label="+5-10% heat" color="warning" size="small" />
              </Box>
              <Button
                fullWidth
                variant="contained"
                onClick={() => openActionModal('media-event')}
                disabled={gameState.treasury < 5000}
                sx={{ bgcolor: 'info.main' }}
              >
                Organiser
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Stage transcendantal */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <RetreatIcon sx={{ mr: 1, color: 'success.main' }} />
                Stage Transcendantal
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                Week-end de méditation intensive payant. Les participants deviennent plus dévoués 
                mais perdent en lucidité.
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Chip label="Revenus: $500/adepte" icon={<span>💵</span>} color="success" sx={{ mr: 1 }} />
                <Chip label="+10-20% dévotion" color="success" size="small" sx={{ mr: 1 }} />
                <Chip label="-10-20% sanité" color="error" size="small" />
              </Box>
              <Alert severity="info" sx={{ mb: 2, fontSize: '0.8rem' }}>
                Seulement les adeptes avec ≥40% de dévotion participent
              </Alert>
              <Button
                fullWidth
                variant="contained"
                onClick={() => openActionModal('retreat')}
                disabled={gameState.followers.filter(f => f.devotion >= 40).length === 0}
                sx={{ bgcolor: 'success.main' }}
              >
                Organiser ({gameState.followers.filter(f => f.devotion >= 40).length} participants)
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Stats du culte */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <StatsIcon sx={{ mr: 1, color: 'primary.main' }} />
                Statistiques du Culte
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">Jour</Typography>
                  <Typography variant="h6">{gameState.day}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">Adeptes dévoués (≥70%)</Typography>
                  <Typography variant="h6" color="success.main">
                    {gameState.followers.filter(f => f.devotion >= 70).length}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">Adeptes à risque (≥70% suspicion)</Typography>
                  <Typography variant="h6" color="error.main">
                    {gameState.followers.filter(f => f.suspicion >= 70).length}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">Richesse totale</Typography>
                  <Typography variant="h6" color="secondary.main">
                    ${(gameState.followers.reduce((sum, f) => sum + f.wealth, 0) / 1000).toFixed(0)}k
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button variant="outlined" onClick={onBack} sx={{color:'secondary.light', minWidth: 200 }}>
          Retour au Cercle
        </Button>
      </Box>
    </Container>
  );
};

export default ManagementView;