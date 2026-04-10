import React, { useEffect } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { useActivite } from '../activites/ActiviteProvider';

export const PersoMenu = ({ open, perso }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const activiteContext = useActivite();

  useEffect(() => {
    setAnchorEl(open?.currentTarget??open?.target??null);
  },[open]);

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleExportPerso = () => {
    activiteContext.handleExportPerso();
    handleMenuClose();
  };

  const handleImportPerso = (event) => {
    activiteContext.handleImportPerso(event);
    handleMenuClose();
  };

  return  <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleExportPerso}>Export Personnage</MenuItem>
        <MenuItem ><label htmlFor="import-file">Import Personnage</label></MenuItem>
         {/* Input pour l'importation de fichiers */}
      <input
        accept="application/json"
        id="import-file"
        type="file"
        style={{ display: 'none' }}
        onChange={handleImportPerso}
      />
  
      </Menu>
};
