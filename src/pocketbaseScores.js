import PocketBase from 'pocketbase';
import React, { useState } from 'react';
import {
  Box, Button, TextField, Typography, CircularProgress,
  List, ListItem, Collapse, IconButton, Popover, Stack, Divider,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PublishIcon from '@mui/icons-material/Publish';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';

export const pb = new PocketBase('https://bdd.poilevey.org');
export const PSEUDO_KEY = 'minijeux_pseudo';

export const saveScoreToPocketBase = async (gameName, score, user) => {
  const result = await pb.collection('scores').create({ user, score, gameName }, { requestKey: null });
  // Marquer comme publié dans le localStorage pour éviter la détection "legacy"
  try {
    const raw = localStorage.getItem('dpyScores');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed[gameName]) {
        parsed[gameName].published = true;
        localStorage.setItem('dpyScores', JSON.stringify(parsed));
      }
    }
  } catch {}
  return result;
};

export const fetchTop10 = async (gameName) => {
  const result = await pb.collection('scores').getList(1, 10, {
    sort: '-score',
    filter: `gameName = "${gameName}"`,
  });
  return result.items;
};

// Récupère le meilleur score par jeu (tous jeux confondus), trié par score desc.
export const fetchBestPerGame = async () => {
  const result = await pb.collection('scores').getList(1, 500, { sort: '-score' });
  const best = {};
  for (const item of result.items) {
    if (!best[item.gameName]) best[item.gameName] = item;
  }
  return Object.values(best).sort((a, b) => {
    const dateDiff = (Date.parse(b.created) || 0) - (Date.parse(a.created) || 0);
    if (dateDiff !== 0) return dateDiff;
    return a.gameName.localeCompare(b.gameName);
  });
};

// Noms des jeux ayant au moins un score publié.
export const fetchGamesWithScores = async () => {
  const result = await pb.collection('scores').getList(1, 500, { fields: 'gameName', requestKey: null });
  return new Set(result.items.map(item => item.gameName));
};

// Les scores publiés avant l'ajout du champ autodate `created` n'ont pas de date.
export const formatScoreDate = (created) =>
  created ? new Date(created).toLocaleDateString('fr-FR') : '—';

const medalColor = (i) => ['#FFD700', '#C0C0C0', '#CD7F32'][i] ?? '#aaa';

/**
 * Widget autonome "Publier mon score + Top 10"
 * À dropper dans n'importe quel écran de fin de jeu.
 * Props : gameName (string), score (number), darkMode (bool, défaut true)
 */
