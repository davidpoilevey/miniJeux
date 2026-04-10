/**
 * BaseDevent mais aussi d'activite
 * structure schema:
 * Activite= {
 *  nom
 *  icon(fontAwesome)
 *  text
 *  condition
 *  options ([{
 *          
          consequences ([])
          consequenceText
          options ([...options])
 *      }])
 * }
 */

const commonSchoolActions = [
  {
    nom: "Club de foot", icon:"SportsSoccer"
    , text: "Vous passez un peu de temps au club de foot, ca detend et c'est bon pour la santé"
    , consequences: { sante: 10, bonheur: 2, social: 5 }
    , condition: { sex: 'M' }
    , randomAction: {
      risque: 0.2
      , text: 'Dans le vestiaire un mec vous reluque tandis que vous vous deshabillez'
      , options: [
        {
          text: "Vous le calmez : Oh tu peux ma photo ?"
          , consequenceText: "Désolé mec, je revassais..."
          , consequences: { social: -1, karma: -1 }
        }
        , {
          text: "Vous le provoquez : Tu veux me sucer ?"
          , consequenceText: "Il se jette sur votre bite pour la nettoyer, une nouvelle decouverte !"
          , consequences: { bonheur: 4, social: 2, pervers: 3 }
          , consequenceImage: "https://64.media.tumblr.com/a0718866d836774b22814c1feeced0be/tumblr_n2akykG12r1s7u390o5_400.gif"
        }
        , {
          text: "Vous en parlez au coach, ca vous gene de trop?"
          , consequenceText: "le coach va lui parler, le type ne vous reparlera plus jamais, mais vous serez tout seul dans les douches maintenant..."
          , consequences: { bonheur: -4, social: -4 }, pervers: -3
        }
      ]
    }
  },{
    nom: "Club de gym", icon:"SportsGymnastics"
    , text: "Vous passez un peu de temps au club de gym, ca detend et c'est bon pour la santé"
    , consequences: { sante: 10, bonheur: 2, social: 5 }
    , condition: { sex: 'F' }
    , randomAction: {
      risque: 0.5
      , text: 'Dans le vestiaire une fille vous reluque tandis que vous vous deshabillez'
      , options: [
        {
          text: "Vous la calmez : Oh tu peux ma photo ?"
          , consequenceText: "Désolé cherie, je revassais..."
          , consequences: { social: -1, karma: -1 }
        }
        , {
          text: "Vous la provoquez : Oh ! Bouffe-moi la chatte !"
          , consequenceText: "Elle se jette sur vous pour vous faire decouvrir de nouveaux horizons"
          , consequences: { bonheur: 4, social: 2, pervers: 3 }
          , consequenceImage: "https://el.phncdn.com/gif/41918641.gif"
        }
        , {
          text: "Vous en parlez au coach, ca vous gene de trop?"
          , consequenceText: "le coach va lui parler, la fille ne vous reparlera plus jamais, mais vous serez toute seule dans les douches maintenant..."
          , consequences: { bonheur: -4, social: -4 }, pervers: -3
        }
      ]
    }
  }, {
    "nom": "Faire le pitre", icon: "SentimentVerySatisfied",
    "text": "Amuser vos camarades avec vos blagues et grimaces",
    "options": [
      {
        "text": "Imiter le professeur",
        "consequences": {
          "bonheur": 1,
          social: 4,
          "punition": "retenue"
        },
        "consequenceText": "Vous avez parfaitement imité le professeur, provoquant des rires dans la classe, Du coup vous etes en retenue."
        , randomAction: {
          risque: 0.6
          , condition: { sex: "F" }
          , text: "Le prof n'apprecie pas du tout la blague et vous convoque apres les cours.\n Que comptez-vous faire pour vous excuser mademoiselle ?"
          , options: [
            {
              text: 'Je ne le ferai plus, promis. Je ne veux rien sur mon carnet.'
              , consequenceText: "Le prof vous absout en echange d'une copie de 50 lignes a rendre"
              , consequences: { bonheur: -2, social: 3, violent: -2 }
            },
            {
              text: 'Je ferai n\'importe quoi pour que vous ne preveniez pas mes parents'
              , consequenceText: "Le prof fait glisser sa regle le long de votre jupette.. Vraiment n'importe quoi ?"
              , options: [
                {
                  text: "Oui comme porter plainte pour predation sexuelle a l'encontre d'une mineure, ca vous dit ?."
                  , consequenceText: "Furieux de votre insolence, il vous met au defi de mettre votre parole contre la sienne et vous colle tous les soirs jusqu'a la fin de l'annee"
                  , consequences: { bonheur: -17, social: -10, violent: 2, karma: 10, pervers: -10 }
                }, {
                  text: "Oui vraiment dites-vous avec une moue mutine."
                  , consequenceText: "Il fait descendre votre petite culotte a l'aide de sa regle et vous demande de lui montrer si vous avez deja des poils"
                  , options: [
                    {
                      text: "Vous soulevez votre jupette"
                      , consequenceText: "Il se rince l'oeil une dizaine de minutes et vous fait une derniere lecon de bonne conduite."
                      , consequences: { bonheur: 3, social: 1, violent: -2, karma: 3, pervers: 6 }
                      , consequenceImage: "https://el.phncdn.com/gif/2700421.gif"
                    }, {
                      text: "Vous refusez."
                      , consequenceText: "Le prof s'etonne... Vous jouez a la vilaine fille ? Vous savez ce qui arrivent aux vilaines filles ?"
                      , options: [
                        {
                          text: "Elles se font fesser ?"
                          , consequenceText: "Le prof vous couche sur ses genoux et vous administre une bonne fessee cul nu a en avoir les fesses rouges. Vous ne regrettez pas du tout."
                          , consequences: { bonheur: 10, social: 5, karma: 5, pervers: 10 }
                        }, {
                          text: "Elles se font fouetter ?"
                          , consequenceText: "Le prof s'etonne encore plus... Tu es vraiment une vilaine fille toi...\n Il va te falloir le baton. Tourne-toi et ecarte les fesses avec tes mains..."
                          , options: [{
                            text: 'Oui je suis une vilaine fille, mettez-la moi profond'
                            , consequenceText: "Il vous retourne et vous penetre votre petite chatte vibrante de luxure, non mais quelle salope vous faites. \n Et il en profite le salaud, il se fait plaisir en vous ramonant la choupinette et finit par se vider en vous sans se retirer. \nJ'imagine qu'une salope dans tom genre prend deja la pilule...."
                            , consequences: { bonheur: 13, social: -2, violent: 6, karma: -7, pervers: 20, maladie: { mst: 0.2 }, sante: -3, enceinte: 0.2 }
                          }]
                        }
                      ]
                    }
                  ]
                }, {
                  text: "Vous le giflez pour son impudence."
                  , consequenceText: "Surpris, il n'ose repliquer, vous donne une punition de principe, mais vous saquera jusqu'a la fin de l'annee... Fini l'excellence."
                  , consequences: { bonheur: -8, violent: 10, karma: -4, pervers: -5, intelligent: -2 }
                }
              ]
            },
            {
              text: 'Ah tiens j\'essaierai de faire ce rictus aussi la prochaine fois'
              , chance: 0.5, chanceOn: "karma"
              , consequenceTextNOK: "Ah c'est comme ca. 8h de colle toutes les semaines jusqu'a la fin de l'annee"
              , consequencesNOK: { bonheur: -15, social: -10, violent: 6 }
              , consequencesOK: { bonheur: 2, social: 2, violent: -1, karma: 3 }
              , consequenceTextOK: "Vous faites rire le prof qui vous dit: \nVous avez du talent quand meme, n'abusez pas de votre chance..."
            }
          ]
        }
      },
      {
        "text": "Faire une blague originale",
        "consequences": {
          "karma": 2,
          "social": 2
        },
        "consequenceText": "Votre blague originale a égayé la journée de vos camarades"
        , randomAction: {
          risque: 0.3
          , involvedPnj: 'collegue'
          , text: 'Votre blague etait si drole que $pnj.nom ,une camarade de classe vous parle a la recré et vous demande d\'etre son ami'
          , options: [
            {
              text: 'Vous acceptez'
              , consequenceText: '$pnj.nom est maintenant votre amie'
              , consequences: { ami: 1, bonheur: 8, social: 5 }
            }, {
              text: 'Vous Refusez'
              , consequenceText: '$pnj.nom est maintenant votre amie'
              , consequences: { ami: 1, bonheur: 8, social: 5 }
            }
          ]
        }
      },
      {
        "text": "Tagger les murs de l'ecole",
        "consequences": {
          "karma": -2,
          "social": -2, punition: "retenue"
        },
        "consequenceText": "Degradation de biens publics.. Ca vaut bien une retenue."
      }
    ]
  },
  {
    "nom": "Reviser en etudes",icon:"DesignServices",
    "text": "Reviser fortement en etudes",
    "consequences": {
      "karma": 2,
      "social": 2,
      intelligent: 1
    },
    "consequenceText": "Le savoir c'est le pouvoir"
    , randomAction: {
      risque: 0.3
      , involvedPnj: 'collegue'
      , condition: { sex: 'M' }
      , text: 'Dans la bibliotheque, vous faites la connaissance de $pnj.nom , vous sympathisez et i.el vous demande d\'etre son ami'
      , options: [
        {
          text: 'Vous acceptez'
          , consequenceText: '$pnj.nom est maintenant votre amie'
          , consequences: { ami: 1, bonheur: 2, karma:2,  intelligent: 1, social: 5 }
        }, {
          text: 'Vous Refusez'
          , consequenceText: '$pnj.nom est maintenant votre ennemie'
          , consequences: { ami: -1, bonheur: -4, social: -5 }
        }, {
          text: 'Vous acceptez a une condition'
          , consequenceText: '$pnj.nom vous regarde interessée.. Ah bon ? Et quelle condition ?'
          , options: [
            {
              text: "Tu m'aides au prochain examen"
              , consequenceText: "Elle accepte, vous aide pour le prochain examen que vous reussissez, vous gagnez une amie d'etude"
              , consequences: { ami: 1, relation: 10, social: 4, bonheur: 3, karma: -1 , intelligent: 2}
            }, {
              text: "Tu me montres ton cul"
              , consequenceText: "Elle accepte, vous montre son petit cul un peu palot, vous gagnez une amie"
              , consequenceImage: "https://ftopx.com/pic/1024x768/201911/5dda76a960b1e.jpg"
              , consequences: { ami: 1, relation: 20, social: 1, bonheur: 7, karma: 1, pervers: 3 }
            }, {
              text: "Tu me files du pognon"
              , consequenceText: "Elle refuse, et vous fait un doigt pour vous expliquer que vos facons de concevoir l'amitie divergent fortement"
              , consequences: { ami: -1, relation: -20, social: -5, bonheur: -2, karma: -1, violent: 3 }
            }
          ]
        }
      ]
    }
  }
  , {
    "nom": "Trainer au troquet",icon:"SportsBar",
    condition:{adolescence:true,adulescent:true},
    "text": "C'est tellement plus agreable de claquer le flipper que de ruminer en etudes !",
    "consequences": {
      "karma": -1,
      "social": 5,
      bonheur: 3,
      intelligent: -1
    }
    , randomAction: {
      risque: 0.3
      , text: "L'aubergiste vous propose une cuvee speciale, ca vous dit ?"
      , options: [
        {
          text: 'Vous Refusez, syons prudent'
          , consequenceText: 'En plus elle etait pas donné'
          , consequences: { social: 1, bonheur: 1, karma: -3 }
        }, {
          text: 'Vous acceptez, soyons fous'
          , consequenceText: 'Il vous emmene devant le scellier ou il y a 3 portes et vous demande d\'en ouvrir une'
          , options: [
            {
              text: "Celle qui porte un symbole de flocon de neige"
              , consequenceText: "Une biere bien fraiche au gout inimitable"
              , consequences: { bonheur: 2, social: 1, karma: -1 }
            }, {
              text: "Celle qui represente une femme"
              , consequenceText: "Le meilleur cru pour les connaisseurs, un peu tiede, mais le gout est si particulier..."
              , consequenceImage: "https://cdni.nastypornpics.com/300/1/87/19188127/19188127_011_b1a0.jpg"
              , consequences: { karma: 3, bonheur: 4, pervers: 3 }
            }, {
              text: "Celle qui n'a aucune inscription"
              , consequenceText: "Dommage c'etait le placard a balais... Une autre fois"
              , consequences: { bonheur: -2, karma: -4, violent: 3 }
            }
          ]
        }
      ]
    }
  }
];



