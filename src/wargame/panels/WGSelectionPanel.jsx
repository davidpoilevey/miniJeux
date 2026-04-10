import { Box, Card, Chip, Paper, Typography } from "@mui/material";
import { useWG } from "../WarGameContext";

export const WGSelectionPanel = () => {
  const { unitSelected, tileSelected } = useWG();

  return (
    <Paper sx={{ padding: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>Sélection</Typography>

{tileSelected && (
        <Card sx={{ marginTop: 2, padding: 1 }}>
          <Typography variant="body2">Case Q: {tileSelected.q}, R: {tileSelected.r}</Typography>
          <Typography variant="body2">Terrain : {tileSelected.terrain}</Typography>
        </Card>
      )}

      {unitSelected && (
        <Card sx={{ marginTop: 2, padding: 1 }}>
          <Typography variant="h6">{unitSelected.name}</Typography>
          <Typography variant="body2">
            PV : {unitSelected.defense - unitSelected.damagePoints} / {unitSelected.defense}
          </Typography>
          <Typography variant="body2">Mouvement : {unitSelected.movement}</Typography>
          <Typography variant="body2">Attaque : {unitSelected.attack} | Portée : {unitSelected.range}</Typography>

          <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              size="small"
              label="Mouvement"
              color={unitSelected.hasMoved ? 'default' : 'success'}
              variant={unitSelected.hasMoved ? 'filled' : 'outlined'}
            />
            <Chip
              size="small"
              label="Attaque"
              color={unitSelected.hasAttacked ? 'default' : 'success'}
              variant={unitSelected.hasAttacked ? 'filled' : 'outlined'}
            />
          </Box>
        </Card>
      )}
    </Paper>
  );
};
