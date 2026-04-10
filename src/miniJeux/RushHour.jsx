import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, Switch, Typography } from '@mui/material';
import React, { useState, useCallback, useRef, useMemo } from 'react';
import carSprite from './images/voitures.png';
import wayOut from './images/wayout.png';
import { RestartAlt } from '@mui/icons-material';
import { useIsMobile } from '../hookGame';

//567 333
const carPositions = {
    'vertClair': { width: 567, height: 333, x: -22, y: -20 },
    'orange': { width: 567, height: 333, x: -22, y: -211 },
    'bleu': { width: 567, height: 333, x: -258, y: -20 },
    'bleuClair': { width: 567, height: 333, x: -422, y: -20 },
    'vert': { width: 567, height: 333, x: -496, y: -20 },
    'violet': { width: 567, height: 333, x: -496, y: -20 },
    'beige': { width: 567, height: 333, x: -22, y: -211 },
    'olive': { width: 567, height: 333, x: -22, y: -211 },
    'cBleu': { width: 432, height: 273, x: -131, y: -107 },
    'cJaune': { width: 480, height: 301, x: -218, y: -133 },
    'cViolet': { width: 480, height: 301, x: -218, y: -133 },
    'cVert': { width: 480, height: 222, x: -286, y: -57 },
    'rose': { width: 460, height: 242, x: -73, y: -135 },
    'X': { width: 567, height: 333, x: -178, y: -20 }, // Voiture rouge
}
/**
  {
    id: 'test',
    rows: 6,
    cols: 6,
    cars: [
      { id: 'X', length: 2, orientation: 'H', position: { col: 1, row: 2 } }, // Voiture rouge à sortir
     
    ]
  } */
