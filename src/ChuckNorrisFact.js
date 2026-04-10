import { Recycling, RestartAlt } from '@mui/icons-material';
import React, { useEffect, useState } from 'react';
import { translateProperty } from './jds/components/PlanteInfo';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
  Slide,
  IconButton,
  Divider,
  Popover,
  TextField,
  CircularProgress,
  List,
  ListItem,
  Collapse,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import ReplayIcon from "@mui/icons-material/Replay";
import CloseIcon from "@mui/icons-material/Close";
import PublishIcon from "@mui/icons-material/Publish";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import { useGlobalScores } from './App';
import { PSEUDO_KEY, saveScoreToPocketBase, fetchTop10, fetchBestPerGame } from './pocketbaseScores';

const ChuckNorrisFact = ()=> {
  const [fact, setFact] = useState('');
  const [en_fact, setENFact] = useState('');
  const [trlstd, setTranslated] = useState(false);

  useEffect(()=>{
    handleFetchFact();
  },[]);



  useEffect(() => {
    const translateFact = async () => {
        if(en_fact!==''){
            const translation = await translateProperty(en_fact);
            setFact(translation);
            setTranslated(true);

        }
    };
    if(!trlstd)
        translateFact();
  }, [en_fact,trlstd]);

  const handleFetchFact = () => {
    setTranslated(false);
    fetch('https://api.chucknorris.io/jokes/random')
      .then((response) => response.json())
      .then((data) => {
        setENFact(data.value);
      })
      .catch((error) => {
        console.error('Error fetching Chuck Norris fact:', error);
        setFact('Erreur lors de la récupération du Chuck Norris fact.');
      });
  };
  
  return (
    <Box style={{justifyContent:'center',alignItems:'center',padding:'20px',display:'flex'}}>
        <Box style={{flexDirection:'column', display:'flex'}}>

        <Typography style={{textAlign:'center',fontSize: '24px',  textShadow: '2px 2px 10px rgba(0, 0, 0, 0.3)'}}>{fact}</Typography>
    <Typography style={{textAlign:'center',fontSize: '14px',  textShadow: '2px 2px 10px rgba(100, 100, 100, 0.3)'}}>{en_fact}</Typography>
        </Box>
    <IconButton onClick={handleFetchFact}><RestartAlt/></IconButton>
    </Box>
  );
}

export default ChuckNorrisFact;



