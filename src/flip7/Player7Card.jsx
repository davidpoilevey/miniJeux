import { Box, Typography } from "@mui/material";

// Composant Carte
const Player7Card = ({ carte = {}, variant = "large", onClick }) => {
  // Définition du contenu de la carte
  const isSpecial = carte.val === "none";
  const displayValue = isSpecial ? carte.type : carte.val;
  const displayLabel = isSpecial ? carte.type.toUpperCase() : 
  (typeof carte.val === "number" ? 
    ["ZERO","ONE","TWO","THREE","FOUR","FIVE","SIX","SEVEN","EIGHT","NINE","TEN","ELEVEN","TWELVE","THIRTEEN"][carte.val] 
    : carte.val);
  // Styles dynamiques
  const cardStyles = {
    width: variant==='small'?40:70,
    height: variant==='small'?60:100,
    borderRadius: 2,
    boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
    background: `linear-gradient(35deg,${carte.color} 0%, #fff 100%)`,
    border: `2px solid ${carte.color || "#aaa"}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    m: 1,
    position: "relative",
    transition: "transform 0.15s",
    "&:hover": {
      transform: "scale(1.06)",
      boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
    },
  };

  // Styles pour les cartes spéciales
  const specialStyles = isSpecial
    ? {
        background: carte.type === "joker"
          ? "linear-gradient(135deg, #ffe259 0%, #ffa751 100%)"
          : carte.type === "stop"
          ? "linear-gradient(135deg, #f87082 0%, #f73827 100%)"
          : carte.type === "3cartes"
          ? "linear-gradient(135deg, #43cea2 0%, #185a9d 100%)"
          : carte.type === "x2"
          ? "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)"
        : ["+2", "+4", "+6", "+8", "+10"].includes(carte.type)
          ? "linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)"
          : "#fff",
        color: "#fff",
        border: "none",
      }
    : {};

  return (
    
    <Box sx={{ ...cardStyles, ...specialStyles }}>
      <Typography
        variant="h4"
        sx={{
          fontSize: isSpecial||variant==='small'?24:44,
          fontWeight: 800,
          color: carte.color||"#b7d0f7",
          textShadow: `
            2px 2px 0 #4a6692,
            0 0 2px #fff
          `,
          lineHeight: 1,
          letterSpacing: 2,
          mb: 1,
          mt: 2,
          fontFamily: 'Oswald, "Arial Black", Arial, sans-serif',
        }}
      >
        {displayValue}
      </Typography>
      {/* Optionnel : icône ou badge pour les cartes spéciales */}
      {isSpecial && carte.type === "joker" && (
        <Box
          sx={{
            position: "absolute",
            top: 6,
            right: 8,
            fontSize: 18,
            opacity: 0.7,
          }}
        >
          🃏
        </Box>
      )}
      {isSpecial && carte.type === "stop" && (
        <Box onClick={onClick}
          sx={{
            position: "absolute",
            top: 6,
            right: 8,
            fontSize: 18,
            opacity: 0.7,
          }}
        >
          ⛔
        </Box>
      )}
      {isSpecial && carte.type === "3cartes" && (
        <Box onClick={onClick}
          sx={{
            position: "absolute",
            top: 6,
            right: 8,
            fontSize: 18,
            opacity: 0.7,
          }}
        >
          3️⃣
        </Box>
      )}
      {isSpecial && carte.type === "x2" && (
  <Box
    sx={{
      position: "absolute",
      top: 6,
      right: 8,
      fontSize: 20,
      opacity: 0.7,
    }}
  >
    ✖️2
  </Box>
)}
{isSpecial && ["+2", "+4", "+6", "+8", "+10"].includes(carte.type) && (
  <Box
    sx={{
      position: "absolute",
      top: 6,
      right: 8,
      fontSize: 20,
      opacity: 0.7,
    }}
  >
    {carte.type}
  </Box>
)}
    </Box>
  );
};

export default Player7Card;
