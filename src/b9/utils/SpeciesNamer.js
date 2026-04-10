// Nouveau fichier: /src/utils/SpeciesNamer.js

/**
 * Génère un nom de famille prononçable depuis speciesIdentity
 * 
 * Utilise l'identité comme seed pour générer un nom stable
 * Riche en voyelles pour être lisible/mémorisable
 */

const CONSONANTS = ['b', 'k', 'd', 'f', 'g', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'z'];
const VOWELS = ['a', 'e', 'i', 'o', 'u', 'y'];

// Syllabes pré-construites (consonne + voyelle)
const SYLLABLES = [
  'son', 'ba', 'be', 'bi', 'bo', 'bu',
  'cha', 'che', 'chi', 'cho', 'chou',
  'da',  'di', 'do', 'du',
  'fa', 'fe', 'fi', 'fo', 'fu',
  'ga', 'ge', 'gi', 'go', 'gu',
  'la', 'le', 'li', 'lo', 'lu',
  'ma', 'me', 'mi', 'mo', 'mu',
  'na', 'ne', 'ni', 'no', 'nu',
  'pa', 'pe', 'pi', 'po', 'pu',
  'pra', 'pre', 'cre', 'ple', 'psy',
  'ra', 're', 'ri', 'ro', 'cri',
  'sa', 'se', 'si', 'so', 'ble',
  'ta', 'te', 'ti', 'to', 'gle',
  'va', 've', 'vi', 'vo', 'vu',
  'xi', 'jon', 'tre', 'mou', 'ron'
];

/**
 * Génère un nom de famille depuis speciesIdentity
 * @param {number} speciesIdentity - Float 0.0-1.0
 * @returns {string} Nom prononçable (ex: "Balomi", "Tefaru")
 */
export function generateFamilyName(speciesIdentity) {
  // Convertir en chaîne de chiffres (enlever "0.")
  const idString = speciesIdentity.toFixed(10).substring(2);
  
  // Nombre de syllabes (2-3)
  const numSyllables = 2 + (parseInt(idString[0]) % 2);
  
  let name = '';
  let offset = 1;
  
  for (let i = 0; i < numSyllables; i++) {
    // Prendre 2 chiffres pour choisir une syllabe
    const digit1 = parseInt(idString[offset]) || 0;
    const digit2 = parseInt(idString[offset + 1]) || 0;
    const digit3 = parseInt(idString[offset + 2]) || 0;
    const syllableIndex = (digit1 * 100 + digit2 * 10 + digit3) % SYLLABLES.length;
    
    name += SYLLABLES[syllableIndex];
    offset += 3;
  }
  
  // Capitaliser la première lettre
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Génère un nom court (3 lettres) pour affichage compact
 * @param {number} speciesIdentity
 * @returns {string} Ex: "Bal", "Tef"
 */
export function generateShortName(speciesIdentity) {
  const fullName = generateFamilyName(speciesIdentity);
  return fullName.substring(0, 3).toUpperCase();
}

/**
 * Couleur stable pour une espèce (pour UI)
 * @param {number} speciesIdentity
 * @returns {string} HSL color
 */
export function getSpeciesColor(speciesIdentity) {
  const hue = Math.floor(speciesIdentity * 360);
  return `hsl(${hue}, 70%, 60%)`;
}