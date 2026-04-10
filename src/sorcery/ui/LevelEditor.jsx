import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Tabs,
  Tab,
  IconButton,
  Paper,
  Divider,
  Grid,
  Chip,
  Stack,
  Input,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Download,
  Add,
  Delete,
  GridOn,
  Upload,
  Circle
} from '@mui/icons-material';

const ITEMS = [
  {id: 'potion-health-small', name: 'Petite Potion de Vie', color: '#ff6b6b'},
  {id: 'potion-health', name: 'Potion de Vie', color: '#ff0000'},
  {id: 'potion-mana', name: 'Potion de Mana', color: '#4dabf7'},
  {id: 'ancient-key', name: 'Clé Ancienne', color: '#ffd700'},
  {id: 'bone-fragment', name: "Fragment d'Os", color: '#e9ecef'},
  {id: 'stone-core', name: 'Cœur de Pierre', color: '#868e96'},
  {id: 'shadow-essence', name: "Essence d'Ombre", color: '#495057'},
  {id: 'spell-scroll-fireball', name: 'Parchemin - Boule de Feu', color: '#ff6b35'},
  {id: 'spell-scroll-shadow', name: "Parchemin - Lame d'Ombre", color: '#5f3dc4'},
  {id: 'spell-scroll-soin', name: 'Parchemin de soin', color: '#40c057'},
  {id: 'spell-scroll-shield', name: 'Parchemin - Bouclier magique', color: '#1971c2'},
  {id: 'spell-scroll-freeze', name: 'Parchemin - Immobilisation', color: '#74c0fc'},
  {id: 'spell-scroll-teleport', name: 'Parchemin - Teleportation', color: '#9775fa'},
  {id: 'spell-scroll-meteor', name: 'Parchemin -Tempete de meteores', color: '#fa5252'},
  {id: 'spell-scroll-ice', name: 'Parchemin - Freezer', color: '#339af0'},
  {id: 'spell-scroll-ghost', name: 'Parchemin - Passer a travers les murs', color: '#adb5bd'},
  {id: 'sword-iron', name: 'Épée de Fer', color: '#868e96'},
  {id: 'staff-apprentice', name: "Bâton d'Apprenti", color: '#8b4513'},
  {id: 'chest-wooden', name: 'Coffre en Bois', color: '#8b4513'},
  {id: 'spikes-floor', name: 'Piques au Sol', color: '#495057'},
  {id: 'brazier-fire', name: 'Brasier', color: '#ff922b'},
  {id: 'healing-pot', name: 'Marmite de Soin', color: '#51cf66'},
  {id: 'mana-fountain', name: 'Fontaine de Mana', color: '#339af0'},
  {id: 'leather-armor', name: 'Armure de Cuir', color: '#8b4513'},
  {id: 'iron-armor', name: 'Armure de Fer', color: '#495057'}
];

const ENEMIES = [
  {id: 'skeleton-warrior', name: 'Guerrier Squelette', color: '#e9ecef'},
  {id: 'stone-guardian', name: 'Gardien de Pierre', color: '#868e96'},
  {id: 'shadow-demon', name: "Démon d'Ombre", color: '#5f3dc4'},
  {id: 'bat-shadow', name: "Chauve-souris d'Ombre", color: '#343a40'},
  {id: 'golem-heavy', name: 'Golem Lourd', color: '#495057'}
];

const OBSTACLES = [
  {id: 'stone-wall', name: 'Mur de Pierre', color: '#868e96'},
  {id: 'magic-barriere', name: 'Barriere magique', color: '#9775fa'},
  {id: 'wooden-crate', name: 'Caisse en Bois', color: '#8b4513'},
  {id: 'tree', name: 'Arbre', color: '#2f9e44'},
  {id: 'boulder', name: 'Rocher', color: '#495057'}
];

