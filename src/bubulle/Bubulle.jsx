import React, { useEffect, useRef } from 'react';
import { BullProvider, useBull } from './BulContext';
import { Box } from '@mui/material';
import Bulle from './Bulle';
import { ReglagesProvider } from './ReglageContext';
import RegToolbar from './Toolbar';
import { makeStyles } from '@mui/styles';
import verreImg from './images/verre.png';

// Création du style personnalisé avec Material-UI
export const useAquariumStyles = makeStyles({
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'row',justifyContent: 'flex-end'
  },
  aquarium: {
    width: '100%',
    height: '100%',
    backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(155, 105, 255, 0.15) 70%)',

  
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolbar: {
    display: 'flex',
    flexDirection: 'column', // Pour aligner les éléments verticalement
    alignItems: 'center', // Pour centrer les éléments horizontalement
  },
});

const Bubulle = () => {
  const classes = useAquariumStyles();
  return <ReglagesProvider>
    <BullProvider>
    <Box className={classes.container}>
   
      <Aquarium>

      </Aquarium>
    <RegToolbar />
    </Box>

    </BullProvider>
  </ReglagesProvider>
};
const Aquarium = () => {
  const classes = useAquariumStyles();
  const { bulles, initialize, setAquariumLimits , aquariumLimits} = useBull();
  const aqRef = useRef();
  const setRef = (element) => {
    if (aqRef.current == null) {
      aqRef.current = element;
      initialize(aqRef.current)
    }

  }
  useEffect(() => {
    if (aqRef.current) {
      const observer = new ResizeObserver((entries) => {
        const { width, height } = entries[0].contentRect;
      
        setAquariumLimits({ width, height });
      });

      observer.observe(aqRef.current);

      return () => {
        observer.disconnect();
      };
    }
  }, [aquariumLimits]);
  const allBulles = [
    ...bulles.bullesFeu,
    ...bulles.bullesEau,
    ...bulles.bullesAir,
    ...bulles.bullesTerre,
  ];
  return  <Box ref={setRef} className={classes.aquarium}>
      {/* Contenu du composant ici */}
      {
        allBulles.map((bulle, bidx) => {
          return <Bulle key={bidx} bulle={bulle} />
        })
      }
    </Box>
}
export default Bubulle;

