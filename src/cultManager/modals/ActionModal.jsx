import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  Alert,
  Grid,
  LinearProgress,
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  FavoriteBorder as HeartIcon,
  Psychology as BrainIcon,
  Warning as WarningIcon,
  AutoAwesome as PowerIcon,
} from '@mui/icons-material';
import {
  mediaEvent,
  transcendentalRetreat,
  privateSession,
  hypnosisSession,
  subliminalMessages,
} from '../utils/specialActions';

const ActionModal = ({ open, onClose, type, follower, gameState, setGameState }) => {
  const [result, setResult] = useState(null);

  if (!open) return null;

  // Modal de détails d'un adepte
  if (type === 'detail' && follower) {
    const powerKeys = follower.hiddenPower && follower.hiddenPower.length > 0 
      ? Object.keys(follower.hiddenPower[0]).filter(k => follower.hiddenPower[0][k] !== 0)
      : [];

    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center' }}>
          <Typography sx={{ fontSize: '3rem', mb: 1 }}>{follower.emoji}</Typography>
          <Typography variant="h5" sx={{ fontFamily: '"Cinzel", serif' }}>
            {follower.name}
          </Typography>
          <Chip 
            label={follower.trait} 
            sx={{ mt: 1, bgcolor: 'primary.main' }} 
          />
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 3, textAlign: 'center' }}>
            "{follower.description}"
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(244, 67, 54, 0.1)', borderRadius: 1 }}>
                <HeartIcon sx={{ color: 'error.main', mb: 1 }} />
                <Typography variant="h5">{follower.devotion}%</Typography>
                <Typography variant="caption">Dévotion</Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(33, 150, 243, 0.1)', borderRadius: 1 }}>
                <BrainIcon sx={{ color: 'info.main', mb: 1 }} />
                <Typography variant="h5">{follower.sanity}%</Typography>
                <Typography variant="caption">Santé Mentale</Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(255, 215, 0, 0.1)', borderRadius: 1 }}>
                <MoneyIcon sx={{ color: 'secondary.main', mb: 1 }} />
                <Typography variant="h5">${(follower.wealth / 1000).toFixed(0)}k</Typography>
                <Typography variant="caption">Richesse</Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(255, 152, 0, 0.1)', borderRadius: 1 }}>
                <WarningIcon sx={{ color: 'warning.main', mb: 1 }} />
                <Typography variant="h5">{follower.suspicion}%</Typography>
                <Typography variant="caption">Suspicion</Typography>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            📅 Rejoint le jour {follower.joinedDay}
          </Typography>

          {/* Hidden Powers */}
          {follower.revealed ? (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(156, 39, 176, 0.1)', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PowerIcon sx={{ mr: 1, color: 'primary.main' }} />
                Pouvoirs Cachés Révélés
              </Typography>
              {powerKeys.length > 0 ? (
                powerKeys.map(key => (
                  <Chip 
                    key={key} 
                    label={`${key}: ${follower.hiddenPower[0][key]}`} 
                    size="small" 
                    sx={{ mr: 0.5, mb: 0.5 }}
                  />
                ))
              ) : (
                <Typography variant="caption">Aucun pouvoir spécial</Typography>
              )}
            </Box>
          ) : (
            <Alert severity="info" sx={{ mt: 2 }}>
              🌀 Utilisez l'hypnose pour révéler les pouvoirs cachés
            </Alert>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Fermer</Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Modal d'actions
  const executeAction = () => {
    let actionResult;

    switch (type) {
      case 'media-event':
        actionResult = mediaEvent(gameState);
        break;
      case 'retreat':
        actionResult = transcendentalRetreat(gameState);
        break;
      case 'private-session':
        actionResult = privateSession(follower, gameState);
        break;
      case 'hypnosis':
        actionResult = hypnosisSession(follower, gameState);
        break;
      case 'subliminal':
        actionResult = subliminalMessages(follower, gameState);
        break;
      default:
        return;
    }

    if (!actionResult.success) {
      setResult({ success: false, message: actionResult.reason });
      return;
    }

    // Applique les changements
    let newGameState = { ...gameState };

    // Coût
    if (actionResult.cost) {
      newGameState.treasury -= actionResult.cost;
    }

    // Revenus
    if (actionResult.revenue) {
      newGameState.treasury += actionResult.revenue;
    }

    // Changements globaux
    if (actionResult.notorietyChange) {
      newGameState.notoriety = Math.min(100, newGameState.notoriety + actionResult.notorietyChange);
    }
    if (actionResult.heatChange) {
      newGameState.heat = Math.min(100, Math.max(0, newGameState.heat + actionResult.heatChange));
    }

    // Nouveaux followers
    if (actionResult.newFollowers) {
      newGameState.followers = [...newGameState.followers, ...actionResult.newFollowers];
    }

    // Changements sur un follower spécifique
    if (actionResult.followerId) {
      newGameState.followers = newGameState.followers.map(f => {
        if (f.id === actionResult.followerId) {
          return { ...f, ...actionResult.effects };
        }
        return f;
      });
    }

    // Changements sur plusieurs followers (retreat)
    if (actionResult.participantIds) {
      newGameState.followers = newGameState.followers.map(f => {
        if (actionResult.participantIds.includes(f.id)) {
          return {
            ...f,
            devotion: Math.min(100, f.devotion + actionResult.effects.devotionChange),
            sanity: Math.max(0, f.sanity + actionResult.effects.sanityChange),
          };
        }
        return f;
      });
    }

    setGameState(newGameState);
    setResult({ success: true, message: actionResult.message, data: actionResult });
  };

  const handleClose = () => {
    setResult(null);
    onClose();
  };

  // Infos d'action
  const getActionInfo = () => {
    switch (type) {
      case 'media-event':
        return {
          title: '📺 Événement Médiatique',
          description: 'Organisez une conférence publique pour attirer l\'attention',
          cost: 5000,
          effects: ['+15-25% notoriété', '+5-10% heat', 'Possibles nouveaux adeptes'],
        };
      case 'retreat':
        return {
          title: '🏕️ Stage Transcendantal',
          description: 'Week-end payant de méditation intensive (adeptes avec dévotion ≥40%)',
          cost: 0,
          revenue: `+500$ par participant`,
          effects: ['+10-20% dévotion', '-10-20% santé mentale'],
        };
      case 'private-session':
        return {
          title: `💬 Cours Particulier : ${follower?.name}`,
          description: 'Séance individuelle pour renforcer la dévotion',
          cost: 500,
          effects: ['+15-25% dévotion', '-5% suspicion'],
        };
      case 'hypnosis':
        return {
          title: `🌀 Hypnose : ${follower?.name}`,
          description: 'Révèle les pouvoirs cachés et manipule profondément l\'adepte',
          cost: 1000,
          effects: ['+20% dévotion', '-15% santé mentale', '+10% suspicion', '🔓 Révèle les secrets'],
        };
      case 'subliminal':
        return {
          title: `📻 Messages Subliminaux : ${follower?.name}`,
          description: 'Réduit la méfiance par des messages répétés',
          cost: 300,
          effects: ['-15-25% suspicion'],
        };
      default:
        return null;
    }
  };

  const actionInfo = getActionInfo();
  if (!actionInfo) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{actionInfo.title}</DialogTitle>
      <DialogContent>
  {!result ? (
    <>
      <Typography variant="body2" sx={{ mb: 2 }}>
        {actionInfo.description}
      </Typography>

      {actionInfo.cost > 0 && (
        <Alert severity={gameState.treasury >= actionInfo.cost ? "info" : "error"} sx={{ mb: 2 }}>
          <Typography variant="body2">
            Coût : <strong>${actionInfo.cost}</strong>
            {gameState.treasury < actionInfo.cost && ' (Fonds insuffisants)'}
          </Typography>
        </Alert>
      )}

      {actionInfo.revenue && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Revenus : <strong>{actionInfo.revenue}</strong>
          </Typography>
        </Alert>
      )}

      <Typography variant="subtitle2" sx={{ mb: 1 }}>Effets :</Typography>
      <Box component="ul" sx={{ pl: 2, mb: 0 }}>
        {actionInfo.effects.map((effect, idx) => (
          <Typography component="li" key={idx} variant="body2" sx={{ mb: 0.5 }}>
            {effect}
          </Typography>
        ))}
      </Box>
    </>
  ) : (
    <>
      <Alert severity={result.success ? "success" : "error"} sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
          {result.message}
        </Typography>
      </Alert>

      {result.success && result.data && (
        <Box>
          {/* Changements financiers */}
          {(result.data.cost || result.data.revenue) && (
            <Box sx={{ mb: 2, p: 2, bgcolor: 'rgba(255, 215, 0, 0.1)', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                💰 Finances
              </Typography>
              {result.data.cost && (
                <Typography variant="body2" color="error.main">
                  − ${result.data.cost}
                </Typography>
              )}
              {result.data.revenue && (
                <Typography variant="body2" color="success.main">
                  + ${result.data.revenue}
                </Typography>
              )}
            </Box>
          )}

          {/* Changements de stats globales */}
          {(result.data.notorietyChange || result.data.heatChange) && (
            <Box sx={{ mb: 2, p: 2, bgcolor: 'rgba(156, 39, 176, 0.1)', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                📊 Impact sur le culte
              </Typography>
              {result.data.notorietyChange && (
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  {result.data.notorietyChange > 0 ? '📈' : '📉'} Notoriété : 
                  <Chip 
                    label={`${result.data.notorietyChange > 0 ? '+' : ''}${result.data.notorietyChange}%`} 
                    size="small" 
                    color={result.data.notorietyChange > 0 ? "info" : "default"}
                    sx={{ ml: 1 }}
                  />
                </Typography>
              )}
              {result.data.heatChange && (
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                  {result.data.heatChange > 0 ? '🚨' : '😌'} Pression policière : 
                  <Chip 
                    label={`${result.data.heatChange > 0 ? '+' : ''}${result.data.heatChange}%`} 
                    size="small" 
                    color={result.data.heatChange > 0 ? "error" : "success"}
                    sx={{ ml: 1 }}
                  />
                </Typography>
              )}
            </Box>
          )}

          {/* Nouveaux adeptes */}
          {result.data.newFollowers && result.data.newFollowers.length > 0 && (
            <Box sx={{ mb: 2, p: 2, bgcolor: 'rgba(76, 175, 80, 0.1)', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                👥 Nouveaux adeptes ({result.data.newFollowers.length})
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {result.data.newFollowers.map((f, idx) => (
                  <Chip 
                    key={idx} 
                    label={`${f.emoji} ${f.name}`} 
                    size="small" 
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Effets sur follower(s) */}
          {result.data.effects && (
            <Box sx={{ mb: 2, p: 2, bgcolor: 'rgba(33, 150, 243, 0.1)', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                ✨ Effets sur {follower?.name || 'les participants'}
              </Typography>
              <Grid container spacing={1}>
                {result.data.effects.devotion !== undefined && (
                  <Grid item xs={6}>
                    <Chip 
                      label={`Dévotion: ${result.data.effects.devotion}%`} 
                      size="small" 
                      icon={<HeartIcon style={{ fontSize: 14 }} />}
                      sx={{ width: '100%' }}
                    />
                  </Grid>
                )}
                {result.data.effects.devotionChange !== undefined && (
                  <Grid item xs={6}>
                    <Chip 
                      label={`Dévotion: ${result.data.effects.devotionChange > 0 ? '+' : ''}${result.data.effects.devotionChange}%`} 
                      size="small" 
                      icon={<HeartIcon style={{ fontSize: 14 }} />}
                      color={result.data.effects.devotionChange > 0 ? "success" : "error"}
                      sx={{ width: '100%' }}
                    />
                  </Grid>
                )}
                {result.data.effects.sanity !== undefined && (
                  <Grid item xs={6}>
                    <Chip 
                      label={`Santé: ${result.data.effects.sanity}%`} 
                      size="small" 
                      icon={<BrainIcon style={{ fontSize: 14 }} />}
                      sx={{ width: '100%' }}
                    />
                  </Grid>
                )}
                {result.data.effects.sanityChange !== undefined && (
                  <Grid item xs={6}>
                    <Chip 
                      label={`Santé: ${result.data.effects.sanityChange > 0 ? '+' : ''}${result.data.effects.sanityChange}%`} 
                      size="small" 
                      icon={<BrainIcon style={{ fontSize: 14 }} />}
                      color={result.data.effects.sanityChange < 0 ? "error" : "success"}
                      sx={{ width: '100%' }}
                    />
                  </Grid>
                )}
                {result.data.effects.suspicion !== undefined && (
                  <Grid item xs={6}>
                    <Chip 
                      label={`Suspicion: ${result.data.effects.suspicion}%`} 
                      size="small" 
                      icon={<WarningIcon style={{ fontSize: 14 }} />}
                      sx={{ width: '100%' }}
                    />
                  </Grid>
                )}
              </Grid>
            </Box>
          )}

          {/* Participants au retreat */}
          {result.data.participants !== undefined && (
            <Box sx={{ mb: 2, p: 2, bgcolor: 'rgba(76, 175, 80, 0.1)', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                🏕️ Participation
              </Typography>
              <Typography variant="body2">
                {result.data.participants} adepte{result.data.participants > 1 ? 's ont' : ' a'} participé au stage
              </Typography>
              {result.data.effects && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Chacun a reçu : {result.data.effects.devotionChange > 0 ? '+' : ''}{result.data.effects.devotionChange}% dévotion, 
                    {result.data.effects.sanityChange}% sanité
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Pouvoirs révélés */}
          {result.data.revealedPowers && (
            <Box sx={{ p: 2, bgcolor: 'rgba(156, 39, 176, 0.1)', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                <PowerIcon sx={{ mr: 1 }} />
                🔓 Pouvoirs cachés révélés
              </Typography>
              {Object.entries(result.data.revealedPowers[0] || {}).map(([key, value]) => (
                value !== 0 && (
                  <Chip 
                    key={key} 
                    label={`${key}: ${value > 0 ? '+' : ''}${value}`} 
                    size="small" 
                    sx={{ mr: 0.5, mt: 0.5 }}
                    color="primary"
                  />
                )
              ))}
              {Object.keys(result.data.revealedPowers[0] || {}).filter(k => result.data.revealedPowers[0][k] !== 0).length === 0 && (
                <Typography variant="caption" color="text.secondary">
                  Aucun pouvoir spécial détecté
                </Typography>
              )}
            </Box>
          )}
        </Box>
      )}
    </>
  )}
</DialogContent>

      <DialogActions>
        {!result ? (
          <>
            <Button onClick={handleClose}>Annuler</Button>
            <Button 
              onClick={executeAction} 
              variant="contained"
              disabled={actionInfo.cost > 0 && gameState.treasury < actionInfo.cost}
            >
              Confirmer
            </Button>
          </>
        ) : (
          <Button onClick={handleClose} variant="contained">Fermer</Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ActionModal;