const LevelEditor = () => {
  const [level, setLevel] = useState({
    id: 'level-1',
    name: 'Mon Niveau',
    description: 'Description du niveau',
    startRoom: 'room-1',
    rooms: [{
      id: 'room-1',
      name: 'Salle 1',
      description: 'Description',
      width: 800,
      height: 400,
      color: '#466e31',
      background: 'catacomb-entrance',
      exits: [],
      entities: [],
      platforms: [{x: 0, y: 350, width: 800, height: 50}]
    }]
  });

  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [selectedTool, setSelectedTool] = useState(null);
  const [selectedType, setSelectedType] = useState('item');
  const [showGrid, setShowGrid] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragCurrent, setDragCurrent] = useState(null);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [editingEntity, setEditingEntity] = useState(null);
  const canvasRef = useRef(null);

  const currentRoom = level.rooms[currentRoomIndex];

  const addRoom = () => {
    const newRoom = {
      id: `room-${level.rooms.length + 1}`,
      name: `Salle ${level.rooms.length + 1}`,
      description: 'Description',
      width: 800,
      height: 400,
      color: '#466e31',
      background: 'catacomb-entrance',
      exits: [],
      entities: [],
      platforms: [{x: 0, y: 350, width: 800, height: 50}]
    };
    setLevel({...level, rooms: [...level.rooms, newRoom]});
    setCurrentRoomIndex(level.rooms.length);
  };

  const deleteRoom = () => {
    if (level.rooms.length === 1) return;
    const newRooms = level.rooms.filter((_, i) => i !== currentRoomIndex);
    setLevel({...level, rooms: newRooms});
    setCurrentRoomIndex(Math.max(0, currentRoomIndex - 1));
  };

  const updateRoom = (updates) => {
    const newRooms = [...level.rooms];
    newRooms[currentRoomIndex] = {...currentRoom, ...updates};
    setLevel({...level, rooms: newRooms});
  };

  const getCanvasCoordinates = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / rect.width * currentRoom.width);
    const y = Math.round((e.clientY - rect.top) / rect.height * currentRoom.height);
    return { x, y };
  };

  const handleCanvasMouseDown = (e) => {
    if (!selectedTool && selectedType !== 'exit' && selectedType !== 'platform') return;
    
    const coords = getCanvasCoordinates(e);
    
    if (selectedType === 'exit' || selectedType === 'platform') {
      setIsDragging(true);
      setDragStart(coords);
      setDragCurrent(coords);
    } else {
      // Place entity immediately for items, enemies, obstacles
      const entity = {
        type: selectedType,
        id: selectedTool.id,
        x: coords.x,
        y: coords.y,
        width: 40,
        height: 40
      };

      if (selectedType === 'enemy') {
        entity.enemyType = selectedTool.id;
      } else if (selectedType === 'obstacle') {
        entity.obstacleType = selectedTool.id;
      }

      updateRoom({entities: [...currentRoom.entities, entity]});
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDragging || !dragStart) return;
    
    const coords = getCanvasCoordinates(e);
    setDragCurrent(coords);
  };

  const handleCanvasMouseUp = (e) => {
    if (!isDragging || !dragStart || !dragCurrent) return;
    
    const x = Math.min(dragStart.x, dragCurrent.x);
    const y = Math.min(dragStart.y, dragCurrent.y);
    const width = Math.abs(dragCurrent.x - dragStart.x);
    const height = Math.abs(dragCurrent.y - dragStart.y);

    if (width < 10 || height < 10) {
      setIsDragging(false);
      setDragStart(null);
      setDragCurrent(null);
      return;
    }

    if (selectedType === 'exit') {
      const newExit = {
        direction: 'right',
        toRoom: 'room-1',
        x,
        y,
        width,
        height
      };
      updateRoom({exits: [...currentRoom.exits, newExit]});
    } else if (selectedType === 'platform') {
      const newPlatform = { x, y, width, height };
      updateRoom({platforms: [...currentRoom.platforms, newPlatform]});
    }

    setIsDragging(false);
    setDragStart(null);
    setDragCurrent(null);
  };

  const deleteEntity = (index) => {
    const newEntities = currentRoom.entities.filter((_, i) => i !== index);
    updateRoom({entities: newEntities});
  };

  const updateEntity = (index, updates) => {
    const newEntities = [...currentRoom.entities];
    newEntities[index] = { ...newEntities[index], ...updates };
    updateRoom({entities: newEntities});
  };

  const deleteExit = (index) => {
    const newExits = currentRoom.exits.filter((_, i) => i !== index);
    updateRoom({exits: newExits});
  };

  const deletePlatform = (index) => {
    const newPlatforms = currentRoom.platforms.filter((_, i) => i !== index);
    updateRoom({platforms: newPlatforms});
  };

  const exportJSON = () => {
    const dataStr = JSON.stringify(level, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${level.id}.json`;
    link.click();
  };

  const importJSON = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          setLevel(imported);
          setCurrentRoomIndex(0);
        } catch (err) {
          alert('Erreur lors de l\'import du fichier JSON');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#1a1a1a' }}>
      {/* Sidebar */}
      <Box sx={{ 
        width: 280, 
        bgcolor: '#2a2a2a', 
        p: 2, 
        overflowY: 'auto',
        borderRight: '1px solid #444'
      }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: 'white' }}>
          Éditeur de Niveau
        </Typography>
        
        {/* Level Info */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            size="small"
            label="Nom du niveau"
            value={level.name}
            onChange={(e) => setLevel({...level, name: e.target.value})}
            sx={{ mb: 2, bgcolor: '#3a3a3a', '& .MuiInputBase-root': { color: 'white' }, '& .MuiInputLabel-root': { color: '#aaa' } }}
          />
          <TextField
            fullWidth
            size="small"
            label="ID"
            value={level.id}
            onChange={(e) => setLevel({...level, id: e.target.value})}
            sx={{ bgcolor: '#3a3a3a', '& .MuiInputBase-root': { color: 'white' }, '& .MuiInputLabel-root': { color: '#aaa' } }}
          />
        </Box>

        <Divider sx={{ my: 2, bgcolor: '#444' }} />

        {/* Tools */}
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'white', fontWeight: 'bold' }}>
          Type d'élément
        </Typography>
        <Stack spacing={1} sx={{ mb: 3 }}>
          {[
            { value: 'item', label: '📦 Items' },
            { value: 'enemy', label: '👹 Ennemis' },
            { value: 'obstacle', label: '🧱 Obstacles' },
            { value: 'exit', label: '🚪 Sorties' },
            { value: 'platform', label: '🟦 Plateformes' }
          ].map(type => (
            <Button
              key={type.value}
              fullWidth
              variant={selectedType === type.value ? 'contained' : 'outlined'}
              onClick={() => {setSelectedType(type.value); setSelectedTool(null);}}
              sx={{
                justifyContent: 'flex-start',
                textTransform: 'none',
                color: selectedType === type.value ? 'white' : '#aaa',
                borderColor: '#555',
                bgcolor: selectedType === type.value ? '#1976d2' : 'transparent',
                '&:hover': {
                  bgcolor: selectedType === type.value ? '#1565c0' : '#3a3a3a'
                }
              }}
            >
              {type.label}
            </Button>
          ))}
        </Stack>

        {/* Elements List */}
        {selectedType === 'item' && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'white', fontWeight: 'bold' }}>
              Items
            </Typography>
            <Stack spacing={0.5} sx={{ maxHeight: 300, overflowY: 'auto' }}>
              {ITEMS.map(item => (
                <Button
                  key={item.id}
                  fullWidth
                  size="small"
                  onClick={() => setSelectedTool(item)}
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    fontSize: '0.75rem',
                    color: 'white',
                    bgcolor: selectedTool?.id === item.id ? '#1976d2' : '#3a3a3a',
                    '&:hover': {
                      bgcolor: selectedTool?.id === item.id ? '#1565c0' : '#4a4a4a'
                    },
                    py: 0.5
                  }}
                >
                  <Circle sx={{ fontSize: 12, color: item.color, mr: 1 }} />
                  <Typography variant="caption" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.name}
                  </Typography>
                </Button>
              ))}
            </Stack>
          </Box>
        )}

        {selectedType === 'enemy' && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'white', fontWeight: 'bold' }}>
              Ennemis
            </Typography>
            <Stack spacing={0.5}>
              {ENEMIES.map(enemy => (
                <Button
                  key={enemy.id}
                  fullWidth
                  size="small"
                  onClick={() => setSelectedTool(enemy)}
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    fontSize: '0.75rem',
                    color: 'white',
                    bgcolor: selectedTool?.id === enemy.id ? '#1976d2' : '#3a3a3a',
                    '&:hover': {
                      bgcolor: selectedTool?.id === enemy.id ? '#1565c0' : '#4a4a4a'
                    }
                  }}
                >
                  <Circle sx={{ fontSize: 12, color: enemy.color, mr: 1 }} />
                  {enemy.name}
                </Button>
              ))}
            </Stack>
          </Box>
        )}

        {selectedType === 'obstacle' && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'white', fontWeight: 'bold' }}>
              Obstacles
            </Typography>
            <Stack spacing={0.5}>
              {OBSTACLES.map(obstacle => (
                <Button
                  key={obstacle.id}
                  fullWidth
                  size="small"
                  onClick={() => setSelectedTool(obstacle)}
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    fontSize: '0.75rem',
                    color: 'white',
                    bgcolor: selectedTool?.id === obstacle.id ? '#1976d2' : '#3a3a3a',
                    '&:hover': {
                      bgcolor: selectedTool?.id === obstacle.id ? '#1565c0' : '#4a4a4a'
                    }
                  }}
                >
                  <Circle sx={{ fontSize: 12, color: obstacle.color, mr: 1 }} />
                  {obstacle.name}
                </Button>
              ))}
            </Stack>
          </Box>
        )}

        {/* Actions */}
        <Divider sx={{ my: 2, bgcolor: '#444' }} />
        <Stack spacing={1}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GridOn />}
            onClick={() => setShowGrid(!showGrid)}
            sx={{ 
              color: 'white', 
              borderColor: '#555',
              textTransform: 'none',
              '&:hover': { borderColor: '#777', bgcolor: '#3a3a3a' }
            }}
          >
            Grille: {showGrid ? 'ON' : 'OFF'}
          </Button>
          <Button
            fullWidth
            variant="contained"
            component="label"
            startIcon={<Upload />}
            sx={{ 
              bgcolor: '#2e7d32',
              textTransform: 'none',
              '&:hover': { bgcolor: '#1b5e20' }
            }}
          >
            Importer JSON
            <input type="file" accept=".json" hidden onChange={importJSON} />
          </Button>
          <Button
            fullWidth
            variant="contained"
            startIcon={<Download />}
            onClick={exportJSON}
            sx={{ 
              bgcolor: '#1976d2',
              textTransform: 'none',
              '&:hover': { bgcolor: '#1565c0' }
            }}
          >
            Exporter JSON
          </Button>
        </Stack>
      </Box>

      {/* Main Canvas */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Room Tabs */}
        <Box sx={{ bgcolor: '#2a2a2a', borderBottom: '1px solid #444', display: 'flex', alignItems: 'center', gap: 1, p: 1, overflowX: 'auto' }}>
          {level.rooms.map((room, index) => (
            <Button
              key={room.id}
              variant={currentRoomIndex === index ? 'contained' : 'outlined'}
              onClick={() => setCurrentRoomIndex(index)}
              sx={{
                minWidth: 'auto',
                whiteSpace: 'nowrap',
                textTransform: 'none',
                color: currentRoomIndex === index ? 'white' : '#aaa',
                borderColor: '#555',
                bgcolor: currentRoomIndex === index ? '#1976d2' : 'transparent',
                '&:hover': {
                  bgcolor: currentRoomIndex === index ? '#1565c0' : '#3a3a3a'
                }
              }}
            >
              {room.name}
            </Button>
          ))}
          <IconButton
            onClick={addRoom}
            sx={{ 
              bgcolor: '#2e7d32',
              color: 'white',
              '&:hover': { bgcolor: '#1b5e20' }
            }}
          >
            <Add />
          </IconButton>
          {level.rooms.length > 1 && (
            <IconButton
              onClick={deleteRoom}
              sx={{ 
                bgcolor: '#d32f2f',
                color: 'white',
                '&:hover': { bgcolor: '#c62828' }
              }}
            >
              <Delete />
            </IconButton>
          )}
        </Box>

        {/* Room Settings */}
        <Paper sx={{ bgcolor: '#2a2a2a', p: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', borderRadius: 0 }}>
          <TextField
            size="small"
            label="Nom"
            value={currentRoom.name}
            onChange={(e) => updateRoom({name: e.target.value})}
            sx={{ 
              minWidth: 150,
              bgcolor: '#3a3a3a', 
              '& .MuiInputBase-root': { color: 'white' }, 
              '& .MuiInputLabel-root': { color: '#aaa' } 
            }}
          />
          <TextField
            size="small"
            type="number"
            label="Largeur"
            value={currentRoom.width}
            onChange={(e) => updateRoom({width: parseInt(e.target.value)})}
            sx={{ 
              width: 100,
              bgcolor: '#3a3a3a', 
              '& .MuiInputBase-root': { color: 'white' }, 
              '& .MuiInputLabel-root': { color: '#aaa' } 
            }}
          />
          <TextField
            size="small"
            type="number"
            label="Hauteur"
            value={currentRoom.height}
            onChange={(e) => updateRoom({height: parseInt(e.target.value)})}
            sx={{ 
              width: 100,
              bgcolor: '#3a3a3a', 
              '& .MuiInputBase-root': { color: 'white' }, 
              '& .MuiInputLabel-root': { color: '#aaa' } 
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{ color: '#aaa' }}>Couleur</Typography>
            <Input
              type="color"
              value={currentRoom.color}
              onChange={(e) => updateRoom({color: e.target.value})}
              sx={{ width: 50, height: 30 }}
            />
          </Box>
          <TextField
            size="small"
            label="Background"
            value={currentRoom.background}
            onChange={(e) => updateRoom({background: e.target.value})}
            sx={{ 
              minWidth: 150,
              bgcolor: '#3a3a3a', 
              '& .MuiInputBase-root': { color: 'white' }, 
              '& .MuiInputLabel-root': { color: '#aaa' } 
            }}
          />
        </Paper>

        {/* Canvas */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: '#1a1a1a' }}>
          <Box
            ref={canvasRef}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            sx={{
              position: 'relative',
              margin: '0 auto',
              border: '2px solid #555',
              cursor: (selectedType === 'exit' || selectedType === 'platform') ? 'crosshair' : (selectedTool ? 'copy' : 'default'),
              width: currentRoom.width,
              height: currentRoom.height,
              bgcolor: currentRoom.color,
              backgroundImage: showGrid ? 
                'repeating-linear-gradient(0deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 1px, transparent 1px, transparent 50px), repeating-linear-gradient(90deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 1px, transparent 1px, transparent 50px)' 
                : 'none'
            }}
          >
            {/* Drag Preview */}
            {isDragging && dragStart && dragCurrent && (
              <Box
                sx={{
                  position: 'absolute',
                  left: Math.min(dragStart.x, dragCurrent.x),
                  top: Math.min(dragStart.y, dragCurrent.y),
                  width: Math.abs(dragCurrent.x - dragStart.x),
                  height: Math.abs(dragCurrent.y - dragStart.y),
                  bgcolor: selectedType === 'platform' ? 'rgba(184, 134, 11, 0.5)' : 'rgba(156, 39, 176, 0.5)',
                  border: '2px dashed white',
                  pointerEvents: 'none'
                }}
              />
            )}

            {/* Platforms */}
            {currentRoom.platforms.map((platform, i) => (
              <Box
                key={`platform-${i}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Supprimer cette plateforme ?')) {
                    deletePlatform(i);
                  }
                }}
                sx={{
                  position: 'absolute',
                  left: platform.x,
                  top: platform.y,
                  width: platform.width,
                  height: platform.height,
                  bgcolor: '#b8860b',
                  border: '1px solid #daa520',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: '#daa520'
                  }
                }}
              >
                <Typography variant="caption" sx={{ color: 'white', px: 0.5, fontSize: '0.65rem' }}>
                  Platform
                </Typography>
              </Box>
            ))}

            {/* Exits */}
            {currentRoom.exits.map((exit, i) => (
              <Box
                key={`exit-${i}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Supprimer cette sortie ?')) {
                    deleteExit(i);
                  }
                }}
                sx={{
                  position: 'absolute',
                  left: exit.x,
                  top: exit.y,
                  width: exit.width,
                  height: exit.height,
                  bgcolor: '#9c27b0',
                  border: '2px solid #ba68c8',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: '#ba68c8'
                  }
                }}
              >
                <Typography variant="caption" sx={{ color: 'white', px: 0.5, fontSize: '0.65rem' }}>
                  →{exit.toRoom}
                </Typography>
              </Box>
            ))}

            {/* Entities */}
            {currentRoom.entities.map((entity, i) => {
              const color = 
                entity.type === 'item' ? ITEMS.find(it => it.id === entity.id.split('-')[0] + '-' + entity.id.split('-')[1] || entity.id.split('-')[0])?.color || '#fff' :
                entity.type === 'enemy' ? ENEMIES.find(en => en.id === entity.enemyType)?.color || '#f00' :
                OBSTACLES.find(ob => ob.id === entity.obstacleType)?.color || '#888';

              return (
                <Box
                  key={`entity-${i}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingEntity({ index: i, ...entity });
                  }}
                  sx={{
                    position: 'absolute',
                    left: entity.x,
                    top: entity.y,
                    width: entity.width || 40,
                    height: entity.height || 40,
                    bgcolor: color,
                    border: editingEntity?.index === i ? '3px solid yellow' : '2px solid white',
                    cursor: 'pointer',
                    '&:hover': {
                      opacity: 0.8,
                      boxShadow: '0 0 10px rgba(255,255,255,0.5)'
                    }
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'white', px: 0.5, fontSize: '0.65rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                    {entity.type === 'item' && '📦'}
                    {entity.type === 'enemy' && '👹'}
                    {entity.type === 'obstacle' && '🧱'}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Entity List */}
        <Paper sx={{ bgcolor: '#2a2a2a', p: 2, maxHeight: 200, overflowY: 'auto', borderRadius: 0 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'white', fontWeight: 'bold' }}>
            Éléments dans la salle ({currentRoom.entities.length})
          </Typography>
          <Grid container spacing={1}>
            {currentRoom.entities.map((entity, i) => (
              <Grid item xs={3} key={i}>
                <Paper sx={{ 
                  bgcolor: '#3a3a3a', 
                  p: 1, 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center' 
                }}>
                  <Typography variant="caption" sx={{ color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                    {entity.type}: {entity.id}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => deleteEntity(i)}
                    sx={{ 
                      color: '#f44336',
                      ml: 1,
                      '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.1)' }
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>

      {/* Entity Edit Dialog */}
      <Dialog 
        open={editingEntity !== null} 
        onClose={() => setEditingEntity(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#2a2a2a', color: 'white' }}>
          Éditer l'élément
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#2a2a2a', pt: 3 }}>
          {editingEntity && (
            <Stack spacing={2}>
              <TextField
                fullWidth
                size="small"
                label="X"
                type="number"
                value={editingEntity.x}
                onChange={(e) => setEditingEntity({...editingEntity, x: parseInt(e.target.value)})}
                sx={{ 
                  bgcolor: '#3a3a3a', 
                  '& .MuiInputBase-root': { color: 'white' }, 
                  '& .MuiInputLabel-root': { color: '#aaa' } 
                }}
              />
              <TextField
                fullWidth
                size="small"
                label="Y"
                type="number"
                value={editingEntity.y}
                onChange={(e) => setEditingEntity({...editingEntity, y: parseInt(e.target.value)})}
                sx={{ 
                  bgcolor: '#3a3a3a', 
                  '& .MuiInputBase-root': { color: 'white' }, 
                  '& .MuiInputLabel-root': { color: '#aaa' } 
                }}
              />
              <TextField
                fullWidth
                size="small"
                label="Largeur"
                type="number"
                value={editingEntity.width || 40}
                onChange={(e) => setEditingEntity({...editingEntity, width: parseInt(e.target.value)})}
                sx={{ 
                  bgcolor: '#3a3a3a', 
                  '& .MuiInputBase-root': { color: 'white' }, 
                  '& .MuiInputLabel-root': { color: '#aaa' } 
                }}
              />
              <TextField
                fullWidth
                size="small"
                label="Hauteur"
                type="number"
                value={editingEntity.height || 40}
                onChange={(e) => setEditingEntity({...editingEntity, height: parseInt(e.target.value)})}
                sx={{ 
                  bgcolor: '#3a3a3a', 
                  '& .MuiInputBase-root': { color: 'white' }, 
                  '& .MuiInputLabel-root': { color: '#aaa' } 
                }}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#2a2a2a', p: 2 }}>
          <Button 
            onClick={() => {
              if (editingEntity && window.confirm('Supprimer cet élément ?')) {
                deleteEntity(editingEntity.index);
                setEditingEntity(null);
              }
            }}
            sx={{ color: '#f44336' }}
          >
            Supprimer
          </Button>
          <Button onClick={() => setEditingEntity(null)} sx={{ color: '#aaa' }}>
            Annuler
          </Button>
          <Button 
            onClick={() => {
              if (editingEntity) {
                const { index, ...updates } = editingEntity;
                updateEntity(index, updates);
                setEditingEntity(null);
              }
            }}
            variant="contained"
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LevelEditor;