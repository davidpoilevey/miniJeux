import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, Typography, Paper, Chip, IconButton, Tooltip, Divider, Stack } from '@mui/material';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Combustible from './Combustible';
import { GameOver } from '../../ChuckNorrisFact';
import imgPapier from '../images/papier.png';
import imgCarton from '../images/carton.jpg';
import imgBoiteOeuf from '../images/boiteOeuf.png';
import imgBrindille from '../images/brindille.png';
import imgPetitBois from '../images/petitBois.png';
import imgBuchette from '../images/buchette.png';
import imgAllumeFeu from '../images/allumefeu.png';
import imgBuche from '../images/buche.png';
import imgFond from '../images/fondCheminee.png';
import feuSound from '../images/feuCheminee.mp3';
import souffle from '../images/blow.mp3';
import { DeleteSweep, RestartAlt } from '@mui/icons-material';
import { soundManager } from '../../rpg/sons/SoundManager';
import { FIRE_SCENARIOS } from './FireScenar';
import { useIsMobile } from '../../hookGame';


const BUDGET_INITIAL = 40;
const MATERIALS = [
    {
        id: 'cendres',
        tempAutoCombustion: 100,
        dureeCombustion: 500000,
        chaleurProduite: 0,
        color: '#666',
        emoji: '💨'
    }, {
        id: 'papier',
        nom: 'Papier journal',
        cout: 5,
        tempAutoCombustion: 10,
        dureeCombustion: 3000,
        chaleurProduite: 40,
        rayonRayonnement: 150,
        image: imgPapier,
        width: 50,
        height: 50,
        color: '#f5f5dc',
        emoji: '📰'
    }, {
        id: 'allumefeu',
        nom: 'Allume-feu',
        cout: 15,
        tempAutoCombustion: 20,
        dureeCombustion: 30000,
        chaleurProduite: 30,
        rayonRayonnement: 50,
        image: imgAllumeFeu,
        width: 20,
        height: 20,
        color: '#7d6d09ff',
        emoji: '⛽'
    }, {
        id: 'allumette',
        nom: 'Allumette',
        cout: 1,
        tempAutoCombustion: 0,
        dureeCombustion: 500,
        chaleurProduite: 50,
        rayonRayonnement: 20,
        width: 10,
        height: 14,
        color: '#f5555c',
        emoji: '🔥'
    },
    {
        id: 'carton',
        nom: 'Carton',
        cout: 8,
        tempAutoCombustion: 80,
        dureeCombustion: 15000,
        chaleurProduite: 15,
        rayonRayonnement: 60,
        repoussoir: 20,
        width: 160,
        height: 25,
        color: '#d2b48c',
        image: imgCarton,
        emoji: '📦'
    },
    {
        id: 'boite-oeuf',
        nom: "Boîte d'œufs",
        cout: 10,
        tempAutoCombustion: 120,
        dureeCombustion: 20000,
        chaleurProduite: 30,
        rayonRayonnement: 30,
        repoussoir: 12,
        width: 100,
        height: 60,
        color: '#e0d5c7',
        image: imgBoiteOeuf,
        emoji: '🥚'
    },
    {
        id: 'brindilles',
        nom: 'Brindilles',
        cout: 12,
        tempAutoCombustion: 180,
        dureeCombustion: 16000,
        chaleurProduite: 40,
        rayonRayonnement: 180,
        repoussoir: 50,
        width: 220,
        height: 10,
        color: '#258b13ff',
        image: imgBrindille,
        emoji: '🌿'
    },
    {
        id: 'petit-bois',
        nom: 'Petit bois',
        cout: 15,
        tempAutoCombustion: 500,
        dureeCombustion: 25000,
        chaleurProduite: 50,
        repoussoir: 25,
        rayonRayonnement: 60,
        width: 180,
        height: 40,
        color: '#d7ab64ff',
        image: imgPetitBois,
        emoji: '🪵'
    },
    {
        id: 'buchettes',
        nom: 'Bûchettes',
        cout: 14,
        tempAutoCombustion: 800,
        dureeCombustion: 30000,
        repoussoir: 10,
        chaleurProduite: 80,
        rayonRayonnement: 30,
        width: 220,
        height: 50,
        color: '#b36126ff',
        image: imgBuchette,
        emoji: '🪓'
    },
    {
        id: 'buche',
        nom: 'Bûche',
        cout: 30,
        repoussoir: 2,
        tempAutoCombustion: 2500,
        dureeCombustion: 60000,
        chaleurProduite: 100,
        rayonRayonnement: 40,
        width: 250,
        height: 100,
        color: '#654321',
        image: imgBuche,
        emoji: '🪵'
    }
];
const applyRandomSize = (baseSize) => {
    // Math.random() est entre 0 et 1.
    // (0.5 + Math.random()) donne entre 0.5 et 1.5
    const factor = 0.5 + Math.random();
    return Math.round(baseSize * factor);
};
const getMateriauById = (id) => {
    return MATERIALS.find(m => m.id === id);
};
const bucheData = getMateriauById('buche');
const allumettedata = getMateriauById('allumette');
const defaultInventory = [{ ...allumettedata }, { ...bucheData }];



