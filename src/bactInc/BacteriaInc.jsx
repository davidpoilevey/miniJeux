import React, {  useState } from 'react';
import { Box } from '@mui/material';
import { LabProvider, useLab } from './LabContext';
import LabView from './views/LabView';
import ResearchView from './views/ResearchView';
import MarketView from './views/MarketView';
import LabDrawer from './views/LabDrawer';
import {LabLogPopper} from './components/LabLogPopper';
import { OnBoardingProvider, OnBoardingStep } from "../OnBoardingContext";

import BactIncBureau from './views/BactIncBureau';
import MachineActionDialog from './components/MachineDialogue';

export default function BacterieInc() {
  const [tab, setTab] = useState(0);
  const [selected, setSelected] = useState(null); // pour afficher un élément dans le panneau de droite
 
  const handleSelect = (item) => setSelected(item);

  return (
      <OnBoardingProvider app="bacteriaInc"
       stepsConfig={[{id:'intro'}, {id:'laboIntro'}, {id:'market'}, {id:'labo'}
        , {id:'assigneSouche'}, {id:'recherche'}, {id:'achatVente'}, {id:'soucheExpl'}, {id:'bonneChance'}
       ]}>
         
    <LabProvider>
      <Box display="flex" height="100vh" >
        <Box  width="100%" display="flex">
         <BactIncBureau tab={tab} setTab={setTab} handleSelect={handleSelect}/>


          <Box sx={{display:'flex', flex:1, p:2,overflow:"auto"}} >
            {tab === 0 && <LabView onSelect={handleSelect} />}
            {tab === 1 && <ResearchView onSelect={handleSelect} />}
            {tab === 2 && <MarketView onSelect={handleSelect} />}
          </Box>
        </Box>

        <LabDrawer
          selected={selected}
          onClose={() => { setSelected(null) }}
        />
        <LabLogPopper />
        <MachineActionDialog/>
      </Box>
    </LabProvider>
    </OnBoardingProvider>
  );
}



