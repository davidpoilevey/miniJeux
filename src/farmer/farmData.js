import imgBle from './images/ble.png';
import imgRaisin from './images/raisin.png';
import imgPiment from './images/piment.png';
import imgCarrotte from './images/carrotte.png';
import imgOnion from './images/onion.png';
import imgOrange from './images/orange.png';
import imgUsine from './images/usine.png';
import imgUsineBoisson from './images/usineBoisson.png';
import imgRestaurant from './images/restaurant.png';
import imgCoop from './images/coop.png';
import imgMagasin from './images/magasin.png';
import imgBoulangerie from './images/boulangerie.png';
import imgPorno from './images/japs.jpg';

import imgRepas from './images/repas.png';
import imgFestin from './images/festin.png';
import imgPackFamilial from './images/pack.png';
import imgRatatouille from './images/ratatouille.png';
import imgSmoothie from './images/smoothie.png';
import imgPain from './images/pain.png';
import imgGateau from './images/gateau.png';
import imgFarine from './images/farine.png';
import imgPuree from './images/puree.png';
import imgChips from './images/chips.png';
import imgVin from './images/vin.png';
import imgJusFruit from './images/jusFruit.png';
import imgVerrine from './images/verrine.png';
import imgSoleilVert from './images/soleil.png';

// version X
import imgBite from './images/bite.png';
import imgChatte from './images/chatte.png';
import imgCul from './images/cul.png';
import imgSexpos1 from './images/sexpos1.png';
import imgSexpos2 from './images/sexpos2.png';
import imgCunni from './images/cunni.png';
import imgSquirt from './images/squirt.png';
import imgBranle from './images/branle.png';


export const FARM_BUILDINGS = [
  { id: 'usine', name:'Usine de conserve', img: imgUsine, position: 'top', level: 6,
      cost:400,
      possibleProduction: ['chips', 'verrine', 'soleil vert'],
      currentProduction: null },
  { id: 'boisson', name:'Fabrication des boissons', img: imgUsineBoisson, position: 'top' ,level: 2,
      cost:250,
      possibleProduction: ['vin', 'jusFruit', 'smoothie'],
      currentProduction: null, },
  { id: 'coop', img: imgCoop, position: 'left',level: 1,
      cost:200, name:'Cooperative agricole',
      possibleProduction: ['flour', 'puree'],
      currentProduction: null },
  { id: 'restau', img: imgRestaurant, position: 'right',level: 5,
      cost:1000, name:'Restaurant',
      possibleProduction: ['festin', 'repas'],
      currentProduction: null },
  { id: 'magasin', img: imgMagasin, position: 'left',level: 4,
      cost:350, name:'Carrefour',
      possibleProduction: ['ratatouille', 'packFamilial'],
      currentProduction: null },
  { id: 'boulange', img: imgBoulangerie, position: 'right',level: 3,
      cost:250, name:'Boulangerie',
      possibleProduction: ['gateau', 'pain'],
      currentProduction: null },
  { id: 'porno', img: imgPorno, position: 'right',level: 10,
      cost:500, name:'Dorcel Movies', xMode:true,
      possibleProduction: ['squirt', 'cunni', 'sex'],
      currentProduction: null },
];
export const PLANTES = [
  { id: 'wheat', name: 'Blé', icon: '🌾', img:imgBle, tempsDePousse: 2 * 1000, quantiteParRecolte: 5 , level:1}, // 1h en ms
  { id: 'carrot', name: 'Carotte', icon: '🥕',img:imgCarrotte, tempsDePousse: 5 * 1000, quantiteParRecolte: 3, level:2 },
  { id: 'raisin', name: 'Raisin', icon: '🌽', img:imgRaisin, tempsDePousse: 12 * 1000, quantiteParRecolte: 6, level:3 },
  { id: 'orange', name: 'Orange', icon: 'o', img:imgOrange, tempsDePousse: 60 * 1000, quantiteParRecolte: 6, level:5 },
  { id: 'onion', name: 'Oignon', icon: 'o', img:imgOnion, tempsDePousse: 3 *60 * 1000, quantiteParRecolte: 5, level:6 },
  { id: 'cul', name: 'Cul', icon: 'o', img:imgCul, tempsDePousse: 30 * 1000, quantiteParRecolte: 3, level:10,xMode:true },
  { id: 'bite', name: 'Bite', icon: 'o', img:imgBite, tempsDePousse: 60 * 1000, quantiteParRecolte: 4, level:10 ,xMode:true},
  { id: 'chatte', name: 'Chatte', icon: 'o', img:imgChatte, tempsDePousse: 2 *60 * 1000, quantiteParRecolte: 4, level:10 ,xMode:true},

  { id: 'piment', name: 'Piment', icon: 'o', img:imgPiment, tempsDePousse: 10 * 60 * 1000, quantiteParRecolte: 4, level:8 },

];
export const getPlanteById=id=>{
    return PLANTES.find(p=>p.id===id);
}


