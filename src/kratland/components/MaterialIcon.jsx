/**
 * Wrapper léger pour les Material Symbols (chargés via la font Google).
 * Préféré à @mui/icons-material pour accéder à toute la bibliothèque d'icônes.
 *
 * Usage :
 *   <MaterialIcon icon="swords" />
 *   <MaterialIcon icon="swords" filled sx={{ fontSize: 28, color: 'primary.main' }} />
 */
import Box from '@mui/material/Box'

export default function MaterialIcon({ icon, filled = false, sx, ...props }) {
  return (
    <Box
      component="span"
      className="material-symbols-outlined"
      aria-hidden="true"
      style={{
        fontFamily: '"Material Symbols Outlined"',
        fontVariationSettings: filled
          ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
          : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
        textTransform: 'none',
        fontStyle: 'normal',
        letterSpacing: 'normal',
        whiteSpace: 'nowrap',
      }}
      sx={{
        fontSize: '1.5rem',
        lineHeight: 1,
        display: 'inline-block',
        ...sx,
      }}
      {...props}
    >
      {icon}
    </Box>
  )
}
