import { Box, Typography, Button, Chip } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import HeroHeader from '../components/HeroHeader';
import '../stitch.css';

const LABEL_FONT = { fontFamily: '"Space Grotesk", sans-serif' };

// La sélection maison — un jeu par ligne, choisi à la main, pas par algorithme.
const FAVORITES = [
  {
    matchId: 'echec',
    eyebrow: 'Le plus abouti',
    blurb: "Un jeu d'échecs plus complet que sur bien des sites spécialisés. Ouvertures, réflexions, puzzles — il ne lui manque que le online pour rivaliser avec les meilleurs.",
  },
  {
    matchId: 'Civilization',
    eyebrow: 'Le chef-d’œuvre',
    blurb: "Réplique fidèle du Civilization premier du nom, celui de son enfance. Refaire ce jeu-là, de zéro, c'est le genre de pari qu'on ne gagne pas souvent.",
  },
  {
    matchId: 'ezioTrip',
    eyebrow: 'Le plus attachant',
    blurb: "Le RPG familial centré sur le chat de la maison. Une longue aventure, pleine d'humour, qui prouve qu'on n'a pas besoin d'un dragon pour faire un vrai jeu de rôle.",
  },
  {
    matchId: 'carbonifere14',
    eyebrow: 'L’aboutissement d’une saga',
    blurb: "Le meilleur et le plus abouti de toute la série Bactérie — des années d'algorithmes génétiques qui finissent par pousser, littéralement, sous vos yeux.",
  },
  {
    matchId: 'Maq-city',
    eyebrow: 'Assumé, pour rire',
    blurb: "Là pour la blague, et parce que le sujet — coquin, so it's fine — est étonnamment bien ficelé niveau gestion. Public averti, mais franchement bien construit.",
  },
  {
    matchId: 'Awale',
    eyebrow: 'L’increvable',
    blurb: "Un vieux de la vieille. Rudimentaire en apparence, redoutablement addictif en pratique — la preuve qu'un bon jeu n'a pas besoin d'artifices.",
  },
];

const findGame = (gamesData, matchId) => {
  for (const cat of gamesData || []) {
    const found = cat.jeux?.find(g => g.id === matchId || g.name === matchId);
    if (found) return found;
  }
  return null;
};

const ShowcaseCard = ({ jeu, eyebrow, blurb, reverse, onSelect }) => (
  <Box
    onClick={() => onSelect(jeu)}
    sx={{
      display: 'flex',
      flexDirection: { xs: 'column', md: reverse ? 'row-reverse' : 'row' },
      alignItems: 'stretch',
      gap: { xs: 2, md: 5 },
      borderRadius: 4,
      overflow: 'hidden',
      bgcolor: 'background.paper',
      boxShadow: '0 20px 40px -10px rgba(50,44,57,0.08)',
      cursor: 'pointer',
      transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        transform: 'translateY(-6px)',
        boxShadow: '0 30px 60px -15px rgba(164,34,127,0.18)',
      },
    }}
  >
    {/* Image */}
    <Box sx={{
      flex: { xs: 'none', md: '0 0 44%' },
      position: 'relative',
      height: { xs: 200, md: 'auto' },
      minHeight: { md: 260 },
      overflow: 'hidden',
    }}>
      <Box
        component="img"
        src={jeu.image}
        alt={jeu.name}
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transition: 'transform 700ms cubic-bezier(0.4, 0, 0.2, 1)',
          '.MuiBox-root:hover &': { transform: 'scale(1.06)' },
        }}
      />
      <Box sx={{
        position: 'absolute',
        top: 12,
        left: reverse ? 'auto' : 12,
        right: reverse ? 12 : 'auto',
      }}>
        <Chip
          label={eyebrow}
          size="small"
          sx={{
            ...LABEL_FONT,
            fontSize: '0.62rem',
            letterSpacing: 1,
            textTransform: 'uppercase',
            fontWeight: 700,
            bgcolor: 'rgba(164,34,127,0.9)',
            color: '#ffeef4',
          }}
        />
      </Box>
    </Box>

    {/* Texte */}
    <Box sx={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 1.5,
      p: { xs: 2.5, md: 4 },
      pl: { md: reverse ? 4 : 0 },
      pr: { md: reverse ? 0 : 4 },
    }}>
      <Typography
        variant="h4"
        sx={{ fontFamily: '"Newsreader", serif', color: 'text.primary', lineHeight: 1.15 }}
      >
        {jeu.name}
      </Typography>

      <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
        {blurb}
      </Typography>

      <Box sx={{ mt: 1 }}>
        <Button
          variant="contained"
          startIcon={<PlayArrowIcon />}
          onClick={(e) => { e.stopPropagation(); onSelect(jeu); }}
          sx={{
            ...LABEL_FONT,
            fontSize: '0.65rem',
            letterSpacing: 2,
            px: 2.5,
            py: 1,
            bgcolor: 'primary.main',
            '&:hover': { bgcolor: '#8a1a6a', boxShadow: '0 0 20px rgba(164,34,127,0.3)' },
          }}
        >
          Jouer
        </Button>
      </Box>
    </Box>
  </Box>
);

const FavoritesPage = ({ gamesData, onSelectGame }) => {
  const items = FAVORITES
    .map(fav => ({ ...fav, jeu: findGame(gamesData, fav.matchId) }))
    .filter(fav => fav.jeu);

  return (
    <Box
      className="stitch-grid-bg"
      sx={{ px: { xs: 2, md: 4 }, pt: 4, pb: 12, minHeight: '100%', position: 'relative' }}
    >
      <Box sx={{
        position: 'fixed',
        top: 0, right: 0,
        width: { xs: 320, md: 640 },
        height: { xs: 320, md: 640 },
        background: 'radial-gradient(circle at top right, rgba(253,111,204,0.07) 0%, transparent 55%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <HeroHeader
          title="La crème de la crème"
          subtitle="Pas un classement, pas un algorithme — juste ceux qu'on fait absolument découvrir en premier."
        />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 980, mx: 'auto' }}>
          {items.map((fav, idx) => (
            <ShowcaseCard
              key={fav.matchId}
              jeu={fav.jeu}
              eyebrow={fav.eyebrow}
              blurb={fav.blurb}
              reverse={idx % 2 === 1}
              onSelect={onSelectGame}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default FavoritesPage;
