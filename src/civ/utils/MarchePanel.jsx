import React, { useState } from 'react';

import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import {
  Box, Typography, Button, Grid, Paper, MenuItem, Select, InputLabel, FormControl, TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  DialogActions,
  Chip,
  Fade,
  Zoom
} from '@mui/material';
import { TAUX_BASE, useCivContext } from '../CivContext';
import {
  Restaurant, AttachMoney, Gavel, Landscape, Forest, Whatshot, LocalGasStation, Checkroom, RadioSharp,
  StarBorderPurple500,
  CurrencyFranc,
  LocationCity,
  SwapHoriz,
  SendRounded,
  AutoFixHigh
} from '@mui/icons-material';
import { resourceIcons } from '../CivCity';
import { ButtonCiv, DialogCiv, PaperCiv, SelectCiv, TextFieldCiv, TypoCiv } from './civUI';

const TAUX_ROYAL = 0.9; // 10% de frais de transport
// Icônes des ressources



export const MarcheRoyalDialog = ({ open, onClose }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(145deg, rgba(25,25,35,0.95) 0%, rgba(15,15,25,0.98) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,215,0,0.2)',
          borderRadius: 4,
          boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,215,0,0.1)',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        background: 'linear-gradient(135deg, rgba(255,215,0,0.15) 0%, rgba(255,165,0,0.1) 100%)',
        color: '#FFD700',
        fontSize: '1.5rem',
        fontWeight: 'bold',
        textShadow: '0 2px 10px rgba(255,215,0,0.3)',
        borderBottom: '1px solid rgba(255,215,0,0.2)'
      }}>
        <CurrencyFranc sx={{ fontSize: 32, filter: 'drop-shadow(0 0 10px rgba(255,215,0,0.4))' }} /> 
        Marché Royal
        <AutoFixHigh sx={{ ml: 'auto', opacity: 0.6 }} />
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <MarcheRoyalPanel />
      </DialogContent>
      <DialogActions sx={{ 
        background: 'rgba(255,215,0,0.05)',
        borderTop: '1px solid rgba(255,215,0,0.1)'
      }}>
        <Button 
          onClick={onClose}
          sx={{ 
            color: '#FFD700',
            '&:hover': { 
              backgroundColor: 'rgba(255,215,0,0.1)',
              transform: 'scale(1.05)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const MarcheRoyalPanel = () => {
  const { cities, setCities, playerNation } = useCivContext();
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [resource, setResource] = useState('');
  const [amount, setAmount] = useState(0);
  const [isExchanging, setIsExchanging] = useState(false);

  // Filtrer les villes du joueur
  const playerCities = cities.filter(city => city.owner?.id === playerNation.id);
  
  const fromCityData = playerCities.find(c => c.id === fromCity);
  const toCityData = playerCities.find(c => c.id === toCity);
  
  const availableAmount = fromCityData?.resources[resource] || 0;
  const totalReceived = Math.floor(amount * TAUX_ROYAL);

  const handleExchange = async () => {
    if (!fromCityData || !toCityData || !resource || amount <= 0) return;
    if (availableAmount < amount) return;
    if (fromCity === toCity) return;

    setIsExchanging(true);
    
    // Animation délai pour l'effet
    setTimeout(() => {
      setCities(prev => prev.map(city => {
        if (city.id === fromCity) {
          return {
            ...city,
            resources: {
              ...city.resources,
              [resource]: city.resources[resource] - amount
            }
          };
        }
        if (city.id === toCity) {
          return {
            ...city,
            resources: {
              ...city.resources,
              [resource]: (city.resources[resource] || 0) + totalReceived
            }
          };
        }
        return city;
      }));

      setAmount(0);
      setIsExchanging(false);
    }, 1000);
  };

  const canExchange = fromCityData && toCityData && resource && amount > 0 && 
                     availableAmount >= amount && fromCity !== toCity;

  return (
    <Box sx={{ 
      p: 4,
      background: 'linear-gradient(180deg, rgba(0,0,0,0.02) 0%, rgba(255,215,0,0.02) 100%)',
      minHeight: 600
    }}>
      {/* Header info */}
      <Fade in timeout={800}>
        <Box sx={{ 
          backgroundColor: 'rgba(255,215,0,0.08)',
          backdropFilter: 'blur(10px)',
          p: 3,
          borderRadius: 3,
          border: '1px solid rgba(255,215,0,0.2)',
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.5), transparent)'
          }
        }}>
          <Typography variant="body1" sx={{ 
            color: '#FFD700',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontWeight: 500
          }}>
            <CurrencyFranc sx={{ filter: 'drop-shadow(0 0 5px rgba(255,215,0,0.3))' }} />
            Échangez des ressources entre vos cités du royaume avec la bénédiction royale.
          </Typography>
          <Typography variant="body2" sx={{ 
            color: 'rgba(255,215,0,0.7)',
            mt: 1,
            ml: 4
          }}>
            Frais de transport royal : 10% • Vous recevrez 90% des ressources envoyées
          </Typography>
        </Box>
      </Fade>

      <Grid container spacing={4}>
        {/* Ville source */}
        <Grid item xs={12} md={5}>
          <Zoom in timeout={600}>
            <Paper sx={{ 
              p: 3, 
              height: '100%',
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 3,
              position: 'relative',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                border: '1px solid rgba(255,215,0,0.3)'
              }
            }}>
              <Typography variant="h6" mb={3} sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                color: '#FFD700',
                fontWeight: 'bold'
              }}>
                <LocationCity sx={{ filter: 'drop-shadow(0 0 5px rgba(255,215,0,0.3))' }} /> 
                Ville Source
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Choisir la ville</InputLabel>
                <Select
                  value={fromCity}
                  label="Choisir la ville"
                  onChange={e => {
                    setFromCity(e.target.value);
                    setResource('');
                    setAmount(0);
                  }}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255,255,255,0.2)'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255,215,0,0.5)'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#FFD700'
                    }
                  }}
                >
                  {playerCities.map(city => (
                    <MenuItem key={city.id} value={city.id}>
                      <LocationCity sx={{ mr: 1, color: '#FFD700' }} fontSize="small" />
                      {city.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {fromCityData && (
                <Fade in timeout={400}>
                  <Box>
                    <Typography variant="subtitle2" mb={2} sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      Ressources disponibles :
                    </Typography>
                    <Grid container spacing={1}>
                      {Object.entries(fromCityData.resources).map(([res, val]) => {
                        if(res==='science') return null;
                        return <Grid item key={res}>
                          <Chip
                            icon={resourceIcons[res]}
                            label={`${res}: ${val}`}
                            size="small"
                            variant={resource === res ? "filled" : "outlined"}
                            onClick={() => setResource(res)}
                            sx={{ 
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              backgroundColor: resource === res ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.05)',
                              border: resource === res ? '1px solid #FFD700' : '1px solid rgba(255,255,255,0.2)',
                              color: resource === res ? '#FFD700' : 'rgba(255,255,255,0.8)',
                              '&:hover': {
                                transform: 'scale(1.05)',
                                backgroundColor: 'rgba(255,215,0,0.15)',
                                border: '1px solid rgba(255,215,0,0.5)'
                              }
                            }}
                          />
                        </Grid>
})}
                    </Grid>
                  </Box>
                </Fade>
              )}
            </Paper>
          </Zoom>
        </Grid>

        {/* Flèche d'échange animée */}
        <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: 1
          }}>
            <SwapHoriz sx={{ 
              fontSize: 50, 
              color: '#FFD700',
              filter: 'drop-shadow(0 0 15px rgba(255,215,0,0.4))',
              animation: canExchange ? 'pulse 2s infinite' : 'none',
              '@keyframes pulse': {
                '0%': { transform: 'scale(1)', opacity: 0.8 },
                '50%': { transform: 'scale(1.1)', opacity: 1 },
                '100%': { transform: 'scale(1)', opacity: 0.8 }
              }
            }} />
            {amount > 0 && (
              <Fade in>
                <Typography variant="caption" sx={{ 
                  color: '#FFD700',
                  textAlign: 'center',
                  fontWeight: 'bold'
                }}>
                  {amount} → {totalReceived}
                </Typography>
              </Fade>
            )}
          </Box>
        </Grid>

        {/* Ville destination */}
        <Grid item xs={12} md={5}>
          <Zoom in timeout={800}>
            <Paper sx={{ 
              p: 3, 
              height: '100%',
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 3,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                border: '1px solid rgba(255,215,0,0.3)'
              }
            }}>
              <Typography variant="h6" mb={3} sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                color: '#FFD700',
                fontWeight: 'bold'
              }}>
                <LocationCity sx={{ filter: 'drop-shadow(0 0 5px rgba(255,215,0,0.3))' }} /> 
                Ville Destination
              </Typography>
              
              <FormControl fullWidth>
                <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Choisir la ville</InputLabel>
                <Select
                  value={toCity}
                  label="Choisir la ville"
                  onChange={e => setToCity(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255,255,255,0.2)'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255,215,0,0.5)'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#FFD700'
                    }
                  }}
                >
                  {playerCities.filter(city => city.id !== fromCity).map(city => (
                    <MenuItem key={city.id} value={city.id}>
                      <LocationCity sx={{ mr: 1, color: '#FFD700' }} fontSize="small" />
                      {city.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {toCityData && (
                <Fade in timeout={400}>
                  <Box mt={3}>
                    <Typography variant="subtitle2" mb={2} sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      Ressources actuelles :
                    </Typography>
                    <Grid container spacing={1}>
                      {Object.entries(toCityData.resources).map(([res, val]) => (
                        <Grid item key={res}>
                          <Chip
                            icon={resourceIcons[res]}
                            label={`${res}: ${val}`}
                            size="small"
                            variant="outlined"
                            sx={{ 
                              backgroundColor: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.2)',
                              color: 'rgba(255,255,255,0.8)'
                            }}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Fade>
              )}
            </Paper>
          </Zoom>
        </Grid>
      </Grid>

      {/* Panneau d'échange */}
      {fromCityData && toCityData && resource && (
        <Fade in timeout={1000}>
          <Paper sx={{ 
            p: 4, 
            mt: 4,
            background: 'rgba(255,215,0,0.08)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(255,215,0,0.2)',
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.8), transparent)'
            }
          }}>
            <Typography variant="h6" mb={3} sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              color: '#FFD700',
              fontWeight: 'bold'
            }}>
              {resourceIcons[resource]} 
              Échange de {resource}
              <SendRounded sx={{ ml: 'auto' }} />
            </Typography>
            
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Quantité à envoyer"
                  type="number"
                  value={amount}
                  onChange={e => setAmount(parseInt(e.target.value) || 0)}
                  inputProps={{ min: 0, max: availableAmount }}
                  helperText={`Disponible : ${availableAmount}`}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      '& fieldset': { borderColor: 'rgba(255,215,0,0.3)' },
                      '&:hover fieldset': { borderColor: 'rgba(255,215,0,0.6)' },
                      '&.Mui-focused fieldset': { borderColor: '#FFD700' }
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Box textAlign="center" sx={{
                  p: 2,
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: 2,
                  border: '1px solid rgba(255,215,0,0.2)'
                }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,215,0,0.7)' }}>
                    Après frais de transport
                  </Typography>
                  <Typography variant="h5" sx={{ 
                    color: '#FFD700',
                    fontWeight: 'bold',
                    textShadow: '0 0 10px rgba(255,215,0,0.3)'
                  }}>
                    {totalReceived}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleExchange}
                  disabled={!canExchange || isExchanging}
                  sx={{ 
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                    color: 'black',
                    fontWeight: 'bold',
                    height: 56,
                    borderRadius: 2,
                    boxShadow: '0 8px 25px rgba(255,215,0,0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': { 
                      background: 'linear-gradient(135deg, #FFA500 0%, #FF8C00 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 35px rgba(255,215,0,0.4)'
                    },
                    '&:disabled': {
                      background: 'rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.3)'
                    }
                  }}
                >
                  {isExchanging ? 'Envoi en cours...' : 'Envoyer'}
                </Button>
              </Grid>
            </Grid>
            
            {amount > 0 && (
              <Fade in timeout={500}>
                <Box mt={3} sx={{ 
                  background: 'linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,165,0,0.05) 100%)',
                  p: 3,
                  borderRadius: 2,
                  border: '1px solid rgba(255,215,0,0.2)'
                }}>
                  <Typography variant="body1" sx={{ color: '#FFD700', fontWeight: 500 }}>
                    📦 <strong>{fromCityData.name}</strong> enverra <strong>{amount} {resource}</strong> à{' '}
                    <strong>{toCityData.name}</strong> qui recevra <strong>{totalReceived} {resource}</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,215,0,0.7)', mt: 1 }}>
                    💰 Frais de transport royal : {amount - totalReceived} {resource}
                  </Typography>
                </Box>
              </Fade>
            )}
          </Paper>
        </Fade>
      )}
    </Box>
  );
};









