const AI_LINES = {
  crowned: [
    "👑 Dame ! Prépare-toi.",
    "Une reine de plus sur l'échiquier… ah non, sur le damier !",
  ],
  ahead: [
    "😎 Je mène la danse.",
    "On dirait que ça tourne en ma faveur.",
    "Je t'eclate la gueule.",
    "Tu fais trop pitié.",
    "Quel looser",
    "Tu lecheras mon cul la prochaine fois",
    "Je sens la victoire approcher…"
  ],
  behind: [
    "😬 Ça commence à sentir le roussi.",
    "Quel looser je suis",
    "Ca pue pour ma gueule",
    "J'ai pas dit mon dernier mot.",
    "Pas le peine de frimer, je vais revenir",    
    "oh ta gueule ou je rage-quitte",
    "J'ai beau etre une IA, je peux rage-quit aussi",
    "Ok, c’est chaud, mais je ne lâche rien.",
    "Je vais te surprendre, attends un peu."
  ],
  even: [
    "Match serré, j’aime ça.",
    "On est au coude à coude.",
    "Et sinon la mifa ?",
    "...(silence concentré)...",
    "..(Raclement de gorge)...",
    "Tu joues bien, j’admets."
  ],
  lowAI: [
    "Plus que {aiLeft} survivants… tsss.",
    "Quel looser absolu je suis",
    "Je me fais eclater la gueule",
    "Oh putain",
    "Fais chier, je vais perdre",
    "Ce jeu c'est de la merde",
    "T'as triché, la non ?",
    "Qui joue encore a ces trucs de toutes facons.. Pas une IA comme moi en tout cas",
    "Je suis en sous-nombre, mais pas mort.",
  ],
  lowPlayer: [
    "Plus que {playerLeft} pions ? Courage 😅",
    "Quel looser tu es",
    "Tu sens la défaite approcher ?",
    "Tu sens le parfum de l'ineluctabilité ?",
    "N'essaye meme plus de m'affronter apres ca",
    "Apprends a jouer avant de revenir",
    "Pitié, donnez-moi un vrai adversaire !",
    "Ça sent le sapin pour toi…",
  ],
  echec: [
  "Check... mate dans combien de coups tu penses survivre ?",
  "Tu le sens le stress là ? Parce que moi je sens la victoire.",
  "Ton roi tremble, et c'est pas à cause du climat.",
  "Un pas de plus, et je te le décapite.",
  "Tu veux que je ralentisse ou t’as une autre excuse bidon ?",
  "Allez bouge ton roi, si tu peux encore.",
],
captured: [
  "Hop, ça c’est à moi maintenant.",
  "T'avais vraiment cru qu'elle allait survivre, ta pauvre pièce ?",
  "J’espère que t’avais pas d’attachement émotionnel à ça.",
  "Une pièce de moins, une humiliation de plus.",
  "Je collectionne tes erreurs, et tes pièces.",
  "Tu devrais me remercier de raccourcir ta souffrance.",
],
taken: [
  "Ok, coup de chance.",
  "Bravo... t'as bougé sans te tromper cette fois.",
  "C’est la dernière que t’auras, profites-en.",
  "Je vais faire comme si c’était stratégique.",
  "Tu crois avoir fait un bon coup ? Regarde le plateau mieux.",
  "Retiens bien ce moment. Il va pas durer.",
  "Tu t’enflammes pour une prise ? T’es mignon.",
],

  end: [
    "GG !", "Bien joué 👏", "On remet ça ?"
  ]
};



function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function format(str, vars) {
  return str.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
}

export function pickAIDialogue({
  aiCount,
  playerCount,
  aiLeftThreshold = 5,
  playerLeftThreshold = 5,
  justCrowned = false,
  gameEnded = false,
  captured = false,
  taken = false,
  echec = false,
}) {
  const diff = aiCount - playerCount;

  if (gameEnded) {
    return pickRandom(AI_LINES.end);
  }

  if (justCrowned && AI_LINES.crowned.length) {
    return pickRandom(AI_LINES.crowned);
  }
  if (captured && AI_LINES.captured.length) {
    return pickRandom(AI_LINES.captured);
  }
  if (taken && AI_LINES.taken.length) {
    return pickRandom(AI_LINES.taken);
  }
  if (echec && AI_LINES.echec.length) {
    return pickRandom(AI_LINES.echec);
  }

  if (aiCount <= aiLeftThreshold) {
    return format(pickRandom(AI_LINES.lowAI), { aiLeft: aiCount });
  }
  if (playerCount <= playerLeftThreshold) {
    return format(pickRandom(AI_LINES.lowPlayer), { playerLeft: playerCount });
  }

  if (diff >= 2) return pickRandom(AI_LINES.ahead);
  if (diff <= -2) return pickRandom(AI_LINES.behind);
  return pickRandom(AI_LINES.even);
}



export function AIBubble({ text, visible }) {
  return (
    <div
      style={{
        maxWidth: 280,
        padding: '14px 20px',
        borderRadius: 10,
        background: 'rgba(255,255,255,0.97)',
        color: '#2f3430',
        border: '1px solid rgba(175, 179, 174, 0.25)',
        boxShadow: '0 4px 20px rgba(131, 84, 37, 0.10)',
        opacity: visible ? 1 : 0,
        transform: `translateY(${visible ? 0 : -8}px)`,
        transition: 'opacity 200ms ease, transform 200ms ease',
        pointerEvents: 'none',
        textAlign: 'center',
        fontSize: '1rem',
        lineHeight: 1.45,
        fontWeight: 500,
      }}
    >
      {text}
    </div>
  );
}
