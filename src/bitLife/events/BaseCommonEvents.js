


export const saleToux =  {
    nom:"Sale toux"
    , text:"Un matin vous avez la gorge qui gratte et les bonbons a sucer n'y font rien, ca degenere en toux persistante"
    , options:[
        {text:"Je m'en tape, mon karma est le plus fort"
    , consequenceText:"Croisez les doigts alors"
    , consequences:{karma:-4,sante:-4,maladie:{grippe:0.9}}
}, {
    text:"Je vais chez le docteur"
    , consequenceText:"Et ben c'est une bonne grippe, je vous mets du paracetamol et du spray nasal. Vous voulez un arret maladie aussi ? "
    , options:[
        {
            text:"Oui, j'ai besoin de repos"
            , consequenceText:"Ca fera 30 euros, au revoir..."
            , consequences:{argent:-30,bonheur:1,social:1,promotion:-3, karma:-2,sante:-2}
        },{
            text:"Non ca ira, mes employeurs ont besoin de moi"
            , consequenceText:"Ca fera 30 euros, au revoir..."
            , consequences:{argent:-30,bonheur:-1,social:1,promotion:1,sante:-4,karma:3}
        }
    ]
}, {
    text:"Je passe aux urgences"
    , consequenceText:"Vous perdez 3h a attendre qu'un interne vous dise que vous avez une grippe et que vous devriez passez chez le generaliste, merde, faut le dire combien de fois"
    , consequences:{karma:-9,sante:-5,bonheur:-4,social:-3,maladie:{grippe:1}}
    , randomAction:{
        risque:0.7, condition:{sex:'F'}
        , text:"L'interne est particulierement zélé et vous fait passer un examen gynecologique"
        , consequenceText:"L'examen a un peu derapé, et vous etes toujours malade"
        , consequenceImage:"https://el.phncdn.com/gif/38789161.gif"
        , consequences:{
            karma:2,sante:-3,bonheur:2,social:2, maladie:{grippe:0.7}
        }
    }
}
    ]
}

export const defiVelo =  {
    "nom": "Défi de faire une cascade à vélo",
    "text": "Un groupe d'amis vous lance un défi : faire une cascade à vélo. Comment réagissez-vous ?",
    "options": [
      {
        "text": "Accepter le défi",
        "consequences": { "bonheur": 3, "karma": -2, sante:-2, social:2},
        "consequenceText": "Vous acceptez le défi avec enthousiasme, mais vous vous croutez le genou."
        , consequenceImage:"https://www.coalgan-gamme.com/wp-content/uploads/2022/10/Soigner-une-ecorchure-une-e.jpg.png"
      },
      {
        "text": "Refuser poliment",
        "consequences": { "bonheur": -1, social:-2 },
        "consequenceText": "Vous refusez poliment, évitant le danger mais ressentant une légère déception."
      },
      {
        "text": "Proposer une autre idée",
        "consequenceText": "Vous proposez une autre idée amusante, laquelle."
        ,  options:[
            {
                text:'Chat-bite',
                "consequences": { "karma": -2, bonheur:2, social:5, pervers:3 },
                "consequenceText": "C'etait super marrant, mais vos doigts puent un peu maintenant"
                
            }
            ,{
                text:'Cache-cache',
                "consequences": { bonheur:1, social:-2,pervers:-1 },
                "consequenceText": "Vos amis se foutent de votre gueule en vous demandant quel age vous avez"
                
            }
            ,{
                text:'Strip poker',
                "consequences": { "karma": -1, pervers:10, bonheur:12, social:2},
                "consequenceText": "Vous avez perdu et tout le monde a vu votre bite, mais vous avez vu le cul de Nathalie, ca vaut."
                , consequenceImage:"https://el.phncdn.com/gif/17047982.gif"
            }
        ]
      }
    ]
  }
