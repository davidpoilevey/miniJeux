import { useState, useEffect, useRef } from 'react'
import Dialog        from '@mui/material/Dialog'
import DialogTitle   from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Box           from '@mui/material/Box'
import Grid          from '@mui/material/Grid'
import Typography    from '@mui/material/Typography'
import Button        from '@mui/material/Button'
import IconButton    from '@mui/material/IconButton'
import TextField     from '@mui/material/TextField'
import Divider       from '@mui/material/Divider'
import MaterialIcon  from '../MaterialIcon'
import { useKrat }   from '../../context/KratContext'
import { pb }        from '../../services/pb'
import { ITEM_TYPES } from '../../data/catalog'

// ─── Compteur +/- ─────────────────────────────────────────────────────────────

function QtyControl({ value, max, onChange }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center',
      border: '1px solid', borderColor: 'divider', borderRadius: 1, flexShrink: 0 }}>
      <IconButton size="small" sx={{ p: 0.25 }}
        onClick={() => onChange(Math.max(1, value - 1))} disabled={value <= 1}>
        <MaterialIcon icon="remove" sx={{ fontSize: '0.75rem' }} />
      </IconButton>
      <Typography sx={{ minWidth: 22, textAlign: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
        {value}
      </Typography>
      <IconButton size="small" sx={{ p: 0.25 }}
        onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}>
        <MaterialIcon icon="add" sx={{ fontSize: '0.75rem' }} />
      </IconButton>
    </Box>
  )
}

// ─── Ligne item ───────────────────────────────────────────────────────────────

function ItemRow({ slot, qty, onQtyChange, actionLabel, onAction }) {
  const def = ITEM_TYPES[slot.typeId]
  if (!def) return null
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, p: 0.5, borderRadius: 1, bgcolor: 'background.paper' }}>
      <MaterialIcon icon={def.icon ?? 'inventory_2'} sx={{ fontSize: '0.9rem', color: 'text.secondary', flexShrink: 0 }} />
      <Typography variant="body2" noWrap sx={{ flex: 1, fontSize: '0.75rem' }}>
        {def.label} <Typography component="span" variant="caption" color="text.secondary">×{slot.qty}</Typography>
      </Typography>
      <QtyControl value={qty} max={slot.qty} onChange={onQtyChange} />
      <Button size="small" variant="outlined"
        sx={{ fontSize: '0.6rem', py: 0.25, px: 0.5, minWidth: 0, flexShrink: 0 }}
        onClick={() => onAction(slot.typeId, qty)}>
        {actionLabel}
      </Button>
    </Box>
  )
}

// ─── Ligne or (texte libre) ───────────────────────────────────────────────────

