/**
 * CharacterDialog — Interactions avec un personnage (PNJ ou joueur).
 *
 * Actions disponibles :
 *  - Parler    : form texte libre → kratNews
 *  - Séduire   : jet de charisme → gain d'or
 *  - Dérober   : jet d'intelligence → gain d'or/objet (illégal)
 *  - Attaquer  : lance startCombat
 */
import { useState }       from 'react'
import Dialog             from '@mui/material/Dialog'
import DialogTitle        from '@mui/material/DialogTitle'
import DialogContent      from '@mui/material/DialogContent'
import DialogActions      from '@mui/material/DialogActions'
import Box                from '@mui/material/Box'
import Typography         from '@mui/material/Typography'
import Button             from '@mui/material/Button'
import Grid               from '@mui/material/Grid'
import Chip               from '@mui/material/Chip'
import LinearProgress     from '@mui/material/LinearProgress'
import TextField          from '@mui/material/TextField'
import Divider            from '@mui/material/Divider'
import MaterialIcon       from '../MaterialIcon'
import { useKrat }        from '../../context/KratContext'
import { HIRE_COST_BY_ROLE, HIRE_COST_DEFAULT, ITEM_TYPES } from '../../data/catalog'
import { pb }             from '../../services/pb'

// ─── Config des actions ───────────────────────────────────────────────────────

const ACTIONS = [
  {
    id: 'parler', label: 'Parler', icon: 'chat_bubble', muiColor: 'primary',
    type: 'form',
    description: 'Engager la conversation — visible dans le Journal.',
    formLabel: 'Votre message', formMultiline: true,
  },
  {
    id: 'seduire', label: 'Séduire', icon: 'favorite', muiColor: 'secondary',
    type: 'roll', stat: 'charisme', baseChance: 0.40,
    description: 'Charmer la personne pour obtenir quelques pièces.',
    reward: { gold: { min: 3, max: 15 } },
    successMessage: 'Irrésistible ! Quelques pièces changent de mains.',
    failMessage: "Votre charme n'a pas suffi...",
  },
  {
    id: 'derober', label: 'Dérober', icon: 'backpack', muiColor: 'warning',
    type: 'roll', stat: 'intelligence', baseChance: 0.30, illegal: true,
    description: 'Subtiliser discrètement de l\'or ou un objet.',
    reward: { gold: { min: 1, max: 8 } },
    successMessage: 'Vos mains sont plus rapides que ses yeux !',
    failMessage: 'Pris sur le fait ! −1 Réputation.',
    onFailure: { reputation: -1 },
  },
  {
    id: 'attaquer', label: 'Attaquer', icon: 'swords', muiColor: 'error',
    type: 'combat', illegal: true,
    description: 'Engager le combat.',
  },
  {
    id: 'embaucher', label: 'Embaucher', icon: 'handshake', muiColor: 'success',
    type: 'hire',
    description: 'Engager ce personnage dans votre groupe.',
    pnjActionRequired: 'Embaucher',
  },
  {
    id: 'commercer', label: 'Commercer', icon: 'storefront', muiColor: 'warning',
    type: 'commerce',
    description: 'Parcourir la marchandise disponible.',
    pnjActionRequired: 'Commercer',
  },
  {
    id: 'mission', label: 'Mission', icon: 'assignment', muiColor: 'info',
    type: 'mission',
    description: 'Écouter ce que ce personnage a à proposer.',
    pnjActionRequired: 'Mission',
  },
]

// ─── Menu principal ───────────────────────────────────────────────────────────