export const carnetSpecial={
    "nom": "Découverte d'un mystérieux carnet",
    "text": "Vous trouvez un carnet mystérieux sur une table de classe. Que décidez-vous de faire avec ?",
    "options": [
      {
        "text": "Lire le contenu",
        "consequenceText": "Vous succombez à la curiosité et lisez le contenu du carnet. Il donne une adresse et les symboles \"7->50\""
        , options:[
            {
                text:'Vous rendre a l\adresse indiquee',
                "consequenceText": "Vous arrivez sur place, il y a des dealers qui vous proposent 7g pour 50 euros"
                , options:[
                    {
                        text:'Repartir vite fait',
                        "consequences": { "karma": 2, bonheur:-2, social:2 },
                        "consequenceText": "Vous repartez de ce lieu de debauche en esperant ne pas avoir ete vu"
                        
                    }
                    ,{
                        text:'Aller voir la police avec le carnet',
                        "consequences": { "karma": 5, bonheur:2, social:5,pervers:1, diplomes:'Bon citoyen' },
                        "consequenceText": "La police a demantelé le point de deal, bravo citoyen"
                        
                    }
                    ,{
                        text:'Leur prendre une barette',
                        "consequences": { "karma": -1, bonheur:10, social:1, sante:-1, possessions:{nom:"barrette de shit", valeur:50,image:"https://e-liquide-cbd.info/1707-large_default/resine-le-supreme-50-nature-cbd.jpg"} },
                        "consequenceText": "C'etait pas du super matos, mais ca faisait le taff..."
                        
                    }
                ]
            }
            ,{
                text:'Laisser le carnet a l\'endroit ou vous l\'avez trouvé, ce n\'est pas interessant.',
                "consequences": {  bonheur:-1, social:-1, karma:-1},
                "consequenceText": "Avec de la chance son ancien proprietaire tombera dessus."
            }
        ]
      },
      {
        "text": "Le ramener aux objets trouvés du college.",
        "consequences": { "karma": 2, bonheur:1 },
        "consequenceText": "Vous décidez de ramener le carnet , préservant votre tranquillité d'esprit."
      },
      {
        "text": "Le jeter",
        "consequences": { "bonheur": -1, "social": -2 },
        "consequenceText": "Vous jetez le carnet sans le lire, il y avait ptet un tresor au bout ?."
      }
    ]
  };
  export const panneDeVoiture={
    nom:"Panne de voiture"
    , text:"Votre voiture fait un bruit bizarre"
    , options:[
      {
        text:"Je m'en fous"
        , consequenceText:"Vous ignorez le voyant rouge et au bout de 200 km, de la fumee sort du capot, le moteur est HS, vous etes bonne pour en racheter une nouvelle"
        , consequences:{
          bonheur:-5,karma:-5,possessions:{nom:"voiture",toRemove:true}
        }
      }
      , {
        text:"Je vais au garagiste"

        , consequenceText:"Il faut changer tout le bloc moteur, ca me prendrait beaucoup trop de temps, plus de trois mois"
        , options:[
          {
            text:"Faites ce qu'il faut, je la veux la semaine prochaine"
            , condition:{sex:"F", argent:100}
            , consequenceImage:"https://el.phncdn.com/gif/23441121.gif"
            , consequenceText:"Vous donnez de votre personne pour l'avoir, mais votre voiture est reparee a temps, vous savez obtenir ce que vous voulez"
            , consequences:{
              bonheur:3,karma:2,social:2,pervers:4,argent:-100, enceinte:0.2
            }
          }
          ,{
            text:"Faites ce qu'il faut, je la veux la semaine prochaine"
            , condition:{sex:"M", argent:100}
            , consequenceImage:"https://el.phncdn.com/gif/40610241.gif"
            , consequenceText:"Vous donnez de votre personne pour l'avoir, mais votre voiture est reparee a temps, vous savez obtenir ce que vous voulez"
            , consequences:{
              bonheur:3,karma:2,social:2,pervers:4,argent:-100
            }
          }
          , {
            text:"Faites comme vous pouvez, je vous la laisse en attendant", condition:{argent:1000}
            , consequenceText:"Vous etes privée de voiture pendant 3 longs mois et la facture est salée"
            , consequences:{
              bonheur:-10,karma:1,social:-4,pervers:-4,argent:-1000
            }
          }
          , {
            text:"Tant pis, j'attendrai"
            , consequenceText:"Le moteur finit par faire de la fumee. Elle rend l'ame, vous n'avez plus de voiture"
            , consequences:{
              bonheur:-10,karma:-1,social:-4,violent:4,possessions:{nom:"voiture",toRemove:true}
            }
          }
        ]
      }
    ]
  }
