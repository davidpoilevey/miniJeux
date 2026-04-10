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
import React from "react";
import {tempsEnsemble, planCul} from './BaseCommonEvents';
const rencard={
  nom: 'Rencard',
  text: 'Vous demandez a $pnj.nom de sortir avec vous. Si vous avez deja une petite ami, elle risque de mal le prendre',
  chance: 0.4, chanceOn: "empathie"
  , consequenceTextOK: "$pnj.nom est ravi.e , vous lui plaisez aussi. Il/Elle devient votre petite amie."
  , consequencesOK: { ami: 11, bonheur: 10, social: 10, karma: 5 }
  , consequenceTextNOK: "$pnj.nom vous remercie de votre interet, mais ce n'est pas reciproque."
  , consequencesNOK: { bonheur: -3, social: -1, relation:-10 }
};
export const insulteGratuite={
  nom: 'Insulte gratuite',
  text: 'Lachez-vous, quelle insulte pour ce mec ?',
  options: [{
    text: 'Pauvre naze',
    consequences: { relation: -20, karma: -1 },
    consequenceText: 'Il vous a fait un doigt et est parti.'
  }
    , {
    text: 'Bachibouzouk',
    consequences: { relation: 2, karma: 2 },
    consequenceText: 'Il a reconnu la reference a Hergé et vous fait un sourire.'
    , consequenceImage:"https://reconnaitre-et-apprivoiser-ses-emotions.fr/wp-content/uploads/2018/06/Visuel-la-col%C3%A8re.jpg"
  }, {
    text: 'Ta mère suce des bites en enfer',

    consequenceText: 'Il est choqué et tente de vous mettre un coup de poing.'
    , options: [
      {
        text: "Esquiver, les gros balourds, ca s'evite... "
        , consequenceText: "Il ne reussit pas a vous faire mal, vous fuyez a toutes jambes."
        , consequences: { karma: 1, violent: -4, bonheur: -4,relation:-15  }
      }, {
        text: "Attaquer, c'est la meilleure defense "
        , consequenceText: "Le gros balourd est aussi rugueux. Vous en prenez plein la tronche"
        , consequences: { karma: -2, violent: 5, bonheur: -4, sante:-4 ,relation:-40 }
      }, {
        text: "S'excuser platement "
        , consequenceText: "Il vous demande vous agenouiller pour prouver votre servitude."
        ,  options: [
          {
            text: "Vous refusez, qu'il aille se faire voir "
            , consequenceText: "Il vous envoie un coup de poing a l'estomac qui vous met KO."
            , consequences: { karma: 1, violent: -4, bonheur: -4,relation:-30 }
          }, {
            text: "Vous vous agenouillez devant lui"
            , consequenceText: "Il s'approche et sort sa bite devant votre nez"
            , options:[
              {
                text:'Vous le sucez'
                , consequenceText:"il sourit en vous ejaculant dans la bouche... Avale bien tout ma petit pute. Il vous kiffe desormais"
                , consequences:{karma:-10, pervers:12, maladies:{mst:0.1}, bonheur:2, relation:10}
                , consequenceImage:"https://el.phncdn.com/gif/18450491.gif"
              }, {
                text:'Vous ne bougez pas'
                , consequenceText:"il sourit et vous pisse dans la bouche... Avale bien tout ma petit pute. Il vous fait un coin d'oeil, vous lui plaisez."
                , consequences:{karma:-20, pervers:18, bonheur:-10, social:-20, relation:-2}
                , consequenceImage:"https://el.phncdn.com/gif/40579101.gif"
              }
            ]
          }
        ]
      }
    ]
  }
  ]
}

