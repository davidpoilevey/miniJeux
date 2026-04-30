import { useState } from 'react'
import { Box, Button, Typography, Paper, LinearProgress, Stack } from '@mui/material'

// CombatView.jsx
import { useKrat } from '../../context/KratContext'


export  function BattlePanel({ pnj, player, actions, applyEffects }) {
  const [currentRound, setCurrentRound] = useState(1)
  const [pnjHp, setPnjHp] = useState(pnj.hp.current)
  const [logs, setLogs] = useState([`Le combat contre ${pnj.name} commence !`])
  const [isOver, setIsOver] = useState(false)

  const playerForce = player.stats.force + player.stats.bonus.force

  // --- Logique d'un Tour ---
  const playRound = (actionType) => {
    if (isOver || currentRound > 10) return

    let newPnjHp = pnjHp
    const newLogs = []

    // 1. Action du Joueur
    let pDamage = 0
    let actionLabel = ""

    if (actionType === 'attaquer') {
      pDamage = Math.floor(Math.random() * playerForce) + 2
      actionLabel = `Tu frappes fort : -${pDamage} HP`
    } else if (actionType === 'precis') {
      pDamage = Math.floor(playerForce / 2) + 4
      actionLabel = `Coup précis : -${pDamage} HP`
    }

    newPnjHp -= pDamage
    newLogs.push(`R${currentRound} - Joueur : ${actionLabel}`)

    // 2. Réplique du PNJ (si vivant)
    if (newPnjHp > 0) {
      const pDamageDealt = Math.floor(Math.random() * 3) // Dégâts symboliques (pour l'instant)
      newLogs.push(`R${currentRound} - ${pnj.name} : Te bouscule (Effet mineur)`)
    }

    // Mise à jour de l'état local
    setPnjHp(Math.max(0, newPnjHp))
    setLogs(prev => [...newLogs, ...prev])
    setCurrentRound(prev => prev + 1)

    // Check fin de combat
    if (newPnjHp <= 0) {
      setIsOver(true)
      // On applique les effets réels ici (XP imaginaire ou loot ?)
      applyEffects({ reputation: 1 }) 
      applyEffects({ gold: Math.floor(Math.random() * 5) });
    } else if (currentRound >= 10) {
      setIsOver(true)
      setLogs(prev => ["Le combat s'arrête par épuisement...", ...prev])
    }
  }

  const handleFlee = () => {
    applyEffects({ reputation: -2 })
    // actions.exitBattle()
  }

  return (
    <Paper sx={{ p: 2, border: '3px solid #3e2723', bgcolor: '#fefae0' }}>
      <Typography variant="h6">⚔️ Round {currentRound} / 10</Typography>
      
      {/* Barre de vie du PNJ */}
      <Box sx={{ my: 1 }}>
        <Typography variant="caption">{pnj.name} : {pnjHp} HP</Typography>
        <LinearProgress 
            variant="determinate" 
            value={(pnjHp / pnj.hp.max) * 100} 
            color="error" 
            sx={{ height: 8, borderRadius: 2 }} 
        />
      </Box>

      {!isOver ? (
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Button variant="contained" onClick={() => playRound('attaquer')}>Frapper</Button>
          <Button variant="contained" color="secondary" onClick={() => playRound('precis')}>Précision</Button>
          <Button variant="outlined" color="error" onClick={handleFlee}>Fuir</Button>
        </Stack>
      ) : (
        <Button fullWidth variant="contained" color="success" onClick={() => {/* fermer combat */}}>
            Terminer
        </Button>
      )}

      {/* Logs de combat style console */}
      <Box sx={{ 
        height: 120, overflowY: 'auto', bgcolor: '#283618', 
        color: '#fefae0', p: 1, fontSize: '0.75rem', fontFamily: 'monospace' 
      }}>
        {logs.map((l, i) => <div key={i}>{l}</div>)}
      </Box>
    </Paper>
  )
}