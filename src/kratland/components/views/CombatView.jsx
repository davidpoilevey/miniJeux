/**
 * CombatView — Combat tour par tour, N alliés vs M ennemis.
 *
 * Alliés  : joueur + groupe[] (membres embauchés)
 * Ennemis : activeEnemies[] (tous les PNJs action=Attaquer sur la case)
 * Chaque camp utilise les attaques/défenses définies par son ROLE.
 * Ciblage : cliquer sur un ennemi pour le sélectionner.
 */
import { useState, useEffect, useRef, useMemo } from 'react'
import Grid           from '@mui/material/Grid'
import Box            from '@mui/material/Box'
import Paper          from '@mui/material/Paper'
import Typography     from '@mui/material/Typography'
import Button         from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import Divider        from '@mui/material/Divider'
import Chip           from '@mui/material/Chip'
import Tooltip        from '@mui/material/Tooltip'
import MaterialIcon   from '../MaterialIcon'
import { useKrat }    from '../../context/KratContext'
import { ITEM_TYPES, COMPETENCES, ROLES, ROLE_ATTACKS, ROLE_DEFENSES } from '../../data/catalog'
import { pb }         from '../../services/pb'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseHp(hp) {
  const h = typeof hp === 'string' ? JSON.parse(hp) : (hp ?? { current: 20, max: 20 })
  return { current: h.current ?? 20, max: h.max ?? 20 }
}

function rollDmg(atk) {
  if (!atk || atk.dmgMin === undefined) return 1
  if (atk.dmgMin === atk.dmgMax) return atk.dmgMin
  return Math.floor(Math.random() * (atk.dmgMax - atk.dmgMin + 1)) + atk.dmgMin
}

function getRole(roleKey) { return ROLES[roleKey?.toLowerCase()] ?? null }

function getDefMult(roleKey) {
  const role = getRole(roleKey)
  if (!role?.defenses?.length) return 1.0
  return ROLE_DEFENSES[role.defenses[0]]?.dmgMult ?? 1.0
}

function getDefLabel(roleKey) {
  const role = getRole(roleKey)
  if (!role?.defenses?.length) return null
  return ROLE_DEFENSES[role.defenses[0]]?.label ?? null
}

function pickRoleAttack(roleKey) {
  const role = getRole(roleKey)
  const attacks = role?.attacks?.length ? role.attacks : ['poing']
  const key = attacks[Math.floor(Math.random() * attacks.length)]
  return { key, ...(ROLE_ATTACKS[key] ?? ROLE_ATTACKS.poing) }
}

function getRoleIcon(roleKey) {
  return getRole(roleKey)?.icon ?? 'person'
}

// ─── Construction des actions joueur ─────────────────────────────────────────

