/**
 * PlayerProfileDialog — Édition du profil joueur.
 *
 * Sections :
 *  - Points Divins : barre + Prière (1PD → +5 tout)
 *  - Identité      : édition avatar URL
 *  - Statistiques  : boost de stat (1PD / +1)
 *  - Compétences   : acquises + acquisition (coût N² PD)
 */
import { useState }      from 'react'
import Dialog            from '@mui/material/Dialog'
import DialogTitle       from '@mui/material/DialogTitle'
import DialogContent     from '@mui/material/DialogContent'
import DialogActions     from '@mui/material/DialogActions'
import Box               from '@mui/material/Box'
import Typography        from '@mui/material/Typography'
import Button            from '@mui/material/Button'
import IconButton        from '@mui/material/IconButton'
import TextField         from '@mui/material/TextField'
import LinearProgress    from '@mui/material/LinearProgress'
import Chip              from '@mui/material/Chip'
import Divider           from '@mui/material/Divider'
import Tooltip           from '@mui/material/Tooltip'
import Avatar            from '@mui/material/Avatar'
import MaterialIcon      from '../MaterialIcon'
import { useKrat }       from '../../context/KratContext'
import { COMPETENCES }   from '../../data/catalog'

// ─── Titre de section ─────────────────────────────────────────────────────────

