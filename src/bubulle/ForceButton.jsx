import React, { useEffect, useState } from 'react';
import { useReglages } from './ReglageContext';
import { Box, Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import { Slide, Typography } from '@mui/material';
import { ELTS } from './Bulle';
import attireImg from './images/attire.png';
import repousseImg from './images/repousse.png';
import { ElementChooser } from './ElementChooser';

export const ForceButton = ({ groupe }) => {
  const [showFields, setShowFields] = useState(false);
  const [attractionItems, setAttractionItems] = useState([]);
  const [repulsionItems, setRepulsionItems] = useState([]);

  const { attractionRapport, setAttrRapports, repulsionRapport, setRepRapports } = useReglages();

  useEffect(() => {
    const attItems = [];
    for (let mainelt in attractionRapport) {
      const subElts = attractionRapport[mainelt];
      if (subElts != null) {
        for (let subelt in subElts) {
          if (subElts[subelt] != null) {
            attItems.push({ main: mainelt, field: subelt, value: subElts[subelt] });
          }
        }
      }
    }
    setAttractionItems(attItems);
    const repItems = [];
    for (let mainelt in repulsionRapport) {
      const subElts = repulsionRapport[mainelt];
      if (subElts != null) {
        for (let subelt in subElts) {
          if (subElts[subelt] != null) {
            repItems.push({ main: mainelt, field: subelt, value: subElts[subelt] });
          }
        }
      }
    }
    setRepulsionItems(repItems);
  }, [attractionRapport, repulsionRapport]);
  const setAttraction = (grp, forElt, val, toRemove) => {
    setAttrRapports((oldRep) => {
      // Supprimer l'élément spécifié par toRemove du rapport si nécessaire
      let newRep = { ...oldRep };
      if (toRemove) {
        delete newRep[grp][toRemove];
      }

      // Mettre à jour ou ajouter la nouvelle valeur d'attraction pour l'élément cible
      newRep = { ...newRep, [grp]: { ...newRep[grp], [forElt]: val } };

      return newRep;
    });
  };
  const setRepulsion = (grp, forElt, val, toRemove) => {
    setRepRapports((oldRep) => {
      // Supprimer l'élément spécifié par toRemove du rapport si nécessaire
      let newRep = { ...oldRep };
      if (toRemove) {
        delete newRep[grp][toRemove];
      }

      // Mettre à jour ou ajouter la nouvelle valeur d'attraction pour l'élément cible
      newRep = { ...newRep, [grp]: { ...newRep[grp], [forElt]: val } };

      return newRep;
    });
  };
  const deleteRapport = (type, grp, toRemove) => {
    if (type === 'attraction') {
      setAttrRapports((oldRep) => {
        // Supprimer l'élément spécifié par toRemove du rapport si nécessaire
        let newRep = { ...oldRep };
        if (toRemove) {
          delete newRep[grp][toRemove];
        }
        return newRep;
      });
    }
    if (type === 'repulsion') {
      setRepRapports((oldRep) => {
        // Supprimer l'élément spécifié par toRemove du rapport si nécessaire
        let newRep = { ...oldRep };
        if (toRemove) {
          delete newRep[grp][toRemove];
        }
        return newRep;
      });
    }
  };
  const handleButtonClick = () => {
    setShowFields((prevShowFields) => !prevShowFields);
  };
  const handleAddAttraction = (grp) => {
    setAttractionItems((prevAttractionItems) => [...prevAttractionItems, { main: grp, field: '', value: 2.5 }]);
  };

  const handleAddRepulsion = (grp) => {
    setRepulsionItems((prevRepulsionItems) => [...prevRepulsionItems, { main: grp, field: '', value: 2.5 }]);
  };


  return (
    <Box style={{ width: '100%' }}>
      <Button variant='contained' style={{ width: '100%' }}
        onClick={handleButtonClick}>{ELTS[groupe].image()}</Button>
      <Slide direction="left" in={showFields} mountOnEnter unmountOnExit>
        <Box style={{ display: 'flex', flexDirection: 'column' }}>

          {/* header */}
          <Box style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ backgroundColor: ELTS[groupe].color, width: 30, height: 30 }} />
            <Typography variant='h6'>Attire</Typography>
            <Button onClick={() => { handleAddAttraction(groupe); }}><Add color='primary' /></Button>
            <img src={attireImg} height={30} alt="Attraction" />

          </Box>
          {/* Content */}
          <Box>
            {attractionItems.map((item, index) => {

              return item.main === groupe ? <ElementChooser key={'selector' + index}
                groupe={groupe} item={item}
                onDelete={() => { deleteRapport('attraction', groupe, item.field); }}
                onChange={(grp, forElt, val) => {
                  setAttraction(grp, forElt, val, item.field);
                }} /> : null;



            }
            )}
          </Box>
          &nbsp;
          <Box style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <div style={{ backgroundColor: ELTS[groupe].color, width: 30, height: 30 }} />
            <Typography variant='h6'>Repousse</Typography>
            <Button onClick={() => { handleAddRepulsion(groupe); }}><Add color='primary' /></Button>
            <img src={repousseImg} height={30} alt="Repulsion" />

          </Box>
          {/* Content */}
          <Box>
            {repulsionItems.map((item, index) => {

              return item.main === groupe ? <ElementChooser key={'selector' + index}
                onDelete={() => { deleteRapport('repulsion', groupe, item.field); }}
                groupe={groupe} item={item} onChange={(grp, forElt, val) => {
                  setRepulsion(grp, forElt, val, item.field);
                }} /> : null;



            }
            )}
          </Box>

        </Box>

      </Slide>
    </Box>
  );
};
