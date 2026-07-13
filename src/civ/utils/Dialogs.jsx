import React, { useEffect, useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography,
    List, ListItem, ListItemText,
    TextField,
    Collapse,
    Box,
    Grid,
    Card,
    CardContent,
    IconButton,
    Tooltip,
    Slider,
    ToggleButton,
    ToggleButtonGroup
} from '@mui/material';

import {  useCivContext, MAP_SIZES } from '../CivContext';
import { BUILDING_TYPES, MERVEILLES_DU_MONDE } from '../data/buildingTypes';
import { UNIT_TYPES } from '../data/unitTypes';
import { CIVILIZATIONS } from '../data/civilzationTypes';
import { generateCityName } from './utils';
import { ButtonCiv, DialogCiv, TextFieldCiv, TypoCiv } from './civUI';
import { QuestionAnswer } from '@mui/icons-material';

const randomPick = (array) => array[Math.floor(Math.random() * array.length)];

    const willAccept = (profileValue, difficulty = 0.5) => {
        return Math.random() > (profileValue || 0.5) * difficulty;
    };

export const CivilDialog = ({ unitPos, city, onClose }) => {

    // unit.type = diplomate, caravane, moine ou pionnier
    const unitType = unitPos.unit?.type || 'none';
    if (unitType === 'diplomate')
        return <DiplomacyDialog unit={unitPos.unit} city={city} onClose={onClose} />;
    else return <CivilianDialog unitPos={unitPos} city={city} onClose={onClose} />;
     
}

const CivilianDialog = ({ unitPos, city, onClose }) => {
    const { setCities, setTiles,addEvent,setSelectedUnitPos } = useCivContext();
    const movingUnit = unitPos.unit;
    // déclaré ici et pas dans un case du switch : sinon le case 'moine' plantait
    // en accédant à une const déclarée dans le case 'caravane' (zone morte temporelle)
    const profile = city.owner?.diplomacyProfile || {};
    const actions = [{
                name: "Garnison", text: "se stocker dans la garnison", icon: "🏰"
                , onClick: () => {
                    setCities(prev =>
                        prev.map(c => c.id === city.id ? {
                            ...c, garnison: [...(c.garnison || []), { ...movingUnit, id: `${movingUnit.type}-${Date.now()}` }],
                        } : c
                        )
                    );
                    delFromCarte();
                }
            }];
    const delFromCarte = ()=>{
          // Supprimer de la carte
                    setTiles(prev =>
                        prev.map(t =>
                            t.q === unitPos.q && t.r === unitPos.r
                                ? { ...t, unit: null } : t
                        )
                    );
                      setSelectedUnitPos(null);
                      onClose();
    }
    
    switch (movingUnit.type) {
        case 'pionnier':
            actions.push({
                name: "S'intégrer", text: "se rajoute a la population", icon: "🏡"
                , onClick: () => {
                    setCities(prev =>
                        prev.map(c =>
                            c.id === city.id ? { ...c, population: Math.min(10, c.population + 1) } : c)
                    );
                    delFromCarte();

            addEvent(`la population a augmenté de 1000 personnes!`, 'success');
                }
            });

            break;
        case 'caravane':
        const deal = 50+Math.round((Math.random()+(profile.genereux||0))*50)//base de 50 + bonus genereux + random 0-50
             actions.push({
                name: "Commercer", text: `Enrichir la ville de ${deal} boules`, icon: "💰"
                , onClick: () => {
                     setCities(prev =>
                        prev.map(c =>
                            c.id === city.id ? { ...c, resources:Object.assign(c.resources,{gold:c.resources.gold+deal}) } : c)
                    );
                     delFromCarte();

            addEvent(`La caravane a apporté ${deal} Or`, 'success');
                }
             });
              // les merveilles vivent dans MERVEILLES_DU_MONDE, pas dans BUILDING_TYPES
              const currentProd = MERVEILLES_DU_MONDE[city.currentProduction];
              const buildUneMarvel = currentProd!=null;
              actions.push({
                name: "Aider", text: "Aider a la construction d'une merveille du monde", icon: "🏛️"
                , disabled:!buildUneMarvel
                , onClick: () => {
                   
                      setCities(prev =>
                        prev.map(c =>
                            c.id === city.id ? { ...c, productionProgress:c.productionProgress+50 } : c)
                    );
                    delFromCarte();
                   

            addEvent(`La construction de ${currentProd.name} a bien avancé`, 'success');
                }})
        break;
        case 'moine':

             const gain = Math.round((Math.random()+(profile.aggressif||0))*50)//bonus aggressif + random 0-50
       
             actions.push({
                name: "Evangeliser", text: "Apporte joie et bonheur et un peu de pognon aussi", icon: "🕊️"
                , onClick: () => {
                     setCities(prev =>
                        prev.map(c =>
                            c.id === city.id ? { ...c, resources:Object.assign(c.resources,{happiness:c.resources.happiness+gain,gold:c.resources.gold+gain}) } : c)
                    );
                     delFromCarte();
            addEvent(`Le moine a apporté ${gain} Or et Bonheur`, 'success');
                }
             });
        break;
        default:

    }
    return <DialogCiv title={`Actions de ${UNIT_TYPES[movingUnit.type].name}`} 
    open onClose={onClose}>
            <List>
                {actions.map(action => {
                    return <ListItem key={action.name}>
                        <ListItemText primary={<ButtonCiv variant="contained" 
                        color={action.disabled?"disabled":"info"}
                            onClick={action.disabled?null:action.onClick}
                        >{action.icon} {action.name}
                        </ButtonCiv>} secondary={action.text} />


                    </ListItem>
                })}

            </List>

    </DialogCiv>
}

