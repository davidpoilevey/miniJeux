// components/CivUI.js
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Button,
  TextField,
  Typography,
  Select,
} from '@mui/material';

export const paperPropsCiv = {
        sx: {
          background: 'linear-gradient(145deg, rgba(9, 9, 103, 0.25), rgba(129, 125, 9, 0.28))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,215,0,0.2)',
          borderRadius: 4,
          boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,215,0,0.1)',
        },
      }
// === DIALOG CIV ===
export const DialogCiv = ({ open, onClose, title, icon, actions, children, ...props }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={paperPropsCiv}
    {...props}
    >
      {title && (
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            background: 'linear-gradient(135deg, rgba(40, 31, 81, 0.5), rgba(90, 76, 50, 0.3))',
            color: '#FFD700',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            textShadow: '0 2px 10px rgba(255,215,0,0.3)',
            borderBottom: '1px solid rgba(255,215,0,0.2)',
          }}
        >
          {icon && <span style={{ filter: 'drop-shadow(0 0 10px rgba(255,215,0,0.4))' }}>{icon}</span>}
          {title}
        </DialogTitle>
      )}

      <DialogContent sx={{ p: 0 }}>{children}</DialogContent>

     
        <DialogActions
          sx={{
            background: 'rgba(255,215,0,0.05)',
            borderTop: '1px solid rgba(255,215,0,0.1)',
          }}
        >
          {actions}
           <Button sx={{color:'rgba(255,215,0,0.9)'}} onClick={()=>{onClose()}}>Fermer</Button>
        </DialogActions>
      
    </Dialog>
  );
};

// === PAPER CIV ===
export const PaperCiv = ({ children, sx, ...props }) => (
  <Paper
    elevation={0}
    {...props}
    sx={{
      p: 3,
      background: 'rgba(125, 98, 98, 0.05)',
      backdropFilter: 'blur(15px)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 3,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        border: '1px solid rgba(255,215,0,0.3)',
      },
      ...sx
    }}
  >
    {children}
  </Paper>
);

// === BUTTON CIV ===
export const ButtonCiv = ({ children, ...props }) => (
  <Button
    variant="contained"
    {...props}
    sx={{
      background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
      color: 'black',
      fontWeight: 'bold',
      borderRadius: 2,
      boxShadow: '0 8px 25px rgba(255,215,0,0.3)',
      transition: 'all 0.3s ease',
      '&:hover': {
        background: 'linear-gradient(135deg, #FFA500 0%, #FF8C00 100%)',
        transform: 'translateY(-2px)',
        boxShadow: '0 12px 35px rgba(255,215,0,0.4)',
      },
      '&:disabled': {
        background: 'rgba(255,255,255,0.1)',
        color: 'rgba(255,255,255,0.3)',
      },
      ...props.sx,
    }}
  >
    {children}
  </Button>
);

// === TEXTFIELD CIV ===
export const TextFieldCiv = ({ ...props }) => (
  <TextField
    {...props}
    fullWidth
    sx={{
      '& .MuiOutlinedInput-root': {
        backgroundColor: 'rgba(0,0,0,0.5)', color:'rgba(255,215,0,0.6)',
        '& fieldset': { borderColor: 'rgba(255,215,0,0.3)' },
        '&:hover fieldset': { borderColor: 'rgba(255,215,0,0.6)' },
        '&.Mui-focused fieldset': { borderColor: '#FFD700' },
      },
      ...props.sx,
    }}
  />
);

export const SelectCiv = ({ children, ...props }) => (
  <Select
    {...props}
    sx={{
      backgroundColor: 'rgba(0,0,0,0.5)',
      color: 'rgba(255,215,0,0.9)',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: 'rgba(255,215,0,0.3)',
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: 'rgba(255,215,0,0.6)',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: '#FFD700',
      },
      '& .MuiSvgIcon-root': {
        color: '#FFD700',
      },
      ...props.sx,
    }}
  >
    {children}
  </Select>
);


export const TypoCiv = React.forwardRef(({...props},ref)=>{
    return <Typography ref={ref} sx={{ 
                color: '#FFD700',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontWeight: 500
              }} {...props}></Typography>
});
