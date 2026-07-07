/**
 * AdminPanel — Outil d'administration Kratland (dev only).
 * Accès : bouton engrenage discret près du titre dans HUDJoueur.
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import Dialog        from '@mui/material/Dialog'
import DialogTitle   from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import Tabs          from '@mui/material/Tabs'
import Tab           from '@mui/material/Tab'
import Box           from '@mui/material/Box'
import Button        from '@mui/material/Button'
import TextField     from '@mui/material/TextField'
import Select        from '@mui/material/Select'
import MenuItem      from '@mui/material/MenuItem'
import FormControl   from '@mui/material/FormControl'
import InputLabel    from '@mui/material/InputLabel'
import Table         from '@mui/material/Table'
import TableBody     from '@mui/material/TableBody'
import TableCell     from '@mui/material/TableCell'
import TableHead     from '@mui/material/TableHead'
import TableRow      from '@mui/material/TableRow'
import IconButton    from '@mui/material/IconButton'
import Typography    from '@mui/material/Typography'
import Alert         from '@mui/material/Alert'
import Divider       from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import MaterialIcon  from '../MaterialIcon'
import { pb }        from '../../services/pb'
import { CITY_GEO, BUILDING_TYPES, ROOM_CONFIGS, ITEM_TYPES } from '../../data/catalog'

const CELL = 20

// ─── Grille de placement (bâtiments) ─────────────────────────────────────────

function PlacementGrid({ width = 12, height = 8, markers = [], selected, onSelect }) {
  const idx = Object.fromEntries(markers.map(m => [m.position, m]))
  return (
    <Box sx={{ display: 'inline-flex', flexDirection: 'column', border: '1px solid', borderColor: 'divider', mt: 1 }}>
      {Array.from({ length: height }, (_, row) => (
        <Box key={row} sx={{ display: 'flex' }}>
          {Array.from({ length: width }, (_, col) => {
            const pos  = `${col},${row}`
            const mark = idx[pos]
            const sel  = pos === selected
            return (
              <Box key={pos} onClick={() => onSelect(pos)} title={mark ? `${mark.label} (${pos})` : pos}
                sx={{
                  width: CELL, height: CELL, flexShrink: 0,
                  border: '1px solid rgba(0,0,0,0.07)',
                  bgcolor: sel ? 'primary.main' : mark ? 'rgba(152,67,0,0.18)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: sel ? 'primary.dark' : 'rgba(152,67,0,0.3)' },
                  transition: 'background-color 0.08s',
                }}
              >
                {sel  && <MaterialIcon icon="place"    sx={{ fontSize: '12px', color: '#fff',         lineHeight: 1 }} />}
                {!sel && mark && <MaterialIcon icon={mark.icon ?? 'home_work'} sx={{ fontSize: '11px', color: 'primary.dark', lineHeight: 1 }} />}
              </Box>
            )
          })}
        </Box>
      ))}
    </Box>
  )
}

// ─── Tab : Villes ─────────────────────────────────────────────────────────────

const CITY_BLANK = { cityId: '', name: '', mayor: '' }

function VillesTab() {
  const [rows,    setRows]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [form,    setForm]    = useState(CITY_BLANK)
  const [editId,  setEditId]  = useState(null)

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try   { setRows(await pb.collection('kratCities').getFullList({ sort: 'name' })) }
    catch (e) { setError(e.message) }
    finally   { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  function edit(r) {
    setEditId(r.id)
    setForm({ cityId: r.cityId ?? '', name: r.name ?? '', mayor: r.mayor ?? '' })
  }
  function reset() { setEditId(null); setForm(CITY_BLANK) }

  async function save() {
    setError('')
    try {
      editId
        ? await pb.collection('kratCities').update(editId, form)
        : await pb.collection('kratCities').create(form)
      reset(); load()
    } catch (e) { setError(e.message) }
  }

  async function del(id) {
    if (!window.confirm('Supprimer cette ville ?')) return
    try { await pb.collection('kratCities').delete(id); load() }
    catch (e) { setError(e.message) }
  }

  const fi = k => ({ size: 'small', fullWidth: true, sx: { mb: 1.5 },
    value: form[k], onChange: e => setForm(p => ({ ...p, [k]: e.target.value })) })

  return (
    <Box sx={{ display: 'flex', gap: 4, pt: 2 }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {loading && <CircularProgress size={20} />}
        {error   && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>cityId</TableCell><TableCell>Nom</TableCell>
              <TableCell>Mayor</TableCell><TableCell width={80} />
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r.id} hover selected={r.id === editId}>
                <TableCell>{r.cityId}</TableCell>
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.mayor}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => edit(r)}>
                    <MaterialIcon icon="edit" sx={{ fontSize: '1rem' }} />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => del(r.id)}>
                    <MaterialIcon icon="delete" sx={{ fontSize: '1rem' }} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      <Box sx={{ width: 260, flexShrink: 0 }}>
        <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
          {editId ? 'Modifier la ville' : 'Nouvelle ville'}
        </Typography>
        <TextField label="cityId" {...fi('cityId')}
          helperText={CITY_GEO[form.cityId] ? `✓ dans catalog (${CITY_GEO[form.cityId].width}×${CITY_GEO[form.cityId].height})` : 'hors catalog'} />
        <TextField label="Nom"   {...fi('name')}  />
        <TextField label="Mayor" {...fi('mayor')} />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="contained" size="small" onClick={save} fullWidth>
            {editId ? 'Enregistrer' : 'Créer'}
          </Button>
          {editId && <Button size="small" onClick={reset} fullWidth>Annuler</Button>}
        </Box>
      </Box>
    </Box>
  )
}

// ─── Tab : Bâtiments ──────────────────────────────────────────────────────────

const BLDG_ICONS = { taverne:'local_bar', mairie:'account_balance', forge:'hardware', marche:'storefront', temple:'temple_hindu' }
const BLDG_BLANK = { buildingId: '', name: '', type: 'taverne', roomConfig: 'entrance_shop', position: '' }

function BatimentsTab() {
  const [cities,   setCities]   = useState([])
  const [rows,     setRows]     = useState([])
  const [cityId,   setCityId]   = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [form,     setForm]     = useState(BLDG_BLANK)
  const [editId,   setEditId]   = useState(null)

  useEffect(() => {
    pb.collection('kratCities').getFullList({ sort: 'name' })
      .then(setCities).catch(e => setError(e.message))
  }, [])

  const loadBuildings = useCallback(async (cid) => {
    if (!cid) { setRows([]); return }
    setLoading(true); setError('')
    try   { setRows(await pb.collection('kratBuildings').getFullList({ filter: `cityId='${cid}'` })) }
    catch (e) { setError(e.message) }
    finally   { setLoading(false) }
  }, [])

  function pickCity(cid) { setCityId(cid); loadBuildings(cid); reset() }
  function reset()       { setEditId(null); setForm(BLDG_BLANK) }
  function edit(r) {
    setEditId(r.id)
    setForm({ buildingId: r.buildingId ?? '', name: r.name ?? '',
              type: r.type ?? 'taverne', roomConfig: r.roomConfig ?? 'entrance', position: r.position ?? '' })
  }

  async function save() {
    setError('')
    try {
      const data = { ...form, cityId }
      editId
        ? await pb.collection('kratBuildings').update(editId, data)
        : await pb.collection('kratBuildings').create(data)
      reset(); loadBuildings(cityId)
    } catch (e) { setError(e.message) }
  }

  async function del(id) {
    if (!window.confirm('Supprimer ce bâtiment ?')) return
    try { await pb.collection('kratBuildings').delete(id); loadBuildings(cityId) }
    catch (e) { setError(e.message) }
  }

  const fi = k => ({ size: 'small', fullWidth: true, sx: { mb: 1.5 },
    value: form[k], onChange: e => setForm(p => ({ ...p, [k]: e.target.value })) })

  const geo     = CITY_GEO[cityId] ?? { width: 12, height: 8 }
  const markers = rows
    .filter(b => !editId || b.id !== editId)
    .map(b => ({ position: b.position, label: b.name, icon: BLDG_ICONS[b.type] ?? 'home_work' }))

  return (
    <Box sx={{ pt: 2 }}>
      {error && <Alert severity="error" sx={{ mb: 1.5 }}>{error}</Alert>}

      <FormControl size="small" sx={{ minWidth: 220, mb: 2 }}>
        <InputLabel>Ville</InputLabel>
        <Select value={cityId} label="Ville" onChange={e => pickCity(e.target.value)}>
          {cities.map(c => <MenuItem key={c.cityId} value={c.cityId}>{c.name}</MenuItem>)}
        </Select>
      </FormControl>

      {cityId && (
        <Box sx={{ display: 'flex', gap: 4 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {loading && <CircularProgress size={20} />}
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nom</TableCell><TableCell>buildingId</TableCell>
                  <TableCell>Type</TableCell><TableCell>Pos.</TableCell>
                  <TableCell>Pièces</TableCell><TableCell width={80} />
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map(r => (
                  <TableRow key={r.id} hover selected={r.id === editId}>
                    <TableCell>{r.name}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'text.secondary' }}>{r.buildingId}</TableCell>
                    <TableCell>{r.type}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{r.position}</TableCell>
                    <TableCell sx={{ fontSize: '0.75rem' }}>{r.roomConfig}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => edit(r)}>
                        <MaterialIcon icon="edit" sx={{ fontSize: '1rem' }} />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => del(r.id)}>
                        <MaterialIcon icon="delete" sx={{ fontSize: '1rem' }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>

          <Box sx={{ width: 300, flexShrink: 0 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
              {editId ? 'Modifier' : 'Nouveau bâtiment'}
            </Typography>
            <TextField label="buildingId" {...fi('buildingId')} />
            <TextField label="Nom"        {...fi('name')}       />

            <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
              <InputLabel>Type</InputLabel>
              <Select value={form.type} label="Type"
                onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                {Object.entries(BUILDING_TYPES).map(([k, v]) =>
                  <MenuItem key={k} value={k}>{v.label}</MenuItem>)}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
              <InputLabel>Pièces</InputLabel>
              <Select value={form.roomConfig} label="Pièces"
                onChange={e => setForm(p => ({ ...p, roomConfig: e.target.value }))}>
                {Object.keys(ROOM_CONFIGS).map(k =>
                  <MenuItem key={k} value={k}>{k}</MenuItem>)}
              </Select>
            </FormControl>

            <Typography variant="caption" color={form.position ? 'primary' : 'text.disabled'}>
              Position : <strong>{form.position || 'cliquer sur la grille'}</strong>
            </Typography>
            <PlacementGrid
              width={geo.width} height={geo.height}
              markers={markers} selected={form.position}
              onSelect={pos => setForm(p => ({ ...p, position: pos }))}
            />

            <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
              <Button variant="contained" size="small" onClick={save}
                disabled={!form.position || !form.name} fullWidth>
                {editId ? 'Enregistrer' : 'Créer'}
              </Button>
              {editId && <Button size="small" onClick={reset} fullWidth>Annuler</Button>}
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  )
}

// ─── Tab : PNJs ───────────────────────────────────────────────────────────────

const NPC_BLANK = {
  name: '', role: '', avatarUrl: '', action: 'Parler',
  force: 5, intelligence: 5, charisme: 5,
  hpMax: 20,
  locCity: '', locBuilding: '', locRoomId: '', locPosition: '',
  respawnDelay: '',
  shopItems: [],
  missionIntro: '', missionQuestions: [], missionOptions: [],
}

function NpcsTab() {
  const [rows,      setRows]      = useState([])
  const [cities,    setCities]    = useState([])
  const [buildings, setBuildings] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [form,      setForm]      = useState(NPC_BLANK)
  const [editId,    setEditId]    = useState(null)

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const [npcList, cityList] = await Promise.all([
        pb.collection('kratNpcs').getFullList({ sort: 'name' }),
        pb.collection('kratCities').getFullList({ sort: 'name' }),
      ])
      setRows(npcList); setCities(cityList)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (!form.locCity) { setBuildings([]); return }
    pb.collection('kratBuildings')
      .getFullList({ filter: `cityId='${form.locCity}'`, sort: 'name' })
      .then(setBuildings)
      .catch(() => setBuildings([]))
  }, [form.locCity])

  useEffect(() => { load() }, [load])

  function edit(r) {
    setEditId(r.id)
    const loc = r.location ?? {}
    const stats = r.stats ?? {}
    const shop = Array.isArray(r.shop) ? r.shop : []
    const mission = r.mission ?? {}
    setForm({
      name: r.name ?? '', role: r.role ?? '', avatarUrl: r.avatarUrl ?? '',
      action: r.action ?? 'Parler',
      force: stats.force ?? 5, intelligence: stats.intelligence ?? 5, charisme: stats.charisme ?? 5,
      hpMax: r.hp?.max ?? 20,
      locCity: loc.city ?? '', locBuilding: loc.building ?? '',
      locRoomId: loc.roomId ?? '', locPosition: loc.position ?? '',
      respawnDelay: r.respawnDelay ?? '',
      shopItems: shop.map(i => ({ typeId: i.typeId ?? '', price: i.price ?? '', tradeFor: i.tradeFor ?? '' })),
      missionIntro: mission.intro ?? '',
      missionQuestions: Array.isArray(mission.questions) ? [...mission.questions] : [],
      missionOptions: Array.isArray(mission.options)
        ? mission.options.map(o => ({ label: o.label ?? '', hint: o.hint ?? '' }))
        : [],
    })
  }
  function reset() { setEditId(null); setForm(NPC_BLANK) }

  async function save() {
    setError('')
    const inBuilding = !!form.locBuilding
    const data = {
      name: form.name, role: form.role, avatarUrl: form.avatarUrl, action: form.action,
      stats: { force: +form.force, intelligence: +form.intelligence, charisme: +form.charisme },
      hp:    { current: +form.hpMax, max: +form.hpMax },
      location: {
        position: inBuilding ? null : (form.locPosition || null),
        city:     form.locCity     || null,
        building: form.locBuilding || null,
        roomId:   form.locRoomId   || null,
      },
      respawnDelay: form.respawnDelay === '' ? null : +form.respawnDelay,
      shop: form.action === 'Commercer'
        ? form.shopItems.filter(i => i.typeId).map(i => ({
            typeId: i.typeId,
            ...(i.price !== '' && i.price != null ? { price: +i.price } : {}),
            ...(i.tradeFor ? { tradeFor: i.tradeFor } : {}),
          }))
        : null,
      mission: form.action === 'Mission'
        ? {
            intro:     form.missionIntro,
            questions: form.missionQuestions.filter(q => q.trim()),
            options:   form.missionOptions
              .filter(o => o.label.trim())
              .map(o => ({ label: o.label, hint: o.hint || null })),
          }
        : null,
    }
    try {
      editId
        ? await pb.collection('kratNpcs').update(editId, data)
        : await pb.collection('kratNpcs').create(data)
      reset(); load()
    } catch (e) { setError(e.message) }
  }

  async function del(id) {
    if (!window.confirm('Supprimer ce PNJ ?')) return
    try { await pb.collection('kratNpcs').delete(id); load() }
    catch (e) { setError(e.message) }
  }

  const fi = (k, extra = {}) => ({
    size: 'small', fullWidth: true, sx: { mb: 1.5 },
    value: form[k], onChange: e => setForm(p => ({ ...p, [k]: e.target.value })),
    ...extra,
  })

  function locSummary(r) {
    const l = r.location
    if (!l) return '—'
    if (l.building) return `${l.building} › ${l.roomId ?? '?'}`
    if (l.city)     return `${l.city} @ ${l.position}`
    return `world @ ${l.position}`
  }

  return (
    <Box sx={{ display: 'flex', gap: 4, pt: 2 }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {loading && <CircularProgress size={20} />}
        {error   && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell><TableCell>Rôle</TableCell>
              <TableCell>Action</TableCell><TableCell>Localisation</TableCell>
              <TableCell width={80} />
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r.id} hover selected={r.id === editId}>
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.role}</TableCell>
                <TableCell>{r.action}</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.72rem' }}>{locSummary(r)}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => edit(r)}>
                    <MaterialIcon icon="edit" sx={{ fontSize: '1rem' }} />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => del(r.id)}>
                    <MaterialIcon icon="delete" sx={{ fontSize: '1rem' }} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      <Box sx={{ width: 280, flexShrink: 0 }}>
        <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
          {editId ? 'Modifier le PNJ' : 'Nouveau PNJ'}
        </Typography>

        <TextField label="Nom"       {...fi('name')}      />
        <TextField label="Rôle"      {...fi('role')}      />
        <TextField label="avatarUrl" {...fi('avatarUrl')} />

        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel>Action</InputLabel>
          <Select value={form.action} label="Action"
            onChange={e => setForm(p => ({ ...p, action: e.target.value }))}>
            {['Parler', 'Commercer', 'Mission', 'Attaquer', 'Inspecter', 'Embaucher'].map(a =>
              <MenuItem key={a} value={a}>{a}</MenuItem>)}
          </Select>
        </FormControl>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Stats</Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
          <TextField label="For" {...fi('force')}        type="number" sx={{ mb: 0 }} />
          <TextField label="Int" {...fi('intelligence')} type="number" sx={{ mb: 0 }} />
          <TextField label="Cha" {...fi('charisme')}     type="number" sx={{ mb: 0 }} />
        </Box>

        <TextField label="HP max" {...fi('hpMax')} type="number" />
        <TextField label="Respawn (min, vide=immortel)" {...fi('respawnDelay')} type="number" />

        {/* ── Éditeur Boutique ── */}
        {form.action === 'Commercer' && (
          <Box sx={{ mt: 0.5, mb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">Boutique</Typography>
              <IconButton size="small" onClick={() => setForm(p => ({ ...p, shopItems: [...p.shopItems, { typeId: '', price: '', tradeFor: '' }] }))}>
                <MaterialIcon icon="add" sx={{ fontSize: '1rem' }} />
              </IconButton>
            </Box>
            {form.shopItems.map((item, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 0.5, mb: 0.75, alignItems: 'center' }}>
                <FormControl size="small" sx={{ flex: 2, minWidth: 0 }}>
                  <InputLabel sx={{ fontSize: '0.72rem' }}>Item</InputLabel>
                  <Select value={item.typeId} label="Item"
                    onChange={e => setForm(p => ({ ...p, shopItems: p.shopItems.map((it, j) => j === i ? { ...it, typeId: e.target.value } : it) }))}>
                    {Object.entries(ITEM_TYPES).map(([k, v]) =>
                      <MenuItem key={k} value={k} sx={{ fontSize: '0.75rem' }}>{v.label}</MenuItem>)}
                  </Select>
                </FormControl>
                <TextField size="small" label="Or" type="number" sx={{ width: 56 }}
                  value={item.price}
                  onChange={e => setForm(p => ({ ...p, shopItems: p.shopItems.map((it, j) => j === i ? { ...it, price: e.target.value } : it) }))} />
                <FormControl size="small" sx={{ flex: 2, minWidth: 0 }}>
                  <InputLabel sx={{ fontSize: '0.72rem' }}>Échange</InputLabel>
                  <Select value={item.tradeFor} label="Échange"
                    onChange={e => setForm(p => ({ ...p, shopItems: p.shopItems.map((it, j) => j === i ? { ...it, tradeFor: e.target.value } : it) }))}>
                    <MenuItem value="">—</MenuItem>
                    {Object.entries(ITEM_TYPES).map(([k, v]) =>
                      <MenuItem key={k} value={k} sx={{ fontSize: '0.75rem' }}>{v.label}</MenuItem>)}
                  </Select>
                </FormControl>
                <IconButton size="small" color="error"
                  onClick={() => setForm(p => ({ ...p, shopItems: p.shopItems.filter((_, j) => j !== i) }))}>
                  <MaterialIcon icon="delete" sx={{ fontSize: '0.9rem' }} />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}

        {/* ── Éditeur Mission ── */}
        {form.action === 'Mission' && (
          <Box sx={{ mt: 0.5, mb: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Mission</Typography>
            <TextField label="Intro (discours du PNJ)" multiline rows={2} fullWidth size="small" sx={{ mb: 1 }}
              value={form.missionIntro}
              onChange={e => setForm(p => ({ ...p, missionIntro: e.target.value }))} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="caption" color="text.disabled">Questions</Typography>
              <IconButton size="small" onClick={() => setForm(p => ({ ...p, missionQuestions: [...p.missionQuestions, ''] }))}>
                <MaterialIcon icon="add" sx={{ fontSize: '0.9rem' }} />
              </IconButton>
            </Box>
            {form.missionQuestions.map((q, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
                <TextField size="small" fullWidth placeholder="Question posée au joueur" value={q}
                  onChange={e => setForm(p => ({ ...p, missionQuestions: p.missionQuestions.map((q2, j) => j === i ? e.target.value : q2) }))} />
                <IconButton size="small" color="error"
                  onClick={() => setForm(p => ({ ...p, missionQuestions: p.missionQuestions.filter((_, j) => j !== i) }))}>
                  <MaterialIcon icon="delete" sx={{ fontSize: '0.9rem' }} />
                </IconButton>
              </Box>
            ))}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5, mt: 0.5 }}>
              <Typography variant="caption" color="text.disabled">Options / Réponses</Typography>
              <IconButton size="small" onClick={() => setForm(p => ({ ...p, missionOptions: [...p.missionOptions, { label: '', hint: '' }] }))}>
                <MaterialIcon icon="add" sx={{ fontSize: '0.9rem' }} />
              </IconButton>
            </Box>
            {form.missionOptions.map((opt, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
                <TextField size="small" label="Réponse" sx={{ flex: 1 }} value={opt.label}
                  onChange={e => setForm(p => ({ ...p, missionOptions: p.missionOptions.map((o, j) => j === i ? { ...o, label: e.target.value } : o) }))} />
                <TextField size="small" label="Indice" sx={{ flex: 1 }} value={opt.hint}
                  onChange={e => setForm(p => ({ ...p, missionOptions: p.missionOptions.map((o, j) => j === i ? { ...o, hint: e.target.value } : o) }))} />
                <IconButton size="small" color="error"
                  onClick={() => setForm(p => ({ ...p, missionOptions: p.missionOptions.filter((_, j) => j !== i) }))}>
                  <MaterialIcon icon="delete" sx={{ fontSize: '0.9rem' }} />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}

        <Divider sx={{ my: 1.5 }} />
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Localisation</Typography>

        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel>Ville</InputLabel>
          <Select value={form.locCity} label="Ville"
            onChange={e => setForm(p => ({ ...p, locCity: e.target.value, locBuilding: '', locRoomId: '', locPosition: '' }))}>
            <MenuItem value="">—</MenuItem>
            {cities.map(c => <MenuItem key={c.cityId} value={c.cityId}>{c.name}</MenuItem>)}
          </Select>
        </FormControl>

        {form.locCity && (
          <>
            <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
              <InputLabel>Bâtiment (vide = sur la carte)</InputLabel>
              <Select value={form.locBuilding} label="Bâtiment (vide = sur la carte)"
                onChange={e => setForm(p => ({ ...p, locBuilding: e.target.value, locRoomId: '', locPosition: '' }))}>
                <MenuItem value="">— Sur la carte —</MenuItem>
                {buildings.map(b => (
                  <MenuItem key={b.id} value={b.buildingId}>
                    {b.name}
                    <Typography component="span" variant="caption" color="text.disabled" sx={{ ml: 1 }}>
                      [{b.buildingId}]
                    </Typography>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {form.locBuilding
              ? <TextField label="RoomId" {...fi('locRoomId')} />
              : <TextField label="Position (col,row)" {...fi('locPosition')} />
            }
          </>
        )}

        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
          <Button variant="contained" size="small" onClick={save} disabled={!form.name} fullWidth>
            {editId ? 'Enregistrer' : 'Créer'}
          </Button>
          {editId && <Button size="small" onClick={reset} fullWidth>Annuler</Button>}
        </Box>
      </Box>
    </Box>
  )
}

// ─── Bouton Fin de journée ────────────────────────────────────────────────────

const EOD_URL = '/api/end-of-day'

function EndOfDayButton() {
  const [status, setStatus] = useState(null) // null | 'loading' | 'ok' | 'error'
  const [info,   setInfo]   = useState('')
  const timerRef = useRef(null)

  async function trigger() {
    setStatus('loading'); setInfo('')
    clearTimeout(timerRef.current)
    try {
      const res  = await fetch(EOD_URL, { method: 'POST' })
      const data = await res.json()
      if (data.ok) {
        setStatus('ok')
        setInfo(`${data.joueurs} joueurs · ${data.liberated} libéré(s) · ${data.dismissed} destitué(s)`)
      } else {
        setStatus('error'); setInfo(data.error ?? 'Erreur inconnue')
      }
    } catch (e) {
      setStatus('error'); setInfo(e.message)
    }
    timerRef.current = setTimeout(() => setStatus(null), 6000)
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {status === 'ok'    && <Typography variant="caption" color="success.main"  sx={{ fontStyle: 'italic' }}>{info}</Typography>}
      {status === 'error' && <Typography variant="caption" color="error.main"    sx={{ fontStyle: 'italic' }}>{info}</Typography>}
      <Button
        size="small"
        variant="outlined"
        color={status === 'error' ? 'error' : 'primary'}
        disabled={status === 'loading'}
        startIcon={status === 'loading'
          ? <CircularProgress size={14} />
          : <MaterialIcon icon="nights_stay" sx={{ fontSize: '1rem !important' }} />}
        onClick={trigger}
        sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}
      >
        Fin de journée
      </Button>
    </Box>
  )
}

// ─── AdminPanel ───────────────────────────────────────────────────────────────

export default function AdminPanel({ open, onClose }) {
  const [tab, setTab] = useState(0)
  return (
    <Dialog open={open} onClose={onClose} fullScreen
      PaperProps={{ sx: { bgcolor: 'background.default' } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MaterialIcon icon="admin_panel_settings" sx={{ color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
            Administration Kratland
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EndOfDayButton />
          <IconButton onClick={onClose}>
            <MaterialIcon icon="close" />
          </IconButton>
        </Box>
      </DialogTitle>
      <Divider />
      <Box sx={{ px: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Villes" />
          <Tab label="Bâtiments" />
          <Tab label="PNJs" />
        </Tabs>
      </Box>
      <DialogContent sx={{ px: 3 }}>
        {tab === 0 && <VillesTab />}
        {tab === 1 && <BatimentsTab />}
        {tab === 2 && <NpcsTab />}
      </DialogContent>
    </Dialog>
  )
}
