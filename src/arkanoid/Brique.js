import React from 'react';
import PropTypes from 'prop-types';
import './Arkanoid.css';
import { Box } from '@mui/material';
import { BRIQUE_TYPE } from './BriqueBuilder';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  brique: {
    borderRadius: theme.spacing(1),
    position:'absolute',
    width: '70px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '14px',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
  }
}));

const Brique = ({ type='standard', style={},width=70, height=20, resistance='simple', ...props }) => {
  const briqueColor = BRIQUE_TYPE[type].color;
  const classes = useStyles();
if(style.width==null)
    style.width=width+'px';
    if(style.height==null)
     style.height=height+'px';
     if(style.backgroundImage==null)
     style.backgroundImage=`radial-gradient(circle at 50% 20%, ${briqueColor} 20%, ${BRIQUE_TYPE[type].borderColor} 100%)`;
     
     if(style.border==null)
     style.border='2px ridge '+BRIQUE_TYPE[type].borderColor;
     if(resistance==='double' && style.opacity==null)
     style.opacity=0.6;
     
  return <Box className={classes.brique}
  style={style}
  {...props}>{BRIQUE_TYPE[type].cadeau?.icon}</Box>;
};

Brique.propTypes = {
  type: PropTypes.string.isRequired,
};

export default Brique;
