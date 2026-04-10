import { makeStyles } from "@mui/styles";
import backgroundImg from './bg.jpg';

export const useFlip7Styles = makeStyles((theme) => ({
    flip7Board: {
        justifyContent:'space-around',
      backgroundImage: `url(${backgroundImg})`,
      position:'relative',
      width: '100%',
      height: '100%',
      borderRadius: '10px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }
    ,flip7ActionBar: {
      display: 'flex',
      width: '100%',
      maxWidth: 900,
      margin: '24px auto 16px auto',
      gap: theme.spacing(4),
      alignItems: 'center',
      justifyContent: 'center',
    },
    flip7ActionButtons: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(3),
      flex: 1,
      justifyContent: 'center',
    },
    flip7BigButton: {
      minWidth: 120,
      minHeight: 60,
      fontSize: '1.3rem',
      borderRadius: theme.shape.borderRadius * 2,
      boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
      fontWeight: 'bold',
      letterSpacing: 1,
    },
}));