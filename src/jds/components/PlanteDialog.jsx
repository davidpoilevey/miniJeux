import React, { useEffect, useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Alert, Grid, AlertTitle, Typography, Slider, Divider } from '@mui/material';
import Autocomplete from '@mui/lab/Autocomplete';

import PlanteInfo from './PlanteInfo';
import { Search } from '@mui/icons-material';
import PlantListItem from './PlantListItem';
import { useMediaQuery } from '@mui/material';
import { ImageGrid } from './ImageGrid';

const dummyResult = '{"watering":"Menthe (Mentha) should be kept moist, but not soggy.","light":"Mint plants need full sun to partial shade, meaning they need at least six hours of direct sun per day.","temperature":"The temperature requirement for a menthe is 16 degrees Celsius.","humidity":"There is no definitive answer to this question as the humidity requirements for a menthe can vary depending on the specific plant species. Some menthe plants may prefer high humidity levels, while others may be more tolerant of lower humidity levels. It is best to consult a professional or expert on the matter to get the most accurate information.","soil":"The soil requirement for a menthe is a well-drained, sandy loam soil with a pH of 6.5 to 7.5.","fertilizers":"The fertilizers requirement for a menthe is the same as for any other herb - plenty of compost or manure, and a balanced fertilizer.","diseases":"There is no definitive answer to this question as each plant will have different requirements depending on the specific disease or pests that it is susceptible to. However, some general tips for preventing diseases in mint plants include ensuring that the plants have adequate drainage, avoiding overhead watering, and keeping the leaves dry. Additionally, it is important to remove any dead or diseased leaves from the plant to help prevent the spread of disease.","propagation":"Mint can be propagated by stem cuttings taken in late spring or early summer.","seasonal care":"Menthe requires very little seasonal care. In the spring, it may be necessary to trim back any dead or dying leaves. In the fall, it is important to cut back the plant to encourage new growth in the spring.","growth":"Mint grows best in moist, shady areas. It will tolerate some sun, but too much sun will cause the leaves to lose their color."}'

