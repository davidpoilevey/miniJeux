import { useState, useEffect }  from 'react'
import Dialog         from '@mui/material/Dialog'
import DialogTitle    from '@mui/material/DialogTitle'
import DialogContent  from '@mui/material/DialogContent'
import DialogActions  from '@mui/material/DialogActions'
import Box            from '@mui/material/Box'
import Typography     from '@mui/material/Typography'
import Button         from '@mui/material/Button'
import Chip           from '@mui/material/Chip'
import Divider        from '@mui/material/Divider'
import LinearProgress from '@mui/material/LinearProgress'
import TextField      from '@mui/material/TextField'
import MaterialIcon   from '../MaterialIcon'
import { useKrat }    from '../../context/KratContext'
import { COMPETENCES, ITEM_TYPES } from '../../data/catalog'
import { pb }         from '../../services/pb'

// ─── Chips d'effets ───────────────────────────────────────────────────────────

function EffectChip({ icon, label, value }) {
  const color = value > 0 ? '#2e7d32' : '#c62828'
  const sign  = value > 0 ? '+' : ''
  return (
    <Chip
      size="small"
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <MaterialIcon icon={icon} sx={{ fontSize: '0.85rem', color }} />
          <span>{label} {sign}{value}</span>
        </Box>
      }
      sx={{ bgcolor: 'rgba(0,0,0,0.04)', fontSize: '0.68rem', fontWeight: 600, color }}
    />
  )
}

function GoldRangeChip({ min, max }) {
  return (
    <Chip
      size="small"
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <MaterialIcon icon="payments" sx={{ fontSize: '0.85rem', color: '#f9a825' }} />
          <span>+{min} à {max}g</span>
        </Box>
      }
      sx={{ bgcolor: 'rgba(0,0,0,0.04)', fontSize: '0.68rem', fontWeight: 600, color: '#f9a825' }}
    />
  )
}

function ItemChip({ itemKey }) {
  const item = ITEM_TYPES[itemKey]
  if (!item) return null
  return (
    <Chip
      size="small"
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <MaterialIcon icon={item.icon} sx={{ fontSize: '0.85rem', color: '#7b1fa2' }} />
          <span>{item.label}</span>
        </Box>
      }
      sx={{ bgcolor: 'rgba(0,0,0,0.04)', fontSize: '0.68rem', fontWeight: 600, color: '#7b1fa2' }}
    />
  )
}

function EffectsBlock({ label, effects = {}, reward = null }) {
  const hasContent = Object.keys(effects).length > 0 || reward?.gold || reward?.item
  if (!hasContent) return null
  return (
    <Box>
      <Typography variant="caption" sx={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.disabled', fontWeight: 700 }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
        {reward?.gold                    && <GoldRangeChip min={reward.gold.min} max={reward.gold.max} />}
        {reward?.item                    && <ItemChip itemKey={reward.item} />}
        {effects.gold       !== undefined && <EffectChip icon="payments"     label="Or"    value={effects.gold} />}
        {effects.reputation !== undefined && <EffectChip icon="star"         label="Rép."  value={effects.reputation} />}
        {effects.forme      !== undefined && <EffectChip icon="favorite"     label="Forme" value={effects.forme} />}
        {effects.faim       !== undefined && <EffectChip icon="lunch_dining" label="Faim"  value={effects.faim} />}
      </Box>
    </Box>
  )
}

// ─── Barre de probabilité ─────────────────────────────────────────────────────

function ChanceBar({ chance }) {
  const pct   = Math.round(chance * 100)
  const color = pct >= 65 ? 'success' : pct >= 40 ? 'warning' : 'error'
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Chance de réussite
        </Typography>
        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.75rem', color: `${color}.main` }}>
          {pct}%
        </Typography>
      </Box>
      <LinearProgress variant="determinate" value={pct} color={color} sx={{ height: 6, borderRadius: 3 }} />
    </Box>
  )
}

// ─── Panel jet de dé ──────────────────────────────────────────────────────────

