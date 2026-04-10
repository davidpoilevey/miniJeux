/**
 * BaseDevent mais aussi d'activite
 * structure schema:
 * Activite= {
 *  nom
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
import {
  coupDeFilSurprise, journeePluvieuse, bitureInattendue, carnetSpecial, defiVelo, saleToux, panneDeVoiture
  , petitFrere, petitFrereLubrique, petiteSoeurLubrique, voyageSpontane, soubrette
} from "./BaseCommonEvents"
export const BaseDeventAgePeriode = {
  'nourrisson': [
    {
      nom: 'Violence a la creche',
      text: 'un camarade de creche vous mord le pied. Comment reagissez-vous ?'
      , options: [
        {
          text: 'Je lui mets une tatane en retour'
          , consequences: { social: -2, karma: -2 }
          , consequenceText: 'La maitresse vous punit et previent vos parents'
        }
        ,
        {
          text: 'Je lui mords le sien en retour'
          , consequences: { social: -2, sante: -2, maladie: { chiasse: 0.5 } }
          , consequenceText: 'Il avait les pieds sales, pourvu que vous ne tombiez pas malade'
        }
        ,
        {
          text: 'Je le denonce a la maitresse'
          , consequences: { bonheur: +1, karma: +1 }
          , consequenceText: 'Pour se venger il me casse la gueule a la récré'
          , options: [
            {
              text: 'Je le re-denonce a la maitresse'
              , consequences: { bonheur: +1, karma: +1 }
              , consequenceText: 'Il s\'est fait virer. \nBien fait pour sa gueule'
            },
            {
              text: 'Je lui pete la gueule en retour'
              , consequences: { ami: +1, violent: 2 }
              , consequenceText: 'Vous vous etes bien  marravés, a la fin vous etes devenus potes'
            },
            {
              text: 'Je demande a mes parents de changer d\'ecole'
              , consequences: { social: -3, bonheur: -2 }
              , consequenceText: 'Et puis quoi encore ! Et maintenant vous passez pour un pleurnichard'
            }
          ]
        }
      ]
    }
    , {
      "nom": "Première dent qui tombe",
      "text": "Votre première dent de lait tombe. Que faites-vous ?",
      "options": [
        {
          "text": "Demander au Père Noël",
          "consequences": { "bonheur": 2, karma: 1 },
          "consequenceText": "Vous décidez de demander au Père Noël de faire un vœu avec votre dent de lait, renforçant votre bonheur et votre imagination."
        },
        {
          "text": "Placer sous l'oreiller",
          "consequences": { "bonheur": 3, argent: 1 },
          "consequenceText": "Vous placez la dent sous votre oreiller, attendant avec impatience la visite de la petite souris, vous trouvez un euro le lendemain."
        },
        {
          "text": "La garder en souvenir",
          "consequences": { "karma": 3, bonheur: 2, possessions: { nom: "dent de lait", valeur: 1 } },
          consequenceImage: "https://previews.123rf.com/images/schan/schan1708/schan170800572/83398244-vieille-dent-d%C3%A9chir%C3%A9e-sur-un-fond-blanc.jpg",
          "consequenceText": "Vous décidez de conserver votre dent en souvenir, elle prend une sale gueule au bout de quelques annees."
        }
      ]
    }
    , {
      "nom": "Zizi tout dur",
      condition: { sex: 'M' },
      "text": "Votre zizi est tout raide ce matin. Que faites-vous ?",
      "options": [
        {
          "text": "Aller prendre une douche pour reduire la raideur",
          "consequences": { "social": 2, pervers: -10 },
          "consequenceText": "Ca passe au bout de 2 minutes sous l'eau froide. vous soufflez."
        },
        {
          "text": "Montrer ca a maman",
          "consequences": { "bonheur": 3, pervers: 3, social: 1 },
          "consequenceText": "Regarde maman, je peux faire l'helicoptere !"
          , consequenceImage: "https://el.phncdn.com/gif/24300801.gif"
        },
        {
          "text": "La toucher avec curiosité pendant quelques minutes",
          "consequences": { "pervers": 4, bonheur: 5 },
          "consequenceText": "Vous jouez avec votre zigounette. C'est rigolo et plutot agreable."
        },
        {
          "text": "La toucher avec curiosité pendant quelques minutes, puis frenetiquement jusqu'a ce que... ",
          "consequences": { "pervers": 5, bonheur: 10, social: -1 },
          consequenceImage: "https://el.phncdn.com/gif/44796771.gif",
          "consequenceText": "Vous avez maintenant la main toute poisseuse, c'est degueu. Mais qu'est-ce que c'etait bon"
        }
      ]
    }, {
      "nom": "La loulette dans la choupinette",
      condition: { sex: 'F' },
      "text": "Par accident votre sucette tombe dans votre petite culotte pendant que vous la remontiez",
      "options": [
        {
          "text": "Avoir le bon reflexe pour arreter le geste",
          "consequences": { "social": 2, pervers: -10, bonheur: -2 },
          "consequenceText": "Oui mais la culotte est toute poisseuse et ma sucette est pleine de fibres..  "
        },
        {
          "text": "Remonter la culotte",
          "consequenceText": "Ca chatouille bizarrement et c'est tout collant !",
          options: [
            {
              text: "L'enlever",
              "consequences": { "bonheur": 3, pervers: 7, social: -2 },
              "consequenceText": "Maintenant il va falloir tout laver, ca colle..."
            }, {
              text: "La remonter un peu plus",
              "consequenceText": "Vous remontez encore un peu la culotte, la sucette s'insinue dans votre choupinette"
              , options: [
                {
                  text: 'Mettre la main dans la culotte et glisser la sucette a l\'interieur',
                  "consequences": { "bonheur": 20, pervers: 10 },
                  consequenceImage: "https://78.media.tumblr.com/3221c0ea99c07d5587d324c3487490d9/tumblr_ozeuycM1u21wt5z4xo4_400.gif",
                  "consequenceText": "Vous ne vous rappelez plus de grand-chose quand vous vous reveillee allongee sur le carrelage des WC avec un batonnet collé a la choupinette et plein de sucre fondu entre les cuisses."

                }, {
                  text: 'Reprendre la sucette dans la bouche',
                  "consequences": { "bonheur": 8, pervers: 7, karma: -2 },
                  "consequenceText": "Le gout est bizarre, mais fascinant."
                  , consequenceImage: "https://loveporngifs.com/wp-content/uploads/2023/01/lollipop-tease_63d1cd6161b3d.gif"
                }
                , {

                  text: 'Mais qu\'est-ce qui me prend. Tout arreter.',
                  "consequences": { "bonheur": -8, pervers: -8, karma: -2 },
                  "consequenceText": "Rouge de honte, vous nettoyez votre forfait."
                }
              ]
            }

          ]
        },
        {
          "text": "La toucher avec curiosité pendant quelques minutes",
          "consequences": { "pervers": 4, bonheur: 10 },
          "consequenceText": "Vous jouez avec votre zigounette. C'est rigolo et plutot agreable."
        },
        {
          "text": "La toucher avec curiosité pendant quelques minutes, puis frenetiquement jusqu'a ce que... ",
          "consequences": { "pervers": 15, bonheur: 10, social: -1 },
          "consequenceText": "Vous avez maintenant la main toute poisseuse, c'est degueu. Mais qu'est-ce que c'etait bon"
        }
      ]
    }
    , { ...petitFrere }
  ]

  , 'enfance': [
    { ...petitFrere }
    , { ...petitFrereLubrique }
    , { ...petiteSoeurLubrique },

    {
      "nom": "Premier jour d'école",
      "text": "C'est votre premier jour d'école. Comment vous sentez-vous ?",
      "options": [
        {
          "text": "Excité",
          "consequences": { "bonheur": 2, "intelligent": 1, "pervers": 1 },
          consequenceImage: "https://i.gifer.com/4APL.gif",
          "consequenceText": "Vous êtes excité à l'idée de rencontrer de nouveaux amis et d'apprendre de nouvelles choses."
        },
        {
          "text": "Effrayé",
          "consequences": { "bonheur": -1, "social": -1, "violent": 2 },
          "consequenceText": "Vous avez les boules, c'est normal pour un premier jour",
          consequenceImage: "https://i.gifer.com/2d2C.gif"
        },
        {
          "text": "Indifférent",
          "consequences": { "social": -2, "violent": -1 },
          "consequenceText": "Vous êtes plutôt indifférent, vous préférant rester dans votre bulle."
        }
      ]
    }, {
      "nom": "La petite voisine",
      condition: { sex: 'M' },
      "text": "Une voisine de votre age vous donne rendez-vous dans la clairiere derriere le quartier.",
      "options": [
        {
          "text": "Ne pas y aller, cette fille est bizarre",
          "consequences": { "social": -2, pervers: -5, bonheur: 1, karma: -1 },
          "consequenceText": "Vos parents vous felicitent de votre prudence  "
        },
        {
          "text": "Y aller",
          "consequenceText": "Une fois seuls elle vous demande si vous voulez voir sa culotte",
          options: [
            {
              text: "Vous declinez poliment , on est un peu jeune pour ca, non ?",
              "consequences": { "bonheur": 3, pervers: -1, social: -1 },
              "consequenceText": "Elle vous traite d'andouille et va jouer au cochon pendu avec l'autre voisin."
            }, {
              text: "Vous acceptez febrilement",
              "consequenceText": "Elle vous montre sa culotte, et vous regarde en souriant"
              , options: [
                {
                  text: 'Toucher sa culotte',
                  "consequences": { "bonheur": 20, pervers: 10 },
                  "consequenceText": "C'est tout mou, c'est tout doux, c'est tout chaud."

                }, {
                  text: 'Lui montrer votre cul',
                  "consequences": { "bonheur": 8, pervers: 8, karma: -2, violent: 4 },
                  "consequenceText": "Ensuite elle vous montre le sien et vous rigolez bien."

                }
                , {

                  text: 'Tirer sur sa culotte.',
                  "consequenceText": "Vous observez sa choupinette toute glabre avec une legere odeur de pipi.",
                  options: [
                    {
                      text: "Lui dire que ca pue"

                      , "consequences": { "bonheur": -5, pervers: 8, karma: -5, violent: 1, sante: -1 },
                      "consequenceText": "Elle vous met une gifle et s'enfuit en vous insultant."
                    }, {
                      text: "Glisser votre langue dans la fente"

                      , "consequences": { "bonheur": 25, pervers: 28, karma: 10, violent: -6, diplomes: 'Cunnilinguiste' },
                      "consequenceText": "Vous venez de decouvrir votre fetiche pour la vie."
                      , consequenceImage: "https://el.phncdn.com/gif/41651421.gif"
                    }
                  ]
                }
              ]
            }

          ]
        }
      ]
    }

    , { ...journeePluvieuse }


  ]
  , 'adulescent': [
    { ...coupDeFilSurprise }
    , { ...voyageSpontane }
    , { ...journeePluvieuse }
    , { ...bitureInattendue }
    , { ...carnetSpecial }
    , { ...defiVelo }
    , { ...panneDeVoiture }

    , { ...petitFrereLubrique }
    , { ...petiteSoeurLubrique }
    , { ...saleToux }
  ]
  , 'adolescence': [
    { ...bitureInattendue }
    , { ...carnetSpecial }
    , { ...defiVelo }

    , { ...petitFrere }
    , { ...petitFrereLubrique }
    , { ...petiteSoeurLubrique }
    , {
      "nom": "Premier rendez-vous amoureux",
      "text": "Vous êtes invité(e) à votre premier rendez-vous amoureux. Comment vous préparez-vous ?",
      "options": [
        {
          "text": "Choisir une tenue spéciale",
          "consequences": { "bonheur": 3, "karma": 2, social: 3, pervers: 1 },
          "consequenceText": "Vous choisissez une tenue spéciale, augmentant votre bonheur et montrant votre côté charmant."
        },
        {
          "text": "Rester décontracté(e)",
          "consequences": { "bonheur": 2, social: -2, pervers: -2 },
          "consequenceText": "Vous décidez de rester décontracté(e), préservant votre bonheur malgré le trac."
        },
        {
          "text": "Y aller nu",
          "consequences": { "bonheur": 5, social: -2, karma: 2, pervers: 3 },
          "consequenceText": "Pourquoi pas au fond, vive le naturisme... Cela dit, elle n'a pas apprecié"
        }
      ]
    }


  ]
  , 'adulte': [
    { ...saleToux },
    { ...voyageSpontane },
    { ...panneDeVoiture },
    { ...bitureInattendue },
    {
      "nom": "Un nain cul nu",
      "text": "Soudain Un nain cul nu vous offre des fleurs...",
      consequenceImage: "https://alitools.io/en/showcase/image?url=https%3A%2F%2Fae01.alicdn.com%2Fkf%2FH0bb65c0e6b7c46c1a37aabbfaa2968bcK.jpg_480x480.jpg",
      "options": [
        {
          "text": "C'est quoi ce bordel..",
          "consequences": { "bonheur": -2, "social": -2, karma: 1, intelligent: -1, pervers: -2 },
          "consequenceText": "Ca devient n'importe quoi ce jeu."
        },
        {
          "text": "Ah pour une fois c'est presque chaste",
          "consequences": { "social": 1, karma: -1, bonheur: 2 },
          "consequenceText": "Tiens vous l'avez cherché, un autre nain cul nu",
          consequenceImage: "https://cdn5-images.motherlessmedia.com/images/386ABD6.gif"
        },
        {
          "text": "C'est l'effet magique d'impulse",
          "consequences": { "social": 5, karma: 10, bonheur: 5, intelligent: 2 },
          "consequenceText": "Seuls ceux de plus de 40 ans peuvent capter la ref. Bravo !"
        }
      ]
    }, {
      "nom": "Rencontre avec un ancien ami",
      "text": "Vous rencontrez par hasard un ancien ami que vous n'avez pas vu depuis des années. Comment réagissez-vous ?",
      "options": [
        {
          "text": "Joyeuse retrouvailles",
          "consequenceText": "Vous etes tres content de revoir votre ami",
          options: [
            {
              text: "Aller ensemble au strip club",
              "consequenceText": "La rencontre fut memorable, vous passez une excellente soiree, vous vous etes bien rincé l'oeil"
              , consequenceImage: "https://el.phncdn.com/gif/47021501.gif"
              , "consequences": { "social": 5, karma: 2, bonheur: 5 },
            }, {
              text: "Aller boire un coup chez moi",
              "consequenceText": "La rencontre fut memorable, vous passez une excellente soiree. "
              , consequenceImage: "https://www.mensjournal.com/.image/ar_4:3%2Cc_fill%2Ccs_srgb%2Cfl_progressive%2Cq_auto:good%2Cw_1200/MTk2MTM3NDI1MTMyMTM1NTY5/mixing-energy-drinks-with-alcohol-can-get-you-dangerously-wasted.jpg"
              , "consequences": { "social": 5, karma: 2, bonheur: 5 },
            }
          ]
        },
        {
          "text": "Échange de politesses",
          "consequences": { "social": 1, karma: -1, bonheur: -2 },
          "consequenceText": "Vous échangez poliment des politesses, préservant votre réserve mais c'est plus ca entre vous."
        },
        {
          "text": "Éviter la conversation",
          "consequences": { "social": -5, karma: -5 },
          "consequenceText": "Vous évitez la conversation, ressentant une gêne qui impacte légèrement vos relations sociales. Vous ne pensez pas revoir un jour cet ami"
        }
      ]
    },
    {
      nom: "l'autostoppeuse",
      condition: { sex: 'M' },
      "text": "Alors que vous rentriez chez vous apres le travail, vous prenez une auto-stoppeuse, elle est jolie, mais elle vous demande de la deposer dans la ville voisine a plus de 50km"
      , options: [
        {
          text: "Vous refusez, c'est trop loin"
          , consequences: { pervers: -3, bonheur: -1, social: 1, karma: -2 }
          , consequenceText: "Elle est un peu triste, mais vous remercie pour le bout de chemin"
        }
        , {
          text: "Vous lui demandez une compensation pour le temps et l'essence"
          , consequenceImage: "https://el.phncdn.com/gif/29892021.gif"
          , consequenceText: "Elle n'a pas d'argent, mais peut vous proposer autre chose"
          , consequences: { pervers: 3, social: 2, bonheur: 2 }
        }
      ]
    },
    {
      "nom": "Perdu dans une ville etrangere",
      condition: { sex: 'M' },
      "text": "Pour le travail vous vous retrouvez perdu dans cette ville inconnue. Une jeune femme vous aborde tandis que vous cherchez votre chemin",
      "options": [
        {
          "text": "La remballer, j'ai Google Maps, ca ira",
          "consequences": { "bonheur": -2, "social": -5, karma: -2, violent: 4 },
          "consequenceText": "Elle vous envoie chier."
        },
        {
          "text": "Essayer de la draguer, elle est mignonne.",
          "consequenceText": "Elle vous dit qu'avec elle c'est tout cuit, mais c'est 100 euros."
          , "options": [
            {
              "text": "La remballer, j'ai une tete a me taper des putes ?",
              "consequences": { "bonheur": -2, "social": -5, karma: -5, pervers: -5, violent: 2 },
              "consequenceText": "Elle vous envoie chier. Vous etiez pas son genre de toutes facons"
            },
            {
              "text": "Essayer de negocier a moitie prix.",
              "consequences": { "bonheur": -5, "social": -2, karma: -5, pervers: 2 },
              "consequenceText": "Elle vous envoie chier. Pauvre minable !"

            }
            , {
              "text": "Accepter, elle est vraiment mignonne.",
              "consequenceText": "Vous l'emmenez a l'hotel. OK Cheri, tu veux quoi ?"
              , "options": [
                {
                  "text": "Un missionnaire, c'est hygienique",
                  condition: { argent: 100 },
                  "consequences": { "bonheur": 5, pervers: 5, violent: -2, argent: -100 },
                  "consequenceText": "Vous ejaculez en 10 minutes malgré vos efforts, la pute vous remercie et s'en va."
                },
                {
                  "text": "Un 69, c'est mon truc.",
                  condition: { argent: 100 },
                  "consequences": { "bonheur": 15, karma: 5, pervers: 5, argent: -100, maladie: { 'mst': 0.2 } },
                  "consequenceText": "Sa chatte sent la savonnette mais elle suce relativement bien."

                },
                {
                  "text": "La sodomie, c'est possible ?",
                  condition: { argent: 150 },
                  "consequences": { "bonheur": 20, karma: -5, pervers: 10, argent: -150 },
                  "consequenceText": "Oui mais avec supplement. Son cul est bien serré, c'est un vrai plaisir."

                },
                {
                  "text": "Je prefere sans capote",
                  condition: { argent: 250 },
                  "consequences": { "bonheur": 5, karma: -15, pervers: 20, argent: -250, maladie: { 'mst': 0.7 }, enceinte: 0.2 },
                  "consequenceText": "C'est possible mais avec un petit supplement. Par contre l'ejac c'est pas a l'interieur"

                }
              ]
            }
          ]
        }
      ]
    }, {
      "nom": "Perdu dans une ville etrangere",
      condition: { sex: 'F' },
      "text": "Pour le travail vous vous retrouvez perdue dans cette ville inconnue. Un jeune homme vous aborde tandis que vous cherchez votre chemin",
      "options": [
        {
          "text": "Le remballer, j'ai Google Maps, ca ira",
          "consequences": { "bonheur": -2, "social": -5, karma: -2, violent: 4 },
          "consequenceText": "Il vous envoie chier."
        },
        {
          "text": "C'est sympa",
          "consequenceText": "Eh mademoiselle, vous avez un joli petit cul, vas-y paye ta schneck."
          , "options": [
            {
              "text": "Le remballer poliment ce petit con et foutre le camp",
              "consequences": { "bonheur": -2, "social": 1, karma: -2, pervers: -5, violent: 5 },
              "consequenceText": "Vas-y sale pute, tu meritais pas ma bite de toutes facons"
            },
            {
              "text": "Appeler a l'aide",
              "consequences": { "bonheur": 3, "social": 2, karma: -5, violent: -2 },
              "consequenceText": "Des passants vous approchent, mettant le jeune homme en fuite."

            }
            , {
              "text": "Accepter, on n'a qu'une vie.",
              "consequenceText": "Il vous traine dans une cave de la cité voisine ou 5 de ses amis vous attendent"
              , "options": [
                {
                  "text": "Un seul a la fois messieurs, et n'oubliez pas vos capotes",
                  "consequences": { "bonheur": 5, pervers: 8, violent: -6, sante: -1 },
                  "consequenceText": "Les 5 mecs vous passent dessus les uns apres les autres vous remerciant avant de repartir."
                },
                {
                  "text": "Euh.. j'ai changé d'avis",
                  consequenceImage: "https://el.phncdn.com/gif/37489531.gif",
                  "consequences": { "bonheur": -8, karma: -5, pervers: -5, argent: -100, maladie: { 'contusions': 0.9 }, enceinte: 0.2 },
                  "consequenceText": "Pas question de se defiler petite pute. Il vous gifle et vous viole, en prime ils vous delestent de votre porte-feuille"

                },
                {
                  "text": "J'ai toujours revé de faire un gang-bang",
                  consequenceImage: "https://el.phncdn.com/gif/42467061.gif",
                  "consequences": { "bonheur": 30, karma: -10, pervers: 20, argent: 150, enceinte: 0.4 },
                  "consequenceText": "Vous faites une orgie avec les 5 jeunes. Pour vous remercier ils vous donnent leur recette de deal du soir (150e)"

                },
                {
                  "text": "Vous pouvez faire ca avec douceur ?",
                  "consequences": { "bonheur": 15, karma: 10, pervers: 20, maladie: { 'mst': 0.5 }, enceinte: 0.2 },
                  "consequenceText": "La douceur n'est pas un terme connus de ces jeunes qui vous brutalisent, mais ils ont compris qu'ils devaient etre subtils et vous revelent a votre nature de soumise BDSM"
                  , consequenceImage: "https://el.phncdn.com/gif/40472611.gif"
                }
              ]
            }
          ]
        }
      ]
    }
    , {
      nom: "parent mort"
      , text: "Un deces dans la famille"
      , randomAction: {
        risque: 1
        , involvedPnj: 'Famille'
        , text: "$pnj.nom vient de mourir, ecrasé par un bus."
        , options: [
          {
            text: "Organiser les funerailles"
            , consequenceText: "Comment voulez-vous les organiser ?"
            , options: [
              {
                text: "Cremation (400)"
                , condition: { argent: 400 }
                , consequenceText: "Paix a son ame"
                , consequenceImage: "https://c8.alamy.com/compfr/2e03hj6/dresde-allemagne-29-decembre-2020-un-cercueil-se-deplace-dans-le-four-de-cremation-du-crematorium-dresden-tolkewitz-le-crematorium-de-dresde-a-atteint-la-limite-de-sa-capacite-en-raison-de-la-forte-mortalite-excessive-dans-la-pandemie-de-corona-et-depend-maintenant-de-l-aide-d-autres-crematoriums-credit-sebastian-kahnert-dpa-zentralbild-dpa-alamy-live-news-2e03hj6.jpg"
                , consequences: { karma: 5, argent: -400, bonheur: 1, social: 10, deces: true }
              }
              , {
                text: "Enterrement et parcelle au cimetierre"
                , condition: { argent: 4000 }
                , consequenceText: "Paix a son ame"
                , consequenceImage: "https://polefunerairepublic.com/wp-content/uploads/2022/02/inhumation-enterrement-pole-funeraire-public-1024x683.jpg"
                , consequences: { karma: 15, argent: -4000, bonheur: 5, social: 20, deces: true }
              }
              , {
                text: "Euh finalement on legue son corps a la science"
                , consequenceText: "Paix a son ame"
                , consequenceImage: "https://static.lpnt.fr/images/2023/05/15/24503979lpw-24508147-article-jpg_9520929_1250x625.jpg"
                , consequences: { karma: -10, bonheur: -5, social: 1, deces: true }
              }
            ]
          }, {
            text: "Me rendre a l'enterrement si je suis invité seulement"
            , chance: 0.2, chanceOn: 'empathie'
            , consequenceTextOK: "Ce fut sobre et elegant. Paix a son ame"
            , consequencesOK: { karma: -1, social: 5, bonheur: -7, deces: true }
            , consequenceTextNOK: "Vous n'avez pas ete invité, apparemment, vous etes restés en froid trop longtemps"
            , consequencesNOK: { karma: -6, social: -3, bonheur: -10, deces: true }
          }
          , {
            text: "Je m'en fous, je l'aimais pas"
            , consequenceText: "Paix a son ame quand meme ? "
            , consequences: { karma: -20, social: -10, deces: true }
          }
        ]
      }
    }

  ]
  , 'senior': [
    {
      nom: "GameOverBis"
      , text: "Un de vos vieux amis vient de mourir"
      , randomAction: {
        risque: 1
        , involvedPnj: "Ami"
        , text: "Un de vos vieux amis $pnj.nom vient de mourir"

        , options: [
          {
            text: "Je m'en fous, je le connaissais a peine"
            , consequenceText: "Vous preferez regarder France-Azerbaidjan a la TV, 2-0, c'etait pas terrible."
            , consequences: { bonheur: -4, social: -5, karma: -8 }
          }
          , {
            text: "Je m'y rends pour lui rendre hommage"
            , condition: { sex: "M" }
            , consequenceText: "Sa veuve est presente. Mais ne pleure pas car le defunt etait un coureur de jupons"
            , options: [
              {
                text: "Je lui presente mes condoleances et me retire pour eviter de me faire assimiler a lui"
                , consequenceText: "Elle les accepte et vous remercie"
                , consequences: { social: 5, karma: 7, bonheur: -1, violent: -2 }
              }, {
                text: "Je lui propose de rendre hommage au defunt"
                , consequenceText: "Elle accepte. Quelle meilleure maniere de lui rendre hommage a ce gros porc"
                , consequenceImage: "https://el.phncdn.com/gif/44081201.gif"
                , consequences: { bonheur: 5, karma: 4, social: 5, pervers: 5 }
              }
            ]
          }, {
            text: "Je m'y rends pour lui rendre hommage"
            , condition: { sex: "F" }
            , consequenceText: "Sa veuve est presente. Mais ne adresse pas la parole car le defunt etait un de vos anciens amants"
            , options: [
              {
                text: "Je lui presente mes condoleances et me retire pour eviter de me faire insulter"
                , consequenceText: "Elle les accepte froidement et vous remercie quand meme"
                , consequences: { social: 5, karma: 7, bonheur: -1, violent: -2 }
              }, {
                text: "Je lui propose d'expier pour le defunt"
                , consequenceText: "Elle accepte. Vous devenez son esclave sexuelle pendant une semaine. C'etyait plutot cool."
                , consequenceImage: "https://el.phncdn.com/gif/32122481.gif"
                , consequences: { bonheur: 5, karma: 4, social: 5, pervers: 5 }
              }
            ]
          }
        ]
      }
    },
    {
      nom: "Game over"
      , text: "Une brusque douleur a la poitrine vous saisit dans le bras gauche"
      , options: [
        {
          text: "Vous appelez une ambulance pour aller directement aux urgences"
          , condition: { argent: 190 }
          , consequenceText: "Vous venez de faire un AVC, heureusement, vous avez ete sauvé a temps."
          , consequences: { argent: -190, sante: 5, karma: 3, violent: -1 }
        }, {
          text: "Vous reprenez un shot de vodka, ca doit etre le manque"
          , consequenceText: "C'etait le verre de trop, vous faites un arret cardiaque."
          , consequences: { mort: "Intoxication alcoolique" }
        }, {
          text: "Je fais des exercices pour me soulager"
          , consequenceText: "Ca n'a fait qu'accelerer votre rythme cardiaque au moment ou il avait besoin de se calmer. Vous faites un AVC, vous etes mort"
          , consequences: { mort: "Crise cardiaque" }
        }
      ]
      , randomAction: {
        risque: 0.4
        , text: "Vous faites un AVC, vous avez juste le temps d'appeler les urgences. Une infirmiere arrive sur place"
        , options: [
          {
            text: "Sauvez-moi la vie, quoi qu'il en coute"
            , condition: { argent: 500 }
            , chance: 0.2, chanceOn: "karma"
            , consequenceTextOK: "Elle vous fait un massage cardiaque qui vous sauve la vie, vous l'avez echappé belle, dites meerci a votre karma"
            , consequencesOK: { sante: -2, bonheur: 2, karma: -10, argent: -500 }
            , consequenceTextNOK: "Elle vous fait un massage cardiaque qui ne suffit pas (votre karma etait moisi). Adios amigo"
            , consequencesNOK: { mort: "Arret cardiaque" }
          }
          , {
            text: "Je peux avoir une derniere gaterie avant de mourir ?"
            , consequenceText: "Bien sur allongez-vous laissez-moi faire"
            , consequences: { mort: "Arret cardiaque" }
            , consequenceImage: "https://el.phncdn.com/gif/1806871.gif"
          }
        ]
      }
    },
    {
      "nom": "Club de lecture pour seniors",
      "text": "Vous êtes invité à participer à un club de lecture pour seniors. Comment réagissez-vous ?",
      "options": [
        {
          "text": "Accepter l'invitation",
          "consequences": { "social": 2, "bonheur": 3 },
          "consequenceText": "Vous acceptez l'invitation, rejoignant le club de lecture et partageant des moments enrichissants avec d'autres seniors, renforçant vos liens sociaux, votre intelligence et votre bonheur."
        },
        {
          "text": "Décliner poliment",
          "consequences": { "social": -2 },
          "consequenceText": "Vous déclinez poliment l'invitation, préférant consacrer votre temps à d'autres activités. Cela n'affecte que légèrement vos relations sociales."
        },
        {
          "text": "Proposer une alternative",
          "consequenceText": "Quelle alternative allez-vous proposer.",
          "options": [
            {
              "text": "Club de tarot",
              "consequences": { "social": 8, "bonheur": 5 },
              "consequenceText": "Le tarot c'est plus sympa"
            },
            {
              "text": "Club de randonnée",
              "consequences": { "social": 2, sante: 5, karma: 1 },
              "consequenceText": "Vous connaissez 2 ou 3 sentiers plutot sympa en plus..."
            },
            {
              "text": "Club de tantrisme",
              "consequences": { "pervers": 3, sante: 1, karma: -2 },
              "consequenceText": "Vous allez pouvoir tringler la greluche qui s'est presenté sans comprendre ce que c'etait. Bon plan.",
              consequenceImage: "https://thumb-p4.xhcdn.com/a/HOkHjez-s4aCnVY8RgGB6Q/000/314/073/034_1000.gif"
            }
          ]
        }
      ]
    }
    , {
      "nom": "Cours d'informatique pour seniors",
      "text": "Une opportunité de participer à un cours d'informatique adapté aux seniors se présente. Comment réagissez-vous ?",
      "options": [
        {
          "text": "Assister au cours en essayant d'apprendre des choses",
          "consequences": { "intelligence": 2, "bonheur": 2, social: 2 },
          "consequenceText": "Vous décidez de vous inscrire au cours d'informatique, améliorant ainsi votre intelligence et ressentant une joie accrue en découvrant de nouvelles technologies."
        },
        {
          "text": "Assister au cours pour profiter du wifi gratuit",
          "consequences": { "social": 2, "bonheur": 2, pervers: 2 },
          "consequenceText": "Vous pouvez enfin telecharger cette serie de 3To."
        },
        {
          "text": "Assister au cours pour foutre le boxon",
          "consequences": { "bonheur": 5, karma: -5, violent: 4 },
          "consequenceText": "Vous décidez d;installer un virus sur disquette sur tous les ordis du cours, qu'est-ce qu'on rigole."
        }
      ]
    }
    , {...soubrette}
  ]
  // par type de pnj

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