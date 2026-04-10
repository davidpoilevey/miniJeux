import React from 'react';
import { Card, CardHeader, CardContent, List, ListItem, ListItemIcon, ListItemText
  , Typography ,Accordion, AccordionSummary, AccordionDetails, Box, Chip, Stack, Grid, 
  Avatar,
  Paper,
  Tooltip,
  IconButton,
  ListItemAvatar,
  Divider} from '@mui/material';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { getYearForTurn } from './utils/utils';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useCivContext } from './CivContext';
import { CityRessource, Garnison } from './CivCity';
import { PaperCiv, paperPropsCiv, TypoCiv } from './utils/civUI';

const logTypeDetails = {
  info: { icon: <InfoIcon />, color: 'primary.main' },
  warning: { icon: <WarningIcon />, color: 'warning.main' },
  success: { icon: <CheckCircleIcon />, color: 'success.main' },
  error: { icon: <ErrorIcon />, color: 'error.main' },
};


const CivSump = ({handleNavigate,setSelected}) => {
  // Simulez le hook si vous n'avez pas de contexte global pour le moment
  // const { eventLog, cities, playerNation } = useDummyData();
  const { eventLog, cities, playerNation, setSelectedCity} = useCivContext();

  if (!playerNation) {
    return <Typography>Chargement des données de la civilisation...</Typography>;
  }

  return (
    <Box sx={paperPropsCiv.sx}>
      <Grid container spacing={3}>
        {/* En-tête avec les infos du joueur */}
        <Grid item xs={12}>
          <Card sx={paperPropsCiv.sx}>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: playerNation.color, fontSize: '1.5rem' }} aria-label="flag">
                  {playerNation.flag}
                </Avatar>
              }
              title={<TypoCiv variant="h4">{playerNation.name}</TypoCiv>}
              subheader={<TypoCiv>{playerNation.description}</TypoCiv>}
            />
          </Card>
        </Grid>
        
        {/* Colonne du Journal des événements */}
        <Grid item xs={12} md={5} lg={4}>
          <EventLog events={eventLog} />
        </Grid>

        {/* Colonne du Résumé des cités */}
        <Grid item xs={12} md={7} lg={8}>
          <CitiesSummary cities={cities} playerNation={playerNation} 
          setSelected={setSelected} setSelectedCity={setSelectedCity}/>
          
          {/* Prévoyez ici la place pour d'autres composants */}
          <Box mt={3} p={2} sx={{border: '1px dashed lightgrey'}}>
             <UnitsSummary handleNavigate={handleNavigate} setSelected={setSelected}/>
                   </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

