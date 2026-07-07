/**
 * HUDJoueur — Sidebar gauche toujours visible.
 *
 * Structure :
 *  - Titre du jeu
 *  - Avatar + Nom
 *  - Jauges : Forme, Faim, Réputation
 *  - Accordions : Personnage / Inventaire / Capacités / Journal
 *  - Affichage de l'or
 */
import { useState, useEffect } from 'react'
import Box            from '@mui/material/Box'
import Typography     from '@mui/material/Typography'
import Avatar         from '@mui/material/Avatar'
import LinearProgress from '@mui/material/LinearProgress'
import Divider        from '@mui/material/Divider'
import IconButton     from '@mui/material/IconButton'
import Tooltip        from '@mui/material/Tooltip'
import Chip           from '@mui/material/Chip'
import Menu           from '@mui/material/Menu'
import MenuItem       from '@mui/material/MenuItem'
import MaterialIcon   from './MaterialIcon'
import KratAccordion  from './KratAccordion'
import AdminPanel     from './admin/AdminPanel'
import PlayerProfileDialog from './dialogs/PlayerProfileDialog'
import { useKrat }    from '../context/KratContext'
import { COMPETENCES, ITEM_TYPES } from '../data/catalog'
import { pb }         from '../services/pb'

// ─── Jauge de stat ────────────────────────────────────────────────────────────

function StatBar({ label, stat }) {
  const pct = Math.round((stat.current / stat.max) * 100)
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="overline" sx={{ fontSize: '0.65rem', lineHeight: 1.4 }}>
          {label}
        </Typography>
        <Typography variant="overline" sx={{ fontSize: '0.65rem', lineHeight: 1.4 }}>
          {stat.current} / {stat.max}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          height:    8,
          borderRadius: 4,
          bgcolor:   '#e6e3d3',
          '& .MuiLinearProgress-bar': { bgcolor: stat.color, borderRadius: 4 },
        }}
      />
    </Box>
  )
}

// ─── Ligne de stat fixe (dans l'accordion Personnage) ────────────────────────

const FIXED_STATS = [
  { key: 'force',        label: 'Force',        icon: 'fitness_center'    },
  { key: 'intelligence', label: 'Intelligence',  icon: 'psychology'        },
  { key: 'charisme',     label: 'Charisme',      icon: 'record_voice_over' },
]

function FixedStatRow({ label, icon, value, bonus }) {
  const effective = value + bonus
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.75 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <MaterialIcon icon={icon} sx={{ fontSize: '1rem', color: 'text.secondary' }} />
        <Typography variant="overline" sx={{ fontSize: '0.65rem', color: 'text.secondary', lineHeight: 1 }}>
          {label}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography sx={{ fontSize: '1rem', fontFamily: '"Noto Serif", serif', fontWeight: 700 }}>
          {effective}
        </Typography>
        {bonus !== 0 && (
          <Typography
            variant="caption"
            sx={{
              fontSize:   '0.7rem',
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              color:      bonus > 0 ? '#2e7d32' : '#c62828',
            }}
          >
            ({bonus > 0 ? '+' : ''}{bonus})
          </Typography>
        )}
      </Box>
    </Box>
  )
}

// ─── Ligne de compétence ──────────────────────────────────────────────────────

function CompetenceRow({ label, icon, value }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <MaterialIcon icon={icon} sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
        <Typography variant="overline" sx={{ fontSize: '0.6rem', color: 'text.secondary', lineHeight: 1 }}>
          {label}
        </Typography>
      </Box>
      <Typography sx={{
        fontSize:   '0.75rem',
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        fontWeight: 700,
        color:      value > 0 ? '#2e7d32' : '#c62828',
      }}>
        {value > 0 ? '+' : ''}{value}
      </Typography>
    </Box>
  )
}

// ─── Journal des événements ───────────────────────────────────────────────────

const NEWS_TYPE_META = {
  rumor:    { icon: 'theater_comedy', color: '#825100' },
  official: { icon: 'gavel',          color: '#1565c0' },
  note:     { icon: 'mail',           color: '#2e7d32' },
  misc:     { icon: 'newspaper',      color: '#616161' },
}

