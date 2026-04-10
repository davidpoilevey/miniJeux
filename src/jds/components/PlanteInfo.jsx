
import { Alert, Box, List, ListItem, Typography } from '@mui/material';
import translate from 'deepl';
import React, { useEffect, useState } from 'react';


// key deepL : 
const AUTH_KEY = 'bd80eff6-c1a5-c2d5-dd96-1c47c9aa37c2:fx';
// api-free.deepl.com
const translationProperties = [
  { key: 'watering', label: 'Besoin en arrosage' },
  { key: 'light', label: 'Lumière' },
  { key: 'humidity', label: 'Humidité' },
  { key: 'soil', label: 'Terre' },
  { key: 'fertilizers', label: 'Engrais' },
  { key: 'diseases', label: 'Maladies' },
  { key: 'seasonal_care', label: 'Soins saisonniers' },
  { key: 'growth', label: 'Croissance' },
];


export const translateProperty = async (property) => {
  try {
    const response = await translate({
      free_api: true,
      text: property,
      target_lang: 'FR',
      auth_key: AUTH_KEY,
    });
    const trsnl = response.data?.translations;
    if(trsnl!=null&trsnl.length>0)
      return trsnl[0].text;
    else return property;
  } catch (error) {
    console.error("Une erreur s'est produite lors de la traduction :", error);
    return property; // En cas d'erreur, renvoie la propriété d'origine
  }
};
const PlantInfo = ({ plantInfo, setPlanteInfo, translated=false }) => {
  const [currInfo, setCurrInfo] = useState(plantInfo);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [trlstd, setTranslated] = useState(translated);
 
useEffect(() => {
  const translatePlantInfo = async () => {
    const translatedInfo = {};

    for (const property of translationProperties) {
      const translation = await translateProperty(plantInfo[property.key]);
      translatedInfo[property.key] = translation;
    }
    setTranslated(true);
    setCurrInfo((info) => ({ ...info, ...translatedInfo }));
  };
  if(!trlstd){
    setMsg('Traduction en cours...');
    translatePlantInfo();
  }
  else
    setMsg('');
}, [plantInfo,trlstd]);

useEffect(()=>{
  setPlanteInfo(currInfo);   
},[currInfo]);
  
  
  return (
    <div>
      
      <Typography variant='h6' color={'secondary'}>Soins de la plante : </Typography>
      {error !== '' && <Alert severity='error'>{error}</Alert>}
      {msg !== '' && <Alert severity='info'>{msg}</Alert>}
      <List>
      {translationProperties.map((property) => (
        <ListItem key={property.key}>
          <Box display={'flex'} flexDirection={'column'} justifyContent={'space-between'}>

          <Typography variant='h6'>{property.label}: </Typography>
          <Typography variant='body1'>{currInfo[property.key]}</Typography>
          </Box>
         
        </ListItem>
      ))}
    </List>
    </div>
  );
};

export default PlantInfo;
