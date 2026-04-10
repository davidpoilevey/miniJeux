import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Box,
    Typography,
    Divider,
    Stack,
    Button,
    Paper,
    Chip,
    Grid,
    IconButton,
    LinearProgress,
    Card,
    CardContent,
    Avatar,
    Tooltip,
    Menu,
    MenuItem,
    Icon
} from '@mui/material';
import {
    RestartAlt,
    PlayArrow,
    Pause,
    Timer,
    EmojiEvents,
    TrendingUp,
    Assessment,
    SaveAltOutlined,
    DownloadForOffline,
    CloudDownloadTwoTone,
    CloudUploadTwoTone,
    MoreVert,
    Settings,
    RestartAltTwoTone,
    Undo,
    TimerOff,
    Info
} from '@mui/icons-material';
import { CASE_SIZE } from '../dames/Case';
import { useChess } from './ChessContext';
import { pickAIDialogue } from '../dames/Bavardage';
import ParametresDialog from './ParamDialog';
import { searchRoot } from './reflexions';

export default function InfoPanel({
    reset, gameOver

}) {
    const { echec, captured, message, savePartie, loadPartie
        ,puzzle, puzzleManager,openingManager,humanReadableMove,cases,setMessage,
        timer, tourBlancs, gamePhase, moveCount, getTotalValue, handleUndo } = useChess();
    const currentPlayer = tourBlancs ? 'white' : 'black';
    const [gameTimer, setGameTimer] = useState(0);
    const [pickMessage, setPickMessage] = useState();
    const [isTimerRunning, setIsTimerRunning] = useState(true);
    const [moveHistory, setMoveHistory] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [indice, setHint] = useState();
    const open = Boolean(anchorEl);
    
    const getPuzzleHint=useCallback(()=>{
        if(puzzleManager)
            return puzzleManager.getHint();
        return '';
    },[puzzleManager]);

    const giveHint = ()=>{
       const bestMove = searchRoot(cases,currentPlayer,4);
       setMessage(`Tu devrais jouer le ${bestMove.piece.type} - ${openingManager.formatMove(bestMove,true)}`)
    }
const [openConfig, setOpenConfig] = useState(gamePhase=='debut');
    const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);
    // Chronomètre permanent
    useEffect(() => {
        let interval;
        if (isTimerRunning) {
            interval = setInterval(() => {
                setGameTimer(prev => {
                    if (prev >= timer) {
                        clearInterval(interval);
                        gameOver('Temps ecoulé', 'black');
                        setIsTimerRunning(false);
                        return timer; // Arrêter le timer si on atteint la limite
                    }
                    return prev + 1
                }
                );
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning]);


    useEffect(() => {
        setGameTimer(0);
    }, [timer]);
    const captureCount = useRef({ white: 0, black: 0 });
    useEffect(() => {
        if (!tourBlancs) return; // Ne pas exécuter si ce n'est pas le tour des blancs
        if(Math.random() < 0.5) return; // 50% de chance de ne pas afficher de message
        let hasCaptured = false, hasTaken = false;
        if (captured.white.length > captureCount.current.white) {
            captureCount.current.white = captured.white.length;
            hasCaptured = true;
        }
        if (captured.black.length > captureCount.current.black) {
            captureCount.current.black = captured.black.length;
            hasTaken = true;
        }

        const line = pickAIDialogue({
            aiCount: getTotalValue('black') - 100,
            playerCount: getTotalValue('white') - 100,// 100 pour le roi
            captured: hasCaptured,
            taken: hasTaken,
            echec
        });
        if (line) {
            setPickMessage(line);
        }
    }, [tourBlancs]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleTimer = () => {
        setIsTimerRunning(!isTimerRunning);
    };

    const resetTimer = () => {
        setGameTimer(0);
        setIsTimerRunning(true);
    };

    const handleReset = () => {
        reset();
        resetTimer();
        setMoveHistory([]);
    };

    // Calcul de la valeur des pièces capturées
    const getPieceValue = (type) => {
        const values = {
            'pion': 1,
            'cavalier': 3,
            'fou': 3,
            'tour': 5,
            'reine': 9,
            'roi': 0
        };
        return values[type] || 0;
    };

    const whiteScore = captured.white.reduce((sum, piece) => sum + getPieceValue(piece), 0);
    const blackScore = captured.black.reduce((sum, piece) => sum + getPieceValue(piece), 0);
    const materialAdvantage = whiteScore - blackScore;

    const getPhaseColor = (phase) => {
        switch (phase) {
            case 'opening': return '#4caf50';
            case 'middlegame': return '#ff9800';
            case 'endgame': return '#f44336';
            default: return '#2196f3';
        }
    };

    const getPhaseLabel = (phase) => {
        if(puzzle)
            return puzzle.name;
        if(openingManager.isActive) {
            return `${openingManager.currentOpening.name}. coup ${openingManager.moveIndex + 1}`;
        };
        switch (phase) {
            case 'opening': return 'Ouverture';
            case 'middlegame': return 'Milieu de jeu';
            case 'endgame': return 'Finale';
            default: return 'Partie';
        }
    };

    return (
        <Box sx={{
            minWidth: 280,
            maxWidth: 320,
            maxHeight: CASE_SIZE * 9,
            overflow: 'auto',
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            background: 'linear-gradient(275deg, #b7ab7bff 0%, #ddbf49ff 100%)',
            border: '1px solid rgba(0,0,0,0.06)'
        }}>
            {/* Header avec gradient */}
            <Box sx={{
                background: 'linear-gradient(135deg, #b7ab7bff 0%, #ddbf49ff 100%)',
                color: 'white',
                p: 2,
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 2,
                mb: 2,
                boxShadow: 3,
            }}>
                {/* Halo décoratif */}
                <Box sx={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    background: 'rgba(250, 250, 250, 0.2)',
                    opacity: 0.3
                }} />

                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    {/* Titre + icône */}

                    {/* Chrono */}
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <IconButton color="primary" onClick={()=>{toggleTimer()}}>
                           {isTimerRunning?<Timer />:<TimerOff/>}
                            </IconButton>
                        <Typography variant="body1" fontWeight="medium">
                            {formatTime(gameTimer)}
                        </Typography>
                        {timer != null && (
                            <Typography variant="body2" sx={{ ml: 1, opacity: 0.8 }}>
                                ({formatTime(timer - gameTimer)} restantes)
                            </Typography>
                        )}
                    </Stack>

                    {/* Bouton More */}
                    <Box>
                        <Tooltip title="Actions">
                            <IconButton onClick={handleMenuOpen} sx={{ color: 'white' }}>
                                <MoreVert />
                            </IconButton>
                        </Tooltip>
                        <Menu
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleMenuClose}
                            PaperProps={{
                                sx: {
                                    borderRadius: 2,
                                    mt: 1,
                                    minWidth: 200,
                                }
                            }}
                        >
                            <MenuItem onClick={() => { handleMenuClose(); setOpenConfig(true); }}>
                            <Settings sx={{ mr: 1 }} /> Configurer la partie
                            </MenuItem>
                            <MenuItem onClick={() => { savePartie(); handleMenuClose(); }}>
                                <CloudUploadTwoTone sx={{ mr: 1 }} /> Sauvegarder la partie
                            </MenuItem>
                            <MenuItem onClick={() => { loadPartie(); handleMenuClose(); }}>
                                <CloudDownloadTwoTone sx={{ mr: 1 }} /> Recharger la partie
                            </MenuItem>
                            <Divider />
                            <MenuItem onClick={() => { handleReset(); handleMenuClose(); }}>
                                <RestartAlt sx={{ mr: 1 }} /> Réinitialiser
                            </MenuItem>
                            <MenuItem onClick={() => { toggleTimer(); handleMenuClose(); }}>
                                {isTimerRunning ? <Pause sx={{ mr: 1 }} /> : <PlayArrow sx={{ mr: 1 }} />}
                                {isTimerRunning ? 'Mettre en pause' : 'Démarrer le chrono'}
                            </MenuItem>
                        </Menu>
                    </Box>
                </Stack>
                <Box sx={{ justifyContent: 'space-between', display: 'flex', alignItems: 'center', gap: 1 }}>

                <Chip
                    label={getPhaseLabel(gamePhase)}
                    size="small"
                    sx={{
                        bgcolor: getPhaseColor(gamePhase),
                        color: 'white',maxWidth:'150px',
                        fontWeight: 'bold'
                    }}
                />
                 <Tooltip title="Annuler dernier coup">
                <Button size="small" color='warning' variant="contained" onClick={() => {
                        handleUndo();}}>
                            <Undo/>
                        </Button>
                </Tooltip>
                <Tooltip title="Abandonner / Recommencer">
                <Button size="small" color='success' variant="contained"  onClick={() => {
                        setOpenConfig(true);}}>
                            <RestartAltTwoTone/>
                        </Button>
                </Tooltip>
                </Box>
            </Box>

            <Box sx={{ p: 2, space: 2 }}>
              
                {/* pickMessage */}
                {puzzle?<Button variant="contained" onClick={()=>{setHint(getPuzzleHint())}}>
                    {indice?indice:"Cliquer pour un indice"}
                </Button>
                    :pickMessage && (
                    <Typography
                        size="small" 
                        sx={{
                            fontWeight: 'bold', padding: 2,marginBottom: 2,
                            borderRadius: 5,
                            background: 'rgba(232, 229, 229, 0.41)',
                        }}
                    >{pickMessage}</Typography>
                )}


                {/* État de la partie */}
                <Card sx={{ mb: 2, borderRadius: 2, boxShadow: 2 }}>
                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Stack spacing={1}>
                            {/* Joueur actuel */}
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Avatar sx={{
                                    width: 24,
                                    height: 24,
                                    bgcolor: currentPlayer === 'white' ? '#f5f5f5' : '#424242',
                                    color: currentPlayer === 'white' ? '#000' : '#fff',
                                    fontSize: 14
                                }}>
                                    {currentPlayer === 'white' ? '♔' : '♚'}
                                </Avatar>
                                {openingManager.isActive ? 
                                    <Typography variant="body2" fontWeight="medium">
                               {humanReadableMove(openingManager.currentOpening.moves[openingManager.moveIndex])}
                                </Typography>:
                                <Typography variant="body2" fontWeight="medium" flex={1}>
                                    Au tour des {currentPlayer === 'white' ? 'Blancs' : 'Noirs'}
                                </Typography>}

                                <Typography variant="body2" color="text.secondary">
                                    Coup #{Math.floor(moveCount / 2) + 1}
                                </Typography>
                                <IconButton onClick={giveHint}>
                                    <Info/>
                                </IconButton>
                            </Stack>

                            {/* Phase de jeu */}
                            <Stack direction="row" alignItems="center" spacing={1}>
                                {message && (

                                    <Typography sx={{ color: '#06305aff', fontWeight: 'medium' }}>
                                        {message}
                                    </Typography>

                                )}
                            </Stack>
                              {materialAdvantage !== 0 && <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                <TrendingUp color="success" />
                                <Typography variant="body2" fontWeight="medium">
                                    Avantage matériel
                                </Typography>
                           
                            <Typography
                                variant="h6"
                                fontWeight="bold"
                                color={materialAdvantage > 0 ? 'success.main' : 'error.main'}
                            >
                                {materialAdvantage > 0 ? '♔' : '♚'} {materialAdvantage}
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={Math.min(Math.abs(materialAdvantage) * 10, 100)}
                                color={materialAdvantage > 0 ? 'success' : 'error'}
                                sx={{ mt: 1, borderRadius: 1, height: 6 }}
                            />
                            </Stack>}
                        </Stack>
                    </CardContent>
                </Card>
                {/* Messages d'état */}
                {echec && (
                    <Paper sx={{
                        p: 1.5,
                        mb: 2,
                        bgcolor: '#ffebee',
                        border: '2px solid #f44336',
                        borderRadius: 2,
                        animation: 'pulse 1.5s infinite'
                    }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography sx={{ fontSize: 20 }}>⚠️</Typography>
                            <Typography sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
                                Échec !
                            </Typography>
                        </Stack>
                    </Paper>
                )}





             

                {/* Pièces capturées */}
                <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                            <Assessment color="primary" />
                            <Typography variant="body2" fontWeight="medium">
                                Pièces capturées
                            </Typography>
                        </Stack>

                        <Grid container spacing={1}>
                            <Grid item xs={12}>
                                <Paper sx={{ p: 1, bgcolor: '#fafafa', borderRadius: 1 }}>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Typography variant="body2" fontWeight="medium">
                                            ♔ Blancs ({whiteScore}):
                                        </Typography>
                                        <Box sx={{display:'flex',flexWrap:'wrap'}}>
                                            {captured.black.length > 0 ? (
                                                captured.black.map((p, i) => (
                                                    <span key={i} style={{ textShadow: '2px 2px 4px #000', fontSize: 36, color:'white', marginRight: 4 }}>
                                                        {emojiPiece(p)}
                                                    </span>
                                                ))
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    Aucune
                                                </Typography>
                                            )}
                                        </Box>
                                    </Stack>
                                </Paper>
                            </Grid>

                            <Grid item xs={12}>
                                <Paper sx={{ p: 1, bgcolor: '#fafafa', borderRadius: 1 }}>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Typography variant="body2" fontWeight="medium">
                                            ♚ Noirs ({blackScore}):
                                        </Typography>
                                        <Box sx={{display:'flex',flexWrap:'wrap'}}>
                                            {captured.white.length > 0 ? (
                                                captured.white.map((p, i) => (
                                                    <span key={i} style={{ textShadow: '1px 1px 4px #eee', fontSize: 36, marginRight:4 }}>
                                                        {emojiPiece(p)}
                                                    </span>
                                                ))
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    Aucune
                                                </Typography>
                                            )}
                                        </Box>
                                    </Stack>
                                </Paper>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Statistiques rapides */}
                <Card sx={{ mt: 2, borderRadius: 2, boxShadow: 2 }}>
                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                            📊 Statistiques
                        </Typography>
                        <Grid container spacing={1}>
                            <Grid item xs={4}>
                                <Typography variant="body2" color="text.secondary">
                                    Coups
                                </Typography>
                                <Typography variant="h6" fontWeight="bold">
                                    {moveCount}
                                </Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography variant="body2" color="text.secondary">
                                    Captures
                                </Typography>
                                <Typography variant="h6" fontWeight="bold">
                                    {captured.white.length + captured.black.length}
                                </Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography variant="body2" color="text.secondary">
                                    Rythme
                                </Typography>
                                <Typography variant="h6" fontWeight="bold">
                                    {gameTimer > 0 ? Math.round(moveCount / (gameTimer / 60)) : 0}/min
                                </Typography>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Box>

            <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.7; }
          100% { opacity: 1; }
        }
      `}</style>

<ParametresDialog 
  open={openConfig} 
  reset={handleReset}
  handleClose={() => setOpenConfig(false)} 
/>
        </Box>
    );
}

function emojiPiece(type) {
    switch (type) {
        case 'pion': return '♟';
        case 'cavalier': return '♞';
        case 'tour': return '♜';
        case 'fou': return '♝';
        case 'reine': return '♛';
        case 'roi': return '♚';
        default: return '?';
    }
}