export const BaseDeventTravail = [
  {
    nom: "Demissionner"
    , text: "Etes-vous sur de vouloir deposer cette lettre de demission ? "
    , condition: { notAnpe: true }
    , options: [
      {
        text: "Euh finalement j'hesite"
        , consequenceText: "Vous restez encore en poste, vous enfoncant dans ce sentiment de routine eternelle... Vous auriez mieux fait de ne pas y penser"
        , consequences: { karma: -10, bonheur: -4, social: -2, pervers: -2, intelligent: -1 }
      }
      , {
        text: "Oui je demissionne, c'est definitif"
        , consequenceText: "Vous posez votre demission annoncer votre depart a vos collegues"
        , options: [
          {
            text: "Pot de depart"
            , consequenceText: "Un bien bon moment, knacks et moutarde, avec un bon vin blanc, la photo dedicacee et la petite enveloppe d'adieu.. tout y etait."
            , consequences: { bonheur: 2, social: 10, violent: -2, karma: 5, promotion: -100 }
            , consequenceImage:"https://www.shop-jauss-traiteur.com/1359-large_default/knack-d-or-16-30---kg.jpg"
          }
          , {
            text: "Y en a marre de cette boite de merde, allez tous vous faire enculer"
            , consequenceText: "Vous partez en claquant la porte, satisfait de vous, mais il faudra revenir la semaine prochaine pour signer des papiers et vous aurez l'air con."
            , consequences: { bonheur: 3, social: -3, karma: -3, violent: 7, promotion: -100 }
          }
        ]
        , randomAction: {
          risque: 0.2
          , text: "Au dernier moment on vous fait une contre-proposition, une promotion directe (ou une augmentation serieuse si le rang max est atteint)"
          , options: [
            {
              text: "Vous acceptez, un tiens vaut mieux que deux..."
              , consequenceText: "Vous avez obtenu une belle promotion sans avoir a montrer votre cul, pas mal dans ce jeu"
              , consequences: { karma: 20, social: 10, bonheur: 4 }
            },
            {
              text: "Vous refusez la contre-offre... Sauf si la DRH me suce tous les matins"
              , consequenceText: "Elle n'hesite pas a se sacrifier pour la societe, vous en profitez quelques jours avant de re-poster la lettre et demissionner definitivement... "
              , consequences: { karma: 20, social: 10, bonheur: 4, promotion: -100 }
              , consequenceImage: "https://el.phncdn.com/gif/43818511.gif"
            }
          ]
        }
      }
    ]
  },
  {
    nom: "Feuilleter les petites annonces", icon:"ReceiptLong"
    , text: "Vous feuilletez les petites annonces. Vous cherchez quel genre de boulot ?"
    , options: [
      {
        text: "Emplois de bureau, tranquille et payé correctement"
        , consequences: {
          annonce: 'bureau'
        }
      },
      {
        text: "Emplois industriels, exigeants mais bien payés"
        , consequences: {
          annonce: 'industrie'
        }
      },
      {
        text: "Emplois de service, variés et accessibles, mais peu payés"
        , consequences: {
          annonce: 'service'
        }
      },
      {
        text: "Emplois d'exception', le reve a portee de main et la deception au bout du chemin"
        , consequences: {
          annonce: 'exception'
        }
      }
    ]
  }
  , {
    "nom": "Travailler dur", icon: "Engineering",
    text: "Dans quel domaine mettez-vous l'effort",
    options: [
      {

        "text": "Vous redoublez d'efforts pour  etre plus efficace",
        "consequences": {
          "karma": 4,
          "social": 2,
          argent: 20,
          promotion: 1
        },
        "consequenceText": "Vos collegues ont remarqué que vous etes un bosseur."
      }, {

        "text": "Vous faites des heures supp, sans forcement en faire plus",
        "consequences": {
          "karma": -3,
          "social": 2,
          bonheur: -3, pervers: 3, sante: -1,
          argent: 200,
          promotion: 2
        },
        "consequenceText": "En plus vous surfez sur internet la plupart du temps."
        , randomAction:{
          risque:0.15
          , condition:{sex:"M"}
          , involvedPnj:'collegue'
          , text:"Une collegue , $pnj.nom , vous invite a faire un after-work avec le reste de l'equipe"
          , options:[
            {
              text:'Vous acceptez'
              , consequenceText:'$pnj.nom vous emmene au Cucaracha, un bar assez hot. Il y a 3 autres collegues de la societe'
              , options:[
                {
                  text:'Vous prenez juste un verre et repartez chez vous'
                  , consequenceText:"Vos collegues ont apprecié de vous voir en-dehors du boulot, l'esprit d'equipe est renforcé"
                  , consequences:{promotion:1, social:3,karma:2}
                },{
                  text:'Vous quelques verres et restez avec les derniers de la bande'
                  , consequenceText:"$pnj.nom vous propose de finir la soiree chez elle pour un dernier verre"
                  , options:[
                    {
                      text:'No zob in job'
                      , consequenceText:"Vous declinez poliment et vous vous donnez rendez-vous a la machine a café le lendemain"
                      , consequences:{bonheur:2, karma:3,social:3,pervers:-3}
                    },{
                      text:'Pourquoi pas.. Je saurai rester courtois'
                      , consequenceText:"Arrivé chez elle, elle vous fait du rentre-dedans"
                      , options:[
                        {
                          text:'Tant pis pour elle, je la démonte dans les grandes largeurs'
                          , consequenceText:"Vous vous eclatez toute la nuit avec $pnj.nom.  le lendemain, a la machine a café, elle vous ignore"
                          , consequences:{bonheur:5, karma:-3,relation:2,pervers:5, enceinte: 0.2}
                        },{
                          text:'Et si on discutait plutot'
                          , consequenceText:"Elle est charmé par votre courtoisie et vous propose un autre rendez-vous. $pnj.nom est desormais votre amie"
                          , consequences:{ami:1,relation:30,karma:10,bonheur:8,social:2,pervers:-5}                        
                        }
                      ]
                    }
                  ]
                },{
                  text:"Vous draguez quelques minettes dans le bar, c'est rempli de bombasses par ici !"
                  , consequenceText:"Vos collegues ont apprecié moyennement de vous voir attirer l'attention,  en plus y avait que des petasses... Vous etes rentré bredouille"
                  , consequences:{ social:-1,karma:-2,intelligent:-1,pervers:2}
                }
              ]
            },{
              text:'Vous Refusez'
              , consequenceText:'Boulot dodo, j\'ai pas le temps, desolé. Votre collegue prend mal que vous ayez si peu d\'esprit d\'equipe'
              , consequences:{bonheur:-2,social:-5, promotion:-2}
            }
          ]
        }
      }, {
        text: "Vous soignez les relations avec vos collegues hommes"
        , condition: { sex: 'F' }
        , consequenceText:"De quelle manière, vous etes plutot active ou passive ?"
        , options: [
          {
            text: "Vous les laissez vous draguer",
            chance: 0.1, chanceOn: "social",
            consequenceTextOK: "On dirait que ca marche, vous avez du succès et les geeks se pressent pour vous seconder dans votre travail."
            , consequencesOK: { karma: 2, social: 5, bonheur: 2, promotion: 2 }
            , consequenceImage:"https://cdni.milfbank.com/1280/1/345/92352445/92352445_008_511d.jpg"
            , consequenceTextNOK: "On dirait que vous faites un bide , dur le retour a la realité, personne n'a remarqué vos nouveaux bas."
            , consequencesNOK: { karma: -2, social: -5, bonheur: -2, pervers: -2 }
          },
          {
            text: "Promotion canapé",
            consequenceText: "Rien ne vaut que de prendre les choses en mains, bon après faut assumer"
            , consequenceImage:"https://el.phncdn.com/gif/46233141.gif"
            , consequences: { karma: 5, social: 5, bonheur: 2, promotion: 5, pervers: 2 , enceinte: 0.2}
          }
        ]
      }
    ]



  }
  , {
    nom:"Faire un truc malhonnete", icon:"BugReport"
    , text:"Si vous essayez de piquer dans la caisse, je vous previens le test se fait sur votre intelligence, si vous etes cnos n'essayez pas"
    , options:[
      {
        text:"Piquer dans la caisse"
        , chance:0.1,chanceOn:"intelligent"
        , consequenceTextOK:"Vous avez reussi a detourner de l'argent, bien vu"
        , consequencesOK:{karma:-5,violent:2,pervers:1,argent:1000, bonheur:3}
        , consequenceTextNOK:"Vous vous etes fait choper a piquer des sous. Ca va pas le faire, vous etes virés"
        , consequencesNOK:{promotion:-100,violent:2,pervers:1,social:-10, bonheur:-10}
      },{
        text:"Mettre une camera dans les chiottes des femmes"
        , condition:{sex:"M"}
        , chance:0.1,chanceOn:"pervers"
        , consequenceTextOK:"Vous avez reussi a faire une jolie prise de vue de la jolie Audrey de la compta, tiens elle pisse debout ?"
        , consequencesOK:{karma:-5,social:-2,pervers:6,bonheur:5,promotion:1}
        , consequenceTextNOK:"Vous avez oublié la camera, et vous vous etes fait choper, vous etes virés"
        , consequencesNOK:{karma:-5,social:-10,pervers:6,bonheur:-10,promotion:-100}
        , consequenceImage:"https://el.phncdn.com/gif/46859351.gif"
      },{
        text:"Vendre son corps pour une soiree"
        , condition:{sex:"F"}
        
        , consequenceText:"Vous allez faire la pute au bord de la route, ca met du beurre dans les epinards"
        , consequences:{karma:1,social:2,pervers:6,bonheur:-2,argent:800}
        , consequenceImage:"https://el.phncdn.com/gif/44605191.gif"
      }
    ]
  }
]

