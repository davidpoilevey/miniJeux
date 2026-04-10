/**
 * SpeciesComp — identité écologique d'une entité
 * Distingue les individus joueur des NPC, et porte le rôle/comportement.
 */
export class SpeciesComp {
  constructor(speciesId, isPlayer = false, role = 'prey', behavior = 'solitary') {
    this.speciesId = speciesId; // ex. 'requin', 'player'
    this.isPlayer  = isPlayer;
    this.role      = role;      // 'prey'|'herbivore'|'predator'|'apex'|'omnivore'
    this.behavior  = behavior;  // 'swarm'|'herd'|'pack'|'solitary'
  }
}