export const GameOver = ({ open = false, gameName, score, gameOverReason, handleClose, handleRestart}) => {
  const { setScore, getScoreByGame } = useGlobalScores();
  const [hiScore, setHiScore] = useState("Aucun");
  const [isNewRecord, setIsNewRecord] = useState(false);

  // PocketBase
  const [pseudo, setPseudo] = useState(() => localStorage.getItem(PSEUDO_KEY) || '');
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [publishError, setPublishError] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [top10, setTop10] = useState([]);
  const [loadingTop10, setLoadingTop10] = useState(false);

  const doClose = (evt, reason) => {
    if(window.gtag)
      window.gtag('event', 'jeu_termine', { event_label: gameName, score: score });
    if (reason !== "backdropClick") handleClose(evt);
  };

  const doRestart = (evt) => {
    handleRestart();
    doClose(evt);
  };

  useEffect(() => {
    if (!open) return;
    // reset publication state on each open
    setPublished(false);
    setPublishError(null);
    setShowLeaderboard(false);
    setTop10([]);
    if (gameName != null) {
      let newRecord = false;
      const hiscores = getScoreByGame(gameName);
      if (hiscores != null && hiscores.score != null) {
        setHiScore(hiscores.score);
        if (score > hiscores.score) {
          setScore(gameName, score);
          newRecord = true;
        }
      } else {
        setHiScore("Aucun");
        setScore(gameName, score);
        newRecord = true;
      }
      setIsNewRecord(newRecord);
      if (newRecord && window.gtag) {
        window.gtag('event', 'hiscore_nouveau', {
          event_category: 'score',
          event_label: gameName,
          value: score,
        });
      }
      // Pas un nouveau record → marquer published pour éviter la détection legacy
      if (!newRecord) {
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
      }
    }
  }, [open, gameName, score]);

  const handlePublish = async () => {
    if (!pseudo.trim()) return;
    localStorage.setItem(PSEUDO_KEY, pseudo.trim());
    setPublishing(true);
    setPublishError(null);
    try {
      await saveScoreToPocketBase(gameName, score, pseudo.trim());
      setPublished(true);
      if (window.gtag) {
        window.gtag('event', 'score_publie', {
          event_category: 'score',
          event_label: gameName,
          value: score,
        });
      }
      // Fetch leaderboard right after publishing
      handleShowLeaderboard();
    } catch (e) {
      setPublishError("Erreur lors de l'envoi. Réessaie !");
    } finally {
      setPublishing(false);
    }
  };

  const handleShowLeaderboard = async () => {
    setShowLeaderboard(true);
    if (window.gtag) {
      window.gtag('event', 'leaderboard_vu', {
        event_category: 'engagement',
        event_label: gameName,
      });
    }
    setLoadingTop10(true);
    try {
      const items = await fetchTop10(gameName);
      setTop10(items);
    } catch (e) {
      setTop10([]);
    } finally {
      setLoadingTop10(false);
    }
  };

  const medalColor = (i) => ['#FFD700', '#C0C0C0', '#CD7F32'][i] ?? '#aaa';

  return (
    <Dialog
      open={open}
      onClose={doClose}
      maxWidth="xs"
      fullWidth
      TransitionComponent={Slide}
      TransitionProps={{ direction: "up" }}
      PaperProps={{
        sx: {
          background: "#1c1c1cff",
          border: "2px solid gold",
          color: "white",
          fontFamily: '"Press Start 2P", monospace',
          textAlign: "center"
        }
      }}
    >
      <DialogTitle sx={{ fontSize: 16, color: "#FFD700" }}>
        🎮 Partie terminée
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} alignItems="center">
          <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
            {gameOverReason && (
              <Typography variant="h6" sx={{ color: "#e3cfaaff" }}>
                {gameOverReason}
              </Typography>
            )}
            <Typography variant="h6" sx={{ color: "white" }}>
              Votre score :
            </Typography>
            <Typography variant="h4" sx={{ color: "#00FF88" }}>
              {score}
            </Typography>
          </Box>

          {isNewRecord && (
            <Box
              sx={{
                background: "#222",
                border: "1px solid gold",
                px: 2,
                py: 1,
                borderRadius: 2,
                animation: "pulse 1s infinite alternate"
              }}
            >
              <EmojiEventsIcon sx={{ color: "gold", mr: 1 }} />
              <Typography sx={{ color: "#FFD700", fontWeight: "bold" }}>
                Nouveau record !
              </Typography>
            </Box>
          )}

          {!isNewRecord && (
            <Typography variant="body2" sx={{ color: "#aaa" }}>
              🏆 Hi-score local :{" "}
              <strong style={{ color: "#ffdd55" }}>{hiScore}</strong>
            </Typography>
          )}

          <Divider sx={{ width: "100%", borderColor: "#444" }} />

          {isNewRecord && (
            <>
              {/* Publication PocketBase — uniquement si nouveau record */}
              {!published ? (
                <Box sx={{ width: "100%" }}>
                  <Typography variant="body2" sx={{ color: "#aaa", mb: 1 }}>
                    Publier dans le classement mondial :
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <TextField
                      size="small"
                      variant="outlined"
                      placeholder="Ton pseudo"
                      value={pseudo}
                      onChange={(e) => setPseudo(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handlePublish()}
                      inputProps={{ maxLength: 20 }}
                      sx={{
                        flex: 1,
                        input: { color: "white", fontSize: 12 },
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": { borderColor: "#555" },
                          "&:hover fieldset": { borderColor: "#aaa" },
                          "&.Mui-focused fieldset": { borderColor: "#FFD700" },
                        },
                      }}
                    />
                    <Button
                      onClick={handlePublish}
                      disabled={publishing || !pseudo.trim()}
                      variant="contained"
                      startIcon={publishing ? <CircularProgress size={14} color="inherit" /> : <PublishIcon />}
                      sx={{ backgroundColor: "#FFD700", color: "#111", fontWeight: "bold", "&:hover": { backgroundColor: "#ffc107" }, fontSize: 10, whiteSpace: "nowrap" }}
                    >
                      Publier
                    </Button>
                  </Box>
                  {publishError && (
                    <Typography variant="body2" sx={{ color: "#f44", mt: 0.5, fontSize: 10 }}>
                      {publishError}
                    </Typography>
                  )}
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: "#00FF88" }}>
                  ✅ Score publié !
                </Typography>
              )}

            </>
          )}

          {/* Bouton leaderboard — toujours visible */}
          {!showLeaderboard && (
            <Button
              size="small"
              startIcon={<LeaderboardIcon />}
              onClick={handleShowLeaderboard}
              sx={{ color: "#aaa", fontSize: 10, textTransform: "none" }}
            >
              Voir le top 10
            </Button>
          )}

          <Collapse in={showLeaderboard} sx={{ width: "100%" }}>
            <Typography variant="body2" sx={{ color: "#FFD700", mb: 1, fontSize: 11 }}>
              🏆 Top 10 — {gameName}
            </Typography>
            {loadingTop10 ? (
              <CircularProgress size={20} sx={{ color: "#FFD700" }} />
            ) : (
              <List dense disablePadding>
                {top10.map((item, i) => (
                  <ListItem
                    key={item.id}
                    disableGutters
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      px: 1,
                      py: 0.25,
                      borderRadius: 1,
                      background: item.user === pseudo && item.score === score ? "rgba(0,255,136,0.08)" : "transparent",
                    }}
                  >
                    <Typography sx={{ color: medalColor(i), fontSize: 11, minWidth: 24 }}>
                      {i + 1}.
                    </Typography>
                    <Typography sx={{ color: "#ddd", fontSize: 11, flex: 1, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.user}
                    </Typography>
                    <Typography sx={{ color: "#00FF88", fontSize: 11, fontWeight: "bold" }}>
                      {item.score}
                    </Typography>
                  </ListItem>
                ))}
                {top10.length === 0 && (
                  <Typography variant="body2" sx={{ color: "#666", fontSize: 10 }}>
                    Aucun score enregistré.
                  </Typography>
                )}
              </List>
            )}
          </Collapse>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
        <Button
          onClick={handleClose}
          startIcon={<CloseIcon />}
          variant="outlined"
          sx={{ borderColor: "#555", color: "#ccc" }}
        >
          Fermer
        </Button>
        {typeof handleRestart === 'function' && (
          <Button
            onClick={doRestart}
            startIcon={<ReplayIcon />}
            variant="contained"
            sx={{
              backgroundColor: "#FFD700",
              color: "#111",
              fontWeight: "bold",
              "&:hover": { backgroundColor: "#ffc107" }
            }}
          >
            Recommencer
          </Button>
        )}
      </DialogActions>

      <style>
        {`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.05); opacity: 0.8; }
        }
      `}
      </style>
    </Dialog>
  );
};