export const BaseDeventLieux = {

  travail: []
  , fac: [
    {
      nom:"Choisir sa specialité"
      , text:"Il serait temps de suivre les cours.. Mais lesquels ?"
      , options:[
        {
          text:"Fac de Sciences"
          , consequenceText:"Vous avez choisi la voie scientifique ,Mathematiques, Biologie, chimie, medecine"
          , consequences:{
            karma:3,diplomes:'Etudes science', intelligent:5
          }
          , consequenceImage:"https://fm.univ-ouargla.dz/images/ann%C3%A9e_2019-2020/labo.jpg"
        }, {
          text:"Lettres et sciences humaines"
          , consequenceText:"La voie des glandus, mais je ne juge pas."
          , consequences:{
            social:3,diplomes:'Etudes social', intelligent:3
          }
          , consequenceImage:"https://img.lamontagne.fr/HQqbzduo5uEjSl5ExYkCzI2UFStq9wxEc-juGXRzmjc/fit/657/438/sm/0/bG9jYWw6Ly8vMDAvMDAvMDQvMjMvODYvMjAwMDAwNDIzODY4MA.jpg"
        }, {
          text:"Fac de droits"
          , consequenceText:"Vous avez choisi la voie la plus lucrative (en theorie). Bonne chance, vous n'etes pas le seul"
          , consequences:{
            karma:-3,diplomes:'Etudes droit', intelligent:1
          }
          , consequenceImage:"https://images.ladepeche.fr/api/v1/images/view/618ea47b8fe56f7026426474/large/image.jpg?v=1"
        }
      ]
    },
    ...commonSchoolActions,
  {
    nom: "Soiree etudiante", icon:"Liquor"
    , condition: { sex: "M" }
    , text: "Vous choisissez parmi les flyers du moment"
    , options: [
      {
        text: "Soiree Geekettes a l'IUT d'informatique "
        , consequenceText: "Vous cherchez encore les geekettes a cette soiree ou vous n'avez vu que des mecs"
        , consequences: {
          social: 2, karma: 2, pervers: -3
        }
      }
      , {
        text: "Soiree Infirmieres a l'institut de pharmacologie"
        , consequenceText: "Soiree de folie, les etudiantes infirmieres vous ont piégé dans un concours de celle qui suce le mieux.\nVous n'avez pas pu decider de la gagnante"
        , consequenceImage: "https://el.phncdn.com/gif/21562982.gif"
        , consequences: {
          social: 10, pervers: 10, bonheur: 10, maladies: { mst: 0.1 }, karma: -6
        }
      }
      , {
        text: "Soiree Hypnotique a la fac de psycho"
        , consequenceText: "Vous vous souvenez etre arrivé sur place, avoir vu le grand disque tournoyant... Et puis plus rien jusqu'a ce matin ou vous vous reveillez a poil sur le trottoir avec un tatouage tribal sur le torse"

        , consequences: {
          social: 4, violent: 10, bonheur: -10, maladies: { mst: 0.1 }, karma: -10, argent: -100
        }
      }
    ]
  }
  ]
  , lycee: [...commonSchoolActions],
  //***************   ECOLE ************************ */
  ecole: [...commonSchoolActions
    ,
  {
    "nom": "Changer de place", icon: "ChangeCircle",
    "text": "Choisissez entre le premier et le dernier rang",
    "options": [
      {
        "text": "S'asseoir au premier rang",
        "consequences": {
          "intelligent": 1, social: -1
        },
        "consequenceText": "Vous avez choisi de vous asseoir au premier rang, montrant votre engagement envers les études"
      },
      {
        "text": "S'asseoir au dernier rang",
        "consequences": {
          "bonheur": 2, social: 1
        },
        "consequenceText": "Vous avez choisi de vous asseoir au dernier rang, préférant une approche plus décontractée"
      }
    ]
    , randomAction:{
      risque:0.5
      , involvedPnj:"collegue"
      , text:"Alors que vous changiez de place, votre camarade $pnj.nom vous fait un croche-patte et vous etalez au milieu de la classe."
      , options:[
        {
          text:"Vous le denoncez au prof"
          , consequenceText:"Il prend une punition, vous etes ensuite chahuté a la recré pour avoir balancé... Sale annee scolaire"
          , consequences:{karma:-7,social:-10,violent:-1,relation:-20}
        }, {
          text:"Vous vous relevez sans rien dire mais preparez deja votre vengeance "
          , consequenceText:"Il prendra cher, vous lui remplirez son cartable de merde de chiens, il n'aura jamais la preuve que c'etait vous."
          , consequences:{karma:-7,social:-2,violent:7,relation:-10}
        }, {
          text:"Vous vous relevez et lui mettez un pain dans la gueule "
          , consequenceImage:"https://i.makeagif.com/media/7-28-2015/WmYW8_.gif"
          , consequenceText:"Vous vous battez copieusement jusqu'a ce que le prof vous separe, 2 heures de colle chacun, vous finirez un jour par vou entendre."
          , consequences:{karma:-2,social:7,violent:12,relation:-5}
        }
      ]
    }
  }
    ,
  {
    "nom": "Aider un camarade en difficulté", icon: "WavingHand",
    "text": "Apporter votre aide à un camarade en difficulté",
    consequenceText:"Mais si c'est pas sympa ca !",
    "consequences": {
      "karma": 5,
      "social": 3,bonheur:1
    } , randomAction:{
      risque:0.5
      , involvedPnj:"collegue"
      , text:"Vous vous rendez compte que $pnj.nom est vraiment un con fini, il n'apprendra jamais rien."
      , options:[
        {
          text:"Vous insistez, il retiendra bien quelque chose au final"
          , consequenceText:"Non il ne retiendra rien, c'est un con on vous a dit. Mais vous lui aurez bien cassé les couilles"
          , consequences:{karma:12,social:6,violent:-1,relation:-2}
        }, {
          text:"Vous finissez par faire des jeux ensemble ,puis vous laissez tomber"
          , consequenceText:"Il ne s'est meme pas rendu compte que c'etait des jeux et croyait toujours travailler. Qu'est-ce qu'il est con."
          , consequences:{karma:7,social:16,violent:-6,relation:6, bonheur:2}
        }, {
          text:"Vous lui dites qu'il doit trouver une autre voie que l'ecole"
          , consequenceText:"Il ne comprend pas. Qu'est-ce qu'il pourrait bien faire ? Il est si con."
          , options:[
            {
              text:"Eboueur"
              , consequenceText:"Pas besoin de diplomes, paye correcte, besoin en main d'oeuvre constant.. Bon plan"
              , consequences:{karma:10,social:6,violent:-1,relation:12}
            }, {
              text:"Aventurier urbain"
              , consequenceText:"C'etait juste un euphemisme pour dire clodo, mais il a choisi ca le con. Qu'est-ce qu'il est con."
              , consequences:{karma:-7,social:6,violent:2,relation:6}
            }, {
              text:"Acteur porno amateur"
              , consequenceText:"Il trouve cette idee grandiose et vous montre tout de suite ses talents... Le probleme c'est que dans 'amateur', il y a 'non payé', mais il est trop con"
              , consequences:{karma:7,social:6,pervers:4,relation:10}
              , consequenceImage:"https://el.phncdn.com/gif/28434742.gif"
            }
          ]
        }
      ]
    }
  },
  {
    "nom": "Chorale de l'école", icon: "LibraryMusic",
    "text": "Chanter en harmonie avec vos camarades",
    "condition": { "adolescence": true },
    consequenceText: "C'est aussi chiant que ca en a l'air",
    "consequences": {
      "bonheur": 1,
      "social": 1, violent: -1
    }
  },
  {
    "nom": "Journal de l'école", icon: "ReceiptLong",
    "text": "Partager vos pensées et expériences avec la communauté scolaire",
    "condition": { "adolescence": true, "adulescent": true },
    "options": [
      {
        "text": "Interviewer un enseignant",
        "consequences": {
          "intelligent": 1,
          "social": -1
        },
        "consequenceText": "Votre interview avec un enseignant a ajouté une perspective intéressante à l'article"
      },
      {
        "text": "Inclure des anecdotes humoristiques",
        "consequences": {
          "bonheur": 2,
          "social": 2
        },
        "consequenceText": "Les anecdotes humoristiques ont rendu l'article plus captivant"
      },
      {
        "text": "Faire un reportage photo",
        "consequenceText": "Tres captivant pour le public, mais quel sujet couvrir"
        , options:[
          {
            text:"Le match de l'equipe de foot de l'ecole"
            ,"consequences": {
              "bonheur": 2,
              "social": 7,sante:1,karma:1
            },
            "consequenceText": "Toute l'equipe a lu l'article, quel succes"
          },{
            text:"Le nouveau batiment annexe au CDI"
            ,"consequences": {
              "bonheur": -1,
              "social": 1,karma:-1
            },
            "consequenceText": "C'etait chiant, sand dec, c'etait vraiment chiant, ne refaites plus ca."
          },{
            text:"La salle de gym"
            ,"consequences": {
              "bonheur": 4,
              "social": 10,karma:1,pervers:4
            },
            consequenceImage:"https://el.phncdn.com/gif/43552391.gif",
            "consequenceText": "Tout le monde  adoré, sauf la fille que vous avez photographiee."
          }
        ]
      },
      {
        "text": "Concevoir un mot croisé",
        "consequences": {
          "intelligent": 1,
          "social": -1
        },
        "consequenceText": "Il etait brillant.. Mais seule votre maman l'a resolu. "
      }
    ]
  }

  ]
  , exterieur: [
    
    {
      "nom": "Pique-nique au parc", icon: "Deck",
      "text": "Profitez d'une journée en plein air avec un pique-nique au parc",
      "condition": { "enfance": true, "adolescence": true, "adulescent": true },
      consequenceText: "Quelle belle journee, a part ces satanees fourmis",
      "consequences": {
        "bonheur": 5,
        "sante": 1
      }
      , "randomAction": {
        "risque": 0.3,
        involvedPnj: 'pute',
        "text": "Pendant que vous dejeunez, un nudiste traverse le parc.",
        "options": [
          {
            "text": "Appeler la police",
            "consequences": {
              "karma": 2,
              "bonheur": 2, pervers: -10
            },
            "consequenceText": "La police arrive et arrete le nudiste, ouf la morale est sauve."
          }, {
            "text": "Le prendre en video pour le poster sur Youtube ",
            "consequences": {
              "karma": -3,
              "social": 3, pervers: 1
            },
            "consequenceText": "Vous avez fait 78 vues, c'est moyen, et l'une d'elle est le patron de cet homme qui s'est fait renvoyer"
          },
          {
            text: "S'en foutre et faire une sieste"
            , consequenceText: "Soudain vous vous reveillez et vous voyez ca"
            , consequenceImage: "https://ftopx.com/pic/1920x1080/202201/61e7d4eb91bfb.jpg"
            , options: [
              {
                text: "Madame, je vous en prie, vous me cachez le soleil",
                consequenceText: "Ah excusez-moi je vous avais pris pour mon petit ami... Et la dame s'en va en sautillant"
                , consequences: { karma: -2, bonheur: 2, pervers: -3 }
              },
              {
                text: "Non ne me faites pas pipi dessus !!",
                consequenceText: "C'est malin maintenant que tu l'as dit j'ai envie..."
                , options: [
                  {
                    text: "Il y a une sanisette plus loin"
                    , consequenceText: "La fille vous remercie et s'en va"
                    , consequences: { karma: -3, bonheur: -2, pervers: -6 }
                  }, {
                    text: "Vous ouvrez la bouche et dites : Allez-y, je vais vous eviter d'en mettre partout"
                    , consequenceText: "La fille s'approche vicieusement de votre bouche et vous lache un gros jet de pipi, vous avalez ce que vous pouvez et nettoyez la vulve de la nymphette avant qu'elle ne s'eclipse... Quelle belle journee"
                    , consequenceImage: "https://ftopx.com/pic/1024x768/202201/61dafc15ded93.jpg"
                    , consequences: { karma: 13, bonheur: 12, pervers: 16 }
                  }
                ]
              },
              {
                text: "Vous lui lechez la chatte",
                consequenceText: "Elle se tord de plaisir, et gicle dans votre bouche, tout le monde s'interesse au nudiste."
                , options: [
                  {
                    text: "Vous la baisez sur l'herbe"
                    , consequenceText: "Un bel apres-midi que voila, si seulement ma propre vie s'etait passé comme ca..."
                    , consequences: { karma: 10, bonheur: 10, pervers: 10 }
                  }, {
                    text: "Vous lui laissez votre numero, au cas ou elle aurait de nouveau une envie subite de passer dans le parc"
                    , consequenceText: "Elle vous embrasse et lèche votre menton des traces de cyprine qui coulent... Je te rappelle vous souffle-t-elle a l'oreille"
                    , consequences: { karma: 7, ami: 1, bonheur: 10, pervers: 6 }
                  }
                ]
              }
            ]
          },
          {
            "text": "Aller lui parler",
            "chance": 0.4,
            "chanceOn": "intelligent",
            "consequenceTextOK": "Vous reussissez a le convaincre d'aller exercer sa lubie dans un endroit moins frequenté",
            "consequencesOK": {
              "social": 4,
              "karma": 6,
              "bonheur": 5
            },
            "consequenceTextNOK": "Il ne vous ecoute pas et pire vous pisse dessus, bonjour l'humiliation"
            ,
            "consequencesNOK": {
              "violent": 2,
              "social": -2,
              "bonheur": -3
            }
          }
        ]
      }

    },
    {
      "nom": "Visiter un musée", icon: "Museum",
      "text": "Explorez l'histoire et l'art dans un musée local",
      "condition": { "adolescence": true, "adulescent": true, adulte:true },
      "options": [
        {
          "text": "Participer à une visite guidée",
          "consequences": {
            "intelligent": 2,
            "bonheur": 1
          },
          "consequenceText": "La visite guidée a ajouté une dimension interactive à votre expérience"
        },
        {
          "text": "Explorer par vous-même"
        
         , "consequenceText": "Votre exploration personnelle a permis de découvrir un passage secret entre 2 statues, vous l'empruntez jusqu'a un petit corridor qui se ferme sur un mur avec un trou"
          , options:[
            {
              text:"Je me suis perdue, vaudrait mieux que je retrouve mon chemin"
              , consequenceText:"Qui s'en fout"
              , consequences:{karma:-2}
            },
            {
              text:"C'est quoi ce trou ? "
              , condition:{sex:"F"}
              , consequenceText:"Vous vous arretez pour l'observer"
              , consequenceImage:"https://el.phncdn.com/gif/14896332.gif"
              , options:[
                {
                  text:"Bon ben si deja je suis la, hein !"
                  , consequenceText:"Mmmm, c'est encore meilleur quand on avale"
                  , consequenceImage:"https://el.phncdn.com/gif/12113281.gif"
                  , consequences:{karma:8, bonheur:5,social:-1,pervers:4}
                }
              ]
            },
            {
              text:"C'est quoi ce trou ? "
              , condition:{sex:"M"}
              , consequenceText:"Vous mettez votre bite dedans"
              , consequenceImage:"https://el.phncdn.com/gif/14896332.gif"
              , options:[
                {
                  text:"Restez jusqu'au bout"
                  , consequenceText:"Mmmm, c'est encore meilleur quand elle avale"
                  , consequenceImage:"https://el.phncdn.com/gif/12113281.gif"
                  , consequences:{karma:8, bonheur:5,social:1,pervers:4}
                }
              ]
            }
          ]
        }
      ]
      , "randomAction": {
        "risque": 0.3,
        "text": "Vous apercevez un malandrin qui colle son chewing-gum sur un tableau de maitre du XVIIe",
        "options": [
          {
            "text": "Appeler la sécurité du musée et le denoncer",
            "consequences": {
              "karma": 3,
              "bonheur": 1
            },
            "consequenceText": "La sécurité intervient rapidement et appréhende le malfaisant. Les employés vous remercient pour votre coopération."
          },
          {
            "text": "Ignorer la situation et continuer votre visite",
            "consequences": {
              "karma": -4,
              "social": -3
            },
            "consequenceText": "Vous choisissez de ne pas vous impliquer, lacheté ou misanthropie ?"
          },
          {
            "text": "Parler au type directement et lui demander de mettre son chwingue a la poubelle",
            "chance": 0.5,
            "chanceOn": "violent",
            "consequenceTextOK": "Vous l'impressionnez suffisamment pour qu'il aille decoller son chewing-gum et repartir en vous lancant un regard noir.",
            "consequencesOK": {
              "social": -2,
              "karma": 4,
              violent: -3,
              "bonheur": 2
            },
            "consequenceTextNOK": "Il vous crache a la gueule. Vous voulez lui en mettre une en retour, mais un vigile vous apercoit. Ce pauvre type n'en vaut pas la peine..."
            ,
            "consequencesNOK": {
              "social": -5,
              "karma": 2,
              violent: 2,
              "bonheur": -5
            }
          }
        ]
      }
    },
    {
      "nom": "Dîner au restaurant", icon: "Restaurant",
      "text": "Appréciez un délicieux repas dans un restaurant local",
      "condition": { "adulescent": true, adulte:true, argent:60 },
      "consequences": {
        "bonheur": 4,
        "sante": -1
      },
      "options": [
        {
          "text": "Commander le plat du chef",
         
          options:[
            {text:'Felicitez le chef de ma part'
  ,            "consequenceText": "Vous faites part de vos felicitations au serveur qui transmet au chef. Y a in teret a laisser un bon pourboire maintenant que vous vous l'etes bien pété"
 , "consequences": {
    "bonheur": 3,
    "sante": -1,social:4,argent:-60
  },
          }
          ,{
            text:"Je veux voir le chef"
            , consequenceText:"On vous emmenes aux cuisines, la cuisiniere est ravie de vos compliments"
            ,  "consequences": {
              "bonheur": 5,
              "sante": -1,social:6,argent:-60,pervers:1
            }
            , consequenceImage:"https://el.phncdn.com/gif/42708482.gif"
          }
          ]
         , "consequenceText": "Le plat du chef était délicieux, mais un peu trop copieux"
        },
        {
          "text": "Opter pour une option plus légère",
          "consequences": {
            "bonheur": 4,
            "sante": 1
          },
          "consequenceText": "Vous avez savouré un repas léger et équilibré"
        }
      ]
      , "randomAction": {
        "risque": 0.3,
        "text": "Pendant que vous dînez au restaurant, un client a une arête de poisson coincée dans la gorge.",
        "options": [
          {
            "text": "Demander de l'aide au personnel du restaurant",
            "consequences": {
              "karma": 2,
              "bonheur": 2, argent: 50
            },
            "consequenceText": "Le personnel réagit rapidement, retire l'arête et le client est reconnaissant et vous offre votre repas."
          }, {
            "text": "Ignorer la situation et continuer à manger",
            "consequences": {
              "karma": -5,
              "social": -3
            },
            "consequenceText": "Votre manque d'intervention est remarqué par d'autres clients, créant un malaise dans le restaurant. Heureusement le type est sauvé pa rle serveur"
          },
          {
            "text": "Essayer de l'aider moi-meme",
            "chance": 0.4,
            "chanceOn": "intelligent",
            "consequenceTextOK": "Vous utilisez une methode que vus avez vu sur Youtube et ca marche pas trop mal,\n l'homme expulse son arete et vous remercie. \nTout le monde applaudit votre geste",
            "consequencesOK": {
              "social": 10,
              "karma": 10,
              "bonheur": 5, argent: 50
            },
            "consequenceTextNOK": "Vous fracturez 3 cotes au malheureux qui decede quelques minutes plus tard d'asphyxie. \nVous expliquez a la police que vous m'avez jamais passé votre brevet de secouriste, c'est pour ca donc."
            ,
            "consequencesNOK": {
              "violent": 5,
              "karma": -7,
              "bonheur": -6
            }
          }
        ]
      }




    },
    {
      "nom": "Journée au zoo", icon: "Pets",
      "text": "Rencontrez des animaux fascinants au zoo",
      "condition": { "adulte": true, "adolescence": true , argent:10},
      consequenceText: " C'est toujours une joie, mais ils de nouveau augmenté le prix de l'entree...",
      "consequences": {
        "bonheur": 3, karma: -1,
        "sante": 1, argent: -10
      }
      , randomAction: {
        risque: 0.2
        , text: 'Soudain un gorille s\'echappe de sa cage et s\'approche de vous'
        , options: [
          {
            'text': "Vous restez de marbre, avec un peu de chance il vous verra pas"
            , consequenceText: "Il est assez myope et pas tres concentré, il part a la poursuite d'un chat qui passait par la"
            , consequences: { karma: 2, bonheur: 5, violent: -3 }
          }, {
            'text': "Vous faites signes aux soigneurs armés"
            , consequenceText: "Il se fait endormir avant de vous toucher, ouf, tout est bien qui finit bien"
            , consequences: { karma: -2, bonheur: 5, violent: -3, intelligent: -1 }
          }, {
            'text': "Vous vous cachez dans sa taniere"
            , consequenceText: "Pas tres malin, il vous poursuit et vous bloque la sortie."
            , options: [
              {
                text: 'Vous vous agenouillez en position de soumission en esperant que ca le calme'
                , consequenceText: "Loin de le calmer, ca l'excite et il commence a faire du va-et vient sur votre pantalon"
                , options: [
                  {
                    text: "Appeler a l'aide une derniere fois en priant"
                    , consequenceText: "Le gorille vous brise les jambes en essayant de vous enlever le pantalon, heureusement, les gardiens ont pu l'endormir avant que ce ne soit pire"
                    , consequences: { sante: -20, karma: 1, bonheur: -6 }
                  }, {
                    text: "S'agenouiller pour lui sucer la bite"
                    , consequenceText: "Le gorille vous laisse faire, surpris. Il finit par apprecier et vous inonde le gosier de sperme acre."
                    , consequences: { sante: -2, karma: 2, bonheur: 2, pervers: 5 }
                  }, {
                    text: 'Enlever votre pantalon et le laisser faire'
                    , chance: 0.5
                    , consequenceTextOK: 'Il vous encule a sec en y prenant beaucoup de plaisir. Quand il a fini, il partage sa banane avec vous'
                    , consequencesOK: { bonheur: 2, pervers: 5, karma: 1 }
                    , consequenceTextNOK: 'Il vous demonte le fion a grands coup de butoir. Quand vous pensez qu\'il a fini, ce sont les males betas qui prennent le relais et vous explosent le trou de balle. Vous devrez rester couché sur le ventre pendant une semaine'
                    , consequencesNOK: { bonheur: -5, pervers: 8, violent: 5, sante: -10 }
                  }
                ]
              }
              , {
                text: 'Vous faites de grands gestes pour l\'effrayer'
                , chance:0.2,chanceOn:'karma'
                , consequenceTextOK: 'Le gorille prend peur et vous marave la tronche d\'une baffe enorme avant de fuir'
                , consequencesOK: { sante: -10, karma: -3,maladie:{'Bras cassé':0.6} }
                , consequenceTextNOK: 'Le gorille  vous eclate la tronche, vous reduisant en bouillie, vous succombez a vos blessures'
                , consequencesNOK: { mort:"Attaqué par un gorille"}
              }
            ]
          }
        ]
      }
    },
    {
      "nom": "Shopping", icon: "Shop",
      "text": "Explorez les magasins et faites du shopping au centre commercial",
      "condition": { "adulescent": true, "adolescence": true, "adulte": true, "senior": true, argent:100 },
      "options": [
        {
          "text": "Acheter des vêtements à la mode",
          "consequences": {
            "bonheur": 3,
            "karma": -1,
            "argent": -100,social:4
            , possessions:{nom:"Vetements a la mode", valeur:80}
          },
          "consequenceText": "Vous avez ajouté des articles à la mode à votre garde-robe"
        },
        {
          "text": "Explorer les boutiques artisanales",
          "consequences": {
            "bonheur": 2,
            "social": 2,
            "karma": 2,
            "argent": -30
            , possessions:{nom:"Babioles", valeur:20, image:"https://www.pixifolies.com/dbimages/36893/pixi-franquin-mini-gaston-lagaffe-et-le-gaffophone.jpg"}
          },
          "consequenceText": "Vous avez découvert des trésors dans les boutiques artisanales"
        }, {
          "text": "Acheter une voiture",
          "consequenceText": "Quel modele voulez-vous acheter"
          , options:[
            {
              text:"une BMW neuve (52000 euros)"
              
              , consequenceText:"Vous voila intégré dans le club des gros connards"
              , consequences:{argent:-52000, bonheur:10,social:4,violent:5,karma:-10
                ,possessions: { nom: "voiture", valeur: 50000,image:"https://www.bmw.fr/content/dam/bmw/common/all-models/7-series/sedan/2022/navigation/bmw-7-series-sedan-modelfinder.png" }
              }
              , consequenceImage:"https://www.bmw.fr/content/dam/bmw/common/all-models/7-series/sedan/2022/navigation/bmw-7-series-sedan-modelfinder.png"
            },{
              text:"une Toyota Yaris neuve(20000 euros)"
              
              , consequenceText:"Une bien belle voiture fiable."
              , consequences:{argent:-20000, bonheur:5,social:1,violent:-1,karma:2
                ,possessions: { nom: "voiture", valeur: 20000,image:"https://www.automobile-magazine.fr/asset/cms/175857/config/124605/toyota-yaris-hybride-2020.jpg" }
              }
              , consequenceImage:"https://www.automobile-magazine.fr/asset/cms/175857/config/124605/toyota-yaris-hybride-2020.jpg"
            },{
              text:"une Hyundai d'occasion(2300 euros)"
              
              , consequenceText:"Pourvu qu'elle tienne quelques annees"
              , consequences:{argent:-2300, bonheur:2,violent:1,karma:-1
                ,possessions: { nom: "voiture", valeur: 2300,image:"https://www.ouestfrance-auto.com/p/annonces/26867854_1_26867854633dade4e4840803029195.jpg" }
              }
              , consequenceImage:"https://www.ouestfrance-auto.com/p/annonces/26867854_1_26867854633dade4e4840803029195.jpg"
            },{
              text:"La moins chere (500 euros)"
              
              , consequenceText:"Pourvu qu'elle tienne quelques heures"
              , consequences:{argent:-500, bonheur:1,violent:-1,karma:1
                ,possessions: { nom: "voiture", valeur: 500,image:"https://img.leboncoin.fr/api/v1/lbcpb1/images/05/de/e8/05dee8f368069c6a5ee7205af11b216af93aff5b.jpg?rule=ad-image" }
              }
              , consequenceImage:"https://img.leboncoin.fr/api/v1/lbcpb1/images/05/de/e8/05dee8f368069c6a5ee7205af11b216af93aff5b.jpg?rule=ad-image"
            }
          ]
        },
        {
          "text": "Faire les courses au Supr'u",
          "consequences": {
            "bonheur": -1,
            "social": 1,
            "argent": -20
          },
          "consequenceText": "Il faut bien les faire de temps en temps..."
          , randomAction: {
            risque: 0.2
            , text: "Une jeune femme vous demande lui l'aider a prendre un tube de cosmetique en hauteur"
            , options: [
              {
                text: "Vous acceptez, vous etes galant"
                , consequenceText: "Vous lui prenez le tube et vous vous apercevez qu'il s'agit d'un gel intime Freshanus"
                , options: [
                  {
                    text: "Vous faites une remarque que vous trouvez drole sur les produits honteux"
                    , "consequences": {
                      "bonheur": -2,
                      social: -2, karma: -2
                    }
                    , consequenceText: "La fille n'ose pas vous dire que votre vanne est pourrie, mais elle n'en pense pas moins."
                  }
                  , {
                    text: "Vous ne dites rien et continuez votre chemin"
                    , "consequences": {
                      "bonheur": -2,
                      social: -2, karma: -5
                    }
                    , consequenceText: "La fille rougit et part dans l'autre sens."
                  }
                  , {
                    text: "Vous lui dites qu'il existe des methodes plus naturelles"
                    , consequenceText: "Elle vous demande lesquelles ?"
                    , options: [
                      {
                        text: "L'aloe vera"
                        , "consequences": {
                          "bonheur": 1,
                          social: 2, karma: 1
                        }
                        , consequenceText: "La fille vous ecoute et prend bonne note de ces precieux conseils."
                      }, {
                        text: "L'amylase"
                        , consequenceText: "La fille ne comprend pas et vous demande des explications."
                        , options: [
                          {
                            text: "C'est une proteine d'origine endocrine aux proprietes incroyable"
                            , "consequences": {
                              "bonheur": 1,
                              social: -2, karma: -1, pervers: -5
                            }
                            , consequenceText: "La fille ne comprend pas trop et vous prend pour un taré... Merci pour le tube au fait !"
                          }, {
                            text: "C'est de la salive, vous voulez que je vous montre ?"
                            , consequenceText: "La fille accepte et vous emmene chez elle pour lui administrer votre remède a base d'amylase."
                            , consequenceImage: "https://gifcandy.net/wp-content/uploads/2019/12/Dillion-Harper-teen-asshole-ate-out.gif"
                            , consequences: { karma: 5, social: 5, bonheur: 5, pervers: 5 }
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
              ,
              {
                text: "Vous refusez, vous avez pas que ca a foutre"
                , "consequences": {
                  "bonheur": -2,
                  "social": -5
                }
                , consequenceText: "Vous seriez pas un gros connard ?"
              }
            ]
          }
        }
      ]
    },
    {
      "nom": "Jogging",icon:"DirectionsRun",
      "text": "Faites de l'exercice en plein air avec une séance de jogging",
      "condition": { "adolescence": true, "adulte": true, "adulescent": true },
      "consequences": {
        "bonheur": 2,
        "sante": 5
      }
      , consequenceText: "C'est excellent pour la santé !"
      , randomAction: {
        risque: 0.8
        , condition: { sex: 'M' }
        , involvedPnj: 'pute'
        , text: 'Alors que vous courrez, vous entendez une voix feminine par-dela le bosquet voisin'
        , options: [
          {
            text: 'Vous remettez votre casque, Faudrait pas ruiner le rythme'
            , consequenceText: 'La musique est bonne, vous n\'entendez plus ces plaintes desagreables, la vie est belle'
            , consequences: { karma: -10, social: -2, sante: 2 }
          }
          , {
            text: 'Vous allez voir'
            , consequenceText: 'Une jeune fille est tombee dans le ravin plein de ronces, ses vetements sont dechirés, elle voua appelle a l\'aide'

            , options: [
              {
                text: "Vous appelez le 15"
                , consequenceText: 'Les secours arrivent pour desincarcerer la pauvre fille de ces ronces, elle vous remercie'
                , consequences: { karma: 5, social: 5, bonheur: 4 }
              },
              {
                text: "Vous lui jouez un sale tour"
                , consequenceText: 'Vous lui pissez dessus en riant et vous partez sous ses insultes'
                , consequences: { karma: -5, social: -5, bonheur: 8 }
              }
              , {
                text: 'Vous essayez de la degager vous-meme'
                , consequenceText: 'Ses vetements sont en lambeaux, elle est a present quasi nue et laceree de partout, impossible de la degager plus sans la faire souffrir'

                , options: [
                  {
                    text: "Vous abandonnez et appelez les secours"
                    , consequenceText: 'Les secours arrivent pour desincarcerer la pauvre fille de ces ronces, elle vous remercie'
                    , consequences: { karma: 10, social: 5, bonheur: 2, pervers: -7 }
                  },
                  {
                    text: "Vous en profitez pour la peloter sous pretexte de l'aider"
                    , consequenceText: "D'abord genee, elle semble finalement prendre du plaisir a vos attouchements"
                    , options: [
                      {
                        text: "Vous la doigtez delicatement"
                        , consequenceText: 'Elle  gemit de plaisir et vous supplie de la prendre'
                        , options: [
                          {
                            text: "Vous degagez ses fesses pour la prendre en levrette"
                            , consequenceText: "Elle hurle son plaisir et s'evanouit au moment de l'orgasme"
                            , consequences: { karma: -2, social: 2, bonheur: 12, pervers: 7 }
                          }, {
                            text: "Vous la fistez"
                            , consequenceText: "Elle hurle son plaisir et s'evanouit au moment de l'orgasme"
                            , consequences: { karma: -5, social: 1, bonheur: 5, pervers: 10 }
                            , consequenceImage:"https://xgifer.com/content/2022/04/fisting_001-2.gif"
                          }
                        ]

                      },
                      {
                        text: "Vous essayez de tirer sur les ronces pour la  liberer "
                        , consequenceText: "Cela ne fait que la lacérer un peu plus.\n Elle crie de douleur et vous supplie de continuer, une vraie maso."
                        , options: [
                          {
                            text: "Vous la fouettez avec des ronces"
                            , consequenceText: "Son corps est en sang et elle a du avoir 3 orgasmes,\n vous vous branlez devant tant de debauches et la laissez empetree dans ses ronces."
                            , consequences: { karma: -10, social: -6, bonheur: 7, pervers: 12 }
                          }, {
                            text: "Vous la baisez"
                            , consequenceText: "Elle ne demande que ca et ses convulsions vaginales montrent au moins 3 orgasmes"
                            , options: [
                              {
                                text: "Vous la liberez finalement"
                                , consequenceText: "Son corps est en sang , mais son visage est radieux,\n Elle vous demande votre numero avant de partir."
                                , consequences: { karma: 10, social: 6, bonheur: 10, pervers: 12, ami: 1 }
                              }, {
                                text: "Aller au bout du SM"
                                , consequenceText: "Au moment de l'orgasme vous lui plantez votre bite au fond de la gorge pour tout ejaculer dans son estomac.\n Puis vous attendez de debander et vous videz votre vessie directement dans sa bouche de salope qui en redemande."
                                , consequences: { karma: -25, social: -10, bonheur: 25, pervers: 20 }
                              }, {
                                text: "La fouetter avec des orties"
                                , consequenceText: "Elle ne demande que ca en plus cette grosse salope."
                                , consequenceImage: "https://ei.phncdn.com/videos/202310/15/441247731/thumbs_5/(m=eaf8Ggaaaa)(mh=Tl-p8dtHoNKIpKY1)6.jpg"
                                , consequences: { karma: -25, social: -10, bonheur: 25, pervers: 25 }
                              }
                            ]
                          }
                        ]

                      }
                    ]

                  }
                ]
              }
            ]
          }
        ]
      }
    },
    {
      "nom": "Concert en plein air",icon:"MusicNote",
      "text": "Profitez de la musique en plein air lors d'un concert local",
      "condition": { "adulescent": true, adulte: true, sex: 'F' },
      "consequences": {
        "bonheur": 4, argent: -10,
        "social": 2
      }
      , randomAction: {
        risque: 0.4
        , text: "Pendant le concert un jeune homme vous invite a finir la nuit chez lui avec 4 amis."
        , options: [
          {
            text: "Vous acceptez, il a l'air gentil"
            , consequenceText: "Arrivé chez lui , ses amis ferment la porte et se deshabillent"

            , options: [
              {
                text: "Vous souriez... Allez, un plan a 5, j'avais jamais fait"
                , consequenceText: "Comment dire.. la soiree fut sympathique"
                , consequenceImage: "https://el.phncdn.com/gif/14829752.gif"
                , consequences: { bonheur: 10, pervers: 10, social: 10, violent: 10, enceinte: 0.4 }
              }, {
                text: "Vous refusez, pas question, a la limite deux d'entre vous"
                , consequenceText: "Ils acceptent... Ce sera deux... par deux et en meme temps !."
                , consequenceImage: "https://el.phncdn.com/gif/16347162.gif"
                , consequences: { social: 8, bonheur: 10, karma: 5, violent: 5, pervers: 10, enceinte: 0.2 }
              }, {
                text: "Vous refusez de faire ca en groupe... Un seul aura le droit, les autres regardent."
                , consequenceText: "Ils acceptent... Et choisissent celui qui a la plus grosse et de la mettre dans le cul !."
                , consequenceImage: " https://el.phncdn.com/gif/22602741.gif"
                , consequences: { social: 8, bonheur: 5, sante: -4, karma: -5, violent: 5, pervers: 6 }
              }

            ]
          }, {
            text: "Vous refusez il a l'air vicieux"
            , consequenceText: "Il vous traite de pimbeche et vous laisse payer sa biere."
            , consequences: { argent: -5, social: 3, bonheur: -2, karma: 5 }
          }
        ]
      }
    },
    {
      "nom": "Parc d'attractions",icon:"Attractions",
      "text": "Choisissez votre parc d'attractions",
      "condition": { "adulescent": true, "enfance": true },
      "consequences": {
        "bonheur": 5, argent: -10,
        "sante": -1
      },
      "options": [
        {
          "text": "Disneyland",
          condition:{argent:100},
          "consequences": {
            "bonheur": 5,
            "karma": -1,
            "argent": -100
          },
          "consequenceText": "Vous avez acheté toutes les babioles de la boutique de la princesse. Mais c'etait amusant"
        }, {
          "text": "Didiland",
          condition:{argent:10},
          "consequences": {
            "bonheur": 2,
            "social": 1,
            "argent": -10
          },
          "consequenceText": "Ils ont rajouté un nouveau manège de tacots pour petits enfants... Chouette ! "
          , consequenceImage:"https://cdn5-images.motherlessmedia.com/images/60B4694.jpg"
        }, {
          "text": "Europapark",
          condition:{argent:80},
          "consequences": {
            "bonheur": 10,
            "sante": -1,
            "argent": -80
          },

          "consequenceText": "Vous avez vomi dans le Silver star. Mais c'etait amusant"
          , randomAction:{
            risque:0.5
            , text:"Une touriste a profité des jets d'eaux.. C'est quand meme bien Europapark"
            , consequenceImage:"https://www.80spornclassic.com/image/nude-photoshoot-public-park.gif"
          ,"consequences": {
            "bonheur": 10,
            "karma": 1,
            "argent": -100
          }
          }
        },
      ]
    }

  ]
  , maison: [
    {
      nom: "Reviser", text: "Le savoir c'est la clef", icon: 'BusinessCenter'
      , condition: { enfance: true, adolescence: true, adulescent: true }
      , consequences: {
        intelligent: 1
      }
      , randomAction: {
        risque: 0.3
        , involvedPnj: 'collegue'
        , text: 'Vous decouvrez un petit mot planqué dans votre cahier de texte, il est de $pnj.nom, votre camarade de classe qui vous trouve tres beau'
        , options: [
          {
            text: 'Lui mettre la honte le lendemain en classe'
            , consequenceText: 'Vous exhibez le mot et mettez la honte sur $pnj.nom et toute sa generation sur 2 siecles.'
            , consequences: { bonheur: 2, pervers: 3, violent: 5, relation: -30, social:1 , karma:-10}
          },
          {
            text: "Vous lui glissez un petit mot le lendemain pour dire que ce n'est pas reciproque"
            , consequenceText: "Franchement, il a une tete de con, non ?"
            , consequences: { bonheur: -2, pervers: 3, social: -3, relation:-15 ,karma:-3}
          },
          {
            text: "Vous lui rendez un mot avec un coeur dessus"
            , chance: 0.9
            , consequenceTextOK: "Vous avez un nouvel ami ! (Et peut-etre + si affinites)"
            , consequencesOK: { ami:1, bonheur: 3, violent: -2, relation: 10, karma:4 }
            , consequenceTextNOK: "Le lendemain $pnj.nom vient vous voir... En fait, je me suis trompé de destinataire, desolée"
            , consequencesNOK: { bonheur: -10, social:2, violent: -2, relation: -20,karma:2,intelligent:1 }
          }
        ]
      }
    }
    , {
      nom: "Jouer sur la PS5", text: "Pourquoi s'en faire", icon: 'SportsEsports'
      , condition:{enfance:true,adulescent:true,adolescence:true}
      , consequences: {
        bonheur: 2, intelligent: -1, social:-3,violent:1
      }
      , randomAction: {
        risque: 0.2
        , condition:{sex:'F'}
        , text:"Soudain la PS5 se bloque et ne veut plus demarrer le jeu"
        , options:[
          {text:"Voir ce qui coince"
        , consequenceText:"Vous ouvrez la console, mais vous n'y connaissez rien, donc vous ne savez pas ce que vous faites, impossible de la remonter correctement. Votre PS est foutue, attendez Noel prochain pour en avoir une neuve ! (prelevé sur votre argent de poche)"
          , consequences:{karma:-3,social:1,bonheur:-6,violent:1, argent:-299}
        }, {
          text:"La rapporter au magasin"
          , consequenceText:"Le technicien l'examine et vous dit que le lecteur laser est pété, ca coute une blinde"
          , options:[
            {
              text:"OK, balancez la facture, je m'en fous c'est mes parents qui payent"
              , consequenceText:"Vos parents refusent de payer la facture parce que le technicien a dit que quelqu'un avait versé du coca sur la console. Vous en etes de vos propre sous"
              , consequences:{karma:-6,social:-1,bonheur:-6,violent:1, argent:-250}
            },{
              text:"Y a moyen de s'arranger ?"
              , consequenceText:"Le technicien vous regarde et dit.."
              , options:[
                {text:" Ben j'ai un lecteur d'occasion sur une PS en panne, si j'ai une petite compensation, je vous l'installe"
                , consequenceText:"Ca vaut bien une petite pipe, non ?"
                , consequenceImage:"https://porngif.co/wp-content/uploads/2023/08/145261-blow3.gif"
                , consequences:{karma:3,social:3,bonheur:2,pervers:2}
                },{text:"Ben j'ai un lecteur neuf tombé du camion, si j'ai une grosse compensation, je vous l'installe"
                , consequenceText:"Il vous demonte le cul, vos prochaines parties de GTA se feront couchée sur le ventre"
                , consequenceImage:"https://porngif.co/wp-content/uploads/2023/12/177047-babes-update-50045.gif"
                , consequences:{karma:3,social:3,bonheur:2,pervers:2, enceinte: 0.2}
                }
              ]
            }
          ]
        }
      ]
      }
    }
    , {
      nom: "Fouiller la maison", text: "Qui sait ce qu'on peut trouver", icon: 'ZoomIn'
      , condition: { enfance: true, adolescence: true }
      , randomAction: {
        risque: 0.3
        , involvedPnj: 'Maman'
        , text: 'Vous vous etes fait choper par maman la main dans son tiroir a sextoy. Comment reagir...'
        , options: [
          {
            text: 'S\'excuser et pleurer'
            , chance: 0.5, chanceOn:'empathie'
            , consequenceTextOK: 'Votre mere vous pardonne et vous offre un chocolat chaud a la place.'
            , consequencesOK: { bonheur: 2, pervers: -3, violent: -3, relation: 3 }
            , consequenceTextNOK: 'Votre mere vous punit pour votre curiosité, au lit a 8h pendant une semaine.'
            , consequencesNOK: { bonheur: -2, pervers: -3, violent: 2, relation: -1 }
          },
          {
            text: 'Pretendre que vous cherchiez la telecommande'
            , chance: 0.5, chanceOn:'empathie'
            , consequenceTextOK: 'Votre mere vous croit et vous dit qu\'elle est a sa place au salon, voyons.'
            , consequencesOK: { bonheur: 2, pervers: -3, social: -3 }
            , consequenceTextNOK: 'Votre mere vous punit pour votre  mensonge, au lit a 8h pendant un mois.'
            , consequencesNOK: { bonheur: -5, pervers: -2, violent: 5, relation: -5 }
          },
          {
            text: 'Detourner l\'attention sur le sex toy.. Et ben maman, on se fait plaisir en douce ?'
            , chance: 0.9
            , consequenceTextOK: 'Votre mere rougit et vous montre comment elle s\'en sert.'
            , consequencesOK: { bonheur: 10, pervers: 4, relation: 5 }
            , consequenceTextNOK: 'Votre mere vous gifle pour votre insolence,privé de cake a la banane a vie.'
            , consequencesNOK: { bonheur: -10, pervers: 2, violent: 2, relation: -10 }
          }
        ]
      }
      , options: [
        {
          text: 'Dans les affaires de papa'
          , consequences: {
            possessions: { nom: "tournevis", valeur: 10, image:"https://ih1.redbubble.net/image.5007534162.5685/flat,750x,075,f-pad,750x1000,f8f8f8.jpg" }
          }
          , consequenceText: 'vous avez trouvé un tournevis'
        },
        {
          text: 'Dans les affaires de maman'
          , consequences: {
            bonheur: 2, pervers: 5, possessions: { nom: "sex toy", valeur: 90, image:"https://m.media-amazon.com/images/I/51ThlCk9rxL._AC_UF1000,1000_QL80_.jpg" }
          }
          , consequenceText: 'vous avez trouvé un sex toy'
        }
      ]
    }
    , {
      "nom": "Film en famille", icon: "Tv",
      "text": "Une soirée cinéma en famille",
      
      "condition": {sex:"M", "enfance": true, "adolescence": true, "adulescent": true },
      consequenceText: "Un bon vieux de Funès, ca fait toujours paisir",
      "consequences": {
        "bonheur": 2,
        "social": 1, relation: 2
      }
      , randomAction: {
        risque: 0.6
        , involvedPnj: "Maman",
        text: 'Le film se finit et vous laissez courir la K7 du magnetoscope... Qui arrive sur un film porno'
        , options: [
          {
            text: "Faire comme si de rien n'etait et continuer a regarder"
            , consequenceText: "Vous commencez a bander, c'est genant"
            , options: [
              {
                text: "Vous eteignez le magnetoscope et dites bonsoir"
                , consequenceText: "Une bonne branlette et au lit."
                , consequences: { bonheur: 2, relation: 1, pervers: 1 }
              },
              {
                text: "Vous sortez votre bite et commencez a vous branler"
                , consequenceText: "Votre mère vous regarde avec surprise, mais ne dit rien et en profite pour se passer un doigt dans le pyjama en regardant le film. A l'ecran on voit un homme devorer la chatte d'une femme blonde"
                , consequenceImage: "https://el.phncdn.com/gif/38349801.gif"
                , options: [
                  {
                    text: "Vous commentez leur pietre performance d'acteurs"
                    , consequenceText: "Votre mere en rigole, l'ambiance retombe, moment genant, il est temps d'aller se coucher."
                    , consequences: { relation: -1, bonheur: 2, pervers: 2 }
                  },
                  {
                    text: "Vous dites qu'il s'y prend comme un manche"
                    , consequenceText: "Votre mère vous repond: Tu saurais faire mieux ?"
                    , options: [
                      {
                        text: "Non mais j'ai deja vu d'autres pornos ou c'etait mieux fait"
                        , consequenceText: "Votre mere en rigole, vous finissez de vous branler cote-a-cote, il est temps d'aller se coucher."
                        , consequences: { relation: 2, bonheur: 3, karma: 1, pervers: -2 }
                      }
                      , {
                        text: "J'assure, tu veux voir ?"
                        , consequenceText: "Maman descend son pyjama et ecarte les cuisses"
                        , options: [
                          {
                            text: "La baiser"
                            , consequenceText: "L'excitation est tres forte et vous ejaculez assez vite, maman est un peu frustree, elle attendait une minette..."
                            , consequences: { relation: 3, bonheur: 3, pervers: 5 }
                          }, {
                            text: "La lécher"
                            , consequenceText: "Elle fond de bonheur, cela faisait des annees que personne ne lui avait léché la chatte et elle adore ca. Elle vous presse la tete contre son sexe, puis se retourne a quatre pattes"
                            , options: [
                              {
                                text: "La prendre en levrette"
                                , consequenceText: "L'excitation est tres forte et vous arrivez tous les 2 a l'orgasme assez vite, dimanche vous aurez droit a du cake a la banane doublement dosé."
                                , consequences: { relation: 20, bonheur: 10, pervers: 15 }
                              }, {
                                text: "Lui lécher le cul"
                                , consequenceText: "Elle gémit de plaisir, personne ne lui avait jamais léché le cul et elle adore decouvre qu'elle ca. Et vous aussi vous plongez votre langue dans son rectum avec delectation. A la fin elle vous suce pour vous finir, la soiree parfaite."
                                , consequences: { relation: 50, bonheur: 50, pervers: 50 }
                                , consequenceImage: "https://ftopx.com/pic/1024x768/201212/44547.jpg"
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  },
                  {
                    text: "Vous vous finissez la-dessus "
                    , consequenceText: "et dans un mouchoir s'il-te plait vous dit votre mere en s'astiquant un peu plus vite pour se finir elle aussi."
                    , consequences: { karma: 1, relation: 5, pervers: 4 }
                  }
                ]
              }
            ]
          }
          , {
            text: "Proposer une orgie",
            chance: 0.5, chanceOn: "pervers",
            consequenceTextOK: "Pourquoi pas on n'a jamais essayé... Vous decouvrez ce soir-la que votre mère est une sacrée salope et qu'elle suce divinement bien."
            , consequencesOK: { bonheur: 10, pervers: 12, social: 3, relation: 20 }
            , consequenceTextNOK: "Votre proposition choque tout le monde, vous passez pour un gros pervers."
            , consequencesNOK: { pervers: 12, social: -4, bonheur: -2, relation: -10 }
          }, {
            text: "Vous eteignez le magnetoscope et dites bonsoir"
            , consequenceText: "Une bonne branlette et au lit."
            , consequences: { bonheur: 1, social: 1, karma: 1, relation: 1 }
          }
        ]
      }
    },{
      "nom": "Film en famille", icon: "Tv",
      "text": "Une soirée cinéma en famille",
      
      "condition": {sex:"F", "enfance": true, "adolescence": true, "adulescent": true },
      consequenceText: "Un bon vieux de Funès, ca fait toujours paisir",
      "consequences": {
        "bonheur": 2,
        "social": 1, relation: 2
      }
      , randomAction: {
        risque: 0.6
        , involvedPnj: "Papa",
        text: 'Le film se finit et vous laissez courir la K7 du magnetoscope... Qui arrive sur un film porno'
        , options: [
          {
            text: "Faire comme si de rien n'etait et continuer a regarder"
            , consequenceText: "Votre père commence a bander, c'est genant"
            , options: [
              {
                text: "Vous eteignez le magnetoscope et dites bonsoir"
                , consequenceText: "Une bonne branlette et au lit."
                , consequences: { bonheur: 2, relation: 1, pervers: 1 }
              },
              {
                text: "Vous mettez la main dans votre culotte et commencez a vous toucher"
                , consequenceText: "Votre père vous regarde et vous invite a vous mettre votre tete sur ses genoux. "
                , options: [
                  {
                    text: "Vous refusez, on voit ou ca va aller"
                    , consequenceText: "Votre pere en rigole, l'ambiance retombe, moment genant, il est temps d'aller se coucher."
                    , consequences: { relation: -1, bonheur: 2, pervers: -2 }
                  },
                  {
                    text: "Vous mettez votre tete sur ses genoux"
                    , consequenceText: "Vous doutiez de l'issue ?"
                    , consequenceImage:"https://area51.porn/contents/videos_screenshots/16000/16104/preview.jpg"
                    , options: [
                      {
                        text: "Vous proposez un 69"
                        , consequenceImage:"https://64.media.tumblr.com/c4451145ec44c915c5f1fc1816276aa5/tumblr_n44xlrNFT71ttx3xro1_500.gif"
                        , consequenceText: "La position parfaite pour finir la soiree."
                        , consequences: { relation: 10, bonheur: 5, karma: 1, pervers: 5 }
                      }
                      , {
                        text: "Vous attendez"
                        , consequenceText: "Papa aussi... Et forcement..."
                        ,   consequences: { relation: 12, bonheur: 5, pervers: 10 }
                        , consequenceImage: "https://mobifcuk.com/wp-content/uploads/2023/01/stepdad-gives-stepdaughter-oral-creampie.jpg"
                      }
                    ]
                  }
                ]
              }
            ]
          }
          , {
            text: "Proposer une orgie",
            chance: 0.5, chanceOn: "pervers",
            consequenceTextOK: "Pourquoi pas on n'a jamais essayé... Vous decouvrez ce soir-la que votre mère est une sacrée salope et qu'elle suce divinement bien."
            , consequencesOK: { bonheur: 10, pervers: 12, social: 3, relation: 20 }
            , consequenceTextNOK: "Votre proposition choque tout le monde, vous passez pour un gros pervers."
            , consequencesNOK: { pervers: 12, social: -4, bonheur: -2, relation: -10 }
          }, {
            text: "Vous eteignez le magnetoscope et dites bonsoir"
            , consequenceText: "Une bonne branlette et au lit."
            , consequences: { bonheur: 1, social: 1, karma: 1, relation: 1 }
          }
        ]
      }
    },
    {
      "nom": "Cuisiner un repas", icon: "OutdoorGrill",
      "text": "Préparer un délicieux repas",
      "condition": { "adolescence": true, "adulescent": true },
      "options": [
        {
          "text": "Faire un gâteau au chocolat",
          "consequences": {
            "bonheur": 3,
            "sante": -1,
            "possessions": { nom: "Gateau", valeur: 20 }
          },
          "consequenceText": "Vous avez fait un délicieux gâteau au chocolat"
          , randomAction: {
            risque: 0.82
            , text: "Il vous manque un peu de farine"
            , "options": [
              {
                "text": "Aller en acheter au Supr'u",
                "consequences": {
                  "bonheur": 3,
                  "social": 2,
                },
                "consequenceText": "Vous avez finalement pu faire votre gateau, il etait super bon"
              },
              {
                "text": "En demander a la voisine",
                "consequenceText": "La voisine est super gentille et vient meme vous aider a le cuisiner"
                , options: [
                  {
                    text: "Ambiance rigolade"
                    , consequenceText: "A la fin, le gateau est un peu flagada, mais la voisine est toujours hilare... Eh Non attends ne t'assois pas dessus !! Trop tard."
                    , consequences: { bonheur: 10, pervers: 3, argent: -5, karma: 2 }
                    , consequenceImage: "https://64.media.tumblr.com/049ec5ec895096b407badf70bcef9b49/tumblr_nh8tausvOm1sujddto1_400.gif"
                  }, {
                    text: "Ambiance Le Meilleur patissier"
                    , consequenceText: "A la fin, le gateau est magnifique, vousle goutez ensemble et passez un tres bon moment. Inutile d'en esperer plus, la voisine est mariée"
                    , consequences: { bonheur: 5, pervers: -1, social: 6, karma: 1 }
                  }
                ]
              }
            ]
          }
        },
        {
          "text": "Préparer une salade",
          "consequences": {
            "bonheur": 2,
            "sante": 2
          },
          "consequenceText": "Vous avez préparé une délicieuse salade"
        },
        {
          "text": "Ouvrir une boite",
          "consequences": {
            "karma": -1,
            "sante": -2
          },
          "consequenceText": "Vous avez ouvert une boite de raviolis... C'est pathetique."
        }
      ]
    },
    {
      "nom": "Jeux de société", icon: "Casino",
      "text": "Inviter des amis pour une soirée de jeux",
      "condition": { "adulescent": true },
      "consequences": {
        "bonheur": 4,
        "social": 2
      },
      "options": [
        {
          "text": "Jouer à Monopoly",
          "consequences": {
            "bonheur": -1,
            "social": 1
          },
          "consequenceText": "Vous avez passé une soirée passionnante à jouer au Monopoly, au final tout le monde s'est engueulé"
        },
        {
          "text": "Jouer à Trivial pursuit",
          "consequences": {
            "intelligent": 1,
            "social": 2
          },
          "consequenceText": "Vous vous etes amusé en apprenant des choses"
        },
        {
          "text": "Organiser une partouze",
          "consequences": {
            "bonheur": 5,
            "social": 5, pervers: 8
          },
          "consequenceText": "Tout le monde n'a pas ete aussi receptif, mais ce fut une soiree sympa au final ?"
          , consequenceImage: "https://el.phncdn.com/gif/5905231.gif"
        }
      ]
    }

  ]
  , ephad:[
    {
      nom:"Regarder la TV dans la salle commune"
      , text:"Il y a du monde aujourd'hui dans la salle commune, et ils passent Derrick, super !"
      , consequences:{bonheur:1,social:3,karma:-1,pervers:-5,violent:-3}
    }
  ]
}

/*
activite a copier:

{
            nom:'titre de la dialog',
            text:'explications',
            condition:ConditionObj(agePeriode:true , travail:'metier' (un certain metier))
            options:[{
                text:'1er choix',
                consequences :[],
                consequenceText:'resultats de ce choix',
                options :[]
            }
            , 
            ]
        }


*/