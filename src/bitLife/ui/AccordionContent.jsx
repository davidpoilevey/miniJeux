import * as React from 'react';

import { ActiviteList, PersonneList } from './BitContent';
import { Box } from '@mui/material';


export const AccordionContent = ({ lieu }) => {
  
  return (
    <Box sx={{ display: 'flex', height:'100%'}}>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>

       
        <ActiviteList lieu={lieu} />
      </Box>
      <Box sx={{ display: 'flex',  alignItems:'start', justifyContent:'start' }}>



        <PersonneList lieu={lieu} />
      </Box>

    </Box>

  );
}


