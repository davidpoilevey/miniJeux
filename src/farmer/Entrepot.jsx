import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Slider,
  TextField,
  Tooltip
} from '@mui/material';
import { DeleteForever, DeleteOutline, FileUpload, MoreVert, Update } from '@mui/icons-material';
import { PLANTES, PRODUCTIONS } from './farmData';
import { useFarming } from './FarmingProvider';

const EntrepotPanel = () => {
  const { resources, money, diamond, level, warehouseSize, jetteResource
    , setDiamond, setEntrepotSize, openConfig , engrais} = useFarming();

  // État pour la dialog de suppression
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    item: null,
    quantity: 1
  });

  // Regroupe plantes et produits pour les lookup d'infos
  const allItems = [...PLANTES, ...PRODUCTIONS];
  const itemById = Object.fromEntries(allItems.map(item => [item.id, item]));

  // Liste des ressources réellement possédées (avec quantité > 0)
  const stockedItems = Object.entries(resources)
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => ({
      id,
      qty,
      ...itemById[id], // Ajoute nom, img, etc.
    }))
    .filter(item => item.name); // Ignore les ids inconnus

  const levelStars = Array.from({ length: level }, () => '⭐');

  const handleDeleteClick = (item) => {
    setDeleteDialog({
      open: true,
      item: item,
      quantity: 1
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.item && deleteDialog.quantity > 0) {
      jetteResource(deleteDialog.item.id, deleteDialog.quantity);
    }
    handleDeleteCancel();
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({
      open: false,
      item: null,
      quantity: 1
    });
  };

  const handleQuantityChange = (event, newValue) => {
    setDeleteDialog(prev => ({
      ...prev,
      quantity: newValue
    }));
  };
  const totalStored = Object.values(resources).reduce((acc, val) => acc + val, 0);
  const handleQuantityInputChange = (event) => {
    const value = parseInt(event.target.value) || 1;
    const maxValue = deleteDialog.item ? deleteDialog.item.qty : 1;
    setDeleteDialog(prev => ({
      ...prev,
      quantity: Math.min(Math.max(1, value), maxValue)
    }));
  };
  const buyEntrepot = () => {
    if (diamond >= level) {
      setEntrepotSize(prev => (prev + (4 + level * 2)));
      setDiamond(d => (d - level));
    }
  }
  return (
    <Paper elevation={3} sx={{ flex: 1, p: 2, overflow: 'auto', height: '50%', backgroundColor: '#fdeb97' }}>
      <Box sx={{display:"flex", justifyContent:'space-between'}}>

        <Typography variant="h6">
          🧺 Entrepôt 
        </Typography>
        <Box>
          
        <Tooltip title={`Augmenter la taille de l'entrepot ${level} diamants`}>
          <IconButton
            size="small"
            onClick={() => buyEntrepot()}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              '&:hover': {
                backgroundColor: 'rgba(66, 83, 232, 0.1)',
                color: 'blue'
              },
              zIndex: 1
            }}
          >
            <FileUpload fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={`Configuration`}>
          <IconButton
            size="small"
            onClick={()=>{openConfig(true)}}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              '&:hover': {
                backgroundColor: 'rgba(66, 83, 232, 0.1)',
                color: 'blue'
              },
              zIndex: 1
            }}
          >
            <MoreVert fontSize="small" />
          </IconButton>
        </Tooltip>
        </Box>
      </Box>
       <Typography variant="body1">
          (capacité {totalStored}/{warehouseSize})
        </Typography>
      <Typography variant="h6" gutterBottom>
        {levelStars.join('')}
      </Typography>
      <Box mb={2}>
        <Typography variant="body1">💰 Argent : {money}</Typography>
        <Typography variant="body1">💎 Diamants : {diamond}</Typography>
        <Typography variant="body1">♻️ Engrais : {engrais}</Typography>
      </Box>

      <Grid container spacing={1}>
        {stockedItems.map(item => (
          <Grid item key={item.id} xs={6} sm={4} md={3}>
            <Paper sx={{ p: 1, textAlign: 'center', position: 'relative' }}>
              {/* Icône poubelle */}
              <IconButton
                size="small"
                onClick={() => handleDeleteClick(item)}
                sx={{
                  position: 'absolute',
                  top: -15,
                  right: -12,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 0, 0, 0.1)',
                    color: 'red'
                  },
                  zIndex: 1
                }}
              >
                <DeleteForever color="primary" fontSize="small" />
              </IconButton>

              <Box
                component="img"
                src={item.img}
                alt={item.name}
                sx={{ width: 48, height: 48, objectFit: 'contain', mb: 1 }}
              />
              <Box display="flex">
                <Typography variant="body2">{item.name}</Typography>
                <Typography variant="caption">({item.qty})</Typography>

              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Dialog de confirmation de suppression */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          🗑️ Jeter des ressources
        </DialogTitle>
        <DialogContent>
          {deleteDialog.item && (
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box
                component="img"
                src={deleteDialog.item.img}
                alt={deleteDialog.item.name}
                sx={{ width: 64, height: 64, objectFit: 'contain', mb: 1 }}
              />
              <Typography variant="h6">{deleteDialog.item.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                Stock disponible : {deleteDialog.item.qty}
              </Typography>
            </Box>
          )}

          <Typography gutterBottom>
            Quantité à jeter :
          </Typography>

          <Box sx={{ px: 2, mb: 2 }}>
            <Slider
              value={deleteDialog.quantity}
              onChange={handleQuantityChange}
              min={1}
              max={deleteDialog.item ? deleteDialog.item.qty : 1}
              marks
              valueLabelDisplay="auto"
              sx={{ mb: 2 }}
            />
          </Box>

          <TextField
            label="Quantité"
            type="number"
            value={deleteDialog.quantity}
            onChange={handleQuantityInputChange}
            inputProps={{
              min: 1,
              max: deleteDialog.item ? deleteDialog.item.qty : 1
            }}
            fullWidth
            size="small"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>
            Annuler
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Jeter {deleteDialog.quantity} {deleteDialog.item?.name}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default EntrepotPanel;