import React from 'react';
import { Box, FormControl, InputLabel, ListItemText, MenuItem, OutlinedInput, Select, Typography } from '@mui/material';
import { Button, Rating } from '@mui/material';
import Bulle, { ELTS } from './Bulle';
import imgAimant from './images/magnet.png';
import { Delete } from '@mui/icons-material';

export const ElementChooser = ({ groupe, item, onChange, onDelete }) => {


    return <Box style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>

    <ElementSelector mainElt={groupe} value={item.field}
      onChange={forElt => { onChange(groupe, forElt, item.value); }} />

    <Box style={{ display: 'flex', alignItems: 'center' }}>
      <Rating size="small"
        name="ForceAttraction"
        value={item.value}
        onChange={(event, newValue) => onChange(groupe, item.field, newValue)} />
    </Box>
    <Button onClick={onDelete}><Delete/></Button>
  </Box>
};
export const ElementSelector = ({ mainElt, value, label, onChange }) => {
    const handleChange = (event) => {
        onChange(event.target.value);
    };
    const items = [];
    for (let elt in ELTS) {
        items.push(<MenuItem key={ELTS[elt].name} value={ELTS[elt].name} sx={{color:ELTS[elt].color}}>
            <Bulle bulle={{couleur:ELTS[elt].color}}/>
            <ListItemText>
                <Typography style={{marginLeft:'30px', color:ELTS[elt].color}}>{ELTS[elt].name}</Typography>
            </ListItemText>
        </MenuItem>);
    }
    return  <Select
            labelId="demo"
            id="democb"
            value={value}
            onChange={handleChange}
            input={<OutlinedInput margin="dense" inputProps={{margin:'dense'}} label={value} />}
            renderValue={(selected) => {
                return <div style={{width:20,height:20,borderRadius:'50%', backgroundColor:ELTS[selected].color}}/>
            }}>

            {items}
        </Select>
};
