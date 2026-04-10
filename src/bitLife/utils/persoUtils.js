import { PNJ } from "../personnages/PNJ";

const prefixes = ['Al', 'Be', 'Ca', 'De', 'El', 'Fa', 'Du', 'Ha', 'I', 'Jo', 'Ka', 'La', 'Mac', 'Ma', 'O', 'Pa', 'Qu', 'Ra', 'Sa', 'Te', 'U', 'Va', 'Wi', 'Cro', 'Yo', 'Bru'];
const suffixes = ['son', 'ton', 'ley', 'ria', 'rine', 'dot', 'stein', 'champ', 'ta', 'ler', 'lin', 'ler', 'mon', 'non', 'de', 'sa', 'nin', 'mis', 'chot', 'lou', 'tou', 'mou', 'pou', 'si', 'tine', 'bine'];
const syllabes = ['a', 'e', 'i', 'o', 'u', 'ba', 'ke', 'bou', 'ko', 'pon', 'sa', 'se', 'si', 'son', 'su', 'ta', 'te', 'ti', 'to', 'tu', 'ra', 're', 'ri', 'ro', 'ru', 'che', 'cha', 'chi', 'mi', 'mon'];

// Fonction pour générer un nom aléatoire
export const generateRandomName = () => {
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  const syllabeCount = Math.floor(Math.random() * 2) + 1; // Générer entre 1 et 3 syllabes
  let name = '';

  for (let i = 0; i < syllabeCount; i++) {
    const syllabe = syllabes[Math.floor(Math.random() * syllabes.length)];
    name += syllabe;
  }

  return `${prefix}${name}${suffix}`;
};
const prenomsMasculins = [
  'Sebastien', 'Lucas', 'Louis', 'Gabriel', 'Léo', 'Jules', 'Hugo', 'Adam', 'Marc', 'Tom',
  'Stephane', 'Arthur', 'Nathan', 'Maël', 'Enzo', 'Théo', 'Ethan', 'Christophe', 'Paul', 'Alexandre',
  'Gabin', 'Sacha'
];

const prenomsFeminins = [
  'Emma', 'Jade', 'Louise', 'Chloé', 'Emilie', 'Manon', 'Inès', 'Mila', 'Léa', 'Anne',
  'Agathe', 'Eva', 'Lina', 'Camille', 'Zoé', 'Julie', 'Léna', 'Clara', 'Sophie', 'Celine',
  'Sarah', 'Prune', 'Ambre', 'Charlotte', 'Lily'
];

export const generateRandomFirstName = (genre)=> {
  const prenoms = genre === 'M' ? prenomsMasculins : prenomsFeminins;
  const randomIndex = Math.floor(Math.random() * prenoms.length);
  return prenoms[randomIndex];
}
export const generateAge = (periodes) => {
  const periodesAges = {
    enfance: { min: 1, max: 11 },
    adolescence: { min: 10, max: 17 },
    adulescent: { min: 17, max: 24 },
    adulte: { min: 20, max: 60 },
    senior: { min: 55, max: 100 },
  };

  let minAge = 1;
  let maxAge = 100;

  if (periodes && periodes.length > 0) {
    for (const periode of periodes) {
      if (periodesAges[periode]) {
        minAge = Math.max(minAge, periodesAges[periode].min);
        maxAge = Math.min(maxAge, periodesAges[periode].max);
      }
    }
  }

  return Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge;
};

export const createRandomPeople = (nb=5,ageLimited)=>{
    // on va partir sur 5 et un chef
    const people=[];
    for(let p=0;p<nb;p++){
        const randomName = generateRandomName();
        const rage = generateAge(ageLimited);
        const randomSx = Math.random()>0.5?'M':'F';
        const prenom = generateRandomFirstName(randomSx);
        const randomImg = `https://loremflickr.com/320/240/${randomName}?lock=1`// sort une image au pif ??
        const pnj = new PNJ({nom:prenom+' '+randomName, etatCivil:{age:rage,sex:randomSx}});
        people.push(pnj);
    }
    return people;
}
export const getIcon = (perso)=>{

    const sexFolder=perso.etatCivil.sex;
    const ageFolder=perso.etatCivil.age<16?'jeune':(perso.etatCivil.age<60?'adulte':'vieux');
   
    return sexFolder+'/'+ageFolder+'/'+perso.avatarName;

}
export const translate = (text, pnj={nom:'Jane Doe'})=>{

   let _text=text.replace('$pnj.nom', pnj.nom);
   return _text;

}