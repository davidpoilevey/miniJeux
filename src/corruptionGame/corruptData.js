// game-data.js
import imgNego1 from './images/nego.png';
import imgNego2 from './images/nego2.png';
import imgNego3 from './images/nego3.png';
import imgNego4 from './images/nego4.png';
import imgNegoAnal from './images/negoAnal.png';
import imgNegoExcite from './images/negoExcite.png';
import imgNegoFin from './images/negoFin.png';
import imgNegoOrgie from './images/negoOrgie.png';
import imgOrc1 from './images/orc1.png';
import imgOrc2 from './images/orc2.png';
import imgOrc3 from './images/orc3.png';
import imgOrc4 from './images/orc4.png';
import imgOrcFin from './images/orcFin.png';
import imgOrcFinBaise from './images/orcFinBaise.png';
import imgOrcProvoc from './images/orcProvoc.png';
import imgCultAnal from './images/centAnal.png';
import imgCultBrochette from './images/centBrochette.png';
import imgCultChamber from './images/cultChamber.png';
import imgCultInsect from './images/cultInsect.png';
import imgCultOrgie from './images/centOrgie.png';
import conduit1 from './images/conduit1.png';
import conduit2 from './images/conduit2.png';
import imgLabo from './images/labo.png';
import imgFMVert from './images/fmVert.png';
import imgFMJaune from './images/fmJaune.png';
import imgFMRouge from './images/fmRouge.png';
import imgFMEnd from './images/fmEnd.png';
import imgMimic from './images/mimic.png';
import imgMimic2 from './images/mimic2.png';
import imgMimicEnd from './images/mimicEnd.png';

import imgGolem from './images/golem.png';
import imgGolemBande from './images/golemBande.png';
import imgGolemFuck from './images/golemFuck.png';
import imgGolemRemplit from './images/golemRemplit.png';
import imgSexDoll from './images/sexDoll.png';
import imgSexDoll2 from './images/sexDoll2.png';
import imgSexDollGolem from './images/sexDollGolem.png';
import imgSexDollPipe from './images/sexDollPipe.png';


const cultChoices=[
      { text: "Encourager les adeptes a etre plus cruel",category:'excitation', action:"GAIN_EXCITATION",payload:11 },
       { text: "Choisir une autre torture", target: 'cultChoix', category:'discussion' },
      { text: "Demander a prendre sa place", action: 'FIN_JEU', payload:'labo', category:'pervers'
        ,disabled:stats=>(stats.corruption<99 || stats.excitation<80) },
    ]