function CharMenu({ target, groupe, onSelect, onClose }) {
  const emoji = target._type === 'player' ? '👤' : '🧑'
  const alreadyHired = groupe?.some(m => m.id === target.id)

  const visibleActions = ACTIONS.filter(act => {
    if (act.pnjActionRequired && act.pnjActionRequired !== target.action) return false
    return true
  })

  return (
    <>
      <DialogContent sx={{ pt: 1 }}>
        {/* Info cible */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5,
          p: 1.5, bgcolor: 'rgba(0,0,0,0.03)', borderRadius: 2 }}>
          {target.avatarUrl ? (
            <Box component="img" src={target.avatarUrl} alt={target.name}
              sx={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <Typography sx={{ fontSize: '2rem', lineHeight: 1 }}>{emoji}</Typography>
          )}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {target.name}
            </Typography>
            {target.role && (
              <Typography variant="caption" color="text.secondary">{target.role}</Typography>
            )}
            {alreadyHired && (
              <Chip size="small" color="success" label="Dans votre groupe"
                sx={{ mt: 0.5, fontSize: '0.6rem', height: 18 }} />
            )}
          </Box>
        </Box>

        {/* Boutons d'action */}
        <Grid container spacing={1}>
          {visibleActions.map(act => (
            <Grid item xs={6} key={act.id}>
              <Button
                variant={act.id === 'attaquer' ? 'contained' : 'outlined'}
                color={act.muiColor}
                fullWidth
                disabled={act.id === 'embaucher' && alreadyHired}
                onClick={() => onSelect(act)}
                sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, py: 1.5,
                  fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 700,
                  fontSize: '0.72rem', borderRadius: 2 }}
              >
                <MaterialIcon icon={act.icon} sx={{ fontSize: '1.3rem !important' }} />
                {act.label}
                {act.illegal && (
                  <Typography variant="caption" sx={{ fontSize: '0.58rem', color: 'error.main',
                    fontWeight: 700, lineHeight: 1 }}>
                    illégal
                  </Typography>
                )}
              </Button>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 2.5, py: 1.5 }}>
        <Button onClick={onClose} color="inherit" sx={{ color: 'text.secondary' }}>Fermer</Button>
      </DialogActions>
    </>
  )
}

// ─── Panel embauche ───────────────────────────────────────────────────────────

function HirePanel({ target, player, onHire, onBack }) {
  const cost = HIRE_COST_BY_ROLE[target.role?.toLowerCase()] ?? HIRE_COST_DEFAULT
  const canAfford = player.gold >= cost
  const npcStats = typeof target.stats === 'string' ? JSON.parse(target.stats) : (target.stats ?? {})

  return (
    <>
      <DialogContent sx={{ pt: 1 }}>
        <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic', color: 'text.secondary' }}>
          Engager ce personnage dans votre groupe. Il vous suivra partout et combattra à vos côtés.
        </Typography>

        <Box sx={{ p: 1.5, bgcolor: 'rgba(0,0,0,0.03)', borderRadius: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">Rôle</Typography>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{target.role || '—'}</Typography>
          </Box>
          {Object.entries({ Force: npcStats.force, Intelligence: npcStats.intelligence, Charisme: npcStats.charisme })
            .filter(([, v]) => v !== undefined)
            .map(([label, val]) => (
              <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                <Typography variant="caption" color="text.secondary">{label}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>{val}</Typography>
              </Box>
            ))
          }
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          p: 1.5, border: '1px solid', borderColor: canAfford ? 'success.light' : 'error.light',
          borderRadius: 2, bgcolor: canAfford ? 'rgba(46,125,50,0.05)' : 'rgba(198,40,40,0.05)' }}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>Coût d'embauche</Typography>
            <Typography variant="caption" color="text.secondary">Votre or : {player.gold}g</Typography>
          </Box>
          <Typography variant="h5" sx={{ fontFamily: '"Noto Serif", serif',
            color: canAfford ? 'warning.dark' : 'error.main', fontWeight: 700 }}>
            {cost}g
          </Typography>
        </Box>

        {!canAfford && (
          <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
            Fonds insuffisants.
          </Typography>
        )}
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
        <Button onClick={onBack} color="inherit" sx={{ color: 'text.secondary' }}>Retour</Button>
        <Button variant="contained" color="success" disabled={!canAfford}
          onClick={() => onHire(cost)}
          startIcon={<MaterialIcon icon="handshake" sx={{ fontSize: '1rem !important' }} />}
          sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 700 }}>
          Engager pour {cost}g
        </Button>
      </DialogActions>
    </>
  )
}

