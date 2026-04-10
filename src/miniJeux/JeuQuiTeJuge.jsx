import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Button, TextField, Paper } from "@mui/material";

  // Jugements aléatoires selon le contexte
const judgmentsIdle = [
  "Tu ne fais rien. Typique.",
  "Le vide t’inspire, ou tu as juste abandonné ?",
  "Je commence à me demander si tu comprends les règles. Il n’y en a pas.",
  "Peut-être espères-tu que je dise quelque chose d’intelligent.",
  "T’es toujours là ? J’ai cru que tu t’étais éteint.",
  "Ce silence est pesant. Presque poétique. Non, juste pesant.",
  "On sent que tu médites... ou que tu as alt-tab pour scroller ailleurs.",
  "Tu crois que le jeu avance tout seul ? Spoiler : non.",
  "Je pourrais faire une sieste entre tes actions.",
  "L’inaction te va bien, on dirait une performance d’art contemporain.",
  "Ce silence… On se croirait dans ton cerveau.",
  "Inactif encore ? Même les pierres ont plus d’initiative.",
  "Tu regardes l’écran comme si une révélation allait tomber. Spoiler : non.",
  "Je suppose que tu médites sur tes choix de vie ?",
  "L’inaction te va bien. On dirait presque une stratégie.",
  "C’est fascinant de te voir ne rien faire avec autant de conviction.",
];

const judgmentsActive = [
  "Va savoir… Peut-être qu’en cliquant il va se passer quelque chose.",
  "Tu cliques sans raison. Impressionnant.",
  "Continue d’user ta souris, je m’en tape.",
  "C’est fou ce que l’ennui peut produire comme énergie.",
  "Tu sembles croire qu’il y a un score ici. Il n’y en a pas.",
  "Ah, l’agitation. Toujours sans direction, bien sûr.",
  "Tu sembles motivé. C’est suspect.",
  "J’admire ton enthousiasme inutile.",
  "Ne t’arrête surtout pas. C’est fascinant de te voir tourner en rond.",
  "Tu bouges beaucoup pour quelqu’un qui n’avance nulle part.",
  "Chaque clic, un cri dans le vide numérique.",
  "Oh regarde, il s’agite. C’est presque attendrissant.",
  "Si tu continues à cliquer au hasard, tu vas finir par percer le mystère du néant.",
  "Tu crois contrôler quelque chose ? C’est mignon.",
  "Je t’observe, et j’ai honte à ta place.",
];
 const judgmentsActiveMove = [
  "Ah, enfin un peu de mouvement.",
  "Va dans le coin, on sait jamais si y a quelque chose.",
  "Ça bouge, ça bouge… Mais ça va nulle part.",
  "Bouge pas ta souris trop vite, ça me donne le mal de mer.",
  "Tu bouges comme un hamster en crise existentielle.",
  "Ce que tu fais là ? C’est du mouvement brownien, pas du gameplay.",
  "À ce rythme, tu vas creuser un tunnel vers le désespoir.",
  "Je suppose que tu cherches un sens à tout ça. Mauvaise piste.",
  "Tu me rappelles un poisson rouge dans un bocal trop petit.",
  "Continue à bouger, ça donne l’illusion d’un progrès.",
];