function buildCombatActions(player) {
  const force = (player.stats?.force ?? 5) + (player.stats?.bonus?.force ?? 0)
  const intel = (player.stats?.intelligence ?? 5) + (player.stats?.bonus?.intelligence ?? 0)
  const comp  = player.stats?.competences ?? {}
  const inv   = player.inventaire ?? []
  const acts  = []

  acts.push({
    id: 'unarmed', label: 'Attaque Nue', icon: 'sports_martial_arts',
    variant: 'outlined', featured: false,
    dmgMin: 1, dmgMax: Math.max(1, force),
  })

  inv.forEach(slot => {
    const item = ITEM_TYPES[slot.typeId]
    if (!item || item.type !== 'weapon') return
    const bonus = item.effects?.bonusForce ?? 1
    acts.push({
      id: `weapon_${slot.typeId}`, label: item.label, icon: item.icon,
      variant: 'contained', btnColor: 'primary', featured: true,
      dmgMin: bonus + 1,
      dmgMax: Math.max(bonus + 1, force + bonus + 3),
      badge: item.tags?.includes('illegal') ? 'illégale' : null,
    })
  })

  if (comp.closeCombat) {
    const base = Math.floor(force * 0.8) + 2
    acts.push({ id: 'high_kick', label: 'High-kick', icon: 'sports_martial_arts',
      variant: 'contained', btnColor: 'secondary', dmgMin: base, dmgMax: base + 4,
      badge: COMPETENCES.closeCombat.label })
  }
  if (comp.combat) {
    acts.push({ id: 'coup_puissant', label: 'Coup puissant', icon: 'fitness_center',
      variant: 'contained', btnColor: 'warning',
      dmgMin: Math.floor(force * 1.2), dmgMax: Math.max(Math.floor(force * 1.2), force * 2),
      badge: COMPETENCES.combat.label })
  }
  if (comp.survie) {
    const d = Math.max(1, Math.floor(force * 0.8))
    acts.push({ id: 'aveuglement', label: 'Aveuglement', icon: 'visibility_off',
      variant: 'contained', btnColor: 'warning', dmgMin: 1, dmgMax: d, special: 'blind',
      badge: COMPETENCES.survie.label })
  }
  if (comp.magieFeu) {
    acts.push({ id: 'boule_feu', label: 'Boule de Feu', icon: 'local_fire_department',
      variant: 'contained', btnColor: 'error', dmgMin: intel + 2, dmgMax: intel * 2 + 3,
      badge: COMPETENCES.magieFeu.label })
  }
  if (comp.magieEau) {
    acts.push({ id: 'jet_glace', label: 'Jet de Glace', icon: 'ac_unit',
      variant: 'contained', btnColor: 'info',
      dmgMin: Math.max(1, Math.floor(intel * 0.6)), dmgMax: intel + 3, special: 'freeze',
      badge: COMPETENCES.magieEau.label })
  }
  if (comp.magieTerre) {
    acts.push({ id: 'secousse', label: 'Secousse', icon: 'landslide',
      variant: 'contained', btnColor: 'warning',
      dmgMin: Math.max(1, Math.floor(intel * 0.8)), dmgMax: Math.max(1, Math.floor(intel * 1.8)),
      badge: COMPETENCES.magieTerre.label })
  }
  if (comp.magieVent) {
    acts.push({ id: 'rafale', label: 'Rafale', icon: 'air',
      variant: 'contained', btnColor: 'info',
      dmgMin: 1, dmgMax: Math.max(1, Math.floor(intel * 1.5)),
      badge: COMPETENCES.magieVent.label })
  }

  acts.push({ id: 'block', label: 'Bloquer', icon: 'shield',
    variant: 'outlined', isBlock: true, hint: 'dégâts ÷2' })
  acts.push({ id: 'flee', label: 'Fuir', icon: 'directions_run',
    variant: 'outlined', btnColor: 'error', isFlee: true, hint: '−2 Rép.' })

  return acts
}

// ─── Bouton d'action ──────────────────────────────────────────────────────────

function CombatBtn({ action, disabled, onClick }) {
  const dmgLabel = action.dmgMin !== undefined
    ? (action.dmgMin === action.dmgMax ? `${action.dmgMin} dmg` : `${action.dmgMin}–${action.dmgMax} dmg`)
    : action.hint ?? null

  return (
    <Button
      variant={action.variant}
      color={action.btnColor ?? undefined}
      disabled={disabled}
      onClick={onClick}
      sx={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 0.25, py: 1.5, px: 1, minWidth: 88,
        fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 700,
        fontSize: '0.68rem', borderRadius: 3, lineHeight: 1.2,
        transform: action.featured ? 'scale(1.06)' : 'none',
        ...(action.btnColor == null && {
          borderColor: 'divider', color: 'text.primary',
          '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
        }),
      }}
    >
      <MaterialIcon icon={action.icon} filled={action.featured}
        sx={{ fontSize: '1.4rem !important', mb: 0.25 }} />
      {action.label}
      {dmgLabel && (
        <Typography component="span" sx={{ fontSize: '0.6rem', opacity: 0.75, fontWeight: 600 }}>
          {dmgLabel}
        </Typography>
      )}
      {action.badge && (
        <Typography component="span" sx={{ fontSize: '0.56rem', opacity: 0.6, fontStyle: 'italic' }}>
          {action.badge}
        </Typography>
      )}
      {action.special && (
        <Typography component="span" sx={{ fontSize: '0.56rem', color: 'warning.main', fontWeight: 700 }}>
          + effet
        </Typography>
      )}
    </Button>
  )
}

