export const CAT_AROUND = [
  { id: "saleMatou", name: "Sale Matou", personality: { voleur: 0.4, amical: 0.1, curieux: 0.2, sociable: 0.2 } },
  { id: "cerise", name: "Cerise", personality: { voleur: 0.1, amical: 0.7, curieux: 0.5, sociable: 0.5 } },
  { id: "copain", name: "Copain", personality: { voleur: 0.7, amical: 1.0, curieux: 0.8, sociable: 0.9 } },
  { id: "harley", name: "Harley Quinn", personality: { voleur: 0.3, amical: 0.5, curieux: 0.1, sociable: 0.3 } },
  { id: "orange", name: "Touffu orange", personality: { voleur: 0.8, amical: 0.3, curieux: 0.7, sociable: 0.4 } },
];
export const CAT_EVENTS = [
  {
    id: "vomir",
    text: "Ton chat a vomi sur le tapis... 🤢",
    statModifier: { sante: -10, energy: -5, affection: -5 },
    flag: "vomir", // sert pour activer une action spéciale
    probability: 0.1,
  },
  {
    id: "visite_neveu",
    text: "Le petit neveu est en visite ! Le chat est stressé et bondit partout 😾",
    statModifier: { energy: -15, affection: -10, territorialite: +10 },
    probability: 0.08,
  },
  {
    id: "ronron_heureux",
    text: "Ton chat s’installe dans un rayon de soleil et ronronne paisiblement ☀️",
    statModifier: { energy: +10, affection: +5 },
    probability: 0.12,
  },
];
// Déjà au max : on tente un événement “BONHEUR”
           export     const happinessEvents = [
                    { name: "copulation", text: "C’est la saison des amours, ca copule 🌙", probability: 0.2 },
                    { name: "partage_repas", text: "On partage un bol de croquettes ensemble 😽", probability: 0.4 },
                    { name: "sieste_ensemble", text: "On fait la sieste côte à côte au soleil ☀️", probability: 0.4 },
                ];


                export const evilEvents = [
  {
    id: "combatDeGriffes",
    text: "Combat rapide et violent, toutes griffes dehors !",
    probability: 0.2,
    meetingResult: (cat, partner) => {
      const resultDice = Math.random();
      const resultFight =
        resultDice < 0.3 ? "win" : resultDice > 0.7 ? "lose" : "equal";

      const combatLog =
        resultFight === "win"
          ? `Combat contre ${partner.name} : Je lui eclaté sa tronche 💪`
          : resultFight === "lose"
          ? `Combat contre ${partner.name} :Il m'a refait le portrait 😿`
          : `Combat contre ${partner.name} : match nul, beaucoup de feulements`;

     

      return {
        statModifier: {
          sante: resultFight === "lose" ? -15 : -5,
          territoriality: resultFight === "win" ? +5 : +2,
          hunger: -4,
          energy: -10,
        },
        relationModifier: {
          defcon: resultFight === "win" ? -1 : 0,
          trust: -10,
        },
        speakLog:combatLog
      };
    },
  },
  {
    id: "vol_de_croquettes",
    text: "Vol de croquettes pris sur le fait ! 🍗",
    probability: 0.3,
    meetingResult: (cat, partner) => {
     
      return {
        statModifier: { territoriality: +4, affection: -3, energy: -2 },
        relationModifier: { defcon: -1, trust: -5 },
         speakLog:`J'ai surpris ${partner.name} en train de me piquer mes croquettes !`
      };
    },
  },
  {
    id: "pipi_territoire",
    text: "Marquage de territoire musclé 💦",
    probability: 0.5,
    meetingResult: (cat, partner) => {
      return {
        statModifier: { territoriality: +6, energy: -3 },
        relationModifier: { defcon: -1, trust: -3 }
      , speakLog:`J’ai marqué mon territoire devant ${partner.name}. Qu’il essaie encore !`
      };
    },
  },
];



export const generateMessage = (mood, personality) => {
    switch (mood) {
      case "affamé":
        if (personality.affectueux > 0.6)
          return "J’ai faim… tu veux bien me donner un peu de thon ? 🥺";
        return "Miaou... j’ai l’estomac vide.";
      case "heureux":
        if (personality.bavard > 0.5)
          return "Quelle belle journée pour être un chat ! 😻";
        return "Ronron…";
      case "malade":
        return "Je me sens patraque… un vétérinaire ?";
      case "triste":
        return "Tu ne veux plus jouer avec moi ?";
      case "fier":
        return "Rien ne peut m’arrêter !";
      default:
        return null;
    }
  };