export default function FirePlace() {
    const [phase, setPhase] = useState('shop'); // shop, placement, burning
    const [budget, setBudget] = useState(BUDGET_INITIAL);
    const [inventory, setInventory] = useState(defaultInventory);
    const [placedItems, setPlacedItems] = useState([]);
    const [dragging, setDragging] = useState(null);
    const [plusRienBrule, setPlusRienBrule] = useState(true);
    const [isBlowing, setIsBlowing] = useState(false);
    const [blowPosition, setBlowPosition] = useState(null);
    const [blowIntensity, setBlowIntensity] = useState(0);
    const [gameMode, setGameMode] = useState(null); // null, 'free', 'adventure'
    const [currentScenario, setCurrentScenario] = useState(0);
    const [scenarioCompleted, setScenarioCompleted] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [matchCount, setMatchCount] = useState(0);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [fireStarted, setFireStarted] = useState(false);
    const [matchPosition, setMatchPosition] = useState(null);
    const [bigLogsOnFire, setBigLogsOnFire] = useState(0);
    const [selectedItem, setSelectedItem] = useState(null);
    const [gameWon, setGameWon] = useState(false);
    const [score, setScore] = useState(0);
    const [totalScore, setTotalScore] = useState(0);


    const fireplaceRef = useRef(null);
    const animationRef = useRef(null);
    useEffect(() => {
        soundManager.loadSounds({
            feu: feuSound, souffle:souffle
        })
    }, []);
    useEffect(() => {
        if (!fireStarted) return;

        const interval = setInterval(() => {
            setElapsedTime(Date.now() - startTime);
        }, 100);

        return () => clearInterval(interval);
    }, [fireStarted, startTime]);

    useEffect(() => {
        if (fireStarted && !startTime) {
            setStartTime(Date.now());
        }
    }, [fireStarted, startTime]);

    useEffect(() => {

        if (phase === 'shop' && inventory.length == 0) {
            // On ajoute deux buches. 
            setInventory(defaultInventory);
        }
    }, [phase]);

    // Gérer le clic maintenu pour souffler
    const handleMouseDown = (e) => {
        if (!fireStarted || plusRienBrule) return;

        const rect = fireplaceRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setIsBlowing(true);
        setBlowPosition({ x, y });
        setBlowIntensity(0);
    };

    const handleMouseUp = () => {
        setIsBlowing(false);
        setBlowIntensity(0);
    };

    // Augmenter l'intensité du souffle pendant qu'on maintient
    useEffect(() => {

        if (!isBlowing) return;
soundManager.play('souffle');
        const interval = setInterval(() => {
            setBlowIntensity(prev => Math.min(prev + 20, 200)); // Max 200
        }, 100);

        return () => clearInterval(interval);
    }, [isBlowing]);

    const acheterMateriau = (material) => {
        // On vérifie si on a le budget ET si on ne l'a pas déjà débloqué
        const dejaPossede = inventory.some(item => item.id === material.id);

        if (budget >= material.cout && !dejaPossede) {
            setBudget(prev => prev - material.cout);
            // On ajoute l'objet de base à l'inventaire (sans uniqueId ici, 
            // car c'est le "modèle" de l'inventaire)
            setInventory(prev => [...prev, material]);
        }
    };
    useEffect(() => {

        const score = calculerScoreFinal();
        if (phase === 'burning' || phase == 'placement')
            setScore(score);
    }, [matchCount, placedItems.length]);
    const calculerScoreFinal = () => {
        const baseScore = 100;
        const malusItems = placedItems.length * 2;
        // On considère que la 1ère allumette est "normale", les suivantes sont des malus
        const malusAllumettes = (matchCount > 1) ? (matchCount - 1) * 20 : 0;
        const bonusBudget = budget * 5;
        const malusTemps = Math.round(elapsedTime / 5000);
        const score = baseScore - malusItems - malusAllumettes - malusTemps + bonusBudget;

        // On retourne un entier entre 1 et 1000
        return Math.max(1, Math.floor(score));
    };


    const startFire = (x, y) => {
        if (!fireplaceRef.current) return;

        setMatchPosition({ x, y });
        setFireStarted(true);
        setPhase('burning');
    };

    useEffect(() => {
        if (dragging) return;
        const interval = setInterval(() => {
            let logsOnFireCount = 0;
            let burningItems = 0;
            setPlacedItems(currentItems => {
                const nextItems = currentItems.filter(c => c.mam == null || c.mam > 0).map(item => {
                    // À ajouter dans la boucle map du setPlacedItems
                    let newY = item.y;
                    const groundLevel = 500; // La hauteur du bas de ta cheminée

                    // Si l'objet est au-dessus du sol
                    if (newY + item.height < groundLevel) {
                        // On vérifie s'il y a un objet "solide" dessous
                        const isSupported = currentItems.some(other => {
                            if (other.uniqueId === item.uniqueId) return false;

                            const repoussoir = other.repoussoir || 0;
                            const espaceAir = other.id === 'cendres' ? 0 : 5; // Espace de base entre les matériaux
                            const margeCollision = espaceAir + repoussoir;

                            return (
                                item.x < other.x + other.width &&
                                item.x + item.width > other.x &&
                                newY + item.height >= other.y - margeCollision &&
                                newY + item.height <= (other.y + (margeCollision))
                            );
                        });

                        if (!isSupported) {
                            newY += 10; // Vitesse de chute
                        }
                    }

                    // Empêcher de traverser le sol
                    if (newY + item.height > groundLevel) {
                        newY = groundLevel - item.height;
                    }

                    const newItem = { ...item, y: newY };
                    if (item.id === 'cendres') return { ...newItem, width: 2, height: 2, repoussoir: 0, mam: (newItem.mam ?? 10) - 1 };

                    const now = Date.now();
                    let { currentHeat = 0, isBurning, burnStartTime } = newItem;

                    // 1. Calcul de la chaleur reçue (Proximité)
                    const heatReceived = currentItems.reduce((acc, other) => {
                        if (other.uniqueId === item.uniqueId) return acc;
                        if (!other.isBurning && other.id !== 'allumette') return acc;

                        // 1. Calcul de la distance MINIMALE entre les bords des deux rectangles
                        // On calcule l'écart sur chaque axe
                        const dx = Math.max(0,
                            Math.max(item.x - (other.x + other.width), other.x - (item.x + item.width))
                        );
                        const dy = Math.max(0,
                            Math.max(item.y - (other.y + other.height), other.y - (item.y + item.height))
                        );

                        // Distance réelle entre les bords (Théorème de Pythagore sur les écarts)
                        const dist = Math.sqrt(dx * dx + dy * dy);

                        // 2. Rayonnement
                        const rayon = other.rayonRayonnement || 100;

                        if (dist < rayon) {
                            // Si dist = 0 (ils se touchent), intensite = 1 (chaleur max)
                            const intensite = 1 - (dist / rayon);

                            // On divise par 5 car le cycle est de 200ms (5 fois par seconde)
                            return acc + (other.chaleurProduite * intensite) / 5 + Math.min(other.currentHeat||0, other.tempAutoCombustion*2)/100;
                        }

                        return acc;
                    }, 0);

                    currentHeat += heatReceived;


                    // 2. Allumage
                    if (!isBurning && currentHeat >= newItem.tempAutoCombustion) {
                        isBurning = true;
                        burnStartTime = now;
                    }

                    // 3. Update du compteur pour la victoire (si bûche et brûle depuis > 5s)
                    if (isBurning && newItem.id === 'buche' && (now - burnStartTime) > 3000) {
                        logsOnFireCount++;
                    }
                    if (isBurning)
                        burningItems++;

                    // 4. Fin de combustion -> Cendres
                    if (isBurning && (now - burnStartTime) > newItem.dureeCombustion) {
                        const cendresData = getMateriauById('cendres');
                        return {
                            ...newItem, ...cendresData, isBurning: false, id: 'cendres'
                            , width: 2, height: 2, mam: 20, repoussoir: 0
                        };
                    }

                    return { ...newItem, currentHeat, isBurning, burnStartTime };
                });

                // Gestion de la victoire
                if (gameMode === 'free' && logsOnFireCount >= 2 && !gameWon) {
                    setGameWon(true);
                }
                else if (gameMode === 'adventure') {
                    // Vérifier l'objectif du scénario
                    // const scenario = FIRE_SCENARIOS[currentScenario];

                    if (logsOnFireCount >= 2 && !scenarioCompleted) {
                        setScenarioCompleted(true);
                    }
                }
              
                setPlusRienBrule(burningItems == 0||!fireStarted);
                return nextItems;
            });
        }, 200); // Un peu plus lent (5 fois par sec) pour économiser le CPU sur Mac

        return () => clearInterval(interval);
    }, [fireStarted, gameWon, currentScenario]);
   useEffect(() => {
if(plusRienBrule){
 if (soundManager.isPlaying('feu'))
                   {
soundManager.stop('feu');
setMatchCount(p=>p+2);
                   } 
}
else{
     soundManager.play('feu');
    
}
   },[plusRienBrule]); 
   const isMobile = useIsMobile();
// useEffect dédié au souffle - indépendant de la simulation principale
useEffect(() => {
  if (!isBlowing || !blowPosition || !fireplaceRef.current) return;
  
  const interval = setInterval(() => {
    setPlacedItems(prevItems => {
      return prevItems.map(item => {
        // Calculer la distance entre le souffle et le centre de l'item
        const itemCenterX = item.x + item.width / 2;
        const itemCenterY = item.y + item.height / 2;
        const distance = Math.sqrt(
          Math.pow(blowPosition.x - itemCenterX, 2) + 
          Math.pow(blowPosition.y - itemCenterY, 2)
        );
        
        // Rayon d'effet du souffle
        const blowRadius = 100;
        
        if (distance < blowRadius) {
          // Plus on est proche, plus le boost est fort
          const effectiveness = 1 - (distance / blowRadius);
          const heatBoost = blowIntensity * effectiveness * 0.5; // 0.3 pour modérer
          
          return {
            ...item,
            dureeCombustion:item.dureeCombustion-heatBoost*5,
            currentHeat: (item.currentHeat || 0) + heatBoost
          };
        }
        
        return item;
      });
    });
  }, 400); // Applique le boost tous les 100ms
  
  return () => clearInterval(interval);
}, [isBlowing, blowPosition, blowIntensity]);


    const reset = () => {
        setPhase('shop');
        setBudget(BUDGET_INITIAL);
        setScore(0);
        setStartTime(null);
        setMatchCount(0);
        setInventory(defaultInventory);
        setPlacedItems([]);
        setFireStarted(false);
        setMatchPosition(null);
        setBigLogsOnFire(0);
        setGameWon(false);
    };

    return (
        <Box
            sx={{
                width: '100%',
                minHeight: '100vh',
                bgcolor: '#2c1810',
                p: 3,
                userSelect: 'none'
            }}

        >
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between', // Sépare titre et boutons
                width: '90%',
                mb: 4,
                p: 2,
                bgcolor: 'rgba(255, 255, 255, 0.05)', // Fond léger pour Mac style
                borderRadius: 2,
                backdropFilter: 'blur(10px)', // Effet de flou Mac
                border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                {/* Titre stylisé */}
                <Typography variant="h4" sx={{
                    fontWeight: '900',
                    background: 'linear-gradient(45deg, #ff6b35 30%, #ffbb00 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}>
                    <span style={{ filter: 'drop-shadow(0 0 5px rgba(255,107,53,0.5))' }}>🔥</span>
                    Maître du Feu
                </Typography>

                {/* Groupe de boutons */}
                <Stack direction="row" spacing={2} alignItems="center">
                    {/* Score actuel (optionnel mais sympa) */}
                    {fireStarted && (
                        <Typography
                            sx={{
                                color: 'white',
                                bgcolor: 'rgba(0,0,0,0.8)',
                                p: 1,
                                borderRadius: 1,
                                fontWeight: 'bold',
                                fontSize: '1.2rem',
                                zIndex: 10
                            }}
                        >
                            ⏱️ {formatTime(elapsedTime)}
                        </Typography>
                    )}
                    <Typography sx={{ color: '#aaa', fontSize: '0.9rem', mr: 2 }}>
                        Score : <b>{score}</b>
                    </Typography>
                    <Typography sx={{ color: '#a78282ff', fontSize: '0.9rem', mr: 2 }}>
                        total : <b>{totalScore}</b>
                    </Typography>


                    <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />

                    <Tooltip title="Tout effacer">
                        <IconButton
                            onClick={() => setPlacedItems([])}
                            sx={{
                                color: '#ff4d4d',
                                '&:hover': { bgcolor: 'rgba(255,77,77,0.1)' }
                            }}
                        >
                            <DeleteSweep />
                        </IconButton>
                    </Tooltip>
                    {phase === 'placement' && (
                        <Tooltip title="Retour au shop">
                            <IconButton
                                onClick={() => setPhase('shop')}
                                sx={{
                                    color: '#d6cd27ff',
                                    '&:hover': { bgcolor: 'rgba(255,77,77,0.1)' }
                                }}
                            >
                                <ShoppingCartIcon />
                            </IconButton>
                        </Tooltip>
                    )}

                    <Button
                        variant="outlined"
                        startIcon={<RestartAlt />}
                        onClick={() => { reset(); setGameMode(null); setTotalScore(0) }}
                        sx={{
                            borderRadius: '20px',
                            borderColor: '#ff6b35',
                            color: '#ff6b35',
                            '&:hover': {
                                borderColor: '#ffbb00',
                                bgcolor: 'rgba(255,107,53,0.05)'
                            },
                            textTransform: 'none', // Plus moderne
                            fontWeight: 'bold'
                        }}
                    >
                        Nouvelle Partie
                    </Button>
                </Stack>
            </Box>


            <GameOver open={gameWon} score={score} reason={"🎉 VICTOIRE ! 🎉 Vous avez réussi à allumer un magnifique feu avec 2 bûches qui brûlent intensément "}
                gameName="FirePlace"
                handleClose={() => { setPlacedItems([]); setGameWon(false) }} handleRestart={reset} />
            {/* Choix du mode de jeu */}
            {!gameMode && (
                <Box sx={{ textAlign: 'center', mt: 5 }}>
                    <Typography variant="h4" sx={{ mb: 4, color: '#ff6b35' }}>
                        Choisissez votre mode de jeu
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Paper
                            sx={{
                                p: 4,
                                bgcolor: '#3d2817',
                                color: 'white',
                                cursor: 'pointer',
                                minWidth: 300,
                                transition: 'transform 0.2s',
                                '&:hover': { transform: 'scale(1.05)' }
                            }}
                            onClick={() => {
                                setGameMode('free');
                                setPhase('shop');
                            }}
                        >
                            <Typography variant="h5" sx={{ mb: 2 }}>🔓 Mode Libre</Typography>
                            <Typography variant="body1">
                                Achetez les matériaux de votre choix et construisez le feu parfait.
                                Objectif : 2 bûches en feu intense !
                            </Typography>
                        </Paper>

                        <Paper
                            sx={{
                                p: 4,
                                bgcolor: '#3d2817',
                                color: 'white',
                                cursor: 'pointer',
                                minWidth: 300,
                                transition: 'transform 0.2s',
                                '&:hover': { transform: 'scale(1.05)' }
                            }}
                            onClick={() => {
                                setGameMode('adventure');
                                setCurrentScenario(0);
                                setPhase('scenario-intro');
                            }}
                        >
                            <Typography variant="h5" sx={{ mb: 2 }}>🎯 Mode Aventure</Typography>
                            <Typography variant="body1">
                                Relevez {FIRE_SCENARIOS.length} défis avec des ressources limitées.
                                Prouvez que vous êtes un vrai maître du feu !
                            </Typography>
                        </Paper>
                    </Box>
                </Box>
            )}
            {phase === 'scenario-intro' && gameMode === 'adventure' && (
                <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Paper sx={{ p: 4, bgcolor: '#3d2817', color: 'white', maxWidth: 600, mx: 'auto' }}>
                        <Typography variant="h6" sx={{ color: '#ff9800', mb: 1 }}>
                            Scénario {currentScenario + 1} / {FIRE_SCENARIOS.length}
                        </Typography>
                        <Typography variant="h3" sx={{ mb: 2, color: '#ff6b35' }}>
                            {FIRE_SCENARIOS[currentScenario].nom}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 3, fontSize: '1.2rem' }}>
                            {FIRE_SCENARIOS[currentScenario].description}
                        </Typography>

                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                Difficulté : {FIRE_SCENARIOS[currentScenario].difficulte}
                            </Typography>
                            <Typography variant="subtitle1" sx={{ mb: 2 }}>
                                🎯 Objectif : 2 bûches en feu intense !
                            </Typography>

                            <Typography variant="h6" sx={{ mb: 1 }}>Matériaux disponibles :</Typography>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                                {FIRE_SCENARIOS[currentScenario].materiaux.map(matId => {
                                    const mat = MATERIALS.find(m => m.id === matId);
                                    return (
                                        <Box key={matId} sx={{ textAlign: 'center' }}>
                                            <Typography sx={{ fontSize: '2rem' }}>{mat.emoji}</Typography>
                                            <Typography sx={{ fontSize: '0.9rem' }}>{mat.nom}</Typography>
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Box>

                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => {
                                // Initialiser l'inventaire avec les matériaux du scénario
                                const scenarioInventory = FIRE_SCENARIOS[currentScenario].materiaux.map(matId => {
                                    const mat = MATERIALS.find(m => m.id === matId);
                                    return { ...mat, uniqueId: matId }; // Un seul de chaque pour sélection
                                });
                                setInventory([...scenarioInventory, ...defaultInventory]);
                                setPhase('placement');
                            }}
                            sx={{ mt: 2 }}
                        >
                            C'est parti ! 🔥
                        </Button>
                    </Paper>
                </Box>
            )}
            {scenarioCompleted && gameMode === 'adventure' && (
                <Paper sx={{ p: 3, mb: 3, bgcolor: '#4caf50', color: 'white', textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ mb: 2 }}>🎉 Scénario réussi !</Typography>
                    <Typography variant="h6" sx={{ mb: 3 }}>
                        {FIRE_SCENARIOS[currentScenario].nom} terminé avec succès !
                    </Typography>

                    {currentScenario < FIRE_SCENARIOS.length - 1 ? (
                        <Button
                            variant="contained"
                            sx={{ bgcolor: 'white', color: '#4caf50', mr: 2 }}
                            onClick={() => {
                                setCurrentScenario(currentScenario + 1);
                                setTotalScore(totalScore + score);
                                setScenarioCompleted(false);
                                reset();
                                setPhase('scenario-intro');
                            }}
                        >
                            Scénario suivant →
                        </Button>
                    ) : (
                        <Typography variant="h5" sx={{ mb: 2 }}>
                            🏆 Vous avez terminé tous les scénarios ! Vous êtes un MAÎTRE DU FEU ! 🏆
                        </Typography>
                    )}

                    <Button
                        variant="outlined"
                        sx={{ borderColor: 'white', color: 'white' }}
                        onClick={() => {
                            setGameMode(null);
                            setScore(totalScore);
                            setGameWon(true);

                        }}
                    >
                        Retour au menu
                    </Button>
                </Paper>
            )}
            {/* Phase Shop */}
            {gameMode === 'free' && phase === 'shop' && (
                <Box>
                    <Paper sx={{ p: 2, mb: 3, bgcolor: '#3d2817', color: 'white' }}>
                        <Typography variant="h5">
                            <ShoppingCartIcon /> Budget: {budget} points
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            Achetez les matériaux nécessaires pour allumer votre feu. Pensez à la stratégie : commencez par les petits combustibles !
                        </Typography>
                    </Paper>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                        {MATERIALS.map(material => {
                            const dejaPossede = inventory.some(item => item.id === material.id);
                            return material.nom ? <Paper
                                key={material.id}
                                sx={{
                                    p: 2,
                                    bgcolor: '#4a3426',
                                    color: 'white',
                                    cursor: budget >= material.cout ? 'pointer' : 'not-allowed',
                                    opacity: budget >= material.cout && !dejaPossede ? 1 : 0.5,
                                    transition: 'transform 0.2s',
                                    '&:hover': budget >= material.cout ? { transform: 'scale(1.05)' } : {}
                                }}
                                onClick={() => { if (!dejaPossede) acheterMateriau(material) }}
                            >
                                <Typography variant="h4">{material.emoji}</Typography>
                                <Typography variant="subtitle1">{material.nom}</Typography>
                                <Chip label={`${material.cout} pts`} size="small" color="warning" />
                            </Paper> : null
                        }
                        )}
                    </Box>

                    {inventory.length > 0 && (
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            onClick={() => setPhase('placement')}
                            sx={{ mt: 2 }}
                        >
                            Passer au placement ({inventory.length} objets achetés)
                        </Button>
                    )}
                </Box>
            )}

            {/* Phase Placement et Burning */}
            {(phase === 'placement' || phase === 'burning') && (
                <Box sx={{ display: 'flex' , flexDirection:isMobile?'column':'row'}}>
                    {/* Inventaire */}
                    {inventory.length > 0 && (
                        <Paper sx={{ p: 2, mb: 3, bgcolor: '#3d2817', color: 'white' }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>Inventaire (Selectionnez pour en disposer dans la cheminee):</Typography>
                            <Box sx={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                {inventory.map(item => (
                                    <Box
                                        key={item.uniqueId}
                                        sx={{
                                            width: item.width,
                                            height: item.height,
                                            background: `url(${item.image})`,
                                            backgroundSize: 'cover',
                                            border: selectedItem?.id === item.id
                                                ? '4px solid #00ff00'
                                                : '2px solid #333',
                                            borderRadius: 1,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.5rem',
                                            boxShadow: selectedItem?.id === item.id
                                                ? '0 0 20px rgba(0, 255, 0, 0.6)'
                                                : 'none',
                                            transform: selectedItem?.id === item.id
                                                ? 'scale(1.1)'
                                                : 'scale(1)',
                                            transition: 'all 0.2s'
                                        }}
                                        onClick={() => setSelectedItem(item)}
                                    >
                                        {item.emoji}
                                    </Box>
                                ))}
                            </Box>
                        </Paper>
                    )}

                    {/* Cheminée */}
                    <Paper
                        ref={fireplaceRef}
                        sx={{
                            width: '100%',
                            height: 500,
                            backgroundImage: `
    linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8)), 
    url(${imgFond})
  `,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            position: 'relative',
                            overflow: 'hidden',
                            borderRadius: 2,
                            border: '4px solid #8b4513',
                            cursor: phase === 'placement' ? 'default' : 'crosshair'
                        }}
                        onClick={(e) => {
                            if (selectedItem && plusRienBrule) {
                                const rect = fireplaceRef.current.getBoundingClientRect();
                                const x = e.clientX - rect.left - selectedItem.width / 2;
                                const y = e.clientY - rect.top - selectedItem.height / 2;

                                const newWidth = applyRandomSize(selectedItem.width);
                                const newHeight = applyRandomSize(selectedItem.height);
                                if (selectedItem.id === 'allumette')
                                    startFire(x, y);
                                setPlacedItems([...placedItems, {
                                    ...selectedItem,
                                    uniqueId: Date.now() + Math.random(),
                                    width: newWidth, height: newHeight,
                                    x: Math.max(0, Math.min(x, rect.width - selectedItem.width)),
                                    y: Math.max(0, Math.min(y, rect.height - selectedItem.height))
                                }]);
                            }
                        }}
                         onMouseDown={handleMouseDown}
                          onMouseUp={handleMouseUp}
                    >
                        {/* Instructions */}
                        {fireStarted ? <Typography
                            sx={{
                                position: 'absolute',
                                top: 10,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                color: 'white',
                                bgcolor: 'rgba(0,0,0,0.7)',
                                p: 1,
                                borderRadius: 1
                            }}
                        >
                            2 buches doivent bruler pendant 3 secondes pour gagner
                        </Typography> : (
                            <Typography
                                sx={{
                                    position: 'absolute',
                                    top: 10,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    color: 'white',
                                    bgcolor: 'rgba(0,0,0,0.7)',
                                    p: 1,
                                    borderRadius: 1
                                }}
                            >

                                {selectedItem
                                    ? `Cliquez pour placer: ${selectedItem.nom} autant de fois que vous le souhaitez`
                                    : 'Sélectionnez un matériau dans l\'inventaire'}
                            </Typography>
                        )}

                        {placedItems.map(item => (
                            <Combustible
                                key={item.uniqueId}
                                item={item}
                                fireStarted={fireStarted}

                            />
                        ))}


                        {isBlowing && blowPosition && (
                            <>
                                {/* Cercle de souffle */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        left: blowPosition.x,
                                        top: blowPosition.y,
                                        width: blowIntensity * 2,
                                        height: blowIntensity * 2,
                                        transform: 'translate(-50%, -50%)',
                                        borderRadius: '50%',
                                        border: '3px solid rgba(173, 216, 230, 0.8)',
                                        backgroundColor: 'rgba(173, 216, 230, 0.2)',
                                        pointerEvents: 'none',
                                        animation: 'blow-pulse 0.5s infinite',
                                        zIndex: 100,
                                    }}
                                />

                                {/* Particules de vent */}
                                {[...Array(8)].map((_, i) => (
                                    <Box
                                        key={i}
                                        sx={{
                                            position: 'absolute',
                                            left: blowPosition.x,
                                            top: blowPosition.y,
                                            width: 4,
                                            height: 20,
                                            backgroundColor: 'rgba(173, 216, 230, 0.6)',
                                            transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-${blowIntensity * 0.5}px)`,
                                            transformOrigin: 'center',
                                            pointerEvents: 'none',
                                            opacity: 0.7,
                                            filter: 'blur(2px)',
                                            zIndex: 99,
                                        }}
                                    />
                                ))}
                            </>
                        )}


                        {/* Allumette */}
                        {matchPosition && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    left: matchPosition.x - 2,
                                    top: matchPosition.y - 2,
                                    width: 4,
                                    height: 4,
                                    bgcolor: '#ff4500',
                                    borderRadius: '50%',
                                    boxShadow: '0 0 10px #ff4500'
                                }}
                            />
                        )}

                        {/* Indicateur de victoire */}
                        {bigLogsOnFire > 0 && (
                            <Typography
                                sx={{
                                    position: 'absolute',
                                    bottom: 10,
                                    right: 10,
                                    color: bigLogsOnFire >= 2 ? '#4caf50' : 'white',
                                    bgcolor: 'rgba(0,0,0,0.8)',
                                    p: 1,
                                    borderRadius: 1,
                                    fontWeight: 'bold'
                                }}
                            >
                                Bûches en feu: {bigLogsOnFire}/2 🔥
                            </Typography>
                        )}
                    </Paper>

                </Box>
            )}

            <style>
                {`
          @keyframes flicker {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
             @keyframes blow-pulse {
    0%, 100% { transform: translate(-50%, -50%) scale(1); }
    50% { transform: translate(-50%, -50%) scale(1.1); }
  }
        `}
            </style>
        </Box>
    );
}


const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};