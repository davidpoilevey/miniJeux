import { useState }          from 'react'
import Box                   from '@mui/material/Box'
import Typography            from '@mui/material/Typography'
import TextField             from '@mui/material/TextField'
import Button                from '@mui/material/Button'
import CircularProgress      from '@mui/material/CircularProgress'
import { pb }                from '../services/pb'
import { KratProvider }      from '../context/KratContext'

const STORAGE_KEY = 'kratUser'

const NEW_PLAYER_DEFAULTS = {
  gold:      100,
  avatarUrl: '',

  stats: {
    force:        5,
    intelligence: 5,
    charisme:     5,
    bonus: { force: 0, intelligence: 0, charisme: 0 },
      pointsDivins: { current: 20, max: 20 }
  },
  jauges: {
    forme:      { current: 24, max: 24 },
    faim:       { current: 20, max: 20 },
    reputation: { current: 10, max: 20 },
  },
  location: { position: '0,0', city: 'haguenau', building: 'gilded-griffin', roomId: 'entrance' },
}

function readStoredUser() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) } catch { return null }
}

// ─── Écran de création ────────────────────────────────────────────────────────

function CreationForm({ onCreated }) {
  const [name,    setName]    = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) { setError('Donnez-vous un nom, voyageur.'); return }

    setLoading(true)
    try {
      const record = await pb.collection('kratPlayers').create({
        ...NEW_PLAYER_DEFAULTS,
        name:          trimmed,
        lastLoginDate: new Date().toISOString().split('T')[0],
      })
      const user = { pbId: record.id, name: record.name }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
      onCreated(user)
    } catch {
      setError('Erreur lors de la création. Réessayez.')
      setLoading(false)
    }
  }

  return (
    <Box sx={{
      minHeight:      '100vh',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      bgcolor:        '#f5f2eb',
    }}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display:       'flex',
          flexDirection: 'column',
          alignItems:    'center',
          gap:           3,
          maxWidth:      360,
          width:         '100%',
          px:            4,
        }}
      >
        {/* Titre */}
        <Typography
          variant="h2"
          sx={{ fontStyle: 'italic', color: 'primary.main', letterSpacing: '-1.5px', userSelect: 'none' }}
        >
          Kratland
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: 'center', fontStyle: 'italic', lineHeight: 1.6 }}
        >
          Bienvenue, voyageur.<br />Quel nom portez-vous ?
        </Typography>

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Votre nom dans ce monde"
          value={name}
          onChange={e => { setName(e.target.value); setError('') }}
          error={!!error}
          helperText={error || ' '}
          autoFocus
          inputProps={{ maxLength: 32 }}
          onKeyDown={e => e.key === 'Enter' && handleSubmit(e)}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading || !name.trim()}
          sx={{ py: 1.5, fontSize: '0.95rem' }}
        >
          {loading
            ? <CircularProgress size={20} sx={{ color: 'inherit' }} />
            : 'Entrer dans le monde'
          }
        </Button>
      </Box>
    </Box>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function LoginGate({ children }) {
  const [user, setUser] = useState(() => readStoredUser())

  function handleAuthError() {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  if (!user) return <CreationForm onCreated={setUser} />

  return (
    <KratProvider pbId={user.pbId} onAuthError={handleAuthError}>
      {children}
    </KratProvider>
  )
}