export const bitureInattendue={
    "nom": "Soirée Biture inattendue",
    "text": "Un ami vous invite à une soirée biture spontanée. Que choisissez-vous de faire ?",
    "options": [
      {
        "text": "Y aller avec enthousiasme",
        "consequenceText": "Vous acceptez l'invitation avec enthousiasme,vous degueulez en cours de soiree une femme vous propose une pipe contre votre bouteille"
        , options:[
          {
            text:"La pauvre fille est saoule, vous la raccompagnez chez elle (avec tout le  respect)"
            , consequenceText:"Quel gentleman vous etes, vous aurez quand meme droit a un baiser furtif"
            , consequenceImage:"https://el.phncdn.com/gif/38981661.gif"
            , consequences:{bonheur:3,social:3,karma:6,pervers:-2}
          },{
            text:"La pauvre fille est saoule, vous  en profitez veulement"
            , consequenceText:"Quel gentleman vous etes, comme elle y met du coeur, elle pourra avaler. Elle a si soif"
            , consequenceImage:"https://el.phncdn.com/gif/7889011.gif"
            , consequences:{bonheur:5,social:1,karma:-2,pervers:2}
          }
        ]
      },
      {
        "text": "Décliner poliment",
        "consequences": { "social": -3 , bonheur:-2},
        "consequenceText": "Vous déclinez poliment l'invitation, préférant passer une soirée tranquille chez vous devant Columbo."
      },
      {
        "text": "Y aller mais en ne buvant pas d'alcool",
        "consequences": { "bonheur": 1, "social": 2, sante:2 },
        "consequenceText": "Vous décidez d'y aller malgré des réserves, vous ne buvez qu'un Canada dry."
      }
    ]
  };

export const coupDeFilSurprise= {
    nom:"Coup de fil surprise"
    , text:"Salut mec, tu fais quoi ce soir ?"
    ,  "options": [
      {
        "text": "Rien, j'ai des cours a reviser, lachez-moi les mecs",
        "consequences": { "bonheur": -1, "social": -2, karma:-1, sante:1, intelligent:1},
        "consequenceText": "Vous refusez et en profitez pour reviser, au moins la soiree ne sera pas perdue"
      },
      {
        "text": "Rien c'est quoi le plan",
        "consequenceText": "Rendez-vous chez Nicky dans une heure, on a trouvé des champis."
        ,  "options": [
          {
            "text": "Sans moi les mecs, la derniere fois j'ai eu du mal a m'en remettre",
            "consequences": { "bonheur": 1, "social": 2, karma:1, sante:1},
            "consequenceText": "Vous refusez et en profitez pour reviser, il est probable que vous l'ayez echappé belle"
          },
          {
            "text": "J'arrive",
            "consequenceText": "Vous arrivez chez Nicky et on vous donne des champignons... Ca commence a monter, la premiere activité que vous entreprendrez conditionnera le reste de la soiree, reflechissez bien les 3 prochaines heures seront hors de la realité"
            , options:[
              {
                text:"Quelle heure il est au fait ?"
                , consequenceText:"Vous restez fixé sur l'heure et le passage des minutes, le temps ne semble plus passer, c'en devient obsedant"
                , consequences:{bonheur:1,social:5,karma:-1,violent:1}
              }, {
                text:"On se met un peu de musique?"
                , consequenceText:"Vous passez le reste de la soiree a jouer au DJ et changer de disque toutes les 30 secondes, vous vous eclatez bien"
                , consequences:{bonheur:5,social:7,karma:3,violent:-1}
              }, {
                text:"On joue a chat-bite ?"
                , consequenceText:"Evidemment y en a un qui parle de bite, tout le monde se met a poil et commence a se toucher les boules... Tres bonne soiree au final"
                , consequences:{bonheur:10,social:7,karma:5,pervers:3}
                , consequenceImage:"https://el.phncdn.com/gif/20671391.gif"
              }
            ]
            
          }
        ]
      }
    ]
  };