export const DiplomacyDialog = ({ unit, city, onClose }) => {
    const { setCities, cities, setTiles, selectedUnitPos, setSelectedUnitPos
        , getDiplomaticRelation, playerNation, setDiplomaticRelation, shiftDiplomaticRelation
        , diplomaticInteraction, setDiplomaticInteraction, addEvent } = useCivContext();
    const [showParlementer, setShowParlementer] = useState(false);
    const diplomaticRelation = getDiplomaticRelation(playerNation, city.owner)
    const handleEspionnage = () => {
        if (!diplomaticInteraction) return;

        const { city, unit } = diplomaticInteraction;
        const fullCity = cities.find(c => c.id === city.id);
        if (!fullCity) return;

        const buildingList = fullCity.buildings.map(b => BUILDING_TYPES[b]?.name || b).join(', ') || 'Aucun bâtiment';
        const garnisonList = fullCity.garnison?.map(u => UNIT_TYPES[u.type]?.name || u.type).join(', ') || 'Aucune unité';
        const resourceList = Object.entries(fullCity.resources || {})
            .map(([res, val]) => `${res}: ${val}`)
            .join(', ') || 'Aucune ressource';

        const spyReport = `📡 Rapport d’espionnage sur ${fullCity.name} :
- 🏛️ Bâtiments : ${buildingList}
- 🪖 Garnison : ${garnisonList}
- 📦 Ressources : ${resourceList}`;

        // Affiche dans les événements (tu peux faire un Dialog séparé aussi si tu veux + tard)
        addEvent(spyReport, 'info', true);

        // Supprime le diplomate
        setTiles(prev =>
            prev.map(t =>
                t.q === selectedUnitPos.q && t.r === selectedUnitPos.r
                    ? { ...t, unit: null }
                    : t
            )
        );
        setSelectedUnitPos(null);
        setDiplomaticInteraction(null);
    };

    const handleSabotage = () => {
        if (!diplomaticInteraction) return;

        const { city, unit } = diplomaticInteraction;
        const targetCity = cities.find(c => c.id === city.id);
        if (!targetCity) return;

        const hasBuildings = targetCity.buildings.length > 0;
        const hasGarnison = targetCity.garnison && targetCity.garnison.length > 0;

        let sabotageMessage = '';
        let updatedCity = { ...targetCity };

        if (hasBuildings && (!hasGarnison || Math.random() < 0.7)) {
            // Sabote un bâtiment
            const destroyed = randomPick(updatedCity.buildings);
            updatedCity.buildings = updatedCity.buildings.filter(b => b !== destroyed);
            sabotageMessage = `🧨 Sabotage réussi ! Le bâtiment ${BUILDING_TYPES[destroyed].name} a été détruit à ${updatedCity.name}.`;
        } else if (hasGarnison) {
            // Sabote une unité
            const victim = updatedCity.garnison[0];
            updatedCity.garnison = updatedCity.garnison.slice(1);
            sabotageMessage = `💥 Sabotage réussi ! Une unité ${UNIT_TYPES[victim.type].name} a été éliminée à ${updatedCity.name}.`;
        } else {
            sabotageMessage = `💤 Sabotage tenté, mais rien à saboter à ${updatedCity.name}.`;
        }

        // Met à jour les villes
        setCities(prev => prev.map(c => (c.id === updatedCity.id ? updatedCity : c)));

        // Supprime le diplomate de la carte
        setTiles(prev =>
            prev.map(t => {
                if (t.q === selectedUnitPos.q && t.r === selectedUnitPos.r) {
                    return { ...t, unit: null };
                }
                return t;
            })
        );
        setSelectedUnitPos(null);

        addEvent(sabotageMessage, 'warning', true);
        setDiplomaticInteraction(null);
    };



    const handleRequestPeace = () => {
        const targetCiv = city.owner;
        const profile = targetCiv?.diplomacyProfile || {};
        const accepted = willAccept(profile.aggressif, 0.6); // agressifs -> refusent

        if (accepted) {
            setDiplomaticRelation(playerNation, targetCiv, 'peace');
            addEvent(`${targetCiv.name} a accepté votre demande de paix.`, 'success', true);
        } else {

            shiftDiplomaticRelation(playerNation, targetCiv, false);
            addEvent(`${targetCiv.name} a refusé votre demande de paix.`, 'error', true);
        }
        setDiplomaticInteraction(null);
    };
    const handleThreatenTribute = () => {
        const targetCiv = city.owner;
        const profile = targetCiv?.diplomacyProfile || {};
        const accepted = willAccept(profile.aggressif, 0.7); // très agressifs refusent + souvent

        if (accepted) {
            // 💰 gain : or ou tech ?
            setCities(prev =>
                prev.map(c =>
                    c.owner.id === playerNation.id
                        ? {
                            ...c,
                            resources: {
                                ...c.resources,
                                gold: (c.resources.gold || 0) + 100,
                            },
                        }
                        : c
                )
            );
            shiftDiplomaticRelation(playerNation, targetCiv, true);
            addEvent(`${targetCiv.name} vous a payé un tribut pour éviter la guerre.`, 'info', true);
        } else {
            setDiplomaticRelation(playerNation, targetCiv, 'war');
            addEvent(`${targetCiv.name} a refusé votre ultimatum ! Guerre déclarée !`, 'error', true);
        }

        setDiplomaticInteraction(null);
    };
    const handleOfferPeace = () => {
        const targetCiv = city.owner;
        const profile = targetCiv?.diplomacyProfile || {};
        const accepted = willAccept(profile.genereux, 0.3);

        if (accepted) {
            setDiplomaticRelation(playerNation, targetCiv, 'peace');
            // 💸 paye un petit coût ?
            setCities(prev =>
                prev.map(c =>
                    c.owner.id === playerNation.id
                        ? {
                            ...c,
                            resources: {
                                ...c.resources,
                                gold: (c.resources.gold || 0) - 50,
                            },
                        }
                        : c
                )
            );
            addEvent(`${targetCiv.name} a accepté votre paix contre offrande.`, 'success', true);
        } else {
            shiftDiplomaticRelation(playerNation, targetCiv, false);
            addEvent(`${targetCiv.name} a refusé même votre offre pacifique...`, 'warning', true);
        }

        setDiplomaticInteraction(null);
    };
    const handleTrade = () => {
        const targetCiv = city.owner;
        const profile = targetCiv.diplomacyProfile || {};
        const accepted = willAccept(profile.opportuniste, 0.4);

        if (accepted) {
            // échange 10 de wool contre 50 de gold ?
            setCities(prev =>
                prev.map(c => {
                    if (c.owner.id === playerNation.id) {
                        return {
                            ...c,
                            resources: {
                                ...c.resources,
                                gold: (c.resources.gold || 0) + 50,
                                laine: (c.resources.laine || 0) - 10,
                            },
                        };
                    } else if (c.owner.id === targetCiv.id) {
                        return {
                            ...c,
                            resources: {
                                ...c.resources,
                                gold: (c.resources.gold || 0) - 50,
                                laine: (c.resources.laine || 0) + 10,
                            },
                        };
                    }
                    return c;
                })
            );
            shiftDiplomaticRelation(playerNation, targetCiv, true);
            addEvent(`Un accord commercial a été conclu avec ${targetCiv.name}.`, 'success', true);
        } else {
            shiftDiplomaticRelation(playerNation, targetCiv, false);
            addEvent(`${targetCiv.name} a décliné votre tentative de commerce.`, 'warning', true);
        }

        setDiplomaticInteraction(null);
    };
    const handleAlliance = () => {
        const targetCiv = city.owner;
        const profile = targetCiv?.diplomacyProfile || {};
        const accepted = willAccept(profile.protectionniste, 0.4);

        if (accepted) {
            setDiplomaticRelation(playerNation, targetCiv, 'allied');
            addEvent(`${targetCiv.name} a accepté une alliance militaire.`, 'success', true);
        } else {
            shiftDiplomaticRelation(playerNation, targetCiv, false);
            addEvent(`${targetCiv.name} ne veut pas s’allier avec vous.`, 'error', true);
        }

        setDiplomaticInteraction(null);
    };



    return (
        <DialogCiv title="Actions diplomatiques" open onClose={onClose}>
                <TypoCiv gutterBottom>Votre diplomate est arrivé à {city?.name ?? 'Incoonnu'}.</TypoCiv>
                <List>
                    <ListItem onClick={handleEspionnage}>
                        <ListItemText primary={<ButtonCiv
                            variant="contained"
                            color="info"
                            onClick={handleEspionnage}
                        >
                            🕵️ Espionner
                        </ButtonCiv>} secondary="Voir les infos internes de la ville." />


                    </ListItem>
                    <ListItem onClick={handleSabotage}>
                        <ListItemText primary={<ButtonCiv
                            variant="contained"
                            color="error"
                            onClick={() => handleSabotage()}
                        >
                            💣 Saboter
                        </ButtonCiv>} secondary="Un batiment ou une unité est saboté." />

                    </ListItem>
                    <ListItem >
                        <ListItemText primary={<ButtonCiv
                            variant="contained"
                            color="secondary"
                            onClick={() => setShowParlementer(prev => !prev)}
                        >
                            💬 Parlementer
                        </ButtonCiv>} secondary="Tenter une négociation diplomatique." />
                    </ListItem>
                </List>

                <Collapse in={showParlementer}>
                    <Box sx={{ mt: 2, p: 2, border: '1px dashed gray' }}>
                        <TypoCiv variant="subtitle1">
                            Relations actuelles : {diplomaticRelation}
                        </TypoCiv>

                        {/* Relations possibles */}
                        {getDiplomaticRelation(playerNation, city.owner) === 'war' && (
                            <>
                                <ButtonCiv onClick={handleRequestPeace}>🤝 Demander la paix</ButtonCiv>
                                <ButtonCiv onClick={handleThreatenTribute}>💣 Menacer (contre rançon)</ButtonCiv>
                            </>
                        )}
                        {getDiplomaticRelation(playerNation, city.owner) === 'neutral' && (
                            <>
                                <ButtonCiv onClick={handleOfferPeace}>🕊️ Proposer la paix</ButtonCiv>
                                <ButtonCiv onClick={handleTrade}>💰 Proposer un échange</ButtonCiv>
                            </>
                        )}
                        {getDiplomaticRelation(playerNation, city.owner) === 'peace' && (
                            <>
                                <ButtonCiv onClick={handleAlliance}>🤝 Former une alliance</ButtonCiv>
                                <ButtonCiv onClick={handleTrade}>💼 Commerce</ButtonCiv>
                            </>
                        )}
                    </Box>
                </Collapse>
        </DialogCiv>
    );
};


