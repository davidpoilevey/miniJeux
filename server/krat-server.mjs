import PocketBase from 'pocketbase';
import cron from 'node-cron';
import express from 'express';
import cors from 'cors';


const pb = new PocketBase('http://pocketbase:8090');
const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Private-Network', 'true');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
// ─── endOfDay ─────────────────────────────────────────────────────────────────

const endOfDay = async () => {
  console.log('🌙 Fin de journée...', new Date().toISOString());

  // Tout charger d'un coup
  const [joueurs, villes, batiments] = await Promise.all([
    pb.collection('kratPlayers').getFullList({ requestKey: null }),
    pb.collection('kratCities').getFullList({ requestKey: null }),
    pb.collection('kratBuildings').getFullList({ requestKey: null }),
  ])

  // Map playerName → kratCities record (pour les maires)
  const mayorMap = {}
  for (const v of villes) {
    if (v.mayor) mayorMap[v.mayor] = v
  }

  // Map buildingId → type (pour identifier les prisons)
  const buildingTypeMap = {}
  for (const b of batiments) {
    if (b.buildingId) buildingTypeMap[b.buildingId] = b.type
  }

  let liberated = 0, dismissed = 0
  const newsToCreate = []

  for (const j of joueurs) {
    const jauges   = typeof j.jauges   === 'string' ? JSON.parse(j.jauges)   : (j.jauges   ?? {})
    const stats    = typeof j.stats    === 'string' ? JSON.parse(j.stats)    : (j.stats    ?? {})
    const location = typeof j.location === 'string' ? JSON.parse(j.location) : (j.location ?? {})

    const updates = {}

    // ── Forme au max, faim à 0 ────────────────────────────────────────────────
    updates.jauges = {
      ...jauges,
      forme: { ...jauges.forme, current: jauges.forme?.max ?? 100 },
      faim:  { ...jauges.faim,  current: 0 },
    }

    newsToCreate.push({
      text:       'Vous récupérez toute votre forme, mais vous êtes affamé. Bonne journée',
      authorName: 'Systeme',
      target:     j.name,
      type:       'personal',
    })

    // ── Libération de prison (roomId 'prison' dans une mairie) ───────────────
    if (location.roomId === 'prison') {
      const btype = buildingTypeMap[location.building] ?? ''
      if (btype === 'mairie') {
        updates.location = { ...location, roomId: 'entrance' }
        const repJauge = updates.jauges.reputation ?? jauges.reputation ?? {}
        const maxRep = repJauge.max ?? 20
        updates.jauges = {
          ...updates.jauges,
          reputation: { ...repJauge, current: Math.min((repJauge.current ?? 0) + 2, maxRep) },
        }
        liberated++
        console.log(`🔓 ${j.name} libéré de ${location.building}`)
        newsToCreate.push({
          text:       'Vous avez été libéré de prison. +2 réputation. Tâchez de rester dans le droit chemin.',
          authorName: 'Systeme',
          target:     j.name,
          type:       'personal',
        })
      }
    }

    // ── Destitution maire ─────────────────────────────────────────────────────
    // charisme=20 → keepChance=1 (jamais destitué) ; charisme=0 → toujours destitué
    const charisme   = stats.charisme ?? 0
    const keepChance = Math.min(charisme / 20, 1)
    const mayorCity  = mayorMap[j.name]

    if (mayorCity && Math.random() > keepChance) {
      await pb.collection('kratCities').update(mayorCity.id, { mayor: '' })
        .catch(e => console.error(`⚠️ Destitution ${j.name}:`, e.message))
      dismissed++
      console.log(`👑 ${j.name} destitué à ${mayorCity.name ?? mayorCity.cityId}`)
      newsToCreate.push({
        text:       `Le maire ${j.name} a terminé son mandat, la place est libre`,
        authorName: 'Systeme',
        target:     j.name,
        type:       'official',
      })
    }

    await pb.collection('kratPlayers').update(j.id, updates)
      .catch(e => console.error(`⚠️ Joueur ${j.name}:`, e.message))
  }

  // ── Écriture des kratNews en parallèle ────────────────────────────────────
  await Promise.all(
    newsToCreate.map(n => pb.collection('kratNews').create(n).catch(e => console.error('⚠️ kratNews:', e.message)))
  )

  // ── Nettoyage : supprimer les kratNews de plus d'une semaine ──────────────
  const weekAgo    = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const weekAgoStr = weekAgo.toISOString().replace('T', ' ')
  try {
    const oldNews = await pb.collection('kratNews').getFullList({
      filter: `created < "${weekAgoStr}"`,
      requestKey: null,
    })
    await Promise.all(oldNews.map(n => pb.collection('kratNews').delete(n.id).catch(() => {})))
    if (oldNews.length) console.log(`🗑️  ${oldNews.length} kratNews supprimée(s)`)
  } catch (e) {
    console.error('⚠️ Nettoyage kratNews:', e.message)
  }

  const summary = {
    joueurs:   joueurs.length,
    liberated,
    dismissed,
    news:      newsToCreate.length,
    timestamp: new Date().toISOString(),
  }
  console.log(`✅ ${joueurs.length} joueurs — ${liberated} libéré(s) — ${dismissed} maire(s) destitué(s) — ${newsToCreate.length} news`)
  return summary
}

// ─── Cron : minuit automatique ────────────────────────────────────────────────

cron.schedule('0 0 * * *', endOfDay)

// ─── Endpoint debug depuis l'interface admin ──────────────────────────────────

app.post('/api/end-of-day', async (req, res) => {
  try {
    const summary = await endOfDay()
    res.json({ ok: true, ...summary })
  } catch (e) {
    console.error('endOfDay error:', e)
    res.status(500).json({ ok: false, error: e.message })
  }
})
app.listen(3000, '0.0.0.0', () => console.log('🎮 Krat-server sur le port 3000'))