export const journeePluvieuse =  {
    "nom": "Journée pluvieuse",
    "text": "Il pleut dehors et vous ne pouvez pas jouer dehors. Comment passez-vous votre journée ?",
    "options": [
        {
            "text": "Jouer à des jeux de société en famille",
            "consequences": { "bonheur": 3, "intelligent": 2, karma: 2 },
            "consequenceText": "Vous jouez à des jeux de société en famille, renforçant les liens familiaux et stimulant votre intelligence."
        },
        {
            "text": "Regarder des dessins animés",
            "consequences": { "bonheur": 2, "social": -2, "intelligent": -1, violent: -2 },
            "consequenceText": "Vous passez votre journée à regarder des dessins animés, vous divertissant et restant de bonne humeur malgré le mauvais temps."
          ,randomAction:{
            risque:0.2
            , text:"Vous trouvez une nouvelle k7 video d'un dessin animé que vous ne connaissez pas dans la table de nuit de votre pere."
            , options:[
              {text:"Mieux vaur la laisser"
             , "consequences": { "bonheur": 2, "karma": 2, "pervers": -2, violent: -2 },
              "consequenceText": "Vous avez raison ce n'est sans doute pas pour vous"
            },{
              text:"Vous la regardez"
              , "consequences": { "bonheur": 6, "karma": 5, "pervers": 2 },
              "consequenceText": "Vous decouvrez une nouvelle maniere de voir les dessins animés"
              , consequenceImage:"https://el.phncdn.com/gif/42929631.gif"
            }
            ]
          }
          },
        {
            "text": "Lire un livre",
            "consequences": { "bonheur": 2, "intelligent": 2, "social": -2, violent: -2 },
            "consequenceText": "Vous choisissez de lire un livre, nourrissant votre esprit et vous procurant du bonheur."
        }
    ]
}
export const planCul = {
  nom: 'Plan cul',
  condition:{adulte:true,senior:true, adulescent:true},
  text: 'Vous demandez a $pnj.nom si il/elle est OK pour un 5 a 7 sans prise de tete.',
  options:[
    {
      text:"En souvenir du bon vieux temps"
      , condition:{sex:"M"},
      chance: 0.4, chanceOn: "empathie"
  , consequenceImage:"https://el.phncdn.com/gif/7685451.gif"
  , consequenceTextOK: "$pnj.nom est ravie , justement elle etait en manque ."
  , consequencesOK: { pervers: 11, bonheur: 10, social: 10, karma: 5,  enceinte:0.2 }
  , consequenceTextNOK: "Si $pnj.nom est celibataire et toujours partante pour un plan cul, c'est qu'elle est une grosse salope fan de sodo, c'etait un peu large, meme pour vous."
  , consequencesNOK: { bonheur: 3, social: 1,pervers:1, maladies:{mst:0.2}}
    },{
      text:"En souvenir du bon vieux temps"
      , condition:{sex:"F"},
      chance: 0.4, chanceOn: "empathie"
  , consequenceImage:"https://el.phncdn.com/gif/38392041.gif"
  , consequenceTextOK: "Ca fait du bien par ou ca passe, $pnj.nom a vraiment une grosse bite, ca fait plaisir."
  , consequencesOK: { pervers: 11, bonheur: 10, social: 10, karma: 5,  enceinte:0.2 }
  , consequenceTextNOK: "Si $pnj.nom est celibataire et toujours partante pour un plan cul, c'est que c'est un mauvais coup. Grosse bite, mais pas de dynamisme"
  , consequencesNOK: { bonheur: 3, social: 1,pervers:1, maladies:{mst:0.2}}
    }
  ]
};
export const soubrette = {
  "nom": "La soubrette",
  "text": "Une aide menagere vous est attribuee pour la semaine, elle est plutot court vetue.",
  "options": [
    {
      "text": "Lui demander gentiment de s'habiller plus convenablement pour ce travail",
      "consequences": { "social": -2, "bonheur": -1, karma: -2 },
      "consequenceText": "Bien sur monsieur, je m'excuse."
    },
    {
      "text": "En profiter pour la mater quand elle se penche",
      "consequences": { "social": 1, pervers: 2, bonheur: 2 }
      , consequenceImage: "https://el.phncdn.com/gif/42914311.gif",
      "consequenceText": "Vous pouvez épousseter les livres sur l'etagere du bas, on les oublie toujours ceux-la...."
    },
    {
      "text": "La menacer d'une punition si elle continue de s'habiller ainsi",
      "consequenceText": "Elle revient le lendemain dans la meme tenue.",
      "options": [
        {
          "text": "Je vais vous renvoyer",
          "consequences": { "social": -2, "bonheur": -2, pervers: -2, argent: -50 },
          "consequenceText": "Pour se venger, elle vous pique 50 euros avant de partir"
        },
        {
          "text": "je vais vous coller une retenue sur salaire",
          "consequences": { "social": -5, sante: -2, karma: -10 },
          "consequenceText": "Elle l'a plutot mal pris et a craché dans votre café toute la semaine et vous l'a dit juste avant de repartir."
        },
        {
          "text": "Je vais vous fesser",
          "consequenceText": "Elle descend sa culotte et s'allonge sur vos genoux",
          "options": [
            {
              "text": "Dedramatiser",
              "consequences": { "social": 3, "bonheur": -2, pervers: -6 },
              "consequenceText": "Voyons je plaisantais, relevez-vous jeune fille. \nElle vous remercie de votre gentillesse et repart faire son travail"
            },
            {
              "text": "Petite claque",
              "consequences": { "bonheur": 2, pervers: 2, karma: 2 }
              , consequenceImage: "https://porngif.co/wp-content/uploads/2022/04/59520-maid-getting-spanked.gif"
              , "consequenceText": "Elle attend un peu la suite, puis se rhabille honteuse. \nVous realisez que vous auriez du aller au bout de vos pulsions"
            },
            {
              "text": "Serie de gros coups ",
              "consequences": { "bonheur": 12, pervers: 10, karma: -2 },
              "consequenceText": "Son posterieur devient rouge et ses gemissements en disent long sur son appreciation du moment. Vous etes tombés sur une sacrée salope"

              , consequenceImage: "https://porngif.co/wp-content/uploads/2023/11/167900-wished-me-to-smack-her-on-the-bum.gif"
            }
          ]
        }
      ]
    }
  ]
};