// ─── Panel roll ───────────────────────────────────────────────────────────────

function RollPanel({ action, player, onExecute, onBack }) {
  const totalStat   = (player.stats?.[action.stat] ?? 5) + (player.stats?.bonus?.[action.stat] ?? 0)
  const bonus       = (totalStat - 5) * 0.05
  const effectChance = Math.min(0.95, Math.max(0.05, action.baseChance + bonus))
  const pct         = Math.round(effectChance * 100)
  const barColor    = pct >= 60 ? 'success' : pct >= 40 ? 'warning' : 'error'
  const reward      = action.reward?.gold
  return (
    <>
      <DialogContent sx={{ pt: 1 }}>
        {action.description && (
          <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic', color: 'text.secondary' }}>
            {action.description}
          </Typography>
        )}

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem',
              textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Chance de réussite
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.75rem', color: `${barColor}.main` }}>
              {pct}%
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={pct} color={barColor}
            sx={{ height: 6, borderRadius: 3 }} />
        </Box>

        {bonus !== 0 && (
          <Chip size="small" color="success" variant="outlined"
            label={`${action.stat} : ${bonus > 0 ? '+' : ''}${Math.round(bonus * 100)}%`}
            sx={{ mb: 1.5, fontSize: '0.68rem' }} />
        )}

        {reward && (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            <Chip size="small" icon={<MaterialIcon icon="payments" sx={{ fontSize: '0.85rem !important' }} />}
              label={`Gain possible : +${reward.min} à ${reward.max}g`}
              sx={{ fontSize: '0.68rem', bgcolor: 'rgba(0,0,0,0.04)', color: '#f9a825', fontWeight: 600 }} />
          </Box>
        )}
        {action.onFailure?.reputation && (
          <Chip size="small" icon={<MaterialIcon icon="star" sx={{ fontSize: '0.85rem !important' }} />}
            label={`Échec : ${action.onFailure.reputation} Rép.`}
            sx={{ mt: 0.5, fontSize: '0.68rem', bgcolor: 'rgba(0,0,0,0.04)', color: '#c62828', fontWeight: 600 }} />
        )}
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
        <Button onClick={onBack} color="inherit" sx={{ color: 'text.secondary' }}>Retour</Button>
        <Button variant="contained" color={action.muiColor}
          onClick={() => onExecute(effectChance)}
          startIcon={<MaterialIcon icon={action.icon} sx={{ fontSize: '1rem !important' }} />}
          sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 700 }}>
          Tenter le coup
        </Button>
      </DialogActions>
    </>
  )
}

// ─── Panel form (Parler) ──────────────────────────────────────────────────────

function FormPanel({ action, onSubmit, onBack }) {
  const [text, setText] = useState('')
  return (
    <>
      <DialogContent sx={{ pt: 1 }}>
        {action.description && (
          <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic', color: 'text.secondary' }}>
            {action.description}
          </Typography>
        )}
        <TextField
          label={action.formLabel ?? 'Message'}
          fullWidth size="small"
          multiline={action.formMultiline ?? false}
          rows={action.formMultiline ? 3 : 1}
          value={text}
          onChange={e => setText(e.target.value)}
        />
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
        <Button onClick={onBack} color="inherit" sx={{ color: 'text.secondary' }}>Retour</Button>
        <Button variant="contained" color="primary" disabled={!text.trim()}
          onClick={() => onSubmit(text.trim())}
          startIcon={<MaterialIcon icon="send" sx={{ fontSize: '1rem !important' }} />}
          sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 700 }}>
          Envoyer
        </Button>
      </DialogActions>
    </>
  )
}

// ─── Panel commerce ───────────────────────────────────────────────────────────

