import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    Paper,
    Divider,
    Container,
    Chip,
} from '@mui/material';
import {
    Person as PersonIcon,
    AttachMoney as MoneyIcon,
    Visibility as EyeIcon,
    LocalPolice as PoliceIcon,
    AutoStories as BookIcon,
    Celebration as CelebrationIcon,
    FlashOn as FlashIcon,
    Add as AddIcon,
    Settings,
} from '@mui/icons-material';
import FollowerCard from './FollowerCard';
import { useState } from 'react';
import { OnBoardingStep } from '../../OnBoardingContext';



export const CultDashboard = ({ gameState, setView, openActionModal, openDetailModal }) => {
    const [followerFilter, setFollowerFilter] = useState('all');
    // Gestionnaire d'actions sur un follower
    const handleFollowerAction = (actionType, follower) => {
        openActionModal(actionType, follower);
    };
    const filterFollowers = (followers) => {
        switch (followerFilter) {
            case 'high-devotion': return followers.filter(f => f.devotion >= 70);
            case 'at-risk': return followers.filter(f => f.suspicion >= 60 || f.sanity <= 30);
            case 'wealthy': return followers.filter(f => f.wealth >= 80000);
            case 'recruits': return followers.filter(f => !f.isBase); // Ceux du pool
            default: return followers;
        }
    };
    const filteredFollowers = filterFollowers(gameState.followers);
    const totalDevotionAvg = gameState.followers.length > 0
        ? Math.round(gameState.followers.reduce((sum, f) => sum + f.devotion, 0) / gameState.followers.length)
        : 0;

    const totalWealthPotential = gameState.followers.reduce((sum, f) => sum + f.wealth, 0);

    return <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header avec titre mystique */}
          <OnBoardingStep 
  stepId="welcome" 
  message="Bienvenue, Grand Maître ! Vous venez de fonder votre secte spirituelle. Votre objectif : recruter des adeptes, les manipuler, et amasser fortune et pouvoir... jusqu'à la Grande Ascension finale. 🎭"
><Box/></OnBoardingStep>
        <Box
            sx={{
                textAlign: 'center',
                mb: 4,
                pb: 3,
                borderBottom: '2px solid',
                borderImage: 'linear-gradient(90deg, transparent, #ffd700, transparent) 1',
            }}
        >
          <OnBoardingStep
  stepId="dashboard"
  condition={gameState.day === 1}
  message="Voici votre tableau de bord. Vous y verrez vos stats globales, vos adeptes, et pourrez lancer différentes actions."
>
            <Typography
                variant="h3"
                sx={{
                    background: 'linear-gradient(45deg, #9c27b0, #ffd700)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1,
                }}
            >
                ✧ LE CERCLE INTÉRIEUR ✧
            </Typography>
            </OnBoardingStep>
            <Typography variant="body1" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                Jour {gameState.day} de l'Éveil
            </Typography>
        </Box>

        {/* Stats globales */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
               
    <Paper
                    sx={{
                        p: 3,
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                        border: '1px solid rgba(255, 215, 0, 0.3)',
                    }}
                >
                    <MoneyIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                    <Typography variant="h4" sx={{ color: 'secondary.main', fontWeight: 'bold' }}>
                        ${gameState.treasury.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                        Trésor Sacré
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'secondary.light', display: 'block', mt: 1 }}>
                        Potentiel: ${(totalWealthPotential / 1000).toFixed(0)}k
                    </Typography>
                </Paper>
            </Grid>

            <Grid item xs={12} md={3}>
                <Paper
                    sx={{
                        p: 3,
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                        border: '1px solid rgba(156, 39, 176, 0.3)',
                    }}
                >
                    <PersonIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                        {gameState.followers.length}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                        Âmes Éveillées
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'primary.light', display: 'block', mt: 1 }}>
                        Dévotion moy.: {totalDevotionAvg}%
                    </Typography>
                </Paper>
            </Grid>

            <Grid item xs={12} md={3}>
                 
                <Paper
                    sx={{
                        p: 3,
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                        border: '1px solid rgba(33, 150, 243, 0.3)',
                    }}
                >
                    <OnBoardingStep
  stepId="stats"
  condition={gameState.day === 1}
  message="Ces 4 stats sont cruciales : le Trésor (votre argent), les Adeptes (votre force), la Notoriété (visibilité médiatique, double tranchant) et le Heat (pression policière, à ne JAMAIS laisser atteindre 100% !)."
