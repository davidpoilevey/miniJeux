import { useState, useEffect }  from 'react'
import Dialog        from '@mui/material/Dialog'
import DialogTitle   from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Box           from '@mui/material/Box'
import Typography    from '@mui/material/Typography'
import Button        from '@mui/material/Button'
import Chip          from '@mui/material/Chip'
import Divider       from '@mui/material/Divider'
import MaterialIcon  from '../MaterialIcon'
import { useKrat }   from '../../context/KratContext'

// ─── Modes de travail ─────────────────────────────────────────────────────────

const MODES = [
  {
    id:       'normal',
    label:    'Travailler sérieusement',
    icon:     'sentiment_satisfied',
    tagline:  'Le dos courbé, la fierté intacte.',
    salaryMult:  1,
    malusMult:   1,
    repExtra:    0,
    illegal:     false,
  },
  {
    id:       'flemme',
    label:    'Flemmarder',
    icon:     'sentiment_very_dissatisfied',
    tagline:  'Faire semblant depuis 8h. Art consommé.',
    salaryMult:  1,
    malusMult:   0.5,
    repExtra:    0,
    illegal:     false,
  },
  {
    id:       'gratuit',
    label:    'Travailler gratuitement',
    icon:     'volunteer_activism',
    tagline:  'Pour les âmes pures ou profondément brisées.',
    salaryMult:  0,
    malusMult:   1,
    repExtra:    0,
    illegal:     false,
  },
  {
    id:       'piquer',
    label:    'Piquer dans la caisse',
    icon:     'money_off',
    tagline:  "Illégal. Efficace. Ne pas se faire prendre.",
    salaryMult:  2,
    malusMult:   1,
    repExtra:    -6,
    illegal:     true,
    catchChance: 0.30,  // 30% de se faire attraper
  },
]

// ─── Chip d'effet ─────────────────────────────────────────────────────────────

function EffectChip({ icon, label, value, mult = 1 }) {
  const actual = Math.round(value * mult)
  const color  = actual > 0 ? '#2e7d32' : '#c62828'
  const sign   = actual >= 0 ? '+' : ''
  return (
    <Chip
      size="small"
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <MaterialIcon icon={icon} sx={{ fontSize: '0.85rem', color }} />
          <span>{label} {sign}{actual}</span>
        </Box>
      }
      sx={{ bgcolor: 'rgba(0,0,0,0.04)', fontSize: '0.68rem', fontWeight: 600, color }}
    />
  )
}

// ─── Carte de mode ────────────────────────────────────────────────────────────

function ModeCard({ mode, selected, act, onClick }) {
  const salary     = Math.round((act.salary ?? 0) * mode.salaryMult)
  const malusMult  = mode.malusMult

  return (
    <Box
      onClick={onClick}
      sx={{
        p:           1.5,
        borderRadius: 1.5,
        border:      '2px solid',
        borderColor: selected ? 'primary.main' : 'divider',
        bgcolor:     selected ? 'rgba(152,67,0,0.06)' : 'background.default',
        cursor:      'pointer',
        transition:  'all 0.15s',
        '&:hover':   { borderColor: 'primary.light', bgcolor: 'rgba(152,67,0,0.03)' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MaterialIcon icon={mode.icon} sx={{ fontSize: '1.1rem', color: selected ? 'primary.main' : 'text.secondary' }} />
          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.82rem', color: mode.illegal ? '#c62828' : 'text.primary' }}>
            {mode.label}
            {mode.illegal && (
              <Typography component="span" sx={{ fontSize: '0.6rem', ml: 0.75, color: '#c62828', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                illégal
              </Typography>
            )}
          </Typography>
        </Box>
        <Typography sx={{ fontFamily: '"Noto Serif", serif', fontWeight: 700, fontSize: '0.95rem', color: salary === 0 ? 'text.disabled' : 'warning.dark' }}>
          {salary > 0 ? `+${salary}g` : salary === 0 ? '0g' : `${salary}g`}
        </Typography>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', fontStyle: 'italic', display: 'block', mb: 1 }}>
        {mode.tagline}
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {act.forme      && <EffectChip icon="favorite"       label="Forme"      value={act.forme}      mult={malusMult} />}
        {act.faim       && <EffectChip icon="lunch_dining"   label="Faim"       value={act.faim}       mult={malusMult} />}
        {act.reputation && <EffectChip icon="star"           label="Rép."       value={act.reputation} mult={malusMult} />}
        {mode.repExtra  !== 0 && <EffectChip icon="gavel"    label="Rép. bonus" value={mode.repExtra}  mult={1}         />}
      </Box>
    </Box>
  )
}

// ─── Dialog principal ─────────────────────────────────────────────────────────

export default function TravailDialog({ act, open, onClose }) {
  const { actions }      = useKrat()
  const [modeId, setModeId] = useState('normal')
  const [result, setResult] = useState(null)  // null | 'done' | 'caught'

  useEffect(() => {
    if (open) { setModeId('normal'); setResult(null) }
  }, [open])

  if (!act) return null

  const selectedMode = MODES.find(m => m.id === modeId)

  function handleWork() {
    const mode = selectedMode

    if (mode.illegal && Math.random() < mode.catchChance) {
      // Pris la main dans le sac — salaire nul + double pénalité réputation
      actions.doWork({ salary: 0, forme: act.forme ?? 0, faim: act.faim ?? 0, reputation: (act.reputation ?? 0) + mode.repExtra * 2 })
      setResult('caught')
      return
    }

    actions.doWork({
      salary:     Math.round((act.salary ?? 0) * mode.salaryMult),
      forme:      Math.round((act.forme      ?? 0) * mode.malusMult),
      faim:       Math.round((act.faim       ?? 0) * mode.malusMult),
      reputation: Math.round((act.reputation ?? 0) * mode.malusMult) + mode.repExtra,
    })
    setResult('done')
  }

  if (result) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
        <DialogContent sx={{ py: 4, textAlign: 'center' }}>
          <MaterialIcon
            icon={result === 'caught' ? 'gavel' : 'payments'}
            sx={{ fontSize: '3rem', color: result === 'caught' ? 'error.main' : 'warning.main', mb: 2 }}
          />
          <Typography variant="h6" sx={{ mb: 1 }}>
            {result === 'caught' ? 'Pris la main dans le sac !' : 'Journée de travail terminée.'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            {result === 'caught'
              ? "Le patron vous jette dehors sans un sou. Votre réputation en prend un coup sévère."
              : "Vous repartez plus pauvre en énergie mais plus riche en expérience (et en or)."}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button variant="contained" onClick={onClose}>Fermer</Button>
        </DialogActions>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>

      {/* ── Titre ── */}
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <MaterialIcon icon={act.icon} sx={{ fontSize: '1.5rem', color: 'primary.main' }} />
          <Box>
            <Typography variant="h6" sx={{ lineHeight: 1.2 }}>{act.label}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
              Salaire de base : {act.salary ?? 0}g
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {MODES.map(mode => (
            <ModeCard
              key={mode.id}
              mode={mode}
              act={act}
              selected={modeId === mode.id}
              onClick={() => setModeId(mode.id)}
            />
          ))}
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
        <Button onClick={onClose} color="inherit" sx={{ color: 'text.secondary' }}>
          Annuler
        </Button>
        <Button
          variant="contained"
          color={selectedMode?.illegal ? 'error' : 'primary'}
          onClick={handleWork}
          startIcon={<MaterialIcon icon={selectedMode?.icon} sx={{ fontSize: '1rem !important' }} />}
          sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 700 }}
        >
          Partir travailler
        </Button>
      </DialogActions>

    </Dialog>
  )
}
