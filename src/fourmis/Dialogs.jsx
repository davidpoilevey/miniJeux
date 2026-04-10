import React, { useState } from 'react';
import { Grid, Fab, Dialog, DialogTitle, DialogContent, Slider, Button, Typography, Box, TextField, InputAdornment, DialogActions, Paper, useTheme } from '@mui/material';
import { Settings } from '@mui/icons-material';

const FabSetting = ({ config, setConfig, ...props }) => {
const theme = useTheme();
    const [openDialog, setOpenDialog] = useState(false);
    const [cols, setCols] = useState(config.colonies);
    const [sliderValue, setSliderValue] = useState((config.pragmatisme * 100) ?? 50); // Valeur initiale du Slider

    const handleFabClick = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleSliderChange = (event, newValue) => {
        setSliderValue(newValue);
    };

    const handleSaveConfig = () => {
        // Ajoute ici la logique pour sauvegarder la configuration
        // (peut-être en passant la valeur du Slider à d'autres composants)
        setConfig(oldconf => ({ ...oldconf
            , colonies:cols
            , pragmatisme: sliderValue / 100 }));
        setOpenDialog(false);
    };
    const setColonie = (oldCol, newCol)=>{
       
        setCols(oldCols=>{
            return oldCols.map(c=>{
                return (c.name===oldCol.name)?newCol:c
            });
        })
        // setConfig(oldConfig=>{
        //     const newConf = {...oldConfig, colonies:newColonies}
        //     return newConf;
        // })
    }
    const addColonie = ()=>{
              
        setCols(oldc=>oldc.concat({name:"Colonie de vacances "+oldc.length, SUCRE_STOCK:2,PONCTION_PAR_FOURMI:40,reserve:100}))
    }
    

    return <> <Fab onClick={handleFabClick} sx={{ position: 'absolute', bottom: 50, right: 50 }}>
        <Settings />
    </Fab>

        {/* Boîte de dialogue de configuration */}
        <Dialog open={openDialog} onClose={handleCloseDialog} >
            <DialogTitle sx={{backgroundColor:theme.palette.background.default}}>Configuration</DialogTitle>
            <DialogContent style={{ width: '500px', padding: '20px' ,backgroundColor:theme.palette.background.default}}>
  <Box>
    <Typography variant='h6'>Duree d'un tour (ms)</Typography>
    <TextField
    helperText="Rythme de baisse des pheromones, production des fourmis et des pucerons"
      value={config.TAUX_PRODUCTION}
      onChange={evt => {
        setConfig(oldconf => ({ ...oldconf, TAUX_PRODUCTION: evt.target.value }));
      }}
    />
  </Box>

  {cols.map((colonie, idx) => (
    <Paper key={'colon-' + idx} style={{ marginBottom: '20px' ,padding:10}}>
     
      <TextField
        label="Nom de la colonie"
        value={colonie.name}
        helperText="Le nom est très important, ne pas oublier"
        onChange={evt => {
          setColonie(colonie, { ...colonie, name: evt.target.value });
        }}
      />

      <Box sx={{ display: 'flex', marginTop: '10px', gap: '20px' ,alignItems:'end'}}>
        <Box>
          <Typography variant='body2'>Reserve initiale</Typography>
          <TextField variant='standard'
          helperText="le nombre d'energie initiale de la fourmiliere"
            value={colonie.reserve || ''}
            onChange={evt => {
              setColonie(colonie, { ...colonie, reserve: evt.target.value });
            }}
          />
        </Box>
        <Box>
          <Typography variant='body2'>Capacite  individuel</Typography>
          <TextField variant='standard'
          helperText="Ce que ramasse la fourmi par voyage vers une source de nourriture"
            value={colonie.SUCRE_STOCK || ''}
            onChange={evt => {
              setColonie(colonie, { ...colonie, SUCRE_STOCK: evt.target.value });
            }}
          />
        </Box>
        <Box>
          <Typography variant='body2'>Cout de production</Typography>
          <TextField variant='standard'
          helperText="Energie prise dans la reserve pour produire une fourmi"
            value={colonie.PONCTION_PAR_FOURMI || ''}
            onChange={evt => {
              setColonie(colonie, { ...colonie, PONCTION_PAR_FOURMI: evt.target.value });
            }}
          />
        </Box>
      </Box>

      <Box style={{ marginTop: '20px' }}>
        <Typography variant='h6'>Discipline</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant='caption' flex={1}>
            Anarchiste
          </Typography>
          <Slider
            value={sliderValue}
            onChange={handleSliderChange}
            aria-labelledby='continuous-slider'
            valueLabelDisplay='auto'
            valueLabelFormat={value => `${value}%`}
            min={0}
            max={100}
            flex={5}
          />
          <Typography variant='caption' flex={1}>
            Rigoureux
          </Typography>
        </Box>
      </Box>
    </Paper>
  ))}

  {/* Bouton pour sauvegarder la configuration */}
</DialogContent>

            <DialogActions>

            <Button onClick={()=>{addColonie()}} variant="contained" color="primary">
                    Ajouter une colonie
                </Button>
            <Button onClick={handleSaveConfig} variant="contained" color="primary">
                    Sauvegarder
                </Button>
            </DialogActions>
        </Dialog>
    </>
}

export default FabSetting;