export const CityNameDialog = ({ showCityNameDialog, setShowCityNameDialog, newCityTile }) => {
    const { foundCity, playerNation,setCities } = useCivContext();

    const [cityNameInput, setCityNameInput] = React.useState('Haguenau');
    useEffect(()=>{
        if(newCityTile!=null && showCityNameDialog)
            setCityNameInput(generateCityName(playerNation, newCityTile?.type));
    },[newCityTile, showCityNameDialog])
    return <DialogCiv title="Nom de la ville" open={showCityNameDialog}
     onClose={() => setShowCityNameDialog(false)}
     actions={<> <ButtonCiv onClick={() => setShowCityNameDialog(false)}>Annuler</ButtonCiv>
            <ButtonCiv
                onClick={() => {
                    if (cityNameInput.trim()) {
                       const newCity = foundCity(newCityTile, cityNameInput.trim(), playerNation);
                       if(newCity)
                        setCities(prev=>[...prev, newCity]);
                    }
                    setShowCityNameDialog(false);
                }}
            >
                Valider
            </ButtonCiv></>}>
       
            <TextFieldCiv
                autoFocus
                label="Nom"
                value={cityNameInput}
                onChange={(e) => setCityNameInput(e.target.value)}
            />
       
           
    </DialogCiv>
}