const levels = [

    {
        id: 0, niveau: 1,
        rows: 6,
        cols: 6,
        cars: [
            { id: 'X', length: 2, orientation: 'H', position: { col: 1, row: 2 } }, // Voiture rouge à sortir
            { id: 'vertClair', length: 2, orientation: 'H', position: { col: 1, row: 3 } },
            { id: 'bleuClair', length: 2, orientation: 'H', position: { col: 2, row: 5 } },
            { id: 'orange', length: 2, orientation: 'V', position: { col: 1, row: 4 } },
            { id: 'cJaune', length: 3, orientation: 'V', position: { col: 3, row: 2 } },
            { id: 'cViolet', length: 3, orientation: 'V', position: { col: 5, row: 3 } },
        ]
    },
    {
        id: 1, niveau: 1,
        rows: 6,
        cols: 6,
        cars: [
            { id: 'vertClair', length: 2, orientation: 'H', position: { col: 0, row: 0 } },
            { id: 'cViolet', length: 3, orientation: 'V', position: { col: 0, row: 1 } },
            { id: 'orange', length: 2, orientation: 'V', position: { col: 0, row: 4 } },
            { id: 'X', length: 2, orientation: 'H', position: { col: 1, row: 2 } }, // Voiture rouge à sortir
            { id: 'cBleu', length: 3, orientation: 'V', position: { col: 3, row: 1 } },
            { id: 'cJaune', length: 3, orientation: 'V', position: { col: 5, row: 0 } },
            { id: 'bleuClair', length: 2, orientation: 'H', position: { col: 4, row: 4 } },
            { id: 'cVert', length: 3, orientation: 'H', position: { col: 2, row: 5 } },
        ]
    }, {
        id: 2, niveau: 1,
        rows: 6,
        cols: 6,
        cars: [
            { id: 'vertClair', length: 2, orientation: 'H', position: { col: 0, row: 0 } },
            { id: 'bleuClair', length: 2, orientation: 'H', position: { col: 0, row: 1 } },
            { id: 'X', length: 2, orientation: 'H', position: { col: 1, row: 2 } }, // Voiture rouge à sortir

            { id: 'rose', length: 2, orientation: 'H', position: { col: 0, row: 3 } },
            { id: 'violet', length: 2, orientation: 'V', position: { col: 2, row: 3 } },
            { id: 'vert', length: 2, orientation: 'V', position: { col: 0, row: 4 } },
            { id: 'cJaune', length: 3, orientation: 'V', position: { col: 4, row: 1 } },
            { id: 'cViolet', length: 3, orientation: 'V', position: { col: 5, row: 1 } },
            { id: 'cBleu', length: 3, orientation: 'V', position: { col: 3, row: 2 } },

            { id: 'orange', length: 2, orientation: 'V', position: { col: 3, row: 0 } },

            { id: 'cVert', length: 3, orientation: 'H', position: { col: 3, row: 5 } },
        ]
    },
    {
        id: 3, niveau: 1,
        rows: 6,
        cols: 6,
        cars: [
            { id: 'cJaune', length: 3, orientation: 'V', position: { col: 0, row: 0 } },
            { id: 'cViolet', length: 3, orientation: 'V', position: { col: 3, row: 0 } },
            { id: 'X', length: 2, orientation: 'H', position: { col: 1, row: 2 } }, // Voiture rouge à sortir

            { id: 'vertClair', length: 2, orientation: 'V', position: { col: 2, row: 3 } },
            { id: 'orange', length: 2, orientation: 'V', position: { col: 5, row: 4 } },
            { id: 'cBleu', length: 3, orientation: 'H', position: { col: 3, row: 3 } },

            { id: 'cVert', length: 3, orientation: 'H', position: { col: 2, row: 5 } },
        ]
    },
    {
        id: '4', niveau: 2,
        rows: 6,
        cols: 6,
        cars: [
            { id: 'cJaune', length: 3, orientation: 'V', position: { col: 0, row: 0 } },
            { id: 'cViolet', length: 3, orientation: 'V', position: { col: 3, row: 0 } },
            { id: 'cBleu', length: 3, orientation: 'H', position: { col: 3, row: 3 } },
            { id: 'X', length: 2, orientation: 'H', position: { col: 1, row: 2 } }, // Voiture rouge à sortir
            { id: 'vertClair', length: 2, orientation: 'H', position: { col: 1, row: 0 } },
            { id: 'orange', length: 2, orientation: 'V', position: { col: 2, row: 3 } },
            { id: 'violet', length: 2, orientation: 'V', position: { col: 5, row: 4 } },
            { id: 'cVert', length: 3, orientation: 'H', position: { col: 2, row: 5 } },
        ]
    },
    {
        id: '5', niveau: 3,
        rows: 6,
        cols: 6,
        cars: [
            { id: 'vertClair', length: 2, orientation: 'H', position: { col: 0, row: 0 } },
            { id: 'cJaune', length: 3, orientation: 'V', position: { col: 2, row: 0 } },
            { id: 'cViolet', length: 3, orientation: 'V', position: { col: 5, row: 3 } },
            { id: 'rose', length: 2, orientation: 'V', position: { col: 0, row: 3 } },
            { id: 'beige', length: 2, orientation: 'H', position: { col: 0, row: 5 } },
            { id: 'X', length: 2, orientation: 'H', position: { col: 0, row: 2 } }, // Voiture rouge à sortir

            { id: 'bleu', length: 2, orientation: 'H', position: { col: 4, row: 0 } },
            { id: 'violet', length: 2, orientation: 'H', position: { col: 1, row: 3 } },
            { id: 'vert', length: 2, orientation: 'H', position: { col: 3, row: 3 } },
            { id: 'orange', length: 2, orientation: 'V', position: { col: 3, row: 0 } },
            { id: 'olive', length: 2, orientation: 'V', position: { col: 3, row: 4 } },
        ]
    },
    {
        id: 6, niveau: 4,
        rows: 6,
        cols: 6,
        cars: [
            { id: 'vertClair', length: 2, orientation: 'H', position: { col: 3, row: 0 } },
            { id: 'cJaune', length: 3, orientation: 'V', position: { col: 2, row: 0 } },
            { id: 'cViolet', length: 3, orientation: 'V', position: { col: 5, row: 0 } },
            { id: 'orange', length: 2, orientation: 'V', position: { col: 3, row: 1 } },
            { id: 'X', length: 2, orientation: 'H', position: { col: 0, row: 2 } }, // Voiture rouge à sortir

            { id: 'cBleu', length: 3, orientation: 'H', position: { col: 1, row: 3 } },
            { id: 'olive', length: 2, orientation: 'V', position: { col: 0, row: 3 } },
            { id: 'rose', length: 2, orientation: 'H', position: { col: 1, row: 4 } },
            { id: 'beige', length: 2, orientation: 'H', position: { col: 0, row: 5 } },
            { id: 'violet', length: 2, orientation: 'V', position: { col: 3, row: 4 } },
            { id: 'vert', length: 2, orientation: 'V', position: { col: 4, row: 4 } },
        ]
    },
];

