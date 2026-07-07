import { useState, useEffect }  from 'react'
import Dialog         from '@mui/material/Dialog'
import DialogTitle    from '@mui/material/DialogTitle'
import DialogContent  from '@mui/material/DialogContent'
import DialogActions  from '@mui/material/DialogActions'
import Box            from '@mui/material/Box'
import Typography     from '@mui/material/Typography'
import Button         from '@mui/material/Button'
import IconButton     from '@mui/material/IconButton'
import Chip           from '@mui/material/Chip'
import Divider        from '@mui/material/Divider'
import MaterialIcon   from '../MaterialIcon'
import { useKrat }    from '../../context/KratContext'
import { COMPETENCES } from '../../data/catalog'

// ─── Constantes ───────────────────────────────────────────────────────────────

const RARITY_META = {
  common:   { color: '#9e9e9e', label: 'Commun'     },
  uncommon: { color: '#1976d2', label: 'Peu commun' },
  rare:     { color: '#7b1fa2', label: 'Rare'       },
  epic:     { color: '#f9a825', label: 'Épique'     },
}

// Probabilité de base de réussir le marchandage selon la rareté
const MARCHANDER_PROBA = {
  common:   0.50,
  uncommon: 0.35,
  rare:     0.20,
  epic:     0.10,
}

// Réduction de prix en cas de succès
const DISCOUNT = 0.25

// Mapping effets → labels lisibles
const EFFECT_LABELS = {
  faim:              { label: 'Faim',          icon: 'lunch_dining',       color: '#825100' },
  forme:             { label: 'Forme',          icon: 'favorite',           color: '#984300' },
  reputation:        { label: 'Réputation',     icon: 'star',               color: '#944a23' },
  force:             { label: 'Force',          icon: 'fitness_center',     color: 'text.primary' },
  intelligence:      { label: 'Intelligence',   icon: 'psychology',         color: 'text.primary' },
  charisme:          { label: 'Charisme',       icon: 'record_voice_over',  color: 'text.primary' },
  bonusForce:        { label: 'Force',          icon: 'fitness_center',     color: '#2e7d32' },
  vitesse:        { label: 'Vitesse',          icon: 'fitness_center',     color: '#2e7d32' },
  bonusIntelligence: { label: 'Intelligence',   icon: 'psychology',         color: '#2e7d32' },
  bonusCharisme:     { label: 'Charisme',       icon: 'record_voice_over',  color: '#2e7d32' },
  perception:        { label: 'Perception',     icon: 'visibility',         color: 'text.primary' },
}

function EffectChips({ effects }) {
  if (!effects || !Object.keys(effects).length) return null
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
      {Object.entries(effects).map(([key, val]) => {
        if (key === 'competence') {
          const comp = COMPETENCES[val]
          return (
            <Chip
              key={key}
              size="small"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <MaterialIcon icon={comp?.icon ?? 'school'} sx={{ fontSize: '0.85rem' }} />
                  <span>Apprend : {comp?.label ?? val}</span>
                </Box>
              }
              sx={{ bgcolor: 'rgba(121,68,193,0.1)', color: '#7944c1', fontWeight: 600, fontSize: '0.7rem' }}
            />
          )
        }
        const meta = EFFECT_LABELS[key]
        if (!meta) return null
        const sign = val > 0 ? '+' : ''
        return (
          <Chip
            key={key}
            size="small"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <MaterialIcon icon={meta.icon} sx={{ fontSize: '0.85rem' }} />
                <span>{meta.label} {sign}{val}</span>
              </Box>
            }
            sx={{ bgcolor: 'rgba(0,0,0,0.05)', fontSize: '0.7rem', fontWeight: 600 }}
          />
        )
      })}
    </Box>
  )
}

// ─── Dialog principal ─────────────────────────────────────────────────────────