>
                    <EyeIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                    <Typography variant="h4" sx={{ color: 'info.main', fontWeight: 'bold' }}>
                        {gameState.notoriety}%
                    </Typography>
                </OnBoardingStep>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                        Notoriété
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'info.light', display: 'block', mt: 1 }}>
                        Visibilité médiatique
                    </Typography>
                </Paper>
            </Grid>

            <Grid item xs={12} md={3}>
                <Paper
                    sx={{
                        p: 3,
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                        border: `1px solid ${gameState.heat >= 80 ? 'rgba(211, 47, 47, 0.5)' : 'rgba(255, 111, 0, 0.3)'}`,
                    }}
                >
                    <PoliceIcon sx={{ fontSize: 40, color: gameState.heat >= 80 ? 'error.main' : 'warning.main', mb: 1 }} />
                    <Typography
                        variant="h4"
                        sx={{ color: gameState.heat >= 80 ? 'error.main' : 'warning.main', fontWeight: 'bold' }}
                    >
                        {gameState.heat}%
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                        Pression Policière
                    </Typography>
                    {gameState.heat >= 80 && (
                        <Typography variant="caption" sx={{ color: 'error.main', display: 'block', mt: 1 }}>
                            ⚠️ DANGER IMMINENT
                        </Typography>
                    )}
                </Paper>
            </Grid>
        </Grid>

        {/* Actions principales */}
       
        <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
                 <OnBoardingStep
  stepId="actions"
  condition={gameState.day === 1}
  message="Voici vos actions disponibles. Commencez par Recruter quelques adeptes, puis créez des Révélations (doctrines à vendre). Quand vous êtes prêt, lancez une Cérémonie pour passer au tour suivant !"
><Box/>
                </OnBoardingStep>
                <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={<AddIcon />}
                    onClick={() => setView('recruit')}
                    disabled={gameState.recruitmentSessionUsed}
                    sx={{
                        py: 2,
                        background: gameState.recruitmentSessionUsed
                            ? 'rgba(156, 39, 176, 0.3)'
                            : 'linear-gradient(45deg, #9c27b0, #ba68c8)',
                        '&:hover': {
                            background: gameState.recruitmentSessionUsed
                                ? 'rgba(156, 39, 176, 0.3)'
                                : 'linear-gradient(45deg, #7b1fa2, #9c27b0)',
                        },
                    }}
                >
                    {gameState.recruitmentSessionUsed ? 'Recruté ✓' : 'Recruter'}
                </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
                <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={<BookIcon />}
                    onClick={() => setView('revelation')}
                    sx={{
                        py: 2,
                        background: 'linear-gradient(45deg, #ffd700, #ffed4e)',
                        color: '#000',
                        '&:hover': {
                            background: 'linear-gradient(45deg, #c7a600, #ffd700)',
                        },
                    }}
                >
                    Révélation
                </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
                <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={<CelebrationIcon />}
                    onClick={() => setView('ceremony')}
                    sx={{
                        py: 2,
                        background: 'linear-gradient(45deg, #ff6f00, #ff9800)',
                        '&:hover': {
                            background: 'linear-gradient(45deg, #e65100, #ff6f00)',
                        },
                    }}
                >
                    Cérémonie
                </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
                <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={<FlashIcon />}
                    onClick={() => setView('ascension')}
                    disabled={gameState.followers.length < 10 || gameState.heat < 50|| gameState.notoriety < 50}
                    sx={{
                        py: 2,
                        background: 'linear-gradient(45deg, #d32f2f, #f44336)',
                        '&:hover': {
                            background: 'linear-gradient(45deg, #b71c1c, #d32f2f)',
                        },
                    }}
                >
                    Fin des Temps
                </Button>
            </Grid>
        </Grid>
        
        <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12}>
                <Typography variant="h6" color="secondary.light">⚡ Actions Spéciales</Typography>
            </Grid>

            {/* Actions COLLECTIVES */}
            <Grid item xs={12} sm={6} md={3}>
                <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={<Settings />}
                    onClick={() => setView('management')}
                    sx={{
                        py: 2,
                        background: 'linear-gradient(45deg, #3f51b5, #5c6bc0)',
                        '&:hover': {
                            background: 'linear-gradient(45deg, #303f9f, #3f51b5)',
                        },
                    }}
                >
                    Management
                </Button>
            </Grid>
        </Grid>

        {/* Liste des adeptes */}
        <Box sx={{ mb: 4 }}>
             <OnBoardingStep
  stepId="followers"
  condition={gameState.day === 1}
  message="Vos adeptes sont votre ressource principale. Chacun a des stats (Dévotion, Santé Mentale, Richesse, Suspicion) et des pouvoirs cachés à découvrir. Cliquez sur les icônes pour interagir avec eux."
