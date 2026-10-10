import PocketBase from 'pocketbase'
export const pb = new PocketBase('https://bdd.poilevey.org')

// Une victoire peut écrire les jauges puis le butin dans le même tick.
// Sérialiser les écritures évite l'autocancellation du SDK et leur inversion.
const recordWrites = new Map()
export function savePlayer(id, changes) {
  return queuePlayerWrite(id, () => pb.collection('kratPlayers').update(id, changes, { requestKey: null }))
}

export function queuePlayerWrite(id, operation) {
  if (!id) return Promise.reject(new Error('Personnage non chargé.'))
  return queueWrite(`player:${id}`, operation)
}

export function saveNpcLocation(id, location) {
  return queueWrite(`npc:${id}`, () =>
    pb.collection('kratNpcs').update(id, { location }, { requestKey: null })
  )
}

function queueWrite(key, operation) {
  const previous = recordWrites.get(key) ?? Promise.resolve()
  const write = previous.catch(() => {}).then(operation)
  recordWrites.set(key, write)
  const cleanup = () => { if (recordWrites.get(key) === write) recordWrites.delete(key) }
  write.then(cleanup, cleanup)
  return write
}
