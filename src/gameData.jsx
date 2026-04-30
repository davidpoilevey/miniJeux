import { lazy as lazyReact } from "react";

import { Typography } from '@mui/material';
import ShufflePuck from "./miniJeux/shufflePuck/Shuffle";


const lazy = (importFn, name) =>
  lazyReact(() =>
    importFn().then((mod) => {
      if (!mod.default) {
        console.error(`❌ ${name} n'a PAS de default export`, mod);
      }
      return { default: mod.default || Object.values(mod)[0] };
    })
  );

const Echecs = lazy(() => import('./chess/EchecBoard'));

const Bactery9 = lazy(() => import( './b9/Bactery9'));
const Precambrien = lazy(() => import( './b10/Precambrien'));
const Cambrien = lazy(() => import( './b11/Cambrien'));
const Evo12 = lazy(() => import( './b12/Evo12'));
const Geo13 = lazy(() => import( './b13/Geo13'));
const WorldBox =  lazy(() => import( './worldBox/WorldBox'));
const Carbonifere14 = lazy(() => import( './b14/Carbonifere14'));
const AwaleBoard = lazy(() => import( './awale/AwaleBoard'));
const Bomberman = lazy(() => import( './bomberman/components/BombermanGame'));
const Jardin = lazy(() => import( './jds/components/Jardin'));
const UnoBoard = lazy(() => import( './uno/Plateau'));
const CultManagementGame = lazy(() => import( './cultManager/CultManager'));
const GipsyGame = lazy(() => import( './gipsy/Gipsy'));
const SnookerGame = lazy(() => import( './snooker/SnookerGame'));
const Sorcery = lazy(() => import( './sorcery/Sorcery'));
const MondayTheory = lazy(() => import( './mondayTheory/MondayTheory'));

const  Etuve  = lazy(() => import('./bactery/Aquarium'));
const  Dame  = lazy(() => import( './dames/Dame'));
const  Birthday  = lazy(() => import( './miniJeux/anniv/Birthday'));
const Bubulle = lazy(() => import( './bubulle/Bubulle'));
const Calculator = lazy(() => import( './ti87/Calculator'));
const OpenLibrary = lazy(() => import( './openLibrary/OpenLibrary'));
const PetriBox = lazy(() => import( './genetic/PetriBox'));
const PotDeFleur = lazy(() => import( './genetic/PotDeFleur'));
const GameOfLife = lazy(() => import( './jeudelavie/JeuDeLaVie'));
const EntreeDansLaVie  = lazy(() => import( './bitLife/personnages/BitLife'));
const Fourmiz = lazy(() => import( './fourmis/Fourmiz'));
const FinalFantasy10 = lazy(() => import( './ff1/Entree'));
const  Kratland = lazy(() => import( './kratland/Kratland'));
const PotDeFleur20 = lazy(() => import( './genetic/pot20'));
const SmartBactPanel = lazy(() => import( './bactery/SmartBact'));

const SproutPanel = lazy(() => import( './Sprouts/SproutPanel'));
const TowerDefense = lazy(() => import( './towerDefense/TowerDefense'));
const Flip7 = lazy(() => import( './flip7/Flip7'));
const MeeManager = lazy(() => import( './mee/MeeManager'));
const Civilization = lazy(() => import( './civ/Civilization'));
const FarmerGame = lazy(() => import( './farmer/FarmerGame'));
const GodBoard = lazy(() => import( './godBoard/GodBoard'));
const RPG = lazy(() => import( './rpg/RPG'));
const CatRPG = lazy(() => import( './catrpg/components/CATGameWrapper'));
  const Proverbe =  lazy(() => import( './miniJeux/Proverbe'));
const Alpiniste = lazy(() => import( './miniJeux/Alpiniste'));
const B8Board = lazy(() => import( './b8/B8Board'));
const RushHour = lazy(() => import( './miniJeux/RushHour'));
const Perudo = lazy(() => import( './miniJeux/Perudo'));
const Flipper = lazy(() => import( './flipper/FlipperGame'));
const CrawlingBlob = lazy(() => import( './blob/Blob'));
const CellularEvolutionSim = lazy(() => import( './blob/CellularBlob'));
const Pissotiere = lazy(() => import( './miniJeux/Pissotiere'));
const Clicker = lazy(() => import( './miniJeux/ClickerGame'));
const Anagram = lazy(() => import( './miniJeux/Anagram'));
const MotsCaches = lazy(() => import( './miniJeux/MotsCaches'));
const Memory = lazy(() => import( './miniJeux/Memory'));
const ChiFuMi = lazy(() => import( './miniJeux/ChiFuMi'));
const BattleShipGame = lazy(() => import( './miniJeux/BatailleNavale'));
const Morpion  = lazy(() => import( './miniJeux/Morpion'));
const Game = lazy(() => import( './puissance4/Puissance4'));
const JacquesADit = lazy(() => import( './miniJeux/JacqueADit'));
const Simon = lazy(() => import( './miniJeux/Simon'));
const WhackAMole = lazy(() => import( './miniJeux/WhackAMole'));
const Moulin  = lazy(() => import( './miniJeux/Moulin'));
const SpeedShoot = lazy(() => import( './speedShoot/SpeedShoot'));
const Shootemup = lazy(() => import( './shootemup/Shootemup'));
const Arkanoid = lazy(() => import( './arkanoid/Arkanoid'));
const Lettre = lazy(() => import( './miniJeux/Lettre'));
const Snake = lazy(() => import( './2048/snake/Snake'));
const Board2048 = lazy(() => import( './2048/Board2048'));
const JeuDeTir = lazy(() => import( './jeuDeTir/JeuDeTir'));
const BalanceInfernale = lazy(() => import( './miniJeux/BalanceInfernale'));
const CurlingGame = lazy(() => import( './curling/CurlingGame'));
const SonarGame = lazy(() => import( './sonar/SonarGame'));
const ClickTouche = lazy(() => import( './miniJeux/ClickTouche'));
const DobbleGame = lazy(() => import( './miniJeux/Dobble'));
const RocketDrop = lazy(() => import( './miniJeux/RocketDrop'));
const BacterieInc = lazy(() => import( './bactInc/BacteriaInc'));
const Tamagochat = lazy(() => import( './tamagochat/Tamagochat'));
const ChopezMoi = lazy(() => import( './miniJeux/ChopezMoi'));
const JeuQuiTeJuge = lazy(() => import( './miniJeux/JeuQuiTeJuge'));
const Monopoly = lazy(() => import( './monopoly/Monopoly'));
const WarGame = lazy(() => import( './wargame/WarGame'));
const KamonLayout = lazy(() => import( './kamon/KamonLayout'));
  
