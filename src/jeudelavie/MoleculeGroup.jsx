import React, { useState } from 'react';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

const MoleculeRadioGroup = ({ onChange }) => {
  const [selectedMolecule, setSelectedMolecule] = useState('violet');

  const handleRadioChange = (event) => {
    setSelectedMolecule(event.target.value);
    onChange(event.target.value);
  };

  return (
    <RadioGroup row value={selectedMolecule} onChange={handleRadioChange}>
      <FormControlLabel value="violet" control={<Radio />} label="Violet" />
      <FormControlLabel value="rouge" control={<Radio />} label="Rouge" />
      <FormControlLabel value="vert" control={<Radio />} label="Vert" />
      <FormControlLabel value="chlore" control={<Radio />} label="Chlore" />
    </RadioGroup>
  );
};

export default MoleculeRadioGroup;