function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return "à l'instant"
  if (mins < 60) return `il y a ${mins}min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `il y a ${hrs}h`
  return `il y a ${Math.floor(hrs / 24)}j`
}

function NewsItem({ news }) {
  const meta = NEWS_TYPE_META[news.type] ?? NEWS_TYPE_META.misc
  return (
    <Box sx={{ py: 0.75, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 'none' } }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
        <MaterialIcon icon={meta.icon} sx={{ fontSize: '0.85rem', color: meta.color, mt: '2px', flexShrink: 0 }} />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontSize: '0.72rem', lineHeight: 1.4, color: 'text.primary' }}>
            {news.text}
          </Typography>
          {news.target && (
            <Typography variant="caption" sx={{ fontSize: '0.6rem', color: meta.color, fontWeight: 600, display: 'block' }}>
              ↳ {news.target}
            </Typography>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.25 }}>
            <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.disabled', fontStyle: 'italic' }}>
              {news.authorName}
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.disabled' }}>
              {relativeTime(news.created)}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

// ─── Mini-avatar d'un membre du groupe ───────────────────────────────────────

function GroupeMember({ member, onFire }) {
  const [anchorEl, setAnchorEl] = useState(null)
  const hp      = member.hp ?? { current: 1, max: 1 }
  const hpPct   = Math.max(0, Math.round((hp.current / hp.max) * 100))
  const hpColor = hpPct > 60 ? '#4caf50' : hpPct > 30 ? '#ff9800' : '#f44336'

  return (
    <>
      <Box
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
              cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
      >
        <Avatar
          src={member.avatarUrl}
          alt={member.name}
          sx={{ width: 24, height: 24, border: '1.5px solid', borderColor: 'divider' }}
        />
        <Box sx={{ width: 24, height: 3, bgcolor: '#ddd', borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ width: `${hpPct}%`, height: '100%', bgcolor: hpColor, borderRadius: 2 }} />
        </Box>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: { minWidth: 172 } } }}
      >
        <Box sx={{ px: 2, py: 1.25, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, lineHeight: 1.3 }}>
            {member.name}
          </Typography>
          {member.role && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>
              {member.role}
            </Typography>
          )}
          <Typography variant="caption" sx={{ display: 'block', fontSize: '0.62rem', color: 'warning.dark', mt: 0.5 }}>
            💰 50 or / jour
          </Typography>
        </Box>
        <MenuItem
          onClick={() => { setAnchorEl(null); onFire(member.id) }}
          sx={{ color: 'error.main', fontSize: '0.78rem', gap: 1, py: 0.75 }}
        >
          <MaterialIcon icon="person_remove" sx={{ fontSize: '0.9rem' }} />
          Renvoyer
        </MenuItem>
      </Menu>
    </>
  )
}

// ─── Labels des jauges ────────────────────────────────────────────────────────

const JAUGE_LABELS = {
  forme:      'FORME',
  faim:       'FAIM',
  reputation: 'RÉPUTATION',
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function HUDJoueur() {
  const { state, actions } = useKrat()
  const { player, groupe, building } = state
  const { jauges, stats } = player
  const inShop = building?.currentRoomId === 'shop'
  const [adminOpen,   setAdminOpen]   = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [news,        setNews]        = useState([])

  useEffect(() => {
    let unsub
    pb.collection('kratNews').getList(1, 20, { sort: '-created' })
      .then(res => setNews(res.items))
      .catch(() => {})
    pb.collection('kratNews').subscribe('*', e => {
      if (e.action === 'create') setNews(prev => [e.record, ...prev.slice(0, 19)])
    }).then(fn => { unsub = fn }).catch(() => {})
    return () => { unsub?.() }
  }, [])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 3, gap: 2.5 }}>

      {/* ── Titre + bouton admin ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography
          variant="h4"
          sx={{ fontStyle: 'italic', color: 'primary.main', letterSpacing: '-0.5px', lineHeight: 1, userSelect: 'none' }}
        >
          Kratland
        </Typography>
        <Tooltip title="Administration" placement="right">
          <IconButton size="small" onClick={() => setAdminOpen(true)}
            sx={{ opacity: 0.3, '&:hover': { opacity: 1 } }}>
            <MaterialIcon icon="settings" sx={{ fontSize: '1rem' }} />
          </IconButton>
        </Tooltip>
      </Box>

      <AdminPanel open={adminOpen} onClose={() => setAdminOpen(false)} />

      {/* ── Avatar + Groupe + Nom ── */}
      <Box sx={{ display: 'flex', gap: 1.5 }}>

        {/* Colonne gauche : avatar joueur + mini-portraits du groupe */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
          <Tooltip title="Éditer le profil" placement="right">
            <Avatar
              src={player.avatarUrl}
              alt={player.name}
              variant="rounded"
              onClick={() => setProfileOpen(true)}
              sx={{ width: 56, height: 56, boxShadow: '0 2px 8px rgba(28,28,19,0.15)',
                    cursor: 'pointer', '&:hover': { opacity: 0.85 } }}
            />
          </Tooltip>

          {groupe.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '4px', width: 56, justifyContent: 'flex-start' }}>
              {groupe.map(m => <GroupeMember key={m.id} member={m} onFire={actions.fireNpc} />)}
            </Box>
          )}
        </Box>

        {/* Colonne droite : nom + PD + badge groupe */}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="h6" sx={{ lineHeight: 1.2, fontSize: '1rem' }} noWrap>
            {player.name}
          </Typography>
          {groupe.length > 0 && (
            <Chip
              label={`${groupe.length} compagnon${groupe.length > 1 ? 's' : ''}`}
              size="small"
              icon={<MaterialIcon icon="group" sx={{ fontSize: '0.75rem !important' }} />}
              sx={{ height: 18, fontSize: '0.6rem', fontWeight: 600, mb: 0.5,
                    '& .MuiChip-label': { px: 0.75 } }}
            />
          )}
          {/* Barre Points Divins */}
          {(() => {
            const pd  = player.stats?.pointsDivins ?? { current: 0, max: 20 }
            const pct = Math.round((pd.current / pd.max) * 100)
            return (
              <Box sx={{ mt: groupe.length > 0 ? 0 : 0.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                  <Typography variant="caption" sx={{ fontSize: '0.55rem', color: '#9c27b0', fontWeight: 700, letterSpacing: '0.05em' }}>
                    ✨ PD
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: '0.55rem', color: '#9c27b0', fontWeight: 700 }}>
                    {pd.current}/{pd.max}
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={pct}
                  sx={{ height: 4, borderRadius: 2,
                    bgcolor: 'rgba(123,31,162,0.1)',
                    '& .MuiLinearProgress-bar': { bgcolor: '#9c27b0', borderRadius: 2 } }} />
              </Box>
            )
          })()}
        </Box>

      </Box>

      <PlayerProfileDialog open={profileOpen} onClose={() => setProfileOpen(false)} />

      <Divider />

      {/* ── Jauges ── */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {Object.entries(jauges).map(([key, jauge]) => (
          <StatBar key={key} label={JAUGE_LABELS[key]} stat={jauge} />
        ))}
      </Box>

      <Divider />

      {/* ── Accordions ── */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flexGrow: 1, overflowY: 'auto' }}>

        <KratAccordion title="Personnage" icon="person">
          {FIXED_STATS.map(({ key, label, icon }) => (
            <FixedStatRow
              key={key}
              label={label}
              icon={icon}
              value={stats[key]}
              bonus={stats.bonus[key]}
            />
          ))}
          {Object.keys(stats.competences ?? {}).length > 0 && (
            <>
              <Divider sx={{ my: 1 }} />
              {Object.entries(stats.competences).map(([key, value]) => {
                const def = COMPETENCES[key]
                if (!def) return null
                return <CompetenceRow key={key} label={def.label} icon={def.icon} value={value} />
              })}
            </>
          )}
        </KratAccordion>

        <KratAccordion title="Inventaire" icon="backpack">
          {(player.inventaire ?? []).length === 0 ? (
            <Typography variant="body2" color="text.disabled" sx={{ py: 0.5, fontStyle: 'italic' }}>
              Inventaire vide.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
              {(player.inventaire ?? []).map((slot, i) => {
                const def = ITEM_TYPES[slot.typeId]
                if (!def) return null
                const stdEffects = def.effects
                  ? Object.keys(def.effects).some(k => ['forme','faim','reputation','gold','pointsDivins'].includes(k))
                  : false
                const canUse  = def.type === 'consumable' || def.type === 'book'
                const canSell = !!def.prix && inShop
                return (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, py: 0.25,
                    borderRadius: 1, '&:hover': { bgcolor: 'rgba(0,0,0,0.03)' } }}>
                    {/* Icône + label */}
                    <MaterialIcon icon={def.icon} sx={{ fontSize: '0.95rem', color: 'text.secondary', flexShrink: 0 }} />
                    <Typography variant="overline" sx={{ fontSize: '0.58rem', color: 'text.primary', lineHeight: 1, flex: 1, minWidth: 0 }} noWrap>
                      {def.label}
                    </Typography>
                    {/* Qty */}
                    {slot.qty > 1 && (
                      <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: 'text.disabled', flexShrink: 0 }}>
                        ×{slot.qty}
                      </Typography>
                    )}
                    {/* Actions */}
                    <Box sx={{ display: 'flex', gap: 0, flexShrink: 0 }}>
                      {canUse && (
                        <Tooltip title={stdEffects ? `Utiliser${Object.entries(def.effects).filter(([k])=>['forme','faim','reputation'].includes(k)).map(([k,v])=>' '+k+' '+(v>0?'+':'')+v).join('')}` : 'Utiliser'} placement="top">
                          <IconButton size="small" onClick={() => actions.useItem(slot.typeId)}
                            sx={{ p: '2px', color: 'success.main', opacity: 0.7, '&:hover': { opacity: 1 } }}>
                            <MaterialIcon icon="bolt" sx={{ fontSize: '0.85rem' }} />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title={canSell ? `Vendre (${Math.max(1,Math.floor(def.prix*0.5))}g)` : 'Vendre (shop uniquement)'} placement="top">
                        <span>
                          <IconButton size="small" disabled={!canSell} onClick={() => actions.sellItem(slot.typeId)}
                            sx={{ p: '2px', color: 'warning.main', opacity: canSell ? 0.7 : 0.3, '&:hover': { opacity: 1 } }}>
                            <MaterialIcon icon="sell" sx={{ fontSize: '0.85rem' }} />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Jeter" placement="top">
                        <IconButton size="small" onClick={() => actions.dropItem(slot.typeId)}
                          sx={{ p: '2px', color: 'error.main', opacity: 0.5, '&:hover': { opacity: 1 } }}>
                          <MaterialIcon icon="delete" sx={{ fontSize: '0.85rem' }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                )
              })}
            </Box>
          )}
        </KratAccordion>

        <KratAccordion title="Capacités" icon="bolt">
          {Object.keys(stats.competences ?? {}).length === 0 ? (
            <Typography variant="body2" color="text.disabled" sx={{ py: 0.5, fontStyle: 'italic' }}>
              Aucune capacité.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, pt: 0.5 }}>
              {Object.entries(stats.competences).map(([key, value]) => {
                const def = COMPETENCES[key]
                if (!def) return null
                return (
                  <Tooltip key={key} title={value > 0 ? `+${value}` : `${value}`} placement="top">
                    <Chip
                      size="small"
                      icon={<MaterialIcon icon={def.icon} sx={{ fontSize: '0.8rem !important' }} />}
                      label={def.label}
                      sx={{
                        height: 22,
                        fontSize: '0.6rem',
                        fontWeight: 600,
                        bgcolor: value > 0 ? 'rgba(46,125,50,0.1)' : 'rgba(198,40,40,0.08)',
                        color:   value > 0 ? 'success.dark' : 'error.dark',
                        border: '1px solid',
                        borderColor: value > 0 ? 'success.light' : 'error.light',
                        '& .MuiChip-icon': { color: value > 0 ? 'success.main' : 'error.main' },
                        '& .MuiChip-label': { px: 0.75 },
                      }}
                    />
                  </Tooltip>
                )
              })}
            </Box>
          )}
        </KratAccordion>

        <KratAccordion title="Journal" icon="menu_book" alwaysOpen maxBodyHeight={220}>
          {news.length === 0 ? (
            <Typography variant="body2" color="text.disabled" sx={{ py: 0.5, fontStyle: 'italic' }}>
              Aucune nouvelle pour l'instant.
            </Typography>
          ) : (
            <Box>
              {news.map(n => <NewsItem key={n.id} news={n} />)}
            </Box>
          )}
        </KratAccordion>

      </Box>

      <Divider />

      {/* ── Or ── */}
      <Box
        sx={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          bgcolor:        'rgba(0,0,0,0.04)',
          borderRadius:   2,
          px:             2,
          py:             1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MaterialIcon icon="payments" sx={{ color: 'warning.main', fontSize: '1.2rem' }} />
          <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
            Or
          </Typography>
        </Box>
        <Typography variant="h6" color="primary.dark" sx={{ fontFamily: '"Noto Serif", serif' }}>
          {player.gold.toLocaleString('fr-FR')}
        </Typography>
      </Box>

    </Box>
  )
}