export const PRODUCTIONS = [
  {
    id: 'flour',
    name: 'Farine',
    img: imgFarine,
    quantiteProduite: 2,
      tempsProduction:1000*20,
    sellPrice:30,
    ingredients: { wheat: 6 },
  },
  {
    id: 'puree',
    name: 'Purée',
    img: imgPuree,
      tempsProduction:1000*5,
    quantiteProduite: 1,
    sellPrice:100,
    ingredients: { flour: 2, carrot:4 },
  },
  {
    id: 'chips',
    name: 'Chips',
    img: imgChips,
      tempsProduction:1000*10,
    quantiteProduite: 2,
    sellPrice:30,
    ingredients: { wheat: 6, carrot:6  },
  },
  {
    id: 'verrine',
    name: 'Verrine',
    img: imgVerrine,
      tempsProduction:1000*20,
    quantiteProduite: 1,
    sellPrice:200,
    ingredients: { carrot: 6, raisin: 5, wheat:2 },
  },
  {
    id: 'soleil vert',
    name: 'Soleil Vert',
    img: imgSoleilVert,
      tempsProduction:1000*50,
    quantiteProduite: 1,
    sellPrice:500,
    ingredients: { piment: 5, carrot: 6, onion: 5, wheat:5 },
  },
  {
    id: 'vin',
    name: 'Vin',
    img: imgVin,
      tempsProduction:1000*20,
    quantiteProduite: 6,
    sellPrice:80,
    ingredients: { raisin: 12 },
  },
  {
    id: 'jusFruit',
    name: 'Jus de fruit',
    img: imgJusFruit,
      tempsProduction:1000*30,
    quantiteProduite: 5,
    sellPrice:80,
    ingredients: { orange: 8 },
  },
  {
    id: 'smoothie',
    name: 'Smoothie',
    img: imgSmoothie,
      tempsProduction:1000*60*2,
    quantiteProduite: 5,
    sellPrice:150,
    ingredients: { orange: 4, raisin: 5, wheat:3, carrot:1 },
  },
  {
    id: 'gateau',
    name: 'Gâteau',
    img: imgGateau,
      tempsProduction:1000*60*10,
    quantiteProduite: 2,
    sellPrice:320,
    ingredients: { flour: 2, carrot: 3, orange: 3, raisin:3 },
  },
  {
    id: 'pain',
    name: 'Pain',
      tempsProduction:1000*30,
    img: imgPain,
    quantiteProduite: 5,
    sellPrice:80,
    ingredients: { flour: 3 },
  },
  {
    id: 'ratatouille',
    name: 'Ratatouille',
      tempsProduction:1000*60*10,
    img: imgRatatouille,
    quantiteProduite: 2,
    sellPrice:280,
    ingredients: { carrot: 5, onion: 4, flour: 2 },
  },
  {
    id: 'packFamilial',
    name: 'Pack familial',
    img: imgPackFamilial,
      tempsProduction:1000*40,
    quantiteProduite: 4,
    sellPrice:460,
    ingredients: { chips: 4, jusFruit: 4, pain: 2 },
  },
  {
    id: 'festin',
    name: 'Festin',
      tempsProduction:1000*60*3,
    img: imgFestin,
    quantiteProduite: 1,
    sellPrice:1000,
    ingredients: { gateau: 1,onion:2,puree:2, vin: 2, soleilVert: 2, piment:1 },
  },
  {
    id: 'repas',
    name: 'Repas',
    img: imgRepas,
      tempsProduction:1000*50,
    quantiteProduite: 2,
    sellPrice:350,
    ingredients: { puree: 2, pain: 2, smoothie: 1 },
  },
  {
    id: 'sex',
    name: 'Sexe pur',
    img: imgSexpos1, xMode:true,
      tempsProduction:1000*50,
    quantiteProduite: 3,
    sellPrice:300,
    ingredients: { bite: 5, cul: 5, chatte: 2 },
  },
  {
    id: 'squirt',
    name: 'Golden shower',
    img: imgBranle, xMode:true,
      tempsProduction:1000*40,
    quantiteProduite: 4,
    sellPrice:250,
    ingredients: { bite: 5, chatte: 5 },
  },
  {
    id: 'cunni',
    name: 'Cunnilingus',
    img: imgCunni, xMode:true,
      tempsProduction:1000*50,
    quantiteProduite: 2,
    sellPrice:600,
    ingredients: { cul: 4, chatte: 6 },
  },
];