const EventLog = ({ events }) => {
  return (
      
    <Card sx={paperPropsCiv.sx}>
      <CardHeader title={<TypoCiv>"Journal des Événements"</TypoCiv>} />
      <CardContent>
        {events.length === 0 ? (
          <TypoCiv>Aucun événement récent.</TypoCiv>
        ) : (
          <List dense>
            {events.map((event) => {
              const details = logTypeDetails[event.type] || logTypeDetails.info;
              return (
                <ListItem key={event.id} disablePadding>
                  <ListItemIcon sx={{ color: details.color }}>
                    {details.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={<TypoCiv>{event.text}</TypoCiv>}
                    secondary={<TypoCiv>{getYearForTurn(event.timestamp)}</TypoCiv>}
                  />
                </ListItem>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>

  );
};

export default CivSump;

const CitiesSummary = ({ cities, playerNation , setSelected, setSelectedCity}) => {
  const myCities = cities.filter(city => city.owner.id === playerNation.id);

  if (myCities.length === 0) {
    return <TypoCiv>Vous n'avez aucune cité.</TypoCiv>;
  }

  return (
    <Box>
      <TypoCiv variant="h5" gutterBottom>Vos Cités</TypoCiv>
      {myCities.map((city) => (
        <Accordion key={city.id} sx={paperPropsCiv.sx}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} >
<Box sx={{display:'flex',width:'90%', justifyContent:'space-between'}}>
  <Box sx={{alignItems:'center',display:'flex'}}>
          <Tooltip title="Afficher sur la carte">
                    <IconButton
                      onClick={() => {
                        setSelected('city');
                        setSelectedCity(city);
                      }}
                    >
                      <TravelExploreIcon />
                    </IconButton>
                  </Tooltip>
 <Typography sx={{ flexShrink: 0, fontWeight: 'bold' }}>{city.name}</Typography>
  </Box>
       
            <TypoCiv sx={{ color: 'text.secondary', ml: 2 }}>
              Population: {(city.population * 1000).toLocaleString('fr-FR')}
            </TypoCiv>
</Box>
           
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TypoCiv variant="body2">
                        <strong>Production actuelle:</strong> {city.currentProduction || 'Aucune'}
                    </TypoCiv>
                </Grid>
                <Grid item xs={12}>
                    <TypoCiv variant="body2" component="div">
                       <strong>Bâtiments:</strong>
                        <Stack direction="row" spacing={1} sx={{mt: 1}}>
                            {city.buildings.map(b => <Chip key={b} label={b} />)}
                        </Stack>
                    </TypoCiv>
                </Grid>
                <Grid item xs={12} md={6}>
                    <CityRessource selectedCity={city} />
                </Grid>
                <Grid item xs={12} md={6}>
                    <Garnison city={city} />
                </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};



const UnitsSummary = ({  handleNavigate,setSelected }) => {
  const {tiles, cities, playerNation} = useCivContext();
  // 1. Récupérer les unités sur la carte
  const mapUnits = tiles
    .filter(t => t.unit && t.unit.owner.id === playerNation.id)
    .map(t => ({
      ...t.unit,
      source: 'map',
      tile: t
    }));

  // 2. Récupérer les unités en garnison
  const cityUnits = cities.flatMap(city =>
    (city.garnison || []).map(unit => ({
      ...unit,
      source: 'garnison',
      tile: { q: city.position.q, r: city.position.r },
      cityName: city.name
    }))
  );

  const allUnits = [...mapUnits, ...cityUnits];

  if (allUnits.length === 0) {
    return (
      <Card sx={{ mt: 2 }}>
        <CardHeader title="Unités militaires" />
        <CardContent>
          <Typography color="text.secondary">Aucune unité active</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={paperPropsCiv.sx}>
      <CardHeader title="Unités militaires" />
      <CardContent>
        <List dense disablePadding>
          {allUnits.map((unit, index) => (
            <React.Fragment key={index}>
              <ListItem
                secondaryAction={
                  <Tooltip title="Afficher sur la carte">
                    <IconButton
                      edge="end"
                      onClick={() => {
                        setSelected('map');
                        setTimeout(()=>{
                          handleNavigate(unit.tile.q, unit.tile.r);
                        },500);
                      }}
                    >
                      <TravelExploreIcon />
                    </IconButton>
                  </Tooltip>
                }
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: '#1976d2' }}>
                    {unit.icon}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1">{unit.name}</Typography>
                      <Box display="flex" gap={1} ml={2}>
                        <Tooltip title="Attaque"><span>⚔️ {unit.attack}</span></Tooltip>
                        <Tooltip title="Défense"><span>🛡️ {unit.defense}</span></Tooltip>
                        <Tooltip title="Mouvement"><span>🏃 {unit.movement}</span></Tooltip>
                        <Tooltip title="Portée"><span>🎯 {unit.range}</span></Tooltip>
                        <Tooltip title="PV"><span>❤️ {unit.hp}/{unit.hpMax}</span></Tooltip>
                      </Box>
                    </Box>
                  }
                  secondary={
                    unit.source === 'map'
                      ? `Sur la carte (q:${unit.tile.q}, r:${unit.tile.r})`
                      : `En garnison à ${unit.cityName}`
                  }
                />
              </ListItem>
              {index < allUnits.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};
