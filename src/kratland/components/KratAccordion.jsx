/**
 * KratAccordion — Section repliable réutilisable pour le HUD.
 *
 * Props :
 *   title       {string}  — Titre de la section
 *   icon        {string}  — Nom de l'icône Material Symbols
 *   defaultOpen {bool}    — Ouvert au premier rendu (défaut : false)
 *   alwaysOpen  {bool}    — Non repliable, header décoratif uniquement (défaut : false)
 *   children              — Contenu du corps
 */
import React, { useState } from 'react'
import Box      from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import Typography from '@mui/material/Typography'
import MaterialIcon from './MaterialIcon'

export default function KratAccordion({
  title,
  icon,
  defaultOpen = false,
  alwaysOpen  = false,
  children,
}) {
  const [open, setOpen] = useState(defaultOpen || alwaysOpen)

  function toggle() {
    if (!alwaysOpen) setOpen(o => !o)
  }

  return (
    <Box
      sx={{
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: open ? 'primary.light' : 'divider',
        overflow: 'hidden',
        transition: 'border-color 0.2s',
      }}
    >
      {/* ── En-tête ── */}
      <Box
        onClick={toggle}
        sx={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          px:             2,
          py:             1.25,
          cursor:         alwaysOpen ? 'default' : 'pointer',
          bgcolor:        open ? 'rgba(152,67,0,0.06)' : 'transparent',
          userSelect:     'none',
          transition:     'background-color 0.15s',
          '&:hover':      alwaysOpen ? {} : { bgcolor: 'rgba(152,67,0,0.04)' },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <MaterialIcon
            icon={icon}
            filled={open}
            sx={{
              fontSize: '1.1rem',
              color:    open ? 'primary.main' : 'text.secondary',
              transition: 'color 0.15s',
            }}
          />
          <Typography
            variant="overline"
            sx={{
              fontSize:      '0.68rem',
              fontFamily:    '"Plus Jakarta Sans", sans-serif',
              fontWeight:    open ? 700 : 500,
              color:         open ? 'primary.main' : 'text.secondary',
              lineHeight:    1,
              letterSpacing: '0.08em',
              transition:    'color 0.15s',
            }}
          >
            {title}
          </Typography>
        </Box>

        {!alwaysOpen && (
          <MaterialIcon
            icon={open ? 'expand_less' : 'expand_more'}
            sx={{ fontSize: '1.1rem', color: 'text.disabled' }}
          />
        )}
      </Box>

      {/* ── Corps ── */}
      <Collapse in={open}>
        <Box sx={{ px: 2, py: 1.5 }}>
          {children}
        </Box>
      </Collapse>
    </Box>
  )
}