const RushHour = () => {
    const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
    const [cars, setCars] = useState(levels[currentLevelIndex].cars);
    const [victory, setVictory] = useState(false)
    const [dragDropMode, setdragDropMode] = useState(true);

    const handleRestart = useCallback(() => {
        setCars([...levels[currentLevelIndex].cars]);
    }, [currentLevelIndex]);

    const handleLevelChange = useCallback((index) => {
        setCurrentLevelIndex(index);
        setCars([...levels[index].cars]);
    }, []);
    const handleNextLevel = useCallback(() => {
        if (levels.length === currentLevelIndex + 1) return;
        setCurrentLevelIndex(currentLevelIndex + 1);
        setCars([...levels[currentLevelIndex + 1].cars]);
    }, [currentLevelIndex]);
    

    const currentLevel = levels[currentLevelIndex];

    return (
        <div style={{
            display: 'flex',
            flexDirection:isMobile()?'column':'row',
            alignItems: 'center',
            gap: '20px',
            padding: '20px',
            background:'radial-gradient(circle, rgba(255, 155, 55, 0.9) 0%, rgba(155, 105, 255, 0.2) 70%)',
            fontFamily: 'Arial, sans-serif'
        }}>
            <Box sx={{display:'flex', flexDirection:'column', justifyContent:'space-around'}}>

                <h1>Jeu du Parking (Rush Hour)</h1>
                <div style={{ display: 'flex', gap: 10, width: '100%', justifyContent: 'space-around', alignItems:'start' }}>
                    <Box>

                    <LevelDropdown currentLevelIndex={currentLevelIndex} onChange={handleLevelChange} />
{!isMobile() && <Box>
                        <Typography variant='h6'>Mode Drag&Drop</Typography>
                        <Typography variant='caption'>Glissé-deposé en francais</Typography>
                        <Switch
                            checked={dragDropMode}
                            onChange={(e) => setdragDropMode(e.target.checked)}
                            sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                    color: '#ff4444',
                                },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                    backgroundColor: '#ff4444',
                                },
                            }}
                        />
                    </Box>}
                    </Box>
                    <Button
                        onClick={handleRestart}
                        variant="contained"
                    >
                       <RestartAlt/> Restart
                    </Button>
                    


                </div>
            </Box>
            <div style={{
                padding: '10px',
                backgroundColor: '#f0f0f0',
                borderRadius: '8px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }}>
                <ParkingGrid
                    level={currentLevel}
                    cars={cars}
                    setCars={setCars}
                    dragDropMode={dragDropMode}
                    victory={victory} setVictory={setVictory}
                    handleNextLevel={handleNextLevel}
                    handleRestart={handleRestart}
                />
            </div>



        </div>
    );
};
function LevelDropdown({ currentLevelIndex, onChange }) {
    const difficultyLabels = {
        1: "Facile",
        2: "Avancé",
        3: "Difficile",
        4: "Expert",
    }

    const difficultyColors = {
        1: "success",
        2: "info",
        3: "warning",
        4: "error",
    }
    return (
        <FormControl >
            <InputLabel id="level-select-label">Changer de niveau</InputLabel>
            <Select
                labelId="level-select-label"
                value={currentLevelIndex}
                onChange={(e) => onChange(e.target.value)}
            >
                {levels.map((level, index) => (
                    <MenuItem key={level.id} value={index}>
                        Niveau {level.id} —
                        <Chip
                            size="small"
                            label={difficultyLabels[level.niveau]}
                            color={difficultyColors[level.niveau]}
                            sx={{ ml: 1 }}
                        />
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    )
}
const cellSize = 50;
const gap = 4;
// Détection mobile
const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
};
const ParkingGrid = ({ level, cars, setCars, victory, setVictory, handleRestart, handleNextLevel, dragDropMode }) => {
    const { rows, cols } = level;
    const gridRef = useRef(null);

    // Fonction pour vérifier si une position est valide
    const isValidPosition = (car, newPosition) => {
        const { length, orientation } = car;
        const { col, row } = newPosition;


        // Vérifier les collisions avec d'autres voitures
        for (const otherCar of cars) {
            if (otherCar.id === car.id) continue;

            const occupied = getOccupiedCells(otherCar);
            const newOccupied = getOccupiedCells({ ...car, position: newPosition });

            for (const cell of newOccupied) {
                if (occupied.some(c => c.row === cell.row && c.col === cell.col)) {
                    return false;
                }
            }
        }

        // check gagné
        if (car.id === 'X' && orientation === 'H' && col + length === cols && row === 2) {
            setVictory(true);
            return false;
        }
        // Vérifier les limites de la grille
        if (orientation === 'H') {
            if (col < 0 || col + length > cols || row < 0 || row >= rows) {
                return false;
            }
        } else {
            if (col < 0 || col >= cols || row < 0 || row + length > rows) {
                return false;
            }
        }
        return true;
    };

    // Fonction pour obtenir les cellules occupées par une voiture
    const getOccupiedCells = (car) => {
        const cells = [];
        const { length, orientation, position } = car;

        for (let i = 0; i < length; i++) {
            if (orientation === 'H') {
                cells.push({ row: position.row, col: position.col + i });
            } else {
                cells.push({ row: position.row + i, col: position.col });
            }
        }

        return cells;
    };

    // Fonction pour déplacer une voiture
    const moveCar = (carId, newPosition) => {
        setCars(prevCars => {
            const car = prevCars.find(c => c.id === carId);
            if (!car || !isValidPosition(car, newPosition)) {
                return prevCars;
            }

            return prevCars.map(c =>
                c.id === carId ? { ...c, position: newPosition } : c
            );
        });
    };

    // Convertir les coordonnées de la souris en position de grille
    const getGridPosition = (clientX, clientY) => {
        if (!gridRef.current) return null;

        const rect = gridRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        const col = Math.floor(x / (cellSize + gap));
        const row = Math.floor(y / (cellSize + gap));

        return { col: Math.max(0, Math.min(col, cols - 1)), row: Math.max(0, Math.min(row, rows - 1)) };
    };

    // Créer les cellules de fond - SEULEMENT rows * cols cellules
    const backgroundCells = Array.from({ length: rows * cols }, (_, index) => (
        <div
            key={index}
            style={{
                backgroundColor: '#dcdcdc',
                borderRadius: '4px',
                width: `${cellSize}px`,
                height: `${cellSize}px`
            }}
        />
    ));

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            {/* Grille de fond - uniquement les cellules vides */}
            <div
                ref={gridRef}
                data-grid="true"
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
                    gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
                    gap: `${gap}px`,
                    backgroundColor: '#a0a0a0',
                    border: '4px solid #a0a0a0',
                    borderRadius: '8px',
                    position: 'relative',
                    width: `calc(${cols} * ${cellSize}px + ${cols - 1} * ${gap}px)`,
                    margin: 'auto',
                    userSelect: 'none'
                }}
            >
                {/* SEULEMENT les cellules de fond */}
                {backgroundCells}
            </div>

            {/* Couche des voitures - positionnées absolument */}
            <div
                style={{
                    position: 'absolute',
                    top: '4px', // Offset pour la bordure de la grille
                    left: '4px', // Offset pour la bordure de la grille
                    width: `calc(${cols} * ${cellSize}px + ${cols - 1} * ${gap}px)`,
                    height: `calc(${rows} * ${cellSize}px + ${rows - 1} * ${gap}px)`,
                    pointerEvents: 'none', // Les événements passent à travers
                }}
            >
                {cars.map(car => (
                    <Voiture
                        key={car.id}
                        car={car}
                        onMove={moveCar}
                        getGridPosition={getGridPosition}
                        isValidPosition={isValidPosition}
                        cellSize={cellSize}
                        dragDropMode={dragDropMode}
                        gap={gap}
                        cols={cols}
                        rows={rows}
                    />
                ))}
            </div>
            {/* exit image */}
            <div style={{
                position: 'absolute', backgroundImage: `url(${wayOut})`, backgroundSize: 'contain'
                , width: cellSize, height: cellSize
                , top: `calc(2 * ${cellSize}px + 2 * ${gap}px)`
                , left: `calc(${cols} * ${cellSize}px + ${cols - 1} * ${gap}px)`
            }}>

            </div>
            {/* Couche séparée pour les fantômes */}
            <div
                style={{
                    position: 'absolute',
                    top: '4px',
                    left: '4px',
                    width: `calc(${cols} * ${cellSize}px + ${cols - 1} * ${gap}px)`,
                    height: `calc(${rows} * ${cellSize}px + ${rows - 1} * ${gap}px)`,
                    pointerEvents: 'none',
                    zIndex: 10
                }}
            >
                {cars.map(car => (
                    <VoitureGhost
                        key={`ghost-${car.id}`}
                        car={car}
                        cellSize={cellSize}
                        gap={gap}
                        cols={cols}
                        rows={rows}
                    />
                ))}
            </div>
            <VictoryDialog
                open={victory}
                onClose={() => setVictory(false)}
                onNextLevel={() => {
                    setVictory(false);
                    handleNextLevel();
                }}
                onRetry={() => {
                    setVictory(false);
                    handleRestart();
                }}
            />
        </div>
    );
};


