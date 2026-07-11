
export const CIVILIZATIONS = [
  {
    id: 'francais',
    name: 'Français',
    flag: '🇫🇷',
    color: '#3366cc',
    bonuses: {
      forest: { wood: 1 }, plain:{food:1},
      happiness:2,science:3
    },
    description:"Les francais sont raleurs, mais heureux quand meme, ils sont intelligents",
    militaryBonus: 0,
    buildingBonus: 0,
    populationGrowthBonus: 0,
    diplomacyProfile: {
  aggressif: 0.3,       // préfère la guerre
  genereux: 0.4,        // accepte de donner
  protectionniste: 0.3, // défend plutôt que d’attaquer
  opportuniste: 0.9     // accepte des deals avantageux
},

    startingTechs: [],
  },
  {
    id: 'anglais',
    name: 'Anglais',
    flag: '🇬🇧',
    color: '#b22222',
    bonuses: {
      plain: { laine: 2 },water:{food:1},mountain:{charbon:1},
       happiness:1,science:1
    },
    description:"L'anglais est flegmatique, mais il cultive bien les moutons",
    diplomacyProfile: {
  aggressif: 0.7,       // préfère la guerre
  genereux: 0.1,        // accepte de donner
  protectionniste: 0.1, // défend plutôt que d’attaquer
  opportuniste: 0.5     // accepte des deals avantageux
}
,
    militaryBonus: 0,
    buildingBonus: 0,
    populationGrowthBonus: 0,
    startingTechs: [],
  },
  {
    id: 'chinois',
    name: 'Chinois',
    flag: '🇨🇳',
    color: '#cc0000',
    populationGrowthBonus: 0.2,
     bonuses: {
      plain:{food:2}, desert:{food:1}
      , happiness:-1,science:2
     },
     description:"Le chinois est opprimé (moins de bonheur), mais plus travailleur, astucieux et discipliné",
     diplomacyProfile: {
  aggressif: 0.2,       // préfère la guerre
  genereux: 0.3,        // accepte de donner
  protectionniste: 0.8, // défend plutôt que d’attaquer
  opportuniste: 0.3     // accepte des deals avantageux
},

    militaryBonus: 0,
    buildingBonus: 0.2,
    startingTechs: ['ecriture'],
  },
  {
    id: 'zoulou',
    name: 'Zoulous',
    flag: '🇱🇾',
    color: '#228B22',
     bonuses: {
       happiness:2,science:0},
       description:"Les zoulous sont aggressifs, principalement. Heureux sont les simples d'esprit",
     diplomacyProfile: {
  aggressif: 1,       // préfère la guerre
  genereux: 0.6,        // accepte de donner
  protectionniste: 0.2, // défend plutôt que d’attaquer
  opportuniste: 0.4     // accepte des deals avantageux
}
,
    militaryBonus: 0.15,
    buildingBonus: -0.10,
    populationGrowthBonus: 0.3,
    startingTechs: [],
  },
  {
    id: 'eldoria',
    name: 'Eldoria',
    flag: '🇦🇶',
    color: '#5e649d',
    bonuses: {
      desert: { petrole: 5, uranium:2 },
       plain:{food:-1},
       water:{petrole:1},
       happiness:3,science:4
    }, description:"Peuple heureux et intelligent, beni des dieux. Mais mauvais cultivateurs. Anecdote, ils sont capable d'extraire du petrole de l'eau de mer"
    ,diplomacyProfile: {
  aggressif: 0.1,       // préfère la guerre
  genereux: 0.7,        // accepte de donner
  protectionniste: 0.2, // défend plutôt que d’attaquer
  opportuniste: 0.5     // accepte des deals avantageux
}
,
    militaryBonus: 0.2,
    buildingBonus: 0,
    populationGrowthBonus: 0,
    startingTechs: ['religion']
  },
  { id: 'allemand', name: 'Allemand', flag: '🇩🇪' ,color: '#333',
    bonuses: {
      mountain: { gold: 2, charbon:2 , iron:2},
       happiness:0,science:1
    },
    description:"Les allemands sont disciplinés et rigoureux, excellent dans l'extraction de minerais",
    militaryBonus: 0.2,
    buildingBonus: 0.2,
    populationGrowthBonus: 0
    ,diplomacyProfile: {
  aggressif: 0.5,       // préfère la guerre
  genereux: 0.6,        // accepte de donner
  protectionniste: 0.6, // défend plutôt que d’attaquer
  opportuniste: 0.2     // accepte des deals avantageux
},
    startingTechs: ['ageDuBronze'],},
  { id: 'indien', name: 'Indien', flag: '🇮🇳' ,color: '#8e841d',
    bonuses: {
      moutain: { charbon: 2,gold:1 }, forest:{wood:1,food:1}
       ,happiness:0,science:3
    },
    militaryBonus: 0,
    buildingBonus: 0,
    populationGrowthBonus: 0.3
    ,diplomacyProfile: {
  aggressif: 0.2,       // préfère la guerre
  genereux: 0.8,        // accepte de donner
  protectionniste: 0.8, // défend plutôt que d’attaquer
  opportuniste: 0.7     // accepte des deals avantageux
}
, description:"Fort en maths. mais attention a la surpopulation"
,
    startingTechs: ['mathematiques']},
  { id: 'bresilien', name: 'Brésilien', flag: '🇧🇷' ,color: '#557f33',
     bonuses: {
      forest: { food: 3, wood:2, gold:4 },water:{food:1}
      , happiness:3,science:0
    },
    description:"Samba et salsa... Mais pourquoi se prendre la tete mon chou, viens a la playa avec moi...",
    militaryBonus: 0,
    buildingBonus: 0,
    populationGrowthBonus: 0.1,
    diplomacyProfile: {
  aggressif: 0.2,       // préfère la guerre
  genereux: 0.8,        // accepte de donner
  protectionniste: 0.3, // défend plutôt que d’attaquer
  opportuniste: 0.2     // accepte des deals avantageux
}
,
    startingTechs: ['agriculture'],},
];



// Pseudo-civilisation hostile : pas dans CIVILIZATIONS (ni diplomatie, ni élimination,
// ni fondation de villes) — juste des hordes qui surgissent du brouillard
export const BARBARE_CIV = {
  id: 'barbare',
  name: 'Barbares',
  flag: '🏴‍☠️',
  color: '#1a1a1a',
  bonuses: {},
  militaryBonus: 0,
  buildingBonus: 0,
  populationGrowthBonus: 0,
  diplomacyProfile: { aggressif: 1, genereux: 0, protectionniste: 0, opportuniste: 0 },
  startingTechs: [],
};

 export const getCivilization =civid=>{
    if(civid?.id)
        return civid;
    if(civid === BARBARE_CIV.id)
        return BARBARE_CIV;
    return CIVILIZATIONS.find(civ => civ.id === civid)
 }