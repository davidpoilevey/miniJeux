import PocketBase from 'pocketbase';
import React, { useState } from 'react';
import {
  Box, Button, TextField, Typography, CircularProgress,
  List, ListItem, Collapse,
} from '@mui/material';
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
    const dateDiff = new Date(b.created) - new Date(a.created);
    if (dateDiff !== 0) return dateDiff;
    return a.gameName.localeCompare(b.gameName);
  });
};

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
