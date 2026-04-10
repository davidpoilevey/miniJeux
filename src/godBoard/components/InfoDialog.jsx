import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress, List, ListItem, ListItemText, Typography } from "@mui/material";

const InfoDialog = ({selectedCreature, onClose})=>{
  
return <Dialog open={!!selectedCreature} onClose={onClose} maxWidth="xs" fullWidth>
  <DialogTitle>Inspecteur de bestioles</DialogTitle>
  <DialogContent dividers>
    {selectedCreature && (
      <>
        <List>
          <ListItem>
            <ListItemText
              primary="Nom"
              secondary={selectedCreature.name}
            />
          </ListItem>
          <ListItem>
            <ListItemText primary="Couleur" />
            <Box
              sx={{
                width: 24, height: 24, borderRadius: "50%",
                backgroundColor: selectedCreature.color,
                ml: 1, border: "1px solid #ccc"
              }}
            />
          </ListItem>
        </List>

        <Box mt={2}>
          <StatBar label="Faim" value={selectedCreature.hunger} color={selectedCreature.hunger>0.5?"error":"success"} />
          <StatBar label="Besoin de reproduction" value={selectedCreature.needForSex} color={selectedCreature.needForSex>0.5?"warning":"success"} />
          <StatBar label="Vitesse" value={selectedCreature.speed*4} color="info" labelUnit="km/h" />
        </Box>
      </>
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={onClose}>Fermer</Button>
  </DialogActions>
</Dialog>


}


export default InfoDialog;

 
const StatBar = ({ label, value, color = 'primary', labelUnit="%" }) => (
 <Box sx={{ mb: 2 }}>
    <Typography variant="body2" gutterBottom>
      {label}: {Math.round(value * 100)}{labelUnit}
    </Typography>
    <LinearProgress
      variant="determinate"
      value={value * 100}
      color={color}
      sx={{
        height: 10,
        borderRadius: 5,
        backgroundColor: "#eee",
        [`& .MuiLinearProgress-bar`]: {
          borderRadius: 5
        }
      }}
    />
  </Box>
);