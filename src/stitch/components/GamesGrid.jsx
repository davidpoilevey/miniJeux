import { useState } from 'react';
import { Box, Grid, Typography, Chip, Badge, InputBase } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import { useFilteredGames, useTagsWithCounts, useIsMobile } from '../../hookGame';
import GameCard from './GameCard';

const LABEL_FONT = { fontFamily: '"Space Grotesk", sans-serif' };

const GamesGrid = ({ gamesData, searchQuery, onSelectGame }) => {
  const [selectedTags, setSelectedTags] = useState([]);
  // Mobile search — mirrors TopNavBar search for xs screens
  const [mobileSearch, setMobileSearch] = useState('');
  const isMobile = useIsMobile();

  // On mobile use local search, on desktop use the lifted prop from TopNavBar
  const effectiveQuery = isMobile ? mobileSearch : searchQuery;

  const effectiveTags = isMobile
    ? [...new Set([...selectedTags, 'mobileFriendly'])]
    : selectedTags;

  const tagsWithCounts = useTagsWithCounts(gamesData, effectiveQuery, effectiveTags);
  const filteredGames  = useFilteredGames(gamesData, effectiveQuery, effectiveTags);

  const handleToggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <Box>
      {/* Mobile search bar */}
      {isMobile && (
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: '#efe4f8',
          borderRadius: 6,
          px: 2, py: 0.75,
          mb: 2,
        }}>
          <SearchIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
          <InputBase
            placeholder="Chercher..."
            value={mobileSearch}
            onChange={e => setMobileSearch(e.target.value)}
            sx={{ flex: 1, fontSize: 14, color: 'text.primary' }}
          />
        </Box>
      )}

      {/* Tag filter — masqué sur mobile (filtre mobileFriendly déjà forcé) */}
      {!isMobile && <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }}>
          {tagsWithCounts.map(({ tag, count }) => (
            <Badge
              key={tag}
              badgeContent={count}
              color={selectedTags.includes(tag) ? 'secondary' : 'default'}
              sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', height: 15, minWidth: 15, p: '0 3px' } }}
            >
              <Chip
                label={tag}
                size="small"
                variant={selectedTags.includes(tag) ? 'filled' : 'outlined'}
                color={selectedTags.includes(tag) ? 'primary' : 'default'}
                onClick={() => count > 0 && handleToggleTag(tag)}
                disabled={count === 0}
                sx={{
                  ...LABEL_FONT,
                  fontSize: '0.6rem',
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                  height: 22,
                  cursor: count === 0 ? 'not-allowed' : 'pointer',
                  transition: 'all 200ms ease',
                  '&:hover': count > 0 ? { transform: 'scale(1.05)' } : {},
                }}
              />
            </Badge>
          ))}
          {selectedTags.length > 0 && (
            <Chip
              label="Effacer"
              size="small"
              color="error"
              variant="outlined"
              icon={<ClearIcon fontSize="small" />}
              onClick={() => setSelectedTags([])}
              sx={{ ...LABEL_FONT, fontSize: '0.6rem', height: 22 }}
            />
          )}
        </Box>
        <Typography sx={{ ...LABEL_FONT, fontSize: '0.65rem', color: 'text.secondary', mt: 1 }}>
          {filteredGames.length} jeu{filteredGames.length > 1 ? 'x' : ''} trouvé{filteredGames.length > 1 ? 's' : ''}
          {selectedTags.length > 0 && ` — ${selectedTags.length} tag${selectedTags.length > 1 ? 's' : ''} actif${selectedTags.length > 1 ? 's' : ''}`}
        </Typography>
      </Box>}

      {/* Game grid */}
      <Grid container spacing={3}>
        {filteredGames.map(jeu => (
          <Grid item xs={12} sm={6} lg={4} key={jeu.id || jeu.name}>
            <GameCard jeu={jeu} onSelect={onSelectGame} />
          </Grid>
        ))}
      </Grid>

      {/* Footer hint */}
      {filteredGames.length > 0 && (
        <Box sx={{ mt: 10, display: 'flex', justifyContent: 'center', gap: 1 }}>
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'rgba(164,34,127,0.2)' }} />
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'rgba(0,100,125,0.2)' }} />
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'rgba(0,105,64,0.2)' }} />
        </Box>
      )}
    </Box>
  );
};

export default GamesGrid;
