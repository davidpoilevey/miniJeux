import { Box, Typography } from '@mui/material';

const HeroHeader = ({ title = 'Faites votre choix', subtitle }) => (
  <Box sx={{ mb: 8, position: 'relative' }}>
    {/* Ambient blur orb */}
    <Box sx={{
      position: 'absolute',
      top: -48,
      left: -48,
      width: 280,
      height: 280,
      bgcolor: 'rgba(253,111,204,0.08)',
      filter: 'blur(80px)',
      borderRadius: '50%',
      pointerEvents: 'none',
    }} />

    <Typography
      variant="h2"
      sx={{
        fontFamily: '"Newsreader", serif',
        fontSize: { xs: '1.4rem', md: '2.5rem' },
        lineHeight: 1.05,
        mb: subtitle ? 1.5 : 3,
        color: 'text.primary',
        maxWidth: 680,
        position: 'relative',
      }}
    >
     {title}
    </Typography>

    {subtitle && (
      <Typography
        sx={{
          fontFamily: '"Space Grotesk", sans-serif',
          fontSize: '0.85rem',
          color: 'text.secondary',
          maxWidth: 560,
          mb: 3,
          position: 'relative',
        }}
      >
        {subtitle}
      </Typography>
    )}

    {/* Accent bar */}
    <Box sx={{ height: 4, width: 96, bgcolor: '#fd6fcc', borderRadius: 2 }} />
  </Box>
);

export default HeroHeader;