export const AudienceDialog = ({ audience, onResolve }) => {
  if (!audience) return null;
  const { fromNation, demand } = audience;

  return (
    <Dialog open fullWidth maxWidth="xs">
      <DialogTitle sx={{ textAlign: 'center' }}>🎭 Audience diplomatique</DialogTitle>
      <DialogContent>
        <Typography align="center" fontSize={56}>{fromNation.flag}</Typography>
        <Typography align="center" variant="h6" gutterBottom>
          Un émissaire des {fromNation.name} se présente à votre cour.
        </Typography>
        <Typography align="center" sx={{ fontStyle: 'italic', mt: 1 }}>
          « Les {fromNation.name} {demand.text}. »
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 2, gap: 2 }}>
        <Button variant="contained" color="success" onClick={() => onResolve(true)}>
          Accepter
        </Button>
        <Button variant="contained" color="error" onClick={() => onResolve(false)}>
          Refuser
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const GameOverDialog = ({ result, onRestart }) => {
  if (!result) return null;
  const victory = result.type === 'victory';

  return (
    <Dialog open fullWidth maxWidth="sm">
      <DialogTitle sx={{ textAlign: 'center', fontSize: '2.2rem' }}>
        {victory ? '🏆 VICTOIRE !' : '💀 DÉFAITE...'}
      </DialogTitle>
      <DialogContent>
        <Typography align="center" variant="h6" gutterBottom>
          {victory
            ? `Votre civilisation règne sans partage sur le monde (tour ${result.turn}).`
            : `Votre civilisation a été rayée de l'histoire au tour ${result.turn}.`}
        </Typography>
        <Typography align="center" variant="h5" gutterBottom>
          Score : {result.score} points
        </Typography>
        <Typography variant="subtitle1" sx={{ mt: 2 }}>Classement final</Typography>
        <List dense>
          {result.classement.map((entry, i) => (
            <ListItem key={entry.civ.id}>
              <ListItemText
                primary={`${i + 1}. ${entry.civ.flag} ${entry.civ.name} — ${entry.score} pts`}
                secondary={`${entry.cities} ville(s) · ${(entry.population * 1000).toLocaleString('fr-FR')} habitants · ${entry.techCount} technologie(s) · ${entry.wonders} merveille(s)`}
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
        <Button variant="contained" size="large" onClick={onRestart}>
          Retour au menu principal
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const NationDialog = ({ open, handleNationSelect, onClose }) => {
  const [expanded, setExpanded] = useState(null);
  const [opponents, setOpponents] = useState(CIVILIZATIONS.length - 1);
  const [mapSize, setMapSize] = useState('moyenne');

  const toggleExpand = (id) => {
    setExpanded(prev => (prev === id ? null : id));
  };

  return (
    <DialogCiv open={open} maxWidth="md" title="Choisissez votre civilisation"
    icon={<QuestionAnswer/>} onClose={onClose}>
        {/* Réglages de la partie */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center',
          alignItems: 'center', mb: 3, p: 2, border: '1px dashed grey', borderRadius: 2 }}>
          <Box sx={{ minWidth: 220 }}>
            <TypoCiv gutterBottom>⚔️ Adversaires : {opponents}</TypoCiv>
            <Slider
              value={opponents}
              onChange={(e, v) => setOpponents(v)}
              min={1}
              max={CIVILIZATIONS.length - 1}
              step={1}
              marks
              valueLabelDisplay="auto"
            />
          </Box>
          <Box>
            <TypoCiv gutterBottom>🗺️ Taille de la carte</TypoCiv>
            <ToggleButtonGroup
              value={mapSize}
              exclusive
              onChange={(e, v) => { if (v) setMapSize(v); }}
              size="small"
            >
              {Object.entries(MAP_SIZES).map(([key, size]) => (
                <ToggleButton key={key} value={key}>{size.label}</ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
        </Box>
        <Box sx={{display:'flex', flexWrap:'wrap', gap:2, justifyContent:'center'}}>
          {CIVILIZATIONS.map(nation => (
              <Card key={nation.id}  onClick={() => toggleExpand(nation.id)}  variant="outlined" 
              sx={{ background: nation.color, width:400 }}>
                <CardContent>
                  <Grid container alignItems="center" justifyContent="space-between">
                    <Grid item>
                        <Box sx={{display:'flex',m:1, alignItems:'center', gap:2}}>
                            
                      <TypoCiv fontSize={32}>{nation.flag}</TypoCiv>
                      <TypoCiv variant="h6" fontWeight="bold" color={nation.color}>{nation.name}</TypoCiv>
                     
                        </Box>

                      <Box sx={{display:'flex', width:'100%', justifyContent:'space-between'}}>

                         <TypoCiv variant="body2" color="text.secondary">
                        {nation.description}
                      </TypoCiv>
                     
                      </Box>
                    </Grid>
                  </Grid>
                  <Collapse in={expanded === nation.id} timeout="auto" unmountOnExit>
                    <Grid container spacing={1} mt={1}>
                      {Object.entries(nation.bonuses).map(([terrain, value]) => (
                        <Grid item xs={6} key={terrain}>
                          <Tooltip
                            title={<TypoCiv>{typeof value === 'object'
                              ? Object.entries(value).map(([res, val]) => `${res}: +${val}`).join(', ')
                              : `+${value}`}</TypoCiv>}
                          >
                            <TypoCiv variant="body2">
                              <strong>{terrain}</strong>: {
                                typeof value === 'object'
                                  ? Object.entries(value).map(([res, val]) => `${res}: +${val}`).join(', ')
                                  : `+${value}`
                              }
                            </TypoCiv>
                          </Tooltip>
                        </Grid>
                      ))}
                    </Grid>
                    <ButtonCiv
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ mt: 2 }}
                      onClick={() => handleNationSelect(nation, { opponents, mapSize })}
                    >
                      Choisir {nation.name}
                    </ButtonCiv>
                  </Collapse>
                </CardContent>
              </Card>
          ))}
        </Box>
    </DialogCiv>
  );
};
