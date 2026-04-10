import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import ButtonDPY from '../ui/ButtonDPY';
import { Box, useTheme } from '@mui/material';

const QuickDialog = ({ titre='Evenement' ,  text, onOK, onPasOK , children, ...props}) => {
    // si y a des children, y a pas de onOK ni onPasOK
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  useEffect( () => {
     setOpen(text!=null);
}, [ text]);
  const handleClose = () => {
    setOpen(false);
    // Appeler la fonction de refus (onPasOK) si la boîte de dialogue est fermée sans appuyer sur OK
    if (onPasOK) {
      onPasOK();
    }
  };

  const handleOK = () => {
    setOpen(false);
    // Appeler la fonction OK (onOK) si l'utilisateur appuie sur OK
    if (onOK) {
      onOK();
    }
  };
  const cLaVie= onOK==null&&onPasOK==null&&React.Children.count(children) === 0;

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle sx={{backgroundColor:theme.palette.background.paper}}>{titre}</DialogTitle>
      <DialogContent sx={{backgroundColor:theme.palette.background.default}}>
        <p>{text}</p>
        <Box sx={{display:'flex',flexDirection:'column',gap:'5px'}}>
        {children}

        </Box>
      </DialogContent>
      <DialogActions sx={{backgroundColor:theme.palette.background.paper}}>
        {onPasOK!=null && <ButtonDPY type="close" onClick={handleClose} color="primary">
          Pas d'accord
        </ButtonDPY>}
       {onOK!=null&& <ButtonDPY onClick={handleOK} color="primary">
          D'accord
        </ButtonDPY>}

        {cLaVie && <ButtonDPY  type="close" onClick={handleClose} color="primary">
          C'est la vie
        </ButtonDPY>}
      </DialogActions>
    </Dialog>
  );
};

export default QuickDialog;