export const tempsEnsemble =  {
  nom:"Passer du temps ensemble"
  ,"text": "Vous passez un bon moment a discuter avec votre ami",
  "condition": {  adolescence: true, adulescent:true , adulte:true, senior:true},
  chance:0.5,chanceOn:'relation',
  "consequenceTextOK": "Vous parlez philosophie et sens de la vie, vous etes en accord spirituel",
  "consequencesOK": {
    "relation": 20,
    "bonheur": 3, social:5,karma:2
  },
  "consequenceTextNOK": "Vous parlez politique, il fallait pas, vous vous fachez avec votre ami",
  "consequencesNOK": {
    "relation":-10,
    "bonheur": -4,social:-4, karma:-2
  },
  randomAction:{
    risque:0.25
    , text:"Vous parlez cul. Ca derape forcement dans ce jeu un peu libidineux. Vous voulez faire quoi avec votre ami ?"
    , options:[
      {
        text:"La prendre en levrette"
        , consequenceImage:"https://el.phncdn.com/gif/43858121.gif"
        , consequenceText:"Y a que ca de vrai"
        , consequences:{pervers:2,social:2,relation:15,bonheur:2,violent:3, enceinte:0.2}
      },{
        text:"Un bon vieux 69"
        , consequenceImage:"https://el.phncdn.com/gif/34487481.gif"
        , consequenceText:"Y a que ca de vrai, et en plus c'est safe"
        , consequences:{pervers:4,social:3,relation:15,bonheur:5}
      },{
        text:"Surprends-moi"
        , consequenceImage:"https://el.phncdn.com/gif/12161131.gif"
        , consequenceText:"Votre amie avait un drole de fantasme, mais apres tout, c'est aussi le votre, non ?"
        , consequences:{pervers:8,social:1,relation:15,bonheur:10,violent:2}
      }
    ]
  }
}
 
