
import { useCivContext } from '../CivContext';
import { BUILDING_TYPES, MERVEILLES_DU_MONDE } from '../data/buildingTypes';
import { UNIT_TYPES } from '../data/unitTypes';
import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, Button,
  Typography, Box, Grid, Paper, Chip, Tooltip,
  Collapse, IconButton, Divider, Slide
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { ButtonCiv, DialogCiv, PaperCiv, paperPropsCiv, TypoCiv } from './civUI';
import { isWonderBuilt } from './utils';
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const Section = ({ title, items, renderItem, open, toggleOpen, icon, color }) => (
  <Box mb={3}>
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      sx={{
        backgroundColor: color,
        px: 2,
        py: 1,
        borderRadius: 1,
        cursor: 'pointer',
        boxShadow: 2,
      }}
      onClick={toggleOpen}
    >
      <Typography variant="h6" sx={{ color: '#fff' }}>
        {icon} {title}
      </Typography>
      <IconButton size="small" sx={{ color: '#fff' }}>
        {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </IconButton>
    </Box>
    <Collapse in={open} timeout="auto" unmountOnExit>
      <Grid container spacing={2} mt={1}>
        {items.map(renderItem)}
      </Grid>
    </Collapse>
    <Divider sx={{ mt: 2 }} />
  </Box>
);

const AddToProductionDialog = ({ city, techsUnlocked, setCities }) => {
  const { builtWonders } = useCivContext();
  const [openDialog, setOpenDialog] = useState(false);

  const [openUnits, setOpenUnits] = useState(true);
  const [openBuildings, setOpenBuildings] = useState(true);
  const [openWonders, setOpenWonders] = useState(true);

  const allChoices = getProductionOptionsForCity(city, techsUnlocked, builtWonders);
  const buildings = allChoices.filter(i => i.type === 'building');
  const units = allChoices.filter(i => i.type === 'unit');
  const wonders = allChoices.filter(i => i.type === 'merveille');

  const handleOpen = () => setOpenDialog(true);
  const handleClose = () => setOpenDialog(false);

  const handleSelect = (id, cost) => {
    setCities(prev =>
      prev.map(c => {
        if (c.id !== city.id) return c;
        const updated = { ...c, productionQueue: [...(c.productionQueue || []), id], resources: { ...c.resources } };
        if (!updated.currentProduction) {
          updated.currentProduction = id;
          updated.productionProgress = 0;
        }
        for (const [res, amount] of Object.entries(cost || {})) {
          updated.resources[res] = (updated.resources[res] || 0) - amount;
        }
        return updated;
      })
    );
    handleClose();
  };

  const renderItem = (item) => {
    const cost = item.cost || {};
    const available = item.isAvailable;
    const missingSet = new Set(item.missingResources || []);
    // les blocages non-ressources (technologie, bâtiment...) s'affichent en toutes lettres
    const otherBlockers = (item.missing || []).filter(m => !m.startsWith('Ressource'));
    const tooltip = item.missing?.length
      ? (
        <Box>
          {item.missing.map((line, i) => (
            <Typography key={i} variant="body2">
              ❌ {line}
            </Typography>
          ))}
        </Box>
      )
      : '';

    return (
      <Grid item xs={12} sm={6} md={4} key={item.id}>
        <Tooltip title={tooltip} arrow>
          <PaperCiv
            elevation={available ? 6 : 1}
            sx={{ m:1, p:1,
              // pas de voile d'opacité : on doit pouvoir LIRE ce qui manque
              cursor: available ? 'pointer' : 'not-allowed',
              border: available ? '2px solid #4caf50' : '1px dashed gray',
              backgroundColor: available ? 'transparent' : '#3a3a3a',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: available ? 'scale(1.03)' : 'none',
              },
            }}
            onClick={() => available && handleSelect(item.id, cost)}
          >
            <TypoCiv variant="subtitle1" sx={available ? {} : { color: 'grey.400' }}>
              {item.icon} {item.name}
            </TypoCiv>
            {item.type === 'unit' && (
              <TypoCiv variant="caption" color="text.secondary">
                ⚔️ {item.attack} / 🛡️ {item.defense} / 🏃‍♂️‍➡️ {item.movement}
              </TypoCiv>
            )}
            <Box mt={1} display="flex" flexWrap="wrap" gap={0.5}>
              {Object.entries(cost).map(([res, amt]) => (
                <Chip
                  key={res}
                  label={`${res}: ${amt}`}
                  size="small"
                  sx={missingSet.has(res)
                    ? { bgcolor: '#c62828', color: 'white', fontWeight: 'bold',
                        boxShadow: '0 0 6px rgba(255, 80, 80, 0.9)' }
                    : {}}
                />
              ))}
            </Box>
            {otherBlockers.map((line, i) => (
              <Typography key={i} variant="caption" sx={{ display: 'block', color: '#ef9a9a', mt: 0.5 }}>
                🔒 {line}
              </Typography>
            ))}
          </PaperCiv>
        </Tooltip>
      </Grid>
    );
  };

  return (
    <Box>
      <ButtonCiv variant="contained" color="primary" onClick={handleOpen}>
        Ajouter à la production
      </ButtonCiv>

      <DialogCiv
        open={openDialog}
        onClose={handleClose}
        TransitionComponent={Transition}
        icon="🎯"
        title={<TypoCiv variant="h5" fontWeight="bold">Choisir une production pour {city.name}</TypoCiv>
         }
      >
      
          <Section
            title="Unités"
            icon="🛡️"
            color="#d97612"
            items={units}
            open={openUnits}
            toggleOpen={() => setOpenUnits(!openUnits)}
            renderItem={renderItem}
          />
          <Section
            title="Bâtiments"
            icon="🏗️"
            color="#388e3c"
            items={buildings}
            open={openBuildings}
            toggleOpen={() => setOpenBuildings(!openBuildings)}
            renderItem={renderItem}
          />
          <Section
            title="Merveilles"
            icon="🏛️"
            color="#057cf0"
            items={wonders}
            open={openWonders}
            toggleOpen={() => setOpenWonders(!openWonders)}
            renderItem={renderItem}
          />
      </DialogCiv>
    </Box>
  );
};