const PlanteDialog = ({ open, onClose, onAdd, onEdit, plante, onDel, waitingPlantes }) => {
  const [currentPlante, setCurrentPlante] = useState(plante);
  const [nomPlante, setNomPlante] = useState('');
  const [descriptionPlante, setDescriptionPlante] = useState('');
  const [info, setInfo] = useState();
  const [searchStatus, setSearchStatus] = useState();
  const [imagePlante, setImagePlante] = useState('');
  const [error, setError] = useState('');
  const [size, setSize] = useState(80);
  const [nomError, setNomError] = useState();
  const [availableImages, setAvailableImages] = useState([]);
  const isMobile = useMediaQuery('(max-width: 600px)');

  useEffect(() => {
    clear();
    setCurrentPlante(plante);
  }, [plante]);

  useEffect(() => {
    if (currentPlante != null) {
      setNomPlante(currentPlante.nom);
      setDescriptionPlante(currentPlante.description);
      setInfo(currentPlante.info);
      setSize(currentPlante.size);
      setImagePlante(currentPlante.image);
    }
  }, [currentPlante]);

  const handleNomPlanteChange = (value) => {
    setNomPlante(value);
    setNomError(null);
  };

  const handleSearchImage = () => {
    const API_KEY = 'fmgxXjFe0y3u4lQCByu5mO2b6wy69i68zuiVSniXh4E';
    const URL = `https://api.unsplash.com/search/photos?query=${nomPlante}&client_id=${API_KEY}`;

    fetch(URL)
      .then((response) => response.json())
      .then((data) => {
        const images = data.results;
        if (images && images.length > 0) {
          setAvailableImages(images);
        } else {
          setAvailableImages([]);
        }
      })
      .catch((error) => {
        setError("Une erreur s'est produite lors de la recherche d'images :", error);
      });
  };

  const handleSearchDescription = () => {
    const plantName = nomPlante.toLowerCase();
    const url = 'https://plantwise.p.rapidapi.com/plant/?plant_type=' + plantName;
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': 'b30d5f083fmshed2729b10061ed5p17fd1ajsn966537ad0634',
        'X-RapidAPI-Host': 'plantwise.p.rapidapi.com'
      }
    };
    if(currentPlante!=null)
        setCurrentPlante((old) => ({ ...old, info: null }));

    try {
      setSearchStatus('Send request');
      fetch(url, options)
        .then((response) => {
          setSearchStatus('Reponse brute recue');
          return response.json();
        })
        .then((data) => {
          setSearchStatus(null);
          if (data && data.plant_care_info) {
            setInfo(data.plant_care_info);
          } else {
            setError('Mauvaise reponse de l\'API ' + JSON.stringify(data));
          }
        })
        .catch((error) => {
          setError('Une erreur s\'est produite lors de la recherche de la description de la plante :', error);
        });
    } catch (error) {
      setError(error);
    }
  };

  const handleImageSelection = (imgUrl) => {
    setImagePlante(imgUrl);
    setAvailableImages([]);
  };

  const setPlanteInfo = (info) => {
    setInfo(info);
  };

  const handleSizeChange = (newSize) => {
    setCurrentPlante((plt) => ({ ...plt, size: newSize }));
    setSize(newSize);
  };

  const handleSetPlante = () => {
    const plte = setPlante();
    onEdit(plte);
    onClose();
    clear();
  };

  const handleAjouterPlante = () => {
    const plte = setPlante();

    if (plte.nom == null || plte.nom === '') {
      setNomError('Le nom doit être rempli');
    } else {
      onAdd(plte);
      onClose();
      clear();
    }
  };

  const handleDeletePlante = () => {
    clear();
    onDel();
    onClose();
  };

  const clear = () => {
    setNomPlante('');
    setDescriptionPlante('');
    setImagePlante('');
    setInfo(null);
    setAvailableImages([]);
  };

  const setPlante = () => {
    const plte = {
      ...currentPlante,
      nom: nomPlante,
      description: descriptionPlante,
      image: imagePlante,
      size: size,
      info: info
    };
    return plte;
  };

  return (
    <Dialog open={open} onClose={onClose} fullScreen={isMobile}>
      <DialogTitle sx={{textAlign:'center',fontWeight:'bold'}}>
          {currentPlante == null ? 'Ajouter une nouvelle plante' : `Modifier ${currentPlante.nom}`}
      </DialogTitle>
      <DialogContent>
        {error !== '' && <Alert severity="error">{error}</Alert>}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={11} pt={1}>
            {nomError != null && <Alert severity="error">{nomError}</Alert>}
            <Autocomplete
              value={nomPlante || ''}
              options={waitingPlantes}
              disabled={currentPlante != null}
              fullWidth
              freeSolo
              margin="dense"
              renderInput={(params) => <TextField helperText={availableImages.length > 0 ? 'Un choix d\'images est disponible en bas' : ''} {...params} />}
              onChange={(event, value) => {
                handleNomPlanteChange(value);
            }}
             onBlur={(event) => {
              handleNomPlanteChange(event.target.value);
          }}
            />
          </Grid>
          <Grid item xs={1}>
            <IconButton onClick={handleSearchImage} size="small">
              <Search />
            </IconButton>
          </Grid>
          {searchStatus != null && (
            <Grid item xs={12}>
              <Alert severity="info">
                <AlertTitle>Recherche...</AlertTitle>
                {searchStatus}
              </Alert>
            </Grid>
          )}
          <Grid item xs={11}>
            <TextField
              label="Description"
              value={descriptionPlante}
              onChange={(event) => setDescriptionPlante(event.target.value)}
              multiline
              maxRows={4}
              fullWidth
            />
          </Grid>
          <Grid item xs={1}>
            <IconButton onClick={handleSearchDescription} size="small">
              <Search />
            </IconButton>
          </Grid>
          {imagePlante !== '' && (
            <>
              <Grid item xs={12}>
                <Slider value={currentPlante?.size || 80} min={60} max={150} step={10} onChange={(event, value) => handleSizeChange(value)} />
              </Grid>
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                <PlantListItem plante={{ nom: nomPlante, size: size, image: imagePlante }} />
              </Grid>
            </>
          )}
          <Divider />
          {info != null && (
            <Grid item xs={12}>
              <PlanteInfo plantInfo={info} setPlanteInfo={setPlanteInfo} translated={currentPlante != null && currentPlante.info != null} />
            </Grid>
          )}
          {imagePlante !== '' && (
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
              <img src={imagePlante} alt="Plante" />
            </Grid>
          )}
          <Grid item xs={12}>
            <ImageGrid handleImageSelection={handleImageSelection} images={availableImages} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        {currentPlante == null ? (
          <Button variant="contained" color="primary" onClick={handleAjouterPlante}>
            Ajouter
          </Button>
        ) : (
          <>
            <Button variant="contained" color="primary" onClick={handleSetPlante}>
              Modifier
            </Button>
            <Button variant="contained" color="secondary" onClick={handleDeletePlante}>
              Supprimer
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PlanteDialog;