export const voyageSpontane = {
  "nom": "Voyage Spontané",
  "text": "Vous gagnez une voyage gratuit en votant pour Kevin par SMS a la StarAc. Que décidez-vous de faire ?",
  "options": [
    {
      "text": "Accepter l'offre et partir immédiatement",
      "consequenceText": "Nagui ouvre l'enveloppe... vous allez partir a....",
      consequenceImage:"https://www.lavenir.net/resizer/oKs57tR17Y3O6JOJjRC6X2Tb7dk=/1620x1080/filters:format(jpeg):focal(281x195.5:291x185.5)/cloudfront-eu-central-1.images.arcpublishing.com/ipmgroup/5YRPVKHKWNFKJJQQETOJETZKHI.jpg",
      "options": [
        {
          "text": "Bangkok en Thailande ",
          "consequences": { "bonheur": 3, "pervers": 3, sante:-2 },
          "consequenceText": "Vous choisissez la Thailande, ses massages, ses petites putes... On vous connait"
          , consequenceImage:"https://el.phncdn.com/gif/41378011.gif"
        },
        {
          "text": "Stockholm",
          "consequences": { "bonheur": 3, "relaxation": 5 },
          "consequenceText": "Ah La Suede, ses fjords, ses saunas...",
          consequenceImage:"https://el.phncdn.com/gif/35546762.gif"
        }
      ]
      ,"randomAction": {
        "risque": 0.3,
        "text": "Pendant votre voyage, vous perdez votre carte de crédit. Comment réagissez-vous ?",
        "options": [
          {
            "text": "Panic! Vous recherchez partout",
            "consequences": { "bonheur": -3, "argent": -200 ,violent:3},
            "consequenceText": "Vous paniquez et recherchez frénétiquement votre carte, trop tard, quelqu'un vous a prelevé 200 boules."
          },
          {
            "text": "Restez calme et signalez la perte",
            "consequences": { "bonheur": 1, "social": 2, "argent": -1,violent:-2 },
            "consequenceText": "Vous restez calme, signalez la perte et recevez l'aide nécessaire, préservant votre bonheur et votre stabilité financière."
          }
        ]
      }
    },
    {
      "text": "Décliner l'offre en raison de vos engagements professionnels",
      "consequences": { "bonheur": -2, "social": 2, "promotion": 2,karma:-2 },
      "consequenceText": "Vous déclinez l'offre en raison d'engagements, préservant votre stabilité financière . Votre employeur l'a remarqué et vous en remercie. Mais ressentant une légère déception."
    },
    {
      "text": "L'offrir a un.e ami.e",
      "consequences": { "bonheur": 5, "social": 5, "karma": 10},
      "consequenceText": "Vous choisissez de le donner a un ami pour qu'il/elle en profite. Mais quelle gentillesse !! "
      ,"randomAction": {
        "risque": 0.8,
        "text": "Votre amie (car du coup d'etait une fille) souhaite vous remercier",
        "options": [
          {
            "text": "Tu me rameneras un souvenir, ca ira !",
            "consequences": { "bonheur": 5, "social": 5, "karma": 10},
            "consequenceText": "Vous paniquez et recherchez frénétiquement votre carte, diminuant votre bonheur et votre argent."
          },
          {
            "text": "T'auras qu'a me sucer la bite",
            "consequences": { "bonheur": 7, "social": 5, "karma": 10,pervers:4},
            "consequenceText": "Elle accepte evidemment. Mais quelle gentillesse de tous les cotés, c'est fou, on vit dans un monde merveilleux"
            , consequenceImage:"https://el.phncdn.com/gif/34544521.gif"
          }
        ]
      }
    }
  ]
};