export default AddToProductionDialog;


export function getProductionOptionsForCity(city, techsUnlocked, builtWonders = []) {
  

  const hasTech = id => techsUnlocked.includes(id);
  const hasBuilding = id => city.buildings.includes(id);

  const canAfford = (cost = {}) =>
    Object.entries(cost).every(([res, amount]) => (city.resources[res] || 0) >= amount);

  const analyzeItem = (item, type) => {
    const reqs = item.requirements || {};
    const cost = item.cost || {};
    const missing = [];

    if (type === 'merveille' && isWonderBuilt(builtWonders, item.id)) {
      missing.push("Déjà construite par une autre civilisation");
    }

    if (reqs.science && !hasTech(reqs.science)) {
      missing.push(`Technologie requise : ${reqs.science}`);
    }

    if (reqs.building && !hasBuilding(reqs.building)) {
      missing.push(`Bâtiment requis : ${reqs.building}`);
    }

    const missingResources = [];
    for (const [res, amt] of Object.entries(cost)) {
      if ((city.resources[res] || 0) < amt) {
        missing.push(`Ressource insuffisante : ${res} (${amt})`);
        missingResources.push(res);
      }
    }

    return {
      ...item,
      id: item.id || item.type,
      type,
      isAffordable: canAfford(cost),
      isAvailable: missing.length === 0,
      missing,
      missingResources,
    };
  };

  const allItems = [
    ...Object.values(BUILDING_TYPES).map(b => analyzeItem(b, 'building')),
    ...Object.values(UNIT_TYPES).map(u => analyzeItem(u, 'unit')),
    ...Object.values(MERVEILLES_DU_MONDE).map(w => analyzeItem(w, 'merveille')),
  ];

  return allItems;
}
