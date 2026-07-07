/**
 * BuildingRoomView — Vue "À l'intérieur d'un bâtiment".
 *
 * Sections :
 *  - En-tête du bâtiment (nom + description)
 *  - Image de la pièce courante + label "Emplacement Actuel"
 *  - Grille de navigation entre pièces
 *  - Liste des habitants
 *  - Panneau d'actions contextuelles (colonne droite)
 *  - Bouton "Dégainer" → navigue vers la vue combat
 */
import { useState, useEffect } from 'react'
import Grid      from '@mui/material/Grid'
import Box       from '@mui/material/Box'
import Paper     from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Avatar     from '@mui/material/Avatar'
import Button     from '@mui/material/Button'
import Chip       from '@mui/material/Chip'
import Divider    from '@mui/material/Divider'
import MaterialIcon            from '../MaterialIcon'
import { useKrat }             from '../../context/KratContext'
import Snackbar from '@mui/material/Snackbar'
import Alert    from '@mui/material/Alert'
import { CONTEXTUAL_ACTIONS, ITEM_TYPES, NPC_SPAWN_TEMPLATES } from '../../data/catalog'
import AchatDialog             from '../dialogs/AchatDialog'
import TravailDialog           from '../dialogs/TravailDialog'
import ActionDialog            from '../dialogs/ActionDialog'
import CharacterDialog         from '../dialogs/CharacterDialog'
import BureauDuMaireDialog     from '../dialogs/BureauDuMaireDialog'
import CoffreDialog            from '../dialogs/CoffreDialog'
import EvasionDialog           from '../dialogs/EvasionDialog'

// ─── Boutique ────────────────────────────────────────────────────────────────

const RARITY_META = {
  common:   { color: '#9e9e9e', label: 'Commun'     },
  uncommon: { color: '#1976d2', label: 'Peu commun' },
  rare:     { color: '#7b1fa2', label: 'Rare'       },
  epic:     { color: '#f9a825', label: 'Épique'     },
}

function rollAvailability(rarete) {
  switch (rarete) {
    case 'uncommon': return Math.random() > 0.30
    case 'rare':     return Math.random() < 0.15
    case 'epic':     return Math.random() < 0.02
    default:         return true
  }
}

