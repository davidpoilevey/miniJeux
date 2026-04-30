import { useState, useEffect } from 'react'
import Dialog        from '@mui/material/Dialog'
import DialogTitle   from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Box           from '@mui/material/Box'
import Typography    from '@mui/material/Typography'
import Button        from '@mui/material/Button'
import TextField     from '@mui/material/TextField'
import Slider        from '@mui/material/Slider'
import Chip          from '@mui/material/Chip'
import MaterialIcon  from '../MaterialIcon'
import { useKrat }   from '../../context/KratContext'
import { pb }        from '../../services/pb'  // utilisé dans AnnoncePanel
import { NPC_SPAWN_TEMPLATES } from '../../data/catalog'

// ─── Menu principal ───────────────────────────────────────────────────────────

function MenuPanel({ onSelect }) {
  const entries = [
    { id: 'taxes',   icon: 'payments',        color: 'warning', label: 'Ajuster les taxes',       desc: 'Appliquer un multiplicateur sur toutes les transactions commerciales de la ville.' },
    { id: 'annonce', icon: 'campaign',         color: 'info',    label: 'Annonce municipale',       desc: 'Publier un message officiel visible par tous les habitants.' },
    { id: 'police',  icon: 'local_police',     color: 'error',   label: 'Police municipale',        desc: 'Nommer des agents dans votre garde personnelle, sans frais.' },
  ]
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 1 }}>
      {entries.map(e => (
        <Button
          key={e.id}
          variant="outlined"
          color={e.color}
          fullWidth
          onClick={() => onSelect(e.id)}
          startIcon={<MaterialIcon icon={e.icon} />}
          sx={{ justifyContent: 'flex-start', textTransform: 'none', py: 1.5 }}
        >
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{e.label}</Typography>
            <Typography variant="caption" color="text.secondary">{e.desc}</Typography>
          </Box>
        </Button>
      ))}
    </Box>
  )
}

// ─── Taxes ────────────────────────────────────────────────────────────────────

