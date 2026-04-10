// src/components/Field.js
import React, { useEffect, useState } from 'react';

import {  Card, CardActionArea, Box, Button, Typography, Dialog, DialogTitle, DialogContent, Grid, DialogActions } from '@mui/material';
import { useFarming } from './FarmingProvider';
import { getCurrentMission, getPlanteById, MISSION_TYPES, MISSIONS_BY_LEVEL, PLANTES } from './farmData';
import champImg from './images/champ.png';
import { Add, Eco, Grass } from '@mui/icons-material';

const Field = ({ field }) => {
  const { resources, setResources, fields, setFields, warehouseSize, level
    , setMissionProgress , setEngrais, engrais, setLogMessage, xMode} = useFarming();
  const [now, setNow] = useState(Date.now());
  const [openDialog, setOpenDialog] = useState(false);
  const [openFertilizerDialog, setOpenFertilizerDialog] = useState(false);

  const plante = React.useMemo(() => {
    if (!field.crop) return null;
    return getPlanteById(field.crop);
  }, [field.crop]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const plantCrop = (cropId) => {
    const updated = fields.map((f) =>
      f.id === field.id ? { ...f, crop: cropId, plantedAt: Date.now() } : f
    );
    setFields(updated);
    setOpenDialog(false);
  };
  
  const plantFertilize = () => {
    const updated = fields.map((f) => {
      if (f.id === field.id) {
        // Reculer la date de plantation d'1 jour (86400000 ms = 24h)
        const newPlantedAt = f.plantedAt - 86400000;
        return { ...f, plantedAt: newPlantedAt };
      }
      return f;
    });
    setFields(updated);
    setEngrais(prev => prev - 1);
    setOpenFertilizerDialog(false);
  };

  const harvestCrop = () => {
    if (!field.crop || !field.plantedAt) return;
    const growthTime = plante.tempsDePousse;
    const ready = now - field.plantedAt >= growthTime;
    const totalStored = Object.values(resources).reduce((acc, val) => acc + val, 0);

    if (!ready) return;
    if (totalStored >= warehouseSize) return setLogMessage("Entrepôt plein !");
    const qteRecoltee = plante.quantiteParRecolte || 1;
    setResources((prev) => ({
      ...prev,
      [field.crop]: prev[field.crop] + qteRecoltee,
    }));
    const mission = getCurrentMission(level);
    if(mission.type === MISSION_TYPES.HARVEST_CROP && mission.targetItem === field.crop)
        setMissionProgress(prev => ({...prev, progress: prev.progress + qteRecoltee}));

    const updated = fields.map((f) =>
      f.id === field.id ? { ...f, crop: null, plantedAt: null } : f
    );
    setFields(updated);
    setLogMessage("Champ recolté");
  };

  const cropReady = field.crop && now - field.plantedAt >= (plante?.tempsDePousse || 1);

  const cropProgress = field.crop
    ? Math.min(1, (now - field.plantedAt) / plante.tempsDePousse)
    : 0;

  // Calculer le temps restant pour l'affichage
  const timeRemaining = field.crop && plante
    ? Math.max(0, plante.tempsDePousse - (now - field.plantedAt))
    : 0;

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const handleFieldClick = () => {
    if (!field.crop) {
      // Pas de culture, ouvrir le dialog de plantation
      setOpenDialog(true);
    } else if (!cropReady && engrais > 0) {
      // Culture en cours et engrais disponible, proposer l'engrais
      setOpenFertilizerDialog(true);
    }
  };

  return (
    <>
      <Box
        sx={{
          width: 180,
          height: 180,
          backgroundImage: `url(${champImg})`,
          backgroundSize: 'cover',
          border: '1px solid #ccc',
          position: 'relative',
          borderRadius: 1,
          overflow: 'hidden',
          cursor: (!field.crop || (!cropReady && engrais > 0)) ? 'pointer' : 'default',
          '&:hover': {
            boxShadow: (!field.crop || (!cropReady && engrais > 0)) ? '0 4px 8px rgba(0,0,0,0.2)' : 'none',
          }
        }}
        onClick={handleFieldClick}
      >
        {field.crop && plante ? (
          <>
            <Box
              component="img"
              src={plante.img}
              alt={plante.name}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) scale(${Math.max(0.1, cropProgress)})`,
                transformOrigin: 'center center',
                height: '100%',
                objectFit: 'contain',
                transition: 'transform 1s linear',
                pointerEvents: 'none',
            }}
            />
            
            {/* Bouton récolter quand prêt */}
            {cropReady && (
              <Button
                variant="contained"
                color="success"
                onClick={(e) => {
                  e.stopPropagation();
                  harvestCrop();
                }}
                sx={{ position: 'absolute', top: 2, left: 2, fontSize: '0.6rem' }}
              >
                Récolter
              </Button>
            )}
            
            {/* Indicateur d'engrais disponible */}
            {!cropReady && engrais > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  backgroundColor: 'rgba(76, 175, 80, 0.9)',
                  borderRadius: '50%',
                  p: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Grass sx={{ fontSize: 16, color: 'white' }} />
              </Box>
            )}
            
            {/* Temps restant */}
            {!cropReady && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 2,
                  left: 2,
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: '0.7rem'
                }}
              >
                {formatTime(timeRemaining)}
              </Box>
            )}
            
            {/* Barre de progression */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 4,
                backgroundColor: 'rgba(255,255,255,0.3)',
              }}
            >
              <Box
                sx={{
                  height: '100%',
                  backgroundColor: cropReady ? '#4caf50' : '#2196f3',
                  width: `${cropProgress * 100}%`,
                  transition: 'width 1s linear',
                }}
              />
            </Box>
          </>
        ) : (
          // Indicateur pour planter
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'rgba(0,0,0,0.3)',
            }}
          >
            <Add sx={{ fontSize: 40 }} />
          </Box>
        )}
      </Box>

      {/* Dialog pour choisir une plante */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Choisir une plante</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {PLANTES.map((p) => {
              const disabled = p.level > level;
              if(p.xMode && !xMode)
                return null;
              return (
                <Grid item xs={4} key={p.id}>
                  <Button
                    onClick={() => plantCrop(p.id)}
                    disabled={disabled}
                    variant="outlined"
                    fullWidth
                    sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}
                  >
                    <div><img src={p.img} alt={p.name} height={64}/></div>
                    <Typography variant="caption">{p.name}</Typography>
                    {disabled && (
                      <Typography variant="caption" color="error">Lvl {p.level}</Typography>
                    )}
                  </Button>
                </Grid>
              );
            })}
          </Grid>
        </DialogContent>
      </Dialog>

      {/* Dialog pour confirmer l'utilisation d'engrais */}
      <Dialog open={openFertilizerDialog} onClose={() => setOpenFertilizerDialog(false)}>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Grass color="success" />
            Utiliser un engrais ?
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box display={'flex'}>

          <Typography gutterBottom>
            Voulez-vous utiliser un engrais pour accélérer la croissance de votre <strong>{plante?.name}</strong> ?
          </Typography>
          <img src={plante?.img} alt={plante?.name} height={80} style={{height:80,border:'5px ridge #895c0f', borderRadius:'3px'}}/>
          </Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Cela réduira le temps de croissance d'environ 1 jour.
          </Typography>
          <Typography variant="body2">
            Engrais disponibles : <strong>{engrais}</strong>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFertilizerDialog(false)}>
            Annuler
          </Button>
          <Button 
            onClick={plantFertilize} 
            variant="contained" 
            color="success"
            startIcon={<Grass />}
          >
            Utiliser l'engrais
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Field;

// src/components/FieldFantome.js

export const FieldFantome = () => {
  const { fields, setFields, money, setMoney,setLogMessage } = useFarming();

  const prixNouveauChamp = 50 + fields.length * 50;

  const handleAchat = () => {
    if (money < prixNouveauChamp) {
      setLogMessage("Pas assez d'argent pour acheter un nouveau champ !");
      return;
    }

    const nouveauChamp = {
      id: Date.now(),
      size: { width: 1, height: 1 },
      isBoosted: false,
      plante: [],
    };
setLogMessage("Nouveau champ acheté")
    setFields([...fields, nouveauChamp]);
    setMoney(money - prixNouveauChamp);
  };

  return (
    <Card sx={{ width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.7 }}>
      <CardActionArea onClick={handleAchat}>
        <div style={{ textAlign: 'center', padding: 8 }}>
          <Add fontSize="large" />
          <Typography variant="caption">Acheter un champ<br />({prixNouveauChamp}💰)</Typography>
        </div>
      </CardActionArea>
    </Card>
  );
};
