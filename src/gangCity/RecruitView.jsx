import { Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Button,
  LinearProgress,
  Avatar,
  Chip,
  Tooltip,
  Paper
} from '@mui/material';
import { FILLES_POOL } from './GangData';
import { useMaqCity } from './GangContext';

import { useMemo } from 'react';
import { OnBoardingStep } from '../OnBoardingContext';

export const RecruitView = () => {
  const { state, recruitGirl } = useMaqCity();

  const availableGirls = useMemo(() => {
    const ownedIds = new Set(state.girls.map(g => g.name));

    // profils autorisés de base
    const allowedProfiles = new Set(['salope']);

    // bonus du maq
    const bonusIds = new Set(state.bonuses.map(b => b.id));

    if (bonusIds.has('maqChapeau')) allowedProfiles.add('pute');
    if (bonusIds.has('maqCostume')) allowedProfiles.add('escort');
    if (bonusIds.has('maqLimousine')) allowedProfiles.add('luxe');

    // filtre principal
    const filtered = FILLES_POOL.filter(girl =>
      !ownedIds.has(girl.name) &&
      allowedProfiles.has(girl.profile)
    );

    // filtre aléatoire (≈ 50%)
    const filtredRes = filtered.filter(() => Math.random() > 0.5);
    if(filtredRes.length<=1)
      filtredRes.push(FILLES_POOL[0]);
    return filtredRes;
  }, [state.girls, state.bonuses]);

  return (
    <Box sx={{ p: 3, background: '#701d10', color: '#e0e0e0' }}>
      <Typography variant="h5" gutterBottom>
        Recrutement
      </Typography>
  <OnBoardingStep
        stepId="retourVille"
        message="Recrutez Paolo, s'il est pas la, revenez demain, il vous suivra pour le prix d'un macdo"
      >
      <Typography variant="body2" sx={{ mb: 2 }}>
        Des profils sont disponibles. Choisis avec soin : chaque fille
        réagit différemment à la ville.
      </Typography>
</OnBoardingStep>
      <Grid container spacing={3}>
        {availableGirls.map(girl => (
          <Grid item xs={12} sm={6} md={4} key={girl.id}>
            <GirlRecruitCard
              girl={girl}
              canAfford={state.money >= girl.price}
              onRecruit={recruitGirl}
            />
          </Grid>
        ))}
       
      </Grid>
    </Box>
  );
};



/** Pourcentage d'une stat sur une échelle 1–4 */
const statPercent = (value) => Math.round(((value) / 5) * 100);

/** Couleur de la barre selon le niveau (0–100) */
const barColor = (value) =>
  value < 30 ? '#4caf50' : value < 65 ? '#ff9800' : '#f44336';

/** Label lisible pour le profil */
const profileLabel = (profile) => {
  const map = { luxe: 'Escort-premium', escort: 'Escort a domicile', pute: 'Pute de rue', salope: 'Trou a bite' };
  return map[profile] || profile;
};

/** Chip coloré selon le profil */
const profileChipColor = (profile) => {
  const map = { luxe: '#ce93d8', escort: '#4dd0e1', pute: '#85ca43', salope: '#ff8a65' };
  return map[profile] || '#aaa';
};


// ─── Composant ──────────────────────────────────────────────────────────────

