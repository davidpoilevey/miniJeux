
/**
 * const ADN = 'ATCGGCATTG';
 * 1)color (RGB)
 * 2)timer (FPS)
 * 3)size (number)
 * 4)vitesse-adrenaline
 * 5)choix direction
 * 6)tauxReproduction
 * 7)metabolisme
 * 8)??
 * 
 * 
 * ATCG , default=mutant
 *  */

export class ADN {
    constructor(sequence) {
        this.adn = sequence;
    }

    getColor() {
        const colorCode = this.adn[0];

        switch (colorCode) {
            case 'A': return '#FF9900';
            case 'T': return '#2299AF';
            case 'C': return '#909FFF';
            case 'G': return '#3FC920';
            default: return '#000F00';
        }
    }

    getTimer() {

        const timer = this.adn[1];// en FPS

        switch (timer) {
            case 'A': return 10;
            case 'T': return 20;
            case 'C': return 30;
            case 'G': return 45;
            default: return 60;
        }
    }
    getSize() {
        // taille (ou masse)
        const masse = this.adn[2];

        switch (masse) {
            case 'A': return 5;
            case 'T': return 10;
            case 'C': return 18;
            case 'G': return 5;
            default: return 25;
        }
    }
    getAdrenaline(vitesse, energieCourante) {

        const adre = this.adn[3];

        switch (adre) {
            case 'A': return vitesse > 1.5 ? 0 : energieCourante / 20;// prudent
            case 'T': return vitesse > 2.5 ? 0 : energieCourante / 3;//foufou
            case 'C': return vitesse > 3 ? 0 : energieCourante > 50 ? 20 : energieCourante / 4;//inventif
            case 'G': return vitesse > 2 ? 0 : (vitesse < 1 ? 20 : 5);//rationnel
            default: return vitesse > 2 ? 0 : (vitesse < 1 ? energieCourante / 4 : 10);
        }
    }

    getDirection(cellPosition, previousAngle, petriBox) {
        // return un angle. Tous cherchent a manger d'abord si au plus pres. Cas si autre cell plus pres:
        // A : ignore , cherche a manger, T:fuis cellules, C: rapproche d'autres cell, G:modifie l'angle initial de 25 deg
        const randomAngle = Math.random() * 2 * Math.PI;
        const [nourriture, nourritureDistance] = petriBox.getNearestNourriture(cellPosition);
        const [autre, autreDistance = 1000] = petriBox.getNearestCell(cellPosition);
        if (nourriture != null && nourritureDistance < autreDistance)
            return getAngleVers(cellPosition, nourriture.position);
        else if (autre != null) {

            const dir = this.adn[4];
            switch (dir) {
                case 'A': return nourriture != null ? getAngleVers(cellPosition, nourriture.position) : previousAngle;
                case 'T': return -getAngleVers(cellPosition, autre.position);
                case 'C': return this.getSize()>10?getAngleVers(cellPosition, autre.position):-getAngleVers(cellPosition, autre.position);
                case 'G': return previousAngle + (Math.random() * Math.PI / 2) - Math.PI / 4;
                default: return 10;
            }
        }
        else
            return previousAngle;
    }
    getTauxReproduction() {

        const tx = this.adn[5];

        switch (tx) {
            case 'A': return 1;
            case 'T': return 2;
            case 'C': return 3;
            case 'G': return 4;
            default: return 6;
        }
    }
    getMetabolism() {

        const meta = this.adn[6];

        switch (meta) {
            case 'A': return 1;
            case 'T': return 2;
            case 'C': return 3;
            case 'G': return 4;
            default: return 0;
        }
    }

}

const getAngleVers = (fromPos, toPos) => {

    const deltaY = toPos.y - fromPos.y;
    const deltaX = toPos.x - fromPos.x;
    return Math.atan2(deltaY, deltaX);
}