export const petitFrere = {
  nom:"Un petit frere pour Noel"
  , text:"Vos parents vous annoncent qu'ils attentent un nouvel enfant"
  , options:[
    {
      text:"Pourvu que ce soir une fille, je reve d'avoir une soeur"
      , consequenceText:"Vous partez sur de bonnes bases"
      , consequences:{karma:10,social:2,famille:'soeur',violent:-9}
    },{
      text:"Pourvu que ce soir un garcon, je reve d'avoir un frere"
      , consequenceText:"Vous partez sur de bonnes bases"
      , consequences:{karma:10,social:2,famille:'frere',violent:-9}
    }, {
      text:"Ainsi est né mon némésis..."
      , consequenceText:"Vous decidez de faire de cet intrus votre nouvel ennemi personnel, la guerre est declaree."
      , consequences:{karma:-10,social:-2,famille:(Math.random()<0.5?'frere':'soeur'),violent:9}
    }
  ]
}
export const petiteSoeurLubrique= {
  nom:"Une petite soeur curieuse"
  , involvedPnj:'soeur'
  , condition:{famille:'soeur'}
  , text:"Un soir alors que vous dormez dans la meme chambre que votre soeur, elle vient vous voir et vous demande de jouer a papa et maman"
  , options:[
    {
      text:"T'es folle, rendors-toi"
      , consequenceText:"Votre soeur retourne sagement se coucher"
      , consequences:{karma:10,social:2,relation:5,violent:-9, pervers:-10}
    },{
      text:"Vous imitez papa qui parle de factures a maman"
      , consequenceText:"Vous rigolez bien, elle fait sa propre imitation et vous vous endormez paisiblement"
      , consequences:{karma:10,social:6,relation:10,violent:-15,pervers:-8}
    }, {
      text:"Vous lui demandez a quoi elle pense"
      , consequenceText:"Elle vous raconte que parfois maman s'asseoit cul nu sur la tete a papa et qu'elle fait du cheval dessus"
      , options:[
        {text:"Tu racontes n'importe quoi, allez hop au lit maintenant"
        , consequenceText:"Votre soeur retourne se coucher en ralant"
        , consequences:{karma:20,social:2,relation:-5,violent:-5, pervers:-17}
      },{
        text:"Allez, on essaye ?"
        , consequenceText:"Votre soeur enleve sa petite culotte et vient s'asseoir sur votre visage. Decidement, tout le monde en veut a votre langue agile"
        , consequences:{karma:20,social:12,relation:15,violent:-5, pervers:10}
        , consequenceImage:"https://porngif.co/wp-content/uploads/2023/12/177492-i-think-she-loves-this.gif"
      }
      ]
    }
  ]
}
export const petitFrereLubrique= {
  nom:"Un petit frere curieuse"
  , involvedPnj:'frere'
  , condition:{famille:'frere'}
  , text:"Un soir alors que vous dormez dans la meme chambre que votre frere, il vient vous voir et vous demande de jouer comme papa et maman"
  , options:[
    {
      text:"T'es fou, rendors-toi"
      , consequenceText:"Votre frere retourne sagement se coucher"
      , consequences:{karma:10,social:2,relation:5,violent:-9, pervers:-10}
    },{
      text:"Vous imitez maman qui parle de factures a papa"
      , consequenceText:"Vous rigolez bien, il fait sa propre imitation et vous vous endormez paisiblement"
      , consequences:{karma:10,social:6,relation:10,violent:-15,pervers:-8}
    }, {
      text:"Vous lui demandez a quoi il pense"
      , consequenceText:"Il vous raconte que parfois papa met un bandeau a maman et lui fait gouter des trucs qu'elle doit deviner"
      , options:[
        {text:"Vous acceptez mais c'est votre frere qui porte le bandeau et vous qui lui faites gouter"
        , consequenceText:"Vous vous amusez 20 minutes avec des fruits plus ou moins pourris, une chaussette sale et des crottes de chat. Vous vous etes bien amusee"
        , consequences:{karma:2,social:7,relation:15,violent:-5, pervers:-7}
      },{
        text:"Vous acceptez de mettre le bandeau"
        , consequenceText:"Votre frere vous fait gouter divers objets : banane, stylo-feutre, son slip , et pour finir... "
        , consequences:{karma:10,social:2,relation:25,violent:-5, pervers:10}
        , consequenceImage:"https://el.phncdn.com/gif/43818971.gif"
      }
      ]
    }
  ]
}