export const HiScoreButton = React.forwardRef((props, ref) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [globalScores, setGlobalScores] = useState([]);
  const [loadingScores, setLoadingScores] = useState(false);
  const [legacyScores, setLegacyScores] = useState(null);
  const [migrationOpen, setMigrationOpen] = useState(false);
  const [migrationPseudo, setMigrationPseudo] = useState(() => localStorage.getItem(PSEUDO_KEY) || '');
  const [migrating, setMigrating] = useState(false);
  const [migrationDone, setMigrationDone] = useState(false);

  // Détection des scores localStorage hérités au montage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('dpyScores');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Object.values(parsed).some(d => d?.score > 0 && !d?.published)) setLegacyScores(parsed);
      }
    } catch {}
  }, []);

  const loadGlobalScores = async () => {
    setLoadingScores(true);
    try { setGlobalScores(await fetchBestPerGame()); } catch {}
    finally { setLoadingScores(false); }
  };

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    loadGlobalScores();
  };
  const handleClose = () => setAnchorEl(null);

  const handleMigrate = async () => {
    if (!migrationPseudo.trim() || !legacyScores) return;
    localStorage.setItem(PSEUDO_KEY, migrationPseudo.trim());
    setMigrating(true);
    try {
      await Promise.all(
        Object.entries(legacyScores)
          .filter(([, d]) => d?.score > 0)
          .map(([gameName, { score }]) => saveScoreToPocketBase(gameName, score, migrationPseudo.trim()))
      );
      localStorage.removeItem('dpyScores');
      setLegacyScores(null);
      setMigrationDone(true);
      setMigrationOpen(false);
      loadGlobalScores();
    } catch (e) { console.error(e); }
    finally { setMigrating(false); }
  };
  const legacyEntries = Object.entries(legacyScores || {}).filter(([, d]) => d?.score > 0 && !d?.published);

  const hasLegacy = legacyEntries.length > 0 && !migrationDone;
  const open = Boolean(anchorEl);
  const id = open ? "hiscore-popover" : undefined;

  return (
    <>
      <IconButton ref={ref}
        onClick={handleOpen}
        color="primary"
        aria-describedby={id}
        size="large"
        sx={{
          backgroundColor: "#ffe082",
          "&:hover": { backgroundColor: "#ffca28" },
          ...(hasLegacy && { animation: "hiscoreFlash 1.2s ease-in-out infinite" }),
        }}
      >
        <EmojiEventsIcon />
      </IconButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: { p: 2, minWidth: 320, backgroundColor: "#fefefe", boxShadow: 3, borderRadius: 2 }
        }}
      >
        <Typography variant="h6" gutterBottom color="primary">
          🏆 Classement mondial
        </Typography>

        {hasLegacy && (
          <Box sx={{ mb: 2, p: 1.5, bgcolor: "rgba(255,215,0,0.12)", border: "1px solid #FFD700", borderRadius: 1 }}>
            <Typography variant="body2" sx={{ color: "#333", mb: 1 }}>
              📦 Tu as {legacyEntries.length} score(s) locaux non publiés !
            </Typography>
            <Button
              size="small"
              variant="contained"
              startIcon={<PublishIcon />}
              onClick={() => setMigrationOpen(true)}
              sx={{ backgroundColor: "#FFD700", color: "#111", fontWeight: "bold", "&:hover": { backgroundColor: "#ffc107" } }}
            >
              Publier dans le classement
            </Button>
          </Box>
        )}

        <Divider sx={{ mb: 1 }} />

        {loadingScores ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <CircularProgress size={24} color="primary" />
          </Box>
        ) : (
          <Stack spacing={0.5}>
            {globalScores.length === 0 && (
              <Typography variant="body2" color="text.secondary">Aucun score enregistré.</Typography>
            )}
            {globalScores.map((item) => (
              <Box key={item.gameName} sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.25 }}>
                <Typography variant="body2" sx={{ color: "#333", flex: 1, fontWeight: "bold", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {item.gameName}
                </Typography>
                <Typography variant="body2" sx={{ color: "#666", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {item.user}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: "bold", color: "#009688", minWidth: 40, textAlign: "right" }}>
                  {item.score}
                </Typography>
                <Typography variant="caption" sx={{ color: "#aaa", minWidth: 58, textAlign: "right" }}>
                  {new Date(item.created).toLocaleDateString('fr-FR')}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}
      </Popover>

      {/* Dialog de migration localStorage → PocketBase */}
      <Dialog open={migrationOpen} onClose={() => setMigrationOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>📤 Publier tes scores locaux</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Ces scores vont être publiés dans le classement mondial :
          </Typography>
          <Stack spacing={0.5} sx={{ mb: 2 }}>
            {legacyEntries.map(([game, { score }]) => (
              <Box key={game} sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2">{game}</Typography>
                <Typography variant="body2" sx={{ fontWeight: "bold", color: "#009688" }}>{score}</Typography>
              </Box>
            ))}
          </Stack>
          <TextField
            fullWidth
            size="small"
            label="Ton pseudo"
            value={migrationPseudo}
            onChange={e => setMigrationPseudo(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleMigrate()}
            inputProps={{ maxLength: 20 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMigrationOpen(false)} disabled={migrating}>Annuler</Button>
          <Button
            onClick={handleMigrate}
            variant="contained"
            disabled={migrating || !migrationPseudo.trim()}
            startIcon={migrating ? <CircularProgress size={14} color="inherit" /> : <PublishIcon />}
            sx={{ backgroundColor: "#FFD700", color: "#111", "&:hover": { backgroundColor: "#ffc107" } }}
          >
            Publier
          </Button>
        </DialogActions>
      </Dialog>

      <style>{`
        @keyframes hiscoreFlash {
          0%, 100% { background-color: #ffe082; box-shadow: none; }
          50% { background-color: #FFD700; box-shadow: 0 0 16px 5px rgba(255,215,0,0.75); }
        }
      `}</style>
    </>
  );
});

