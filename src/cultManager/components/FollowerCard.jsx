import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Typography,
  LinearProgress,
  Chip,
  CardActions,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  Psychology as BrainIcon,
  FavoriteBorder as HeartIcon,
  Warning as WarningIcon,
  School,
  Psychology,
  VolumeUp,
  Visibility,
} from '@mui/icons-material';
import { useEffect, useState } from 'react';

  // Card d'un adepte
  const FollowerCard = ({ gameState, follower , handleFollowerAction, openDetailModal}) => {
    const getAvatarColor = (trait) => {
      const colors = {
        Seeker: '#9c27b0',
        Lonely: '#3f51b5',
        Vulnerable: '#f44336',
        Rebellious: '#ff9800',
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
      return colors[follower.trait] || '#757575';
    };


      const [compactView, setCompactView] = useState(false);
      // Ouvre la modal de détails d'un adepte
  
    
    // Auto-switch en vue compacte si > 5 adeptes
    useEffect(() => {
      setCompactView(gameState.followers.length > 5);
    }, [gameState.followers.length]);
    // Card d'un adepte

  // VERSION COMPACTE
  if (compactView) {
    return (
      <Card sx={{ 
        p: 1.5, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1.5,
        cursor: 'pointer',
        '&:hover': { boxShadow: 4 }
      }}>
        <Typography sx={{ fontSize: '2rem' }}>{follower.emoji}</Typography>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', fontFamily: '"Cinzel", serif' }}>
            {follower.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
            <Chip 
              label={`${follower.devotion}%`} 
              size="small" 
              icon={<HeartIcon style={{ fontSize: 12 }} />} 
              sx={{ height: 20, fontSize: '0.7rem' }}
            />
            <Chip 
              label={`${follower.suspicion}%`} 
              size="small" 
              icon={<WarningIcon style={{ fontSize: 12 }} />} 
              sx={{ height: 20, fontSize: '0.7rem' }}
              color={follower.suspicion >= 70 ? 'error' : 'default'}
            />
            <Chip 
              label={`${follower.sanity}%`} 
              size="small" 
              icon={<BrainIcon style={{ fontSize: 12 }} />} 
              sx={{ height: 20, fontSize: '0.7rem' }}
            />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Cours particulier ($500)">
            <span>
              <IconButton 
                size="small" 
                onClick={(e) => { e.stopPropagation(); handleFollowerAction('private-session', follower); }}
                disabled={gameState.treasury < 500}
                sx={{ bgcolor: 'rgba(156, 39, 176, 0.1)' }}
              >
                <School fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Hypnose ($1000)">
            <span>
              <IconButton 
                size="small" 
                onClick={(e) => { e.stopPropagation(); handleFollowerAction('hypnosis', follower); }}
                disabled={gameState.treasury < 1000 || follower.revealed}
                sx={{ bgcolor: 'rgba(156, 39, 176, 0.1)' }}
              >
                <Psychology fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Messages subliminaux ($300)">
            <span>
              <IconButton 
                size="small" 
                onClick={(e) => { e.stopPropagation(); handleFollowerAction('subliminal', follower); }}
                disabled={gameState.treasury < 300}
                sx={{ bgcolor: 'rgba(156, 39, 176, 0.1)' }}
              >
                <VolumeUp fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
        <IconButton size="small" onClick={() => openDetailModal(follower)}>
          <Visibility fontSize="small" />
        </IconButton>
      </Card>
    );
  }

  // VERSION DÉTAILLÉE (garde ton code existant, mais ajoute les actions)
  return (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
    <CardHeader
          avatar={
            follower.emoji ? (
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  border: '2px solid',
                  borderColor: 'secondary.main',
                  bgcolor: 'rgba(0,0,0,0.2)',
                }}
              >
                {follower.emoji}
              </Box>
            ) : (
              <Avatar
                sx={{
                  bgcolor: getAvatarColor(follower.trait),
                  width: 56,
                  height: 56,
                  fontSize: '1.5rem',
                  border: '2px solid',
                  borderColor: 'secondary.main',
                }}
              >
                {follower.name.charAt(0)}
              </Avatar>
            )
          }
          title={
            <Typography variant="h6" sx={{ fontFamily: '"Cinzel", serif' }}>
              {follower.name}
            </Typography>
          }
          subheader={
            <Chip
              label={follower.trait}
              size="small"
              sx={{
                mt: 0.5,
                backgroundColor: getAvatarColor(follower.trait),
                color: 'white',
                fontSize: '0.7rem',
              }}
            />
          }
        />
        <CardContent>
          <StatBar
            label="Dévotion"
            value={follower.devotion}
            icon={<HeartIcon sx={{ fontSize: 16, color: 'error.main' }} />}
          />
          <StatBar
            label="Santé Mentale"
            value={follower.sanity}
            icon={<BrainIcon sx={{ fontSize: 16, color: 'info.main' }} />}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <MoneyIcon sx={{ fontSize: 16, color: 'secondary.main', mr: 0.5 }} />
              <Typography variant="body2" sx={{ color: 'secondary.main', fontFamily: '"Lato", sans-serif' }}>
                ${(follower.wealth / 1000).toFixed(0)}k
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <WarningIcon sx={{ fontSize: 16, color: 'warning.main', mr: 0.5 }} />
              <Typography variant="body2" sx={{ fontFamily: '"Lato", sans-serif' }}>
                Suspicion: {follower.suspicion}%
              </Typography>
            </Box>
          </Box>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mt: 1,
              color: 'text.secondary',
              fontFamily: '"Lato", sans-serif',
            }}
          >
            Jour {follower.joinedDay}
          </Typography>
        </CardContent>
      
     <CardActions sx={{ justifyContent: 'space-around', pt: 0 }}>
        <Tooltip title="Cours particulier ($500)">
          <span>
            <IconButton 
              size="small" 
              onClick={() => handleFollowerAction('private-session', follower)}
              disabled={gameState.treasury < 500}
            >
              <School fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Hypnose ($1000)">
          <span>
            <IconButton 
              size="small" 
              onClick={() => handleFollowerAction('hypnosis', follower)}
              disabled={gameState.treasury < 1000 || follower.revealed}
            >
              <Psychology fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Messages subliminaux ($300)">
          <span>
            <IconButton 
              size="small" 
              onClick={() => handleFollowerAction('subliminal', follower)}
              disabled={gameState.treasury < 300}
            >
              <VolumeUp fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Voir détails">
          <IconButton size="small" onClick={() => openDetailModal(follower)}>
            <Visibility fontSize="small" />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
};
  
  // Rendu de la stat bar
  const StatBar = ({ label, value, icon, max = 100, showValue = true }) => (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
        {icon}
        <Typography variant="body2" sx={{ ml: 1, flex: 1, fontFamily: '"Lato", sans-serif' }}>
          {label}
        </Typography>
        {showValue && (
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
            {value}/{max}
          </Typography>
        )}
      </Box>
      <LinearProgress
        variant="determinate"
        value={(value / max) * 100}
        color={getStatColor(value)}
        sx={{
          height: 8,
          borderRadius: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        }}
      />
    </Box>
  );
export default FollowerCard;

  const getStatColor = (value) => {
    if (value >= 70) return 'success';
    if (value >= 40) return 'warning';
    return 'error';
  };