export const GirlRecruitCard = ({ girl, onRecruit, canAfford, inStable, onOpenProfessional, onOpenPersonal
  ,  girlBonuses }) => {
  const fatigue = girl.fatigue ?? 0;
  const stress = girl.stress ?? 0;

  return (
    <Card
      sx={{
        background: '#1a1a1e',
        border: '1px solid #2e2e35',
        borderRadius: 12,
        color: '#e0e0e0',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        boxShadow: '0 4px 24px #00000044',
      }}
    >
      {/* ── Header : Avatar + nom + profil ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          p: '16px 16px 12px',
          background: 'linear-gradient(135deg, #2a1a1a 0%, #1a1a1e 100%)',
          borderBottom: '1px solid #2e2e35',
        }}
      >
        <Avatar
          src={girl.image}
          alt={girl.name}
          sx={{
            width: 56,
            height: 56,
            border: '2px solid #c62828',
            boxShadow: '0 0 12px #c6282844',
          }}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#fff', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {girl.name}
          </Typography>
          <Chip
            label={profileLabel(girl.profile)}
            size="small"
            sx={{
              background: `${profileChipColor(girl.profile)}18`,
              color: profileChipColor(girl.profile),
              border: `1px solid ${profileChipColor(girl.profile)}44`,
              fontSize: '0.68rem',
              fontWeight: 600,
              mt: 0.3,
            }}
          />
        </Box>
        {/* Prix si mode recrutement */}
        {!inStable && (
          <Chip
            label={`${girl.price} €`}
            size="small"
            sx={{
              background: '#2a2a2e',
              color: '#ff7043',
              border: '1px solid #3a3a42',
              fontSize: '0.72rem',
              fontWeight: 700,
            }}
          />
        )}
      </Box>

      {/* ── Corps ── */}
      <Box sx={{ p: '12px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 1.2 }}>

        {/* Description */}
        {girl.description && (
          <Typography variant="body2" sx={{ color: '#888', fontSize: '0.75rem', lineHeight: 1.5 }}>
            {girl.description}
          </Typography>
        )}

        {/* Quartier assigné (mode stable) */}
        {inStable && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: 0.6 }}>
              Quartier
            </Typography>
            <Chip
              label={girl.assignedDistrictId || 'Libre'}
              size="small"
              sx={{
                background: girl.assignedDistrictId ? '#3434a0' : '#d82607',
                color: girl.assignedDistrictId ? '#dddada' : '#666',
                border: '1px solid #3a3a42',
                fontSize: '0.68rem',
              }}
            />
          </Box>
        )}

        {/* Stats : charme, endurance, autonomie → pourcentages */}
        <Box>
          
 <OnBoardingStep
  stepId="ecurie"
  condition={girl.name==='Paolo'}
  message="Cette carte montre l'etat de votre fille, surveillez son etat de stress et de fatigue, son rendement s'en ressent si elle a les traits tirés. "
>
          <Typography variant="caption" sx={{ color: '#555', textTransform: 'uppercase', letterSpacing: 0.6, mb: 0.5, display: 'block' }}>
            Compétences
          </Typography>
          </OnBoardingStep>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            {[
              { key: 'charme', label: 'Charme' },
              { key: 'endurance', label: 'Endurance' },
              { key: 'autonomie', label: 'Autonomie' },
            ].map(({ key, label }) => (
              <Box key={key} sx={{ flex: 1, textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: '#fff', fontWeight: 700, fontSize: '0.78rem' }}>
                  {statPercent(girl.stats[key])}%
                </Typography>
                <Typography variant="caption" sx={{ color: '#555', display: 'block', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                  {label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
         <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: 0.6 }}>
              Specialités
            </Typography>
            <Box>
              {girl.specialites?.map(sp=>{
                return <Chip key={sp}
              label={sp}
            />
              })}
            </Box>
            
          </Box>

        {/* Fatigue + Stress → LinearProgress colorées */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.7 }}>
          {[
            { key: 'fatigue', label: 'Fatigue', value: fatigue },
            { key: 'stress', label: 'Stress', value: stress },
          ].map(({ key, label, value }) => (
            <Box key={key}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.2 }}>
                <Typography variant="caption" sx={{ color: '#666', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {label}
                </Typography>
                <Typography variant="caption" sx={{ color: barColor(value), fontSize: '0.68rem', fontWeight: 600 }}>
                  {value}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={value}
                sx={{
                  height: 5,
                  borderRadius: 3,
                  background: '#2a2a2e',
                  '& .MuiLinearProgress-bar': {
                    background: barColor(value),
                    borderRadius: 3,
                    transition: 'background 0.4s, width 0.4s',
                  },
                }}
              />
            </Box>
          ))}
        </Box>

        {/* Bonus disponibles (mode stable) */}
        {inStable && girlBonuses && girlBonuses.length > 0 && (
          <Box>
            <Typography variant="caption" sx={{ color: '#555', textTransform: 'uppercase', letterSpacing: 0.6, mb: 0.5, display: 'block' }}>
              Bonus
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {girlBonuses.map((bonus) => (
                <Button
                  key={bonus.id}
                  size="small"
                  variant="outlined"
                  onClick={() => bonus.onApply(bonus.id)}
                  sx={{
                    fontSize: '0.65rem',
                    px: 0.8,
                    py: 0.2,
                    minWidth: 0,
                    borderColor: '#3a5a3a',
                    color: '#81c784',
                    background: '#1e261e',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: '#81c784',
                      background: '#253325',
                    },
                  }}
                >
                  {bonus.name}
                  <Chip
                    label={`${bonus.duree}t`}
                    size="small"
                    sx={{
                      ml: 0.5,
                      background: '#1a1a1e',
                      color: '#66bb6a',
                      fontSize: '0.55rem',
                      height: 14,
                    }}
                  />
                </Button>
              ))}
            </Box>
          </Box>
        )}
      </Box>

      {/* ── Footer : action principale ── */}
      <Box sx={{ p: '10px 16px 14px', borderTop: '1px solid #2e2e35', display: 'flex', flexDirection: 'column', gap: 0.6 }}>
        {/* Mode recrutement */}
        {!inStable && (
          <Tooltip title={!canAfford ? 'Pas assez d\'argent' : ''}>
            <Box>
              <Button
                fullWidth
                variant="contained"
                disabled={!canAfford}
                onClick={() => onRecruit(girl)}
                sx={{
                  background: canAfford ? 'linear-gradient(135deg, #c62828, #b71c1c)' : '#2a2a2e',
                  color: canAfford ? '#fff' : '#555',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  py: 0.7,
                  boxShadow: canAfford ? '0 2px 12px #c6282844' : 'none',
                  transition: 'all 0.2s',
                  '&:hover:not(:disabled)': {
                    background: 'linear-gradient(135deg, #e53935, #c62828)',
                    boxShadow: '0 4px 18px #c6282866',
                  },
                  '&.Mui-disabled': {
                    background: '#2a2a2e !important',
                    color: '#555 !important',
                  },
                }}
              >
                Recruter — {girl.price} €
              </Button>
            </Box>
          </Tooltip>
        )}
 
        {/* Mode stable : Professionnel + Personnel */}
        {inStable && (
          <Box sx={{ display: 'flex', gap: 0.8 }}>
            
 <OnBoardingStep
  stepId="ecuriePro"
    condition={girl.name==='Paolo'}
  message="C'est ici que vous pouvez lui donner les bonus que vous acheterez au marché ou interagir avec elle. De maniere professionnelle pour l'affecter a un quartier ou la mettre au repos un temps "
></OnBoardingStep>
            <Button
              size="small"
              fullWidth
              variant="outlined"
              onClick={() => onOpenProfessional && onOpenProfessional(girl)}
              sx={{
                fontSize: '0.7rem',
                py: 0.5,
                borderColor: '#2e4a5a',
                color: '#5078ef',
                background: '#1e2026',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: '#507def',
                  background: '#252a35',
                },
              }}
            >
              💼 Professionnel
            </Button>
            <Button
              size="small"
              fullWidth
              variant="outlined"
              onClick={() => onOpenPersonal && onOpenPersonal(girl)}
              sx={{
                fontSize: '0.7rem',
                py: 0.5,
                borderColor: '#5a2e4a',
                color: '#ce93d8',
                background: '#261e26',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: '#ce93d8',
                  background: '#332535',
                },
              }}
            >
              💖 Personnel
            </Button>

 <OnBoardingStep
  stepId="ecuriePerso"
    condition={girl.name==='Paolo'}
  message="Soit de maniere personnelle, ces filles ont besoin d'affection apres tout. Finissez le tutoriel en allant au marché acheter un chapeau de Maq "
></OnBoardingStep>
          </Box>
        )}
      </Box>
    </Card>
  );
};