// ─── Carte de combattant (compacte) ──────────────────────────────────────────

function CombatantCard({ name, imageUrl, roleIcon, hpCurrent, hpMax, isPlayer, isAlly, isTarget, isDead, defLabel, onClick }) {
  const hpPct = Math.round((Math.max(0, hpCurrent) / Math.max(hpMax, 1)) * 100)
  const barColor = isDead ? '#555' : isPlayer ? '#90caf9' : isAlly ? '#a5d6a7' : '#ef9a9a'
  const borderColor = isDead ? 'rgba(255,255,255,0.08)'
    : isTarget  ? '#4caf50'
    : isPlayer  ? '#90caf9'
    : isAlly    ? '#a5d6a7'
    : '#ef9a9a'

  return (
    <Tooltip
      title={defLabel ? `Défense passive : ${defLabel}` : name}
      placement={isPlayer || isAlly ? 'left' : 'right'}
      arrow
    >
      <Box
        onClick={onClick}
        sx={{
          display: 'flex', alignItems: 'center', gap: 1, p: 1, borderRadius: 2,
          border: `1.5px solid ${borderColor}`,
          bgcolor: isDead ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(6px)',
          cursor: onClick && !isDead ? 'pointer' : 'default',
          opacity: isDead ? 0.3 : 1,
          transition: 'border-color 0.12s, opacity 0.12s',
          ...(isTarget && !isDead && { boxShadow: '0 0 10px rgba(76,175,80,0.5)' }),
        }}
      >
        <Box sx={{
          width: 36, height: 36, flexShrink: 0, borderRadius: 1, overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          bgcolor: 'rgba(255,255,255,0.08)',
        }}>
          {imageUrl ? (
            <Box component="img" src={imageUrl} alt={name}
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <MaterialIcon icon={roleIcon ?? 'person'} sx={{ fontSize: '1.4rem', color: 'rgba(255,255,255,0.7)' }} />
          )}
        </Box>

        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography noWrap sx={{
            fontSize: '0.65rem', fontWeight: 700, lineHeight: 1.2, mb: 0.4,
            color: isDead ? 'rgba(255,255,255,0.25)' : '#fff',
          }}>
            {isDead ? `✝ ${name}` : name}
          </Typography>
          <LinearProgress variant="determinate" value={hpPct} sx={{
            height: 4, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.12)',
            '& .MuiLinearProgress-bar': { bgcolor: barColor, borderRadius: 2 },
          }} />
          <Typography sx={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.45)', mt: 0.25 }}>
            {Math.max(0, hpCurrent)} / {hpMax}
          </Typography>
        </Box>

        {isTarget && !isDead && (
          <MaterialIcon icon="my_location" sx={{ fontSize: '0.9rem', color: '#4caf50', flexShrink: 0 }} />
        )}
      </Box>
    </Tooltip>
  )
}

// ─── Entrée de log ────────────────────────────────────────────────────────────

function LogEntry({ entry }) {
  const color = entry.playerAction ? 'primary.main' : entry.enemyAction ? 'error.main' : 'text.secondary'
  return (
    <Box sx={{ display: 'flex', gap: 1.5 }}>
      <Typography variant="caption" color="text.disabled"
        sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', flexShrink: 0, mt: '2px', minWidth: 28 }}>
        {entry.time}
      </Typography>
      <Typography variant="body2"
        sx={{ lineHeight: 1.6, fontStyle: entry.narrative ? 'italic' : 'normal', color }}>
        {entry.text}
      </Typography>
    </Box>
  )
}

// ─── Overlay résultat ─────────────────────────────────────────────────────────

