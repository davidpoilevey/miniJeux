const NUM_CHROMOSOMES = 400;
export const TAUX_MUTATION = 0.05;
const CHROMOSOME_LENGTH = 4;
const GENETIC_VALUES = ['A', 'T', 'G', 'C'];

// CACHE pour hashString (évite recalcul constant)
const HASH_CACHE = new Map();

function hashString(str) {
  // Utiliser le cache
  if (HASH_CACHE.has(str)) {
    return HASH_CACHE.get(str);
  }
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const result = Math.abs(hash) % NUM_CHROMOSOMES;
  HASH_CACHE.set(str, result);
  return result;
}

// LOOKUP TABLE pré-calculée (évite calculs répétés)
const DECIMAL_LOOKUP = new Map();
function initDecimalLookup() {
  const valeurs = { 'A': 0, 'T': 1, 'C': 2, 'G': 3 };
  for (let a = 0; a < 4; a++) {
    for (let b = 0; b < 4; b++) {
      for (let c = 0; c < 4; c++) {
        for (let d = 0; d < 4; d++) {
          const key = `${a}${b}${c}${d}`;
          const decimal = (a * 64 + b * 16 + c * 4 + d) / 255;
          DECIMAL_LOOKUP.set(key, decimal);
        }
      }
    }
  }
}
initDecimalLookup();

function tableauVersDecimal(tableau) {
  // Validation minimale (enlever en prod si garanti)
  if (tableau.length !== 4) {
    console.error('Tableau invalide:', tableau);
    return 0;
  }

  const valeurs = { 'A': 0, 'T': 1, 'C': 2, 'G': 3 };
  const key = `${valeurs[tableau[0]]}${valeurs[tableau[1]]}${valeurs[tableau[2]]}${valeurs[tableau[3]]}`;
  
  return DECIMAL_LOOKUP.get(key) || 0;
}

export const randomGenome = () => {
  const chromosomes = new Array(NUM_CHROMOSOMES);
  for (let i = 0; i < NUM_CHROMOSOMES; i++) {
    const chromosome = new Array(CHROMOSOME_LENGTH);
    for (let j = 0; j < CHROMOSOME_LENGTH; j++) {
      chromosome[j] = GENETIC_VALUES[Math.floor(Math.random() * 4)];
    }
    chromosomes[i] = chromosome;
  }
  return chromosomes;
}

export class ADNHandler {
  constructor(sequence) {
    this.adn = sequence;
    this.currentCycle = 0;
  }

  setCurrentCycle(newcycle) {
    this.currentCycle = newcycle;
  }

  readBool(key) {
    const keyIndex = hashString(key) % this.adn.length;
    const chromosome = this.adn[keyIndex];
    const first = chromosome[0];
    return first === 'A' || first === 'T';
  }

  readFloat(key) {
    const keyIndex = hashString(key) % this.adn.length;
    const chromosome = this.adn[keyIndex];
    return tableauVersDecimal(chromosome);
  }

  read10(key) {
    const asfloat = this.readFloat(key);
    return Math.ceil(asfloat * 10);
  }

  mutatedVersion() {
    return mutationADN(this.adn, TAUX_MUTATION);
  }

  getID(forAdn) {
    if (forAdn == null) forAdn = this.adn;
    return tableauVersDecimal(forAdn[0]) + '' + tableauVersDecimal(forAdn[300]);
  }
}



export const recombinaisonGenetique = (adn1, adn2)=> {
  const numChromo = adn1.length;
  const chromoLen = adn1[0].length;
  const CROSSOVER_RATE = 0.25;

  const enfant = [];
  const enfantChoucou=[];
  for (let c = 0; c < numChromo; c++) {
    // Choix du parent majoritaire pour ce chromosome
    const parentMajoritaire = Math.random() < 0.5 ? adn1 : adn2;
    const parentSecondaire = parentMajoritaire === adn1 ? adn2 : adn1;

    const chromosome = [],chromo2=[];
    for (let g = 0; g < chromoLen; g++) {
      // Cross-over ponctuel
      if (Math.random() < CROSSOVER_RATE) {
        chromosome.push(parentSecondaire[c][g]);
        chromo2.push(parentMajoritaire[c][g])
      } else {
        chromosome.push(parentMajoritaire[c][g]);
        chromo2.push(parentSecondaire[c][g])
      }
    }
    enfant.push(chromosome);
    enfantChoucou.push(chromo2);
  }
  return [enfant, enfantChoucou];
}


export const mutationADN=(adn, tauxMutation=TAUX_MUTATION) =>{
    const nouvelleADN = [];

    // Parcourir chaque élément de l'ADN
    for (let i = 0; i < adn.length; i++) {
        const gene = adn[i].slice(); // Copier le tableau de gènes actuel

        // Pour chaque gène, déterminer s'il faut le muter
        for (let j = 0; j < CHROMOSOME_LENGTH; j++) {
            if (Math.random() < tauxMutation) { // Vérifier si une mutation se produit
                // Choisir aléatoirement un nouveau nucléotide pour le gène
                const nouveauNucleotide = ['A', 'T', 'C', 'G'][Math.floor(Math.random() * 4)];
                gene[j] = nouveauNucleotide;
            }
        }

        // Ajouter le gène muté à la nouvelle ADN
        nouvelleADN.push(gene);
    }

    return nouvelleADN;
}

