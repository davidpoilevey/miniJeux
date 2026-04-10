// image doit etre la key dans imageSources

import { soundManager } from "../../rpg/sons/SoundManager";

const common_nodes = {
  miauler: {
    url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3SH2yF7dF4lzd4ZwsTmGByymPekWYBBYLTA&s',
    image: 'chat',
    text: ["Miaou", "Tu peux aussi miauler a tout instant en tapant M", "Ca peut servir a debloquer certaines situations"]
    , effect: ({ soundManager, quests }) => {
      soundManager.play('miaou');
    },
    next: "fin"
  },
  inutile: {
    url: 'https://st2.depositphotos.com/2704315/7961/v/450/depositphotos_79614244-stock-illustration-vector-man-facepalm-comic-illustration.jpg',
    text: ["Ca ne sert absolument a rien", "Ressaye encore jeune padawan"]
    , next: "fin"
  },
  nimp: {
    url: 'https://www.memecenter.fr/files/2014/11/futurama-fry-tes-con-ou-juste-stupide.jpg',
    text: ["Ca ne sert absolument a rien", "Et en plus c'est debile"]
    , next: "fin"
  },
  aie: {
    url: 'https://c8.alamy.com/compit/2hd4jdk/aouch-fumetto-suono-pop-stile-punteggiato-vettore-nube-halftone-ouch-pop-art-fumetto-fumetto-illustrazione-bolla-2hd4jdk.jpg',
    text: ["Ca fait mal !", "- Tu perds de la forme -"]
    , effect: (context) => {
 context.takeDamage(Math.round(Math.random()*50))
    }
    , next: "fin"
  },
  degueu: {
    image: 'interdit',
    url: 'https://sophie-altruiste.com/wp-content/uploads/2017/09/te%CC%81le%CC%81chargement-3.jpeg',
    text: ["Ah nooonnn", "C'est degueu !", "Je vais vomir..."]
    , effect: (context) => {

      context.CATManager.vomito(Math.round(Math.random() * 100));
    }
    , next: "fin"
  },
  fin: { end: true }
}
export const dialogues = {
  pnjExemple: {
    start: "intro",
    nodes: {
      intro: {
        image: 'chat',
        text: [
          "Bonjour, petit aventurier...",
          "Tu cherches la clé du temple sacré ?"
        ],
        options: [
          { text: "Oui.", next: "donneCle" },
          { text: "Non.", next: "auRevoir" }
        ]
      },
      donneCle: {
        text: ["Tiens, prends-la. Mais choisis bien ton chemin..."],
        image: 'vieuxSage',
        effect: ({ addItem }) => addItem("clé_du_temple"),
        next: "fin"
      },
      auRevoir: {
        text: ["Alors reviens quand tu seras prêt."],
        image: 'vieuxSage',
        next: "fin"
      },
      fin: {
        end: true
      }
    }
  },
  queteEscalier: {
    start: "intro",
    nodes: {
      intro: {
        image: "info",
        url: "https://cdn.shopify.com/s/files/1/0480/0456/3108/files/Chat_est_anormalement_assoife_dois_je_consulter_un_veterinaire_1024x1024.jpg?v=1663485607",
        text: [
          "🌪️ La Quête de l’Escalier commence.",
          "*Ezio fixe les marches avec terreur.*",
          "Le vertige le paralyse. Ses moustaches frémissent...",
          "Il a **soif**, mais ne peut descendre.",
          "Il faut trouver de l’eau. Et du courage."
        ],
        next: "quete"
      },

      quete: {
        image: "chat",
        text: [
          "*La salle de bain.*",
          "C'est le dernier secours.",
          "J'entends Maman, elle m'en donnera "
        ],
        effect: ({ quests, CATManager }) => {
          quests?.startQuest("escalier");
          CATManager.disableDialog('queteEscalier');

        },
        next: "fin"
      },


      fin: {
        text: ["L'aventure ne fait que commencer... 😼"],
        end: true
      }
    }
  }
  ,
  porteSalleDeBain: {
    start: "intro",
    nodes: {
      ...common_nodes,
      intro: {
        image: 'ouhla',
        text: [
          "C'est fermé...",
          "Mais on entend maman a l'interieur"
        ],
        options: [
          { text: "Miauler", next: "miauler" },
          {
            text: "Miauler avec un megaphone", next: "miaulerMega", condition: ({ hasItem }) => {
              return hasItem('megaphone');
            }
          },
          { text: "Revenir plus tard.", next: "fin" }
        ]

      },
      miauler: {
        image: 'chat',
        short: true,
        text: ["Miaou"]
        , effect: ({ soundManager, quests }) => {
          quests?.notifyDialogue("porteSalleDeBain");
          soundManager.play('miaou');
        },
        next: "caMarchepas"
      },
      miaulerMega: {
        image: 'ouhla',
        short: true,
        text: ["Putain de bordel de Miaou"]
        , effect: ({ soundManager, quests, hasItem, addItem, CATManager }) => {

          soundManager.play('miaouMega');
          if (!hasItem('cleSalleDeBain')) {
            addItem('cleSalleDeBain');
            quests.advanceQuest('escalier', 2);
            CATManager.disableDialog('porteSalleDeBain');
          }
        },
        next: "fin"
      },
      caMarchepas: {
        image: 'interdit',
        text: ["Ca marcher pas, c'est pas assez fort... il faudrait un megaphone"]
        , next: "fin"
      },
      fin: { end: true }
    }
  },
  pnj: {
    start: "intro",
    nodes: {
      intro: {
        text: [
          "Bonjour, petit aventurier...",
          "Pret a passer a la grosse map ?"
        ],
        image: 'vieuxSage',
        next: "transfer",

      },
      transfer: {
        text: ["Tournicoti tournicota"],
        image: 'vieuxSage',
        effect: ({ moveToZone }) => moveToZone("vallee", { x: 10, y: 1 }),
        next: "fin"
      },
      fin: {
        text: ["Bonne chance."],
        image: 'vieuxSage',
        end: true
      }
    }
  },
  parLaFenetre: {
    start: "regard",
    nodes: {
      ...common_nodes,
      regard: {
        image: 'chat',
        url: 'https://goodflair.com/app/uploads/2025/01/cat-looks-to-the-windows.jpg',
        text: [
          "*Le soleil chauffe les vitres...*",
          "*Tu observes les oiseaux qui dansent dans le ciel.*",
          "*Ton muret préféré brille au loin, baigné de lumière.*"
        ],
        next: "soupir"
      },

      soupir: {
        image: 'info',
        url: 'https://goodflair.com/app/uploads/2025/01/cat-looks-to-the-windows.jpg',
        text: [
          "*Tu pousses un petit miaulement triste...*",
          "\"Pourquoi suis-je prisonnier dans ce monde de bipèdes ?\"",
          "\"Un jour... je retrouverai la chaleur des tuiles, la liberté du vent...\""
        ],
        next: "fin"
      }
      , miauled: {
        image: 'interdit',
        url: 'https://cdn.wamiz.fr/cdn-cgi/image/format=auto,quality=80,width=1200,height=1200,fit=cover/article/main-picture/chat-fenetre-674db43b7fee9.jpg',
        text: [
          "*Pas la peine de gueuler René*",
          "\"C'est pas en miaulant plus fort que tu pourras sortir ?\"",
          "\"De toutes facons, on est bien trop haut pour que tu sautes\""
        ],
        next: "fin"
      }
    }
  },
  armeChatonPrez: {
    start: "locked",
    nodes: {
      ...common_nodes,
      locked: {
        image: "info",
        text: [
          "* Les voila ! Les griffes supremes ! *",
          "*...L'arme qui me permettra de venir a bout de Sale Matou.*",
          "-(Barre d'action pour ramasser)-"
        ],
        short: true,
        next: "fin"
      }
    }
  },
  tutoLevel: {
    start: "intro",
    nodes: {
      ...common_nodes,
      intro: {
        image: "info",
        text: [
          "Quand tu changes de niveau, ta barre de forme de remplit "
          , "et le maximum augmente. ",
          "Continue de progresser pour resister plus longtemps",
          "-(Dors sur des coussins pour recharger ta forme)-"
        ],
        short: true,
        next: "fin"
      }
    }
  },
  vasistas: {
    start: "locked",
    nodes: {
      ...common_nodes,
      locked: {
        url: 'https://omavinyle.com/wp-content/uploads/2021/05/VASISTAS3.jpg',
        image: "info",
        text: [
          "*On ne passe par ici*",
          "* Qu'avec l'acces au jardin *",
        ],
        next: "fin"
      }
    }
  },
  porteFermee: {
    start: "locked",
    nodes: {
      ...common_nodes,
      locked: {
        image: "info",
        text: [
          "*Tu tires doucement avec la patte...*",
          "*... Mais rien ne bouge.*",
          "La porte est **fermée**. Solidement.",
          "\"Il me faudrait peut-être... quelque chose ?\""
        ],
        next: "fin"
      }
    }
  },
  tutoDechirable: {
    start: "explication",
    nodes: {
      ...common_nodes,
      explication: {
        text: ["Cette porte est toujours ouverte heureusement"
          , "Il y a du bric-a-brac au fond", "Mais ce n'est pas accessible"
        ]
        , image: 'info'
        , next: "gratte"

      },
      gratte: {
        text: ["Ces murs autour du coffre sont faits de vieux papiers"
          , "Ca ne resistera pas a mes griffes"
          , "** Utilise Espace (ou E) pour faire une action** ", "** sur la case devant toi **"
        ]
        , image: 'info'
        , effect: ({ CATManager }) => {
          CATManager.disableDialog('tutoDechirable')
        }
        , next: "fin"
      }
    }

  },

  tutoActionnable: {
    start: "explication",
    nodes: {
      ...common_nodes,
      explication: {
        text: ["Tu peux actionner certains objets"
          , "Utilise E ou la barre d'Espace"
        ]
        , image: 'info', short: true
        , next: "gratte"

      },
      gratte: {
        text: ["Apres, libre a toi d'assumer tes choix"
          , "Bonne chance"
          , "(dernier conseil, parle a l'araignee au fond des WC)"
        ]
        , image: 'info'
        , effect: ({ CATManager }) => {
          CATManager.disableDialog('tutoActionnable')
        }
        , next: "fin"
      }
    }

  },
  porteParent: {
    start: "explication",
    nodes: {
      explication: {
        text: ['La fenetre est fermee', "Peut-etre que si on gratte a la porte ?", "Touche E ou Espace"]
        , url: "https://www.madura.com/cdn/shop/collections/Madura-Montmorency-J1-0465_FA.jpg?v=1698058804&width=2500"
        , next: "gratte"
      },
      gratte: {
        image: 'chat',
        short: true,
        text: ["Scrrrrchhhhh", "Scrrhhhhh"]
        , effect: methods => {
          methods.addItem('puissanceDuMiaou');
          methods.soundManager.play('slash');
        }
        , next: "fin"
      },
      fin: {
        end: true
      }
    }
  },
  croqsTuto: {
    start: "explication",
    nodes: {
      explication: {
        url: 'https://blog-media.croqlavie.fr/wp-content/uploads/2021/03/meilleure-croquette-pour-chat-800x406.png',
        text: ['Des croquettes trainent parfois dans la maison', "Peut-etre que si on les mange ?", "Touche E ou Espace"]
        , image: "info"
        , next: "fin"
      },
      fin: {
        end: true
      }
    }
  },
  sieste: {
    start: "explication",
    nodes: {
      explication: {
        url: 'https://chattisfait.com/cdn/shop/files/coussinchat-canape-bleu.jpg?v=1737635497',
        text: ['On peut dormir , la ?', "Peut-etre que si on se couche ?", "Touche E ou Espace"]
        , image: "info"
        , next: "gratte"
      },
      gratte: {
        short: true,
        text: ["Rrrzzzzzz", "Rrrzzzzzz"]
        , effect: methods => {
          methods.soundManager.play('ronfle');
          methods.addPdv(2);
        }
        , next: "fin"
      },
      fin: {
        text: ["Bonne chance."],
        image: 'vieuxSage',
        end: true
      }
    }
  },

  coffre1: {
    start: "intro",
    nodes: {
      intro: {
        text: ["Une boite mysterieuse", "Que contient-elle ?"]
        , image: 'system'

        , next: "donneBle"
      }
      , donneBle: {
        name: "Du pognon et la cle Or forcement",
        text: ["Vous avez recu de l'argent"]
        , image: 'system',
        short: true,
        effect: ({ addCroqs, addItem, hasItem }) => {
          const amount = Math.floor(Math.random() * 10) + 1;
          addCroqs(amount);
          soundManager.play('coffre');
          if (!hasItem('cle_or'))
            addItem('cle_or');
        },
        next: "fin"
      }
      , fin: {
        end: true
      }
    }
  }
  , attentionChaud: {
    start: "intro",
    nodes: {
      ...common_nodes,

      intro: {
        image: 'ouhla',
        url: 'https://cherry.img.pmdstatic.net/fit/https.3A.2F.2Fimg.2Eohmymag.2Ecom.2Fs3.2Ffromm.2F1280.2Fcuisine.2Fdefault_2019-11-18_01904cb4-5d68-4d9d-9e47-1c73457f69aa.2Ejpeg/1200x675/quality/80/eviter-un-depart-de-feu-en-cuisine.jpg',
        short: true,
        text: [
          "Fais gaffe petit chat",
          "Tu vas te bruler !."
        ]
        , effect: ({ takeDamage, soundManager, quests }) => {
          takeDamage(12);
          soundManager.play('fire')
        },
        next: "fin"
      }
    }
  }
  , missionMarathon: {
    start: "intro",
    nodes: {
      ...common_nodes,

      intro: {
        url: 'https://www.3suisses.fr/blog/wp-content/uploads/2021/12/bien-choisir-son-linge-de-maison.jpg',
        text: [
          "Une armoire bien rangée",
          "Ca, c'est une mission pour moi"
        ]
        , next: 'startMission'
      },
      startMission: {
        text: ["Decouvrir le fonctionnement des Quetes tu devras", "Pour commencer par celle-la"
          , "Patouner a l'exces tu feras"
        ]
        , effect: ({ quests }) => {
          quests.startQuest('missionMarathon');
        }
        , next: "fin"
      }
      , miauled: {
        text: ["Ca patoune, ca patoune"]
        , image: "chat"
        ,
        short: true,
        url: "https://www.santeplusmag.com/wp-content/uploads/Que-signifie-laction-de-patouner-pour-un-chat001-1200x628.jpg"
        , next: "fin"
        , effect: ({ quests, soundManager }) => {
          soundManager.play('ronfle');
          const currQuete = quests.activeQuests['missionMarathon'];
          if (currQuete?.completed)
            return;
          if (currQuete != null) {

            quests.notifyDialogue('missionMarathon');
          }
          if (quests.isStepCompleted(5))
            quests.completeQuest('missionMarathon');
          else
            quests.advanceQuest('missionMarathon');
        }
      }
    }
  }
  , porteWC: {
    start: "intro",
    nodes: {
      ...common_nodes,

      intro: {
        image: 'insecte',
        text: [
          "Il y a un peu de lumiere derriere la porte",
          "Tu entends un petit appel", "Au secours  !!"
        ]
        , options: [
          {
            text: "Donner du PQ", next: "pq", condition: ({ hasItem, soundManager, quests }) => {
              return hasItem('PQ');
            }
          }
          , { text: "Faire la moue", next: "inutile" }
          , { text: "Inspecter", next: "appeler" }
        ]
      }
      , appeler: {
        image: 'insecte',
        text: ["Tu te demandes qui est a l'interieur", "vu l'odeur, c'est pas papa", "Oh la, ca pue la mort"]
        , effect: ({ takeDamage }) => {
          takeDamage(7);
        }
        , options: [
          { text: "Je vomis ", next: "vomis" }
          , { text: "Je marque le territoire", next: "nimp" },
          { text: "Y a quelqu'un ?", next: "appelerDetails" }
        ]
      }
      , vomis: {
        url: 'https://c8.alamy.com/compfr/km39tj/chat-malade-vomir-la-nourriture-km39tj.jpg',
        image: 'interdit',
        short: true,
        effect:({CATManager})=>{
          soundManager.play('vomito2');
          CATManager.vomito(100);
        },
        text: ["Faut pas cliquer sur n'importe quoi"
        ], next: "fin"
      }
      , appelerDetails: {
        url: 'https://www.moncointoilettes.fr/wp-content/uploads/geberit/2023/04/shutterstock_1686611320-1.jpg',
        image: 'insecte',
        short: true,
        text: ["J'ai besoin de PQ.. il y en a dans l'antichambre, vite ca presse",
          "- Tu peux ramasser certains objets avec la touche Action (E ou Espace) -"
        ], next: "fin"
      }
      , pq: {
        url: 'https://i0.wp.com/apprendre-les-bonnes-manieres.com/wp-content/uploads/2016/04/wc-cabinet-toilette-porte-ouverte-ferm%C3%A9-nadine-de-rothschil-mani%C3%A8re-%C3%A9tiquette-politesse-couple-vie-fermer-la-porte-conversation-pet-bruit-odeur-porte-ouverte-amour.jpg?ssl=1',
        image: 'insecte',
        short: true,
        text: ["Merci !", "Entre, j'ai desodorisé"]
        , effect: ({ addItem, hasItem, CATManager }) => {
          if (!hasItem('cleWC'))
            addItem('cleWC');
          CATManager.disableDialog('porteWC')
        }
        , next: "fin"
      }
    }
  }
  , frigo: {
    start: "intro",
    nodes: {
      ...common_nodes,

      intro: {
        url: 'https://img.leboncoin.fr/api/v1/lbcpb1/images/41/36/d1/4136d1735493505fdceb182628b8193fb2907751.jpg?rule=ad-large',
        text: [
          "Le frigo ronronne bruyamment...",
          "Il semble fermé, mais une fente sur le côté attire ton attention."
        ],
        options: [
          {
            text: "Insérer la tapette à mouche",
            condition: ({ hasItem }) => hasItem("tapette_A_Mouche"),
            next: "insertion"
          },
          { text: "Fouiller autour", next: "rien" },
          {
            text: "Parler au frigo", next: "detailMission",
            condition: ({ quests }) => quests.hasStarted("mysterePlacard")
          },
          { text: "Lécher la poignée", next: "degueu" },
          { text: "Partir", next: "fin" }
        ]
      },
      detailMission: {
        image: 'robot',
        effect:({quests})=>quests.notifyDialogue('frigo'),
        text: [
         
          "Y a un truc qui me gene.",
          "Trouve quelque chose pour debloquer ca",
          "qqch de fin et long et souple"
        ],
        next: "fin"
      },
      insertion: {
        image: 'robot',
        text: [
          "Tu insères la tapette dans la fente...",
          "Un *clic* se fait entendre.",
          "Un petit tiroir s’ouvre : à l’intérieur,un code mysterieux !"
          , "** 4852 **"
        ],
        next: "ouvertureFrigo"
      },
      ouvertureFrigo: {
        url: 'https://img-4.linternaute.com/zKub1ZZ0xEPFPAvdbQGwr_cG06w=/1000x/smart/8a8fa28596174a6e81766f4928294c4d/ccmcms-linternaute/24192106.jpg',
        text: [
          "Merci petit chat, en recompense, je m'ouvre pour toi",
          "*Le frigo s'ouvre en grand.",
          "Tu recuperes Du jus de thon ! ", "Et la cle de la chambre de Rodolphe.."
        ],
        effect: ({ addItem, addCroqs, soundManager }) => {
          addItem("cleRodolphe");
          addCroqs(20);
          soundManager.play('miam');
        },
        next: "fin"
      },
      rien: {
        short: true,
        text: [
          "Rien d’utile par ici...",

        ],
        next: "fin"
      },


      fin: { end: true }
    }
  },
  coffreDuPlacard: {
    start: "ouverture",
    nodes: {
      ouverture: {
        image: "coffre",
        text: [
          "*Tu ouvres lentement le vieux placard...*",
          "*Un grincement sinistre résonne dans la cuisine.*",
          "Au fond du coffre, deux objets scintillent sous une fine couche de poussière..."
        ],
        next: "revelation"
      },

      revelation: {
        image: "cle",
        url:'https://www.concept-usine.com/cdn/shop/articles/Grand-salon-design.jpg?v=1639580334',
        text: [
          "**La clé du salon**.",
          "**La clé de la chatière de la cave**.",
          " ",
          "*Les choses sérieuses peuvent enfin commencer...*"
        ],
        effect: ({ addItem, quests }) => {
          addItem("cleSalon");
          quests.notifyDialogue('coffreDuPlacard');
          addItem("autorisationDescenteCave");
        },
        next: "fin"
      },

      fin: {
        text: ["*Tu sens ton destin félin basculer...*"],
        end: true
      }
    }
  },
  coleoptereSacre: {
    start: "observe",
    nodes: {
      ...common_nodes,

      observe: {
        image: "insecte",
        url: "https://achat-fourmis.fr/wp-content/uploads/2024/02/fourmiliere.jpg",
        text: [
          "*Une pierre plate. Des fourmis en silence.*",
          "*Juste... de l’ordre.*"
        ],
        options: [
          {
            text: "Je veux voir le Coléoptère Sacré",
            next: "reponseFourmis",
            condition: ({ quests }) => quests.isAboveStep("SaleMatou", 4)
          },
          {
            text: "J'ai vu Sale matou'",
            next: "onsenfout",
            condition: ({ quests }) => quests.isAboveStep("SaleMatou", 2)
          },
          {
            text: "Je connais le rat Shaman",
            next: "onsenfout",
            condition: ({ quests }) => quests.isAboveStep("SaleMatou", 4)
          },
          {
            text: "Je connais Copain le gros lourdaud",
            next: "onsenfout",
            condition: ({ quests }) => quests.hasStarted("SaleMatou")
          },
          {
            text: "Je connais  ZzzzigZzzzag le bourdon debile",
            next: "onsenfout",
            condition: ({ hasItem }) => !hasItem("bourdonVaincu")
          },

          { text: "Manger une fourmi", next: "aie" },
          { text: "Et si je pissais dessus", next: "nimp" },

          { text: "Partir", next: "fin" }
        ]
      },

      onsenfout: {
        image: "insecte",
        url: "https://achat-fourmis.fr/wp-content/uploads/2024/02/fourmiliere.jpg",
        short: true,
        text: [
          "*On s'en fout, c'est qu'un connard.*"
        ],
        next: "observe"
      },

      reponseFourmis: {
        image: "insecte",
        url: "https://nature.ca/wp-content/uploads/2022/08/Blog_Japanese_Beetle-scaled.jpg",
        text: [
          "*Le silence se fait.*",
          "**« Le Coléoptère Sacré sort de sa cachette. »**",
          "**« Si tu es venu... c’est pour apprendre. »**"
        ],
        options: [

          { text: "Je veux vaincre Sale Matou", next: "nego" ,  condition: ({ hasItem }) => hasItem("armeChaton")},
        {
            text: "Le rat t'envoie te faire foutre",
            next: "retourAuRat",
            condition: ({ hasItem }) => !hasItem("preuve_du_coleo")
          },
          {
            text: "J’ai vaincu ZzzzigZzzzag le bourdon.",
            next: "coleoBan",
            condition: ({ hasItem }) => hasItem("bourdonVaincu")
          },
          { text: "Je suis juste curieux", next: "curieux" }
        ]
      },
      nego: {
        image: "insecte",
       url: "https://nature.ca/wp-content/uploads/2022/08/Blog_Japanese_Beetle-scaled.jpg",
         text: [
          "* La colere est mauvaise conseillere *",
          "* Prouve d'abord ta valeur *",
         
        ],
        effect: ({ addItem }) => {
         addItem('preuve_du_coleo')
        },
        next: "entrainement"
      },
      retourAuRat: {
        image: "insecte",
        url: "https://luc-bodin.fr/wp-content/uploads/2023/04/Benediction-explication-scaled-e1681198989977.jpeg",
        text: [
          "* La colere est mauvaise conseillere *",
          "* Dis-lui que je le pardonne *",
         
        ],
        effect: ({ addItem }) => {
         addItem('preuve_du_coleo')
        },
        next: "fin"
      },
      coleoBan: {
        image: "insecte",
        url: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Sacred_beetle_Egyptian_art.jpg",
        text: [
          "**« Quoi ? Horrible personnage »**",
          "**« Le bourdon etait mon ami »**",
          "** Hors de ma vue ! (Il lance un sort contre toi)...**"
        ],
        effect: ({  }) => {
        soundManager.play('fire');

        },
        next: "coleoBan2"
      },
      coleoBan2: {
             text: [
          "**« Quoi ? Horrible personnage »**"        ],
        effect: ({ moveToZone }) => {
          moveToZone("etage", { x: 8, y: 9 });

        },
        next: "fin"
      },

      curieux: {
        image: "insecte",
        url: "https://nature.ca/wp-content/uploads/2022/08/Blog_Japanese_Beetle-scaled.jpg",
        text: [
          "**« La curiosité ne suffit pas. »**"
        ],
        next: "reponseFourmis"
      },

      entrainement: {
        image: "insecte",
        text: [
          "**« Suit le rythme. Score 8 minimum. »**"
        ],
        miniGame: "Simon",
        effect: ({ gameResult, addItem, quests }) => {
           quests.notifyDialogue("coleoptereSacre");
          if (gameResult >= 8) {
            addItem("techniqueSacree");
          }
        },
        next: "finResultat"
      },

      finResultat: {
        image: "insecte",
        url: "https://nature.ca/wp-content/uploads/2022/08/Blog_Japanese_Beetle-scaled.jpg",
        options: [
          {
            text: "✅ Réussi",
            next: "sacree",
            condition: ({ hasItem }) => hasItem("techniqueSacree")
          },
          {
            text: "❌ Raté",
            next: "reponseFourmis",
            condition: ({ hasItem }) => !hasItem("techniqueSacree")
          }
        ],
        next: "reponseFourmis"
      },

      sacree: {
        image: "insecte",
        url: "https://i.ebayimg.com/00/s/MTI1MlgxNDQy/z/Y84AAOSw1tRc1CVg/$_57.JPG?set_id=8800005007",
        text: [
          "**« Tu es pret desormais.. Voila le secret pour vaincre Sale Matou »**"
          , "- se penche a l'oreille et donne la bonne maniere d'utiliser les Griffes supremes -"
        ],
        effect: ({ addItem, soundManager, CATManager }) => {
          addItem("techniqueSacree");
          soundManager?.play("finNiveau");
        },
        next: "fin"
      },


      miauled: {
        image: "insecte",
        url: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Sacred_beetle_Egyptian_art.jpg",
        text: [
          "* Les fourmis s'affolent' a ton miaulement *",
          "**« A l'attaque !! »**",
          "* Une centaine de fourmis te remontent dans les poils *"
          , "- En plus de faire mal, c'est degueu -"
        ],
        effect: ({ CATManager }) => {
          CATManager.vomito(20);
        },
        next: "aie"
      },

      fin: {
        end: true
      }
    }
  }

  , porteCave: {
    start: "intro",
    nodes: {
      ...common_nodes,

      intro: {
        image: 'robot',
        url: 'https://c8.alamy.com/comp/2MHPDEM/keyboard-number-digicode-code-digital-code-security-for-access-wooden-home-building-open-gate-door-2MHPDEM.jpg'
        , text: ["Il y a un code pour ouvrir la porte..."],
        options: [
          { text: "Uriner sur le boitier", next: "nimp" },
          { text: "Tenter un mot de passe", next: "choixCode" },
          { text: "Partir", next: "fin" }
        ],
        next: "fin"
      },

      choixCode: {
        image: 'robot',
        text: ["..."],
        miniGame: "ChoixCode", miniGameOptions: { code: "8833" },
        effect: ({ addItem, gameResult }) => {
          if (gameResult == null)
            return null;
          if (gameResult)
            addItem("cleCave");
        },
        next: "checkCode"
      },
      checkCode: {
        image: 'robot',
        text: [
          "Le boitier repond."
        ],
        options: [
          {
            text: "* Lumiere ROUGE, pas le bon code *", next: "fin", condition: ({ hasItem }) => {
              return !hasItem('cleCave')
            }
          },
          {
            text: "* Lumiere VERTE, Entrez *", next: "gagne", condition: ({ quests, hasItem }) => {
              //quests.advanceQuest('mysterePlacard',6);  
              return hasItem('cleCave')
            }
          },
        ],
        next: "fin"
      },

      gagne: {
        url: 'https://www.gatemasterlocks.com/wp-content/uploads/2022/02/DSC2670-1024x683.jpg',
        text: ["La porte s'ouvre sur une zone sombre et puante"],
        image: 'ouhla'
        , effect: ({ hasItem, CATManager, quests, soundManager }) => {

          quests.advanceQuest("SaleMatou", 5);
          soundManager.play('bipOK')
          CATManager.disableDialog('porteCave');

        },
        next: "fin"

      },
    }
  }
  , robotCroquette: {
    start: "intro",
    nodes: {
      ...common_nodes,

      intro: {
        image: 'robot',
        text: ["Un robot distributeur de croquettes trône fièrement dans un coin."],
        options: [
          { text: "Le pousser avec la patte", next: "inutile" },
          {
            text: "Donner le mot de passe", next: "choixCode", condition: ({ quests }) => {
              return quests.isAboveStep("mysterePlacard", 2);
            }
          },
          { text: "Gratter le clapet", next: "bonMot" },
          { text: "Partir", next: "fin" }
        ],
        next: "fin"
      },

      choixCode: {
        image: 'robot',
        text: ["Quel mot veux-tu prononcer ?"],
        miniGame: "ChoixCode",
        effect: ({ addItem, gameResult }) => {
          if (gameResult == null)
            return null;
          if (gameResult)
            addItem("code_robot");
        },
        next: "checkCode"
      },

      bonMot: {
        image: 'robot',
        text: [
          "Le robot s’anime, une lumière verte clignote...",
          "Un compartiment s’ouvre et dépose des croquettes dorées au sol.", "Tiens, la ration du pauvre chat"
        ],
        effect: ({ addCroqs, soundManager, quests }) => {
          quests.notifyDialogue('robotCroquette');
          addCroqs(1);
          soundManager.play('gold');
        },
        next: "fin"
      },

      checkCode: {
        image: 'robot',
        text: [
          "Le robot grince et te fixe avec un œil rouge clignotant..."
        ],
        options: [
          {
            text: "* Code invalide *", next: "perdu", condition: ({ hasItem }) => {
              return !hasItem('code_robot')
            }
          },
          {
            text: "CODE CORRECT", next: "gagne", condition: ({ quests, hasItem }) => {
              quests.advanceQuest('mysterePlacard', 6);
              return hasItem('code_robot')
            }
          },
        ],
        next: "fin"
      },
      perdu: {
        text: ["Le mot de passe est incorrect ", "Mais il commence par un 7"
          , "...", "...", "ou pas"
        ], short: true
        , effect: ({ hasItem, CATManager, quests, soundManager }) => {
          soundManager.play('bipNotOK')
        },
        next: "fin"
      },
      gagne: {
        url: 'https://www.pngarts.com/files/4/Robot-PNG-High-Quality-Image.png',
        text: ["Le robot se rallume, tu as hacké son systeme, "
          , "tu peux le rallumer en miaulant dessus autant que tu veux desormais"
          , "** Toutes les sources de croquettes de tous les niveaux se rempliront de nouveau **"],
        image: 'robot'
        , effect: ({ hasItem, CATManager, quests, soundManager }) => {
          if (hasItem("code_robot")) {
            CATManager.resetCroquettes();
            quests.advanceQuest("mysterePlacard", 6); // on repete pour le debug, 
            soundManager.play('bipOK')
            CATManager.disableDialog('robotCroquette');
          }
        },
        next: "fin"

      },
      hack: {
        text: ["Le robot se rallume"],
        image: 'robot', next: 'fin'
        , effect: ({ soundManager, CATManager, hasItem }) => {
          soundManager.play("finNiveau");
          CATManager.resetCroquettes();
        }
      },
      miauled: {
        text: ["Le robot se rallume"],
        image: 'robot',
        options: [
          { text: "Gratter pour une croqs", next: "fin" },
          {
            text: "Remplir toutes les gamelles vides", next: "hack"
            , condition: ({ hasItem }) => {
              return hasItem('code_robot')
            }
          }
        ]
        , effect: ({ soundManager, CATManager, hasItem }) => {
          soundManager.play("bipOK");
          if (hasItem("code_robot")) {
            CATManager.resetCroquettes();
          }
        },
      }
      , fin: { end: true }
    }
  }

  , placardAThon: {
    start: "intro",
    nodes: {
      ...common_nodes,

      intro: {
        image: 'system',
        url: 'https://media.adeo.com/media/1742839/format/jpeg?height=450&crop=4:3,smart&quality=75',
        text: [
          "Ce placard est bien fermé...",
          "Ça sent le thon à l'intérieur... 🤤"
        ],
        options: [
          {
            text: "Essayer d’ouvrir avec la clef qu'a donné le robot",
            condition: ({ hasItem }) => hasItem("code_robot"),
            next: "ouvrir"
          },
          { text: "Renifler le bois", next: "gratter" },
          { text: "Gratter", next: "gratter" },
          { text: "Tirer avec la patte", next: "gratter" },
          { text: "Partir", next: "fin" }
        ]
      },

      gratter: {
        text: ["Miaouuu...", "Rien ne se passe, vous voyez une note sur le placard"
          , " (la clé du placard est cachée dans le robot "
          , "qui ne s'ouvre qu'avec un code...) ", "<< Ah ah ah .. "
          , "Il est pas pres de mettre les pattes sur le thon", " ce voleur de chat>>"],
        effect: ({ soundManager, quests }) => {
          quests.notifyDialogue('placardAThon');
        },
        next: "fin"
      },

      ouvrir: {
        image: 'info',
        url: 'https://media.istockphoto.com/id/1313468511/fr/vid%C3%A9o/promenez-vous-dans-un-vieux-sous-sol-souterrain-sombre-ou-un-placard-dans-une-vieille-maison.jpg?s=640x640&k=20&c=3GEr5aC-kiwP2veZ9wnXIOIz4tdQ8vnowcGR371JXbE=',
        text: [
          "Tu insères la clé dans la serrure...",
          "CLIC.",
          "Le placard s’ouvre lentement... révélant une boîte de thon !",
          "Tu te regales... Eh, mais on dirait qu'il y a autre chose au fond"
        ],
        effect: ({ quests, addItem, addCroqs, CATManager }) => {
          quests.notifyDialogue('placardAThon');// des fois il a pas gratté
          quests.notifyDialogue('placardAThonDeblocked');

          CATManager.disableDialog('placardAThon')
          addItem("thon");
          addCroqs(10);
        },
        next: "fin"
      },

      fin: { end: true }
    }
  }
, cleLabyrinthe:{
   start: "intro",
    nodes: {
      ...common_nodes,

      intro: {
        url:'https://upload.wikimedia.org/wikipedia/commons/b/b8/Lewes_Bonfire%2C_discarded_torch.jpg',
        text: [
          "Tu trouves une clef etrange",
          "Et une torche qui te sera utile"
        ],short:true, next:"fin"
        ,effect:({addItem})=>{
          addItem('cleLabyrinthe');
          addItem('torche');
        }
      }
    }
}
  , labyrinthe: {
    start: "intro",
    nodes: {
      ...common_nodes,

      intro: {
        url:'https://o.fortboyard.tv/photos/photo_11946.jpg',
        text: [
          "D'abord verifions si tu as la cle du labyrinthe",
        ],
        options: [
          { text: "Non je ne l'ai pas", next: "miauled" },
          { text: "Se frotter a sa jambe", next: "nimp" },
          {
            text: "Oui bien sur, la voila", next: "introSphynx", condition: ({ hasItem }) => {
              return hasItem('cleLabyrinthe');
            }
          }
        ]
      },
      introSphynx: {
         url:'https://o.fortboyard.tv/photos/photo_11946.jpg',
        text: [
          "Une voix venue de nulle part résonne dans la salle...",
          "☠ Sphinx : Seuls les esprits affûtés passeront.",
          "☠ Sphinx : Trois énigmes, trois vérités."
        ],
        effect: (({ hasItem, quests, soundManager }) => {
          soundManager.play('fire')
        }),
        next: "riddle1"
      },

      // Énigme 1
      riddle1: {
         url:'https://o.fortboyard.tv/photos/photo_11946.jpg',
        text: ["☠ Qu'est-ce qui a des racines que personne ne voit, est plus haut qu'un arbre, et pourtant ne grandit pas ?"],
        options: [
          { text: "Une montagne", next: "r1_correct" },
          { text: "Un fantôme", next: "r3_wrong" },
          { text: "Une tour", next: "r3_wrong" }
        ]
      },
      r1_correct: {
        text: ["☠ ...Correct."],
        image:'vieuxSage',
        effect: ({ addCroqs }) => addCroqs(5),
        next: "riddle2"
      },

      // Énigme 2
      riddle2: {
         url:'https://o.fortboyard.tv/photos/photo_11946.jpg',
        text: ["☠ Je suis pris avant de vous reposer, souvent petit, parfois de plomb. Qui suis-je ?"],
        options: [
          { text: "Un secret", next: "r3_wrong" },
          { text: "Un bain", next: "r3_wrong" },
          { text: "Un sommeil", next: "r2_correct" }
        ]
      },
      r2_correct: {
         image:'vieuxSage',
        text: ["☠ Deux sur trois... Impressionnant."],
        effect: ({ addItem }) => addItem("potion"),
        next: "riddle3"
      },

      // Énigme 3
      riddle3: {
         url:'https://o.fortboyard.tv/photos/photo_11946.jpg',
        text: ["☠ Je suis toujours devant vous, mais vous ne pouvez jamais m'atteindre. Qui suis-je ?"],
        options: [
          { text: "L'horizon", next: "r3_correct" },
          { text: "Le futur", next: "r3_wrong" },
          { text: "L'ombre", next: "r3_wrong" }
        ]
      },
      r3_correct: {
        url:'https://img.freepik.com/photos-premium/sorcier-cree-boule-feu-dans-sa-main_993599-6866.jpg?w=360',
         image:'vieuxSage',
        text: ["☠ Tu as percé tous les mystères...", 
          "Bravo, tu as gagné le niveau bonus,"," j'ai rien programmé d'autre"
        ],
        effect: ({ moveToZone }) => moveToZone("jardin", { x: 4, y: 17 }),
        next: "fin"
      },
      r3_wrong: {
         image:'vieuxSage',
        text: ["☠ Tu as échoué petit matou pouilleux...", "Retourne dans ta gouttiere"],
        effect: ({ moveToZone }) => moveToZone("balcon"),
        next: "fin"
      },
      miauled: {
         image:'vieuxSage',
        text: ["On connait les astuces petit malin... Bien vu"],
        effect: ({ moveToZone }) => moveToZone("jardin"),
        next: "fin"
      }
    }
  },
  ratShaman: {
    start: "intro",
    nodes: {
      ...common_nodes,

      intro: {
        image: "rat",
        url: "https://blog.mesindesgalantes.com/wp-content/uploads/2017/09/scary_rat.jpg",
        text: [
          "🐀 *Un rat dégarni médite sur un vieux paquet de Litière Max+.*",
          "🐀 \"Tu viens pour la clé... ou tu entends l’appel du Coléoptère ?\"",
          "🐀 \"Ces insectes croient tout savoir sur le combat... Moi je crois au chaos.\""
        ],
        options: [
            {
            text: "Je reviens du Coléoptère Sacré",
            next: "echange",
            condition: ({ hasItem }) => hasItem("preuve_du_coleo")
          },
          { text: "Je veux la clé", next: "ratRepond" },
        
          {
            text: "J'ai eclaté le bourdon...",
            next: "ratSurBourdon",
            condition: ({ hasItem }) => hasItem("bourdonVaincu")
          },

          { text: "Qui est ce coléoptère ?", next: "rival", condition: ({ hasItem }) => !hasItem("preuve_du_coleo") },

          { text: "(Je me barre)", next: "fin" },
        ]
      },
    ratRepond: {
      image: "rat",
      text: [
        "* Si tu veux la clé , rends-moi service *",
        "🐀 Va voir le Coléoptère Sacré de ma part."
        , "Et dis-lui bien d'aller se faire foutre !"
      ],
      next: "intro"
    }
   , ratSurBourdon: {
      image: "rat", short:true,
      text: [
        "* Tu m'en a laissé un bout ? *",
      ],
      next: "intro"
    }
      ,
      echange: {
        image: "rat",
      url: 'https://previews.123rf.com/images/viktoriya89/viktoriya891603/viktoriya89160300016/54797146-sheet-of-ancient-parchment-or-old-paper-and-vintage-key-on-wooden-background.jpg',
          text: [
          "🐀 *Quoi ? Il me pardonne ?*",
          "🐀 Le salaud, il veut laisser le karma s'occuper de moi... Tiens la clé, tu l'as merité"
        ],
        effect: ({ addItem, soundManager }) => {
          addItem("codeArme");
          soundManager.play("bipOK");
        },
        next: "fin"
      },

      rival: {
        image: "rat",
        url: "https://blog.mesindesgalantes.com/wp-content/uploads/2017/09/scary_rat.jpg",
        text: [
          "🐀 \"Un Sale con.. \"",
          "🐀 Il m'en veut depuis que je lui ai volé sa reserve d'hiver"  ,
        "🐀 \"Il vit avec les fourmis.\"",
      
        ],
        next: "intro"
      },


    }
  }


  , gipsy: {
    start: "intro",
    nodes: {
      ...common_nodes,
      intro: {
        image: 'insecte',
        url: 'https://www.sansdepasser.com/assets/images/user-coloriages/317/9/317-1540027108.png',
        text: [
          "🕷️  Viens t’asseoir, petit matou...",
          "🕷️  **. S'essuie le cul avec le PQ **",
          "🕷️ Pour te remercier, tu peux choisir ce que tu veux."
        ],
        options: [
          { text: "Des croquettes", next: "wrong" },
          { text: "Devenir humain", next: "wrong" },
          { text: "Ta tapette a mouche", next: "tapette" },
          { text: "Le code du robot-croquette", next: "tapette" },
          { text: "(Je jette l'araignee au fond des WC)", next: "nimp" },
          { text: "(Rien je la mange)", next: "degueu" },
          { text: "Elle me casse les couilles cette araignee, je me barre", next: "fin" },
        ]
      },
      wrong: {
        image: 'interdit',
        url: 'https://thumbs.dreamstime.com/z/araign%C3%A9e-triste-19475857.jpg',
        text: ["Malheureux.. Je ne peux pas faire ca"
          , "🕷️🕷️🕷️ Je ne suis qu'une araignee ! 🕷️🕷️🕷️"]
        , next: "intro"
        , effect: (ctx) => {
          ctx.addItem('cleTerrasse');
        }
      },
      tapette: {
        image: 'insecte',
        url: 'https://assets2.latoquedor.com/27282/tapette-a-mouche-veritable.jpg',
        text: [
          "🕷️ Tres bien, une promesse est une promesse.", "Elle te donne sa tapette à mouche...",
          "🕷️ Et retiens ce code : ** 4852 **",
          "🕷️ Il déverrouillera ce que le métal a enfermé..."
        ],
        effect: ({ addItem, soundManager }) => {
          addItem("tapette_A_Mouche");
          soundManager.play("finNiveau");
        },
        next: "fin"
      },
    }
  }
  , parlerPapa: {
    start: "intro",
    nodes: {
      ...common_nodes,
      intro: {
        image: 'papa',
        text: ["Pas maintenant, je bosse...", "Noublie pas..",
          "** Tu peux continuer a lui miauler dessus avec M **"]
        , effect: ({ soundManager, addItem, addCroqs }) => {
          soundManager?.play("degage");
        }
        , url: 'https://media.licdn.com/dms/image/v2/C4E03AQEMVkc94iqc8w/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1576749044902?e=2147483647&v=beta&t=l9ORPHLGfeAGUYvpGFQf6NGeW_oV77GYFQ4RLe04asM'
        , next: "fin"
      },
      vasy: {
        url: 'https://radiodisneyclub.fr/wp-content/uploads/2022/06/Hulk.jpg',
        text: [
          "Tu me casses les couilles",
          "Je vais te filer un schmackos",
          "Ca va te calmer"
        ],
        effect: ({ soundManager, addItem, addCroqs }) => {
          soundManager?.play("rage");

          addItem('schmackos');
        },
        next: "beauChat"
      },

      // 🌟 Cas : si le joueur revient avec la quête déjà avancée
      miauled: {
        image: 'papa',
        text: [
          "Tu veux quoi chat chat ?",
          "** Faites du bordel pour le deconcentrer **"
        ]
        , options: [
          {
            text: "Je veux sortir", next: 'sortir', condition: (context) => {
              context.quests.isAboveStep("papaOuvre", 4);
            }
          }
          , { text: "Regarder papa dans les yeux, puis fixer la fenetre", next: 'leveToi', condition: (context) => context.hasItem("schmackos") }
          , { text: "Marcher sur son clavier", next: 'vasy', condition: (context) => context.quests.isStepCompleted("papaOuvre", 2) }
          , { text: "Miauler tres fort au visage", next: 'vasy', condition: (context) => context.quests.isStepCompleted("papaOuvre", 1) }
          , { text: "Marcher sur papa", next: "inutile" }
          , { text: "Faire un bisou a papa", next: "gentil" }
        ]
        // effect: ({ CATManager }) => {
        //   CATManager?.moveEntity("papa", { x: 11, y: 10 });
        // },

      },
      sortir: {
        image: 'papa',
        text: ["*Papa ouvre enfin !!", "C'est pas trop tot, merde !", "La porte fenetre est ouverte"
          , "(Tu obtiens la cle de la terrasse )"]
        , next: "fin"
        , effect: (ctx) => {
          ctx.addItem('cleTerrasse');
        }
      },
      gentil: {
        image: 'papa',
        text: ["Tu es gentil chat-chat", "*(Tu trouves ca degueu)*"]
        , next: "fin"
        , effect: (ctx) => {
           ctx.CATManager.vomito(Math.round(Math.random() * 20));
        }
      },
      leveToi: {
        image: 'papa',
        url: 'https://i.pinimg.com/originals/e2/a5/76/e2a576515fe51db7dde5dd223b60072c.jpg',
        text: [
          "*Papa se lève en râlant ...*",
          "Allez fais un effort au moins, finis ton schmakos",
        ],
        options: [
          { text: 'Faire le beau', next: "beauChat" },
          { text: "Poser la patte sur la main", next: "poserPatte" },
          { text: "Lecher le nez", next: "degueu" }
        ],
      },
      beauChat: {
        image: 'papa',
        text: ["Oui c'est bien , tu es un BEAU chat"], next: "fin"
        , effect: ({ CATManager, soundManager, addCroqs }) => {

          addCroqs(5);
        },
      },

      poserPatte: {
        image: 'papa',
        text: [
          "*Papa donne le schmakos par petit bouts...*",
          "*C'est bon*", "Maintenant, laisse-moi tranquille..."
        ],
        effect: ({ soundManager }) => {
          soundManager?.play("miam");

        },
        options: [
          {
            text: 'Revenir apres 2 minutes', next: "degage"
          },
          {
            text: 'Revenir apres 10 minutes', next: "degage"
          },
          {
            text: 'Revenir apres 30 minutes', next: "degage"
          },
          {
            text: 'Revenir apres 1h ? Nannn faut pas deconner', next: "nimp"
          }
        ]
      },
      bougePage: {
        url: 'https://radiodisneyclub.fr/wp-content/uploads/2022/06/Hulk.jpg',
        text: [
          "PAPA : Bon tu as gagné, j'arrete ce que je faisais",
          "*Papa retourne à son fauteuil en soupirant....*"
        ],
        image: 'papa',
        effect: ({ CATManager, quests }) => {
          CATManager?.moveEntity("papa", { x: 11, y: 10 });
          quests.advanceQuest('papaOuvre', 4);
        }
      },
      degage: {
        url: 'https://www.shutterstock.com/image-photo/man-smokes-cigarette-on-balcony-260nw-2495228295.jpg',

        text: [
          "PAPA  te prends et te depose au sol",
          "** Bon je vais faire une pause, y en a marre de bosser de toute facon... **",
          "Papa se leve et va fumer une cigarette sur la terrasse... ",
          "-- Le balcon est ouvert !--"
        ],
        image: 'papa',
        effect: ({ quests, addItem, CATManager }) => {
          addItem('cleTerrasse');
          quests.advanceQuest('papaOuvre', 5);
          soundManager.play('porte');
          CATManager.moveEntity('papa', { row: 17, col: 22 }); // position papa sur la terrasse
        },
        next: "fin"
      }
    }
  }
  , lavabo: {
    start: "intro",
    nodes: {
      ...common_nodes,
      intro: {
        image: 'system',
        url: 'https://www.viadurini.fr/data/prod/img/lavabo-sospeso-stile-vintage-in-ceramica-bianca-made-in-italy-marwa-1.jpg',
        text: ["Ce lavabo est bien haut ", "Maman !! De l'eau !!"]
        , options: [
          {
            text: "Boire enfin", next: 'boire', condition: ({ hasItem }) => {
              return hasItem('eau_du_robinet');
            }
          }
          , { text: "Lecher le dentifrice au fond", next: "degueu" }
          , { text: "Grimper sur le rebord de maniere austentatoire", next: "inutile" }
          , { text: "Ouvrir le robinet avec mes dents", next: "nimp" }
        ]
      },
      boire: {
        image: 'chat',
        url: 'https://lemagduchat.ouest-france.fr/images/dossiers/2019-04/chat-boit-082616.jpg',
        text: ["On dirait que cette quete est enfin terminée", "Je vais pouvoir descendre"]
        , effect: ({ quests, addItem }) => {
          quests.completeQuest('escalier');
          addItem('accesEscalierEtage');
        }
        , next: 'fin'
      }
    }
  }
  , patounerCanape: {
    start: "intro",
    nodes: {
      ...common_nodes,
      intro: {
        image: 'chat',
        url: 'https://www.assuropoil.fr/wp-content/uploads/chat-qui-patoune.png',
        text: [
          "*patoune patoune patoune*",
          "Oh oui.. C'est bon..."
        ],
        next: 'fin'
      },
      start: {
        url: 'https://maison.20minutes.fr/wp-content/uploads/2022/07/canape-en-cuir-dechire.jpg',
        text: [
          "Avec les griffes, ca detend tellement mieux",
          "Oh oui.. C'est bon.. Je crois que je vais jouir."
        ],
         effect: ({ takeDamage, quests, soundManager }) => {
          quests.notifyDialogue('patounerCanape');
          soundManager.play('ronfle');
        },
        next: 'fin'
      },
      completed: {
        url: 'https://media.istockphoto.com/id/576716782/fr/photo/vieux-canap%C3%A9-%C3%A0-labandon.jpg?s=612x612&w=0&k=20&c=qM6e4aGvUN0Ra6042WGNDBWCyc1gqu2e-Iv13ibcFO4=',
        text: [
          "Raaahhhh.. Lovely !!!",
          "Le canapé est en ruine. Bravo ! 😼"
        ],
        effect: ({ takeDamage, quests, soundManager }) => {
          takeDamage(5);
          quests.notifyDialogue('patounerCanape');
          soundManager.play('ronfle');
        },
        next: 'fin'
      }
    }
  }
  , uneTele: {
    start: "intro",
    nodes: {
      ...common_nodes,

      intro: {
        image: "robot",
        url: 'https://im.qccdn.fr/node/guide-d-achat-televiseurs-a-ecran-plat-3945/thumbnail_800x480px-120758.jpg',
        text: [
          "*Tu observes la grande télé noire.*",
          "*Muette. Inerte. Prête à être réveillée.*",
          "*Et là... la télécommande, sacrée relique, trône au sol.*"
        ],
        options: [
          { text: "Marcher sur les boutons", next: "boutons" },
          { text: "Tirer sur les fils derrière", next: "fils" },
          { text: "Activer le menu spécial", next: "menuSpecial" },
          { text: "Faire n’importe quoi avec frénésie", next: "chaos" },
          { text: "Respecter la télé", next: "fin" }
        ]
      },

      boutons: {
        image: "tv",
        text: [
          "*CLAC.* L’écran s’allume dans un éclair blanc.",
          "*Tu as marché pile sur le bouton POWER. Propre.*",
          "*Mais il n’y a rien d’intéressant pour l’instant.*"
        ],
        next: "fin"
      },

      fils: {
        image: "tv",
        text: [
          "*Tu tires sur un câble avec tes dents...*",
          "*ZAP.* Une étincelle claque !",
          "*Ton poil se dresse.*"
        ],
        effect: ({ takeDamage, quests, soundManager }) => {
          takeDamage(10);
          quests.notifyDialogue?.("uneTele");
          soundManager?.play?.("fire");
        },
        next: "chaos"
      },

      menuSpecial: {
        image: "tv",
        text: [
          "*Tu appuies sur un bouton étrange...*",
          "**Une interface minimaliste apparaît.**",
          "*Il y a... un morpion ?!*"
        ],
        effect: ({ quests,gameResult,CATManager }) => {
          soundManager?.play?.("explosion");
          quests.notifyDialogue?.("uneTele");
           if (gameResult == null) return;
          if (!gameResult) {
            
            CATManager.closeCurrentDialogue('croqsARemuer');
          }
        },
        miniGame: "Morpion",
        next: "chaos"
      },

      chaos: {
        image: "tv",
        url: 'https://t3.ftcdn.net/jpg/06/32/48/66/360_F_632486628_ji80bZcQLU7V2egQs70NlfrWwLo12j5N.jpg',
        text: [
          "*Tu bondis sur la télécommande. Tous les boutons.*",
          "*L'écran devient blanc. Le monde s’arrête.*", " BOOOUUM"
        ],
        effect: ({ CATManager, quests }) => {
          CATManager.triggerEffect('17,12', "explosion");
          soundManager?.play?.("explosion");
          quests.notifyDialogue?.("uneTele");
        },
        next: "fin"
      },

      miauled: {
        image: "robot",
        url: 'https://static.vecteezy.com/ti/photos-gratuite/p1/49201489-colore-des-oiseaux-perche-sur-une-branche-dans-une-luxuriant-vert-foret-pendant-lumiere-du-jour-photo.jpeg',
        text: [
          "*Un miaulement résonne dans la pièce...*",
          "*La télé clignote.*",
          "*Puis... une image apparaît.*",
          "**Des oiseaux. Des dizaines. En boucle.**",
          "*Tu restes figé. Fasciné.*"
        ],
        effect: ({ CATManager, quests, soundManager }) => {
          quests.notifyDialogue?.("uneTele");
          CATManager.unPeuDeMusique?.();
          soundManager?.play?.("birds");
        },
        next: "fin"
      },

      fin: {
        text: ["*Tu as appris une chose aujourd’hui : ne jamais sous-estimer une télécommande.*"],
        end: true
      }
    }
  }


  , croqsARemuer: {
    start: "intro",
    nodes: {
      ...common_nodes,
      intro: {
        image: 'chat',
        text: [
          "*Le paquet de croquettes est mou, pas très rempli...*",
          "*En le poussant, tu entends un petit clic...*",
          "*Un compartiment s'ouvre... ?!*"
        ],
        options: [
          {
            text: "Regarder de plus près...",
            next: "miniJeu"
          },
          {
            text: "Trop bizarre, je préfère pas...",
            next: "fin"
          }
        ]
      },

      miniJeu: {
        image: 'insecte',
        text: [
          "*Il y a une souris qui te nargue*",
          "*Elle te defie au Chi-fou-mi... C’est parti !*"
        ],
        effect: ({ CATManager, gameResult, quests }) => {
          // CATManager.openMiniGame?.("ChiFuMi"); // ⚠️ ou CATManager.setOverlayComponent(...)
          quests.notifyDialogue("croqsARemuer"); // valider step 0
          if (gameResult == null) return;
          if (!gameResult) {
            
            CATManager.closeCurrentDialogue('croqsARemuer');
          }
          else{}
        },
        miniGame: "ChiFuMi",
        next: "conclusionJeu"
      },
      conclusionJeu:{
        url:'https://www.assoedc.com/wp-content/uploads/2015/09/EDC-Victoire-EnR.jpg'
        , text:["C'est gagné...", "Papa rale , continue, il va craquer"]
        ,next:'fin'
        , effect: ({ quests }) => {
           quests.notifyDialogue("croqsARemuer"); // valider step 0
          soundManager.play('bipOK')
        },
      }

    }
  }
  , salutCopain: {
    start: "intro",
    nodes: {
      ...common_nodes,
      intro: {
        image: 'chat',
        url: 'https://c8.alamy.com/compfr/edrtg5/chat-noir-dort-sur-table-en-bois-close-up-edrtg5.jpg',
        text: [
          "😼 Eh ! Salut Copain !",
          "😼 Je bougerai pas d'ici, si tu veux que je parte",
          "😼 Il va falloir me convaincre."
        ],
        next: "checkCroqs"
      },

      checkCroqs: {
        image: 'chat',
        url: 'https://previews.123rf.com/images/nejatguven/nejatguven2306/nejatguven230600361/206254538-a-cat-sitting-at-the-table-the-cat-looks-like-a-mafia-boss-by-generative-ai.jpg',
        text: [
          "😼 Mouais... T'as quoi là, 2-3 miettes ?",
          "😼 File-moi les croqs que tu aimes pas, je t'en debarrasse gratuitement"
        ],
        options: [
          { text: "Intimider", next: "nextIntimider" },
          { text: "Montrer mon cul", next: "nul" },
          { text: "Degurgiter", next: "degueu" },
          { text: "Attendre", next: "fin" },
          { text: "Donner 1 croquette", next: "next1" },
          { text: "Donner 10 croquettes", next: "next10" },
          { text: "Donner 50 croquettes", next: "next50" }
        ],
        next: "fin"
      },

      nul: {
        url: 'https://mediaproxy.tvtropes.org/width/1200/https://static.tvtropes.org/pmwiki/pub/images/facepalm_deja_q.jpg',
        text: [
          "** Ca marche pas avec lui **",
          "😼 Essaye autre chose, je m'en fous, je bouge pas."
        ],
        effect: ({ }) => { soundManager.play('bipNotOK') },
        next: "checkCroqs"

      },
      next1: {
        text: [
          "** Il l'avale aussi sec **",
          "😼 Je suis pas une œuvre de charité, je m'en fous je bouge pas."
        ],
        effect: ({ addCroqs }) => { addCroqs(-1); soundManager.play('miam') },
        next: "checkCroqs"

      },
      next10: {
        text: [
          "** Il les avale aussi sec **",
          "😼 J'ai encore faim, je m'en fous je bouge pas."
        ],
        effect: ({ addCroqs }) => {
          addCroqs(-10);
          soundManager.play('miam')
        },
        next: "checkCroqs"

      },
      next50: {
        image: 'chat',
        url: 'https://www.opnminded.com/wp-content/uploads/2017/03/drogue-dealer-optimized.jpg',
        text: [
          "😼 Hmmm, j’peux sentir l’odeur d’un sachet bien rempli...",
          "*Transaction acceptée.*", "De toutes facons, y a ma maman qui m'appelle, ciao looser !"
        ],
        effect: ({ addCroqs, quests, CATManager, addItem }) => {
          addCroqs(-50);
          soundManager.play('miam')
          CATManager.disableDialog('salutCopain')
          CATManager?.moveEntity('copain', "1,3");
          addItem('cleJardin');
          quests.notifyDialogue('copainOK');
        },
        next: "fin"
      },
      nextIntimider: {
        image: 'ouhla',
        text: [
          "** Il se couche sur le dos en montrant son ventre **",
          "😼 Vas-y, je suis cool, je cherche pas la merde, je m'en fous je bouge pas."
        ],
        options: [
          { text: "S'asseoir et Attendre", next: "nul" },
          { text: "Lui trancher la gorge avec les crocs", next: "degueu" },
          { text: "Se retourner et montrer son cul", next: "nul" },
          { text: "Laisser tomber et partir", next: "fin" },
        ]
      },
      miauled: {
        image: 'chat',
        url: 'https://as1.ftcdn.net/jpg/04/80/01/98/1000_F_480019888_sn2SVaW7jgjiDKRczO1OYvbiqiPrOyIh.jpg',
        text: ["Quoi, qu'est-ce tu veux, tu vois pas que je dors ?"], short: true,
        next: "checkCroqs"
      }

    }
  }



  , mamanSdb: {
    start: "intro",
    nodes: {
      ...common_nodes,
      image: 'maman',
      intro: {
        url: 'https://resize.prod.femina.ladmedia.fr/rblr/652,438/img/var/2022-11/chat.jpeg',
        text: ["Tu veux quoi chat chat ?"],
        options: [
          { text: "Miauler", next: "miauler" },
          { text: "Demander de l'eau", next: "deLeau" },
        ],
        next: "fin"
      },
      deLeau: {
        image: 'maman',
        url: 'https://images.ctfassets.net/denf86kkcx7r/3m1LoEE9GHzUcvbjCPct3b/f36ff9bc88169e1669ba86659e80632a/Tucker_le_chat_le_plus_triste_du_monde',
        text: ["Miaou", "Mais Tu es un chat, on ne te comprends pas", "Essaye differents miaulements"]
        , options: [
          { text: "Affectueux", next: "affectueux" },
          { text: "Pas content", next: "pasContent" },
          { text: "Enervé", next: "enerve" },
        ]
      }

      , affectueux: {
        image: 'maman', short: true,
        text: ["Cette methode a fait ses preuves", "Mais pas cette fois"]
        , url: 'https://www.premiere.fr/sites/default/files/styles/scale_crop_1280x720/public/2022-03/1647376088_Le-Chat-Potte-revient-avec-sa-suite-The-Last-Wish.jpg'
        , effect: ({ soundManager, quests }) => {
          soundManager.play('miaou');
        },
        next: "deLeau"
      }
      , ronronne: {
        url: 'https://www.assuropoil.fr/wp-content/uploads/2023/08/chat-agressif-que-faire.jpeg',
        image: 'maman', short: true,
        text: ["Cette methode a fait ses preuves", "Mais pas cette fois"]
        , effect: ({ soundManager, quests }) => {
          soundManager.play('ronfle');
        },
        next: "deLeau"
      }
      , pasContent: {
        url: 'https://www.assuropoil.fr/wp-content/uploads/2023/08/chat-agressif-que-faire.jpeg',
        image: 'maman', short: true,
        text: ["Cette methode a fait ses preuves", "Mais pas cette fois"]
        , effect: ({ soundManager, quests }) => {
          soundManager.play('pasContent');
        },
        next: "deLeau"
      }
      , enerve: {
        text: ["Vas-y merde ! Tu comprends pas ou quoi ! "]
        , url: 'https://www.pro-nutrition.fr/img/ybc_blog/post/chat_colere4_ban.jpg'
        , effect: ({ soundManager, quests }) => {
          soundManager.play('miaouMega');
        }, short: true,
        next: "miauled"
      }
      , miauled: {
        image: 'maman',
        text: ["Ahh Tu as soif c'est ca !", "Je t'ouvre le robinet.", "** Va au lavabo **"]
        , effect: ({ soundManager, CATManager }) => {
          soundManager.play('yeuh');CATManager.remplit({zone:'etage', row:9,col:9})
        },
        next: "boire"
      }
      , boire: {
        url: 'https://mag.decofinder.com/wp-content/uploads/2016/04/Fontaine_Centrale_D_Exterieur_Haddonstone_Extra_Extra_Large_Pool.jpg',
        text: ["Je te fais couler l'eau du robinet...", "Tu peux boire mon petit chat"]
        , effect: ({ soundManager, addItem, quests, CATManager }) => {

          soundManager.play('glou');
          addItem('eau_du_robinet');
          
          quests.advanceQuest('escalier', 3);
          //CATManager.disableDialog('mamanSdb')
        },
        next: "fin"
      }

    }
  }
  , coffretMegaphone: {
    start: "intro",
    nodes: {
      ...common_nodes,
      intro: {
        text: ["La vache, y a du bordel la-dedans", "Que vois-je, du linge plié"]
        , image: 'chat'
        , options: [{ text: "Me rouler en boule et dormir dessus", next: 'dormir' }
          , { text: "Patouner jusqu'a ce que tout soit deplié", next: 'patouner' }
          , {
            text: "Ramasser un megaphone", next: 'ramasser', condition: ({ hasItem }) => {
              return !hasItem('megaphone');
            }
        }
        ]
      }
      , dormir: {

        text: ["Une petite sieste, ne jamais negliger ca.."]
        , image: 'info', short: true,
        next: "fin",
        effect: ({ addPdv, addItem, hasItem }) => {

          addPdv(10);
          soundManager.play('ronfle');
        }
      }
      , patouner: {

        text: ["Je me demande qui s'est fait chier a tout plier", "Allez hop, tout par-terre", "Vous voyez un truc qui brille en-dessous"]
        , image: 'chat',
        next: "ramasser",
        effect: ({ takeDamage, addCroqs }) => {
          addCroqs(2);
          takeDamage(10);
        }
      }
      , ramasser: {

        text: ["Un megaphone a chat", "Avec ca, maman va m'entendre miauler c'est sur"]
        , image: 'megaphone',
        url: "https://m.media-amazon.com/images/I/61y27IdjKrL._AC_UL640_FMwebp_QL65_.jpg",
        next: "fin",
        effect: ({ CATManager, addItem, hasItem }) => {
          if (!hasItem("megaphone"))
            addItem("megaphone")
          soundManager.play('miaouMega');
          CATManager.disableDialog("coffretMegaphone");
        }
      }
      , fin: {
        end: true
      }
    }

  }
  , chasseInsecte: {
    start: "intro",
    nodes: {
      ...common_nodes,

      intro: {
        image: 'insecte',
        url: 'https://www.radiofrance.fr/s3/cruiser-production/2018/05/f4695a23-dabb-4382-b292-6f60eff348d5/1200x680_gettyimages-743697469.jpg',
        text: [
          "*Un insecte vibre dans les airs, ses ailes bourdonnent comme une alarme.*",
          "**« Qui ose approcher le Seigneur ZzzzigZzzzag ?! »**",
          "*Son ton est hautain. Sa voix, insupportable.*"
        ],
        options: [
          { text: "Essayer de le gober", next: "degueu" },
          { text: "Négocier", next: "moqueur" },
          { text: "Lancer la chasse", next: "jeu" },
          { text: "Partir, c’est trop pour aujourd’hui", next: "fin" }
        ]
      },


      moqueur: {
        url: 'https://www.europe1.fr/lmnr/var/europe1/storage/media/image/2025/02/06/10/une-etude-detaille-l-accouplement-traumatique-chez-un-coleoptere.jpg?VersionId=EKDmIO.asr.uffJnYdXS4idKZvNRZhbW',
        image: 'insecte',
        text: [
          "**« Négocier ? Avec un chat ? »**",
          "**« Tu m’auras si tu gagnes à mon petit jeu... mais j’en doute fort ! »**",
          "Tu gagneras si tu chopes au moins 10 de mes fils en 20 secondes"
        ],
        next: "jeu"
      },

      jeu: {
        image: 'insecte',
        text: [
          "Ajuste l'ecran bien au centre et tiens-toi pret",
          "Les petits hannetons vont sortir...",
          "Score minimum 10 !"
        ],
        miniGame: "WhackAMole",
        effect: ({ gameResult, addItem }) => {
          if (gameResult == null) return;
          if (gameResult > 10) {
            addItem("bourdonVaincu");
          }
        },
        next: "verdict"
      },

      verdict: {
        url: 'https://img.freepik.com/vecteurs-premium/illustration-vectorielle-dessin-anime-du-scarabee-pour-rampage-isole_1322560-75527.jpg?w=360',
        image: 'insecte',
        text: [
          "Resultat de la chasse aux insectes",
        ],
        options: [
          {
            text: "🎉 Bravo, tu te regales... Quel festin",
            next: "victoire",
            condition: ({ hasItem }) => hasItem("bourdonVaincu")
          },
          {
            text: "😭 Encore raté... Je m'en fous je reviens demain",
            next: "defaite",
            condition: ({ hasItem }) => !hasItem("bourdonVaincu")
          }
        ],
        next: "fin"
      },

      victoire: {
        image: 'insecte',
        url: 'https://img.freepik.com/vecteurs-premium/illustration-vectorielle-dessin-anime-du-scarabee-pour-rampage-isole_1322560-75527.jpg?w=360',
        text: [
          "*ZzzzigZzzzag vibre d’indignation...*",
          " ",
          "*******« Ne me mange pas »*******",
          "Je te donne tout ce que j'ai, meme une cle bizarre"
        ],
        effect: ({ addCroqs, addItem, quests }) => {
          quests.notifyDialogue?.('chasseInsecte');
          addCroqs(20); 
          addItem('cleLaby');
          soundManager?.play?.("finNiveau");
        },
        next: "fin"
      },

      defaite: {
        image: 'insecte',
        url: 'https://previews.123rf.com/images/iimages/iimages2205/iimages220502514/186626247-a-beetle-music-band-cartoon-character-illustration.jpg',
        text: [
          "*ZzzzigZzzzag fait des pirouettes dans l’air.*",
          "**« Tu n’es pas prêt, félin ! Retente ta chance si tu oses... »**"
        ],
        effect: ({ soundManager }) => {
          soundManager?.play?.("bipNotOK");
        },
        next: "fin"
      },

      miauled: {
        image: 'insecte',
        text: [
          "*Tu miaules vers l’insecte.*",
          "**« Je n’ai pas de croquettes à te donner, idiot poilu ! »**",
          "*...Mais il recule légèrement.*",
          "*Il semble sensible aux vibrations félines...*"
        ],
        next: "fin"
      },

      fin: {
        end: true
      }
    }
  },
  insecteQuiBourdonne: {
    start: "intro",
    nodes: {
      ...common_nodes,

      intro: {
        image: "chat",
        url: 'https://cdn.prod.website-files.com/6377ef168beb4e61aa939ba6/673d22a67560452f5f6f0e58_Amanita_muscaria.jpg',
        text: [
          "*Tu renifles un champignon dodu.*",
          "*Il sent la terre humide, le mystère et... la bave ?*",
          "*Tu entends un tout petit bruit gluant juste à côté...*"
        ],
        next: "escargot"
      },

      escargot: {
        image: "info",
        url: "https://thumbs.dreamstime.com/b/j-ai-senti-l-escargot-crawau-dessus-du-champion-agaric-de-volte-une-charmante-sculpture-feutr%C3%A9e-d-un-se-d%C3%A9pla%C3%A7ant-lentement-au-368789082.jpg",
        text: [
          "**« Salutations, félin. »**",
          "**« Je suis Glaire le Lent. »**",
          "*Il mâche lentement.*",
          "**« Je sais comment ouvrir la porte de la cave »**",
        ],
        effect: ({ quests }) => {
          quests?.notifyDialogue?.("salutGlaire");
        },
        options: [
          {
            text: "Parler de Copain",
            next: "revelation",
            condition: ({ hasItem }) => hasItem("copainEscargot")
          },

          {
            text: "Demander comment battre Sale matou",
            next: "recolement",
            condition: ({ hasItem }) => hasItem("copainEscargot")
          },
          {
            text: "Ca te parle les Griffes Supremes ?", next: "indiceGriffe",
            condition: ({ hasItem }) => hasItem("indiceGriffe") && !hasItem("armeChaton")
          },
          {
            text: "Sale matou a parlé d'un Coleoptere sacré",
            next: "recolement",
            condition: ({ hasItem }) => hasItem("armeChaton")
          },
          {
            text: "Voici tes champis, gros", next: "cadeau",
            condition: ({ hasItem }) => hasItem("champignon", 5) && !hasItem("copainEscargot")
          },
          { text: "Et si je te ramene des champignons ?", next: "merci", condition: ({ hasItem }) => !hasItem("copainEscargot") },
          { text: "Le regarder baver en silence", next: "fin" }
        ]
      },

      merci: {
        url: "https://thumbs.dreamstime.com/b/j-ai-senti-l-escargot-crawau-dessus-du-champion-agaric-de-volte-une-charmante-sculpture-feutr%C3%A9e-d-un-se-d%C3%A9pla%C3%A7ant-lentement-au-368789082.jpg",
        image: "insecte",
        text: [
          "**« Apporte-moi en 5 »**",
          "**« Et tu te feras un vrai Copain. »**"
          , "Pas comme cet abruti noir"
        ],
        next: "fin"
      },
      indiceGriffe: {
        image: "griffe",
        url: 'https://i.redd.it/claws-cyberware-found-in-game-files-v0-yl8gxpwb09ec1.png?width=1920&format=png&auto=webp&s=0ede37c5e1a937584b690f56094e805bb8b10caa',
        text: [
          "**« Ahhh.. Les griffes supremes ?. »**",
          "**«On raconte qu'elles permettraient d'impressionner tous les chats. »**",
          "**«Un oiseau m'a dit qu'il les avaient vu dans la cave sous la terrasse »**",

        ],
        options: [
          {
            text: "Et tu sais comment on va dans cette cave ?",
            next: "caveHint",
            condition: ({ hasItem }) => hasItem("copainEscargot")
          },
          {
            text: "Tu m'en diras tant (Le pauvre , il a du manger trop de champis"
            , next: "fin"
          }
        ]
      },
      caveHint: {
        image: "griffe",
        url: 'https://i.redd.it/claws-cyberware-found-in-game-files-v0-yl8gxpwb09ec1.png?width=1920&format=png&auto=webp&s=0ede37c5e1a937584b690f56094e805bb8b10caa',
        text: [
          "Il y a un code",
          "Mais je le connais , j'ai glissé dessus un jour et je l'ai activé sans le vouloir ",
          "**«Je peux te le donner si tu veux »**",

        ],
        effect: ({ addItem, quests }) => {

        },
        options: [

          {
            text: "C'est 8833, facile a retenir !",
            next: "cleCave",
            condition: ({ hasItem }) => hasItem("promesseDeCopain")
          },
          {
            text: "Aide-moi avec Copain et je t'en filerai",
            condition: ({ hasItem }) => !hasItem("promesseDeCopain")
            , next: "fin"
          }
        ]
      },

      cadeau: {
        image: "escargot",
        url: 'https://www.shutterstock.com/shutterstock/photos/1406701790/display_1500/stock-vector-best-friends-icon-funny-cute-badge-illustration-tee-shirt-print-graphic-design-1406701790.jpg',
        text: [
          "*Il se jette lentement sur les champignons...*",
          "**« Mmmmmmmh… Subliiiiiime. »**",
          "**« Tu es officiellement mon copain Ezio. »**",
          "Reviens me voir quand tu auras besoin d'aide.."
          , "!! Juste miaule un coup et tu me verras !!"
        ],
        effect: ({ addItem, quests }) => {
          addItem("copainEscargot");
          quests.notifyDialogue('amiPourLaVie');
        },
        next: "confidences"
      },

      confidences: {
        url: 'https://thumbs.dreamstime.com/b/les-escargots-africains-achatina-%C3%A0-la-maison-avec-le-chat-les-renifle-91208282.jpg',
        image: "escargot",
        text: [
          "**« Tu sais, tu pourrais m'aider pour un truc »**",
          "**« Le chat du voisin… COPAIN... c’est pas un tendre. »**",
          "Il me leche les yeux ce degueu !!"
        ],
        options: [
          {
            text: "Soupirer. Ca m'etonne pas de lui",
            next: "revelation",
            condition: ({ hasItem }) => hasItem("copainEscargot")
          },
          { text: "Si tu veux, je peux lui regler son compte", next: "revelation" },
          {
            text: "Lecher les yeux de l'escargot pour voir si c'est bon",
            next: "degueu",

          }
        ]
      },


      revelation: {
        url: 'https://image.spreadshirtmedia.net/image-server/v1/compositions/T623A1PA6718PT32X15Y4D14603444W4022H4179/views/1,width=550,height=550,appearanceId=1,backgroundColor=FFFFFF,noPt=true/chat-debile-ours-en-peluche.jpg',
        image: "escargot",
        text: [
          "**« Aide-moi et je te parlerai d'un moyen de vaincre Sale Matou »**",
        ],
        options: [
          {
            text: "C'est bon, j’ai la promesse de copain",
            next: "cleCave",
            condition: ({ hasItem }) => hasItem("promesseDeCopain")
          },
          { text: "OK. Je reviendrai quand je l’aurai fait jurer sur sa mere", next: "fin" }
        ]
      },

      cleCave: {
        image: "escargot",
        text: [
          "* Merci tu es un vrai pote ! *",
          "**«Pour te recompenser, Voici le code pour ouvrir la porte de la cave sous la terrasse »**",
          "** 8833 **"
        ],
        effect: ({ addItem }) => {
          // notify indiceGriffe
          soundManager.play('finNiveau');
        },
        next: "fin"
      },
      recolement: {
        image: "escargot",
        text: [
          "*Glaire incline lentement sa coquille.*",
          "**« Tu mérites un vrai conseil. »**",
          "*Il pointe du bout de la bave une pierre moussue au fond du jardin...*",
          "**« Le Coléoptère Sacré. Il vit parmi les fourmis »**",
          "**« Il t’enseignera ce qu’aucun chat ne peut apprendre seul. »**"
        ],
        effect: ({ hasItem,addItem }) => {
          if(!hasItem("indiceGriffe"))
            addItem("indiceGriffe")
        },
        next: "fin"
      }
      ,
      miauled: {
        text: [
          "*Tu fixes ton nouvel ami escargot.*",
          "*Tu miaules doucement, avec un brin de respect.*"
        ],
        image: "escargot",
        options: [
          {
            text: "Demander comment battre Sale matou",
            next: "recolement",
            condition: ({ hasItem }) => hasItem("copainEscargot")
          },
          {
            text: "Parler de Copain",
            next: "revelation",
            condition: ({ hasItem }) => hasItem("copainEscargot")
          },

          { text: "Juste miauler comme ça", next: "inutile" }
        ]
      }
      ,

      fin: { end: true }
    }
  },
  salutCopainDehors: {
    start: "intro",
    nodes: {
      ...common_nodes,

      intro: {
        image: "chat",
        url: "https://preview.redd.it/black-cat-is-trying-to-win-me-over-by-sleeping-outside-my-v0-qss97evplwwc1.jpeg?auto=webp&s=1db809b5a5c396703e05d09f21903cd5f84ff2ed",
        text: [
          "*Copain est allongé, le ventre à l’air, devant un rayon de soleil.*",
          "*Il ne bouge pas. Il respire à peine. Peut-être qu’il médite.*",
          "*Ou qu’il digère.*"
        ],
        options: [
          {
            text: "Oh connard t'as chié dans mon coin ?",
            next: "represailles",
            condition: ({ hasItem }) => hasItem("vengeanceRequise")
          }, {
            text: "Penser a l'escargot",
            next: "soumission"
            , condition: ({ hasItem }) => hasItem("copainEscargot")
          },
          { text: "Degage connard", next: "grogne" },
          { text: "Faire Shhhh en herissant les poils", next: "tropLent" },
          { text: "Le laisser dormir", next: "fin" }
        ]
      },

      grogne: {
        url: "https://preview.redd.it/black-cat-is-trying-to-win-me-over-by-sleeping-outside-my-v0-qss97evplwwc1.jpeg?auto=webp&s=1db809b5a5c396703e05d09f21903cd5f84ff2ed",
        image: "chat",
        text: [
          "*Copain ouvre un œil.*",
          "**« Je t'emmerde.je bougerai pas. »**",
          "Va bouffer des cloportes ducon."
        ], effect: ({ addItem }) => {
          soundManager.play('miaou');
        },
        next: "intro"
      },

      tropLent: {
        image: "chat",
        url: 'https://thumbs.dreamstime.com/b/black-cat-lying-his-back-plaid-cute-black-cat-bombay-breed-spreading-its-paws-to-sides-black-cat-lying-his-back-132191511.jpg',
        text: [
          "*Copain se roule sur le dos.*",
          "T'as plus l'age de me courser vieux schnock",
          "Va plutot t'occuper de Sale matou, il est a la porte d'entree"
        ], effect: ({ addItem }) => {
          soundManager.play('miaou');
        },
        next: "intro"
      },
      represailles: {
        url: 'https://images.pond5.com/black-green-eyed-stray-cat-footage-098496913_iconl.jpeg',
        image: "chat",
        text: [
          "*Tu miaules avec intensité.*",
          "On avait dit chacun son coin, et toi c'est l'autre coté",
          "*Copain blêmit immédiatement.*",
          "**« Écoute... c’était urgent. Et ton coin est vraiment bien orienté soleil. »**",
          "*Il détourne les yeux.*",
          "**« D’accord d’accord, dis-moi ce que tu veux, Ezio. Je suis à ta merci... »**"
        ], effect: ({ addItem }) => {
          soundManager.play('pasContent');
        },
        options: [
          { text: "Lui pisser sur la gueule", next: "nimp" },
          { text: "Lui voler ses croquettes", next: "croquette" },
          {
            text: "Penser a l'escargot",
            next: "soumission"
            , condition: ({ hasItem }) => hasItem("copainEscargot")
          },
          { text: "Le regarder avec mépris", next: "ignore", condition: ({ hasItem }) => hasItem("copainEscargot") }
        ]
      },
      ignore: {
        image: "ezio",
        url: 'https://img.freepik.com/premium-photo/close-up-portrait-cat_1048944-10107901.jpg',
        text: [
          "*Tu ne dis rien. Tu ne fais rien.*",
          "*Ton silence est plus bruyant que n’importe quel miaulement.*",
          "**Copain baisse les yeux.**",
          "*Il saura. Il saura toujours.*",
          "Ah, et puis tu vas me jurer de plus jamais lecher l'escargot"
        ],
        next: "soumission"
      },
      croquette: {
        image: "chat", short: true,
        text: [
          "*Tu prends ses croquette.*",
          "**« Ah merde, mais c'est degueu en plus. »**",
          "*Comment t'arrive a bouffer ca.*"
        ], effect: ({ addItem }) => {
          soundManager.play('miam');
        },
        next: "degueu"
      },

      soumission: {
        url: 'https://thumbs.dreamstime.com/b/black-cat-lying-his-back-plaid-cute-black-cat-bombay-breed-spreading-its-paws-to-sides-black-cat-lying-his-back-132191511.jpg',
        image: "chat",
        text: [
          "J'ACCEPTE",
          "J'arrete mes conneries...",
          "Pour Glaire l'escargot, c'est d'accord aussi, j'essayerai plus de le bouffer, promis"
        ],
        effect: ({ addItem }) => {
          soundManager.play('miaou');
          addItem("promesseDeCopain");
        },
        next: "fin"
      },

      fin: {
        end: true
      }
    }
  }
  ,
  boiteARod:{
     start: "intro",
    nodes: {
      ...common_nodes,

      intro: {
        url:'https://www.zamnesia.fr/851-20045/boite-cachette-secrete-bois-feuille.jpg',
        image:'rod',
        options:[
          {text:"L'ouvrir avec la cle du bourdon", next:"ouvre"
            , condition:({ hasItem })=>hasItem('cleLaby')
          },
          {text:'Laisser', next:'fin'}
        ],
        next:'fin',
        text:["Une boite etrange, fermee par une clef"]
      }
      , ouvre:{
        text:["Tu trouves une herbe bizarre qui etait dans la boite,",
          "Tu la manges et tu hallucines"], next:"fin"
       , effect:({moveToZone})=>{
         moveToZone("labyrintheGPT", { x: 1, y: 2 })
       }
      }
    }
  },
  rodolphe: {
    start: "intro",
    nodes: {
      ...common_nodes,

      intro: {
        short:true,
        image:'rod',
        
       options:[
        {text:"Quoi tu veux savoir comment l'ouvrir ?", next:"ouEstLaClef"},
        {text:"Partir", next:"fin"},
        ],
        text:["Salut chat chat..."
          , "Surtout ne touche pas a ma <<Boite secrete>> dans le coffre"]
      }
      , ouEstLaClef:{
        text:["Je l'ai perdu dans le jardin, j'ai vu un gros bourdon l'emporter"
          , "Si je le chope, je l'ecrabouille"
        ],
        next:"fin"
      }
    }
  },
  surpriseJardin: {
    start: "intro",
    nodes: {
      ...common_nodes,

      intro: {
        image: "chat",
        url: 'https://media.istockphoto.com/id/1318290996/fr/photo/excr%C3%A9ments-de-wapiti-dans-la-for%C3%AAt-sur-lherbe-excr%C3%A9ments-dorignal-frais-excr%C3%A9ments-de.jpg?s=1024x1024&w=is&k=20&c=T5tXN-EJsG6dQjIG8y0AlPb4p9FGqciG9JikGQ_T5-Q=',
        text: [
          "*Ezio s’approche d’un coin discret du jardin...*",
          "*Son petit endroit secret. Son trône naturel.*",
          "*Il hume l’air... puis fronce les moustaches.*"
        ],
        next: "decouverte"
      },

      decouverte: {
        url: 'https://img.freepik.com/photos-gratuite/gros-plan-chat-noir-bouche-grande-ouverte_181624-15980.jpg?semt=ais_hybrid&w=740',
        image: "chat",
        text: [
          "**« Mais... c’est pas mon odeur ça. »**",
          "*Quelqu’un a osé souiller ses toilettes personnelles.*",
          "*Et ce quelqu’un... c’est Copain.*",
          "*C’est la guerre.*"
        ],
        effect: ({ addItem }) => {
          addItem("vengeanceRequise");
        },
        next: "fin"
      }
    }
  }
  ,
  saleMatouFinal: {
    start: "intro",
    miaulable: true,
    nodes: {
      ...common_nodes,

      intro: {
        image: "chat",
        url: "https://catinaflat.blog/wp-content/uploads/2023/06/aggressive-cat.jpg",
        text: [
          "*Un regard noir t’accueille.*",
          "*Une voix glaciale s’élève dans le jardin...*",
          "**« Tiens tiens tiens… Ezio. Enfin. »**",
          "**« Tu crois vraiment que tu peux m’affronter ? »**"
        ],
        effect: ({ quests }) => {
          soundManager.play('miaouMega');
        },
        options: [
          { text: "Ce territoire n'est pas le tien, degage", next: "checkArme" },
          { text: "Je suis un fou, moi, je te bute si tu pars pas", next: "checkArme" },
          { text: "Le regarder et partir", next: "inutile" }
        ]
      },



      checkArme: {
        url: 'https://previews.123rf.com/images/maryswift/maryswift2102/maryswift210200068/164501501-a-black-and-white-tuxedo-cat-with-its-left-ear-tipped-indicating-that-is-has-been-spayed-or.jpg',
        image: "ezio",
        effect: ({ quests }) => {
          soundManager.play('pasContent');
          quests.notifyDialogue("saleMatou_a_parle");
        },
        text: [
          "**« Combat de regards de 10 minutes. »**"
        ],
        options: [
          {
            text: "J'ai tout appris du Coleoptere sacré, tu es fini",
            next: "techniqueSacree",
            condition: ({ hasItem }) => hasItem("techniqueSacree")
          },
          {
            text: "Je suis equipé des griffes supremes",
            next: "griffes",
            condition: ({ hasItem }) => hasItem("armeChaton")
          },
          {
            text: "Je connais l'escargot",
            next: "escargot",
            condition: ({ hasItem }) => hasItem("copainEscargot")
          },
          { text: "Profiter qu'il regarde ailleurs pour partir digne", next: "fin" }
        ]
      },

      escargot: {
        url: 'https://media.istockphoto.com/id/1310147575/fr/photo/chat-f%C3%A2ch%C3%A9-avec-lexpression-malheureuse-se-trouvant-sur-le-rebord-de-fen%C3%AAtre-de-la-maison.jpg?s=612x612&w=0&k=20&c=ImzQgM3fHIDyuxyzyG6uFvzY9zS1OKKy1Z9O4lxZ9Hs=',
        image: "matou",
        text: [
          "Sale Matou blemit",
          "**« Il t'a parlé des GRIFFES SUPREMES ? »**",
          "**« Non, oublie ce que j'ai dit... Je m'en leche le cul que tu connaisses l'escargot »**"
        ],
        effect: ({ quests, addItem }) => {

          addItem('indiceGriffe')
        },
        next: "fin"
      },
      griffes: {
        url: 'https://media.istockphoto.com/id/1310147575/fr/photo/chat-f%C3%A2ch%C3%A9-avec-lexpression-malheureuse-se-trouvant-sur-le-rebord-de-fen%C3%AAtre-de-la-maison.jpg?s=612x612&w=0&k=20&c=ImzQgM3fHIDyuxyzyG6uFvzY9zS1OKKy1Z9O4lxZ9Hs=',
        image: "matou",
        text: [
          "**« Tu ne me fais pas peur. »**",
          "**« Tu es ignare, tu ne sais pas comment les utiliser »**",
          "**« Peut-être que… le Coléoptère Sacré t’apprendra deux ou trois trucs. »**"
        ],
        effect: ({ quests }) => {
          quests.notifyDialogue("saleMatou_reflexion");
        },
        next: "fin"
      },

      techniqueSacree: {
        image: "matou",
        url: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgPjJVsTPRtCZPQAtG4VgUKbqyd2sT7SnCSkcK46OVpUVdXQ740sLIQiiOVspuXeShytAMMI_TzPsXwSUtYgo9NtBHebtbBjlmqYm9WUsCa99G0sbDihK6LkLsBEfrv9imOR9jWavlT9pM/s1600/blacksad.jpg',
        text: [
          "*Un silence tombe.*",
          "*Sale Matou recule légèrement.*",
          "**« ...Tu as parlé au Coléoptère. »**",
          "**« Très bien. Tu as peut-être une chance, finalement. »**",
          "**« Approche. Qu’on règle ça. Une bonne fois pour toutes. »**"
        ],
        effect: ({ quests }) => {
          quests.advanceQuest("SaleMatou", 10); // combat final prêt
        },
        next: "combatFinal"
      },

      combatFinal: {
        image: "matou",
        url: 'https://i.ytimg.com/vi/CTDelbaFkPc/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLATKmY3UarTWsbTu7QgyNII_PKX9Q'
        , text: [
          "Ahhh NOOON, pas la technique du montrage de cul avec butt-plug",
          "**« Aucun felin digne de ce nom ne peut rester devant ce spectacle. »**",
          "Sale Matou repart... FIN DU JEU"
        ],
        effect: ({ CATManager }) => {
          CATManager.disableDialog('saleMatouFinal');
          CATManager.removeEntity('saleMatou', '16,0');
          setTimeout(()=>{CATManager.endGame()},2000);
        },
        next: "fin"
      },
      miauled: {
        image: "matou",
        text: [
          "*Sale Matou te toise.*",
          "**« Un miaulement de guerre ? Très félin de ta part. »**",
          "*Mais il ne bouge pas.*"
        ],
        next: "checkArme"
      },

      fin: {
        end: true
      }
    }
  }
  ,
  bordelCave: {
    start: "intro",
    nodes: {
      ...common_nodes,

      intro: {
        image: "interdit",
        url: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhtAaFU6FSsLiVCPMQYJx76kQj6MjwKKASc-aIZltmBLsilmzIi8XlVm2YmOO9KUL93FyPJ0Mb0TjL7YcnhlW3SBh0dUTCBbmuDd0yso2h7fERW2xKIVjXUv8DKooJus5E1cQJVXGzFUoM/w1200-h630-p-k-no-nu/IMG_6354.JPG",
        text: [
          "La cave est bordelique",
          "Peut-etre y a-t-il quelque chose d'utile ici"
        ],
        options: [
          { text: "Grignoter des cloportes", next: "degueu" },
          { text: "Pisser sur le bois", next: "nimp" },
          { text: "Fouiller le tas de bois", next: "aie" },
          { text: "Partir", next: "fin" }
        ]
      },

    }
  }

  , missionPapa: {
    start: "entree",
    nodes: {
      entree: {
        image: "chat",
        url: 'https://www.concept-usine.com/cdn/shop/articles/Grand-salon-design.jpg?v=1639580334',
        text: [
          "*Tu poses une patte sur le parquet du salon...*",
          "*Une odeur de câble chauffé et de café froid plane dans l’air.*",
          "Papa est là. Concentré. Son écran brille de mille fenêtres stressantes.",
          "La **porte-fenêtre est fermée**. Et toi, tu veux sortir."
        ],
        next: "observation"
      },

      observation: {
        image: "chat",
        url: 'https://www.shutterstock.com/image-photo/cute-cat-misses-owner-looks-600nw-1755361499.jpg',
        text: [
          "*Tu fixes la poignée. Puis papa. Puis la poignée.*",
          "*Il suffit d’une chose... une distraction, un événement, un chaos maîtrisé...*",
          "Il faut trouver **comment détourner son attention.**"
        ],
        effect: ({ quests }) => {
          quests?.startQuest?.("papaOuvre");
        },
        next: "fin"
      },

      fin: {
        text: ["*Mission : Ouvrir cette foutue porte.*"],
        end: true
      }
    }
  }
  , missionPlacard: {
    start: "entree",
    nodes: {
      entree: {
        image: "chat",
        url: "https://fr.cats.com/wp-content/uploads/2024/05/Wet-vs-Dry-Cat-Food-1-540x360.jpg",
        text: [
          "*Tu descends l’escalier, silencieux comme un ninja affamé...*",
          "*L’air change. Il est plus dense. Plus... savoureux.*",
          "**Tu sens des relents de thon, de croquettes oubliées, et de ragoût de la veille.**",
          "*Ton ventre fait un petit bruit de plainte.*"
        ],
        next: "cuisine"
      },

      cuisine: {
        image: "chat",
        url: "https://caats.co/wp-content/uploads/2022/02/recettes-pour-chat-1150x862.jpg.webphttps://c8.alamy.com/compfr/2hfcpw6/le-chat-est-le-cuisinier-dans-la-cuisine-le-chat-domestique-prepare-la-nourriture-a-l-interieur-2hfcpw6.jpg",
        text: [
          "*Y a pas a chier il faut bouffer*",
        ], short: true,
        effect: ({ quests }) => {
          quests?.startQuest?.("mysterePlacard");
          soundManager.play('miam');
        },
        next: "fin"
      },

      fin: {
        text: ["*Mission : Mystère au placard.*"],
        end: true
      }
    }
  }

  , missionPrincipale: {
    start: "intro",
    nodes: {
      ...common_nodes,
      intro: {
        text: [
          "*Tu ouvres un œil paresseux...*",
          "Un rayon de soleil caresse ta fourrure soyeuse.",
          "*Tu es Ezio, le chat légendaire.*"
        ],
        image: 'chat',
        url: 'https://previews.123rf.com/images/maryswift/maryswift2102/maryswift210200068/164501501-a-black-and-white-tuxedo-cat-with-its-left-ear-tipped-indicating-that-is-has-been-spayed-or.jpg',
        next: "regarder"
      },

      regarder: {
        image: 'ouhla',
        url: 'https://static.wixstatic.com/media/58961e_ac52e764c7904b7da50357751b7add19~mv2.jpg/v1/fill/w_2500,h_1455,al_c/58961e_ac52e764c7904b7da50357751b7add19~mv2.jpg',
        text: [
          "*Tu regardes dans le jardin...*",
          "🤬 Non... Ça ne peut pas être lui...",
          "**Sale Matou** est là. Posé. Tranquille. SUR TON MURET FAVORI."
        ],
        next: "mission"
      },

      mission: {
        image: 'chat',
        text: [
          "*Trop c’est trop.*",
          "Il est temps de chasser l’intrus.",
          "Mais d’abord...",
          "**Il va falloir sortir de la maison.**",
          "-- Touches clavier classiques, fleches ou ASWD, Espace ou Entree pour valider ou actionner --"
        ],
        effect: ({ quests }) => {
          quests?.startQuest?.("QuetePrincipale");
        },
        next: "fin"
      }
    }
  },
  missionSaleMatou: {
    start: "intro",
    nodes: {
      ...common_nodes,

      intro: {
        url: 'https://static.wixstatic.com/media/58961e_ac52e764c7904b7da50357751b7add19~mv2.jpg/v1/fill/w_2500,h_1455,al_c/58961e_ac52e764c7904b7da50357751b7add19~mv2.jpg',
        image: 'interdit',

        text: [
          "*Le jardin.*",
          "*Ton royaume. Ton territoire sacré.*",
          "La mission est claire",
          "* Degagez Sale Matou d'ici *"
        ],
        options: [
          { text: "Affronter mon nemesis", next: "fin" },
          { text: "Faire demi-tour (C'est ce que ferait Copain.)", next: "non" },
        ]
        , effect: ({ quests }) => {
          quests?.startQuest?.("SaleMatou");
        }
      },

      non: {
        image: 'interdit',
        text: [
          "*...Tu n’es pas ce genre de chat.*",
          "*Pas aujourd’hui.*"
        ],
        next: "nimp"
      },

    }
  }

};
