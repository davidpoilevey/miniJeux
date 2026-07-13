import React from 'react';
import { Button } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  bubbleButton: {
    background: 'radial-gradient(circle, #ffffff, #a7cbf3)',
    border: 'none',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
    color: theme.palette.primary.dark,
    cursor: 'pointer',
    display: 'inline-block',
    fontSize: '16px',
    fontWeight: 'bold',
    height: '64px',
    width:'90%',
    margin: '8px',
    outline: 'none',
    transition: 'transform 0.2s ease-out',

    '&:hover': {
      transform: 'scale(1.1)',
    },
  },
}));

const BulleButton = ({ children, ...props }) => {
  const classes = useStyles();

  return (
    <Button className={classes.bubbleButton} {...props}>
      {children}
    </Button>
  );
};

export default BulleButton;
