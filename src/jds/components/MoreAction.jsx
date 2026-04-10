import { Fab, Drawer, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import React, { useState } from "react";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { ExploreOutlined, ImportExport, ListAlt, Save } from "@mui/icons-material";

const MoreAction = ({ handleSavePlantes, handleExportPlantes, openListe }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleDrawerOpen = () => {
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };
const itemSX = {
  height:'150px',
    backgroundColor: 'lightpink',
    borderRadius: '8px',
    marginBottom: '10px',
  
}
  return (
    <>
      <Fab
        color="primary"
        aria-label="menu"
        style={{ position: 'fixed', bottom: '20px', right: '20px' }}
        onClick={handleDrawerOpen}
      >
        <MoreVertIcon />
      </Fab>

      <Drawer
        anchor="bottom"
        open={isDrawerOpen}
        onClose={handleDrawerClose}
      >
        <List>
          <ListItem  sx={itemSX} onClick={openListe}>
            <ListItemIcon>
             <ListAlt/>
            </ListItemIcon>
            <ListItemText primary="Liste" />
          </ListItem>
          <ListItem  sx={itemSX} onClick={handleSavePlantes}>
            <ListItemIcon>
              <Save/>
            </ListItemIcon>
            <ListItemText primary="Sauvegarder" />
          </ListItem>
          <ListItem  sx={itemSX} onClick={handleExportPlantes}>
            <ListItemIcon>
              <ExploreOutlined/>
            </ListItemIcon>
            <ListItemText primary="Exporter un fichier" />
          </ListItem>
          <ListItem sx={itemSX}>

          <ListItemIcon>
              <ImportExport/>
            </ListItemIcon>
            <ListItemText>

            <label htmlFor="import-file">Importer un fichier</label>
            </ListItemText>
          </ListItem>
        </List>
      </Drawer>
    </>
  );
};

export default MoreAction;
