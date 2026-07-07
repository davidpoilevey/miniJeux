import { useState, useEffect } from 'react'
import Dialog        from '@mui/material/Dialog'
import DialogTitle   from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Box           from '@mui/material/Box'
import Typography    from '@mui/material/Typography'
import Button        from '@mui/material/Button'
import Divider       from '@mui/material/Divider'
import Paper         from '@mui/material/Paper'
import MaterialIcon  from '../MaterialIcon'
import { useKrat }   from '../../context/KratContext'

// ─── Ligne de modificateur de chance ─────────────────────────────────────────

function BonusRow({ icon, label, bonus, active, locked }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, opacity: active ? 1 : 0.35 }}>
      <MaterialIcon icon={icon} sx={{ fontSize: '1rem', color: locked ? 'text.disabled' : 'primary.main', flexShrink: 0 }} />
      <Typography variant="body2" sx={{ flex: 1, fontSize: '0.82rem' }}>{label}</Typography>
      <Typography variant="body2" sx={{
        fontSize: '0.82rem', fontWeight: 700,
        color: active ? '#2e7d32' : 'text.disabled',
      }}>
        {active ? `+${bonus}%` : `+${bonus}%`}
      </Typography>
    </Box>
  )
}

// ─── Dialog principal ─────────────────────────────────────────────────────────