function RollPanel({ action, player, onExecute, onClose }) {
  const isAuto          = !!action.auto
  const competenceLevel = isAuto ? 0 : (player.stats.competences?.[action.competenceBonus] ?? 0)
  const baseChance      = action.successChance ?? 0.5
  const bonus           = competenceLevel * 0.05
  const effectiveChance = isAuto ? 1 : Math.min(0.95, baseChance + bonus)
  const buttonLabel     = action.confirmLabel ?? (isAuto ? 'Confirmer' : 'Tenter le coup')

  return (
    <>
      <DialogContent sx={{ pt: 1 }}>
        {action.description && (
          <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic', color: 'text.secondary' }}>
            {action.description}
          </Typography>
        )}

        {!isAuto && <ChanceBar chance={effectiveChance} />}

        {!isAuto && bonus > 0 && (
          <Box sx={{ mb: 2 }}>
            <Chip
              size="small"
              icon={<MaterialIcon icon={COMPETENCES[action.competenceBonus]?.icon ?? 'star'} sx={{ fontSize: '0.85rem !important' }} />}
              label={`${COMPETENCES[action.competenceBonus]?.label} : +${Math.round(bonus * 100)}%`}
              color="success"
              variant="outlined"
              sx={{ fontSize: '0.68rem' }}
            />
          </Box>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {isAuto ? (
            <EffectsBlock label="Effets" effects={action.onSuccess ?? {}} reward={action.reward} />
          ) : (
            <>
              <EffectsBlock label="En cas de succès" effects={action.onSuccess ?? {}} reward={action.reward} />
              <EffectsBlock label="En cas d'échec"   effects={action.onFailure ?? {}} />
            </>
          )}
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
        <Button onClick={onClose} color="inherit" sx={{ color: 'text.secondary' }}>Annuler</Button>
        <Button
          variant="contained"
          color={action.illegal ? 'error' : 'primary'}
          onClick={() => onExecute(effectiveChance)}
          startIcon={<MaterialIcon icon={action.icon} sx={{ fontSize: '1rem !important' }} />}
          sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 700 }}
        >
          {buttonLabel}
        </Button>
      </DialogActions>
    </>
  )
}

// ─── Panel formulaire ─────────────────────────────────────────────────────────

function FormPanel({ action, onSubmit, onClose }) {
  const [values, setValues] = useState({})

  const canSubmit = (action.form ?? [])
    .filter(f => f.required)
    .every(f => (values[f.key] ?? '').trim().length > 0)

  return (
    <>
      <DialogContent sx={{ pt: 1 }}>
        {action.description && (
          <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic', color: 'text.secondary' }}>
            {action.description}
          </Typography>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {(action.form ?? []).map(field => (
            <TextField
              key={field.key}
              label={field.label}
              placeholder={field.placeholder ?? ''}
              multiline={field.multiline ?? false}
              rows={field.multiline ? 3 : 1}
              fullWidth
              size="small"
              value={values[field.key] ?? ''}
              onChange={e => setValues(prev => ({ ...prev, [field.key]: e.target.value }))}
              required={field.required}
            />
          ))}
        </Box>

        {action.onSuccess && (
          <Box sx={{ mt: 2 }}>
            <EffectsBlock label="Effets" effects={action.onSuccess} />
          </Box>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
        <Button onClick={onClose} color="inherit" sx={{ color: 'text.secondary' }}>Annuler</Button>
        <Button
          variant="contained"
          color="primary"
          disabled={!canSubmit}
          onClick={() => onSubmit(values)}
          startIcon={<MaterialIcon icon={action.icon} sx={{ fontSize: '1rem !important' }} />}
          sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 700 }}
        >
          Confirmer
        </Button>
      </DialogActions>
    </>
  )
}

// ─── Écran résultat ────────────────────────────────────────────────────────────

function ResultScreen({ action, result, onClose }) {
  const caught  = result.caught
  const success = result.success
  const icon    = caught ? 'gavel' : success ? 'check_circle' : 'cancel'
  const color   = caught ? 'error' : success ? 'success' : 'warning'
  const title   = caught ? 'Pris !' : success ? 'Succès !' : 'Échec.'
  const message = success
    ? (action.successMessage ?? "Action accomplie.")
    : (action.failMessage    ?? (caught ? "Vous avez été pris." : "L'action a échoué."))

  return (
    <>
      <DialogContent sx={{ py: 4, textAlign: 'center' }}>
        <MaterialIcon icon={icon} sx={{ fontSize: '3rem', color: `${color}.main`, mb: 2 }} />
        <Typography variant="h6" sx={{ mb: 1 }}>{title}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 2 }}>
          {message}
        </Typography>

        {result.gold > 0 && (
          <Typography variant="h5" sx={{ fontFamily: '"Noto Serif", serif', color: 'warning.dark', mb: 1 }}>
            +{result.gold}g
          </Typography>
        )}
        {result.item && (
          <Chip
            label={ITEM_TYPES[result.item]?.label ?? result.item}
            icon={<MaterialIcon icon={ITEM_TYPES[result.item]?.icon ?? 'inventory_2'} sx={{ fontSize: '1rem !important', ml: '8px !important' }} />}
            color="secondary"
            sx={{ mb: 1 }}
          />
        )}
        {result.effects && (
          <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 0.5 }}>
            {result.effects.reputation !== undefined && <EffectChip icon="star"         label="Rép."  value={result.effects.reputation} />}
            {result.effects.forme      !== undefined && <EffectChip icon="favorite"     label="Forme" value={result.effects.forme} />}
            {result.effects.faim       !== undefined && <EffectChip icon="lunch_dining" label="Faim"  value={result.effects.faim} />}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
        <Button variant="contained" onClick={onClose}>Fermer</Button>
      </DialogActions>
    </>
  )
}