export const BaseDeventPersonnages = {
  'pnj': [
    {...planCul},
    {...rencard}
    ,{
      nom: 'Complimenter',
      text: 'Vous dites a $pnj.nom a quel point il vous eblouit par son charisme',
      chance: 0.5, chanceOn: "empathie"
      , consequenceTextOK: "$pnj.nom est ravi ,et vous retourne le compliment."
      , consequencesOK: {relation:10, bonheur: 3, social: 2, karma: 2 }
      , consequenceTextNOK: "$pnj.nom apprecie moderement le compliment, mais ne vous saute pas dessus, c'est deja ca."
      , consequencesNOK: { bonheur: 1, social: 1, relation:5,karma:2 }
      , randomAction:{
        risque:0.3
        , text:"C'est trop gentil, je suis desolee mais j'ai un probleme de nymphomanie compulsive quand on me fait des compliments trop exagérés, vous ne devriez pas continuer"
        , options:[
          {
            text:"Desolé, je ne savais pas, c'est vrai que vous n'etes pas si jolie"
,        consequences: { relation: 2, karma: 2,social:2,pervers:-20 },
        consequenceText: "Elle vous remercie d'avoir tenu compte de son probleme medical."
          },{
            text:"Mais comment une femme aussi merveilleusement belle peut avoir le moindre probleme"
            , consequenceText:"Vous l'avez cherché, elle vous regarde avec envie et vous fait une proposition que vous ne pouvez pas refuser"
            , consequences:{bonheur:10,social:2,karma:3,pervers:3,relation:20}
            , consequenceImage:"https://el.phncdn.com/gif/43846921.gif"
          }
        ]
      }
    }, 
    {...insulteGratuite}
  ]
  , 'ami': [
    {...tempsEnsemble},
    {...planCul},
    {...rencard},
    {
      nom: 'Jouer ensemble',
      text: 'Salut poto, on joue ou quoi ?',
      condition: { enfance: true ,adolescent:true,adulescent:true},
      consequenceText: 'Vous avez passé du bon temps entre amis',
      consequences: {
        relation: 10, social: 2, bonheur: 5,karma:2
      }
      , randomAction: {
        risque: 0.3
        ,condition: { adolescent:true,adulescent:true}
        , text: 'Pendant votre jeu votre ami vous confie soudain que son père vient lui toucher les fesses le soir'
        , options: [{
          text: 'Vous allez en parler au directeur de l\'ecole',
          consequences: { relation: -20, karma: 5, bonheur: -1 },
          consequenceText: 'Le directeur a fait lancer une enquete. Le père est inculpé, votre ami ne vient plus a l\'ecole'
        }, {
          text: 'Douter de lui, c\'est un mytho pour faire son interessant'
          , chance: 0.5, chanceOn: 'violent'
          , consequenceTextOK: 'Votre ami avoue que c\'est exagéré, mais il vous en veut de votre manque de confiance.'
          , consequencesOK: { bonheur: -2, relation: -10 }
          , consequenceTextNOK: 'Il vous insulte et vous frappe. C\'est Votre (ex)ami desormais'
          , consequencesNOK: { bonheur: -10, ami: -1, violent: 2, sante: -5 }
        }, {
          text: 'Lui demander des details'
          , consequenceText: 'Il vous explique que son pere met son doigt dans son trou du cul'
          , options: [
            {
              text: 'Compatir et garder son secret'
              , chance: 0.5, chanceOn: 'intelligent'
              , consequenceTextOK: 'Votre ami apprecie votre loyauté. Vous n\'en reparlerez jamais plus'
              , consequencesOK: { bonheur: 10, relation: 20, karma: 4 }
              , consequenceTextNOK: 'Vous ne parvenez pas a garder ce secret, votre ami l\'apprend et vous en veut'
              , consequencesNOK: { bonheur: -10, relation: -15, karma: -4 }
            }
            , {
              text: 'Demander plus de details'
              , consequenceText: 'Votre ami se penche et vous montre son trou du cul beant, un peu de sperme luisant sur les bords.\nIl vous regarde et vous dit: Si ca te tente d\'essayer'
              , options: [
                {
                  text: 'Comme tu dois etre traumatisé'
                  , consequenceText: 'Votre ami fond en larme et se fait sa psycho-therapie perso a vos frais.'
                  , consequences: {
                    relation: 50, bonheur: 5, karma: 20
                  }
                }, {
                  text: 'Le sodomiser'
                  , consequenceText: 'Vous enculez votre ami qui semble apprecier, le debut d\'une autre histoire ?.'
                  , consequences: {
                    relation: 50, bonheur: 25, karma: -20, pervers: 20
                  }
                  , consequenceImage:"https://el.phncdn.com/gif/42663952.gif"
                }
              ]
            }
          ]
        }
        ]
      }


    }
    , {
      "nom": "Sortir ensemble",
      "text": "Ouais salut mec, tu fais quoi samedi soir ?",
      "condition": { "adolescence": true,adulescent:true, "adulte": true },
      "consequenceText": "Vous passez une soirée memorable avec votre ami. Impossible de le battre au jeu des shots",
      consequenceImage:"https://i.chzbgr.com/full/5965502720/h34571FF3/just-one-more",
      "consequences": {
        "relation": 10,
        "social": 10,
        "bonheur": 10, sante:-2, maladie:{alcoolisme:0.1}
      },
      "randomAction": {
        "risque": 0.3,
        "text": "Dans la soiree $pnj.nom vous propose des champignons magiques",
        "options": [
          {
            "text": "Vous refusez, ce n'est pas votre truc",
            "consequences": {
              "relation": 2,
              "karma": 6,
              social:12,
              "bonheur": -2,pervers:-7,violent:-2
            },
            "consequenceText": "Vous avez bien eu raison, votre ami a fini par vomir en nageant dans la pelouse a cause des mouettes qui parlaient de lui... Toute une histoire, je vous raconterai un autre jour"
          },
          {
            "text": "Vous acceptez, YOLO !",
            "chance": 0.6,
            "chanceOn": "sante",
            "consequenceTextOK": "L'hallu de votre vie, soiree inoubliable et pourtant il y a des bribes qui vous echappent",
            consequenceImage:"https://www.opnminded.com/wp-content/uploads/2018/09/julien9.gif",
            "consequencesOK": {
              "bonheur": 30,
              "relation": 20,
              "karma": 10, social:10
            },
            "consequenceTextNOK": "Vous prenez du plaisir, mais vous finissez sur un bad trip et vos amis doivent vous emmener aux urgences pour un lavage d'estomac"
            ,
            "consequencesNOK": {
              "bonheur": -10,
              "sante": -15,
              "relation": -1, karma:-2
            }
          }
        ]
      }
    } ,
    {
      nom:"Reviser ensemble",
      "text": "On s'y met ensemble, on avancera plus vite",
      "condition": { "adolescence": true,adulescent:true},
      "consequenceText": "Vous avez revisé avec votre ami. Ce fut tres profitable",
      "consequences": {
        "relation": 8,
        "social": 3,
        "intelligent": 2
      },
      randomAction:{
        risque:0.2
        , text:"Vos revisions tournent a la drague mutuelle, les sous-entendus fusent"
        , options:[
          {
            text:"Embrasser et peloter"
            , consequenceText:"Vous passez l'apres-midi a vous becoter et plus si affinites, ca a pas beaucoup revisé..."
            , consequences:{bonheur:6,pervers:2,social:5,karma:2,relation:15}
            , consequenceImage:"https://el.phncdn.com/gif/41176531.gif"
          },{
            text:"Reprendre les revisions"
            , consequenceText:"C'est vrai quoi on baise deja assez par ailleurs !"
            , consequences:{karma:-1,social:-2,pervers:-6, relation:1,intelligent:2}
          }
        ]
      }
    }
    ,{
      "nom": "Création artistique commune",
      "text": "Pourquoi on ecrirait pas notre propre musique ou video ?",
      "condition": { "adolescence": true,adulescent:true, "adulte": true },
      "consequenceText": "Vous avez partagé une expérience artistique mémorable avec votre ami.",
      "consequences": {
        "relation": 8,
        "social": 3,
        "bonheur": 6
      },
      "randomAction": {
        "risque": 0.3,
        "text": "Pendant que vous travaillez sur votre projet, vous captez votre en train de voler de l'argent dans votre porte-monnaie.",
        "options": [
          {
            "text": "Le convaincre de rendre l'argent et s'excuser",
            "consequences": {
              "relation": 15,
              "karma": 6,
              "bonheur": 2
            },
            "consequenceText": "Votre ami suit votre conseil, retourne l'argent et s'excuse. Quelle magnanimité !."
          },
          {
            "text": "Le traiter de connard",
            "chance": 0.6,
            "chanceOn": "violent",
            "consequenceTextOK": "Votre ami vous insulte en retour et vous explique qu'il est pauvre.",
            "consequencesOK": {
              "bonheur": -5,
              "relation": -20,
              "karma": -5
            },
            "consequenceTextNOK": "Le ton monte et vous vous bagarrez. 3 points de suture chacun. Vous perdez un ami"
            ,
            "consequencesNOK": {
              "bonheur": -10,
              "sante": -15,
              "ami": -1
            }
          }
        ]
      }
    }

  ]
  , 'petitAmi':[
    {...tempsEnsemble},
    {
      nom:"Rompre",
      condition:{epoux:false}
      , text:"Il faut qu'on parle"
      , consequenceText:"Vous decidez de rompre avec votre petit.e ami.e, "
      , consequences:{bonheur:-10,social:-8,violent:8,relation:-50,ami:-11}
    }, {
      nom:"Divorcer",
      condition:{epoux:true}
      , text:"Il faut qu'on parle"
      , consequenceText:"Vous decidez de divorcer avec votre epoux.se, on va dire que ca se passe bien parce que j'ai la flemme de coder plus "
      , consequences:{bonheur:-10,social:-8,violent:8,mariage:false}
    },
    {
      nom: 'Epouser',
      condition:{epoux:false,enfance:false,adolescence:false,adulescent:true,adulte:true,senior:true},
      text: 'Vous demandez sa main a $pnj.nom ',
      options:[
{
  text:"Acheter une bague en diamant et faire un voyage de noces a Tahiti (20000 boules)"
  ,condition:{argent:20000}
  ,chance: 0.4, chanceOn: "empathie"
  , consequenceTextOK: "$pnj.nom est ravi.e , vous vous mariez"
  , consequencesOK: { mariage: true, bonheur: 10, relation:20, social: 15, karma: 10,argent:-20000 }
  , consequenceTextNOK: "$pnj.nom pense que ce n'est pas le bon moment. "
  , consequencesNOK: { bonheur: -10, social: -5 ,relation:-5 }
},
{
  text:"Acheter une bague en or plaqué et faire un voyage de noces a Cahors (2000 boules)"
  ,condition:{argent:2000}
  ,chance: 0.5
  , consequenceTextOK: "$pnj.nom est ravi.e , vous vous mariez"
  , consequencesOK: { mariage: true, bonheur: 5, social: 5,relation:20,  karma: 2,argent:-2000 }
  , consequenceTextNOK: "$pnj.nom pense que ce n'est pas le bon moment. Et en plus votre bague etait naze"
  , consequencesNOK: { bonheur: -10, social: -5 ,relation:-5 }
},
{
  text:"Pas de bague et on fera le voyage de noce l'annee prochaine, promis"
  ,chance: 0.2
  , consequenceTextOK: "$pnj.nom est ravi.e , vous vous mariez"
  , consequencesOK: { mariage: true, bonheur: 2, social: 2,relation:10,  karma: -8 }
  , consequenceTextNOK: "$pnj.nom vous prend la tete parce qu'elle voulait un beau mariage a l'eglise et tout et tout... Va chier connard "
  , consequencesNOK: { bonheur: -10, social: -10 ,relation:-50 }
}
      ]
     
    },
    {
      nom:"Embrasser"
      , text:"Quel genre de baiser voulez-vous faire avec $pnj.nom"
      , options:[
        {
          text:"Bécot"
          , consequenceText:"Mignon et innocent, ca passe toujours"
          , consequences:{social:2, bonheur:2, relation:5, karma:3}
        },
        {
          text:"Langoureux"
          , consequenceText:"Ahh.. Le French kiss, c'est indemodable et tout le monde aime ca"
          , consequences:{social:2, bonheur:5, relation:10}
          , consequenceImage:"https://el.phncdn.com/gif/39152551.gif"
        },
        {
          text:"Avec une main qui glisse dans la culotte"
          , chance:0.5, chanceOn:"pervers"
          , consequenceTextOK:"C'est un peu cavalier, mais ca lui plait bien, bien joué..."
          , consequencesOK:{social:1, bonheur:8, relation:10, karma:-2}
          , consequenceTextNOK:"Tu te crois ou ducon ! Vous etes vertement remis a votre place. Un bisou ca doit etre chaste"
          , consequencesNOK:{social:-1, bonheur:-2, relation:-26, karma:-2}
        },
        {
          text:"Dans l'oreille"
          , consequenceText:"Ca lui plait beaucoup, elle ferme les yeux"
          , options:[
            {
              text:"Aller plus loin et embrasser le cou"
              , consequenceText:"Elle ronronne, c'est le moment d'attaquer"
              , options:[
                {
                  text:"Embrasser entre les seins"
                  , consequenceText:"Elle retire son chemisier, c'est gagné"
                  , options:[
                    {
                      text:"Passer sous la jupe"
                      , consequenceText:"Les connaisseurs savent ou chercher le bonheur..."
                      , consequences:{social:8, bonheur:10, relation:20}
                      , consequenceImage:"https://xgx.mobi/preview/pussy-kiss-only-close-up.jpg"
                    }
                    , {
                      text:"La prendre a la hussarde"
                      , consequenceText:"Vous montrez votre virilité qui est fortement appreciee."
                      , consequences:{social:5, bonheur:5, relation:10, karma:-4, violent:10}
                    }
                  ]
                }
                , {
                  text:"Embrasser le nez"
                  , consequenceText:"Votre copine rigole et vous tapote le nez. Non c'est degueu ca "
                  , consequences:{social:2, bonheur:2, relation:2, karma:2}
                }
              ]
            }
            , {
              text:"Finir par un bisou sur le front"
              , consequenceText:"Vous montrez votre affection qui est fortement appreciee."
              , consequences:{social:3, bonheur:8, relation:8, karma:4}
            }
          ]
        }
      ]
    }, {
      nom:"Coucher ensemble"
     , text:"Qund la libido vous prend..."
     , condition:{adolescence:false,adulescent:true,adulte:true,senior:true}
     , options:[
      {
        text:'Un quickie dans les toilettes du McDo'
        , consequenceText:"Le frisson de l'acte dans un lieu public, la sauvagerie de la passion... C'est bon ca !"
        , consequences:{relation:4, bonheur:3,social:5, argent:-20, pervers:4, karma:-1, enceinte: 0.2}
        , consequenceImage:"https://porngif.co/wp-content/uploads/2023/03/112966-shower-quickie.gif"
      },{
        text:'Un missionnaire dans le lit'
        , consequenceText:"Sage et avisé, on évite les positions inconfortables, vous passez une bonne soiree."
        , consequences:{relation:6, bonheur:2, karma:2,pervers:1,violent:-5, enceinte: 0.2}
      },{
        text:'Soyons fous'
        , consequenceText:"On va faire un truc special, ca te dit chérie ? "
        , options:[
          {
            text:"5 positions tirées au hasard dans le Kamasutra"
            , consequenceText:"Vous combinez Histoire et Sexualité epanouie, apprendre en ejaculant, voila un beau programme."
            , consequences:{relation:10, bonheur:8,social:4, pervers:2, karma:5, enceinte: 0.4}
          },{
            text:"Une sodomie"
            , chance:0.5, chanceOn:"violent"
            , consequenceTextOK:"Elle vous laisse l'enculer sauvagement, apparemment elle adore ca, bon a savoir une fois par mois ."
            , consequenceImage:"https://el.phncdn.com/gif/36566641.gif"
            , consequencesOK:{relation:20, bonheur:20,sante:-1, violent:5, pervers:5}
            , consequenceTextNOK:"Elle refuse, mais trop tard vous etes chauffé a blanc, vous la retournez et vous lui montrez qui est le patron. Elle va prendre cher"
            , consequencesNOK:{relation:-10, bonheur:13,social:-5, karma:-5, pervers:3, violent:10}
          },{
            text:"Un plan a 3 ... Mais avec un autre homme vous dit-elle"
           , consequenceText:"Une soiree inoubliable sur bien des points et qui ne s'est pas terminee de la maniere dont vous pensiez au depart...\n(Au moins elle a avalé a la fin.. les 2)"
            , consequenceImage:"https://el.phncdn.com/gif/452681.gif"
          , consequences:{karma:10, pervers:12,relation:30, social:8,bonheur:20,violent:2}

          }
         ]
      }
     ]
    }
    , {
      nom:"Sortez ensemble"
     , text:"Ce soir vous sortez avec votre petite amie... Vous l'emmenez ou ?"

     ,condition:{epoux:false}
     , options:[
      {
        text:'Au cinéma (40 euros)',condition:{argent:40}
        , consequenceText:"Un bon Marvel et un seau de popcorn, que demande le peuple"
        , consequences:{relation:4, bonheur:3,social:5, argent:-40, intelligent:-1}
      },{
        text:'Dans une brasserie classe (50e)',condition:{argent:50}
        , consequenceText:"Vous degustez des variétés de bière originales, vous passez une bonne soiree."
        , consequences:{relation:10, bonheur:5,social:10, argent:-50}
      },{
        text:'Faire un feu dans la foret'
        , consequenceText:"Quelle soiree douce au coin d'un feu de bois improvisé, un baiser langoureux est de mise..."
        , options:[
          {
            text:"Oh oui je l'embrasse romantiquement, ca fera des bons souvenirs"
            , consequenceText:"Vous passez une excellente soirée, votre amie a des etoiles dans les yeux."
            , consequences:{relation:20, bonheur:10,social:10, pervers:1, karma:10}
          },{
            text:"Oh oui et meme plus, j'en profite pour la peloter"
            , chance:0.5, chanceOn:"pervers"
            , consequenceTextOK:"Elle vous laisse l'enlacer chaleureusement, desormais entre vous, c'est Love ForEver."
            , consequencesOK:{relation:20, bonheur:10,social:5, karma:5, pervers:1}
            , consequenceTextNOK:"Elle vous tape sur les main : \nArrete t'es con, je crois qu'il y a un animal derriere nous"
            , consequencesNOK:{relation:-5, bonheur:2,social:5, karma:-5}
          },{
            text:"Oh oui carrement, elle va meme passer a la casserole"
            , consequenceText:""
            , chance:0.5, chanceOn:"pervers"
            , consequenceTextOK:"La soiree est suffisamment romantique. Elle vous laisse aller plus loin, desormais vous connaissez la forme et le gout de sa vulve"
            , consequencesOK:{relation:20, bonheur:20,social:5, karma:15, pervers:5, enceinte: 0.2}
            , consequenceTextNOK:"Elle vous plante pres du feu quand elle comprend vos intentions, pas question, en plus elle a ses ragnagnas"
            , consequencesNOK:{relation:-25, bonheur:-3,social:5, karma:-5}

          }
         ]
      }
     ]
    }
  ]
  , 'boss': [
    {
      nom:"Demander une augmentation"
      , text:"Parce que je le vaux bien, et puis l'inflation est terrible"
      , chance:0.2,chanceOn:'intelligent'
      , consequenceTextNOK:"Ahh, le budget est serré, on a pas fait de chiffres, desolé"
      , consequencesNOK:{bonheur:-2,karma:-5,promotion:-2}
      , consequenceTextOK:"OK mais il va falloir travailler double"
      , consequencesOK:{bonheur:-10,karma:5,promotion:10,sante:-10}
    }
  ]
  , 'famille': [

    {...tempsEnsemble},
    {
      nom: 'Calin',
      text: 'Vous cherchez un gros calin',
      options: [{
        text: 'Un petit hug',
        consequences: { relation: 10, bonheur: 2 },
        consequenceText: 'Un calin en passant, ca fait toujours du bien.'
      }
        , {
        text: 'Un gros calin de 20 secondes',
        consequences: { relation: 20, bonheur: 10 },
        consequenceText: 'C\'est la bonne duree pour un calin, vous vous sentez revigoré.'
      }, {
        text: 'Un long calin de 3 minutes',
        consequences: { relation: 5, bonheur: 5 },
        consequenceText: 'C\'est un peu genant, non ?.'
      }, {
        condition:{famille:'Enfant'},
        text: 'Un gros calin'
        , consequenceText:"Un bon papa prend soin de sa petite fille cherie..., vous faites un calin de quel type",
        options:[
          {text:"De pere responsable"
        , consequenceText:"Un bisous et au lit"
      , consequences:{bonheur:6,karma:6,social:4,pervers:-5,violent:-5,relation:5}}
      , {
        text:"De pere inquiet"
        , consequenceText:"Fais voir si tu t'es bien lavee la choupinette"
        , consequenceImage:"https://el.phncdn.com/gif/44203841.gif"
        , consequences:{karma:1,social:2,sante:1,pervers:3,relation:-1}
      }, {
        text:"De pere inquietant"
        , consequenceText:"Attend on va rajouter un peu de creme de papa pour tes brulures"
        , consequenceImage:"https://el.phncdn.com/gif/23180682.gif"
        , consequences:{karma:-3,social:-2,pervers:6,relation:-4}
      }
        ]
      }
      ]
    }, 
   {
      "nom": "Demander de l'argent à ses parents",
      "text": "Eh, j'ai besoin d'argent pour acheter quelque chose. Tu pourrais m'en donner s'teup ?",
      "condition": { "enfance": true, adolescence: true, adulescent:true },
      chance:0.5,chanceOn:'relation',
      "consequenceTextOK": "Vous avez obtenu 500 euros de vos parents.",
      "consequencesOK": {
        "argent": 500,
        "relation": 2,
        "bonheur": 3
      },
      "consequenceTextNOK": "Vos parents sont un peu fauchés, vous n'aurez que 50 euros",
      "consequencesNOK": {
        "argent": 50,
        "relation":-1,
        "bonheur": 1
      },
      "randomAction": {
        "risque": 0.2,
        "text": "Cependant, vos parents découvrent que vous avez menti sur l'utilisation de l'argent.",
        "options": [
          {
            "text": "S'excuser et promettre de ne plus mentir",
            "consequences": {
              "relation": 10,
              "karma": -2,
              social: 4,
              "bonheur": 2
            },
            "consequenceText": "Vos parents acceptent vos excuses, mais ils restent méfiants."
          },
          {
            "text": "Trouver un autre baratin pour les embrouiller encore plus",
            "chance": 0.3,
            "chanceOn": "intelligent",
            "consequenceTextOK": "Vous réussissez à convaincre vos parents, mais votre relation avec eux est tendue.",
            "consequencesOK": {
              "relation": -5,
              "karma": -5,
              "bonheur": 1
            },
            "consequenceTextNOK": "Vos parents découvrent la vérité et perdent confiance en vous."
            ,
            "consequencesNOK": {
              "relation": -15,
              "karma": -10,
              "bonheur": -6
              , social: -4
            }
          }
        ]
      }
    }

  ]
  , 'ennemi': []
  , 'pute': [
    {
      nom: 'Calin',
      text: 'Tu veux monter chéri ? 50 la pipe, 100 l\'amour',
      options: [{
        text: 'Une petite pipe (50)',
        condition:{argent:50},
        consequences: { karma: -1, bonheur: 2, argent: -50 ,relation:1},
        consequenceText: 'Un vrai talent de suceuse.'
      }
        , {
        text: 'L\'amour (100)',
        condition:{argent:100},
        consequences: { karma: -3, bonheur: 5, argent: -100, relation:3, maladies: { mst: 0.2 } },
        consequenceText: 'Vous la besognez en position d\'etoile de mer... Et finissez en 3 minutes'
      }, {
        text: 'Je voulais juste un calin en vrai',
        consequences: { karma: 2, bonheur: 2 ,relation:3},
        consequenceText: 'La fille est gentille et vous fait un gros calin gratuit.'
      }, {
        text: 'Allez, un 69 ! (50)',
        condition:{argent:50},
        consequences: { karma: 6, bonheur: 8, argent:-50,relation:6},
        consequenceText: "Trop cool, vous lui devorez la chatte avec delectation."
        , consequenceImage:'https://ftopx.com/pic/1600x1200/202005/5eba48a4bd947.jpg' 
      }, {
        text: 'Surprenez-moi (100)',
        condition:{argent:100},
        consequences: { karma: 10, bonheur: 10, argent:-100, sante:-1,relation:10, maladies: { mst: 0.2 }},
        consequenceText: "Il se trouve que j'ai un péché mignon, vous acceptez de m'enculer avec votre langue ?"
        , consequenceImage:'https://ftopx.com/pic/1920x1080/201105/19131.jpg' 
      }
      ]
    }
    , {
      nom:"Remplacer"
      , condition:{sex:'F', adulte:true,adulescent:true}
      , text:"Natalia a besoin d'aller au petit coin mais ne veut pas perdre sa place, elle vous demande si vous pouvez la lui garder"
      , options:[
        {
          text:"Toujours prete a rendre service"
          , consequenceText:"Pendant son absence un automobiliste s'arrete a votre hauteur et vous demande combien c'est"
          , options:[
            {
              text:"Desolee, il y a meprise, je ne travaille pas.."
              , consequenceText:"Va chier petasse, dit-il en repartant en trombe"
              , consequences:{karma:1,social:1,bonheur:-1,pervers:-2}
            },
            {
              text:"Euh... 100 ?"
              , consequenceText:"L'homme vous embarque et vous emmene dans un petit bois et vous fais votre affaire derriere la voiture. Il vous ramene juste a temps pour rendre son emplacement a Natalia qui vous remercie de votre serieux"
              , consequences:{bonheur:2,maladie:{mst:0.1}, social:3,karma:5,pervers:7,argent:100, enceinte: 0.1}
              , consequenceImage:"https://el.phncdn.com/gif/25410711.gif"
            }
          ]
        }
        , {
          text:"Et puis quoi encore"
          , consequenceText:"Vous refusez, laissant la pauvre Natalia partir aux toilettes... Elle va se faire piquer sa place et rapportera moins ce soir, son mac lui foutra une branlee a cause de vous, vivez avec ca maintenant."
          , consequences:{karma:-10,bonheur:-1,social:-1,relation:-10,pervers:-4}
        }
      ]
    }
  ]
  , 'routier': [
    {nom:"Faire de l'auto-stop"
    , text:"Vous levez le pouce, c'est Robert le routier qui s'arrete pour vous.. Ou qui veut aller ?"
    , condition:{sex:'F'}
    , options:[
      {
        text:"Emmenez-moi au bout de la terre"
        , consequenceText:"Robert vous embarque et vous partez joyeusement"
        , options:[
          {
            text:"Vous changez d'avis au bout d'une heure..."
            , consequenceText:"Grumpff, Robert vous gueule dessus et vous jette du camion en claquant sa portiere. Payez 20 euros pour rentrer en bus"
            , consequences:{bonheur:-1,karma:-3,social:-1,violent:1,sante:-1,argent:-20}
          }, {
            text:"Vous changez d'avis au bout de 800 bornes..."
            , consequenceText:"Robert vous demande si vous voulez qu'ils vous depose la ? (On est a Hambourg semble-t-il)"
            , options:[
              {
                text:"Oui pas de soucis, je prendrai un train"
                , consequenceText:"Robert vous lache a Hambourg, tout le monde parle allemand, vous galerez a trouver la gare, le train est hors de prix"
                , consequences:{argent:-290,social:2,bonheur:-4,karma:-2}
              }
              ,  {
                text:"Non tu me ramenes Robert !"
                , consequenceText:"Robert grogne, mais accepte en echange de quelques faveurs pendant les pauses (1 fois toutes les 2 heures)"
                , consequences:{social:2,bonheur:4,karma:2,pervers:2, enceinte: 0.2}
                , consequenceImage:"https://el.phncdn.com/gif/41325531.gif"
              }
            ]
          }, {
            text:"Vous changez d'avis au bout de deux jours..."
            , consequenceText:"Robert rigole, trop tard poulette, dans une heure on arrive en Roumanie, je t'ai deja vendue comme esclave sexuelle... Vous mettrez 2 semaines a rentrer"
            , consequences:{social:12,bonheur:-10,karma:-3,sante:-5,pervers:11,violent:7,intelligent:-1,argent:-500, enceinte: 0.5}
            , consequenceImage:"https://el.phncdn.com/gif/43735861.gif"
          }
        ]
      },{
        text:"Euh ... Je cherche la gare "
        , consequenceText:"Grumpff, a droite après le feu, dit-il en claquant sa portiere"
        , consequences:{bonheur:-1,karma:1,social:1,violent:-1}
      }
    ]
    }
  ]
  , 'docteur': [
    {nom:"Consulter le docteur"
    , text:"Aux heures d'ouverture seulement"
    , consequenceText:"Bonjour docteur..."
    , options:[
      {
        text:"Je me sens pas bien, vous pouvez me soigner ?"
        , consequenceText:"Bien sur ca fera 30 euros"
        , consequences:{soins:true, argent:-30, sante:10}
      },{
        text:"Euh non j'ai oublié ma carte vitale"
        , consequenceText:"Bien sur ca fera 30 euros"
        , consequences:{bonheur:1,sante:1}
      },{
        text:"Je voudrai avorter"
        , condition:{enceinte:true}
        , consequenceText:"Bien sur ca fera 130 euros. Vous n'etes plus enceinte"
        , consequences:{bonheur:-10,sante:-1, karma:-7, social:-4, enceinte:false, argent:-130}
      }
    ]
    , randomAction:{
      risque:0.8
      , text:"Le docteur vous examine et vous dit qu'il va falloir passer des examens complementaires, vous avez une grosseur inquietante"
      , condition:{sex:"M"}
      , options:[
        {
          text:"Je dois aller aux urgences ?"
          , consequenceText:"Oui ca a l'air grave. Aux urgences on vous diagnotique une infection generalisee, vous devez rester sous perf une semaine"
          , consequences:{sante:-2,bonheur:-5,social:-2,violent:-1,soins:true, argent:-500}
        }
        , {
          text:"Vous pouvez m'examiner ici ?"
          , consequenceText:"Bien sur allongez-vous et dites 33, je sais coment reduire cette grosseur. Ca fera 30 euros"
          , consequences:{sante:1,bonheur:1,pervers:5, argent:-30,soins:true,  relation:10}
          , consequenceImage:"https://evocdn.net/bh/pornpics/dbbc/7ce3/7d0d/8b33/553e/e885/9ca0/e2ff/1.jpg"
        }
      ]
    }
    }
  ]
  , 'guedro': [
    {
      nom: 'Regarder bizarrement',
      text: 'Vous fixez un type un peu louche, assis par terre, celui-ci vous regarde en retour et vous demande une petite piece',
      options: [{
        text: 'Vous lui donnez 1 euro',
        consequences: { karma: 1, bonheur: 1, argent: -1 },
        consequenceText: "Il vous jette un merci blasé et essaye de capter le regard d'un autre passant."
      }
        , {
        text: 'Vous lui donnez 10 euro',
        consequences: { karma: 3, bonheur: 2, argent: -10, social:3,pervers:-2 },
        consequenceText: 'Il vous sourit et vous remercie chaleureusement. Merci mon prince'
      }, {
        text: "Vous l'envoyez chier, qu'il aille se chercher un boulot !",
        consequences: { karma: -2, bonheur: 1, social:-2, violent:1 },
        consequenceText: 'Il vous jette une godasse moisie a la tete et vous insulte, mieux vaut le laisser...'
      }, {
        text: 'Vous lui demandez ou il se fournit',
        consequenceText: "Pourquoi, t'en veux ?",
        options: [{
          text: "Non c'etait juste pour savoir..",
          consequences: { karma: 1, social: 1, violent:-2 },
          consequenceText: 'Vous vous defilez et le laisser tranquille.'
        }
          , {
          text: 'File-moi une barrette',
          consequences: { argent: -50, bonheur: 10, karma:-2,possessions:{nom:"barrette de shit", valeur:50,image:"https://e-liquide-cbd.info/1707-large_default/resine-le-supreme-50-nature-cbd.jpg"} },
          consequenceText: 'Il vous echange une barrette de bon shit contre un billet de 50 euros, bon deal.'
        }, {
          text: 'Je veux juste aller porter ce renseignement a la gendarmerie',
          consequences: { karma: 5, bonheur: -5, social:2, sante:-2 },
          consequenceImage:'https://media1.tenor.com/m/MlO6fCZoUjoAAAAC/frank-gallagher-middle-finger.gif',
          consequenceText: 'Il vous insulte copieusement, se leve et vous frappe a la tete... Quel con !'
        }
        ]
      }
      ]
    }
  ]
  , 'flic': [
    {
      nom: 'Se constituer prisonnier',
      text: 'Vous abordez le flic et demandez a etre entendu car vous vez commis un crime. Le flic vous demande lequel',
      options: [{
        text: "J'ai craché par terre",
        consequences: { karma: -1, bonheur: -1, argent: -90 },
        consequenceText: "Il soupire et vous mets une amende de 90 euros, allez, circulez maintenant."
      }
        , {
        text: "J'ai péché mon pere",
        consequences: { karma: 3, bonheur: 2, argent: -10, social:3,pervers:-2 },
        consequenceText: "Vous vous trompez, je ne suis pas pretre, allez curculez"
      }, {
        text: "J'ai fraudé le fisc",
        consequences: { karma: -5, bonheur: 2, social:2, violent:1,argent:-1000 },
        consequenceText: 'Il prend au serieux cet aveu et mène son enquete, elle aboutira a une amende de 1000 euros.'
      }, {
        text: "J'ai commis un délit honteux",
        consequenceText: "Le flic s'approche de vous.. Ah bon, quel genre de délit ?",
        options: [{
          text: "J'ai revé d'une societe plus juste et je me suis revellee dans ce monde de merde",
          consequences: { karma: -2, social: 5, violent:2 },
          consequenceText: 'On va se calmer la petite dame, prenez une camomille et circulez'
        }
          , {
          text: "Atteinte a la pudeur",
          consequences: { bonheur: 5, karma:5, social:2, pervers:2 },
          consequenceText: "Pour le prouver, vous soulevez votre jupette, le flic vous mate un instant et vous dit de circuler",
          consequenceImage:"https://el.phncdn.com/gif/35406092.gif"
        }, {
          text: "Je ne parlerai qu'en presence de mon avocat",
          consequences: { karma: 5, bonheur: 5, social:5, pervers:8 , enceinte:0.1},
          consequenceImage:'https://el.phncdn.com/gif/1222721.gif',
          consequenceText: 'Il vous ramene a la gendarmerie pour vous faire passer un interrogatoire plus poussé'
        }
        ]
      }
      ]
    }
  ]

}

/*
activite a copier:

{
            nom:'titre de la dialog',
            icon:'iconMui
            text:'explications',
            condition:ConditionObj(agePeriode:true , travail:'metier' (un certain metier))
            options:[{
                text:'1er choix',
                consequences :[],
                consequenceText:'resultats de ce choix',
                options :[]
            }
            , randomAction:{risque, involvedPnj, ...options}}
            , 
            ]
        }


*/