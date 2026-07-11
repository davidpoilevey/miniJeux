import React, { useEffect, useMemo, useState } from 'react';
import { useCivContext } from './CivContext';
import { BUILDING_TYPES } from './data/buildingTypes';
import imgFond from './images/mur.jpg';
import imgMarche from './images/marcheAmbulant.png';
import imgMarcheRoyal from './images/marcheRoyal.png';
import imgFondPanel from './images/fondPanel.png';
import {
  Box, Typography, Grid, Paper, Divider, Stack, Chip, MenuItem, Button, Menu,
  ListSubheader, Tooltip,
} from '@mui/material';
import { UNIT_TYPES } from './data/unitTypes';
import { ZoneInfluenceCanvas } from './utils/ZoneInfluenceCanvas';
import { usePreloadedImages } from './utils/hooks';
import { AllImageSources } from './utils/imagesImports';
import { AttachMoney, Checkroom, Forest, Gavel, Landscape, LocalGasStation, RadioSharp, Restaurant, Science, SentimentSatisfiedAlt, Whatshot } from '@mui/icons-material';
import AddToProductionPopover from './utils/AddToProductionPopover';
import MarcheDialog, { MarcheRoyalDialog } from './utils/MarchePanel';
import { getYearForTurn } from './utils/utils';