const judgmentsClicks = [
  "Évidemment, tu trouves un bouton faut que tu cliques.",
  "Mais merde, il est écrit de pas cliquer !",
  "Et il insiste encore ce con.",
  "Si tu cliques exactement 666 fois, un démon apparaîtra (ou pas).",
  "Chaque clic hurle 'aide-moi' dans un univers indifférent.",
  "Tu crois que cliquer plus vite change quelque chose ? Spoiler : non.",
  "Ah, le doux son du désespoir numérique.",
  "C’est comme regarder quelqu’un taper à la porte d’un mur.",
  "Tu cliques, je juge. Équilibre cosmique parfait.",
  "Encore un clic ? T’essaies de t’autodétruire ou de me séduire ?",
];
export default function JeuQuiTeJuge() {
  const [message, setMessage] = useState();
  const [lastAction, setLastAction] = useState(Date.now());
  const [showExtras, setShowExtras] = useState();
  const [playerText, setPlayerText] = useState("");
  const judgmentsTyping = [
    "Tu écris ? Fascinant. Je lirai peut-être.",
    "Je doute que ce que tu tapes ait une quelconque importance.",
    `Quoi ? "${playerText}" vraiment ? Mais ça veut rien dire.`,
    `C'est tout ce que t'as trouvé à dire ? "${playerText}" , ça te ressemble tellement...`,
    `Tu penses que "${playerText}" va changer quelque chose ? C’est mignon.`,
    `"${playerText}" ? On dirait le mot de passe d’un Wi-Fi triste.`,
    `Tu sais, même un chat sur un clavier ferait mieux que "${playerText}".`,
    `Oh, "${playerText}"... quel jaillissement de génie banal.`,
    `Taper "${playerText}"... on sent la détresse derrière chaque lettre.`,
    `C’est donc ça ton cri du cœur ? "${playerText}" ? J’en pleurerais presque.`,
    `"${playerText}"… un grand moment de vide intellectuel.`,
    `Je ne savais pas que la médiocrité pouvait s’écrire, et pourtant : "${playerText}".`,
    `Bravo. Tu viens de prouver qu’un clavier ne rend pas tout le monde intéressant.`,
    `On sent que tu as hésité avant d’écrire "${playerText}". Tu aurais dû continuer d’hésiter.`,
    `"${playerText}" ? Je vais le noter dans mon journal : "Sujet n°42 tente de communiquer, échec total."`,
  ];

  const timerRef = useRef(null);

  const addMessage = (text) => {
    setMessage({ text, time: Date.now() });
  };


  // Boucle de jugement régulière
  useEffect(() => {
    timerRef.current = setInterval(() => {
      const idleTime = Date.now() - lastAction;

      // Après 20 secondes, afficher bouton et champ texte
      if (idleTime > 10000) {
        setShowExtras(ext=>( {type:'button', text:'Ne me clique pas', responses:judgmentsClicks}));
      } 
      if (idleTime > 20000) {
        setShowExtras(ext=>({type:'text'}));
        addMessage("Tiens, un champ texte. Peut-être que tu sauras quoi en faire.");
      }
      if (idleTime > 40000) {
        setShowExtras(ext=>( {type:'button', text:'Lui non plus faut pas cliquer', responses:judgmentsClicks}));
        addMessage("Comme tu es patient, je te donne un autre bouton a cliquer");
      } 

      if (idleTime > 5000) {
        addMessage(judgmentsIdle[Math.floor(Math.random() * judgmentsIdle.length)]);
      }
    }, 5000);

    return () => clearInterval(timerRef.current);
  }, [lastAction, showExtras]);

  // Gérer les clics
  const handleClick = () => {
    setLastAction(Date.now());
    addMessage(judgmentsActive[Math.floor(Math.random() * judgmentsActive.length)]);
  };
  const handleMove = () => {
    if(Math.random()<0.01){
      
    setLastAction(Date.now());
    addMessage(judgmentsActiveMove[Math.floor(Math.random() * judgmentsActiveMove.length)]);
    }
  };

  // Gérer les frappes
  const handleTyping = (e) => {
    setPlayerText(e.target.value);
    setLastAction(Date.now());
    if (Math.random() < 0.6)
      addMessage(judgmentsTyping[Math.floor(Math.random() * judgmentsTyping.length)]);
  };

  return (
    <Paper
      elevation={8}
      sx={{
        width: '100%',
        height: '100%',
        m: "auto",
        mt: 4,
        p: 3,
        borderRadius: 3,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "linear-gradient(145deg, #777, #111)",
        color: "#eee",
      }}
      onMouseMove={handleMove}
      onClick={handleClick}
    >
      <Typography variant="h5" align="center" gutterBottom>
        Le Jeu qui te juge 👁️
      </Typography>

      {showExtras?.type==='button' && <Box  sx={{ mt: 2, flex:1, margin:'auto',alignContent:'center', gap: 1 }}>
          <Button variant="contained" color="warning"
           onClick={(e) => {
            e.stopPropagation();
            setLastAction(Date.now());
            addMessage(showExtras.responses[Math.floor(Math.random() * showExtras.responses.length)])
          }}>
            {showExtras.text}
          </Button>
          
        </Box>
}
         {showExtras?.type==='text' &&<TextField 
            value={playerText}
            onChange={handleTyping}
            variant="outlined"
            placeholder="Exprime-toi..."
            sx={{
              flex: 1,
              input: { color: "white" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#666" },
                "&:hover fieldset": { borderColor: "#999" },
              },
            }}
          />
        }

      
      {message && 
      <Box
        sx={{
          borderRadius: 2,
          p: 2, flex:1,
          overflowY: "auto",
          fontFamily: "monospace",
          fontSize: "0.9rem",
        }}
      >
        <Typography  sx={{ mb: 0.5, opacity: 0.9 }}>
            {message.text}
          </Typography>
        
      </Box>
}
    </Paper>
  );
}
