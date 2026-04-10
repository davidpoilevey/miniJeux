import { Paper, Typography } from "@mui/material"

const Instructions = ()=>{
    return <Paper         elevation={3}
        sx={{
          position: 'absolute',
          bottom: 120,
          right: 20,
          px: 2,
          py: 1,
          backgroundColor: 'rgba(26, 26, 46, 0.9)',
          border: '1px solid #7f8c8d',
          maxWidth: 250
        }}
      >
        <Typography variant="caption" sx={{ color: '#95a5a6', display: 'block' }}>
          <strong>Contrôles:</strong>
        </Typography>
        <Typography variant="caption" sx={{ color: 'white', display: 'block' }}>
          • Déplacer: ← → ou Q/D
        </Typography>
        <Typography variant="caption" sx={{ color: 'white', display: 'block' }}>
          • Voler: ESPACE (maintenir)
        </Typography>
        <Typography variant="caption" sx={{ color: 'white', display: 'block' }}>
          • Lancer sorts: 1, 2, 3, 4
        </Typography>
        <Typography variant="caption" sx={{ color: 'white', display: 'block' }}>
          • Interagir: E
        </Typography>
        <Typography variant="caption" sx={{ color: 'white', display: 'block' }}>
          • Inventaire: I
        </Typography>
        <Typography variant="caption" sx={{ color: 'white', display: 'block' }}>
          • Grimoire: K
        </Typography>
      </Paper>
}

export default Instructions;