const CivCity = () => {
  const { selectedCity, cities, tiles, setCities, techsUnlocked } = useCivContext();
  const [openMarche, setOpenMarche] = useState(false);
  const [openMarcheRoyal, setOpenMarcheRoyal] = useState(false);
  const city = cities.find(c => c.id === selectedCity?.id);

  const images = usePreloadedImages(AllImageSources);
  const removeFromQueue = prod => {
    setCities(prev =>
      prev.map(c => {
        if (c.id === city.id) {
          const newQueue = [...c.productionQueue];
          const index = newQueue.indexOf(prod);
          if (index >= 0)
            newQueue.splice(index, 1);
          return { ...c, productionQueue: newQueue };
        }
        else return c
      }
      )
    );
  }

  if (!city) return <Typography>Ville introuvable</Typography>;

  return (
    <Box sx={{ p: 1, backgroundSize: 'cover', backgroundImage: `url(${imgFond})` }}>
      {/* En-tête de la ville */}
      <Paper elevation={3} sx={{ m: 1, p: 1, display: 'flex', borderRadius: 10, backgroundSize: 'contain', backgroundImage: `url(${imgFondPanel})` }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2 }}>

          <Typography variant="h4">{city.name} {city.owner.flag}</Typography>
          <Typography variant="subtitle2">{city.owner.name}. Population : {city.population * 1000}</Typography>
          <Typography variant="subtitle1">Fondée en {getYearForTurn(city.foundedTurn)}</Typography>
          <Typography variant="caption">{city.owner.description}</Typography>
        </Box>
        <Box sx={{ mt: 2 }}>
          <CityRessource selectedCity={city} />
        </Box>
        <Box sx={{ height: 87,m:1, width: 263, borderRadius: 1, backgroundImage: `url(${imgMarche})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat' }}
          onClick={(achtung) => {
            if (!openMarche)
              setOpenMarche(true);
          }}>
        </Box>
        <Box sx={{ height: 87, m:1,width: 119, borderRadius: 1, backgroundImage: `url(${imgMarcheRoyal})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat' }}
          onClick={(achtung) => {
            if (!openMarcheRoyal)
              setOpenMarcheRoyal(true);
          }}>
        </Box>

        <MarcheDialog
          open={openMarche}
          onClose={() => { setOpenMarche(false) }}
          city={city}
        />
        <MarcheRoyalDialog
          open={openMarcheRoyal}
          onClose={() => { setOpenMarcheRoyal(false) }}
          city={city}
        />
      </Paper>

      {/* Corps principal : zone d’influence à gauche, actions à droite */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-eve' }}>

          <Paper sx={{ display: 'flex', m: 1, justifyContent: 'end' }}>
            <AddToProductionPopover
              city={city}
              setCities={setCities}
              techsUnlocked={techsUnlocked}
            />
          </Paper>

          <ProductionEnCours removeFromQueue={removeFromQueue} selectedCity={city} />

        </Box>

        <ZoneInfluence
          city={city}
          tiles={tiles}
          images={images}
          setCities={setCities}
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>

          <BatimentsConstruits city={city} />


        </Box>
      </Box>
    </Box>

  );
};

export default CivCity;


export const Garnison = ({ city }) => {
  const { tiles, setTiles, setCities, deployUnit } = useCivContext();

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);

  const handleClick = (event, unit) => {
    setSelectedUnit(unit);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setSelectedUnit(null);
    setAnchorEl(null);
  };

  const handleDissolve = () => {
    setCities(prev =>
      prev.map(c =>
        c.id === city.id
          ? { ...c, garnison: c.garnison.filter(u => u !== selectedUnit) }
          : c
      )
    );
    handleClose();
  };

  const handleDeploy = () => {
    deployUnit(city, selectedUnit)


    handleClose();
  };

  return (
    <Box sx={{ p: 2, borderRadius: 10, backgroundSize: 'cover', backgroundImage: `url(${imgFondPanel})` }}>
      <Typography variant="h6">Garnison</Typography>
      {city.garnison && city.garnison.length > 0 ? (
        <Stack direction="row" spacing={1} mt={1}>
          {city.garnison.map((unit, idx) => (
            <Box key={unit.id || idx} sx={{ border: '1px solid darkblue', borderRadius: '5px', padding: 1 }}
              onClick={(e) => handleClick(e, unit)}>
              <Typography fontSize={48}>{UNIT_TYPES[unit.type].icon}</Typography>
              <Typography variant="body1">{UNIT_TYPES[unit.type].name}</Typography>
            </Box>
          ))}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary" mt={1}>
          Aucune unité dans la garnison.
        </Typography>
      )}

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={handleDeploy}>Sortir de la ville</MenuItem>
        <MenuItem onClick={handleDissolve}>Dissoudre</MenuItem>
      </Menu>
    </Box>
  );
};


const ProductionEnCours = ({ removeFromQueue, selectedCity }) => {
  const production_TYPES = Object.assign({}, BUILDING_TYPES, UNIT_TYPES);

  return <Box sx={{ flex: 1, p: 1, borderRadius: 10, backgroundSize: 'cover', backgroundImage: `url(${imgFondPanel})` }}>

    <Typography variant="h6" >Production en cours</Typography>

    {selectedCity.currentProduction ? (
      <Paper sx={{ p: 2, mt: 1 }}>
        <Typography variant="body1">
          En cours : {production_TYPES[selectedCity.currentProduction].icon} {production_TYPES[selectedCity.currentProduction].name}
        </Typography>
        <Typography variant="caption">
          Avancement : {selectedCity.productionProgress} / {production_TYPES[selectedCity.currentProduction].turns} tours
        </Typography>
      </Paper>
    ) : (
      <Typography variant="body2" color="text.secondary" mt={1}>
        Aucune production en cours.
      </Typography>
    )}

    <Typography variant="subtitle1" sx={{ mt: 2 }}>File de production</Typography>
    <Box sx={{ display: 'flex', flexWrap: 'wrap', maxWidth:200 }}>
      {selectedCity.productionQueue.map((bid, idx) => (
        <Chip key={idx} onDelete={() => { removeFromQueue(bid) }} label={production_TYPES[bid].icon + ' ' + production_TYPES[bid].name} variant="filled" />
      ))}
    </Box>

  </Box>
}
const BatimentsConstruits = ({ city }) => {
  return <Box sx={{ flex: 1, p: 2, borderRadius: 10, backgroundSize: 'cover', backgroundImage: `url(${imgFondPanel})` }}>
    {/* Section Bâtiments */}
    <Typography variant="h6">Bâtiments construits</Typography>
    {city.buildings.length > 0 ? (
      <Box sx={{ display: 'flex', flexDirection: "row", gap: 1, flexWrap: 'wrap' }}>
        {city.buildings.map((bid, ix) => {
          const building = BUILDING_TYPES[bid];
          return (<BatimentCard city={city} building={building} key={bid + '-' + ix} />

          );
        })}
      </Box>
    ) : (
      <Typography variant="body2" color="text.secondary" mt={1}>
        Aucun bâtiment pour l’instant.
      </Typography>
    )}
  </Box>
}

const BatimentCard = ({ city, building }) => {
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const { setCities, techsUnlocked } = useCivContext();
  const [lastCost, setLastCost] = useState({});

  // Liste des unités produites par ce bâtiment, filtrées par techno
  const availableUnits = useMemo(() => {
    return (building.producesUnits || []).map(uid => UNIT_TYPES[uid]).map(unit => {
      const reqTech = unit.requirements?.science;
      const ismissingTechno = (reqTech && !techsUnlocked.includes(reqTech));
      return { ...unit, missingTechno: ismissingTechno ? reqTech : null };
    });
  }, [building, techsUnlocked]);

  const handleProduction = (unitId) => {
    const unit = UNIT_TYPES[unitId];
    const cost = unit.cost || {};
    setLastCost(cost);
    setSelectedUnitId(unitId);
  };

  useEffect(() => {
    if (!selectedUnitId) return;

    setCities(prev =>
      prev.map(cite => {
        if (cite.id !== city.id) return cite;
        const updated = {
          ...cite,
          resources: { ...cite.resources },
          productionQueue: [...(cite.productionQueue || []), selectedUnitId],
        };

        // Déduction des ressources
        for (const [res, amount] of Object.entries(lastCost)) {
          updated.resources[res] = (updated.resources[res] || 0) - amount;
        }

        if (!updated.currentProduction) {
          updated.currentProduction = selectedUnitId;
          updated.productionProgress = 0;
        }

        return updated;
      })
    );

    setSelectedUnitId('');
    setLastCost({});
  }, [selectedUnitId]);

  const hasEnoughResources = (cost) => {
    return Object.entries(cost).every(([res, amount]) => (city.resources[res] || 0) >= amount);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Tooltip title={building.description} arrow>
        <Typography variant="subtitle1" sx={{ cursor: 'help', fontWeight: 'bold' }}>
          {building.icon} {building.name}
        </Typography>
      </Tooltip>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {availableUnits.map(unit => {
          const cost = unit.cost || {};
          const canProduce = hasEnoughResources(cost);

          return (
            <Button
              key={unit.type}
              variant="outlined"
              fullWidth
              onClick={() => handleProduction(unit.type)}
              disabled={!canProduce || unit.missingTechno}
              sx={{
                justifyContent: 'space-between',
                textTransform: 'none',
                opacity: canProduce ? 1 : 0.5,
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
                <Typography variant="body2">
                  {unit.icon} {unit.name}
                </Typography>
                <Typography variant="caption">
                  Att: {unit.attack} / Def: {unit.defense} / HP: {unit.hpMax}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ alignSelf: 'center' }}>
                {Object.entries(cost).map(([res, amt]) => `${amt} ${res}`).join(', ')}
              </Typography>
              {unit.missingTechno && <Typography variant="caption">
                Technologie manquante : {unit.missingTechno}
              </Typography>}
            </Button>
          );
        })}
      </Box>
    </Paper>
  );
};


export const resourceIcons = {
  gold: <AttachMoney fontSize="small" />,
  food: <Restaurant fontSize="small" />,
  iron: <Gavel fontSize="small" />,
  stone: <Landscape fontSize="small" />,
  wood: <Forest fontSize="small" />,
  charbon: <Whatshot fontSize="small" />,
  petrole: <LocalGasStation fontSize="small" />,
  laine: <Checkroom fontSize="small" />,
  uranium: <RadioSharp fontSize="small" />,
  happiness: <SentimentSatisfiedAlt fontSize="small" />,
  science: <Science fontSize="small" />
};

export const CityRessource = ({ selectedCity }) => {

  const resourceList = Object.keys(resourceIcons).filter(p => p != 'science');
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {resourceList.map((res) => (
        <Tooltip key={res} title={res}>
          <Box

            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              bgcolor: 'grey.100',
              px: 1,
              py: 0.5,
              borderRadius: 1,
              minWidth: 70,
              justifyContent: 'center'
            }}
          >
            {resourceIcons[res] || <span>❓</span>}
            <Typography variant="body2" fontWeight="bold">
              {selectedCity.resources?.[res] ?? 0}
            </Typography>
          </Box>
        </Tooltip>
      ))}
    </Box>
  );
};


const ZoneInfluence = ({ city, tiles, images, setCities }) => {

  return <Box sx={{
    flex: 2, borderRadius: 10
    , backgroundSize: 'contain', backgroundImage: `url(${imgFondPanel})`
  }}>
    {/* Section Cases autour */}
    <ZoneInfluenceCanvas
      city={city}
      tiles={tiles}
      images={images}
      onToggleAssign={(tile) => {
        setCities(prev =>
          prev.map(c => {
            if (c.id !== city.id) return c;
            const assigned = c.assignedTiles || [];
            const exists = assigned.find(t => t.q === tile.q && t.r === tile.r);
            const updated = exists
              ? assigned.filter(t => !(t.q === tile.q && t.r === tile.r))
              : assigned.length < c.population
                ? [...assigned, { q: tile.q, r: tile.r }]
                : assigned;
            return { ...c, assignedTiles: updated };
          })
        );
      }}
    />

    <Garnison city={city} />


  </Box>
}