function CommercePanel({ target, player, onBuy, onTrade, onBack }) {
  const [acquired, setAcquired] = useState({})
  const shopItems = Array.isArray(target.shop) ? target.shop : []
  const inventaire = player.inventaire ?? []

  function hasItem(typeId) {
    return inventaire.some(s => s.typeId === typeId && s.qty > 0)
  }

  function doBuy(item) {
    onBuy(item.typeId, item.price)
    setAcquired(prev => ({ ...prev, [item.typeId]: true }))
  }

  function doTrade(item) {
    onTrade(item.typeId, item.tradeFor, item.price ?? 0)
    setAcquired(prev => ({ ...prev, [item.typeId]: true }))
  }

  return (
    <>
      <DialogContent sx={{ pt: 1 }}>
        {target.mission?.intro && (
          <Box sx={{ mb: 2, p: 1.5, bgcolor: 'rgba(0,0,0,0.03)', borderRadius: 2,
            borderLeft: '3px solid', borderColor: 'warning.light' }}>
            <Typography variant="body2" sx={{ fontStyle: 'italic', lineHeight: 1.7, color: 'text.secondary' }}>
              « {target.mission.intro} »
            </Typography>
          </Box>
        )}
        {shopItems.length === 0 ? (
          <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic', py: 1 }}>
            Ce marchand n'a rien à proposer pour l'instant.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {shopItems.map((item, i) => {
              const def         = ITEM_TYPES[item.typeId]
              if (!def) return null
              const tradeForDef = item.tradeFor ? ITEM_TYPES[item.tradeFor] : null
              const hasTradeItem = item.tradeFor ? hasItem(item.tradeFor) : false
              const isTradeOnly  = item.tradeFor && item.price == null
              const isBoth       = item.tradeFor && item.price != null
              const isGoldOnly   = !item.tradeFor && item.price != null
              const canBuy   = isGoldOnly && player.gold >= item.price
              const canTrade = (isTradeOnly || isBoth) && hasTradeItem && (item.price == null || player.gold >= item.price)
              const done = acquired[item.typeId] ?? false
              return (
                <Box key={i} sx={{
                  p: 1.5, borderRadius: 2, border: '1px solid',
                  borderColor: done ? 'success.light' : 'divider',
                  bgcolor: done ? 'rgba(46,125,50,0.05)' : 'transparent',
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                    <MaterialIcon icon={def.icon} sx={{ fontSize: '1.1rem', color: 'primary.main' }} />
                    <Typography variant="subtitle2" sx={{ flexGrow: 1, fontSize: '0.82rem' }}>{def.label}</Typography>
                    {done && (
                      <Chip size="small" color="success" label="Acquis !" sx={{ fontSize: '0.6rem', height: 18 }} />
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center' }}>
                    {item.price != null && (
                      <Chip size="small"
                        icon={<MaterialIcon icon="payments" sx={{ fontSize: '0.85rem !important' }} />}
                        label={`${item.price}g`}
                        sx={{ fontSize: '0.68rem', color: 'warning.dark', fontWeight: 600 }} />
                    )}
                    {tradeForDef && (
                      <Chip size="small"
                        icon={<MaterialIcon icon={tradeForDef.icon} sx={{ fontSize: '0.85rem !important' }} />}
                        label={`Contre : ${tradeForDef.label}`}
                        sx={{ fontSize: '0.68rem', color: hasTradeItem ? 'text.primary' : 'text.disabled' }} />
                    )}
                    <Box sx={{ ml: 'auto' }}>
                      {(isTradeOnly || isBoth) ? (
                        <Button size="small" variant="outlined" color="warning"
                          disabled={!canTrade || done}
                          onClick={() => doTrade(item)}
                          sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 700, fontSize: '0.7rem' }}>
                          Échanger
                        </Button>
                      ) : (
                        <Button size="small" variant="outlined" color="warning"
                          disabled={!canBuy || done}
                          onClick={() => doBuy(item)}
                          sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 700, fontSize: '0.7rem' }}>
                          Acheter
                        </Button>
                      )}
                    </Box>
                  </Box>
                  {tradeForDef && !hasTradeItem && (
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.6rem', display: 'block', mt: 0.5 }}>
                      Vous n'avez pas : {tradeForDef.label}
                    </Typography>
                  )}
                </Box>
              )
            })}
          </Box>
        )}
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 2.5, py: 1.5 }}>
        <Button onClick={onBack} color="inherit" sx={{ color: 'text.secondary' }}>Retour</Button>
      </DialogActions>
    </>
  )
}

