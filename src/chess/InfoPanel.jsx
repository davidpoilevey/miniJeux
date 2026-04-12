import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Box,
    Typography,
    Divider,
    Button,
    IconButton,
    LinearProgress,
    Tooltip,
    Menu,
    MenuItem,
} from '@mui/material';
import {
    RestartAlt,
    PlayArrow,
    Pause,
    TrendingUp,
    CloudDownloadTwoTone,
    CloudUploadTwoTone,
    MoreVert,
    Settings,
    Undo,
    Info,
    HourglassEmpty,
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

    const PANEL_LABEL = { fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#5c605c', display: 'block', mb: 2 };

    return (
        <Box sx={{
            width: 300,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            maxHeight: '100%',
            overflowY: 'auto',
        }}>

            {/* Section 1 : Tour + commentaire IA */}
            <Box sx={{ background: '#ffffff', p: 3, borderRadius: 2.5, border: '1px solid rgba(175,179,174,0.1)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <HourglassEmpty sx={{ color: '#835425' }} />
                        <Typography sx={{ fontSize: '1.15rem', fontWeight: 800, color: '#2f3430', letterSpacing: '-0.01em' }}>
                            {tourBlancs ? "C'est a vous" : "L'IA reflechit..."}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                        <Box sx={{ textAlign: 'right' }}>
                            <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: '#835425', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                                {timer != null ? formatTime(Math.max(0, timer - gameTimer)) : formatTime(gameTimer)}
                            </Typography>
                            {timer != null && (
                                <Typography sx={{ fontSize: '0.55rem', color: '#afb3ae', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    {formatTime(gameTimer)} ecoul.
                                </Typography>
                            )}
                        </Box>
                        <IconButton size="small" onClick={toggleTimer} sx={{ color: '#afb3ae', p: 0.5 }}>
                            {isTimerRunning ? <Pause sx={{ fontSize: '1rem' }} /> : <PlayArrow sx={{ fontSize: '1rem' }} />}
                        </IconButton>
                    </Box>

            {/* Menu options */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Tooltip title="Plus d'options">
                    <IconButton onClick={handleMenuOpen} size="small" sx={{ color: '#777c77' }}>
                        <MoreVert fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}
                    slotProps={{ paper: { sx: { borderRadius: 2, mt: 1, minWidth: 200 } } }}>
                    <MenuItem onClick={() => { handleMenuClose(); setOpenConfig(true); }}>
                        <Settings sx={{ mr: 1 }} /> Configurer la partie
                    </MenuItem>
                    <MenuItem onClick={() => { savePartie(); handleMenuClose(); }}>
                        <CloudUploadTwoTone sx={{ mr: 1 }} /> Sauvegarder
                    </MenuItem>
                    <MenuItem onClick={() => { loadPartie(); handleMenuClose(); }}>
                        <CloudDownloadTwoTone sx={{ mr: 1 }} /> Recharger
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={() => { toggleTimer(); handleMenuClose(); }}>
                        {isTimerRunning ? <Pause sx={{ mr: 1 }} /> : <PlayArrow sx={{ mr: 1 }} />}
                        {isTimerRunning ? 'Pause chrono' : 'Reprendre chrono'}
                    </MenuItem>
                </Menu>
            </Box>
                </Box>

                {(pickMessage || openingManager.isActive) && (
                    <Box sx={{ background: '#f4f4f0', p: 2, borderRadius: 1.5, borderLeft: '2px solid #835425', color: '#5c605c', fontStyle: 'italic', fontSize: '0.875rem', lineHeight: 1.5, mb: 2 }}>
                        {openingManager.isActive
                            ? humanReadableMove(openingManager.currentOpening.moves[openingManager.moveIndex])
                            : pickMessage}
                    </Box>
                )}

                {message && (
                    <Box sx={{ mb: 2, px: 2, py: 1, background: 'rgba(131,84,37,0.08)', borderRadius: 1.5 }}>
                        <Typography sx={{ fontSize: '0.8rem', color: '#835425', fontWeight: 600 }}>{message}</Typography>
                    </Box>
                )}

                {materialAdvantage !== 0 && (
                    <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <TrendingUp sx={{ fontSize: '1rem', color: materialAdvantage > 0 ? '#835425' : '#5c605c' }} />
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: materialAdvantage > 0 ? '#835425' : '#5c605c' }}>
                            {materialAdvantage > 0 ? '+' : ''}{materialAdvantage}
                        </Typography>
                        <LinearProgress variant="determinate" value={Math.min(Math.abs(materialAdvantage) * 10, 100)}
                            sx={{ flex: 1, height: 4, borderRadius: 2, bgcolor: '#e6e9e4',
                                '& .MuiLinearProgress-bar': { bgcolor: materialAdvantage > 0 ? '#835425' : '#5c605c' } }} />
                    </Box>
                )}

                {puzzle && (
                    <Button onClick={() => setHint(getPuzzleHint())} size="small"
                        sx={{ mb: 2, textTransform: 'none', color: '#835425', fontWeight: 700 }}>
                        {indice || 'Cliquer pour un indice'}
                    </Button>
                )}

                <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Button onClick={giveHint} startIcon={<Info />}
                        sx={{ flex: 1, py: 1.5, borderRadius: 2, background: '#835425', color: '#fff6f1',
                            fontWeight: 700, fontSize: '0.8rem', textTransform: 'none',
                            '&:hover': { background: '#75481a' } }}>
                        Suggerer
                    </Button>
                    {echec && (
                        <Box sx={{ px: 2, py: 1.5, background: 'rgba(158,66,44,0.1)', color: '#9e422c',
                            borderRadius: 2, display: 'flex', alignItems: 'center', gap: 0.75,
                            fontWeight: 700, fontSize: '0.8rem' }}>
                            &#9888; ECHEC
                        </Box>
                    )}
                </Box>
            </Box>

            {/* Section 3 : Pieces capturees */}
            <Box sx={{ background: '#f4f4f0', p: 3, borderRadius: 2.5 }}>
                <Typography sx={PANEL_LABEL}>Pieces capturees</Typography>
                <Box sx={{ mb: 1.5 }}>
                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#5c605c', mb: 0.5 }}>
                        Blancs ({whiteScore})
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', fontSize: '1.4rem', lineHeight: 1 }}>
                        {captured.black.length > 0
                            ? captured.black.map((p, i) => <span key={i} style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.25)' }}>{emojiPiece(p)}</span>)
                            : <Typography sx={{ fontSize: '0.72rem', color: '#afb3ae' }}>Aucune</Typography>}
                    </Box>
                </Box>
                <Box>
                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#5c605c', mb: 0.5 }}>
                        Noirs ({blackScore})
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', fontSize: '1.4rem', lineHeight: 1 }}>
                        {captured.white.length > 0
                            ? captured.white.map((p, i) => <span key={i}>{emojiPiece(p)}</span>)
                            : <Typography sx={{ fontSize: '0.72rem', color: '#afb3ae' }}>Aucune</Typography>}
                    </Box>
                </Box>
            </Box>

            {/* Section 4 : Statistiques */}
            <Box sx={{ background: '#f4f4f0', p: 3, borderRadius: 2.5 }}>
                <Typography sx={PANEL_LABEL}>Statistiques</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {[
                        { label: 'Coups joues', value: moveCount },
                        { label: 'Captures totales', value: captured.white.length + captured.black.length },
                        { label: 'Rythme moyen', value: `${gameTimer > 0 ? Math.round(moveCount / (gameTimer / 60)) : 0} /min` },
                    ].map(({ label, value }) => (
                        <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography sx={{ fontSize: '0.875rem', color: '#5c605c' }}>{label}</Typography>
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#2f3430' }}>{value}</Typography>
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* Section 5 : Actions */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button onClick={handleUndo} fullWidth startIcon={<Undo />}
                    sx={{ py: 1.75, borderRadius: 2.5, background: '#e6e9e4', color: '#2f3430',
                        fontWeight: 700, fontSize: '0.875rem', textTransform: 'none',
                        '&:hover': { background: '#d6dbd5' } }}>
                    Annuler le coup
                </Button>
                <Button onClick={() => setOpenConfig(true)} fullWidth startIcon={<RestartAlt />}
                    sx={{ py: 1.75, borderRadius: 2.5, border: '1px solid #afb3ae', color: '#5c605c',
                        fontWeight: 700, fontSize: '0.875rem', textTransform: 'none',
                        '&:hover': { background: '#f4f4f0' } }}>
                    Recommencer
                </Button>
                <Button fullWidth onClick={() => gameOver('Abandon', tourBlancs ? 'black' : 'white')}
                    sx={{ py: 1.75, color: '#9e422c', fontWeight: 700, fontSize: '0.875rem',
                        textTransform: 'none', opacity: 0.6, '&:hover': { opacity: 1 } }}>
                    Abandonner
                </Button>
            </Box>


            <ParametresDialog open={openConfig} reset={handleReset} handleClose={() => setOpenConfig(false)} />
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