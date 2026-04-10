import { useEffect, useState } from "react";
import { GENIE_STATES, getCurrentMission, MISSIONS_BY_LEVEL } from "./farmData";
import { useFarming } from "./FarmingProvider";
import { Avatar, Badge, Box, Button, Card, CardContent, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, LinearProgress, Paper, Typography } from "@mui/material";
import { Close, Diamond, Grass, MonetizationOnOutlined, NotificationsActive, PlusOne, StarOutlined } from "@mui/icons-material";
import imgGenieWaiting from './images/genieRepos.png';
import imgGenieExplic from './images/genieExplicant.png';
import imgGenieSuccess from './images/genieSuccess.png';
export const GenieCharacter = () => {
  const { level, missionProgress, setMissionProgress, levelUp, logMessage, setLogMessage } = useFarming();
  const [genieState, setGenieState] = useState(GENIE_STATES.RESTING);
  const [showMissionDialog, setShowMissionDialog] = useState(false);
  const [animationClass, setAnimationClass] = useState('idle');

  // Récupération de la mission actuelle
  const currentMission = getCurrentMission(level)
 useEffect(() => {
    if (logMessage) {
      const timer = setTimeout(() => {
        setLogMessage(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [logMessage, setLogMessage]);

  useEffect(() => {
    if (currentMission && !missionProgress.claimed) {
      let progress = missionProgress.progress||0;
      const completed = progress >= currentMission.target;
      
      if(completed && !missionProgress.completed)
          setMissionProgress(p=>({...p,completed:true})) ;
      
      if (completed && genieState !== GENIE_STATES.CELEBRATING && !missionProgress.claimed) {
        setGenieState(GENIE_STATES.CELEBRATING);
        setAnimationClass('celebrating');
        setTimeout(() => {
          setGenieState(GENIE_STATES.WAITING);
          setAnimationClass('waiting');
        }, 2000);
      }

    }
  }, [level, missionProgress]);

  const getGenieDialogue = () => {
    if (!currentMission) return 'Félicitations ! Vous avez terminé toutes les missions !';
    
    if (missionProgress.completed && !missionProgress.claimed) {
      return currentMission.genieDialogue.complete;
    } else if (missionProgress.progress > 0) {
      return typeof currentMission.genieDialogue.progress === 'function' 
        ? currentMission.genieDialogue.progress(missionProgress.progress, currentMission.target)
        : currentMission.genieDialogue.progress;
    } else {
      return currentMission.genieDialogue.start;
    }
  };
const getGenieImage=()=>{
     switch (genieState) {
      case GENIE_STATES.CELEBRATING: return imgGenieSuccess;
      case GENIE_STATES.ACTIVE: return imgGenieExplic;
      case GENIE_STATES.RESTING: return imgGenieWaiting;
      case GENIE_STATES.WAITING: return imgGenieWaiting;
      default: return '🧞‍♂️';
    }
}
  const getGenieEmoji = () => {
    switch (genieState) {
      case GENIE_STATES.CELEBRATING: return '🎉';
      case GENIE_STATES.ACTIVE: return '⚡';
      case GENIE_STATES.RESTING: return '💤';
      case GENIE_STATES.WAITING: return '🎁';
      default: return '🧞‍♂️';
    }
  };

  const handleClaimReward = () => {
    if (currentMission && missionProgress.completed && !missionProgress.claimed) {
      levelUp(currentMission.reward);
      setGenieState(GENIE_STATES.RESTING);
      setAnimationClass('idle');
      setShowMissionDialog(false);
    }
  };

  const handleGenieClick = () => {
    setShowMissionDialog(true);
     setGenieState(GENIE_STATES.ACTIVE);
  };

 return <>
 <Box sx={{ position: 'relative', display: 'inline-block' }}>
      {/* Bulle de dialogue */}
      {logMessage && (
        <Box
          sx={{
            position: 'absolute',
            top: -90,
            left: 250,
            maxWidth: 200,
            backgroundColor: '#fff',
            border: '2px solid #9c27b0',
            borderRadius: '15px',
            padding: '12px 16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000,
            animation: 'speechBubbleAppear 0.3s ease-out',
            '&::before': {
              content: '""',
              position: 'absolute',
              left: -15,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 0,
              height: 0,
              borderTop: '10px solid transparent',
              borderBottom: '10px solid transparent',
              borderRight: '15px solid #9c27b0',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              left: -12,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 0,
              height: 0,
              borderTop: '8px solid transparent',
              borderBottom: '8px solid transparent',
              borderRight: '12px solid #fff',
            },
            '@keyframes speechBubbleAppear': {
              '0%': {
                opacity: 0,
                transform: 'scale(0.8) translateY(10px)',
              },
              '100%': {
                opacity: 1,
                transform: 'scale(1) translateY(0)',
              }
            }
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#333',
              fontWeight: 500,
              lineHeight: 1.3,
              margin: 0
            }}
          >
            {logMessage}
          </Typography>
        </Box>
      )}

      {/* Génie cliquable avec Badge pour les notifications */}
      <Badge
        badgeContent={missionProgress.completed && !missionProgress.claimed ? <NotificationsActive /> : null}
        color="warning"
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            display: 'inline-block'
          }}
        >
          <Avatar
            onClick={handleGenieClick}
            sx={{
              width: 96,
              height: 96,
              background: 'linear-gradient(45deg, #9c27b0, #2196f3)',
              cursor: 'pointer',
              fontSize: '2rem',
              transition: 'all 0.3s ease',
              animation: genieState === GENIE_STATES.CELEBRATING ? 'bounce 1s infinite' : 
                        genieState === GENIE_STATES.WAITING ? 'pulse 1.5s infinite' : 'none',
              '&:hover': {
                transform: 'scale(1.1)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
              },
              '@keyframes bounce': {
                '0%, 20%, 53%, 80%, 100%': {
                  transform: 'translateY(0px)'
                },
                '40%, 43%': {
                  transform: 'translateY(-10px)'
                },
                '70%': {
                  transform: 'translateY(-5px)'
                },
                '90%': {
                  transform: 'translateY(-2px)'
                }
              },
              '@keyframes pulse': {
                '0%': {
                  transform: 'scale(1)',
                  opacity: 1
                },
                '50%': {
                  transform: 'scale(1.05)',
                  opacity: 0.8
                },
                '100%': {
                  transform: 'scale(1)',
                  opacity: 1
                }
              }
            }}
          >
            {getGenieEmoji()} 🧞‍♂️
          </Avatar>
          
          {/* Image du génie positionnée en absolu */}
          <Box
            component="img"
            src={getGenieImage()}
            height={190}
            alt="genie"
            sx={{
              position: 'absolute',
              top: '0px',
              left: '50%',
              transform: 'translate(50%, -50%)',
              pointerEvents: 'none', // Pour que l'image ne bloque pas les clics sur l'Avatar
              zIndex: 1 // Derrière l'Avatar
            }}
          />
        </Box>
      </Badge>
    </Box>
   <Dialog
        open={showMissionDialog} 
        onClose={() => setShowMissionDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ flex: 1 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="h3" sx={{ mb: 1 }}>
                🧞‍♂️ {getGenieEmoji()}
              </Typography>
              <Typography variant="h5" component="h2" fontWeight="bold">
                {currentMission ? currentMission.title : 'Toutes les missions terminées !'}
              </Typography>
            </Box>
            <IconButton 
              onClick={() => setShowMissionDialog(false)}
              sx={{ alignSelf: 'flex-start' }}
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {/* Dialogue du génie */}
          <Paper
            elevation={2} 
            sx={{ 
              p: 2, 
              mb: 3, 
              backgroundColor: 'rgba(255,255,255,0.9)',
              borderLeft: '4px solid #9c27b0'
            }}
          >
            <Typography 
              variant="body1" 
              sx={{ 
                fontStyle: 'italic', 
                textAlign: 'center',
                color: 'text.secondary'
              }}
            >
              "{getGenieDialogue()}"
            </Typography>
          </Paper>

          {currentMission && (
            <>
              {/* Informations de mission */}
              <Card sx={{ mb: 2, backgroundColor: 'rgba(255,255,255,0.7)' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {currentMission.description}
                  </Typography>
                  
                  {/* Barre de progression */}
                  <Box sx={{ mb: 2 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min((missionProgress.progress / currentMission.target) * 100, 100)}
                      sx={{ 
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgba(0,0,0,0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#4caf50'
                        }
                      }}
                    />
                    <Typography 
                      variant="caption" 
                      display="block" 
                      textAlign="center" 
                      sx={{ mt: 1 }}
                    >
                      {missionProgress.progress} / {currentMission.target}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* Récompenses */}
              <Card sx={{ backgroundColor: '#fff3e0' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: '#f57c00' }}>
                    🎁 Récompenses
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    {currentMission.reward.diamond && <Chip
                      icon={<Diamond />}
                      label={`+${currentMission.reward.diamond} XP`}
                      color="primary"
                      variant="outlined"
                    />}
                    {currentMission.reward.money && <Chip
                      icon={<MonetizationOnOutlined />}
                      label={`+${currentMission.reward.money} pièces`}
                      color="warning"
                      variant="outlined"
                    />}
                    {currentMission.reward.engrais && <Chip
                      icon={<Grass />}
                      label={`+${currentMission.reward.engrais} engrais`}
                      color="success"
                      variant="outlined"
                    />}
                    <Chip
                      icon={<PlusOne />}
                      label={`+1 niveau`}
                      color="info"
                      variant="outlined"
                    />
                  </Box>
                </CardContent>
              </Card>
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={() => setShowMissionDialog(false)}
            variant="outlined"
            fullWidth
            size="large"
          >
            Fermer
          </Button>
          
          {missionProgress.completed && !missionProgress.claimed && currentMission && (
            <Button
              onClick={handleClaimReward}
              variant="contained"
              color="success"
              fullWidth
              size="large"
              sx={{ fontWeight: 'bold' }}
            >
              🎉 Récupérer la récompense !
            </Button>
          )}
        </DialogActions>
      </Dialog>
      </>
};