// ─── Panel mission ────────────────────────────────────────────────────────────

function MissionPanel({ target, onBack, onClose }) {
  const raw       = typeof target.mission === 'string' ? JSON.parse(target.mission) : target.mission
  const mission   = raw ?? {}
  const intro     = mission.intro     ?? ''
  const questions = Array.isArray(mission.questions) ? mission.questions : []
  const options   = Array.isArray(mission.options)   ? mission.options   : []
  const [hint, setHint] = useState(null)

  const isEmpty = !intro && questions.length === 0 && options.length === 0

  return (
    <>
      <DialogContent sx={{ pt: 1 }}>
        {isEmpty ? (
          <Typography variant="body2" color="text.disabled"
            sx={{ fontStyle: 'italic', py: 2, textAlign: 'center' }}>
            Mission non configurée (champ <code>mission</code> vide dans PocketBase).
          </Typography>
        ) : null}
        {intro && (
          <Box sx={{ mb: 2, p: 1.5, bgcolor: 'rgba(0,0,0,0.03)', borderRadius: 2,
            borderLeft: '3px solid', borderColor: 'primary.light' }}>
            <Typography variant="body2" sx={{ fontStyle: 'italic', lineHeight: 1.7, color: 'text.primary' }}>
              « {intro} »
            </Typography>
          </Box>
        )}
        {questions.map((q, i) => (
          <Typography key={i} variant="body2"
            sx={{ color: 'text.secondary', fontStyle: 'italic', mb: 0.75, pl: 1 }}>
            — {q}
          </Typography>
        ))}

        {hint !== null ? (
          <Box sx={{ mt: 2, p: 1.5, bgcolor: 'rgba(33,150,243,0.06)', borderRadius: 2,
            border: '1px solid rgba(33,150,243,0.2)' }}>
            <Typography variant="body2" sx={{ color: 'info.dark', lineHeight: 1.7 }}>
              {hint || '...'}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {options.map((opt, i) => (
              <Button key={i} variant="outlined" color="primary" fullWidth
                onClick={() => setHint(opt.hint ?? '')}
                sx={{ justifyContent: 'flex-start', fontFamily: '"Plus Jakarta Sans", sans-serif',
                  fontWeight: 500, fontSize: '0.78rem', textAlign: 'left', py: 1 }}>
                {opt.label}
              </Button>
            ))}
          </Box>
        )}
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
        <Button onClick={onBack} color="inherit" sx={{ color: 'text.secondary' }}>Retour</Button>
        {hint !== null && (
          <Button variant="contained" onClick={onClose}>Compris</Button>
        )}
      </DialogActions>
    </>
  )
}

// ─── Écran résultat ───────────────────────────────────────────────────────────

function ResultScreen({ action, result, onClose }) {
  const success = result.success
  const icon  = success ? 'check_circle' : 'cancel'
  const color = success ? 'success'      : 'warning'
  const title = success ? 'Succès !'     : 'Échec.'
  const msg   = result.hired
    ? 'Bienvenue dans le groupe ! Ce personnage vous suivra désormais.'
    : success ? (action.successMessage ?? 'Action accomplie.')
              : (action.failMessage    ?? "L'action a échoué.")
  return (
    <>
      <DialogContent sx={{ py: 4, textAlign: 'center' }}>
        <MaterialIcon icon={icon} sx={{ fontSize: '3rem', color: `${color}.main`, mb: 2 }} />
        <Typography variant="h6" sx={{ mb: 1 }}>{title}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 2 }}>
          {msg}
        </Typography>
        {result.gold > 0 && (
          <Typography variant="h5" sx={{ fontFamily: '"Noto Serif", serif', color: 'warning.dark', mb: 1 }}>
            +{result.gold}g
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
        <Button variant="contained" onClick={onClose}>Fermer</Button>
      </DialogActions>
    </>
  )
}