export const gameData = {
  // Le point de départ
  'Introduction': {
    description: "Je suis Sofie. Archimage de tres haut niveau, Duchesse de je-ne-sais-plus-où, et tout le tralala. J'ai vaincu des dragons avant le petit-déjeuner. J'ai conseillé des rois qui, franchement, volaient pas très haut. Je suis riche, crainte, respectée. \n\n... Et je m'emmerde. \n\nLa puissance pure est d'un ennui mortel. Le respect des laquais est... collant. Il n'y a plus de *frisson*. \n\nAlors me voilà, devant ce trou à rats. 'Le Donjon du Vice Murmurant'. Un niveau 10, pathétique. Je ne cherche ni or, ni gloire. Je cherche ce que la 'bonne société' m'interdit : le frisson. La crasse. La *corruption*. \n\nOn dit que ce lieu change les gens. J'ai bien l'intention de voir à quel point. Je veux me sentir vivante, même si pour ça, je dois me fourrer dans le pire guêpier possible.",
    image: "https://photos.xgroovy.com/contents/albums/sources/352000/352072/349409.jpg", // Une image de sorcière puissante et arrogante
    choices: [
      { text: "Descendre dans le trou à rats...", target: 'EntreeGrotte', category:'discussion' }
      
    ]
  },
  // game-data.js (à la toute fin)

  'finalScene': {
    // Cette fonction sera appelée par votre composant React
    // Elle lit l'état du jeu pour afficher la bonne fin
    getDescription: (stats) => {
      let fin = "J'étais venue chercher un frisson. J'ai trouvé... bien plus.\n\n";
      
      switch (stats.final) {
        case 'tentacule':
          fin += "J'ai trouvé un nouveau hobby, desormais je sers de producteur a cyprine et incubateur de larves pour mon tentaculax adoré...";
          break;
        case 'gobelin':
          fin += "J'ai trouvé un peuple. Une horde grouillante et vicieuse qui ne vit que pour me faire subir leur moindres caprices. Je suis leur Pute, leur Salope, leur vide-couille, leur Déesse. C'est un rôle... que je vais grandement apprécier.";
          break;
        case 'orc':
          fin += "J'ai trouvé la vraie domination. Ces brutes ne respectent que la force et le vice. Je leur ai montré les deux. Ils ne savent pas s'ils doivent me craindre, me vénérer ou me... prendre et me violer. Ils feront tout en même temps.";
          break;
        case 'culte':
          fin += "J'ai trouvé ma vocation. Le culte était amateur, je l'ai rendu professionnel. Je suis leur Grande Prêtresse. Les rituels vont devenir... mémorables. L'ennui n'est plus qu'un lointain souvenir.";
          break;
        case 'labo':
          fin += "Ce labo est une pure folie. Je me suis laissé piegée comme une noob, mais je ne regrette pas... Je n'ai jamais autant joui de ma vie";
          break;
        default:
          fin += "J'ai quitté ce trou pathétique. C'était... distrayant. Mais rien d'assez *sale* pour vraiment me retenir. L'ennui est de retour. Il faudra trouver autre chose...";
      }
      
      fin += "\n\nFIN ?";
      return fin;
    },
    image: "https://preview.redd.it/a-good-fuck-toy-getting-gang-raped-and-pumped-full-of-v0-93zqn3klcjoc1.jpeg?auto=webp&s=64a275e720009cd2cfac4077e7c9dec80d559f4a", // Une image de Sofie, puissante, yeux brillants de corruption
    choices: [
      { text: "Recommencer (Nouvelle Partie+ ?)", target: 'Introduction' } // Boucle de jeu
    ]
  }
,
  'EntreeGrotte': {
    description: "Vous êtes à l'entrée d'une grotte humide. L'air est chargé d'une odeur musquée. Un faible gémissement vient de l'Est.",
    image:"https://thumbs.dreamstime.com/b/%C3%A0-l-int%C3%A9rieur-de-la-grotte-humide-gouttes-d-eau-coulent-des-pierres-entr%C3%A9e-mi-tir-271572610.jpg",
    choices: [
      { text: "Aller vers l'Est (vers le gémissement)", target: 'SalleTentacule' , category:'discussion'},
      { text: "Examiner les environs", target: 'EntreeGrotteExamine' },
      { text: "Méditer (Régénérer Mana)", action: 'REGEN_MANA',payload:10, category:'soin'
        , disabled:stats=>stats.mana>=100 }
    ]
  },
  
  'EntreeGrotteExamine': {
    description: "Vous trouvez une rune étrange gravée dans la roche. Elle pulse d'une énergie... suggestive.",
   image:"https://static.vecteezy.com/system/resources/previews/055/542/716/non_2x/glowing-rune-stone-with-engraved-fire-symbol-isolated-on-transparent-background-png.png",
    choices: [
      { text: "La toucher (Dépense 10 Mana)", action: 'TOUCH_RUNE' , category:'soin', payload:10, disabled:stats=>stats.mana<10},
      { text: "L'ignorer et revenir", target: 'EntreeGrotte', category:'discussion' }
    ]
  },
  
  'SalleTentacule': {
    description: "La salle est sombre. Au centre, une créature (Niv 12) palpite. Elle semble vous avoir sentie. Elle dresse un appendice dans votre direction.",
    image:"https://www.shutterstock.com/image-illustration/set-black-octopus-tentacles-isolated-260nw-2468385621.jpg",
    // Les choix sont dynamiques !
    getChoices: (stats) => {
      let choices = [
        { text: "Lancer Boule de Feu (Coûte 30 Mana)", action: 'COMBAT_FEU', category:'combat',disabled:stats=>stats.mana<30, payload:{mana:30, target:"grotte_est"} },
        { text: "Fuir", target: 'EntreeGrotte' , category:'discussion' },
        { 
          text: "Se rapprocher lentement...", 
          target: 'Scene_Tentacule_01' // On lance la scène porno
        }
      ];
      
      // C'EST ICI LA MAGIE !
      // Si votre 'corruption' est assez haute, vous voyez des choix secrets.
      if (stats.corruption > 10) {
        choices.push({ 
          text: "[Pervers] Se mettre seins nus...", category:'pervers' , 
          target: 'Scene_Tentacule_02' // On lance la scène porno 2
        });
      }
      return choices;
    }
  },
  
  // VOTRE SCÈNE PORNO
  'Scene_Tentacule_01': {
    // C'est ici que vous écrivez VOTRE texte
    description: "Vous baissez votre garde. La créature etend un tentacule visqueux dans votre direction. C'est à la fois dégoûtant et... excitant.",
    image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRACP4JoXHJzdwhscrtJkuqIn7IhRO0zmwfaw&s",
    // La scène elle-même a des choix
    getChoices: (stats) => {
      let choices = [
      { text: "Laisser faire (Gagne +20 Excitation)", action: 'GAIN_EXCITATION', payload: 20 , category:'excitation' },
      { text: "C'est degueu... Boule de Feu !", disabled: stats=>stats.mana<30, action: 'COMBAT_FEU', payload:{mana:30, target:"grotte_est"} , category:'combat'  },
      { text: "Arrêter et fuir cette grotte de fou", target: 'EntreeGrotte' }
    ];
    if(stats.excitation>20)
         choices.push({ 
          text: "Reprendre mes esprits et ma route", action:"LUCIDITE", 
          target: 'grotte_est' // suite de l'aventure
        });
    if(stats.excitation>40)
         choices.push({ 
          text: "[Pervers] Me mettre seins nus...", category:'pervers' , 
          target: 'Scene_Tentacule_02' // On lance la scène porno 2
        });
    if(stats.excitation>80)
         choices.push({ 
          text: "[Pervers] Enlever ma culotte...", category:'pervers' , 
          target: 'Scene_Tentacule_03' // On lance la scène porno 2
        });

      return choices;
    },
    // À chaque visite de scène, les stats changent
    onEnter: { 
      type: 'GAIN_CORRUPTION', 
      payload: 1 
    } // Gagner de la "Corruption XP"
  },
  'Scene_Tentacule_02': {
    // C'est ici que vous écrivez VOTRE texte
    description: "Un frisson vous parcourt le bas-ventre. Un long pedoncule visqueux remonte sur vos seins et commence a les malaxer dans un mucus gluant",
    image:"https://i.mylust.com/videos_screenshots/115000/115363/preview.mp4.jpg",
    // La scène elle-même a des choix
    getChoices: (stats) => {
      let choices = [
      { text: "Laisser faire (Gagne +20 Excitation)", action: 'GAIN_EXCITATION', payload: 20, category:'excitation' },
      { text: "C'est degueu... Boule de Feu !", disabled: stats=>stats.mana<30, action: 'COMBAT_FEU', payload:{mana:30, target:"grotte_est"} , category:'combat' },
      
    ];
    if(stats.excitation>60)
         choices.push({ 
          text: "[Pervers] Ecarter mes cuisses.", category:'pervers' , 
          target: 'Scene_Tentacule_03' // On lance la scène porno 2
        });
    if(stats.excitation>20)
         choices.push({ 
          text: "Reprendre mes esprits et ma route", action:"LUCIDITE", category:'discussion', 
          target: 'grotte_est' // suite de l'aventure
        });

      return choices;
    },
    // À chaque visite de scène, les stats changent
    onEnter: { 
      type: 'GAIN_CORRUPTION', 
      payload: 5 
    } // Gagner de la "Corruption XP"
  }
,
  'Scene_Tentacule_03': {
    // vaginal
    description: "Le plus gros tentacule prend possession de votre chatte et investit vos replis intimes. La sensation est glacante mais aussi perversement excitante",
    image:"https://www.naughtyhentai.com/wp-content/uploads/tubeace-thumbs/57//857_1.jpg",
    // La scène elle-même a des choix
    getChoices: (stats) => {
      let choices = [
      { text: "Laisser faire (Gagne +20 Excitation)", action: 'GAIN_EXCITATION', payload: 20 , category:'excitation'},
      { text: "C'est degueu... Boule de Feu !", disabled: stats=>stats.mana<30, action: 'COMBAT_FEU', payload:{mana:30, target:"grotte_est"}  , category:'combat'},
     
    ];
    if (stats.corruption > 50) {
        choices.push({ 
          text: "[Pervers] Se pencher pour exposer son trou du cul...", category:'pervers', 
          target: 'Scene_Tentacule_04' // On lance la scène porno 2
        });
      }
      else if(stats.excitation>50)
        choices.push({ 
          text: "[Pervers] Pour aller plus loin, augmentez votre score de Corruption...", category:'pervers', 
          disabled:()=>true,
          target: 'Scene_Tentacule_04' // On lance la scène porno 2
        });
      
    if(stats.excitation>20)
         choices.push({ 
          text: "Reprendre mes esprits et ma route", action:"LUCIDITE", category:'discussion', 
          target: 'grotte_est' // suite de l'aventure
        });

      return choices;
    },
    // À chaque visite de scène, les stats changent
    onEnter: { 
      type: 'GAIN_CORRUPTION', 
      payload: 10 
    } // Gagner de la "Corruption XP"
  },
  'Scene_Tentacule_04': {
    // anal
    description: "Un autre tentacule glisse le long de votre anus, il force le passage, il est difficile de resister",
    image:"https://hentaihorror.com/wp-content/uploads/2018/04/tentacle-hentai-horrorporn-pinup-tentaclerape.jpg",
    // La scène elle-même a des choix
    getChoices: (stats) => {
      let choices = [
      { text: "Laisser faire (Gagne +20 Excitation)", action: 'GAIN_EXCITATION', payload: 20, category:'excitation' },
      { text: "C'est degueu... Boule de Feu !", disabled: stats=>stats.mana<30, action: 'COMBAT_FEU', payload:{mana:30, target:"grotte_est"}, category:'combat'  },
       {text:"Me laisser corrompre un peu plus (change Excitation en Corruption. 35 mana)"
        , disabled:stats=>stats.excitation<50, action:'SELF_CORRUPT', payload:35, category:'corruption'
      },
      { text: "Arrêter et fuir.. Mais qui y croit encore", target: 'EntreeGrotte' }
      
    ];
    if (stats.corruption > 80) {
        choices.push({ 
          text: "[Pervers] Donner full controle a la creature...", category:'pervers', 
          target: 'Scene_Tentacule_05' // On lance la scène porno 5
        });
      }
      else
        choices.push({ 
          text: "[Pervers] Pour aller plus loin, augmentez votre score de Corruption...", 
          disabled:()=>true, category:'pervers',
          target: 'Scene_Tentacule_04' // On lance la scène porno 2
        });
      
    if(stats.excitation>20)
         choices.push({ 
          text: "Reprendre mes esprits et ma route", action:"LUCIDITE", category:'discussion', 
          target: 'grotte_est' // suite de l'aventure
        });

      return choices;
    },
    // À chaque visite de scène, les stats changent
    onEnter: { 
      type: 'GAIN_CORRUPTION', 
      payload: 10 
    } // Gagner de la "Corruption XP"
  }
  ,'Scene_Tentacule_05': {
    // destroy
    description: "Le Tentaculax investit tous vos orifices, la stimulation est totale et vous emporte dans une frenesie d'orgasmes a repetition",
    image:"https://cdn.hentaigifz.com/70794/hentai-tentacle-penetration-all-the-way-through-game.gif",
    // La scène elle-même a des choix
    getChoices: (stats) => {
      let choices = [
      { text: "Laisser faire (Gagne +20 Excitation)", action: 'GAIN_EXCITATION', payload: 20, category:'excitation' },
      { text: "C'est degueu... Boule de Feu !", disabled: stats=>stats.mana<30, action: 'COMBAT_FEU', payload:{mana:30, target:"grotte_est"}, category:'combat'  },
      {text:"Me laisser corrompre un peu plus (change Excitation en Corruption. 25 mana)"
        , disabled:stats=>stats.excitation<50, action:'SELF_CORRUPT', payload:25, category:'corruption'
      },
      { text: "Arrêter et fuir.. Non, impossible maintenant", disabled:()=>true, target: 'EntreeGrotte' }
    ];
    if (stats.corruption >= 100) {
        choices.push({ 
          text: "[Pervers] S'abandonner pour toujours", category:'pervers', 
          target: 'Scene_Tentacule_Final' // On lance la scène porno 5
        });
      }
      else
        choices.push({ 
          text: "[Pervers] Pour aller plus loin, augmentez votre score de Corruption...",  category:'pervers', 
          disabled:()=>true,
          target: 'Scene_Tentacule_04' // On lance la scène porno 2
        });
      
    if(stats.excitation>20)
         choices.push({ 
          text: "Reprendre mes esprits et ma route", action:"PERTE_TEMPS",  category:'discussion', 
          target: 'grotte_est' // suite de l'aventure
        });

      return choices;
    },
    // À chaque visite de scène, les stats changent
    onEnter: { 
      type: 'GAIN_CORRUPTION', 
      payload: 10 
    } // Gagner de la "Corruption XP"
  }
  ,'Scene_Tentacule_Final': {
    // destroy
    description: "Vous vous abandonnez completement a la creature, celle-ci vous penetre inlassablement pendant des heures, vous n'avez plus aucune volonté. Il finit par vous emmener dans le nid ou il collectionne ses trophées, des femmes y jouissent depuis des annees.. Vous avez trouvé votre bonheur",
    image:"https://picsxxxporn.com/wp-content/uploads/2016/11/Cum-Hentai-Tentacle-Impregnation.jpg",
    // La scène elle-même a des choix
    getChoices: (stats) => {
      let choices = [
      { text: "Jouir encore et encore", action: 'FIN_JEU', payload: 'tentacule' , category:'corruption'},
      { text: "Non je veux pas finir comme ca... Boule de Feu !", disabled: stats=>stats.mana<30, action: 'COMBAT_FEU', payload:{mana:30, target:"grotte_est"} , category:'combat',  },
     ];
     
      return choices;
    },
    // À chaque visite de scène, les stats changent
    onEnter: { 
      type: 'GAIN_CORRUPTION', 
      payload: 10 
    } // Gagner de la "Corruption XP"
  }

   ,'grotte_est': {
    description: "Vous quittez avec regret le Tentaculax et continuez votre route. Vous arrivez a un embranchement. La route du Nord est vaguement eclairee au fond. L'odeur caracteristique vous apprend que des gobelins ont etabli un campement par la. La route du Sud est barrée d'un ecriteau 'Attention aux orcs'. ",
    image:"https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1b/56/26/0b/la-grotte-de-seythenex.jpg?w=1200&h=-1&s=1",
    choices: [
      { text: "Aller vers le Nord", target: 'CouloirNord_01' , category:'discussion'},
      { text: "Aller vers le Sud", target: 'couloirOrc'  , category:'discussion'},
      { text: "Retourner voir le tentaculax", target: 'SalleTentacule'  , category:'discussion'},
     
      { text: "Méditer (Régénérer Mana)", action: 'REGEN_MANA',payload:10 , category:'soin', disabled:stats=>stats.mana>=100 }
    ]
   , onEnter: { 
      type: 'GAIN_EXCITATION', 
      payload: -25 
    }
  },
  // Zone NORD, les Gobelins
  // game-data.js (vos nouvelles salles)

  // Modifiez 'grotte_est' pour pointer ici
  // { text: "Aller vers le Nord", target: 'CouloirNord_01' },

  'CouloirNord_01': {
    description: "Le tunnel vers le Nord est étroit et sent le moisi et... autre chose. Une puanteur musquée. Des champignons luminescents éclairent faiblement les parois. Vous remarquez un petit objet brillant à moitié enfoui dans la boue. En le degageant, vous trouvez aussi une Rune d'excitation",
    image: "https://static.vecteezy.com/ti/photos-gratuite/t2/10377367-dramatique-lumiere-dans-l-obscurite-grotte-paysage-mysterieux-et-surrealiste-art-numerique-gratuit-photo.jpg", // Une image de couloir de grotte sombre
    choices: [
      { text: "Examiner l'objet brillant", target: 'CouloirNord_Objet' },
       { text: "Toucher la rune (Dépense 20 Mana)", action: 'TOUCH_RUNE'  , category:'soin',disabled: stats=>stats.mana<20, payload:20},
      { text: "Continuer, c'est sûrement un déchet de gobelin", target: 'salleGobelins_Entree' , category:'discussion' },
    ]
  },

  'CouloirNord_Objet': {
    description: "Vous vous baissez. Avec un [Sort de Lévitation] mineur, vous sortez l'objet de la boue. C'est un petit miroir en argent, manifestement volé. Le dos est gravé d'un symbole de noble déchu. En vous regardant dedans, vous trouvez que votre teint est parfait, malgré les circonstances.",
    image: "https://st.depositphotos.com/1676881/1215/i/450/depositphotos_12157333-stock-photo-hand-mirror.jpg", // Image d'un miroir de poche orné
    // Cette salle est une "impasse" narrative, elle donne juste du lore.
    // L'action 'GAIN_CORRUPTION' est un exemple, vous pouvez la changer en 'GAIN_ITEM' si vous gérez un inventaire
    onEnter: { type: 'GAIN_CORRUPTION', payload: 1 }, // (Petite vanité = +1 Corruption)
    choices: [
      { text: "Garder le miroir (Joli !)", target: 'salleGobelins_Entree', action:'GAIN_CORRUPTION', payload:5 },
      { text: "Le jeter (Inutile)", target: 'salleGobelins_Entree' },
        { text: "Toucher la rune (Dépense 10 Mana, c'est moins cher avec le miroir)" , category:'soin', action: 'TOUCH_RUNE',disabled: stats=>stats.mana<20, payload:10 }
    ]
  },

  'salleGobelins_Entree': {
    description: "Vous débouchez dans une large caverne puante. C'est le campement. Une vingtaine de Goblins vous repèrent instantanément. Ils glapissent et lèvent leurs armes rouillées. Un 'chef', portant un casque de cuisine cabossé, s'avance.",
    image: "https://www.belloflostsouls.net/wp-content/uploads/2021/10/goblins-4e.jpg", // Image d'un camp gobelin
    getChoices: (stats) => {
      let choices = [
        { text: "Tenter de négocier. ('Je viens en paix !')", target: 'Gobelins_Negociation_01' },
        { text: "[Sort] Boule de Feu (Coûte 30 Mana). Terminé." , category:'combat', action: 'COMBAT_FEU',  payload:{mana:30, target:"Gobelins_Massacre"}
        , disabled: stats=>stats.mana<30 }
      ];
      
      // La magie de la Corruption !
      if (stats.excitation > 20) {
        choices.push({ 
          text: "[RUSE] Epargnez-moi, je ferai ce que vous voudrez" , category:'pervers', 
          target: 'Gobelins_Negociation_Perverse' 
        });
      }
      return choices;
    }
  },

  'Gobelins_Massacre': {
    description: "Vous levez la main. Une sphère de feu orange illumine la grotte. Les cris s'arrêtent net. L'odeur de cochon grillé remplace la puanteur. La voie est libre... mais c'était un peu facile, non ?",
   image:"https://wiki.kigard.fr/_media/images/boule_de_feu_2_.jpeg?w=400&tok=3581c3",
    choices: [
      { text: "Inspecter le campement... Mais bon j'etais pas la pour ca.", target: 'Gobelins_MassacreSuite' } // Ou une autre salle
      , { text: "Revenir sur ses pas... Quelle déception.", target: 'grotte_est', action:"PERTE_TEMPS" , category:'discussion' } 
       , { text: "Revenir voir le tentaculax...", target: 'SalleTentacule', action:"PERTE_TEMPS" , category:'discussion' } 
       , { text: "Aller vers la route des Orcs", target: 'couloirOrc' , category:'discussion' } 
    ]
  },
  'Gobelins_MassacreSuite': {
    description: "Vous trouvez 2 fruits pourris, un baton et 2 pierres... Ah, et aussi une chevre a l'anus defoncé.. Dire que ca aurait pu etre vous",
   image:'https://i.servimg.com/u/f89/13/99/08/56/tm/dsc_0010.jpg',
    choices: [
       { text: "Revenir sur ses pas... Quelle déception.", target: 'grotte_est', action:"PERTE_TEMPS" , category:'discussion' } 
       , { text: "Revenir voir le tentaculax...", target: 'SalleTentacule', action:"PERTE_TEMPS"  , category:'discussion'} 
       , { text: "Aller sur la route des Orcs", target: 'couloirOrc' , category:'discussion' } 
    ]
  },

  'Gobelins_Negociation_01': {
    description: "Le chef plisse ses petits yeux. 'Paix ? Femme venir en paix ? Femme mentir ! Nous prendre femme !'",
   image:"https://himg.nl/images/hh/goblin-no-suana-1-eng/poster.jpg",
    choices: [
      { text: "Tenter de les impressionner (Montrer un sort)", target: 'Gobelins_Negociation_Magie' },
      { text: "[Pervers] 'Oh, vous voulez me *prendre* ?'", target: 'Gobelins_Negociation_Perverse'  , category:'pervers'},
      { text: "Bon, ok. [Sort] Boule de Feu (30 Mana)", action: 'COMBAT_FEU' , category:'combat',  payload:{mana:30, target:"Gobelins_Massacre"}, disabled: stats=>stats.mana<30 }
    ]
  },
  
  'Gobelins_Negociation_Magie': {
    description: " Vous lancez un sort d'illumination, ca devrait suffire a impressionner ces pequenots'",
   image:"https://gelbooru.com/thumbnails/97/e7/thumbnail_97e7ce79bbd4996437ab8e2e450733cb.jpg",
    choices: [
       { text: "[Pervers] Bon alors... vous voulez me *prendre* maintenant ?'", target: 'Gobelins_Negociation_Perverse' , category:'pervers' },
      { text: "Bande de loser, vous me faites perdre mon temps.\n [Sort] Boule de Feu (30 Mana)", action: 'COMBAT_FEU' , category:'combat',  payload:{mana:30, target:"Gobelins_Massacre"}, disabled: stats=>stats.mana<30 }
    ]
  },
  // C'est le point d'entrée pour la scène que VOUS écrirez
  'Gobelins_Negociation_Perverse': {
    description: "Vous laissez tomber vos vetements et feignez d'etre une pauvre noob de niveau 2. Les gobelins ricanent et s'approchent. Certains se masturbent deja",
    image: imgNego1, // Image suggestive, floue
    onEnter: { type: 'GAIN_EXCITATION', payload: 10 },
    
    getChoices: (stats) => {
      let choices = [
      { text: "Si vous voulez vous amuser, je suis d'accord, mais un a la fois !"
        , target: 'Scene_Gobelins_Orgie_01' , category:'excitation' },
    ];
      
      // La magie de la Corruption !
      if (stats.excitation > 20) {
        choices.push( 
      { text: "Je serai votre esclave sexuelle, pitié, laissez-moi sauve"
        , action:"GAIN_CORRUPTION", payload:2 , category:'pervers'
        , target: 'Scene_Gobelins_Orgie_01' });
      }
      return choices;
    }
  },
   'Scene_Gobelins_Orgie_01': {
    description: "Le plus gros, sans doute le chef, se jette le premier sur vous et vous viole",
    image: imgNego2, // Image suggestive, floue
    onEnter: { type: 'GAIN_EXCITATION', payload: 10 },
    
    getChoices: (stats) => {
      let choices = [
      { text: "Oh merde, c'est trop bon... Le laisser me violer" , category:'excitation'
        , action: 'GAIN_EXCITATION', payload: 10 },
        
        {text:"Me laisser corrompre un peu plus (change Excitation en Corruption. 30 mana)" , category:'corruption'
        , disabled:stats=>stats.excitation<50||stats.mana<30, action:'SELF_CORRUPT', payload:30
      },
      { text: "Ils s'y prend comme un manche, y en a marre, Boule de Feu !" , category:'combat', disabled: stats=>stats.mana<30, action: 'COMBAT_FEU'
        , payload:{mana:30, target:"Gobelins_Massacre"}  },
   
    ];
      
      // La magie de la Corruption !
      if (stats.excitation > 30) {
        choices.push( 
      { text: "Tu peux me la mettre dans le cul aussi si tu veux.", category:'excitation'
        , action:"GAIN_EXCITATION", payload:10
        , target: 'Scene_Gobelins_Orgie_02' });
      }
      if (stats.excitation > 70) {
        choices.push( 
      { text: "Non.. Pas dans le cul ! Je suis vierge de ce coté !"
        , action:"GAIN_CORRUPTION", payload:10, category:'pervers'
        , target: 'Scene_Gobelins_Orgie_02' });
      }
      return choices;
    }
  }
  ,  'Scene_Gobelins_Orgie_02': { // anal
    description: "Apres vous avoir rempli la chatte de son sperme puant, il s'attaque a votre fondement sans pitié",
    image: imgNegoAnal, // Image suggestive, floue
    onEnter: { type: 'GAIN_EXCITATION', payload: 10 },
    
    getChoices: (stats) => {
      let choices = [
      { text: "Je suis si excitée d'etre un outil de masturbation pour gobelins, je gemis mon extase"
        , action: 'GAIN_EXCITATION', payload: 11 , category:'excitation'},
        
      { text: "Hors de question de le laisser toucher mon cul ! Boule de Feu !", disabled: stats=>stats.mana<30, action: 'COMBAT_FEU'
        , payload:{mana:30, target:"Gobelins_Massacre"} , category:'combat' },
   
    ];
      
      // La magie de la Corruption !
    addStandardChoice(choices,  {stats, noFire:true, targetSortie:'grotte_est'});

      if (stats.excitation > 50&&stats.corruption>10) {
        choices.push( 
      { text: "Je les encourage a continuer par de petits gemissements"
        , action:"GAIN_EXCITATION", payload:11, category:'excitation'
        , target: 'Scene_Gobelins_Orgie_03' });
      }
      if (stats.corruption > 20) {
        choices.push( 
      { text: "Les exciter davantage, vous pouvez en encaisser plus"
        , action:"GAIN_CORRUPTION", payload:3, category:'corruption'
        , target: 'Scene_Gobelins_Orgie_Exc' });
      }
      return choices;
    }
  }
   ,  'Scene_Gobelins_Orgie_03': { // groupe
    description: "Ils vous prennent a plusieurs, vous forcant a faire des fellations a leurs sexes degueus",
    image: imgNego3, // Image suggestive, floue
    onEnter: { type: 'GAIN_EXCITATION', payload: 10 },
    
    getChoices: (stats) => {
      let choices = [
      { text: "Je mouille come une folle, je continue de jouer la pauvre victime pour me faire baiser"
        , action: 'GAIN_EXCITATION', payload: 12, category:'excitation' },
        
      { text: "Ta queue sent la pisse ! Degage sale sac a merde... Boule de Feu !", disabled: stats=>stats.mana<30, action: 'COMBAT_FEU'
        , payload:{mana:30, target:"Gobelins_Massacre"} , category:'combat' },
   
    ];
   
    addStandardChoice(choices,  {stats,noFire:true, targetSortie:'grotte_est'});
      if (stats.excitation > 80) {
        choices.push( 
      { text: "Se mettre a 4 pattes pour mieux les enchainer", category:'excitation'
        , action:"GAIN_EXCITATION", payload:15
        , target: 'Scene_Gobelins_Orgie_04' });
      }
      if (stats.corruption > 30) {
        choices.push( 
      { text: "Les exciter davantage, vous pouvez en encaisser plus"
        , action:"GAIN_CORRUPTION", payload:10, category:'pervers'
        , target: 'Scene_Gobelins_Orgie_Exc' });
      }
      return choices;
    }
  }
   ,  'Scene_Gobelins_Orgie_Exc': { // exciter
    description: "Ils sont trop cons a attendre leur tour... Vous utilisez le langage des signes pour leur montrer que vous en voulez plus. ",
    image: imgNegoExcite, // Image suggestive, floue
    onEnter: { type: 'GAIN_EXCITATION', payload: 10 },
    
    getChoices: (stats) => {
      let choices = [
      { text: "Je ne cache meme plus que j'apprecie le traitrement qu'on m'inflige, je jouis."
        , action: 'GAIN_EXCITATION', payload: 22,category:'excitation' },
    
    ];
      
      // La magie de la Corruption !
  
    addStandardChoice(choices,  {stats, noFire:true,targetSortie:'grotte_est'});
      if (stats.excitation > 70) {
        choices.push( 
      { text: "Se mettre a 4 pattes pour mieux les enchainer", category:'excitation'
        , action:"GAIN_EXCITATION", payload:15
        , target: 'Scene_Gobelins_Orgie_04' });
      }
      if (stats.corruption > 60) {
        choices.push( 
      { text: "Se donner entierement a la meute sans plus penser au lendemain"
        , action:"GAIN_CORRUPTION", payload:10,  category:'pervers'
        , target: 'Scene_Gobelins_Orgie_finale' });
      }
      if (stats.corruption >= 100) {
        choices.push( 
      { text: "Accepter mon destin d'esclave pour gobelins, c'est ca que je veux faire toute ma vie"
        , action:"GAIN_CORRUPTION", payload:20,  category:'pervers'
        , target: 'Scene_Gobelins_Orgie_accept' });
      }
      return choices;
    }
  } 
   ,  'Scene_Gobelins_Orgie_04': { // 4pattes
    description: "Vous vous faites baiser pendant de longues heures, les gobelins s'enchainent pour vous remplir le cul et le vagin de leur sperme",
    image: imgNego4, // Image suggestive, floue
    onEnter: { type: 'GAIN_EXCITATION', payload: 10 },
    
    getChoices: (stats) => {
      let choices = [
      { text: "Oh oui.. Oh oui.. Oh putain c'est bon."
        , action: 'GAIN_EXCITATION', payload: 22 },
    
    ];
      
      // La magie de la Corruption !
    
    addStandardChoice(choices,  {stats, noFire:true, targetSortie:'grotte_est'});
      if (stats.corruption > 60) {
        choices.push( 
      { text: "Se donner entierement a la meute sans plus penser au lendemain"
        , action:"GAIN_CORRUPTION", payload:10, category:'corruption'
        , target: 'Scene_Gobelins_Orgie_finale' });
      }
      if (stats.corruption >= 100) {
        choices.push( 
      { text: "Accepter mon destin d'esclave pour gobelins, c'est ca que je veux faire toute ma vie"
        , action:"GAIN_CORRUPTION", payload:20, category:'pervers'
        , target: 'Scene_Gobelins_Orgie_accept' });
      }
      return choices;
    }
  }
    ,  'Scene_Gobelins_Orgie_finale': { // imgOrgir
    description: " Vous n'avez plus la notion du temps, ni le compte des gobelins qui vous sont passés dessus. Et comme ils se remettent en forme en moins de 10 minutes, certains sont deja passé 8 fois",
    image: imgNegoOrgie, // Image suggestive, floue
    onEnter: { type: 'GAIN_EXCITATION', payload: 10 },
    
    getChoices: (stats) => {
      let choices = [
      { text: "J'aime trop ca.. Encore !! Plus fort", category:'excitation'
        , action: 'GAIN_EXCITATION', payload: 22 },
        
    ];
      
    addStandardChoice(choices,  {stats, noFire:true, targetSortie:'grotte_est'});
      if (stats.corruption >= 100) {
        choices.push( 
      { text: "Accepter mon destin d'esclave pour gobelins, c'est ca que je veux faire toute ma vie"
        , action:"GAIN_CORRUPTION", payload:20,  category:'corruption'
        , target: 'Scene_Gobelins_Orgie_accept' });
      }
      return choices;
    }
  }  ,  'Scene_Gobelins_Orgie_accept': { // imgOrgir
    description:  "Vous vous attachez vous-meme le collier d'esclaves et vous debarassez pour toujours de vos vetements pour vivre nue et a disposition des gobelins comme vide-couille de la meute"
      ,  image: imgNegoFin, // Image suggestive, floue
    onEnter: { type: 'GAIN_EXCITATION', payload: 10 },
    
    getChoices: (stats) => {
      let choices = [
      { text:"A qui le tour"  ,category:'pervers', action: 'FIN_JEU', payload: 'gobelin' },
      { text:"Euh non attendez... J'ai une vraie vie moi !! (DESTRUCTION : 43 mana)"
          , action: 'COMBAT_FEU',payload:{mana:43, target:"salleOrcs_Entree"}, disabled:stats=>stats.mana<43, category:'combat' },
        
    ];
      
      return choices;
    }
  }


  ,'couloirOrc': {
    description: "Le chemin vers le Sud est large, taillé dans la roche. L'écriteau 'Attention aux orcs' est grossier, mais efficace. Le couloir s'arrête net devant une immense porte de pierre. Elle est fermée. Au centre, une grande rune de sang brille d'une lueur rouge.",
    image: "https://png.pngtree.com/png-vector/20240624/ourmid/pngtree-mysterious-door-in-an-enchanted-forest-with-glowing-runes-png-image_12818401.png", // Une grande porte de pierre avec une rune
    choices: [
      { text: "Examiner la rune", target: 'Puzzle_PorteOrc_01', category:'discussion' },
      { text: "Tenter de forcer la porte (Inutile, elle est magique)", target: 'couloirOrc', action:'PERTE_TEMPS' },
        { text: "Méditer (Régénérer Mana)",  category:'soin',action: 'REGEN_MANA',payload:10, disabled:stats=>stats.mana>=100 },
      { text: "Faire demi-tour", target: 'grotte_est', action:"PERTE_TEMPS", category:'discussion' }
    ]
  },
  
  'Puzzle_PorteOrc_01': {
    description: "Vous vous approchez. La rune est un sceau de garde. Elle vous 'scanne'. Elle ne cherche pas une clé, elle cherche une *intention*. Elle semble poser une question silencieuse : 'Qui ose ?'",
  image:"https://st4.depositphotos.com/1781787/31568/i/450/depositphotos_315688202-stock-photo-open-doors-abstract-light-night.jpg",
    getChoices: (stats) => {
      let choices = [
        { text: "[Force] Vous defoncez la porte de votre epaule"
          , target: 'Puzzle_PorteOrc_Echec' },
        { text: "[Charisme] 'Je suis Sofie, Mage de Niv. 74 ! Ouvrez c'est un ordre !' (Coûte 10 Mana)"
          , target: 'Puzzle_PorteOrc_Echec', category:'excitation' },
        { text: "[Magie] Tenter de la désactiver avec un contre-sort (Coûte 80 Mana)", category:'combat'
          , action: 'COMBAT_FEU',  payload:{mana:80, target:"salleOrcs_Entree"}, disabled:stats=>stats.mana<80
          }
      ];
      
      // Le test de Corruption !
      if (stats.corruption > 15) {
        choices.push({ 
          text: "[Pervers] Laisser la rune sonder votre esprit... et lui *montrer* qui vous êtes vraiment.", 
          target: 'Puzzle_PorteOrc_Reussite' , category:'pervers'
        });
      }
      return choices;
    }
  },

  'Puzzle_PorteOrc_Echec': {
    description: "La rune devient rouge vif ! 'INDIGNE !' hurle une voix dans votre tête. Une petite décharge magique vous repousse. (Vous perdez 10 Mana de plus, pour rien).",
   image:"https://png.pngtree.com/thumb_back/fh260/background/20241213/pngtree-a-mysterious-door-with-fire-bursting-out-from-it-in-an-image_16785849.jpg",
    onEnter: { type: 'COST_MANA', payload: 10 },
    choices: [
      { text: "Réessayer (stupide)", target: 'Puzzle_PorteOrc_01' },
      { text: "Faire demi-tour", target: 'grotte_est', action:"PERTE_TEMPS" ,category:'discussion' }
    ]
  },

  'Puzzle_PorteOrc_Reussite': {
    description: "Vous fermez les yeux et laissez le sceau entrer. Il voit votre magie, votre puissance... et il voit vos vices et vos perversions. Il voit la salope en vous. La rune, qui cherchait force et domination, *vibre* en harmonie. Elle vous a reconnue comme l'une des leurs, ou peut-être même... comme une Déesse. La porte de pierre grince et s'ouvre lourdement.",
   image:"https://img.freepik.com/photos-premium/voyage-magique-porte-2023-aux-possibilites-2025_1029473-107027.jpg?semt=ais_hybrid&w=740&q=80",
    onEnter: { type: 'GAIN_CORRUPTION', payload: 5 },
    choices: [
      { text: "Entrer chez les Orcs", target: 'salleOrcs_Entree' ,category:'discussion'}
    ]
  },
  
  'salleOrcs_Entree': {
    description: "Vous entrez dans une salle immense, éclairée par une forge. Des Orcs, des vrais, massifs et verts, s'arrêtent de manger. Un chef de guerre avec des défenses plaquées de fer se lève. 'Femme ! Baiser !'",
     image: imgOrc1, // Image suggestive, floue
    onEnter: { type: 'GAIN_EXCITATION', payload: 4 },
    
    getChoices: (stats) => {
      let choices = [
      { text: "[Intimidation] Poussez-vous tas de merde, je veux continuer ma route (vers le coeur du donjon) et j'ai la boule de feu facile"
        , target:'coeur_grotte', action:"LUCIDITE",category:'discussion' },
         { text: "[Brutal] Bon ben ca part, attention les poils ! FIREBALL (Coûte 30 Mana)", action: 'COMBAT_FEU'
          , payload:{mana:30, target:"orcMassacre"}, disabled:stats=>stats.mana<30
           ,category:'combat'},
        {text:"[Pervers] Oh mon Dieu ! Pas des orcs ! Je tiens trop a ma virginité !",category:'pervers', target:"ORC_2"
      },
   
    ];
     
      if (stats.excitation > 80) {
        choices.push( 
      { text: "S'agenouiller en position de domination et les laisser venir'"
        , action:"GAIN_CORRUPTION", payload:5,category:'corruption'
        , target: 'ORC_3' });
      }
      return choices;
    }
  },
   'ORC_2': {
    description: "Les Orcs se jettent sur vous, ils posent leur pattes sur votre corps et arrachent vos vetements. 'Femme ! Baiser !'",
     image: imgOrc2, // Image suggestive, floue
    onEnter: { type: 'GAIN_EXCITATION', payload: 4 },
    
    getChoices: (stats) => {
      let choices = [
       { text: "Profiter du moment, tant qu'ils chatouillent pas"
        , action: 'GAIN_EXCITATION', payload: 8 ,category:'excitation'},
         { text: "Ca me gonfle, j'ai deja vu ca avec les Gobelins ! FIREBALL (Coûte 30 Mana)", action: 'COMBAT_FEU' , payload:{mana:30, target:"orcMassacre"}, disabled:stats=>stats.mana<30
          ,category:'combat' }
       ,
   
    ];
     
      if (stats.excitation > 50) {
        choices.push( 
       {text:"Feindre d'etre sans defense et commencer a gemir", target:"ORC_3",
         action:'GAIN_EXCITATION',payload:11,category:'pervers'
      });
      }
      if (stats.excitation > 80) {
        choices.push( 
      { text: "Les provoquer pour qu'ils s'activent un peu"
        , action:"GAIN_CORRUPTION", payload:5,category:'pervers'
        , target: 'ORC_Provoc' });
      }
      return choices;
    }
  }

  ,'orcMassacre': {
    description: "Vous levez la main. Une sphère de feu orange illumine la grotte. Les cris s'arrêtent net. L'odeur de cochon grillé remplace la puanteur. La voie est libre... mais c'était un peu facile, non ?",
   image:"https://wiki.kigard.fr/_media/images/boule_de_feu_2_.jpeg?w=400&tok=3581c3",
    choices: [
      { text: "Inspecter le campement... Mais bon j'etais pas la pour ca.", target: 'Gobelins_MassacreSuite' } // Ou une autre salle
      , { text: "Revenir sur ses pas... Quelle déception.",category:'discussion', target: 'grotte_est', action:"PERTE_TEMPS" } 
       , { text: "Continuer la route vers le coeur de la grotte",category:'discussion', target: 'coeur_grotte', action:"PERTE_TEMPS" } 
    ]
  }
, 'ORC_Provoc': {
    description: "Vous mettez en doute leur virilité et insultez leur meres. Avec cette provocation, ils commencent a vous baiser 'Femme ! Baiser !'",
     image: imgOrcProvoc, // Image suggestive, floue
    onEnter: { type: 'GAIN_CORRUPTION', payload: 4 },
    
    getChoices: (stats) => {
      let choices = [
       { text: "Sentir l'excitation monter",category:'excitation'
        , action: 'GAIN_EXCITATION', payload: 12 },
   
    ];
     
      if (stats.excitation > 50) {
        choices.push( 
       {text:"Allez-y bourrez-moi bande de mou du slip !", target:"ORC_4",category:'pervers'
      });
      }
      return choices;
    }
  }
, 'ORC_3': {
    description: "Les premieres bites s'imposent a vous, on vous force la bouche avec une queue puante. Il vous baisent la bouche sans menagement. 'Femme ! Baiser !'",
     image: imgOrc3, // Image suggestive, floue
    onEnter: { type: 'GAIN_CORRUPTION', payload: 4 },
    
    getChoices: (stats) => {
      let choices = [
       { text: "Gemir de plaisir",category:'excitation'
        , action: 'GAIN_EXCITATION', payload: 11 }
   
    ];
    addStandardChoice(choices, {stats, noFire:true, targetSortie:'coeur_grotte'});
       
      if (stats.corruption > 40) {
        choices.push( 
       {text:"Leur donner ce qu'ils veulent", target:"ORC_4",category:'pervers'
      });
      }
      if (stats.excitation > 90) {
        choices.push( 
      { text: "Finir la partie de baise"
        , action:"GAIN_CORRUPTION", payload:5,category:'corruption'
        , target: 'ORC_finBaise' });
      }
      return choices;
    }
  }, 'ORC_4': {
    description: "Ils se mettent a plusieurs sur vous. Chaque trou est occupé et ramoné dans les grandes largeurs. 'Femme ! Baiser !'",
     image: imgOrc4, // Image suggestive, floue
    onEnter: { type: 'GAIN_CORRUPTION', payload: 4 },
    
    getChoices: (stats) => {
      let choices = [
       { text: "Haleter et les encourager a vous baiser plus fort",category:'excitation'
        , action: 'GAIN_EXCITATION', payload: 15 }
    ];
    addStandardChoice(choices,  {stats, targetSortie:'coeur_grotte'});
       
      if (stats.excitation > 60) {
        choices.push( 
       {text:"Finir la-dessus", target:"ORC_finBaise",category:'pervers'
      });
      }
      if (stats.corruption > 80) {
        choices.push( 
      { text: "Se faire adopter par les orcs et devenir leur vide-couille pour la vie"
        , action:"GAIN_CORRUPTION", payload:15,category:'corruption'
        , target: 'ORC_fin' });
      }
      return choices;
    }
  }, 'ORC_finBaise': {
    description: "Apres s'etre tous vidé en vous, ils vous laissent en plan sur le sol, le ventre plein",
     image: imgOrcFinBaise, // Image suggestive, floue
    onEnter: { type: 'GAIN_CORRUPTION', payload: 4 },
    
    getChoices: (stats) => {
      let choices = [
       { text: "Merci les gars, a la prochaine (repartir sur la route direction le coeur de la grotte)"
        , target:"coeur_grotte",category:'discussion' }
    ];
   
      if (stats.corruption > 80) {
        choices.push( 
      { text: "Se faire adopter par les orcs et devenir leur vide-couille pour la vie"
        , action:"GAIN_CORRUPTION", payload:15,category:'corruption'
        , target: 'ORC_fin' });
      }
      return choices;
    }
  }, 'ORC_fin': {
    description: "Vous ne pouvez plus vous passer de leur grosses queue et devenez leur pute a vie",
     image: imgOrcFin, // Image suggestive, floue
    onEnter: { type: 'GAIN_CORRUPTION', payload: 14 },
    
    getChoices: (stats) => {
      let choices = [
       { text: "Ouais en fait, il se fait tard... (repartir sur la route direction le coeur de la grotte)"
        , target:"coeur_grotte", action:"PERTE_TEMPS" ,category:'discussion'}

    ];
   
      if (stats.corruption > 80) {
        choices.push( 
      { text: "Debrancher son cerveau et se laisser baiser", action: 'FIN_JEU', payload: 'orc',category:'pervers' }
      ,  { text: "Non je veux pas finir comme ca... Boule de Feu !", disabled: stats=>stats.mana<30,category:'combat', action: 'COMBAT_FEU', payload:{mana:30, target:"coeur_grotte"}  },
    );
      }
      return choices;
    }
  }

// coeur de la grotte
 ,'coeur_grotte': {
    description: "Vous arrivez au coeur de la grotte, c 'est le dernier carrefour. Un escalier monte vers un temple d'ou proviennent des chants gutturaux. Plus bas, le chemin descend vers un conduit humide et inquietant ",
    image:"https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1b/56/26/0b/la-grotte-de-seythenex.jpg?w=1200&h=-1&s=1",
    choices: [
      { text: "Monter l'escalier ", target: 'culteMaso',category:'discussion' },
      { text: "Explorer le conduit humide", target: 'conduitHumide' ,category:'discussion'},
      { text: "Retourner vers les Orcs", target: 'salleOrcs_Entree' , action:"PERTE_TEMPS",category:'discussion'},
      { text: "Retourner dans la grotte Est", target: 'grotte_est', action:"PERTE_TEMPS" ,category:'discussion'},  
      { text: "Méditer (Régénérer Mana)", action: 'REGEN_MANA',payload:10, disabled:stats=>stats.mana>=100,category:'soin' }
    ]
   , onEnter: { 
      type: 'GAIN_EXCITATION', 
      payload: -25 
    }
  },

// conduitHumide
'conduitHumide':{
description:"La grotte se resserre en un conduit etroit et humide, la roche est couverte d'un mucus qui s'epaissit au fur et a mesure que vous avancez.\n Il semblerait que ce mucus palpite par moment, comme une forme de chair. Votre torche s'eteins, il n'y a plus la place pour la porter devant vous de toute facons. Le conduit se resserre encore enveloppant tout votre corps et vous vous trouvez devant un passage circulaire fermé. Comme un anus geant.",
image:conduit1,// grotte-anus
 onEnter: { type: 'GAIN_EXCITATION', payload: 4 },
choices:[{text:"Et ben, v'la autre chose... Bon, ben je suis la pour visiter... (Se glisser dans le boyau)"
          , target:"conduit_2",category:'discussion'
      }, {
        text:"Ah non, c'est trop degueu, je passe mon tour (Revenir)", target:"coeur_grotte", action:"PERTE_TEMPS"
      }, {
        text:"Ca va saloper ma culotte... Grosse boule de feu pour forer un passage ! (60 mana)" 
        , action: 'COMBAT_FEU', payload:{mana:60, target:'labo'}
        , disabled:stats=>stats.mana<60,category:'combat'
      }]
},

'conduit_2':{
description:"Le boyau de chair vous enveloppe alors que vous rampez a l'interieur, vos vetements se dissolvent et c'est bientot comme si une langue geante vous sucait",
image:conduit2,// dans le boyau
 onEnter: { type: 'GAIN_EXCITATION', payload: 14 },
choices:[{text:"Ah oui c'est trop bon.. (Rester et se remuer)", category:'excitation'
          , action:"GAIN_EXCITATION", payload:9
      }, {
        text:"Continuer a ramper (10 degats de mana pour se forcer a avancer malgré le plaisir intense)", target:"labo"
       ,category:'pervers'
      }]
},
'labo':{
description:"Vous sortez du conduit et vous vous retrouvez dans une grande salle sombre. Un sort de lumiere vous eclaire la scene, c'est un laboratoire de magie. Un coffre enorme se trouve dans un coin. Un fauteuil trone au centre, il est percé et il y a des boutons sur l'accoudoir.\n Sur un autel git une poupée en latex d'une vingtaine de centimetres, un parchemin l'accompagne.\n Et enfin un golem pourvu d'un membre gigantesque, immobile a coté. ",
image:imgLabo,//labo

choices:[{text:"Examiner le coffre"
          , target:"mimic"
      },{text:"Examiner le fauteuil"
          , target:"fuckMachine"
      },{text:"Examiner le parchemin de la poupee"
          , target:"sexDoll"
      },{text:"Examiner le golem"
          , target:"golem"
      },{text:"Tiens des super potions de mana",category:'coin'
          , action: 'REGEN_MANA',payload:18, disabled:stats=>stats.mana>=100
      },{text:"Revenir au dernier embranchement",category:'discussion'
          , target:"coeur_grotte", action:"PERTE_TEMPS"
      }
    ]
},
'fuckMachine':{
  description:"Le fauteuil semble tres perfectionné, il est en metal, avec des parties en cuir, notamment des sangles. Plusieurs trous sont percés sur le fondement. 3 boutons ornent l'accoudoir",
  image:"https://i.etsystatic.com/11763829/r/il/feb240/2286996044/il_fullxfull.2286996044_hqz1.jpg",// fauteuil fuck machine
  choices:[{text:"S'asseoir et attendre"
          , target:"fuckMachine2"
      },{text:"S'asseoir et appuyer sur le bouton vert",category:'pervers'
          , target:"fuckMachineVert"
      },{text:"S'asseoir et appuyer sur le bouton jaune",category:'pervers'
          , target:"fuckMachineJaune", disabled:stats=>stats.excitation<45
      },{text:"S'asseoir et appuyer sur le bouton rouge",category:'pervers'
          , target:"fuckMachineRouge", disabled:stats=>stats.excitation<65
      },{text:"Laisser tomber",category:'discussion'
          , target:"labo", action:"PERTE_TEMPS"
      },{ text: "Boire une potion de Mana.",category:'soin'
        , action:"REGEN_MANA", payload:50} 
    ]
},
'fuckMachine2':{
  description:"Des sangles viennent automatiquement vous bloquer les chevilles et les avant-bras, vous laissant juste ce qu'il faut pour appuyer sur les boutons. Vous sentez une trappe s'ouvrir sous votre posterieur. Vous n'avez plus de culotte depuis bien longtemps et vous sentez qu'on vous badigeonne les parties d'un lubrifiant froid",
  image:"https://wimg.rule34.xxx//images/5838/f765bdcea49a884e3a2d8f6f847c769a.gif?6636895",// fauteuil fuck machine sangle
  choices:[{ text: "C'est carrement flippant. Je lance une Foule de Beuh (Coûte 32 Mana)"
     ,category:'combat'   , action: 'COMBAT_FEU', payload:{mana:32, target:'labo'}, disabled:stats=>stats.mana<30
        }, { text: "Méditer sur l'ingeniosité humaine en matiere de sexe  (Régénérer Mana. Mais il faut calmer son excitation)",category:'soin', action: 'REGEN_MANA',payload:10, disabled:stats=>stats.mana>=100||stats.excitation>50 }
      
        ,{text:"Appuyer sur le bouton vert",category:'pervers'
          , target:"fuckMachineVert"
      },{text:"Appuyer sur le bouton jaune",category:'pervers'
          , target:"fuckMachineJaune", disabled:stats=>stats.excitation<45
      },{text:"Appuyer sur le bouton rouge",category:'pervers'
          , target:"fuckMachineRouge", disabled:stats=>stats.excitation<65
      }
    ]
},
'fuckMachineVert':{
  description:"Un godemichet vous penetre le sexe, de petits picots le parcourent, ce qui vous fait pousser un gemissement involontaire quand il entame ses va-et-viens",
  image:imgFMVert,// Fuck machine fuck
  choices:[{text:"Ouh la la, c'est bien ca..."
          , action:"GAIN_EXCITATION" ,payload:7,category:'excitation'
      } 
        ,{text:"Appuyer sur le bouton jaune",category:'pervers'
          , target:"fuckMachineJaune", disabled:stats=>stats.excitation<45
      },{text:"Appuyer sur le bouton rouge",category:'pervers'
          , target:"fuckMachineRouge", disabled:stats=>stats.excitation<65
      }
    ]
},
'fuckMachineJaune':{
  description:"Deux godemichets surgissent du fauteuil. Chacun s'introduit dans un de vos orifice ce qui vous fait pousser un cri involontaire quand ils entament leur va-et-viens.. C'est plus fort qu'avant, non ?",
  image:imgFMJaune,// Fuck machine fuck anal
  choices:[ {text:"Oh c'est bon... continue..."
          , action:"GAIN_EXCITATION" ,payload:6,category:'excitation'
      } ,{text:"S'accorder un orgasme",category:'pervers'
          , target:"fuckMachine2", action:'GAIN_CORRUPTION', payload:3
      }
        ,{text:"Appuyer sur le bouton vert",category:'pervers'
          , target:"fuckMachineVert"
      },{text:"Appuyer sur le bouton rouge",category:'pervers'
          , target:"fuckMachineRouge", disabled:stats=>stats.excitation<65
      }
    ]
},
'fuckMachineRouge':{
  description:"Deux godemichets surgissent du fauteuil. Des ventouses apparaissent par des clapets sur les cotés et se collent a vos seins pour les teter. Les godemichets accelerent leur rythme et doublent de volume en meme temps qu'en tremblement agite tout le fauteuil",
  image:imgFMRouge,// Fuck machine fuck total
  choices:[
    {text:"S'accorder un orgasme",category:'pervers'
          , target:"fuckMachine2", action:'GAIN_CORRUPTION', payload:4
      },{text:"Me laisser corrompre un peu plus (change Excitation en Corruption. 22 mana)",category:'corruption'
        , disabled:stats=>stats.excitation<50||stats.mana<20, action:'SELF_CORRUPT', payload:22
      },
        {text:"Appuyer sur le bouton rouge encore une fois (DANGER)",category:'pervers'
          , target:"fuckMachineEnd", disabled:stats=>stats.corruption<85
      }
    ]
},
'fuckMachineEnd':{
  description:"Une seringue sort du fauteuil et vous injecte un liquide verdatre. Il s'agit d'un neuro-toxique qui va annihiler votre volonté, vous allez rester sanglée sur ce fauteuil, incapable de bredouiller la formule de teleportation pour vous sortir de la ou la moindre boule de feu. Bienvenue dans votre nouveau monde de penetration mecanique ininterrompue",
  image:imgFMEnd,// Fuck machine fuck End
  choices:[
         {text:"C'est la vie, j'ai ete imprudente a cliquer ce bouton une 2eme fois",category:'pervers'
          ,action:'FIN_JEU', payload:'labo'
      }, {text:"Hors de question de finir mes jours ainsi.. Il me reste un peu de mana ? (25 minimum)"
          ,action:'COST_MANA', payload:25, disabled:stats=>stats.mana<25, target:'labo',category:'combat'
      }
    ]
},
'mimic':{
description:"Vous inspectez le coffre, c'est alors qu'il s'ouvre sur une gueule enorme et vous happe",
image:imgMimic,//mimic
 onEnter: { type: 'GAIN_EXCITATION', payload: 2 },
 getChoices: (stats) => {
      let choices = [
        {text:"Se laisser faire, on reagira si ca fait mal", category:'excitation'
         , action:"GAIN_EXCITATION", payload:12
      },
   {text:"Se degager avec un sort (10 mana)", target:'labo',category:'combat', action:'COST_MANA', payload:10, disabled:stats=>stats.mana<10}
   ];
     
      if (stats.excitation > 60) {
        choices.push( 
      { text: "C'est vraiment bon... Continue mon grand !",category:'pervers'
        , action:"GAIN_CORRUPTION", payload:5
         , target:"mimic2" });
      }
      return choices;
    
  }
},
'mimic2':{
description:"Sa langue geante vous penetre brutalement et vous transperce, la sensation est au-dela de ce que vous avez pu ressentir durant vos meilleurs cunnilingus",
image:imgMimic2,//mimic fuck
 onEnter: { type: 'GAIN_EXCITATION', payload: 2 },
 getChoices: (stats) => {
      let choices = [
        {text:"Gemir de plaisir", category:'excitation'
         , action:"GAIN_EXCITATION", payload:11
      },
   {text:"Se degager avec un sort (20 mana)", target:'labo',category:'combat', action:'COST_MANA', payload:20, disabled:stats=>stats.mana<20}
    ];
     
      if (stats.excitation > 70) {
        choices.push( 
      { text: "Lacher prise et se laisser faire",category:'pervers'
        , target:"mimicEnd"});
      }
      if (stats.corruption > 80) {
        choices.push( 
      { text: "Se laisser devorer",category:'corruption'
        , action:"FIN_JEU", payload:'labo' });
      }
      return choices;
    
  }
},
'mimicEnd':{
description:"Vous etes sucée, lechée profondément, des tentacules viennent completer la langue gente qui vous penetre pour un orgasme delirant.",
image:imgMimicEnd,//mimic fuck
 onEnter: { type: 'GAIN_EXCITATION', payload: 2 },
 getChoices: (stats) => {
      let choices = [
        {text:"Oh oui.. Encore... Vas-y !!", category:'excitation'
         , action:"GAIN_EXCITATION", payload:12
      },
    ];
     addStandardChoice(choices, {stats, targetSortie:'labo'})
      if (stats.corruption > 90) {
        choices.push( 
      { text: "Se laisser devorer",category:'corruption'
        , action:"FIN_JEU", payload:'labo' });
      }
      return choices;
    
  }
},

'sexDoll':{
description:"Le parchemin indique une formule d'incantation dont la formule invoque des echanges d'ames et de corps, c'est ecrit dans un vieux langage magique, ce n'est pas tres clair",
image:imgSexDoll,//sex doll
 onEnter: { type: 'GAIN_EXCITATION', payload: 2 },
 getChoices: (stats) => {
      let choices = [
        {text:"Reciter la formule (YOLO)"
         , target:'sexDoll2',category:'pervers'
      },
   {text:"Revenir au labo", target:'labo',category:'discussion'}
    ];
     
      if (stats.excitation > 80&&stats.corruption>66) {
        choices.push( 
      { text: "Reciter la formule en branlant le golem",category:'pervers'
        , target:"sexDollGolem" });
      }
      return choices;
    
  }
},
'sexDoll2':{
description:"Aussitot, vous vous sentez projetée hors de votre corps et venez incarner la poupee, vous ne pouvez plus bouger, cette poupée n'a ni muscle, ni os, ce n'est qu'un corps mou, a peine pouvez-vous gigoter pathetiquement. Les yeux du golem s'illuminent et vous observent.\n Son sexe se dresse et il vous saisit par la tete pour la diriger vers son sexe",
image:imgSexDoll2,//sexDoll incarnee
 onEnter: { type: 'GAIN_EXCITATION', payload: 5 },
 getChoices: (stats) => {
      let choices = [
        {text:"Se laisser faire, il va bien voir que c'est impossible que ca rentre",category:'pervers'
         , target:'sexDollPipe'
      },
   {text:"Arreter cette plaisanterie et revenir au labo (40 mana)", target:'labo',category:'combat'
    , disabled:stats=>stats.mana<40, action:'COST_MANA', payload:40}
    ];
     
      if (stats.excitation > 50&&stats.corruption>30) {
        choices.push( 
      { text: "Inciter le golem a utiliser ma chatte plutot",category:'pervers'
        , target:"sexDollGolem" });
      }
      return choices;
    
  }
},
'sexDollPipe':{
description:"Votre bouche elastique ne peut arreter le gland gros comme 2 poings fermés de rentrer et ecarteler votre gorge, votre oesophage, jusqu'a l'estomac qui est lui aussi deformé. Vous n'avez jamais ete aussi remplie, votre chatte degouline de jus",
image:imgSexDollPipe,//sexDoll pipe
 onEnter: { type: 'GAIN_EXCITATION', payload: 7 },
 getChoices: (stats) => {
      let choices = [
        {text:"Se laisser faire, ca fait meme pas mal",category:'excitation'
         , action:'GAIN_EXCITATION', payload:11
      }
    ];
    addStandardChoice(choices, {stats, targetSortie:'labo'})
     
      if (stats.excitation > 50&&stats.corruption>50) {
        choices.push( 
      { text: "Inciter le golem a utiliser ma chatte plutot",category:'pervers'
        , target:"sexDollGolem" });
      }
      if (stats.excitation > 80&&stats.corruption>70) {
        choices.push( 
      { text: "Oh oui, oh oui ! Baise-moi ! Plus fort ! Je jouis !",category:'pervers'
        , target:"golemRemplit" });
      }
      return choices;
    
  }
},
'sexDollGolem':{
description:"Le golem vous place la chatte sur sa bite... C'est impossible que ca rentre, vous ne faites que 30 centimetres de haut et sa bite doit atteindre le metre en longueur et plus que votre propre largeur en diametre. Pourtant il force, s'enfonce, vous ecartele. Aucune dechirure, vous etes en latex. \n Votre ventre se deforme. Vous ne pouvez plus incanter , votre souffle est coupé. Vous etes remplie comme jamais et jouissez en continu", 
image:imgSexDollGolem,//sexDoll fuck golem
 onEnter: { type: 'GAIN_EXCITATION', payload: 7 },
 getChoices: (stats) => {
      let choices = [
        {text:"Han.. Han..."
         , action:'GAIN_EXCITATION', payload:11,category:'excitation'
      }
    ];
    addStandardChoice(choices, {stats, targetSortie:'labo'})
     
      if (stats.excitation > 80&&stats.corruption>95) {
        choices.push( 
      { text: "Bruler le parchemin pour rester cette sexDoll toute ma vie et me laisser defoncer pour toujours."
        , action:"FIN_JEU", payload:'labo',category:'corruption' });
      }
      return choices;
    
  }
},
'golem':{
description:"Il s'agit d'une creature de pierre de 3m de haut avec un penis surdimensionné, meme pour sa taille. Il semble inanimé",
image:imgGolem,//golem
 onEnter: { type: 'GAIN_EXCITATION', payload: 2 },
 getChoices: (stats) => {
      let choices = [
        {text:"[Pervers] Branler le golem"
         , target:'golem2',category:'pervers'
      },
   {text:"Revenir au labo", target:'labo',category:'discussion'}
    ];
     
      if (stats.corruption > 60) {
        choices.push( 
      { text: "S'empaler directement sur la bite du golem",category:'pervers'
        , target:"golemFuck" });
      }
      return choices;
    
  }
},

'golem2':{
description:"Le sexe du golem se dresse. Mais il reste immobile",
image:imgGolemBande,//golem bande
 onEnter: { type: 'GAIN_EXCITATION', payload: 2 },
 getChoices: (stats) => {
      let choices = [
        {text:"Continuer de branler le golem", category:'excitation'
         , action:"GAIN_EXCITATION",payload:10
      },
   {text:"Revenir au labo", target:'labo'}
    ];
     
      if (stats.excitation > 40) {
        choices.push( 
      { text: "Et si je mettais ma chatte dessus ? Ca rentre tu crois ?",category:'pervers'
        , target:"golemFuck" });
      }
      return choices;
    
  }
},
'golemFuck':{
description:"Alors que le sexe gigantesque du golem vous penetre, vous sentez ses mains de pierre vous enserrer la taille et entamer des va-et-vients puissants",
image:imgGolemFuck,//golem fuck
 onEnter: { type: 'GAIN_CORRUPTION', payload: 5 },
 getChoices: (stats) => {
      let choices = [
        {text:"Ecarter les cuisses pour mieux le sentir. Vas-y plus profond !", category:'excitation'
         , action:"GAIN_EXCITATION",payload:11
      }
    ];
     addStandardChoice(choices, {stats, noFire:true, targetSortie:'labo'});
      if (stats.excitation > 90) {
        choices.push( 
      { text: "Jouir comme une folle",category:'pervers'
        , target:"golemRemplit" });
      }
      return choices;
    
  }
},
'golemRemplit':{
description:"Vous atteignez l'orgasme, ce qui declenche celui du golem. Il se plante au fond de vous et vous remplit d'un sperme huileux, puis vous relache au sol pantelante. A ce moment, le parchemin de la poupee s'illumine",
image:imgGolemRemplit,//golem remplit
 onEnter: { type: 'GAIN_CORRUPTION', payload: 8 },
 choices: [
       {text:"Encore....", target:'golemFuck', action:'GAIN_CORRUPTION', payload:4,category:'corruption'}
       ,{text:"Expulser le trop-plein du vagin et se rhabiller", target:'labo',category:'discussion'}
       ,{text:"Lire a haute voix le parchemin qui dans sous vos yeux hebetés... Vas-y je suis chaude !"
        , target:'sexDollGolem',category:'pervers'}
    ]
},


//sadomaso culte
    'culteMaso': {
    description: "Vous montez l'escalier et arrivez dans une grande salle, un vieux temple, semble-t-il. Quelques cultistes en robe de moine chantonnent autour d'une femme enchainée au centre, elle exhibe ses organes genitaux dans lequel est planté un crucifx",
     image: "https://hentaiporns.net/wp-content/uploads/2018/01/7147708-6satanic.jpg", // Image suggestive, floue
    onEnter: { type: 'GAIN_EXCITATION', payload: 4 },
    
    getChoices: (stats) => {
      let choices = [
     
        {text:"Madame ? Etes-vous en danger ? Laissez-moi vous delivrer de cette torture"
          , target:"cult_2",category:'soin'
      },
        {text:"Et ben ? C'est quoi ce bordel ? je vais karcheriser ce temple a coup de Boule de feu si j'ai pas d'explication"
          , target:"cult_2",category:'combat'
      },
   
    ];
     
      if (stats.excitation > 60) {
        choices.push( 
      { text: "Elle a l'air d'apprecier en tout cas, je peux participer ?"
        , action:"GAIN_CORRUPTION", payload:5,category:'pervers'
        , target: 'cult_3' });
      }
      return choices;
    }
  }
  , 'cult_2': {
    description: "La femme vous regarde avec des yeux embués d'extase.\n Non je suis ici de mon plein gré, je suis la victime volontaire pour la deesse Meru la sadique. Vous etes arrivé jusqu'ici, vous portez le sceau de la porte runique, vous devez etre l'Elue... Celle qui sera le bras de Meru... Venez me fouetter",
     image: "https://hentailib.net/images/posts/300000/250000/248093.webp", // Image suggestive, floue
    onEnter: { type: 'GAIN_EXCITATION', payload: 4 },
    
    getChoices: (stats) => {
      let choices = [
     
        {text:"OK, on a affaire a une grosse salope... (La fouetter)"
          , target:"cult_3",category:'pervers'
      },
        {text:"Je vais plutot rester sur le coté pour regarder si ca vous derange pas"
          , action: 'GAIN_EXCITATION', payload: 9 ,category:'excitation'
      },
   
    ];
     
      if (stats.excitation > 60) {
        choices.push( 
      { text: "Laissez-moi prendre les choses en main"
        , action:"GAIN_CORRUPTION", payload:5,category:'pervers'
        , target: 'cultChoix' });
      }
      return choices;
    }
  }, 'cult_3': {
    description: "Vous portez quelques coups de fouets, timidement d'abord, mais la fille semble apprecier ce traitement et reclame plus",
     image: "https://gif.acgnngca.com/o/20230420/zabx3m42vuw.gif", // Image suggestive, floue
    onEnter: { type: 'GAIN_EXCITATION', payload: 5 },
    
    getChoices: (stats) => {
      let choices = [
     
        {text:"La fouetter en continu" , action: 'GAIN_EXCITATION', payload: 3 ,category:'excitation'
      }, {text:"La fouetter toujours plus fort" , action: 'GAIN_EXCITATION', payload: 15 ,category:'excitation'
      },
        {text:"Ca me fait chier en fait, je me casse",category:'discussion'
          , target:'coeur_grotte', action:"LUCIDITE"
      },
   
    ];
     
      if (stats.excitation > 60) {
        choices.push( 
      { text: "Allez d'accord, je vais m'occuper de cette grosse salope"
        , action:"GAIN_CORRUPTION", payload:5,category:'pervers'
        , target: 'cultChoix' });
      }
      return choices;
    }
  },
  'cultChoix': {
    description: "Les adeptes du culte de Meru vous presentent des instruments. Ainsi que les 2 pretres qui avaient ete designés pour la torturer avant que vous n'arriviez. \nLes 2 hommes sont membrés comme des chevaux. Vous observez les instruments a votre disposition",
     image: imgCultChamber, // Image suggestive, floue
    onEnter: { type: 'GAIN_EXCITATION', payload: 5 },
    
    getChoices: (stats) => {
      let choices = [
     
        {text:"Essayer les differents instruments" , action: 'GAIN_CORRUPTION', payload: 3 ,category:'corruption'
      }, 
       { text: "Méditer sur la cruauté humaine  (Régénérer Mana)",category:'soin', action: 'REGEN_MANA',payload:10, disabled:stats=>stats.mana>=100 }
       , {text:"Vous etes tous tarés en fait, je me casse (repartir)"
          , target:'coeur_grotte', action:"LUCIDITE",category:'discussion'
      },
     
    ];
    addStandardChoice(choices,{stats,noFire:true,targetSortie:null})
     
      if (stats.excitation > 30 && stats.corruption<50) {
        choices.push( 
      { text: "Bon les mecs, vous allez me l'enculer cette pute "
        , action:"GAIN_CORRUPTION", payload:2,category:'pervers'
        , target: 'cultAnal' });
      }
      else if (stats.excitation > 30 && stats.corruption > 50) {
        choices.push( 
      { text: "Bon les mecs, vous allez me la double-penetrer aussi fort que vous pouvez"
        , action:"GAIN_CORRUPTION", payload:5,category:'pervers'
        , target: 'cultOrgie' });
      }
      if (stats.excitation > 70) {
        choices.push( 
      {text:"[Pervers] Allez, les 2 pretres, vous m'en faites une brochette"
       , target:'cultBrochette',category:'pervers'
      });
      }
      if (stats.corruption > 90) {
        choices.push( 
      { text: "Allez, on la couvre de miel et je lance un sort Nuees d'insecte ! Ca va etre drole"
        , action:"GAIN_CORRUPTION", payload:5,category:'pervers'
        , target: 'cultInsect' });
      }
      else choices.push( 
      { text: "On pourrait faire pire. (Necessite Corruption a 90)",category:'pervers'
       ,disabled:()=>true });


      if (stats.corruption >= 100) {
        choices.push( 
      { text: "Ca me plait trop votre secte. Laissez-moi en devenir la grande pretresse",category:'corruption'
        , action:"FIN_JEU", payload:'culte'});
      }
      return choices;
    }
  }
  
 ,'cultInsect': {
    description: "Vous invoquez une Nuee d'insectes qui couvrent la femme qui hurle a la mort malgré son excitation, des scarabés lui entrent dans la chatte, tandis que des cloportes vont se loger dans son anus bien chaud et humide ",
    image:imgCultInsect,
    choices: cultChoices
   , onEnter: { 
      type: 'GAIN_EXCITATION', 
      payload: 5
    }
  }
 ,'cultAnal': {
    description: "Vous ordonnez a un des pretres de l'enculer. Quand il decouvre sa bite monstrueuse, il est deja trop tard pour reconsiderer, il encule  la femme qui hurle a la mort malgré son excitation, son anus se distend, heureusement qu'elle l'avait bien lubrifié avant ",
    image:imgCultAnal,
     choices: cultChoices
   , onEnter: { 
      type: 'GAIN_EXCITATION', 
      payload: 5
    }
  }
 ,'cultOrgie': {
    description: "Vous laissez les 2 hommes lui ruiner ses organes genitaux et rectaux. La femme  hurle sa jouissance...Mmmm un peu trop facile pour une maso ",
    image:imgCultOrgie,
    choices: cultChoices
   , onEnter: { 
      type: 'GAIN_EXCITATION', 
      payload: 5
    }
  }
 ,'cultBrochette': {
    description: "Vous ordonnez aux 2 hommes de la baiser des 2 cotés. La femme stoppe ses hurlements quand sa bouche se fait envahir. Ils la baisent sans pitié ainsi pendant une heure",
    image:imgCultBrochette,
    choices: cultChoices
   , onEnter: { 
      type: 'GAIN_EXCITATION', 
      payload: 5
    }
  }
};




function addStandardChoice(choices, conf){
  choices.push({text:"Me laisser corrompre un peu plus (change Excitation en Corruption. 30 mana)"
      ,category:'corruption'  , disabled:stats=>stats.excitation<50||stats.mana<30, action:'SELF_CORRUPT', payload:30
      }) 
if(!conf.noFire)
       choices.push({ text: "On a assez joué ! FIREBALL (Coûte 30 Mana)",category:'combat'
        , action: 'COMBAT_FEU', payload:{mana:30, target:conf.targetSortie}
        , disabled:stats=>stats.mana<30});
      // La magie de la Corruption !
      if (conf.stats.mana <= 30) {
        choices.push( 
      { text: "Boire une potion de Mana.",category:'soin'
        , action:"REGEN_MANA", payload:50 });
      } 
       if(conf.stats.excitation>40 && conf.targetSortie!=null)
         choices.push({ 
          text: "Reprendre mes esprits et ma route", action:"PERTE_TEMPS",category:'discussion', 
          target: conf.targetSortie // suite de l'aventure
        });
}