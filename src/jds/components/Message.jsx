import { useState } from 'react';
import { Snackbar } from '@mui/material';
import MuiAlert from '@mui/material/Alert';



const useShowAlert = (options) => {
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
const verticalAnchor = options?.verticalAnchor||'top';
  const showAlert = (message, severity) => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setIsSnackbarOpen(true);
  };

  const closeAlert = () => {
    setIsSnackbarOpen(false);
  };

  return {
    showAlert,
    closeAlert,
    SnackbarComponent: (
        
      <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={3000}
        onClose={closeAlert}
        anchorOrigin={{ vertical: verticalAnchor, horizontal: 'center' }}
        
      >
          <MuiAlert onClose={closeAlert} severity={alertSeverity}>
   {alertMessage}
  </MuiAlert>
        {/* <Alert severity={alertSeverity}></Alert> */}
      </Snackbar>
    ),
  };
};

export default useShowAlert;
