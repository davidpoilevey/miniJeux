import { GlobalStyles, SpeedDial, SpeedDialAction, SpeedDialIcon, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import UpdateIcon from '@mui/icons-material/Update';
import {AllInclusive, Bolt, Diversity1, Diversity1TwoTone, FilterVintage, Fingerprint, FlashOn, Public, RestartAlt} from '@mui/icons-material';
import { useGod } from '../GodContext';


const godModes = [
  { icon: <Fingerprint color="warning"/>, name: 'Doigt Divin', mode: 'KILL_CREATURE_AT' },
  { icon: <Diversity1TwoTone color="info"/>, name: 'Maison close', mode: 'HOLY_ZONE' },
  { icon: <FilterVintage color="success"/>, name: 'Zone Fertile', mode: 'FERTILE_ZONE' },
  { icon: <FlashOn  color="warning"/>, name: 'Colonne Divine', mode: 'COLONNE_DIVINE' },
  { icon: <Bolt color="error"/>, name: 'Astéroïde', mode: 'ASTEROID' },
];
const GodSpeedDial = () => {
  const { dispatch } = useGod();

  const actions = [
    // {
    //   icon: <UpdateIcon />,
    //   name: 'Tick',
    //   onClick: () => dispatch({ type: 'TICK_CREATURES' }),
    // },
    
    {
      icon: <AddIcon color="info"/>,
      name: '+ 10 bestioles',
      onClick: () => {
        for (let i = 0; i < 10; i++) {
          dispatch({ type: 'ADD_CREATURE' });
        }
      },
    },
    {
      icon: <RestartAlt color="error"/>,
      name: 'Apocalypse',
      onClick: () => dispatch({ type: 'RESET' }),
    },
  ];

  return <>
  <GlobalStyles styles={{
    '.MuiSpeedDialAction-staticTooltipLabel': {
      marginBottom: '8px', // ou '12px' selon ton goût
      top: '40px', // plus net que top:
    },'.MuiSpeedDial-actions': {
    gap: '48px !important', // ou '32px' si les tooltips sont longs
  }
  }} />
    <SpeedDial direction="right" 
      ariaLabel="Actions de simulation"
      sx={{ position: 'fixed', top: 16, left: 16 }}
      icon={<AllInclusive />}
    >
    
      {actions.concat(godModes).map((action) => (
        <SpeedDialAction
          key={action.name}
          icon={action.icon}
           tooltipTitle={action.name} tooltipOpen
          onClick={()=>{
            if(action.onClick) action.onClick();
            else
            dispatch({ type: 'SET_GOD_MODE', payload: action.mode })
            }}
        />
      ))}
    </SpeedDial>
  
  </>
};

export default GodSpeedDial;