const Voiture = ({ car, onMove, getGridPosition, isValidPosition, cellSize, gap, cols, rows, dragDropMode }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // Communiquer l'état de drag au composant fantôme
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            if (isDragging) {
                window.dragState = { carId: car.id, mousePosition, dragOffset };
            } else if (window.dragState && window.dragState.carId === car.id) {
                window.dragState = null;
            }
        }
    }, [isDragging, car.id, mousePosition, dragOffset]);


    // Nouvelle fonction pour mobile - mouvement automatique
    const handleMobileMove = (orientation, length) => {
        const currentPos = car.position;
        let newPosition = { ...currentPos };

        // Déterminer les directions possibles selon l'orientation
        if (orientation === 'H') {
            // Essayer d'aller à droite au maximum
            let targetCol = currentPos.col + 1;
            while (targetCol + length <= cols) {
                const testPos = { col: targetCol, row: currentPos.row };
                // Utilise ta fonction isValidPosition existante
                if (isValidPosition(car, testPos)) {
                    newPosition = testPos;
                    targetCol++;
                } else {
                    break;
                }
            }
            // Si on n'a pas bougé, essayer à gauche
            if (newPosition.col === currentPos.col) {
                targetCol = currentPos.col - 1;
                while (targetCol >= 0) {
                    const testPos = { col: targetCol, row: currentPos.row };
                    if (isValidPosition(car, testPos)) {
                        newPosition = testPos;
                        targetCol--;
                    } else {
                        break;
                    }
                }
            }
        } else {
            // Essayer d'aller à droite au maximum
            let targetRow = currentPos.row + 1;
            while (targetRow + length <= rows) {
                const testPos = { row: targetRow, col: currentPos.col };
                // Utilise ta fonction isValidPosition existante
                if (isValidPosition(car, testPos)) {
                    newPosition = testPos;
                    targetRow++;
                } else {
                    break;
                }
            }
            // Si on n'a pas bougé, essayer à gauche
            if (newPosition.row === currentPos.row) {
                targetRow = currentPos.row - 1;
                while (targetRow >= 0) {
                    const testPos = { row: targetRow, col: currentPos.col };
                    if (isValidPosition(car, testPos)) {
                        newPosition = testPos;
                        targetRow--;
                    } else {
                        break;
                    }
                }
            }
        }

        onMove(car.id, newPosition);
    };
    // Gestionnaire unifié pour clic/touch
    const handleInteraction = (e, orientation, carLength) => {
        e.preventDefault();
        e.stopPropagation();

        if (!dragDropMode || isMobile()) {
            // Sur mobile : mouvement automatique
            handleMobileMove(orientation, carLength);
        } else {
            // Sur desktop : drag & drop classique
            handleMouseDown(e, orientation, carLength);
        }
    };
    const handleMouseDown = (e, orientation, carLength) => {
        e.preventDefault();
        e.stopPropagation(); // Empêcher la propagation
        setIsDragging(true);

        const rect = e.currentTarget.getBoundingClientRect();
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });

        setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = useCallback((e) => {
        if (!isDragging) return;
        e.preventDefault();
        setMousePosition({ x: e.clientX, y: e.clientY });
    }, [isDragging]);

    const handleMouseUp = useCallback((e) => {
        if (!isDragging) return;

        e.preventDefault();
        setIsDragging(false);

        const gridPos = getGridPosition(e.clientX - dragOffset.x, e.clientY - dragOffset.y);
        if (gridPos) {
            let newPosition;
            if (car.orientation === 'H') {
                newPosition = { col: gridPos.col, row: car.position.row };
            } else {
                newPosition = { col: car.position.col, row: gridPos.row };
            }

            onMove(car.id, newPosition);
        }
    }, [isDragging, car, onMove, getGridPosition, dragOffset]);

    React.useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);

            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    const { carWidth, carHeight, carPos } = React.useMemo(() => {
        const carWidth = 100; // Largeur totale de l'image} 567 333
        return { carWidth: carPositions[car.id].width, carHeight: carPositions[car.id].height, carPos: carPositions[car.id] || { x: 0, y: 0 } };
    }, [car]);

    if (!car) return null;

    // Calculer la position absolue de la voiture
    const leftPos = car.position.col * (cellSize + gap);
    const topPos = car.position.row * (cellSize + gap);
    const width = car.orientation === 'H' ? car.length * cellSize + (car.length - 1) * gap : cellSize;
    const height = car.orientation === 'V' ? car.length * cellSize + (car.length - 1) * gap : cellSize;

    const commonStyle = {

        width: car.orientation === "V" ? width : height, // inverse !
        height: car.orientation === "V" ? height : width,
        //  backgroundColor: car.id === 'X' ? '#ff1744' : '#ff5733',
        backgroundImage: `url(${carSprite})`,
        backgroundSize: `${carWidth}px ${carHeight}px`,
        backgroundPosition: `${carPos.x}px ${carPos.y}px`,
        backgroundRepeat: "no-repeat",
        transform: car.orientation === "H" ? `rotate(90deg) translate(0px, -${cellSize * car.length}px)` : "none",
        transformOrigin: 'top left',

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 'bold',
        borderRadius: '8px',

    }

    const carStyle = {
        ...commonStyle,
        position: 'absolute',
        left: `${leftPos}px`,
        top: `${topPos}px`, boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        touchAction: 'none', // Empêche le scroll pendant l'interaction
        userSelect: 'none',  // Empêche la sélection de texte

        // Style différent selon la plateforme
        cursor: isMobile() ? 'pointer' : 'grab',
        ...(isMobile() && {
            '&:active': {
                transform: 'scale(0.95)',
                opacity: 0.8
            }
        }),
        transition: 'all 0.2s ease',
        opacity: isDragging ? 0.3 : 1,
        zIndex: 1,
        pointerEvents: 'all' // Permettre les interactions
    };

    const floatingCarStyle = isDragging ? {
        ...commonStyle,
        position: 'fixed',
        left: mousePosition.x - dragOffset.x,
        top: mousePosition.y - dragOffset.y,

        boxShadow: '0 12px 24px rgba(0,0,0,0.5)',
        cursor: 'grabbing',

        zIndex: 1000,
        pointerEvents: 'none',
        border: '2px solid rgba(255,255,255,0.5)'
    } : null;
    // onMouseDown={evt => { handleMouseDown(evt, car.orientation, car.length) }}
    return (
        <>
            <Box
                style={carStyle}
                onMouseDown={evt => { if (!isMobile()) handleInteraction(evt, car.orientation, car.length) }}
                onTouchStart={evt => { if (isMobile()) handleInteraction(evt, car.orientation, car.length) }}

            >

            </Box>

            {isDragging && (
                <Box style={floatingCarStyle}>
                    {car.id}
                </Box>
            )}
        </>
    );
};

