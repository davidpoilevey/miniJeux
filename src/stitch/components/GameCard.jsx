import { useMemo } from 'react';
import { Card, CardMedia, CardContent, Box, Typography, Chip } from '@mui/material';
import { getRandomReview } from '../../hookGame';
import { useGlobalScores } from '../../App';

const STATUS_BADGE = {
  success: { label: 'DISPO',  color: 'success' },
  warning: { label: 'BETA',   color: 'warning' },
  info:    { label: 'INFO',   color: 'info'    },
  error:   { label: 'WIP',    color: 'error'   },
};

const LABEL_FONT = { fontFamily: '"Space Grotesk", sans-serif' };

const GameCard = ({ jeu, onSelect }) => {
  const review = useMemo(() => getRandomReview(), []);
  const { getScoreByGame } = useGlobalScores();
  const scoreData = getScoreByGame(jeu.id || jeu.name);
  const badge = STATUS_BADGE[jeu.status];

  return (
    <Card
      onClick={() => onSelect(jeu)}
      sx={{
        cursor: 'pointer',
        overflow: 'hidden',
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)',
        // Sun motif top-right
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0, right: 0,
          width: 140, height: 140,
          background: 'radial-gradient(circle at top right, rgba(253,111,204,0.15) 0%, transparent 65%)',
          pointerEvents: 'none',
          zIndex: 1,
        },
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 30px 60px -15px rgba(50,44,57,0.14)',
        },
      }}
    >
      {/* Image */}
      {jeu.image && (
        <Box sx={{ position: 'relative', paddingTop: '56.25%', overflow: 'hidden', flexShrink: 0 }}>
          <CardMedia
            component="img"
            image={jeu.image}
            alt={jeu.name}
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
              transition: 'transform 700ms cubic-bezier(0.4, 0, 0.2, 1)',
              '.MuiCard-root:hover &': { transform: 'scale(1.08)' },
            }}
          />
          {/* Bottom gradient overlay */}
          <Box sx={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, #ffffff 0%, transparent 55%)',
            opacity: 0.65,
          }} />
        </Box>
      )}

      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 3, gap: 1.5, position: 'relative', zIndex: 1 }}>
        {/* Title + badge */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
          <Typography
            variant="h5"
            sx={{ fontFamily: '"Newsreader", serif', color: 'text.primary', flex: 1, lineHeight: 1.2 }}
          >
            {jeu.name}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5, flexShrink: 0 }}>
            {badge && (
              <Chip
                label={badge.label}
                color={badge.color}
                size="small"
                sx={{ ...LABEL_FONT, fontSize: '0.6rem', letterSpacing: 1, height: 20 }}
              />
            )}
            {scoreData?.score > 0 && (
              <Typography sx={{ ...LABEL_FONT, fontSize: '0.65rem', color: 'text.secondary' }}>
                🏆 {scoreData.score}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Description */}
        {jeu.description && (
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {jeu.description}
          </Typography>
        )}

        {/* Tags */}
        {jeu.tags?.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {jeu.tags.map(tag => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                variant="outlined"
                sx={{
                  ...LABEL_FONT,
                  fontSize: '0.58rem',
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                  color: 'text.secondary',
                  borderColor: 'rgba(178,170,186,0.3)',
                  height: 18,
                }}
              />
            ))}
          </Box>
        )}

        {/* Review blockquote */}
        <Box sx={{
          mt: 'auto',
          borderLeft: '3px solid #fd6fcc',
          pl: 1.5, py: 0.5,
          bgcolor: 'rgba(247,237,255,0.5)',
          borderRadius: '0 4px 4px 0',
        }}>
          <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', fontSize: '0.68rem' }}>
            "{review.text}"
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.62rem', display: 'block', mt: 0.25 }}>
            — {review.name} • {review.stars}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default GameCard;