>
            <Typography
                variant="h5"
                sx={{
                    mb: 3, color: 'rgb(229, 168, 136)',
                    display: 'flex',
                    alignItems: 'center',
                    fontFamily: '"Cinzel", serif',
                }}
            >
                <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                Les Élus ({gameState.followers.length})
            </Typography>
              </OnBoardingStep>
            <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label={`Tous (${gameState.followers.length})`} onClick={() => setFollowerFilter('all')}
                    color={followerFilter === 'all' ? 'primary' : 'default'} />
                <Chip label="Dévoués" onClick={() => setFollowerFilter('high-devotion')}
                    color={followerFilter === 'high-devotion' ? 'primary' : 'default'} />
                <Chip label="À risque" onClick={() => setFollowerFilter('at-risk')}
                    color={followerFilter === 'at-risk' ? 'error' : 'default'} />
                <Chip label="Fortunés" onClick={() => setFollowerFilter('wealthy')}
                    color={followerFilter === 'wealthy' ? 'secondary' : 'default'} />
                <Chip label="Recruteurs" onClick={() => setFollowerFilter('recruits')}
                    color={followerFilter === 'recruits' ? 'success' : 'default'} />
            </Box>
           
            <Grid container spacing={3}>
                {filteredFollowers.map((follower) => (
                    <Grid item xs={12} sm={6} md={4} key={follower.id}>
                        <FollowerCard gameState={gameState} 
                            openDetailModal={openDetailModal} handleFollowerAction={handleFollowerAction}
                            follower={follower} />
                    </Grid>
                ))}

                {gameState.followers.length === 0 && (
                    <Grid item xs={12}>
                        <Paper
                            sx={{
                                p: 4,
                                textAlign: 'center',
                                background: 'rgba(156, 39, 176, 0.1)',
                                border: '2px dashed rgba(156, 39, 176, 0.3)',
                            }}
                        >
                            <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
                                Le cercle est vide...
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                                Commencez par recruter vos premiers disciples
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => setView('recruit')}
                                sx={{
                                    background: 'linear-gradient(45deg, #9c27b0, #ba68c8)',
                                }}
                            >
                                Recruter maintenant
                            </Button>
                        </Paper>
                    </Grid>
                )}
            </Grid>
          
        </Box>

        {/* Section Révélations récentes */}
        {gameState.revelations.length > 0 && (
            <Box>
                <Typography
                    variant="h5"
                    sx={{
                        mb: 3,
                        display: 'flex', color:'rgb(228, 205, 121)',
                        alignItems: 'center',
                        fontFamily: '"Cinzel", serif',
                    }}
                >
                    <BookIcon sx={{ mr: 1, color: 'secondary.main' }} />
                    Révélations Récentes
                </Typography>

                <Grid container spacing={2}>
                    {gameState.revelations.slice(-3).reverse().map((rev, idx) => (
                        <Grid item xs={12} md={4} key={idx}>
                            <Card>
                                <CardContent>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            fontStyle: 'italic',
                                            color: 'primary.light',
                                            mb: 1,
                                        }}
                                    >
                                        "{rev.title}"
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontStyle: 'italic',
                                            color: 'secondary.light',
                                            mb: 1,
                                        }}
                                    >
                                        "{rev.text}"
                                    </Typography>
                                    <Divider sx={{ my: 1 }} />
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                        Jour {rev.day} • Impact: {rev.impact > 0 ? '+' : ''}{rev.impact}% dévotion
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        )}
    </Container>
};