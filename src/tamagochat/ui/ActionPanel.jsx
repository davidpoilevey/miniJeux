import { Box, Button, Typography, Stack, Paper } from "@mui/material";
import { useCat } from "../backend/CatContext";
import { OnBoardingStep } from "../../OnBoardingContext";

export const ActionPanel = () => {
  const { affectStat, applyAction , cat} = useCat();

  const act = (changes) => affectStat(changes);

  const actions = [
    {
      id: "feed",
      emoji: "🍖",
      label: "Nourrir",
      condition:cat.hunger<70,
      desc: "Restaure la faim mais fatigue un peu ton chat.",
      color: "warning",
      onClick: () => act({ hunger: +30, energy: -1 }),
    },
    {
      id: "pet",
      emoji: "🐾",
      condition:cat.affection<50,
      label: "Caresser",
      desc: "Augmente l’affection de ton chat.",
      color: "secondary",
      onClick: () => act({ affection: +30 }),
    },
    {
      id: "play",
      emoji: "🎾",
      condition:cat.affection<70,
      label: "Jouer",
      desc: "Renforce le lien affectif, mais consomme de l’énergie.",
      color: "primary",
      onClick: () => act({ affection: +15, energy: -5 }),
    },
    {
      id: "sleep",
      emoji: "💤",
      condition:cat.energy<50,
      label: "Dormir",
      desc: "Récupère l’énergie, mais ton chat devient un peu distant.",
      color: "info",
      onClick: () => act({ energy: +40, affection: -2, sante:+10 }),
    },
    {
      id: "vet",
      emoji: "🏥",
      condition:cat.sante<40,
      label: "Aller chez le vétérinaire",
      desc: "Améliore la santé du chat, mais coûte cher et le stresse.",
      color: "success",
      onClick: () => applyAction("goToVet"),
    },
    {
      id: "litter",
      condition:cat.sante<60&&cat.hunger>60,
      emoji: "🧻",
      label: "Changer la litière",
      desc: "Améliore l’hygiène et la santé de ton chat.",
      color: "success",
      onClick: () => applyAction("changerLitiere"),
    },
    {
  id: "cleanVomit",
  emoji: "🧽",
  condition: cat.currentFlags?.vomir,
  label: "Nettoyer le vomi",
  desc: "Rend la propreté au foyer. Le chat t’observe avec un air coupable.",
  color: "warning",
  onClick: () => {
   applyAction('nettoyerVomi')
  },
}
,
    {
      id: "treat",
      emoji: "🍬",
      condition:cat.affection<70&&cat.hunger<70,
      label: "Donner une friandise",
      desc: "Petite récompense gourmande et affectueuse.",
      color: "secondary",
      onClick: () => applyAction("donnerFriandise"),
    },
    {
      id: "trick",
      emoji: "🎩",
      condition:cat.energy>40&&cat.affection>60,
      label: "Apprendre un tour",
      desc: "Teste la curiosité et l’intelligence de ton chat.",
      color: "primary",
      onClick: () => applyAction("apprendreTour"),
    },
    {
      id: "sortir",
      emoji: "🎩",
      condition:cat.territorialite<60,
      label: "Laisser sortir",
      desc: "Ouvrir la fenetre pour le laisser prendre l'air",
      color: "info",
      onClick: () => applyAction("laisserSortir"),
    },
  ];

  return (
    <Box
      sx={{
        flex: 1, overflow:'auto',
        p: 1,
        borderRadius: 3,
        background: "rgba(250, 192, 46, 0.1)",
        backdropFilter: "blur(8px)",
      }}
    >
       <OnBoardingStep stepId="feed" message="C'est ici que tu peux interagir avec ton chat">
        <Typography variant="h6" sx={{ mb: 2 }}>
        Actions 🐈
      </Typography>
</OnBoardingStep>
      <Stack
        spacing={2}
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
          gap: 2,
        }}
      >
        {actions.map((a) => (a.condition&&
          <Box
            key={a.id}
            sx={{
              p: 1,flexDirection:'column',display:'flex', maxWidth:100,
              borderRadius: 2,
              backgroundColor: "rgba(255,255,255,0.15)",
              textAlign: "center",
              transition: "all 0.2s ease",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.3)" },
            }}
          >
            <Button
              
              variant="contained"
              color={a.color}
              onClick={a.onClick}
              sx={{
                borderRadius: 3,
                boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
              }}
            >
              {a.emoji} {a.label}
            </Button>
            <Typography variant="caption" sx={{ color: "#81090fff" }}>
              {a.desc}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};
