import React, { useEffect, useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, List, ListItem, Card, CardContent, CardHeader, CardMedia, Typography } from '@mui/material';

const ListDialog = ({ open, onClose, onListSubmit, currentList = [] }) => {
  const [listItems, setListItems] = useState('');
  const [currList, setcurrList] = useState(currentList);
 
  useEffect(() => {
    setListItems(currentList.join('\n'));
  }, [currentList]);
  useEffect(() => {
    if(listItems!==''){
        const itemList = listItems.split('\n').filter((item) => item.trim() !== '');
        setcurrList(itemList);
    }
   
  }, [listItems]);

  const handleListChange = (event) => {
    setListItems(event.target.value);
  };

  const handleListSubmit = () => {
    const itemList = listItems.split('\n').filter((item) => item.trim() !== '');
    onListSubmit(itemList);
    onClose();
    setListItems('');
  };

  return (
    <Dialog open={open} onClose={onClose} fullScreen={true}>
      <DialogTitle>Ajouter une liste de plantes</DialogTitle>
      <DialogContent>
        <TextField
          multiline
          minRows={5}
          value={listItems}
          onChange={handleListChange}
          placeholder="Entrez les noms des plantes, un nom par ligne"
          fullWidth
        />
        <List>
          {currList.map((item, index) => (
            <Card key={index} variant="outlined" style={{ marginBottom: '8px', backgroundColor:'rgba(100,0,0,0.2)' }}>
            <CardHeader title={item}/>
           
      
          </Card>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button onClick={handleListSubmit} color="primary" variant="contained">
          Ajouter
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ListDialog;

const MediaFor = ({plante})=>{
    const [images] = useSearchImage(plante);
    if(images==null||images.length==0)
    return null;
    
    const src = images[0].urls.small;
    const desc = images[0].description||images[0].alt_description
    return<>
    <CardMedia   component="img"
    height="94"
    image={src}
  />
    <CardContent>
        <Typography variant="body2" color="text.secondary">
         {desc}
        </Typography>
      </CardContent>
      </> 
}


export const useSearchImage = (nomPlante) => {
    
    const [error, setError] = useState('');
    const [images, setimages] = useState([]);
  
    useEffect(() => {
      const handleSearchImage = () => {
        const API_KEY = 'fmgxXjFe0y3u4lQCByu5mO2b6wy69i68zuiVSniXh4E'; // Remplacez par votre clé API Unsplash
        const URL = `https://api.unsplash.com/search/photos?query=${nomPlante}&client_id=${API_KEY}`;
  
        fetch(URL)
          .then((response) => response.json())
          .then((data) => {
            const images = data.results;
           setimages(images);
          })
          .catch((error) => {
            setError("Une erreur s'est produite lors de la recherche d'images :", error);
          });
      };
  
      handleSearchImage();
    }, [nomPlante]);
  
    return [images, error];
  };