function TaxesPanel({ onBack }) {
  const { state, actions } = useKrat()
  const [value, setValue] = useState(state.city.taxMultiplier ?? 1.0)
  const [saved,  setSaved]  = useState(false)

  useEffect(() => { setValue(state.city.taxMultiplier ?? 1.0) }, [state.city.taxMultiplier])

  function handleSave() {
    actions.setTaxMultiplier(value)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const marks = [
    { value: 1.0, label: '×1  (Exempt)' },
    { value: 1.5, label: '×1.5' },
    { value: 2.0, label: '×2' },
    { value: 3.0, label: '×3  (Pillage)' },
  ]

  return (
    <Box>
      <Button size="small" onClick={onBack} startIcon={<MaterialIcon icon="arrow_back" />} sx={{ mb: 2 }}>
        Retour
      </Button>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Ce multiplicateur s'applique au prix de toutes les ventes dans les commerces de la ville.
        Un taux élevé enrichit les caisses municipales… mais mécontente le peuple.
      </Typography>
      <Box sx={{ px: 2 }}>
        <Slider
          value={value}
          min={1.0}
          max={3.0}
          step={0.1}
          marks={marks}
          valueLabelDisplay="on"
          valueLabelFormat={v => `×${v.toFixed(1)}`}
          onChange={(_, v) => { setValue(v); setSaved(false) }}
          color={value > 2 ? 'error' : value > 1.5 ? 'warning' : 'success'}
        />
      </Box>
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color={saved ? 'success' : 'primary'}
          onClick={handleSave}
          startIcon={<MaterialIcon icon={saved ? 'check' : 'gavel'} />}
        >
          {saved ? 'Décret publié !' : 'Appliquer le décret'}
        </Button>
      </Box>
    </Box>
  )
}

// ─── Annonce municipale ───────────────────────────────────────────────────────

function AnnoncePanel({ onBack }) {
  const { state } = useKrat()
  const [text, setText] = useState('')
  const [sent, setSent]  = useState(false)

  async function handlePublish() {
    if (!text.trim()) return
    try {
      await pb.collection('kratNews').create({
        type:   'official',
        text:   text.trim(),
        cityId: state.city.id,
        author: state.player.name,
        target: null,
      })
      setSent(true)
      setText('')
      setTimeout(() => setSent(false), 3000)
    } catch {}
  }

  return (
    <Box>
      <Button size="small" onClick={onBack} startIcon={<MaterialIcon icon="arrow_back" />} sx={{ mb: 2 }}>
        Retour
      </Button>
      <Box sx={{ mb: 2, p: 1.5, bgcolor: 'rgba(25,118,210,0.06)', borderLeft: '3px solid', borderColor: 'info.main', borderRadius: 1 }}>
        <Typography variant="caption" color="info.dark" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Annonce officielle · Mairie de {state.city.name}
        </Typography>
      </Box>
      <TextField
        label="Votre message"
        multiline
        rows={4}
        fullWidth
        value={text}
        onChange={e => { setText(e.target.value); setSent(false) }}
        placeholder="Au nom de la municipalité, il est décrété que…"
        sx={{ mb: 2 }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color={sent ? 'success' : 'info'}
          disabled={!text.trim()}
          onClick={handlePublish}
          startIcon={<MaterialIcon icon={sent ? 'check' : 'campaign'} />}
        >
          {sent ? 'Annonce publiée !' : 'Publier'}
        </Button>
      </Box>
    </Box>
  )
}

// ─── Police municipale ────────────────────────────────────────────────────────

function SpawnCard({ templateKey, onSpawn }) {
  const { state } = useKrat()
  const tpl      = NPC_SPAWN_TEMPLATES[templateKey]
  const count    = state.groupe.filter(m => m.role === tpl.role).length
  const maxed    = tpl.maxInGroupe != null && count >= tpl.maxInGroupe
  const stats    = tpl.stats ?? {}

  return (
    <Box sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
        <MaterialIcon icon={tpl.icon ?? 'person'} sx={{ fontSize: '2rem', color: 'error.main' }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{tpl.label ?? tpl.name}</Typography>
          <Typography variant="caption" color="text.secondary">{tpl.description}</Typography>
        </Box>
        {tpl.maxInGroupe != null && (
          <Chip label={`${count} / ${tpl.maxInGroupe}`} size="small"
            color={maxed ? 'error' : 'default'} variant="outlined" />
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
        {Object.entries(stats).map(([k, v]) => (
          <Chip key={k} size="small" label={`${k} ${v}`}
            sx={{ fontSize: '0.7rem', textTransform: 'capitalize' }} />
        ))}
        {tpl.hp && (
          <Chip size="small" label={`❤ ${tpl.hp.max}`} sx={{ fontSize: '0.7rem' }} />
        )}
      </Box>

      <Button
        variant="contained"
        color="error"
        fullWidth
        disabled={maxed}
        startIcon={<MaterialIcon icon={tpl.icon ?? 'person_add'} />}
        onClick={() => onSpawn(tpl)}
      >
        {maxed ? 'Effectif complet' : `Engager un ${tpl.label ?? tpl.name}`}
      </Button>
    </Box>
  )
}

function PolicePanel({ onBack }) {
  const { actions } = useKrat()
  const [spawning, setSpawning] = useState(false)

  async function handleSpawn(tpl) {
    setSpawning(true)
    await actions.spawnNpc(tpl)
    setSpawning(false)
  }

  return (
    <Box>
      <Button size="small" onClick={onBack} startIcon={<MaterialIcon icon="arrow_back" />} sx={{ mb: 2 }}>
        Retour
      </Button>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        En tant que maire, vous pouvez engager des agents municipaux directement dans votre garde.
      </Typography>
      <SpawnCard templateKey="policier" onSpawn={handleSpawn} />
      {spawning && (
        <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>
          Recrutement en cours…
        </Typography>
      )}
    </Box>
  )
}

// ─── Dialog principal ─────────────────────────────────────────────────────────

const PANEL_LABELS = {
  menu:    'Bureau du Maire',
  taxes:   'Gestion des Taxes',
  annonce: 'Annonce Municipale',
  police:  'Police Municipale',
}

export default function BureauDuMaireDialog({ open, onClose }) {
  const { state } = useKrat()
  const [panel, setPanel] = useState('menu')

  useEffect(() => { if (!open) setPanel('menu') }, [open])

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <MaterialIcon icon="account_balance" sx={{ color: 'primary.main' }} />
        <Box>
          <Typography variant="h6" component="span">{PANEL_LABELS[panel]}</Typography>
          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {state.city.name} · Maire : {state.city.mayor}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2, pb: 1 }}>
        {panel === 'menu'    && <MenuPanel    onSelect={setPanel} />}
        {panel === 'taxes'   && <TaxesPanel   onBack={() => setPanel('menu')} />}
        {panel === 'annonce' && <AnnoncePanel onBack={() => setPanel('menu')} />}
        {panel === 'police'  && <PolicePanel  onBack={() => setPanel('menu')} />}
      </DialogContent>

      <DialogActions sx={{ borderTop: '1px solid', borderColor: 'divider', px: 2 }}>
        <Button onClick={onClose} color="inherit">Fermer</Button>
      </DialogActions>
    </Dialog>
  )
}
