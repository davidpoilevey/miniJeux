export const goToVet = (retour, {cat})=>{

    // chp.speakLog, chp.sender,  chp.type, timeout
    Object.assign(retour,  {
        statModifier:{ energy: -10, sante: +20, territorialite: -10, affection:-20}
        , relationModifier:{trust:-10, affection:-25}
        , resourcesModifier:{argent:-80}
        , speakStory:[
            {
                speakLog:"Tu prends ton chat et l’installe dans sa caisse de transport."
                , sender:"system", type:"playerAction", timeout:1000
            }, {
                speakLog:"Miaou… je n’aime pas cette odeur…"
                , sender:"cat", type:"thought", timeout:2000
            }, {
                speakLog:"Le vétérinaire ausculte ton chat et lui administre un petit vaccin 💉"
                , sender:"system", type:"dialogue", timeout:1000
            }, {
                speakLog:"Aïe ! Mais ça va mieux maintenant… merci humain ❤️"
                , sender:"cat", type:"dialogue", timeout:2000
            },{
                speakLog:"Ton chat rentre à la maison, fatigué mais en meilleure santé."
                , sender:"system", type:"event", timeout:3000
            }
        ]
    })
}
export const changerLitiere = (retour, { cat }) => {
  Object.assign(retour,  {
    statModifier: { energy: -5, sante: +10, affection: +5 },
    relationModifier: { trust: +5 },
    resourcesModifier: { argent: -5 },
    speakStory: [
      {
        speakLog: "Tu t’armes de courage et de gants… il est temps de changer la litière !",
        sender: "system",
        type: "playerAction",
        timeout: 1000,
      },
      {
        speakLog: "Miaou ? Ça sent meilleur tout à coup…",
        sender: "cat",
        type: "dialogue",
        timeout: 1500,
      },
      {
        speakLog: "Ton chat se précipite pour marquer son nouveau territoire. Il a l’air satisfait.",
        sender: "system",
        type: "thought",
        timeout: 2000,
      },
    ],
  });
};
export const donnerFriandise = (retour, { cat }) => {
  Object.assign(retour,  {
    statModifier: { hunger: +15, affection: +10, energy: +5 },
    relationModifier: { trust: +10 },
    resourcesModifier: { croquettes: -1 },
    speakStory: [
      {
        speakLog: "Tu tends une friandise à ton chat, qui l’observe avec suspicion.",
        sender: "system",
        type: "playerAction",
        timeout: 800,
      },
      {
        speakLog: "Snif… snif… *croque* … miaou ! 😻",
        sender: "cat",
        type: "dialogue",
        timeout: 1500,
      },
      {
        speakLog: "Ton chat te regarde avec reconnaissance, la friandise a visiblement fait mouche.",
        sender: "system",
        type: "thought",
        timeout: 2000,
      },
    ],
  });
};
export const laisserSortir = (retour, { cat }) => {
  Object.assign(retour,  {
    statModifier: { hunger: -15, affection: +5, energy: -15, territorialite:20, sante:3 },
    relationModifier: { trust: +20 },
    speakStory: [
      {
        speakLog: "Tu ouvres la fenetre. Le chat sort",
        sender: "system",
        type: "playerAction",
        timeout: 800,
      },
      {
        speakLog: "Quel temps de merde, un pipi et on rentre",
        sender: "cat",
        type: "dialogue",
        timeout: 1500,
      },
      {
        speakLog: "Ton chat miaule a la fenetre au bout de 2 minutes. Quel boulet",
        sender: "system",
        type: "thought",
        timeout: 2000,
      },
    ],
  });
};
export const apprendreTour = (retour, { cat }) => {
  const success = Math.random() < 0.6 + cat.personality.curieux * 0.4; // curieux aide un peu
  Object.assign(retour, {
    statModifier: {
      energy: -15,
      affection: success ? +8 : -5,
      sante: -3,
    },
    relationModifier: { trust: success ? +10 : -5 },
    resourcesModifier: { croquettes: success ? -2 : -1 },
    speakStory: success
      ? [
          {
            speakLog: "Tu tentes d’apprendre un tour à ton chat… avec patience et croquettes.",
            sender: "system",
            type: "playerAction",
            timeout: 1000,
          },
          {
            speakLog: "Regarde ça ! J’ai sauté à travers le cerceau ! 😸",
            sender: "cat",
            type: "dialogue",
            timeout: 2000,
          },
          {
            speakLog: "Fier de son exploit, ton chat parade comme un champion.",
            sender: "system",
            type: "event",
            timeout: 2500,
          },
        ]
      : [
          {
            speakLog: "Tu essaies d’apprendre un tour à ton chat… mais il préfère dormir.",
            sender: "system",
            type: "playerAction",
            timeout: 1000,
          },
          {
            speakLog: "Miaou ? Non. Je ne fais pas ça sans une prime en croquettes.",
            sender: "cat",
            type: "dialogue",
            timeout: 2000,
          },
          {
            speakLog: "Tu abandonnes pour cette fois. Ton chat garde sa dignité.",
            sender: "system",
            type: "event",
            timeout: 2500,
          },
        ],
  });
};