// ─── Dialog principal ─────────────────────────────────────────────────────────

export default function ActionDialog({ action, open, onClose, onSuccessCallback }) {
  const { state, actions } = useKrat()
  const [result, setResult] = useState(null)

  useEffect(() => { if (open) setResult(null) }, [open])

  if (!action) return null

  const isFormMode = !!action.form

  function handleRoll(effectiveChance) {
    const success = Math.random() < effectiveChance
    if (success) {
      const reward = action.reward ?? {}
      const gold   = reward.gold
        ? Math.floor(Math.random() * (reward.gold.max - reward.gold.min + 1)) + reward.gold.min
        : 0
      actions.applyEffects({ gold, item: reward.item ?? null, ...(action.onSuccess ?? {}) })
      onSuccessCallback?.()
      setResult({ success: true, gold, item: reward.item ?? null, effects: action.onSuccess })
    } else {
      actions.applyEffects(action.onFailure ?? {})
      setResult({ success: false, caught: action.illegal, effects: action.onFailure })
    }
  }

  async function handleFormSubmit(values) {
    if (action.pbCollection) {
      await pb.collection(action.pbCollection).create({
        type:       action.newsType ?? 'misc',
        text:       values.text   ?? '',
        target:     values.target ?? '',
        authorId:   state.player.id,
        authorName: state.player.name,
      }).catch(() => {})
    }
    actions.applyEffects(action.onSuccess ?? {})
    setResult({ success: true, effects: action.onSuccess })
  }

  return (
    <Dialog open={open} onClose={result ? onClose : undefined} maxWidth="xs" fullWidth>

      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <MaterialIcon icon={action.icon} sx={{ fontSize: '1.5rem', color: action.illegal ? 'error.main' : 'primary.main' }} />
          <Box>
            <Typography variant="h6" sx={{ lineHeight: 1.2 }}>{action.label}</Typography>
            {action.illegal && (
              <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.6rem', letterSpacing: '0.05em' }}>
                Action illégale
              </Typography>
            )}
          </Box>
        </Box>
      </DialogTitle>

      <Divider />

      {result ? (
        <ResultScreen action={action} result={result} onClose={onClose} />
      ) : isFormMode ? (
        <FormPanel action={action} onSubmit={handleFormSubmit} onClose={onClose} />
      ) : (
        <RollPanel action={action} player={state.player} onExecute={handleRoll} onClose={onClose} />
      )}
    </Dialog>
  )
}
