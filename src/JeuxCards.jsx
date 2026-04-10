import { Chip, Card, CardContent, CardActions, Button, Typography, Box, TextField, Grid, Tooltip, IconButton, Popover, CardHeader, CardMedia, Switch, Link, Dialog, DialogTitle, DialogContent, DialogActions, Grow, LinearProgress, Avatar, Badge } from '@mui/material';
import './App.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import useProgression, { getRandomReview, useCategories, useCategoryCount, useFilteredGames, useIsMiniJeux, useIsMobile, IfNotMobile, useRandomGame, useTags, useTagsWithCounts } from './hookGame';
import * as Icons from '@mui/icons-material';
import { useGlobalScores } from './App';
import ChuckNorrisFact, { HiScoreButton } from './ChuckNorrisFact';
//import photoMoi from './miniJeux/images/photoDPY.jpg';
import photoMoi from '../src/DSCN0013.jpg';

const statusColors = {
  success: '#20b627ff',
  info: '#1b7ed0ff',
  warning: '#d6aa16ff',
  error: '#cc1b1bff',
  default: '#eeeeee'
};
const GameCard = ({ jeu, onSelect }) => {
  const color = statusColors[jeu.status] || statusColors.default;
  const Icon = Icons[jeu.icon] || Icons['SportsEsports'];
  const { getScoreByGame } = useGlobalScores();
  const review = getRandomReview();
  const scoreData = getScoreByGame(jeu.id || jeu.name); // <-- important : singApp.id
  const scoreDisplay =
    scoreData?.score && scoreData.score > 0
      ? `🏆 ${scoreData.score}`
      : null;
  return (
    <Card
      onClick={() => onSelect(jeu)}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 6,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        '&:hover': {
          transform: 'scale(1.03)',
          boxShadow: `0 8px 30px ${color || '#ffcc00'}55`,
        },
        // ---- le cadre dégradé est un pseudo-élément ----
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0, // couvre toute la card
          borderRadius: 6,
          padding: '16px', // largeur du bord
          background: `linear-gradient(80deg, ${color || '#ff6a00'}, transparent,${color || '#ff6a00'})`,
          WebkitMask: `
        linear-gradient(#fff 0 0) content-box, 
        linear-gradient(#fff 0 0)
      `,
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          pointerEvents: 'none',
        },
      }}
    >
      {jeu.image && (
        <CardMedia
          component="img"
          image={jeu.image}
          alt={jeu.name}
          sx={{
            height: 120,
            objectFit: 'cover',
            borderRadius: 6,
          }}
        />
      )}
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 600, color: '#222', flex: 1 }}>
              {jeu.name}
            </Typography>
            {jeu.regle && (
              <Tooltip
                title={
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line', maxWidth: 300 }}>
                    {jeu.regle}
                  </Typography>
                }
                arrow
                placement="top"
              >
                <IconButton
                  size="small"
                  onClick={e => e.stopPropagation()}
                  sx={{ color: '#555', ml: 1 }}
                >
                  <Icons.Info fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title={jeu.status || 'indisponible'}>
              <IconButton size="small" sx={{ color: color }}>
                <Icon />
              </IconButton>
            </Tooltip>
            {scoreDisplay && (
              <Tooltip title={"Votre meilleur score"}>
                <Typography
                  variant="caption"
                  sx={{ ml: 2, color: '#777' }}
                >
                  {scoreDisplay}
                </Typography>
              </Tooltip>
            )}
          </Box>
        }
        subheader={
          <Box sx={{ display: 'flex', flexWrap:'wrap', alignItems: 'center', justifyContent:'space-around',gap:0.5}}>
           
            {jeu.tags.map(tag=>{
              return  <Chip key={tag}
                label={tag}
                size="small"
                color="secondary"
                sx={{ ml: 1, fontWeight: 500 }}
              />
            })}
          </Box>
        }
        sx={{ pb: 0 }}
      />

      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {jeu.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1, flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {jeu.description}
          </Typography>
        )}
        <Box
          sx={{
            mt: 1,
            p: 1,
            borderRadius: 2,
            background: 'rgba(255,255,255,0.1)',
            fontStyle: 'italic'
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', fontSize: 'x-small' }}>
            “{review.text}”
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', mt: 0.5, fontSize: 'x-small' }}>
            — {review.name} • {review.stars}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};


export default GameCard;


export const Regles = ({ regle }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  if (regle == null)
    return null;

  return (
    <>
      <Box className='reglesInfo' onClick={handlePopoverOpen}>
        <Icons.InfoOutlined color='primary' />
      </Box>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box className="regleText">
          {regle}
        </Box>
      </Popover>
    </>
  );
};

// Composant TagFilter (remplace CategoryFilter)
export const TagFilter = ({ tagsWithCounts, selected, onChange }) => {
  const handleToggle = (tag) => {
    if (selected.includes(tag)) {
      onChange(selected.filter(t => t !== tag));
    } else {
      onChange([...selected, tag]);
    }
  };
   const maxCount = Math.max(...tagsWithCounts.map(t => t.count), 1);


  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Filtrer par tags :
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {tagsWithCounts.map(({ tag, count },idx) => {
 const backgroundColor = selected.includes(tag) 
            ? undefined 
            : getCountColor(count, maxCount);
          return <Badge key={'b-'+idx}
            badgeContent={count}
            color={selected.includes(tag) ? 'secondary' : 'default'}
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.65rem',
                height: '16px',
                minWidth: '16px',
                padding: '0 4px'
              }
            }}
          >
            <Chip
              key={tag}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <span>{tag}</span>
                </Box>
              }
              onClick={() => handleToggle(tag)}
              color={selected.includes(tag) ? 'primary' : 'default'}
              variant={selected.includes(tag) ? 'filled' : 'outlined'}
              disabled={count === 0}
              sx={{
                cursor: count === 0 ? 'not-allowed' : 'pointer',
                opacity: count === 0 ? 0.5 : 1,
                transition: 'all 0.2s ease',
                backgroundColor: !selected.includes(tag) ? backgroundColor : undefined,
                '&:hover': count > 0 ? {
                  transform: 'scale(1.05)',
                  boxShadow: 2,
                  backgroundColor: !selected.includes(tag) ? backgroundColor : undefined,
                } : {},
                '& .MuiChip-label': {
                  color: selected.includes(tag) || count === 0 ? undefined : '#000'
                }
              }}
            />
          </Badge>
})}
        {selected.length > 0 && (
          <Chip
            label="Effacer tout"
            onClick={() => onChange([])}
            color="error"
            variant="outlined"
            icon={<Icons.Clear />}
            sx={{ cursor: 'pointer' }}
          />
        )}
      </Box>
    </Box>
  );
};
const getCountColor = (count, maxCount) => {
  if (count === 0) return 'default';
  
  const ratio = count / maxCount;
  
  if (ratio <= 0.2) return '#e0e0e077'; // Gris clair
  if (ratio <= 0.4) return '#fff9c477';  // Jaune pâle
  if (ratio <= 0.6) return '#ffb74d77'; // Orange
  return '#ff525277'; // Rouge
};

