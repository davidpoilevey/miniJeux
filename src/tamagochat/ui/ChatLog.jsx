// ui/ChatLog.js
import React, { useEffect, useMemo, useRef } from "react";
import { Box, Typography, Avatar, Paper } from "@mui/material";
import { useCat } from "../backend/CatContext";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PetsIcon from "@mui/icons-material/Pets";
import { OnBoardingStep } from "../../OnBoardingContext";

const iconMap = {
  dialogue: <ChatBubbleOutlineIcon fontSize="small" />,
  event: <EmojiEventsIcon fontSize="small" />,
  thought: <PetsIcon fontSize="small" />,
  playerAction: <FavoriteIcon fontSize="small" />,
};

const senderColors = {
  cat: "#fce4ec",
  player: "#e3f2fd",
  system: "#ede7f6",
  otherCat: "#fff3e0",
};

// Rendu d'un seul message
function ChatMessage({ msg }) {
  const { sender, text, type } = msg;
  const align = sender === "cat" ? "flex-start" : "flex-end";
  const bg = senderColors[sender] || "#eee";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: align,
        my: 0.5,
        px: 1,
        animation: "fadeIn 0.4s ease",
      }}
    >
      <Paper
        elevation={2}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          backgroundColor: bg,
          borderRadius: 2,
          p: 1,
          maxWidth: "80%",
          whiteSpace: "pre-line",
        }}
      >
        <Avatar
          sx={{
            width: 24,
            height: 24,
            bgcolor: "transparent",
          }}
        >
          {iconMap[type] || <ChatBubbleOutlineIcon fontSize="small" />}
        </Avatar>
        <Typography
          variant="body2"
          sx={{ color: "#333", lineHeight: 1.4, fontStyle: type === "thought" ? "italic" : "normal" }}
        >
          {text}
        </Typography>
      </Paper>
    </Box>
  );
}

// Conteneur du log
export function ChatLog() {
  const { cat } = useCat();
  const endRef = useRef();

  // scroll automatique
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [cat.messages]);
const tenLast = useMemo(() => {
  if (!cat?.messages) return [];
  return [...cat.messages]        // on clone pour ne pas muter l’état
    .slice(-6)                   // on garde les 10 derniers
    .reverse();                   // on inverse l’ordre (dernier en premier)
}, [cat.messages]);

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: "rgba(255,255,255,0.8)",
        borderRadius: 3,
        p: 1,
        height: 400,
        overflowY: "auto",
        border: "1px solid rgba(0,0,0,0.1)",
      }}
    >
       <OnBoardingStep stepId="chatlog" message="Surveille bien le chat ! (jeu de mot)">
       <Typography
        variant="subtitle2"
        sx={{
          textAlign: "center",
          mb: 1,
          color: "#555",
          fontWeight: 500,
          letterSpacing: 0.5,
        }}
      >
        Journal du Chat 🐾
      </Typography>
  </OnBoardingStep>
      {cat.messages?.length === 0 ? (
        <Typography variant="body2" sx={{ color: "#777", textAlign: "center", mt: 2 }}>
          Le chat n’a encore rien dit... observez-le un instant.
        </Typography>
      ) : (
        tenLast?.map((m, i) => <ChatMessage key={i} msg={m} />)
      )}

      <div ref={endRef} />
    </Box>
  );
}
