import React, { useMemo } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import { Box, ButtonBase, LinearProgress, Typography, useTheme } from '@mui/material';
import { usePerso } from '../personnages/BitLife';
import { PNJIcon } from '../personnages/PNJDialog';

const PersonneCard = ({ perso, onClick }) => {
  const { perso: joueur } = usePerso();
  const isFamille = joueur.getFamille().find(f => f.nom === perso.nom);
  return <PersonneButton onClick={onClick} perso={perso}>
    {joueur.alreadyMet(perso.nom) && <RelationStatus status={joueur.perso.connaissances[perso.nom]} />}
  </PersonneButton>
};

export default PersonneCard;
export const PersonneButton = ({ perso, onClick, children, ...props }) => {

  const persodata = perso.perso??perso;
  const theme = useTheme();
  return <ButtonBase {...props}
    onClick={onClick}
  >
    <Box sx={{ display: 'flex', flexDirection: 'column', padding: '10px', margin:'6px', alignItems:'start', justifyContent:'end'    , backgroundColor: theme.palette.background.paper, color:theme.palette.text.primary, borderRadius: 10, boxShadow: 'rgba(50, 50, 93, 0.25) 0px 50px 80px -20px, rgba(0, 0, 0, 0.3) 0px 33px 60px -30px, rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset' }}>
      <Box sx={{ display: 'flex', gap:'3px',alignItems:'end' }}>
        <PNJIcon pnj={perso} />
        <Typography variant='h6'>{persodata?.etatCivil.nom}</Typography>
      </Box>
      <Box sx={{ display: 'flex', gap:'3px',justifyContent:'space-between' }}>

      <Typography variant='body2'>{persodata?.etatCivil.age} ans</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column',alignItems:'start'}}>

        <Typography variant='caption'>{persodata?.metier?.nom} </Typography>
        <Typography variant='caption'>{persodata?.titre}</Typography>
      </Box>
      </Box>
      {children}
    </Box>
  </ButtonBase>
}

export const RelationStatus = ({ status, invertedColor, ...props }) => {

  const barColor = useMemo(() => {
    let colorBit = status > 50;
    if (invertedColor) colorBit = !colorBit;
    return colorBit ? 'success' : 'error';
  }, [status, invertedColor])
  if (status == null)
    return null;
  return (
    <LinearProgress
      variant="determinate" color={barColor}
      value={status}
      sx={{
        height: 10,
        borderRadius: 5,
        minWidth: 150
      }}
    />
  );
};

/**   {joueur.findAmi(pnj)?<ActionsDAmis ami={perso}/>
        :isFamille?<ActionsDeFamille ami={perso}/>
        :<SoisMonAmi perso={joueur} pnj={perso}/>}
         */
