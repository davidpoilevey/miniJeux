
export const CATQuests = {
  mysterePlacard: {
  name: "Une grosse fringale",
  dialogueId:"missionPlacard",
  description: "Il y a une odeur envoûtante a cet etage. Ca me fait penser que j'ai faim...",
  steps: [
    {
      type: "position",
     zone:"rdc",
     x:4, y:10,
      description: "Direction la cuisine !"
    },
    {
      type: "dialogue",
      dialogueId:"robotCroquette",
      description: "On va deja ramasser les croquettes"
    },
    {
      type: "dialogue",
      dialogueId:"placardAThon",
      description: "Et si on cherchait dans le placard ?" // etape 2
    },
    {
      type: "dialogue",
      dialogueId:"frigo",
      description: "Et si on allait voir le frigo"
    },
    {
      type: "item",
      item: "cleWC",
      description: "Trouver un allié.. Peut-etre aux WC" //etape 4
    },
    {
      type: "dialogue",
      dialogueId: "gipsy",
      description: "Parler au cette araignée des WC"
    },
    {
      type: "scripted",
      description: "Debloquer le code du Robot" //etape 6
    },
    {
      type: "dialogue",
      dialogue:'placardAThonDeblocked',
      description: "Ouvrir ce putain de placard a thon" //etape 7
    },
    {
      type: "dialogue",
      dialogueId: "coffreDuPlacard",
      description: "Entrer au fond du placard et deguster cette boite de thon"
    }
  ],
  reward: {
    inventory: ["cleSalon"],
    pdv: 20, croqs:20
  }
}
,
    escalier:{
        name:"Comment descendre ce fichu escalier",
        dialogueId:"queteEscalier",
        description:"Ca va etre technique",
        steps:[
             {
        type: "dialogue",
        dialogueId: "porteSalleDeBain",
        description: "Essayer d'ouvrir la salle de bain"
      },
            {
                type:"item",
                item:"megaphone",
                description:"Trouver un megaphone pour miauler plus fort"
            },
      {
        type: "position",
        zone: "etage",
        x: 12,
        y: 10,
        description: "Entrer dans la salle de bain"
      },{
        type:"scripted",
        description:"Faire comprendre a maman qu'on a soif",
      },{
         type: "item",
         item:"eau_du_robinet",
        description:"Boire enfin merde , il etait temps",
      }
        ],
        reward:{inventory:['accesEscalierEtage']}
    },
    missionMarathon:{
      name:"On decouvre le systeme des Quetes",
      description:"Ca commence par un descriptif... Ici, il faut patouner un certain nombre de fois"
      , steps:[
        {
          type:"dialogue",dialogueId:"missionMarathon"
          , description:"Faire le tour des options de cette armoire"
        }
        , {
          type:'scripted'
          , description:"Patouner une fois"
        }
        , {
          type:'scripted'
          , description:"Patouner deux fois"
        }
        , {
          type:'scripted', dialogueId:"missionMarathonEnCours3"
          , description:"Patouner trois fois, c'est long cette mission ou c'est moi"
        }
        , {
          type:'scripted', dialogueId:"missionMarathonEnCours4"
          , description:"Patouner quatre fois, on se foutrai pas un peu de ma gueule ?"
        }
        , {
          type:'scripted', dialogueId:"missionMarathonEnCours5"
          , description:"Patouner cinq fois, allez ca devrait suffire"
        }
      ]
      , reward:{croqs:10, inventory:["code_cave"]}
    },
    papaOuvre: {
  name: "Opération Papa Ouvre",
    dialogueId:"missionPapa",
  description: "Papa ne veut pas ouvrir la terrasse. Fais des bêtises jusqu’à ce qu’il craque.",
  steps: [
    { type: "dialogue", dialogueId: "croqsARemuer", description: "Fais du bruit en remuant les croqs degueu du paquet" },
    { type: "dialogue", dialogueId: "uneTele", description: "La tele, ca devrait faire du bruit" },
    { type: "dialogue", dialogueId:"patounerCanape", description: "Ce nouveau canapé, il est sympa, ca fait du bruit quand on gratte" },//2 niveau acces dialogue vas
    { type: "scripted",  description: "Attire l'attention de papa et enerve-le au plus haut point" }, // papa est enerv
    { type: "scripted",  description: "Fais-le se deplacer, il est trop concentré sur son ordi." },//4 papa bouge
    { type: "item", item: "cleTerrasse", description: "Obtiens l'accès a la terrasse" },//5 terrass
      { type: "dialogue", dialogueId: "copainOK", description: "Reste Copain a eliminer" },//6 terrass
  ],
  reward: {
    inventory: ["cleJardin"]
  }
}
,
  QuetePrincipale: {
    name: "Chasser sale matou",
    dialogueId:"missionPrincipale",
    description: "Il faut expulser Sale matou de notre territoire",
    steps: [
      {
        type: "zone",
        zone: "etage",
        description: "Atteindre l'escalier"
      },
      {
        type: "zone",
        zone: "rdc",
        description: "Descendre au rez-de-chaussée"
      },
      {
        type: "zone",
        zone: "salon",
        description: "Chercher la clé du salon"
      },
      {
        type: "zone",
        zone: "jardin",
        description: "Explorer le jardin"
      },
      {
        type: "zone",
        zone: "exterieur",
        description: "Affronter sale matou"
      }
    ],
    reward: { croqs: 50 }
  }
,
SaleMatou: {
  name: "La bataille du Jardin",
  dialogueId: "missionSaleMatou",
  description: "Sale Matou t’attend au fond du jardin. Prépare-toi à l’affronter... correctement.",
  steps: [
    {
      type: "dialogue",//0
      dialogueId: "salutGlaire",
      description: "Explorer le jardin"
    },
    {
      type: "dialogue",
      dialogueId: "saleMatou_a_parle",
      description: "Aller a la rencontre de Sale Matou"
    },
    {
      type: "item",//2
      item: "bourdonVaincu",
      description: "Continuons d'explorer ce jardin"
    },
    {
      type: "dialogue",
      dialogueId: "amiPourLaVie",
      description: "Aider l'escargot pour qu'il nous aide a rentrer dans la cave"
    },
    {
      type: "item", //4
      item: "indiceGriffe",
      description: "Obtenir des infos sur une arme ultime"
    },
    {
      type: "zone",//5
      dialogueId: "cave",
      description: "Entrer sous la terrasse"
    },
    {
      type: "item",
      item: "armeChaton" /* ou un nom d’objet stylé */,
      description: "Reussir a choper ces griffes Supremes pour battre Sale Matou"
    },
    {
      type: "dialogue",//7
      dialogueId: "saleMatou_reflexion",
      description: "Revenir voir Sale Matou avec l'arme legendaire"
    },
    {//8
      type: "dialogue",
      dialogueId: "coleoptereSacre",
      description: "Apprendre à manier les armes avec le Coléoptère Sacré"
    },
    {
      type: "item",//9
      item: "techniqueSacree",
      description: "Acquérir la Technique Sacrée du Chassé-Miaou"
    },
    {
      type: "dialogue",
      dialogueId: "saleMatouFinal",
      description: "Confronter Sale Matou une dernière fois"
    }
  ],
  reward: {
    inventory: ["titre_ChampionDuTerritoire", "couronneChat"],
    croqs: 100
  }
}

};