const EmpileGame = lazy(() => import( './kamon/EmpileGame'));
const Corruptor  = lazy(() => import( './corruptionGame/Corruptor'));

const HaikuGarden = lazy(() => import( './miniJeux/PoemGame'));
const FirePlace = lazy(() => import( './miniJeux/fireplace/Fireplace'));
const CosmicMeteorGame = lazy(() => import( './meteorite/Meteor'));
const BeloteGame = lazy(() => import( './belote/Belote'));
const GameBoardScopa = lazy(() => import( './scopa/Scopa'));
const GameBoardTrouduc = lazy(() => import( './scopa/trouduc'));
const PokerGame = lazy(() => import( './poker/PokerClaude'));
const MaqCity = lazy(() => import( './gangCity/GangCity'));
const FootballCoach = lazy(() => import('./football/TacticalCommand'));

//tags : iaInside
export const GAMES_DATA = [
  {
    categorie: 'Une partie contre une IA ?',
    jeux: [
      {
        name: "Jeu d'echec",
        id:'echec',
        component: Echecs,
        icon: 'Psychology', 
        favori:1,
        image:'https://upload.wikimedia.org/wikipedia/commons/4/4e/Chess_pieces_close_up.jpg',
        description: 'Claude Magnus le bot tueur',
        status: 'success',
        tags: ['iaInside', 'board', 'strategie',  'premium']
      },
      {
        name: 'Mémégram',
        component: Anagram ,
        image:'https://www.sportcerebral.com/media/catalog/product/A/N/ANG-183-26_1200_1.png',
        icon: 'LocalFlorist',
        description: 'Pour mémé, ce jeu est pour toi',
        status: 'info',
        tags: [ 'remake', 'mobileFriendly','basique', 'pourVieux']
      },
      {
        name: 'Mémé-mots-cachés-gram',
        component: MotsCaches ,
        image:'https://www.pour-enfants.fr/mots-caches/mots-caches-a-imprimer-1.png',
        icon: 'LocalFlorist',
        description: 'Dans la serie des jeux pour vieux',
        status: 'info',
        tags: [ 'remake', 'mobileFriendly','basique', 'pourVieux']
      },
      {
        name: 'Mémémory',
        component: Memory ,
        image:'https://www.potiondevie.fr/wp-content/uploads/2011/12/jeu-paires.jpg',
        icon: 'LocalFlorist',
        description: 'Dans la serie des jeux pour vieux',
        status: 'info',
        tags: [ 'remake', 'mobileFriendly','basique', 'pourVieux']
      },
      {
        name:"Bacterie 9.2", 
        id:'bacterie9',
        component: Bactery9 ,
        image:'https://inserm.b-cdn.net/wp-content/uploads/2017-11/agriculturalresearchservice-ericerbe-ecolibacterie-1024x744.jpg',
        icon: 'Biotech',
        description: "Allez, c'est reparti, cette fois avec une nouvelle technique ECS",
        status: 'warning',
        tags: [ 'bacterie',  'physique', 'evolution', 'zeroJoueur']
      },
      {
        name:"Shuffle Puck café", 
        id:'shufflepuck',
        component: ShufflePuck ,
        image:'https://upload.wikimedia.org/wikipedia/en/3/31/Shufflepuck_Caf%C3%A9_Coverart.png',
        icon: 'SportsHockey',
        description: "Shuffle puck comme sur Amstrad, mais en mieux",
        status: 'warning',
        tags: [ 'physique',  'humour', 'retro', 'iaInside']
      },
      {
        name: 'Dames',
        component: Dame,
        favori:1.1,
        icon: 'Apps',
        image:'https://upload.wikimedia.org/wikipedia/commons/3/30/International_draughts.jpg',
        description: 'IA de force 3 je dirai. Facilement battable si vous savez bien jouer',
        status: 'success',
        tags: ['iaInside', 'board',  'mobileFriendly', 'strategie']
      },
      {
        name: 'Flip Seven',
        component: Flip7,
        favori:1,
        icon: 'Casino',
        image:'https://www.ludocortex.fr/39162-home_default/flip-7.jpg',
        description: 'Basé sur le jeu Flip7 dont jai meme pas les regles',
        status: 'success',
        regle:"Flip Seven:Jeu de stop ou encore, des qu'une carte numerotee arrive en double, le tour s'arrete. En sidant STOP, on empoche les gain du tour. VCartes speciales Stop pour faire stopper un adversaire de force, 3Cartes pour donner 3 cartes de force a un adversaire et Joker pour eviter un double. Arriver a 7 cartes revient a faire un flip Seven, tout le monde empcohe avec 15 points de bonus pour le gagnant",
        tags: ['iaInside', 'cartes', 'hasard', 'strategie', 'remake', 'multijoueur']
      }, {
        name:"Belote", 
        id:'belote',
        image:'https://exoty.com/wp-content/uploads/2022/02/ico-belote.png',
        component: BeloteGame,
        icon: 'LocalCasino',
        description: "Jeu de belot classique",
        status: 'warning',
        tags: [ 'iaInside', 'cartes', 'hasard',  'mobileFriendly',  'strategie', 'multijoueur', 'remake', 'premium']
      }, {
        name:"Bomberman", 
        id:'bomberman',
        component: Bomberman ,
        image:'https://www.pixel-maniac.com/article/Bomberman/gal_2.png',
        icon: 'AutoFixHigh',
        description: "Inspiré du Bomberman de 1986 sur Amstrad CPC 464",
        status: 'warning',
        tags: [ 'action',   'strategie', 'retro']
      }, 
      {
        name:"Ediacarien 10.0", 
        id:'bacterie10',
        component: Precambrien ,
        image:'https://upload.wikimedia.org/wikipedia/commons/1/15/Life_in_the_Ediacaran_sea.jpg',
        icon: 'Biotech',
        description: "L'ère Ediacarienne : les premières formes de vie multicellulaire apparaissent",
        status: 'warning',
        tags: [ 'bacterie',  'physique', 'evolution', 'zeroJoueur']
      }, 
      {
        name:"Cambrien 11.0", 
        id:'cambrien11',
        component: Cambrien ,
        image:'https://sciencespourtous.univ-lyon1.fr/files/2019/11/en-tete.jpg',
        icon: 'Biotech',
        description: "Allez, c'est reparti, cette fois on va plus loin",
        status: 'warning',
        tags: [ 'bacterie',  'physique', 'evolution', 'zeroJoueur']
      }, 
      {
        name:"Evolution 12.0", 
        id:'evo12',
        component: Evo12 ,
        image:'https://sciencespourtous.univ-lyon1.fr/files/2019/11/en-tete.jpg',
        icon: 'Biotech',
        description: "La version finale de mon delire evolutif . Plus interactif",
        status: 'warning',
        tags: [ 'bacterie',  'simulation', 'evolution']
      }, 
      {
        name:"Geologie 13.0",
        id:'geo13',
        component: Geo13 ,
        image:'https://odysseedelaterre.fr/wp-content/uploads/2022/03/geologie-grand-canyon.jpg',
        icon: 'Biotech',
        description: "La version finale de mon delire evolutif . Plus interactif",
        status: 'warning',
        tags: [ 'bacterie',  'simulation', 'evolution']
      },
      {
        name:"Carbonifère 14",
        id:'carbonifere14',
        noBackButton:true,
        component: Carbonifere14,
        image:'https://www.laregion.fr/IMG/logo/agendaon1837.jpg',
        icon: 'Biotech',
        description: "Simulation évolutive de plantes à ADN sur un monde vivant. Pousse sur des semaines, interagis en likant les plus belles fleurs.",
        status: 'warning',
        tags: [ 'simulation', 'evolution',  'mobileFriendly']
      },
      {
        name:"Worldbox",
        id:'worldbox',
        noBackButton:true,
        component: WorldBox,
           icon: 'House', 
        image:'https://toitsalternatifs.fr/wp-content/uploads/2017/02/12472782_589845671168144_6839326578868671570_n.jpg',
        description: "Grosse idee de village autonome. Mappé sur Worldbox, TRES complet",
        status: 'info',
        tags: ['zeroJoueur',  'rpg', 'ambitieux', 'elevage']
      },
    
      
     {
        name:"Trou du cul", 
        id:'trouduc',
        component: GameBoardTrouduc,
        image:'https://porngifs.tv/contents/videos_screenshots/143000/143878/preview.jpg',
        icon: 'LocalCasino',
        description: "Roi ou trou du cul : le jeu de cartes hiérarchique façon Président",
        status: 'success',
        tags: [ 'iaInside', 'cartes', 'hasard', 'strategie', 'multijoueur', 'remake', 'premium']
      },
     {
        name:"Kratland", 
        id:'kratland',
        component: Kratland,
        image:'',
        icon: 'LocalCasino',
        description: "Inspiré de Kraland, mais en plus desert",
        status: 'success',
        tags: [ 'multijoueur', 'simulation', 'rpg', 'workInProgress', 'remake', 'premium']
      },
      
     {
        name:"Joyeux anniversaire", 
        id:'anniv',
        component: Birthday,
        image:'https://patisserie-valerie.co.uk/cdn/shop/products/happy-birthday-cake-toppers-676048_800x.jpg?v=1691773627',
        icon: 'Cake',
        description: "Jeu pour les anniversaires",
        status: 'warning',
        tags: [  'hasard',  'humour',  'mobileFriendly', 'basique']
      },
      {
        name: 'Uno',
        component: UnoBoard,
        favori:1,
        icon: 'LooksOne',
        image:'https://www.regles-de-jeux.com/wp-content/uploads/2012/09/regle-uno-300x2251.jpg',
        description: 'Uno tout betement',
        status: 'success',
        regle: 'Regles normales du jeu de Uno. Cliquer sur les cartes pour les jouer',
        tags: ['iaInside', 'cartes', 'hasard', 'multijoueur', 'remake']
      },
      {
        name: 'Morpion',
        component: Morpion,
        icon: 'GridView',
        image:'https://i-mom.unimedias.fr/2020/09/16/le-jeu-du-morpion.jpg',
        description:"Juste imbattable",
        regle: 'Vous connaissez pas les regles du Morpion ? Quel loser ! Demerde-toi !',
        status: 'success',
        tags: ['iaInside', 'board', 'strategie',  'mobileFriendly',  'retro', 'basique', 'humour']
      },{
        name: 'Poker de Claude',
        component: PokerGame,
        favori:1,
        icon: 'LocalCasino',
        image:'https://medias.pourlascience.fr/api/v1/images/view/5a82aa0b8fe56f4a3a18ec74/wide_1000-webp/image.jpg',
        description: 'En mode Claude fait tout',
        status: 'warning',
        regle: 'Toutes les regles du Texas Holdem sont respectees. Cliquer sur Distribuer les Cartes pour commencer',
        tags: ['iaInside', 'cartes', 'hasard', 'strategie', 'multijoueur', 'premium']
      },
        {
        name:"Scopa", 
        id:'scopa',
        component: GameBoardScopa,
        image:'https://i.ytimg.com/vi/fOTakz_2JIA/maxresdefault.jpg',
        icon: 'LocalCasino',
        description: "Jeu de scopa classique",
        status: 'warning',
        tags: [ 'iaInside', 'cartes', 'hasard', 'strategie', 'multijoueur',  'premium']
      }, 
      {
        name:"Kamon", 
        id:'kamon',
        component: KamonLayout,
        icon: 'EmojiSymbols',
        image:'https://www.jeuxdenim.be/images/articles/269_1_large.jpg',
        description: 'Le jeu du Kamon',
        status: 'success',
        tags: ['iaInside', 'board', 'casse-tete', 'mobileFriendly', 'remake']
      },
      {
        name: 'Puissance4',
        component: Game,
        icon: 'Apps',
        image:'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Connect_Four.jpg/250px-Connect_Four.jpg',
        description: 'Avec une IA de force 2, plutot facile a battre',
        status: 'success',
        regle:'Non mais je reve, vous allez dire que vous connaissez pas les regles du Puissance 4 ?? J\'hallucine !',
        tags: ['iaInside', 'board', 'strategie', 'mobileFriendly', 'retro']
      },
      {
        name:"Monopoly", 
        id:'monopoly',
        component: Monopoly,
        icon: 'Casino',
        image:'https://www.shutterstock.com/image-photo/uk-london-april-28-2024-260nw-2513519977.jpg',
        description: 'Un monopoly un peu perso',
        status: 'warning',
        tags: ['iaInside', 'board', 'hasard', 'gestion', 'multijoueur', 'retro']
      }
    ]
  },
  {
    categorie: 'Ca bouge tout seul',
    jeux: [
      {
        name: 'Ecosysteme',
        component: B8Board,
        icon: 'Biotech', 
        image:'https://www.shutterstock.com/image-vector/simplest-unicellular-organisms-set-bacteria-600nw-2539127381.jpg',
        description: 'Bacterie 8.0. Y a carrement une video https://youtu.be/_ZqDZfe6ER4',
        status: 'success',
        tags: ['zeroJoueur', 'bacterie', 'evolution',  'ambitieux', 'premium']
      },
      {
        name: 'Mee',
        component: MeeManager,
        icon: 'EmojiPeople',
        image:'https://www.shutterstock.com/image-vector/simplest-unicellular-organisms-set-bacteria-600nw-2539127381.jpg',
        description: 'Bacterie 7.0 social',
        status: 'success',
        tags: ['zeroJoueur', 'bacterie', 'evolution', 'gestion']
      },
      {
        name: 'GodBoard',
        component: GodBoard,
        image:'https://www.shutterstock.com/image-vector/simplest-unicellular-organisms-set-bacteria-600nw-2539127381.jpg',
        icon: 'FlashOn',
        description: 'Une inspiration dominicale qui a fait long feu',
        status: 'info',
        tags: ['zeroJoueur', 'bacterie', 'evolution']
      },
      {
        name: 'Sprouts',
        component: SproutPanel ,
        icon: 'Grass',
        image:'https://www.shutterstock.com/image-vector/simplest-unicellular-organisms-set-bacteria-600nw-2539127381.jpg',
        description: 'AKA Bacterie 6.0',
        status: 'success',
        tags: ['zeroJoueur', 'bacterie', 'evolution',  'elevage']
      },
      {
        name: 'Bacterie 5.0',
        component: SmartBactPanel ,
        icon: 'BugReport',
        image:'https://www.shutterstock.com/image-vector/simplest-unicellular-organisms-set-bacteria-600nw-2539127381.jpg',
        description: "L'idee est de faire un jeu de bacterie/fourmis/gestions",
        regle: "Cliquer sur la base pour pondre des ouvriers. Ils vivent leur vie et ramene les ressources qu'ils trouvent. Cela permet d'ameliorer la base et de creer des installations qui permettent d'ameliorer les performances. Vous pouvez aussi viser une ressource en particulier, les autres seront ignorees",
        status: 'success',
        tags: [ 'bacterie', 'gestion', 'strategie']
      },
      {
        name: 'Fourmiz',
        component: Fourmiz ,
        favori:1,
        icon: 'EmojiNature',
        image:'https://www.shutterstock.com/image-vector/simplest-unicellular-organisms-set-bacteria-600nw-2539127381.jpg',
        description: 'Simulation de fourmiliere independante, Mecanismes par pheromones, regardez-les evoluer doucement',
        status: 'success',
        regle: 'Jeu a zero joueur, mais quand meme on peut configurer differentes colonies en concurrence avec le bouton en bas a droite',
        tags: ['zeroJoueur', 'bacterie', 'evolution',  'premium']
      },
      {
        name: 'Pot de fleur 2.0',
        component: PotDeFleur20 ,
        favori:0.2,
        icon: 'LocalFlorist',
        image:'https://img.freepik.com/photos-gratuite/celebration-journee-arbre-plante-verte_23-2149391934.jpg?semt=ais_hybrid&w=740&q=80',
        description: 'Deuxième itération du pot de fleur, physique améliorée',
        status: 'success',
        regle: 'Algorithme genetique qui se joue tout seul',
        tags: ['zeroJoueur', 'evolution', 'elevage']
      },
      {
        name: 'Bactery',
        component: Etuve ,
        icon: 'BugReport',
        image:'https://www.shutterstock.com/image-vector/simplest-unicellular-organisms-set-bacteria-600nw-2539127381.jpg',
        description: 'Un jeu a 0 joueurs, ca vit tout seul (jusqu\'a la mort)',
        status: "info",
        regle: 'Un jeu a 0 joueur on a dit, le seul interet est de les regarder vivre , y a moyen de changer des parametres pour influer l\'evolution des bebetes',
        tags: ['zeroJoueur', 'bacterie', 'evolution']
      },
      {
        id: 'cellular-blob',
        name: 'Cellular Blob',
        component: CellularEvolutionSim ,
        description: 'Tentative d evolution multi-celullaire',
        icon: 'BugReport',
        image:'https://www.shutterstock.com/image-vector/simplest-unicellular-organisms-set-bacteria-600nw-2539127381.jpg',
        status: 'info',
        tags: ['zeroJoueur', 'bacterie', 'evolution', 'physique']
      },
      {
        id: 'cellular-crawlingblob',
        name: 'Cellular Blob',
        component: CrawlingBlob ,
        description: "Tentative d evolution multi-celullaire, mais c'est pas fini",
        icon: 'BugReport',
        image:'https://www.shutterstock.com/image-vector/simplest-unicellular-organisms-set-bacteria-600nw-2539127381.jpg',
        status: 'info',
        tags: ['zeroJoueur', 'bacterie', 'evolution', 'physique']
      },
      {
        name: 'Bubulles',
        component: Bubulle ,
        icon: 'BubbleChart',
        image:'https://www.shutterstock.com/image-vector/simplest-unicellular-organisms-set-bacteria-600nw-2539127381.jpg',
        description: 'Jeu a 0 joueur encore une fois, faudra que je consulte. Celui-ci est fascinant',
        status: 'success',
        regle: 'Tout est rapport de force d\'attraction et de repulsion, amusez-vous a changer les reglages... Pour les flemmards, j\'ai des boutons de choix au hasard et j\'en ai trouvé une amusante a regarder... Hypnotisant !',
        tags: ['zeroJoueur', 'physique']
      },
      {
        name: 'Pot de fleur genetique',
        component: PotDeFleur ,
        favori:1,
        icon: 'LocalFlorist', 
        image:'https://img.freepik.com/photos-gratuite/celebration-journee-arbre-plante-verte_23-2149391934.jpg?semt=ais_hybrid&w=740&q=80',
        description: 'toujours de l\'algo genetique',
        status: 'success',
        tags: ['zeroJoueur', 'evolution', 'elevage', 'premium']
      },
      {
        name: 'Bacterie 2.0',
        component: PetriBox ,
        icon: 'BugReport',
        image:'https://www.shutterstock.com/image-vector/simplest-unicellular-organisms-set-bacteria-600nw-2539127381.jpg',
        description: 'Experimentation d\'algorithme genetique',
        status: 'info',
        regle: "Ca roule tout seul, y a qu'a observer les generations successives trouver la meilleure optimisation",
        tags: ['zeroJoueur', 'bacterie', 'evolution', 'basique']
      }
    ]
  },
  {
    categorie: 'RPG-aventures',
    jeux: [
      {
        name: 'Civilization',
        favori:0.5,
        component: Civilization,
        icon: 'Map',
        image: 'https://static.actugaming.net/media/2024/08/Sid-Meiers-Civilization-VII_2024_08-20-24_003-1920x1080-1-889x500.jpg',
        description: 'On tente le Civilization de ma jeunesse',
        status: 'success',
        tags: [ 'strategie', 'gestion', 'remake', 'ambitieux']
      },
      {
        name:"Sofie la salope", 
        id:'corruptGame',
        image:"https://i.redd.it/9c9flqp3fnvb1.gif",
        component: Corruptor ,
        icon: 'GpsFixed',
        description: "Un jeu pas pour les enfants. Je suis serieux, c'est porno, et pas soft, c'est vraiment hard-core, pour public tres averti",
        status: 'warning',
        tags: [ 'rpg', 'adulte', 'original', 'ambitieux', 'humour']
      },
      {
        name: 'Ezio trip reloaded',
        favori:1.1,
        id:'ezioTrip',
        component: CatRPG,
        image: 'https://upload.chatsdumonde.com/img_global/24-culture/_light-18002-publicite-felix-chat-1989.jpg',
        icon: 'DirectionsRun',
        description: "Les aventures d'Ezio",
        status: 'success',
        tags: [ 'rpg', 'humour', 'original', 'premium', 'clavier']
      },
      {
        name: 'Knight RPG',
        favori:0.5,
        component: RPG,
        icon: 'Security', 
        image:'https://st5.depositphotos.com/38874124/66570/v/450/depositphotos_665708884-stock-illustration-pixel-game-interface-elements-80s.jpg',
        description: 'Run RPG en vue de coté avec editeur de niveau',
        status: 'info',
        tags: [ 'rpg', 'action', 'clavier', 'ambitieux']
      },
      {
        name: 'Tower defense',
        component: TowerDefense ,
        icon: 'Apartment',
        image:'https://img.succesone.fr/2025/04/cover_fantasy-tower-defense_xbox-one.jpg',
        description: 'Un bon tower defense, les tours peuvent etre upgradees, le niveau s\'adapte et les ennemis changent',
        status: 'success',
        tags: [ 'strategie', 'action', 'remake', 'souris']
      },
      {
        name: 'Maq-city',
        component: MaqCity,
        image:'https://www.cinematheque.qc.ca/workspace/uploads/projections/mv5bmty1otu2ote5ov5bml5banbnxkftztcwntc0otaynw-_v1_-fr-1676294837.jpg',
        icon: 'LocationCity',
        description: "Vivez la vie d'un maquereau dans le Strasbourg by night",
        status: 'warning',
        regle:"Recrutez des filles, placez-les dans les meilleurs quartiers, prenez soin d'elle ou elle ne peuvent plus travailler ⚡ ",
        tags: [ 'gestion', 'strategie', 'original', 'adulte', 'premium']
      },
      {
        name: 'Final Fantasy 0.1',
        component: FinalFantasy10 ,
        icon: 'AutoAwesomeMotion',
        description: 'Jeu de role sur 2 niveaux',
        status: 'info',
        tags: [ 'rpg', 'retro', 'humour','basique']
      }
    ]
  },
  {
    categorie: 'Creation originales',
    jeux: [
      {
        name: "Can't Stop",
        id:'cantstop',
        component: Alpiniste ,
        favori:1,
        icon: 'Terrain', 
        image:'https://www.jeuxdenim.be/images/jeux/CantStop_large02.jpg',
        description: "Le jeu de l'alpiniste . Un Stop ou Encore version dés",
        status: 'success',
        regle:"Basé sur le jeu Can't Stop. Il faut lancer les dés et faire des paires, vous avez 3 alpinistes pour emprunter 3 voies par tour. Si vous n'arrivez pas a faire une paire qui corresponde a une de vos voies ouvertes, vous perdez tout. Le premier a vaincre 3 sommets a gagné. Il est interdit de rester sur la meme case qu'un autre joueur (ca avantage enormement le 1er a jouer",
        tags: ['iaInside', 'board', 'hasard', 'mobileFriendly', 'strategie', 'multijoueur', 'remake', 'premium']
      },{
        name:"Feu de cheminee", 
        id:'cheminee',
        component: FirePlace ,
        image:'https://sf1.lechasseurfrancais.com/wp-content/uploads/2024/01/feu-scaled.jpg',
        icon: 'Fireplace',
        description: "Comment bien allumer un feu de cheminee",
        status: 'success',
        tags: [ 'gestion', 'original', 'mobileFriendly', 'physique']
      },
      {
        name:"Bacteria Inc.", 
        id:'bacteriaInc',
        image:'https://cdn.futura-sciences.com/sources/images/actu/maison-laboratoire-methamphetamine.jpeg',
        component: BacterieInc ,
        favori:1,
        icon: 'Coronavirus',
        description: "Gestion ambitiueuse d'un labo de bacteries",
        status: 'success',
        tags: [ 'gestion', 'bacterie', 'strategie', 'original', 'ambitieux', 'premium']
      },
      {
        name:"Empile des trucs", 
        id:'empileTruc',
        component: EmpileGame ,
        icon: 'Layers',
        image:'https://lesminis.fr/73219-large_default/hexagomino-chateau-de-calcul-hexagonal-pour-les-mathematiques.jpg',
        description: "Empile des machins de couleur, c'est TROP addictif !!",
        status: 'success',
        tags: [ 'casse-tete', 'original', 'premium', 'souris']
      },
      {
        name: 'Rush Hour',
        component: RushHour ,
        favori:1,
        icon: 'LocalParking', 
        image:'https://papapositive.fr/wp-content/uploads/2015/11/Capture-d%E2%80%99%C3%A9cran-2015-11-26-%C3%A0-16.49.08.png',
        description: 'Jeu de parking',
        status: 'success',
        tags: [ 'casse-tete', 'remake','mobileFriendly', 'souris']
      },
      {
        name: 'Farmer',
        component: FarmerGame,
        favori:1,
        icon: 'Agriculture', 
        image:'https://tcf.admeen.org/game/11000/10996/400x246/sheep-farm.jpg',
        description: 'Un elevage game... Classique ou presque, y a un twist apres le level 10',
        status: 'success',
        regle:"Suivez les instructions du genie pour avancer. Gerez bien votre stock et si vous etes en galere, accedez au menu pour Cheat dans l'Entrepot.. Mais faites attention au X Mode",
        tags: [ 'gestion', 'elevage', 'original', 'humour', 'premium']
      },
      {
        name: 'Bite Life',
        component: EntreeDansLaVie ,
        favori:1,
        icon: 'Favorite',
        image:'https://lareclame.fr/wp-content/uploads/2010/03/specsaver-lynx-arttop.jpg',
        description: 'Entre les Sims et BitLife mais sans la pub et en mieux et en plus porn',
        status: 'success',
        regle: 'Cliquer sur BONNE ANNEE pour faire avancer le jeu. Attention jeu interdit aux moins de 18 ans',
        tags: [ 'rpg', 'adulte', 'humour', 'original', 'premium']
      },
      {
        name: 'Awale',
        component: AwaleBoard ,
        favori:1,
        icon: 'Grain',
        image:'https://upload.wikimedia.org/wikipedia/commons/9/9d/Awal%C3%A9.jpg',
        description: 'Jeu africain de graines. IA de force 3.',
        status: 'success',
        regle: 'En fait c\'est simple: Chacun son tour le joueur choisis un trou de son coté et répartis les graines une par une dans les trous suivants dans le sens anti-horaire. La derniere graine decide du coup, si elle tombe sur un trou qui avait 1 ou 2 graines, il peut ramasser toutes les graines du trou et meme celles du trou precedent si il avait aussi 1 ou 2 graines (donc 2 ou 3 apres repartition), et ainsi de suite. Si vous ne pouvez pas jouer, ou voulez passer votre tour cliquez sur une case vide. L\'IA abandonne si elle est en mauvaise posture et qu\'il reste 3 graines ou moins ',
        tags: ['iaInside', 'board', 'strategie',  'mobileFriendly', 'premium']
      },
      {
        name:"Meteorite vers trou noir", 
        id:'meteor',
        image:'https://cdn8.futura-sciences.com/a1280/images/actu/trou_noir_meteorite_2_nasa_02.jpg',
        component: CosmicMeteorGame ,
        icon: 'Star',
        description: "Copie illegale de Star drifter. Grossissez de debris spatial a etoile a neutron ou trou noir",
        status: 'success',
        tags: [ 'physique',  'ambitieux', 'remake', 'premium']
      },
      {
        name: 'Balance Infernale',
        id:'balance',
        component: BalanceInfernale ,
        image:'https://static.vecteezy.com/ti/vecteur-libre/t2/18765604-icone-d-echelle-dans-un-style-plat-illustrationle-d-equilibre-de-poids-sur-fond-isole-concept-d-entreprise-de-signe-de-comparaison-d-equilibre-vectoriel.jpg',
        favori:0.5,
        icon: 'Balance',
        description: "Jeu d'equilibre, hyper addictif",
        status: 'success',
        regle: 'Deplacez le pivot avec la souris pour garder l\'equilibre. Plus vous etes en equilibre, plus vous marquez de points. Le jeu s\'arrete si vous perdez l\'equilibre (60 degres de penche) ou si le temps est ecoule (20 secondes).',
        tags: [ 'action', 'physique', 'original', 'souris', 'mobileFriendly', 'basique']
      },
      {
        name:"Tamagochat", 
        id:'Tamagochat',
        component: Tamagochat ,
        icon: 'Pets',
        image:'https://m.media-amazon.com/images/I/71X+xe1NeIL.jpg',
        description: 'Un tamagotchi mais avec un chat',
        status: 'info',
        tags: [ 'elevage', 'retro', 'humour']
      },
      {
        name: 'Bataille navale', 
        id:'batailleNavale',
        image:'https://www.mamizette.com/wp-content/uploads/elementor/thumbs/Bataille-navale-pmv4ucxtw1e0cz382kor5fbdyfp578g902b1qjlzt4.png',
        component: BattleShipGame ,
        icon: 'DirectionsBoat',
        description: "Bataille navale, mais avec des bombes",
        status: 'success',
        tags: ['iaInside', 'board', 'strategie',  'retro']
      },
      {
        name: 'Curling',
        component: CurlingGame ,
        icon: 'SportsCurling',
        description: 'Jeu basique. Le mouvement est nickel, attention a la musique de fin personnelle ! Un des premiers jeux (ere pre-IA)',
        status: 'success',
        regle: 'Cliquez dans la partie gauche de la patinoire pour faire apparaitre une pierre, maintenez le bouton de la souris appuyee. Controlez la vitesse de votre souris au moment precis du lancer de pierre, le passage de la ligne verticale fait automatiquement lacher la pierre. Passez la souris sur les pierres pour balayer devant et conserver leur inertie un peu plus longtemps. ',
        tags: ['multijoueur', 'physique', 'basique', 'souris']
      },
      {
        name: 'Peche au sonar',
        component: SonarGame ,
        icon: 'Radar',
        description: 'Jeu au clavier, trouvez le tresor en donnant des coups de sonar',
        status: 'success',
        regle:'Tout se joue au clavier.    Appuyer sur les fleches pour deplacer le bateau, appuyez sur Espace pour lancer un coup de sonar. Si le bateau ne va pas assez vite ou si le rayon du sonar est trop petit, allez a la BOUTIQUE pour augmenter vos competences. Quand vous vous sentez suffisamment pres du tresor, lancer le filet (ENTREE) , attention vous n\' en avez que 3',
        tags: [ 'original', 'souris', 'basique']
      }
    ]
  },
  {
    categorie: 'Experiences',
    jeux: [
      {
        name:"Kaleidopoeme", 
        id:'poemeGame',
        component: HaikuGarden ,
        icon: 'FilterVintage',
        description: "Voila ce qui arrive quand Prune et Claude imaginent un jeu",
        status: 'info',
        tags: [ 'original', 'basique']
      },
      {
        name: 'Open library',
        component: OpenLibrary ,
        icon: 'MenuBook',
        description: 'exercide de requetes sur cette API',
        status: 'info',
        tags: ['original', 'basique']
      },
      {
        name: 'Conway',
        component: GameOfLife ,
        favori:0.9,
        icon: 'GridOn', 
        image:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCC1IR7RKw1-TlEl0G3sYmqi9aXR93q47atg&s',
        description: 'automates cellulaires',
        status: 'info',
        tags: ['zeroJoueur', 'evolution', 'mobileFriendly', 'physique']
      },
      {
        name: 'TI 87',
        component: Calculator ,
        icon: 'Calculate',
        description: 'Simulation des capacités de la Texas Instrument 87 de mon enfance',
        status: 'info',
        tags: [ 'remake', 'clavier']
      },
      {
        name: 'OhCestBeau',
        component: ClickTouche,
        icon: 'ColorLens',
        regle:"A definir",
        description: 'Pour se reposer les neurones',
        status: 'warning',
        tags: [ 'basique', 'souris']
      },
      {
        name: 'Jardin magique',
        component: Jardin ,
        icon: 'LocalFlorist',
        description: 'Pour Severine',
        status: 'info',
        regle: <><Typography paragraph={true}>Cliquer pour ajouter une plante.
            L'icone "?" a cote du nom va chercher une image, celui a cote de la description va chercher les infos pour la plante.
            Placer les plantes dans le jardin.</Typography></>,
        tags: [ 'gestion', 'original']
      }
    ]
  },
  {
    categorie: 'Ca rigole',
    isMiniJeux: true,
    jeux: [
      {
        name:"Chopez-moi", 
        id:'chopezMoi',
        component: ChopezMoi ,
        icon: 'PanTool',
        description: 'Principe ultra-simple et montée en difficulté progressive',
        status: 'success',
        tags: [ 'action', 'basique', 'souris', 'humour']
      },
      {
        name: 'Pissotiere',
        component: Pissotiere ,
        icon: 'Wc',
        regle: 'Bien savoir pisser, c\'est un truc de mec',
        status: 'success',
        tags: [ 'action', 'humour', 'original', 'souris']
      },
      {
        name:"Le jeu qui te juge", 
        id:'jugezMoi',
        component: JeuQuiTeJuge ,
        icon: 'Gavel',
        description: 'Principe ultra-simple et troll de joueur',
        status: 'success',
        tags: [ 'humour', 'original', 'souris', 'clavier', 'basique']
      },
      {
        name: 'Cul-Clicker',
        component: Clicker ,
        id:'culClicker',
        favori:0.5,
        image:'https://img.itch.zone/aW1nLzExMDQxNjgzLnBuZw==/315x250%23c/EqNd4V.png',
        icon: 'TouchApp',
        regle: 'Y a juste a cliquer et ameliorer le click rate',
        status: 'info',
        tags: [ 'elevage', 'remake', 'humour', 'mobileFriendly', 'adulte']
      },
      {
        name: 'Jacques A Dit',
        id:'jacqueADit',
        component: JacquesADit ,
        icon: 'RecordVoiceOver',
        description: 'Le jeu classique du Jacques-a-dit. ',
        regle:"Vous avez 3 secondes pour faire l'action demandee par Jacques uniquement. Le score se fige apres une minute",
        status: 'success',
        tags: [  'retro', 'clavier', 'humour', 'basique']
      },
      {
        name: 'Chi-Fu-Mi',
        id: 'ChiFuMi' ,
        component: ChiFuMi ,
        image:'https://ssaft.com/Blog/dotclear/public/WindowsLiveWriter/Shifumi_14CFE/image_4.png',
        icon: 'BackHand',
        regle: 'Pierre detruit le ciseau mais est etouffé par la feuille, Ciseau coupe la feuille. Les regles Lezard-Spock sont indiquees plus bas',
        status: 'info',
        tags: ['iaInside', 'basique', 'mobileFriendly', 'hasard', 'retro']
      }
    ]
  },
  {
    categorie:'Classique d\'enfance',
    isMiniJeux: true,
    jeux:[
      {
        name: 'Simon',
        component: Simon ,
        icon: 'Memory',
        image:'https://img.over-blog-kiwi.com/0/93/14/83/20171214/ob_bff658_tete-simon.jpg',
        description: 'Le jeu classique du Simon.',
        regle: 'Alors j\'ai appris en faisant ce jeu que le Simon considere la partie gagnee a partir de 32 notes memorisees... Bonne chance (en plus j\'ai laissé un bug a la fin, trop dur a reproduire)',
        status: 'success',
        tags: [ 'action', 'retro', 'souris', 'mobileFriendly', 'basique']
      },
      {
        name:"Rocket Drop", 
        id:'rocketDrop',
        component: RocketDrop ,
        icon: 'RocketLaunch',
        description: 'Travail sur la physique des collisions',
        status: 'info',
        tags: [ 'action', 'physique', 'remake', 'clavier']
      },
      {
        name: 'WhackAMole',
        component: WhackAMole,
        image:'https://brainstormedu.com/wp-content/uploads/2021/03/moleintro.gif',
        icon: 'PestControl',
        description: 'Il faut juste taper sur les tetes qui apparaisse t',
        status: 'info',
        tags: [ 'action', 'remake',  'mobileFriendly','souris']
      },
      {
        name: 'Dobble',
        component: DobbleGame ,
        image:'https://www.dobblegame.com/wp-content/uploads/sites/2/2019/06/1600x1600_ecotin-1024x1024.png',
        favori:0.4,
        icon: 'DoubleArrow',
        description: "Le Dobble classique, mais customisé",
        status: 'success',
        tags: [ 'action', 'remake', 'mobileFriendly','souris','cartes']
      },
      {
        name: 'Relie les points',
        component: Moulin ,
        icon: 'Timeline',
        description: 'Chacun son tour, vous activez une ligne. celui qui ferme un carre gagne un point et peut rejouer',
        status: 'success',
        tags: ['iaInside', 'board', 'strategie', 'mobileFriendly', 'retro', 'souris', 'basique']
      },
      { 
        name: 'Proverbe',
        component: Proverbe ,
        image:'https://img.over-blog-kiwi.com/1/33/04/83/20171111/ob_6055f3_vendre-la-peau-de-l-ours.png',
        icon: 'RecordVoiceOver',
        description: 'Serie des jeux pour vieux. Testez votre culture des proverbes',
        status: 'success',
        tags: [ 'mobileFriendly', 'retro', 'basique']
      },
      {
        name: 'Speed Shooter',
        id:'SpeedShoot',
        component: SpeedShoot ,
        icon: 'SportsEsports',
        description: 'pour Rodolphe, pas fini',
        status: 'info',
        regle: 'Fleche du haut ou bas pour deplacer le personnage, la souris pour cliquer, fleche droite pour accelerer, gauche pour ralentir',
        tags: [ 'action', 'clavier', 'souris', 'basique']
      },
      {
        name: 'Shoot\'em up',
        component: Shootemup ,
        icon: 'Whatshot',
        description: "Pas terrible, ca m'a pas inspiré",
        status: 'info',
        tags: [ 'action', 'clavier', 'basique']
      },
      {
        name: 'Arkanoid',
        component: Arkanoid ,
        icon: 'SportsTennis',
        description: 'le casse-brique orirginel',
        status: 'success',
        tags: [ 'action', 'retro', 'souris']
      },
      {
        name: 'Lettre',
        component: Lettre ,
        icon: 'Polyline',
        regle: 'Le but est de joindre tous les points de l\'enveloppe sans repasser par la meme ligne',
        status: 'info',
        tags: [ 'casse-tete', 'retro', 'souris', 'basique']
      },
      {
        name: 'Snake',
        component: Snake,
        icon: 'SsidChart',
        description: 'ce bon vieux jeu bien connu',
        status: 'success',
        regle:'Cliquer pour donner la direction pour le serpent, sinon ce sont les regles habituelles du Snake',
        tags: [ 'action', 'retro', 'souris', 'basique']
      },
      {
        name: 'Jeu de tir',
        component: JeuDeTir ,
        icon: 'GpsFixed',
        description: 'Avec cibles mouvantes, jeu a 2 joueurs (aucun interet de faire jouer une IA)',
        status: 'info',
        tags: ['multijoueur', 'action', 'souris', 'basique']
      },
      {
        name: '2048',
        component: Board2048 ,
        favori:0.4,
        image:'https://www.coolmathgames.com/sites/default/files/2021-02/snake%20chain_0.gif',
        icon: 'Grid4x4',
        description: 'Faites glisser les tuiles pour atteindre 2048',
        status: 'success',
        tags: [ 'casse-tete', 'remake', 'mobileFriendly', 'clavier']
      },
    ]
  },
  {
    categorie: 'Work in progress',
    jeux: [
     {
        name:"Cult-Manager", 
        id:'cultManager',
        component: CultManagementGame ,
        image:'https://c.files.bbci.co.uk/7599/production/_112050103_cult_3.png',
        icon: 'Psychology',
        description: "Devenez un gourou d'une secte machiavelique",
        status: 'warning',
        tags: [ 'adulte', 'humour', 'original',  'mobileFriendly', 'premium']
      }, {
        name:"Gipsy", 
        id:'gipsy',
        component: GipsyGame ,
        image:'https://www.everygamegoing.com/ills_small/amstrad/amsoft/tapes/Splat-005.gif',
        icon: 'SportsEsports',
        description: "Inspiré de Splat sur Amstrad",
        status: 'success',
        tags: [ 'humour', 'retro',  'clavier']
      }, 
      {
        name:"Snooker", 
        id:'snooker',
        component: SnookerGame ,
        image:'https://www.snookerregeln.de/images/515901-04_Snooker_Robertson_Tournament_RR-12_Mahogany.jpg',
        icon: 'SportsGolf',
        description: "Un vrai Snooker qui reagit comme un vrai.. Sauf qu'il y a des bonus sur le tapis ?",
        status: 'warning',
        tags: [ 'board', 'physique',  'action', 'retro']
      }, 
      {
        name:"Flipper", 
        id:'flipper',
        component: Flipper ,
        image:'',
        icon: 'SportsBaseball',
        description: "Un flipper assisté",
        status: 'warning',
        tags: [ 'hasard',  'physique', 'action', 'workInProgress']
      }, 
      {
        name:"Perudo", 
        id:'perudo',
        component: Perudo ,

        image:'https://leludopathe.fr/wp-content/uploads/2021/11/perudo-jeu-scaled.jpeg',
        icon: 'Casino',
        description: "Un bon vieu Perudo, le jeu de dés pour mec bourrés",
        status: 'warning',
        tags: [ 'hasard',  'mobileFriendly', 'iaInside']
      }, 
      {
        name:"Sorcery", 
        id:'sorcery',
        component: Sorcery ,
        image:'https://jeux.dokokade.net/wp-content/uploads/2018/05/Sorcery-logo.png',
        icon: 'AutoFixHigh',
        description: "Inspiré du Sorcery de 1984 sur Amstrad CPC 464",
        status: 'warning',
        tags: [ 'rpg', 'ambitieux',  'physique', 'workInProgress', 'retro']
      },{
        name:"La Theorie du Lundi", 
        id:'mondayTheory',
        component: MondayTheory ,
        image:'https://media1.ledevoir.com/images_galerie/originale_1500234_1156242/image.jpg',
        icon: 'Schedule',
        description: "Comme les Sims, mais en plus personnel et moins gestionnaire",
        status: 'warning',
        tags: [ 'evolution', 'humour', 'original', 'zeroJoueur']
      }, 
      {
        name:"War game",
        id:'wargame',
        component: WarGame ,
        icon: 'RocketLaunch',
        description: "Tentative de war game... loin d'etre finie",
        status: 'warning',
        tags: [ 'strategie',  'ambitieux', 'workInProgress']
      },
      {
        name: 'Football Entraîneur',
        id: 'footballCoach',
        component: FootballCoach,
        icon: 'SportsSoccer',
        image: 'https://img.sanctuary.fr/fiche/300/1128.jpg',
        description: "Sois l'entraîneur ! Dicte les tactiques en temps réel pendant que les joueurs jouent",
        regle: "Touches tactiques : [A] Attaque  [D] Défense  [T] Tacle  [G] Garder  [P] Presse haute  [F] Fuite  [C] Centre  [X] Dribble dangereux  [R] Repli  [M] Marquage  [Z] Zone  [H] Haut rythme  [S] Substitution. Le match dure 90 minutes (3 min réelles).",
        status: 'warning',
        tags: ['action', 'strategie', 'clavier', 'zeroJoueur']
      }
    ]
  }
];