export default function AchatDialog({ item, open, onClose }) {
  const { state, actions } = useKrat()
  const { player }         = state

  const [currentPrice,     setCurrentPrice]     = useState(0)
  const [marchanderUsed,   setMarchanderUsed]   = useState(false)
  const [marchanderResult, setMarchanderResult] = useState(null) // null | 'success' | 'fail'
  const [qty,              setQty]              = useState(1)

  // Réinitialise à chaque ouverture
  useEffect(() => {
    if (open && item) {
      setCurrentPrice(item.prix)
      setMarchanderUsed(false)
      setMarchanderResult(null)
      setQty(1)
    }
  }, [open, item])

  if (!item) return null

  const rarity       = RARITY_META[item.rarete ?? 'common']
  const currentOwned = (player.inventaire ?? []).find(i => i.typeId === item.key)?.qty ?? 0
  const maxStack     = item.maxStack ?? 99
  const maxQty       = Math.max(1, maxStack - currentOwned)
  const totalPrice   = currentPrice * (item.stackable ? qty : 1)
  const canAfford    = player.gold >= totalPrice

  function handleMarchander() {
    const base    = MARCHANDER_PROBA[item.rarete ?? 'common']
    const bonus   = player.stats.competences?.marchandage ? 0.20 : 0
    const success = Math.random() < (base + bonus)
    setMarchanderUsed(true)
    if (success) {
      setCurrentPrice(Math.round(item.prix * (1 - DISCOUNT)))
      setMarchanderResult('success')
    } else {
      setMarchanderResult('fail')
    }
  }

  const alreadyOwned = !item.stackable && (player.inventaire ?? []).some(i => i.typeId === item.key)

  function handleBuy() {
    actions.buyItem(item.key, currentPrice, qty)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>

      {/* ── Titre ── */}
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <MaterialIcon icon={item.icon} sx={{ fontSize: '1.6rem', color: 'primary.main' }} />
          <Box>
            <Typography variant="h6" sx={{ lineHeight: 1.2 }}>{item.label}</Typography>
            <Typography variant="caption" sx={{ color: rarity.color, fontWeight: 700, textTransform: 'uppercase', fontSize: '0.6rem', letterSpacing: '0.06em' }}>
              {rarity.label}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

          {/* Effets */}
          {item.effects && Object.keys(item.effects).length > 0 && (
            <Box>
              <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                Effets
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <EffectChips effects={item.effects} />
              </Box>
            </Box>
          )}

          {/* Prix + quantité */}
          <Box sx={{
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'space-between',
            bgcolor:      'rgba(0,0,0,0.04)',
            borderRadius: 2,
            px: 2, py: 1.5,
          }}>
            <Box>
              <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.6rem', display: 'block' }}>
                Prix
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                {marchanderResult === 'success' && (
                  <Typography sx={{ fontSize: '0.9rem', color: 'text.disabled', textDecoration: 'line-through' }}>
                    {item.prix * qty}g
                  </Typography>
                )}
                <Typography sx={{ fontSize: '1.4rem', fontFamily: '"Noto Serif", serif', fontWeight: 700, color: canAfford ? 'warning.dark' : 'error.main' }}>
                  {totalPrice}g
                </Typography>
              </Box>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.6rem', display: 'block' }}>
                Votre or
              </Typography>
              <Typography sx={{ fontSize: '1rem', fontFamily: '"Noto Serif", serif', fontWeight: 700, color: canAfford ? 'text.primary' : 'error.main' }}>
                {player.gold.toLocaleString('fr-FR')}g
              </Typography>
            </Box>
          </Box>

          {/* Sélecteur de quantité (stackable uniquement) */}
          {item.stackable && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.6rem', flexShrink: 0 }}>
                Quantité
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5,
                border: '1px solid', borderColor: 'divider', borderRadius: 2, px: 0.5 }}>
                <IconButton size="small" onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}>
                  <MaterialIcon icon="remove" sx={{ fontSize: '1rem' }} />
                </IconButton>
                <Typography sx={{ minWidth: 28, textAlign: 'center', fontWeight: 700, fontSize: '0.95rem' }}>
                  {qty}
                </Typography>
                <IconButton size="small" onClick={() => setQty(q => Math.min(maxQty, q + 1))} disabled={qty >= maxQty}>
                  <MaterialIcon icon="add" sx={{ fontSize: '1rem' }} />
                </IconButton>
              </Box>
              {qty > 1 && (
                <Typography variant="caption" color="text.secondary">
                  {currentPrice}g × {qty}
                </Typography>
              )}
            </Box>
          )}

          {/* Résultat du marchandage */}
          {marchanderResult && (
            <Box sx={{
              display:    'flex',
              alignItems: 'center',
              gap:        1,
              px: 2, py: 1,
              borderRadius: 1,
              bgcolor:    marchanderResult === 'success' ? 'rgba(46,125,50,0.08)' : 'rgba(198,40,40,0.08)',
              border:     '1px solid',
              borderColor: marchanderResult === 'success' ? '#a5d6a7' : '#ef9a9a',
            }}>
              <MaterialIcon
                icon={marchanderResult === 'success' ? 'check_circle' : 'cancel'}
                sx={{ fontSize: '1rem', color: marchanderResult === 'success' ? '#2e7d32' : '#c62828' }}
              />
              <Typography variant="body2" sx={{ fontSize: '0.8rem', color: marchanderResult === 'success' ? '#2e7d32' : '#c62828' }}>
                {marchanderResult === 'success'
                  ? `Le marchand accepte ! Prix réduit de ${Math.round(DISCOUNT * 100)}%.`
                  : 'Le marchand refuse. Le prix est ferme.'}
              </Typography>
            </Box>
          )}

        </Box>
      </DialogContent>

      <Divider />

      {/* ── Actions ── */}
      <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
        <Button onClick={onClose} color="inherit" sx={{ color: 'text.secondary' }}>
          Annuler
        </Button>
        <Button
          onClick={handleMarchander}
          disabled={marchanderUsed}
          startIcon={<MaterialIcon icon="price_check" sx={{ fontSize: '1rem !important' }} />}
          sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 600 }}
        >
          Marchander
        </Button>
        <Button
          variant="contained"
          onClick={handleBuy}
          disabled={!canAfford || alreadyOwned}
          startIcon={<MaterialIcon icon={alreadyOwned ? 'block' : 'payments'} sx={{ fontSize: '1rem !important' }} />}
          sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 700 }}
        >
          {alreadyOwned ? 'Déjà possédé' : `Acheter ${totalPrice}g`}
        </Button>
      </DialogActions>

    </Dialog>
  )
}