export const haveSex = (cell1, cell2, idSeed) => {
    // recombine les ADN
    const adn1 = cell1.adn;
    const adn2 = cell2.adn;
    const splitIndex = Math.floor(Math.random() * adn1.length);
    const part1_adn1 = adn1.substring(0, splitIndex);
    const part2_adn1 = adn1.substring(splitIndex);
    const part1_adn2 = adn2.substring(0, splitIndex);
    const part2_adn2 = adn2.substring(splitIndex);

    let newAdn1 = part1_adn1 + part2_adn2;
    let newAdn2 = part1_adn2 + part2_adn1;

    // mutation aleatoire 1x/10 sur 1 des child, soit 5% de mutation
    if (Math.random() < 0.1) {
        const newAdnArray = newAdn1.split('');
        const mutationIndex = Math.floor(Math.random() * newAdnArray.length);
        const possibleLetters = 'ATCG';
        let newLetter = possibleLetters[Math.floor(Math.random() * possibleLetters.length)];
        // et une fois sur 1000 on a un mutant exceptionnel
        if (Math.random() < 0.1)
            newLetter='Z';
        newAdnArray[mutationIndex] = newLetter;
        newAdn1 = newAdnArray.join('');
    }
    const newCell1 = {
        id: 'sx1-' + idSeed,
        adn: newAdn1
    };
    const newCell2 = {
        id: 'sx2-' + idSeed,
        adn: newAdn2
    };
    return [newCell1, newCell2];
}

// Utils functions
export const randomADN = () => {
    const nucleotides = ['A', 'T', 'C', 'G'];
    let adn = '';

    for (let i = 0; i < 8; i++) {
        const randomIndex = Math.floor(Math.random() * nucleotides.length);
        adn += nucleotides[randomIndex];
    }

    return adn;
}



export const findCellDirection = (cell, cells) => {
    const cellAdn = new ADN(cell.adn);
    const { x: currentX, y: currentY } = cell.position;
    const currentOdeur = cellAdn.getOdeur();
    let nearestCell = getNearestCell(cell, cells)[0];

    if (!nearestCell) {
        // Si aucune cellule n'est dans le seeRange, la cellule pourrait errer aléatoirement
        const randomAngle = Math.random() * 2 * Math.PI;
        const x = Math.cos(randomAngle);
        const y = Math.sin(randomAngle);
        return { x, y };
    }

    // Calcule le vecteur de direction par rapport à la cellule la plus proche
    const directionX = nearestCell.position.x - currentX;
    const directionY = nearestCell.position.y - currentY;

    // Normalise le vecteur pour obtenir une direction (longueur 1)
    const distanceToNearest = Math.sqrt(directionX ** 2 + directionY ** 2);
    const normalizedX = distanceToNearest < 1 ? 0 : (directionX / distanceToNearest);
    const normalizedY = distanceToNearest < 1 ? 0 : (directionY / distanceToNearest);

    const otherCellAdn = new ADN(nearestCell.adn);
    const otherOdeur = otherCellAdn.getOdeur();
    // Détermine si la direction est de rapprochement ou d'éloignement en fonction de l'odeur
    const direction = {
        x: currentOdeur === otherOdeur ? normalizedX : -normalizedX,
        y: currentOdeur === otherOdeur ? normalizedY : -normalizedY,
    };

    return direction;
};

export const getNearestCell = (cell, cells) => {

    let nearestCell = null;
    let nearestDistance = Infinity;
    const { x: currentX, y: currentY } = cell.position;
    const cellAdn = new ADN(cell.adn);
    const seeRange = cellAdn.getSeeRange();

    for (const otherCell of cells) {
        if (otherCell.id == cell.id)
            continue;
        const { x: otherX, y: otherY } = otherCell.position;
        const distance = Math.sqrt((otherX - currentX) ** 2 + (otherY - currentY) ** 2);

        if (distance <= seeRange && distance < nearestDistance) {
            nearestCell = otherCell;
            nearestDistance = distance;
        }
    }
    return [nearestCell, nearestDistance];
}
// Fonction pour calculer la distance de Hamming entre deux séquences génétiques
const hammingDistance = (sequence1, sequence2) => {
    if (sequence1.length !== sequence2.length) {
      throw new Error('Les séquences génétiques doivent avoir la même longueur');
    }
  
    let distance = 0;
    for (let i = 0; i < sequence1.length; i++) {
      if (sequence1[i] !== sequence2[i]) {
        distance++;
      }
    }
    return distance;
  };
  
  // Fonction pour évaluer la diversité génétique au sein de la population
  export const evaluateGeneticDiversity = (population) => {
    const totalPairs = (population.length * (population.length - 1)) / 2; // Nombre total de paires uniques
    let totalDistance = 0;
  if(totalPairs==0)
    return 1;
    for (let i = 0; i < population.length - 1; i++) {
      for (let j = i + 1; j < population.length; j++) {
        const distance = hammingDistance(population[i].adn, population[j].adn);
        totalDistance += distance;
      }
    }
  
    const averageDistance = totalDistance / totalPairs;
    const geneticDiversity = 1 - averageDistance / population[0].adn.length; // Normalisé entre 0 et 1
  
    return (1/geneticDiversity).toFixed(2);
  };
  
  