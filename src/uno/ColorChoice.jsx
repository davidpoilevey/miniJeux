import React from 'react';
import Dialog from '@mui/material/Dialog';
import { makeStyles } from '@mui/styles';
import { red, green, blue, yellow } from '@mui/material/colors';
import { DialogContent, DialogTitle } from '@mui/material';

const useStyles = makeStyles({
  colorOption: {
    width: '50px',
    height: '50px',
    flex:1,
    margin: '5px',
    cursor: 'pointer',
  },
});

const ColorChoiceDialog = React.forwardRef(({ open, onClose, onChosen },ref) => {
  const classes = useStyles();

  const handleColorClick = (color) => {
    onChosen(color);
   if(typeof onClose==='function')
     onClose();
  };

  return (
    <Dialog ref={ref} open={open} onClose={onClose}>
        <DialogTitle>Choisissez la couleur de votre joker</DialogTitle>
      <DialogContent sx={{display:'flex'}}>
        <div
          className={classes.colorOption}
          style={{ background: red[500] }}
          onClick={() => handleColorClick('red')}
        />
        <div
          className={classes.colorOption}
          style={{ background: green[500] }}
          onClick={() => handleColorClick('green')}
        />
        <div
          className={classes.colorOption}
          style={{ background: blue[500] }}
          onClick={() => handleColorClick('blue')}
        />
        <div
          className={classes.colorOption}
          style={{ background: yellow[500] }}
          onClick={() => handleColorClick('yellow')}
        />
      </DialogContent>
    </Dialog>
  );
});

export default ColorChoiceDialog;