// **********   Missions   *************
// src/components/missionData.js

export const MISSION_TYPES = {
  DELIVER_ORDERS: 'deliver_orders',      // Livrer X commandes
  PRODUCE_ITEM: 'produce_item',          // Produire X d'un item spécifique
  HARVEST_CROP: 'harvest_crop',          // Récolter X d'une plante
  BUILD_BUILDING: 'build_building',      // Construire un bâtiment spécifique
  EARN_MONEY: 'earn_money',              // Gagner X d'argent
};

export const GENIE_STATES = {
  RESTING: 'resting',     // En repos, juste des animations idle
  ACTIVE: 'active',       // Mission en cours
  CELEBRATING: 'celebrating' // Mission accomplie (animation de victoire)
};

// Missions par niveau - définit la progression du jeu
export const MISSIONS_BY_LEVEL = {
  1: {
    id: 'level_1',
    title: 'Premiers pas',
    description: 'Livrez 3 commandes pour prouver votre efficacité !',
    type: MISSION_TYPES.DELIVER_ORDERS,
    target: 3,
    reward: {
      experience: 100,
      money: 50, diamond:2, engrais:2,
      unlock: 'carrot', // Débloque les carottes
      message: 'Bravo ! Vous maîtrisez les livraisons ! Les carottes sont maintenant disponibles'
    },
    genieDialogue: {
      start: 'Bienvenue dans votre ferme ! Commençons par livrer quelques commandes.',
      progress: (current, target) => `Parfait ! ${current}/${target} commandes livrées.`,
      complete: 'Excellent travail ! Vous êtes prêt pour de nouveaux défis !'
    }
  },
  
  2: {
    id: 'level_3',
    title: 'Premier transformateur',
    description: 'Construisez votre première Boulangerie',
    type: MISSION_TYPES.BUILD_BUILDING,
    target: 1,
    targetBuilding: 'boulange',
    reward: {
      experience: 200,
      money: 0,diamond:2,engrais:5,
      unlock: 'pain',
      message: 'Vous pouvez maintenant faire du pain'
    },
    genieDialogue: {
      start: 'Pour progresser, vous devez construire votre boulangerie !',
      progress: (current, target) => 'Allez ! Bientot on pourra candidater a la meilleure boulangerie de France',
      complete: 'Parfait ! La transformation commence maintenant !'
    }
  },
  3: {
    id: 'level_2',
    title: 'Maître cultivateur',
    description: 'Récoltez 30 blés pour développer votre production',
    type: MISSION_TYPES.HARVEST_CROP,
    target: 30,
    targetItem: 'wheat',
    reward: {
      experience: 150,
      money: 100,diamond:2,engrais:4,
       unlock: 'raisin',
      message: 'Les raisins sont maintenant disponibles !'
    },
    genieDialogue: {
      start: 'Il est temps d\'augmenter votre production de blé !',
      progress: (current, target) => `Continuez ! ${current}/${target} blés récoltés.`,
      complete: 'Formidable ! Votre expertise agricole grandit !'
    }
  },
  
  
  4: {
    id: 'level_4',
    title: 'Producteur artisanal',
    description: 'Produisez 10 farines dans votre coopérative',
    type: MISSION_TYPES.PRODUCE_ITEM,
    target: 10,
    targetItem: 'flour',
    reward: {
      experience: 250,
      money: 200,diamond:3,engrais:6,
      message: 'Vous maîtrisez la transformation des céréales !'
    },
    genieDialogue: {
      start: 'Utilisez votre coopérative pour produire de la farine !',
      progress: (current, target) => `Bien joué ! ${current}/${target} farines produites.`,
      complete: 'Vous êtes devenu un vrai artisan !'
    }
  },
  
  5: {
    id: 'level_5',
    title: 'Entrepreneur prospère',
    description: 'Gagnez 1000 pièces d\'or',
    type: MISSION_TYPES.EARN_MONEY,
    target: 1000,
    reward: {
      experience: 300,diamond:2,money:100,engrais:6,
      unlock: 'orange',
      message: 'Les oranges sont maintenant disponibles ! Votre ferme prospère !'
    },
    genieDialogue: {
      start: 'Montrez-moi que vous savez faire fructifier votre ferme !',
      progress: (current, target) => `Excellent ! ${current}/${target} pièces gagnées.`,
      complete: 'Vous êtes un véritable entrepreneur agricole !'
    }
  },
  
  6: {
    id: 'level_6',
    title: 'Maître boulanger',
    description: 'Construisez une boulangerie et produisez 5 pains',
    type: MISSION_TYPES.PRODUCE_ITEM,
    targetBuilding: 'boulange',
    targetItem: 'pain',
    target: 5,
    reward: {
      experience: 400,
      money: 300,diamond:3,engrais:8,
      message: 'Vos pains sont délicieux ! Les clients en redemandent !'
    },
    genieDialogue: {
      start: 'Il est temps d\'ouvrir votre boulangerie !',
      progress: (current, target, hasBuilding) => {
        if (!hasBuilding) return 'Construisez d\'abord votre boulangerie !';
        return `Parfait ! ${current}/${target} pains produits.`;
      },
      complete: 'Vous êtes maintenant maître boulanger !'
    }
  },
  7: {
    id: 'level_7',
    title: 'Uber Eats',
    description: 'Livrez 10 commandes pour prouver votre super efficacité !',
    type: MISSION_TYPES.DELIVER_ORDERS,
    target: 10,
    reward: {
      experience: 200,
      money: 150, diamond:3,engrais:10,
      message: "Bravo ! Par contre un client s'est plaint que le livreur avait 10 minutes de retard. Dommage"
    },
    genieDialogue: {
      start: 'Uber Eats vous a contacté pour etre dans sa liste. Saurez-vous assurer.',
      progress: (current, target) => `Parfait ! ${current}/${target} commandes livrées.`,
      complete: 'Excellent travail ! Vous êtes prêt pour de nouveaux défis !'
    }
  },
  8: {
    id: 'level_8',
    title: 'Etape industrielle',
    description: "Possedez tous les batiments, y compris l'USINE",
    type: MISSION_TYPES.BUILD_BUILDING,
    target: 1,
    targetBuilding:'usine',
    reward: {
      experience: 100,
      money: 50, diamond:2,engrais:10,
      unlock: 'carrot', // Débloque les carottes
      message: 'Bravo ! Vous maîtrisez les livraisons ! Les carottes sont maintenant disponibles'
    },
    genieDialogue: {
      start: "Passez a l'etape industrielle en fournissant des usines.",
      progress: (current, target) => `Parfait ! ${current}/${target} commandes livrées.`,
      complete: 'Quelle domination sans partage !'
    }
  }
  ,9: {
    id: 'level_9',
    title: 'Saison des films de Noel',
    description: "On a besoin d'oignons pour faire pleurer dans les chaumieres",
    type: MISSION_TYPES.HARVEST_CROP,
    target: 50,
    targetItem:'onion',
    reward: {
      experience: 100,
      money: 50, diamond:2,engrais:10,
      unlock: 'carrot', // Débloque les carottes
      message: 'Bravo ! Vous maîtrisez les livraisons ! Les carottes sont maintenant disponibles'
    },
    genieDialogue: {
      start: 'Recoltez 50 oignons.',
      progress: (current, target) => `Deja  ${current}/${target} oignons recoltés.`,
      complete: "Et dire qu'a la fin, c'est encore Brian qui se tape Samantha"
    }
  },
  // ... missions pour les niveaux suivants
  10: {
    id: 'level_10',
    title: 'Roi de la gastronomie',
    description: 'Produisez le légendaire Soleil Vert',
    type: MISSION_TYPES.PRODUCE_ITEM,
    target: 2,
    targetItem: 'soleil vert',
    reward: {
      experience: 1000,
      money: 500,diamond:5,engrais:10,
      unlock: 'master_chef',
      message: 'Vous avez atteint le sommet de l\'art culinaire !'
    },
    genieDialogue: {
      start: 'Le défi ultime : créer le mystérieux Soleil Vert !',
      progress: (current, target) => `${current}/${target} ... Bientot`,
      complete: 'INCROYABLE ! Vous êtes désormais une légende !'
    }
  }
  , 11: {
    id: 'level_11',
    title: 'On change de jeu',
    description: 'Decouvrez le coté obscur de ce jeu. Recoltez des culs',
    type: MISSION_TYPES.HARVEST_CROP,
    target: 8,
    targetItem: 'cul',
    reward: {
      experience: 1000,
      money: 100,diamond:2,engrais:11,
      message: 'Ah... Pas mal... On continue ?'
    },
    genieDialogue: {
      start: "On a decidé que les legumes c'etait chiant.. voici une nouvele forme de culture",
      progress: (current, target) => `${current}/${target} ... Bientot`,
      complete: 'On dirait que vous y avez pris gout'
    }
  }
  , 12: {
    id: 'level_12',
    title: 'On veut de la chatte',
    description: 'Ou sont les femmes disait Patrick Juvet. Recoltez des chattes',
    type: MISSION_TYPES.HARVEST_CROP,
    target: 8,
    targetItem: 'cul',
    reward: {
      experience: 1000,engrais:12,
      money: 100,diamond:2,
      message: 'Ah... Pas mal... On continue ?'
    },
    genieDialogue: {
      start: "Elles ont le rire au coin des laaaarmes, mais surtout.. ",
      progress: (current, target) => `${current}/${target} ... Encore des minous !`,
      complete: 'Ah oui !!!'
    }
  }
  , 13: {
    id: 'level_13',
    title: 'On continue',
    description: "Et maintenant on veut lecher ce qu'on a recolté. Pratiquez des cunnis",
    type: MISSION_TYPES.PRODUCE_ITEM,
    target: 10,
    targetItem: 'cunni',
    reward: {
      experience: 1000,engrais:15,
      money: 200,diamond:5,
      message: 'Ah... Pas mal... On continue ?'
    },
    genieDialogue: {
      start: "Quelle meilleure activité au monde....",
      progress: (current, target) => `${current}/${target} ... Bientot`,
      complete: 'On dirait que vous y avez pris gout. Mais oui tout le monde aime ca'
    }
  }
  , 14: {
    id: 'level_14',
    title: 'On se finit bientot',
    description: "Du sexe encore du sexe ! ",
    type: MISSION_TYPES.PRODUCE_ITEM,
    target: 20,
    targetItem: 'sex',
    reward: {
      experience: 1000,
      money: 200,diamond:5,engrais:20,
      message: "Oh putain ! La vache ! C'etait trop bon"
    },
    genieDialogue: {
      start: "On veut une orgie pour finir",
      progress: (current, target) => `Baises pratiquees: ${current}/${target} `,
      complete: 'On dirait que vous y avez pris gout. Mais oui tout le monde aime ca'
    }
  },
  15: {
    id: 'level_15',
    title: 'Mission finale',
    description: "Atteignez 1 000 000 pièces... C'est pour vous bloquer ici parce que j'ai pas prevu de mission supplementaires.. ",
    type: MISSION_TYPES.EARN_MONEY,
    target: 1000000,
    reward: {
      experience: 1000,diamond:20,engrais:50,
      message: "C'est la fin du jeu.. Merci d'avoir joué"
    },
    genieDialogue: {
      start: "N'essayez pas, ca va planter, c'est serieux j'ai plus de missions apres ca",
      progress: (current, target) => `vous insistez... ! ${current}/${target} pièces.`,
      complete: "J'y crois pas !"
    }
  },
};

// Fonction pour obtenir la mission du niveau actuel
export const getCurrentMission = (level) => {
  let miss = MISSIONS_BY_LEVEL[level];
  if(miss==null)
    miss = MISSIONS_BY_LEVEL[level-MISSIONS_BY_LEVEL.length];
  return miss;
};


// Fonction pour obtenir le dialogue approprié du génie
export const getGenieDialogue = (mission, progress, isCompleted) => {
  if (!mission || !mission.genieDialogue) return '';
  
  if (isCompleted) {
    return mission.genieDialogue.complete;
  } else if (progress > 0) {
    return typeof mission.genieDialogue.progress === 'function' 
      ? mission.genieDialogue.progress(progress, mission.target)
      : mission.genieDialogue.progress;
  } else {
    return mission.genieDialogue.start;
  }
};