export default function EvasionDialog({ open, onClose }) {
  const { state, actions } = useKrat()
  const { player } = state
  const forme       = player.jauges.forme
  const competences = player.stats.competences ?? {}

  const [useBribery,    setUseBribery]    = useState(false)
  const [useMentalisme, setUseMentalisme] = useState(false)
  const [result,        setResult]        = useState(null) // null | { success }

  useEffect(() => {
    if (open) {
      setUseBribery(false)
      setUseMentalisme(false)
      setResult(null)
    }
  }, [open])

  const formeCost     = Math.max(1, Math.floor(forme.current / 2))
  const canBribe      = player.gold >= 50
  const hasMentalisme = !!competences.mentalisme
  const hasDiscretion = !!competences.discretion
  const hasSurvie     = !!competences.survie

  // ── Calcul des chances ───────────────────────────────────────────────────────
  const baseChance       = 20
  const formeBonus       = Math.round((forme.current / forme.max) * 15)
  const discBonus        = hasDiscretion ? 15 : 0
  const survieBonus      = hasSurvie     ? 10 : 0
  const briberyBonus     = useBribery    ? 25 : 0
  const mentalismeBonus  = useMentalisme ? 20 : 0
  const totalChance      = Math.min(95, baseChance + formeBonus + discBonus + survieBonus + briberyBonus + mentalismeBonus)

  function handleAttempt() {
    const success   = Math.random() * 100 < totalChance
    const goldCost  = useBribery ? -50 : 0
    if (success) {
      actions.escapeFromPrison(formeCost, goldCost)
    } else {
      actions.applyEffects({ forme: -formeCost, gold: goldCost })
    }
    setResult({ success })
  }

  return (
    <Dialog open={open} onClose={result ? onClose : undefined} maxWidth="xs" fullWidth>

      {/* ── Titre ── */}
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <MaterialIcon icon="directions_run" sx={{ fontSize: '1.6rem', color: 'primary.main' }} />
          <Box>
            <Typography variant="h6" sx={{ lineHeight: 1.2 }}>Tentative d'évasion</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
              Les barreaux semblent solides. Mais les gardes ont aussi des pauses café.
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ py: 2 }}>
        {result ? (
          /* ── Résultat ── */
          <Box sx={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 2, py: 2, textAlign: 'center',
          }}>
            <MaterialIcon
              icon={result.success ? 'check_circle' : 'cancel'}
              sx={{ fontSize: '3rem', color: result.success ? '#2e7d32' : '#c62828' }}
            />
            <Typography variant="h6" sx={{ color: result.success ? '#2e7d32' : '#c62828' }}>
              {result.success ? 'Évasion réussie !' : 'Tentative échouée'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
              {result.success
                ? "Dans la confusion, vous vous glissez hors de la cellule !"
                : "Le garde vous rattrape alors que vous franchissez la porte. Vous êtes épuisé."}
            </Typography>
          </Box>
        ) : (
          /* ── Préparation ── */
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

            {/* Coût */}
            <Paper variant="outlined" sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MaterialIcon icon="favorite" sx={{ fontSize: '1.1rem', color: '#984300' }} />
                <Typography variant="body2" sx={{ fontSize: '0.82rem' }}>
                  Coût en forme (quoi qu'il arrive)
                </Typography>
              </Box>
              <Typography sx={{ fontWeight: 700, color: '#984300', fontSize: '1rem', fontFamily: '"Noto Serif", serif' }}>
                -{formeCost}
              </Typography>
            </Paper>

            {/* Chances */}
            <Box>
              <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                Chances de réussite
              </Typography>
              <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                <BonusRow icon="casino"           label="Base"                    bonus={baseChance}   active />
                <BonusRow icon="favorite"         label={`Forme (${forme.current}/${forme.max})`} bonus={formeBonus}  active={formeBonus > 0} />
                <BonusRow icon="visibility_off"   label="Discrétion"              bonus={discBonus}    active={hasDiscretion}  locked={!hasDiscretion} />
                <BonusRow icon="forest"           label="Survie"                  bonus={survieBonus}  active={hasSurvie}      locked={!hasSurvie} />
                <BonusRow icon="payments"         label="Graisser la patte (50g)" bonus={briberyBonus} active={useBribery}     />
                <BonusRow icon="psychology_alt"   label="Hypnotiser le gardien"   bonus={mentalismeBonus} active={useMentalisme} />
                <Divider sx={{ my: 0.5 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.82rem' }}>Total</Typography>
                  <Typography sx={{
                    fontWeight: 700, fontSize: '1.3rem', fontFamily: '"Noto Serif", serif',
                    color: totalChance >= 60 ? '#2e7d32' : totalChance >= 35 ? 'warning.dark' : 'error.main',
                  }}>
                    {totalChance}%
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Options */}
            <Box>
              <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                Options supplémentaires
              </Typography>
              <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>

                {/* Graisser la patte */}
                <Paper
                  variant="outlined"
                  onClick={() => canBribe && setUseBribery(v => !v)}
                  sx={{
                    px: 1.5, py: 1.2,
                    cursor:      canBribe ? 'pointer' : 'not-allowed',
                    opacity:     canBribe ? 1 : 0.45,
                    borderColor: useBribery ? 'primary.main' : 'divider',
                    borderWidth: useBribery ? 2 : 1,
                    bgcolor:     useBribery ? 'rgba(152,67,0,0.06)' : 'background.default',
                    transition:  'all 0.15s',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MaterialIcon icon={useBribery ? 'check_box' : 'check_box_outline_blank'} sx={{ fontSize: '1.1rem', color: useBribery ? 'primary.main' : 'text.disabled' }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.82rem' }}>
                        Graisser la patte du gardien
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        Coûte 50g · +25% de chances
                        {!canBribe && ' · Fonds insuffisants'}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>

                {/* Hypnotiser */}
                <Paper
                  variant="outlined"
                  onClick={() => hasMentalisme && setUseMentalisme(v => !v)}
                  sx={{
                    px: 1.5, py: 1.2,
                    cursor:      hasMentalisme ? 'pointer' : 'not-allowed',
                    opacity:     hasMentalisme ? 1 : 0.45,
                    borderColor: useMentalisme ? 'primary.main' : 'divider',
                    borderWidth: useMentalisme ? 2 : 1,
                    bgcolor:     useMentalisme ? 'rgba(152,67,0,0.06)' : 'background.default',
                    transition:  'all 0.15s',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MaterialIcon icon={useMentalisme ? 'check_box' : 'check_box_outline_blank'} sx={{ fontSize: '1.1rem', color: useMentalisme ? 'primary.main' : 'text.disabled' }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.82rem' }}>
                        Hypnotiser le gardien
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        {hasMentalisme ? 'Compétence Mentalisme · +20% de chances' : 'Requiert la compétence Mentalisme'}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>

              </Box>
            </Box>

          </Box>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
        {result ? (
          <Button variant="contained" onClick={onClose} fullWidth>
            Fermer
          </Button>
        ) : (
          <>
            <Button onClick={onClose} color="inherit" sx={{ color: 'text.secondary' }}>
              Annuler
            </Button>
            <Button
              variant="contained"
              onClick={handleAttempt}
              startIcon={<MaterialIcon icon="directions_run" sx={{ fontSize: '1rem !important' }} />}
              sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 700 }}
            >
              Tenter ({totalChance}%)
            </Button>
          </>
        )}
      </DialogActions>

    </Dialog>
  )
}