// ***********   Marche ambulant  ********************
const MarcheDialog = ({ open, onClose, city }) => {
  return <DialogCiv open={open} onClose={onClose} title="Marché ambulant"
   icon={'💹'} >
      <MarchePanel city={city} />
  </DialogCiv>;
};

const MarchePanel = ({ city }) => {
  const { setCities ,taux, setTaux,historique} = useCivContext();
  const [from, setFrom] = useState(Object.keys(city.resources).find(r => TAUX_BASE[r]) || 'wood');
  const [to, setTo] = useState(Object.keys(TAUX_BASE[from] || {})[0] || 'gold');
  const [amount, setAmount] = useState(0);

  const resources = city.resources;

  const tauxActuel = taux[from]?.[to] || 0;
  const total = Math.floor(amount * tauxActuel);

  const handleExchange = () => {
    if (!tauxActuel || amount <= 0) return;
    if (resources[from] < amount) return;

    const newResources = { ...resources };
    newResources[from] -= amount;
    newResources[to] = (newResources[to] || 0) + total;

    const nouveauTaux = { ...taux };
    const variation = Math.random()*0.1
    nouveauTaux[from][to] = +(tauxActuel * (0.95+variation)).toFixed(2); // déflation locale légère
    setCities(prev => prev.map(c => (c.id === city.id ? { ...c, resources: newResources } : c)));
    setTaux(nouveauTaux);
    setAmount(0);
  };

  const fromOptions = Object.keys(resources).filter(r => TAUX_BASE[r]);
  const optionsTo = taux[from] ? Object.keys(taux[from]) : [];

  return (
    <Box p={3}>
      <TypoCiv variant="body2" mb={2}>
        Échangez vos ressources avec les marchands de passage. Les taux varient selon l'offre et la demande.
      </TypoCiv>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Depuis</InputLabel>
            <SelectCiv
              value={from}
              label="Depuis"
              onChange={e => {
                setFrom(e.target.value);
                setTo(Object.keys(taux[e.target.value] || {})[0]);
              }}
            >
              {fromOptions.map(ress => (
                <MenuItem key={ress} value={ress}>
                  {resourceIcons[ress]} {ress}
                </MenuItem>
              ))}
            </SelectCiv>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Vers</InputLabel>
            <SelectCiv 
              value={to}
              label="Vers"
              onChange={e => setTo(e.target.value)}
            >
              {optionsTo.map(ress => (
                <MenuItem key={ress} value={ress}>
                  {resourceIcons[ress]} {ress}
                </MenuItem>
              ))}
            </SelectCiv>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextFieldCiv
            fullWidth
            label={`Quantité (${from})`}
            type="number"
            value={amount}
            onChange={e => setAmount(parseInt(e.target.value) || 0)}
            inputProps={{ min: 0, max: resources[from] || 0 }}
          />
        </Grid>
      </Grid>

      <Box mt={2}>
        <TypoCiv variant="body2">
          Taux actuel : 1 {from} = {tauxActuel} {to} → Vous recevrez {total} {to}
        </TypoCiv>
        <Box mt={2}>
  <TypoCiv variant="body2">
    Taux actuel : 1 {from} = {tauxActuel} {to}
  </TypoCiv>
  <TauxChart data={historique?.[from]?.[to]} />
</Box>
        <ButtonCiv
          variant="contained"
          color="primary"
          onClick={handleExchange}
          disabled={!tauxActuel || amount <= 0 || resources[from] < amount}
          sx={{ mt: 1 }}
        >
          Échanger
        </ButtonCiv>
      </Box>

      <Box mt={4}>
        <TypoCiv variant="h6">Vos ressources</TypoCiv>
        <Grid container spacing={1} mt={1}>
          {Object.entries(resources).map(([res, val]) => (
            <Grid item key={res}>
              <PaperCiv sx={{ p: 1, px: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                {resourceIcons[res]} <Typography>{res} : {val}</Typography>
              </PaperCiv>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default MarcheDialog;



const TauxChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  const chartData = data.map((value, index) => ({ index, value }));

  return (
    <div style={{ width: 100, height: 40 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
           <YAxis domain={['dataMin', 'dataMax']} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#4caf50"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
