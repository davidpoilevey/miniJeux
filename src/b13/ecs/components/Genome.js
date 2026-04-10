import { ADNHandler, randomGenome } from '../../../genetic/ADNPlante';

// Crée un composant Genome depuis un ADN parent (déjà muté) ou génère un nouveau génome aléatoire.
// Le handler est pré-instancié pour éviter de le recréer à chaque accès.
export default function Genome(adn = null) {
  const sequence = adn ?? randomGenome();
  return {
    adn:     sequence,
    handler: new ADNHandler(sequence),
  };
}