const VoitureGhost = ({ car, cellSize, gap, cols, rows }) => {
    const [ghostPosition, setGhostPosition] = useState(null);

    React.useEffect(() => {
        const interval = setInterval(() => {
            if (typeof window !== 'undefined' && window.dragState && window.dragState.carId === car.id) {
                const { mousePosition, dragOffset } = window.dragState;

                const gridRect = document.querySelector('[data-grid="true"]')?.getBoundingClientRect();
                if (gridRect) {
                    const x = mousePosition.x - dragOffset.x - gridRect.left + cellSize / 2;
                    const y = mousePosition.y - dragOffset.y - gridRect.top;

                    const col = Math.floor(x / (cellSize + gap));
                    const row = Math.floor(y / (cellSize + gap));

                    const gridPos = {
                        col: Math.max(0, Math.min(col, cols - 1)),
                        row: Math.max(0, Math.min(row, rows - 1))
                    };

                    let newPosition;
                    if (car.orientation === 'H') {
                        newPosition = { col: gridPos.col, row: car.position.row };
                    } else {
                        newPosition = { col: car.position.col, row: gridPos.row };
                    }

                    setGhostPosition(newPosition);
                }
            } else {
                setGhostPosition(null);
            }
        }, 16);

        return () => clearInterval(interval);
    }, [car, cellSize, gap, cols, rows]);

    if (!ghostPosition) return null;
    if (isMobile()) return null;

    const leftPos = ghostPosition.col * (cellSize + gap);
    const topPos = ghostPosition.row * (cellSize + gap);
    const width = car.orientation === 'H' ? car.length * cellSize + (car.length - 1) * gap : cellSize;
    const height = car.orientation === 'V' ? car.length * cellSize + (car.length - 1) * gap : cellSize;

    const ghostStyle = {
        position: 'absolute',
        left: `${leftPos}px`,
        top: `${topPos}px`,
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: car.id === 'X' ? '#ff1744' : '#ff5733',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 'bold',
        borderRadius: '8px',
        boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
        opacity: 0.6,
        transform: 'scale(1.05)',
        border: '2px dashed #fff',
        zIndex: 20
    };

    return (
        <div style={ghostStyle}>
            {car.id}
        </div>
    );
};

export default RushHour;

function VictoryDialog({ open, onClose, onNextLevel, onRetry }) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle
                sx={{
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: "1.5rem"
                }}
            >
                🎉 Bravo !
            </DialogTitle>

            <DialogContent>
                <Typography
                    variant="body1"
                    sx={{ textAlign: "center", fontSize: "1.1rem", mb: 2 }}
                >
                    Vous avez gagné ce niveau !
                </Typography>
            </DialogContent>

            <DialogActions
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 2,
                    pb: 2
                }}
            >
                <Button
                    onClick={onRetry}
                    variant="outlined"
                    sx={{ borderRadius: "12px", px: 3 }}
                >
                    🔄 Refaire
                </Button>
                <Button
                    onClick={onNextLevel}
                    variant="contained"
                    sx={{ borderRadius: "12px", px: 3 }}
                >
                    ⏭ Niveau suivant
                </Button>
            </DialogActions>
        </Dialog>
    )
}