function SectionTitle({ children }) {
  return (
    <Typography variant="overline" sx={{
      fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em',
      color: 'text.disabled', display: 'block', mb: 1,
    }}>
      {children}
    </Typography>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function PlayerProfileDialog({ open, onClose }) {
  const { state, actions } = useKrat()
  const { player } = state

  const [avatarInput,   setAvatarInput]   = useState(player.avatarUrl ?? '')
  const [selectedComp,  setSelectedComp]  = useState(null)
  const [prayFeedback,  setPrayFeedback]  = useState(false)

  const pd         = player.stats.pointsDivins ?? { current: 0, max: 20 }
  const pdPct      = Math.round((pd.current / pd.max) * 100)
  const competences = player.stats.competences ?? {}
  const nbComp     = Object.keys(competences).length
  const nextCost   = nbComp === 0 ? 0 : nbComp * nbComp
  const ownedKeys  = new Set(Object.keys(competences))
  const available  = Object.entries(COMPETENCES).filter(([k]) => !ownedKeys.has(k))

  const STATS = [
    { key: 'force',        label: 'Force',        icon: 'fitness_center'    },
    { key: 'intelligence', label: 'Intelligence',  icon: 'psychology'        },
    { key: 'charisme',     label: 'Charisme',      icon: 'record_voice_over' },
  ]

  function handlePray() {
    if (pd.current < 1) return
    actions.applyEffects({ pointsDivins: -1, forme: 5, faim: 5, reputation: 5 })
    setPrayFeedback(true)
    setTimeout(() => setPrayFeedback(false), 2000)
  }

  function handleBoost(stat) {
    actions.boostStat(stat)
  }

  function handleAcquire() {
    if (!selectedComp) return
    actions.acquireCompetence(selectedComp)
    setSelectedComp(null)
  }

  function handleSaveAvatar() {
    actions.updateAvatar(avatarInput.trim())
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}>

      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar src={player.avatarUrl} alt={player.name}
            sx={{ width: 40, height: 40, borderRadius: 2 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ lineHeight: 1.2 }}>{player.name}</Typography>
            <Typography variant="caption" color="text.secondary">Fiche personnage</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <MaterialIcon icon="close" sx={{ fontSize: '1rem' }} />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>

        {/* ── Points Divins ─────────────────────────────────────────────────── */}
        <Box>
          <SectionTitle>✨ Points Divins</SectionTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#7b1fa2' }}>
              {pd.current} / {pd.max} PD
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.6rem' }}>
              Se régénère chaque nuit
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={pdPct}
            sx={{ height: 8, borderRadius: 4, mb: 1.5,
              bgcolor: 'rgba(123,31,162,0.1)',
              '& .MuiLinearProgress-bar': { bgcolor: '#9c27b0', borderRadius: 4 } }} />

          <Button
            variant={prayFeedback ? 'contained' : 'outlined'}
            color="secondary"
            size="small"
            disabled={pd.current < 1}
            onClick={handlePray}
            startIcon={<MaterialIcon icon="self_improvement" sx={{ fontSize: '1rem !important' }} />}
            sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 700, borderRadius: 2 }}
          >
            {prayFeedback ? '+5 Forme / Faim / Rép. !' : 'Prière (1 PD → +5 tout)'}
          </Button>
        </Box>

        <Divider />

        {/* ── Identité ─────────────────────────────────────────────────────── */}
        <Box>
          <SectionTitle>Identité</SectionTitle>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            <Avatar src={avatarInput || undefined} variant="rounded"
              sx={{ width: 48, height: 48, flexShrink: 0 }}>
              <MaterialIcon icon="person" />
            </Avatar>
            <TextField
              label="URL de l'avatar"
              size="small"
              fullWidth
              value={avatarInput}
              onChange={e => setAvatarInput(e.target.value)}
              placeholder="https://..."
            />
            <Button variant="contained" size="small" onClick={handleSaveAvatar}
              disabled={avatarInput.trim() === (player.avatarUrl ?? '')}
              sx={{ flexShrink: 0, fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 700 }}>
              OK
            </Button>
          </Box>
        </Box>

        <Divider />

        {/* ── Statistiques ──────────────────────────────────────────────────── */}
        <Box>
          <SectionTitle>Statistiques (1 PD = +1)</SectionTitle>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {STATS.map(({ key, label, icon }) => {
              const base    = player.stats[key] ?? 0
              const bonus   = player.stats.bonus?.[key] ?? 0
              const total   = base + bonus
              return (
                <Box key={key} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  py: 0.75, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 'none' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MaterialIcon icon={icon} sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                    <Typography variant="overline" sx={{ fontSize: '0.65rem', color: 'text.secondary', lineHeight: 1 }}>
                      {label}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography sx={{ fontFamily: '"Noto Serif", serif', fontWeight: 700, fontSize: '1rem' }}>
                      {total}
                    </Typography>
                    {bonus !== 0 && (
                      <Typography variant="caption" sx={{ color: bonus > 0 ? 'success.main' : 'error.main', fontWeight: 700 }}>
                        ({bonus > 0 ? '+' : ''}{bonus})
                      </Typography>
                    )}
                    <Tooltip title={pd.current < 1 ? 'PD insuffisants' : `+1 ${label} pour 1 PD`} arrow>
                      <span>
                        <IconButton size="small" disabled={pd.current < 1}
                          onClick={() => handleBoost(key)}
                          sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5,
                            '&:not(:disabled):hover': { bgcolor: 'primary.light', borderColor: 'primary.main' } }}>
                          <MaterialIcon icon="add" sx={{ fontSize: '0.85rem' }} />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                </Box>
              )
            })}
          </Box>
        </Box>

        <Divider />

        {/* ── Compétences ───────────────────────────────────────────────────── */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 1 }}>
            <SectionTitle>Compétences ({nbComp})</SectionTitle>
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.6rem' }}>
              Prochaine : {nextCost === 0 ? 'gratuite' : `${nextCost} PD`}
            </Typography>
          </Box>

          {/* Compétences acquises */}
          {nbComp > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
              {Object.keys(competences).map(key => {
                const def = COMPETENCES[key]
                if (!def) return null
                return (
                  <Chip key={key} size="small"
                    icon={<MaterialIcon icon={def.icon} sx={{ fontSize: '0.75rem !important' }} />}
                    label={def.label}
                    color="success" variant="outlined"
                    sx={{ fontSize: '0.65rem' }} />
                )
              })}
            </Box>
          )}

          {/* Compétences disponibles */}
          {available.length > 0 && (
            <>
              <Typography variant="caption" color="text.disabled"
                sx={{ fontSize: '0.6rem', display: 'block', mb: 1, fontStyle: 'italic' }}>
                Cliquer pour sélectionner :
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, maxHeight: 160, overflowY: 'auto' }}>
                {available.map(([key, def]) => {
                  const canAfford = pd.current >= nextCost
                  const isSelected = selectedComp === key
                  return (
                    <Chip key={key} size="small"
                      icon={<MaterialIcon icon={def.icon} sx={{ fontSize: '0.75rem !important' }} />}
                      label={def.label}
                      clickable={canAfford}
                      onClick={canAfford ? () => setSelectedComp(isSelected ? null : key) : undefined}
                      variant={isSelected ? 'filled' : 'outlined'}
                      color={isSelected ? 'secondary' : 'default'}
                      sx={{
                        fontSize: '0.65rem',
                        opacity: canAfford ? 1 : 0.4,
                        cursor: canAfford ? 'pointer' : 'not-allowed',
                      }} />
                  )
                })}
              </Box>

              {selectedComp && (
                <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ flexGrow: 1, fontStyle: 'italic', color: 'text.secondary' }}>
                    {COMPETENCES[selectedComp]?.label} — {nextCost === 0 ? 'gratuite' : `coûte ${nextCost} PD`}
                  </Typography>
                  <Button variant="contained" color="secondary" size="small"
                    onClick={handleAcquire}
                    sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 700, borderRadius: 2 }}>
                    Acquérir
                  </Button>
                </Box>
              )}
            </>
          )}
        </Box>

      </DialogContent>

      <DialogActions sx={{ px: 2.5, py: 1.5 }}>
        <Button onClick={onClose} color="inherit" sx={{ color: 'text.secondary' }}>Fermer</Button>
      </DialogActions>
    </Dialog>
  )
}
