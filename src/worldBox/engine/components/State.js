// État courant d'un habitant
// current: 'idle' | 'moving' | 'foraging' | 'resting' | 'building' | 'socializing'
// target:  { x, y } destination ou null
// task:    contexte libre (ex: entity id de la ressource ciblée)
// timer:   ticks restants pour une action à durée fixe (ex: repos)
export default function State(current = 'idle') {
  return { current, target: null, task: null, timer: 0 };
}