function GoldRow({ available, actionLabel, onAction }) {
  const [input, setInput] = useState('')
  const amount = Math.max(1, Math.min(available, parseInt(input) || 0))
  const valid  = parseInt(input) > 0 && parseInt(input) <= available

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, p: 0.5, borderRadius: 1,
      bgcolor: 'rgba(255,193,7,0.08)', border: '1px solid rgba(255,193,7,0.25)' }}>
      <Typography sx={{ flex: 1, fontSize: '0.75rem', fontWeight: 600, color: 'warning.dark' }}>
        💰 {available}g disponible
      </Typography>
      <TextField
        size="small" type="number" value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="qté"
        sx={{ width: 60 }}
        inputProps={{ min: 1, max: available, style: { padding: '2px 4px', fontSize: '0.75rem' } }}
      />
      <Button size="small" variant="outlined" color="warning"
        sx={{ fontSize: '0.6rem', py: 0.25, px: 0.5, minWidth: 0, flexShrink: 0 }}
        disabled={!valid}
        onClick={() => { onAction(amount); setInput('') }}>
        {actionLabel}
      </Button>
    </Box>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function CoffreDialog({ open, onClose, buildingId, isOwner }) {
  const { state, actions } = useKrat()
  const [chestItems,   setChestItems]   = useState([])
  const [loading,      setLoading]      = useState(false)
  const [forceResult,  setForceResult]  = useState(null)
  const [itemQtys,     setItemQtys]     = useState({}) // { typeId: qty }
  const [chestQtys,    setChestQtys]    = useState({})
  const forcedRef = useRef(false)

  const cityId = state.player.location.city ?? state.city?.id ?? ''
  const { player } = state

  useEffect(() => {
    if (!open) {
      setChestItems([]); setForceResult(null); forcedRef.current = false
      setItemQtys({}); setChestQtys({})
      return
    }
    if (!buildingId) return

    if (!isOwner && !forcedRef.current) {
      forcedRef.current = true
      const success = Math.random() < 0.50
      setForceResult(success ? 'success' : 'fail')
      if (!success) { actions.applyEffects({ reputation: -5 }); return }
    }

    setLoading(true)
    pb.collection('kratItems').getFullList({ requestKey: null })
      .then(recs => {
        setChestItems(recs.filter(r => {
          const loc = typeof r.location === 'string' ? JSON.parse(r.location) : (r.location ?? {})
          return loc.roomId === 'coffre' && loc.buildingId === buildingId
        }))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [open, buildingId])

  const canAccess = isOwner || forceResult === 'success'

  // Inventaire (sans l'item 'gold' qui ne doit pas y être)
  const playerItems  = (player.inventaire ?? []).filter(s => s.typeId !== 'gold')
  // Coffre : séparer l'or des items normaux
  const chestGoldRec = chestItems.find(r => r.typeId === 'gold')
  const chestGold    = chestGoldRec?.qty ?? 0
  const regularChest = chestItems.filter(r => r.typeId !== 'gold')

  const getItemQty  = (typeId) => itemQtys[typeId]  ?? 1
  const getChestQty = (typeId) => chestQtys[typeId] ?? 1

  // ─── Dépôt item ─────────────────────────────────────────────────────────────

  async function depositItem(typeId, qty) {
    const record = chestItems.find(r => r.typeId === typeId)
    try {
      if (record) {
        const updated = await pb.collection('kratItems').update(record.id, { qty: (record.qty ?? 0) + qty })
        setChestItems(prev => prev.map(r => r.id === record.id ? updated : r))
      } else {
        const created = await pb.collection('kratItems').create({
          typeId, qty,
          location: { city: cityId, roomId: 'coffre', buildingId },
        })
        setChestItems(prev => [...prev, created])
      }
      actions.dropItems(typeId, qty)
      setItemQtys(prev => ({ ...prev, [typeId]: 1 }))
    } catch(e) { console.error('depositItem:', e) }
  }

  // ─── Retrait item ────────────────────────────────────────────────────────────

  async function withdrawItem(typeId, qty) {
    const record = chestItems.find(r => r.typeId === typeId)
    if (!record) return
    const remaining = (record.qty ?? 1) - qty
    try {
      if (remaining > 0) {
        const updated = await pb.collection('kratItems').update(record.id, { qty: remaining })
        setChestItems(prev => prev.map(r => r.id === record.id ? updated : r))
      } else {
        await pb.collection('kratItems').delete(record.id)
        setChestItems(prev => prev.filter(r => r.id !== record.id))
      }
      actions.collectLoot({ [typeId]: qty })
      setChestQtys(prev => ({ ...prev, [typeId]: 1 }))
    } catch(e) { console.error('withdrawItem:', e) }
  }

  // ─── Dépôt or ────────────────────────────────────────────────────────────────

  async function depositGold(amount) {
    try {
      if (chestGoldRec) {
        const updated = await pb.collection('kratItems').update(chestGoldRec.id, { qty: chestGold + amount })
        setChestItems(prev => prev.map(r => r.id === chestGoldRec.id ? updated : r))
      } else {
        const created = await pb.collection('kratItems').create({
          typeId: 'gold', qty: amount,
          location: { city: cityId, roomId: 'coffre', buildingId },
        })
        setChestItems(prev => [...prev, created])
      }
      actions.applyEffects({ gold: -amount })
    } catch(e) { console.error('depositGold:', e) }
  }

  // ─── Retrait or ──────────────────────────────────────────────────────────────

  async function withdrawGold(amount) {
    if (!chestGoldRec) return
    const remaining = chestGold - amount
    try {
      if (remaining > 0) {
        const updated = await pb.collection('kratItems').update(chestGoldRec.id, { qty: remaining })
        setChestItems(prev => prev.map(r => r.id === chestGoldRec.id ? updated : r))
      } else {
        await pb.collection('kratItems').delete(chestGoldRec.id)
        setChestItems(prev => prev.filter(r => r.id !== chestGoldRec.id))
      }
      // Or → gold du joueur, PAS l'inventaire
      actions.applyEffects({ gold: amount })
    } catch(e) { console.error('withdrawGold:', e) }
  }

  // ─── Rendu ───────────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isOwner ? '🗝️ Votre coffre' : '🔓 Forcer le coffre'}</DialogTitle>

      <DialogContent dividers>

        {!isOwner && forceResult === 'fail' && (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="h5">💥 Échec !</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Le coffre résiste. −5 réputation.
            </Typography>
          </Box>
        )}

        {canAccess && loading && <Typography color="text.secondary">Chargement…</Typography>}

        {canAccess && !loading && (
          <Grid container spacing={1.5}>

            {/* ── Inventaire joueur ── */}
            <Grid item xs={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>📦 Mon inventaire</Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {playerItems.length === 0
                  ? <Typography variant="caption" color="text.disabled">Inventaire vide</Typography>
                  : playerItems.map(slot =>
                      <ItemRow
                        key={slot.typeId}
                        slot={slot}
                        qty={getItemQty(slot.typeId)}
                        onQtyChange={q => setItemQtys(prev => ({ ...prev, [slot.typeId]: q }))}
                        actionLabel="→"
                        onAction={depositItem}
                      />
                    )
                }
              </Box>

              {player.gold > 0 && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <GoldRow available={player.gold} actionLabel="→" onAction={depositGold} />
                </>
              )}
            </Grid>

            {/* ── Coffre ── */}
            <Grid item xs={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>🔐 Coffre</Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {regularChest.length === 0 && chestGold === 0
                  ? <Typography variant="caption" color="text.disabled">Coffre vide</Typography>
                  : regularChest.map(r =>
                      <ItemRow
                        key={r.id}
                        slot={{ typeId: r.typeId, qty: r.qty ?? 1 }}
                        qty={getChestQty(r.typeId)}
                        onQtyChange={q => setChestQtys(prev => ({ ...prev, [r.typeId]: q }))}
                        actionLabel="←"
                        onAction={withdrawItem}
                      />
                    )
                }
              </Box>

              {chestGold > 0 && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <GoldRow available={chestGold} actionLabel="←" onAction={withdrawGold} />
                </>
              )}
            </Grid>

          </Grid>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  )
}