// ─── Dialog principal ─────────────────────────────────────────────────────────

export default function CharacterDialog({ target, open, onClose }) {
  const { state, actions } = useKrat()
  const [selectedAction, setSelectedAction] = useState(null)
  const [result, setResult]                 = useState(null)

  function reset() { setSelectedAction(null); setResult(null) }
  function handleClose() { reset(); onClose() }

  function handleSelect(act) {
    if (act.type === 'combat') {
      actions.startCombat(target)
      handleClose()
      return
    }
    setSelectedAction(act)
  }

  function handleHire(cost) {
    actions.hireNpc(target, cost)
    setResult({ success: true, hired: true })
  }

  function handleBuy(itemKey, price) {
    actions.buyItem(itemKey, price)
  }

  function handleTrade(typeIdToGet, tradeForTypeId, goldCost) {
    actions.tradeItem(typeIdToGet, tradeForTypeId, goldCost)
  }

  function handleRoll(effectChance) {
    const success = Math.random() < effectChance
    if (success) {
      const reward = selectedAction.reward?.gold ?? { min: 0, max: 0 }
      const gold   = Math.floor(Math.random() * (reward.max - reward.min + 1)) + reward.min
      if (gold > 0 || selectedAction.onSuccess) {
        actions.applyEffects({ gold, ...(selectedAction.onSuccess ?? {}) })
      }
      setResult({ success: true, gold })
    } else {
      if (selectedAction.onFailure) actions.applyEffects(selectedAction.onFailure)
      setResult({ success: false })
    }
  }

  async function handleForm(text) {
    await pb.collection('kratNews').create({
      type:       'parler',
      text,
      target:     target.name,
      authorId:   state.player.id,
      authorName: state.player.name,
    }).catch(() => {})
    setResult({ success: true })
  }

  if (!target) return null

  const title = selectedAction
    ? selectedAction.label
    : `${target._type === 'player' ? 'Joueur' : 'PNJ'} — ${target.name}`

  return (
    <Dialog open={open} onClose={result ? handleClose : undefined} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <MaterialIcon
            icon={selectedAction?.icon ?? (target._type === 'player' ? 'person' : 'smart_toy')}
            sx={{ fontSize: '1.5rem',
              color: selectedAction?.illegal ? 'error.main' : 'primary.main' }}
          />
          <Box>
            <Typography variant="h6" sx={{ lineHeight: 1.2 }}>{title}</Typography>
            {selectedAction?.illegal && (
              <Typography variant="caption"
                sx={{ color: 'error.main', fontWeight: 700, textTransform: 'uppercase',
                  fontSize: '0.6rem', letterSpacing: '0.05em' }}>
                Action illégale
              </Typography>
            )}
          </Box>
        </Box>
      </DialogTitle>
      <Divider />

      {result ? (
        <ResultScreen action={selectedAction} result={result} onClose={handleClose} />
      ) : selectedAction?.type === 'roll' ? (
        <RollPanel action={selectedAction} player={state.player}
          onExecute={handleRoll} onBack={reset} />
      ) : selectedAction?.type === 'form' ? (
        <FormPanel action={selectedAction} onSubmit={handleForm} onBack={reset} />
      ) : selectedAction?.type === 'hire' ? (
        <HirePanel target={target} player={state.player} onHire={handleHire} onBack={reset} />
      ) : selectedAction?.type === 'commerce' ? (
        <CommercePanel target={target} player={state.player}
          onBuy={handleBuy} onTrade={handleTrade} onBack={reset} />
      ) : selectedAction?.type === 'mission' ? (
        <MissionPanel target={target} onBack={reset} onClose={handleClose} />
      ) : (
        <CharMenu target={target} groupe={state.groupe} onSelect={handleSelect} onClose={handleClose} />
      )}
    </Dialog>
  )
}