export const GamesGrid = ({ gamesData, onSelectGame }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const isMobile = useIsMobile();
  const { getRandomGame } = useRandomGame(gamesData);

  const handleClick = () => {
    const jeu = getRandomGame();
    if (jeu) {
      if (window.gtag)
        window.gtag('event', 'randomGame', { event_label: jeu.name });
      onSelectGame(jeu);
    }
  };

  // Sur mobile, on force le filtre mobileFriendly automatiquement
  const effectiveTags = isMobile
    ? [...new Set([...selectedTags, 'mobileFriendly'])]
    : selectedTags;

  const tagsWithCounts = useTagsWithCounts(gamesData, searchQuery, effectiveTags);
  const filteredGames = useFilteredGames(gamesData, searchQuery, effectiveTags);


  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: { xs: 1, md: 2 } }}>
      {/* Barre de recherche */}
      <Box sx={{ display: 'flex', alignItems: 'start', gap: 2, mb: 2, flexDirection: { xs: 'column', md: 'row' } }}>
        <Box sx={{ flex: 1, width: '100%' }}>
          <TextField
            label="Rechercher un jeu"
            variant="outlined"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            fullWidth
            size="small"
            sx={{ flex: 1 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems:'end' }}>

            <Tooltip title="Jouer à un jeu au hasard">
              <IconButton
                onClick={handleClick}
                color="primary"
                sx={{
                  transition: 'transform 0.2s ease',
                  '&:hover': { transform: 'rotate(15deg) scale(1.1)', color: 'red' },
                }}
              >
                <Icons.Casino fontSize="large" />
              </IconButton>
            </Tooltip>
            {/* Résultats */}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {filteredGames.length} jeu{filteredGames.length > 1 ? 'x' : ''} trouvé{filteredGames.length > 1 ? 's' : ''}
              {selectedTags.length > 0 && (
                <span> avec {selectedTags.length} tag{selectedTags.length > 1 ? 's' : ''}</span>
              )}
            </Typography>
          </Box>
        </Box>

        <IfNotMobile>
          <Box sx={{ flex: 2, width: '100%' }}>
            <TagFilter
              tagsWithCounts={tagsWithCounts}
              selected={selectedTags}
              onChange={setSelectedTags}
            />
          </Box>
        </IfNotMobile>
      </Box>


      {/* Grille de jeux */}
      <Box sx={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <Grid container spacing={2}>
          {filteredGames.map((jeu) => (
            <Grid item xs={12} sm={6} md={4} lg={3}
              sx={{ padding: { xs: '8px', md: '28px' } }}
              key={jeu.id || jeu.name}>
              <GameCard jeu={jeu} onSelect={onSelectGame} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export const AppHeader = ({ gamesData, selectedApp }) => {
  const [openMentions, setOpenMentions] = useState(false);
  const [openContact, setOpenContact] = useState(false);
  const { played, total, progress } = useProgression(gamesData, selectedApp);
  const handleOpenMentions = () => setOpenMentions(true);
  const handleCloseMentions = () => setOpenMentions(false);

  const handleOpenContact = () => setOpenContact(true);
  const handleCloseContact = () => setOpenContact(false);

  return (
    <>
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
          textAlign: 'center',
          color: 'white',
        }}
      >
        {/* Ligne principale avec logo et titre */}
        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>

          <Typography
            variant="h3"
            className="main-title"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.8rem', md: '3rem' },
              background: 'linear-gradient(120deg, #fff 30%, #ffd700 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 30px rgba(255,215,0,0.3)',
              display: 'flex',
              justifyContent: 'center',
              gap: 2,
              order: { xs: 1, md: 2 },
            }}
          >
            Mini Jeux
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, order: { xs: 2, md: 1 } }}>
            <Badge badgeContent={<HiScoreButton />}>
              <Avatar src={photoMoi} alt="Logo" sx={{ width: { xs: 48, md: 64 }, height: { xs: 48, md: 64 }, border: '2px solid white' }} />
            </Badge>
            {/* Indicateur de progression */}
            <Box>
              <Typography
                variant="subtitle1"
                sx={{
                  mt: 1,
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: 600,
                  letterSpacing: 1,
                  textAlign: 'center',
                  fontSize: { xs: '0.75rem', md: '1rem' },
                }}
              >
                🌟 {played}/{total} jeux ({progress}%)
              </Typography>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(90deg, #ffcc00, #ff6600)',
                  },
                }}
              />
            </Box>
          </Box>

          <Box sx={{ flex: { xs: 'unset', md: 2 }, width: { xs: '100%', md: 'auto' }, textAlign: 'center', order: 3 }}>
            {/* Slogan */}
            <Typography
              sx={{
                color: 'rgba(255,255,255,0.9)',
                letterSpacing: 2,
                mb: 0.5,
                fontSize: { xs: '0.75rem', md: '1rem' },
                display: { xs: 'none', sm: 'block' },
              }}
            >
              Une collection épique de jeux addictifs
            </Typography>
            {/* Barre d'informations légales / contact */}
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: { xs: '0.7rem', md: '0.85rem' },
                display: 'flex',
                justifyContent: 'center',
                gap: 1.5,
                mt: { xs: 0, md: 1 },
                flexWrap: 'wrap',
              }}
            >
              © 2026 David Poilevey |
              <Link component="button" underline="hover" sx={{ color: '#ffd700' }} onClick={handleOpenMentions}>
                Mentions légales
              </Link>
              |
              <Link component="button" underline="hover" sx={{ color: '#ffd700' }} onClick={handleOpenContact}>
                Contact
              </Link>
            </Typography>
          </Box>
        </Box>



      </Box>

      {/* Dialog Mentions Légales */}
      <Dialog open={openMentions} onClose={handleCloseMentions} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center' }}>Mentions légales & Confidentialité</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" paragraph>
            Ce site est un projet personnel développé par David Poilevey. Il présente une collection de mini-jeux
            réalisés en React.
          </Typography>
          <Typography variant="body2" paragraph>
            Hébergeur : GitHub Pages — GitHub, Inc. — San Francisco, CA, USA.
          </Typography>
          <Typography variant="body2" paragraph>
            Données personnelles : aucune information nominative n’est collectée. Le site utilise Google Analytics à
            des fins de statistiques anonymes.
          </Typography>
          <Typography variant="body2" paragraph>
            © 2025 David Poilevey — Tous droits réservés. Toute reproduction du contenu est interdite sans autorisation
            préalable.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMentions}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Contact */}
      <Dialog open={openContact} onClose={handleCloseContact} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center' }}>Contact</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" paragraph textAlign="center">

            Ce site est un projet personnel réalisé par David Poilevey
            , passionné de développement React et de jeux rétro.

          </Typography>
          <Typography variant="body2" paragraph textAlign="center">
            Pour toute question ou remarque :
          </Typography>
          <Typography
            variant="body2"
            textAlign="center"
            sx={{ fontWeight: 600, color: 'primary.main', userSelect: 'all' }}
          >
            david.poilevey@gmail.com
          </Typography>
          <ChuckNorrisFact />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseContact}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export const AppBackButton = ({ selectedApp, returnBack }) => {
  const [showHint, setShowHint] = useState(false);
  const [corner, setCorner] = useState("bottom-right");
  const [visible, setVisible] = useState(true);
  const isMobile = useIsMobile();
  const timerRef = useRef(null);

  const toggleCorner = () => {
    const corners = ["top-right", "bottom-right", "bottom-left", "top-left"];
    const next = corners[(corners.indexOf(corner) + 1) % corners.length];
    setCorner(next);
  };
  const resetTimer = useCallback(() => {
    setVisible(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), 3000);
  }, [selectedApp]);

  useEffect(() => {
    resetTimer();
    window.addEventListener('mousemove', resetTimer);
    return () => {
      window.removeEventListener('mousemove', resetTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resetTimer]);

  useEffect(() => {
    const alreadySeen = localStorage.getItem("seenMenuHint");
    if (alreadySeen !== "true") {
      setShowHint(true);
      localStorage.setItem("seenMenuHint", "true");
    }
  }, []);

  useEffect(() => {
    document.title = "Mini Jeux de David Poilevey";
  }, []);

  if (selectedApp == null) return null;
  if(selectedApp?.noBackButton)  return null;
  if (isMobile) return null;

  const Icon = Icons[selectedApp.icon] || Icons['SportsEsports'];

  const positionStyles = {
    position: 'absolute',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(0,0,0,0.5)',
    borderRadius: '12px',
    padding: '8px 16px',
    backdropFilter: 'blur(6px)',
    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
    color: 'white',
    pointerEvents: 'auto',
    opacity: visible ? 1 : 0,
    transition: 'opacity 0.8s ease-in-out, all 0.4s ease-in-out',
    ...(corner.includes('top') ? { top: 10 } : { bottom: 10 }),
    ...(corner.includes('right') ? { right: 10 } : { left: 10 }),
  };
  return <Box
    className="game-header"
    sx={positionStyles}
  >

    {/* Bouton Quitter / Retour */}
    <Tooltip
      open={showHint}
      title="Clique ici à tout moment pour retourner au menu principal"
      arrow
      TransitionComponent={Grow}
      TransitionProps={{ timeout: 600 }}
    >
      <IconButton
        onClick={returnBack}
        onMouseEnter={() => setShowHint(true)}
        onMouseLeave={() => setShowHint(false)}
        sx={{
          background: 'linear-gradient(135deg, #ff5555, #ff8888)',
          color: 'white',
          '&:hover': {
            background: 'linear-gradient(135deg, #ff6666, #ffaaaa)',
            transform: 'scale(1.05)',
          },
          transition: 'all 0.2s ease-in-out',
        }}
      >
        <Icons.ArrowBackIos fontSize="small" />
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            textTransform: 'uppercase',
          }}
        > Quitter
        </Typography>
      </IconButton>
    </Tooltip>
    {/* Nom du jeu en cours */}
    <Typography
      variant="h6"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1, ml: 1,
        fontWeight: 700,
        textShadow: '0 2px 4px rgba(0,0,0,0.4)',
      }}
    >
      {selectedApp.name}
    </Typography>
    <IconButton onClick={toggleCorner} color="primary">
      <Icon />
    </IconButton>

  </Box>

}