function ShopItemRow({ item, onBuyClick }) {
  const rarity = RARITY_META[item.rarete ?? 'common']
  return (
    <Box sx={{
      display:    'flex',
      alignItems: 'center',
      gap:        1,
      p:          1,
      borderRadius: 1,
      bgcolor:    'background.default',
      opacity:    item.available ? 1 : 0.4,
    }}>
      <MaterialIcon icon={item.icon} sx={{ fontSize: '1.2rem', flexShrink: 0, color: item.available ? 'text.primary' : 'text.disabled' }} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" noWrap sx={{ fontSize: '0.8rem', fontWeight: 500, lineHeight: 1.2 }}>
          {item.label}
        </Typography>
        <Typography variant="caption" sx={{ fontSize: '0.6rem', color: rarity.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {rarity.label}
        </Typography>
      </Box>
      <Box sx={{ flexShrink: 0, textAlign: 'right' }}>
        {item.available ? (
          <>
            <Typography variant="caption" sx={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'warning.dark' }}>
              {item.prix}g
            </Typography>
            <Typography variant="caption" onClick={() => onBuyClick(item)} sx={{ fontSize: '0.6rem', color: 'primary.main', fontWeight: 600, cursor: 'pointer' }}>
              Acheter
            </Typography>
          </>
        ) : (
          <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.disabled', fontStyle: 'italic' }}>
            Épuisé
          </Typography>
        )}
      </Box>
    </Box>
  )
}

// ─── Carte de pièce ──────────────────────────────────────────────────────────

function RoomCard({ room, active, onSelect, disabled }) {
  return (
    <Paper
      variant="outlined"
      onClick={() => !disabled && onSelect(room.id)}
      sx={{
        p:          2,
        cursor:     disabled ? 'not-allowed' : 'pointer',
        opacity:    disabled ? 0.45 : 1,
        borderLeft: active ? '4px solid' : '1px solid',
        borderColor: active ? 'primary.main' : 'divider',
        bgcolor:    active ? 'rgba(152,67,0,0.04)' : 'background.default',
        transition: 'background-color 0.15s',
        '&:hover':  { bgcolor: disabled ? undefined : 'rgba(152,67,0,0.06)' },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <MaterialIcon icon={room.icon} sx={{ color: active ? 'primary.main' : 'text.disabled' }} />
        {active && (
          <Typography variant="overline" color="primary" sx={{ fontSize: '0.6rem', lineHeight: 1 }}>
            Active
          </Typography>
        )}
      </Box>
      <Typography variant="h6" sx={{ fontSize: '0.95rem', mb: 0.25 }}>{room.label}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
        {room.description}
      </Typography>
    </Paper>
  )
}

// ─── Ligne d'habitant ────────────────────────────────────────────────────────

function InhabitantRow({ inhabitant, onSelect }) {
  const isPlayer = inhabitant.type === 'Joueur'
  return (
    <Box
      sx={{
        display:       'flex',
        alignItems:    'center',
        justifyContent:'space-between',
        p:             1.5,
        borderRadius:  1,
        bgcolor:       'background.default',
        '&:hover':     { boxShadow: 1 },
        transition:    'box-shadow 0.15s',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar src={inhabitant.avatarUrl} alt={inhabitant.name} sx={{ width: 40, height: 40 }} />
        <Box>
          <Typography variant="subtitle2" sx={{ fontFamily: '"Noto Serif", serif' }}>
            {inhabitant.name}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontFamily:  '"Plus Jakarta Sans", sans-serif',
              fontWeight:  700,
              color:       isPlayer ? 'secondary.main' : 'warning.main',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {inhabitant.type} · {inhabitant.role}
          </Typography>
        </Box>
      </Box>
      <Button
        size="small"
        variant="text"
        color={isPlayer ? 'secondary' : 'primary'}
        onClick={() => onSelect(inhabitant)}
        sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 600 }}
      >
        {inhabitant.action}
      </Button>
    </Box>
  )
}

// ─── Composant principal ─────────────────────────────────────────────────────

export default function BuildingRoomView() {
  const { state, actions } = useKrat()
  const { building } = state

  const currentRoom = building.rooms.find(r => r.id === building.currentRoomId)
    ?? building.rooms[0]

  const visibleInhabitants = building.inhabitants.filter(inh => {
    const loc = typeof inh.location === 'string' ? JSON.parse(inh.location) : (inh.location ?? {})
    return !loc.roomId || loc.roomId === building.currentRoomId
  })

  const inPrison = building.type === 'mairie' && building.currentRoomId === 'prison'

  const contextualActions = CONTEXTUAL_ACTIONS[building.type]?.[currentRoom.id] ?? []

  const [selectedShopItem,   setSelectedShopItem]   = useState(null)
  const [selectedWorkAction, setSelectedWorkAction] = useState(null)
  const [selectedAction,     setSelectedAction]     = useState(null)
  const [selectedInhabitant, setSelectedInhabitant] = useState(null)
  const [bureauOpen,         setBureauOpen]         = useState(false)
  const [coffreOpen,         setCoffreOpen]         = useState(false)
  const [evasionOpen,        setEvasionOpen]        = useState(false)
  const [hireSnack,          setHireSnack]          = useState(null)

  // Disponibilité boutique tirée au sort à chaque entrée dans le bâtiment
  const [shopItems, setShopItems] = useState([])
  useEffect(() => {
    setShopItems(
      Object.entries(ITEM_TYPES)
        .filter(([, item]) => item.inBuildingShop === building.type)
        .map(([key, item]) => ({ key, ...item, available: rollAvailability(item.rarete ?? 'common') }))
    )
  }, [building.id, building.type])

  async function handleAction(actionId) {
    if (actionId === 'exit')          { actions.exitBuilding(); return }
    if (actionId === 'bureauDuMaire') { setBureauOpen(true);   return }
    if (actionId === 'coffre')        { setCoffreOpen(true);   return }
    if (actionId === 'work') {
      const act = contextualActions.find(a => a.id === 'work')
      if (act) setSelectedWorkAction(act)
      return
    }
    if (actionId === 'evasion') { setEvasionOpen(true); return }
    if (actionId === 'costaud') {
      const result = await actions.spawnNpc(NPC_SPAWN_TEMPLATES.bodyguard)
      if (result === 'hired')    setHireSnack({ message: 'Dmitri vous rejoint. Il a l\'air content… enfin, difficile à dire.', severity: 'success' })
      if (result === 'too_poor') setHireSnack({ message: 'Vous n\'avez pas les 50g nécessaires. Dmitri vous toise avec mépris.', severity: 'warning' })
      if (result === 'error')    setHireSnack({ message: 'Dmitri est indisponible pour l\'instant.', severity: 'error' })
      return
    }
    const act = contextualActions.find(a => a.id === actionId)
    if (act) setSelectedAction(act)
  }

  return (
    <Box>
      {/* En-tête du bâtiment */}
      <Box sx={{ mb: 4, maxWidth: 800 }}>
        <Typography variant="h3" sx={{ mb: 1 }}>{building.name}</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          {building.description}
        </Typography>
      </Box>

      <Grid container spacing={3}>

        {/* ── Colonne principale (8/12) ── */}
        <Grid item xs={12} lg={8}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

            {/* Image de la pièce */}
            <Box sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden', aspectRatio: '16/9' }}>
              <Box
                component="img"
                src={building.roomImageUrl}
                alt={currentRoom?.label}
                sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                      transition: 'transform 0.6s', '&:hover': { transform: 'scale(1.04)' } }}
              />
              {/* Dégradé bas */}
              <Box sx={{ position: 'absolute', inset: 0,
                         background: 'linear-gradient(to top, rgba(28,28,19,0.75) 0%, transparent 50%)' }} />
              {/* Label emplacement */}
              <Box sx={{ position: 'absolute', bottom: 24, left: 32 }}>
                <Chip
                  label="Emplacement Actuel"
                  size="small"
                  sx={{
                    bgcolor: 'primary.main', color: '#fff',
                    fontFamily: '"Plus Jakarta Sans", sans-serif',
                    fontWeight: 700, fontSize: '0.6rem',
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    mb: 1,
                  }}
                />
                <Typography variant="h4" sx={{ color: '#fff', lineHeight: 1 }}>
                  {currentRoom?.label??'Vide'}
                </Typography>
              </Box>
            </Box>

            {/* Grille des pièces */}
            <Grid container spacing={2}>
              {building.rooms.map(room => (
                <Grid item xs={12} sm={4} key={room.id}>
                  <RoomCard
                    room={room}
                    active={room.id === building.currentRoomId}
                    onSelect={actions.selectRoom}
                    disabled={room.id==='prison'||(inPrison && room.id !== building.currentRoomId)}
                  />
                </Grid>
              ))}
            </Grid>

            {/* Habitants */}
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Habitants</Typography>
                <Typography variant="caption" color="text.disabled" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {visibleInhabitants.length} personnage{visibleInhabitants.length !== 1 ? 's' : ''} présent{visibleInhabitants.length !== 1 ? 's' : ''}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {visibleInhabitants.length === 0 ? (
                  <Typography variant="body2" color="text.disabled" sx={{ py: 0.5, fontStyle: 'italic' }}>
                    Personne ici.
                  </Typography>
                ) : visibleInhabitants.map(inh => (
                  <InhabitantRow key={inh.id} inhabitant={inh} onSelect={setSelectedInhabitant} />
                ))}
              </Box>
            </Paper>

          </Box>
        </Grid>

        {/* ── Panneau Actions contextuelles (4/12) ── */}
        <Grid item xs={12} lg={4}>
          <Paper
            elevation={3}
            sx={{
              overflow: 'hidden',
              position: { lg: 'sticky' },
              top:      { lg: 32 },
              borderTop: '4px solid',
              borderColor: 'primary.main',
            }}
          >
            <Box sx={{ p: 2.5, bgcolor: '#ece8d9', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" color="primary">Actions Contextuelles</Typography>
              <Typography variant="caption" color="text.disabled" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Disponibles · {currentRoom?.label??'Vide'}
              </Typography>
            </Box>

            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {contextualActions.map(act => {
                const disabled = act.condition ? !act.condition(state) : false
                return (
                  <Button
                    key={act.id}
                    variant={act.primary ? 'contained' : 'outlined'}
                    color="primary"
                    fullWidth
                    disabled={disabled}
                    startIcon={<MaterialIcon icon={act.icon} sx={{ fontSize: '1.2rem !important' }} />}
                    onClick={() => handleAction(act.id)}
                    sx={{
                      justifyContent: 'flex-start',
                      fontFamily: '"Plus Jakarta Sans", sans-serif',
                      fontWeight: 600,
                      ...(act.primary ? {} : { borderColor: 'divider', color: 'text.primary' }),
                    }}
                  >
                    {act.label}
                  </Button>
                )
              })}

              {/* ── Boutique (room shop uniquement) ── */}
              {currentRoom?.id === 'shop' && shopItems.length > 0 && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <MaterialIcon icon="storefront" sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                      <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                        Boutique
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {shopItems.map(item => (
        <ShopItemRow key={item.key} item={item} onBuyClick={setSelectedShopItem} />
      ))}
                    </Box>
                  </Box>
                </>
              )}

              <Divider sx={{ my: 1 }} />

              {/* Objets dans la pièce */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <MaterialIcon icon="inventory_2" sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                  <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                    Objets dans la pièce
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {building.roomItems.map(item => (
                    <Chip
                      key={item.id}
                      icon={<MaterialIcon icon={item.icon} sx={{ fontSize: '1rem !important', ml: '8px !important' }} />}
                      label={item.label}
                      size="small"
                      variant="outlined"
                      sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '0.75rem' }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>

            {/* Dégainer → combat */}
            <Box sx={{ p: 2, bgcolor: 'rgba(186,26,26,0.05)', borderTop: '1px solid', borderColor: 'divider' }}>
              <Button
                variant="outlined"
                color="error"
                fullWidth
                startIcon={<MaterialIcon icon="swords" sx={{ fontSize: '1.2rem !important' }} />}
                onClick={() => actions.navigateTo('combat')}
                sx={{
                  fontFamily:    '"Plus Jakarta Sans", sans-serif',
                  fontWeight:    700,
                  textTransform: 'uppercase',
                  fontSize:      '0.75rem',
                  letterSpacing: '0.05em',
                }}
              >
                Dégainer
              </Button>
            </Box>
          </Paper>
        </Grid>

      </Grid>

      <CharacterDialog
        target={selectedInhabitant}
        open={!!selectedInhabitant}
        onClose={() => setSelectedInhabitant(null)}
      />
      <AchatDialog
        item={selectedShopItem}
        open={!!selectedShopItem}
        onClose={() => setSelectedShopItem(null)}
      />
      <TravailDialog
        act={selectedWorkAction}
        open={!!selectedWorkAction}
        onClose={() => setSelectedWorkAction(null)}
      />
      <ActionDialog
        action={selectedAction}
        open={!!selectedAction}
        onClose={() => setSelectedAction(null)}
        onSuccessCallback={(selectedAction?.id === 'candidature'||selectedAction?.id === 'coupDetat') ? actions.becomeMayor : undefined}
      />
      <BureauDuMaireDialog
        open={bureauOpen}
        onClose={() => setBureauOpen(false)}
      />
      <EvasionDialog
        open={evasionOpen}
        onClose={() => setEvasionOpen(false)}
      />
      <CoffreDialog
        open={coffreOpen}
        onClose={() => setCoffreOpen(false)}
        buildingId={building.id}
        isOwner={building.id === `maison_${state.player.id}` || building.ownerId === state.player.id}
      />
      <Snackbar
        open={!!hireSnack}
        autoHideDuration={4000}
        onClose={() => setHireSnack(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={hireSnack?.severity ?? 'info'} onClose={() => setHireSnack(null)} sx={{ width: '100%' }}>
          {hireSnack?.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