export const PublishScore = ({ gameName, score, darkMode = true }) => {
  const [pseudo, setPseudo] = useState(() => localStorage.getItem(PSEUDO_KEY) || '');
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [publishError, setPublishError] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [top10, setTop10] = useState([]);
  const [loadingTop10, setLoadingTop10] = useState(false);

  const textColor = darkMode ? '#ddd' : '#333';
  const mutedColor = darkMode ? '#aaa' : '#666';
  const bg = darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const borderColor = darkMode ? '#444' : '#ccc';

  const loadTop10 = async () => {
    setShowLeaderboard(true);
    setLoadingTop10(true);
    try {
      setTop10(await fetchTop10(gameName));
    } catch {
      setTop10([]);
    } finally {
      setLoadingTop10(false);
    }
  };

  const handlePublish = async () => {
    if (!pseudo.trim()) return;
    localStorage.setItem(PSEUDO_KEY, pseudo.trim());
    setPublishing(true);
    setPublishError(null);
    try {
      await saveScoreToPocketBase(gameName, score, pseudo.trim());
      setPublished(true);
      loadTop10();
    } catch {
      setPublishError("Erreur lors de l'envoi. Réessaie !");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <Box sx={{ mt: 2, p: 2, borderRadius: 2, background: bg, border: `1px solid ${borderColor}` }}>
      <Typography variant="body2" sx={{ color: mutedColor, mb: 1, fontSize: 12 }}>
        🌍 Publier dans le classement mondial
      </Typography>

      {!published ? (
        <>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Ton pseudo"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePublish()}
              inputProps={{ maxLength: 20 }}
              sx={{
                flex: 1,
                input: { color: textColor, fontSize: 12 },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor },
                  '&:hover fieldset': { borderColor: '#888' },
                  '&.Mui-focused fieldset': { borderColor: '#FFD700' },
                },
              }}
            />
            <Button
              onClick={handlePublish}
              disabled={publishing || !pseudo.trim()}
              variant="contained"
              size="small"
              startIcon={publishing ? <CircularProgress size={12} color="inherit" /> : <PublishIcon />}
              sx={{ backgroundColor: '#FFD700', color: '#111', fontWeight: 'bold', '&:hover': { backgroundColor: '#ffc107' }, fontSize: 11, whiteSpace: 'nowrap' }}
            >
              Publier
            </Button>
          </Box>
          {publishError && (
            <Typography sx={{ color: '#f44', fontSize: 10, mt: 0.5 }}>{publishError}</Typography>
          )}
        </>
      ) : (
        <Typography sx={{ color: '#00FF88', fontSize: 12 }}>✅ Score publié !</Typography>
      )}

      {!showLeaderboard && (
        <Button
          size="small"
          startIcon={<LeaderboardIcon />}
          onClick={loadTop10}
          sx={{ color: mutedColor, fontSize: 10, textTransform: 'none', mt: 0.5 }}
        >
          Voir le top 10
        </Button>
      )}

      <Collapse in={showLeaderboard}>
        <Typography sx={{ color: '#FFD700', fontSize: 11, mt: 1, mb: 0.5 }}>🏆 Top 10 — {gameName}</Typography>
        {loadingTop10 ? (
          <CircularProgress size={16} sx={{ color: '#FFD700' }} />
        ) : (
          <List dense disablePadding>
            {top10.map((item, i) => (
              <ListItem key={item.id} disableGutters sx={{ display: 'flex', justifyContent: 'space-between', px: 0.5, py: 0.1 }}>
                <Typography sx={{ color: medalColor(i), fontSize: 11, minWidth: 20 }}>{i + 1}.</Typography>
                <Typography sx={{ color: textColor, fontSize: 11, flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.user}
                </Typography>
                <Typography sx={{ color: '#00FF88', fontSize: 11, fontWeight: 'bold' }}>{item.score}</Typography>
              </ListItem>
            ))}
            {top10.length === 0 && (
              <Typography sx={{ color: '#666', fontSize: 10 }}>Aucun score enregistré.</Typography>
            )}
          </List>
        )}
      </Collapse>
    </Box>
  );
};

/**
 * Trophée + popover "Top 10" d'un seul jeu (même look que HiScoreButton, sans la migration).
 * Props : gameName (string), size ('small' | 'medium' | 'large', défaut 'small')
 */
export const GameTopButton = ({ gameName, size = 'small' }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [top10, setTop10] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleOpen = async (event) => {
    setAnchorEl(event.currentTarget);
    setLoading(true);
    try {
      setTop10(await fetchTop10(gameName));
    } catch {
      setTop10([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <IconButton
        onClick={handleOpen}
        aria-label={`Afficher le top 10 de ${gameName}`}
        color="primary"
        size={size}
        sx={{ backgroundColor: '#ffe082', '&:hover': { backgroundColor: '#ffca28' } }}
      >
        <EmojiEventsIcon fontSize="inherit" />
      </IconButton>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { p: 2, minWidth: 300, backgroundColor: '#fefefe', boxShadow: 3, borderRadius: 2 } }}
      >
        <Typography variant="h6" gutterBottom color="primary">🏆 Top 10 — {gameName}</Typography>
        <Divider sx={{ mb: 1 }} />
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} color="primary" />
          </Box>
        ) : (
          <Stack spacing={0.5}>
            {top10.length === 0 && (
              <Typography variant="body2" color="text.secondary">Aucun score enregistré.</Typography>
            )}
            {top10.map((item, i) => (
              <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.25 }}>
                <Typography variant="body2" sx={{ color: medalColor(i), fontWeight: 'bold', minWidth: 22 }}>{i + 1}.</Typography>
                <Typography variant="body2" sx={{ color: '#333', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.user}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#009688', minWidth: 40, textAlign: 'right' }}>
                  {item.score}
                </Typography>
                <Typography variant="caption" sx={{ color: '#aaa', minWidth: 58, textAlign: 'right' }}>
                  {formatScoreDate(item.created)}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}
      </Popover>
    </>
  );
};