function OutcomeOverlay({ outcome, onEnd }) {
  const META = {
    win:  { emoji: '🏆', title: 'Victoire !',             color: 'success.main' },
    lose: { emoji: '💀', title: 'Défaite...',             color: 'error.main'   },
    draw: { emoji: '🤝', title: 'Match nul.',             color: 'text.primary' },
    flee: { emoji: '🏃', title: 'Tu prends tes jambes !', color: 'warning.main' },
  }
  const m = META[outcome] ?? META.draw
  return (
    <Box sx={{
      position: 'absolute', inset: 0, zIndex: 10,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      bgcolor: 'rgba(10,8,5,0.75)', backdropFilter: 'blur(4px)',
      borderRadius: 3, gap: 2,
    }}>
      <Typography sx={{ fontSize: '3.5rem', lineHeight: 1 }}>{m.emoji}</Typography>
      <Typography variant="h4" sx={{ color: m.color, fontWeight: 700 }}>{m.title}</Typography>
      <Button variant="contained" size="large" onClick={onEnd}
        sx={{ mt: 1, fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 700 }}>
        Terminer
      </Button>
    </Box>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function CombatView() {
  const { state, actions } = useKrat()
  const { player, combat, groupe } = state

  // Construire la liste des ennemis une seule fois (le composant remonte à chaque combat)
  const initEnemies = useMemo(() => {
    const list = state.activeEnemies?.length > 0
      ? state.activeEnemies
      : (state.activePnj ? [state.activePnj] : [])
    return list
  }, [])

  const [enemies]       = useState(initEnemies)
  const [enemyHps,      setEnemyHps]  = useState(() => initEnemies.map(e => parseHp(e.hp).current))
  const [enemyHpMaxes]                = useState(() => initEnemies.map(e => parseHp(e.hp).max))
  const [targetIdx,     setTargetIdx] = useState(0)

  const [allyHps,       setAllyHps]   = useState(() => groupe.map(m => parseHp(m.hp).current))
  const [allyHpMaxes]                 = useState(() => groupe.map(m => parseHp(m.hp).max))

  const [currentRound,  setCurrentRound] = useState(1)
  const [logs,          setLogs]         = useState(() => {
    const names = initEnemies.map(e => e.name).join(' & ')
    return [{ time: '—', text: `Combat contre ${names} !`, narrative: true }]
  })
  const [isOver,        setIsOver]   = useState(false)
  const [outcome,       setOutcome]  = useState(null)
  const logEndRef = useRef(null)

  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [logs])

  function escapeToSafeCell() {
    const loc  = state.player.location
    const pos  = loc?.position
    if (!pos) return
    const mapW = loc.city ? state.city.width  : state.world.width
    const mapH = loc.city ? state.city.height : state.world.height
    const [pc, pr] = pos.split(',').map(Number)
    for (const [dc, dr] of [[-1,0],[1,0],[0,-1],[0,1]]) {
      const nc = pc + dc, nr = pr + dr
      if (nc >= 0 && nc < mapW && nr >= 0 && nr < mapH) {
        actions.movePlayer(`${nc},${nr}`, 0)
        return
      }
    }
  }

  useEffect(() => {
    if (isOver || !enemies.length) return
    if (player.jauges.forme.current <= 0) {
      escapeToSafeCell()
      setIsOver(true)
      setOutcome('lose')
      setLogs(prev => [...prev, { time: `R${currentRound}`, text: `Tu t'effondres. Combat perdu.`, narrative: true }])
    }
  }, [player.jauges.forme.current])

  const combatActions = useMemo(() => buildCombatActions(player), [player.stats, player.inventaire])

  if (!enemies.length) {
    return (
      <Box sx={{ textAlign: 'center', mt: 8 }}>
        <Typography variant="h4" color="text.secondary">Aucun combat en cours.</Typography>
      </Box>
    )
  }

  function playRound(action) {
    if (isOver) return
    const roundLogs = []
    const log = (text, type = 'narrative') => roundLogs.push({ time: `R${currentRound}`, text, [type]: true })

    let newEnemyHps = [...enemyHps]
    let newAllyHps  = [...allyHps]
    let npcDmgMult  = 1.0

    const target = enemies[targetIdx]

    // ── Joueur attaque ────────────────────────────────────────────────────────
    if (action.isBlock) {
      npcDmgMult = 0.5
      log('Tu prends position défensive.', 'playerAction')
    } else {
      const rawDmg  = rollDmg(action)
      const defMult = getDefMult(target.role)
      const defLbl  = defLabel => defLabel ? ` (${defLabel})` : ''
      const dmg     = defMult < 1 ? Math.max(1, Math.floor(rawDmg * defMult)) : rawDmg
      newEnemyHps[targetIdx] = Math.max(0, newEnemyHps[targetIdx] - dmg)
      log(`${action.label} → ${target.name} : −${dmg} HP${defLbl(getDefLabel(target.role))}`, 'playerAction')

      if (action.special === 'blind')  { npcDmgMult = 0.35; log(`${target.name} est aveuglé !`, 'narrative') }
      if (action.special === 'freeze') { npcDmgMult = 0.50; log(`${target.name} est ralenti !`, 'narrative') }
    }

    // ── Membres du groupe attaquent ──────────────────────────────────────────
    groupe.forEach((member, mi) => {
      if ((newAllyHps[mi] ?? 0) <= 0) return
      const firstAlive = newEnemyHps.findIndex(h => h > 0)
      if (firstAlive === -1) return
      const atk    = pickRoleAttack(member.role)
      const rawDmg = rollDmg(atk)
      const def    = getDefMult(enemies[firstAlive].role)
      const dmg    = def < 1 ? Math.max(1, Math.floor(rawDmg * def)) : rawDmg
      newEnemyHps[firstAlive] = Math.max(0, newEnemyHps[firstAlive] - dmg)
      log(`${member.name} (${atk.label}) → ${enemies[firstAlive].name} : −${dmg} HP`, 'playerAction')
    })

    // ── Victoire si tous les ennemis tombent ──────────────────────────────────
    if (newEnemyHps.every(h => h <= 0)) {
      // Collecter le loot de tous les ennemis
      const itemLoot = {}
      let lootGold = 0
      enemies.forEach(enemy => {
        const hpData = typeof enemy.hp === 'string' ? JSON.parse(enemy.hp) : (enemy.hp ?? {})
        const loot = hpData.loot ?? {}
        Object.entries(loot).forEach(([key, qty]) => {
          if (key === 'gold') lootGold += qty
          else itemLoot[key] = (itemLoot[key] ?? 0) + qty
        })
      })

      const goldGain = Math.floor(Math.random() * 5) + enemies.length + lootGold
      actions.applyEffects({ reputation: 1, gold: goldGain })
      if (Object.keys(itemLoot).length > 0) actions.collectLoot(itemLoot)

      const itemNames = Object.entries(itemLoot).map(([k, qty]) => `${qty}× ${ITEM_TYPES[k]?.label ?? k}`)
      const lootStr = itemNames.length > 0 ? ` Butin : ${itemNames.join(', ')}.` : ''
      log(`Tous les ennemis vaincus ! +${goldGain}g · +1 Réputation.${lootStr}`, 'narrative')

      // Persister hp.current=0 en base en préservant le reste (loot, max)
      enemies.forEach(enemy => {
        if (!enemy.id) return
        const hpData = typeof enemy.hp === 'string' ? JSON.parse(enemy.hp) : (enemy.hp ?? {})
        pb.collection('kratNpcs').update(enemy.id, { hp: { ...hpData, current: 0 } }).catch(() => {})
      })
      setEnemyHps(newEnemyHps)
      setLogs(prev => [...prev, ...roundLogs])
      setCurrentRound(r => r + 1)
      setIsOver(true)
      setOutcome('win')
      return
    }

    // Réajuster la cible si elle est morte
    if (newEnemyHps[targetIdx] <= 0) {
      const next = newEnemyHps.findIndex(h => h > 0)
      if (next !== -1) setTargetIdx(next)
    }

    // ── Chaque ennemi vivant riposte ─────────────────────────────────────────
    const aliveAllies = groupe.filter((_, ai) => (newAllyHps[ai] ?? 0) > 0)

    enemies.forEach((enemy, ei) => {
      if (newEnemyHps[ei] <= 0) return
      const atk    = pickRoleAttack(enemy.role)
      const eStats = typeof enemy.stats === 'string' ? JSON.parse(enemy.stats) : (enemy.stats ?? {})
      const bonus  = Math.max(0, Math.floor((eStats.force ?? 4) / 4))
      const rawDmg = rollDmg(atk) + bonus
      const dmg    = Math.max(0, Math.floor(rawDmg * npcDmgMult))
      const note   = npcDmgMult < 1 ? ' (réduit)' : ''

      // 70% joueur, 30% allié aléatoire (si présent)
      const hitAlly = aliveAllies.length > 0 && Math.random() < 0.3
      if (hitAlly) {
        const victim    = aliveAllies[Math.floor(Math.random() * aliveAllies.length)]
        const victimIdx = groupe.indexOf(victim)
        newAllyHps[victimIdx] = Math.max(0, (newAllyHps[victimIdx] ?? 0) - dmg)
        log(`${enemy.name} (${atk.label}) → ${victim.name} : −${dmg} HP${note}`, 'enemyAction')
      } else {
        if (dmg > 0) {
          actions.applyEffects({ forme: -dmg })
          log(`${enemy.name} (${atk.label}) → toi : −${dmg} Forme${note}`, 'enemyAction')
        } else {
          log(`${enemy.name} manque son coup !`, 'enemyAction')
        }
      }
    })

    setEnemyHps(newEnemyHps)
    setAllyHps(newAllyHps)
    setLogs(prev => [...prev, ...roundLogs])

    const nextRound = currentRound + 1
    setCurrentRound(nextRound)

    if (nextRound > 10) {
      setLogs(prev => [...prev, { time: `R${nextRound}`, text: `Épuisement mutuel. Le combat s'arrête.`, narrative: true }])
      setIsOver(true)
      setOutcome('draw')
    }
  }

  function handleFlee() {
    escapeToSafeCell()
    actions.applyEffects({ reputation: -2 })
    setIsOver(true)
    setOutcome('flee')
    setLogs(prev => [...prev, { time: `R${currentRound}`, text: `Tu fuis ! −2 Réputation.`, narrative: true }])
  }

  function handleEnd() { actions.exitBattle() }

  const playerHpCurrent = player.jauges.forme.current
  const playerHpMax     = player.jauges.forme.max

  return (
    <Box>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3">Engagement au Combat</Typography>
        {(enemies.length > 1 || groupe.length > 0) && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {groupe.length + 1} allié{groupe.length > 0 ? 's' : ''} · {enemies.length} ennemi{enemies.length > 1 ? 's' : ''}
          </Typography>
        )}
        <Divider sx={{ width: 120, mx: 'auto', mt: 1, borderColor: 'primary.main', opacity: 0.3 }} />
      </Box>

      <Grid container spacing={3}>

        {/* ── Zone de combat (8/12) ── */}
        <Grid item xs={12} lg={8}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

            {/* Viewport */}
            <Box sx={{
              position: 'relative', minHeight: 340, borderRadius: 4,
              overflow: 'hidden', border: '4px solid', borderColor: '#e6e3d3', boxShadow: 4,
            }}>
              {/* Fond d'arène */}
              {combat.arenaImageUrl && (
                <Box component="img" src={combat.arenaImageUrl}
                  sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
                    objectFit: 'cover', opacity: 0.5 }} />
              )}

              {/* Combattants */}
              <Box sx={{ position: 'relative', display: 'flex', gap: 2, p: 2.5, minHeight: 340 }}>

                {/* Alliés */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: '0 0 195px' }}>
                  <Typography variant="overline" sx={{
                    color: 'rgba(255,255,255,0.4)', fontSize: '0.55rem',
                    fontWeight: 700, letterSpacing: '0.12em',
                  }}>
                    ALLIÉS
                  </Typography>
                  <CombatantCard
                    name={player.name}
                    imageUrl={player.avatarUrl}
                    roleIcon="face"
                    hpCurrent={playerHpCurrent}
                    hpMax={playerHpMax}
                    isPlayer
                  />
                  {groupe.map((m, i) => (
                    <CombatantCard key={m.id ?? i}
                      name={m.name}
                      imageUrl={m.avatarUrl}
                      roleIcon={getRoleIcon(m.role)}
                      hpCurrent={allyHps[i] ?? 0}
                      hpMax={allyHpMaxes[i] ?? 10}
                      isAlly
                      isDead={(allyHps[i] ?? 0) <= 0}
                      defLabel={getDefLabel(m.role)}
                    />
                  ))}
                </Box>

                {/* VS */}
                <Box sx={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{
                    fontStyle: 'italic', fontWeight: 900, fontSize: '2rem',
                    color: 'rgba(136,115,100,0.22)', userSelect: 'none',
                  }}>
                    VS
                  </Typography>
                </Box>

                {/* Ennemis */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: '0 0 195px' }}>
                  <Typography variant="overline" sx={{
                    color: 'rgba(255,255,255,0.4)', fontSize: '0.55rem',
                    fontWeight: 700, letterSpacing: '0.12em', textAlign: 'right',
                  }}>
                    ENNEMIS
                  </Typography>
                  {enemies.map((enemy, i) => (
                    <CombatantCard key={enemy.id ?? i}
                      name={enemy.name}
                      imageUrl={enemy.avatarUrl}
                      roleIcon={getRoleIcon(enemy.role)}
                      hpCurrent={enemyHps[i]}
                      hpMax={enemyHpMaxes[i]}
                      isTarget={i === targetIdx && enemyHps[i] > 0}
                      isDead={enemyHps[i] <= 0}
                      defLabel={getDefLabel(enemy.role)}
                      onClick={!isOver && enemyHps[i] > 0 ? () => setTargetIdx(i) : undefined}
                    />
                  ))}
                  {enemies.length > 1 && !isOver && (
                    <Typography sx={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.55rem',
                      textAlign: 'right', mt: 0.5 }}>
                      Cliquer pour cibler
                    </Typography>
                  )}
                </Box>

              </Box>

              {isOver && outcome && <OutcomeOverlay outcome={outcome} onEnd={handleEnd} />}
            </Box>

            {/* Boutons d'action */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
              {combatActions.map(act => (
                <CombatBtn key={act.id} action={act} disabled={isOver}
                  onClick={act.isFlee ? handleFlee : () => playRound(act)} />
              ))}
            </Box>
          </Box>
        </Grid>

        {/* ── Chronique (4/12) ── */}
        <Grid item xs={12} lg={4}>
          <Paper variant="outlined" sx={{
            display: 'flex', flexDirection: 'column',
            height: { lg: 528 }, borderRadius: 3, overflow: 'hidden',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: 1, p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MaterialIcon icon="history_edu" sx={{ color: 'primary.main' }} />
                <Typography variant="h6">Chronique</Typography>
              </Box>
              <Typography variant="overline" color="text.disabled"
                sx={{ fontWeight: 700, fontSize: '0.65rem' }}>
                R{currentRound} / 10
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2.5,
              display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {logs.map((entry, i) => <LogEntry key={i} entry={entry} />)}
              <div ref={logEndRef} />
            </Box>

            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <LinearProgress variant="determinate"
                value={((currentRound - 1) / 10) * 100}
                sx={{ height: 4, borderRadius: 2, mb: 1 }} />
              <Typography variant="overline" color={isOver ? 'text.disabled' : 'primary'}
                sx={{ fontWeight: 700, letterSpacing: '0.1em', fontSize: '0.7rem' }}>
                {isOver ? 'Combat terminé' : 'Tour du Joueur'}
              </Typography>
            </Box>
          </Paper>
        </Grid>

      </Grid>
    </Box>
  )
}
